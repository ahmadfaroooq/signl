import { create } from 'zustand'
import type { ScorecardEntry } from '../types'
import { get as apiGet, post, patch } from '../lib/api'

interface ScorecardState {
  entries: ScorecardEntry[]
  trend: ScorecardEntry[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<ScorecardEntry>) => Promise<ScorecardEntry | null>
  update: (id: string, data: Partial<ScorecardEntry>) => Promise<ScorecardEntry | null>
  fetchTrend: () => Promise<void>
}

export const useScorecardStore = create<ScorecardState>((set) => ({
  entries: [],
  trend: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<ScorecardEntry[]>('/scorecard', params as Record<string, unknown>)
      if (res.data) set({ entries: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load scorecard entries' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<ScorecardEntry>('/scorecard', data)
    if (res.data) {
      set((state) => ({ entries: [res.data!, ...state.entries] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<ScorecardEntry>(`/scorecard/${id}`, data)
    if (res.data) {
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? res.data! : e)),
      }))
      return res.data
    }
    return null
  },

  fetchTrend: async () => {
    const res = await apiGet<ScorecardEntry[]>('/scorecard/trend')
    if (res.data) set({ trend: res.data })
  },
}))
