import type { Client, ClientStatus } from '../../types'
import { StatusPill } from '../shared/StatusPill'
import { CurrencyDisplay } from '../shared/CurrencyDisplay'
import { useSettingsStore } from '../../stores/settingsStore'
import { offerTypeLabel } from '../../lib/currency'

const PIPELINE_COLUMNS: { status: ClientStatus; label: string }[] = [
  { status: 'PROSPECT', label: 'Prospect' },
  { status: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { status: 'CONTRACT_SIGNED', label: 'Signed' },
  { status: 'ACTIVE', label: 'Active' },
  { status: 'PAUSED', label: 'Paused' },
  { status: 'COMPLETE', label: 'Complete' },
  { status: 'CHURNED', label: 'Churned' },
]

interface KanbanCardProps {
  client: Client
  onClick: () => void
  rate: number
}

function KanbanCard({ client, onClick, rate }: KanbanCardProps) {
  const ltvPkr = (client.ltvUsd ?? 0) * rate
  return (
    <div className="kanban-card" onClick={onClick}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{client.fullName}</p>
      {client.company && (
        <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>{client.company}</p>
      )}
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 8,
        }}
      >
        {offerTypeLabel(client.offerType)}
      </p>
      {(client.ltvUsd ?? 0) > 0 && (
        <CurrencyDisplay amountUsd={client.ltvUsd ?? 0} amountPkr={ltvPkr} usdSize="sm" />
      )}
    </div>
  )
}

interface ClientKanbanProps {
  clients: Client[]
  onClientClick: (client: Client) => void
}

export function ClientKanban({ clients, onClientClick }: ClientKanbanProps) {
  const { settings } = useSettingsStore()
  const rate = settings ? Number(settings.usdPkrRate) : 278.5

  return (
    <div style={{ display: 'flex', gap: 1, overflowX: 'auto', paddingBottom: 8 }}>
      {PIPELINE_COLUMNS.map((col) => {
        const colClients = clients.filter((c) => c.status === col.status)
        return (
          <div key={col.status} className="kanban-column">
            {/* Column header */}
            <div
              style={{
                padding: '8px 10px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span className="metric-label">{col.label}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-muted)',
                  background: 'var(--color-bg)',
                  padding: '1px 6px',
                  border: '1px solid var(--color-border)',
                }}
              >
                {colClients.length}
              </span>
            </div>

            {/* Cards */}
            <div
              style={{
                minHeight: 200,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {colClients.length === 0 ? (
                <div
                  style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    fontSize: 11,
                    color: 'var(--color-border)',
                  }}
                >
                  —
                </div>
              ) : (
                colClients.map((c) => (
                  <KanbanCard key={c.id} client={c} onClick={() => onClientClick(c)} rate={rate} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
