import { NotePlayer, SequenceNote } from "music-lib/audio"
import { Pitch, midiNumber } from "music-lib/theory"

// the one player the whole app plays through
export const player = new NotePlayer()

// phrase turns pitches into steps for the player: a beat each, the last held for two
export function phrase(pitches: Pitch[]): SequenceNote[] {
  return pitches.map((p, i) => ({ midi: [midiNumber(p)], beats: i == pitches.length - 1 ? 2 : 1 }))
}

// how long to wait for the answer's chime before playing the notes back
export const AFTER_CHIME = 450 // ms

let waiting: ReturnType<typeof setTimeout> | undefined
let playing: Promise<void> = Promise.resolve()

// playPhrase plays the pitches, after a delay if one is given, resolving once they have
// finished (or been stopped)
export function playPhrase(pitches: Pitch[], bpm: number, delay = 0): Promise<void> {
  stopPlaying()
  playing = new Promise(resolve => {
    const go = () => {
      waiting = undefined
      player.playSequence(phrase(pitches), { bpm }).then(resolve)
    }
    if (delay > 0) {
      waiting = setTimeout(go, delay)
      // stopping before it starts resolves it too
      cancelWaiting = () => resolve()
    } else {
      go()
    }
  })
  return playing
}

let cancelWaiting: (() => void) | undefined

// stopPlaying cuts off whatever is playing, or about to
export function stopPlaying() {
  if (waiting != undefined) {
    clearTimeout(waiting)
    waiting = undefined
    cancelWaiting?.()
  }
  cancelWaiting = undefined
  player.stop()
}

// whenQuiet resolves once the phrase playing now has finished
export function whenQuiet(): Promise<void> {
  return playing
}
