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

interface InMemorySiteEntry {
  workspaceId: string;
  site: CanonicalSite;
  slug: string;
}

const IN_MEMORY_SITES = new Map<string, InMemorySiteEntry>();
const IN_MEMORY_WORKSPACES = new Map<string, any>();

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
    const wsId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const wsObj = {
      id: wsId,
      name: data.name,
      type: data.type || WorkspaceType.BUSINESS,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: `mem-${Date.now()}`,
          workspaceId: wsId,
          userId: data.ownerUserId,
          role: WorkspaceRole.OWNER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    IN_MEMORY_WORKSPACES.set(wsId, wsObj);

    try {
      return await prisma.workspace.create({
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
    } catch {
      return wsObj as any;
    }
  }

  /**
   * Adds a user to a workspace with a specific role (OWNER, ADMIN, MEMBER)
   */
  async addWorkspaceMember(data: {
    workspaceId: string;
    userId: string;
    role?: WorkspaceRole;
  }) {
    const ws = IN_MEMORY_WORKSPACES.get(data.workspaceId);
    if (ws) {
      ws.members.push({
        id: `mem-${Date.now()}`,
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role || WorkspaceRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    try {
      return await prisma.workspaceMember.create({
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
    } catch {
      return {
        id: `mem-${Date.now()}`,
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role || WorkspaceRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
  }

  /**
   * Lists all workspaces where the user is an active member
   */
  async listWorkspacesForUser(userId: string) {
    try {
      const dbWorkspaces = await prisma.workspace.findMany({
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
      if (dbWorkspaces && dbWorkspaces.length > 0) {
        return dbWorkspaces;
      }
    } catch {
      // Prisma offline or DB unavailable
    }

    // In-memory fallback
    const matched = Array.from(IN_MEMORY_WORKSPACES.values()).filter((ws) =>
      ws.members?.some((m: any) => m.userId === userId)
    );

    return matched.map((ws) => ({
      ...ws,
      _count: {
        sites: Array.from(IN_MEMORY_SITES.values()).filter((s) => s.workspaceId === ws.id).length,
        members: ws.members.length,
      },
    }));
  }

  /**
   * Lists all sites in a workspace (SME single site or Agency multi-site)
   */
  async listSitesByWorkspace(workspaceId: string) {
    try {
      const dbSites = await prisma.site.findMany({
        where: { workspaceId },
        include: fullSiteInclude,
        orderBy: { createdAt: "desc" },
      });

      if (dbSites && dbSites.length > 0) {
        return dbSites.map((s) => toCanonicalSite(s as FullDbSite));
      }
    } catch {
      // Prisma offline / not configured
    }

    // Authoritative in-memory fallback
    const inMem = Array.from(IN_MEMORY_SITES.values())
      .filter((entry) => entry.workspaceId === workspaceId)
      .map((entry) => {
        const site = JSON.parse(JSON.stringify(entry.site));
        if (!site.workspaceId) site.workspaceId = entry.workspaceId;
        return site;
      });

    return inMem;
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
    canonical.workspaceId = workspaceId;
    const generatedSlug =
      slug ||
      canonical.businessProfile.identity.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

    // Save in authoritative in-memory store immediately
    IN_MEMORY_SITES.set(canonical.id, {
      workspaceId,
      site: JSON.parse(JSON.stringify(canonical)),
      slug: generatedSlug,
    });

    try {
      const input = toPrismaSiteCreateInput(canonical, workspaceId, generatedSlug);
      const created = await prisma.site.create({
        data: input,
        include: fullSiteInclude,
      });

      const reconstituted = toCanonicalSite(created as FullDbSite);
      if (!reconstituted.workspaceId) reconstituted.workspaceId = workspaceId;
      IN_MEMORY_SITES.set(canonical.id, {
        workspaceId,
        site: reconstituted,
        slug: generatedSlug,
      });
      return reconstituted;
    } catch {
      // In-memory record is already stored and active
      return canonical;
    }
  }

  /**
   * Loads a canonical site by its primary ID
   */
  async getSiteById(siteId: string): Promise<CanonicalSite | null> {
    try {
      const dbSite = await prisma.site.findUnique({
        where: { id: siteId },
        include: fullSiteInclude,
      });

      if (dbSite) return toCanonicalSite(dbSite as FullDbSite);
    } catch {
      // Prisma offline
    }

    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      const site = JSON.parse(JSON.stringify(entry.site));
      if (!site.workspaceId) site.workspaceId = entry.workspaceId;
      return site;
    }
    return null;
  }

  /**
   * Loads a canonical site by its public slug
   */
  async getSiteBySlug(slug: string): Promise<CanonicalSite | null> {
    try {
      const dbSite = await prisma.site.findUnique({
        where: { slug },
        include: fullSiteInclude,
      });

      if (dbSite) return toCanonicalSite(dbSite as FullDbSite);
    } catch {
      // Prisma offline
    }

    for (const entry of IN_MEMORY_SITES.values()) {
      if (entry.slug === slug || entry.site.settings?.domain?.hostname?.startsWith(slug)) {
        return JSON.parse(JSON.stringify(entry.site));
      }
    }

    return null;
  }

  /**
   * Updates the portable BusinessProfile of a site
   */
  async updateBusinessProfile(
    siteId: string,
    bp: Partial<BusinessProfile>
  ): Promise<void> {
    // 1. Update in-memory canonical site
    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      const existingBp = entry.site.businessProfile;
      if (bp.identity) {
        existingBp.identity = { ...existingBp.identity, ...bp.identity };
      }
      if (bp.contact) {
        existingBp.contact = { ...existingBp.contact, ...bp.contact };
      }
      if (bp.location) {
        existingBp.location = { ...existingBp.location, ...bp.location };
      }
      if (bp.workingHours) {
        existingBp.workingHours = { ...existingBp.workingHours, ...bp.workingHours };
      }
      if (bp.branding) {
        existingBp.branding = { ...existingBp.branding, ...bp.branding };
      }
      if (bp.services) {
        existingBp.services = bp.services;
      }
      if (bp.social) {
        existingBp.social = { ...existingBp.social, ...bp.social };
      }
      entry.site.updatedAt = new Date().toISOString();
    }

    // 2. Attempt Prisma update
    try {
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
    } catch {
      // Prisma offline or non-existent in DB
    }
  }

  /**
   * Updates editable site content (copywriting, hero, FAQs, blog posts, etc.)
   */
  async updateSiteContent(
    siteId: string,
    content: Partial<SiteContent>
  ): Promise<void> {
    // 1. Update in-memory canonical site
    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      entry.site.content = { ...entry.site.content, ...content };
      entry.site.updatedAt = new Date().toISOString();
    }

    // 2. Attempt Prisma update
    try {
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
      if (content.pages !== undefined || content.services !== undefined || content.products !== undefined) {
        const existingPages = content.pages !== undefined ? content.pages : (entry?.site.content.pages || []);
        const existingServices = content.services !== undefined ? content.services : (entry?.site.content.services || []);
        const existingProducts = content.products !== undefined ? content.products : (entry?.site.content.products || []);
        updateData.announcement = {
          pages: existingPages,
          services: existingServices,
          products: existingProducts,
        } as unknown as Prisma.InputJsonValue;
      }

      await prisma.siteContent.update({
        where: { siteId },
        data: updateData,
      });
    } catch {
      // Prisma offline
    }
  }

  /**
   * Updates SectionConfiguration (sections ordering and variants)
   */
  async updateSectionConfiguration(
    siteId: string,
    sc: SectionConfiguration
  ): Promise<void> {
    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      entry.site.sectionConfiguration = sc;
      entry.site.updatedAt = new Date().toISOString();
    }

    try {
      await prisma.sectionConfiguration.update({
        where: { siteId },
        data: {
          sections: sc.sections as unknown as Prisma.InputJsonValue,
          header: sc.header as unknown as Prisma.InputJsonValue,
          footer: sc.footer as unknown as Prisma.InputJsonValue,
        },
      });
    } catch {
      // Prisma offline
    }
  }

  /**
   * Updates technical SiteSettings (SEO, analytics, whatsapp widget, performance)
   */
  async updateSiteSettings(
    siteId: string,
    settings: Partial<SiteSettings>
  ): Promise<void> {
    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      entry.site.settings = { ...entry.site.settings, ...settings };
      entry.site.updatedAt = new Date().toISOString();
    }

    try {
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
    } catch {
      // Prisma offline
    }
  }

  /**
   * Updates the complete canonical site (BusinessProfile, SiteContent, SectionConfig, DesignTemplate, BrandKit)
   */
  async updateFullSite(
    siteId: string,
    updated: Partial<CanonicalSite>
  ): Promise<CanonicalSite | null> {
    const entry = IN_MEMORY_SITES.get(siteId);
    if (entry) {
      if (updated.businessProfile) {
        entry.site.businessProfile = { ...entry.site.businessProfile, ...updated.businessProfile };
      }
      if (updated.content) {
        entry.site.content = { ...entry.site.content, ...updated.content };
      }
      if (updated.designTemplate) {
        entry.site.designTemplate = { ...entry.site.designTemplate, ...updated.designTemplate };
      }
      if (updated.sectionConfiguration) {
        entry.site.sectionConfiguration = { ...entry.site.sectionConfiguration, ...updated.sectionConfiguration };
      }
      if (updated.settings) {
        entry.site.settings = { ...entry.site.settings, ...updated.settings };
      }
      if (updated.brandKit) {
        entry.site.brandKit = updated.brandKit;
        if (!entry.site.businessProfile.branding) entry.site.businessProfile.branding = {};
        entry.site.businessProfile.branding.brandKit = updated.brandKit;
      }
      entry.site.updatedAt = new Date().toISOString();
    }

    if (updated.businessProfile) await this.updateBusinessProfile(siteId, updated.businessProfile).catch(() => {});
    if (updated.content) await this.updateSiteContent(siteId, updated.content).catch(() => {});
    if (updated.sectionConfiguration) await this.updateSectionConfiguration(siteId, updated.sectionConfiguration).catch(() => {});
    if (updated.settings) await this.updateSiteSettings(siteId, updated.settings).catch(() => {});

    return entry ? JSON.parse(JSON.stringify(entry.site)) : this.getSiteById(siteId);
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
