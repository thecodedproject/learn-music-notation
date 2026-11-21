import { useMemo, useState } from "react"
import { addDays, dayKey, parseDayKey, recentWeeks, startOfWeek, summarize, weekOf } from "../lib/history"
import { Progress } from "../lib/progress"
import { DayBars, lessonsText, shortDate, WeekBars } from "./progress_charts"
import { go } from "./use_route"

const RECENT_WEEKS = 12

// GoalMeter is the week's lessons so far against the goal
function GoalMeter({ total, goal }: { total: number, goal: number }): JSX.Element {
  return (
    <span className={`goalMeter${total >= goal ? " met" : ""}`}>
      <span style={{ width: `${Math.min(1, total / goal) * 100}%` }} />
    </span>
  )
}

function goalText(total: number, goal: number, thisWeek: boolean): string {
  if (total >= goal) {
    return total > goal ? `Goal beaten by ${total - goal} 🎉` : "Goal reached 🎉"
  }
  if (!thisWeek) {
    return `${goal - total} short of the goal`
  }
  return total == 0 ? `Aim for ${lessonsText(goal)} this week` : `${lessonsText(goal - total)} to go`
}

// WeekCard is this week on the home screen; it opens the full history
export function WeekCard({ progress, goal }: { progress: Progress, goal: number }): JSX.Element {
  const today = new Date()
  const week = weekOf(progress.days, today)
  return (
    <button type="button" className="weekCard" onClick={() => go({ screen: "progress" })}>
      <span className="weekCardHead">
        <span className="weekCardTitle">This week</span>
        <span className="weekCardCount"><strong>{week.total}</strong> / {goal} <span aria-hidden="true">›</span></span>
      </span>
      <GoalMeter total={week.total} goal={goal} />
      <DayBars week={week} today={today} />
      <span className="weekCardNote">{goalText(week.total, goal, true)}</span>
    </button>
  )
}

// ProgressView is practice over time: any week day by day, recent weeks or every week
// against the goal, and totals
export function ProgressView({ progress, goal }: { progress: Progress, goal: number }): JSX.Element {
  const today = new Date()
  const [range, setRange] = useState<"recent" | "all">("recent")
  const [selected, setSelected] = useState(() => dayKey(startOfWeek(today)))

  const allWeeks = useMemo(() => recentWeeks(progress.days, today), [progress.days])
  const recent = useMemo(() => recentWeeks(progress.days, today, RECENT_WEEKS), [progress.days])
  const shown = range == "all" && allWeeks.length > 1 ? allWeeks : recent
  const summary = summarize(allWeeks, goal)

  const thisWeek = dayKey(startOfWeek(today))
  const earliest = allWeeks.length > recent.length ? allWeeks[0].key : recent[0].key
  const week = weekOf(progress.days, parseDayKey(selected))
  const isThisWeek = week.key == thisWeek
  const step = (weeks: number) => setSelected(dayKey(addDays(week.start, 7 * weeks)))

  return (
    <div className="progressView">
      <button type="button" className="backLink" onClick={() => go({ screen: "home" })}>← All chapters</button>
      <h1>Your progress</h1>

      <section className="progressPanel">
        <div className="weekNav">
          <button type="button" className="iconButton" onClick={() => step(-1)} disabled={week.key <= earliest} aria-label="Week before">‹</button>
          <span className="weekNavTitle">
            <strong>{isThisWeek ? "This week" : `Week of ${shortDate(week.start)}`}</strong>
            <span>{shortDate(week.start)} – {shortDate(addDays(week.start, 6))}</span>
          </span>
          <button type="button" className="iconButton" onClick={() => step(1)} disabled={isThisWeek} aria-label="Week after">›</button>
        </div>
        <div className="weekTotal">
          <span><strong>{week.total}</strong> of {goal} lessons</span>
          <span className="weekTotalNote">{goalText(week.total, goal, isThisWeek)}</span>
        </div>
        <GoalMeter total={week.total} goal={goal} />
        <DayBars week={week} today={today} />
      </section>

      <section className="progressPanel">
        <div className="panelHead">
          <h2>Weeks</h2>
          <div className="segmented small">
            <button type="button" className={range == "recent" ? "selected" : ""} onClick={() => setRange("recent")}>{RECENT_WEEKS} weeks</button>
            <button type="button" className={range == "all" ? "selected" : ""} onClick={() => setRange("all")}>All time</button>
          </div>
        </div>
        <WeekBars weeks={shown} goal={goal} selected={week.key} onSelect={setSelected} />
      </section>

      <section className="statGrid" aria-label="All time">
        <Stat value={summary.total} label="lessons in all" />
        <Stat value={summary.activeDays} label={summary.activeDays == 1 ? "day practised" : "days practised"} />
        <Stat value={summary.weeksAtGoal} label={summary.weeksAtGoal == 1 ? "week at goal" : "weeks at goal"} />
        <Stat value={summary.streak} label={summary.streak == 1 ? "week streak" : "weeks in a row"} />
        <Stat value={summary.bestWeek} label="best week" />
        <Stat value={summary.bestDay} label="best day" />
      </section>
      <p className="hintText">Every lesson and test you finish counts, whatever the score. Change your goal in settings.</p>
    </div>
  )
}

function Stat({ value, label }: { value: number, label: string }): JSX.Element {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
