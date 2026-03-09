import { create } from 'zustand'
import type { ContentPost } from '../types'
import { get as apiGet, post, patch } from '../lib/api'

interface ContentState {
  posts: ContentPost[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<ContentPost>) => Promise<ContentPost | null>
  update: (id: string, data: Partial<ContentPost>) => Promise<ContentPost | null>
}

export const useContentStore = create<ContentState>((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<ContentPost[]>('/content', params as Record<string, unknown>)
      if (res.data) set({ posts: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load content posts' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<ContentPost>('/content', data)
    if (res.data) {
      set((state) => ({ posts: [res.data!, ...state.posts] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<ContentPost>(`/content/${id}`, data)
    if (res.data) {
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? res.data! : p)),
      }))
      return res.data
    }
    return null
  },
}))
