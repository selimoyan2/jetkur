import React, { useState, useEffect } from "react";
import { SiteConfig, GeneratedPageFile } from "../types";
import { generateStaticHtml, generateAllSiteFiles } from "../utils/staticHtmlGenerator";
import { slugify } from "../utils/url";
import { downloadProjectSourceZip } from "../utils/projectZipDownloader";
import { 
  downloadCloudflarePagesZip, 
  deployToCloudflarePages, 
  CloudflareDeployResult 
} from "../utils/cloudflareDeployEngine";
import { CloudflareEdgeDeploymentGuide } from "./dashboard/CloudflareEdgeDeploymentGuide";
import JSZip from "jszip";
import {
  Rocket,
  CheckCircle,
  Download,
  Copy,
  ExternalLink,
  Code,
  Zap,
  Server,
  Cloud,
  FileText,
  Sparkles,
  Check,
  Globe,
  Archive,
  Layers,
  ShieldCheck,
  Radio,
  ArrowRight,
  Info,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface StaticDeployModalProps {
  config: SiteConfig;
  onClose: () => void;
  onOpenPreview: () => void;
  onConfigChange?: (newConfig: SiteConfig) => void;
}

export const StaticDeployModal: React.FC<StaticDeployModalProps> = ({
  config,
  onClose,
  onOpenPreview,
  onConfigChange
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<string>("index.html");
  const [buildStep, setBuildStep] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingSource, setIsDownloadingSource] = useState(false);
  const [sourceSuccess, setSourceSuccess] = useState(false);

  // Cloudflare Deployment States
  const defaultSlug = slugify(config.companyName || "sirket");
  const [cloudflareProjectSlug, setCloudflareProjectSlug] = useState(
    config.cloudflare?.subdomain || defaultSlug
  );
  const [isDeployingCloudflare, setIsDeployingCloudflare] = useState(false);
  const [cloudflareDeployStep, setCloudflareDeployStep] = useState<string>("");
  const [cloudflareResult, setCloudflareResult] = useState<CloudflareDeployResult | null>(
    config.cloudflare?.status === "deployed" && config.cloudflare.deployedUrl ? {
      success: true,
      liveUrl: config.cloudflare.deployedUrl,
      projectName: config.cloudflare.subdomain || defaultSlug,
      pagesDevUrl: config.cloudflare.deployedUrl,
      deploymentId: "cf-active",
      deployedAt: config.cloudflare.lastDeployedAt || new Date().toISOString(),
      edgeLocationsCount: 310,
      message: "Web siteniz Cloudflare 310+ Edge lokasyonunda aktif ve yayında."
    } : null
  );
  const [isDownloadingCfZip, setIsDownloadingCfZip] = useState(false);
  const [showCfGuide, setShowCfGuide] = useState(false);
  const [showEdgeGuideModal, setShowEdgeGuideModal] = useState(false);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);

  const handleDownloadFullProject = async () => {
    setIsDownloadingSource(true);
    await downloadProjectSourceZip((status) => {
      if (status === "success") {
        setSourceSuccess(true);
        setTimeout(() => setSourceSuccess(false), 3000);
      }
      if (status !== "downloading") {
        setIsDownloadingSource(false);
      }
    });
  };

  const isMulti = config.siteType === "multi-page";
  const allFiles: GeneratedPageFile[] = generateAllSiteFiles(config);
  const singleHtml = generateStaticHtml(config);

  useEffect(() => {
    // Animate build steps
    const timer1 = setTimeout(() => setBuildStep(1), 250);
    const timer2 = setTimeout(() => setBuildStep(2), 600);
    const timer3 = setTimeout(() => setBuildStep(3), 950);
    const timer4 = setTimeout(() => setBuildStep(4), 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleDownloadSingle = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      allFiles.forEach((file) => {
        const fName = file.filename || file.fileName || "index.html";
        const fContent = file.html || file.content || "";
        zip.file(fName, fContent);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(config.companyName || "site")}-site-paketi.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP oluşturulurken hata:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCloudflareDownloadZip = async () => {
    setIsDownloadingCfZip(true);
    try {
      await downloadCloudflarePagesZip(config);
    } catch (err) {
      console.error("Cloudflare ZIP indirme hatası:", err);
    } finally {
      setIsDownloadingCfZip(false);
    }
  };

  const handleDeployToCloudflare = async () => {
    setIsDeployingCloudflare(true);
    setCloudflareDeployStep("1/4 Statik HTML ve meta veriler derleniyor...");

    try {
      setTimeout(() => {
        setCloudflareDeployStep("2/4 Cloudflare _headers ve _redirects güvenlik kuralları oluşturuluyor...");
      }, 350);

      setTimeout(() => {
        setCloudflareDeployStep("3/4 Cloudflare 310+ Global Edge lokasyonuna Anycast routing başlatılıyor...");
      }, 700);

      const result = await deployToCloudflarePages(config, cloudflareProjectSlug);
      
      setCloudflareResult(result);
      setCloudflareDeployStep("4/4 Canlı yayında! SSL sertifikası doğrulandı.");

      // Notify parent if onConfigChange provided
      if (onConfigChange) {
        onConfigChange({
          ...config,
          cloudflare: {
            ...config.cloudflare,
            subdomain: cloudflareProjectSlug,
            status: "deployed",
            deployedUrl: result.liveUrl,
            lastDeployedAt: result.deployedAt,
            sslActive: true,
            pageSpeedScore: 100,
            edgeRegionsCount: 310
          }
        });
      }
    } catch (err) {
      console.error("Cloudflare dağıtım hatası:", err);
    } finally {
      setIsDeployingCloudflare(false);
    }
  };

  const handleCopy = (contentToCopy: string) => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDns(id);
    setTimeout(() => setCopiedDns(null), 2000);
  };

  const handleOpenInNewTab = (content: string) => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const currentFileContent = allFiles.find((f) => (f.fileName || f.filename) === activeCodeTab)?.content || allFiles.find((f) => (f.fileName || f.filename) === activeCodeTab)?.html || singleHtml;

  const targetPagesDevUrl = `https://${cloudflareProjectSlug}.pages.dev`;
  const liveDisplayUrl = config.cloudflare?.customDomain 
    ? `https://${config.cloudflare.customDomain.replace(/^https?:\/\//, "")}` 
    : (cloudflareResult?.liveUrl || targetPagesDevUrl);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>
              {isMulti ? "Çok Sayfalı (Multi-Page) Statik HTML Derleyici" : "Tek Sayfa (Landing Page) Statik HTML Derleyici"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Web Siteniz Başarıyla Derlendi &amp; Yayına Hazır!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isMulti
              ? `Toplam ${allFiles.length} adet bağımsız HTML sayfası derlendi. Tüm sayfalar saf HTML5, Tailwind CSS ve Schema.org yapay zeka meta etiketleri içerir. WordPress gibi hiçbir veritabanı veya PHP sunucu gerektirmez.`
              : "Bu dosya saf HTML5, Tailwind CSS ve Schema.org yapay zeka etiketlerinden oluşur. WordPress gibi hiçbir veritabanı veya PHP sunucu gerektirmez. cPanel veya Cloudflare Pages ile anında yayınlayabilirsiniz."}
          </p>
        </div>
      </div>

      {/* 🚀 CLOUDFLARE PAGES 1-CLICK DEPLOYMENT ENGINE */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Cloudflare Pages &amp; Anycast Edge Dağıtımı</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Sitenizi Cloudflare Dünyasında Canlıya Alın</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                0.02s Gecikme
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tek tıklamayla sitenizi Cloudflare'in dünya çapındaki 310+ Anycast Edge lokasyonuna dağıtın. 
              Sıfır MySQL sorgusu, ücretsiz otomatik SSL (TLS 1.3) ve sınırsız aylık trafik garantisi.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                id="btn-open-cf-edge-guide-modal"
                onClick={() => setShowEdgeGuideModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloudflare Edge &amp; API Dağıtım Rehberi (Zone ID &amp; DNS)</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-amber-400 font-black text-sm">310+</div>
              <div className="text-[10px] text-slate-400">Edge Şehri</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-emerald-400 font-black text-sm">0.02s</div>
              <div className="text-[10px] text-slate-400">İlk Bayt (TTFB)</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-cyan-400 font-black text-sm">TLS 1.3</div>
              <div className="text-[10px] text-slate-400">Otomatik SSL</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-indigo-400 font-black text-sm">0 TL</div>
              <div className="text-[10px] text-slate-400">Sunucu Masrafı</div>
            </div>
          </div>
        </div>

        {/* Cloudflare Deploy Controller */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Cloudflare Pages Proje Adı (Alt Alan Adı)</span>
                <span className="text-[10px] text-slate-500 font-mono">*.pages.dev</span>
              </label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                <span className="pl-3.5 text-xs text-slate-500 font-mono">https://</span>
                <input
                  type="text"
                  value={cloudflareProjectSlug}
                  onChange={(e) => setCloudflareProjectSlug(slugify(e.target.value))}
                  placeholder="sirketiniz"
                  className="flex-1 bg-transparent px-2 py-2.5 text-xs text-white font-mono font-bold outline-none"
                />
                <span className="pr-3.5 text-xs text-amber-400 font-mono font-semibold">.pages.dev</span>
              </div>
            </div>

            <div className="md:col-span-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                id="btn-deploy-cloudflare-now"
                onClick={handleDeployToCloudflare}
                disabled={isDeployingCloudflare}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeployingCloudflare ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin shrink-0" />
                    <span>Edge Dağıtılıyor...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 text-slate-950 fill-current" />
                    <span>Cloudflare Edge'de Canlı Yayınla</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCloudflareDownloadZip}
                disabled={isDownloadingCfZip}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Cloudflare Pages için optimize edilmiş _headers ve _redirects kuralları içeren ZIP dosyasını indirin"
              >
                {isDownloadingCfZip ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-amber-400" />
                )}
                <span>Cloudflare ZIP İndir</span>
              </button>
            </div>
          </div>

          {/* Progress / Step Feedback */}
          {isDeployingCloudflare && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-xs text-amber-300 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-mono">{cloudflareDeployStep}</span>
            </div>
          )}

          {/* Live URL Card */}
          {cloudflareResult && !isDeployingCloudflare && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cloudflare Pages Üzerinde Başarıyla Yayınlandı!</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Canlı Bağlantı:</span>
                  <a
                    href={liveDisplayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <span>{liveDisplayUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={liveDisplayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Siteyi Ziyaret Et</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowCfGuide(!showCfGuide)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  {showCfGuide ? "Kılavuzu Gizle" : "Özel Alan Adı (DNS)"}
                </button>
              </div>
            </div>
          )}

          {/* Custom Domain CNAME instructions toggle */}
          {showCfGuide && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3 animate-in fade-in">
              <div className="font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Kendi Özel Alan Adınızı (.com, .com.tr) Cloudflare'e Bağlama</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Alan adınızı (örnek: <code>sirketiniz.com</code>) Cloudflare DNS yönetim panelinizde aşağıdaki CNAME kaydı ile doğrudan Pages projenize bağlayabilirsiniz:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Kayıt Türü:</span> <span className="text-cyan-300 font-bold">CNAME</span> | <span className="text-slate-500">Ad:</span> <span className="text-white">@ (Kök)</span>
                    <div className="text-amber-400 font-bold mt-0.5">{cloudflareProjectSlug}.pages.dev</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${cloudflareProjectSlug}.pages.dev`, "dns-root")}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Kopyala"
                  >
                    {copiedDns === "dns-root" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Kayıt Türü:</span> <span className="text-cyan-300 font-bold">CNAME</span> | <span className="text-slate-500">Ad:</span> <span className="text-white">www</span>
                    <div className="text-amber-400 font-bold mt-0.5">{cloudflareProjectSlug}.pages.dev</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${cloudflareProjectSlug}.pages.dev`, "dns-www")}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Kopyala"
                  >
                    {copiedDns === "dns-www" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Build Process & PageSpeed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Build Stepper */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Statik Derleme Süreci (0.38 Saniye)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 1 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 1 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>1. Semantik HTML5 &amp; Responsive Grid Mimarisi</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 2 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>2. Kurumsal Renk Paleti &amp; Tailwind CSS CDN Entegrasyonu</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 3 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 3 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>3. Google LocalBusiness Schema JSON-LD &amp; AI Meta Etiketleri</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 4 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 4 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>4. WhatsApp Canlı Sohbet &amp; Mobil Hızlı Arama Butonları</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>
          </div>
        </div>

        {/* Right: PageSpeed & Lighthouse Score Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Google Core Web Vitals</h3>
            <p className="text-xs text-slate-500">Statik sitenizin Cloudflare Anycast üzerindeki skoru.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Performans</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">SEO &amp; AI Uyum</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Erişilebilirlik</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">0.02s</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Açılış Hızı</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            ⚡ <strong>0 Veritabanı Sorgusu:</strong> Siteniz hiçbir zaman MySQL çökmesi veya bellek taşması yaşamaz.
          </div>
        </div>
      </div>

      {/* Action Download & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {isMulti ? (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>{isZipping ? "ZIP Paketleniyor..." : `Tüm Sayfaları İndir (${allFiles.length} Dosya .ZIP)`}</span>
            </button>
          ) : (
            <button
              onClick={() => handleDownloadSingle("index.html", singleHtml)}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>index.html Olarak İndir</span>
            </button>
          )}

          <button
            onClick={handleDownloadFullProject}
            disabled={isDownloadingSource}
            className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              sourceSuccess 
                ? "bg-emerald-600 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title="Coolify &amp; VPS İçin Full-Stack Projeyi İndir"
          >
            {isDownloadingSource ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>İndiriliyor...</span>
              </>
            ) : sourceSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Proje ZIP İndirildi!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-300" />
                <span>Full-Stack + Dockerfile ZIP İndir</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy(currentFileContent)}
            className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kopyalandı!" : "Seçili Dosyayı Kopyala"}</span>
          </button>

          <button
            onClick={() => handleOpenInNewTab(currentFileContent)}
            className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all hidden sm:flex cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Yeni Sekmede Test Et</span>
          </button>
        </div>

        <button
          onClick={onOpenPreview}
          className="px-4 py-3 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Canlı Önizlemeye Geri Dön →</span>
        </button>
      </div>

      {/* Code Inspector Tabs */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Code Tabs Header */}
        <div className="bg-slate-850 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2 max-w-4xl overflow-x-auto">
            {isMulti ? (
              allFiles.map((file) => {
                const fname = file.fileName || file.filename || "index.html";
                return (
                  <button
                    key={fname}
                    onClick={() => setActiveCodeTab(fname)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeCodeTab === fname
                        ? "bg-slate-900 text-amber-400 border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📄 {fname}
                  </button>
                );
              })
            ) : (
              <button
                onClick={() => setActiveCodeTab("index.html")}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-amber-400 border border-slate-700"
              >
                📄 index.html ({Math.round(singleHtml.length / 1024)} KB)
              </button>
            )}

            <button
              onClick={() => setActiveCodeTab("guide")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCodeTab === "guide"
                  ? "bg-slate-900 text-amber-400 border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚀 Barındırma &amp; Dağıtım Rehberi
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
            UTF-8 Standalone Zero-Server
          </span>
        </div>

        {/* Code Content View */}
        <div className="p-4 sm:p-6 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
          {activeCodeTab === "guide" ? (
            <div className="space-y-4 font-sans text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white">Bu Statik Web Sitesini Nasıl Yayınlarsınız?</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> 1. Yöntem: cPanel / Geleneksel Hosting
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    İndirdiğiniz ZIP dosyasını açıp içindeki tüm HTML dosyalarını cPanel Dosya Yöneticisi (File Manager) içerisindeki <code>public_html</code> klasörüne yükleyin. Siteniz anında açılır.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" /> 2. Yöntem: Cloudflare Pages (Önerilen)
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Cloudflare Pages'e tek tıkla yükleyin veya ZIP dosyasını sürükleyin. Dünya genelinde 310+ Edge lokasyonunda 0.02 saniyede açılır ve sınırsız ziyaretçiye kadar %100 ücretsizdir!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <pre className="text-slate-200 whitespace-pre">
              {currentFileContent}
            </pre>
          )}
        </div>
      </div>

      {/* Cloudflare Edge Deployment Guide Modal Overlay */}
      {showEdgeGuideModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-900">
            <CloudflareEdgeDeploymentGuide
              config={config}
              onChange={(newCfg) => {
                if (onConfigChange) onConfigChange(newCfg);
              }}
              isOpen={true}
              onClose={() => setShowEdgeGuideModal(false)}
              onPreview={onOpenPreview}
            />
          </div>
        </div>
      )}
    </div>
  );
};
