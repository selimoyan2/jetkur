import { AuthUser, AuthSession, AuthRegisterPayload, UserRole } from "../types";

const AUTH_USERS_KEY = "jetkur_registered_users";
const AUTH_SESSION_KEY = "jetkur_auth_session";
const AUTH_PASSWORDS_KEY = "jetkur_user_passwords";

// Default initial accounts for jetkur.com.tr
const DEFAULT_SEED_USERS: AuthUser[] = [
  {
    id: "user-admin-1",
    name: "JetKur Sistem Yöneticisi",
    email: "admin@jetkur.com.tr",
    role: "admin",
    phone: "0532 100 00 01",
    companyName: "JetKur Lojistik & Teknoloji A.Ş.",
    createdAt: "2026-01-01",
    lastLoginAt: new Date().toISOString(),
    status: "active",
    assignedOrdersCount: 28
  },
  {
    id: "user-admin-selim",
    name: "Selim Oyan (Süper Yönetici)",
    email: "selimoyan@gmail.com",
    role: "admin",
    phone: "0532 100 00 00",
    companyName: "JetKur Teknoloji",
    createdAt: "2026-01-01",
    lastLoginAt: new Date().toISOString(),
    status: "active",
    assignedOrdersCount: 10
  },
  {
    id: "user-team-1",
    name: "Operasyon & Destek Ekibi",
    email: "ekip@jetkur.com.tr",
    role: "team_member",
    phone: "0532 100 00 02",
    companyName: "JetKur Saha & Operasyon",
    createdAt: "2026-01-15",
    lastLoginAt: new Date().toISOString(),
    status: "active",
    assignedOrdersCount: 14
  },
  {
    id: "user-client-1",
    name: "Ahmet Yılmaz (Örnek Müşteri)",
    email: "musteri@jetkur.com.tr",
    role: "client",
    phone: "0542 999 88 77",
    companyName: "Atlas Dış Ticaret Ltd.",
    createdAt: "2026-02-01",
    lastLoginAt: new Date().toISOString(),
    status: "active",
    assignedOrdersCount: 4,
    isTrial: true,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    planName: "14 Günlük Ücretsiz Deneme",
    createdSitesCount: 1,
    maxAllowedSites: 1,
    trialExpired: false
  }
];

export const SUPER_ADMIN_CREDENTIALS = {
  email: "admin@jetkur.com.tr",
  ownerEmail: "selimoyan@gmail.com",
  password: "JetKur2026!Admin"
};

const DEFAULT_PASSWORDS: Record<string, string> = {
  "admin@jetkur.com.tr": "JetKur2026!Admin",
  "selimoyan@gmail.com": "JetKur2026!Admin",
  "ekip@jetkur.com.tr": "ekip2026",
  "musteri@jetkur.com.tr": "musteri2026"
};

// Internal helper to get users
export function getRegisteredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (raw) {
      let parsed: AuthUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure superadmins exist
        const hasAdmin = parsed.some(u => u.email.toLowerCase() === "admin@jetkur.com.tr");
        const hasSelim = parsed.some(u => u.email.toLowerCase() === "selimoyan@gmail.com");
        if (!hasAdmin || !hasSelim) {
          if (!hasAdmin) parsed.unshift(DEFAULT_SEED_USERS[0]);
          if (!hasSelim) parsed.unshift(DEFAULT_SEED_USERS[1]);
          localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading registered users from localStorage:", err);
  }
  // Initialize defaults
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_SEED_USERS));
    localStorage.setItem(AUTH_PASSWORDS_KEY, JSON.stringify(DEFAULT_PASSWORDS));
  } catch {
    // ignore
  }
  return DEFAULT_SEED_USERS;
}

// Internal helper to get passwords
function getStoredPasswords(): Record<string, string> {
  let passwords: Record<string, string> = { ...DEFAULT_PASSWORDS };
  try {
    const raw = localStorage.getItem(AUTH_PASSWORDS_KEY);
    if (raw) {
      passwords = { ...DEFAULT_PASSWORDS, ...JSON.parse(raw) };
    }
    // Always force updated production admin passwords
    passwords["admin@jetkur.com.tr"] = "JetKur2026!Admin";
    passwords["selimoyan@gmail.com"] = "JetKur2026!Admin";
    localStorage.setItem(AUTH_PASSWORDS_KEY, JSON.stringify(passwords));
  } catch {
    // ignore
  }
  return passwords;
}

// Get active session
export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      // Validate expiration
      if (new Date(session.expiresAt).getTime() > Date.now()) {
        return session;
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    }
  } catch (err) {
    console.warn("Error reading active session:", err);
  }
  return null;
}

// Dispatch event for UI reactivity
function notifyAuthChange(user: AuthUser | null) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("jetkur_auth_change", { detail: { user } })
    );
  }
}

// Login
export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: "Lütfen e-posta adresinizi ve şifrenizi girin." };
  }

  const users = getRegisteredUsers();
  const passwords = getStoredPasswords();

  const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!matchedUser) {
    return {
      success: false,
      error: "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı. Lütfen kontrol edin veya yeni üyelik oluşturun."
    };
  }

  if (matchedUser.status === "suspended") {
    return {
      success: false,
      error: "Bu hesap geçici olarak askıya alınmıştır. Lütfen sistem yöneticisi ile iletişime geçin."
    };
  }

  const registeredPass = passwords[cleanEmail] || "jetkur2026";
  if (cleanPassword !== registeredPass) {
    return {
      success: false,
      error: "Hatalı şifre girdiniz. Şifrenizi unuttuysanız 'Şifremi Unuttum' bağlantısını kullanabilirsiniz."
    };
  }

  // Update last login
  const updatedUser: AuthUser = {
    ...matchedUser,
    lastLoginAt: new Date().toISOString()
  };

  const updatedUsers = users.map((u) => (u.id === matchedUser.id ? updatedUser : u));
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(updatedUsers));
  } catch {
    // ignore
  }

  // Set active session (7 days validity)
  const session: AuthSession = {
    user: updatedUser,
    token: `jk_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  notifyAuthChange(updatedUser);
  return { success: true, user: updatedUser };
}

// Register
export async function registerNewUser(
  payload: AuthRegisterPayload
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanName = payload.name.trim();
  const cleanPassword = payload.password.trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    return { success: false, error: "Ad Soyad, E-posta ve Şifre alanları zorunludur." };
  }

  if (cleanPassword.length < 6) {
    return { success: false, error: "Şifreniz en az 6 karakter uzunluğunda olmalıdır." };
  }

  const users = getRegisteredUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      error: "Bu e-posta adresi zaten kullanımda. Lütfen giriş yapın veya farklı bir e-posta kullanın."
    };
  }

  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: payload.role || "client",
    phone: payload.phone?.trim() || "",
    companyName: payload.companyName?.trim() || "",
    createdAt: new Date().toISOString().slice(0, 10),
    lastLoginAt: new Date().toISOString(),
    status: "active",
    assignedOrdersCount: 0,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isTrial: true,
    trialExpired: false,
    planName: "14 Günlük Ücretsiz Deneme",
    createdSitesCount: 1,
    maxAllowedSites: 1
  };

  const updatedUsers = [newUser, ...users];
  const passwords = getStoredPasswords();
  passwords[cleanEmail] = cleanPassword;

  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(AUTH_PASSWORDS_KEY, JSON.stringify(passwords));
  } catch {
    // ignore
  }

  // Auto-login session
  const session: AuthSession = {
    user: newUser,
    token: `jk_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  notifyAuthChange(newUser);
  return { success: true, user: newUser };
}

// Logout
export function logoutCurrentUser(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // ignore
  }
  notifyAuthChange(null);
}

// Reset Password Simulation
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string; tempPass?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      message: "Bu e-posta adresine ait kayıtlı bir hesap bulunamadı."
    };
  }

  const tempPassword = `JetKur${Math.floor(1000 + Math.random() * 9000)}!`;
  const passwords = getStoredPasswords();
  passwords[cleanEmail] = tempPassword;

  try {
    localStorage.setItem(AUTH_PASSWORDS_KEY, JSON.stringify(passwords));
  } catch {
    // ignore
  }

  return {
    success: true,
    message: `${cleanEmail} adresine şifre sıfırlama bağlantısı ve geçici şifreniz gönderildi.`,
    tempPass: tempPassword
  };
}

export interface TrialStatusInfo {
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  maxAllowedSites: number;
  createdSitesCount: number;
  canCreateMoreSites: boolean;
  trialEndsAt: string;
}

export function checkTrialStatus(user: AuthUser | null): TrialStatusInfo {
  if (!user) {
    return {
      isTrial: false,
      isExpired: false,
      daysRemaining: 14,
      maxAllowedSites: 1,
      createdSitesCount: 1,
      canCreateMoreSites: false,
      trialEndsAt: ""
    };
  }

  // Superadmins or non-trial paid plans
  if (user.role === "admin" || user.role === "team_member" || user.isTrial === false) {
    return {
      isTrial: false,
      isExpired: false,
      daysRemaining: 365,
      maxAllowedSites: 999,
      createdSitesCount: user.createdSitesCount || 1,
      canCreateMoreSites: true,
      trialEndsAt: user.trialEndsAt || "2099-12-31"
    };
  }

  const trialEnds = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : Date.now() + 14 * 86400000;
  const now = Date.now();
  const diffMs = trialEnds - now;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  
  // Either date has passed or explicitly marked expired
  const isExpired = user.trialExpired === true || daysRemaining <= 0;
  const maxAllowed = user.maxAllowedSites ?? 1;
  const created = user.createdSitesCount ?? 1;

  return {
    isTrial: true,
    isExpired,
    daysRemaining,
    maxAllowedSites: maxAllowed,
    createdSitesCount: created,
    canCreateMoreSites: !isExpired && created < maxAllowed,
    trialEndsAt: user.trialEndsAt || new Date(trialEnds).toISOString().slice(0, 10)
  };
}

export function toggleTrialExpiredSimulation(userId?: string, simulateExpired?: boolean): AuthUser | null {
  const session = getActiveSession();
  const targetId = userId || session?.user?.id;
  if (!targetId) return null;

  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.id === targetId);
  if (idx === -1) return null;

  const user = users[idx];
  const nextExpired = simulateExpired !== undefined ? simulateExpired : !Boolean(user.trialExpired);
  user.trialExpired = nextExpired;
  if (nextExpired) {
    user.trialEndsAt = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    user.trialEndsAt = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  }

  users[idx] = user;
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    if (session && session.user.id === targetId) {
      session.user = user;
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      notifyAuthChange(user);
    }
  } catch (err) {
    console.warn("Error toggling trial state:", err);
  }
  return user;
}
