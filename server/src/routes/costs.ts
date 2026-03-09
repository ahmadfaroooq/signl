import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'
import { resolveAmounts, getCurrentRate } from '../services/currencyService'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/costs
router.get('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { category, client_id, page = '1', limit = '50' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...(category && { category }),
    ...(client_id && { clientId: client_id }),
  }

  const [entries, total] = await Promise.all([
    prisma.costEntry.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { date: 'desc' },
      include: {
        client: { select: { fullName: true } },
        teamMember: { select: { name: true } },
      },
    }),
    prisma.costEntry.count({ where }),
  ])

  const totals = entries.reduce(
    (acc, e) => ({
      totalUsd: acc.totalUsd + Number(e.amountUsd),
      totalPkr: acc.totalPkr + Number(e.amountPkr),
      fixedUsd: acc.fixedUsd + (e.category === 'FIXED' ? Number(e.amountUsd) : 0),
      variableUsd: acc.variableUsd + (e.category === 'VARIABLE' ? Number(e.amountUsd) : 0),
      acquisitionUsd: acc.acquisitionUsd + (e.category === 'ACQUISITION' ? Number(e.amountUsd) : 0),
    }),
    { totalUsd: 0, totalPkr: 0, fixedUsd: 0, variableUsd: 0, acquisitionUsd: 0 }
  )

  res.json(ok(entries, { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), totals }))
})

// POST /api/v1/costs
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const {
    name, category, costInputType,
    amount, currency,
    hours,
    clientId, isShared, billingCycle, isActive, date, teamMemberId,
  } = req.body

  if (!name || !category || !costInputType || !date) {
    res.status(400).json(err('name, category, costInputType, and date are required'))
    return
  }

  let amountUsd: number
  let amountPkr: number
  let exchangeRateUsed: number
  let hourlyRateUsed: number | undefined

  if (costInputType === 'TIME') {
    if (!hours) {
      res.status(400).json(err('hours required for TIME cost'))
      return
    }
    const settings = await prisma.settings.findUnique({ where: { id: '1' } })
    hourlyRateUsed = Number(settings?.hourlyRateUsd ?? 25)
    const cashEquivalent = Number(hours) * hourlyRateUsed
    const resolved = await resolveAmounts(cashEquivalent, 'USD')
    amountUsd = resolved.amountUsd
    amountPkr = resolved.amountPkr
    exchangeRateUsed = resolved.exchangeRateUsed
  } else {
    if (!amount || !currency) {
      res.status(400).json(err('amount and currency required for CASH cost'))
      return
    }
    const resolved = await resolveAmounts(Number(amount), currency)
    amountUsd = resolved.amountUsd
    amountPkr = resolved.amountPkr
    exchangeRateUsed = resolved.exchangeRateUsed
  }

  const entry = await prisma.costEntry.create({
    data: {
      name, category, costInputType,
      amount: amount ? Number(amount) : null,
      currency: currency ?? null,
      hours: hours ? Number(hours) : null,
      hourlyRateUsed,
      exchangeRateUsed,
      amountUsd,
      amountPkr,
      clientId: clientId ?? null,
      isShared: isShared ?? false,
      billingCycle: billingCycle ?? null,
      isActive: isActive ?? true,
      date: new Date(date),
      teamMemberId: teamMemberId ?? null,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(entry))
})

// DELETE /api/v1/costs/:id — soft delete
router.delete('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  await prisma.costEntry.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.json(ok({ deleted: true }))
})

export default router
