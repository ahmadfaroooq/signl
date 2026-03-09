import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/team
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const members = await prisma.teamMember.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      costEntries: {
        select: { amountUsd: true },
      },
    },
  })

  const membersWithTotal = members.map((m) => ({
    ...m,
    totalPaidUsd: m.costEntries.reduce((sum, c) => sum + Number(c.amountUsd), 0),
  }))

  res.json(ok(membersWithTotal))
})

// POST /api/v1/team
router.post(
  '/',
  authenticate,
  requireRole('OWNER'),
  async (req: AuthRequest, res: Response) => {
    const {
      name,
      role,
      engagementType,
      rate,
      rateCurrency,
      skills,
      contractOnFile,
      notes,
    } = req.body

    if (!name || !role || !engagementType) {
      res.status(400).json(err('name, role, and engagementType are required'))
      return
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        engagementType,
        rate: rate ?? 0,
        rateCurrency: rateCurrency ?? 'USD',
        skills: skills ?? [],
        contractOnFile: contractOnFile ?? false,
        notes,
      },
    })

    res.status(201).json(ok(member))
  }
)

// GET /api/v1/team/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const member = await prisma.teamMember.findUnique({
    where: { id: req.params.id },
    include: {
      costEntries: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!member) {
    res.status(404).json(err('Team member not found'))
    return
  }

  const totalPaidUsd = member.costEntries.reduce((sum, c) => sum + Number(c.amountUsd), 0)

  res.json(ok({ ...member, totalPaidUsd }))
})

// PATCH /api/v1/team/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Team member not found'))
    return
  }

  const {
    name,
    role,
    engagementType,
    rate,
    rateCurrency,
    skills,
    contractOnFile,
    notes,
  } = req.body

  const updated = await prisma.teamMember.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      ...(engagementType && { engagementType }),
      ...(rate !== undefined && { rate }),
      ...(rateCurrency !== undefined && { rateCurrency }),
      ...(skills !== undefined && { skills }),
      ...(contractOnFile !== undefined && { contractOnFile }),
      ...(notes !== undefined && { notes }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/team/:id
router.delete(
  '/:id',
  authenticate,
  requireRole('OWNER'),
  async (req: AuthRequest, res: Response) => {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json(err('Team member not found'))
      return
    }

    await prisma.teamMember.delete({ where: { id: req.params.id } })
    res.json(ok({ deleted: true }))
  }
)

export default router
