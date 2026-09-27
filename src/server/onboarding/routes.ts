/**
 * JetKur Smart Onboarding - Express API Routes (Sprint 11)
 *
 * Endpoints:
 * - GET  /api/onboarding/industries  -> Returns active industry list with summaries for wizard picker
 * - POST /api/onboarding/create-site -> Server-authoritative site creation with auth, entitlement, and idempotency
 */

import { Router, Response } from "express";
import { requireAuth, requireWorkspaceMember, AuthenticatedRequest } from "../auth/middleware";
import { onboardingService, OnboardingError } from "./onboardingService";
import { listOnboardingIndustries } from "../../domain/onboarding/industryResolver";
import { toSiteConfig } from "../../domain/site/legacyAdapter";

export const onboardingRouter = Router();

/**
 * Public/Client: Lists available industries for Onboarding Step 1
 */
onboardingRouter.get("/industries", (_req, res: Response) => {
  const industries = listOnboardingIndustries();
  res.json({
    success: true,
    industries,
  });
});

/**
 * Authenticated: Creates a canonical site from onboarding input
 */
onboardingRouter.post(
  "/create-site",
  requireAuth,
  requireWorkspaceMember("MEMBER"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.targetWorkspaceId || req.body?.workspaceId;
      const userId = req.user?.id;
      const idempotencyKey =
        (req.headers["x-idempotency-key"] as string) || req.body?.idempotencyKey;

      if (!workspaceId || !userId) {
        res.status(401).json({
          success: false,
          error: "Oturum açmanız ve çalışma alanı belirtmeniz gerekmektedir.",
          code: "UNAUTHENTICATED",
        });
        return;
      }

      const result = await onboardingService.createSiteFromOnboarding(req.body, {
        workspaceId,
        userId,
        userRole: req.targetWorkspaceRole,
        idempotencyKey,
      });

      const siteConfig = toSiteConfig(result.site);

      res.status(201).json({
        success: true,
        site: result.site,
        siteConfig,
        previewHtml: result.previewHtml,
        executionTimeMs: result.executionTimeMs,
        idempotentReplay: result.idempotentReplay,
      });
    } catch (err: any) {
      if (err instanceof OnboardingError) {
        res.status(err.statusCode).json({
          success: false,
          error: err.message,
          code: err.code,
          errors: err.errors,
        });
        return;
      }

      console.error("Onboarding create-site error:", err);
      res.status(500).json({
        success: false,
        error: "Site oluşturulurken beklenmeyen bir sunucu hatası oluştu.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);
