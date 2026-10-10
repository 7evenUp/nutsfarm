import type { UserMainInfo } from "@/types/user"
import type { GameLevel, GameInventoryItem, CardsPackBody } from "@/types/games"
import type { PurchaseItem } from "@/types/payment"
import type { Reward, LevelRewardItem } from "@/types/nutspass"
import type { WheelReward } from "@/types/wheel"
import type { Booster } from "@/types/item"
import type { AssemblePart } from "@/types/assembled-parts"
import type { Module, LearnButton } from "@/types/learn"
import type { ActiveTask } from "@/types/task"
import { encryptWord } from "@/utils/encrypt"
import coin from "@/assets/images/coin.png"
import nft from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"
import energy from "@/assets/passV2/icons/rewards/energy-reward.svg"
import box from "@/assets/passV2/icons/rewards/box_premium_closed.svg"
import boosterImage from "@/assets/assembles/xp.png"
import lessonImage from "@/assets/images/home-image.png"

const date = "2026-01-01T12:00:00.000Z"
export const images = { coin, nft, energy, box, lessonImage }
export const initialUser: UserMainInfo = {
  id: "demo-user",
  balance: 250000,
  balanceBonusPercentage: 10,
  balanceBonusPercentageLvl: 1,
  boosts: [],
  cryptonGlobalId: 1337,
  cryptonProfileUsername: "portfolio",
  firstname: "Demo",
  lastname: "Player",
  freeNftMints: 10,
  invitesLockedBefore: null,
  isCryptonOnboardingPassed: true,
  isCryptonRetroDropClaimed: true,
  isInventoryNotificationReceived: true,
  isKols: false,
  isNewTaskNotificationReceived: false,
  isNutPassActive: false,
  isStartBonusClaimed: true,
  lang: "RU",
  nutPassXpBalance: 7200,
  pictureReRollLockedBefore: null,
  referralCode: "portfolio",
  telegramId: 1337,
  telegramPicture: nft,
  tonWallet: "",
  username: "demo_player",
  isNewAchievementReceived: false,
  basePointsPerSecond: 1,
  isNutPassStartPushReceived: true,
  isNewNutPassReward: false,
}

export const boosters: Booster[] = [
  "XP_BONUS",
  "POINTS_PER_SECOND",
  "FARMING_DURATION",
  "POINTS_ONCE_BONUS",
].map((type, i) => ({
  id: i + 1,
  userBoostId: i + 1,
  title: ["Бонус XP", "Ускоритель фарма", "Длительность фарма", "Бонус орехов"][
    i
  ],
  titleEn: ["XP bonus", "Farming speed", "Farming duration", "Nuts bonus"][i],
  description: "Активируй бустер и получи бонус в демо",
  descriptionEn: "Activate for a demo bonus",
  image: boosterImage,
  imageEn: boosterImage,
  value: type === "POINTS_ONCE_BONUS" ? 5000 : 25,
  howReceive: "Nuts Pass",
  durationType: "FARM_CYCLE",
  duration: 3,
  price: 0,
  bonusType: type as Booster["bonusType"],
  activatedAt: "",
  farmingCyclesNow: 0,
  isActive: false,
}))
export const assembleParts: AssemblePart[] = [
  {
    id: 1,
    title: "Коллекционный щелкунчик",
    titleEn: "Collectible Nutcracker",
    description: "Собери 3 фрагмента",
    descriptionEn: "Collect 3 parts",
    image: nft,
    imageEn: nft,
    assemblePartsAmount: 3,
    type: "NFT",
    boost: null,
    boostId: null,
    nftId: 1,
    nft: {
      id: 1,
      title: "Demo Nutcracker",
      titleEn: "Demo Nutcracker",
      description: "Награда демо",
      descriptionEn: "Demo reward",
      image: nft,
      imageEn: nft,
    },
    createdAt: date,
    updatedAt: date,
    userAmount: 3,
  },
]

function reward(type: Reward["type"], amount: number, id: string): Reward {
  const names = {
    TOKENS: "Орехи",
    ENERGY: "Энергия",
    BOX: "Premium Box",
    NFT: "Demo Nutcracker",
    BOOSTER: "Бустер XP",
    ASSEMBLE_PART: "Фрагмент щелкунчика",
  }
  const english = {
    TOKENS: "Nuts",
    ENERGY: "Energy",
    BOX: "Premium Box",
    NFT: "Demo Nutcracker",
    BOOSTER: "XP Booster",
    ASSEMBLE_PART: "Nutcracker part",
  }
  const image =
    type === "NFT" || type === "ASSEMBLE_PART"
      ? nft
      : type === "ENERGY"
        ? energy
        : type === "BOX"
          ? box
          : type === "BOOSTER"
            ? boosterImage
            : coin
  return {
    id,
    name: names[type],
    nameEn: english[type],
    description: "Награда добавляется в твой демо-профиль",
    descriptionEn: "Added to your demo profile",
    image,
    imageEn: image,
    rarity: "RARE",
    amount,
    cryptonPrizeId: "demo",
    type,
    boxChance: 25,
    boxBody:
      type === "BOX"
        ? [
            reward("TOKENS", 10000, id + "-nuts"),
            reward("ENERGY", 25, id + "-energy"),
            reward("BOOSTER", 1, id + "-boost"),
            reward("NFT", 1, id + "-nft"),
          ]
        : null,
    assemblePart: assembleParts[0],
    boost: boosters[0],
  }
}
export const passRewards: LevelRewardItem[] = Array.from(
  { length: 60 },
  (_, i) =>
    [false, true].map((premium) => {
      const level = i + 1
      const types: Reward["type"][] = [
        "BOX",
        "TOKENS",
        "ENERGY",
        "BOOSTER",
        "ASSEMBLE_PART",
        "NFT",
      ]
      const type = types[i % types.length]
      const id = `pass-${level}-${premium ? "premium" : "free"}`
      return {
        id,
        level,
        isNutPassRequired: premium,
        reward: reward(
          type,
          type === "TOKENS"
            ? premium
              ? 10000
              : 3000
            : type === "ENERGY"
              ? 20
              : 1,
          id,
        ),
        status: "NOT_ACHIEVED" as const,
        userNutPassRequired: true as const,
      }
    }),
).flat()

// Fifteen distinct local images support all three memory-game difficulties.
const cardImages = Object.values(
  import.meta.glob("/src/assets/task-icons/*.{svg,png}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
) as string[]
export const cards: CardsPackBody[] = cardImages
  .slice(0, 20)
  .map((img, i) => ({
    img,
    title: `Card ${i + 1}`,
    titleEn: `Card ${i + 1}`,
    description: "Найди пару",
    descriptionEn: "Find the pair",
    link: "",
  }))
const pack = {
  id: "1",
  isDefault: true as const,
  title: "Крипто-карты",
  titleEn: "Crypto cards",
  image: nft,
  imageEn: nft,
  description: "Набор карт для Meta Match",
  descriptionEn: "Meta Match card pack",
  rarity: "COMMON",
  body: JSON.stringify(cards),
  bonus: 1,
}
export const gameInventory: GameInventoryItem[] = [
  {
    id: 1,
    userId: 1337,
    objectId: 1,
    title: pack.title,
    titleEn: pack.titleEn,
    image: nft,
    imageEn: nft,
    description: pack.description,
    descriptionEn: pack.descriptionEn,
    type: "CARDS_PACK",
    pack,
  },
]

const wordPairs = [
  ["орехи", "crypt"],
  ["карта", "block"],
  ["актив", "trade"],
  ["биржа", "chain"],
  ["бонус", "coins"],
  ["токен", "token"],
]
export const gameLevels: GameLevel[] = (
  ["PUZZLES", "CARDS", "WORDLY"] as const
).flatMap((gameType, typeIndex) =>
  Array.from({ length: 12 }, (_, i) => {
    const id = typeIndex * 100 + i + 1
    const [wordRu, wordEn] = wordPairs[i % wordPairs.length]
    const wordBody = encryptWord(
      JSON.stringify({
        wordRu,
        wordEn,
        descriptionRu: "Слово из мира криптовалют. Угадай 5 букв!",
        descriptionEn: "A crypto word. Guess all 5 letters!",
      }),
      "1970.01.01 00:00",
    )
    return {
      id,
      gameType,
      level: i + 1,
      title: `Level ${i + 1}`,
      description: "Demo level",
      image: nft,
      body: "{}",
      createdAt: date,
      updatedAt: date,
      difficulties: (gameType === "WORDLY"
        ? ["EASY"]
        : ["EASY", "MEDIUM", "HARD"]
      ).map((difficulty, d) => ({
        id: `${gameType}-${i + 1}-${difficulty}`,
        difficulty,
        body:
          gameType === "WORDLY"
            ? wordBody
            : gameType === "CARDS"
              ? JSON.stringify({ max_flips: [40, 50, 65][d] })
              : JSON.stringify({ difficulty_timer: [300, 420, 600][d] }),
        price: 100 * (d + 1),
        energyPrice: 5 * (d + 1),
        reward: 1000 * (d + 1),
        nutPassXp: 300 * (d + 1),
        createdAt: date,
        updatedAt: date,
        gameLevelId: id,
      })),
    }
  }),
)

function purchase(
  id: number,
  type: PurchaseItem["type"],
  amount: number,
  starsPrice: number,
  title: string,
  extra: Partial<PurchaseItem> = {},
): PurchaseItem {
  return {
    id,
    type,
    amount,
    starsPrice,
    title,
    titleEn: title,
    image: coin,
    imageEn: coin,
    description: "Демонстрационная покупка",
    descriptionEn: "Demo purchase",
    discount: null,
    isActive: true,
    objectId: id,
    usdPrice: 0,
    nutsPrice: 1000,
    tonPrice: 0,
    tonPriceFull: 0,
    gameInventoryType: "CARDS_PACK",
    cardsPack: null,
    personalDiscountStarsPrice: null,
    personalDiscountTonPrice: null,
    personalDiscountPercent: null,
    personalDiscountEndTime: null,
    ...extra,
  }
}
export const paymentItems = [
  purchase(40, "NUT_PASS", 1, 500, "Nuts Pass Premium"),
  ...[1, 5, 10, 25].map((amount, i) =>
    purchase(
      41 + i,
      "LEVELS",
      amount,
      amount * 25,
      `${amount} ${amount === 1 ? "уровень" : "уровней"}`,
      { titleEn: `${amount} levels` },
    ),
  ),
  purchase(50, "GAME_ENERGY", 1, 1, "Energy"),
  ...[1, 5, 10].map((amount, i) =>
    purchase(
      60 + i,
      "PAID_SPIN_WHEEL",
      amount,
      amount * 20,
      `${amount} wheel tickets`,
    ),
  ),
  purchase(70, "DONATION", 1, 1, "Donation"),
  purchase(71, "GAME_HELP", 1, 1, "Cryptle hint"),
  purchase(72, "GAME_INVENTORY_ITEM", 1, 100, "Crypto cards Premium", {
    cardsPack: {
      ...pack,
      id: "2",
      isDefault: false,
      rarity: "RARE",
      bonus: 1.5,
    },
    objectId: 2,
  }),
  purchase(73, "GAME_INVENTORY_ITEM", 1, 50, "Purple", {
    gameInventoryType: "WORDLY_COLOUR",
    objectId: 1,
    image: "/images/games/cryptle-game-back-purple-skin.svg",
    imageEn: "/images/games/cryptle-game-back-purple-skin.svg",
  }),
  purchase(74, "GAME_INVENTORY_ITEM", 1, 50, "Green", {
    gameInventoryType: "WORDLY_COLOUR",
    objectId: 2,
    image: "/images/games/cryptle-game-back-green-skin.svg",
    imageEn: "/images/games/cryptle-game-back-green-skin.svg",
  }),
  purchase(80, "UNLOCK_MODULE", 1, 100, "Premium course", { objectId: 33 }),
  purchase(81, "UNLOCK_LESSON", 1, 25, "Premium lesson"),
  purchase(82, "UNLOCK_INVENTORY_CLAIM", 1, 25, "Demo NFT"),
  purchase(90, "DROP_DISCOUNT", 1, 500, "Demo progress pack"),
]

export const wheelRewards: WheelReward[] = [false, true].flatMap(
  (isPaidWheel) =>
    (
      [
        "NUTS",
        "GAME_ENERGY",
        "NUT_PASS_XP",
        "BOOSTER",
        "NFT",
        "JACKPOT",
      ] as const
    ).map((type, i) => ({
      id: `wheel-${isPaidWheel}-${i}`,
      title: type,
      titleEn: type,
      description: "Приз колеса фортуны",
      descriptionEn: "Lucky wheel reward",
      image: type === "NFT" ? nft : coin,
      imageEn: type === "NFT" ? nft : coin,
      type,
      amount: [5000, 20, 500, 1, 1, 50000][i],
      objectId: String(i + 1),
      isPaidWheel,
      createdAt: date,
      updatedAt: date,
      nft:
        type === "NFT"
          ? {
              id: 1,
              title: "Demo NFT",
              titleEn: "Demo NFT",
              description: "Коллекционная награда",
              descriptionEn: "Collectible reward",
              image: nft,
              imageEn: nft,
              isMintActive: true,
              cryptonId: 1,
              createdAt: date,
              updatedAt: date,
            }
          : null,
      boost: type === "BOOSTER" ? boosters[0] : null,
      assembleItemPart: null,
      boxReward: reward("TOKENS", 10000, "wheel-box"),
    })),
)

const nextButtons: LearnButton[] = ["RU", "EN"].map((lang) => ({
  type: "NEXT_BUTTON",
  lang: lang as "RU" | "EN",
  title: lang === "RU" ? "Продолжить" : "Continue",
  link: "",
}))
export const modules: Module[] = [
  "Основы криптовалют",
  "Безопасность и Web3",
].map((title, m) => ({
  id: String(m + 32),
  title,
  titleEn: m ? "Security and Web3" : "Crypto basics",
  description: "Интерактивный демо-курс",
  descriptionEn: "Interactive demo course",
  icon: "book1",
  color: "#754DCA",
  isActive: true,
  isPublished: true,
  pageNumber: m + 1,
  createdAt: date,
  updatedAt: date,
  mascots: [],
  tasks: [],
  starsPrice: m ? 100 : null,
  tonPrice: null,
  tonPriceFull: null,
  usdPrice: null,
  isPurchased: m ? false : null,
  lessons: Array.from({ length: 3 }, (_, i) => ({
    moduleId: String(m + 32),
    id: String(1000 + m * 10 + i),
    title: [
      "Что такое криптовалюта?",
      "Кошельки и ключи",
      "Проверь свои знания",
    ][i],
    titleEn: ["What is crypto?", "Wallets and keys", "Test your knowledge"][i],
    description: "Пройди урок и получи орехи и XP",
    descriptionEn: "Complete the lesson for nuts and XP",
    image: lessonImage,
    imageEn: lessonImage,
    reward: 1500,
    nutPassXp: 500,
    mark: null,
    createdAt: date,
    updatedAt: date,
    pageNumber: i + 1,
    isClaimed: false,
    isSharingClaimed: false,
    submoduleNumber: 1,
    submoduleTitle: title,
    submoduleTitleEn: "Crypto basics",
    starsPrice: 25,
    tonPrice: 0,
    tonPriceFull: 0,
    usdPrice: 0,
    isPurchased: m ? false : null,
    blocks: [
      {
        id: `info-${m}-${i}`,
        type: "INFO" as const,
        body: { bgColor: "#050D12" },
        bodyEn: { bgColor: "#050D12" },
        image: "/demo-lesson-ru.svg",
        imageEn: "/demo-lesson-en.svg",
        createdAt: date,
        updatedAt: date,
        pageNumber: 1,
        buttons: nextButtons,
      },
      {
        id: `quiz-${m}-${i}`,
        type: "QUIZ" as const,
        body: {
          question: "Как хранить секретную фразу кошелька?",
          answers: [
            { text: "В безопасном месте, никому не сообщая", isCorrect: true },
            { text: "В открытом чате", isCorrect: false },
            { text: "Передать незнакомцу", isCorrect: false },
          ],
        },
        bodyEn: {
          question: "How should you store a wallet's secret phrase?",
          answers: [
            { text: "Privately in a safe place", isCorrect: true },
            { text: "In a public chat", isCorrect: false },
            { text: "Give it to a stranger", isCorrect: false },
          ],
        },
        image: "",
        imageEn: "",
        createdAt: date,
        updatedAt: date,
        pageNumber: 2,
        buttons: nextButtons,
      },
    ],
  })),
}))

export const tasks: ActiveTask[] = [
  "Загляни в игры",
  "Открой боевой пропуск",
  "Исследуй Nuts Farm",
].map((title, i) => ({
  id: `task-${i}`,
  lang: "RU",
  title,
  icon: "Nuts",
  link: ["/games", "/pass", "/earn"][i],
  task: {
    id: `task-${i}`,
    type: "URL",
    reward: 1000,
    nutPassXp: 300,
    isActive: true,
    balanceRequired: false,
    isTgPremiumRequired: false,
    partnerIcon: null,
    partnerName: null,
    referralsCountGoal: null,
    storyId: null,
    taskCompletionLimit: 1,
    telegramChannelId: null,
    objectId: null,
    executionIntervalDays: null,
    executionIntervalHours: null,
    lastExecutionDate: null,
    lastExecutionDateTime: null,
    value: null,
  },
}))
