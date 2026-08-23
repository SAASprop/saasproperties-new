import { PROPERTY } from '../../lib/property'
import { PropertyMedia } from '../PropertyMedia'

/**
 * The opening frame.
 *
 * The name is set larger than anything else on either design and broken across
 * two lines, with the second stepped well in — that indent is the whole
 * composition, and it is what stops the block reading as a centred title the
 * way V1's does. Everything else is pushed to the edges: category and place at
 * the top, the specification row along the bottom rule, nothing in the middle.
 *
 * Media is the existing PropertyMedia, so the reel, its poster and the
 * reduced-motion still all behave exactly as they do on the live page.
 */
export function Hero() {
  const [first, second] = PROPERTY.displayLines

  return (
    <section className="dv2-hero" aria-label={`${PROPERTY.name} — opening`}>
      <div className="dv2-hero-media" data-dv2-drift-scope>
        <div data-dv2="drift">
          <PropertyMedia media={PROPERTY.primaryMedia} active />
        </div>
      </div>

      {/* Legibility over unpredictable footage. */}
      <div className="dv2-hero-scrim" aria-hidden="true" />
      {/* Closes the frame onto the ground the next section is painted in, so
          the reel does not stop against an edge. */}
      <div className="dv2-hero-seal" aria-hidden="true" />

      <div className="dv2-hero-inner">
        {/* Category and place stack top-left; the status takes the opposite
            corner. The status deliberately does NOT sit bottom-right — the
            motion switch is parked there, and the two collided. */}
        <div className="dv2-hero-top">
          <div className="dv2-meta-cell">
            <p className="dv2-eyebrow">{PROPERTY.eyebrow}</p>
            {/* Brighter than the meta labels along the bottom rule: those sit
                in the heavy part of the scrim, this one sits over open sky. */}
            <p className="dv2-meta-label" style={{ color: 'rgb(242 238 231 / 0.78)' }}>
              {PROPERTY.place.name} · {PROPERTY.place.detail}
            </p>
          </div>

          <p className="dv2-eyebrow">{PROPERTY.status}</p>
        </div>

        <div>
          <h1 className="dv2-display dv2-hero-name dv2-hide" data-dv2="mask">
            <span className="dv2-line">
              <span data-dv2-line>{first}</span>
            </span>
            <span className="dv2-line">
              <span data-dv2-line>{second}</span>
            </span>
          </h1>

          <div className="dv2-hero-foot">
            <div className="dv2-hero-meta dv2-hide" data-dv2="stagger">
              {PROPERTY.specs.map((spec) => (
                <div className="dv2-meta-cell" key={spec.label} data-dv2-item>
                  <span className="dv2-meta-label">{spec.label}</span>
                  <span className="dv2-meta-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
