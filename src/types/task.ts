export interface UserTask {
  balanceRequired: boolean | null
  description: string
  executionNumber: number
  icon: string
  id: string
  isActive: boolean
  isTgPremiumRequired: boolean | null
  link: string
  partnerIcon: string | null
  partnerName: string | null
  referralsCountGoal: number | null
  reward: number
  nutPassXp: number | null
  status: "PENDING" | "COMPLETED" | "VERIFYING" | "CLAIMED"
  taskCompletionLimit: number | null
  taskId: string
  telegramChannelId: number | null
  translationTelegramChannelId: number | null
  title: string
  objectId: string | null
  type: TaskType
  onManualChecking: boolean
  executionCount: number | null
  executionIntervalDays: number | null
  executionIntervalHours: number | null
  lastExecutionDate: string | null
  lastExecutionDateTime: string | null
  value: number | null
}

export interface ActiveTask {
  icon: string
  id: string
  lang: "RU" | "EN"
  link: string
  title: string
  task: Task
}

export interface Task {
  balanceRequired: boolean | null
  id: string
  isActive: boolean
  isTgPremiumRequired: boolean | null
  partnerIcon: string | null
  partnerName: string | null
  referralsCountGoal: number | null
  reward: number
  nutPassXp: number | null
  storyId: string | null
  taskCompletionLimit: number | null
  telegramChannelId: number | null
  type: TaskType
  objectId: string | null
  executionIntervalDays: number | null
  executionIntervalHours: number | null
  lastExecutionDate: string | null
  lastExecutionDateTime: string | null
  value: number | null
}

export type TaskType =
  | "URL"
  | "TELEGRAM_CHANNEL_SUBSCRIPTION"
  | "STORIES"
  | "CRYPTON_ONBOARDING"
  | "RECRUIT_REFERRALS"
  | "PARTNER_SUBSCRIPTION"
  | "USER_ANSWER"
  | "LEARN_LESSON"
  | "MANUAL_USER_ANSWER"
  | "MANUAL_UGC"
  | "FARM"
  | "NOTIFICATION"
  | "ALL_FRIENDS_NOTIFICATION"
  | "HOME_SCREEN_ICON"
  | "SOUL_PARTNER_SUBSCRIPTION"
  | "NUT_PASS_PURCHASE"
  | "NUT_PASS_REACH_LEVEL"
  | "RECEIVE_NFT"
  | "APP_CENTER_VOTE"
  | "CRYPTLE_WIN_IN_N_STEPS"
  | "CRYPTLE_USE_HINT"
  | "SPIN_WHEEL_WIN_NFT"
  | "SPIN_WHEEL_WIN_JACKPOT"
  | "COMPLETE_GAME_LEVELS"
  | "COMPLETE_HARD_GAME_LEVELS"
  | "SPIN_WHEEL"
  | "TG_ADS_TASK"
  | "TG_ADS_TASK_DAILY"
  | "CAPS_GAME_PARTNER_COMPLETED_COLLECTION"

export interface ClaimResponse {
  executionNumber: number | null
  id: string
  isClaimedPreviously: boolean | null
  lang: "RU" | "EN"
  status: "PENDING" | "COMPLETED" | "VERIFYING" | "CLAIMED"
  task: Task
}

export interface ClaimPayload {
  type: TaskType
  userTaskId: string
  cryptonOnboardingAnswer?: string
  userAnswer?: string
  telegramChannelId?: number
  lessonId?: number
  timezone?: string
}
