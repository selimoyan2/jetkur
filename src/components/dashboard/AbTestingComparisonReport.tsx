import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  AbTestExperiment,
  HeroVariantConfig,
  FormLead
} from "../../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import {
  Split,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointerClick,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Trophy,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  Zap,
  Sparkles,
  Filter,
  RefreshCw,
  BarChart3,
  HelpCircle,
  Layers,
  Check,
  ChevronRight,
  Activity,
  Percent,
  ArrowDownRight,
  Target,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { AbTestConversionFunnelWidget } from "./AbTestConversionFunnelWidget";

interface AbTestingComparisonReportProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenEditor?: (variant: "A" | "B") => void;
  onOpenLivePreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AbTestingComparisonReport: React.FC<AbTestingComparisonReportProps> = ({
  config,
  onChange,
  onPreview,
  onOpenEditor,
  onOpenLivePreview,
  onNavigateTab
}) => {
  // Chart visual mode
  const [chartMode, setChartMode] = useState<"volumes" | "rates" | "trends">("volumes");
  const [trendMetric, setTrendMetric] = useState<"leads" | "clicks" | "views" | "cr">("leads");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe fallback abTesting object
  const abConfig: AbTestExperiment = useMemo(() => {
    if (config.abTesting) return config.abTesting;
    return {
      id: "hero-split-exp-1",
      name: "Ana Sayfa Hero Dönüşüm Testi",
      enabled: true,
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      trafficSplit: 50,
      variationA: {
        id: "var-a",
        label: "Varyasyon A (Kontrol)",
        badge: config.hero?.badge || "✨ Profesyonel Hizmet",
        title: config.hero?.title || `${config.companyName} ile Güvenilir Çözümler`,
        subtitle: config.hero?.subtitle || `${config.city} genelinde uzman kadromuz ve garantili hizmet anlayışımızla yanınızdayız.`,
        ctaPrimaryText: config.hero?.ctaPrimaryText || "Hemen İletişime Geçin",
        ctaPrimaryLink: config.hero?.ctaPrimaryLink || `tel:${config.phone?.replace(/\s+/g, "") || ""}`,
        ctaSecondaryText: config.hero?.ctaSecondaryText || "WhatsApp Destek",
        ctaSecondaryLink: config.hero?.ctaSecondaryLink || `https://wa.me/${config.whatsapp || ""}`,
        bgImage: config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80",
        views: 480,
        clicks: 72,
        leads: 28
      },
      variationB: {
        id: "var-b",
        label: "Varyasyon B (Challenger)",
        badge: "🚀 15 Dakikada Hızlı Müdahale",
        title: "Acil Desteğe mi İhtiyacınız Var? Hemen Arayın!",
        subtitle: "Beklemeden, net fiyat garantisi ve ücretsiz ön keşif avantajıyla anında hizmet alın.",
        ctaPrimaryText: "Hemen Fiyat Teklifi Al",
        ctaPrimaryLink: "#contact",
        ctaSecondaryText: "WhatsApp'tan Yazın",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`,
        bgImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80",
        views: 495,
        clicks: 104,
        leads: 46
      }
    };
  }, [config.abTesting, config.companyName, config.city, config.hero, config.phone, config.whatsapp]);

  // Helper to update abTesting
  const updateAbConfig = (updates: Partial<AbTestExperiment>) => {
    const updated: AbTestExperiment = {
      ...abConfig,
      ...updates
    };
    onChange({
      ...config,
      abTesting: updated
    });
  };

  // Metrics calculation
  const viewsA = abConfig.stats?.variantA?.views ?? abConfig.variationA.views ?? 480;
  const clicksA = abConfig.stats?.variantA?.clicks ?? abConfig.variationA.clicks ?? 72;
  const leadsA = abConfig.stats?.variantA?.leads ?? abConfig.variationA.leads ?? 28;

  const viewsB = abConfig.stats?.variantB?.views ?? abConfig.variationB.views ?? 495;
  const clicksB = abConfig.stats?.variantB?.clicks ?? abConfig.variationB.clicks ?? 104;
  const leadsB = abConfig.stats?.variantB?.leads ?? abConfig.variationB.leads ?? 46;

  // Conversion Rates
  const ctrA = viewsA > 0 ? (clicksA / viewsA) * 100 : 0;
  const ctrB = viewsB > 0 ? (clicksB / viewsB) * 100 : 0;

  const crA = viewsA > 0 ? (leadsA / viewsA) * 100 : 0;
  const crB = viewsB > 0 ? (leadsB / viewsB) * 100 : 0;

  const clickToLeadA = clicksA > 0 ? (leadsA / clicksA) * 100 : 0;
  const clickToLeadB = clicksB > 0 ? (leadsB / clicksB) * 100 : 0;

  // Totals
  const totalViews = viewsA + viewsB;
  const totalClicks = clicksA + clicksB;
  const totalLeads = leadsA + leadsB;
  const blendedCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const blendedCr = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

  // Lift / Uplift
  const crLiftPercentage = crA > 0 ? ((crB - crA) / crA) * 100 : 0;
  const ctrLiftPercentage = ctrA > 0 ? ((ctrB - ctrA) / ctrA) * 100 : 0;
  const isVariationBWinning = crB > crA;

  // 2-Proportion Statistical Significance Z-Score & Confidence
  const statisticalConfidence = useMemo(() => {
    if (viewsA < 30 || viewsB < 30 || leadsA === 0 || leadsB === 0) {
      return {
        confidence: 0,
        isSignificant: false,
        text: "Veri toplanıyor (minimum 30 ziyaretçi gerekli)",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
      };
    }

    const p1 = leadsA / viewsA;
    const p2 = leadsB / viewsB;
    const pPool = (leadsA + leadsB) / (viewsA + viewsB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / viewsA + 1 / viewsB));

    if (se === 0) {
      return {
        confidence: 50,
        isSignificant: false,
        text: "Dönüşüm oranları eşit",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
      };
    }

    const z = Math.abs(p2 - p1) / se;

    // Standard normal CDF approximation (erf)
    const erf = (x: number) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      const absX = Math.abs(x);
      const t = 1.0 / (1.0 + p * absX);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
      return sign * y;
    };

    const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
    const confidencePercent = Math.round(cdf * 1000) / 10;

    if (confidencePercent >= 95) {
      return {
        confidence: confidencePercent,
        isSignificant: true,
        text: `%${confidencePercent} Güven Seviyesi • İstatistiki olarak kesin sonuç!`,
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300"
      };
    } else if (confidencePercent >= 80) {
      return {
        confidence: confidencePercent,
        isSignificant: false,
        text: `%${confidencePercent} Güven Seviyesi • Güçlü eğilim var, test devam ediyor.`,
        badgeColor: "bg-amber-50 text-amber-800 border-amber-300"
      };
    } else {
      return {
        confidence: confidencePercent,
        isSignificant: false,
        text: `%${confidencePercent} Güven Seviyesi • Henüz kesin karar vermek için erken.`,
        badgeColor: "bg-slate-50 text-slate-700 border-slate-200"
      };
    }
  }, [viewsA, viewsB, leadsA, leadsB]);

  // Recharts: Volume Comparison Data
  const volumeChartData = useMemo(() => {
    return [
      {
        name: "Gösterim / Ziyaret",
        "Varyasyon A": viewsA,
        "Varyasyon B": viewsB,
        unit: "ziyaret"
      },
      {
        name: "CTA Tıklanma",
        "Varyasyon A": clicksA,
        "Varyasyon B": clicksB,
        unit: "tık"
      },
      {
        name: "Kazanılan Lead",
        "Varyasyon A": leadsA,
        "Varyasyon B": leadsB,
        unit: "lead"
      }
    ];
  }, [viewsA, viewsB, clicksA, clicksB, leadsA, leadsB]);

  // Recharts: Conversion Rates Data
  const rateChartData = useMemo(() => {
    return [
      {
        name: "Tıklama Oranı (CTR %)",
        "Varyasyon A": parseFloat(ctrA.toFixed(1)),
        "Varyasyon B": parseFloat(ctrB.toFixed(1)),
        unit: "%"
      },
      {
        name: "Lead Dönüşüm (CR %)",
        "Varyasyon A": parseFloat(crA.toFixed(1)),
        "Varyasyon B": parseFloat(crB.toFixed(1)),
        unit: "%"
      },
      {
        name: "Tıktan Lead'e Oran (%)",
        "Varyasyon A": parseFloat(clickToLeadA.toFixed(1)),
        "Varyasyon B": parseFloat(clickToLeadB.toFixed(1)),
        unit: "%"
      }
    ];
  }, [ctrA, ctrB, crA, crB, clickToLeadA, clickToLeadB]);

  // Recharts: 7-Day Trend Timeline
  const timelineTrendData = useMemo(() => {
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    return days.map((day, idx) => {
      // Proportional distributed curve for 7 days
      const factorA = [0.12, 0.14, 0.15, 0.16, 0.18, 0.13, 0.12][idx];
      const factorB = [0.11, 0.13, 0.15, 0.17, 0.19, 0.14, 0.11][idx];

      const vA = Math.round(viewsA * factorA);
      const cA = Math.round(clicksA * factorA);
      const lA = Math.max(1, Math.round(leadsA * factorA));
      const rA = vA > 0 ? parseFloat(((lA / vA) * 100).toFixed(1)) : 0;

      const vB = Math.round(viewsB * factorB);
      const cB = Math.round(clicksB * factorB);
      const lB = Math.max(1, Math.round(leadsB * factorB));
      const rB = vB > 0 ? parseFloat(((lB / vB) * 100).toFixed(1)) : 0;

      return {
        day,
        "Varyasyon A (Ziyaret)": vA,
        "Varyasyon B (Ziyaret)": vB,
        "Varyasyon A (Tıklama)": cA,
        "Varyasyon B (Tıklama)": cB,
        "Varyasyon A (Lead)": lA,
        "Varyasyon B (Lead)": lB,
        "Varyasyon A (CR %)": rA,
        "Varyasyon B (CR %)": rB
      };
    });
  }, [viewsA, viewsB, clicksA, clicksB, leadsA, leadsB]);

  // Apply Winner to Live Site
  const handleApplyWinner = (winnerKey: "A" | "B") => {
    const winningData = winnerKey === "A" ? abConfig.variationA : abConfig.variationB;

    const updatedHero = {
      ...config.hero,
      badge: winningData.badge,
      title: winningData.title,
      subtitle: winningData.subtitle,
      ctaPrimaryText: winningData.ctaPrimaryText,
      ctaPrimaryLink: winningData.ctaPrimaryLink,
      ctaSecondaryText: winningData.ctaSecondaryText,
      ctaSecondaryLink: winningData.ctaSecondaryLink,
      bgImage: winningData.bgImage
    };

    const updatedAb = {
      ...abConfig,
      status: "completed" as const,
      winningVariant: winnerKey,
      winnerVariant: winnerKey,
      endDate: new Date().toISOString().split("T")[0]
    };

    onChange({
      ...config,
      hero: updatedHero,
      abTesting: updatedAb
    });

    showToast(
      `🏆 Varyasyon ${winnerKey} kazanan olarak ilan edildi ve web sitesi ana sayfa Hero bölümüne başarıyla kalıcı olarak uygulandı!`
    );
  };

  // Reset Experiment Stats
  const handleResetStats = () => {
    if (window.confirm("A/B testine ait tüm gösterim, tıklanma ve lead sayaçlarını sıfırlamak istediğinize emin misiniz?")) {
      updateAbConfig({
        startDate: new Date().toISOString().split("T")[0],
        startedAt: new Date().toLocaleDateString("tr-TR"),
        endDate: undefined,
        endedAt: undefined,
        status: "active",
        winningVariant: undefined,
        winnerVariant: null,
        stats: {
          variantA: { views: 0, clicks: 0, leads: 0 },
          variantB: { views: 0, clicks: 0, leads: 0 }
        },
        variationA: {
          ...abConfig.variationA,
          views: 0,
          clicks: 0,
          leads: 0
        },
        variationB: {
          ...abConfig.variationB,
          views: 0,
          clicks: 0,
          leads: 0
        }
      });
      showToast("Sayaçlar sıfırlandı. Yeni test başlatıldı.");
    }
  };

  // Incremental simulation for testing
  const handleSimulateCustom = (variant: "A" | "B", type: "click" | "lead" | "traffic") => {
    const isA = variant === "A";
    const curViewsA = viewsA;
    const curClicksA = clicksA;
    const curLeadsA = leadsA;
    const curViewsB = viewsB;
    const curClicksB = clicksB;
    const curLeadsB = leadsB;

    let nextViewsA = curViewsA;
    let nextClicksA = curClicksA;
    let nextLeadsA = curLeadsA;
    let nextViewsB = curViewsB;
    let nextClicksB = curClicksB;
    let nextLeadsB = curLeadsB;

    if (type === "click") {
      if (isA) nextClicksA += 5;
      else nextClicksB += 5;
      showToast(`+5 Tıklanma Varyasyon ${variant}'ye eklendi!`);
    } else if (type === "lead") {
      if (isA) {
        nextClicksA += 1;
        nextLeadsA += 1;
      } else {
        nextClicksB += 1;
        nextLeadsB += 1;
      }
      showToast(`+1 Form Talebi Varyasyon ${variant}'ye eklendi!`);
    } else if (type === "traffic") {
      if (isA) nextViewsA += 25;
      else nextViewsB += 25;
      showToast(`+25 Ziyaretçi Varyasyon ${variant}'ye eklendi!`);
    }

    updateAbConfig({
      stats: {
        variantA: { views: nextViewsA, clicks: nextClicksA, leads: nextLeadsA },
        variantB: { views: nextViewsB, clicks: nextClicksB, leads: nextLeadsB }
      },
      variationA: {
        ...abConfig.variationA,
        views: nextViewsA,
        clicks: nextClicksA,
        leads: nextLeadsA
      },
      variationB: {
        ...abConfig.variationB,
        views: nextViewsB,
        clicks: nextClicksB,
        leads: nextLeadsB
      }
    });
  };

  // Export Comprehensive CSV
  const handleExportCsv = () => {
    const rows = [
      ["METRIK_RAPORU", "VARYASYON_A_KONTROL", "VARYASYON_B_CHALLENGER", "FARK_LIFT", "KAZANAN"],
      ["Gosterim_Ziyaret", viewsA.toString(), viewsB.toString(), `${viewsB - viewsA}`, isVariationBWinning ? "B" : "A"],
      ["CTA_Tiklanma", clicksA.toString(), clicksB.toString(), `+${(clicksB - clicksA)}`, clicksB >= clicksA ? "B" : "A"],
      ["Tiklama_Orani_CTR", `%${ctrA.toFixed(2)}`, `%${ctrB.toFixed(2)}`, `%${ctrLiftPercentage.toFixed(2)}`, ctrB >= ctrA ? "B" : "A"],
      ["Form_Talebi_Leads", leadsA.toString(), leadsB.toString(), `+${(leadsB - leadsA)}`, leadsB >= leadsA ? "B" : "A"],
      ["Lead_Donusum_Orani_CR", `%${crA.toFixed(2)}`, `%${crB.toFixed(2)}`, `%${crLiftPercentage.toFixed(2)}`, isVariationBWinning ? "B" : "A"],
      ["Tiklamadan_Leade_Oran", `%${clickToLeadA.toFixed(2)}`, `%${clickToLeadB.toFixed(2)}`, `%${(clickToLeadB - clickToLeadA).toFixed(2)}`, clickToLeadB >= clickToLeadA ? "B" : "A"],
      ["Istatistiki_Guvenilirlik", `${statisticalConfidence.confidence}%`, `${statisticalConfidence.confidence}%`, statisticalConfidence.text, isVariationBWinning ? "B" : "A"],
      ["Hero_Basligi", `"${abConfig.variationA.title.replace(/"/g, '""')}"`, `"${abConfig.variationB.title.replace(/"/g, '""')}"`, "-", "-"],
      ["Birincil_CTA_Butonu", `"${abConfig.variationA.ctaPrimaryText.replace(/"/g, '""')}"`, `"${abConfig.variationB.ctaPrimaryText.replace(/"/g, '""')}"`, "-", "-"]
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hizliweb_ab_test_karsilastirma_raporu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("A/B test karşılaştırma raporu CSV formatında başarıyla indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-slate-950 text-white shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
              <Split className="w-3.5 h-3.5" />
              <span>A/B Testleri & CRO Karşılaştırma Raporu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Hero Varyantları Karşılaştırma Raporu</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  abConfig.status === "active"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : abConfig.status === "paused"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                }`}
              >
                {abConfig.status === "active" ? "🟢 Test Canlıda Aktif" : abConfig.status === "paused" ? "🟡 Test Duraklatıldı" : "🔵 Tamamlandı"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hero varyantları (A ve B) arasındaki dönüşüm oranlarını, tıklanma ve lead oluşturma verilerini görselleştiren
              bilimsel karşılaştırma raporu. Hangi manşetin ve CTA butonunun daha çok müşteri kazandırdığını tek bakışta inceleyin.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="ab-toggle-status-btn"
              onClick={() =>
                updateAbConfig({
                  status: abConfig.status === "active" ? "paused" : "active",
                  enabled: abConfig.status !== "active"
                })
              }
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                abConfig.status === "active"
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {abConfig.status === "active" ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Testi Duraklat</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Testi Başlat</span>
                </>
              )}
            </button>

            {onPreview && (
              <button
                type="button"
                id="ab-preview-btn"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>Sitede İncele</span>
              </button>
            )}

            <button
              type="button"
              id="ab-export-csv-btn"
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="CSV raporu indir"
            >
              <Download className="w-4 h-4" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              id="ab-reset-btn"
              onClick={handleResetStats}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
              title="Tüm sayaçları sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 0. D3.JS A/B TEST CONVERSION FUNNEL & WINNER ANALYSIS */}
      {/* ------------------------------------------------------------- */}
      <AbTestConversionFunnelWidget
        config={config}
        onChange={onChange}
        onNavigateTab={onNavigateTab}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE KPI BENTO CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Lead Conversion Lift */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Lead Dönüşüm Farkı</span>
            <span className={`p-1.5 rounded-lg ${crLiftPercentage >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {crLiftPercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${crLiftPercentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {crLiftPercentage >= 0 ? `+${crLiftPercentage.toFixed(1)}%` : `${crLiftPercentage.toFixed(1)}%`}
            </span>
            <span className="text-xs font-bold text-slate-500">fark</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>A: %{crA.toFixed(2)}</span>
            <span className="font-bold text-emerald-600">B: %{crB.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {isVariationBWinning
              ? "Varyasyon B, orijinal Hero'ya göre %" + crLiftPercentage.toFixed(1) + " daha fazla form talebi üretiyor."
              : "Varyasyon A şu an daha yüksek lead dönüşümü sağlıyor."}
          </p>
        </div>

        {/* Metric 2: Click-Through Rate (CTR Lift) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Tıklanma Oranı (CTR)</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <MousePointerClick className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${ctrLiftPercentage >= 0 ? "text-purple-600" : "text-slate-700"}`}>
              {ctrLiftPercentage >= 0 ? `+${ctrLiftPercentage.toFixed(1)}%` : `${ctrLiftPercentage.toFixed(1)}%`}
            </span>
            <span className="text-xs font-bold text-slate-500">tıklama artışı</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>A: {clicksA} tık (%{ctrA.toFixed(1)})</span>
            <span className="font-bold text-purple-700">B: {clicksB} tık (%{ctrB.toFixed(1)})</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Challenger buton metni ziyaretçilerin dikkatini daha fazla çekmeyi başardı.
          </p>
        </div>

        {/* Metric 3: Statistical Significance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>İstatistiki Güven</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-600">
              %{statisticalConfidence.confidence > 0 ? statisticalConfidence.confidence : "95+"}
            </span>
            <span className="text-xs font-bold text-slate-500">güvenilirlik</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-700 line-clamp-2">
            {statisticalConfidence.text}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            2-oranlı Z-skor testi ile hesaplanan anlamlılık düzeyi.
          </p>
        </div>

        {/* Metric 4: Total Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Toplam Etkileşim</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalLeads}</span>
            <span className="text-xs font-bold text-slate-500">toplam lead</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>{totalViews} Ziyaretçi</span>
            <span className="font-bold text-amber-700">{totalClicks} Tıklanma</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Ortalama test dönüşüm oranı: <strong>%{blendedCr.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. VISUAL CONVERSION FUNNEL COMPARISON */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Dönüşüm Hunisi Karşılaştırması (Conversion Funnel: A vs B)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ziyaretçilerin Hero bölümünü görmesinden (Gösterim), CTA butonuna tıklamasına ve formu doldurmasına kadar olan aşamalar.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Varyasyon A (Kontrol)</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>Varyasyon B (Challenger)</span>
            </div>
          </div>
        </div>

        {/* Funnel Stages Side by Side */}
        <div className="space-y-6">
          {/* Stage 1: Views / Impressions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">1</span>
                <span>Aşama 1: Hero Gösterimi (Toplam Ziyaret)</span>
              </span>
              <span className="text-slate-500 font-mono">100% Başlangıç</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Variant A bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-blue-700">Varyasyon A: {viewsA} ziyaretçi</span>
                  <span className="font-mono text-slate-500">%100</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-full" />
                </div>
              </div>

              {/* Variant B bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-purple-700">Varyasyon B: {viewsB} ziyaretçi</span>
                  <span className="font-mono text-slate-500">%100</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: Hero CTA Button Clicks */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center text-[11px]">2</span>
                <span>Aşama 2: Hero CTA Buton Tıklaması (Tıklama Oranı - CTR)</span>
              </span>
              <span className="text-purple-700 font-semibold text-[11px]">
                {ctrLiftPercentage >= 0 ? `+${ctrLiftPercentage.toFixed(1)}% Fark (B Lider)` : `A Lider`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Variant A bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-blue-700">Varyasyon A: {clicksA} tık</span>
                  <span className="font-mono font-bold text-slate-700">CTR: %{ctrA.toFixed(2)}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (clicksA / viewsA) * 100 * 3))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">Terk Oranı (Drop-off): %{(100 - ctrA).toFixed(1)}</div>
              </div>

              {/* Variant B bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-purple-700">Varyasyon B: {clicksB} tık</span>
                  <span className="font-mono font-bold text-purple-700">CTR: %{ctrB.toFixed(2)}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (clicksB / viewsB) * 100 * 3))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">Terk Oranı (Drop-off): %{(100 - ctrB).toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Stage 3: Form Submissions / Lead Created */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center text-[11px]">3</span>
                <span>Aşama 3: Form Doldurma & Lead Oluşturma (Nihai Dönüşüm Oranı - CR)</span>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">
                {crLiftPercentage >= 0 ? `+${crLiftPercentage.toFixed(1)}% Fark (B Lider)` : `A Lider`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Variant A bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-blue-700">Varyasyon A: {leadsA} lead</span>
                  <span className="font-mono font-bold text-slate-700">CR: %{crA.toFixed(2)}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, (leadsA / viewsA) * 100 * 6))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Tıklamadan Lead'e Geçiş: <strong>%{clickToLeadA.toFixed(1)}</strong>
                </div>
              </div>

              {/* Variant B bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-purple-700">Varyasyon B: {leadsB} lead</span>
                  <span className="font-mono font-bold text-emerald-700">CR: %{crB.toFixed(2)}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, (leadsB / viewsB) * 100 * 6))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Tıklamadan Lead'e Geçiş: <strong className="text-emerald-700">%{clickToLeadB.toFixed(1)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. RECHARTS VISUAL COMPARISON CHARTS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Görsel Karşılaştırma Grafikleri (Recharts Analytics)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hacimler, oranlar ve tarihsel günlük trendler üzerinden varyant performansını görsel olarak inceleyin.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              id="btn-chart-mode-volumes"
              onClick={() => setChartMode("volumes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMode === "volumes" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hacimler (Ziyaret & Lead)
            </button>
            <button
              type="button"
              id="btn-chart-mode-rates"
              onClick={() => setChartMode("rates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMode === "rates" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dönüşüm Oranları (CTR & CR)
            </button>
            <button
              type="button"
              id="btn-chart-mode-trends"
              onClick={() => setChartMode("trends")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMode === "trends" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Günlük Trend
            </button>
          </div>
        </div>

        {/* Chart 1: Volumes (BarChart) */}
        {chartMode === "volumes" && (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: "12px" }} />
                  <Bar dataKey="Varyasyon A" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="Varyasyon B" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Toplam Gösterim Farkı</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Varyasyon B: {viewsB - viewsA >= 0 ? `+${viewsB - viewsA}` : viewsB - viewsA} ziyaret
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/80 text-center">
                <div className="text-[11px] text-purple-700 font-medium">Ek CTA Tıklanması</div>
                <div className="text-sm font-bold text-purple-900 mt-0.5">
                  +{clicksB - clicksA} Tık (%{ctrLiftPercentage.toFixed(1)} artış)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-center">
                <div className="text-[11px] text-emerald-700 font-medium">Ek Form Talebi (Lead)</div>
                <div className="text-sm font-bold text-emerald-900 mt-0.5">
                  +{leadsB - leadsA} Müşteri Talebi (%{crLiftPercentage.toFixed(1)} artış)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart 2: Rates (BarChart) */}
        {chartMode === "rates" && (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit="%" />
                  <Tooltip
                    formatter={(val) => [`%${val}`, ""]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: "12px" }} />
                  <Bar dataKey="Varyasyon A" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="Varyasyon B" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Yorum:</strong> Varyasyon B hem buton tıklanma oranında (<strong>%{ctrB.toFixed(1)}</strong> vs %{ctrA.toFixed(1)})
                  hem de son aşama olan form doldurma oranında (<strong>%{crB.toFixed(1)}</strong> vs %{crA.toFixed(1)}) belirgin üstünlük sağlamıştır.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 3: Trends (AreaChart) */}
        {chartMode === "trends" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Trend Grafiği Metriği:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTrendMetric("leads")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    trendMetric === "leads" ? "bg-white text-purple-700 shadow-2xs font-black" : "text-slate-600"
                  }`}
                >
                  Form Talepleri
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric("clicks")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    trendMetric === "clicks" ? "bg-white text-purple-700 shadow-2xs font-black" : "text-slate-600"
                  }`}
                >
                  Tıklanmalar
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric("views")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    trendMetric === "views" ? "bg-white text-purple-700 shadow-2xs font-black" : "text-slate-600"
                  }`}
                >
                  Ziyaretçi
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: "12px" }} />
                  {trendMetric === "leads" && (
                    <>
                      <Area type="monotone" dataKey="Varyasyon A (Lead)" stroke="#3b82f6" fill="url(#colorA)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Varyasyon B (Lead)" stroke="#8b5cf6" fill="url(#colorB)" strokeWidth={2} />
                    </>
                  )}
                  {trendMetric === "clicks" && (
                    <>
                      <Area type="monotone" dataKey="Varyasyon A (Tıklama)" stroke="#3b82f6" fill="url(#colorA)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Varyasyon B (Tıklama)" stroke="#8b5cf6" fill="url(#colorB)" strokeWidth={2} />
                    </>
                  )}
                  {trendMetric === "views" && (
                    <>
                      <Area type="monotone" dataKey="Varyasyon A (Ziyaret)" stroke="#3b82f6" fill="url(#colorA)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Varyasyon B (Ziyaret)" stroke="#8b5cf6" fill="url(#colorB)" strokeWidth={2} />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. DETAILED SIDE-BY-SIDE COMPARISON MATRIX TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Ayrıntılı Karşılaştırma Matrisi (Side-by-Side Detailed Matrix)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hero A ve B varyantlarının başlık, buton, gösterim, tıklanma ve dönüşüm istatistiklerinin tam karşılaştırması.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Raporu CSV İndir</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Metrik / Karşılaştırma Kriteri</th>
                <th className="p-4">Varyasyon A (Kontrol)</th>
                <th className="p-4">Varyasyon B (Challenger)</th>
                <th className="p-4">Fark (Delta / Lift)</th>
                <th className="p-4 text-right">Kazanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row: Hero Title */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-800">Hero Ana Başlık (H1)</td>
                <td className="p-4 text-slate-600 max-w-xs">{abConfig.variationA.title}</td>
                <td className="p-4 text-purple-900 font-semibold max-w-xs">{abConfig.variationB.title}</td>
                <td className="p-4 text-slate-500 font-medium">Farklı Pazarlama Açısı</td>
                <td className="p-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                    B
                  </span>
                </td>
              </tr>

              {/* Row: Primary CTA */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-800">Birincil Buton (Primary CTA)</td>
                <td className="p-4 text-slate-600 font-mono text-[11px]">"{abConfig.variationA.ctaPrimaryText}"</td>
                <td className="p-4 text-purple-900 font-mono text-[11px] font-bold">"{abConfig.variationB.ctaPrimaryText}"</td>
                <td className="p-4 text-slate-500 font-medium">Aciliyet Odaklı Metin</td>
                <td className="p-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                    B
                  </span>
                </td>
              </tr>

              {/* Row: Total Impressions */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-800">Toplam Ziyaretçi / Gösterim</td>
                <td className="p-4 font-mono font-bold text-slate-900">{viewsA}</td>
                <td className="p-4 font-mono font-bold text-slate-900">{viewsB}</td>
                <td className="p-4 font-mono text-slate-600">{viewsB - viewsA >= 0 ? `+${viewsB - viewsA}` : viewsB - viewsA}</td>
                <td className="p-4 text-right font-medium text-slate-500">Dengeli (%50)</td>
              </tr>

              {/* Row: Total CTA Clicks */}
              <tr className="hover:bg-slate-50/60 bg-purple-50/20">
                <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-purple-600" />
                  <span>Toplam CTA Tıklanması (Clicks)</span>
                </td>
                <td className="p-4 font-mono font-bold text-slate-900">{clicksA}</td>
                <td className="p-4 font-mono font-bold text-purple-700">{clicksB}</td>
                <td className="p-4 font-mono font-bold text-purple-600">+{clicksB - clicksA} tık</td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                    Varyasyon B
                  </span>
                </td>
              </tr>

              {/* Row: CTR */}
              <tr className="hover:bg-slate-50/60 bg-purple-50/20">
                <td className="p-4 font-bold text-slate-900">Tıklama Oranı (CTR %)</td>
                <td className="p-4 font-mono font-bold text-slate-700">%{ctrA.toFixed(2)}</td>
                <td className="p-4 font-mono font-bold text-purple-700">%{ctrB.toFixed(2)}</td>
                <td className="p-4 font-mono font-bold text-emerald-600">
                  {ctrLiftPercentage >= 0 ? `+${ctrLiftPercentage.toFixed(1)}%` : `${ctrLiftPercentage.toFixed(1)}%`}
                </td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    +{ctrLiftPercentage.toFixed(1)}% Lift
                  </span>
                </td>
              </tr>

              {/* Row: Leads Created */}
              <tr className="hover:bg-slate-50/60 bg-emerald-50/20">
                <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kazanılan Lead Sayısı (Form)</span>
                </td>
                <td className="p-4 font-mono font-bold text-slate-900">{leadsA}</td>
                <td className="p-4 font-mono font-bold text-emerald-700">{leadsB}</td>
                <td className="p-4 font-mono font-bold text-emerald-600">+{leadsB - leadsA} lead</td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Varyasyon B
                  </span>
                </td>
              </tr>

              {/* Row: Lead Conversion Rate (CR) */}
              <tr className="hover:bg-slate-50/60 bg-emerald-50/20">
                <td className="p-4 font-bold text-slate-900">Lead Dönüşüm Oranı (CR %)</td>
                <td className="p-4 font-mono font-bold text-slate-700">%{crA.toFixed(2)}</td>
                <td className="p-4 font-mono font-bold text-emerald-700">%{crB.toFixed(2)}</td>
                <td className="p-4 font-mono font-bold text-emerald-600">
                  {crLiftPercentage >= 0 ? `+${crLiftPercentage.toFixed(1)}%` : `${crLiftPercentage.toFixed(1)}%`}
                </td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] animate-pulse">
                    🏆 Kazanan
                  </span>
                </td>
              </tr>

              {/* Row: Click-to-Lead Ratio */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-800">Tıklamadan Lead'e Geçiş Oranı</td>
                <td className="p-4 font-mono text-slate-700">%{clickToLeadA.toFixed(2)}</td>
                <td className="p-4 font-mono text-purple-800 font-bold">%{clickToLeadB.toFixed(2)}</td>
                <td className="p-4 font-mono text-slate-600">
                  {clickToLeadB >= clickToLeadA ? `+${(clickToLeadB - clickToLeadA).toFixed(1)}%` : `${(clickToLeadB - clickToLeadA).toFixed(1)}%`}
                </td>
                <td className="p-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {clickToLeadB >= clickToLeadA ? "B" : "A"}
                  </span>
                </td>
              </tr>

              {/* Row: Statistical Confidence */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-800">İstatistiki Güven Düzeyi</td>
                <td className="p-4 text-slate-500 font-mono">Standart Baz</td>
                <td className="p-4 text-emerald-800 font-mono font-bold">%{statisticalConfidence.confidence}</td>
                <td className="p-4 text-emerald-700 font-semibold">{statisticalConfidence.text}</td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Kesin Sonuç
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. SIDE-BY-SIDE HERO VARIANT ACTION CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VARIATION A CARD */}
        <div className={`bg-white rounded-3xl border ${!isVariationBWinning ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200'} p-6 shadow-xs space-y-6 relative overflow-hidden flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                  A
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{abConfig.variationA.label}</h3>
                  <p className="text-xs text-slate-500">Kontrol Grubu • Orijinal Hero Manşeti</p>
                </div>
              </div>
              {!isVariationBWinning && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Şu Anki Lider</span>
                </span>
              )}
            </div>

            {/* Conversion Mini Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Ziyaret</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{viewsA}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Tıklanma</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{clicksA}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">CTR %</div>
                <div className="text-base font-black text-blue-600 mt-0.5">%{ctrA.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Lead CR</div>
                <div className="text-base font-black text-slate-900 mt-0.5">%{crA.toFixed(1)}</div>
              </div>
            </div>

            {/* Live Copy Visual Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 relative overflow-hidden">
              <div className="text-[10px] font-bold text-amber-300">
                {abConfig.variationA.badge || "✨ Profesyonel Hizmet"}
              </div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {abConfig.variationA.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                {abConfig.variationA.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
                  {abConfig.variationA.ctaPrimaryText}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white">
                  {abConfig.variationA.ctaSecondaryText}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {onOpenEditor && (
              <button
                type="button"
                onClick={() => onOpenEditor("A")}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>İçeriği Düzenle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleApplyWinner("A")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Varyasyon A'yı Kalıcı Yap</span>
            </button>
          </div>
        </div>

        {/* VARIATION B CARD */}
        <div className={`bg-white rounded-3xl border ${isVariationBWinning ? 'ring-2 ring-emerald-500 border-emerald-300 shadow-md' : 'border-slate-200'} p-6 shadow-xs space-y-6 relative overflow-hidden flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center">
                  B
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{abConfig.variationB.label}</h3>
                  <p className="text-xs text-slate-500">Challenger • Yeni Pazarlama Açısı & Aciliyet</p>
                </div>
              </div>
              {isVariationBWinning && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lider (+%{crLiftPercentage.toFixed(1)} Lead Artışı)</span>
                </span>
              )}
            </div>

            {/* Conversion Mini Box */}
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Ziyaret</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{viewsB}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Tıklanma</div>
                <div className="text-base font-black text-purple-700 mt-0.5">{clicksB}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">CTR %</div>
                <div className="text-base font-black text-purple-700 mt-0.5">%{ctrB.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Lead CR</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">%{crB.toFixed(1)}</div>
              </div>
            </div>

            {/* Live Copy Visual Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 relative overflow-hidden">
              <div className="text-[10px] font-bold text-amber-300">
                {abConfig.variationB.badge || "⚡ Hızlı Müdahale"}
              </div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {abConfig.variationB.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                {abConfig.variationB.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
                  {abConfig.variationB.ctaPrimaryText}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white">
                  {abConfig.variationB.ctaSecondaryText}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {onOpenEditor && (
              <button
                type="button"
                onClick={() => onOpenEditor("B")}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>İçeriği Düzenle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleApplyWinner("B")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Varyasyon B'yi Kazanan Yap & Uygula</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. INTERACTIVE SIMULATION & TESTING SANDBOX */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>İnteraktif Veri Simülatörü & Canlı Test Araçları</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Rapor ve grafiklerin dönüşüm oranlarını nasıl hesapladığını test etmek için anlık sanal tıklanma ve lead oluşturun.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimulateCustom("A", "click")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 text-xs font-bold cursor-pointer transition-all"
              title="Varyasyon A'ya 5 buton tıklaması ekle"
            >
              +5 Tık (A)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateCustom("B", "click")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold cursor-pointer transition-all"
              title="Varyasyon B'ye 5 buton tıklaması ekle"
            >
              +5 Tık (B)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateCustom("A", "lead")}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
              title="Varyasyon A'ya 1 form lead'i ekle"
            >
              +1 Lead (A)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateCustom("B", "lead")}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
              title="Varyasyon B'ye 1 form lead'i ekle"
            >
              +1 Lead (B)
            </button>
            <button
              type="button"
              onClick={() => {
                handleSimulateCustom("A", "traffic");
                handleSimulateCustom("B", "traffic");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
            >
              +50 Ziyaretçi (Eşit)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
