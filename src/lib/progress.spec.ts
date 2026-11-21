import { EMPTY_PROGRESS, logLesson, parseProgress, recordScore } from "./progress"
import { parseSettings, DEFAULT_SETTINGS } from "./settings"

describe("progress", () => {
  it("survives a missing or damaged save", () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS)
    expect(parseProgress("{nope")).toEqual(EMPTY_PROGRESS)
    expect(parseProgress(JSON.stringify({ lessons: { a: { best: "x" }, b: { best: 2, completed: true } } })))
      .toEqual({ lessons: { b: { best: 1, completed: true } }, days: {} })
    expect(parseProgress(JSON.stringify({ days: { "2026-11-20": 3, "yesterday": 2, "2026-11-21": -1 } })).days)
      .toEqual({ "2026-11-20": 3 })
  })

  it("keeps the best score", () => {
    let p = recordScore(EMPTY_PROGRESS, "c1l1", 0.9, false)
    p = recordScore(p, "c1l1", 0.5, false)
    expect(p.lessons.c1l1).toEqual({ best: 0.9, completed: true })
  })

  it("only completes a test with a pass", () => {
    let p = recordScore(EMPTY_PROGRESS, "c1t", 0.75, true)
    expect(p.lessons.c1t.completed).toBe(false)
    p = recordScore(p, "c1t", 0.8, true)
    expect(p.lessons.c1t.completed).toBe(true)
  })

  it("counts the lessons finished each day", () => {
    let p = logLesson(EMPTY_PROGRESS, "2026-11-20")
    p = recordScore(logLesson(p, "2026-11-20"), "c1l1", 1, false)
    p = logLesson(p, "2026-11-21")
    expect(p.days).toEqual({ "2026-11-20": 2, "2026-11-21": 1 })
  })
})

describe("settings", () => {
  it("falls back to the defaults", () => {
    expect(parseSettings("[1]")).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings(JSON.stringify({ naming: "numbers", tempo: "warp", exerciseCount: 500 })))
      .toEqual({ ...DEFAULT_SETTINGS, exerciseCount: 20 })
  })

  it("keeps good settings", () => {
    const saved = { ...DEFAULT_SETTINGS, naming: "solfege", tempo: "slow", playWhilePlacing: false }
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved)
  })
})
