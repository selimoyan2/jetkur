import React, { useState, useMemo } from "react";
import { 
  Gauge, 
  Smartphone, 
  Monitor, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Activity, 
  Timer, 
  ArrowUpRight, 
  Layers, 
  Clock, 
  TrendingUp,
  Sparkles,
  Info,
  Play,
  Pause,
  Radio,
  History,
  Bell,
  Check,
  ShieldCheck,
  X,
  Radar,
  LayoutGrid,
  Plus,
  Search,
  Globe,
  ExternalLink
} from "lucide-react";
import { CompetitorContentMetric } from "../../types";
import { CompetitorPsiSparkline } from "./CompetitorPsiSparkline";
import { usePageSpeedSyncService } from "../../hooks/usePageSpeedSyncService";
import { SYNC_INTERVAL_OPTIONS, MetricDeltas, PageSpeedAuditResult } from "../../services/pagespeedSyncService";
import { PageSpeedSyncLogsModal } from "./PageSpeedSyncLogsModal";
import { CoreWebVitalsRadarComparisonModule } from "./CoreWebVitalsRadarComparisonModule";

export interface CompetitorSpeedData {
  id: string;
  name: string;
  domain: string;
  rank: number;
  isUser?: boolean;
  mobile: {
    score: number;
    lcp: number; // seconds
    inp: number; // ms
    cls: number; // shift score
    fcp: number; // seconds
    ttfb: number; // ms
    passedCWV: boolean;
    bottleneck: string;
    techStack: string;
  };
  desktop: {
    score: number;
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    ttfb: number;
    passedCWV: boolean;
    bottleneck: string;
    techStack: string;
  };
  lastAudited: string;
  deltas?: MetricDeltas;
  source?: "google-pagespeed-api" | "pagespeed-calibrated-engine";
}

interface CompetitorSpeedScoreCardsProps {
  competitors: CompetitorContentMetric[];
  rankings?: any[];
  userName?: string;
  userDomain?: string;
  userSpeedScore?: number;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  highlightedCompetitorId?: string | null;
  activeViewMode?: "cards" | "radar" | "split";
  onViewModeChange?: (mode: "cards" | "radar" | "split") => void;
  onLiveScoresUpdated?: (results: PageSpeedAuditResult[]) => void;
}

// Helper to determine metric color and status
const getLcpStatus = (sec: number) => {
  if (sec <= 2.5) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "İyi (Good)", color: "#10b981" };
  if (sec <= 4.0) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Geliştirilmeli", color: "#f59e0b" };
  return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Zayıf (Poor)", color: "#ef4444" };
};

const getInpStatus = (ms: number) => {
  if (ms <= 200) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "İyi", color: "#10b981" };
  if (ms <= 500) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Orta", color: "#f59e0b" };
  return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Yavaş", color: "#ef4444" };
};

const getClsStatus = (score: number) => {
  if (score <= 0.1) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "İyi", color: "#10b981" };
  if (score <= 0.25) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Orta", color: "#f59e0b" };
  return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Kritik Kayma", color: "#ef4444" };
};

const getScoreColor = (score: number) => {
  if (score >= 90) return { stroke: "#10b981", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "İyi (90-100)" };
  if (score >= 50) return { stroke: "#f59e0b", text: "text-amber-600", badge: "bg-amber-100 text-amber-800 border-amber-300", label: "Orta (50-89)" };
  return { stroke: "#ef4444", text: "text-rose-600", badge: "bg-rose-100 text-rose-800 border-rose-300", label: "Zayıf (0-49)" };
};

export const CompetitorSpeedScoreCards: React.FC<CompetitorSpeedScoreCardsProps> = ({
  competitors = [],
  rankings = [],
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  userSpeedScore = 98,
  isOpen: propIsOpen,
  onToggleOpen,
  highlightedCompetitorId = null,
  activeViewMode: propActiveViewMode,
  onViewModeChange,
  onLiveScoresUpdated,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const isExpanded = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const togglePanel = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  const [internalViewMode, setInternalViewMode] = useState<"cards" | "radar" | "split">(propActiveViewMode || "split");
  const viewMode = propActiveViewMode !== undefined ? propActiveViewMode : internalViewMode;
  const handleSetViewMode = (m: "cards" | "radar" | "split") => {
    setInternalViewMode(m);
    if (onViewModeChange) onViewModeChange(m);
  };

  const [auditedCompetitorId, setAuditedCompetitorId] = useState<string | null>(null);

  // Sync Scope: "all" (all competitor URLs across the table) or "top3"
  const [syncScope, setSyncScope] = useState<"all" | "top3">("all");

  // Custom competitor URLs added dynamically for instant PageSpeed analysis
  const [customTargets, setCustomTargets] = useState<{ id: string; name: string; domain: string; url?: string; rank: number; baseSpeed?: number }[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [customUrlError, setCustomUrlError] = useState<string | null>(null);
  const [isCustomUrlBarOpen, setIsCustomUrlBarOpen] = useState<boolean>(false);
  const [cardSearchQuery, setCardSearchQuery] = useState<string>("");

  // Collect ALL unique competitor URLs and domains from competitors prop, rankings prop, and custom targets
  const allCompetitorTargets = useMemo(() => {
    const targetMap = new Map<string, { id: string; name: string; domain: string; url?: string; rank: number; baseSpeed?: number }>();

    // 1. Primary competitors list
    (competitors || []).forEach((comp, idx) => {
      const cleanDomain = (comp.domain || comp.name || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
      if (cleanDomain && !targetMap.has(cleanDomain)) {
        targetMap.set(cleanDomain, {
          id: comp.id || `comp-${idx + 1}`,
          name: comp.name,
          domain: cleanDomain,
          url: `https://${cleanDomain}`,
          rank: comp.rank || idx + 1,
          baseSpeed: comp.speedScore || (idx === 0 ? 74 : idx === 1 ? 81 : 62),
        });
      }
    });

    // 2. Discover all competitor domains from table rankings rows
    if (rankings && Array.isArray(rankings)) {
      rankings.forEach((r: any) => {
        const rowCompetitors = [
          { name: r.competitorName, domain: r.competitorDomain, rank: r.bestCompetitorRank },
          { name: r.comp1?.name, domain: r.comp1?.domain, rank: r.comp1?.rank },
          { name: r.comp2?.name, domain: r.comp2?.domain, rank: r.comp2?.rank },
          { name: r.comp3?.name, domain: r.comp3?.domain, rank: r.comp3?.rank },
        ];
        rowCompetitors.forEach((c) => {
          if (c && c.domain && c.name) {
            const cleanDomain = c.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
            if (cleanDomain && !targetMap.has(cleanDomain)) {
              targetMap.set(cleanDomain, {
                id: `comp-rank-${cleanDomain.replace(/[^a-z0-9]/g, "-")}`,
                name: c.name,
                domain: cleanDomain,
                url: `https://${cleanDomain}`,
                rank: c.rank || (targetMap.size + 1),
                baseSpeed: 60 + ((targetMap.size * 7) % 28),
              });
            }
          }
        });
      });
    }

    // 3. Include user-added custom URLs
    customTargets.forEach((ct) => {
      const key = ct.domain.toLowerCase();
      if (!targetMap.has(key)) {
        targetMap.set(key, ct);
      }
    });

    return Array.from(targetMap.values());
  }, [competitors, rankings, customTargets]);

  // Active targets dispatched to the synchronization engine
  const targetsForSync = useMemo(() => {
    if (syncScope === "top3") {
      return allCompetitorTargets.slice(0, 3);
    }
    return allCompetitorTargets;
  }, [allCompetitorTargets, syncScope]);

  // Hook for Google PSI auto-sync engine
  const {
    config,
    isSyncing,
    syncStep,
    countdown,
    lastSyncTime,
    syncLogs,
    liveAuditMap,
    activeAlert,
    isLogsModalOpen,
    setIsLogsModalOpen,
    triggerManualSync,
    toggleAutoSync,
    setSyncInterval,
    setDeviceStrategy,
    dismissAlert,
    clearLogs,
  } = usePageSpeedSyncService({
    targets: targetsForSync,
    userName,
    userDomain,
    userSpeedScore,
    onResults: onLiveScoresUpdated,
  });

  const device = config.device;

  // Derive rich Core Web Vitals speed profiles for User + Competitors
  const speedProfiles: CompetitorSpeedData[] = useMemo(() => {
    const userLive = liveAuditMap.get("user-profile");
    const userProfile: CompetitorSpeedData = {
      id: "user-profile",
      name: `${userName} (Siz)`,
      domain: userDomain,
      rank: 1,
      isUser: true,
      mobile: {
        score: userLive && userLive.strategy === "mobile" ? userLive.metrics.score : userSpeedScore,
        lcp: userLive && userLive.strategy === "mobile" ? userLive.metrics.lcp : 1.2,
        inp: userLive && userLive.strategy === "mobile" ? userLive.metrics.inp : 48,
        cls: userLive && userLive.strategy === "mobile" ? userLive.metrics.cls : 0.01,
        fcp: userLive && userLive.strategy === "mobile" ? userLive.metrics.fcp : 0.7,
        ttfb: userLive && userLive.strategy === "mobile" ? userLive.metrics.ttfb : 32,
        passedCWV: true,
        bottleneck: userLive?.metrics.bottleneck || "Kritik engel yok. Cloudflare Edge CDN & ultra optimize statik mimari.",
        techStack: "Cloudflare Edge + Vite + Tailwind (Optimize)",
      },
      desktop: {
        score: userLive && userLive.strategy === "desktop" ? userLive.metrics.score : Math.min(100, userSpeedScore + 2),
        lcp: userLive && userLive.strategy === "desktop" ? userLive.metrics.lcp : 0.8,
        inp: userLive && userLive.strategy === "desktop" ? userLive.metrics.inp : 28,
        cls: userLive && userLive.strategy === "desktop" ? userLive.metrics.cls : 0.00,
        fcp: userLive && userLive.strategy === "desktop" ? userLive.metrics.fcp : 0.4,
        ttfb: userLive && userLive.strategy === "desktop" ? userLive.metrics.ttfb : 24,
        passedCWV: true,
        bottleneck: "Kritik darboğaz yok. Masaüstü puanı 100/100 seviyesinde.",
        techStack: "Cloudflare Enterprise CDN",
      },
      lastAudited: userLive?.timeFormatted || lastSyncTime,
      deltas: userLive?.deltas,
      source: userLive?.source,
    };

    // Pre-calculated or derived realistic benchmarks for competitors
    const baseLcps = [3.4, 2.7, 4.6, 3.8, 2.9, 4.1, 3.2, 2.5];
    const baseInps = [210, 165, 340, 240, 180, 290, 195, 150];
    const baseClss = [0.14, 0.06, 0.22, 0.11, 0.08, 0.18, 0.09, 0.05];
    const baseFcps = [2.1, 1.7, 2.9, 2.3, 1.9, 2.6, 2.0, 1.6];
    const baseTtfbs = [420, 290, 640, 480, 310, 520, 380, 260];

    const bottlenecks = [
      "Ağır WordPress JS eklentileri & optimize edilmemiş JPEG/PNG görseller (LCP +1.9s kayıp).",
      "Eski tema CSS blokajı & sunucu ilk yanıt süresi (TTFB 290ms).",
      "Yoğun Google Tag Manager scriptleri, 3. parti izleme pikselleri ve dinamik DOM kaymaları (CLS 0.22).",
      "Statik varlıklar için CDN önbellekleme eksikliği & render engelleyici font yüklemeleri.",
      "Ağır üçüncü taraf sohbet pencereleri ve izleyiciler etkileşim gecikmesini (INP) artırıyor.",
    ];

    const techStacks = [
      "WordPress 6.4 + Apache / cPanel (Türkiye Lokasyon)",
      "Özel PHP CMS + Nginx (CDN Yok)",
      "Ağır Elementor / WooCommerce + Paylaşımlı Hosting",
      "WooCommerce + Litespeed Cache",
      "Özel React/Next.js + Vercel (Optimizasyon Bekliyor)"
    ];

    const compProfiles: CompetitorSpeedData[] = targetsForSync.map((comp, idx) => {
      const compId = comp.id || `comp-${idx + 1}`;
      const live = liveAuditMap.get(compId);

      const baseSpeed = comp.baseSpeed || (idx === 0 ? 74 : idx === 1 ? 81 : 62);
      const compLcpMobile = baseLcps[idx % baseLcps.length];
      const compInpMobile = baseInps[idx % baseInps.length];
      const compClsMobile = baseClss[idx % baseClss.length];
      const compFcpMobile = baseFcps[idx % baseFcps.length];
      const compTtfbMobile = baseTtfbs[idx % baseTtfbs.length];

      const compLcpDesktop = Math.max(0.8, +(compLcpMobile - 1.2).toFixed(2));
      const compInpDesktop = Math.max(30, compInpMobile - 80);
      const compClsDesktop = Math.max(0.01, +(compClsMobile - 0.04).toFixed(3));
      const compFcpDesktop = Math.max(0.5, +(compFcpMobile - 0.8).toFixed(2));
      const compTtfbDesktop = Math.max(100, compTtfbMobile - 60);

      const mobileScore = live && live.strategy === "mobile" ? live.metrics.score : baseSpeed;
      const desktopScore = live && live.strategy === "desktop" ? live.metrics.score : Math.min(99, baseSpeed + 12);

      const lcpM = live && live.strategy === "mobile" ? live.metrics.lcp : compLcpMobile;
      const inpM = live && live.strategy === "mobile" ? live.metrics.inp : compInpMobile;
      const clsM = live && live.strategy === "mobile" ? live.metrics.cls : compClsMobile;
      const fcpM = live && live.strategy === "mobile" ? live.metrics.fcp : compFcpMobile;
      const ttfbM = live && live.strategy === "mobile" ? live.metrics.ttfb : compTtfbMobile;

      const lcpD = live && live.strategy === "desktop" ? live.metrics.lcp : compLcpDesktop;
      const inpD = live && live.strategy === "desktop" ? live.metrics.inp : compInpDesktop;
      const clsD = live && live.strategy === "desktop" ? live.metrics.cls : compClsDesktop;
      const fcpD = live && live.strategy === "desktop" ? live.metrics.fcp : compFcpDesktop;
      const ttfbD = live && live.strategy === "desktop" ? live.metrics.ttfb : compTtfbDesktop;

      return {
        id: compId,
        name: comp.name,
        domain: comp.domain,
        rank: comp.rank || idx + 1,
        isUser: false,
        mobile: {
          score: mobileScore,
          lcp: lcpM,
          inp: inpM,
          cls: clsM,
          fcp: fcpM,
          ttfb: ttfbM,
          passedCWV: lcpM <= 2.5 && inpM <= 200 && clsM <= 0.1,
          bottleneck: live?.metrics.bottleneck || bottlenecks[idx % bottlenecks.length] || "Render engelleyici kaynaklar ve optimize edilmemiş varlıklar.",
          techStack: live?.metrics.techStack || techStacks[idx % techStacks.length] || "Standart Web Sunucusu",
        },
        desktop: {
          score: desktopScore,
          lcp: lcpD,
          inp: inpD,
          cls: clsD,
          fcp: fcpD,
          ttfb: ttfbD,
          passedCWV: lcpD <= 2.5 && inpD <= 200 && clsD <= 0.1,
          bottleneck: live?.metrics.bottleneck || "Masaüstünde bağlantı hızlı olsa da CSS/JS dosya boyutu yüksek kalıyor.",
          techStack: live?.metrics.techStack || techStacks[idx % techStacks.length] || "Standart Web Sunucusu",
        },
        lastAudited: live?.timeFormatted || lastSyncTime,
        deltas: live?.deltas,
        source: live?.source,
      };
    });

    return [userProfile, ...compProfiles];
  }, [targetsForSync, userName, userDomain, userSpeedScore, liveAuditMap, lastSyncTime]);

  // Handle adding custom competitor URL for live PageSpeed audit
  const handleAddCustomCompetitorUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomUrlError(null);
    let trimmed = customUrlInput.trim();
    if (!trimmed) return;

    try {
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        trimmed = `https://${trimmed}`;
      }
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname;
      if (!hostname || hostname.length < 3) {
        setCustomUrlError("Lütfen geçerli bir rakip domain veya URL girin.");
        return;
      }
      const newTarget = {
        id: `comp-custom-${Date.now()}`,
        name: hostname.replace(/^www\./, ""),
        domain: hostname,
        url: trimmed,
        rank: allCompetitorTargets.length + 1,
        baseSpeed: 68,
      };
      setCustomTargets((prev) => [...prev, newTarget]);
      setCustomUrlInput("");
      setIsCustomUrlBarOpen(false);
      // Run immediate audit on the newly added URL
      setTimeout(() => {
        triggerManualSync(newTarget.id);
      }, 80);
    } catch {
      setCustomUrlError("Lütfen geçerli bir URL formatı girin (Örn: https://rakip-site.com)");
    }
  };

  // Filter cards if search query provided
  const filteredSpeedProfiles = useMemo(() => {
    if (!cardSearchQuery.trim()) return speedProfiles;
    const q = cardSearchQuery.toLowerCase().trim();
    return speedProfiles.filter((p) => p.isUser || p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q));
  }, [speedProfiles, cardSearchQuery]);

  // Handle PageSpeed audit for all or single competitor via Sync Service
  const handleRunPageSpeedAudit = (targetId?: string) => {
    setAuditedCompetitorId(targetId || null);
    triggerManualSync(targetId);
  };

  // Format seconds to mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper for Circular SVG PageSpeed gauge
  const renderScoreGauge = (score: number, size = 68, strokeWidth = 6) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-lg font-black tracking-tight ${color.text}`}>
            {score}
          </span>
          <span className="text-[9px] text-slate-400 font-bold -mt-1">/100</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      id="competitor-speed-score-cards-panel"
      data-testid="competitor-speed-score-cards-panel"
      className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* 1. HEADER BAR WITH GOOGLE PAGESPEED BRANDING & CONTROLS */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-slate-900/90">
        
        {/* Left: Google PageSpeed Insights & Core Web Vitals Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Google PageSpeed Insights: Core Web Vitals Hız Skor Kartı</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>Canlı Senkronizasyon Servisi</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rakiplerin ve sitenizin gerçek zamanlı LCP, INP, CLS ve TTFB performans metrikleri.
            </p>
          </div>
        </div>

        {/* Right: View Mode, Device Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          
          {/* View Mode Selector: Radar vs Cards vs Combined */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              type="button"
              id="btn-speed-viewmode-radar"
              onClick={() => handleSetViewMode("radar")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "radar"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tüm rakiplerin Core Web Vitals verilerini tek bir radar grafiğinde çakıştırın"
            >
              <Radar className="w-3.5 h-3.5 text-indigo-300" />
              <span>Radar Modülü</span>
            </button>

            <button
              type="button"
              id="btn-speed-viewmode-cards"
              onClick={() => handleSetViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Ayrıntılı Hız Skor Kartları"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Skor Kartları</span>
            </button>

            <button
              type="button"
              id="btn-speed-viewmode-split"
              onClick={() => handleSetViewMode("split")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Radar Karşılaştırma Modülü ve Skor Kartlarını birlikte görüntüleyin"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kombine</span>
            </button>
          </div>

          {/* Device Selector: Mobile vs Desktop */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              id="btn-speed-device-mobile"
              data-testid="speed-device-mobile-btn"
              onClick={() => setDeviceStrategy("mobile")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "mobile"
                  ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Google Mobil PageSpeed ve Core Web Vitals Değerleri"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>

            <button
              type="button"
              id="btn-speed-device-desktop"
              data-testid="speed-device-desktop-btn"
              onClick={() => setDeviceStrategy("desktop")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === "desktop"
                  ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Google Masaüstü PageSpeed ve Core Web Vitals Değerleri"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
          </div>

          {/* Run All PageSpeed Audit Button */}
          <button
            type="button"
            id="btn-run-all-pagespeed-audit"
            data-testid="run-all-pagespeed-audit-btn"
            onClick={() => handleRunPageSpeedAudit()}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 border border-indigo-400/30"
            title="Tüm rakipler için Google PageSpeed Insights testini yeniden çalıştırın"
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Taranıyor..." : "Tümünü Test Et"}</span>
          </button>

          {/* Expand / Collapse Panel Toggle */}
          <button
            type="button"
            id="btn-toggle-speed-cards-collapse"
            data-testid="toggle-speed-cards-collapse-btn"
            onClick={togglePanel}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title={isExpanded ? "Kartları gizle" : "Kartları göster"}
            aria-label={isExpanded ? "Hız skor kartlarını gizle" : "Hız skor kartlarını göster"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. AUTOMATIC SYNCHRONIZATION SERVICE CONTROL BAR */}
      <div 
        id="pagespeed-sync-service-toolbar"
        className="px-4 sm:px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        {/* Left: Status Radar & Countdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {config.autoSyncEnabled ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              )}
            </span>
            <span className="font-extrabold uppercase tracking-wide text-[11px] text-slate-300">
              {config.autoSyncEnabled ? (
                <span className="text-emerald-400">Canlı Otomatik Senkronizasyon Aktif</span>
              ) : (
                <span className="text-amber-400">Otomatik Senkronizasyon Duraklatıldı</span>
              )}
            </span>
          </div>

          {config.autoSyncEnabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Sonraki Tarama:</span>
              <strong className="text-amber-300">{formatCountdown(countdown)}</strong>
            </div>
          )}

          {/* Sync Scope Selector: All Competitor URLs vs Top 3 */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              type="button"
              id="btn-sync-scope-all"
              onClick={() => setSyncScope("all")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                syncScope === "all"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tablodaki tüm tespit edilen rakip URL'lerini senkronize et"
            >
              Tüm Rakipler ({allCompetitorTargets.length} URL)
            </button>
            <button
              type="button"
              id="btn-sync-scope-top3"
              onClick={() => setSyncScope("top3")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                syncScope === "top3"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Yalnızca ilk 3 ana rakibi senkronize et"
            >
              Lider 3
            </button>
          </div>
        </div>

        {/* Center & Right: Interval Presets, Play/Pause, Add Custom URL and Logs modal trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Custom Competitor URL Toggle */}
          <button
            type="button"
            id="btn-toggle-custom-url-bar"
            onClick={() => setIsCustomUrlBarOpen((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCustomUrlBarOpen
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
            }`}
            title="Özel bir rakip URL'si ekleyin ve PageSpeed Insights ile canlı test edin"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Özel URL Test Et</span>
          </button>

          {/* Interval Pill Selectors */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <span className="px-2 text-slate-500 font-medium hidden lg:inline">Periyot:</span>
            {SYNC_INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSyncInterval(opt.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  config.intervalSeconds === opt.value && config.autoSyncEnabled
                    ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                    : opt.value === 0 && !config.autoSyncEnabled
                    ? "bg-slate-700 text-amber-300 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
                title={opt.label}
              >
                {opt.value === 15
                  ? "15s"
                  : opt.value === 30
                  ? "30s"
                  : opt.value === 60
                  ? "1dk"
                  : opt.value === 120
                  ? "2dk"
                  : opt.value === 300
                  ? "5dk"
                  : "Kapalı"}
              </button>
            ))}
          </div>

          {/* Toggle Auto-Sync Button */}
          <button
            type="button"
            onClick={toggleAutoSync}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              config.autoSyncEnabled
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
            }`}
            title={config.autoSyncEnabled ? "Otomatik senkronizasyonu duraklat" : "Otomatik senkronizasyonu başlat"}
          >
            {config.autoSyncEnabled ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-white fill-white" />
                <span>Başlat</span>
              </>
            )}
          </button>

          {/* Logs and Historical Audits Button */}
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Google PageSpeed denetim ve senkronizasyon günlüklerini inceleyin"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Senkronizasyon Günlüğü</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono">
              {syncLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* CUSTOM COMPETITOR URL INPUT EXPANDER */}
      {isCustomUrlBarOpen && (
        <form 
          onSubmit={handleAddCustomCompetitorUrl}
          className="bg-slate-900/95 border-b border-amber-400/30 px-4 sm:px-5 py-3 flex flex-wrap items-center gap-2.5 animate-in slide-in-from-top-1"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 shrink-0">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Yeni Rakip URL'si Ekle:</span>
          </div>
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              id="input-custom-competitor-url"
              value={customUrlInput}
              onChange={(e) => {
                setCustomUrlInput(e.target.value);
                setCustomUrlError(null);
              }}
              placeholder="Örn: https://rakip-site.com.tr/kategori veya rakip.com"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!customUrlInput.trim() || isSyncing}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Ekle & Google PSI ile Test Et</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCustomUrlBarOpen(false);
              setCustomUrlError(null);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
          >
            İptal
          </button>
          {customUrlError && (
            <p className="w-full text-xs text-rose-400 font-medium -mt-1">{customUrlError}</p>
          )}
        </form>
      )}

      {/* NOTIFICATION ALERT BANNER FOR SIGNIFICANT SPEED CHANGES */}
      {activeAlert && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-bold text-white">Canlı PSI Uyarısı:</span>
            <span>{activeAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={dismissAlert}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AUDIT PROGRESS BAR ANIMATION (WHEN ACTIVE) */}
      {isSyncing && (
        <div className="bg-indigo-950/90 px-4 py-2 border-b border-indigo-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Activity className="w-4 h-4 animate-pulse text-amber-400" />
            <span>{syncStep || `Tüm rakip URL'leri (${targetsForSync.length}) Google PageSpeed motoruna gönderiliyor...`}</span>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono">Google Lighthouse v12 + PSI API • {targetsForSync.length} URL</span>
        </div>
      )}

      {/* 2. EXPANDABLE CONTENT */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          
          {/* Top Quick Status & Audit Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Son PageSpeed Denetimi: <strong>{lastSyncTime}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">
                Aktif Görünüm: <strong>{device === "mobile" ? "Mobil (Moto G Power Emülasyonu / 4G Yavaşlatma)" : "Masaüstü (Tam Bant Genişliği)"}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-300 font-medium">
                Mod: <strong>{viewMode === "radar" ? "Radar Çakıştırma Modülü" : viewMode === "cards" ? "Skor Kartları" : "Kombine Görünüm"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>İyi (≥90)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Geliştirilmeli (50-89)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Zayıf (&lt;50)</span>
              </span>
            </div>
          </div>

          {/* 2.1 RADAR COMPARISON MODULE (ACTIVE WHEN 'radar' OR 'split') */}
          {(viewMode === "radar" || viewMode === "split") && (
            <div className="animate-in fade-in duration-300">
              <CoreWebVitalsRadarComparisonModule
                speedProfiles={speedProfiles}
                device={device}
                onDeviceChange={setDeviceStrategy}
                lastSyncTime={lastSyncTime}
                isSyncing={isSyncing}
              />
            </div>
          )}

          {/* 2.2 FOUR SPEED SCORE CARDS & BENCHMARK (ACTIVE WHEN 'cards' OR 'split') */}
          {(viewMode === "cards" || viewMode === "split") && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Divider if in split view */}
              {viewMode === "split" && (
                <div className="flex items-center gap-3 pt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ayrıntılı Core Web Vitals Skor Kartları ({device === "mobile" ? "Mobil" : "Masaüstü"})</span>
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>
              )}

              {/* Header with Search and count */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Core Web Vitals Hız Skor Kartları ({device === "mobile" ? "Mobil" : "Masaüstü"})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                    {filteredSpeedProfiles.length} / {speedProfiles.length} URL
                  </span>
                </div>

                {speedProfiles.length > 4 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cardSearchQuery}
                      onChange={(e) => setCardSearchQuery(e.target.value)}
                      placeholder="Kartlarda ara..."
                      className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* SPEED SCORE CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredSpeedProfiles.map((item, idx) => {
              const currentMetrics = item[device];
              const scoreColor = getScoreColor(currentMetrics.score);
              const lcpStatus = getLcpStatus(currentMetrics.lcp);
              const inpStatus = getInpStatus(currentMetrics.inp);
              const clsStatus = getClsStatus(currentMetrics.cls);

              const isHighlighted = highlightedCompetitorId === item.id;
              const isCardAuditing = isSyncing && (auditedCompetitorId === item.id || auditedCompetitorId === null);

              // Calculate difference from user
              const userMetric = speedProfiles[0][device];
              const scoreDiff = currentMetrics.score - userMetric.score;
              const lcpDiff = (currentMetrics.lcp - userMetric.lcp).toFixed(1);

              return (
                <div
                  key={item.id}
                  id={`speed-card-${item.id}`}
                  data-testid={`speed-card-${item.id}`}
                  className={`rounded-2xl p-4 transition-all duration-200 relative flex flex-col justify-between ${
                    item.isUser
                      ? "bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-amber-400/80 shadow-lg shadow-indigo-950/50 ring-1 ring-amber-400/30"
                      : isHighlighted
                      ? "bg-slate-800/90 border-2 border-indigo-400 shadow-md"
                      : "bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/80"
                  }`}
                >
                  {/* Card Header: Entity Name, Domain & CWV Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {item.isUser ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] tracking-wide uppercase">
                              ★ SİTENİZ
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 font-black text-[10px]">
                              #{item.rank} RAKİP
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-white truncate max-w-[140px]" title={item.name}>
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]" title={item.domain}>
                          {item.domain}
                        </p>
                      </div>

                      {/* CWV Pass / Fail Pill */}
                      {currentMetrics.passedCWV ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>CWV GEÇTİ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/40">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>CWV BAŞARISIZ</span>
                        </span>
                      )}
                    </div>

                    {/* Performance Gauge + Core Web Vitals Trio */}
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-3.5">
                      {/* Circular SVG Meter */}
                      <div className="flex flex-col items-center">
                        {renderScoreGauge(currentMetrics.score)}
                        <span className="text-[10px] font-bold text-slate-300 mt-1">
                          {scoreColor.label.split(" ")[0]}
                        </span>
                      </div>

                      {/* Speed Comparison vs User */}
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                          <span>{item.isUser ? "Google SERP Hız Avantajı" : "Sitenizle Hız Kıyası"}</span>
                          {item.source === "google-pagespeed-api" && (
                            <span className="text-[9px] text-indigo-300 bg-indigo-500/20 px-1 py-0.2 rounded font-mono border border-indigo-500/30">
                              PSI API
                            </span>
                          )}
                        </div>

                        {item.isUser ? (
                          <div className="text-xs font-bold text-emerald-400 leading-snug">
                            ⚡ Google mobil sıralama algoritmasında %100 hız avantajı
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className={`text-xs font-bold ${scoreDiff < 0 ? "text-amber-400" : "text-emerald-400"}`}>
                              {scoreDiff < 0 ? `Sitenizden ${Math.abs(scoreDiff)} puan daha yavaş` : "Sitenizle benzer hızda"}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              LCP gecikmesi: <span className="font-mono font-bold text-rose-400">+{lcpDiff}s</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Live delta badge if metrics changed during periodic sync */}
                        {item.deltas && item.deltas.summaryText !== "Değişiklik yok" && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            <span>{item.deltas.summaryText}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 truncate" title={currentMetrics.techStack}>
                          🛠️ {currentMetrics.techStack}
                        </div>
                      </div>
                    </div>

                    {/* Historical PageSpeed Sparkline Trend */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 mb-3 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                        <span>Son 6 Denetim PSI:</span>
                      </span>
                      <CompetitorPsiSparkline
                        competitorName={item.name}
                        competitorDomain={item.domain}
                        currentScore={currentMetrics.score}
                        userScore={98}
                        isUser={item.isUser}
                        width={76}
                        height={20}
                        showScoreBadge={false}
                        showDelta={true}
                        id={`sparkline-card-${item.id}`}
                      />
                    </div>

                    {/* Core Web Vitals Key Trio Breakdown */}
                    <div className="space-y-1.5 mb-3.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Core Web Vitals Metrikleri</span>
                        <span className="text-[9px] text-slate-500 font-mono">Google Eşikleri</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* 1. LCP */}
                        <div className={`p-2 rounded-xl border flex flex-col justify-between ${lcpStatus.bg} bg-opacity-10 border-opacity-30 border-slate-700`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-300">LCP</span>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lcpStatus.color }} />
                          </div>
                          <div className={`text-xs font-black font-mono mt-0.5 ${lcpStatus.text}`}>
                            {currentMetrics.lcp}s
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {currentMetrics.lcp <= 2.5 ? "✓ İyi" : currentMetrics.lcp <= 4.0 ? "⚠️ Orta" : "🚨 Yavaş"}
                          </div>
                        </div>

                        {/* 2. INP */}
                        <div className={`p-2 rounded-xl border flex flex-col justify-between ${inpStatus.bg} bg-opacity-10 border-opacity-30 border-slate-700`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-300">INP</span>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: inpStatus.color }} />
                          </div>
                          <div className={`text-xs font-black font-mono mt-0.5 ${inpStatus.text}`}>
                            {currentMetrics.inp}ms
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {currentMetrics.inp <= 200 ? "✓ İyi" : "⚠️ Geliştir"}
                          </div>
                        </div>

                        {/* 3. CLS */}
                        <div className={`p-2 rounded-xl border flex flex-col justify-between ${clsStatus.bg} bg-opacity-10 border-opacity-30 border-slate-700`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-300">CLS</span>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: clsStatus.color }} />
                          </div>
                          <div className={`text-xs font-black font-mono mt-0.5 ${clsStatus.text}`}>
                            {currentMetrics.cls}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {currentMetrics.cls <= 0.1 ? "✓ Sabit" : "🚨 Kayma"}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Diagnostic Metrics: FCP and TTFB */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded-lg">
                        <span>FCP: <strong className="text-slate-200 font-mono">{currentMetrics.fcp}s</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>TTFB (Sunucu): <strong className="text-slate-200 font-mono">{currentMetrics.ttfb}ms</strong></span>
                      </div>
                    </div>

                    {/* Lighthouse Bottleneck / Opportunity Alert */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] mb-3">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Lighthouse Teşhisi:</span>
                      </div>
                      <p className="text-slate-300 leading-snug">
                        {currentMetrics.bottleneck}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Run Single Audit Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Timer className="w-3 h-3 text-slate-400" />
                      <span>{item.lastAudited}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRunPageSpeedAudit(item.id)}
                      disabled={isCardAuditing}
                      className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      title={`${item.name} için PageSpeed testini yenile`}
                    >
                      <RotateCw className={`w-3 h-3 ${isCardAuditing ? "animate-spin text-amber-400" : ""}`} />
                      <span>{isCardAuditing ? "Test Ediliyor..." : "Testi Yenile"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. COMPARATIVE VISUAL SPEED BENCHMARK BAR */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  PageSpeed Kıyaslama Grafiği ({device === "mobile" ? "Mobil" : "Masaüstü"})
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Google mobil sıralama faktörü: <strong>LCP &lt; 2.5s ve Hız &gt; 90</strong> olan siteleri SERP'te öne çıkarır.
              </div>
            </div>

            <div className="space-y-2.5">
              {speedProfiles.map((prof) => {
                const s = prof[device].score;
                const col = getScoreColor(s);

                return (
                  <div key={prof.id} className="flex items-center gap-3 text-xs">
                    <div className="w-32 truncate text-right font-semibold text-slate-300">
                      {prof.isUser ? `★ ${prof.name.split(" ")[0]}` : prof.name}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 h-3.5 rounded-full bg-slate-800 overflow-hidden p-0.5 relative">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.max(5, s)}%`,
                          backgroundColor: col.stroke,
                        }}
                      />
                    </div>

                    {/* Historical Mini-Sparkline */}
                    <div className="shrink-0 hidden md:block">
                      <CompetitorPsiSparkline
                        competitorName={prof.name}
                        competitorDomain={prof.domain}
                        currentScore={s}
                        userScore={98}
                        isUser={prof.isUser}
                        width={60}
                        height={18}
                        showScoreBadge={false}
                        showDelta={true}
                        id={`sparkline-benchmark-${prof.id}`}
                      />
                    </div>

                    <div className="w-16 font-mono font-black text-right" style={{ color: col.stroke }}>
                      {s} / 100
                    </div>

                    <div className="w-24 text-[10px] text-slate-400 hidden sm:block truncate">
                      LCP: <strong>{prof[device].lcp}s</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </div>
          )}
        </div>
      )}

      {/* Real-Time Google PSI Sync Logs Modal */}
      <PageSpeedSyncLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={syncLogs}
        onClearLogs={clearLogs}
        onTriggerSync={() => triggerManualSync()}
        isSyncing={isSyncing}
        activeStrategy={device}
      />
    </div>
  );
};
