import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/magnets
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { status } = req.query

  const where: Record<string, unknown> = {}
  if (status) {
    where.status = status as string
  }

  const magnets = await prisma.leadMagnet.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  res.json(ok(magnets))
})

// POST /api/v1/magnets
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, type, ownerType, linkedClientId, lastUpdated, notes } = req.body

  if (!name || !type) {
    res.status(400).json(err('name and type are required'))
    return
  }

  const magnet = await prisma.leadMagnet.create({
    data: {
      name,
      type,
      ownerType: ownerType ?? 'SIGNL',
      linkedClientId: linkedClientId ?? null,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      notes,
      status: 'ACTIVE',
    },
  })

  res.status(201).json(ok(magnet))
})

// PATCH /api/v1/magnets/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.leadMagnet.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Lead magnet not found'))
    return
  }

  const { totalDownloads, conversionToCallPct, conversionToClientPct, status } = req.body

  const updated = await prisma.leadMagnet.update({
    where: { id: req.params.id },
    data: {
      ...(totalDownloads !== undefined && { totalDownloads }),
      ...(conversionToCallPct !== undefined && { conversionToCallPct }),
      ...(conversionToClientPct !== undefined && { conversionToClientPct }),
      ...(status !== undefined && { status }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/magnets/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.leadMagnet.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Lead magnet not found'))
    return
  }

  await prisma.leadMagnet.delete({ where: { id: req.params.id } })
  res.json(ok({ deleted: true }))
})

export default router
