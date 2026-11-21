import { Clef, NamingSystem, Pitch, midiNumber, noteLabel } from "music-lib/theory"
import { useEffect, useMemo, useRef, useState } from "react"
import { LessonRef } from "../course"
import { Exercise, generateLesson, lessonMix } from "../lib/lesson_gen"
import { parsePitches } from "../lib/music"
import { player, stopPlaying, whenQuiet } from "../lib/player"
import { Settings } from "../lib/settings"
import { solution } from "../lib/solution"
import { ChoiceExercise } from "./exercises/choice_exercise"
import { ReadNotesExercise } from "./exercises/read_notes_exercise"
import { ExerciseProps } from "./exercises/types"
import { WriteExercise } from "./exercises/write_exercise"
import { LessonResult } from "./lesson_result"
import { Score } from "./score"
import "./lesson_player.css"

interface Props {
  lessonRef: LessonRef
  settings: Settings
  onFinish: (score: number) => void
  onQuit: () => void
  onNext?: () => void
}

type Phase = "intro" | "exercises" | "result"

const ADVANCE_DELAY = 1100 // ms a right answer is shown before moving on
const SLIDE_OUT = 300 // ms; matches .exerciseSlide.leaving in the CSS
const AFTER_SOUND = 350 // ms to wait after the notes played back have finished

// LessonPlayer runs a lesson: the new notes to start with, then the exercises one at a
// time, then the score.
export function LessonPlayer({ lessonRef, settings, onFinish, onQuit, onNext }: Props): JSX.Element {
  const { lesson } = lessonRef
  const [seed, setSeed] = useState(() => Date.now())
  const [phase, setPhase] = useState<Phase>("intro")
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [feedback, setFeedback] = useState<boolean>()
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  // bumped whenever the lesson moves on, so a wait for a sound to finish can tell it's stale
  const step = useRef(0)

  const exercises = useMemo(
    () => generateLesson(lesson, settings.exerciseCount, seed),
    [lesson, seed],
  )

  useEffect(() => () => {
    step.current++
    timers.current.forEach(clearTimeout)
    stopPlaying()
  }, [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }

  const start = () => {
    player.ensure()
    setIndex(0)
    setResults([])
    setFeedback(undefined)
    setPhase("exercises")
  }

  const answer = (correct: boolean) => {
    if (feedback != undefined) {
      return
    }
    player.chime(correct)
    setFeedback(correct)
    setResults(r => [...r, correct])
    if (correct) {
      // move on once the right answer has been seen and any notes played back have finished
      const at = step.current
      const shown = new Promise<void>(resolve => later(resolve, ADVANCE_DELAY))
      const heard = whenQuiet().then(() => new Promise<void>(resolve => later(resolve, AFTER_SOUND)))
      Promise.all([shown, heard]).then(() => {
        if (step.current == at) advance()
      })
    }
  }

  const advance = () => {
    step.current++
    stopPlaying()
    setLeaving(true)
    later(() => {
      setLeaving(false)
      setFeedback(undefined)
      setIndex(index + 1)
      if (index + 1 >= exercises.length) {
        setPhase("result")
      }
    }, SLIDE_OUT)
  }

  // the score goes in once, as the result appears
  const score = results.length == 0 ? 0 : results.filter(r => r).length / exercises.length
  useEffect(() => {
    if (phase == "result") {
      onFinish(score)
    }
  }, [phase])

  const retry = () => {
    step.current++
    timers.current.forEach(clearTimeout)
    setSeed(s => s + 1)
    start()
  }

  if (phase == "intro") {
    return <LessonIntro lessonRef={lessonRef} naming={settings.naming} onStart={start} onQuit={onQuit} />
  }
  if (phase == "result") {
    return (
      <LessonResult
        score={score}
        isTest={lessonRef.isTest}
        title={lesson.title}
        onRetry={retry}
        onNext={onNext}
        onBack={onQuit}
      />
    )
  }

  const exercise = exercises[index]
  const done = index + (feedback != undefined ? 1 : 0)

  return (
    <div className="lessonPlayer">
      <header className="lessonTop">
        <button type="button" className="iconButton" onClick={onQuit} aria-label="Leave the lesson">
          <CloseIcon />
        </button>
        <div className="progressBar" role="progressbar" aria-valuemin={0} aria-valuemax={exercises.length} aria-valuenow={done}>
          <div className="progressFill" style={{ width: `${(done / exercises.length) * 100}%` }} />
        </div>
      </header>

      <div className="exerciseViewport">
        {exercise && (
          <div key={`${seed}-${index}`} className={`exerciseSlide${leaving ? " leaving" : ""}`}>
            <ExerciseView
              exercise={exercise}
              settings={settings}
              locked={feedback != undefined}
              onAnswer={answer}
            />
          </div>
        )}
      </div>

      {feedback != undefined && exercise && (
        <FeedbackBar correct={feedback} exercise={exercise} naming={settings.naming} onContinue={advance} />
      )}
    </div>
  )
}

function ExerciseView(props: ExerciseProps): JSX.Element {
  const ex = props.exercise
  switch (ex.kind) {
    case "readNotes":
      return <ReadNotesExercise {...props} exercise={ex} />
    case "writeNotes":
    case "writeInterval":
    case "earDictation":
      return <WriteExercise {...props} exercise={ex} />
    case "readInterval":
    case "readKey":
    case "earScale":
      return <ChoiceExercise {...props} exercise={ex} />
  }
}

function FeedbackBar({ correct, exercise, naming, onContinue }: {
  correct: boolean, exercise: Exercise, naming: NamingSystem, onContinue: () => void,
}): JSX.Element {
  const continueRef = useRef<HTMLButtonElement>(null)
  useEffect(() => continueRef.current?.focus(), [])
  const sol = solution(exercise, naming)
  return (
    <div className={`feedbackBar ${correct ? "correct" : "wrong"}`} role="status">
      <div className="feedbackInner">
        <div className="feedbackText">
          <strong>{correct ? pick(PRAISE) : "Not quite"}</strong>
          {!correct && (
            <div className="feedbackAnswer">
              <span>{sol.text}</span>
              {sol.stave && (
                <Score
                  clef={sol.stave.clef}
                  keySignature={sol.stave.keySignature}
                  notes={sol.stave.notes}
                  classes={Object.fromEntries(sol.stave.notes.map((_, i) => [i, i < sol.stave!.given ? "given" : "correct"]))}
                  size="small"
                />
              )}
            </div>
          )}
        </div>
        {!correct && (
          <button ref={continueRef} type="button" className="primary" onClick={onContinue}>Continue</button>
        )}
      </div>
    </div>
  )
}

const PRAISE = ["Nice!", "Correct!", "Great!", "Spot on!", "Well done!", "Yes!"]

function pick(list: string[]): string {
  return list[Math.floor(Date.now() / 1000) % list.length]
}

// the new notes a lesson teaches, to meet one by one before it starts - unless the lesson
// is about something else (intervals or keys), when they're just the notes it uses
function introNotes(lessonRef: LessonRef): { clef: Clef, pitch: Pitch }[] {
  const { lesson, isTest } = lessonRef
  const mix = lessonMix(lesson)
  if (isTest || (mix.readNotes == undefined && mix.writeNotes == undefined)) {
    return []
  }
  const notes = (Object.keys(lesson.notes) as Clef[])
    .flatMap(clef => parsePitches(lesson.notes[clef]).map(pitch => ({ clef, pitch })))
  return notes.length <= 9 ? notes : []
}

function LessonIntro({ lessonRef, naming, onStart, onQuit }: {
  lessonRef: LessonRef, naming: NamingSystem, onStart: () => void, onQuit: () => void,
}): JSX.Element {
  const { lesson, isTest, chapter, lessonIndex } = lessonRef
  useEffect(() => () => stopPlaying(), [])
  const items = introNotes(lessonRef)

  return (
    <div className="lessonIntro">
      <header className="lessonTop">
        <button type="button" className="iconButton" onClick={onQuit} aria-label="Back to the chapter">
          <CloseIcon />
        </button>
      </header>
      <div className="lessonIntroBody">
        <p className="eyebrow">{chapter.title} · {isTest ? "Test" : `Lesson ${lessonIndex + 1}`}</p>
        <h1>{lesson.title}</h1>
        {lesson.intro && <p className="lessonIntroText">{lesson.intro}</p>}

        {items.length > 0 && (
          <ul className="introItems">
            {items.map(({ clef, pitch }, i) => (
              <li key={i}>
                <button type="button" className="introItem" onClick={() => player.playNote(midiNumber(pitch), 1)}>
                  <Score clef={clef} keySignature={0} notes={[pitch]} size="small" />
                  <span className="introItemText">{noteLabel(pitch, naming)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && <p className="hintText">Tap each one to hear it.</p>}
      </div>
      <div className="lessonIntroFooter">
        <button type="button" className="primary big" onClick={onStart}>
          {isTest ? "Start the test" : "Start"}
        </button>
      </div>
    </div>
  )
}

export function CloseIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
