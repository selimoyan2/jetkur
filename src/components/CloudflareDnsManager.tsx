import React, { useState, useEffect } from "react";
import {
  Globe,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Search,
  Sparkles,
  Info,
  ExternalLink,
  Layers,
  Zap,
  Wrench
} from "lucide-react";
import { SiteConfig } from "../types";
import {
  CloudflareDnsRecord,
  DnsSuggestion,
  DnsAnalysisResult,
  downloadBindZoneFile,
  formatSuggestionForClipboard,
  normalizeDomain
} from "../utils/cloudflareDnsEngine";

interface CloudflareDnsManagerProps {
  config: SiteConfig;
  projectSlug: string;
  globalApiKey: string;
  zoneId: string;
  accountEmail: string;
  onOpenEdgeGuide?: () => void;
  onConfigChange?: (newConfig: SiteConfig) => void;
}

export const CloudflareDnsManager: React.FC<CloudflareDnsManagerProps> = ({
  config,
  projectSlug,
  globalApiKey,
  zoneId,
  accountEmail,
  onOpenEdgeGuide,
  onConfigChange
}) => {
  const targetPagesDev = `${projectSlug || "sirketiniz"}.pages.dev`;
  const initialDomain = config.cloudflare?.customDomain || `${projectSlug || "sirketiniz"}.com`;

  const [customDomainInput, setCustomDomainInput] = useState<string>(initialDomain);
  const [isFetchingDns, setIsFetchingDns] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DnsAnalysisResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [applyingSuggestionId, setApplyingSuggestionId] = useState<string | null>(null);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const hasCredentials = Boolean(globalApiKey && zoneId);

  // Trigger initial fetch when credentials exist or component mounts
  const handleFetchDnsRecords = async (forceSimulate = false) => {
    setIsFetchingDns(true);
    setFetchError(null);
    setAppliedSuccessMsg(null);

    try {
      const res = await fetch("/api/cloudflare/dns/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalApiKey: forceSimulate ? "" : globalApiKey,
          zoneId: forceSimulate ? "" : zoneId,
          accountEmail: forceSimulate ? "" : accountEmail,
          targetPagesDev,
          customDomain: customDomainInput || initialDomain,
          forceSimulated: forceSimulate
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Cloudflare DNS kayıtları alınamadı.");
      }

      setAnalysisResult(data);

      // Optionally sync discovered/suggested records into siteConfig if handler exists
      if (onConfigChange && data.suggestions && Array.isArray(data.suggestions)) {
        const mappedDns = data.suggestions.map((s: DnsSuggestion) => ({
          type: s.recordType as "A" | "CNAME" | "TXT",
          name: s.name,
          content: s.content,
          proxyStatus: s.proxied,
          status: s.status === "optimal" ? ("verified" as const) : ("pending" as const)
        }));

        onConfigChange({
          ...config,
          cloudflare: {
            ...config.cloudflare,
            dnsRecords: mappedDns,
            dnsPropagationStatus: data.summary?.hasRootPagesBinding ? "verified" : "unconfigured"
          }
        });
      }
    } catch (err: any) {
      console.error("DNS fetch failed:", err);
      setFetchError(err.message || "Cloudflare DNS kayıtları sorgulanırken bir hata oluştu.");
    } finally {
      setIsFetchingDns(false);
    }
  };

  // Auto-fetch on mount if not yet fetched
  useEffect(() => {
    if (!analysisResult) {
      handleFetchDnsRecords(false);
    }
  }, []);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleApplySuggestion = async (suggestion: DnsSuggestion) => {
    setApplyingSuggestionId(suggestion.id);
    setAppliedSuccessMsg(null);
    try {
      const res = await fetch("/api/cloudflare/dns/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalApiKey,
          zoneId,
          accountEmail,
          suggestion: {
            recordType: suggestion.recordType,
            name: suggestion.name,
            content: suggestion.content,
            proxied: suggestion.proxied,
            ttl: suggestion.ttl,
            existingRecordId: suggestion.currentRecord?.id
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Kayıt güncellenemedi.");
      }

      setAppliedSuccessMsg(
        data.message ||
          `✓ ${suggestion.recordType} ${suggestion.name} -> ${suggestion.content} Cloudflare Anycast tablosuna yazıldı!`
      );

      // Re-run analysis locally to update state immediately
      if (analysisResult) {
        const updatedRecords = [...analysisResult.records];
        const existingIdx = updatedRecords.findIndex(
          (r) => r.id === (suggestion.currentRecord?.id || data.record?.id)
        );

        const newRecord: CloudflareDnsRecord = {
          id: data.record?.id || `rec-${Date.now()}`,
          zone_id: zoneId || "023e105f4ecef8ad9ca31a8372d0c353",
          zone_name: analysisResult.zoneName,
          type: suggestion.recordType,
          name: suggestion.name === "@" ? analysisResult.zoneName : `${suggestion.name}.${analysisResult.zoneName}`,
          content: suggestion.content,
          proxiable: true,
          proxied: suggestion.proxied,
          ttl: suggestion.ttl,
          comment: "Managed by JetKur Cloudflare Edge Engine"
        };

        if (existingIdx >= 0) {
          updatedRecords[existingIdx] = newRecord;
        } else {
          updatedRecords.unshift(newRecord);
        }

        const updatedSuggestions = analysisResult.suggestions.map((s) => {
          if (s.id === suggestion.id) {
            return {
              ...s,
              status: "optimal" as const,
              reason: "Kayıt Cloudflare Anycast CDN ağına başarıyla bağlandı ve doğrulandı.",
              fixActionLabel: "Yapılandırıldı",
              currentRecord: newRecord
            };
          }
          return s;
        });

        setAnalysisResult({
          ...analysisResult,
          records: updatedRecords,
          suggestions: updatedSuggestions,
          summary: {
            ...analysisResult.summary,
            optimalCount: updatedSuggestions.filter((s) => s.status === "optimal").length,
            missingCount: updatedSuggestions.filter((s) => s.status === "missing").length,
            conflictCount: updatedSuggestions.filter((s) => s.status === "conflict").length,
            hasRootPagesBinding: updatedSuggestions.some((s) => s.name === "@" && s.status === "optimal"),
            hasWwwPagesBinding: updatedSuggestions.some((s) => s.name === "www" && s.status === "optimal")
          }
        });
      }
    } catch (err: any) {
      console.error("Apply suggestion failed:", err);
      alert(err.message || "Kayıt uygulanırken bir hata oluştu.");
    } finally {
      setApplyingSuggestionId(null);
    }
  };

  const handleApplyAllSuggestions = async () => {
    if (!analysisResult) return;
    const pending = analysisResult.suggestions.filter((s) => s.status !== "optimal");
    for (const sug of pending) {
      await handleApplySuggestion(sug);
    }
  };

  const filteredRecords = (analysisResult?.records || []).filter((r) => {
    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    const matchesSearch =
      !searchTerm ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-in fade-in" id="cloudflare-dns-manager-root">
      {/* Header & Control Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">
                Cloudflare DNS Kayıtları &amp; Otomatik CNAME / A Öneri Motoru
              </h3>
              {analysisResult?.isSimulated && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Simüle Test Modu
                </span>
              )}
              {analysisResult && !analysisResult.isSimulated && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canlı Cloudflare API
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Cloudflare Zone üzerindeki mevcut DNS tablosunu sorgular; sitenizin <strong>{targetPagesDev}</strong> hedefine eksiksiz bağlanması için gereken <strong>CNAME Flattening (@)</strong> ve <strong>www</strong> kayıtlarını otomatik tespit eder.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-fetch-cloudflare-dns"
              onClick={() => handleFetchDnsRecords(false)}
              disabled={isFetchingDns}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingDns ? "animate-spin text-slate-950" : "text-slate-950"}`} />
              <span>{isFetchingDns ? "DNS Taranıyor..." : "DNS Kayıtlarını Getir"}</span>
            </button>

            {onOpenEdgeGuide && (
              <button
                type="button"
                onClick={onOpenEdgeGuide}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Cloudflare Edge & DNS Kılavuzunu Görüntüle"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Rehber</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Site & Zone Info Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Dağıtılan Pages:</span>
            <span className="text-amber-400 font-bold">{targetPagesDev}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Hedef Alan Adı:</span>
            <input
              type="text"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetchDnsRecords(false);
                }
              }}
              placeholder="sirketiniz.com"
              className="bg-transparent text-cyan-300 font-bold outline-none w-36 border-b border-cyan-500/40 px-1 text-xs"
            />
            {customDomainInput !== (analysisResult?.zoneName || "") && (
              <button
                type="button"
                onClick={() => handleFetchDnsRecords(false)}
                className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-bold cursor-pointer"
                title="Yeni alan adı için DNS kayıtlarını yeniden analiz et"
              >
                Yenile
              </button>
            )}
          </div>

          {analysisResult?.latencyMs !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
              <span>⚡ API Gecikmesi:</span>
              <strong className="text-emerald-400">{analysisResult.latencyMs}ms</strong>
            </div>
          )}

          {!hasCredentials && (
            <div className="text-[11px] text-amber-400 font-sans flex items-center gap-1.5 ml-auto">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Canlı API için Dağıtım Ayarlarından Global API Key ve Zone ID ekleyin.</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {appliedSuccessMsg && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{appliedSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedSuccessMsg(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
      {fetchError && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleFetchDnsRecords(true)}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold transition-all text-[11px] cursor-pointer"
          >
            Simüle Modda Dene
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AUTOMATIC DNS SUGGESTIONS (SMART RECOMMENDATIONS) */}
      {/* ========================================================================= */}
      {analysisResult && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-black text-white text-xs uppercase tracking-wider">
                Otomatik Önerilen CNAME ve A Kayıtları ({analysisResult.suggestions.length})
              </h4>
              {analysisResult.summary.missingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {analysisResult.summary.missingCount} Eksik Kayıt
                </span>
              )}
              {analysisResult.summary.conflictCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {analysisResult.summary.conflictCount} Çakışma
                </span>
              )}
              {analysisResult.summary.optimalCount === analysisResult.suggestions.length && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ Tüm Kayıtlar Optimal
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(analysisResult.summary.missingCount > 0 || analysisResult.summary.conflictCount > 0) && (
                <button
                  type="button"
                  id="btn-apply-all-dns"
                  onClick={handleApplyAllSuggestions}
                  disabled={Boolean(applyingSuggestionId)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Eksik ve çakışan tüm kayıtları Cloudflare Pages Anycast hedefine günceller"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-950" />
                  <span>Tüm Önerileri Tek Tıkla Uygula</span>
                </button>
              )}

              <button
                type="button"
                id="btn-download-bind-zone"
                onClick={() =>
                  downloadBindZoneFile(
                    analysisResult.records,
                    analysisResult.suggestions,
                    analysisResult.zoneName,
                    targetPagesDev
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Standart RFC BIND Zone Dosyası İndir"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>BIND Zone İndir</span>
              </button>
            </div>
          </div>

          {/* Suggestion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisResult.suggestions.map((sug) => {
              const isApplying = applyingSuggestionId === sug.id;
              const isOptimal = sug.status === "optimal";
              const isConflict = sug.status === "conflict";
              const isMissing = sug.status === "missing";

              return (
                <div
                  key={sug.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isOptimal
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : isConflict
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-amber-950/20 border-amber-500/40"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-slate-900 border border-slate-700 text-cyan-400">
                        {sug.recordType}
                      </span>
                      <span className="font-bold text-white text-xs font-mono">
                        {sug.name} <span className="text-slate-500 font-normal">({sug.fullName})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOptimal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Doğru Yapılandırıldı</span>
                        </span>
                      )}
                      {isConflict && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Çakışma Tespit Edildi</span>
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Eksik Kayıt</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Value & Proxy Badge */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Önerilen Hedef:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                          <span>☁️ Proxied (Turuncu Bulut)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">TTL: Auto</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-amber-400 truncate">{sug.content}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(sug.content, `sug-content-${sug.id}`)}
                        className="p-1 text-slate-400 hover:text-white shrink-0"
                        title="Hedefi Kopyala"
                      >
                        {copiedKey === `sug-content-${sug.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reason & Technical Details */}
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p className="leading-relaxed">{sug.reason}</p>
                    {sug.technicalDetails && (
                      <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                        {sug.technicalDetails}
                      </div>
                    )}
                  </div>

                  {/* Card Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleCopyText(formatSuggestionForClipboard(sug), `sug-full-${sug.id}`)}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === `sug-full-${sug.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tüm Bilgiler Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Detayları Kopyala</span>
                        </>
                      )}
                    </button>

                    {!isOptimal ? (
                      <button
                        type="button"
                        onClick={() => handleApplySuggestion(sug)}
                        disabled={isApplying}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isApplying ? (
                          <>
                            <span className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                            <span>Uygulanıyor...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 fill-current" />
                            <span>{sug.fixActionLabel}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Yayında &amp; Aktif</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: EXISTING CLOUDFLARE DNS RECORDS EXPLORER */}
      {/* ========================================================================= */}
      {analysisResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Mevcut Cloudflare DNS Tablosu ({filteredRecords.length}/{analysisResult.records.length})</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Zone ID: <code className="text-slate-300">{analysisResult.zoneId}</code> ({analysisResult.zoneName})
              </p>
            </div>

            {/* Filter Chips & Search Input */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs">
                <Search className="w-3 h-3 text-slate-500 mr-1.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kayıt veya IP ara..."
                  className="bg-transparent text-white text-xs outline-none w-28 sm:w-36 font-mono"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                {["ALL", "CNAME", "A", "TXT", "MX"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      typeFilter === t
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DNS Records Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tür</th>
                  <th className="py-2.5 px-3">Ad (Name)</th>
                  <th className="py-2.5 px-3">Değer / Hedef (Content)</th>
                  <th className="py-2.5 px-3">Proxy Durumu</th>
                  <th className="py-2.5 px-3">TTL</th>
                  <th className="py-2.5 px-3">Açıklama / Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                      Arama kriterlerine uygun DNS kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isTargetBinding = rec.content.includes(".pages.dev");
                    const isConflictingA =
                      rec.type === "A" &&
                      (rec.name === analysisResult.zoneName || rec.name === `www.${analysisResult.zoneName}`);

                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isTargetBinding
                            ? "bg-emerald-950/20"
                            : isConflictingA
                            ? "bg-rose-950/10"
                            : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-cyan-400">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              rec.type === "CNAME"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : rec.type === "A"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : rec.type === "MX"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white truncate max-w-[140px]" title={rec.name}>
                          {rec.name}
                        </td>
                        <td
                          className="py-2.5 px-3 font-bold truncate max-w-[220px]"
                          title={rec.content}
                        >
                          <span className={isTargetBinding ? "text-amber-400" : "text-slate-300"}>
                            {rec.content}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {rec.proxied ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-sans font-bold">
                              <span>☁️ Turuncu Bulut</span>
                              <span className="text-[9px] text-slate-500">(Proxied)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-sans">
                              <span>☁️ DNS Only</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {rec.ttl === 1 ? "Auto" : `${rec.ttl}s`}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] font-sans">
                          {isTargetBinding ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Pages Hedefiyle Eşleşti</span>
                            </span>
                          ) : isConflictingA ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Eski Sunucu Çakışması</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] truncate block max-w-[150px]">
                              {rec.comment || "Standart Kayıt"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CLOUDFLARE CNAME FLATTENING & ANYCAST PROXY GUIDE */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Neden Cloudflare CNAME Flattening ve Turuncu Bulut (Proxy) Kullanılmalıdır?</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <strong className="text-white block font-semibold">1. Kök Domain CNAME Flattening (RFC 1034 Uyumu):</strong>
            <p className="text-slate-400 leading-relaxed">
              Geleneksel DNS'te apex/kök alan adları (@) için CNAME oluşturulamaz ve sabit IP (A kaydı) zorunludur. Cloudflare, DNS seviyesinde CNAME sorgusunu dinamik IP'ye dönüştürerek (<code className="text-cyan-300">CNAME Flattening</code>) sitenizi 330+ Anycast veri merkezine doğrudan bağlar.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <strong className="text-white block font-semibold">2. Otomatik SSL &amp; Global Anycast Hız Kalkanı:</strong>
            <p className="text-slate-400 leading-relaxed">
              Proxy (Turuncu Bulut) aktif edildiğinde, Cloudflare evrensel SSL sertifikası (Universal SSL), DDoS kalkanı, Brotli sıkıştırma ve 0.02s ortalama gecikme ile Türkiye ve dünya genelinde en yakın edge noktadan hizmet verir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CloudflareDnsManager;
