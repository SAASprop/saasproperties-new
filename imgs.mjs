import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: 'C:/Users/IsmailHussein/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' })
// Served the way Pages serves it, so a missing file 404s exactly as in production.
for (const route of ['', 'design', 'design-2']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  const bad = []
  p.on('response', (r) => {
    if (r.status() >= 400 && /\.(jpg|jpeg|png|mp4|webp|svg|ico)$/i.test(new URL(r.url()).pathname)) bad.push(`${r.status()} ${r.url().split('/saasproperties-new/')[1]}`)
  })
  await p.goto('http://localhost:5300/saasproperties-new/' + route, { waitUntil: 'load' })
  // Walk the page so every lazy image is asked for.
  for (let y = 0; y < 12; y++) {
    await p.evaluate((i) => window.scrollTo(0, i * window.innerHeight * 0.8), y)
    await p.waitForTimeout(700)
  }
  // Also flip the gallery switch, so the other set's files are fetched.
  const opts = p.locator('.gs-opt')
  for (let i = 0; i < await opts.count(); i++) { await opts.nth(i).click({ force: true }).catch(() => {}); await p.waitForTimeout(900) }
  // Any <img> that decoded to nothing is a broken image, however it got there.
  const broken = await p.evaluate(() => [...document.querySelectorAll('img')]
    .filter((i) => i.currentSrc && i.complete && i.naturalWidth === 0)
    .map((i) => i.currentSrc.split('/saasproperties-new/')[1]))
  console.log(`/${route || ''}`.padEnd(10), `image 404s: ${bad.length ? [...new Set(bad)].join(', ') : 'none'}`)
  console.log('          ', `broken <img>: ${broken.length ? [...new Set(broken)].join(', ') : 'none'}`)
  await p.close()
}
await b.close()
