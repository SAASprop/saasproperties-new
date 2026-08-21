import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PROPERTY } from "../../lib/property";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import './styles.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

const { stats } = PROPERTY.overview;

export function PropertyStats() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {}, root);
    let cancelled = false;
    let splits: SplitText[] = [];

    // Same reason as the Overview section: every trigger here is `once: true`,
    // and a trigger built before the CSS lands or the webfont swaps measures
    // against the wrong layout and fires immediately. A refresh cannot un-fire
    // it, so the triggers are built late instead.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ]);

    void layoutSettled.then(() => {
      if (cancelled) return;
      ctx.add(() => {
        /**
         * One timeline per band, off one trigger, rather than a trigger per
         * element. Separate triggers put the value animations at `top 90%` and
         * the block reveal at `top 80%` — and 90% fires *earlier*, so numbers
         * counted and words rose while their block was still hidden, finishing
         * before it ever appeared. Sequencing guarantees nothing plays unseen.
         */
        gsap.utils
          .toArray<HTMLElement>('[data-anim="stagger-wrap"]')
          .forEach((wrap) => {
            const items = gsap.utils.toArray<HTMLElement>(
              wrap.querySelectorAll('[data-anim="stagger"]'),
            );
            if (!items.length) return;

            gsap.set(items, { visibility: "visible" });

            const tl = gsap.timeline({
              scrollTrigger: { trigger: wrap, start: "top 78%", once: true },
            });

            // Rules draw out first, laying down the structure the specs hang on.
            tl.from(wrap.querySelectorAll('[data-anim="rule"]'), {
              scaleX: 0,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
            });

            // Then the columns rise.
            tl.from(
              items,
              {
                opacity: 0,
                y: 44,
                duration: 1,
                ease: "power3.out",
                stagger: 0.09,
              },
              0.08,
            );

            // Then each value lands, keyed to its own column so the figure or
            // the words arrive just after that column does.
            items.forEach((item, index) => {
              const at = 0.3 + index * 0.09;

              // Target comes from the data, not from parsing rendered text, and
              // the zero is written on start — so the real figure stands for
              // anyone who never scrolls this far.
              const counter = item.querySelector<HTMLElement>("[data-count]");
              if (counter) {
                const target = Number(counter.dataset.count);
                if (Number.isFinite(target)) {
                  const proxy = { value: 0 };
                  tl.to(
                    proxy,
                    {
                      value: target,
                      duration: 1.7,
                      ease: "power2.out",
                      onStart: () => {
                        counter.textContent = "0";
                      },
                      onUpdate: () => {
                        counter.textContent = String(Math.ceil(proxy.value));
                      },
                    },
                    at,
                  );
                }
              }

              // A word cannot count, so it gets the equivalent gesture: rising
              // out of a mask.
              const value = item.querySelector<HTMLElement>(
                '[data-anim="split-value"]',
              );
              if (value) {
                const split = new SplitText(value, {
                  // Words, not chars: char-splitting turns a word into one
                  // inline-block per letter, and the line can then break
                  // mid-word.
                  type: "words",
                  wordsClass: "ps-word",
                  mask: "words",
                });
                splits.push(split);
                tl.from(
                  split.words,
                  {
                    yPercent: 110,
                    duration: 0.9,
                    ease: "power3.out",
                    stagger: 0.06,
                  },
                  at,
                );
              }
            });
          });

        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={root}
      className="bg-bg pb-16 lg:pb-20"
      aria-label={`${PROPERTY.name} — key figures`}
    >
      {/* Same container as the navbar, hero and Overview. */}
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <dl
          data-anim="stagger-wrap"
          className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              data-anim="stagger"
              className="ps-hide flex flex-col"
            >
              {/* A rule per column rather than one continuous line across the
                  band: a single rule can only span the full width, and the grid
                  reflows to two columns and then one — so the segments keep the
                  structure at every breakpoint, reading as one broken line on
                  desktop and as a divider per row on a phone. */}
              <span
                data-anim="rule"
                className="mb-7 block h-px w-full origin-left bg-stroke"
                aria-hidden="true"
              />

              {/* Ordinal: a quiet piece of structure that gives the eye a count
                  and stops the labels floating unanchored. */}
              <span className="mb-5 block font-display text-xs not-italic tabular-nums text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>

              <dt className="eyebrow">{stat.label}</dt>

              {/* One size for every kind, so all four values sit on a shared
                  baseline — the alignment is what makes the band read as clean
                  rather than as four unrelated blocks. */}
              {stat.kind === "count" ? (
                <dd className="m-0 mt-4 flex items-end gap-2 font-display text-[clamp(2rem,3vw,3rem)] not-italic leading-[1.05] tracking-[-0.01em] text-text">
                  <span data-count={stat.value}>{stat.value}</span>
                  {stat.unit && (
                    <span className="pb-1 font-body text-base italic tracking-normal text-muted">
                      {stat.unit}
                    </span>
                  )}
                </dd>
              ) : (
                <dd
                  data-anim="split-value"
                  className="m-0 mt-4 font-display text-[clamp(2rem,3vw,3rem)] not-italic leading-[1.05] tracking-[-0.01em] text-text"
                >
                  {stat.kind === "list" ? stat.values.join(", ") : stat.value}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
