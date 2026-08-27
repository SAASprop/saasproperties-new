import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { BRAND, FOOTER } from "../lib/content";
import { useMotionDisabled } from "../lib/motion";
import { SaasLogo } from "./SaasLogo";

/** Rise-and-fade, staggered by band so the footer arrives in reading order. */
const BANDS = [0, 0.08, 0.16, 0.24];

/**
 * One footer row.
 *
 * An entry with nowhere to go yet renders as text rather than as a link: an
 * anchor with no href is not focusable and announces as a link that does
 * nothing, which is worse for a keyboard visitor than plain copy. The arrow only
 * appears on entries that actually lead somewhere, so the ones that do are
 * distinguishable at a glance.
 */
function FooterLink({ label, href }: { label: string; href: string | null }) {
  if (!href) {
    return (
      <li className="text-sm leading-relaxed text-muted">{label}</li>
    );
  }

  const external = href.startsWith("http");

  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group inline-flex items-start gap-1.5 text-sm leading-relaxed text-muted transition-colors duration-300 hover:text-text focus-visible:text-text"
      >
        <span className="underline-offset-4 group-hover:underline">{label}</span>
        <ArrowUpRight
          size={13}
          strokeWidth={1.25}
          aria-hidden="true"
          className="mt-1 shrink-0 text-champagne opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </a>
    </li>
  );
}

export function ContactFooter() {
  const motionOff = useMotionDisabled();

  /**
   * Bands arrive in sequence so the page's last screen has some life in it.
   *
   * `false` for `initial` is what makes the off state clean: framer-motion skips
   * the enter animation entirely rather than running it at zero duration, so
   * nothing is ever left mid-transition if frames stop.
   */
  const band = (order: number) =>
    motionOff
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: {
            duration: 0.9,
            delay: BANDS[order],
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <footer className="border-t border-stroke bg-bg">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-[3.75rem] md:py-28">
        {/* Band 1 — the invitation, and the address to take it up on. */}
        <motion.div
          className="grid gap-10 lg:grid-cols-12 lg:gap-8"
          {...band(0)}
        >
          <div className="lg:col-span-7">
            <p className="eyebrow">{FOOTER.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl italic leading-[1.1] text-text sm:text-5xl">
              {FOOTER.heading}
            </h2>
            <a
              href={`mailto:${BRAND.email}`}
              className="mt-7 inline-block break-all font-display text-xl italic text-text underline-offset-[6px] transition-colors duration-300 hover:text-champagne hover:underline sm:text-3xl"
            >
              {BRAND.email}
            </a>
          </div>

          {/* The number, given the weight of a figure rather than of a link —
              it is the fastest route to a person on the whole page. */}
          <div className="lg:col-span-4 lg:col-start-9 lg:text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
              Sales
            </p>
            <a
              href={FOOTER.salesPhone.href}
              className="mt-3 inline-block font-display text-4xl not-italic tracking-[-0.01em] text-text transition-colors duration-300 hover:text-champagne sm:text-5xl"
            >
              {FOOTER.salesPhone.display}
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted lg:ml-auto">
              {BRAND.tagline}
            </p>
          </div>
        </motion.div>

        {/* Band 2 — the four columns of enquiry routes. */}
        <motion.div
          className="mt-16 grid gap-x-8 gap-y-12 border-t border-stroke pt-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
          {...band(1)}
        >
          {FOOTER.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-medium uppercase leading-relaxed tracking-[0.2em] text-champagne">
                {column.title}
              </h3>
              <ul className="mt-5 flex list-none flex-col gap-3 p-0">
                {column.links.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Band 3 — the site's own short run of links, on one line. */}
        <motion.nav
          className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-stroke pt-10"
          aria-label="Site"
          {...band(2)}
        >
          {FOOTER.primary.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                className="text-[11px] uppercase tracking-[0.22em] text-text transition-colors duration-300 hover:text-champagne"
              >
                {link.label}
              </a>
            ) : (
              <span
                key={link.label}
                className="text-[11px] uppercase tracking-[0.22em] text-muted"
              >
                {link.label}
              </span>
            ),
          )}
        </motion.nav>

        {/* Band 4 — the mark, the small print, and the way back up. */}
        <motion.div
          className="mt-12 flex flex-col gap-6 border-t border-stroke pt-8 lg:flex-row lg:items-center lg:justify-between"
          {...band(3)}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
            <SaasLogo className="h-7 w-auto shrink-0 text-text" aria-hidden="true" />

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.08em] text-muted">
              <span>{FOOTER.copyright}</span>
              {FOOTER.legal.map((item) => (
                <span key={item.label} className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-stroke">
                    |
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors duration-300 hover:text-text"
                    >
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
                </span>
              ))}
            </p>
          </div>

          <button
            type="button"
            // Jumps rather than glides when motion is off or unwanted: a
            // full-page smooth scroll is the largest movement on the site, and
            // it was the one thing here ignoring the preference outright.
            onClick={() =>
              window.scrollTo({ top: 0, behavior: motionOff ? "auto" : "smooth" })
            }
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/30 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg lg:self-auto"
          >
            {FOOTER.backToTop}
            <ArrowUp size={13} strokeWidth={1.25} aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </footer>
  );
}
