import { useState, useEffect } from 'react'
import { useTestimonialStore } from '../stores/testimonialStore'
import { useClientStore } from '../stores/clientStore'
import type { Testimonial, TestimonialFormat } from '../types'

const FORMATS: TestimonialFormat[] = ['TEXT', 'VIDEO', 'LINKEDIN_REC', 'VOICE_NOTE']
const THEMES = ['RESULTS', 'PROCESS', 'COMMUNICATION', 'ROI', 'SPEED']
const USED_IN_OPTIONS = ['PROPOSALS', 'CONTENT', 'WEBSITE', 'OUTREACH']

const FORMAT_COLORS: Record<TestimonialFormat, string> = {
  TEXT: '#0D1117',
  VIDEO: '#D0021B',
  LINKEDIN_REC: '#1a6fd8',
  VOICE_NOTE: '#F5A623',
}

const FORMAT_ICONS: Record<TestimonialFormat, string> = {
  TEXT: 'format_quote',
  VIDEO: 'videocam',
  LINKEDIN_REC: 'verified',
  VOICE_NOTE: 'mic',
}

function FormatBadge({ format }: { format: TestimonialFormat }) {
  return (
    <span
      className="status-pill"
      style={{ color: FORMAT_COLORS[format], borderColor: FORMAT_COLORS[format], display: 'inline-flex', alignItems: 'center', gap: 4 }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{FORMAT_ICONS[format]}</span>
      {format.replace('_', ' ')}
    </span>
  )
}

function ThemeBadge({ theme }: { theme: string }) {
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 600, padding: '2px 6px',
        border: '1px solid #E2E2E2', color: '#555', background: '#F7F5F0',
        display: 'inline-block', marginRight: 2, marginBottom: 2,
      }}
    >
      {theme}
    </span>
  )
}

const emptyForm = {
  clientId: '', rawQuote: '', format: 'TEXT' as TestimonialFormat,
  dateCollected: new Date().toISOString().split('T')[0],
  permissionToUse: false, themes: [] as string[], usedIn: [] as string[],
}

export function Testimonials() {
  const { testimonials, loading, fetch, create, update, remove } = useTestimonialStore()
  const { clients, fetch: fetchClients } = useClientStore()

  const [filterClient, setFilterClient] = useState('')
  const [filterFormat, setFilterFormat] = useState<TestimonialFormat | ''>('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [editedQuote, setEditedQuote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch(); fetchClients() }, [])

  const filtered = testimonials.filter(t => {
    if (filterClient && t.clientId !== filterClient) return false
    if (filterFormat && t.format !== filterFormat) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setEditedQuote('')
    setShowModal(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({
      clientId: t.clientId, rawQuote: t.rawQuote,
      format: t.format, dateCollected: t.dateCollected,
      permissionToUse: t.permissionToUse, themes: [...t.themes], usedIn: [...t.usedIn],
    })
    setEditedQuote(t.editedQuote || '')
    setShowModal(true)
  }

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await update(editing.id, {
          editedQuote: editedQuote || null,
          permissionToUse: form.permissionToUse,
          usedIn: form.usedIn,
          themes: form.themes,
        })
      } else {
        await create(form)
      }
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await remove(id)
  }

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0D1117' }}>Testimonials</h1>
          <p style={{ margin: '4px 0 0', color: '#888' }}>{testimonials.length} collected · {testimonials.filter(t => t.permissionToUse).length} approved for use</p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>
          <span className="material-symbols-outlined">add</span>
          Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="select"
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          style={{ minWidth: 180 }}
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 0, border: '1px solid #E2E2E2', background: '#fff' }}>
          <button
            className="btn"
            style={{ borderRadius: 0, border: 'none', borderRight: '1px solid #E2E2E2', background: filterFormat === '' ? '#0D1117' : '#fff', color: filterFormat === '' ? '#fff' : '#0D1117', padding: '6px 14px', fontSize: 13 }}
            onClick={() => setFilterFormat('')}
          >All</button>
          {FORMATS.map(f => (
            <button
              key={f}
              className="btn"
              style={{ borderRadius: 0, border: 'none', borderRight: '1px solid #E2E2E2', background: filterFormat === f ? '#0D1117' : '#fff', color: filterFormat === f ? '#fff' : '#0D1117', padding: '6px 14px', fontSize: 13 }}
              onClick={() => setFilterFormat(f)}
            >{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>Loading testimonials…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#E2E2E2', display: 'block', marginBottom: 8 }}>format_quote</span>
          <p style={{ color: '#888', margin: 0 }}>No testimonials yet. Add your first one.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Quote</th>
                <th>Format</th>
                <th>Date</th>
                <th>Permission</th>
                <th>Themes</th>
                <th>Used In</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t.client?.fullName || '—'}</td>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontSize: 13, color: '#0D1117', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{(t.editedQuote || t.rawQuote).substring(0, 80)}{(t.editedQuote || t.rawQuote).length > 80 ? '…' : ''}"
                    </div>
                  </td>
                  <td><FormatBadge format={t.format} /></td>
                  <td style={{ color: '#888', fontSize: 13 }}>{new Date(t.dateCollected).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style={{ textAlign: 'center' }}>
                    {t.permissionToUse ? (
                      <span className="material-symbols-outlined" style={{ color: '#2D7D46', fontSize: 20 }}>check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: '#F5A623', fontSize: 20 }}>help</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 160 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {t.themes.map(th => <ThemeBadge key={th} theme={th} />)}
                    </div>
                  </td>
                  <td style={{ maxWidth: 160 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {t.usedIn.map(u => <ThemeBadge key={u} theme={u} />)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => openEdit(t)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                      </button>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: 12, color: '#D0021B' }} onClick={() => handleDelete(t.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button className="btn" style={{ padding: '4px 8px' }} onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {!editing && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>CLIENT *</label>
                  <select className="select" style={{ width: '100%' }} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>RAW QUOTE *</label>
                <textarea
                  className="input"
                  style={{ width: '100%', height: 100, resize: 'vertical', fontFamily: 'inherit' }}
                  value={form.rawQuote}
                  onChange={e => setForm(f => ({ ...f, rawQuote: e.target.value }))}
                  placeholder="Paste the exact quote as received…"
                />
              </div>

              {editing && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>EDITED QUOTE (optional)</label>
                  <textarea
                    className="input"
                    style={{ width: '100%', height: 80, resize: 'vertical', fontFamily: 'inherit' }}
                    value={editedQuote}
                    onChange={e => setEditedQuote(e.target.value)}
                    placeholder="Cleaned up version for use in proposals/content…"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>FORMAT *</label>
                  <select className="select" style={{ width: '100%' }} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value as TestimonialFormat }))}>
                    {FORMATS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>DATE COLLECTED</label>
                  <input type="date" className="input" style={{ width: '100%' }} value={form.dateCollected} onChange={e => setForm(f => ({ ...f, dateCollected: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>THEMES</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {THEMES.map(th => (
                    <label key={th} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={form.themes.includes(th)} onChange={() => setForm(f => ({ ...f, themes: toggleArr(f.themes, th) }))} />
                      {th}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>USED IN</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {USED_IN_OPTIONS.map(u => (
                    <label key={u} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={form.usedIn.includes(u)} onChange={() => setForm(f => ({ ...f, usedIn: toggleArr(f.usedIn, u) }))} />
                      {u}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.permissionToUse} onChange={e => setForm(f => ({ ...f, permissionToUse: e.target.checked }))} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Permission to use in marketing materials</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-amber" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Testimonial')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
