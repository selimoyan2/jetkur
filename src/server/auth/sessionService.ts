import crypto from "crypto";
import { CookieOptions, Request } from "express";
import { prisma } from "../db/client";

export const SESSION_COOKIE_NAME = "jetkur_session";
export const SESSION_DURATION_DAYS = 14;
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function getSessionCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface SessionWithUser {
  session: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
    revokedAt: Date | null;
  };
  user: {
    id: string;
    email: string;
    name: string;
    platformRole: "NORMAL" | "SUPER_ADMIN";
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
    memberships: Array<{
      id: string;
      workspaceId: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
      workspace: {
        id: string;
        name: string;
        type: "BUSINESS" | "AGENCY" | "PLATFORM";
      };
    }>;
  };
}

export class SessionService {
  /**
   * Generates a 256-bit cryptographically secure random opaque token
   */
  generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Creates a new session persisted in PostgreSQL
   */
  async createSession(
    userId: string,
    req?: Request
  ): Promise<{ rawToken: string; expiresAt: Date; sessionId: string }> {
    const rawToken = this.generateOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const userAgent = req?.headers["user-agent"]?.toString() || null;
    const ipAddress = req?.ip || req?.socket.remoteAddress || null;

    const session = await prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      rawToken,
      expiresAt,
      sessionId: session.id,
    };
  }

  /**
   * Validates an opaque session token, verifying:
   * 1. Token exists and matches sha256 hash
   * 2. Session has not been revoked (revokedAt is null)
   * 3. Session has not expired (expiresAt > now)
   * 4. User is ACTIVE
   * Updates lastUsedAt timestamp.
   */
  async validateSession(rawToken: string): Promise<SessionWithUser | null> {
    if (!rawToken || typeof rawToken !== "string" || rawToken.length < 32) {
      return null;
    }

    const tokenHash = hashToken(rawToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });

    if (!session) return null;

    // Check revocation
    if (session.revokedAt) return null;

    // Check expiration
    if (session.expiresAt.getTime() < Date.now()) return null;

    // Check user active status
    if (session.user.status !== "ACTIVE") return null;

    // Touch lastUsedAt asynchronously
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {
        // non-blocking
      });

    return {
      session: {
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        revokedAt: session.revokedAt,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        platformRole: session.user.platformRole,
        status: session.user.status,
        memberships: session.user.memberships.map((m) => ({
          id: m.id,
          workspaceId: m.workspaceId,
          role: m.role,
          workspace: {
            id: m.workspace.id,
            name: m.workspace.name,
            type: m.workspace.type,
          },
        })),
      },
    };
  }

  /**
   * Revokes a session (logs out current device)
   */
  async revokeSession(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);

    await prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes all active sessions for a user (e.g. security breach, password change)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const sessionService = new SessionService();
export default sessionService;
