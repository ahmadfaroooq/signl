import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useClientStore } from '../stores/clientStore'
import { useSettingsStore } from '../stores/settingsStore'
import { DataTable, Column } from '../components/shared/DataTable'
import { StatusPill } from '../components/shared/StatusPill'
import { CurrencyDisplay } from '../components/shared/CurrencyDisplay'
import { ClientKanban } from '../components/clients/ClientKanban'
import { ClientForm } from '../components/clients/ClientForm'
import type { Client } from '../types'
import { offerTypeLabel } from '../lib/currency'
import { format } from 'date-fns'

type View = 'list' | 'kanban'

export function Clients() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<View>('list')
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [search, setSearch] = useState('')

  const { clients, loading, fetch, create, update, remove } = useClientStore()
  const { settings } = useSettingsStore()
  const rate = settings ? Number(settings.usdPkrRate) : 278.5

  useEffect(() => {
    fetch()
  }, [fetch])

  const filtered = clients.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  })

  const columns: Column<Client>[] = [
    {
      key: 'fullName',
      label: 'Client',
      sortable: true,
      render: (c) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>{c.fullName}</p>
          {c.company && <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>{c.company}</p>}
        </div>
      ),
    },
    {
      key: 'offerType',
      label: 'Offer',
      render: (c) => (
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
          {offerTypeLabel(c.offerType)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c) => <StatusPill status={c.status} />,
    },
    {
      key: 'ltvUsd',
      label: 'LTV',
      sortable: true,
      render: (c) => (c.ltvUsd ?? 0) > 0
        ? <CurrencyDisplay amountUsd={c.ltvUsd ?? 0} amountPkr={(c.ltvUsd ?? 0) * rate} usdSize="sm" />
        : <span style={{ color: 'var(--color-muted)' }}>—</span>,
    },
    {
      key: 'startDate',
      label: 'Started',
      render: (c) => c.startDate
        ? <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{format(new Date(c.startDate), 'MMM d, yyyy')}</span>
        : <span style={{ color: 'var(--color-muted)' }}>—</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (c) => <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.email}</span>,
    },
    {
      key: 'id',
      label: '',
      width: '80px',
      render: (c) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-sm"
            onClick={(e) => { e.stopPropagation(); setSelectedClient(c); setShowModal(true) }}
            title="Edit"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${c.fullName}?`)) remove(c.id) }}
            title="Delete"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
          </button>
        </div>
      ),
    },
  ]

  const handleSubmit = async (data: Partial<Client>) => {
    if (selectedClient) {
      await update(selectedClient.id, data)
    } else {
      await create(data)
    }
    setShowModal(false)
    setSelectedClient(null)
    setSearchParams({})
  }

  const openNew = () => {
    setSelectedClient(null)
    setShowModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Clients</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {clients.length} total · {clients.filter((c) => c.status === 'ACTIVE').length} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--color-border)' }}>
            <button
              className="btn btn-sm"
              style={{
                border: 'none',
                background: view === 'list' ? 'var(--color-base)' : 'transparent',
                color: view === 'list' ? '#fff' : 'var(--color-muted)',
                borderRadius: 0,
              }}
              onClick={() => setView('list')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>table_rows</span>
            </button>
            <button
              className="btn btn-sm"
              style={{
                border: 'none',
                borderLeft: '1px solid var(--color-border)',
                background: view === 'kanban' ? 'var(--color-base)' : 'transparent',
                color: view === 'kanban' ? '#fff' : 'var(--color-muted)',
                borderRadius: 0,
              }}
              onClick={() => setView('kanban')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>view_kanban</span>
            </button>
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, color: 'var(--color-muted)', pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="card" style={{ padding: 0, borderRadius: 0 }}>
          <DataTable<Client>
            columns={columns}
            data={filtered as unknown as Client[] & Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No clients yet — add your first client."
            onRowClick={(c) => { setSelectedClient(c); setShowModal(true) }}
          />
        </div>
      ) : (
        <ClientKanban
          clients={filtered}
          onClientClick={(c) => { setSelectedClient(c); setShowModal(true) }}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedClient(null); setSearchParams({}) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                {selectedClient ? `Edit — ${selectedClient.fullName}` : 'Add New Client'}
              </h2>
              <button
                className="btn btn-sm"
                style={{ border: 'none', padding: 4 }}
                onClick={() => { setShowModal(false); setSelectedClient(null); setSearchParams({}) }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <ClientForm
              initial={selectedClient ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => { setShowModal(false); setSelectedClient(null); setSearchParams({}) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
