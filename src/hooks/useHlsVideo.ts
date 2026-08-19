import { useEffect } from 'react'
import Hls from 'hls.js'
import { useIsMobile } from './useIsMobile'

export interface HlsVideoSources {
  /** HLS manifest (Mux) — preferred when the browser or hls.js can play it. */
  hls: string
  /** Progressive fallbacks, used when HLS is unavailable. */
  mp4Desktop: string
  mp4Mobile: string
}

/**
 * Attaches an adaptive HLS stream to a <video>, falling back to a progressive
 * MP4 when neither native HLS nor hls.js is available. Only used by the looping
 * hero background — the scroll-scrubbed video deliberately stays on plain MP4,
 * because HLS segment boundaries make frame-accurate seeking unreliable.
 */
export function useHlsVideo(
  ref: React.RefObject<HTMLVideoElement | null>,
  sources: HlsVideoSources,
): void {
  const isMobile = useIsMobile()
  const { hls, mp4Desktop, mp4Mobile } = sources
  const mp4 = isMobile ? mp4Mobile : mp4Desktop

  useEffect(() => {
    const video = ref.current
    if (!video) return

    // Safari and iOS play HLS natively; no JS player needed.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hls
      return
    }

    if (Hls.isSupported()) {
      const player = new Hls({ enableWorker: true, lowLatencyMode: false })
      player.loadSource(hls)
      player.attachMedia(video)
      player.on(Hls.Events.ERROR, (_event, data) => {
        // Any unrecoverable HLS failure drops the element back to the MP4.
        if (data.fatal) {
          player.destroy()
          video.src = mp4
          video.load()
        }
      })
      return () => player.destroy()
    }

    video.src = mp4
  }, [ref, hls, mp4])
}
