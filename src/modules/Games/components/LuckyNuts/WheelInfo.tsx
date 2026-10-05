import { useTranslation } from "react-i18next"

import WheelIcon from "@/assets/games/shared-icons/wheel.svg?react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/Drawer"
import { LargeButton } from "@/shared/ui/LargeButton"

const WheelInfo = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Lucky Nuts</DrawerTitle>
          <DrawerDescription>
            {t("Потрать 5 энергии в любой из игр и получи 1 билет на колесо.")}
          </DrawerDescription>
        </DrawerHeader>

        <WheelIcon className="mb-4 mt-8 h-auto w-[54px] self-center phone-sm-fix:w-24" />

        <h2 className="text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white">
          Lucky Nuts
        </h2>

        <div className="mb-6 mt-[18px] flex flex-col gap-2 px-4 phone-xsm:mb-8 phone-sm-fix:mb-14">
          <p className="text-center text-[13px]/[17px] font-medium text-white/75 phone-sm-fix:text-sm">
            {t("Потрать 5 энергии в любой из игр и получи 1 билет на колесо.")}
          </p>
          <p className="text-center text-[13px]/[17px] font-medium text-white/75 phone-sm-fix:text-sm">
            {t(
              "Потрать 1 билет, чтобы вращать колесо. Каждое вращение дает гарантированный приз!",
            )}
          </p>
          <p className="text-center text-[13px]/[17px] font-medium text-white/75 phone-sm-fix:text-sm">
            {t("Джекпот растёт благодаря сумме потраченных NUTS всех игроков.")}{" "}
            {t("Чем больше участников, тем крупнее награда!")}
          </p>
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

export default WheelInfo
