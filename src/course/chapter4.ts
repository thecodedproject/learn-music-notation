import { TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

const WIDE_TREBLE = "A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 B5 C6"

export const chapter4: ChapterDef = {
  id: "c4",
  title: "Beyond the Treble Stave",
  description: "Ledger lines above and below, middle C, and wider intervals",
  lessons: [
    {
      id: "c4l1", title: "Middle C and D",
      intro: "Below the stave, short ledger lines carry on the pattern. Middle C sits on the first one; D hangs just under the stave.",
      notes: { treble: "C4 D4" }, reviewNotes: { treble: TREBLE_STAVE }, difficulty: 1,
    },
    {
      id: "c4l2", title: "G and A above",
      intro: "Above the top line, G sits on top of the stave, and A on the first ledger line.",
      notes: { treble: "G5 A5" }, reviewNotes: { treble: TREBLE_STAVE }, difficulty: 2,
    },
    {
      id: "c4l3", title: "B and C, higher still",
      intro: "Above A: B sits on the first ledger line, C on the second.",
      notes: { treble: "B5 C6" }, reviewNotes: { treble: "F5 G5 A5" }, difficulty: 2,
    },
    {
      id: "c4l4", title: "A and B below",
      intro: "Under middle C: B hangs below its ledger line, and A sits on a second one.",
      notes: { treble: "A3 B3" }, reviewNotes: { treble: "C4 D4 E4" }, difficulty: 2,
    },
    {
      id: "c4l5", title: "4ths, 5ths and octaves",
      intro: "Wider intervals: a 4th (C up to F), a 5th (C up to G) and an octave (C up to the next C), which lands on the same letter.",
      notes: { treble: WIDE_TREBLE }, difficulty: 3, intervals: [2, 3, 4, 5, 8],
      mix: { readInterval: 3, writeInterval: 2, readNotes: 1 },
    },
  ],
  test: test("c4t", {
    notes: { treble: WIDE_TREBLE }, intervals: [2, 3, 4, 5, 8], groupSize: [1, 3],
    dictation: { count: 2, maxStep: 2, keyGiven: true },
    mix: { readNotes: 3, writeNotes: 2, readInterval: 2, earDictation: 1 },
  }),
}
