import { NamingSystem, Pitch, intervalNumberName, midiNumber, noteLabel } from "music-lib/theory"
import { useState } from "react"
import { EarDictationExercise, WriteIntervalExercise, WriteNotesExercise, gradeWritten } from "../../lib/lesson_gen"
import { player } from "../../lib/player"
import { StaveInput } from "../stave_input"
import { PlayButtons } from "./play_buttons"
import { ExerciseProps } from "./types"

type Ex = WriteNotesExercise | WriteIntervalExercise | EarDictationExercise

// WriteExercise asks for notes to be written on the stave: notes named, the note an
// interval from one given, or notes heard after one given
export function WriteExercise({ exercise, settings, locked, revealed, onAnswer }: ExerciseProps<Ex>): JSX.Element {
  const { given, targets, strict } = describe(exercise)
  const [written, setWritten] = useState<(Pitch | undefined)[]>(() => targets.map(() => undefined))
  const [marks, setMarks] = useState<boolean[]>()

  const check = () => {
    if (locked) return
    const m = gradeWritten(written, targets, strict)
    setMarks(m)
    // play what was written before finding out, so it can be heard against what was meant
    onAnswer(m.every(x => x), exercise.kind == "writeNotes"
      ? undefined
      : [...given, ...written.filter((p): p is Pitch => p != undefined)])
  }

  // notes sound as they're placed only when naming them: an interval or a phrase heard
  // could otherwise be found by ear, note by note
  const sound = (p: Pitch) => {
    if (settings.playWhilePlacing && exercise.kind == "writeNotes") {
      player.playNote(midiNumber(p), 0.5)
    }
  }

  const ready = written.every(p => p != undefined)
  return (
    <div className="exercise">
      <h2 className="exercisePrompt">{prompt(exercise, settings.naming)}</h2>
      {exercise.kind == "earDictation" && (
        <div className="stage compact">
          <PlayButtons pitches={[exercise.given, ...exercise.targets]} tempo={settings.tempo} />
        </div>
      )}
      <div className="exerciseAnswer">
        <StaveInput
          clef={exercise.clef}
          keySignature={exercise.keySignature}
          given={given}
          value={written}
          onChange={setWritten}
          extent={exercise.extent}
          accidentals={exercise.kind == "writeInterval" ? false : exercise.accidentals}
          locked={locked}
          marks={revealed ? marks : undefined}
          naming={settings.naming}
          // the note's name as it's dragged would give a note-naming exercise away
          showName={exercise.kind != "writeNotes"}
          onSound={sound}
        />
        {!locked && <p className="hintText">Drag up or down on the stave to choose each note.</p>}
      </div>
      <div className="exerciseFooter">
        <button type="button" className="primary" disabled={!ready || locked} onClick={check}>Check</button>
      </div>
    </div>
  )
}

// what each kind of writing exercise shows first, and asks for
function describe(ex: Ex): { given: Pitch[], targets: Pitch[], strict: boolean } {
  switch (ex.kind) {
    case "writeNotes": return { given: [], targets: ex.targets, strict: false }
    case "writeInterval": return { given: [ex.given], targets: [ex.target], strict: true }
    case "earDictation": return { given: [ex.given], targets: ex.targets, strict: true }
  }
}

function prompt(ex: Ex, naming: NamingSystem): string {
  switch (ex.kind) {
    case "writeNotes": {
      const names = ex.targets.map(p => noteLabel(p, naming)).join(" ")
      return ex.targets.length == 1 ? `Write ${names}` : `Write ${names}, in order`
    }
    case "writeInterval":
      return `Write the note a ${intervalNumberName(ex.interval)} ${ex.direction == "up" ? "above" : "below"} this one`
    case "earDictation":
      return ex.targets.length == 1
        ? "Listen, then write the note that comes after this one"
        : `Listen, then write the ${ex.targets.length} notes that come after this one`
  }
}
