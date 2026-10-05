export interface ReferralResponse {
  items: ReferralInfo[]
  page: number
  size: number
  total: number
}

export interface ReferralInfo {
  balance: number
  firstname: string
  id: string
  referralCount: number
  telegramPicture: string | null
  username: string | null
  nextNotificationTime: string | null
}
