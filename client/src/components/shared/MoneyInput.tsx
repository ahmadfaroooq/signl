import { useState } from 'react'
import type { Currency } from '../../types'
import { useSettingsStore } from '../../stores/settingsStore'
import { previewConvert, formatUsd, formatPkr } from '../../lib/currency'

interface MoneyInputProps {
  value: string
  currency: Currency
  onChange: (amount: string, currency: Currency) => void
  label?: string
  required?: boolean
  className?: string
}

/**
 * Amount field + currency dropdown. Shows converted equivalent on blur.
 * T7.1 spec: MoneyInput component must accept any currency and show converted equivalent on blur.
 */
export function MoneyInput({ value, currency, onChange, label, required, className = '' }: MoneyInputProps) {
  const { settings } = useSettingsStore()
  const [preview, setPreview] = useState<string | null>(null)

  const handleBlur = () => {
    if (!settings || !value) { setPreview(null); return }
    const num = parseFloat(value)
    if (isNaN(num)) { setPreview(null); return }
    const rate = Number(settings.usdPkrRate)
    const { usd, pkr } = previewConvert(num, currency, rate)
    setPreview(currency === 'USD' ? `≈ ${formatPkr(pkr)}` : `≈ ${formatUsd(usd)}`)
  }

  return (
    <div className={className}>
      {label && <label className="label">{label}{required && ' *'}</label>}
      <div style={{ display: 'flex', gap: 0 }}>
        <input
          type="number"
          className="input"
          style={{ borderRadius: 0, flex: 1 }}
          value={value}
          onChange={(e) => onChange(e.target.value, currency)}
          onBlur={handleBlur}
          onFocus={() => setPreview(null)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required={required}
        />
        <select
          className="select"
          style={{ width: 72, borderLeft: 'none', borderRadius: 0, flexShrink: 0 }}
          value={currency}
          onChange={(e) => onChange(value, e.target.value as Currency)}
        >
          <option value="USD">USD</option>
          <option value="PKR">PKR</option>
        </select>
      </div>
      {preview && (
        <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 3 }}>{preview}</p>
      )}
    </div>
  )
}
