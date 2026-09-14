import React, { useState } from "react";
import { ServiceItem, SiteConfig } from "../../types";
import { RichTextEditor } from "../RichTextEditor";
import { slugify, slugifyService, sanitizeSlugInput } from "../../utils/url";
import { Base64ImageUpload } from "./Base64ImageUpload";
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Globe, 
  Layers, 
  Tag, 
  Image as ImageIcon,
  Upload
} from "lucide-react";

interface ServiceManagerProps {
  config: SiteConfig;
  onChange: (updatedServices: ServiceItem[]) => void;
  onPreviewService?: (slug: string) => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  config,
  onChange,
  onPreviewService
}) => {
  const services = config.services?.items || [];
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    services[0]?.id || null
  );
  const [newFeatureInput, setNewFeatureInput] = useState("");

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleAddService = () => {
    const id = `svc-${Date.now()}`;
    const newService: ServiceItem = {
      id,
      title: "Yeni Profesyonel Hizmet",
      slug: `yeni-hizmet-${Date.now().toString().slice(-4)}`,
      desc: "Bu hizmetimizle müşterilerimize en yüksek kalitede hızlı ve güvenilir çözümler sunuyoruz.",
      price: "1.500 ₺'den Başlayan",
      longContent: `<h2>Hizmet Kapsamı & Avantajlar</h2><p><strong>${config.companyName}</strong> olarak sektördeki tecrübemizle en yüksek standartlarda hizmet veriyoruz.</p><h3>Neden Bu Hizmeti Seçmelisiniz?</h3><ul><li>7/24 Kesintisiz uzman ekip desteği</li><li>Sabit fiyat garantisi ve şeffaf sözleşme</li><li>Hızlı teslimat ve %100 müşteri memnuniyeti</li></ul><p>Detaylı bilgi ve ücretsiz keşif için bize hemen ulaşın.</p>`,
      features: [
        "Sertifikalı & Deneyimli Uzman Kadro",
        "Aynı Gün Hızlı Teslimat / Müdahale",
        "Sabit Fiyat Garantisi & Fatura",
        "7/24 Çağrı & WhatsApp Desteği"
      ],
      bannerImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      seoTitle: `${config.companyName} | Yeni Hizmet - ${config.city}`,
      seoDescription: `${config.city} bölgesinde profesyonel hizmet çözümleri. Hızlı destek ve uygun fiyatlar için hemen arayın.`,
      seoKeywords: `${config.sector}, ${config.city} hizmet, profesyonel destek, ${config.companyName}`
    };

    const updated = [newService, ...services];
    onChange(updated);
    setSelectedServiceId(newService.id);
  };

  const handleRemoveService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    onChange(updated);
    if (selectedServiceId === id) {
      setSelectedServiceId(updated[0]?.id || null);
    }
  };

  const handleUpdateCurrentService = (field: keyof ServiceItem, value: any) => {
    if (!currentService) return;
    const updated = services.map((s) =>
      s.id === currentService.id ? { ...s, [field]: value } : s
    );
    onChange(updated);
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim() || !currentService) return;
    const currentFeatures = currentService.features || [];
    handleUpdateCurrentService("features", [...currentFeatures, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (idx: number) => {
    if (!currentService) return;
    const currentFeatures = currentService.features || [];
    handleUpdateCurrentService(
      "features",
      currentFeatures.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hizmetlerimiz & Hizmet Sayfaları Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Her hizmet için bağımsız <strong>hizmet-[slug].html</strong> sayfası üretilir. Zengin metin, özellik listesi ve özel SEO etiketleriyle donatılmıştır.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddService}
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Hizmet Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Services Sidebar List */}
        <div className="md:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mevcut Hizmetler ({services.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {services.map((svc, idx) => {
              const isSelected = svc.id === (currentService?.id || "");
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedServiceId(svc.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-900 border-amber-500 ring-1 ring-amber-500/30 shadow-sm"
                      : "bg-slate-950 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{svc.title}</div>
                      <div className="text-[11px] text-amber-400 font-semibold font-mono truncate">
                        {svc.price || "Teklif Alın"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        /hizmet-{svc.slug}.html
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Service Editor */}
        <div className="md:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          {currentService ? (
            <>
              {/* Top Action Bar for Selected Service */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    hizmet-{currentService.slug || "detay"}.html
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveService(currentService.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hizmeti Sil</span>
                  </button>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Hizmet Başlığı *
                  </label>
                  <input
                    type="text"
                    value={currentService.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      handleUpdateCurrentService("title", title);
                      // Auto slug suggestion if not customized
                      if (!currentService.slug || currentService.slug.startsWith("yeni-hizmet")) {
                        const autoSlug = slugify(title);
                        handleUpdateCurrentService("slug", autoSlug);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:border-amber-500 outline-none"
                    placeholder="Örn: 7/24 Acil Oto Çekici & Kurtarma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    URL Slug (Sayfa Bağlantı Kodu) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-950 border border-r-0 border-slate-700 text-slate-500 text-xs rounded-l-xl font-mono">
                      hizmet-
                    </span>
                    <input
                      type="text"
                      value={currentService.slug || ""}
                      onChange={(e) =>
                        handleUpdateCurrentService(
                          "slug",
                          sanitizeSlugInput(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-r-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-amber-500 outline-none"
                      placeholder="oto-cekici"
                    />
                    <span className="px-2.5 py-2.5 bg-slate-950 border border-l-0 border-slate-700 text-slate-500 text-xs rounded-r-xl font-mono">
                      .html
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Fiyat / Teklif Etiketi
                  </label>
                  <input
                    type="text"
                    value={currentService.price || ""}
                    onChange={(e) => handleUpdateCurrentService("price", e.target.value)}
                    placeholder="Örn: 1.500 ₺'den Başlayan veya Ücretsiz Keşif"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-amber-400 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kısa Kart Özeti (Ana Sayfada & Listelerde Görünür)
                  </label>
                  <textarea
                    rows={2}
                    value={currentService.desc}
                    onChange={(e) => handleUpdateCurrentService("desc", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 outline-none"
                    placeholder="Hizmetin 1-2 cümlelik vurucu açıklaması."
                  />
                </div>

                {/* Service Banner / Cover Image Upload & Preview */}
                <div className="sm:col-span-2 pt-2">
                  <Base64ImageUpload
                    label="Hizmet Banner / Kapak Görseli"
                    helperText="Bilgisayarınızdan fotoğraf seçin veya URL girin (Base64 olarak doğrudan siteConfig'e kaydedilir)"
                    value={currentService.bannerImage || currentService.image || ""}
                    onChange={(newVal) => {
                      handleUpdateCurrentService("bannerImage", newVal);
                      handleUpdateCurrentService("image", newVal);
                    }}
                    aspectRatio="21/9"
                  />
                </div>
              </div>

              {/* Service Features / Checklist Manager */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300">
                  Hizmet Özellikleri & Maddeleri (Checklist)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Örn: 30 Dakikada Olay Yerinde Hızlı Müdahale"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                  >
                    Madde Ekle
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(currentService.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated Rich Text Long Content */}
              <div className="pt-3 border-t border-slate-800">
                <RichTextEditor
                  label="Hizmet Sayfası Detaylı İçeriği (Görsel WYSIWYG Editör)"
                  value={currentService.longContent || currentService.desc}
                  onChange={(val) => handleUpdateCurrentService("longContent", val)}
                  placeholder="Hizmetin tüm detaylarını, adımlarını ve garanti şartlarını doğrudan biçimlendirerek buraya yazın..."
                  minHeight="220px"
                  darkMode={true}
                  helpText="Hizmet detay sayfasında (/hizmet-[slug].html) başlıklar, paragraflar, maddeler ve tablolar olarak ziyaretçilere sunulur."
                />
              </div>

              {/* SEO & Meta Tags Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 pt-4">
                <div className="flex items-center gap-2 text-amber-400 justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Bu Hizmet Sayfasına Özel Arama Motoru (SEO) Ayarları
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const autoSlug = slugifyService(currentService.title);
                      const optTitle = `${currentService.title} Hizmeti & En İyi Fiyatları | ${config.city} ${config.companyName}`.slice(0, 60);
                      const optDesc = `${config.city} bölgesinde profesyonel ${currentService.title.toLowerCase()} hizmeti: ${currentService.desc ? currentService.desc.slice(0, 80) : 'Garantili işçilik ve uygun fiyat'}. Hemen arayın!`.slice(0, 155);
                      const optKeywords = `${currentService.title}, ${currentService.title} fiyatları, ${config.city} ${currentService.title.toLowerCase()}, ${config.companyName}`;

                      handleUpdateCurrentService("slug", autoSlug);
                      handleUpdateCurrentService("seoTitle", optTitle);
                      handleUpdateCurrentService("seoDescription", optDesc);
                      handleUpdateCurrentService("seoKeywords", optKeywords);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI ile SEO & URL Optimize Et</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Özel SEO Başlığı (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={currentService.seoTitle || `${currentService.title} | ${config.companyName}`}
                      onChange={(e) => handleUpdateCurrentService("seoTitle", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      placeholder="Örn: En Uygun Oto Çekici Hizmeti - Güvenilir & 7/24"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Özel SEO Açıklaması (Meta Description)
                    </label>
                    <textarea
                      rows={2}
                      value={currentService.seoDescription || currentService.desc}
                      onChange={(e) => handleUpdateCurrentService("seoDescription", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                      placeholder="Google arama sonuçlarında çıkacak 150-160 karakterlik açıklama."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      value={currentService.seoKeywords || `${currentService.title}, ${config.sector}, ${config.city}`}
                      onChange={(e) => handleUpdateCurrentService("seoKeywords", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      placeholder="hizmet adi, sehir, profesyonel destek"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Özel OpenGraph Sosyal Medya Paylaşım Görseli (WhatsApp / Facebook)
                    </label>
                    <input
                      type="text"
                      value={currentService.ogImage || currentService.bannerImage || ""}
                      onChange={(e) => handleUpdateCurrentService("ogImage", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      placeholder="https://... (boş bırakılırsa hizmet afişi kullanılır)"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Lütfen sol taraftan bir hizmet seçin veya yeni hizmet ekleyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
