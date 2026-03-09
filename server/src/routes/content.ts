import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/content/stats — defined before / and /:id to avoid route conflicts
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  const posts = await prisma.contentPost.findMany({
    select: {
      postType: true,
      status: true,
      impressions: true,
      engagementRate: true,
    },
  })

  const byType: Record<string, number> = {
    AUTHORITY: 0,
    ENGAGEMENT: 0,
    CONVERSION: 0,
    PERSONAL: 0,
  }

  const byStatus: Record<string, number> = {
    IDEA: 0,
    DRAFT: 0,
    READY: 0,
    PUBLISHED: 0,
    SKIPPED: 0,
  }

  let publishedCount = 0
  let engagementSum = 0
  let engagementCount = 0

  for (const p of posts) {
    if (p.postType && byType[p.postType] !== undefined) {
      byType[p.postType]++
    }
    if (p.status && byStatus[p.status] !== undefined) {
      byStatus[p.status]++
    }
    if (p.status === 'PUBLISHED') {
      publishedCount++
    }
    if (p.engagementRate !== null && p.engagementRate !== undefined) {
      engagementSum += Number(p.engagementRate)
      engagementCount++
    }
  }

  const avgEngagement =
    engagementCount > 0 ? Math.round((engagementSum / engagementCount) * 100) / 100 : 0

  res.json(
    ok({
      byType,
      byStatus,
      totalPublished: publishedCount,
      avgEngagement,
    })
  )
})

// GET /api/v1/content
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { status, month } = req.query

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status as string
  }

  if (month) {
    // month format: YYYY-MM
    const [year, mon] = (month as string).split('-').map(Number)
    const start = new Date(year, mon - 1, 1)
    const end = new Date(year, mon, 1)
    where.plannedDate = { gte: start, lt: end }
  }

  const posts = await prisma.contentPost.findMany({
    where,
    orderBy: { plannedDate: 'desc' },
  })

  res.json(ok(posts))
})

// POST /api/v1/content
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const {
    hookDraft,
    postType,
    plannedDate,
    status,
    hasLeadMagnetCta,
    notes,
  } = req.body

  if (!postType || !plannedDate) {
    res.status(400).json(err('postType and plannedDate are required'))
    return
  }

  const post = await prisma.contentPost.create({
    data: {
      hookDraft,
      postType,
      plannedDate: new Date(plannedDate),
      status: status ?? 'IDEA',
      hasLeadMagnetCta: hasLeadMagnetCta ?? false,
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(post))
})

// PATCH /api/v1/content/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.contentPost.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Content post not found'))
    return
  }

  const { actualDate, status, impressions, engagementRate, dmsGenerated } = req.body

  const updated = await prisma.contentPost.update({
    where: { id: req.params.id },
    data: {
      ...(actualDate !== undefined && { actualDate: actualDate ? new Date(actualDate) : null }),
      ...(status !== undefined && { status }),
      ...(impressions !== undefined && { impressions }),
      ...(engagementRate !== undefined && { engagementRate }),
      ...(dmsGenerated !== undefined && { dmsGenerated }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/content/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.contentPost.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Content post not found'))
    return
  }

  await prisma.contentPost.delete({ where: { id: req.params.id } })
  res.json(ok({ deleted: true }))
})

export default router
