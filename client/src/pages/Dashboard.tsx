import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { MetricCard } from '../components/shared/MetricCard'
import { QuickActionButton } from '../components/shared/QuickActionButton'
import { useDashboardStore } from '../stores/dashboardStore'
import { useSettingsStore } from '../stores/settingsStore'
import { formatUsd } from '../lib/currency'
import type { Alert } from '../types'

function AlertItem({ alert }: { alert: Alert }) {
  return (
    <div
      className={alert.type === 'RED' ? 'alert-item-red' : 'alert-item-amber'}
      style={{
        padding: '8px 12px',
        marginBottom: 1,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeftWidth: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 14, color: alert.type === 'RED' ? 'var(--color-red)' : 'var(--color-amber)', flexShrink: 0 }}
      >
        {alert.type === 'RED' ? 'error' : 'warning'}
      </span>
      <span style={{ fontSize: 12, flex: 1 }}>{alert.message}</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
        }}
      >
        {alert.module.replace('_', ' ')}
      </span>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { unitEconomics, trends, alerts, loading, fetchAll } = useDashboardStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const rate = settings ? Number(settings.usdPkrRate) : 278.5
  const mrrPkr = unitEconomics ? unitEconomics.mrrUsd * rate : 0
  const totalRevPkr = unitEconomics ? unitEconomics.totalRevenueUsd * rate : 0

  const ltvCacHealthy = (unitEconomics?.ltvCacRatio ?? 0) >= 5
  const marginHealthy = (unitEconomics?.grossMarginPct ?? 0) >= 60

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Business overview · {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => fetchAll()}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Row 1 — 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 1 }}>
        <MetricCard
          label="MRR"
          amountUsd={unitEconomics?.mrrUsd ?? 0}
          amountPkr={mrrPkr}
          border="amber"
        />
        <MetricCard
          label="Total Revenue"
          amountUsd={unitEconomics?.totalRevenueUsd ?? 0}
          amountPkr={totalRevPkr}
          border="navy"
        />
        <MetricCard
          label="Active Clients"
          value={unitEconomics?.activeClients ?? 0}
          sub={`${unitEconomics?.mrrCoveragePct ?? 0}% MRR coverage`}
          border="amber"
        />
        <MetricCard
          label="LTV:CAC"
          value={`${unitEconomics?.ltvCacRatio ?? 0}x`}
          sub={ltvCacHealthy ? 'Healthy' : 'Below target (5x min)'}
          border={ltvCacHealthy ? 'amber' : 'red'}
        />
      </div>

      {/* Row 2 — Chart + Deliverables */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 1, marginTop: 1, marginBottom: 1 }}>
        {/* Revenue Trend Chart */}
        <div className="card" style={{ borderRadius: 0, padding: '16px 8px 8px 4px' }}>
          <p className="metric-label" style={{ padding: '0 12px', marginBottom: 12 }}>Revenue Trend — 12 Months</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trends} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#888888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 0,
                  fontSize: 12,
                }}
                formatter={(val: number) => [formatUsd(val), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="totalUsd"
                stroke="#0D1117"
                strokeWidth={1.5}
                dot={(props) => {
                  const { cx, cy } = props
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={2.5} fill="#F5A623" stroke="none" />
                }}
                activeDot={{ r: 3.5, fill: '#F5A623' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Deliverables placeholder */}
        <div className="card" style={{ borderRadius: 0 }}>
          <p className="metric-label" style={{ marginBottom: 12 }}>Active Deliverables</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            Go to <button className="btn btn-sm" onClick={() => navigate('/sops')} style={{ display: 'inline-flex' }}>SOPs</button> to view active delivery.
          </p>
          {/* Gross margin stat */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <p className="metric-label" style={{ marginBottom: 6 }}>Gross Margin</p>
            <p
              className="metric-value"
              style={{ fontSize: 24, color: marginHealthy ? 'var(--color-green)' : 'var(--color-red)' }}
            >
              {unitEconomics?.grossMarginPct ?? 0}%
            </p>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div
                className={`progress-bar-fill ${marginHealthy ? 'green' : ''}`}
                style={{
                  width: `${Math.min(unitEconomics?.grossMarginPct ?? 0, 100)}%`,
                  background: marginHealthy ? 'var(--color-green)' : 'var(--color-red)',
                }}
              />
            </div>
            <p style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>Target: 60%+</p>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <p className="metric-label" style={{ marginBottom: 6 }}>Close Rate</p>
            <p className="metric-value" style={{ fontSize: 24 }}>{unitEconomics?.closeRate ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* Row 3 — Alerts + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '66% 34%', gap: 1, marginTop: 1 }}>
        {/* Alerts Feed */}
        <div className="card" style={{ borderRadius: 0 }}>
          <p className="metric-label" style={{ marginBottom: 12 }}>
            Alerts
            {alerts.length > 0 && (
              <span style={{ marginLeft: 8, color: alerts.some((a) => a.type === 'RED') ? 'var(--color-red)' : 'var(--color-amber)' }}>
                ({alerts.length})
              </span>
            )}
          </p>
          {loading && <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>Loading...</p>}
          {!loading && alerts.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-green)' }}>check_circle</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>All clear — no active alerts</span>
            </div>
          )}
          {alerts.map((alert, i) => (
            <AlertItem key={i} alert={alert} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ borderRadius: 0 }}>
          <p className="metric-label" style={{ marginBottom: 12 }}>Quick Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <QuickActionButton
              icon="person_add"
              label="Add New Client"
              onClick={() => navigate('/clients?new=true')}
            />
            <QuickActionButton
              icon="receipt_long"
              label="Generate Invoice"
              onClick={() => navigate('/invoices?new=true')}
            />
            <QuickActionButton
              icon="account_tree"
              label="Update SOP"
              onClick={() => navigate('/sops')}
            />
            <QuickActionButton
              icon="payments"
              label="Log Expense"
              onClick={() => navigate('/costs?new=true')}
            />
            <QuickActionButton
              icon="description"
              label="Generate Contract"
              onClick={() => navigate('/contracts?new=true')}
            />
          </div>

          {/* Unit economics mini */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <p className="metric-label" style={{ marginBottom: 8 }}>Avg LTV</p>
            <p className="metric-value" style={{ fontSize: 18 }}>
              ${(unitEconomics?.avgLtvUsd ?? 0).toLocaleString()}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
              Avg CAC: ${(unitEconomics?.avgCacUsd ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
