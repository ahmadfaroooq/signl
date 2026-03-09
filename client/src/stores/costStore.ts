import { create } from 'zustand'
import type { CostEntry } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface CostState {
  entries: CostEntry[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<CostEntry>) => Promise<CostEntry | null>
  update: (id: string, data: Partial<CostEntry>) => Promise<CostEntry | null>
  remove: (id: string) => Promise<void>
}

export const useCostStore = create<CostState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<CostEntry[]>('/costs', params as Record<string, unknown>)
      if (res.data) set({ entries: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load costs' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<CostEntry>('/costs', data)
    if (res.data) {
      set((state) => ({ entries: [res.data!, ...state.entries] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<CostEntry>(`/costs/${id}`, data)
    if (res.data) {
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? res.data! : e)),
      }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/costs/${id}`)
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }))
  },
}))
