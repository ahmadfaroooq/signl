import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'
import { resolveAmounts } from '../services/currencyService'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/proposals
router.get('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { status, offer_type, page = '1', limit = '50' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...(status && { status }),
    ...(offer_type && { offerType: offer_type }),
  }

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where, skip, take: Number(limit),
      orderBy: { dateSent: 'desc' },
      include: { client: { select: { fullName: true } } },
    }),
    prisma.proposal.count({ where }),
  ])

  res.json(ok(proposals, { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }))
})

// GET /api/v1/proposals/analytics — close rate + loss breakdown
router.get('/analytics', authenticate, blockContractor, async (_req: AuthRequest, res: Response) => {
  const all = await prisma.proposal.findMany({ where: { deletedAt: null } })

  const won = all.filter((p) => p.status === 'WON').length
  const countable = all.filter((p) => p.status !== 'DRAFT').length
  const closeRate = countable > 0 ? Math.round((won / countable) * 100) : 0

  const lossReasons = all
    .filter((p) => p.status === 'LOST' && p.lossReason)
    .reduce((acc: Record<string, number>, p) => {
      const r = p.lossReason as string
      acc[r] = (acc[r] ?? 0) + 1
      return acc
    }, {})

  const byOfferType = ['AUDIT', 'SYSTEM_BUILD', 'DWY', 'DFY'].map((type) => {
    const subset = all.filter((p) => p.offerType === type && p.status !== 'DRAFT')
    const wonSubset = subset.filter((p) => p.status === 'WON').length
    return {
      offerType: type,
      total: subset.length,
      won: wonSubset,
      closeRate: subset.length > 0 ? Math.round((wonSubset / subset.length) * 100) : 0,
    }
  })

  res.json(ok({ closeRate, lossReasons, byOfferType, totalProposals: all.length }))
})

// POST /api/v1/proposals
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { prospectName, clientId, offerType, valueAmount, valueCurrency, dateSent, followUpDate, status, lossReason, notes } = req.body

  if (!prospectName || !offerType || !valueAmount || !valueCurrency || !dateSent) {
    res.status(400).json(err('prospectName, offerType, valueAmount, valueCurrency, dateSent required'))
    return
  }

  const { amountUsd: valueUsd, amountPkr: valuePkr, exchangeRateUsed } = await resolveAmounts(Number(valueAmount), valueCurrency)

  const proposal = await prisma.proposal.create({
    data: {
      prospectName, clientId,
      offerType, valueAmount: Number(valueAmount), valueCurrency,
      valueUsd, valuePkr, exchangeRateUsed,
      dateSent: new Date(dateSent),
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      status: status ?? 'DRAFT',
      lossReason: lossReason ?? null,
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(proposal))
})

// PATCH /api/v1/proposals/:id
router.patch('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { status, followUpDate, lossReason, notes, clientId } = req.body
  const updated = await prisma.proposal.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      ...(lossReason !== undefined && { lossReason }),
      ...(notes !== undefined && { notes }),
      ...(clientId && { clientId }),
    },
  })
  res.json(ok(updated))
})

export default router
