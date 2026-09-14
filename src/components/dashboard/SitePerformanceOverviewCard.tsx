import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import {
  Activity,
  Users,
  TrendingUp,
  Target,
  Clock,
  Layers,
  Eye,
  RefreshCw,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Globe,
  Radio,
  FileText
} from "lucide-react";

export interface SitePerformanceOverviewCardProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  className?: string;
}

export interface TopPagePerformanceItem {
  id: string;
  name: string;
  path: string;
  category: string;
  pageviews: number;
  percentage: number;
  avgDuration: string;
  conversionRate: number;
  conversionsCount: number;
  bounceRate: number;
  isHighConverter?: boolean;
}

export const SitePerformanceOverviewCard: React.FC<SitePerformanceOverviewCardProps> = ({
  config,
  onNavigateTab,
  className = ""
}) => {
  // Timeframe selector
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d">("today");
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("Şimdi");
  
  // Real-time fluctuating live visitor simulation
  const [liveVisitorCount, setLiveVisitorCount] = useState<number>(14);

  useEffect(() => {
    if (!isLiveActive) return;

    // Subtle realistic fluctuation of live active users
    const interval = setInterval(() => {
      setLiveVisitorCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return Math.max(8, Math.min(26, next));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLiveVisitorCount((prev) => Math.max(9, Math.min(25, prev + Math.floor(Math.random() * 3) - 1)));
      setLastRefreshedAt(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 600);
  };

  // Dynamic calculations based on timeframe and current site configuration
  const metrics = useMemo(() => {
    const multiplier = timeframe === "today" ? 1 : timeframe === "7d" ? 6.8 : 28.5;
    const baseVisitors = 1284;
    const basePageviews = 3420;
    const baseLeads = 62;

    const totalVisitors = Math.round(baseVisitors * multiplier);
    const totalPageviews = Math.round(basePageviews * multiplier);
    const uniqueVisitors = Math.round(totalVisitors * 0.74);
    const totalLeads = Math.round(baseLeads * multiplier);
    const conversionRate = Number(((totalLeads / totalVisitors) * 100).toFixed(2));
    const avgPagesPerSession = Number((totalPageviews / totalVisitors).toFixed(2));
    const avgDuration = timeframe === "today" ? "2dk 45sn" : timeframe === "7d" ? "3dk 04sn" : "2dk 58sn";
    const bounceRate = 27.8; // Low and healthy Core Web Vitals speed benefit

    return {
      totalVisitors,
      totalPageviews,
      uniqueVisitors,
      totalLeads,
      conversionRate,
      avgPagesPerSession,
      avgDuration,
      bounceRate,
      growthRate: "+18.4%",
      leadGrowth: "+24.6%"
    };
  }, [timeframe]);

  // Dynamic top performing pages derived from site configuration
  const topPages: TopPagePerformanceItem[] = useMemo(() => {
    const mainServiceTitle = config.services?.items?.[0]?.title || "Hizmetlerimiz";
    const totalViews = metrics.totalPageviews;

    const pHomeViews = Math.round(totalViews * 0.41);
    const pServiceViews = Math.round(totalViews * 0.25);
    const pContactViews = Math.round(totalViews * 0.14);
    const pGalleryViews = Math.round(totalViews * 0.11);
    const pBlogViews = Math.round(totalViews * 0.09);

    return [
      {
        id: "page-home",
        name: "Ana Sayfa",
        path: "/",
        category: "Açılış Vitrini",
        pageviews: pHomeViews,
        percentage: 41,
        avgDuration: "1dk 55sn",
        conversionRate: 4.2,
        conversionsCount: Math.round(pHomeViews * 0.042),
        bounceRate: 24.2
      },
      {
        id: "page-services",
        name: `${mainServiceTitle}`,
        path: "/hizmetler",
        category: "Hizmetler",
        pageviews: pServiceViews,
        percentage: 25,
        avgDuration: "3dk 12sn",
        conversionRate: 6.8,
        conversionsCount: Math.round(pServiceViews * 0.068),
        bounceRate: 21.5
      },
      {
        id: "page-contact",
        name: "İletişim & Teklif Formu",
        path: "/iletisim",
        category: "Dönüşüm Hunisi",
        pageviews: pContactViews,
        percentage: 14,
        avgDuration: "2dk 40sn",
        conversionRate: 14.6,
        conversionsCount: Math.round(pContactViews * 0.146),
        bounceRate: 18.2,
        isHighConverter: true
      },
      {
        id: "page-gallery",
        name: "Galeri & Projeler",
        path: "/galeri",
        category: "Portfolyo",
        pageviews: pGalleryViews,
        percentage: 11,
        avgDuration: "2dk 20sn",
        conversionRate: 3.6,
        conversionsCount: Math.round(pGalleryViews * 0.036),
        bounceRate: 29.4
      },
      {
        id: "page-blog",
        name: "Blog & Uzman Rehberleri",
        path: "/blog",
        category: "İçerik & SEO",
        pageviews: pBlogViews,
        percentage: 9,
        avgDuration: "4dk 15sn",
        conversionRate: 2.8,
        conversionsCount: Math.round(pBlogViews * 0.028),
        bounceRate: 31.0
      }
    ];
  }, [config, metrics.totalPageviews]);

  return (
    <div
      id="site-performance-overview-card"
      className={`p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 ${className}`}
    >
      {/* 1. TOP HEADER & LIVE CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Site Performansı & Anlık Ziyaretçi Genel Bakışı
            </h2>

            {/* Live pulsing badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span><strong>{liveVisitorCount} Aktif</strong> Ziyaretçi Çevrimiçi</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Google Analytics & Global Edge CDN sinyalleriyle sitenizin gerçek zamanlı ziyaretçi trafiği, dönüşüm performansı ve en popüler sayfaları.
          </p>
        </div>

        {/* Right: Timeframe & Refresh buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 text-xs font-bold text-slate-600">
            <button
              type="button"
              id="overview-timeframe-today"
              onClick={() => setTimeframe("today")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === "today"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Bugün (24S)
            </button>
            <button
              type="button"
              id="overview-timeframe-7d"
              onClick={() => setTimeframe("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === "7d"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Son 7 Gün
            </button>
            <button
              type="button"
              id="overview-timeframe-30d"
              onClick={() => setTimeframe("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === "30d"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Son 30 Gün
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            id="overview-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title={`Verileri yenile (Son: ${lastRefreshedAt})`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline text-[11px] font-semibold">Yenile</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR HIGH-IMPACT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Visitors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-white border border-indigo-100/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {timeframe === "today" ? "Bugünkü Ziyaretçi" : "Toplam Ziyaretçi"}
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {metrics.totalVisitors.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs text-slate-400 font-medium">oturum</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {metrics.growthRate}
            </span>
            <span className="text-[11px] text-slate-500">önceki döneme göre</span>
          </div>
        </div>

        {/* Metric 2: Pageviews & Uniques */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-white border border-emerald-100/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sayfa Görüntüleme
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {metrics.totalPageviews.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs text-slate-400 font-medium">sayfa</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span><strong>{metrics.uniqueVisitors.toLocaleString("tr-TR")}</strong> tekil kişi</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50/70 px-1.5 py-0.5 rounded">
              {metrics.avgPagesPerSession} sayfa/oturum
            </span>
          </div>
        </div>

        {/* Metric 3: Conversion Rate & Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-white border border-amber-100/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dönüşüm Oranı (CR)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              %{metrics.conversionRate}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              {metrics.leadGrowth}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
            <span><strong>{metrics.totalLeads}</strong> talep & arama</span>
            <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
              Sektör: ~%2.4
            </span>
          </div>
        </div>

        {/* Metric 4: Session Duration & Bounce Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/40 via-white to-white border border-purple-100/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ort. Kalış Süresi
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {metrics.avgDuration}
            </span>
            <span className="text-xs text-slate-400 font-medium">oturum başı</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Çıkma: <strong>%{metrics.bounceRate}</strong> (Düşük)</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
              98/100 CWV Hızı
            </span>
          </div>
        </div>
      </div>

      {/* 3. MOST POPULAR PAGES BREAKDOWN */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              En Popüler Sayfalar ve Sayfa Başına Dönüşüm
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Kullanıcıların en çok zaman geçirdiği ve form doldurduğu sayfalar
          </span>
        </div>

        <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/30">
          <div className="divide-y divide-slate-100">
            {topPages.map((page, index) => (
              <div
                key={page.id}
                className="p-3.5 sm:p-4 hover:bg-white transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left: Page Rank, Name, Category */}
                <div className="flex items-center gap-3 min-w-0 md:w-5/12">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {page.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {page.path}
                      </span>
                      {page.isHighConverter && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          En Yüksek Dönüşüm
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="text-indigo-600 font-semibold">{page.category}</span>
                      <span>•</span>
                      <span>Ort. Süre: <strong>{page.avgDuration}</strong></span>
                      <span>•</span>
                      <span>Hemen Çıkma: <strong>%{page.bounceRate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Middle: Traffic Share Bar */}
                <div className="md:w-4/12 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {page.pageviews.toLocaleString("tr-TR")} görüntüleme
                    </span>
                    <span className="text-slate-500 font-semibold">
                      %{page.percentage} pay
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        page.isHighConverter
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                      }`}
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Right: Page Conversion Rate Metric */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:w-3/12 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      %{page.conversionRate} Dönüşüm
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {page.conversionsCount} form / arama
                    </div>
                  </div>

                  {page.path === "/iletisim" && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("leads")}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Gelen form taleplerini incele"
                    >
                      <span>Talepler</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DEVICE & CHANNEL BREAKDOWN ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Device Ratio */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mobil: %73</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-600" />
              <span>Masaüstü: %27</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-indigo-600 h-full" style={{ width: "73%" }} title="Mobil: %73" />
            <div className="bg-slate-400 h-full" style={{ width: "27%" }} title="Masaüstü: %27" />
          </div>

          <div className="text-[11px] text-slate-500 leading-tight">
            Ziyaretçilerinizin büyük çoğunluğu akıllı telefonlar üzerinden hızlı arama ve WhatsApp ile ulaşıyor.
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trafik Kaynakları (Top 3)</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">Organik Arama Lider</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold">Google Organik</div>
              <div className="font-black text-slate-900 mt-0.5">%54</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold">Doğrudan (Direct)</div>
              <div className="font-black text-slate-900 mt-0.5">%26</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold">Haritalar & Yerel</div>
              <div className="font-black text-slate-900 mt-0.5">%20</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOOTER QUICK ACTION SHORTCUTS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Detaylı saatlik ziyaretçi ve dönüşüm analitiğine doğrudan geçiş yapabilirsiniz:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateTab && (
            <>
              <button
                type="button"
                id="overview-nav-realtime-btn"
                onClick={() => onNavigateTab("realtime-traffic")}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Saatlik Grafiği Aç</span>
              </button>

              <button
                type="button"
                id="overview-nav-leads-btn"
                onClick={() => onNavigateTab("leads")}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>Gelen Talepleri İncele ({metrics.totalLeads})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
