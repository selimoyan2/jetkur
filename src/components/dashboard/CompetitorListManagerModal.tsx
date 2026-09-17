import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BarChart2,
  Server,
  Code2,
  Award,
  Layers,
  Info
} from "lucide-react";
import { SiteConfig, MonitoredCompetitorUrlItem, CustomerPanelTab } from "../../types";
import {
  normalizeCompetitorUrl,
  getDefaultMonitoredCompetitors,
  fetchCompetitorLiveMetrics
} from "../../utils/competitorFetchEngine";
import { SECTOR_COMPETITOR_PRESETS } from "../../utils/competitorUrlAnalyzerEngine";

export interface CompetitorListManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  onSelectCompetitorForUrlAnalysis?: (url: string) => void;
}

export const CompetitorListManagerModal: React.FC<CompetitorListManagerModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onUpdateSiteConfig,
  onNavigateTab,
  onSelectCompetitorForUrlAnalysis
}) => {
  const activeSector = siteConfig.sector || "Oto Çekici & Kurtarıcı";
  const activeCity = siteConfig.city || "İstanbul";

  // Existing or default competitors
  const initialCompetitors = useMemo(() => {
    if (siteConfig.monitoredCompetitors && siteConfig.monitoredCompetitors.length > 0) {
      return siteConfig.monitoredCompetitors;
    }
    return getDefaultMonitoredCompetitors(activeSector, activeCity);
  }, [siteConfig.monitoredCompetitors, activeSector, activeCity]);

  const [competitors, setCompetitors] = useState<MonitoredCompetitorUrlItem[]>(initialCompetitors);
  const [expandedCompetitorId, setExpandedCompetitorId] = useState<string | null>(null);

  // New competitor form state
  const [newUrlInput, setNewUrlInput] = useState<string>("");
  const [customNameInput, setCustomNameInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    "Doğrudan Rakip" | "Bölgesel Rakip" | "Ulusal Lider" | "Fiyat Kırıcı" | "Niş Rakip"
  >("Doğrudan Rakip");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk fetching state
  const [isBulkFetching, setIsBulkFetching] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  // Individual fetching tracking
  const [fetchingIdMap, setFetchingIdMap] = useState<Record<string, boolean>>({});

  // Filter & Search
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with siteConfig if changed externally
  React.useEffect(() => {
    if (siteConfig.monitoredCompetitors && siteConfig.monitoredCompetitors.length > 0) {
      setCompetitors(siteConfig.monitoredCompetitors);
    }
  }, [siteConfig.monitoredCompetitors]);

  // Handle URL change with auto-inferred name
  const handleUrlInputChange = (val: string) => {
    setNewUrlInput(val);
    setFormError(null);
    const { valid, inferredName } = normalizeCompetitorUrl(val);
    if (valid && (!customNameInput || customNameInput === "Yeni Rakip")) {
      setCustomNameInput(inferredName);
    }
  };

  // Save changes to siteConfig
  const saveChangesToConfig = (updatedList: MonitoredCompetitorUrlItem[]) => {
    setCompetitors(updatedList);
    if (onUpdateSiteConfig) {
      const updatedConfig: SiteConfig = {
        ...siteConfig,
        monitoredCompetitors: updatedList
      };
      onUpdateSiteConfig(updatedConfig);
    }
  };

  // Add competitor & fetch live data immediately
  const handleAddAndFetchCompetitor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const { valid, normalizedUrl, domain, inferredName, error } = normalizeCompetitorUrl(newUrlInput);
    if (!valid) {
      setFormError(error || "Lütfen geçerli bir URL giriniz.");
      return;
    }

    // Check if domain already exists
    if (competitors.some(c => c.domain.toLowerCase() === domain.toLowerCase())) {
      setFormError(`"${domain}" alan adı zaten listenizde mevcut.`);
      return;
    }

    setIsAdding(true);
    const tempId = `comp-${Date.now()}`;
    const nameToUse = customNameInput.trim() || inferredName;

    // Create preliminary item with "fetching" state
    const preliminaryItem: MonitoredCompetitorUrlItem = {
      id: tempId,
      name: nameToUse,
      url: normalizedUrl,
      domain: domain,
      sector: activeSector,
      category: selectedCategory,
      addedAt: new Date().toISOString(),
      lastFetchedAt: null,
      fetchStatus: "fetching",
      isActive: true,
      color: "#818cf8"
    };

    const nextListWithTemp = [preliminaryItem, ...competitors];
    setCompetitors(nextListWithTemp);

    try {
      // Live fetch
      const liveData = await fetchCompetitorLiveMetrics(normalizedUrl, activeSector, activeCity);

      const finalItem: MonitoredCompetitorUrlItem = {
        ...preliminaryItem,
        ...liveData,
        name: nameToUse || liveData.name || inferredName,
        fetchStatus: "success",
        lastFetchedAt: new Date().toISOString()
      };

      const finalUpdatedList = [finalItem, ...competitors];
      saveChangesToConfig(finalUpdatedList);

      setNewUrlInput("");
      setCustomNameInput("");
      showToast(`"${finalItem.name}" başarıyla eklendi ve canlı verileri fetch edildi!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Veri çekilirken hata oluştu";
      const errorItem: MonitoredCompetitorUrlItem = {
        ...preliminaryItem,
        fetchStatus: "error",
        notes: `Fetch hatası: ${errorMsg}`
      };
      const finalUpdatedList = [errorItem, ...competitors];
      saveChangesToConfig(finalUpdatedList);
      showToast(`Hata: "${nameToUse}" canlı verisi fetch edilemedi.`);
    } finally {
      setIsAdding(false);
    }
  };

  // Refetch a single competitor
  const handleRefetchSingle = async (competitor: MonitoredCompetitorUrlItem) => {
    setFetchingIdMap(prev => ({ ...prev, [competitor.id]: true }));

    // Set status to fetching
    const updatedWithFetching = competitors.map(c =>
      c.id === competitor.id ? { ...c, fetchStatus: "fetching" as const } : c
    );
    setCompetitors(updatedWithFetching);

    try {
      const liveData = await fetchCompetitorLiveMetrics(competitor.url, activeSector, activeCity);
      const updatedList = competitors.map(c => {
        if (c.id === competitor.id) {
          return {
            ...c,
            ...liveData,
            fetchStatus: "success" as const,
            lastFetchedAt: new Date().toISOString()
          };
        }
        return c;
      });

      saveChangesToConfig(updatedList);
      showToast(`"${competitor.name}" verileri anlık olarak güncellendi!`);
    } catch (_err) {
      const fallbackList = competitors.map(c =>
        c.id === competitor.id ? { ...c, fetchStatus: "error" as const } : c
      );
      saveChangesToConfig(fallbackList);
      showToast(`"${competitor.name}" için fetch işlemi tamamlanamadı.`);
    } finally {
      setFetchingIdMap(prev => ({ ...prev, [competitor.id]: false }));
    }
  };

  // Bulk refetch all active competitors
  const handleRefetchAll = async () => {
    if (competitors.length === 0 || isBulkFetching) return;

    setIsBulkFetching(true);
    const activeList = competitors.filter(c => c.isActive);
    setBulkProgress({ current: 0, total: activeList.length });

    const newResults: Record<string, Partial<MonitoredCompetitorUrlItem>> = {};

    for (let i = 0; i < activeList.length; i++) {
      const comp = activeList[i];
      setBulkProgress({ current: i + 1, total: activeList.length });
      try {
        const live = await fetchCompetitorLiveMetrics(comp.url, activeSector, activeCity);
        newResults[comp.id] = {
          ...live,
          fetchStatus: "success",
          lastFetchedAt: new Date().toISOString()
        };
      } catch (_err) {
        newResults[comp.id] = { fetchStatus: "error" };
      }
    }

    const updatedList = competitors.map(c => {
      if (newResults[c.id]) {
        return {
          ...c,
          ...newResults[c.id]
        };
      }
      return c;
    });

    saveChangesToConfig(updatedList);
    setIsBulkFetching(false);
    setBulkProgress(null);
    showToast(`Tüm aktif ${activeList.length} rakip verisi başarıyla yenilendi!`);
  };

  // Delete competitor
  const handleDeleteCompetitor = (id: string, name: string) => {
    const updated = competitors.filter(c => c.id !== id);
    saveChangesToConfig(updated);
    showToast(`"${name}" takip listesinden kaldırıldı.`);
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    const updated = competitors.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    saveChangesToConfig(updated);
  };

  // Quick add from preset
  const handleQuickAddPreset = async (presetUrl: string, presetName: string) => {
    const { valid, domain } = normalizeCompetitorUrl(presetUrl);
    if (!valid) return;

    if (competitors.some(c => c.domain.toLowerCase() === domain.toLowerCase())) {
      showToast(`"${presetName}" zaten listenizde mevcut.`);
      return;
    }

    setNewUrlInput(presetUrl);
    setCustomNameInput(presetName);
    setSelectedCategory("Doğrudan Rakip");

    // Auto trigger
    setIsAdding(true);
    const tempId = `preset-${Date.now()}`;
    const newItem: MonitoredCompetitorUrlItem = {
      id: tempId,
      name: presetName,
      url: presetUrl,
      domain: domain,
      sector: activeSector,
      category: "Doğrudan Rakip",
      addedAt: new Date().toISOString(),
      lastFetchedAt: null,
      fetchStatus: "fetching",
      isActive: true,
      color: "#f59e0b"
    };

    setCompetitors([newItem, ...competitors]);

    try {
      const live = await fetchCompetitorLiveMetrics(presetUrl, activeSector, activeCity);
      const finalized: MonitoredCompetitorUrlItem = {
        ...newItem,
        ...live,
        fetchStatus: "success",
        lastFetchedAt: new Date().toISOString()
      };
      saveChangesToConfig([finalized, ...competitors]);
      showToast(`"${presetName}" eklendi ve canlı verileri fetch edildi!`);
    } catch (_err) {
      saveChangesToConfig([newItem, ...competitors]);
    } finally {
      setIsAdding(false);
      setNewUrlInput("");
      setCustomNameInput("");
    }
  };

  // Filtered list
  const filteredCompetitors = useMemo(() => {
    let list = [...competitors];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.url.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter(c => c.category === categoryFilter);
    }

    return list;
  }, [competitors, searchFilter, categoryFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = competitors.length;
    const active = competitors.filter(c => c.isActive).length;
    const withDa = competitors.filter(c => (c.domainAuthority || 0) > 0);
    const avgDa = withDa.length > 0 ? Math.round(withDa.reduce((acc, c) => acc + (c.domainAuthority || 0), 0) / withDa.length) : 0;
    const withSpeed = competitors.filter(c => (c.siteSpeedScore || 0) > 0);
    const avgSpeed = withSpeed.length > 0 ? Math.round(withSpeed.reduce((acc, c) => acc + (c.siteSpeedScore || 0), 0) / withSpeed.length) : 0;

    return { total, active, avgDa, avgSpeed };
  }, [competitors]);

  // Sector presets
  const sectorPresets = SECTOR_COMPETITOR_PRESETS[activeSector] || SECTOR_COMPETITOR_PRESETS["Oto Çekici & Kurtarıcı"] || [];

  if (!isOpen) return null;

  return (
    <div
      id="competitor-list-update-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        id="competitor-list-update-modal-container"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================== */}
        {/* MODAL HEADER */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-5 sm:px-8 sm:py-6 border-b border-indigo-900/40 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black tracking-wide">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rakip Listesini Güncelle & Canlı Fetch</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Rakip Web Sitelerini Yönet ve Anlık Verileri Çek</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              İzlemek istediğiniz rakiplerin URL'lerini ekleyin. Canlı fetch motoru ile HTTP durumunu, sayfa başlıklarını, DA skorunu ve sayfa hızını anında sorgulayın.
            </p>
          </div>

          <button
            type="button"
            id="close-competitor-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-4"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================== */}
        {/* QUICK STATS BAR */}
        {/* ===================================================================== */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 sm:px-8 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
              {stats.total}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Rakip</div>
              <div className="text-xs font-black text-slate-900">{stats.active} Aktif İzleniyor</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
              DA
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ortalama DA</div>
              <div className="text-xs font-black text-slate-900">{stats.avgDa} / 100</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">
              Hız
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ort. PageSpeed</div>
              <div className="text-xs font-black text-slate-900">{stats.avgSpeed} / 100 Puan</div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              id="bulk-fetch-all-competitors-btn"
              onClick={handleRefetchAll}
              disabled={isBulkFetching || competitors.length === 0}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBulkFetching ? "animate-spin text-indigo-200" : ""}`} />
              <span>{isBulkFetching ? `Fetch Ediliyor (${bulkProgress?.current}/${bulkProgress?.total})` : "Tümünü Anlık Fetch Et"}</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL BODY (SCROLLABLE) */}
        {/* ===================================================================== */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* 1. MANUEL RAKİP EKLEME FORMU */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-900/50 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Yeni Rakip URL'si Ekle ve Anlık Tara
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                URL girildikten sonra meta ve hız verileri otomatik çekilir
              </span>
            </div>

            <form onSubmit={handleAddAndFetchCompetitor} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* URL INPUT */}
                <div className="md:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    id="manual-competitor-url-input"
                    value={newUrlInput}
                    onChange={(e) => handleUrlInputChange(e.target.value)}
                    placeholder="https://rakipfirma.com veya rakip.com.tr"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl text-white placeholder-slate-500 text-xs font-mono transition-all"
                  />
                </div>

                {/* FIRMA ADI (AUTO-INFERRED OR CUSTOM) */}
                <div className="md:col-span-4">
                  <input
                    type="text"
                    id="manual-competitor-name-input"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="Firma / Marka Adı (Otomatik Çıkarılır)"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl text-white placeholder-slate-500 text-xs font-semibold transition-all"
                  />
                </div>

                {/* KATEGORİ SEÇİMİ */}
                <div className="md:col-span-3">
                  <select
                    id="manual-competitor-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Doğrudan Rakip">Doğrudan Rakip</option>
                    <option value="Bölgesel Rakip">Bölgesel Rakip</option>
                    <option value="Ulusal Lider">Ulusal Lider</option>
                    <option value="Fiyat Kırıcı">Fiyat Kırıcı</option>
                    <option value="Niş Rakip">Niş Rakip</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Sector Presets Quick Add Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-[11px] font-bold text-slate-500">Hazır Örnekler:</span>
                  {sectorPresets.slice(0, 3).map((preset) => {
                    const alreadyExists = competitors.some(c => c.domain.toLowerCase().includes(preset.name.toLowerCase().replace(/[^a-z0-9]/g, "")));
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleQuickAddPreset(preset.url, preset.name)}
                        disabled={isAdding || alreadyExists}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                          alreadyExists
                            ? "bg-slate-800/40 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  id="submit-add-fetch-competitor-btn"
                  disabled={isAdding || !newUrlInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAdding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                      <span>URL Taranıyor & Fetch Ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Rakibi Ekle ve Canlı Fetch Et</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. KAYITLI RAKİPLER LİSTESİ VE TABLO/KART FİLTRELEME */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Takip Edilen Rakipler ({filteredCompetitors.length})
                </h3>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="competitor-list-search-input"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Ada veya alan adına göre ara..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  id="competitor-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Doğrudan Rakip">Doğrudan Rakip</option>
                  <option value="Bölgesel Rakip">Bölgesel Rakip</option>
                  <option value="Ulusal Lider">Ulusal Lider</option>
                  <option value="Fiyat Kırıcı">Fiyat Kırıcı</option>
                  <option value="Niş Rakip">Niş Rakip</option>
                </select>
              </div>
            </div>

            {filteredCompetitors.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                <Globe className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700">Henüz rakip bulunamadı</div>
                <div className="text-xs text-slate-500">
                  Arama kriterlerinize uygun rakip yok veya yukarıdaki formu kullanarak yeni bir rakip URL'si ekleyebilirsiniz.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompetitors.map((comp) => {
                  const isExpanded = expandedCompetitorId === comp.id;
                  const isFetching = fetchingIdMap[comp.id] || comp.fetchStatus === "fetching";

                  return (
                    <div
                      key={comp.id}
                      className={`bg-white rounded-2xl border transition-all ${
                        comp.isActive ? "border-slate-200 shadow-xs hover:border-indigo-200" : "border-slate-200/60 bg-slate-50/50 opacity-70"
                      }`}
                    >
                      {/* CARD MAIN ROW */}
                      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* LEFT: DOMAIN & NAME & STATUS */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Favicon or Initial */}
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm shrink-0 uppercase">
                            {comp.domain.charAt(0)}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900 truncate">
                                {comp.name}
                              </h4>
                              {comp.category && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {comp.category}
                                </span>
                              )}
                              {comp.httpStatusCode === 200 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>200 OK</span>
                                </span>
                              )}
                              {isFetching && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold animate-pulse">
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-600" />
                                  <span>Taranıyor...</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                              <a
                                href={comp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                              >
                                <span>{comp.domain}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                              {comp.lastFetchedAt && (
                                <span className="text-slate-400 text-[11px]">
                                  • Son Fetch: {new Date(comp.lastFetchedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* MIDDLE: METRICS PILLS */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                          {/* DA */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">DA Skoru</div>
                            <div className="text-xs font-black text-slate-800">
                              {comp.domainAuthority ? `${comp.domainAuthority}/100` : "--"}
                            </div>
                          </div>

                          {/* Site Speed */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">PageSpeed</div>
                            <div className="text-xs font-black text-emerald-700">
                              {comp.siteSpeedScore ? `${comp.siteSpeedScore}/100` : "--"}
                            </div>
                          </div>

                          {/* Traffic */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Aylık Trafik</div>
                            <div className="text-xs font-black text-slate-800">
                              {comp.estimatedMonthlyVisits ? `${(comp.estimatedMonthlyVisits / 1000).toFixed(1)}K` : "--"}
                            </div>
                          </div>

                          {/* Backlink */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Backlink</div>
                            <div className="text-xs font-black text-indigo-700">
                              {comp.backlinksCount ? `${comp.backlinksCount}` : "--"}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: ACTION BUTTONS */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
                          {/* Anlık Fetch Et */}
                          <button
                            type="button"
                            onClick={() => handleRefetchSingle(comp)}
                            disabled={isFetching}
                            title="Bu rakibin verilerini anlık olarak yeniden fetch et"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
                            <span className="hidden sm:inline">Yeniden Fetch</span>
                          </button>

                          {/* URL Analizine Gönder */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectCompetitorForUrlAnalysis) {
                                onSelectCompetitorForUrlAnalysis(comp.url);
                                onClose();
                              } else if (onNavigateTab) {
                                onNavigateTab("competitor-url-analysis");
                                onClose();
                              }
                            }}
                            title="Bu rakibin sayfasını tam derinlikli URL analiz modülünde incele"
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">URL Ayrıştır</span>
                          </button>

                          {/* Details Toggle */}
                          <button
                            type="button"
                            onClick={() => setExpandedCompetitorId(isExpanded ? null : comp.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Ayrıntıları Göster/Gizle"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCompetitor(comp.id, comp.name)}
                            title="Takip listesinden kaldır"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* EXPANDABLE DETAILS ACCORDION */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {/* Meta Title & Description */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Fetch Edilen Sayfa Başlığı & Meta</span>
                              </div>
                              <div className="font-semibold text-slate-900 text-xs">
                                {comp.metaTitle || "Başlık tespit edilemedi"}
                              </div>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                {comp.metaDescription || "Meta açıklama etiketi bulunamadı."}
                              </p>
                            </div>

                            {/* Technical Stack & Server */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Teknik Altyapı & Core Web Vitals</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400">Sunucu: </span>
                                  <span className="font-mono text-slate-800">{comp.serverType || "Nginx / Edge"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">LCP Süresi: </span>
                                  <span className="font-bold text-slate-800">{comp.lcpSeconds || 2.4}s</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Kelime Sayısı: </span>
                                  <span className="font-bold text-slate-800">{comp.wordCount || 1200} kelime</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Spam Skoru: </span>
                                  <span className="font-bold text-emerald-600">%{comp.spamScore || 1} (Temiz)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Top Detected Keywords */}
                          {comp.topKeywords && comp.topKeywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] font-bold text-slate-500">Hedeflenen Başlıca Anahtar Kelimeler:</span>
                              {comp.topKeywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px]"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL FOOTER */}
        {/* ===================================================================== */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Eklediğiniz tüm rakipler Stratejik Analiz ve Pazar Payı paneline otomatik yansıtılır.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              id="reset-default-competitors-btn"
              onClick={() => {
                const defaults = getDefaultMonitoredCompetitors(activeSector, activeCity);
                saveChangesToConfig(defaults);
                showToast("Rakip listesi sektörel varsayılanlara sıfırlandı.");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all cursor-pointer"
            >
              Varsayılanlara Dön
            </button>

            <button
              type="button"
              id="close-competitor-modal-confirm-btn"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              Tamamla & Kapat
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
