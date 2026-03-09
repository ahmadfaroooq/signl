import { create } from 'zustand'
import type { Settings } from '../types'
import { get, put } from '../lib/api'

interface SettingsState {
  settings: Settings | null
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  update: (data: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get_state) => ({
  settings: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const res = await get<Settings>('/settings')
      if (res.data) set({ settings: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load settings' })
    } finally {
      set({ loading: false })
    }
  },

  update: async (data) => {
    const res = await put<Settings>('/settings', data)
    if (res.data) set({ settings: res.data })
  },
}))
