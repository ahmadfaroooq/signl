import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/dashboard/alerts — all active alerts across all modules
router.get('/alerts', authenticate, blockContractor, async (_req: AuthRequest, res: Response) => {
  const now = new Date()
  const alerts: Array<{ type: 'RED' | 'AMBER'; message: string; module: string }> = []

  // 1. Exchange rate stale > 30 days
  const settings = await prisma.settings.findUnique({ where: { id: '1' } })
  if (settings) {
    const daysSinceRate = (now.getTime() - new Date(settings.rateUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceRate > 30) {
      alerts.push({ type: 'AMBER', message: `Exchange rate last updated ${new Date(settings.rateUpdatedAt).toLocaleDateString()}. Update in Settings.`, module: 'SETTINGS' })
    }
  }

  // 2. Overdue invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'OVERDUE'] }, dueDate: { lt: now }, deletedAt: null },
    include: { client: { select: { fullName: true } } },
  })
  for (const inv of overdueInvoices) {
    alerts.push({ type: 'RED', message: `Invoice ${inv.invoiceNumber} overdue — ${inv.client.fullName}`, module: 'INVOICES' })
    // Also mark as OVERDUE in DB
    if (inv.status === 'SENT') {
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: 'OVERDUE' } })
    }
  }

  // 3. Proposal follow-up dates passed
  const lateFollowUps = await prisma.proposal.findMany({
    where: {
      followUpDate: { lt: now },
      status: { notIn: ['WON', 'LOST', 'GHOSTED'] },
      deletedAt: null,
    },
  })
  for (const p of lateFollowUps) {
    alerts.push({ type: 'AMBER', message: `Follow-up due: ${p.prospectName} — ${p.offerType}`, module: 'PROPOSALS' })
  }

  // 4. Testimonials pending > 7 days for COMPLETE clients
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const pendingTestimonials = await prisma.client.findMany({
    where: { status: 'COMPLETE', testimonialCollected: false, updatedAt: { lt: sevenDaysAgo }, deletedAt: null },
  })
  for (const c of pendingTestimonials) {
    alerts.push({ type: 'AMBER', message: `Testimonial pending: ${c.fullName}`, module: 'TESTIMONIALS' })
  }

  // 5. Team members without contract (monthly retainer)
  const noContractTeam = await prisma.teamMember.findMany({
    where: { engagementType: 'MONTHLY_RETAINER', contractOnFile: false, isActive: true },
  })
  for (const t of noContractTeam) {
    alerts.push({ type: 'AMBER', message: `No contract on file: ${t.name}`, module: 'TEAM' })
  }

  // 6. Lead magnets stale > 90 days
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const staleMagnets = await prisma.leadMagnet.findMany({
    where: { status: 'ACTIVE', lastUpdated: { lt: ninetyDaysAgo } },
  })
  for (const m of staleMagnets) {
    alerts.push({ type: 'AMBER', message: `Lead magnet stale: ${m.name}`, module: 'LEAD_MAGNETS' })
  }

  // 7. Scorecard declining (3 consecutive weeks < 35)
  const recentScores = await prisma.scorecardEntry.findMany({
    orderBy: { weekOf: 'desc' },
    take: 3,
  })
  const warnThreshold = Number((settings?.healthThresholds as { scorecard_warn?: number })?.scorecard_warn ?? 35)
  if (recentScores.length === 3 && recentScores.every((s) => s.totalScore < warnThreshold)) {
    alerts.push({ type: 'AMBER', message: 'Scorecard declining — review priorities', module: 'SCORECARD' })
  }

  // 8. Content mix < 20% conversion this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthPosts = await prisma.contentPost.findMany({
    where: { status: 'PUBLISHED', actualDate: { gte: startOfMonth } },
  })
  if (monthPosts.length > 0) {
    const conversionPosts = monthPosts.filter((p) => p.postType === 'CONVERSION').length
    const conversionPct = Math.round((conversionPosts / monthPosts.length) * 100)
    if (conversionPct < 20) {
      alerts.push({ type: 'AMBER', message: `Content mix: ${conversionPct}% conversion posts this month`, module: 'CONTENT' })
    }
  }

  res.json(ok(alerts, { count: alerts.length }))
})

// GET /api/v1/dashboard/unit-economics
router.get('/unit-economics', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const { month } = req.query
  let startDate: Date
  let endDate: Date

  if (month) {
    const [y, m] = (month as string).split('-').map(Number)
    startDate = new Date(y, m - 1, 1)
    endDate = new Date(y, m, 1)
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  const [revenueEntries, costEntries, activeClients] = await Promise.all([
    prisma.revenueEntry.findMany({
      where: { deletedAt: null, dateReceived: { gte: startDate, lt: endDate } },
    }),
    prisma.costEntry.findMany({
      where: { deletedAt: null, date: { gte: startDate, lt: endDate } },
    }),
    prisma.client.count({ where: { status: 'ACTIVE', deletedAt: null } }),
  ])

  const totalRevenueUsd = revenueEntries.reduce((s, e) => s + Number(e.amountUsd), 0)
  const totalRevenuePkr = revenueEntries.reduce((s, e) => s + Number(e.amountPkr), 0)
  const mrrUsd = revenueEntries.filter((e) => e.revenueType === 'MRR').reduce((s, e) => s + Number(e.amountUsd), 0)
  const mrrPkr = revenueEntries.filter((e) => e.revenueType === 'MRR').reduce((s, e) => s + Number(e.amountPkr), 0)
  const totalCostsUsd = costEntries.reduce((s, e) => s + Number(e.amountUsd), 0)
  const fixedCostsUsd = costEntries.filter((e) => e.category === 'FIXED').reduce((s, e) => s + Number(e.amountUsd), 0)
  const grossProfit = totalRevenueUsd - totalCostsUsd
  const grossMarginPct = totalRevenueUsd > 0 ? Math.round((grossProfit / totalRevenueUsd) * 100) : 0
  const mrrCoveragePct = fixedCostsUsd > 0 ? Math.round((mrrUsd / fixedCostsUsd) * 100) : 0

  // LTV per client
  const allClients = await prisma.client.findMany({ where: { deletedAt: null } })
  const allRevenue = await prisma.revenueEntry.findMany({ where: { deletedAt: null } })
  const ltvPerClient = allClients.map((c) => {
    const ltv = allRevenue.filter((r) => r.clientId === c.id).reduce((s, r) => s + Number(r.amountUsd), 0)
    return { clientId: c.id, ltvUsd: ltv }
  })
  const avgLtvUsd = ltvPerClient.length > 0 ? ltvPerClient.reduce((s, c) => s + c.ltvUsd, 0) / ltvPerClient.length : 0

  // CAC
  const acqCosts = await prisma.costEntry.findMany({ where: { category: 'ACQUISITION', deletedAt: null } })
  const avgCacUsd = activeClients > 0 ? acqCosts.reduce((s, e) => s + Number(e.amountUsd), 0) / activeClients : 0
  const ltvCacRatio = avgCacUsd > 0 ? Math.round((avgLtvUsd / avgCacUsd) * 10) / 10 : 0

  // Proposals close rate
  const allProposals = await prisma.proposal.findMany({ where: { deletedAt: null, status: { not: 'DRAFT' } } })
  const wonProposals = allProposals.filter((p) => p.status === 'WON').length
  const closeRate = allProposals.length > 0 ? Math.round((wonProposals / allProposals.length) * 100) : 0

  res.json(
    ok({
      mrrUsd: Math.round(mrrUsd * 100) / 100,
      mrrPkr: Math.round(mrrPkr * 100) / 100,
      totalRevenueUsd: Math.round(totalRevenueUsd * 100) / 100,
      totalRevenuePkr: Math.round(totalRevenuePkr * 100) / 100,
      totalCostsUsd: Math.round(totalCostsUsd * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMarginPct,
      mrrCoveragePct,
      activeClients,
      avgLtvUsd: Math.round(avgLtvUsd * 100) / 100,
      avgCacUsd: Math.round(avgCacUsd * 100) / 100,
      ltvCacRatio,
      closeRate,
    })
  )
})

// GET /api/v1/dashboard/trends — 12-month historical revenue
router.get('/trends', authenticate, blockContractor, async (_req: AuthRequest, res: Response) => {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('en', { month: 'short', year: '2-digit' }) }
  })

  const trends = await Promise.all(
    months.map(async ({ year, month, label }) => {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 1)
      const entries = await prisma.revenueEntry.findMany({
        where: { deletedAt: null, dateReceived: { gte: start, lt: end } },
      })
      const totalUsd = entries.reduce((s, e) => s + Number(e.amountUsd), 0)
      const mrrUsd = entries.filter((e) => e.revenueType === 'MRR').reduce((s, e) => s + Number(e.amountUsd), 0)
      return { label, year, month, totalUsd: Math.round(totalUsd * 100) / 100, mrrUsd: Math.round(mrrUsd * 100) / 100 }
    })
  )

  res.json(ok(trends))
})

export default router
