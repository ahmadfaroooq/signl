import { Request } from 'express'

export type Role = 'OWNER' | 'MANAGER' | 'CONTRACTOR'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: Record<string, unknown>
}

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, error: null, meta }
}

export function err(message: string): ApiResponse<null> {
  return { data: null, error: message }
}

export interface LineItem {
  description: string
  amount: number
  currency: 'USD' | 'PKR'
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
