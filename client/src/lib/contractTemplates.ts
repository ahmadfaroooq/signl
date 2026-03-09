import type { OfferType } from '../types'

export interface ContractSection {
  title: string
  content: string
}

export interface ContractTemplate {
  offerType: OfferType
  name: string
  sections: ContractSection[]
}

/**
 * Four contract templates — one per offer type.
 * Variable fields use {{PLACEHOLDER}} syntax.
 * Populated from client data at render time.
 */
export const CONTRACT_TEMPLATES: Record<OfferType, ContractTemplate> = {
  AUDIT: {
    offerType: 'AUDIT',
    name: 'LinkedIn Audit Agreement',
    sections: [
      {
        title: '1. Parties',
        content: `This agreement ("Agreement") is entered into as of {{DATE}} between {{BUSINESS_NAME}} ("Provider"), and {{CLIENT_NAME}}{{CLIENT_COMPANY}} ("Client").`,
      },
      {
        title: '2. Services',
        content: `Provider agrees to deliver a comprehensive LinkedIn Profile & Content Audit ("Audit") over six (6) business days. The Audit includes:\n\n• Profile deep-dive analysis (headline, banner, about, featured)\n• Content strategy review (last 30 posts)\n• Engagement rate benchmarking\n• Funnel map — profile → DMs → discovery calls\n• Lead magnet review\n• Full written audit report delivered via Notion workspace\n• Video walkthrough (Loom recording)\n\nNote on LinkedIn Access: If Client declines to provide LinkedIn credentials, Provider will conduct a Public Audit Only, limited to publicly visible data. Price remains unchanged.`,
      },
      {
        title: '3. Investment',
        content: `Client agrees to pay {{CONTRACT_VALUE}} for the Audit services described herein.\n\nPayment is due in full before Day 0 onboarding begins. No work commences until payment is confirmed.`,
      },
      {
        title: '4. Timeline',
        content: `Provider will deliver the completed Audit within six (6) business days of receiving payment and completed onboarding questionnaire from Client. Timeline begins on Day 0 (onboarding day).`,
      },
      {
        title: '5. Intellectual Property',
        content: `Upon receipt of full payment, Client owns all deliverables produced under this Agreement. Provider retains the right to reference the engagement in case studies and portfolio materials, subject to Client approval.`,
      },
      {
        title: '6. Confidentiality',
        content: `Both parties agree to keep confidential any proprietary business information disclosed during the engagement. Provider will not share Client's LinkedIn credentials or analytics data with any third party.`,
      },
      {
        title: '7. Revisions',
        content: `One (1) round of revisions is included within 7 days of delivery. Additional revision rounds are billed at Provider's standard hourly rate.`,
      },
      {
        title: '8. Governing Law',
        content: `This Agreement is governed by the laws applicable to {{BUSINESS_NAME}}'s place of business. Any disputes shall be resolved through good-faith negotiation.`,
      },
    ],
  },

  SYSTEM_BUILD: {
    offerType: 'SYSTEM_BUILD',
    name: 'LinkedIn System Build Agreement',
    sections: [
      {
        title: '1. Parties',
        content: `This agreement ("Agreement") is entered into as of {{DATE}} between {{BUSINESS_NAME}} ("Provider"), and {{CLIENT_NAME}}{{CLIENT_COMPANY}} ("Client").`,
      },
      {
        title: '2. Services',
        content: `Provider agrees to build a complete LinkedIn Content & Outreach System ("System Build") over eighteen (18) business days. Deliverables include:\n\n• Profile optimisation (headline, banner, about, featured section)\n• 30-day content calendar with drafted posts\n• Lead magnet creation (PDF or resource)\n• Outreach playbook with message templates and scripts\n• Strategy handover session\n• All files delivered via shared Notion workspace`,
      },
      {
        title: '3. Investment',
        content: `Client agrees to pay {{CONTRACT_VALUE}} for the System Build services described herein.\n\nPayment schedule:\n• 50% due before Day 0 kickoff\n• 50% due on Day 12 (midpoint)\n\nNo work begins without receipt of initial payment.`,
      },
      {
        title: '4. Timeline',
        content: `Provider will complete the System Build within eighteen (18) business days of receiving initial payment and completed onboarding questionnaire. Timeline begins on Day 1 (Kickoff day).`,
      },
      {
        title: '5. Client Responsibilities',
        content: `Client agrees to:\n• Respond to Provider feedback requests within 24 hours\n• Complete the voice capture/brand questionnaire by Day 0\n• Attend scheduled kickoff and handover calls`,
      },
      {
        title: '6. Intellectual Property',
        content: `Upon receipt of full payment, Client owns all deliverables. Provider retains right to reference the engagement in portfolio materials with Client approval.`,
      },
      {
        title: '7. Confidentiality',
        content: `Both parties agree to maintain confidentiality of proprietary business information disclosed during the engagement.`,
      },
      {
        title: '8. Governing Law',
        content: `This Agreement is governed by the laws applicable to {{BUSINESS_NAME}}'s place of business.`,
      },
    ],
  },

  DWY: {
    offerType: 'DWY',
    name: 'Done-With-You Retainer Agreement',
    sections: [
      {
        title: '1. Parties',
        content: `This agreement ("Agreement") is entered into as of {{DATE}} between {{BUSINESS_NAME}} ("Provider"), and {{CLIENT_NAME}}{{CLIENT_COMPANY}} ("Client"), for ongoing Done-With-You consulting services.`,
      },
      {
        title: '2. Services — Monthly Retainer',
        content: `Provider agrees to deliver the following each calendar month:\n\n• Weekly 60-minute strategy call (4x per month)\n• Async content feedback (within 24 hours of submission)\n• Outreach review and coaching\n• Monthly game plan session\n• Monthly results review and report\n• Unlimited WhatsApp access during business hours`,
      },
      {
        title: '3. Investment',
        content: `Client agrees to pay {{CONTRACT_VALUE}} per calendar month.\n\nPayment is due on the 1st of each month. A 5-day grace period applies. Failure to pay within grace period pauses the engagement until payment is received.`,
      },
      {
        title: '4. Term & Termination',
        content: `This Agreement begins on {{START_DATE}} and continues on a month-to-month basis.\n\nEither party may terminate with 30 days written notice. No refunds are issued for partial months already paid.`,
      },
      {
        title: '5. Client Responsibilities',
        content: `Client is responsible for:\n• Attending scheduled weekly calls (24-hour rescheduling notice required)\n• Implementing Provider's recommendations in good faith\n• Providing honest feedback on results`,
      },
      {
        title: '6. Results Disclaimer',
        content: `Provider commits to best-in-class strategy and accountability. Specific revenue or follower outcomes cannot be guaranteed, as results depend on Client's execution, market conditions, and offer quality.`,
      },
      {
        title: '7. Confidentiality',
        content: `Both parties agree to keep confidential all business strategies, client data, and proprietary methods shared during the engagement.`,
      },
      {
        title: '8. Governing Law',
        content: `This Agreement is governed by the laws applicable to {{BUSINESS_NAME}}'s place of business.`,
      },
    ],
  },

  DFY: {
    offerType: 'DFY',
    name: 'Done-For-You Retainer Agreement',
    sections: [
      {
        title: '1. Parties',
        content: `This agreement ("Agreement") is entered into as of {{DATE}} between {{BUSINESS_NAME}} ("Provider"), and {{CLIENT_NAME}}{{CLIENT_COMPANY}} ("Client"), for ongoing Done-For-You LinkedIn management services.`,
      },
      {
        title: '2. Services — Monthly Deliverables',
        content: `Provider agrees to deliver the following each calendar month:\n\n• 3-5 LinkedIn posts per week (ghostwritten in Client's voice)\n• Engagement management (comments on target accounts)\n• Outreach execution (DMs to qualified prospects)\n• Monthly performance report\n• Monthly strategy review call\n• Dedicated account manager\n\nMonth 0 (Setup Month) includes:\n• Voice capture session (60-90 minutes)\n• Brand voice guide creation\n• Target audience definition`,
      },
      {
        title: '3. Investment',
        content: `Client agrees to pay {{CONTRACT_VALUE}} per calendar month.\n\nFirst month payment is due before Month 0 setup begins. Subsequent payments are due on the 1st of each month.`,
      },
      {
        title: '4. Term & Termination',
        content: `This Agreement begins on {{START_DATE}} with a minimum 3-month commitment.\n\nAfter month 3, either party may terminate with 30 days written notice. No refunds for partial months paid.`,
      },
      {
        title: '5. Client Responsibilities',
        content: `Client agrees to:\n• Attend Monthly Voice Capture session and any required briefings\n• Approve content within 48 hours of submission\n• Provide feedback on results to allow strategy adjustment\n• Maintain LinkedIn account in good standing`,
      },
      {
        title: '6. Content Approval',
        content: `All content is submitted to Client for approval before posting. Client may request revisions (2 rounds included per post). Provider will not post without explicit Client approval.`,
      },
      {
        title: '7. Intellectual Property',
        content: `All content created under this Agreement is owned by Client upon full payment of the month in which it was created.`,
      },
      {
        title: '8. Confidentiality',
        content: `Provider will not disclose that Client uses Done-For-You services unless Client grants explicit permission. All business information remains strictly confidential.`,
      },
      {
        title: '9. Results Disclaimer',
        content: `Provider commits to industry-leading execution. Specific follower, lead, or revenue outcomes cannot be guaranteed as they depend on offer quality, market conditions, and LinkedIn algorithm changes.`,
      },
      {
        title: '10. Governing Law',
        content: `This Agreement is governed by the laws applicable to {{BUSINESS_NAME}}'s place of business.`,
      },
    ],
  },
}

export function populateTemplate(
  template: ContractTemplate,
  vars: Record<string, string>
): ContractTemplate {
  const replace = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`)

  return {
    ...template,
    sections: template.sections.map((s) => ({
      title: replace(s.title),
      content: replace(s.content),
    })),
  }
}
