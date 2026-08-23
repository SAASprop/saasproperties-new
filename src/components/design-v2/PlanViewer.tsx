import { useCallback, useEffect, useRef, useState } from 'react'

export interface PlanSheet {
  label: string
  src: string
  totalSqm: number
  totalSqft: number
  baths: number
}

interface PlanViewerProps {
  sheets: PlanSheet[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/** Elements that can hold focus inside the dialog. */
const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen viewer for the floor plans.
 *
 * Purpose-built rather than reusing the site's MediaLightbox, for one reason:
 * these sheets are 1400x2489 — one to one point seven eight, taller than a
 * phone screen. The shared viewer caps media at 74vh, which is right for the
 * 16:9 photography it was built for and useless here: a 2489-tall drawing
 * contained inside 74vh of a laptop lands about 380px wide, where the room
 * labels and dimensions are unreadable. This is also why it could not simply be
 * changed — that viewer is shared with the production page.
 *
 * So this one has two modes and says which it is in:
 *
 *   Fit     the whole sheet inside the viewport, for orientation
 *   Detail  the sheet at a readable width, scrolling vertically
 *
 * Detail is the default, because someone who opened a floor plan full screen
 * came to read it. Fit is one tap away for taking in the layout as a whole.
 */
export function PlanViewer({ sheets, index, onClose, onNavigate }: PlanViewerProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const [mode, setMode] = useState<'detail' | 'fit'>('detail')

  const isOpen = index !== null
  const count = sheets.length
  const sheet = index === null ? null : sheets[index]

  const go = useCallback(
    (step: number) => {
      if (index === null) return
      onNavigate((index + step + count) % count)
      // A new sheet starts at its own top rather than wherever the last one
      // was left — scroll position is a property of the drawing being read.
      scroller.current?.scrollTo({ top: 0 })
    },
    [count, index, onNavigate],
  )

  // Keys, scroll lock and focus, all only while open.
  useEffect(() => {
    if (!isOpen) return

    restoreFocusTo.current = document.activeElement as HTMLElement | null
    dialog.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Padding by the scrollbar's width keeps the page behind from shifting.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const { overflow, paddingRight } = document.body.style
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      restoreFocusTo.current?.focus()
    }
  }, [isOpen, onClose, go])

  // Warm the neighbours so paging is instant.
  useEffect(() => {
    if (index === null) return
    for (const step of [1, -1]) {
      const next = sheets[(index + step + count) % count]
      if (next) {
        const img = new Image()
        img.src = next.src
      }
    }
  }, [index, sheets, count])

  /**
   * Horizontal swipe pages; vertical is left to the scroller.
   *
   * The gesture is only claimed once it is clearly sideways — more than 48px of
   * travel and steeper than 1.4:1 against the vertical — because the same
   * finger has to be able to scroll a very tall drawing.
   */
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') return
    swipe.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return
    go(dx < 0 ? 1 : -1)
  }

  if (!isOpen || !sheet) return null

  return (
    <div
      className="dv2-pv"
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${sheet.label} floor plan`}
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="dv2-pv-bar" onClick={(event) => event.stopPropagation()}>
        <div className="dv2-pv-id">
          <span className="dv2-num">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <span className="dv2-pv-name">{sheet.label}</span>
        </div>

        <div className="dv2-pv-tools">
          <button
            type="button"
            className="dv2-pv-mode"
            onClick={() => setMode(mode === 'detail' ? 'fit' : 'detail')}
            aria-pressed={mode === 'fit'}
          >
            {mode === 'detail' ? 'Fit to screen' : 'Detail'}
          </button>
          <button
            type="button"
            className="dv2-pv-btn"
            onClick={onClose}
            aria-label="Close floor plan"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
      </div>

      {/* The scroller is the click-outside target as well: the dark space
          around the sheet closes, the sheet itself does not. */}
      <div
        className="dv2-pv-scroll"
        data-mode={mode}
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <img
          // Keyed so paging remounts and the arrival transition replays.
          key={sheet.src}
          className="dv2-pv-sheet"
          src={sheet.src}
          alt={`${sheet.label} floor plan`}
          onClick={(event) => event.stopPropagation()}
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>

      <div className="dv2-pv-foot" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="dv2-pv-btn"
          onClick={() => go(-1)}
          aria-label="Previous floor plan"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 2L4 8l6 6" />
          </svg>
        </button>

        <span className="dv2-pv-meta">
          {sheet.baths} bath · {sheet.totalSqm.toFixed(2)} m² · {sheet.totalSqft.toFixed(0)} sq ft
        </span>

        <button
          type="button"
          className="dv2-pv-btn"
          onClick={() => go(1)}
          aria-label="Next floor plan"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 2l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
