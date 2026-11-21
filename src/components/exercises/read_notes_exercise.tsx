import { Pitch, midiNumber, pitchAtPosition, stavePosition } from "music-lib/theory"
import { useEffect, useState } from "react"
import { ReadNotesExercise as Ex, gradeNames } from "../../lib/lesson_gen"
import { fromNoteKey } from "../../lib/music"
import { player } from "../../lib/player"
import { NoteKeypad } from "../note_keypad"
import { Score } from "../score"
import { ExerciseProps } from "./types"

// ReadNotesExercise shows notes on the stave for the learner to name, in order
export function ReadNotesExercise({ exercise, settings, locked, revealed, onAnswer }: ExerciseProps<Ex>): JSX.Element {
  const { notes, clef, keySignature, accidentals } = exercise
  const [named, setNamed] = useState<string[]>([])
  const [marks, setMarks] = useState<boolean[]>()

  const check = (answer = named) => {
    if (locked) return
    const m = gradeNames(answer, notes)
    setMarks(m)
    onAnswer(m.every(x => x))
  }

  // each note sounds as it's named, which ties the sound to the sight without giving the
  // answer away, as nothing is heard until a name is chosen
  const name = (next: string[]) => {
    const i = next.findIndex((key, j) => key != "" && key != named[j])
    if (i != -1 && i < notes.length && settings.playWhilePlacing) {
      player.playNote(midiNumber(heard(next[i], notes[i])), 0.7)
    }
    setNamed(next)
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
          classes={revealed && marks ? Object.fromEntries(marks.map((m, i) => [i, m ? "correct" : "wrong"])) : undefined} />
      </div>
      <div className="exerciseAnswer">
        <NoteKeypad count={notes.length} value={named} onChange={name} accidentals={accidentals}
          naming={settings.naming} locked={locked} marks={revealed ? marks : undefined} />
      </div>
      {!quick && (
        <div className="exerciseFooter">
          <button type="button" className="primary" disabled={!ready || locked} onClick={() => check()}>Check</button>
        </div>
      )}
    </div>
  )
}

// heard is the note named, as it sounds: the one with that letter (and sharp or flat)
// nearest the note shown. Letters step the same on any clef, so the treble's positions do.
function heard(key: string, shown: Pitch): Pitch {
  const named = fromNoteKey(key)
  // the letters from the one shown to the one named, the shorter way round
  const steps = ((named.letter - shown.letter + 10) % 7) - 3
  const pos = stavePosition(shown, "treble") + steps
  return { ...pitchAtPosition(pos, "treble"), accidental: named.accidental }
}
