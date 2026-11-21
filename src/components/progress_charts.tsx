import { dayKey, Week } from "../lib/history"
import "./progress.css"

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"]

export function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

export function lessonsText(n: number): string {
  return `${n} lesson${n == 1 ? "" : "s"}`
}

// DayBars shows a week's lessons day by day, the count over each day that has any
export function DayBars({ week, today }: { week: Week, today: Date }): JSX.Element {
  const todayKey = dayKey(today)
  const max = Math.max(3, ...week.days.map(d => d.count))
  return (
    <div className="dayBars" role="img" aria-label={week.days.map(d => `${d.date.toLocaleDateString(undefined, { weekday: "long" })} ${d.count}`).join(", ")}>
      {week.days.map((d, i) => {
        const future = d.key > todayKey
        return (
          <div
            key={d.key}
            className={`dayBar${d.key == todayKey ? " today" : ""}${future ? " future" : ""}`}
            title={`${d.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}: ${lessonsText(d.count)}`}
          >
            <div className="dayBarPlot">
              {d.count > 0 && <span className="dayBarValue">{d.count}</span>}
              <span className="dayBarFill" style={{ height: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="dayBarLabel">{DAY_LETTERS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

interface WeekBarsProps {
  weeks: Week[]
  goal: number
  selected: string
  onSelect: (key: string) => void
}

// WeekBars shows a run of weeks against the goal; a week at goal is drawn green, and
// picking a week shows its days
export function WeekBars({ weeks, goal, selected, onSelect }: WeekBarsProps): JSX.Element {
  const max = Math.max(goal, ...weeks.map(w => w.total)) * 1.1
  return (
    <div className="weekChart">
      <div className="weekPlot" style={{ gap: weeks.length > 30 ? 2 : 6 }}>
        <div className="goalLine" style={{ bottom: `${(goal / max) * 100}%` }}>
          <span>Goal {goal}</span>
        </div>
        {weeks.map(w => (
          <button
            key={w.key}
            type="button"
            className={`weekBar${w.key == selected ? " selected" : ""}${w.total >= goal ? " met" : ""}`}
            onClick={() => onSelect(w.key)}
            title={`Week of ${shortDate(w.start)}: ${lessonsText(w.total)}${w.total >= goal ? " ✓ goal met" : ""}`}
            aria-label={`Week of ${shortDate(w.start)}, ${lessonsText(w.total)}${w.total >= goal ? ", goal met" : ""}`}
            aria-pressed={w.key == selected}
          >
            <span className="weekBarFill" style={{ height: `${(w.total / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="weekAxis">
        <span>{shortDate(weeks[0].start)}</span>
        <span>{weeks.length > 1 ? "This week" : ""}</span>
      </div>
    </div>
  )
}
