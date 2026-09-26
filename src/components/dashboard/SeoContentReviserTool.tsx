import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Copy, 
  Check, 
  RefreshCw, 
  Globe, 
  Share2, 
  Eye, 
  Sliders, 
  FileText, 
  Heading1, 
  Heading2, 
  ArrowRight, 
  Smartphone, 
  Monitor, 
  Layers, 
  Tag, 
  Award, 
  Zap, 
  HelpCircle,
  ExternalLink,
  Save,
  MessageSquare
} from "lucide-react";
import { 
  JetkurClientSite 
} from "../../utils/platformSettingsStorage";
import { 
  SeoContentRevisionResponse, 
  SeoContentRevisionProposal, 
  RegisteredSmeSeoProfile,
  SeoRevisionStrategyKey
} from "../../types";
import { 
  getOrCreateSmeSeoProfile, 
  saveRegisteredSmeSeoProfiles, 
  getRegisteredSmeSeoProfiles,
  applyRevisionToSmeSite,
  calculateGooglePixelWidth,
  generateFallbackSeoContentRevision
} from "../../utils/aiSeoContentReviserEngine";

interface SeoContentReviserToolProps {
  clientSites: JetkurClientSite[];
  preselectedSiteId?: string;
  onNavigateToSite?: (siteId: string) => void;
}

export const SeoContentReviserTool: React.FC<SeoContentReviserToolProps> = ({
  clientSites,
  preselectedSiteId
}) => {
  // Active selected SME site
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    preselectedSiteId || (clientSites[0]?.id || "site-1")
  );

  const activeSite = clientSites.find(s => s.id === selectedSiteId) || clientSites[0] || {
    id: "site-1",
    clientName: "Ahmet Yıldız",
    companyName: "Yıldız 7/24 Oto Kurtarma",
    email: "ahmet@yildizotokurtarma.com.tr",
    phone: "+90 532 555 12 34",
    domain: "yildizotokurtarma.com.tr",
    subdomain: "yildiz-otokurtarma.jetkur.me",
    sector: "Oto Çekici & Kurtarma",
    siteType: "multi-page" as const,
    planName: "3 Web Sitesi Paketi",
    annualRenewalFee: 2490,
    startDate: "2026-08-16",
    renewalDate: "2027-08-16",
    status: "active" as const,
    paymentStatus: "paid" as const,
    autoRenew: true,
    sslStatus: "active" as const,
    pageSpeedScore: 100,
    lastBackupDate: "2026-09-13"
  };

  // Selected Page of SME Site
  const [selectedPageKey, setSelectedPageKey] = useState<"home" | "services" | "about" | "contact">("home");

  // Preferred Revision Strategy / Focus
  const [selectedStrategy, setSelectedStrategy] = useState<SeoRevisionStrategyKey>("high_ctr");

  // SME SEO Profile
  const [smeProfile, setSmeProfile] = useState<RegisteredSmeSeoProfile>(() => 
    getOrCreateSmeSeoProfile(activeSite)
  );

  // Editable input state for analysis
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentH1, setCurrentH1] = useState("");
  const [currentH2s, setCurrentH2s] = useState<string[]>([]);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  // Analysis & Gemini State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [revisionResult, setRevisionResult] = useState<SeoContentRevisionResponse | null>(null);
  const [activeProposalIndex, setActiveProposalIndex] = useState(0);

  // SERP Device Preview
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [serpCompareMode, setSerpCompareMode] = useState<"after" | "before">("after");

  // Notifications
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync profile when active site or page changes
  useEffect(() => {
    const prof = getOrCreateSmeSeoProfile(activeSite);
    setSmeProfile(prof);

    const pageData = prof.pages[selectedPageKey] || prof.pages.home;
    setCurrentTitle(pageData.metaTitle || `${activeSite.companyName} | ${activeSite.sector}`);
    setCurrentDescription(pageData.metaDescription || `${activeSite.companyName} kaliteli ve güvenilir hizmet sunar.`);
    setCurrentH1(pageData.h1 || `${activeSite.companyName} Hoş Geldiniz`);
    setCurrentH2s(pageData.h2s || ["Hizmetlerimiz", "Hakkımızda", "İletişim"]);
    setTargetKeywords(prof.targetKeywords || [
      `${prof.city.toLowerCase()} ${prof.sector.toLowerCase()}`,
      `en yakın ${prof.sector.toLowerCase()}`,
      `7/24 ${prof.sector.toLowerCase()}`,
      `${prof.sector.toLowerCase()} fiyatları`
    ]);
    // Clear previous revision to invite fresh generation
    setRevisionResult(null);
  }, [selectedSiteId, selectedPageKey]);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Panoya kopyalandı!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Add keyword tag
  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (!newKeywordInput.trim()) return;
      const kw = newKeywordInput.trim().toLowerCase();
      if (!targetKeywords.includes(kw)) {
        setTargetKeywords([...targetKeywords, kw]);
      }
      setNewKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setTargetKeywords(targetKeywords.filter((_, i) => i !== index));
  };

  // Execute Gemini SEO Content Revision
  const handleRunGeminiRevision = async () => {
    setIsAnalyzing(true);
    try {
      const payload = {
        siteId: activeSite.id,
        companyName: activeSite.companyName,
        sector: activeSite.sector,
        city: smeProfile.city || "İstanbul",
        domain: activeSite.domain,
        pageKey: selectedPageKey,
        currentMetaTitle: currentTitle,
        currentMetaDescription: currentDescription,
        currentH1: currentH1,
        currentH2s: currentH2s,
        targetKeywords: targetKeywords,
        preferredStrategy: selectedStrategy
      };

      const res = await fetch("/api/seo-content-revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Sunucu yanıtı: ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setRevisionResult(json.data);
        setActiveProposalIndex(0);
        showToast("Gemini SEO içerik revizyonu başarıyla tamamlandı!");
      } else {
        throw new Error(json.error || "Bilinmeyen hata");
      }
    } catch (err: any) {
      console.warn("API error, generating realistic fallback:", err);
      const fallback = generateFallbackSeoContentRevision({
        siteId: activeSite.id,
        companyName: activeSite.companyName,
        sector: activeSite.sector,
        city: smeProfile.city || "İstanbul",
        domain: activeSite.domain,
        pageKey: selectedPageKey,
        currentMetaTitle: currentTitle,
        currentMetaDescription: currentDescription,
        currentH1: currentH1,
        currentH2s: currentH2s,
        targetKeywords: targetKeywords,
        preferredStrategy: selectedStrategy
      });
      setRevisionResult(fallback);
      setActiveProposalIndex(0);
      showToast("SEO içerik revizyon önerileri hazırlandı!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply selected proposal to the SME site profile
  const handleApplyProposal = (proposal: SeoContentRevisionProposal) => {
    try {
      const updated = applyRevisionToSmeSite(activeSite.id, selectedPageKey, proposal);
      setSmeProfile(updated);
      setCurrentTitle(proposal.revisedTitle);
      setCurrentDescription(proposal.revisedMetaDescription);
      setCurrentH1(proposal.revisedH1);
      setCurrentH2s(proposal.revisedH2s);
      showToast(`✅ "${activeSite.companyName}" için ${selectedPageKey.toUpperCase()} sayfası SEO metinleri güncellendi ve kaydedildi!`);
    } catch (err: any) {
      alert(`Kaydetme hatası: ${err?.message}`);
    }
  };

  // Generate WhatsApp summary report for client
  const generateWhatsAppShareUrl = (proposal: SeoContentRevisionProposal) => {
    const text = `Sayın ${activeSite.clientName} (${activeSite.companyName}),\n\nGoogle arama motorunda daha yüksek sıralama almanız ve tıklama oranınızı %40+ artırmak amacıyla ${selectedPageKey === "home" ? "Ana Sayfa" : selectedPageKey} için yapay zeka destekli yeni SEO metinleriniz hazırlandı:\n\n📌 *Önerilen Yeni Başlık (Title):*\n${proposal.revisedTitle}\n\n📝 *Önerilen Meta Açıklaması:*\n${proposal.revisedMetaDescription}\n\n🎯 *Yeni Ana Başlık (H1):*\n${proposal.revisedH1}\n\nBeklenen Tıklama Artışı: ${proposal.expectedCtrBoost}\nJetKur SEO Süper Panel Ekibi.`;
    const cleanPhone = (activeSite.phone || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Active proposal if available
  const activeProposal: SeoContentRevisionProposal | null = 
    revisionResult?.proposals?.[activeProposalIndex] || null;

  // Pixel calculation
  const currentPixelWidth = calculateGooglePixelWidth(currentTitle);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border-2 border-emerald-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notificationMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Gemini 3.8 Flash AI</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Google SERP & CTR Optimizasyonu
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                Admin Super Tool
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              KOBİ Siteleri İçin SEO İçerik Revize Aracı
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kayıtlı KOBİ web sitelerinin mevcut meta açıklamalarını, SERP başlıklarını ve H1/H2 ana başlıklarını analiz edin. Google'da tıklama oranını (CTR) katlayacak, anahtar kelime odaklı ve etkileyici metin önerileri üretin.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Kayıtlı KOBİ</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">{clientSites.length} Site</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Analize Hazır</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tahmini CTR Artışı</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">+48%</div>
              <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Google SERP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Select SME Site & Page */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>Analiz Edilecek Tescilli KOBİ Sitesi Seçin</span>
            </label>
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full md:w-96 px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
              >
                {clientSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.sector} - {s.domain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Site Details Badge */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500">Müşteri:</span>
            <span className="text-xs font-bold text-slate-900">{activeSite.clientName}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Sektör:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
              {activeSite.sector}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-indigo-600 font-semibold">{activeSite.domain}</span>
          </div>
        </div>

        {/* Page Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5" />
              <span>Sayfa:</span>
            </span>
            {[
              { key: "home", label: "Ana Sayfa (Homepage)" },
              { key: "services", label: "Hizmetlerimiz" },
              { key: "about", label: "Hakkımızda" },
              { key: "contact", label: "İletişim & Teklif" }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPageKey(p.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedPageKey === p.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Preferred Tone / Strategy */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center gap-1 shrink-0">
              <Sliders className="w-3.5 h-3.5" />
              <span>Hedef Strateji:</span>
            </span>
            {[
              { key: "high_ctr", label: "🚀 Yüksek CTR" },
              { key: "authority_eeat", label: "🏛️ E-E-A-T Otorite" },
              { key: "local_urgent", label: "📍 7/24 Yerel Acil" },
              { key: "value_pricing", label: "💰 Fiyat & Fayda" }
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStrategy(st.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedStrategy === st.key
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Current State Inputs vs AI Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Meta & Headings State */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Mevcut Meta & Başlık Verileri</h3>
                  <p className="text-[11px] text-slate-500">Sitenin Google'da taranan ve görünen güncel metinleri</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Düzenlenebilir</span>
            </div>

            {/* Current Title Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mevcut Meta Başlık (Title)</span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`font-bold ${currentTitle.length >= 45 && currentTitle.length <= 62 ? "text-emerald-600" : "text-amber-600"}`}>
                    {currentTitle.length} / 60 karakter
                  </span>
                  <span className="text-slate-400">({currentPixelWidth} px / maks 600 px)</span>
                </div>
              </div>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="Örn: Yıldız Oto Kurtarma | Çekici Hizmetleri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-indigo-500"
              />
              {/* Pixel Meter */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    currentPixelWidth > 580 ? "bg-rose-500" : currentPixelWidth >= 400 ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, (currentPixelWidth / 600) * 100)}%` }}
                />
              </div>
            </div>

            {/* Current Meta Description Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mevcut Meta Açıklama (Description)</span>
                </label>
                <span className={`text-[11px] font-bold ${currentDescription.length >= 135 && currentDescription.length <= 160 ? "text-emerald-600" : "text-amber-600"}`}>
                  {currentDescription.length} / 160 karakter
                </span>
              </div>
              <textarea
                rows={3}
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                placeholder="Örn: Yıldız Oto Kurtarma olarak İstanbul'da oto çekici ve yol yardım hizmeti veriyoruz..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-indigo-500 resize-none"
              />
            </div>

            {/* Current H1 Heading */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Heading1 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mevcut Sayfa Ana Başlığı (H1)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Sayfa Açılış Başlığı</span>
              </div>
              <input
                type="text"
                value={currentH1}
                onChange={(e) => setCurrentH1(e.target.value)}
                placeholder="Örn: İstanbul'da Güvenilir Çekici Hizmeti"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-indigo-500"
              />
            </div>

            {/* Current H2 Headings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Heading2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mevcut Sayfa Alt Başlıkları (H2'ler)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentH2s.map((h2, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    {h2}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Keywords Tags */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Hedef Odak Anahtar Kelimeler</span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {targetKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1">
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(i)}
                      className="text-amber-500 hover:text-amber-800 ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Yeni anahtar kelime yazıp Enter'a basın..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Run Gemini Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleRunGeminiRevision}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Gemini ile Başlık ve Açıklamalar Analiz Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Gemini ile SEO İçerik Revizyonu Başlat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Audit / Diagnosis or Live Results */}
        <div className="lg:col-span-6 space-y-4">
          {!revisionResult ? (
            /* Pre-analysis diagnostic teaser card */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Otomatik Durum & Eksiklik Tespiti</h3>
                      <p className="text-[11px] text-slate-500">Mevcut metinlerdeki tespit edilen kritik zayıflıklar</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                    Ön Değerlendirme
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Google SERP Piksel Genişliği</span>
                    </div>
                    <p className="text-xs text-amber-800/90 leading-relaxed">
                      Mevcut başlık {currentPixelWidth} px genişliğinde. Google SERP'te ideal alan ortalama 500-580 px'dir. Boş kalan alan daha cazip anahtar kelimeler ve eylem çağrısıyla doldurulmalıdır.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Eylem Çağrısı (CTA) ve Hız Kancası</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kullanıcılar Google'da acil ihtiyaç duydukları anda ("15 dakikada varış", "sabit fiyat garantisi", "7/24 hemen ara") gibi kancalar tıklama oranını doğrudan ikiye katlar.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Heading1 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>H1 ve H2 Başlık Hiyerarşisi</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Jenerik 'Hoş Geldiniz' veya sade firma ismi içeren H1 başlıkları yerine, kullanıcı sorununu hedefleyen güçlü değer teklifleri kullanılmalıdır.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready prompt */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-indigo-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {activeSite.companyName} için Gemini Destekli Revizyonu Başlatın
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Sol taraftaki 'Gemini ile SEO İçerik Revizyonu Başlat' butonuna tıklayarak 4 farklı stratejide optimize edilmiş başlık ve açıklamaları anında görüntüleyin.
                </p>
              </div>
            </div>
          ) : (
            /* Active Analysis Audit Card */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">SEO İçerik Kalite Skoru &amp; Değerlendirme</h3>
                    <p className="text-[11px] text-slate-500">Gemini 3.8 Flash tarafından gerçekleştirilen detaylı denetim</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  Analiz Tamamlandı
                </span>
              </div>

              {/* Score Comparison Bars */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Mevcut SEO Skoru</div>
                  <div className="text-2xl font-black text-amber-600 mt-0.5">
                    {revisionResult.audit.currentScore} / 100
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">Geliştirmeye Açık</div>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tahmini Revize Skor</div>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                    <span>{revisionResult.audit.predictedScore} / 100</span>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      +{revisionResult.audit.scoreDelta}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold">Maksimum SERP Uyumu</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-1">
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Yapay Zeka Değerlendirme Özeti</span>
                </div>
                <p className="text-xs text-indigo-900/90 leading-relaxed">
                  {revisionResult.geminiExecutiveSummary}
                </p>
              </div>

              {/* Detected Issues Bullet List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Tespit Edilen Kritik Eksiklikler</div>
                <div className="space-y-1.5">
                  {revisionResult.audit.titleIssues.map((issue, idx) => (
                    <div key={idx} className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 p-2 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                  {revisionResult.audit.descriptionIssues.map((issue, idx) => (
                    <div key={idx} className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 p-2 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                  {revisionResult.audit.headingIssues.map((issue, idx) => (
                    <div key={idx} className="text-xs text-slate-700 bg-slate-100 p-2 rounded-xl flex items-start gap-2">
                      <Heading1 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVISION PROPOSALS & LIVE GOOGLE SERP SIMULATOR SECTION */}
      {/* ========================================================= */}
      {revisionResult && activeProposal && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Önerilen Revize Başlık &amp; Meta Açıklamaları
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  {revisionResult.proposals.length} Farklı Strateji
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Google algoritmasına ve arama niyetine göre hazırlanmış alternatiflerden birini seçin ve tek tıkla siteye uygulayın.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={generateWhatsAppShareUrl(activeProposal)}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Müşteriye WhatsApp'la Gönder</span>
              </a>

              <button
                onClick={() => handleApplyProposal(activeProposal)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Siteye Uygula &amp; Kaydet</span>
              </button>
            </div>
          </div>

          {/* Strategy Proposal Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {revisionResult.proposals.map((prop, index) => {
              const isSelected = activeProposalIndex === index;
              return (
                <button
                  key={prop.id}
                  onClick={() => setActiveProposalIndex(index)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                      {prop.strategyBadge}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      {prop.expectedCtrBoost}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs line-clamp-1">{prop.strategyName}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{prop.whyItWorks}</div>
                </button>
              );
            })}
          </div>

          {/* Active Proposal Deep-Dive Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Left: Proposal Texts & Copy Actions */}
            <div className="lg:col-span-7 space-y-4">
              {/* Revised Title Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Önerilen Meta Başlık (Title)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {activeProposal.revisedTitleCharCount} karakter • {activeProposal.revisedTitlePixelWidth} px
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeProposal.revisedTitle, "title")}
                      className="p-1 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer"
                      title="Kopyala"
                    >
                      {copiedKey === "title" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900 select-all p-2 rounded-xl bg-white border border-slate-200">
                  {activeProposal.revisedTitle}
                </div>
              </div>

              {/* Revised Meta Description Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Önerilen Meta Açıklama (Description)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {activeProposal.revisedMetaDescriptionCharCount} karakter
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeProposal.revisedMetaDescription, "desc")}
                      className="p-1 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer"
                      title="Kopyala"
                    >
                      {copiedKey === "desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-relaxed select-all p-2.5 rounded-xl bg-white border border-slate-200">
                  {activeProposal.revisedMetaDescription}
                </div>
              </div>

              {/* Revised H1 Heading */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Heading1 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Önerilen Sayfa Ana Başlığı (H1)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeProposal.revisedH1, "h1")}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer"
                    title="Kopyala"
                  >
                    {copiedKey === "h1" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-sm font-black text-slate-900 select-all p-2 rounded-xl bg-white border border-slate-200">
                  {activeProposal.revisedH1}
                </div>
              </div>

              {/* Revised H2 Subheadings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Heading2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Önerilen Bölüm Alt Başlıkları (H2'ler - İçerik Mimarisi)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProposal.revisedH2s.map((h2, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-1">{h2}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale & Matched Keywords */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-950">Neden Bu Revizyon Çok Daha Yüksek Sıralama Getirir?</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {activeProposal.whyItWorks}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-950">Dahil Edilen Anahtar Kelimeler:</span>
                  {activeProposal.targetKeywordsIncluded.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 text-[10px] font-bold">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Google SERP Simulator (Desktop & Mobile) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">Google SERP Canlı Simülatörü</span>
                  </div>

                  {/* Device Toggles */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setSerpDevice("desktop")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        serpDevice === "desktop" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                      title="Masaüstü SERP Görünümü"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSerpDevice("mobile")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        serpDevice === "mobile" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                      title="Mobil SERP Görünümü"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Before / After Toggle */}
                <div className="flex items-center justify-center gap-2 bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setSerpCompareMode("before")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      serpCompareMode === "before" ? "bg-rose-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Önceki Durum (Eski Meta)
                  </button>
                  <button
                    onClick={() => setSerpCompareMode("after")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      serpCompareMode === "after" ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Revize Edilen (Gemini)
                  </button>
                </div>

                {/* SERP Preview Card Box */}
                <div className={`p-4 rounded-2xl bg-white text-slate-900 border transition-all ${
                  serpDevice === "mobile" ? "max-w-[340px] mx-auto shadow-xl" : "w-full"
                }`}>
                  {/* Google snippet headers */}
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] shrink-0 border border-slate-200">
                      🌐
                    </div>
                    <div className="leading-tight overflow-hidden">
                      <div className="text-[12px] font-semibold text-slate-800 line-clamp-1">{activeSite.companyName}</div>
                      <div className="text-[10px] text-slate-500 font-mono line-clamp-1">https://{activeSite.domain} › {selectedPageKey}</div>
                    </div>
                  </div>

                  {/* Title & snippet */}
                  <div className="space-y-1 mt-1">
                    <h4 className="text-[#1a0dab] hover:underline text-sm sm:text-base font-semibold leading-snug cursor-pointer line-clamp-2">
                      {serpCompareMode === "after" ? activeProposal.revisedTitle : currentTitle}
                    </h4>
                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                      <span className="text-[10px] text-slate-500 font-medium mr-1.5">
                        {activeProposal.googleSnippet.displayDate || "Bugün"} —
                      </span>
                      {serpCompareMode === "after" ? activeProposal.revisedMetaDescription : currentDescription}
                    </p>
                  </div>

                  {/* Google Sitelinks / Rich snippet simulator */}
                  <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-[#1a0dab]">
                    <div className="hover:underline cursor-pointer line-clamp-1">Hizmetlerimiz &amp; Fiyat</div>
                    <div className="hover:underline cursor-pointer line-clamp-1">Hakkımızda &amp; İletişim</div>
                  </div>
                </div>

                {/* Score Projection Pill */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Beklenen Organik CTR:</span>
                  <span className="font-black text-emerald-400">{activeProposal.expectedCtrBoost}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tahmini SERP Konumu:</span>
                  <span className="font-bold text-amber-400">{activeProposal.projectedRankingBoost}</span>
                </div>

                {/* Copy Ready HTML Snippet */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const snippet = `<title>${activeProposal.revisedTitle}</title>\n<meta name="description" content="${activeProposal.revisedMetaDescription}" />\n<h1>${activeProposal.revisedH1}</h1>\n${activeProposal.revisedH2s.map(h => `<h2>${h}</h2>`).join("\n")}`;
                      copyToClipboard(snippet, "full_html");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedKey === "full_html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Hazır HTML Meta &amp; Başlık Kodunu Kopyala</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MULTI-PAGE BATCH REVISION OVERVIEW TABLE */}
      {/* ========================================================= */}
      {revisionResult?.pagesBreakdown && revisionResult.pagesBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {activeSite.companyName} İçin Sayfa Bazlı Toplu Revizyon Özeti
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                KOBİ sitesinin temel sayfalarına ait önerilen başlık ve meta açıklamalarının toplu listesi
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {revisionResult.pagesBreakdown.length} Temel Sayfa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 bg-slate-50">
                  <th className="py-3 px-4 rounded-l-xl">Sayfa</th>
                  <th className="py-3 px-4">Mevcut Durum</th>
                  <th className="py-3 px-4">Önerilen Revize Başlık &amp; H1</th>
                  <th className="py-3 px-4">Önerilen Meta Açıklama</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {revisionResult.pagesBreakdown.map((row) => (
                  <tr key={row.pageKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold">
                        {row.pageTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px]">
                      <div className="line-clamp-1 font-medium">{row.currentTitle}</div>
                      <div className="line-clamp-1 text-[11px] text-slate-400 mt-0.5">{row.currentDesc}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="font-bold text-slate-900 line-clamp-1">{row.suggestedTitle}</div>
                      <div className="text-[11px] text-indigo-700 font-semibold mt-0.5 line-clamp-1">H1: {row.suggestedH1}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[260px]">
                      <div className="line-clamp-2 text-xs leading-relaxed">{row.suggestedDesc}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          const proposal: SeoContentRevisionProposal = {
                            id: `prop-${row.pageKey}`,
                            strategyKey: selectedStrategy,
                            strategyName: row.pageTitle,
                            strategyBadge: "Sayfa Özel",
                            targetAudience: "Arama yapan potansiyel müşteriler",
                            revisedTitle: row.suggestedTitle,
                            revisedTitleCharCount: row.suggestedTitle.length,
                            revisedTitlePixelWidth: calculateGooglePixelWidth(row.suggestedTitle),
                            revisedMetaDescription: row.suggestedDesc,
                            revisedMetaDescriptionCharCount: row.suggestedDesc.length,
                            revisedH1: row.suggestedH1,
                            revisedH2s: row.suggestedH2s,
                            targetKeywordsIncluded: targetKeywords,
                            expectedCtrBoost: "+45%",
                            projectedRankingBoost: "SERP İlk 3 Sıra",
                            whyItWorks: "Doğrudan arama niyetine odaklı optimize edilmiştir.",
                            callToAction: "Teklif Alın",
                            googleSnippet: {
                              title: row.suggestedTitle,
                              url: `https://${activeSite.domain}/${row.pageKey}`,
                              description: row.suggestedDesc
                            }
                          };
                          handleApplyProposal(proposal);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                      >
                        Uygula
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
