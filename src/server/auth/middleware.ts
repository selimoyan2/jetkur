import { Request, Response, NextFunction } from "express";
import { sessionService, SESSION_COOKIE_NAME, SessionWithUser } from "./sessionService";
import { prisma } from "../db/client";
import { WorkspaceRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: SessionWithUser["user"];
  session?: SessionWithUser["session"];
  targetWorkspaceId?: string;
  targetWorkspaceRole?: WorkspaceRole;
  targetSite?: {
    id: string;
    workspaceId: string;
    name: string;
    slug: string;
  };
}

const ROLE_PRIORITY: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Ensures the request comes from an authenticated session.
 * Reads HttpOnly cookie 'jetkur_session' (or Authorization: Bearer token for programmatic testing).
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  const bearerHeader = req.headers.authorization;
  const bearerToken = bearerHeader?.startsWith("Bearer ")
    ? bearerHeader.substring(7)
    : undefined;

  const rawToken = cookieToken || bearerToken;

  if (!rawToken) {
    res.status(401).json({
      error: "Oturum açmanız gerekmektedir.",
      code: "UNAUTHENTICATED",
    });
    return;
  }

  const sessionData = await sessionService.validateSession(rawToken);

  if (!sessionData) {
    res.status(401).json({
      error: "Geçersiz veya süresi dolmuş oturum.",
      code: "SESSION_EXPIRED",
    });
    return;
  }

  req.user = sessionData.user;
  req.session = sessionData.session;
  next();
}

/**
 * Ensures user is a platform-level SUPER_ADMIN
 */
export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Oturum açmanız gerekmektedir.", code: "UNAUTHENTICATED" });
    return;
  }

  if (req.user.platformRole !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Bu işlem için platform süper yönetici yetkisi gerekmektedir.",
      code: "FORBIDDEN_SUPER_ADMIN_REQUIRED",
    });
    return;
  }

  next();
}

/**
 * Ensures user is a member of the targeted Workspace, optionally with a minimum role.
 */
export function requireWorkspaceMember(minRole: WorkspaceRole = "MEMBER") {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Oturum açmanız gerekmektedir.", code: "UNAUTHENTICATED" });
      return;
    }

    const workspaceId =
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

    // Platform Super Admin bypasses workspace check
    if (req.user.platformRole === "SUPER_ADMIN") {
      req.targetWorkspaceId = workspaceId;
      req.targetWorkspaceRole = WorkspaceRole.OWNER;
      next();
      return;
    }

    const membership = req.user.memberships.find(
      (m) => m.workspaceId === workspaceId
    );

    if (!membership) {
      res.status(403).json({
        error: "Bu çalışma alanına erişim yetkiniz bulunmamaktadır.",
        code: "FORBIDDEN_NOT_WORKSPACE_MEMBER",
      });
      return;
    }

    // Role level check
    const userRolePriority = ROLE_PRIORITY[membership.role] || 0;
    const requiredRolePriority = ROLE_PRIORITY[minRole] || 0;

    if (userRolePriority < requiredRolePriority) {
      res.status(403).json({
        error: `Bu işlem için en az '${minRole}' yetkisi gerekmektedir. Mevcut rolünüz: '${membership.role}'.`,
        code: "FORBIDDEN_INSUFFICIENT_ROLE",
      });
      return;
    }

    req.targetWorkspaceId = workspaceId;
    req.targetWorkspaceRole = membership.role;
    next();
  };
}

/**
 * IDOR Protection: Verifies that the requested Site belongs to a Workspace
 * of which the authenticated user is an authorized member.
 */
export function requireSiteAccess(minRole: WorkspaceRole = "MEMBER") {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Oturum açmanız gerekmektedir.", code: "UNAUTHENTICATED" });
      return;
    }

    const siteId = req.params.siteId || req.body?.siteId;

    if (!siteId) {
      res.status(400).json({ error: "Site ID belirtilmelidir.", code: "SITE_ID_REQUIRED" });
      return;
    }

    // Query site workspace ownership from authoritative DB
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, workspaceId: true, name: true, slug: true },
    });

    if (!site) {
      res.status(404).json({ error: "Site bulunamadı.", code: "SITE_NOT_FOUND" });
      return;
    }

    // Super Admin has access
    if (req.user.platformRole === "SUPER_ADMIN") {
      req.targetSite = site;
      req.targetWorkspaceId = site.workspaceId;
      req.targetWorkspaceRole = WorkspaceRole.OWNER;
      next();
      return;
    }

    // Cross-tenant verification:
    // Does the authenticated user belong to the workspace that owns this site?
    const membership = req.user.memberships.find(
      (m) => m.workspaceId === site.workspaceId
    );

    if (!membership) {
      // Reject cross-tenant access with 403 Forbidden
      res.status(403).json({
        error: "Bu siteye erişim yetkiniz bulunmamaktadır.",
        code: "FORBIDDEN_CROSS_TENANT_ACCESS_DENIED",
      });
      return;
    }

    // Check role permission
    const userRolePriority = ROLE_PRIORITY[membership.role] || 0;
    const requiredRolePriority = ROLE_PRIORITY[minRole] || 0;

    if (userRolePriority < requiredRolePriority) {
      res.status(403).json({
        error: `Bu işlem için en az '${minRole}' yetkisi gerekmektedir. Mevcut rolünüz: '${membership.role}'.`,
        code: "FORBIDDEN_INSUFFICIENT_ROLE",
      });
      return;
    }

    req.targetSite = site;
    req.targetWorkspaceId = site.workspaceId;
    req.targetWorkspaceRole = membership.role;
    next();
  };
}
