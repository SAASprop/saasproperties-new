/**
 * The flags the dial-code list needs, and only those.
 *
 * This replaces the `flag-icons` stylesheet. That package draws every flag in
 * the world as a CSS background, and Vite inlined each small one as a data URI —
 * roughly 400 kB of base64 in the page's single render-blocking stylesheet, for
 * eighteen countries, none of which is visible until someone opens the dropdown.
 *
 * As imported URLs instead, Vite emits each flag as its own hashed file and the
 * browser fetches one — the selected country's — on first paint, with the rest
 * arriving only if the list is opened. Adding a country here means adding its
 * SVG to src/assets/flags and one line below; the type makes a mismatch between
 * the two a compile error rather than a missing picture.
 */

import ae from '../../assets/flags/ae.svg'
import bh from '../../assets/flags/bh.svg'
import cn from '../../assets/flags/cn.svg'
import de from '../../assets/flags/de.svg'
import eg from '../../assets/flags/eg.svg'
import fr from '../../assets/flags/fr.svg'
import gb from '../../assets/flags/gb.svg'
import inFlag from '../../assets/flags/in.svg'
import jo from '../../assets/flags/jo.svg'
import kw from '../../assets/flags/kw.svg'
import lb from '../../assets/flags/lb.svg'
import om from '../../assets/flags/om.svg'
import pk from '../../assets/flags/pk.svg'
import qa from '../../assets/flags/qa.svg'
import ru from '../../assets/flags/ru.svg'
import sa from '../../assets/flags/sa.svg'
import tr from '../../assets/flags/tr.svg'
import us from '../../assets/flags/us.svg'

export const FLAGS = {
  ae,
  bh,
  cn,
  de,
  eg,
  fr,
  gb,
  in: inFlag,
  jo,
  kw,
  lb,
  om,
  pk,
  qa,
  ru,
  sa,
  tr,
  us,
} as const

export type FlagIso = keyof typeof FLAGS