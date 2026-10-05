import React, { useEffect, useLayoutEffect, useState } from "react"

import NotTgEnvironmentScreen from "./NotTgEnvironmentScreen.tsx"
import NotTgEnvironmentErrorScreen from "./NotTgEnvironmentErrorScreen.tsx"

import LoadingScreen from "@/modules/LoadingScreen"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetCountryCodeQuery } from "@/redux/geojs-api/countryCode"
import { useLoginMutation } from "@/redux/api/auth.ts"

import { setCountryCode } from "@/redux/slices/countryCode"
import { useAppDispatch } from "@/redux/hooks.ts"

const WebApp = ({ children }: { children: React.ReactNode }) => {
  const [hasInitData, setHasInitData] = useState(false)
  const [isAuthError, setIsAuthError] = useState(false)

  const dispatch = useAppDispatch()

  const { isLoading: isCountryLoading, data: countryCode } =
    useGetCountryCodeQuery()
  const { isLoading, refetch: refetchUser } = useGetCurrentUserQuery()
  const [login, { isLoading: isLoginLoading }] = useLoginMutation()

  useLayoutEffect(() => {
    const url = new URL(location.href)
    const initDataParam = url.searchParams.get("initData")

    if (initDataParam === null || initDataParam.length === 0) {
      if (sessionStorage.getItem("accessToken")) {
        setHasInitData(true)
      } else {
        return
      }
    }

    const authenticate = async () => {
      if (initDataParam === null || initDataParam.length === 0) {
        if (sessionStorage.getItem("accessToken")) {
          setHasInitData(true)
          refetchUser()
        }
      } else {
        setHasInitData(true)

        try {
          const tokens = await login(initDataParam).unwrap()

          sessionStorage.setItem("accessToken", tokens.accessToken)
          sessionStorage.setItem("refreshToken", tokens.refreshToken)

          refetchUser()
        } catch {
          setIsAuthError(true)
        }
      }
    }

    authenticate()
  }, [])

  useEffect(() => {
    if (countryCode) {
      dispatch(setCountryCode(countryCode.country))
    }
  }, [countryCode])

  if (isAuthError) return <NotTgEnvironmentErrorScreen />

  if (!hasInitData) return <NotTgEnvironmentScreen />

  if (isLoginLoading || isLoading || isCountryLoading) return <LoadingScreen />

  return children
}

export default WebApp
