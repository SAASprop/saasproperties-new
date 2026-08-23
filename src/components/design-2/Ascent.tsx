import { PROPERTY } from '../../lib/property'

const { overview } = PROPERTY

/**
 * The tower, revealed by scroll.
 *
 * The frame opens from the bottom as the section passes — a clip-path scrubbed
 * against scroll position, so the building rises out of the page under your
 * hand. It reads as the tower going up, which is the one place on the page where
 * a literal reading of the motion is the right one.
 *
 * The image inside drifts at a different rate from the frame, so the two are
 * never locked together.
 */
export function Ascent() {

  return (
    <section className="d2-section" id="d2-ascent" data-k-scope>
      <div className="d2-wrap">
        <div className="d2-ascent">
          <div className="d2-ascent-figure d2-hide" data-k="open">
            <div data-k="drift" data-k-drift="16" style={{ width: '100%', height: '112%' }}>
              <img
                src={overview.image.src}
                alt={overview.image.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="d2-ascent-copy">
            <p className="d2-kicker">Elevation</p>
            {/* Drawn from the record's own copy ("each finished and ready to
                move into") rather than invented. The property data states no
                floor count, unit mix beyond Studio–3 bed, or completion date,
                so nothing here claims one. */}
            <h2 className="d2-head d2-hide" data-k="lines">
              Every home <em>finished and ready</em> to move into
            </h2>
            {/* No paragraph here. The only unused prose in the record is the
                Overview's, which this section already sits below — repeating it
                would be filler, and the heading plus two figures carry the
                composition on their own. */}
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Bedrooms</span>
                <span className="d2-value">Studio – 3</span>
              </div>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Amenities</span>
                <span className="d2-value">
                  <span className="d2-num" data-k="count" data-k-to={PROPERTY.features.items.length}>
                    {PROPERTY.features.items.length}
                  </span>{' '}
                  on site
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
