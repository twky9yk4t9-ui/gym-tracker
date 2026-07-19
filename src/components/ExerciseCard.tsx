import { Check, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Exercise, LogEntry, LoggedSet } from '../lib/types'
import { useStore } from '../lib/store'
import { MUSCLE_COLOR } from '../lib/muscles'
import { lastEntry, readyToJump } from '../lib/progression'
import { fmtWeight, localDate } from '../lib/format'
import { SetRow } from './SetRow'
import type { KeypadTarget } from './Keypad'

interface Props {
  exercise: Exercise
  onOpenKeypad: (target: KeypadTarget) => void
}

export function ExerciseCard({ exercise: ex, onOpenKeypad }: Props) {
  const entries = useStore((s) => s.logs[ex.id])
  const settings = useStore((s) => s.settings)
  const overrides = useStore((s) => s.overrides)
  const logSet = useStore((s) => s.logSet)
  const applyOverride = useStore((s) => s.applyOverride)
  const setActiveVariant = useStore((s) => s.setActiveVariant)
  const openDetail = useStore((s) => s.openDetail)
  const sessionId = useStore((s) => s.activeTab)
  const reduced = useReducedMotion()

  const today = localDate()
  const color = MUSCLE_COLOR[ex.muscle]
  const todayEntry: LogEntry | undefined = entries?.find((e) => e.date === today)
  const logged = todayEntry?.sets ?? []
  const last = lastEntry(entries, today)
  const override = overrides[ex.id]?.date === today ? overrides[ex.id].weight : null
  const cue = readyToJump(ex, entries, settings, today)
  const showCue = cue !== null && override === null && logged.length === 0

  /**
   * Ghost prefill for pending set i: once today's logging has started,
   * repeat today's last set (straight sets, zero typing); before that,
   * last session's same set, else its final set.
   */
  const ghost = (i: number): LoggedSet | null => {
    if (override !== null && logged.length === 0) {
      // After an earned jump, aim for the bottom of the rep range again.
      return { weight: override, reps: ex.repRange.min }
    }
    if (logged.length > 0) return logged[logged.length - 1]
    return last?.sets[i] ?? last?.sets[last.sets.length - 1] ?? null
  }

  const totalRows = Math.max(ex.sets, logged.length)
  const done = logged.length >= ex.sets && logged.length > 0

  const targetLabel =
    `${ex.sets} × ${ex.repRange.min}–${ex.repRange.max}` +
    (ex.rir !== undefined ? ` · RIR ${ex.rir}` : '')

  return (
    <div className="panel relative overflow-hidden rounded-card p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => openDetail(ex.id)}
          aria-label={`${ex.name} progress`}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          {done ? (
            <Check size={13} strokeWidth={3.5} className="shrink-0" style={{ color }} aria-hidden />
          ) : (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          )}
          <span className="truncate text-base font-semibold">{ex.name}</span>
        </button>
        <span className="num shrink-0 text-2xs text-ink-3">{targetLabel}</span>
      </div>

      {ex.note && <p className="mt-0.5 text-2xs text-ink-3">{ex.note}</p>}

      {ex.variants.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {ex.variants.map((v, i) => {
            const active = i === ex.activeVariant
            return (
              <button
                key={v + i}
                onClick={() => setActiveVariant(sessionId, ex.id, i)}
                aria-pressed={active}
                className={`rounded-full px-2.5 py-1.5 text-2xs font-medium transition-colors ${
                  active ? 'bg-glass-2 text-ink' : 'bg-glass text-ink-3'
                }`}
                style={active ? { boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 55%, transparent)` } : undefined}
              >
                {v}
              </button>
            )
          })}
        </div>
      )}

      {showCue && (
        <motion.button
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.4, delay: 0.2 }}
          onClick={() => applyOverride(ex.id, cue.weight)}
          className="ember-glow mt-3 flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1.5"
        >
          <span className="text-2xs font-semibold text-ember" aria-hidden>▲</span>
          <span className="num text-xs font-semibold text-ember">{fmtWeight(cue.weight)} kg</span>
          <span className="text-2xs text-ember">earned — tap to load</span>
        </motion.button>
      )}

      <div className="mt-2 divide-y divide-line">
        {Array.from({ length: totalRows }, (_, i) => {
          const state = i < logged.length ? 'logged' : i === logged.length ? 'next' : 'future'
          const set = state === 'logged' ? logged[i] : ghost(i)
          return (
            <SetRow
              key={i}
              index={i}
              state={state}
              set={set}
              color={color}
              onCheck={
                state === 'next' && set
                  ? () => logSet(ex, set)
                  : undefined
              }
              onTap={() =>
                onOpenKeypad(
                  state === 'logged'
                    ? { exercise: ex, mode: 'edit', initial: logged[i], date: today, index: i }
                    : { exercise: ex, mode: 'log', initial: set },
                )
              }
            />
          )
        })}
      </div>

      {done && (
        <button
          onClick={() => onOpenKeypad({ exercise: ex, mode: 'log', initial: ghost(logged.length) })}
          className="mt-1 flex h-8 items-center gap-1 text-2xs text-ink-3"
        >
          <Plus size={12} aria-hidden /> set
        </button>
      )}
    </div>
  )
}
