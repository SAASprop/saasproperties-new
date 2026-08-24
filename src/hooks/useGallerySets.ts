import { useState } from 'react'
import { PROPERTY, type GallerySet } from '../lib/property'

const { sets } = PROPERTY.gallery

/**
 * Which set of photography is on show.
 *
 * Every design on the site has its own gallery — a 3D ring, a plate sequence, a
 * pinned rail — but they all show one set at a time and switch between them the
 * same way, so the state lives here rather than four times over. A design only
 * has to render `items` where it used to render `gallery.items`, and drop in the
 * shared GallerySwitch.
 */
export function useGallerySets(): {
  sets: GallerySet[]
  activeId: string
  select: (id: string) => void
  active: GallerySet
  items: GallerySet['items']
} {
  const [activeId, setActiveId] = useState(sets[0].id)

  // Falls back to the first set rather than trusting the id: the sets are data,
  // and one being renamed or dropped should change what is shown, not blank the
  // section out.
  const active = sets.find((set) => set.id === activeId) ?? sets[0]

  return { sets, activeId: active.id, select: setActiveId, active, items: active.items }
}
