import { useState } from 'react'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type OpenOrigin } from '../MediaLightbox'
import { GallerySwitch } from '../Gallery/GallerySwitch'
import { useGallerySets } from '../../hooks/useGallerySets'
import { originOf } from '../Gallery/origin'

const { gallery } = PROPERTY

/**
 * The photography, as a plate sequence rather than a carousel.
 *
 * V1 turns the images on a 3D cylinder — a single moving object you watch. This
 * is the opposite proposition: the frames hold still and the reader travels,
 * which is how architectural photography is normally published. A lead frame
 * carries the film, then five plates at different spans and vertical offsets so
 * the eye moves diagonally down the page instead of scanning rows.
 *
 * The offsets are in CSS (`.dv2-plate:nth-child`), not here, so the sequence
 * stays legible as markup.
 *
 * Opening a frame reuses the site's existing viewer, including its
 * grow-from-the-card transition — that is real functionality and there was no
 * reason to build a second one.
 */
export function Collection() {
  const [viewer, setViewer] = useState<{ index: number; origin: OpenOrigin } | null>(null)

  const { sets, activeId, select, items } = useGallerySets()

  const [lead, ...plates] = items

  const open = (index: number) => (event: React.MouseEvent<HTMLButtonElement>) =>
    setViewer({ index, origin: originOf(event) })

  return (
    <section className="dv2-section" data-ground="ink" id="dv2-collection">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num">03</span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <p className="dv2-eyebrow">{gallery.caption}</p>
          <h2 className="dv2-title dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
            <span className="dv2-line">
              <span data-dv2-line>{gallery.heading}</span>
            </span>
          </h2>

          <GallerySwitch
            sets={sets}
            activeId={activeId}
            onSelect={select}
            className="dv2-switch"
          />

          <button
            type="button"
            className="dv2-lead dv2-hide"
            data-dv2="image"
            onClick={open(0)}
            aria-label={`Open ${lead.title}`}
          >
            <img
              data-dv2-frame
              src={lead.kind === 'video' ? lead.poster : lead.src}
              alt={lead.alt}
              loading="lazy"
              decoding="async"
            />
            <span className="dv2-lead-caption">
              <span className="dv2-meta-value">{lead.title}</span>
              <span className="dv2-num">
                01 / {String(items.length).padStart(2, '0')}
              </span>
            </span>
          </button>

          <div className="dv2-plates">
            {plates.map((item, index) => (
              <button
                type="button"
                className="dv2-plate dv2-hide"
                data-dv2="image"
                key={item.title}
                onClick={open(index + 1)}
                aria-label={`Open ${item.title}`}
              >
                <span className="dv2-plate-frame">
                  <img
                    data-dv2-frame
                    src={item.kind === 'video' ? item.poster : item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="dv2-plate-label">
                  <span>{item.title}</span>
                  <span>{String(index + 2).padStart(2, '0')}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <MediaLightbox
        items={items}
        index={viewer?.index ?? null}
        origin={viewer?.origin ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) => setViewer((open) => (open ? { ...open, index } : null))}
      />
    </section>
  )
}
