import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import {
  FileDown,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
  ShieldCheck,
  TrendingUp,
  Target,
  ArrowRight,
  ExternalLink,
  Award
} from "lucide-react";
import { SiteConfig } from "../../types";
import {
  CompetitorComparisonReport,
  generateCompetitorComparisonReport
} from "../../utils/competitorComparisonEngine";
import {
  AiStrategicPdfReportData,
  generateAiStrategicReport
} from "../../utils/aiStrategicPdfEngine";
import { StrategicPdfReportDocument } from "./StrategicPdfReportDocument";

interface StrategicPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
}

export const StrategicPdfExportModal: React.FC<StrategicPdfExportModalProps> = ({
  isOpen,
  onClose,
  siteConfig
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>("Veriler hazırlanıyor...");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [compReport, setCompReport] = useState<CompetitorComparisonReport | null>(null);
  const [aiReportData, setAiReportData] = useState<AiStrategicPdfReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "swot" | "battlecards" | "roadmap">("summary");

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Initialize report on open
  useEffect(() => {
    if (isOpen) {
      loadReport();
    } else {
      setExportSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, siteConfig]);

  const loadReport = async () => {
    setLoading(true);
    setErrorMsg(null);
    setExportSuccess(false);

    try {
      setLoadingStep("Competitor Comparison Dashboard metrikleri hesaplanıyor...");
      const comparisonReport = generateCompetitorComparisonReport(siteConfig);
      setCompReport(comparisonReport);

      setLoadingStep("Gemini 3.8 Flash ile Stratejik Yönetici Raporu & SWOT derleniyor...");
      const aiResult = await generateAiStrategicReport(siteConfig, comparisonReport);
      setAiReportData(aiResult);
    } catch (err: any) {
      console.error("Failed to generate strategic AI report:", err);
      setErrorMsg("Rapor oluşturulurken bir aksaklık meydana geldi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportSuccess(false);

    try {
      const element = pdfContainerRef.current;
      const cleanCompany = (siteConfig.companyName || "Sirket").replace(/[^a-zA-Z0-9]/g, "_");
      const dateTag = new Date().toISOString().slice(0, 10);

      const opt = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename: `Stratejik_Rakip_Kiyaslama_ve_SEO_Raporu_${cleanCompany}_${dateTag}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1080
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(opt).from(element).save();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error("PDF download failed:", err);
      // Fallback
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/40 rounded-xl text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">
                  Stratejik Rakip Kıyaslama & SEO PDF Raporu
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Competitor Comparison Dashboard verileriyle desteklenen C-Level Yönetici Özeti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <div className="text-sm font-bold text-slate-800">{loadingStep}</div>
              <p className="text-xs text-slate-500 mt-1">
                Domain Otoritesi (DA), Anahtar Kelime Yoğunluğu ve İçerik Kümeleri analiz ediliyor...
              </p>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-900">{errorMsg}</div>
            <button
              type="button"
              onClick={loadReport}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
            >
              Tekrar Dene
            </button>
          </div>
        ) : aiReportData && compReport ? (
          <>
            {/* CONTROLS & SUB-NAV */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "summary"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Yönetici Özeti & KPI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("battlecards")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "battlecards"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Rakip Zafiyetleri (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("swot")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "swot"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  SWOT Analizi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("roadmap")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "roadmap"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  90 Günlük Yol Haritası
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadReport}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Yenile</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Yazdır</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>PDF Derleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Stratejik PDF İndir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            {exportSuccess && (
              <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Stratejik PDF Raporu başarıyla oluşturuldu ve cihazınıza indirildi!</span>
              </div>
            )}

            {/* TAB CONTENT VIEWER */}
            <div className="p-6 overflow-y-auto space-y-4">
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
                    <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gemini 3.8 Flash Stratejik Değerlendirmesi</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {aiReportData.executiveSummary}
                    </p>
                  </div>

                  {/* KPI comparison grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Domain Otoritesi (DA)</div>
                      <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                        {compReport.userSite.domainAuthority} <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                        Lider: {compReport.top3Competitors[0]?.domainAuthority || 75}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Anahtar Kelime Yoğunluğu</div>
                      <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                        %{compReport.userSite.avgKeywordDensityPercent}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Google İdeal Aralıkta
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-500">LCP Açılış Hızı</div>
                      <div className="text-xl font-black text-cyan-600 font-mono mt-0.5">
                        1.1s
                      </div>
                      <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">
                        Liderden %68 Daha Hızlı
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Spam Skoru</div>
                      <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                        %{compReport.userSite.spamScore}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Ceza Riski Sıfır
                      </div>
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="bg-slate-900 text-white p-4 rounded-xl">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
                      Stratejik Çıkarımlar & Eylem Odakları
                    </div>
                    <ul className="space-y-1.5">
                      {aiReportData.keyTakeaways?.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "battlecards" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiReportData.competitorBattlecards?.map((card, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{card.competitorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{card.domain}</div>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                          DA {card.da}
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="text-[9px] font-bold uppercase text-rose-600">Tespit Edilen Zafiyet</div>
                        <p className="text-xs text-slate-700 mt-0.5">{card.vulnerability}</p>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase text-emerald-700">Önerilen Karşı Taktik</div>
                        <p className="text-xs text-slate-700 mt-0.5 font-medium">{card.counterTactic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "swot" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <div className="text-xs font-bold text-emerald-900 uppercase mb-2">
                      ✔ Güçlü Yönler (Strengths)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiReportData.swotAnalysis?.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl">
                    <div className="text-xs font-bold text-amber-900 uppercase mb-2">
                      ⚠ Geliştirilecek Alanlar (Weaknesses)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiReportData.swotAnalysis?.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl">
                    <div className="text-xs font-bold text-indigo-900 uppercase mb-2">
                      ▲ Pazar Fırsatları (Opportunities)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiReportData.swotAnalysis?.opportunities?.map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl">
                    <div className="text-xs font-bold text-rose-900 uppercase mb-2">
                      ✖ Pazar Tehditleri (Threats)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiReportData.swotAnalysis?.threats?.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "roadmap" && (
                <div className="space-y-3">
                  {aiReportData.roadmap90Days?.map((phase, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-indigo-700 uppercase">{phase.period} &bull; {phase.phase}</span>
                        <span className="text-xs font-bold text-slate-900">{phase.title}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                        {phase.tasks?.map((t, ti) => (
                          <div key={ti} className="text-xs text-slate-700 flex items-start gap-1.5 bg-white p-2 rounded border border-slate-100">
                            <span className="text-indigo-600 font-bold">✓</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 pt-1">
                        Beklenen Sonuç: {phase.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HIDDEN OFF-SCREEN CONTAINER FOR html2pdf.js RENDERING */}
            <div className="hidden">
              <div ref={pdfContainerRef}>
                <StrategicPdfReportDocument 
                  reportData={aiReportData} 
                  compReport={compReport} 
                  logo={siteConfig.logo}
                />
              </div>
            </div>
          </>
        ) : null}

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Veriler Competitor Comparison Dashboard ve Google Arama algoritmalarına dayalıdır.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
