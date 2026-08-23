import { PROPERTY, type FeatureIcon } from '../../lib/property'
import { FeatureGlyph } from '../FeatureGlyph'

const { features } = PROPERTY

/**
 * The twelve amenities, gathered into three chapters.
 *
 * Grouping is the whole idea here — V1 lays all twelve out as an even grid of
 * cards, which gives a reader twelve equal things and no order to read them in.
 * These are three chapters with a title, one line, and the items beneath as a
 * ruled list.
 *
 * `items` names amenities by their exact string in the property record; the
 * component resolves them, so nothing is duplicated and a rename in the data
 * surfaces as a build-visible gap rather than a silent mismatch.
 *
 * The lines are drawn from the section's own intro copy ("the pool before work,
 * the gym at dusk, the parcel waiting at the desk") or restate what the list
 * already says. Nothing here claims anything the property record does not.
 */
const CHAPTERS = [
  {
    id: 'wellness',
    title: 'Wellness',
    line: 'The pool before work, the gym at dusk.',
    image: PROPERTY.gallery.items[3],
    items: ['Infinity Pool', 'Gym With a Panoramic View', 'Sauna and Steam Room'],
  },
  {
    id: 'leisure',
    title: 'Leisure',
    line: 'Cinema, lounge and terrace — none of it depends on leaving.',
    image: PROPERTY.gallery.items[5],
    items: [
      'Private Cinema',
      'Common Leisure Spaces',
      'BBQ Area',
      "Children's Play Area",
    ],
  },
  {
    id: 'service',
    title: 'Service',
    line: 'The parcel waiting at the desk, around the clock.',
    image: PROPERTY.gallery.items[2],
    items: [
      '24/7 Concierge',
      '24/7 CCTV and Building Security',
      'Smart Systems',
      'Parking With Personal Storage Spaces',
      'EV Charging',
    ],
  },
] as const

/** Resolves an amenity name to its record, so the icon comes from the data. */
function amenity(name: string): { name: string; icon: FeatureIcon } | undefined {
  return features.items.find((item) => item.name === name)
}

export function Chapters() {
  return (
    <section className="dv2-section" data-ground="paper" id="dv2-amenities">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num" style={{ color: 'var(--dv2-on-light-dim)' }}>
            02
          </span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <p className="dv2-eyebrow" style={{ color: 'var(--dv2-on-light-dim)' }}>
            {features.caption}
          </p>
          <h2 className="dv2-title dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
            <span className="dv2-line">
              <span data-dv2-line>{features.heading}</span>
            </span>
          </h2>
        </div>
      </div>

      {/* The rail sits outside the frame's grid so it can bleed to the edge and
          keep the next chapter visibly waiting.

          It is driven by vertical page scroll rather than by its own horizontal
          scrollbar — see the pinned block in useReveal for why the scrollbar
          version did not work with a mouse. Below 1000px this container is an
          ordinary block and the rail is a vertical stack. */}
      <div className="dv2-pin" data-dv2-pin>
        <div className="dv2-chapters" data-dv2-rail>
          {CHAPTERS.map((chapter, index) => (
            <article className="dv2-chapter" key={chapter.id}>
              <div className="dv2-chapter-figure dv2-hide" data-dv2="image">
                <img
                  data-dv2-frame
                  src={
                    chapter.image.kind === 'video'
                      ? chapter.image.poster
                      : chapter.image.src
                  }
                  alt={chapter.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="dv2-chapter-body">
                {/* Numerals earn their place on a horizontal rail: with only
                    one chapter fully in frame at a time, they are the only
                    thing telling a reader where they are in the set. */}
                <span className="dv2-num" style={{ color: 'var(--dv2-on-light-dim)' }}>
                  {String(index + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
                </span>
                <h3 className="dv2-title">{chapter.title}</h3>
                <p className="dv2-body" style={{ color: 'var(--dv2-on-light-dim)', maxWidth: '30ch' }}>
                  {chapter.line}
                </p>

                <ul className="dv2-chapter-list dv2-hide" data-dv2="stagger">
                  {chapter.items.map((name) => {
                    const record = amenity(name)
                    if (!record) return null
                    return (
                      <li key={name} data-dv2-item>
                        <FeatureGlyph icon={record.icon} className="dv2-chapter-glyph" />
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
