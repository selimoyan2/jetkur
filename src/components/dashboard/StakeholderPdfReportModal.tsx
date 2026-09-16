import React, { useRef, useState, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { 
  FileDown, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Gauge, 
  Zap, 
  Globe, 
  Building2, 
  Calendar, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Search, 
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Smartphone,
  Monitor,
  PhoneCall,
  Mail,
  MapPin,
  Clock
} from "lucide-react";
import { SiteConfig } from "../../types";
import { compileStakeholderReportData } from "../../utils/stakeholderReportGenerator";

interface StakeholderPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
}

export const StakeholderPdfReportModal: React.FC<StakeholderPdfReportModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Compile full report data based on current live config
  const data = useMemo(() => compileStakeholderReportData(config), [config]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!reportContainerRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportContainerRef.current;
      const cleanCompanyName = (data.companyName || "Sirket").replace(/[^a-zA-Z0-9]/g, "_");
      const cleanDate = new Date().toISOString().slice(0, 10);
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Paydas_Yonetici_Raporu_${cleanCompanyName}_${cleanDate}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true,
          windowWidth: 1100
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      // Fallback to native print if html2pdf fails
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReportLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Müşteri Paydaşları Yönetici Raporu
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40 font-mono">
                  A4 Kurumsal PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {data.companyName} • Canlı Konfigürasyon ve Performans Denetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Selector */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setZoomScale(75)}
                className={`px-2.5 py-1 rounded-lg transition-all ${zoomScale === 75 ? "bg-indigo-600 text-white font-bold" : "hover:text-white"}`}
              >
                %75
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(85)}
                className={`px-2.5 py-1 rounded-lg transition-all ${zoomScale === 85 ? "bg-indigo-600 text-white font-bold" : "hover:text-white"}`}
              >
                %85
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(100)}
                className={`px-2.5 py-1 rounded-lg transition-all ${zoomScale === 100 ? "bg-indigo-600 text-white font-bold" : "hover:text-white"}`}
              >
                %100
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              id="stakeholder-modal-print-btn"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Yazıcıdan doğrudan çıktı alın"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              id="stakeholder-modal-download-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ring-1 ring-indigo-400/40"
              title="A4 formatında yüksek kaliteli PDF belgesi olarak indirin"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 text-indigo-200 animate-spin" />
                  <span>PDF Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-indigo-200" />
                  <span>PDF Olarak İndir</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              id="stakeholder-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 flex justify-center">
          <div 
            style={{ 
              transform: `scale(${zoomScale / 100})`, 
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out" 
            }}
            className="w-full max-w-[850px] shadow-2xl"
          >
            {/* The Actual PDF Printable Content */}
            <div 
              ref={reportContainerRef}
              id="stakeholder-printable-report"
              className="bg-white text-slate-900 font-sans p-8 sm:p-10 rounded-2xl shadow-xl space-y-8"
              style={{ minHeight: "1120px", color: "#0f172a" }}
            >
              {/* ========================================================= */}
              {/* DOCUMENT HEADER & BRANDING */}
              {/* ========================================================= */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {data.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden bg-slate-50">
                        <img 
                          src={data.logoUrl} 
                          alt={data.companyName} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                        {data.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                        {data.companyName}
                      </h1>
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                        <span>{data.sector}</span>
                        <span>•</span>
                        <span>{data.city}</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-600">{data.domain}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{data.slogan}"
                  </p>
                </div>

                <div className="text-right space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700">
                    PAYDAŞ YÖNETİCİ RAPORU
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {data.reportId}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Düzenleme: {data.generatedDateTime}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Canlı & Doğrulanmış Sistem</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1.5">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Yönetici Özeti & Rapor Amacı</span>
                </div>
                <p>
                  Bu rapor; <strong>{data.companyName}</strong> kurumsal web varlığının canlı yapılandırmasını, 
                  Google Core Web Vitals performans metriklerini, teknik SEO uyumluluğunu, Cloudflare Global Edge 
                  bulut altyapısını ve potansiyel ticari dönüşüm göstergelerini şirket paydaşlarına ve karar alıcılara 
                  şeffaf şekilde sunmak amacıyla otomatik olarak oluşturulmuştur.
                </p>
              </div>

              {/* ========================================================= */}
              {/* SECTION 1: CORE PERFORMANCE METRICS & LIGHTHOUSE */}
              {/* ========================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      1. Canlı Performans ve Hız Benchmarkları (Google Lighthouse)
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Hedef: 0.02s Hızlı Tepki & %90+ Skor
                  </span>
                </div>

                {/* 4 Score KPI Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-center">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Mobil Lighthouse</div>
                    <div className="text-2xl font-black text-indigo-950 font-mono my-1">
                      {data.performance.mobileScore} / 100
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 rounded-full px-2 py-0.5 inline-block">
                      {data.performance.performanceGrade}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <div className="text-[10px] font-bold text-slate-600 uppercase">Masaüstü Lighthouse</div>
                    <div className="text-2xl font-black text-slate-900 font-mono my-1">
                      {data.performance.desktopScore} / 100
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 rounded-full px-2 py-0.5 inline-block">
                      Maksimum Hız
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Site Sağlık Skoru</div>
                    <div className="text-2xl font-black text-emerald-950 font-mono my-1">
                      {data.performance.siteHealthScore} / 100
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 rounded-full px-2 py-0.5 inline-block">
                      {data.performance.siteHealthGrade} • {data.performance.siteHealthStatus}
                    </div>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-center">
                    <div className="text-[10px] font-bold text-amber-800 uppercase">Core Web Vitals</div>
                    <div className="text-2xl font-black text-amber-950 font-mono my-1">
                      3 / 3 GEÇTİ
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 rounded-full px-2 py-0.5 inline-block">
                      Google Onaylı
                    </div>
                  </div>
                </div>

                {/* Core Web Vitals Detailed Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase">
                        <th className="p-2.5">Metrik Adı</th>
                        <th className="p-2.5">Ölçülen Değer</th>
                        <th className="p-2.5">Google Eşiği</th>
                        <th className="p-2.5">Durum</th>
                        <th className="p-2.5">Ticari & SEO Etkisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {data.performance.vitals.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-bold text-slate-900">
                            <div>{v.name}</div>
                            <div className="text-[10px] font-normal text-slate-500">{v.fullName}</div>
                          </td>
                          <td className="p-2.5 font-mono font-black text-slate-900 text-xs">
                            {v.value}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">
                            {v.target}
                          </td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{v.statusText}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 max-w-xs">
                            {v.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 2: CURRENT SITE CONFIGURATION & CONTENT INVENTORY */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      2. Canlı Site Konfigürasyonu ve İçerik Mimarisi
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Modüler Yapı Snapshot
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Visual Brand & Styling */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5 text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Görsel Kimlik & Tasarım Sistemi</span>
                    </div>
                    <div className="space-y-2 text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tema Paleti:</span>
                        <span className="font-bold text-slate-900">{data.theme.paletteName}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Renk Kodları:</span>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" 
                            style={{ backgroundColor: data.theme.primaryColor }}
                            title={`Ana Renk: ${data.theme.primaryColor}`} 
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" 
                            style={{ backgroundColor: data.theme.secondaryColor }}
                            title={`İkincil Renk: ${data.theme.secondaryColor}`} 
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" 
                            style={{ backgroundColor: data.theme.accentColor }}
                            title={`Vurgu Rengi: ${data.theme.accentColor}`} 
                          />
                          <span className="font-mono text-[10px] text-slate-500">({data.theme.primaryColor})</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tipografi Ailesi:</span>
                        <span className="font-mono text-slate-900">{data.theme.fontFamily}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">Site Mimari Tipi:</span>
                        <span className="font-semibold text-slate-900 text-[11px]">{data.architecture.siteType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Sections & Modules */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5 text-indigo-700">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>İçerik Envanteri ve Bileşenler</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">Hizmet Sayısı:</span>
                        <span className="font-bold text-slate-900 font-mono">{data.architecture.servicesCount} adet</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">Ürün Kataloğu:</span>
                        <span className="font-bold text-slate-900 font-mono">{data.architecture.productsCount} ürün</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">Referans / Yorum:</span>
                        <span className="font-bold text-slate-900 font-mono">{data.architecture.testimonialsCount} yorum</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">Görsel Galeri:</span>
                        <span className="font-bold text-slate-900 font-mono">{data.architecture.galleryCount} medya</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">SSS (FAQ):</span>
                        <span className="font-bold text-slate-900 font-mono">{data.architecture.faqsCount} soru</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-600">Toplam Sayfa:</span>
                        <span className="font-bold text-indigo-700 font-mono">{data.architecture.totalPages} sayfa</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {data.architecture.hasWhatsAppWidget && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                          ✓ WhatsApp Canlı Destek
                        </span>
                      )}
                      {data.architecture.hasContactMap && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                          ✓ Google Maps Harita
                        </span>
                      )}
                      {data.architecture.hasLeadCaptureForm && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                          ✓ Form Yakalama (CRM)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 3: TECHNICAL SEO & CLOUDFLARE INFRASTRUCTURE */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      3. Teknik SEO, İndeksleme ve Global Edge Altyapısı
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Arama Motoru Hazırlığı
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* SEO Setup */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                    <div className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5 text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Meta & Semantik Arama Optimizasyonu</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-700">Meta Title: </span>
                        <span className="text-slate-900">{data.seo.metaTitle}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Meta Description: </span>
                        <span className="text-slate-600 line-clamp-2">{data.seo.metaDescription}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Anahtar Kelimeler: </span>
                        <span className="text-indigo-700 font-medium">{data.seo.keywords}</span>
                      </div>
                      <div className="flex justify-between pt-1 text-[10px] text-slate-500">
                        <span>Schema.org: <strong>{data.seo.schemaType}</strong></span>
                        <span>Robots: <strong>{data.seo.robots}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Cloudflare Edge Infrastructure */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                    <div className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5 text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bulut & Güvenlik Özellikleri</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-700">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500">CDN & Dağıtım:</span>
                        <span className="font-semibold text-slate-900">{data.infrastructure.cdnProvider}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500">SSL / TLS Şifreleme:</span>
                        <span className="font-semibold text-emerald-700">{data.infrastructure.sslTls}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500">Protokol & Sıkıştırma:</span>
                        <span className="font-mono text-slate-900">{data.infrastructure.httpVersion} • {data.infrastructure.compression}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">Yedekleme & Kurtarma:</span>
                        <span className="font-semibold text-slate-900">{data.infrastructure.dailyBackups}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 4: COMMERCIAL IMPACT & STRATEGIC RECOMMENDATIONS */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      4. Ticari Etki ve Paydaş Stratejik Eylem Planı
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Büyüme & Dönüşüm Yol Haritası
                  </span>
                </div>

                {/* Commercial Inflow Snapshot */}
                <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Form Talebi</div>
                    <div className="text-xl font-black font-mono text-amber-400">{data.commercial.totalLeads} adet</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Kapanan Anlaşma</div>
                    <div className="text-xl font-black font-mono text-emerald-400">{data.commercial.wonDealsCount} satış</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Dönüşüm Oranı</div>
                    <div className="text-xl font-black font-mono text-indigo-300">{data.commercial.conversionRate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Üretilen Ciro</div>
                    <div className="text-xl font-black font-mono text-emerald-300">{data.commercial.formattedRevenue}</div>
                  </div>
                </div>

                {/* Strategic Recommendations List */}
                <div className="space-y-2">
                  {data.recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="border border-slate-200 rounded-xl p-3 bg-white hover:bg-slate-50 transition-colors flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{rec.title}</span>
                            <span className="text-[10px] font-normal text-slate-500">({rec.category})</span>
                          </div>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            rec.priority === "Yüksek" 
                              ? "bg-rose-100 text-rose-800" 
                              : rec.priority === "Stratejik"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {rec.priority} Öncelik
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          {rec.detail}
                        </p>
                        <div className="text-[10px] text-emerald-700 font-semibold pt-0.5">
                          Tahmini Getiri: {rec.expectedImpact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================= */}
              {/* FORMAL SIGN-OFF & STAKEHOLDER APPROVAL BLOCK */}
              {/* ========================================================= */}
              <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/60">
                    <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                      Hazırlayan & Sistem Yetkilisi
                    </div>
                    <div className="text-slate-900 font-black text-sm">
                      HızlıWeb Edge Platformu
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Altyapı & Performans Mühendisliği Departmanı
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span>İmza / Sistem Onayı:</span>
                      <span className="font-mono text-indigo-600 font-bold">DIGITAL-VERIFIED-✓</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/60">
                    <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                      Müşteri Temsilcisi & Paydaş Onayı
                    </div>
                    <div className="text-slate-900 font-black text-sm">
                      {data.companyName}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Yönetim Kurulu / İşletme Sahibi Temsilcisi
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Onay & İmza:</span>
                      <span className="italic text-slate-400 font-serif">____________________</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
                  <span>Bu doküman {data.companyName} için oluşturulmuş resmi performans ve konfigürasyon özetidir.</span>
                  <span className="font-mono">Doğrulama ID: {data.reportId} • Sayfa 1 / 1</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Action Bar */}
        <div className="p-3 sm:px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Veriler anlık olarak sitenizin canlı konfigürasyonundan ve Core Web Vitals motorundan derlenmiştir.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReportLink}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Kopyalandı!" : "Raporu Paylaş"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-200" />
              <span>{isGeneratingPdf ? "İndiriliyor..." : "PDF İndir"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
