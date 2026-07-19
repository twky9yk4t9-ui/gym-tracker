import { Plus, Timer, TrendingUp } from 'lucide-react'
import { Reorder } from 'motion/react'
import { useStore } from '../lib/store'

export function TabBar() {
  const sessions = useStore((s) => s.sessions)
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const editing = useStore((s) => s.editing)
  const setEditing = useStore((s) => s.setEditing)
  const addSession = useStore((s) => s.addSession)
  const setSessionOrder = useStore((s) => s.setSessionOrder)
  const rest = useStore((s) => s.rest)
  const armRest = useStore((s) => s.armRest)
  const dismissRest = useStore((s) => s.dismissRest)

  const chip = (active: boolean) =>
    `flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${
      active ? 'bg-glass-2 text-ink' : 'text-ink-2'
    }`

  return (
    <nav
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div className="glass pointer-events-auto flex max-w-full items-center gap-1 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Reorder.Group
          axis="x"
          values={sessions.map((s) => s.id)}
          onReorder={setSessionOrder}
          className="flex max-w-[64vw] items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sessions.map((s) => (
            <Reorder.Item
              key={s.id}
              value={s.id}
              drag={editing ? 'x' : false}
              className="shrink-0"
            >
              <button
                onClick={() => setActiveTab(s.id)}
                className={chip(activeTab === s.id)}
              >
                <span className="max-w-24 truncate">{s.name}</span>
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        {editing && (
          <button
            onClick={() => {
              addSession('New session')
              setEditing(true)
            }}
            aria-label="Add session"
            className={chip(false)}
          >
            <Plus size={18} />
          </button>
        )}
        <div className="h-6 w-px shrink-0 bg-line" />
        <button
          onClick={() => (rest ? dismissRest() : armRest())}
          aria-label={rest ? 'Hide rest timer' : 'Rest timer'}
          className={chip(false)}
        >
          <Timer size={18} className={rest ? 'text-ink' : undefined} />
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          aria-label="Trends"
          className={chip(activeTab === 'trends')}
        >
          <TrendingUp size={18} />
        </button>
      </div>
    </nav>
  )
}
