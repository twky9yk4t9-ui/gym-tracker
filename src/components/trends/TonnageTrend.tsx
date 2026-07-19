import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useStore } from '../../lib/store'
import { weeklyTonnage } from '../../lib/trends'
import { localDate } from '../../lib/format'

function fmtTonnage(kg: number): string {
  if (kg >= 10000) return `${(kg / 1000).toFixed(1)} t`
  return `${Math.round(kg).toLocaleString()} kg`
}

/** Twelve weeks of total work, one quiet line. */
export function TonnageTrend() {
  const sessions = useStore((s) => s.sessions)
  const logs = useStore((s) => s.logs)
  const settings = useStore((s) => s.settings)
  const data = weeklyTonnage({ schemaVersion: 1, sessions, logs, settings }, localDate())
  const thisWeek = data[data.length - 1]?.tonnage ?? 0
  const hasHistory = data.filter((d) => d.tonnage > 0).length >= 2

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="num text-xl font-bold">{fmtTonnage(thisWeek)}</span>
        <span className="text-2xs text-ink-3">lifted this week</span>
      </div>
      {hasHistory && (
        <div className="mt-2 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tonnage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.32)' }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as { label: string; tonnage: number }
                  return (
                    <div className="glass rounded-chip px-3 py-2">
                      <p className="text-2xs text-ink-3">wk of {p.label}</p>
                      <p className="num text-xs font-semibold text-ink">{fmtTonnage(p.tonnage)}</p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="tonnage"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={2}
                fill="url(#tonnage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
