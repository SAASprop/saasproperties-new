/**
 * Per-property page data. One property renders one page, so this is the shape a
 * CMS record must eventually satisfy.
 *
 * PLACEHOLDER assets are marked with `TODO(asset)`.
 */

/**
 * Every property is expected to ship a video, but some will only ever have
 * stills — the discriminated union means a photo-only property is a first-class
 * case rather than a missing-video fallback path.
 */
export type Media =
  | {
      kind: "video";
      /** Progressive MP4. Any normal web encode works; no scrub encoding needed. */
      mp4: string;
      /** Shown while the video loads, and used outright under reduced motion. */
      poster: string;
      /**
       * Seconds to start from, and to loop back to. Sales reels usually open on
       * a branded title card, which would sit under the page's own title; this
       * skips straight to the footage.
       */
      startTime?: number;
      alt: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
    };

export interface Property {
  eyebrow: string;
  name: string;
  /**
   * The name broken into lines for the oversized V3 treatment, stacked one above
   * the other. Keep each line to a single short word — at that size a long line
   * either overflows or shrinks the whole block. Two lines is the design intent;
   * one still renders correctly.
   */
  displayLines: string[];
  /** The property's own wordmark. White on transparency, for the dark theme. */
  logo: string;
  /** Hero standfirst, shown before the scroll narrative begins. */
  summary: string;
  /** e.g. "Now selling" — rendered as a pill. */
  status: string;
  /** Short place label for the hero meta row — not the Location section. */
  place: { name: string; detail: string };
  scrollHint: string;
  /** Headline figures for the bottom bar. Four reads best; three is fine. */
  specs: { label: string; value: string }[];
  travelTimes: { label: string; value: string }[];
  primaryMedia: Media;
  cta: { label: string; targetId: string };
  overview: Overview;
  features: Features;
  gallery: Gallery;
  location: Location;
  floorPlans: FloorPlans;
  contact: Contact;
}

/**
 * A label/value pair in the overview section. The kind decides both the
 * treatment and whether the value animates — only a number can count up.
 */
export type OverviewStat =
  | {
      kind: "count";
      label: string;
      /** Counted up from zero on scroll, so it must be a plain number. */
      value: number;
      /** Rendered after the figure and never animated, e.g. "%", "k sq ft". */
      unit?: string;
    }
  | {
      kind: "text";
      label: string;
      value: string;
    }
  | {
      kind: "list";
      label: string;
      /**
       * Rendered as a comma-separated run, so the count is whatever this holds —
       * drop a bedroom type or add a fourth and the section follows.
       */
      values: string[];
    };

/**
 * The project's glyph set — shared by the amenity cards and the location
 * highlights. A key rather than the drawing itself, so this file stays data; the
 * shapes live in components/FeatureGlyph.
 */
export type FeatureIcon =
  // Amenities
  | "cinema"
  | "gym"
  | "pool"
  | "concierge"
  | "parking"
  | "lounge"
  | "smart"
  | "ev"
  | "sauna"
  | "bbq"
  | "security"
  | "play"
  // Location highlights
  | "wellness"
  | "airport"
  | "education"
  | "entertainment"
  | "shopping"
  | "leisure";

export interface Features {
  caption: string;
  heading: string;
  /** One or two short paragraphs introducing the list. */
  intro: string[];
  /** Full-bleed image behind the cards. */
  image: { src: string; alt: string };
  /** Amenities. The grid sizes itself off however many there are. */
  items: { name: string; icon: FeatureIcon }[];
}

export interface FloorPlans {
  caption: string;
  heading: string;
  intro: string;
  /**
   * One entry per unit type. Areas are transcribed from the drawings, so the
   * figures on the page and the figures on the sheet cannot drift apart.
   */
  plans: {
    label: string;
    baths: number;
    /** Unit plus balcony, as printed on the sheet. */
    totalSqm: number;
    totalSqft: number;
    image: string | null;
  }[];
  /**
   * Documents. A null url renders the button as a request that points at the
   * contact form, so a visitor is never handed a download that 404s.
   */
  downloads: { label: string; requestLabel: string; url: string | null }[];
  /** Shown under the plan frame — plans are indicative until drawings land. */
  disclaimer: string;
}

export interface Contact {
  caption: string;
  /** Stacked one line per entry, so the title reads as a display block. */
  headingLines: string[];
  body: string;
  formNote: string;
  submitLabel: string;
  privacyNote: string;
  successMessage: string;
  /** Shown when there is no endpoint and the fields were handed to a mail app. */
  handoffMessage: string;
  errorMessage: string;
  /** Full-bleed image behind the section. */
  image: { src: string; alt: string };
  /**
   * Where the form posts. `null` falls back to composing a mail draft to
   * BRAND.email, so the form is never a dead end — but a real endpoint should
   * replace it before launch. See the note in the Contact component.
   */
  endpoint: string | null;
}

export interface Location {
  caption: string;
  /** Small kicker above the display heading. */
  kicker: string;
  heading: string;
  body: string;
  /**
   * Google Maps embed URL. The `pb=` form is the only one that renders without
   * an API key; it also cannot be style-configured, which is why the dark
   * treatment is applied to the iframe from the outside.
   */
  mapEmbedUrl: string;
  /**
   * Where the map opens when it is pressed. A separate field because the `pb=`
   * embed URL above is not a shareable link — pasted into a browser it renders
   * a bare tile server response, not a map. This is the ordinary Maps URL, in
   * the documented `?api=1` form so it hands off to the Google Maps app on a
   * phone rather than opening a browser tab over it.
   */
  mapLinkUrl: string;
  /** Shown on the floating locator plate. */
  coordinates: string;
  /** Travel times. `minutes` is a number so it can be padded and set in type. */
  highlights: { label: string; minutes: number; icon: FeatureIcon }[];
}

/** One switchable group of photography. */
export interface GallerySet {
  /** Stable key, also used in the URL-free switch state. */
  id: string;
  /** What the switch shows. Keep it to one word — it sits in a tight row. */
  label: string;
  /** Order is the carousel order. Mixed video and stills is expected. */
  items: (Media & { title: string })[];
}

export interface Gallery {
  caption: string;
  heading: string;
  /**
   * The switchable groups, in the order the switch lists them. The first is what
   * every gallery opens on.
   *
   * Every design on the site renders one set at a time and shares the switch, so
   * adding, removing or reordering a set here changes all of them at once — and a
   * gallery given a single set drops the switch on its own.
   */
  sets: GallerySet[];
}

export interface Overview {
  caption: string;
  /**
   * Split across spans so alternating clauses can take the italic cut, matching
   * the source design's mixed-face heading.
   */
  heading: { text: string; italic?: boolean }[];
  body: string[];
  image: { src: string; alt: string };
  stats: OverviewStat[];
}

/**
 * Assets live in /public, so they must be addressed through BASE_URL — a bare
 * "/file.mp4" resolves to the domain root and 404s on the Pages subpath. Names
 * are encoded so a filename containing spaces still resolves.
 */
const asset = (file: string) =>
  // Encoded per segment: encodeURIComponent would escape the "/" too, turning
  // floorplans/studio.jpg into floorplans%2Fstudio.jpg, which 404s.
  `${import.meta.env.BASE_URL}${file.split("/").map(encodeURIComponent).join("/")}`;

// TODO(asset): interim local file until the HLS ladder exists — a 29 MB, 23s
// 1080p MP4 that loops.
const REEM_VIDEO = asset("ReemEleven.mp4");
// TODO(asset): frame zero of the reel above, so the poster matches the first
// frame and there is no jump when playback starts. Replace with a graded still.
const REEM_POSTER = asset("reem-eleven-poster.webp");

export const PROPERTY: Property = {
  eyebrow: "Residential Tower",
  name: "Reem Eleven",
  displayLines: ["Reem", "Eleven"],
  logo: asset("reem-eleven-logo.webp"),
  summary:
    "A luxury residential tower at the heart of Reem Island — furnished studios through three-bedroom homes, with resort-style amenities and lavish living spaces.",
  status: "Now selling",
  place: { name: "Reem Island", detail: "Abu Dhabi, UAE" },
  scrollHint: "Scroll to explore",
  specs: [
    { label: "Homes", value: "Studio – 3 bed" },
    { label: "Furnishing", value: "Fully furnished" },
    { label: "Amenities", value: "Resort-style" },
    // No price invented here — a wrong figure on a property page is worse than
    // no figure.
    { label: "Guide price", value: "On request" },
  ],
  // TODO(copy): unverified placeholders — confirm against the real drive times
  // before this is shown to a client.
  travelTimes: [
    { label: "Corniche", value: "12 min" },
    { label: "Airport", value: "25 min" },
    { label: "Yas Island", value: "20 min" },
  ],
  primaryMedia: {
    kind: "video",
    mp4: REEM_VIDEO,
    poster: REEM_POSTER,
    // No startTime: this 23s cut opens straight on the tower. The longer reel it
    // replaced began with a "Reem Eleven by SAAS" title card that had to be
    // skipped — if a future edit reinstates one, set startTime past it.
    alt: "Reem Eleven, the residential tower seen from Reem Island.",
  },
  cta: { label: "Book a viewing", targetId: "contact" },

  overview: {
    caption: "Overview",
    heading: [
      { text: "furnished living" },
      { text: "at the heart of", italic: true },
      { text: "reem island" },
    ],
    body: [
      "Reem Eleven brings together furnished studios, one-bedroom apartments and two- and three-bedroom homes in a single tower, each finished and ready to move into.",
      "Resort-style amenities and generous, lavish living spaces make the everyday feel considered — a tower designed around how residents actually live.",
    ],
    image: {
      // TODO(asset): frame from the reel, standing in until photography lands.
      src: asset("reem-eleven-overview.webp"),
      alt: "Reem Eleven seen from street level, its full height against the sky.",
    },
    stats: [
      // TODO(copy): confirm the unit count before this goes to a client.
      { kind: "count", label: "Units", value: 150 },
      { kind: "text", label: "Property Type", value: "Apartments" },
      { kind: "list", label: "Bedrooms", values: ["Studio", "1", "2", "3"] },
      // Fourth stat reuses `status` rather than inventing another figure — a
      // buyer scanning this block wants to know whether they can still buy.
      { kind: "text", label: "Availability", value: "Now selling" },
    ],
  },

  features: {
    caption: "Features",
    heading: "Everything on site",
    intro: [
      "Reem Eleven is built around the parts of a day that happen outside the apartment — the pool before work, the gym at dusk, the parcel waiting at the desk.",
      "Every amenity below is inside the building, so none of it depends on leaving.",
    ],
    image: {
      // TODO(asset): frame from the reel, standing in until photography lands.
      src: asset("reem-features-bg.webp"),
      alt: "The tower's facade above the pool terrace, the sea beyond.",
    },
    items: [
      { name: "Private Cinema", icon: "cinema" },
      { name: "Gym With a Panoramic View", icon: "gym" },
      { name: "Infinity Pool", icon: "pool" },
      { name: "24/7 Concierge", icon: "concierge" },
      { name: "Parking With Personal Storage Spaces", icon: "parking" },
      { name: "Common Leisure Spaces", icon: "lounge" },
      { name: "Smart Systems", icon: "smart" },
      { name: "EV Charging", icon: "ev" },
      { name: "Sauna and Steam Room", icon: "sauna" },
      { name: "BBQ Area", icon: "bbq" },
      { name: "24/7 CCTV and Building Security", icon: "security" },
      { name: "Children's Play Area", icon: "play" },
    ],
  },

  location: {
    caption: "Location",
    kicker: "Reem Eleven Location",
    heading: "Living Beyond Limits",
    // Cut to three lines so the section holds to one screen. The full paragraph
    // reads well but ran to nine lines, which pushed the travel times off the
    // fold on a laptop.
    body: "Set off the coast of Abu Dhabi, Reem Island pairs high-rise living with lush green space and the pristine beaches of the Arabian Gulf — premium schools, shopping and dining all minutes from the door.",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3630.483585944037!2d54.411415!3d24.5033437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e67001f493969%3A0x6cae596a541e83d!2sReem%20Eleven!5e0!3m2!1sen!2sae!4v1787739994583!5m2!1sen!2sae",
    mapLinkUrl: "https://maps.app.goo.gl/dFatwnmyHQSMvTvv7",
    coordinates: "24.5033° N, 54.4088° E",
    highlights: [
      { label: "Health & Wellness Centers", minutes: 5, icon: "wellness" },
      { label: "Zayed International Airport", minutes: 20, icon: "airport" },
      { label: "Educational Institutes", minutes: 5, icon: "education" },
      { label: "Entertainment Zones", minutes: 7, icon: "entertainment" },
      { label: "Shopping Destinations", minutes: 4, icon: "shopping" },
      { label: "Leisure Activities", minutes: 6, icon: "leisure" },
    ],
  },

  floorPlans: {
    caption: "Floor Plans",
    heading: "Layouts",
    intro:
      "Every home is delivered furnished. Choose a layout to see its plan, or take the full set away with you.",
    // The client's own sheets, resized for the web from the 4500x8000 originals
    // (6.3 MB -> 0.9 MB); the originals stay in /public/floorplans. Areas are
    // transcribed from each sheet so the page and the drawing cannot disagree.
    plans: [
      {
        label: "Studio",
        baths: 1,
        totalSqm: 41.31,
        totalSqft: 444.66,
        image: asset("floorplans/studio-web.webp"),
      },
      {
        label: "1 Bedroom",
        baths: 2,
        totalSqm: 79.52,
        totalSqft: 855.95,
        image: asset("floorplans/1bed-web.webp"),
      },
      {
        label: "2 Bedroom",
        baths: 3,
        totalSqm: 109.05,
        totalSqft: 1173.8,
        image: asset("floorplans/2bed-web.webp"),
      },
      {
        label: "3 Bedroom",
        baths: 4,
        totalSqm: 202.57,
        totalSqft: 2180.41,
        image: asset("floorplans/3bed-web.webp"),
      },
    ],
    // TODO(asset): add the PDFs to /public and set the urls, e.g.
    // asset('reem-eleven-floor-plans.pdf'). While null, each button asks for the
    // document instead of offering a download that would 404.
    downloads: [
      {
        label: "Download floor plan",
        requestLabel: "Request floor plan",
        url: null,
      },
      {
        label: "Download brochure",
        requestLabel: "Request brochure",
        url: null,
      },
    ],
    disclaimer:
      "Plans are illustrative and may not be to scale. Areas and layouts are approximate and subject to change.",
  },

  contact: {
    caption: "Enquire",
    headingLines: ["Register", "Your", "Interest"],
    body: "Get in touch with SAAS Properties to explore our luxury projects and tailored opportunities.",
    formNote:
      "Leave your details and a member of our team will be in touch with you shortly.",
    submitLabel: "Submit",
    privacyNote:
      "By sending this request you agree to our privacy policy. Your details are used only to answer your enquiry.",
    successMessage:
      "Thank you — your request has been received. We will be in touch shortly.",
    handoffMessage:
      "We have opened an email with your details. Send it and we will be in touch shortly.",
    errorMessage:
      "Something went wrong sending that. Please try again, or email us directly.",
    image: {
      // TODO(asset): frame from the reel, standing in until photography lands.
      src: asset("reem-contact-bg.webp"),
      alt: "The pool terrace at Reem Eleven, the city skyline beyond.",
    },
    // TODO(integration): no form backend exists yet. Until an endpoint is set
    // here the form composes a mail draft to BRAND.email instead, so a visitor
    // is never left with a button that silently does nothing.
    endpoint: null,
  },

  gallery: {
    caption: "Gallery",
    heading: "Inside the tower",
    /*
     * Grouped by what is actually in the frame rather than by which folder the
     * file arrived in: `public/gallery/exterior` holds three exteriors plus the
     * gym, spa, lobby and cinema, which are interiors of the shared floors.
     * Filing those four under "Exterior" would mean a visitor pressing Exterior
     * and being shown a cinema, so they have their own set. Nothing was moved on
     * disk — only the grouping here differs.
     */
    sets: [
      {
        id: "exterior",
        label: "Exterior",
        items: [
          {
            kind: "video",
            mp4: REEM_VIDEO,
            poster: REEM_POSTER,
            title: "The film",
            alt: "The Reem Eleven reel.",
          },
          {
            kind: "image",
            src: asset("gallery/exterior/reem-eleven-1.webp"),
            title: "Pool deck",
            alt: "The infinity pool on the podium, a mature olive at its centre and the open sea beyond.",
          },
          {
            kind: "image",
            src: asset("gallery/exterior/reem-eleven-2.webp"),
            title: "Terrace",
            alt: "The pool terrace with loungers along one edge and the Abu Dhabi skyline behind.",
          },
          {
            kind: "image",
            src: asset("gallery/exterior/reem-eleven-3.webp"),
            title: "Elevation",
            alt: "The tower's facade at dusk, lit balconies stepping up against the city.",
          },
          {
            kind: "image",
            src: asset("gallery/exterior/reem-eleven-4.webp"),
            title: "Terrace bar",
            alt: "The shaded terrace bar beside the pool, loungers along the water and the sea beyond.",
          },
        ],
      },
      {
        id: "interior",
        label: "Interior",
        items: [
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-1.webp"),
            title: "Living and dining",
            alt: "An open living and dining room, herringbone floor and full-height glazing to the water.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-5.webp"),
            title: "Sitting room",
            alt: "A sitting room with a green sofa, joinery wall and the sea through the glass.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-2.webp"),
            title: "Kitchen",
            alt: "A dark timber kitchen with a stone island and four stools.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-6.webp"),
            title: "Open kitchen",
            alt: "A pale timber kitchen open to the living space, pendants over the counter.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-3.webp"),
            title: "Principal bedroom",
            alt: "The principal bedroom, upholstered headboard wall and the city lights beyond the glass.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-7.webp"),
            title: "Second bedroom",
            alt: "A second bedroom in pale tones, artwork above the bed and a terrace beyond.",
          },
          {
            kind: "image",
            src: asset("gallery/interior/reem-eleven-int-4.webp"),
            title: "Bathroom",
            alt: "A marble bathroom with a freestanding stone tub and twin lit mirrors.",
          },
        ],
      },
    ],
  },
};

/**
 * One gallery frame by title, for the sections that borrow a photograph rather
 * than show the whole set — the amenity cards on the other two designs.
 *
 * By title rather than by index: those cards used to read `gallery.items[3]`,
 * which quietly picked a different picture every time the gallery was reordered
 * and had them illustrating "the pool before work" with a balcony. A title is
 * stable, and a wrong one fails loudly here instead of silently on the page.
 */
export function galleryFrame(title: string): Media & { title: string } {
  for (const set of PROPERTY.gallery.sets) {
    const found = set.items.find((item) => item.title === title);
    if (found) return found;
  }
  throw new Error(`galleryFrame: no gallery item titled "${title}"`);
}
