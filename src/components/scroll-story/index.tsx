import { useStoryVariant } from '../../hooks/useStoryVariant'

export { StoryVariantSwitcher } from './StoryVariantSwitcher'
export { STORY_VARIANTS } from './variants'

/** Renders whichever scroll-story design the URL selects. */
export function ScrollStory() {
  const { variant } = useStoryVariant()
  const Variant = variant.component
  return <Variant />
}
