import { Dispatch, SetStateAction } from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useTranslation } from "react-i18next"

import { Button } from "@/shared/ui/Button"

const AlertPopUp = ({
  open,
  setOpen,
  handleCloseLesson,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleCloseLesson: () => void
}) => {
  const { t } = useTranslation()

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 z-[1000] bg-[#2D3745B2]" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow overlay-bg fixed left-1/2 top-1/2 z-[1000] max-h-[85vh] w-[90vw] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-4 shadow-md backdrop-blur focus:outline-none">
          <AlertDialog.Title className="m-0 mx-auto max-w-[220px] text-center font-tt-hoves-expanded text-[14px]/[19px] font-semibold text-white">
            {t("Уверены, что хотите выйти и остановить урок?")}
          </AlertDialog.Title>
          <AlertDialog.Description className="sr-only">
            {t("Уверены, что хотите выйти и остановить урок?")}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-between gap-4">
            <AlertDialog.Cancel asChild className="w-full">
              <Button
                appearance="white"
                contentClassName="w-full text-[12px] font-nunito rounded-lg"
              >
                {t("Продолжить1")}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild className="w-full">
              <Button
                appearance="gray"
                contentClassName="w-full text-[12px] font-nunito rounded-lg"
                onClick={() => handleCloseLesson()}
              >
                {t("Выйти")}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default AlertPopUp
