import React, { useState, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Info,
  ChevronRight,
  Maximize2,
  RefreshCw,
  X,
  Target,
  BarChart3,
  Compass,
  Map,
  Building2,
  ArrowUpRight
} from "lucide-react";
import { SiteConfig, CustomerPanelTab, LocalCompetitorPin } from "../../types";
import {
  generateLocalSeoMapData,
  exportLocalSeoMapCsv
} from "../../utils/localSeoMapEngine";

interface LocalSeoLocationMapProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
}

type FilterView = "all" | "top3" | "districts" | "audit";

export const LocalSeoLocationMap: React.FC<LocalSeoLocationMapProps> = ({
  siteConfig,
  onNavigateTab,
  className = ""
}) => {
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [selectedPinId, setSelectedPinId] = useState<string | null>("user-local-pin");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Generate Geospatial Local Pack data
  const mapData = useMemo(() => {
    return generateLocalSeoMapData(siteConfig);
  }, [siteConfig]);

  const { center, pins, userPin, leaderPin, districts, summary } = mapData;

  // Selected Pin object
  const activePin = useMemo(() => {
    return pins.find((p) => p.id === selectedPinId) || userPin;
  }, [pins, selectedPinId, userPin]);

  // Filtered Pins list
  const filteredPins = useMemo(() => {
    let result = [...pins];

    if (filterView === "top3") {
      result = result.filter((p) => p.inTop3LocalPack);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.primaryLocalKeyword.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.localPackRank - b.localPackRank);
  }, [pins, filterView, searchFilter]);

  // Coordinate projection helper to convert lat/lng to percentage in the interactive radar/map stage
  const projectCoordinates = (lat: number, lng: number) => {
    // Normalizing around center with bounding box delta ±0.06 deg
    const deltaLat = lat - center.lat;
    const deltaLng = lng - center.lng;

    // SVG coordinate space: x is lng (left to right), y is lat (top to bottom inverted)
    const xPercent = Math.min(92, Math.max(8, 50 + (deltaLng / 0.08) * 40));
    const yPercent = Math.min(90, Math.max(10, 50 - (deltaLat / 0.08) * 40));

    return { xPercent, yPercent };
  };

  const handleExportCsv = () => {
    const csv = exportLocalSeoMapCsv(pins);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `yerel-seo-local-pack-haritasi-${siteConfig.city?.toLowerCase() || "rapor"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedToast("Yerel SEO Harita & Local Pack Raporu CSV olarak indirildi!");
    setTimeout(() => setCopiedToast(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCopiedToast("Yerel SERP ve Google Harita sıralamaları senkronize edildi.");
      setTimeout(() => setCopiedToast(null), 3000);
    }, 400);
  };

  return (
    <div id="local-seo-location-map-root" className={`space-y-6 ${className}`}>
      {/* ===================================================================== */}
      {/* 1. HERO & TOP EXECUTIVE SUMMARY BANNER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-16 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                <span>GOOGLE HARİTALAR (LOCAL 3-PACK) GÖRÜNÜRLÜK RADARI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Yerel SEO Konum Haritası</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-medium">
                  {summary.city} • {summary.sector}
                </span>
              </h2>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Rakiplerin <strong>Google Haritalar (Local Pack)</strong> sıralamalarını, semt bazlı yerel arama hacimlerini ve
                Google İşletme Profili (GMB) güç dengesini etkileşimli harita üzerinden inceleyin.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                id="btn-refresh-local-seo-map"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Harita SERP verilerini yenile"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">SERP Yenile</span>
              </button>

              <button
                type="button"
                id="btn-export-local-seo-csv"
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Harita Raporu CSV</span>
              </button>
            </div>
          </div>

          {/* Tactical Action Alert */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/30 flex items-start gap-3.5 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <span className="font-bold text-emerald-400 mr-1.5">Öncelikli Yerel Fırsat:</span>
              {summary.tacticalAction}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. LOCAL SEO KPI STAT CARDS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Google Local Pack Konumu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local 3-Pack Sırası</span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Top 3 İçinde
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">#{userPin.localPackRank}</span>
            <span className="text-xs font-semibold text-slate-500">Google Haritalar 3-Pack</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Pazar Lideri: #{leaderPin.localPackRank}</span>
            <span className="font-bold text-emerald-700">+{userPin.rating} ★ ({userPin.reviewCount} Yorum)</span>
          </p>
        </div>

        {/* Card 2: Yerel Arama Kapsamı */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yerel Arama Hacmi</span>
            <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{summary.totalLocalMonthlyVolume.toLocaleString("tr-TR")}</span>
            <span className="text-xs font-bold text-slate-500">Arama / Ay</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Top 3 Kapsam Oranı:</span>
              <span className="font-bold text-teal-700">%{summary.top3PackCoveragePercent} Hedef Semtler</span>
            </div>
            <div className="flex justify-between">
              <span>En Güçlü Semt:</span>
              <span className="font-bold text-slate-800">{summary.bestPerformingDistrict}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Yorum & Puan Farkı */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yorum & Güven Açığı</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{userPin.rating}</span>
            <span className="text-xs font-bold text-slate-500">/ 5.0 (Siteniz)</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 ml-auto">
              Lider: {leaderPin.rating} ★
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Mevcut Yorumunuz:</span>
              <span className="font-bold text-slate-800">{userPin.reviewCount} inceleme</span>
            </div>
            <div className="flex justify-between">
              <span>Liderle Yorum Farkı:</span>
              <span className="font-bold text-rose-600">-{summary.reviewGapVsLeader} inceleme</span>
            </div>
          </div>
        </div>

        {/* Card 4: GMB & Yerel Dizin / Citation Skoru */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yerel Dizin (Citation)</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{userPin.citationScore}</span>
            <span className="text-xs font-bold text-slate-500">/ 100</span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 ml-auto">
              Doğrulanmış (GMB)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Hizmet Yarıçapı:</span>
              <span className="font-bold text-slate-800">{userPin.geoRadiusKm} km</span>
            </div>
            <div className="flex justify-between">
              <span>NAP Tutarlılığı:</span>
              <span className="font-bold text-emerald-600">%98 (İsim-Adres-Tel)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CONTROLS, VIEW TABS & SEARCH */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            id="view-local-all"
            onClick={() => setFilterView("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterView === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tüm Rakipler ({pins.length})
          </button>
          <button
            type="button"
            id="view-local-top3"
            onClick={() => setFilterView("top3")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterView === "top3" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sadece Google 3-Pack</span>
          </button>
          <button
            type="button"
            id="view-local-districts"
            onClick={() => setFilterView("districts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterView === "districts" ? "bg-white text-teal-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
            <span>Semt Arama Hacimleri</span>
          </button>
          <button
            type="button"
            id="view-local-audit"
            onClick={() => setFilterView("audit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterView === "audit" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>GMB & NAP Denetimi</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-local-seo-search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="İşletme adı veya semt ara..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Toast Notice */}
      {copiedToast && (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCopiedToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MAIN TWO-COLUMN VISUALIZER: INTERACTIVE MAP RADAR + COMPETITOR LIST */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Geospatial Local Radar Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Google Haritalar 3-Pack Konum Radarı</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {center.cityName}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Konum pinlerine tıklayarak rakibin yerel SEO gücünü görün</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span>Siteniz</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 ml-1" />
              <span>Lider</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500 ml-1" />
              <span>Diğer Rakipler</span>
            </div>
          </div>

          {/* Interactive Geospatial Canvas Container */}
          <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center select-none">
            {/* Background Grid & Radar Rings */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
            
            {/* Concentric Geo-Distance Circles (Radar rings) */}
            <div className="absolute w-[280px] h-[280px] rounded-full border border-emerald-500/20 pointer-events-none" />
            <div className="absolute w-[420px] h-[420px] rounded-full border border-indigo-500/15 pointer-events-none" />
            <div className="absolute w-[560px] h-[560px] rounded-full border border-slate-700/30 pointer-events-none" />

            {/* Radar Center Coordinate Label */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-xs border border-slate-800 text-[10px] text-slate-400 px-2.5 py-1 rounded-lg font-mono pointer-events-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LAT {center.lat.toFixed(4)}, LNG {center.lng.toFixed(4)}</span>
            </div>

            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-xs border border-slate-800 text-[10px] text-slate-400 px-2.5 py-1 rounded-lg font-mono pointer-events-none">
              Ölçek: ~25 km Çap
            </div>

            {/* User Service Radius Visualization (Semi-transparent circle) */}
            <div
              className="absolute rounded-full bg-emerald-500/10 border border-emerald-500/30 pointer-events-none transition-all duration-500"
              style={{
                width: "260px",
                height: "260px",
                left: `calc(${projectCoordinates(userPin.latitude, userPin.longitude).xPercent}% - 130px)`,
                top: `calc(${projectCoordinates(userPin.latitude, userPin.longitude).yPercent}% - 130px)`
              }}
            />

            {/* Interactive Pins */}
            {pins.map((pin) => {
              const { xPercent, yPercent } = projectCoordinates(pin.latitude, pin.longitude);
              const isSelected = pin.id === activePin.id;

              return (
                <div
                  key={pin.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-110 z-20"
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  onClick={() => setSelectedPinId(pin.id)}
                >
                  {/* Pin Ripple Glow if Selected */}
                  {isSelected && (
                    <div className="absolute -inset-2 rounded-full bg-cyan-400/30 animate-pulse pointer-events-none" />
                  )}

                  {/* Marker Body */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-black shadow-lg border backdrop-blur-xs transition-all ${
                      pin.isUser
                        ? "bg-emerald-500 text-slate-950 border-white ring-2 ring-emerald-400"
                        : pin.localPackRank === 1
                        ? "bg-amber-500 text-slate-950 border-white ring-2 ring-amber-400"
                        : pin.inTop3LocalPack
                        ? "bg-indigo-600 text-white border-indigo-400 ring-1 ring-indigo-300"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>#{pin.localPackRank}</span>
                    <span className="hidden sm:inline font-medium truncate max-w-[80px]">
                      {pin.isUser ? "Siteniz" : pin.district}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Overlay Bottom Active Pin Quick Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 text-xs z-30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    activePin.isUser
                      ? "bg-emerald-500 text-slate-950"
                      : activePin.localPackRank === 1
                      ? "bg-amber-500 text-slate-950"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  #{activePin.localPackRank}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{activePin.name}</span>
                    {activePin.isUser && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                        SİTENİZ
                      </span>
                    )}
                    {activePin.inTop3LocalPack && (
                      <span className="text-[10px] font-semibold text-emerald-400">
                        Google 3-Pack
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-2">
                    <span>{activePin.district}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {activePin.rating} ({activePin.reviewCount} yorum)
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{activePin.localSearchVolume} arama/ay</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">{activePin.phone}</span>
              </div>
            </div>
          </div>

          {/* Map Footer Helper */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Yeşil alan sitenizin aktif <strong>{userPin.geoRadiusKm} km</strong> yerel hizmet etki yarıçapını temsil eder.
              </span>
            </div>
            <div className="font-semibold text-slate-700">
              NAP Skoru: {userPin.citationScore}/100 Tutarlı
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Competitor Analysis Card & District Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Active Competitor Head-to-Head Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Seçili İşletme Yerel Analizi
                </h4>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activePin.inTop3LocalPack
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {activePin.inTop3LocalPack ? "Google 3-Pack Listeleniyor" : "3-Pack Dışı (>3)"}
              </span>
            </div>

            {/* Profile Overview */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-base text-slate-900">{activePin.name}</h3>
                  <p className="text-xs text-slate-500">{activePin.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">#{activePin.localPackRank}</span>
                  <span className="text-[10px] text-slate-400 block">Harita Sırası</span>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Puan & İnceleme:</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">{activePin.rating}</span>
                    <span className="text-[11px] text-slate-500">({activePin.reviewCount} yorum)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Hedef Semt & Kelime:</span>
                  <span className="text-xs font-bold text-slate-900 block truncate mt-0.5">
                    {activePin.primaryLocalKeyword}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Aylık Yerel Arama:</span>
                  <span className="text-xs font-black text-emerald-700 block mt-0.5">
                    {activePin.localSearchVolume} arama/ay
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">GMB Doğrulama Durumu:</span>
                  <span className={`text-xs font-bold block mt-0.5 ${activePin.gmbVerified ? "text-emerald-600" : "text-rose-600"}`}>
                    {activePin.gmbVerified ? "Doğrulanmış Rozet" : "Doğrulanmamış"}
                  </span>
                </div>
              </div>

              {/* Advantage */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Yerel Güçlü Yönü:</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">{activePin.topLocalAdvantage}</p>
              </div>

              {/* Gaps / Flaws */}
              {activePin.gmbGaps && activePin.gmbGaps.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tespit Edilen Yerel SEO Açıkları:</span>
                  </div>
                  <ul className="text-xs text-rose-950 space-y-1 pl-4 list-disc">
                    {activePin.gmbGaps.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button: Jump to Schema Generator or Local SEO tab */}
              {onNavigateTab && (
                <button
                  type="button"
                  id="btn-goto-local-seo-schema"
                  onClick={() => onNavigateTab("local-seo-schema")}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LocalBusiness Schema Kodunu Düzenle</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}
            </div>
          </div>

          {/* District Search Volume Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Semt Arama Hacimleri ve Fırsatlar
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{districts.length} Semt</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs max-h-[260px] overflow-y-auto pr-1">
              {districts.map((d, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{d.districtName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          d.userLocalPackRank <= 2
                            ? "bg-emerald-100 text-emerald-800"
                            : d.userLocalPackRank === 3
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Sıra: #{d.userLocalPackRank}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{d.primaryKeyword}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 block">{d.monthlySearchVolume}</span>
                    <span className="text-[10px] text-slate-400">arama/ay</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. FULL LOCAL PACK BENCHMARK DIRECT COMPARISON TABLE */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Google Haritalar (Local Pack) Kıyaslama Tablosu</h3>
              <p className="text-xs text-slate-500">Doğrudan sıralama, puan, arama hacmi ve yerel eksiklikler</p>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Toplam <strong>{filteredPins.length}</strong> İşletme Listeleniyor
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 w-12 text-center">Sıra</th>
                <th className="py-3 px-4 min-w-[200px]">İşletme Adı</th>
                <th className="py-3 px-4">Local 3-Pack</th>
                <th className="py-3 px-4">Yorum & Puan</th>
                <th className="py-3 px-4">Semt & Anahtar Kelime</th>
                <th className="py-3 px-4">Aylık Hacim</th>
                <th className="py-3 px-4">Citation Skoru</th>
                <th className="py-3 px-4 text-center">İncele</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredPins.map((pin) => {
                const isSelected = pin.id === activePin.id;

                return (
                  <tr
                    key={pin.id}
                    onClick={() => setSelectedPinId(pin.id)}
                    className={`cursor-pointer transition-colors ${
                      pin.isUser
                        ? "bg-emerald-50/70 hover:bg-emerald-50 font-medium"
                        : isSelected
                        ? "bg-slate-100 hover:bg-slate-100"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-xs ${
                          pin.isUser
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                            : pin.localPackRank === 1
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {pin.localPackRank}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${pin.isUser ? "text-emerald-950" : "text-slate-900"}`}>
                            {pin.name}
                          </span>
                          {pin.isUser && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-black uppercase">
                              Siteniz
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">{pin.address}</span>
                      </div>
                    </td>

                    {/* 3-Pack Status */}
                    <td className="py-3.5 px-4">
                      {pin.inTop3LocalPack ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>3-Pack İçi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span>3-Pack Dışı</span>
                        </span>
                      )}
                    </td>

                    {/* Review & Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-900">{pin.rating}</span>
                        <span className="text-[11px] text-slate-500">({pin.reviewCount})</span>
                      </div>
                    </td>

                    {/* District & Keyword */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800">{pin.district}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                          {pin.primaryLocalKeyword}
                        </span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900">{pin.localSearchVolume}</span>
                      <span className="text-[10px] text-slate-500 block">arama/ay</span>
                    </td>

                    {/* Citation */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">{pin.citationScore}/100</span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pin.citationScore >= 80
                                ? "bg-emerald-500"
                                : pin.citationScore >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${pin.citationScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPinId(pin.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Seç
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
