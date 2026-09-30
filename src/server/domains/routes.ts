/**
 * JetKur Domain Management API Routes (Sprint 16)
 *
 * Implements:
 * 1. GET /api/domains/sites/:siteId: Lists all domains (subdomain + custom domains).
 * 2. POST /api/domains/sites/:siteId/subdomain: Sets/updates JetKur subdomain.
 * 3. POST /api/domains/sites/:siteId/custom: Adds custom domain with DNS instructions.
 * 4. POST /api/domains/sites/:siteId/verify: Triggers rate-limited DNS TXT verification.
 * 5. POST /api/domains/sites/:siteId/disconnect: Safely disconnects custom domain.
 */

import { Router, Request, Response } from "express";
import { domainService, DomainServiceError } from "./domainService";

export const domainRouter = Router();

function getWorkspaceContext(req: Request) {
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
 * GET /api/domains/sites/:siteId
 * Lists all domains associated with the site
 */
domainRouter.get("/sites/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);

    const domains = await domainService.getSiteDomains(siteId, workspaceId);
    res.json({ success: true, domains });
  } catch (err: any) {
    if (err instanceof DomainServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Alan adları yüklenemedi." });
  }
});

/**
 * POST /api/domains/sites/:siteId/subdomain
 * Sets or updates the JetKur subdomain
 */
domainRouter.post("/sites/:siteId/subdomain", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);
    const { slug } = req.body || {};

    if (!slug) {
      res.status(400).json({ success: false, message: "Site adresi (slug) gereklidir." });
      return;
    }

    const domain = await domainService.setSubdomain(siteId, workspaceId, slug);
    res.json({
      success: true,
      message: `Site adresiniz "${domain.hostname}" olarak güncellendi.`,
      domain,
    });
  } catch (err: any) {
    if (err instanceof DomainServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Subdomain ayarlanamadı." });
  }
});

/**
 * POST /api/domains/sites/:siteId/custom
 * Adds a custom domain and issues DNS TXT ownership instructions
 */
domainRouter.post("/sites/:siteId/custom", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);
    const { hostname } = req.body || {};

    if (!hostname) {
      res.status(400).json({ success: false, message: "Alan adı gereklidir." });
      return;
    }

    const domain = await domainService.addCustomDomain(siteId, workspaceId, hostname);
    res.json({
      success: true,
      message: "Alan adı eklendi. Lütfen DNS ayarlarınızı tamamlayın.",
      domain,
      dnsInstructions: domain.dnsInstructions,
    });
  } catch (err: any) {
    if (err instanceof DomainServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Alan adı eklenemedi." });
  }
});

/**
 * POST /api/domains/sites/:siteId/verify
 * Triggers DNS TXT ownership verification
 */
domainRouter.post("/sites/:siteId/verify", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);
    const { domainId } = req.body || {};

    if (!domainId) {
      res.status(400).json({ success: false, message: "domainId gereklidir." });
      return;
    }

    const result = await domainService.verifyCustomDomain(siteId, workspaceId, domainId);
    res.json({
      success: true,
      verified: result.verified,
      message: result.message,
      domain: result.domain,
    });
  } catch (err: any) {
    if (err instanceof DomainServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Doğrulama yapılamadı." });
  }
});

/**
 * POST /api/domains/sites/:siteId/disconnect
 * Safely disconnects custom domain while preserving all customer site content
 */
domainRouter.post("/sites/:siteId/disconnect", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);
    const { domainId } = req.body || {};

    if (!domainId) {
      res.status(400).json({ success: false, message: "domainId gereklidir." });
      return;
    }

    const result = await domainService.disconnectCustomDomain(siteId, workspaceId, domainId);
    res.json(result);
  } catch (err: any) {
    if (err instanceof DomainServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Bağlantı kaldırılamadı." });
  }
});

export default domainRouter;
