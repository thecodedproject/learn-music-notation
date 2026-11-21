import { useEffect, useState } from "react"
import { ReadNotesExercise as Ex, gradeNames } from "../../lib/lesson_gen"
import { phrase, player } from "../../lib/player"
import { TEMPO_BPM } from "../../lib/settings"
import { NoteKeypad } from "../note_keypad"
import { Score } from "../score"
import { ExerciseProps } from "./types"

// ReadNotesExercise shows notes on the stave for the learner to name, in order
export function ReadNotesExercise({ exercise, settings, locked, onAnswer }: ExerciseProps<Ex>): JSX.Element {
  const { notes, clef, keySignature, accidentals } = exercise
  const [named, setNamed] = useState<string[]>([])
  const [marks, setMarks] = useState<boolean[]>()

  const check = (answer = named) => {
    if (locked) return
    const m = gradeNames(answer, notes)
    setMarks(m)
    onAnswer(m.every(x => x))
    // hearing the notes once named ties the sound to the sight
    player.playSequence(phrase(notes), { bpm: TEMPO_BPM[settings.tempo] })
  }

  // a single note with nothing to add to it is marked as soon as it's named
  const quick = notes.length == 1 && !accidentals
  useEffect(() => {
    if (quick && named.filter(n => n != "").length == 1 && !locked) {
      check(named)
    }
  }, [named])

  const ready = named.filter(n => n != "").length == notes.length
  return (
    <div className="exercise">
      <h2 className="exercisePrompt">{notes.length == 1 ? "Name this note" : `Name these ${notes.length} notes`}</h2>
      <div className="stage">
        <Score clef={clef} keySignature={keySignature} notes={notes} size="large"
          classes={marks && Object.fromEntries(marks.map((m, i) => [i, m ? "correct" : "wrong"]))} />
      </div>
      <div className="exerciseAnswer">
        <NoteKeypad count={notes.length} value={named} onChange={setNamed} accidentals={accidentals}
          naming={settings.naming} locked={locked} marks={marks} />
      </div>
      {!quick && (
        <div className="exerciseFooter">
          <button type="button" className="primary" disabled={!ready || locked} onClick={() => check()}>Check</button>
        </div>
      )}
    </div>
  )
}
