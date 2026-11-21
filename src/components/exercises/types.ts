import { Pitch } from "music-lib/theory"
import { Exercise } from "../../lib/lesson_gen"
import { Settings } from "../../lib/settings"

export interface ExerciseProps<E extends Exercise = Exercise> {
  exercise: E
  settings: Settings
  locked: boolean // answered: no more changes
  revealed: boolean // whether the answer was right has been shown
  // playBack is played before the answer is revealed, for exercises answered by ear: what
  // was heard (or written) once more, to compare with what's shown next
  onAnswer: (correct: boolean, playBack?: Pitch[]) => void
}
