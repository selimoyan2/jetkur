import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  CoreWebVitalMetricKey, 
  PerformanceTrendGranularity, 
  PerformanceMilestoneEvent,
  CustomerPanelTab 
} from "../../types";
import { generate90DayPerformanceTrendsData } from "../../utils/performanceTrendsGenerator";
import { PerformanceTrendsD3Chart } from "./PerformanceTrendsD3Chart";
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Gauge, 
  Zap, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Calendar, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Sliders,
  Layers,
  Award
} from "lucide-react";

export interface PerformanceTrendsCardProps {
  config: SiteConfig;
  defaultMetric?: CoreWebVitalMetricKey;
  className?: string;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  title?: string;
  subtitle?: string;
  showAllMetricsSelector?: boolean;
}

export const PerformanceTrendsCard: React.FC<PerformanceTrendsCardProps> = ({
  config,
  defaultMetric = "lcp",
  className = "",
  onNavigateTab,
  title = "Performans Trendleri",
  subtitle = "D3.js ile son 30 günlük Google Core Web Vitals geçmişi ve çıkma oranı korelasyonu",
  showAllMetricsSelector = true
}) => {
  const [selectedMetric, setSelectedMetric] = useState<CoreWebVitalMetricKey>(defaultMetric);
  const [granularity, setGranularity] = useState<PerformanceTrendGranularity>("daily");
  const [activeMilestoneModal, setActiveMilestoneModal] = useState<PerformanceMilestoneEvent | null>(null);

  // Generate deterministic 30-day Core Web Vitals telemetry
  const { data, summary, correlationInsights, milestones } = useMemo(() => {
    return generate90DayPerformanceTrendsData(config, 30);
  }, [config]);

  // Current metric insight
  const activeInsight = useMemo(() => {
    return correlationInsights.find(c => c.metricKey === selectedMetric) || correlationInsights[0];
  }, [correlationInsights, selectedMetric]);

  // Metric Tab configuration
  const metricOptions: Array<{
    key: CoreWebVitalMetricKey;
    shortName: string;
    fullName: string;
    googleTarget: string;
    unit: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    borderActive: string;
  }> = [
    {
      key: "lcp",
      shortName: "LCP",
      fullName: "En Büyük İçerikli Boyama",
      googleTarget: "≤ 2.5s",
      unit: "sn",
      accentColor: "text-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: "Google Hedefi",
      borderActive: "border-emerald-500 bg-emerald-50/50 shadow-emerald-500/10"
    },
    {
      key: "inp",
      shortName: "INP",
      fullName: "Tıklama Tepki Süresi",
      googleTarget: "≤ 200ms",
      unit: "ms",
      accentColor: "text-sky-600",
      badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
      badgeText: "Arayüz Hızı",
      borderActive: "border-sky-500 bg-sky-50/50 shadow-sky-500/10"
    },
    {
      key: "cls",
      shortName: "CLS",
      fullName: "Kümülatif Düzen Kayması",
      googleTarget: "≤ 0.10",
      unit: "",
      accentColor: "text-violet-600",
      badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
      badgeText: "Görsel Kararlılık",
      borderActive: "border-violet-500 bg-violet-50/50 shadow-violet-500/10"
    },
    {
      key: "ttfb",
      shortName: "TTFB",
      fullName: "İlk Bayt Yanıtı (Sunucu)",
      googleTarget: "≤ 800ms",
      unit: "ms",
      accentColor: "text-amber-600",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      badgeText: "Edge CDN",
      borderActive: "border-amber-500 bg-amber-50/50 shadow-amber-500/10"
    },
    {
      key: "fcp",
      shortName: "FCP",
      fullName: "İlk İçerikli Boyama",
      googleTarget: "≤ 1.8s",
      unit: "sn",
      accentColor: "text-teal-600",
      badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
      badgeText: "İlk Algı",
      borderActive: "border-teal-500 bg-teal-50/50 shadow-teal-500/10"
    },
    {
      key: "healthScore",
      shortName: "Genel Skor",
      fullName: "Altyapı Sağlık İndeksi",
      googleTarget: "≥ 90",
      unit: "/100",
      accentColor: "text-green-600",
      badgeBg: "bg-green-50 text-green-700 border-green-200",
      badgeText: "PageSpeed 99+",
      borderActive: "border-green-500 bg-green-50/50 shadow-green-500/10"
    }
  ];

  // Helper to extract metric values
  const getMetricDisplayValue = (key: CoreWebVitalMetricKey, isCurrent: boolean) => {
    if (data.length === 0) return "--";
    const pt = isCurrent ? data[data.length - 1] : data[0];
    switch (key) {
      case "lcp": return `${pt.lcp}s`;
      case "inp": return `${pt.inp}ms`;
      case "cls": return `${pt.cls}`;
      case "ttfb": return `${pt.ttfb}ms`;
      case "fcp": return `${pt.fcp}s`;
      case "healthScore": return `${pt.healthScore}/100`;
    }
  };

  const getMetricChangeDelta = (key: CoreWebVitalMetricKey) => {
    if (data.length === 0) return { delta: "0%", isGood: true };
    const first = data[0];
    const last = data[data.length - 1];
    
    if (key === "healthScore") {
      const diff = last.healthScore - first.healthScore;
      return { delta: diff >= 0 ? `+${diff} Puan` : `${diff} Puan`, isGood: diff >= 0 };
    }
    
    const vFirst = key === "lcp" ? first.lcp : key === "inp" ? first.inp : key === "cls" ? first.cls : key === "ttfb" ? first.ttfb : first.fcp;
    const vLast = key === "lcp" ? last.lcp : key === "inp" ? last.inp : key === "cls" ? last.cls : key === "ttfb" ? last.ttfb : last.fcp;
    const pct = (((vLast - vFirst) / vFirst) * 100).toFixed(1);
    const numPct = parseFloat(pct);
    return {
      delta: numPct <= 0 ? `${pct}%` : `+${pct}%`,
      isGood: numPct <= 0 // Lower is better for all CWV times
    };
  };

  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 ${className}`} id="card-performance-trends">
      {/* 1. Header & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Son 30 Gün
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                D3.js
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 pl-10">
            {subtitle}
          </p>
        </div>

        {/* Controls: Granularity & Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setGranularity("daily")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                granularity === "daily" 
                  ? "bg-white text-slate-950 shadow-xs" 
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Günlük Noktalar
            </button>
            <button
              type="button"
              onClick={() => setGranularity("7d_ma")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                granularity === "7d_ma" 
                  ? "bg-white text-slate-950 shadow-xs" 
                  : "text-slate-600 hover:text-slate-950"
              }`}
              title="7 Günlük Hareketli Ortalama ile yumuşatılmış trend eğrisi"
            >
              7 Günlük Ort. (7d MA)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>%100 CWV Geçiş Oranı</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Core Web Vitals Metric Selector Cards */}
      {showAllMetricsSelector && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {metricOptions.map((opt) => {
            const isSelected = selectedMetric === opt.key;
            const currentVal = getMetricDisplayValue(opt.key, true);
            const { delta, isGood } = getMetricChangeDelta(opt.key);

            return (
              <button
                key={opt.key}
                type="button"
                id={`btn-metric-tab-${opt.key}`}
                onClick={() => setSelectedMetric(opt.key)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? `${opt.borderActive} shadow-md`
                    : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span className="font-mono text-xs font-black text-slate-900">{opt.shortName}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${opt.badgeBg}`}>
                    {opt.googleTarget}
                  </span>
                </div>

                <div className="text-base font-black text-slate-900 font-mono tracking-tight">
                  {currentVal}
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 truncate max-w-[55px]">30g:</span>
                  <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                    isGood ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {isGood ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                    <span>{delta}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. D3.js Chart Canvas Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Seçili Metrik: {metricOptions.find(m => m.key === selectedMetric)?.fullName}</span>
            </span>
            <span className="text-slate-400">vs</span>
            <span className="font-bold text-rose-600 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Hemen Çıkma Oranı (Bounce Rate %)</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>30 Günlük Zaman Serisi</span>
          </div>
        </div>

        {/* Real D3.js Chart */}
        <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-200/80">
          <PerformanceTrendsD3Chart
            data={data}
            selectedMetric={selectedMetric}
            granularity={granularity}
            height={340}
            onSelectMilestone={(ms) => setActiveMilestoneModal(ms)}
          />
        </div>
      </div>

      {/* 4. 30-Day Analysis & Correlation Highlights (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Box A: 30-Day Progress Delta */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>30 Günlük Değişim</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
              {getMetricChangeDelta(selectedMetric).delta}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-[10px] text-slate-400">30 Gün Önce</div>
              <div className="text-sm font-bold text-slate-700 font-mono">
                {getMetricDisplayValue(selectedMetric, false)}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Bugün (Güncel)</div>
              <div className="text-base font-black text-emerald-600 font-mono">
                {getMetricDisplayValue(selectedMetric, true)}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight pt-1">
            Google arama motoru tarafından talep edilen {metricOptions.find(m => m.key === selectedMetric)?.googleTarget} standart sınırının tam içinde.
          </p>
        </div>

        {/* Box B: Impact on Visitor Retention (Bounce Rate) */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>Hemen Çıkma Oranı Etkisi</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 font-mono">
              %{summary.bounceRateDropPercentage} Düşüş
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-[10px] text-rose-600">Önceki Terk Oranı</div>
              <div className="text-sm font-bold text-slate-700 font-mono">
                %{data[0]?.bounceRate}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] text-rose-600">Güncel Terk Oranı</div>
              <div className="text-base font-black text-rose-700 font-mono">
                %{data[data.length - 1]?.bounceRate}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight pt-1">
            {activeInsight?.elasticityStatement || "Sayfaların anında açılması ziyaretçi terkini engelledi ve sitede kalma süresini artırdı."}
          </p>
        </div>

        {/* Box C: SEO Search Visibility Multiplier */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sıralama Avantajı</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
              A+ Kararlılık
            </span>
          </div>

          <div className="pt-1 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">30 Günlük Başarı:</span>
              <span className="font-mono font-bold text-emerald-700">30 / 30 Gün Yeşil</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">CrUX Hız İndeksi:</span>
              <span className="font-mono font-bold text-emerald-700">İlk %5 Dilim</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Mobil Sıralama İtişi:</span>
              <span className="font-mono font-bold text-emerald-700">+1.8x Organik Tıklama</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Infrastructure Milestones within 30-Day Window */}
      {milestones.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Son 30 Günde Devreye Alınan Altyapı İyileştirmeleri ({milestones.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">Grafik üzerindeki mor noktalara tıklayarak detayları görebilirsiniz</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {milestones.map((ms) => (
              <button
                key={ms.id}
                type="button"
                onClick={() => setActiveMilestoneModal(ms)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 transition-all text-left flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">{ms.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{ms.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 pl-4">{ms.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold shrink-0">
                  {ms.impactDelta}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Milestone Modal Dialog */}
      {activeMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                    {activeMilestoneModal.category} • {activeMilestoneModal.date}
                  </span>
                  <h4 className="text-base font-black text-slate-900">{activeMilestoneModal.title}</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMilestoneModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {activeMilestoneModal.description}
            </p>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
              <span className="text-slate-700 font-medium">Hedeflenen Metrik Etkisi:</span>
              <span className="font-mono font-black text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                {activeMilestoneModal.impactMetric} ({activeMilestoneModal.impactDelta})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveMilestoneModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
