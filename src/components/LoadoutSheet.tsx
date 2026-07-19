import type { Exercise } from '../lib/types'
import { useStore } from '../lib/store'
import { loadout, warmupRamp } from '../lib/plates'
import { fmtWeight } from '../lib/format'
import { Sheet } from './Sheet'

/**
 * Physical plate colors (kg convention), muted for the graphite room.
 * These depict equipment — they are not data-encoding colors.
 */
const PLATE_STYLE: Record<string, { color: string; h: number; w: number }> = {
  '25': { color: '#C0453E', h: 106, w: 21 },
  '20': { color: '#3D5FB8', h: 100, w: 18 },
  '15': { color: '#C9A83D', h: 90, w: 15 },
  '10': { color: '#4C9464', h: 76, w: 13 },
  '5': { color: '#D8DCE2', h: 60, w: 10 },
  '2.5': { color: '#8F3B36', h: 48, w: 8 },
  '1.25': { color: '#9AA1AA', h: 38, w: 7 },
  '0.5': { color: '#9AA1AA', h: 30, w: 6 },
}

function Bar({ perSide }: { perSide: number[] }) {
  return (
    <div className="flex h-30 items-center justify-center">
      <span className="h-2 w-16 rounded-l-full bg-[#3A3E46]" />
      <div className="flex items-center gap-[2px]">
        {perSide.map((p, i) => {
          const s = PLATE_STYLE[fmtWeight(p)] ?? PLATE_STYLE['1.25']
          return (
            <span
              key={i}
              className="rounded-[4px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
              style={{ backgroundColor: s.color, height: s.h, width: s.w }}
            />
          )
        })}
      </div>
      <span className="h-2 w-8 rounded-r-full bg-[#3A3E46]" />
      <span className="-ml-1.5 h-5 w-[6px] rounded-sm bg-[#4A4F58]" />
    </div>
  )
}

function perSideLabel(perSide: number[]): string {
  const counts = new Map<number, number>()
  for (const p of perSide) counts.set(p, (counts.get(p) ?? 0) + 1)
  return [...counts.entries()].map(([p, n]) => `${fmtWeight(p)} × ${n}`).join(' · ')
}

interface Props {
  weight: number
  exercise: Exercise
  onClose: () => void
}

/** The signature: a weight becomes the actual iron on the bar. */
export function LoadoutSheet({ weight, exercise, onClose }: Props) {
  const settings = useStore((s) => s.settings)
  const lo = loadout(weight, settings)
  const ramp = warmupRamp(weight, settings)

  return (
    <Sheet onClose={onClose}>
      <p className="text-xs text-ink-2">{exercise.name}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="num text-2xl font-bold">{fmtWeight(lo ? lo.achieved : weight)}</span>
        <span className="text-sm text-ink-2">kg</span>
        {lo?.approximate && (
          <span className="text-2xs text-ink-3">closest to {fmtWeight(weight)} with your plates</span>
        )}
      </div>

      {lo ? (
        <>
          <Bar perSide={lo.perSide} />
          <p className="num text-center text-xs text-ink-2">
            {lo.perSide.length > 0 ? (
              <>
                <span className="text-ink-3">per side&ensp;</span>
                {perSideLabel(lo.perSide)}
              </>
            ) : (
              'empty bar'
            )}
          </p>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-ink-3">Below bar weight ({fmtWeight(settings.barWeight)} kg).</p>
      )}

      {ramp.length > 0 && (
        <div className="mt-6 border-t-[0.5px] border-line pt-4">
          <p className="mb-2 text-2xs uppercase tracking-wide text-ink-3">Warm-up</p>
          {ramp.map((s, i) => {
            const stepLo = loadout(s.weight, settings)
            return (
              <div key={i} className="flex h-9 items-center justify-between">
                <span className="num text-sm text-ink">
                  {i === 0 ? 'Bar' : fmtWeight(s.weight)}
                  <span className="text-ink-3"> × {s.reps}</span>
                </span>
                <span className="num text-2xs text-ink-3">
                  {stepLo && stepLo.perSide.length > 0 ? perSideLabel(stepLo.perSide) : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Sheet>
  )
}
