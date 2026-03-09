import { Response, NextFunction } from 'express'
import { AuthRequest, Role, err } from '../types'

/**
 * Role-based access middleware. Server-enforced only — never trust client role claims.
 * Usage: router.put('/settings', authenticate, requireRole('OWNER'), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(err('Unauthorized'))
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json(err(`Forbidden — requires role: ${roles.join(' or ')}`))
      return
    }
    next()
  }
}

/**
 * Blocks CONTRACTOR from all financial routes.
 */
export function blockContractor(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role === 'CONTRACTOR') {
    res.status(403).json(err('Forbidden — contractors cannot access financial data'))
    return
  }
  next()
}
