import { create } from 'zustand'
import type { Alert, UnitEconomics, TrendDataPoint } from '../types'
import { get } from '../lib/api'

interface DashboardState {
  alerts: Alert[]
  unitEconomics: UnitEconomics | null
  trends: TrendDataPoint[]
  loading: boolean
  fetchAll: (month?: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  alerts: [],
  unitEconomics: null,
  trends: [],
  loading: false,

  fetchAll: async (month) => {
    set({ loading: true })
    try {
      const [alertsRes, econRes, trendsRes] = await Promise.all([
        get<Alert[]>('/dashboard/alerts'),
        get<UnitEconomics>('/dashboard/unit-economics', month ? { month } : undefined),
        get<TrendDataPoint[]>('/dashboard/trends'),
      ])
      set({
        alerts: alertsRes.data ?? [],
        unitEconomics: econRes.data,
        trends: trendsRes.data ?? [],
      })
    } finally {
      set({ loading: false })
    }
  },
}))
