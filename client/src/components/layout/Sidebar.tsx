import { NavLink } from 'react-router-dom'
import { Logo } from '../shared/Logo'
import { useDashboardStore } from '../../stores/dashboardStore'

interface NavItem {
  path: string
  label: string
  icon: string
}

const NAV_GROUPS = [
  {
    label: null,
    items: [{ path: '/', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Pipeline',
    items: [
      { path: '/outreach', label: 'Outreach', icon: 'send' },
      { path: '/proposals', label: 'Proposals', icon: 'handshake' },
      { path: '/clients', label: 'Clients', icon: 'group' },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { path: '/sops', label: 'SOPs', icon: 'account_tree' },
      { path: '/contracts', label: 'Contracts', icon: 'description' },
      { path: '/invoices', label: 'Invoices', icon: 'receipt_long' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { path: '/content', label: 'Content', icon: 'edit_calendar' },
      { path: '/lead-magnets', label: 'Lead Magnets', icon: 'download' },
      { path: '/testimonials', label: 'Testimonials', icon: 'format_quote' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/revenue', label: 'Revenue', icon: 'trending_up' },
      { path: '/costs', label: 'Costs', icon: 'payments' },
    ],
  },
  {
    label: 'Ops',
    items: [
      { path: '/team', label: 'Team', icon: 'people' },
      { path: '/scorecard', label: 'Scorecard', icon: 'bar_chart' },
    ],
  },
  {
    label: null,
    items: [{ path: '/settings', label: 'Settings', icon: 'settings' }],
  },
]

function NavItemComponent({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
    >
      <span className={`material-symbols-outlined`} style={{ fontSize: 18 }}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { alerts } = useDashboardStore()
  const redAlerts = alerts.filter((a) => a.type === 'RED').length
  const amberAlerts = alerts.filter((a) => a.type === 'AMBER').length
  const totalAlerts = redAlerts + amberAlerts

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Logo size={32} />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="sidebar-group-label">{group.label}</p>
            )}
            {group.items.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom — alert summary */}
      {totalAlerts > 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: redAlerts > 0 ? '#D0021B' : '#F5A623',
            }}
          >
            {totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </aside>
  )
}
