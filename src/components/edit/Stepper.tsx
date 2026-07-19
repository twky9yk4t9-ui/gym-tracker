import { Minus, Plus } from 'lucide-react'

interface Props {
  label: string
  display: string
  onDec: () => void
  onInc: () => void
}

/** Tiny labelled − value + control used across the exercise editor. */
export function Stepper({ label, display, onDec, onInc }: Props) {
  const btn =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-glass text-ink-2 active:bg-glass-2'
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xs uppercase tracking-wide text-ink-3">{label}</span>
      <div className="flex items-center gap-0.5">
        <button onClick={onDec} className={btn} aria-label={`Decrease ${label}`}>
          <Minus size={13} />
        </button>
        <span className="num w-8 text-center text-sm font-semibold">{display}</span>
        <button onClick={onInc} className={btn} aria-label={`Increase ${label}`}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}
