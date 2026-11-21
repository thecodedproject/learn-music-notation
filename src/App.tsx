import { useCallback, useEffect, useState } from "react"
import { CHAPTERS, findLesson, nextLesson } from "./course"
import { ChapterView } from "./components/chapter_view"
import { Home } from "./components/home"
import { LessonPlayer } from "./components/lesson_player"
import { ProgressView } from "./components/progress_view"
import { SettingsPanel } from "./components/settings_panel"
import { go, useRoute } from "./components/use_route"
import { player } from "./lib/player"
import { dayKey } from "./lib/history"
import { EMPTY_PROGRESS, loadProgress, logLesson, Progress, recordScore, saveProgress } from "./lib/progress"
import { applyTheme, loadSettings, loadTheme, saveSettings, Settings, Theme } from "./lib/settings"
import "./App.css"

export default function App(): JSX.Element {
  const route = useRoute()
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    player.volume = settings.volume
  }, [settings])

  useEffect(() => applyTheme(theme), [theme])

  const changeSettings = (changes: Partial<Settings>) => setSettings(s => ({ ...s, ...changes }))
  const updateProgress = (p: Progress) => {
    setProgress(p)
    saveProgress(p)
  }
  const closeSettings = useCallback(() => setShowSettings(false), [])

  let screen: JSX.Element
  if (route.screen == "lesson") {
    const ref = findLesson(route.chapterId, route.lessonIndex)
    if (ref == undefined) {
      screen = <NotFound />
    } else {
      const next = nextLesson(ref)
      screen = (
        <LessonPlayer
          key={`${route.chapterId}/${route.lessonIndex}`}
          lessonRef={ref}
          settings={settings}
          onFinish={score => setProgress(p => {
            const updated = logLesson(recordScore(p, ref.lesson.id, score, ref.isTest), dayKey(new Date()))
            saveProgress(updated)
            return updated
          })}
          onQuit={() => go({ screen: "chapter", chapterId: ref.chapter.id })}
          onNext={next && (() => go({ screen: "lesson", ...next }))}
        />
      )
    }
  } else if (route.screen == "chapter") {
    const index = CHAPTERS.findIndex(c => c.id == route.chapterId)
    screen = index == -1
      ? <NotFound />
      : <ChapterView chapter={CHAPTERS[index]} index={index} progress={progress} />
  } else if (route.screen == "progress") {
    screen = <ProgressView progress={progress} goal={settings.weeklyGoal} />
  } else {
    screen = <Home progress={progress} goal={settings.weeklyGoal} />
  }

  const inLesson = route.screen == "lesson"
  return (
    <div className={`app${inLesson ? " inLesson" : ""}`}>
      {!inLesson && (
        <header className="appHeader">
          <button type="button" className="brand" onClick={() => go({ screen: "home" })}>
            <BrandMark />
            Stave
          </button>
          <button type="button" className="iconButton" onClick={() => setShowSettings(true)} aria-label="Settings">
            <GearIcon />
          </button>
        </header>
      )}
      <main className="appMain">{screen}</main>
      {showSettings && (
        <SettingsPanel
          settings={settings}
          theme={theme}
          onChange={changeSettings}
          onTheme={setTheme}
          onResetProgress={() => updateProgress(EMPTY_PROGRESS)}
          onClose={closeSettings}
        />
      )}
    </div>
  )
}

// the logo is a crotchet on a little stave
function BrandMark(): JSX.Element {
  return (
    <svg className="brandMark" viewBox="0 0 28 24" aria-hidden="true">
      {[4, 8, 12, 16, 20].map(y => <line key={y} x1={1} x2={27} y1={y} y2={y} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />)}
      <ellipse cx={11} cy={16} rx={4.2} ry={3} transform="rotate(-20 11 16)" fill="var(--accent)" />
      <line x1={14.8} x2={14.8} y1={15} y2={2} stroke="var(--accent)" strokeWidth={1.8} />
    </svg>
  )
}

function NotFound(): JSX.Element {
  return (
    <div className="notFound">
      <p>That page doesn't exist.</p>
      <button type="button" className="primary" onClick={() => go({ screen: "home" })}>Go to the chapters</button>
    </div>
  )
}

function GearIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}
