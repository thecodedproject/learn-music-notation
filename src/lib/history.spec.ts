import { dayKey, recentWeeks, startOfWeek, summarize, weekOf } from "./history"

describe("history", () => {
  // Saturday 21 November 2026
  const today = new Date(2026, 10, 21, 15, 30)

  it("starts weeks on Monday", () => {
    expect(dayKey(startOfWeek(today))).toBe("2026-11-16")
    expect(dayKey(startOfWeek(new Date(2026, 10, 16)))).toBe("2026-11-16")
    expect(dayKey(startOfWeek(new Date(2026, 10, 22)))).toBe("2026-11-16")
    // across a month and a clock change
    expect(dayKey(startOfWeek(new Date(2026, 10, 1)))).toBe("2026-10-26")
  })

  it("adds up a week", () => {
    const week = weekOf({ "2026-11-15": 9, "2026-11-16": 2, "2026-11-21": 3, "2026-11-23": 9 }, today)
    expect(week.days.map(d => d.count)).toEqual([2, 0, 0, 0, 0, 3, 0])
    expect(week.total).toBe(5)
  })

  it("lists recent weeks, or all of them", () => {
    expect(recentWeeks({}, today, 12).map(w => w.key)[0]).toBe("2026-08-31")
    expect(recentWeeks({}, today, 12)).toHaveLength(12)
    expect(recentWeeks({}, today)).toHaveLength(1)
    expect(recentWeeks({ "2026-10-01": 1 }, today).map(w => w.key))
      .toEqual(["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16"])
  })

  it("counts the streak of weeks at goal, not breaking it for this week", () => {
    const counts = { "2026-10-27": 2, "2026-11-03": 4, "2026-11-11": 3, "2026-11-17": 1 }
    const weeks = recentWeeks(counts, today)
    expect(summarize(weeks, 3)).toEqual({ total: 10, activeDays: 4, weeksAtGoal: 2, streak: 2, bestWeek: 4, bestDay: 4 })
    expect(summarize(weeks, 1).streak).toBe(4)
    expect(summarize(weeks, 5).streak).toBe(0)
  })
})
