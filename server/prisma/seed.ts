import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed Settings (single row)
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      usdPkrRate: 278.5,
      rateUpdatedAt: new Date(),
      hourlyRateUsd: 25.0,
      currencyDisplayDefault: 'BOTH',
      businessName: 'SIGNL',
      ownerName: 'Ahmad Farooq',
      ownerEmail: 'ahmad@signl.io',
      ownerAddress: '',
      healthThresholds: { ltv_cac_warn: 5, margin_warn: 60, scorecard_warn: 35 },
    },
  })

  // Seed OWNER user
  const hash = await bcrypt.hash('signl2026!', 12)
  await prisma.user.upsert({
    where: { email: 'ahmad@signl.io' },
    update: {},
    create: {
      email: 'ahmad@signl.io',
      name: 'Ahmad Farooq',
      role: 'OWNER',
      passwordHash: hash,
      isActive: true,
    },
  })

  // Seed SOP Templates
  const sopTemplates = [
    {
      name: 'Audit SOP',
      offerType: 'AUDIT' as const,
      description: '6-business-day LinkedIn profile + content + funnel audit',
      tasks: [
        { id: 't1', phase: 'Day 0', title: 'Send onboarding questionnaire', order: 1 },
        { id: 't2', phase: 'Day 0', title: 'Request LinkedIn access', order: 2, isDecisionPoint: true, declineAction: 'Public audit only — skip private analytics tasks' },
        { id: 't3', phase: 'Day 1', title: 'Profile deep-dive analysis', order: 3 },
        { id: 't4', phase: 'Day 1', title: 'Headline + banner review', order: 4 },
        { id: 't5', phase: 'Day 2', title: 'Content strategy analysis (last 30 posts)', order: 5 },
        { id: 't6', phase: 'Day 2', title: 'Engagement rate benchmarking', order: 6 },
        { id: 't7', phase: 'Day 3', title: 'Funnel map — profile → DMs → calls', order: 7 },
        { id: 't8', phase: 'Day 3', title: 'Lead magnet review', order: 8 },
        { id: 't9', phase: 'Day 4', title: 'Build Notion audit workspace', order: 9 },
        { id: 't10', phase: 'Day 4', title: 'Record Loom walkthrough', order: 10 },
        { id: 't11', phase: 'Day 5', title: 'Client delivery call', order: 11 },
        { id: 't12', phase: 'Day 5', title: 'Send final deliverable document', order: 12 },
        { id: 't13', phase: 'Day 6', title: 'Buffer + revisions day', order: 13 },
        { id: 't14', phase: 'Day 6', title: 'Request testimonial', order: 14 },
      ],
    },
    {
      name: 'System Build SOP',
      offerType: 'SYSTEM_BUILD' as const,
      description: '18-business-day full LinkedIn content + outreach system build',
      tasks: [
        { id: 't1', phase: 'Day 0', title: 'Onboarding call + questionnaire', order: 1 },
        { id: 't2', phase: 'Day 1', title: 'Kickoff session — goals + constraints', order: 2 },
        { id: 't3', phase: 'Days 2-3', title: 'Profile optimisation', order: 3 },
        { id: 't4', phase: 'Days 4-6', title: 'Lead magnet creation', order: 4 },
        { id: 't5', phase: 'Days 7-12', title: 'Content system build (30-day calendar)', order: 5 },
        { id: 't6', phase: 'Days 13-15', title: 'Outreach playbook + scripts', order: 6 },
        { id: 't7', phase: 'Day 16', title: 'QC review — all deliverables', order: 7 },
        { id: 't8', phase: 'Days 17-18', title: 'Handover session + async Q&A', order: 8 },
      ],
    },
    {
      name: 'DWY Retainer SOP',
      offerType: 'DWY' as const,
      description: 'Done-with-you ongoing monthly retainer',
      tasks: [
        { id: 't1', phase: 'Week 1', title: 'Setup — access, tools, workflow', order: 1 },
        { id: 't2', phase: 'Weekly', title: 'Strategy call (60 min)', order: 2 },
        { id: 't3', phase: 'Weekly', title: 'Async feedback on content drafts', order: 3 },
        { id: 't4', phase: 'Weekly', title: 'Outreach review + coaching', order: 4 },
        { id: 't5', phase: 'Monthly', title: 'Monthly game plan session', order: 5 },
        { id: 't6', phase: 'Monthly', title: 'Monthly results review', order: 6 },
        { id: 't7', phase: 'Monthly', title: 'Invoice + renewal check', order: 7 },
      ],
    },
    {
      name: 'DFY Retainer SOP',
      offerType: 'DFY' as const,
      description: 'Done-for-you ongoing monthly retainer — full ghostwriting + engagement',
      tasks: [
        { id: 't1', phase: 'Month 0', title: 'Voice capture session', order: 1 },
        { id: 't2', phase: 'Month 0', title: 'Brand voice guide creation', order: 2 },
        { id: 't3', phase: 'Weekly', title: 'Content batch creation (3-5 posts)', order: 3 },
        { id: 't4', phase: 'Weekly', title: 'Engagement management (comments + DMs)', order: 4 },
        { id: 't5', phase: 'Weekly', title: 'Outreach execution', order: 5 },
        { id: 't6', phase: 'Monthly', title: 'Monthly performance report', order: 6 },
        { id: 't7', phase: 'Monthly', title: 'Strategy review call', order: 7 },
        { id: 't8', phase: 'Monthly', title: 'Invoice + renewal', order: 8 },
      ],
    },
  ]

  for (const template of sopTemplates) {
    await prisma.sopTemplate.upsert({
      where: { id: template.offerType },
      update: {},
      create: { id: template.offerType, ...template },
    })
  }

  console.log('✅ Seed complete — Settings, Owner user, and SOP templates created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
