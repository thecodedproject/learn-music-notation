import { Duration, Measure, Pitch } from "music-lib/theory"
import { Stave, StaveLayout } from "music-lib/react"
import { Clef, KeySignature } from "music-lib/theory"
import { ReactNode } from "react"
import { writtenAccidental } from "../lib/music"
import "music-lib/react/stave.css"
import "./score.css"

export interface ScoreProps {
  clef: Clef
  keySignature: KeySignature
  // the notes, a beat apart; one on its own is drawn as a semibreve
  notes: Pitch[]
  // a class for each note, by index: "ghost", "correct", "wrong", "selected"
  classes?: Record<number, string>
  extent?: [number, number]
  overlay?: (layout: StaveLayout) => ReactNode
  size?: "small" | "normal" | "large"
  // how many beats to lay the bar out over, if more than there are notes
  minBeats?: number
}

const SCALES = { small: 0.9, normal: 1.6, large: 2.1 }

// noteMeasure puts notes in a bar, a beat apart, with the accidentals the key signature
// doesn't already give them
export function noteMeasure(notes: Pitch[], keySignature: KeySignature, minBeats = 0): Measure {
  const single = notes.length == 1 && minBeats <= 1
  return {
    numBeats: Math.max(notes.length, minBeats, 1),
    events: notes.map((pitch, i) => ({
      start: i,
      duration: single ? Duration.Whole : Duration.Quarter,
      pitch,
      accidental: writtenAccidental(pitch, keySignature),
      id: i,
    })),
    beams: [],
    tuplets: [],
  }
}

// Score shows a few notes on a stave
export function Score({ clef, keySignature, notes, classes, extent, overlay, size = "normal", minBeats }: ScoreProps): JSX.Element {
  return (
    <div className={`score score-${size}`}>
      <Stave
        measures={[noteMeasure(notes, keySignature, minBeats)]}
        keySignature={keySignature}
        clef={clef}
        slotsPerBeat={1}
        beatWidth={notes.length == 1 ? 60 : 46}
        endBarline="final"
        noteClasses={classes}
        extent={extent}
        overlay={overlay}
        scale={SCALES[size]}
      />
    </div>
  )
}
