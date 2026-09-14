import React, { useState, useEffect } from "react";
import { 
  SiteConfig, 
  SeoContentOptimizerData, 
  SeoTitleVariation, 
  SeoDescriptionVariation,
  SeoKeywordItem
} from "../../types";
import { 
  INDUSTRY_PRESETS, 
  IndustryPreset, 
  generateFallbackSeoContentOptimizer,
  calculateGooglePixelWidth 
} from "../../utils/seoContentOptimizerEngine";
import { 
  Sparkles, 
  Wand2, 
  Check, 
  Copy, 
  ExternalLink, 
  Search, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  RotateCcw, 
  Layers, 
  Building2, 
  MapPin, 
  HelpCircle,
  Share2,
  Sliders,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Star,
  Info
} from "lucide-react";

interface SeoContentOptimizerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenSeoTab?: () => void;
}

export const SeoContentOptimizer: React.FC<SeoContentOptimizerProps> = ({
  config,
  onChange,
  onPreview,
  onOpenSeoTab
}) => {
  // Form input states initialized from user's defined config
  const [industry, setIndustry] = useState<string>(config.sector || "Oto Kurtarma & Çekici");
  const [companyName, setCompanyName] = useState<string>(config.companyName || "HızlıWeb İşletmesi");
  const [city, setCity] = useState<string>(config.city || "İstanbul");
  const [contentType, setContentType] = useState<"global" | "hero" | "service" | "product" | "about" | "blog">("global");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [tone, setTone] = useState<"high_conversion" | "local" | "urgent" | "authority" | "offer">("high_conversion");
  const [syncIndustryWithConfig, setSyncIndustryWithConfig] = useState<boolean>(true);

  // Optimizer data state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optimizerData, setOptimizerData] = useState<SeoContentOptimizerData | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "social">("desktop");
  
  // Selected variation for SERP simulation
  const [activeTitleVariation, setActiveTitleVariation] = useState<SeoTitleVariation | null>(null);
  const [activeDescVariation, setActiveDescVariation] = useState<SeoDescriptionVariation | null>(null);

  // History for undo
  const [previousConfigState, setPreviousConfigState] = useState<SiteConfig | null>(null);

  // Available services, products, blog items for fine-grained targeting
  const services = config.services?.items || [];
  const products = config.products?.items || [];
  const blogPosts = config.blog?.items || [];

  // Determine current item title based on target content type
  const getCurrentTargetInfo = () => {
    if (contentType === "global") {
      return {
        name: "Anasayfa & Genel SEO",
        currentTitle: config.seo?.metaTitle || `${config.companyName} | ${config.sector}`,
        currentDesc: config.seo?.metaDescription || "",
        slug: ""
      };
    }
    if (contentType === "hero") {
      return {
        name: "Hero Bölümü (Manşet)",
        currentTitle: config.hero?.title || "",
        currentDesc: config.hero?.subtitle || "",
        slug: ""
      };
    }
    if (contentType === "about") {
      return {
        name: "Hakkımızda Bölümü",
        currentTitle: config.about?.title || "Hakkımızda",
        currentDesc: config.about?.content?.slice(0, 155) || "",
        slug: "hakkimizda"
      };
    }
    if (contentType === "service") {
      const s = services.find(item => item.id === selectedItemId) || services[0];
      return {
        name: s ? `Hizmet: ${s.title}` : "Hizmet Sayfası",
        currentTitle: s?.seoTitle || s?.title || "",
        currentDesc: s?.seoDescription || s?.desc || "",
        slug: s?.slug || "hizmet-detay",
        item: s
      };
    }
    if (contentType === "product") {
      const p = products.find(item => item.id === selectedItemId) || products[0];
      return {
        name: p ? `Ürün: ${p.title}` : "Ürün Sayfası",
        currentTitle: p?.seoTitle || p?.title || "",
        currentDesc: p?.seoDescription || p?.shortDescription || "",
        slug: p?.slug || "urun-detay",
        item: p
      };
    }
    if (contentType === "blog") {
      const b = blogPosts.find(item => item.id === selectedItemId) || blogPosts[0];
      return {
        name: b ? `Blog: ${b.title}` : "Blog Makalesi",
        currentTitle: b?.seoTitle || b?.title || "",
        currentDesc: b?.seoDescription || b?.excerpt || "",
        slug: b?.slug || "blog-yazisi",
        item: b
      };
    }
    return {
      name: "Anasayfa & Genel SEO",
      currentTitle: config.seo?.metaTitle || "",
      currentDesc: config.seo?.metaDescription || "",
      slug: ""
    };
  };

  const currentTarget = getCurrentTargetInfo();

  // Run optimization generator
  const runOptimization = async (overrideIndustry?: string) => {
    const targetIndustry = overrideIndustry || industry;
    setIsLoading(true);
    setAppliedNotice(null);

    const targetInfo = getCurrentTargetInfo();

    const requestPayload = {
      industry: targetIndustry,
      companyName,
      city,
      contentType,
      itemTitle: targetInfo.name,
      currentTitle: targetInfo.currentTitle,
      currentDescription: targetInfo.currentDesc,
      tone,
      primaryKeywords: config.seo?.keywords ? config.seo.keywords.split(",").map(k => k.trim()) : []
    };

    try {
      const response = await fetch("/api/seo-content-optimizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      const json = await response.json();
      if (json.success && json.data) {
        setOptimizerData(json.data);
        if (json.data.titleVariations?.length > 0) {
          setActiveTitleVariation(json.data.titleVariations[0]);
        }
        if (json.data.descriptionVariations?.length > 0) {
          setActiveDescVariation(json.data.descriptionVariations[0]);
        }
      } else {
        throw new Error(json.error || "Sunucudan SEO önerisi alınamadı");
      }
    } catch (err) {
      console.warn("API error, using local fallback generator:", err);
      const fallback = generateFallbackSeoContentOptimizer(requestPayload);
      setOptimizerData(fallback);
      if (fallback.titleVariations.length > 0) {
        setActiveTitleVariation(fallback.titleVariations[0]);
      }
      if (fallback.descriptionVariations.length > 0) {
        setActiveDescVariation(fallback.descriptionVariations[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount with initial user sector
  useEffect(() => {
    runOptimization();
  }, [contentType, selectedItemId]);

  // Handle Preset selection
  const handleSelectPreset = (preset: IndustryPreset) => {
    setIndustry(preset.name);
    if (syncIndustryWithConfig) {
      onChange({
        ...config,
        sector: preset.name
      });
    }
    runOptimization(preset.name);
  };

  // Copy to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Apply title variation to site config
  const handleApplyTitle = (variation: SeoTitleVariation) => {
    setPreviousConfigState({ ...config });
    let updated = { ...config };

    if (contentType === "global") {
      updated = {
        ...updated,
        seo: {
          ...updated.seo,
          metaTitle: variation.title
        }
      };
    } else if (contentType === "hero") {
      updated = {
        ...updated,
        hero: {
          ...updated.hero,
          title: variation.title
        }
      };
    } else if (contentType === "about") {
      updated = {
        ...updated,
        about: {
          ...updated.about,
          title: variation.title
        }
      };
    } else if (contentType === "service") {
      const targetId = selectedItemId || (services[0] ? services[0].id : "");
      updated = {
        ...updated,
        services: {
          ...updated.services,
          items: (updated.services?.items || []).map(s => 
            s.id === targetId ? { ...s, seoTitle: variation.title } : s
          )
        }
      };
    } else if (contentType === "product") {
      const targetId = selectedItemId || (products[0] ? products[0].id : "");
      updated = {
        ...updated,
        products: {
          ...updated.products,
          items: (updated.products?.items || []).map(p => 
            p.id === targetId ? { ...p, seoTitle: variation.title } : p
          )
        }
      };
    } else if (contentType === "blog") {
      const targetId = selectedItemId || (blogPosts[0] ? blogPosts[0].id : "");
      updated = {
        ...updated,
        blog: {
          ...updated.blog,
          items: (updated.blog?.items || []).map(b => 
            b.id === targetId ? { ...b, seoTitle: variation.title } : b
          )
        }
      };
    }

    if (syncIndustryWithConfig && industry !== config.sector) {
      updated.sector = industry;
    }

    onChange(updated);
    setActiveTitleVariation(variation);
    setAppliedNotice(`"${variation.title}" başlığı başarıyla sitenize uygulandı!`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  // Apply description variation to site config
  const handleApplyDescription = (variation: SeoDescriptionVariation) => {
    setPreviousConfigState({ ...config });
    let updated = { ...config };

    if (contentType === "global") {
      updated = {
        ...updated,
        seo: {
          ...updated.seo,
          metaDescription: variation.description
        }
      };
    } else if (contentType === "hero") {
      updated = {
        ...updated,
        hero: {
          ...updated.hero,
          subtitle: variation.description
        }
      };
    } else if (contentType === "about") {
      updated = {
        ...updated,
        about: {
          ...updated.about,
          content: variation.description
        }
      };
    } else if (contentType === "service") {
      const targetId = selectedItemId || (services[0] ? services[0].id : "");
      updated = {
        ...updated,
        services: {
          ...updated.services,
          items: (updated.services?.items || []).map(s => 
            s.id === targetId ? { ...s, seoDescription: variation.description } : s
          )
        }
      };
    } else if (contentType === "product") {
      const targetId = selectedItemId || (products[0] ? products[0].id : "");
      updated = {
        ...updated,
        products: {
          ...updated.products,
          items: (updated.products?.items || []).map(p => 
            p.id === targetId ? { ...p, seoDescription: variation.description } : p
          )
        }
      };
    } else if (contentType === "blog") {
      const targetId = selectedItemId || (blogPosts[0] ? blogPosts[0].id : "");
      updated = {
        ...updated,
        blog: {
          ...updated.blog,
          items: (updated.blog?.items || []).map(b => 
            b.id === targetId ? { ...b, seoDescription: variation.description } : b
          )
        }
      };
    }

    if (syncIndustryWithConfig && industry !== config.sector) {
      updated.sector = industry;
    }

    onChange(updated);
    setActiveDescVariation(variation);
    setAppliedNotice(`Açıklama başarıyla sitenize uygulandı!`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  // Apply both combo
  const handleApplyCombo = (titleVar: SeoTitleVariation, descVar: SeoDescriptionVariation) => {
    setPreviousConfigState({ ...config });
    let updated = { ...config };

    if (contentType === "global") {
      updated = {
        ...updated,
        seo: {
          ...updated.seo,
          metaTitle: titleVar.title,
          metaDescription: descVar.description
        }
      };
    } else if (contentType === "hero") {
      updated = {
        ...updated,
        hero: {
          ...updated.hero,
          title: titleVar.title,
          subtitle: descVar.description
        }
      };
    } else if (contentType === "service") {
      const targetId = selectedItemId || (services[0] ? services[0].id : "");
      updated = {
        ...updated,
        services: {
          ...updated.services,
          items: (updated.services?.items || []).map(s => 
            s.id === targetId ? { ...s, seoTitle: titleVar.title, seoDescription: descVar.description } : s
          )
        }
      };
    }

    if (syncIndustryWithConfig && industry !== config.sector) {
      updated.sector = industry;
    }

    onChange(updated);
    setActiveTitleVariation(titleVar);
    setActiveDescVariation(descVar);
    setAppliedNotice(`Tavsiye edilen Başlık & Açıklama ikilisi başarıyla uygulandı!`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  // Append keyword to config.seo.keywords
  const handleAddKeyword = (keyword: string) => {
    const current = config.seo?.keywords ? config.seo.keywords.split(",").map(k => k.trim()) : [];
    if (!current.includes(keyword)) {
      const next = [...current, keyword].join(", ");
      onChange({
        ...config,
        seo: {
          ...config.seo,
          keywords: next
        }
      });
      setAppliedNotice(`"${keyword}" anahtar kelimelere eklendi!`);
      setTimeout(() => setAppliedNotice(null), 3000);
    }
  };

  // Undo last application
  const handleUndo = () => {
    if (previousConfigState) {
      onChange(previousConfigState);
      setPreviousConfigState(null);
      setAppliedNotice("Son değişiklik geri alındı.");
      setTimeout(() => setAppliedNotice(null), 3000);
    }
  };

  // Active preview texts
  const displayTitle = activeTitleVariation?.title || currentTarget.currentTitle || `${companyName} | ${industry}`;
  const displayDesc = activeDescVariation?.description || currentTarget.currentDesc || `${city} bölgesinde profesyonel ${industry.toLowerCase()} çözümleri.`;
  const domainName = config.cloudflare?.customDomain || `${(companyName || "hizliweb").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`;

  return (
    <div id="seo-content-optimizer-root" className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
              <span>Google RankBrain &amp; Helpful Content Uyumlu</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Yapay Zeka SEO İçerik Optimize Edici</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 font-mono font-normal">
                AI Optimizer
              </span>
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              İşletmenizin tanımlı sektörü (<strong className="text-amber-300 font-semibold">{industry}</strong>) ve arama trendlerine göre en yüksek tıklama (CTR) sağlayan, anahtar kelime zengini başlık ve açıklama varyasyonları üretin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {previousConfigState && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Son değişikliği geri al"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Geri Al</span>
              </button>
            )}
            {onOpenSeoTab && (
              <button
                type="button"
                onClick={onOpenSeoTab}
                className="px-3.5 py-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white text-xs font-semibold border border-purple-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Paneline Dön</span>
              </button>
            )}
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Siteyi İncele</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Toast Notice */}
        {appliedNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{appliedNotice}</span>
            </div>
            {previousConfigState && (
              <button
                type="button"
                onClick={handleUndo}
                className="text-white underline hover:text-emerald-100 font-semibold cursor-pointer"
              >
                Geri Al
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Industry & Targeting Configuration Control Center */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">İşletme Sektörü &amp; Hedef Kitle Kriterleri</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Mevcut Tanımlı Sektör: <strong className="text-purple-700">{config.sector || "Belirtilmemiş"}</strong>
          </span>
        </div>

        {/* Preset Industry Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Hızlı Sektör Seçimi (Hazır Kütüphane):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRY_PRESETS.map(preset => {
              const isSelected = industry.toLowerCase().trim() === preset.name.toLowerCase().trim();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-purple-900 text-white shadow-xs font-bold ring-2 ring-purple-400/50"
                      : "bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200"
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? "bg-purple-800 text-purple-200" : "bg-slate-200 text-slate-600"
                  }`}>
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Custom Industry Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>İşletme Sektörü / Niş:</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="Örn: Oto Kurtarma & Çekici"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Firma Adı:</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Firma Adı"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>

          {/* City / Target Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Hedef Şehir / İlçe:</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Örn: İstanbul, Kadıköy"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>

          {/* Target Tone / Strategy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-slate-500" />
              <span>Hedef Arama Stratejisi:</span>
            </label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            >
              <option value="high_conversion">🎯 Yüksek Tıklama &amp; Dönüşüm (CTR)</option>
              <option value="local">📍 Yerel SEO Liderliği (Local Pack)</option>
              <option value="urgent">⚡ Acil Eylem &amp; 7/24 Çağrı</option>
              <option value="authority">🛡️ Kurumsal Güven &amp; E-E-A-T</option>
              <option value="offer">💰 Şeffaf Fiyat &amp; Teklif</option>
            </select>
          </div>
        </div>

        {/* Content Type Selector (Which page/element to optimize) */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Optimize Edilecek Bölüm:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setContentType("global")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contentType === "global" ? "bg-white text-purple-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🌐 Genel Meta
              </button>
              <button
                type="button"
                onClick={() => setContentType("hero")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contentType === "hero" ? "bg-white text-purple-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🚀 Hero Manşet
              </button>
              {services.length > 0 && (
                <button
                  type="button"
                  onClick={() => setContentType("service")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    contentType === "service" ? "bg-white text-purple-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🛠️ Hizmetler ({services.length})
                </button>
              )}
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => setContentType("product")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    contentType === "product" ? "bg-white text-purple-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🛍️ Ürünler ({products.length})
                </button>
              )}
            </div>
          </div>

          {/* Sub item dropdown if service/product */}
          {contentType === "service" && services.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Hizmet Seçin:</span>
              <select
                value={selectedItemId || services[0]?.id}
                onChange={e => setSelectedItemId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          )}

          {contentType === "product" && products.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Ürün Seçin:</span>
              <select
                value={selectedItemId || products[0]?.id}
                onChange={e => setSelectedItemId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            id="run-seo-optimizer-btn"
            disabled={isLoading}
            onClick={() => runOptimization()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Wand2 className="w-4 h-4 animate-spin text-purple-200" />
                <span>Yapay Zeka Analiz Ediyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Yeni Varyasyonlar Üret</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Industry SEO Insights Bar */}
      {optimizerData?.industryInsights && (
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                {optimizerData.industry} Sektörü Google Arama İçgörüleri &amp; Tıklama Dinamikleri
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-900 font-bold">
              Google CTR Benchmark: {INDUSTRY_PRESETS.find(p => p.name.toLowerCase().includes(industry.toLowerCase()))?.avgCtrBenchmark || "%8.2"}
            </span>
          </div>

          <p className="text-xs text-purple-900/90 leading-relaxed">
            {optimizerData.industryInsights.searchBehavior}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-purple-900">En Çok Tıklatan Kelimeler:</span>
            {optimizerData.industryInsights.highValueKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[11px] font-medium text-purple-800 shadow-2xs"
              >
                {kw}
              </span>
            ))}
          </div>

          <div className="text-[11px] text-purple-800 bg-white/80 p-2.5 rounded-xl border border-purple-200/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span><strong>Tavsiye Edilen Odak:</strong> {optimizerData.industryInsights.recommendedFocus}</span>
          </div>
        </div>
      )}

      {/* 4. Live Google SERP Simulation Card (Interactive Preview) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Canlı Google Arama Sonucu (SERP) &amp; Önizleme Simülatörü</span>
            </h3>
            <p className="text-xs text-slate-500">
              Seçtiğiniz başlık ve açıklama Google arama sonuçlarında tam olarak böyle görünecek:
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("social")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "social" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal / WhatsApp</span>
            </button>
          </div>
        </div>

        {/* SERP Visual Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          {previewDevice === "desktop" && (
            <div className="max-w-2xl bg-white p-4 rounded-lg shadow-2xs border border-slate-200 font-sans space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                  {companyName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-900 leading-tight">{companyName}</span>
                  <span className="text-[11px] text-slate-500 leading-tight">https://www.{domainName} {currentTarget.slug ? `› ${currentTarget.slug}` : ""}</span>
                </div>
              </div>

              <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                {displayTitle}
              </h4>

              <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-slate-700">4.9</span>
                <span className="text-slate-500">(142 Google Yorumu) • {city}</span>
              </div>

              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {displayDesc}
              </p>

              {/* Pixel & Character Warning meter */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Başlık: {displayTitle.length} karakter ({calculateGooglePixelWidth(displayTitle)}px / 580px)</span>
                <span>Açıklama: {displayDesc.length} karakter (İdeal: 130-160)</span>
              </div>
            </div>
          )}

          {previewDevice === "mobile" && (
            <div className="max-w-sm mx-auto bg-white p-4 rounded-2xl shadow-sm border border-slate-200 font-sans space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{companyName}</div>
                  <div className="text-[10px] text-slate-400">{domainName}</div>
                </div>
              </div>

              <h4 className="text-base font-semibold text-[#1a0dab] leading-snug">
                {displayTitle}
              </h4>

              <p className="text-xs text-[#4d5156] leading-relaxed">
                {displayDesc}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Doğrulanmış İşletme</span>
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  📞 Tek Tıkla Ara
                </span>
              </div>
            </div>
          )}

          {previewDevice === "social" && (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
              <div className="h-36 bg-gradient-to-r from-purple-900 to-indigo-900 flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 w-fit backdrop-blur-sm">
                  {industry}
                </span>
                <h5 className="text-sm font-bold truncate mt-1">{companyName}</h5>
              </div>
              <div className="p-3.5 space-y-1 bg-slate-50">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{domainName}</div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{displayTitle}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{displayDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Keyword-Rich TITLE Variations Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Sektöre Özel Başlık (Title) Varyasyonları</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold">
                {optimizerData?.titleVariations?.length || 0} Varyasyon
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Maksimum 60 karakter limitine ve yüksek arama hacmine göre optimize edilmiş başlıklar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizerData?.titleVariations?.map(variation => {
            const isApplied = (contentType === "global" && config.seo?.metaTitle === variation.title) ||
                              (contentType === "hero" && config.hero?.title === variation.title);
            const isPreviewing = activeTitleVariation?.id === variation.id;
            const isIdealLength = variation.charCount >= 40 && variation.charCount <= 60;

            return (
              <div
                key={variation.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-white ${
                  isApplied
                    ? "border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                    : isPreviewing
                    ? "border-purple-400 shadow-md ring-1 ring-purple-400/30"
                    : "border-slate-200/80 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Variation Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200">
                    {variation.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      CTR %{variation.ctrScore}
                    </span>
                    {isApplied && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Sitede Aktif</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title Text */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-900 leading-snug">
                  {variation.title}
                </div>

                {/* Metrics Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className={isIdealLength ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                    {variation.charCount} Karakter {isIdealLength ? "(İdeal)" : "(Gözden Geçir)"}
                  </span>
                  <span>~{variation.pixelWidth}px / 580px</span>
                  <span className="text-slate-600 font-sans">{variation.intent}</span>
                </div>

                {/* Embedded Keywords */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">İçerilen Kelimeler:</span>
                  {variation.embeddedKeywords?.map((kw, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>

                {/* AI Rationale */}
                <p className="text-[11px] text-slate-500 italic bg-purple-50/40 p-2 rounded-lg border border-purple-100">
                  💡 {variation.reason}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyTitle(variation)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sitede Uygula</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTitleVariation(variation)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isPreviewing
                        ? "bg-purple-50 border-purple-300 text-purple-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    title="SERP önizlemede gör"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(variation.title, `title-${variation.id}`)}
                    className="py-2 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                    title="Metni kopyala"
                  >
                    {copiedId === `title-${variation.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Keyword-Rich DESCRIPTION Variations Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Sektöre Özel Açıklama (Meta Description) Varyasyonları</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">
                {optimizerData?.descriptionVariations?.length || 0} Varyasyon
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              130-160 karakter arası, net eylem çağrısı (CTA) ve sektörel arama tetikleyicileri barındıran açıklamalar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizerData?.descriptionVariations?.map(variation => {
            const isApplied = (contentType === "global" && config.seo?.metaDescription === variation.description) ||
                              (contentType === "hero" && config.hero?.subtitle === variation.description);
            const isPreviewing = activeDescVariation?.id === variation.id;
            const isIdealLength = variation.charCount >= 130 && variation.charCount <= 165;

            return (
              <div
                key={variation.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-white ${
                  isApplied
                    ? "border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                    : isPreviewing
                    ? "border-indigo-400 shadow-md ring-1 ring-indigo-400/30"
                    : "border-slate-200/80 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Variation Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200">
                    {variation.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      CTR %{variation.ctrScore}
                    </span>
                    {isApplied && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Sitede Aktif</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Text */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 leading-relaxed">
                  {variation.description}
                </div>

                {/* Metrics Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className={isIdealLength ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                    {variation.charCount} Karakter {isIdealLength ? "(İdeal 130-160)" : "(Uyarı: Google Kırpabilir)"}
                  </span>
                  <span className="text-slate-600 font-sans font-medium">
                    CTA: <strong className="text-indigo-700">{variation.callToAction}</strong>
                  </span>
                </div>

                {/* Embedded Keywords */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Hedef Kelimeler:</span>
                  {variation.embeddedKeywords?.map((kw, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>

                {/* AI Rationale */}
                <p className="text-[11px] text-slate-500 italic bg-indigo-50/40 p-2 rounded-lg border border-indigo-100">
                  💡 {variation.reason}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyDescription(variation)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sitede Uygula</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDescVariation(variation)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isPreviewing
                        ? "bg-indigo-50 border-indigo-300 text-indigo-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    title="SERP önizlemede gör"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(variation.description, `desc-${variation.id}`)}
                    className="py-2 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                    title="Metni kopyala"
                  >
                    {copiedId === `desc-${variation.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Industry Keyword Opportunities Matrix */}
      {optimizerData?.keywordSuggestions && optimizerData.keywordSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>{optimizerData.industry} Sektörü Yüksek Hacimli Anahtar Kelime Fırsatları</span>
              </h3>
              <p className="text-xs text-slate-500">
                Sitenizin meta etiketlerine veya içeriklerine ekleyebileceğiniz yüksek potansiyelli arama terimleri:
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Mevcut Meta Kelimeler: {(config.seo?.keywords || "").split(",").filter(Boolean).length} adet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {optimizerData.keywordSuggestions.map((kw, i) => {
              const alreadyHas = (config.seo?.keywords || "").toLowerCase().includes(kw.keyword.toLowerCase());

              return (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all bg-slate-50/50 hover:bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {kw.keyword}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      %{kw.relevance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{kw.monthlySearchVolume}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">
                      {kw.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={alreadyHas}
                    onClick={() => handleAddKeyword(kw.keyword)}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      alreadyHas
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200"
                    }`}
                  >
                    {alreadyHas ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Ekli</span>
                      </>
                    ) : (
                      <>
                        <span>+ Meta'ya Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Actionable Content Tips */}
      {optimizerData?.contentTips && optimizerData.contentTips.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {optimizerData.industry} Sektöründe 1. Sıraya Çıkma Rehberi &amp; Tavsiyeler
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {optimizerData.contentTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
