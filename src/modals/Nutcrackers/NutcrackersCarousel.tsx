import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import useEmblaCarousel from "embla-carousel-react"

import HourglassIcon from "@/assets/nutcracker-icons/hourglass.svg?react"
import NutsFarmIncreaseIcon from "@/assets/icons/nuts-farm-increase.svg?react"

import NutcrackerInfoModal from "../NutcrackersInfo"
import NutcrackersBonusesDialog from "../NutrackersBonusesHelp/NutcrackersBonusesHelp"

import QuestionCircleIcon from "@/modules/Earn/EarnMap/icons/QuestionCircleIcon"

import { useSetAvatarMutation } from "@/redux/api/profile"
import { setNutcrackerAvatar } from "@/redux/slices/nutcracker-avatar"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppDispatch } from "@/redux/hooks"

import { Nutcracker, NutcrackerRarity, RARITY_STYLES } from "@/types/nutcracker"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const RARITY_LEVELS: Record<NutcrackerRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  mythical: 4,
  epic: 5,
  legendary: 6,
}

const NutcrackersCarousel = ({
  nutcrackers,
  nestedModalOpen,
  setNestedModalOpen,
}: {
  nutcrackers: Nutcracker[]
  nestedModalOpen: boolean
  setNestedModalOpen: (e: boolean) => void
}) => {
  const [selectedNutcracker, setSelectedNutcracker] =
    useState<Nutcracker | null>(null)
  const dispatch = useAppDispatch()

  const { data: currentUser } = useGetCurrentUserQuery()
  const [setAvatar, { isLoading }] = useSetAvatarMutation()

  const { basePointsPerSecond } = currentUser!

  const pointsPerHour = useMemo(
    () => basePointsPerSecond * 60 * 60,
    [basePointsPerSecond],
  )

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const { t } = useTranslation()

  const totalTimeBoost = useMemo(() => {
    if (nutcrackers.length === 0) return null

    return nutcrackers.reduce(
      (accumulator, current) =>
        (accumulator += current.rarityBonus.farmMinutesTime),
      0,
    )
  }, [nutcrackers])

  const maxRarityNutcracker = useMemo(() => {
    if (nutcrackers.length === 0) return null

    const maxRarityItem = nutcrackers.reduce((maxItem, currentItem) => {
      const currentRarityLevel = RARITY_LEVELS[currentItem.rarity]
      const maxRarityLevel = RARITY_LEVELS[maxItem.rarity]

      return currentRarityLevel > maxRarityLevel ? currentItem : maxItem
    }, nutcrackers[0])

    return maxRarityItem
  }, [nutcrackers])

  const handleNutcrackerClick = (
    nutcracker: Nutcracker,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation() // предотвращаем всплытие события
    makeHapticFeedback({ impactOccured: "soft" })
    setSelectedNutcracker(nutcracker)
    setNestedModalOpen(true)
  }

  const handleCloseModal = () => {
    setNestedModalOpen(false)
  }

  const handleSetAvatar = async () => {
    if (!selectedNutcracker || isLoading) return

    try {
      const result = await setAvatar(
        selectedNutcracker.nutcrackerIndex,
      ).unwrap()
      handleCloseModal()
      dispatch(setNutcrackerAvatar(result))

      toast(t("Аватар был успешно изменён"), {
        className: "justify-center",
      })
    } catch (error) {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <>
      <div
        className="w-full cursor-grab overflow-hidden px-3.5 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-3 phone-sm-fix:gap-4">
          {nutcrackers.map((nutcracker) => (
            <button
              aria-label={`Open nutcracker info: ${nutcracker.name}`}
              key={nutcracker.id}
              className="h-screen-700: flex min-w-[172px] flex-col items-start first-line:cursor-pointer phone-sm:min-w-[172px] phone-sm-fix:min-w-[192px] h-screen-700:phone:min-w-[220px]"
              onClick={(e) => handleNutcrackerClick(nutcracker, e)}
            >
              <img
                src={nutcracker.imageLink}
                alt={nutcracker.name}
                className="mb-3 h-[172px] w-[172px] rounded-[12px] bg-[#17202D] object-cover phone-sm:h-[172px] phone-sm:w-[172px] phone-sm-fix:mb-4 phone-sm-fix:h-[192px] phone-sm-fix:w-[192px] h-screen-700:phone:h-[220px] h-screen-700:phone:w-[220px]"
              />
              <p className="text-left text-base font-semibold leading-[24px] text-white phone-sm-fix:text-lg phone-sm-fix:leading-[22px]">
                {nutcracker.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {totalTimeBoost !== null && maxRarityNutcracker !== null && (
        <div className="mt-6 flex flex-col items-center gap-3 h-screen-700:mt-8 h-screen-700:phone-sm-fix:mt-12">
          <p className="text-sm font-medium text-white/75">
            {t("Бонусы к фарму:")}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-12 items-center gap-3 rounded-xl bg-[#17202D] px-4">
              <HourglassIcon className="h-6 w-6 shrink-0" />
              <span className="text-sm font-medium">
                + {Math.min(totalTimeBoost / 60, 16).toFixed(1)} {t("h")}
              </span>
            </div>
            <button
              onClick={(e) => handleNutcrackerClick(maxRarityNutcracker, e)}
              className={cn(
                "flex h-12 items-center gap-3 rounded-xl bg-[#17202D] px-4",
                RARITY_STYLES[maxRarityNutcracker.rarity].border,
              )}
            >
              <NutsFarmIncreaseIcon className="h-7 w-auto shrink-0" />
              <span className="text-sm font-medium">
                +{" "}
                {numberWithSpaces(
                  (pointsPerHour *
                    maxRarityNutcracker.rarityBonus.farmBonusPercent) /
                    100,
                )}{" "}
                NUTS/{t("h")}
              </span>
            </button>
          </div>
          {/* Bonus calculation trigger button */}
        </div>
      )}

      <NutcrackerInfoModal
        nutcracker={selectedNutcracker}
        onSetAvatar={handleSetAvatar}
        isLoading={isLoading}
        isOpen={nestedModalOpen}
        setOpen={setNestedModalOpen}
      />

      <NutcrackersBonusesDialog className="mt-4 flex w-full justify-center">
        <button className="flex items-center gap-1 text-sm font-medium text-[#ffffff]/50">
          <QuestionCircleIcon className="h-[18px] w-[18px] fill-[#ffffff]/50 text-[#ffffff]/50" />
          <span> {t("Как рассчитывается бонус?")}</span>
        </button>
      </NutcrackersBonusesDialog>
    </>
  )
}

export default NutcrackersCarousel
