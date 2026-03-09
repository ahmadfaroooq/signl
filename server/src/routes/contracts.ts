import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { blockContractor } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/contracts
router.get('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { client_id } = req.query
  const contracts = await prisma.contract.findMany({
    where: {
      deletedAt: null,
      ...(client_id && { clientId: client_id as string }),
    },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { fullName: true, company: true, email: true } } },
  })
  res.json(ok(contracts))
})

// POST /api/v1/contracts — generate contract from template + client data
router.post('/', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { clientId, offerType, scopeNotes, customClauses } = req.body

  if (!clientId || !offerType) {
    res.status(400).json(err('clientId and offerType are required'))
    return
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, deletedAt: null },
  })
  if (!client) {
    res.status(404).json(err('Client not found'))
    return
  }

  const contract = await prisma.contract.create({
    data: {
      clientId,
      offerType,
      templateId: offerType, // Template ID matches offerType (AUDIT, SYSTEM_BUILD, etc.)
      scopeNotes,
      customClauses,
      createdBy: req.user!.id,
    },
    include: { client: true },
  })

  res.status(201).json(ok(contract))
})

// GET /api/v1/contracts/:id
router.get('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const contract = await prisma.contract.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: { client: true },
  })
  if (!contract) {
    res.status(404).json(err('Contract not found'))
    return
  }
  res.json(ok(contract))
})

// PATCH /api/v1/contracts/:id
router.patch('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  const { scopeNotes, customClauses, signedAt } = req.body
  const updated = await prisma.contract.update({
    where: { id: req.params.id },
    data: {
      ...(scopeNotes !== undefined && { scopeNotes }),
      ...(customClauses !== undefined && { customClauses }),
      ...(signedAt !== undefined && { signedAt: signedAt ? new Date(signedAt) : null }),
    },
  })
  res.json(ok(updated))
})

// DELETE /api/v1/contracts/:id — soft delete
router.delete('/:id', authenticate, blockContractor, async (req: AuthRequest, res: Response) => {
  await prisma.contract.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.json(ok({ deleted: true }))
})

export default router
