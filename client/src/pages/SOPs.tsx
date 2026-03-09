import { useState, useEffect } from 'react'
import { useSopStore } from '../stores/sopStore'
import { useClientStore } from '../stores/clientStore'
import type { SopInstance, SopTemplate, ProjectTask, SopTaskStatus } from '../types'

const STATUS_ORDER: SopTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED', 'SKIPPED']

function nextStatus(current: SopTaskStatus): SopTaskStatus {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

function TaskStatusPill({ status }: { status: SopTaskStatus }) {
  const map: Record<SopTaskStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: '#888888' },
    IN_PROGRESS: { label: 'In Progress', color: '#F5A623' },
    COMPLETE: { label: 'Complete', color: '#2D7D46' },
    BLOCKED: { label: 'Blocked', color: '#D0021B' },
    SKIPPED: { label: 'Skipped', color: '#AAAAAA' },
  }
  const { label, color } = map[status] ?? map.PENDING
  return (
    <span
      className="status-pill"
      style={{ color, borderColor: color, cursor: 'pointer' }}
    >
      {label}
    </span>
  )
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888888', marginBottom: 4 }}>
        <span>{value} / {total} tasks</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ProjectCard({
  instance,
  onExpand,
  expanded,
  tasks,
  onTaskClick,
  loadingTasks,
}: {
  instance: SopInstance
  onExpand: (id: string) => void
  expanded: boolean
  tasks: ProjectTask[]
  onTaskClick: (task: ProjectTask) => void
  loadingTasks: boolean
}) {
  const completedCount = instance.tasks.filter((t) => t.status === 'COMPLETE').length
  const totalCount = instance.tasks.length

  const grouped: Record<string, ProjectTask[]> = {}
  for (const t of tasks) {
    if (!grouped[t.phase]) grouped[t.phase] = []
    grouped[t.phase].push(t)
  }

  return (
    <div className="card" style={{ marginBottom: 1, padding: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 16px',
          cursor: 'pointer',
        }}
        onClick={() => onExpand(instance.id)}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, color: '#888888', flexShrink: 0 }}
        >
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13 }}>
            {instance.template?.name ?? 'Unknown Template'}
          </p>
          <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
            Started {new Date(instance.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ minWidth: 180 }}>
          <ProgressBar value={completedCount} total={totalCount} />
        </div>
        <span
          className="status-pill"
          style={{
            color: instance.completedAt ? '#2D7D46' : '#F5A623',
            borderColor: instance.completedAt ? '#2D7D46' : '#F5A623',
            flexShrink: 0,
          }}
        >
          {instance.completedAt ? 'Complete' : 'Active'}
        </span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #E2E2E2' }}>
          {loadingTasks ? (
            <p style={{ padding: '16px', fontSize: 13, color: '#888888' }}>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p style={{ padding: '16px', fontSize: 13, color: '#888888' }}>No tasks found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([phase, phaseTasks]) =>
                  phaseTasks.map((task, i) => (
                    <tr key={task.id}>
                      {i === 0 && (
                        <td
                          rowSpan={phaseTasks.length}
                          style={{
                            fontWeight: 700,
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#888888',
                            verticalAlign: 'top',
                            paddingTop: 12,
                            borderRight: '1px solid #E2E2E2',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {phase}
                        </td>
                      )}
                      <td style={{ fontSize: 13 }}>{task.title}</td>
                      <td>
                        <span onClick={(e) => { e.stopPropagation(); onTaskClick(task) }}>
                          <TaskStatusPill status={task.status} />
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#888888' }}>
                        {task.assignee?.name ?? task.assignedTo ?? '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#888888' }}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template }: { template: SopTemplate }) {
  const [expanded, setExpanded] = useState(false)

  const offerColors: Record<string, string> = {
    AUDIT: '#888888',
    SYSTEM_BUILD: '#1a6fd8',
    DWY: '#F5A623',
    DFY: '#2D7D46',
  }

  return (
    <div className="card" style={{ marginBottom: 1, padding: 0 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#888888' }}>
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 13 }}>{template.name}</p>
          {template.description && (
            <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{template.description}</p>
          )}
        </div>
        <span
          className="status-pill"
          style={{
            color: offerColors[template.offerType] ?? '#888888',
            borderColor: offerColors[template.offerType] ?? '#888888',
          }}
        >
          {template.offerType}
        </span>
        <span style={{ fontSize: 12, color: '#888888' }}>{template.tasks.length} tasks</span>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #E2E2E2' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th>Task</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {template.tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontSize: 11, color: '#888888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {task.phase}
                  </td>
                  <td style={{ fontSize: 13 }}>{task.title}</td>
                  <td style={{ fontSize: 12, color: '#888888' }}>{task.order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function SOPs() {
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [taskMap, setTaskMap] = useState<Record<string, ProjectTask[]>>({})
  const [showNewProject, setShowNewProject] = useState(false)
  const [newClientId, setNewClientId] = useState('')
  const [newTemplateId, setNewTemplateId] = useState('')
  const [saving, setSaving] = useState(false)

  const { templates, instances, tasks, loading, fetchTemplates, fetchInstances, createInstance, fetchTasks, updateTask } = useSopStore()
  const { clients, fetch: fetchClients } = useClientStore()

  useEffect(() => {
    fetchTemplates()
    fetchInstances()
    fetchClients()
  }, [])

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!taskMap[id]) {
      setLoadingTasks(true)
      await fetchTasks(id)
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    if (expandedId && tasks.length > 0) {
      setTaskMap((prev) => ({ ...prev, [expandedId]: tasks }))
    }
  }, [tasks, expandedId])

  const handleTaskClick = async (task: ProjectTask) => {
    const next = nextStatus(task.status)
    await updateTask(task.id, { status: next })
    if (expandedId) {
      setTaskMap((prev) => ({
        ...prev,
        [expandedId]: (prev[expandedId] ?? []).map((t) =>
          t.id === task.id ? { ...t, status: next } : t
        ),
      }))
    }
  }

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientId || !newTemplateId) return
    setSaving(true)
    await createInstance({ clientId: newClientId, templateId: newTemplateId })
    setSaving(false)
    setShowNewProject(false)
    setNewClientId('')
    setNewTemplateId('')
  }

  const getTasksForInstance = (id: string): ProjectTask[] => taskMap[id] ?? []

  return (
    <div style={{ padding: '24px', background: '#F7F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Project Manager</h1>
          <p style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>
            {instances.length} active projects · {templates.length} templates
          </p>
        </div>
        {activeTab === 'projects' && (
          <button className="btn btn-amber" onClick={() => setShowNewProject(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            Start New Project
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid #E2E2E2' }}>
        {(['projects', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #F5A623' : '2px solid transparent',
              color: activeTab === tab ? '#0D1117' : '#888888',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab === 'projects' ? 'Active Projects' : 'SOP Templates'}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: '#888888', fontSize: 13 }}>Loading...</p>
      )}

      {/* Active Projects Tab */}
      {!loading && activeTab === 'projects' && (
        <div>
          {instances.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
                folder_open
              </span>
              No active projects. Start a new one.
            </div>
          ) : (
            instances.map((inst) => (
              <ProjectCard
                key={inst.id}
                instance={inst}
                onExpand={handleExpand}
                expanded={expandedId === inst.id}
                tasks={getTasksForInstance(inst.id)}
                onTaskClick={handleTaskClick}
                loadingTasks={loadingTasks && expandedId === inst.id}
              />
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {!loading && activeTab === 'templates' && (
        <div>
          {templates.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888888' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
                description
              </span>
              No templates found.
            </div>
          ) : (
            templates.map((tpl) => <TemplateCard key={tpl.id} template={tpl} />)
          )}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
          <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Start New Project</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => setShowNewProject(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleCreateInstance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Client *</label>
                  <select
                    className="select"
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    required
                  >
                    <option value="">Select client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}{c.company ? ` — ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">SOP Template *</label>
                  <select
                    className="select"
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                    required
                  >
                    <option value="">Select template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.offerType}) — {t.tasks.length} tasks
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowNewProject(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-amber"
                  disabled={saving || !newClientId || !newTemplateId}
                >
                  {saving ? 'Starting...' : 'Start Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
