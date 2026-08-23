import { useSearchParams } from 'react-router-dom'

/** Query key that selects a gallery design. */
export const GALLERY_PARAM = 'gallery'

export type GalleryVariantId = 'v1' | 'v2'

interface UseGalleryVariant {
  id: GalleryVariantId
  select: (id: GalleryVariantId) => void
}

/**
 * Selects the active gallery from the URL, the same way the scroll story picks
 * its design in useStoryVariant.
 *
 * The URL rather than component state, so a particular gallery can be sent to a
 * client as a plain link and survives a refresh. V1 is the default and clears
 * the key rather than writing ?gallery=v1, so the canonical page stays clean.
 */
export function useGalleryVariant(): UseGalleryVariant {
  const [params, setParams] = useSearchParams()

  const id: GalleryVariantId = params.get(GALLERY_PARAM) === 'v2' ? 'v2' : 'v1'

  const select = (next: GalleryVariantId) => {
    const updated = new URLSearchParams(params)
    if (next === 'v1') updated.delete(GALLERY_PARAM)
    else updated.set(GALLERY_PARAM, next)
    // Replaced rather than pushed: flipping between the two should not fill the
    // back button with history entries.
    setParams(updated, { replace: true })
  }

  return { id, select }
}
