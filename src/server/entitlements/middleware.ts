/**
 * JetKur Entitlement Guard Middleware (Sprint 04)
 * 
 * Enforces:
 * AUTHENTICATED USER
 * ↓
 * WORKSPACE MEMBERSHIP
 * ↓
 * RESOURCE OWNERSHIP
 * ↓
 * SUBSCRIPTION STATUS
 * ↓
 * ENTITLEMENT
 * ↓
 * ACTION
 */

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/middleware";
import { entitlementService } from "./entitlementService";

/**
 * Ensures workspace holds the required capability entitlement
 */
export function requireEntitlement(featureKey: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: "Oturum açmanız gerekmektedir.",
        code: "UNAUTHENTICATED",
      });
      return;
    }

    const workspaceId =
      req.targetWorkspaceId ||
      req.params.workspaceId ||
      (req.headers["x-workspace-id"] as string) ||
      req.body?.workspaceId;

    if (!workspaceId) {
      res.status(400).json({
        error: "Çalışma alanı (workspaceId) belirtilmelidir.",
        code: "WORKSPACE_ID_REQUIRED",
      });
      return;
    }

    // Super Admin platform authority bypass
    if (req.user.platformRole === "SUPER_ADMIN") {
      next();
      return;
    }

    try {
      await entitlementService.assertEntitlement(workspaceId, featureKey);
      next();
    } catch (err: any) {
      res.status(err.statusCode || 403).json({
        error: err.message || "Bu özellik için yetkiniz bulunmamaktadır.",
        code: err.code || "FEATURE_NOT_ENTITLED",
        featureKey,
      });
    }
  };
}

/**
 * Ensures workspace has not exceeded its site limit before site creation
 */
export function requireSiteCreationAllowance() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: "Oturum açmanız gerekmektedir.",
        code: "UNAUTHENTICATED",
      });
      return;
    }

    const workspaceId =
      req.targetWorkspaceId ||
      req.params.workspaceId ||
      (req.headers["x-workspace-id"] as string) ||
      req.body?.workspaceId;

    if (!workspaceId) {
      res.status(400).json({
        error: "Çalışma alanı (workspaceId) belirtilmelidir.",
        code: "WORKSPACE_ID_REQUIRED",
      });
      return;
    }

    // Super Admin platform bypass
    if (req.user.platformRole === "SUPER_ADMIN") {
      next();
      return;
    }

    const allowance = await entitlementService.canCreateSite(workspaceId);
    if (!allowance.allowed) {
      if (allowance.reason === "SUBSCRIPTION_EXPIRED") {
        res.status(403).json({
          error: "Abonelik veya deneme süreniz sona ermiştir. Yeni site oluşturmak için paketinizi yenileyiniz.",
          code: "SUBSCRIPTION_EXPIRED",
          used: allowance.used,
          limit: allowance.limit,
        });
        return;
      }

      res.status(403).json({
        error: `Paketinizin site limitine (${allowance.limit} site) ulaştınız. Yeni site eklemek için paketinizi yükseltiniz.`,
        code: "SITE_LIMIT_REACHED",
        used: allowance.used,
        limit: allowance.limit,
      });
      return;
    }

    next();
  };
}
