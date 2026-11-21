import { NotePlayer, SequenceNote } from "music-lib/audio"
import { Pitch, midiNumber } from "music-lib/theory"

// the one player the whole app plays through
export const player = new NotePlayer()

// phrase turns pitches into steps for the player: a beat each, the last held for two
export function phrase(pitches: Pitch[]): SequenceNote[] {
  return pitches.map((p, i) => ({ midi: [midiNumber(p)], beats: i == pitches.length - 1 ? 2 : 1 }))
}

// playPhrase plays the pitches, resolving once they have finished (or been stopped)
export function playPhrase(pitches: Pitch[], bpm: number): Promise<void> {
  return player.playSequence(phrase(pitches), { bpm })
}

// stopPlaying cuts off whatever is playing
export function stopPlaying() {
  player.stop()
}
