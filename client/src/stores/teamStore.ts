import { create } from 'zustand'
import type { TeamMember } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface TeamState {
  members: TeamMember[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<TeamMember>) => Promise<TeamMember | null>
  update: (id: string, data: Partial<TeamMember>) => Promise<TeamMember | null>
  remove: (id: string) => Promise<void>
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<TeamMember[]>('/team', params as Record<string, unknown>)
      if (res.data) set({ members: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load team members' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<TeamMember>('/team', data)
    if (res.data) {
      set((state) => ({ members: [res.data!, ...state.members] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<TeamMember>(`/team/${id}`, data)
    if (res.data) {
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? res.data! : m)),
      }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/team/${id}`)
    set((state) => ({ members: state.members.filter((m) => m.id !== id) }))
  },
}))
