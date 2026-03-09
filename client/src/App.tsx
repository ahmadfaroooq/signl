import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Contracts } from './pages/Contracts'
import { Invoices } from './pages/Invoices'
import { Proposals } from './pages/Proposals'
import { Outreach } from './pages/Outreach'
import { SOPs } from './pages/SOPs'
import { Revenue } from './pages/Revenue'
import { Costs } from './pages/Costs'
import { Team } from './pages/Team'
import { Settings } from './pages/Settings'
import { Scorecard } from './pages/Scorecard'
import { Content } from './pages/Content'
import { LeadMagnets } from './pages/LeadMagnets'
import { Testimonials } from './pages/Testimonials'
import { useAuthStore } from './stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="outreach" element={<Outreach />} />
          <Route path="sops" element={<SOPs />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="costs" element={<Costs />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="scorecard" element={<Scorecard />} />
          <Route path="content" element={<Content />} />
          <Route path="lead-magnets" element={<LeadMagnets />} />
          <Route path="testimonials" element={<Testimonials />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
