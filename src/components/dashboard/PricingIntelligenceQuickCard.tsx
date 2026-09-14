import React, { useMemo, useState } from "react";
import { 
  Coins, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers,
  ChevronRight,
  HelpCircle,
  Percent
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import { generatePricingIntelligence, applyRecommendedTiersToConfig } from "../../utils/aiPricingIntelligenceEngine";

interface PricingIntelligenceQuickCardProps {
  config: SiteConfig;
  onChange?: (config: SiteConfig) => void;
  onOpenFullView: () => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
}

export const PricingIntelligenceQuickCard: React.FC<PricingIntelligenceQuickCardProps> = ({
  config,
  onChange,
  onOpenFullView,
  onNavigateTab
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Compute pricing intelligence data from leads & services
  const pricingData = useMemo(() => {
    return config.pricingIntelligence || generatePricingIntelligence(config);
  }, [config]);

  const proTier = pricingData.recommendedTiers.find(t => t.level === "pro") || pricingData.recommendedTiers[1];
  const starterTier = pricingData.recommendedTiers.find(t => t.level === "starter") || pricingData.recommendedTiers[0];
  const enterpriseTier = pricingData.recommendedTiers.find(t => t.level === "enterprise") || pricingData.recommendedTiers[2];

  const handleQuickApply = () => {
    if (!onChange) return;
    setIsApplying(true);
    setTimeout(() => {
      const updatedConfig = applyRecommendedTiersToConfig(config, pricingData.recommendedTiers);
      // Also save pricingIntelligence into config
      updatedConfig.pricingIntelligence = pricingData;
      onChange(updatedConfig);
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 4000);
    }, 600);
  };

  return (
    <div 
      id="pricing-intelligence-quick-card"
      className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 border border-slate-700/60 shadow-lg relative overflow-hidden"
    >
      {/* Subtle background glow effect */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Fiyatlandırma Zekası & Katalog Paketleri
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                3-Tier Optimizasyon
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Tarihsel dönüşüm verileri ve {pricingData.city} pazar rekabetine göre optimize edilmiş fiyat kademeleri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {appliedSuccess ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Kataloğa Uygulandı!
            </span>
          ) : (
            <button
              type="button"
              id="quick-apply-pricing-tiers-btn"
              onClick={handleQuickApply}
              disabled={isApplying}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isApplying ? "Uygulanıyor..." : "Paketleri Kataloğa Aktar"}</span>
            </button>
          )}

          <button
            type="button"
            id="open-pricing-workspace-btn"
            onClick={onOpenFullView}
            className="px-3 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Detaylı Analiz</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <span>Dönüşüm Potansiyeli</span>
            <HelpCircle className="w-3 h-3 text-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              %{proTier?.projectedConversionRate || 9.8}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{pricingData.expectedOverallUpliftPercent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Şeffaf paketleme ile</span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-medium text-slate-400">Öngörülen Aylık Artış</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-emerald-400">
              +₺{pricingData.projectedMonthlyRevenueIncreaseTRY.toLocaleString("tr-TR")}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Tahmini net ek gelir</span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-medium text-slate-400">Piyasa Fiyat Hassasiyeti</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-base font-bold text-amber-300 uppercase tracking-wide">
              {pricingData.overallPriceSensitivity === "high" ? "Yüksek" : pricingData.overallPriceSensitivity === "moderate" ? "Dengeli" : "Düşük"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Tarihsel talep analizi</span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-medium text-slate-400">Tatlı Nokta Fiyatı (Sweet Spot)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-sky-400">
              ₺{pricingData.sweetSpotPriceIndex.toLocaleString("tr-TR")}
            </span>
            <span className="text-[10px] text-slate-400">/{proTier?.periodLabel || "hizmet"}</span>
          </div>
          <span className="text-[10px] text-slate-400">Maksimum ciro çarpımı</span>
        </div>
      </div>

      {/* 3-Tier Previews */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Starter Tier */}
        {starterTier && (
          <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-all rounded-xl p-4 border border-slate-700/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">{starterTier.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {starterTier.badge || "Giriş"}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-white">{starterTier.priceFormatted}</span>
                <span className="text-[10px] text-slate-400">({starterTier.periodLabel})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {starterTier.description}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-300">
              <span className="text-emerald-400 font-semibold">%{starterTier.projectedConversionRate} Dönüşüm</span>
              <span>~{starterTier.estimatedMonthlyLeads} Talep/Ay</span>
            </div>
          </div>
        )}

        {/* Pro Tier (Popular) */}
        {proTier && (
          <div className="bg-emerald-950/40 hover:bg-emerald-950/60 transition-all rounded-xl p-4 border-2 border-emerald-500/60 flex flex-col justify-between relative">
            <div className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
              Önerilen Amiral Gemisi
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{proTier.name}</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-300">{proTier.priceFormatted}</span>
                {proTier.originalPriceFormatted && (
                  <span className="text-xs text-slate-400 line-through">{proTier.originalPriceFormatted}</span>
                )}
                <span className="text-[10px] text-emerald-200/80">({proTier.periodLabel})</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {proTier.description}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-800/40 flex items-center justify-between text-[10px]">
              <span className="text-emerald-300 font-bold">%{proTier.projectedConversionRate} Dönüşüm (+%{proTier.conversionUpliftPercent})</span>
              <span className="text-slate-200">~{proTier.estimatedMonthlyLeads} Talep/Ay</span>
            </div>
          </div>
        )}

        {/* Enterprise Tier */}
        {enterpriseTier && (
          <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-all rounded-xl p-4 border border-slate-700/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">{enterpriseTier.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/40">
                  {enterpriseTier.badge || "VIP"}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-white">{enterpriseTier.priceFormatted}</span>
                <span className="text-[10px] text-slate-400">({enterpriseTier.periodLabel})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {enterpriseTier.description}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-300">
              <span className="text-indigo-300 font-semibold">Çıpa Etkisi (Anchoring)</span>
              <span>~{enterpriseTier.estimatedMonthlyLeads} VIP Talep</span>
            </div>
          </div>
        )}
      </div>

      {/* Strategic Insight Alert Footer */}
      <div className="relative z-10 mt-4 bg-slate-800/90 rounded-xl p-3 border border-slate-700/70 flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">
            <strong>Psikolojik Çıpa:</strong> 3 paket sunulduğunda müşterilerin <strong>%68'i</strong> doğrudan ortadaki Standart paketi tercih ederek ortalama sipariş değerini yükseltir.
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenFullView}
          className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <span>Esneklik Simülatörünü Aç</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
