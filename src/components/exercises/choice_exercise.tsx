import { useState } from "react"
import { ChoiceExercise as Ex } from "../../lib/lesson_gen"
import { ChoiceTiles } from "../choice_tiles"
import { Score } from "../score"
import { PlayButtons } from "./play_buttons"
import { ExerciseProps } from "./types"

const PROMPTS: Record<Ex["kind"], string> = {
  readInterval: "What's the interval between these notes?",
  readKey: "Which major key has this key signature?",
  earScale: "A scale is played up from this note. Which key is it in?",
}

// ChoiceExercise is answered by picking one of a few named choices: an interval, a key
export function ChoiceExercise({ exercise, settings, locked, onAnswer }: ExerciseProps<Ex>): JSX.Element {
  const [picked, setPicked] = useState<string>()

  const pick = (choice: string) => {
    if (locked) return
    setPicked(choice)
    onAnswer(choice == exercise.answer)
  }

  return (
    <div className="exercise">
      <h2 className="exercisePrompt">{PROMPTS[exercise.kind]}</h2>
      <div className="stage">
        <Score clef={exercise.clef} keySignature={exercise.keySignature} notes={exercise.notes}
          size="large" minBeats={exercise.notes.length == 0 ? 1 : undefined} />
        {exercise.played != undefined && (
          <PlayButtons pitches={exercise.played} tempo={settings.tempo} />
        )}
      </div>
      <div className="exerciseAnswer">
        <ChoiceTiles choices={exercise.choices} onPick={pick} locked={locked} picked={picked} answer={exercise.answer} />
      </div>
    </div>
  )
}
