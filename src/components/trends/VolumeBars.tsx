import { useStore } from '../../lib/store'
import { MUSCLES } from '../../lib/types'
import { MUSCLE_COLOR, MUSCLE_LABEL } from '../../lib/muscles'
import { VOLUME_BAND, programmedMuscles, weeklySets } from '../../lib/volume'
import { localDate } from '../../lib/format'

/**
 * Trailing-7-day hard sets per muscle against the productive 10–20 band.
 * A short bar IS the under-trained signal — no icons, no alarms.
 */
export function VolumeBars() {
  const sessions = useStore((s) => s.sessions)
  const logs = useStore((s) => s.logs)
  const settings = useStore((s) => s.settings)
  const doc = { schemaVersion: 1, sessions, logs, settings }
  const counts = weeklySets(doc, localDate())
  const trained = programmedMuscles(doc)
  const muscles = MUSCLES.filter((m) => trained.has(m))
  const scale = Math.max(VOLUME_BAND.max + 4, ...muscles.map((m) => counts[m]))

  if (muscles.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {muscles.map((m) => {
        const color = MUSCLE_COLOR[m]
        const n = counts[m]
        return (
          <div key={m}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="flex items-center gap-1.5 text-2xs text-ink-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {MUSCLE_LABEL[m]}
              </span>
              <span className={`num text-2xs ${n < VOLUME_BAND.min ? 'text-ink-3' : 'text-ink-2'}`}>
                {n}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-glass">
              <span
                className="absolute inset-y-0 bg-glass-2"
                style={{
                  left: `${(VOLUME_BAND.min / scale) * 100}%`,
                  width: `${((VOLUME_BAND.max - VOLUME_BAND.min) / scale) * 100}%`,
                }}
              />
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${(Math.min(n, scale) / scale) * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
      <p className="mt-1 text-2xs text-ink-3">Sets this week · the lighter zone is the 10–20 productive band.</p>
    </div>
  )
}
