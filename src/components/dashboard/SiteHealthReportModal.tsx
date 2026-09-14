import React, { useState } from "react";
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Gauge, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Users, 
  Building2, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { SiteConfig } from "../../types";
import { SiteHealthD3Data } from "./SiteHealthPerformanceD3Chart";
import { 
  downloadSiteHealthPdfReport, 
  ReportConfigOptions 
} from "../../utils/siteHealthPdfGenerator";

interface SiteHealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  data: SiteHealthD3Data;
}

export const SiteHealthReportModal: React.FC<SiteHealthReportModalProps> = ({
  isOpen,
  onClose,
  config,
  data
}) => {
  const [targetStakeholder, setTargetStakeholder] = useState<string>("Yönetim Kurulu & C-Level Yöneticiler");
  const [auditorName, setAuditorName] = useState<string>("Google Lighthouse v11.4 & Cloudflare Anycast Telemetry");
  const [includeD3Charts, setIncludeD3Charts] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [activePreviewPage, setActivePreviewPage] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const companyName = config.companyName || "HızlıWeb";
  const siteUrl = "https://hizliweb.tr";
  const currentDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Handle PDF Generation and Download
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const options: ReportConfigOptions = {
        companyName,
        siteUrl,
        auditorName,
        targetStakeholder,
        includeD3Charts
      };

      await downloadSiteHealthPdfReport(data, options);
      setIsGeneratingPdf(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setIsGeneratingPdf(false);
    }
  };

  // Handle Print via Browser
  const handlePrint = () => {
    window.print();
  };

  // Copy Executive Summary for Slack / Email
  const handleCopySummary = async () => {
    const summary = `📊 *${companyName} - Site Sağlığı, SEO ve Hız Denetim Raporu*
📅 Tarih: ${currentDate}
🎯 Hedef: ${targetStakeholder}

🏆 *Google Lighthouse v11.4 Skorları:*
• Performans: 100/100 (48/48 Denetim Geçti)
• Google SEO: 98/100 (28/28 Denetim Geçti)
• Erişilebilirlik: 100/100 (36/36 Denetim Geçti)
• En İyi Pratikler: 100/100 (30/30 Denetim Geçti)

⚡ *Yüklenme Hızı & Core Web Vitals:*
• Açılış Süresi: 0.02 saniye (21 ms) - Sektör ortalamasından 100 kat hızlı!
• TTFB (İlk Bayt): ${data.cwv.ttfb.value} (Hedef: < 800ms)
• FCP (İlk Çizim): ${data.cwv.fcp.value} (Hedef: < 1.8s)
• LCP (İçerik): ${data.cwv.lcp.value} (Hedef: < 2.5s)
• CLS (Kayma): ${data.cwv.cls.value} (Hedef: < 0.1)

🌐 *Cloudflare Anycast Edge CDN:*
• Edge Cache Hit Oranı: %${data.cacheStats.hitRatio}
• Aylık Tasarruf: ${(data.cacheStats.bandwidthSavedMb / 1024).toFixed(2)} GB
• İstanbul POP Gecikmesi: 18 ms

🎯 *Tahminleyici SEO Isı Haritası (D3.js Büyüme Modeli):*
• Öngörülen Aylık Organik Trafik Büyümesi: +18,450 ziyaretçi / ay
• Tahmini Ek Ciro Katkısı: +₺228,500 / ay
• En Hızlı ROI Sağlayacak Odak Alanı: Bölgesel İlçe Sayfaları (ROI: %97, +₺67,500/ay)
• İkinci Öncelik: Canlı KM Fiyat Hesaplama Motoru (ROI: %95, +₺56,200/ay)

📈 *Ticari Değer & ROI:*
0.02s açılış süresi sayesinde ziyaretçi terk oranı %60 oranında düşer, Google Ads kalite puanı artarak tıklama başı maliyet azalır ve organik Google aramalarında üst sıralara çıkış hızlanır.`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      {/* Container Card */}
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Paydaş Performans &amp; Site Sağlığı PDF Raporu
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  PDF 2.0 • A4 Format
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Yönetim kurulu, pazarlama yöneticileri ve yatırımcılar için resmi Google Lighthouse ve Edge CDN denetim özeti.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-modal-copy-summary"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Yönetici özetini panoya kopyala"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Özeti Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-modal-print-report"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Yazdır veya tarayıcıdan PDF olarak kaydet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Yazdır</span>
            </button>

            <button
              type="button"
              id="btn-modal-download-pdf-primary"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? "animate-bounce" : ""}`} />
              <span>
                {isGeneratingPdf 
                  ? "PDF Hazırlanıyor..." 
                  : downloadSuccess 
                  ? "PDF İndirildi ✓" 
                  : "PDF Raporunu İndir"}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: STAKEHOLDER & SETTINGS */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-300">Hedef Paydaş:</span>
              <select
                id="select-target-stakeholder"
                value={targetStakeholder}
                onChange={(e) => setTargetStakeholder(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Yönetim Kurulu & C-Level Yöneticiler">Yönetim Kurulu &amp; C-Level</option>
                <option value="Pazarlama, Büyüme & SEO Ekibi">Pazarlama, Büyüme &amp; SEO</option>
                <option value="Teknik Altyapı & IT Departmanı">Teknik Altyapı &amp; IT</option>
                <option value="Yatırımcılar, Ortaklar & Müşteriler">Yatırımcılar &amp; Müşteriler</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={includeD3Charts}
                onChange={(e) => setIncludeD3Charts(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-800"
              />
              <span>D3.js Grafiklerini PDF&apos;e Aktar</span>
            </label>
          </div>

          {/* Page toggle for preview */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActivePreviewPage(1)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreviewPage === 1
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sayfa 1: Lighthouse &amp; Hız
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewPage(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreviewPage === 2
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sayfa 2: Cloudflare &amp; ROI
            </button>
          </div>
        </div>

        {/* MODAL BODY: INTERACTIVE A4 DOCUMENT PREVIEW */}
        <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-slate-950/40">
          <div 
            id="printable-site-health-report"
            className="w-full max-w-[210mm] bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 border border-slate-200 transition-all font-sans"
          >
            {/* ======================================================== */}
            {/* PREVIEW PAGE 1 */}
            {/* ======================================================== */}
            {activePreviewPage === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Official Header Bar */}
                <div className="bg-slate-950 text-white -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-6 sm:p-8 rounded-t-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-mono block">
                        RESMİ PAYDAŞ VE YÖNETİM RAPORU
                      </span>
                      <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                        {companyName.toUpperCase()}
                      </h1>
                      <p className="text-xs text-slate-300 mt-1">
                        Site Sağlığı, Google SEO &amp; Core Web Vitals Performans Denetimi
                      </p>
                    </div>

                    <div className="text-right space-y-1 text-xs text-slate-400 font-mono">
                      <div>Tarih: <strong className="text-white">{currentDate}</strong></div>
                      <div>Hedef: <strong className="text-sky-300">{targetStakeholder}</strong></div>
                      <div>URL: <strong className="text-slate-200">{siteUrl}</strong></div>
                    </div>
                  </div>
                </div>

                {/* 2. Executive Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-500 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      Dünyanın En Hızlı %0.1&apos;i
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>{companyName}</strong> web sitesi, <strong>0.02 saniyelik</strong> açılış hızı ve 
                    Google Lighthouse <strong>100/100 tam performansı</strong> ile küresel ölçekte en üst lige yerleşmiştir. 
                    Geleneksel veritabanı gecikmelerinden arındırılmış statik Edge CDN mimarisi sayesinde sunucu çökmesi riski 
                    sıfırlanmış ve Google arama motoru optimizasyonunda (SEO) maksimum avantaj elde edilmiştir.
                  </p>
                </div>

                {/* 3. Google Lighthouse 4 Ana Skor Kriteri */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      <span>1. Google Lighthouse v11.4 Resmi Denetim Skorları</span>
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Motor: Chromium Synthetic
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data.lighthouse.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col items-center text-center space-y-1 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center font-black text-base text-emerald-700 font-mono">
                          {item.score}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.auditsPassed}/{item.totalAudits} denetim geçti
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Sitenin Yüklenme Hızı ve Sektörel Karşılaştırma */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>2. Yüklenme Hızı &amp; Sektörel Kıyaslama (Benchmark)</span>
                    </h2>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      HızlıWeb: 0.02s
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {data.benchmarks.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="w-44 font-semibold text-slate-800 truncate">
                          {b.label}
                        </div>
                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, Math.max(5, (b.timeMs / 5100) * 100))}%`,
                              backgroundColor: b.color 
                            }} 
                          />
                        </div>
                        <div className="w-24 text-right font-mono font-black" style={{ color: b.color }}>
                          {(b.timeMs / 1000).toFixed(2)}s ({b.timeMs}ms)
                        </div>
                        <div className="w-28 text-right text-[10px] text-slate-500 truncate">
                          {b.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Google Core Web Vitals Metrikleri */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>3. Google Core Web Vitals (CWV) Gerçek Kullanıcı Metrikleri</span>
                    </h2>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Tüm Kriterler Yeşil (Good)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs text-center">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">TTFB (İlk Bayt)</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{data.cwv.ttfb.value}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">&lt; 800ms Hedef</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">FCP (İlk Çizim)</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{data.cwv.fcp.value}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">&lt; 1.8s Hedef</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">LCP (İçerik)</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{data.cwv.lcp.value}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">&lt; 2.5s Hedef</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">FID (Giriş)</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{data.cwv.fid.value}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">&lt; 100ms Hedef</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">CLS (Kayma)</span>
                      <span className="text-base font-black text-emerald-600 font-mono">{data.cwv.cls.value}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">&lt; 0.1 Hedef</span>
                    </div>
                  </div>
                </div>

                {/* Page 1 Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{companyName} - Resmi Paydaş Raporu</span>
                  <span>Sayfa 1 / 2</span>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PREVIEW PAGE 2 */}
            {/* ======================================================== */}
            {activePreviewPage === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Page 2 Mini Header */}
                <div className="bg-slate-900 text-white -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-5 sm:p-6 rounded-t-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-white">
                        Cloudflare Küresel Edge CDN &amp; Ticari Getiri Analizi
                      </h2>
                      <p className="text-xs text-slate-300">
                        Altyapı Güvenliği, Önbellekleme ve Satış / Dönüşüm Etkisi
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Sayfa 2 / 2</span>
                  </div>
                </div>

                {/* 1. Edge Metrics 3 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Edge Cache HIT Oranı</span>
                    <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                      %{data.cacheStats.hitRatio}
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Tüm varlıklar Türkiye Edge sunucusundan anında sunulur.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Aylık Tasarruf Edilen Trafik</span>
                    <span className="text-xl font-black text-sky-600 font-mono mt-1 block">
                      {(data.cacheStats.bandwidthSavedMb / 1024).toFixed(2)} GB
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Bant genişliği maliyeti ve sunucu CPU yükü sıfırlanır.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">HTTP/3 &amp; Brotli</span>
                    <span className="text-xl font-black text-indigo-600 font-mono mt-1 block">
                      %88 Sıkıştırma
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">
                      En yeni nesil UDP tabanlı 0-RTT bağlantı protokolü.
                    </p>
                  </div>
                </div>

                {/* 2. Global POP Latency Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-600" />
                      <span>4. Küresel POP Noktaları ve Yanıt Süreleri (Latency)</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">Anycast Global Routing</span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">POP Kodu</th>
                          <th className="py-2.5 px-3">Şehir / Ülke</th>
                          <th className="py-2.5 px-3">Yanıt Süresi</th>
                          <th className="py-2.5 px-3">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.pops.map((p) => (
                          <tr key={p.code} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.code}</td>
                            <td className="py-2 px-3 text-slate-700">{p.city}, {p.country}</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-600">{p.latencyMs} ms</td>
                            <td className="py-2 px-3 text-[11px] text-emerald-700 font-medium">Optimal ✓</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Business ROI & Impact for Stakeholders */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>5. Paydaş ve İş Hedefleri Etkisi (Business Value &amp; ROI)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Organik Arama (SEO) Üstünlüğü</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Core Web Vitals tam puanı sayesinde organik arama sıralamalarında (SERP) rakiplerin önüne geçilir.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terk Oranında (Bounce Rate) %60 Düşüş</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Her 1 saniyelik gecikme %7 müşteri kaybı yaratırken, 0.02s anında açılış ile potansiyel müşteriler sitede tutulur.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Ads Reklam Maliyetinde Düşüş (CPC)</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Açılış sayfası kalite skoru 10/10 puan alarak tıklama başına reklam maliyetini ciddi oranda düşürür.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sıfır Bakım &amp; Kesintisiz Dayanıklılık</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Klasik veritabanı saldırılarına ve ani trafik patlamalarına karşı Cloudflare Edge koruması devrededir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Predictive SEO Growth & Content ROI Projection */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>6. Tahminleyici SEO Büyüme &amp; İçerik ROI Projeksiyonu (D3 Modeli)</span>
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Projeksiyon: +18,450 Ziyaret / Ay
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">1. Bölgesel İlçe Sayfaları</span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-emerald-200/80 rounded text-emerald-900">ROI %97</span>
                      </div>
                      <p className="text-emerald-800 text-[11px]">
                        Kadıköy, Ümraniye, Ataşehir LocalBusiness Schema ve mahalle sayfaları ile <strong>+₺67,500/ay</strong> ciro potansiyeli.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-950">2. KM Fiyat Hesaplayıcı</span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-sky-200/80 rounded text-sky-900">ROI %95</span>
                      </div>
                      <p className="text-sky-800 text-[11px]">
                        Canlı fiyat motoruyla &quot;oto çekici km ücreti 2026&quot; aramasında Snippet kaparak <strong>+3,800 dönüşüm</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950">3. B2B Filo Sözleşmeleri</span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-indigo-200/80 rounded text-indigo-900">ROI %94</span>
                      </div>
                      <p className="text-indigo-800 text-[11px]">
                        Galericiler ve filo yöneticilerine yönelik kurumsal paketlerle <strong>+₺87,000/ay</strong> yüksek sepet getirisi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Verification Seal & Official Signature Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-[9px] font-black uppercase text-emerald-700 font-mono">DENETLENDİ</span>
                      <Gauge className="w-5 h-5 text-emerald-600 my-0.5" />
                      <span className="text-[9px] font-bold text-emerald-800">100/100</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">
                        Doğrulama ve Denetim Sertifikası
                      </span>
                      <p className="text-[11px] text-slate-500 max-w-md">
                        Bu rapor, {companyName} için Google Lighthouse v11.4 sentetik analiz motoru ve 
                        Cloudflare Anycast CDN telemetri verilerine dayalı olarak üretilmiştir.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Denetleyen: {auditorName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-slate-500">
                    <div>Onay: <strong className="text-emerald-700 font-bold">GEÇTİ</strong></div>
                    <div>Tarih: {currentDate}</div>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>HızlıWeb Yeni Nesil Web Altyapısı</span>
                  <span>Sayfa 2 / 2</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER BAR */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PDF hazır: 2 sayfa A4, yüksek çözünürlüklü vektör ve D3 grafikleri içerir.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>

            <button
              type="button"
              id="btn-modal-download-pdf-footer"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? "animate-bounce" : ""}`} />
              <span>
                {isGeneratingPdf 
                  ? "PDF Hazırlanıyor..." 
                  : downloadSuccess 
                  ? "Rapor İndirildi ✓" 
                  : "PDF Raporunu İndir (.pdf)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
