import { Achievement } from "./achievements"
import { Nutcracker } from "./nutcracker"

export interface PublicProfileResponse {
  id: string
  firstname: string
  lastname: string
  avatar: string
  createdAt: string
  currentStreak: number
  maxStreak: number
  lessonPassed: number
  lessonMistakePercent: number
  xpAmount: number
  referralCount: number
  gameLevelPassed: number
  nutcrackers: Nutcracker[]
  achievements: Achievement[]
}
