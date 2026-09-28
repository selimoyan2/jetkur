/**
 * JetKur Canonical Customer Content Hub (Sprint 12)
 *
 * Core Product Principle:
 * "Kullanıcı içeriği anlamına göre yönetir: Hizmetler, İşletme Profili, SSS, Yorumlar, Galeri vb."
 *
 * Architecture:
 * - Sub-navigates into canonical content editors
 * - Defaults to Services and Business Profile
 * - Reuses ServiceManager, TestimonialsManager, FaqManager, GalleryManager
 */

import React, { useState } from "react";
import { SiteConfig } from "../../types";
import { BusinessProfileEditor } from "./BusinessProfileEditor";
import { ServiceManager } from "./ServiceManager";
import { FaqManager } from "./FaqManager";
import { TestimonialsManager } from "./TestimonialsManager";
import { GalleryManager } from "./GalleryManager";
import { SECONDARY_CONTENT_EDITORS } from "../../domain/dashboard/navigation";
import {
  FileText,
  Building2,
  Wrench,
  HelpCircle,
  Star,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";

interface CustomerContentHubProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onPreview: () => void;
  readOnly?: boolean;
}

export const CustomerContentHub: React.FC<CustomerContentHubProps> = ({
  config,
  onChange,
  onPreview,
  readOnly = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "business-profile" | "services" | "faqs" | "testimonials" | "gallery"
  >("services");

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar for Content */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveSubTab("services")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "services"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>Hizmetler ({config.services?.items?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("business-profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "business-profile"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>İşletme Profili &amp; İletişim</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("faqs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "faqs"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Sıkça Sorulanlar (SSS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("testimonials")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "testimonials"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Star className="w-4 h-4 text-amber-500" />
          <span>Müşteri Yorumları</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("gallery")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "gallery"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-4 h-4 text-indigo-500" />
          <span>Fotoğraf Galerisi</span>
        </button>
      </div>

      {/* Content Rendering based on Sub Tab */}
      <div>
        {activeSubTab === "services" && (
          <ServiceManager config={config} onChange={onChange} />
        )}

        {activeSubTab === "business-profile" && (
          <BusinessProfileEditor
            config={config}
            onChange={onChange}
            readOnly={readOnly}
          />
        )}

        {activeSubTab === "faqs" && (
          <FaqManager config={config} onChange={onChange} />
        )}

        {activeSubTab === "testimonials" && (
          <TestimonialsManager config={config} onChange={onChange} />
        )}

        {activeSubTab === "gallery" && (
          <GalleryManager config={config} onChange={onChange} />
        )}
      </div>
    </div>
  );
};
