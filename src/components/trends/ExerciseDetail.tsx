import { Suspense, lazy } from 'react'
import { X } from 'lucide-react'
import type { Exercise } from '../../lib/types'
import { useStore } from '../../lib/store'
import { MUSCLE_COLOR, MUSCLE_LABEL } from '../../lib/muscles'
import { bestE1rm, sortedEntries, tonnage } from '../../lib/progression'
import { trendFor } from '../../lib/trends'
import { fmtAgo, fmtWeight, localDate } from '../../lib/format'
import { Sheet } from '../Sheet'

const E1RMChart = lazy(() => import('./E1RMChart').then((m) => ({ default: m.E1RMChart })))

/** Per-exercise progress: e1RM over time + the raw history under it. */
export function ExerciseDetail({ exercise: ex, onClose }: { exercise: Exercise; onClose: () => void }) {
  const entries = useStore((s) => s.logs[ex.id]) ?? []
  const color = MUSCLE_COLOR[ex.muscle]
  const sorted = sortedEntries(entries)
  const latest = sorted[sorted.length - 1]
  const trend = trendFor(entries)
  const today = localDate()

  return (
    <Sheet onClose={onClose} size="tall">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{ex.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-3">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {MUSCLE_LABEL[ex.muscle]}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-chip p-2 text-ink-2 active:bg-glass">
          <X size={20} />
        </button>
      </div>

      {latest && bestE1rm(latest) > 0 && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="num text-2xl font-bold">{fmtWeight(Math.round(bestE1rm(latest) * 10) / 10)}</span>
          <span className="text-sm text-ink-2">kg e1RM</span>
          {trend !== null && Math.abs(trend) >= 0.5 && (
            <span className={`num text-xs font-semibold ${trend > 0 ? 'text-ember' : 'text-ink-3'}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={<div className="h-44 rounded-card bg-glass" />}>
          <E1RMChart entries={entries} color={color} />
        </Suspense>
      </div>

      {sorted.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-2xs uppercase tracking-wide text-ink-3">History</p>
          {[...sorted].reverse().slice(0, 20).map((e) => (
            <div key={e.date} className="flex items-center justify-between border-b-[0.5px] border-line py-2.5 last:border-0">
              <div>
                <p className="text-xs text-ink-2">
                  {fmtAgo(e.date, today)}
                  {e.variant && <span className="text-ink-3"> · {e.variant}</span>}
                </p>
                <p className="num mt-0.5 text-xs text-ink">
                  {e.sets.map((s) => `${fmtWeight(s.weight)}×${s.reps}`).join(' · ')}
                </p>
              </div>
              <span className="num text-2xs text-ink-3">{Math.round(tonnage(e)).toLocaleString()} kg</span>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  )
}
