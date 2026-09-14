import React from "react";
import { Globe2, Sparkles, TrendingUp, ArrowRight, CheckCircle2, Compass } from "lucide-react";
import { SiteConfig } from "../../types";

interface GlobalSeoQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
}

export const GlobalSeoQuickCard: React.FC<GlobalSeoQuickCardProps> = ({
  config,
  onOpenWorkspace,
}) => {
  const sector = config.sector || "Web Tasarım & Yazılım";

  return (
    <div
      id="quick-card-global-seo"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-xs">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                SEO Zekası
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Grounding Aktif
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              AI Global SEO Agent
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
          Çoklu Pazar
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Google Arama Grounding ile bölgesel arama trendlerini, hedef pazar alışkanlıklarını ve yerel dildeki arama varyasyonlarını otomatik analiz edin.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Hedef Pazarlar</div>
          <div className="flex items-center gap-1 mt-1 text-sm font-bold text-slate-800">
            <span>🇹🇷</span>
            <span>🇩🇪</span>
            <span>🇬🇧</span>
            <span>🇦🇪</span>
            <span className="text-xs text-slate-500 font-mono ml-0.5">+5 Bölge</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">En Hızlı Yükselen</div>
          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+74% DACH & Metropol</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Compass className="w-3.5 h-3.5 text-indigo-500" />
          <span>Vernacular SEO Motoru</span>
        </div>
        <button
          type="button"
          id="btn-open-global-seo-workspace"
          onClick={onOpenWorkspace}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <span>Ajanı Aç</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
