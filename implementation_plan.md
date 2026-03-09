# SIGNL Business OS - Implementation Plan

## Goal Description
Build a comprehensive Business Operating System for solo founders. A single-URL web app replacing multiple tools (Notion, CRM, Invoicing, etc.) with 14 integrated modules.

## Technical Stack
- **Frontend**: React 18 + TypeScript (Vite), Tailwind CSS, Zustand, Recharts, Material Symbols Outlined.
- **Backend**: Node.js + Express (REST API).
- **Database**: PostgreSQL with Prisma ORM.
- **Auth**: NextAuth or Clerk (Role-based: OWNER, MANAGER, CONTRACTOR).
- **Hosting**: Vercel (Frontend), Railway (Backend + DB).

## Required API Keys & Secrets
> [!IMPORTANT]
> The following services will require keys to be configured in `.env` files:
1. **Supabase/Railway**: Database connection string.
2. **Clerk/NextAuth**: Auth secrets (Client ID, Secret).
3. **Resend/SendGrid**: For sending invoices (Optional but recommended).
4. **OpenAI API Key**: (Optional, if AI features are added later).

## Proposed Changes

### [Phase 1: Project Initialization]
#### [NEW] [Folder Structure](file:///d:/signl/)
Establish the monorepo-style structure or separate frontend/backend folders.
- `client/`: React + Vite + TypeScript application.
- `server/`: Node.js + Express + Prisma.

#### [NEW] [Prisma Schema](file:///d:/signl/server/prisma/schema.prisma)
Define the initial schema based on T3 spec (Settings, Users, Clients, Revenue, Costs).

### [Phase 2: Core Infrastructure]
#### [NEW] [Global Settings](file:///d:/signl/client/src/stores/settingsStore.ts)
Implement Zustand store for exchange rates and currency toggles.

### [Phase 3: Module 4 (CRM) & Module 6 (Contracts)]
#### [NEW] [Client Management](file:///d:/signl/client/src/pages/CRM.tsx)
Build the primary CRM list and Kanban views.

## Verification Plan

### Automated Tests
- `npm run test`: Run Vitest/Jest for financial conversion logic (T6).
- `npx prisma validate`: Ensure schema integrity.

### Manual Verification
- Verify logo rendering in sidebar and PDF exports.
- Test USD/PKR toggle across all financial components.
- Confirm role-based access restricts CONTRACTORS from viewing financial data.
