import { BASS_STAVE, TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

const WIDE_BASS = "C2 D2 E2 F2 G2 A2 B2 C3 D3 E3 F3 G3 A3 B3 C4 D4 E4"

export const chapter6: ChapterDef = {
  id: "c6",
  title: "Both Clefs",
  description: "Ledger lines around the bass stave, and switching between the clefs",
  lessons: [
    {
      id: "c6l1", title: "Middle C from below",
      intro: "Middle C sits on the first ledger line above the bass stave, just as it sits on the one below the treble. B hangs just above the bass stave.",
      notes: { bass: "B3 C4" }, reviewNotes: { bass: BASS_STAVE }, difficulty: 2,
    },
    {
      id: "c6l2", title: "Below the bass stave",
      intro: "Under the bass stave: F hangs just below it, and E sits on the first ledger line.",
      notes: { bass: "F2 E2" }, reviewNotes: { bass: BASS_STAVE }, difficulty: 2,
    },
    {
      id: "c6l3", title: "Further out",
      intro: "Two ledger lines below the bass stave is C; two above, E.",
      notes: { bass: "C2 D2 D4 E4" }, reviewNotes: { bass: "E2 F2 B3 C4" }, difficulty: 3,
    },
    {
      id: "c6l4", title: "Treble or bass?",
      intro: "Each exercise is on one clef or the other. Check the clef before you read!",
      notes: { treble: TREBLE_STAVE, bass: BASS_STAVE }, difficulty: 3,
    },
  ],
  test: test("c6t", {
    notes: { treble: "C4 " + TREBLE_STAVE, bass: WIDE_BASS }, groupSize: [1, 3],
    intervals: [2, 3, 4, 5],
    mix: { readNotes: 3, writeNotes: 2, readInterval: 1 },
  }),
}
