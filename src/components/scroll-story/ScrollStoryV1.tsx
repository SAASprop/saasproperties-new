import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SCROLL_STORY, SCRUB_VIDEO } from "../../lib/content";
import { useIsMobile } from "../../hooks/useIsMobile";

/** Below this scroll progress the "Scroll to Explore" hint stays visible. */
const HINT_THRESHOLD = 0.03;
/** Per-frame easing factor for the playhead chase. */
const LERP = 0.08;

export function ScrollStoryV1() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const src = isMobile ? SCRUB_VIDEO.mobile : SCRUB_VIDEO.desktop;

  // Mobile browsers frequently skip preloading until an explicit load() call,
  // which would leave duration as NaN and stall the scrubber.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setReady(false);

    // Either event is enough to know duration is populated; whichever lands
    // first wins and the other is ignored.
    const markReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) setReady(true);
    };

    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("canplay", markReady);
    video.load();
    markReady();

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, [src]);

  // Scroll position drives the playhead; the video never plays on its own.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !ready) return;

    let frame = 0;
    let targetTime = 0;
    let displayTime = video.currentTime || 0;

    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const ratio = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      targetTime = ratio * video.duration;
      setProgress(ratio);
    };

    const tick = () => {
      displayTime += (targetTime - displayTime) * LERP;

      // Seeking while a previous seek is in flight makes the decoder thrash and
      // the picture judder, so skip those frames entirely.
      if (!video.seeking && Math.abs(video.currentTime - displayTime) > 0.01) {
        video.currentTime = displayTime;
      }

      frame = window.requestAnimationFrame(tick);
    };

    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, [ready, src]);

  const showHint = progress < HINT_THRESHOLD;

  return (
    <section id="flagship" ref={sectionRef} className="relative h-[600vh]">
      <div className="sticky top-0 flex h-screen flex-col px-4 pb-6 pt-24 sm:px-6 sm:pb-10 sm:pt-28">
        {/* Title row */}
        <AnimatePresence>
          <motion.div
            key="title"
            className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pb-4 sm:pb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          >
            <div>
              <p className="eyebrow">{SCROLL_STORY.eyebrow}</p>
              <h1 className="mt-2 font-display text-3xl italic leading-none text-text sm:text-5xl md:text-6xl">
                {SCROLL_STORY.title}
              </h1>
            </div>
            <p className="max-w-xs text-sm text-muted">
              {SCROLL_STORY.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Video panel */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-stroke bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={src}
            poster={SCRUB_VIDEO.poster}
            preload="auto"
            muted
            playsInline
            // Not a decorative element, but there is no audio track and it never
            // autoplays, so no controls are exposed.
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
          />

          <AnimatePresence>
            {showHint && (
              <motion.span
                key="hint"
                className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-[10px] uppercase tracking-[0.3em] text-text/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {SCROLL_STORY.scrollHint}
              </motion.span>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
            <div
              className="accent-gradient h-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Location bar */}
        <AnimatePresence>
          <motion.div
            key="locations"
            className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
          >
            <div className="flex flex-wrap gap-x-10 gap-y-2">
              {SCROLL_STORY.locations.map((location) => (
                <div key={location.name}>
                  <p className="text-sm text-text">{location.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
                    {location.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SCROLL_STORY.travelTimes.map((entry) => (
                <span
                  key={entry.label}
                  className="rounded-full border border-stroke px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted"
                >
                  {entry.label} ·{" "}
                  <span className="text-text">{entry.value}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
