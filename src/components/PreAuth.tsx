import { useEffect, useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import Auth from "./Auth"
import TechnicalWorks from "./TechnicalWorks"
import Restricted from "./Restricted"
import AppOnboarding from "./AppOnboarding"
// import NotAvailableLandscapeMode from "./NotAvailableLandscapeMode"

import LoadingScreen from "@/modules/LoadingScreen"

import { useAppDispatch } from "@/redux/hooks"
import { setLanguage } from "@/redux/slices/language"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetCountryCodeQuery } from "@/redux/geojs-api/countryCode"
import { setCountryCode } from "@/redux/slices/countryCode"

const USER_PREFERRED_LANGUAGE = window.navigator.language

const PreAuth = ({ children }: { children: React.ReactNode }) => {
  const [authPassed, setAuthPassed] = useState(false)
  const [onboardingPassed, setOnboardingPassed] = useState(false)
  // const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  const { i18n } = useTranslation()

  const dispatch = useAppDispatch()

  const {
    data: currentUser,
    isLoading,
    isError,
    isSuccess,
    error,
    refetch,
  } = useGetCurrentUserQuery()

  const { isLoading: isCountryLoading, data: countryCode } =
    useGetCountryCodeQuery()

  useLayoutEffect(() => {
    if (!currentUser) return

    if (!currentUser.isCryptonOnboardingPassed) return

    if (currentUser.lang === "RU") {
      dispatch(setLanguage("RU"))
      i18n.changeLanguage("ru")
    } else {
      dispatch(setLanguage("EN"))
      i18n.changeLanguage("en")
    }
  }, [currentUser])

  useEffect(() => {
    if (countryCode) {
      dispatch(setCountryCode(countryCode.country))
    }
  }, [countryCode])

  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowHeight(window.innerHeight)
  //   }
  //   window.addEventListener("resize", handleResize)
  //   return () => {
  //     window.removeEventListener("resize", handleResize)
  //   }
  // }, [])

  // Ставим язык для пользователя
  useEffect(() => {
    if (USER_PREFERRED_LANGUAGE.startsWith("ru")) {
      dispatch(setLanguage("RU"))
      i18n.changeLanguage("ru")
    } else {
      dispatch(setLanguage("EN"))
      i18n.changeLanguage("en")
    }
  }, [])

  // if (windowHeight < 460) return <NotAvailableLandscapeMode />

  if (isLoading || isCountryLoading) return <LoadingScreen />

  if (isSuccess || authPassed) {
    if (!currentUser) return <LoadingScreen />

    if (!currentUser.isCryptonOnboardingPassed && !onboardingPassed)
      return (
        <AppOnboarding finishOnboarding={() => setOnboardingPassed(true)} />
      )

    return children
  }

  if (isError) {
    // @ts-expect-error RTKQ_NO_ERROR_TYPES
    if (error && error.originalStatus === 502) return <TechnicalWorks />

    // @ts-expect-error RTKQ_NO_ERROR_TYPES
    if (error && error.originalStatus === 429) return <Restricted />

    return <Auth setState={setAuthPassed} refetchUser={() => refetch()} />
  }
}

export default PreAuth
