import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useSettingsStore } from '../../stores/settingsStore'
import { useDashboardStore } from '../../stores/dashboardStore'

export function AppLayout() {
  const { fetch: fetchSettings, settings } = useSettingsStore()
  const { fetchAll } = useDashboardStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings) fetchAll()
  }, [settings, fetchAll])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
