import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function Login() {
  const [email, setEmail] = useState('ahmad@signl.io')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'var(--color-base)',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#F5A623',
                letterSpacing: '0.1em',
              }}
            >
              SIGNL
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Sign In</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>SIGNL Business OS</p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: 'var(--color-red)', padding: '6px 10px', border: '1px solid var(--color-red)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', marginTop: 16 }}>
          Infrastructure that turns your signal into revenue
        </p>
      </div>
    </div>
  )
}
