import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/roleCheck'
import { AuthRequest, ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/settings
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.settings.findUnique({ where: { id: '1' } })
  if (!settings) {
    res.status(404).json(err('Settings not initialized'))
    return
  }
  res.json(ok(settings))
})

// PUT /api/v1/settings — OWNER only
router.put('/', authenticate, requireRole('OWNER'), async (req: AuthRequest, res: Response) => {
  const {
    usdPkrRate,
    hourlyRateUsd,
    currencyDisplayDefault,
    businessName,
    ownerName,
    ownerEmail,
    ownerAddress,
    healthThresholds,
  } = req.body

  const updated = await prisma.settings.upsert({
    where: { id: '1' },
    update: {
      ...(usdPkrRate !== undefined && { usdPkrRate, rateUpdatedAt: new Date() }),
      ...(hourlyRateUsd !== undefined && { hourlyRateUsd }),
      ...(currencyDisplayDefault && { currencyDisplayDefault }),
      ...(businessName && { businessName }),
      ...(ownerName && { ownerName }),
      ...(ownerEmail !== undefined && { ownerEmail }),
      ...(ownerAddress !== undefined && { ownerAddress }),
      ...(healthThresholds && { healthThresholds }),
    },
    create: {
      id: '1',
      usdPkrRate: usdPkrRate ?? 278.5,
      rateUpdatedAt: new Date(),
      hourlyRateUsd: hourlyRateUsd ?? 25,
      currencyDisplayDefault: currencyDisplayDefault ?? 'BOTH',
      businessName: businessName ?? 'SIGNL',
      ownerName: ownerName ?? 'Ahmad Farooq',
      ownerEmail: ownerEmail ?? '',
      ownerAddress: ownerAddress ?? '',
    },
  })

  res.json(ok(updated))
})

export default router
