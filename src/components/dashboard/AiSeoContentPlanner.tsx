import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Calendar, 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Tag, 
  Lightbulb, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Compass, 
  Target, 
  AlertCircle,
  FileText,
  SlidersHorizontal,
  BookmarkCheck,
  Zap,
  Info
} from "lucide-react";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  AiContentPlanResponse, 
  ContentCalendarDay, 
  ContentPlanDayStatus,
  ContentPlanSearchIntent,
  ContentPlanContentType 
} from "../../types";
import { 
  fetchAiContentPlan, 
  loadSavedContentPlan, 
  saveContentPlan, 
  updateCalendarDayStatus, 
  exportContentPlanToCsv, 
  exportContentPlanToIcs, 
  exportContentPlanToMarkdown,
  extractSiteKeywords,
  generateFallbackContentPlan
} from "../../utils/aiContentPlannerEngine";

interface AiSeoContentPlannerProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  onSendToAiBlog?: (headline: string, primaryKeyword: string, audienceName?: string) => void;
}

export const AiSeoContentPlanner: React.FC<AiSeoContentPlannerProps> = ({
  config,
  onNavigateTab,
  onSendToAiBlog
}) => {
  const siteKey = config.companyName || "default";

  // State
  const [plan, setPlan] = useState<AiContentPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeWeek, setActiveWeek] = useState<number>(0); // 0 = all
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [selectedContentType, setSelectedContentType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Customization Form State for Regeneration
  const [customKeywordsInput, setCustomKeywordsInput] = useState<string>("");
  const [audienceFocusInput, setAudienceFocusInput] = useState<string>("all");
  const [customGoalInput, setCustomGoalInput] = useState<string>("");
  const [toneInput, setToneInput] = useState<string>("authoritative_approachable");

  // Load cached plan or generate fallback on mount
  useEffect(() => {
    const cached = loadSavedContentPlan(siteKey);
    if (cached) {
      setPlan(cached);
    } else {
      // Generate initial fallback plan instantly so user never sees an empty screen
      const initialFallback = generateFallbackContentPlan(config);
      setPlan(initialFallback);
      saveContentPlan(initialFallback, siteKey);
    }
  }, [siteKey]);

  // Handle Toast timeout
  useEffect(() => {
    if (copiedToast) {
      const timer = setTimeout(() => setCopiedToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [copiedToast]);

  // Trigger Gemini Plan Generation
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setShowConfigModal(false);

    const customKeywords = customKeywordsInput
      ? customKeywordsInput.split(",").map(k => k.trim()).filter(Boolean)
      : undefined;

    try {
      const generated = await fetchAiContentPlan({
        config,
        customKeywords,
        audienceFocus: audienceFocusInput !== "all" ? audienceFocusInput : undefined,
        tone: toneInput,
        customGoal: customGoalInput.trim() || undefined
      });
      setPlan(generated);
      setCopiedToast("30 Günlük İçerik Takvimi Gemini AI ile başarıyla oluşturuldu!");
    } catch (err) {
      console.error("Content Planner Generation error:", err);
      const fallback = generateFallbackContentPlan(config, customKeywords, audienceFocusInput, toneInput);
      setPlan(fallback);
      setCopiedToast("İçerik planı oluşturuldu (Yedek motor ile güncellendi).");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Day Status (Planned -> In-Progress -> Published)
  const handleStatusChange = (dayNum: number, newStatus: ContentPlanDayStatus) => {
    if (!plan) return;
    const updated = updateCalendarDayStatus(plan, dayNum, newStatus, siteKey);
    setPlan(updated);
  };

  // One-click Send to AI Blog Engine
  const handleSendToBlog = (day: ContentCalendarDay) => {
    if (onSendToAiBlog) {
      onSendToAiBlog(day.headline, day.primaryKeyword, day.targetAudienceName);
    } else {
      try {
        sessionStorage.setItem("ai_blog_prefill_topic", day.headline);
        sessionStorage.setItem("ai_blog_prefill_keyword", day.primaryKeyword);
      } catch (e) {
        // ignore
      }
      if (onNavigateTab) {
        onNavigateTab("ai-blog-engine");
      }
    }
  };

  // Copy helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(`${label} panoya kopyalandı!`);
  };

  // Export handlers
  const handleDownloadCsv = () => {
    if (!plan) return;
    const csvContent = exportContentPlanToCsv(plan);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.companyName || "Site"}_30_Gunluk_SEO_Icerik_Takvimi.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedToast("CSV takvim dosyası indirildi!");
  };

  const handleDownloadIcs = () => {
    if (!plan) return;
    const icsContent = exportContentPlanToIcs(plan);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.companyName || "Site"}_SEO_Blog_Takvimi.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedToast("iCal (.ics) takvim dosyası indirildi!");
  };

  const handleCopyMarkdown = () => {
    if (!plan) return;
    const md = exportContentPlanToMarkdown(plan);
    navigator.clipboard.writeText(md);
    setCopiedToast("30 Günlük Editoryal Plan Markdown olarak kopyalandı!");
  };

  // Filtered days based on week, audience, content type, search
  const filteredDays = useMemo(() => {
    if (!plan) return [];
    return plan.days.filter(day => {
      // Week filter
      if (activeWeek !== 0 && day.week !== activeWeek) return false;
      // Audience filter
      if (selectedAudience !== "all" && day.targetAudienceId !== selectedAudience) return false;
      // Content type filter
      if (selectedContentType !== "all" && day.contentType !== selectedContentType) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesHeadline = day.headline.toLowerCase().includes(q);
        const matchesKw = day.primaryKeyword.toLowerCase().includes(q);
        const matchesAudience = day.targetAudienceName.toLowerCase().includes(q);
        const matchesAlt = day.alternativeHeadlines?.some(alt => alt.toLowerCase().includes(q));
        if (!matchesHeadline && !matchesKw && !matchesAudience && !matchesAlt) return false;
      }
      return true;
    });
  }, [plan, activeWeek, selectedAudience, selectedContentType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!plan) return { total: 30, planned: 29, inProgress: 1, published: 0, completionRate: 0 };
    const total = plan.days.length;
    const planned = plan.days.filter(d => d.status === "planned").length;
    const inProgress = plan.days.filter(d => d.status === "in-progress").length;
    const published = plan.days.filter(d => d.status === "published").length;
    const completionRate = Math.round(((published + inProgress * 0.5) / total) * 100);
    return { total, planned, inProgress, published, completionRate };
  }, [plan]);

  // Badges styling
  const getIntentBadge = (intent: ContentPlanSearchIntent) => {
    switch (intent) {
      case "Bilgilendirici":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40";
      case "Ticari":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40";
      case "İşlemsel":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
      case "Acil / Yerel":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPotentialBadge = (pot: string) => {
    if (pot.includes("Hızlı Kazanım") || pot.includes("Quick Win")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    }
    if (pot.includes("Otorite")) {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300";
    }
    if (pot.includes("Yüksek Dönüşüm")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    }
    return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
  };

  const getStatusBadge = (status: ContentPlanDayStatus) => {
    switch (status) {
      case "published":
        return {
          label: "Yayınlandı",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400",
          icon: CheckCircle2
        };
      case "in-progress":
        return {
          label: "Yazılıyor",
          className: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400",
          icon: Clock
        };
      case "planned":
      default:
        return {
          label: "Planlandı",
          className: "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800 dark:text-slate-400",
          icon: BookmarkCheck
        };
    }
  };

  return (
    <div className="space-y-6 pb-12" id="ai-seo-content-planner-container">
      {/* TOAST NOTIFICATION */}
      {copiedToast && (
        <div 
          id="content-planner-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* HEADER HERO / STRATEGY BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Gemini 3.8 Flash Destekli
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                30 Günlük Editoryal SEO Takvimi
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {plan?.companyName} • {plan?.sector} • {plan?.city}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI SEO İçerik Planlayıcı
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Google arama niyetine göre optimize edilmiş, dikkat çekici (High-CTR) başlıklar ve 4 kitle segmentini hedefleyen tam 30 günlük blog içerik stratejisi. Tek tıkla AI Blog Motoru'nda tam metne dönüştürün.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="open-planner-config-modal-btn"
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Ayarlar & Anahtar Kelimeler</span>
            </button>

            <button
              type="button"
              id="regenerate-content-plan-btn"
              onClick={handleGeneratePlan}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Gemini Planlıyor..." : "Gemini ile Yenile"}</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-xs rounded-xl p-3.5 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Toplam Planlanan</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              30 Gün
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              5 Haftalık Editoryal Akış
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs rounded-xl p-3.5 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hedef Kitle Segmenti</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
              {plan?.primaryAudienceSegments?.length || 4} Segment
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              B2B, Acil, Bütçe & Kalite
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs rounded-xl p-3.5 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tahmini Aylık Arama</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {plan?.totalExpectedMonthlyImpressions || "86,400+ / ay"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Google SERP Potansiyeli
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xs rounded-xl p-3.5 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yayınlama İlerlemesi</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono flex items-center gap-2">
              <span>%{stats.completionRate}</span>
              <span className="text-xs font-normal text-slate-400">
                ({stats.published} / 30)
              </span>
            </div>
            {/* Tiny progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, stats.completionRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC AUDIENCE SEGMENTS HIGHLIGHT SECTION */}
      {plan?.primaryAudienceSegments && plan.primaryAudienceSegments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Hedef Kitle Segmentleri & Arama Niyetleri
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Bu 30 günlük takvim, her kitle için özel psikolojik kancalarla kurgulanmıştır
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {plan.primaryAudienceSegments.map((segment) => {
              const isSelected = selectedAudience === segment.id;
              return (
                <div
                  key={segment.id}
                  onClick={() => setSelectedAudience(isSelected ? "all" : segment.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-400 ring-2 ring-indigo-500/30"
                      : "bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                      {segment.badge}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getIntentBadge(segment.searchIntent)}`}>
                      {segment.searchIntent}
                    </span>
                  </div>

                  <div className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    {segment.name}
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2.5">
                    {segment.description}
                  </p>

                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 shrink-0" />
                    <span className="truncate">{segment.hookAngle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER & CONTROL TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Hafta:
            </span>
            {[
              { num: 0, label: "Tümü (30 Gün)" },
              { num: 1, label: "1. Hafta (Gün 1-7)" },
              { num: 2, label: "2. Hafta (Gün 8-14)" },
              { num: 3, label: "3. Hafta (Gün 15-21)" },
              { num: 4, label: "4. Hafta (Gün 22-28)" },
              { num: 5, label: "5. Hafta (Gün 29-30)" },
            ].map(w => (
              <button
                key={w.num}
                type="button"
                id={`filter-week-${w.num}-btn`}
                onClick={() => setActiveWeek(w.num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeWeek === w.num
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Search Bar & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="content-planner-search-input"
                placeholder="Başlık, anahtar kelime veya kitle ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                id="view-mode-grid-btn"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Kart Izgara Görünümü"
              >
                Izgara
              </button>
              <button
                type="button"
                id="view-mode-list-btn"
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Editoryal Akış Listesi"
              >
                Liste
              </button>
            </div>

            {/* Export Menu */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="export-csv-btn"
                onClick={handleDownloadCsv}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                title="CSV İndir (Excel / Google Sheets)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                type="button"
                id="export-ics-btn"
                onClick={handleDownloadIcs}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                title="iCalendar (.ics) İndir (Google Takvim, Outlook)"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">iCal (.ics)</span>
              </button>

              <button
                type="button"
                id="export-markdown-btn"
                onClick={handleCopyMarkdown}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                title="Markdown Olarak Kopyala"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Markdown</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Indicator */}
        {(selectedAudience !== "all" || selectedContentType !== "all" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Aktif Filtreler:</span>
            {selectedAudience !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-[11px] font-semibold">
                Kitle: {plan?.primaryAudienceSegments.find(a => a.id === selectedAudience)?.name || selectedAudience}
                <button type="button" onClick={() => setSelectedAudience("all")} className="hover:text-indigo-950 font-bold">×</button>
              </span>
            )}
            {selectedContentType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-[11px] font-semibold">
                Tür: {selectedContentType}
                <button type="button" onClick={() => setSelectedContentType("all")} className="hover:text-purple-950 font-bold">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                Arama: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery("")} className="hover:text-amber-950 font-bold">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedAudience("all");
                setSelectedContentType("all");
                setSearchQuery("");
                setActiveWeek(0);
              }}
              className="text-xs text-rose-500 hover:underline font-semibold ml-auto"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        )}
      </div>

      {/* DAYS DISPLAY: GRID OR LIST VIEW */}
      {filteredDays.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Info className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Kriterlere uygun içerik günü bulunamadı
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Arama sorgunuzu veya seçili filtreleri temizleyerek tüm 30 günlük editoryal takvimi görüntüleyebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedAudience("all");
              setSelectedContentType("all");
              setSearchQuery("");
              setActiveWeek(0);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
          >
            Tüm Takvimi Göster
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDays.map((day) => {
            const isExpanded = expandedDay === day.day;
            const statusConfig = getStatusBadge(day.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={day.day}
                id={`calendar-day-card-${day.day}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                  day.status === "published"
                    ? "border-emerald-200 dark:border-emerald-950/60"
                    : day.status === "in-progress"
                    ? "border-amber-200 dark:border-amber-950/60 ring-1 ring-amber-400/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {/* CARD TOP HEADER */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 text-amber-400 dark:bg-slate-800 dark:text-amber-300 font-mono">
                        GÜN {day.day < 10 ? `0${day.day}` : day.day}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {day.scheduledDate ? new Date(day.scheduledDate).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }) : `${day.week}. Hafta`}
                      </span>
                    </div>

                    {/* STATUS SELECTOR PILL */}
                    <div className="relative">
                      <select
                        aria-label={`Gün ${day.day} Durum`}
                        value={day.status}
                        onChange={(e) => handleStatusChange(day.day, e.target.value as ContentPlanDayStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border appearance-none pr-6 cursor-pointer focus:outline-hidden ${statusConfig.className}`}
                      >
                        <option value="planned">Planlandı</option>
                        <option value="in-progress">Yazılıyor</option>
                        <option value="published">Yayınlandı</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>

                  {/* CATCHY HEADLINE */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
                      {day.headline}
                    </h3>
                  </div>

                  {/* KEYWORD & VOLUME */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      <Tag className="w-3 h-3 text-amber-500" />
                      {day.primaryKeyword}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800">
                      {day.estimatedMonthlySearchVolume}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getPotentialBadge(day.rankingPotential)}`}>
                      {day.rankingPotential}
                    </span>
                  </div>

                  {/* TARGET AUDIENCE & SEARCH INTENT */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                      {day.targetAudienceName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getIntentBadge(day.searchIntent)}`}>
                      {day.searchIntent}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {day.contentType}
                    </span>
                  </div>

                  {/* EXPANDABLE DETAILS */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-in fade-in duration-150">
                      {/* ALTERNATIVE HEADLINES */}
                      {day.alternativeHeadlines && day.alternativeHeadlines.length > 0 && (
                        <div className="space-y-1 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            Alternatif Başlık Varyasyonları (CTR):
                          </div>
                          {day.alternativeHeadlines.map((alt, i) => (
                            <div 
                              key={i} 
                              onClick={() => handleCopyText(alt, "Alternatif Başlık")}
                              className="text-[11px] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Kopyalamak için tıklayın"
                            >
                              <span>• {alt}</span>
                              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OUTLINE / KEY TAKEAWAYS */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          İçerik Taslağı & Kritik Maddeler:
                        </div>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                          {day.keyTakeaways.map((point, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA & PAIN POINT */}
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-[11px] space-y-1">
                        <div className="font-semibold text-amber-900 dark:text-amber-300">
                          🎯 Hedef Eylem Çağrısı (CTA):
                        </div>
                        <div className="text-slate-700 dark:text-slate-300">
                          {day.callToAction}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD ACTION FOOTER */}
                <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-850/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? "Daralt" : "Taslak & Detay"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(day.headline, "Başlık")}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Başlığı Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* ACTION: GENERATE IN AI BLOG ENGINE */}
                    <button
                      type="button"
                      id={`send-day-${day.day}-to-blog-btn`}
                      onClick={() => handleSendToBlog(day)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Bu konuyu AI Blog Motoru'nda tam metin olarak yazdır"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Blog'da Yaz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Gün</th>
                  <th className="py-3 px-4 min-w-[280px]">Çekici Başlık (Headline)</th>
                  <th className="py-3 px-4">Odak Kelime</th>
                  <th className="py-3 px-4">Hedef Kitle</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Aylık Hacim</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDays.map((day) => {
                  const statusConfig = getStatusBadge(day.status);
                  return (
                    <tr 
                      key={day.day} 
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-black text-amber-500">
                        #{day.day < 10 ? `0${day.day}` : day.day}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="line-clamp-2">{day.headline}</div>
                        {day.alternativeHeadlines?.[0] && (
                          <div className="text-[10px] text-slate-400 font-normal italic mt-0.5 line-clamp-1">
                            Alt: {day.alternativeHeadlines[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {day.primaryKeyword}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {day.targetAudienceName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {day.contentType}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {day.estimatedMonthlySearchVolume}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          aria-label={`Tablo Gün ${day.day} Durum`}
                          value={day.status}
                          onChange={(e) => handleStatusChange(day.day, e.target.value as ContentPlanDayStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${statusConfig.className}`}
                        >
                          <option value="planned">Planlandı</option>
                          <option value="in-progress">Yazılıyor</option>
                          <option value="published">Yayınlandı</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSendToBlog(day)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Blog'da Yaz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STRATEGIC RECOMMENDATIONS & BEST PRACTICES */}
      {plan?.strategicRecommendations && plan.strategicRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
              30 Günlük Editoryal Başarı İçin Kıdemli SEO Tavsiyeleri
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {plan.strategicRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIGURATION & REGENERATION MODAL */}
      {showConfigModal && (
        <div 
          id="planner-config-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  30 Günlük Takvim Parametreleri
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Özel Odak Anahtar Kelimeler (Virgülle Ayırın)
                </label>
                <input
                  type="text"
                  placeholder="Örn: evden eve nakliyat, asansörlü taşıma, 2026 nakliye fiyatları"
                  value={customKeywordsInput}
                  onChange={(e) => setCustomKeywordsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Boş bırakırsanız sitenizin mevcut SEO ve hizmet anahtar kelimeleri otomatik kullanılır.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Özel Hedef veya Kampanya Vurgusu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Bahar temizliği kampanyası, kurumsal fabrika taşımacılığı ağırlıklı"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hedef Kitle Önceliği
                </label>
                <select
                  value={audienceFocusInput}
                  onChange={(e) => setAudienceFocusInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Dengeli Dağılım (Tüm Kitleler: B2B, Acil, Bütçe, Kalite)</option>
                  <option value="b2b-decision-makers">B2B Karar Vericiler & Şirket Yöneticileri Ağırlıklı</option>
                  <option value="emergency-local-seekers">Acil Durum & 7/24 Hizmet Arayanlar Ağırlıklı</option>
                  <option value="budget-conscious-buyers">Fiyat & Bütçe Bilinçli Müşteriler Ağırlıklı</option>
                  <option value="quality-researchers">Kalite, Sertifikasyon & Garanti Arayanlar Ağırlıklı</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  İçerik Tonu
                </label>
                <select
                  value={toneInput}
                  onChange={(e) => setToneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="authoritative_approachable">Otoriter ama Samimi (Önerilen E-E-A-T)</option>
                  <option value="direct_commercial">Doğrudan Ticari & Satış Odaklı</option>
                  <option value="educational_guide">Eğitici & Teknik Kılavuz</option>
                  <option value="curiosity_viral">Merak Uyandıran & Viral CTR</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
              >
                Gemini ile 30 Günü Planla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
