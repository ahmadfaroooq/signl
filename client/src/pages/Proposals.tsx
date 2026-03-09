import { useEffect, useState } from 'react'
import { get, post, patch, del } from '../lib/api'
import { useClientStore } from '../stores/clientStore'
import type { Proposal, ProposalStatus, OfferType, Currency, LossReason } from '../types'

const fmt = (v: number) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STATUSES: ProposalStatus[] = ['DRAFT', 'SENT', 'IN_DISCUSSION', 'WON', 'LOST', 'GHOSTED']

const STATUS_COLORS: Record<ProposalStatus, string> = {
  DRAFT: 'var(--color-muted)',
  SENT: 'var(--color-amber)',
  IN_DISCUSSION: '#1a6fd8',
  WON: 'var(--color-green)',
  LOST: 'var(--color-red)',
  GHOSTED: 'var(--color-muted)',
}

const OFFER_LABELS: Record<OfferType, string> = {
  AUDIT: 'Audit',
  SYSTEM_BUILD: 'System Build',
  DWY: 'DWY',
  DFY: 'DFY',
}

const LOSS_REASONS: LossReason[] = ['PRICE', 'TIMING', 'COMPETITOR', 'NO_RESPONSE', 'BUDGET', 'OTHER']

function StatusPillLocal({ status }: { status: ProposalStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className="status-pill"
      style={{ color, borderColor: color, fontSize: 10 }}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

const emptyForm = () => ({
  prospectName: '',
  clientId: '',
  offerType: 'AUDIT' as OfferType,
  valueAmount: '',
  valueCurrency: 'USD' as Currency,
  dateSent: new Date().toISOString().slice(0, 10),
  followUpDate: '',
  status: 'DRAFT' as ProposalStatus,
  lossReason: '' as LossReason | '',
  notes: '',
})

export function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pipeline' | 'all'>('pipeline')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Proposal | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const { clients, fetch: fetchClients } = useClientStore()

  const loadProposals = async () => {
    setLoading(true)
    const res = await get<Proposal[]>('/proposals')
    if (res.data) setProposals(res.data)
    setLoading(false)
  }

  useEffect(() => {
    loadProposals()
    fetchClients()
  }, [fetchClients])

  // Stats
  const sent = proposals.filter((p) => p.status !== 'DRAFT')
  const won = proposals.filter((p) => p.status === 'WON')
  const winRate = sent.length > 0 ? Math.round((won.length / sent.length) * 100) : 0
  const pipeline = proposals.filter((p) => ['SENT', 'IN_DISCUSSION'].includes(p.status))
  const pipelineValue = pipeline.reduce((s, p) => s + p.valueUsd, 0)
  const avgDeal = won.length > 0 ? won.reduce((s, p) => s + p.valueUsd, 0) / won.length : 0

  const openModal = (p?: Proposal) => {
    if (p) {
      setEditTarget(p)
      setForm({
        prospectName: p.prospectName,
        clientId: p.clientId ?? '',
        offerType: p.offerType,
        valueAmount: String(p.valueAmount),
        valueCurrency: p.valueCurrency,
        dateSent: p.dateSent.slice(0, 10),
        followUpDate: p.followUpDate ? p.followUpDate.slice(0, 10) : '',
        status: p.status,
        lossReason: p.lossReason ?? '',
        notes: p.notes ?? '',
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
      prospectName: form.prospectName,
      clientId: form.clientId || null,
      offerType: form.offerType,
      valueAmount: parseFloat(form.valueAmount) || 0,
      valueCurrency: form.valueCurrency,
      dateSent: form.dateSent,
      followUpDate: form.followUpDate || null,
      status: form.status,
      lossReason: form.status === 'LOST' ? (form.lossReason || null) : null,
      notes: form.notes || null,
    }
    if (editTarget) {
      const res = await patch<Proposal>(`/proposals/${editTarget.id}`, payload)
      if (res.data) setProposals((prev) => prev.map((p) => (p.id === editTarget.id ? res.data! : p)))
    } else {
      const res = await post<Proposal>('/proposals', payload)
      if (res.data) setProposals((prev) => [res.data!, ...prev])
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this proposal?')) return
    await del(`/proposals/${id}`)
    setProposals((prev) => prev.filter((p) => p.id !== id))
  }

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Proposals</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {proposals.length} total · {won.length} won · {pipeline.length} active
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          New Proposal
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card amber">
          <div className="metric-label">Total Sent</div>
          <div className="metric-value" style={{ fontSize: 26, marginTop: 6 }}>{sent.length}</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">Win Rate</div>
          <div className="metric-value" style={{ fontSize: 26, marginTop: 6 }}>{winRate}%</div>
        </div>
        <div className="metric-card navy">
          <div className="metric-label">Pipeline Value</div>
          <div className="metric-value" style={{ fontSize: 22, marginTop: 6 }}>
            <span className="currency-usd">{fmt(pipelineValue)}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Deal Size</div>
          <div className="metric-value" style={{ fontSize: 22, marginTop: 6 }}>
            <span className="currency-usd">{fmt(avgDeal)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        {(['pipeline', 'all'] as const).map((t) => (
          <button
            key={t}
            className="btn btn-sm"
            style={{
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--color-amber)' : '2px solid transparent',
              borderRadius: 0,
              background: 'transparent',
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? 'var(--color-base)' : 'var(--color-muted)',
              paddingBottom: 10,
            }}
            onClick={() => setTab(t)}
          >
            {t === 'pipeline' ? 'Pipeline' : 'All'}
          </button>
        ))}
      </div>

      {loading && <div className="loading-state">Loading...</div>}

      {/* Pipeline Kanban */}
      {!loading && tab === 'pipeline' && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {STATUSES.map((status) => {
            const cols = proposals.filter((p) => p.status === status)
            return (
              <div key={status} className="kanban-column" style={{ minWidth: 200 }}>
                <div
                  style={{
                    padding: '8px 12px',
                    borderBottom: `2px solid ${STATUS_COLORS[status]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[status] }}>
                    {status.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: STATUS_COLORS[status],
                      color: '#fff',
                      padding: '1px 6px',
                      borderRadius: 2,
                    }}
                  >
                    {cols.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cols.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', padding: '16px 0' }}>
                      No proposals
                    </div>
                  )}
                  {cols.map((p) => (
                    <div
                      key={p.id}
                      className="kanban-card"
                      onClick={() => openModal(p)}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.prospectName}</div>
                      <div style={{ marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--color-muted)',
                            border: '1px solid var(--color-border)',
                            padding: '1px 5px',
                          }}
                        >
                          {OFFER_LABELS[p.offerType]}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Roboto Condensed, sans-serif' }}>
                        <span className="currency-usd">{fmt(p.valueUsd)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                        Sent {new Date(p.dateSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {p.followUpDate && (
                        <div style={{ fontSize: 11, color: 'var(--color-amber)', marginTop: 2 }}>
                          Follow-up {new Date(p.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* All Table */}
      {!loading && tab === 'all' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Offer Type</th>
                <th>Value</th>
                <th>Date Sent</th>
                <th>Follow Up</th>
                <th>Status</th>
                <th>Loss Reason</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                    No proposals yet.
                  </td>
                </tr>
              )}
              {proposals.map((p) => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => openModal(p)}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.prospectName}</div>
                    {p.client && <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{p.client.fullName}</div>}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
                      {OFFER_LABELS[p.offerType]}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Roboto Condensed, sans-serif' }}>
                      <span className="currency-usd">{fmt(p.valueUsd)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      <span className="currency-pkr">₨{p.valuePkr.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {new Date(p.dateSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: 12, color: p.followUpDate ? 'var(--color-amber)' : 'var(--color-muted)' }}>
                    {p.followUpDate
                      ? new Date(p.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td><StatusPillLocal status={p.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {p.lossReason ? p.lossReason.replace('_', ' ') : '—'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => openModal(p)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
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
          <div className="modal" style={{ width: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                {editTarget ? `Edit Proposal — ${editTarget.prospectName}` : 'New Proposal'}
              </h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={closeModal}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Prospect Name *</label>
                    <input
                      className="input"
                      required
                      value={form.prospectName}
                      onChange={(e) => setField('prospectName', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="label">Linked Client (optional)</label>
                    <select className="select" value={form.clientId} onChange={(e) => setField('clientId', e.target.value)}>
                      <option value="">None</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Offer Type *</label>
                    <select className="select" value={form.offerType} onChange={(e) => setField('offerType', e.target.value as OfferType)}>
                      {(Object.keys(OFFER_LABELS) as OfferType[]).map((t) => (
                        <option key={t} value={t}>{OFFER_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status *</label>
                    <select className="select" value={form.status} onChange={(e) => setField('status', e.target.value as ProposalStatus)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Value *</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.valueAmount}
                      onChange={(e) => setField('valueAmount', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select className="select" value={form.valueCurrency} onChange={(e) => setField('valueCurrency', e.target.value as Currency)}>
                      <option value="USD">USD</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Date Sent *</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={form.dateSent}
                      onChange={(e) => setField('dateSent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Follow-Up Date</label>
                    <input
                      className="input"
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) => setField('followUpDate', e.target.value)}
                    />
                  </div>
                </div>

                {form.status === 'LOST' && (
                  <div>
                    <label className="label">Loss Reason</label>
                    <select className="select" value={form.lossReason} onChange={(e) => setField('lossReason', e.target.value as LossReason)}>
                      <option value="">Select reason...</option>
                      {LOSS_REASONS.map((r) => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    rows={3}
                    placeholder="Context, objections, next steps..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
