import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

const SCORE_FIELDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const

function computeTotal(body: Record<string, unknown>): number {
  return SCORE_FIELDS.reduce((sum, field) => {
    const val = body[field]
    return sum + (typeof val === 'number' ? val : Number(val ?? 0))
  }, 0)
}

// GET /api/v1/scorecard/trend  — must be defined before /:id
router.get('/trend', authenticate, async (req: AuthRequest, res: Response) => {
  const entries = await prisma.scorecardEntry.findMany({
    orderBy: { weekOf: 'desc' },
    take: 12,
    select: {
      weekOf: true,
      totalScore: true,
      q1: true,
      q2: true,
      q3: true,
      q4: true,
      q5: true,
      q6: true,
      q7: true,
      q8: true,
      q9: true,
      q10: true,
    },
  })

  // Return in chronological order for chart rendering
  res.json(ok(entries.reverse()))
})

// GET /api/v1/scorecard
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const entries = await prisma.scorecardEntry.findMany({
    orderBy: { weekOf: 'desc' },
    take: 12,
  })

  res.json(ok(entries))
})

// POST /api/v1/scorecard
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { weekOf, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, notes } = req.body

  if (!weekOf) {
    res.status(400).json(err('weekOf is required'))
    return
  }

  const totalScore = computeTotal(req.body)

  const entry = await prisma.scorecardEntry.create({
    data: {
      weekOf: new Date(weekOf),
      q1: q1 ?? 0,
      q2: q2 ?? 0,
      q3: q3 ?? 0,
      q4: q4 ?? 0,
      q5: q5 ?? 0,
      q6: q6 ?? 0,
      q7: q7 ?? 0,
      q8: q8 ?? 0,
      q9: q9 ?? 0,
      q10: q10 ?? 0,
      totalScore,
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(entry))
})

// GET /api/v1/scorecard/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const entry = await prisma.scorecardEntry.findUnique({ where: { id: req.params.id } })

  if (!entry) {
    res.status(404).json(err('Scorecard entry not found'))
    return
  }

  res.json(ok(entry))
})

// PATCH /api/v1/scorecard/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.scorecardEntry.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Scorecard entry not found'))
    return
  }

  const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, notes, weekOf } = req.body

  // Merge existing scores with incoming values so totalScore is always accurate
  const merged = {
    q1: q1 !== undefined ? q1 : Number(existing.q1),
    q2: q2 !== undefined ? q2 : Number(existing.q2),
    q3: q3 !== undefined ? q3 : Number(existing.q3),
    q4: q4 !== undefined ? q4 : Number(existing.q4),
    q5: q5 !== undefined ? q5 : Number(existing.q5),
    q6: q6 !== undefined ? q6 : Number(existing.q6),
    q7: q7 !== undefined ? q7 : Number(existing.q7),
    q8: q8 !== undefined ? q8 : Number(existing.q8),
    q9: q9 !== undefined ? q9 : Number(existing.q9),
    q10: q10 !== undefined ? q10 : Number(existing.q10),
  }

  const totalScore = computeTotal(merged)

  const updated = await prisma.scorecardEntry.update({
    where: { id: req.params.id },
    data: {
      ...merged,
      totalScore,
      ...(notes !== undefined && { notes }),
      ...(weekOf !== undefined && { weekOf: new Date(weekOf) }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/scorecard/:id
router.delete(
  '/:id',
  authenticate,
  requireRole('OWNER'),
  async (req: AuthRequest, res: Response) => {
    const existing = await prisma.scorecardEntry.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json(err('Scorecard entry not found'))
      return
    }

    await prisma.scorecardEntry.delete({ where: { id: req.params.id } })
    res.json(ok({ deleted: true }))
  }
)

export default router
