import type { Muscle } from '../../lib/types'
import { MUSCLES } from '../../lib/types'
import { MUSCLE_COLOR, MUSCLE_LABEL } from '../../lib/muscles'

interface Props {
  value: Muscle | null
  /** The muscle guessed from the typed name — ringed until confirmed. */
  suggested?: Muscle | null
  onChange: (m: Muscle) => void
}

export function MusclePicker({ value, suggested, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MUSCLES.map((m) => {
        const color = MUSCLE_COLOR[m]
        const selected = value === m
        const isSuggested = !selected && suggested === m
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-2xs font-medium transition-colors"
            style={{
              backgroundColor: selected
                ? `color-mix(in srgb, ${color} 18%, transparent)`
                : 'var(--color-glass)',
              color: selected ? color : 'var(--color-ink-2)',
              boxShadow: isSuggested ? `inset 0 0 0 1px ${color}` : undefined,
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {MUSCLE_LABEL[m]}
          </button>
        )
      })}
    </div>
  )
}
