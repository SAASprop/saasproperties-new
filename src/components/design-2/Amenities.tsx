import { PROPERTY, type FeatureIcon } from '../../lib/property'
import { FeatureGlyph } from '../FeatureGlyph'

const { features, gallery } = PROPERTY

/**
 * The twelve amenities as a stack of cards that deal themselves.
 *
 * Each card sticks below the one before it and the next slides over the top, so
 * the section builds into a deck as you scroll and unbuilds as you scroll back.
 * It is `position: sticky` and a per-card top offset — no pinning, no scroll
 * hijack, and no JavaScript at all, which is why it behaves correctly under
 * touch where a pinned equivalent would fight the gesture.
 *
 * Cards name amenities by their exact string in the property record and resolve
 * them here, so the icons come from the data and a rename shows up as a gap
 * rather than a silent mismatch. Every line is drawn from the section's own
 * intro copy or restates the list.
 */
const CARDS = [
  {
    id: 'water',
    index: 'I',
    title: 'Water & air',
    line: 'The pool before work, the gym at dusk.',
    image: gallery.items[3],
    items: ['Infinity Pool', 'Gym With a Panoramic View', 'Sauna and Steam Room'],
  },
  {
    id: 'hours',
    index: 'II',
    title: 'The off hours',
    line: 'Cinema, lounge, terrace — none of it depends on leaving.',
    image: gallery.items[5],
    items: ['Private Cinema', 'Common Leisure Spaces', 'BBQ Area', "Children's Play Area"],
  },
  {
    id: 'kept',
    index: 'III',
    title: 'Kept for you',
    line: 'The parcel waiting at the desk, around the clock.',
    image: gallery.items[1],
    items: [
      '24/7 Concierge',
      '24/7 CCTV and Building Security',
      'Smart Systems',
      'Parking With Personal Storage Spaces',
      'EV Charging',
    ],
  },
] as const

function amenity(name: string): { name: string; icon: FeatureIcon } | undefined {
  return features.items.find((item) => item.name === name)
}

export function Amenities() {
  return (
    <section className="d2-section" id="d2-amenities">
      <div className="d2-wrap">
        <p className="d2-kicker">{features.caption}</p>
        <h2
          className="d2-head d2-hide"
          data-k="lines"
          style={{ marginTop: '1.5rem', maxWidth: '18ch' }}
        >
          Everything <em>already inside</em> the building
        </h2>

        <div className="d2-stack">
          {CARDS.map((card, index) => (
            <article
              className="d2-card"
              key={card.id}
              // Each card stops a little lower than the last, so the edges of
              // the ones beneath stay visible as the deck builds.
              style={{ '--d2-card-step': `${index * 1.75}rem` } as React.CSSProperties}
            >
              <div className="d2-card-figure">
                <img
                  src={card.image.kind === 'video' ? card.image.poster : card.image.src}
                  alt={card.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="d2-card-body">
                {/* Set in the display face rather than at kicker size: a single
                    letterspaced "I" at 9px reads as a speck of dust, not as a
                    numeral. */}
                <p
                  className="d2-num"
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    letterSpacing: '0.22em',
                    color: 'var(--d2-champagne)',
                  }}
                >
                  {card.index}
                </p>
                <h3 className="d2-head" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
                  {card.title}
                </h3>
                <p className="d2-lede" style={{ maxWidth: '32ch' }}>
                  {card.line}
                </p>

                <ul className="d2-card-list">
                  {card.items.map((name) => {
                    const record = amenity(name)
                    if (!record) return null
                    return (
                      <li key={name}>
                        <FeatureGlyph icon={record.icon} className="d2-glyph" />
                        <span>{record.name}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
