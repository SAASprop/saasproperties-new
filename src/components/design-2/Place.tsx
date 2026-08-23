import { PROPERTY } from '../../lib/property'
import { FeatureGlyph } from '../FeatureGlyph'

const { location } = PROPERTY

/**
 * Where it stands.
 *
 * The travel times are the information here, so the minutes are what is large —
 * and each one counts up as it arrives, scrubbed, so scrolling back winds it
 * down again. Values come from the record's own location highlights; the
 * separate `travelTimes` list is left out because it is still marked unverified
 * in the data.
 */
export function Place() {
  return (
    <section className="d2-section" id="d2-place" data-k-scope>
      <div className="d2-wrap">
        <div className="d2-place">
          <div>
            <p className="d2-kicker">{location.caption}</p>
            <h2
              className="d2-head d2-hide"
              data-k="lines"
              style={{ marginTop: '1.5rem', maxWidth: '14ch' }}
            >
              Living <em>beyond limits</em>
            </h2>
            <p
              className="d2-lede d2-hide"
              data-k="rise"
              style={{ marginTop: '2rem', maxWidth: '42ch' }}
            >
              {location.body}
            </p>
            <p className="d2-label" style={{ marginTop: '2rem' }}>
              {location.coordinates}
            </p>
          </div>

          <div className="d2-map d2-hide" data-k="open">
            <iframe
              src={location.mapEmbedUrl}
              title={`${PROPERTY.name} on the map`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <span className="d2-map-edge" aria-hidden="true" />
          </div>
        </div>

        <div className="d2-times d2-hide" data-k="rules">
          {location.highlights.map((highlight) => (
            <div className="d2-time" key={highlight.label}>
              <span className="d2-rule" data-k-rule />
              <span className="d2-time-min" data-k="count" data-k-to={highlight.minutes} data-k-pad="true">
                {String(highlight.minutes).padStart(2, '0')}
              </span>
              <span className="d2-time-unit">min</span>
              <span className="d2-time-label">{highlight.label}</span>
              <FeatureGlyph icon={highlight.icon} className="d2-glyph" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
