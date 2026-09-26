import { Router, Response } from "express";
import {
  requireAuth,
  requireWorkspaceMember,
  requireSiteAccess,
  AuthenticatedRequest,
} from "./middleware";
import { siteRepository } from "../db/siteRepository";

export const tenantRouter = Router();

// All tenant routes require authenticated session
tenantRouter.use(requireAuth);

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
      res.status(200).json({ success: true, message: "Site içeriği başarıyla güncellendi." });
    } catch (error) {
      console.error("[Tenant] Error updating site content:", error);
      res.status(500).json({ error: "Site içeriği güncellenemedi." });
    }
  }
);

export default tenantRouter;
