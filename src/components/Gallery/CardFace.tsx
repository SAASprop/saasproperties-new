import type { LightboxMedia } from '../MediaLightbox'

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
  item: LightboxMedia
  decorative?: boolean
}) {
  return (
    <>
      {/* A video item shows its poster. The hero already streams this reel; a
          second <video> here would refetch all 29 MB of it for a card this
          size. It plays at full size in the viewer instead. */}
      <img
        src={item.kind === 'video' ? item.poster : item.src}
        alt={decorative ? '' : item.alt}
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
      <span className="g-cue" aria-hidden="true">
        <span>View full image</span>
        <svg className="g-cue-icon" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 1.75H1.75V6M10 1.75H14.25V6M10 14.25H14.25V10M6 14.25H1.75V10"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      </span>
    </>
  )
}
