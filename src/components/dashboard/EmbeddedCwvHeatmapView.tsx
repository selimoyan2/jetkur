import React, { useState } from "react";
import { 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Maximize2, 
  Info,
  Check,
  TrendingUp,
  Share2
} from "lucide-react";
import { DailyPerformanceTrendDataPoint, SiteConfig } from "../../types";
import { 
  getMetricStatus, 
  formatMetricValue, 
  calculateP75,
  generateCwvHeatmapCanvas,
  downloadCwvHeatmapImage,
  generateCwvStakeholderCsv,
  downloadCwvStakeholderCsv
} from "../../utils/cwvExportUtils";

export interface EmbeddedCwvHeatmapViewProps {
  data: DailyPerformanceTrendDataPoint[];
  config: SiteConfig;
  device: "mobile" | "desktop";
  onOpenExportModal: () => void;
  onExploreHistory?: () => void;
}

export const EmbeddedCwvHeatmapView: React.FC<EmbeddedCwvHeatmapViewProps> = ({
  data,
  config,
  device,
  onOpenExportModal,
  onExploreHistory
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    formattedDate: string;
    metric: string;
    value: string;
    target: string;
    status: "good" | "needs-improvement" | "poor";
  } | null>(null);

  const [isExportingPng, setIsExportingPng] = useState(false);
  const [pngSuccess, setPngSuccess] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  const domain = config.domain || config.companyName || "example.com";
  const siteName = config.companyName || "Müşteri Web Projesi";

  // Summary p75 metrics
  const p75Lcp = calculateP75(data.map(d => d.lcp));
  const p75Cls = calculateP75(data.map(d => d.cls));
  const p75Fid = calculateP75(data.map(d => d.fid));
  const passDays = data.filter(d => d.cwvPassStatus === "pass" || (d.lcp <= 2.5 && d.cls <= 0.10 && d.fid <= 100)).length;
  const passRate = data.length > 0 ? Math.round((passDays / data.length) * 100) : 100;

  const rows = [
    { key: "lcp", name: "LCP", fullName: "Largest Contentful Paint", target: "≤ 2.5s", unit: "s", note: "Yükleme Hızı" },
    { key: "cls", name: "CLS", fullName: "Cumulative Layout Shift", target: "≤ 0.10", unit: "", note: "Görsel Kararlılık" },
    { key: "fid", name: "FID", fullName: "First Input Delay", target: "≤ 100ms", unit: "ms", note: "İlk Tepki Süresi" },
    { key: "inp", name: "INP", fullName: "Interaction to Next Paint", target: "≤ 200ms", unit: "ms", note: "Etkileşim Gecikmesi" },
    { key: "fcp", name: "FCP", fullName: "First Contentful Paint", target: "≤ 1.8s", unit: "s", note: "İlk İçerikli Boyama" },
    { key: "ttfb", name: "TTFB", fullName: "Time to First Byte", target: "≤ 800ms", unit: "ms", note: "Sunucu Yanıtı" },
    { key: "overall", name: "Genel CWV", fullName: "Günlük Google Uyumu", target: "Google Onay", unit: "", note: "3 Temel Metrik" }
  ];

  // Quick Heatmap PNG Export
  const handleQuickPng = async () => {
    try {
      setIsExportingPng(true);
      const canvas = generateCwvHeatmapCanvas(data, {
        siteName,
        domain,
        device,
        theme: "light",
        resolution: "high",
        scale: 2
      });
      const dateSlug = new Date().toISOString().slice(0, 10);
      const filename = `Core_Web_Vitals_Isi_Haritasi_${domain.replace(/[^a-zA-Z0-9]/g, "_")}_${device}_${dateSlug}.png`;
      await downloadCwvHeatmapImage(canvas, filename);
      setPngSuccess(true);
      setTimeout(() => setPngSuccess(false), 2500);
    } catch (err) {
      console.error("Hızlı PNG indirme hatası:", err);
    } finally {
      setIsExportingPng(false);
    }
  };

  // Quick Stakeholder CSV Export
  const handleQuickCsv = () => {
    const csv = generateCwvStakeholderCsv(data, {
      siteName,
      domain,
      device
    });
    const dateSlug = new Date().toISOString().slice(0, 10);
    const filename = `Core_Web_Vitals_Paydas_Raporu_${domain.replace(/[^a-zA-Z0-9]/g, "_")}_${device}_${dateSlug}.csv`;
    downloadCwvStakeholderCsv(csv, filename);
    setCsvSuccess(true);
    setTimeout(() => setCsvSuccess(false), 2500);
  };

  return (
    <div 
      id="embedded-cwv-heatmap-view" 
      data-testid="embedded-cwv-heatmap-view"
      className="space-y-4"
    >
      {/* Top Controls & Callout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Core Web Vitals Renk Kodlu Isı Haritası (Heatmap)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
              Google CWV: %{passRate} Geçti
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Son {data.length} günlük saha telemetrisini Google standartlarına göre renk kodlarıyla inceleyin ve paydaşlarınızla paylaşın.
          </p>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-quick-export-heatmap-png"
            onClick={handleQuickPng}
            disabled={isExportingPng}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
              pngSuccess
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title="Isı haritasını yüksek çözünürlüklü PNG görseli olarak indirin"
          >
            {pngSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>PNG İndirildi!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isExportingPng ? "Oluşturuluyor..." : "Isı Haritası PNG"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-quick-export-stakeholder-csv"
            onClick={handleQuickCsv}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs active:scale-95 ${
              csvSuccess
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300"
                : "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            }`}
            title="Excel uyumlu UTF-8 BOM paydaş CSV raporu indirin"
          >
            {csvSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV İndirildi!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paydaş CSV</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-open-full-export-center"
            onClick={onOpenExportModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Özelleştirilebilir Paydaş Dışa Aktarma Merkezini Aç"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dışa Aktarma Merkezi</span>
          </button>
        </div>
      </div>

      {/* Embedded Heatmap Grid Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="p-3 sm:p-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">LCP 75. Yüzdelik</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {p75Lcp.toFixed(2)}s
            </div>
            <span className="text-[10px] text-slate-400">Hedef: ≤ 2.5s (Google İyi)</span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">CLS 75. Yüzdelik</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {p75Cls.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-400">Hedef: ≤ 0.10 (Google İyi)</span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">FID 75. Yüzdelik</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {Math.round(p75Fid)}ms
            </div>
            <span className="text-[10px] text-slate-400">Hedef: ≤ 100ms (Google İyi)</span>
          </div>

          <div className="p-3 sm:p-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Genel Başarı Oranı</span>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              %{passRate}
            </div>
            <span className="text-[10px] text-slate-400">{passDays}/{data.length} Gün Onaylı</span>
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div className="p-4 sm:p-5 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header: Dates */}
            <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(20px,1fr))] items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400">
              <div>METRİK / SAHA GÜNLERİ</div>
              <div className="col-span-full col-start-2 flex justify-between">
                {data.map((d) => (
                  <div
                    key={d.date}
                    className="text-center flex-1 truncate font-mono text-[9px]"
                    title={`${d.date} (${d.formattedDate})`}
                  >
                    {data.length <= 16 ? d.formattedDate : d.date.slice(8, 10)}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-1.5 pt-2.5">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[180px_repeat(auto-fit,minmax(20px,1fr))] items-center gap-1"
                >
                  {/* Left Label */}
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({row.note})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Hedef: {row.target}
                    </div>
                  </div>

                  {/* Data Cells */}
                  <div className="col-span-full col-start-2 flex gap-1">
                    {data.map((point) => {
                      let status: "good" | "needs-improvement" | "poor" = "good";
                      let displayVal = "";
                      let numVal = 0;

                      if (row.key === "overall") {
                        const pass = point.cwvPassStatus === "pass" || (point.lcp <= 2.5 && point.cls <= 0.10 && point.fid <= 100);
                        const warn = point.cwvPassStatus === "needs-improvement" || (point.lcp <= 4.0 && point.cls <= 0.25 && point.fid <= 300);
                        status = pass ? "good" : warn ? "needs-improvement" : "poor";
                        displayVal = pass ? "✓" : warn ? "!" : "✕";
                      } else {
                        numVal = (point as any)[row.key] ?? 0;
                        status = getMetricStatus(row.key, numVal);
                        displayVal = formatMetricValue(row.key, numVal);
                      }

                      const cellColorClass = 
                        status === "good"
                          ? "bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                          : status === "needs-improvement"
                          ? "bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900"
                          : "bg-rose-100/90 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900";

                      return (
                        <div
                          key={point.date}
                          onMouseEnter={() => {
                            setHoveredCell({
                              date: point.date,
                              formattedDate: point.formattedDate,
                              metric: row.fullName,
                              value: displayVal,
                              target: row.target,
                              status
                            });
                          }}
                          className={`flex-1 h-7 rounded border flex items-center justify-center font-mono font-bold text-[9px] transition-all cursor-pointer select-none ${cellColorClass}`}
                        >
                          {displayVal}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Hover Tooltip / Status Display */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          {hoveredCell ? (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                hoveredCell.status === "good" ? "bg-emerald-500" : hoveredCell.status === "needs-improvement" ? "bg-amber-500" : "bg-rose-500"
              }`} />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {hoveredCell.formattedDate} ({hoveredCell.date})
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300">
                {hoveredCell.metric}:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {hoveredCell.value}
              </span>
              <span className="text-slate-400">
                (Hedef: {hoveredCell.target})
              </span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                hoveredCell.status === "good" 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : hoveredCell.status === "needs-improvement"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}>
                {hoveredCell.status === "good" ? "İYİ" : hoveredCell.status === "needs-improvement" ? "GELİŞTİRİLMELİ" : "KÖTÜ"}
              </span>
            </div>
          ) : (
            <div className="text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Hücre detayını, tam değerini ve Google hedef eşiğini görmek için fareyi üzerine getirin.</span>
            </div>
          )}

          {/* Color Scale Reference */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-bold">İyi (Good)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-bold">Geliştirilmeli</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-bold">Kötü</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
