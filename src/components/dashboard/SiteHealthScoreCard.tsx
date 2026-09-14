import React, { useState, useMemo } from "react";
import { 
  Gauge, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Flame, 
  Zap, 
  Layers, 
  Search, 
  RefreshCw, 
  Check, 
  TrendingUp, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Wand2
} from "lucide-react";
import { SiteConfig } from "../../types";
import { 
  calculateSiteHealthScore, 
  applySiteHealthFix, 
  applyFixAllSiteHealth,
  ActionableFixItem
} from "../../utils/siteHealthScoreCalculator";

interface SiteHealthScoreCardProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  variant?: "full" | "compact" | "banner";
  className?: string;
}

export const SiteHealthScoreCard: React.FC<SiteHealthScoreCardProps> = ({
  config,
  onChange,
  onNavigateTab,
  variant = "full",
  className = ""
}) => {
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeficientPagesModal, setShowDeficientPagesModal] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

  // Calculate live health score data
  const healthData = useMemo(() => {
    return calculateSiteHealthScore(config);
  }, [config]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplySingleFix = (fix: ActionableFixItem) => {
    if (fix.isResolved || isApplyingFix) return;
    setIsApplyingFix(fix.id);

    setTimeout(() => {
      const result = applySiteHealthFix(fix.id, config);
      onChange?.(result.updatedConfig);
      setIsApplyingFix(null);
      showToast(result.toast);
    }, 450);
  };

  const handleFixAll = () => {
    if (healthData.pendingFixCount === 0 || isApplyingFix) return;
    setIsApplyingFix("all");

    setTimeout(() => {
      const result = applyFixAllSiteHealth(config);
      onChange?.(result.updatedConfig);
      setIsApplyingFix(null);
      showToast(result.toast);
    }, 700);
  };

  // Circular gauge calculations (SVG circumference = 2 * PI * r = 2 * 3.14159 * 42 = ~263.89)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthData.overallScore / 100) * circumference;

  // Grade color scheme
  const getScoreGradient = (score: number) => {
    if (score >= 90) return { stroke: "#10b981", bg: "from-emerald-500 to-teal-600", text: "text-emerald-500" };
    if (score >= 75) return { stroke: "#3b82f6", bg: "from-blue-500 to-indigo-600", text: "text-blue-500" };
    return { stroke: "#f59e0b", bg: "from-amber-500 to-orange-600", text: "text-amber-500" };
  };
  const theme = getScoreGradient(healthData.overallScore);

  // -------------------------------------------------------------
  // COMPACT VARIANT (Used for Dashboard Header Quick-Bar)
  // -------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div 
        id="site-health-score-compact"
        onClick={() => onNavigateTab?.("site-health")}
        className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group ${className}`}
        title="Site Sağlık Skoru Detayları ve Düzeltme Kontrol Listesi"
      >
        <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="transparent"
              stroke={theme.stroke}
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 13}
              strokeDashoffset={(2 * Math.PI * 13) - (healthData.overallScore / 100) * (2 * Math.PI * 13)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-[11px] font-mono font-black text-slate-900">
            {healthData.overallScore}
          </span>
        </div>

        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">Site Sağlık Skoru</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
              healthData.overallScore >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {healthData.grade}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {healthData.pendingFixCount > 0 
              ? `${healthData.pendingFixCount} Düzeltme Mevcut (+${healthData.totalFixablePoints} Puan)`
              : "Tüm Metrikler Optimize"}
          </p>
        </div>

        {healthData.pendingFixCount > 0 && (
          <span className="ml-auto px-2 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] flex items-center gap-1 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3" />
            <span>Onar</span>
          </span>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL EXPANDED DASHBOARD COMPONENT
  // -------------------------------------------------------------
  return (
    <div 
      id="site-health-score-card-main"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all relative ${className}`}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="absolute top-3 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER AREA */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Health Score Radial Dial & Executive Status */}
          <div className="flex items-start sm:items-center gap-5">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90 transform">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke={theme.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Dial Center Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-mono font-black tracking-tight text-white">
                  {healthData.overallScore}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            {/* Score Information & Industry Benchmark */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-mono font-bold tracking-wide uppercase">
                  Agregasyon Skoru
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                  healthData.overallScore >= 90 ? "bg-emerald-500 text-slate-950" : "bg-amber-400 text-slate-950"
                }`}>
                  Not: {healthData.grade}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {healthData.status}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Site Sağlık &amp; SEO Puanı</span>
                {healthData.overallScore >= 95 && (
                  <Award className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                )}
              </h2>

              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                SEO Isı Haritası potansiyeli, H1 ve Meta etiket denetimleri ile 0.02s Cloudflare Edge sayfa hızı metriklerinin konsolide sağlık puanı.
              </p>

              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Sektör Ortalaması: %64</span>
                </span>
                <span>•</span>
                <span className="text-slate-300 font-semibold">
                  HızlıWeb Avantajı: <strong className="text-white">+{Math.max(0, healthData.overallScore - 64)} Puan Önde</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: One-Click "Fix All" Call-To-Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            {healthData.pendingFixCount > 0 ? (
              <button
                type="button"
                id="btn-site-health-fix-all"
                onClick={handleFixAll}
                disabled={isApplyingFix !== null}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isApplyingFix === "all" ? "animate-spin" : "animate-pulse text-slate-950"}`} />
                <span>
                  {isApplyingFix === "all" ? "Tüm Sorunlar Onarılıyor..." : `Tümünü Tek Tıkla Düzelt (+${healthData.totalFixablePoints} Puan)`}
                </span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tüm Sorunlar Çözüldü (%100 Sağlık)</span>
              </div>
            )}

            <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] text-slate-400 font-medium">
              <span>{healthData.pendingFixCount} eylem bekliyor</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{isChecklistExpanded ? "Listeyi Daralt" : "Düzeltme Listesini Gör"}</span>
                {isChecklistExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. THREE PILLARS PROGRESS METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800">
          
          {/* Pillar 1: Meta Tag Audit */}
          <div 
            onClick={() => onNavigateTab?.("site-health")}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800/90 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                <span>1. Meta &amp; H1 Tag Sağlığı</span>
              </div>
              <span className="font-mono font-black text-sky-400 text-xs">
                %{healthData.metaHealth.score}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
              <div 
                className="h-full rounded-full bg-sky-400 transition-all duration-700" 
                style={{ width: `${healthData.metaHealth.score}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {healthData.metaHealth.optimizedPages} / {healthData.metaHealth.totalPages} Sayfa Tamam
              </span>
              {healthData.metaHealth.deficientPages > 0 ? (
                <span className="text-amber-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  {healthData.metaHealth.deficientPages} Eksik
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Eksiksiz
                </span>
              )}
            </div>
          </div>

          {/* Pillar 2: SEO Heatmap Coverage */}
          <div 
            onClick={() => onNavigateTab?.("site-health")}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800/90 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>2. SEO Isı Haritası Kapsamı</span>
              </div>
              <span className="font-mono font-black text-amber-400 text-xs">
                %{healthData.heatmapHealth.score}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
              <div 
                className="h-full rounded-full bg-amber-400 transition-all duration-700" 
                style={{ width: `${healthData.heatmapHealth.score}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {healthData.heatmapHealth.coveredClusters} / {healthData.heatmapHealth.totalClusters} Küme Kapsandı
              </span>
              <span className="text-amber-300 font-mono font-semibold">
                +{healthData.heatmapHealth.potentialMonthlyTrafficGain.toLocaleString()} Ziyaretçi
              </span>
            </div>
          </div>

          {/* Pillar 3: Page Load Speed & Core Web Vitals */}
          <div 
            onClick={() => onNavigateTab?.("site-health")}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800/90 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>3. Sayfa Hızı &amp; Core Web Vitals</span>
              </div>
              <span className="font-mono font-black text-emerald-400 text-xs">
                %{healthData.speedHealth.score}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
              <div 
                className="h-full rounded-full bg-emerald-400 transition-all duration-700" 
                style={{ width: `${healthData.speedHealth.score}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>0.02s Yanıt • LCP: {healthData.speedHealth.lcpSeconds}s</span>
              <span className="text-emerald-400 font-mono font-bold">
                %{healthData.speedHealth.cacheHitRatio} Edge Cache
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIONABLE 'FIX IT' SCORE CHECKLIST & SUMMARY */}
      {isChecklistExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Hızlı Düzeltme &amp; Puan Artırma Kontrol Listesi
                </h3>
                {healthData.pendingFixCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-black">
                    +{healthData.totalFixablePoints} Puan Mevcut
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aşağıdaki eksiklikleri tek tıkla tamamlayarak Google sıralamanızı ve Site Sağlık Skorunuzu anında yükseltin.
              </p>
            </div>

            {/* View Full Panel Links */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateTab?.("site-health")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Detaylı SEO Teşhisi</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Actionable Fix Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {healthData.actionableFixes.map((fix) => {
              const isWorking = isApplyingFix === fix.id || isApplyingFix === "all";

              return (
                <div 
                  key={fix.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3.5 ${
                    fix.isResolved 
                      ? "bg-white/80 border-slate-200/80 opacity-80" 
                      : "bg-white border-amber-200/80 shadow-xs hover:border-amber-400"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {fix.category}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          fix.isResolved 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {fix.badge}
                        </span>
                      </div>

                      {fix.isResolved ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Tamamlandı</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-black">
                          +{fix.gainPoints} Puan
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {fix.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {fix.isResolved ? (fix.resolvedMessage || fix.description) : fix.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 truncate">
                      {fix.impactLabel}
                    </span>

                    {fix.isResolved ? (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aktif &amp; Uyumlu</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        id={`btn-fix-action-${fix.id}`}
                        onClick={() => handleApplySingleFix(fix)}
                        disabled={isWorking}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isWorking ? "animate-spin text-amber-400" : "text-amber-400"}`} />
                        <span>{isWorking ? "Uygulanıyor..." : fix.actionButtonText}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Quick-Action Bar */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Yapılan her optimizasyon <strong>SEO İlerleme Bildirim Sistemi</strong> üzerinden Google sıralama ve ciro takibine anında yansır.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-open-remediation-from-score"
                onClick={() => onNavigateTab?.("site-health")}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>SEO Düzeltme Panelini Aç</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
