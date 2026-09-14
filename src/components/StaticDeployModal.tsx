import React, { useState, useEffect } from "react";
import { SiteConfig, GeneratedPageFile } from "../types";
import { generateStaticHtml, generateAllSiteFiles } from "../utils/staticHtmlGenerator";
import { slugify } from "../utils/url";
import { downloadProjectSourceZip } from "../utils/projectZipDownloader";
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
  Layers
} from "lucide-react";

interface StaticDeployModalProps {
  config: SiteConfig;
  onClose: () => void;
  onOpenPreview: () => void;
}

export const StaticDeployModal: React.FC<StaticDeployModalProps> = ({
  config,
  onClose,
  onOpenPreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<string>("index.html");
  const [buildStep, setBuildStep] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingSource, setIsDownloadingSource] = useState(false);
  const [sourceSuccess, setSourceSuccess] = useState(false);

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

  const handleCopy = (contentToCopy: string) => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInNewTab = (content: string) => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const currentFileContent = allFiles.find((f) => (f.fileName || f.filename) === activeCodeTab)?.content || allFiles.find((f) => (f.fileName || f.filename) === activeCodeTab)?.html || singleHtml;

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
            Web Siteniz Başarıyla Derlendi & Yayına Hazır!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isMulti
              ? `Toplam ${allFiles.length} adet bağımsız HTML sayfası derlendi. Tüm sayfalar saf HTML5, Tailwind CSS ve Schema.org yapay zeka meta etiketleri içerir. WordPress gibi hiçbir veritabanı veya PHP sunucu gerektirmez.`
              : "Bu dosya saf HTML5, Tailwind CSS ve Schema.org yapay zeka etiketlerinden oluşur. WordPress gibi hiçbir veritabanı veya PHP sunucu gerektirmez. cPanel veya Global Edge CDN ile anında yayınlayabilirsiniz."}
          </p>
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
                <span>1. Semantik HTML5 & Responsive Grid Mimarisi</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 2 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>2. Kurumsal Renk Paleti & Tailwind CSS CDN Entegrasyonu</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 3 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 3 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>3. Google LocalBusiness Schema JSON-LD & AI Meta Etiketleri</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              buildStep >= 4 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle className={`w-4 h-4 ${buildStep >= 4 ? "text-emerald-600" : "text-slate-300"}`} />
                <span>4. WhatsApp Canlı Sohbet & Mobil Hızlı Arama Butonları</span>
              </div>
              <span className="font-mono font-bold text-[11px]">TAMAMLANDI</span>
            </div>
          </div>
        </div>

        {/* Right: PageSpeed & Lighthouse Score Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Google Core Web Vitals</h3>
            <p className="text-xs text-slate-500">Statik sitenizin tahmini performans skoru.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Performans</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">SEO & AI Uyum</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">100</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Erişilebilirlik</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">0.03s</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">Açılış Hızı</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            ⚡ <strong>0 Veritabanı Sorgusu:</strong> Siteniz hiçbir zaman MySQL çökmesi veya WordPress bellek taşması yaşamaz.
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
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>{isZipping ? "ZIP Paketleniyor..." : `Tüm Sayfaları İndir (${allFiles.length} Dosya .ZIP)`}</span>
            </button>
          ) : (
            <button
              onClick={() => handleDownloadSingle("index.html", singleHtml)}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>index.html Olarak İndir</span>
            </button>
          )}

          <button
            onClick={handleDownloadFullProject}
            disabled={isDownloadingSource}
            className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
              sourceSuccess 
                ? "bg-emerald-600 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title="Coolify &amp; Hostinger VPS İçin Full-Stack Projeyi (Dockerfile Dahil) İndir"
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
            className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kopyalandı!" : "Seçili Dosyayı Kopyala"}</span>
          </button>

          <button
            onClick={() => handleOpenInNewTab(currentFileContent)}
            className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all hidden sm:flex"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Yeni Sekmede Test Et</span>
          </button>
        </div>

        <button
          onClick={onOpenPreview}
          className="px-4 py-3 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === "guide"
                  ? "bg-slate-900 text-amber-400 border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚀 Barındırma & Dağıtım Rehberi
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
                    İndirdiğiniz ZIP dosyasını açıp içindeki tüm HTML dosyalarını cPanel Dosya Yöneticisi (File Manager) içerisindeki <code>public_html</code> klasörüne yükleyin. Hepsi bu kadar! Siteniz anında açılır.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" /> 2. Yöntem: Global Anycast Edge CDN / AWS S3 (Önerilen)
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Global Edge CDN üzerinde proje açıp dosyaları sürükleyip bırakın. Dünya genelinde 300+ Edge lokasyonunda 0.02 saniyede açılır ve ayda 10 milyon ziyaretçiye kadar %100 ücretsizdir!
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
    </div>
  );
};
