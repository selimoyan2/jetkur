import React, { useState, useEffect } from "react";
import { PlatformView } from "../types";
import { 
  Zap, 
  Wand2, 
  LayoutDashboard, 
  ShieldCheck, 
  Eye, 
  Rocket, 
  BookOpen, 
  Globe, 
  Menu, 
  X, 
  ChevronRight,
  Server,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfileMenu } from "./auth/UserProfileMenu";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  currentView: PlatformView | string;
  onViewChange: (view: PlatformView) => void;
  onQuickDeploy: () => void;
  companyName: string;
  onOpenCoolifyGuide?: () => void;
  onOpenClientPortalTab?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onQuickDeploy,
  companyName,
  onOpenCoolifyGuide,
  onOpenClientPortalTab,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, isClient, user, openAuthModal } = useAuth();

  // Close mobile drawer on view switch
  const handleNavClick = (view: PlatformView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  // Scroll to public homepage section
  const handlePublicScroll = (sectionId: string) => {
    if (currentView !== "marketing") {
      onViewChange("marketing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Lock body scroll when mobile drawer is open & handle Escape key
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  // Auto-close on resize to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Public visitor navigation links (features, speed, packages)
  const publicNavLinks = [
    { id: "speed-benchmark", label: "0.02s Hız Mimarisi", icon: Zap },
    { id: "timeline", label: "10 Dk Kurulum", icon: Clock },
    { id: "pricing", label: "Paketler & Fiyat", icon: Sparkles },
    { id: "templates", label: "Hazır Şablonlar", icon: LayoutDashboard },
  ];

  // Authenticated Member Navigation Links
  const authenticatedNavLinks: { 
    view: PlatformView; 
    label: string; 
    mobileLabel: string; 
    subLabel: string; 
    badge?: string;
    icon: React.FC<{ className?: string }> 
  }[] = isAdmin
    ? [
        { 
          view: "marketing", 
          label: "Ana Sayfa", 
          mobileLabel: "Ana Sayfa (Platform)", 
          subLabel: "Platform tanıtımı ve vitrin", 
          icon: Globe 
        },
        { 
          view: "admin-panel", 
          label: "👑 Süper Admin", 
          mobileLabel: "Süper Admin Paneli", 
          subLabel: "Müşteriler, lisanslar, paketler ve ana sayfa", 
          badge: "Süper Admin",
          icon: ShieldCheck 
        },
        { 
          view: "customer-panel", 
          label: "Müşteri Paneli", 
          mobileLabel: "Müşteri Paneli (CMS)", 
          subLabel: "İçerik, SEO ve işletme yönetimi", 
          icon: LayoutDashboard 
        },
        { 
          view: "preview", 
          label: "Canlı Önizleme", 
          mobileLabel: "Canlı Önizleme", 
          subLabel: "Mobil ve masaüstü interaktif test", 
          badge: "Canlı",
          icon: Eye 
        },
        { 
          view: "strategy", 
          label: "Stratejik Analiz", 
          mobileLabel: "Stratejik Analiz", 
          subLabel: "Pazar ve SEO analiz raporu", 
          icon: BookOpen 
        },
      ]
    : [
        { 
          view: "marketing", 
          label: "Ana Sayfa", 
          mobileLabel: "Ana Sayfa", 
          subLabel: "Platform vitrini", 
          icon: Globe 
        },
        { 
          view: "customer-panel", 
          label: "Müşteri Yönetim Paneli", 
          mobileLabel: "Yönetim Masası (CMS)", 
          subLabel: "Web sitenizi düzenleyin ve yönetin", 
          badge: user?.isTrial ? "14 Gün Deneme" : "Aktif",
          icon: LayoutDashboard 
        },
        { 
          view: "wizard", 
          label: "Sitemi Düzenle", 
          mobileLabel: "Akıllı Sihirbaz", 
          subLabel: "Yapay zeka ile sitenizi güncelleyin", 
          icon: Wand2 
        },
        { 
          view: "preview", 
          label: "Canlı Önizleme", 
          mobileLabel: "Canlı Önizleme", 
          subLabel: "Web sitenizi canlı test edin", 
          icon: Eye 
        },
      ];

  return (
    <>
      <header id="app-platform-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo & Brand Identity */}
            <div 
              id="header-brand-logo-btn"
              onClick={() => handleNavClick("marketing")}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
              role="button"
              tabIndex={0}
              aria-label="JetKur Ana Sayfasına Git"
              onKeyDown={(e) => { if (e.key === "Enter") handleNavClick("marketing"); }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-5 h-5 fill-current text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white">JetKur</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate max-w-[200px] md:max-w-none">
                  Dünyanın En Hızlı Web Sitesi Altyapısı
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isAuthenticated ? (
              /* Public Visitor Navigation Links */
              <nav id="header-public-desktop-nav" aria-label="Genel Gezinme Menüsü" className="hidden lg:flex items-center gap-1 xl:gap-2">
                {publicNavLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePublicScroll(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            ) : (
              /* Authenticated Member Navigation Links */
              <nav id="header-desktop-nav" aria-label="Üye Gezinme Menüsü" className="hidden lg:flex items-center gap-1.5 xl:gap-2">
                {authenticatedNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      id={`header-desktop-nav-${item.view}`}
                      onClick={() => handleNavClick(item.view)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? item.view === "admin-panel"
                            ? "bg-indigo-600 text-white shadow-md font-black"
                            : item.view === "customer-panel"
                            ? "bg-amber-500 text-slate-950 shadow-md font-black"
                            : "bg-slate-800 text-amber-400 border border-slate-700 shadow-xs"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          isActive ? "bg-slate-950/40 text-current" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Right Action Cluster & Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* If Authenticated as Admin: Coolify & Server tools */}
              {isAuthenticated && isAdmin && onOpenCoolifyGuide && (
                <button
                  type="button"
                  onClick={onOpenCoolifyGuide}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Hostinger VPS + Coolify Canlı Dağıtım Rehberi"
                >
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>VPS &amp; Coolify</span>
                </button>
              )}

              {/* User Authentication & Profile Menu ("Giriş" button or logged in dropdown) */}
              <UserProfileMenu 
                onNavigateView={onViewChange} 
                onOpenClientPortalTab={onOpenClientPortalTab}
              />

              {/* If Visitor: Prominent 14-Day Free Trial CTA Button */}
              {!isAuthenticated ? (
                <button
                  id="header-start-trial-cta-btn"
                  onClick={() => openAuthModal("register")}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shrink-0"
                  title="14 Günlük Ücretsiz Deneme Başlatın (Kredi Kartsız)"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
                  <span className="hidden sm:inline">14 Gün Ücretsiz Başlat</span>
                  <span className="sm:hidden">14 Gün Dene</span>
                </button>
              ) : (
                /* If Logged In: Quick Publish Action Button */
                <button
                  id="header-quick-deploy-btn"
                  onClick={onQuickDeploy}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Statik Sayfaları Yayınla & Dağıt"
                >
                  <Rocket className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
                  <span className="hidden sm:inline">Yayınla &amp; Kod Al</span>
                  <span className="sm:hidden">Yayınla</span>
                </button>
              )}

              {/* Mobile Menu Hamburger Toggle Button */}
              <button
                id="header-mobile-hamburger-btn"
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? "Mobil Menüyü Kapat" : "Mobil Menüyü Aç"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="header-mobile-slideout-drawer"
                className={`lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isMobileMenuOpen
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-slate-800/90 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-out Mobile Drawer & Backdrop with AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Mobil Gezinme Menüsü">
            
            {/* Backdrop Overlay */}
            <motion.div
              id="header-mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              id="header-mobile-slideout-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative z-10 w-[88vw] max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden text-white"
            >
              {/* Drawer Top Header */}
              <div className="px-5 py-4 border-b border-slate-800/90 bg-slate-950/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                    <Zap className="w-4 h-4 fill-current text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-white text-base tracking-tight leading-tight">JetKur</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {isAuthenticated && user ? `Kullanıcı: ${user.name}` : "Dünyanın En Hızlı Web Sitesi"}
                    </div>
                  </div>
                </div>

                {/* Drawer Close Button */}
                <button
                  id="header-mobile-drawer-close-btn"
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Menüyü Kapat"
                  className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Navigation Links */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 overscroll-contain">
                {!isAuthenticated ? (
                  /* Public Visitor Mobile Links */
                  <div className="space-y-3">
                    <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Keşfedin</span>
                      <span className="text-[10px] text-amber-400 font-mono">0.02s Hız</span>
                    </div>

                    {publicNavLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePublicScroll(item.id)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl text-left bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer min-h-[48px]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-200">{item.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      );
                    })}

                    {/* Value Callout Card inside Mobile Menu */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-4">
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>14 Gün Boyunca Ücretsiz Deneyin</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Kredi kartı gerekmez. E-posta ve şifrenizle 10 saniyede kayıt olarak web sitenizi hemen oluşturun.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Authenticated Member Mobile Links */
                  <div className="space-y-2">
                    <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{isAdmin ? "Yönetici Menüsü" : "Müşteri Menüsü"}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-normal">
                        {user?.isTrial ? "14 Gün Deneme" : "Aktif"}
                      </span>
                    </div>

                    {authenticatedNavLinks.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.view;
                      return (
                        <button
                          key={item.view}
                          id={`header-mobile-nav-${item.view}`}
                          type="button"
                          onClick={() => handleNavClick(item.view)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer min-h-[52px] ${
                            isActive
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
                              : "text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isActive 
                                ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20" 
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold leading-tight">{item.mobileLabel}</span>
                                {item.badge && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold uppercase ${
                                    isActive 
                                      ? "bg-amber-500/30 text-amber-300" 
                                      : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal leading-tight mt-1 line-clamp-1">
                                {item.subLabel}
                              </div>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive ? "text-amber-400 translate-x-0.5" : "text-slate-600"
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal("register");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                      <span>14 Günlük Ücretsiz Denemeyi Başlat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal("client");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full min-h-[40px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                    >
                      <span>Mevcut Hesabınızla Giriş Yapın</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {isAdmin && onOpenCoolifyGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenCoolifyGuide();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full min-h-[40px] py-2.5 px-4 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Server className="w-4 h-4 text-indigo-400" />
                        <span>Hostinger VPS + Coolify Rehberi</span>
                      </button>
                    )}

                    <button
                      id="header-mobile-drawer-deploy-btn"
                      type="button"
                      onClick={() => {
                        onQuickDeploy();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Rocket className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                      <span>Statik Web Sitesini Yayınla & İndir</span>
                    </button>
                  </>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Global Anycast CDN</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">0.02s Yanıt Hızı</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

