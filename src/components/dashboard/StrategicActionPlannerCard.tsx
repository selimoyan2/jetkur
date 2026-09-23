import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  SiteConfig, 
  StrategicActionPlan, 
  ActionPlanTask, 
  ContentOptimizationDirective,
  ActionTaskPriority,
  ActionTaskCategory
} from "../../types";
import { 
  generateFallbackStrategicActionPlan,
  loadCompletedTaskIds,
  saveCompletedTaskIds,
  exportActionPlanToCSV
} from "../../utils/strategicActionPlannerEngine";
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  Zap, 
  SlidersHorizontal, 
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  Search,
  BookOpen
} from "lucide-react";

interface StrategicActionPlannerCardProps {
  config: Partial<SiteConfig>;
  onNavigateTab?: (tabKey: string) => void;
  onOpenCustomReport?: () => void;
}

export const StrategicActionPlannerCard: React.FC<StrategicActionPlannerCardProps> = ({
  config,
  onNavigateTab,
  onOpenCustomReport
}) => {
  // Plan state (default fallback or Gemini generated)
  const [plan, setPlan] = useState<StrategicActionPlan>(() => {
    return generateFallbackStrategicActionPlan(config);
  });

  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiSuccessToast, setGeminiSuccessToast] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Active view tab inside the card
  const [activeTab, setActiveTab] = useState<"tasks" | "content" | "matrix" | "quickwins">("tasks");

  // Filtering state for tasks
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ActionTaskCategory | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<ActionTaskPriority | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Completed task IDs from localStorage
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => loadCompletedTaskIds());

  // Expanded task IDs
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({
    "task-m1-01": true,
    "task-m2-01": true,
    "task-m3-01": true
  });

  // Re-generate or sync when config changes
  useEffect(() => {
    const fallback = generateFallbackStrategicActionPlan(config);
    setPlan(prev => {
      // keep current tasks if user customized, otherwise refresh baseline
      return {
        ...fallback,
        tasks: fallback.tasks.map(t => ({
          ...t,
          completed: completedTaskIds.includes(t.id)
        }))
      };
    });
  }, [config, completedTaskIds]);

  // Handle task completion toggle
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setCompletedTaskIds(prev => {
      const next = prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId];
      saveCompletedTaskIds(next);
      return next;
    });
  }, []);

  // Toggle expand
  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Progress metrics calculation
  const totalTasks = plan.tasks.length;
  const completedCount = plan.tasks.filter(t => completedTaskIds.includes(t.id)).length;
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const month1Tasks = plan.tasks.filter(t => t.month === 1);
  const month1Completed = month1Tasks.filter(t => completedTaskIds.includes(t.id)).length;
  const month1Percent = month1Tasks.length > 0 ? Math.round((month1Completed / month1Tasks.length) * 100) : 0;

  const month2Tasks = plan.tasks.filter(t => t.month === 2);
  const month2Completed = month2Tasks.filter(t => completedTaskIds.includes(t.id)).length;
  const month2Percent = month2Tasks.length > 0 ? Math.round((month2Completed / month2Tasks.length) * 100) : 0;

  const month3Tasks = plan.tasks.filter(t => t.month === 3);
  const month3Completed = month3Tasks.filter(t => completedTaskIds.includes(t.id)).length;
  const month3Percent = month3Tasks.length > 0 ? Math.round((month3Completed / month3Tasks.length) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return plan.tasks.filter(task => {
      if (selectedMonth !== "all" && task.month !== selectedMonth) return false;
      if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
      if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
      
      const isDone = completedTaskIds.includes(task.id);
      if (selectedStatus === "completed" && !isDone) return false;
      if (selectedStatus === "pending" && isDone) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchKpi = task.targetKpi.toLowerCase().includes(q);
        const matchAxis = task.radarAxisAffected.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchKpi && !matchAxis) return false;
      }

      return true;
    });
  }, [plan.tasks, selectedMonth, selectedCategory, selectedPriority, selectedStatus, searchQuery, completedTaskIds]);

  // Fetch plan from Gemini API
  const handleRegenerateWithGemini = async () => {
    setIsLoadingGemini(true);
    setGeminiSuccessToast(null);

    const rawKeywords = config.seo?.keywords;
    let userKeywords: string[] = [];
    if (Array.isArray(rawKeywords)) {
      userKeywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);
    } else if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
      userKeywords = rawKeywords.split(",").map(k => k.trim()).filter(Boolean);
    }

    try {
      const response = await fetch("/api/strategic-action-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: config.companyName || "Siteniz",
          sector: config.sector || "Oto Çekici & Yol Yardım",
          city: config.city || "İstanbul",
          domain: config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr",
          primaryKeywords: userKeywords,
          config
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setPlan(resData.data);
        const sourceLabel = resData.source === "gemini-3.8-flash" 
          ? "Gemini 3.8 Flash & Google Arama ile güncellendi" 
          : "Algoritmik strateji motoru ile güncellendi";
        setGeminiSuccessToast(sourceLabel);
        setTimeout(() => setGeminiSuccessToast(null), 4000);
      }
    } catch (err) {
      console.warn("Gemini generation failed, using fallback:", err);
      const fallback = generateFallbackStrategicActionPlan(config);
      setPlan(fallback);
      setGeminiSuccessToast("Yerel SEO motoru ile yeniden hesaplandı");
      setTimeout(() => setGeminiSuccessToast(null), 4000);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Copy plan summary to clipboard
  const handleCopyPlan = () => {
    const summaryText = `=== 3 AYLIK STRATEJİK SEO AKSİYON PLANI ===
Firma: ${plan.companyName} (${plan.city} - ${plan.sector})
Web: ${plan.domain}
Tarih: ${plan.analyzedAt}

GENEL İLERLEME: %${overallProgressPercent} (${completedCount}/${totalTasks} Görev Tamamlandı)
- 1. Ay (Gün 1-30): %${month1Percent} (${month1Completed}/${month1Tasks.length})
- 2. Ay (Gün 31-60): %${month2Percent} (${month2Completed}/${month2Tasks.length})
- 3. Ay (Gün 61-90): %${month3Percent} (${month3Completed}/${month3Tasks.length})

AYLIK STRATEJİK ODAKLAR:
- ${plan.monthlyFocus.month1Focus}
- ${plan.monthlyFocus.month2Focus}
- ${plan.monthlyFocus.month3Focus}

ÖNCELİKLİ GÖREVLER (${plan.tasks.length} Adet):
${plan.tasks.map((t, idx) => `${idx + 1}. [${completedTaskIds.includes(t.id) ? "X" : " "}] [${t.monthLabel}] [${t.priority}] ${t.title}
   Kategori: ${t.category} | Hedef KPI: ${t.targetKpi}
   Kapatılan Açık: ${t.competitorGapAddressed}`).join("\n\n")}

İÇERİK İYİLEŞTİRME YÖNERGELERİ:
${plan.contentDirectives.map((d, idx) => `${idx + 1}. ${d.pageTarget}: Önerilen ${d.recommendedWordCount} kelime. ${d.expectedImpact}`).join("\n")}`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper for priority badges
  const renderPriorityBadge = (priority: ActionTaskPriority) => {
    switch (priority) {
      case "Kritik":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Kritik
          </span>
        );
      case "Yüksek":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Yüksek
          </span>
        );
      case "Orta":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            Orta
          </span>
        );
    }
  };

  // Helper for category badges
  const renderCategoryBadge = (cat: ActionTaskCategory) => {
    const map: Record<ActionTaskCategory, { bg: string; text: string; border: string }> = {
      "Teknik SEO": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
      "İçerik Stratejisi": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
      "Yerel SEO & Harita": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
      "Otorite & Backlink": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
      "Dönüşüm (CRO)": { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" }
    };
    const c = map[cat] || map["Teknik SEO"];
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
        {cat}
      </span>
    );
  };

  return (
    <div id="strategic-action-planner-card" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* ===================================================================== */}
      {/* 1. HEADER & ACTION CONTROLS */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 text-white relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Gemini 3.8 Flash & Live SERP Destekli
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/10">
                <Target className="w-3 h-3 text-emerald-400" />
                Radar & Rakip Kıyaslama Senkronize
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-200 border border-white/10">
                <Calendar className="w-3 h-3 text-cyan-400" />
                90 Günlük Büyüme Yol Haritası
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Stratejik Aksiyon Planlayıcı
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Rakip Kıyaslama Tablosu ve 6-Eksen SEO Radarındaki eksiklikleri doğrudan hedefleyen; 
              <strong className="text-white font-semibold"> {plan.companyName}</strong> için önceliklendirilmiş 3 aylık büyüme görevleri, 
              içerik derinleştirme yönergeleri ve anlık hızlı zaferler.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              id="btn-gemini-regenerate-action-plan"
              onClick={handleRegenerateWithGemini}
              disabled={isLoadingGemini}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGemini ? "animate-spin" : ""}`} />
              <span>{isLoadingGemini ? "Gemini Analiz Ediyor..." : "Gemini ile Yenile"}</span>
            </button>

            <button
              type="button"
              id="btn-copy-action-plan"
              onClick={handleCopyPlan}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Plan özetini panoya kopyala"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Kopyalandı" : "Kopyala"}</span>
            </button>

            <button
              type="button"
              id="btn-export-action-plan-csv"
              onClick={() => exportActionPlanToCSV(plan)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="CSV formatında indir"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>CSV İndir</span>
            </button>

            {onOpenCustomReport && (
              <button
                type="button"
                id="btn-action-plan-to-custom-report"
                onClick={onOpenCustomReport}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-500/50 flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                title="Rapor Düzenleyiciye Aktar"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rapora Ekle</span>
              </button>
            )}
          </div>
        </div>

        {geminiSuccessToast && (
          <div className="mt-4 p-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{geminiSuccessToast}</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. OVERALL PROGRESS TRACKER & MONTHLY TIMELINE BADGES */}
      {/* ===================================================================== */}
      <div className="bg-slate-50/80 border-b border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Genel İlerleme
              </span>
              <span className="font-mono text-blue-700 font-black">{completedCount} / {totalTasks} Görev</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-500 rounded-full"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>90 Günlük Sprint</span>
              <span className="font-black text-slate-900">%{overallProgressPercent} Tamamlandı</span>
            </div>
          </div>

          {/* Month 1 progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="text-indigo-950 font-bold">1. Ay (Gün 1-30)</span>
              <span className="font-mono text-indigo-700 font-bold">{month1Completed}/{month1Tasks.length}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${month1Percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate" title={plan.monthlyFocus.month1Focus}>
              Teknik İzolasyon & Hızlı Zaferler
            </p>
          </div>

          {/* Month 2 progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="text-cyan-950 font-bold">2. Ay (Gün 31-60)</span>
              <span className="font-mono text-cyan-700 font-bold">{month2Completed}/{month2Tasks.length}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-cyan-600 transition-all duration-500 rounded-full"
                style={{ width: `${month2Percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate" title={plan.monthlyFocus.month2Focus}>
              İçerik Derinliği & İlçe Kuşatması
            </p>
          </div>

          {/* Month 3 progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="text-purple-950 font-bold">3. Ay (Gün 61-90)</span>
              <span className="font-mono text-purple-700 font-bold">{month3Completed}/{month3Tasks.length}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-500 rounded-full"
                style={{ width: `${month3Percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate" title={plan.monthlyFocus.month3Focus}>
              Backlink & SERP #1 Sahiplenmesi
            </p>
          </div>
        </div>

        {/* Radar gaps banner */}
        <div className="mt-4 p-3.5 px-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">
              <strong className="font-bold text-blue-950">Radar Eksen Boşluğu Özeti: </strong>
              {plan.radarScoresSnapshot.gapSummary}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {plan.radarScoresSnapshot.axes.map((ax, i) => (
              <span 
                key={i} 
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ax.status === "superior" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : ax.status === "competitive" 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-rose-100 text-rose-800"
                }`}
                title={`${ax.name}: Siteniz ${ax.userScore} vs Rakipler ${ax.competitorAvg}`}
              >
                {ax.name.split(" ")[0]}: {ax.userScore}/{ax.competitorAvg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. INTERACTIVE SUB-NAVIGATION TABS */}
      {/* ===================================================================== */}
      <div className="px-6 pt-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            id="tab-action-plan-tasks"
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tasks"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3 Aylık Görev Akışı</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
              {filteredTasks.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-action-plan-content"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "content"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>İçerik İyileştirme Önerileri</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
              {plan.contentDirectives.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-action-plan-matrix"
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "matrix"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Etki / Efor Matrisi</span>
          </button>

          <button
            type="button"
            id="tab-action-plan-quickwins"
            onClick={() => setActiveTab("quickwins")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "quickwins"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hızlı Zaferler (Quick Wins)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
              {plan.quickWins.length}
            </span>
          </button>
        </div>

        {/* Quick bulk action button */}
        <div className="flex items-center gap-2 pb-2">
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setCompletedTaskIds([]);
                saveCompletedTaskIds([]);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Tamamlananları Sıfırla
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const allIds = plan.tasks.map(t => t.id);
              setCompletedTaskIds(allIds);
              saveCompletedTaskIds(allIds);
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
          >
            Tümünü Tamamlandı İşaretle
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. TAB CONTENTS */}
      {/* ===================================================================== */}
      <div className="p-6">
        {/* ------------------------------------------------------------- */}
        {/* TAB 1: 3-MONTH TASKS TIMELINE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  Filtrele:
                </span>

                {/* Month filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Tüm Aylar (1, 2 ve 3. Ay)</option>
                  <option value="1">1. Ay (Gün 1-30)</option>
                  <option value="2">2. Ay (Gün 31-60)</option>
                  <option value="3">3. Ay (Gün 61-90)</option>
                </select>

                {/* Category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Teknik SEO">Teknik SEO</option>
                  <option value="İçerik Stratejisi">İçerik Stratejisi</option>
                  <option value="Yerel SEO & Harita">Yerel SEO & Harita</option>
                  <option value="Otorite & Backlink">Otorite & Backlink</option>
                  <option value="Dönüşüm (CRO)">Dönüşüm (CRO)</option>
                </select>

                {/* Priority filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="Kritik">Kritik</option>
                  <option value="Yüksek">Yüksek</option>
                  <option value="Orta">Orta</option>
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Bekleyenler</option>
                  <option value="completed">Tamamlananlar</option>
                </select>
              </div>

              {/* Search box */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Görev veya hedef ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Task Cards List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold">Filtrelere uygun aksiyon görevi bulunamadı.</p>
                  <p className="text-xs text-slate-400 mt-1">Filtreleri temizleyerek tüm görevleri görüntüleyebilirsiniz.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = completedTaskIds.includes(task.id);
                  const isExpanded = !!expandedTaskIds[task.id];

                  return (
                    <div 
                      key={task.id}
                      className={`p-5 rounded-2xl border transition-all duration-200 ${
                        isDone 
                          ? "bg-slate-50/70 border-slate-200 opacity-80" 
                          : "bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                          title={isDone ? "Tamamlandı olarak işaretlendi (Tıkla ve geri al)" : "Görevi tamamlandı işaretle"}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500" />
                          )}
                        </button>

                        <div className="flex-1 space-y-2">
                          {/* Row 1: Badges & metadata */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white">
                                {task.monthLabel}
                              </span>
                              {renderPriorityBadge(task.priority)}
                              {renderCategoryBadge(task.category)}
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {task.radarAxisAffected}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {task.estimatedDaysToComplete} gün
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[11px] font-medium text-slate-600">
                                Etki: <strong className="text-emerald-700">{task.impact}</strong> / Efor: <strong className="text-amber-700">{task.effort}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Title & Description */}
                          <div>
                            <h3 className={`text-sm md:text-base font-bold ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">
                              {task.description}
                            </p>
                          </div>

                          {/* Row 3: Target KPI & Competitor Gap */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2">
                              <Target className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-blue-950">Hedef KPI: </span>
                                <span className="text-blue-800">{task.targetKpi}</span>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-950">Kapatılan Rakip Açığı: </span>
                                <span className="text-amber-800">{task.competitorGapAddressed}</span>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Steps */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/60 p-3 rounded-xl animate-fadeIn">
                              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                Önerilen Uygulama Adımları:
                              </h4>
                              <ul className="space-y-1.5 text-xs text-slate-600">
                                {task.suggestedSteps.map((step, sIdx) => (
                                  <li key={sIdx} className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Bottom controls */}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(task.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? "Adımları Gizle" : "Adımları ve Detayları Gör"}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <div className="flex items-center gap-2">
                              {task.category === "İçerik Stratejisi" && onNavigateTab && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateTab("customer-panel")}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                                  title="AI İçerik Asistanı'na Geç"
                                >
                                  <span>AI Asistanında Başlat</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              {task.category === "Teknik SEO" && onNavigateTab && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateTab("seo-automation")}
                                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Teknik SEO Modülüne Git"
                                >
                                  <span>Altyapıyı İncele</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: CONTENT OPTIMIZATION DIRECTIVES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Rakip Sayfa Mimarisine Dayalı İçerik Direktifleri: </strong>
                Lider rakiplerin en çok trafik alan sayfalarındaki kelime hacmi, başlık dağılımı ve Google People Also Ask (PAA) soruları analiz edilerek oluşturulmuş birebir içerik yönergeleri.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {plan.contentDirectives.map((directive, dIdx) => (
                <div key={directive.id || dIdx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Direktif #{dIdx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        {directive.pageTarget}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mevcut Durum: <span className="font-medium text-slate-700">{directive.currentStatus}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">Tavsiye Edilen Uzunluk</span>
                        <span className="text-base font-mono font-black text-emerald-700">
                          {directive.recommendedWordCount.toLocaleString()} kelime
                        </span>
                      </div>
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab("customer-panel")}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI ile Yazdır</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Keywords & Expected Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">Hedeflenen Anahtar Kelimeler:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {directive.targetKeywords.map((kw, kIdx) => (
                          <span key={kIdx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-950 block">Beklenen SERP & Trafik Etkisi:</span>
                      <p className="text-emerald-900 font-medium pt-1">
                        {directive.expectedImpact}
                      </p>
                    </div>
                  </div>

                  {/* Heading & LSI */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-900 shrink-0">Başlık Hiyerarşisi Eylemi:</span>
                      <span className="text-slate-700">{directive.hierarchyAction}</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="font-bold text-slate-900 block">Zorunlu LSI / Semantik Kavramlar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {directive.lsiAdditions.map((lsi, lIdx) => (
                          <span key={lIdx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
                            + {lsi}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="font-bold text-slate-900 block">Eklenmesi Gereken Google PAA (Soru-Cevap) Başlıkları:</span>
                      <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                        {directive.paaQuestionsToAdd.map((q, qIdx) => (
                          <li key={qIdx} className="font-medium text-slate-800">
                            "{q}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: IMPACT VS EFFORT MATRIX */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-950">
              <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Eisenhower SEO Büyüme Matrisi: </strong>
                Görevler etki ve gereken efora göre 4 stratejik çeyrekte gruplanmıştır. Kaynaklarınızı öncelikle sol üstteki <strong>Hızlı Zaferler</strong> ve sağ üstteki <strong>Büyük Stratejik Projeler</strong> alanına ayırın.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Q1: High Impact / Low Effort (Quick Wins) */}
              <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Hızlı Zaferler (Yüksek Etki / Düşük Efor)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Hemen Yapın
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.tasks
                    .filter(t => (t.impact === "Çok Yüksek" || t.impact === "Yüksek") && t.effort === "Düşük")
                    .map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">{t.title}</span>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0 ml-2">
                          {t.monthLabel.split(" ")[0]} Ay
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Q2: High Impact / High Effort (Strategic Bets) */}
              <div className="p-5 rounded-2xl border-2 border-indigo-300 bg-indigo-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Büyük Stratejik Projeler (Yüksek Etki / Orta-Yüksek Efor)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    Planlayın & Odaklanın
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.tasks
                    .filter(t => (t.impact === "Çok Yüksek" || t.impact === "Yüksek") && t.effort !== "Düşük")
                    .map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-white border border-indigo-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">{t.title}</span>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold shrink-0 ml-2">
                          {t.monthLabel.split(" ")[0]} Ay
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Q3: Moderate Impact / Low Effort */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Dolgu & Kolay İyileştirmeler (Orta Etki / Düşük Efor)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Boş Vakitlerde Yapın
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.tasks
                    .filter(t => t.impact === "Orta" && t.effort === "Düşük")
                    .map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">{t.title}</span>
                        <span className="text-[10px] font-mono text-amber-700 font-bold shrink-0 ml-2">
                          {t.monthLabel.split(" ")[0]} Ay
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Q4: Moderate Impact / Moderate-High Effort */}
              <div className="p-5 rounded-2xl border-2 border-slate-300 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Düşük Öncelik (Orta Etki / Orta-Yüksek Efor)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Sonraya Erteleyin
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.tasks
                    .filter(t => t.impact === "Orta" && t.effort !== "Düşük")
                    .map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">{t.title}</span>
                        <span className="text-[10px] font-mono text-slate-700 font-bold shrink-0 ml-2">
                          {t.monthLabel.split(" ")[0]} Ay
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: QUICK WINS & GROUNDING */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "quickwins" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.quickWins.map((win, wIdx) => (
                <div key={wIdx} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      30 Dakikalık Hızlı Zafer #{wIdx + 1}
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {win}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Search Grounding Sources if available */}
            {plan.searchGroundingSources && plan.searchGroundingSources.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Gemini Tarafından Taranan Canlı Google Arama Kaynakları:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {plan.searchGroundingSources.map((source, sIdx) => (
                    <a
                      key={sIdx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 flex items-center gap-1 text-[11px] font-medium transition-colors"
                    >
                      <span className="truncate max-w-[200px]">{source.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. FOOTER & EXECUTIVE SUMMARY */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-t border-slate-200 p-5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            Analiz Tarihi: <strong className="text-slate-800 font-bold">{plan.analyzedAt}</strong> &bull; Sektör: <strong className="text-slate-800 font-bold">{plan.sector}</strong> ({plan.city})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            Toplam {plan.tasks.length} Görev &bull; {completedCount} Tamamlandı
          </span>
          <button
            type="button"
            onClick={handleCopyPlan}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Planı Kopyala</span>
          </button>
        </div>
      </div>
    </div>
  );
};
