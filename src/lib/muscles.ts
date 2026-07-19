import type { Equip, Muscle } from './types'

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  triceps: 'Triceps',
  biceps: 'Biceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
}

/** CSS color token per muscle — upper body cool steel, lower body warm ember. */
export const MUSCLE_COLOR: Record<Muscle, string> = {
  chest: 'var(--color-m-chest)',
  back: 'var(--color-m-back)',
  shoulders: 'var(--color-m-shoulders)',
  triceps: 'var(--color-m-triceps)',
  biceps: 'var(--color-m-biceps)',
  quads: 'var(--color-m-quads)',
  hamstrings: 'var(--color-m-hamstrings)',
  glutes: 'var(--color-m-glutes)',
  calves: 'var(--color-m-calves)',
}

export const UPPER: Muscle[] = ['chest', 'back', 'shoulders', 'triceps', 'biceps']
export const LOWER: Muscle[] = ['quads', 'hamstrings', 'glutes', 'calves']

/**
 * Ordered rules: first match wins, so specific compounds
 * ("leg curl", "calf raise") are listed before generic words ("curl", "raise").
 */
const MUSCLE_RULES: Array<[RegExp, Muscle]> = [
  [/calf|calves/, 'calves'],
  [/leg curl|ham curl|seated curl|lying curl|nordic|ghr|glute.?ham/, 'hamstrings'],
  [/rdl|romanian|good ?morning|hip hinge|hamstring/, 'hamstrings'],
  [/hip thrust|glute|kick.?back|bridge|abduct/, 'glutes'],
  [/leg ext|sissy|squat|leg press|lunge|hack|quad|step.?up/, 'quads'],
  [/leg day|deadlift/, 'back'],
  [/lat|pull.?down|pull.?up|chin|row|shrug|back ext|hyper/, 'back'],
  [/face ?pull|lateral|delt|ohp|overhead|military|shoulder|arnold|upright/, 'shoulders'],
  [/skull|push.?down|tricep|jm press|french|overhead ext|dip/, 'triceps'],
  [/curl|bicep|preacher|hammer/, 'biceps'],
  [/bench|chest|fly|flye|pec|crossover|press/, 'chest'],
]

const EQUIP_RULES: Array<[RegExp, Equip]> = [
  [/\bdb\b|dumbbell/, 'dumbbell'],
  [/\bbb\b|barbell|deadlift|rdl|back squat|front squat|bench|ohp|overhead press|hip thrust|good ?morning|romanian/, 'barbell'],
  [/machine|cable|push.?down|pull.?down|smith|pec deck|leg press|leg ext|leg curl|crossover|face ?pull/, 'machine'],
  [/pull.?up|chin|dip|push.?up|nordic|bodyweight/, 'bodyweight'],
]

export function suggestMuscle(name: string): Muscle | null {
  const n = name.toLowerCase()
  for (const [re, muscle] of MUSCLE_RULES) if (re.test(n)) return muscle
  return null
}

export function suggestEquip(name: string): Equip {
  const n = name.toLowerCase()
  for (const [re, equip] of EQUIP_RULES) if (re.test(n)) return equip
  return 'machine'
}
