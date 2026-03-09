import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyDisplay } from '../types'

interface CurrencyState {
  display: CurrencyDisplay
  setDisplay: (display: CurrencyDisplay) => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      display: 'BOTH',
      setDisplay: (display) => {
        // Apply CSS class to body for global CSS-based show/hide (T6 spec)
        document.body.classList.remove('currency-usd-only', 'currency-pkr-only')
        if (display === 'USD') document.body.classList.add('currency-usd-only')
        if (display === 'PKR') document.body.classList.add('currency-pkr-only')
        set({ display })
      },
    }),
    {
      name: 'signl-currency',
      onRehydrateStorage: () => (state) => {
        // Re-apply CSS class on page load from persisted state
        if (state?.display === 'USD') document.body.classList.add('currency-usd-only')
        if (state?.display === 'PKR') document.body.classList.add('currency-pkr-only')
      },
    }
  )
)
