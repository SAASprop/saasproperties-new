import type { MouseEvent } from 'react'
import type { OpenOrigin } from '../MediaLightbox'

/**
 * The clicked card's box, for the viewer to grow out of.
 *
 * Measured off the still rather than the button, so the frame matches what is
 * actually on screen. For a card turned in 3D this returns the bounding box of
 * the projected quad, which is the right answer here: it is the area the card
 * visually occupies, which is what the expansion should start from.
 */
export function originOf(event: MouseEvent<HTMLElement>): OpenOrigin {
  const target = event.currentTarget.querySelector('img') ?? event.currentTarget
  const { left, top, width, height } = target.getBoundingClientRect()
  return { left, top, width, height }
}
