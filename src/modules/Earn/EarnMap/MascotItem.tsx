import Rive from "@rive-app/react-webgl2"

import { cn } from "@/lib/cn"

const MascotItem = ({
  img,
  order,
  isFirst,
}: {
  img: string
  order: number
  isFirst: boolean
}) => {
  const splitedImg = img.split(".")
  const fileExtension = splitedImg[splitedImg.length - 1]

  if (!fileExtension) return null

  if (fileExtension === "riv") {
    return (
      <div
        className={cn(
          "max-w-[180px]",
          order % 2 == 0 && "ml-[140px] mt-[116px]",
          order % 2 == 1 && "-ml-[45px] mt-32",
          order % 2 == 0 && isFirst && "mt-8",
          order % 2 == 1 && isFirst && "mt-20",
        )}
      >
        <Rive src={img} className="h-[200px] w-[180px]" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative",
        order % 2 == 0 && "ml-[140px] mt-[116px]",
        order % 2 == 1 && "-ml-[45px] mt-32",
        order % 2 == 0 && isFirst && "mt-8",
        order % 2 == 1 && isFirst && "mt-20",
      )}
    >
      <img src={img} className="max-h-[200px] max-w-[180px]" />
    </div>
  )
}

export default MascotItem
