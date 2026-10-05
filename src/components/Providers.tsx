import React from "react"
import { Provider as ReduxProvider } from "react-redux"
import { TonConnectUIProvider } from "@tonconnect/ui-react"

import { store } from "@/redux/store"

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <TonConnectUIProvider manifestUrl="https://nutsfarm.crypton.xyz/tonconnect-manifest.json">
        {children}
      </TonConnectUIProvider>
    </ReduxProvider>
  )
}

export default Providers
