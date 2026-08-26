import { useEffect, useMemo, useRef, useState } from "react";
import { PROPERTY } from "../../lib/property";
import { MediaLightbox, type OpenOrigin } from "../MediaLightbox";
import { CardFace } from "./CardFace";
import { GallerySwitch } from "./GallerySwitch";
import { useGallerySets } from "../../hooks/useGallerySets";
import { originOf } from "./origin";
import "./styles.css";

const { gallery } = PROPERTY;

/**
 * Slots on the ring. Must match --slots in styles.css: the angular pitch there
 * is 360 / slots, and each slot's fade is delayed by i / slots of the cycle.
 *
 * Eighteen is fixed however many photographs the chosen set holds: the pitch has
 * to be 20deg for the wall to read as continuous and the ring has to close, so
 * the wall is always eighteen cards. The set is repeated round it by `i % count`,
 * which spaces each image's copies as far apart as the count allows — any other
 * mapping puts two copies of one picture side by side.
 *
 * How often a repeat is visible therefore depends on the set. Seven images puts
 * copies almost a full turn apart, so one is rarely in frame with another; four
 * puts them every 80deg, so two are usually on screen at the outermost, most
 * foreshortened positions, both cut by the edge of the stage.
 *
 * The repeats cost nothing to load: every slot for an image resolves to the same
 * URL, so the browser fetches each file once however many slots it fills.
 */
const SLOTS = 18;

/** The concave gallery wall: a cylinder seen from the inside. */
export function GalleryV1() {
  const stageRef = useRef<HTMLDivElement>(null);

  /** Which item the viewer is on and the card it grew out of, or null. */
  const [viewer, setViewer] = useState<{
    index: number;
    origin: OpenOrigin;
  } | null>(null);
  const [inView, setInView] = useState(false);

  const { sets, activeId, select, items } = useGallerySets();

  const count = items.length;

  const slots = useMemo(
    () =>
      Array.from({ length: SLOTS }, (_, i) => ({ item: items[i % count], i })),
    [items, count],
  );

  // The ring is a 34-second animation on a page several screens tall, so it is
  // parked whenever the section is off screen. A paused CSS animation holds its
  // composited state and costs nothing per frame — cheaper than trusting the
  // browser to throttle eighteen animated layers it can no longer see.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        // Started a little before the section arrives, so it is already turning by
        // the time any of it is on screen.
        rootMargin: "15% 0px",
      },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="gallery"
      className="g-section full-bleed"
      aria-label="Gallery"
      // Hover and keyboard focus pause the ring from CSS; these are the two
      // states CSS cannot see.
      data-paused={!inView || viewer !== null ? "true" : "false"}
    >
      <div className="g-head">
        <p className="g-eyebrow">{gallery.caption}</p>
        <h2 className="g-title">{gallery.heading}</h2>
        <GallerySwitch
          sets={sets}
          activeId={activeId}
          onSelect={select}
          className="g-switch"
        />
      </div>

      <div className="g-stage" ref={stageRef}>
        {/* Keyed on the set so switching restarts the ring from its first frame
            rather than swapping the photographs under a wall that is mid-turn,
            which read as a glitch. */}
        <ul className="g-ring" key={activeId}>
          {slots.map(({ item, i }) => {
            // Slots past the first pass are the repeated copies: the same
            // photograph already announced once, so they are taken out of the
            // accessibility tree and the tab order rather than repeated.
            const isRepeat = i >= count;

            return (
              <li
                key={i}
                className="g-slot"
                style={{ "--i": i } as React.CSSProperties}
                aria-hidden={isRepeat || undefined}
              >
                <button
                  type="button"
                  className="g-card"
                  onClick={(event) =>
                    setViewer({ index: i % count, origin: originOf(event) })
                  }
                  aria-label={`Open ${item.title}`}
                  tabIndex={isRepeat ? -1 : undefined}
                >
                  <CardFace item={item} decorative={isRepeat} />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="g-edge" aria-hidden="true" />
      </div>

      {/* Mounts nothing until opened, and pauses the ring while it is up. */}
      <MediaLightbox
        items={items}
        index={viewer?.index ?? null}
        origin={viewer?.origin ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) =>
          setViewer((open) => (open ? { ...open, index } : null))
        }
      />
    </section>
  );
}
