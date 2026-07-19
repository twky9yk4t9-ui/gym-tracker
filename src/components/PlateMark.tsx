/** The Forge mark: a plate seen end-on, iron with a hot core. */
export function PlateMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden>
      <circle cx="48" cy="48" r="40" fill="#1B1E24" />
      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="30" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <circle cx="48" cy="48" r="21" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="48" cy="48" r="9" fill="#FF9330" opacity="0.9" />
      <circle cx="48" cy="48" r="14" fill="#FF9330" opacity="0.18" />
    </svg>
  )
}
