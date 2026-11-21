import { useEffect, useState } from "react"
import { NamingSystem } from "music-lib/theory"
import { playPhrase, player } from "../lib/player"
import { parsePitches } from "../lib/music"
import {
  MAX_EXERCISES, MAX_GOAL, MIN_EXERCISES, MIN_GOAL, NAMINGS, Settings, TEMPO_BPM, Tempo, TEMPOS, Theme,
} from "../lib/settings"
import { CloseIcon } from "./lesson_player"

interface Props {
  settings: Settings
  theme: Theme
  onChange: (changes: Partial<Settings>) => void
  onTheme: (theme: Theme) => void
  onResetProgress: () => void
  onClose: () => void
}

const TEMPO_LABELS: Record<Tempo, string> = { slow: "Slow", normal: "Normal", fast: "Fast" }
const NAMING_LABELS: Record<NamingSystem, string> = { letters: "C D E", solfege: "Do Re Mi" }

export function SettingsPanel({ settings, theme, onChange, onTheme, onResetProgress, onClose }: Props): JSX.Element {
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key == "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const sample = (tempo = settings.tempo) => {
    player.volume = settings.volume
    playPhrase(parsePitches("C4 E4 G4"), TEMPO_BPM[tempo])
  }

  return (
    <div className="sheetBackdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Settings" onClick={e => e.stopPropagation()}>
        <header className="sheetHeader">
          <h2>Settings</h2>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Close settings"><CloseIcon /></button>
        </header>

        <section className="setting">
          <span className="settingLabel">Note names</span>
          <div className="segmented">
            {NAMINGS.map(n => (
              <button key={n} type="button" className={settings.naming == n ? "selected" : ""} onClick={() => onChange({ naming: n })}>
                {NAMING_LABELS[n]}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <span className="settingLabel">Ear training tempo</span>
          <div className="segmented">
            {TEMPOS.map(t => (
              <button key={t} type="button" className={settings.tempo == t ? "selected" : ""} onClick={() => { onChange({ tempo: t }); sample(t) }}>
                {TEMPO_LABELS[t]}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <span className="settingLabel">Sound notes as you name or place them</span>
          <div className="segmented">
            {[true, false].map(on => (
              <button key={String(on)} type="button" className={settings.playWhilePlacing == on ? "selected" : ""} onClick={() => onChange({ playWhilePlacing: on })}>
                {on ? "On" : "Off"}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="volume">Volume <span className="settingValue">{Math.round(settings.volume * 100)}%</span></label>
          <input
            id="volume" type="range" min={0} max={1} step={0.05} value={settings.volume}
            onChange={e => onChange({ volume: Number(e.target.value) })}
            onPointerUp={() => sample()} onKeyUp={() => sample()}
          />
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="goal">Weekly goal <span className="settingValue">{settings.weeklyGoal} lessons</span></label>
          <input
            id="goal" type="range" min={MIN_GOAL} max={MAX_GOAL} step={1} value={settings.weeklyGoal}
            onChange={e => onChange({ weeklyGoal: Number(e.target.value) })}
          />
        </section>

        <section className="setting">
          <label className="settingLabel" htmlFor="count">Exercises per lesson <span className="settingValue">{settings.exerciseCount}</span></label>
          <input
            id="count" type="range" min={MIN_EXERCISES} max={MAX_EXERCISES} step={1} value={settings.exerciseCount}
            onChange={e => onChange({ exerciseCount: Number(e.target.value) })}
          />
        </section>

        <section className="setting">
          <span className="settingLabel">Theme</span>
          <div className="segmented">
            {(["light", "dark"] as Theme[]).map(t => (
              <button key={t} type="button" className={theme == t ? "selected" : ""} onClick={() => onTheme(t)}>
                {t == "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </section>

        <section className="setting">
          <button
            type="button"
            className={`danger${confirmReset ? " confirming" : ""}`}
            onClick={() => {
              if (confirmReset) {
                onResetProgress()
                setConfirmReset(false)
              } else {
                setConfirmReset(true)
              }
            }}
            onBlur={() => setConfirmReset(false)}
          >
            {confirmReset ? "Tap again to wipe all progress" : "Reset progress"}
          </button>
        </section>
      </div>
    </div>
  )
}
