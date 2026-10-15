import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import type { UserGameLevelDifficultyInfo } from "@/types/games"
import type { InventoryItem } from "@/types/inventory"
import type { UserTask } from "@/types/task"
import type { UserTransaction } from "@/types/user"
import type { Reward } from "@/types/nutspass"
import {
  assembleParts,
  boosters,
  gameInventory,
  gameLevels,
  images,
  initialUser,
  modules,
  passRewards,
  paymentItems,
  tasks,
  wheelRewards,
} from "./fixtures"
import { DEMO_STORAGE_KEY, readStorage, writeStorage } from "./storage"

const FARMING_REWARD = 100

function createState() {
  return structuredClone({
    version: 3,
    wheelSpins: 0,
    starsSpent: 0,
    user: initialUser,
    stars: 50000,
    energy: 100,
    spins: 15,
    paidSpins: 5,
    spinProgress: 0,
    started: [] as UserGameLevelDifficultyInfo[],
    claimedRewards: [] as string[],
    boxRewards: {} as Record<string, Reward>,
    inventory: [
      {
        id: "9000",
        userId: 1337,
        objectId: 1,
        link: "",
        icon: "",
        title: "Demo Nutcracker",
        titleEn: "Demo Nutcracker",
        image: images.nft,
        imageEn: images.nft,
        description: "Коллекционный приз демо",
        descriptionEn: "Demo collectible",
        isMintActive: true,
        mintPriceStars: 25,
        mintPriceTon: 0,
        mintPriceTonFull: 0,
        mintPrizeAmount: 1000,
        mintPrizeXpAmount: 100,
        type: "NFT",
        status: "READY_TO_CLAIM",
      },
    ] as InventoryItem[],
    boosters,
    parts: assembleParts,
    gameInventory,
    modules,
    tasks: [] as UserTask[],
    transactions: [] as UserTransaction[],
    achievements: [
      {
        id: 1,
        type: "FARM_ClAIM",
        title: "Первый урожай",
        titleEn: "First harvest",
        description: "Забери первую награду",
        descriptionEn: "Claim your first reward",
        image: images.coin,
        imageEn: images.coin,
        isActive: true,
        reward: 1000,
        nutPassXp: 250,
        isHidden: false,
        userStatus: "RECEIVED",
      },
    ],
    farming: { start: 0, finish: 0, claimed: false },
    streakClaimDate: "",
    streakDaysMissed: 0,
    streakDayNumber: 7,
    streakFrozenDays: [] as number[],
    payments: {} as Record<
      string,
      {
        itemId: number
        quantity: number
        objectId?: string
        status: "CREATED" | "SUCCESS"
        stars: number
      }
    >,
    referralPoints: 5000,
    lastReferralClaim: "2026-01-01T12:00:00Z",
    lives: 5,
    notifiedAt: null as string | null,
    refLinks: {} as Record<string, string>,
    templates: {} as Record<string, Record<string, boolean>>,
  })
}
type DemoState = ReturnType<typeof createState>
function restore(): DemoState {
  try {
    const saved = JSON.parse(readStorage(DEMO_STORAGE_KEY) || "null")
    if (
      saved?.version === 3 &&
      saved.user &&
      Array.isArray(saved.started) &&
      saved.payments
    )
      return {
        ...saved,
        // Existing saves keep their streak when new fields are introduced.
        streakDaysMissed: saved.streakDaysMissed ?? 0,
        streakDayNumber: saved.streakDayNumber ?? 7,
        streakFrozenDays: saved.streakFrozenDays ?? [],
      }
  } catch {
    /* A damaged or outdated save starts a fresh demo. */
  }
  return createState()
}
let state = restore()
writeStorage(DEMO_STORAGE_KEY, JSON.stringify(state))
export function demoSummary() {
  return {
    stars: state.stars,
    energy: state.energy,
    spins: state.spins,
    paidSpins: state.paidSpins,
  }
}
function save() {
  writeStorage(DEMO_STORAGE_KEY, JSON.stringify(state))
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("nutsfarm:demo-updated"))
}
export function resetDemo() {
  state = createState()
  save()
}
export function startDemoStreak(daysMissed: 0 | 1 | 2) {
  state.streakClaimDate = ""
  state.streakDaysMissed = daysMissed
  state.streakDayNumber = 7
  state.streakFrozenDays = []
  save()
}
export function refillDemo() {
  state.stars = 50000
  state.energy = 100
  state.spins = Math.max(state.spins, 15)
  state.paidSpins = Math.max(state.paidSpins, 5)
  state.user.balance = Math.max(state.user.balance, 250000)
  save()
}
function reject(message: string): never {
  throw new Error(message)
}
function credit(
  amount: number,
  xp = 0,
  action: UserTransaction["action"] = "OTHER",
) {
  state.user.balance += amount
  state.user.nutPassXpBalance += xp
  if (amount)
    state.transactions.unshift({
      amount: Math.abs(amount),
      type: amount >= 0 ? "DEPOSIT" : "WITHDRAW",
      action,
      createdAt: new Date().toISOString(),
    })
}
function addNFT(title = "Demo NFT", image = images.nft) {
  const item = structuredClone(state.inventory[0] || createState().inventory[0])
  state.inventory.push({
    ...item,
    id: String(Date.now() * 1000 + Math.floor(Math.random() * 1000)),
    title,
    titleEn: title,
    image,
    imageEn: image,
    status: "READY_TO_CLAIM",
  })
  state.user.isInventoryNotificationReceived = false
}
function applyReward(reward: Reward) {
  if (reward.type === "TOKENS") credit(reward.amount, 0, "NUT_PASS_REWARD")
  if (reward.type === "ENERGY") state.energy += reward.amount
  if (reward.type === "NFT") addNFT(reward.name, reward.image)
  if (reward.type === "ASSEMBLE_PART")
    state.parts[0].userAmount += reward.amount
  if (reward.type === "BOOSTER")
    state.boosters.push({
      ...reward.boost,
      userBoostId: Date.now(),
      isActive: false,
    })
}
export async function completeDemoPayment(url: string): Promise<"paid"> {
  const id = url.split("/").pop() || ""
  const payment = state.payments[id]
  if (!payment) reject("Демо-платёж не найден")
  if (payment.status === "SUCCESS") return "paid"
  const item = paymentItems.find((p) => p.id === payment.itemId)!
  if (state.stars < payment.stars)
    reject("Пополните демо-Stars через кнопку «Демо»")
  state.stars -= payment.stars
  state.starsSpent += payment.stars
  const amount = (item.amount || 1) * payment.quantity
  if (item.type === "NUT_PASS") state.user.isNutPassActive = true
  if (item.type === "LEVELS") state.user.nutPassXpBalance += amount * 1000
  if (item.type === "GAME_ENERGY") state.energy += amount
  if (item.type === "PAID_SPIN_WHEEL") state.paidSpins += amount
  if (
    item.type === "GAME_INVENTORY_ITEM" &&
    !state.gameInventory.some(
      (p) => p.objectId === item.objectId && p.type === item.gameInventoryType,
    )
  ) {
    state.gameInventory.push({
      id: item.id,
      userId: 1337,
      objectId: item.objectId,
      title: item.title,
      titleEn: item.titleEn,
      image: item.image,
      imageEn: item.imageEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      type: item.gameInventoryType,
      pack: item.cardsPack
        ? ({
            ...item.cardsPack,
            isDefault: false,
          } as (typeof gameInventory)[number]["pack"])
        : null,
    })
  }
  if (item.type === "UNLOCK_MODULE") {
    const module = state.modules.find(
      (m) => m.id === (payment.objectId || String(item.objectId)),
    )
    if (module) {
      module.isPurchased = true
      module.lessons.forEach((l) => (l.isPurchased = true))
    }
  }
  if (item.type === "UNLOCK_LESSON")
    state.modules
      .flatMap((m) => m.lessons)
      .forEach((l) => {
        if (l.id === payment.objectId) l.isPurchased = true
      })
  if (
    item.type === "INVENTORY_ITEM" ||
    item.type === "UNLOCK_INVENTORY_CLAIM"
  ) {
    const nft = state.inventory.find((n) => n.id === payment.objectId)
    if (nft && nft.status !== "CLAIMED") {
      nft.status = "CLAIMED"
      credit(nft.mintPrizeAmount, nft.mintPrizeXpAmount, "NUT_PASS_REWARD")
    }
  }
  if (item.type === "DROP_DISCOUNT") {
    const template = state.templates[payment.objectId || ""] || {}
    if (template.buyNutPass) state.user.isNutPassActive = true
    if (template.buyCourse)
      state.modules.forEach((m) => {
        m.isPurchased = true
        m.lessons.forEach((l) => (l.isPurchased = true))
      })
    if (template.buyPassLevel) state.user.nutPassXpBalance += 10000
    if (template.buyGames) state.energy += 100
    if (template.buyWheels) state.paidSpins += 10
    if (template.buyNftMints) addNFT()
  }
  payment.status = "SUCCESS"
  save()
  return "paid"
}

function request(args: string | FetchArgs): unknown {
  const config = typeof args === "string" ? { url: args } : args
  const url = new URL(config.url.replace(/^\//, ""), "https://demo.invalid/")
  Object.entries(config.params || {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })
  const path = url.pathname.slice(1)
  const param = (key: string) => url.searchParams.get(key) || ""
  const body = (config.body || {}) as Record<
    string,
    string | number | boolean | object
  >
  const post = config.method === "POST"
  const paginate = <T>(items: T[]) => {
    const page = Math.max(1, Number(param("page")) || 1)
    const size = Math.max(1, Number(param("size")) || 25)
    return {
      items: items.slice((page - 1) * size, page * size),
      page,
      size,
      total: items.length,
    }
  }
  const levelRewards = () =>
    passRewards.map((r) => ({
      ...r,
      status: state.claimedRewards.includes(r.id)
        ? "CLAIMED"
        : r.level <= Math.floor(state.user.nutPassXpBalance / 1000) + 1 &&
            (!r.isNutPassRequired || state.user.isNutPassActive)
          ? "READY_FOR_CLAIM"
          : "NOT_ACHIEVED",
      boxClaimReward: state.boxRewards[r.id],
    }))
  const streakDay = (dayNumber: number) => ({
    dayNumber,
    nutsReward: dayNumber * 100,
    bonusPercentage: 10,
    showBonusPercentage: true,
    percentageLvl: 1,
    isMilestone: dayNumber % 7 === 0,
    mileStoneType: "NUTS",
    nutDashRank: "BRONZE",
    additionalReward: null,
  })
  const streakInfo = () => ({
    daysMissed: state.streakDaysMissed,
    missedDaysFreezeCost: state.streakDaysMissed * 500,
    todayStreakInfo: streakDay(state.streakDayNumber),
    lastUserStreakDay: {
      id: 1,
      userId: 1337,
      currentStreak: state.streakDayNumber,
      dropStreakAfter: new Date(Date.now() + 86400000).toISOString(),
      createdAt: "2026-01-01T12:00:00Z",
    },
    streakDays: Array.from({ length: state.streakDayNumber }, (_, i) => ({
      day: new Date(
        Date.now() - (state.streakDayNumber - 1 - i) * 86400000,
      ).toISOString(),
      hasEnter:
        !state.streakFrozenDays.includes(i + 1) &&
        !(
          state.streakDaysMissed > 0 &&
          i >= state.streakDayNumber - 1 - state.streakDaysMissed &&
          i < state.streakDayNumber - 1
        ),
      freezing: state.streakFrozenDays.includes(i + 1),
    })),
    streakRewardReceivedToday:
      state.streakClaimDate === new Date().toISOString().slice(0, 10),
  })

  if (path === "user/current") return state.user
  if (path === "nutpass/rewards") return paginate(levelRewards())
  if (path === "nutpass/rewards/claim") {
    const row = levelRewards().find((r) => r.id === param("rewardId"))
    if (!row || row.status !== "READY_FOR_CLAIM")
      reject("Награда пока недоступна или уже получена")
    const reward =
      row.reward.type === "BOX"
        ? row.reward.boxBody![
            Math.floor(Math.random() * row.reward.boxBody!.length)
          ]
        : row.reward
    state.claimedRewards.push(row.id)
    state.boxRewards[row.id] = reward
    applyReward(reward)
    return [reward]
  }
  if (path === "game/current/energy")
    return {
      gameEnergy: state.energy,
      energyFullRecoverTime: new Date(Date.now() + 3600000).toISOString(),
    }
  if (path === "game/current/started")
    return state.started.filter((l) => l.gameType === param("type"))
  if (path === "game/current/started-test")
    return paginate(state.started.filter((l) => l.gameType === param("type")))
  if (path === "game/current/active")
    return paginate(
      gameLevels.filter(
        (l) =>
          l.gameType === param("type") &&
          !state.started.some((s) => s.gameLevelId === String(l.id)),
      ),
    )
  if (path === "game/start") {
    const level = gameLevels.find((l) =>
      l.difficulties.some((d) => d.id === body.gameLevelDifficultyId),
    )
    const difficulty = level?.difficulties.find(
      (d) => d.id === body.gameLevelDifficultyId,
    )
    if (!level || !difficulty) reject("Уровень не найден")
    const existing = state.started.find(
      (s) =>
        s.gameLevelDifficultyId === difficulty.id && s.status === "PENDING",
    )
    if (existing) return existing
    const bet = Math.max(0, Number(body.bet) || 0)
    if (
      state.energy < difficulty.energyPrice ||
      state.user.balance < difficulty.price + bet
    )
      reject("Недостаточно ресурсов. Пополните их через кнопку «Демо»")
    state.energy -= difficulty.energyPrice
    credit(-difficulty.price - bet, 0, "GAME")
    state.spinProgress += difficulty.energyPrice
    while (state.spinProgress >= 20) {
      state.spinProgress -= 20
      state.spins++
    }
    const started: UserGameLevelDifficultyInfo = {
      id: crypto.randomUUID(),
      status: "PENDING",
      gameType: level.gameType,
      level: level.level,
      bet,
      betRatio: Number(body.betRatio) || 1,
      gameLevelDifficultyId: difficulty.id,
      gameLevelId: String(level.id),
      gameLevelTitle: level.title,
      gameLevelDescription: level.description,
      gameLevelImage: level.image,
      gameLevelBody: level.body,
      difficulty: difficulty.difficulty,
      gameLevelDifficultyBody: difficulty.body,
      price: difficulty.price,
      energyPrice: difficulty.energyPrice,
      reward:
        difficulty.reward *
        (level.gameType === "CARDS"
          ? state.gameInventory.find(
              (p) =>
                p.objectId === Number(body.gameCardsPackId) &&
                p.type === "CARDS_PACK",
            )?.pack?.bonus || 1
          : 1),
      nutPassXp: difficulty.nutPassXp,
    }
    // Replace a failed attempt so maps contain one current record per difficulty.
    state.started = state.started.filter(
      (s) => s.gameLevelDifficultyId !== difficulty.id,
    )
    state.started.push(started)
    return started
  }
  if (path === "game/claim" || path === "game/fail") {
    const level = state.started.find((l) => l.id === body.id)
    if (!level) reject("Игра не найдена")
    if (level.status !== "PENDING") return level
    level.status = path === "game/claim" ? "COMPLETED" : "FAILED"
    if (body.gameStats)
      level.gameStats =
        body.gameStats as UserGameLevelDifficultyInfo["gameStats"]
    if (level.status === "COMPLETED")
      credit(
        level.reward + (body.isBetWin ? level.bet * level.betRatio : 0),
        level.nutPassXp,
        "GAME",
      )
    return level
  }
  if (/^game\/\d+$/.test(path))
    return gameLevels.find((l) => l.id === Number(path.split("/")[1]))
  if (path === "inventory/current/game") return state.gameInventory
  if (path === "wheel/current/spins")
    return {
      spinsCount: state.spins,
      paidSpins: state.paidSpins,
      energyForNextSpin: 20 - state.spinProgress,
    }
  if (path === "wheel/rewards") return wheelRewards
  if (path === "wheel/jackpot") return 50000
  if (path === "wheel/spin" || path === "wheel/spin/paid") {
    const paid = path.endsWith("paid"),
      count = Math.min(100, Math.max(1, Number(param("amount")) || 1))
    const key = paid ? "paidSpins" : "spins"
    if (state[key] < count) reject("Недостаточно билетов")
    state[key] -= count
    state.wheelSpins += count
    return Array.from({ length: count }, () => {
      const pool = wheelRewards.filter((r) => r.isPaidWheel === paid)
      const r = pool[Math.floor(Math.random() * pool.length)]
      if (r.type === "NUTS" || r.type === "JACKPOT")
        credit(r.amount, 0, "WHEEL_REWARD")
      if (r.type === "GAME_ENERGY") state.energy += r.amount
      if (r.type === "NUT_PASS_XP") state.user.nutPassXpBalance += r.amount
      if (r.type === "NFT") addNFT()
      if (r.type === "BOOSTER")
        state.boosters.push({
          ...boosters[0],
          userBoostId: Date.now() + Math.random(),
          isActive: false,
        })
      return r
    })
  }
  if (path === "payment/items")
    return paymentItems.filter(
      (p) => !param("type") || p.type === param("type"),
    )
  if (/^payment\/item\/[^/]+\/(stars|ton|nuts)$/.test(path)) {
    const item = paymentItems.find((p) => p.id === Number(path.split("/")[2]))
    if (!item) reject("Товар не найден")
    const quantity = Math.min(1000, Math.max(1, Number(param("quantity")) || 1))
    const id = crypto.randomUUID()
    state.payments[id] = {
      itemId: item.id,
      quantity,
      objectId: param("objectId") || undefined,
      status: "CREATED",
      stars: item.starsPrice * quantity,
    }
    if (path.endsWith("nuts")) {
      if (state.user.balance < item.nutsPrice) reject("Недостаточно орехов")
      credit(-item.nutsPrice, 0, "NUTS_PURCHASE")
      state.payments[id].stars = 0
      // The caller opens the same local invoice after creating a nuts payment.
      void completeDemoPayment(`demo://payment/${id}`)
    }
    return { transactionId: id, paymentFormUrl: `demo://payment/${id}` }
  }
  if (/^payment\/transaction\/[^/]+\/status$/.test(path))
    return state.payments[path.split("/")[2]]?.status || "FAILED"
  if (path === "payment/donations/gifts") return []
  if (path === "payment/donations/lesson") return null
  if (path === "inventory/current") return state.inventory
  if (
    path.startsWith("inventory/claim/") ||
    path.startsWith("inventory/mint/")
  ) {
    const item = state.inventory.find((i) => i.id === path.split("/").pop())
    if (
      item &&
      item.status !== "CLAIMED" &&
      path.startsWith("inventory/mint/")
    ) {
      if ((state.user.freeNftMints || 0) <= 0)
        reject("Нет бесплатных активаций")
      state.user.freeNftMints = (state.user.freeNftMints || 0) - 1
    }
    if (item && item.status !== "CLAIMED") {
      item.status = "CLAIMED"
      credit(item.mintPrizeAmount, item.mintPrizeXpAmount, "NUT_PASS_REWARD")
    }
    return null
  }
  if (path === "items/boost/current") return state.boosters
  if (/^items\/boost\/\d+\/activate$/.test(path)) {
    const booster = state.boosters.find(
      (b) => b.userBoostId === Number(path.split("/")[2]),
    )
    if (booster && !booster.isActive) {
      booster.isActive = true
      booster.activatedAt = new Date().toISOString()
      if (booster.bonusType === "POINTS_ONCE_BONUS")
        credit(booster.value, 0, "BOOST")
      else if (booster.bonusType === "XP_BONUS")
        state.user.nutPassXpBalance += 500
      else
        state.user.boosts.push({
          ...booster,
          lang: state.user.lang,
          bonusType: booster.bonusType,
        })
    }
    return null
  }
  if (path === "items/assemble/current") return state.parts
  if (path.startsWith("items/assemble/")) {
    const part = state.parts.find((p) => p.id === Number(path.split("/").pop()))
    if (!part || part.userAmount < part.assemblePartsAmount)
      reject("Недостаточно фрагментов")
    part.userAmount -= part.assemblePartsAmount
    addNFT(part.title)
    return {
      id: part.id,
      type: part.type,
      nftId: part.nftId,
      title: part.title,
      image: part.image,
    }
  }
  if (path === "nutcracker/current")
    return ["rare", "epic", "legendary"].map((rarity, i) => ({
      id: i + 1,
      ownerTelegramId: "1337",
      name: ["Explorer", "Collector", "Nuts King"][i],
      imageLink: images.nft,
      nutcrackerIndex: String(i + 1),
      rarity,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      rarityBonus: {
        rarity,
        farmMinutesTime: 10 + i * 5,
        farmBonusPercent: 10 + i * 10,
      },
    }))
  if (path.startsWith("nutcracker/") && path.endsWith("picture/set")) {
    state.user.telegramPicture = images.nft
    return images.nft
  }
  if (path === "user/current/picture/roll") {
    state.user.telegramPicture = images.nft
    return images.nft
  }
  if (path === "farming/current")
    return {
      lastFarmingStartAt: state.farming.start || null,
      lastFarmingFinishAt: state.farming.finish || null,
      lastFarmingId: 1,
      status: !state.farming.start
        ? "READY_TO_FARM"
        : state.farming.finish <= Date.now()
          ? "READY_TO_CLAIM"
          : "FARMING",
      claimAmount: FARMING_REWARD,
      nutcrackerBoostPercent: 0,
      nutcrackerBonusInHour: 0,
    }
  if (path === "farming/farm") {
    if (!state.farming.start)
      state.farming = {
        start: Date.now(),
        finish: Date.now() + 30000,
        claimed: false,
      }
    return null
  }
  if (path === "farming/claim") {
    if (!state.farming.start || state.farming.finish > Date.now())
      reject("Урожай ещё не готов")
    credit(FARMING_REWARD, 100, "FARM")
    state.farming = { start: 0, finish: 0, claimed: true }
    return null
  }
  if (path === "farming/startBonus") {
    if (!state.user.isStartBonusClaimed) {
      credit(10000)
      state.user.isStartBonusClaimed = true
    }
    return 10000
  }
  if (path === "streak/map")
    return Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [String(i + 1), streakDay(i + 1)]),
    )
  if (path === "streak/current/info") return streakInfo()
  if (path === "streak/current/claim") {
    if (!streakInfo().streakRewardReceivedToday) {
      const resetStreak =
        state.streakDaysMissed > 0 && param("payForFreeze") !== "true"
      if (state.streakDaysMissed > 0) {
        if (param("payForFreeze") === "true") {
          const cost = streakInfo().missedDaysFreezeCost
          if (state.user.balance < cost)
            reject("Недостаточно орехов для заморозки")
          credit(-cost)
          for (let missed = state.streakDaysMissed; missed > 0; missed--) {
            state.streakFrozenDays.push(state.streakDayNumber - missed)
          }
        } else {
          state.streakDayNumber = 1
          state.streakFrozenDays = []
        }
        state.streakDaysMissed = 0
      }
      if (!resetStreak)
        credit(
          streakDay(state.streakDayNumber).nutsReward,
          100,
          "DAILY_STREAK_REWARD",
        )
      state.streakClaimDate = new Date().toISOString().slice(0, 10)
    }
    return streakInfo()
  }
  if (path === "streak/current/reward/list") return []
  if (path.startsWith("streak/current/reward/claim/")) return null
  if (path === "learn/active") return state.modules
  if (path === "learn/lives")
    return { remainingLives: state.lives, nextRestore: null }
  if (path === "learn/lives/decrement") {
    state.lives = Math.max(0, state.lives - 1)
    return null
  }
  if (path.startsWith("learn/claim/")) {
    const l = state.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === path.split("/").pop())
    if (l && !l.isClaimed) {
      l.isClaimed = true
      credit(l.reward, l.nutPassXp, "LEARN")
    }
    return null
  }
  if (path.startsWith("learn/rate/")) {
    const l = state.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === path.split("/").pop())
    if (l) l.mark = Number(param("mark"))
    return null
  }
  if (path.startsWith("learn/share/")) {
    const l = state.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === path.split("/").pop())
    if (l && !l.isSharingClaimed) {
      l.isSharingClaimed = true
      credit(250)
    }
    return null
  }
  if (path === "learn/premium-chat-link") return "/earn"
  if (path === "task/active")
    return tasks.filter((t) => !state.tasks.some((s) => s.taskId === t.task.id))
  if (path === "task/current") return state.tasks
  if (path === "task/start") {
    const t = tasks.find((t) => t.task.id === body.taskId)
    if (!t) reject("Задание не найдено")
    const existing = state.tasks.find((s) => s.taskId === t.task.id)
    if (existing) return existing
    const started: UserTask = {
      ...t.task,
      id: crypto.randomUUID(),
      taskId: t.task.id,
      title: t.title,
      description: t.title,
      icon: t.icon,
      link: t.link,
      status: "COMPLETED",
      executionNumber: 1,
      executionCount: 1,
      onManualChecking: false,
      translationTelegramChannelId: null,
    }
    state.tasks.push(started)
    return started
  }
  if (path === "task/claim") {
    const t = state.tasks.find((t) => t.id === body.userTaskId)
    if (!t) reject("Задание не найдено")
    if (t.status !== "CLAIMED") {
      t.status = "CLAIMED"
      credit(t.reward, t.nutPassXp || 0, "TASK")
    }
    return {
      ...t,
      task: tasks.find((a) => a.task.id === t.taskId)?.task,
      isClaimedPreviously: false,
      lang: state.user.lang,
    }
  }
  if (path === "achievement/current") return state.achievements
  if (/^achievement\/\d+\/claim$/.test(path)) {
    const a = state.achievements.find(
      (a) => a.id === Number(path.split("/")[1]),
    )
    if (a && a.userStatus !== "CLAIMED") {
      a.userStatus = "CLAIMED"
      credit(a.reward, a.nutPassXp, "ACHIEVEMENT")
    }
    return null
  }
  if (path === "achievement/easter/egg/click") return null
  if (path.endsWith("notification/hide")) {
    state.user.isInventoryNotificationReceived = true
    state.user.isNewAchievementReceived = false
    state.user.isNewNutPassReward = false
    state.user.isNewTaskNotificationReceived = false
    return null
  }
  if (path === "user/current/lang/update") {
    state.user.lang = param("lang") === "EN" ? "EN" : "RU"
    return null
  }
  if (path === "user/current/onboarding/update") {
    state.user.isCryptonOnboardingPassed = true
    return null
  }
  if (path === "user/push/start/send") {
    state.user.isNutPassStartPushReceived = true
    return null
  }
  if (
    path === "user/current/utm/update" ||
    path === "user/current/registerUnion"
  )
    return null
  if (path === "user/tonWallet") return null
  if (path === "user/current/transactions") return paginate(state.transactions)
  const leaders = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"].map(
    (firstname, i) => ({
      id: `demo-${i}`,
      firstname,
      lastname: "",
      balance: 500000 - i * 50000,
      telegramPicture: images.nft,
      referralCount: 20 - i * 2,
      donationCount: 1000 - i * 100,
      nutPassXpBalance: 30000 - i * 2000,
    }),
  )
  if (path === "user/current/referrals")
    return paginate(
      leaders.map((l) => ({
        ...l,
        username: l.firstname.toLowerCase(),
        nextNotificationTime: null,
      })),
    )
  if (path === "user/current/referrals/amount") return state.referralPoints
  if (path === "user/current/referrals/time") return state.lastReferralClaim
  if (path === "user/current/referrals/claim") {
    const amount = state.referralPoints
    credit(amount, 0, "REFERRAL")
    state.referralPoints = 0
    state.lastReferralClaim = new Date().toISOString()
    return amount
  }
  if (path.startsWith("top/")) {
    if (path.endsWith("position"))
      return path.includes("donation") || path.includes("without-donation")
        ? { donationCount: 500, place: "7" }
        : "7"
    return paginate([
      ...leaders,
      {
        ...leaders[0],
        id: state.user.id,
        firstname: state.user.firstname,
        balance: state.user.balance,
        nutPassXpBalance: state.user.nutPassXpBalance,
      },
    ])
  }
  if (path.startsWith("user/info/"))
    return {
      id: path.split("/").pop(),
      firstname: "Demo",
      lastname: "Player",
      avatar: images.nft,
      createdAt: "2026-01-01",
      currentStreak: 7,
      maxStreak: 7,
      lessonPassed: state.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.isClaimed).length,
      lessonMistakePercent: 0,
      xpAmount: state.user.nutPassXpBalance,
      referralCount: 6,
      gameLevelPassed: state.started.filter((l) => l.status === "COMPLETED")
        .length,
      nutcrackers: [],
      achievements: state.achievements,
    }
  if (path === "notification/time") return state.notifiedAt
  if (path.startsWith("notification/send")) {
    state.notifiedAt = new Date(Date.now() + 86400000).toISOString()
    return null
  }
  if (path === "influencer/ref/exchanges") return ["Binance", "Bybit", "OKX"]
  if (path === "influencer/ref/links") {
    if (post) {
      state.refLinks = body as Record<string, string>
      return null
    }
    return state.refLinks
  }
  if (path === "story/active" || path === "story/current") return []
  if (path.startsWith("story/read/")) return 0
  if (path.startsWith("story/"))
    return {
      id: path.split("/")[1],
      title: "Nuts Farm",
      titleEn: "Nuts Farm",
      description: "Демо коллекции",
      descriptionEn: "Demo collection",
      expiredAt: Date.now() + 86400000,
      lang: state.user.lang,
      storyType: "PUBLIC",
      pointsBonus: 0,
      image: images.nft,
      imageEn: images.nft,
      pageNumber: 1,
      storyParts: [
        {
          id: "demo-story",
          storyId: 1,
          title: "Nuts Farm",
          titleEn: "Nuts Farm",
          description: "Демо коллекции",
          descriptionEn: "Demo collection",
          image: images.nft,
          imageEn: images.nft,
          pointsBonus: 0,
          buttonText: "Посмотреть награды",
          buttonTextEn: "See rewards",
          url: "/pass",
          urlEn: "/pass",
        },
      ],
    }
  if (path === "farming/drop/info")
    return {
      cryptonGlobalId: 1337,
      telegramId: 1337,
      cryptonRetroDropAmount: 10000,
      claimed: state.user.isCryptonRetroDropClaimed,
      cryptonRetroDrop: {
        nutcrackers: Object.fromEntries(
          ["common", "uncommon", "rare", "mythical", "legendary", "epic"].map(
            (rarity) => [rarity, { count: "1", tokens: 1000 }],
          ),
        ),
        accountPrizesFromWEB3XMS: { group: "Demo", token: 1000 },
        researchUser: { tokens: 500 },
        subscriptions: {
          primeActiveUserBonus: { nonUsedMonths: 1, tokens: 500 },
          primeCurrentActiveUserBonus: { tokens: 500 },
          nonSubscribedPrimer: { tokens: 500 },
          calendar: { tokens: 500 },
        },
        accountCreationDateGroup: { group: "Demo", tokens: 500 },
        paidReferrals: { count: "6", group: "Demo", tokens: 500 },
        calendarUser: { group: "Demo", tokens: 500 },
        accountFillStatus: { group: "Demo", tokens: 500 },
      },
    }
  if (path === "farming/drop/claim") {
    if (!state.user.isCryptonRetroDropClaimed) {
      credit(10000)
      state.user.isCryptonRetroDropClaimed = true
    }
    return null
  }
  const criteriaTypes = [
    "PASSED_LESSONS",
    "PURCHASE_MODULE",
    "PURCHASE_NUT_PASS",
    "NUT_PASS_LEVELS",
    "STREAK_DAYS",
    "PAYS_IN_STARS",
    "ACHIEVEMENTS",
    "XP_AMOUNT",
    "LEVELS_PASSED",
    "WHEEL_SPINS",
    "NUTCRACKER",
    "TASK_COMPLETED",
    "MINT_NFT",
    "CUPS_NFT",
  ]
  if (path === "drop/progress") {
    const amounts = [
      state.modules.flatMap((m) => m.lessons).filter((l) => l.isClaimed).length,
      state.modules.filter((m) => m.isPurchased && m.starsPrice).length,
      Number(state.user.isNutPassActive),
      Math.floor(state.user.nutPassXpBalance / 1000) + 1,
      7,
      state.starsSpent,
      state.achievements.filter((a) => a.userStatus === "CLAIMED").length,
      state.user.nutPassXpBalance,
      state.started.filter((l) => l.status === "COMPLETED").length,
      state.wheelSpins,
      0,
      state.tasks.filter((t) => t.status === "CLAIMED").length,
      state.inventory.filter((n) => n.status === "CLAIMED").length,
      state.inventory.length,
    ]
    return criteriaTypes.map((type, i) => ({
      type,
      userLvl: Math.min(
        5,
        Math.floor(amounts[i] / (type === "XP_AMOUNT" ? 1000 : 2)),
      ),
      userAmount: amounts[i],
      maxTimes: 5,
      userAmountBelow: 60,
      userPercentBellow: 60,
    }))
  }
  if (path === "drop/criteria")
    return Object.fromEntries(
      criteriaTypes.map((type) => [
        type,
        Array.from({ length: 5 }, (_, i) => ({
          type,
          level: i + 1,
          amount: (i + 1) * (type === "XP_AMOUNT" ? 1000 : 2),
          usersOnLevel: 500 - i * 50,
        })),
      ]),
    )
  if (path === "drop/discount")
    return {
      id: 1,
      cohort: "Demo",
      discountPercent: 0,
      coursePrice: 100,
      coursePriceTon: 0,
      hasCourse: true,
      targetCourse: false,
      nowGames: state.started.length,
      gamesPrice: 50,
      gamesPriceTon: 0,
      targetGames: 10,
      nowNftMints: 1,
      nftMintsPrice: 25,
      nftMintsPriceTon: 0,
      targetNftMints: 3,
      nowPassLevels: Math.floor(state.user.nutPassXpBalance / 1000) + 1,
      passLevelPrice: 25,
      passLevelPriceTon: 0,
      targetPassLevel: 20,
      nowWheels: 5,
      targetWheels: 10,
      wheelsPrice: 20,
      wheelsPriceTon: 0,
      nutPassPrice: 500,
      nutPassPriceTon: 0,
      hasNutPass: state.user.isNutPassActive,
      targetNutPass: true,
      packPrice: 500,
    }
  if (path === "drop/discount/template") {
    const id = String(Date.now())
    state.templates[id] = body as Record<string, boolean>
    return Number(id)
  }
  if (path.startsWith("auth/"))
    return { accessToken: "demo", refreshToken: "demo" }
  reject(`Демо API: неизвестный маршрут ${path}`)
}

export const demoBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    const data = request(args)
    if (typeof args !== "string" && args.method === "POST") save()
    // RTK freezes responses; never hand it the mutable saved state.
    return { data: structuredClone(data === undefined ? null : data) }
  } catch (error) {
    return {
      error: {
        status: 400,
        data: {
          detail: error instanceof Error ? error.message : "Ошибка демо",
          code: "DEMO_ERROR",
        },
      },
    }
  }
}
