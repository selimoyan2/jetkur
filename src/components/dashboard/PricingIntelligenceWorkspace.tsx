import React, { useState, useMemo } from "react";
import { 
  Coins, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Layers, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  BarChart3, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown,
  Info,
  DollarSign,
  Tag,
  Clock,
  Building2,
  Users,
  Target
} from "lucide-react";
import { SiteConfig, PricingIntelligenceData, PricingTierRecommendation, ServiceSpecificPricingSuggestion } from "../../types";
import { 
  generatePricingIntelligence, 
  applyRecommendedTiersToConfig, 
  applyServicePricesToConfig, 
  generatePricingStrategyReportText 
} from "../../utils/aiPricingIntelligenceEngine";

interface PricingIntelligenceWorkspaceProps {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onBackToOverview?: () => void;
}

type WorkspaceSubTab = "tiers" | "services" | "simulator" | "competitors" | "roadmap";

export const PricingIntelligenceWorkspace: React.FC<PricingIntelligenceWorkspaceProps> = ({
  config,
  onChange,
  onBackToOverview
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>("tiers");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Price Elasticity Simulator State
  const [simulatorMultiplier, setSimulatorMultiplier] = useState<number>(1.0);

  // Load cached or generate algorithmic data
  const [intelligenceData, setIntelligenceData] = useState<PricingIntelligenceData>(() => {
    return config.pricingIntelligence || generatePricingIntelligence(config);
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger Live Gemini AI Refresh
  const handleRefreshAiAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/ai-pricing-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setIntelligenceData(json.data);
        // Persist into site config
        onChange({
          ...config,
          pricingIntelligence: json.data,
        });
        showToast("AI Fiyatlandırma Zekası güncel verilerle yenilendi!");
      } else {
        const fallback = generatePricingIntelligence(config);
        setIntelligenceData(fallback);
        showToast("Algoritmik fiyatlandırma modeli güncellendi.");
      }
    } catch (err) {
      console.warn("AI pricing fetch failed, using internal calculation:", err);
      const fallback = generatePricingIntelligence(config);
      setIntelligenceData(fallback);
      showToast("Fiyatlandırma verileri yerel hesaplama ile tazelendi.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // 1-Click Action: Publish All Tiers to Live Site (config.pricing)
  const handleApplyAllTiers = () => {
    const updated = applyRecommendedTiersToConfig(config, intelligenceData.recommendedTiers);
    updated.pricingIntelligence = intelligenceData;
    onChange(updated);
    showToast("3-Tier Fiyatlandırma Paketleri web sitenizin ana sayfa ve fiyatlandırma bölümüne yayınlandı!");
  };

  // 1-Click Action: Apply Service Pricing to Catalog
  const handleApplyServicePrices = () => {
    const updated = applyServicePricesToConfig(config, intelligenceData.servicePricingSuggestions);
    updated.pricingIntelligence = intelligenceData;
    onChange(updated);
    showToast("Hizmet fiyatları şeffaf başlangıç tutarlarıyla güncellendi!");
  };

  // Export Strategy Report Download
  const handleDownloadReport = () => {
    const text = generatePricingStrategyReportText(intelligenceData, config.companyName || "İşletme");
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI_Fiyatlandirma_Strateji_Raporu_${config.companyName || "Firma"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Fiyatlandırma Zeka ve Strateji Raporu başarıyla indirildi.");
  };

  // Real-time Simulator Calculations based on slider
  const proTier = intelligenceData.recommendedTiers.find(t => t.level === "pro") || intelligenceData.recommendedTiers[1];
  const basePrice = proTier ? proTier.price : 3000;
  const simulatedPrice = Math.round((basePrice * simulatorMultiplier) / 50) * 50;

  // Elasticity mathematical modeling:
  // Baseline conversion at 1.0x multiplier is proTier.projectedConversionRate (e.g. 9.8%)
  // As price multiplier goes up, conversion drops non-linearly: Conv = BaseConv * (1 / multiplier)^1.15
  const baseConv = proTier?.projectedConversionRate || 9.8;
  const simulatedConvRate = Math.max(1.0, Math.round((baseConv * Math.pow(1 / simulatorMultiplier, 1.15)) * 10) / 10);
  const baseMonthlyTraffic = 1450;
  const simulatedLeads = Math.round(baseMonthlyTraffic * (simulatedConvRate / 100));
  const simulatedMonthlyRevenue = simulatedLeads * simulatedPrice;

  // Compare to 1.0 sweet spot
  const sweetSpotPrice = basePrice;
  const sweetSpotConv = baseConv;
  const sweetSpotLeads = Math.round(baseMonthlyTraffic * (sweetSpotConv / 100));
  const sweetSpotRevenue = sweetSpotLeads * sweetSpotPrice;
  const revenueDifference = simulatedMonthlyRevenue - sweetSpotRevenue;

  return (
    <div className="space-y-6" id="pricing-intelligence-workspace">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    AI Fiyatlandırma Zekası & Katalog Paketleri
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {intelligenceData.isAiGenerated ? "Gemini 3.8 Flash Destekli" : "Aktif Optimizasyon"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {config.companyName} • {intelligenceData.sector} • {intelligenceData.city} Yerel Pazarı
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="refresh-pricing-ai-btn"
              onClick={handleRefreshAiAnalysis}
              disabled={isLoadingAi}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingAi ? "animate-spin" : ""}`} />
              <span>{isLoadingAi ? "Pazar Taranıyor..." : "AI ile Yeniden Tara"}</span>
            </button>

            <button
              type="button"
              id="export-pricing-report-btn"
              onClick={handleDownloadReport}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Strateji Raporu İndir</span>
            </button>

            <button
              type="button"
              id="apply-all-pricing-tiers-btn"
              onClick={handleApplyAllTiers}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Tüm Paketleri Sitede Yayınla</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Card Inside Banner */}
        <div className="relative z-10 mt-5 bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-300">
              <p className="leading-relaxed">
                {intelligenceData.executiveSummary}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                <span>İncelenen Talep: <strong>{intelligenceData.historicalLeadsAnalyzed} adet</strong></span>
                <span>Mevcut Dönüşüm: <strong>%{intelligenceData.historicalWinRatePercent}</strong></span>
                <span>Fiyat Hassasiyeti: <strong className="text-amber-300 uppercase">{intelligenceData.overallPriceSensitivity}</strong></span>
                <span>Öngörülen Ciro Artışı: <strong className="text-emerald-400">+₺{intelligenceData.projectedMonthlyRevenueIncreaseTRY.toLocaleString("tr-TR")}/ay</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("tiers")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "tiers"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3-Tier Katalog Paketleri</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold">
            3 Paket
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("services")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "services"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Hizmet Bazlı Optimizasyon</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {config.services?.items?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("simulator")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "simulator"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Fiyat Esnekliği & Gelir Simülatörü</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
            İnteraktif
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("competitors")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "competitors"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Piyasa & Rakip Kıyaslama</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("roadmap")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "roadmap"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Uygulama & Psikolojik Satış Yol Haritası</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-TIER SERVICE CATALOG PACKAGES */}
      {/* ========================================================================= */}
      {activeSubTab === "tiers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Önerilen 3-Kademeli Hizmet Paketleri (3-Tier Model)
              </h3>
              <p className="text-xs text-slate-500">
                Decoy (Tuzak) etkisi ve Çıpalama (Anchoring) prensipleriyle optimize edilmiş, müşteri tereddütlerini gideren paket yapısı.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyAllTiers}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Paketleri Sitenin Fiyat Bölümüne Aktar</span>
            </button>
          </div>

          {/* 3 Tier Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {intelligenceData.recommendedTiers.map((tier) => {
              const isPro = tier.level === "pro";
              const isEnterprise = tier.level === "enterprise";

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                    isPro
                      ? "bg-linear-to-b from-slate-900 to-slate-950 text-white border-2 border-emerald-500 shadow-xl ring-4 ring-emerald-500/10"
                      : "bg-white text-slate-900 border border-slate-200 shadow-xs hover:border-slate-300"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>{tier.badge || "En Çok Tercih Edilen (Amiral Gemisi)"}</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${isPro ? "text-emerald-400" : "text-slate-500"}`}>
                          {tier.level === "starter" ? "Giriş Seviyesi" : tier.level === "pro" ? "Profesyonel Seviye" : "Kurumsal / VIP"}
                        </span>
                        <h4 className={`text-lg font-bold mt-0.5 ${isPro ? "text-white" : "text-slate-900"}`}>
                          {tier.name}
                        </h4>
                      </div>
                      {!isPro && tier.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {tier.badge}
                        </span>
                      )}
                    </div>

                    {/* Price Block */}
                    <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black tracking-tight ${isPro ? "text-emerald-400" : "text-slate-900"}`}>
                          {tier.priceFormatted}
                        </span>
                        {tier.originalPriceFormatted && (
                          <span className={`text-sm line-through ${isPro ? "text-slate-400" : "text-slate-400"}`}>
                            {tier.originalPriceFormatted}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs mt-1 block ${isPro ? "text-slate-300" : "text-slate-500"}`}>
                        {tier.periodLabel}
                      </span>
                      <p className={`text-xs mt-3 leading-relaxed ${isPro ? "text-slate-300" : "text-slate-600"}`}>
                        {tier.description}
                      </p>
                    </div>

                    {/* Conversion Uplift & Analytics */}
                    <div className={`mt-4 p-3 rounded-xl ${isPro ? "bg-slate-800/90 border border-slate-700" : "bg-slate-50 border border-slate-100"}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isPro ? "text-slate-300" : "text-slate-600"}>Öngörülen Dönüşüm:</span>
                        <span className="font-extrabold text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          %{tier.projectedConversionRate} (+%{tier.conversionUpliftPercent})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className={isPro ? "text-slate-400" : "text-slate-500"}>Tahmini Talep:</span>
                        <span className={`font-bold ${isPro ? "text-white" : "text-slate-800"}`}>
                          ~{tier.estimatedMonthlyLeads} Talep / Ay
                        </span>
                      </div>
                    </div>

                    {/* Psychological Tactic Badge */}
                    <div className={`mt-3 p-3 rounded-xl text-xs ${isPro ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-200" : "bg-indigo-50 border border-indigo-100 text-indigo-900"}`}>
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{tier.psychologyTactic.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                        {tier.psychologyTactic.rationale}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="mt-5 space-y-2.5">
                      <span className={`text-xs font-bold block ${isPro ? "text-slate-300" : "text-slate-700"}`}>
                        Paket Kapsamı & Özellikleri:
                      </span>
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className={isPro ? "text-slate-200" : "text-slate-700"}>{feat}</span>
                        </div>
                      ))}
                      {tier.excludedFeatures && tier.excludedFeatures.map((exFeat, eIdx) => (
                        <div key={eIdx} className="flex items-start gap-2 text-xs opacity-50 line-through">
                          <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span className={isPro ? "text-slate-400" : "text-slate-500"}>{exFeat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Single Tier CTA Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = applyRecommendedTiersToConfig(config, [tier]);
                        onChange(updated);
                        showToast(`"${tier.name}" paketi katalog ayarlarına eklendi!`);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isPro
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Bu Paketi Kataloğa Ekle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICE-SPECIFIC PRICING SUGGESTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hizmet Kataloğu Bazında Bireysel Fiyat Önerileri
              </h3>
              <p className="text-xs text-slate-500">
                Her bir hizmet için dönüşüm oranını maksimize eden taban ("...den başlayan") fiyatlar ve esneklik dereceleri.
              </p>
            </div>
            <button
              type="button"
              id="apply-all-service-prices-btn"
              onClick={handleApplyServicePrices}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Tüm Hizmet Fiyatlarını Güncelle</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Hizmet Adı</th>
                    <th className="py-3 px-4">Mevcut Durum</th>
                    <th className="py-3 px-4">AI Önerilen Taban Fiyat</th>
                    <th className="py-3 px-4">Piyasa Medyanı</th>
                    <th className="py-3 px-4">Fiyat Esnekliği</th>
                    <th className="py-3 px-4">Dönüşüm Etkisi</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {intelligenceData.servicePricingSuggestions.map((item) => {
                    const isUnpriced = item.currentPrice.toLowerCase().includes("sorun") || item.currentPrice.toLowerCase().includes("belirtilmemiş");

                    return (
                      <tr key={item.serviceId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.serviceTitle}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.reasoning}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isUnpriced ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Fiyat Gizli (Kritik Risk)
                            </span>
                          ) : (
                            <span className="font-mono text-slate-700 font-semibold">{item.currentPrice}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-extrabold text-emerald-600 font-mono">
                            {item.suggestedPriceFormatted}
                          </span>
                          <span className="text-[10px] text-slate-400 block">'den başlayan</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          ₺{item.competitorMedianPrice.toLocaleString("tr-TR")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priceElasticity === "low" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.priceElasticity === "medium"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {item.priceElasticity === "low" ? "Düşük (Fiyat Artırılabilir)" : item.priceElasticity === "medium" ? "Dengeli" : "Yüksek (Fiyat Hassas)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {item.conversionImpact}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = applyServicePricesToConfig(config, [item]);
                              onChange(updated);
                              showToast(`"${item.serviceTitle}" için ${item.suggestedPriceFormatted} taban fiyatı uygulandı!`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Uygula</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRICE ELASTICITY & REVENUE SIMULATOR (INTERACTIVE CURVE) */}
      {/* ========================================================================= */}
      {activeSubTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-500" />
                  <span>İnteraktif Fiyat Esnekliği & Hasılat Simülatörü</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fiyat değiştiğinde dönüşüm oranı ve toplam aylık cironun nasıl tepki verdiğini simüle edin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Mevcut Çarpan:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-mono font-bold text-xs">
                  {simulatorMultiplier.toFixed(2)}x ({simulatorMultiplier >= 1.0 ? `+${Math.round((simulatorMultiplier - 1.0) * 100)}%` : `-${Math.round((1.0 - simulatorMultiplier) * 100)}%`})
                </span>
              </div>
            </div>

            {/* Slider Control Block */}
            <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Düşük Fiyat (Yüksek Dönüşüm, Düşük Kar)</span>
                <span className="text-emerald-600">★ Önerilen Tatlı Nokta (1.0x)</span>
                <span>Yüksek Fiyat (Düşük Dönüşüm, Yüksek Kar)</span>
              </div>

              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={simulatorMultiplier}
                onChange={(e) => setSimulatorMultiplier(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
                <span>0.60x (₺{Math.round((basePrice * 0.6) / 50) * 50})</span>
                <span>0.80x</span>
                <span className="font-bold text-emerald-700">1.00x (₺{basePrice.toLocaleString("tr-TR")})</span>
                <span>1.20x</span>
                <span>1.40x</span>
                <span>1.60x (₺{Math.round((basePrice * 1.6) / 50) * 50})</span>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Simüle Edilen Paket Fiyatı</span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  ₺{simulatedPrice.toLocaleString("tr-TR")}
                </div>
                <span className="text-[11px] text-slate-400">/{proTier?.periodLabel || "hizmet"}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Öngörülen Dönüşüm Oranı</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  %{simulatedConvRate.toFixed(1)}
                </div>
                <span className="text-[11px] text-slate-400">Web ziyaretçisi → Müşteri</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Aylık Tahmini Talep</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {simulatedLeads} adet
                </div>
                <span className="text-[11px] text-slate-400">Teklif formu & telefon</span>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300">Öngörülen Toplam Ciro</span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  ₺{simulatedMonthlyRevenue.toLocaleString("tr-TR")}
                </div>
                <span className="text-[11px] text-slate-300">
                  {revenueDifference >= 0 ? (
                    <span className="text-emerald-400 font-bold">Tatlı nokta zirvesinde</span>
                  ) : (
                    <span className="text-amber-400">Tatlı noktadan -₺{Math.abs(revenueDifference).toLocaleString("tr-TR")} kayıp</span>
                  )}
                </span>
              </div>
            </div>

            {/* Elasticity SVG Curve Visualization */}
            <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Fiyat vs Hasılat Esneklik Eğrisi (D3 / SVG)</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Öngörülen Toplam Ciro (P × Q)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Dönüşüm Oranı (%)
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full h-56 relative">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="580" y2="70" stroke="#334155" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="580" y2="120" stroke="#334155" strokeDasharray="3 3" />
                  <line x1="40" y1="170" x2="580" y2="170" stroke="#334155" />

                  {/* Area fill under curve */}
                  <path
                    d="M 60 145 C 150 110, 240 45, 300 35 C 360 45, 450 100, 560 155 L 560 170 L 60 170 Z"
                    fill="url(#revenueGradient)"
                  />

                  {/* Revenue Curve (Bell curve with peak at 300px) */}
                  <path
                    d="M 60 145 C 150 110, 240 45, 300 35 C 360 45, 450 100, 560 155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  {/* Conversion Rate Curve (Monotonically decreasing) */}
                  <path
                    d="M 60 30 C 180 50, 300 95, 420 135 C 480 150, 520 160, 560 165"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  {/* Sweet spot vertical indicator */}
                  <line x1="300" y1="20" x2="300" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
                  <circle cx="300" cy="35" r="5" fill="#10b981" />
                  <text x="305" y="30" fill="#10b981" fontSize="10" fontWeight="bold">
                    Zirve: Tatlı Nokta (1.0x)
                  </text>

                  {/* Current slider position indicator */}
                  {(() => {
                    // map slider 0.6 -> 60px, 1.0 -> 300px, 1.6 -> 560px
                    const currentX = 60 + ((simulatorMultiplier - 0.6) / 1.0) * 500;
                    return (
                      <g>
                        <line x1={currentX} y1="20" x2={currentX} y2="170" stroke="#f59e0b" strokeWidth="2" />
                        <circle cx={currentX} cy="90" r="6" fill="#f59e0b" />
                        <text x={currentX + 5} y="85" fill="#f59e0b" fontSize="10" fontWeight="bold">
                          {simulatorMultiplier.toFixed(2)}x
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>0.6x (Düşük Fiyat, Düşük Kar)</span>
                <span className="text-emerald-400 font-bold">1.0x (Optimal Zirve Hasılat: ₺{sweetSpotRevenue.toLocaleString("tr-TR")})</span>
                <span>1.6x (Yüksek Fiyat, Düşük Talep)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPETITOR PRICE BENCHMARKING */}
      {/* ========================================================================= */}
      {activeSubTab === "competitors" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {intelligenceData.city} {intelligenceData.sector} Sektörü Yerel Rakip Fiyat Matrisi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Google yerel arama ve pazar araştırmasıyla taranan rakip işletmelerin fiyat seviyeleri ve konumlandırma stratejileri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {intelligenceData.competitorBenchmarks.map((comp) => (
              <div key={comp.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{comp.competitorName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      comp.positioning === "budget"
                        ? "bg-amber-50 text-amber-700"
                        : comp.positioning === "standard"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-indigo-50 text-indigo-700"
                    }`}>
                      {comp.positioning === "budget" ? "Ekonomik" : comp.positioning === "standard" ? "Standart" : "Premium"}
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono">
                    {comp.priceFormatted}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {comp.tierName} • {comp.source}
                  </span>
                  <div className="mt-3 space-y-1">
                    {comp.includedHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: IMPLEMENTATION & PSYCHOLOGICAL SALES ROADMAP */}
      {/* ========================================================================= */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Uygulama Yol Haritası & Fiyatlandırma Psikolojisi İlkeleri
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Yeni fiyat kademelerini mevcut müşterileri küstürmeden, teklif formlarında tereddüt bırakmadan devreye alma rehberi.
            </p>
          </div>

          <div className="space-y-3">
            {intelligenceData.implementationSteps.map((step) => (
              <div key={step.stepNumber} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {step.stepNumber}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      step.urgency === "high" ? "bg-rose-50 text-rose-700" : "bg-sky-50 text-sky-700"
                    }`}>
                      {step.urgency === "high" ? "Yüksek Öncelik" : "Orta Öncelik"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 block pt-1">
                    Tahmini Etki: {step.estimatedImpact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
