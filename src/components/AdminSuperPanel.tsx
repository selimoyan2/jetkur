import React, { useState, useEffect } from "react";
import { AdminPanelTab, SiteConfig } from "../types";
import { TEMPLATES } from "../data/templates";
import { 
  BarChart3, 
  Layers, 
  Globe, 
  Users, 
  Settings, 
  Sparkles, 
  CreditCard, 
  Calendar,
  Clock,
  Plus, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  Search,
  Filter,
  Save,
  Trash2,
  Edit3,
  MessageCircle,
  DollarSign,
  Home,
  Check,
  X,
  ArrowUpRight,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  UserCheck
} from "lucide-react";
import { 
  getJetkurHomepageSettings, 
  saveJetkurHomepageSettings, 
  JetkurHomepageSettings,
  getJetkurPackages,
  saveJetkurPackages,
  JetkurPricingPackage,
  getJetkurClientSites,
  saveJetkurClientSites,
  JetkurClientSite,
  calculateDaysRemaining
} from "../utils/platformSettingsStorage";
import { getRegisteredUsers } from "../utils/authStorage";
import { SeoContentReviserTool } from "./dashboard/SeoContentReviserTool";

export interface CustomerAccountDetailsViewModel {
  userId: string;
  customerName: string;
  registrationEmail: string;
  phone: string | null;
  platformRole: "NORMAL" | "SUPER_ADMIN";
  accountStatus: "ACTIVE" | "INVITED" | "SUSPENDED";
  accountCreatedAt: string;
  lastLoginAt: string | null;
  subscriptionStatus: string;
  paymentStatus: "paid" | "pending" | "overdue";
  planName: string;
  planCode: string;
  trialEndsAt: string | null;
  renewalDate: string;
  daysRemaining: number;
  isTrial: boolean;
  isExpired: boolean;
  siteLimit: number;
  workspaces: Array<{
    id: string;
    name: string;
    type: "BUSINESS" | "AGENCY" | "PLATFORM";
    memberRole: "OWNER" | "ADMIN" | "MEMBER";
    siteLimit: number;
    activeSitesCount: number;
  }>;
  sites: Array<{
    id: string;
    companyName: string;
    domain: string;
    subdomain: string;
    sector: string;
    siteType: string;
    status: string;
    pageSpeedScore?: number;
  }>;
}

interface AdminSuperPanelProps {
  currentConfig: SiteConfig;
  onImpersonateSite: (config: SiteConfig) => void;
  onOpenAiFactory: () => void;
  onOpenMarketing?: () => void;
  initialTab?: AdminPanelTab;
}

export const AdminSuperPanel: React.FC<AdminSuperPanelProps> = ({
  currentConfig,
  onImpersonateSite,
  onOpenAiFactory,
  onOpenMarketing,
  initialTab = "overview"
}) => {
  const [activeTab, setActiveTab] = useState<AdminPanelTab>(initialTab);
  const [targetReviserSiteId, setTargetReviserSiteId] = useState<string>("site-1");
  const [edgeToken, setEdgeToken] = useState("edge_live_98a72b3c4d5e6f7g8h9i0j");
  const [isPurgingCache, setIsPurgingCache] = useState(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState(false);

  // Platform Data
  const [clientSites, setClientSites] = useState<JetkurClientSite[]>(getJetkurClientSites());
  const [packages, setPackages] = useState<JetkurPricingPackage[]>(getJetkurPackages());
  const [homepageSettings, setHomepageSettings] = useState<JetkurHomepageSettings>(getJetkurHomepageSettings());

  // Canonical Server Customer Accounts & Selected Customer Account Modal State
  const [serverCustomerAccounts, setServerCustomerAccounts] = useState<Record<string, any>>({});
  const [inspectingCustomerAccount, setInspectingCustomerAccount] = useState<CustomerAccountDetailsViewModel | null>(null);

  // Search & Filter for Customer Sites
  const [siteSearchQuery, setSiteSearchQuery] = useState("");
  const [renewalFilter, setRenewalFilter] = useState<"all" | "active" | "expiring_soon" | "expired">("all");

  // Notifications
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Edit Site Modal / State
  const [editingSite, setEditingSite] = useState<JetkurClientSite | null>(null);
  const [isAddingNewSite, setIsAddingNewSite] = useState(false);
  const [newSiteData, setNewSiteData] = useState<Partial<JetkurClientSite>>({
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    domain: "",
    sector: "Kurumsal Hizmetler",
    siteType: "multi-page",
    planName: "1 Web Sitesi",
    annualRenewalFee: 990,
    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    status: "active",
    paymentStatus: "paid"
  });

  // Package Edit State
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Load canonical customer accounts from server when Super Admin opens panel
  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/customers", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.customers || !Array.isArray(data.customers)) return;
        const map: Record<string, any> = {};
        for (const acc of data.customers) {
          if (acc.registrationEmail) {
            map[acc.registrationEmail.toLowerCase()] = acc;
          }
          if (acc.userId) {
            map[acc.userId] = acc;
          }
          if (Array.isArray(acc.sites)) {
            for (const s of acc.sites) {
              if (s.id) map[s.id] = acc;
              if (s.primaryDomain) map[s.primaryDomain.toLowerCase()] = acc;
            }
          }
        }
        setServerCustomerAccounts(map);
      })
      .catch(() => {
        // Offline or non-DB preview fallback handled via canonical local resolution
      });
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Resolves canonical customer account details for a given customer site without creating duplicate records.
   * Combines server-authoritative Prisma data (if present) with registered AuthUser and owned sites.
   */
  const resolveCustomerAccountDetails = (site: JetkurClientSite): CustomerAccountDetailsViewModel => {
    const emailKey = (site.email || "").trim().toLowerCase();
    const serverAcc =
      (emailKey && serverCustomerAccounts[emailKey]) ||
      serverCustomerAccounts[site.id] ||
      (site.domain && serverCustomerAccounts[site.domain.toLowerCase()]) ||
      null;

    const registeredUsers = getRegisteredUsers();
    const matchedAuthUser = registeredUsers.find(
      (u) =>
        (emailKey && u.email.toLowerCase() === emailKey) ||
        u.name.toLowerCase() === site.clientName.toLowerCase()
    );

    // Group all owned sites belonging to the same customer (by email or clientName)
    const ownedClientSites = clientSites.filter(
      (s) =>
        (emailKey && s.email && s.email.toLowerCase() === emailKey) ||
        s.clientName.toLowerCase() === site.clientName.toLowerCase()
    );

    const matchedPkg = packages.find((p) => p.name === site.planName);
    const inferredPlanCode =
      serverAcc?.planCode ||
      (site.planName.toLowerCase().includes("ajans")
        ? "AGENCY"
        : site.planName.toLowerCase().includes("3")
        ? "BUSINESS"
        : "ENTRY");
    const siteLimit =
      serverAcc?.workspaces?.[0]?.subscription?.siteLimit ||
      matchedPkg?.siteLimit ||
      (inferredPlanCode === "AGENCY" ? 10 : inferredPlanCode === "BUSINESS" ? 3 : 1);

    const daysRemaining = calculateDaysRemaining(site.renewalDate);
    const isExpired = serverAcc ? Boolean(serverAcc.isExpired) : daysRemaining < 0 || site.status === "expired";
    const isTrial = serverAcc ? Boolean(serverAcc.isTrial) : site.paymentStatus === "pending" && daysRemaining > 0 && daysRemaining <= 14;

    const subscriptionStatus =
      serverAcc?.subscriptionStatus ||
      (isExpired
        ? "EXPIRED"
        : site.status === "suspended"
        ? "CANCELED"
        : isTrial
        ? "TRIALING"
        : site.paymentStatus === "overdue"
        ? "PAST_DUE"
        : "ACTIVE");

    const mergedSites =
      serverAcc?.sites && serverAcc.sites.length > 0
        ? serverAcc.sites.map((s: any) => ({
            id: s.id,
            companyName: s.companyName || s.name,
            domain: s.primaryDomain,
            subdomain: `${s.slug || s.id}.jetkur.app`,
            sector: s.sector || site.sector,
            siteType: s.structureMode || site.siteType,
            status: s.status || site.status,
            pageSpeedScore: site.pageSpeedScore,
          }))
        : ownedClientSites.map((s) => ({
            id: s.id,
            companyName: s.companyName,
            domain: s.domain,
            subdomain: s.subdomain,
            sector: s.sector,
            siteType: s.siteType,
            status: s.status.toUpperCase(),
            pageSpeedScore: s.pageSpeedScore,
          }));

    const workspaces =
      serverAcc?.workspaces && serverAcc.workspaces.length > 0
        ? serverAcc.workspaces.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            type: ws.type,
            memberRole: ws.memberRole || "OWNER",
            siteLimit: ws.subscription?.siteLimit || siteLimit,
            activeSitesCount: ws.subscription?.activeSitesCount ?? mergedSites.length,
          }))
        : [
            {
              id: `ws-${site.id}`,
              name: `${site.companyName} Çalışma Alanı`,
              type: (inferredPlanCode === "AGENCY" ? "AGENCY" : "BUSINESS") as "BUSINESS" | "AGENCY",
              memberRole: "OWNER" as const,
              siteLimit,
              activeSitesCount: mergedSites.length,
            },
          ];

    return {
      userId: serverAcc?.userId || matchedAuthUser?.id || `usr-${site.id}`,
      customerName: serverAcc?.customerName || matchedAuthUser?.name || site.clientName,
      registrationEmail:
        serverAcc?.registrationEmail || matchedAuthUser?.email || site.email || "Belirtilmemiş",
      phone: serverAcc?.phone || site.phone || matchedAuthUser?.phone || null,
      platformRole: serverAcc?.platformRole || "NORMAL",
      accountStatus:
        serverAcc?.accountStatus ||
        (site.status === "suspended" ? "SUSPENDED" : "ACTIVE"),
      accountCreatedAt:
        serverAcc?.accountCreatedAt || matchedAuthUser?.createdAt || site.startDate,
      lastLoginAt: serverAcc?.lastLoginAt || matchedAuthUser?.lastLoginAt || null,
      subscriptionStatus,
      paymentStatus: site.paymentStatus,
      planName: serverAcc?.planName || site.planName,
      planCode: inferredPlanCode,
      trialEndsAt: serverAcc?.trialEndsAt || (isTrial ? site.renewalDate : null),
      renewalDate: site.renewalDate,
      daysRemaining: serverAcc?.trialDaysRemaining ?? daysRemaining,
      isTrial,
      isExpired,
      siteLimit,
      workspaces,
      sites: mergedSites,
    };
  };

  const handleOpenCustomerAccountDetails = async (site: JetkurClientSite) => {
    const initialViewModel = resolveCustomerAccountDetails(site);
    setInspectingCustomerAccount(initialViewModel);

    // Attempt live canonical refresh from Super Admin endpoint if authenticated
    const identifier = site.email || site.id;
    if (identifier) {
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(identifier)}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.customer) {
            setServerCustomerAccounts((prev) => ({
              ...prev,
              [(site.email || "").toLowerCase()]: data.customer,
              [site.id]: data.customer,
            }));
          }
        }
      } catch {
        // Keep resolved canonical view model
      }
    }
  };

  const triggerNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // ----------------------------------------------------
  // CLIENT SITES & RENEWAL ACTIONS
  // ----------------------------------------------------
  const handleExtendRenewal = (siteId: string) => {
    const updated = clientSites.map(s => {
      if (s.id === siteId) {
        const currentDate = new Date(s.renewalDate);
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        const newRenewalDate = currentDate.toISOString().split("T")[0];
        return {
          ...s,
          renewalDate: newRenewalDate,
          status: "active" as const,
          paymentStatus: "paid" as const
        };
      }
      return s;
    });
    setClientSites(updated);
    saveJetkurClientSites(updated);
    triggerNotification("Yenileme tarihi 1 yıl uzatıldı ve ödeme durumu 'Ödendi' yapıldı.");
  };

  const handleSaveEditedSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    const updated = clientSites.map(s => s.id === editingSite.id ? editingSite : s);
    setClientSites(updated);
    saveJetkurClientSites(updated);
    setEditingSite(null);
    triggerNotification(`"${editingSite.companyName}" site bilgileri ve yenileme tarihi güncellendi.`);
  };

  const handleAddNewSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteData.companyName || !newSiteData.clientName) {
      alert("Lütfen en azından şirket ve müşteri adını doldurun.");
      return;
    }

    const cleanSubdomain = (newSiteData.domain || newSiteData.companyName || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 20);

    const createdSite: JetkurClientSite = {
      id: `site-${Date.now()}`,
      clientName: newSiteData.clientName || "",
      companyName: newSiteData.companyName || "",
      email: newSiteData.email || "",
      phone: newSiteData.phone || "",
      domain: newSiteData.domain || `${cleanSubdomain}.jetkur.me`,
      subdomain: `${cleanSubdomain}.jetkur.me`,
      sector: newSiteData.sector || "Genel Kurumsal",
      siteType: newSiteData.siteType || "multi-page",
      planName: newSiteData.planName || "1 Web Sitesi",
      annualRenewalFee: Number(newSiteData.annualRenewalFee) || 990,
      startDate: new Date().toISOString().split("T")[0],
      renewalDate: newSiteData.renewalDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      status: (newSiteData.status as any) || "active",
      paymentStatus: (newSiteData.paymentStatus as any) || "paid",
      autoRenew: true,
      sslStatus: "active",
      pageSpeedScore: 100,
      lastBackupDate: new Date().toISOString().split("T")[0]
    };

    const updated = [createdSite, ...clientSites];
    setClientSites(updated);
    saveJetkurClientSites(updated);
    setIsAddingNewSite(false);
    triggerNotification(`Yeni müşteri sitesi "${createdSite.companyName}" başarıyla eklendi.`);
  };

  const handleDeleteSite = (siteId: string, companyName: string) => {
    if (window.confirm(`"${companyName}" sitesini listeden silmek istediğinize emin misiniz?`)) {
      const updated = clientSites.filter(s => s.id !== siteId);
      setClientSites(updated);
      saveJetkurClientSites(updated);
      triggerNotification(`"${companyName}" sitesi silindi.`);
    }
  };

  // ----------------------------------------------------
  // PRICING PACKAGES ACTIONS
  // ----------------------------------------------------
  const handleUpdatePackageField = (pkgId: string, field: keyof JetkurPricingPackage, value: any) => {
    const updated = packages.map(p => {
      if (p.id === pkgId) {
        const up = { ...p, [field]: value };
        if (field === "annualPrice") {
          up.monthlyEquivalent = Math.round(Number(value) / 12);
        }
        return up;
      }
      return p;
    });
    setPackages(updated);
  };

  const handleSaveAllPackages = () => {
    saveJetkurPackages(packages);
    triggerNotification("Tüm paketler ve fiyatlar kaydedildi, JetKur ana sayfasında yayınlandı.");
  };

  const handleAddFeatureToPackage = (pkgId: string) => {
    if (!newFeatureText.trim()) return;
    const updated = packages.map(p => {
      if (p.id === pkgId) {
        return {
          ...p,
          features: [...p.features, newFeatureText.trim()]
        };
      }
      return p;
    });
    setPackages(updated);
    setNewFeatureText("");
  };

  const handleRemoveFeatureFromPackage = (pkgId: string, index: number) => {
    const updated = packages.map(p => {
      if (p.id === pkgId) {
        const copy = [...p.features];
        copy.splice(index, 1);
        return { ...p, features: copy };
      }
      return p;
    });
    setPackages(updated);
  };

  // ----------------------------------------------------
  // HOMEPAGE SETTINGS ACTIONS
  // ----------------------------------------------------
  const handleSaveHomepageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveJetkurHomepageSettings(homepageSettings);
    triggerNotification("JetKur Ana Sayfa içerikleri (Başlıklar, İlanlar, Hız Metrikleri) başarıyla güncellendi!");
  };

  // ----------------------------------------------------
  // GLOBAL EDGE PURGE
  // ----------------------------------------------------
  const handlePurgeGlobalCache = () => {
    setIsPurgingCache(true);
    setTimeout(() => {
      setIsPurgingCache(false);
      setCachePurgedSuccess(true);
      setTimeout(() => setCachePurgedSuccess(false), 3000);
    }, 1200);
  };

  // Filtered Sites
  const filteredSites = clientSites.filter(site => {
    const q = siteSearchQuery.toLowerCase();
    const matchesQuery = 
      site.companyName.toLowerCase().includes(q) ||
      site.clientName.toLowerCase().includes(q) ||
      (site.email && site.email.toLowerCase().includes(q)) ||
      site.domain.toLowerCase().includes(q) ||
      site.sector.toLowerCase().includes(q);

    const days = calculateDaysRemaining(site.renewalDate);

    if (renewalFilter === "expiring_soon") {
      return matchesQuery && days >= 0 && days <= 30;
    }
    if (renewalFilter === "expired") {
      return matchesQuery && days < 0;
    }
    if (renewalFilter === "active") {
      return matchesQuery && days > 30;
    }
    return matchesQuery;
  });

  // Renewal stats calculations
  const totalAnnualValue = clientSites.reduce((acc, s) => acc + (s.annualRenewalFee || 0), 0);
  const expiringSoonCount = clientSites.filter(s => {
    const days = calculateDaysRemaining(s.renewalDate);
    return days >= 0 && days <= 30;
  }).length;
  const expiredCount = clientSites.filter(s => calculateDaysRemaining(s.renewalDate) < 0).length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border-2 border-amber-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">JetKur Süper Admin Paneli</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase">
                v4.2 PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Müşteri Siteleri, Yenileme Takvimi, Üyelik Paketleri ve JetKur.com.tr Ana Sayfa Yönetimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>310+ Global Anycast CDN: Aktif</span>
          </span>
        </div>
      </div>

      {/* Grid: Navigation & Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Admin Tabs Sidebar */}
        <div className="lg:col-span-3 space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Özeti & Gelir</span>
          </button>

          <button
            onClick={() => setActiveTab("client-sites")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "client-sites"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Müşteriler & Siteleri</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
              {clientSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("renewals")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "renewals"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Yenileme Tarihleri & Takvim</span>
            </div>
            {expiringSoonCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black animate-pulse">
                {expiringSoonCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pricing-plans")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pricing-plans"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4" />
              <span>Üyelik Paketleri & Fiyatlar</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("homepage-manager")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "homepage-manager"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>JetKur Ana Sayfa Yönetimi</span>
          </button>

          <button
            onClick={() => setActiveTab("seo-content-reviser")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "seo-content-reviser"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>SEO İçerik Revize Aracı</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-900 font-black">
              GEMINI
            </span>
          </button>

          <div className="pt-3 border-t border-slate-200/80 my-2" />

          <button
            onClick={() => setActiveTab("template-factory")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "template-factory"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Şablon Fabrikası & AI</span>
          </button>

          <button
            onClick={() => setActiveTab("edge-settings")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "edge-settings"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Anycast CDN</span>
          </button>
        </div>

        {/* Admin Body Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* ==================== TAB 1: OVERVIEW METRICS ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Aktif Müşteri Sitesi</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{clientSites.length} Adet</div>
                  <div className="text-xs text-emerald-600 font-bold mt-1">↑ %100 Çalışma Süresi</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Yenilenme Bekleyenler</div>
                  <div className="text-3xl font-black text-amber-600 mt-2">{expiringSoonCount} Site</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1">Gelecek 30 Gün İçinde</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Ortalama Yanıt Hızı</div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">0.02 sn</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">100/100 PageSpeed</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Yıllık Yinelenen Gelir (ARR)</div>
                  <div className="text-3xl font-black text-purple-600 mt-2">₺{totalAnnualValue.toLocaleString("tr-TR")}</div>
                  <div className="text-xs text-purple-700 font-semibold mt-1">Doğrudan Kâr Marjı</div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Hızlı Yönetim İşlemleri</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Müşteri ekleyebilir, yenileme tarihlerini kontrol edebilir veya paket fiyatlarını değiştirebilirsiniz.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveTab("seo-content-reviser")}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gemini SEO İçerik Revize</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNewSite(true);
                      setActiveTab("client-sites");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Müşteri &amp; Site Ekle</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("renewals")}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Yenilemeleri Gör</span>
                  </button>
                </div>
              </div>

              {/* Serverless Comparison Chart */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg">Geleneksel vs JetKur Altyapı Maliyet Karşılaştırması</h3>
                    <p className="text-xs text-slate-400">
                      Geleneksel WordPress sunucuları için sunucu maliyetleri katlanırken, JetKur Global Anycast mimarisinde maliyet neredeyse ₺0'dır.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                    %98 Tasarruf
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="text-xs font-bold text-rose-400">Eski WordPress / PHP Mimarisi</div>
                    <div className="text-sm font-semibold text-slate-300">Yıllık Sunucu &amp; Lisans: ~₺180.000</div>
                    <div className="text-xs text-slate-400">Veritabanı çökmeleri, eklenti lisansları ve hacklenme kurtarma masrafları.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                    <div className="text-xs font-bold text-amber-400">JetKur Statik + Global Edge Altyapısı</div>
                    <div className="text-sm font-semibold text-white">Yıllık Altyapı: ~₺0 (Sonsuz Ölçek)</div>
                    <div className="text-xs text-slate-300">Saf HTML dağıtımı, sıfır CPU harcaması ve 0.02s küresel yanıt hızı.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: CLIENT SITES DIRECTORY ==================== */}
          {activeTab === "client-sites" && (
            <div className="space-y-6">
              {/* Directory Header & Controls */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Müşteriler &amp; Müşteri Web Siteleri</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Platformunuzdaki tüm müşteri sitelerini, paketlerini ve yenileme tarihlerini yönetin.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingNewSite(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Müşteri Ekle</span>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Müşteri adı, şirket, alan adı veya sektör ara..."
                      value={siteSearchQuery}
                      onChange={(e) => setSiteSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setRenewalFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        renewalFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Tümü ({clientSites.length})
                    </button>
                    <button
                      onClick={() => setRenewalFilter("active")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        renewalFilter === "active" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Sorunsuz Aktif
                    </button>
                    <button
                      onClick={() => setRenewalFilter("expiring_soon")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        renewalFilter === "expiring_soon" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      &lt;30 Gün Kalanlar ({expiringSoonCount})
                    </button>
                    <button
                      onClick={() => setRenewalFilter("expired")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        renewalFilter === "expired" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Süresi Dolanlar ({expiredCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Add New Site Modal/Form */}
              {isAddingNewSite && (
                <div className="bg-white rounded-3xl border-2 border-amber-500 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                        +
                      </div>
                      <h3 className="font-black text-slate-900 text-base">Yeni Müşteri &amp; Web Sitesi Kaydı</h3>
                    </div>
                    <button
                      onClick={() => setIsAddingNewSite(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNewSite} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Müşteri Yetkili Adı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Hasan Yılmaz"
                        value={newSiteData.clientName || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, clientName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şirket / İşletme Adı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Yılmaz Yapı Dekorasyon"
                        value={newSiteData.companyName || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-Posta Adresi</label>
                      <input
                        type="email"
                        placeholder="info@yilmazyapi.com"
                        value={newSiteData.email || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon Numarası</label>
                      <input
                        type="text"
                        placeholder="+90 532 000 00 00"
                        value={newSiteData.phone || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alan Adı (Domain)</label>
                      <input
                        type="text"
                        placeholder="yilmazyapi.com.tr"
                        value={newSiteData.domain || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, domain: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sektör</label>
                      <input
                        type="text"
                        placeholder="İnşaat, Hukuk, Diş Kliniği..."
                        value={newSiteData.sector || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, sector: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Üyelik Paketi</label>
                      <select
                        value={newSiteData.planName || "1 Web Sitesi"}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = packages.find(p => p.name === val);
                          setNewSiteData({
                            ...newSiteData,
                            planName: val,
                            annualRenewalFee: found ? found.annualPrice : 990
                          });
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      >
                        {packages.map(p => (
                          <option key={p.id} value={p.name}>
                            {p.name} (₺{p.annualPrice}/yıl)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yıllık Yenileme Ücreti (₺)</label>
                      <input
                        type="number"
                        value={newSiteData.annualRenewalFee || 990}
                        onChange={(e) => setNewSiteData({ ...newSiteData, annualRenewalFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yenileme Tarihi (Bitiş Tarihi)</label>
                      <input
                        type="date"
                        required
                        value={newSiteData.renewalDate || ""}
                        onChange={(e) => setNewSiteData({ ...newSiteData, renewalDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ödeme Durumu</label>
                      <select
                        value={newSiteData.paymentStatus || "paid"}
                        onChange={(e) => setNewSiteData({ ...newSiteData, paymentStatus: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      >
                        <option value="paid">Ödendi (Aktif)</option>
                        <option value="pending">Bekliyor (Yenileme Bekliyor)</option>
                        <option value="overdue">Gecikmiş (Ödeme Alınamadı)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewSite(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                      >
                        Müşteri Sitesini Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Site Modal */}
              {editingSite && (
                <div className="bg-white rounded-3xl border-2 border-indigo-500 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-slate-900 text-base">
                        Müşteri &amp; Yenileme Düzenle: {editingSite.companyName}
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingSite(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedSite} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Müşteri Yetkili Adı</label>
                      <input
                        type="text"
                        required
                        value={editingSite.clientName}
                        onChange={(e) => setEditingSite({ ...editingSite, clientName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şirket Adı</label>
                      <input
                        type="text"
                        required
                        value={editingSite.companyName}
                        onChange={(e) => setEditingSite({ ...editingSite, companyName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alan Adı (Domain)</label>
                      <input
                        type="text"
                        value={editingSite.domain}
                        onChange={(e) => setEditingSite({ ...editingSite, domain: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon (WhatsApp Hatırlatma)</label>
                      <input
                        type="text"
                        value={editingSite.phone}
                        onChange={(e) => setEditingSite({ ...editingSite, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yenileme Tarihi *</label>
                      <input
                        type="date"
                        required
                        value={editingSite.renewalDate}
                        onChange={(e) => setEditingSite({ ...editingSite, renewalDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-indigo-400 text-xs font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yıllık Yenileme Bedeli (₺)</label>
                      <input
                        type="number"
                        value={editingSite.annualRenewalFee}
                        onChange={(e) => setEditingSite({ ...editingSite, annualRenewalFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ödeme Durumu</label>
                      <select
                        value={editingSite.paymentStatus}
                        onChange={(e) => setEditingSite({ ...editingSite, paymentStatus: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      >
                        <option value="paid">Ödendi</option>
                        <option value="pending">Ödeme Bekleniyor</option>
                        <option value="overdue">Süresi Geçti / Borçlu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yayın Durumu</label>
                      <select
                        value={editingSite.status}
                        onChange={(e) => setEditingSite({ ...editingSite, status: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      >
                        <option value="active">Aktif (Yayında)</option>
                        <option value="expiring_soon">Süresi Yaklaştı</option>
                        <option value="expired">Süresi Doldu</option>
                        <option value="suspended">Askıya Alındı (Durduruldu)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingSite(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                      >
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Customer Account Details Modal / Panel ("Hesap Bilgileri") */}
              {inspectingCustomerAccount && (
                <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            Müşteri Hesap Bilgileri: {inspectingCustomerAccount.customerName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              inspectingCustomerAccount.accountStatus === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : inspectingCustomerAccount.accountStatus === "SUSPENDED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {inspectingCustomerAccount.accountStatus === "ACTIVE"
                              ? "AKTİF HESAP"
                              : inspectingCustomerAccount.accountStatus === "SUSPENDED"
                              ? "ASKIDA"
                              : "DAVETLİ"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                            Rol: {inspectingCustomerAccount.platformRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Kanonik kullanıcı kaydı, abonelik durumu, deneme süresi ve sahip olunan çalışma alanları / siteler
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectingCustomerAccount(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Grid: Account Info + Subscription Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Account & Contact Identity */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-700" />
                        <span>Kimlik &amp; İletişim Bilgileri</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Müşteri Adı Soyadı</div>
                          <div className="font-bold text-slate-900 mt-0.5">{inspectingCustomerAccount.customerName}</div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Kayıt E-Posta Adresi</div>
                          <div className="font-mono font-semibold text-slate-800 mt-0.5 break-all">
                            {inspectingCustomerAccount.registrationEmail}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Telefon Numarası</div>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {inspectingCustomerAccount.phone || "Belirtilmemiş"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Hesap Oluşturma Tarihi</div>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {inspectingCustomerAccount.accountCreatedAt.split("T")[0]}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Son Giriş Tarihi</div>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {inspectingCustomerAccount.lastLoginAt
                              ? inspectingCustomerAccount.lastLoginAt.replace("T", " ").slice(0, 16)
                              : "Henüz giriş kaydı bulunmuyor"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Subscription & Trial Details */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        <span>Abonelik &amp; Deneme Süresi Durumu</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Kanonik Plan / Paket</div>
                          <div className="font-black text-slate-900 mt-0.5">
                            {inspectingCustomerAccount.planName}{" "}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950">
                              {inspectingCustomerAccount.planCode}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Abonelik Durumu</div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                inspectingCustomerAccount.subscriptionStatus === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : inspectingCustomerAccount.subscriptionStatus === "TRIALING"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {inspectingCustomerAccount.subscriptionStatus === "ACTIVE"
                                ? "AKTİF ABONELİK"
                                : inspectingCustomerAccount.subscriptionStatus === "TRIALING"
                                ? "DENEME SÜRESİNDE (TRIAL)"
                                : inspectingCustomerAccount.subscriptionStatus === "PAST_DUE"
                                ? "ÖDEME GECİKMİŞ"
                                : "SÜRESİ DOLMUŞ / İPTAL"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">
                            {inspectingCustomerAccount.isTrial ? "Deneme Bitiş Tarihi" : "Yenileme / Bitiş Tarihi"}
                          </div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {(inspectingCustomerAccount.trialEndsAt || inspectingCustomerAccount.renewalDate).split("T")[0]}
                            <span className="ml-1.5 text-[11px] font-semibold text-slate-600">
                              ({inspectingCustomerAccount.daysRemaining >= 0
                                ? `${inspectingCustomerAccount.daysRemaining} gün kaldı`
                                : `${Math.abs(inspectingCustomerAccount.daysRemaining)} gün geçti`})
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Site Kotası &amp; Kullanım</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {inspectingCustomerAccount.sites.length} / {inspectingCustomerAccount.siteLimit} Aktif Site
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Owned Workspaces & Sites */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-800" />
                        <span>
                          Sahip Olunan Çalışma Alanları ({inspectingCustomerAccount.workspaces.length}) &amp; Web Siteleri ({inspectingCustomerAccount.sites.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {inspectingCustomerAccount.workspaces.map((ws) => (
                          <span
                            key={ws.id}
                            className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700"
                          >
                            🏢 {ws.name} ({ws.type} • {ws.memberRole})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {inspectingCustomerAccount.sites.map((ownedSite) => (
                        <div
                          key={ownedSite.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{ownedSite.companyName}</div>
                            <div className="text-[11px] font-mono text-slate-600 truncate">🌐 {ownedSite.domain}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {ownedSite.sector} • {ownedSite.siteType}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                              ownedSite.status.toUpperCase() === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ownedSite.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sites Table / List */}
              <div className="space-y-3">
                {filteredSites.map((site) => {
                  const daysLeft = calculateDaysRemaining(site.renewalDate);
                  const isExpiring = daysLeft >= 0 && daysLeft <= 30;
                  const isExpired = daysLeft < 0;
                  const accountSnapshot = resolveCustomerAccountDetails(site);

                  return (
                    <div 
                      key={site.id} 
                      className={`p-5 rounded-3xl border bg-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                        isExpired 
                          ? "border-rose-300 bg-rose-50/20" 
                          : isExpiring 
                            ? "border-amber-300 bg-amber-50/20" 
                            : "border-slate-200"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isExpired ? "bg-rose-500" : isExpiring ? "bg-amber-500 animate-ping" : "bg-emerald-500"
                          }`} />
                          <span className="font-black text-slate-900 text-base">{site.companyName}</span>
                          <span className="text-xs text-slate-500 font-medium">({accountSnapshot.customerName})</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {site.sector}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            {site.planName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {accountSnapshot.subscriptionStatus === "TRIALING"
                              ? "Deneme (Trial)"
                              : accountSnapshot.subscriptionStatus === "ACTIVE"
                              ? "Aktif Abonelik"
                              : "Süresi Doldu"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-slate-800 font-semibold">🌐 {site.domain}</span>
                          <span>•</span>
                          <span>✉️ {accountSnapshot.registrationEmail}</span>
                          <span>•</span>
                          <span>📞 {accountSnapshot.phone || "Telefon yok"}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">⚡ {site.pageSpeedScore}/100 PageSpeed</span>
                          <span>•</span>
                          <span className="font-bold text-slate-900">₺{site.annualRenewalFee}/yıl</span>
                        </div>

                        {/* Renewal & Account Metadata Badge */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">Kayıt:</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {accountSnapshot.accountCreatedAt.split("T")[0]}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[11px] font-semibold text-slate-500">Yenileme Tarihi:</span>
                          <span className="text-xs font-bold text-slate-800">{site.renewalDate}</span>

                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                              ⛔ Süresi Doldu ({Math.abs(daysLeft)} gün önce)
                            </span>
                          ) : isExpiring ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 animate-pulse">
                              ⚠️ {daysLeft} Gün Kaldı! (Yenileme Bekleniyor)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✅ {daysLeft} gün kaldı (Sorunsuz)
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            site.paymentStatus === "paid" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-900"
                          }`}>
                            {site.paymentStatus === "paid" ? "Ödendi" : "Ödeme Bekliyor"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {/* Customer Account Details ("Hesap Bilgileri") */}
                        <button
                          type="button"
                          onClick={() => handleOpenCustomerAccountDetails(site)}
                          title="Müşteri hesap, abonelik ve çalışma alanı bilgilerini görüntüle"
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hesap Bilgileri</span>
                        </button>

                        {/* Gemini SEO Content Revise */}
                        <button
                          onClick={() => {
                            setTargetReviserSiteId(site.id);
                            setActiveTab("seo-content-reviser");
                          }}
                          title="Gemini ile sitenin başlık ve meta açıklamalarını revize et"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                          <span>SEO Revize Et</span>
                        </button>

                        {/* Quick 1 Year Extend */}
                        <button
                          onClick={() => handleExtendRenewal(site.id)}
                          title="Yenileme tarihini bugünden/mevcut tarihten itibaren 1 yıl uzat"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>+1 Yıl Uzat</span>
                        </button>

                        {/* WhatsApp Reminder */}
                        {site.phone && (
                          <a
                            href={`https://wa.me/${site.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Sayın ${site.clientName}, ${site.domain} web sitenizin yıllık lisans yenileme tarihi ${site.renewalDate} olup ${daysLeft > 0 ? `${daysLeft} gün kalmıştır` : "süresi dolmuştur"}. Yenileme işlemi ve detaylar için tarafımıza dönüş yapabilirsiniz. JetKur Destek Ekibi.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Hatırlat</span>
                          </a>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingSite(site)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteSite(site.id, site.companyName)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Siteyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredSites.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
                    <p className="text-sm font-semibold">Aradığınız kriterlere uygun müşteri sitesi bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: RENEWALS CALENDAR & ALERT TRACKER ==================== */}
          {activeTab === "renewals" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Yenileme Tarihleri &amp; Otomatik Takvim Takip Merkezi</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Müşteri sitelerinin yıllık lisans ve barındırma sürelerini tek ekranda izleyin, süresi yaklaşanlara tek tıkla WhatsApp hatırlatması gönderin veya süresini uzatın.
                  </p>
                </div>

                {/* Renewal Stat Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-xs font-bold text-amber-700 uppercase">30 Gün İçinde Dolacaklar</div>
                    <div className="text-3xl font-black text-amber-900 mt-2">{expiringSoonCount} Site</div>
                    <div className="text-xs text-amber-800 font-medium mt-1">Yenileme bildirimi gönderilmeli</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                    <div className="text-xs font-bold text-rose-700 uppercase">Süresi Geçen / Askıdaki Siteler</div>
                    <div className="text-3xl font-black text-rose-900 mt-2">{expiredCount} Site</div>
                    <div className="text-xs text-rose-800 font-medium mt-1">Ödeme tahsilatı bekliyor</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs font-bold text-emerald-700 uppercase">Beklenen Yenileme Cirosu</div>
                    <div className="text-3xl font-black text-emerald-900 mt-2">
                      ₺{clientSites
                        .filter(s => calculateDaysRemaining(s.renewalDate) <= 30)
                        .reduce((acc, s) => acc + s.annualRenewalFee, 0)
                        .toLocaleString("tr-TR")}
                    </div>
                    <div className="text-xs text-emerald-800 font-medium mt-1">Yakın dönem nakit akışı</div>
                  </div>
                </div>

                {/* Sorted Renewal Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">İşletme / Müşteri</th>
                        <th className="p-3.5">Alan Adı</th>
                        <th className="p-3.5">Yenileme Tarihi</th>
                        <th className="p-3.5">Kalan Gün</th>
                        <th className="p-3.5">Ücret</th>
                        <th className="p-3.5 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...clientSites]
                        .sort((a, b) => calculateDaysRemaining(a.renewalDate) - calculateDaysRemaining(b.renewalDate))
                        .map((s) => {
                          const days = calculateDaysRemaining(s.renewalDate);
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80">
                              <td className="p-3.5 font-bold text-slate-900">
                                {s.companyName}
                                <div className="text-[11px] text-slate-400 font-normal">{s.clientName}</div>
                              </td>
                              <td className="p-3.5 font-mono text-slate-600">{s.domain}</td>
                              <td className="p-3.5 font-bold text-slate-900">{s.renewalDate}</td>
                              <td className="p-3.5">
                                {days < 0 ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-black text-[10px]">
                                    {Math.abs(days)} gün gecikti
                                  </span>
                                ) : days <= 30 ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[10px]">
                                    {days} gün kaldı
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                    {days} gün
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 font-bold text-slate-900">₺{s.annualRenewalFee}</td>
                              <td className="p-3.5 text-right space-x-2">
                                <button
                                  onClick={() => handleExtendRenewal(s.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  +1 Yıl
                                </button>
                                {s.phone && (
                                  <a
                                    href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                      `Sayın ${s.clientName}, ${s.domain} sitenizin yıllık yenileme tarihi ${s.renewalDate} olarak yaklaşmaktadır. JetKur.`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer inline-block"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: PRICING PACKAGES & MEMBERSHIP ==================== */}
          {activeTab === "pricing-plans" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Üyelik Paketleri &amp; Fiyat Yönetimi</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Burada yaptığınız fiyat ve özellik değişiklikleri JetKur ana sayfasındaki lisans kartlarında anında canlıya alınır.
                  </p>
                </div>
                <button
                  onClick={handleSaveAllPackages}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Paketleri Kaydet &amp; Yayınla</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-3xl border-2 flex flex-col justify-between space-y-4 ${
                      pkg.isPopular ? "border-amber-500 bg-amber-50/20 shadow-md" : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Package Name & Popular toggle */}
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handleUpdatePackageField(pkg.id, "name", e.target.value)}
                          className="font-black text-base text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-500 w-full mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdatePackageField(pkg.id, "isPopular", !pkg.isPopular)}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 cursor-pointer ${
                            pkg.isPopular ? "bg-amber-500 text-slate-950" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {pkg.isPopular ? "★ Popüler" : "Normal"}
                        </button>
                      </div>

                      {/* Category & Badge */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
                          <input
                            type="text"
                            value={pkg.category}
                            onChange={(e) => handleUpdatePackageField(pkg.id, "category", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Rozet / Etiket</label>
                          <input
                            type="text"
                            value={pkg.badge || ""}
                            placeholder="Örn: En Popüler"
                            onChange={(e) => handleUpdatePackageField(pkg.id, "badge", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                          />
                        </div>
                      </div>

                      {/* Pricing Inputs */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-2xl border border-slate-200">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Yıllık Fiyat (₺)</label>
                          <input
                            type="number"
                            value={pkg.annualPrice}
                            onChange={(e) => handleUpdatePackageField(pkg.id, "annualPrice", Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Site Limiti</label>
                          <input
                            type="number"
                            value={pkg.siteLimit}
                            onChange={(e) => handleUpdatePackageField(pkg.id, "siteLimit", Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Açıklama</label>
                        <textarea
                          rows={2}
                          value={pkg.description}
                          onChange={(e) => handleUpdatePackageField(pkg.id, "description", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white resize-none"
                        />
                      </div>

                      {/* Features List */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                          Özellikler Listesi ({pkg.features.length})
                        </label>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="flex-1 text-[11px] text-slate-700">{feat}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeatureFromPackage(pkg.id, idx)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Feature input */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="text"
                            placeholder="Yeni özellik yazın..."
                            value={editingPackageId === pkg.id ? newFeatureText : ""}
                            onFocus={() => setEditingPackageId(pkg.id)}
                            onChange={(e) => setNewFeatureText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddFeatureToPackage(pkg.id);
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddFeatureToPackage(pkg.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAllPackages}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                    >
                      {pkg.name} Değişikliklerini Uygula
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: JETKUR HOMEPAGE MANAGER (jetkur.com.tr) ==================== */}
          {activeTab === "homepage-manager" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">JetKur Ana Sayfa Canlı İçerik Yönetimi</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200">
                      CANLI YAYIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    JetKur.com.tr ana sayfasının en üst duyurusunu, manşet başlığını (üst satır ve alt satırdaki &quot;Son Verin.&quot; vurgusu), alt açıklama metnini, istatistiklerini ve buton yazılarını dilediğiniz gibi doğrudan buradan anlık olarak değiştirin.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenMarketing && (
                    <button
                      type="button"
                      onClick={onOpenMarketing}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Ana sayfayı canlı ziyaretçi görünümünde açar"
                    >
                      <Globe className="w-4 h-4 text-slate-600" />
                      <span>Canlı Ana Sayfayı Gör</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveHomepageSettings}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                  >
                    <Save className="w-4 h-4" />
                    <span>Ana Sayfada Yayınla</span>
                  </button>
                </div>
              </div>

              {/* Informative Help Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold text-amber-950">👑 Süper Admin Yetkisiyle Tam Kontrol</div>
                  <p className="text-amber-800 leading-relaxed">
                    Evet! Ana sayfadaki tüm metinler, başlıklar, alt açıklamalar ve vurgu kelimeleri statik koda gömülü değildir; doğrudan bu paneldeki form alanlarından yönetilir. Yaptığınız değişiklikler kaydedildiği anda canlı ana sayfada ziyaretçilerinize anında yansır.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                      Anlık Canlı Önizleme (Ziyaretçi Nasıl Görüyor?)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Aşağıdaki alanları yazdıkça burası anında güncellenir
                  </span>
                </div>

                <div className="text-center max-w-3xl mx-auto py-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>{homepageSettings.badgeText}</span>
                  </div>

                  <div className="text-xl sm:text-3xl font-black tracking-tight text-white leading-[1.2] mb-3">
                    <span className="block">{homepageSettings.heroTitle}</span>
                    <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                      {homepageSettings.heroHighlight}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto mb-6">
                    {homepageSettings.heroSubtitle}
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-md">
                      {homepageSettings.primaryCtaText}
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs">
                      {homepageSettings.secondaryCtaText}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveHomepageSettings} className="space-y-6">
                {/* 1. Announcement Banner */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">En Üst Duyuru / Kampanya Bandı</div>
                      <div className="text-xs text-slate-500">Ana sayfanın en tepesinde görünen dikkat çekici bilgilendirme bandı.</div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homepageSettings.announcementActive}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, announcementActive: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">Duyuru Aktif</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={homepageSettings.announcementText}
                    onChange={(e) => setHomepageSettings({ ...homepageSettings, announcementText: e.target.value })}
                    placeholder="Örn: 🚀 JetKur 14 Günlük Ücretsiz Deneme Başladı!..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>

                {/* 2. Hero Section Content */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="font-bold text-slate-900 text-sm">
                      Hero (Manşet) Başlık, Vurgulu Bitiş ve Açıklamalar
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Manşet 2 satırlı yapıda düzenlenmiştir
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      1. Üst Küçük Rozet Metni
                    </label>
                    <input
                      type="text"
                      value={homepageSettings.badgeText}
                      onChange={(e) => setHomepageSettings({ ...homepageSettings, badgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-amber-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          2. Ana Manşet Başlığı (Üst Satır)
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">1. Satırda görünür</span>
                      </div>
                      <input
                        type="text"
                        value={homepageSettings.heroTitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                        placeholder="Örn: WordPress'in Hantallığına ve Kalitesiz Hazır Sitelere"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          3. Vurgulu Bitiş Kelimesi (Alt Satır - Renkli Parlar)
                        </label>
                        <span className="text-[10px] text-amber-600 font-bold">2. Satıra otomatik kayar</span>
                      </div>
                      <input
                        type="text"
                        value={homepageSettings.heroHighlight}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroHighlight: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-black text-amber-600"
                        placeholder="Örn: Son Verin."
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        4. Alt Açıklama Paragrafı
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Manşetin altındaki açıklama yazısı</span>
                    </div>
                    <textarea
                      rows={3}
                      value={homepageSettings.heroSubtitle}
                      onChange={(e) => setHomepageSettings({ ...homepageSettings, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white leading-relaxed"
                      placeholder="Kalitesiz paneller veya WordPress gibi sunucuya yük bindiren hantal yapılar yerine..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Birincil Buton Yazısı (CTA)</label>
                      <input
                        type="text"
                        value={homepageSettings.primaryCtaText}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, primaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">İkincil Buton Yazısı</label>
                      <input
                        type="text"
                        value={homepageSettings.secondaryCtaText}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, secondaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Performance Metrics Bar */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                    Hız &amp; Güvenilirlik Sayaçları (Stats Bar)
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Edge Yanıt Süresi</label>
                      <input
                        type="text"
                        value={homepageSettings.stats.edgeResponseTime}
                        onChange={(e) => setHomepageSettings({
                          ...homepageSettings,
                          stats: { ...homepageSettings.stats, edgeResponseTime: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-amber-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">PageSpeed Puanı</label>
                      <input
                        type="text"
                        value={homepageSettings.stats.pageSpeedScore}
                        onChange={(e) => setHomepageSettings({
                          ...homepageSettings,
                          stats: { ...homepageSettings.stats, pageSpeedScore: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Edge Lokasyon Sayısı</label>
                      <input
                        type="text"
                        value={homepageSettings.stats.edgeLocations}
                        onChange={(e) => setHomepageSettings({
                          ...homepageSettings,
                          stats: { ...homepageSettings.stats, edgeLocations: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-blue-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Çökme / Hack Riski</label>
                      <input
                        type="text"
                        value={homepageSettings.stats.crashRisk}
                        onChange={(e) => setHomepageSettings({
                          ...homepageSettings,
                          stats: { ...homepageSettings.stats, crashRisk: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-purple-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Support Contacts */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                    İletişim &amp; Destek Numaraları
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destek Telefon Numarası</label>
                      <input
                        type="text"
                        value={homepageSettings.supportPhone}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, supportPhone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Destek Hattı</label>
                      <input
                        type="text"
                        value={homepageSettings.whatsappNumber}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, whatsappNumber: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Değişiklikleri Ana Sayfada Yayınla</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 6: TEMPLATE FACTORY ==================== */}
          {activeTab === "template-factory" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Şablon Fabrikası &amp; Sektör Türetme</h2>
                  <p className="text-xs text-slate-500 mt-1">Yapay zeka motoru ile saniyeler içinde yeni bir sektör için hazır şablon oluşturun.</p>
                </div>
                <button
                  onClick={onOpenAiFactory}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Şablon Üreticiyi Başlat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                    <img src={t.coverImage} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.sector}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ 100/100 PageSpeed Hazır</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 7: GLOBAL EDGE SETTINGS ==================== */}
          {activeTab === "edge-settings" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Global Anycast Edge CDN Ayarları</h2>
                <p className="text-xs text-slate-500 mt-1">Tüm müşteri sitelerinin statik HTML dağıtımını yöneten küresel CDN kuralları.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Global Edge CDN API Token</label>
                  <input
                    type="password"
                    value={edgeToken}
                    onChange={(e) => setEdgeToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-slate-50"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-900 text-sm">Global CDN Önbelleğini Temizle (Purge Cache)</div>
                      <div className="text-xs text-amber-700">Tüm 310+ Edge lokasyonundaki HTML ve CSS dosyalarını anında günceller.</div>
                    </div>
                    <button
                      onClick={handlePurgeGlobalCache}
                      disabled={isPurgingCache}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPurgingCache ? "animate-spin" : ""}`} />
                      <span>{isPurgingCache ? "Temizleniyor..." : "Tüm Önbelleği Temizle"}</span>
                    </button>
                  </div>

                  {cachePurgedSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                      ✅ 310+ Global Edge sunucusundaki önbellek başarıyla temizlendi!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 8: SEO CONTENT REVISE TOOL (GEMINI) ==================== */}
          {activeTab === "seo-content-reviser" && (
            <SeoContentReviserTool
              clientSites={clientSites}
              preselectedSiteId={targetReviserSiteId}
            />
          )}
        </div>
      </div>
    </div>
  );
};
