import type { Doc, Muscle } from './types'
import { MUSCLES } from './types'

/** Productive weekly hypertrophy band (hard sets per muscle per week). */
export const VOLUME_BAND = { min: 10, max: 20 }

/** Hard sets per muscle logged in the trailing 7 days (today inclusive). */
export function weeklySets(doc: Doc, today: string): Record<Muscle, number> {
  const counts = Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>
  const cutoff = shiftDate(today, -6)
  for (const session of doc.sessions) {
    for (const ex of session.exercises) {
      for (const entry of doc.logs[ex.id] ?? []) {
        if (entry.date >= cutoff && entry.date <= today) {
          counts[ex.muscle] += entry.sets.length
        }
      }
    }
  }
  return counts
}

/** Muscles the current program trains at all (so empty bars aren't noise). */
export function programmedMuscles(doc: Doc): Set<Muscle> {
  const set = new Set<Muscle>()
  for (const s of doc.sessions) for (const ex of s.exercises) set.add(ex.muscle)
  return set
}

export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}
