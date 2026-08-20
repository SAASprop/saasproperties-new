import { useSearchParams } from 'react-router-dom'
import { resolveVariant, type StoryVariant } from '../components/scroll-story/variants'

/** Query key that selects a scroll-story design. */
export const STORY_PARAM = 'story'
/** Query key that reveals the variant switcher on a deployed build. */
export const DEMO_PARAM = 'demo'

interface UseStoryVariant {
  variant: StoryVariant
  select: (id: string) => void
  /** Whether the switcher should be offered at all. */
  demoMode: boolean
}

/**
 * Selects the active scroll-story design from the URL.
 *
 * The URL is the source of truth rather than component state, so a particular
 * design can be sent to a client as a plain link and survives a refresh.
 */
export function useStoryVariant(): UseStoryVariant {
  const [params, setParams] = useSearchParams()

  const variant = resolveVariant(params.get(STORY_PARAM))
  // Visible while developing, and on a deployed build only when explicitly
  // asked for — a client following a bare link should not see the switcher.
  const demoMode = import.meta.env.DEV || params.get(DEMO_PARAM) === '1'

  const select = (id: string) => {
    const next = new URLSearchParams(params)
    next.set(STORY_PARAM, id)
    // Replace rather than push: cycling designs in a demo should not fill the
    // back button with history entries.
    setParams(next, { replace: true })
  }

  return { variant, select, demoMode }
}
