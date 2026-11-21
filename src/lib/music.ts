// Small helpers for the notes the app works with, on top of music-lib's theory.

import {
  Clef,
  KeySignature,
  Pitch,
  SpelledNote,
  diatonicNumber,
  keySignatureAccidental,
  midiNumber,
  stavePosition,
} from "music-lib/theory"

// parsePitch reads a pitch from how it is written: "C4", "F#5", "Bb3", "Ebb2"
export function parsePitch(name: string): Pitch {
  const m = /^([A-G])(#{1,2}|b{1,2})?(-?\d)$/.exec(name.trim())
  if (m == null) {
    throw Error(`cannot read the pitch "${name}"`)
  }
  const accidental = m[2] == undefined ? 0 : (m[2][0] == "#" ? 1 : -1) * m[2].length
  return { letter: "CDEFGAB".indexOf(m[1]), accidental, octave: Number(m[3]) }
}

// parsePitches reads a list of pitches written with spaces between: "E4 G4 B4"
export function parsePitches(list: string | undefined): Pitch[] {
  return list == undefined ? [] : list.trim().split(/\s+/).filter(s => s != "").map(parsePitch)
}

// pitchText writes a pitch the way parsePitch reads it
export function pitchText(p: Pitch): string {
  const acc = p.accidental > 0 ? "#".repeat(p.accidental) : "b".repeat(-p.accidental)
  return "CDEFGAB"[p.letter] + acc + p.octave
}

// noteKey names a spelled note (in no octave) for comparing and for tile ids: "3:1" is F♯
export const noteKey = (n: SpelledNote) => `${n.letter}:${n.accidental}`

export function fromNoteKey(key: string): SpelledNote {
  const [letter, accidental] = key.split(":").map(Number)
  return { letter, accidental }
}

export const sameNote = (a: SpelledNote, b: SpelledNote) => a.letter == b.letter && a.accidental == b.accidental

export const samePitch = (a: Pitch, b: Pitch) => sameNote(a, b) && a.octave == b.octave

// writtenAccidental is the accidental to write before a note under a key signature: none
// if the key signature already gives its letter that accidental
export function writtenAccidental(p: Pitch, keySignature: KeySignature): number | undefined {
  return p.accidental == keySignatureAccidental(keySignature, p.letter) ? undefined : p.accidental
}

// pitchRange is the lowest and highest stave positions of some pitches
export function positionRange(pitches: Pitch[], clef: Clef): [number, number] {
  const positions = pitches.map(p => stavePosition(p, clef))
  return [Math.min(...positions), Math.max(...positions)]
}

export const lowestFirst = (a: Pitch, b: Pitch) => diatonicNumber(a) - diatonicNumber(b) || midiNumber(a) - midiNumber(b)
