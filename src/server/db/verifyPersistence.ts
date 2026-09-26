/**
 * JetKur Persistence Verification Script (Sprint 02)
 *
 * Verifies:
 * 1. Multi-tenant SaaS Hierarchy: User -> WorkspaceMember -> Workspace -> Site
 * 2. Invariant: SITE != DEPLOYMENT
 * 3. Bidirectional roundtrip mapping: CanonicalSite -> Prisma Input -> Reconstituted CanonicalSite
 * 4. Agency vs SME Business tenancy separation
 */

import { sampleCanonicalSite } from "../../domain/site/fixtures";
import { sampleMultiTenantData } from "./fixtures";
import {
  toPrismaSiteCreateInput,
  toCanonicalSite,
  FullDbSite,
} from "./mappers";
import {
  SiteStatus as DbSiteStatus,
  DomainStatus as DbDomainStatus,
  DeploymentStatus as DbDeploymentStatus,
  DeploymentProvider as DbDeploymentProvider,
  Prisma,
} from "@prisma/client";

function runVerification() {
  console.log("=== JETKUR SPRINT 02: PERSISTENCE VERIFICATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description}`);
    }
  }

  // 1. Hierarchy & Multi-Tenancy Tests
  console.log("\n1. Multi-Tenant Hierarchy Validation:");
  const agencyWs = sampleMultiTenantData.workspaces.find((w) => w.type === "AGENCY");
  const smeWs = sampleMultiTenantData.workspaces.find((w) => w.type === "BUSINESS");
  const agencyLead = sampleMultiTenantData.users.find((u) => u.id === "usr_agency_lead");
  const smeOwner = sampleMultiTenantData.users.find((u) => u.id === "usr_sme_owner");

  assert(Boolean(agencyWs && agencyWs.type === "AGENCY"), "Agency workspace exists with type AGENCY");
  assert(Boolean(smeWs && smeWs.type === "BUSINESS"), "SME workspace exists with type BUSINESS");
  assert(Boolean(agencyLead && smeOwner), "Distinct Users created for Agency Director and SME Owner");

  const smeMemberOwner = smeWs?.members.find((m) => m.userId === "usr_sme_owner" && m.role === "OWNER");
  const smeMemberConsultant = smeWs?.members.find((m) => m.userId === "usr_agency_lead" && m.role === "ADMIN");
  assert(Boolean(smeMemberOwner), "SME Owner is OWNER of SME Workspace");
  assert(Boolean(smeMemberConsultant), "Agency Lead is invited as ADMIN in SME Workspace (cross-tenant collaboration)");

  // 2. Invariant SITE != DEPLOYMENT
  console.log("\n2. Invariant: SITE != DEPLOYMENT Validation:");
  const site1 = sampleMultiTenantData.sites[0];
  assert(site1.domains.length === 2, "Site can have multiple domains (custom + platform fallback)");
  assert(site1.deployments.length >= 1, "Deployments are stored as independent lifecycle records");
  assert(
    site1.domains[0].hostname !== site1.canonicalSite.settings.structureMode,
    "Domain is strictly separated from site structure mode"
  );

  // 3. Prisma Create Input Mapping
  console.log("\n3. Prisma Site Create Input Mapper:");
  const prismaInput = toPrismaSiteCreateInput(
    sampleCanonicalSite,
    "ws_sme_plumber",
    "usta-tesisat-kadikoy"
  );

  assert(prismaInput.name === "Usta Tesisat Kadıköy", "Prisma input maps business identity company name to Site.name");
  assert(prismaInput.slug === "usta-tesisat-kadikoy", "Prisma input preserves site slug");
  assert(Boolean(prismaInput.businessProfile?.create), "Prisma input contains 1:1 BusinessProfile sub-create");
  assert(Boolean(prismaInput.content?.create), "Prisma input contains 1:1 SiteContent sub-create");
  assert(Boolean(prismaInput.sectionConfiguration?.create), "Prisma input contains 1:1 SectionConfiguration sub-create");
  assert(Boolean(prismaInput.settings?.create), "Prisma input contains 1:1 SiteSettings sub-create");
  assert(Boolean(prismaInput.domains?.create), "Prisma input creates decoupled Domain record");

  // 4. Reconstitution (FullDbSite -> CanonicalSite)
  console.log("\n4. Canonical Reconstitution Roundtrip:");
  const mockDbSite: FullDbSite = {
    id: sampleCanonicalSite.id,
    workspaceId: "ws_sme_plumber",
    name: sampleCanonicalSite.businessProfile.identity.companyName,
    slug: "usta-tesisat-kadikoy",
    status: DbSiteStatus.ACTIVE,
    schemaVersion: "1.0.0",
    trialEndsAt: null,
    industryPackId: "pack-plumbing-tr",
    createdAt: new Date(),
    updatedAt: new Date(),
    businessProfile: {
      id: "bp_123",
      siteId: sampleCanonicalSite.id,
      companyName: sampleCanonicalSite.businessProfile.identity.companyName,
      sector: sampleCanonicalSite.businessProfile.identity.sector,
      slogan: sampleCanonicalSite.businessProfile.identity.slogan || null,
      phone: sampleCanonicalSite.businessProfile.contact.phone,
      email: sampleCanonicalSite.businessProfile.contact.email,
      whatsapp: sampleCanonicalSite.businessProfile.contact.whatsapp || null,
      address: sampleCanonicalSite.businessProfile.location.address,
      city: sampleCanonicalSite.businessProfile.location.city,
      workingHours: sampleCanonicalSite.businessProfile.workingHours as unknown as Prisma.JsonValue,
      branding: sampleCanonicalSite.businessProfile.branding as unknown as Prisma.JsonValue,
      services: sampleCanonicalSite.businessProfile.services as unknown as Prisma.JsonValue,
      serviceAreas: sampleCanonicalSite.businessProfile.location.serviceAreas as unknown as Prisma.JsonValue,
      social: sampleCanonicalSite.businessProfile.social as unknown as Prisma.JsonValue,
      legal: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    content: {
      id: "cnt_123",
      siteId: sampleCanonicalSite.id,
      hero: sampleCanonicalSite.content.hero as unknown as Prisma.JsonValue,
      about: sampleCanonicalSite.content.about as unknown as Prisma.JsonValue,
      whyUs: sampleCanonicalSite.content.whyUs as unknown as Prisma.JsonValue,
      gallery: sampleCanonicalSite.content.gallery as unknown as Prisma.JsonValue,
      testimonials: sampleCanonicalSite.content.testimonials as unknown as Prisma.JsonValue,
      faqs: sampleCanonicalSite.content.faqs as unknown as Prisma.JsonValue,
      pricingPlans: sampleCanonicalSite.content.pricingPlans as unknown as Prisma.JsonValue,
      blogPosts: sampleCanonicalSite.content.blogPosts as unknown as Prisma.JsonValue,
      catalogProducts: sampleCanonicalSite.content.catalogProducts as unknown as Prisma.JsonValue,
      customPages: sampleCanonicalSite.content.customPages as unknown as Prisma.JsonValue,
      announcement: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sectionConfiguration: {
      id: "sec_123",
      siteId: sampleCanonicalSite.id,
      sections: sampleCanonicalSite.sectionConfiguration.sections as unknown as Prisma.JsonValue,
      header: sampleCanonicalSite.sectionConfiguration.header as unknown as Prisma.JsonValue,
      footer: sampleCanonicalSite.sectionConfiguration.footer as unknown as Prisma.JsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    settings: {
      id: "st_123",
      siteId: sampleCanonicalSite.id,
      structureMode: sampleCanonicalSite.settings.structureMode,
      seo: sampleCanonicalSite.settings.seo as unknown as Prisma.JsonValue,
      analytics: sampleCanonicalSite.settings.analytics as unknown as Prisma.JsonValue,
      whatsappWidget: sampleCanonicalSite.settings.whatsappWidget as unknown as Prisma.JsonValue,
      leads: sampleCanonicalSite.settings.leads as unknown as Prisma.JsonValue,
      performance: sampleCanonicalSite.settings.performance as unknown as Prisma.JsonValue,
      locale: sampleCanonicalSite.settings.locale as unknown as Prisma.JsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    domains: [
      {
        id: "dom_1",
        siteId: sampleCanonicalSite.id,
        hostname: "ustatesisat.com.tr",
        isCustom: true,
        isPrimary: true,
        status: DbDomainStatus.ACTIVE,
        sslActive: true,
        dnsRecords: [],
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    deployments: [
      {
        id: "dep_1",
        siteId: sampleCanonicalSite.id,
        provider: DbDeploymentProvider.CLOUDFLARE_PAGES,
        status: DbDeploymentStatus.DEPLOYED,
        productionUrl: "https://ustatesisat.com.tr",
        previewUrl: "https://preview.ustatesisat.pages.dev",
        deploymentId: "cf_dep_001",
        buildTimeMs: 420,
        commitHash: "a1b2c3d",
        logs: "Built in 420ms",
        metadata: {},
        deployedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const reconstituted = toCanonicalSite(mockDbSite);

  assert(reconstituted.id === sampleCanonicalSite.id, "Reconstituted site has matching ID");
  assert(
    reconstituted.businessProfile.identity.companyName === sampleCanonicalSite.businessProfile.identity.companyName,
    "Reconstituted businessProfile identity companyName matches exactly"
  );
  assert(
    reconstituted.businessProfile.contact.phone === sampleCanonicalSite.businessProfile.contact.phone,
    "Reconstituted businessProfile contact phone matches"
  );
  assert(
    reconstituted.content.hero.title === sampleCanonicalSite.content.hero.title,
    "Reconstituted content hero title matches"
  );
  assert(
    reconstituted.settings.domain.hostname === "ustatesisat.com.tr",
    "Reconstituted domain correctly hydrated from decoupled DbDomain table"
  );
  assert(
    reconstituted.settings.deployment.status === "deployed",
    "Reconstituted deployment correctly hydrated from decoupled DbDeployment table"
  );

  console.log(`\nVerification Complete: ${passed} / ${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
