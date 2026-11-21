import { TREBLE_STAVE, test } from "./helpers"
import { ChapterDef } from "./types"

export const chapter7: ChapterDef = {
  id: "c7",
  title: "Sharps and Flats",
  description: "♯ raises a note a semitone, ♭ lowers it, and ♮ cancels them",
  lessons: [
    {
      id: "c7l1", title: "Sharps",
      intro: "A sharp (♯) before a note raises it a semitone: F♯ is the black key just above F. Name the note and its sharp.",
      notes: { treble: "F#4 C#5 G#4 D#5" }, reviewNotes: { treble: TREBLE_STAVE }, difficulty: 2, accidentals: true,
    },
    {
      id: "c7l2", title: "Flats",
      intro: "A flat (♭) lowers a note a semitone: B♭ is the black key just below B.",
      notes: { treble: "Bb4 Eb5 Ab4 Db5" }, reviewNotes: { treble: TREBLE_STAVE }, difficulty: 2, accidentals: true,
    },
    {
      id: "c7l3", title: "Writing sharps and flats",
      intro: "Place the note, then add its sharp or flat with the buttons below the stave.",
      notes: { treble: "F#4 C#5 Bb4 Eb5 G#4 Ab4" }, reviewNotes: { treble: TREBLE_STAVE }, difficulty: 3, accidentals: true,
      mix: { writeNotes: 2, readNotes: 1 },
    },
    {
      id: "c7l4", title: "On the bass stave",
      intro: "Sharps and flats work just the same on the bass stave.",
      notes: { bass: "F#3 C#3 Bb2 Eb3 G#2 Ab2" }, reviewNotes: { bass: "G2 A2 B2 C3 D3 E3 F3 G3 A3" },
      difficulty: 3, accidentals: true,
    },
  ],
  test: test("c7t", {
    notes: { treble: "F#4 C#5 G#4 Bb4 Eb5 Ab4 " + TREBLE_STAVE, bass: "F#3 C#3 Bb2 Eb3 C3 D3 E3 G3 A3" },
    accidentals: true, groupSize: [1, 2],
  }),
}
