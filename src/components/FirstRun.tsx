import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useStore } from '../lib/store'
import { parseBackup } from '../lib/backup'
import { PlateMark } from './PlateMark'

export function FirstRun() {
  const addSession = useStore((s) => s.addSession)
  const setEditing = useStore((s) => s.setEditing)
  const importDoc = useStore((s) => s.importDoc)
  const [name, setName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()

  const create = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addSession(trimmed)
    setEditing(true)
  }

  const onImportFile = async (file: File) => {
    try {
      importDoc(parseBackup(await file.text()))
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-bg px-8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.7, bounce: 0.3 }}
        className="flex flex-col items-center"
      >
        <PlateMark size={84} />
        <h1 className="mt-8 text-xl font-bold tracking-tight">Build your program.</h1>
        <p className="mt-2 text-sm text-ink-2 text-center">
          Name your first session — Push, Legs, anything.
        </p>
      </motion.div>

      <motion.form
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.7, bounce: 0.2, delay: 0.15 }}
        className="mt-10 flex w-full max-w-xs items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          create()
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Push"
          enterKeyHint="go"
          className="glass min-w-0 flex-1 rounded-chip px-5 py-4 text-base text-ink outline-none placeholder:text-ink-3"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          aria-label="Create session"
          className="glass flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-chip text-ink transition-opacity disabled:opacity-30"
        >
          <ArrowRight size={22} />
        </button>
      </motion.form>

      <div className="mt-12 flex flex-col items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs text-ink-3 underline-offset-4 hover:underline"
        >
          Restore from backup
        </button>
        {importError && <p className="text-xs text-m-quads">{importError}</p>}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onImportFile(f)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
