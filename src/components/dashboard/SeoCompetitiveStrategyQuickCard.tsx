import React from "react";
import { Target, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import { SiteConfig } from "../../types";

interface SeoCompetitiveStrategyQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
}

export const SeoCompetitiveStrategyQuickCard: React.FC<SeoCompetitiveStrategyQuickCardProps> = ({
  config,
  onOpenWorkspace,
}) => {
  const sector = config.sector || "Evden Eve Nakliyat";
  const city = config.city || "İstanbul";

  return (
    <div
      id="quick-card-seo-competitive-strategy"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-600 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  D3.js Radar Analizi
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-semibold">
                  Top 3 Rakip
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                SEO Rekabet Stratejisi
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            Hızda Lidersiniz
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          <strong className="text-slate-800">{city}</strong> genelinde <strong className="text-slate-800">{sector}</strong> sektöründeki ilk 3 rakibinizle alan adı otoritesi (DA), kelime yoğunluğu ve site hızınızı D3 radar grafiğinde kıyaslayın.
        </p>

        {/* Highlights Row */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50/90 border border-slate-100 p-2.5 rounded-xl text-center">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Otorite (DA)</div>
            <div className="text-xs font-black text-slate-800 mt-0.5 font-mono">
              Fark: -27 DA
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Kelime Yoğunluğu</div>
            <div className="text-xs font-black text-slate-800 mt-0.5 font-mono">
              %1.8 İdeal
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Site Hızı</div>
            <div className="text-xs font-black text-emerald-600 mt-0.5 font-mono">
              +32 Puan Önde
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-open-competitive-strategy-workspace"
        onClick={onOpenWorkspace}
        className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
      >
        <Target className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
        <span>D3 Radar Grafiğini &amp; Stratejiyi Aç</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
