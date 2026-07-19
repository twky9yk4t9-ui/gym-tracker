import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Doc, Equip, Exercise, LoggedSet, Muscle, Session, Settings } from './types'
import { DEFAULT_SETTINGS, SCHEMA_VERSION, newId } from './types'
import { localDate } from './format'

export type Tab = 'trends' | string // session id

/**
 * The rest timer never starts itself. Logging a set (or tapping the tab-bar
 * clock) only ARMS it — a quiet offer showing the last-used duration. One tap
 * starts it; ±30 adjusts; the started duration becomes the new default.
 */
export type RestState =
  | { mode: 'armed'; seconds: number }
  | { mode: 'running'; endsAt: number; total: number }

interface ForgeState extends Doc {
  activeTab: Tab
  editing: boolean
  rest: RestState | null
  /** Exercise whose progress detail sheet is open. */
  detailExerciseId: string | null
  /** Ember-chip weight applied for today, per exercise. */
  overrides: Record<string, { date: string; weight: number }>

  // program
  addSession: (name: string) => string
  renameSession: (id: string, name: string) => void
  deleteSession: (id: string) => void
  setSessionOrder: (ids: string[]) => void
  addExercise: (sessionId: string, ex: Omit<Exercise, 'id'>) => string
  updateExercise: (sessionId: string, exerciseId: string, patch: Partial<Omit<Exercise, 'id'>>) => void
  deleteExercise: (sessionId: string, exerciseId: string) => void
  setExerciseOrder: (sessionId: string, ids: string[]) => void
  setActiveVariant: (sessionId: string, exerciseId: string, index: number) => void

  // logging
  logSet: (exercise: Exercise, set: LoggedSet) => void
  editLoggedSet: (exerciseId: string, date: string, index: number, set: LoggedSet) => void
  removeLoggedSet: (exerciseId: string, date: string, index: number) => void
  applyOverride: (exerciseId: string, weight: number) => void
  armRest: () => void
  adjustRest: (deltaSeconds: number) => void
  startRest: () => void
  dismissRest: () => void

  // app
  setActiveTab: (tab: Tab) => void
  setEditing: (editing: boolean) => void
  openDetail: (exerciseId: string) => void
  closeDetail: () => void
  updateSettings: (patch: Partial<Settings>) => void
  importDoc: (doc: Doc) => void
}

const mapSessions = (sessions: Session[], id: string, fn: (s: Session) => Session) =>
  sessions.map((s) => (s.id === id ? fn(s) : s))

export const useStore = create<ForgeState>()(
  persist(
    (set, get) => ({
      schemaVersion: SCHEMA_VERSION,
      sessions: [],
      logs: {},
      settings: DEFAULT_SETTINGS,
      activeTab: 'trends',
      editing: false,
      rest: null,
      detailExerciseId: null,
      overrides: {},

      addSession: (name) => {
        const id = newId()
        set((st) => ({
          sessions: [...st.sessions, { id, name, exercises: [] }],
          activeTab: id,
        }))
        return id
      },
      renameSession: (id, name) =>
        set((st) => ({ sessions: mapSessions(st.sessions, id, (s) => ({ ...s, name })) })),
      deleteSession: (id) =>
        set((st) => {
          const sessions = st.sessions.filter((s) => s.id !== id)
          return {
            sessions,
            activeTab: st.activeTab === id ? (sessions[0]?.id ?? 'trends') : st.activeTab,
          }
        }),
      setSessionOrder: (ids) =>
        set((st) => ({
          sessions: ids
            .map((id) => st.sessions.find((s) => s.id === id))
            .filter((s): s is Session => !!s),
        })),

      addExercise: (sessionId, ex) => {
        const id = newId()
        set((st) => ({
          sessions: mapSessions(st.sessions, sessionId, (s) => ({
            ...s,
            exercises: [...s.exercises, { ...ex, id }],
          })),
        }))
        return id
      },
      updateExercise: (sessionId, exerciseId, patch) =>
        set((st) => ({
          sessions: mapSessions(st.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
          })),
        })),
      deleteExercise: (sessionId, exerciseId) =>
        set((st) => ({
          sessions: mapSessions(st.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.filter((e) => e.id !== exerciseId),
          })),
        })),
      setExerciseOrder: (sessionId, ids) =>
        set((st) => ({
          sessions: mapSessions(st.sessions, sessionId, (s) => ({
            ...s,
            exercises: ids
              .map((id) => s.exercises.find((e) => e.id === id))
              .filter((e): e is Exercise => !!e),
          })),
        })),
      setActiveVariant: (sessionId, exerciseId, index) =>
        get().updateExercise(sessionId, exerciseId, { activeVariant: index }),

      logSet: (exercise, loggedSet) =>
        set((st) => {
          const date = localDate()
          const entries = st.logs[exercise.id] ?? []
          const variant = exercise.variants[exercise.activeVariant]
          const today = entries.find((e) => e.date === date)
          const nextEntries = today
            ? entries.map((e) =>
                e.date === date ? { ...e, variant, sets: [...e.sets, loggedSet] } : e,
              )
            : [...entries, { date, variant, sets: [loggedSet] }]
          // Offer the timer, never start it. A timer already running stays.
          const keepRunning = st.rest?.mode === 'running' && st.rest.endsAt > Date.now()
          return {
            logs: { ...st.logs, [exercise.id]: nextEntries },
            rest: keepRunning ? st.rest : { mode: 'armed', seconds: st.settings.restSeconds },
          }
        }),
      editLoggedSet: (exerciseId, date, index, loggedSet) =>
        set((st) => ({
          logs: {
            ...st.logs,
            [exerciseId]: (st.logs[exerciseId] ?? []).map((e) =>
              e.date === date
                ? { ...e, sets: e.sets.map((x, i) => (i === index ? loggedSet : x)) }
                : e,
            ),
          },
        })),
      removeLoggedSet: (exerciseId, date, index) =>
        set((st) => ({
          logs: {
            ...st.logs,
            [exerciseId]: (st.logs[exerciseId] ?? [])
              .map((e) =>
                e.date === date ? { ...e, sets: e.sets.filter((_, i) => i !== index) } : e,
              )
              .filter((e) => e.sets.length > 0),
          },
        })),
      applyOverride: (exerciseId, weight) =>
        set((st) => ({
          overrides: { ...st.overrides, [exerciseId]: { date: localDate(), weight } },
        })),
      armRest: () =>
        set((st) => ({ rest: { mode: 'armed', seconds: st.settings.restSeconds } })),
      adjustRest: (deltaSeconds) =>
        set((st) => {
          if (!st.rest) return {}
          if (st.rest.mode === 'armed') {
            return {
              rest: {
                mode: 'armed',
                seconds: Math.min(600, Math.max(30, st.rest.seconds + deltaSeconds)),
              },
            }
          }
          return {
            rest: {
              mode: 'running',
              endsAt: st.rest.endsAt + deltaSeconds * 1000,
              total: st.rest.total + deltaSeconds,
            },
          }
        }),
      startRest: () =>
        set((st) => {
          if (st.rest?.mode !== 'armed') return {}
          const s = st.rest.seconds
          return {
            rest: { mode: 'running', endsAt: Date.now() + s * 1000, total: s },
            // The duration you actually use becomes the new default.
            settings: { ...st.settings, restSeconds: s },
          }
        }),
      dismissRest: () => set({ rest: null }),

      setActiveTab: (tab) => set({ activeTab: tab, editing: false }),
      setEditing: (editing) => set({ editing }),
      openDetail: (exerciseId) => set({ detailExerciseId: exerciseId }),
      closeDetail: () => set({ detailExerciseId: null }),
      updateSettings: (patch) => set((st) => ({ settings: { ...st.settings, ...patch } })),
      importDoc: (doc) =>
        set({
          schemaVersion: SCHEMA_VERSION,
          sessions: doc.sessions,
          logs: doc.logs,
          settings: { ...DEFAULT_SETTINGS, ...doc.settings },
          activeTab: doc.sessions[0]?.id ?? 'trends',
          overrides: {},
          rest: null,
        }),
    }),
    {
      name: 'forge:v1',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (st) => ({
        schemaVersion: st.schemaVersion,
        sessions: st.sessions,
        logs: st.logs,
        settings: st.settings,
        activeTab: st.activeTab,
        rest: st.rest,
        overrides: st.overrides,
      }),
      migrate: (persisted) => {
        const st = persisted as ForgeState & { rest?: unknown }
        // v1 shipped an auto-start timer with a different rest shape — drop it.
        if (st.rest && typeof st.rest === 'object' && !('mode' in st.rest)) st.rest = null
        return st as ForgeState
      },
    },
  ),
)

/** The exportable document — program, logs, settings only. */
export function currentDoc(): Doc {
  const { schemaVersion, sessions, logs, settings } = useStore.getState()
  return { schemaVersion, sessions, logs, settings }
}

export function overrideWeightFor(exerciseId: string): number | null {
  const o = useStore.getState().overrides[exerciseId]
  return o && o.date === localDate() ? o.weight : null
}

export type { Equip, Muscle }
