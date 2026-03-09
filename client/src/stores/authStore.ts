import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'
import { post } from '../lib/api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const res = await post<{ token: string; user: AuthUser }>('/auth/login', { email, password })
          if (res.data) {
            localStorage.setItem('signl_token', res.data.token)
            set({ user: res.data.user, token: res.data.token, loading: false })
            return true
          } else {
            set({ error: res.error ?? 'Login failed', loading: false })
            return false
          }
        } catch {
          set({ error: 'Login failed', loading: false })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('signl_token')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'signl-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
