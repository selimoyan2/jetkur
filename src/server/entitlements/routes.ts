/**
 * JetKur Workspace Entitlement & Subscription API Routes (Sprint 04)
 * 
 * Endpoints:
 * GET /api/workspaces/:workspaceId/subscription
 * GET /api/workspaces/:workspaceId/entitlements
 * GET /api/workspaces/:workspaceId/usage
 */

import { Router } from "express";
import { requireAuth, requireWorkspaceMember, AuthenticatedRequest } from "../auth/middleware";
import { entitlementService } from "./entitlementService";

export const entitlementRouter = Router();

// Apply session authentication to all workspace entitlement endpoints
entitlementRouter.use(requireAuth);

/**
 * GET /api/workspaces/:workspaceId/subscription
 * Retrieves workspace subscription status and trial metadata
 */
entitlementRouter.get(
  "/:workspaceId/subscription",
  requireWorkspaceMember(),
  async (req: AuthenticatedRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      const bypassSuperAdmin = req.user?.platformRole === "SUPER_ADMIN";
      const subscription = await entitlementService.getEffectiveSubscription(workspaceId);

      res.json({
        subscription: {
          id: subscription.id,
          workspaceId: subscription.workspaceId,
          plan: {
            code: subscription.planCode,
            name: subscription.planName,
            siteLimit: subscription.siteLimit,
          },
          status: subscription.status,
          effectiveStatus: subscription.effectiveStatus,
          isTrial: subscription.isTrial,
          trialStartsAt: subscription.trialStartsAt?.toISOString() || null,
          trialEndsAt: subscription.trialEndsAt?.toISOString() || null,
          trialDaysRemaining: subscription.trialDaysRemaining,
          isExpired: subscription.isExpired,
          isReadOnly: subscription.isReadOnly,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        error: "Abonelik bilgisi alınırken bir hata oluştu.",
        details: err.message,
      });
    }
  }
);

/**
 * GET /api/workspaces/:workspaceId/entitlements
 * Retrieves the full entitlement snapshot: features, limits, and subscription state
 */
entitlementRouter.get(
  "/:workspaceId/entitlements",
  requireWorkspaceMember(),
  async (req: AuthenticatedRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      const bypassSuperAdmin = req.user?.platformRole === "SUPER_ADMIN";
      const snapshot = await entitlementService.getWorkspaceEntitlements(workspaceId, {
        bypassSuperAdmin,
      });

      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({
        error: "Yetki bilgileri alınırken bir hata oluştu.",
        details: err.message,
      });
    }
  }
);

/**
 * GET /api/workspaces/:workspaceId/usage
 * Retrieves site limits and active usage count
 */
entitlementRouter.get(
  "/:workspaceId/usage",
  requireWorkspaceMember(),
  async (req: AuthenticatedRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      const usage = await entitlementService.getWorkspaceUsage(workspaceId);

      res.json({
        sites: {
          used: usage.activeSites,
          max: usage.siteLimit,
          archived: usage.archivedSites,
          total: usage.totalSites,
          canCreate: usage.canCreateSite,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        error: "Kullanım bilgileri alınırken bir hata oluştu.",
        details: err.message,
      });
    }
  }
);
