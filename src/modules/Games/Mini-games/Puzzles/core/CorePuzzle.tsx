import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import Loader from "@/assets/icons/loader.svg?react"

import { Sound } from "@/utils/Sound"
import { shuffleArray } from "@/utils/arrays"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
export interface CanvasPuzzleProps {
  startTime: number
  setStartTime: (time: number) => void
  imageSrc: string
  rows?: number
  columns?: number
  onSolved?: (elapsedTime: number, moveCount: number) => void
  movesRef: MutableRefObject<number>
}

interface PuzzlePiece {
  id: number
  solved: boolean
  inInventory: boolean
  x: number
  y: number
  srcX: number
  srcY: number
  srcSizeWidth: number
  srcSizeHeight: number
}

type DraggingState =
  | {
      mode: "pending"
      piece: PuzzlePiece
      startX: number
      startY: number
    }
  | {
      mode: "scroll"
      startX: number
      initialScroll: number
    }
  | {
      mode: "piece"
      piece: PuzzlePiece
      dragOffsetX: number
      dragOffsetY: number
      currentX: number
      currentY: number
    }
  | null

const S3CloudUrl =
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? "https://s3-nutsfarm.crypton.xyz"
    : "https://s3-nutsfarm-dev.crypton.xyz"

const pickSound = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-took-piece.mp3`,
)
const setUpSound = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-correct-placement.mp3`,
)
const wrongSound = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-incorrect-placement.mp3`,
)

const PIECE_GAP = 10
const MIN_BOTTOM_MARGIN = 14
const INVENTORY_PADDING = 16
const HORIZONTAL_THRESHOLD = 30
const VERTICAL_THRESHOLD = 3

const CanvasPuzzle: React.FC<CanvasPuzzleProps> = ({
  imageSrc,
  rows = 5,
  columns = 5,
  startTime,
  setStartTime,
  onSolved = () => {},
  movesRef,
}) => {
  const [containerPadding] = useState(0)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [inventoryScroll, setInventoryScroll] = useState<number>(0)
  const [dragging, setDragging] = useState<DraggingState>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerWidth, setContainerWidth] = useState(() => {
    return containerRef.current?.getBoundingClientRect().width || 0
  })
  const [containerHeight, setContainerHeight] = useState(() => {
    return containerRef.current?.getBoundingClientRect().height || 0
  })

  const solveTolerancePercentage = 0.2
  const DESKTOP_MARGIN_RATIO = rows === 3 ? 0.3 : rows === 4 ? 0.18 : 0.12

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement>(new Image())
  const gestureRef = useRef<{ startX: number; startY: number } | null>(null)
  const containerSizeRef = useRef({ width: 0, height: 0 })

  const { pieceSize, gameFieldSize } = useMemo(() => {
    const isMobileLayout = containerWidth <= 384
    const isSmallMobileLayout = containerWidth <= 350

    let baseSize: number

    if (rows === 3) {
      baseSize = isSmallMobileLayout ? 78 : isMobileLayout ? 86 : 94
    } else if (rows === 4) {
      baseSize = isSmallMobileLayout ? 72 : isMobileLayout ? 82 : 90
    } else {
      baseSize = isSmallMobileLayout ? 62 : isMobileLayout ? 68 : 72
    }

    const maxPossibleSize = Math.floor((containerWidth - 40) / rows)
    const finalSize = Math.min(baseSize, maxPossibleSize)

    return {
      pieceSize: finalSize,
      gameFieldSize: finalSize * rows,
    }
  }, [containerWidth, rows])

  const updateInventoryPositions = (
    piecesList: PuzzlePiece[],
    preserveOrder: boolean = false,
  ): PuzzlePiece[] => {
    const inventoryPieces = preserveOrder
      ? piecesList.filter((p) => p.inInventory)
      : [...piecesList.filter((p) => p.inInventory)]

    const availableHeight = containerHeight - gameFieldSize

    let bottomMargin = Math.max(
      MIN_BOTTOM_MARGIN,
      availableHeight * DESKTOP_MARGIN_RATIO,
    )

    const isMobile = containerWidth <= 384
    if (isMobile) {
      bottomMargin = MIN_BOTTOM_MARGIN
    }

    const startX = INVENTORY_PADDING

    return piecesList.map((p) => {
      if (p.inInventory) {
        const index = inventoryPieces.findIndex((ip) => ip.id === p.id)
        return {
          ...p,
          x: startX + index * (pieceSize + PIECE_GAP),
          y:
            gameFieldSize +
            (containerHeight - gameFieldSize - pieceSize - bottomMargin),
        }
      }

      return p
    })
  }

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
  ) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    ctx.stroke()
    ctx.restore()
  }

  const drawRoundedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number,
    radius: number,
  ) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(dx + radius, dy)
    ctx.lineTo(dx + dWidth - radius, dy)
    ctx.arcTo(dx + dWidth, dy, dx + dWidth, dy + radius, radius)
    ctx.lineTo(dx + dWidth, dy + dHeight - radius)
    ctx.arcTo(
      dx + dWidth,
      dy + dHeight,
      dx + dWidth - radius,
      dy + dHeight,
      radius,
    )
    ctx.lineTo(dx + radius, dy + dHeight)
    ctx.arcTo(dx, dy + dHeight, dx, dy + dHeight - radius, radius)
    ctx.lineTo(dx, dy + radius)
    ctx.arcTo(dx, dy, dx + radius, dy, radius)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.restore()
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const fieldOffsetX = (containerWidth - gameFieldSize) / 2
    const allSolved = pieces.length > 0 && pieces.every((p) => p.solved)

    if (allSolved) {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(fieldOffsetX + 4, 0)
      ctx.lineTo(fieldOffsetX + gameFieldSize - 4, 0)
      ctx.arcTo(
        fieldOffsetX + gameFieldSize,
        0,
        fieldOffsetX + gameFieldSize,
        4,
        4,
      )
      ctx.lineTo(fieldOffsetX + gameFieldSize, gameFieldSize - 4)
      ctx.arcTo(
        fieldOffsetX + gameFieldSize,
        gameFieldSize,
        fieldOffsetX + gameFieldSize - 4,
        gameFieldSize,
        4,
      )
      ctx.lineTo(fieldOffsetX + 4, gameFieldSize)
      ctx.arcTo(fieldOffsetX, gameFieldSize, fieldOffsetX, gameFieldSize - 4, 4)
      ctx.lineTo(fieldOffsetX, 4)
      ctx.arcTo(fieldOffsetX, 0, fieldOffsetX + 4, 0, 4)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        imageRef.current.naturalWidth,
        imageRef.current.naturalHeight,
        fieldOffsetX,
        0,
        gameFieldSize,
        gameFieldSize,
      )

      ctx.restore()
      ctx.strokeStyle = "#050D12"
      ctx.beginPath()
      ctx.moveTo(fieldOffsetX + 4, 0)
      ctx.lineTo(fieldOffsetX + gameFieldSize - 4, 0)
      ctx.arcTo(
        fieldOffsetX + gameFieldSize,
        0,
        fieldOffsetX + gameFieldSize,
        4,
        4,
      )
      ctx.lineTo(fieldOffsetX + gameFieldSize, gameFieldSize - 4)
      ctx.arcTo(
        fieldOffsetX + gameFieldSize,
        gameFieldSize,
        fieldOffsetX + gameFieldSize - 4,
        gameFieldSize,
        4,
      )
      ctx.lineTo(fieldOffsetX + 4, gameFieldSize)
      ctx.arcTo(fieldOffsetX, gameFieldSize, fieldOffsetX, gameFieldSize - 4, 4)
      ctx.lineTo(fieldOffsetX, 4)
      ctx.arcTo(fieldOffsetX, 0, fieldOffsetX + 4, 0, 4)
      ctx.closePath()
      ctx.stroke()
      return
    }

    // Отрисовка ячеек игрового поля
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = fieldOffsetX + col * pieceSize
        const y = row * pieceSize
        drawRoundedRect(
          ctx,
          x,
          y,
          pieceSize,
          pieceSize,
          4,
          "rgba(244,215,183,0.90)",
          "#9F5804",
          2,
        )
      }
    }

    // Отрисовка статичных пазлов
    const staticPieces = pieces.filter(
      (p) => !(dragging?.mode === "piece" && p.id === dragging.piece.id),
    )
    staticPieces.forEach((piece) => {
      const drawX = piece.inInventory
        ? piece.x - inventoryScroll
        : fieldOffsetX + piece.x
      const drawY = piece.y
      drawRoundedImage(
        ctx,
        imageRef.current,
        piece.srcX,
        piece.srcY,
        piece.srcSizeWidth,
        piece.srcSizeHeight,
        drawX,
        drawY,
        pieceSize,
        pieceSize,
        4,
      )
      ctx.strokeStyle = "#9F5804"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(drawX + 4, drawY)
      ctx.lineTo(drawX + pieceSize - 4, drawY)
      ctx.arcTo(drawX + pieceSize, drawY, drawX + pieceSize, drawY + 4, 4)
      ctx.lineTo(drawX + pieceSize, drawY + pieceSize - 4)
      ctx.arcTo(
        drawX + pieceSize,
        drawY + pieceSize,
        drawX + pieceSize - 4,
        drawY + pieceSize,
        4,
      )
      ctx.lineTo(drawX + 4, drawY + pieceSize)
      ctx.arcTo(drawX, drawY + pieceSize, drawX, drawY + pieceSize - 4, 4)
      ctx.lineTo(drawX, drawY + 4)
      ctx.arcTo(drawX, drawY, drawX + 4, drawY, 4)
      ctx.closePath()
      ctx.stroke()
    })

    // Отрисовка перетаскиваемого пазла
    if (dragging?.mode === "piece") {
      const { currentX, currentY, piece } = dragging
      drawRoundedImage(
        ctx,
        imageRef.current,
        piece.srcX,
        piece.srcY,
        piece.srcSizeWidth,
        piece.srcSizeHeight,
        currentX,
        currentY,
        pieceSize,
        pieceSize,
        4,
      )
      ctx.strokeStyle = "#9F5804"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(currentX + 4, currentY)
      ctx.lineTo(currentX + pieceSize - 4, currentY)
      ctx.arcTo(
        currentX + pieceSize,
        currentY,
        currentX + pieceSize,
        currentY + 4,
        4,
      )
      ctx.lineTo(currentX + pieceSize, currentY + pieceSize - 4)
      ctx.arcTo(
        currentX + pieceSize,
        currentY + pieceSize,
        currentX + pieceSize - 4,
        currentY + pieceSize,
        4,
      )
      ctx.lineTo(currentX + 4, currentY + pieceSize)
      ctx.arcTo(
        currentX,
        currentY + pieceSize,
        currentX,
        currentY + pieceSize - 4,
        4,
      )
      ctx.lineTo(currentX, currentY + 4)
      ctx.arcTo(currentX, currentY, currentX + 4, currentY, 4)
      ctx.closePath()
      ctx.stroke()
    }
  }

  const handleMouseDown = (evt: React.MouseEvent | React.TouchEvent) => {
    const e = (evt as React.TouchEvent).touches
      ? (evt as React.TouchEvent).touches[0]
      : (evt as React.MouseEvent)
    const { x, y } = getCanvasCoords(e)
    gestureRef.current = { startX: x, startY: y }

    const clickedPiece = [...pieces].reverse().find((piece) => {
      if (piece.solved) return false
      const pieceX = piece.inInventory
        ? piece.x - inventoryScroll
        : (containerWidth - gameFieldSize) / 2 + piece.x
      return (
        x >= pieceX &&
        x <= pieceX + pieceSize &&
        y >= piece.y &&
        y <= piece.y + pieceSize
      )
    })

    if (clickedPiece) {
      setDragging({
        mode: "pending",
        piece: clickedPiece,
        startX: x,
        startY: y,
      })
    } else if (y >= gameFieldSize) {
      setMoveCount((prev) => prev + 1)
      setDragging({
        mode: "scroll",
        startX: x,
        initialScroll: inventoryScroll,
      })
    }
  }

  const handleMouseMove = (evt: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return
    const e = (evt as React.TouchEvent).touches
      ? (evt as React.TouchEvent).touches[0]
      : (evt as React.MouseEvent)
    const { x, y } = getCanvasCoords(e)

    if (dragging.mode === "pending") {
      const dx = x - dragging.startX
      const dy = y - dragging.startY

      if (Math.abs(dx) > HORIZONTAL_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        setDragging({
          mode: "scroll",
          startX: x,
          initialScroll: inventoryScroll,
        })
        return
      }
      if (dy < -VERTICAL_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
        pickSound.play()
        movesRef.current++
        setPieces((prev) =>
          updateInventoryPositions(
            prev.map((p) =>
              p.id === dragging.piece.id ? { ...p, inInventory: false } : p,
            ),
          ),
        )
        setDragging({
          mode: "piece",
          piece: dragging.piece,
          dragOffsetX: pieceSize / 2,
          dragOffsetY: pieceSize / 2,
          currentX: x - pieceSize / 2,
          currentY: y - pieceSize / 2,
        })
        return
      }
      return
    } else if (dragging.mode === "scroll") {
      const dx = x - dragging.startX
      let newScroll = dragging.initialScroll - dx

      // Максимальный скролл = общая ширина - видимая область
      const maxScroll = Math.max(0, getInventoryWidth() - containerWidth)
      newScroll = Math.min(Math.max(0, newScroll), maxScroll)

      setInventoryScroll(newScroll)
    } else if (dragging.mode === "piece") {
      setDragging({
        ...dragging,
        currentX: x - dragging.dragOffsetX,
        currentY: y - dragging.dragOffsetY,
      })
    }
  }

  const handleMouseUp = () => {
    if (!dragging) return
    if (dragging.mode === "pending" || dragging.mode === "scroll") {
      setPieces((prev) => updateInventoryPositions(prev))
      setDragging(null)
      return
    }
    if (dragging.mode === "piece") {
      const { piece, currentX, currentY } = dragging
      const fieldOffsetX = (containerWidth - gameFieldSize) / 2
      const puzzleCenterX = currentX + pieceSize / 2
      const puzzleCenterY = currentY + pieceSize / 2
      const targetCenterX =
        fieldOffsetX + (piece.id % columns) * pieceSize + pieceSize / 2
      const targetCenterY =
        Math.floor(piece.id / columns) * pieceSize + pieceSize / 2
      const dx = puzzleCenterX - targetCenterX
      const dy = puzzleCenterY - targetCenterY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const threshold = solveTolerancePercentage * gameFieldSize

      if (distance <= threshold) {
        makeHapticFeedback({ notificationOccured: "success" })
        setUpSound.play()
        setPieces((prev) => {
          const newPieces = prev.map((p) =>
            p.id === piece.id
              ? {
                  ...p,
                  x: (piece.id % columns) * pieceSize,
                  y: Math.floor(piece.id / columns) * pieceSize,
                  solved: true,
                  inInventory: false,
                }
              : p,
          )

          // Обновляем позиции пазлов в инвентаре
          const updatedPieces = updateInventoryPositions(newPieces)

          // Сбрасываем скролл, если он выходит за новые границы
          const newInventoryWidth = getInventoryWidth()
          const maxScroll = Math.max(0, newInventoryWidth - containerWidth)
          if (inventoryScroll > maxScroll) {
            setInventoryScroll(maxScroll)
          }

          if (updatedPieces.every((p) => p.solved)) {
            onSolved(Date.now() - startTime, moveCount + 1)
          }
          return updatedPieces
        })
      } else {
        wrongSound.play()
        makeHapticFeedback({ notificationOccured: "error" })
        setPieces((prev) => {
          const newPieces = updateInventoryPositions(
            prev.map((p) =>
              p.id === piece.id ? { ...p, inInventory: true } : p,
            ),
          )

          // Сбрасываем скролл, если он выходит за новые границы
          const newInventoryWidth = getInventoryWidth()
          const maxScroll = Math.max(0, newInventoryWidth - containerWidth)
          if (inventoryScroll > maxScroll) {
            setInventoryScroll(maxScroll)
          }

          return newPieces
        })
      }
    }
    setDragging(null)
    gestureRef.current = null
  }

  const getCanvasCoords = (e: React.MouseEvent | React.Touch) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const getInventoryWidth = (): number => {
    const count = pieces.filter((p) => p.inInventory).length
    return (
      INVENTORY_PADDING * 2 +
      count * pieceSize +
      Math.max(0, count - 1) * PIECE_GAP
    )
  }

  useEffect(() => {
    const img = imageRef.current
    let isMounted = true

    const handleImageLoad = async () => {
      if (!isMounted) return

      // Дожидаемся актуальных размеров контейнера
      requestAnimationFrame(() => {
        const srcPieceWidth = img.naturalWidth / columns
        const srcPieceHeight = img.naturalHeight / rows

        const initialPieces = Array.from(
          { length: rows * columns },
          (_, i) => ({
            id: i,
            solved: false,
            inInventory: true,
            x: 0,
            y: 0,
            srcX: (i % columns) * srcPieceWidth,
            srcY: Math.floor(i / columns) * srcPieceHeight,
            srcSizeWidth: srcPieceWidth,
            srcSizeHeight: srcPieceHeight,
          }),
        )

        const shuffledPieces = shuffleArray(initialPieces)
        const positionedPieces = updateInventoryPositions(shuffledPieces, true)

        if (!isMounted) return

        setPieces(positionedPieces)
        setIsLoading(false)
        setStartTime(Date.now())
      })
    }

    const loadImage = async () => {
      setIsLoading(true)
      try {
        img.src = imageSrc
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        await handleImageLoad()
      } catch (error) {
        console.error("Error loading image:", error)
        setIsLoading(false)
      }
    }

    loadImage()

    return () => {
      isMounted = false
      img.onload = null
    }
  }, [imageSrc, rows, columns, setStartTime, containerHeight])

  useEffect(() => {
    const rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [pieces, dragging, inventoryScroll, containerWidth])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSizes = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight

      if (
        newWidth !== containerSizeRef.current.width ||
        newHeight !== containerSizeRef.current.height
      ) {
        containerSizeRef.current = { width: newWidth, height: newHeight }
        setContainerWidth(newWidth)
        setContainerHeight(newHeight)
      }
    }

    // Инициализируем начальные размеры
    updateSizes()

    const observer = new ResizeObserver(updateSizes)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpi = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpi
    canvas.height = containerHeight * dpi
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(dpi, dpi)
  }, [containerWidth, containerHeight])

  useEffect(() => {
    draw()
  }, [pieces, dragging, inventoryScroll, containerWidth])

  useEffect(() => {
    Promise.all([pickSound.load(), setUpSound.load(), wrongSound.load()])
  }, [])

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Promise.all([
          pickSound.load(),
          setUpSound.load(),
          wrongSound.load(),
        ])
      } catch (e) {
        console.error("Error loading sounds:", e)
      }
    }

    loadSounds()
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 touch-none pb-10"
      style={{
        margin: "0 auto",
        padding: `0 ${containerPadding}px`,
        boxSizing: "border-box",
      }}
    >
      {isLoading ? (
        <div className="absolute left-[1/2] top-1/2 flex w-full justify-center">
          <Loader className="h-16 w-16 animate-spin" />
        </div>
      ) : (
        <canvas
          className="block w-full"
          style={{
            height: `${containerHeight}px`,
            paddingBottom: MIN_BOTTOM_MARGIN,
          }}
          ref={canvasRef}
          width={containerWidth}
          height={containerHeight}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onMouseMove={handleMouseMove}
        />
      )}
    </div>
  )
}

export default CanvasPuzzle
