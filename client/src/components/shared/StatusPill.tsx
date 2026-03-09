import { statusPillClass } from '../../lib/currency'

interface StatusPillProps {
  status: string
  label?: string
}

const STATUS_LABELS: Record<string, string> = {
  PROSPECT: 'Prospect',
  PROPOSAL_SENT: 'Proposal Sent',
  CONTRACT_SIGNED: 'Signed',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETE: 'Complete',
  CHURNED: 'Churned',
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
  IN_DISCUSSION: 'In Discussion',
  WON: 'Won',
  LOST: 'Lost',
  GHOSTED: 'Ghosted',
  ACTIVE_RETAINER: 'Active',
}

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span className={`status-pill ${statusPillClass(status)}`}>
      {label ?? STATUS_LABELS[status] ?? status}
    </span>
  )
}
