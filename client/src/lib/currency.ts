/**
 * Client-side currency helpers.
 * For display only — all actual computations happen server-side.
 */

export function formatUsd(amount: number, compact = false): string {
  if (compact && amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPkr(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₨${(amount / 100000).toFixed(1)}L`
  }
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Preview conversion on client side (for MoneyInput blur effect).
 * Uses the current settings rate — NOT stored on transaction.
 */
export function previewConvert(amount: number, from: 'USD' | 'PKR', rate: number): { usd: number; pkr: number } {
  if (from === 'USD') {
    return { usd: amount, pkr: Math.round(amount * rate) }
  }
  return { usd: Math.round((amount / rate) * 100) / 100, pkr: amount }
}

export function offerTypeLabel(type: string): string {
  const map: Record<string, string> = {
    AUDIT: 'Audit',
    SYSTEM_BUILD: 'System Build',
    DWY: 'Done With You',
    DFY: 'Done For You',
  }
  return map[type] ?? type
}

export function clientStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PROSPECT: 'Prospect',
    PROPOSAL_SENT: 'Proposal Sent',
    CONTRACT_SIGNED: 'Contract Signed',
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    COMPLETE: 'Complete',
    CHURNED: 'Churned',
  }
  return map[status] ?? status
}

export function statusPillClass(status: string): string {
  return status.toLowerCase().replace('_', '-')
}
