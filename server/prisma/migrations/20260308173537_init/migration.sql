-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'PKR');

-- CreateEnum
CREATE TYPE "CurrencyDisplay" AS ENUM ('BOTH', 'USD', 'PKR');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('AUDIT', 'SYSTEM_BUILD', 'DWY', 'DFY');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'PROPOSAL_SENT', 'CONTRACT_SIGNED', 'ACTIVE', 'PAUSED', 'COMPLETE', 'CHURNED');

-- CreateEnum
CREATE TYPE "ReferralPotential" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RevenueType" AS ENUM ('MRR', 'PROJECT');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('FIXED', 'VARIABLE', 'ACQUISITION');

-- CreateEnum
CREATE TYPE "CostInputType" AS ENUM ('CASH', 'TIME');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'IN_DISCUSSION', 'WON', 'LOST', 'GHOSTED');

-- CreateEnum
CREATE TYPE "LossReason" AS ENUM ('PRICE', 'TIMING', 'COMPETITOR', 'NO_RESPONSE', 'BUDGET', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('COLD', 'WARM', 'REFERRAL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "ResponseSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NO_REPLY');

-- CreateEnum
CREATE TYPE "CommentQuality" AS ENUM ('INSIGHT', 'QUESTION', 'VALIDATION');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('AUTHORITY', 'ENGAGEMENT', 'CONVERSION', 'PERSONAL');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('IDEA', 'DRAFT', 'READY', 'PUBLISHED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MagnetType" AS ENUM ('CHECKLIST', 'MINI_GUIDE', 'TEMPLATE', 'SWIPE_FILE', 'CASE_STUDY');

-- CreateEnum
CREATE TYPE "MagnetOwnerType" AS ENUM ('SIGNL', 'CLIENT');

-- CreateEnum
CREATE TYPE "MagnetStatus" AS ENUM ('ACTIVE', 'PAUSED', 'RETIRED');

-- CreateEnum
CREATE TYPE "TestimonialFormat" AS ENUM ('TEXT', 'VIDEO', 'LINKEDIN_REC', 'VOICE_NOTE');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('DESIGNER', 'WRITER', 'VA', 'MANAGER', 'OTHER');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('PER_PROJECT', 'MONTHLY_RETAINER');

-- CreateEnum
CREATE TYPE "SopTemplateType" AS ENUM ('AUDIT', 'SYSTEM_BUILD', 'DWY', 'DFY');

-- CreateEnum
CREATE TYPE "SopTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "usd_pkr_rate" DECIMAL(10,4) NOT NULL,
    "rate_updated_at" TIMESTAMP(3) NOT NULL,
    "hourly_rate_usd" DECIMAL(8,2) NOT NULL,
    "currency_display_default" "CurrencyDisplay" NOT NULL DEFAULT 'BOTH',
    "business_name" VARCHAR(200) NOT NULL DEFAULT 'SIGNL',
    "owner_name" VARCHAR(200) NOT NULL DEFAULT 'Ahmad Farooq',
    "owner_email" VARCHAR(255) NOT NULL DEFAULT '',
    "owner_address" TEXT NOT NULL DEFAULT '',
    "health_thresholds" JSONB NOT NULL DEFAULT '{"ltv_cac_warn": 5, "margin_warn": 60, "scorecard_warn": 35}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "company" VARCHAR(200),
    "email" VARCHAR(255) NOT NULL,
    "linkedin_url" VARCHAR(500),
    "whatsapp" VARCHAR(50),
    "offer_type" "OfferType" NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "start_date" DATE,
    "end_date" DATE,
    "contract_value_amount" DECIMAL(12,2),
    "contract_value_currency" "Currency",
    "testimonial_collected" BOOLEAN NOT NULL DEFAULT false,
    "referral_potential" "ReferralPotential" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_entries" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "offer_type" "OfferType" NOT NULL,
    "revenue_type" "RevenueType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "exchange_rate_used" DECIMAL(10,4) NOT NULL,
    "amount_usd" DECIMAL(12,2) NOT NULL,
    "amount_pkr" DECIMAL(14,2) NOT NULL,
    "date_received" DATE NOT NULL,
    "invoice_number" VARCHAR(50),
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "invoice_id" TEXT,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "revenue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_entries" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "category" "CostCategory" NOT NULL,
    "cost_input_type" "CostInputType" NOT NULL,
    "amount" DECIMAL(12,2),
    "currency" "Currency",
    "hours" DECIMAL(6,2),
    "hourly_rate_used" DECIMAL(8,2),
    "exchange_rate_used" DECIMAL(10,4) NOT NULL,
    "amount_usd" DECIMAL(12,2) NOT NULL,
    "amount_pkr" DECIMAL(14,2) NOT NULL,
    "client_id" TEXT,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "billing_cycle" "BillingCycle",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date" DATE NOT NULL,
    "team_member_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "prospect_name" VARCHAR(200) NOT NULL,
    "client_id" TEXT,
    "offer_type" "OfferType" NOT NULL,
    "value_amount" DECIMAL(12,2) NOT NULL,
    "value_currency" "Currency" NOT NULL,
    "value_usd" DECIMAL(12,2) NOT NULL,
    "value_pkr" DECIMAL(14,2) NOT NULL,
    "exchange_rate_used" DECIMAL(10,4) NOT NULL,
    "date_sent" DATE NOT NULL,
    "follow_up_date" DATE,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "loss_reason" "LossReason",
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" VARCHAR(20) NOT NULL,
    "client_id" TEXT NOT NULL,
    "line_items" JSONB NOT NULL,
    "subtotal_amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount_usd" DECIMAL(12,2) NOT NULL,
    "amount_pkr" DECIMAL(14,2) NOT NULL,
    "exchange_rate_used" DECIMAL(10,4) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "due_date" DATE NOT NULL,
    "paid_date" DATE,
    "auto_create_revenue" BOOLEAN NOT NULL DEFAULT true,
    "revenue_entry_id" TEXT,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "offer_type" "OfferType" NOT NULL,
    "template_id" TEXT NOT NULL,
    "scope_notes" TEXT,
    "custom_clauses" JSONB,
    "signed_at" TIMESTAMP(3),
    "pdf_url" VARCHAR(500),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_templates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "offer_type" "SopTemplateType" NOT NULL,
    "description" TEXT,
    "tasks" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sop_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_instances" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "tasks" JSONB NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "sop_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_dms" (
    "id" TEXT NOT NULL,
    "prospect_name" VARCHAR(200) NOT NULL,
    "linkedin_url" VARCHAR(500) NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "date_sent" DATE NOT NULL,
    "response_received" BOOLEAN NOT NULL DEFAULT false,
    "response_sentiment" "ResponseSentiment",
    "converted_to_proposal" BOOLEAN NOT NULL DEFAULT false,
    "proposal_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "outreach_dms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_comments" (
    "id" TEXT NOT NULL,
    "target_account" VARCHAR(200) NOT NULL,
    "post_topic" VARCHAR(500) NOT NULL,
    "date" DATE NOT NULL,
    "comment_quality" "CommentQuality" NOT NULL,
    "profile_visit_received" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "outreach_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_posts" (
    "id" TEXT NOT NULL,
    "hook_draft" VARCHAR(500) NOT NULL,
    "post_type" "PostType" NOT NULL,
    "planned_date" DATE NOT NULL,
    "actual_date" DATE,
    "status" "PostStatus" NOT NULL DEFAULT 'IDEA',
    "impressions" INTEGER,
    "engagement_rate" DECIMAL(5,2),
    "has_lead_magnet_cta" BOOLEAN NOT NULL DEFAULT false,
    "dms_generated" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "content_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnets" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "type" "MagnetType" NOT NULL,
    "owner_type" "MagnetOwnerType" NOT NULL,
    "linked_client_id" TEXT,
    "total_downloads" INTEGER NOT NULL DEFAULT 0,
    "conversion_to_call_pct" DECIMAL(5,2),
    "conversion_to_client_pct" DECIMAL(5,2),
    "status" "MagnetStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_updated" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_magnets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "raw_quote" TEXT NOT NULL,
    "edited_quote" TEXT,
    "permission_to_use" BOOLEAN NOT NULL DEFAULT false,
    "format" "TestimonialFormat" NOT NULL,
    "date_collected" DATE NOT NULL,
    "themes" TEXT[],
    "used_in" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "role" "TeamRole" NOT NULL,
    "engagement_type" "EngagementType" NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "rate_currency" "Currency" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "skills" TEXT[],
    "contract_on_file" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_entries" (
    "id" TEXT NOT NULL,
    "week_of" DATE NOT NULL,
    "q1" SMALLINT NOT NULL,
    "q2" SMALLINT NOT NULL,
    "q3" SMALLINT NOT NULL,
    "q4" SMALLINT NOT NULL,
    "q5" SMALLINT NOT NULL,
    "q6" SMALLINT NOT NULL,
    "q7" SMALLINT NOT NULL,
    "q8" SMALLINT NOT NULL,
    "q9" SMALLINT NOT NULL,
    "q10" SMALLINT NOT NULL,
    "total_score" SMALLINT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "scorecard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_entries_week_of_key" ON "scorecard_entries"("week_of");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sop_instances" ADD CONSTRAINT "sop_instances_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sop_instances" ADD CONSTRAINT "sop_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sop_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sop_instances" ADD CONSTRAINT "sop_instances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_dms" ADD CONSTRAINT "outreach_dms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_comments" ADD CONSTRAINT "outreach_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_magnets" ADD CONSTRAINT "lead_magnets_linked_client_id_fkey" FOREIGN KEY ("linked_client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_entries" ADD CONSTRAINT "scorecard_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
