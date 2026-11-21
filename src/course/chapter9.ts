import { test } from "./helpers"
import { ChapterDef } from "./types"

const C_MAJOR = "C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5"

export const chapter9: ChapterDef = {
  id: "c9",
  title: "Major, Minor and Perfect",
  description: "Naming intervals by quality as well as size, and longer phrases by ear",
  lessons: [
    {
      id: "c9l1", title: "Major and minor 3rds",
      intro: "A major 3rd (M3) spans four semitones, like C to E; a minor 3rd (m3) three, like D to F.",
      notes: { treble: C_MAJOR }, intervals: [3], intervalQuality: true, difficulty: 2,
      mix: { readInterval: 1 },
    },
    {
      id: "c9l2", title: "2nds and 3rds",
      intro: "A major 2nd (M2) is a whole step, like C to D. A minor 2nd (m2) is a half step: E to F and B to C are the two on the white keys.",
      notes: { treble: C_MAJOR }, intervals: [2, 3], intervalQuality: true, difficulty: 3,
      mix: { readInterval: 1 },
    },
    {
      id: "c9l3", title: "Perfect 4ths and 5ths",
      intro: "4ths and 5ths are perfect (P4, P5), except F up to B (an augmented 4th, A4) and B up to F (a diminished 5th, d5).",
      notes: { treble: C_MAJOR }, intervals: [4, 5], intervalQuality: true, difficulty: 3,
      mix: { readInterval: 1 },
    },
    {
      id: "c9l4", title: "Three notes by ear",
      intro: "Three more notes after the given one, with skips as well as steps. The key signature is shown.",
      notes: { treble: "D4 E4 F4 G4 A4 B4 C5 D5 E5" }, difficulty: 4,
      dictation: { count: 3, maxStep: 2, keyGiven: true, keys: [0, 1, -1] },
      mix: { earDictation: 1 },
    },
    {
      id: "c9l5", title: "No key given",
      intro: "Now the key signature isn't shown. If you hear a note that isn't natural, add the sharp or flat yourself.",
      notes: { treble: "D4 E4 F4 G4 A4 B4 C5 D5 E5" }, difficulty: 5,
      dictation: { count: 3, maxStep: 2, keyGiven: false, keys: [0, 1, -1] },
      mix: { earDictation: 1 },
    },
  ],
  test: test("c9t", {
    notes: { treble: C_MAJOR }, intervals: [2, 3, 4, 5, 6], intervalQuality: true,
    dictation: { count: 3, maxStep: 2, keyGiven: true, keys: [0, 1, -1] },
    mix: { readInterval: 3, earDictation: 1 },
  }),
}
