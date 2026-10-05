import useEmblaCarousel from "embla-carousel-react"

import { Nutcracker } from "@/types/nutcracker"

const NutcrackersNftCarousel = ({
  nutcrackers,
}: {
  nutcrackers: Nutcracker[]
}) => {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  if (nutcrackers.length === 0) return null

  return (
    <div className="mt-9 flex min-h-[275px] flex-col gap-4 phone-sm-fix:min-h-[295px] h-screen-700:phone:min-h-[320px]">
      <p className="pl-3.5 font-tt-hoves-expanded text-lg font-semibold">
        NFT / Nutcrackers
      </p>
      <div
        className="w-full cursor-grab overflow-hidden px-3.5 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-3 phone-sm-fix:gap-4">
          {nutcrackers.map((nutcracker) => (
            <button
              aria-label={`Open nutcracker info: ${nutcracker.name}`}
              key={nutcracker.id}
              className="flex min-w-[172px] flex-col items-start phone-sm:min-w-[172px] phone-sm-fix:min-w-[192px] h-screen-700:phone:min-w-[220px]"
            >
              <img
                src={nutcracker.imageLink}
                alt={nutcracker.name}
                className="mb-3 h-[172px] w-[172px] rounded-[12px] bg-[#17202D] object-cover phone-sm:h-[172px] phone-sm:w-[172px] phone-sm-fix:mb-4 phone-sm-fix:h-[192px] phone-sm-fix:w-[192px] h-screen-700:phone:h-[220px] h-screen-700:phone:w-[220px]"
              />
              <p className="text-left text-base font-semibold leading-[24px] text-white phone-sm-fix:text-lg phone-sm-fix:leading-[22px]">
                {nutcracker.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NutcrackersNftCarousel
