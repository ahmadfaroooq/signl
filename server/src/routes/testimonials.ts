import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/testimonials
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { clientId } = req.query

  const where: Record<string, unknown> = {}
  if (clientId) {
    where.clientId = clientId as string
  }

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: { dateCollected: 'desc' },
    include: {
      client: { select: { id: true, fullName: true } },
    },
  })

  res.json(ok(testimonials))
})

// POST /api/v1/testimonials
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const {
    clientId,
    rawQuote,
    format,
    dateCollected,
    themes,
    usedIn,
    permissionToUse,
  } = req.body

  if (!clientId || !rawQuote) {
    res.status(400).json(err('clientId and rawQuote are required'))
    return
  }

  const client = await prisma.client.findFirst({ where: { id: clientId, deletedAt: null } })
  if (!client) {
    res.status(404).json(err('Client not found'))
    return
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      clientId,
      rawQuote,
      format: format ?? 'TEXT',
      dateCollected: dateCollected ? new Date(dateCollected) : new Date(),
      themes: themes ?? [],
      usedIn: usedIn ?? [],
      permissionToUse: permissionToUse ?? false,
    },
    include: {
      client: { select: { id: true, fullName: true } },
    },
  })

  res.status(201).json(ok(testimonial))
})

// PATCH /api/v1/testimonials/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Testimonial not found'))
    return
  }

  const { editedQuote, permissionToUse, usedIn } = req.body

  const updated = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: {
      ...(editedQuote !== undefined && { editedQuote }),
      ...(permissionToUse !== undefined && { permissionToUse }),
      ...(usedIn !== undefined && { usedIn }),
    },
    include: {
      client: { select: { id: true, fullName: true } },
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/testimonials/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Testimonial not found'))
    return
  }

  await prisma.testimonial.delete({ where: { id: req.params.id } })
  res.json(ok({ deleted: true }))
})

export default router
