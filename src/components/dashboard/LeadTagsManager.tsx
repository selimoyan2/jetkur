import React, { useState, useRef, useEffect } from "react";
import {
  Tag,
  Plus,
  X,
  Check,
  Sparkles,
  Palette,
  Settings2,
  ChevronDown
} from "lucide-react";
import { LeadTagColor, LeadCustomTag } from "../../types";

export interface ColorOption {
  id: LeadTagColor;
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  badge: string;
  previewBg: string;
}

// 12 distinct color palettes with high-contrast text, borders and dots for light & dark mode
export const LEAD_TAG_PALETTES: Record<LeadTagColor, ColorOption> = {
  rose: {
    id: "rose",
    label: "Kırmızı / Acil",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    previewBg: "#f43f5e"
  },
  amber: {
    id: "amber",
    label: "Kehribar / VIP",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    previewBg: "#f59e0b"
  },
  emerald: {
    id: "emerald",
    label: "Zümrüt / Başarılı",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    previewBg: "#10b981"
  },
  sky: {
    id: "sky",
    label: "Gök Mavisi / Bilgi",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    previewBg: "#0284c7"
  },
  indigo: {
    id: "indigo",
    label: "İndigo / Kurumsal",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    previewBg: "#6366f1"
  },
  purple: {
    id: "purple",
    label: "Mor / Randevu",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    previewBg: "#a855f7"
  },
  teal: {
    id: "teal",
    label: "Turkuaz / Servis",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    previewBg: "#14b8a6"
  },
  orange: {
    id: "orange",
    label: "Turuncu / Sıcak",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    previewBg: "#f97316"
  },
  pink: {
    id: "pink",
    label: "Pembe / Özel",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
    dot: "bg-pink-500",
    badge: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
    previewBg: "#ec4899"
  },
  blue: {
    id: "blue",
    label: "Mavi / Standart",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    previewBg: "#3b82f6"
  },
  violet: {
    id: "violet",
    label: "Menekşe / Stratejik",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
    previewBg: "#8b5cf6"
  },
  slate: {
    id: "slate",
    label: "Gri / Genel",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    previewBg: "#64748b"
  }
};

// Default CRM presets
export const DEFAULT_CRM_TAG_PRESETS: { name: string; color: LeadTagColor }[] = [
  { name: "VIP Müşteri", color: "amber" },
  { name: "Acil / Yolda", color: "rose" },
  { name: "Kurumsal", color: "indigo" },
  { name: "Sıcak Takip", color: "orange" },
  { name: "Fiyat Bekliyor", color: "sky" },
  { name: "Randevu Alındı", color: "purple" },
  { name: "Satış Tamamlandı", color: "emerald" },
  { name: "Özel Servis", color: "teal" },
  { name: "Referans Müşteri", color: "pink" },
  { name: "Kararsız / Düşünüyor", color: "slate" }
];

export const POPULAR_CRM_TAGS = DEFAULT_CRM_TAG_PRESETS.map((p) => p.name);

// Style resolver prioritizing custom assigned color, then keyword heuristics, then string hashing
export function getLeadTagStyle(
  tag: string,
  specificColor?: string
): { bg: string; text: string; border: string; dot: string; previewBg: string } {
  // If a valid specific color key was provided
  if (specificColor && LEAD_TAG_PALETTES[specificColor.toLowerCase() as LeadTagColor]) {
    return LEAD_TAG_PALETTES[specificColor.toLowerCase() as LeadTagColor];
  }

  // If the tag name itself matches a palette key
  if (LEAD_TAG_PALETTES[tag.toLowerCase() as LeadTagColor]) {
    return LEAD_TAG_PALETTES[tag.toLowerCase() as LeadTagColor];
  }

  const normalized = (tag || "").toLowerCase();

  if (normalized.includes("vip") || normalized.includes("önemli") || normalized.includes("özel")) {
    return LEAD_TAG_PALETTES.amber;
  }
  if (
    normalized.includes("acil") ||
    normalized.includes("kritik") ||
    normalized.includes("hemen") ||
    normalized.includes("yolda")
  ) {
    return LEAD_TAG_PALETTES.rose;
  }
  if (
    normalized.includes("kurumsal") ||
    normalized.includes("filo") ||
    normalized.includes("şirket") ||
    normalized.includes("b2b")
  ) {
    return LEAD_TAG_PALETTES.indigo;
  }
  if (
    normalized.includes("satış") ||
    normalized.includes("tamamlandı") ||
    normalized.includes("memnun") ||
    normalized.includes("anlaşma")
  ) {
    return LEAD_TAG_PALETTES.emerald;
  }
  if (
    normalized.includes("fiyat") ||
    normalized.includes("teklif") ||
    normalized.includes("bekliyor")
  ) {
    return LEAD_TAG_PALETTES.sky;
  }
  if (normalized.includes("randevu") || normalized.includes("planlı")) {
    return LEAD_TAG_PALETTES.purple;
  }
  if (normalized.includes("sıcak") || normalized.includes("takip")) {
    return LEAD_TAG_PALETTES.orange;
  }
  if (normalized.includes("referans") || normalized.includes("tavsiye")) {
    return LEAD_TAG_PALETTES.pink;
  }

  // Fallback hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorKeys = Object.keys(LEAD_TAG_PALETTES) as LeadTagColor[];
  const selectedKey = colorKeys[Math.abs(hash) % colorKeys.length];
  return LEAD_TAG_PALETTES[selectedKey];
}

// Backwards-compatible alias
export function getTagColorClass(tag: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  return getLeadTagStyle(tag);
}

export interface LeadTagsManagerProps {
  leadId: string;
  tags?: string[];
  customTags?: LeadCustomTag[];
  allAvailableTags?: LeadCustomTag[];
  onAddTag: (tag: string | { name: string; color: string }) => void;
  onRemoveTag: (tag: string) => void;
  allExistingTags?: string[];
  onOpenManageModal?: () => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const LeadTagsManager: React.FC<LeadTagsManagerProps> = ({
  leadId,
  tags = [],
  customTags = [],
  allAvailableTags = [],
  onAddTag,
  onRemoveTag,
  allExistingTags,
  onOpenManageModal,
  readOnly = false,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<LeadTagColor>("indigo");
  const [filterQuery, setFilterQuery] = useState("");
  const [showColorSelector, setShowColorSelector] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowColorSelector(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Combine tags to display: prioritize customTags, merge legacy tags
  const activeTagsMap = new Map<string, { name: string; color: string }>();

  // 1. From customTags
  customTags.forEach((ct) => {
    activeTagsMap.set(ct.name.toLowerCase(), { name: ct.name, color: ct.color });
  });

  // 2. From string tags
  tags.forEach((t) => {
    const key = t.toLowerCase();
    if (!activeTagsMap.has(key)) {
      // Check if this tag has a defined color in allAvailableTags
      const def = allAvailableTags.find((at) => at.name.toLowerCase() === key);
      activeTagsMap.set(key, { name: t, color: def ? def.color : "blue" });
    }
  });

  const activeTagsList = Array.from(activeTagsMap.values());

  // Build master list of suggestions from allAvailableTags and DEFAULT_CRM_TAG_PRESETS
  const suggestionMap = new Map<string, { name: string; color: string }>();

  // Definitions
  allAvailableTags.forEach((at) => {
    suggestionMap.set(at.name.toLowerCase(), { name: at.name, color: at.color });
  });

  // Also include backward-compatible allExistingTags if provided
  if (allExistingTags) {
    allExistingTags.forEach((t) => {
      const key = t.toLowerCase();
      if (!suggestionMap.has(key)) {
        suggestionMap.set(key, { name: t, color: "blue" });
      }
    });
  }

  // Also include default presets
  DEFAULT_CRM_TAG_PRESETS.forEach((preset) => {
    if (!suggestionMap.has(preset.name.toLowerCase())) {
      suggestionMap.set(preset.name.toLowerCase(), preset);
    }
  });

  const allSuggestions = Array.from(suggestionMap.values());

  const filteredSuggestions = allSuggestions.filter((s) =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase().trim())
  );

  // Handler to toggle an existing tag
  const handleToggleTag = (tagItem: { name: string; color: string }) => {
    const isAlreadyOnLead = activeTagsList.some(
      (t) => t.name.toLowerCase() === tagItem.name.toLowerCase()
    );

    if (isAlreadyOnLead) {
      onRemoveTag(tagItem.name);
    } else {
      onAddTag(tagItem);
    }
  };

  // Handler to create a new custom color tag
  const handleCreateNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) return;

    onAddTag({ name: cleanName, color: selectedColor });
    setNewTagName("");
    setFilterQuery("");
    setShowColorSelector(false);
  };

  const previewStyle = getLeadTagStyle(newTagName || "Örnek", selectedColor);

  return (
    <div ref={containerRef} className="relative inline-flex flex-wrap items-center gap-1.5">
      {/* RENDER ACTIVE TAGS */}
      {activeTagsList.map((tagItem) => {
        const style = getLeadTagStyle(tagItem.name, tagItem.color);

        return (
          <span
            key={tagItem.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-semibold transition-all group ${
              compact ? "text-[10px]" : "text-[11px]"
            } ${style.bg} ${style.text} ${style.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
            <span className="truncate max-w-[130px]">{tagItem.name}</span>

            {!readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(tagItem.name);
                }}
                className="opacity-50 group-hover:opacity-100 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-opacity cursor-pointer"
                title={`"${tagItem.name}" etiketini kaldır`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        );
      })}

      {/* ADD / MANAGE TAG BUTTON */}
      {!readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all cursor-pointer ${
            compact ? "text-[10px]" : "text-[11px]"
          } font-bold`}
          title="Etiket ata veya yeni oluştur"
        >
          <Plus className="w-3 h-3" />
          <span>{activeTagsList.length === 0 ? "Etiket Ekle" : ""}</span>
        </button>
      )}

      {/* INTERACTIVE POPOVER */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1.5 z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>CRM Etiketi Ata</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form: Create new color-coded tag */}
          <form onSubmit={handleCreateNewTag} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setFilterQuery(e.target.value);
                  }}
                  placeholder="Etiket adı..."
                  maxLength={30}
                  className="w-full pl-2.5 pr-8 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {newTagName && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTagName("");
                      setFilterQuery("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Color button / toggle */}
              <button
                type="button"
                onClick={() => setShowColorSelector(!showColorSelector)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-2xs"
                style={{ backgroundColor: LEAD_TAG_PALETTES[selectedColor]?.previewBg }}
                title={`Renk: ${LEAD_TAG_PALETTES[selectedColor]?.label}`}
              >
                <Palette className="w-3.5 h-3.5 text-white drop-shadow-xs" />
              </button>

              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>

            {/* Color swatches dropdown */}
            {showColorSelector && (
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>Renk Seçin</span>
                  <span className="text-slate-400">{LEAD_TAG_PALETTES[selectedColor]?.label}</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {(Object.keys(LEAD_TAG_PALETTES) as LeadTagColor[]).map((cKey) => {
                    const cPal = LEAD_TAG_PALETTES[cKey];
                    const isPicked = selectedColor === cKey;

                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => {
                          setSelectedColor(cKey);
                          setShowColorSelector(false);
                        }}
                        className={`h-6 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                          isPicked ? "ring-2 ring-indigo-600 scale-105" : "hover:scale-110 opacity-85"
                        }`}
                        style={{ backgroundColor: cPal.previewBg }}
                        title={cPal.label}
                      >
                        {isPicked && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live badge preview */}
            {newTagName.trim() && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <span>Önizleme:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${previewStyle.bg} ${previewStyle.text} ${previewStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${previewStyle.dot}`} />
                  <span>{newTagName.trim()}</span>
                </span>
              </div>
            )}
          </form>

          {/* Quick select from available tags */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mevcut Etiketler (Tıkla & Ata)
            </span>

            <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
              {filteredSuggestions.length === 0 ? (
                <span className="text-[11px] text-slate-400 italic py-1">
                  Eşleşen etiket bulunamadı.
                </span>
              ) : (
                filteredSuggestions.map((sug) => {
                  const isAssigned = activeTagsList.some(
                    (t) => t.name.toLowerCase() === sug.name.toLowerCase()
                  );
                  const style = getLeadTagStyle(sug.name, sug.color);

                  return (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => handleToggleTag(sug)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        isAssigned
                          ? `${style.bg} ${style.text} ${style.border} ring-2 ring-indigo-500 font-bold`
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                      title={isAssigned ? "Kaldırmak için tıkla" : "Bu talebe atamak için tıkla"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span>{sug.name}</span>
                      {isAssigned ? (
                        <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-0.5" />
                      ) : (
                        <Plus className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 ml-0.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer with link to manage global tags */}
          {onOpenManageModal && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageModal();
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>Tüm Etiketleri & Renkleri Yönet</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
