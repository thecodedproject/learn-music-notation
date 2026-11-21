// The learner's practice over time: how many lessons they finished each day, gathered
// into weeks (Monday to Sunday, in local time) to measure against their weekly goal.

// lessons finished, by local day ("2026-11-21")
export type DayCounts = Record<string, number>

export interface Day {
  key: string
  date: Date
  count: number
}

export interface Week {
  key: string // the Monday's day key
  start: Date
  days: Day[] // Monday first
  total: number
}

const pad = (n: number) => String(n).padStart(2, "0")

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// counting in calendar days rather than milliseconds keeps clock changes out of it
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7))
}

export function weekOf(counts: DayCounts, date: Date): Week {
  const start = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    const key = dayKey(d)
    return { key, date: d, count: counts[key] ?? 0 }
  })
  return { key: dayKey(start), start, days, total: days.reduce((sum, d) => sum + d.count, 0) }
}

// the weeks running up to and including this one, oldest first: `count` of them, or with
// no count every week back to the first with a lesson in it
export function recentWeeks(counts: DayCounts, today: Date, count?: number): Week[] {
  const last = startOfWeek(today)
  let first = addDays(last, -7 * ((count ?? 1) - 1))
  if (count == undefined) {
    const earliest = Object.keys(counts).filter(k => counts[k] > 0).sort()[0]
    if (earliest != undefined && parseDayKey(earliest) < first) {
      first = startOfWeek(parseDayKey(earliest))
    }
  }
  const weeks: Week[] = []
  for (let w = first; w <= last; w = addDays(w, 7)) {
    weeks.push(weekOf(counts, w))
  }
  return weeks
}

export interface Summary {
  total: number
  activeDays: number
  weeksAtGoal: number
  streak: number // weeks in a row at goal, up to this one
  bestWeek: number
  bestDay: number
}

// summarize sums up every week given, which should run up to this one
export function summarize(weeks: Week[], goal: number): Summary {
  const days = weeks.flatMap(w => w.days)
  // this week isn't over, so not being at goal yet doesn't break the streak
  let i = weeks.length - 1
  if (i >= 0 && weeks[i].total < goal) {
    i--
  }
  let streak = 0
  while (i >= 0 && weeks[i].total >= goal) {
    streak++
    i--
  }
  return {
    total: days.reduce((sum, d) => sum + d.count, 0),
    activeDays: days.filter(d => d.count > 0).length,
    weeksAtGoal: weeks.filter(w => w.total >= goal).length,
    streak,
    bestWeek: Math.max(0, ...weeks.map(w => w.total)),
    bestDay: Math.max(0, ...days.map(d => d.count)),
  }
}
