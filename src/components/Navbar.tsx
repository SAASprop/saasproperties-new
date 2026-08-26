import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { BRAND, ENQUIRE, NAV_LINKS } from "../lib/content";
import { PROPERTY } from "../lib/property";
import { SaasLogo } from "./SaasLogo";
import { useMotionDisabled } from "../lib/motion";

export function Navbar() {
  const [activeId, setActiveId] = useState<string>(NAV_LINKS[0].id);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useMotionDisabled();

  /** The pill, and the pool of light that travels inside it. */
  const pillRef = useRef<HTMLDivElement>(null);
  const lumeRef = useRef<HTMLSpanElement>(null);
  /**
   * A single reusable tween for the light's x. gsap.quickTo keeps one tween and
   * retargets it, rather than the alternative of starting a new one per
   * pointermove — at 120Hz that is a tween a frame, each fighting the last for
   * the same property. It also means the light lags the cursor by its own
   * duration, which is what reads as weight instead of as a sticker glued to
   * the pointer.
   */
  const moveTo = useRef<((value: number) => void) | null>(null);
  /** Whether the light has a position yet, so the first entry never slides in
   *  from the left edge. */
  const placed = useRef(false);

  useEffect(() => {
    const lume = lumeRef.current;
    if (!lume) return;
    moveTo.current = gsap.quickTo(lume, "x", {
      duration: reducedMotion ? 0 : 0.55,
      ease: "power3.out",
    });
    return () => {
      moveTo.current = null;
      placed.current = false;
      gsap.killTweensOf(lume);
    };
  }, [reducedMotion]);

  const onPillMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pill = pillRef.current;
    const lume = lumeRef.current;
    if (!pill || !lume) return;

    const x = event.clientX - pill.getBoundingClientRect().left;

    if (placed.current) {
      moveTo.current?.(x);
      return;
    }

    // First contact: put the light under the cursor before it is visible, so it
    // fades up in place rather than flying in from wherever it was left.
    placed.current = true;
    gsap.set(lume, { x });
    gsap.to(lume, {
      opacity: 1,
      duration: reducedMotion ? 0 : 0.45,
      ease: "power2.out",
    });
  };

  const onPillLeave = () => {
    const lume = lumeRef.current;
    if (!lume) return;
    placed.current = false;
    gsap.to(lume, {
      opacity: 0,
      duration: reducedMotion ? 0 : 0.4,
      ease: "power2.out",
    });
  };

  // Highlight whichever section currently owns the middle of the viewport.
  // Contact is observed alongside the listed links so it highlights the same
  // way, even though it is not part of NAV_LINKS.
  //
  useEffect(() => {
    const sections = [...NAV_LINKS.map(({ id }) => id), ENQUIRE.targetId]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile overlay.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /** Both marks return to the hero, which is the top of the page. */
  const toHero = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* The bar draws itself in as the page leaves the hero: it tightens
          against the top edge and a faint ground fades up behind it, so the pill
          keeps its contrast once content rather than the reel is underneath. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[padding,background-color,backdrop-filter] duration-500 ease-out ${
          scrolled
            ? "bg-bg/70 py-3 backdrop-blur-md sm:py-3.5"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        {/* Same container as the hero's own content — max-w-[1600px] from the
            page shell, then the hero's 1.25rem/3.75rem gutters. Without this the
            header spans the full viewport and the logo sits left of the display
            type it should line up with. */}
        <nav className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 md:px-[3.75rem]">
          {/* Left: the hamburger on a phone, then the house mark. The two sit
              together so the corner reads as one control group rather than a
              button marooned beside a logo. */}
          <div className="flex shrink-0 items-center gap-3 lg:gap-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-surface/80 backdrop-blur-xl lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 block h-[1px] w-full bg-text transition-transform duration-300 ${
                    menuOpen ? "top-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1px] w-full bg-text transition-transform duration-300 ${
                    menuOpen ? "top-1/2 -rotate-45" : "top-full"
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={toHero}
              className="flex shrink-0 items-center"
              aria-label={`${BRAND.name} — back to the top`}
            >
              <SaasLogo className="h-7 w-auto text-text sm:h-9 md:h-10" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={pillRef}
            onPointerMove={onPillMove}
            onPointerLeave={onPillLeave}
            className={`relative isolate hidden shrink-0 items-center gap-1 overflow-hidden rounded-full border px-2 py-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out lg:flex ${
              scrolled
                ? "border-white/15 bg-surface/90 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.9)]"
                : "border-stroke bg-surface/70 shadow-none"
            }`}
          >
            {/* Clipped to the pill by its overflow, so the light never spills
                onto the page either side of the bar. */}
            <span ref={lumeRef} className="nav-lume" aria-hidden="true" />

            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  activeId === link.id
                    ? "text-text"
                    : "text-muted hover:text-text"
                }`}
                aria-current={activeId === link.id ? "true" : undefined}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollTo(ENQUIRE.targetId)}
              // Styled as one more nav link rather than a button: same classes,
              // same active state, no arrow.
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                activeId === ENQUIRE.targetId
                  ? "text-text"
                  : "text-muted hover:text-text"
              }`}
              aria-current={activeId === ENQUIRE.targetId ? "true" : undefined}
            >
              {ENQUIRE.label}
            </button>
          </div>

          {/* Right: the property's own mark, at both sizes. It is the far edge
              of the bar on desktop too — past the links rather than beside
              them — so the two marks bookend the row. */}
          <button
            type="button"
            onClick={toHero}
            className="flex shrink-0 items-center"
            aria-label={`${PROPERTY.name} — back to the top`}
          >
            {/* Already white on transparency, so it needs no recolouring. Eager,
                not lazy: it is above the fold and a lazy fetch would leave a gap
                on first paint. */}
            <img
              src={PROPERTY.logo}
              alt=""
              aria-hidden="true"
              width={896}
              height={164}
              className="h-5 w-auto sm:h-6"
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            // The scroll container. Centring and overflow cannot both live on
            // one element: a centred flex child that outgrows its parent is
            // pushed off the top and cannot be scrolled back to. So this one
            // only scrolls, and the list inside it does the centring.
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-bg lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* min-h-full with justify-center centres the list when there is
                room and lets it grow and scroll when there is not — which is
                the case on any landscape phone. The top padding clears the bar,
                so the first link can never sit under the X that closes it.

                Same gutters as the nav itself: the links start on exactly the
                vertical of the button that opened them. */}
            <div className="flex min-h-full flex-col justify-center gap-1 px-5 pb-12 pt-28 md:px-[3.75rem]">
              {[...NAV_LINKS, { id: ENQUIRE.targetId, label: ENQUIRE.label }].map(
                (link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    // Sized against the viewport's height rather than a
                    // breakpoint: what runs out on a short screen is vertical
                    // room, and no width-based step can see that.
                    className="py-2 text-left font-display text-[clamp(1.75rem,6.5vh,2.25rem)] italic leading-tight text-text"
                  >
                    {link.label}
                  </button>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
