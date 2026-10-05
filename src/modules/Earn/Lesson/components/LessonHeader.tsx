import Hearts from "@/modules/Header/Healths/Hearts"

const LessonHeader = ({
  activeBlock,
  totalBlocks,
  healthPoints,
}: {
  activeBlock: number
  totalBlocks: number
  healthPoints: number
}) => {
  const progress = activeBlock / totalBlocks

  if (activeBlock === totalBlocks) return null

  return (
    <div className="relative z-50 h-[30px] w-full items-center gap-2.5 bg-[#373D41]">
      <div
        className="absolute bottom-0 left-0 top-0 h-full w-full origin-left rounded-full bg-[#FF7D60] transition-all"
        style={{
          transform: `translateX(${progress === 1 ? 0 : -100 + (progress + 0.01) * 100}%)`,
        }}
      />

      {/* <div className="relative ml-auto mr-3.5 flex h-[30px] w-[30px] items-center justify-center">
        <HealthIconComponent
          maxHealth={5}
          currentHealth={healthPoints}
          classname={"h-5 w-5 phone-sm:h-6 phone-sm:w-6"}
        />
        <div
          className={cn(
            "absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0F1824] pt-0.5 text-[10px] font-bold text-white",
            healthPoints > 10 && "pl-px text-[9px]",
            healthPoints > 100 &&
              "pl-0.5 text-[8px] font-normal tracking-tighter",
          )}
        >
          {healthPoints}
        </div>
      </div> */}
      <Hearts totalHearts={5} activeHearts={healthPoints} />
    </div>
  )
}

export default LessonHeader
