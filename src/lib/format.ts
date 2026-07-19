/** Local date as YYYY-MM-DD (toISOString would drift across midnight UTC). */
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "82.5" — trims trailing zeros, never shows more than 2 decimals. */
export function fmtWeight(w: number): string {
  return String(Math.round(w * 100) / 100)
}

export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** "Tue 14 Jan" style short date from YYYY-MM-DD. */
export function fmtDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Relative label for a past date: "today", "yesterday", "5 days ago", "3 wk ago". */
export function fmtAgo(date: string, today: string): string {
  const toMs = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  const days = Math.round((toMs(today) - toMs(date)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  return `${Math.round(days / 7)} wk ago`
}
