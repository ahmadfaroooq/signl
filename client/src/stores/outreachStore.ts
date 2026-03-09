import { create } from 'zustand'
import type { OutreachDm, OutreachComment, OutreachStats } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface OutreachState {
  dms: OutreachDm[]
  comments: OutreachComment[]
  stats: OutreachStats | null
  loading: boolean
  error: string | null
  fetchDms: (params?: Record<string, string>) => Promise<void>
  createDm: (data: Partial<OutreachDm>) => Promise<OutreachDm | null>
  updateDm: (id: string, data: Partial<OutreachDm>) => Promise<OutreachDm | null>
  removeDm: (id: string) => Promise<void>
  fetchComments: () => Promise<void>
  createComment: (data: Partial<OutreachComment>) => Promise<OutreachComment | null>
  removeComment: (id: string) => Promise<void>
  fetchStats: () => Promise<void>
}

export const useOutreachStore = create<OutreachState>((set) => ({
  dms: [],
  comments: [],
  stats: null,
  loading: false,
  error: null,

  fetchDms: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<OutreachDm[]>('/outreach/dms', params as Record<string, unknown>)
      if (res.data) set({ dms: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load DMs' })
    } finally {
      set({ loading: false })
    }
  },

  createDm: async (data) => {
    const res = await post<OutreachDm>('/outreach/dms', data)
    if (res.data) {
      set((state) => ({ dms: [res.data!, ...state.dms] }))
      return res.data
    }
    return null
  },

  updateDm: async (id, data) => {
    const res = await patch<OutreachDm>(`/outreach/dms/${id}`, data)
    if (res.data) {
      set((state) => ({
        dms: state.dms.map((d) => (d.id === id ? res.data! : d)),
      }))
      return res.data
    }
    return null
  },

  removeDm: async (id) => {
    await del(`/outreach/dms/${id}`)
    set((state) => ({ dms: state.dms.filter((d) => d.id !== id) }))
  },

  fetchComments: async () => {
    const res = await apiGet<OutreachComment[]>('/outreach/comments')
    if (res.data) set({ comments: res.data })
  },

  createComment: async (data) => {
    const res = await post<OutreachComment>('/outreach/comments', data)
    if (res.data) {
      set((state) => ({ comments: [res.data!, ...state.comments] }))
      return res.data
    }
    return null
  },

  removeComment: async (id) => {
    await del(`/outreach/comments/${id}`)
    set((state) => ({ comments: state.comments.filter((c) => c.id !== id) }))
  },

  fetchStats: async () => {
    const res = await apiGet<OutreachStats>('/outreach/stats')
    if (res.data) set({ stats: res.data })
  },
}))
