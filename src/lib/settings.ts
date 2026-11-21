// The learner's settings, and remembering them from one visit to the next.

import { NamingSystem } from "music-lib/theory"

export const THEMES = ["light", "dark"] as const
export type Theme = typeof THEMES[number]

export const TEMPOS = ["slow", "normal", "fast"] as const
export type Tempo = typeof TEMPOS[number]

// the beats a minute phrases are played at, at each tempo
export const TEMPO_BPM: Record<Tempo, number> = { slow: 60, normal: 84, fast: 112 }

export const NAMINGS = ["letters", "solfege"] as const

export const MIN_EXERCISES = 4
export const MAX_EXERCISES = 20
export const MIN_GOAL = 1
export const MAX_GOAL = 40

export interface Settings {
  naming: NamingSystem // name notes C D E, or Do Re Mi
  tempo: Tempo // how fast phrases are played for ear training
  playWhilePlacing: boolean // sound each note as it's placed on the stave
  volume: number // 0-1
  exerciseCount: number // per lesson; tests set their own
  weeklyGoal: number // lessons a week to aim for
}

export const DEFAULT_SETTINGS: Settings = {
  naming: "letters",
  tempo: "normal",
  playWhilePlacing: true,
  volume: 0.8,
  exerciseCount: 12,
  weeklyGoal: 12,
}

const SETTINGS_KEY = "learn-notation.settings"

const SETTINGS_VERSION = 1

const THEME_KEY = "learn-notation.theme"

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// parseSettings reads settings saved earlier, keeping whatever of them is still good and
// taking the default for the rest, so a missing or damaged save never breaks the page
export function parseSettings(saved: string | null): Settings {
  let raw: any
  try {
    raw = saved == null ? {} : JSON.parse(saved)
  } catch {
    raw = {}
  }
  if (raw == null || typeof raw != "object") {
    raw = {}
  }
  const d = DEFAULT_SETTINGS
  const isNum = (v: unknown): v is number => typeof v == "number" && isFinite(v)
  return {
    naming: (NAMINGS as readonly unknown[]).includes(raw.naming) ? raw.naming : d.naming,
    tempo: (TEMPOS as readonly unknown[]).includes(raw.tempo) ? raw.tempo : d.tempo,
    playWhilePlacing: typeof raw.playWhilePlacing == "boolean" ? raw.playWhilePlacing : d.playWhilePlacing,
    volume: isNum(raw.volume) ? clamp(raw.volume, 0, 1) : d.volume,
    exerciseCount: isNum(raw.exerciseCount) ? clamp(Math.round(raw.exerciseCount), MIN_EXERCISES, MAX_EXERCISES) : d.exerciseCount,
    weeklyGoal: isNum(raw.weeklyGoal) ? clamp(Math.round(raw.weeklyGoal), MIN_GOAL, MAX_GOAL) : d.weeklyGoal,
  }
}

// storage can be missing or blocked (a private window, say), in which case settings just
// aren't remembered
export function loadSettings(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, version: SETTINGS_VERSION }))
  } catch {
    // not remembered
  }
}

// the theme chosen on an earlier visit, or else whichever the device is set to
export function loadTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if ((THEMES as readonly (string | null)[]).includes(stored)) {
      return stored as Theme
    }
  } catch {
    // fall through
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme == "dark" ? "#14161a" : "#f7f8fa")
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // not remembered
  }
}
