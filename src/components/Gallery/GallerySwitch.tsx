import { useId } from 'react'
import { motion } from 'framer-motion'
import { type GallerySet } from '../../lib/property'
import { useMotionDisabled } from '../../lib/motion'
import './gallery-switch.css'

/**
 * The switch itself.
 *
 * A lit marker slides between the labels rather than each one lighting up in
 * place — the movement is what tells you the two are alternatives to each other,
 * and it is the one flourish in a control that otherwise stays out of the way.
 * `layoutId` is what animates it: both states are the same element to
 * framer-motion, so it interpolates the box between them without either label
 * knowing where the other sits.
 *
 * Colour comes from the host section through `--gs-*`, so the same control reads
 * correctly on ink or on ivory. Radio semantics rather than buttons: these are
 * one choice among several, and a screen reader should say so.
 */
export function GallerySwitch({
  sets,
  activeId,
  onSelect,
  className = '',
}: {
  sets: GallerySet[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}) {
  const motionOff = useMotionDisabled()
  // Scopes the sliding marker to this instance, so two switches on one page
  // could never animate into each other.
  const uid = useId()

  // Nothing to switch between.
  if (sets.length < 2) return null

  return (
    <div className={`gs ${className}`.trim()} role="radiogroup" aria-label="Choose a gallery">
      {sets.map((set) => {
        const on = set.id === activeId

        return (
          <button
            key={set.id}
            type="button"
            role="radio"
            aria-checked={on}
            className="gs-opt"
            data-on={on ? 'true' : 'false'}
            onClick={() => onSelect(set.id)}
          >
            {on && (
              <motion.span
                layoutId={`gs-marker-${uid}`}
                className="gs-marker"
                aria-hidden="true"
                transition={
                  motionOff
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                }
              />
            )}

            <span className="gs-label">{set.label}</span>
            {/* How many frames are behind the label — the reason to press it. */}
            <span className="gs-count" aria-hidden="true">
              {String(set.items.length).padStart(2, '0')}
            </span>
          </button>
        )
      })}
    </div>
  )
}
