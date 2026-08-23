import { useState } from 'react'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type OpenOrigin } from '../MediaLightbox'
import { originOf } from '../Gallery/origin'

const { gallery } = PROPERTY

/**
 * The photography, on a rail that travels sideways while the section holds.
 *
 * This is the route's showpiece: above 1024px the section pins and the rail
 * translates horizontally, so vertical scroll becomes horizontal travel. The
 * distance is measured from the rail's own overflow rather than guessed, and the
 * pin lasts exactly that far, so the two speeds match and it never feels geared
 * (see the pinned block in useKinetic).
 *
 * Below 1024px it is a plain vertical stack. A pinned section on a phone takes
 * over the only gesture the reader has, and the trade is not worth it.
 *
 * Plates alternate width and proportion from CSS so the rail reads as a
 * composition rather than a filmstrip; opening one reuses the site's existing
 * viewer, including its grow-from-the-plate transition.
 */
export function Gallery() {
  const [viewer, setViewer] = useState<{ index: number; origin: OpenOrigin } | null>(null)

  return (
    <section id="d2-gallery">
      <div className="d2-wrap" style={{ paddingTop: 'var(--d2-band)' }}>
        <p className="d2-kicker">{gallery.caption}</p>
        <h2
          className="d2-head d2-hide"
          data-k="lines"
          style={{ marginTop: '1.5rem', maxWidth: '16ch' }}
        >
          Inside <em>the tower</em>
        </h2>
      </div>

      <div
        className="d2-pin"
        data-k-pin
        style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)', paddingBottom: 'var(--d2-band)' }}
      >
        <div className="d2-rail" data-k-rail>
          {gallery.items.map((item, index) => (
            <button
              type="button"
              className="d2-plate"
              key={item.title}
              onClick={(event) => setViewer({ index, origin: originOf(event) })}
              aria-label={`Open ${item.title}`}
            >
              <span className="d2-plate-frame">
                <img
                  src={item.kind === 'video' ? item.poster : item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="d2-plate-cap">
                <span>{item.title}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <MediaLightbox
        items={gallery.items}
        index={viewer?.index ?? null}
        origin={viewer?.origin ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) => setViewer((open) => (open ? { ...open, index } : null))}
      />
    </section>
  )
}
