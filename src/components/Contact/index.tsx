import { useEffect, useLayoutEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PROPERTY } from "../../lib/property";
import { BRAND } from "../../lib/content";
import { SocialGlyph } from "./SocialGlyph";
import { useMotionDisabled } from "../../lib/motion";

import "./styles.css";
import { FLAGS, type FlagIso } from "./flags";

gsap.registerPlugin(ScrollTrigger);

const { contact } = PROPERTY;

/**
 * Text fields, in the order they are asked for.
 * Phone is handled separately.
 */
const FIELDS = [
  {
    name: "firstName",
    type: "text",
    label: "First name",
    required: true,
    autoComplete: "given-name",
    half: true,
  },
  {
    name: "lastName",
    type: "text",
    label: "Last name",
    required: true,
    autoComplete: "family-name",
    half: true,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    required: true,
    autoComplete: "email",
    half: false,
  },
] as const;

/**
 * Countries shown in the selector.
 *
 * Gulf / primary markets are intentionally placed first.
 */
const COUNTRIES = [
  { iso: "ae", name: "United Arab Emirates", dial: "+971" },
  { iso: "sa", name: "Saudi Arabia", dial: "+966" },
  { iso: "qa", name: "Qatar", dial: "+974" },
  { iso: "kw", name: "Kuwait", dial: "+965" },
  { iso: "bh", name: "Bahrain", dial: "+973" },
  { iso: "om", name: "Oman", dial: "+968" },

  { iso: "gb", name: "United Kingdom", dial: "+44" },
  { iso: "us", name: "United States", dial: "+1" },
  { iso: "in", name: "India", dial: "+91" },
  { iso: "pk", name: "Pakistan", dial: "+92" },
  { iso: "eg", name: "Egypt", dial: "+20" },
  { iso: "jo", name: "Jordan", dial: "+962" },
  { iso: "lb", name: "Lebanon", dial: "+961" },
  { iso: "tr", name: "Türkiye", dial: "+90" },
  { iso: "ru", name: "Russia", dial: "+7" },
  { iso: "cn", name: "China", dial: "+86" },
  { iso: "de", name: "Germany", dial: "+49" },
  { iso: "fr", name: "France", dial: "+33" },
] as const;

type FieldName = (typeof FIELDS)[number]["name"] | "phone";

type Values = Record<FieldName, string>;

type Status = "idle" | "sending" | "done" | "handoff" | "error";

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

/**
 * Composes a mail draft, used while no form endpoint is configured.
 */
function mailtoFor(values: Values, dial: string) {
  const body = [
    `Name: ${values.firstName} ${values.lastName}`.trim(),
    `Email: ${values.email}`,
    values.phone && `Phone: ${dial} ${values.phone}`,
    "",
    `Enquiry about ${PROPERTY.name}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${BRAND.email}?subject=${encodeURIComponent(
    `${PROPERTY.name} — viewing request`,
  )}&body=${encodeURIComponent(body)}`;
}

/**
 * Everything in the "reach us" row.
 */
const CONTACT_CHANNELS = [
  {
    label: `Call ${BRAND.phone.display}`,
    aria: `Call ${BRAND.name} on ${BRAND.phone.display}`,
    href: `tel:+${BRAND.phone.e164}`,
    icon: "phone" as const,
    newTab: false,
  },
  {
    label: "WhatsApp",
    aria: `Message ${BRAND.name} on WhatsApp`,
    href: `https://wa.me/${BRAND.phone.e164}`,
    icon: "whatsapp" as const,
    newTab: true,
  },
  ...BRAND.socials.map((social) => ({
    label: social.label,
    aria: `${BRAND.name} on ${social.label}`,
    href: social.href,
    icon: social.icon,
    newTab: true,
  })),
];

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useMotionDisabled();

  const [values, setValues] = useState<Values>(EMPTY);
  const [dial, setDial] = useState<string>(COUNTRIES[0].dial);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [status, setStatus] = useState<Status>("idle");

  /**
   * Close country selector when clicking outside.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {}, root);

    let cancelled = false;

    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ]);

    void layoutSettled.then(() => {
      if (cancelled) return;

      ctx.add(() => {
        gsap.utils
          .toArray<HTMLElement>('[data-anim="element"]')
          .forEach((el) => {
            gsap.set(el, {
              visibility: "visible",
            });

            gsap.from(el, {
              opacity: 0,
              y: 40,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            });
          });

        gsap.utils
          .toArray<HTMLElement>('[data-anim="img-overlay"]')
          .forEach((el) => {
            gsap.set(el, {
              visibility: "visible",
              yPercent: 0,
            });

            gsap.to(el, {
              yPercent: -101,
              duration: 1.4,
              ease: "expo.inOut",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            });
          });

        gsap.utils
          .toArray<HTMLElement>('[data-anim="img-parallax"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              {
                yPercent: -6,
                scale: 1.15,
              },
              {
                yPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: root.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });

        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [reducedMotion]);

  const setField = (name: FieldName, value: string) =>
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

  const clearField = (name: FieldName) => {
    setField(name, "");

    root.current?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.focus();
  };

  const selectCountry = (country: (typeof COUNTRIES)[number]) => {
    // @ts-ignore
    setSelectedCountry(country);
    setDial(country.dial);
    setCountryOpen(false);
    setCountrySearch("");
  };

  const filteredCountries = COUNTRIES.filter((country) => {
    const query = countrySearch.trim().toLowerCase();

    if (!query) return true;

    return (
      country.name.toLowerCase().includes(query) ||
      country.iso.toLowerCase().includes(query) ||
      country.dial.includes(query)
    );
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus("sending");

    if (!contact.endpoint) {
      window.location.href = mailtoFor(values, dial);

      setStatus("handoff");
      return;
    }

    try {
      const response = await fetch(contact.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...values,
          phone: values.phone ? `${dial} ${values.phone}` : "",
          property: PROPERTY.name,
        }),
      });

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={root}
      className="full-bleed relative isolate overflow-hidden bg-bg py-24 lg:py-28"
      aria-labelledby="contact-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          data-anim="img-parallax"
          className="h-full w-full will-change-transform"
        >
          <img
            src={contact.image.src}
            alt={contact.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div
          className="img-fade-y"
          style={
            {
              "--fade-scrim": 0.8,
              "--fade-edge": 0.97,
              "--fade-clear-start": "20%",
              "--fade-clear-end": "80%",
            } as React.CSSProperties
          }
        />

        <div
          data-anim="img-overlay"
          aria-hidden="true"
          className="ct-hide absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* LEFT */}
          <div className="lg:col-span-5">
            <p data-anim="element" className="ct-hide eyebrow">
              {contact.caption}
            </p>

            <h2
              id="contact-heading"
              data-anim="element"
              className="ct-hide mt-4 font-display text-5xl italic leading-[0.95] text-text sm:text-6xl lg:text-7xl"
            >
              {contact.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p
              data-anim="element"
              className="ct-hide mt-7 max-w-md text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {contact.body}
            </p>

            <div data-anim="element" className="ct-hide mt-10">
              <span
                className="block h-px w-12 bg-champagne/40"
                aria-hidden="true"
              />

              <a
                href={`mailto:${BRAND.email}`}
                className="mt-5 inline-block font-display text-lg italic text-text transition-colors duration-300 hover:text-champagne sm:text-xl"
              >
                {BRAND.email}
              </a>

              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted">
                {PROPERTY.place.name} · {PROPERTY.place.detail}
              </p>
            </div>

            <ul
              data-anim="element"
              className="ct-hide mt-9 flex list-none flex-wrap gap-3 p-0"
            >
              {CONTACT_CHANNELS.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.newTab
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {})}
                    aria-label={channel.aria}
                    title={channel.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/35 text-text transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg"
                  >
                    <SocialGlyph
                      icon={channel.icon}
                      className="h-[18px] w-[18px]"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM */}
          <div
            data-anim="element"
            className="ct-hide lg:col-span-6 lg:col-start-7"
          >
            <div className="border border-champagne/20 bg-surface/80 p-7 backdrop-blur-md sm:p-10 lg:p-12">
              {status === "done" || status === "handoff" ? (
                <div role="status" className="py-10 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto block h-px w-12 bg-champagne/50"
                  />

                  <p className="mt-6 font-display text-2xl italic leading-snug text-text sm:text-3xl">
                    {status === "handoff"
                      ? contact.handoffMessage
                      : contact.successMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setValues(EMPTY);
                      setStatus("idle");
                    }}
                    className="mt-8 text-[11px] uppercase tracking-[0.25em] text-muted transition-colors duration-300 hover:text-text"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate={false}>
                  <p className="text-sm leading-relaxed text-muted">
                    {contact.formNote}
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {/* TEXT FIELDS */}
                    {FIELDS.map((field) => (
                      <div
                        key={field.name}
                        className={`relative ${
                          field.half ? "" : "sm:col-span-2"
                        }`}
                      >
                        <input
                          id={`contact-${field.name}`}
                          name={field.name}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          required={field.required}
                          maxLength={256}
                          value={values[field.name]}
                          onChange={(event) =>
                            setField(field.name, event.target.value)
                          }
                          placeholder={field.label}
                          aria-label={field.label}
                          className="ct-input w-full border-0 border-b border-stroke bg-transparent pb-3 pr-12 pt-8 font-display text-base not-italic uppercase tracking-[0.06em] text-text outline-none transition-colors duration-200 focus:border-champagne/60"
                        />

                        <button
                          type="button"
                          onClick={() => clearField(field.name)}
                          aria-label={`Clear ${field.label}`}
                          className="ct-clear absolute bottom-1 right-0 h-10 w-10 items-center justify-center text-muted transition-colors duration-200 hover:text-text"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* PHONE */}
                    <div className="flex items-end gap-4 sm:col-span-2">
                      {/* COUNTRY SELECTOR */}
                      <div ref={countryRef} className="relative shrink-0">
                        <label
                          htmlFor="contact-dial"
                          className="block pt-8 text-[10px] uppercase tracking-[0.25em] text-muted"
                        >
                          Country
                        </label>

                        <button
                          id="contact-dial"
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded={countryOpen}
                          onClick={() => setCountryOpen((open) => !open)}
                          className="
        mt-1 flex h-[42px] w-[8.5rem] items-center
        border-0 border-b border-stroke
        bg-transparent pb-3
        text-left outline-none
        transition-colors duration-300
        hover:border-champagne/60
        focus:border-champagne/60
        sm:w-[10rem]
      "
                        >
                          {/* FLAG */}
                          <span
                            className="
          flex h-4 w-6 shrink-0
          items-center justify-center
          overflow-hidden rounded-[2px]
          shadow-[0_0_0_1px_rgba(255,255,255,0.12)]
        "
                            aria-hidden="true"
                          >
                            <img
                              src={FLAGS[selectedCountry.iso as FlagIso]}
                              alt=""
                              width={20}
                              height={15}
                              className="block h-full w-full object-cover"
                            />
                          </span>

                          {/* DIVIDER */}
                          <span
                            className="mx-3 h-4 w-px bg-white/10"
                            aria-hidden="true"
                          />

                          {/* DIAL CODE */}
                          <span
                            className="
          min-w-[3.25rem]
           text-sm
          tracking-[0.04em]
          text-text
        "
                          >
                            {selectedCountry.dial}
                          </span>

                          {/* CHEVRON */}
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`
          ml-auto h-3.5 w-3.5 shrink-0
          text-muted
          transition-transform duration-300
          ${countryOpen ? "rotate-180" : ""}
        `}
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {/* DROPDOWN */}
                        {countryOpen && (
                          <div
                            className="
          absolute bottom-full left-0 z-50 mb-3
          w-[18rem] overflow-hidden
          border border-champagne/20
          bg-surface/95
          shadow-2xl
          backdrop-blur-xl
          sm:w-[21rem]
        "
                          >
                            {/* SEARCH */}
                            <div className="border-b border-stroke p-3">
                              <div
                                className="
              flex items-center
              border border-white/10
              bg-white/[0.025]
              px-3
              transition-colors
              focus-within:border-champagne/30
            "
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  className="mr-2.5 h-3.5 w-3.5 shrink-0 text-muted"
                                  aria-hidden="true"
                                >
                                  <circle cx="11" cy="11" r="6.5" />
                                  <path d="m16 16 4 4" />
                                </svg>

                                <input
                                  autoFocus
                                  type="search"
                                  value={countrySearch}
                                  onChange={(event) =>
                                    setCountrySearch(event.target.value)
                                  }
                                  placeholder="Search country"
                                  className="
                w-full
                border-0
                bg-transparent
                py-2.5
                font-sans text-[11px]
                uppercase
                tracking-[0.12em]
                text-text
                outline-none
                placeholder:text-muted
              "
                                />
                              </div>
                            </div>

                            {/* LIST */}
                            <div
                              className="max-h-64 overflow-y-auto py-1"
                              role="listbox"
                            >
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                  const selected =
                                    country.iso === selectedCountry.iso;

                                  return (
                                    <button
                                      key={country.iso}
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => selectCountry(country)}
                                      className={`
                    group flex w-full items-center
                    px-4 py-3
                    text-left
                    transition-colors duration-200
                    ${selected ? "bg-champagne/10" : "hover:bg-white/[0.045]"}
                  `}
                                    >
                                      {/* FLAG */}
                                      <span
                                        className="
                      flex h-4 w-6 shrink-0
                      items-center justify-center
                      overflow-hidden rounded-[2px]
                      shadow-[0_0_0_1px_rgba(255,255,255,0.10)]
                    "
                                        aria-hidden="true"
                                      >
                                        <img
                                          src={FLAGS[country.iso as FlagIso]}
                                          alt=""
                                          width={20}
                                          height={15}
                                          loading="lazy"
                                          decoding="async"
                                          className="block h-full w-full object-cover"
                                        />
                                      </span>

                                      {/* COUNTRY INFO */}
                                      <span className="ml-4 min-w-0 flex-1">
                                        <span
                                          className="
                        block truncate
                        text-[10px]
                        uppercase
                        tracking-[0.14em]
                        text-text
                      "
                                        >
                                          {country.name}
                                        </span>

                                        <span
                                          className="
                        mt-1 block
                        font-display
                        text-xs
                        tracking-[0.04em]
                        text-muted
                      "
                                        >
                                          {country.dial}
                                        </span>
                                      </span>

                                      {/* SELECTED INDICATOR */}
                                      <span
                                        className={`
                      ml-3 flex h-5 w-5
                      shrink-0 items-center justify-center
                      rounded-full
                      border
                      transition-all duration-200
                      ${
                        selected
                          ? "border-champagne/60 bg-champagne/10"
                          : "border-transparent"
                      }
                    `}
                                        aria-hidden="true"
                                      >
                                        {selected && (
                                          <svg
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-2.5 w-2.5 text-champagne"
                                          >
                                            <path d="m2.5 6 2.2 2.2L9.5 3.5" />
                                          </svg>
                                        )}
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                <p className="px-4 py-8 text-center text-xs text-muted">
                                  No countries found
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PHONE NUMBER */}
                      <div className="relative flex-1">
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          maxLength={32}
                          value={values.phone}
                          onChange={(event) =>
                            setField("phone", event.target.value)
                          }
                          placeholder="Phone"
                          aria-label="Phone number"
                          className="
        ct-input
        w-full
        border-0
        border-b border-stroke
        bg-transparent
        pb-3
        pr-12
        pt-8
        font-display
        text-base
        not-italic
        uppercase
        tracking-[0.06em]
        text-text
        outline-none
        transition-colors duration-200
        focus:border-champagne/60
      "
                        />

                        <button
                          type="button"
                          onClick={() => clearField("phone")}
                          aria-label="Clear phone number"
                          className="
        ct-clear
        absolute bottom-1 right-0
        h-10 w-10
        items-center justify-center
        text-muted
        transition-colors duration-200
        hover:text-text
      "
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ERROR */}
                  {status === "error" && (
                    <p
                      role="alert"
                      className="mt-8 border border-champagne/30 bg-champagne/5 p-4 text-sm text-text"
                    >
                      {contact.errorMessage}{" "}
                      <a href={`mailto:${BRAND.email}`} className="underline">
                        {BRAND.email}
                      </a>
                    </p>
                  )}

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="mt-10 w-full border border-champagne bg-champagne py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-bg transition-colors duration-300 hover:border-white hover:bg-white disabled:cursor-default disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending…" : contact.submitLabel}
                  </button>

                  <p className="mt-6 text-[11px] leading-relaxed text-muted">
                    {contact.privacyNote}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
