import { ActiveTask } from "./task"

export interface Module {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: string
  color: string
  isActive: boolean
  isPublished: boolean
  pageNumber: number
  createdAt: string
  updatedAt: string
  lessons: Lesson[]
  mascots: Mascot[]
  tasks: ActiveTask[]
  // isPremium?: boolean
  starsPrice: number | null
  tonPrice: number | null
  tonPriceFull: number | null
  usdPrice: number | null
  isPurchased: boolean | null
  preview?: string[]
  previewEn?: string[]
}

export interface LessonProgress {
  type: "easy" | "full"
  lastpage: number
  lessonId: string
}

export interface LessonsProgressState {
  [lessonId: string]: LessonProgress
}

export interface Lesson {
  moduleId?: string
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  reward: number
  mark: null | number
  nutPassXp: number
  createdAt: string
  updatedAt: string
  pageNumber: number
  blocks: Block[] | null
  isClaimed: boolean
  isSharingClaimed: boolean
  submoduleNumber: number
  submoduleTitle: string
  submoduleTitleEn: string
  starsPrice: number
  tonPrice: number
  tonPriceFull: number
  usdPrice: number
  isPurchased: boolean | null | undefined
}

export interface Block {
  id: string
  type: "QUIZ" | "GAME" | "INFO"
  body: any // Можно уточнить тип, если известно
  bodyEn: any // Аналогично
  image: string
  imageEn: string
  createdAt: string
  updatedAt: string
  pageNumber: number
  buttons: LearnButton[]
}

export interface LearnButton {
  blockId?: string
  type: "NEXT_BUTTON" | "LINK" | "REF_LINK"
  lang: "RU" | "EN"
  title: string
  link: string
}

export interface Learn {
  image: string
  imageEn: string
  bgColor: string
  buttons: LearnButton[]
}

export interface Mascot {
  id: string
  image: string
  pageNumber: number
  submoduleNumber: number | null
}

export interface Quiz {
  question?: string
  answers?: Array<{ text: string; isCorrect: boolean }>
  buttons: LearnButton[]
}

export interface MatchingGame {
  description?: string
  matchers?: Match[]
  buttons: LearnButton[]
}

export interface Match {
  word: string
  definition: string
}

export interface HealthPoints {
  remainingLives: number
  nextRestore: string | null
}
