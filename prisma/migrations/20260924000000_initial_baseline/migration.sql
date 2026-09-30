-- =================================================================
-- JETKUR INITIAL BASELINE MIGRATION
-- Migration: 20260924000000_initial_baseline
-- Target: PostgreSQL
-- Models: User, Session, Workspace, WorkspaceMember, Site,
--         BusinessProfile, SiteContent, SectionConfiguration,
--         SiteSettings, Domain, Deployment, IndustryPack, DesignTemplate
-- =================================================================

-- CreateEnum: UserStatus
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum: PlatformRole
CREATE TYPE "PlatformRole" AS ENUM ('NORMAL', 'SUPER_ADMIN');

-- CreateEnum: WorkspaceType
CREATE TYPE "WorkspaceType" AS ENUM ('BUSINESS', 'AGENCY', 'PLATFORM');

-- CreateEnum: WorkspaceRole
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum: SiteStatus
CREATE TYPE "SiteStatus" AS ENUM ('DRAFT', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum: DomainStatus
CREATE TYPE "DomainStatus" AS ENUM ('PENDING_DNS', 'VERIFYING', 'ACTIVE', 'ERROR');

-- CreateEnum: DeploymentProvider
CREATE TYPE "DeploymentProvider" AS ENUM ('CLOUDFLARE_PAGES', 'EDGE_CDN', 'SELF_HOSTED', 'VERCEL', 'NETLIFY');

-- CreateEnum: DeploymentStatus
CREATE TYPE "DeploymentStatus" AS ENUM ('IDLE', 'BUILDING', 'DEPLOYED', 'ERROR', 'CANCELLED');

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "platformRole" "PlatformRole" NOT NULL DEFAULT 'NORMAL',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: workspaces
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL DEFAULT 'BUSINESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sessions
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: workspace_members
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable: industry_packs
CREATE TABLE "industry_packs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "description" TEXT,
    "starterData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: design_templates
CREATE TABLE "design_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "previewImage" TEXT,
    "defaultTokens" JSONB NOT NULL,
    "supportedVariants" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sites
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'DRAFT',
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "trialEndsAt" TIMESTAMP(3),
    "industryPackId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable: business_profiles
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "slogan" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "city" TEXT,
    "workingHours" JSONB,
    "branding" JSONB,
    "services" JSONB,
    "serviceAreas" JSONB,
    "social" JSONB,
    "legal" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: site_contents
CREATE TABLE "site_contents" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "hero" JSONB,
    "about" JSONB,
    "whyUs" JSONB,
    "gallery" JSONB,
    "testimonials" JSONB,
    "faqs" JSONB,
    "pricingPlans" JSONB,
    "blogPosts" JSONB,
    "catalogProducts" JSONB,
    "customPages" JSONB,
    "announcement" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: section_configurations
CREATE TABLE "section_configurations" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "header" JSONB,
    "footer" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: site_settings
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "structureMode" TEXT NOT NULL DEFAULT 'single-page',
    "seo" JSONB,
    "analytics" JSONB,
    "whatsappWidget" JSONB,
    "leads" JSONB,
    "performance" JSONB,
    "locale" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: domains
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING_DNS',
    "sslActive" BOOLEAN NOT NULL DEFAULT false,
    "dnsRecords" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable: deployments
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "provider" "DeploymentProvider" NOT NULL DEFAULT 'CLOUDFLARE_PAGES',
    "status" "DeploymentStatus" NOT NULL DEFAULT 'IDLE',
    "productionUrl" TEXT,
    "previewUrl" TEXT,
    "deploymentId" TEXT,
    "buildTimeMs" INTEGER,
    "commitHash" TEXT,
    "logs" TEXT,
    "metadata" JSONB,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_tokenHash_idx" ON "sessions"("tokenHash");
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");
CREATE UNIQUE INDEX "industry_packs_slug_key" ON "industry_packs"("slug");
CREATE UNIQUE INDEX "design_templates_slug_key" ON "design_templates"("slug");
CREATE UNIQUE INDEX "sites_slug_key" ON "sites"("slug");
CREATE INDEX "sites_workspaceId_idx" ON "sites"("workspaceId");
CREATE INDEX "sites_status_idx" ON "sites"("status");
CREATE UNIQUE INDEX "business_profiles_siteId_key" ON "business_profiles"("siteId");
CREATE UNIQUE INDEX "site_contents_siteId_key" ON "site_contents"("siteId");
CREATE UNIQUE INDEX "section_configurations_siteId_key" ON "section_configurations"("siteId");
CREATE UNIQUE INDEX "site_settings_siteId_key" ON "site_settings"("siteId");
CREATE UNIQUE INDEX "domains_hostname_key" ON "domains"("hostname");
CREATE INDEX "domains_siteId_idx" ON "domains"("siteId");
CREATE INDEX "deployments_siteId_idx" ON "deployments"("siteId");
CREATE INDEX "deployments_status_idx" ON "deployments"("status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sites" ADD CONSTRAINT "sites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sites" ADD CONSTRAINT "sites_industryPackId_fkey" FOREIGN KEY ("industryPackId") REFERENCES "industry_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_contents" ADD CONSTRAINT "site_contents_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "section_configurations" ADD CONSTRAINT "section_configurations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domains" ADD CONSTRAINT "domains_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
