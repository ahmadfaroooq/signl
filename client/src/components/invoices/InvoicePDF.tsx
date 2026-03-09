import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { Invoice, Settings, LineItem } from '../../types'
import { formatUsd, formatPkr } from '../../lib/currency'
import { format } from 'date-fns'

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

const S = StyleSheet.create({
  page: { padding: 56, fontFamily: 'Inter', fontSize: 10, color: '#0D1117', backgroundColor: '#F7F5F0', lineHeight: 1.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 20, borderBottom: '1px solid #E2E2E2' },
  logoText: { fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#0D1117', letterSpacing: 2 },
  tagline: { fontSize: 8, color: '#888888', marginTop: 2 },
  invLabel: { fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#888888', marginBottom: 2 },
  invNumber: { fontSize: 22, fontWeight: 700, color: '#0D1117' },
  statusBadge: { fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', padding: '3 8', border: '1px solid #2D7D46', color: '#2D7D46', marginTop: 4, alignSelf: 'flex-start' },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  sectionBlock: { flex: 1, paddingRight: 20 },
  sectionLabel: { fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#888888', marginBottom: 6, borderBottom: '1px solid #E2E2E2', paddingBottom: 4 },
  sectionText: { fontSize: 10, lineHeight: 1.6 },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: 'row', borderBottom: '1px solid #0D1117', paddingBottom: 4, marginBottom: 6 },
  tableHeaderCell: { fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#888888' },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottom: '1px solid #E2E2E2' },
  tableCell: { fontSize: 10 },
  totals: { alignItems: 'flex-end', marginTop: 8 },
  totalRow: { flexDirection: 'row', gap: 40, marginBottom: 4 },
  totalLabel: { fontSize: 9, color: '#888888', width: 80, textAlign: 'right' },
  totalValue: { fontSize: 10, fontWeight: 700, width: 100, textAlign: 'right' },
  grandTotal: { flexDirection: 'row', gap: 40, paddingTop: 8, borderTop: '1px solid #0D1117', marginTop: 4 },
  grandLabel: { fontSize: 12, fontWeight: 700, width: 80, textAlign: 'right' },
  grandValue: { fontSize: 14, fontWeight: 700, width: 100, textAlign: 'right', color: '#0D1117' },
  paymentNote: { marginTop: 32, padding: '12 16', backgroundColor: '#FFFFFF', border: '1px solid #E2E2E2' },
  noteLabel: { fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#888888', marginBottom: 4 },
  noteText: { fontSize: 9, color: '#0D1117', lineHeight: 1.6 },
  footer: { position: 'absolute', bottom: 32, left: 56, right: 56, borderTop: '1px solid #E2E2E2', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#888888' },
})

interface InvoicePDFProps {
  invoice: Invoice
  settings: Settings
}

const STATUS_COLOR: Record<string, string> = {
  PAID: '#2D7D46',
  OVERDUE: '#D0021B',
  SENT: '#1a6fd8',
  DRAFT: '#888888',
  CANCELLED: '#888888',
}

export function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
  const client = invoice.client
  const currency = invoice.currency
  const fmt = (n: number) => currency === 'USD' ? formatUsd(n) : formatPkr(n)

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.logoText}>SIGNL</Text>
            <Text style={S.tagline}>Infrastructure that turns your signal into revenue</Text>
            <Text style={{ fontSize: 9, color: '#888888', marginTop: 8 }}>{settings.businessName}</Text>
            <Text style={{ fontSize: 9, color: '#888888' }}>{settings.ownerName}</Text>
            <Text style={{ fontSize: 9, color: '#888888' }}>{settings.ownerEmail}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.invLabel}>Invoice</Text>
            <Text style={S.invNumber}>{invoice.invoiceNumber}</Text>
            <View style={[S.statusBadge, { borderColor: STATUS_COLOR[invoice.status], color: STATUS_COLOR[invoice.status] }]}>
              <Text>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Bill To + Dates */}
        <View style={S.section}>
          <View style={S.sectionBlock}>
            <Text style={S.sectionLabel}>Bill To</Text>
            <Text style={[S.sectionText, { fontWeight: 700 }]}>{client?.fullName ?? 'Client'}</Text>
            {client?.company && <Text style={S.sectionText}>{client.company}</Text>}
            <Text style={S.sectionText}>{client?.email ?? ''}</Text>
          </View>
          <View style={[S.sectionBlock, { alignItems: 'flex-end', paddingRight: 0 }]}>
            <Text style={S.sectionLabel}>Details</Text>
            <Text style={S.sectionText}>Issue Date: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</Text>
            <Text style={S.sectionText}>Due Date: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</Text>
            {invoice.paidDate && (
              <Text style={[S.sectionText, { color: '#2D7D46' }]}>
                Paid: {format(new Date(invoice.paidDate), 'MMM d, yyyy')}
              </Text>
            )}
            <Text style={[S.sectionText, { marginTop: 4 }]}>Currency: {currency}</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { flex: 3 }]}>Description</Text>
            <Text style={[S.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          </View>
          {(invoice.lineItems as LineItem[]).map((item, i) => (
            <View key={i} style={S.tableRow}>
              <Text style={[S.tableCell, { flex: 3 }]}>{item.description}</Text>
              <Text style={[S.tableCell, { flex: 1, textAlign: 'right' }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={S.totals}>
          <View style={S.grandTotal}>
            <Text style={S.grandLabel}>Total Due</Text>
            <Text style={S.grandValue}>{fmt(invoice.subtotalAmount)}</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#888888', marginTop: 4, textAlign: 'right' }}>
            ≈ {currency === 'USD' ? formatPkr(invoice.amountPkr) : formatUsd(invoice.amountUsd)}
            {' '}(rate: {Number(invoice.exchangeRateUsed).toFixed(2)})
          </Text>
        </View>

        {/* Payment Note */}
        <View style={S.paymentNote}>
          <Text style={S.noteLabel}>Payment Instructions</Text>
          <Text style={S.noteText}>
            Please transfer payment via Wise or Payoneer to {settings.ownerName} ({settings.ownerEmail}).
            Reference: {invoice.invoiceNumber}.
            {'\n'}Payment is due by {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}.
          </Text>
          {invoice.notes && (
            <Text style={[S.noteText, { marginTop: 6, fontStyle: 'italic', color: '#888888' }]}>{invoice.notes}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{settings.businessName} · {invoice.invoiceNumber}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
