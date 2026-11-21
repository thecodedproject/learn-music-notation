import { Exercise } from "../../lib/lesson_gen"
import { Settings } from "../../lib/settings"

export interface ExerciseProps<E extends Exercise = Exercise> {
  exercise: E
  settings: Settings
  locked: boolean // answered: no more changes
  onAnswer: (correct: boolean) => void
}
