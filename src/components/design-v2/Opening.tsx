import { PROPERTY } from '../../lib/property'

const { overview, specs, name } = PROPERTY

/**
 * The editorial opening: one statement, a narrow column of prose set well to
 * the right of it, then the specification as an architectural table.
 *
 * The heading is the property's own overview heading, but where V1 sets it in
 * the display serif and centres the section, here it runs uppercase in the sans
 * at full width with only the middle clause in the serif italic — one accent in
 * a block of architecture, rather than the whole block being decorative.
 *
 * The table is numeral, hairline, label, value. No cards, no panels: the rules
 * do the dividing, which is how a specification reads in a project monograph.
 */
export function Opening() {
  return (
    <section className="dv2-section" data-ground="ink" id="dv2-residence">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num">01</span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div>
          <div className="dv2-statement">
            <h2 className="dv2-display dv2-hide" data-dv2="mask">
              {overview.heading.map((part, index) => (
                <span className="dv2-line" key={`${part.text}-${index}`}>
                  <span data-dv2-line className={part.italic ? 'dv2-accent' : undefined}>
                    {part.text}
                  </span>
                </span>
              ))}
            </h2>

            <div className="dv2-statement-copy dv2-hide" data-dv2="rise">
              {overview.body.map((paragraph) => (
                <p className="dv2-body" key={paragraph.slice(0, 24)}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* The specification. Values come straight from the property record —
              nothing here is composed for the layout's benefit. */}
          <div className="dv2-specs dv2-hide" data-dv2="stagger" aria-label={`${name} specification`}>
            {specs.map((spec, index) => (
              <div className="dv2-spec" key={spec.label} data-dv2-item>
                <span className="dv2-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="dv2-spec-rule" />
                <span className="dv2-meta-label">{spec.label}</span>
                <span className="dv2-spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
