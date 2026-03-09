import { create } from 'zustand'
import type { Testimonial } from '../types'
import { get as apiGet, post, patch, del } from '../lib/api'

interface TestimonialState {
  testimonials: Testimonial[]
  loading: boolean
  error: string | null
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: Partial<Testimonial>) => Promise<Testimonial | null>
  update: (id: string, data: Partial<Testimonial>) => Promise<Testimonial | null>
  remove: (id: string) => Promise<void>
}

export const useTestimonialStore = create<TestimonialState>((set) => ({
  testimonials: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<Testimonial[]>('/testimonials', params as Record<string, unknown>)
      if (res.data) set({ testimonials: res.data })
      else set({ error: res.error })
    } catch {
      set({ error: 'Failed to load testimonials' })
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    const res = await post<Testimonial>('/testimonials', data)
    if (res.data) {
      set((state) => ({ testimonials: [res.data!, ...state.testimonials] }))
      return res.data
    }
    return null
  },

  update: async (id, data) => {
    const res = await patch<Testimonial>(`/testimonials/${id}`, data)
    if (res.data) {
      set((state) => ({
        testimonials: state.testimonials.map((t) => (t.id === id ? res.data! : t)),
      }))
      return res.data
    }
    return null
  },

  remove: async (id) => {
    await del(`/testimonials/${id}`)
    set((state) => ({ testimonials: state.testimonials.filter((t) => t.id !== id) }))
  },
}))
