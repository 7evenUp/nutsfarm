export interface Boost {
  bonusType:
    | "FARMING_DURATION"
    | "POINTS_PER_SECOND"
    | "ALL_TIME_CLAIMED_POINT_BENEFIT"
    | "CRYPTON_SUBSCRIPTION"
  duration: number
  durationType: string
  howReceive: string
  lang: "RU" | "EN"
  price: number
  title: string
  value: number
}
