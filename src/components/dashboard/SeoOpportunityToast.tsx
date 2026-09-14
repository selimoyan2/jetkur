import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  Layers,
  FileText,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Check
} from "lucide-react";
import { SeoOpportunityAlert } from "../../utils/seoOpportunityEngine";
import { CustomerPanelTab } from "../../types";

interface SeoOpportunityToastProps {
  opportunities: SeoOpportunityAlert[];
  onApply: (opportunity: SeoOpportunityAlert) => void;
  onNavigateTab: (tab: CustomerPanelTab) => void;
  onOpenCenter: () => void;
  onDismiss: (opportunityId: string) => void;
}

export const SeoOpportunityToast: React.FC<SeoOpportunityToastProps> = ({
  opportunities,
  onApply,
  onNavigateTab,
  onOpenCenter,
  onDismiss
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpandedDiff, setIsExpandedDiff] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= opportunities.length && opportunities.length > 0) {
      setCurrentIndex(opportunities.length - 1);
    }
  }, [opportunities.length, currentIndex]);

  if (opportunities.length === 0) {
    return null;
  }

  const currentOpp = opportunities[currentIndex] || opportunities[0];
  if (!currentOpp) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : opportunities.length - 1));
    setIsExpandedDiff(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < opportunities.length - 1 ? prev + 1 : 0));
    setIsExpandedDiff(false);
  };

  const handleApplyClick = async () => {
    setApplyingId(currentOpp.id);
    try {
      onApply(currentOpp);
      setJustAppliedId(currentOpp.id);
      setTimeout(() => {
        setJustAppliedId(null);
        setApplyingId(null);
      }, 1200);
    } catch {
      setApplyingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meta-tags":
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case "content-gaps":
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case "keywords":
        return <Target className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div 
        id="seo-opportunity-toast-minimized"
        className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/95 text-white rounded-full border border-amber-500/40 shadow-2xl backdrop-blur-md hover:border-amber-400 transition-all cursor-pointer group"
          onClick={() => setIsMinimized(false)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 relative" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">SEO Fırsat Alarmı:</span>
            <span className="text-slate-200 max-w-[180px] sm:max-w-[240px] truncate">
              {currentOpp.title}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black border border-amber-500/30">
            {currentIndex + 1}/{opportunities.length}
          </span>

          <button
            type="button"
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Alarmı Büyüt"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Actionable Toast Card
  return (
    <div
      id="seo-opportunity-toast-container"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[450px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-slate-950/95 text-white rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
        
        {/* Top Gradient Ribbon / Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / opportunities.length) * 100}%` }}
          />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-tight flex items-center gap-1">
                  <span>SEO Fırsat Alarmı</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                  {getCategoryIcon(currentOpp.category)}
                  <span>{currentOpp.categoryLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Counter, Navigation & Minimize/Dismiss */}
          <div className="flex items-center gap-1">
            {opportunities.length > 1 && (
              <div className="flex items-center gap-0.5 bg-slate-800/80 px-1.5 py-0.5 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300 mr-1">
                <button
                  type="button"
                  id="toast-prev-opp-btn"
                  onClick={handlePrev}
                  className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Önceki Fırsat"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="font-black px-1 text-amber-300">
                  {currentIndex + 1}/{opportunities.length}
                </span>
                <button
                  type="button"
                  id="toast-next-opp-btn"
                  onClick={handleNext}
                  className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Sonraki Fırsat"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              type="button"
              id="toast-minimize-btn"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Alarmı Küçült"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="toast-dismiss-btn"
              onClick={() => onDismiss(currentOpp.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Bu Alarmı Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          
          {/* Title & Estimated Impact */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-black text-white leading-snug tracking-tight">
                {currentOpp.title}
              </h4>
              {currentOpp.severity === "critical" && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
                  Kritik
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentOpp.description}
            </p>
          </div>

          {/* AI Impact Metric Badge */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Tahmini Kazanç:</span>
              <span className="text-xs font-black text-emerald-400 font-mono truncate block">
                {currentOpp.estimatedImpact}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpandedDiff(!isExpandedDiff)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpandedDiff ? "Gizle" : "Önizle"}</span>
              {isExpandedDiff ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Collapsible Diff / Proposed Preview */}
          {isExpandedDiff && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 animate-in fade-in duration-150 font-mono">
              {currentOpp.currentSnippet && (
                <div>
                  <span className="text-[10px] font-bold text-rose-400 block uppercase">
                    Mevcut Durum:
                  </span>
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80 break-words mt-0.5">
                    {currentOpp.currentSnippet}
                  </div>
                </div>
              )}

              {currentOpp.proposedSnippet && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Yapay Zeka Önerisi:</span>
                  </span>
                  <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/30 break-words mt-0.5">
                    {currentOpp.proposedSnippet}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-sans italic pt-1 border-t border-slate-800">
                💡 <span className="font-semibold text-slate-300">Neden önemli:</span> {currentOpp.aiReasoning}
              </div>
            </div>
          )}

          {/* Actionable Button Bar */}
          <div className="flex items-center gap-2 pt-1">
            {/* Primary Action: 1-Click Apply */}
            {currentOpp.canAutoFix && (
              <button
                type="button"
                id={`btn-apply-seo-opp-${currentOpp.id}`}
                onClick={handleApplyClick}
                disabled={Boolean(applyingId)}
                className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                  justAppliedId === currentOpp.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 text-white shadow-amber-500/20"
                }`}
              >
                {justAppliedId === currentOpp.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Uygulandı! (+Skor)</span>
                  </>
                ) : applyingId === currentOpp.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uygulanıyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{currentOpp.actionLabel}</span>
                  </>
                )}
              </button>
            )}

            {/* Secondary Action: Navigate to tab */}
            {currentOpp.targetTab && (
              <button
                type="button"
                id={`btn-inspect-seo-opp-${currentOpp.id}`}
                onClick={() => {
                  if (currentOpp.targetTab) {
                    onNavigateTab(currentOpp.targetTab);
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                title="İlgili ayar panelini aç"
              >
                <span>İncele</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* View All Center Trigger */}
            <button
              type="button"
              id="btn-open-seo-center-from-toast"
              onClick={onOpenCenter}
              className="py-2.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
              title="Tüm Fırsatları ve AI Raporunu Gör"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Tümü</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
