import { useEffect, useState } from 'react'
import { Minus, Play, Plus, X } from 'lucide-react'
import { useStore, type RestState } from '../lib/store'
import { fmtClock } from '../lib/format'

/**
 * The rest pill. Never starts on its own:
 * armed  →  [−30]  [▶ 2:00 rest]  [+30]   — one tap starts; ±30 tunes; fades if ignored
 * running →        [✕ 1:47]       [+30]   — tap dismisses; +30 buys more rest
 * The duration you start becomes the new default (the app remembers for you).
 *
 * Presence is CSS-only (always-mounted container): the 500ms countdown re-render
 * plus AnimatePresence exit tracking proved unreliable, and CSS transitions can't
 * strand a ghost pill.
 */
export function RestTimer() {
  const rest = useStore((s) => s.rest)
  const adjustRest = useStore((s) => s.adjustRest)
  const startRest = useStore((s) => s.startRest)
  const dismissRest = useStore((s) => s.dismissRest)
  const [now, setNow] = useState(() => Date.now())
  // Keep the last pill content around briefly so the fade-out has something to show.
  const [display, setDisplay] = useState<RestState | null>(rest)

  useEffect(() => {
    if (rest) {
      setDisplay(rest)
      return
    }
    const t = setTimeout(() => setDisplay(null), 350)
    return () => clearTimeout(t)
  }, [rest])

  useEffect(() => {
    if (rest?.mode !== 'running') return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [rest?.mode])

  // An ignored offer withdraws itself; interacting (±30) re-arms the fade.
  useEffect(() => {
    if (rest?.mode !== 'armed') return
    const t = setTimeout(dismissRest, 20_000)
    return () => clearTimeout(t)
  }, [rest, dismissRest])

  // Done + lingered → leave quietly.
  useEffect(() => {
    if (rest?.mode === 'running' && now > rest.endsAt + 8000) dismissRest()
  }, [rest, now, dismissRest])

  const shown = rest ?? display
  const remaining = shown?.mode === 'running' ? Math.max(0, (shown.endsAt - now) / 1000) : 0
  const progress = shown?.mode === 'running' ? Math.min(1, Math.max(0, remaining / shown.total)) : 0

  const side =
    'glass flex h-11 w-11 items-center justify-center rounded-full text-ink-2 active:bg-glass-2'

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 92px)' }}
    >
      <div
        aria-hidden={!rest}
        className={`flex items-center gap-2 transition-all duration-300 ease-out ${
          rest
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0 motion-safe:translate-y-3 motion-safe:scale-95'
        }`}
      >
        {shown?.mode === 'armed' && (
          <button onClick={() => adjustRest(-30)} aria-label="30 seconds less rest" className={side}>
            <Minus size={16} />
          </button>
        )}

        {shown?.mode === 'armed' && (
          <button
            onClick={startRest}
            aria-label={`Start rest timer, ${fmtClock(shown.seconds)}`}
            className="glass flex h-12 items-center gap-2 rounded-full px-5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-150 ease-out motion-safe:active:scale-95"
          >
            <Play size={15} className="text-ember" fill="currentColor" />
            <span className="num text-base font-semibold text-ink">{fmtClock(shown.seconds)}</span>
            <span className="text-xs text-ink-2">rest</span>
          </button>
        )}

        {shown?.mode === 'running' && (
          <button
            onClick={dismissRest}
            aria-label="Dismiss rest timer"
            className="glass relative flex h-12 items-center gap-2 overflow-hidden rounded-full px-5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <X size={14} className="text-ink-3" />
            <span
              className={`num text-base font-semibold ${remaining === 0 ? 'text-ember' : 'text-ink'}`}
            >
              {remaining === 0 ? 'Go' : fmtClock(remaining)}
            </span>
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink-3"
              style={{ transform: `scaleX(${progress})` }}
            />
          </button>
        )}

        {shown && (
          <button onClick={() => adjustRest(30)} aria-label="30 seconds more rest" className={side}>
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
