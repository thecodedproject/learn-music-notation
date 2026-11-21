import "./choice_tiles.css"

interface Props {
  choices: string[]
  onPick: (choice: string) => void
  locked: boolean
  picked?: string // once answered, the one chosen
  answer?: string // once answered, the right one
}

// ChoiceTiles answers a question with one of a few choices, a tap each
export function ChoiceTiles({ choices, onPick, locked, picked, answer }: Props): JSX.Element {
  return (
    <div className={`choiceTiles${choices.some(c => c.length > 4) ? " wide" : ""}`}>
      {choices.map(c => {
        const state = !locked ? "" : c == answer ? " correct" : c == picked ? " wrong" : " faded"
        return (
          <button key={c} type="button" className={`choiceTile${state}`} onClick={() => onPick(c)} disabled={locked}>
            {c}
          </button>
        )
      })}
    </div>
  )
}
