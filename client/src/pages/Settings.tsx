import { useEffect, useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import type { CurrencyDisplay } from '../types'

export function Settings() {
  const { settings, loading, fetch: fetchSettings, update } = useSettingsStore()
  const { user } = useAuthStore()
  const isOwner = user?.role === 'OWNER'

  // Business Info section
  const [bizForm, setBizForm] = useState({
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    ownerAddress: '',
  })
  const [savingBiz, setSavingBiz] = useState(false)
  const [bizSaved, setBizSaved] = useState(false)

  // Financial section
  const [finForm, setFinForm] = useState({
    usdPkrRate: '',
    hourlyRateUsd: '',
    currencyDisplayDefault: 'BOTH' as CurrencyDisplay,
  })
  const [savingFin, setSavingFin] = useState(false)
  const [finSaved, setFinSaved] = useState(false)
  const [showRateWarning, setShowRateWarning] = useState(false)

  // Health Thresholds section
  const [threshForm, setThreshForm] = useState({
    ltv_cac_warn: '',
    margin_warn: '',
    scorecard_warn: '',
  })
  const [savingThresh, setSavingThresh] = useState(false)
  const [threshSaved, setThreshSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Pre-fill forms when settings load
  useEffect(() => {
    if (!settings) return
    setBizForm({
      businessName: settings.businessName ?? '',
      ownerName: settings.ownerName ?? '',
      ownerEmail: settings.ownerEmail ?? '',
      ownerAddress: settings.ownerAddress ?? '',
    })
    setFinForm({
      usdPkrRate: String(settings.usdPkrRate ?? ''),
      hourlyRateUsd: String(settings.hourlyRateUsd ?? ''),
      currencyDisplayDefault: settings.currencyDisplayDefault ?? 'BOTH',
    })
    setThreshForm({
      ltv_cac_warn: String(settings.healthThresholds?.ltv_cac_warn ?? ''),
      margin_warn: String(settings.healthThresholds?.margin_warn ?? ''),
      scorecard_warn: String(settings.healthThresholds?.scorecard_warn ?? ''),
    })
  }, [settings])

  const showSaved = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  const handleSaveBiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setSavingBiz(true)
    await update({
      businessName: bizForm.businessName,
      ownerName: bizForm.ownerName,
      ownerEmail: bizForm.ownerEmail,
      ownerAddress: bizForm.ownerAddress,
    })
    setSavingBiz(false)
    showSaved(setBizSaved)
  }

  const handleSaveFin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setSavingFin(true)
    await update({
      usdPkrRate: parseFloat(finForm.usdPkrRate) || 0,
      hourlyRateUsd: parseFloat(finForm.hourlyRateUsd) || 0,
      currencyDisplayDefault: finForm.currencyDisplayDefault,
    })
    setSavingFin(false)
    showSaved(setFinSaved)
  }

  const handleSaveThresh = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setSavingThresh(true)
    await update({
      healthThresholds: {
        ltv_cac_warn: parseFloat(threshForm.ltv_cac_warn) || 0,
        margin_warn: parseFloat(threshForm.margin_warn) || 0,
        scorecard_warn: parseFloat(threshForm.scorecard_warn) || 0,
      },
    })
    setSavingThresh(false)
    showSaved(setThreshSaved)
  }

  if (loading && !settings) {
    return (
      <div className="page-container">
        <div className="loading-state">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Settings</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Business configuration and thresholds
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: isOwner ? 'var(--color-green)' : 'var(--color-muted)' }}
          >
            {isOwner ? 'admin_panel_settings' : 'lock'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            {isOwner ? 'Owner access' : `${user?.role ?? 'Limited'} — read only`}
          </span>
        </div>
      </div>

      {/* Read-only notice for non-owners */}
      {!isOwner && (
        <div
          style={{
            padding: '12px 16px',
            border: '1px solid var(--color-amber)',
            borderLeft: '3px solid var(--color-amber)',
            background: 'rgba(245, 166, 35, 0.06)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-amber)' }}>info</span>
          Settings can only be modified by the Owner. You are viewing read-only values.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Section 1: Business Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-amber)' }}>business</span>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Business Info</h2>
          </div>
          <form onSubmit={handleSaveBiz}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label">Business Name</label>
                  <input
                    className="input"
                    value={bizForm.businessName}
                    onChange={(e) => setBizForm((f) => ({ ...f, businessName: e.target.value }))}
                    disabled={!isOwner}
                    placeholder="SIGNL"
                  />
                </div>
                <div>
                  <label className="label">Owner Name</label>
                  <input
                    className="input"
                    value={bizForm.ownerName}
                    onChange={(e) => setBizForm((f) => ({ ...f, ownerName: e.target.value }))}
                    disabled={!isOwner}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Owner Email</label>
                <input
                  className="input"
                  type="email"
                  value={bizForm.ownerEmail}
                  onChange={(e) => setBizForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                  disabled={!isOwner}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label">Business Address</label>
                <textarea
                  className="input"
                  value={bizForm.ownerAddress}
                  onChange={(e) => setBizForm((f) => ({ ...f, ownerAddress: e.target.value }))}
                  disabled={!isOwner}
                  rows={2}
                  placeholder="123 Main St, City, Country"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                {bizSaved && (
                  <span style={{ fontSize: 12, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                    Saved
                  </span>
                )}
                <button type="submit" className="btn btn-primary" disabled={savingBiz}>
                  {savingBiz ? 'Saving...' : 'Save Business Info'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Section 2: Financial */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-amber)' }}>payments</span>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Financial Settings</h2>
          </div>
          <form onSubmit={handleSaveFin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label">USD/PKR Exchange Rate</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={finForm.usdPkrRate}
                    onChange={(e) => {
                      setFinForm((f) => ({ ...f, usdPkrRate: e.target.value }))
                      setShowRateWarning(true)
                    }}
                    disabled={!isOwner}
                    placeholder="278.50"
                  />
                  {settings?.rateUpdatedAt && (
                    <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                      Last updated:{' '}
                      {new Date(settings.rateUpdatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {showRateWarning && isOwner && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        border: '1px solid var(--color-amber)',
                        borderLeft: '3px solid var(--color-amber)',
                        background: 'rgba(245, 166, 35, 0.06)',
                        fontSize: 12,
                        color: 'var(--color-base)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-amber)', marginTop: 1 }}>warning</span>
                      This will affect all future PKR conversions. Existing records retain their original rate.
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Hourly Rate (USD)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={finForm.hourlyRateUsd}
                    onChange={(e) => setFinForm((f) => ({ ...f, hourlyRateUsd: e.target.value }))}
                    disabled={!isOwner}
                    placeholder="50.00"
                  />
                  <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                    Used for TIME-type cost calculations
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Currency Display Default</label>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  {(['BOTH', 'USD', 'PKR'] as CurrencyDisplay[]).map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        cursor: isOwner ? 'pointer' : 'default',
                        color: 'var(--color-base)',
                      }}
                    >
                      <input
                        type="radio"
                        name="currencyDisplay"
                        value={opt}
                        checked={finForm.currencyDisplayDefault === opt}
                        onChange={() => setFinForm((f) => ({ ...f, currencyDisplayDefault: opt }))}
                        disabled={!isOwner}
                        style={{ cursor: isOwner ? 'pointer' : 'default' }}
                      />
                      <span>{opt === 'BOTH' ? 'Both (USD + PKR)' : opt}</span>
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>
                  Controls which currency is shown by default throughout the app
                </p>
              </div>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                {finSaved && (
                  <span style={{ fontSize: 12, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                    Saved
                  </span>
                )}
                <button type="submit" className="btn btn-primary" disabled={savingFin}>
                  {savingFin ? 'Saving...' : 'Save Financial Settings'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Section 3: Health Thresholds */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-amber)' }}>monitor_heart</span>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Health Thresholds</h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
            Alert thresholds for business health monitoring. Values below these thresholds trigger amber warnings on the dashboard.
          </p>
          <form onSubmit={handleSaveThresh}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div>
                <label className="label">LTV:CAC Ratio Warn</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={threshForm.ltv_cac_warn}
                  onChange={(e) => setThreshForm((f) => ({ ...f, ltv_cac_warn: e.target.value }))}
                  disabled={!isOwner}
                  placeholder="3"
                />
                <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                  Warn if LTV:CAC drops below this
                </p>
              </div>
              <div>
                <label className="label">Margin Warn (%)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={threshForm.margin_warn}
                  onChange={(e) => setThreshForm((f) => ({ ...f, margin_warn: e.target.value }))}
                  disabled={!isOwner}
                  placeholder="40"
                />
                <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                  Warn if gross margin falls below this %
                </p>
              </div>
              <div>
                <label className="label">Scorecard Warn</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={threshForm.scorecard_warn}
                  onChange={(e) => setThreshForm((f) => ({ ...f, scorecard_warn: e.target.value }))}
                  disabled={!isOwner}
                  placeholder="70"
                />
                <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                  Warn if weekly scorecard is below this
                </p>
              </div>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                {threshSaved && (
                  <span style={{ fontSize: 12, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                    Saved
                  </span>
                )}
                <button type="submit" className="btn btn-primary" disabled={savingThresh}>
                  {savingThresh ? 'Saving...' : 'Save Thresholds'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>
            SIGNL Business OS · Logged in as{' '}
            <strong style={{ color: 'var(--color-base)' }}>{user?.name ?? '—'}</strong>
            {' '}({user?.role ?? '—'})
          </p>
        </div>
      </div>
    </div>
  )
}
