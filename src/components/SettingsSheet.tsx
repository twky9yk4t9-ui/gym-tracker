import { useRef, useState } from 'react'
import { useStore, currentDoc } from '../lib/store'
import { downloadBackup, parseBackup } from '../lib/backup'
import { fmtWeight } from '../lib/format'
import { Sheet } from './Sheet'
import { Stepper } from './edit/Stepper'

const ALL_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]
const JUMPS = [0.5, 1, 1.25, 2, 2.5, 5]

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const importDoc = useStore((s) => s.importDoc)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)

  const stepJump = (dir: 1 | -1) => {
    let idx = JUMPS.findIndex((j) => j >= settings.defaultJump - 1e-9)
    if (idx === -1) idx = JUMPS.length - 1
    updateSettings({ defaultJump: JUMPS[Math.min(JUMPS.length - 1, Math.max(0, idx + dir))] })
  }

  const togglePlate = (p: number) => {
    const has = settings.plates.includes(p)
    if (has && settings.plates.length === 1) return
    updateSettings({
      plates: has ? settings.plates.filter((x) => x !== p) : [...settings.plates, p].sort((a, b) => b - a),
    })
  }

  const onImportFile = async (file: File) => {
    try {
      importDoc(parseBackup(await file.text()))
      setImportError(null)
      setImported(true)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <Sheet onClose={onClose}>
      <h2 className="text-lg font-bold tracking-tight">Settings</h2>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink">Backup</p>
          <p className="text-2xs text-ink-3">Your data lives only on this device.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadBackup(currentDoc())}
            className="rounded-full bg-glass px-4 py-2 text-xs font-semibold text-ink active:bg-glass-2"
          >
            Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-glass px-4 py-2 text-xs font-semibold text-ink active:bg-glass-2"
          >
            Import
          </button>
        </div>
      </div>
      {imported && <p className="mt-2 text-2xs text-ember">Backup restored.</p>}
      {importError && <p className="mt-2 text-2xs text-m-quads">{importError}</p>}
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

      <div className="mt-6 flex items-start justify-between border-t-[0.5px] border-line pt-5">
        <Stepper
          label="Bar kg"
          display={fmtWeight(settings.barWeight)}
          onDec={() => updateSettings({ barWeight: Math.max(5, settings.barWeight - 2.5) })}
          onInc={() => updateSettings({ barWeight: Math.min(35, settings.barWeight + 2.5) })}
        />
        <Stepper label="Jump kg" display={fmtWeight(settings.defaultJump)} onDec={() => stepJump(-1)} onInc={() => stepJump(1)} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-ink-2">Plates per side</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_PLATES.map((p) => {
            const active = settings.plates.includes(p)
            return (
              <button
                key={p}
                onClick={() => togglePlate(p)}
                className={`num rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? 'bg-glass-2 text-ink' : 'bg-glass text-ink-3'
                }`}
              >
                {fmtWeight(p)}
              </button>
            )
          })}
        </div>
      </div>
    </Sheet>
  )
}
