import { useCallback, useMemo, useRef, useState } from 'react'
import { PROPERTY } from '../../lib/property'
import { PlanViewer, type PlanSheet } from './PlanViewer'

const { floorPlans } = PROPERTY

/**
 * The layouts, as a carousel with a controlled viewing area.
 *
 * The problem this solves: the sheets are 1400x2489. Shown at their natural
 * ratio the section became a column of drawings each taller than the window, so
 * reaching the second layout meant scrolling past the whole of the first. The
 * fix is presentational, not a crop — the stage is sized by HEIGHT
 * (`min(66vh, 660px)`) with the sheet's own aspect ratio deriving the width, so
 * one whole plan sits in view at a time and the next is a step sideways rather
 * than a scroll away.
 *
 * At that size the room labels are legible but the dimensions are not, which is
 * the honest trade — the stage is for choosing a layout, and the viewer is for
 * reading one. Hence the click target and the hint on the frame.
 *
 * Names come from the property record: Studio, 1 Bedroom, 2 Bedroom, 3 Bedroom.
 */
export function Plans() {
  const [active, setActive] = useState(0)
  /** Which way the last move went, so the transition slides to match. */
  const [direction, setDirection] = useState(1)
  const [open, setOpen] = useState<number | null>(null)

  // Plans with no drawing yet are skipped, so neither the stage nor the viewer
  // can land on an empty frame.
  const sheets = useMemo<PlanSheet[]>(
    () =>
      floorPlans.plans
        .filter((entry) => entry.image !== null)
        .map((entry) => ({
          label: entry.label,
          src: entry.image as string,
          totalSqm: entry.totalSqm,
          totalSqft: entry.totalSqft,
          baths: entry.baths,
        })),
    [],
  )

  const count = sheets.length
  const sheet = sheets[active]

  const go = useCallback(
    (step: number) => {
      setDirection(step)
      setActive((current) => (current + step + count) % count)
    },
    [count],
  )

  /**
   * Drag and swipe, on pointer events rather than a library.
   *
   * A discrete carousel needs a direction and a threshold, not momentum, so
   * Draggable and its inertia would be more moving parts for less control. The
   * stage keeps `touch-action: pan-y`, so a vertical swipe still scrolls the
   * page and only a clearly sideways one pages the carousel.
   */
  const drag = useRef<{ x: number; y: number; id: number } | null>(null)
  const moved = useRef(false)

  const onPointerDown = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    moved.current = false
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    if (!start || start.id !== event.pointerId) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) return

    moved.current = true
    go(dx < 0 ? 1 : -1)
  }

  if (count === 0) return null

  return (
    <section className="dv2-section" data-ground="paper" id="dv2-plans">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num" style={{ color: 'var(--dv2-on-light-dim)' }}>
            04
          </span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <p className="dv2-eyebrow" style={{ color: 'var(--dv2-on-light-dim)' }}>
            {floorPlans.caption}
          </p>
          <h2 className="dv2-title dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
            <span className="dv2-line">
              <span data-dv2-line>{floorPlans.heading}</span>
            </span>
          </h2>
          <p
            className="dv2-body dv2-hide"
            data-dv2="rise"
            style={{ marginTop: '1.5rem', maxWidth: '38ch', color: 'var(--dv2-on-light-dim)' }}
          >
            {floorPlans.intro}
          </p>

          <div className="dv2-pc">
            {/* Left: which layout, and its figures. */}
            <div className="dv2-pc-aside">
              <span className="dv2-num" style={{ color: 'var(--dv2-on-light-dim)' }}>
                {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>

              {/* Keyed so the name remounts and its arrival replays. */}
              <h3 className="dv2-pc-name" key={sheet.label}>
                {sheet.label}
              </h3>

              <div className="dv2-pc-figs">
                <div className="dv2-meta-cell">
                  <span className="dv2-meta-label" style={{ color: 'var(--dv2-on-light-dim)' }}>
                    Bathrooms
                  </span>
                  <span className="dv2-meta-value" style={{ color: 'var(--dv2-on-light)' }}>
                    {sheet.baths}
                  </span>
                </div>
                <div className="dv2-meta-cell">
                  <span className="dv2-meta-label" style={{ color: 'var(--dv2-on-light-dim)' }}>
                    Total area
                  </span>
                  <span className="dv2-meta-value" style={{ color: 'var(--dv2-on-light)' }}>
                    {sheet.totalSqm.toFixed(2)} m²
                  </span>
                </div>
                <div className="dv2-meta-cell">
                  <span className="dv2-meta-label" style={{ color: 'var(--dv2-on-light-dim)' }}>
                    Total area
                  </span>
                  <span className="dv2-meta-value" style={{ color: 'var(--dv2-on-light)' }}>
                    {sheet.totalSqft.toFixed(0)} sq ft
                  </span>
                </div>
              </div>

              {/* Controls. Deliberately quiet — hairline circles and a row of
                  ticks, no chevron slabs. */}
              <div className="dv2-pc-controls">
                <button
                  type="button"
                  className="dv2-pc-arrow"
                  onClick={() => go(-1)}
                  aria-label="Previous layout"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M10 2L4 8l6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="dv2-pc-arrow"
                  onClick={() => go(1)}
                  aria-label="Next layout"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M6 2l6 6-6 6" />
                  </svg>
                </button>

                <div className="dv2-pc-ticks" role="tablist" aria-label="Layouts">
                  {sheets.map((entry, index) => (
                    <button
                      key={entry.label}
                      type="button"
                      role="tab"
                      className="dv2-pc-tick"
                      aria-selected={index === active}
                      aria-label={entry.label}
                      onClick={() => {
                        setDirection(index > active ? 1 : -1)
                        setActive(index)
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="dv2-disclaimer">{floorPlans.disclaimer}</p>
            </div>

            {/* Right: the stage. Height-led, so one whole sheet is in view. */}
            <div
              className="dv2-pc-stage"
              style={{ '--dv2-pc-from': `${direction * 3}%` } as React.CSSProperties}
            >
              <button
                type="button"
                className="dv2-pc-frame"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onClick={() => {
                  // A drag that paged the carousel must not also open the
                  // viewer; the pointer-up above sets this immediately before
                  // the click arrives.
                  if (moved.current) {
                    moved.current = false
                    return
                  }
                  setOpen(active)
                }}
                aria-label={`Inspect the ${sheet.label} floor plan`}
              >
                <img
                  key={sheet.src}
                  className="dv2-pc-sheet"
                  src={sheet.src}
                  alt={`${sheet.label} floor plan — ${PROPERTY.name}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className="dv2-pc-hint">Click to inspect</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <PlanViewer
        sheets={sheets}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </section>
  )
}
