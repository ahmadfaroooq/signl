import { useEffect, useState } from 'react'
import { get, post, patch, del } from '../lib/api'
import { useClientStore } from '../stores/clientStore'
import { useSettingsStore } from '../stores/settingsStore'
import type { CostEntry, CostCategory, CostInputType, Currency, BillingCycle } from '../types'

const fmt = (v: number) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CATEGORIES: CostCategory[] = ['FIXED', 'VARIABLE', 'ACQUISITION']
const BILLING_CYCLES: BillingCycle[] = ['MONTHLY', 'ANNUAL', 'ONE_TIME']

const CATEGORY_COLORS: Record<CostCategory, string> = {
  FIXED: 'var(--color-base)',
  VARIABLE: '#1a6fd8',
  ACQUISITION: 'var(--color-amber)',
}

const emptyForm = () => ({
  name: '',
  category: 'FIXED' as CostCategory,
  costInputType: 'CASH' as CostInputType,
  amount: '',
  currency: 'USD' as Currency,
  hours: '',
  clientId: '',
  billingCycle: 'MONTHLY' as BillingCycle,
  isShared: false,
  date: new Date().toISOString().slice(0, 10),
  notes: '',
})

export function Costs() {
  const [costs, setCosts] = useState<CostEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<CostCategory | 'ALL'>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CostEntry | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const { clients, fetch: fetchClients } = useClientStore()
  const { settings } = useSettingsStore()
  const hourlyRate = settings?.hourlyRateUsd ?? 50

  const loadCosts = async () => {
    setLoading(true)
    const res = await get<CostEntry[]>('/costs')
    if (res.data) setCosts(res.data)
    setLoading(false)
  }

  useEffect(() => {
    loadCosts()
    fetchClients()
  }, [fetchClients])

  const filtered = filterCategory === 'ALL' ? costs : costs.filter((c) => c.category === filterCategory)

  // Metrics
  const totalUsd = costs.reduce((s, c) => s + c.amountUsd, 0)
  const fixedUsd = costs.filter((c) => c.category === 'FIXED').reduce((s, c) => s + c.amountUsd, 0)
  const varAcqUsd = costs.filter((c) => c.category === 'VARIABLE' || c.category === 'ACQUISITION').reduce((s, c) => s + c.amountUsd, 0)

  const openModal = (cost?: CostEntry) => {
    if (cost) {
      setEditTarget(cost)
      setForm({
        name: cost.name,
        category: cost.category,
        costInputType: cost.costInputType,
        amount: cost.amount != null ? String(cost.amount) : '',
        currency: cost.currency ?? 'USD',
        hours: cost.hours != null ? String(cost.hours) : '',
        clientId: cost.clientId ?? '',
        billingCycle: cost.billingCycle ?? 'MONTHLY',
        isShared: cost.isShared,
        date: cost.date.slice(0, 10),
        notes: cost.notes ?? '',
      })
    } else {
      setEditTarget(null)
      setForm(emptyForm())
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTarget(null)
    setForm(emptyForm())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      category: form.category,
      costInputType: form.costInputType,
      amount: form.costInputType === 'CASH' ? (parseFloat(form.amount) || null) : null,
      currency: form.costInputType === 'CASH' ? form.currency : null,
      hours: form.costInputType === 'TIME' ? (parseFloat(form.hours) || null) : null,
      clientId: form.clientId || null,
      billingCycle: form.billingCycle,
      isShared: form.isShared,
      date: form.date,
      notes: form.notes || null,
    }
    if (editTarget) {
      const res = await patch<CostEntry>(`/costs/${editTarget.id}`, payload)
      if (res.data) setCosts((prev) => prev.map((c) => (c.id === editTarget.id ? res.data! : c)))
    } else {
      const res = await post<CostEntry>('/costs', payload)
      if (res.data) setCosts((prev) => [res.data!, ...prev])
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cost entry?')) return
    await del(`/costs/${id}`)
    setCosts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleToggleActive = async (cost: CostEntry) => {
    const res = await patch<CostEntry>(`/costs/${cost.id}`, { isActive: !cost.isActive })
    if (res.data) setCosts((prev) => prev.map((c) => (c.id === cost.id ? res.data! : c)))
  }

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // TIME cost preview
  const timePreviewHours = parseFloat(form.hours) || 0
  const timePreviewCost = timePreviewHours * hourlyRate

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Costs</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {costs.length} entries · {costs.filter((c) => c.isActive).length} active
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Add Cost
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card red">
          <div className="metric-label">Total Costs</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(totalUsd)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>per month equivalent</div>
        </div>
        <div className="metric-card navy">
          <div className="metric-label">Fixed Costs</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(fixedUsd)}</span>
          </div>
        </div>
        <div className="metric-card amber">
          <div className="metric-label">Variable + Acquisition</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(varAcqUsd)}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        {(['ALL', ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            className="btn btn-sm"
            style={{
              border: 'none',
              borderBottom: filterCategory === cat ? '2px solid var(--color-amber)' : '2px solid transparent',
              borderRadius: 0,
              background: 'transparent',
              fontWeight: filterCategory === cat ? 700 : 500,
              color: filterCategory === cat ? 'var(--color-base)' : 'var(--color-muted)',
              paddingBottom: 10,
            }}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <div className="loading-state">Loading...</div>}

      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount (USD)</th>
                <th>Amount (PKR)</th>
                <th>Date</th>
                <th>Client</th>
                <th>Recurring</th>
                <th>Active</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                    No cost entries found.
                  </td>
                </tr>
              )}
              {filtered.map((cost) => (
                <tr key={cost.id} style={{ opacity: cost.isActive ? 1 : 0.5 }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cost.name}</div>
                    {cost.notes && (
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{cost.notes}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={{ color: CATEGORY_COLORS[cost.category], borderColor: CATEGORY_COLORS[cost.category] }}
                    >
                      {cost.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
                      {cost.costInputType}
                      {cost.costInputType === 'TIME' && cost.hours != null && ` · ${cost.hours}h`}
                    </span>
                  </td>
                  <td>
                    <span className="currency-usd" style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Roboto Condensed, sans-serif' }}>
                      {fmt(cost.amountUsd)}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    <span className="currency-pkr">
                      ₨{cost.amountPkr.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {new Date(cost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {cost.client?.fullName ?? '—'}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {cost.billingCycle ?? '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        borderColor: cost.isActive ? 'var(--color-green)' : 'var(--color-muted)',
                        color: cost.isActive ? 'var(--color-green)' : 'var(--color-muted)',
                        padding: '3px 8px',
                      }}
                      onClick={() => handleToggleActive(cost)}
                      title={cost.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {cost.isActive ? 'toggle_on' : 'toggle_off'}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => openModal(cost)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cost.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ width: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                {editTarget ? `Edit Cost — ${editTarget.name}` : 'Add Cost'}
              </h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={closeModal}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input"
                    required
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Notion, Designer retainer..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Category *</label>
                    <select className="select" value={form.category} onChange={(e) => setField('category', e.target.value as CostCategory)}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Input Type *</label>
                    <select className="select" value={form.costInputType} onChange={(e) => setField('costInputType', e.target.value as CostInputType)}>
                      <option value="CASH">Cash (dollar amount)</option>
                      <option value="TIME">Time (hours)</option>
                    </select>
                  </div>
                </div>

                {form.costInputType === 'CASH' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                    <div>
                      <label className="label">Amount *</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.amount}
                        onChange={(e) => setField('amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="label">Currency</label>
                      <select className="select" value={form.currency} onChange={(e) => setField('currency', e.target.value as Currency)}>
                        <option value="USD">USD</option>
                        <option value="PKR">PKR</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="label">Hours *</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={form.hours}
                      onChange={(e) => setField('hours', e.target.value)}
                      placeholder="0"
                    />
                    {timePreviewHours > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          fontSize: 13,
                          fontFamily: 'Roboto Condensed, sans-serif',
                        }}
                      >
                        {timePreviewHours} hrs × {fmt(hourlyRate)}/hr = <strong>{fmt(timePreviewCost)}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Billing Cycle</label>
                    <select className="select" value={form.billingCycle} onChange={(e) => setField('billingCycle', e.target.value as BillingCycle)}>
                      {BILLING_CYCLES.map((b) => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date *</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setField('date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Linked Client (optional)</label>
                  <select className="select" value={form.clientId} onChange={(e) => setField('clientId', e.target.value)}>
                    <option value="">None (general business cost)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={form.isShared}
                    onChange={(e) => setField('isShared', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="isShared" style={{ fontSize: 13, cursor: 'pointer' }}>
                    Shared cost (split across multiple clients)
                  </label>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    rows={2}
                    placeholder="Details, vendor, description..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Cost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
