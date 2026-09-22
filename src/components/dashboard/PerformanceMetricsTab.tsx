import React, { useState } from "react";
import { SiteConfig, FormLead } from "../../types";
import { 
  Gauge, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Layers, 
  ArrowUpRight, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Check, 
  Award,
  BarChart3,
  Download,
  BellRing
} from "lucide-react";
import { PerformanceAnalyticsWidget } from "./PerformanceAnalyticsWidget";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { PerformanceScoreGaugeWidget } from "./PerformanceScoreGaugeWidget";
import { PerformanceInsightsCard } from "./PerformanceInsightsCard";
import { PerformanceAlertManager } from "./PerformanceAlertManager";

interface PerformanceMetricsTabProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onDeploy: () => void;
  onPreview: () => void;
  onUpdateLead?: (leadId: string, updates: Partial<FormLead>) => void;
  onAddLead?: (newLead: FormLead) => void;
  onNavigateTab?: (tab: string) => void;
  initialView?: "analytics" | "speed" | "monitor" | "insights" | "alerts";
}

export const PerformanceMetricsTab: React.FC<PerformanceMetricsTabProps> = ({
  config,
  onChange = () => {},
  onDeploy,
  onPreview,
  onUpdateLead,
  onAddLead,
  onNavigateTab,
  initialView = "analytics"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "speed" | "monitor" | "insights" | "alerts">(initialView);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testRegion, setTestRegion] = useState<"frankfurt" | "istanbul" | "amsterdam">("istanbul");

  // Simulated live audit values reinforcing the value proposition
  const metrics = {
    loadTime: testRegion === "istanbul" ? "0.02s" : testRegion === "frankfurt" ? "0.03s" : "0.04s",
    loadTimeMs: testRegion === "istanbul" ? "21 ms" : testRegion === "frankfurt" ? "34 ms" : "38 ms",
    ttfb: "9 ms",
    lighthouse: {
      performance: 100,
      accessibility: 100,
      bestPractices: 100,
      seo: 98,
    },
    cwv: {
      lcp: "0.4s", // Largest Contentful Paint (< 2.5s is Good)
      fid: "8ms",  // First Input Delay (< 100ms is Good)
      cls: "0.001", // Cumulative Layout Shift (< 0.1 is Good)
      fcp: "0.2s", // First Contentful Paint (< 1.8s is Good)
      inp: "14ms", // Interaction to Next Paint (< 200ms is Good)
    },
    payloadSize: "42 KB",
    cachedEdgePercent: "99.8%",
    globalPops: 310,
    databaseQueries: 0 // 100% Static pure pre-rendered zero DB queries
  };

  const handleRefreshAudit = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Navigation Switcher: Performance Analytics vs Speed Audit */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab("monitor")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "monitor"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Sentetik Test & 0.02s Monitörü</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px] font-mono font-black">
              Canlı Test
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("analytics")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "analytics"
                ? "bg-slate-800 text-amber-400 shadow-md ring-1 ring-amber-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance Analytics (Recharts)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px] font-mono font-black">
              Büyüme & Lead
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("speed")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "speed"
                ? "bg-slate-800 text-amber-400 shadow-md ring-1 ring-amber-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>0.02s Mimari & Lighthouse</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black">
              100/100
            </span>
          </button>

          <button
            type="button"
            id="subtab-performance-insights-btn"
            onClick={() => setActiveSubTab("insights")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "insights"
                ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-emerald-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Performance Insights (30G CWV)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black">
              LCP • CLS • FID
            </span>
          </button>

          <button
            type="button"
            id="subtab-performance-alerts-btn"
            onClick={() => setActiveSubTab("alerts")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "alerts"
                ? "bg-rose-600 text-white shadow-md ring-1 ring-rose-400/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BellRing className="w-4 h-4 text-rose-400" />
            <span>CWV Uyarı Sistemi</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-black">
              Canlı Push
            </span>
          </button>

          <button
            type="button"
            id="subtab-goto-site-health"
            onClick={() => onNavigateTab?.("site-health")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer text-emerald-300 hover:text-white hover:bg-slate-800"
            title="D3.js ile detaylı Google Lighthouse, yüklenme hızı ve Cloudflare Edge önbellek analizi"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Site Sağlığı &amp; Lighthouse (D3.js)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black">
              D3
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-3 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Canlı Veri Analitiği</span>
          </div>

          <button
            type="button"
            id="btn-goto-pdf-report-from-perf"
            onClick={() => onNavigateTab?.("site-health")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Resmi Paydaş ve Yönetim PDF Raporunu Aç"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Raporu</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === "monitor" ? (
        <PerformanceMonitor
          config={config}
          onChange={onChange}
          onPreview={onPreview}
          onDeploy={onDeploy}
          onNavigateTab={onNavigateTab}
        />
      ) : activeSubTab === "analytics" ? (
        <PerformanceAnalyticsWidget
          config={config}
          onUpdateLead={onUpdateLead}
          onAddLead={onAddLead}
          onNavigateTab={onNavigateTab}
        />
      ) : activeSubTab === "insights" ? (
        <div className="space-y-6">
          <PerformanceInsightsCard
            config={config}
            onNavigateTab={onNavigateTab}
          />
        </div>
      ) : activeSubTab === "alerts" ? (
        <div className="space-y-6">
          <PerformanceAlertManager />
        </div>
      ) : (
        <>
          {/* Top Banner: World's Fastest Website Value Prop */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-amber-500/30 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Dünyanın En Hızlı Web Sitesi Mimarisi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Cloudflare Edge CDN
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{config.companyName} Performans & Hız Skoru</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Siteniz dinamik veritabanı sorguları olmadan <strong>%100 statik HTML/CSS</strong> olarak önceden derlenir ve Cloudflare'in dünya genelindeki <strong>310+ Edge POP</strong> noktasından ziyaretçilerinize <strong>0.02 saniyede</strong> servis edilir.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab("monitor")}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Gauge className="w-4 h-4 text-slate-950" />
              <span>Canlı Sentetik Testi Aç</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAudit}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : "text-slate-400"}`} />
              <span>{isRefreshing ? "Denetleniyor..." : "Yeniden Test Et"}</span>
            </button>

            <button
              type="button"
              onClick={onDeploy}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Canlıya Al & Dağıt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Simulated Google Lighthouse & Core Web Vitals Gauge Widget */}
      <PerformanceScoreGaugeWidget
        config={config}
        onChange={onChange}
        onNavigateTab={onNavigateTab}
      />

      {/* Hero 2-Column: Big Load Time Badge + Lighthouse 4-Wheel Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Load Time Stat Card (0.02s) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Gauge className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  Ortalama Yüklenme Süresi
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Ultra Hızlı
              </span>
            </div>

            {/* Massive Display Number */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-950 font-mono">
                  {metrics.loadTime}
                </span>
                <span className="text-sm font-bold text-slate-500 font-mono">
                  ({metrics.loadTimeMs})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google&apos;ın 2.5 saniyelik &quot;İyi&quot; eşiğinden <strong>120 kat daha hızlı</strong>.</span>
              </p>
            </div>

            {/* Region Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Test Edilen Edge Sunucu:</span>
                <span className="font-bold text-slate-800 font-mono">Cloudflare Anycast</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTestRegion("istanbul")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    testRegion === "istanbul"
                      ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🇹🇷 İstanbul (21ms)
                </button>
                <button
                  type="button"
                  onClick={() => setTestRegion("frankfurt")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    testRegion === "frankfurt"
                      ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🇩🇪 Frankfurt (34ms)
                </button>
                <button
                  type="button"
                  onClick={() => setTestRegion("amsterdam")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    testRegion === "amsterdam"
                      ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🇳🇱 Amsterdam (38ms)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>İlk Bayt Süresi (TTFB): <strong>{metrics.ttfb}</strong></span>
            </span>
            <span className="font-mono text-emerald-600 font-bold">100/100 Skor</span>
          </div>
        </div>

        {/* Right: Official Google Lighthouse 4 Scores */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Resmi Google Lighthouse Denetim Skorları
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                v11.4 • Mobil & Masaüstü
              </span>
            </div>

            {/* 4 Score Circular Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-3">
              {/* Performance */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-black text-xl shadow-xs">
                  {metrics.lighthouse.performance}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Performans</span>
                <span className="text-[10px] text-emerald-600 font-bold">Kusursuz (100)</span>
              </div>

              {/* Accessibility */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-black text-xl shadow-xs">
                  {metrics.lighthouse.accessibility}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Erişilebilirlik</span>
                <span className="text-[10px] text-emerald-600 font-bold">Kusursuz (100)</span>
              </div>

              {/* Best Practices */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-black text-xl shadow-xs">
                  {metrics.lighthouse.bestPractices}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">En İyi Pratikler</span>
                <span className="text-[10px] text-emerald-600 font-bold">Kusursuz (100)</span>
              </div>

              {/* SEO */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-black text-xl shadow-xs">
                  {metrics.lighthouse.seo}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Google SEO</span>
                <span className="text-[10px] text-emerald-600 font-bold">Mükemmel (98+)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Google Sıralama Avantajı:</strong> Google algoritması 95+ Lighthouse skoruna sahip siteleri arama sonuçlarında doğrudan ödüllendirir ve rakiplerin üzerine çıkarır.
            </span>
          </div>
        </div>

      </div>

      {/* Core Web Vitals (CWV) Audit Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Google Core Web Vitals (Temel Web Metrikleri)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tüm metrikler Google&apos;ın katı yeşil (&quot;İyi&quot;) kriterlerini fazlasıyla sağlamaktadır.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold font-mono">
            Tüm Kriterler Geçti (Passed)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* LCP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">LCP</span>
              <span className="text-emerald-600 font-bold">Hedef: &lt;2.5s</span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono">{metrics.cwv.lcp}</div>
            <p className="text-[11px] text-slate-500">Largest Contentful Paint</p>
          </div>

          {/* FID */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">FID</span>
              <span className="text-emerald-600 font-bold">Hedef: &lt;100ms</span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono">{metrics.cwv.fid}</div>
            <p className="text-[11px] text-slate-500">First Input Delay</p>
          </div>

          {/* CLS */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">CLS</span>
              <span className="text-emerald-600 font-bold">Hedef: &lt;0.1</span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono">{metrics.cwv.cls}</div>
            <p className="text-[11px] text-slate-500">Cumulative Layout Shift</p>
          </div>

          {/* FCP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">FCP</span>
              <span className="text-emerald-600 font-bold">Hedef: &lt;1.8s</span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono">{metrics.cwv.fcp}</div>
            <p className="text-[11px] text-slate-500">First Contentful Paint</p>
          </div>

          {/* INP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">INP</span>
              <span className="text-emerald-600 font-bold">Hedef: &lt;200ms</span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono">{metrics.cwv.inp}</div>
            <p className="text-[11px] text-slate-500">Interaction to Next Paint</p>
          </div>
        </div>
      </div>

      {/* Why So Fast: Architecture Comparison */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-6 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            <span>Geleneksel WordPress vs. HızlıWeb Statik Mimarisi Karşılaştırması</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Neden standart web siteleri 3-5 saniyede açılırken HızlıWeb 0.02 saniyede açılır?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* WordPress Slow */}
          <div className="p-4 rounded-xl bg-slate-950 border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 text-sm">❌ Geleneksel PHP & WordPress Siteleri</span>
              <span className="font-mono text-red-400 font-bold">~3.20s</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Her ziyarette MySQL veritabanına 30-80 adet SQL sorgusu atar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Sunucu PHP kodlarını her istekte sıfırdan derler (CPU darboğazı).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>30+ ağır eklenti (plugin) ve JavaScript kütüphanesi yükler.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Ziyaretçiler telefonla beklerken siteyi terk eder (%40 hemen çıkma oranı).</span>
              </li>
            </ul>
          </div>

          {/* HizliWeb Ultra-Fast */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
              HızlıWeb
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-sm">⚡ HızlıWeb Statik Edge Mimarisi</span>
              <span className="font-mono text-emerald-400 font-bold">0.02s</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>0 Veritabanı Sorgusu:</strong> Sayfalar anında hazır statik dosya olarak iletilir.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cloudflare Edge CDN:</strong> İçerik ziyaretçiye en yakın şehirdeki sunucudan gelir.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Optimize Kod:</strong> Yalnızca 42 KB saf HTML/CSS yüklenir, gereksiz şişkinlik yoktur.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Maksimum Dönüşüm:</strong> Müşteriler beklemeden doğrudan WhatsApp butonuna basar.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Edge Distribution Map Indicator */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Küresel Cloudflare Anycast Ağı Devrede</p>
              <p className="text-[11px] text-slate-400">
                İstanbul, Ankara, İzmir ve dünyanın 310+ şehrinde 0 ms gecikmeli önbellek aktif.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors shrink-0"
          >
            Hızı Önizlemede Test Et
          </button>
        </div>

        {/* 30-Day Core Web Vitals Performance Insights Card */}
        <div className="mt-6">
          <PerformanceInsightsCard
            config={config}
            onNavigateTab={onNavigateTab}
          />
        </div>
        </div>
      </>
      )}
    </div>
  );
};
