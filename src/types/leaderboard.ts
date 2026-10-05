export interface LeaderboardResponse {
  items: LeaderboardUser[]
  page: number
  size: number
  total: number
}

export interface LeaderboardUser {
  id: string
  balance: number
  telegramPicture: string
  referralCount: number
  firstname: string
  lastname: string
  donationCount: number
  nutPassXpBalance: number
}
