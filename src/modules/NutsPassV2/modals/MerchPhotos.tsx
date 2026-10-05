import * as Dialog from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import Merch1Png from "@/assets/passV2/images/Merch-1.png"
import Merch2Png from "@/assets/passV2/images/Merch-2.png"
import Merch3Png from "@/assets/passV2/images/Merch-3.png"
import Merch4Png from "@/assets/passV2/images/Merch-4.jpg"
import Merch5Png from "@/assets/passV2/images/Merch-5.png"

import { LargeButton } from "@/shared/ui/LargeButton"

import { cn } from "@/lib/cn"

const MerchPhotos = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050D12]">
          <Dialog.Title className="sr-only">Merch Info</Dialog.Title>
          <Dialog.Description className="sr-only">
            Merch Info
          </Dialog.Description>

          <div className="grid grid-cols-2 place-content-center gap-3 px-4">
            <img className="aspect-square rounded-xl" src={Merch1Png} />
            <img className="aspect-square rounded-xl" src={Merch2Png} />
            <img className="aspect-square rounded-xl" src={Merch3Png} />
            <img className="aspect-square rounded-xl" src={Merch5Png} />
            <img className="aspect-square rounded-xl" src={Merch4Png} />
          </div>

          <Dialog.Close asChild>
            <LargeButton
              appearance="white"
              className={cn(
                "fixed inset-x-3.5 w-auto",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-4"
                  : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
              )}
            >
              {t("Назад")}
            </LargeButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MerchPhotos
