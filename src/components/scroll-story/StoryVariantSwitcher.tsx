import { useState } from "react";
import { STORY_VARIANTS } from "./variants";
import { useStoryVariant } from "../../hooks/useStoryVariant";

/**
 * Demo-only control for cycling scroll-story designs. Renders nothing unless
 * demo mode is on (dev server, or ?demo=1 on a deployed build).
 *
 * Collapsed to a single pill by default so it does not sit on top of the design
 * it exists to show off.
 */
export function StoryVariantSwitcher() {
  const { variant, select, demoMode } = useStoryVariant();
  const [open, setOpen] = useState(false);

  if (!demoMode) return null;

  return (
    // Top corners are the only spots free in every variant: v2 fills the bottom
    // with its spec bar and v3 with its right-hand column. Top-left on mobile
    // (the header logo is desktop-only) and top-right on desktop, where the
    // navbar's own right slot is just an invisible spacer.
    // Invisible until the corner is hovered, so it stays out of the way while
    // the design is being looked at. The wrapper keeps its size either way, so
    // there is always something to hover; focus-within keeps it reachable by
    // keyboard, and an open panel pins it visible.
    <div
      className={`group fixed left-4 top-4 z-[60] flex flex-col-reverse items-start gap-2 transition-opacity duration-300 focus-within:opacity-100 hover:opacity-100 sm:left-auto sm:right-4 sm:items-end ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {open && (
        <div className="w-64 rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
          {STORY_VARIANTS.map((entry) => {
            const isActive = entry.id === variant.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => select(entry.id)}
                className={`block w-full rounded-xl p-3 text-left transition-colors duration-200 ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={`text-[11px] uppercase tracking-[0.2em] ${
                    isActive ? "text-text" : "text-white/60"
                  }`}
                >
                  {entry.name}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-white/45">
                  {entry.note}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl transition-colors duration-200 hover:text-text"
        aria-expanded={open}
      >
        Design · {variant.id}
      </button>
    </div>
  );
}
