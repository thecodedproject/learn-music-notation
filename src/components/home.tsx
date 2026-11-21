import { CHAPTERS } from "../course"
import { Progress } from "../lib/progress"
import { WeekCard } from "./progress_view"
import { go } from "./use_route"

// Home lists the chapters, each with how far through it the learner is. All of them
// are open, whatever has been done.
export function Home({ progress, goal }: { progress: Progress, goal: number }): JSX.Element {
  return (
    <div className="home">
      <div className="homeHero">
        <h1>Learn to read music</h1>
        <p>Short lessons, a few minutes each. Read notes, write them on the stave, and train your ear, from your first note on the treble clef to melodies by ear.</p>
      </div>
      <WeekCard progress={progress} goal={goal} />
      <ol className="chapterList">
        {CHAPTERS.map((chapter, i) => {
          const done = chapter.lessons.filter(l => progress.lessons[l.id]?.completed).length
          const passed = progress.lessons[chapter.test.id]?.completed ?? false
          const fraction = (done + (passed ? 1 : 0)) / (chapter.lessons.length + 1)
          return (
            <li key={chapter.id}>
              <button type="button" className="chapterCard" onClick={() => go({ screen: "chapter", chapterId: chapter.id })}>
                <span className="chapterNumber">{i + 1}</span>
                <span className="chapterInfo">
                  <span className="chapterTitle">{chapter.title}</span>
                  <span className="chapterDescription">{chapter.description}</span>
                  <span className="chapterProgress">
                    <span className="miniBar"><span style={{ width: `${fraction * 100}%` }} /></span>
                    <span className="chapterProgressText">
                      {passed ? "Test passed ✓" : `${done} of ${chapter.lessons.length} lessons`}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="moreSoon">More chapters coming soon.</p>
    </div>
  )
}
