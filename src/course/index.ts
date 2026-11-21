import { chapter1 } from "./chapter1"
import { chapter2 } from "./chapter2"
import { chapter3 } from "./chapter3"
import { chapter4 } from "./chapter4"
import { chapter5 } from "./chapter5"
import { chapter6 } from "./chapter6"
import { chapter7 } from "./chapter7"
import { chapter8 } from "./chapter8"
import { chapter9 } from "./chapter9"
import { ChapterDef, LessonDef } from "./types"

export const CHAPTERS: ChapterDef[] = [
  chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9,
]

// a lesson's place in the course; the test is the lesson after the last
export interface LessonRef {
  chapter: ChapterDef
  chapterIndex: number
  lesson: LessonDef
  lessonIndex: number // chapter.lessons.length for the test
  isTest: boolean
}

export function findLesson(chapterId: string, lessonIndex: number): LessonRef | undefined {
  const chapterIndex = CHAPTERS.findIndex(c => c.id == chapterId)
  const chapter = CHAPTERS[chapterIndex]
  if (chapter == undefined || lessonIndex < 0 || lessonIndex > chapter.lessons.length) {
    return undefined
  }
  const isTest = lessonIndex == chapter.lessons.length
  return { chapter, chapterIndex, lesson: isTest ? chapter.test : chapter.lessons[lessonIndex], lessonIndex, isTest }
}

// nextLesson is the one after, running on into the next chapter
export function nextLesson(ref: LessonRef): { chapterId: string, lessonIndex: number } | undefined {
  if (!ref.isTest) {
    return { chapterId: ref.chapter.id, lessonIndex: ref.lessonIndex + 1 }
  }
  const next = CHAPTERS[ref.chapterIndex + 1]
  return next && { chapterId: next.id, lessonIndex: 0 }
}

// allLessons lists every lesson and test in the course, in order
export function allLessons(): LessonRef[] {
  return CHAPTERS.flatMap(c => [...Array(c.lessons.length + 1)].map((_, j) => findLesson(c.id, j)!))
}
