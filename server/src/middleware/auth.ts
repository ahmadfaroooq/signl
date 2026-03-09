import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest, AuthUser, err } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json(err('Unauthorized — no token'))
    return
  }

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser
    req.user = payload
    next()
  } catch {
    res.status(401).json(err('Unauthorized — invalid token'))
  }
}

export function generateToken(user: AuthUser): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' } as any)
}
