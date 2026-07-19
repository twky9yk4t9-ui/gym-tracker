import type { Doc, LogEntry } from './types'
import { bestE1rm, sortedEntries, tonnage } from './progression'
import { shiftDate } from './volume'

export interface WeekPoint {
  /** Monday of the week, YYYY-MM-DD. */
  start: string
  label: string
  tonnage: number
}

function mondayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = (dt.getDay() + 6) % 7 // Mon=0
  return shiftDate(date, -dow)
}

/** Total tonnage per calendar week for the trailing `weeks` weeks. */
export function weeklyTonnage(doc: Doc, today: string, weeks = 12): WeekPoint[] {
  const thisMonday = mondayOf(today)
  const points: WeekPoint[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = shiftDate(thisMonday, -7 * i)
    const [, m, d] = start.split('-')
    points.push({ start, label: `${Number(d)}/${Number(m)}`, tonnage: 0 })
  }
  const first = points[0].start
  for (const entries of Object.values(doc.logs)) {
    for (const e of entries) {
      if (e.date < first || e.date > today) continue
      const monday = mondayOf(e.date)
      const p = points.find((x) => x.start === monday)
      if (p) p.tonnage += tonnage(e)
    }
  }
  return points
}

/**
 * Direction of an exercise's e1RM: latest vs ~4 weeks back.
 * Returns percent change, or null with < 2 entries.
 */
export function trendFor(entries: LogEntry[] | undefined): number | null {
  const sorted = sortedEntries(entries)
  if (sorted.length < 2) return null
  const latest = sorted[sorted.length - 1]
  const cutoff = shiftDate(latest.date, -28)
  const baseline =
    [...sorted].reverse().find((e) => e.date <= cutoff && bestE1rm(e) > 0) ?? sorted[0]
  const a = bestE1rm(baseline)
  const b = bestE1rm(latest)
  if (a <= 0) return null
  return ((b - a) / a) * 100
}
