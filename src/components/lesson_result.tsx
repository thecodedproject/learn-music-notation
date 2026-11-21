import { PASS_MARK } from "../course/types"
import { Confetti } from "./confetti"

interface Props {
  score: number // 0-1
  isTest: boolean
  title: string
  onRetry: () => void
  onNext?: () => void
  onBack: () => void
}

// LessonResult gives the score, with more celebration the better it is
export function LessonResult({ score, isTest, title, onRetry, onNext, onBack }: Props): JSX.Element {
  const percent = Math.round(score * 100)
  const passed = score >= PASS_MARK
  const level = percent == 100 ? 3 : score >= PASS_MARK ? 2 : score >= 0.5 ? 1 : 0
  const [headline, message] = verdict(percent, isTest, passed)

  return (
    <div className="lessonResult">
      <Confetti level={level} />
      <div className="resultBody">
        <p className="eyebrow">{title}</p>
        <div className={`resultScore level${level}`}>
          <ScoreRing score={score} />
          <span className="resultPercent">{percent}%</span>
        </div>
        <h1>{headline}</h1>
        <p className="resultMessage">{message}</p>
      </div>
      <div className="resultActions">
        {onNext && (!isTest || passed) && (
          <button type="button" className="primary big" onClick={onNext}>
            {isTest ? "Next chapter" : "Next lesson"}
          </button>
        )}
        <button type="button" className={onNext && (!isTest || passed) ? "secondary big" : "primary big"} onClick={onRetry}>
          {isTest && !passed ? "Try the test again" : "Practise again"}
        </button>
        <button type="button" className="linkButton" onClick={onBack}>Back to the chapter</button>
      </div>
    </div>
  )
}

function verdict(percent: number, isTest: boolean, passed: boolean): [string, string] {
  if (isTest) {
    if (percent == 100) return ["Flawless!", "A perfect test. This chapter is yours."]
    if (passed) return ["Test passed!", `You needed ${PASS_MARK * 100}% and got ${percent}%. On to the next chapter!`]
    return ["Not this time", `You need ${PASS_MARK * 100}% to pass. Go over a lesson or two and try again.`]
  }
  if (percent == 100) return ["Perfect!", "Every single one right. Brilliant."]
  if (percent >= 80) return ["Great work!", "You've really got the hang of these."]
  if (percent >= 50) return ["Good effort", "Getting there. Another go will make it stick."]
  return ["Keep practising", "Reading music takes time. Have another go at this lesson."]
}

function ScoreRing({ score }: { score: number }): JSX.Element {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg className="scoreRing" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={r} className="scoreRingTrack" />
      <circle
        cx="60" cy="60" r={r}
        className="scoreRingFill"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score)}
        transform="rotate(-90 60 60)"
      />
    </svg>
  )
}
