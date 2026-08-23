import { useMotionEnabled, useSetMotionEnabled } from '../lib/motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './motion-toggle.css'

/**
 * The motion switch, for showing the page with and without its scroll work.
 *
 * Quiet by default and louder on hover, in the same manner as the gallery's
 * variant toggle — it is a control for looking at the design, so it should not
 * become part of it.
 *
 * When the operating system asks for reduced motion the switch is disabled
 * rather than hidden. Leaving it live would let it read "On" while nothing
 * moved, which looks like a broken page instead of a respected preference.
 */
export function MotionToggle() {
  const enabled = useMotionEnabled()
  const setEnabled = useSetMotionEnabled()
  const reduced = usePrefersReducedMotion()

  const on = enabled && !reduced

  return (
    <button
      type="button"
      className="motion-toggle"
      onClick={() => setEnabled(!enabled)}
      disabled={reduced}
      aria-pressed={on}
      title={
        reduced
          ? 'Your system is set to reduce motion, so the scroll animations stay off.'
          : undefined
      }
    >
      <span className="motion-toggle__dot" data-on={on ? 'true' : 'false'} aria-hidden="true" />
      <span>Motion</span>
      <span className="motion-toggle__state">{reduced ? 'System' : on ? 'On' : 'Off'}</span>
    </button>
  )
}
