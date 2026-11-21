import { TREBLE_LINES, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter1: ChapterDef = {
  id: "c1",
  title: "Treble Clef: Lines",
  description: "E G B D F: the five lines of the treble stave",
  lessons: [
    {
      id: "c1l1", title: "E and G",
      intro: "The treble clef curls around the G line, the second line up. The bottom line, just below it, is E.",
      notes: { treble: "E4 G4" }, difficulty: 1,
    },
    {
      id: "c1l2", title: "B, the middle line",
      intro: "The middle line is B. Lines go up by skipping a letter: E, G, B.",
      notes: { treble: "B4" }, reviewNotes: { treble: "E4 G4" }, difficulty: 1,
    },
    {
      id: "c1l3", title: "D and F",
      intro: "The top two lines are D and F. All five, from the bottom: Every Good Boy Deserves Fruit.",
      notes: { treble: "D5 F5" }, reviewNotes: { treble: "E4 G4 B4" }, difficulty: 1,
    },
    {
      id: "c1l4", title: "All five lines",
      intro: "Every Good Boy Deserves Fruit, from bottom to top.",
      notes: { treble: TREBLE_LINES }, difficulty: 2,
    },
    {
      id: "c1l5", title: "Reading lines in a row",
      intro: "Now a few notes at a time. Name them from left to right.",
      notes: { treble: TREBLE_LINES }, difficulty: 3, groupSize: [2, 3],
    },
  ],
  test: test("c1t", { notes: { treble: TREBLE_LINES }, groupSize: [1, 3] }),
}
