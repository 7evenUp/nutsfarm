import { motion } from "framer-motion"

import DisabledRibbon1 from "@/assets/images/disabled-ribbon-1.png"
import DisabledRibbon2 from "@/assets/images/disabled-ribbon-2.png"
import DisabledRibbon3 from "@/assets/images/disabled-ribbon-3.png"

const template = ({ rotate, x }: { rotate: string; x: string }) => {
  return `rotate(${rotate}) translateX(${x})`
}

const DisabledPage = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <motion.img
        transformTemplate={template}
        initial={{ rotate: 17, x: "50%" }}
        animate={{ rotate: 17, x: ["50%", "-20%", "-40%"] }}
        transition={{ duration: 10, times: [0, 0.06, 1] }}
        src={DisabledRibbon1}
        className="absolute left-[calc(50%-63px)] top-[calc(50%+170px)] min-w-[2000px] max-w-[calc(100%+100px)]"
      />
      <motion.img
        transformTemplate={template}
        initial={{ rotate: -14, x: "-120%" }}
        animate={{ rotate: -14, x: ["-120%", "-75%", "-50%"] }}
        transition={{ duration: 10, times: [0, 0.06, 1], delay: 0.7 }}
        src={DisabledRibbon2}
        className="absolute left-[calc(50%-63px)] top-[calc(50%-320px)] min-w-[2000px] max-w-[calc(100%+100px)]"
      />
      <motion.img
        transformTemplate={template}
        initial={{ rotate: -3, x: "-140%" }}
        animate={{ rotate: -3, x: "-50%" }}
        transition={{ delay: 1.4, duration: 1, type: "spring" }}
        src={DisabledRibbon3}
        className="absolute left-[calc(50%-63px)] top-[calc(50%+48px)] min-w-[700px] max-w-[calc(100%+100px)]"
      />
    </div>
  )
}

export default DisabledPage
