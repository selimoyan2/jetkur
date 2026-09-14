import React, { useState, useRef, useEffect } from "react";
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Truck, 
  ChevronDown, 
  ExternalLink, 
  Key, 
  Building2, 
  Mail,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PlatformView } from "../../types";

interface UserProfileMenuProps {
  onNavigateView: (view: PlatformView) => void;
  onOpenClientPortalTab?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onNavigateView,
  onOpenClientPortalTab
}) => {
  const { user, isAuthenticated, isAdmin, isClient, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => openAuthModal("client")}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-amber-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs group"
          title="Kullanıcı ve Yönetici Girişi"
        >
          <User className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Giriş</span>
        </button>
      </div>
    );
  }

  // Generate initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const roleBadge = {
    admin: { label: "Yönetici", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    team_member: { label: "Operasyon", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    client: { label: "Müşteri", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" }
  }[user.role];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white transition-all cursor-pointer group"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
          isAdmin 
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
            : "bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950"
        }`}>
          {initials}
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold leading-none truncate max-w-[120px]">
            {user.name.split(" ")[0]}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
            {roleBadge.label}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95 duration-100">
          {/* User Meta Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 mb-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-white truncate">{user.name}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.companyName && (
              <div className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{user.companyName}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 text-xs">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateView("admin-panel");
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer font-bold"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>👑 Süper Admin Paneli</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateView("customer-panel");
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Site Düzenleme (CMS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateView("customer-panel");
                    if (onOpenClientPortalTab) onOpenClientPortalTab();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Müşteri Portali Görünümü</span>
                </button>
              </>
            )}

            {isClient && (
              <button
                type="button"
                onClick={() => {
                  onNavigateView("customer-panel");
                  if (onOpenClientPortalTab) onOpenClientPortalTab();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Sipariş &amp; Belge Portali</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onNavigateView("preview");
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Web Sitesini Önizle</span>
            </button>
          </div>

          <div className="my-1 border-t border-slate-800" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
};
