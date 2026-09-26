import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, AuthRegisterPayload } from "../types";
import { 
  getActiveSession, 
  loginWithEmailAndPassword, 
  registerNewUser, 
  logoutCurrentUser 
} from "../utils/authStorage";

export interface ServerWorkspace {
  id: string;
  name: string;
  type: "BUSINESS" | "AGENCY" | "PLATFORM";
  role: "OWNER" | "ADMIN" | "MEMBER";
  siteCount?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  workspaces: ServerWorkspace[];
  activeWorkspaceId: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  isClient: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  register: (payload: AuthRegisterPayload) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalInitialTab: "client" | "admin" | "register" | "login";
  openAuthModal: (tab?: "client" | "admin" | "register" | "login", redirectView?: string) => void;
  closeAuthModal: () => void;
  redirectAfterLoginView: string | null;
  setRedirectAfterLoginView: (view: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<ServerWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<"client" | "admin" | "register" | "login">("login");
  const [redirectAfterLoginView, setRedirectAfterLoginView] = useState<string | null>(null);

  // 1. Initial Load: Check Server-Authoritative Session via GET /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function checkServerSession() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: { "Accept": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            const mappedUser: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.platformRole === "SUPER_ADMIN" ? "admin" : "client",
              createdAt: data.user.createdAt,
              lastLoginAt: data.user.lastLoginAt || new Date().toISOString(),
              status: "active",
            };
            setUser(mappedUser);
            setWorkspaces(data.workspaces || []);
            setActiveWorkspaceId(data.activeWorkspaceId || null);
            setIsLoadingSession(false);
            return;
          }
        }
      } catch {
        // network or server offline, fall back to prototype local session
      }

      // Fallback for prototype dev sessions
      if (isMounted) {
        const localSession = getActiveSession();
        if (localSession?.user) {
          setUser(localSession.user);
        } else {
          setUser(null);
        }
        setIsLoadingSession(false);
      }
    }

    checkServerSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync across tabs & custom events
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: AuthUser | null }>;
      setUser(customEvent.detail?.user || null);
    };

    window.addEventListener("jetkur_auth_change", handleAuthChange);
    return () => window.removeEventListener("jetkur_auth_change", handleAuthChange);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      // Primary: Server-Authoritative Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const mappedUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.platformRole === "SUPER_ADMIN" ? "admin" : "client",
          createdAt: data.user.createdAt,
          lastLoginAt: data.user.lastLoginAt || new Date().toISOString(),
          status: "active",
        };
        setUser(mappedUser);
        setWorkspaces(data.workspaces || []);
        setActiveWorkspaceId(data.activeWorkspaceId || null);
        setIsAuthModalOpen(false);
        return { success: true, user: mappedUser };
      }

      const errData = await res.json().catch(() => null);
      const serverErrMsg = errData?.error;

      // Fallback to local auth if server returned 401 or in local test environment
      const localRes = await loginWithEmailAndPassword(email, pass);
      if (localRes.success && localRes.user) {
        setUser(localRes.user);
        setIsAuthModalOpen(false);
        return localRes;
      }

      return { success: false, error: serverErrMsg || localRes.error || "Giriş başarısız." };
    } catch {
      // Offline fallback
      const localRes = await loginWithEmailAndPassword(email, pass);
      if (localRes.success && localRes.user) {
        setUser(localRes.user);
        setIsAuthModalOpen(false);
      }
      return localRes;
    }
  };

  const register = async (payload: AuthRegisterPayload) => {
    try {
      // Primary: Server-Authoritative Registration
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          name: payload.name,
          companyName: payload.companyName,
        }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const mappedUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.platformRole === "SUPER_ADMIN" ? "admin" : "client",
          createdAt: data.user.createdAt,
          lastLoginAt: data.user.lastLoginAt || new Date().toISOString(),
          status: "active",
        };
        setUser(mappedUser);
        setWorkspaces(data.workspaces || []);
        setActiveWorkspaceId(data.activeWorkspaceId || null);
        setIsAuthModalOpen(false);
        return { success: true, user: mappedUser };
      }

      const errData = await res.json().catch(() => null);
      const serverErrMsg = errData?.error;

      // Fallback
      const localRes = await registerNewUser(payload);
      if (localRes.success && localRes.user) {
        setUser(localRes.user);
        setIsAuthModalOpen(false);
        return localRes;
      }

      return { success: false, error: serverErrMsg || localRes.error || "Kayıt başarısız." };
    } catch {
      const localRes = await registerNewUser(payload);
      if (localRes.success && localRes.user) {
        setUser(localRes.user);
        setIsAuthModalOpen(false);
      }
      return localRes;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    }

    logoutCurrentUser();
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
  };

  const openAuthModal = (tab: "client" | "admin" | "register" | "login" = "login", redirectView?: string) => {
    setAuthModalInitialTab(tab);
    if (redirectView) {
      setRedirectAfterLoginView(redirectView);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = user?.role === "admin";
  const isTeamMember = user?.role === "team_member" || user?.role === "admin";
  const isClient = user?.role === "client";
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspaceId,
        isAuthenticated,
        isLoadingSession,
        isAdmin,
        isTeamMember,
        isClient,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        redirectAfterLoginView,
        setRedirectAfterLoginView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
