import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import DesignV2 from './pages/DesignV2'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* A second art direction for the same property, to be compared against
          "/". It shares the data and the functional components and none of the
          layout; the production route above is untouched. Declared before the
          catch-all, which would otherwise swallow it. */}
      <Route path="/design" element={<DesignV2 />} />
      {/* Any deep link on the Pages deployment falls back to the single page. */}
      <Route path="*" element={<Index />} />
    </Routes>
  )
}
