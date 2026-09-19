import React, { useState, useEffect } from "react";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Copy,
  CheckCircle2,
  Sliders,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  Eye
} from "lucide-react";
import {
  CompetitorColorPalette,
  COMPETITOR_THEME_PRESETS,
  DEFAULT_COMPETITOR_PALETTE,
  PRESET_SWATCHES
} from "../../utils/competitorColorTheme";

export interface CompetitorColorThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: CompetitorColorPalette;
  onApplyPalette: (newPalette: CompetitorColorPalette) => void;
  userName: string;
  competitors: { name: string; domain?: string }[];
  onNotification?: (msg: string) => void;
}

export const CompetitorColorThemeModal: React.FC<CompetitorColorThemeModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onApplyPalette,
  userName,
  competitors,
  onNotification
}) => {
  const [palette, setPalette] = useState<CompetitorColorPalette>(currentPalette);
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  // Keep state synchronized when modal opens with new currentPalette
  useEffect(() => {
    if (isOpen) {
      setPalette(currentPalette);
    }
  }, [isOpen, currentPalette]);

  if (!isOpen) return null;

  const comp1Name = competitors[0]?.name || "1. Rakip";
  const comp2Name = competitors[1]?.name || "2. Rakip";
  const comp3Name = competitors[2]?.name || "3. Rakip";

  const seriesList = [
    {
      key: "user" as const,
      label: `Siteniz (${userName})`,
      desc: "Kendi web sitenizin D3 çubuk, pasta ve dağılım grafiği rengi",
      color: palette.user
    },
    {
      key: "comp1" as const,
      label: `1. Rakip (${comp1Name})`,
      desc: "En güçlü birincil rakibinizin grafikteki temsil rengi",
      color: palette.comp1
    },
    {
      key: "comp2" as const,
      label: `2. Rakip (${comp2Name})`,
      desc: "İkinci rakibinizin grafik serisi rengi",
      color: palette.comp2
    },
    {
      key: "comp3" as const,
      label: `3. Rakip (${comp3Name})`,
      desc: "Üçüncü rakibinizin grafik serisi rengi",
      color: palette.comp3
    }
  ];

  const handleSelectPreset = (presetColors: CompetitorColorPalette) => {
    setPalette(presetColors);
    if (onNotification) {
      onNotification("Tema şablonu seçildi. Canlı önizlemede inceleyebilirsiniz.");
    }
  };

  const handleColorChange = (key: keyof CompetitorColorPalette, color: string) => {
    setPalette((prev) => ({
      ...prev,
      [key]: color
    }));
  };

  const handleResetDefault = () => {
    setPalette(DEFAULT_COMPETITOR_PALETTE);
    if (onNotification) {
      onNotification("Renkler varsayılan değerlere sıfırlandı.");
    }
  };

  const handleSaveAndApply = () => {
    onApplyPalette(palette);
    if (onNotification) {
      onNotification("Grafik renk teması güncellendi ve kaydedildi.");
    }
    onClose();
  };

  const handleCopyHexCodes = () => {
    const text = `Siteniz: ${palette.user}, ${comp1Name}: ${palette.comp1}, ${comp2Name}: ${palette.comp2}, ${comp3Name}: ${palette.comp3}`;
    navigator.clipboard.writeText(text);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 3000);
    if (onNotification) {
      onNotification("Renk HEX kodları panoya kopyalandı.");
    }
  };

  // Check if current palette matches any preset
  const activePresetId = COMPETITOR_THEME_PRESETS.find(
    (p) =>
      p.colors.user.toLowerCase() === palette.user.toLowerCase() &&
      p.colors.comp1.toLowerCase() === palette.comp1.toLowerCase() &&
      p.colors.comp2.toLowerCase() === palette.comp2.toLowerCase() &&
      p.colors.comp3.toLowerCase() === palette.comp3.toLowerCase()
  )?.id;

  return (
    <div
      id="modal-competitor-color-theme"
      data-testid="competitor-color-theme-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="color-theme-modal-title"
    >
      <div className="bg-slate-900 border border-amber-500/40 text-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Palette className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="color-theme-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  D3.js Grafik Renk Teması Seçici
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/30">
                  Kişiselleştirilebilir
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                D3.js çubuk ve pasta grafiklerindeki rakip serilerinin renklerini özelleştirin ve kaydedin.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-color-theme-modal"
            data-testid="close-color-theme-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* INTERACTIVE MINI LIVE D3 PREVIEW (CANLI GRAFİK ÖNİZLEME) */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Canlı D3 Grafik Önizlemesi (Seçili Renkler)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-copy-palette-hex"
                onClick={handleCopyHexCodes}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                title="Renk HEX kodlarını panoya kopyala"
              >
                {copiedHex ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>HEX Kopyala</span>
                  </>
                )}
              </button>
              <button
                type="button"
                id="btn-reset-color-theme"
                onClick={handleResetDefault}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                title="Varsayılan renklere dön"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Sıfırla</span>
              </button>
            </div>
          </div>

          {/* SIMULATED D3 GRAPHIC BARS PREVIEW */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Horizontal Simulated Bars */}
            <div className="flex-1 w-full space-y-2">
              <div className="text-[10px] text-slate-400 font-mono mb-1">
                Örnek: "implant fiyatları" SERP Pozisyon Skoru:
              </div>
              {seriesList.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 truncate font-bold text-slate-300 text-right">
                    {item.key === "user" ? "Siteniz" : item.label.split("(")[1]?.replace(")", "") || item.key}
                  </span>
                  <div className="flex-1 bg-slate-800/80 rounded-full h-3.5 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{
                        backgroundColor: item.color,
                        width:
                          item.key === "user"
                            ? "92%"
                            : item.key === "comp1"
                            ? "78%"
                            : item.key === "comp2"
                            ? "64%"
                            : "45%"
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] w-8 text-right font-bold" style={{ color: item.color }}>
                    {item.key === "user" ? "#1" : item.key === "comp1" ? "#3" : item.key === "comp2" ? "#5" : "#9"}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini Donut Preview */}
            <div className="flex items-center gap-3 shrink-0 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <svg width="68" height="68" viewBox="0 0 42 42" className="rotate-[-90deg]">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="6" />
                {/* 1. User */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={palette.user}
                  strokeWidth="6"
                  strokeDasharray="40 60"
                  strokeDashoffset="0"
                />
                {/* 2. Comp 1 */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={palette.comp1}
                  strokeWidth="6"
                  strokeDasharray="28 72"
                  strokeDashoffset="-40"
                />
                {/* 3. Comp 2 */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={palette.comp2}
                  strokeWidth="6"
                  strokeDasharray="20 80"
                  strokeDashoffset="-68"
                />
                {/* 4. Comp 3 */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={palette.comp3}
                  strokeWidth="6"
                  strokeDasharray="12 88"
                  strokeDashoffset="-88"
                />
              </svg>
              <div className="space-y-1 text-[10px]">
                <div className="font-bold text-slate-300">Pazar Payı Görünümü</div>
                <div className="text-slate-400 font-mono">D3 Pie & Donut</div>
              </div>
            </div>

          </div>
        </div>

        {/* TABS: HAZIR ŞABLONLAR VS ÖZEL RENKLER */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            id="tab-color-presets"
            data-testid="tab-color-presets"
            onClick={() => setActiveTab("presets")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "presets"
                ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hazır SEO Tema Paletleri ({COMPETITOR_THEME_PRESETS.length})</span>
          </button>
          <button
            type="button"
            id="tab-color-custom"
            data-testid="tab-color-custom"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Serileri Tek Tek Özelleştir</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CURATED PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Aşağıdaki profesyonel paletlerden birini seçerek grafiğinizi tek tıkla stilize edebilirsiniz:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMPETITOR_THEME_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      id={`preset-card-${preset.id}`}
                      data-testid={`preset-card-${preset.id}`}
                      onClick={() => handleSelectPreset(preset.colors)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative group ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30 shadow-md shadow-amber-500/10"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs">{preset.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-medium border border-slate-700">
                            {preset.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      {/* 4 Swatch Stripes Preview */}
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-full h-5 rounded-md shadow-inner border border-white/20"
                            style={{ backgroundColor: preset.colors.user }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono">Siteniz</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-full h-5 rounded-md shadow-inner border border-white/20"
                            style={{ backgroundColor: preset.colors.comp1 }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono truncate max-w-full">
                            {comp1Name.split(" ")[0]}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-full h-5 rounded-md shadow-inner border border-white/20"
                            style={{ backgroundColor: preset.colors.comp2 }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono truncate max-w-full">
                            {comp2Name.split(" ")[0]}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-full h-5 rounded-md shadow-inner border border-white/20"
                            style={{ backgroundColor: preset.colors.comp3 }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono truncate max-w-full">
                            {comp3Name.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM COLOR PICKER PER SERIES */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Her bir rakip serisi için renk seçiciye tıklayabilir veya dilediğiniz HEX renk kodunu yazabilirsiniz:
              </p>

              <div className="space-y-3">
                {seriesList.map((item) => (
                  <div
                    key={item.key}
                    id={`custom-picker-row-${item.key}`}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Interactive Color Box */}
                        <div className="relative">
                          <input
                            type="color"
                            id={`input-color-picker-${item.key}`}
                            data-testid={`input-color-picker-${item.key}`}
                            value={item.color}
                            onChange={(e) => handleColorChange(item.key, e.target.value)}
                            className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent opacity-0 absolute inset-0"
                            title="Renk Seçiciyi Aç"
                          />
                          <div
                            className="w-9 h-9 rounded-xl border-2 border-white/40 shadow-inner flex items-center justify-center cursor-pointer pointer-events-none"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{item.label}</span>
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
                              style={{
                                backgroundColor: `${item.color}25`,
                                color: item.color,
                                border: `1px solid ${item.color}50`
                              }}
                            >
                              Aktif Renk
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </div>
                      </div>

                      {/* HEX text input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-mono">HEX:</span>
                        <input
                          type="text"
                          id={`input-hex-${item.key}`}
                          data-testid={`input-hex-${item.key}`}
                          value={item.color}
                          onChange={(e) => handleColorChange(item.key, e.target.value)}
                          maxLength={7}
                          className="w-24 px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center uppercase focus:ring-1 focus:ring-amber-400 outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    {/* Quick Swatches Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Önerilen Renkler:</span>
                      {PRESET_SWATCHES.map((swatch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleColorChange(item.key, swatch)}
                          className={`w-5 h-5 rounded-full transition-transform hover:scale-125 border ${
                            item.color.toLowerCase() === swatch.toLowerCase()
                              ? "ring-2 ring-white border-transparent scale-110"
                              : "border-black/30"
                          }`}
                          style={{ backgroundColor: swatch }}
                          title={`Bu rengi seç: ${swatch}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tercihleriniz tarayıcınızda (localStorage) kalıcı olarak saklanır.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-color-theme"
              data-testid="cancel-color-theme-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="button"
              id="btn-apply-color-theme"
              data-testid="apply-color-theme-btn"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Kaydet & Grafikleri Güncelle</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
