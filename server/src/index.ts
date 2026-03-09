import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import settingsRoutes from './routes/settings'
import clientRoutes from './routes/clients'
import contractRoutes from './routes/contracts'
import invoiceRoutes from './routes/invoices'
import revenueRoutes from './routes/revenue'
import costRoutes from './routes/costs'
import proposalRoutes from './routes/proposals'
import dashboardRoutes from './routes/dashboard'
import outreachRoutes from './routes/outreach'
import sopRoutes from './routes/sops'
import teamRoutes from './routes/team'
import scorecardRoutes from './routes/scorecard'
import contentRoutes from './routes/content'
import magnetRoutes from './routes/magnets'
import testimonialRoutes from './routes/testimonials'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/clients', clientRoutes)
app.use('/api/v1/contracts', contractRoutes)
app.use('/api/v1/invoices', invoiceRoutes)
app.use('/api/v1/revenue', revenueRoutes)
app.use('/api/v1/costs', costRoutes)
app.use('/api/v1/proposals', proposalRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/outreach', outreachRoutes)
app.use('/api/v1/sops', sopRoutes)
app.use('/api/v1/team', teamRoutes)
app.use('/api/v1/scorecard', scorecardRoutes)
app.use('/api/v1/content', contentRoutes)
app.use('/api/v1/lead-magnets', magnetRoutes)
app.use('/api/v1/testimonials', testimonialRoutes)

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SIGNL API', timestamp: new Date().toISOString() })
})

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Route not found' })
})

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({ data: null, error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✅ SIGNL API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
