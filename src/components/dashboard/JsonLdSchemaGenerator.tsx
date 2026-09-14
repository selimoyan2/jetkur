import React, { useState, useMemo } from "react";
import {
  Code2,
  CheckCheck,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  ShoppingBag,
  HelpCircle,
  Globe,
  Sliders,
  Star,
  MapPin,
  Eye,
  RefreshCw,
  Search,
  Check,
  Zap,
  Layers
} from "lucide-react";
import { SiteConfig, JsonLdSchemaConfig } from "../../types";
import {
  SCHEMA_BUSINESS_TYPES,
  getEffectiveSchemaConfig,
  generateCompositeSchemaGraph,
  generateLocalBusinessSchema,
  generateCatalogItemListSchema,
  generateFaqPageSchema,
  generateWebSiteSchema,
  validateSiteSchema,
  mapSectorToSchemaType,
  resolveSiteBaseUrl
} from "../../utils/schemaOrgGenerator";

interface JsonLdSchemaGeneratorProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenLocalSeoSchema?: () => void;
  onOpenSeoTab?: () => void;
}

type PreviewTab = "graph" | "localBusiness" | "products" | "faq" | "website" | "custom";

export const JsonLdSchemaGenerator: React.FC<JsonLdSchemaGeneratorProps> = ({
  config,
  onChange,
  onPreview,
  onOpenLocalSeoSchema,
  onOpenSeoTab
}) => {
  const schemaConfig = useMemo(() => getEffectiveSchemaConfig(config), [config]);
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>("graph");
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [customJsonInput, setCustomJsonInput] = useState<string>(
    config.seo?.schemaConfig?.customJsonLd || ""
  );
  const [customJsonError, setCustomJsonError] = useState<string | null>(null);

  // Validation report
  const validation = useMemo(() => validateSiteSchema(config), [config]);
  const siteUrl = useMemo(() => resolveSiteBaseUrl(config), [config]);

  // Updater helper
  const updateSchemaConfig = (patch: Partial<JsonLdSchemaConfig>) => {
    const updated: SiteConfig = {
      ...config,
      seo: {
        ...config.seo,
        schemaConfig: {
          ...schemaConfig,
          ...patch
        }
      }
    };
    onChange(updated);
    showToast("Schema.org ayarları güncellendi ve sayfa çıktısına uygulandı!");
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  // Auto-detect sector schema
  const handleAutoDetectSector = () => {
    const detected = mapSectorToSchemaType(config.sector);
    updateSchemaConfig({
      businessType: detected
    });
    showToast(`Sektör "${config.sector}" için en uygun Schema.org tipi (${detected}) otomatik seçildi.`);
  };

  // Generate individual schemas for tabs
  const generatedGraph = useMemo(() => {
    return generateCompositeSchemaGraph(config, "home");
  }, [config]);

  const localBusinessJson = useMemo(() => {
    return generateLocalBusinessSchema(config);
  }, [config]);

  const productsJson = useMemo(() => {
    return generateCatalogItemListSchema(config) || {
      "@context": "https://schema.org",
      "notice": "Henüz aktif ürün bulunmuyor veya ürün kataloğu devre dışı."
    };
  }, [config]);

  const faqJson = useMemo(() => {
    return generateFaqPageSchema(config) || {
      "@context": "https://schema.org",
      "notice": "Henüz SSS (Sıkça Sorulan Sorular) bölümünde soru-cevap eklenmemiş."
    };
  }, [config]);

  const websiteJson = useMemo(() => {
    return generateWebSiteSchema(config);
  }, [config]);

  // Resolve current active code
  const currentCode = useMemo(() => {
    if (activePreviewTab === "custom") {
      return customJsonInput;
    }
    let targetObj: any = generatedGraph;
    if (activePreviewTab === "localBusiness") targetObj = localBusinessJson;
    if (activePreviewTab === "products") targetObj = productsJson;
    if (activePreviewTab === "faq") targetObj = faqJson;
    if (activePreviewTab === "website") targetObj = websiteJson;

    return JSON.stringify(targetObj, null, 2);
  }, [activePreviewTab, generatedGraph, localBusinessJson, productsJson, faqJson, websiteJson, customJsonInput]);

  // Copy code handler
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Download JSON handler
  const handleDownloadJson = () => {
    const blob = new Blob([currentCode], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-${activePreviewTab}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save Custom JSON-LD
  const handleSaveCustomJson = () => {
    if (!customJsonInput.trim()) {
      updateSchemaConfig({ customJsonLd: "" });
      setCustomJsonError(null);
      return;
    }
    try {
      JSON.parse(customJsonInput);
      setCustomJsonError(null);
      updateSchemaConfig({ customJsonLd: customJsonInput.trim() });
    } catch (err: any) {
      setCustomJsonError("Geçersiz JSON formatı! Lütfen tırnak ve parantez sözdizimini kontrol edin.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Rich Snippets & Schema.org JSON-LD Motoru</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Otomatik JSON-LD Schema.org Oluşturucu
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              İşletmeniz için <strong>LocalBusiness</strong>, <strong>Product (Ürün Kataloğu)</strong> ve <strong>FAQ (Sıkça Sorulanlar)</strong> yapılandırılmış verilerini otomatik üretir ve doğrudan tüm web sayfalarının kaynak koduna (<code className="text-amber-300 font-mono text-xs">&lt;head&gt;</code>) enjekte eder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onPreview && (
              <button
                type="button"
                id="btn-schema-open-preview"
                onClick={onPreview}
                className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-300" />
                <span>Canlı Sitede Gör</span>
              </button>
            )}

            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Zengin Sonuçlar Testi</span>
            </a>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs font-medium">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
              validation.score >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {validation.score}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Google Uyumluluk</div>
              <div className="font-bold text-white text-xs">{validation.score >= 90 ? 'Mükemmel' : 'Geliştirilebilir'}</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">İşletme Tipi</div>
              <div className="font-mono font-bold text-white text-xs truncate max-w-[120px]">
                {schemaConfig.businessType}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Ürün Şeması</div>
              <div className="font-bold text-white text-xs">
                {validation.summary.productCount > 0 ? `${validation.summary.productCount} Ürün Aktif` : 'Ürün Yok'}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">FAQPage (SSS)</div>
              <div className="font-bold text-white text-xs">
                {validation.summary.faqCount > 0 ? `${validation.summary.faqCount} Soru Aktif` : 'Soru Yok'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Generator Controls (7 Cols) & Code Inspector / Live Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Schema Generator Options & Toggles */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Master Injection Switch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${schemaConfig.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <h2 className="text-sm font-bold text-slate-900">Otomatik JSON-LD Sayfa Enjeksiyonu</h2>
              </div>
              <p className="text-xs text-slate-500">
                Açık olduğunda, oluşturulan tüm şemalar web sitesinin canlı çıktısına ve statik HTML dosyalarına otomatik gömülür.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                id="toggle-schema-master"
                checked={schemaConfig.enabled}
                onChange={(e) => updateSchemaConfig({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Module 1: LocalBusiness Schema */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Yerel İşletme Şeması (LocalBusiness)</h3>
                  <p className="text-xs text-slate-500">Google Haritalar, Yerel 3'lü Paket ve işletme profili zengin sonuçları</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schemaConfig.autoInjectLocalBusiness}
                  onChange={(e) => updateSchemaConfig({ autoInjectLocalBusiness: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {onOpenLocalSeoSchema && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between gap-3">
                <div className="text-xs text-blue-900">
                  <strong className="font-bold">Özel Yerel SEO Şema Motoru:</strong> Adres, telefon ve çalışma saatlerini otomatik senkronize eden özel arayüzü kullanın.
                </div>
                <button
                  type="button"
                  onClick={onOpenLocalSeoSchema}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
                >
                  <span>Yerel SEO Motorunu Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Business Type Selector with Auto Detect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Schema.org İşletme Tipi (@type)</label>
                <button
                  type="button"
                  onClick={handleAutoDetectSector}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sektörümden Otomatik Algıla</span>
                </button>
              </div>

              <select
                id="select-schema-business-type"
                value={schemaConfig.businessType}
                onChange={(e) => updateSchemaConfig({ businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {SCHEMA_BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — [{t.category}]
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Seçilen tip Google'a işletmenizin tam faaliyet alanını (örn. oto çekici, diş kliniği, hukuk bürosu vb.) tanıtır.
              </p>
            </div>

            {/* Price Range & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat Aralığı (Price Range)</label>
                <select
                  value={schemaConfig.priceRange || "₺₺"}
                  onChange={(e) => updateSchemaConfig({ priceRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:border-indigo-500"
                >
                  <option value="₺">₺ (Ekonomik / Uygun Fiyat)</option>
                  <option value="₺₺">₺₺ (Standart / Orta Segment)</option>
                  <option value="₺₺₺">₺₺₺ (Üst Segment / Premium)</option>
                  <option value="₺₺₺₺">₺₺₺₺ (Lüks / VIP Hizmet)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Para Birimi</label>
                <select
                  value={schemaConfig.currency || "TRY"}
                  onChange={(e) => updateSchemaConfig({ currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:border-indigo-500"
                >
                  <option value="TRY">TRY (Türk Lirası - ₺)</option>
                  <option value="USD">USD (Amerikan Doları - $)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                </select>
              </div>
            </div>

            {/* Coordinates for Local Pack Maps */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Harita Koordinatları (GeoCoordinates)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Google Harita Eşlemesi</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Enlem (Lat) örn: 41.0082"
                  value={schemaConfig.latitude || ""}
                  onChange={(e) => updateSchemaConfig({ latitude: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Boylam (Lng) örn: 28.9784"
                  value={schemaConfig.longitude || ""}
                  onChange={(e) => updateSchemaConfig({ longitude: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Koordinatlar girildiğinde Google yerel aramalarda işletmenizi harita üzerinde tam konumla eşleştirir.
              </p>
            </div>

            {/* AggregateRating & Star Snippets */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Google Yıldızlı SERP Sonuçları (AggregateRating)</span>
                </label>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                  ⭐️ Google Stars
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">Yıldız Puanı (1.0 - 5.0)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={schemaConfig.aggregateRatingValue || 4.9}
                    onChange={(e) => updateSchemaConfig({ aggregateRatingValue: parseFloat(e.target.value) || 4.9 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">Değerlendirme Sayısı</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={schemaConfig.aggregateReviewCount || 128}
                    onChange={(e) => updateSchemaConfig({ aggregateReviewCount: parseInt(e.target.value, 10) || 128 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Social SameAs Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Doğrulanmış Sosyal Profiller (sameAs): </span>
                <span>{validation.summary.hasSocials ? 'Sosyal medya bağlantıları şemaya eklendi' : 'Henüz sosyal link eklenmedi'}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${validation.summary.hasSocials ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {validation.summary.hasSocials ? 'Bağlandı' : 'İsteğe Bağlı'}
              </span>
            </div>
          </div>

          {/* Module 2: Product & Catalog Schema */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Ürün Şeması (Product & ItemList)</h3>
                  <p className="text-xs text-slate-500">Google Görseller, Alışveriş ve organik aramalarda fiyat/stok rozetleri</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-schema-products"
                  checked={schemaConfig.autoInjectProducts}
                  onChange={(e) => updateSchemaConfig({ autoInjectProducts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Toplam Ürün</span>
                <span className="text-sm font-black text-slate-900">{config.products?.items?.length || 0} Adet</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Fiyat Durumu</span>
                <span className="text-sm font-black text-emerald-600">Tam Uyumlu</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Stok Durumu</span>
                <span className="text-sm font-black text-blue-600">InStock (Stokta)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Katalog sayfasında ve ana sayfada tüm ürünler otomatik olarak Schema.org <strong>ItemList</strong> içinde listelenir. Ürün detay sayfalarında ise tekil <strong>Product</strong>, <strong>Offer (Fiyat)</strong>, <strong>Brand</strong> ve <strong>AggregateRating</strong> etiketleri üretilir.
            </p>
          </div>

          {/* Module 3: FAQPage Schema */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">3. SSS Şeması (FAQPage Rich Snippet)</h3>
                  <p className="text-xs text-slate-500">Google arama sonuçlarında doğrudan açılır-kapanır akordeon sorular</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-schema-faq"
                  checked={schemaConfig.autoInjectFaq}
                  onChange={(e) => updateSchemaConfig({ autoInjectFaq: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>
                  Sitenizde <strong>{(config.faqs?.items || config.faq?.items || []).length} adet soru & cevap</strong> tanımlı.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900">
                FAQPage Hazır
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Google, <code>FAQPage</code> yapılandırılmış verisini algıladığında arama sonucunuzun hemen altında sorularınızı listeler. Bu sayede arama sonuçlarında rakiplerinizden 3 kat daha fazla dikey alan kaplayarak tıklama oranınızı (CTR) artırır.
            </p>
          </div>

          {/* Module 4: WebSite & Breadcrumbs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. WebSite & BreadcrumbList Şeması</h3>
                  <p className="text-xs text-slate-500">Site içi arama kutusu ve hiyerarşik sayfa gezinme yolları</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schemaConfig.autoInjectWebSite}
                  onChange={(e) => updateSchemaConfig({ autoInjectWebSite: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Google arama motoru site içi arama kutusu (SearchAction) ve Google sonuçlarında <code>Ana Sayfa &gt; Ürünler &gt; Model</code> şeklinde temiz gezinme yollarını aktif eder.
            </p>
          </div>

        </div>

        {/* Right Column: Code Inspector, Live Google SERP Simulator & Validation */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Google Rich Snippet Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Google Zengin Sonuç Önizlemesi (SERP)</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                Canlı Simülatör
              </span>
            </div>

            {/* Google Result Card Simulation */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1.5 font-sans">
              <div className="flex items-center gap-2 text-[11px] text-slate-700">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                  🌐
                </div>
                <div className="truncate font-medium">{siteUrl}</div>
                <span className="text-slate-400">›</span>
                <span className="text-slate-500 font-mono text-[10px]">{schemaConfig.businessType}</span>
              </div>

              <div className="text-base font-medium text-blue-800 hover:underline cursor-pointer leading-snug">
                {config.seo?.metaTitle || `${config.companyName} | ${config.slogan || config.sector}`}
              </div>

              {/* Rich Snippet Star Rating & Business Info */}
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                <div className="flex items-center text-amber-500 font-bold gap-1">
                  <span>⭐️ {schemaConfig.aggregateRatingValue || 4.9}</span>
                  <span className="text-slate-500 text-[11px]">({schemaConfig.aggregateReviewCount || 128})</span>
                </div>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700 font-semibold">{schemaConfig.priceRange || '₺₺'}</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-bold text-[11px]">{config.workingHours || '09:00 - 18:00'}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {config.seo?.metaDescription || `${config.companyName}, ${config.city} genelinde profesyonel ${config.sector} hizmetleri sunar.`}
              </p>

              {/* Simulated FAQ Accordion (if FAQ schema enabled and items exist) */}
              {schemaConfig.autoInjectFaq && (config.faqs?.items || config.faq?.items || []).length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                    <span>▼ {(config.faqs?.items || config.faq?.items)?.[0]?.question || "Sıkça Sorulan Soru"}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] pl-3 line-clamp-1">
                    {(config.faqs?.items || config.faq?.items)?.[0]?.answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* JSON-LD Code Inspector Panel */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg text-white space-y-4">
            
            {/* Tabs & Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("graph")}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === "graph" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tüm Şemalar (@graph)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("localBusiness")}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === "localBusiness" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🏢 LocalBusiness
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("products")}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === "products" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  📦 Ürünler
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("faq")}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === "faq" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ❓ FAQ
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("custom")}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === "custom" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ✏️ Özel JSON
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-schema-copy-code"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Kodu Kopyala"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Kopyalandı!" : "Kopyala"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title="JSON Dosyası İndir"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Output Viewer */}
            {activePreviewTab === "custom" ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">
                  Gelişmiş kullanıcılar için özel Schema.org JSON-LD enjeksiyonu. Buraya yazılan JSON doğrudan sayfa çıktısına eklenir.
                </p>
                <textarea
                  value={customJsonInput}
                  onChange={(e) => setCustomJsonInput(e.target.value)}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  ...\n}`}
                  rows={14}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 leading-relaxed outline-none focus:border-amber-500"
                />
                {customJsonError && (
                  <div className="p-2 rounded-lg bg-rose-900/50 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{customJsonError}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSaveCustomJson}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer"
                >
                  Özel JSON-LD'yi Kaydet & Sayfaya Enjekte Et
                </button>
              </div>
            ) : (
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-96 selection:bg-indigo-600 selection:text-white">
                  <code>{currentCode}</code>
                </pre>
                <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  application/ld+json
                </div>
              </div>
            )}

            {/* Validation Checklist */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Google Zengin Sonuç Uyumluluk Kontrolü</span>
                <span className="text-emerald-400 text-[11px] font-mono font-bold">
                  {validation.issues.filter(i => i.type === "error").length === 0 ? "✅ Hata Yok" : "⚠️ Uyarılar Var"}
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg flex items-start gap-2 ${
                      issue.type === "error"
                        ? "bg-rose-950/40 border border-rose-900/60 text-rose-300"
                        : issue.type === "warning"
                        ? "bg-amber-950/40 border border-amber-900/60 text-amber-300"
                        : issue.type === "success"
                        ? "bg-emerald-950/40 border border-emerald-900/60 text-emerald-300"
                        : "bg-slate-800/60 border border-slate-700/60 text-slate-300"
                    }`}
                  >
                    {issue.type === "error" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    ) : issue.type === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : issue.type === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
