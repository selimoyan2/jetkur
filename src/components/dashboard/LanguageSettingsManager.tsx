import React, { useState } from "react";
import {
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Languages,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  HelpCircle,
  Package,
  Wrench,
  Navigation,
  Info,
  Check,
  ChevronDown
} from "lucide-react";
import { SiteConfig, MultiLanguageConfig, LanguageDefinition, SiteTranslations } from "../../types";
import { DEFAULT_LANGUAGES, getEffectiveLanguageConfig, UI_TRANSLATIONS } from "../../utils/languageUtils";

interface LanguageSettingsManagerProps {
  config: SiteConfig;
  updateConfig?: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onChange?: (updated: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const LanguageSettingsManager: React.FC<LanguageSettingsManagerProps> = ({
  config,
  updateConfig,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  const currentLangConfig = getEffectiveLanguageConfig(config);

  const applyConfigUpdate = (updater: (prev: SiteConfig) => SiteConfig) => {
    if (updateConfig) {
      updateConfig(updater);
    } else if (onChange) {
      onChange(updater(config));
    }
  };

  const [activeTab, setActiveTab] = useState<"general" | "editor" | "switcher">("general");
  const [selectedEditorLang, setSelectedEditorLang] = useState<string>("en");
  const [editorSubSection, setEditorSubSection] = useState<"hero" | "nav" | "services" | "products" | "faqs">("hero");

  // Translation loading states
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const activeLanguagesList = currentLangConfig.activeLanguages || DEFAULT_LANGUAGES;
  const currentTranslations = currentLangConfig.translations || {};

  // Helpers to mutate language config
  const updateLangConfig = (patch: Partial<MultiLanguageConfig>) => {
    applyConfigUpdate((prev) => {
      const existing = getEffectiveLanguageConfig(prev);
      return {
        ...prev,
        languages: {
          ...existing,
          ...patch
        }
      };
    });
  };

  const toggleLanguageEnabled = (code: string) => {
    if (code === currentLangConfig.defaultLanguage) {
      setStatusMessage({ type: "error", text: "Varsayılan sistem dilini kapatamazsınız." });
      return;
    }

    const updated = activeLanguagesList.map((lang) => {
      if (lang.code === code) {
        return { ...lang, enabled: !lang.enabled };
      }
      return lang;
    });

    updateLangConfig({ activeLanguages: updated });
    setStatusMessage({
      type: "success",
      text: `${code.toUpperCase()} dili durumu güncellendi.`
    });
  };

  const setDefaultLanguage = (code: string) => {
    const updated = activeLanguagesList.map((lang) => ({
      ...lang,
      isDefault: lang.code === code,
      enabled: lang.code === code ? true : lang.enabled
    }));

    updateLangConfig({
      defaultLanguage: code,
      activeLanguages: updated
    });

    setStatusMessage({
      type: "success",
      text: `Varsayılan web sitesi dili ${code.toUpperCase()} olarak ayarlandı.`
    });
  };

  // Translation update handler for a specific language
  const handleUpdateTranslation = (langCode: string, field: keyof SiteTranslations, value: any) => {
    applyConfigUpdate((prev) => {
      const existing = getEffectiveLanguageConfig(prev);
      const targetTrans = { ...(existing.translations[langCode] || {}) };
      targetTrans[field] = value;

      return {
        ...prev,
        languages: {
          ...existing,
          translations: {
            ...existing.translations,
            [langCode]: targetTrans
          }
        }
      };
    });
  };

  const handleUpdateItemTranslation = (
    langCode: string,
    collection: "services" | "products" | "faqs",
    itemId: string,
    field: string,
    value: string
  ) => {
    applyConfigUpdate((prev) => {
      const existing = getEffectiveLanguageConfig(prev);
      const targetTrans = { ...(existing.translations[langCode] || {}) };
      const subMap = { ...(targetTrans[collection] || {}) } as any;

      subMap[itemId] = {
        ...(subMap[itemId] || {}),
        [field]: value
      };

      (targetTrans as any)[collection] = subMap;

      return {
        ...prev,
        languages: {
          ...existing,
          translations: {
            ...existing.translations,
            [langCode]: targetTrans
          }
        }
      };
    });
  };

  // AI Translation Action
  const triggerAiTranslation = async (targetLangCode: string) => {
    const targetLangDef = activeLanguagesList.find((l) => l.code === targetLangCode);
    if (!targetLangDef) return;

    setIsTranslating(true);
    setTranslatingLang(targetLangCode);
    setStatusMessage({
      type: "info",
      text: `${targetLangDef.name} (${targetLangDef.flag}) için akıllı içerik çevirisi hazırlanıyor...`
    });

    try {
      // Build full payload from existing site config
      const payload = {
        companyName: config.companyName || "",
        slogan: config.slogan || "",
        sector: config.sector || "",
        aboutTitle: config.aboutTitle || `Hakkımızda - ${config.companyName}`,
        aboutContent: config.aboutContent || "",
        heroBadge: config.heroBadge || "Profesyonel Hizmet",
        heroTitle: config.heroTitle || config.companyName,
        heroSubtitle: config.heroSubtitle || config.slogan,
        heroCtaPrimary: config.heroCtaPrimary || "Teklif Al",
        heroCtaSecondary: config.heroCtaSecondary || "İletişim",
        servicesTitle: config.servicesTitle || "Hizmetlerimiz",
        servicesSubtitle: config.servicesSubtitle || "Size özel çözümler",
        productsTitle: config.productsTitle || "Ürünlerimiz",
        productsSubtitle: config.productsSubtitle || "Öne çıkan ürünler",
        faqsTitle: config.faqsTitle || "Sıkça Sorulan Sorular",
        faqsSubtitle: config.faqsSubtitle || "Aklınıza takılan sorular",
        contactTitle: config.contactTitle || "İletişime Geçin",
        contactSubtitle: config.contactSubtitle || "7/24 Hizmetinizdeyiz",
        navHome: "Ana Sayfa",
        navAbout: "Kurumsal",
        navServices: "Hizmetler",
        navCatalog: "Ürünler",
        navGallery: "Galeri",
        navBlog: "Blog",
        navContact: "İletişim",
        phoneBtn: "Hemen Ara",
        whatsappBtn: "WhatsApp",
        quoteBtn: "Fiyat Teklifi Al",
        services: (config.services?.items || []).map((s) => ({
          id: s.id,
          title: s.title,
          desc: s.desc
        })),
        products: (config.products?.items || []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          badge: p.badge
        })),
        faqs: (config.faqs?.items || config.faq?.items || []).map((f) => ({
          id: f.id,
          q: f.q || f.question || "",
          a: f.a || f.answer || ""
        }))
      };

      const response = await fetch("/api/translate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLang: targetLangCode,
          targetLangName: targetLangDef.name,
          payload
        })
      });

      const resData = await response.json();
      if (resData && resData.data) {
        const translatedData = resData.data;

        // Apply translated data to translations state
        applyConfigUpdate((prev) => {
          const existing = getEffectiveLanguageConfig(prev);
          const mergedTrans = {
            ...(existing.translations[targetLangCode] || {}),
            ...translatedData,
            ui: UI_TRANSLATIONS[targetLangCode] || UI_TRANSLATIONS.en
          };

          return {
            ...prev,
            languages: {
              ...existing,
              translations: {
                ...existing.translations,
                [targetLangCode]: mergedTrans
              }
            }
          };
        });

        setStatusMessage({
          type: "success",
          text: `🎉 ${targetLangDef.name} (${targetLangDef.flag}) çevirisi başarıyla tamamlandı ve yayına hazırlandı!`
        });
      } else {
        throw new Error(resData.error || "Çeviri verisi alınamadı");
      }
    } catch (err: any) {
      console.error("Çeviri hatası:", err);
      setStatusMessage({
        type: "error",
        text: `Çeviri sırasında bir sorun oluştu: ${err.message || "Bilinmeyen hata"}`
      });
    } finally {
      setIsTranslating(false);
      setTranslatingLang(null);
    }
  };

  // Batch translate all enabled non-default languages
  const translateAllLanguages = async () => {
    const targets = activeLanguagesList.filter(
      (l) => l.enabled && l.code !== currentLangConfig.defaultLanguage
    );

    if (targets.length === 0) {
      setStatusMessage({ type: "error", text: "Aktif çevrilebilecek ek bir dil bulunamadı." });
      return;
    }

    setIsTranslating(true);
    setStatusMessage({
      type: "info",
      text: `Toplu çeviri başlatıldı: ${targets.map((t) => t.name).join(", ")} çevriliyor...`
    });

    for (const target of targets) {
      await triggerAiTranslation(target.code);
    }

    setIsTranslating(false);
    setStatusMessage({
      type: "success",
      text: "Tüm aktif diller başarıyla çevrildi ve senkronize edildi!"
    });
  };

  // Selected language translation data
  const selectedTrans = currentTranslations[selectedEditorLang] || {};
  const selectedLangObj = activeLanguagesList.find((l) => l.code === selectedEditorLang) || DEFAULT_LANGUAGES[1];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Dil Ayarları & Çoklu Dil (i18n)</h2>
                {currentLangConfig.enabled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sitede Aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    Pasif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Web sitenizi tek tıkla İngilizce (EN), Almanca (DE) ve Arapça (AR) dillerine çevirin. 
                Sağdan sola (RTL) okuma ve site-geneli dil değiştiriciyi yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={translateAllLanguages}
              disabled={isTranslating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isTranslating ? "animate-spin" : ""}`} />
              <span>{isTranslating ? "Çevriliyor..." : "Tüm Dilleri Otomatik Çevir"}</span>
            </button>

            {/* Master Toggle */}
            <button
              type="button"
              onClick={() => updateLangConfig({ enabled: !currentLangConfig.enabled })}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                currentLangConfig.enabled
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {currentLangConfig.enabled ? "Çoklu Dili Kapat" : "Çoklu Dili Aç"}
            </button>

            {/* Live Preview Button */}
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Sitedeki dil değiştiriciyi ve çevirileri canlı önizlemede görün"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Canlı Önizle</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : statusMessage.type === "error"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-5 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>1. Desteklenen Diller & Yapılandırma</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("switcher")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "switcher"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Dil Değiştirici Buton Görünümü</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "editor"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Manuel Çeviri & Metin Düzenleyici</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SUPPORTED LANGUAGES */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Active Languages Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Aktif Dil Seçenekleri</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sitenizde ziyaretçilere sunulacak dilleri açıp kapatabilir, tek tıkla otomatik çeviri yapabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {activeLanguagesList.map((lang) => {
                const isDefault = lang.code === currentLangConfig.defaultLanguage;
                const hasTranslation = Boolean(currentTranslations[lang.code]?.slogan || currentTranslations[lang.code]?.aboutTitle);
                const isArabic = lang.code === "ar";

                return (
                  <div
                    key={lang.code}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      lang.enabled
                        ? "bg-slate-50/50 border-slate-200 shadow-xs"
                        : "bg-slate-50/20 border-slate-100 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shadow-xs rounded-full">{lang.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{lang.name}</span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                                {lang.code}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{lang.nativeName}</span>
                          </div>
                        </div>

                        {isDefault ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Varsayılan
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleLanguageEnabled(lang.code)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              lang.enabled
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            {lang.enabled ? "Aktif" : "Pasif"}
                          </button>
                        )}
                      </div>

                      {/* Details & Specs */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Yazım Yönü:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {lang.direction === "rtl" ? "Sağdan Sola (RTL 🇸🇦)" : "Soldan Sağa (LTR)"}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Çeviri Durumu:</span>
                        {isDefault ? (
                          <span className="font-bold text-slate-700">Orijinal İçerik</span>
                        ) : hasTranslation ? (
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Hazır
                          </span>
                        ) : (
                          <span className="font-bold text-amber-600">Bekliyor</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    {!isDefault && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerAiTranslation(lang.code)}
                          disabled={isTranslating}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{translatingLang === lang.code ? "Çevriliyor..." : "AI ile Çevir"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEditorLang(lang.code);
                            setActiveTab("editor");
                          }}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          Düzenle
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Settings: Default Language & RTL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Varsayılan Ziyaretçi Dili</h3>
              <p className="text-xs text-slate-500">
                Site ilk açıldığında veya tarayıcı dili eşleşmediğinde gösterilecek temel dil.
              </p>

              <div className="space-y-2 pt-2">
                {activeLanguagesList.filter((l) => l.enabled).map((lang) => (
                  <label
                    key={lang.code}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      currentLangConfig.defaultLanguage === lang.code
                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs">{lang.name} ({lang.nativeName})</span>
                    </div>
                    <input
                      type="radio"
                      name="defaultLang"
                      checked={currentLangConfig.defaultLanguage === lang.code}
                      onChange={() => setDefaultLanguage(lang.code)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Akıllı Tarayıcı & RTL Ayarları</h3>
              <p className="text-xs text-slate-500">
                Uluslararası ziyaretçilerin deneyimini artıran modern i18n özellikleri.
              </p>

              <div className="space-y-3 pt-2">
                {/* Auto detect */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLangConfig.autoDetectBrowserLanguage}
                    onChange={(e) => updateLangConfig({ autoDetectBrowserLanguage: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Ziyaretçinin Tarayıcı Dilini Otomatik Algıla
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Almanya'dan veya İngiltere'den giren ziyaretçilere siteniz otomatik olarak kendi dillerinde açılır.
                    </span>
                  </div>
                </label>

                {/* RTL for Arabic */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLangConfig.enableRtlForArabic}
                    onChange={(e) => updateLangConfig({ enableRtlForArabic: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Arapça İçin Sağdan Sola Düzen (RTL Desteği)
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                      Arapça seçildiğinde metinler ve menü yerleşimi otomatik olarak sağdan sola hizalanır.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWITCHER APPEARANCE */}
      {activeTab === "switcher" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dil Değiştirici (Language Switcher) Tasarımı</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sitenizde ziyaretçilerin diller arasında geçiş yapmasını sağlayan butonun stil ve yerleşimini belirleyin.
              </p>
            </div>

            {/* Position */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Yerleşim Konumu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "header-right", title: "Header Sağ Köşe", desc: "Üst menüde sağda" },
                  { id: "header-nav", title: "Menü İçinde", desc: "Nav linklerinin yanında" },
                  { id: "floating-bottom", title: "Yüzen Buton (Sağ Alt)", desc: "Sayfada sabit durur" },
                  { id: "both", title: "Hem Header Hem Yüzen", desc: "Maksimum erişilebilirlik" }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => updateLangConfig({ switcherPosition: pos.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      currentLangConfig.switcherPosition === pos.id
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">{pos.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{pos.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Görsel Buton Stili</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "dropdown", title: "Açılır Menü (Dropdown)", desc: "🇹🇷 Türkçe ▾", preview: "dropdown" },
                  { id: "pills", title: "Yan Yana Butonlar (Pills)", desc: "TR | EN | DE | AR", preview: "pills" },
                  { id: "flags-only", title: "Sadece Bayraklar", desc: "🇹🇷 🇬🇧 🇩🇪 🇸🇦", preview: "flags" },
                  { id: "compact-select", title: "Kompakt Mini Seçici", desc: "TR ▾", preview: "compact" }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateLangConfig({ switcherStyle: st.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      currentLangConfig.switcherStyle === st.id
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">{st.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">Canlı Görsel Önizleme</span>
              <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
                    LOGO
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{config.companyName || "Örnek Firma"}</span>
                    <span className="text-[10px] text-slate-400">Header Navigasyon Önizleme</span>
                  </div>
                </div>

                {/* Simulated Switcher */}
                <div className="bg-slate-800/80 backdrop-blur-md p-2 rounded-xl border border-slate-700 flex items-center gap-2">
                  {currentLangConfig.switcherStyle === "dropdown" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-xs font-semibold cursor-pointer">
                      <span>🇹🇷</span>
                      <span>Türkçe</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}

                  {currentLangConfig.switcherStyle === "pills" && (
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <span className="px-2 py-1 rounded bg-indigo-600 text-white">TR</span>
                      <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">EN</span>
                      <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">DE</span>
                      <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">AR</span>
                    </div>
                  )}

                  {currentLangConfig.switcherStyle === "flags-only" && (
                    <div className="flex items-center gap-2 text-base">
                      <span className="cursor-pointer ring-2 ring-indigo-500 rounded-full">🇹🇷</span>
                      <span className="cursor-pointer opacity-70 hover:opacity-100">🇬🇧</span>
                      <span className="cursor-pointer opacity-70 hover:opacity-100">🇩🇪</span>
                      <span className="cursor-pointer opacity-70 hover:opacity-100">🇸🇦</span>
                    </div>
                  )}

                  {currentLangConfig.switcherStyle === "compact-select" && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 text-xs font-mono font-bold">
                      <span>TR</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSLATION EDITOR (MANUAL & GRANULAR) */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Language Selector Strip */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Düzenlenen Dil:</span>
              <div className="flex items-center gap-1.5">
                {activeLanguagesList
                  .filter((l) => l.code !== currentLangConfig.defaultLanguage)
                  .map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedEditorLang(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedEditorLang === lang.code
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => triggerAiTranslation(selectedEditorLang)}
              disabled={isTranslating}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTranslating ? "Çevriliyor..." : `Bu Dili AI ile Yeniden Çevir (${selectedLangObj.flag})`}</span>
            </button>
          </div>

          {/* Sub-section Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: "hero", title: "Temel & Hero Bölümü", icon: FileText },
              { id: "nav", title: "Menü & Butonlar", icon: Navigation },
              { id: "services", title: "Hizmetler", icon: Wrench },
              { id: "products", title: "Ürünler & Katalog", icon: Package },
              { id: "faqs", title: "Sıkça Sorulanlar (SSS)", icon: HelpCircle }
            ].map((sec) => {
              const IconComp = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setEditorSubSection(sec.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    editorSubSection === sec.id
                      ? "bg-slate-900 text-amber-400 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-section Content Editors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* 1. HERO & BASIC INFO */}
            {editorSubSection === "hero" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Temel Bilgiler & Hero Çevirisi</h4>
                  <p className="text-xs text-slate-500">
                    Orijinal Türkçe içerik sol tarafta referans olarak gösterilir; sağ taraftaki kutuya çeviriyi girebilirsiniz.
                  </p>
                </div>

                {/* Slogan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Orijinal Slogan (Türkçe)</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      {config.slogan || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <span>{selectedLangObj.flag} Slogan Çevirisi</span>
                    </label>
                    <input
                      type="text"
                      value={selectedTrans.slogan || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "slogan", e.target.value)}
                      placeholder={`${selectedLangObj.name} slogan...`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Hero Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Orijinal Hero Başlığı</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      {config.heroTitle || config.companyName || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">
                      {selectedLangObj.flag} Hero Başlığı ({selectedLangObj.name})
                    </label>
                    <input
                      type="text"
                      value={selectedTrans.heroTitle || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "heroTitle", e.target.value)}
                      placeholder="Hero Title..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Hero Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Orijinal Hero Açıklaması</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      {config.heroSubtitle || config.slogan || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">
                      {selectedLangObj.flag} Hero Açıklaması ({selectedLangObj.name})
                    </label>
                    <textarea
                      rows={2}
                      value={selectedTrans.heroSubtitle || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "heroSubtitle", e.target.value)}
                      placeholder="Hero Subtitle..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* About Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Orijinal Hakkımızda Metni</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-h-32 overflow-y-auto">
                      {config.aboutContent || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">
                      {selectedLangObj.flag} Hakkımızda Metni ({selectedLangObj.name})
                    </label>
                    <textarea
                      rows={3}
                      value={selectedTrans.aboutContent || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "aboutContent", e.target.value)}
                      placeholder="About text..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">1. Aksiyon Butonu ({selectedLangObj.name})</label>
                    <input
                      type="text"
                      value={selectedTrans.heroCtaPrimary || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "heroCtaPrimary", e.target.value)}
                      placeholder="Get Quote..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-900">2. Aksiyon Butonu ({selectedLangObj.name})</label>
                    <input
                      type="text"
                      value={selectedTrans.heroCtaSecondary || ""}
                      onChange={(e) => handleUpdateTranslation(selectedEditorLang, "heroCtaSecondary", e.target.value)}
                      placeholder="Contact Us..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. NAVIGATION & BUTTONS */}
            {editorSubSection === "nav" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Menü & Hızlı Buton Etiketleri</h4>
                  <p className="text-xs text-slate-500">
                    Üst bar ve menü linklerinin {selectedLangObj.name} karşılıkları.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {[
                    { key: "navHome", label: "Ana Sayfa", defaultEn: "Home" },
                    { key: "navAbout", label: "Kurumsal / Hakkımızda", defaultEn: "About Us" },
                    { key: "navServices", label: "Hizmetlerimiz", defaultEn: "Services" },
                    { key: "navCatalog", label: "Ürünler / Katalog", defaultEn: "Products" },
                    { key: "navGallery", label: "Fotoğraf Galerisi", defaultEn: "Gallery" },
                    { key: "navBlog", label: "Blog & Makaleler", defaultEn: "Blog" },
                    { key: "navContact", label: "İletişim", defaultEn: "Contact" },
                    { key: "phoneBtn", label: "Hemen Ara Butonu", defaultEn: "Call Now" },
                    { key: "quoteBtn", label: "Teklif Al Butonu", defaultEn: "Get Quote" }
                  ].map((item) => (
                    <div key={item.key} className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({item.defaultEn})</span>
                      </label>
                      <input
                        type="text"
                        value={(selectedTrans as any)[item.key] || ""}
                        onChange={(e) => handleUpdateTranslation(selectedEditorLang, item.key as any, e.target.value)}
                        placeholder={`${item.label} (${selectedLangObj.name})`}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SERVICES TRANSLATIONS */}
            {editorSubSection === "services" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Hizmet Sayfaları & Başlıkları</h4>
                  <p className="text-xs text-slate-500">
                    Her hizmetin başlık ve açıklaması {selectedLangObj.name} diline çevrilir.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {(config.services?.items || []).map((service) => {
                    const transService = selectedTrans.services?.[service.id] || { title: "", desc: "" };

                    return (
                      <div key={service.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{service.title}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {service.id}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Hizmet Başlığı ({selectedLangObj.name})
                            </label>
                            <input
                              type="text"
                              value={transService.title}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "services", service.id, "title", e.target.value)
                              }
                              placeholder="Translated Service Title..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Hizmet Açıklaması ({selectedLangObj.name})
                            </label>
                            <input
                              type="text"
                              value={transService.desc}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "services", service.id, "desc", e.target.value)
                              }
                              placeholder="Translated Service Description..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. PRODUCTS TRANSLATIONS */}
            {editorSubSection === "products" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ürünler & Katalog Çevirisi</h4>
                  <p className="text-xs text-slate-500">
                    Katalogtaki ürün isimleri ve açıklamaları.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {(config.products?.items || []).map((prod) => {
                    const transProd = selectedTrans.products?.[prod.id] || { title: "", description: "", badge: "" };

                    return (
                      <div key={prod.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{prod.title}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">₺{prod.price}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Ürün Adı ({selectedLangObj.name})
                            </label>
                            <input
                              type="text"
                              value={transProd.title}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "products", prod.id, "title", e.target.value)
                              }
                              placeholder="Translated Product Title..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Açıklama ({selectedLangObj.name})
                            </label>
                            <input
                              type="text"
                              value={transProd.description}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "products", prod.id, "description", e.target.value)
                              }
                              placeholder="Translated Description..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. FAQS TRANSLATIONS */}
            {editorSubSection === "faqs" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sıkça Sorulan Sorular (SSS) Çevirisi</h4>
                  <p className="text-xs text-slate-500">
                    Soru ve cevapların {selectedLangObj.name} karşılıkları.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {(config.faqs?.items || config.faq?.items || []).map((faq) => {
                    const transFaq = selectedTrans.faqs?.[faq.id] || { q: "", a: "" };

                    return (
                      <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{faq.q || faq.question}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Soru ({selectedLangObj.name})
                            </label>
                            <input
                              type="text"
                              value={transFaq.q}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "faqs", faq.id, "q", e.target.value)
                              }
                              placeholder="Translated Question..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-indigo-950">
                              {selectedLangObj.flag} Cevap ({selectedLangObj.name})
                            </label>
                            <textarea
                              rows={2}
                              value={transFaq.a}
                              onChange={(e) =>
                                handleUpdateItemTranslation(selectedEditorLang, "faqs", faq.id, "a", e.target.value)
                              }
                              placeholder="Translated Answer..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
