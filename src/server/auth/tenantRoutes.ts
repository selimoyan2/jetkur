import { Router, Response } from "express";
import {
  requireAuth,
  requireWorkspaceMember,
  requireSiteAccess,
  AuthenticatedRequest,
} from "./middleware";
import { siteRepository } from "../db/siteRepository";
import { toSiteConfig, fromLegacySiteConfig } from "../../domain/site/legacyAdapter";
import { mediaService } from "../media/mediaService";

export const tenantRouter = Router();

// All tenant routes require authenticated session
tenantRouter.use(requireAuth);

/**
 * GET /api/tenants/active-site
 * Authoritative single active site resolution for customer dashboard
 */
tenantRouter.get(
  "/active-site",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const headerWsId = req.headers["x-workspace-id"] as string;
      const effectiveWorkspaceId =
        headerWsId ||
        user.memberships?.[0]?.workspaceId ||
        undefined;

      if (!effectiveWorkspaceId) {
        res.status(200).json({
          success: true,
          site: null,
          siteConfig: null,
          requiresOnboarding: true,
        });
        return;
      }

      const sites = await siteRepository.listSitesByWorkspace(effectiveWorkspaceId);
      if (!sites || sites.length === 0) {
        res.status(200).json({
          success: true,
          site: null,
          siteConfig: null,
          requiresOnboarding: true,
        });
        return;
      }

      const activeSite = sites[0];
      const siteConfig = toSiteConfig(activeSite);

      res.status(200).json({
        success: true,
        site: activeSite,
        siteConfig,
        workspaceId: effectiveWorkspaceId,
        requiresOnboarding: false,
      });
    } catch (error) {
      console.error("[Tenant] Error resolving active site:", error);
      res.status(500).json({ error: "Aktif site bilgisi alınamadı." });
    }
  }
);

/**
 * GET /api/tenants/workspaces
 * Lists workspaces for the currently authenticated user
 */
tenantRouter.get(
  "/workspaces",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const workspaces = await siteRepository.listWorkspacesForUser(req.user!.id);
      res.status(200).json({ workspaces });
    } catch (error) {
      console.error("[Tenant] Error listing workspaces:", error);
      res.status(500).json({ error: "Çalışma alanları listelenemedi." });
    }
  }
);

/**
 * GET /api/tenants/workspaces/:workspaceId/sites
 * Scoped by Workspace Membership. A user cannot list sites of a workspace they do not belong to.
 */
tenantRouter.get(
  "/workspaces/:workspaceId/sites",
  requireWorkspaceMember("MEMBER"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const workspaceId = req.targetWorkspaceId!;
      const sites = await siteRepository.listSitesByWorkspace(workspaceId);
      res.status(200).json({ workspaceId, sites });
    } catch (error) {
      console.error("[Tenant] Error listing sites:", error);
      res.status(500).json({ error: "Siteler listelenemedi." });
    }
  }
);

/**
 * GET /api/tenants/sites/:siteId
 * IDOR Protection: Checks that the site belongs to a workspace the user is a member of.
 */
tenantRouter.get(
  "/sites/:siteId",
  requireSiteAccess("MEMBER"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const siteId = req.targetSite!.id;
      const site = await siteRepository.getSiteById(siteId);

      if (!site) {
        res.status(404).json({ error: "Site bulunamadı." });
        return;
      }

      res.status(200).json({
        site,
        workspaceId: req.targetWorkspaceId,
        userRole: req.targetWorkspaceRole,
      });
    } catch (error) {
      console.error("[Tenant] Error fetching site:", error);
      res.status(500).json({ error: "Site bilgisi alınamadı." });
    }
  }
);

/**
 * PUT /api/tenants/sites/:siteId/content
 * Cross-Tenant Update Protection: Requires ADMIN or OWNER role in the owning workspace.
 */
tenantRouter.put(
  "/sites/:siteId/content",
  requireSiteAccess("ADMIN"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const siteId = req.targetSite!.id;
      const contentPatch = req.body.content;

      if (!contentPatch || typeof contentPatch !== "object") {
        res.status(400).json({ error: "Güncellenecek içerik verisi gereklidir." });
        return;
      }

      await siteRepository.updateSiteContent(siteId, contentPatch);
      const updatedSite = await siteRepository.getSiteById(siteId);
      res.status(200).json({
        success: true,
        message: "Site içeriği başarıyla güncellendi.",
        site: updatedSite,
        siteConfig: updatedSite ? toSiteConfig(updatedSite) : null,
      });
    } catch (error) {
      console.error("[Tenant] Error updating site content:", error);
      res.status(500).json({ error: "Site içeriği güncellenemedi." });
    }
  }
);

/**
 * PUT /api/tenants/sites/:siteId/business-profile
 * Updates canonical BusinessProfile fields (companyName, phone, whatsapp, email, address, etc.)
 */
tenantRouter.put(
  "/sites/:siteId/business-profile",
  requireSiteAccess("ADMIN"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const siteId = req.targetSite!.id;
      const bpPatch = req.body.businessProfile || req.body;

      if (!bpPatch || typeof bpPatch !== "object") {
        res.status(400).json({ error: "Güncellenecek işletme profili verisi gereklidir." });
        return;
      }

      await siteRepository.updateBusinessProfile(siteId, bpPatch);
      const updatedSite = await siteRepository.getSiteById(siteId);

      res.status(200).json({
        success: true,
        message: "İşletme profili başarıyla güncellendi.",
        site: updatedSite,
        siteConfig: updatedSite ? toSiteConfig(updatedSite) : null,
      });
    } catch (error) {
      console.error("[Tenant] Error updating business profile:", error);
      res.status(500).json({ error: "İşletme profili güncellenemedi." });
    }
  }
);

/**
 * PUT /api/tenants/sites/:siteId/sync
 * Centralized Canonical Synchronization: Persists full SiteConfig or CanonicalSite updates
 * from customer dashboard actions (BusinessProfile, SiteContent, SectionConfig, Logo, BrandKit).
 */
tenantRouter.put(
  "/sites/:siteId/sync",
  requireSiteAccess("ADMIN"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const siteId = req.targetSite!.id;
      const workspaceId = req.targetWorkspaceId!;
      const { siteConfig, canonicalSite } = req.body;

      let canonicalToSave = canonicalSite;
      if (!canonicalToSave && siteConfig) {
        canonicalToSave = fromLegacySiteConfig(siteConfig);
      }

      if (!canonicalToSave) {
        res.status(400).json({ error: "Kaydedilecek site verisi (siteConfig veya canonicalSite) gereklidir." });
        return;
      }

      // If logo is present and customer uploaded, ensure it is recorded in MediaAsset store
      const logoUrl =
        canonicalToSave.businessProfile?.branding?.logoUrl ||
        canonicalToSave.brandKit?.logo?.url;

      if (logoUrl) {
        try {
          await mediaService.assignMediaToSlot(
            siteId,
            workspaceId,
            `media-logo-${siteId}`,
            "logo"
          ).catch(() => {});
        } catch {
          // non-blocking
        }
      }

      const updatedSite = await siteRepository.updateFullSite(siteId, canonicalToSave);

      res.status(200).json({
        success: true,
        message: "Site başarıyla senkronize edildi ve kaydedildi.",
        site: updatedSite,
        siteConfig: updatedSite ? toSiteConfig(updatedSite) : (siteConfig || null),
      });
    } catch (error) {
      console.error("[Tenant] Error syncing site:", error);
      res.status(500).json({ error: "Site senkronizasyonu başarısız oldu." });
    }
  }
);

export default tenantRouter;
