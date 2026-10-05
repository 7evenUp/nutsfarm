import { useEffect, useState } from "react"

import CoinPng from "@/assets/images/coin.png"

import LoadingScreen from "@/modules/LoadingScreen"

const imgData = [CoinPng]

const Preloader = ({ children }: { children: React.ReactNode }) => {
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    const cacheContent = async () => {
      const promises = imgData.map((src) => {
        return new Promise((resolve, reject) => {
          if (!src) return

          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = reject
        })
      })

      await Promise.all(promises)
      setIsCached(true)
    }

    cacheContent()
  }, [])

  if (isCached) return children

  return <LoadingScreen />
}

export default Preloader
