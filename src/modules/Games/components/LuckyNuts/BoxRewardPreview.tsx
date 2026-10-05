import { useTranslation } from "react-i18next"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/Drawer"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppSelector } from "@/redux/hooks"

import { WheelReward as IWheelReward } from "@/types/wheel"

const BoxRewardPreview = ({
  children,
  boxRewards,
}: {
  children: React.ReactNode
  boxRewards: IWheelReward[]
}) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Box rewards</DrawerTitle>
        </DrawerHeader>

        <h2 className="mb-4 mt-8 text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white">
          {t("Награды из сундука")}
        </h2>

        <div className="mb-6 mt-[18px] flex flex-col gap-2 px-4 phone-xsm:mb-8 phone-sm-fix:mb-14">
          {boxRewards.map((box) => (
            <div
              className="flex h-[51px] w-full shrink-0 flex-wrap items-center gap-x-4 gap-y-0 rounded-[10px] bg-[#252E3D] px-3.5 text-sm font-medium text-white"
              key={box.id}
            >
              <span>
                {lang === "RU" ? box.boxReward.name : box.boxReward.nameEn}
              </span>
              <span className="text-xs text-white/70">
                {lang === "RU"
                  ? box.boxReward.description
                  : box.boxReward.descriptionEn}
              </span>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <LargeButton appearance="white">{t("Закрыть")}</LargeButton>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default BoxRewardPreview
