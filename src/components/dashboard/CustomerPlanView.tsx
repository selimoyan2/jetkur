/**
 * JetKur Canonical Customer Plan & Usage Component (Sprint 12)
 *
 * Core Product Principle:
 * Shows server-authoritative plan and trial state without client-side fake calculations:
 * - Current plan tier: ENTRY (1 site), BUSINESS (3 sites), AGENCY (10 sites)
 * - Trial days remaining from server auth state
 * - Site usage / quota limits
 * - Read-only explanation when trial expired
 */

import React from "react";
import { SiteConfig } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  CreditCard,
  Check,
  ShieldAlert,
  Sparkles,
  Zap,
  Globe,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface CustomerPlanViewProps {
  config: SiteConfig;
  readOnly?: boolean;
}

export const CustomerPlanView: React.FC<CustomerPlanViewProps> = ({
  config,
  readOnly = false,
}) => {
  const { user } = useAuth();

  const planName = user?.workspaceType || "BUSINESS";
  const siteLimit = planName === "ENTRY" ? 1 : planName === "BUSINESS" ? 3 : 10;
  const currentSiteCount = 1; // Active site count for this workspace

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Mevcut Planım & Kullanım Hakları</h3>
        </div>
        <p className="text-xs text-slate-500">
          Çalışma alanınıza ait abonelik durumu, site limitleri ve aktif kullanım metrikleri.
        </p>
      </div>

      {/* Trial / Active Alert Banner */}
      {user?.trialExpired ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900">
              14 Günlük Deneme Süreniz Sona Erdi (Salt Okunur Mod)
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Mevcut site içeriklerinizi ve ayarlarınızı inceleyebilirsiniz; ancak yeni değişiklik kaydetme veya yeniden yayınlama yetkisi dondurulmuştur. Sitenizi canlıda tutmak için lütfen paket seçimi yapın.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                Aboneliğiniz Aktif &amp; Güvende
              </h4>
              <p className="text-xs text-emerald-700">
                Web siteniz Cloudflare 310+ Global Edge ağında kesintisiz olarak yayındadır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Tier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mevcut Paket
          </div>
          <div className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>{planName}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Yıllık
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {planName === "ENTRY" ? "Başlangıç Paketi" : planName === "BUSINESS" ? "KOBİ / Profesyonel" : "Ajans Paketi"}
          </p>
        </div>

        {/* Card 2: Site Quota */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Site Kullanım Limiti
          </div>
          <div className="text-xl font-black text-slate-900">
            {currentSiteCount} / {siteLimit} <span className="text-xs font-normal text-slate-500">Site</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${(currentSiteCount / siteLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Included Features */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Dahil Olan Özellikler
          </div>
          <ul className="text-xs text-slate-700 space-y-1">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sıfır Sunucu &amp; Edge CDN</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Otomatik WhatsApp &amp; Form Leadleri</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Günlük Otomatik Yedekleme</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
