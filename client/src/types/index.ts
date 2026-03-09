// ─── Enums (mirror Prisma schema) ────────────────────────────────────────────

export type Role = 'OWNER' | 'MANAGER' | 'CONTRACTOR'
export type Currency = 'USD' | 'PKR'
export type CurrencyDisplay = 'BOTH' | 'USD' | 'PKR'

export type OfferType = 'AUDIT' | 'SYSTEM_BUILD' | 'DWY' | 'DFY'
export type ClientStatus = 'PROSPECT' | 'PROPOSAL_SENT' | 'CONTRACT_SIGNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETE' | 'CHURNED'
export type ReferralPotential = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
export type RevenueType = 'MRR' | 'PROJECT'
export type CostCategory = 'FIXED' | 'VARIABLE' | 'ACQUISITION'
export type CostInputType = 'CASH' | 'TIME'
export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME'
export type ProposalStatus = 'DRAFT' | 'SENT' | 'IN_DISCUSSION' | 'WON' | 'LOST' | 'GHOSTED'
export type LossReason = 'PRICE' | 'TIMING' | 'COMPETITOR' | 'NO_RESPONSE' | 'BUDGET' | 'OTHER'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PostType = 'AUTHORITY' | 'ENGAGEMENT' | 'CONVERSION' | 'PERSONAL'
export type PostStatus = 'IDEA' | 'DRAFT' | 'READY' | 'PUBLISHED' | 'SKIPPED'
export type TeamRole = 'DESIGNER' | 'WRITER' | 'VA' | 'MANAGER' | 'OTHER'
export type EngagementType = 'PER_PROJECT' | 'MONTHLY_RETAINER'
export type AlertSeverity = 'RED' | 'AMBER'

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: Record<string, unknown>
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  id: string
  usdPkrRate: number
  rateUpdatedAt: string
  hourlyRateUsd: number
  currencyDisplayDefault: CurrencyDisplay
  businessName: string
  ownerName: string
  ownerEmail: string
  ownerAddress: string
  healthThresholds: {
    ltv_cac_warn: number
    margin_warn: number
    scorecard_warn: number
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface Client {
  id: string
  fullName: string
  company: string | null
  email: string
  linkedinUrl: string | null
  whatsapp: string | null
  offerType: OfferType
  status: ClientStatus
  startDate: string | null
  endDate: string | null
  contractValueAmount: number | null
  contractValueCurrency: Currency | null
  testimonialCollected: boolean
  referralPotential: ReferralPotential
  notes: string | null
  createdAt: string
  updatedAt: string
  // Computed
  ltvUsd?: number
  openInvoicesCount?: number
}

// ─── Revenue ─────────────────────────────────────────────────────────────────

export interface RevenueEntry {
  id: string
  clientId: string
  offerType: OfferType
  revenueType: RevenueType
  amount: number
  currency: Currency
  exchangeRateUsed: number
  amountUsd: number
  amountPkr: number
  dateReceived: string
  invoiceNumber: string | null
  isRecurring: boolean
  invoiceId: string | null
  notes: string | null
  createdAt: string
  client?: { fullName: string; offerType: OfferType }
}

// ─── Cost Entries ─────────────────────────────────────────────────────────────

export interface CostEntry {
  id: string
  name: string
  category: CostCategory
  costInputType: CostInputType
  amount: number | null
  currency: Currency | null
  hours: number | null
  hourlyRateUsed: number | null
  exchangeRateUsed: number
  amountUsd: number
  amountPkr: number
  clientId: string | null
  isShared: boolean
  billingCycle: BillingCycle | null
  isActive: boolean
  date: string
  teamMemberId: string | null
  notes: string | null
  createdAt: string
  client?: { fullName: string }
  teamMember?: { name: string }
}

// ─── Proposals ───────────────────────────────────────────────────────────────

export interface Proposal {
  id: string
  prospectName: string
  clientId: string | null
  offerType: OfferType
  valueAmount: number
  valueCurrency: Currency
  valueUsd: number
  valuePkr: number
  exchangeRateUsed: number
  dateSent: string
  followUpDate: string | null
  status: ProposalStatus
  lossReason: LossReason | null
  notes: string | null
  createdAt: string
  client?: { fullName: string }
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface LineItem {
  description: string
  amount: number
  currency: Currency
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  lineItems: LineItem[]
  subtotalAmount: number
  currency: Currency
  amountUsd: number
  amountPkr: number
  exchangeRateUsed: number
  status: InvoiceStatus
  dueDate: string
  paidDate: string | null
  autoCreateRevenue: boolean
  revenueEntryId: string | null
  notes: string | null
  createdAt: string
  client?: { fullName: string; company: string | null; email: string }
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export interface Contract {
  id: string
  clientId: string
  offerType: OfferType
  templateId: string
  scopeNotes: string | null
  customClauses: Record<string, string> | null
  signedAt: string | null
  pdfUrl: string | null
  createdAt: string
  client?: { fullName: string; company: string | null; email: string }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface Alert {
  type: AlertSeverity
  message: string
  module: string
}

export interface UnitEconomics {
  mrrUsd: number
  mrrPkr: number
  totalRevenueUsd: number
  totalRevenuePkr: number
  totalCostsUsd: number
  grossProfit: number
  grossMarginPct: number
  mrrCoveragePct: number
  activeClients: number
  avgLtvUsd: number
  avgCacUsd: number
  ltvCacRatio: number
  closeRate: number
}

export interface TrendDataPoint {
  label: string
  year: number
  month: number
  totalUsd: number
  mrrUsd: number
}

// ─── SOP ─────────────────────────────────────────────────────────────────────

export interface SopTask {
  id: string
  phase: string
  title: string
  order: number
  isDecisionPoint?: boolean
  declineAction?: string
}

export interface SopTemplate {
  id: string
  name: string
  offerType: OfferType
  description: string | null
  tasks: SopTask[]
}

export interface SopTaskState {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED' | 'SKIPPED'
  completedAt?: string
  note?: string
  blockedReason?: string
  assignedTo?: string
}

export interface SopInstance {
  id: string
  clientId: string
  templateId: string
  startedAt: string
  completedAt: string | null
  tasks: SopTaskState[]
  notes: string | null
  template: SopTemplate
}

// ─── Scorecard ───────────────────────────────────────────────────────────────

export interface ScorecardEntry {
  id: string
  weekOf: string
  q1: number; q2: number; q3: number; q4: number; q5: number
  q6: number; q7: number; q8: number; q9: number; q10: number
  totalScore: number
  notes: string | null
  createdAt: string
}

// ─── Outreach ────────────────────────────────────────────────────────────────

export type MessageType = 'COLD' | 'WARM' | 'REFERRAL' | 'FOLLOW_UP'
export type ResponseSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NO_REPLY'
export type CommentQuality = 'INSIGHT' | 'QUESTION' | 'VALIDATION'

export interface OutreachDm {
  id: string
  prospectName: string
  linkedinUrl: string
  messageType: MessageType
  dateSent: string
  responseReceived: boolean
  responseSentiment: ResponseSentiment | null
  convertedToProposal: boolean
  proposalId: string | null
  notes: string | null
  createdAt: string
}

export interface OutreachComment {
  id: string
  targetAccount: string
  postTopic: string
  date: string
  commentQuality: CommentQuality
  profileVisitReceived: boolean
  createdAt: string
}

export interface OutreachStats {
  todayDms: number
  todayComments: number
  weekDms: number
  weekComments: number
  responseRate: number
  conversionRate: number
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface ContentPost {
  id: string
  hookDraft: string
  postType: PostType
  plannedDate: string
  actualDate: string | null
  status: PostStatus
  impressions: number | null
  engagementRate: number | null
  hasLeadMagnetCta: boolean
  dmsGenerated: number | null
  notes: string | null
  createdAt: string
}

// ─── Lead Magnets ─────────────────────────────────────────────────────────────

export type MagnetType = 'CHECKLIST' | 'MINI_GUIDE' | 'TEMPLATE' | 'SWIPE_FILE' | 'CASE_STUDY'
export type MagnetStatus = 'ACTIVE' | 'PAUSED' | 'RETIRED'

export interface LeadMagnet {
  id: string
  name: string
  type: MagnetType
  ownerType: 'SIGNL' | 'CLIENT'
  linkedClientId: string | null
  totalDownloads: number
  conversionToCallPct: number | null
  conversionToClientPct: number | null
  status: MagnetStatus
  lastUpdated: string
  notes: string | null
  createdAt: string
  linkedClient?: { fullName: string } | null
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export type TestimonialFormat = 'TEXT' | 'VIDEO' | 'LINKEDIN_REC' | 'VOICE_NOTE'

export interface Testimonial {
  id: string
  clientId: string
  rawQuote: string
  editedQuote: string | null
  permissionToUse: boolean
  format: TestimonialFormat
  dateCollected: string
  themes: string[]
  usedIn: string[]
  createdAt: string
  client?: { fullName: string }
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  role: TeamRole
  engagementType: EngagementType
  rate: number
  rateCurrency: Currency
  isActive: boolean
  skills: string[]
  contractOnFile: boolean
  notes: string | null
  createdAt: string
  totalPaidUsd?: number
}

// ─── Project Tasks ────────────────────────────────────────────────────────────

export type SopTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED' | 'SKIPPED'

export interface ProjectTask {
  id: string
  sopInstanceId: string
  clientId: string
  title: string
  phase: string
  order: number
  status: SopTaskStatus
  assignedTo: string | null
  dueDate: string | null
  completedAt: string | null
  note: string | null
  blockedReason: string | null
  isDecisionPoint: boolean
  decisionOutcome: string | null
  assignee?: { name: string; email: string } | null
}
