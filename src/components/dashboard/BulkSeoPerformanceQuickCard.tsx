import React, { useMemo, useState } from "react";
import { FileSpreadsheet, Download, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { SiteConfig } from "../../types";
import { compileBulkSeoPerformanceData, generateMasterBulkSeoCsv, downloadBulkSeoCsvFile } from "../../utils/bulkSeoPerformanceExporter";
import { slugify } from "../../utils/url";

interface BulkSeoPerformanceQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
}

export const BulkSeoPerformanceQuickCard: React.FC<BulkSeoPerformanceQuickCardProps> = ({
  config,
  onOpenWorkspace
}) => {
  const { summary, items } = useMemo(() => compileBulkSeoPerformanceData(config), [config]);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleFastDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);

    setTimeout(() => {
      const companySlug = config.companyName ? slugify(config.companyName) : "site";
      const dateStr = new Date().toISOString().slice(0, 10);
      const csvContent = generateMasterBulkSeoCsv(items, config);
      const filename = `${companySlug}-toplu-seo-performans-${dateStr}.csv`;

      downloadBulkSeoCsvFile(csvContent, filename);
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  return (
    <div
      id="quick-card-bulk-seo-export"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                SEO Dışa Aktarma
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                CSV &amp; Excel
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Bulk SEO Performance Export
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
          {summary.totalPages} Sayfa
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Meta etiketleri, tespit edilen içerik açıkları (content gaps), anahtar kelime Google sıralamaları ve SEO sağlık denetim sonuçlarını tek tıkla CSV olarak indirin.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Ort. SEO Sağlığı</div>
          <div className="flex items-center gap-1 mt-1 text-sm font-bold text-emerald-700">
            <span>%{summary.averageHealthScore} / 100</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">İçerik Açıkları</div>
          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-700">
            <span>{summary.totalContentGaps} Geliştirme Alanı</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto gap-2">
        <button
          type="button"
          onClick={handleFastDownload}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>İndirildi!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-white" />
              <span>{isExporting ? "Hazırlanıyor..." : "Hızlı CSV İndir"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenWorkspace}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer py-1.5 px-2"
        >
          <span>Detaylı İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
