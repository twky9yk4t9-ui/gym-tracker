import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LogEntry } from '../../lib/types'
import { bestE1rm, e1rm, sortedEntries } from '../../lib/progression'
import { fmtWeight } from '../../lib/format'

interface Point {
  date: string
  label: string
  value: number
  top: string
}

function points(entries: LogEntry[], repsMode: boolean): Point[] {
  return sortedEntries(entries)
    .filter((e) => e.sets.length > 0)
    .map((e) => {
      const best = [...e.sets].sort((a, b) => e1rm(b) - e1rm(a))[0]
      const [, m, d] = e.date.split('-')
      return {
        date: e.date,
        label: `${Number(d)}/${Number(m)}`,
        value: repsMode ? Math.max(...e.sets.map((s) => s.reps)) : Math.round(bestE1rm(e) * 10) / 10,
        top: `${fmtWeight(best.weight)} × ${best.reps}`,
      }
    })
}

const tick = { fontSize: 10, fill: 'rgba(255,255,255,0.46)' }

export function E1RMChart({ entries, color }: { entries: LogEntry[]; color: string }) {
  // Bodyweight work (weight 0) has no e1RM — chart best reps instead.
  const repsMode = entries.every((e) => e.sets.every((s) => s.weight === 0))
  const data = points(entries, repsMode)

  if (data.length < 2) {
    return (
      <div className="flex h-44 items-center justify-center rounded-card bg-glass">
        <p className="px-8 text-center text-xs text-ink-3">
          Two logged sessions draw the first line. Keep going.
        </p>
      </div>
    )
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v: number) => String(Math.round(v))}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as Point
              return (
                <div className="panel rounded-chip px-3 py-2">
                  <p className="text-2xs text-ink-3">{p.label}</p>
                  <p className="num text-xs font-semibold text-ink">
                    {repsMode ? `${p.value} reps` : `e1RM ${fmtWeight(p.value)} kg`}
                  </p>
                  <p className="num text-2xs text-ink-2">top set {p.top}</p>
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: '#0A0B0D', strokeWidth: 2, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
