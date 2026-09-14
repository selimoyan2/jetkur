import React, { useState } from "react";
import { ThemeTemplate, ColorPalette, SiteConfig } from "../types";
import { COLOR_PALETTES } from "../data/templates";
import { Check, Eye, Edit3, Sparkles, Filter, Search, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface TemplateCatalogProps {
  templates: ThemeTemplate[];
  selectedTemplate: ThemeTemplate;
  onSelectTemplate: (template: ThemeTemplate, palette?: ColorPalette) => void;
  onOpenEditor: () => void;
  onOpenPreview: () => void;
}

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onOpenEditor,
  onOpenPreview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempPalettes, setTempPalettes] = useState<Record<string, ColorPalette>>({});

  const categories = ["all", "Acil Hizmet", "Sağlık & Klinik", "Profesyonel", "Hizmet & Fabrika", "Taşımacılık", "Teknik Servis"];

  const filteredTemplates = templates.filter((t) => {
    const matchCat = selectedCategory === "all" || t.category === selectedCategory;
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePaletteChange = (templateId: string, palette: ColorPalette) => {
    setTempPalettes((prev) => ({ ...prev, [templateId]: palette }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Value Proposition */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sitenizolsun & WordPress Alternatifi Hazır Site SaaS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Sektörel Hazır Web Sitesi Şablonları & Sınırsız Renk Kombinasyonları
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Müşterileriniz için istediğiniz sektörü ve renk paletini seçin. Sistemimiz WordPress gibi veritabanına ve sunucuya yük bindirmez;
            tek tıkla arama motorlarına ve AI asistanlarına tam uyumlu, <strong>100/100 PageSpeed</strong> hızında statik HTML üretir.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-4 h-4" /> 0.1 sn Açılış Hızı (Statik HTML)
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <ShieldCheck className="w-4 h-4" /> Sıfır MySQL/PHP Yükü
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-4 h-4" /> AI Destekli İçerik & SEO
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sektör veya şablon ara (Örn: Çekici, Diş, Hukuk, Nakliyat)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "Tüm Sektörler" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const currentPalette = tempPalettes[template.id] || template.defaultColors;
          const isSelected = selectedTemplate.id === template.id;

          return (
            <div
              key={template.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col bg-white ${
                isSelected
                  ? "border-amber-500 ring-2 ring-amber-500/20 shadow-lg"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Cover Image & Badge */}
              <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                <img
                  src={template.coverImage}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                {template.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur text-white text-[11px] font-bold border border-white/20">
                    {template.badge}
                  </div>
                )}

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white backdrop-blur" style={{ backgroundColor: currentPalette.primary }}>
                  {template.category}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 block mb-0.5">
                    {template.sector}
                  </span>
                  <h3 className="text-base font-bold leading-snug drop-shadow-sm">
                    {template.name}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {template.description}
                </p>

                {/* Color Palette Switcher */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Renk Kombinasyonu:</span>
                    <span className="text-slate-800 font-bold">{currentPalette.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_PALETTES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePaletteChange(template.id, p)}
                        title={p.name}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                          currentPalette.id === p.id
                            ? "border-slate-900 ring-2 ring-slate-400 scale-105"
                            : "border-white"
                        }`}
                        style={{ backgroundColor: p.primary }}
                      >
                        {currentPalette.id === p.id && (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectTemplate(template, currentPalette);
                      onOpenPreview();
                    }}
                    className="py-2.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Önizle</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTemplate(template, currentPalette);
                      onOpenEditor();
                    }}
                    className="py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Seç & Düzenle</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
