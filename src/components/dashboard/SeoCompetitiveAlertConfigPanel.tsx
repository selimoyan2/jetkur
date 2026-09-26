import React, { useState, useEffect } from "react";
import { 
  SiteConfig, 
  SeoCompetitiveAlert, 
  SeoCompetitiveAlertSettings 
} from "../../types";
import { 
  DEFAULT_ALERT_SETTINGS,
  loadCompetitiveAlertSettings,
  saveCompetitiveAlertSettings,
  playAlertChime,
  triggerBrowserPushNotification,
  requestBrowserNotificationPermission,
  getNotificationPermission,
  simulateDomainAuthorityAlert,
  simulateTrafficVolumeAlert,
  dispatchCompetitiveAlertNotification
} from "../../utils/seoCompetitiveAlertEngine";
import { 
  SlidersHorizontal, 
  Bell, 
  BellRing, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Radio, 
  Zap, 
  Check, 
  CheckCircle2, 
  X, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Mail, 
  Webhook, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Layers
} from "lucide-react";

export interface SeoCompetitiveAlertConfigPanelProps {
  config: SiteConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onSettingsSaved?: (newSettings: SeoCompetitiveAlertSettings) => void;
  onAlertTriggered?: (alert: SeoCompetitiveAlert) => void;
  mode?: "modal" | "inline";
  className?: string;
}

export const SeoCompetitiveAlertConfigPanel: React.FC<SeoCompetitiveAlertConfigPanelProps> = ({
  config,
  isOpen = true,
  onClose,
  onSettingsSaved,
  onAlertTriggered,
  mode = "inline",
  className = ""
}) => {
  const [settings, setSettings] = useState<SeoCompetitiveAlertSettings>(() => loadCompetitiveAlertSettings());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => getNotificationPermission());
  const [activeTab, setActiveTab] = useState<"da-authority" | "traffic-volume" | "channels" | "simulator">("da-authority");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Keep permission in sync
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Handle setting updates
  const handleUpdate = <K extends keyof SeoCompetitiveAlertSettings>(key: K, value: SeoCompetitiveAlertSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save changes to localStorage & parent
  const handleSave = () => {
    const updated = {
      ...settings,
      lastCheckedAt: new Date().toISOString()
    };
    saveCompetitiveAlertSettings(updated);
    if (onSettingsSaved) {
      onSettingsSaved(updated);
    }
    setSaveStatus("Ayarlar başarıyla kaydedildi ve canlı izleme motoruna uygulandı.");
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    setSettings(DEFAULT_ALERT_SETTINGS);
    saveCompetitiveAlertSettings(DEFAULT_ALERT_SETTINGS);
    if (onSettingsSaved) {
      onSettingsSaved(DEFAULT_ALERT_SETTINGS);
    }
    setSaveStatus("Ayarlar önerilen varsayılan değerlere sıfırlandı.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Request browser push notification permission
  const handleRequestPushPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    if (perm === "granted") {
      handleUpdate("browserPushEnabled", true);
      setTestStatus("✅ Tarayıcı Web Push bildirim izni onaylandı! Canlı alarmlar ekranınıza iletilecektir.");
    } else if (perm === "denied") {
      setTestStatus("⚠️ Bildirim izni tarayıcı ayarlarından engellendi. Adres çubuğundaki kilit simgesinden izin veriniz.");
    }
    setTimeout(() => setTestStatus(null), 4500);
  };

  // Play sound test
  const handleTestAudio = () => {
    playAlertChime();
    setTestStatus("🔊 İki tonlu Web Audio alarm tınısı çalındı.");
    setTimeout(() => setTestStatus(null), 3000);
  };

  // Test Domain Authority Alert
  const handleTestDaAlert = async () => {
    setIsSimulating(true);
    setTestStatus("Domain Otoritesi (DA) değişim alarmı oluşturuluyor...");

    setTimeout(async () => {
      const { newAlert } = simulateDomainAuthorityAlert(config, [], settings);
      setIsSimulating(false);

      await dispatchCompetitiveAlertNotification(newAlert, settings);
      if (onAlertTriggered) {
        onAlertTriggered(newAlert);
      }

      setTestStatus(`🚨 [DA ALARMI GÖNDERİLDİ] "${newAlert.title}" Stratejik Analiz paneline iletildi.`);
      setTimeout(() => setTestStatus(null), 5000);
    }, 600);
  };

  // Test Traffic Volume Alert
  const handleTestTrafficAlert = async () => {
    setIsSimulating(true);
    setTestStatus("Trafik Hacmi patlaması alarmı oluşturuluyor...");

    setTimeout(async () => {
      const { newAlert } = simulateTrafficVolumeAlert(config, [], settings);
      setIsSimulating(false);

      await dispatchCompetitiveAlertNotification(newAlert, settings);
      if (onAlertTriggered) {
        onAlertTriggered(newAlert);
      }

      setTestStatus(`⚡ [TRAFİK ALARMI GÖNDERİLDİ] "${newAlert.title}" Stratejik Analiz paneline iletildi.`);
      setTimeout(() => setTestStatus(null), 5000);
    }, 600);
  };

  // Test Browser Push
  const handleTestPushNotification = async () => {
    const dummyAlert: SeoCompetitiveAlert = {
      id: `test-config-push-${Date.now()}`,
      keyword: `${config.sector || 'Hizmet'} Liderliği`,
      monthlyVolume: "12.4K / ay",
      searchIntent: "Ticari",
      competitorName: "Pazar Lideri (#1)",
      competitorDomain: "liderfirma.com.tr",
      userRank: 3,
      competitorRank: 1,
      rankDelta: 2,
      competitorDa: 56,
      userDa: 48,
      severity: "critical",
      category: "domain_authority_spike",
      title: "🔔 [TEST BİLDİRİMİ] SEO Rekabet Alarmı Yapılandırması Aktif!",
      description: "Rakiplerin domain otoritesi veya trafik hacmindeki önemli değişimler anında bu kanaldan bildirilecektir.",
      trafficLossEstimate: "-480 Ziyaretçi Riski",
      detectedAt: new Date().toISOString(),
      isRead: false,
      status: "active",
      rootCause: "Yapılandırma paneli testi tamamlandı.",
      recommendedAction: {
        type: "blog",
        label: "Stratejik Analizi İncele",
        description: "SEO Rekabet Alarmı paneline gidin."
      }
    };

    if (settings.audioCueEnabled) {
      playAlertChime();
    }

    const sent = await triggerBrowserPushNotification(dummyAlert);
    if (sent) {
      setTestStatus("🔔 Masaüstü Web Push bildirimi başarıyla gönderildi!");
    } else {
      setTestStatus("⚠️ Push bildirimi gönderilemedi. Lütfen önce yukarıdaki butondan tarayıcı iznini onaylayınız.");
    }
    setTimeout(() => setTestStatus(null), 4500);
  };

  if (!isOpen && mode === "modal") return null;

  const content = (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden ${className}`}>
      {/* ===================================================================== */}
      {/* 1. TOP HEADER BAR */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-indigo-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-black tracking-wide">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>SEO Rekabet Alarmı Yapılandırma Paneli</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                Canlı Eşik Motoru
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Domain Otoritesi & Trafik Hacmi Alarm Ayarları</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Rakiplerin Moz DA / Ahrefs DR skorlarında, yeni backlink kazanımlarında veya aylık organik arama trafiğindeki 
              önemli dalgalanmalarda <strong>sesli, masaüstü push ve uygulama içi bildirim</strong> eşiklerini belirleyin.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {mode === "modal" && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status indicator badges bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold">İzleme Sıklığı:</span>
            <span className="text-white font-mono font-bold">{settings.autoCheckIntervalHours} Saatte Bir</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Web Push:</span>
            <span className={`font-bold ${notificationPermission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {notificationPermission === 'granted' ? 'Etkin (İzin Var)' : 'İzin Bekleniyor'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            {settings.audioCueEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="font-semibold">Sesli Uyarı:</span>
            <span className={`font-bold ${settings.audioCueEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
              {settings.audioCueEnabled ? 'Açık' : 'Kapalı'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">DA Eşiği:</span>
            <span className="text-white font-mono font-bold">±{settings.domainAuthorityDeltaThreshold ?? 2} DA</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Trafik Sıçraması:</span>
            <span className="text-white font-mono font-bold">+%{settings.trafficVolumeChangePercent ?? 30}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. NOTICES (SUCCESS OR TEST FEEDBACK) */}
      {/* ===================================================================== */}
      {saveStatus && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {testStatus && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-200 text-indigo-950 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
            <span>{testStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestStatus(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. TABS NAVIGATION */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 sm:px-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("da-authority")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "da-authority"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-700 hover:bg-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>1. Domain Otoritesi (DA) Eşikleri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("traffic-volume")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "traffic-volume"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-700 hover:bg-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Trafik Hacmi & Sıçrama Eşikleri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("channels")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "channels"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-700 hover:bg-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>3. Bildirim Kanalları & İzinler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "simulator"
              ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:text-rose-700 hover:bg-white"
          }`}
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>4. Canlı Alarm Testi & Simülatör</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 4. MAIN CONTENT ACCORDING TO ACTIVE TAB */}
      {/* ===================================================================== */}
      <div className="p-6 space-y-6">
        {/* TAB 1: DOMAIN AUTHORITY (DA & BACKLINK) RULES */}
        {activeTab === "da-authority" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 space-y-1">
                <div className="font-bold text-sm">Domain Otoritesi (Moz DA / Ahrefs DR) İzleme Mantığı</div>
                <p className="leading-relaxed">
                  Sitenizin otoritesi <strong>DA 48</strong> olarak hesaplanmıştır. Pazar lideri rakip <strong>DA 56</strong> seviyesindedir. 
                  Rakipler yüksek otoriteli haber bültenleri veya DoFollow referans domainler aldığında DA skorları fırlar ve sıralamada 
                  önünüze geçer. Aşağıdaki eşiklerle bu tehditleri anında yakalayabilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Setting 1: DA Change Threshold */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>DA Puan Değişim Eşiği</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-black">Kritik</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Rakibin Moz DA puanı bu değer kadar arttığında derhal alarm oluşturulur.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-black text-sm">
                    ±{settings.domainAuthorityDeltaThreshold ?? 2}
                  </div>
                </div>

                <div className="pt-2">
                  <select
                    value={settings.domainAuthorityDeltaThreshold ?? 2}
                    onChange={(e) => handleUpdate("domainAuthorityDeltaThreshold", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>±1 DA (Ultra Hassas - En ufak dalgalanmada uyar)</option>
                    <option value={2}>±2 DA (Önerilen Denge - Anlamlı link kampanyalarında uyar)</option>
                    <option value={3}>±3 DA (Orta - Belirgin otorite artışlarında uyar)</option>
                    <option value={5}>±5 DA (Büyük Sıçrama - Yalnızca kitlesel PR hamlelerinde uyar)</option>
                  </select>
                </div>
              </div>

              {/* Setting 2: Surpassing User DA Alert */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Sitemizin DA'sını Geçme / Tehdit Alarmı</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-black">Acil</span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Gerinizde olan bir rakip (Örn: DA 44), DA 48 olan sitenizi yakaladığında veya geçtiğinde acil push bildirimi tetikler.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertOnCompetitorSurpassingUserDa ?? true}
                    onChange={(e) => handleUpdate("alertOnCompetitorSurpassingUserDa", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer mt-1"
                  />
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sitenizin pazar liderliğini korumak için önerilir.</span>
                </div>
              </div>

              {/* Setting 3: Referring Domains Surge */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900">
                      DoFollow Referans Domain (Backlink) Sıçraması
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Rakip kısa sürede bu sayıdan fazla yeni referans alan adı kazandığında uyar.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertOnNewReferringDomains ?? true}
                    onChange={(e) => handleUpdate("alertOnNewReferringDomains", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <select
                    disabled={!settings.alertOnNewReferringDomains}
                    value={settings.referringDomainJumpThreshold ?? 20}
                    onChange={(e) => handleUpdate("referringDomainJumpThreshold", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
                  >
                    <option value={10}>+10 Yeni DoFollow Ref Domain</option>
                    <option value={20}>+20 Yeni DoFollow Ref Domain (Önerilen)</option>
                    <option value={30}>+30 Yeni DoFollow Ref Domain</option>
                    <option value={50}>+50 Yeni DoFollow Ref Domain (Büyük Kampanya)</option>
                  </select>
                </div>
              </div>

              {/* Setting 4: Minimum Rank Gap */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900">
                      Asgari Sıralama Farkı (Rank Gap) Eşiği
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Rakip sitenizden en az kaç sıra yukarı çıktığında alarm çalsın?
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-white rounded-lg border border-slate-200">
                    {settings.minimumRankGap || 1} Sıra
                  </span>
                </div>

                <div className="pt-2">
                  <select
                    value={settings.minimumRankGap || 1}
                    onChange={(e) => handleUpdate("minimumRankGap", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value={1}>1 Sıra (Herhangi bir geçişte bildir)</option>
                    <option value={2}>2 Sıra (En az 2 sıra fark oluştuğunda)</option>
                    <option value={3}>3 Sıra (Ciddi fark oluştuğunda)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORGANIC TRAFFIC VOLUME & SEARCH DEMAND RULES */}
        {activeTab === "traffic-volume" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <div className="font-bold text-sm">Organik Trafik Hacmi & Arama Patlaması Algılama Kuralları</div>
                <p className="leading-relaxed">
                  Google organik arama hacimlerinde ani talep artışları (+%35 ile +%150 arası) yaşandığında rakipler 1. sırayı 
                  alarak yüzlerce potansiyel müşteriyi çekebilir. Trafik eşikleri bu kaçırılan fırsatları anında ekrana taşır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Setting 1: Monthly Traffic Surge % */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Rakip Aylık Trafik Artış Eşiği</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 font-black">Trafik</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Rakibin toplam aylık organik ziyaretçi trafiği bu yüzdenin üzerinde arttığında bildir.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-black text-sm">
                    +%{settings.trafficVolumeChangePercent ?? 30}
                  </div>
                </div>

                <div className="pt-2">
                  <select
                    value={settings.trafficVolumeChangePercent ?? 30}
                    onChange={(e) => handleUpdate("trafficVolumeChangePercent", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value={20}>+%20 (Hassas - Erken trafik sıçraması uyarısı)</option>
                    <option value={30}>+%30 (Önerilen Denge)</option>
                    <option value={50}>+%50 (Büyük Trafik Patlaması)</option>
                    <option value={100}>+%100 (2 Kat Trafik Patlaması)</option>
                  </select>
                </div>
              </div>

              {/* Setting 2: Keyword Volume Spike Threshold */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Anahtar Kelime Arama Talebi Sıçraması</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Belirli bir hizmet kelimesinde ani Google arama talebi patlaması eşiği.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertOnVolumeSpike ?? true}
                    onChange={(e) => handleUpdate("alertOnVolumeSpike", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <select
                    disabled={!settings.alertOnVolumeSpike}
                    value={settings.volumeSpikeThresholdPercent || 35}
                    onChange={(e) => handleUpdate("volumeSpikeThresholdPercent", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
                  >
                    <option value={20}>+%20 Arama Talep Artışı</option>
                    <option value={35}>+%35 Arama Talep Artışı (Önerilen)</option>
                    <option value={50}>+%50 Arama Talep Artışı (Viral / Sezonsal)</option>
                    <option value={100}>+%100 Arama Talep Artışı (Ani Patlama)</option>
                  </select>
                </div>
              </div>

              {/* Setting 3: Estimated Traffic Loss Threshold */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-900">
                      Tahmini Trafik Kayıp Riski Eşiği
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Sıralama gerilemesi nedeniyle aylık kayıp riski bu sayıyı aştığında acil alarm ver.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-white rounded-lg border border-slate-200">
                    &gt;{settings.trafficLossThreshold ?? 350} Ziyaret/ay
                  </span>
                </div>

                <div className="pt-2">
                  <select
                    value={settings.trafficLossThreshold ?? 350}
                    onChange={(e) => handleUpdate("trafficLossThreshold", Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value={150}>&gt; 150 Aylık Ziyaretçi Riski</option>
                    <option value={350}>&gt; 350 Aylık Ziyaretçi Riski (Önerilen)</option>
                    <option value={500}>&gt; 500 Aylık Ziyaretçi Riski</option>
                    <option value={1000}>&gt; 1000 Aylık Ziyaretçi Riski (Yüksek Bütçe)</option>
                  </select>
                </div>
              </div>

              {/* Setting 4: Top 3 Loss Rule */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>İlk 3 Sıra (Top 3) Kaybı Kırmızı Alarmı</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-black">Önemli</span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Siteniz Google ilk 3 sıradan veya yerel harita paketinden düştüğünde en yüksek öncelikle bildir.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertOnTop3Loss}
                    onChange={(e) => handleUpdate("alertOnTop3Loss", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer mt-1"
                  />
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Google tıklamalarının %68'i ilk 3 sırada gerçekleşir.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATION CHANNELS & PERMISSIONS */}
        {activeTab === "channels" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold">Kullanıcı Bildirim Kanalları Tercihleri</h3>
                </div>
                <span className="text-xs text-indigo-300 font-semibold">Web Audio & Push API</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rakiplerin domain otoritesi veya trafik hacmi eşiklerini aşması durumunda bildirimlerin hangi kanallardan 
                iletileceğini seçin.
              </p>
            </div>

            <div className="space-y-4">
              {/* Channel 1: Web Push Notifications */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Tarayıcı Masaüstü Web Push Bildirimleri</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      notificationPermission === 'granted' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {notificationPermission === 'granted' ? 'İzin Onaylı' : 'İzin Gerekiyor'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sekme arka planda veya simge durumunda küçültülmüş olsa bile Chrome/Safari sağ alt köşede anlık kart açar.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {notificationPermission !== "granted" ? (
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      İzin İste
                    </button>
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.browserPushEnabled}
                      onChange={(e) => handleUpdate("browserPushEnabled", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Channel 2: Sound Chime */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Sesli Uyarı Melodisi (Web Audio Synthesizer)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kritik bir otorite veya trafik alarmı tetiklendiğinde iki tonlu yumuşak bir melodi çalar.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Sesi Test Et
                  </button>
                  <input
                    type="checkbox"
                    checked={settings.audioCueEnabled}
                    onChange={(e) => handleUpdate("audioCueEnabled", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Channel 3: In-App Toast */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Uygulama İçi Canlı Toast Bildirimleri</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ekranın sağ alt/üst köşesinde doğrudan AI blog yazma veya aksiyon butonları içeren interaktif kart açılır.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings.inAppToastEnabled}
                  onChange={(e) => handleUpdate("inAppToastEnabled", e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer shrink-0"
                />
              </div>

              {/* Channel 4: Email Alerts (Optional) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">E-posta Özeti & Acil Durum Bildirimi</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailAlertsEnabled ?? false}
                    onChange={(e) => handleUpdate("emailAlertsEnabled", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  />
                </div>
                <input
                  type="email"
                  disabled={!settings.emailAlertsEnabled}
                  value={settings.notificationEmail || ""}
                  onChange={(e) => handleUpdate("notificationEmail", e.target.value)}
                  placeholder="bildirim@sirketiniz.com.tr"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
                />
              </div>

              {/* Channel 5: Webhook URL (Slack / Discord / Zapier) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Webhook URL Entegrasyonu (Slack / Zapier / Discord)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.webhookAlertsEnabled ?? false}
                    onChange={(e) => handleUpdate("webhookAlertsEnabled", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  />
                </div>
                <input
                  type="url"
                  disabled={!settings.webhookAlertsEnabled}
                  value={settings.webhookUrl || ""}
                  onChange={(e) => handleUpdate("webhookUrl", e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE SIMULATOR & TEST TOOLS */}
        {activeTab === "simulator" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-gradient-to-r from-rose-900 to-amber-900 text-white rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
                  <h3 className="text-sm font-bold">Canlı Bildirim Testi & Alarm Simülatörü</h3>
                </div>
                <span className="text-xs text-amber-200 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Gerçek Zamanlı Doğrulama
                </span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                Aşağıdaki butonlara tıklayarak yapılandırdığınız eşiklerin, sesli uyarının ve masaüstü push bildiriminin 
                kullanıcıya nasıl ulaştığını anında test edin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test 1: Domain Authority Shift */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Domain Otoritesi (DA) Değişimi
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Rakibin Moz DA'sının +3 puan fırlamasını ve sitenizin DA'sına yaklaşmasını simüle eder.
                  </p>
                </div>

                <button
                  type="button"
                  id="simulator-test-da-alert-btn"
                  onClick={handleTestDaAlert}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>DA Alarmını Tetikle</span>
                </button>
              </div>

              {/* Test 2: Traffic Volume Spike */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Trafik Hacmi Sıçraması (+%48)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Rakibin aylık organik trafiğinin 16.8K'dan 24.9K'ya çıkmasını ve sıralama tehdidini simüle eder.
                  </p>
                </div>

                <button
                  type="button"
                  id="simulator-test-traffic-alert-btn"
                  onClick={handleTestTrafficAlert}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Trafik Alarmını Tetikle</span>
                </button>
              </div>

              {/* Test 3: Web Push Test */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Masaüstü Web Push Testi
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Masaüstü işletim sistemi bildirim penceresine bir deneme kartı gönderir ve melodiyi çalar.
                  </p>
                </div>

                <button
                  type="button"
                  id="simulator-test-push-btn"
                  onClick={handleTestPushNotification}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Push Bildirimini Gönder</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. BOTTOM ACTION FOOTER */}
      {/* ===================================================================== */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-200/60 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Varsayılan Ayarlara Sıfırla</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {mode === "modal" && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-all"
            >
              Vazgeç
            </button>
          )}

          <button
            type="button"
            id="save-competitive-alert-settings-btn"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Ayarları Kaydet & Canlı İzlemeyi Başlat</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
