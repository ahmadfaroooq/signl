import { useState, useEffect } from 'react'
import { useTeamStore } from '../stores/teamStore'
import type { TeamMember, TeamRole, EngagementType, Currency } from '../types'

const ROLE_COLORS: Record<TeamRole, string> = {
  DESIGNER: '#1a6fd8',
  WRITER: '#2D7D46',
  VA: '#F5A623',
  MANAGER: '#0D1117',
  OTHER: '#888888',
}

const ALL_SKILLS = ['DESIGN', 'COPYWRITING', 'ENGAGEMENT', 'OUTREACH', 'STRATEGY'] as const
type Skill = typeof ALL_SKILLS[number]

interface MemberForm {
  name: string
  role: TeamRole
  engagementType: EngagementType
  rate: string
  rateCurrency: Currency
  skills: Skill[]
  contractOnFile: boolean
  notes: string
  isActive: boolean
}

const defaultForm = (): MemberForm => ({
  name: '',
  role: 'VA',
  engagementType: 'PER_PROJECT',
  rate: '',
  rateCurrency: 'USD',
  skills: [],
  contractOnFile: false,
  notes: '',
  isActive: true,
})

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className="status-pill"
      style={{ color: ROLE_COLORS[role], borderColor: ROLE_COLORS[role] }}
    >
      {role}
    </span>
  )
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        border: '1px solid #E2E2E2',
        color: '#888888',
        marginRight: 4,
        marginBottom: 2,
      }}
    >
      {skill}
    </span>
  )
}

export function Team() {
  const { members, loading, fetch, create, update, remove } = useTeamStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MemberForm>(defaultForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch()
  }, [])

  const activeMembers = members.filter((m) => m.isActive)
  const totalPaidUsd = members.reduce((sum, m) => sum + (m.totalPaidUsd ?? 0), 0)

  const openAdd = () => {
    setEditingId(null)
    setForm(defaultForm())
    setShowModal(true)
  }

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id)
    setForm({
      name: member.name,
      role: member.role,
      engagementType: member.engagementType,
      rate: String(member.rate),
      rateCurrency: member.rateCurrency,
      skills: (member.skills ?? []) as Skill[],
      contractOnFile: member.contractOnFile,
      notes: member.notes ?? '',
      isActive: member.isActive,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(defaultForm())
  }

  const toggleSkill = (skill: Skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: Partial<TeamMember> = {
      name: form.name,
      role: form.role,
      engagementType: form.engagementType,
      rate: parseFloat(form.rate) || 0,
      rateCurrency: form.rateCurrency,
      skills: form.skills,
      contractOnFile: form.contractOnFile,
      notes: form.notes || null,
      isActive: form.isActive,
    }
    if (editingId) {
      await update(editingId, payload)
    } else {
      await create(payload)
    }
    setSaving(false)
    closeModal()
  }

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return
    await remove(id)
  }

  const handleToggleActive = async (member: TeamMember) => {
    await update(member.id, { isActive: !member.isActive })
  }

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Team</h1>
          <p style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>
            {members.length} total members
          </p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
          Add Member
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="metric-card amber">
          <p className="metric-label">Active Members</p>
          <p className="metric-value" style={{ fontSize: 32, marginTop: 4 }}>{activeMembers.length}</p>
        </div>
        <div className="metric-card green">
          <p className="metric-label">Total Paid This Month (USD)</p>
          <p className="metric-value" style={{ fontSize: 32, marginTop: 4 }}>
            ${totalPaidUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#888888', fontSize: 13 }}>Loading...</p>
      ) : members.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>group</span>
          No team members yet.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Engagement</th>
                <th>Rate</th>
                <th>Skills</th>
                <th>Contract</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ opacity: m.isActive ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</td>
                  <td><RoleBadge role={m.role} /></td>
                  <td style={{ fontSize: 12, color: '#888888' }}>
                    {m.engagementType === 'PER_PROJECT' ? 'Per Project' : 'Monthly Retainer'}
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Roboto Condensed, sans-serif' }}>
                    {m.rateCurrency === 'USD'
                      ? `$${m.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `PKR ${m.rate.toLocaleString('en-US')}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {(m.skills ?? []).map((s) => <SkillBadge key={s} skill={s} />)}
                    </div>
                  </td>
                  <td>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: m.contractOnFile ? '#2D7D46' : '#E2E2E2' }}>
                      {m.contractOnFile ? 'check_circle' : 'cancel'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        borderColor: m.isActive ? '#2D7D46' : '#E2E2E2',
                        color: m.isActive ? '#2D7D46' : '#888888',
                      }}
                      onClick={() => handleToggleActive(m)}
                    >
                      {m.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => openEdit(m)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleRemove(m.id, m.name)}>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                {editingId ? 'Edit Member' : 'Add Member'}
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
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Full name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Role *</label>
                    <select
                      className="select"
                      value={form.role}
                      onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as TeamRole }))}
                    >
                      {(['DESIGNER', 'WRITER', 'VA', 'MANAGER', 'OTHER'] as TeamRole[]).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Engagement Type *</label>
                    <select
                      className="select"
                      value={form.engagementType}
                      onChange={(e) => setForm((p) => ({ ...p, engagementType: e.target.value as EngagementType }))}
                    >
                      <option value="PER_PROJECT">Per Project</option>
                      <option value="MONTHLY_RETAINER">Monthly Retainer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Rate *</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.rate}
                      onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select
                      className="select"
                      value={form.rateCurrency}
                      onChange={(e) => setForm((p) => ({ ...p, rateCurrency: e.target.value as Currency }))}
                    >
                      <option value="USD">USD</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Skills</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {ALL_SKILLS.map((skill) => (
                      <label
                        key={skill}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}
                      >
                        <input
                          type="checkbox"
                          checked={form.skills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={form.contractOnFile}
                      onChange={(e) => setForm((p) => ({ ...p, contractOnFile: e.target.checked }))}
                    />
                    Contract On File
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any notes..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-amber" disabled={saving || !form.name}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
