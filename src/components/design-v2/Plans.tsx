import { useMemo, useState } from 'react'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type LightboxMedia, type OpenOrigin } from '../MediaLightbox'
import { originOf } from '../Gallery/origin'

const { floorPlans } = PROPERTY

/**
 * The layouts, presented as drawings rather than as a tab strip.
 *
 * On the warm ground on purpose. These are line drawings on pale sheets, and on
 * V1's near-black ground the same sheets have to be shown as bright rectangles,
 * which is the thing that always gives away a plan pasted into a dark page.
 * Here the sheet is mounted on a white plate inside a hairline, the way a
 * drawing is presented on a board — see the note on .dv2-plan-stage for why
 * blending the sheet into the paper did not survive contact with the real
 * files.
 *
 * The selector is a ruled list, not tabs — the areas belong beside the name, and
 * a list gives them room to be read.
 */
export function Plans() {
  const [active, setActive] = useState(0)
  const [viewer, setViewer] = useState<{ index: number; origin: OpenOrigin } | null>(null)

  const plan = floorPlans.plans[active]

  // The viewer wants media items; plans with no drawing yet are skipped so it
  // can never open on an empty frame.
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

  const figures = [
    { label: 'Bathrooms', value: String(plan.baths) },
    { label: 'Total area', value: `${plan.totalSqm.toFixed(2)} m²` },
    { label: 'Total area', value: `${plan.totalSqft.toFixed(2)} sq ft` },
  ]

  return (
    <section className="dv2-section" data-ground="paper" id="dv2-plans">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num" style={{ color: 'var(--dv2-on-light-dim)' }}>
            04
          </span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <p className="dv2-eyebrow" style={{ color: 'var(--dv2-on-light-dim)' }}>
            {floorPlans.caption}
          </p>
          <h2 className="dv2-title dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
            <span className="dv2-line">
              <span data-dv2-line>{floorPlans.heading}</span>
            </span>
          </h2>
          <p className="dv2-body dv2-hide" data-dv2="rise" style={{ marginTop: '1.5rem', maxWidth: '38ch' }}>
            {floorPlans.intro}
          </p>

          <div className="dv2-plans">
            <div>
              <ul className="dv2-plan-picker">
                {floorPlans.plans.map((entry, index) => (
                  <li key={entry.label}>
                    <button
                      type="button"
                      className="dv2-plan-option"
                      aria-current={index === active ? 'true' : undefined}
                      onClick={() => setActive(index)}
                    >
                      <span className="dv2-num" style={{ color: 'inherit' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="dv2-plan-name">{entry.label}</span>
                      <span
                        className="dv2-meta-label"
                        style={{ marginLeft: 'auto', color: 'var(--dv2-on-light-dim)' }}
                      >
                        {entry.totalSqft.toFixed(0)} sq ft
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="dv2-plan-figures">
                {figures.map((figure) => (
                  <div className="dv2-meta-cell" key={figure.value}>
                    <span className="dv2-meta-label" style={{ color: 'var(--dv2-on-light-dim)' }}>
                      {figure.label}
                    </span>
                    <span className="dv2-meta-value" style={{ color: 'var(--dv2-on-light)' }}>
                      {figure.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="dv2-disclaimer">{floorPlans.disclaimer}</p>
            </div>

            {plan.image ? (
              <button
                type="button"
                className="dv2-plan-stage"
                onClick={(event) =>
                  setViewer({
                    index: Math.max(viewableIndex, 0),
                    origin: originOf(event),
                  })
                }
                aria-label={`Open the ${plan.label} floor plan full size`}
              >
                {/* Keyed on the label so switching layout remounts the image and
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
              <div className="dv2-plan-stage" aria-hidden="true" />
            )}
          </div>
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
