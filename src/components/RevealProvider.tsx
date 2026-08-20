import type { ReactNode } from 'react'
import { RevealContext } from '../lib/reveal'

/** Publishes the loader's completion state to any entrance animation below it. */
export function RevealProvider({
  revealed,
  children,
}: {
  revealed: boolean
  children: ReactNode
}) {
  return <RevealContext.Provider value={revealed}>{children}</RevealContext.Provider>
}
