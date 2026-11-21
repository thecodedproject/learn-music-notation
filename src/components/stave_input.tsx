import { positionAtY, positionY, staveSpace, StaveLayout } from "music-lib/react"
import { Clef, KeySignature, NamingSystem, Pitch, letterNames, noteLabel, pitchAtPosition, stavePosition } from "music-lib/theory"
import { KeyboardEvent, PointerEvent, useRef, useState } from "react"
import { Score } from "./score"
import "./stave_input.css"

export interface StaveInputProps {
  clef: Clef
  keySignature: KeySignature
  // notes shown before the ones to write, which can't be moved
  given: Pitch[]
  // the note written in each slot, if any
  value: (Pitch | undefined)[]
  onChange: (value: (Pitch | undefined)[]) => void
  // the stave positions notes can be placed between
  extent: [number, number]
  accidentals: boolean
  locked: boolean
  // once answered, whether each slot was right
  marks?: boolean[]
  naming: NamingSystem
  // whether to show the name of the note being dragged
  showName?: boolean
  // called as a note is placed or moved, to sound it
  onSound?: (p: Pitch) => void
}

// where an empty slot's ghost note is drawn: the middle line
const MIDDLE = 4

// StaveInput is a stave to write notes on. Press in a slot's column and drag up or down to
// choose the note; let go to place it. A tap on a written note selects it, to nudge it a
// step with the arrows or give it a sharp or flat.
export function StaveInput(props: StaveInputProps): JSX.Element {
  const { clef, keySignature, given, value, onChange, extent, accidentals, locked, marks, naming, showName = true, onSound } = props
  const [selected, setSelected] = useState(() => Math.max(0, value.findIndex(v => v == undefined)))
  const [dragging, setDragging] = useState<number>()
  const layoutRef = useRef<StaveLayout>()
  const [lo, hi] = extent

  const clamp = (pos: number) => Math.max(lo, Math.min(hi, pos))

  // set writes a note in a slot, sounding it if it's new
  const set = (slot: number, p: Pitch | undefined) => {
    const old = value[slot]
    const next = [...value]
    next[slot] = p
    onChange(next)
    if (p != undefined && (old == undefined || stavePosition(old, clef) != stavePosition(p, clef) || old.accidental != p.accidental)) {
      onSound?.(p)
    }
  }

  const placeAt = (slot: number, pos: number) => {
    const old = value[slot]
    // keep the sharp or flat given to a note that hasn't moved
    if (old != undefined && stavePosition(old, clef) == pos) {
      return
    }
    set(slot, pitchAtPosition(clamp(pos), clef, keySignature))
  }

  const nextEmpty = (from: number) => {
    for (let i = 1; i <= value.length; i++) {
      const j = (from + i) % value.length
      if (value[j] == undefined) {
        return j
      }
    }
    return from
  }

  // the position to start from when there's no note in the slot yet: the note before
  const startPos = (slot: number) => {
    for (let i = slot - 1; i >= 0; i--) {
      const p = value[i]
      if (p != undefined) return stavePosition(p, clef)
    }
    const g = given[given.length - 1]
    return g != undefined ? stavePosition(g, clef) : MIDDLE
  }

  const nudge = (steps: number) => {
    const p = value[selected]
    placeAt(selected, (p == undefined ? startPos(selected) - steps : stavePosition(p, clef)) + steps)
  }

  const setAccidental = (accidental: number) => {
    const p = value[selected]
    if (p != undefined) {
      set(selected, { ...p, accidental: p.accidental == accidental ? 0 : accidental })
    }
  }

  // placeLetter writes the letter nearest the note before
  const placeLetter = (letter: number) => {
    const from = startPos(selected)
    let best: number | undefined
    for (let pos = lo; pos <= hi; pos++) {
      if (pitchAtPosition(pos, clef).letter == letter && (best == undefined || Math.abs(pos - from) < Math.abs(best - from))) {
        best = pos
      }
    }
    if (best != undefined) {
      placeAt(selected, best)
      setSelected(nextEmpty(selected))
    }
  }

  // the point in the stave's own units under a pointer
  const svgPoint = (e: PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!
    const ctm = svg.getScreenCTM()
    if (ctm == null) return undefined
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(ctm.inverse())
  }

  // slotAt is the slot whose column is nearest x
  const slotAt = (x: number) => {
    const slots = layoutRef.current!.events.slice(given.length)
    let best = 0
    slots.forEach((ev, i) => {
      if (Math.abs(ev.x - x) < Math.abs(slots[best].x - x)) best = i
    })
    return best
  }

  const onPointerDown = (e: PointerEvent<SVGRectElement>) => {
    if (locked) return
    const pt = svgPoint(e)
    if (pt == undefined) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const slot = slotAt(pt.x)
    setSelected(slot)
    setDragging(slot)
    placeAt(slot, positionAtY(pt.y))
  }

  const onPointerMove = (e: PointerEvent<SVGRectElement>) => {
    if (dragging == undefined) return
    const pt = svgPoint(e)
    if (pt != undefined) placeAt(dragging, positionAtY(pt.y))
  }

  const onPointerUp = () => {
    if (dragging == undefined) return
    setDragging(undefined)
    setSelected(nextEmpty(dragging))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return
    const letter = letterNames.indexOf(e.key.toUpperCase())
    if (letter != -1 && e.key.length == 1) {
      placeLetter(letter)
    } else if (e.key == "ArrowUp") {
      nudge(1)
    } else if (e.key == "ArrowDown") {
      nudge(-1)
    } else if (e.key == "ArrowLeft") {
      setSelected(s => Math.max(0, s - 1))
    } else if (e.key == "ArrowRight") {
      setSelected(s => Math.min(value.length - 1, s + 1))
    } else if (e.key == "Backspace" || e.key == "Delete") {
      set(selected, undefined)
    } else if (accidentals && (e.key == "#" || e.key == "+")) {
      setAccidental(1)
    } else if (accidentals && e.key == "-") {
      // b and f are letters, so a flat is typed as a minus
      setAccidental(-1)
    } else {
      return
    }
    e.preventDefault()
  }

  const notes: Pitch[] = [
    ...given,
    ...value.map(v => v ?? pitchAtPosition(MIDDLE, clef, keySignature)),
  ]
  const classes: Record<number, string> = {}
  given.forEach((_, i) => classes[i] = "given")
  value.forEach((v, i) => {
    const idx = given.length + i
    if (marks != undefined) {
      classes[idx] = v == undefined ? "ghost" : marks[i] ? "correct" : "wrong"
    } else {
      classes[idx] = [v == undefined ? "ghost" : "", !locked && i == selected ? "selected" : ""].join(" ").trim()
    }
  })

  const draggingPitch = dragging != undefined ? value[dragging] : undefined

  const overlay = (layout: StaveLayout) => {
    layoutRef.current = layout
    const slots = layout.events.slice(given.length)
    if (slots.length == 0) return null
    const half = slots.length > 1 ? (slots[1].x - slots[0].x) / 2 : 30
    const x1 = slots[0].x - half
    const x2 = slots[slots.length - 1].x + half
    const sel = slots[selected]
    return (
      <g className="staveInputOverlay">
        {!locked && sel != undefined && (
          <rect className="slotColumn" x={sel.x - Math.min(half, 22)} width={2 * Math.min(half, 22)} y={layout.top} height={layout.bottom - layout.top} rx={6} />
        )}
        {showName && draggingPitch != undefined && dragging != undefined && slots[dragging] && (
          <g className="dragLabel">
            <rect x={slots[dragging].x - 17} y={layout.top + 2} width={34} height={20} rx={10} />
            <text x={slots[dragging].x} y={layout.top + 16}>{noteLabel(draggingPitch, naming)}</text>
          </g>
        )}
        <rect
          className="hitArea"
          x={x1}
          width={x2 - x1}
          y={Math.min(layout.top, positionY(hi) - staveSpace)}
          height={Math.max(layout.bottom, positionY(lo) + staveSpace) - Math.min(layout.top, positionY(hi) - staveSpace)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </g>
    )
  }

  const selectedPitch = value[selected]
  return (
    <div className={`staveInput${locked ? " locked" : ""}`} tabIndex={locked ? -1 : 0} onKeyDown={onKeyDown}
      aria-label="Stave: drag up and down in a slot to choose a note, or type its letter">
      <Score clef={clef} keySignature={keySignature} notes={notes} classes={classes} extent={extent} overlay={overlay} size="large" />
      {!locked && (
        <div className="staveTools">
          <button type="button" className="toolButton" onClick={() => nudge(1)} aria-label="Move the note up a step">▲</button>
          <button type="button" className="toolButton" onClick={() => nudge(-1)} aria-label="Move the note down a step">▼</button>
          {accidentals && (
            <>
              <button type="button" className={`toolButton${selectedPitch?.accidental == 1 ? " on" : ""}`} onClick={() => setAccidental(1)} aria-label="Sharp" disabled={selectedPitch == undefined}>♯</button>
              <button type="button" className={`toolButton${selectedPitch?.accidental == -1 ? " on" : ""}`} onClick={() => setAccidental(-1)} aria-label="Flat" disabled={selectedPitch == undefined}>♭</button>
            </>
          )}
          <button type="button" className="toolButton" onClick={() => set(selected, undefined)} aria-label="Clear the note" disabled={selectedPitch == undefined}>⌫</button>
        </div>
      )}
    </div>
  )
}
