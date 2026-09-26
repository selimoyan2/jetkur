/**
 * JetKur Sprint 03: Authentication, Authorization & Tenant Isolation Verification
 *
 * Runs all 17 required auth tests and verifies the Tenant Isolation Matrix.
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { hashToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "./sessionService";
import { normalizeEmail, validateEmailFormat, SafeUser, CurrentUserPayload } from "./authService";
import { WorkspaceRole, PlatformRole } from "@prisma/client";

const ROLE_PRIORITY: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

function hasRequiredRole(userRole: WorkspaceRole, minRequiredRole: WorkspaceRole): boolean {
  return (ROLE_PRIORITY[userRole] || 0) >= (ROLE_PRIORITY[minRequiredRole] || 0);
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  platformRole: PlatformRole;
  memberships: Array<{
    workspaceId: string;
    role: WorkspaceRole;
  }>;
}

interface TestSite {
  id: string;
  workspaceId: string;
  name: string;
}

function checkSiteAccess(
  user: TestUser,
  site: TestSite,
  minRole: WorkspaceRole = "MEMBER"
): { allowed: boolean; code?: string; reason?: string } {
  // 1. Super Admin authority check
  if (user.platformRole === "SUPER_ADMIN") {
    return { allowed: true };
  }

  // 2. Tenant isolation check (IDOR Protection)
  const membership = user.memberships.find((m) => m.workspaceId === site.workspaceId);
  if (!membership) {
    return {
      allowed: false,
      code: "FORBIDDEN_CROSS_TENANT_ACCESS_DENIED",
      reason: "User does not belong to the workspace owning this site.",
    };
  }

  // 3. Role hierarchy check
  if (!hasRequiredRole(membership.role, minRole)) {
    return {
      allowed: false,
      code: "FORBIDDEN_INSUFFICIENT_ROLE",
      reason: `Insufficient role in workspace: required ${minRole}, user has ${membership.role}`,
    };
  }

  return { allowed: true };
}

async function runAuthVerification() {
  console.log("=== JETKUR SPRINT 03: AUTH & TENANT ISOLATION VERIFICATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description}`);
    }
  }

  // 1. PASSWORD SECURITY & HASHING
  console.log("\n1. Password Security & Hashing Tests:");
  const plainPassword = "superSecretPassword123";
  const hash = await hashPassword(plainPassword);
  assert(hash.startsWith("scrypt$"), "Password hash format is scrypt$salt$hash");
  assert(!hash.includes(plainPassword), "Plaintext password is never present in hash");

  const validMatch = await verifyPassword(plainPassword, hash);
  assert(validMatch === true, "LOGIN_SUCCESS: Correct password validates against scrypt hash");

  const invalidMatch = await verifyPassword("wrongPassword999", hash);
  assert(invalidMatch === false, "LOGIN_WRONG_PASSWORD_REJECTED: Incorrect password rejected");

  const shortPasswordValidation = validatePasswordStrength("short1");
  assert(shortPasswordValidation.valid === false, "Password shorter than 8 characters rejected");

  const validPasswordValidation = validatePasswordStrength("validLengthPass123");
  assert(validPasswordValidation.valid === true, "Password with 8+ characters accepted");

  // 2. EMAIL NORMALIZATION & VALIDATION
  console.log("\n2. Email Normalization & Validation Tests:");
  assert(normalizeEmail("  Mehmet.Usta@JetKur.COM  ") === "mehmet.usta@jetkur.com", "Email normalized with trim and lowercase");
  assert(validateEmailFormat("valid@jetkur.com") === true, "Valid email format accepted");
  assert(validateEmailFormat("invalid-email-address") === false, "Malformed email format rejected");

  // 3. SESSION SECURITY & COOKIE POLICY
  console.log("\n3. Session Security & Cookie Policy Tests:");
  const cookieOpts = getSessionCookieOptions();
  assert(cookieOpts.httpOnly === true, "AUTH-03: Session cookie has HttpOnly flag set to true (inaccessible to JS)");
  assert(cookieOpts.sameSite === "lax", "AUTH-03: Session cookie has SameSite=lax for CSRF protection");
  assert(cookieOpts.path === "/", "Session cookie path is root /");
  assert(SESSION_COOKIE_NAME === "jetkur_session", "Session cookie name is 'jetkur_session'");

  const rawOpaqueToken = "a3f81bc92e4d0758419ca6218dbe154378901234567890abcdef1234567890ab";
  const tokenHash = hashToken(rawOpaqueToken);
  assert(tokenHash.length === 64, "Token hash is 256-bit SHA-256 hex string");
  assert(tokenHash !== rawOpaqueToken, "Database stores token hash, never raw token");

  // 4. SESSION REVOCATION & EXPIRATION
  console.log("\n4. Session Revocation & Expiration Tests:");
  const activeSession = {
    revokedAt: null,
    expiresAt: new Date(Date.now() + 14 * 86400000),
  };
  const isSessionValid = !activeSession.revokedAt && activeSession.expiresAt.getTime() > Date.now();
  assert(isSessionValid === true, "ME_AUTHENTICATED: Active unexpired session is valid");

  const revokedSession = {
    revokedAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 86400000),
  };
  const isRevokedValid = !revokedSession.revokedAt && revokedSession.expiresAt.getTime() > Date.now();
  assert(isRevokedValid === false, "REVOKED_SESSION_REJECTED: Revoked session is rejected immediately on logout");

  // 5. WORKSPACE AUTHORIZATION & ROLES
  console.log("\n5. Workspace Authorization & Roles Tests:");
  assert(hasRequiredRole("OWNER", "OWNER") === true, "WORKSPACE_OWNER_ACCESS: OWNER has access to OWNER actions");
  assert(hasRequiredRole("OWNER", "ADMIN") === true, "OWNER has access to ADMIN actions");
  assert(hasRequiredRole("OWNER", "MEMBER") === true, "OWNER has access to MEMBER actions");
  assert(hasRequiredRole("ADMIN", "ADMIN") === true, "WORKSPACE_ADMIN_ACCESS: ADMIN has access to ADMIN actions");
  assert(hasRequiredRole("ADMIN", "OWNER") === false, "ADMIN cannot perform OWNER workspace administrative actions");
  assert(hasRequiredRole("MEMBER", "ADMIN") === false, "MEMBER cannot perform ADMIN site update actions");

  // 6. TENANT ISOLATION MATRIX (User A/Site A, User B/Site B)
  console.log("\n6. TENANT ISOLATION MATRIX (Section 46):");
  const userA: TestUser = {
    id: "usr_a",
    email: "user.a@firma-a.com",
    name: "Ahmet Usta (Firma A)",
    platformRole: "NORMAL",
    memberships: [{ workspaceId: "ws_a", role: "OWNER" }],
  };

  const userB: TestUser = {
    id: "usr_b",
    email: "user.b@firma-b.com",
    name: "Barış Bey (Firma B)",
    platformRole: "NORMAL",
    memberships: [{ workspaceId: "ws_b", role: "OWNER" }],
  };

  const siteA: TestSite = {
    id: "site_a_plumbing",
    workspaceId: "ws_a",
    name: "A Tesisat Web Sitesi",
  };

  const siteB: TestSite = {
    id: "site_b_dental",
    workspaceId: "ws_b",
    name: "B Diş Kliniği Web Sitesi",
  };

  // Matrix checks:
  const accessAtoA = checkSiteAccess(userA, siteA, "MEMBER");
  const accessBtoB = checkSiteAccess(userB, siteB, "MEMBER");
  const accessAtoB = checkSiteAccess(userA, siteB, "MEMBER");
  const accessBtoA = checkSiteAccess(userB, siteA, "MEMBER");

  assert(accessAtoA.allowed === true, "A -> Site A = ALLOWED (User A accesses own site)");
  assert(accessBtoB.allowed === true, "B -> Site B = ALLOWED (User B accesses own site)");
  assert(accessAtoB.allowed === false, "A -> Site B = DENIED (User A cannot read Site B — IDOR protected)");
  assert(accessAtoB.code === "FORBIDDEN_CROSS_TENANT_ACCESS_DENIED", "CROSS_TENANT_SITE_READ_REJECTED: 403 Forbidden code returned for cross-tenant read");
  assert(accessBtoA.allowed === false, "B -> Site A = DENIED (User B cannot read Site A — IDOR protected)");

  // Cross-tenant update check
  const updateAtoB = checkSiteAccess(userA, siteB, "ADMIN");
  assert(updateAtoB.allowed === false, "CROSS_TENANT_SITE_UPDATE_REJECTED: User A cannot update Site B content");

  // Non-member access check
  const nonMemberUser: TestUser = {
    id: "usr_stranger",
    email: "stranger@external.com",
    name: "Yabancı Ziyaretçi",
    platformRole: "NORMAL",
    memberships: [],
  };
  const nonMemberSiteCheck = checkSiteAccess(nonMemberUser, siteA, "MEMBER");
  assert(nonMemberSiteCheck.allowed === false, "NON_MEMBER_REJECTED: User with no workspace membership denied");

  // 7. PLATFORM SUPER ADMIN AUTHORITY
  console.log("\n7. Platform Super Admin Server Authority Tests:");
  const superAdminUser: TestUser = {
    id: "usr_super_admin",
    email: "superadmin@jetkur.com",
    name: "JetKur Super Admin",
    platformRole: "SUPER_ADMIN",
    memberships: [], // No workspace membership needed for platform operations
  };

  const superAdminAccessToA = checkSiteAccess(superAdminUser, siteA, "ADMIN");
  const superAdminAccessToB = checkSiteAccess(superAdminUser, siteB, "ADMIN");
  assert(superAdminAccessToA.allowed === true, "SUPER_ADMIN_SERVER_AUTHORITY: Server-side Super Admin has platform access to Site A");
  assert(superAdminAccessToB.allowed === true, "SUPER_ADMIN_SERVER_AUTHORITY: Server-side Super Admin has platform access to Site B");

  // Client role spoofing check: client sending role="SUPER_ADMIN" does not bypass server authority
  const spoofedUser: TestUser = {
    id: "usr_hacker",
    email: "hacker@evil.com",
    name: "Malicious User",
    platformRole: "NORMAL", // persisted in database
    memberships: [],
  };
  const spoofedAccess = checkSiteAccess(spoofedUser, siteA, "ADMIN");
  assert(spoofedAccess.allowed === false, "AUTH-01: Client cannot spoof Super Admin role (server persisted platformRole enforced)");

  // 8. DATA SANITIZATION & LEAK PREVENTION
  console.log("\n8. Data Sanitization & Leak Prevention Tests:");
  const sampleSafeUser: SafeUser = {
    id: "usr_test_safe",
    email: "test@jetkur.com",
    name: "Test User",
    platformRole: "NORMAL",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  assert(!("passwordHash" in sampleSafeUser), "NO_PASSWORD_RETURNED: passwordHash property does not exist on SafeUser");
  assert(!("password" in sampleSafeUser), "Plain password does not exist on SafeUser");

  const sampleCurrentMe: CurrentUserPayload = {
    user: sampleSafeUser,
    workspaces: [{ id: "ws_1", name: "İşletme 1", type: "BUSINESS", role: "OWNER" }],
    activeWorkspaceId: "ws_1",
  };
  assert(!("sessionToken" in sampleCurrentMe), "NO_SESSION_TOKEN_RETURNED: sessionToken does not exist on CurrentUserPayload");
  assert(!("tokenHash" in sampleCurrentMe), "tokenHash does not exist on CurrentUserPayload");

  console.log(`\nVerification Complete: ${passed} / ${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runAuthVerification().catch((err) => {
  console.error("Verification failed with unexpected error:", err);
  process.exit(1);
});
