import { createContext, useContext } from 'react'

/**
 * Whether the loading screen has finished and the page is actually visible.
 *
 * Entrance animations need this: the loader covers the page for several seconds,
 * so a timeline started on mount plays out unseen and the visitor arrives to an
 * already-finished hero. Timing it with a hardcoded delay would silently drift
 * apart from LOADER's own numbers, so the state is shared instead.
 *
 * The provider lives in components/RevealProvider so that this module exports no
 * components — otherwise it breaks fast refresh for everything importing it.
 */
export const RevealContext = createContext(false)

export function useRevealed(): boolean {
  return useContext(RevealContext)
}
