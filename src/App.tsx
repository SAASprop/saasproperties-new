import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* Any deep link on the Pages deployment falls back to the single page. */}
      <Route path="*" element={<Index />} />
    </Routes>
  )
}
