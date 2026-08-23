import { motion } from 'framer-motion'
import { useGalleryVariant } from '../../hooks/useGalleryVariant'
import { useMotionDisabled } from '../../lib/motion'
import { GalleryV1 } from './GalleryV1'
import { GalleryV2 } from './GalleryV2'

/**
 * Renders whichever gallery the URL selects, mirroring how ScrollStory picks a
 * scroll-story design.
 *
 * Keyed on the variant so React swaps the whole section in one commit: the
 * outgoing one is gone before the incoming one mounts, which is what keeps the
 * page from briefly holding both and jumping. The incoming section fades up from
 * nothing — there is no crossfade, because two full-bleed sections on the page
 * at once would double the height of it for the length of the transition.
 *
 * Only one variant is ever mounted, so only one variant's images are ever
 * fetched, and the two share their URLs anyway.
 */
export function Gallery() {
  const { id, select } = useGalleryVariant()
  const motionOff = useMotionDisabled()
  const Variant = id === 'v2' ? GalleryV2 : GalleryV1

  return (
    <motion.div
      key={id}
      // `false` rather than a zero-length fade. `initial={{ opacity: 0 }}`
      // renders the section transparent and relies on an animation frame to
      // bring it back, so anything that stops those frames — a switched-off
      // motion system, a stalled main thread — leaves the whole gallery
      // invisible while still taking up its full height on the page.
      initial={motionOff ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: motionOff ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Variant variant={id} onSelectVariant={select} />
    </motion.div>
  )
}
