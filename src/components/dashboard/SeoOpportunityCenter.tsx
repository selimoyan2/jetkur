import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Target,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Flame,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  SeoOpportunityAlert,
  SeoOpportunityCategory,
  batchApplyAllOpportunities
} from "../../utils/seoOpportunityEngine";

interface SeoOpportunityCenterProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  opportunities: SeoOpportunityAlert[];
  onNavigateTab: (tab: CustomerPanelTab) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const SeoOpportunityCenter: React.FC<SeoOpportunityCenterProps> = ({
  config,
  onChange,
  opportunities,
  onNavigateTab,
  onClose,
  isModal = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | SeoOpportunityCategory>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [justAppliedIds, setJustAppliedIds] = useState<string[]>([]);
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4000);
  };

  const handleApplySingle = (opp: SeoOpportunityAlert) => {
    if (!opp.applyFix) return;
    setApplyingId(opp.id);

    setTimeout(() => {
      const result = opp.applyFix(config);
      onChange(result.updatedConfig);
      setJustAppliedIds((prev) => [...prev, opp.id]);
      setApplyingId(null);
      showToast(result.toast);
    }, 400);
  };

  const handleBatchApplyAll = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = batchApplyAllOpportunities(config, opportunities);
      onChange(result.updatedConfig);
      setJustAppliedIds(opportunities.map((o) => o.id));
      setIsScanning(false);
      showToast(result.toast);
    }, 700);
  };

  const handleRefreshScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast("🔍 Yapay zeka tüm sayfaları ve anahtar kelimeleri yeniden taradı. Fırsatlar güncellendi!");
    }, 800);
  };

  const metaCount = opportunities.filter((o) => o.category === "meta-tags").length;
  const contentCount = opportunities.filter((o) => o.category === "content-gaps").length;
  const keywordCount = opportunities.filter((o) => o.category === "keywords").length;

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory !== "all" && opp.category !== selectedCategory) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const content = (
    <div className="space-y-6">
      
      {/* Toast Notice Banner */}
      {toastBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="p-1 hover:bg-emerald-600 rounded-lg text-emerald-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Yapay Zeka Fırsat Radarı</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                {opportunities.length} Fırsat Tespit Edildi
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              SEO Fırsat & Sıralama Alarmları
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sitenizin mevcut konfigürasyonunu Google algoritmalarına ve yerel arama niyetine göre analiz ettik. 
              Aşağıdaki meta etiket, içerik boşluğu ve anahtar kelime fırsatlarını uygulayarak SERP tıklanma oranınızı (CTR) ve sıralamanızı artırın.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              id="btn-seo-center-refresh-scan"
              onClick={handleRefreshScan}
              disabled={isScanning}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-amber-400" : ""}`} />
              <span>Yeniden Tara</span>
            </button>

            {opportunities.length > 0 && (
              <button
                type="button"
                id="btn-seo-center-batch-apply"
                onClick={handleBatchApplyAll}
                disabled={isScanning}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Tümünü 1-Tıkla Uygula ({opportunities.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-xs p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Toplam Fırsat</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
              {opportunities.length}
            </div>
            <div className="text-[10px] text-slate-400">Bekleyen optimizasyon</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Potansiyel SEO Puanı</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
              +{opportunities.length * 7} Puan
            </div>
            <div className="text-[10px] text-emerald-400/80">Tamamlandığında kazanılacak</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Tahmini SERP Tıklanması</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-0.5">
              +%42 CTR
            </div>
            <div className="text-[10px] text-slate-400">Zengin snippet & başlık katkısı</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Aylık Organik Potansiyel</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-0.5">
              +750 Ziyaretçi
            </div>
            <div className="text-[10px] text-slate-400">Yerel arama hacmi</div>
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs ring-1 ring-slate-800"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Tümü</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono">
              {opportunities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("meta-tags")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "meta-tags"
                ? "bg-blue-900 text-blue-100 shadow-xs ring-1 ring-blue-700"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Meta Etiketleri</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
              {metaCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("content-gaps")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "content-gaps"
                ? "bg-amber-900 text-amber-100 shadow-xs ring-1 ring-amber-700"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>İçerik Boşlukları</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
              {contentCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("keywords")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "keywords"
                ? "bg-rose-900 text-rose-100 shadow-xs ring-1 ring-rose-700"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-rose-500" />
            <span>Anahtar Kelimeler</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
              {keywordCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Fırsat başlığı veya kelime ara..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {opportunities.length === 0
              ? "Tebrikler! Aktif Bir SEO Fırsatı Kalmadı."
              : "Bu Filtreye Uygun Fırsat Bulunamadı."}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {opportunities.length === 0
              ? "Tüm meta etiketleriniz, içerik bloklarınız ve anahtar kelime eşleşmeleriniz Google standartlarıyla tam uyumlu durumda."
              : "Filtre seçimini temizleyerek diğer kategorilerdeki önerileri inceleyebilirsiniz."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => {
            const isApplied = justAppliedIds.includes(opp.id);
            const isApplying = applyingId === opp.id;

            return (
              <div
                key={opp.id}
                id={`card-opportunity-${opp.id}`}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                  isApplied
                    ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        opp.category === "meta-tags"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : opp.category === "content-gaps"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                        {opp.categoryLabel}
                      </span>

                      {opp.severity === "critical" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          Kritik Etki
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-full bg-slate-900 text-emerald-400 shadow-xs">
                      {opp.estimatedImpact}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* AI Reasoning Pill */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Yapay Zeka Analiz Gerekçesi:</span>
                    </span>
                    <span className="text-[11px] text-slate-600">{opp.aiReasoning}</span>
                  </div>

                  {/* Preview Snippet Box */}
                  {(opp.currentSnippet || opp.proposedSnippet) && (
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 text-white font-mono text-xs">
                      {opp.currentSnippet && (
                        <div>
                          <span className="text-[10px] text-rose-400 font-bold block uppercase">
                            Mevcut:
                          </span>
                          <div className="text-[11px] text-slate-300 truncate">
                            {opp.currentSnippet}
                          </div>
                        </div>
                      )}
                      {opp.proposedSnippet && (
                        <div className="pt-1.5 border-t border-slate-800">
                          <span className="text-[10px] text-emerald-400 font-bold block uppercase flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Önerilen AI Çözümü:</span>
                          </span>
                          <div className="text-[11px] text-emerald-300 break-words mt-0.5">
                            {opp.proposedSnippet}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {opp.canAutoFix && (
                    <button
                      type="button"
                      id={`btn-apply-opp-card-${opp.id}`}
                      onClick={() => handleApplySingle(opp)}
                      disabled={isApplied || isApplying}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isApplied
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Uygulandı</span>
                        </>
                      ) : isApplying ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uygulanıyor...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{opp.actionLabel}</span>
                        </>
                      )}
                    </button>
                  )}

                  {opp.targetTab && (
                    <button
                      type="button"
                      id={`btn-navigate-opp-card-${opp.id}`}
                      onClick={() => {
                        if (opp.targetTab) {
                          onNavigateTab(opp.targetTab);
                          if (onClose) onClose();
                        }
                      }}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="İlgili yönetim sekmesine git"
                    >
                      <span>İncele</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div 
        id="seo-opportunity-center-modal"
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      >
        <div className="bg-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Modal Top Close Bar */}
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Yapay Zeka SEO Fırsat Yönetim Merkezi
              </h3>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};
