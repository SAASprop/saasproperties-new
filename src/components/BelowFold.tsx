import { Overview } from './Overview'
import { PropertyStats } from './PropertyStats'
import { Features } from './Features'
import { Gallery } from './Gallery'
import { FloorPlans } from './FloorPlans'
import { Location } from './Location'
import { Contact } from './Contact'
import { ContactFooter } from './ContactFooter'

/**
 * Every section beneath the hero, as one lazy chunk.
 *
 * This file exists only to give the code splitter a boundary to cut on — see
 * the `lazy()` call in pages/Index. The order here is the page's order, so this
 * is also the quickest place to read what the page is made of.
 */
export default function BelowFold() {
  return (
    <>
      <Overview />
      <PropertyStats />
      <Features />
      <Gallery />
      <FloorPlans />
      <Location />
      <Contact />
      <ContactFooter />
    </>
  )
}
