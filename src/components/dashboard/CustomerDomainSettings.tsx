/**
 * JetKur Simple Customer Domain & Publishing Settings Component (Sprint 16)
 *
 * Core Product Principle:
 * "Müşterinin teknik hosting veya DNS bilgisine ihtiyacı olmadan
 * sitesini yayınlayabilmesi ve isteğe bağlı özel alan adını bağlayabilmesi gerekir."
 *
 * Provides:
 * 1. Default JetKur Subdomain (isletme.jetkur.com.tr) with one-click editor.
 * 2. Custom Domain Connection with clean DNS TXT instructions.
 * 3. Server-authoritative DNS verification & SSL status display.
 * 4. Safe disconnect preserving 100% of customer content.
 */

import React, { useState, useEffect } from "react";
import { SiteConfig } from "../../types";
import { DomainRecord, DnsInstructionRecord } from "../../domain/domain/types";
import {
  Globe,
  Check,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Edit2,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
} from "lucide-react";

interface CustomerDomainSettingsProps {
  config: SiteConfig;
  readOnly?: boolean;
}

export const CustomerDomainSettings: React.FC<CustomerDomainSettingsProps> = ({
  config,
  readOnly = false,
}) => {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subdomain edit state
  const [isEditingSubdomain, setIsEditingSubdomain] = useState(false);
  const [newSubdomainSlug, setNewSubdomainSlug] = useState("");

  // Custom domain connect state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState("");

  const siteId = config.id || "current-site";

  // Load existing domains
  const loadDomains = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/domains/sites/${siteId}`);
      const data = await res.json();
      if (data.domains) {
        setDomains(data.domains);
      }
    } catch {
      // Offline fallback
      setDomains([
        {
          id: `dom_sub_${siteId}`,
          siteId,
          workspaceId: "default-workspace",
          hostname: `${config.companyName ? config.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "ornek-site"}.jetkur.com.tr`,
          type: "JETKUR_SUBDOMAIN",
          status: "ACTIVE",
          sslStatus: "ACTIVE",
          isPrimary: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [siteId]);

  const handleUpdateSubdomain = async () => {
    if (!newSubdomainSlug.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/domains/sites/${siteId}/subdomain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSubdomainSlug.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Site adresi güncellenemedi.");
        return;
      }

      setToastMessage(data.message || "Site adresi başarıyla güncellendi.");
      setIsEditingSubdomain(false);
      loadDomains();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomainInput.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/domains/sites/${siteId}/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: customDomainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Alan adı eklenemedi.");
        return;
      }

      setToastMessage("Alan adı eklendi. Lütfen DNS kayıtlarınızı tamamlayın.");
      setIsAddingCustom(false);
      setCustomDomainInput("");
      loadDomains();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCustomDomain = async (domainId: string) => {
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/domains/sites/${siteId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Doğrulama yapılamadı.");
        return;
      }

      if (data.verified) {
        setToastMessage("Alan adı başarıyla doğrulandı ve siteniz yayına alındı!");
      } else {
        setToastMessage("DNS kayıtlarınız henüz tespit edilemedi. Yayılması 10-15 dakika sürebilir.");
      }
      loadDomains();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Doğrulama işlemi başarısız.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnectDomain = async (domainId: string) => {
    if (!confirm("Bu alan adının bağlantısını kaldırmak istediğinize emin misiniz? (Site içerikleriniz silinmez)")) {
      return;
    }

    setActionLoading(true);
    try {
      await fetch(`/api/domains/sites/${siteId}/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      setToastMessage("Alan adı bağlantısı kaldırıldı.");
      loadDomains();
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const jetkurSubdomain = domains.find((d) => d.type === "JETKUR_SUBDOMAIN");
  const customDomains = domains.filter((d) => d.type === "CUSTOM_DOMAIN");

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <span>Site Adresi &amp; Özel Alan Adı (Domain)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Web sitenizin internet üzerindeki adresini yönetin. Ücretsiz JetKur adresinizi kullanabilir veya kendi alan adınızı (firmaniz.com) bağlayabilirsiniz.
          </p>
        </div>

        {!readOnly && customDomains.length === 0 && !isAddingCustom && (
          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Kendi Alan Adımı Bağla</span>
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Default JetKur Subdomain Box */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Ücretsiz JetKur Adresi
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <Lock className="w-3 h-3" />
              <span>SSL Aktif</span>
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            https://{jetkurSubdomain?.hostname || "site.jetkur.com.tr"}
          </div>
          <p className="text-[11px] text-slate-500">
            Siteniz her zaman bu adres üzerinden güvenle ve ücretsiz erişilebilir durumdadır.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewSubdomainSlug(
                  jetkurSubdomain?.hostname ? jetkurSubdomain.hostname.replace(".jetkur.com.tr", "") : ""
                );
                setIsEditingSubdomain(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Adresi Değiştir</span>
            </button>
            <a
              href={`https://${jetkurSubdomain?.hostname || "jetkur.com.tr"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors"
              title="Yeni sekmede aç"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        )}
      </div>

      {/* Subdomain Edit Modal */}
      {isEditingSubdomain && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <h4 className="text-xs font-bold text-amber-900">JetKur Site Adresinizi Belirleyin</h4>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newSubdomainSlug}
              onChange={(e) => setNewSubdomainSlug(e.target.value)}
              placeholder="ornek-tesisat"
              className="flex-1 px-3 py-2 rounded-xl border border-amber-300 text-xs text-slate-900 bg-white focus:outline-hidden"
            />
            <span className="text-xs font-bold text-slate-600">.jetkur.com.tr</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleUpdateSubdomain}
              disabled={actionLoading}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingSubdomain(false)}
              className="px-4 py-1.5 rounded-xl bg-white text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Custom Domain Connect Form */}
      {isAddingCustom && (
        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <h4 className="text-xs font-bold text-indigo-950">Özel Alan Adınızı Girin</h4>
          <p className="text-xs text-indigo-700">
            Örn: <span className="font-mono">aksoytesisat.com</span> veya <span className="font-mono">www.aksoytesisat.com</span>
          </p>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              placeholder="firmaniz.com"
              className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 text-xs text-slate-900 bg-white focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddCustomDomain}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "Ekleniyor..." : "Alan Adını Ekle"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-2 rounded-xl bg-white text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* 2. Custom Domain Card (if added) */}
      {customDomains.map((dom) => (
        <div key={dom.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                  Özel Alan Adı
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dom.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {dom.status === "ACTIVE" ? "Yayında & Bağlandı" : "DNS Doğrulaması Bekleniyor"}
                </span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                https://{dom.hostname}
              </div>
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2">
                {dom.status !== "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => handleVerifyCustomDomain(dom.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
                    <span>DNS'i Kontrol Et</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDisconnectDomain(dom.id)}
                  disabled={actionLoading}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Alan adını kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* DNS TXT Instructions if awaiting DNS */}
          {dom.status !== "ACTIVE" && dom.dnsInstructions && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Gerekli DNS Kayıtları (Alan adınızı satın aldığınız panelde ekleyin):</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                      <th className="py-1.5 pr-3 font-bold">Kayıt Türü</th>
                      <th className="py-1.5 pr-3 font-bold">Kayıt Adı / Host</th>
                      <th className="py-1.5 font-bold">Değer / Hedef</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                    {dom.dnsInstructions.map((rec: DnsInstructionRecord, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 pr-3 font-bold text-indigo-700">{rec.type}</td>
                        <td className="py-2 pr-3">{rec.name}</td>
                        <td className="py-2 break-all text-slate-900 font-medium">{rec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
