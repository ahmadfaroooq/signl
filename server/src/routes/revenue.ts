import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'
import { resolveAmounts } from '../services/currencyService'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/revenue
router.get('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { month, client_id, revenue_type, page = '1', limit = '50' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  let dateFilter = {}
  if (month) {
    const [y, m] = (month as string).split('-').map(Number)
    dateFilter = {
      dateReceived: {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...dateFilter,
    ...(client_id && { clientId: client_id }),
    ...(revenue_type && { revenueType: revenue_type }),
  }

  const [entries, total] = await Promise.all([
    prisma.revenueEntry.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { dateReceived: 'desc' },
      include: { client: { select: { fullName: true, offerType: true } } },
    }),
    prisma.revenueEntry.count({ where }),
  ])

  // Compute totals
  const totals = entries.reduce(
    (acc, e) => ({
      totalUsd: acc.totalUsd + Number(e.amountUsd),
      totalPkr: acc.totalPkr + Number(e.amountPkr),
      mrrUsd: acc.mrrUsd + (e.revenueType === 'MRR' ? Number(e.amountUsd) : 0),
      projectUsd: acc.projectUsd + (e.revenueType === 'PROJECT' ? Number(e.amountUsd) : 0),
    }),
    { totalUsd: 0, totalPkr: 0, mrrUsd: 0, projectUsd: 0 }
  )

  res.json(ok(entries, { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), totals }))
})

// POST /api/v1/revenue
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { clientId, offerType, revenueType, amount, currency, dateReceived, invoiceNumber, isRecurring, notes } = req.body

  if (!clientId || !amount || !currency || !dateReceived) {
    res.status(400).json(err('clientId, amount, currency, and dateReceived are required'))
    return
  }

  const { amountUsd, amountPkr, exchangeRateUsed } = await resolveAmounts(Number(amount), currency)

  const entry = await prisma.revenueEntry.create({
    data: {
      clientId,
      offerType: offerType ?? 'AUDIT',
      revenueType: revenueType ?? 'PROJECT',
      amount: Number(amount),
      currency,
      exchangeRateUsed,
      amountUsd,
      amountPkr,
      dateReceived: new Date(dateReceived),
      invoiceNumber,
      isRecurring: isRecurring ?? false,
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(entry))
})

// DELETE /api/v1/revenue/:id — soft delete
router.delete('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  await prisma.revenueEntry.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.json(ok({ deleted: true }))
})

export default router
