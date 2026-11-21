// How the learner has done: the best score in each lesson, which chapter tests they
// have passed, and how many lessons they finished each day. Kept in the browser
// between visits.

import { PASS_MARK } from "../course/types"
import { DAY_KEY, DayCounts } from "./history"

export interface LessonProgress {
  best: number // 0-1
  completed: boolean
}

export interface Progress {
  lessons: Record<string, LessonProgress> // by lesson id; tests use their own id too
  days: DayCounts // every lesson and test finished, whatever the score
}

export const EMPTY_PROGRESS: Progress = { lessons: {}, days: {} }

const PROGRESS_KEY = "learn-notation.progress"

export function parseProgress(saved: string | null): Progress {
  let raw: any
  try {
    raw = saved == null ? {} : JSON.parse(saved)
  } catch {
    return { lessons: {}, days: {} }
  }
  const lessons: Record<string, LessonProgress> = {}
  if (raw != null && typeof raw == "object" && raw.lessons != null && typeof raw.lessons == "object") {
    for (const [id, p] of Object.entries<any>(raw.lessons)) {
      if (p != null && typeof p == "object" && typeof p.best == "number" && isFinite(p.best)) {
        lessons[id] = { best: Math.min(1, Math.max(0, p.best)), completed: p.completed === true }
      }
    }
  }
  const days: DayCounts = {}
  if (raw != null && typeof raw == "object" && raw.days != null && typeof raw.days == "object") {
    for (const [key, count] of Object.entries<any>(raw.days)) {
      if (DAY_KEY.test(key) && typeof count == "number" && isFinite(count) && count > 0) {
        days[key] = Math.round(count)
      }
    }
  }
  return { lessons, days }
}

// recordScore keeps the better of the new score and the old. A lesson is completed by
// finishing it; a test only by passing it.
export function recordScore(progress: Progress, id: string, score: number, isTest: boolean): Progress {
  const old = progress.lessons[id]
  const completed = (old?.completed ?? false) || !isTest || score >= PASS_MARK
  return {
    ...progress,
    lessons: {
      ...progress.lessons,
      [id]: { best: Math.max(old?.best ?? 0, score), completed },
    },
  }
}

// logLesson counts one more lesson finished on the given day
export function logLesson(progress: Progress, day: string): Progress {
  return { ...progress, days: { ...progress.days, [day]: (progress.days[day] ?? 0) + 1 } }
}

export function loadProgress(): Progress {
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY))
  } catch {
    return EMPTY_PROGRESS
  }
}

export function saveProgress(progress: Progress): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // not remembered
  }
}
