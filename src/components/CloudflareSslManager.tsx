import React, { useState, useEffect } from "react";
import { SiteConfig } from "../types";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Globe,
  Server,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Key,
  ExternalLink,
  Laptop,
  HelpCircle,
  FileCheck,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface CloudflareSslManagerProps {
  config: SiteConfig;
  projectSlug: string;
  globalApiKey?: string;
  zoneId?: string;
  accountEmail?: string;
  onConfigChange?: (newConfig: SiteConfig) => void;
  onOpenSettings?: () => void;
}

export type SslMode = "flexible" | "full" | "strict";

export const CloudflareSslManager: React.FC<CloudflareSslManagerProps> = ({
  config,
  projectSlug,
  globalApiKey = "",
  zoneId = "",
  accountEmail = "",
  onConfigChange,
  onOpenSettings
}) => {
  // State initialized from config or defaults
  const [sslMode, setSslMode] = useState<SslMode>(
    config.cloudflare?.sslMode || "strict"
  );
  const [alwaysUseHttps, setAlwaysUseHttps] = useState<boolean>(
    config.cloudflare?.alwaysUseHttps !== undefined
      ? config.cloudflare.alwaysUseHttps
      : true
  );
  const [minTlsVersion, setMinTlsVersion] = useState<"1.2" | "1.3">(
    config.cloudflare?.minTlsVersion || "1.2"
  );
  const [autoRewrites, setAutoRewrites] = useState<boolean>(
    config.cloudflare?.automaticHttpsRewrites !== undefined
      ? config.cloudflare.automaticHttpsRewrites
      : true
  );

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    latencyMs?: number;
    isLive?: boolean;
  } | null>(null);

  const targetDomain =
    config.customDomain ||
    config.cloudflare?.customDomain ||
    (config.cloudflare?.subdomain ? `${config.cloudflare.subdomain}.pages.dev` : `${projectSlug}.pages.dev`);

  const hasCredentials = Boolean(globalApiKey.trim() && zoneId.trim());

  // Fetch live SSL status on initial mount if credentials exist
  useEffect(() => {
    if (hasCredentials) {
      handleFetchStatus(true);
    }
  }, [zoneId, globalApiKey]);

  const handleFetchStatus = async (silent = false) => {
    if (!silent) setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/cloudflare/ssl/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          globalApiKey,
          accountEmail,
          customDomain: targetDomain
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.sslMode) setSslMode(data.sslMode);
        if (typeof data.alwaysUseHttps === "boolean") setAlwaysUseHttps(data.alwaysUseHttps);
        if (data.minTlsVersion) setMinTlsVersion(data.minTlsVersion);
        if (typeof data.automaticHttpsRewrites === "boolean") setAutoRewrites(data.automaticHttpsRewrites);

        if (!silent) {
          setStatusMessage({
            type: "info",
            text: data.isLive
              ? "Cloudflare Anycast ağından güncel SSL/TLS durumu başarıyla senkronize edildi."
              : "SSL/TLS durum parametreleri yerel yapılandırmadan başarıyla okundu.",
            isLive: data.isLive
          });
        }
      }
    } catch (err: any) {
      console.warn("SSL status query error:", err);
      if (!silent) {
        setStatusMessage({
          type: "error",
          text: `SSL durumu alınamadı: ${err?.message || "Bilinmeyen hata"}`
        });
      }
    } finally {
      if (!silent) setIsLoadingStatus(false);
    }
  };

  const handleSaveSslSettings = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/cloudflare/ssl/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          globalApiKey,
          accountEmail,
          sslMode,
          alwaysUseHttps,
          minTlsVersion,
          automaticHttpsRewrites: autoRewrites,
          customDomain: targetDomain
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "SSL ayarları güncellenemedi.");
      }

      // Persist to siteConfig
      if (onConfigChange) {
        onConfigChange({
          ...config,
          cloudflare: {
            ...config.cloudflare,
            sslMode,
            alwaysUseHttps,
            minTlsVersion,
            automaticHttpsRewrites: autoRewrites,
            sslActive: true
          }
        });
      }

      setStatusMessage({
        type: "success",
        text: data.message || "SSL/TLS ayarları başarıyla kaydedildi.",
        latencyMs: data.latencyMs,
        isLive: data.isLive
      });
    } catch (err: any) {
      console.error("SSL update error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "SSL ayarları güncellenirken bir sorun oluştu."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 text-xs text-slate-200" id="cloudflare-ssl-manager">
      {/* Top Banner / Domain Identity */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Cloudflare SSL / TLS Şifreleme Ayarları
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 font-bold">
                  Universal SSL Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="font-mono text-cyan-300 font-bold">{targetDomain}</span>
                <span className="text-slate-600">•</span>
                <span>TLS 1.3 / HTTP/3 (QUIC) Anycast Uç Noktası</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFetchStatus(false)}
              disabled={isLoadingStatus || isSaving}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Cloudflare API'den güncel SSL durumunu çek"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? "animate-spin text-amber-400" : "text-slate-400"}`} />
              <span>Durumu Yenile</span>
            </button>
          </div>
        </div>

        {/* Credentials reminder if not set */}
        {!hasCredentials && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-amber-300 text-[11px]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                API Key veya Zone ID girilmedi. Ayarlarınız yerel proje konfigürasyonunuza kaydedilecek ve canlı dağıtım sırasında Cloudflare'e aktarılacaktır.
              </span>
            </div>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shrink-0 transition-all cursor-pointer"
              >
                API Key Tanımla
              </button>
            )}
          </div>
        )}

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-[11px] animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusMessage.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.latencyMs && (
              <span className="font-mono text-[10px] text-slate-400">
                {statusMessage.latencyMs} ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* SECTION 1: SSL ENCRYPTION MODE SELECTOR */}
      {/* ======================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>SSL / TLS Şifreleme Modu (SSL Encryption Mode)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Ziyaretçiler, Cloudflare Edge ağı ve barındırma sunucunuz arasındaki şifreleme derinliğini belirler.
            </p>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
            Aktif: {sslMode.toUpperCase()}
          </span>
        </div>

        {/* The 3 Modes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* OPTION 1: FLEXIBLE */}
          <button
            type="button"
            id="ssl-mode-flexible"
            onClick={() => setSslMode("flexible")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
              sslMode === "flexible"
                ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>Flexible</span>
                  <span className="text-[10px] font-normal text-slate-400">(Esnek)</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    sslMode === "flexible"
                      ? "border-amber-400 bg-amber-500"
                      : "border-slate-600 bg-slate-900"
                  }`}
                >
                  {sslMode === "flexible" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ziyaretçi ile Cloudflare Edge arası HTTPS ile şifrelenir. Cloudflare ile orijin sunucu arası şifresiz HTTP kullanılır.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-amber-400/90 font-medium">Orijinde SSL gerektirmez</span>
              <span className="font-mono text-slate-500">Kısmi Şifreleme</span>
            </div>
          </button>

          {/* OPTION 2: FULL */}
          <button
            type="button"
            id="ssl-mode-full"
            onClick={() => setSslMode("full")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
              sslMode === "full"
                ? "bg-cyan-500/10 border-cyan-500 text-white ring-1 ring-cyan-500/50 shadow-md shadow-cyan-500/10"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>Full</span>
                  <span className="text-[10px] font-normal text-slate-400">(Tam)</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    sslMode === "full"
                      ? "border-cyan-400 bg-cyan-500"
                      : "border-slate-600 bg-slate-900"
                  }`}
                >
                  {sslMode === "full" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ziyaretçiden Cloudflare'e ve Cloudflare'den sunucunuza kadar uçtan uca HTTPS şifrelemesi sağlar. Self-signed sertifikaları kabul eder.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-cyan-400 font-medium">Uçtan Uca HTTPS</span>
              <span className="font-mono text-slate-500">Self-Signed OK</span>
            </div>
          </button>

          {/* OPTION 3: FULL (STRICT) */}
          <button
            type="button"
            id="ssl-mode-strict"
            onClick={() => setSslMode("strict")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
              sslMode === "strict"
                ? "bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>Full (Strict)</span>
                  <span className="text-[10px] font-normal text-slate-400">(Katı)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Önerilen
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      sslMode === "strict"
                        ? "border-emerald-400 bg-emerald-500"
                        : "border-slate-600 bg-slate-900"
                    }`}
                  >
                    {sslMode === "strict" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                En yüksek güvenlik standardı. Orijin sunucuda geçerli bir CA sertifikası (veya Cloudflare Origin CA) zorunludur. MitM saldırılarını engeller.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-medium">Güvenilir CA Doğrulaması</span>
              <span className="font-mono text-emerald-400/90 font-bold">Maksimum Güvenlik</span>
            </div>
          </button>
        </div>

        {/* Dynamic Visual Architecture Diagram */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Seçili Mod Veri Akış Mimarisi ({sslMode.toUpperCase()} Traffic Flow)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Uçtan Uca Güvenlik Haritası
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 pt-1 font-mono text-[11px]">
            {/* Step 1: Visitor */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-[10px]">Ziyaretçi Tarayıcısı</span>
              <span className="text-[9px] text-slate-400">Chrome / Safari / Firefox</span>
            </div>

            {/* Connection 1: Always Encrypted */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>HTTPS (TLS 1.3)</span>
              </div>
              <div className="w-full h-0.5 bg-emerald-500/60 my-1 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-400 rotate-45" />
              </div>
              <span className="text-[9px] text-slate-500 font-sans">256-bit Şifrelenmiş</span>
            </div>

            {/* Step 2: Cloudflare Edge */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1 relative">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-[10px]">Cloudflare Anycast</span>
              <span className="text-[9px] text-slate-400">310+ Edge POP</span>
            </div>

            {/* Connection 2: Dependent on SSL Mode */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              {sslMode === "flexible" ? (
                <>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-[10px]">
                    <Unlock className="w-3 h-3 text-amber-400" />
                    <span>Şifresiz HTTP</span>
                  </div>
                  <div className="w-full h-0.5 bg-amber-500/60 my-1 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-amber-400 rotate-45" />
                  </div>
                  <span className="text-[9px] text-amber-300 font-sans">Port 80 (Düz Metin)</span>
                </>
              ) : sslMode === "full" ? (
                <>
                  <div className="flex items-center gap-1 text-cyan-400 font-bold text-[10px]">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>HTTPS (Self-Signed)</span>
                  </div>
                  <div className="w-full h-0.5 bg-cyan-500/60 my-1 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400 rotate-45" />
                  </div>
                  <span className="text-[9px] text-cyan-300 font-sans">Port 443 (Şifreli)</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>HTTPS (Strict CA)</span>
                  </div>
                  <div className="w-full h-0.5 bg-emerald-500/80 my-1 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-400 rotate-45" />
                  </div>
                  <span className="text-[9px] text-emerald-300 font-sans">Port 443 (Doğrulanmış)</span>
                </>
              )}
            </div>

            {/* Step 3: Origin Server */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-[10px]">Orijin / Pages</span>
              <span className="text-[9px] text-slate-400">Jetkur Edge Server</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SECTION 2: ALWAYS USE HTTPS TOGGLE */}
      {/* ======================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Her Zaman HTTPS Kullan (Always Use HTTPS)
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border ${
                  alwaysUseHttps
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {alwaysUseHttps ? "AÇIK (ON)" : "KAPALI (OFF)"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
              Tüm güvensiz <code className="text-amber-400 font-mono">http://</code> isteklerini otomatik olarak güvenli <code className="text-emerald-400 font-mono">https://</code> protokolüne 301 kalıcı yönlendirmesiyle aktarır. Google SEO sıralamasını artırır ve tarayıcı güvenlik uyarılarını önler.
            </p>
          </div>

          <button
            type="button"
            id="toggle-always-use-https"
            onClick={() => setAlwaysUseHttps(!alwaysUseHttps)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
              alwaysUseHttps
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            {alwaysUseHttps ? (
              <>
                <ToggleRight className="w-4 h-4 text-slate-950" />
                <span>HTTPS Zorunlu (Aktif)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                <span>HTTPS Zorunlu Değil (Pasif)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SECTION 3: COMPREHENSIVE EDGE TLS OPTIONS */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Automatic HTTPS Rewrites */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">
                Otomatik HTTPS Yeniden Yazımı (Automatic HTTPS Rewrites)
              </span>
              <button
                type="button"
                id="toggle-automatic-https-rewrites"
                onClick={() => setAutoRewrites(!autoRewrites)}
                className="cursor-pointer text-slate-400 hover:text-white"
              >
                {autoRewrites ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30">
                    Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[9px] border border-slate-700">
                    Pasif
                  </span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sayfadaki karma içerik (Mixed Content) uyarılarını önlemek için HTML'deki resim ve script bağlantılarını dinamik olarak HTTPS'e yükseltir.
            </p>
          </div>
        </div>

        {/* Minimum TLS Version */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">
                Minimum TLS Versiyonu (Minimum TLS Version)
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <button
                  type="button"
                  id="min-tls-1-2"
                  onClick={() => setMinTlsVersion("1.2")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    minTlsVersion === "1.2"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  TLS 1.2
                </button>
                <button
                  type="button"
                  id="min-tls-1-3"
                  onClick={() => setMinTlsVersion("1.3")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    minTlsVersion === "1.3"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  TLS 1.3
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Güvensiz ve eski TLS 1.0/1.1 şifreleme protokollerini engeller. TLS 1.2 tüm modern tarayıcılar için önerilen endüstri standardıdır.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* BOTTOM ACTION BAR */}
      {/* ======================================================= */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Yapılandırılan SSL modu: <strong className="text-white">{sslMode.toUpperCase()}</strong> | Always HTTPS: <strong className="text-white">{alwaysUseHttps ? "Aktif" : "Pasif"}</strong>
          </span>
        </div>

        <button
          type="button"
          id="btn-save-cloudflare-ssl"
          onClick={handleSaveSslSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Cloudflare SSL Güncelleniyor...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>SSL/TLS Ayarlarını Kaydet &amp; Uygula</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
