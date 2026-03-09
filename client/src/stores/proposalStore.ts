import { create } from 'zustand'
import type { Proposal } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface ProposalState {
  proposals: Proposal[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<Proposal>) => Promise<Proposal | null>
  update: (id: string, data: Partial<Proposal>) => Promise<Proposal | null>
  remove: (id: string) => Promise<void>
}

export const useProposalStore = create<ProposalState>((set) => ({
  proposals: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<Proposal[]>('/proposals', params as Record<string, unknown>)
      if (res.data) set({ proposals: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load proposals' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<Proposal>('/proposals', data)
    if (res.data) {
      set((state) => ({ proposals: [res.data!, ...state.proposals] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<Proposal>(`/proposals/${id}`, data)
    if (res.data) {
      set((state) => ({
        proposals: state.proposals.map((p) => (p.id === id ? res.data! : p)),
      }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/proposals/${id}`)
    set((state) => ({ proposals: state.proposals.filter((p) => p.id !== id) }))
  },
}))
