import { create } from 'zustand'
import type { RevenueEntry } from '../types'
import { get as apiGet, post, del } from '../lib/api'

interface RevenueState {
  entries: RevenueEntry[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<RevenueEntry>) => Promise<RevenueEntry | null>
  remove: (id: string) => Promise<void>
}

export const useRevenueStore = create<RevenueState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<RevenueEntry[]>('/revenue', params as Record<string, unknown>)
      if (res.data) set({ entries: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load revenue' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<RevenueEntry>('/revenue', data)
    if (res.data) {
      set((state) => ({ entries: [res.data!, ...state.entries] }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/revenue/${id}`)
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }))
  },
}))
