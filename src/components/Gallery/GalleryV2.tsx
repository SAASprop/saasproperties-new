import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type OpenOrigin } from '../MediaLightbox'
import { useMotionDisabled } from '../../lib/motion'
import type { GalleryVariantId } from '../../hooks/useGalleryVariant'
import { CardFace } from './CardFace'
import { VariantToggle } from './VariantToggle'
import { GallerySwitch } from './GallerySwitch'
import { useGallerySets } from '../../hooks/useGallerySets'
import { originOf } from './origin'
import './v2.css'

// Both ship inside gsap 3.15, so this adds no dependency. Draggable needs
// InertiaPlugin registered before `inertia: true` does anything.
gsap.registerPlugin(Draggable, InertiaPlugin)

const { gallery } = PROPERTY

/**
 * Slots on the ring. Must match --v2-unit in v2.css (360 / slots).
 *
 * Twelve for six images puts each photograph at two places 180deg apart, and
 * the ring is seen from outside, so the far one is always facing away and culled
 * by backface-visibility. One copy of each is visible, always — which is what
 * lets the pitch be 30deg rather than 60deg, and the wall dense rather than
 * sparse, without ever showing the same photograph twice.
 */
const SLOTS = 12

/** Idle drift, in degrees per second. One full turn takes just under two minutes. */
const DRIFT = 3.2

/**
 * Degrees of rotation per pixel dragged. At this rate a comfortable 400px swipe
 * turns the ring by about 88deg — three cards. Higher feels twitchy on a
 * trackpad; lower makes the far side of the ring a chore to reach.
 */
const SENSITIVITY = 0.22

/**
 * The cinematic ring: a cylinder of photographs seen from the outside, turned
 * by hand.
 *
 * Where V1 is a wall the viewer stands inside and cannot touch, this is an
 * object in front of them that they can take hold of. That is the whole
 * difference between the two, and it is why this one needs JavaScript at all:
 * the rotation is not a fixed loop that CSS can own but a value the drag, the
 * inertia and the idle drift all write to.
 *
 * GSAP touches exactly one property on one element — rotationY on the ring.
 * Everything else, including each card's place on the cylinder, is CSS.
 */
export function GalleryV2({
  variant,
  onSelectVariant,
}: {
  variant: GalleryVariantId
  onSelectVariant: (id: GalleryVariantId) => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLUListElement>(null)

  const [viewer, setViewer] = useState<{ index: number; origin: OpenOrigin } | null>(null)
  const reducedMotion = useMotionDisabled()

  /**
   * Everything that stops the drift, as a mutable set of reasons. A ref rather
   * than state because the drag handlers below write to it many times a second
   * and must not re-render, and because tearing Draggable down and rebuilding it
   * whenever the viewer opens would lose the ring's position.
   */
  const holds = useRef({ drag: false, hover: false, offscreen: true, viewer: false })
  const sync = useRef<() => void>(() => {})
  /** Set while a drag is actually moving, so the release does not open a card. */
  const dragged = useRef(false)

  const { sets, activeId, select, items } = useGallerySets()

  const count = items.length

  const slots = useMemo(
    () => Array.from({ length: SLOTS }, (_, i) => ({ item: items[i % count], i })),
    [items, count],
  )

  useLayoutEffect(() => {
    const stage = stageRef.current
    const ring = ringRef.current
    if (!stage || !ring) return

    /** The one number the whole carousel is. */
    const spin = { value: 0 }
    const apply = () => gsap.set(ring, { rotationY: spin.value })

    // A ticker rather than a repeating tween: the drift and the drag both write
    // to the same value, so a tween holding its own cached start and end would
    // snap back to them the moment a drag moved the ring underneath it. Reading
    // the frame delta instead keeps it frame-rate independent, and the callback
    // is only attached while the ring should actually be turning.
    const drift = (_time: number, delta: number) => {
      spin.value += (delta / 1000) * DRIFT
      apply()
    }

    let running = false
    const update = () => {
      const state = holds.current
      const should =
        !state.drag && !state.hover && !state.offscreen && !state.viewer && !reducedMotion
      if (should === running) return
      running = should
      if (should) gsap.ticker.add(drift)
      else gsap.ticker.remove(drift)
    }
    sync.current = update

    const hold = (key: keyof typeof holds.current, value: boolean) => {
      holds.current[key] = value
      update()
    }

    // Draggable drives a detached proxy rather than the ring itself: the ring's
    // transform is a rotation and Draggable wants to write translations. Reading
    // the proxy's travel and turning it into degrees keeps the two separate, and
    // means `inertia` gives the throw its glide for free.
    const proxy = document.createElement('div')
    let last = 0
    // Held rather than read off `this`: these typings give the callbacks the
    // config object as their `this`, not the instance. Nothing can fire before
    // create() has returned, so it is always assigned by the time it is read.
    let drag: Draggable | undefined

    /** Turns the proxy's travel since the last call into degrees of spin. */
    const step = () => {
      if (!drag) return
      spin.value += (drag.x - last) * SENSITIVITY
      last = drag.x
      apply()
    }

    drag = Draggable.create(proxy, {
      type: 'x',
      // The stage, not an overlay: an overlay would swallow the clicks that open
      // the viewer. Cards stay clickable underneath, and `dragged` below is what
      // separates a click from the end of a throw.
      trigger: stage,
      inertia: true,
      // Vertical swipes still scroll the page. Without this the section becomes
      // a trap on a phone.
      allowNativeTouchScrolling: true,
      onPress() {
        last = drag?.x ?? 0
        dragged.current = false
        hold('drag', true)
      },
      onDrag() {
        dragged.current = true
        step()
      },
      onThrowUpdate: step,
      onRelease() {
        // A throw keeps the hold until it has coasted to a stop.
        if (!drag?.isThrowing) hold('drag', false)
      },
      onThrowComplete() {
        hold('drag', false)
      },
    })[0]

    const enter = () => hold('hover', true)
    const leave = () => hold('hover', false)
    stage.addEventListener('pointerenter', enter)
    stage.addEventListener('pointerleave', leave)

    const observer = new IntersectionObserver(
      ([entry]) => hold('offscreen', !entry.isIntersecting),
      { rootMargin: '15% 0px' },
    )
    observer.observe(stage)

    apply()
    update()

    return () => {
      gsap.ticker.remove(drift)
      drag?.kill()
      observer.disconnect()
      stage.removeEventListener('pointerenter', enter)
      stage.removeEventListener('pointerleave', leave)
      sync.current = () => {}
    }
  }, [reducedMotion])

  // The viewer is React state, so it cannot be read from inside the effect
  // above without rebuilding it. It is pushed in instead.
  useEffect(() => {
    holds.current.viewer = viewer !== null
    sync.current()
  }, [viewer])

  return (
    <section id="gallery" className="v2-section full-bleed" aria-label="Gallery">
      <div className="v2-head">
        <p className="v2-eyebrow">{gallery.caption}</p>
        <h2 className="v2-title">{gallery.heading}</h2>
        <GallerySwitch sets={sets} activeId={activeId} onSelect={select} className="v2-switch" />
      </div>

      <VariantToggle current={variant} onSelect={onSelectVariant} />

      <div className="v2-stage" ref={stageRef}>
        {/* Pushes the cylinder back so the card facing the viewer sits at z=0
            and renders at its natural size, rather than magnified. CSS owns
            this; GSAP owns only the rotation on the ring inside it. */}
        <div className="v2-depth">
          <ul className="v2-ring" ref={ringRef}>
            {slots.map(({ item, i }) => {
              const isRepeat = i >= count

              return (
                <li
                  key={i}
                  className="v2-slot"
                  style={{ '--i': i } as React.CSSProperties}
                  aria-hidden={isRepeat || undefined}
                >
                  <button
                    type="button"
                    className="v2-card"
                    onClick={(event) => {
                      // The end of a throw arrives as a click. Only a still
                      // pointer should open anything.
                      if (dragged.current) return
                      setViewer({ index: i % count, origin: originOf(event) })
                    }}
                    aria-label={`Open ${item.title}`}
                    tabIndex={isRepeat ? -1 : undefined}
                  >
                    <CardFace item={item} decorative={isRepeat} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Sinks the edges into the ground. Past about 68deg the cards fold back
            towards the silhouette and pile up; this is where they go to do it
            out of sight, and it is why no per-frame opacity work is needed. */}
        <div className="v2-vignette" aria-hidden="true" />
      </div>

      <p className="v2-hint">Drag to explore</p>

      <MediaLightbox
        items={items}
        index={viewer?.index ?? null}
        origin={viewer?.origin ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) => setViewer((open) => (open ? { ...open, index } : null))}
      />
    </section>
  )
}
