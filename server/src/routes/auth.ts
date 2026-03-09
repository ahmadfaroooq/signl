import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../middleware/auth'
import { ok, err } from '../types'

const router = Router()
const prisma = new PrismaClient()

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json(err('Email and password required'))
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    res.status(401).json(err('Invalid credentials'))
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json(err('Invalid credentials'))
    return
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'OWNER' | 'MANAGER' | 'CONTRACTOR',
  })

  res.json(ok({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }))
})

// POST /api/v1/auth/me — validate token + return user
router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json(err('No token'))
    return
  }
  // Token validation handled by authenticate middleware in calling routes
  res.json(ok({ message: 'Use /me with authenticate middleware' }))
})

export default router
