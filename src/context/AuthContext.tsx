import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, AuthRegisterPayload, UserRole } from "../types";
import { 
  getActiveSession, 
  loginWithEmailAndPassword, 
  registerNewUser, 
  logoutCurrentUser 
} from "../utils/authStorage";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  isClient: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  register: (payload: AuthRegisterPayload) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalInitialTab: "client" | "admin" | "register";
  openAuthModal: (tab?: "client" | "admin" | "register", redirectView?: string) => void;
  closeAuthModal: () => void;
  redirectAfterLoginView: string | null;
  setRedirectAfterLoginView: (view: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = getActiveSession();
    return session?.user || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<"client" | "admin" | "register">("client");
  const [redirectAfterLoginView, setRedirectAfterLoginView] = useState<string | null>(null);

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
    const res = await loginWithEmailAndPassword(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const register = async (payload: AuthRegisterPayload) => {
    const res = await registerNewUser(payload);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const logout = () => {
    logoutCurrentUser();
    setUser(null);
  };

  const openAuthModal = (tab: "client" | "admin" | "register" = "client", redirectView?: string) => {
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
        isAuthenticated,
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
        setRedirectAfterLoginView
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
