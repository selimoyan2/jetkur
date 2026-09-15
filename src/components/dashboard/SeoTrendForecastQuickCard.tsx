import React from "react";
import { TrendingUp, Sparkles, ArrowRight, Zap, Flame, BarChart3 } from "lucide-react";
import { SiteConfig } from "../../types";

interface SeoTrendForecastQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
}

export const SeoTrendForecastQuickCard: React.FC<SeoTrendForecastQuickCardProps> = ({
  config,
  onOpenWorkspace,
}) => {
  const sector = config.sector || "Evden Eve Nakliyat & Taşımacılık";
  const city = config.city || "İstanbul";

  return (
    <div
      id="quick-card-seo-trend-forecast"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Arama Trendleri
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini + Google SERP
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                SEO Trend Tahmincisi
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            12 Ay Projeksiyon
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          <strong className="text-slate-800">{city}</strong> bölgesinde <strong className="text-slate-800">{sector}</strong> sektörü için yükselen ilk 5 arama trendini, kırılma yaşayan sorguları ve güven aralıklı talep eğrilerini interaktif grafikte inceleyin.
        </p>

        {/* Quick Highlights Box */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">En Hızlı Yükselen</div>
            <div className="text-sm font-black text-emerald-600 mt-0.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-500" />
              <span>+245% Yıllık</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Analiz Kapsamı</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              5 Trend & Aksiyon Planı
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-open-seo-trend-forecast-workspace"
        onClick={onOpenWorkspace}
        className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
      >
        <BarChart3 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
        <span>İnteraktif Trend Grafiğini Aç</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
