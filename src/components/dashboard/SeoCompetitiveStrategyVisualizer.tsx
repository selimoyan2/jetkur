import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  CompetitiveRadarAxisDef, 
  CompetitiveStrategyEntity, 
  CompetitiveStrategicAction 
} from "../../types";
import { 
  buildCompetitiveStrategyData, 
  CORE_RADAR_AXES, 
  EXTENDED_RADAR_AXES 
} from "../../utils/competitiveStrategyGenerator";
import { D3CompetitiveRadarChart } from "./D3CompetitiveRadarChart";
import {
  ShieldCheck,
  Target,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  FileText,
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  BarChart3,
  Search,
  BookOpen
} from "lucide-react";

interface SeoCompetitiveStrategyVisualizerProps {
  config: SiteConfig;
  onChange?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  onSendToAiBlog?: (topic: string, primaryKeyword: string) => void;
}

export const SeoCompetitiveStrategyVisualizer: React.FC<SeoCompetitiveStrategyVisualizerProps> = ({
  config,
  onChange,
  onNavigateTab,
  onSendToAiBlog
}) => {
  const strategyData = useMemo(() => buildCompetitiveStrategyData(config), [config]);
  const { entities, coreAxes, extendedAxes, tacticalActions } = strategyData;

  // State
  const [axisMode, setAxisMode] = useState<"core" | "extended">("core");
  const [activeEntityIds, setActiveEntityIds] = useState<string[]>(entities.map(e => e.id));
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [selectedAxisKey, setSelectedAxisKey] = useState<string | null>("siteSpeed");
  const [copiedReport, setCopiedReport] = useState(false);

  // Strategy Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedBoosts, setSimulatedBoosts] = useState({
    domainAuthority: 0, // +0 to +30
    keywordDensity: 0,  // +0 to +20
    siteSpeed: 0        // +0 to +4
  });

  const activeAxes = axisMode === "core" ? coreAxes : extendedAxes;

  const userEntity = entities.find(e => e.isUser) || entities[0];
  const competitors = entities.filter(e => !e.isUser);
  const comp1 = competitors[0];
  const comp2 = competitors[1];
  const comp3 = competitors[2];

  // Calculated simulated scores for user site
  const simulatedUserMetrics = useMemo(() => {
    return {
      domainAuthority: Math.min(100, (userEntity.metrics.domainAuthority || 50) + simulatedBoosts.domainAuthority),
      keywordDensity: Math.min(100, (userEntity.metrics.keywordDensity || 70) + simulatedBoosts.keywordDensity),
      siteSpeed: Math.min(100, (userEntity.metrics.siteSpeed || 96) + simulatedBoosts.siteSpeed),
      backlinkProfile: Math.min(100, (userEntity.metrics.backlinkProfile || 50) + Math.round(simulatedBoosts.domainAuthority * 0.8)),
      contentDepth: Math.min(100, (userEntity.metrics.contentDepth || 65) + Math.round(simulatedBoosts.keywordDensity * 0.9)),
      technicalSeo: userEntity.metrics.technicalSeo || 90
    };
  }, [userEntity, simulatedBoosts]);

  // Handle entity toggle in legend
  const handleToggleEntity = (id: string) => {
    setActiveEntityIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one visible
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Quick 1-on-1 matchup selectors
  const handleSelectMatchup = (targetCompId: "all" | string) => {
    if (targetCompId === "all") {
      setActiveEntityIds(entities.map(e => e.id));
    } else {
      setActiveEntityIds(["user-site", targetCompId]);
    }
  };

  // Copy Executive Strategy Summary to clipboard
  const handleCopyStrategyReport = () => {
    const reportText = `=== SEO REKABET STRATEJİSİ RAPORU (${config.companyName || "Firma"}) ===
Sektör: ${config.sector || "Genel"} | Şehir: ${config.city || "İstanbul"}

1. ALAN ADI OTORİTESİ (DA):
- Siteniz: ${userEntity.metrics.domainAuthority}/100
- 1. Rakip (${comp1.name}): ${comp1.metrics.domainAuthority}/100 (Fark: ${(userEntity.metrics.domainAuthority || 0) - (comp1.metrics.domainAuthority || 0)})
- 2. Rakip (${comp2.name}): ${comp2.metrics.domainAuthority}/100
- 3. Rakip (${comp3.name}): ${comp3.metrics.domainAuthority}/100

2. ANAHTAR KELİME YOĞUNLUĞU & SEMANTİK UYUM:
- Siteniz: ${userEntity.metrics.keywordDensity}/100
- 1. Rakip (${comp1.name}): ${comp1.metrics.keywordDensity}/100
- 2. Rakip (${comp2.name}): ${comp2.metrics.keywordDensity}/100
- 3. Rakip (${comp3.name}): ${comp3.metrics.keywordDensity}/100

3. SİTE HIZI (CORE WEB VITALS):
- Siteniz: ${userEntity.metrics.siteSpeed}/100 (LİDER KONUM! +${(userEntity.metrics.siteSpeed || 0) - (comp1.metrics.siteSpeed || 0)} Puan Önde)
- 1. Rakip (${comp1.name}): ${comp1.metrics.siteSpeed}/100
- 2. Rakip (${comp2.name}): ${comp2.metrics.siteSpeed}/100
- 3. Rakip (${comp3.name}): ${comp3.metrics.siteSpeed}/100

STRATEJİK AKSİYONLAR:
${tacticalActions.map((a, i) => `${i + 1}. [${a.priority}] ${a.title}\n   Etki: ${a.impactScore}\n   Özet: ${a.strategySummary}`).join("\n\n")}`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Reset simulator
  const handleResetSimulation = () => {
    setSimulatedBoosts({
      domainAuthority: 0,
      keywordDensity: 0,
      siteSpeed: 0
    });
    setIsSimulating(false);
  };

  return (
    <div id="seo-competitive-strategy-visualizer" className="space-y-6">
      {/* Top Banner & Strategy Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                D3.js Radar Matrisi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {config.sector || "Evden Eve Nakliyat"}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {config.city || "İstanbul"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SEO Rekabet Stratejisi Görselleştirici
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Sitenizi sektörünüzün en güçlü <strong className="text-white">ilk 3 rakibiyle</strong> alan adı otoritesi (DA), anahtar kelime yoğunluğu ve site hızı metriklerinde çok eksenli D3 polar radar grafiğinde kıyaslayın ve aradaki farkı kapatacak somut stratejileri uygulayın.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-copy-strategy-report"
              onClick={handleCopyStrategyReport}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Rapor Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Strateji Özetini Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Matchup Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Kıyaslama Modu:</span>
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 flex items-center gap-1">
              <button
                type="button"
                id="btn-radar-mode-core"
                onClick={() => setAxisMode("core")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  axisMode === "core"
                    ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Temel 3 Metrik (Otorite, Kelime, Hız)
              </button>
              <button
                type="button"
                id="btn-radar-mode-extended"
                onClick={() => setAxisMode("extended")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  axisMode === "extended"
                    ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Genişletilmiş 6 Eksen
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Odak:</span>
            <button
              type="button"
              onClick={() => handleSelectMatchup("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEntityIds.length === entities.length
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Tüm Rakipler
            </button>
            <button
              type="button"
              onClick={() => handleSelectMatchup("comp-1")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEntityIds.length === 2 && activeEntityIds.includes("comp-1")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-amber-300 hover:bg-slate-800"
              }`}
            >
              Vs. 1. Rakip (Pazar Lideri)
            </button>
            <button
              type="button"
              onClick={() => handleSelectMatchup("comp-2")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEntityIds.length === 2 && activeEntityIds.includes("comp-2")
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-rose-300 hover:bg-slate-800"
              }`}
            >
              Vs. 2. Rakip
            </button>
            <button
              type="button"
              onClick={() => handleSelectMatchup("comp-3")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEntityIds.length === 2 && activeEntityIds.includes("comp-3")
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-purple-300 hover:bg-slate-800"
              }`}
            >
              Vs. 3. Rakip
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: D3 Radar Chart (Left) + 3 Core Metric Deep-Dives (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive D3 Radar Chart */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <D3CompetitiveRadarChart
            entities={entities}
            axes={activeAxes}
            activeEntityIds={activeEntityIds}
            onToggleEntity={handleToggleEntity}
            hoveredEntityId={hoveredEntityId}
            onHoverEntity={setHoveredEntityId}
            selectedAxisKey={selectedAxisKey}
            onSelectAxis={setSelectedAxisKey}
            isSimulating={isSimulating}
            simulatedUserMetrics={simulatedUserMetrics}
          />

          {/* Strategy Simulator Drawer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Strateji &amp; Skor Simülatörü
                  </h3>
                  <p className="text-xs text-slate-500">
                    Geliştirme hedeflerinizi simüle ederek radar grafiğindeki potansiyel büyüme alanınızı izleyin.
                  </p>
                </div>
              </div>

              {isSimulating && (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Sıfırla</span>
                </button>
              )}
            </div>

            {/* Simulation Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* DA Slider */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Alan Adı Otoritesi (DA)</span>
                  <span className="font-black text-emerald-600 font-mono">
                    +{simulatedBoosts.domainAuthority} DA
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="2"
                  value={simulatedBoosts.domainAuthority}
                  onChange={(e) => {
                    setSimulatedBoosts(prev => ({ ...prev, domainAuthority: Number(e.target.value) }));
                    setIsSimulating(true);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Mevcut: {userEntity.metrics.domainAuthority}</span>
                  <span className="font-bold text-slate-700">Hedef: {simulatedUserMetrics.domainAuthority}</span>
                </div>
              </div>

              {/* Keyword Density Slider */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Kelime Yoğunluğu</span>
                  <span className="font-black text-emerald-600 font-mono">
                    +{simulatedBoosts.keywordDensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="2"
                  value={simulatedBoosts.keywordDensity}
                  onChange={(e) => {
                    setSimulatedBoosts(prev => ({ ...prev, keywordDensity: Number(e.target.value) }));
                    setIsSimulating(true);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Mevcut: {userEntity.metrics.keywordDensity}</span>
                  <span className="font-bold text-slate-700">Hedef: {simulatedUserMetrics.keywordDensity}</span>
                </div>
              </div>

              {/* Site Speed Slider */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Site Hızı (CWV)</span>
                  <span className="font-black text-emerald-600 font-mono">
                    +{simulatedBoosts.siteSpeed} Puan
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={simulatedBoosts.siteSpeed}
                  onChange={(e) => {
                    setSimulatedBoosts(prev => ({ ...prev, siteSpeed: Number(e.target.value) }));
                    setIsSimulating(true);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Mevcut: {userEntity.metrics.siteSpeed}</span>
                  <span className="font-bold text-slate-700">Hedef: {simulatedUserMetrics.siteSpeed} (Maks)</span>
                </div>
              </div>
            </div>

            {isSimulating && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Simülasyon Aktif: Sitenizin tahmini aylık trafiği <strong className="font-bold text-emerald-950">+1.850 organik ziyaretçi</strong> artabilir.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("ai-content-planner");
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer"
                >
                  Planı Başlat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: The 3 Core Metric Head-to-Head Cards & Gaps */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>3 Temel Metrik Analizi &amp; Farklar</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Siteniz vs. Top 3 Rakip
            </span>
          </div>

          {/* 1. DOMAIN AUTHORITY (DA) CARD */}
          <div 
            id="card-metric-domain-authority"
            className={`bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
              selectedAxisKey === "domainAuthority"
                ? "border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelectedAxisKey("domainAuthority")}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Alan Adı Otoritesi (Domain Authority)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kök alan adı güveni ve dofollow backlink profili
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Ağırlık: %40
              </span>
            </div>

            {/* Score Comparison Bars */}
            <div className="space-y-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {/* User */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Siteniz
                </span>
                <span className="font-black text-slate-900 font-mono">
                  {userEntity.metrics.domainAuthority} / 100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${userEntity.metrics.domainAuthority}%` }}
                />
              </div>

              {/* Competitors summary */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 border-t border-slate-200/80 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">1. Rakip (Lider)</span>
                  <strong className="text-amber-600 font-mono font-black">{comp1.metrics.domainAuthority} DA</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">2. Rakip</span>
                  <strong className="text-rose-600 font-mono font-black">{comp2.metrics.domainAuthority} DA</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">3. Rakip</span>
                  <strong className="text-purple-600 font-mono font-black">{comp3.metrics.domainAuthority} DA</strong>
                </div>
              </div>
            </div>

            {/* Strategic Gap Verdict */}
            <div className="mt-3 text-xs text-slate-600 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Stratejik Değerlendirme:</strong> 1. Rakip köklü alan adı yaşıyla liderliği elinde tutuyor. Yerel oda kayıtları, sektörel dizinler ve dijital PR ile DA puanınızı +15 artırarak 1. sırayı yakalayabilirsiniz.
              </div>
            </div>
          </div>

          {/* 2. KEYWORD DENSITY CARD */}
          <div 
            id="card-metric-keyword-density"
            className={`bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
              selectedAxisKey === "keywordDensity"
                ? "border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelectedAxisKey("keywordDensity")}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Anahtar Kelime Yoğunluğu &amp; Semantik Uyum
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hedef terim frekansı, LSI varyasyonları ve başlık uyumu
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Ağırlık: %35
              </span>
            </div>

            {/* Score Comparison Bars */}
            <div className="space-y-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Siteniz
                </span>
                <span className="font-black text-slate-900 font-mono">
                  {userEntity.metrics.keywordDensity} / 100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${userEntity.metrics.keywordDensity}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 border-t border-slate-200/80 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">1. Rakip</span>
                  <strong className="text-amber-600 font-mono font-black">{comp1.metrics.keywordDensity} Puan</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">2. Rakip</span>
                  <strong className="text-rose-600 font-mono font-black">{comp2.metrics.keywordDensity} Puan</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">3. Rakip</span>
                  <strong className="text-purple-600 font-mono font-black">{comp3.metrics.keywordDensity} Puan</strong>
                </div>
              </div>
            </div>

            {/* Strategic Gap Verdict */}
            <div className="mt-3 text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Stratejik Değerlendirme:</strong> Siteniz 2. ve 3. rakipleri geride bırakmış durumda. İdeal %1.8 anahtar kelime yoğunluğunu koruyarak 1. rakibin hedeflediği uzun kuyruklu aramalara (fiyatlar, rehberler) odaklanın.
              </div>
            </div>
          </div>

          {/* 3. SITE SPEED CARD (USER WINS BIG HERE) */}
          <div 
            id="card-metric-site-speed"
            className={`bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
              selectedAxisKey === "siteSpeed"
                ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelectedAxisKey("siteSpeed")}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Site Hızı &amp; Core Web Vitals
                    </h4>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                      Lidersiniz!
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Google PageSpeed LCP, INP, TTFB ve Edge CDN performansı
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Ağırlık: %25
              </span>
            </div>

            {/* Score Comparison Bars */}
            <div className="space-y-2 mt-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Siteniz (En Hızlısı)
                </span>
                <span className="font-black text-emerald-950 font-mono">
                  {userEntity.metrics.siteSpeed} / 100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${userEntity.metrics.siteSpeed}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 border-t border-emerald-100 mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">1. Rakip (Zayıf)</span>
                  <strong className="text-rose-600 font-mono font-black">{comp1.metrics.siteSpeed} Hız</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">2. Rakip</span>
                  <strong className="text-slate-700 font-mono font-black">{comp2.metrics.siteSpeed} Hız</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">3. Rakip</span>
                  <strong className="text-slate-700 font-mono font-black">{comp3.metrics.siteSpeed} Hız</strong>
                </div>
              </div>
            </div>

            {/* Strategic Opportunity */}
            <div className="mt-3 text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200/60 flex items-start gap-2">
              <Flame className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black">Büyük Rekabet Avantajı:</strong> 1. sıradaki rakip ağır CMS altyapısı yüzünden 64 hız puanında takılı kalmışken, siteniz 96 puanla anında açılıyor. Google'ın mobil öncelikli sıralama güncellemelerinde bu hız farkı tıklama başına dönüşümünüzü %40+ artırır.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Strategy Roadmap (Somut Stratejik Eylem Planı) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Kişiselleştirilmiş SEO Rekabet Eylem Planı
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Radar analizindeki farklara göre yapay zeka tarafından türetilen somut büyüme adımları
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {tacticalActions.length} Stratejik Aksiyon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tacticalActions.map((action, idx) => {
            const isSpeed = action.metricKey === "siteSpeed";
            const isDensity = action.metricKey === "keywordDensity";

            return (
              <div
                key={action.id}
                className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-indigo-100 text-indigo-900">
                      {action.priority} Öncelik
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {action.impactScore}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {action.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {action.strategySummary}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Uygulama Adımları:
                    </span>
                    {action.actionSteps.map((step, sIdx) => (
                      <div key={sIdx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {action.targetTab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab(action.targetTab!);
                    }}
                    className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{action.quickActionLabel || "Aracı Başlat"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 Competitor Dossiers (Rakip Profilleri & Zafiyetleri) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Top 3 Rakip Profili &amp; Kullanılabilir Zafiyetler
              </h3>
              <p className="text-xs text-slate-400">
                Rakiplerin güçlü taraflarını nötralize edip zayıf noktalarından pazar payı çalma stratejisi
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ backgroundColor: comp.color }}
                    >
                      {comp.rank}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {comp.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">{comp.domain}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                    {comp.marketShare}
                  </span>
                </div>

                {/* Metrics badge row */}
                <div className="grid grid-cols-3 gap-1.5 my-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">DA</span>
                    <span className="text-xs font-black text-white">{comp.metrics.domainAuthority}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Kelime</span>
                    <span className="text-xs font-black text-white">{comp.metrics.keywordDensity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Hız</span>
                    <span className={`text-xs font-black ${comp.metrics.siteSpeed < 70 ? "text-rose-400" : "text-emerald-400"}`}>
                      {comp.metrics.siteSpeed}
                    </span>
                  </div>
                </div>

                {/* Exploit Vulnerabilities */}
                <div className="space-y-2 mt-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Güçlü Yönleri:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 mt-1">
                      {comp.keyStrengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Zayıf Noktası (Kullanın):
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 mt-1">
                      {comp.vulnerabilities.map((v, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">→</span>
                          <span className="text-rose-200">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tahmini Trafik:</span>
                <span className="font-bold text-white font-mono">{comp.estimatedMonthlyTraffic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
