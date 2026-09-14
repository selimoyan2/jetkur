import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  AbTestExperiment,
  HeroVariantConfig,
  FormLead
} from "../../types";
import { AbTestingComparisonReport } from "./AbTestingComparisonReport";
import {
  GitCompare,
  TrendingUp,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Eye,
  Sliders,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Percent,
  Download,
  Zap,
  Layers,
  Check,
  BarChart3,
  Calendar,
  MessageCircle,
  Phone,
  Split
} from "lucide-react";

interface AbTestingManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

// Preset Unsplash backgrounds for quick testing
const HERO_BG_PRESETS = [
  {
    name: "Modern Kurumsal",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Endüstri & Hizmet",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Teknoloji & Ofis",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Hızlı Ulaşım & Dinamik",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
  }
];

export const AbTestingManager: React.FC<AbTestingManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  // Ensure abTesting config exists with safe fallbacks
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
        label: "Varyasyon A (Orijinal)",
        badge: config.hero?.badge || "✨ Profesyonel Hizmet",
        title: config.hero?.title || `${config.companyName} ile Güvenilir Çözümler`,
        subtitle: config.hero?.subtitle || `${config.city} genelinde uzman kadromuz ve garantili hizmet anlayışımızla yanınızdayız.`,
        ctaPrimaryText: config.hero?.ctaPrimaryText || "Hemen İletişime Geçin",
        ctaPrimaryLink: config.hero?.ctaPrimaryLink || `tel:${config.phone?.replace(/\s+/g, "") || ""}`,
        ctaSecondaryText: config.hero?.ctaSecondaryText || "WhatsApp Destek",
        ctaSecondaryLink: config.hero?.ctaSecondaryLink || `https://wa.me/${config.whatsapp || ""}`,
        bgImage: config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80",
        views: 480,
        leads: 28
      },
      variationB: {
        id: "var-b",
        label: "Varyasyon B (Teklif & Aciliyet)",
        badge: "🚀 15 Dakikada Hızlı Müdahale",
        title: "Acil Desteğe mi İhtiyacınız Var? Hemen Arayın!",
        subtitle: "Beklemeden, net fiyat garantisi ve ücretsiz ön keşif avantajıyla anında hizmet alın.",
        ctaPrimaryText: "Hemen Fiyat Teklifi Al",
        ctaPrimaryLink: "#contact",
        ctaSecondaryText: "WhatsApp'tan Yazın",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`,
        bgImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80",
        views: 495,
        leads: 46
      }
    };
  }, [config.abTesting, config.companyName, config.city, config.hero, config.phone, config.whatsapp]);

  // Local active subtab: "overview" | "editor" | "preview" | "leads"
  const [activeSubtab, setActiveSubtab] = useState<"overview" | "editor" | "preview" | "leads">("overview");
  
  // Selected variant in editor / preview: "A" | "B" | "split"
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B">("B");
  const [previewMode, setPreviewMode] = useState<"A" | "B" | "split">("split");

  // Leads filter: "all" | "A" | "B"
  const [leadFilter, setLeadFilter] = useState<"all" | "A" | "B">("all");

  // Success banner toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Helper to update variant
  const updateVariantA = (updates: Partial<HeroVariantConfig>) => {
    updateAbConfig({
      variationA: {
        ...abConfig.variationA,
        ...updates
      }
    });
  };

  const updateVariantB = (updates: Partial<HeroVariantConfig>) => {
    updateAbConfig({
      variationB: {
        ...abConfig.variationB,
        ...updates
      }
    });
  };

  // Conversion Metrics Calculations (Support both abConfig.stats and variant properties)
  const viewsA = abConfig.stats?.variantA?.views ?? abConfig.variationA.views ?? 0;
  const leadsA = abConfig.stats?.variantA?.leads ?? abConfig.variationA.leads ?? 0;
  const crA = viewsA > 0 ? (leadsA / viewsA) * 100 : 0;

  const viewsB = abConfig.stats?.variantB?.views ?? abConfig.variationB.views ?? 0;
  const leadsB = abConfig.stats?.variantB?.leads ?? abConfig.variationB.leads ?? 0;
  const crB = viewsB > 0 ? (leadsB / viewsB) * 100 : 0;

  const totalViews = viewsA + viewsB;
  const totalLeads = leadsA + leadsB;
  const blendedCr = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

  // Lift / Uplift Calculation
  const liftPercentage = crA > 0 ? ((crB - crA) / crA) * 100 : 0;
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

    // Approximation of standard normal CDF: Phi(z) = 0.5 * (1 + erf(z / sqrt(2)))
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
        text: `%${confidencePercent} Güven Seviyesi • Güçlü eğilim var, veri toplamaya devam edin.`,
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

  // Filtered Leads
  const allLeads = config.leads || [];
  const filteredLeads = useMemo(() => {
    if (leadFilter === "all") return allLeads;
    return allLeads.filter((l) => (l.heroVariant || "A") === leadFilter);
  }, [allLeads, leadFilter]);

  // Apply Winning Variant to Live Site
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
      endDate: new Date().toISOString().split("T")[0]
    };

    onChange({
      ...config,
      hero: updatedHero,
      abTesting: updatedAb
    });

    showToast(
      `🏆 Varyasyon ${winnerKey} kazanan olarak belirlendi ve sitenizin ana sayfa Hero bölümüne başarıyla kalıcı olarak uygulandı!`
    );
  };

  // Reset Experiment Stats
  const handleResetStats = () => {
    if (window.confirm("A/B testine ait tüm gösterim ve dönüşüm sayaçlarını sıfırlamak istediğinize emin misiniz?")) {
      updateAbConfig({
        startDate: new Date().toISOString().split("T")[0],
        startedAt: new Date().toLocaleDateString("tr-TR"),
        endDate: undefined,
        endedAt: undefined,
        status: "active",
        winningVariant: undefined,
        winnerVariant: null,
        stats: {
          variantA: { views: 0, leads: 0 },
          variantB: { views: 0, leads: 0 }
        },
        variationA: {
          ...abConfig.variationA,
          views: 0,
          leads: 0
        },
        variationB: {
          ...abConfig.variationB,
          views: 0,
          leads: 0
        }
      });
      showToast("Sayaçlar sıfırlandı. Yeni test başlatıldı.");
    }
  };

  // Simulate Visitors & Leads for Testing
  const handleSimulateTraffic = (count: number) => {
    const split = abConfig.trafficSplit || 50;
    let addA = 0;
    let addB = 0;

    for (let i = 0; i < count; i++) {
      if (Math.random() * 100 < split) {
        addA++;
      } else {
        addB++;
      }
    }

    // Typical conversion simulation: A has ~6%, B has ~9.5%
    let newLeadsA = 0;
    for (let i = 0; i < addA; i++) {
      if (Math.random() < 0.065) newLeadsA++;
    }
    let newLeadsB = 0;
    for (let i = 0; i < addB; i++) {
      if (Math.random() < 0.098) newLeadsB++;
    }

    const nextViewsA = viewsA + addA;
    const nextLeadsA = leadsA + newLeadsA;
    const nextViewsB = viewsB + addB;
    const nextLeadsB = leadsB + newLeadsB;

    updateAbConfig({
      stats: {
        variantA: { views: nextViewsA, leads: nextLeadsA },
        variantB: { views: nextViewsB, leads: nextLeadsB },
        history: abConfig.stats?.history
      },
      variationA: {
        ...abConfig.variationA,
        views: nextViewsA,
        leads: nextLeadsA
      },
      variationB: {
        ...abConfig.variationB,
        views: nextViewsB,
        leads: nextLeadsB
      }
    });

    showToast(`⚡ ${count} yeni ziyaretçi ve ${newLeadsA + newLeadsB} form talebi simüle edildi!`);
  };

  // Quick Preset Marketing Copy for Variation B
  const applyPresetAngle = (presetIndex: number) => {
    if (presetIndex === 0) {
      // Speed & Urgency
      updateVariantB({
        badge: "⚡ 15 Dakikada Kapınızda Acil Müdahale",
        title: "Yolda mı Kaldınız? En Hızlı Yol Yardım Ekibi Yanınızda!",
        subtitle: `${config.city} genelinde dakikalar içinde servis garantisi. Beklemeden hemen arayın, anında konumunuza gelelim.`,
        ctaPrimaryText: "Hemen Acil Çağrı Yap",
        ctaPrimaryLink: `tel:${config.phone?.replace(/\s+/g, "") || ""}`,
        ctaSecondaryText: "Canlı WhatsApp Konum Paylaş",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`
      });
      showToast("⚡ 'Hız & Aciliyet' pazarlama açısı Varyasyon B'ye uygulandı!");
    } else if (presetIndex === 1) {
      // Fixed Price & Transparency
      updateVariantB({
        badge: "💰 Sürprizsiz Sabit Fiyat Garantisi",
        title: "Gizli Masraf Yok! Net ve Şeffaf Fiyatlarla Hizmet Alın",
        subtitle: "İş başlangıcında ne konuştuysak faturanızda o yazar. Şimdi WhatsApp'tan fotoğraf veya detay gönderin, anında net fiyat teklifi alın.",
        ctaPrimaryText: "Ücretsiz Fiyat Teklifi İste",
        ctaPrimaryLink: "#contact",
        ctaSecondaryText: "Fiyat Sor & Danış",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`
      });
      showToast("💰 'Şeffaf Fiyat' pazarlama açısı Varyasyon B'ye uygulandı!");
    } else if (presetIndex === 2) {
      // Social Proof & Trust
      updateVariantB({
        badge: "⭐ 12+ Yıllık Tecrübe • 4.9/5 Müşteri Memnuniyeti",
        title: `${config.city}'nin En Çok Tavsiye Edilen Uzman Servisi`,
        subtitle: "10.000'den fazla mutlu müşteri ve kurumsal güvenceyle hizmetinizdeyiz. Profesyonel ustalarımızla garantili iş teslimi.",
        ctaPrimaryText: "Referanslarımızı & Hizmetleri Gör",
        ctaPrimaryLink: "#services",
        ctaSecondaryText: "WhatsApp Müşteri Danışmanı",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`
      });
      showToast("⭐ 'Sosyal Kanıt & Güven' açısı Varyasyon B'ye uygulandı!");
    } else if (presetIndex === 3) {
      // Free Initial Discovery / Inspection
      updateVariantB({
        badge: "🎁 %100 Ücretsiz Ön Keşif & Ekspertiz",
        title: "Karar Vermeden Önce Ücretsiz Keşif Avantajından Yararlanın",
        subtitle: "Uzmanlarımız adresinize gelsin, ihtiyacınızı yerinde incelesin ve en uygun maliyetli çözümü sizin için hazırlasın.",
        ctaPrimaryText: "Ücretsiz Keşif Randevusu Al",
        ctaPrimaryLink: "#contact",
        ctaSecondaryText: "WhatsApp Randevu",
        ctaSecondaryLink: `https://wa.me/${config.whatsapp || ""}`
      });
      showToast("🎁 'Ücretsiz Keşif' pazarlama açısı Varyasyon B'ye uygulandı!");
    }
  };

  // Export CSV of Variant Conversions
  const handleExportCsv = () => {
    const rows = [
      ["Varyasyon", "Ziyaretci", "Lead_Talebi", "Donusum_Orani", "Baslik", "Buton_Metni"],
      [
        "A (Kontrol)",
        viewsA.toString(),
        leadsA.toString(),
        `%${crA.toFixed(2)}`,
        `"${abConfig.variationA.title.replace(/"/g, '""')}"`,
        `"${abConfig.variationA.ctaPrimaryText.replace(/"/g, '""')}"`
      ],
      [
        "B (Challenger)",
        viewsB.toString(),
        leadsB.toString(),
        `%${crB.toFixed(2)}`,
        `"${abConfig.variationB.title.replace(/"/g, '""')}"`,
        `"${abConfig.variationB.ctaPrimaryText.replace(/"/g, '""')}"`
      ]
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hizliweb_ab_test_raporu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("A/B test verileri CSV dosyası olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-slate-950 text-white shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
              <Split className="w-3.5 h-3.5" />
              <span>Dönüşüm Oranı Optimizasyonu (CRO)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>A/B Testi: Ana Sayfa Hero Bölümü</span>
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
            <p className="text-sm text-slate-300 leading-relaxed">
              Ziyaretçilerinizi iki farklı Hero manşeti ve eylem çağrısıyla (CTA) karşılayın. Hangi başlık ve butonun form
              taleplerini daha çok artırdığını bilimsel olarak ölçün.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
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
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>Sitede İncele</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="CSV raporu indir"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleResetStats}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
              title="Sayaçları sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-t border-purple-900/60 pt-4 overflow-x-auto">
          <button
            type="button"
            id="subtab-ab-report-btn"
            onClick={() => setActiveSubtab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubtab === "overview"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Karşılaştırma Raporu (A vs B)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab("editor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubtab === "editor"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Varyasyon İçerik Düzenleyici</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab("preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubtab === "preview"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Canlı Görsel Karşılaştırma</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab("leads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubtab === "leads"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gelen Talepler & Eşleşmeler ({allLeads.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. OVERVIEW & COMPARISON REPORT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubtab === "overview" && (
        <AbTestingComparisonReport
          config={config}
          onChange={onChange}
          onPreview={onPreview}
          onOpenEditor={(variant) => {
            setSelectedVariant(variant);
            setActiveSubtab("editor");
          }}
          onOpenLivePreview={() => setActiveSubtab("preview")}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Legacy overview hidden */}
      {false && activeSubtab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Uplift Lift */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Dönüşüm Artışı (Lift)</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${liftPercentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {liftPercentage >= 0 ? `+${liftPercentage.toFixed(1)}%` : `${liftPercentage.toFixed(1)}%`}
                </span>
                <span className="text-xs font-bold text-slate-500">fark</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                {isVariationBWinning
                  ? "Varyasyon B, orijinal varyasyona göre daha fazla müşteri talebi üretiyor."
                  : "Varyasyon A şu an için daha yüksek dönüşüm sağlıyor."}
              </p>
            </div>

            {/* Metric 2: Statistical Significance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>İstatistiki Güven</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-600">
                  %{statisticalConfidence.confidence > 0 ? statisticalConfidence.confidence : "95+"}
                </span>
                <span className="text-xs font-bold text-slate-500">Güvenilirlik</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                {statisticalConfidence.text}
              </div>
            </div>

            {/* Metric 3: Total Visitors */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Toplam Test Ziyaretçisi</span>
                <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{totalViews}</span>
                <span className="text-xs text-slate-500 font-semibold">ziyaret</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>A: {viewsA}</span>
                <span>•</span>
                <span>B: {viewsB}</span>
              </div>
            </div>

            {/* Metric 4: Total Form Leads */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Kazanılan Lead / Talep</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Trophy className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600">{totalLeads}</span>
                <span className="text-xs font-bold text-slate-500">form talebi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ort. CR: %{blendedCr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VARIATION A CARD (CONTROL) */}
            <div className={`bg-white rounded-3xl border ${!isVariationBWinning ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200'} p-6 shadow-sm space-y-6 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center">
                    A
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{abConfig.variationA.label}</h3>
                    <p className="text-xs text-slate-500">Kontrol Grubu • Orijinal Manşet</p>
                  </div>
                </div>
                {!isVariationBWinning && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Şu Anki Lider</span>
                  </span>
                )}
              </div>

              {/* Conversion Highlight Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Gösterim</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{viewsA}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Form Talebi</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{leadsA}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Dönüşüm Oranı</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">%{crA.toFixed(2)}</div>
                </div>
              </div>

              {/* Content Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2.5">
                <div className="text-[11px] font-bold text-amber-300">
                  {abConfig.variationA.badge || "✨ Hizmet Rozeti"}
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

              {/* Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant("A");
                    setActiveSubtab("editor");
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Metinleri Düzenle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWinner("A")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Bu Varyasyonu Yayına Al</span>
                </button>
              </div>
            </div>

            {/* VARIATION B CARD (CHALLENGER) */}
            <div className={`bg-white rounded-3xl border ${isVariationBWinning ? 'ring-2 ring-emerald-500 border-emerald-300 shadow-md' : 'border-slate-200'} p-6 shadow-sm space-y-6 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center">
                    B
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{abConfig.variationB.label}</h3>
                    <p className="text-xs text-slate-500">Challenger • Yeni Pazarlama Açısı</p>
                  </div>
                </div>
                {isVariationBWinning && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 animate-pulse">
                    <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lider (%{liftPercentage.toFixed(1)} Artış)</span>
                  </span>
                )}
              </div>

              {/* Conversion Highlight Box */}
              <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Gösterim</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{viewsB}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Form Talebi</div>
                  <div className="text-xl font-black text-purple-700 mt-0.5">{leadsB}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Dönüşüm Oranı</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">%{crB.toFixed(2)}</div>
                </div>
              </div>

              {/* Content Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2.5">
                <div className="text-[11px] font-bold text-amber-300">
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

              {/* Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant("B");
                    setActiveSubtab("editor");
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Metinleri Düzenle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWinner("B")}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Bu Varyasyonu Kazanan Yap & Uygula</span>
                </button>
              </div>
            </div>
          </div>

          {/* Traffic Split Distribution Slider */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Ziyaretçi Trafiği Dağılımı (Traffic Split)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gelen ziyaretçilerin yüzde kaçının Varyasyon A, yüzde kaçının Varyasyon B'yi göreceğini belirleyin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[50, 60, 70, 80].map((splitVal) => (
                  <button
                    key={splitVal}
                    type="button"
                    onClick={() => updateAbConfig({ trafficSplit: splitVal })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      abConfig.trafficSplit === splitVal
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    %{splitVal} / %{100 - splitVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={abConfig.trafficSplit || 50}
                onChange={(e) => updateAbConfig({ trafficSplit: Number(e.target.value) })}
                className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="text-slate-900">Varyasyon A (Kontrol): %{abConfig.trafficSplit || 50}</span>
                <span className="text-purple-600">Varyasyon B (Challenger): %{100 - (abConfig.trafficSplit || 50)}</span>
              </div>
            </div>
          </div>

          {/* Test Simulation Tool (Quick Testing Sandbox) */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simülasyon & Test Motoru</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Testin sonuçlarını ve matematiksel istatistik hesaplayıcısını test etmek için anlık sanal ziyaretçi ve
                  lead simüle edin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateTraffic(25)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold cursor-pointer transition-all"
                >
                  +25 Ziyaretçi Simüle Et
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateTraffic(100)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  +100 Ziyaretçi Simüle Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. VARIANT CONTENT EDITOR TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubtab === "editor" && (
        <div className="space-y-6">
          {/* Variant Selector Switch */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Düzenlenecek Varyasyon:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedVariant("A")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedVariant === "A" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🔵 Varyasyon A (Kontrol)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVariant("B")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedVariant === "B" ? "bg-purple-600 text-white shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🟣 Varyasyon B (Challenger)
                </button>
              </div>
            </div>

            {selectedVariant === "B" && (
              <span className="text-xs text-purple-700 font-semibold hidden sm:inline-block">
                ✨ Aşağıdaki hazır pazarlama açılarından birine tıklayarak anında doldurabilirsiniz.
              </span>
            )}
          </div>

          {/* AI / High-Converting Presets for Variant B */}
          {selectedVariant === "B" && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Hazır Yüksek Dönüşümlü Pazarlama Açıları (Presets)</span>
                  </h3>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Farklı psikolojik tetikleyicilerle hazırlanmış test metinlerini tek tıkla Varyasyon B'ye aktarın.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => applyPresetAngle(0)}
                  className="p-4 rounded-2xl bg-white hover:bg-purple-100/50 border border-purple-200/80 text-left transition-all hover:border-purple-400 group cursor-pointer"
                >
                  <div className="text-base font-black text-slate-900 mb-1 flex items-center justify-between">
                    <span>⚡ Hız & Aciliyet</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "15 Dakikada Kapınızda!" Acil yardıma veya hemen çözüme ihtiyaç duyanlar için.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetAngle(1)}
                  className="p-4 rounded-2xl bg-white hover:bg-purple-100/50 border border-purple-200/80 text-left transition-all hover:border-purple-400 group cursor-pointer"
                >
                  <div className="text-base font-black text-slate-900 mb-1 flex items-center justify-between">
                    <span>💰 Şeffaf Fiyat</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Gizli Maliyet Yok!" Net fiyat ve WhatsApp'tan anında teklif arayanlar için.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetAngle(2)}
                  className="p-4 rounded-2xl bg-white hover:bg-purple-100/50 border border-purple-200/80 text-left transition-all hover:border-purple-400 group cursor-pointer"
                >
                  <div className="text-base font-black text-slate-900 mb-1 flex items-center justify-between">
                    <span>⭐ Güven & Yorum</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "12+ Yıllık Tecrübe & 4.9 Puan!" Garantili ve kurumsal güvence arayanlar için.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetAngle(3)}
                  className="p-4 rounded-2xl bg-white hover:bg-purple-100/50 border border-purple-200/80 text-left transition-all hover:border-purple-400 group cursor-pointer"
                >
                  <div className="text-base font-black text-slate-900 mb-1 flex items-center justify-between">
                    <span>🎁 Ücretsiz Keşif</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Sıfır Riskle Randevu Alın!" Karar vermeden önce yerinde keşif isteyenler için.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields for Active Variant */}
          {(() => {
            const currentVariantData = selectedVariant === "A" ? abConfig.variationA : abConfig.variationB;
            const updateCurrent = selectedVariant === "A" ? updateVariantA : updateVariantB;

            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {selectedVariant === "A" ? "🔵 Varyasyon A (Kontrol) İçeriği" : "🟣 Varyasyon B (Challenger) İçeriği"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bu varyasyonu görüntüleyen ziyaretçiler aşağıdaki başlık, buton ve görselleri görecektir.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                    ID: {currentVariantData.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Badge */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Üst Rozet / Etiket Metni
                    </label>
                    <input
                      type="text"
                      value={currentVariantData.badge || ""}
                      onChange={(e) => updateCurrent({ badge: e.target.value })}
                      placeholder="Örn: ✨ Profesyonel & Güvenilir Hizmet"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Varyasyon Tanımı (Panel içi başlık)
                    </label>
                    <input
                      type="text"
                      value={currentVariantData.label || ""}
                      onChange={(e) => updateCurrent({ label: e.target.value })}
                      placeholder="Örn: Varyasyon B (Aciliyet Odaklı)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>

                  {/* Main Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hero Ana Başlık (H1) *
                    </label>
                    <input
                      type="text"
                      value={currentVariantData.title || ""}
                      onChange={(e) => updateCurrent({ title: e.target.value })}
                      placeholder="Örn: 15 Dakikada Kapınızda Acil Yol Yardım"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hero Alt Açıklama Paragrafı
                    </label>
                    <textarea
                      rows={3}
                      value={currentVariantData.subtitle || ""}
                      onChange={(e) => updateCurrent({ subtitle: e.target.value })}
                      placeholder="Hizmet avantajlarını ve güven veren detayları buraya yazın..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none leading-relaxed"
                    />
                  </div>

                  {/* Primary CTA */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Birincil Buton (Primary CTA)
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={currentVariantData.ctaPrimaryText || ""}
                        onChange={(e) => updateCurrent({ ctaPrimaryText: e.target.value })}
                        placeholder="Örn: Hemen Fiyat Teklifi Al"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white focus:border-purple-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Buton Linki / Hedefi</label>
                      <input
                        type="text"
                        value={currentVariantData.ctaPrimaryLink || ""}
                        onChange={(e) => updateCurrent({ ctaPrimaryLink: e.target.value })}
                        placeholder="Örn: #contact veya tel:05XXXXXXXXX"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      İkincil Buton (WhatsApp / Destek)
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={currentVariantData.ctaSecondaryText || ""}
                        onChange={(e) => updateCurrent({ ctaSecondaryText: e.target.value })}
                        placeholder="Örn: WhatsApp Destek"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white focus:border-purple-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Buton Linki / Hedefi</label>
                      <input
                        type="text"
                        value={currentVariantData.ctaSecondaryLink || ""}
                        onChange={(e) => updateCurrent({ ctaSecondaryLink: e.target.value })}
                        placeholder="Örn: https://wa.me/905XXXXXXXXX"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Background Image URL & Presets */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Hero Arka Plan Görseli
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentVariantData.bgImage || ""}
                        onChange={(e) => updateCurrent({ bgImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:border-purple-600 outline-none"
                      />
                    </div>

                    {/* Image Preset Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Örnek Görseller:</span>
                      {HERO_BG_PRESETS.map((bg) => (
                        <button
                          key={bg.name}
                          type="button"
                          onClick={() => updateCurrent({ bgImage: bg.url })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. LIVE VISUAL PREVIEW TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubtab === "preview" && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Önizleme Modu:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewMode("A")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === "A" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🔵 Sadece Varyasyon A
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("B")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === "B" ? "bg-purple-600 text-white shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🟣 Sadece Varyasyon B
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("split")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === "split" ? "bg-slate-900 text-white shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  ⚔️ Yan Yana Karşılaştır
                </button>
              </div>
            </div>

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>İframe Önizlemede Canlı Test Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Visual Previews Grid */}
          <div
            className={`grid gap-6 ${
              previewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* PREVIEW A */}
            {(previewMode === "A" || previewMode === "split") && (
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-md bg-slate-950 text-white relative flex flex-col">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-200">Varyasyon A (Kontrol)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">CR: %{crA.toFixed(2)}</span>
                </div>

                <div
                  className="p-8 sm:p-12 relative min-h-[360px] flex items-center bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${abConfig.variationA.bgImage || config.hero?.bgImage}')`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50" />
                  <div className="relative z-10 max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-amber-300">
                      {abConfig.variationA.badge}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {abConfig.variationA.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {abConfig.variationA.subtitle}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                      >
                        {abConfig.variationA.ctaPrimaryText} →
                      </a>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur text-white font-semibold text-xs border border-white/25"
                      >
                        💬 {abConfig.variationA.ctaSecondaryText}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW B */}
            {(previewMode === "B" || previewMode === "split") && (
              <div className="rounded-3xl border border-purple-300 overflow-hidden shadow-md bg-slate-950 text-white relative flex flex-col">
                <div className="p-3 bg-purple-950 border-b border-purple-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-xs font-bold text-purple-200">Varyasyon B (Challenger)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    CR: %{crB.toFixed(2)} (+{liftPercentage.toFixed(1)}%)
                  </span>
                </div>

                <div
                  className="p-8 sm:p-12 relative min-h-[360px] flex items-center bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${abConfig.variationB.bgImage || config.hero?.bgImage}')`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-purple-950/70 to-slate-950/50" />
                  <div className="relative z-10 max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur border border-purple-400/40 text-xs font-semibold text-purple-300">
                      {abConfig.variationB.badge}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {abConfig.variationB.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {abConfig.variationB.subtitle}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                      >
                        {abConfig.variationB.ctaPrimaryText} →
                      </a>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur text-white font-semibold text-xs border border-white/25"
                      >
                        💬 {abConfig.variationB.ctaSecondaryText}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. LEADS & FORM SUBMISSIONS ATTRIBUTION TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubtab === "leads" && (
        <div className="space-y-6">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Varyasyon Filtresi:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setLeadFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leadFilter === "all" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  Tümü ({allLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeadFilter("A")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leadFilter === "A" ? "bg-blue-600 text-white shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🔵 Varyasyon A ({allLeads.filter((l) => (l.heroVariant || "A") === "A").length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeadFilter("B")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leadFilter === "B" ? "bg-purple-600 text-white shadow-xs font-black" : "text-slate-600"
                  }`}
                >
                  🟣 Varyasyon B ({allLeads.filter((l) => l.heroVariant === "B").length})
                </button>
              </div>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("leads")}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Tüm CRM & Gelir Yönetimine Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-700">Bu varyasyona ait kayıtlı form talebi bulunamadı.</p>
                <p className="text-xs text-slate-400">
                  Ziyaretçiler web sitenizdeki formları doldurdukça gördükleri Hero varyasyonuna göre buraya otomatik işlenir.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Tarih</th>
                      <th className="p-4">Müşteri</th>
                      <th className="p-4">İletişim</th>
                      <th className="p-4">Hizmet / Konu</th>
                      <th className="p-4">Gördüğü Varyasyon</th>
                      <th className="p-4 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredLeads.map((lead) => {
                      const variant = lead.heroVariant || "A";
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {lead.date}
                          </td>
                          <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                                  className="text-slate-700 hover:text-purple-600 font-mono"
                                >
                                  {lead.phone}
                                </a>
                              )}
                              {lead.email && (
                                <span className="text-slate-400 text-[11px]">({lead.email})</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {lead.serviceOrProduct || "Genel Teklif"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${
                                variant === "B"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  variant === "B" ? "bg-purple-600" : "bg-blue-600"
                                }`}
                              />
                              <span>Varyasyon {variant}</span>
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                lead.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : lead.status === "contacted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {lead.status === "completed"
                                ? "Kazanıldı"
                                : lead.status === "contacted"
                                ? "Görüşüldü"
                                : "Yeni"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
