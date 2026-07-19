import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface Props {
  onClose: () => void
  children: ReactNode
  /** 'auto' hugs content; 'tall' takes most of the screen. */
  size?: 'auto' | 'tall'
}

/** Bottom glass sheet with scrim. Wrap in <AnimatePresence> at the call site. */
export function Sheet({ onClose, children, size = 'auto' }: Props) {
  const reduced = useReducedMotion()
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <motion.div
        initial={reduced ? { opacity: 0 } : { y: '100%' }}
        animate={reduced ? { opacity: 1 } : { y: 0 }}
        exit={reduced ? { opacity: 0 } : { y: '100%' }}
        transition={{ type: 'spring', duration: 0.38, bounce: 0.15 }}
        className={`relative overflow-y-auto rounded-t-sheet border-t-[0.5px] border-line bg-[#15171b]/95 px-5 pt-5 backdrop-blur-2xl ${
          size === 'tall' ? 'h-[88vh]' : 'max-h-[88vh]'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
