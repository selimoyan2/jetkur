import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  FileUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Copy,
  Check,
  Globe,
  Radio,
  Cpu,
  ShieldCheck,
  Cloud,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  ExternalLink,
  Zap
} from "lucide-react";

export interface LogMessage {
  id: string;
  timestamp: string;
  stage: "init" | "asset_upload" | "worker_build" | "route_binding" | "edge_propagation" | "complete";
  level: "info" | "success" | "warning" | "error";
  message: string;
  details?: string;
}

export interface AssetUploadItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  hash: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  mimeType?: string;
}

export interface RouteBindingInfo {
  zoneId: string;
  pattern: string;
  workerName: string;
  routeId?: string;
  status: "idle" | "pending" | "success" | "error";
  error?: string;
  verifiedAt?: string;
}

export interface DeploymentLogsProps {
  logs: LogMessage[];
  assets: AssetUploadItem[];
  routeBinding: RouteBindingInfo;
  isDeploying: boolean;
  status: "idle" | "in_progress" | "success" | "error";
  progressPercent: number;
  currentStepDescription?: string;
  liveUrl?: string;
  onRestart?: () => void;
  onClearLogs?: () => void;
  simulateMode?: "normal" | "asset_error" | "route_error";
  onSimulateModeChange?: (mode: "normal" | "asset_error" | "route_error") => void;
}

export const DeploymentLogs: React.FC<DeploymentLogsProps> = ({
  logs,
  assets,
  routeBinding,
  isDeploying,
  status,
  progressPercent,
  currentStepDescription,
  liveUrl,
  onRestart,
  onClearLogs,
  simulateMode = "normal",
  onSimulateModeChange
}) => {
  const [filterLevel, setFilterLevel] = useState<"all" | "asset_upload" | "route_binding" | "errors" | "success">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [showAssetList, setShowAssetList] = useState(true);
  const [showRouteDetails, setShowRouteDetails] = useState(true);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Stage / Level filter
    if (filterLevel === "asset_upload" && log.stage !== "asset_upload") return false;
    if (filterLevel === "route_binding" && log.stage !== "route_binding") return false;
    if (filterLevel === "errors" && log.level !== "error") return false;
    if (filterLevel === "success" && log.level !== "success") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchStage = log.stage.toLowerCase().includes(q);
      const matchDetails = log.details ? log.details.toLowerCase().includes(q) : false;
      return matchMsg || matchStage || matchDetails;
    }

    return true;
  });

  const handleCopyLogs = () => {
    const rawText = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.stage}] ${l.message} ${l.details ? `-> ${l.details}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(rawText);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const uploadedAssetsCount = assets.filter((a) => a.status === "success").length;
  const failedAssetsCount = assets.filter((a) => a.status === "error").length;
  const uploadingAssetsCount = assets.filter((a) => a.status === "uploading").length;
  const totalAssetsCount = assets.length;

  return (
    <div className="space-y-4 text-slate-200" id="component-deployment-logs">
      {/* 1. Header & Live Status Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Cloudflare Workers Push Dağıtım Konsolu
                </h3>
                {status === "in_progress" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    CANLI PUSH
                  </span>
                )}
                {status === "success" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    BAŞARILI
                  </span>
                )}
                {status === "error" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    HATA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Statik varlıkların (Assets) yüklenmesi ve Cloudflare Zone Route Binding eşleştirmesi gerçek zamanlı izleniyor.
              </p>
            </div>
          </div>

          {/* Action buttons & Simulation Mode Picker */}
          <div className="flex flex-wrap items-center gap-2">
            {onSimulateModeChange && (
              <div className="flex items-center gap-1 text-[11px] bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Test Modu:</span>
                <select
                  value={simulateMode}
                  onChange={(e) => onSimulateModeChange(e.target.value as any)}
                  className="bg-transparent text-amber-300 font-bold outline-none cursor-pointer text-[11px]"
                  title="Test amaçlı hata senaryolarını simüle edebilirsiniz"
                >
                  <option value="normal" className="bg-slate-900 text-white">Normal Dağıtım</option>
                  <option value="asset_error" className="bg-slate-900 text-rose-300">Varlık Yükleme Hatası Simüle Et</option>
                  <option value="route_error" className="bg-slate-900 text-rose-300">Route Binding Hatası Simüle Et</option>
                </select>
              </div>
            )}

            {onRestart && (
              <button
                type="button"
                id="btn-restart-workers-push"
                onClick={onRestart}
                disabled={isDeploying}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? "animate-spin" : ""}`} />
                <span>{isDeploying ? "Push Sürüyor..." : "Workers Push Başlat"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Current Step */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{currentStepDescription || "Dağıtım hazır."}</span>
            </span>
            <span className="font-mono font-bold text-amber-400">%{progressPercent}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                status === "error"
                  ? "bg-rose-500"
                  : status === "success"
                  ? "bg-emerald-400"
                  : "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(progressPercent, status === "in_progress" ? 5 : 0))}%` }}
            />
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Metric 1: Assets */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>Varlık Yükleme</span>
              <FileUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{uploadedAssetsCount} / {totalAssetsCount}</span>
              {failedAssetsCount > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {failedAssetsCount} Hata
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  Aktif
                </span>
              )}
            </div>
          </div>

          {/* Metric 2: Route Binding */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>Route Binding</span>
              <Globe className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xs font-bold truncate">
              {routeBinding.status === "success" && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Eşleştirildi
                </span>
              )}
              {routeBinding.status === "pending" && (
                <span className="text-amber-300 flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Bağlanıyor...
                </span>
              )}
              {routeBinding.status === "error" && (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Hata
                </span>
              )}
              {routeBinding.status === "idle" && (
                <span className="text-slate-400">Beklemede</span>
              )}
            </div>
          </div>

          {/* Metric 3: Anycast Network */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>Anycast Edge</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xs font-black text-white">
              310+ Global PoP
            </div>
          </div>

          {/* Metric 4: Worker Engine */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>Runtime Engine</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xs font-bold text-slate-300 truncate">
              V8 Isolate / Edge
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Panels: Asset Uploading Status & Route Binding Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PANEL A: ASSET UPLOADING REAL-TIME STATUS */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileUp className="w-4 h-4 text-cyan-400" />
              <span>Statik Varlık Yükleme (Asset Uploading)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                {uploadedAssetsCount}/{totalAssetsCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAssetList(!showAssetList)}
              className="text-slate-400 hover:text-white p-1 text-xs flex items-center gap-1"
            >
              <span>{showAssetList ? "Gizle" : "Göster"}</span>
              {showAssetList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Asset summary alert message */}
          {failedAssetsCount > 0 ? (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">Varlık Yükleme Hatası (Asset Upload Error)</div>
                <div className="text-[11px] text-rose-300/90">
                  {failedAssetsCount} adet dosya Cloudflare KV/Asset deposuna yüklenirken hata oluştu. Lütfen dosya boyutlarını ve API yetkilerini kontrol edin.
                </div>
              </div>
            </div>
          ) : uploadedAssetsCount === totalAssetsCount && totalAssetsCount > 0 ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-200">Varlıklar Başarıyla Yüklendi (Asset Uploading Succeeded)</div>
                <div className="text-[11px] text-emerald-300/90">
                  Tüm {totalAssetsCount} statik dosya ve HTML bileşenleri Cloudflare Edge KV/Static Assets deposuna başarıyla aktarıldı.
                </div>
              </div>
            </div>
          ) : null}

          {/* Asset List Scroll Area */}
          {showAssetList && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {assets.map((asset) => (
                <div
                  key={asset.id || asset.fileName}
                  className={`p-2 rounded-lg border flex items-center justify-between text-[11px] transition-all ${
                    asset.status === "success"
                      ? "bg-slate-950/60 border-emerald-500/20 text-slate-300"
                      : asset.status === "error"
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                      : asset.status === "uploading"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200 animate-pulse"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {asset.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {asset.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    {asset.status === "uploading" && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />}
                    {asset.status === "pending" && <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />}
                    <span className="font-bold truncate text-white">{asset.fileName}</span>
                    <span className="text-[10px] text-slate-500">({(asset.sizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-slate-500 hidden sm:inline">{asset.hash.slice(0, 10)}...</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        asset.status === "success"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : asset.status === "error"
                          ? "bg-rose-500/20 text-rose-300"
                          : asset.status === "uploading"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {asset.status === "success" && "200 OK"}
                      {asset.status === "error" && "Hata"}
                      {asset.status === "uploading" && "Yükleniyor"}
                      {asset.status === "pending" && "Sırada"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL B: ROUTE BINDING REAL-TIME STATUS */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Route Binding (Yönlendirme Eşleştirme)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  routeBinding.status === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : routeBinding.status === "error"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : routeBinding.status === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {routeBinding.status === "success" && "✓ Bağlandı"}
                {routeBinding.status === "error" && "✗ Bağlantı Hatası"}
                {routeBinding.status === "pending" && "Eşleniyor..."}
                {routeBinding.status === "idle" && "Beklemede"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRouteDetails(!showRouteDetails)}
              className="text-slate-400 hover:text-white p-1 text-xs flex items-center gap-1"
            >
              <span>{showRouteDetails ? "Gizle" : "Göster"}</span>
              {showRouteDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Route Binding Result Message */}
          {routeBinding.status === "error" ? (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Route Binding Hatası (Route Binding Error)</span>
              </div>
              <p className="text-[11px] text-rose-300/90 font-mono pl-6">
                {routeBinding.error || "Cloudflare Zone üzerinde rota tanımlanamadı. Zone ID veya alan adı eşleşmesini kontrol edin."}
              </p>
            </div>
          ) : routeBinding.status === "success" ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Route Binding Başarıyla Eşleştirildi (Route Binding Succeeded)</span>
              </div>
              <p className="text-[11px] text-emerald-300/90 font-mono pl-6">
                Trafik deseni <strong className="text-amber-300">{routeBinding.pattern}</strong> başarıyla Worker scriptine yönlendirildi. (Route ID: {routeBinding.routeId || "cf-rt-default"})
              </p>
            </div>
          ) : null}

          {/* Route Config Grid */}
          {showRouteDetails && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Route Pattern:</span>
                <span className="text-amber-400 font-bold">{routeBinding.pattern || "*/*"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Worker Script:</span>
                <span className="text-cyan-400 font-bold">{routeBinding.workerName || "worker-edge-site"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Cloudflare Zone ID:</span>
                <span className="text-slate-300">{routeBinding.zoneId || "Tanımlanmamış"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Anycast Dispatch:</span>
                <span className="text-emerald-400 font-bold">Aktif (Global Tier 1)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Terminal Log Console with Filtering, Search & Copy */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>deployment.log (Cloudflare Workers Push Stream)</span>
            </span>
          </div>

          {/* Console Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Log ara..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-[11px] text-white font-mono placeholder-slate-600 focus:border-amber-500 focus:outline-none w-28 sm:w-36"
              />
            </div>

            {/* Auto scroll toggle */}
            <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3 h-3"
              />
              <span className="hidden sm:inline">Oto Kaydır</span>
            </label>

            {/* Copy Button */}
            <button
              type="button"
              id="btn-copy-deployment-logs"
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Tüm log çıktısını panoya kopyala"
            >
              {copiedLogs ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kopyala</span>
                </>
              )}
            </button>

            {/* Clear Button */}
            {onClearLogs && (
              <button
                type="button"
                onClick={onClearLogs}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-[11px] transition-all cursor-pointer"
                title="Log ekranını temizle"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilterLevel("all")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              filterLevel === "all" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Tümü ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel("asset_upload")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              filterLevel === "asset_upload" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Varlık Yükleme
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel("route_binding")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              filterLevel === "route_binding" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Route Binding
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel("success")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              filterLevel === "success" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Başarılar ({logs.filter((l) => l.level === "success").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel("errors")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              filterLevel === "errors" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-rose-400"
            }`}
          >
            Hatalar ({logs.filter((l) => l.level === "error").length})
          </button>
        </div>

        {/* Console Log Stream */}
        <div
          ref={logsContainerRef}
          className="p-4 max-h-72 overflow-y-auto font-mono text-xs space-y-1.5 bg-black/95 select-text"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-600 text-xs italic">
              {searchQuery ? "Arama kriterine uygun log kaydı bulunamadı." : "Henüz log kaydı yok. 'Workers Push Başlat' butonuna basınız."}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isError = log.level === "error";
              const isSuccess = log.level === "success";
              const isWarning = log.level === "warning";

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 px-1.5 rounded transition-colors ${
                    isError
                      ? "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500"
                      : isSuccess
                      ? "bg-emerald-950/20 text-emerald-300 border-l-2 border-emerald-500"
                      : isWarning
                      ? "bg-amber-950/20 text-amber-300 border-l-2 border-amber-500"
                      : "text-slate-300 hover:bg-slate-900/50"
                  }`}
                >
                  <span className="text-[10px] text-slate-500 select-none shrink-0 pt-0.5">
                    {log.timestamp}
                  </span>

                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black tracking-wider shrink-0 select-none ${
                      isError
                        ? "bg-rose-500 text-white"
                        : isSuccess
                        ? "bg-emerald-500 text-slate-950"
                        : isWarning
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {log.level}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 select-none shrink-0">
                    [{log.stage}]
                  </span>

                  <div className="flex-1 break-words">
                    <span>{log.message}</span>
                    {log.details && (
                      <div className="text-[10px] text-slate-400 mt-0.5 bg-slate-900/60 p-1.5 rounded border border-slate-800 font-mono">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Terminal Footer Status Info */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cloudflare Anycast Stream: HTTP/3 TLS 1.3 Active</span>
          </div>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>Canlı URL: {liveUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
