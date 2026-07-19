import type { Equip, Exercise, Muscle } from '../../lib/types'
import { fmtWeight } from '../../lib/format'
import { MusclePicker } from './MusclePicker'
import { Stepper } from './Stepper'
import { VariantChips } from './VariantChips'

const EQUIP: Array<{ id: Equip; label: string }> = [
  { id: 'barbell', label: 'BB' },
  { id: 'dumbbell', label: 'DB' },
  { id: 'machine', label: 'Machine' },
  { id: 'bodyweight', label: 'Body' },
]

/** Jump presets cycled by the stepper; undefined = app default. */
const JUMPS = [0.5, 1, 1.25, 2, 2.5, 5]

export type ExercisePatch = Partial<Omit<Exercise, 'id'>>

interface Props {
  value: Omit<Exercise, 'id'>
  muscle: Muscle | null // null only while drafting
  suggested: Muscle | null
  defaultJump: number
  onPatch: (patch: ExercisePatch) => void
  onPickMuscle: (m: Muscle) => void
}

/** Everything an exercise is, editable inline: muscle, prescription, variants, note. */
export function ExerciseForm({ value, muscle, suggested, defaultJump, onPatch, onPickMuscle }: Props) {
  const stepJump = (dir: 1 | -1) => {
    const cur = value.jump ?? defaultJump
    let idx = JUMPS.findIndex((j) => j >= cur - 1e-9)
    if (idx === -1) idx = JUMPS.length - 1
    onPatch({ jump: JUMPS[Math.min(JUMPS.length - 1, Math.max(0, idx + dir))] })
  }

  return (
    <div className="flex flex-col gap-3.5">
      <MusclePicker value={muscle} suggested={suggested} onChange={onPickMuscle} />

      <div className="flex items-start justify-between">
        <Stepper
          label="Sets"
          display={String(value.sets)}
          onDec={() => onPatch({ sets: Math.max(1, value.sets - 1) })}
          onInc={() => onPatch({ sets: Math.min(10, value.sets + 1) })}
        />
        <Stepper
          label="Reps from"
          display={String(value.repRange.min)}
          onDec={() => onPatch({ repRange: { ...value.repRange, min: Math.max(1, value.repRange.min - 1) } })}
          onInc={() =>
            onPatch({
              repRange: { ...value.repRange, min: Math.min(value.repRange.max, value.repRange.min + 1) },
            })
          }
        />
        <Stepper
          label="to"
          display={String(value.repRange.max)}
          onDec={() =>
            onPatch({
              repRange: { ...value.repRange, max: Math.max(value.repRange.min, value.repRange.max - 1) },
            })
          }
          onInc={() => onPatch({ repRange: { ...value.repRange, max: Math.min(50, value.repRange.max + 1) } })}
        />
      </div>

      <div className="flex items-start justify-between">
        <Stepper
          label="RIR"
          display={value.rir === undefined ? '–' : String(value.rir)}
          onDec={() => onPatch({ rir: value.rir === undefined || value.rir === 0 ? undefined : value.rir - 1 })}
          onInc={() => onPatch({ rir: value.rir === undefined ? 0 : Math.min(4, value.rir + 1) })}
        />
        <Stepper
          label="Jump kg"
          display={value.jump !== undefined ? fmtWeight(value.jump) : fmtWeight(defaultJump)}
          onDec={() => stepJump(-1)}
          onInc={() => stepJump(1)}
        />
      </div>

      <div className="flex gap-1">
        {EQUIP.map((e) => (
          <button
            key={e.id}
            onClick={() => onPatch({ equip: e.id })}
            className={`rounded-full px-2.5 py-1.5 text-2xs font-medium transition-colors ${
              value.equip === e.id ? 'bg-glass-2 text-ink' : 'bg-glass text-ink-3'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <VariantChips variants={value.variants} onChange={(variants) => {
        onPatch({ variants, activeVariant: Math.min(value.activeVariant, Math.max(0, variants.length - 1)) })
      }} />

      <input
        value={value.note ?? ''}
        onChange={(e) => onPatch({ note: e.target.value || undefined })}
        placeholder="Note — seat height, grip…"
        enterKeyHint="done"
        className="w-full border-b-[0.5px] border-line bg-transparent pb-1.5 text-[16px] text-ink-2 outline-none placeholder:text-ink-3"
      />
    </div>
  )
}
