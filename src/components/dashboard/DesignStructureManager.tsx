import React, { useState } from "react";
import { SiteConfig, HeaderConfig, HeroSlide, HomepageSectionConfig } from "../../types";
import { LogoSettings } from "./LogoSettings";
import { Base64ImageUpload } from "./Base64ImageUpload";
import { QuickStartDesignSets } from "./QuickStartDesignSets";
import { COLOR_PALETTES } from "../../data/templates";
import { 
  Palette, 
  LayoutTemplate, 
  Compass, 
  Sliders, 
  Layers, 
  MoveUp, 
  MoveDown, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink,
  FileCode,
  Globe,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";

interface DesignStructureManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview: () => void;
  onOpenAssetManager?: () => void;
}

export const DesignStructureManager: React.FC<DesignStructureManagerProps> = ({
  config,
  onChange,
  onPreview,
  onOpenAssetManager
}) => {
  const [subTab, setSubTab] = useState<"design-sets" | "logo-arch" | "header-nav" | "hero-sections" | "palette" | "footer">("design-sets");

  // Multi-slide hero
  const currentSlides: HeroSlide[] = config.hero.slides && config.hero.slides.length > 0
    ? config.hero.slides
    : [
        {
          id: "slide-1",
          badge: config.hero.badge || "✨ Profesyonel Hizmet",
          title: config.hero.title,
          subtitle: config.hero.subtitle,
          ctaPrimaryText: config.hero.ctaPrimaryText || "Hemen İletişime Geçin",
          ctaPrimaryLink: config.hero.ctaPrimaryLink || `tel:${config.phone}`,
          ctaSecondaryText: config.hero.ctaSecondaryText || "WhatsApp Destek",
          ctaSecondaryLink: config.hero.ctaSecondaryLink || `https://wa.me/${config.whatsapp}`,
          bgImage: config.hero.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80"
        }
      ];

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badge: "⭐ Özel Kampanya & Fırsat",
      title: `${config.companyName} Ayrıcalıklı Çözümler`,
      subtitle: "Müşterilerimize en yüksek kalite standartlarında hizmet sunuyoruz.",
      ctaPrimaryText: "Hemen Fiyat Alın",
      ctaPrimaryLink: `tel:${config.phone}`,
      ctaSecondaryText: "WhatsApp İle Yazın",
      ctaSecondaryLink: `https://wa.me/${config.whatsapp}`,
      bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
    };

    onChange({
      ...config,
      hero: {
        ...config.hero,
        slides: [...currentSlides, newSlide]
      }
    });
  };

  const handleRemoveSlide = (slideId: string) => {
    if (currentSlides.length <= 1) return;
    onChange({
      ...config,
      hero: {
        ...config.hero,
        slides: currentSlides.filter((s) => s.id !== slideId)
      }
    });
  };

  const handleUpdateSlide = (slideId: string, field: keyof HeroSlide, value: string) => {
    onChange({
      ...config,
      hero: {
        ...config.hero,
        slides: currentSlides.map((s) => (s.id === slideId ? { ...s, [field]: value } : s))
      }
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...config.homepageSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    const updated = sections.map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange({ ...config, homepageSections: updated });
  };

  const toggleSectionEnabled = (sectionId: string) => {
    const updatedSections = config.homepageSections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    const updatedConfig: SiteConfig = {
      ...config,
      homepageSections: updatedSections
    };

    if (sectionId === "gallery" && config.gallery) {
      const isNowEnabled = updatedSections.find(s => s.id === "gallery")?.enabled ?? true;
      updatedConfig.gallery = {
        ...config.gallery,
        enabled: isNowEnabled
      };
    }

    if (sectionId === "faqs" && (config.faqs || config.faq)) {
      const isNowEnabled = updatedSections.find(s => s.id === "faqs")?.enabled ?? true;
      const baseFaqs = config.faqs || config.faq;
      updatedConfig.faqs = {
        ...baseFaqs,
        enabled: isNowEnabled
      };
      updatedConfig.faq = updatedConfig.faqs;
    }

    onChange(updatedConfig);
  };

  const handleToggleNavItem = (id: string) => {
    onChange({
      ...config,
      header: {
        ...config.header,
        navItems: config.header.navItems.map((item) =>
          item.id === id ? { ...item, visible: !item.visible } : item
        )
      }
    });
  };

  return (
    <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Tasarım, Yapı & Görünüm Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logo yükleme, Tek Sayfa / Çok Sayfalı mimari seçimi, menü düzeni, hero slider ve kurumsal renk paleti.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSubTab("design-sets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === "design-sets"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-amber-400/90 hover:text-amber-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hızlı Tasarım Setleri</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("logo-arch")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "logo-arch"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Logo & Site Mimarisi
          </button>
          <button
            type="button"
            onClick={() => setSubTab("header-nav")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "header-nav"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Header & Menü
          </button>
          <button
            type="button"
            onClick={() => setSubTab("hero-sections")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "hero-sections"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Hero & Bölüm Sırası
          </button>
          <button
            type="button"
            onClick={() => setSubTab("palette")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "palette"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Renk Teması
          </button>
          <button
            type="button"
            onClick={() => setSubTab("footer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "footer"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Footer & Sosyal
          </button>
        </div>
      </div>

      {/* 0. QUICK START DESIGN SETS */}
      {subTab === "design-sets" && (
        <QuickStartDesignSets
          config={config}
          onChange={onChange}
          onPreview={onPreview}
        />
      )}

      {/* 1. LOGO & SITE ARCHITECTURE */}
      {subTab === "logo-arch" && (
        <div className="space-y-6">
          {/* Logo Settings Component */}
          <LogoSettings
            header={config.header}
            companyName={config.companyName}
            onChange={(updatedHeader) => onChange({ ...config, header: updatedHeader })}
            onOpenAssetManager={onOpenAssetManager}
          />

          {/* Site Page Architecture (Landing vs. Multi-Page) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Site Mimarisi & Sayfa Yapısı Seçimi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sitenizin tek bir dikey kaydırmalı sayfa mı yoksa bağımsız alt sayfalar mı olacağını belirleyin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onChange({ ...config, siteType: "single-page" })}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  config.siteType === "single-page"
                    ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <span>⚡ Tek Sayfa (Landing Page)</span>
                  </span>
                  {config.siteType === "single-page" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                      ✓ Seçili
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tüm bölümler tek bir sayfada akıcı ve pürüzsüz kaydırmayla sıralanır. Hızlı dönüşüm ve hafif yapı için idealdir.
                </p>
                <div className="mt-3 text-[11px] font-mono text-slate-500">
                  Üretilen Dosya: <strong>index.html</strong>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...config, siteType: "multi-page" })}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  config.siteType === "multi-page"
                    ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <span>📚 Çok Sayfalı (Multi-Page Site)</span>
                  </span>
                  {config.siteType === "multi-page" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                      ✓ Seçili
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Her sayfa ve her hizmet bağımsız birer <strong>.html</strong> dosyası olarak derlenir. Google SEO'da maksimum otorite sağlar.
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-400">
                  Üretilen Dosyalar: <strong>index.html, kurumsal.html, hizmet-[slug].html...</strong>
                </div>
              </button>
            </div>

            {/* If Multi-page, show generated files overview */}
            {config.siteType === "multi-page" && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    Çok Sayfalı Mimaride Otomatik Üretilen Dosyalar
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {6 + (config.services?.items?.length || 0) + (config.blog?.items?.length || 0) + (config.pages?.length || 0)} Ayrı Statik HTML Sayfası
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>index.html
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>kurumsal.html
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>hizmetler.html
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>katalog.html
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>blog.html
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-amber-400">/</span>iletisim.html
                  </div>

                  {/* Individual service pages */}
                  {(config.services?.items || []).map((s) => (
                    <div key={s.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-300 truncate" title={`hizmet-${s.slug}.html`}>
                      <span className="text-emerald-400">/</span>hizmet-{s.slug}.html
                    </div>
                  ))}

                  {/* Individual blog pages */}
                  {(config.blog?.items || []).map((p) => (
                    <div key={p.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-indigo-300 truncate" title={`blog-${p.slug}.html`}>
                      <span className="text-indigo-400">/</span>blog-{p.slug}.html
                    </div>
                  ))}

                  {/* Custom Pages */}
                  {(config.pages || []).map((cp) => (
                    <div key={cp.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-purple-300 truncate" title={`sayfa-${cp.slug}.html`}>
                      <span className="text-purple-400">/</span>sayfa-{cp.slug}.html
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. HEADER & NAV MENU */}
      {subTab === "header-nav" && (
        <div className="space-y-6">
          {/* Action Buttons in Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Header Hızlı Aksiyon & İletişim Butonları
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.header?.showWhatsappButton !== false}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        header: { ...config.header, showWhatsappButton: e.target.checked }
                      })
                    }
                    className="rounded text-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-200">WhatsApp Butonu</span>
                </label>
                <input
                  type="text"
                  value={config.header?.whatsappButtonText || "WhatsApp"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      header: { ...config.header, whatsappButtonText: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="Buton Metni"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.header?.showPhoneButton !== false}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        header: { ...config.header, showPhoneButton: e.target.checked }
                      })
                    }
                    className="rounded text-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Telefon Ara Butonu</span>
                </label>
                <input
                  type="text"
                  value={config.header?.phoneButtonText || "Hemen Ara"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      header: { ...config.header, phoneButtonText: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="Buton Metni"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.header?.showQuoteButton || false}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        header: { ...config.header, showQuoteButton: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Teklif Al Butonu</span>
                </label>
                <input
                  type="text"
                  value={config.header?.quoteButtonText || "Teklif Al"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      header: { ...config.header, quoteButtonText: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="Buton Metni"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.header?.showSocials !== false && config.socialMedia?.showInHeader !== false}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        header: { ...config.header, showSocials: e.target.checked },
                        socialMedia: { ...config.socialMedia, showInHeader: e.target.checked }
                      })
                    }
                    className="rounded text-pink-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Sosyal Medya İkonları</span>
                </label>
                <p className="text-[10px] text-slate-400">
                  Instagram, LinkedIn, Twitter/X ikonları menü yanında görünür
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Menü Linkleri & Görünürlük
              </h3>
            </div>

            <div className="space-y-2">
              {(config.header?.navItems || []).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 text-xs font-mono flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = config.header.navItems.map((n) =>
                          n.id === item.id ? { ...n, label: e.target.value } : n
                        );
                        onChange({ ...config, header: { ...config.header, navItems: updated } });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">
                      Hedef: #{item.target}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={() => handleToggleNavItem(item.id)}
                        className="rounded text-amber-500"
                      />
                      <span>{item.visible ? "Görünür" : "Gizli"}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HERO SLIDER & SECTION ORDERING */}
      {subTab === "hero-sections" && (
        <div className="space-y-6">
          {/* Section Reordering */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Ana Sayfa Bölüm Sıralaması & Görünürlük
              </h3>
              <span className="text-xs text-slate-400">Yukarı / Aşağı oklarla yer değiştirin</span>
            </div>

            <div className="space-y-2">
              {config.homepageSections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    sec.enabled ? "bg-slate-950 border-slate-800" : "bg-slate-950/40 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white">{sec.name}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">Modül: {sec.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Yukarı Taşı"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.homepageSections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Aşağı Taşı"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSectionEnabled(sec.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sec.enabled
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {sec.enabled ? "Aktif" : "Pasif"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Slider */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Hero Slider & Slayt Yönetimi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sitenizin en üstünde dönecek olan slaytları ve arka plan fotoğraflarını yönetin.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-amber-400 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Slayt Ekle</span>
              </button>
            </div>

            <div className="space-y-4">
              {currentSlides.map((slide, sIdx) => (
                <div key={slide.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px]">
                        {sIdx + 1}
                      </span>
                      <span>Slayt #{sIdx + 1}</span>
                    </span>
                    {currentSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(slide.id)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Slaytı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Üst Rozet (Badge)
                      </label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => handleUpdateSlide(slide.id, "badge", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Base64ImageUpload
                        label="Slayt Arka Plan Banner Fotoğrafı"
                        helperText="Bilgisayarınızdan fotoğraf seçin veya URL girin (Base64 olarak doğrudan siteConfig'e kaydedilir)"
                        value={slide.bgImage}
                        onChange={(newVal) => handleUpdateSlide(slide.id, "bgImage", newVal)}
                        aspectRatio="21/9"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Ana Başlık
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlide(slide.id, "title", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Alt Açıklama Metni
                      </label>
                      <textarea
                        rows={2}
                        value={slide.subtitle}
                        onChange={(e) => handleUpdateSlide(slide.id, "subtitle", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. PALETTE */}
      {subTab === "palette" && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Kurumsal Renk Teması & Palet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sitenizin sektörüne en uygun renk paletini tek tıkla uygulayın.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = config.palette.id === pal.id;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => onChange({ ...config, palette: pal })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full shadow-xs" style={{ backgroundColor: pal.primary }}></span>
                    <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: pal.primaryDark }}></span>
                    <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: pal.accent }}></span>
                  </div>
                  <div className="text-xs font-bold text-white">{pal.name}</div>
                  {isSelected && (
                    <span className="text-[10px] text-amber-400 font-bold block mt-1">✓ Aktif Palet</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      {subTab === "footer" && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Footer & Sosyal Medya Yapılandırması
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Footer Hakkımızda Kısa Metni
              </label>
              <textarea
                rows={2}
                value={config.footer?.aboutText || config.slogan}
                onChange={(e) =>
                  onChange({
                    ...config,
                    footer: { ...config.footer, aboutText: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">1. Sütun Başlığı</label>
                <input
                  type="text"
                  value={config.footer?.column1Title || "Hızlı Menü"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      footer: { ...config.footer, column1Title: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">2. Sütun Başlığı</label>
                <input
                  type="text"
                  value={config.footer?.column2Title || "İletişim & Lokasyon"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      footer: { ...config.footer, column2Title: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Sosyal Medya Hesapları
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia?.instagram || config.footer?.instagram || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        footer: { ...config.footer, instagram: e.target.value },
                        socialMedia: { ...config.socialMedia, instagram: e.target.value }
                      })
                    }
                    placeholder="https://instagram.com/sirket"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia?.facebook || config.footer?.facebook || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        footer: { ...config.footer, facebook: e.target.value },
                        socialMedia: { ...config.socialMedia, facebook: e.target.value }
                      })
                    }
                    placeholder="https://facebook.com/sirket"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia?.linkedin || config.footer?.linkedin || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        footer: { ...config.footer, linkedin: e.target.value },
                        socialMedia: { ...config.socialMedia, linkedin: e.target.value }
                      })
                    }
                    placeholder="https://linkedin.com/company/sirket"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia?.twitter || config.footer?.twitter || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        footer: { ...config.footer, twitter: e.target.value },
                        socialMedia: { ...config.socialMedia, twitter: e.target.value }
                      })
                    }
                    placeholder="https://x.com/sirket"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Telif Hakkı Metni</label>
              <input
                type="text"
                value={
                  config.footer?.copyrightText ||
                  `© ${new Date().getFullYear()} ${config.companyName}. Tüm Hakları Saklıdır.`
                }
                onChange={(e) =>
                  onChange({
                    ...config,
                    footer: { ...config.footer, copyrightText: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
