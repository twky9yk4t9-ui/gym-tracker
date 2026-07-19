import type { Session } from './types'
import { newId } from './types'

/**
 * Nico's own Upper/Lower split (July 2026), pre-entered once on the very
 * first boot purely to save typing — it is ordinary session data afterwards:
 * fully editable, deletable, and never re-applied (see the `seeded` flag).
 * The app itself still prescribes nothing.
 */
type SeedExercise = [
  name: string,
  muscle: Session['exercises'][number]['muscle'],
  equip: Session['exercises'][number]['equip'],
  sets: number,
  min: number,
  max: number,
  rir: number,
  variants?: string[],
  note?: string,
]

const PLAN: Array<[string, SeedExercise[]]> = [
  [
    'Upper A',
    [
      ['Incline DB press', 'chest', 'dumbbell', 3, 5, 8, 2, [], 'focus — chase load'],
      ['Weighted pull-up', 'back', 'bodyweight', 3, 5, 8, 2, [], 'weight = added load'],
      ['Seated DB shoulder press', 'shoulders', 'dumbbell', 3, 6, 10, 2],
      ['Chest-supported row', 'back', 'machine', 2, 8, 10, 2],
      ['Flat DB press', 'chest', 'dumbbell', 2, 8, 12, 2],
      ['Lateral raise', 'shoulders', 'dumbbell', 3, 12, 20, 1],
      ['Overhead triceps extension', 'triceps', 'machine', 2, 8, 12, 2],
    ],
  ],
  [
    'Lower A',
    [
      ['Squat', 'quads', 'barbell', 3, 4, 6, 2, ['Back squat', 'Hack squat', 'Pendulum'], 'strength — add load aggressively'],
      ['Romanian deadlift', 'hamstrings', 'barbell', 3, 6, 10, 2],
      ['Leg extension', 'quads', 'machine', 2, 10, 15, 1],
      ['Seated leg curl', 'hamstrings', 'machine', 2, 8, 12, 1, [], 'long length'],
      ['Loaded back extension', 'back', 'machine', 3, 8, 12, 2, [], 'lower back'],
      ['Standing calf raise', 'calves', 'machine', 2, 8, 12, 1, [], 'gastroc'],
    ],
  ],
  [
    'Upper B',
    [
      ['Incline DB press (B)', 'chest', 'dumbbell', 2, 8, 12, 2, [], 'volume day'],
      ['Lat pulldown', 'back', 'machine', 3, 8, 12, 2],
      ['Fly', 'chest', 'machine', 2, 10, 15, 1, ['Pec-deck', 'Cable fly']],
      ['Single-arm DB row', 'back', 'dumbbell', 2, 10, 15, 1],
      ['Lateral raise (B)', 'shoulders', 'dumbbell', 3, 12, 20, 1],
      ['Reverse fly', 'shoulders', 'machine', 2, 12, 20, 1, [], 'rear delt'],
      ['Incline DB curl', 'biceps', 'dumbbell', 2, 10, 15, 1],
    ],
  ],
  [
    'Lower B',
    [
      ['Leg press', 'quads', 'machine', 3, 8, 12, 2],
      ['Bulgarian split squat', 'quads', 'dumbbell', 2, 8, 12, 1],
      ['Seated leg curl (B)', 'hamstrings', 'machine', 2, 10, 15, 1, [], 'long length'],
      ['Hip adduction', 'glutes', 'machine', 2, 12, 20, 1, [], 'adductors'],
      ['Loaded back extension (B)', 'back', 'machine', 2, 10, 15, 2, [], 'lower back'],
      ['Seated calf raise', 'calves', 'machine', 2, 12, 20, 1, [], 'soleus'],
      ['Cable crunch', 'core', 'machine', 2, 10, 15, 1],
    ],
  ],
]

export function buildSeed(): Session[] {
  return PLAN.map(([name, exercises]) => ({
    id: newId(),
    name,
    exercises: exercises.map(([exName, muscle, equip, sets, min, max, rir, variants, note]) => ({
      id: newId(),
      name: exName,
      muscle,
      sets,
      repRange: { min, max },
      rir,
      variants: variants ?? [],
      activeVariant: 0,
      equip,
      ...(note ? { note } : {}),
    })),
  }))
}
