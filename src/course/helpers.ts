import { TEST_INTRO, TEST_LENGTH, LessonDef } from "./types"

// test makes a chapter test: longer than a lesson, and at full difficulty
export function test(id: string, def: Omit<LessonDef, "id" | "title" | "difficulty">): LessonDef {
  return { id, title: "Chapter test", intro: TEST_INTRO, difficulty: 5, exerciseCount: TEST_LENGTH, ...def }
}

// the notes of the treble and bass staves, from one ledger line below to one above
export const TREBLE_LINES = "E4 G4 B4 D5 F5"
export const TREBLE_SPACES = "F4 A4 C5 E5"
export const TREBLE_STAVE = "E4 F4 G4 A4 B4 C5 D5 E5 F5"
export const BASS_LINES = "G2 B2 D3 F3 A3"
export const BASS_SPACES = "A2 C3 E3 G3"
export const BASS_STAVE = "G2 A2 B2 C3 D3 E3 F3 G3 A3"
