import { TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter8: ChapterDef = {
  id: "c8",
  title: "Key Signatures",
  description: "Sharps and flats written once, at the start of every line, and hearing a key",
  lessons: [
    {
      id: "c8l1", title: "G and F major",
      intro: "A key signature sharpens or flattens a letter everywhere. One sharp, on F, is G major; one flat, on B, is F major.",
      notes: {}, keys: [0, 1, -1], difficulty: 1, mix: { readKey: 1 },
    },
    {
      id: "c8l2", title: "Reading in G major",
      intro: "Under G major's key signature, every F is played as F♯, even though no sharp is written next to it.",
      notes: { treble: TREBLE_STAVE }, keySignatures: [1], difficulty: 2, groupSize: [1, 2],
      mix: { readNotes: 3, readKey: 1 }, keys: [0, 1, -1],
    },
    {
      id: "c8l3", title: "D, B♭ and more",
      intro: "Each new sharp key adds one more sharp: D major has two (F♯ and C♯). Each flat key adds a flat: B♭ major has two (B♭ and E♭).",
      notes: { treble: TREBLE_STAVE }, keySignatures: [1, 2, -1, -2], keys: [-2, -1, 0, 1, 2], difficulty: 3,
      mix: { readKey: 2, readNotes: 2 },
    },
    {
      id: "c8l4", title: "Hearing a scale",
      intro: "You'll see the first note and hear a major scale played up from it. Which key is it? Start by listening for the tonic, the note the scale feels at home on.",
      notes: {}, scales: { keys: [-1, 0, 1, 2], startDegrees: [1] }, difficulty: 2,
      mix: { earScale: 1 },
    },
    {
      id: "c8l5", title: "Starting partway",
      intro: "Now the scale may start on any note of the key: E F♯ G A B C D E is G major, starting from its sixth note. Listen for where the half steps fall.",
      notes: {}, scales: { keys: [-2, -1, 0, 1, 2], startDegrees: [1, 2, 3, 4, 5, 6, 7] }, difficulty: 4,
      mix: { earScale: 1 },
    },
  ],
  test: test("c8t", {
    notes: { treble: TREBLE_STAVE }, keySignatures: [1, 2, -1, -2], keys: [-2, -1, 0, 1, 2], groupSize: [1, 2],
    scales: { keys: [-2, -1, 0, 1, 2], startDegrees: [1, 3, 5, 6] },
    mix: { readKey: 1, readNotes: 2, earScale: 1 },
  }),
}
