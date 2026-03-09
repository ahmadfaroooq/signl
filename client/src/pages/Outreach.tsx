import { useEffect, useState } from 'react'
import { get, post, patch, del } from '../lib/api'
import type { OutreachDm, OutreachComment, OutreachStats, MessageType, ResponseSentiment, CommentQuality } from '../types'

const MESSAGE_TYPES: MessageType[] = ['COLD', 'WARM', 'REFERRAL', 'FOLLOW_UP']
const SENTIMENTS: ResponseSentiment[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NO_REPLY']
const QUALITIES: CommentQuality[] = ['INSIGHT', 'QUESTION', 'VALIDATION']

const DM_TARGET = 10
const COMMENT_TARGET = 15

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  const color = value === 0 ? 'var(--color-red)' : pct >= 100 ? 'var(--color-green)' : 'var(--color-amber)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color }}>{value} / {target}</span>
        <span style={{ color: 'var(--color-muted)' }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color, height: 4 }}
        />
      </div>
    </div>
  )
}

const emptyDmForm = () => ({
  prospectName: '',
  linkedinUrl: '',
  messageType: 'COLD' as MessageType,
  dateSent: new Date().toISOString().slice(0, 10),
  notes: '',
})

const emptyCommentForm = () => ({
  targetAccount: '',
  postTopic: '',
  date: new Date().toISOString().slice(0, 10),
  commentQuality: 'INSIGHT' as CommentQuality,
  profileVisitReceived: false,
})

export function Outreach() {
  const [tab, setTab] = useState<'dms' | 'comments'>('dms')
  const [dms, setDms] = useState<OutreachDm[]>([])
  const [comments, setComments] = useState<OutreachComment[]>([])
  const [stats, setStats] = useState<OutreachStats | null>(null)
  const [loading, setLoading] = useState(true)

  // DM modal
  const [showDmModal, setShowDmModal] = useState(false)
  const [dmForm, setDmForm] = useState(emptyDmForm())
  const [savingDm, setSavingDm] = useState(false)

  // Sentiment modal (for marking response)
  const [sentimentTarget, setSentimentTarget] = useState<OutreachDm | null>(null)
  const [sentiment, setSentiment] = useState<ResponseSentiment>('POSITIVE')

  // Comment modal
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentForm, setCommentForm] = useState(emptyCommentForm())
  const [savingComment, setSavingComment] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    const [dmRes, cRes, sRes] = await Promise.all([
      get<OutreachDm[]>('/outreach/dms'),
      get<OutreachComment[]>('/outreach/comments'),
      get<OutreachStats>('/outreach/stats'),
    ])
    if (dmRes.data) setDms(dmRes.data)
    if (cRes.data) setComments(cRes.data)
    if (sRes.data) setStats(sRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  // DM actions
  const handleAddDm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDm(true)
    const res = await post<OutreachDm>('/outreach/dms', {
      ...dmForm,
      linkedinUrl: dmForm.linkedinUrl || null,
      notes: dmForm.notes || null,
    })
    if (res.data) setDms((prev) => [res.data!, ...prev])
    setSavingDm(false)
    setShowDmModal(false)
    setDmForm(emptyDmForm())
  }

  const handleMarkResponse = async () => {
    if (!sentimentTarget) return
    const res = await patch<OutreachDm>(`/outreach/dms/${sentimentTarget.id}`, {
      responseReceived: true,
      responseSentiment: sentiment,
    })
    if (res.data) setDms((prev) => prev.map((d) => (d.id === sentimentTarget.id ? res.data! : d)))
    setSentimentTarget(null)
  }

  const handleDeleteDm = async (id: string) => {
    if (!confirm('Delete this DM record?')) return
    await del(`/outreach/dms/${id}`)
    setDms((prev) => prev.filter((d) => d.id !== id))
  }

  // Comment actions
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingComment(true)
    const res = await post<OutreachComment>('/outreach/comments', commentForm)
    if (res.data) setComments((prev) => [res.data!, ...prev])
    setSavingComment(false)
    setShowCommentModal(false)
    setCommentForm(emptyCommentForm())
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Delete this comment record?')) return
    await del(`/outreach/comments/${id}`)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const sentimentColor = (s: ResponseSentiment | null) => {
    if (!s) return 'var(--color-muted)'
    return s === 'POSITIVE' ? 'var(--color-green)' : s === 'NEGATIVE' ? 'var(--color-red)' : 'var(--color-muted)'
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Outreach Tracker</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Daily targets · LinkedIn DMs & Comments
          </p>
        </div>
      </div>

      {/* Daily Targets + Week Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Daily Targets */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 12 }}>
            Daily Targets
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                DMs — <span style={{ color: 'var(--color-muted)' }}>Target: {DM_TARGET}/day</span>
              </div>
              <ProgressBar value={stats?.todayDms ?? 0} target={DM_TARGET} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Comments — <span style={{ color: 'var(--color-muted)' }}>Target: {COMMENT_TARGET}/day</span>
              </div>
              <ProgressBar value={stats?.todayComments ?? 0} target={COMMENT_TARGET} />
            </div>
          </div>
        </div>

        {/* Week Stats */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 12 }}>
            This Week
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="metric-label">DMs Sent</div>
              <div className="metric-value" style={{ fontSize: 24, marginTop: 4 }}>{stats?.weekDms ?? 0}</div>
            </div>
            <div>
              <div className="metric-label">Comments</div>
              <div className="metric-value" style={{ fontSize: 24, marginTop: 4 }}>{stats?.weekComments ?? 0}</div>
            </div>
            <div>
              <div className="metric-label">Response Rate</div>
              <div className="metric-value" style={{ fontSize: 24, marginTop: 4 }}>
                {stats ? Math.round(stats.responseRate * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="metric-label">Conversion</div>
              <div className="metric-value" style={{ fontSize: 24, marginTop: 4 }}>
                {stats ? Math.round(stats.conversionRate * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Action button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['dms', 'comments'] as const).map((t) => (
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
              {t === 'dms' ? `DMs (${dms.length})` : `Comments (${comments.length})`}
            </button>
          ))}
        </div>
        {tab === 'dms' ? (
          <button className="btn btn-primary btn-sm" style={{ marginBottom: 6 }} onClick={() => setShowDmModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
            Add DM
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" style={{ marginBottom: 6 }} onClick={() => setShowCommentModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
            Add Comment
          </button>
        )}
      </div>

      {loading && <div className="loading-state">Loading...</div>}

      {/* DMs Table */}
      {!loading && tab === 'dms' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Type</th>
                <th>Date</th>
                <th>Response</th>
                <th>Sentiment</th>
                <th>Converted</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {dms.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                    No DMs logged yet.
                  </td>
                </tr>
              )}
              {dms.map((dm) => (
                <tr key={dm.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{dm.prospectName}</div>
                    {dm.linkedinUrl && (
                      <a
                        href={dm.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 11, color: '#1a6fd8', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        LinkedIn
                      </a>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
                      {dm.messageType.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {new Date(dm.dateSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    {dm.responseReceived ? (
                      <span className="status-pill" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>Yes</span>
                    ) : (
                      <span className="status-pill" style={{ color: 'var(--color-muted)', borderColor: 'var(--color-muted)' }}>Waiting</span>
                    )}
                  </td>
                  <td>
                    {dm.responseSentiment ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: sentimentColor(dm.responseSentiment) }}>
                        {dm.responseSentiment}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    {dm.convertedToProposal ? (
                      <span className="status-pill" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>Yes</span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {!dm.responseReceived && (
                        <button
                          className="btn btn-sm"
                          style={{ borderColor: '#1a6fd8', color: '#1a6fd8' }}
                          onClick={() => { setSentimentTarget(dm); setSentiment('POSITIVE') }}
                          title="Mark response"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>reply</span>
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDm(dm.id)}>
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

      {/* Comments Table */}
      {!loading && tab === 'comments' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Post Topic</th>
                <th>Date</th>
                <th>Quality</th>
                <th>Profile Visit</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                    No comments logged yet.
                  </td>
                </tr>
              )}
              {comments.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{c.targetAccount}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-muted)' }}>{c.postTopic}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
                      {c.commentQuality}
                    </span>
                  </td>
                  <td>
                    {c.profileVisitReceived ? (
                      <span className="status-pill" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>Yes</span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteComment(c.id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add DM Modal */}
      {showDmModal && (
        <div className="modal-overlay" onClick={() => setShowDmModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Log DM</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowDmModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleAddDm}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Prospect Name *</label>
                    <input
                      className="input"
                      required
                      value={dmForm.prospectName}
                      onChange={(e) => setDmForm((f) => ({ ...f, prospectName: e.target.value }))}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="label">Message Type</label>
                    <select className="select" value={dmForm.messageType} onChange={(e) => setDmForm((f) => ({ ...f, messageType: e.target.value as MessageType }))}>
                      {MESSAGE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input
                    className="input"
                    type="url"
                    value={dmForm.linkedinUrl}
                    onChange={(e) => setDmForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="label">Date Sent *</label>
                  <input
                    className="input"
                    type="date"
                    required
                    value={dmForm.dateSent}
                    onChange={(e) => setDmForm((f) => ({ ...f, dateSent: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={dmForm.notes}
                    onChange={(e) => setDmForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Message summary, context..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowDmModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingDm}>
                  {savingDm ? 'Saving...' : 'Log DM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Response Modal */}
      {sentimentTarget && (
        <div className="modal-overlay" onClick={() => setSentimentTarget(null)}>
          <div className="modal" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Mark Response — {sentimentTarget.prospectName}</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setSentimentTarget(null)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Response Sentiment</label>
                <select className="select" value={sentiment} onChange={(e) => setSentiment(e.target.value as ResponseSentiment)}>
                  {SENTIMENTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setSentimentTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleMarkResponse}>Save Response</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Log Comment</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowCommentModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleAddComment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Target Account *</label>
                    <input
                      className="input"
                      required
                      value={commentForm.targetAccount}
                      onChange={(e) => setCommentForm((f) => ({ ...f, targetAccount: e.target.value }))}
                      placeholder="@handle or name"
                    />
                  </div>
                  <div>
                    <label className="label">Comment Quality</label>
                    <select className="select" value={commentForm.commentQuality} onChange={(e) => setCommentForm((f) => ({ ...f, commentQuality: e.target.value as CommentQuality }))}>
                      {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Post Topic *</label>
                  <input
                    className="input"
                    required
                    value={commentForm.postTopic}
                    onChange={(e) => setCommentForm((f) => ({ ...f, postTopic: e.target.value }))}
                    placeholder="What was the post about?"
                  />
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input
                    className="input"
                    type="date"
                    required
                    value={commentForm.date}
                    onChange={(e) => setCommentForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="profileVisit"
                    checked={commentForm.profileVisitReceived}
                    onChange={(e) => setCommentForm((f) => ({ ...f, profileVisitReceived: e.target.checked }))}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="profileVisit" style={{ fontSize: 13, cursor: 'pointer' }}>
                    Profile visit received from this account
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowCommentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingComment}>
                  {savingComment ? 'Saving...' : 'Log Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
