import { useState, useEffect } from 'react'
import { useContentStore } from '../stores/contentStore'
import type { ContentPost, PostType, PostStatus } from '../types'

const POST_TYPES: PostType[] = ['AUTHORITY', 'ENGAGEMENT', 'CONVERSION', 'PERSONAL']
const POST_STATUSES: PostStatus[] = ['IDEA', 'DRAFT', 'READY', 'PUBLISHED', 'SKIPPED']

const TYPE_COLORS: Record<PostType, string> = {
  AUTHORITY: '#0D1117',
  ENGAGEMENT: '#1a6fd8',
  CONVERSION: '#F5A623',
  PERSONAL: '#2D7D46',
}

const STATUS_COLORS: Record<PostStatus, string> = {
  IDEA: '#888888',
  DRAFT: '#F5A623',
  READY: '#1a6fd8',
  PUBLISHED: '#2D7D46',
  SKIPPED: '#AAAAAA',
}

function TypeBadge({ type }: { type: PostType }) {
  return (
    <span
      className="status-pill"
      style={{ color: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] }}
    >
      {type}
    </span>
  )
}

function StatusPillLocal({ status }: { status: PostStatus }) {
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
  hookDraft: string
  postType: PostType
  plannedDate: string
  status: PostStatus
  hasLeadMagnetCta: boolean
  notes: string
}

interface PublishForm {
  actualDate: string
  impressions: string
  engagementRate: string
  dmsGenerated: string
}

const defaultAddForm = (): AddForm => ({
  hookDraft: '',
  postType: 'AUTHORITY',
  plannedDate: '',
  status: 'IDEA',
  hasLeadMagnetCta: false,
  notes: '',
})

const defaultPublishForm = (): PublishForm => ({
  actualDate: '',
  impressions: '',
  engagementRate: '',
  dmsGenerated: '',
})

export function Content() {
  const { posts, loading, fetch, create, update } = useContentStore()
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'ALL'>('ALL')
  const [monthFilter, setMonthFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<AddForm>(defaultAddForm())
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishId, setPublishId] = useState<string | null>(null)
  const [publishForm, setPublishForm] = useState<PublishForm>(defaultPublishForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch()
  }, [])

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisWeekStart = (() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  })()
  const thisWeekEnd = (() => {
    const d = new Date(thisWeekStart)
    d.setDate(d.getDate() + 6)
    return d.toISOString().split('T')[0]
  })()

  const publishedThisMonth = posts.filter(
    (p) => p.status === 'PUBLISHED' && p.actualDate && p.actualDate.startsWith(thisMonth)
  )
  const avgEngagement =
    publishedThisMonth.length > 0
      ? publishedThisMonth.reduce((sum, p) => sum + (p.engagementRate ?? 0), 0) /
        publishedThisMonth.length
      : 0
  const dmsThisMonth = publishedThisMonth.reduce((sum, p) => sum + (p.dmsGenerated ?? 0), 0)
  const plannedThisWeek = posts.filter(
    (p) =>
      p.plannedDate >= thisWeekStart && p.plannedDate <= thisWeekEnd
  )

  const typeCounts: Record<PostType, number> = { AUTHORITY: 0, ENGAGEMENT: 0, CONVERSION: 0, PERSONAL: 0 }
  for (const p of posts) {
    typeCounts[p.postType] = (typeCounts[p.postType] ?? 0) + 1
  }
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1)

  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (monthFilter && !p.plannedDate.startsWith(monthFilter)) return false
    return true
  })

  const openAdd = () => {
    setEditingId(null)
    setAddForm(defaultAddForm())
    setShowAddModal(true)
  }

  const openEdit = (post: ContentPost) => {
    setEditingId(post.id)
    setAddForm({
      hookDraft: post.hookDraft,
      postType: post.postType,
      plannedDate: post.plannedDate,
      status: post.status,
      hasLeadMagnetCta: post.hasLeadMagnetCta,
      notes: post.notes ?? '',
    })
    setShowAddModal(true)
  }

  const openPublish = (post: ContentPost) => {
    setPublishId(post.id)
    setPublishForm({
      actualDate: post.actualDate ?? '',
      impressions: post.impressions != null ? String(post.impressions) : '',
      engagementRate: post.engagementRate != null ? String(post.engagementRate) : '',
      dmsGenerated: post.dmsGenerated != null ? String(post.dmsGenerated) : '',
    })
    setShowPublishModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (editingId) {
      await update(editingId, {
        hookDraft: addForm.hookDraft,
        postType: addForm.postType,
        plannedDate: addForm.plannedDate,
        status: addForm.status,
        hasLeadMagnetCta: addForm.hasLeadMagnetCta,
        notes: addForm.notes || null,
      })
    } else {
      await create({
        hookDraft: addForm.hookDraft,
        postType: addForm.postType,
        plannedDate: addForm.plannedDate,
        status: addForm.status,
        hasLeadMagnetCta: addForm.hasLeadMagnetCta,
        notes: addForm.notes || null,
      })
    }
    setSaving(false)
    setShowAddModal(false)
  }

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publishId) return
    setSaving(true)
    await update(publishId, {
      status: 'PUBLISHED',
      actualDate: publishForm.actualDate || null,
      impressions: publishForm.impressions ? parseInt(publishForm.impressions) : null,
      engagementRate: publishForm.engagementRate ? parseFloat(publishForm.engagementRate) : null,
      dmsGenerated: publishForm.dmsGenerated ? parseInt(publishForm.dmsGenerated) : null,
    })
    setSaving(false)
    setShowPublishModal(false)
    setPublishId(null)
  }

  // Generate month options from posts
  const months = Array.from(new Set(posts.map((p) => p.plannedDate.slice(0, 7)))).sort().reverse()

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Content Calendar</h1>
          <p style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>
            {posts.length} total posts
          </p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Add Post
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card green">
          <p className="metric-label">Published This Month</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>{publishedThisMonth.length}</p>
        </div>
        <div className="metric-card amber">
          <p className="metric-label">Avg Engagement Rate</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>
            {avgEngagement.toFixed(1)}%
          </p>
        </div>
        <div className="metric-card navy">
          <p className="metric-label">DMs Generated</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>{dmsThisMonth}</p>
        </div>
        <div className="metric-card" style={{ borderLeft: '3px solid #1a6fd8' }}>
          <p className="metric-label">Planned This Week</p>
          <p className="metric-value" style={{ fontSize: 28, marginTop: 4 }}>{plannedThisWeek.length}</p>
        </div>
      </div>

      {/* Content Mix Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="metric-label" style={{ marginBottom: 12 }}>Content Mix</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {POST_TYPES.map((type) => {
            const count = typeCounts[type]
            const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 80,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: TYPE_COLORS[type],
                    flexShrink: 0,
                  }}
                >
                  {type}
                </span>
                <div style={{ flex: 1, height: 8, background: '#E2E2E2' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: 8,
                      background: TYPE_COLORS[type],
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {(['ALL', ...POST_STATUSES] as const).map((s) => (
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
        <select
          className="select"
          style={{ width: 160 }}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#888888', fontSize: 13 }}>Loading...</p>
      ) : filteredPosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
            article
          </span>
          No posts found.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hook</th>
                  <th>Type</th>
                  <th>Planned</th>
                  <th>Published</th>
                  <th>Status</th>
                  <th>Impressions</th>
                  <th>Eng %</th>
                  <th>DMs</th>
                  <th>CTA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 280 }}>
                      <span
                        style={{
                          fontSize: 13,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                        title={p.hookDraft}
                      >
                        {p.hookDraft.length > 60 ? p.hookDraft.slice(0, 60) + '…' : p.hookDraft}
                      </span>
                    </td>
                    <td><TypeBadge type={p.postType} /></td>
                    <td style={{ fontSize: 12, color: '#888888', whiteSpace: 'nowrap' }}>
                      {new Date(p.plannedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontSize: 12, color: '#888888', whiteSpace: 'nowrap' }}>
                      {p.actualDate
                        ? new Date(p.actualDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td><StatusPillLocal status={p.status} /></td>
                    <td style={{ fontSize: 12, textAlign: 'right' }}>
                      {p.impressions != null ? p.impressions.toLocaleString() : '—'}
                    </td>
                    <td style={{ fontSize: 12, textAlign: 'right' }}>
                      {p.engagementRate != null ? `${p.engagementRate.toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontSize: 12, textAlign: 'right' }}>
                      {p.dmsGenerated != null ? p.dmsGenerated : '—'}
                    </td>
                    <td>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16, color: p.hasLeadMagnetCta ? '#2D7D46' : '#E2E2E2' }}
                      >
                        {p.hasLeadMagnetCta ? 'check_circle' : 'remove_circle'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => openEdit(p)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                        </button>
                        {p.status !== 'PUBLISHED' && (
                          <button
                            className="btn btn-sm"
                            style={{ borderColor: '#2D7D46', color: '#2D7D46' }}
                            onClick={() => openPublish(p)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>publish</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>{editingId ? 'Edit Post' : 'Add Post'}</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Hook / Draft *</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={addForm.hookDraft}
                    onChange={(e) => setAddForm((p) => ({ ...p, hookDraft: e.target.value }))}
                    placeholder="Write your hook or post draft..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Post Type *</label>
                    <select
                      className="select"
                      value={addForm.postType}
                      onChange={(e) => setAddForm((p) => ({ ...p, postType: e.target.value as PostType }))}
                    >
                      {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="select"
                      value={addForm.status}
                      onChange={(e) => setAddForm((p) => ({ ...p, status: e.target.value as PostStatus }))}
                    >
                      {POST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Planned Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={addForm.plannedDate}
                    onChange={(e) => setAddForm((p) => ({ ...p, plannedDate: e.target.value }))}
                    required
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={addForm.hasLeadMagnetCta}
                    onChange={(e) => setAddForm((p) => ({ ...p, hasLeadMagnetCta: e.target.checked }))}
                  />
                  Has Lead Magnet CTA
                </label>
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
                <button type="submit" className="btn btn-amber" disabled={saving || !addForm.hookDraft || !addForm.plannedDate}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
          <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Mark as Published</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowPublishModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handlePublishSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Actual Publish Date</label>
                  <input
                    className="input"
                    type="date"
                    value={publishForm.actualDate}
                    onChange={(e) => setPublishForm((p) => ({ ...p, actualDate: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Impressions</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={publishForm.impressions}
                      onChange={(e) => setPublishForm((p) => ({ ...p, impressions: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">Engagement %</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.1"
                      max="100"
                      value={publishForm.engagementRate}
                      onChange={(e) => setPublishForm((p) => ({ ...p, engagementRate: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="label">DMs Generated</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={publishForm.dmsGenerated}
                      onChange={(e) => setPublishForm((p) => ({ ...p, dmsGenerated: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowPublishModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-amber" disabled={saving}>
                  {saving ? 'Saving...' : 'Mark Published'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
