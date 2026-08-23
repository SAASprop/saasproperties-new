import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import DesignV2 from './pages/DesignV2'
import Design2 from './pages/Design2'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* Alternative art directions for the same property, to be compared
          against "/". Each shares the data and the functional components and
          none of the layout; the production route above is untouched. Both are
          declared before the catch-all, which would otherwise swallow them.

          /design    editorial — asymmetric, oversized uppercase type
          /design-2  kinetic — small refined wordmark, scroll-driven throughout */}
      <Route path="/design" element={<DesignV2 />} />
      <Route path="/design-2" element={<Design2 />} />
      {/* Any deep link on the Pages deployment falls back to the single page. */}
      <Route path="*" element={<Index />} />
    </Routes>
  )
}
