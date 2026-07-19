import type { Settings } from './types'

export interface Loadout {
  /** Plates on ONE side of the bar, heaviest first. */
  perSide: number[]
  /** Weight actually achievable with the available plates. */
  achieved: number
  /** True when the requested weight can't be built exactly. */
  approximate: boolean
}

/** Greedy per-side plate breakdown for a barbell weight. */
export function loadout(weight: number, settings: Settings): Loadout | null {
  if (weight < settings.barWeight) return null
  let perSideTarget = (weight - settings.barWeight) / 2
  const perSide: number[] = []
  for (const p of [...settings.plates].sort((a, b) => b - a)) {
    while (perSideTarget >= p - 1e-9) {
      perSide.push(p)
      perSideTarget -= p
    }
  }
  const achieved = settings.barWeight + 2 * perSide.reduce((s, p) => s + p, 0)
  return { perSide, achieved, approximate: Math.abs(achieved - weight) > 1e-9 }
}

export interface RampStep {
  weight: number
  reps: number
}

/**
 * Warm-up ramp toward a working weight: empty bar, then ~40/60/80%,
 * rounded to what the plate set can actually build. Steps that collapse
 * into each other or into the work weight are dropped.
 */
export function warmupRamp(work: number, settings: Settings): RampStep[] {
  const smallest = Math.min(...settings.plates)
  const roundTo = 2 * smallest
  const steps: RampStep[] = [{ weight: settings.barWeight, reps: 10 }]
  for (const [pct, reps] of [
    [0.4, 6],
    [0.6, 4],
    [0.8, 2],
  ] as const) {
    const w = Math.round((work * pct) / roundTo) * roundTo
    if (w <= steps[steps.length - 1].weight || w >= work) continue
    steps.push({ weight: w, reps })
  }
  return work > settings.barWeight ? steps : []
}
