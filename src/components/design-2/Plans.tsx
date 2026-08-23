import { useMemo, useState } from 'react'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type LightboxMedia, type OpenOrigin } from '../MediaLightbox'
import { originOf } from '../Gallery/origin'

const { floorPlans } = PROPERTY

/**
 * The layouts, with the selector riding along beside the drawing.
 *
 * The list is sticky and the drawing scrolls past it, so a reader comparing
 * layouts never loses the control. The sheets sit on a white plate — they are
 * line drawings, and the one thing that always gives away a plan dropped into a
 * dark page is showing it as a bright rectangle with no mount.
 */
export function Plans() {
  const [active, setActive] = useState(0)
  const [viewer, setViewer] = useState<{ index: number; origin: OpenOrigin } | null>(null)

  const plan = floorPlans.plans[active]

  const viewable = useMemo<LightboxMedia[]>(
    () =>
      floorPlans.plans
        .filter((entry) => entry.image !== null)
        .map((entry) => ({
          kind: 'image' as const,
          src: entry.image as string,
          title: entry.label,
          alt: `${entry.label} floor plan — ${PROPERTY.name}`,
        })),
    [],
  )

  const viewableIndex = useMemo(
    () => viewable.findIndex((entry) => entry.title === plan.label),
    [viewable, plan.label],
  )

  return (
    <section className="d2-section" id="d2-plans">
      <div className="d2-wrap">
        <p className="d2-kicker">{floorPlans.caption}</p>
        <h2
          className="d2-head d2-hide"
          data-k="lines"
          style={{ marginTop: '1.5rem', maxWidth: '16ch' }}
        >
          Four <em>layouts</em>
        </h2>

        <div className="d2-plans">
          <div className="d2-plan-aside">
            <ul className="d2-plan-list">
              {floorPlans.plans.map((entry, index) => (
                <li key={entry.label}>
                  <button
                    type="button"
                    className="d2-plan-pick"
                    aria-current={index === active ? 'true' : undefined}
                    onClick={() => setActive(index)}
                  >
                    <span className="d2-num" style={{ fontSize: '0.8rem' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="d2-plan-name">{entry.label}</span>
                    <span className="d2-label" style={{ marginLeft: 'auto' }}>
                      {entry.totalSqft.toFixed(0)} sq ft
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="d2-plan-figs">
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Bathrooms</span>
                <span className="d2-value">{plan.baths}</span>
              </div>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Total area</span>
                <span className="d2-value">{plan.totalSqm.toFixed(2)} m²</span>
              </div>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Total area</span>
                <span className="d2-value">{plan.totalSqft.toFixed(2)} sq ft</span>
              </div>
            </div>

            <p className="d2-fine">{floorPlans.disclaimer}</p>
          </div>

          {plan.image ? (
            <button
              type="button"
              className="d2-plan-stage d2-hide"
              data-k="open"
              onClick={(event) =>
                setViewer({ index: Math.max(viewableIndex, 0), origin: originOf(event) })
              }
              aria-label={`Open the ${plan.label} floor plan full size`}
            >
              {/* Keyed on the label so changing layout remounts the image and
                  the browser decodes the new sheet rather than swapping it in
                  behind the old one. */}
              <img
                key={plan.label}
                src={plan.image}
                alt={`${plan.label} floor plan — ${PROPERTY.name}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ) : (
            <div className="d2-plan-stage" aria-hidden="true" />
          )}
        </div>
      </div>

      <MediaLightbox
        items={viewable}
        index={viewer?.index ?? null}
        origin={viewer?.origin ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) => setViewer((open) => (open ? { ...open, index } : null))}
      />
    </section>
  )
}
