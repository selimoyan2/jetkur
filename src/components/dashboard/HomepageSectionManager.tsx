/**
 * JetKur Canonical Homepage Section Manager Component (Sprint 12)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. Ana sayfa bloklarını yukarı/aşağı taşıyacak veya gizleyecek;
 * CSS, padding, margin, container gibi teknik detaylara maruz kalmayacak."
 *
 * Architecture:
 * - Uses CANONICAL_SECTION_DEFINITIONS from Section Registry (Sprint 06 authority)
 * - Protects structural sections (Header & Footer cannot be disabled or moved)
 * - Supports simple MoveUp / MoveDown reordering
 * - Supports variant selection from allowedVariants in Section Registry
 * - Supports Section Hide/Show
 */

import React from "react";
import { SiteConfig, HomepageSectionConfig } from "../../types";
import { CANONICAL_SECTION_DEFINITIONS } from "../../domain/sections/registry";
import {
  LayoutTemplate,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Sliders,
  Shield,
  Check,
  Sparkles,
} from "lucide-react";

interface HomepageSectionManagerProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  readOnly?: boolean;
}

export const HomepageSectionManager: React.FC<HomepageSectionManagerProps> = ({
  config,
  onChange,
  readOnly = false,
}) => {
  const sections = config.homepageSections || [];

  // Helper: map a section to its definition in registry
  const getDefinition = (secId: string) => {
    const cleanId = secId.replace(/-(v\d+|grid-\w+|service-\w+|urgent-\w+)$/, "");
    return (
      CANONICAL_SECTION_DEFINITIONS.find(
        (def) =>
          def.id === secId ||
          def.id === cleanId ||
          def.legacyAliases?.includes(secId) ||
          def.legacyAliases?.includes(cleanId)
      ) ||
      CANONICAL_SECTION_DEFINITIONS.find((def) => secId.startsWith(def.id))
    );
  };

  const handleToggle = (secId: string) => {
    if (readOnly) return;
    const def = getDefinition(secId);
    if (def?.capabilities.isStructural || def?.capabilities.canDisable === false) {
      return; // Structural cannot be disabled
    }

    const updated = sections.map((sec) =>
      sec.id === secId ? { ...sec, enabled: !sec.enabled } : sec
    );
    onChange({ ...config, homepageSections: updated });
  };

  const handleMoveUp = (index: number) => {
    if (readOnly || index <= 0) return;
    const target = sections[index];
    const prev = sections[index - 1];

    const targetDef = getDefinition(target.id);
    const prevDef = getDefinition(prev.id);

    // Structural sections cannot move
    if (targetDef?.capabilities.isStructural || prevDef?.capabilities.isStructural) {
      return;
    }

    const newSections = [...sections];
    newSections[index - 1] = target;
    newSections[index] = prev;

    onChange({ ...config, homepageSections: newSections });
  };

  const handleMoveDown = (index: number) => {
    if (readOnly || index >= sections.length - 1) return;
    const target = sections[index];
    const next = sections[index + 1];

    const targetDef = getDefinition(target.id);
    const nextDef = getDefinition(next.id);

    if (targetDef?.capabilities.isStructural || nextDef?.capabilities.isStructural) {
      return;
    }

    const newSections = [...sections];
    newSections[index + 1] = target;
    newSections[index] = next;

    onChange({ ...config, homepageSections: newSections });
  };

  const handleVariantChange = (secId: string, variantId: string) => {
    if (readOnly) return;
    const def = getDefinition(secId);
    if (def && !def.allowedVariants.includes(variantId)) {
      return; // Block unallowed variants
    }

    const updated = sections.map((sec) =>
      sec.id === secId ? { ...sec, variant: variantId } : sec
    );
    onChange({ ...config, homepageSections: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <LayoutTemplate className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Ana Sayfa Bölüm Düzeni</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Web sitenizin ana sayfasındaki içerik bloklarının sırasını ve görünürlüğünü yönetin. 
          Yukarı ve aşağı oklarla bölümlerin sırasını değiştirebilir veya istemediğiniz bölümleri gizleyebilirsiniz.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, index) => {
          const def = getDefinition(sec.id);
          const isStructural = def?.capabilities.isStructural || def?.capabilities.canReorder === false;
          const isFirstMovable = index === 0 || sections.slice(0, index).every((s) => getDefinition(s.id)?.capabilities.isStructural);
          const isLastMovable = index === sections.length - 1 || sections.slice(index + 1).every((s) => getDefinition(s.id)?.capabilities.isStructural);

          return (
            <div
              key={sec.id}
              className={`p-4 rounded-2xl border transition-all ${
                sec.enabled
                  ? "bg-white border-slate-200 shadow-xs"
                  : "bg-slate-50 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {def?.label || sec.title || sec.id}
                      </h4>
                      {isStructural && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          <Shield className="w-3 h-3 text-slate-400" />
                          Sabit Yapı
                        </span>
                      )}
                      {!sec.enabled && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                          Gizli
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {def?.description || "Ana sayfa içerik bileşeni"}
                    </p>
                  </div>
                </div>

                {/* Actions: Move Up / Down / Toggle / Variant */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Variant Selection if available */}
                  {def && def.variants.length > 1 && sec.enabled && !readOnly && (
                    <div className="flex items-center gap-1 mr-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sec.variant || def.defaultVariant}
                        onChange={(e) => handleVariantChange(sec.id, e.target.value)}
                        className="text-xs font-medium py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-amber-500"
                      >
                        {def.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Move Up */}
                  {!isStructural && !readOnly && (
                    <button
                      type="button"
                      disabled={isFirstMovable}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Yukarı Taşı"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                  )}

                  {/* Move Down */}
                  {!isStructural && !readOnly && (
                    <button
                      type="button"
                      disabled={isLastMovable}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Aşağı Taşı"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  )}

                  {/* Toggle Visibility */}
                  {!isStructural && !readOnly && (
                    <button
                      type="button"
                      onClick={() => handleToggle(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        sec.enabled
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                      }`}
                    >
                      {sec.enabled ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Gizle</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Göster</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
