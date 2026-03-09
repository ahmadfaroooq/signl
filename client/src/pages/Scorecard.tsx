import { useState, useEffect } from 'react'
import { useScorecardStore } from '../stores/scorecardStore'
import type { ScorecardEntry } from '../types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const QUESTIONS = [
  { key: 'q1' as const, label: 'Outreach consistency' },
  { key: 'q2' as const, label: 'Content quality' },
  { key: 'q3' as const, label: 'Client communication' },
  { key: 'q4' as const, label: 'Delivery speed' },
  { key: 'q5' as const, label: 'Financial discipline' },
  { key: 'q6' as const, label: 'Lead generation' },
  { key: 'q7' as const, label: 'Team management' },
  { key: 'q8' as const, label: 'Personal energy' },
  { key: 'q9' as const, label: 'Strategic clarity' },
  { key: 'q10' as const, label: 'Revenue momentum' },
]

type QKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'

function scoreColor(total: number): string {
  if (total < 35) return '#D0021B'
  if (total <= 45) return '#F5A623'
  return '#2D7D46'
}

function getWeekOf(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: '#E2E2E2' }}>
        <div style={{ width: `${pct}%`, height: 4, background: '#F5A623' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 12, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function Scorecard() {
  const { entries, trend, loading, fetch, create, fetchTrend } = useScorecardStore()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<Record<QKey, number>>({
    q1: 3, q2: 3, q3: 3, q4: 3, q5: 3,
    q6: 3, q7: 3, q8: 3, q9: 3, q10: 3,
  })
  const [modalNotes, setModalNotes] = useState('')

  useEffect(() => {
    fetch()
    fetchTrend()
  }, [])

  const currentWeek = getWeekOf(new Date())
  const alreadySubmitted = entries.some(
    (e) => getWeekOf(new Date(e.weekOf)) === currentWeek
  )

  const latest = entries[0] ?? null
  const recent12 = entries.slice(0, 12)

  const runningTotal = Object.values(scores).reduce((a, b) => a + b, 0)

  const setScore = (key: QKey, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    await create({
      weekOf: currentWeek,
      ...scores,
      totalScore: total,
      notes: modalNotes || null,
    })
    setSaving(false)
    setShowModal(false)
    setScores({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 })
    setModalNotes('')
  }

  const trendData = [...trend].reverse().map((e) => ({
    week: new Date(e.weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: e.totalScore,
  }))

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Scorecard</h1>
          <p style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>
            Weekly performance tracking · 10 questions · max 50
          </p>
        </div>
        <button
          className="btn btn-amber"
          onClick={() => setShowModal(true)}
          disabled={alreadySubmitted}
          style={{ opacity: alreadySubmitted ? 0.5 : 1, cursor: alreadySubmitted ? 'not-allowed' : 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>
          {alreadySubmitted ? 'Already Submitted' : 'Submit This Week'}
        </button>
      </div>

      {loading && <p style={{ color: '#888888', fontSize: 13 }}>Loading...</p>}

      {!loading && (
        <>
          {/* Current Week Card */}
          {latest && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, marginBottom: 20 }}>
              <div
                className="card"
                style={{
                  borderLeft: `3px solid ${scoreColor(latest.totalScore)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p className="metric-label">Latest Score</p>
                <p
                  className="metric-value"
                  style={{ fontSize: 48, color: scoreColor(latest.totalScore), marginTop: 4 }}
                >
                  {latest.totalScore}
                  <span style={{ fontSize: 20, color: '#888888' }}>/50</span>
                </p>
                <p style={{ fontSize: 11, color: '#888888', marginTop: 4 }}>
                  Week of {new Date(latest.weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {latest.notes && (
                  <p style={{ fontSize: 12, color: '#0D1117', marginTop: 8, fontStyle: 'italic' }}>
                    "{latest.notes}"
                  </p>
                )}
              </div>

              <div className="card">
                <p className="metric-label" style={{ marginBottom: 12 }}>Score Breakdown</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {QUESTIONS.map((q) => (
                    <div key={q.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888888', marginBottom: 3 }}>
                        <span>{q.label}</span>
                      </div>
                      <ScoreBar value={latest[q.key]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trend Chart */}
          {trendData.length > 1 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <p className="metric-label" style={{ marginBottom: 16 }}>12-Week Trend</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#888888' }} />
                  <YAxis domain={[0, 50]} tick={{ fontSize: 10, fill: '#888888' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E2E2',
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#F5A623"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#F5A623' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Submissions Table */}
          {recent12.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E2E2' }}>
                <p className="metric-label">Recent Submissions</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Week Of</th>
                      {QUESTIONS.map((q, i) => <th key={q.key}>Q{i + 1}</th>)}
                      <th>Total</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent12.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(e.weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        {QUESTIONS.map((q) => (
                          <td key={q.key} style={{ fontSize: 12, textAlign: 'center' }}>
                            {e[q.key]}
                          </td>
                        ))}
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: 14,
                              color: scoreColor(e.totalScore),
                            }}
                          >
                            {e.totalScore}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#888888', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.notes ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
                bar_chart
              </span>
              No scorecard submissions yet. Submit your first week.
            </div>
          )}
        </>
      )}

      {/* Submit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            style={{ width: 560, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                Submit This Week &mdash; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {QUESTIONS.map((q, i) => (
                  <div key={q.key}>
                    <label className="label">
                      Q{i + 1}: {q.label}
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label
                          key={n}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <input
                            type="radio"
                            name={q.key}
                            value={n}
                            checked={scores[q.key] === n}
                            onChange={() => setScore(q.key, n)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: scores[q.key] === n ? '#F5A623' : '#888888',
                            }}
                          >
                            {n}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Running Total */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px',
                    border: '1px solid #E2E2E2',
                    background: '#F7F5F0',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#888888' }}>Running Total: </span>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: 'Roboto Condensed, sans-serif',
                      color: scoreColor(runningTotal),
                    }}
                  >
                    {runningTotal}
                  </span>
                  <span style={{ fontSize: 14, color: '#888888' }}> / 50</span>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Reflections for this week..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-amber" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Scorecard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
