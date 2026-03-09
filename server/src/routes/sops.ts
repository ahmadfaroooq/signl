import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// ─── Templates ────────────────────────────────────────────────────────────────

// GET /api/v1/sops/templates
router.get('/templates', authenticate, async (req: AuthRequest, res: Response) => {
  const templates = await prisma.sopTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  })

  res.json(ok(templates))
})

// POST /api/v1/sops/templates
router.post(
  '/templates',
  authenticate,
  requireRole('OWNER', 'MANAGER'),
  async (req: AuthRequest, res: Response) => {
    const { name, offerType, description, tasks } = req.body

    if (!name || !offerType) {
      res.status(400).json(err('name and offerType are required'))
      return
    }

    const template = await prisma.sopTemplate.create({
      data: {
        name,
        offerType,
        description,
        tasks: tasks ?? [],
      },
    })

    res.status(201).json(ok(template))
  }
)

// GET /api/v1/sops/templates/:id
router.get('/templates/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const template = await prisma.sopTemplate.findUnique({
    where: { id: req.params.id },
  })

  if (!template) {
    res.status(404).json(err('SOP template not found'))
    return
  }

  res.json(ok(template))
})

// PUT /api/v1/sops/templates/:id
router.put(
  '/templates/:id',
  authenticate,
  requireRole('OWNER', 'MANAGER'),
  async (req: AuthRequest, res: Response) => {
    const existing = await prisma.sopTemplate.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json(err('SOP template not found'))
      return
    }

    const { name, offerType, description, tasks } = req.body

    const updated = await prisma.sopTemplate.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(offerType && { offerType }),
        ...(description !== undefined && { description }),
        ...(tasks !== undefined && { tasks }),
      },
    })

    res.json(ok(updated))
  }
)

// DELETE /api/v1/sops/templates/:id
router.delete(
  '/templates/:id',
  authenticate,
  requireRole('OWNER'),
  async (req: AuthRequest, res: Response) => {
    const existing = await prisma.sopTemplate.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json(err('SOP template not found'))
      return
    }

    await prisma.sopTemplate.delete({ where: { id: req.params.id } })
    res.json(ok({ deleted: true }))
  }
)

// ─── Instances ────────────────────────────────────────────────────────────────

// GET /api/v1/sops/instances
router.get('/instances', authenticate, async (req: AuthRequest, res: Response) => {
  const instances = await prisma.sopInstance.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, fullName: true, company: true } },
      template: { select: { id: true, name: true, offerType: true } },
    },
  })

  res.json(ok(instances))
})

// POST /api/v1/sops/instances
router.post('/instances', authenticate, async (req: AuthRequest, res: Response) => {
  const { clientId, templateId } = req.body

  if (!clientId || !templateId) {
    res.status(400).json(err('clientId and templateId are required'))
    return
  }

  const [client, template] = await Promise.all([
    prisma.client.findFirst({ where: { id: clientId, deletedAt: null } }),
    prisma.sopTemplate.findUnique({ where: { id: templateId } }),
  ])

  if (!client) {
    res.status(404).json(err('Client not found'))
    return
  }
  if (!template) {
    res.status(404).json(err('SOP template not found'))
    return
  }

  // Create instance then bulk-create ProjectTask rows from template.tasks
  const instance = await prisma.sopInstance.create({
    data: {
      clientId,
      templateId,
      createdBy: req.user!.id,
      tasks: [],
    },
  })

  const taskDefs = Array.isArray(template.tasks) ? template.tasks as Array<{
    id?: string
    phase: string
    title: string
    order: number
    isDecisionPoint?: boolean
    decisionOutcome?: string
  }> : []

  if (taskDefs.length > 0) {
    await prisma.projectTask.createMany({
      data: taskDefs.map((t) => ({
        sopInstanceId: instance.id,
        clientId,
        title: t.title,
        phase: t.phase,
        order: t.order,
        isDecisionPoint: t.isDecisionPoint ?? false,
        status: 'PENDING',
      })),
    })
  }

  const instanceWithTasks = await prisma.sopInstance.findUnique({
    where: { id: instance.id },
    include: {
      client: { select: { id: true, fullName: true, company: true } },
      template: { select: { id: true, name: true, offerType: true } },
      projectTasks: { orderBy: { order: 'asc' } },
    },
  })

  res.status(201).json(ok(instanceWithTasks))
})

// GET /api/v1/sops/instances/:id
router.get('/instances/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const instance = await prisma.sopInstance.findUnique({
    where: { id: req.params.id },
    include: {
      client: { select: { id: true, fullName: true, company: true } },
      template: true,
      projectTasks: {
        orderBy: { order: 'asc' },
        include: {
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!instance) {
    res.status(404).json(err('SOP instance not found'))
    return
  }

  res.json(ok(instance))
})

// PATCH /api/v1/sops/instances/:id
router.patch('/instances/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.sopInstance.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json(err('SOP instance not found'))
    return
  }

  const { notes, completedAt } = req.body

  const updated = await prisma.sopInstance.update({
    where: { id: req.params.id },
    data: {
      ...(notes !== undefined && { notes }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
    },
  })

  res.json(ok(updated))
})

// ─── Tasks ────────────────────────────────────────────────────────────────────

// GET /api/v1/sops/tasks/:instanceId
router.get('/tasks/:instanceId', authenticate, async (req: AuthRequest, res: Response) => {
  const instance = await prisma.sopInstance.findUnique({ where: { id: req.params.instanceId } })
  if (!instance) {
    res.status(404).json(err('SOP instance not found'))
    return
  }

  const tasks = await prisma.projectTask.findMany({
    where: { sopInstanceId: req.params.instanceId },
    orderBy: { order: 'asc' },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  })

  res.json(ok(tasks))
})

// PATCH /api/v1/sops/tasks/:taskId
router.patch('/tasks/:taskId', authenticate, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.projectTask.findUnique({ where: { id: req.params.taskId } })
  if (!existing) {
    res.status(404).json(err('Task not found'))
    return
  }

  const { status, assignedTo, dueDate, note, blockedReason, decisionOutcome } = req.body

  const updated = await prisma.projectTask.update({
    where: { id: req.params.taskId },
    data: {
      ...(status !== undefined && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(note !== undefined && { note }),
      ...(blockedReason !== undefined && { blockedReason }),
      ...(decisionOutcome !== undefined && { decisionOutcome }),
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  })

  res.json(ok(updated))
})

export default router
