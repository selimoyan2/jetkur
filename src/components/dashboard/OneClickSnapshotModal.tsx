import React, { useState, useEffect } from "react";
import { SiteConfig } from "../../types";
import {
  collectAllMediaAssets,
  downloadOneClickSiteSnapshot,
  DiscoveredMediaAsset,
  SnapshotProgress,
  SnapshotResult
} from "../../utils/siteSnapshotGenerator";
import {
  Camera,
  Download,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  FileJson,
  Image as ImageIcon,
  FolderArchive,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

interface OneClickSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
}

export const OneClickSnapshotModal: React.FC<OneClickSnapshotModalProps> = ({
  isOpen,
  onClose,
  config,
  onNavigateTab
}) => {
  const [discoveredAssets, setDiscoveredAssets] = useState<DiscoveredMediaAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<SnapshotProgress | null>(null);
  const [result, setResult] = useState<SnapshotResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "assets_list">("overview");

  // Re-scan assets whenever modal opens or config changes
  useEffect(() => {
    if (isOpen) {
      const list = collectAllMediaAssets(config);
      setDiscoveredAssets(list);
      setProgress(null);
      setResult(null);
      setActiveSubTab("overview");
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleStartSnapshot = async () => {
    setIsProcessing(true);
    setResult(null);

    const res = await downloadOneClickSiteSnapshot(config, (p) => {
      setProgress(p);
    });

    setResult(res);
    setIsProcessing(false);
  };

  const configSizeKb = Math.round((JSON.stringify(config).length / 1024) * 10) / 10;
  const categoryCounts = discoveredAssets.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tek Tıkla Site Snapshot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  One-Click Offline Backup
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tüm <span className="text-slate-200 font-semibold">siteConfig.json</span> verinizi ve sitenizdeki <span className="text-emerald-300 font-semibold">{discoveredAssets.length} adet medya dosyasını</span> tek bir ZIP paketi olarak indirin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab("overview")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === "overview"
                  ? "bg-slate-800 text-emerald-300 font-bold border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Snapshot Özeti & İndirme
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("assets_list")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === "assets_list"
                  ? "bg-slate-800 text-emerald-300 font-bold border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Varlık Listesi</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 text-[10px] font-mono">
                {discoveredAssets.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>%100 Çevrimdışı ve Yerel Güvenli</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeSubTab === "overview" ? (
            <>
              {/* Snapshot Content Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Medya Varlıkları</span>
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {discoveredAssets.length} <span className="text-xs text-slate-400 font-sans font-normal">dosya</span>
                  </div>
                  <div className="text-[11px] text-emerald-400/90 mt-1 truncate">
                    Logo, Galeri, Ürün, Blog
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Konfigürasyon</span>
                    <FileJson className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {configSizeKb} <span className="text-xs text-slate-400 font-sans font-normal">KB</span>
                  </div>
                  <div className="text-[11px] text-indigo-300/90 mt-1 truncate">
                    Eksiksiz siteConfig.json
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Paket Formatı</span>
                    <FolderArchive className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    .ZIP <span className="text-xs text-slate-400 font-sans font-normal">Arşivi</span>
                  </div>
                  <div className="text-[11px] text-amber-300/90 mt-1 truncate">
                    DEFLATE Sıkıştırmalı
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Çevrimdışı Görüntüleyici</span>
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    HTML <span className="text-xs text-slate-400 font-sans font-normal">Dahil</span>
                  </div>
                  <div className="text-[11px] text-cyan-300/90 mt-1 truncate">
                    Çift tıkla yerel incele
                  </div>
                </div>
              </div>

              {/* What's inside the archive explanation */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <FolderArchive className="w-4 h-4 text-emerald-400" />
                  <span>Snapshot ZIP Paketinde Neler Bulunacak?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-mono text-indigo-400 font-bold">📄 siteConfig.json</span>
                    <span className="text-slate-400">Tüm metinler, menüler, SEO ve tasarım ayarları. Panodan anında geri yüklenebilir.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-mono text-emerald-400 font-bold">📁 media/ Klasörü</span>
                    <span className="text-slate-400">Sitenizde tanımlı tüm logo, hero, galeri ve ürün fotoğrafları yerel olarak saklanır.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-mono text-cyan-400 font-bold">🌐 index-offline-viewer.html</span>
                    <span className="text-slate-400">İnternet bağlantısı olmadan sitenizin içeriğini ve medya galerisini yerel olarak gezin.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-mono text-amber-400 font-bold">📑 README & Manifest</span>
                    <span className="text-slate-400">Geri yükleme adımları ve dosya URL eşleşmelerini içeren Türkçe rehber.</span>
                  </div>
                </div>
              </div>

              {/* Live Progress Bar during execution */}
              {isProcessing && progress && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{progress.message}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      %{progress.percent}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  {progress.currentAsset && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between truncate">
                      <span className="truncate">İşlenen Dosya: <span className="text-slate-200">{progress.currentAsset}</span></span>
                      <span className="font-mono text-slate-400">{progress.downloadedCount} / {progress.totalAssets}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Success Box */}
              {result && result.success && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>One-Click Site Snapshot Başarıyla Oluşturuldu ve İndirildi!</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Dosya Adı:</span>
                      <span className="font-mono font-bold text-slate-200 truncate block" title={result.zipFilename}>
                        {result.zipFilename}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Arşiv Boyutu:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {Math.round(result.zipSizeBytes / 1024)} KB
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Paketlenen Medya:</span>
                      <span className="font-mono font-bold text-white">
                        {result.downloadedAssets} / {result.totalAssets} Dosya
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    İndirilen <strong>.zip</strong> dosyasını bilgisayarınızda açıp içerisindeki <code>index-offline-viewer.html</code> dosyasını çift tıklayarak çevrimdışı inceleyebilirsiniz. Ayrıca bu yedek sistem içi <strong>Yedekler</strong> geçmişinize de otomatik olarak eklendi.
                  </p>
                </div>
              )}

              {/* Error Box */}
              {result && !result.success && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-300">Snapshot Paketlenirken Bir Sorun Oluştu</div>
                    <div>{result.error || "Bilinmeyen hata."}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Discovered Media Assets List Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Siteden Tespit Edilen Medya Varlıkları ({discoveredAssets.length})</span>
                <div className="flex items-center gap-1.5">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-slate-300"
                    >
                      {cat}: {count}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                {discoveredAssets.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Sitede henüz kayıtlı medya varlığı bulunamadı.
                  </div>
                ) : (
                  discoveredAssets.map((asset, idx) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-slate-500 text-[10px] w-5 text-right">
                          {idx + 1}.
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {asset.category}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-200 truncate" title={asset.title}>
                            {asset.title}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 truncate" title={asset.sourceUrl}>
                            media/{asset.targetFilename}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 ml-3">
                        {asset.sourceUrl.startsWith("data:") ? "DataURL" : "Uzak URL"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab("backups");
                }}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <span>Yedekler & Sürüm Yöneticisi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {result && result.success ? "Tamamla" : "Vazgeç"}
            </button>

            <button
              type="button"
              id="start-site-snapshot-btn"
              onClick={handleStartSnapshot}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Snapshot Paketleniyor...</span>
                </>
              ) : result && result.success ? (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Tekrar İndir (.ZIP)</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>Tek Tıkla Snapshot Al ve İndir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
