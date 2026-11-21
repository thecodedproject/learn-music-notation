// Making a lesson's exercises from its definition: which kinds of exercise, which notes
// they ask about, and for those answered by choosing, the choices.

import {
  Clef,
  KeySignature,
  Pitch,
  intervalBetween,
  intervalNumberName,
  intervalShortName,
  keyForSignature,
  keyName,
  keyScale,
  pitchAtPosition,
  scaleFrom,
  stavePosition,
} from "music-lib/theory"
import { Difficulty, EXERCISE_KINDS, ExerciseKind, LessonDef } from "../course/types"
import { noteKey, parsePitches, positionRange, sameNote } from "./music"
import { Rng, seededRng, shuffle } from "./random"

// what every exercise shows: a stave in a clef, under a key signature
interface StaveSpec {
  clef: Clef
  keySignature: KeySignature
}

// ReadNotesExercise: name the notes shown, in order
export interface ReadNotesExercise extends StaveSpec {
  kind: "readNotes"
  notes: Pitch[]
  accidentals: boolean // whether the answer can be sharpened or flattened
}

// WriteNotesExercise: write notes with the names given, in any octave unless strict
export interface WriteNotesExercise extends StaveSpec {
  kind: "writeNotes"
  targets: Pitch[] // the notes asked for, in the octave shown if the answer was wrong
  accidentals: boolean
  extent: [number, number] // the stave positions notes can be placed between
}

// ChoiceExercise: pick the right one of a few named choices
export interface ChoiceExercise extends StaveSpec {
  kind: "readInterval" | "readKey" | "earScale"
  notes: Pitch[] // shown on the stave
  played?: Pitch[] // played, for exercises answered by ear
  choices: string[]
  answer: string
}

// WriteInterval: write the note an interval up or down from the one given
export interface WriteIntervalExercise extends StaveSpec {
  kind: "writeInterval"
  given: Pitch
  interval: number
  direction: "up" | "down"
  target: Pitch
  extent: [number, number]
}

// EarDictationExercise: write the notes heard after the given one, octave and all
export interface EarDictationExercise extends StaveSpec {
  kind: "earDictation"
  given: Pitch
  targets: Pitch[]
  accidentals: boolean
  extent: [number, number]
}

export type Exercise =
  | ReadNotesExercise
  | WriteNotesExercise
  | ChoiceExercise
  | WriteIntervalExercise
  | EarDictationExercise

// the usual share of reading and writing at each difficulty, when a lesson doesn't set
// its own mix
const NOTE_MIX: Record<Difficulty, Partial<Record<ExerciseKind, number>>> = {
  1: { readNotes: 3, writeNotes: 1 },
  2: { readNotes: 2, writeNotes: 1 },
  3: { readNotes: 1, writeNotes: 1 },
  4: { readNotes: 1, writeNotes: 1 },
  5: { readNotes: 1, writeNotes: 1 },
}

// how many notes are read or written at once, at each difficulty
const GROUP_SIZE: Record<Difficulty, [number, number]> = {
  1: [1, 1],
  2: [1, 2],
  3: [1, 3],
  4: [2, 4],
  5: [2, 4],
}

const REVIEW_SHARE = 0.3

// kindCounts shares count exercises among the kinds by the mix's weights
export function kindCounts(mix: Partial<Record<ExerciseKind, number>>, count: number): Map<ExerciseKind, number> {
  const kinds = EXERCISE_KINDS.filter(k => (mix[k] ?? 0) > 0)
  const total = kinds.reduce((sum, k) => sum + mix[k]!, 0)
  const exact = kinds.map(k => (mix[k]! * count) / total)
  const counts = exact.map(Math.floor)
  // the rest go to the biggest remainders, the easier kind winning a tie
  const order = kinds.map((_, i) => i).sort((a, b) => (exact[b] - counts[b]) - (exact[a] - counts[a]) || a - b)
  for (let i = 0; counts.reduce((s, c) => s + c, 0) < count; i++) {
    counts[order[i % order.length]]++
  }
  return new Map(kinds.map((k, i) => [k, counts[i]]))
}

export function lessonMix(lesson: LessonDef): Partial<Record<ExerciseKind, number>> {
  return lesson.mix ?? NOTE_MIX[lesson.difficulty]
}

// the notes a lesson uses, by clef, new and review apart
interface Pool {
  clef: Clef
  fresh: Pitch[]
  review: Pitch[]
}

function pools(lesson: LessonDef): Pool[] {
  const clefs = new Set<Clef>([
    ...(Object.keys(lesson.notes) as Clef[]),
    ...(Object.keys(lesson.reviewNotes ?? {}) as Clef[]),
  ])
  const out: Pool[] = []
  for (const clef of clefs) {
    const fresh = parsePitches(lesson.notes[clef])
    const review = parsePitches(lesson.reviewNotes?.[clef])
    if (fresh.length + review.length > 0) {
      out.push({ clef, fresh, review })
    }
  }
  if (out.length == 0) {
    // a lesson only on key signatures, say, still needs a stave to show them on
    out.push({ clef: "treble", fresh: parsePitches("C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5"), review: [] })
  }
  return out
}

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]

const between = (lo: number, hi: number, rng: Rng) => lo + Math.floor(rng() * (hi - lo + 1))

// underKey gives a natural pitch the accidental its key signature gives its letter, and
// leaves one written with an accidental as it is
function underKey(p: Pitch, keySignature: KeySignature, clef: Clef): Pitch {
  return p.accidental != 0 ? p : pitchAtPosition(stavePosition(p, clef), clef, keySignature)
}

// writingExtent is how far above and below the stave notes can be placed: the stave and a
// little more, and further for a lesson whose notes go further
export function writingExtent(pitches: Pitch[], clef: Clef): [number, number] {
  const [lo, hi] = pitches.length == 0 ? [0, 8] : positionRange(pitches, clef)
  return [Math.min(-3, lo - 2), Math.max(11, hi + 2)]
}

export function generateLesson(lesson: LessonDef, count: number, seed: number): Exercise[] {
  const rng = seededRng(seed)
  const n = lesson.exerciseCount ?? count
  const counts = kindCounts(lessonMix(lesson), n)
  // easiest first, so a lesson gets a little harder as it goes
  const kinds: ExerciseKind[] = []
  for (const kind of EXERCISE_KINDS) {
    for (let i = 0; i < (counts.get(kind) ?? 0); i++) {
      kinds.push(kind)
    }
  }
  const ps = pools(lesson)
  // each new note is asked about early on where there's room, rather than by chance
  const queue: Map<Clef, Pitch[]> = new Map(ps.map(p => [p.clef, shuffle(p.fresh, rng)]))
  let last: Exercise | undefined
  return kinds.map(kind => {
    // try a few times for one that isn't the same as the one before
    let ex = makeExercise(kind, lesson, ps, queue, rng)
    for (let i = 0; i < 4 && last != undefined && sameExercise(ex, last); i++) {
      ex = makeExercise(kind, lesson, ps, queue, rng)
    }
    last = ex
    return ex
  })
}

function sameExercise(a: Exercise, b: Exercise): boolean {
  return JSON.stringify(a) == JSON.stringify(b)
}

// pickNotes chooses notes from the pool: those from the queue of new notes first, then new
// notes and some review at random, never the same note twice running
function pickNotes(pool: Pool, queue: Pitch[], k: number, rng: Rng): Pitch[] {
  const out: Pitch[] = []
  while (out.length < k) {
    const prev = out[out.length - 1]
    let next: Pitch
    if (queue.length > 0) {
      next = queue.shift()!
    } else {
      const fromReview = pool.review.length > 0 && (pool.fresh.length == 0 || rng() < REVIEW_SHARE)
      next = pick(fromReview ? pool.review : pool.fresh, rng)
    }
    const all = [...pool.fresh, ...pool.review]
    if (prev != undefined && sameNote(prev, next) && prev.octave == next.octave && all.length > 1) {
      continue
    }
    out.push(next)
  }
  return out
}

export function makeExercise(
  kind: ExerciseKind,
  lesson: LessonDef,
  ps: Pool[],
  queue: Map<Clef, Pitch[]>,
  rng: Rng,
): Exercise {
  const pool = pick(ps, rng)
  const clef = pool.clef
  const all = [...pool.fresh, ...pool.review]
  const keySignature = pick(lesson.keySignatures ?? [0], rng)
  const accidentals = lesson.accidentals ?? false
  const [minGroup, maxGroup] = lesson.groupSize ?? GROUP_SIZE[lesson.difficulty]

  switch (kind) {
    case "readNotes": {
      const notes = pickNotes(pool, queue.get(clef)!, between(minGroup, maxGroup, rng), rng)
      return { kind, clef, keySignature, notes: notes.map(p => underKey(p, keySignature, clef)), accidentals: accidentals || keySignature != 0 }
    }
    case "writeNotes": {
      const notes = pickNotes(pool, queue.get(clef)!, between(minGroup, maxGroup, rng), rng)
      return {
        kind, clef, keySignature,
        targets: notes.map(p => underKey(p, keySignature, clef)),
        accidentals,
        extent: writingExtent(all, clef),
      }
    }
    case "readInterval":
      return readInterval(lesson, clef, all, rng)
    case "writeInterval":
      return writeInterval(lesson, clef, all, rng)
    case "readKey":
      return readKey(lesson, clef, rng)
    case "earScale":
      return earScale(lesson, clef, rng)
    case "earDictation":
      return earDictation(lesson, clef, all, rng)
  }
}

// the pairs of notes from the pool an interval of the lesson's apart
function intervalPairs(lesson: LessonDef, clef: Clef, notes: Pitch[]): [Pitch, Pitch][] {
  const numbers = lesson.intervals ?? [2, 3]
  const pairs: [Pitch, Pitch][] = []
  for (const a of notes) {
    for (const b of notes) {
      const d = stavePosition(b, clef) - stavePosition(a, clef)
      if (d > 0 && numbers.includes(d + 1)) {
        pairs.push([a, b])
      }
    }
  }
  return pairs
}

const intervalLabel = (lesson: LessonDef, a: Pitch, b: Pitch) => {
  const i = intervalBetween(a, b)
  return lesson.intervalQuality ? intervalShortName(i) : intervalNumberName(i.number)
}

// the names an interval might be mistaken for: its neighbours in size
function intervalChoices(lesson: LessonDef, answer: string, rng: Rng): string[] {
  const numbers = lesson.intervals ?? [2, 3]
  if (!lesson.intervalQuality) {
    return numbers.map(intervalNumberName)
  }
  const all: string[] = []
  for (const n of numbers) {
    const simple = (n - 1) % 7
    const perfect = simple == 0 || simple == 3 || simple == 4
    all.push(...(perfect ? [`P${n}`] : [`m${n}`, `M${n}`]))
  }
  // the augmented 4th and diminished 5th, whenever there are 4ths or 5ths
  if (numbers.includes(4)) all.push("A4")
  if (numbers.includes(5)) all.push("d5")
  const others = shuffle(all.filter(l => l != answer), rng).slice(0, 5)
  return sortIntervalNames([answer, ...others])
}

function sortIntervalNames(names: string[]): string[] {
  const order = "dmPMA"
  return [...new Set(names)].sort((a, b) =>
    Number(a.slice(1)) - Number(b.slice(1)) || order.indexOf(a[0]) - order.indexOf(b[0]))
}

function readInterval(lesson: LessonDef, clef: Clef, notes: Pitch[], rng: Rng): ChoiceExercise {
  const pairs = intervalPairs(lesson, clef, notes)
  if (pairs.length == 0) {
    throw Error(`lesson ${lesson.id} has no notes an interval of its apart`)
  }
  const [low, high] = pick(pairs, rng)
  const shown = rng() < 0.5 ? [low, high] : [high, low]
  const answer = intervalLabel(lesson, low, high)
  return {
    kind: "readInterval", clef, keySignature: 0,
    notes: shown, played: shown,
    choices: intervalChoices(lesson, answer, rng), answer,
  }
}

function writeInterval(lesson: LessonDef, clef: Clef, notes: Pitch[], rng: Rng): WriteIntervalExercise {
  const [low, high] = pick(intervalPairs(lesson, clef, notes), rng)
  // going down is harder, so only once intervals are familiar
  const down = lesson.difficulty >= 3 && rng() < 0.5
  const extent = writingExtent(notes, clef)
  const given = down ? high : low
  const target = down ? low : high
  return {
    kind: "writeInterval", clef, keySignature: 0,
    given, target,
    interval: stavePosition(high, clef) - stavePosition(low, clef) + 1,
    direction: down ? "down" : "up",
    extent,
  }
}

function readKey(lesson: LessonDef, clef: Clef, rng: Rng): ChoiceExercise {
  const keys = lesson.keys ?? [0, 1, -1]
  const sig = pick(keys, rng)
  const answer = keyName(keyForSignature(sig))
  const others = shuffle(keys.filter(k => k != sig), rng).slice(0, 3)
  return {
    kind: "readKey", clef, keySignature: sig, notes: [],
    choices: [sig, ...others].sort((a, b) => a - b).map(k => keyName(keyForSignature(k))),
    answer,
  }
}

// octaveFor picks the octave that puts the note nearest the middle of the lower stave,
// leaving the scale room to rise
function octaveFor(note: Pitch, clef: Clef): number {
  let best = 4
  for (let o = 1; o <= 6; o++) {
    const pos = stavePosition({ ...note, octave: o }, clef)
    if (Math.abs(pos - 1) < Math.abs(stavePosition({ ...note, octave: best }, clef) - 1)) {
      best = o
    }
  }
  return best
}

function earScale(lesson: LessonDef, clef: Clef, rng: Rng): ChoiceExercise {
  const spec = lesson.scales ?? { keys: [0, 1, -1], startDegrees: [1] }
  const mode = spec.minor ? "minor" : "major"
  const sig = pick(spec.keys, rng)
  const key = keyForSignature(sig, mode)
  const degree = pick(spec.startDegrees, rng)
  const start = keyScale(key)[degree - 1]
  const pitches = scaleFrom(key, degree, octaveFor({ ...start, octave: 4 }, clef))
  // the keys it could be mistaken for are those whose scales have the starting note in
  // them too
  const plausible = spec.keys.filter(k => k != sig && keyScale(keyForSignature(k, mode)).some(n => sameNote(n, start)))
  const rest = spec.keys.filter(k => k != sig && !plausible.includes(k))
  const others = [...shuffle(plausible, rng), ...shuffle(rest, rng)].slice(0, 3)
  return {
    kind: "earScale", clef, keySignature: 0,
    notes: [pitches[0]], played: pitches,
    choices: [sig, ...others].sort((a, b) => a - b).map(k => keyName(keyForSignature(k, mode))),
    answer: keyName(key),
  }
}

function earDictation(lesson: LessonDef, clef: Clef, notes: Pitch[], rng: Rng): EarDictationExercise {
  const spec = lesson.dictation ?? { count: 1, maxStep: 1, keyGiven: true }
  const sig = pick(spec.keys ?? [0], rng)
  const key = keyForSignature(sig)
  const [lo, hi] = notes.length == 0 ? [0, 8] : positionRange(notes, clef)
  // start on the tonic, third or fifth of the key where the lesson's notes reach one
  const chordTones = [0, 2, 4].map(d => keyScale(key)[d].letter)
  const starts: number[] = []
  for (let pos = lo; pos <= hi; pos++) {
    if (chordTones.includes(pitchAtPosition(pos, clef, sig).letter)) {
      starts.push(pos)
    }
  }
  let pos = starts.length > 0 ? pick(starts, rng) : between(lo, hi, rng)
  const positions = [pos]
  for (let i = 0; i < spec.count; i++) {
    const steps: number[] = []
    for (let d = -spec.maxStep; d <= spec.maxStep; d++) {
      if (d != 0 && pos + d >= lo && pos + d <= hi) {
        steps.push(d)
      }
    }
    pos += pick(steps, rng)
    positions.push(pos)
  }
  const pitches = positions.map(p => pitchAtPosition(p, clef, sig))
  return {
    kind: "earDictation", clef,
    keySignature: spec.keyGiven ? sig : 0,
    given: pitches[0],
    targets: pitches.slice(1),
    accidentals: !spec.keyGiven && sig != 0,
    extent: writingExtent(notes, clef),
  }
}

// gradeNames marks each note named against the notes shown
export function gradeNames(named: string[], notes: Pitch[]): boolean[] {
  return notes.map((p, i) => named[i] == noteKey(p))
}

// gradeWritten marks each note written against the ones asked for: by name alone, or by
// octave too where strict
export function gradeWritten(written: (Pitch | undefined)[], targets: Pitch[], strict: boolean): boolean[] {
  return targets.map((t, i) => {
    const w = written[i]
    return w != undefined && sameNote(w, t) && (!strict || w.octave == t.octave)
  })
}
