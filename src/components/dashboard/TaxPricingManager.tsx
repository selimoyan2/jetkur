import React, { useState, useMemo } from "react";
import {
  Receipt,
  Percent,
  Calculator,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Store,
  Layers,
  Search,
  ExternalLink,
  Info,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Tag
} from "lucide-react";
import { SiteConfig, TaxPricingConfig, ProductItem, CustomerPanelTab } from "../../types";
import {
  getEffectiveTaxConfig,
  STANDARD_VAT_RATES,
  calculateTaxDetails,
  calculateProductTax,
  parsePriceNumber,
  formatPriceNumber,
  bulkConvertProductPrices
} from "../../utils/taxUtils";

interface TaxPricingManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  onPreview?: () => void;
}

export const TaxPricingManager: React.FC<TaxPricingManagerProps> = ({
  config,
  onChange,
  onNavigateTab,
  onPreview
}) => {
  const taxConfig = useMemo(() => getEffectiveTaxConfig(config), [config]);
  const products = useMemo(() => config.products?.items || [], [config.products?.items]);

  // Bulk action confirmation modal state
  const [bulkActionType, setBulkActionType] = useState<"add_vat" | "remove_vat" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search and filter for product list
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Live Calculator Simulator State
  const [calcInputPrice, setCalcInputPrice] = useState("1500");
  const [calcVatRate, setCalcVatRate] = useState<number>(taxConfig.defaultVatRate);
  const [calcIncludesVat, setCalcIncludesVat] = useState<boolean>(taxConfig.priceIncludesVat);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Update Tax Config Helper
  const updateTaxConfig = (updates: Partial<TaxPricingConfig>) => {
    const updated = {
      ...taxConfig,
      ...updates
    };
    onChange({
      ...config,
      taxPricing: updated
    });
  };

  // Update a single product's tax or price
  const updateProductItem = (id: string, updates: Partial<ProductItem>) => {
    if (!config.products) return;
    const newItems = (config.products.items || []).map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });

    onChange({
      ...config,
      products: {
        ...config.products,
        items: newItems
      }
    });
  };

  // Perform Bulk Recalculation
  const handleBulkConvert = (action: "add_vat" | "remove_vat") => {
    if (products.length === 0) return;
    
    const updatedProducts = bulkConvertProductPrices(
      products,
      action,
      taxConfig.defaultVatRate,
      taxConfig.currencySymbol || "₺",
      taxConfig.currencyPosition || "suffix"
    );

    // Also update priceIncludesVat mode
    const newIncludesVat = action === "add_vat" ? true : false;

    onChange({
      ...config,
      taxPricing: {
        ...taxConfig,
        priceIncludesVat: newIncludesVat
      },
      products: {
        ...config.products,
        items: updatedProducts
      }
    });

    setBulkActionType(null);
    showToast(
      action === "add_vat"
        ? `Tüm ürün fiyatlarına %${taxConfig.defaultVatRate} KDV eklendi ve fiyatlar güncellendi!`
        : `Tüm ürün fiyatlarından %${taxConfig.defaultVatRate} KDV ayrıştırıldı ve matrah fiyatlarına dönüştürüldü!`
    );
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Categories for filter
  const productCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Live calculator result
  const calcResult = useMemo(() => {
    return calculateTaxDetails(
      calcInputPrice,
      calcVatRate,
      calcIncludesVat,
      taxConfig.currencySymbol || "₺",
      taxConfig.currencyPosition || "suffix"
    );
  }, [calcInputPrice, calcVatRate, calcIncludesVat, taxConfig.currencySymbol, taxConfig.currencyPosition]);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-emerald-400 border border-emerald-500/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-xs font-bold border border-amber-500/20 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                Fiyatlandırma & Vergi Altyapısı
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {taxConfig.priceIncludesVat ? "KDV Dahil Mod" : "KDV Hariç (+KDV) Mod"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vergi & Fiyatlandırma Yönetimi (KDV)
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Ürün ve hizmet fiyatlarınıza KDV ekleyin, fiyatların <strong>KDV Dahil</strong> veya{" "}
              <strong>KDV Hariç</strong> olarak sunulmasını yönetin, sitedeki vergi rozetlerini ve matrah
              dökümlerini tek tıkla yapılandırın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("catalog")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Tag className="w-4 h-4 text-slate-500" />
                <span>Ürün Kataloğu ({products.length})</span>
              </button>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Sitede Gör</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Varsayılan KDV Oranı
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">%{taxConfig.defaultVatRate}</span>
              <span className="text-[11px] text-slate-500 font-medium">Genel</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Fiyatlandırma Türü
            </span>
            <span className={`text-sm font-black ${taxConfig.priceIncludesVat ? "text-emerald-700" : "text-amber-700"}`}>
              {taxConfig.priceIncludesVat ? "KDV Dahil (Net)" : "KDV Hariç (+KDV)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Katalogdaki Ürünler
            </span>
            <span className="text-xl font-black text-slate-900">{products.length} adet</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sitede Vergi Rozeti
            </span>
            <span className={`text-sm font-black ${taxConfig.displayVatBadge ? "text-emerald-700" : "text-slate-400"}`}>
              {taxConfig.displayVatBadge ? "Aktif (Görünüyor)" : "Gizli"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Decision: KDV Dahil vs KDV Hariç Selection */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              1. Fiyat Gösterim Modu (KDV Dahil mi, KDV Hariç mi?)
            </h2>
          </div>
          <p className="text-slate-500 text-xs">
            Web sitenizde ve ürün kataloğunuzda müşterilere gösterilecek fiyat politikasını seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: KDV Dahil */}
          <div
            onClick={() => updateTaxConfig({ priceIncludesVat: true })}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
              taxConfig.priceIncludesVat
                ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {taxConfig.priceIncludesVat && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Seçili Mod
              </span>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    taxConfig.priceIncludesVat ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Fiyatlar KDV Dahildir
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Perakende & B2C için Tavsiye Edilen
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Ürünlerinize girdiğiniz fiyat son tüketici satış fiyatıdır. Müşteri ek bir vergi sürpriziyle
                karşılaşmaz. Sistem matrahı ve KDV tutarını faturalandırma için otomatik ayırır.
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Örnek Ürün Fiyatı:</span>
                  <strong className="text-slate-800">1.200 ₺</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ayrıştırılan Matrah:</span>
                  <span className="text-slate-700 font-mono">1.000 ₺</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Hesaplanan KDV (%20):</span>
                  <span className="text-slate-700 font-mono">200 ₺</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                  <span className="text-slate-900">Müşteriye Gösterilen:</span>
                  <span className="text-emerald-700 font-mono">1.200 ₺ (KDV Dahil)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Müşteri Güveni: Yüksek</span>
              <span className="text-emerald-700 font-bold">✓ Net Fiyat Politikası</span>
            </div>
          </div>

          {/* Option B: KDV Hariç */}
          <div
            onClick={() => updateTaxConfig({ priceIncludesVat: false })}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
              !taxConfig.priceIncludesVat
                ? "border-amber-500 bg-amber-50/40 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {!taxConfig.priceIncludesVat && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Seçili Mod
              </span>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    !taxConfig.priceIncludesVat ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Fiyatlar KDV Hariçtir (+KDV Ekle)
                  </h3>
                  <span className="text-xs text-amber-800 font-semibold">
                    Kurumsal, B2B & Toptan Satış için
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Belirlediğiniz fiyatlar net matrah tutarıdır. Sitede fiyatın üzerine seçtiğiniz KDV oranı
                (örn: %20) eklenerek toplam tutar hesaplanır ve müşteriye &quot;+ %20 KDV&quot; bilgisiyle sunulur.
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Girilen Matrah Fiyat:</span>
                  <strong className="text-slate-800">1.000 ₺</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Eklenecek KDV (%20):</span>
                  <span className="text-amber-800 font-mono">+ 200 ₺</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                  <span className="text-slate-900">Toplam Ödenecek:</span>
                  <span className="text-amber-800 font-mono">1.200 ₺ (+KDV Dahil)</span>
                </div>
                <div className="text-[10px] text-slate-400 italic pt-1">
                  Sitede &quot;1.000 ₺ + %20 KDV&quot; şeklinde şeffafça vurgulanır.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Kurumsal Uyumluluk: Mükemmel</span>
              <span className="text-amber-800 font-bold">✓ B2B Matrah Modu</span>
            </div>
          </div>
        </div>
      </div>

      {/* VAT Rates Selector & Display Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: VAT Rates (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                2. Varsayılan KDV Oranı (Türkiye Mevzuatı)
              </h2>
            </div>
            <p className="text-slate-500 text-xs">
              İşletmenizin faaliyet alanına uygun standart KDV oranını belirleyin. Dilerseniz ürün bazında farklı
              oranlar da tanımlayabilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STANDARD_VAT_RATES.map((item) => {
              const isSelected = taxConfig.defaultVatRate === item.rate;
              return (
                <button
                  key={item.rate}
                  type="button"
                  onClick={() => updateTaxConfig({ defaultVatRate: item.rate })}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900 text-white border-amber-500 shadow-md"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base font-black tracking-tight font-mono">
                        %{item.rate}
                      </span>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-bold mb-1">{item.label}</div>
                    <div
                      className={`text-[11px] leading-relaxed ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom VAT input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">Özel KDV Oranı Tanımla</span>
              <p className="text-[11px] text-slate-500">
                Yukarıdaki oranlar dışında özel bir orana sahipseniz yüzde olarak girin.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">%</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={taxConfig.defaultVatRate}
                onChange={(e) => updateTaxConfig({ defaultVatRate: Number(e.target.value) || 0 })}
                className="w-20 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Display Settings & Badges (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  3. Sitede Gösterim & Rozet Ayarları
                </h2>
              </div>
              <p className="text-slate-500 text-xs">
                Müşterilerinizin sitede göreceği etiket ve detayları özelleştirin.
              </p>
            </div>

            {/* Toggle 1: Display VAT Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    KDV Rozeti Göster
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Fiyatların yanında &quot;(KDV Dahil)&quot; veya &quot;(+KDV)&quot; rozeti gösterilir.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxConfig.displayVatBadge}
                    onChange={(e) => updateTaxConfig({ displayVatBadge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {taxConfig.displayVatBadge && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Canlı Önizleme:</span>
                  {taxConfig.priceIncludesVat ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      %{taxConfig.defaultVatRate} KDV Dahil
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                      +%{taxConfig.defaultVatRate} KDV Hariç
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Toggle 2: Display Tax Breakdown in Product Detail */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Ürün Sayfasında Matrah & KDV Dökümü
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Detay sayfasında net tutar, KDV tutarı ve genel toplam şeffafça listelenir.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxConfig.displayTaxBreakdown}
                    onChange={(e) => updateTaxConfig({ displayTaxBreakdown: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Currency Symbol Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Para Birimi Sembolü</span>
                <span className="text-[11px] text-slate-500 block">Fiyat etiketindeki para simgesi</span>
              </div>
              <div className="flex items-center gap-1.5">
                {["₺", "$", "€", "£"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => updateTaxConfig({ currencySymbol: sym })}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                      (taxConfig.currencySymbol || "₺") === sym
                        ? "bg-slate-900 text-amber-400 shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* VAT Exempt / Invoice Notice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fatura ve KDV Bilgilendirme Notu
              </label>
              <textarea
                rows={2}
                value={taxConfig.vatExemptNotice || ""}
                onChange={(e) => updateTaxConfig({ vatExemptNotice: e.target.value })}
                placeholder="Örn: Fiyatlarımıza yasal KDV dahildir. Kurumsal ve bireysel e-fatura düzenlenmektedir."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live VAT Calculator & Simulator */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">
                  İnteraktif Canlı KDV Hesaplayıcı & Önizleme
                </h2>
              </div>
              <p className="text-slate-400 text-xs">
                Bir fiyat girin, KDV oranını ve modunu test edin. Sitede müşteriye tam olarak nasıl görüneceğini
                anında inceleyin.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700 self-start">
              Canlı Simülatör
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input Controls (6 Cols) */}
            <div className="lg:col-span-6 space-y-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Test Edilecek Taban Tutar:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={calcInputPrice}
                    onChange={(e) => setCalcInputPrice(e.target.value)}
                    placeholder="Örn: 1500"
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono font-black text-xl text-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {taxConfig.currencySymbol || "₺"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    KDV Oranı:
                  </label>
                  <select
                    value={calcVatRate}
                    onChange={(e) => setCalcVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-hidden"
                  >
                    <option value={20}>%20 (Standart)</option>
                    <option value={10}>%10 (İndirimli)</option>
                    <option value={1}>%1 (Temel)</option>
                    <option value={0}>%0 (Muaf)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Fiyatın Durumu:
                  </label>
                  <select
                    value={calcIncludesVat ? "true" : "false"}
                    onChange={(e) => setCalcIncludesVat(e.target.value === "true")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-hidden"
                  >
                    <option value="true">KDV Dahil Fiyat</option>
                    <option value="false">KDV Hariç Fiyat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Real-time Calculation Result Box (6 Cols) */}
            <div className="lg:col-span-6 space-y-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hesaplama Dökümü
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  {calcResult.badgeText}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>Net Tutar (Matrah):</span>
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {calcResult.formattedNet}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Hesaplanan KDV (%{calcResult.vatRate}):</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {calcResult.formattedVat}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="font-bold text-white text-sm">Nihai Satış Tutarı:</span>
                  <span className="font-mono font-black text-emerald-400 text-2xl">
                    {calcResult.formattedGross}
                  </span>
                </div>
              </div>

              {/* Public Website Preview Card */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  Sitede Ürün Kartı Görünümü:
                </span>
                <div className="bg-white text-slate-900 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold block">Örnek Ürün Başlığı</span>
                    <span className="text-[10px] text-slate-400">Katalog Vitrini</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-lg font-black text-slate-950 font-mono">
                        {taxConfig.priceIncludesVat ? calcResult.formattedGross : calcResult.formattedNet}
                      </span>
                    </div>
                    {taxConfig.displayVatBadge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          taxConfig.priceIncludesVat
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {calcResult.badgeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Conversion Tools: KDV Ekle / KDV Çıkar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                4. Akıllı Toplu Fiyat Dönüştürücü (KDV Ekle / Ayrıştır)
              </h2>
            </div>
            <p className="text-slate-500 text-xs">
              Mevcut ürünlerinizin fiyatlarına tek tıkla %{taxConfig.defaultVatRate} KDV ekleyin veya KDV dahil
              fiyatları matraha dönüştürün.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Add VAT to all prices */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                  +
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tüm Ürün Fiyatlarına KDV Ekle (+%{taxConfig.defaultVatRate})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Mevcut fiyatları matrah kabul eder ve KDV ekleyerek artırır
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Örneğin <strong>1.000 ₺</strong> olan bir ürünün fiyatı otomatik olarak{" "}
                <strong>1.200 ₺</strong> yapılır ve sistem &quot;KDV Dahil&quot; moduna geçirilir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBulkActionType("add_vat")}
              disabled={products.length === 0}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tüm Fiyatlara +%{taxConfig.defaultVatRate} KDV Ekle</span>
            </button>
          </div>

          {/* Action 2: Remove VAT from all prices */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                  ÷
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tüm Ürünlerden KDV&apos;yi Ayrıştır (/ 1.{taxConfig.defaultVatRate})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    KDV dahil fiyatları çıplak matraha indirir
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Örneğin <strong>1.200 ₺</strong> (KDV dahil) olan bir ürünün fiyatı{" "}
                <strong>1.000 ₺</strong> net tutara çekilir ve &quot;KDV Hariç&quot; moduna geçilir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBulkActionType("remove_vat")}
              disabled={products.length === 0}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tüm Fiyatlardan KDV&apos;yi Çıkar (Matraha Dönüştür)</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {bulkActionType && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {bulkActionType === "add_vat"
                    ? "Tüm Ürün Fiyatlarına KDV Eklensin mi?"
                    : "Tüm Ürün Fiyatlarından KDV Ayrıştırılsın mı?"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Katalogdaki <strong>{products.length} adet</strong> ürünün fiyatı %{taxConfig.defaultVatRate}{" "}
                  oranı baz alınarak yeniden hesaplanacaktır. Bu işlem geri alınamaz ancak istediğiniz zaman
                  yeniden dönüştürebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkActionType(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkConvert(bulkActionType)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-all shadow-md"
                >
                  Evet, Uygula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product-by-Product Tax & Pricing Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                5. Ürün Bazlı Vergi & Fiyat Tablosu ({products.length} Ürün)
              </h2>
            </div>
            <p className="text-slate-500 text-xs">
              Her ürünün KDV oranını veya KDV dahil/hariç durumunu bağımsız olarak özelleştirebilir, satıştaki
              nihai tutarı anında kontrol edebilirsiniz.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {productCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden"
              >
                <option value="all">Tüm Kategoriler</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <Tag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Aramanıza uygun ürün bulunamadı veya henüz ürün eklenmemiş.
            </p>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("catalog")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>Ürün Kataloğuna Git ve Ürün Ekle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Ürün & Kategori</th>
                  <th className="py-3 px-3">Tanımlı Fiyat</th>
                  <th className="py-3 px-3">KDV Oranı</th>
                  <th className="py-3 px-3">Fiyat Türü</th>
                  <th className="py-3 px-3">Net Matrah</th>
                  <th className="py-3 px-3">KDV Tutarı</th>
                  <th className="py-3 px-3 text-right">Nihai Satış Fiyatı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((prod) => {
                  const taxDetails = calculateProductTax(prod, taxConfig);
                  const displayImg =
                    prod.featuredImage || prod.image || (prod.images && prod.images[0]) || "";

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product title & image */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {displayImg ? (
                            <img
                              src={displayImg}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {prod.title}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {prod.category || "Genel"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Editable Price Input */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={prod.price}
                          onChange={(e) => updateProductItem(prod.id, { price: e.target.value })}
                          className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </td>

                      {/* VAT rate override */}
                      <td className="py-3 px-3">
                        <select
                          value={
                            prod.taxExempt
                              ? "exempt"
                              : prod.vatRate !== undefined && prod.vatRate !== null
                              ? String(prod.vatRate)
                              : "default"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "default") {
                              updateProductItem(prod.id, { vatRate: undefined, taxExempt: false });
                            } else if (val === "exempt") {
                              updateProductItem(prod.id, { taxExempt: true, vatRate: 0 });
                            } else {
                              updateProductItem(prod.id, { vatRate: Number(val), taxExempt: false });
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden"
                        >
                          <option value="default">Varsayılan (%{taxConfig.defaultVatRate})</option>
                          <option value="20">%20 Genel</option>
                          <option value="10">%10 İndirimli</option>
                          <option value="1">%1 Temel</option>
                          <option value="0">%0 Sıfır KDV</option>
                          <option value="exempt">KDV Muaf</option>
                        </select>
                      </td>

                      {/* Price includes VAT toggle */}
                      <td className="py-3 px-3">
                        <select
                          value={
                            prod.priceIncludesVat !== undefined
                              ? prod.priceIncludesVat
                                ? "true"
                                : "false"
                              : "default"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "default") {
                              updateProductItem(prod.id, { priceIncludesVat: undefined });
                            } else {
                              updateProductItem(prod.id, { priceIncludesVat: val === "true" });
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden"
                        >
                          <option value="default">
                            {taxConfig.priceIncludesVat ? "Genel (KDV Dahil)" : "Genel (KDV Hariç)"}
                          </option>
                          <option value="true">KDV Dahil</option>
                          <option value="false">KDV Hariç (+KDV)</option>
                        </select>
                      </td>

                      {/* Calculated Net (Matrah) */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {taxDetails.formattedNet}
                      </td>

                      {/* Calculated VAT amount */}
                      <td className="py-3 px-3 font-mono font-bold text-amber-600">
                        +{taxDetails.formattedVat}
                      </td>

                      {/* Final Gross Selling Price */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {taxDetails.formattedGross}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          {taxDetails.badgeText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
