import { formatUsd, formatPkr } from '../../lib/currency'

interface CurrencyDisplayProps {
  amountUsd: number
  amountPkr: number
  usdSize?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  compact?: boolean
}

const sizeMap = {
  sm: '14px',
  md: '18px',
  lg: '24px',
  xl: '32px',
}

/**
 * Renders USD + PKR amounts with global currency toggle CSS classes.
 * USD: Roboto Condensed bold, primary color.
 * PKR: Inter 12px muted beneath — hidden via CSS when toggled.
 */
export function CurrencyDisplay({ amountUsd, amountPkr, usdSize = 'md', className = '', compact = false }: CurrencyDisplayProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className="currency-usd metric-value"
        style={{ fontSize: sizeMap[usdSize], color: 'var(--color-base)', lineHeight: 1.1 }}
      >
        {formatUsd(amountUsd, compact)}
      </span>
      <span
        className="currency-pkr"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: 'var(--color-muted)',
          lineHeight: 1.4,
          marginTop: '1px',
        }}
      >
        {formatPkr(amountPkr, compact)}
      </span>
    </div>
  )
}
