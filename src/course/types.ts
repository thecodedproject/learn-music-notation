import { Clef, KeySignature } from "music-lib/theory"

export const EXERCISE_KINDS = [
  "readNotes", // see notes on the stave, name them: the easiest
  "writeNotes", // see note names, put them on the stave
  "readKey", // see a key signature, name the key
  "readInterval", // see two notes, name the interval between them
  "writeInterval", // see a note, write the one an interval away from it
  "earScale", // see a starting note, hear a scale played from it, name its key
  "earDictation", // see the first note, hear it and some more, write the rest: the hardest
] as const
export type ExerciseKind = typeof EXERCISE_KINDS[number]

export type Difficulty = 1 | 2 | 3 | 4 | 5

// the notes a lesson uses on each clef's stave, written "E4 G4 F#5"
export type NoteSet = Partial<Record<Clef, string>>

// DictationSpec sets how hard an ear-dictation exercise is
export interface DictationSpec {
  count: number // notes to write after the one given
  maxStep: number // the widest leap from one note to the next, in letters (1 for steps)
  keyGiven: boolean // whether the key signature is shown (without it, accidentals must be written)
  keys?: KeySignature[] // the (major) keys the phrase may be in; C if left out
}

// ScaleSpec sets the scales an ear-scale exercise plays
export interface ScaleSpec {
  keys: KeySignature[] // major keys, by key signature
  minor?: boolean // play minor keys' scales instead
  startDegrees: number[] // the degrees a scale may start from (1 for the tonic)
}

export interface LessonDef {
  id: string
  title: string
  intro?: string // a line or two shown before the lesson starts
  notes: NoteSet // the notes this lesson teaches
  reviewNotes?: NoteSet // notes from before, mixed in
  difficulty: Difficulty
  mix?: Partial<Record<ExerciseKind, number>> // the share of each kind of exercise, if not the difficulty's usual
  groupSize?: [number, number] // how many notes to read or write at once
  keySignatures?: KeySignature[] // the notes are written under one of these; C if left out
  accidentals?: boolean // answers name (and write) sharps and flats
  intervals?: number[] // the interval numbers asked about (2 for a 2nd, 8 for an octave)
  intervalQuality?: boolean // name intervals by quality too: m3, P5
  dictation?: DictationSpec
  scales?: ScaleSpec
  keys?: KeySignature[] // the key signatures to name
  exerciseCount?: number // overrides the setting
}

export interface ChapterDef {
  id: string
  title: string
  description: string
  lessons: LessonDef[]
  test: LessonDef
}

export const PASS_MARK = 0.8

// a chapter test is longer than a lesson, whatever the lesson length is set to
export const TEST_LENGTH = 16
export const TEST_INTRO = "Sixteen questions on everything in this chapter. Score 80% to pass."
