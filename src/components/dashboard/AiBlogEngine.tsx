import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig, BlogPostItem } from "../../types";
import {
  BlogEngineGenerationRequest,
  GeneratedBlogArticle,
  SmartTopicIdea,
  generateSmartTopicIdeas,
  auditBlogArticleSeo,
  generateBlogJsonLdSchema,
  convertToBlogPostItem,
  generateFallbackBlogArticle,
  STOCK_ARTICLE_COVERS
} from "../../utils/aiBlogEngineUtils";
import {
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Code2,
  Check,
  RefreshCw,
  ExternalLink,
  Eye,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Copy,
  FolderPlus,
  HelpCircle,
  BarChart3,
  Globe2,
  CornerDownRight,
  Maximize2
} from "lucide-react";

interface AiBlogEngineProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
  onArticlePublished?: (newArticleId: string) => void;
  onClose?: () => void;
}

export const AiBlogEngine: React.FC<AiBlogEngineProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab,
  onArticlePublished,
  onClose
}) => {
  // Config extracts
  const company = config.companyName || "Kurumsal Firma";
  const sector = config.sector || "Hizmet";
  const city = config.city || "İstanbul";
  const servicesList = useMemo(() => {
    return (config.services?.items || []).map((s) => s.title).filter(Boolean);
  }, [config.services?.items]);

  // Form State
  const [targetSector, setTargetSector] = useState(sector);
  const [targetCity, setTargetCity] = useState(city);
  const [targetCompany, setTargetCompany] = useState(company);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [focusKeyword, setFocusKeyword] = useState(`${city} ${sector.toLowerCase()}`);
  
  // Strategy & Configuration
  const [targetAudience, setTargetAudience] = useState("Yerel Hizmet & Bilgi Arayan Müşteriler");
  const [tone, setTone] = useState<"professional" | "friendly" | "authoritative" | "practical">("professional");
  const [articleType, setArticleType] = useState<"guide" | "comparison" | "tips_tricks" | "cost_pricing" | "case_study">("guide");
  const [length, setLength] = useState<"standard" | "deep" | "comprehensive">("deep");
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeCallToAction, setIncludeCallToAction] = useState(true);
  const [customNotes, setCustomNotes] = useState("");

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedBlogArticle | null>(null);
  const [activeTab, setActiveTab] = useState<"generator" | "review" | "seo" | "schema">("generator");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("mobile");

  // Editable fields in review
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDesc, setEditSeoDesc] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  // Toast / Feedback
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-detect prefilled topic from Competitive SEO Insight widget
  useEffect(() => {
    try {
      const prefillTopic = sessionStorage.getItem("ai_blog_prefill_topic");
      const prefillKeyword = sessionStorage.getItem("ai_blog_prefill_keyword");
      if (prefillTopic) {
        setCustomTopic(prefillTopic);
        setSelectedTopic("");
        sessionStorage.removeItem("ai_blog_prefill_topic");
      }
      if (prefillKeyword) {
        setFocusKeyword(prefillKeyword);
        sessionStorage.removeItem("ai_blog_prefill_keyword");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Dynamic smart topic ideas based on inputs
  const topicIdeas = useMemo(() => {
    return generateSmartTopicIdeas(targetSector, targetCity, targetCompany, servicesList);
  }, [targetSector, targetCity, targetCompany, servicesList]);

  // Handle generation
  const handleGenerate = async () => {
    const finalTopic = (customTopic.trim() || selectedTopic.trim()) || `${targetSector} Hizmeti Alırken Nelere Dikkat Edilmeli? (${targetCity} 2026 Kılavuzu)`;
    
    setIsGenerating(true);
    setErrorMsg(null);
    setPublishSuccess(false);
    setGenerationStep(1);

    // Simulated progress transitions for high perceived value
    const timer1 = setTimeout(() => setGenerationStep(2), 1200);
    const timer2 = setTimeout(() => setGenerationStep(3), 2800);
    const timer3 = setTimeout(() => setGenerationStep(4), 4500);

    const payload: BlogEngineGenerationRequest = {
      companyName: targetCompany,
      sector: targetSector,
      city: targetCity,
      services: servicesList,
      topic: finalTopic,
      targetAudience,
      tone,
      articleType,
      length,
      includeFaq,
      includeCallToAction,
      focusKeywords: focusKeyword,
      customNotes
    };

    try {
      const res = await fetch("/api/generate-blog-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        throw new Error(`API hatası: ${res.statusText}`);
      }

      const result = await res.json();
      if (result.success && result.data) {
        const article: GeneratedBlogArticle = result.data;
        setGeneratedArticle(article);
        setEditTitle(article.title);
        setEditSlug(article.slug);
        setEditExcerpt(article.excerpt);
        setEditContent(article.content);
        setEditSeoTitle(article.seoTitle);
        setEditSeoDesc(article.seoDescription);
        setEditKeywords(article.seoKeywords);
        setActiveTab("review");
      } else {
        throw new Error("İçerik formatlanırken hata oluştu.");
      }
    } catch (err: any) {
      console.warn("Backend blog generation issue, using robust client-side algorithmic fallback:", err);
      // Seamless algorithmic generation fallback
      const fallback = generateFallbackBlogArticle(payload);
      setGeneratedArticle(fallback);
      setEditTitle(fallback.title);
      setEditSlug(fallback.slug);
      setEditExcerpt(fallback.excerpt);
      setEditContent(fallback.content);
      setEditSeoTitle(fallback.seoTitle);
      setEditSeoDesc(fallback.seoDescription);
      setEditKeywords(fallback.seoKeywords);
      setActiveTab("review");
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // 1-Click Publish to Blog
  const handlePublishToBlog = () => {
    if (!generatedArticle) return;

    // Apply any edits made by the user in review mode
    const finalArticle: GeneratedBlogArticle = {
      ...generatedArticle,
      title: editTitle,
      slug: editSlug,
      excerpt: editExcerpt,
      content: editContent,
      seoTitle: editSeoTitle,
      seoDescription: editSeoDesc,
      seoKeywords: editKeywords
    };

    const newPostItem: BlogPostItem = convertToBlogPostItem(finalArticle, config);

    const currentBlogItems = config.blog?.items || [];
    const currentCategories = config.blogCategories || config.blog?.categories || [];

    // Ensure category exists
    let targetCatId = "bcat-1";
    const foundCat = currentCategories.find((c) => c.name.toLowerCase() === finalArticle.category.toLowerCase());
    if (foundCat) {
      targetCatId = foundCat.id;
    }

    newPostItem.categoryIds = [targetCatId];

    const updatedBlog = {
      enabled: true,
      badge: config.blog?.badge || "Kurumsal Blog",
      title: config.blog?.title || "Rehberler ve Güncel Makaleler",
      subtitle: config.blog?.subtitle || "Sektörden uzman tavsiyeleri ve ipuçları",
      categories: currentCategories,
      items: [newPostItem, ...currentBlogItems]
    };

    const updatedConfig: SiteConfig = {
      ...config,
      blog: updatedBlog
    };

    onChange(updatedConfig);
    setPublishSuccess(true);

    if (onArticlePublished) {
      onArticlePublished(newPostItem.id);
    }
  };

  const copyJsonLd = () => {
    if (!generatedArticle?.jsonLdSchema) return;
    navigator.clipboard.writeText(generatedArticle.jsonLdSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div id="ai-driven-blog-engine" className="space-y-6">
      {/* HEADER HERO BAR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Yapay Zeka Blog & SEO Motoru (E-E-A-T Uyumlu)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {targetSector} Nişine Özel Otomatik Uzun Makale Üretici
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Google Helpful Content kriterlerine göre yapılandırılmış, <strong>{targetCity}</strong> yerel aramalarında ilk sıraları hedefleyen, otomatik H1-H3 hiyerarşili, SERP snippet ve FAQPage JSON-LD şemalı profesyonel Türkçe makaleler oluşturun.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              id="tab-btn-generator"
              onClick={() => setActiveTab("generator")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "generator"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1. Makale Üretici</span>
            </button>

            {generatedArticle && (
              <button
                type="button"
                id="tab-btn-review"
                onClick={() => setActiveTab("review")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "review"
                    ? "bg-indigo-600 text-white shadow-md font-black"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. Canlı İncele & Düzenle</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-black">
                  %{generatedArticle.seoScore}
                </span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
                title="Kapat"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER WHEN PUBLISHED */}
      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="text-sm font-black text-emerald-950">
                Makale Başarıyla Sitenizin Bloguna Eklendi ve Canlıya Alındı!
              </div>
              <div className="text-xs text-emerald-700">
                SEO etiketleri, URL bağlantısı ve FAQ şeması otomatik olarak kaydedildi.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Önizlemede Gör</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("blog")}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span>Blog Listesine Dön</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: GENERATOR WIZARD */}
      {activeTab === "generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Niche & Parameters (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Niche & Local SEO Targeting Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  1. İşletme Nişi & Bölgesel SEO Hedefi
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sector / Niche */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sektör / İşletme Nişi
                  </label>
                  <input
                    type="text"
                    value={targetSector}
                    onChange={(e) => setTargetSector(e.target.value)}
                    placeholder="Örn: Oto Kurtarma & Çekici, Diş Kliniği..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                {/* City / Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hizmet Bölgesi / Şehir (Yerel SEO)
                  </label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    placeholder="Örn: Kadıköy / İstanbul, Ankara..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Quick Niche Pills */}
              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1.5">
                  Popüler Niş Seçenekleri:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Oto Çekici & Yol Yardım",
                    "Diş Kliniği & İmplant",
                    "Hukuk & Danışmanlık",
                    "Mali Müşavirlik & Muhasebe",
                    "İnşaat & Ev Tadilatı",
                    "Klima & Kombi Servisi",
                    "Güzellik & Kuaför"
                  ].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setTargetSector(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        targetSector === p
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Name & Focus Keyword */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Firma / Marka Adı
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Odak Arama Terimi (Focus Keyword)
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="Örn: kadıköy en iyi oto çekici"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 2. Article Tone, Length & Structural Depth */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  2. İçerik Derinliği ve Yazım Stratejisi
                </h3>
              </div>

              {/* Length Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Makale Kapsamı & Kelime Hacmi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLength("standard")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      length === "standard"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-black">Standart Rehber</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">~800 Kelime (4-5 dk)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Hızlı, net ve doğrudan pratik cevaplar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLength("deep")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      length === "deep"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 uppercase">
                      Önerilen
                    </div>
                    <div className="text-xs font-black">Uzman Kılavuzu</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">~1500 Kelime (8-10 dk)</div>
                    <div className="text-[10px] text-slate-400 mt-1">E-E-A-T otoritesi, derin başlıklar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLength("comprehensive")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      length === "comprehensive"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-black">Pillar İçerik</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">~2200+ Kelime (12+ dk)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Sektörün en kapsamlı ansiklopedik rehberi</div>
                  </button>
                </div>
              </div>

              {/* Tone Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Yazım Dili & Üslup
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden"
                  >
                    <option value="professional">Kurumsal, Güven Verici & Profesyonel</option>
                    <option value="friendly">Samimi, Açıklayıcı & Yardımsever</option>
                    <option value="authoritative">Akademik & Yüksek Otoriter (B2B)</option>
                    <option value="practical">Pratik, Adım Adım & Çözüm Odaklı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Makale Formatı / Türü
                  </label>
                  <select
                    value={articleType}
                    onChange={(e) => setArticleType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden"
                  >
                    <option value="guide">Kapsamlı Rehber & Nasıl Yapılır Kılavuzu</option>
                    <option value="cost_pricing">Fiyatlandırma & Maliyet Analizi Rehberi</option>
                    <option value="tips_tricks">Sık Yapılan Hatalar & Uzman İpuçları</option>
                    <option value="comparison">Karşılaştırma & Hizmet Seçim Kriterleri</option>
                    <option value="case_study">Yerel Başarı Örneği & Çözüm Hikayesi</option>
                  </select>
                </div>
              </div>

              {/* Automatic SEO Formatting Options */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Otomatik SEO & Zengin Sonuç Biçimlendirmeleri:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeFaq}
                      onChange={(e) => setIncludeFaq(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Sıkça Sorulan Sorular (FAQPage Şeması)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeCallToAction}
                      onChange={(e) => setIncludeCallToAction(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Sonuç Eylem Çağrısı (CTA & WhatsApp)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Smart Topic Generator & Trigger (5 Cols on LG) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Smart Topic Recommendations */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Nişe Özel Konu Fırsatları
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {topicIdeas.length} Öneri
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Google arama hacmi yüksek ve dönüşüm odaklı hazır konu şablonlarından birini seçin:
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {topicIdeas.map((idea) => {
                  const isSelected = selectedTopic === idea.title && !customTopic;
                  return (
                    <button
                      type="button"
                      key={idea.id}
                      onClick={() => {
                        setSelectedTopic(idea.title);
                        setCustomTopic("");
                        setFocusKeyword(idea.primaryKeyword);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400 shadow-2xs"
                          : "bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            idea.angle === "Maliyet & Fiyat" ? "bg-emerald-100 text-emerald-800" :
                            idea.angle === "Rehber & Kılavuz" ? "bg-indigo-100 text-indigo-800" :
                            idea.angle === "Hata & Çözüm" ? "bg-rose-100 text-rose-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {idea.angle}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            {idea.estimatedReadTime}
                          </span>
                        </div>
                        <div className="text-xs font-bold leading-snug">
                          {idea.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Hedef: {idea.primaryKeyword}
                        </div>
                      </div>
                      <div className={`shrink-0 mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Or Custom Topic */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Veya Kendi Makale Başlığınızı Girin:
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                    if (e.target.value) setSelectedTopic("");
                  }}
                  placeholder="Örn: 2026'da En Çok Tercih Edilen Uygulama Yöntemleri..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* GENERATE BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-generate-ai-blog"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>
                        {generationStep === 1 ? "1/4 Niş & Arama Trendleri Çözümleniyor..." :
                         generationStep === 2 ? "2/4 E-E-A-T Başlık Hiyerarşisi Kuruluyor..." :
                         generationStep === 3 ? "3/4 Uzun Metin & SSS Üretiliyor..." :
                         "4/4 SEO & Schema.org Formatlanıyor..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Uzun Makaleyi Yapay Zeka ile Üret & SEO'ya Biçimlendir</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Gemini Flash motoruyla taranabilir HTML, SERP etiketleri ve JSON-LD şeması dakikalar içinde üretilir.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: REVIEW, EDIT & 1-CLICK PUBLISH STUDIO */}
      {activeTab === "review" && generatedArticle && (
        <div className="space-y-6">
          
          {/* Top Review Bar with SEO Score & Publish Actions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Score & Basic Stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                  <span className="text-base leading-none">%{generatedArticle.seoScore}</span>
                  <span className="text-[8px] uppercase tracking-tighter mt-0.5">SEO Skoru</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Google SEO Uyum Durumu</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      A+ Yayına Hazır
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                    <span><strong>{generatedArticle.wordCount}</strong> kelime</span>
                    <span>•</span>
                    <span>{generatedArticle.readTime}</span>
                    <span>•</span>
                    <span>{generatedArticle.headingsCount.h2} H2, {generatedArticle.headingsCount.h3} H3</span>
                  </div>
                </div>
              </div>

              {/* Focus Keyword Badge */}
              <div className="hidden sm:block pl-4 border-l border-slate-200">
                <div className="text-[10px] text-slate-400 font-medium">Odak Anahtar Kelime</div>
                <div className="text-xs font-mono font-bold text-slate-800">{generatedArticle.primaryKeyword}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab("generator")}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeni Üretim</span>
              </button>

              <button
                type="button"
                id="btn-publish-to-blog"
                onClick={handlePublishToBlog}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sitede Yayınla & Bloga Ekle</span>
              </button>
            </div>

          </div>

          {/* LIVE GOOGLE SERP PREVIEW BOX */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Canlı Google Arama Önizlemesi (SERP Snippet)
                </h4>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    serpDevice === "mobile" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Mobil
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    serpDevice === "desktop" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Masaüstü
                </button>
              </div>
            </div>

            {/* Google Search Card Simulation */}
            <div className={`p-4 rounded-xl border border-slate-200 bg-white font-sans ${
              serpDevice === "mobile" ? "max-w-md" : "max-w-2xl"
            }`}>
              {/* Site Identity Line */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {company.slice(0, 1)}
                </div>
                <div className="text-[11px] leading-tight overflow-hidden">
                  <div className="font-medium text-slate-900 truncate">{company}</div>
                  <div className="text-slate-500 text-[10px] font-mono truncate">
                    https://siteadresi.com/blog/{editSlug}
                  </div>
                </div>
              </div>

              {/* Blue Clickable Title */}
              <div className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer leading-snug line-clamp-2">
                {editSeoTitle || editTitle}
              </div>

              {/* Grey Snippet Description */}
              <div className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                <span className="text-slate-400 mr-1.5">{generatedArticle.date} —</span>
                {editSeoDesc || editExcerpt}
              </div>

              {/* Rich snippet FAQ accordion badge preview if available */}
              {generatedArticle.faqItems && generatedArticle.faqItems.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Google Sıkça Sorulan Sorular (FAQ) Akordeon Zengin Sonucu Aktif</span>
                </div>
              )}
            </div>
          </div>

          {/* TWO-COLUMN EDIT & PREVIEW STUDIO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT 6 COLS: Editable Fields & SEO Meta */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Makale Alanlarını Düzenle</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Canlı Değişiklikler</span>
                </div>

                {/* Article Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Makale Başlığı (H1)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Bağlantısı (Slug)
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600">
                    <span className="text-slate-400">/blog/</span>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full bg-transparent border-none text-slate-900 font-bold focus:outline-hidden ml-0.5"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kısa Özet (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* SEO Title & Description */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Google SEO Başlığı (SERP Title)
                      </label>
                      <span className={`text-[10px] font-mono ${
                        editSeoTitle.length > 60 ? "text-amber-600 font-bold" : "text-slate-400"
                      }`}>
                        {editSeoTitle.length}/60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editSeoTitle}
                      onChange={(e) => setEditSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Google Meta Açıklaması (Meta Description)
                      </label>
                      <span className={`text-[10px] font-mono ${
                        editSeoDesc.length > 160 ? "text-amber-600 font-bold" : "text-slate-400"
                      }`}>
                        {editSeoDesc.length}/160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editSeoDesc}
                      onChange={(e) => setEditSeoDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    SEO Kalite & Biçimlendirme Denetimi:
                  </div>
                  <div className="space-y-1.5">
                    {generatedArticle.seoAudits.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs"
                      >
                        {item.status === "good" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : item.status === "warning" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900">{item.label}: </span>
                          <span className="text-slate-600">{item.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* JSON-LD Schema Code View */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Schema.org JSON-LD (Zengin Snippet)</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyJsonLd}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSchema ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSchema ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36">
                    {generatedArticle.jsonLdSchema}
                  </pre>
                </div>

              </div>
            </div>

            {/* RIGHT 6 COLS: Rendered HTML Article Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Biçimlendirilmiş Makale Önizlemesi</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    HTML Canlı Render
                  </span>
                </div>

                {/* Article Header Container */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                      {generatedArticle.category}
                    </span>
                    <span>•</span>
                    <span>{generatedArticle.date}</span>
                    <span>•</span>
                    <span>{generatedArticle.readTime}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {editTitle}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 italic border-l-2 border-indigo-500 pl-3">
                    {editExcerpt}
                  </p>
                </div>

                {/* Cover Photo */}
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative">
                  <img
                    src={generatedArticle.coverImage}
                    alt={generatedArticle.imageAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] text-white backdrop-blur-xs font-mono">
                    Alt: {generatedArticle.imageAlt}
                  </div>
                </div>

                {/* HTML Body Preview */}
                <div
                  className="prose prose-sm prose-slate max-w-none text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4 space-y-4"
                  dangerouslySetInnerHTML={{ __html: editContent }}
                />

                {/* Bottom Publish Trigger */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePublishToBlog}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Bu Makaleyi Web Sitesinde Yayınla</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
