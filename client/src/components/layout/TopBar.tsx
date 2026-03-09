import { useCurrencyStore } from '../../stores/currencyStore'
import { useAuthStore } from '../../stores/authStore'
import { useDashboardStore } from '../../stores/dashboardStore'
import type { CurrencyDisplay } from '../../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function TopBar() {
  const { display, setDisplay } = useCurrencyStore()
  const { user, logout } = useAuthStore()
  const { alerts, unitEconomics } = useDashboardStore()

  const now = new Date()
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  const redCount = alerts.filter((a) => a.type === 'RED').length
  const amberCount = alerts.filter((a) => a.type === 'AMBER').length
  const totalAlerts = redCount + amberCount

  const btnBase: React.CSSProperties = {
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.1s',
  }

  const getStyle = (mode: CurrencyDisplay): React.CSSProperties => ({
    ...btnBase,
    background: display === mode ? 'var(--color-base)' : 'transparent',
    color: display === mode ? '#ffffff' : 'var(--color-muted)',
    borderColor: display === mode ? 'var(--color-base)' : 'var(--color-border)',
  })

  return (
    <header
      style={{
        height: 52,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 20,
        gap: 16,
        background: 'var(--color-surface)',
        flexShrink: 0,
      }}
    >
      {/* Date */}
      <span
        className="font-condensed"
        style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-muted)' }}
      >
        {dateStr}
      </span>

      <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

      {/* Active clients inline stat */}
      {unitEconomics && (
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-base)' }}>{unitEconomics.activeClients}</span> active clients
        </span>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Currency toggle — [USD] [PKR] [BOTH] */}
      <div style={{ display: 'flex', gap: 0 }}>
        <button style={getStyle('USD')} onClick={() => setDisplay(display === 'USD' ? 'BOTH' : 'USD')}>USD</button>
        <button style={{ ...getStyle('PKR'), borderLeft: 'none' }} onClick={() => setDisplay(display === 'PKR' ? 'BOTH' : 'PKR')}>PKR</button>
      </div>

      {/* Alert badge */}
      {totalAlerts > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            border: `1px solid ${redCount > 0 ? 'var(--color-red)' : 'var(--color-amber)'}`,
            cursor: 'pointer',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14, color: redCount > 0 ? 'var(--color-red)' : 'var(--color-amber)' }}
          >
            warning
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: redCount > 0 ? 'var(--color-red)' : 'var(--color-amber)',
            }}
          >
            {totalAlerts}
          </span>
        </div>
      )}

      {/* User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{user?.name?.split(' ')[0]}</span>
        <button
          onClick={logout}
          style={{ ...btnBase, fontSize: 11 }}
          title="Sign out"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>logout</span>
        </button>
      </div>
    </header>
  )
}
