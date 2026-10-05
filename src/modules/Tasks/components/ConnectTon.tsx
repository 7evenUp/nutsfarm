import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useTonConnectModal, useTonConnectUI } from "@tonconnect/ui-react"
import { toast } from "sonner"

import TonconnectIconPng from "@/assets/icons/tonconnect-icon-lg.png"
import Coin from "@/assets/icons/coin.svg?react"

import { useVerifyTonMutation } from "@/redux/api/user"

const TON_PAYLOAD_SECRET = "979ee024cb967134d0fd43556582b374"

const ConnectTon = () => {
  const { t } = useTranslation()

  const [tonConnectUI] = useTonConnectUI()
  const { open: openTonConnect } = useTonConnectModal()

  const [verifyTon] = useVerifyTonMutation()

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

  return (
    <button
      className="mb-2.5 flex w-full items-center gap-2.5 rounded-xl bg-[#0F1824] px-2 py-1.5 transition-colors active:bg-[#202936]"
      onClick={onConnectClick}
    >
      <img
        className="h-16 w-16 shrink-0"
        src={TonconnectIconPng}
        alt="TON connect icon"
      />
      <div className="flex flex-col items-start gap-1.5">
        <p className="text-sm font-bold">{t("Подключить TON-кошелёк")}</p>
        <div className="flex h-[22px] min-w-max items-center gap-1 rounded-full bg-[#1C2430] px-1 pr-1.5">
          <Coin className="h-3 w-3 shrink-0" />
          <span className="text-left text-xs/none font-bold text-[#FEED1E]">
            200
          </span>
        </div>
      </div>
    </button>
  )
}

export default ConnectTon
