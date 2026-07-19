import { useState } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import type { Exercise, Muscle, Session } from '../../lib/types'
import { useStore } from '../../lib/store'
import { suggestEquip, suggestMuscle } from '../../lib/muscles'
import { ExerciseForm, type ExercisePatch } from './ExerciseForm'

export function SessionEditor({ session }: { session: Session }) {
  const renameSession = useStore((s) => s.renameSession)
  const deleteSession = useStore((s) => s.deleteSession)
  const setEditing = useStore((s) => s.setEditing)
  const setExerciseOrder = useStore((s) => s.setExerciseOrder)
  const [drafting, setDrafting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
      <header className="mb-5 flex items-center justify-between gap-3">
        <input
          value={session.name}
          onChange={(e) => renameSession(session.id, e.target.value)}
          placeholder="Session name"
          enterKeyHint="done"
          className="min-w-0 flex-1 border-b-[0.5px] border-line bg-transparent pb-1 text-xl font-bold tracking-tight text-ink outline-none placeholder:text-ink-3"
        />
        <button
          onClick={() => setEditing(false)}
          className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg"
        >
          Done
        </button>
      </header>

      <Reorder.Group
        axis="y"
        values={session.exercises.map((e) => e.id)}
        onReorder={(ids: string[]) => setExerciseOrder(session.id, ids)}
        className="flex flex-col gap-3"
      >
        {session.exercises.map((ex) => (
          <ExerciseEditor key={ex.id} sessionId={session.id} exercise={ex} />
        ))}
      </Reorder.Group>

      {drafting ? (
        <DraftExercise sessionId={session.id} onDone={() => setDrafting(false)} />
      ) : (
        <button
          onClick={() => setDrafting(true)}
          className="panel mt-3 flex w-full items-center justify-center gap-2 rounded-card py-4 text-sm font-medium text-ink-2"
        >
          <Plus size={16} /> Add exercise
        </button>
      )}

      <div className="mt-10 flex justify-center pb-6">
        <button
          onClick={() => (confirmDelete ? deleteSession(session.id) : setConfirmDelete(true))}
          className={`text-xs ${confirmDelete ? 'font-semibold text-m-quads' : 'text-ink-3'}`}
        >
          {confirmDelete ? 'Tap again to delete this session' : 'Delete session'}
        </button>
      </div>
    </div>
  )
}

function ExerciseEditor({ sessionId, exercise: ex }: { sessionId: string; exercise: Exercise }) {
  const updateExercise = useStore((s) => s.updateExercise)
  const deleteExercise = useStore((s) => s.deleteExercise)
  const defaultJump = useStore((s) => s.settings.defaultJump)
  const controls = useDragControls()
  const [confirm, setConfirm] = useState(false)

  const patch = (p: ExercisePatch) => updateExercise(sessionId, ex.id, p)

  return (
    <Reorder.Item
      value={ex.id}
      dragListener={false}
      dragControls={controls}
      className="panel rounded-card p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          onPointerDown={(e) => controls.start(e)}
          aria-label="Reorder exercise"
          className="-ml-1 cursor-grab touch-none p-1 text-ink-3"
        >
          <GripVertical size={16} />
        </button>
        <input
          value={ex.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Exercise name"
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-ink-3"
        />
        <button
          onClick={() => (confirm ? deleteExercise(sessionId, ex.id) : setConfirm(true))}
          aria-label="Delete exercise"
          className={`p-1.5 ${confirm ? 'text-m-quads' : 'text-ink-3'}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ExerciseForm
        value={ex}
        muscle={ex.muscle}
        suggested={null}
        defaultJump={defaultJump}
        onPatch={patch}
        onPickMuscle={(m) => patch({ muscle: m })}
      />
    </Reorder.Item>
  )
}

/**
 * New-exercise draft: type a name, the muscle group is pre-suggested live
 * (ringed + selected), confirm or override with a tap, then Add commits.
 */
function DraftExercise({ sessionId, onDone }: { sessionId: string; onDone: () => void }) {
  const addExercise = useStore((s) => s.addExercise)
  const defaultJump = useStore((s) => s.settings.defaultJump)
  const [draft, setDraft] = useState<Omit<Exercise, 'id'>>({
    name: '',
    muscle: 'chest',
    sets: 3,
    repRange: { min: 8, max: 12 },
    variants: [],
    activeVariant: 0,
    equip: 'machine',
  })
  const [picked, setPicked] = useState<Muscle | null>(null)
  const suggested = picked ? null : suggestMuscle(draft.name)
  const muscle = picked ?? suggested

  const canAdd = draft.name.trim().length > 0 && muscle !== null

  return (
    <div className="panel mt-3 rounded-card p-4" style={{ borderColor: 'rgba(255,255,255,0.16)' }}>
      <input
        autoFocus
        value={draft.name}
        onChange={(e) =>
          setDraft((d) => ({ ...d, name: e.target.value, equip: suggestEquip(e.target.value) }))
        }
        placeholder="Exercise name"
        enterKeyHint="done"
        className="mb-3 w-full bg-transparent text-base font-semibold text-ink outline-none placeholder:text-ink-3"
      />
      <ExerciseForm
        value={{ ...draft, muscle: muscle ?? draft.muscle }}
        muscle={muscle}
        suggested={suggested}
        defaultJump={defaultJump}
        onPatch={(p) => setDraft((d) => ({ ...d, ...p }))}
        onPickMuscle={setPicked}
      />
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onDone} className="rounded-full px-4 py-2 text-sm text-ink-2">
          Cancel
        </button>
        <button
          onClick={() => {
            if (!canAdd || !muscle) return
            addExercise(sessionId, { ...draft, name: draft.name.trim(), muscle })
            onDone()
          }}
          disabled={!canAdd}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg disabled:opacity-30"
        >
          Add
        </button>
      </div>
    </div>
  )
}
