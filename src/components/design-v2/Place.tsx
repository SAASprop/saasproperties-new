import { PROPERTY } from '../../lib/property'
import { FeatureGlyph } from '../FeatureGlyph'

const { location } = PROPERTY

/**
 * Where it stands.
 *
 * The composition is lopsided on purpose: the statement takes the left two
 * thirds and the map is a tall portrait plate on the right, so the section reads
 * as a page of a monograph rather than as a text column above a wide map.
 *
 * The travel times are set as oversized numerals against a ruled grid — the
 * minutes are the information, so they are what is large. Values come from the
 * property record's own location highlights; the separate `travelTimes` list is
 * left out because it is still marked unverified in the data.
 */
export function Place() {
  return (
    <section className="dv2-section" data-ground="ink" id="dv2-place">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num">05</span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <div className="dv2-place">
            <div>
              <p className="dv2-eyebrow">{location.caption}</p>
              <h2 className="dv2-display dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
                <span className="dv2-line">
                  <span data-dv2-line>Living</span>
                </span>
                <span className="dv2-line">
                  <span data-dv2-line className="dv2-accent">
                    beyond limits
                  </span>
                </span>
              </h2>

              <p
                className="dv2-body dv2-hide"
                data-dv2="rise"
                style={{ marginTop: '2rem', maxWidth: '42ch' }}
              >
                {location.body}
              </p>

              <p className="dv2-num dv2-hide" data-dv2="rise" style={{ marginTop: '2rem' }}>
                {location.coordinates}
              </p>
            </div>

            <div className="dv2-map dv2-hide" data-dv2="image">
              <iframe
                data-dv2-frame
                src={location.mapEmbedUrl}
                title={`${PROPERTY.name} on the map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* Sinks the plate's top and bottom into the page, so the embed
                  does not stop against a hard edge. */}
              <span className="dv2-map-edge" aria-hidden="true" />
            </div>
          </div>

          <div className="dv2-times dv2-hide" data-dv2="stagger">
            {location.highlights.map((highlight) => (
              <div className="dv2-time" key={highlight.label} data-dv2-item>
                <span className="dv2-time-minutes">
                  {String(highlight.minutes).padStart(2, '0')}
                </span>
                <span className="dv2-time-unit">min</span>
                <span className="dv2-time-label">{highlight.label}</span>
                <FeatureGlyph
                  icon={highlight.icon}
                  className="dv2-chapter-glyph"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
