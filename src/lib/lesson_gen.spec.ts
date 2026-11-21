import { keyForSignature, keyScale, stavePosition } from "music-lib/theory"
import { CHAPTERS, allLessons, findLesson } from "../course"
import { LessonDef } from "../course/types"
import { generateLesson, gradeNames, gradeWritten, kindCounts } from "./lesson_gen"
import { noteKey, parsePitch, parsePitches, sameNote } from "./music"

const lesson = (def: Partial<LessonDef>): LessonDef => ({ id: "t", title: "t", notes: {}, difficulty: 1, ...def })

describe("kindCounts", () => {
  it("shares out every exercise by weight", () => {
    const counts = kindCounts({ readNotes: 3, writeNotes: 1 }, 12)
    expect(counts.get("readNotes")).toBe(9)
    expect(counts.get("writeNotes")).toBe(3)
  })

  it("gives the remainder to the biggest share", () => {
    const counts = kindCounts({ readNotes: 1, writeNotes: 1, earDictation: 1 }, 7)
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(7)
  })
})

describe("generateLesson", () => {
  it("makes every lesson in the course, whatever the seed", () => {
    for (const ref of allLessons()) {
      for (let seed = 1; seed <= 25; seed++) {
        const exercises = generateLesson(ref.lesson, 12, seed)
        expect([ref.lesson.id, exercises.length]).toEqual([ref.lesson.id, ref.lesson.exerciseCount ?? 12])
      }
    }
  })

  it("reads and writes only the lesson's notes", () => {
    const def = lesson({ notes: { treble: "E4 G4" }, reviewNotes: { treble: "B4" }, difficulty: 3 })
    const allowed = parsePitches("E4 G4 B4").map(noteKey)
    for (let seed = 1; seed <= 20; seed++) {
      for (const ex of generateLesson(def, 12, seed)) {
        const notes = ex.kind == "readNotes" ? ex.notes : ex.kind == "writeNotes" ? ex.targets : []
        for (const n of notes) {
          expect(allowed).toContain(noteKey(n))
        }
      }
    }
  })

  it("asks about every new note early on", () => {
    const ref = findLesson("c1", 2)!
    const exercises = generateLesson(ref.lesson, 12, 3)
    const firstFew = exercises.slice(0, 4).flatMap(e => e.kind == "readNotes" ? e.notes : [])
    for (const n of parsePitches(ref.lesson.notes.treble)) {
      expect(firstFew.map(noteKey)).toContain(noteKey(n))
    }
  })

  it("writes notes under the key signature", () => {
    const def = lesson({ notes: { treble: "F4 F5" }, keySignatures: [1], mix: { readNotes: 1 } })
    for (const ex of generateLesson(def, 6, 1)) {
      if (ex.kind != "readNotes") throw Error("expected reading")
      expect(ex.notes.every(n => n.accidental == 1)).toBe(true)
      expect(ex.accidentals).toBe(true)
    }
  })

  it("keeps dictation within its steps and the lesson's range", () => {
    const def = lesson({
      notes: { treble: "D4 E4 F4 G4 A4 B4 C5" },
      dictation: { count: 4, maxStep: 2, keyGiven: true, keys: [0, 1] },
      mix: { earDictation: 1 },
    })
    for (let seed = 1; seed <= 30; seed++) {
      for (const ex of generateLesson(def, 4, seed)) {
        if (ex.kind != "earDictation") throw Error("expected dictation")
        const positions = [ex.given, ...ex.targets].map(p => stavePosition(p, "treble"))
        expect(ex.targets.length).toBe(4)
        positions.slice(1).forEach((p, i) => {
          expect(Math.abs(p - positions[i])).toBeGreaterThanOrEqual(1)
          expect(Math.abs(p - positions[i])).toBeLessThanOrEqual(2)
        })
        expect(Math.min(...positions)).toBeGreaterThanOrEqual(-1)
        expect(Math.max(...positions)).toBeLessThanOrEqual(5)
        // in G major, every F is sharp
        const key = keyForSignature(ex.keySignature)
        for (const p of [ex.given, ...ex.targets]) {
          expect(keyScale(key).some(n => sameNote(n, p))).toBe(true)
        }
      }
    }
  })

  it("plays a scale from a note of the key it names", () => {
    const def = lesson({ scales: { keys: [-2, -1, 0, 1, 2], startDegrees: [1, 3, 6] }, mix: { earScale: 1 } })
    for (let seed = 1; seed <= 30; seed++) {
      for (const ex of generateLesson(def, 4, seed)) {
        if (ex.kind != "earScale") throw Error("expected a scale")
        expect(ex.choices).toContain(ex.answer)
        expect(new Set(ex.choices).size).toBe(ex.choices.length)
        expect(ex.played!.length).toBe(8)
        expect(sameNote(ex.played![0], ex.played![7])).toBe(true)
        expect(ex.played![7].octave * 7 + ex.played![7].letter - (ex.played![0].octave * 7 + ex.played![0].letter)).toBe(7)
      }
    }
  })

  it("asks for intervals the lesson teaches", () => {
    const def = lesson({ notes: { treble: "C4 D4 E4 F4 G4 A4 B4 C5" }, intervals: [3, 5], mix: { readInterval: 1, writeInterval: 1 }, difficulty: 3 })
    for (let seed = 1; seed <= 20; seed++) {
      for (const ex of generateLesson(def, 6, seed)) {
        if (ex.kind == "readInterval") {
          expect(["3rd", "5th"]).toContain(ex.answer)
          expect(ex.choices).toEqual(["3rd", "5th"])
        } else if (ex.kind == "writeInterval") {
          expect([3, 5]).toContain(ex.interval)
          const d = stavePosition(ex.target, "treble") - stavePosition(ex.given, "treble")
          expect(Math.abs(d) + 1).toBe(ex.interval)
          expect(Math.sign(d)).toBe(ex.direction == "up" ? 1 : -1)
        }
      }
    }
  })

  it("names intervals by quality when asked", () => {
    const def = lesson({ notes: { treble: "C4 D4 E4 F4 G4 A4 B4 C5" }, intervals: [3], intervalQuality: true, mix: { readInterval: 1 } })
    for (const ex of generateLesson(def, 8, 2)) {
      if (ex.kind != "readInterval") throw Error("expected an interval")
      expect(["m3", "M3"]).toContain(ex.answer)
    }
  })
})

describe("grading", () => {
  it("names notes by letter and accidental", () => {
    const notes = parsePitches("E4 F#5")
    expect(gradeNames(["2:0", "3:1"], notes)).toEqual([true, true])
    expect(gradeNames(["2:0", "3:0"], notes)).toEqual([true, false])
  })

  it("accepts notes written in any octave unless strict", () => {
    const targets = parsePitches("E4 G4")
    const written = [parsePitch("E5"), parsePitch("G4")]
    expect(gradeWritten(written, targets, false)).toEqual([true, true])
    expect(gradeWritten(written, targets, true)).toEqual([false, true])
    expect(gradeWritten([undefined, parsePitch("G4")], targets, false)).toEqual([false, true])
  })
})

describe("the course", () => {
  it("makes every test longer than a lesson", () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.test.exerciseCount).toBe(16)
    }
  })

  it("gives every lesson a different id", () => {
    const ids = allLessons().map(r => r.lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("keeps every note near its stave", () => {
    for (const ref of allLessons()) {
      for (const set of [ref.lesson.notes, ref.lesson.reviewNotes ?? {}]) {
        for (const [clef, list] of Object.entries(set)) {
          for (const p of parsePitches(list)) {
            const pos = stavePosition(p, clef as "treble" | "bass")
            expect([ref.lesson.id, pos >= -6 && pos <= 14]).toEqual([ref.lesson.id, true])
          }
        }
      }
    }
  })
})
