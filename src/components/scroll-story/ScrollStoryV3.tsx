import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PROPERTY } from "../../lib/property";
import { PropertyMedia } from "../PropertyMedia";
import { useRevealed } from "../../lib/reveal";
import { useMotionDisabled } from "../../lib/motion";
import "./hero-v3.css";

// Both plugins ship free in gsap 3.13+, so no Club install step is involved.
gsap.registerPlugin(ScrollTrigger, SplitText);

export function ScrollStoryV3() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();
  const reducedMotion = useMotionDisabled();

  useLayoutEffect(() => {
    // Reduced motion gets the settled frame; the stylesheet pins the final state
    // so there is nothing to animate and no ScrollTrigger to install.
    if (reducedMotion) return;
    // Held until the loader clears, or the whole intro plays behind it.
    if (!revealed) return;

    const ctx = gsap.context(() => {
      const titleSplit = new SplitText('[data-hero="title"]', {
        type: "chars",
        charsClass: "v3-char",
        mask: "chars",
      });

      const standfirstSplit = new SplitText('[data-hero="standfirst"]', {
        type: "words",
        wordsClass: "v3-word",
      });

      gsap.set(titleSplit.chars, { yPercent: 100 });
      gsap.set(standfirstSplit.words, { opacity: 0, y: 30, rotationX: -45 });
      gsap.set('[data-hero="body"]', { opacity: 0, y: 40 });
      gsap.set('[data-hero="scroll"]', { opacity: 0, y: 20 });
      gsap.set('[data-hero="meta"]', { opacity: 0, y: -20 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(
          titleSplit.chars,
          { yPercent: 0, duration: 1.6, stagger: { each: 0.08 } },
          0.2,
        )
        .to(
          standfirstSplit.words,
          { opacity: 1, y: 0, rotationX: 0, duration: 1.1, stagger: 0.04 },
          0.9,
        )
        .to('[data-hero="body"]', { opacity: 1, y: 0, duration: 1.3 }, 1.2)
        .to('[data-hero="scroll"]', { opacity: 1, y: 0, duration: 0.9 }, 1.8)
        .to('[data-hero="meta"]', { opacity: 1, y: 0, duration: 0.9 }, 1.6);

      // The cue is an instruction, so it stops once it has been followed.
      // A toggled attribute rather than a tween: the sweep is a CSS animation
      // and this only has to tell it to stand down, which also means the state
      // survives a reduced-motion revert without GSAP holding the value.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top+=80 top",
        onEnter: () =>
          root.current
            ?.querySelector('[data-hero="scroll"]')
            ?.setAttribute("data-taken", "true"),
        onLeaveBack: () =>
          root.current
            ?.querySelector('[data-hero="scroll"]')
            ?.removeAttribute("data-taken"),
      });

      // Scroll parallax. Values are written with gsap.set rather than a
      // zero-duration gsap.to, which would allocate a throwaway tween on every
      // scroll frame.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: ({ progress }) => {
          // The reel pushes in as the page leaves it. 1.35 rather than the
          // 1.1 it was: at a tenth the zoom read as drift rather than as a
          // move, and it also has to out-cover the 30% downward drift — the
          // frame is translated by 30% of its own height, so without enough
          // scale the top of it would pull away from the top of the hero. At
          // 1.35 there is 17.5% of overhang on each edge.
          gsap.set('[data-hero="img"]', {
            yPercent: progress * 30,
            scale: 1 + progress * 0.35,
          });
          gsap.set('[data-hero="title"]', {
            yPercent: progress * -50,
            opacity: 1 - progress,
          });
          gsap.set('[data-hero="content"]', {
            yPercent: progress * -30,
            opacity: 1 - progress * 1.5,
          });
        },
      });

      return () => {
        titleSplit.revert();
        standfirstSplit.revert();
      };
    }, root);

    return () => ctx.revert();
  }, [revealed, reducedMotion]);

  return (
    <section
      // No id: the Overview section below owns #overview, so the nav link lands
      // on the copy rather than on the hero the visitor is already looking at.
      ref={root}
      className="hero-v3 full-bleed"
      aria-label={`${PROPERTY.name} — hero`}
    >
      <div data-hero="bg" className="hero-v3__bg">
        <div data-hero="img" className="hero-v3__bg-inner">
          <PropertyMedia
            media={PROPERTY.primaryMedia}
            active
            className="hero-v3__media"
          />
        </div>
      </div>
      <div className="hero-v3__scrim" />
      {/* Closes the bottom edge onto the ground the next section is painted in.
          Sits above the scrim and below the copy. */}
      <div className="hero-v3__seal" aria-hidden="true" />

      <div className="hero-v3__inner">
        <div data-hero="meta" className="hero-v3__meta">
          <span>{PROPERTY.eyebrow}</span>
          <span>
            {PROPERTY.place.name} · {PROPERTY.place.detail}
          </span>
        </div>

        <div className="hero-v3__heading">
          {/* Stacked lines, each its own block so SplitText masks the letters
              per line rather than treating the name as one run. */}
          {/* <h1 data-hero="title" className="hero-v3__title">
            {PROPERTY.displayLines.map((line) => (
              <span key={line} className="hero-v3__title-line">
                {line}
              </span>
            ))}
          </h1> */}

          <div data-hero="content" className="hero-v3__right">
            <div>
              <p data-hero="standfirst" className="hero-v3__standfirst">
                {PROPERTY.name}
              </p>
              <p data-hero="body" className="hero-v3__body">
                {PROPERTY.summary}
              </p>
            </div>
            <div data-hero="scroll" className="hero-v3__scroll">
              {PROPERTY.scrollHint}
              {/* The travelling rule, which is the part that reads as an
                  instruction. Its own element rather than a pseudo on the
                  parent, so the sweep can be clipped to it without also
                  clipping the words. */}
              <span className="hero-v3__scroll-rail" aria-hidden="true">
                <span className="hero-v3__scroll-glint" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
