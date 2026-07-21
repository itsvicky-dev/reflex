import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Options = {
  storageKey: string
  defaultWidth: number
  min: number
  max: number
  /** -1 flips drag direction, e.g. for a handle on the left edge of the resized element. */
  direction?: 1 | -1
}

function loadWidth(storageKey: string, defaultWidth: number, min: number, max: number): number {
  try {
    const stored = Number(localStorage.getItem(storageKey))
    return stored >= min && stored <= max ? stored : defaultWidth
  } catch {
    return defaultWidth
  }
}

export function useResizableWidth({ storageKey, defaultWidth, min, max, direction = 1 }: Options) {
  const [width, setWidth] = useState(() => loadWidth(storageKey, defaultWidth, min, max))
  const [dragging, setDragging] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width

  const startResize = useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = widthRef.current

      setDragging(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      function clamp(value: number) {
        return Math.min(max, Math.max(min, value))
      }

      function handleMove(moveEvent: PointerEvent) {
        const delta = (moveEvent.clientX - startX) * direction
        setWidth(clamp(startWidth + delta))
      }

      function handleUp(upEvent: PointerEvent) {
        const delta = (upEvent.clientX - startX) * direction
        const next = clamp(startWidth + delta)
        setWidth(next)
        try {
          localStorage.setItem(storageKey, String(next))
        } catch {
          // ignore
        }
        setDragging(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [direction, max, min, storageKey],
  )

  return { width, dragging, startResize }
}
