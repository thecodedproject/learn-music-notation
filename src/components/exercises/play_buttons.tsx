import { Pitch } from "music-lib/theory"
import { useEffect, useState } from "react"
import { playPhrase, stopPlaying } from "../../lib/player"
import { TEMPO_BPM, Tempo } from "../../lib/settings"
import { SpeakerIcon, TortoiseIcon } from "./icons"

const AUTOPLAY_DELAY = 450 // ms: let the exercise slide in first

// PlayButtons plays a phrase as the exercise appears, and again (or slowly) on demand
export function PlayButtons({ pitches, tempo, autoplay = true }: { pitches: Pitch[], tempo: Tempo, autoplay?: boolean }): JSX.Element {
  const [playing, setPlaying] = useState(false)

  const play = (slow = false) => {
    setPlaying(true)
    playPhrase(pitches, TEMPO_BPM[tempo] * (slow ? 0.6 : 1)).then(() => setPlaying(false))
  }

  useEffect(() => {
    if (!autoplay) return
    const timer = setTimeout(() => play(), AUTOPLAY_DELAY)
    return () => {
      clearTimeout(timer)
      stopPlaying()
    }
  }, [])

  return (
    <div className="playButtons">
      <button type="button" className={`playBig${playing ? " playing" : ""}`} onClick={() => play()} aria-label="Play again">
        <SpeakerIcon />
      </button>
      <button type="button" className="playSlow" onClick={() => play(true)} aria-label="Play slowly" title="Play slowly">
        <TortoiseIcon />
      </button>
    </div>
  )
}
