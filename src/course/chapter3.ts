import { TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter3: ChapterDef = {
  id: "c3",
  title: "Steps and Skips",
  description: "How far apart two notes are, and your first notes by ear",
  lessons: [
    {
      id: "c3l1", title: "Steps: a 2nd",
      intro: "From a line to the next space, or a space to the next line, is a step: the interval of a 2nd.",
      notes: { treble: TREBLE_STAVE }, difficulty: 1, intervals: [2, 3],
      mix: { readInterval: 3, writeInterval: 1, readNotes: 1 },
    },
    {
      id: "c3l2", title: "Skips: a 3rd",
      intro: "From a line to the next line, or a space to the next space, skips a letter: a 3rd.",
      notes: { treble: TREBLE_STAVE }, difficulty: 2, intervals: [2, 3],
      mix: { readInterval: 2, writeInterval: 2, readNotes: 1 },
    },
    {
      id: "c3l3", title: "Hearing a step",
      intro: "You'll be shown a note and hear it, then one more a step above or below. Write the second note.",
      notes: { treble: "C5 D5 E5 F5 G4 A4 B4" }, difficulty: 2,
      dictation: { count: 1, maxStep: 1, keyGiven: true },
      mix: { earDictation: 3, readInterval: 1 }, intervals: [2, 3],
    },
    {
      id: "c3l4", title: "Steps and skips by ear",
      intro: "Now the second note may be a step or a skip away.",
      notes: { treble: "E4 F4 G4 A4 B4 C5 D5 E5" }, difficulty: 3,
      dictation: { count: 1, maxStep: 2, keyGiven: true },
      mix: { earDictation: 3, writeInterval: 1, readInterval: 1 }, intervals: [2, 3],
    },
  ],
  test: test("c3t", {
    notes: { treble: TREBLE_STAVE }, intervals: [2, 3],
    dictation: { count: 1, maxStep: 2, keyGiven: true },
    mix: { readNotes: 1, readInterval: 2, writeInterval: 2, earDictation: 2 },
  }),
}
