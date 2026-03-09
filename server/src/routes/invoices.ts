import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err, LineItem } from '../types'
import { resolveAmounts, computeSubtotal } from '../services/currencyService'

const router = Router()
const prisma = new PrismaClient()

async function getNextInvoiceNumber(): Promise<string> {
  const last = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  })
  if (!last) return 'INV-001'
  const num = parseInt(last.invoiceNumber.replace('INV-', ''), 10)
  return `INV-${String(num + 1).padStart(3, '0')}`
}

// GET /api/v1/invoices
router.get('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { status, client_id, page = '1', limit = '50' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...(status && { status }),
    ...(client_id && { clientId: client_id }),
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { fullName: true, company: true, email: true } } },
    }),
    prisma.invoice.count({ where }),
  ])

  res.json(ok(invoices, { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }))
})

// POST /api/v1/invoices
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { clientId, lineItems, currency, dueDate, autoCreateRevenue, notes } = req.body

  if (!clientId || !lineItems || !currency || !dueDate) {
    res.status(400).json(err('clientId, lineItems, currency, and dueDate are required'))
    return
  }

  const items: LineItem[] = lineItems
  const subtotal = computeSubtotal(items, currency)
  const { amountUsd, amountPkr, exchangeRateUsed } = await resolveAmounts(subtotal, currency)
  const invoiceNumber = await getNextInvoiceNumber()

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      lineItems: items as object[],
      subtotalAmount: subtotal,
      currency,
      amountUsd,
      amountPkr,
      exchangeRateUsed,
      status: 'DRAFT',
      dueDate: new Date(dueDate),
      autoCreateRevenue: autoCreateRevenue ?? true,
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(invoice))
})

// GET /api/v1/invoices/:id
router.get('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: { client: true },
  })
  if (!invoice) {
    res.status(404).json(err('Invoice not found'))
    return
  }
  res.json(ok(invoice))
})

// PATCH /api/v1/invoices/:id
router.patch('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { status, dueDate, notes } = req.body
  const updated = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(notes !== undefined && { notes }),
    },
  })
  res.json(ok(updated))
})

// PATCH /api/v1/invoices/:id/mark-paid
router.patch('/:id/mark-paid', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: { client: true },
  })

  if (!invoice) {
    res.status(404).json(err('Invoice not found'))
    return
  }

  const paidDate = req.body.paidDate ? new Date(req.body.paidDate) : new Date()

  // Mark invoice as PAID
  const updated = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: 'PAID', paidDate },
  })

  // Auto-create revenue entry if enabled (T9.2 spec)
  let revenueEntry = null
  if (invoice.autoCreateRevenue) {
    const client = invoice.client
    const revenueType = ['DWY', 'DFY'].includes(client.offerType) ? 'MRR' : 'PROJECT'

    revenueEntry = await prisma.revenueEntry.create({
      data: {
        clientId: invoice.clientId,
        offerType: client.offerType,
        revenueType,
        amount: Number(invoice.subtotalAmount),
        currency: invoice.currency,
        exchangeRateUsed: invoice.exchangeRateUsed,
        amountUsd: invoice.amountUsd,
        amountPkr: invoice.amountPkr,
        dateReceived: paidDate,
        invoiceNumber: invoice.invoiceNumber,
        isRecurring: revenueType === 'MRR',
        invoiceId: invoice.id,
        createdBy: req.user!.id,
      },
    })

    // Link revenue entry back to invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { revenueEntryId: revenueEntry.id },
    })
  }

  res.json(ok({ invoice: updated, revenueEntry }))
})

// DELETE /api/v1/invoices/:id — soft delete
router.delete('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  await prisma.invoice.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.json(ok({ deleted: true }))
})

export default router
