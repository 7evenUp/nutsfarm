import React, { useState } from "react"

import TopButtons from "./TopButtons"
import BuyPassCard from "./BuyPassCard"
import PassBoughtCard from "./PassBoughtCard"
import CurrentPassLevel from "./CurrentPassLevel"

import { SparklesCore } from "../Sparkles"

import BuyPass from "../../modals/BuyPass"
import BuyPassPaymentStatus from "../../modals/BuyPassPaymentStatus"
import PassBoughtOnboarding from "../../modals/PassBoughtOnboarding"

import { useGetCurrentUserQuery } from "@/redux/api/user"

const PassHeader = React.memo(() => {
  const [buyOpen, setBuyOpen] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)
  const [passBoughtOpen, setPassBoughtOpen] = useState(false)

  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return null

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-col">
        <div className="relative overflow-hidden bg-[radial-gradient(175px_150px_at_50%_150%,_var(--tw-gradient-stops))] from-[#754DCA] to-[#141A2D] px-3.5 pt-4 phone-sm-fix:pt-5">
          <TopButtons />

          <SparklesCore
            key="header-sparkles"
            id="header-sparkles"
            background="transparent"
            minSize={2}
            maxSize={4}
            particleDensity={30}
            className="absolute inset-0 blur-[2px]"
            particleColor="#FFFFAA"
          />

          {currentUser.isNutPassActive ? (
            <PassBoughtCard className="mb-4 mt-5" />
          ) : (
            <BuyPassCard
              className="mb-2 mt-4 phone-xsm:mt-6"
              openBuyPass={() => setBuyOpen(true)}
            />
          )}
        </div>

        <CurrentPassLevel />
      </header>

      <BuyPass
        open={buyOpen}
        setOpen={setBuyOpen}
        openPaymentStatus={() => {
          setBuyOpen(false)
          setPaymentStatusOpen(true)
        }}
      />
      <BuyPassPaymentStatus
        open={paymentStatusOpen}
        setOpen={setPaymentStatusOpen}
        openPassBoughtModal={() => setPassBoughtOpen(true)}
      />
      <PassBoughtOnboarding open={passBoughtOpen} setOpen={setPassBoughtOpen} />
    </>
  )
})

export default PassHeader
