import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import {
  CompetitorPricingStrategyData,
  CompetitorProductPricingItem,
  CompetitorProfileStrategy,
  generateFallbackCompetitorPricingStrategy
} from "../../utils/competitorPricingStrategyEngine";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Target,
  ChevronRight,
  Copy,
  Check,
  Building2,
  DollarSign,
  ArrowUpRight,
  Info,
  Clock,
  Layers,
  Scale,
  Award,
  CheckCircle2,
  FileDown
} from "lucide-react";

interface CompetitorPriceStrategyCardProps {
  config: SiteConfig;
  className?: string;
  onDownloadPdf?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const CompetitorPriceStrategyCard: React.FC<CompetitorPriceStrategyCardProps> = ({
  config,
  className = "",
  onDownloadPdf,
  onNavigateTab
}) => {
  const [data, setData] = useState<CompetitorPricingStrategyData>(() =>
    generateFallbackCompetitorPricingStrategy(config)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLiveGemini, setIsLiveGemini] = useState<boolean>(false);

  // Fetch real-time pricing analysis from Gemini endpoint
  const fetchPriceCompetitiveness = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/strategy/price-competitiveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          companyName: config.companyName,
          sector: config.sector,
          city: config.city
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          setIsLiveGemini(json.source === "gemini_3.8_flash");
        }
      }
    } catch (err) {
      console.warn("Pricing strategy fetch failed, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceCompetitiveness();
  }, [config.companyName, config.sector, config.city]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.products.forEach(p => set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [data.products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return data.products;
    return data.products.filter(p => p.category === selectedCategory);
  }, [data.products, selectedCategory]);

  const handleCopySummary = () => {
    const text = `=== ${data.companyName} | FİYAT REKABETİ & STRATEJİ ANALİZİ ===
Sektör: ${data.sector} | Şehir: ${data.city}
Fiyatlandırma Pozisyonu: ${data.geminiAdvice.pricePositioningVerdict}
Fiyat Rekabet Skoru: %${data.geminiAdvice.overallPriceCompetitivenessScore}
Öngörülen Gelir Artış Potansiyeli: +%${data.geminiAdvice.potentialRevenueUpliftPercent}

[YÖNETİCİ ÖNERİSİ]
${data.geminiAdvice.executiveRecommendation}

[FİYAT SAVAŞI UYARISI]
${data.geminiAdvice.priceWarWarning}

[RAKİP FİYAT ENDEKSLERİ (Sektör Ortalaması: 100)]
- Siteniz: ${data.priceIndexSummary.userIndex} (Sweet Spot)
- Pazar Lideri: ${data.priceIndexSummary.leaderIndex} (+%26 Premium)
- Bölgesel Rakip: ${data.priceIndexSummary.regionalIndex} (-%16 Taban Fiyat)
- Meydan Okuyan: ${data.priceIndexSummary.challengerIndex} (-%9 Kampanyalı)`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      id="fiyat-rekabeti-strateji-karti-section"
      className={`bg-slate-900 border border-emerald-900/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-8 relative overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fiyat Rekabeti Karşılaştırma Kartı</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isLiveGemini ? "Gemini 3.8 Flash Canlı Analiz" : "Gemini Fiyat Zekası"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{data.lastCheckedFormatted}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Rakiplerin Benzer Ürün Fiyatları & Fiyat Rekabeti Önerileri</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Pazar lideri, bölgesel rakipler ve meydan okuyanların benzer hizmet/ürün fiyatlandırma taktikleri gerçek zamanlı takip edilir;
            Gemini zekası ile kâr marjınızı kırmadan müşteri dönüşümünü maksimize edecek stratejik tavsiyeler üretilir.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchPriceCompetitiveness}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Fiyat analizi ve Gemini önerilerini yeniden çalıştır"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Hesaplanıyor..." : "Yeniden Analiz Et"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Özeti panoya kopyala"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Özeti Kopyala</span>
              </>
            )}
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer ring-1 ring-white/10"
              title="Fiyat Rekabet Raporunu PDF'e Aktar"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-200" />
              <span>PDF Raporuna Aktar</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiyat Rekabet Gücü</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
            %{data.geminiAdvice.overallPriceCompetitivenessScore}
          </div>
          <div className="text-[11px] text-slate-400">Pazardaki Güçlü Konum</div>
        </div>

        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fiyat Konumlandırması</span>
          </div>
          <div className="text-sm sm:text-base font-black text-cyan-200 truncate">
            {data.geminiAdvice.pricePositioningVerdict}
          </div>
          <div className="text-[11px] text-slate-400">Optimum Değer Noktası</div>
        </div>

        <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-indigo-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Potansiyel Gelir Artışı</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300">
            +%{data.geminiAdvice.potentialRevenueUpliftPercent}
          </div>
          <div className="text-[11px] text-slate-400">Paketleme & Çıpalama ile</div>
        </div>

        <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-purple-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            <span>Lider Fiyat Farkı</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
            -%26 Daha Cazip
          </div>
          <div className="text-[11px] text-slate-400">Yüksek Marj Kalkanı</div>
        </div>
      </div>

      {/* GEMINI EXECUTIVE RECOMMENDATION & POSITIONING SPECTRUM */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Gemini Zekası Üst Yönetici Sentezi
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Stratejik Fiyatlandırma Pozisyonu ve Pazar Fırsatı
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {data.geminiAdvice.executiveRecommendation}
        </p>

        {/* Price Positioning Spectrum */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Bütçe / Taban Fiyat (Bölgesel Rakip: 84)</span>
            <span className="text-cyan-300">🎯 Siteniz (Değer Odaklı Sweet Spot: 97)</span>
            <span>Premium Prestij (Pazar Lideri: 126)</span>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-full relative overflow-hidden flex">
            <div className="bg-rose-500/60 w-1/3 h-full" title="Düşük Taban & Gizli Maliyet Riski" />
            <div className="bg-emerald-500 w-1/3 h-full" title="Optimum Değer & Yüksek Dönüşüm" />
            <div className="bg-purple-500/60 w-1/3 h-full" title="Premium Lüks & Marka Rantı" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Düşük Marj & Fiyat Kırma Riski</span>
            <span className="text-emerald-400 font-bold">En Yüksek Müşteri Kazanım Verimliliği</span>
            <span>Yüksek Fiyat Bariyeriyle Müşteri Kaçırma</span>
          </div>
        </div>

        {/* Price War Warning Alert */}
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <div className="font-bold text-rose-200">Fiyat Kırma Savaşı (Race to the Bottom) Uyarısı:</div>
            <div className="text-rose-300/90 text-[11px] leading-relaxed">
              {data.geminiAdvice.priceWarWarning}
            </div>
          </div>
        </div>
      </div>

      {/* COMPETITOR PRICING MODELS COMPARISON CARDS */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Piyasadaki Rakiplerin Fiyatlandırma Stratejileri</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data.competitorProfiles.map(comp => (
            <div
              key={comp.id}
              className={`rounded-2xl p-4 border space-y-3 relative flex flex-col justify-between ${
                comp.role === "Siteniz (Siz)"
                  ? "bg-slate-950 border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-lg"
                  : comp.role === "Pazar Lideri (#1)"
                  ? "bg-slate-950/80 border-purple-500/40"
                  : comp.role === "Bölgesel Rakip (#2)"
                  ? "bg-slate-950/80 border-emerald-500/40"
                  : "bg-slate-950/80 border-amber-500/40"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: `${comp.color}20`,
                      color: comp.color,
                      border: `1px solid ${comp.color}40`
                    }}
                  >
                    {comp.role}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    Endeks: <strong className="text-white">{comp.priceIndexVsMarket}</strong>
                  </span>
                </div>

                <div className="font-bold text-sm text-white">{comp.name}</div>
                <div className="text-[11px] font-bold text-cyan-300">{comp.strategyModel}</div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                  <strong className="text-slate-400 block text-[10px] uppercase">Taktik:</strong>
                  {comp.coreTactic}
                </div>

                <div className="text-xs text-rose-300/90 leading-relaxed bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
                  <strong className="text-rose-400 block text-[10px] uppercase">Zayıf Nokta:</strong>
                  {comp.vulnerability}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300">
                <strong className="text-slate-400 block text-[10px] uppercase">Karşı Hamle:</strong>
                {comp.recommendedCounterMove}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BENZER ÜRÜNLER & HİZMETLER KARŞILAŞTIRMA TABLOSU */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Benzer Ürünler / Hizmetler Fiyat Kıyaslama Matrisi</span>
            </h4>
            <p className="text-xs text-slate-400">
              Rakiplerin katalog ve telefon tekliflerinden derlenen fiyat seviyeleri ve sapma oranları.
            </p>
          </div>

          {/* Category Filter */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat === "all" ? "Tüm Hizmetler" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Benzer Hizmet / Ürün</th>
                <th className="py-3 px-3 text-cyan-300 bg-cyan-950/30">Siteniz (Fiyat)</th>
                <th className="py-3 px-3 text-purple-300">Pazar Lideri (#1)</th>
                <th className="py-3 px-3 text-emerald-300">Bölgesel Rakip (#2)</th>
                <th className="py-3 px-3 text-amber-300">Meydan Okuyan (#3)</th>
                <th className="py-3 px-3">Sektör Ort.</th>
                <th className="py-3 px-3">Fark (%)</th>
                <th className="py-3 px-4">Gemini Fiyat Rekabeti Tavsiyesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{prod.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Kategori: {prod.category} • Birim: {prod.unit}
                    </div>
                  </td>

                  {/* User Price */}
                  <td className="py-3 px-3 font-mono font-black text-sm text-cyan-300 bg-cyan-950/20">
                    {prod.userPriceFormatted}
                  </td>

                  {/* Leader Price */}
                  <td className="py-3 px-3 font-mono text-purple-300">
                    {prod.compLeaderFormatted}
                  </td>

                  {/* Regional Price */}
                  <td className="py-3 px-3 font-mono text-emerald-300">
                    {prod.compRegionalFormatted}
                  </td>

                  {/* Challenger Price */}
                  <td className="py-3 px-3 font-mono text-amber-300">
                    {prod.compChallengerFormatted}
                  </td>

                  {/* Market Average */}
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {prod.marketAverageFormatted}
                  </td>

                  {/* Variance */}
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.variancePercent < 0
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {prod.variancePercent > 0 ? `+${prod.variancePercent}%` : `${prod.variancePercent}%`}
                    </span>
                  </td>

                  {/* Gemini Advice */}
                  <td className="py-3 px-4 text-xs text-slate-300 leading-relaxed max-w-xs">
                    {prod.geminiPriceAdvice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GEMINI 4 STRATEGIC ACTION PILLARS */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Gemini Zekası 'Fiyat Rekabeti' 4 Temel Aksiyon Sütunu</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data.geminiAdvice.actionPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {pillar.badge}
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  {pillar.impact}
                </span>
              </div>

              <div className="font-bold text-sm text-white">{pillar.title}</div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SOMUT FİYAT REVİZYON TAVSİYELERİ (TACTICAL ADJUSTMENTS) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Önerilen Taktiksel Fiyat Revizyonları</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Dönüşüm kaybı olmadan ek kâr üretme noktaları
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.geminiAdvice.tacticalAdjustments.map((t, idx) => (
            <div key={idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate">{t.productName}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {t.actionType}
                </span>
              </div>

              <div className="font-mono text-sm font-bold text-slate-300">
                ₺{t.currentPrice.toLocaleString("tr-TR")} ➔{" "}
                <span className="text-emerald-400 font-black">
                  ₺{t.recommendedPrice.toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                {t.rationale}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER NOTICE */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {data.marketTrendNotice}
          </span>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab("customer-panel")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>Fiyatlandırma Kataloğunu Düzenle</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>
    </div>
  );
};
