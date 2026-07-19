import { useState } from 'react'
import { Delete, Minus, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Exercise, LoggedSet } from '../lib/types'
import { useStore } from '../lib/store'
import { jumpFor } from '../lib/progression'
import { fmtWeight } from '../lib/format'
import { LoadoutSheet } from './LoadoutSheet'

/** Tiny end-on plate stack glyph for the loadout button. */
function PlatesGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="7.25" width="3.5" height="3.5" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="6" y="3" width="4" height="12" rx="1.5" fill="currentColor" />
      <rect x="12" y="5" width="3.5" height="8" rx="1.5" fill="currentColor" opacity="0.75" />
    </svg>
  )
}

export interface KeypadTarget {
  exercise: Exercise
  mode: 'log' | 'edit'
  initial: LoggedSet | null
  date?: string
  index?: number
}

interface Props {
  target: KeypadTarget
  onCommit: (set: LoggedSet) => void
  onRemove?: () => void
  onClose: () => void
}

type Field = 'weight' | 'reps'

export function Keypad({ target, onCommit, onRemove, onClose }: Props) {
  const settings = useStore((s) => s.settings)
  const reduced = useReducedMotion()
  const jump = jumpFor(target.exercise, settings)

  const [weight, setWeight] = useState(target.initial ? fmtWeight(target.initial.weight) : '')
  const [reps, setReps] = useState(target.initial ? String(target.initial.reps) : '')
  const [field, setField] = useState<Field>('weight')
  // Calculator-style: the first keystroke on a field replaces its value.
  const [armed, setArmed] = useState(true)
  const [showLoadout, setShowLoadout] = useState(false)

  const value = field === 'weight' ? weight : reps
  const setValue = field === 'weight' ? setWeight : setReps

  const press = (d: string) => {
    if (d === '.' && (field === 'reps' || value.includes('.'))) return
    const base = armed ? '' : value
    if (base.replace('.', '').length >= 5) return
    setValue(base === '' && d === '.' ? '0.' : base + d)
    setArmed(false)
  }

  const backspace = () => {
    setValue(armed ? '' : value.slice(0, -1))
    setArmed(false)
  }

  const step = (dir: 1 | -1) => {
    const inc = field === 'weight' ? jump : 1
    const cur = parseFloat(value) || 0
    const next = Math.max(0, Math.round((cur + dir * inc) * 100) / 100)
    setValue(field === 'weight' ? fmtWeight(next) : String(Math.round(next)))
    setArmed(false)
  }

  const parsedWeight = parseFloat(weight) || 0
  const parsedReps = Math.round(parseFloat(reps)) || 0
  const canCommit = parsedReps > 0

  const commit = () => {
    if (!canCommit) return
    onCommit({ weight: parsedWeight, reps: parsedReps })
    onClose()
  }

  const selectField = (f: Field) => {
    setField(f)
    setArmed(true)
  }

  const key =
    'flex h-14 items-center justify-center rounded-chip text-lg font-medium text-ink active:bg-glass-2 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <motion.div
        initial={reduced ? { opacity: 0 } : { y: '100%' }}
        animate={reduced ? { opacity: 1 } : { y: 0 }}
        exit={reduced ? { opacity: 0 } : { y: '100%' }}
        transition={{ type: 'spring', duration: 0.38, bounce: 0.15 }}
        className="relative rounded-t-sheet border-t-[0.5px] border-line bg-[#15171b]/95 px-5 pt-5 backdrop-blur-2xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-ink-2">{target.exercise.name}</p>
            <div className="mt-1 flex items-end gap-5">
              <button onClick={() => selectField('weight')} className="text-left">
                <span
                  className={`num text-2xl font-bold ${field === 'weight' ? 'text-ink' : 'text-ink-3'}`}
                >
                  {weight || '0'}
                </span>
                <span className={`ml-1 text-sm ${field === 'weight' ? 'text-ink-2' : 'text-ink-3'}`}>
                  kg
                </span>
              </button>
              <button onClick={() => selectField('reps')} className="text-left">
                <span
                  className={`num text-2xl font-bold ${field === 'reps' ? 'text-ink' : 'text-ink-3'}`}
                >
                  {reps || '0'}
                </span>
                <span className={`ml-1 text-sm ${field === 'reps' ? 'text-ink-2' : 'text-ink-3'}`}>
                  reps
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {target.exercise.equip === 'barbell' && parsedWeight > 0 && (
              <button
                onClick={() => setShowLoadout(true)}
                aria-label="Show plate loadout"
                className="mt-1 rounded-chip p-2.5 text-ink-2 active:bg-glass-2"
              >
                <PlatesGlyph />
              </button>
            )}
            {target.mode === 'edit' && onRemove && (
              <button
                onClick={() => {
                  onRemove()
                  onClose()
                }}
                aria-label="Remove set"
                className="mt-1 rounded-chip p-2.5 text-ink-2 active:bg-glass-2"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {['1', '2', '3'].map((d) => (
            <button key={d} onClick={() => press(d)} className={`num ${key}`}>
              {d}
            </button>
          ))}
          <button onClick={() => step(1)} className={`${key} bg-glass-2`} aria-label="Increase">
            <Plus size={20} />
            {field === 'weight' && <span className="num ml-0.5 text-xs">{fmtWeight(jump)}</span>}
          </button>
          {['4', '5', '6'].map((d) => (
            <button key={d} onClick={() => press(d)} className={`num ${key}`}>
              {d}
            </button>
          ))}
          <button onClick={() => step(-1)} className={`${key} bg-glass-2`} aria-label="Decrease">
            <Minus size={20} />
            {field === 'weight' && <span className="num ml-0.5 text-xs">{fmtWeight(jump)}</span>}
          </button>
          {['7', '8', '9'].map((d) => (
            <button key={d} onClick={() => press(d)} className={`num ${key}`}>
              {d}
            </button>
          ))}
          <button onClick={backspace} className={key} aria-label="Backspace">
            <Delete size={20} />
          </button>
          <button onClick={() => press('.')} className={`num ${key}`} disabled={field === 'reps'}>
            {field === 'weight' ? '.' : ''}
          </button>
          <button onClick={() => press('0')} className={`num ${key}`}>
            0
          </button>
          <button
            onClick={commit}
            disabled={!canCommit}
            className={`col-span-2 flex h-14 items-center justify-center rounded-chip text-base font-semibold transition-colors ${
              canCommit ? 'bg-ink text-bg active:opacity-80' : 'bg-glass text-ink-3'
            }`}
          >
            {target.mode === 'log' ? 'Log set' : 'Save'}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLoadout && (
          <LoadoutSheet
            weight={parsedWeight}
            exercise={target.exercise}
            onClose={() => setShowLoadout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
