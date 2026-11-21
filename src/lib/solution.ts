// What the feedback after a wrong answer shows: the right answer, in words and (for notes
// to write) on a stave.

import { Clef, KeySignature, NamingSystem, Pitch, intervalNumberName, noteLabel } from "music-lib/theory"
import { Exercise } from "./lesson_gen"

export interface Solution {
  text: string
  stave?: { clef: Clef, keySignature: KeySignature, notes: Pitch[], given: number }
}

const names = (ps: Pitch[], naming: NamingSystem) => ps.map(p => noteLabel(p, naming)).join(" ")

export function solution(ex: Exercise, naming: NamingSystem): Solution {
  switch (ex.kind) {
    case "readNotes":
      return { text: `${ex.notes.length == 1 ? "It's" : "They're"} ${names(ex.notes, naming)}` }
    case "writeNotes":
      return {
        text: ex.targets.length == 1 ? `${names(ex.targets, naming)} goes here (or an octave away):` : "Like this (or an octave away):",
        stave: { clef: ex.clef, keySignature: ex.keySignature, notes: ex.targets, given: 0 },
      }
    case "writeInterval":
      return {
        text: `A ${intervalNumberName(ex.interval)} ${ex.direction == "up" ? "above" : "below"} ${noteLabel(ex.given, naming)} is ${noteLabel(ex.target, naming)}`,
        stave: { clef: ex.clef, keySignature: 0, notes: [ex.given, ex.target], given: 1 },
      }
    case "earDictation":
      return {
        text: `You heard ${names([ex.given, ...ex.targets], naming)}`,
        stave: { clef: ex.clef, keySignature: ex.keySignature, notes: [ex.given, ...ex.targets], given: 1 },
      }
    case "readInterval":
    case "readKey":
    case "earScale":
      return { text: `It's ${ex.kind == "readInterval" ? "a " : ""}${ex.answer}` }
  }
}
