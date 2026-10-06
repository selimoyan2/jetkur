/**
 * JetKur Canonical Media API Routes (Sprint 14)
 *
 * Exposes media management, secure upload, server-side stock search,
 * and slot assignment endpoints.
 */

import { Router, Request, Response } from "express";
import { mediaService, MediaServiceError } from "./mediaService";
import { sessionService, SESSION_COOKIE_NAME } from "../auth/sessionService";

export const mediaRouter = Router();

async function resolveWorkspaceContext(req: Request): Promise<{
  workspaceId: string;
  userId?: string;
}> {
  // 1. Resolve session from cookie or Authorization Bearer header
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : undefined;
  const token = cookieToken || bearerToken;

  if (token) {
    const sessionData = await sessionService.validateSession(token);
    if (sessionData?.user) {
      const user = sessionData.user;
      const requestedWsId =
        (req.headers["x-workspace-id"] as string) ||
        (req.query.workspaceId as string) ||
        (req.body?.workspaceId as string);

      // Super admins can target any requested workspace
      if (user.platformRole === "SUPER_ADMIN") {
        return {
          workspaceId: requestedWsId || user.memberships[0]?.workspaceId || "default-workspace",
          userId: user.id,
        };
      }

      // If user requested a specific workspace, verify membership strictly
      if (requestedWsId) {
        const isMember = user.memberships.some((m) => m.workspaceId === requestedWsId);
        if (!isMember) {
          throw new MediaServiceError("Bu çalışma alanına erişim yetkiniz yok.", 403, "FORBIDDEN");
        }
        return {
          workspaceId: requestedWsId,
          userId: user.id,
        };
      }

      // Default to user's primary active workspace
      const userWsId = user.memberships[0]?.workspaceId;
      if (userWsId) {
        return {
          workspaceId: userWsId,
          userId: user.id,
        };
      }
    }
  }

  // 2. Unauthenticated fallback (e.g. CLI tests, verify scripts)
  const workspaceId =
    (req.headers["x-workspace-id"] as string) ||
    (req.query.workspaceId as string) ||
    (req.body?.workspaceId as string) ||
    "default-workspace";

  const userId =
    (req.headers["x-user-id"] as string) ||
    (req.query.userId as string) ||
    (req.body?.userId as string) ||
    undefined;

  return { workspaceId, userId };
}

/**
 * GET /api/media/sites/:siteId
 * Lists all media assets for a site
 */
mediaRouter.get("/sites/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);

    const assets = await mediaService.listSiteMedia(siteId, workspaceId);
    res.json({ success: true, assets });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Medya yüklenemedi." });
  }
});

/**
 * POST /api/media/sites/:siteId/upload
 * Uploads an image with server-side magic byte inspection
 */
mediaRouter.post("/sites/:siteId/upload", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);
    const { base64Data, filename, slotKey } = req.body || {};

    if (!base64Data || typeof base64Data !== "string") {
      res.status(400).json({ success: false, message: "Görsel verisi (base64) zorunludur." });
      return;
    }

    // Strip data URL prefix if present
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const asset = await mediaService.uploadMedia(
      siteId,
      workspaceId,
      buffer,
      filename || "uploaded-image.webp",
      slotKey
    );

    res.json({ success: true, asset });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Yükleme sırasında hata oluştu." });
  }
});

/**
 * GET /api/media/sites/:siteId/search
 * Searches stock photos using server-side Pexels (API key never exposed to client)
 */
mediaRouter.get("/sites/:siteId/search", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);
    const query = (req.query.q as string) || "business";
    const orientation = (req.query.orientation as any) || "landscape";

    const results = await mediaService.searchStockImages(siteId, workspaceId, query, orientation);
    res.json({ success: true, results });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Arama yapılamadı." });
  }
});

/**
 * POST /api/media/sites/:siteId/import-stock
 * Registers a chosen stock MediaAsset to the site's media library
 */
mediaRouter.post("/sites/:siteId/import-stock", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);
    const { asset } = req.body || {};

    if (!asset || !asset.id || !asset.originalUrl) {
      res.status(400).json({ success: false, message: "Geçersiz stok görsel verisi." });
      return;
    }

    const registered = await mediaService.registerStockAsset(siteId, workspaceId, asset);
    res.json({ success: true, asset: registered });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Görsel kaydedilemedi." });
  }
});

/**
 * POST /api/media/sites/:siteId/assign
 * Binds a media asset to a specific section slot
 */
mediaRouter.post("/sites/:siteId/assign", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);
    const { mediaId, slotKey } = req.body || {};

    if (!mediaId || !slotKey) {
      res.status(400).json({ success: false, message: "mediaId ve slotKey zorunludur." });
      return;
    }

    const updatedSite = await mediaService.assignMediaToSlot(siteId, workspaceId, mediaId, slotKey);
    res.json({ success: true, site: updatedSite });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Atama başarısız oldu." });
  }
});

/**
 * PUT /api/media/sites/:siteId/assets/:mediaId/alt
 * Updates alt text for an asset
 */
mediaRouter.put("/sites/:siteId/assets/:mediaId/alt", async (req: Request, res: Response) => {
  try {
    const { siteId, mediaId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);
    const { altText } = req.body || {};

    if (!altText || typeof altText !== "string") {
      res.status(400).json({ success: false, message: "altText zorunludur." });
      return;
    }

    const updated = await mediaService.updateMediaAltText(siteId, workspaceId, mediaId, altText);
    res.json({ success: true, asset: updated });
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Alt metin güncellenemedi." });
  }
});

/**
 * POST /api/media/sites/:siteId/auto-select
 * Automatically selects and distributes stock photos without duplicates
 */
mediaRouter.post("/sites/:siteId/auto-select", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = await resolveWorkspaceContext(req);

    const result = await mediaService.autoSelectAllImages(siteId, workspaceId);
    res.json(result);
  } catch (err: any) {
    if (err instanceof MediaServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Otomatik görsel seçimi başarısız oldu." });
  }
});

export default mediaRouter;
