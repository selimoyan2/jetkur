import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  Layers,
  Copy,
  Check,
  Globe,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Link2,
  PhoneCall,
  Download,
  RotateCcw,
  Tag,
  Laptop,
  Smartphone,
  CheckCheck,
  Send,
  Wand2,
  ListOrdered,
  Eye
} from "lucide-react";
import {
  SiteConfig,
  AiSeoContentAssistantResult,
  ContentSearchIntent,
  ContentAngle,
  ContentTone,
  TitleOption,
  BlogOutlineSection
} from "../../types";
import {
  extractTargetKeywordSuggestions,
  generateFallbackAiSeoContentAssistant,
  calculateGooglePixelWidth,
  LOCAL_STORAGE_ASSISTANT_HISTORY_KEY
} from "../../utils/aiSeoContentAssistantEngine";

interface AiSeoContentAssistantProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onNavigateToBlogEngine?: (topic: string, keyword: string) => void;
}

export const AiSeoContentAssistant: React.FC<AiSeoContentAssistantProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onNavigateToBlogEngine
}) => {
  // Input State
  const [primaryKeyword, setPrimaryKeyword] = useState<string>("");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newSecondaryKeyword, setNewSecondaryKeyword] = useState<string>("");
  const [topicHint, setTopicHint] = useState<string>("");
  const [searchIntent, setSearchIntent] = useState<ContentSearchIntent>("Ticari");
  const [contentAngle, setContentAngle] = useState<ContentAngle>("Kapsamlı Rehber (Ultimate Guide)");
  const [tone, setTone] = useState<ContentTone>("Uzman & Otoriter");
  const [targetWordCount, setTargetWordCount] = useState<number>(1500);

  // Result & Execution State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiSeoContentAssistantResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"outline" | "meta" | "eeat">("outline");
  const [serpDeviceView, setSerpDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [appliedToSiteToast, setAppliedToSiteToast] = useState<boolean>(false);
  const [history, setHistory] = useState<AiSeoContentAssistantResult[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Quick keyword suggestions from site configuration
  const keywordSuggestions = React.useMemo(() => {
    return extractTargetKeywordSuggestions(siteConfig);
  }, [siteConfig]);

  // Load history & initialize with default keyword from site
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ASSISTANT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setResult(parsed[0]);
          setPrimaryKeyword(parsed[0].primaryKeyword);
          setSecondaryKeywords(parsed[0].secondaryKeywords || []);
        }
      }
    } catch (e) {
      console.error("Error reading saved assistant history:", e);
    }

    // Default primary keyword if empty
    if (!primaryKeyword && keywordSuggestions.length > 0) {
      setPrimaryKeyword(keywordSuggestions[0].keyword);
    }
  }, [keywordSuggestions]);

  // Expand first section by default when result changes
  useEffect(() => {
    if (result && result.sections.length > 0) {
      const initial: Record<string, boolean> = {};
      result.sections.forEach((sec, idx) => {
        initial[sec.id] = idx === 0 || idx === 1;
      });
      setExpandedSections(initial);
    }
  }, [result]);

  // Save to history helper
  const saveToHistory = (newResult: AiSeoContentAssistantResult) => {
    try {
      const updated = [newResult, ...history.filter(h => h.id !== newResult.id)].slice(0, 10);
      setHistory(updated);
      localStorage.setItem(LOCAL_STORAGE_ASSISTANT_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save assistant history:", e);
    }
  };

  // Generate Handler
  const handleGenerate = async () => {
    const trimmed = primaryKeyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setAppliedToSiteToast(false);

    try {
      const payload = {
        primaryKeyword: trimmed,
        secondaryKeywords,
        topicHint,
        searchIntent,
        contentAngle,
        tone,
        targetWordCount,
        companyName: siteConfig.companyName || "İşletme",
        sector: siteConfig.sector || "Hizmet",
        city: siteConfig.city || "İstanbul",
        siteServices: siteConfig.services?.items?.map(s => s.title).filter(Boolean) || []
      };

      const res = await fetch("/api/ai-seo-content-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        saveToHistory(data.data);
      } else {
        // Fallback
        const fallback = generateFallbackAiSeoContentAssistant(payload);
        setResult(fallback);
        saveToHistory(fallback);
      }
    } catch (err) {
      console.error("Error generating SEO outline:", err);
      const fallback = generateFallbackAiSeoContentAssistant({
        primaryKeyword: trimmed,
        secondaryKeywords,
        topicHint,
        searchIntent,
        contentAngle,
        tone,
        targetWordCount,
        companyName: siteConfig.companyName || "İşletme",
        sector: siteConfig.sector || "Hizmet",
        city: siteConfig.city || "İstanbul",
        siteServices: siteConfig.services?.items?.map(s => s.title).filter(Boolean) || []
      });
      setResult(fallback);
      saveToHistory(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Add Secondary Keyword
  const handleAddSecondaryKeyword = () => {
    const clean = newSecondaryKeyword.trim();
    if (clean && !secondaryKeywords.includes(clean)) {
      setSecondaryKeywords([...secondaryKeywords, clean]);
      setNewSecondaryKeyword("");
    }
  };

  // Remove Secondary Keyword
  const handleRemoveSecondaryKeyword = (kwToRemove: string) => {
    setSecondaryKeywords(secondaryKeywords.filter(k => k !== kwToRemove));
  };

  // Copy helper
  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Select Title Option
  const handleSelectTitle = (titleOpt: TitleOption) => {
    if (!result) return;
    const updated = {
      ...result,
      selectedTitle: titleOpt.title,
      metaContent: {
        ...result.metaContent,
        metaTitle: `${titleOpt.title} | ${siteConfig.companyName || "İşletme"}`,
        metaTitleLength: `${titleOpt.title} | ${siteConfig.companyName || "İşletme"}`.length,
        metaTitlePixelWidth: calculateGooglePixelWidth(`${titleOpt.title} | ${siteConfig.companyName || "İşletme"}`)
      }
    };
    setResult(updated);
    saveToHistory(updated);
  };

  // Apply to Site Meta Configuration
  const handleApplyToSiteMeta = () => {
    if (!result || !onUpdateSiteConfig) return;

    onUpdateSiteConfig((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaTitle: result.metaContent.metaTitle,
        metaDescription: result.metaContent.metaDescription,
        keywords: Array.from(new Set([
          result.primaryKeyword,
          ...(result.secondaryKeywords || []),
          ...(prev.seo?.keywords ? prev.seo.keywords.split(",").map(k => k.trim()) : [])
        ])).join(", ")
      }
    }));

    setAppliedToSiteToast(true);
    setTimeout(() => setAppliedToSiteToast(false), 4000);
  };

  // Handoff to AI Blog Engine
  const handleSendToBlogEngine = () => {
    if (!result) return;
    const topic = result.selectedTitle;
    const keyword = result.primaryKeyword;

    sessionStorage.setItem("ai_blog_prefill_topic", topic);
    sessionStorage.setItem("ai_blog_prefill_keyword", keyword);

    if (onNavigateToBlogEngine) {
      onNavigateToBlogEngine(topic, keyword);
    }
  };

  // Export Full Outline as Markdown
  const handleExportMarkdown = () => {
    if (!result) return;

    let md = `# ${result.selectedTitle}\n\n`;
    md += `> **Odak Anahtar Kelime:** ${result.primaryKeyword}\n`;
    md += `> **İkincil Kelimeler:** ${result.secondaryKeywords.join(", ")}\n`;
    md += `> **Arama Niyeti:** ${result.searchIntent} | **Hedef Kelime:** ~${result.targetWordCount} kelime\n\n`;
    
    md += `## Meta Bilgileri\n`;
    md += `- **Meta Title:** ${result.metaContent.metaTitle} (${result.metaContent.metaTitleLength} kar.)\n`;
    md += `- **Meta Description:** ${result.metaContent.metaDescription}\n`;
    md += `- **URL Slug:** /blog/${result.metaContent.cleanSlug}\n\n`;

    md += `## Giriş Kancası (Hook & Angle)\n`;
    md += `${result.hookIntro.hookLine}\n\n${result.hookIntro.problemAgitation}\n\n${result.hookIntro.valuePromise}\n\n`;

    md += `## Öne Çıkan Cevap (Google Featured Snippet / AI Overviews)\n`;
    md += `> ${result.featuredSnippetSummary}\n\n`;

    md += `## Makale Taslağı (H2 & H3 Başlıkları)\n\n`;
    result.sections.forEach((sec, idx) => {
      md += `### ${idx + 1}. ${sec.heading} (H2)\n`;
      md += `*Hedef:* ${sec.purpose}\n`;
      md += `*Bölüm Kelimeleri:* ${sec.targetKeywords.join(", ")}\n`;
      md += `*Önerilen İçerik Bloğu:* ${sec.suggestedVisualOrBlock}\n\n`;
      sec.subheadings.forEach((sub, sIdx) => {
        md += `#### ${idx + 1}.${sIdx + 1} ${sub.title} (H3)\n`;
        sub.bulletPoints.forEach(pt => {
          md += `- ${pt}\n`;
        });
        md += `\n`;
      });
    });

    md += `## Sıkça Sorulan Sorular (PAA - FAQ Schema)\n\n`;
    result.peopleAlsoAsk.forEach(paa => {
      md += `**S: ${paa.question}**\n${paa.conciseAnswer}\n\n`;
    });

    md += `## Eyleme Geçirici Mesaj (CTA)\n`;
    md += `**${result.callToActionPlan.ctaHeadline}**\n${result.callToActionPlan.ctaDescription}\nButon: ${result.callToActionPlan.ctaButtonText}\n`;

    handleCopy(md, "full_markdown");
  };

  return (
    <div className="space-y-6" id="ai-seo-content-assistant-root">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Gemini 3.8 Flash Destekli
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Google SERP & E-E-A-T Uyumlu
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              AI SEO İçerik Asistanı
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Hedef anahtar kelimelerinize göre Google 1. sayfada öne çıkan zengin sonuçlar (Featured Snippets), tıklama oranı yüksek H1 başlıkları, detaylı H2/H3 blog taslakları ve optimize edilmiş meta-içerik paketi üretin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {history.length > 0 && (
              <button
                type="button"
                id="btn-assistant-history"
                onClick={() => setShowHistoryModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Geçmiş Taslaklar ({history.length})</span>
              </button>
            )}
            {result && (
              <button
                type="button"
                id="btn-assistant-send-blog-top"
                onClick={handleSendToBlogEngine}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Blog Motorunda Makaleyi Yaz</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applied to Site Meta Toast Notification */}
      {appliedToSiteToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-sm shadow-sm transition-all animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Site Meta Etiketleri Başarıyla Güncellendi!</span>
              <p className="text-xs text-emerald-700 mt-0.5">
                Yeni Meta Title ve Description değerleri web sitenizin canlı SEO yapılandırmasına uygulandı.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAppliedToSiteToast(false)}
            className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Input Parameters Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              İçerik & SEO Parametreleri
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sektör: <strong className="text-slate-800">{siteConfig.sector || "Hizmet"}</strong> | Şehir: <strong className="text-slate-800">{siteConfig.city || "İstanbul"}</strong>
          </span>
        </div>

        {/* Quick Keyword Recommendations Chips */}
        <div className="mb-5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Sitenizden Önerilen Hedef Anahtar Kelimeler (Tek tıkla seçin):
            </span>
            <span className="text-[11px] text-slate-500">Hizmetler ve Yerel SEO analizi</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywordSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                id={`btn-kw-chip-${idx}`}
                onClick={() => {
                  setPrimaryKeyword(item.keyword);
                  setSearchIntent(item.searchIntent);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
                  primaryKeyword.toLowerCase() === item.keyword.toLowerCase()
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <span>{item.keyword}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                  primaryKeyword.toLowerCase() === item.keyword.toLowerCase()
                    ? "bg-indigo-700 text-indigo-100"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {item.searchIntent}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary Keyword Input */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Birincil Odak Anahtar Kelime <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-primary-keyword"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="Örn: Kadıköy oto çekici fiyatları"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Makalenin merkezinde yer alacak, H1 ve Meta başlığında geçecek ana terim.
            </p>
          </div>

          {/* Search Intent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Arama Niyeti (Search Intent)
            </label>
            <select
              id="select-search-intent"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value as ContentSearchIntent)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
            >
              <option value="Ticari">Ticari (Fiyat, Karşılaştırma, Maliyet)</option>
              <option value="Bilgilendirici">Bilgilendirici (Nasıl Yapılır, Rehber, Nedir)</option>
              <option value="Satın Alma / Yerel">Satın Alma / Yerel (Acil Çağrı, En Yakın, Servis)</option>
              <option value="Karşılaştırma">Karşılaştırma (En İyi Seçenekler, Tavsiyeler)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Google algoritmasının kullanıcı arama beklentisine göre içerik yapısı şekillenir.
            </p>
          </div>

          {/* Content Angle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              İçerik Açısı & Format (Content Angle)
            </label>
            <select
              id="select-content-angle"
              value={contentAngle}
              onChange={(e) => setContentAngle(e.target.value as ContentAngle)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
            >
              <option value="Kapsamlı Rehber (Ultimate Guide)">Kapsamlı Rehber (Ultimate Guide)</option>
              <option value="Fiyat & Maliyet Analizi">Fiyat & Maliyet Analizi</option>
              <option value="Adım Adım Nasıl Yapılır?">Adım Adım Nasıl Yapılır?</option>
              <option value="Sık Yapılan Hatalar & İpuçları">Sık Yapılan Hatalar & İpuçları</option>
              <option value="Karşılaştırma & Seçim Kriterleri">Karşılaştırma & Seçim Kriterleri</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Başlık alternatifleri ve H2 bölümlerinin yaklaşım formatı.
            </p>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Üslup / Anlatım Dili (Tone)
            </label>
            <select
              id="select-content-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as ContentTone)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
            >
              <option value="Uzman & Otoriter">Uzman & Otoriter (Yüksek E-E-A-T)</option>
              <option value="Samimi & Rehber">Samimi & Rehber (Açıklayıcı, Sıcak)</option>
              <option value="Kurumsal & Güven Verici">Kurumsal & Güven Verici (B2B/Resmi)</option>
              <option value="Pratik & Adım Adım">Pratik & Adım Adım (Madde Madde Hızlı)</option>
            </select>
          </div>

          {/* Target Word Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hedef Kelime Sayısı: <span className="text-indigo-600 font-extrabold">{targetWordCount} kelime</span>
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1000, 1500, 2000, 2500].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTargetWordCount(cnt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    targetWordCount === cnt
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ~{cnt}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Google sıralamasında rekabetçi olmak için 1200-1800 kelime önerilir.
            </p>
          </div>

          {/* Topic Hint (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Özel Konu / Vurgulanacak Not (İsteğe Bağlı)
            </label>
            <input
              type="text"
              id="input-topic-hint"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              placeholder="Örn: 2026 güncel tarife, kaskodan karşılama şartları"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Secondary / LSI Keywords tags */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            İkincil / LSI Uzun Kuyruklu Anahtar Kelimeler (İsteğe Bağlı)
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {secondaryKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSecondaryKeyword(kw)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newSecondaryKeyword}
              onChange={(e) => setNewSecondaryKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSecondaryKeyword();
                }
              }}
              placeholder="Ek anahtar kelime yazıp ekleyin..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
            <button
              type="button"
              onClick={handleAddSecondaryKeyword}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              Gemini 3.8 Flash, anahtar kelime yoğunluğunu ve Google SERP tıklama psikolojisini analiz ederek üretim yapar.
            </span>
          </div>

          <button
            type="button"
            id="btn-generate-seo-assistant"
            onClick={handleGenerate}
            disabled={loading || !primaryKeyword.trim()}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition cursor-pointer ${
              loading || !primaryKeyword.trim()
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-[1.01]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini Taslak ve Meta İçeriği Hazırlıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Taslak & Optimize Meta İçerik Üret</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6" id="ai-seo-assistant-results">
          {/* Result Navigation Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1">
              <button
                type="button"
                id="tab-btn-outline"
                onClick={() => setActiveResultTab("outline")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeResultTab === "outline"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Blog Taslağı (H1/H2/H3 Mimarisi)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeResultTab === "outline" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {result.sections.length} Bölüm
                </span>
              </button>

              <button
                type="button"
                id="tab-btn-meta"
                onClick={() => setActiveResultTab("meta")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeResultTab === "meta"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>2. Optimize Meta & SERP Önizleme</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeResultTab === "meta" ? "bg-indigo-700 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  Google SERP
                </span>
              </button>

              <button
                type="button"
                id="tab-btn-eeat"
                onClick={() => setActiveResultTab("eeat")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeResultTab === "eeat"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. E-E-A-T & Anahtar Kelime Matrisi</span>
              </button>
            </div>

            {/* Quick Export & Actions */}
            <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
              <button
                type="button"
                id="btn-export-markdown"
                onClick={handleExportMarkdown}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Tüm taslağı Markdown formatında kopyala"
              >
                {copiedItem === "full_markdown" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Taslağı Kopyala (MD)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-apply-meta-to-site"
                onClick={handleApplyToSiteMeta}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Meta başlığı ve açıklamayı doğrudan siteye uygula"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Siteye Uygula</span>
              </button>
            </div>
          </div>

          {/* TAB 1: BLOG OUTLINE (H1, H2, H3, HOOK, PAA, CTA) */}
          {activeResultTab === "outline" && (
            <div className="space-y-6">
              {/* Selected Title & Alternatives */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Google SERP Uyumlu H1 Başlık Alternatifleri (Tıklama Oranı / CTR Optimize)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    Aktif başlığa tıklayarak değiştirebilirsiniz
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.titleOptions.map((opt, idx) => {
                    const isSelected = opt.title === result.selectedTitle;
                    return (
                      <div
                        key={idx}
                        id={`title-option-card-${idx}`}
                        onClick={() => handleSelectTitle(opt)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            opt.ctrRating === "Çok Yüksek"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            CTR: {opt.ctrRating}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{opt.charCount} Karakter</span>
                            <span>•</span>
                            <span className={opt.pixelWidth <= 580 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                              {opt.pixelWidth} px {opt.pixelWidth <= 580 ? "(Tam Sığar)" : "(Kırpılabilir)"}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900 leading-snug">
                          {opt.title}
                        </h5>

                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {opt.angleDescription}
                        </p>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            <span>Seçili H1 Ana Başlık</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hook & Intro Strategy + Featured Snippet Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hook Intro Strategy */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Giriş Kancası & Değer Vaadi (PAS Modeli)
                    </h4>
                  </div>
                  
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Kanca Cümlesi (Hook Line):</span>
                    <p className="text-xs text-slate-800 font-medium mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      "{result.hookIntro.hookLine}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Sorun & Endişe (Problem Agitation):</span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {result.hookIntro.problemAgitation}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Çözüm & Değer Vaadi (Value Promise):</span>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60">
                      {result.hookIntro.valuePromise}
                    </p>
                  </div>
                </div>

                {/* Google Featured Snippet & AI Overviews Box */}
                <div className="bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/40 border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-indigo-950">
                        Google Featured Snippet / AI Overviews Cevap Kutusu
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      45-55 Kelime
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-100/80 shadow-xs">
                    {result.featuredSnippetSummary}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>Google arama sonuçlarının en üstündeki "0. Sıra" yanıt kutusunu hedefler.</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.featuredSnippetSummary, "featured_snippet")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === "featured_snippet" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === "featured_snippet" ? "Kopyalandı" : "Metni Kopyala"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* H2 & H3 Detailed Outline Sections */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-base font-bold text-slate-900">
                      Makale Bölüm Mimarisi (H2 ve H3 Alt Başlıklar)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        result.sections.forEach(s => all[s.id] = true);
                        setExpandedSections(all);
                      }}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      Tümünü Aç
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setExpandedSections({})}
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      Tümünü Kapat
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.sections.map((section, idx) => {
                    const isExpanded = expandedSections[section.id] ?? false;
                    return (
                      <div
                        key={section.id}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-slate-300 bg-white"
                      >
                        {/* Section Header */}
                        <div
                          onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                          className="p-4 bg-slate-50/70 hover:bg-slate-100/70 transition flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                                  H2 Başlığı
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  ~{section.estimatedWords} Kelime
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                                {section.heading}
                              </h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium">
                              {section.suggestedVisualOrBlock}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                        </div>

                        {/* Section Content (Expanded) */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 border-t border-slate-200/80 bg-white">
                            {/* Section Purpose & Keywords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 text-xs">
                              <div>
                                <span className="font-bold text-slate-700">Bölümün SEO Amacı:</span>
                                <p className="text-slate-600 mt-0.5">{section.purpose}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Hedef Anahtar Kelimeler:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {section.targetKeywords.map((k, kIdx) => (
                                    <span key={kIdx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                                      {k}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* H3 Subheadings */}
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-slate-700 block">
                                Alt Başlıklar (H3) ve İşlenecek Noktalar:
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {section.subheadings.map((sub, sIdx) => (
                                  <div key={sIdx} className="p-3 rounded-lg border border-slate-100 bg-white shadow-xs space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        H3
                                      </span>
                                      <h6 className="text-xs font-bold text-slate-800">
                                        {sub.title}
                                      </h6>
                                    </div>
                                    <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                                      {sub.bulletPoints.map((pt, pIdx) => (
                                        <li key={pIdx} className="leading-relaxed">
                                          {pt}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Block Badge */}
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                              <span className="text-slate-500">
                                Önerilen Görsel / Veri Elemanı: <strong className="text-slate-800">{section.suggestedVisualOrBlock}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(`${section.heading}\n${section.subheadings.map(s => `### ${s.title}\n${s.bulletPoints.map(b => `- ${b}`).join("\n")}`).join("\n\n")}`, `sec_${section.id}`)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
                              >
                                {copiedItem === `sec_${section.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedItem === `sec_${section.id}` ? "Kopyalandı" : "Bölümü Kopyala"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* People Also Ask & Internal Links Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* People Also Ask (PAA) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Google "Kullanıcılar Bunu da Sordu" (PAA Soruları)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      FAQ Schema Uyumlu
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {result.peopleAlsoAsk.map((paa, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            ?
                          </span>
                          {paa.question}
                        </span>
                        <p className="text-slate-600 pl-5 leading-relaxed">
                          {paa.conciseAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Links & CTA Plan */}
                <div className="space-y-4">
                  {/* Internal Links */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Link2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Stratejik İç Linkleme Fırsatları (Internal Links)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {result.internalLinks.map((link, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-indigo-700 hover:underline">
                              "{link.anchorText}"
                            </span>
                            <span className="text-slate-400 mx-1.5">→</span>
                            <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {link.targetPage}
                            </span>
                            <p className="text-slate-500 mt-1 text-[11px]">{link.context}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Banner Plan */}
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-950 border border-emerald-800 rounded-2xl p-5 text-white shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Makale İçi Dönüşüm Çağrısı (CTA)
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mb-1">
                      {result.callToActionPlan.ctaHeadline}
                    </h5>
                    <p className="text-xs text-emerald-200/90 mb-3 leading-relaxed">
                      {result.callToActionPlan.ctaDescription}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold shadow-xs">
                        {result.callToActionPlan.ctaButtonText}
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        Konum: {result.callToActionPlan.placement}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPTIMIZED META & LIVE SERP PREVIEW */}
          {activeResultTab === "meta" && (
            <div className="space-y-6">
              {/* Google Live SERP Snippet Preview Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Canlı Google SERP Önizleme
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kullanıcıların Google arama sonuçlarında göreceği gerçek masaüstü ve mobil kart görünümü.
                    </p>
                  </div>

                  {/* Desktop / Mobile Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
                    <button
                      type="button"
                      onClick={() => setSerpDeviceView("desktop")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        serpDeviceView === "desktop"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Masaüstü</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpDeviceView("mobile")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        serpDeviceView === "mobile"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobil</span>
                    </button>
                  </div>
                </div>

                {/* Google SERP Simulated Container */}
                <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 flex justify-center">
                  <div
                    className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm transition-all ${
                      serpDeviceView === "mobile" ? "max-w-md w-full" : "max-w-2xl w-full"
                    }`}
                  >
                    {/* Breadcrumbs & Favicon */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">
                        {siteConfig.companyName ? siteConfig.companyName.charAt(0) : "J"}
                      </div>
                      <div className="flex items-center gap-1 truncate text-[11px]">
                        <span className="font-semibold text-slate-900">
                          {siteConfig.companyName || "JetKur"}
                        </span>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-600">blog</span>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-500 font-mono truncate">
                          {result.metaContent.cleanSlug}
                        </span>
                      </div>
                    </div>

                    {/* Blue Title (Google SERP style) */}
                    <h3 className="text-lg md:text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                      {result.metaContent.metaTitle}
                    </h3>

                    {/* Grey Snippet Description */}
                    <p className="text-xs md:text-sm text-[#4d5156] mt-1.5 leading-relaxed line-clamp-2">
                      {result.metaContent.metaDescription}
                    </p>

                    {/* Sitelinks or rich snippet badges simulation */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-[#1a0dab]">
                      <span className="hover:underline cursor-pointer">Fiyat Tarifesi Tablosu</span>
                      <span>•</span>
                      <span className="hover:underline cursor-pointer">Sıkça Sorulan Sorular</span>
                      <span>•</span>
                      <span className="hover:underline cursor-pointer">Anında Teklif Al</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Fields Inspector & Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta Title Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Meta Başlık (Title Tag)
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-semibold ${
                        result.metaContent.isMetaTitleOptimal ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {result.metaContent.metaTitleLength} / 60 Karakter
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">
                        {result.metaContent.metaTitlePixelWidth} px
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 leading-relaxed">
                    {result.metaContent.metaTitle}
                  </div>

                  {/* Visual Pixel Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          result.metaContent.metaTitlePixelWidth <= 580 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, (result.metaContent.metaTitlePixelWidth / 600) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>0 px</span>
                      <span>Maksimum 580 px (Google kesme sınırı)</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(result.metaContent.metaTitle, "meta_title")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === "meta_title" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === "meta_title" ? "Kopyalandı" : "Başlığı Kopyala"}</span>
                    </button>
                  </div>
                </div>

                {/* Meta Description Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Meta Açıklama (Description Tag)
                    </label>
                    <span className={`text-xs font-semibold ${
                      result.metaContent.isMetaDescriptionOptimal ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {result.metaContent.metaDescriptionLength} / 160 Karakter
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                    {result.metaContent.metaDescription}
                  </div>

                  {/* Character Length Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          result.metaContent.isMetaDescriptionOptimal ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, (result.metaContent.metaDescriptionLength / 160) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>135 Karakter</span>
                      <span>İdeal Aralık: 140 - 160 Karakter</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(result.metaContent.metaDescription, "meta_desc")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === "meta_desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === "meta_desc" ? "Kopyalandı" : "Açıklamayı Kopyala"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* URL Slug, Open Graph, and Schema.org JSON-LD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clean URL Slug & Social OG */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    URL Slug & Sosyal Paylaşım (Open Graph)
                  </h4>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Önerilen SEO Uyumlu URL Slug:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 truncate">
                        /blog/{result.metaContent.cleanSlug}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.metaContent.cleanSlug, "slug")}
                        className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                      >
                        {copiedItem === "slug" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kapak Görseli Alt Metni (Image Alt):
                    </label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                      {result.metaContent.featuredImageAltText}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      OG Paylaşım Başlığı:
                    </label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 truncate">
                      {result.metaContent.ogTitle}
                    </div>
                  </div>
                </div>

                {/* JSON-LD Structured Data */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      Schema.org JSON-LD Yapısal Verisi
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.metaContent.schemaJsonLd, "json_ld")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === "json_ld" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === "json_ld" ? "Kopyalandı" : "JSON Kopyala"}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                    <pre className="whitespace-pre-wrap">{result.metaContent.schemaJsonLd}</pre>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Google Bot bu şemayı okuyarak makalenin yazarını, yayın tarihini ve ana konusunu doğrular.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: E-E-A-T & KEYWORD MATRIX */}
          {activeResultTab === "eeat" && (
            <div className="space-y-6">
              {/* E-E-A-T Signal Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-base font-bold text-slate-900">
                    Google E-E-A-T Kalite ve Güvenilirlik Kontrol Listesi
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Experience */}
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      1. Deneyim (Experience)
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {result.eeatChecklist.experience}
                    </p>
                  </div>

                  {/* Expertise */}
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      2. Uzmanlık (Expertise)
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {result.eeatChecklist.expertise}
                    </p>
                  </div>

                  {/* Authoritativeness */}
                  <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      3. Otoriterlik (Authoritativeness)
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {result.eeatChecklist.authoritativeness}
                    </p>
                  </div>

                  {/* Trustworthiness */}
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      4. Güvenilirlik (Trustworthiness)
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {result.eeatChecklist.trustworthiness}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyword Distribution Map */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Anahtar Kelime Dağılım ve Hedef Haritası
                  </h4>
                  <span className="text-xs text-slate-500">
                    Tahmini Rekabet Zorluğu: <strong className="text-indigo-600">{result.competitionDifficulty}</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Birincil Odak Terim
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 mt-1">
                        {result.primaryKeyword}
                      </h5>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      H1, İlk 100 Kelime & Sonuçta Geçmeli
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      İkincil / LSI Terimler
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.secondaryKeywords.map((sk, skIdx) => (
                        <span key={skIdx} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-medium shadow-2xs">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <h4 className="text-base font-bold text-white">
                Taslak Hazır! Makaleyi Tamamlamak İçin Son Adım:
              </h4>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Bu taslağı tek tıkla AI Blog Motoru'na aktararak 1500+ kelimelik tam makaleyi otomatik oluşturabilir veya ekibinize aktarabilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                id="btn-bottom-export-md"
                onClick={handleExportMarkdown}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
              >
                Taslağı Kopyala
              </button>
              <button
                type="button"
                id="btn-bottom-send-blog"
                onClick={handleSendToBlogEngine}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>AI Blog Motoruyla Yaz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Geçmiş SEO İçerik Taslakları
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {history.map((hist, idx) => (
                <div
                  key={hist.id || idx}
                  onClick={() => {
                    setResult(hist);
                    setPrimaryKeyword(hist.primaryKeyword);
                    setSecondaryKeywords(hist.secondaryKeywords || []);
                    setShowHistoryModal(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {hist.primaryKeyword}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {hist.selectedTitle}
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      {hist.createdAt} • {hist.sections.length} Bölüm • {hist.searchIntent}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
