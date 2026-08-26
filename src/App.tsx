import Index from './pages/Index'

/**
 * One property, one page.
 *
 * There were three routes here — the live page plus two alternative art
 * directions kept for comparison — and with those retired there is nothing left
 * to route between. The router went with them rather than being left in place
 * around a single element: a BrowserRouter that resolves one component is
 * indirection with nothing on the other side of it.
 */
export default function App() {
  return <Index />
}
