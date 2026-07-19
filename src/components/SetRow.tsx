import { Check } from 'lucide-react'
import type { LoggedSet } from '../lib/types'
import { fmtWeight } from '../lib/format'

interface Props {
  index: number
  state: 'logged' | 'next' | 'future'
  set: LoggedSet | null // logged values, or the ghost prefill
  color: string
  onCheck?: () => void
  onTap: () => void
}

/** One set line: number · weight × reps · check. Ghosted until logged. */
export function SetRow({ index, state, set, color, onCheck, onTap }: Props) {
  const logged = state === 'logged'
  const dim = logged ? 'text-ink' : 'text-ink-3'

  return (
    <div className="flex h-13 items-center gap-3">
      <span className="num w-5 text-xs text-ink-3">{index + 1}</span>
      <button onClick={onTap} className="flex min-w-0 flex-1 items-baseline gap-1.5 py-2 text-left">
        {set ? (
          <>
            <span className={`num text-base font-semibold ${dim}`}>{fmtWeight(set.weight)}</span>
            <span className="text-xs text-ink-3">kg</span>
            <span className="mx-0.5 text-xs text-ink-3">×</span>
            <span className={`num text-base font-semibold ${dim}`}>{set.reps}</span>
          </>
        ) : (
          <span className="text-sm text-ink-3">tap to enter</span>
        )}
      </button>
      {state !== 'future' && (
        <button
          onClick={logged ? onTap : (onCheck ?? onTap)}
          aria-label={logged ? `Edit set ${index + 1}` : `Log set ${index + 1}`}
          className="group flex h-11 w-11 items-center justify-center"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-150 ease-out motion-safe:group-active:scale-75"
            style={
              logged
                ? { backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`, borderColor: 'transparent' }
                : { borderColor: 'var(--color-line)' }
            }
          >
            {logged && <Check size={15} style={{ color }} strokeWidth={3} />}
          </span>
        </button>
      )}
    </div>
  )
}
