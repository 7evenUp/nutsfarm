export interface FarmingStatus {
  lastFarmingFinishAt: number | null
  lastFarmingStartAt: number | null
  lastFarmingId: number | null
  status: "FARMING" | "READY_TO_FARM" | "READY_TO_CLAIM"
  claimAmount: number
  nutcrackerBoostPercent: number | null
  nutcrackerBonusInHour: number | null
}

export interface Retrodrop {
  cryptonGlobalId: number
  telegramId: number
  communityLegend?: {
    tokens: number
  }
  cryptonRetroDrop: {
    nutcrackers: {
      common: {
        count: string
        tokens: number
      }
      uncommon: {
        count: string
        tokens: number
      }
      rare: {
        count: string
        tokens: number
      }
      mythical: {
        count: string
        tokens: number
      }
      legendary: {
        count: string
        tokens: number
      }
      epic: {
        count: string
        tokens: number
      }
    }
    accountPrizesFromWEB3XMS: {
      group: string
      token: number
    }
    researchUser: {
      tokens: number
    }
    subscriptions: {
      primeActiveUserBonus: {
        nonUsedMonths: number
        tokens: number
      }
      primeCurrentActiveUserBonus: {
        tokens: number
      }
      nonSubscribedPrimer: {
        tokens: number
      }
      calendar: {
        tokens: number
      }
    }
    accountCreationDateGroup: {
      group: string
      tokens: number
    }
    paidReferrals: {
      count: string
      group: string
      tokens: number
    }
    calendarUser: {
      group: string
      tokens: number
    }
    accountFillStatus: {
      group: string
      tokens: number
    }
  }
  cryptonRetroDropAmount: number
  claimed: boolean
}
