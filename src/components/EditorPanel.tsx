import React, { useState } from "react";
import { SiteConfig, ServiceItem, FaqItem, ColorPalette } from "../types";
import { COLOR_PALETTES } from "../data/templates";
import {
  Sparkles,
  Building,
  Phone,
  Layers,
  HelpCircle,
  Palette,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Rocket,
  MessageCircle,
  RefreshCw
} from "lucide-react";

interface EditorPanelProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onOpenPreview: () => void;
  onOpenDeploy: () => void;
}

type EditorSubTab = "ai-wizard" | "general" | "hero" | "services" | "about" | "faqs" | "palette" | "seo";

export const EditorPanel: React.FC<EditorPanelProps> = ({
  config,
  onChange,
  onOpenPreview,
  onOpenDeploy,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<EditorSubTab>("ai-wizard");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCity, setAiCity] = useState(config.city || "İstanbul");
  const [aiNotes, setAiNotes] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");

  const updateConfig = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    setAiSuccessMessage("");

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: config.sector,
          companyName: config.companyName,
          city: aiCity,
          customNotes: aiNotes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;

        const newServices: ServiceItem[] = (d.services || []).map((s: any, i: number) => ({
          id: `ai-svc-${Date.now()}-${i}`,
          title: s.title,
          desc: s.desc,
          price: "Teklif Alın",
        }));

        const newFaqs: FaqItem[] = (d.faqs || []).map((f: any, i: number) => ({
          id: `ai-faq-${Date.now()}-${i}`,
          q: f.q,
          a: f.a,
        }));

        onChange({
          ...config,
          city: aiCity || config.city,
          slogan: d.slogan || config.slogan,
          hero: {
            ...config.hero,
            title: d.title || config.hero.title,
            subtitle: d.slogan || config.hero.subtitle,
            ctaPrimaryText: d.ctaText || config.hero.ctaPrimaryText,
          },
          about: {
            ...config.about,
            content: d.about || config.about.content,
          },
          services: {
            ...config.services,
            items: newServices.length > 0 ? newServices : config.services.items,
          },
          faqs: {
            ...config.faqs,
            items: newFaqs.length > 0 ? newFaqs : config.faqs.items,
          },
          seo: {
            ...config.seo,
            metaTitle: `${config.companyName} | ${d.slogan || config.slogan}`,
            metaDescription: d.metaDescription || config.seo.metaDescription,
          },
        });

        setAiSuccessMessage("✨ Yapay zeka tüm başlık, açıklama, hizmetler ve SEO metinlerini başarıyla oluşturdu ve panele yükledi!");
      }
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const addService = () => {
    const newItem: ServiceItem = {
      id: `svc-${Date.now()}`,
      title: "Yeni Hizmet Başlığı",
      desc: "Hizmetin detaylı açıklaması ve müşteri faydası.",
      price: "Fiyat Sorun",
    };
    updateConfig("services", {
      ...config.services,
      items: [...config.services.items, newItem],
    });
  };

  const removeService = (id: string) => {
    updateConfig("services", {
      ...config.services,
      items: config.services.items.filter((s) => s.id !== id),
    });
  };

  const updateService = (id: string, field: keyof ServiceItem, value: string) => {
    updateConfig("services", {
      ...config.services,
      items: config.services.items.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const addFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      q: "Yeni Sıkça Sorulan Soru?",
      a: "Açıklayıcı ve güven verici cevap metni.",
    };
    updateConfig("faqs", {
      ...config.faqs,
      items: [...config.faqs.items, newFaq],
    });
  };

  const removeFaq = (id: string) => {
    updateConfig("faqs", {
      ...config.faqs,
      items: config.faqs.items.filter((f) => f.id !== id),
    });
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: string) => {
    updateConfig("faqs", {
      ...config.faqs,
      items: config.faqs.items.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 font-mono text-xs font-bold">
              MÜŞTERİ PANELİ
            </span>
            <span className="text-xs text-slate-500 font-medium">Şablon ID: {config.templateId}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {config.companyName} - Web Sitesi Yönetim Paneli
          </h2>
          <p className="text-xs text-slate-500">
            Girdiğiniz tüm bilgiler anında sağdaki önizlemeye ve oluşturulacak statik HTML sayfasına işlenir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPreview}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Canlı Önizle</span>
          </button>

          <button
            onClick={onOpenDeploy}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-orange-500/20"
          >
            <Rocket className="w-4 h-4" />
            <span>Statik Yayınla</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("ai-wizard")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "ai-wizard"
              ? "bg-purple-700 text-white shadow-md shadow-purple-600/20"
              : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ AI İçerik & Metin Sihirbazı</span>
        </button>

        <button
          onClick={() => setActiveSubTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "general"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Genel & İletişim</span>
        </button>

        <button
          onClick={() => setActiveSubTab("hero")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "hero"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Karşılama (Hero)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("services")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "services"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hizmetler ({config.services.items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("about")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "about"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Hakkımızda</span>
        </button>

        <button
          onClick={() => setActiveSubTab("faqs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "faqs"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SSS ({config.faqs.items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("palette")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "palette"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Renk & Tema</span>
        </button>

        <button
          onClick={() => setActiveSubTab("seo")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "seo"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO & Schema</span>
        </button>
      </div>

      {/* Sub-Tab 1: AI Content Wizard */}
      {activeSubTab === "ai-wizard" && (
        <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900 rounded-2xl border border-purple-800 text-white p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yapay Zeka Destekli Otomatik İçerik & SEO Fabrikası</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Sadece Firma Adını ve Sektörü Girin, Tüm Web Sitesini AI Yazsın
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Müşteriniz ne yazacağını bilmiyorsa ya da siz yüzlerce hazır site üretiyorsanız, Gemini yapay zekası
              Türkçe SEO kurallarına uygun slogan, hakkımızda, hizmet açıklamaları, sık sorulan sorular ve Google Schema etiketlerini 5 saniyede otomatik üretir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-850/70 p-5 rounded-xl border border-purple-700/40">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">Firma Adı</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => updateConfig("companyName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-700/60 text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">Sektör / Faaliyet</label>
              <input
                type="text"
                value={config.sector}
                onChange={(e) => updateConfig("sector", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-700/60 text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">Şehir / Hizmet Bölgesi</label>
              <input
                type="text"
                value={aiCity}
                onChange={(e) => setAiCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-700/60 text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">Özel Vurgulamak İstediğiniz Detaylar (Opsiyonel)</label>
            <input
              type="text"
              placeholder="Örn: 7/24 nöbetçi servis, 10 yıllık tecrübe, ücretsiz keşif, asansörlü taşıma vb."
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-purple-700/60 text-white text-sm focus:border-amber-400 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={handleAiGenerate}
              disabled={isAiLoading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Web Sitesi İçeriklerini Üretiyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Yapay Zeka ile Tüm İçerikleri & SEO'yu Yeniden Üret</span>
                </>
              )}
            </button>
          </div>

          {aiSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: General & Contact */}
      {activeSubTab === "general" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">İşletme & İletişim Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Firma / İşletme Adı</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => updateConfig("companyName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sektör / Branş</label>
              <input
                type="text"
                value={config.sector}
                onChange={(e) => updateConfig("sector", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası (Doğrudan Aranır)</label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => updateConfig("phone", e.target.value)}
                placeholder="0532 000 00 00"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Numarası (Ülke Koduyla)</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => updateConfig("whatsapp", e.target.value)}
                placeholder="905320000000"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => updateConfig("email", e.target.value)}
                placeholder="info@sirket.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Çalışma Saatleri</label>
              <input
                type="text"
                value={config.workingHours}
                onChange={(e) => updateConfig("workingHours", e.target.value)}
                placeholder="7 Gün 24 Saat veya 08:30 - 19:00"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Hizmet Bölgesi / Şehir & Adres</label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => updateConfig("address", e.target.value)}
                placeholder="Örn: E-5 Karayolu Üzeri, Kadıköy / İstanbul"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Hero Section */}
      {activeSubTab === "hero" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">Ana Sayfa Karşılama (Hero) Alanı</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Üst Rozet / İlan Metni</label>
              <input
                type="text"
                value={config.hero.badge}
                onChange={(e) => updateConfig("hero", { ...config.hero, badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ana Başlık (H1)</label>
              <input
                type="text"
                value={config.hero.title}
                onChange={(e) => updateConfig("hero", { ...config.hero, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alt Açıklama Metni</label>
              <textarea
                rows={3}
                value={config.hero.subtitle}
                onChange={(e) => updateConfig("hero", { ...config.hero, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Buton Yazısı (Birincil Eylem)</label>
                <input
                  type="text"
                  value={config.hero.ctaPrimaryText}
                  onChange={(e) => updateConfig("hero", { ...config.hero, ctaPrimaryText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Buton Yazısı (WhatsApp / Bilgi)</label>
                <input
                  type="text"
                  value={config.hero.ctaSecondaryText}
                  onChange={(e) => updateConfig("hero", { ...config.hero, ctaSecondaryText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Arka Plan Görseli URL</label>
              <input
                type="text"
                value={config.hero.bgImage}
                onChange={(e) => updateConfig("hero", { ...config.hero, bgImage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Services */}
      {activeSubTab === "services" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hizmetler Listesi</h3>
              <p className="text-xs text-slate-500">Müşterilerinize sunduğunuz ana hizmet maddelerini düzenleyin.</p>
            </div>
            <button
              onClick={addService}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Hizmet Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.services.items.map((svc, idx) => (
              <div key={svc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <button
                    onClick={() => removeService(svc.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                    title="Hizmeti Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Hizmet Adı</label>
                  <input
                    type="text"
                    value={svc.title}
                    onChange={(e) => updateService(svc.id, "title", e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-sm font-semibold focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Açıklama</label>
                  <textarea
                    rows={2}
                    value={svc.desc}
                    onChange={(e) => updateService(svc.id, "desc", e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-xs focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Fiyat / Teklif Etiketi</label>
                  <input
                    type="text"
                    value={svc.price || ""}
                    onChange={(e) => updateService(svc.id, "price", e.target.value)}
                    placeholder="Örn: Uygun Fiyat veya m² 50 ₺"
                    className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-xs focus:border-slate-900 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: About */}
      {activeSubTab === "about" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">Kurumsal & Hakkımızda Bölümü</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bölüm Başlığı</label>
              <input
                type="text"
                value={config.about.title}
                onChange={(e) => updateConfig("about", { ...config.about, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hakkımızda Detay Metni</label>
              <textarea
                rows={5}
                value={config.about.content}
                onChange={(e) => updateConfig("about", { ...config.about, content: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deneyim (Yıl)</label>
                <input
                  type="text"
                  value={config.about.yearsExperience}
                  onChange={(e) => updateConfig("about", { ...config.about, yearsExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tamamlanan İş / Müşteri Sayısı</label>
                <input
                  type="text"
                  value={config.about.completedProjects}
                  onChange={(e) => updateConfig("about", { ...config.about, completedProjects: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Görsel URL</label>
              <input
                type="text"
                value={config.about.image}
                onChange={(e) => updateConfig("about", { ...config.about, image: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:border-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: FAQs */}
      {activeSubTab === "faqs" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sıkça Sorulan Sorular (SSS)</h3>
              <p className="text-xs text-slate-500">Müşterilerin güvenini artırmak ve Google SEO'da zengin sonuç almak için.</p>
            </div>
            <button
              onClick={addFaq}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Soru Ekle</span>
            </button>
          </div>

          <div className="space-y-4">
            {config.faqs.items.map((faq, idx) => (
              <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Soru #{idx + 1}</span>
                  <button
                    onClick={() => removeFaq(faq.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => updateFaq(faq.id, "q", e.target.value)}
                  placeholder="Soru metni..."
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-sm font-semibold focus:border-slate-900 outline-none"
                />
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) => updateFaq(faq.id, "a", e.target.value)}
                  placeholder="Cevap metni..."
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-xs focus:border-slate-900 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 7: Color Palette */}
      {activeSubTab === "palette" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tema & Renk Paleti</h3>
            <p className="text-xs text-slate-500">
              Sitenizolsun gibi tek tıkla şablonun tüm renk ahengini değiştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLOR_PALETTES.map((palette) => {
              const isSelected = config.palette.id === palette.id;
              return (
                <div
                  key={palette.id}
                  onClick={() => updateConfig("palette", palette)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-slate-900 ring-2 ring-slate-900/20 shadow-md bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.primary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }}></div>
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: palette.secondary }}></div>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{palette.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{palette.primary}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 8: SEO & Schema */}
      {activeSubTab === "seo" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Google Arama Motoru & Schema.org Yapılandırması</h3>
            <p className="text-xs text-slate-500">
              Google arama sonuçlarında ve AI botlarında (Perplexity, ChatGPT, Gemini) üst sıralarda çıkmak için.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Başlığı (Meta Title - Max 60 Karakter)</label>
              <input
                type="text"
                value={config.seo.metaTitle}
                onChange={(e) => updateConfig("seo", { ...config.seo, metaTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Açıklaması (Meta Description - Max 160 Karakter)</label>
              <textarea
                rows={3}
                value={config.seo.metaDescription}
                onChange={(e) => updateConfig("seo", { ...config.seo, metaDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Schema.org Yapılandırılmış Veri Tipi</label>
              <select
                value={config.seo.schemaType}
                onChange={(e) => updateConfig("seo", { ...config.seo, schemaType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-slate-900 outline-none"
              >
                <option value="LocalBusiness">Genel Yerel İşletme (LocalBusiness)</option>
                <option value="AutoRepair">Oto Tamir & Çekici (AutoRepair)</option>
                <option value="Dentist">Diş Kliniği & Hekimi (Dentist)</option>
                <option value="LegalService">Hukuk Bürosu & Avukat (LegalService)</option>
                <option value="HomeAndConstructionBusiness">Temizlik / Halı Yıkama / Tadilat (HomeAndConstructionBusiness)</option>
                <option value="MovingCompany">Evden Eve Nakliyat Şirketi (MovingCompany)</option>
                <option value="HVACBusiness">Kombi & Klima Servisi (HVACBusiness)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
