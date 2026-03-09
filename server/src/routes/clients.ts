import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/clients
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { status, offer_type, page = '1', limit = '50' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...(status && { status }),
    ...(offer_type && { offerType: offer_type }),
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        revenueEntries: { where: { deletedAt: null }, select: { amountUsd: true } },
        invoices: { where: { deletedAt: null }, select: { status: true } },
      },
    }),
    prisma.client.count({ where }),
  ])

  // Compute LTV per client (sum of all revenue_entries.amount_usd)
  const clientsWithLtv = clients.map((c) => ({
    ...c,
    ltvUsd: c.revenueEntries.reduce((sum, r) => sum + Number(r.amountUsd), 0),
    openInvoicesCount: c.invoices.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE').length,
  }))

  res.json(
    ok(clientsWithLtv, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    })
  )
})

// POST /api/v1/clients
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const {
    fullName, company, email, linkedinUrl, whatsapp,
    offerType, status, startDate, endDate,
    contractValueAmount, contractValueCurrency,
    referralPotential, notes,
  } = req.body

  if (!fullName || !email || !offerType) {
    res.status(400).json(err('fullName, email, and offerType are required'))
    return
  }

  const client = await prisma.client.create({
    data: {
      fullName, company, email, linkedinUrl, whatsapp,
      offerType, status: status ?? 'PROSPECT',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      contractValueAmount, contractValueCurrency,
      referralPotential: referralPotential ?? 'UNKNOWN',
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(client))
})

// GET /api/v1/clients/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const client = await prisma.client.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: {
      revenueEntries: { where: { deletedAt: null } },
      invoices: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      contracts: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      sopInstances: { include: { template: true } },
      testimonials: true,
      proposals: { where: { deletedAt: null } },
    },
  })

  if (!client) {
    res.status(404).json(err('Client not found'))
    return
  }

  const ltvUsd = client.revenueEntries.reduce((sum, r) => sum + Number(r.amountUsd), 0)

  res.json(ok({ ...client, ltvUsd }))
})

// PATCH /api/v1/clients/:id
router.patch('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.client.findFirst({
    where: { id: req.params.id, deletedAt: null },
  })
  if (!existing) {
    res.status(404).json(err('Client not found'))
    return
  }

  const {
    fullName, company, email, linkedinUrl, whatsapp,
    offerType, status, startDate, endDate,
    contractValueAmount, contractValueCurrency,
    testimonialCollected, referralPotential, notes,
  } = req.body

  const updated = await prisma.client.update({
    where: { id: req.params.id },
    data: {
      ...(fullName && { fullName }),
      ...(company !== undefined && { company }),
      ...(email && { email }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(offerType && { offerType }),
      ...(status && { status }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(contractValueAmount !== undefined && { contractValueAmount }),
      ...(contractValueCurrency !== undefined && { contractValueCurrency }),
      ...(testimonialCollected !== undefined && { testimonialCollected }),
      ...(referralPotential && { referralPotential }),
      ...(notes !== undefined && { notes }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/clients/:id — soft delete
router.delete('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  await prisma.client.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.json(ok({ deleted: true }))
})

export default router
