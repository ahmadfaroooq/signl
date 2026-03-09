  
**SIGNL**

**SOLO BUSINESS OS**

Product Requirements \+ Technical Reference Document

Owner: Ahmad Farooq  |  v2.0  |  March 2026  |  CONFIDENTIAL

# **0\. Document Overview**

| PURPOSE This document defines every product requirement and technical specification to build SIGNL — the Ahmad Farooq consulting business operating system. A single-URL web app replacing Notion, spreadsheets, Bonsai, and 5 other tools with one purpose-built system designed for a solo operator now, a team of 10 later. |
| :---- |

| FIELD | DETAIL |
| :---- | :---- |
| Product Name | SIGNL |
| Tagline | Infrastructure that turns your signal into revenue |
| Owner | Ahmad Farooq |
| Version | v2.0 — Full 14-Module Spec |
| Stack | React 18 \+ TypeScript, Node.js, PostgreSQL, Prisma, Tailwind CSS |
| Hosting | Vercel (frontend) \+ Railway (backend \+ DB) |
| MVP Target | 4 weeks from build start — Modules 1, 3, 4, 6, 7 first |

## **0.1 Brand Identity**

| ELEMENT | DEFINITION |
| :---- | :---- |
| Name | SIGNL |
| Brand Story | We live in the most distracted era in history. A signal isn't louder than the noise — it's built differently. SIGNL builds the infrastructure that makes founders impossible to ignore and turns visibility into revenue. We dropped the vowel for the same reason we do everything: because unnecessary doesn't belong here. |
| Positioning | Not a social media tool. Not a CRM. A business operating system for consulting founders who treat LinkedIn as a revenue channel. |

## **0.2 Logo Specification**

| LOGO INSTRUCTION — READ BEFORE BUILDING Do not use a placeholder image or generic text for the logo. Before starting the build, ask Ahmad to provide the SIGNL logo as raw SVG code in the chat. Ahmad will paste the SVG directly. Implementation steps: (1) Save as /src/assets/logo.svg. (2) Import as React SVG component: import { ReactComponent as Logo } from '../assets/logo.svg'. (3) Use the Logo component everywhere: sidebar header, login screen, contract PDF header, invoice PDF header, favicon (export as .ico separately). TEMPORARY FALLBACK only if SVG not yet provided: render the text 'SIGNL' in font-weight 800, color \#0D1117, letter-spacing 0.08em, font-family Inter. Remove fallback the moment SVG is provided. |
| :---- |

## **0.3 Color System — Locked**

| CSS TOKEN | HEX VALUE | USAGE RULE |
| :---- | :---- | :---- |
| \--color-base | \#0D1117 | Primary text, sidebar background, logo. The dominant color. |
| \--color-amber | \#F5A623 | Amber accent — used SPARINGLY. Active states, alerts, CTAs, amber left border on healthy metric cards, single chart data points. Never as a fill color. |
| \--color-bg | \#F7F5F0 | Page background. Warm off-white. |
| \--color-surface | \#FFFFFF | Cards, modals, dropdown backgrounds. |
| \--color-muted | \#888888 | Secondary labels, timestamps, converted currency values. |
| \--color-border | \#E2E2E2 | All 1px borders. Consistent throughout. |
| \--color-red | \#D0021B | Error states, overdue invoices, negative metrics, LTV:CAC below target. |
| \--color-green | \#2D7D46 | Healthy metrics, PAID status, completed SOPs. |

## **0.4 Typography System — Locked**

| ROLE | FONT | USAGE |
| :---- | :---- | :---- |
| Display / Metrics | Roboto Condensed 700 | All large metric numbers ($12,500, 4.2x, 12). Dates in top bar. Section totals. |
| UI / Body | Inter 400/500/600/700 | Navigation labels, body text, descriptions, table content. All UI elements. |
| Labels | Inter 700, uppercase, letter-spacing 0.1em, 10px | Used for metric card labels (MRR, LTV:CAC), section headers, column headers. Class: .metric-label |
| Code / Mono | Courier New or JetBrains Mono | Contract clause text, SOP checklist items, any system-generated reference codes. |

## **0.5 Design Rules — Non-Negotiable**

* Border radius: maximum 4px anywhere in the app. Sidebar logo box: 0px. Buttons: 0px. Cards: 0px. Input fields: 2px.

* No gradients anywhere. No drop shadows anywhere. Depth is created with 1px borders only.

* No generic icon pack icons. Use Google Material Symbols Outlined only — weight 100-200 for most icons, 300 for active states.

* Sidebar active state: 2px amber left border \+ rgba(13,17,23,0.05) background. No other treatment.

* Hover states: border changes to amber on action items. Background opacity \+5% on nav items. No color fills.

* All uppercase labels use Inter 700, 10px, letter-spacing 0.1em. Never title case for UI labels.

* Metric card left border colors: amber \= healthy/active, red \= needs attention, primary navy \= neutral.

* Chart style: single navy line (\#0D1117, stroke-width 1.5), amber data point circles (r=2.5). No gridlines. Single baseline only.

## **0.6 Currency Display System — Non-Negotiable**

| CURRENCY TOGGLE SPEC Global toggle in top navigation: two buttons \[USD\] \[PKR\]. Default on first load: BOTH shown simultaneously. USD in Roboto Condensed semibold, primary color. PKR directly beneath in Inter 12px muted (\#888888). When user clicks USD: PKR hidden. When user clicks PKR: USD hidden. Toggle state stored in localStorage. Applies globally to Dashboard, Revenue, Costs, Invoices, Proposals, Unit Economics — all financial views simultaneously. Implementation: add class .currency-usd-only or .currency-pkr-only to \<body\> and use CSS to show/hide .currency-pkr and .currency-usd spans throughout. |
| :---- |

| STATE | DISPLAY | CSS CLASS ON BODY |
| :---- | :---- | :---- |
| Both (default) | USD large \+ PKR small muted beneath | none |
| USD only | USD shown. .currency-pkr hidden. | .currency-usd-only |
| PKR only | PKR shown large. .currency-usd hidden. | .currency-pkr-only |

## **0.7 Reference UI — Locked Dashboard Design**

| STITCH REFERENCE DESIGN — THIS IS THE VISUAL BASELINE The locked reference design for SIGNL is the Stitch-generated dashboard screenshot provided by Ahmad (March 2026). Key characteristics to preserve exactly: (1) Off-white background \#F7F5F0 with the slight warmth — not pure white. (2) Sidebar width \~256px with grouped nav items, amber left-border active state. (3) Top bar with condensed date typography, inline stats, amber alert badge. (4) Metric cards with amber or navy left borders — no card background fill, just the border treatment. (5) Revenue trend chart with no outer border, just the SVG chart directly on the surface. (6) Active Deliverables panel: client name in small caps bold, SOP type in 10px muted, single-pixel progress bar, NEXT task in muted uppercase. (7) Internal Activity feed: timestamp left-aligned in muted, event description right. (8) Quick Actions: 1px bordered buttons, no fill, hover shows amber border. The Stitch HTML source code provided by Ahmad is the exact implementation reference for these components. |
| :---- |

**PART 1**

**PRODUCT REQUIREMENTS DOCUMENT**

# **1\. Product Vision**

## **1.1 Problem**

Ahmad runs a LinkedIn consulting business as a solo operator scaling toward a small team. Current tools are generic, disconnected, and not designed for a consulting operation that needs to simultaneously track pipeline, delivery, finances, outreach, content, and team. Every insight requires opening 5+ tools. The business feels chaotic instead of systematic.

## **1.2 Solution**

SIGNL — a single-URL business operating system with 14 integrated modules. Everything from cold outreach to invoice collection to weekly self-assessment lives in one place, feeding one unified data layer.

## **1.3 Design Principles**

* Brutal clarity — every screen answers one question fast

* Zero bloat — no feature exists without a direct consulting workflow justification

* Currency-agnostic — all money flows in any currency, always displays in both USD and PKR

* Built to delegate — SOPs and playbooks live inside the tool so team members operate independently

* Scalable by config — new offer types, currencies, team roles require config changes not code rewrites

* Minimal by discipline — inspired by Linear, Vercel dashboard, early Bloomberg terminal

# **2\. Users & Roles**

| ROLE | ACCESS | DESCRIPTION |
| :---- | :---- | :---- |
| OWNER | Full — all 14 modules \+ Settings | Ahmad Farooq. All read/write. Manages team, settings, contracts. |
| MANAGER | Full except Settings | Future senior hire. Manages clients, delivery, finances. |
| CONTRACTOR | Delivery only | Designer, writer, VA. Views only SOPs with tasks assigned to them. No financial data. |

Roles are enforced at the API middleware layer from day one even though only OWNER is active at MVP. Adding a team member \= adding a user record and assigning a role. No code changes required.

# **3\. Complete Module Map — 14 Modules**

| \# | GROUP | MODULE | PRIMARY FUNCTION | KEY OUTPUT |
| :---- | :---- | :---- | :---- | :---- |
| 1 | CORE | Dashboard | All KPIs, alerts, activity in one view | Live unit economics \+ active alerts |
| 2 | PIPELINE | Outreach | Daily DM \+ comment log | Response rate, volume trend |
| 3 | PIPELINE | Proposals | Track proposals from draft to won/lost | Close rate, win/loss per offer type |
| 4 | PIPELINE | Clients (CRM) | Full client relationship management | LTV per client, pipeline kanban |
| 5 | DELIVERY | SOPs | Interactive delivery checklists per client | Delivery progress, blocked alerts |
| 6 | DELIVERY | Contracts | Generate \+ export contracts per offer type | Signed PDF per client |
| 7 | DELIVERY | Invoices | Generate, send, track payment status | Overdue alerts, auto revenue entry on paid |
| 8 | GROWTH | Content Calendar | LinkedIn content planning \+ performance | Content mix ratio, post analytics |
| 9 | GROWTH | Lead Magnets | Track magnet performance \+ conversion | Best magnet, dead weight alerts |
| 10 | GROWTH | Testimonials | Collect \+ store client social proof | Coverage %, filterable by offer type |
| 11 | FINANCE | Revenue | Log income, classify MRR vs project | MRR, total revenue, per-client revenue |
| 12 | FINANCE | Costs | Fixed, variable, acquisition costs \+ CAC | True margins, CAC per client |
| 13 | OPS | Team | Contractor \+ hire management | Team cost as % of revenue |
| 14 | OPS | Scorecard | Weekly 10-question self-assessment | Weekly score trend, 12-week chart |

# **4\. Module Requirements**

## **M1 — Dashboard**

### **Layout — matches reference Stitch design exactly**

Top bar: condensed date (Roboto Condensed, uppercase), separator, active client count, currency toggle \[USD\]\[PKR\], alert badge, notifications, profile.

Row 1 — 4 metric cards: MRR, Total Revenue, Active Clients, LTV:CAC. Each with colored left border (amber \= healthy, red \= below target, navy \= neutral).

Row 2 — 2 columns: Revenue Trend chart (left, 60% width) \+ Active Deliverables list (right, 40% width).

Row 3 — 2 columns: Internal Activity feed (left, 66% width) \+ Quick Actions panel (right, 34% width).

### **Metric Card Spec**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| MRR | Computed | Sum of active recurring revenue. USD large / PKR muted beneath. |
| Total Revenue | Computed | MRR \+ Project Income this month. YTD variant available. |
| Active Clients | Computed | COUNT(clients WHERE status \= ACTIVE). Capacity % beneath. |
| LTV:CAC | Computed | Avg LTV / Avg CAC. Red border \+ red text if below 10:1 target. |

### **Quick Actions**

* Add New Client — opens new client form

* Generate Invoice — opens invoice generator pre-filled from most recent active client

* Update SOP — jumps to SOPs module

* Log Expense — opens cost entry modal

## **M2 — Outreach Tracker**

### **DM Log Fields**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Prospect Name | String | Required |
| LinkedIn URL | URL | Required |
| Message Type | Enum | COLD | WARM | REFERRAL | FOLLOW\_UP |
| Date Sent | Date | Required |
| Response Received | Boolean | Did they reply? |
| Response Sentiment | Enum | POSITIVE | NEUTRAL | NEGATIVE | NO\_REPLY |
| Converted to Proposal | Boolean | Links to Proposal record when true |
| Notes | Text | Optional |

### **Comment Log Fields**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Target Account | String | Whose post you commented on |
| Post Topic | String | Brief description |
| Date | Date | Required |
| Comment Quality | Enum | INSIGHT | QUESTION | VALIDATION |
| Profile Visit Received | Boolean | Did they visit your profile after? |

| DAILY TARGETS WIDGET Top of Outreach page shows: \[X / 10 DMs sent today\] \[X / 15 Comments today\]. Progress bars in amber. Dashboard fires amber alert if daily targets not hit by end of day. |
| :---- |

## **M3 — Proposals**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Prospect Name | String | Required. Can link to existing Client. |
| Offer Type | Enum | AUDIT | SYSTEM\_BUILD | DWY | DFY |
| Proposal Value | Decimal \+ Currency | Proposed engagement value in any currency |
| Date Sent | Date | Required |
| Follow-up Date | Date | Alert fires on Dashboard if passed \+ not WON/LOST |
| Status | Enum | DRAFT | SENT | IN\_DISCUSSION | WON | LOST | GHOSTED |
| Loss Reason | Enum (if LOST) | PRICE | TIMING | COMPETITOR | NO\_RESPONSE | BUDGET | OTHER |
| Notes | Text | Call notes, objections, context |
| Converted to Client | FK to Client | Auto-linked when status → WON |

| CLOSE RATE LOGIC Close Rate % \= COUNT(WON) / COUNT(all except DRAFT) x 100\. Computed per month and per offer type separately. Loss reason breakdown chart shows where Ahmad consistently loses deals. |
| :---- |

## **M4 — Clients (CRM)**

Full spec in v1.0 unchanged. Views: List (sortable table) \+ Kanban (by status). Status pipeline: Prospect \> Proposal Sent \> Contract Signed \> Active \> Paused \> Complete \> Churned.

| LTV COMPUTATION LTV per client \= SUM of all revenue\_entries.amount\_usd WHERE client\_id \= X. Displayed on client record and in CRM list view. Feeds Avg LTV metric on Unit Economics dashboard. |
| :---- |

## **M5 — SOPs**

### **Four Templates at Launch**

| TEMPLATE | DURATION | KEY PHASES |
| :---- | :---- | :---- |
| Audit | 6 business days | Day 0: Onboarding \> Day 1: Profile \> Day 2: Content \> Day 3: Funnel Map \> Day 4: Notion \+ Loom \> Day 5: Delivery \> Day 6: Buffer |
| System Build | 18 business days | Day 0: Onboarding \> Day 1: Kickoff \> Days 2-3: Profile \> Days 4-6: Lead Magnet \> Days 7-12: Content \> Days 13-15: Playbook \> Day 16: QC \> Days 17-18: Handover |
| DWY Retainer | Ongoing monthly | Week 1: Setup \> Weekly: Strategy call \+ async feedback \> Monthly: Game plan \+ review |
| DFY Retainer | Ongoing monthly | Month 0: Setup \+ voice capture \> Weekly: Content \+ engagement \+ outreach \> Monthly: Report \+ call |

| LINKEDIN ACCESS DECISION BRANCH — AUDIT SOP Task 'Request LinkedIn Access' is a decision point. Client declines? Ahmad checks 'Proceed with Public Audit Only'. System skips private analytics tasks and appends scope note to deliverable automatically. Price unchanged. |
| :---- |

## **M6 — Contracts**

Four templates — one per offer type. Variable fields auto-populated from CRM. Editable text areas for scope customisation. One-click PDF export. Filename: \[ClientName\]\_\[OfferType\]\_Contract\_\[Date\].pdf. Logo SVG used in PDF header.

## **M7 — Invoices**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Invoice Number | Auto-string | INV-001, INV-002... auto-incremented |
| Client | FK to Client | Required. Pulls name, company, email. |
| Line Items | JSONB Array | \[{ description, amount, currency }\]. Multiple line items supported. |
| Subtotal | Computed | Sum of line items |
| Currency | Enum | USD | PKR — controls invoice display |
| Due Date | Date | Required. Overdue alert on Dashboard if passed \+ unpaid. |
| Status | Enum | DRAFT | SENT | PAID | OVERDUE | CANCELLED |
| Paid Date | Date | Set when status → PAID |
| Auto-Create Revenue | Boolean | Default true. Marking PAID auto-creates Revenue entry. |

## **M8 — Content Calendar**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Hook Draft | String | Opening line of the post |
| Post Type | Enum | AUTHORITY | ENGAGEMENT | CONVERSION | PERSONAL |
| Planned Date | Date | Calendar placement |
| Actual Date | Date | Set when published |
| Status | Enum | IDEA | DRAFT | READY | PUBLISHED | SKIPPED |
| Impressions | Integer | Manual post-publish input |
| Engagement Rate | Decimal | (likes \+ comments) / impressions x 100\. Manual. |
| Lead Magnet CTA | Boolean | Does this post promote a lead magnet? |
| DMs Generated | Integer | Manual count of DMs from this post |

| CONTENT MIX WARNING Monthly content ratio computed: AUTHORITY / ENGAGEMENT / CONVERSION / PERSONAL. If CONVERSION posts \< 20% of monthly output, amber alert fires on Dashboard: 'Content mix: \[X\]% conversion posts this month.' |
| :---- |

## **M9 — Lead Magnets**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Name | String | e.g. 'LinkedIn Funnel Audit Checklist' |
| Type | Enum | CHECKLIST | MINI\_GUIDE | TEMPLATE | SWIPE\_FILE | CASE\_STUDY |
| Owner Type | Enum | SIGNL (Ahmad's own) | CLIENT (built for client) |
| Linked Client | FK NULL | If owner \= CLIENT |
| Total Downloads | Integer | Manual update |
| Conversion to Call % | Decimal | Calls booked / downloads x 100\. Manual. |
| Conversion to Client % | Decimal | Clients signed / downloads x 100\. Manual. |
| Status | Enum | ACTIVE | PAUSED | RETIRED |
| Last Updated | Date | Alert if \> 90 days without update |

## **M10 — Testimonials**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Client | FK to Client | Required |
| Offer Type | Auto from Client | Used for coverage analysis by offer type |
| Raw Quote | Long Text | Unedited — exactly what they said |
| Edited Quote | Long Text | Polished version for proposals and content |
| Permission to Use Publicly | Boolean | Must be true before using anywhere. Default false. |
| Format | Enum | TEXT | VIDEO | LINKEDIN\_REC | VOICE\_NOTE |
| Date Collected | Date | Required |
| Themes | Array | RESULTS | PROCESS | COMMUNICATION | ROI | SPEED |
| Used In | Array | PROPOSALS | CONTENT | WEBSITE | OUTREACH |

| COVERAGE ALERT Dashboard fires amber alert when: client status \= COMPLETE and testimonial\_collected \= false for \> 7 days. Message: 'Testimonial pending: \[Client Name\]' |
| :---- |

## **M11 \+ M12 — Revenue \+ Costs**

Full specification in PRD v1.0 unchanged. Key additions in v2.0:

* Revenue: when Invoice marked PAID, Revenue entry auto-created with all fields pre-populated. Ahmad confirms and saves.

* Costs: Team contractor payments from M13 automatically create Cost entries (VARIABLE or FIXED) linked to client if project-based.

* Both modules: all screens respect global currency toggle. USD primary, PKR secondary. Toggle applies simultaneously.

## **M13 — Team**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| Name | String | Required |
| Role | Enum | DESIGNER | WRITER | VA | MANAGER | OTHER |
| Engagement Type | Enum | PER\_PROJECT | MONTHLY\_RETAINER |
| Rate \+ Currency | Decimal \+ Enum | Rate in USD or PKR |
| Active | Boolean | Toggle off without deleting |
| Skills | Array | DESIGN | COPYWRITING | ENGAGEMENT | OUTREACH | STRATEGY |
| Contract on File | Boolean | Alert fires if false \+ engagement \= MONTHLY\_RETAINER |
| Total Paid to Date | Computed | Sum of all linked Cost entries |
| Active Assignments | Computed | Count of SOP tasks assigned to this team member |

## **M14 — Scorecard**

### **10 Questions — Scored 1 to 5 — Completed Every Monday**

| \# | QUESTION | WHAT 5/5 LOOKS LIKE |
| :---- | :---- | :---- |
| 1 | Outreach consistency | Hit 10 DMs and 15 comments every day this week |
| 2 | Content quality | Every post had a real point of view, not filler |
| 3 | Client communication | Every client heard from me. No one chasing me. |
| 4 | Delivery speed | Every SOP task on or before due date |
| 5 | Financial discipline | All income and costs logged same day they occurred |
| 6 | Lead generation | At least one new proposal conversation started |
| 7 | Team management | All contractors had clear briefs, no confusion |
| 8 | Personal energy | Operating at high capacity, not grinding on empty |
| 9 | Strategic clarity | I know exactly what I'm building toward this month |
| 10 | Revenue momentum | This week moved the revenue needle forward |

Total: X/50. Stored weekly. 12-week trend chart on Scorecard page. Three consecutive weeks below 35/50 fires Dashboard alert: 'Scorecard declining — review priorities.'

**PART 2**

**TECHNICAL REFERENCE DOCUMENT**

# **T1. Technology Stack**

| LAYER | TECHNOLOGY | RATIONALE |
| :---- | :---- | :---- |
| Frontend | React 18 \+ TypeScript | Type safety critical for financial logic. No any types on money. |
| Styling | Tailwind CSS | Utility-first. Matches Stitch reference output exactly. |
| State | Zustand | Lightweight global state. One store per module domain. |
| Backend | Node.js \+ Express | REST API. Straightforward to extend per module. |
| Database | PostgreSQL | Relational. Required for financial data integrity and joins. |
| ORM | Prisma | Type-safe queries. Schema-as-code. Clean migrations. |
| Auth | Clerk or NextAuth | JWT. Role support from day one. OAuth ready for team logins. |
| PDF Export | React-PDF | Contract \+ invoice generation. Logo SVG supported natively. |
| Charts | Recharts | React-native. All 6 dashboard charts covered. |
| Logo Asset | SVG React Component | Provided by Ahmad as raw SVG code. Saved as /src/assets/logo.svg. |
| Fonts | Google Fonts: Inter \+ Roboto Condensed | Inter for UI. Roboto Condensed Bold for metric numbers. |
| Icons | Material Symbols Outlined | Weight 100-300. Outlined style only. No filled icons. |
| Frontend Host | Vercel | Free tier. Auto-deploy from GitHub. |
| Backend \+ DB | Railway | Managed PostgreSQL. Full control over config. |

# **T2. Navigation Architecture**

| GROUP LABEL | MODULE | ROUTE | MATERIAL ICON |
| :---- | :---- | :---- | :---- |
| — | Dashboard | / | dashboard |
| PIPELINE | Outreach | /outreach | send |
| PIPELINE | Proposals | /proposals | handshake |
| PIPELINE | Clients | /clients | group |
| DELIVERY | SOPs | /sops | account\_tree |
| DELIVERY | Contracts | /contracts | description |
| DELIVERY | Invoices | /invoices | receipt\_long |
| GROWTH | Content | /content | edit\_calendar |
| GROWTH | Lead Magnets | /lead-magnets | download |
| GROWTH | Testimonials | /testimonials | format\_quote |
| FINANCE | Revenue | /revenue | trending\_up |
| FINANCE | Costs | /costs | payments |
| OPS | Team | /team | people |
| OPS | Scorecard | /scorecard | bar\_chart |
| — | Settings | /settings | settings |

# **T3. Full Database Schema**

## **T3.1 Core Principles**

* All money stored as: original amount \+ currency \+ amount\_usd \+ amount\_pkr. Computed at write time using rate snapshot.

* exchange\_rate\_used stored on every transaction — historical records never break when Settings rate changes.

* All tables: id (UUID PK), created\_at, updated\_at, created\_by (FK users.id).

* Soft deletes only: deleted\_at timestamp. Never hard delete financial records.

* Role-based middleware on every API route. Server-enforced only — never trust frontend role checks.

## **T3.2 Settings Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK | Single row always. ID \= '1'. |
| usd\_pkr\_rate | DECIMAL(10,4) | e.g. 278.5000. Updated monthly by Ahmad. |
| rate\_updated\_at | TIMESTAMP | Alert if \> 30 days old. |
| hourly\_rate\_usd | DECIMAL(8,2) | Ahmad's time value for CAC. e.g. 25.00 |
| currency\_display\_default | ENUM | BOTH | USD | PKR |
| business\_name | VARCHAR(200) | SIGNL — used in contracts \+ invoices |
| owner\_name | VARCHAR(200) | Ahmad Farooq — used in contracts \+ invoices |
| health\_thresholds | JSONB | { ltv\_cac\_warn: 5, margin\_warn: 60, scorecard\_warn: 35 } |

## **T3.3 Users Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| email | VARCHAR UNIQUE | Login identifier |
| name | VARCHAR(200) | Display name |
| role | ENUM | OWNER | MANAGER | CONTRACTOR |
| is\_active | BOOLEAN | Soft disable. Default true. |
| password\_hash | VARCHAR | Bcrypt hashed |

## **T3.4 Clients Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| full\_name | VARCHAR(200) | Required |
| company | VARCHAR(200) | Optional |
| email | VARCHAR | Primary contact |
| linkedin\_url | VARCHAR | Optional |
| whatsapp | VARCHAR | Optional |
| offer\_type | ENUM | AUDIT | SYSTEM\_BUILD | DWY | DFY |
| status | ENUM | PROSPECT | PROPOSAL\_SENT | CONTRACT\_SIGNED | ACTIVE | PAUSED | COMPLETE | CHURNED |
| start\_date | DATE NULL | Set when ACTIVE |
| end\_date | DATE NULL | Project end or retainer renewal |
| contract\_value\_amount | DECIMAL(12,2) NULL | Agreed total value |
| contract\_value\_currency | ENUM NULL | USD | PKR |
| testimonial\_collected | BOOLEAN | Default false. Alert if COMPLETE \+ false \> 7 days. |
| referral\_potential | ENUM | HIGH | MEDIUM | LOW | UNKNOWN |
| notes | TEXT NULL |  |
| deleted\_at | TIMESTAMP NULL | Soft delete |

## **T3.5 Revenue Entries Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| client\_id | UUID FK | FK clients.id |
| offer\_type | ENUM | Auto from client, editable |
| revenue\_type | COMPUTED ENUM | MRR (DWY/DFY) | PROJECT (Audit/System Build) |
| amount | DECIMAL(12,2) | Raw entered amount |
| currency | ENUM | USD | PKR |
| exchange\_rate\_used | DECIMAL(10,4) | Snapshot at entry time |
| amount\_usd | DECIMAL(12,2) | Computed on save |
| amount\_pkr | DECIMAL(14,2) | Computed on save |
| date\_received | DATE |  |
| invoice\_number | VARCHAR | Auto: INV-001 |
| is\_recurring | BOOLEAN | True \= projects into future MRR months |
| invoice\_id | UUID FK NULL | Linked if auto-created from Invoice |
| notes | TEXT NULL |  |

## **T3.6 Cost Entries Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| name | VARCHAR(300) | Required |
| category | ENUM | FIXED | VARIABLE | ACQUISITION |
| cost\_input\_type | ENUM | CASH | TIME |
| amount | DECIMAL(12,2) NULL | If CASH |
| currency | ENUM NULL | USD | PKR. Required if CASH. |
| hours | DECIMAL(6,2) NULL | If TIME |
| hourly\_rate\_used | DECIMAL(8,2) NULL | Snapshot if TIME |
| exchange\_rate\_used | DECIMAL(10,4) | Snapshot |
| amount\_usd | DECIMAL(12,2) | Computed on save |
| amount\_pkr | DECIMAL(14,2) | Computed on save |
| client\_id | UUID FK NULL | Required for VARIABLE, optional for ACQUISITION |
| is\_shared | BOOLEAN | If true: prorated across active clients this month |
| billing\_cycle | ENUM NULL | MONTHLY | ANNUAL | ONE\_TIME. FIXED only. |
| is\_active | BOOLEAN | FIXED costs toggle. Default true. |
| date | DATE |  |
| team\_member\_id | UUID FK NULL | Linked if created from Team module |

## **T3.7 Proposals Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| prospect\_name | VARCHAR(200) |  |
| client\_id | UUID FK NULL | Linked when WON |
| offer\_type | ENUM | AUDIT | SYSTEM\_BUILD | DWY | DFY |
| value\_amount | DECIMAL(12,2) |  |
| value\_currency | ENUM | USD | PKR |
| value\_usd | DECIMAL(12,2) | Computed |
| value\_pkr | DECIMAL(14,2) | Computed |
| exchange\_rate\_used | DECIMAL(10,4) | Snapshot |
| date\_sent | DATE |  |
| follow\_up\_date | DATE NULL | Alert if passed \+ not WON/LOST |
| status | ENUM | DRAFT | SENT | IN\_DISCUSSION | WON | LOST | GHOSTED |
| loss\_reason | ENUM NULL | PRICE | TIMING | COMPETITOR | NO\_RESPONSE | BUDGET | OTHER |
| notes | TEXT NULL |  |

## **T3.8 Invoices Table**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id | UUID PK |  |
| invoice\_number | VARCHAR | Auto INV-001 |
| client\_id | UUID FK |  |
| line\_items | JSONB | \[{ description, amount, currency }\] |
| subtotal\_amount | DECIMAL(12,2) | Sum of line items |
| currency | ENUM | USD | PKR |
| amount\_usd | DECIMAL(12,2) | Computed |
| amount\_pkr | DECIMAL(14,2) | Computed |
| exchange\_rate\_used | DECIMAL(10,4) | Snapshot |
| status | ENUM | DRAFT | SENT | PAID | OVERDUE | CANCELLED |
| due\_date | DATE |  |
| paid\_date | DATE NULL |  |
| auto\_create\_revenue | BOOLEAN | Default true |
| revenue\_entry\_id | UUID FK NULL | Set when auto-created |

## **T3.9 Outreach, Content, Lead Magnets, Testimonials, Team, Scorecard Tables**

All additional tables follow the same conventions. Key schemas:

### **outreach\_dms**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| id \+ prospect\_name \+ linkedin\_url | Standard |  |
| message\_type | ENUM | COLD | WARM | REFERRAL | FOLLOW\_UP |
| date\_sent | DATE |  |
| response\_received \+ response\_sentiment | BOOLEAN \+ ENUM |  |
| converted\_to\_proposal \+ proposal\_id | BOOLEAN \+ FK NULL |  |

### **content\_posts**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| hook\_draft \+ post\_type | VARCHAR \+ ENUM | AUTHORITY | ENGAGEMENT | CONVERSION | PERSONAL |
| planned\_date \+ actual\_date \+ status | DATE \+ DATE \+ ENUM | IDEA | DRAFT | READY | PUBLISHED | SKIPPED |
| impressions \+ engagement\_rate | INT NULL \+ DECIMAL NULL | Manual post-publish input |
| has\_lead\_magnet\_cta \+ dms\_generated | BOOLEAN \+ INT NULL |  |

### **scorecard\_entries**

| FIELD | TYPE | NOTES |
| :---- | :---- | :---- |
| week\_of | DATE | Monday of that week — unique constraint |
| q1 through q10 | SMALLINT | Each scored 1-5 |
| total\_score | COMPUTED SMALLINT | SUM(q1..q10). Max 50\. |
| notes | TEXT NULL | Weekly free-form reflection |

# **T4. API Design**

## **T4.1 Conventions**

* REST API. Base path: /api/v1/

* All responses: { data, error, meta } envelope

* Auth: Bearer JWT on all protected routes

* All monetary responses include both \_usd and \_pkr fields

* Pagination: ?page=1\&limit=20 on all list endpoints

* Role checked in middleware — never trust client-sent role claims

## **T4.2 Core \+ New Endpoints**

| MTH | ENDPOINT | DESCRIPTION |
| :---- | :---- | :---- |
| GET | /settings | Fetch global settings |
| PUT | /settings | Update settings (OWNER only) |
| GET | /clients | List clients. Filter: ?status=ACTIVE\&offer\_type=DFY |
| POST | /clients | Create client |
| GET | /clients/:id | Client detail with computed LTV and CAC |
| GET | /proposals | List proposals. Filter: ?status=WON |
| POST | /proposals | Create proposal |
| GET | /proposals/analytics | Close rate \+ loss reason breakdown per offer type |
| GET | /revenue | List revenue. Filter: ?month=2026-03 |
| POST | /revenue | Log revenue. Computes USD \+ PKR on save. |
| GET | /costs | List costs. Filter: ?category=FIXED |
| POST | /costs | Log cost. Computes USD \+ PKR on save. |
| GET | /invoices | List invoices. Filter: ?status=OVERDUE |
| POST | /invoices | Create invoice |
| PATCH | /invoices/:id/mark-paid | Sets PAID \+ date. Triggers auto revenue entry if enabled. |
| POST | /invoices/:id/export | Generate PDF. Returns signed URL. |
| POST | /contracts/generate | Generate contract PDF from template \+ client data. |
| GET | /sop/templates | List SOP templates |
| POST | /sop/instances | Start SOP for a client |
| PATCH | /sop/instances/:id/tasks/:taskId | Mark task complete, add note, flag blocked |
| GET | /outreach/dms | List DM log |
| POST | /outreach/dms | Log DM |
| GET | /outreach/stats | Daily \+ weekly targets vs actuals |
| GET | /content | List posts. Filter: ?month=2026-03\&status=PUBLISHED |
| GET | /content/mix | Monthly AUTHORITY/ENGAGEMENT/CONVERSION/PERSONAL ratio |
| GET | /lead-magnets | List with performance metrics |
| GET | /testimonials | List. Filter: ?offer\_type=DFY\&permission=true |
| GET | /team | List team with active assignment count \+ cost summary |
| POST | /scorecard | Submit weekly entry |
| GET | /scorecard/trend | 12-week score history |
| GET | /dashboard/unit-economics | All 13 metrics for selected period |
| GET | /dashboard/alerts | All active alerts across all 14 modules |
| GET | /dashboard/trends | 12-month historical data for all 6 charts |

# **T5. Alert System — All Modules**

| TRIGGER | SEVERITY | DASHBOARD MESSAGE |
| :---- | :---- | :---- |
| Exchange rate \> 30 days old | AMBER | 'Exchange rate last updated \[date\]. Update in Settings.' |
| Invoice overdue | RED | 'Invoice \[INV-XXX\] overdue — \[Client Name\]' |
| Proposal follow-up date passed | AMBER | 'Follow-up due: \[Prospect\] — \[Offer Type\]' |
| SOP task overdue | AMBER | 'Delivery delayed: \[Client\] — \[Task Name\]' |
| SOP blocked | RED | 'Blocked: \[Client\] SOP — \[Task Name\]' |
| Testimonial pending \> 7 days | AMBER | 'Testimonial pending: \[Client Name\]' |
| Content mix \< 20% conversion | AMBER | 'Content mix: \[X\]% conversion posts this month' |
| Outreach targets not hit by EOD | AMBER | 'Outreach: \[X\]/10 DMs, \[X\]/15 comments today' |
| Scorecard avg \< 35 for 3 weeks | AMBER | 'Scorecard declining — review priorities' |
| Team member no contract | AMBER | 'No contract on file: \[Team Member Name\]' |
| Lead magnet not updated \> 90 days | AMBER | 'Lead magnet stale: \[Magnet Name\]' |
| LTV:CAC ratio below 5:1 | RED | 'LTV:CAC at \[X\]x — below minimum threshold' |
| Gross margin below 60% | RED | 'Gross margin at \[X\]% — review costs urgently' |

# **T6. Computation Logic**

## **T6.1 Currency Conversion**

**amount\_usd \= currency \=== 'USD' ? amount : amount / exchange\_rate\_used**

**amount\_pkr \= currency \=== 'PKR' ? amount : amount \* exchange\_rate\_used**

Always use exchange\_rate\_used snapshot stored on the record — never the current Settings rate. Historical integrity is non-negotiable.

## **T6.2 CAC Per Client**

**direct\_cac\_usd \= SUM(costs WHERE client\_id \= X AND category \= ACQUISITION).amount\_usd**

**shared\_cost\_usd \= SUM(costs WHERE is\_shared \= true AND month \= current).amount\_usd**

**active\_clients\_this\_month \= COUNT(clients WHERE status \= ACTIVE AND start\_date \<= month\_end)**

**prorated\_shared\_cac \= shared\_cost\_usd / active\_clients\_this\_month**

**total\_cac \= direct\_cac\_usd \+ prorated\_shared\_cac**

## **T6.3 LTV Per Client**

**ltv\_usd \= SUM(revenue\_entries WHERE client\_id \= X).amount\_usd**

## **T6.4 MRR**

**new\_mrr \= SUM of recurring revenue entries first logged this month**

**carried\_mrr \= SUM of recurring revenue from previous months still active**

**expansion\_mrr \= increase from existing client upgrading offer type**

**churned\_mrr \= recurring revenue from clients with status \= CHURNED this month**

**total\_mrr \= new\_mrr \+ carried\_mrr \+ expansion\_mrr \- churned\_mrr**

## **T6.5 Gross Margin**

**gross\_profit \= total\_revenue\_usd \- total\_costs\_usd**

**gross\_margin\_pct \= (gross\_profit / total\_revenue\_usd) \* 100**

## **T6.6 MRR Coverage**

**mrr\_coverage\_pct \= (total\_mrr\_usd / total\_fixed\_costs\_usd) \* 100**

Target: 100%+. When MRR Coverage exceeds 100%, fixed costs are paid by recurring revenue alone.

## **T6.7 LTV:CAC Ratio**

**ltv\_cac\_ratio \= avg\_client\_ltv\_usd / avg\_client\_cac\_usd**

Target: 10:1 or above. Below 5:1 fires RED alert on Dashboard.

# **T7. Frontend Component Architecture**

## **T7.1 Shared Components**

* CurrencyDisplay — takes amount\_usd \+ amount\_pkr. Renders per global toggle state. USD in Roboto Condensed, PKR in Inter muted beneath.

* MetricCard — label (metric-label class), value (Roboto Condensed), trend indicator, amber/red/navy left border based on health.

* MoneyInput — amount field \+ currency dropdown (USD|PKR). Shows converted equivalent on blur using current Settings rate.

* DataTable — sortable, filterable. Used in CRM, Revenue, Costs, Proposals, Invoices, Team modules.

* SopProgressBar — single-pixel height amber or navy progress bar with phase label.

* AlertBadge — amber border, warning icon, count. In top bar.

* QuickActionButton — 1px border, no fill, hover shows amber border transition. Used in Dashboard Quick Actions.

* StatusPill — color-coded status label. No border-radius \> 2px.

* StaleRateWarning — global banner when Settings rate \> 30 days old.

* Logo — ReactComponent imported from /src/assets/logo.svg. Falls back to text if SVG not provided.

## **T7.2 Zustand Stores**

| STORE | STATE HELD |
| :---- | :---- |
| settingsStore | Exchange rate, hourly rate, display preference. Fetched once on app load. |
| currencyStore | Current toggle state: BOTH | USD | PKR. Persisted in localStorage. |
| clientStore | All clients. Refreshed on CRM mount. |
| revenueStore | Revenue entries for selected month. |
| costStore | Cost entries for selected month. |
| dashboardStore | Computed metrics \+ alerts. Refreshed after any financial write. |
| sopStore | Active SOP instances. |
| proposalStore | Proposals list \+ analytics. |
| outreachStore | DM \+ comment log, daily targets. |

# **T8. Scalability Architecture**

## **T8.1 Multi-User — Ready from Day 1**

All records include created\_by FK. Role middleware on every route. Adding a team member \= one user record \+ role assignment. No code changes.

* OWNER: full access all routes

* MANAGER: all routes except /settings (PUT blocked)

* CONTRACTOR: GET /sop/instances only where assigned\_to \= their user ID. All financial routes blocked.

## **T8.2 Multi-Offer Expansion**

Adding a new offer type (e.g. group programme, course) requires only:

1. New ENUM value in offer\_type across affected tables

2. New SOP template record in sop\_templates table

3. New contract template in contract generator config

No schema rebuild. No component rewrites.

## **T8.3 Multi-Currency Expansion**

Adding GBP or EUR:

4. New ENUM value to currency fields

5. New rate field in Settings (usd\_gbp\_rate etc.)

6. Update conversion to route through USD as base currency

All stored amounts remain in original currency \+ USD equivalent. PKR recomputes from USD rate.

## **T8.4 Build Sequence — MVP to Full**

| PHASE | MILESTONE | MODULES TO BUILD |
| :---- | :---- | :---- |
| MVP | First client signed | Settings \+ Clients (CRM) \+ Contracts \+ Invoices |
| v1.1 | First revenue logged | Revenue \+ Costs (Fixed only) \+ Unit Economics Dashboard |
| v1.2 | Active delivery | SOPs |
| v1.3 | First retainer | MRR logic \+ full Unit Economics \+ Proposals |
| v1.4 | Full pipeline | Outreach Tracker \+ full CAC \+ Variable costs |
| v1.5 | Growth tracking | Content Calendar \+ Lead Magnets \+ Testimonials |
| v2.0 | First team hire | Team module \+ role-based access \+ contractor SOP view |
| v2.1 | Accountability | Scorecard module \+ declining score alerts |

# **T9. Instructions For Claude Building This App**

| READ THIS SECTION FIRST BEFORE WRITING ANY CODE If you are Claude and have received this document to build from, follow these instructions precisely. They encode decisions already made by Ahmad and will save significant back-and-forth. |
| :---- |

## **T9.1 Build Order**

7. Database schema \+ Prisma migrations — all tables including future ones

8. Settings module — frontend \+ API

9. Client CRM — list, kanban, create/edit

10. Contract generator — 4 templates \+ PDF export with Logo component

11. Invoice generator — create, send, mark paid, PDF export

12. Revenue tracker — entry, list, MRR logic

13. Cost tracker — all 3 categories \+ CAC logic

14. Unit Economics Dashboard — all metrics \+ 6 charts

15. SOP Runner — templates \+ instance management \+ decision branches

16. Proposals — pipeline \+ analytics

17. Outreach Tracker — DM log \+ comment log \+ daily targets

18. Content Calendar — posts \+ mix ratio

19. Lead Magnets \+ Testimonials

20. Team module

21. Scorecard

Build in this sequence. Do not skip ahead. Confirm with Ahmad after each phase before proceeding.

## **T9.2 Non-Negotiable Rules**

* NEVER hardcode exchange rates. Always read from settings table.

* ALWAYS store exchange\_rate\_used as a snapshot on every transaction at write time.

* ALWAYS compute amount\_usd and amount\_pkr on the SERVER at save time. Never client-only.

* NEVER hard-delete financial records. deleted\_at soft delete only.

* ALL money displayed must respect the global currency toggle. Both shown by default.

* Role middleware on EVERY API route from day one. No exceptions.

* TypeScript strict mode. No any types on financial data models.

* Standard { data, error, meta } envelope on every API response.

* MoneyInput component must accept any currency and show converted equivalent on blur.

* Logo is an SVG React component from /src/assets/logo.svg. Ask Ahmad for SVG code before building logo-dependent screens.

* Design matches Stitch reference: off-white \#F7F5F0 background, amber accents sparingly, 0px border radius on cards, 1px borders only, no shadows, no gradients.

## **T9.3 What NOT To Build**

* No calendar or scheduling — use Calendly externally

* No email client — use WhatsApp and Gmail externally

* No analytics for Ahmad's own LinkedIn — separate personal OS handles this

* No client-facing portal — internal tool only

* No payment processing — Wise and Payoneer handle transfers externally

* No notification emails — alerts are in-app Dashboard only at v1

*SIGNL  |  Business OS  |  PRD \+ TRD v2.0  |  Ahmad Farooq  |  March 2026*