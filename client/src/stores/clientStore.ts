import { create } from 'zustand'
import type { Client } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface ClientState {
  clients: Client[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<Client>) => Promise<Client | null>
  update: (id: string, data: Partial<Client>) => Promise<Client | null>
  remove: (id: string) => Promise<void>
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<Client[]>('/clients', params as Record<string, unknown>)
      if (res.data) set({ clients: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load clients' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<Client>('/clients', data)
    if (res.data) {
      set((state) => ({ clients: [res.data!, ...state.clients] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<Client>(`/clients/${id}`, data)
    if (res.data) {
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? res.data! : c)),
      }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/clients/${id}`)
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
  },
}))
