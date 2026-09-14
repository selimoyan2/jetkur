import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  NewsletterSubscriber,
  NewsletterWelcomeEmailConfig,
  MarketingAutomationExecutionLog,
  MarketingAutomationConfig,
  NewsletterSourceAttribution,
  FormLead
} from "../../types";
import {
  DEFAULT_WELCOME_EMAIL_CONFIG,
  DEFAULT_MARKETING_AUTOMATION_CONFIG,
  KNOWN_NEWSLETTER_SOURCES,
  analyzeNewsletterSources,
  interpolateWelcomeEmailTemplate,
  generateSimulatedExecutionLog
} from "../../utils/marketingAutomationData";
import {
  Mail,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Plus,
  ArrowRight,
  Download,
  Eye,
  Settings,
  Tag,
  Gift,
  MousePointerClick,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  Layers,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Smartphone,
  Monitor,
  X
} from "lucide-react";

interface MarketingAutomationManagerProps {
  config: SiteConfig;
  onUpdateConfig: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  onSelectLeadForDetail?: (lead: FormLead) => void;
}

export const MarketingAutomationManager: React.FC<MarketingAutomationManagerProps> = ({
  config,
  onUpdateConfig,
  onNavigateTab,
  onSelectLeadForDetail
}) => {
  // Ensure marketingAutomation config exists
  const currentAutomationConfig: MarketingAutomationConfig = useMemo(() => {
    return config.marketingAutomation || DEFAULT_MARKETING_AUTOMATION_CONFIG;
  }, [config.marketingAutomation]);

  // Local state for welcome email configuration
  const [welcomeConfig, setWelcomeConfig] = useState<NewsletterWelcomeEmailConfig>(
    currentAutomationConfig.welcomeEmail || DEFAULT_WELCOME_EMAIL_CONFIG
  );

  // Local state for logs
  const [logs, setLogs] = useState<MarketingAutomationExecutionLog[]>(
    currentAutomationConfig.executionLogs || []
  );

  // Local state for subscribers (fallback to config.subscribers)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(
    config.subscribers || []
  );

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "source-analysis" | "welcome-workflow" | "subscribers-list" | "execution-logs"
  >("source-analysis");

  // Filter and Search states
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Preview Modal / Mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showTestSendModal, setShowTestSendModal] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>("test@example.com");
  const [testEmailName, setTestEmailName] = useState<string>("Ali Vural");
  const [testSendSuccessMessage, setTestSendSuccessMessage] = useState<string | null>(null);

  // Add new subscriber modal
  const [showAddSubModal, setShowAddSubModal] = useState<boolean>(false);
  const [newSubEmail, setNewSubEmail] = useState<string>("");
  const [newSubName, setNewSubName] = useState<string>("");
  const [newSubSource, setNewSubSource] = useState<string>("Ana Sayfa Teklif Formu");

  // Copied feedback state
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Analyze newsletter sources
  const sourceAttributions = useMemo(() => {
    return analyzeNewsletterSources(subscribers, config.leads || []);
  }, [subscribers, config.leads]);

  // Top source winner
  const topSource = useMemo(() => {
    return sourceAttributions.find((s) => s.isTopPerformer) || sourceAttributions[0];
  }, [sourceAttributions]);

  // Save changes to global config
  const handleSaveAutomationConfig = (
    newWelcomeConfig?: NewsletterWelcomeEmailConfig,
    newLogs?: MarketingAutomationExecutionLog[],
    newSubs?: NewsletterSubscriber[]
  ) => {
    const updatedWelcome = newWelcomeConfig || welcomeConfig;
    const updatedLogs = newLogs || logs;
    const updatedSubs = newSubs || subscribers;

    const updatedConfig: SiteConfig = {
      ...config,
      subscribers: updatedSubs,
      marketingAutomation: {
        ...currentAutomationConfig,
        welcomeEmail: updatedWelcome,
        executionLogs: updatedLogs
      }
    };

    onUpdateConfig(updatedConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Trigger test welcome email simulation
  const handleTriggerTestSend = () => {
    const tempSub: NewsletterSubscriber = {
      id: `sub-test-${Date.now()}`,
      email: testEmailAddress,
      name: testEmailName,
      subscribedAt: "Şimdi",
      status: "active",
      source: "Test Gönderimi (Panel)",
      tags: ["Test Gönderimi"],
      welcomeEmailSent: true,
      welcomeEmailSentAt: "Şimdi",
      welcomeEmailStatus: "delivered"
    };

    const newLog = generateSimulatedExecutionLog(
      tempSub,
      welcomeConfig,
      config.companyName || "Yıldız Oto Kurtarma"
    );

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    handleSaveAutomationConfig(welcomeConfig, updatedLogs);

    setTestSendSuccessMessage(
      `✅ Test hoş geldin e-postası '${testEmailAddress}' adresine simüle edilerek gönderildi ve otomasyon günlüğüne işlendi.`
    );
    setTimeout(() => {
      setTestSendSuccessMessage(null);
      setShowTestSendModal(false);
    }, 2000);
  };

  // Manually trigger welcome email for an existing subscriber
  const handleManualTriggerForSubscriber = (sub: NewsletterSubscriber) => {
    const newLog = generateSimulatedExecutionLog(
      sub,
      welcomeConfig,
      config.companyName || "Yıldız Oto Kurtarma"
    );

    const updatedSubs = subscribers.map((s) =>
      s.id === sub.id
        ? {
            ...s,
            welcomeEmailSent: true,
            welcomeEmailSentAt: "Şimdi",
            welcomeEmailStatus: "delivered" as const
          }
        : s
    );

    const updatedLogs = [newLog, ...logs];
    setSubscribers(updatedSubs);
    setLogs(updatedLogs);
    handleSaveAutomationConfig(welcomeConfig, updatedLogs, updatedSubs);
  };

  // Add new subscriber
  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail) return;

    const now = new Date();
    const dateStr = `${now.getDate()} Eylül 2026 ${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: newSubEmail.trim(),
      name: newSubName.trim() || undefined,
      subscribedAt: dateStr,
      status: "active",
      source: newSubSource,
      tags: ["Yeni Abone", "E-Bülten"],
      interactionCount: 1,
      welcomeEmailSent: welcomeConfig.enabled,
      welcomeEmailSentAt: welcomeConfig.enabled ? "Şimdi" : undefined,
      welcomeEmailStatus: welcomeConfig.enabled ? "delivered" : "pending",
      conversionStatus: "lead"
    };

    let updatedLogs = logs;
    if (welcomeConfig.enabled) {
      const autoLog = generateSimulatedExecutionLog(
        newSub,
        welcomeConfig,
        config.companyName || "Yıldız Oto Kurtarma"
      );
      updatedLogs = [autoLog, ...logs];
      setLogs(updatedLogs);
    }

    const updatedSubs = [newSub, ...subscribers];
    setSubscribers(updatedSubs);
    handleSaveAutomationConfig(welcomeConfig, updatedLogs, updatedSubs);

    setNewSubEmail("");
    setNewSubName("");
    setShowAddSubModal(false);
  };

  // Copy tag helper
  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Export Subscribers to CSV
  const handleExportSubscribersCSV = () => {
    const headers = [
      "E-Posta",
      "Ad Soyad",
      "Kayıt Kaynağı",
      "Kayıt Tarihi",
      "Durum",
      "Hoş Geldin E-Postası",
      "Dönüşüm Durumu",
      "Tahmini Değer (TL)"
    ];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name || ""}"`,
      `"${s.source || "Bilinmeyen"}"`,
      `"${s.subscribedAt}"`,
      `"${s.status}"`,
      `"${s.welcomeEmailStatus || "Gönderilmedi"}"`,
      `"${s.conversionStatus || "Aday"}"`,
      s.totalValue || 0
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `e-bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesSource = sourceFilter === "all" || s.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [subscribers, searchQuery, sourceFilter, statusFilter]);

  // Rendered preview content for welcome email
  const previewSubject = useMemo(() => {
    return interpolateWelcomeEmailTemplate(
      welcomeConfig.subject,
      { name: "Ahmet Yılmaz", email: "ahmet@ornek.com" },
      config.companyName || "Yıldız Oto Kurtarma",
      welcomeConfig.offerDiscountCode
    );
  }, [welcomeConfig.subject, welcomeConfig.offerDiscountCode, config.companyName]);

  const previewBody = useMemo(() => {
    return interpolateWelcomeEmailTemplate(
      welcomeConfig.bodyText,
      { name: "Ahmet Yılmaz", email: "ahmet@ornek.com" },
      config.companyName || "Yıldız Oto Kurtarma",
      welcomeConfig.offerDiscountCode
    );
  }, [welcomeConfig.bodyText, welcomeConfig.offerDiscountCode, config.companyName]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pazarlama Otomasyonu (Marketing Automation)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>NewsletterSubscriber Dönüşüm Atıfları</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>E-Bülten Kaynak Analizi &amp; Hoş Geldin Kurgusu</span>
          </h1>

          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
            Form ve bülten abone verilerini analiz ederek en yüksek dönüşüm getiren kaynakları
            keşfedin. Yeni kayıt olan her aboneye otomatik kişiselleştirilmiş hoş geldin serisi ve
            indirim kodu tanımlayın.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowTestSendModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Hoş Geldin Gönder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddSubModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Yeni Abone Ekle</span>
          </button>
        </div>
      </div>

      {/* SAVE TOAST NOTIFICATION */}
      {saveToast && (
        <div className="p-3 bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pazarlama otomasyonu ayarları başarıyla kaydedildi ve yürürlüğe girdi!</span>
          </div>
          <span className="text-[11px] opacity-80">Otomatik Aktif</span>
        </div>
      )}

      {/* 2. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: En Çok Dönüştüren Kaynak */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Çok Dönüştüren Kaynak
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="truncate">{topSource?.sourceName || "Kurumsal Form"}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                %{topSource?.conversionRate.toFixed(1) || "58.3"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {topSource?.convertedLeadsCount || 3} kazanılan müşteri •{" "}
              {(topSource?.totalRevenueGenerated || 25000).toLocaleString("tr-TR")} ₺ ciro
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ortalama sipariş: {topSource?.avgOrderValue.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>

        {/* KPI 2: Toplam Abone & Aktiflik */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Toplam E-Bülten Abonesi
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{subscribers.length} Abone</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                %
                {(
                  (subscribers.filter((s) => s.status === "active").length /
                    Math.max(1, subscribers.length)) *
                  100
                ).toFixed(0)}{" "}
                Aktif
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {subscribers.filter((s) => s.status === "active").length} aktif bülten alıcısı
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-blue-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>İptal oranı yalnızca %11.1</span>
          </div>
        </div>

        {/* KPI 3: Otomatik Hoş Geldin Durumu */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hoş Geldin Kurgusu
            </span>
            <span
              className={`p-2 rounded-xl border ${
                welcomeConfig.enabled
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{welcomeConfig.enabled ? "Tetikleme Aktif" : "Pasif Durumda"}</span>
              {welcomeConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {welcomeConfig.sendDelayMinutes === 0
                ? "Anında gönderim"
                : `${welcomeConfig.sendDelayMinutes} dk gecikmeli`}
              {welcomeConfig.offerDiscountCode && (
                <span> • Kod: {welcomeConfig.offerDiscountCode}</span>
              )}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" />
            <span>%{welcomeConfig.offerDiscountPercent || 10} Hoş Geldin İndirimi</span>
          </div>
        </div>

        {/* KPI 4: E-Posta Etkileşim & Açılma */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hoş Geldin Etkileşimi
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <MousePointerClick className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>%83.3</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Açılma (Open)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              %50.0 link tıklama • 5 kupon kullanımı
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-purple-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sektör ortalamasından 3.2 kat daha yüksek</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="tab-source-analysis"
            onClick={() => setActiveTab("source-analysis")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "source-analysis"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>E-Bülten Kaynak Analizi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {sourceAttributions.length} Kaynak
            </span>
          </button>

          <button
            type="button"
            id="tab-welcome-workflow"
            onClick={() => setActiveTab("welcome-workflow")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "welcome-workflow"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Otomatik Hoş Geldin Kurgusu</span>
            {welcomeConfig.enabled && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                Aktif
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-subscribers-list"
            onClick={() => setActiveTab("subscribers-list")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "subscribers-list"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Abone Listesi &amp; Segmentler</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 font-mono">
              {subscribers.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-execution-logs"
            onClick={() => setActiveTab("execution-logs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "execution-logs"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Otomasyon Günlüğü</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono">
              {logs.length} Log
            </span>
          </button>
        </div>

        {/* Export Data Button */}
        <button
          type="button"
          onClick={handleExportSubscribersCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Aboneleri İndir (CSV)</span>
        </button>
      </div>

      {/* 4. ACTIVE TAB VIEWS */}

      {/* SUB-TAB 1: E-BÜLTEN KAYNAK ANALİZİ (SOURCE ATTRIBUTION & CONVERSION) */}
      {activeTab === "source-analysis" && (
        <div className="space-y-6">
          {/* Top 3 Highlight Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sourceAttributions.slice(0, 3).map((attr, idx) => (
              <div
                key={attr.sourceName}
                className={`p-5 bg-white rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
                  attr.isTopPerformer
                    ? "border-amber-300 ring-2 ring-amber-400/20 bg-gradient-to-br from-amber-50/20 via-white to-white"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                        idx === 0
                          ? "bg-amber-400 text-slate-900"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{attr.sourceName}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {attr.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Dönüşüm Oranı
                    </span>
                    <span className="text-base font-bold text-emerald-600 font-mono">
                      %{attr.conversionRate.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Toplam Ciro</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {attr.totalRevenueGenerated.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Toplam / Aktif Abone
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {attr.totalSubscribers} / {attr.activeSubscribers}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Ort. Karar Süresi
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {attr.avgDecisionMinutes} Dk
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Müşteriye Dönüşüm Skoru</span>
                    <span className="font-bold text-slate-700">
                      %{attr.conversionRate.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, attr.conversionRate * 1.5)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Source Attribution Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  E-Bülten Kaynak Verimlilik &amp; Ciro Dağılım Tablosu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Her web formu ve temas noktasından gelen bülten abonelerinin gerçek satın alma,
                  hizmet talebi ve dönüşüm metrikleri.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Çapraz Lead &amp; Satış Eşleştirmesi Aktif
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">E-Bülten / Form Kaynağı</th>
                    <th className="py-3 px-3 text-right">Toplam Abone</th>
                    <th className="py-3 px-3 text-right">Aktif Abone</th>
                    <th className="py-3 px-4 text-right">Dönüşüm Oranı (%)</th>
                    <th className="py-3 px-3 text-right">Kazanılan Müşteri</th>
                    <th className="py-3 px-3 text-right">Ort. Sepet Değeri</th>
                    <th className="py-3 px-4 text-right">Toplam Üretilen Ciro</th>
                    <th className="py-3 px-3 text-right">Hoş Geldin Teslimi</th>
                    <th className="py-3 px-4">Performans Rozeti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {sourceAttributions.map((src) => (
                    <tr
                      key={src.sourceName}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        src.isTopPerformer ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                KNOWN_NEWSLETTER_SOURCES[src.sourceName]?.color || "#4f46e5"
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{src.sourceName}</span>
                              {src.isTopPerformer && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                  ★ #1 Lider
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {KNOWN_NEWSLETTER_SOURCES[src.sourceName]?.description ||
                                "Web sitesi formu üzerinden kayıt"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-900 font-bold">
                        {src.totalSubscribers}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                        {src.activeSubscribers}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold font-mono text-slate-900">
                            %{src.conversionRate.toFixed(1)}
                          </span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(100, src.conversionRate * 1.5)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-800 font-bold">
                        {src.convertedLeadsCount} Lead
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {src.avgOrderValue.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                        {src.totalRevenueGenerated.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-700">
                        %{src.welcomeEmailDeliveryRate.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {src.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Strategy Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>En Karlı Kaynak Stratejisi: Kurumsal Teklif Formu</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kurumsal teklif formu üzerinden bültene kaydolan her 100 abonenin{" "}
                <strong>%58.3&apos;ü</strong> ortalama <strong>6.800 ₺</strong> sepet tutarı ile
                sözleşmeli müşteriye dönüşüyor. Bu kaynak için hoş geldin e-postasında filo avantajı
                ve kurumsal fatura güvencesi öne çıkarılmalıdır.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Hacim &amp; Hızlı Karar Stratejisi: Ana Sayfa Formu</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ana Sayfa Teklif Formu en yüksek kayıt hacmine sahip olup ortalama karar süresi{" "}
                <strong>3.5 dakika</strong> civarındadır. Yeni abonelere ilk 5 dakika içerisinde
                gönderilen <strong>%10 hoş geldin indirim kuponu</strong> acil çekici taleplerinde
                anında dönüşüm sağlamaktadır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OTOMATİK HOŞ GELDİN E-POSTASI KURGUSU (WORKFLOW BUILDER) */}
      {activeTab === "welcome-workflow" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Automation Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Master Workflow Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <label
                      htmlFor="welcome-email-switch"
                      className="font-bold text-sm text-slate-900 cursor-pointer"
                    >
                      Yeni Abone Olduğunda Otomatik Hoş Geldin E-Postası Gönder
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    Sitenin herhangi bir formundan veya bülten kutusundan yeni e-posta kaydı
                    alındığında anında tetiklenir.
                  </p>
                </div>

                <input
                  type="checkbox"
                  id="welcome-email-switch"
                  checked={welcomeConfig.enabled}
                  onChange={(e) => {
                    const updated = { ...welcomeConfig, enabled: e.target.checked };
                    setWelcomeConfig(updated);
                    handleSaveAutomationConfig(updated);
                  }}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Automation Trigger & Filter Rules */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-500" />
                  <span>1. Tetikleme Kriterleri &amp; Kaynak Filtresi</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tetikleyici Olay (Trigger Event)
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Yeni E-Bülten Aboneliği (On Subscribe)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gönderim Zamanlaması (Gecikme)
                    </label>
                    <select
                      value={welcomeConfig.sendDelayMinutes}
                      onChange={(e) =>
                        setWelcomeConfig({
                          ...welcomeConfig,
                          sendDelayMinutes: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    >
                      <option value={0}>⚡ Anında Gönder (0 Dakika Gecikme)</option>
                      <option value={5}>⏱️ 5 Dakika Sonra Gönder</option>
                      <option value={15}>⏱️ 15 Dakika Sonra Gönder</option>
                      <option value={60}>⏱️ 1 Saat Sonra Gönder</option>
                    </select>
                  </div>
                </div>

                {/* Source Selection Multi-Select */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Hangi Form / Abone Kaynaklarında Tetiklensin?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={welcomeConfig.sourceFilter.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWelcomeConfig({ ...welcomeConfig, sourceFilter: ["all"] });
                          } else {
                            setWelcomeConfig({
                              ...welcomeConfig,
                              sourceFilter: ["Footer Formu"]
                            });
                          }
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span>Tüm Kaynaklar (Önerilen)</span>
                    </label>

                    {Object.keys(KNOWN_NEWSLETTER_SOURCES).map((src) => (
                      <label
                        key={src}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          welcomeConfig.sourceFilter.includes("all") ||
                          welcomeConfig.sourceFilter.includes(src)
                            ? "border-indigo-200 bg-indigo-50/50 text-indigo-900"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={welcomeConfig.sourceFilter.includes("all")}
                          checked={
                            welcomeConfig.sourceFilter.includes("all") ||
                            welcomeConfig.sourceFilter.includes(src)
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWelcomeConfig({
                                ...welcomeConfig,
                                sourceFilter: [...welcomeConfig.sourceFilter, src]
                              });
                            } else {
                              setWelcomeConfig({
                                ...welcomeConfig,
                                sourceFilter: welcomeConfig.sourceFilter.filter((s) => s !== src)
                              });
                            }
                          }}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <span className="truncate">{src}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sender Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>2. Gönderen &amp; İletişim Bilgileri</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gönderen Adı
                    </label>
                    <input
                      type="text"
                      value={welcomeConfig.senderName}
                      onChange={(e) =>
                        setWelcomeConfig({ ...welcomeConfig, senderName: e.target.value })
                      }
                      placeholder="Örn: Yıldız Oto Kurtarma Ekibi"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gönderen E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      value={welcomeConfig.senderEmail}
                      onChange={(e) =>
                        setWelcomeConfig({ ...welcomeConfig, senderEmail: e.target.value })
                      }
                      placeholder="bulten@firmaniz.com"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Email Content & Discount Setting */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3. Hoş Geldin İndirim Kuponu &amp; E-Posta Şablonu</span>
                </h3>

                {/* Discount Code Box */}
                <div className="p-4 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 rounded-xl border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-indigo-600" />
                      <span>Hoş Geldin İndirim Kuponu Ekle</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Dönüşümü %44 Artırır
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Kupon Kodu
                      </label>
                      <input
                        type="text"
                        value={welcomeConfig.offerDiscountCode || ""}
                        onChange={(e) =>
                          setWelcomeConfig({
                            ...welcomeConfig,
                            offerDiscountCode: e.target.value.toUpperCase()
                          })
                        }
                        placeholder="HOSGELDIN10"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-indigo-200 font-mono font-bold text-indigo-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        İndirim Oranı (%)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={welcomeConfig.offerDiscountPercent || 10}
                        onChange={(e) =>
                          setWelcomeConfig({
                            ...welcomeConfig,
                            offerDiscountPercent: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-indigo-200 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Geçerlilik Süresi
                      </label>
                      <select
                        value={welcomeConfig.discountExpiryDays || 30}
                        onChange={(e) =>
                          setWelcomeConfig({
                            ...welcomeConfig,
                            discountExpiryDays: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-indigo-200 font-medium"
                      >
                        <option value={14}>14 Gün Geçerli</option>
                        <option value={30}>30 Gün Geçerli</option>
                        <option value={60}>60 Gün Geçerli</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">E-Posta Konusu</label>
                    <span className="text-[10px] text-slate-400">
                      Dinamik etiketleri kullanabilirsiniz
                    </span>
                  </div>
                  <input
                    type="text"
                    value={welcomeConfig.subject}
                    onChange={(e) =>
                      setWelcomeConfig({ ...welcomeConfig, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>

                {/* Quick Variable Insert Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Değişkenler:</span>
                  {[
                    { tag: "{{name}}", label: "Müşteri Adı" },
                    { tag: "{{companyName}}", label: "Firma Adı" },
                    { tag: "{{discountCode}}", label: "İndirim Kuponu" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.tag}
                      onClick={() => handleCopyTag(item.tag)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Kopyala"
                    >
                      <span>{item.tag}</span>
                      {copiedTag === item.tag ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Email Body Copy */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hoş Geldin E-Postası Gövde Metni
                  </label>
                  <textarea
                    rows={6}
                    value={welcomeConfig.bodyText}
                    onChange={(e) =>
                      setWelcomeConfig({ ...welcomeConfig, bodyText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed"
                  />
                </div>

                {/* CTA Button Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Eylem Çağrısı (CTA Buton Metni)
                    </label>
                    <input
                      type="text"
                      value={welcomeConfig.ctaButtonText}
                      onChange={(e) =>
                        setWelcomeConfig({ ...welcomeConfig, ctaButtonText: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Yönlendirme Bağlantısı (URL)
                    </label>
                    <input
                      type="text"
                      value={welcomeConfig.ctaButtonUrl}
                      onChange={(e) =>
                        setWelcomeConfig({ ...welcomeConfig, ctaButtonUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowTestSendModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>Test Gönder</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAutomationConfig()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Otomasyon Kurgusunu Kaydet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Canlı E-Posta Şablon Önizlemesi</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Masaüstü Önizleme"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Mobil Önizleme"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Container Card */}
            <div
              className={`bg-slate-100 p-4 rounded-2xl border border-slate-200 transition-all ${
                previewDevice === "mobile" ? "max-w-xs mx-auto" : "w-full"
              }`}
            >
              {/* Fake Email Client Header */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Kimden: <strong>{welcomeConfig.senderName}</strong> &lt;
                      {welcomeConfig.senderEmail}&gt;
                    </span>
                    <span className="text-[10px]">Şimdi</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kime: <strong>Ahmet Yılmaz</strong> &lt;ahmet@ornek.com&gt;
                  </div>
                  <div className="font-bold text-slate-900 pt-1 text-xs">{previewSubject}</div>
                </div>

                {/* Email Body Content */}
                <div className="p-5 space-y-4">
                  {/* Brand Header */}
                  <div className="text-center pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-indigo-600 tracking-tight block">
                      {config.companyName || "Yıldız Oto Kurtarma"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Resmi E-Bülten ve Hoş Geldin Bildirimi
                    </span>
                  </div>

                  {/* Heading */}
                  <h4 className="text-base font-extrabold text-slate-900 text-center">
                    {welcomeConfig.heading}
                  </h4>

                  {/* Body Paragraphs */}
                  <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {previewBody}
                  </div>

                  {/* Discount Coupon Box */}
                  {welcomeConfig.offerDiscountCode && (
                    <div className="p-3.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 text-center space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Hoş Geldin İndirim Kuponunuz
                      </span>
                      <div className="text-lg font-extrabold font-mono text-indigo-900 tracking-wider">
                        {welcomeConfig.offerDiscountCode}
                      </div>
                      <span className="text-[10px] text-indigo-600 block">
                        %{welcomeConfig.offerDiscountPercent || 10} İndirim •{" "}
                        {welcomeConfig.discountExpiryDays || 30} Gün Boyunca Geçerli
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="text-center pt-2">
                    <a
                      href={welcomeConfig.ctaButtonUrl}
                      onClick={(e) => e.preventDefault()}
                      className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 transition-colors"
                    >
                      {welcomeConfig.ctaButtonText}
                    </a>
                  </div>

                  {/* Footer note */}
                  <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
                    <p>Bu e-posta bültenimize kaydolduğunuz için iletilmiştir.</p>
                    {welcomeConfig.includeUnsubscribeLink && (
                      <p className="underline hover:text-slate-600 cursor-pointer">
                        Abonelikten Ayrıl (Unsubscribe)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ABONE LİSTESİ & SEGMENTASYON */}
      {activeTab === "subscribers-list" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                E-Bülten Aboneleri &amp; Dönüşüm Durumları
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kayıt olan tüm kullanıcıların kaynakları, hoş geldin teslimat durumu ve müşteri
                segmentleri.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E-posta, isim veya etiket ara..."
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-56 font-medium"
                />
              </div>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="all">Tüm Kaynaklar</option>
                {Object.keys(KNOWN_NEWSLETTER_SOURCES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif Aboneler</option>
                <option value="unsubscribed">Ayrılanlar</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddSubModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Abone Ekle</span>
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Abone Bilgisi</th>
                    <th className="py-3 px-3">Edinme Kaynağı</th>
                    <th className="py-3 px-3">Kayıt Tarihi</th>
                    <th className="py-3 px-3">Etiketler &amp; Segment</th>
                    <th className="py-3 px-3">Hoş Geldin E-Postası</th>
                    <th className="py-3 px-3">Dönüşüm Durumu</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Arama kriterlerine uygun bülten abonesi bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {(sub.name || sub.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {sub.name || "İsimsiz Abone"}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {sub.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  KNOWN_NEWSLETTER_SOURCES[sub.source || "Footer Formu"]?.color ||
                                  "#64748b"
                              }}
                            />
                            <span>{sub.source || "Footer Formu"}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                          {sub.subscribedAt}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {sub.tags?.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {sub.welcomeEmailStatus === "clicked" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <MousePointerClick className="w-3 h-3" />
                              <span>Tıklandı</span>
                            </span>
                          ) : sub.welcomeEmailStatus === "opened" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Eye className="w-3 h-3" />
                              <span>Açıldı</span>
                            </span>
                          ) : sub.welcomeEmailStatus === "delivered" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Teslim Edildi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <Clock className="w-3 h-3" />
                              <span>Bekliyor</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {sub.conversionStatus === "customer" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Müşteri</span>
                            </span>
                          ) : sub.conversionStatus === "lead" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span>Talep / Lead</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              <span>Aday</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleManualTriggerForSubscriber(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Hoş geldin e-postası tetikle"
                          >
                            <Send className="w-3 h-3" />
                            <span>Hoş Geldin Tetikle</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: OTOMASYON GÖNDERİM GÜNLÜĞÜ (EXECUTION LOGS) */}
      {activeTab === "execution-logs" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Otomasyon Gönderim &amp; Tetikleme Günlüğü
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Yeni abonelik anında sistem tarafından gönderilen hoş geldin e-postaları, teslimat
                ve tıklama kayıtları.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              Toplam {logs.length} Gönderim
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tarih / Zaman</th>
                    <th className="py-3 px-3">Alıcı Abone</th>
                    <th className="py-3 px-3">Kayıt Formu</th>
                    <th className="py-3 px-4">Gönderilen Konu</th>
                    <th className="py-3 px-3">Teslimat Durumu</th>
                    <th className="py-3 px-3">Kupon Kullanımı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {log.sentAt}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          {log.subscriberName || "Abone"}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {log.subscriberEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 truncate max-w-xs">{log.subject}</td>
                      <td className="py-3.5 px-3">
                        {log.status === "clicked" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <MousePointerClick className="w-3 h-3" />
                            <span>Tıklandı</span>
                          </span>
                        ) : log.status === "opened" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Eye className="w-3 h-3" />
                            <span>Açıldı</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Teslim Edildi</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {log.discountCodeUsed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Kullanıldı</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Kullanılmadı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: TEST HOŞ GELDİN E-POSTASI GÖNDER */}
      {showTestSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowTestSendModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Send className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Test Hoş Geldin E-Postası Gönder
                </h3>
                <span className="text-xs text-slate-500">
                  Otomasyon kurgusunun çalışmasını simüle edin
                </span>
              </div>
            </div>

            {testSendSuccessMessage ? (
              <div className="p-4 my-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testSendSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-4 my-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Test Alıcı Adı
                  </label>
                  <input
                    type="text"
                    value={testEmailName}
                    onChange={(e) => setTestEmailName(e.target.value)}
                    placeholder="Ali Vural"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Test Alıcı E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">💡 Gönderim Detayları:</p>
                  <p className="text-[11px] leading-relaxed">
                    E-posta konusu <strong>&ldquo;{previewSubject}&rdquo;</strong> olarak derlenecek
                    ve <strong>%{welcomeConfig.offerDiscountPercent || 10}</strong> indirim kodu (
                    {welcomeConfig.offerDiscountCode || "HOSGELDIN10"}) eklenecektir.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTestSendModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleTriggerTestSend}
                disabled={!testEmailAddress}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Simüle Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: YENİ ABONE EKLE */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowAddSubModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-slate-900 text-white">
                <Plus className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Manuel Yeni Abone Ekle</h3>
                <span className="text-xs text-slate-500">
                  E-Bülten listesine yeni bir abone kaydedin
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-4 my-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ad Soyad (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Örn: Sinan Koç"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-Posta Adresi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="ornek@domain.com"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kayıt Kaynağı (Form / Kanal)
                </label>
                <select
                  value={newSubSource}
                  onChange={(e) => setNewSubSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                >
                  {Object.keys(KNOWN_NEWSLETTER_SOURCES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 text-xs text-indigo-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Kayıt tamamlandığında hoş geldin otomasyonu devrede ise anında hoş geldin e-postası
                  tetiklenecektir.
                </span>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newSubEmail}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Aboneyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
