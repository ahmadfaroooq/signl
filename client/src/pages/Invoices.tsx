import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PDFDownloadLink as _PDFDownloadLink } from '@react-pdf/renderer'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDownloadLink = _PDFDownloadLink as any
import { get, post, patch, del } from '../lib/api'
import { useClientStore } from '../stores/clientStore'
import { useSettingsStore } from '../stores/settingsStore'
import { MoneyInput } from '../components/shared/MoneyInput'
import { StatusPill } from '../components/shared/StatusPill'
import { CurrencyDisplay } from '../components/shared/CurrencyDisplay'
import { InvoicePDF } from '../components/invoices/InvoicePDF'
import type { Invoice, LineItem, Currency } from '../types'
import { format } from 'date-fns'

interface LineItemRow {
  description: string
  amount: string
  currency: Currency
}

export function Invoices() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true')
  const [filterStatus, setFilterStatus] = useState('')

  // Form state
  const [clientId, setClientId] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [lineItems, setLineItems] = useState<LineItemRow[]>([{ description: '', amount: '', currency: 'USD' }])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { clients, fetch: fetchClients } = useClientStore()
  const { settings } = useSettingsStore()

  const fetchInvoices = async () => {
    setLoading(true)
    const res = await get<Invoice[]>('/invoices', filterStatus ? { status: filterStatus } : undefined)
    if (res.data) setInvoices(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [filterStatus, fetchClients])

  const addLineItem = () => setLineItems((prev) => [...prev, { description: '', amount: '', currency }])
  const removeLineItem = (i: number) => setLineItems((prev) => prev.filter((_, idx) => idx !== i))
  const updateLineItem = (i: number, key: keyof LineItemRow, value: string) =>
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: value } : item))

  const subtotal = lineItems.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !dueDate) return
    setSaving(true)

    const items: LineItem[] = lineItems
      .filter((i) => i.description && i.amount)
      .map((i) => ({ description: i.description, amount: parseFloat(i.amount), currency }))

    const res = await post<Invoice>('/invoices', { clientId, lineItems: items, currency, dueDate, notes })
    if (res.data) {
      setInvoices((prev) => [res.data!, ...prev])
      setShowForm(false)
      setSearchParams({})
      setClientId('')
      setLineItems([{ description: '', amount: '', currency: 'USD' }])
      setDueDate('')
      setNotes('')
    }
    setSaving(false)
  }

  const markSent = async (invoice: Invoice) => {
    const res = await patch<Invoice>(`/invoices/${invoice.id}`, { status: 'SENT' })
    if (res.data) setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? res.data! : i)))
  }

  const markPaid = async (invoice: Invoice) => {
    if (!confirm(`Mark ${invoice.invoiceNumber} as paid?`)) return
    const res = await patch<{ invoice: Invoice }>(`/invoices/${invoice.id}/mark-paid`, {
      paidDate: new Date().toISOString(),
    })
    if (res.data?.invoice) {
      setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? res.data!.invoice : i)))
    }
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    await del(`/invoices/${id}`)
    setInvoices((prev) => prev.filter((i) => i.id !== id))
  }

  const STATUS_FILTERS = ['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Invoices</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            {invoices.length} total ·{' '}
            <span style={{ color: 'var(--color-red)' }}>
              {invoices.filter((i) => i.status === 'OVERDUE').length} overdue
            </span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true) }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          New Invoice
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className="btn btn-sm"
            style={{
              background: filterStatus === s ? 'var(--color-base)' : 'transparent',
              color: filterStatus === s ? '#fff' : 'var(--color-muted)',
              borderColor: filterStatus === s ? 'var(--color-base)' : 'var(--color-border)',
            }}
            onClick={() => setFilterStatus(s)}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {loading && <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Loading...</p>}
        {!loading && invoices.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>receipt_long</span>
            No invoices found.
          </div>
        )}

        {invoices.map((inv) => {
          const isOverdue = inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueDate) < new Date()
          const borderColor = inv.status === 'PAID' ? 'var(--color-green)' : isOverdue ? 'var(--color-red)' : inv.status === 'SENT' ? '#1a6fd8' : 'var(--color-border)'

          const invForPdf: Invoice = {
            ...inv,
            client: inv.client,
          }

          const pdfFilename = `${inv.client?.fullName?.replace(/\s+/g, '_') ?? 'Client'}_${inv.invoiceNumber}.pdf`

          return (
            <div
              key={inv.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 0,
                borderLeft: `3px solid ${borderColor}`,
              }}
            >
              {/* Left — Invoice number + client */}
              <div style={{ width: 100, flexShrink: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Roboto Condensed, sans-serif' }}>
                  {inv.invoiceNumber}
                </p>
                <StatusPill status={isOverdue && inv.status === 'SENT' ? 'OVERDUE' : inv.status} />
              </div>

              {/* Client */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inv.client?.fullName ?? 'Unknown'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>{inv.client?.email}</p>
              </div>

              {/* Amount */}
              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 110 }}>
                <CurrencyDisplay amountUsd={inv.amountUsd} amountPkr={inv.amountPkr} usdSize="sm" />
              </div>

              {/* Dates */}
              <div style={{ flexShrink: 0, minWidth: 120, fontSize: 11, color: 'var(--color-muted)', textAlign: 'right' }}>
                <p>Due {format(new Date(inv.dueDate), 'MMM d, yyyy')}</p>
                {inv.paidDate && (
                  <p style={{ color: 'var(--color-green)' }}>
                    Paid {format(new Date(inv.paidDate), 'MMM d')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {inv.status === 'DRAFT' && (
                  <button className="btn btn-sm" onClick={() => markSent(inv)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>send</span>
                    Send
                  </button>
                )}
                {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                  <button
                    className="btn btn-sm"
                    style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}
                    onClick={() => markPaid(inv)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                    Mark Paid
                  </button>
                )}

                {settings && (
                  <PDFDownloadLink
                    document={<InvoicePDF invoice={invForPdf} settings={settings} />}
                    fileName={pdfFilename}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ loading: pdfLoading }: { loading: boolean }) => (
                      <button className="btn btn-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>download</span>
                        {pdfLoading ? '...' : 'PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}

                <button className="btn btn-sm btn-danger" onClick={() => deleteInvoice(inv.id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Invoice Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setSearchParams({}) }}>
          <div className="modal" style={{ width: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>New Invoice</h2>
              <button className="btn btn-sm" style={{ border: 'none', padding: 4 }} onClick={() => { setShowForm(false); setSearchParams({}) }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Client *</label>
                    <select className="select" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                      <option value="">Select client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Currency *</label>
                    <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                      <option value="USD">USD</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label className="label" style={{ margin: 0 }}>Line Items *</label>
                    <button type="button" className="btn btn-sm" onClick={addLineItem}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                      Add Line
                    </button>
                  </div>
                  {lineItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input
                        className="input"
                        style={{ flex: 2 }}
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                        required
                      />
                      <input
                        className="input"
                        style={{ flex: 1 }}
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateLineItem(i, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeLineItem(i)}
                          style={{ flexShrink: 0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>remove</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Subtotal preview */}
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Subtotal: </span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {currency} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label">Due Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Payment instructions, notes..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => { setShowForm(false); setSearchParams({}) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !clientId}>
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
