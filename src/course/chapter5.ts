import { BASS_LINES, BASS_SPACES, BASS_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter5: ChapterDef = {
  id: "c5",
  title: "Bass Clef",
  description: "The lower stave: G B D F A on the lines, A C E G in the spaces",
  lessons: [
    {
      id: "c5l1", title: "F, the bass clef's line",
      intro: "The bass clef's two dots sit either side of the F line, the fourth line up. Just below it is D, the middle line.",
      notes: { bass: "F3 D3" }, difficulty: 1,
    },
    {
      id: "c5l2", title: "All five lines",
      intro: "From the bottom, the bass lines are G B D F A: Good Boys Do Fine Always.",
      notes: { bass: BASS_LINES }, difficulty: 2,
    },
    {
      id: "c5l3", title: "The spaces",
      intro: "The bass spaces, from the bottom, are A C E G: All Cows Eat Grass.",
      notes: { bass: BASS_SPACES }, reviewNotes: { bass: BASS_LINES }, difficulty: 2,
    },
    {
      id: "c5l4", title: "The whole bass stave",
      intro: "Line and space take turns going up, a letter at a time: G A B C D E F G A.",
      notes: { bass: BASS_STAVE }, difficulty: 3, intervals: [2, 3],
      mix: { readNotes: 2, writeNotes: 2, readInterval: 1 },
    },
    {
      id: "c5l5", title: "Two notes by ear",
      intro: "Hear the given note and two more, each a step from the last. Write them on the bass stave.",
      notes: { bass: "C3 D3 E3 F3 G3 A3" }, difficulty: 3,
      dictation: { count: 2, maxStep: 1, keyGiven: true },
      mix: { earDictation: 3, readNotes: 1 },
    },
  ],
  test: test("c5t", {
    notes: { bass: BASS_STAVE }, intervals: [2, 3], groupSize: [1, 3],
    dictation: { count: 2, maxStep: 1, keyGiven: true },
    mix: { readNotes: 3, writeNotes: 2, readInterval: 1, earDictation: 1 },
  }),
}
