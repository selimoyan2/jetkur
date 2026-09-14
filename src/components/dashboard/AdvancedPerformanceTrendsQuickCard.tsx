import React, { useMemo, useState } from "react";
import { Activity, TrendingDown, Download, CheckCircle2, ArrowRight, Zap, Sparkles } from "lucide-react";
import { SiteConfig } from "../../types";
import { generate90DayPerformanceTrendsData, generatePerformanceTrendsCsv, downloadPerformanceTrendsCsvFile } from "../../utils/performanceTrendsGenerator";
import { slugify } from "../../utils/url";

interface AdvancedPerformanceTrendsQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
}

export const AdvancedPerformanceTrendsQuickCard: React.FC<AdvancedPerformanceTrendsQuickCardProps> = ({
  config,
  onOpenWorkspace
}) => {
  const { data, summary } = useMemo(() => generate90DayPerformanceTrendsData(config, 90), [config]);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleFastDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);

    setTimeout(() => {
      const companySlug = config.companyName ? slugify(config.companyName) : "site";
      const dateStr = new Date().toISOString().slice(0, 10);
      const csvContent = generatePerformanceTrendsCsv(data, summary, config);
      const filename = `${companySlug}-90-gunluk-performans-trendleri-${dateStr}.csv`;

      downloadPerformanceTrendsCsvFile(csvContent, filename);
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  return (
    <div
      id="quick-card-advanced-performance-trends"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Altyapı Trendleri
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                D3.js &bull; 90 Gün
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Core Web Vitals &amp; Çıkma Oranı
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
          98/100 Sağlık
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        90 günlük yuvarlanan pencerede sayfa açılış hızı (LCP) ile ziyaretçi hemen çıkma oranı arasındaki doğrudan korelasyonu D3.js ile karşılaştırın.
      </p>

      {/* 2-Column Comparison Pill */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">90G LCP İyileşmesi</div>
          <div className="flex items-center gap-1 mt-1 text-sm font-bold text-emerald-700">
            <span>{summary.lcpInitial}s → {summary.lcpCurrent}s</span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">(%{Math.abs(summary.lcpDeltaPercent)})</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Çıkma Oranı Düşüşü</div>
          <div className="flex items-center gap-1 mt-1 text-sm font-bold text-rose-600">
            <span>%{summary.bounceRateInitial} → %{summary.bounceRateCurrent}</span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">(%{Math.abs(summary.bounceRateDeltaPercent)})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto gap-2">
        <button
          type="button"
          onClick={handleFastDownload}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>İndirildi!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>{isExporting ? "Hazırlanıyor..." : "90G CSV İndir"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenWorkspace}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1.5 px-2"
        >
          <span>D3 Trend Grafiği</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
