import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PDFDownloadLink as _PDFDownloadLink } from '@react-pdf/renderer'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDownloadLink = _PDFDownloadLink as any
import { get, post, patch, del } from '../lib/api'
import { useClientStore } from '../stores/clientStore'
import { useSettingsStore } from '../stores/settingsStore'
import { CONTRACT_TEMPLATES, populateTemplate } from '../lib/contractTemplates'
import { ContractPDF } from '../components/contracts/ContractPDF'
import { StatusPill } from '../components/shared/StatusPill'
import type { Contract, OfferType } from '../types'
import { offerTypeLabel } from '../lib/currency'
import { format } from 'date-fns'

const OFFER_TYPES: OfferType[] = ['AUDIT', 'SYSTEM_BUILD', 'DWY', 'DFY']

export function Contracts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true')
  const [selected, setSelected] = useState<Contract | null>(null)

  // Form state
  const [clientId, setClientId] = useState('')
  const [offerType, setOfferType] = useState<OfferType>('AUDIT')
  const [scopeNotes, setScopeNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { clients, fetch: fetchClients } = useClientStore()
  const { settings } = useSettingsStore()

  const fetchContracts = async () => {
    setLoading(true)
    const res = await get<Contract[]>('/contracts')
    if (res.data) setContracts(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchContracts()
    fetchClients()
  }, [fetchClients])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return
    setSaving(true)
    const res = await post<Contract>('/contracts', { clientId, offerType, scopeNotes })
    if (res.data) {
      setContracts((prev) => [res.data!, ...prev])
      setShowForm(false)
      setSearchParams({})
      setClientId('')
      setScopeNotes('')
    }
    setSaving(false)
  }

  const markSigned = async (contract: Contract) => {
    const res = await patch<Contract>(`/contracts/${contract.id}`, { signedAt: new Date().toISOString() })
    if (res.data) {
      setContracts((prev) => prev.map((c) => (c.id === contract.id ? res.data! : c)))
    }
  }

  const deleteContract = async (id: string) => {
    if (!confirm('Delete this contract?')) return
    await del(`/contracts/${id}`)
    setContracts((prev) => prev.filter((c) => c.id !== id))
  }

  const getPopulatedTemplate = (contract: Contract) => {
    const client = clients.find((c) => c.id === contract.clientId)
    const template = CONTRACT_TEMPLATES[contract.offerType]
    if (!template || !client || !settings) return null
    return populateTemplate(template, {
      DATE: format(new Date(contract.createdAt), 'MMMM d, yyyy'),
      CLIENT_NAME: client.fullName,
      CLIENT_COMPANY: client.company ? `, ${client.company}` : '',
      CONTRACT_VALUE: client.contractValueAmount
        ? `${client.contractValueCurrency ?? 'USD'} ${client.contractValueAmount.toLocaleString()}`
        : '[Contract Value]',
      BUSINESS_NAME: settings.businessName,
      START_DATE: client.startDate ? format(new Date(client.startDate), 'MMMM d, yyyy') : '[Start Date]',
    })
  }

  const selectedClient = clients.find((c) => c.id === (selected?.clientId ?? clientId))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Contracts</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {contracts.length} total · {contracts.filter((c) => c.signedAt).length} signed
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true) }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Generate Contract
        </button>
      </div>

      {/* Contracts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {loading && <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Loading...</p>}
        {!loading && contracts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>description</span>
            No contracts yet — generate your first contract.
          </div>
        )}

        {contracts.map((contract) => {
          const client = clients.find((c) => c.id === contract.clientId)
          const populated = getPopulatedTemplate(contract)
          const pdfFilename = `${client?.fullName?.replace(/\s+/g, '_') ?? 'Client'}_${contract.offerType}_Contract_${format(new Date(contract.createdAt), 'yyyy-MM-dd')}.pdf`

          return (
            <div
              key={contract.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 0,
                borderLeft: contract.signedAt ? '3px solid var(--color-green)' : '3px solid var(--color-border)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{client?.fullName ?? 'Unknown Client'}</p>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {offerTypeLabel(contract.offerType)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-muted)' }}>
                  <span>Created {format(new Date(contract.createdAt), 'MMM d, yyyy')}</span>
                  {contract.signedAt && (
                    <span style={{ color: 'var(--color-green)' }}>
                      ✓ Signed {format(new Date(contract.signedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                {contract.scopeNotes && (
                  <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, fontStyle: 'italic' }}>
                    {contract.scopeNotes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {!contract.signedAt && (
                  <button
                    className="btn btn-sm"
                    style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}
                    onClick={() => markSigned(contract)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>draw</span>
                    Mark Signed
                  </button>
                )}

                {populated && settings && client && (
                  <PDFDownloadLink
                    document={
                      <ContractPDF
                        template={populated}
                        clientName={client.fullName}
                        settings={settings}
                        scopeNotes={contract.scopeNotes ?? undefined}
                        signedAt={contract.signedAt ?? undefined}
                      />
                    }
                    fileName={pdfFilename}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ loading: pdfLoading }: { loading: boolean }) => (
                      <button className="btn btn-sm btn-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>download</span>
                        {pdfLoading ? 'Generating...' : 'Export PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteContract(contract.id)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Generate Contract Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setSearchParams({}) }}>
          <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generate Contract</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => { setShowForm(false); setSearchParams({}) }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Client *</label>
                  <select className="select" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                    <option value="">Select a client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Offer Type *</label>
                  <select className="select" value={offerType} onChange={(e) => setOfferType(e.target.value as OfferType)}>
                    {OFFER_TYPES.map((t) => <option key={t} value={t}>{offerTypeLabel(t)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Scope Notes / Customisation</label>
                  <textarea
                    className="input"
                    value={scopeNotes}
                    onChange={(e) => setScopeNotes(e.target.value)}
                    rows={4}
                    placeholder="Any additional scope details, custom terms, or notes..."
                    style={{ resize: 'vertical', fontFamily: 'JetBrains Mono, Courier New, monospace', fontSize: 12 }}
                  />
                </div>

                {/* Template preview */}
                {offerType && (
                  <div
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      padding: '10px 12px',
                    }}
                  >
                    <p className="metric-label" style={{ marginBottom: 6 }}>Template: {CONTRACT_TEMPLATES[offerType].name}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      {CONTRACT_TEMPLATES[offerType].sections.length} sections ·
                      Signature block included · Logo in PDF header
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => { setShowForm(false); setSearchParams({}) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !clientId}>
                  {saving ? 'Creating...' : 'Generate Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
