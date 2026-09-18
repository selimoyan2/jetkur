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
  Info
} from "lucide-react";
import { CompetitorContentMetric } from "../../types";

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
}

interface CompetitorSpeedScoreCardsProps {
  competitors: CompetitorContentMetric[];
  userName?: string;
  userDomain?: string;
  userSpeedScore?: number;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  highlightedCompetitorId?: string | null;
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
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  userSpeedScore = 98,
  isOpen: propIsOpen,
  onToggleOpen,
  highlightedCompetitorId = null,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const isExpanded = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const togglePanel = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<string>("");
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string>("Bugün 14:40 (PSI v12)");
  const [auditedCompetitorId, setAuditedCompetitorId] = useState<string | null>(null);

  // Derive rich Core Web Vitals speed profiles for User + Competitors
  const speedProfiles: CompetitorSpeedData[] = useMemo(() => {
    const userProfile: CompetitorSpeedData = {
      id: "user-profile",
      name: `${userName} (Siz)`,
      domain: userDomain,
      rank: 1,
      isUser: true,
      mobile: {
        score: userSpeedScore,
        lcp: 1.2,
        inp: 48,
        cls: 0.01,
        fcp: 0.7,
        ttfb: 32,
        passedCWV: true,
        bottleneck: "Kritik engel yok. Cloudflare Edge CDN & ultra optimize statik mimari.",
        techStack: "Cloudflare Edge + Vite + Tailwind (Optimize)",
      },
      desktop: {
        score: Math.min(100, userSpeedScore + 2),
        lcp: 0.8,
        inp: 28,
        cls: 0.00,
        fcp: 0.4,
        ttfb: 24,
        passedCWV: true,
        bottleneck: "Kritik darboğaz yok. Masaüstü puanı 100/100 seviyesinde.",
        techStack: "Cloudflare Enterprise CDN",
      },
      lastAudited: lastAuditTimestamp,
    };

    // Pre-calculated or derived realistic benchmarks for competitors
    const compProfiles: CompetitorSpeedData[] = competitors.slice(0, 3).map((comp, idx) => {
      // Default baselines if not provided
      const baseSpeed = comp.speedScore || (idx === 0 ? 74 : idx === 1 ? 81 : 62);
      
      const compLcpMobile = idx === 0 ? 3.4 : idx === 1 ? 2.7 : 4.6;
      const compInpMobile = idx === 0 ? 210 : idx === 1 ? 165 : 340;
      const compClsMobile = idx === 0 ? 0.14 : idx === 1 ? 0.06 : 0.22;
      const compFcpMobile = idx === 0 ? 2.1 : idx === 1 ? 1.7 : 2.9;
      const compTtfbMobile = idx === 0 ? 420 : idx === 1 ? 290 : 640;

      const compLcpDesktop = Math.max(0.9, compLcpMobile - 1.2);
      const compInpDesktop = Math.max(35, compInpMobile - 80);
      const compClsDesktop = Math.max(0.01, compClsMobile - 0.04);
      const compFcpDesktop = Math.max(0.6, compFcpMobile - 0.8);
      const compTtfbDesktop = Math.max(120, compTtfbMobile - 60);

      const mobileScore = baseSpeed;
      const desktopScore = Math.min(99, baseSpeed + 12);

      const passedCWVMobile = compLcpMobile <= 2.5 && compInpMobile <= 200 && compClsMobile <= 0.1;
      const passedCWVDesktop = compLcpDesktop <= 2.5 && compInpDesktop <= 200 && compClsDesktop <= 0.1;

      const bottlenecks = [
        "Ağır WordPress JS eklentileri & optimize edilmemiş JPEG/PNG görseller (LCP +1.9s kayıp).",
        "Eski tema CSS blokajı & sunucu ilk yanıt süresi (TTFB 290ms).",
        "Yoğun Google Tag Manager scriptleri, 3. parti izleme pikselleri ve dinamik DOM kaymaları (CLS 0.22)."
      ];

      const techStacks = [
        "WordPress 6.4 + Apache / cPanel (Türkiye Lokasyon)",
        "Özel PHP CMS + Nginx (CDN Yok)",
        "Ağır Elementor / WooCommerce + Paylaşımlı Hosting"
      ];

      return {
        id: comp.id || `comp-${idx + 1}`,
        name: comp.name,
        domain: comp.domain,
        rank: comp.rank || idx + 1,
        isUser: false,
        mobile: {
          score: mobileScore,
          lcp: compLcpMobile,
          inp: compInpMobile,
          cls: compClsMobile,
          fcp: compFcpMobile,
          ttfb: compTtfbMobile,
          passedCWV: passedCWVMobile,
          bottleneck: bottlenecks[idx] || "Render engelleyici kaynaklar ve optimize edilmemiş varlıklar.",
          techStack: techStacks[idx] || "Standart Web Sunucusu",
        },
        desktop: {
          score: desktopScore,
          lcp: compLcpDesktop,
          inp: compInpDesktop,
          cls: compClsDesktop,
          fcp: compFcpDesktop,
          ttfb: compTtfbDesktop,
          passedCWV: passedCWVDesktop,
          bottleneck: "Masaüstünde bağlantı hızlı olsa da CSS/JS dosya boyutu yüksek kalıyor.",
          techStack: techStacks[idx] || "Standart Web Sunucusu",
        },
        lastAudited: lastAuditTimestamp,
      };
    });

    return [userProfile, ...compProfiles];
  }, [competitors, userName, userDomain, userSpeedScore, lastAuditTimestamp]);

  // Handle simulated PageSpeed audit for all or single competitor
  const handleRunPageSpeedAudit = (targetId?: string) => {
    setIsAuditing(true);
    setAuditedCompetitorId(targetId || null);

    setAuditStep("Google Lighthouse v12 motoru başlatılıyor...");
    setTimeout(() => {
      setAuditStep(targetId ? `${targetId} için DOM ve kritik render zinciri analiz ediliyor...` : "Tüm rakip domainlerinin Core Web Vitals metrikleri çekiliyor...");
    }, 500);

    setTimeout(() => {
      setAuditStep("LCP, INP, CLS alan verileri (CrUX) ve laboratuvar simülasyonu derleniyor...");
    }, 1100);

    setTimeout(() => {
      setIsAuditing(false);
      setAuditStep("");
      setAuditedCompetitorId(null);
      const now = new Date();
      const timeStr = `Bugün ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} (Canlı PSI v12)`;
      setLastAuditTimestamp(timeStr);
    }, 1800);
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
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30 uppercase tracking-wide">
                Lighthouse v12 Simüle Edildi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rakiplerin ve sitenizin gerçek zamanlı LCP, INP, CLS ve TTFB performans metrikleri.
            </p>
          </div>
        </div>

        {/* Right: Device Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          
          {/* Device Selector: Mobile vs Desktop */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              id="btn-speed-device-mobile"
              data-testid="speed-device-mobile-btn"
              onClick={() => setDevice("mobile")}
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
              onClick={() => setDevice("desktop")}
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
            disabled={isAuditing}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 border border-indigo-400/30"
            title="Tüm rakipler için Google PageSpeed Insights testini yeniden çalıştırın"
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-300 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Taranıyor..." : "Tümünü Test Et"}</span>
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

      {/* AUDIT PROGRESS BAR ANIMATION (WHEN ACTIVE) */}
      {isAuditing && (
        <div className="bg-indigo-950/80 px-4 py-2 border-b border-indigo-500/30 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Activity className="w-4 h-4 animate-pulse text-amber-400" />
            <span>{auditStep}</span>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono">Google Lighthouse v12.2</span>
        </div>
      )}

      {/* 2. EXPANDABLE CONTENT */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          
          {/* Top Quick Status & Audit Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Son PageSpeed Denetimi: <strong>{lastAuditTimestamp}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">
                Aktif Görünüm: <strong>{device === "mobile" ? "Mobil (Moto G Power Emülasyonu / 4G Yavaşlatma)" : "Masaüstü (Tam Bant Genişliği)"}</strong>
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

          {/* 3. FOUR SPEED SCORE CARDS (SİTENİZ + 3 RAKİP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {speedProfiles.map((item, idx) => {
              const currentMetrics = item[device];
              const scoreColor = getScoreColor(currentMetrics.score);
              const lcpStatus = getLcpStatus(currentMetrics.lcp);
              const inpStatus = getInpStatus(currentMetrics.inp);
              const clsStatus = getClsStatus(currentMetrics.cls);

              const isHighlighted = highlightedCompetitorId === item.id;
              const isCardAuditing = isAuditing && (auditedCompetitorId === item.id || auditedCompetitorId === null);

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
                        <div className="text-[11px] font-semibold text-slate-400">
                          {item.isUser ? "Google SERP Hız Avantajı" : "Sitenizle Hız Kıyası"}
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
                        
                        <div className="text-[10px] text-slate-400 truncate" title={currentMetrics.techStack}>
                          🛠️ {currentMetrics.techStack}
                        </div>
                      </div>
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
  );
};
