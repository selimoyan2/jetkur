import React, { useState } from "react";
import { SiteConfig, QuickStartDesignSet, HomepageSectionConfig } from "../../types";
import { QUICK_START_DESIGN_SETS } from "../../data/designSets";
import { 
  Sparkles, 
  Palette, 
  LayoutTemplate, 
  Check, 
  Eye, 
  Zap, 
  ArrowRight, 
  Layers, 
  Type, 
  Sliders, 
  CheckCircle2, 
  Search,
  Filter,
  Truck,
  Briefcase,
  HeartPulse,
  Utensils,
  Building,
  Crown,
  Cpu,
  Scale,
  LucideIcon
} from "lucide-react";

interface QuickStartDesignSetsProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  Briefcase,
  HeartPulse,
  Utensils,
  Building,
  Crown,
  Cpu,
  Scale
};

export const QuickStartDesignSets: React.FC<QuickStartDesignSetsProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSetId, setAppliedSetId] = useState<string | null>(null);

  const sectors = ["all", ...Array.from(new Set(QUICK_START_DESIGN_SETS.map((s) => s.sector)))];

  const filteredSets = QUICK_START_DESIGN_SETS.filter((set) => {
    const matchesSector = selectedSector === "all" || set.sector === selectedSector;
    const matchesQuery = 
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery;
  });

  const handleApplyDesignSet = (preset: QuickStartDesignSet) => {
    // Merge recommended sections with existing sections safely
    const currentSectionMap = new Map<string, HomepageSectionConfig>(
      (config.homepageSections || []).map((s) => [s.id, s])
    );
    
    const updatedSections: HomepageSectionConfig[] = preset.recommendedSections.map((recSec) => {
      const existing = currentSectionMap.get(recSec.id);
      return {
        id: recSec.id,
        name: existing ? existing.name : recSec.name,
        enabled: recSec.enabled,
        order: recSec.order
      };
    });

    // Add any remaining existing sections that weren't in recommended list as disabled or at bottom
    (config.homepageSections || []).forEach((sec) => {
      if (!updatedSections.some((u) => u.id === sec.id)) {
        updatedSections.push({
          ...sec,
          enabled: false,
          order: updatedSections.length + 1
        });
      }
    });

    // Build updated config
    const updatedConfig: SiteConfig = {
      ...config,
      palette: preset.palette,
      fontFamily: preset.fontFamily,
      borderRadius: preset.borderRadius,
      siteType: preset.siteType,
      homepageSections: updatedSections,
      header: {
        ...config.header,
        showPhoneButton: preset.headerStyle.showPhoneButton,
        phoneButtonText: preset.headerStyle.phoneButtonText,
        showWhatsappButton: preset.headerStyle.showWhatsappButton,
        whatsappButtonText: preset.headerStyle.whatsappButtonText,
        showQuoteButton: preset.headerStyle.showQuoteButton,
        quoteButtonText: preset.headerStyle.quoteButtonText
      },
      hero: {
        ...config.hero,
        badge: preset.heroPreset.badge,
        ctaPrimaryText: preset.heroPreset.ctaPrimaryText,
        ctaSecondaryText: preset.heroPreset.ctaSecondaryText
      }
    };

    onChange(updatedConfig);
    setAppliedSetId(preset.id);

    // Auto-clear success highlight after 3.5 seconds
    setTimeout(() => {
      setAppliedSetId(null);
    }, 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Value Proposition */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Hazır Hızlı Tasarım Setleri (Quick Start Sets)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                1-Tıkla Uygula & Yayına Al
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Sektörünüze Özel Hazır Tasarım & Tipografi Setleri</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Renk paleti, yazı tipi ailesi, buton kavisleri, boşluk oranları, menü butonları ve ana sayfa bölüm dizilimini manuel ayarlamakla vakit kaybetmeyin. Sektörünüze en uygun hazır tasarım setini tek tıkla sitenize giydirin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onPreview}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Canlı Önizlemede Gör</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tasarım seti veya sektör ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-start sm:self-center">
            Toplam <strong>{filteredSets.length}</strong> hazır tasarım paketi listeleniyor
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Sektör:
          </span>
          {sectors.map((sector) => {
            const isSelected = selectedSector === sector;
            const label = sector === "all" ? "Tüm Sektörler" : sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Design Sets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSets.map((preset) => {
          const isCurrentlyActive = config.palette.id === preset.palette.id && config.siteType === preset.siteType;
          const isJustApplied = appliedSetId === preset.id;
          const IconComponent = ICON_MAP[preset.icon] || Sparkles;

          return (
            <div
              key={preset.id}
              className={`rounded-2xl border transition-all duration-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between ${
                isJustApplied
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg scale-[1.01]"
                  : isCurrentlyActive
                  ? "border-amber-500 ring-2 ring-amber-500/20"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div>
                {/* Card Top Banner with Gradient */}
                <div className={`p-4 bg-gradient-to-r ${preset.previewGradient} text-white flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                        {preset.sector}
                      </span>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {preset.name}
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black backdrop-blur-xs border border-white/25 shrink-0">
                    {preset.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Visual Style Specifications Matrix */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    {/* Color Palette Swatch */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block">Renk Paleti</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span 
                          className="w-4 h-4 rounded-full border border-white shadow-xs" 
                          style={{ backgroundColor: preset.palette.primary }}
                          title={`Primary: ${preset.palette.primary}`}
                        />
                        <span 
                          className="w-4 h-4 rounded-full border border-white shadow-xs" 
                          style={{ backgroundColor: preset.palette.primaryDark }}
                          title={`Dark: ${preset.palette.primaryDark}`}
                        />
                        <span 
                          className="w-4 h-4 rounded-full border border-white shadow-xs" 
                          style={{ backgroundColor: preset.palette.accent }}
                          title={`Accent: ${preset.palette.accent}`}
                        />
                        <span className="text-xs font-bold text-slate-700 ml-1">
                          {preset.palette.name}
                        </span>
                      </div>
                    </div>

                    {/* Site Architecture */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block">Site Mimarisi</span>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{preset.siteType === "single-page" ? "Tek Sayfa (Landing)" : "Çok Sayfalı Kurumsal"}</span>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block">Tipografi & Yazı Tipi</span>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Type className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate">{preset.fontName}</span>
                      </div>
                    </div>

                    {/* Spacing & Border Radius */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block">Kavis & Boşluk Oranı</span>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span className="capitalize">
                          {preset.borderRadius.replace("rounded-", "")} • {preset.spacingDensity === "compact" ? "Kompakt" : preset.spacingDensity === "spacious" ? "Geniş/Lüks" : "Dengeli"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Header & Hero CTA Presets */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Header & Hero Aksiyonları:</span>
                      <span className="text-slate-400 font-mono">Hazır Şablon</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                        📞 {preset.headerStyle.phoneButtonText}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                        💬 {preset.headerStyle.whatsappButtonText}
                      </span>
                      {preset.headerStyle.showQuoteButton && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                          📝 {preset.headerStyle.quoteButtonText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommended Section Order Flow */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 block">Önerilen Bölüm Akışı:</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {preset.recommendedSections.slice(0, 5).map((sec, idx) => (
                        <React.Fragment key={sec.id}>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {sec.name}
                          </span>
                          {idx < 4 && idx < preset.recommendedSections.length - 1 && (
                            <span className="text-slate-300 text-[10px]">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  {isCurrentlyActive ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      Aktif Tasarım Seti
                    </span>
                  ) : isJustApplied ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Başarıyla Uygulandı!
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Hazır tasarım şablonu
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyDesignSet(preset)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                      isJustApplied
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-amber-400"
                    }`}
                  >
                    {isJustApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Uygulandı</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Bu Seti Uygula</span>
                      </>
                    )}
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
