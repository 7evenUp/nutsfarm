import BlockedLevel from "./BlockedLevel"
import PassedLevel from "./PassedLevel"
import CurrentLevel from "./CurrentLevel"

import { GameLevel, UserGameLevelDifficultyInfo } from "@/types/games"

import { Sound } from "@/utils/Sound"

const Level = ({
  level,
  isCurrent,
  index,
  clickSound,
  hasToFetchNew,
}: {
  level: UserGameLevelDifficultyInfo | GameLevel
  isCurrent?: boolean
  index: number
  clickSound: Sound
  hasToFetchNew: boolean
}) => {
  // type guard
  if ("status" in level)
    return (
      <PassedLevel
        index={index}
        {...(level as UserGameLevelDifficultyInfo)}
        clickSound={clickSound}
      />
    )

  if (isCurrent) {
    return <CurrentLevel index={index} {...level} clickSound={clickSound} />
  }

  return <BlockedLevel hasToFetchNew={hasToFetchNew} />
}

export default Level
