import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Session } from '../lib/types'
import { useStore } from '../lib/store'
import { tonnage } from '../lib/progression'
import { fmtDay, localDate } from '../lib/format'
import { ExerciseCard } from './ExerciseCard'
import { Keypad, type KeypadTarget } from './Keypad'
import { SessionEditor } from './edit/SessionEditor'

export function SessionScreen({ session }: { session: Session }) {
  const editing = useStore((s) => s.editing)
  const setEditing = useStore((s) => s.setEditing)
  const logs = useStore((s) => s.logs)
  const logSet = useStore((s) => s.logSet)
  const editLoggedSet = useStore((s) => s.editLoggedSet)
  const removeLoggedSet = useStore((s) => s.removeLoggedSet)
  const [keypad, setKeypad] = useState<KeypadTarget | null>(null)
  const reduced = useReducedMotion()

  if (editing) return <SessionEditor session={session} />

  const today = localDate()
  const todayTonnage = session.exercises.reduce((sum, ex) => {
    const entry = (logs[ex.id] ?? []).find((e) => e.date === today)
    return sum + (entry ? tonnage(entry) : 0)
  }, 0)

  return (
    <div className="px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{session.name}</h1>
          <p className="num mt-0.5 text-xs text-ink-3">
            {fmtDay(today)}
            {todayTonnage > 0 && ` · ${Math.round(todayTonnage).toLocaleString()} kg`}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit session"
          className="rounded-chip p-2.5 text-ink-2 active:bg-glass"
        >
          <Pencil size={18} />
        </button>
      </header>

      {session.exercises.length === 0 ? (
        <button
          onClick={() => setEditing(true)}
          className="glass w-full rounded-card px-5 py-10 text-center"
        >
          <p className="text-sm text-ink-2">Nothing here yet.</p>
          <p className="mt-1 text-xs text-ink-3">Tap to add your first exercise.</p>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {session.exercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2, delay: i * 0.05 }}
            >
              <ExerciseCard exercise={ex} onOpenKeypad={setKeypad} />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {keypad && (
          <Keypad
            target={keypad}
            onClose={() => setKeypad(null)}
            onCommit={(set) => {
              if (keypad.mode === 'edit' && keypad.date !== undefined && keypad.index !== undefined) {
                editLoggedSet(keypad.exercise.id, keypad.date, keypad.index, set)
              } else {
                logSet(keypad.exercise, set)
              }
            }}
            onRemove={
              keypad.mode === 'edit' && keypad.date !== undefined && keypad.index !== undefined
                ? () => removeLoggedSet(keypad.exercise.id, keypad.date!, keypad.index!)
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
