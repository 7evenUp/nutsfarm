import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"
import { toast } from "sonner"

import LoaderIcon from "@/assets/icons/loader.svg?react"
import CheckIcon from "@/assets/icons/check.svg?react"
import Lock from "@/assets/icons/lock.svg?react"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"

import {
  useGetCurrentUserQuery,
  useRerollPictureMutation,
} from "@/redux/api/user"

import { getHours, getMinutes } from "@/utils/date"

import { cn } from "@/lib/cn"

const ChangeAvatar = ({
  open,
  setOpen,
  close,
  openRoot,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  close: () => void
  openRoot: () => void
}) => {
  const { t } = useTranslation()

  const { data: currentUser } = useGetCurrentUserQuery()
  const [reroll, { isLoading: isRerollLoading }] = useRerollPictureMutation()

  const rerollPicture = async () => {
    if (isRerollLoading) return

    try {
      await reroll().unwrap()
      toast(t("Аватар был успешно изменён"), {
        className: "justify-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  if (!currentUser) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <Description className="sr-only">
          Changing user's avatar modal
        </Description>

        <SheetHeader>{t("Сменить аватар")}</SheetHeader>
        <p className="text-sm text-white/80">
          {t(
            "При подтверждении аватар будет заменен на случайный. Смена аватара доступа раз в 24 часа.",
          )}
        </p>
        <button
          className={cn(
            "flex h-[50px] items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium transition-colors",
            currentUser.pictureReRollLockedBefore !== null &&
              Date.now() <
                new Date(currentUser.pictureReRollLockedBefore).getTime()
              ? "text-white/50"
              : "text-white active:bg-[#202936]",
          )}
          onClick={rerollPicture}
          disabled={
            currentUser.pictureReRollLockedBefore !== null &&
            Date.now() <
              new Date(currentUser.pictureReRollLockedBefore).getTime()
          }
        >
          {currentUser.pictureReRollLockedBefore !== null &&
          Date.now() <
            new Date(currentUser.pictureReRollLockedBefore).getTime() ? (
            <>
              <Lock className="h-5 w-5 shrink-0" />
              {t("Доступно через")}{" "}
              {getHours(
                (new Date(currentUser.pictureReRollLockedBefore).getTime() -
                  Date.now()) /
                  1000 -
                  1,
              )}
              {t("h")}{" "}
              {getMinutes(
                (new Date(currentUser.pictureReRollLockedBefore).getTime() -
                  Date.now()) /
                  1000 -
                  1,
              )}
              {t("m")}
            </>
          ) : isRerollLoading ? (
            <LoaderIcon className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              {t("Подтвердить")}
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            className="flex h-[50px] flex-1 items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={() => {
              close()
              openRoot()
            }}
          >
            {t("Назад")}
          </button>
          <button
            className="flex h-[50px] flex-1 items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={close}
          >
            {t("Закрыть")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ChangeAvatar
