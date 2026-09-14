import React, { useState } from "react";
import { SiteConfig, CustomPageItem } from "../../types";
import { RichTextEditor } from "../RichTextEditor";
import { sanitizeSlugInput, slugify } from "../../utils/url";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Globe, 
  Check, 
  FileText, 
  Building2, 
  Eye, 
  ExternalLink,
  Sparkles
} from "lucide-react";

interface CustomPagesManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
}

export const CustomPagesManager: React.FC<CustomPagesManagerProps> = ({
  config,
  onChange
}) => {
  const [activeSubView, setActiveSubView] = useState<"about" | "custom-pages">("about");
  const customPages = config.pages || [];
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    customPages[0]?.id || null
  );

  const currentPage = customPages.find((p) => p.id === selectedPageId) || customPages[0];

  const handleAddCustomPage = () => {
    const id = `page-${Date.now()}`;
    const title = "Yeni Kurumsal Sayfa";
    const initialSlug = slugify(title, Date.now().toString().slice(-4));
    const newPage: CustomPageItem = {
      id,
      title,
      slug: initialSlug,
      content: `<h2>Kurumsal Politika & Bilgilendirme</h2><p>Bu sayfada şirketimizin değerlerini, standartlarını ve müşterilerimize taahhütlerimizi paylaşıyoruz.</p><h3>İlkelerimiz</h3><ul><li>Şeffaf iş ortaklığı ve güvenilir hizmet</li><li>Yüksek kalite ve müşteri memnuniyeti</li><li>Gizlilik ve veri güvenliği standartları</li></ul>`,
      bannerImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      isNavVisible: true,
      seoTitle: `${title} | ${config.companyName} ${config.city}`,
      metaDescription: `${config.companyName} ${title.toLowerCase()} sayfası. Kurumsal bilgilerimiz, vizyonumuz ve iletişim detaylarımız hakkında bilgi alın.`,
      seoKeywords: `${title.toLowerCase()}, ${config.companyName}, ${config.sector}, ${config.city}`
    };

    const updated = [...customPages, newPage];
    onChange({
      ...config,
      pages: updated
    });
    setSelectedPageId(newPage.id);
  };

  const handleRemoveCustomPage = (id: string) => {
    const updated = customPages.filter((p) => p.id !== id);
    onChange({
      ...config,
      pages: updated
    });
    if (selectedPageId === id) {
      setSelectedPageId(updated[0]?.id || null);
    }
  };

  const handleUpdateCurrentPage = (field: keyof CustomPageItem, value: any) => {
    if (!currentPage) return;
    const updated = customPages.map((p) =>
      p.id === currentPage.id ? { ...p, [field]: value } : p
    );
    onChange({
      ...config,
      pages: updated
    });
  };

  return (
    <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hakkımızda & Özel Kurumsal Sayfalar</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kurumsal profil metnini düzenleyin veya sınırsız sayıda bağımsız <strong>sayfa-[slug].html</strong> sayfası oluşturun.
          </p>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubView("about")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubView === "about"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Kurumsal Profil (Hakkımızda)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView("custom-pages")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubView === "custom-pages"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Özel Sayfalar ({customPages.length})
          </button>
        </div>
      </div>

      {/* 1. ABOUT US VIEW */}
      {activeSubView === "about" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Kurumsal Bölüm Başlığı
              </label>
              <input
                type="text"
                value={config.about.title}
                onChange={(e) =>
                  onChange({
                    ...config,
                    about: { ...config.about, title: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Kurumsal Görsel URL
              </label>
              <input
                type="text"
                value={config.about.image}
                onChange={(e) =>
                  onChange({
                    ...config,
                    about: { ...config.about, image: e.target.value }
                  })
                }
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Stats Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Yıllık Deneyim
              </label>
              <input
                type="text"
                value={config.about.yearsExperience}
                onChange={(e) =>
                  onChange({
                    ...config,
                    about: { ...config.about, yearsExperience: e.target.value }
                  })
                }
                placeholder="15+"
                className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-400 font-bold"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Tamamlanan Proje / Hizmet
              </label>
              <input
                type="text"
                value={config.about.completedProjects}
                onChange={(e) =>
                  onChange({
                    ...config,
                    about: { ...config.about, completedProjects: e.target.value }
                  })
                }
                placeholder="5.000+"
                className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-400 font-bold"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Müşteri Memnuniyeti
              </label>
              <input
                type="text"
                value="%100"
                disabled
                className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-bold opacity-80"
              />
            </div>
          </div>

          {/* Rich Text Editor for About */}
          <div>
            <RichTextEditor
              label="Hakkımızda & Kurumsal Tanıtım Yazısı (Görsel WYSIWYG Editör)"
              value={config.about.content}
              onChange={(val) =>
                onChange({
                  ...config,
                  about: { ...config.about, content: val }
                })
              }
              placeholder="Şirket geçmişinizi, vizyonunuzu ve değerlerinizi doğrudan biçimlendirerek yazın..."
              minHeight="200px"
              darkMode={true}
              helpText="Ana sayfada ve kurumsal profil alanında zengin başlıklar ve paragraflar olarak gösterilir."
            />
          </div>
        </div>
      )}

      {/* 2. CUSTOM INDEPENDENT PAGES VIEW */}
      {activeSubView === "custom-pages" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ekstra Sayfa Oluşturucu (KVKK, Vizyon, Referanslar vs.)
            </span>
            <button
              type="button"
              onClick={handleAddCustomPage}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sayfa Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Pages list sidebar */}
            <div className="md:col-span-4 space-y-2">
              {customPages.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                  Henüz özel sayfa eklenmedi. "Yeni Sayfa Ekle" butonuna basarak oluşturabilirsiniz.
                </div>
              ) : (
                customPages.map((page, pIdx) => {
                  const isSelected = page.id === (currentPage?.id || "");
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setSelectedPageId(page.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-slate-900 border-amber-500 ring-1 ring-amber-500/30 shadow-sm"
                          : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{page.title}</div>
                        <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                          /sayfa-{page.slug}.html
                        </div>
                      </div>
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center">
                        #{pIdx + 1}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Page Editor */}
            <div className="md:col-span-8 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-5">
              {currentPage ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      /sayfa-{currentPage.slug}.html
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomPage(currentPage.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sayfayı Sil</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Sayfa Başlığı *
                      </label>
                      <input
                        type="text"
                        value={currentPage.title}
                        onChange={(e) => handleUpdateCurrentPage("title", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                        placeholder="Örn: KVKK ve Gizlilik Politikası"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Sayfa Slug (URL Kodu) *
                      </label>
                      <div className="flex items-center">
                        <span className="px-2.5 py-2 bg-slate-950 border border-r-0 border-slate-700 text-slate-500 text-xs rounded-l-xl font-mono">
                          sayfa-
                        </span>
                        <input
                          type="text"
                          value={currentPage.slug}
                          onChange={(e) =>
                            handleUpdateCurrentPage(
                              "slug",
                              sanitizeSlugInput(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded-r-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          placeholder="kvkk"
                        />
                        <span className="px-2 py-2 bg-slate-950 border border-l-0 border-slate-700 text-slate-500 text-xs rounded-r-xl font-mono">
                          .html
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Banner / Üst Görsel URL (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={currentPage.bannerImage || ""}
                        onChange={(e) => handleUpdateCurrentPage("bannerImage", e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Rich Text Content */}
                  <div>
                    <RichTextEditor
                      label="Sayfa İçeriği (Görsel WYSIWYG Editör)"
                      value={currentPage.content}
                      onChange={(val) => handleUpdateCurrentPage("content", val)}
                      placeholder="Sayfa metnini buraya yazın veya biçimlendirin..."
                      minHeight="220px"
                      darkMode={true}
                      helpText="Bu sayfa için başlıklar (H2, H3), listeler, tablolar, alıntılar ve bağlantılar ekleyebilirsiniz."
                    />
                  </div>

                  {/* SEO Section for Custom Page */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-1.5 text-amber-400 text-xs font-bold">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Bu Sayfaya Özel SEO & Meta Bilgileri</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const autoSlug = slugify(currentPage.title);
                          const optTitle = `${currentPage.title} | ${config.companyName} ${config.city}`.slice(0, 60);
                          const optDesc = `${config.companyName} ${currentPage.title.toLowerCase()} sayfası. Kurumsal standartlarımız ve detaylı bilgiler.`.slice(0, 155);
                          const optKeywords = `${currentPage.title.toLowerCase()}, ${config.companyName}, ${config.sector}, ${config.city}`;

                          handleUpdateCurrentPage("slug", autoSlug);
                          handleUpdateCurrentPage("seoTitle", optTitle);
                          handleUpdateCurrentPage("metaDescription", optDesc);
                          handleUpdateCurrentPage("seoKeywords", optKeywords);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI ile SEO & URL Optimize Et</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          SEO Başlığı (Meta Title)
                        </label>
                        <input
                          type="text"
                          value={currentPage.seoTitle || `${currentPage.title} | ${config.companyName}`}
                          onChange={(e) => handleUpdateCurrentPage("seoTitle", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          SEO Açıklaması (Meta Description)
                        </label>
                        <textarea
                          rows={2}
                          value={currentPage.metaDescription || ""}
                          onChange={(e) => handleUpdateCurrentPage("metaDescription", e.target.value)}
                          placeholder="Arama motorlarında listelenecek açıklama..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Anahtar Kelimeler (Keywords)
                          </label>
                          <input
                            type="text"
                            value={currentPage.seoKeywords || ""}
                            onChange={(e) => handleUpdateCurrentPage("seoKeywords", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            placeholder="etiket1, etiket2"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Özel OpenGraph Görseli (WhatsApp/Facebook)
                          </label>
                          <input
                            type="text"
                            value={currentPage.ogImage || currentPage.bannerImage || ""}
                            onChange={(e) => handleUpdateCurrentPage("ogImage", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="https://... (boşsa banner kullanılır)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Düzenlemek için bir sayfa seçin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
