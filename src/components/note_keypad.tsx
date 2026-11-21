import { NamingSystem, letterLabel, noteLabel } from "music-lib/theory"
import { fromNoteKey, noteKey } from "../lib/music"
import "./note_keypad.css"

interface Props {
  count: number // how many notes to name
  value: string[] // the notes named so far, by noteKey
  onChange: (value: string[]) => void
  accidentals: boolean // offer sharps and flats
  naming: NamingSystem
  locked: boolean
  marks?: boolean[] // once answered, whether each was right
}

// the letters in keyboard order, so the keys run as a piano's white keys do
const LETTERS = [0, 1, 2, 3, 4, 5, 6]

// NoteKeypad names notes: a box for each note to name, filled in order by tapping the
// letter keys. A sharp or flat key changes the note last named; tapping a box clears it.
export function NoteKeypad({ count, value, onChange, accidentals, naming, locked, marks }: Props): JSX.Element {
  const filled = value.filter(v => v != "").length
  const lastFilled = (() => {
    for (let i = value.length - 1; i >= 0; i--) if (value[i] != "") return i
    return -1
  })()

  const pressLetter = (letter: number) => {
    const next = [...value]
    while (next.length < count) next.push("")
    const slot = next.indexOf("")
    if (slot == -1) return
    next[slot] = noteKey({ letter, accidental: 0 })
    onChange(next)
  }

  const pressAccidental = (accidental: number) => {
    if (lastFilled == -1) return
    const n = fromNoteKey(value[lastFilled])
    const next = [...value]
    next[lastFilled] = noteKey({ ...n, accidental: n.accidental == accidental ? 0 : accidental })
    onChange(next)
  }

  const clear = (i: number) => {
    if (locked) return
    const next = [...value]
    next[i] = ""
    onChange(next)
  }

  const boxes = [...Array(count)].map((_, i) => value[i] ?? "")
  const current = boxes.indexOf("")
  const lastAccidental = lastFilled == -1 ? undefined : fromNoteKey(value[lastFilled]).accidental

  return (
    <div className="noteKeypad">
      <div className="answerBoxes" aria-live="polite">
        {boxes.map((v, i) => (
          <button
            key={i}
            type="button"
            className={[
              "answerBox",
              v == "" ? "empty" : "",
              i == current && !locked ? "current" : "",
              marks == undefined ? "" : marks[i] ? "correct" : "wrong",
            ].join(" ")}
            onClick={() => clear(i)}
            disabled={locked || v == ""}
            aria-label={v == "" ? `Note ${i + 1}: not named yet` : `Note ${i + 1}: ${noteLabel(fromNoteKey(v), naming)}. Tap to clear`}
          >
            {v == "" ? "" : noteLabel(fromNoteKey(v), naming)}
          </button>
        ))}
      </div>
      <div className={`letterKeys${naming == "solfege" ? " solfege" : ""}`}>
        {LETTERS.map(l => (
          <button key={l} type="button" className="letterKey" onClick={() => pressLetter(l)} disabled={locked || filled >= count}>
            {letterLabel(l, naming)}
          </button>
        ))}
      </div>
      {accidentals && (
        <div className="accidentalKeys">
          <button type="button" className={`letterKey${lastAccidental == -1 ? " on" : ""}`} onClick={() => pressAccidental(-1)} disabled={locked || lastFilled == -1} aria-label="Flat">♭</button>
          <button type="button" className={`letterKey${lastAccidental == 1 ? " on" : ""}`} onClick={() => pressAccidental(1)} disabled={locked || lastFilled == -1} aria-label="Sharp">♯</button>
        </div>
      )}
    </div>
  )
}
