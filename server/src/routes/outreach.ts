import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// ─── DMs ─────────────────────────────────────────────────────────────────────

// GET /api/v1/outreach/dms
router.get('/dms', authenticate, async (req: AuthRequest, res: Response) => {
  const { responseReceived, convertedToProposal } = req.query

  const where: Record<string, unknown> = {}
  if (responseReceived !== undefined) {
    where.responseReceived = responseReceived === 'true'
  }
  if (convertedToProposal !== undefined) {
    where.convertedToProposal = convertedToProposal === 'true'
  }

  const dms = await prisma.outreachDm.findMany({
    where,
    orderBy: { dateSent: 'desc' },
  })

  res.json(ok(dms))
})

// POST /api/v1/outreach/dms
router.post('/dms', authenticate, async (req: AuthRequest, res: Response) => {
  const { prospectName, linkedinUrl, messageType, dateSent, notes } = req.body

  if (!prospectName || !messageType || !dateSent) {
    res.status(400).json(err('prospectName, messageType, and dateSent are required'))
    return
  }

  const dm = await prisma.outreachDm.create({
    data: {
      prospectName,
      linkedinUrl,
      messageType,
      dateSent: new Date(dateSent),
      notes,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(dm))
})

// PATCH /api/v1/outreach/dms/:id
router.patch('/dms/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.outreachDm.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('DM not found'))
    return
  }

  const { responseReceived, responseSentiment, convertedToProposal, proposalId } = req.body

  const updated = await prisma.outreachDm.update({
    where: { id: req.params.id },
    data: {
      ...(responseReceived !== undefined && { responseReceived }),
      ...(responseSentiment !== undefined && { responseSentiment }),
      ...(convertedToProposal !== undefined && { convertedToProposal }),
      ...(proposalId !== undefined && { proposalId }),
    },
  })

  res.json(ok(updated))
})

// DELETE /api/v1/outreach/dms/:id
router.delete('/dms/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.outreachDm.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('DM not found'))
    return
  }

  await prisma.outreachDm.delete({ where: { id: req.params.id } })
  res.json(ok({ deleted: true }))
})

// ─── Comments ─────────────────────────────────────────────────────────────────

// GET /api/v1/outreach/comments
router.get('/comments', authenticate, async (req: AuthRequest, res: Response) => {
  const comments = await prisma.outreachComment.findMany({
    orderBy: { date: 'desc' },
  })

  res.json(ok(comments))
})

// POST /api/v1/outreach/comments
router.post('/comments', authenticate, async (req: AuthRequest, res: Response) => {
  const { targetAccount, postTopic, date, commentQuality, profileVisitReceived } = req.body

  if (!targetAccount || !date) {
    res.status(400).json(err('targetAccount and date are required'))
    return
  }

  const comment = await prisma.outreachComment.create({
    data: {
      targetAccount,
      postTopic,
      date: new Date(date),
      commentQuality,
      profileVisitReceived: profileVisitReceived ?? false,
      createdBy: req.user!.id,
    },
  })

  res.status(201).json(ok(comment))
})

// DELETE /api/v1/outreach/comments/:id
router.delete('/comments/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.outreachComment.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('Comment not found'))
    return
  }

  await prisma.outreachComment.delete({ where: { id: req.params.id } })
  res.json(ok({ deleted: true }))
})

// ─── Stats ────────────────────────────────────────────────────────────────────

// GET /api/v1/outreach/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    todayDms,
    todayComments,
    weekDms,
    weekComments,
    totalDms,
    respondedDms,
    convertedDms,
  ] = await Promise.all([
    prisma.outreachDm.count({ where: { dateSent: { gte: todayStart } } }),
    prisma.outreachComment.count({ where: { date: { gte: todayStart } } }),
    prisma.outreachDm.count({ where: { dateSent: { gte: weekAgo } } }),
    prisma.outreachComment.count({ where: { date: { gte: weekAgo } } }),
    prisma.outreachDm.count(),
    prisma.outreachDm.count({ where: { responseReceived: true } }),
    prisma.outreachDm.count({ where: { convertedToProposal: true } }),
  ])

  const responseRate = totalDms > 0 ? Math.round((respondedDms / totalDms) * 10000) / 100 : 0
  const conversionRate = totalDms > 0 ? Math.round((convertedDms / totalDms) * 10000) / 100 : 0

  res.json(
    ok({
      todayDms,
      todayComments,
      weekDms,
      weekComments,
      responseRate,
      conversionRate,
    })
  )
})

export default router
