# SIGNL — Business OS

> Infrastructure that turns your signal into revenue.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Railway)

### 1. Clone & Install

```bash
cd d:/signl
npm run install:all
```

### 2. Configure Environment

```bash
# Copy example env for server
cp .env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET
```

### 3. Database Setup

```bash
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed: Settings + Ahmad Farooq (OWNER) + SOP templates
```

**Default login after seed:**
- Email: `ahmad@signl.io`
- Password: `signl2026!`

### 4. Start Development

```bash
npm run dev
# Client → http://localhost:3000
# Server → http://localhost:4000
```

---

## Architecture

```
signl/
├── client/          # React 18 + Vite + TypeScript + Tailwind
│   └── src/
│       ├── assets/        # logo.svg
│       ├── components/
│       │   ├── shared/    # CurrencyDisplay, MetricCard, MoneyInput, DataTable...
│       │   ├── layout/    # Sidebar, TopBar, AppLayout
│       │   ├── clients/   # ClientForm, ClientKanban
│       │   ├── contracts/ # ContractPDF
│       │   └── invoices/  # InvoicePDF
│       ├── lib/            # api.ts, currency.ts, contractTemplates.ts
│       ├── pages/          # Dashboard, Clients, Contracts, Invoices...
│       ├── stores/         # authStore, settingsStore, currencyStore, clientStore...
│       └── types/          # index.ts — all TypeScript types
└── server/          # Node.js + Express + Prisma
    ├── prisma/
    │   ├── schema.prisma  # Full 14-module schema
    │   └── seed.ts
    └── src/
        ├── middleware/    # auth.ts, roleCheck.ts
        ├── routes/        # settings, clients, contracts, invoices, revenue, costs, proposals, dashboard
        ├── services/      # currencyService.ts
        └── index.ts
```

## MVP Modules (Built)

| Module | Status | Features |
|--------|--------|---------|
| Dashboard | ✅ | Metric cards, revenue trend chart, alerts feed, quick actions |
| Clients CRM | ✅ | List view + Kanban, LTV computed, full CRUD |
| Contracts | ✅ | 4 templates (Audit/System Build/DWY/DFY), PDF export with logo |
| Invoices | ✅ | Create, mark sent/paid, auto-create revenue entry, PDF export |
| Auth | ✅ | JWT, role-based middleware (OWNER/MANAGER/CONTRACTOR) |

## Phase 2 Modules (Stubbed — Ready to Build)

- Outreach Tracker (M2)
- Proposals (M3)
- SOPs with decision branches (M5)
- Revenue + Costs with full CAC logic (M11/M12)
- Content Calendar (M8)
- Lead Magnets (M9)
- Testimonials (M10)
- Team (M13)
- Scorecard (M14)
- Settings page (full UI)

## Design System

- **Background:** `#F7F5F0` (warm off-white)
- **Base:** `#0D1117` (primary text + sidebar)
- **Amber:** `#F5A623` (accents, active states — used sparingly)
- **Border:** `#E2E2E2` (1px borders only — no shadows)
- **Fonts:** Inter (UI) + Roboto Condensed (metrics) + JetBrains Mono (code)
- **Icons:** Material Symbols Outlined, weight 100-300
- **Border radius:** Max 4px. Cards: 0px. Buttons: 0px.

## Non-Negotiables (T9.2)

- Exchange rates never hardcoded — always read from Settings
- `exchange_rate_used` stored as snapshot on every transaction
- `amount_usd` + `amount_pkr` computed server-side at save time
- Financial records: soft delete only (`deleted_at`)
- Role middleware on every API route
- Global currency toggle: both shown by default, CSS-based show/hide
