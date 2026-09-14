import React, { useState } from "react";
import {
  Tag,
  X,
  Plus,
  Trash2,
  Check,
  Palette,
  Sparkles,
  Users,
  Search
} from "lucide-react";
import { SiteConfig, FormLead, LeadCustomTag, LeadTagColor } from "../../types";
import {
  LEAD_TAG_PALETTES,
  getLeadTagStyle,
  DEFAULT_CRM_TAG_PRESETS
} from "./LeadTagsManager";

interface ManageLeadTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onUpdateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onFilterByTag?: (tagName: string) => void;
}

export const ManageLeadTagsModal: React.FC<ManageLeadTagsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onFilterByTag
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<LeadTagColor>("amber");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTagColorId, setEditingTagColorId] = useState<string | null>(null);
  const [editingTagNameId, setEditingTagNameId] = useState<string | null>(null);
  const [editedNameValue, setEditedNameValue] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gather all unique tags from config.leadTagDefinitions and from all config.leads
  const definedTags = config.leadTagDefinitions || [];
  const leads = config.leads || [];

  // Build a complete map of all tags present in system
  const tagMap = new Map<string, { id: string; name: string; color: string; count: number }>();

  // 1. From definitions
  definedTags.forEach((t) => {
    tagMap.set(t.name.toLowerCase(), {
      id: t.id || `tag-${t.name}`,
      name: t.name,
      color: t.color,
      count: 0
    });
  });

  // 2. From leads customTags
  leads.forEach((lead) => {
    (lead.customTags || []).forEach((ct) => {
      const key = ct.name.toLowerCase();
      const existing = tagMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(key, {
          id: ct.id || `tag-${ct.name}`,
          name: ct.name,
          color: ct.color,
          count: 1
        });
      }
    });

    // 3. From legacy tags
    (lead.tags || []).forEach((t) => {
      const key = t.toLowerCase();
      const existing = tagMap.get(key);
      if (existing) {
        if (!lead.customTags?.some((ct) => ct.name.toLowerCase() === key)) {
          existing.count += 1;
        }
      } else {
        tagMap.set(key, {
          id: `tag-${t}`,
          name: t,
          color: "blue",
          count: 1
        });
      }
    });
  });

  const allTagsList = Array.from(tagMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const filteredTags = allTagsList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Total usages
  const totalTagAssignments = allTagsList.reduce((sum, t) => sum + t.count, 0);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Create or add a new color-coded tag
  const handleCreateTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) return;

    if (allTagsList.some((t) => t.name.toLowerCase() === cleanName.toLowerCase())) {
      alert(`"${cleanName}" adında bir etiket zaten mevcut.`);
      return;
    }

    const newTagObj: LeadCustomTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      color: newTagColor,
      createdAt: new Date().toISOString()
    };

    onUpdateConfig((prev) => {
      const existingDefs = prev.leadTagDefinitions || [];
      return {
        ...prev,
        leadTagDefinitions: [...existingDefs, newTagObj]
      };
    });

    setNewTagName("");
    showFeedback(`"${cleanName}" renkli etiketi başarıyla oluşturuldu!`);
  };

  // Change color of a tag across definitions and all leads
  const handleChangeColor = (tagName: string, newColor: LeadTagColor) => {
    onUpdateConfig((prev) => {
      // 1. Update leadTagDefinitions
      const existingDefs = prev.leadTagDefinitions || [];
      const updatedDefs = existingDefs.map((def) =>
        def.name.toLowerCase() === tagName.toLowerCase() ? { ...def, color: newColor } : def
      );

      // If not present in definitions, add it
      if (!updatedDefs.some((d) => d.name.toLowerCase() === tagName.toLowerCase())) {
        updatedDefs.push({
          id: `tag-${Date.now()}`,
          name: tagName,
          color: newColor
        });
      }

      // 2. Update all leads that contain this tag in customTags
      const updatedLeads = (prev.leads || []).map((lead) => {
        const hasTag = (lead.tags || []).some(
          (t) => t.toLowerCase() === tagName.toLowerCase()
        );
        if (!hasTag) return lead;

        const updatedCustomTags = (lead.customTags || []).map((ct) =>
          ct.name.toLowerCase() === tagName.toLowerCase()
            ? { ...ct, color: newColor }
            : ct
        );

        // If tag wasn't in customTags, add it
        if (!updatedCustomTags.some((ct) => ct.name.toLowerCase() === tagName.toLowerCase())) {
          updatedCustomTags.push({
            id: `ct-${Date.now()}`,
            name: tagName,
            color: newColor
          });
        }

        return {
          ...lead,
          customTags: updatedCustomTags
        };
      });

      return {
        ...prev,
        leadTagDefinitions: updatedDefs,
        leads: updatedLeads
      };
    });

    setEditingTagColorId(null);
    showFeedback(`"${tagName}" etiketinin rengi güncellendi.`);
  };

  // Rename a tag across definitions and all leads
  const handleRenameTag = (oldName: string, newName: string) => {
    const cleanNew = newName.trim();
    if (!cleanNew || cleanNew.toLowerCase() === oldName.toLowerCase()) {
      setEditingTagNameId(null);
      return;
    }

    onUpdateConfig((prev) => {
      const updatedDefs = (prev.leadTagDefinitions || []).map((def) =>
        def.name.toLowerCase() === oldName.toLowerCase()
          ? { ...def, name: cleanNew }
          : def
      );

      const updatedLeads = (prev.leads || []).map((lead) => {
        const hasTag = (lead.tags || []).some(
          (t) => t.toLowerCase() === oldName.toLowerCase()
        );
        if (!hasTag) return lead;

        const updatedTags = (lead.tags || []).map((t) =>
          t.toLowerCase() === oldName.toLowerCase() ? cleanNew : t
        );

        const updatedCustomTags = (lead.customTags || []).map((ct) =>
          ct.name.toLowerCase() === oldName.toLowerCase()
            ? { ...ct, name: cleanNew }
            : ct
        );

        return {
          ...lead,
          tags: updatedTags,
          customTags: updatedCustomTags
        };
      });

      return {
        ...prev,
        leadTagDefinitions: updatedDefs,
        leads: updatedLeads
      };
    });

    setEditingTagNameId(null);
    showFeedback(`"${oldName}" etiketi "${cleanNew}" olarak güncellendi.`);
  };

  // Delete a tag from definitions and all leads
  const handleDeleteTag = (tagName: string) => {
    const affectedCount = tagMap.get(tagName.toLowerCase())?.count || 0;
    const confirmMsg =
      affectedCount > 0
        ? `"${tagName}" etiketini silmek istediğinize emin misiniz? Bu etiket ${affectedCount} adet müşteri talebinden kaldırılacaktır.`
        : `"${tagName}" etiketini silmek istediğinize emin misiniz?`;

    if (!window.confirm(confirmMsg)) return;

    onUpdateConfig((prev) => {
      const updatedDefs = (prev.leadTagDefinitions || []).filter(
        (def) => def.name.toLowerCase() !== tagName.toLowerCase()
      );

      const updatedLeads = (prev.leads || []).map((lead) => {
        const updatedTags = (lead.tags || []).filter(
          (t) => t.toLowerCase() !== tagName.toLowerCase()
        );
        const updatedCustomTags = (lead.customTags || []).filter(
          (ct) => ct.name.toLowerCase() !== tagName.toLowerCase()
        );
        return {
          ...lead,
          tags: updatedTags,
          customTags: updatedCustomTags
        };
      });

      return {
        ...prev,
        leadTagDefinitions: updatedDefs,
        leads: updatedLeads
      };
    });

    showFeedback(`"${tagName}" etiketi sistemden silindi.`);
  };

  const previewStyle = getLeadTagStyle(newTagName || "Örnek Etiket", newTagColor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>CRM Müşteri Etiketleri & Renk Kodları</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {allTagsList.length} Etiket
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gelen teklif ve form taleplerini renk kodlarıyla etiketleyin, düzenleyin ve siteConfig nesnelerinde saklayın.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {feedbackMsg && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: CREATE NEW COLOR-CODED TAG */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/20 border border-indigo-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Yeni Renkli Etiket Tanımla</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span>Canlı Görünüm:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold shadow-2xs ${previewStyle.bg} ${previewStyle.text} ${previewStyle.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${previewStyle.dot}`} />
                  <span>{newTagName.trim() || "Örnek Etiket"}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Etiket adı yazın (Örn: VIP Müşteri, Öncelikli, Filo Teklifi)..."
                    maxLength={35}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {newTagName && (
                    <button
                      type="button"
                      onClick={() => setNewTagName("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!newTagName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Etiketi Oluştur</span>
                </button>
              </div>

              {/* COLOR PALETTE SWATCH PICKER */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Renk Seçin:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({LEAD_TAG_PALETTES[newTagColor]?.label})
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {(Object.keys(LEAD_TAG_PALETTES) as LeadTagColor[]).map((colorKey) => {
                    const pal = LEAD_TAG_PALETTES[colorKey];
                    const isSelected = newTagColor === colorKey;

                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewTagColor(colorKey)}
                        className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                          isSelected
                            ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-sm"
                            : "hover:scale-105 opacity-85 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: pal.previewBg }}
                        title={pal.label}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* SECTION 2: SYSTEM AND EXISTING TAGS LIST */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Mevcut Etiketler Listesi ({filteredTags.length})
                </h4>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{totalTagAssignments} atama</span>
                </span>
              </div>

              {/* Fast search filter */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Etiketlerde ara..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {filteredTags.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-slate-400 space-y-1">
                <Tag className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {searchQuery ? "Aramaya uygun etiket bulunamadı" : "Henüz etiket tanımlanmadı"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Yukarıdaki formu kullanarak ilk özel CRM etiketinizi oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredTags.map((tagItem) => {
                  const style = getLeadTagStyle(tagItem.name, tagItem.color);
                  const isEditingColor = editingTagColorId === tagItem.name;
                  const isEditingName = editingTagNameId === tagItem.name;

                  return (
                    <div
                      key={tagItem.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Left: Tag Badge & Usage Count */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Inline color picker trigger button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTagColorId(isEditingColor ? null : tagItem.name)
                            }
                            className="w-6 h-6 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                            style={{ backgroundColor: style.previewBg || "#6366f1" }}
                            title="Rengi değiştir"
                          >
                            <Palette className="w-3 h-3 text-white drop-shadow-xs" />
                          </button>

                          {/* Inline Color Picker Popover */}
                          {isEditingColor && (
                            <div className="absolute left-0 top-full mt-2 z-30 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl w-60 space-y-1.5 animate-in fade-in">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                  Yeni Renk Seçin
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingTagColorId(null)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-6 gap-1.5 pt-1">
                                {(Object.keys(LEAD_TAG_PALETTES) as LeadTagColor[]).map((cKey) => {
                                  const cPal = LEAD_TAG_PALETTES[cKey];
                                  return (
                                    <button
                                      key={cKey}
                                      type="button"
                                      onClick={() => handleChangeColor(tagItem.name, cKey)}
                                      className={`h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer flex items-center justify-center ${
                                        tagItem.color === cKey ? "ring-2 ring-indigo-600 scale-105" : ""
                                      }`}
                                      style={{ backgroundColor: cPal.previewBg }}
                                      title={cPal.label}
                                    >
                                      {tagItem.color === cKey && (
                                        <Check className="w-3 h-3 text-white drop-shadow-xs" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tag Name / Rename Input */}
                        {isEditingName ? (
                          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                            <input
                              type="text"
                              value={editedNameValue}
                              onChange={(e) => setEditedNameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameTag(tagItem.name, editedNameValue);
                                if (e.key === "Escape") setEditingTagNameId(null);
                              }}
                              autoFocus
                              className="px-2 py-1 rounded-lg border border-indigo-400 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameTag(tagItem.name, editedNameValue)}
                              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTagNameId(null)}
                              className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                              <span>{tagItem.name}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingTagNameId(tagItem.name);
                                setEditedNameValue(tagItem.name);
                              }}
                              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                              title="Etiketi yeniden adlandır"
                            >
                              Yeniden Adlandır
                            </button>
                          </div>
                        )}

                        {/* Usage counter badge */}
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          {tagItem.count > 0 ? (
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {tagItem.count} talepte kullanılıyor
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Henüz atanmadı</span>
                          )}
                        </span>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {onFilterByTag && tagItem.count > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onFilterByTag(tagItem.name);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 text-[11px] font-bold transition-colors cursor-pointer"
                            title={`Taleplerde "${tagItem.name}" etiketine göre filtrele`}
                          >
                            Talepleri Listele
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tagItem.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Etiketi sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: QUICK POPULAR PRESETS */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hızlı Şablon Etiketler</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_CRM_TAG_PRESETS.map((preset) => {
                const alreadyExists = allTagsList.some(
                  (t) => t.name.toLowerCase() === preset.name.toLowerCase()
                );
                if (alreadyExists) return null;

                const style = getLeadTagStyle(preset.name, preset.color);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setNewTagName(preset.name);
                      setNewTagColor(preset.color);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold hover:scale-105 transition-all cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                    title={`"${preset.name}" şablonunu seç`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span>{preset.name}</span>
                    <Plus className="w-3 h-3 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tüm etiket atamaları ve renk kodları doğrudan <code className="font-mono text-indigo-600 font-bold">siteConfig.leads</code> içinde kaydedilir.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tamamla & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
