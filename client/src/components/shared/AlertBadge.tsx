interface AlertBadgeProps {
  count: number
}

export function AlertBadge({ count }: AlertBadgeProps) {
  if (count === 0) return null
  return (
    <span className="alert-badge">{count > 9 ? '9+' : count}</span>
  )
}
