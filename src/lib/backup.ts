import type { Doc } from './types'
import { DEFAULT_SETTINGS, MUSCLES, SCHEMA_VERSION } from './types'
import { localDate } from './format'

export function downloadBackup(doc: Doc) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `forge-backup-${localDate()}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Parse + validate an imported backup. Throws with a readable message. */
export function parseBackup(text: string): Doc {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Not a JSON file.')
  }
  const doc = raw as Partial<Doc>
  if (typeof doc !== 'object' || doc === null || !Array.isArray(doc.sessions)) {
    throw new Error("This file doesn't look like a Forge backup.")
  }
  for (const s of doc.sessions) {
    if (typeof s.id !== 'string' || typeof s.name !== 'string' || !Array.isArray(s.exercises)) {
      throw new Error('Backup has a malformed session.')
    }
    for (const e of s.exercises) {
      if (
        typeof e.id !== 'string' ||
        typeof e.name !== 'string' ||
        !MUSCLES.includes(e.muscle) ||
        typeof e.sets !== 'number'
      ) {
        throw new Error(`Backup has a malformed exercise in “${s.name}”.`)
      }
    }
  }
  const logs = typeof doc.logs === 'object' && doc.logs !== null ? doc.logs : {}
  return {
    schemaVersion: SCHEMA_VERSION,
    sessions: doc.sessions,
    logs,
    settings: { ...DEFAULT_SETTINGS, ...(doc.settings ?? {}) },
  }
}
