import type { Exercise, LogEntry, LoggedSet, Settings } from './types'

/** Epley estimated 1RM. */
export function e1rm(set: LoggedSet): number {
  if (set.reps <= 1) return set.weight
  return set.weight * (1 + set.reps / 30)
}

export function bestE1rm(entry: LogEntry): number {
  return Math.max(0, ...entry.sets.map(e1rm))
}

export function tonnage(entry: LogEntry): number {
  return entry.sets.reduce((s, x) => s + x.weight * x.reps, 0)
}

export function jumpFor(ex: Exercise, settings: Settings): number {
  return ex.jump ?? settings.defaultJump
}

/** Entries sorted oldest → newest. */
export function sortedEntries(entries: LogEntry[] | undefined): LogEntry[] {
  return [...(entries ?? [])].sort((a, b) => a.date.localeCompare(b.date))
}

export function lastEntry(
  entries: LogEntry[] | undefined,
  before?: string,
): LogEntry | undefined {
  const sorted = sortedEntries(entries)
  const eligible = before ? sorted.filter((e) => e.date < before) : sorted
  return eligible[eligible.length - 1]
}

export interface JumpCue {
  /** New working weight the lifter has earned. */
  weight: number
  /** Weight the top of the range was cleared at. */
  from: number
}

/**
 * Progressive overload cue: the last completed session for this exercise
 * hit the TOP of the rep range on every planned set — time to add the
 * smallest load.
 */
export function readyToJump(
  ex: Exercise,
  entries: LogEntry[] | undefined,
  settings: Settings,
  today: string,
): JumpCue | null {
  const last = lastEntry(entries, today)
  if (!last || last.sets.length < ex.sets || last.sets.length === 0) return null
  if (!last.sets.every((s) => s.reps >= ex.repRange.max)) return null
  const from = Math.max(...last.sets.map((s) => s.weight))
  return { weight: from + jumpFor(ex, settings), from }
}
