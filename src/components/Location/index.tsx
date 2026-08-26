import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROPERTY } from "../../lib/property";
import { FeatureGlyph } from "../FeatureGlyph";
import { useMotionDisabled } from "../../lib/motion";
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const { location } = PROPERTY;

export function Location() {
  const root = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionDisabled();
  /**
   * The embed pulls a few hundred kilobytes of Google's own script and tiles, so
   * it is not mounted until the section is close to the viewport. It sits well
   * below the fold, which means it costs a first load nothing at all.
   */
  const [mapMounted, setMapMounted] = useState(false);

  useEffect(() => {
    const node = mapRef.current;
    if (!node || mapMounted) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMapMounted(true);
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mapMounted]);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {}, root);
    let cancelled = false;

    // As elsewhere in the page: these triggers are `once: true`, and one built
    // before the CSS lands or the webfont swaps measures against the wrong
    // layout and fires immediately, which a later refresh cannot undo.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ]);

    void layoutSettled.then(() => {
      if (cancelled) return;
      ctx.add(() => {
        // Header and copy.
        gsap.utils
          .toArray<HTMLElement>('[data-anim="element"]')
          .forEach((el) => {
            gsap.set(el, { visibility: "visible" });
            gsap.from(el, {
              opacity: 0,
              y: 40,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          });

        // Dark panel wipes off the map plate, the same reveal the Overview and
        // Features images use.
        gsap.utils
          .toArray<HTMLElement>('[data-anim="map-reveal"]')
          .forEach((el) => {
            gsap.set(el, { visibility: "visible", yPercent: 0 });
            gsap.to(el, {
              yPercent: -101,
              duration: 1.5,
              ease: "expo.inOut",
              scrollTrigger: { trigger: el, start: "top 80%", once: true },
            });
          });

        // The floating locator plate this used to animate was removed from the
        // markup; nothing has carried data-anim="plate" since. Dropped rather
        // than left in place — a selector that matches nothing reads as an
        // animation that is quietly failing.

        // Highlights: hairline draws, then the figure rises behind it. Batched so
        // a row further down the grid still animates as it is reached.
        ScrollTrigger.batch('[data-anim="highlight"]', {
          start: "top 92%",
          once: true,
          batchMax: 6,
          onEnter: (batch) => {
            gsap.set(batch, { visibility: "visible" });
            const tl = gsap.timeline();
            tl.from(
              batch.map((el) => el.querySelector('[data-anim="rule"]')),
              { scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.07 },
            ).from(
              batch,
              {
                opacity: 0,
                y: 34,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.07,
              },
              0.06,
            );
          },
        });

        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      id="location"
      ref={root}
      className="overflow-hidden bg-bg py-24 lg:py-20"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* Map, held on the right and bled to the container edge so the pair
              reads as a composition rather than as two equal columns. It is
              second in the source but ordered last only on wide screens, so a
              phone still meets the words before the plan. */}
          <div className="order-2 lg:col-span-5 lg:col-start-8 lg:-mr-[3.75rem]">
            <div
              ref={mapRef}
              className="loc-map-frame relative aspect-[4/5] overflow-hidden border border-champagne/25 bg-surface sm:aspect-[3/2] lg:h-full lg:min-h-[30rem] lg:aspect-auto"
            >
              {mapMounted && (
                <iframe
                  src={location.mapEmbedUrl}
                  title={`Map of ${PROPERTY.name}, ${PROPERTY.place.name}`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              )}

              {/* The whole frame opens the map.
                  A link laid over the iframe rather than a click handler on it:
                  a cross-origin frame cannot be listened to, and its own
                  panning would otherwise swallow the gesture. That does mean
                  the embed is no longer draggable in place — a deliberate
                  trade, since one press now gets the visitor to the real map
                  with directions and Street View rather than to a small tile of
                  it. It is a real anchor, so it keeps the middle-click, the
                  context menu and the focus ring for free. */}
              <a
                href={location.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="loc-map-open group absolute inset-0 z-10 block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-champagne"
              >
                <span className="sr-only">
                  Open the location of {PROPERTY.name} in Google Maps, in a new tab
                </span>

                {/* The affordance. Quiet until the frame is hovered, so the map
                    is a map first and a button second. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-bg/95 via-bg/70 to-transparent pb-5 pt-12 text-[11px] uppercase tracking-[0.22em] text-champagne opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  Open in Google Maps
                  <ArrowUpRight size={14} strokeWidth={1.25} />
                </span>
              </a>

              {/* Vignette and inner hairline. Pointer-events off, so they never
                  intercept the link above. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/30"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5"
              />

              {/* Reveal panel, above the rest so it uncovers map and plate together. */}
              <div
                data-anim="map-reveal"
                aria-hidden="true"
                className="loc-hide pointer-events-none absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
              />
            </div>
          </div>

          {/* Left column: the words, then the travel times. */}
          <div className="order-1 lg:col-span-6 lg:col-start-1 lg:row-start-1">
            <p data-anim="element" className="loc-hide eyebrow">
              {location.caption}
            </p>
            <p
              data-anim="element"
              className="loc-hide mt-4 text-[11px] uppercase tracking-[0.3em] text-champagne"
            >
              {location.kicker}
            </p>
            {/* One paragraph, not a heading and a paragraph.
                The section still needs a heading for anything reading the
                document outline, but a heading cannot live inside a paragraph —
                the parser closes the <p> at the <h2> and the two split back
                apart. So the h2 carries the name for assistive tech only, and
                the visible lead clause is a span: two pixels up on the body
                around it and in the page's text colour rather than the muted
                grey, which is enough to lead without becoming its own block. */}
            <h2 id="location-heading" className="sr-only">
              {location.heading}
            </h2>

            <p
              data-anim="element"
              className="loc-hide mt-5 text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              <span className="text-[1.125rem] text-text">{location.heading}.</span>{' '}
              {location.body}
            </p>

            {/* Travel times. Two up, since this column is half the page — the
                figure still carries the block. */}
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:mt-12 lg:gap-x-8">
              {location.highlights.map((highlight, index) => (
                <div
                  key={highlight.label}
                  data-anim="highlight"
                  className="loc-hide group flex flex-col"
                >
                  <span
                    data-anim="rule"
                    aria-hidden="true"
                    className="block h-px w-full origin-left bg-stroke transition-colors duration-500 group-hover:bg-champagne/50"
                  />

                  <span className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-display text-[10px] not-italic tabular-nums text-muted">
                      ( {String(index + 1).padStart(2, "0")} )
                    </span>
                    <FeatureGlyph
                      icon={highlight.icon}
                      className="h-5 w-5 shrink-0 text-champagne transition-transform duration-500 group-hover:-translate-y-0.5"
                    />
                  </span>

                  <dd className="m-0 mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-[clamp(1.75rem,2.3vw,2.375rem)] not-italic leading-none tracking-[-0.02em] text-text">
                      {String(highlight.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
                      {highlight.minutes === 1 ? 'min' : 'mins'}
                    </span>
                  </dd>

                  <dt className="mt-2.5 text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted">
                    {highlight.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
