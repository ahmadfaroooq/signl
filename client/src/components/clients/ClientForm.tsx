import { useState } from 'react'
import type { Client, OfferType, ClientStatus, Currency } from '../../types'
import { MoneyInput } from '../shared/MoneyInput'

interface ClientFormProps {
  initial?: Partial<Client>
  onSubmit: (data: Partial<Client>) => Promise<void>
  onCancel: () => void
}

const OFFER_TYPES: OfferType[] = ['AUDIT', 'SYSTEM_BUILD', 'DWY', 'DFY']
const STATUSES: ClientStatus[] = ['PROSPECT', 'PROPOSAL_SENT', 'CONTRACT_SIGNED', 'ACTIVE', 'PAUSED', 'COMPLETE', 'CHURNED']
const OFFER_LABELS: Record<OfferType, string> = { AUDIT: 'Audit', SYSTEM_BUILD: 'System Build', DWY: 'Done With You', DFY: 'Done For You' }
const STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: 'Prospect', PROPOSAL_SENT: 'Proposal Sent', CONTRACT_SIGNED: 'Contract Signed',
  ACTIVE: 'Active', PAUSED: 'Paused', COMPLETE: 'Complete', CHURNED: 'Churned',
}

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? '',
    company: initial?.company ?? '',
    email: initial?.email ?? '',
    linkedinUrl: initial?.linkedinUrl ?? '',
    whatsapp: initial?.whatsapp ?? '',
    offerType: initial?.offerType ?? 'AUDIT' as OfferType,
    status: initial?.status ?? 'PROSPECT' as ClientStatus,
    startDate: initial?.startDate?.slice(0, 10) ?? '',
    endDate: initial?.endDate?.slice(0, 10) ?? '',
    contractValueAmount: initial?.contractValueAmount?.toString() ?? '',
    contractValueCurrency: initial?.contractValueCurrency ?? 'USD' as Currency,
    referralPotential: initial?.referralPotential ?? 'UNKNOWN',
    notes: initial?.notes ?? '',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      fullName: form.fullName,
      company: form.company || undefined,
      email: form.email,
      linkedinUrl: form.linkedinUrl || undefined,
      whatsapp: form.whatsapp || undefined,
      offerType: form.offerType,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      contractValueAmount: form.contractValueAmount ? Number(form.contractValueAmount) : undefined,
      contractValueCurrency: form.contractValueCurrency,
      referralPotential: form.referralPotential as Client['referralPotential'],
      notes: form.notes || undefined,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label className="label">Full Name *</label>
          <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
        </div>

        <div>
          <label className="label">Company</label>
          <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} />
        </div>

        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>

        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" type="url" value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} />
        </div>

        <div>
          <label className="label">WhatsApp</label>
          <input className="input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        </div>

        <div>
          <label className="label">Offer Type *</label>
          <select className="select" value={form.offerType} onChange={(e) => set('offerType', e.target.value)}>
            {OFFER_TYPES.map((t) => <option key={t} value={t}>{OFFER_LABELS[t]}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Start Date</label>
          <input className="input" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </div>

        <div>
          <label className="label">End Date</label>
          <input className="input" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <MoneyInput
            label="Contract Value"
            value={form.contractValueAmount}
            currency={form.contractValueCurrency}
            onChange={(v, c) => setForm((f) => ({ ...f, contractValueAmount: v, contractValueCurrency: c }))}
          />
        </div>

        <div>
          <label className="label">Referral Potential</label>
          <select className="select" value={form.referralPotential} onChange={(e) => set('referralPotential', e.target.value)}>
            {['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].map((v) => (
              <option key={v} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className="label">Notes</label>
          <textarea
            className="input"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </form>
  )
}
