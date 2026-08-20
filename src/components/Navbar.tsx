import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND, ENQUIRE, NAV_LINKS } from "../lib/content";
import { SaasLogo } from "./SaasLogo";

export function Navbar() {
  const [activeId, setActiveId] = useState<string>(NAV_LINKS[0].id);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Highlight whichever section currently owns the middle of the viewport.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) =>
      document.getElementById(id),
    ).filter((element): element is HTMLElement => element !== null);
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

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 py-4 sm:py-6">
        {/* Same container as the hero's own content — max-w-[1600px] from the
            page shell, then the hero's 1.25rem/3.75rem gutters. Without this the
            header spans the full viewport and the logo sits left of the display
            type it should line up with. */}
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 md:px-[3.75rem]">
          {/* Logo sits outside the pill on desktop, hidden on mobile. */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hidden shrink-0 items-center gap-3 md:flex"
            aria-label={`${BRAND.name} — back to top`}
          >
            <SaasLogo className="h-10 w-auto text-text" aria-hidden="true" />
          </button>

          <div
            className={`hidden items-center gap-1 rounded-full border border-stroke bg-surface/70 px-2 py-2 backdrop-blur-xl transition-shadow duration-500 md:flex ${
              scrolled
                ? "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.9)]"
                : "shadow-none"
            }`}
          >
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
              // Inverts on hover: white fill, dark label.
              className="ml-1 rounded-full border border-stroke bg-transparent px-4 py-2 text-xs uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg"
            >
              {ENQUIRE.label} ↗
            </button>
          </div>

          {/* Invisible spacer mirrors the logo so the pill stays optically centred. */}
          <div
            className="hidden shrink-0 items-center gap-3 opacity-0 md:flex"
            aria-hidden="true"
          >
            {/* Must match the real logo's height, or the pill is off-centre. */}
            <SaasLogo className="h-10 w-auto" />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-stroke bg-surface/70 backdrop-blur-xl md:hidden"
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
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-bg px-6 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="py-2 text-left font-display text-4xl italic text-text"
              >
                {link.label}
              </button>
            ))}
            {/* Set as one more link rather than a pill: in the overlay the
                button read as a different kind of control to the items above it. */}
            <button
              type="button"
              onClick={() => scrollTo(ENQUIRE.targetId)}
              className="py-2 text-left font-display text-4xl italic text-text"
            >
              {ENQUIRE.label}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
