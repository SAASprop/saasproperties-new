import type { ComponentType } from 'react'
import { ScrollStoryV1 } from './ScrollStoryV1'
import { ScrollStoryV3 } from './ScrollStoryV3'

export interface StoryVariant {
  /** Stable URL slug — appears as ?story=<id>, so do not rename casually. */
  id: string
  /** Shown in the demo switcher. */
  name: string
  /** One line on what makes this version different. */
  note: string
  component: ComponentType
}

/**
 * All scroll-story designs ship in every build so a demo can cycle between them
 * live. Add a variant by dropping a component in this folder and appending it
 * here — nothing else needs to change.
 *
 * The first entry is the default for anyone arriving without ?story=.
 */
export const STORY_VARIANTS: StoryVariant[] = [
  {
    id: 'v3',
    name: 'V3 · Editorial',
    note: 'Single-viewport hero. GSAP masked-letter reveal, oversized display word.',
    component: ScrollStoryV3,
  },
  {
    id: 'v1',
    name: 'V1 · Scrub',
    note: 'Original scroll-scrubbed playhead. Needs keyframe-dense video to run smoothly.',
    component: ScrollStoryV1,
  },
]

export const DEFAULT_VARIANT_ID = STORY_VARIANTS[0].id

export function resolveVariant(id: string | null): StoryVariant {
  return STORY_VARIANTS.find((variant) => variant.id === id) ?? STORY_VARIANTS[0]
}
