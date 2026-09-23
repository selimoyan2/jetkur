import React, { useState, useEffect, useMemo } from "react";
import { 
  SiteConfig, 
  CompetitorAdSpendEfficiencyReport, 
  CompetitorAdBenchmark,
  AdEfficiencyRating 
} from "../../types";
import { 
  generateFallbackAdEfficiencyReport,
  exportAdEfficiencyToCSV 
} from "../../utils/competitorAdEfficiencyEngine";
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Target, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  PieChart, 
  SlidersHorizontal, 
  ExternalLink, 
  Zap, 
  Percent, 
  BarChart3, 
  DollarSign, 
  Crosshair, 
  Layers, 
  PhoneCall, 
  ShieldAlert,
  Clock,
  ArrowRight,
  FileDown
} from "lucide-react";

interface CompetitorAdEfficiencyCardProps {
  config: Partial<SiteConfig>;
  onNavigateTab?: (tabKey: string) => void;
  onOpenCustomReport?: () => void;
  onDownloadPdf?: () => void;
}

export const CompetitorAdEfficiencyCard: React.FC<CompetitorAdEfficiencyCardProps> = ({
  config,
  onNavigateTab,
  onOpenCustomReport,
  onDownloadPdf
}) => {
  // Main report state
  const [report, setReport] = useState<CompetitorAdSpendEfficiencyReport>(() => {
    return generateFallbackAdEfficiencyReport(config);
  });

  const [activeSubTab, setActiveSubTab] = useState<"benchmarks" | "channels" | "arbitrage" | "waste-prevention">("benchmarks");
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiToast, setGeminiToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAllCopied, setIsAllCopied] = useState<boolean>(false);
  const [expandedAdIds, setExpandedAdIds] = useState<Record<string, boolean>>({
    "comp-1": true,
    "user-benchmark": true
  });

  // Re-generate fallback on config change
  useEffect(() => {
    const fallback = generateFallbackAdEfficiencyReport(config);
    setReport(fallback);
  }, [config]);

  const toggleExpand = (id: string) => {
    setExpandedAdIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Call Gemini API
  const handleRegenerateWithGemini = async () => {
    setIsLoadingGemini(true);
    setGeminiToast(null);

    const rawKeywords = config.seo?.keywords;
    let userKeywords: string[] = [];
    if (Array.isArray(rawKeywords)) {
      userKeywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);
    } else if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
      userKeywords = rawKeywords.split(",").map(k => k.trim()).filter(Boolean);
    }

    try {
      const response = await fetch("/api/competitor-ad-efficiency", {
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
        throw new Error("HTTP " + response.status);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setReport(resData.data);
        const sourceMsg = resData.source === "gemini-3.8-flash"
          ? "Gemini 3.8 Flash & Canlı Google Ads Reklam Verileri ile Güncellendi"
          : "Algoritmik reklam verimlilik motoru ile güncellendi";
        setGeminiToast(sourceMsg);
        setTimeout(() => setGeminiToast(null), 4000);
      }
    } catch (err) {
      console.warn("Gemini ad efficiency regeneration failed:", err);
      const fallback = generateFallbackAdEfficiencyReport(config);
      setReport(fallback);
      setGeminiToast("Yerel SEM motoru ile yeniden hesaplandı");
      setTimeout(() => setGeminiToast(null), 4000);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all report
  const handleCopyAll = () => {
    const text = `=== DİJİTAL REKLAM BÜTÇESİ & VERİMLİLİK ANALİZİ ===
Firma: ${report.companyName} (${report.city} - ${report.sector})
Web: ${report.domain}
Tarih: ${report.analyzedAt}

PAZAR GENELİ METRİKLERİ:
- Toplam Tahmini Sektörel Reklam Bütçesi: ${report.marketSummary.totalEstimatedMonthlyAdSpend.toLocaleString("tr-TR")} TL / ay
- Ortalama Sektörel Tıklama Başı Maliyet (CPC): ${report.marketSummary.avgIndustryCpc.toFixed(1)} TL
- Rakiplerin Tahmini İsraf / Boşa Harcanan Bütçesi: ${report.marketSummary.totalCompetitorWastedSpend.toLocaleString("tr-TR")} TL / ay
- Siteniz İçin Potansiyel Tasarruf: ${report.marketSummary.potentialMonthlySavingsForUser.toLocaleString("tr-TR")} TL / ay

RAKİP BÜTÇE KIYASLAMALARI:
${report.competitors.map(c => `[${c.isUser ? "SİZİN MODELİNİZ" : "RAKİP"}] ${c.competitorName} (${c.domain})
- Aylık Harcama: ${c.estimatedMonthlyAdSpend.toLocaleString("tr-TR")} TL
- Ortalama CPC: ${c.estimatedCpc} TL | Tıklama: ${c.estimatedPaidClicks} tık/ay | Gösterim Payı: %${c.paidSearchShare}
- ROAS: ${c.roasScore}x | Verimlilik: ${c.efficiencyRating} | İsraf Bütçe: ${c.wastedSpendEstimate.toLocaleString("tr-TR")} TL
- Zaaf & Strateji: ${c.strategyObservation}`).join("\n\n")}

CPC ARBİTRAJ FIRSATLARI:
${report.cpcArbitrageOpportunities.map(o => `- ${o.keyword} | CPC: ${o.avgCpc} TL | Hacim: ${o.monthlySearchVolume}
  Rakip Harcaması: ${o.competitorTotalSpendEstimate} | Öneri: [${o.recommendationType}] ${o.organicOpportunity}`).join("\n\n")}
`;

    navigator.clipboard.writeText(text);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2500);
  };

  const getEfficiencyBadge = (rating: AdEfficiencyRating) => {
    switch (rating) {
      case "Çok Yüksek":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Çok Yüksek</span>;
      case "Yüksek":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">Yüksek</span>;
      case "Orta":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">Orta</span>;
      case "Düşük / İsraf":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">Düşük / İsraf</span>;
    }
  };

  return (
    <div id="competitor-ad-efficiency-card" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* ===================================================================== */}
      {/* 1. HERO HEADER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 md:p-8 text-white relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Gemini 3.8 Flash & Google Ads Taraması
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/10">
                <Coins className="w-3 h-3 text-emerald-400" />
                Reklam Bütçesi & ROAS Röntgeni
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-200 border border-white/10">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                İsraf Tespiti & CPC Arbitrajı
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Reklam Verimliliği Analizi
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Rakiplerin Google Ads arama ağı, harita pinleri ve sosyal medyadaki tahmini aylık reklam harcamaları, ortalama tık başı maliyetleri (CPC), 
              reklam metni stratejileri ve boşa harcanan bütçe açıkları taranarak; 
              <strong className="text-white font-semibold"> {report.companyName}</strong> için yüksek ROAS ve SEO arbitraj yol haritası.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              id="btn-gemini-regenerate-ad-efficiency"
              onClick={handleRegenerateWithGemini}
              disabled={isLoadingGemini}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGemini ? "animate-spin" : ""}`} />
              <span>{isLoadingGemini ? "Google Ads Taranıyor..." : "Gemini ile Yenile"}</span>
            </button>

            <button
              type="button"
              id="btn-copy-all-ad-efficiency"
              onClick={handleCopyAll}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Tüm analizi kopyala"
            >
              {isAllCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isAllCopied ? "Kopyalandı" : "Tümünü Kopyala"}</span>
            </button>

            <button
              type="button"
              id="btn-export-ad-efficiency-csv"
              onClick={() => exportAdEfficiencyToCSV(report)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>CSV İndir</span>
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                id="btn-ad-efficiency-export-pdf"
                onClick={onDownloadPdf}
                className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                title="Tüm Stratejik Analiz Raporunu Şirket Logolu PDF Olarak İndir"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-200" />
                <span>PDF Raporu Oluştur</span>
                <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold uppercase tracking-wider">
                  Şirket Logolu
                </span>
              </button>
            )}

            {onOpenCustomReport && (
              <button
                type="button"
                id="btn-ad-efficiency-to-custom-report"
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

        {geminiToast && (
          <div className="mt-4 p-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{geminiToast}</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. KPI SNAPSHOT METRICS STRIP */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aylık Sektör Reklam Havuzu</span>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {report.marketSummary.totalEstimatedMonthlyAdSpend.toLocaleString("tr-TR")} <span className="text-xs font-bold text-slate-500">TL / ay</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {report.sector} ({report.city}) pazarındaki aktif bütçe
          </p>
        </div>

        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ortalama Tıklama Maliyeti</span>
            <Percent className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-blue-700">
            {report.marketSummary.avgIndustryCpc.toFixed(1)} <span className="text-xs font-bold text-blue-900">TL / tık</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Google Arama Ağı en üst sıra rekabeti
          </p>
        </div>

        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rakiplerin İsraf Bütçesi</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-700">
            {report.marketSummary.totalCompetitorWastedSpend.toLocaleString("tr-TR")} <span className="text-xs font-bold text-amber-900">TL / ay</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            Alakasız aramalar & negatif kelime eksikliği
          </p>
        </div>

        <div className="bg-emerald-50/70 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Sitenizin Tasarruf Potansiyeli</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-700">
            +{report.marketSummary.potentialMonthlySavingsForUser.toLocaleString("tr-TR")} <span className="text-xs font-bold text-emerald-900">TL / ay</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold">
            Kalite Skoru 9/10 + SEO Arbitraj Avantajı
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. SUB-NAV TABS */}
      {/* ===================================================================== */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("benchmarks")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "benchmarks"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rakip Bütçe & ROAS Kıyaslaması</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("channels")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "channels"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Kanal Dağılımı (Arama vs Haritalar vs Sosyal)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("arbitrage")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "arbitrage"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>CPC Arbitrajı (SEO ile Bedava Trafik)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("waste-prevention")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "waste-prevention"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>İsraf Önleme & Negatif Kelime Kalkanı</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden md:block">
          Analiz Tarihi: <span className="font-bold text-slate-700">{report.analyzedAt}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CONTENT SECTIONS */}
      {/* ===================================================================== */}
      <div className="p-6">
        {/* SUBTAB 1: BENCHMARKS */}
        {activeSubTab === "benchmarks" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {report.competitors.map((comp) => {
                const isExpanded = !!expandedAdIds[comp.id];

                return (
                  <div
                    key={comp.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      comp.isUser 
                        ? "bg-emerald-50/40 border-emerald-300 shadow-md ring-1 ring-emerald-400/50" 
                        : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                    }`}
                  >
                    <div className="p-5 md:p-6 space-y-4">
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          {comp.isUser ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> SİZİN VERİMLİLİK MODELİNİZ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-black bg-slate-900 text-white">
                              RAKİP FİRMA
                            </span>
                          )}
                          <h3 className="text-base font-black text-slate-900">
                            {comp.competitorName}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">({comp.domain})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Verimlilik Skoru:</span>
                          {getEfficiencyBadge(comp.efficiencyRating)}
                        </div>
                      </div>

                      {/* 4 Metrics in Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Aylık Tahmini Reklam Bütçesi</div>
                          <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                            {comp.estimatedMonthlyAdSpend.toLocaleString("tr-TR")} <span className="text-xs font-bold text-slate-500">TL</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Ortalama CPC (Tık Başı)</div>
                          <div className="text-lg font-black text-blue-700 font-mono mt-0.5">
                            {comp.estimatedCpc.toFixed(1)} <span className="text-xs font-bold text-blue-900">TL</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Tahmini ROAS (Getiri)</div>
                          <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                            {comp.roasScore}x
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Tahmini Boşa Harcanan / İsraf</div>
                          <div className="text-lg font-black text-rose-700 font-mono mt-0.5">
                            {comp.wastedSpendEstimate.toLocaleString("tr-TR")} <span className="text-xs font-bold text-rose-900">TL</span>
                          </div>
                        </div>
                      </div>

                      {/* Strategy observation banner */}
                      <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                        comp.isUser 
                          ? "bg-emerald-100/70 border border-emerald-200 text-emerald-950" 
                          : "bg-amber-50 border border-amber-200 text-amber-950"
                      }`}>
                        <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${comp.isUser ? "text-emerald-700" : "text-amber-600"}`} />
                        <div className="space-y-0.5">
                          <span className="font-bold">
                            {comp.isUser ? "Verimlilik Avantajı:" : "Stratejik Açık & İsraf Tespiti:"}
                          </span>
                          <p className="leading-relaxed">{comp.strategyObservation}</p>
                        </div>
                      </div>

                      {/* Expandable Google Ad Preview */}
                      {isExpanded && comp.topAdCopies.length > 0 && (
                        <div className="pt-2 space-y-3">
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Google Sponsorlu Arama Reklamı Görünümü (Masaüstü & Mobil):</span>
                          </div>

                          {comp.topAdCopies.map((ad, aIdx) => (
                            <div key={aIdx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              {/* Sponsored tag & display url */}
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                                  Sponsorlu
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">{ad.displayUrl}</span>
                              </div>

                              {/* Blue headline */}
                              <div className="text-base font-semibold text-blue-800 hover:underline cursor-pointer leading-tight">
                                {ad.headline}
                              </div>

                              {/* Description */}
                              <p className="text-xs text-slate-600 leading-snug">
                                {ad.description}
                              </p>

                              {/* Extensions */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                                {ad.adExtensions.map((ext, eIdx) => (
                                  <span key={eIdx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    {ext}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Toggle and Copy */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleExpand(comp.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? "Reklam Önizlemesini Gizle" : "Google Reklam Metnini & Uzantılarını Gör"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(
                            `${comp.competitorName}\nAylık Bütçe: ${comp.estimatedMonthlyAdSpend} TL\nCPC: ${comp.estimatedCpc} TL\nZaaf: ${comp.strategyObservation}`,
                            `comp-${comp.id}`
                          )}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === `comp-${comp.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Kopyala</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: CHANNELS */}
        {activeSubTab === "channels" && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <PieChart className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">Kanal Stratejisi Özeti: </strong>
                Rakipler acil ihtiyaç sektörlerinde bütçelerinin %68'ini genel Google arama ağına yığmakta ve Harita yerel aramalarını ihmal etmektedir. 
                Aşağıdaki önerilen bütçe dağılımı ile aynı bütçeyle %40 daha fazla doğrudan telefon araması elde edebilirsiniz.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.channelDistribution.map((ch, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      {ch.channel}
                    </h4>
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      Ort. CPC: {ch.cpcAverage.toFixed(1)} TL
                    </span>
                  </div>

                  {/* Visual Spend Share Comparison */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Rakiplerin Bütçe Payı:</span>
                        <span className="font-bold text-slate-800">{ch.competitorSpendShare}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-500 rounded-full transition-all duration-500"
                          style={{ width: `${ch.competitorSpendShare}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-emerald-700 mb-1 font-semibold">
                        <span>Size Önerilen Akıllı Pay:</span>
                        <span className="font-black text-emerald-800">{ch.userRecommendedSpendShare}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${ch.userRecommendedSpendShare}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/70">
                    <strong className="text-slate-900 font-bold">Taktik: </strong>
                    {ch.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: CPC ARBITRAGE */}
        {activeSubTab === "arbitrage" && (
          <div className="space-y-4">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <Crosshair className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">CPC Arbitrajı Nedir? </strong>
                Rakiplerin her tık başına 40-70 TL ödediği yüksek hacimli anahtar kelimeleri belirleyip; 
                bu kelimelerde SEO blog ve landing page içerikleriyle Google'da organik 1. sıraya çıkarak, 
                reklam bütçesi harcamadan aynı müşterileri 0 TL maliyetle kazanma stratejisidir.
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Hedef Kelime</th>
                    <th className="py-3 px-3 text-center">Ort. CPC</th>
                    <th className="py-3 px-3 text-center">Aylık Hacim</th>
                    <th className="py-3 px-3 text-center">Rakip Harcama Havuzu</th>
                    <th className="py-3 px-4">Organik / Arbitraj Fırsatı</th>
                    <th className="py-3 px-3 text-center">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.cpcArbitrageOpportunities.map((arb, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {arb.keyword}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                        {arb.avgCpc.toFixed(1)} TL
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {arb.monthlySearchVolume}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-800">
                        {arb.competitorTotalSpendEstimate}
                      </td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">
                        {arb.organicOpportunity}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          arb.recommendationType === "SEO ile Tasarruf Et"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : arb.recommendationType === "Düşük Teklifle Yakala"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {arb.recommendationType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: WASTE PREVENTION */}
        {activeSubTab === "waste-prevention" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.wastePreventionTactics.map((tactic, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {tactic.title}
                    </h4>
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Tasarruf: {tactic.estimatedSaving}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-rose-800 font-bold">Tehlike: </strong>
                    {tactic.riskDescription}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/70">
                    <strong className="text-slate-900 font-bold">Uygulama: </strong>
                    {tactic.actionProtocol}
                  </div>

                  {/* Negative Keywords List (if available) */}
                  {tactic.negativeKeywordsToExclude && tactic.negativeKeywordsToExclude.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Google Ads Hazır Negatif Eşleme Listesi:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(tactic.negativeKeywordsToExclude!.join("\n"), `neg-${idx}`)}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === `neg-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Listeyi Kopyala</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {tactic.negativeKeywordsToExclude.map((kw, kIdx) => (
                          <span key={kIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200">
                            -{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. FOOTER */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-t border-slate-200 p-5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            Pazar: <strong className="text-slate-800 font-bold">{report.sector}</strong> ({report.city}) &bull; Hedef Firma: <strong className="text-slate-800 font-bold">{report.companyName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Tahmini Aylık İsraf Önleme: <strong className="text-emerald-700 font-black">+{report.marketSummary.potentialMonthlySavingsForUser.toLocaleString("tr-TR")} TL</strong>
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Tüm Analizi Kopyala</span>
          </button>
        </div>
      </div>
    </div>
  );
};
