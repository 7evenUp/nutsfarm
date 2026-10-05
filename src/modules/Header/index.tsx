import { useLocation } from "react-router-dom"

import MainHeader from "./MainHeader"
import LearnHeader from "./LearnHeader"

import GamesHeader from "../Games/components/Header/GamesHeader"

const Header = () => {
  const { pathname } = useLocation()

  if (pathname === "/pass") return null
  if (pathname === "/earn") return <LearnHeader />
  if (pathname.includes("/games")) return <GamesHeader />
  return <MainHeader />
}

export default Header
