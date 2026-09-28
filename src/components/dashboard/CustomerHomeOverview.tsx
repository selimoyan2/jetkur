/**
 * JetKur Canonical Customer Home Overview (Sprint 12)
 *
 * Core Product Principle:
 * The dashboard answers five simple questions:
 * 1. Sitem nasıl görünüyor? (Site Card & Preview)
 * 2. İşletme bilgilerimi nereden değiştiririm? (Quick Action: İşletme Bilgileri)
 * 3. Hizmetlerimi/içeriğimi nereden değiştiririm? (Quick Action: Hizmetler)
 * 4. Tasarımımı nasıl değiştiririm? (Quick Action: Tasarım & Şablon)
 * 5. Sitemi nasıl yayınlarım / durumunu nasıl görürüm? (Site Card: Yayın Durumu & Yayınla)
 *
 * Subtraction & Simplification:
 * - No dense technical widgets, SEO radar charts or analytics overload on home
 * - Prominent Site Card with customer language: "Yayında", "Taslak", "Güncelleniyor"
 * - Short list of clear Quick Actions
 * - Important notification alerts (new form leads)
 */

import React from "react";
import { SiteConfig } from "../../types";
import {
  Globe,
  ExternalLink,
  Eye,
  Rocket,
  Building2,
  Wrench,
  Palette,
  LayoutTemplate,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";

interface CustomerHomeOverviewProps {
  config: SiteConfig;
  onNavigateTab: (tabId: string) => void;
  onPreview: () => void;
  onDeploy: () => void;
  readOnly?: boolean;
}

export const CustomerHomeOverview: React.FC<CustomerHomeOverviewProps> = ({
  config,
  onNavigateTab,
  onPreview,
  onDeploy,
  readOnly = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const domain = config.cloudflare?.customDomain || `${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`;
  const siteStatus = config.deploymentStatus === "DEPLOYED" ? "Yayında" : "Taslak";
  const unreadLeadsCount = (config.leads || []).filter((l) => l.status === "new").length;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${domain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. PRIMARY SITE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Business Info & Status */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-md">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt={config.companyName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {(config.companyName || "J").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {config.companyName || "Web Sitem"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    siteStatus === "Yayında"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      siteStatus === "Yayında" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{siteStatus}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-mono text-slate-700 font-bold">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{domain}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Kopyalandı" : "Adresi Kopyala"}</span>
                </button>
                <span>•</span>
                <span>Şablon: <strong className="text-slate-800">{config.theme || "Hızlı Servis"}</strong></span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-stretch lg:self-center">
            <button
              type="button"
              onClick={onPreview}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Siteyi Gör</span>
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={onDeploy}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>{siteStatus === "Yayında" ? "Değişiklikleri Yayınla" : "Sitemi Yayınla"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. IMPORTANT NOTIFICATIONS (IF ANY) */}
      {unreadLeadsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {unreadLeadsCount}
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                {unreadLeadsCount} Adet Yeni Müşteri Talebi Bekliyor
              </h4>
              <p className="text-[11px] text-rose-700">
                Web sitenizdeki iletişim veya randevu formlarından yeni talepler ulaştı.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("leads")}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
          >
            Talepleri İncele →
          </button>
        </div>
      )}

      {/* 3. QUICK ACTIONS (HIZLI İŞLEMLER) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Hızlı İşlemler
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Action 1: Business Profile */}
          <button
            type="button"
            onClick={() => onNavigateTab("content")}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">İşletme Bilgileri</h4>
            <p className="text-xs text-slate-500">
              Telefon, WhatsApp, adres ve çalışma saatlerinizi güncelleyin.
            </p>
          </button>

          {/* Quick Action 2: Services */}
          <button
            type="button"
            onClick={() => onNavigateTab("content")}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Hizmetleri Düzenle</h4>
            <p className="text-xs text-slate-500">
              Sunduğunuz hizmetleri ekleyin, silin veya fiyatları değiştirin.
            </p>
          </button>

          {/* Quick Action 3: Design & Brand */}
          <button
            type="button"
            onClick={() => onNavigateTab("design")}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Tasarımı Değiştir</h4>
            <p className="text-xs text-slate-500">
              Şablonunuzu değiştirin, logonuzu veya marka renginizi yenileyin.
            </p>
          </button>

          {/* Quick Action 4: Homepage Sections */}
          <button
            type="button"
            onClick={() => onNavigateTab("sections")}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Sayfa Sıralaması</h4>
            <p className="text-xs text-slate-500">
              Ana sayfanızdaki bölümlerin sırasını belirleyin veya gizleyin.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
