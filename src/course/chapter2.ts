import { TREBLE_LINES, TREBLE_SPACES, TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter2: ChapterDef = {
  id: "c2",
  title: "Treble Clef: Spaces",
  description: "F A C E: the spaces between the lines, then the whole stave",
  lessons: [
    {
      id: "c2l1", title: "F and A",
      intro: "The spaces have their own letters. The bottom space is F, the next up A.",
      notes: { treble: "F4 A4" }, reviewNotes: { treble: TREBLE_LINES }, difficulty: 1,
    },
    {
      id: "c2l2", title: "C and E",
      intro: "The top two spaces are C and E. From the bottom, the spaces spell FACE.",
      notes: { treble: "C5 E5" }, reviewNotes: { treble: "F4 A4" }, difficulty: 1,
    },
    {
      id: "c2l3", title: "All four spaces",
      intro: "F A C E, from the bottom up.",
      notes: { treble: TREBLE_SPACES }, difficulty: 2,
    },
    {
      id: "c2l4", title: "Lines and spaces",
      intro: "Going up the stave, line and space take turns, and each is the next letter: E F G A B C D E F.",
      notes: { treble: TREBLE_STAVE }, difficulty: 2,
    },
    {
      id: "c2l5", title: "Short phrases",
      intro: "A few notes at a time, anywhere on the stave.",
      notes: { treble: TREBLE_STAVE }, difficulty: 4, groupSize: [2, 4],
    },
  ],
  test: test("c2t", { notes: { treble: TREBLE_STAVE }, groupSize: [1, 4] }),
}
