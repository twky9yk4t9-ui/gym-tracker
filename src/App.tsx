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
    <div className="fixed inset-0 flex flex-col bg-bg">
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(104px + env(safe-area-inset-bottom))' }}
      >
        {session ? <SessionScreen key={session.id} session={session} /> : <TrendsScreen />}
      </main>
      <RestTimer />
      <TabBar />
      <AnimatePresence>
        {detailExercise && <ExerciseDetail exercise={detailExercise} onClose={closeDetail} />}
      </AnimatePresence>
    </div>
  )
}
