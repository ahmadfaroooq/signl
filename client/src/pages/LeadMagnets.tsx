import { useState, useEffect } from 'react'
import { useLeadMagnetStore } from '../stores/leadMagnetStore'
import { useClientStore } from '../stores/clientStore'
import type { LeadMagnet, MagnetType, MagnetStatus } from '../types'

const MAGNET_TYPES: MagnetType[] = ['CHECKLIST', 'MINI_GUIDE', 'TEMPLATE', 'SWIPE_FILE', 'CASE_STUDY']
const MAGNET_STATUSES: MagnetStatus[] = ['ACTIVE', 'PAUSED', 'RETIRED']

const TYPE_COLORS: Record<MagnetType, string> = {
  CHECKLIST: '#2D7D46',
  MINI_GUIDE: '#1a6fd8',
  TEMPLATE: '#F5A623',
  SWIPE_FILE: '#0D1117',
  CASE_STUDY: '#D0021B',
}

const STATUS_COLORS: Record<MagnetStatus, string> = {
  ACTIVE: '#2D7D46',
  PAUSED: '#F5A623',
  RETIRED: '#888888',
}

function TypeBadge({ type }: { type: MagnetType }) {
  return (
    <span
      className="status-pill"
      style={{ color: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] }}
    >
      {type.replace('_', ' ')}
    </span>
  )
}

function StatusBadge({ status }: { status: MagnetStatus }) {
  return (
    <span
      className="status-pill"
      style={{ color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] }}
    >
      {status}
    </span>
  )
}

interface AddForm {
  name: string
  type: MagnetType
  ownerType: 'SIGNL' | 'CLIENT'
  linkedClientId: string
  lastUpdated: string
  notes: string
}

interface EditForm {
  totalDownloads: string
  conversionToCallPct: string
  conversionToClientPct: string
  status: MagnetStatus
}

const defaultAddForm = (): AddForm => ({
  name: '',
  type: 'CHECKLIST',
  ownerType: 'SIGNL',
  linkedClientId: '',
  lastUpdated: new Date().toISOString().split('T')[0],
  notes: '',
})

const defaultEditForm = (): EditForm => ({
  totalDownloads: '',
  conversionToCallPct: '',
  conversionToClientPct: '',
  status: 'ACTIVE',
})

export function LeadMagnets() {
  const { magnets, loading, fetch, create, update } = useLeadMagnetStore()
  const { clients, fetch: fetchClients } = useClientStore()
  const [statusFilter, setStatusFilter] = useState<MagnetStatus | 'ALL'>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<AddForm>(defaultAddForm())
  const [editForm, setEditForm] = useState<EditForm>(defaultEditForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch()
    fetchClients()
  }, [])

  const totalDownloads = magnets.reduce((sum, m) => sum + m.totalDownloads, 0)
  const activeMagnets = magnets.filter((m) => m.status === 'ACTIVE')
  const magnetsWithConv = magnets.filter((m) => m.conversionToCallPct != null)
  const avgCallConv =
    magnetsWithConv.length > 0
      ? magnetsWithConv.reduce((sum, m) => sum + (m.conversionToCallPct ?? 0), 0) /
        magnetsWithConv.length
      : 0

  const filteredMagnets = magnets.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false
    return true
  })

  const openAdd = () => {
    setAddForm(defaultAddForm())
    setShowAddModal(true)
  }

  const openEdit = (magnet: LeadMagnet) => {
    setEditingId(magnet.id)
    setEditForm({
      totalDownloads: String(magnet.totalDownloads),
      conversionToCallPct: magnet.conversionToCallPct != null ? String(magnet.conversionToCallPct) : '',
      conversionToClientPct: magnet.conversionToClientPct != null ? String(magnet.conversionToClientPct) : '',
      status: magnet.status,
    })
    setShowEditModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await create({
      name: addForm.name,
      type: addForm.type,
      ownerType: addForm.ownerType,
      linkedClientId: addForm.linkedClientId || null,
      lastUpdated: addForm.lastUpdated,
      notes: addForm.notes || null,
      totalDownloads: 0,
      status: 'ACTIVE',
    })
    setSaving(false)
    setShowAddModal(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setSaving(true)
    await update(editingId, {
      totalDownloads: parseInt(editForm.totalDownloads) || 0,
      conversionToCallPct: editForm.conversionToCallPct ? parseFloat(editForm.conversionToCallPct) : null,
      conversionToClientPct: editForm.conversionToClientPct ? parseFloat(editForm.conversionToClientPct) : null,
      status: editForm.status,
    })
    setSaving(false)
    setShowEditModal(false)
    setEditingId(null)
  }

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Lead Magnets</h1>
          <p style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>
            {magnets.length} total magnets
          </p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Add Magnet
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card amber">
          <p className="metric-label">Total Downloads</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>
            {totalDownloads.toLocaleString()}
          </p>
        </div>
        <div className="metric-card green">
          <p className="metric-label">Avg Call Conversion</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>
            {avgCallConv.toFixed(1)}%
          </p>
        </div>
        <div className="metric-card navy">
          <p className="metric-label">Active Magnets</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>{activeMagnets.length}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {(['ALL', ...MAGNET_STATUSES] as const).map((s) => (
          <button
            key={s}
            className="btn btn-sm"
            style={{
              background: statusFilter === s ? '#0D1117' : 'transparent',
              color: statusFilter === s ? '#fff' : '#888888',
              borderColor: statusFilter === s ? '#0D1117' : '#E2E2E2',
            }}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#888888', fontSize: 13 }}>Loading...</p>
      ) : filteredMagnets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
            download
          </span>
          No lead magnets found.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Downloads</th>
                  <th>Call Conv %</th>
                  <th>Client Conv %</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMagnets.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>
                      {m.name}
                      {m.linkedClient && (
                        <span style={{ fontSize: 11, color: '#888888', fontWeight: 400, display: 'block' }}>
                          {m.linkedClient.fullName}
                        </span>
                      )}
                    </td>
                    <td><TypeBadge type={m.type} /></td>
                    <td>
                      <span
                        className="status-pill"
                        style={{
                          color: m.ownerType === 'SIGNL' ? '#0D1117' : '#1a6fd8',
                          borderColor: m.ownerType === 'SIGNL' ? '#0D1117' : '#1a6fd8',
                        }}
                      >
                        {m.ownerType}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Roboto Condensed, sans-serif', textAlign: 'right' }}>
                      {m.totalDownloads.toLocaleString()}
                    </td>
                    <td style={{ fontSize: 13, textAlign: 'right' }}>
                      {m.conversionToCallPct != null ? `${m.conversionToCallPct.toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontSize: 13, textAlign: 'right' }}>
                      {m.conversionToClientPct != null ? `${m.conversionToClientPct.toFixed(1)}%` : '—'}
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                    <td style={{ fontSize: 12, color: '#888888', whiteSpace: 'nowrap' }}>
                      {new Date(m.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => openEdit(m)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                        Update Stats
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Add Lead Magnet</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input"
                    value={addForm.name}
                    onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Lead magnet name"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Type *</label>
                    <select
                      className="select"
                      value={addForm.type}
                      onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value as MagnetType }))}
                    >
                      {MAGNET_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Owner *</label>
                    <select
                      className="select"
                      value={addForm.ownerType}
                      onChange={(e) => setAddForm((p) => ({ ...p, ownerType: e.target.value as 'SIGNL' | 'CLIENT' }))}
                    >
                      <option value="SIGNL">SIGNL</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Linked Client (optional)</label>
                  <select
                    className="select"
                    value={addForm.linkedClientId}
                    onChange={(e) => setAddForm((p) => ({ ...p, linkedClientId: e.target.value }))}
                  >
                    <option value="">None</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}{c.company ? ` — ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Last Updated</label>
                  <input
                    className="input"
                    type="date"
                    value={addForm.lastUpdated}
                    onChange={(e) => setAddForm((p) => ({ ...p, lastUpdated: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={addForm.notes}
                    onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any notes..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-amber" disabled={saving || !addForm.name}>
                  {saving ? 'Saving...' : 'Add Magnet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Stats Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Update Stats</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowEditModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as MagnetStatus }))}
                  >
                    {MAGNET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Total Downloads</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={editForm.totalDownloads}
                    onChange={(e) => setEditForm((p) => ({ ...p, totalDownloads: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Call Conv %</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editForm.conversionToCallPct}
                      onChange={(e) => setEditForm((p) => ({ ...p, conversionToCallPct: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="label">Client Conv %</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editForm.conversionToClientPct}
                      onChange={(e) => setEditForm((p) => ({ ...p, conversionToClientPct: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-amber" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Stats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
