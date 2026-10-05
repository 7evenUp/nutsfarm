import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTonConnectModal, useTonConnectUI } from "@tonconnect/ui-react"
import { toast } from "sonner"
import { Description } from "@radix-ui/react-dialog"
import { useTime, useTransform, motion } from "framer-motion"

import TonconnectIconPng from "@/assets/icons/tonconnect-icon.png"
import CryptonIDIcon from "@/assets/icons/crypton-id.svg?react"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import CoinPng from "@/assets/images/coin.png"

import Settings from "./components/Settings"
import Inventory from "./components/Inventory"
import Achievements from "./components/Achievements"
import TransactionsHistory from "./components/TransactionsHistory"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"

import { useHideInventoryNotificationMutation } from "@/redux/api/inventory"
import {
  useGetCurrentUserQuery,
  useRegisterUnionMutation,
  useVerifyTonMutation,
} from "@/redux/api/user"
import { useAppDispatch } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"

import { shortenWallet } from "@/utils/shortenWallet"
import { sendMetrika } from "@/utils/sendMetrika"
import { openLinkWithTelegram } from "@/utils/openLink"

import { cn } from "@/lib/cn"

const TON_PAYLOAD_SECRET = "979ee024cb967134d0fd43556582b374"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@telegram-apps/sdk"

let backButton: BackButton

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const Root = ({
  open,
  setOpen,
  close,
  openTonInfo,
  openChangeAvatar,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  close: () => void
  openTonInfo: () => void
  openChangeAvatar: () => void
}) => {
  const { t } = useTranslation()

  const contentRef = useRef<HTMLDivElement>(null)
  const [hasScrolledHalfway, setHasScrolledHalfway] = useState(false)

  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useGetCurrentUserQuery()
  const [verifyTon] = useVerifyTonMutation()
  const [mutate, { isLoading: isRegisterLoading }] = useRegisterUnionMutation()
  const [hideNotification] = useHideInventoryNotificationMutation()

  const dispatch = useAppDispatch()

  const [tonConnectUI] = useTonConnectUI()
  const { open: openTonConnect } = useTonConnectModal()

  useEffect(() => {
    if (!open) return

    const timeout = setTimeout(() => {
      const element = contentRef.current
      if (!element) {
        return
      }

      const handleScroll = () => {
        if (hasScrolledHalfway) return

        const { scrollTop, scrollHeight, clientHeight } = element
        const scrollPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100

        if (scrollPercentage >= 50) {
          setHasScrolledHalfway(true)
          sendMetrika("profile_scroll_down")
        }
      }

      handleScroll()

      element.addEventListener("scroll", handleScroll)
      return () => {
        element.removeEventListener("scroll", handleScroll)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [open, hasScrolledHalfway])

  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
      setHasScrolledHalfway(false)
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
      if (wallet) {
        if (
          wallet.connectItems?.tonProof &&
          "proof" in wallet.connectItems.tonProof
        ) {
          if (!wallet.account.walletStateInit) {
            toast.error(t("Ошибка"), {
              description: t("Мы не поддерживаем используемый вами кошелёк"),
            })
          }

          try {
            await verifyTon({
              address: wallet.account.address,
              walletStateInit: wallet.account.walletStateInit,
              stateInit: {
                name: "ton_proof",
                proof: {
                  ...wallet.connectItems.tonProof.proof,
                  timestamp:
                    wallet.connectItems.tonProof.proof.timestamp.toString(),
                },
              },
              walletType: wallet.appName,
            }).unwrap()
            toast(t("Ваш TON кошелёк был успешно привязан"), {
              className: "justify-center",
            })
          } catch {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }
      }
    })
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!currentUser || !open) return

    if (currentUser.isInventoryNotificationReceived === false) {
      hideNotification()
    }
  }, [currentUser, open])

  if (isCurrentUserLoading) return

  const onConnectClick = async () => {
    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: TON_PAYLOAD_SECRET },
    })
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect()
      openTonConnect()
      close()
    } else {
      openTonConnect()
      close()
    }
  }

  const registerUnion = async () => {
    if (isRegisterLoading) return

    try {
      await mutate().unwrap()
      toast(t("Отправлен запрос синхронизации с ID, пожалуйста ожидайте"), {
        className: "justify-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Запрос на вход уже был отправлен"),
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        ref={contentRef}
        className={cn(
          "gap-0 overflow-hidden overflow-y-scroll px-0",
          Telegram.WebApp.initData
            ? "max-h-screen rounded-t-none"
            : "max-h-[100svh]",
        )}
      >
        <Description className="sr-only">
          Your account modal. Here you can connect Crypton ID account and TON
          wallet
        </Description>
        <SheetHeader className="mt-2 min-h-0"> </SheetHeader>
        <div className="flex flex-col gap-2">
          <div className="mb-6 flex items-center justify-between gap-4 px-4">
            <UserAvatar
              className="h-[72px] w-[72px]"
              onClick={() => {
                if (currentUser) {
                  dispatch(setOpenedProfileId(currentUser.id))
                }
              }}
            />
            <div className="flex flex-1 flex-col gap-1.5">
              <UserNickname className="text-sm" />
              <div className="flex gap-1.5">
                <button
                  className="flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-[#17202D] p-2.5 font-tt-hoves-expanded text-xs font-medium transition-colors active:bg-[#202936]"
                  onClick={() => {
                    close()
                    openChangeAvatar()
                  }}
                >
                  {t("Сменить аватар")}
                </button>
                <WebAppButton />
              </div>
            </div>
          </div>

          {currentUser && currentUser.cryptonGlobalId ? (
            <button
              className="mx-4 flex h-14 items-center gap-4 rounded-xl border border-[#17202D] p-2.5 text-left font-tt-hoves-expanded text-sm font-medium"
              onClick={() => {
                Telegram.WebApp.openLink("https://id.crypton.xyz")
              }}
            >
              <CryptonIDIcon className="shrink-0" />
              {t("Вход успешно выполнен")}{" "}
              {currentUser.cryptonProfileUsername &&
                t("как") + " " + currentUser.cryptonProfileUsername}
            </button>
          ) : (
            <button
              className="mx-4 flex h-14 items-center gap-4 rounded-xl bg-[#17202D] p-2.5 text-left font-tt-hoves-expanded text-sm font-medium transition-colors active:bg-[#202936]"
              onClick={registerUnion}
            >
              <CryptonIDIcon className="shrink-0" />
              {isRegisterLoading ? (
                <Loader className="animate-spin" />
              ) : (
                t("Войти в Crypton ID")
              )}
            </button>
          )}

          {currentUser &&
            (currentUser.tonWallet ? (
              <button
                className="mx-4 flex h-14 items-center gap-4 rounded-xl border border-[#17202D] p-2.5 font-tt-hoves-expanded text-sm font-medium transition-colors active:bg-[#202936]"
                onClick={() => {
                  close()
                  openTonInfo()
                }}
              >
                <img
                  className="h-7 w-7 shrink-0"
                  src={TonconnectIconPng}
                  alt="TON connect icon"
                />
                {shortenWallet(currentUser.tonWallet)}
                <ChevronDown className="ml-auto h-5 w-5 opacity-80" />
              </button>
            ) : (
              <button
                className="mx-4 flex h-14 items-center gap-4 rounded-xl bg-[#17202D] p-2.5 text-left font-tt-hoves-expanded text-sm font-medium transition-colors active:bg-[#202936]"
                onClick={onConnectClick}
              >
                <img
                  className="h-7 w-7 shrink-0"
                  src={TonconnectIconPng}
                  alt="TON connect icon"
                />
                {t("Подключить TON-кошелёк")}
                <div className="ml-auto flex items-center px-1.5 py-0.5 font-tt-hoves text-sm font-semibold text-[#FEEE1F] backdrop-blur">
                  <img
                    src={CoinPng}
                    alt="Nuts coin icon"
                    className="mr-0.5 size-5"
                  />{" "}
                  +200
                </div>
              </button>
            ))}

          <Settings />

          <Achievements />

          <Inventory />

          <TransactionsHistory />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Root

const WebAppButton = () => {
  const time = useTime()

  const rotate = useTransform(time, [0, 3000], [0, 360], {
    clamp: false,
  })
  const rotatingBg = useTransform(rotate, (r) => {
    return `conic-gradient(from ${r}deg, #66FAFF, transparent, transparent, #66FAFF)`
  })

  if (!Telegram.WebApp.initData) return null

  return (
    <div className="relative">
      <button
        className="relative z-10 flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan to-blue p-2.5 font-tt-hoves-expanded text-xs font-medium text-[#060E13] ring-1 ring-cyan/75 transition-colors"
        onClick={() => {
          const correctDomain =
            import.meta.env.VITE_ENVIRONMENT === "PROD"
              ? "https://nutsfarm.crypton.xyz/"
              : "https://frontend.nutsfarm-dev.crypton.team/"
          openLinkWithTelegram(
            `${correctDomain}?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
            true,
          )
        }}
      >
        Web App
      </button>
      <motion.div
        className="absolute -inset-px rounded-[11px]"
        style={{
          background: rotatingBg,
          filter: "blur(4px)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
    </div>
  )
}
