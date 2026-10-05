import Book1Icon from "@/assets/lesson-icons/book1.svg?react"
import Book2Icon from "@/assets/lesson-icons/book2.svg?react"
import Coin1Icon from "@/assets/lesson-icons/coin1.svg?react"
import Coin2Icon from "@/assets/lesson-icons/coin2.svg?react"
import Home1Icon from "@/assets/lesson-icons/home1.svg?react"
import Home2Icon from "@/assets/lesson-icons/home2.svg?react"
import UserPlusIcon from "@/assets/lesson-icons/user-plus.svg?react"
import BriefcaseIcon from "@/assets/lesson-icons/briefcase.svg?react"
import CoinsIcon from "@/assets/lesson-icons/coins.svg?react"
import BtcPlantIcon from "@/assets/lesson-icons/btc-plant.svg?react"
import Lesson5 from "@/assets/lesson-icons/lesson5.svg?react"
import Lesson6 from "@/assets/lesson-icons/lesson6.svg?react"
import Lesson8 from "@/assets/lesson-icons/lesson8.svg?react"
import Lesson10 from "@/assets/lesson-icons/lesson10.svg?react"
import Lesson11 from "@/assets/lesson-icons/lesson11.svg?react"
import SafetyIcon from "@/assets/lesson-icons/safety.svg?react"
import DiagramIcon from "@/assets/lesson-icons/diagram.svg?react"
import ToolsIcon from "@/assets/lesson-icons/tools.svg?react"
import LessonLockIcon from "@/assets/lesson-icons/lesson-lock.svg?react"
import Trade1Icon from "@/assets/lesson-icons/Trade1Icon.svg?react"
import Trade2Icon from "@/assets/lesson-icons/Trade2Icon.svg?react"
import TradingMainIcon from "@/assets/lesson-icons/TradingMainIcon.svg?react"
import Meme1Icon from "@/assets/lesson-icons/Meme1Icon.svg?react"
import Meme2Icon from "@/assets/lesson-icons/Meme2Icon.svg?react"
import Meme3Icon from "@/assets/lesson-icons/Meme3Icon.svg?react"
import MemesMainIcon from "@/assets/lesson-icons/MemesMainIcon.svg?react"
import LoupePNG from "@/assets/lesson-icons/loupe.png"
import ShoppingBagPNG from "@/assets/lesson-icons/shopping-bag.png"
import PsyIcon1 from "@/assets/lesson-icons/PsyIcon1.svg?react"
import PsyIcon2 from "@/assets/lesson-icons/PsyIcon2.svg?react"
import AnalyzeLesson1Icon from "@/assets/lesson-icons/analyze-lesson-1.svg?react"
import AnalyzeLesson2Icon from "@/assets/lesson-icons/analyze-lesson-2.svg?react"
import Ton1Icon from "@/assets/lesson-icons/Ton1Icon.svg?react"
import ScamIcon1 from "@/assets/lesson-icons/scam-lesson-1.svg?react"

// GIFTS
import Gift1 from "@/assets/lesson-icons/gifts/lesson1.svg?react"
import Gift2 from "@/assets/lesson-icons/gifts/lesson2.svg?react"
import Gift3 from "@/assets/lesson-icons/gifts/lesson3.svg?react"
import Gift4 from "@/assets/lesson-icons/gifts/lesson4.svg?react"
import Gift5 from "@/assets/lesson-icons/gifts/lesson5.svg?react"
import Gift6 from "@/assets/lesson-icons/gifts/lesson6.svg?react"
import Gift7 from "@/assets/lesson-icons/gifts/lesson7.svg?react"
import Gift8 from "@/assets/lesson-icons/gifts/lesson8.svg?react"
import Gift9 from "@/assets/lesson-icons/gifts/lesson9.svg?react"
import Gift10 from "@/assets/lesson-icons/gifts/lesson10.svg?react"
import Gift11 from "@/assets/lesson-icons/gifts/lesson11.svg?react"
import Gift12 from "@/assets/lesson-icons/gifts/lesson12.svg?react"
import Gift13 from "@/assets/lesson-icons/gifts/lesson13.svg?react"
import Gift14 from "@/assets/lesson-icons/gifts/lesson14.svg?react"
import Gift15 from "@/assets/lesson-icons/gifts/lesson15.svg?react"
import Gift16 from "@/assets/lesson-icons/gifts/lesson16.svg?react"

const LessonIcon = ({ icon }: { icon: string }) => {
  // GIFTS
  if (icon === "101") return <Gift1 className="h-11 w-[31px]" />
  if (icon === "102") return <Gift2 className="h-[39px] w-[36px]" />
  if (icon === "103") return <Gift3 className="h-[42px] w-[42px]" />
  if (icon === "104") return <Gift4 className="h-[36px] w-[42px]" />
  if (icon === "105") return <Gift5 className="h-[36px] w-[36px]" />
  if (icon === "106") return <Gift6 className="h-[50px] w-[38px]" />
  if (icon === "107") return <Gift7 className="h-[38px] w-[38px]" />
  if (icon === "108") return <Gift8 className="h-[36px] w-[36px]" />
  if (icon === "109") return <Gift9 className="h-[37px] w-[30px]" />
  if (icon === "110") return <Gift10 className="h-[44px] w-[39px]" />
  if (icon === "111") return <Gift11 className="h-[42px] w-[42px]" />
  if (icon === "112") return <Gift12 className="h-[45px] w-[39px]" />
  if (icon === "113") return <Gift13 className="h-[39px] w-[41px]" />
  if (icon === "114") return <Gift14 className="h-[44px] w-[36px]" />
  if (icon === "115") return <Gift15 className="h-[40px] w-[38px]" />
  if (icon === "116") return <Gift16 className="h-[40px] w-[38px]" />

  if (icon === "0") return <Book1Icon className="h-10 w-10" />
  if (icon === "1") return <Book2Icon className="h-10 w-10" />
  if (icon === "2") return <Coin1Icon className="h-[44px] w-[44px]" />
  if (icon === "3") return <Coin2Icon className="h-[44px] w-[44px]" />
  if (icon === "4") return <Home1Icon className="h-10 w-10" />
  if (icon === "5") return <Home2Icon className="h-10 w-10" />
  if (icon === "6") return <UserPlusIcon className="h-10 w-10" />
  if (icon === "7") return <Lesson5 className="h-10 w-10" />
  if (icon === "8") return <Lesson6 className="h-10 w-10" />
  if (icon === "9") return <BriefcaseIcon className="h-10 w-10" />
  if (icon === "10") return <Lesson8 className="h-10 w-10" />
  if (icon === "11")
    return <img alt="Loupe icon" src={LoupePNG} className="h-[42px] w-[42px]" />
  if (icon === "12")
    return (
      <img
        alt="Shopping Bag icon"
        src={ShoppingBagPNG}
        className="h-[44px] w-[44px]"
      />
    )
  if (icon === "13") return <Lesson10 className="h-[44px] w-[44px]" />
  if (icon === "14")
    return <Lesson11 className="h-[44px] w-[44px] -translate-y-1" />
  if (icon === "15") return <CoinsIcon className="h-10 w-10" />
  if (icon === "16") return <BtcPlantIcon className="h-[44px] w-[44px]" />
  if (icon === "18") return <SafetyIcon className="h-10 w-10" />
  if (icon === "19") return <DiagramIcon className="h-10 w-10" />
  if (icon === "20") return <ToolsIcon className="h-10 w-10" />
  if (icon === "21") return <LessonLockIcon className="h-10 w-10" />
  if (icon === "22") return <Trade1Icon className="h-10 w-10" />
  if (icon === "23") return <Trade2Icon className="h-10 w-10" />
  if (icon === "24") return <TradingMainIcon className="h-10 w-10" />
  if (icon === "25") return <Meme1Icon className="h-10 w-10" />
  if (icon === "26") return <Meme2Icon className="h-10 w-10" />
  if (icon === "27") return <Meme3Icon className="h-10 w-10" />
  if (icon === "28") return <MemesMainIcon className="h-10 w-10" />
  if (icon === "29") return <PsyIcon1 className="h-10 w-10" />
  if (icon === "30") return <PsyIcon2 className="h-10 w-10" />
  if (icon === "31") return <AnalyzeLesson1Icon className="h-10 w-10" />
  if (icon === "32") return <Ton1Icon className="h-10 w-10" />
  if (icon === "33") return <AnalyzeLesson2Icon className="h-10 w-10" />
  if (icon === "34") return <ScamIcon1 className="h-10 w-10" />

  try {
    new URL(icon)
    return <img alt="Lesson icon" src={icon} className="h-10 w-10" />
  } catch {
    return <Book1Icon className="h-10 w-10" />
  }
}

export default LessonIcon
