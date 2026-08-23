import { PROPERTY } from '../../lib/property'

const { overview, specs, features } = PROPERTY

/**
 * Statement, specification, and the amenity ticker.
 *
 * The heading is split to WORDS and lit up as you scroll through it rather than
 * revealed once — the sentence is read at the speed you scroll, which is the
 * clearest single demonstration of what this route is doing differently.
 *
 * The ticker is the twelve amenities as a two-row marquee running against
 * itself. It is not a list to read: it is the section's texture, and it says
 * "there are a lot of these" faster than a grid can.
 */
export function Overture() {
  // Doubled, because the CSS animation translates by -50% to loop seamlessly.
  const ticker = [...features.items, ...features.items]

  return (
    <>
      <section className="d2-section" id="d2-overture">
        <div className="d2-wrap">
          <div className="d2-overture">
            <div>
              <p className="d2-kicker">{overview.caption}</p>
              <h2
                className="d2-head d2-hide"
                data-k="words"
                style={{ marginTop: '1.5rem', maxWidth: '20ch' }}
              >
                Furnished living at the <em>heart of Reem Island</em>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {overview.body.map((paragraph) => (
                <p className="d2-lede d2-hide" data-k="rise" key={paragraph.slice(0, 24)}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* The hairline above each column draws in sequence as the grid
              arrives, scrubbed, so scrolling back unwinds it. The index
              numerals are static: counting an ordinal from zero to four is
              motion for its own sake — the counters are kept for the two
              places on the page that show a real quantity. */}
          <div className="d2-spec-grid d2-hide" data-k="rules">
            {specs.map((spec, index) => (
              <div className="d2-spec" key={spec.label}>
                <span className="d2-rule" data-k-rule />
                <span className="d2-label">
                  <span className="d2-num">{String(index + 1).padStart(2, '0')}</span>
                  {'  '}
                  {spec.label}
                </span>
                <span className="d2-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="d2-marquee" aria-hidden="true">
        <div className="d2-marquee-row">
          {ticker.map((item, index) => (
            <span className="d2-marquee-item" key={`a-${index}`}>
              {item.name}
              <span className="d2-marquee-dot" />
            </span>
          ))}
        </div>
        <div className="d2-marquee-row" data-dir="back">
          {ticker.map((item, index) => (
            <span className="d2-marquee-item" data-tone="quiet" key={`b-${index}`}>
              {item.name}
              <span className="d2-marquee-dot" />
            </span>
          ))}
        </div>
        <span className="d2-marquee-edge" />
      </div>
    </>
  )
}
