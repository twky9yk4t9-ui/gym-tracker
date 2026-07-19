import { Suspense, lazy, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useStore } from '../../lib/store'
import { MUSCLE_COLOR } from '../../lib/muscles'
import { trendFor } from '../../lib/trends'
import { SettingsSheet } from '../SettingsSheet'
import { VolumeBars } from './VolumeBars'

// recharts is heavy — load it only when Trends is actually opened.
const TonnageTrend = lazy(() =>
  import('./TonnageTrend').then((m) => ({ default: m.TonnageTrend })),
)

export function TrendsScreen() {
  const sessions = useStore((s) => s.sessions)
  const logs = useStore((s) => s.logs)
  const openDetail = useStore((s) => s.openDetail)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const exercises = sessions.flatMap((s) => s.exercises)
  const anyLogs = exercises.some((ex) => (logs[ex.id] ?? []).length > 0)

  return (
    <div className="px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
      <header className="mb-5 flex items-start justify-between">
        <h1 className="text-xl font-bold tracking-tight">Trends</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="rounded-chip p-2.5 text-ink-2 active:bg-glass"
        >
          <Settings2 size={18} />
        </button>
      </header>

      {!anyLogs ? (
        <div className="glass rounded-card px-6 py-10 text-center">
          <p className="text-sm text-ink-2">Nothing to show yet.</p>
          <p className="mt-1 text-xs text-ink-3">
            Log your first session and this page starts tracking you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <section className="glass rounded-card p-4">
            <Suspense fallback={<div className="h-28" />}>
              <TonnageTrend />
            </Suspense>
          </section>

          <section className="glass rounded-card p-4">
            <VolumeBars />
          </section>

          <section className="glass rounded-card p-4">
            <p className="mb-1 text-2xs uppercase tracking-wide text-ink-3">Exercises</p>
            {exercises.map((ex) => {
              const trend = trendFor(logs[ex.id])
              const hasData = (logs[ex.id] ?? []).length > 0
              return (
                <button
                  key={ex.id}
                  onClick={() => openDetail(ex.id)}
                  className="flex w-full items-center gap-3 border-b-[0.5px] border-line py-3 text-left last:border-0"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: MUSCLE_COLOR[ex.muscle] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{ex.name}</span>
                  {trend !== null && Math.abs(trend) >= 0.5 ? (
                    <span
                      className={`num text-xs font-semibold ${trend > 0 ? 'text-ember' : 'text-ink-3'}`}
                    >
                      {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-2xs text-ink-3">{hasData ? '—' : ''}</span>
                  )}
                </button>
              )
            })}
          </section>
        </div>
      )}

      <AnimatePresence>
        {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
