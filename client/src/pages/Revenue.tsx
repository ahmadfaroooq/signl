import { useEffect, useState } from 'react'
import { get, post, del } from '../lib/api'
import { useClientStore } from '../stores/clientStore'
import type { RevenueEntry, OfferType, Currency, RevenueType } from '../types'

const fmt = (v: number) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const OFFER_LABELS: Record<OfferType, string> = {
  AUDIT: 'Audit',
  SYSTEM_BUILD: 'System Build',
  DWY: 'DWY',
  DFY: 'DFY',
}

function getLast12Months(): { label: string; value: string }[] {
  const months: { label: string; value: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    months.push({ label, value })
  }
  return months
}

const MONTHS = getLast12Months()

const emptyForm = () => ({
  clientId: '',
  offerType: 'AUDIT' as OfferType,
  revenueType: 'PROJECT' as RevenueType,
  amount: '',
  currency: 'USD' as Currency,
  dateReceived: new Date().toISOString().slice(0, 10),
  invoiceNumber: '',
  isRecurring: false,
  notes: '',
})

export function Revenue() {
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const { clients, fetch: fetchClients } = useClientStore()

  const loadRevenue = async (month: string) => {
    setLoading(true)
    const res = await get<RevenueEntry[]>('/revenue', { month })
    if (res.data) setEntries(res.data)
    setLoading(false)
  }

  useEffect(() => {
    loadRevenue(selectedMonth)
    fetchClients()
  }, [fetchClients])

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    loadRevenue(month)
  }

  // Metrics
  const mrr = entries.filter((e) => e.revenueType === 'MRR').reduce((s, e) => s + e.amountUsd, 0)
  const projectRev = entries.filter((e) => e.revenueType === 'PROJECT').reduce((s, e) => s + e.amountUsd, 0)
  const total = mrr + projectRev

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      clientId: form.clientId || null,
      offerType: form.offerType,
      revenueType: form.revenueType,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      dateReceived: form.dateReceived,
      invoiceNumber: form.invoiceNumber || null,
      isRecurring: form.isRecurring,
      notes: form.notes || null,
    }
    const res = await post<RevenueEntry>('/revenue', payload)
    if (res.data) {
      // Reload the current month to get accurate data
      await loadRevenue(selectedMonth)
      setShowModal(false)
      setForm(emptyForm())
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this revenue entry?')) return
    await del(`/revenue/${id}`)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Revenue</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {entries.length} entries this period
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="select"
            style={{ width: 200 }}
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            Log Revenue
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card amber">
          <div className="metric-label">MRR</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(mrr)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
            <span className="currency-pkr">₨{(mrr * 278.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div className="metric-card navy">
          <div className="metric-label">Project Revenue</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(projectRev)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
            <span className="currency-pkr">₨{(projectRev * 278.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">Total</div>
          <div className="metric-value" style={{ fontSize: 24, marginTop: 6 }}>
            <span className="currency-usd">{fmt(total)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
            <span className="currency-pkr">₨{(total * 278.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {loading && <div className="loading-state">Loading...</div>}

      {/* Table */}
      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Offer Type</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Invoice #</th>
                <th>Recurring</th>
                <th>Notes</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                    No revenue entries for this period.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {entry.client?.fullName ?? <span style={{ color: 'var(--color-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
                      {OFFER_LABELS[entry.offerType]}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        color: entry.revenueType === 'MRR' ? 'var(--color-amber)' : '#1a6fd8',
                        borderColor: entry.revenueType === 'MRR' ? 'var(--color-amber)' : '#1a6fd8',
                      }}
                    >
                      {entry.revenueType}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Roboto Condensed, sans-serif' }}>
                      <span className="currency-usd">{fmt(entry.amountUsd)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      <span className="currency-pkr">₨{entry.amountPkr.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {new Date(entry.dateReceived).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {entry.invoiceNumber ?? '—'}
                  </td>
                  <td>
                    {entry.isRecurring ? (
                      <span className="status-pill" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>Recurring</span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.notes ?? '—'}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(entry.id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setForm(emptyForm()) }}>
          <div className="modal" style={{ width: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Log Revenue</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => { setShowModal(false); setForm(emptyForm()) }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Client</label>
                    <select className="select" value={form.clientId} onChange={(e) => setField('clientId', e.target.value)}>
                      <option value="">No client / Direct</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Offer Type *</label>
                    <select className="select" value={form.offerType} onChange={(e) => setField('offerType', e.target.value as OfferType)}>
                      {(Object.keys(OFFER_LABELS) as OfferType[]).map((t) => (
                        <option key={t} value={t}>{OFFER_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Revenue Type *</label>
                    <select className="select" value={form.revenueType} onChange={(e) => setField('revenueType', e.target.value as RevenueType)}>
                      <option value="MRR">MRR (Monthly Recurring)</option>
                      <option value="PROJECT">Project (One-time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select className="select" value={form.currency} onChange={(e) => setField('currency', e.target.value as Currency)}>
                      <option value="USD">USD</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                    <label className="label">Date Received *</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={form.dateReceived}
                      onChange={(e) => setField('dateReceived', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Invoice Number</label>
                  <input
                    className="input"
                    value={form.invoiceNumber}
                    onChange={(e) => setField('invoiceNumber', e.target.value)}
                    placeholder="INV-001"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={form.isRecurring}
                    onChange={(e) => setField('isRecurring', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="isRecurring" style={{ fontSize: 13, cursor: 'pointer' }}>
                    Recurring revenue (repeats monthly)
                  </label>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    rows={2}
                    placeholder="Payment notes, context..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => { setShowModal(false); setForm(emptyForm()) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Log Revenue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
