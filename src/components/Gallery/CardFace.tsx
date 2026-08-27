import type { LightboxMedia } from "../MediaLightbox";

/**
 * The inside of a gallery card: the still, the veil and the hover cue.
 *
 * Shared by both galleries so the hover treatment is identical in each. What
 * differs between them — the button, its position, its 3D transform — belongs to
 * whichever variant is rendering it.
 *
 * The cue's type is sized from --cue-size rather than in px, because in both
 * galleries the card sits inside a perspective that shrinks whatever is drawn
 * inside it. How much it shrinks is a property of that variant's geometry, so
 * each one sets the variable and this stays ignorant of it. See the note on
 * .g-cue in styles.css.
 */
export function CardFace({
  item,
  /** A repeated slot: already announced elsewhere on the ring, so silent here. */
  decorative = false,
}: {
  item: LightboxMedia;
  decorative?: boolean;
}) {
  return (
    <>
      {/* A video item shows its poster. The hero already streams this reel; a
          second <video> here would refetch all 29 MB of it for a card this
          size. It plays at full size in the viewer instead. */}
      <img
        src={item.kind === "video" ? item.poster : item.src}
        alt={decorative ? "" : item.alt}
        // Both galleries repeat the same handful of files across their slots, so
        // this is six requests however many cards there are. Deferring them
        // keeps the section off the critical path on the way down the page.
        loading="lazy"
        decoding="async"
        draggable={false}
      />

      {/* Hover state. Both layers are inert and hidden until the card is
          hovered or focused, so they cost nothing on the cards turning past in
          the background. The button's own aria-label already says what a click
          does — this is the visual echo of it, so it stays out of the a11y
          tree. */}
      <span className="g-veil" aria-hidden="true" />

      {/* The kind of thing behind the card, named and drawn. A still and a reel
          are the same rectangle until one is opened, and finding out by clicking
          is the wrong way round — so the mark sits in the corner opposite the
          label, where it reads as a plate on the frame rather than a control. */}
      <span className="g-kind text-white" aria-hidden="true">
        {item.kind === "video" ? (
          <svg className="g-kind-icon" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="6.6"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path d="M6.6 5.5 11 8l-4.4 2.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg className="g-kind-icon" viewBox="0 0 16 16" fill="none">
            <rect
              x="1.9"
              y="3.4"
              width="12.2"
              height="9.2"
              rx="1.4"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle
              cx="5.9"
              cy="6.7"
              r="1.05"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="m3.1 11.6 3.2-3 2.2 2 2-1.7 2.4 2.2"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="text-white">
          {item.kind === "video" ? "Video" : "Photo"}
        </span>
      </span>

      <span className="g-cue" aria-hidden="true">
        {/* The picture's own name, not an instruction. "View image" was the
            same words on every card: it described what a click does, which the
            button's aria-label already says, and told the visitor nothing about
            what they were looking at. */}
        <span className="g-cue-name text-white">{item.title}</span>
        <svg className="g-cue-icon text-white" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 1.75H1.75V6M10 1.75H14.25V6M10 14.25H14.25V10M6 14.25H1.75V10"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      </span>
    </>
  );
}
