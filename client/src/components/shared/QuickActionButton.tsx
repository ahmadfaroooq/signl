import { ReactNode } from 'react'

interface QuickActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  className?: string
}

/**
 * 1px border, no fill, hover shows amber border transition.
 * Used in Dashboard Quick Actions panel.
 */
export function QuickActionButton({ icon, label, onClick, className = '' }: QuickActionButtonProps) {
  return (
    <button
      className={`btn w-full justify-start ${className}`}
      onClick={onClick}
      style={{ gap: 10, padding: '9px 12px' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    </button>
  )
}
