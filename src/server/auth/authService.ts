import { Request } from "express";
import { prisma } from "../db/client";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { sessionService } from "./sessionService";
import { WorkspaceRole, WorkspaceType, UserStatus } from "@prisma/client";

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  workspaceType?: WorkspaceType;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  platformRole: "NORMAL" | "SUPER_ADMIN";
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  createdAt: string;
}

export interface UserWorkspaceSummary {
  id: string;
  name: string;
  type: WorkspaceType;
  role: WorkspaceRole;
  siteCount?: number;
}

export interface AuthSuccessResult {
  user: SafeUser;
  sessionToken: string;
  workspaces: UserWorkspaceSummary[];
  activeWorkspaceId: string;
}

export interface CurrentUserPayload {
  user: SafeUser;
  workspaces: UserWorkspaceSummary[];
  activeWorkspaceId: string;
}

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export class AuthService {
  /**
   * Registers a new user with transactional User + Workspace + WorkspaceMember(OWNER)
   */
  async register(dto: RegisterDto, req?: Request): Promise<AuthSuccessResult> {
    const email = normalizeEmail(dto.email);
    const name = dto.name?.trim();

    if (!validateEmailFormat(email)) {
      throw new AuthError("Geçerli bir e-posta adresi giriniz.", 400);
    }

    const passwordValidation = validatePasswordStrength(dto.password);
    if (!passwordValidation.valid) {
      throw new AuthError(passwordValidation.reason || "Geçersiz şifre.", 400);
    }

    if (!name || name.length < 2) {
      throw new AuthError("Ad ve soyad en az 2 karakter olmalıdır.", 400);
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AuthError("Bu e-posta adresi ile zaten bir hesap bulunmaktadır.", 409);
    }

    const passwordHash = await hashPassword(dto.password);
    const workspaceName = dto.companyName?.trim() || `${name} İşletmesi`;
    const workspaceType = dto.workspaceType || WorkspaceType.BUSINESS;

    // Transactional creation of User -> WorkspaceMember -> Workspace -> Subscription(TRIALING)
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          status: UserStatus.ACTIVE,
          platformRole: "NORMAL",
          lastLoginAt: new Date(),
        },
      });

      const newWorkspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          type: workspaceType,
          members: {
            create: {
              userId: newUser.id,
              role: WorkspaceRole.OWNER,
            },
          },
        },
      });

      // Sprint 04: Create server-authoritative 14-day TRIALING subscription on BUSINESS plan
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      let businessPlan = await tx.plan.findUnique({
        where: { code: "BUSINESS" },
      });

      if (!businessPlan) {
        businessPlan = await tx.plan.create({
          data: {
            code: "BUSINESS",
            name: "İşletme",
            description: "JetKur İşletme Planı",
            siteLimit: 3,
            trialDays: 14,
            monthlyPrice: 69900,
            currency: "TRY",
            status: "ACTIVE",
          },
        });
      }

      const newSubscription = await tx.subscription.create({
        data: {
          workspaceId: newWorkspace.id,
          planId: businessPlan.id,
          status: "TRIALING",
          trialStartsAt: now,
          trialEndsAt,
          currentPeriodStartsAt: now,
          currentPeriodEndsAt: trialEndsAt,
        },
      });

      return { user: newUser, workspace: newWorkspace, subscription: newSubscription };
    });

    // Create session
    const { rawToken } = await sessionService.createSession(result.user.id, req);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        platformRole: result.user.platformRole,
        status: result.user.status,
        createdAt: result.user.createdAt.toISOString(),
      },
      sessionToken: rawToken,
      workspaces: [
        {
          id: result.workspace.id,
          name: result.workspace.name,
          type: result.workspace.type,
          role: WorkspaceRole.OWNER,
        },
      ],
      activeWorkspaceId: result.workspace.id,
    };
  }

  /**
   * Logs in a user with password verification and session creation
   */
  async login(dto: LoginDto, req?: Request): Promise<AuthSuccessResult> {
    const email = normalizeEmail(dto.email);

    if (!email || !dto.password) {
      throw new AuthError("E-posta ve şifre zorunludur.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                _count: {
                  select: { sites: true },
                },
              },
            },
          },
        },
      },
    });

    // Generic error message to prevent user enumeration
    const genericAuthError = new AuthError("E-posta adresi veya şifre hatalı.", 401);

    if (!user || !user.passwordHash) {
      // Run dummy verify to prevent timing side-channel attacks
      await verifyPassword("dummy-password", "scrypt$0123456789abcdef$0123456789abcdef");
      throw genericAuthError;
    }

    const isMatch = await verifyPassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw genericAuthError;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthError("Hesabınız aktif durumda değildir.", 403);
    }

    // Touch lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const { rawToken } = await sessionService.createSession(user.id, req);

    const workspaces: UserWorkspaceSummary[] = user.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      type: m.workspace.type,
      role: m.role,
      siteCount: m.workspace._count?.sites || 0,
    }));

    const activeWorkspaceId = workspaces[0]?.id || "";

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platformRole: user.platformRole,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      sessionToken: rawToken,
      workspaces,
      activeWorkspaceId,
    };
  }

  /**
   * Retrieves sanitized profile of currently authenticated user
   */
  async getMe(userId: string): Promise<CurrentUserPayload> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                _count: {
                  select: { sites: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AuthError("Kullanıcı bulunamadı veya oturum geçersiz.", 401);
    }

    const workspaces: UserWorkspaceSummary[] = user.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      type: m.workspace.type,
      role: m.role,
      siteCount: m.workspace._count?.sites || 0,
    }));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platformRole: user.platformRole,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      workspaces,
      activeWorkspaceId: workspaces[0]?.id || "",
    };
  }

  /**
   * Revokes session on logout
   */
  async logout(sessionToken: string): Promise<void> {
    await sessionService.revokeSession(sessionToken);
  }
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = new AuthService();
export default authService;
