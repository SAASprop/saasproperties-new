import { useEffect, useRef } from 'react'
import type { Media } from '../lib/property'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface PropertyMediaProps {
  media: Media
  /**
   * Whether this layer is the one on screen. Inactive video layers are paused
   * and left at `preload="none"` so a four-chapter story does not pull four
   * clips down at once.
   */
  active: boolean
  /** False while the whole section is offscreen, so nothing plays unseen. */
  inView?: boolean
  className?: string
}

/**
 * One full-bleed media layer. Video and image cases render to the same box, so
 * a photo-only property needs no layout special-casing.
 *
 * Uses a plain MP4 rather than the HLS path in `useHlsVideo`: these clips are
 * short, and hooks cannot be called conditionally on whether an HLS manifest
 * exists. Adopt `useHlsVideo` here once every property has a Mux playback ID.
 */
export function PropertyMedia({ media, active, inView = true, className }: PropertyMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  const shouldPlay = active && inView && !reducedMotion

  // Hold the playhead at or after startTime, including after each loop wrap —
  // `loop` restarts at 0, which would replay the title card the offset exists to
  // skip.
  const startTime = media.kind === 'video' ? media.startTime : undefined

  useEffect(() => {
    const video = videoRef.current
    if (!video || startTime === undefined) return

    const enforce = () => {
      // Guard against a startTime past the end of a shorter re-cut.
      if (Number.isFinite(video.duration) && startTime >= video.duration) return
      if (video.currentTime < startTime - 0.25) video.currentTime = startTime
    }

    video.addEventListener('loadedmetadata', enforce)
    video.addEventListener('timeupdate', enforce)
    enforce()

    return () => {
      video.removeEventListener('loadedmetadata', enforce)
      video.removeEventListener('timeupdate', enforce)
    }
  }, [startTime])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (shouldPlay) {
      // Autoplay can still be refused (low-power mode, no user gesture yet);
      // the poster stays up in that case, which is an acceptable outcome.
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [shouldPlay])

  if (media.kind === 'image') {
    return (
      <img
        src={media.src}
        alt={media.alt}
        className={className}
        loading={active ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  // Under reduced motion the poster is the whole experience — no video element
  // is mounted at all, so nothing decodes.
  if (reducedMotion) {
    return <img src={media.poster} alt={media.alt} className={className} decoding="async" />
  }

  return (
    <video
      ref={videoRef}
      className={className}
      src={media.mp4}
      poster={media.poster}
      // 'metadata' rather than 'auto': 'auto' asks the browser to pull the whole
      // file up front, which for a multi-megabyte reel is a large download
      // before anything is on screen. Autoplay still streams what it needs.
      preload={active ? 'metadata' : 'none'}
      muted
      loop
      playsInline
      disablePictureInPicture
      tabIndex={-1}
      aria-label={media.alt}
    />
  )
}
