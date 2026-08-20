import type { PlanDrawing } from '../lib/property'

/**
 * Schematic plans, drawn rather than imported.
 *
 * These are INDICATIVE LAYOUTS, not surveyed drawings of Reem Eleven — the real
 * ones do not exist yet. Every plan carries an on-drawing marker saying so, and
 * the section repeats it underneath, because a plan is the sort of thing a buyer
 * makes decisions from. Replace by setting `image` on the plan in property.ts;
 * a supplied drawing takes priority over anything here.
 *
 * Rooms tile a fixed rectangle, so each layout is a short list of boxes rather
 * than hand-drawn geometry — easy to check, and easy to edit when the real areas
 * come through.
 */
interface Room {
  x: number
  y: number
  w: number
  h: number
  label: string
  /** Outdoor space is drawn lighter, the way a plan distinguishes it. */
  outdoor?: boolean
}

/** All plans share this frame, so the four read as one set. */
const FRAME = { x: 30, y: 30, w: 660, h: 420 }

const ROOMS: Record<PlanDrawing, Room[]> = {
  studio: [
    { x: 30, y: 30, w: 170, h: 160, label: 'Bath' },
    { x: 30, y: 190, w: 170, h: 260, label: 'Kitchen' },
    { x: 200, y: 30, w: 360, h: 420, label: 'Living / Sleeping' },
    { x: 560, y: 30, w: 130, h: 420, label: 'Balcony', outdoor: true },
  ],
  'one-bed': [
    { x: 30, y: 30, w: 170, h: 150, label: 'Kitchen' },
    { x: 30, y: 180, w: 170, h: 120, label: 'Bath' },
    { x: 30, y: 300, w: 170, h: 150, label: 'Entry' },
    { x: 200, y: 30, w: 200, h: 420, label: 'Living' },
    { x: 400, y: 30, w: 160, h: 420, label: 'Bedroom' },
    { x: 560, y: 30, w: 130, h: 420, label: 'Balcony', outdoor: true },
  ],
  'two-bed': [
    { x: 30, y: 30, w: 150, h: 140, label: 'Kitchen' },
    { x: 30, y: 170, w: 150, h: 130, label: 'Bath' },
    { x: 30, y: 300, w: 150, h: 150, label: 'Bath' },
    { x: 180, y: 30, w: 200, h: 420, label: 'Living' },
    { x: 380, y: 30, w: 180, h: 210, label: 'Bedroom 1' },
    { x: 380, y: 240, w: 180, h: 210, label: 'Bedroom 2' },
    { x: 560, y: 30, w: 130, h: 420, label: 'Balcony', outdoor: true },
  ],
  'three-bed': [
    { x: 30, y: 30, w: 150, h: 140, label: 'Kitchen' },
    { x: 30, y: 170, w: 150, h: 140, label: 'Bath' },
    { x: 30, y: 310, w: 150, h: 140, label: 'Bath' },
    { x: 180, y: 30, w: 180, h: 420, label: 'Living' },
    { x: 360, y: 30, w: 200, h: 140, label: 'Bedroom 1' },
    { x: 360, y: 170, w: 200, h: 140, label: 'Bedroom 2' },
    { x: 360, y: 310, w: 200, h: 140, label: 'Bedroom 3' },
    { x: 560, y: 30, w: 130, h: 420, label: 'Balcony', outdoor: true },
  ],
}

export function FloorPlanDrawing({
  drawing,
  className,
}: {
  drawing: PlanDrawing
  className?: string
}) {
  const rooms = ROOMS[drawing]

  return (
    <svg
      viewBox="0 0 720 480"
      className={className}
      role="img"
      aria-label={`Indicative ${drawing.replace('-', ' ')} layout: ${rooms
        .map((room) => room.label)
        .join(', ')}`}
    >
      {rooms.map((room) => (
        <g key={`${room.label}-${room.x}-${room.y}`}>
          <rect
            x={room.x}
            y={room.y}
            width={room.w}
            height={room.h}
            fill="currentColor"
            fillOpacity={room.outdoor ? 0.02 : 0.05}
            stroke="currentColor"
            strokeOpacity={room.outdoor ? 0.25 : 0.45}
            strokeWidth={1.5}
            strokeDasharray={room.outdoor ? '5 5' : undefined}
          />
          <text
            x={room.x + room.w / 2}
            y={room.y + room.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fillOpacity={0.75}
            fontSize={15}
            letterSpacing={2.2}
            style={{ textTransform: 'uppercase' }}
          >
            {room.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Outer wall last, so it sits over the room edges as one clean boundary. */}
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.85}
        strokeWidth={4}
      />

      {/* On-drawing marker, so the plan cannot be lifted out of the page and
          mistaken for a surveyed one. */}
      <text
        x={FRAME.x}
        y={FRAME.y + FRAME.h + 26}
        fill="currentColor"
        fillOpacity={0.45}
        fontSize={12}
        letterSpacing={2.5}
      >
        INDICATIVE LAYOUT — NOT TO SCALE
      </text>
    </svg>
  )
}
