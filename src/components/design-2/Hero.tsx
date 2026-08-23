import { PROPERTY } from '../../lib/property'
import { PropertyMedia } from '../PropertyMedia'

/**
 * The opening frame, built around a SMALL wordmark.
 *
 * Both other designs set the property name as the largest thing on the page.
 * Here it is one of the smallest: a finely tracked line of display serif with a
 * hairline running out either side, centred low in the frame, the way a maison
 * sets its name on a bottle. The tracking closes slightly as you begin to
 * scroll (the `track` role in useKinetic), which is the whole gesture — the name
 * settles rather than arrives.
 *
 * What carries the frame instead is the photography and one italic line. The
 * specification sits along a hairline at the foot, so the top two thirds are
 * left as sky.
 */
export function Hero() {
  return (
    <section className="d2-hero" aria-label={`${PROPERTY.name} — opening`} data-k-scope>
      <div className="d2-hero-media">
        <div data-k="drift" data-k-drift="10" style={{ width: '100%', height: '100%' }}>
          <PropertyMedia media={PROPERTY.primaryMedia} active />
        </div>
      </div>

      <div className="d2-hero-veil" aria-hidden="true" />

      <div className="d2-hero-inner">
        <p className="d2-hero-serial">
          <span>{PROPERTY.eyebrow}</span>
          <span className="d2-marquee-dot" aria-hidden="true" />
          <span>{PROPERTY.status}</span>
        </p>

        <div className="d2-wordmark-row">
          <span className="d2-wordmark-rule" aria-hidden="true" />
          <h1 className="d2-wordmark" data-k="track">
            {PROPERTY.name}
          </h1>
          <span className="d2-wordmark-rule" data-side="right" aria-hidden="true" />
        </div>

        <p className="d2-hero-line d2-hide" data-k="rise">
          A tower of furnished residences at the heart of {PROPERTY.place.name}.
        </p>

        <div className="d2-hero-foot">
          {PROPERTY.specs.map((spec) => (
            <div className="d2-hero-cell" key={spec.label}>
              <span className="d2-label">{spec.label}</span>
              <span className="d2-value" style={{ fontSize: '0.95rem' }}>
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <span className="d2-scroll-cue" aria-hidden="true" />
    </section>
  )
}
