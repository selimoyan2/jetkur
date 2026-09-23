import React from "react";
import { CompetitorComparisonReport } from "../../utils/competitorComparisonEngine";
import { AiStrategicPdfReportData } from "../../utils/aiStrategicPdfEngine";

interface StrategicPdfReportDocumentProps {
  reportData: AiStrategicPdfReportData;
  compReport: CompetitorComparisonReport;
  logo?: string;
}

export const StrategicPdfReportDocument: React.FC<StrategicPdfReportDocumentProps> = ({
  reportData,
  compReport,
  logo
}) => {
  const user = compReport.userSite;
  const competitors = compReport.top3Competitors;
  const leader = competitors[0] || user;

  return (
    <div
      id="strategic-pdf-printable-container"
      className="bg-white text-slate-800 p-8 max-w-[850px] mx-auto text-xs leading-relaxed font-sans shadow-lg print:shadow-none print:p-4 print:max-w-none"
      style={{ minHeight: "1100px" }}
    >
      {/* 1. HEADER & META */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          {logo ? (
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src={logo}
                alt={reportData.companyName || "Şirket Logosu"}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 text-white flex flex-col items-center justify-center font-black shadow-xs shrink-0">
              <span className="text-2xl leading-none">{(reportData.companyName || "S").charAt(0).toUpperCase()}</span>
              <span className="text-[8px] tracking-widest uppercase opacity-75 mt-0.5">LOGO</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded">
                Stratejik Yönetici Raporu
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                ID: {reportData.reportId}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SEO & Rekabet Kıyaslama Raporu
            </h1>
            <p className="text-slate-600 text-xs font-medium mt-0.5">
              {reportData.companyName} &bull; {reportData.sector} &bull; {reportData.city}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Hazırlanma Tarihi</div>
          <div className="text-xs font-bold text-slate-800 font-mono">{reportData.generatedAt}</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">
            Motor: {reportData.modelUsed}
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE HIGHLIGHT BANNER */}
      <div className="bg-slate-900 text-white p-5 rounded-xl mb-6 shadow-xs break-inside-avoid">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <span>★</span>
            <span>C-Level Yönetici Strateji Özeti (Gemini AI Değerlendirmesi)</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
            {reportData.domain}
          </span>
        </div>
        <p className="text-slate-200 text-xs leading-relaxed text-justify">
          {reportData.executiveSummary}
        </p>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-center">
          <div className="bg-slate-800/80 p-2 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Domain Otoritesi (DA)</div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {user.domainAuthority} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-[9px] text-amber-400 font-semibold">Lider Farkı: -{(leader.domainAuthority || 75) - user.domainAuthority}</div>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Anahtar Kelime Yoğunluğu</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              %{user.avgKeywordDensityPercent}
            </div>
            <div className="text-[9px] text-emerald-300 font-semibold">Güvenli ve Doğal</div>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase font-bold">LCP Sayfa Açılış Hızı</div>
            <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
              1.1s
            </div>
            <div className="text-[9px] text-cyan-300 font-semibold">Liderden %68 Daha Hızlı</div>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Spam Skoru & Güven</div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              %{user.spamScore}
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold">Kusursuz İtibar</div>
          </div>
        </div>
      </div>

      {/* 3. COMPETITOR BENCHMARK TABLE */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span>1. Rekabet Kıyaslama Matrisi (Domain Otoritesi & Kelime Yoğunluğu)</span>
        </h2>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5">Profil / Firma</th>
                <th className="p-2.5 text-center">DA (0-100)</th>
                <th className="p-2.5 text-center">PA (0-100)</th>
                <th className="p-2.5 text-center">Kök Domain (RD)</th>
                <th className="p-2.5 text-center">Backlink</th>
                <th className="p-2.5 text-center">Ort. Kelime Yoğunluğu</th>
                <th className="p-2.5 text-center">Spam Skoru</th>
                <th className="p-2.5 text-center">Durum / Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* User row */}
              <tr className="bg-indigo-50/70 font-semibold text-slate-900">
                <td className="p-2.5">
                  <span className="font-bold text-indigo-700">★ {user.name} (Siteniz)</span>
                  <div className="text-[10px] text-slate-500">{user.domain}</div>
                </td>
                <td className="p-2.5 text-center font-bold text-indigo-900 font-mono text-xs">
                  {user.domainAuthority}
                </td>
                <td className="p-2.5 text-center font-mono">{user.pageAuthority}</td>
                <td className="p-2.5 text-center font-mono">{user.referringDomains}</td>
                <td className="p-2.5 text-center font-mono">{(user.backlinksCount || 0).toLocaleString("tr-TR")}</td>
                <td className="p-2.5 text-center font-bold text-emerald-700 font-mono">
                  %{user.avgKeywordDensityPercent}
                </td>
                <td className="p-2.5 text-center font-mono text-emerald-700">%{user.spamScore}</td>
                <td className="p-2.5 text-center">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    İdeal & Doğal
                  </span>
                </td>
              </tr>

              {/* Competitors rows */}
              {competitors.map((comp, idx) => (
                <tr key={comp.id || idx} className="hover:bg-slate-50">
                  <td className="p-2.5">
                    <span className="font-semibold text-slate-800">{idx + 1}. {comp.name}</span>
                    <div className="text-[10px] text-slate-400">{comp.domain}</div>
                  </td>
                  <td className="p-2.5 text-center font-bold font-mono text-xs text-slate-800">
                    {comp.domainAuthority}
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{comp.pageAuthority}</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{comp.referringDomains}</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{(comp.backlinksCount || 0).toLocaleString("tr-TR")}</td>
                  <td className="p-2.5 text-center font-bold font-mono">
                    <span className={comp.avgKeywordDensityPercent > 3.0 ? "text-rose-600" : "text-slate-700"}>
                      %{comp.avgKeywordDensityPercent}
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-600">%{comp.spamScore}</td>
                  <td className="p-2.5 text-center">
                    {comp.avgKeywordDensityPercent > 3.0 ? (
                      <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Ceza Riski (%{comp.avgKeywordDensityPercent})
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {comp.densityStatus || "Dengeli"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. THREE STRATEGIC INSIGHTS */}
      <div className="grid grid-cols-3 gap-3 mb-6 break-inside-avoid">
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-indigo-700 mb-1">
            Domain Otoritesi (DA) Analizi
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
            {reportData.domainAuthorityInsight}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-emerald-700 mb-1">
            Anahtar Kelime Yoğunluğu Stratejisi
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
            {reportData.keywordDensityInsight}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-cyan-700 mb-1">
            Hız & Core Web Vitals Üstünlüğü
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
            {reportData.coreVitalsComparisonInsight}
          </p>
        </div>
      </div>

      {/* 5. CONTENT CLUSTERS BREAKDOWN */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span>2. İçerik Kümeleri (Content Clusters) & Fırsat Hacimleri</span>
        </h2>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2">İçerik Kümesi</th>
                <th className="p-2 text-center">Siteniz (Kelime)</th>
                <th className="p-2 text-center">Lider Rakip (Kelime)</th>
                <th className="p-2 text-center">Aylık Toplam Hacim</th>
                <th className="p-2 text-center">Fırsat Düzeyi</th>
                <th className="p-2">Gemini AI Stratejik Eylem Önerisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compReport.contentClusters.map((cluster, i) => {
                const rec = reportData.contentClusterRecommendations?.find(r => r.clusterName === cluster.name);
                return (
                  <tr key={cluster.id || i} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-800">{cluster.name}</td>
                    <td className="p-2 text-center font-mono font-bold text-indigo-700">
                      {cluster.userKeywordCount}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-600">
                      {cluster.comp1KeywordCount}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-800 font-semibold">
                      {cluster.marketTotalVolume.toLocaleString("tr-TR")}
                    </td>
                    <td className="p-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cluster.opportunityLevel === "Kritik Fırsat"
                          ? "bg-rose-100 text-rose-800"
                          : cluster.opportunityLevel === "Yüksek Potansiyel"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {cluster.opportunityLevel}
                      </span>
                    </td>
                    <td className="p-2 text-[10px] text-slate-600 leading-tight">
                      {rec?.strategicAction || `Kelime kapsamını artırarak ${cluster.opportunityLevel.toLowerCase()} değerlendirilmelidir.`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. COMPETITOR BATTLECARDS */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span>3. Rakip Zafiyetleri & Karşı Taktik Kartları (Battlecards)</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {reportData.competitorBattlecards?.map((card, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                <div className="font-bold text-xs text-slate-900 truncate">{card.competitorName}</div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                  DA {card.da}
                </span>
              </div>
              <div className="mb-2">
                <div className="text-[9px] uppercase font-bold text-rose-600">Zayıf Noktası (Vulnerability)</div>
                <p className="text-[10px] text-slate-700 mt-0.5 leading-snug">{card.vulnerability}</p>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-emerald-700">Tavsiye Edilen Karşı Hamle</div>
                <p className="text-[10px] text-slate-700 mt-0.5 leading-snug font-medium">{card.counterTactic}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. SWOT ANALYSIS */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span>4. Stratejik SWOT Analizi</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-emerald-200 bg-emerald-50/40 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-emerald-900 uppercase mb-1.5 flex items-center gap-1">
              <span>✔</span>
              <span>Güçlü Yönler (Strengths)</span>
            </div>
            <ul className="space-y-1">
              {reportData.swotAnalysis?.strengths?.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-amber-200 bg-amber-50/40 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-amber-900 uppercase mb-1.5 flex items-center gap-1">
              <span>⚠</span>
              <span>Geliştirilecek Alanlar (Weaknesses)</span>
            </div>
            <ul className="space-y-1">
              {reportData.swotAnalysis?.weaknesses?.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-indigo-200 bg-indigo-50/40 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-indigo-900 uppercase mb-1.5 flex items-center gap-1">
              <span>▲</span>
              <span>Pazar Fırsatları (Opportunities)</span>
            </div>
            <ul className="space-y-1">
              {reportData.swotAnalysis?.opportunities?.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-rose-200 bg-rose-50/40 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-rose-900 uppercase mb-1.5 flex items-center gap-1">
              <span>✖</span>
              <span>Pazar Tehditleri (Threats)</span>
            </div>
            <ul className="space-y-1">
              {reportData.swotAnalysis?.threats?.map((item, i) => (
                <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 8. 90-DAY STRATEGIC ROADMAP */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span>5. 90 Günlük SEO Hakimiyet Yol Haritası</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {reportData.roadmap90Days?.map((phase, i) => (
            <div key={i} className="border border-slate-200 bg-slate-50/70 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700">
                  {phase.period}
                </span>
                <span className="text-[9px] font-mono text-slate-500 font-semibold">{phase.phase}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mb-2">{phase.title}</div>
              <ul className="space-y-1.5 mb-3">
                {phase.tasks?.map((t, ti) => (
                  <li key={ti} className="text-[10px] text-slate-700 flex items-start gap-1.5 leading-tight">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200 text-[9px] text-emerald-800 font-semibold">
                Hedef: {phase.expectedImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. FOOTER & COMPLIANCE STAMP */}
      <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-500 break-inside-avoid">
        <div>
          <span className="font-bold text-slate-700">Google AI Studio Build &bull; SEO Strateji Motoru</span>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Bu rapor Google SERP standartları, Core Web Vitals metrikleri ve Gemini 3.8 Flash model verileriyle derlenmiştir.
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-slate-800">{reportData.reportId}</div>
          <div className="text-[9px] text-slate-400">Gizli &bull; C-Level Paydaşlar İçindir</div>
        </div>
      </div>
    </div>
  );
};
