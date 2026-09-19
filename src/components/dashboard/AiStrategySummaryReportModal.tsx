import React, { useState } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Flame,
  Award,
  Layers,
  BarChart3,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { AiStrategySummaryReportData } from "../../utils/aiStrategySummaryReportEngine";

export interface AiStrategySummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AiStrategySummaryReportData | null;
  isLoading: boolean;
  onRegenerate: () => void;
  userDomain?: string;
  userName?: string;
}

export const AiStrategySummaryReportModal: React.FC<AiStrategySummaryReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  isLoading,
  onRegenerate,
  userDomain = "siteniz.com",
  userName = "Siteniz"
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "recommendations" | "keywords" | "speed" | "roadmap">("summary");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Toggle checklist tasks in 30-day plan
  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Copy full Markdown report to clipboard
  const handleCopyMarkdown = () => {
    if (!reportData) return;

    let md = `# AI Strateji Özet Raporu - ${userName} (${userDomain})\n`;
    md += `Rapor Tarihi: ${reportData.generatedAt} | Rapor ID: ${reportData.reportId}\n`;
    md += `Genel Sağlık & Rekabet Skoru: ${reportData.overallHealthScore}/100\n\n`;

    md += `## 1. Yönetici Özeti\n${reportData.executiveSummary}\n\n`;

    md += `## 2. SERP Pazar Payı Değerlendirmesi\n`;
    md += `- ${reportData.serpMarketShare.userName}: %${reportData.serpMarketShare.userSharePercent}\n`;
    md += `- ${reportData.serpMarketShare.comp1Name}: %${reportData.serpMarketShare.comp1SharePercent}\n`;
    md += `- ${reportData.serpMarketShare.comp2Name}: %${reportData.serpMarketShare.comp2SharePercent}\n`;
    md += `- ${reportData.serpMarketShare.comp3Name}: %${reportData.serpMarketShare.comp3SharePercent}\n`;
    md += `Değerlendirme: ${reportData.serpMarketShare.verdict}\n\n`;

    md += `## 3. Stratejik İyileştirme Önerileri\n`;
    reportData.strategicRecommendations.forEach((r, idx) => {
      md += `### ${idx + 1}. ${r.title} (${r.categoryLabel} - Öncelik: ${r.priority.toUpperCase()})\n`;
      md += `- Durum: ${r.currentStatus}\n`;
      md += `- Beklenen Etki: ${r.expectedGain} | Efor: ${r.effort}\n`;
      md += `- Hedef Kelimeler: ${r.targetKeywords.join(", ")}\n`;
      md += `Adımlar:\n`;
      r.actionableSteps.forEach((step) => {
        md += `  * ${step}\n`;
      });
      md += `\n`;
    });

    md += `## 4. 30 Günlük Aksiyon Takvimi\n`;
    reportData.thirtyDayActionPlan.forEach((p) => {
      md += `### ${p.phase} (${p.timeline})\nOdak: ${p.focusArea}\n`;
      p.tasks.forEach((t) => {
        md += ` - [ ] ${t}\n`;
      });
      md += `\n`;
    });

    try {
      navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy report:", e);
    }
  };

  // Download report as a .txt file
  const handleDownloadTxt = () => {
    if (!reportData) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `AI-Strateji-Ozet-Raporu-${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  const filteredRecommendations = reportData?.strategicRecommendations.filter((r) => {
    if (selectedCategory === "all") return true;
    return r.category === selectedCategory;
  }) || [];

  return (
    <div
      id="ai-strategy-summary-report-modal"
      data-testid="ai-strategy-summary-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-strategy-report-title"
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Gemini Canlı Analiz</span>
              </span>
              {reportData?.source === "gemini" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  Canlı Model Çıktısı
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                  Algoritmik Strateji Motoru
                </span>
              )}
              {reportData?.generatedAt && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {reportData.generatedAt}
                </span>
              )}
            </div>

            <h2 id="modal-strategy-report-title" className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <Target className="w-6 h-6 text-amber-400" />
              <span>AI Strateji Özet Raporu</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400">
              Tablodaki canlı SERP sıralamaları, rakip hızları ve hedefler baz alınarak hazırlanan stratejik eylem planı.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-regenerate-ai-strategy-report"
              data-testid="btn-regenerate-ai-strategy-report"
              onClick={onRegenerate}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
              title="Tablodaki güncel verilerle raporu yeniden üretin"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-300" : ""}`} />
              <span>{isLoading ? "Analiz Ediliyor..." : "Yeniden Analiz Et"}</span>
            </button>

            <button
              type="button"
              id="btn-copy-strategy-report"
              data-testid="btn-copy-strategy-report"
              onClick={handleCopyMarkdown}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Raporu Markdown formatında panoya kopyalayın"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-download-strategy-report"
              data-testid="btn-download-strategy-report"
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Rapor verisini JSON olarak indirin"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">İndir</span>
            </button>

            <button
              type="button"
              id="btn-print-strategy-report"
              onClick={handlePrint}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Raporu yazdırın"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>

            <button
              type="button"
              id="btn-close-strategy-report-modal"
              data-testid="btn-close-strategy-report-modal"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 border border-slate-700 transition-all cursor-pointer"
              title="Kapat"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-5 sm:px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "border-amber-400 text-amber-300 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Yönetici Özeti & Pazar Payı</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recommendations")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recommendations"
                ? "border-amber-400 text-amber-300 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Stratejik Öneriler ({reportData?.strategicRecommendations.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("keywords")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "keywords"
                ? "border-amber-400 text-amber-300 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>3. Öncelikli Kelime Fırsatları</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("speed")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "speed"
                ? "border-amber-400 text-amber-300 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>4. Hız & Core Web Vitals Kaldıracı</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "roadmap"
                ? "border-amber-400 text-amber-300 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>5. 30 Günlük Yol Haritası</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && (
            <div className="p-8 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Gemini Strateji Motoru Çalışıyor...</h4>
                <p className="text-xs text-slate-300">SERP sıralamaları, rakip açıkları ve hız metrikleri sentezleniyor.</p>
              </div>
            </div>
          )}

          {!isLoading && !reportData && (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300">Rapor verisi henüz yüklenmedi veya oluşturulamadı.</p>
              <button
                type="button"
                onClick={onRegenerate}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Raporu Şimdi Oluştur</span>
              </button>
            </div>
          )}

          {!isLoading && reportData && (
            <>
              {/* TAB 1: YÖNETİCİ ÖZETİ & PAZAR PAYI */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Executive Summary Text Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Kıdemli SEO Danışmanı Değerlendirmesi</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                        <span>Rekabet Gücü: {reportData.overallHealthScore}/100</span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                      {reportData.executiveSummary}
                    </p>
                  </div>

                  {/* SERP Market Share Visual Progress Bar */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-black text-white">SERP İlk Sayfa Görünürlük & Pazar Payı Dağılımı</h4>
                      </div>
                      <span className="text-xs text-slate-400 italic">
                        {reportData.serpMarketShare.verdict}
                      </span>
                    </div>

                    {/* Multi-segment progress bar */}
                    <div className="w-full h-4 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                      <div
                        style={{ width: `${reportData.serpMarketShare.userSharePercent}%` }}
                        className="bg-emerald-500 rounded-l-full h-full transition-all duration-500"
                        title={`${reportData.serpMarketShare.userName}: %${reportData.serpMarketShare.userSharePercent}`}
                      />
                      <div
                        style={{ width: `${reportData.serpMarketShare.comp1SharePercent}%` }}
                        className="bg-amber-500 h-full transition-all duration-500"
                        title={`${reportData.serpMarketShare.comp1Name}: %${reportData.serpMarketShare.comp1SharePercent}`}
                      />
                      <div
                        style={{ width: `${reportData.serpMarketShare.comp2SharePercent}%` }}
                        className="bg-indigo-500 h-full transition-all duration-500"
                        title={`${reportData.serpMarketShare.comp2Name}: %${reportData.serpMarketShare.comp2SharePercent}`}
                      />
                      <div
                        style={{ width: `${reportData.serpMarketShare.comp3SharePercent}%` }}
                        className="bg-rose-500 rounded-r-full h-full transition-all duration-500"
                        title={`${reportData.serpMarketShare.comp3Name}: %${reportData.serpMarketShare.comp3SharePercent}`}
                      />
                    </div>

                    {/* Legend Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="truncate">{reportData.serpMarketShare.userName}</span>
                        </div>
                        <div className="text-lg font-black text-white mt-1">
                          %{reportData.serpMarketShare.userSharePercent}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="truncate">{reportData.serpMarketShare.comp1Name}</span>
                        </div>
                        <div className="text-lg font-black text-white mt-1">
                          %{reportData.serpMarketShare.comp1SharePercent}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          <span className="truncate">{reportData.serpMarketShare.comp2Name}</span>
                        </div>
                        <div className="text-lg font-black text-white mt-1">
                          %{reportData.serpMarketShare.comp2SharePercent}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="truncate">{reportData.serpMarketShare.comp3Name}</span>
                        </div>
                        <div className="text-lg font-black text-white mt-1">
                          %{reportData.serpMarketShare.comp3SharePercent}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SWOT Grid */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Sektörel Rekabet SWOT Matrisi</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Güçlü Yönler (Strengths)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-emerald-200">
                          {reportData.swotHighlights.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>Zayıf Yönler & Açıklar (Weaknesses)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-rose-200">
                          {reportData.swotHighlights.weaknesses.map((w, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400 uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          <span>Fırsat Alanları (Opportunities)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-indigo-200">
                          {reportData.swotHighlights.opportunities.map((o, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>Piyasa Tehditleri (Threats)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-amber-200">
                          {reportData.swotHighlights.threats.map((t, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STRATEJİK İYİLEŞTİRME ÖNERİLERİ */}
              {activeTab === "recommendations" && (
                <div className="space-y-5">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedCategory === "all"
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Tümü ({reportData.strategicRecommendations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("speed_cwv")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedCategory === "speed_cwv"
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Hız & CWV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("quick_win")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedCategory === "quick_win"
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Hızlı Kazanımlar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("content_gap")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedCategory === "content_gap"
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      İçerik Boşluğu
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("commercial_intent")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedCategory === "commercial_intent"
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Ticari Niyet
                    </button>
                  </div>

                  {/* Recommendations Cards */}
                  <div className="space-y-4">
                    {filteredRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-black border border-amber-400/30">
                              {rec.categoryLabel}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rec.priority === "high"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}>
                              Öncelik: {rec.priority === "high" ? "Yüksek" : "Orta"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Puan: {rec.priorityScore}/100
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Efor:</span>
                            <span className="text-slate-200 font-bold">{rec.effort}</span>
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-white tracking-tight">
                          {rec.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.currentStatus}
                        </p>

                        {/* Action Steps Checklist */}
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Önerilen Uygulama Adımları</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {rec.actionableSteps.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Target Keywords & Expected Gain */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-400 text-[11px]">Hedef Kelimeler:</span>
                            {rec.targetKeywords.map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] border border-slate-700"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>

                          <div className="inline-flex items-center gap-1 text-emerald-300 font-bold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{rec.expectedGain}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ÖNCELİKLİ KELİME FIRSATLARI */}
              {activeTab === "keywords" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                    <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-white text-sm">En Yüksek Getirili Anahtar Kelime Fırsatları</h4>
                      <p className="text-slate-300">
                        Tablodaki arama hacmi yüksek ve rakip sıralamalarıyla yakın rekabette olan terimler için hazırlanan özel SERP tavsiyeleri:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reportData.priorityKeywordOpportunities.map((kwItem, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1.5 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {kwItem.keyword}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono">
                              {kwItem.volume}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            💡 <strong className="text-amber-300">Aksiyon:</strong> {kwItem.tacticalAdvice}
                          </p>
                        </div>

                        {/* Rank Gap & Goal Box */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-center min-w-[70px]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Mevcut</div>
                            <div className="text-sm font-black text-white">
                              {kwItem.userRank ? `#${kwItem.userRank}` : "Yok"}
                            </div>
                          </div>

                          <div className="text-slate-600 font-black">→</div>

                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[70px]">
                            <div className="text-[10px] text-amber-400 uppercase font-bold">Hedef</div>
                            <div className="text-sm font-black text-amber-300">
                              #{kwItem.targetRank}
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center min-w-[70px]">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold">En İyi Rakip</div>
                            <div className="text-sm font-black text-indigo-300">
                              #{kwItem.bestCompRank}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: HIZ & CORE WEB VITALS KALDIRACI */}
              {activeTab === "speed" && (
                <div className="space-y-6">
                  {/* Speed Score Comparison Hero */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950 border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <h4 className="text-base font-black text-white">Teknik Hız & Google PageSpeed Skor Karşılaştırması</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                        +{reportData.technicalLeverageSummary.speedAdvantagePoints} Puan Hız Üstünlüğü
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {reportData.technicalLeverageSummary.speedStrategyAdvice}
                    </p>

                    {/* Speed Meters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-300">{userName} (Siteniz)</span>
                          <span className="font-black text-emerald-400 text-base">{reportData.technicalLeverageSummary.userSpeedScore}/100</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${reportData.technicalLeverageSummary.userSpeedScore}%` }}
                            className="bg-emerald-400 h-full rounded-full"
                          />
                        </div>
                        <span className="text-[11px] text-emerald-200">
                          Durum: {reportData.technicalLeverageSummary.coreWebVitalsStatus}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">En Hızlı Rakip</span>
                          <span className="font-black text-amber-400 text-base">{reportData.technicalLeverageSummary.bestCompetitorSpeedScore}/100</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${reportData.technicalLeverageSummary.bestCompetitorSpeedScore}%` }}
                            className="bg-amber-400 h-full rounded-full"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Mobil LCP & INP gecikmeleri mevcut
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CWV Conversion Leverage Steps */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Hız Üstünlüğünü Sıralamaya Dönüştürme Taktikleri
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-white">1. Hızlı İndeksleme</div>
                        <p className="text-slate-400 text-[11px]">Düşük TTFB sayesinde Googlebot sitenizi günde 4x daha derin tarar.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-white">2. Düşük Hemen Çıkma</div>
                        <p className="text-slate-400 text-[11px]">0.8s altı açılış süresi mobil kullanıcının sitede kalış süresini %40 artırır.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-white">3. Anlık WhatsApp/Form</div>
                        <p className="text-slate-400 text-[11px]">Rakipler yüklenene kadar sitenizden anlık teklif alınmasını sağlar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: 30 GÜNLÜK YOL HARİTASI */}
              {activeTab === "roadmap" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">4 Haftalık Uygulama Takvimi</h4>
                      <p className="text-xs text-slate-300">
                        Adımları uyguladıkça onay kutularını işaretleyebilir ve ilerlemenizi kaydedebilirsiniz:
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-300">
                        Tahmini Trafik Artışı:
                      </span>
                      <div className="text-base font-black text-emerald-400">
                        +%{reportData.goalAttainmentForecast.projectedTrafficGrowthPercent}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reportData.thirtyDayActionPlan.map((phase, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black">
                              {phase.phase}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {phase.timeline}
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-300 font-mono">
                            Odak: {phase.focusArea}
                          </span>
                        </div>

                        {/* Tasks Checklist */}
                        <div className="space-y-2 pt-1">
                          {phase.tasks.map((task, tIdx) => {
                            const taskId = `phase-${pIdx}-task-${tIdx}`;
                            const isDone = !!completedTasks[taskId];
                            return (
                              <label
                                key={tIdx}
                                className={`flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                                  isDone
                                    ? "bg-emerald-950/20 text-slate-400 line-through"
                                    : "hover:bg-slate-900 text-slate-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleTask(taskId)}
                                  className="mt-0.5 w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400 cursor-pointer"
                                />
                                <span className="text-xs leading-relaxed">{task}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SEO Rakip Kıyaslama Tablosu ile senkronize canlı analiz raporu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
