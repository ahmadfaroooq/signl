import { create } from 'zustand'
import type { LeadMagnet } from '../types'
import { get as apiGet, post, patch } from '../lib/api'

interface LeadMagnetState {
  magnets: LeadMagnet[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<LeadMagnet>) => Promise<LeadMagnet | null>
  update: (id: string, data: Partial<LeadMagnet>) => Promise<LeadMagnet | null>
}

export const useLeadMagnetStore = create<LeadMagnetState>((set) => ({
  magnets: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<LeadMagnet[]>('/lead-magnets', params as Record<string, unknown>)
      if (res.data) set({ magnets: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load lead magnets' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<LeadMagnet>('/lead-magnets', data)
    if (res.data) {
      set((state) => ({ magnets: [res.data!, ...state.magnets] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<LeadMagnet>(`/lead-magnets/${id}`, data)
    if (res.data) {
      set((state) => ({
        magnets: state.magnets.map((m) => (m.id === id ? res.data! : m)),
      }))
      return res.data
    }
    return null
  },
}))
