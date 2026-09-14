import React, { useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Download,
  RefreshCw,
  Eye,
  Star,
  Search,
  Navigation,
  Check,
  Code2,
  Calendar,
  Layers,
  HelpCircle,
  Share2,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  SlidersHorizontal
} from "lucide-react";
import { SiteConfig, JsonLdSchemaConfig } from "../../types";
import {
  SCHEMA_BUSINESS_TYPES,
  getEffectiveSchemaConfig,
  generateLocalBusinessSchema,
  mapSectorToSchemaType,
  lookupCityCoordinates,
  normalizeTurkishPhone,
  parseWorkingHoursToSchemaOrg,
  parseAddressComponents,
  resolveSiteBaseUrl
} from "../../utils/schemaOrgGenerator";

interface LocalSeoSchemaGeneratorProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenGeneralSettings?: () => void;
  onOpenAllSchemas?: () => void;
  onOpenSeoTab?: () => void;
}

const DAYS_OF_WEEK = [
  { key: "Monday", label: "Pazartesi", short: "Pzt" },
  { key: "Tuesday", label: "Salı", short: "Sal" },
  { key: "Wednesday", label: "Çarşamba", short: "Çar" },
  { key: "Thursday", label: "Perşembe", short: "Per" },
  { key: "Friday", label: "Cuma", short: "Cum" },
  { key: "Saturday", label: "Cumartesi", short: "Cmt" },
  { key: "Sunday", label: "Pazar", short: "Paz" }
];

export const LocalSeoSchemaGenerator: React.FC<LocalSeoSchemaGeneratorProps> = ({
  config,
  onChange,
  onPreview,
  onOpenGeneralSettings,
  onOpenAllSchemas,
  onOpenSeoTab
}) => {
  const schemaConfig = useMemo(() => getEffectiveSchemaConfig(config), [config]);
  const siteUrl = useMemo(() => resolveSiteBaseUrl(config), [config]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "hoursTable" | "code">("visual");

  // Two-way sync with general site config
  const [twoWaySync, setTwoWaySync] = useState(true);

  // Normalizations from active site configuration
  const phoneInfo = useMemo(() => normalizeTurkishPhone(config.phone), [config.phone]);
  const addressInfo = useMemo(
    () => parseAddressComponents(config.address, config.city),
    [config.address, config.city]
  );
  const parsedHoursInfo = useMemo(
    () => parseWorkingHoursToSchemaOrg(config.workingHours),
    [config.workingHours]
  );

  // Generate the real-time LocalBusiness JSON-LD object
  const localBusinessJson = useMemo(() => {
    return generateLocalBusinessSchema(config);
  }, [config]);

  const jsonLdString = useMemo(() => {
    return JSON.stringify(localBusinessJson, null, 2);
  }, [localBusinessJson]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to update schema config
  const updateSchema = (patch: Partial<JsonLdSchemaConfig>, syncGeneral?: Partial<SiteConfig>) => {
    const updated: SiteConfig = {
      ...config,
      ...syncGeneral,
      seo: {
        ...config.seo,
        schemaConfig: {
          ...schemaConfig,
          ...patch
        }
      }
    };
    onChange(updated);
  };

  // 1-Click: Auto-populate and sync everything from site configuration
  const handleAutoPopulateFromSite = () => {
    const autoType = mapSectorToSchemaType(config.sector);
    const cityCoords = lookupCityCoordinates(config.city);
    const parsedHours = parseWorkingHoursToSchemaOrg(config.workingHours);

    const patch: Partial<JsonLdSchemaConfig> = {
      businessType: autoType,
      autoInjectLocalBusiness: true,
      streetAddress: config.address || "Merkez",
      addressLocality: addressInfo.addressLocality,
      addressRegion: addressInfo.addressRegion,
      postalCode: addressInfo.postalCode,
      telephone: phoneInfo.e164 || config.phone,
      openingHoursRaw: config.workingHours || "09:00 - 18:00",
      openingHoursSchedule: parsedHours.specifications.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        opens: s.opens,
        closes: s.closes,
        closed: false
      })),
      areaServed: config.city ? `${config.city} ve Çevresi` : "Türkiye",
      syncWithSiteConfig: true
    };

    if (cityCoords) {
      patch.latitude = cityCoords.lat;
      patch.longitude = cityCoords.lng;
    }

    updateSchema(patch);
    showToast("İşletme adresi, telefon ve çalışma saatleri site yapılandırmasından başarıyla çekildi!");
  };

  // 1-Click: Auto-geocode city coordinates
  const handleGeocodeCity = () => {
    const coords = lookupCityCoordinates(config.city);
    if (coords) {
      updateSchema({
        latitude: coords.lat,
        longitude: coords.lng
      });
      showToast(`"${config.city}" için harita koordinatları (${coords.lat}, ${coords.lng}) otomatik tanımlandı.`);
    } else {
      showToast(`"${config.city || 'Şehir'}" için otomatik koordinat bulunamadı, lütfen manuel giriniz.`);
    }
  };

  // Quick preset handlers for working hours
  const applyHoursPreset = (label: string, text: string) => {
    const syncGeneral = twoWaySync ? { workingHours: text } : undefined;
    const parsed = parseWorkingHoursToSchemaOrg(text);
    
    updateSchema(
      {
        openingHoursRaw: text,
        openingHoursSchedule: parsed.specifications.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          opens: s.opens,
          closes: s.closes,
          closed: false
        }))
      },
      syncGeneral
    );
    showToast(`Çalışma saati şablonu uygulandı: ${label}`);
  };

  // Copy JSON-LD to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonLdString);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      showToast("LocalBusiness JSON-LD şeması panoya kopyalandı!");
    } catch {
      showToast("Kopyalama başarısız oldu.");
    }
  };

  // Download JSON file
  const handleDownload = () => {
    const blob = new Blob([jsonLdString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localbusiness-schema-${(config.companyName || "business").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("LocalBusiness JSON dosyası indirildi!");
  };

  // Calculate if business is currently open
  const isCurrentlyOpen = useMemo(() => {
    const now = new Date();
    const currentDayIdx = now.getDay(); // 0: Sunday, 1: Monday...
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    if (parsedHoursInfo.is24x7) return { open: true, text: "7/24 Açık" };

    const dayNameMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNameMap[currentDayIdx];

    const todaySpec = parsedHoursInfo.specifications.find((s) => s.dayOfWeek.includes(todayName));
    if (!todaySpec) return { open: false, text: "Bugün Kapalı" };

    const [openH, openM] = todaySpec.opens.split(":").map(Number);
    const [closeH, closeM] = todaySpec.closes.split(":").map(Number);

    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    if (currentTimeMinutes >= openMinutes && currentTimeMinutes <= closeMinutes) {
      return { open: true, text: `Şu Anda Açık ⋅ Kapanış: ${todaySpec.closes}` };
    }
    return { open: false, text: `Şu Anda Kapalı ⋅ Açılış: ${todaySpec.opens}` };
  }, [parsedHoursInfo]);

  // Validation score & checklist
  const validationItems = useMemo(() => {
    return [
      {
        label: "@type (Yerel İşletme Tipi)",
        valid: Boolean(schemaConfig.businessType),
        value: schemaConfig.businessType || "LocalBusiness",
        tip: "Google Haritalar işletme kategorisi"
      },
      {
        label: "İşletme Adresi (PostalAddress)",
        valid: Boolean(config.address && config.city),
        value: config.address ? `${config.address}, ${config.city}` : "Eksik",
        tip: "Sokak, ilçe ve şehir zorunludur"
      },
      {
        label: "Telefon Numarası (Telephone)",
        valid: Boolean(config.phone && phoneInfo.isValid),
        value: phoneInfo.e164 || config.phone || "Eksik",
        tip: "Google Tıklanabilir Arama (E.164) formatı"
      },
      {
        label: "Çalışma Saatleri (OpeningHours)",
        valid: Boolean(config.workingHours),
        value: config.workingHours || "Eksik",
        tip: "Açık/kapalı rozeti ve saat aralıkları"
      },
      {
        label: "Harita Koordinatları (GeoCoordinates)",
        valid: Boolean(schemaConfig.latitude && schemaConfig.longitude),
        value: schemaConfig.latitude && schemaConfig.longitude ? `${schemaConfig.latitude}, ${schemaConfig.longitude}` : "Otomatik çözülebilir",
        tip: "Google Yerel 3'lü Paket harita pini"
      },
      {
        label: "Google Haritalar Bağlantısı (hasMap)",
        valid: Boolean(config.googleMapsEmbed),
        value: config.googleMapsEmbed ? "Mevcut" : "Otomatik üretilir",
        tip: "Doğrudan navigasyon linki"
      }
    ];
  }, [config, schemaConfig, phoneInfo]);

  const validCount = validationItems.filter((i) => i.valid).length;
  const completenessPercentage = Math.round((validCount / validationItems.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in" id="local-seo-schema-generator-panel">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Local 3-Pack & Harita Yapılandırılmış Veri Motoru</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Yerel SEO Şema Oluşturucu</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono font-medium">
                LocalBusiness
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Şirketinizin <strong>adresi</strong>, <strong>telefonu</strong> ve <strong>çalışma saatlerini</strong> site yapılandırmasından otomatik çekerek Google'ın resmi <code className="text-amber-300 font-mono text-xs">LocalBusiness</code> JSON-LD yapılandırılmış verisini üretir ve tüm sayfalara (<code className="text-blue-300 font-mono text-xs">&lt;head&gt;</code>) gömer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="btn-auto-populate-schema"
              onClick={handleAutoPopulateFromSite}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Site Bilgilerinden Otomatik Doldur</span>
            </button>

            {onPreview && (
              <button
                type="button"
                id="btn-preview-schema"
                onClick={onPreview}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Canlı Sitede Gör</span>
              </button>
            )}

            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Google Testi</span>
            </a>
          </div>
        </div>

        {/* Real-time Status Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs font-medium">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
              completenessPercentage >= 85 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              %{completenessPercentage}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Yerel SEO Uyumluluk</div>
              <div className="font-bold text-white text-xs">{completenessPercentage === 100 ? 'Eksiksiz & Yayında' : 'Geliştirilebilir'}</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Adres & Şehir</div>
              <div className="font-bold text-white text-xs truncate">
                {config.city ? `${config.city} (${addressInfo.postalCode})` : 'Belirtilmemiş'}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Google Tıklanabilir Telefon</div>
              <div className="font-mono font-bold text-white text-xs truncate">
                {phoneInfo.formatted || config.phone || 'Girilmemiş'}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Çalışma Durumu</div>
              <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCurrentlyOpen.open ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{isCurrentlyOpen.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Synchronized Site Data Alert Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-blue-950 flex items-center gap-2">
              <span>Canlı Site Yapılandırması ile Otomatik Eşitleniyor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-blue-800 leading-relaxed">
              İşletme adı (<strong className="text-slate-900">{config.companyName}</strong>), telefon (<strong className="text-slate-900">{config.phone || 'Yok'}</strong>), adres (<strong className="text-slate-900">{config.address || 'Yok'}, {config.city || ''}</strong>) ve çalışma saatleri (<strong className="text-slate-900">{config.workingHours || 'Yok'}</strong>) otomatik olarak Schema.org standartlarına dönüştürüldü.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-blue-900 cursor-pointer">
            <input
              type="checkbox"
              id="toggle-two-way-sync"
              checked={twoWaySync}
              onChange={(e) => setTwoWaySync(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Çift Yönlü Eşitle</span>
          </label>

          {onOpenGeneralSettings && (
            <button
              type="button"
              onClick={onOpenGeneralSettings}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/60 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Genel Ayarları Aç</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Editor Controls (7 cols) + Right Live Preview & Code Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls & Customizations */}
        <div className="lg:col-span-7 space-y-6">

          {/* Master Injection Switch for LocalBusiness */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${schemaConfig.autoInjectLocalBusiness ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <h2 className="text-sm font-bold text-slate-900">LocalBusiness Şemasını Sayfaya Otomatik Göm</h2>
              </div>
              <p className="text-xs text-slate-500">
                Açık olduğunda tüm statik sayfalara ve Google Bot tarayıcılarına <code className="text-blue-600 font-mono text-[11px]">&lt;script type="application/ld+json"&gt;</code> olarak eklenir.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                id="toggle-localbusiness-inject"
                checked={schemaConfig.autoInjectLocalBusiness}
                onChange={(e) => {
                  updateSchema({ autoInjectLocalBusiness: e.target.checked });
                  showToast(e.target.checked ? "LocalBusiness şema enjeksiyonu açıldı." : "LocalBusiness şema enjeksiyonu kapatıldı.");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Module 1: Business Identification & Category */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. İşletme Kimliği & Faaliyet Türü (@type)</h3>
                  <p className="text-xs text-slate-500">Google Haritalar ve arama sonuçlarında doğru kategorilendirme</p>
                </div>
              </div>

              <button
                type="button"
                id="btn-auto-detect-sector"
                onClick={() => {
                  const detected = mapSectorToSchemaType(config.sector);
                  updateSchema({ businessType: detected });
                  showToast(`"${config.sector}" sektörü için Schema.org tipi "${detected}" olarak ayarlandı.`);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sektörden Algıla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Schema.org Yerel İşletme Tipi (@type)
                </label>
                <select
                  id="select-local-business-type"
                  value={schemaConfig.businessType || "LocalBusiness"}
                  onChange={(e) => updateSchema({ businessType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {SCHEMA_BUSINESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — [{t.category}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Örn: Oto kurtarma işletmeleri için <strong>AutoRepair</strong>, klinikler için <strong>MedicalClinic</strong> seçilmelidir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şirket Resmi Adı (name)</label>
                <input
                  type="text"
                  id="input-schema-company-name"
                  value={config.companyName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (twoWaySync) {
                      onChange({ ...config, companyName: val });
                    }
                  }}
                  placeholder="Firma Adı"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat Segmenti (priceRange)</label>
                <select
                  value={schemaConfig.priceRange || "₺₺"}
                  onChange={(e) => updateSchema({ priceRange: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="₺">₺ (Ekonomik / Uygun)</option>
                  <option value="₺₺">₺₺ (Orta Segment / Standart)</option>
                  <option value="₺₺₺">₺₺₺ (Üst Segment / Premium)</option>
                  <option value="₺₺₺₺">₺₺₺₺ (VIP / Lüks)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Module 2: Address & GeoCoordinates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Adres & Coğrafi Konum (PostalAddress & Geo)</h3>
                  <p className="text-xs text-slate-500">Google Haritalar Yerel 3'lü Paket ve yol tarifi eşlemesi</p>
                </div>
              </div>

              <button
                type="button"
                id="btn-geocode-city"
                onClick={handleGeocodeCity}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Şehre Göre Koordinat Çöz</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Açık Adres (streetAddress)
                </label>
                <textarea
                  id="input-schema-address"
                  rows={2}
                  value={config.address || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sync = twoWaySync ? { address: val } : undefined;
                    updateSchema({ streetAddress: val }, sync);
                  }}
                  placeholder="Örn: Barbaros Bulvarı No: 124/A Beşiktaş"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Şehir (İl)</label>
                  <input
                    type="text"
                    id="input-schema-city"
                    value={config.city || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const sync = twoWaySync ? { city: val } : undefined;
                      updateSchema({ addressRegion: val, addressLocality: val }, sync);
                    }}
                    placeholder="İstanbul"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Posta Kodu (postalCode)</label>
                  <input
                    type="text"
                    value={schemaConfig.postalCode || addressInfo.postalCode}
                    onChange={(e) => updateSchema({ postalCode: e.target.value })}
                    placeholder="34349"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ülke Kodu</label>
                  <input
                    type="text"
                    disabled
                    value="TR (Türkiye)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Harita Koordinatları (GeoCoordinates)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Google Harita Pini</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">Enlem (latitude)</span>
                    <input
                      type="text"
                      placeholder="Örn: 41.0082"
                      value={schemaConfig.latitude || ""}
                      onChange={(e) => updateSchema({ latitude: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">Boylam (longitude)</span>
                    <input
                      type="text"
                      placeholder="Örn: 28.9784"
                      value={schemaConfig.longitude || ""}
                      onChange={(e) => updateSchema({ longitude: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Area Served */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hizmet Verilen Bölge (areaServed)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schemaConfig.areaServed || (config.city ? `${config.city} ve Çevresi` : "Tüm Türkiye")}
                    onChange={(e) => updateSchema({ areaServed: e.target.value })}
                    placeholder="Örn: Kadıköy, Ataşehir, Üsküdar veya Tüm İstanbul"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateSchema({ areaServed: config.city ? `${config.city} ve Çevresi` : "Tüm Türkiye" })}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Şehri Ata
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Module 3: Phone & ContactPoint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">3. Telefon & İletişim (Telephone & ContactPoint)</h3>
                  <p className="text-xs text-slate-500">Google Mobil arama sonuçlarında doğrudan "Ara" butonunu tetikler</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono flex items-center gap-1 ${
                phoneInfo.isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {phoneInfo.isValid ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                <span>{phoneInfo.isValid ? 'E.164 Standartına Uygun' : 'Telefon Formatı Eksik'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefon Numarası (telephone)
                </label>
                <input
                  type="text"
                  id="input-schema-phone"
                  value={config.phone || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sync = twoWaySync ? { phone: val } : undefined;
                    updateSchema({ telephone: val }, sync);
                  }}
                  placeholder="0532 123 45 67 veya 0212 555 12 34"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google E.164 Uluslararası Çıktısı
                </label>
                <input
                  type="text"
                  disabled
                  value={phoneInfo.e164 || "Formatlanamadı"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-emerald-700 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-Posta Adresi (email)
                </label>
                <input
                  type="email"
                  value={config.email || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (twoWaySync) onChange({ ...config, email: val });
                  }}
                  placeholder="info@firma.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Module 4: Opening Hours (WorkingHours & OpeningHoursSpecification) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Çalışma Saatleri (OpeningHoursSpecification)</h3>
                  <p className="text-xs text-slate-500">Google Bilgi Panelinde "Şimdi Açık / Kapalı" durumu için ISO 8601 saatleri</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("visual")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "visual" ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Metin & Şablon
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("hoursTable")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "hoursTable" ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Günlük Tablo
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Hızlı Çalışma Saati Şablonları (Tek Tıkla Uygula)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  id="btn-preset-hours-247"
                  onClick={() => applyHoursPreset("7/24 Kesintisiz", "7/24 Kesintisiz Hizmet")}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="truncate">7/24 Kesintisiz</span>
                </button>

                <button
                  type="button"
                  id="btn-preset-hours-weekday"
                  onClick={() => applyHoursPreset("Hafta İçi Standart", "Hafta içi: 09:00 - 18:00")}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="truncate">Pzt-Cum 09-18</span>
                </button>

                <button
                  type="button"
                  id="btn-preset-hours-saturday"
                  onClick={() => applyHoursPreset("Hafta İçi + Cmt", "Pazartesi - Cuma: 08:30 - 18:30, Cumartesi: 09:00 - 14:00")}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="truncate">Pzt-Cum + Cmt</span>
                </button>

                <button
                  type="button"
                  id="btn-preset-hours-allweek"
                  onClick={() => applyHoursPreset("7 Gün Açık", "Haftanın 7 Günü: 08:00 - 22:00")}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="truncate">7 Gün 08-22</span>
                </button>
              </div>
            </div>

            {/* Visual Text View */}
            {activeTab === "visual" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Çalışma Saati Metni (workingHours)
                  </label>
                  <input
                    type="text"
                    id="input-schema-working-hours"
                    value={config.workingHours || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const sync = twoWaySync ? { workingHours: val } : undefined;
                      const parsed = parseWorkingHoursToSchemaOrg(val);
                      updateSchema(
                        {
                          openingHoursRaw: val,
                          openingHoursSchedule: parsed.specifications.map((s) => ({
                            dayOfWeek: s.dayOfWeek,
                            opens: s.opens,
                            closes: s.closes,
                            closed: false
                          }))
                        },
                        sync
                      );
                    }}
                    placeholder="Örn: Hafta içi: 09:00 - 18:00, Cumartesi: 09:00 - 14:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bu metin otomatik analiz edilir ve Schema.org <code>OpeningHoursSpecification</code> nesnelerine ayrıştırılır.
                  </p>
                </div>

                {/* Parsed Schema Output Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Otomatik Algılanan Schema.org Saat Nesneleri:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parsedHoursInfo.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 font-mono flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="font-bold text-blue-600">
                          {spec.dayOfWeek.length === 7
                            ? "Her Gün"
                            : spec.dayOfWeek.length === 5
                            ? "Pzt-Cum"
                            : spec.dayOfWeek.map((d) => d.substring(0, 3)).join(", ")}
                          :
                        </span>
                        <span>{spec.opens} – {spec.closes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Day-by-Day Table */}
            {activeTab === "hoursTable" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                  {DAYS_OF_WEEK.map((day) => {
                    const existingSchedule = schemaConfig.openingHoursSchedule?.find((s) =>
                      s.dayOfWeek.includes(day.key)
                    );
                    const isClosed = existingSchedule?.closed ?? (day.key === "Sunday" && !config.workingHours?.includes("7"));
                    const opens = existingSchedule?.opens || "09:00";
                    const closes = existingSchedule?.closes || "18:00";

                    return (
                      <div key={day.key} className="p-2.5 bg-white flex items-center justify-between gap-3">
                        <div className="w-24 font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{day.label}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isClosed}
                              onChange={(e) => {
                                const newClosed = e.target.checked;
                                const current = schemaConfig.openingHoursSchedule || [];
                                const other = current.filter((s) => !s.dayOfWeek.includes(day.key));
                                const updatedSchedule = [
                                  ...other,
                                  {
                                    dayOfWeek: [day.key],
                                    opens,
                                    closes,
                                    closed: newClosed
                                  }
                                ];
                                updateSchema({ openingHoursSchedule: updatedSchedule });
                              }}
                              className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span className={isClosed ? 'text-rose-600 font-bold' : ''}>Kapalı</span>
                          </label>

                          {!isClosed && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={opens}
                                onChange={(e) => {
                                  const newOpens = e.target.value;
                                  const current = schemaConfig.openingHoursSchedule || [];
                                  const other = current.filter((s) => !s.dayOfWeek.includes(day.key));
                                  updateSchema({
                                    openingHoursSchedule: [
                                      ...other,
                                      { dayOfWeek: [day.key], opens: newOpens, closes, closed: false }
                                    ]
                                  });
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs text-slate-800 outline-none"
                              />
                              <span className="text-slate-400">–</span>
                              <input
                                type="time"
                                value={closes}
                                onChange={(e) => {
                                  const newCloses = e.target.value;
                                  const current = schemaConfig.openingHoursSchedule || [];
                                  const other = current.filter((s) => !s.dayOfWeek.includes(day.key));
                                  updateSchema({
                                    openingHoursSchedule: [
                                      ...other,
                                      { dayOfWeek: [day.key], opens, closes: newCloses, closed: false }
                                    ]
                                  });
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs text-slate-800 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Google Search & Local 3-Pack Live Preview + JSON-LD Inspector */}
        <div className="lg:col-span-5 space-y-6">

          {/* Card A: Google SERP & Local 3-Pack Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Google Haritalar & SERP Canlı Simülatörü
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Canlı Önizleme
              </span>
            </div>

            {/* Google Result Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 font-sans shadow-xs">
              {/* Site URL & Breadcrumb */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                  G
                </div>
                <span className="truncate">{siteUrl}</span>
                <span className="text-slate-400">› yerel-isletme</span>
              </div>

              {/* Title & SERP Link */}
              <div className="text-base font-bold text-blue-800 hover:underline cursor-pointer leading-snug">
                {config.companyName || "Firma Adı"} — {config.city || "İstanbul"} {config.sector || "Hizmetleri"}
              </div>

              {/* Star Rating snippet */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-900">
                  {schemaConfig.aggregateRatingValue || 4.9}
                </span>
                <span className="text-slate-500">
                  ({schemaConfig.aggregateReviewCount || 68} Google yorumu)
                </span>
              </div>

              {/* Business meta info */}
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-bold">
                    {schemaConfig.businessType || "LocalBusiness"}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{schemaConfig.priceRange || "₺₺"}</span>
                  <span>·</span>
                  <span className="truncate">{config.sector || "Yerel Hizmet"}</span>
                </div>

                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="truncate">
                    {config.address || "Adres bilgisi eklenmedi"}, {config.city || "Şehir"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className={`font-bold ${isCurrentlyOpen.open ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isCurrentlyOpen.text}
                  </span>
                  <span className="text-slate-400">({config.workingHours || "09:00 - 18:00"})</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-mono font-medium">
                    {phoneInfo.formatted || config.phone || "Telefon belirtilmedi"}
                  </span>
                </div>
              </div>

              {/* SERP Action buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                <div className="py-1.5 rounded-lg bg-blue-600 text-white text-center text-[11px] font-bold flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>Ara</span>
                </div>
                <div className="py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-center text-[11px] font-bold flex items-center justify-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-600" />
                  <span>Yol Tarifi</span>
                </div>
                <div className="py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-center text-[11px] font-bold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-slate-600" />
                  <span>Web Sitesi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: JSON-LD Code Inspector */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  LocalBusiness JSON-LD Kaynak Kodu
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-copy-schema-code"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Kopyalandı" : "Kopyala"}</span>
                </button>

                <button
                  type="button"
                  id="btn-download-schema-code"
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 text-blue-300 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto overflow-x-auto border border-slate-800/80 selection:bg-blue-600 selection:text-white">
                <code>{jsonLdString}</code>
              </pre>
            </div>

            {/* Quality Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Google Yerel SEO Kontrol Listesi
              </div>
              <div className="space-y-1.5 text-xs">
                {validationItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-300"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.valid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                      <span className="font-medium truncate">{item.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation to All Schemas */}
            {onOpenAllSchemas && (
              <button
                type="button"
                onClick={onOpenAllSchemas}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700/80 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Tüm Şemaları Yönet (Product, FAQ & WebSite)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
