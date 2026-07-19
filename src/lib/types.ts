export const MUSCLES = [
  'chest',
  'back',
  'shoulders',
  'triceps',
  'biceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
] as const

export type Muscle = (typeof MUSCLES)[number]

export type Equip = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight'

export interface RepRange {
  min: number
  max: number
}

export interface Exercise {
  id: string
  name: string
  muscle: Muscle
  sets: number
  repRange: RepRange
  rir?: number
  variants: string[]
  activeVariant: number
  equip: Equip
  /** Per-exercise override of the smallest load jump (kg). */
  jump?: number
  note?: string
}

export interface Session {
  id: string
  name: string
  exercises: Exercise[]
}

export interface LoggedSet {
  weight: number
  reps: number
}

export interface LogEntry {
  date: string // YYYY-MM-DD, local
  variant?: string
  sets: LoggedSet[]
}

export type Logs = Record<string, LogEntry[]>

export interface Settings {
  unit: 'kg'
  barWeight: number
  /** Available per-side plate denominations, kg. */
  plates: number[]
  defaultJump: number
  restSeconds: number
}

export interface Doc {
  schemaVersion: number
  sessions: Session[]
  logs: Logs
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  barWeight: 20,
  plates: [25, 20, 15, 10, 5, 2.5, 1.25],
  defaultJump: 2.5,
  restSeconds: 120,
}

export const SCHEMA_VERSION = 1

export function newId(): string {
  return crypto.randomUUID()
}
