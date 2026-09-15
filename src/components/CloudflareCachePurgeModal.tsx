import React, { useState } from "react";
import { SiteConfig } from "../types";
import {
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Server,
  FileCode,
  Radio
} from "lucide-react";

export interface CachePurgeResult {
  success: boolean;
  isSimulated?: boolean;
  purgeType: "everything" | "urls";
  purgedScope: string;
  purgedCount: string | number;
  urls?: string[];
  resultId?: string;
  latencyMs: number;
  timestamp: string;
  targetDomain: string;
  message: string;
}

interface CloudflareCachePurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  projectSlug: string;
  onPurgeSuccess?: (result: CachePurgeResult) => void;
}

export const CloudflareCachePurgeModal: React.FC<CloudflareCachePurgeModalProps> = ({
  isOpen,
  onClose,
  config,
  projectSlug,
  onPurgeSuccess
}) => {
  const [purgeType, setPurgeType] = useState<"everything" | "urls">("everything");
  const [urlsInput, setUrlsInput] = useState<string>("/\n/index.html");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purgeResult, setPurgeResult] = useState<CachePurgeResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const targetDomain =
    config.customDomain ||
    config.cloudflare?.customDomain ||
    (config.cloudflare?.subdomain ? `${config.cloudflare.subdomain}.pages.dev` : `${projectSlug}.pages.dev`);

  const zoneId = config.cloudflare?.apiConfig?.zoneId || "";
  const globalApiKey = config.cloudflare?.apiConfig?.globalApiKey || "";
  const accountEmail = config.cloudflare?.apiConfig?.accountEmail || config.email || "";

  // Suggested quick URL chips based on site configuration
  const suggestedUrls = [
    "/",
    "/index.html",
    ...(config.siteType === "multi-page"
      ? [
          "/hakkimizda.html",
          "/hizmetler.html",
          "/galeri.html",
          "/iletisim.html",
          "/blog.html"
        ]
      : []),
    "/favicon.ico",
    "/assets/styles.css"
  ];

  const handleAddQuickUrl = (url: string) => {
    const currentList = urlsInput
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (!currentList.includes(url)) {
      setUrlsInput(currentList.length > 0 ? `${urlsInput.trim()}\n${url}` : url);
    }
  };

  const handleExecutePurge = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const parsedUrls =
        purgeType === "urls"
          ? urlsInput
              .split(/[\n,]+/)
              .map((u) => u.trim())
              .filter(Boolean)
          : [];

      if (purgeType === "urls" && parsedUrls.length === 0) {
        throw new Error("Lütfen temizlemek istediğiniz en az bir URL giriniz.");
      }

      const res = await fetch("/api/cloudflare/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          globalApiKey,
          accountEmail,
          purgeType,
          urls: parsedUrls,
          customDomain: targetDomain
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Önbellek temizleme isteği başarısız oldu.");
      }

      setPurgeResult(data);
      if (onPurgeSuccess) {
        onPurgeSuccess(data);
      }
    } catch (err: any) {
      console.error("Purge error:", err);
      setErrorMsg(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPurgeResult(null);
    setErrorMsg(null);
    setConfirmed(false);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cache-purge-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 id="cache-purge-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cloudflare Önbellek Temizleme (Cache Purge)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30">
                  Anycast Edge
                </span>
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="font-mono text-amber-400">{targetDomain}</span>
                {zoneId && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Zone: {zoneId.slice(0, 8)}...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {purgeResult ? (
            /* ======================================================= */
            /* SUCCESS FEEDBACK STATE */
            /* ======================================================= */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-emerald-300 text-sm">
                      Edge Önbelleği Başarıyla Temizlendi!
                    </h3>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                      {purgeResult.message}
                    </p>
                  </div>
                </div>

                {/* Technical Telemetry Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-emerald-500/20 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">Temizleme Kapsamı:</span>
                    <div className="font-bold text-white">{purgeResult.purgedScope}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-emerald-500/20 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">Yayılım Süresi:</span>
                    <div className="font-bold text-cyan-400">{purgeResult.latencyMs} ms</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-emerald-500/20 space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 text-[10px]">Cloudflare POPs:</span>
                    <div className="font-bold text-emerald-400">310+ Veri Merkezi</div>
                  </div>
                </div>

                {purgeResult.urls && purgeResult.urls.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Temizlenen URL Adresleri:
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                      {purgeResult.urls.map((u, i) => (
                        <div key={i} className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 truncate">
                          {u}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Informative Note on verification */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Anında Doğrulama İpucu:</span>
                </div>
                <p className="leading-relaxed">
                  Tarayıcınızda <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+F5</kbd> (veya <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Cmd+Shift+R</kbd>) ile doğrudan test edebilirsiniz. Cloudflare yanıt başlığında <code className="text-cyan-300 font-mono">CF-Cache-Status: EXPIRED / MISS</code> görüntülenecektir.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all cursor-pointer"
                >
                  Tekrar Temizle
                </button>
                <a
                  href={`https://${targetDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <span>Siteyi Canlıda Gör</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* PURGE CONFIGURATION FORM & CONFIRMATION DIALOG */
            /* ======================================================= */
            <div className="space-y-4">
              {/* Scope Selection Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Temizleme Kapsamı Seçimi</span>
                  <span className="text-[10px] text-slate-500">Cloudflare Purge API</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Purge Everything */}
                  <button
                    type="button"
                    onClick={() => setPurgeType("everything")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                      purgeType === "everything"
                        ? "bg-amber-500/10 border-amber-500/80 text-white ring-1 ring-amber-500/40"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>Tüm Alan Adını Temizle</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Purge Everything
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Sitedeki tüm HTML, CSS, JavaScript ve medya dosyalarını tek seferde önbellekten düşürür.
                    </p>
                  </button>

                  {/* Option 2: Purge Specific URLs */}
                  <button
                    type="button"
                    onClick={() => setPurgeType("urls")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                      purgeType === "urls"
                        ? "bg-cyan-500/10 border-cyan-500/80 text-white ring-1 ring-cyan-500/40"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>Belirli URL'leri Temizle</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Purge by URL
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Sadece güncellenen spesifik sayfaları veya varlıkları hedefler, diğer sayfaların önbelleğini korur.
                    </p>
                  </button>
                </div>
              </div>

              {/* Conditional URL Input */}
              {purgeType === "urls" && (
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Temizlenecek URL / Dosya Yolları (Her satıra bir adet)
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Örn: / veya /index.html
                    </span>
                  </div>

                  <textarea
                    value={urlsInput}
                    onChange={(e) => setUrlsInput(e.target.value)}
                    rows={4}
                    placeholder="/&#10;/index.html&#10;/assets/styles.css"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />

                  {/* Quick preset chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Hızlı Ekle:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedUrls.map((sUrl) => (
                        <button
                          key={sUrl}
                          type="button"
                          onClick={() => handleAddQuickUrl(sUrl)}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] border border-slate-700 transition-all cursor-pointer"
                        >
                          + {sUrl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Warning Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-[11px] text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-300">
                      Önbellek Temizleme Onayı &amp; Etki Alanı:
                    </span>
                    <p className="leading-relaxed text-amber-200/90">
                      {purgeType === "everything"
                        ? "Tüm önbellek temizlendiğinde, sitenize gelen sonraki ilk ziyaretler doğrudan orijin sunucudan derlenir. Bu işlem Cloudflare Edge RAM'ini sıfırlar ve ortalama 150ms içerisinde 310+ veri merkezine iletilir."
                        : "Belirtilen URL'ler için Cloudflare Edge önbelleği sıfırlanacak, diğer sayfaların önbellek ve hız avantajı korunacaktır."}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 border-t border-amber-500/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-amber-300">
                    Önbelleği hemen temizlemek istediğimi onaylıyorum.
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  onClick={handleExecutePurge}
                  disabled={isSubmitting || !confirmed}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Anycast Ağı Temizleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 text-slate-950" />
                      <span>Önbelleği Şimdi Temizle (Purge Cache)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
