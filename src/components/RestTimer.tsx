import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useStore } from '../lib/store'
import { fmtClock } from '../lib/format'

/** Auto-started rest pill above the tab bar. Tap to dismiss; fades itself out. */
export function RestTimer() {
  const rest = useStore((s) => s.rest)
  const dismissRest = useStore((s) => s.dismissRest)
  const restSeconds = useStore((s) => s.settings.restSeconds)
  const [now, setNow] = useState(() => Date.now())
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!rest) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [rest])

  useEffect(() => {
    // Linger 8s at zero, then leave quietly.
    if (rest && now > rest.endsAt + 8000) dismissRest()
  }, [rest, now, dismissRest])

  const remaining = rest ? Math.max(0, (rest.endsAt - now) / 1000) : 0
  const progress = rest ? Math.min(1, Math.max(0, remaining / restSeconds)) : 0

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
    >
      <AnimatePresence>
        {rest && (
          <motion.button
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.25 }}
            onClick={dismissRest}
            className="glass pointer-events-auto relative overflow-hidden rounded-full px-5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            aria-label="Dismiss rest timer"
          >
            <span className={`num text-base font-semibold ${remaining === 0 ? 'text-ember' : 'text-ink'}`}>
              {remaining === 0 ? 'Go' : fmtClock(remaining)}
            </span>
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink-3"
              style={{ transform: `scaleX(${progress})` }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
