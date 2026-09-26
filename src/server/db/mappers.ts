import {
  Site as DbSite,
  BusinessProfile as DbBusinessProfile,
  SiteContent as DbSiteContent,
  SectionConfiguration as DbSectionConfiguration,
  SiteSettings as DbSiteSettings,
  Domain as DbDomain,
  Deployment as DbDeployment,
  SiteStatus as DbSiteStatus,
  DomainStatus as DbDomainStatus,
  DeploymentStatus as DbDeploymentStatus,
  DeploymentProvider as DbDeploymentProvider,
  Prisma,
} from "@prisma/client";

import {
  CanonicalSite,
  CanonicalSiteStatus,
  BusinessProfile,
  ActiveDesignConfig,
  SectionConfiguration,
  SiteContent,
  SiteSettings,
  CustomDomainConfig,
  DeploymentConfig,
} from "../../domain/site";

export type FullDbSite = DbSite & {
  businessProfile: DbBusinessProfile | null;
  content: DbSiteContent | null;
  sectionConfiguration: DbSectionConfiguration | null;
  settings: DbSiteSettings | null;
  domains: DbDomain[];
  deployments: DbDeployment[];
};

/**
 * Maps database SiteStatus enum to CanonicalSiteStatus string union
 */
export function mapDbSiteStatusToCanonical(status: DbSiteStatus): CanonicalSiteStatus {
  switch (status) {
    case DbSiteStatus.DRAFT:
      return "draft";
    case DbSiteStatus.TRIAL:
      return "trial";
    case DbSiteStatus.ACTIVE:
      return "active";
    case DbSiteStatus.SUSPENDED:
      return "suspended";
    case DbSiteStatus.ARCHIVED:
      return "archived";
    default:
      return "draft";
  }
}

/**
 * Maps CanonicalSiteStatus string union to database SiteStatus enum
 */
export function mapCanonicalSiteStatusToDb(status: CanonicalSiteStatus): DbSiteStatus {
  switch (status) {
    case "draft":
      return DbSiteStatus.DRAFT;
    case "trial":
      return DbSiteStatus.TRIAL;
    case "active":
      return DbSiteStatus.ACTIVE;
    case "suspended":
      return DbSiteStatus.SUSPENDED;
    case "archived":
      return DbSiteStatus.ARCHIVED;
    default:
      return DbSiteStatus.DRAFT;
  }
}

/**
 * Maps database Domain entity to Canonical CustomDomainConfig
 */
export function mapDbDomainToCanonicalConfig(domains: DbDomain[]): CustomDomainConfig {
  const primary = domains.find((d) => d.isPrimary) || domains[0];
  if (!primary) {
    return {
      hostname: "localhost:3000",
      isCustom: false,
      status: "active",
      sslActive: false,
    };
  }

  let status: CustomDomainConfig["status"] = "active";
  if (primary.status === DbDomainStatus.PENDING_DNS) status = "pending_dns";
  else if (primary.status === DbDomainStatus.VERIFYING) status = "verifying";
  else if (primary.status === DbDomainStatus.ERROR) status = "error";

  return {
    hostname: primary.hostname,
    isCustom: primary.isCustom,
    status,
    sslActive: primary.sslActive,
    verifiedAt: primary.verifiedAt ? primary.verifiedAt.toISOString() : undefined,
    dnsRecords: primary.dnsRecords as unknown as CustomDomainConfig["dnsRecords"],
  };
}

/**
 * Maps database Deployment entity to Canonical DeploymentConfig
 */
export function mapDbDeploymentToCanonicalConfig(deployments: DbDeployment[]): DeploymentConfig {
  const latest = deployments.length > 0 ? deployments[deployments.length - 1] : null;
  if (!latest) {
    return {
      provider: "cloudflare_pages",
      status: "idle",
    };
  }

  let provider: DeploymentConfig["provider"] = "cloudflare_pages";
  if (latest.provider === DbDeploymentProvider.EDGE_CDN) provider = "edge_cdn";
  else if (latest.provider === DbDeploymentProvider.SELF_HOSTED) provider = "self_hosted";

  let status: DeploymentConfig["status"] = "idle";
  if (latest.status === DbDeploymentStatus.BUILDING) status = "building";
  else if (latest.status === DbDeploymentStatus.DEPLOYED) status = "deployed";
  else if (latest.status === DbDeploymentStatus.ERROR) status = "error";

  return {
    provider,
    status,
    productionUrl: latest.productionUrl || undefined,
    previewUrl: latest.previewUrl || undefined,
    deploymentId: latest.deploymentId || undefined,
    buildTimeMs: latest.buildTimeMs || undefined,
    lastDeployedAt: latest.deployedAt ? latest.deployedAt.toISOString() : undefined,
  };
}

/**
 * Reconstitutes a domain CanonicalSite aggregate root from database entities
 */
export function toCanonicalSite(dbSite: FullDbSite): CanonicalSite {
  const bp = dbSite.businessProfile;
  const content = dbSite.content;
  const sc = dbSite.sectionConfiguration;
  const settings = dbSite.settings;

  // Reconstitute BusinessProfile
  const businessProfile: BusinessProfile = {
    identity: {
      companyName: bp?.companyName || dbSite.name,
      sector: bp?.sector || "hizmet",
      slogan: bp?.slogan || "",
      shortDescription: bp?.slogan || "",
    },
    contact: {
      phone: bp?.phone || "",
      email: bp?.email || "",
      whatsapp: bp?.whatsapp || "",
    },
    location: {
      address: bp?.address || "",
      city: bp?.city || "",
      district: "",
      serviceAreas: (bp?.serviceAreas as unknown as string[]) || [],
    },
    workingHours: (bp?.workingHours as unknown as BusinessProfile["workingHours"]) || {
      raw: "Pazartesi - Cumartesi: 08:30 - 19:00",
    },
    branding: (bp?.branding as unknown as BusinessProfile["branding"]) || {},
    services: (bp?.services as unknown as BusinessProfile["services"]) || [],
    social: (bp?.social as unknown as BusinessProfile["social"]) || {},
  };

  // Reconstitute SectionConfiguration
  const sectionConfig: SectionConfiguration = {
    sections: (sc?.sections as unknown as SectionConfiguration["sections"]) || [],
    header: (sc?.header as unknown as SectionConfiguration["header"]) || {
      sticky: true,
      showPhoneButton: true,
      showWhatsAppButton: true,
      showCtaButton: true,
      ctaText: "Hemen Ara",
      ctaTarget: "tel:" + businessProfile.contact.phone,
      navLinks: [],
    },
    footer: (sc?.footer as unknown as SectionConfiguration["footer"]) || {
      showWorkingHours: true,
      showSocialIcons: true,
      showQuickLinks: true,
      showCopyright: true,
    },
  };

  // Reconstitute SiteContent
  const siteContent: SiteContent = {
    hero: (content?.hero as unknown as SiteContent["hero"]) || {
      badge: "Hızlı & Güvenilir Hizmet",
      title: `${businessProfile.identity.companyName} - Profesyonel Hizmetler`,
      subtitle: "Güvenilir, Hızlı ve Garantili Çözümler",
      ctaPrimaryText: "Hemen Ara",
      ctaPrimaryLink: "tel:" + businessProfile.contact.phone,
      ctaSecondaryText: "WhatsApp",
      ctaSecondaryLink: "https://wa.me/" + businessProfile.contact.whatsapp,
      bgImageUrl: "",
    },
    about: (content?.about as unknown as SiteContent["about"]) || {
      badge: "Hakkımızda",
      title: "Hakkımızda",
      contentHtml: `${businessProfile.identity.companyName} olarak uzman kadromuzla yanınızdayız.`,
      bulletPoints: [],
      imageUrl: "",
    },
    whyUs: (content?.whyUs as unknown as SiteContent["whyUs"]) || {
      badge: "Neden Biz?",
      title: "Güvenilir Tercih",
      subtitle: "Yılların deneyimi ile hizmetinizdeyiz.",
      items: [],
    },
    contact: {
      badge: "İletişim",
      title: "Bize Ulaşın",
      subtitle: "Sorularınız için bizimle iletişime geçin.",
    },
    gallery: (content?.gallery as unknown as SiteContent["gallery"]) || [],
    testimonials: (content?.testimonials as unknown as SiteContent["testimonials"]) || [],
    faqs: (content?.faqs as unknown as SiteContent["faqs"]) || [],
    pricingPlans: (content?.pricingPlans as unknown as SiteContent["pricingPlans"]) || [],
    blogPosts: (content?.blogPosts as unknown as SiteContent["blogPosts"]) || [],
    catalogProducts: (content?.catalogProducts as unknown as SiteContent["catalogProducts"]) || [],
    customPages: (content?.customPages as unknown as SiteContent["customPages"]) || [],
  };

  // Reconstitute SiteSettings
  const domainConfig = mapDbDomainToCanonicalConfig(dbSite.domains);
  const deploymentConfig = mapDbDeploymentToCanonicalConfig(dbSite.deployments);

  const siteSettings: SiteSettings = {
    structureMode: (settings?.structureMode as SiteSettings["structureMode"]) || "single-page",
    domain: domainConfig,
    deployment: deploymentConfig,
    seo: (settings?.seo as unknown as SiteSettings["seo"]) || {
      metaTitle: `${businessProfile.identity.companyName} | ${businessProfile.location.city || "Türkiye"}`,
      metaDescription: `${businessProfile.identity.companyName} profesyonel hizmet sunar.`,
      keywords: businessProfile.identity.sector,
      author: businessProfile.identity.companyName,
      robots: "index, follow",
      schemaConfig: {
        enabled: true,
        autoInjectLocalBusiness: true,
        autoInjectProducts: false,
        autoInjectFaq: true,
        autoInjectBreadcrumbs: true,
        businessType: "LocalBusiness",
      },
    },
    analytics: (settings?.analytics as unknown as SiteSettings["analytics"]) || {},
    whatsappWidget: (settings?.whatsappWidget as unknown as SiteSettings["whatsappWidget"]) || {
      enabled: Boolean(businessProfile.contact.whatsapp),
      phoneNumber: businessProfile.contact.whatsapp,
      defaultMessage: `Merhaba, ${businessProfile.identity.companyName} web sitesi üzerinden ulaşıyorum.`,
      position: "bottom-right",
      showOnlineBadge: true,
    },
    leads: (settings?.leads as unknown as SiteSettings["leads"]) || {
      notificationEmail: businessProfile.contact.email,
      enableInstantEmailNotification: true,
    },
    performance: (settings?.performance as unknown as SiteSettings["performance"]) || {
      enableEdgeCache: true,
      lazyLoadImages: true,
      minifyStaticHtml: true,
      criticalCssInline: true,
    },
    locale: (settings?.locale as unknown as SiteSettings["locale"]) || {
      defaultLocale: "tr",
      supportedLocales: ["tr"],
    },
  };

  // ActiveDesignConfig default
  const designTemplate: ActiveDesignConfig = {
    templateId: "template-modern-minimal-v1",
    templateSlug: "modern-minimal",
    customTokens: {
      palette: {
        primary: "#1E40AF",
        primaryDark: "#1E3A8A",
        secondary: "#0F172A",
        accent: "#F59E0B",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#0F172A",
        textMuted: "#64748B",
        border: "#E2E8F0",
      },
      typography: {
        fontHeading: "Inter, sans-serif",
        fontBody: "Inter, sans-serif",
        headingWeight: "700",
        baseFontSize: "16px",
      },
      geometry: {
        borderRadius: "md",
        containerMaxWidth: "wide",
        sectionSpacing: "normal",
        cardStyle: "elevated",
      },
    },
  };

  return {
    id: dbSite.id,
    schemaVersion: (dbSite.schemaVersion as "1.0.0") || "1.0.0",
    status: mapDbSiteStatusToCanonical(dbSite.status),
    createdAt: dbSite.createdAt.toISOString(),
    updatedAt: dbSite.updatedAt.toISOString(),
    businessProfile,
    industryPackId: dbSite.industryPackId || undefined,
    designTemplate,
    sectionConfiguration: sectionConfig,
    content: siteContent,
    settings: siteSettings,
  };
}

/**
 * Creates the Prisma database create input bundle from a CanonicalSite
 */
export function toPrismaSiteCreateInput(
  canonical: CanonicalSite,
  workspaceId: string,
  slug: string
): Prisma.SiteCreateInput {
  const bp = canonical.businessProfile;
  const content = canonical.content;
  const sc = canonical.sectionConfiguration;
  const st = canonical.settings;

  return {
    id: canonical.id,
    workspace: {
      connect: { id: workspaceId },
    },
    name: bp.identity.companyName,
    slug,
    status: mapCanonicalSiteStatusToDb(canonical.status),
    schemaVersion: canonical.schemaVersion,
    industryPack: canonical.industryPackId
      ? { connect: { id: canonical.industryPackId } }
      : undefined,

    // 1:1 BusinessProfile
    businessProfile: {
      create: {
        companyName: bp.identity.companyName,
        sector: bp.identity.sector,
        slogan: bp.identity.slogan || null,
        phone: bp.contact.phone || null,
        email: bp.contact.email || null,
        whatsapp: bp.contact.whatsapp || null,
        address: bp.location.address || null,
        city: bp.location.city || null,
        workingHours: (bp.workingHours || {}) as unknown as Prisma.InputJsonValue,
        branding: (bp.branding || {}) as unknown as Prisma.InputJsonValue,
        services: (bp.services || []) as unknown as Prisma.InputJsonValue,
        serviceAreas: (bp.location.serviceAreas || []) as unknown as Prisma.InputJsonValue,
        social: (bp.social || {}) as unknown as Prisma.InputJsonValue,
      },
    },

    // 1:1 SiteContent
    content: {
      create: {
        hero: (content.hero || {}) as unknown as Prisma.InputJsonValue,
        about: (content.about || {}) as unknown as Prisma.InputJsonValue,
        whyUs: (content.whyUs || {}) as unknown as Prisma.InputJsonValue,
        gallery: (content.gallery || []) as unknown as Prisma.InputJsonValue,
        testimonials: (content.testimonials || []) as unknown as Prisma.InputJsonValue,
        faqs: (content.faqs || []) as unknown as Prisma.InputJsonValue,
        pricingPlans: (content.pricingPlans || []) as unknown as Prisma.InputJsonValue,
        blogPosts: (content.blogPosts || []) as unknown as Prisma.InputJsonValue,
        catalogProducts: (content.catalogProducts || []) as unknown as Prisma.InputJsonValue,
        customPages: (content.customPages || []) as unknown as Prisma.InputJsonValue,
      },
    },

    // 1:1 SectionConfiguration
    sectionConfiguration: {
      create: {
        sections: (sc.sections || []) as unknown as Prisma.InputJsonValue,
        header: (sc.header || {}) as unknown as Prisma.InputJsonValue,
        footer: (sc.footer || {}) as unknown as Prisma.InputJsonValue,
      },
    },

    // 1:1 SiteSettings
    settings: {
      create: {
        structureMode: st.structureMode,
        seo: (st.seo || {}) as unknown as Prisma.InputJsonValue,
        analytics: (st.analytics || {}) as unknown as Prisma.InputJsonValue,
        whatsappWidget: (st.whatsappWidget || {}) as unknown as Prisma.InputJsonValue,
        leads: (st.leads || {}) as unknown as Prisma.InputJsonValue,
        performance: (st.performance || {}) as unknown as Prisma.InputJsonValue,
        locale: (st.locale || {}) as unknown as Prisma.InputJsonValue,
      },
    },

    // Invariant: SITE != DEPLOYMENT
    domains: {
      create: [
        {
          hostname: st.domain.hostname,
          isCustom: st.domain.isCustom,
          isPrimary: true,
          status:
            st.domain.status === "pending_dns"
              ? DbDomainStatus.PENDING_DNS
              : st.domain.status === "verifying"
              ? DbDomainStatus.VERIFYING
              : st.domain.status === "error"
              ? DbDomainStatus.ERROR
              : DbDomainStatus.ACTIVE,
          sslActive: st.domain.sslActive,
          dnsRecords: (st.domain.dnsRecords || []) as unknown as Prisma.InputJsonValue,
          verifiedAt: st.domain.verifiedAt ? new Date(st.domain.verifiedAt) : null,
        },
      ],
    },

    // Initial deployment record if present
    deployments: st.deployment
      ? {
          create: [
            {
              provider:
                st.deployment.provider === "edge_cdn"
                  ? DbDeploymentProvider.EDGE_CDN
                  : st.deployment.provider === "self_hosted"
                  ? DbDeploymentProvider.SELF_HOSTED
                  : DbDeploymentProvider.CLOUDFLARE_PAGES,
              status:
                st.deployment.status === "building"
                  ? DbDeploymentStatus.BUILDING
                  : st.deployment.status === "deployed"
                  ? DbDeploymentStatus.DEPLOYED
                  : st.deployment.status === "error"
                  ? DbDeploymentStatus.ERROR
                  : DbDeploymentStatus.IDLE,
              productionUrl: st.deployment.productionUrl || null,
              previewUrl: st.deployment.previewUrl || null,
              deploymentId: st.deployment.deploymentId || null,
              buildTimeMs: st.deployment.buildTimeMs || null,
              deployedAt: st.deployment.lastDeployedAt ? new Date(st.deployment.lastDeployedAt) : null,
            },
          ],
        }
      : undefined,
  };
}
