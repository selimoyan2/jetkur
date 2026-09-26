import {
  WorkspaceType,
  WorkspaceRole,
  DeploymentProvider,
  DeploymentStatus,
  DomainStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "./client";
import {
  toCanonicalSite,
  toPrismaSiteCreateInput,
  FullDbSite,
} from "./mappers";
import {
  CanonicalSite,
  BusinessProfile,
  SiteContent,
  SectionConfiguration,
  SiteSettings,
} from "../../domain/site";

const fullSiteInclude = {
  businessProfile: true,
  content: true,
  sectionConfiguration: true,
  settings: true,
  domains: true,
  deployments: true,
} as const;

export class SiteRepository {
  // ==========================================
  // 1. MULTI-TENANT WORKSPACE & MEMBERSHIP
  // USER -> WORKSPACE -> SITES
  // ==========================================

  /**
   * Creates a workspace and assigns the initiating user as OWNER
   */
  async createWorkspace(data: {
    name: string;
    type?: WorkspaceType;
    ownerUserId: string;
  }) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        type: data.type || WorkspaceType.BUSINESS,
        members: {
          create: {
            userId: data.ownerUserId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Adds a user to a workspace with a specific role (OWNER, ADMIN, MEMBER)
   */
  async addWorkspaceMember(data: {
    workspaceId: string;
    userId: string;
    role?: WorkspaceRole;
  }) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role || WorkspaceRole.MEMBER,
      },
      include: {
        user: true,
        workspace: true,
      },
    });
  }

  /**
   * Lists all workspaces where the user is an active member
   */
  async listWorkspacesForUser(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
        },
        _count: {
          select: { sites: true, members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lists all sites in a workspace (SME single site or Agency multi-site)
   */
  async listSitesByWorkspace(workspaceId: string) {
    const dbSites = await prisma.site.findMany({
      where: { workspaceId },
      include: fullSiteInclude,
      orderBy: { createdAt: "desc" },
    });

    return dbSites.map((s) => toCanonicalSite(s as FullDbSite));
  }

  // ==========================================
  // 2. CANONICAL SITE PERSISTENCE
  // SITE = BUSINESS PROFILE + INDUSTRY PACK + DESIGN TEMPLATE + SECTION CONFIG + SITE CONTENT + SITE SETTINGS
  // ==========================================

  /**
   * Persists a complete new CanonicalSite within a workspace
   */
  async createSite(
    workspaceId: string,
    canonical: CanonicalSite,
    slug?: string
  ): Promise<CanonicalSite> {
    const generatedSlug =
      slug ||
      canonical.businessProfile.identity.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

    const input = toPrismaSiteCreateInput(canonical, workspaceId, generatedSlug);

    const created = await prisma.site.create({
      data: input,
      include: fullSiteInclude,
    });

    return toCanonicalSite(created as FullDbSite);
  }

  /**
   * Loads a canonical site by its primary ID
   */
  async getSiteById(siteId: string): Promise<CanonicalSite | null> {
    const dbSite = await prisma.site.findUnique({
      where: { id: siteId },
      include: fullSiteInclude,
    });

    if (!dbSite) return null;
    return toCanonicalSite(dbSite as FullDbSite);
  }

  /**
   * Loads a canonical site by its public slug
   */
  async getSiteBySlug(slug: string): Promise<CanonicalSite | null> {
    const dbSite = await prisma.site.findUnique({
      where: { slug },
      include: fullSiteInclude,
    });

    if (!dbSite) return null;
    return toCanonicalSite(dbSite as FullDbSite);
  }

  /**
   * Updates the portable BusinessProfile of a site
   */
  async updateBusinessProfile(
    siteId: string,
    bp: Partial<BusinessProfile>
  ): Promise<void> {
    const updateData: Prisma.BusinessProfileUpdateInput = {};

    if (bp.identity?.companyName) updateData.companyName = bp.identity.companyName;
    if (bp.identity?.sector) updateData.sector = bp.identity.sector;
    if (bp.identity?.slogan !== undefined) updateData.slogan = bp.identity.slogan;
    if (bp.contact?.phone !== undefined) updateData.phone = bp.contact.phone;
    if (bp.contact?.email !== undefined) updateData.email = bp.contact.email;
    if (bp.contact?.whatsapp !== undefined) updateData.whatsapp = bp.contact.whatsapp;
    if (bp.location?.address !== undefined) updateData.address = bp.location.address;
    if (bp.location?.city !== undefined) updateData.city = bp.location.city;
    if (bp.workingHours) updateData.workingHours = bp.workingHours as unknown as Prisma.InputJsonValue;
    if (bp.branding) updateData.branding = bp.branding as unknown as Prisma.InputJsonValue;
    if (bp.services) updateData.services = bp.services as unknown as Prisma.InputJsonValue;
    if (bp.location?.serviceAreas) updateData.serviceAreas = bp.location.serviceAreas as unknown as Prisma.InputJsonValue;
    if (bp.social) updateData.social = bp.social as unknown as Prisma.InputJsonValue;

    await prisma.businessProfile.update({
      where: { siteId },
      data: updateData,
    });
  }

  /**
   * Updates editable site content (copywriting, hero, FAQs, blog posts, etc.)
   */
  async updateSiteContent(
    siteId: string,
    content: Partial<SiteContent>
  ): Promise<void> {
    const updateData: Prisma.SiteContentUpdateInput = {};

    if (content.hero) updateData.hero = content.hero as unknown as Prisma.InputJsonValue;
    if (content.about) updateData.about = content.about as unknown as Prisma.InputJsonValue;
    if (content.whyUs) updateData.whyUs = content.whyUs as unknown as Prisma.InputJsonValue;
    if (content.gallery) updateData.gallery = content.gallery as unknown as Prisma.InputJsonValue;
    if (content.testimonials) updateData.testimonials = content.testimonials as unknown as Prisma.InputJsonValue;
    if (content.faqs) updateData.faqs = content.faqs as unknown as Prisma.InputJsonValue;
    if (content.pricingPlans) updateData.pricingPlans = content.pricingPlans as unknown as Prisma.InputJsonValue;
    if (content.blogPosts) updateData.blogPosts = content.blogPosts as unknown as Prisma.InputJsonValue;
    if (content.catalogProducts) updateData.catalogProducts = content.catalogProducts as unknown as Prisma.InputJsonValue;
    if (content.customPages) updateData.customPages = content.customPages as unknown as Prisma.InputJsonValue;

    await prisma.siteContent.update({
      where: { siteId },
      data: updateData,
    });
  }

  /**
   * Updates SectionConfiguration (sections ordering and variants)
   */
  async updateSectionConfiguration(
    siteId: string,
    sc: SectionConfiguration
  ): Promise<void> {
    await prisma.sectionConfiguration.update({
      where: { siteId },
      data: {
        sections: sc.sections as unknown as Prisma.InputJsonValue,
        header: sc.header as unknown as Prisma.InputJsonValue,
        footer: sc.footer as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Updates technical SiteSettings (SEO, analytics, whatsapp widget, performance)
   */
  async updateSiteSettings(
    siteId: string,
    settings: Partial<SiteSettings>
  ): Promise<void> {
    const updateData: Prisma.SiteSettingsUpdateInput = {};

    if (settings.structureMode) updateData.structureMode = settings.structureMode;
    if (settings.seo) updateData.seo = settings.seo as unknown as Prisma.InputJsonValue;
    if (settings.analytics) updateData.analytics = settings.analytics as unknown as Prisma.InputJsonValue;
    if (settings.whatsappWidget) updateData.whatsappWidget = settings.whatsappWidget as unknown as Prisma.InputJsonValue;
    if (settings.leads) updateData.leads = settings.leads as unknown as Prisma.InputJsonValue;
    if (settings.performance) updateData.performance = settings.performance as unknown as Prisma.InputJsonValue;
    if (settings.locale) updateData.locale = settings.locale as unknown as Prisma.InputJsonValue;

    await prisma.siteSettings.update({
      where: { siteId },
      data: updateData,
    });
  }

  /**
   * Deletes a site and all associated cascade records
   */
  async deleteSite(siteId: string): Promise<void> {
    await prisma.site.delete({
      where: { id: siteId },
    });
  }

  // ==========================================
  // 3. INFRASTRUCTURE & LIFECYCLE (SITE != DEPLOYMENT)
  // Domains and Deployments are distinct lifecycle models
  // ==========================================

  /**
   * Records an infrastructure deployment (Cloudflare Pages, Edge CDN, etc.)
   */
  async recordDeployment(
    siteId: string,
    data: {
      provider: DeploymentProvider;
      status: DeploymentStatus;
      productionUrl?: string;
      previewUrl?: string;
      deploymentId?: string;
      buildTimeMs?: number;
      commitHash?: string;
      logs?: string;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    return prisma.deployment.create({
      data: {
        siteId,
        provider: data.provider,
        status: data.status,
        productionUrl: data.productionUrl || null,
        previewUrl: data.previewUrl || null,
        deploymentId: data.deploymentId || null,
        buildTimeMs: data.buildTimeMs || null,
        commitHash: data.commitHash || null,
        logs: data.logs || null,
        metadata: data.metadata || undefined,
        deployedAt: data.status === DeploymentStatus.DEPLOYED ? new Date() : null,
      },
    });
  }

  /**
   * Adds a custom domain to a site
   */
  async addCustomDomain(
    siteId: string,
    data: {
      hostname: string;
      isCustom?: boolean;
      isPrimary?: boolean;
    }
  ) {
    // If setting as primary, unset other primaries
    if (data.isPrimary) {
      await prisma.domain.updateMany({
        where: { siteId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.domain.create({
      data: {
        siteId,
        hostname: data.hostname,
        isCustom: data.isCustom !== undefined ? data.isCustom : true,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
        status: DomainStatus.PENDING_DNS,
        sslActive: false,
      },
    });
  }

  /**
   * Retrieves all deployments for a site
   */
  async getSiteDeployments(siteId: string) {
    return prisma.deployment.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves all domains connected to a site
   */
  async getSiteDomains(siteId: string) {
    return prisma.domain.findMany({
      where: { siteId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
  }
}

export const siteRepository = new SiteRepository();
export default siteRepository;
