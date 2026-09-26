import { Router, Request, Response } from "express";
import { authService, AuthError } from "./authService";
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "./sessionService";
import { requireAuth, AuthenticatedRequest } from "./middleware";
import { createRateLimiter } from "./rateLimiter";

export const authRouter = Router();

// Rate limiter for brute force protection (15 requests/minute)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: "Çok fazla giriş veya kayıt denemesi yapıldı. Lütfen 1 dakika sonra tekrar deneyiniz.",
});

/**
 * POST /api/auth/register
 * Registers user + creates Workspace + sets HttpOnly session cookie
 */
authRouter.post("/register", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, companyName, workspaceType } = req.body;

    const result = await authService.register(
      { email, password, name, companyName, workspaceType },
      req
    );

    // Set secure HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, getSessionCookieOptions());

    res.status(201).json({
      user: result.user,
      workspaces: result.workspaces,
      activeWorkspaceId: result.activeWorkspaceId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message, code: "AUTH_ERROR" });
      return;
    }
    console.error("[Auth] Registration error:", error);
    res.status(500).json({ error: "Kayıt işlemi sırasında bir hata oluştu.", code: "INTERNAL_ERROR" });
  }
});

/**
 * POST /api/auth/login
 * Verifies credentials, normalizes email, sets HttpOnly session cookie
 */
authRouter.post("/login", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password }, req);

    // Set secure HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, getSessionCookieOptions());

    res.status(200).json({
      user: result.user,
      workspaces: result.workspaces,
      activeWorkspaceId: result.activeWorkspaceId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message, code: "AUTH_ERROR" });
      return;
    }
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Giriş işlemi sırasında bir hata oluştu.", code: "INTERNAL_ERROR" });
  }
});

/**
 * POST /api/auth/logout
 * Revokes session from server-authoritative database and clears cookie
 */
authRouter.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
    const bearerHeader = req.headers.authorization;
    const rawToken = cookieToken || (bearerHeader?.startsWith("Bearer ") ? bearerHeader.substring(7) : "");

    if (rawToken) {
      await authService.logout(rawToken);
    }

    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.status(200).json({ success: true, message: "Oturum başarıyla kapatıldı." });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.status(200).json({ success: true });
  }
});

/**
 * GET /api/auth/me
 * Server-authoritative session verification returning sanitized user info
 */
authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Oturum açmanız gerekmektedir.", code: "UNAUTHENTICATED" });
      return;
    }

    const payload = await authService.getMe(req.user.id);
    res.status(200).json(payload);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message, code: "AUTH_ERROR" });
      return;
    }
    console.error("[Auth] GetMe error:", error);
    res.status(500).json({ error: "Kullanıcı bilgileri alınamadı.", code: "INTERNAL_ERROR" });
  }
});

export default authRouter;
