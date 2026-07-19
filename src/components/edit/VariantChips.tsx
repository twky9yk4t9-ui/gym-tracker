import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface Props {
  variants: string[]
  onChange: (variants: string[]) => void
}

/** Editable variant chips: Flat BB / DB / Machine… one slot, many gyms. */
export function VariantChips({ variants, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = () => {
    const v = draft.trim()
    if (v) onChange([...variants, v])
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {variants.map((v, i) => (
        <span
          key={v + i}
          className="flex items-center gap-1 rounded-full bg-glass px-2.5 py-1 text-2xs text-ink-2"
        >
          {v}
          <button
            onClick={() => onChange(variants.filter((_, j) => j !== i))}
            aria-label={`Remove variant ${v}`}
            className="-mr-0.5 p-0.5 text-ink-3"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          placeholder="Variant"
          enterKeyHint="done"
          className="w-28 rounded-full bg-glass px-3 py-1 text-[16px] text-ink outline-none placeholder:text-ink-3"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-2xs text-ink-3"
        >
          <Plus size={11} /> variant
        </button>
      )}
    </div>
  )
}
