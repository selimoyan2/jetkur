import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  SiteConfig, 
  CompetitorContentExpansionReport, 
  CompetitorContentExpansionIdea,
  SearchIntentType,
  ContentFormatType
} from "../../types";
import { 
  generateFallbackContentExpansion,
  exportContentExpansionToCSV
} from "../../utils/competitorContentExpansionEngine";
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  BookOpen, 
  Users, 
  MousePointerClick,
  Eye
} from "lucide-react";

interface CompetitorContentExpansionCardProps {
  config: Partial<SiteConfig>;
  onNavigateTab?: (tabKey: string) => void;
  onOpenCustomReport?: () => void;
}

export const CompetitorContentExpansionCard: React.FC<CompetitorContentExpansionCardProps> = ({
  config,
  onNavigateTab,
  onOpenCustomReport
}) => {
  // Main report state
  const [report, setReport] = useState<CompetitorContentExpansionReport>(() => {
    return generateFallbackContentExpansion(config);
  });

  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiToast, setGeminiToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAllCopied, setIsAllCopied] = useState<boolean>(false);

  // Filters
  const [intentFilter, setIntentFilter] = useState<SearchIntentType | "all">("all");
  const [formatFilter, setFormatFilter] = useState<ContentFormatType | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Expandable cards state
  const [expandedIdeaIds, setExpandedIdeaIds] = useState<Record<string, boolean>>({
    "idea-1": true,
    "idea-2": true
  });

  // Re-generate or sync when config changes
  useEffect(() => {
    const fallback = generateFallbackContentExpansion(config);
    setReport(fallback);
  }, [config]);

  const toggleExpand = (id: string) => {
    setExpandedIdeaIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered ideas
  const filteredIdeas = useMemo(() => {
    return report.contentIdeas.filter(idea => {
      if (intentFilter !== "all" && idea.searchIntent !== intentFilter) return false;
      if (formatFilter !== "all" && idea.contentFormat !== formatFilter) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = idea.blogTitle.toLowerCase().includes(q);
        const matchMeta = idea.metaDescription.toLowerCase().includes(q);
        const matchKw = idea.primaryKeyword.toLowerCase().includes(q);
        const matchSec = idea.secondaryKeywords.some(k => k.toLowerCase().includes(q));
        if (!matchTitle && !matchMeta && !matchKw && !matchSec) return false;
      }

      return true;
    });
  }, [report.contentIdeas, intentFilter, formatFilter, searchQuery]);

  // Total potential calculation
  const totalPotentialTraffic = useMemo(() => {
    let sum = 0;
    report.contentIdeas.forEach(idea => {
      const match = idea.expectedTrafficShare.match(/\+?([\d\.]+)/);
      if (match) {
        sum += parseFloat(match[1].replace(".", ""));
      }
    });
    return sum > 0 ? `+${sum.toLocaleString("tr-TR")} / ay` : "+13.800 / ay";
  }, [report.contentIdeas]);

  // Call Gemini API to regenerate ideas
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
      const response = await fetch("/api/competitor-content-expansion", {
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
        setReport(resData.data);
        const sourceMsg = resData.source === "gemini-3.8-flash" 
          ? "Gemini 3.8 Flash & Canlı Google Arama ile rakipler taranıp güncellendi" 
          : "Algoritmik strateji motoru ile güncellendi";
        setGeminiToast(sourceMsg);
        setTimeout(() => setGeminiToast(null), 4000);
      }
    } catch (err) {
      console.warn("Gemini generation failed, using fallback:", err);
      const fallback = generateFallbackContentExpansion(config);
      setReport(fallback);
      setGeminiToast("Yerel SEO motoru ile yeniden hesaplandı");
      setTimeout(() => setGeminiToast(null), 4000);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Copy specific element
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all ideas
  const handleCopyAll = () => {
    const fullText = `=== İÇERİK GELİŞTİRME ÖNERİLERİ & META TASLAKLARI ===
Firma: ${report.companyName} (${report.city} - ${report.sector})
Web: ${report.domain}
Tarih: ${report.analyzedAt}
Toplam Beklenen Trafik Katkısı: ${totalPotentialTraffic}

${report.contentIdeas.map((idea, idx) => `--- #${idx + 1}: ${idea.blogTitle} ---
Format: ${idea.contentFormat} | Arama Niyeti: ${idea.searchIntent}
Birincil Kelime: ${idea.primaryKeyword} (${idea.estimatedMonthlySearchVolume})
İkincil Kelimeler: ${idea.secondaryKeywords.join(", ")}

[GOOGLE SERP META TITLE]:
${idea.metaTitle} (${idea.metaTitle.length}/60 Karakter)

[GOOGLE SERP META DESCRIPTION]:
${idea.metaDescription} (${idea.metaDescription.length}/160 Karakter)

Rakip Karşılaştırma Kaynağı: ${idea.competitorBenchmarkSource}
Kapatılan Rakip Açığı: ${idea.competitorGapToExploit}
Hedef Kitle: ${idea.targetAudience}
Beklenen Trafik: ${idea.expectedTrafficShare}

Önerilen Alt Başlıklar (H2 / H3):
${idea.suggestedHeadings.map(h => `  - ${h}`).join("\n")}`).join("\n\n")}`;

    navigator.clipboard.writeText(fullText);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2500);
  };

  // Intent badge renderer
  const renderIntentBadge = (intent: SearchIntentType) => {
    switch (intent) {
      case "Ticari / Karar":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Ticari / Satın Alma</span>;
      case "Acil / İşlemsel":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">Acil / İşlemsel</span>;
      case "Bilgilendirici":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Bilgilendirici</span>;
      case "Yerel Keşif":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">Yerel Keşif</span>;
    }
  };

  return (
    <div id="competitor-content-expansion-card" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* ===================================================================== */}
      {/* 1. HEADER & ACTION BAR */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 md:p-8 text-white relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Gemini 3.8 Flash & Google SERP Destekli
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-200 border border-white/10">
                <MousePointerClick className="w-3 h-3 text-cyan-300" />
                Yüksek CTR Meta Taslakları
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/10">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                {totalPotentialTraffic} Potansiyel
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              İçerik Geliştirme Önerileri
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Rakiplerin en çok organik trafik çeken sayfalarındaki içerik açıkları taranarak; 
              <strong className="text-white font-semibold"> {report.companyName}</strong> için özel olarak kurgulanmış, 
              yüksek tıklama oranlı (CTR) blog başlıkları, Google SERP uyumlu meta açıklamaları ve alt başlık mimarileri.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              id="btn-gemini-regenerate-content-expansion"
              onClick={handleRegenerateWithGemini}
              disabled={isLoadingGemini}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGemini ? "animate-spin" : ""}`} />
              <span>{isLoadingGemini ? "SERP Taranıyor..." : "Gemini ile Yenile"}</span>
            </button>

            <button
              type="button"
              id="btn-copy-all-content-ideas"
              onClick={handleCopyAll}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Tüm taslakları panoya kopyala"
            >
              {isAllCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isAllCopied ? "Kopyalandı" : "Tümünü Kopyala"}</span>
            </button>

            <button
              type="button"
              id="btn-export-content-expansion-csv"
              onClick={() => exportContentExpansionToCSV(report)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>CSV İndir</span>
            </button>

            {onOpenCustomReport && (
              <button
                type="button"
                id="btn-content-expansion-to-custom-report"
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
          <div className="mt-4 p-2.5 px-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{geminiToast}</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. TOP COMPETITOR BENCHMARK INSIGHTS BAR */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rakiplerin En Çok Trafik Alan İçerik Röntgeni & Vurulacak Zayıf Noktaları
            </h3>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
            Google SERP Analizi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.topCompetitorInsights.map((comp, cIdx) => (
            <div key={cIdx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{comp.name}</span>
                <span className="font-mono text-emerald-700 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {comp.estimatedTraffic}
                </span>
              </div>
              <div className="text-xs font-medium text-blue-900 bg-blue-50/50 p-2 rounded-xl border border-blue-100 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate" title={comp.topArticleTitle}>{comp.topArticleTitle}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-amber-800 font-bold">Açık: </strong>
                {comp.weaknessesToBeat}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. FILTER BAR */}
      {/* ===================================================================== */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Filtrele:
          </span>

          {/* Search Intent Filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tüm Arama Niyetleri</option>
            <option value="Ticari / Karar">Ticari / Satın Alma (Yüksek CVR)</option>
            <option value="Acil / İşlemsel">Acil / İşlemsel (Anında Arama)</option>
            <option value="Bilgilendirici">Bilgilendirici (Otorite & PAA)</option>
            <option value="Yerel Keşif">Yerel Keşif (Semt & Otoyol)</option>
          </select>

          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tüm Formatlar</option>
            <option value="Fiyat & Karşılaştırma">Fiyat & Karşılaştırma</option>
            <option value="Nasıl Yapılır (How-To)">Nasıl Yapılır (How-To)</option>
            <option value="Soru & Cevap (PAA)">Soru & Cevap (PAA)</option>
            <option value="Yerel Semt Listesi">Yerel Semt Listesi</option>
            <option value="Kapsamlı Rehber">Kapsamlı Rehber</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Başlık veya kelime ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CONTENT IDEAS & SERP PREVIEW LIST */}
      {/* ===================================================================== */}
      <div className="p-6 space-y-6">
        {filteredIdeas.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold">Filtreye uygun içerik önerisi bulunamadı.</p>
            <p className="text-xs text-slate-400 mt-1">Filtreleri sıfırlayarak tüm taslakları görüntüleyebilirsiniz.</p>
          </div>
        ) : (
          filteredIdeas.map((idea, index) => {
            const isExpanded = !!expandedIdeaIds[idea.id];
            const metaTitleLen = idea.metaTitle.length;
            const metaDescLen = idea.metaDescription.length;

            return (
              <div 
                key={idea.id || index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Top strip */}
                <div className="p-5 md:p-6 space-y-4">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white">
                        Öneri #{index + 1}
                      </span>
                      {renderIntentBadge(idea.searchIntent)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {idea.contentFormat}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Zorluk: {idea.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">
                        Arama Hacmi: <strong className="font-mono text-slate-900 font-black">{idea.estimatedMonthlySearchVolume}</strong>
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {idea.expectedTrafficShare}
                      </span>
                    </div>
                  </div>

                  {/* Blog H1 Title */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {idea.blogTitle}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopyText(idea.blogTitle, `h1-${idea.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Blog başlığını kopyala"
                      >
                        {copiedId === `h1-${idea.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                      <span className="font-bold text-slate-600">Birincil Hedef:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {idea.primaryKeyword}
                      </span>
                      <span className="text-slate-400">&bull; Destekleyici LSI:</span>
                      {idea.secondaryKeywords.map((sec, sIdx) => (
                        <span key={sIdx} className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* REAL-TIME GOOGLE SERP PREVIEW BOX */}
                  {/* ======================================================= */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                      <span className="font-bold flex items-center gap-1.5 text-slate-700">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Google SERP Canlı Arama Sonucu Görünümü (Masaüstü & Mobil)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          metaTitleLen <= 60 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          Title: {metaTitleLen} / 60 kark.
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          metaDescLen >= 140 && metaDescLen <= 165 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          Desc: {metaDescLen} / 160 kark.
                        </span>
                      </div>
                    </div>

                    {/* Google SERP Snippet */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 font-sans">
                      {/* Breadcrumb */}
                      <div className="flex items-center gap-2 text-[12px] text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                          G
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-slate-900">{report.companyName}</span>
                          <span className="text-slate-400 font-mono text-[10px]">https://{report.domain} › blog</span>
                        </div>
                      </div>

                      {/* SERP Blue Title */}
                      <div className="text-[17px] font-normal text-blue-800 hover:underline cursor-pointer leading-tight">
                        {idea.metaTitle}
                      </div>

                      {/* SERP Meta Description Snippet */}
                      <div className="text-[13px] text-slate-600 leading-snug">
                        {idea.metaDescription}
                      </div>
                    </div>

                    {/* Copy Meta Buttons */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-500">
                        Bu meta etiketleri, Google SERP'te ilk 3 sıraya tık çekmek üzere tasarlanmıştır.
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(idea.metaTitle, `title-${idea.id}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === `title-${idea.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Meta Title Kopyala</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(idea.metaDescription, `desc-${idea.id}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === `desc-${idea.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Meta Desc Kopyala</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Competitor Gap Banner */}
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-950">
                        Rakipten Alınan İlham: {idea.competitorBenchmarkSource}
                      </span>
                      <p className="text-amber-900 leading-relaxed">
                        <strong className="text-amber-950 font-semibold">Nasıl Öne Geçilecek? </strong>
                        {idea.competitorGapToExploit}
                      </p>
                    </div>
                  </div>

                  {/* Expandable outline & headings */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-4 rounded-xl animate-fadeIn text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Google Featured Snippet Hedefli Hiyerarşik Başlık Taslağı (H2 / H3):
                        </h4>
                        <div className="space-y-1.5 pl-2">
                          {idea.suggestedHeadings.map((heading, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-2 text-slate-700 font-medium">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 shrink-0">
                                H2
                              </span>
                              <span>{heading}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          <strong className="font-bold text-slate-800">Hedef Kitle: </strong>
                          {idea.targetAudience}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleExpand(idea.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? "Başlık Mimarisini Gizle" : "Başlık Mimarisi ve H2/H3 Planını Gör"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(`${idea.blogTitle}\n\n${idea.metaTitle}\n${idea.metaDescription}\n\nBaşlıklar:\n${idea.suggestedHeadings.join("\n")}`, `full-${idea.id}`)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === `full-${idea.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Taslağı Kopyala</span>
                      </button>

                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab("customer-panel")}
                          className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="AI İçerik Asistanı ile bu başlıkta tam makale yazdırın"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI ile Yazdır</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. FOOTER */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-t border-slate-200 p-5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>
            Analiz Tarihi: <strong className="text-slate-800 font-bold">{report.analyzedAt}</strong> &bull; Sektör: <strong className="text-slate-800 font-bold">{report.sector}</strong> ({report.city})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Toplam {report.contentIdeas.length} Trafik Odaklı Taslak &bull; Tahmini Katkı: {totalPotentialTraffic}
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Tümünü Kopyala</span>
          </button>
        </div>
      </div>
    </div>
  );
};
