import assert from "node:assert/strict"
import { createServer } from "vite"

// Exercise the real local API, not a second implementation of the fixtures.
const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
}
globalThis.window = new EventTarget()
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
})
try {
  const {
    demoBaseQuery,
    completeDemoPayment,
    resetDemo,
    refillDemo,
    demoSummary,
    startDemoStreak,
  } = await server.ssrLoadModule("/src/demo/backend.ts")
  const request = async (url, params, body, method = body ? "POST" : "GET") => {
    const response = await demoBaseQuery({ url, params, body, method })
    assert.equal(
      response.error,
      undefined,
      `${url}: ${JSON.stringify(response.error)}`,
    )
    return response.data
  }
  const buy = async (id, quantity = 1, objectId) => {
    const payment = await request(
      `payment/item/${id}/stars`,
      { quantity, objectId },
      undefined,
      "POST",
    )
    assert.equal(
      await request(`payment/transaction/${payment.transactionId}/status`),
      "CREATED",
    )
    await completeDemoPayment(payment.paymentFormUrl)
    assert.equal(
      await request(`payment/transaction/${payment.transactionId}/status`),
      "SUCCESS",
    )
    return payment
  }
  resetDemo()
  startDemoStreak(0)
  assert.equal((await request("streak/current/info")).daysMissed, 0)
  const user = await request("user/current")
  assert.equal(user.isNutPassActive, false)
  Object.freeze(user)
  const premium = await buy(40)
  assert.equal((await request("user/current")).isNutPassActive, true)
  assert.equal(demoSummary().stars, 49500)
  await completeDemoPayment(premium.paymentFormUrl)
  assert.equal(demoSummary().stars, 49500, "Payment callbacks are idempotent")
  await buy(42, 2)
  assert.equal((await request("user/current")).nutPassXpBalance, 17200)
  const rows = await request("nutpass/rewards", { page: 1, size: 50 })
  assert.equal(rows.total, 120)
  assert.equal(
    rows.items.find((r) => r.id === "pass-1-premium").status,
    "READY_FOR_CLAIM",
  )
  const balanceBefore = (await request("user/current")).balance
  await request(
    "nutpass/rewards/claim",
    { rewardId: "pass-2-free" },
    undefined,
    "POST",
  )
  assert.equal((await request("user/current")).balance, balanceBefore + 3000)
  const duplicate = await demoBaseQuery({
    url: "nutpass/rewards/claim",
    params: { rewardId: "pass-2-free" },
    method: "POST",
  })
  assert.equal(duplicate.error.status, 400, "Cannot claim rewards twice")
  assert.equal((await request("user/current")).balance, balanceBefore + 3000)
  const box = await request(
    "nutpass/rewards/claim",
    { rewardId: "pass-1-premium" },
    undefined,
    "POST",
  )
  assert.equal(box.length, 1)
  assert.ok(["TOKENS", "ENERGY", "NFT", "BOOSTER"].includes(box[0].type))
  await buy(50, 10)
  const energyBefore = demoSummary().energy
  assert.ok(energyBefore >= 110)
  for (const type of ["PUZZLES", "CARDS", "WORDLY"]) {
    const levels = await request("game/current/active", {
      type,
      page: 1,
      size: 20,
    })
    const first = levels.items[0]
    const session = await request("game/start", undefined, {
      gameType: type,
      gameLevelDifficultyId: first.difficulties[0].id,
    })
    assert.equal(session.status, "PENDING")
    const balance = (await request("user/current")).balance
    const completed = await request("game/claim", undefined, {
      id: session.id,
      gameType: type,
      gameStats: { moves: 8, timePassed: 12 },
    })
    assert.equal(completed.status, "COMPLETED")
    assert.equal(
      (await request("user/current")).balance,
      balance + completed.reward,
    )
    await request("game/claim", undefined, { id: session.id, gameType: type })
    assert.equal(
      (await request("user/current")).balance,
      balance + completed.reward,
      "Game rewards are idempotent",
    )
    assert.equal(
      (await request("game/current/active", { type })).items[0].level,
      2,
    )
  }
  const second = (await request("game/current/active", { type: "CARDS" }))
    .items[0]
  const failed = await request("game/start", undefined, {
    gameType: "CARDS",
    gameLevelDifficultyId: second.difficulties[0].id,
  })
  await request("game/fail", undefined, { id: failed.id })
  const retry = await request("game/start", undefined, {
    gameType: "CARDS",
    gameLevelDifficultyId: second.difficulties[0].id,
  })
  assert.notEqual(retry.id, failed.id)
  assert.equal(
    (await request("game/current/started", { type: "CARDS" })).length,
    2,
  )
  const spins = demoSummary().spins
  assert.equal(
    (await request("wheel/spin", { amount: 3 }, undefined, "POST")).length,
    3,
  )
  assert.equal(demoSummary().spins, spins - 3)
  const noTickets = await demoBaseQuery({
    url: "wheel/spin",
    params: { amount: 100 },
    method: "POST",
  })
  assert.equal(noTickets.error.status, 400)
  await buy(60, 3)
  assert.equal(
    (await request("wheel/spin/paid", { amount: 3 }, undefined, "POST")).length,
    3,
  )
  await buy(72)
  const inventory = await request("inventory/current/game")
  assert.equal(inventory.filter((i) => i.type === "CARDS_PACK").length, 2)
  assert.ok(JSON.parse(inventory[0].pack.body).length >= 15)
  await buy(73)
  assert.ok(
    (await request("inventory/current/game")).some(
      (i) => i.type === "WORDLY_COLOUR",
    ),
  )
  const activeTask = (await request("task/active"))[0]
  const task = await request("task/start", undefined, {
    taskId: activeTask.task.id,
  })
  await request("task/claim", undefined, { userTaskId: task.id })
  assert.equal((await request("task/current"))[0].status, "CLAIMED")
  await buy(80, 1, 33)
  assert.equal(
    (await request("learn/active")).find((m) => m.id === "33").isPurchased,
    true,
  )
  await request("learn/claim/1000", undefined, {}, "POST")
  assert.equal((await request("learn/active"))[0].lessons[0].isClaimed, true)
  const beforeMint = (await request("user/current")).balance
  await buy(82, 1, 9000)
  assert.equal(
    (await request("inventory/current")).find((n) => n.id === "9000").status,
    "CLAIMED",
  )
  assert.equal((await request("user/current")).balance, beforeMint + 1000)
  await request("items/assemble/1", undefined, {}, "POST")
  assert.equal((await request("items/assemble/current"))[0].userAmount, 0)
  assert.ok((await request("drop/criteria")).PASSED_LESSONS.length)
  assert.ok(
    (await request("drop/progress")).find((p) => p.type === "LEVELS_PASSED")
      .userAmount >= 3,
  )
  const streakBalance = (await request("user/current")).balance
  await request(
    "streak/current/claim",
    { timezone: "Europe/Moscow" },
    undefined,
    "POST",
  )
  await request(
    "streak/current/claim",
    { timezone: "Europe/Moscow" },
    undefined,
    "POST",
  )
  assert.equal((await request("user/current")).balance, streakBalance + 700)
  assert.equal((await request("nutcracker/current")).length, 3)
  assert.ok((await request("story/1005499191131439105")).storyParts[0].image)
  await request("farming/farm", undefined, {}, "POST")
  const farm = await request("farming/current")
  assert.equal(farm.status, "FARMING")
  assert.equal(farm.claimAmount, 100)
  const premature = await demoBaseQuery({
    url: "farming/claim",
    method: "POST",
  })
  assert.equal(premature.error.status, 400)
  const realNow = Date.now
  try {
    Date.now = () => farm.lastFarmingFinishAt + 1
    assert.equal((await request("farming/current")).status, "READY_TO_CLAIM")
    const before = (await request("user/current")).balance
    await request("farming/claim", undefined, {}, "POST")
    assert.equal((await request("user/current")).balance, before + 100)
    assert.equal((await request("farming/current")).status, "READY_TO_FARM")
  } finally {
    Date.now = realNow
  }
  await request("items/boost/1/activate", undefined, {}, "POST")
  assert.equal((await request("items/boost/current"))[0].isActive, true)
  const refBalance = (await request("user/current")).balance
  await request("user/current/referrals/claim", undefined, {}, "POST")
  await request("user/current/referrals/claim", undefined, {}, "POST")
  assert.equal((await request("user/current")).balance, refBalance + 5000)
  const saved = JSON.parse(memory.get("nutsfarm-portfolio-v1"))
  assert.equal(saved.user.isNutPassActive, true)
  assert.equal(
    saved.started.find((s) => s.gameType === "PUZZLES").status,
    "COMPLETED",
  )
  server.moduleGraph.invalidateModule(
    server.moduleGraph.getModuleById("/src/demo/backend.ts") ||
      server.moduleGraph.getModuleById(
        process.cwd().replaceAll("\\", "/") + "/src/demo/backend.ts",
      ),
  )
  const reloaded = await server.ssrLoadModule("/src/demo/backend.ts")
  assert.equal(
    reloaded.demoSummary().stars,
    demoSummary().stars,
    "Saved state survives a backend reload",
  )
  refillDemo()
  assert.equal(demoSummary().stars, 50000)
  resetDemo()
  assert.equal((await request("user/current")).isNutPassActive, false)
  assert.equal(
    (await request("game/current/started", { type: "CARDS" })).length,
    0,
  )
  startDemoStreak(1)
  const frozen = await request("streak/current/info")
  assert.equal(frozen.daysMissed, 1)
  assert.equal(frozen.missedDaysFreezeCost, 500)
  assert.equal((await request("streak/current/info")).daysMissed, 1)
  assert.equal(
    JSON.parse(memory.get("nutsfarm-portfolio-v1")).streakDaysMissed,
    1,
  )
  const freezeBalance = (await request("user/current")).balance
  const kept = await request(
    "streak/current/claim",
    { payForFreeze: true },
    undefined,
    "POST",
  )
  assert.equal(kept.daysMissed, 0)
  assert.equal(kept.todayStreakInfo.dayNumber, 7)
  assert.ok(kept.streakDays.some((day) => day.freezing))
  assert.equal(
    (await request("user/current")).balance,
    freezeBalance - 500 + 700,
  )
  await request(
    "streak/current/claim",
    { payForFreeze: true },
    undefined,
    "POST",
  )
  assert.equal(
    (await request("user/current")).balance,
    freezeBalance - 500 + 700,
  )
  startDemoStreak(1)
  const restartBalance = (await request("user/current")).balance
  const restarted = await request(
    "streak/current/claim",
    { payForFreeze: false },
    undefined,
    "POST",
  )
  assert.equal(restarted.todayStreakInfo.dayNumber, 1)
  assert.equal(restarted.daysMissed, 0)
  assert.equal(restarted.streakRewardReceivedToday, true)
  assert.equal((await request("user/current")).balance, restartBalance)
  const scenarioBalance = (await request("user/current")).balance
  startDemoStreak(0)
  const regular = await request("streak/current/info")
  assert.equal(regular.daysMissed, 0)
  assert.equal(regular.todayStreakInfo.dayNumber, 7)
  assert.equal(regular.streakRewardReceivedToday, false)
  assert.equal(
    (await request("user/current")).balance,
    scenarioBalance,
    "Launching a scenario preserves purchases and balance",
  )
  startDemoStreak(2)
  const twoDays = await request("streak/current/info")
  assert.equal(twoDays.daysMissed, 2)
  assert.equal(twoDays.missedDaysFreezeCost, 1000)
  assert.equal(twoDays.streakDays.filter((day) => !day.hasEnter).length, 2)
  const twoDayBalance = (await request("user/current")).balance
  const twoDaysKept = await request(
    "streak/current/claim",
    { payForFreeze: true },
    undefined,
    "POST",
  )
  assert.equal(twoDaysKept.daysMissed, 0)
  assert.equal(twoDaysKept.streakDays.filter((day) => day.freezing).length, 2)
  assert.equal(
    (await request("user/current")).balance,
    twoDayBalance - 1000 + 700,
  )
  startDemoStreak(2)
  const resetBalance = (await request("user/current")).balance
  const resetTwoDays = await request("streak/current/claim",
    { payForFreeze: false }, undefined, "POST")
  assert.equal(resetTwoDays.todayStreakInfo.dayNumber, 1)
  assert.equal(resetTwoDays.daysMissed, 0)
  assert.equal(resetTwoDays.streakDays.some((day) => day.freezing), false)
  assert.equal((await request("user/current")).balance, resetBalance)
  console.log(
    "Demo integration checks passed: purchases, rewards, all games, retries, wheels, inventory, lessons, tasks, persistence and reset.",
  )
} finally {
  await server.close()
}
