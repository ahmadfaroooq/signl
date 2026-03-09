import { CurrencyDisplay } from './CurrencyDisplay'

type BorderColor = 'amber' | 'red' | 'navy' | 'green'

interface MetricCardProps {
  label: string
  amountUsd?: number
  amountPkr?: number
  value?: string | number
  sub?: string
  border?: BorderColor
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({ label, amountUsd, amountPkr, value, sub, border = 'navy', trend, className = '' }: MetricCardProps) {
  return (
    <div className={`metric-card ${border} ${className}`}>
      <p className="metric-label" style={{ marginBottom: 8 }}>{label}</p>

      {amountUsd !== undefined && amountPkr !== undefined ? (
        <CurrencyDisplay amountUsd={amountUsd} amountPkr={amountPkr} usdSize="lg" />
      ) : (
        <p
          className="metric-value"
          style={{ fontSize: 28, color: border === 'red' ? 'var(--color-red)' : 'var(--color-base)', lineHeight: 1 }}
        >
          {value}
        </p>
      )}

      {sub && (
        <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
          {sub}
        </p>
      )}

      {trend && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            marginTop: 4,
            color: trend === 'up' ? 'var(--color-green)' : trend === 'down' ? 'var(--color-red)' : 'var(--color-muted)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
        </span>
      )}
    </div>
  )
}
