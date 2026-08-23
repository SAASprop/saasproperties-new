import type { GalleryVariantId } from '../../hooks/useGalleryVariant'

/**
 * Switches between the two galleries.
 *
 * Rendered inside each section rather than over it, so it inherits that
 * section's text colour — the two have opposite grounds, and this way neither
 * needs to be told which. It sits at a low opacity until hovered or focused, so
 * it stays out of the way of the design it is there to change.
 */
export function VariantToggle({
  current,
  onSelect,
}: {
  current: GalleryVariantId
  onSelect: (id: GalleryVariantId) => void
}) {
  const next: GalleryVariantId = current === 'v1' ? 'v2' : 'v1'

  return (
    <button
      type="button"
      className="g-variant"
      onClick={() => onSelect(next)}
      aria-label={`Switch to gallery ${next.toUpperCase()}`}
    >
      {next.toUpperCase()}
    </button>
  )
}
