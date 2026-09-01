import { lazy, Suspense, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LoadingScreen } from '../components/LoadingScreen'
import { Navbar } from '../components/Navbar'
import { ScrollStory } from '../components/scroll-story'
import { RevealProvider } from '../components/RevealProvider'
import { MotionProvider } from '../components/MotionProvider'

/**
 * Everything below the hero, in its own chunk.
 *
 * The hero is the only thing a visitor can see on arrival, but the first paint
 * was waiting on the parse and mount of all eight sections beneath it. These are
 * still rendered immediately — the imports begin the moment the page does, and
 * on any normal connection they have arrived long before the loader lifts — but
 * they no longer sit between the browser and the first frame.
 *
 * Grouped into one lazy boundary rather than eight. Eight would mean eight
 * requests and eight separate mounts, and they are wanted at the same moment
 * anyway; splitting hero from not-hero is the division that matters.
 */
const BelowFold = lazy(() => import('../components/BelowFold'))

export default function Index() {
  const [revealed, setRevealed] = useState(false)
  /** Whether the sections below the hero have been put on the page yet. */
  const [belowFoldMounted, setBelowFoldMounted] = useState(false)

  /**
   * Mount everything under the hero once the main thread is free, or the moment
   * the visitor moves towards it — whichever comes first.
   *
   * Those eight sections each build a GSAP context, split text and register
   * ScrollTriggers on mount, and doing all of it in the same tick as the loader
   * lifting produced a single three-second task: the hero could not paint, and
   * nothing on the page could respond, until it finished. Waiting for idle
   * breaks that into work the browser schedules around the first paint instead.
   *
   * The scroll and pointer listeners are the safety net. Idle may never come on
   * a busy device, and a visitor who starts scrolling immediately must not find
   * an empty page under the hero.
   */
  useEffect(() => {
    if (belowFoldMounted) return

    const mount = () => setBelowFoldMounted(true)

    // requestIdleCallback is missing on Safari before 17, so it is read off the
    // window rather than called directly, and a timer stands in where it is not
    // there. Captured before the branch so the cleanup cancels the right one.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idleId = hasIdle ? window.requestIdleCallback(mount, { timeout: 1500 }) : 0
    const timerId = hasIdle ? 0 : window.setTimeout(mount, 400)

    window.addEventListener('scroll', mount, { once: true, passive: true })
    window.addEventListener('pointerdown', mount, { once: true, passive: true })

    return () => {
      if (hasIdle) window.cancelIdleCallback(idleId)
      else window.clearTimeout(timerId)
      window.removeEventListener('scroll', mount)
      window.removeEventListener('pointerdown', mount)
    }
  }, [belowFoldMounted])

  // Every ScrollTrigger position on the page is a measurement, and they were all
  // taken while the loader was still up — holding the page at opacity 0 and the
  // body's scroll locked. Dismissing it returns the scrollbar and changes the
  // width everything was measured against, so they are all stale by a few pixels
  // until this runs. Deferred a frame so it measures after the dismissal lands.
  useEffect(() => {
    if (!revealed) return
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [revealed])

  return (
    <MotionProvider>
      <LoadingScreen onComplete={() => setRevealed(true)} />

      {/* Navbar lives outside the reveal gate so it is in place the moment the
          loader clears. */}
      <Navbar />

      {/*
        Not opacity-gated on the loader any more.

        The loader is a fixed, fully opaque overlay at z-9999 — it already hides
        everything behind it — so holding the page at opacity 0 underneath it
        changed nothing visually and cost twice over: the browser could not
        report any content as painted until the fade finished, which is what put
        Largest Contentful Paint near four seconds, and animating opacity across
        a subtree this large promotes and repaints the entire page at the moment
        the loader leaves. The curtain lifting is now the whole transition.
      */}
      <main className="mx-auto max-w-[1600px]">
        {/* Entrance animations need to know when the loader has actually
            cleared, or they play out behind it. */}
        <RevealProvider revealed={revealed}>
          <ScrollStory />
        </RevealProvider>

        {/* No fallback: the alternative to an empty space below the hero is a
            placeholder of the wrong height, which would shift the page when the
            real thing replaced it. Nothing here is above the fold. */}
        {belowFoldMounted && (
          <Suspense fallback={null}>
            <BelowFold />
          </Suspense>
        )}
      </main>

    </MotionProvider>
  )
}
