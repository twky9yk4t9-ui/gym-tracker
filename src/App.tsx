import { AnimatePresence } from 'motion/react'
import { useStore } from './lib/store'
import { TabBar } from './components/TabBar'
import { FirstRun } from './components/FirstRun'
import { SessionScreen } from './components/SessionScreen'
import { TrendsScreen } from './components/trends/TrendsScreen'
import { ExerciseDetail } from './components/trends/ExerciseDetail'
import { RestTimer } from './components/RestTimer'

export default function App() {
  const sessions = useStore((s) => s.sessions)
  const activeTab = useStore((s) => s.activeTab)
  const detailExerciseId = useStore((s) => s.detailExerciseId)
  const closeDetail = useStore((s) => s.closeDetail)

  if (sessions.length === 0) return <FirstRun />

  const session = sessions.find((s) => s.id === activeTab)
  const detailExercise = detailExerciseId
    ? sessions.flatMap((s) => s.exercises).find((e) => e.id === detailExerciseId)
    : undefined

  return (
    // Anchored to the top and sized to the DYNAMIC viewport (100dvh) so the
    // shell always matches the visible area — on iOS this tracks Safari's
    // toolbars and, in standalone, the true screen. The bars are `absolute`
    // to THIS shell (not `fixed` to the raw viewport), so they pin to the
    // real bottom in every mode instead of drifting up the screen.
    <div
      className="fixed inset-x-0 top-0 flex flex-col overflow-hidden bg-bg"
      style={{ height: '100dvh' }}
    >
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}
      >
        {session ? <SessionScreen key={session.id} session={session} /> : <TrendsScreen />}
      </main>
      {/* Scrim: content fades into the background as it scrolls under the
          floating bar, so the bottom reads clean instead of clipped. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-bg via-bg/85 to-transparent"
      />
      <RestTimer />
      <TabBar />
      <AnimatePresence>
        {detailExercise && <ExerciseDetail exercise={detailExercise} onClose={closeDetail} />}
      </AnimatePresence>
    </div>
  )
}
