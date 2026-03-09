import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from '@react-pdf/renderer'
import type { ContractTemplate } from '../../lib/contractTemplates'
import type { Settings } from '../../types'

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

const S = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#0D1117',
    backgroundColor: '#F7F5F0',
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottom: '1px solid #E2E2E2',
  },
  logoText: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 18,
    color: '#0D1117',
    letterSpacing: 2,
  },
  headerRight: {
    textAlign: 'right',
    fontSize: 9,
    color: '#888888',
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  contractSubtitle: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 28,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    color: '#0D1117',
    borderLeft: '2px solid #F5A623',
    paddingLeft: 8,
  },
  sectionContent: {
    fontSize: 9.5,
    color: '#0D1117',
    lineHeight: 1.65,
    paddingLeft: 0,
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 24,
    borderTop: '1px solid #E2E2E2',
  },
  signatureParty: {
    flex: 1,
    paddingRight: 24,
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#888888',
    marginBottom: 16,
  },
  signatureLine: {
    borderBottom: '1px solid #0D1117',
    marginBottom: 4,
    height: 20,
  },
  signatureSubLabel: {
    fontSize: 8,
    color: '#888888',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 56,
    right: 56,
    borderTop: '1px solid #E2E2E2',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#888888',
  },
})

interface ContractPDFProps {
  template: ContractTemplate
  clientName: string
  settings: Settings
  scopeNotes?: string
  signedAt?: string
}

export function ContractPDF({ template, clientName, settings, scopeNotes, signedAt }: ContractPDFProps) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.logoText}>SIGNL</Text>
            <Text style={{ fontSize: 8, color: '#888888', marginTop: 2 }}>Infrastructure that turns your signal into revenue</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={{ fontWeight: 700 }}>{settings.businessName}</Text>
            <Text>{settings.ownerName}</Text>
            <Text>{settings.ownerEmail}</Text>
            <Text style={{ marginTop: 4 }}>{today}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={S.contractTitle}>{template.name}</Text>
        <Text style={S.contractSubtitle}>
          Prepared for: {clientName}
        </Text>

        {/* Sections */}
        {template.sections.map((section, i) => (
          <View key={i} style={S.section} wrap={false}>
            <Text style={S.sectionTitle}>{section.title}</Text>
            <Text style={S.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Scope Notes */}
        {scopeNotes && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Additional Scope Notes</Text>
            <Text style={S.sectionContent}>{scopeNotes}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={S.signatureBlock}>
          <View style={S.signatureParty}>
            <Text style={S.signatureLabel}>Provider</Text>
            <View style={S.signatureLine}>
              {signedAt && <Text style={{ fontSize: 9, paddingTop: 4, color: '#2D7D46' }}>✓ Signed — {settings.ownerName}</Text>}
            </View>
            <Text style={S.signatureSubLabel}>{settings.ownerName}</Text>
            <Text style={S.signatureSubLabel}>{settings.businessName}</Text>
            {signedAt && <Text style={{ fontSize: 8, color: '#2D7D46', marginTop: 2 }}>Date: {new Date(signedAt).toLocaleDateString()}</Text>}
          </View>
          <View style={S.signatureParty}>
            <Text style={S.signatureLabel}>Client</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureSubLabel}>{clientName}</Text>
            <Text style={S.signatureSubLabel}>Date: _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{template.name} · {clientName}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
