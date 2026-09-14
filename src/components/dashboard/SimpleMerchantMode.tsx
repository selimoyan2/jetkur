import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { SiteConfig, ServiceItem, ProductItem, FormLead } from "../../types";
import { slugifyService } from "../../utils/url";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Building2, 
  ShoppingBag, 
  Wrench, 
  Inbox, 
  Rocket, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Eye, 
  Download, 
  FileSpreadsheet,
  HelpCircle, 
  Share2, 
  Plus, 
  Trash2,
  Check,
  Zap,
  ShieldCheck,
  Star,
  Printer,
  History,
  TrendingUp,
  BarChart3,
  Globe,
  Tag,
  Bell,
  BellRing,
  Lock,
  FileText
} from "lucide-react";
import { getTagColorClass, getLeadTagStyle } from "./LeadTagsManager";
import { PerformanceScoreGaugeWidget } from "./PerformanceScoreGaugeWidget";

interface SimpleMerchantModeProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview: () => void;
  onDeploy: () => void;
  onSwitchToAdvanced: () => void;
  onOpenGettingStarted?: () => void;
  setupProgress?: number;
  onExportLeads?: () => void;
  onOpenExportModal?: () => void;
  onOpenBackups?: () => void;
  onOpenAnalytics?: () => void;
  onOpenDomainSettings?: () => void;
  onOpenLeads?: () => void;
  onOpenAutomatedResponses?: () => void;
  onOpenLeadDetail?: (lead: FormLead) => void;
  onNavigateTab?: (tab: string) => void;
}

export const SimpleMerchantMode: React.FC<SimpleMerchantModeProps> = ({
  config,
  onChange,
  onPreview,
  onDeploy,
  onSwitchToAdvanced,
  onOpenGettingStarted,
  setupProgress = 75,
  onExportLeads,
  onOpenExportModal,
  onOpenBackups,
  onOpenAnalytics,
  onOpenDomainSettings,
  onOpenLeads,
  onOpenAutomatedResponses,
  onOpenLeadDetail,
  onNavigateTab,
}) => {
  const [activeCard, setActiveCard] = useState<"contact" | "items" | "leads" | "share">("contact");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showMapsGuideModal, setShowMapsGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [merchantQrDataUrl, setMerchantQrDataUrl] = useState<string>("");

  // Unread or unprocessed incoming inquiries count
  const unreadLeadsCount = (config.leads || []).filter(
    (l) => l.isRead === false || (l.isRead === undefined && l.status === "new")
  ).length;

  // Revenue calculation from completed leads
  const totalCompletedRevenue = (config.leads || [])
    .filter((l) => l.status === "closed")
    .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const completedDealsCount = (config.leads || []).filter((l) => l.status === "closed").length;

  // Quick state for simple editing
  const [companyName, setCompanyName] = useState(config.companyName || "");
  const [phone, setPhone] = useState(config.phone || "");
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || "");
  const [address, setAddress] = useState(config.address || "");
  const [workingHours, setWorkingHours] = useState(config.workingHours || "Haftanın 7 Günü: 24 Saat Açık");

  // Checklist items completion state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    published: true,
    whatsappChecked: true,
    firstItemAdded: (config.services?.items?.length || 0) > 0,
    qrDownloaded: false,
    googleMapsAdded: false
  });

  const toggleTask = (key: string) => {
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = Object.keys(completedTasks).length;

  const handleQuickSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...config,
      companyName,
      phone,
      whatsapp: whatsapp.replace(/[^0-9]/g, ""),
      address,
      workingHours,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleCopySiteUrl = () => {
    const url = config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "firmam"}.hizliweb.site`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickAddService = () => {
    const title = prompt("Hizmet veya Ürün Adı:", "Yeni Hizmet");
    if (!title) return;
    const price = prompt("Fiyatı (Örn: 500 ₺ veya 'Fiyat Sorun'):", "Fiyat Sorun");
    
    const autoSlug = slugifyService(title, Date.now().toString().slice(-4));
    const newService: ServiceItem = {
      id: `svc-${Date.now()}`,
      title,
      slug: autoSlug,
      price: price || "Fiyat Sorun",
      desc: `${config.companyName} kalitesi ve güvencesiyle profesyonel ${title} hizmeti.`,
      icon: "Wrench",
      seoTitle: `${title} Hizmeti & Fiyatları | ${config.city} ${config.companyName}`,
      seoDescription: `${config.city} ${title.toLowerCase()} hizmeti için ${config.companyName}. Hızlı randevu ve uygun fiyat teklifi alın!`,
      seoKeywords: `${title}, ${config.city} ${title.toLowerCase()}, ${config.companyName}, ${config.sector}`
    };

    onChange({
      ...config,
      services: {
        ...config.services,
        items: [...(config.services?.items || []), newService]
      }
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleRemoveService = (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    onChange({
      ...config,
      services: {
        ...config.services,
        items: (config.services?.items || []).filter(s => s.id !== id)
      }
    });
  };

  const siteUrl = config.cloudflare?.customDomain
    ? (config.cloudflare.customDomain.startsWith("http") ? config.cloudflare.customDomain : `https://${config.cloudflare.customDomain}`)
    : (config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "firmam"}.hizliweb.site`);

  useEffect(() => {
    if (showQrModal && !merchantQrDataUrl) {
      QRCode.toDataURL(siteUrl, {
        errorCorrectionLevel: "H",
        width: 600,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      }).then((url) => {
        setMerchantQrDataUrl(url);
      }).catch(console.error);
    }
  }, [showQrModal, siteUrl, merchantQrDataUrl]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">Bilgileriniz kaydedildi! Değişiklikleri yayına vermek için 'Canlıya Gönder'e tıklayın.</span>
        </div>
      )}

      {/* Top Banner: Welcome & Zero-Tech Mode Indicator */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Süper Kolay Esnaf Yönetim Paneli (Sıfır Teknik Bilgi)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {config.companyName || "İşletmeniz"} Web Sitesi Yönetimi
          </h1>
          <p className="text-slate-900 text-xs sm:text-sm font-medium max-w-xl">
            Karmaşık menülerle uğraşmayın. Telefonunuzu, adresinizi ve fiyatlarınızı tek ekranda güncelleyin.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Notification Badge for Form Inquiries */}
          <button
            type="button"
            id="simple-header-lead-notifications-btn"
            onClick={() => {
              if (onOpenLeads) {
                onOpenLeads();
              } else {
                const el = document.getElementById("simple-leads-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`px-3.5 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer ${
              unreadLeadsCount > 0
                ? "bg-slate-950 text-white ring-2 ring-rose-500/70 border border-rose-500/50"
                : "bg-white/90 hover:bg-white text-slate-950"
            }`}
            title={
              unreadLeadsCount > 0
                ? `${unreadLeadsCount} adet yeni veya işlem bekleyen form talebi var`
                : "Tüm form talepleri güncel"
            }
          >
            <div className="relative flex items-center justify-center">
              {unreadLeadsCount > 0 ? (
                <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-700" />
              )}
              {unreadLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <span>Talepler</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border transition-all ${
                unreadLeadsCount > 0
                  ? "bg-rose-500 text-white border-rose-400 shadow-xs animate-pulse"
                  : "bg-slate-200 text-slate-700 border-slate-300"
              }`}
            >
              {unreadLeadsCount}
            </span>
          </button>

          {onOpenGettingStarted && (
            <button
              onClick={onOpenGettingStarted}
              className="px-4 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>10-Dk Kurulum Rehberi</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                %{setupProgress}
              </span>
            </button>
          )}

          <button
            onClick={onPreview}
            className="px-4 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-700" />
            <span>Sitemi Önizle</span>
          </button>

          {onOpenBackups && (
            <button
              onClick={onOpenBackups}
              className="px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Otomatik günlük yedekleme ve geçmiş sürümleri gör"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Yedekler</span>
            </button>
          )}

          {onOpenDomainSettings && (
            <button
              onClick={onOpenDomainSettings}
              className="px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Kendi satın aldığınız alan adını (örn: www.firmaadi.com) Cloudflare altyapısına bağlayın"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{config.cloudflare?.customDomain ? "Alan Adı: Bağlı" : "Alan Adı Yönetimi"}</span>
            </button>
          )}

          <button
            onClick={onDeploy}
            className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-950/30 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Rocket className="w-4 h-4 text-amber-400" />
            <span>Canlıya Gönder (0.02s)</span>
          </button>

          <button
            onClick={onSwitchToAdvanced}
            className="px-3.5 py-3 rounded-2xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-extrabold text-xs border border-slate-950/20 flex items-center gap-1.5"
            title="Tüm detaylı ayarları gösteren stüdyo moduna geç"
          >
            <span>🎛️ Gelişmiş Mod</span>
          </button>
        </div>
      </div>

      {/* 10-Minute Launch Success & Quick Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canlı Web Siteniz:</div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base sm:text-lg font-black text-amber-600 hover:text-amber-700 flex items-center gap-1.5 truncate"
              >
                <span>{siteUrl}</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <button
                onClick={handleCopySiteUrl}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold shrink-0"
                title="Linki Kopyala"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Dükkan QR Kodu İndir</span>
            </button>

            <button
              onClick={() => setShowMapsGuideModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Google Haritalar'a Ekle</span>
            </button>
          </div>
        </div>

        {/* 10-Minute Success Checklist */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>10 Dakikalık Hızlı Başarı Kontrol Listesi</span>
            </span>
            <span className="text-amber-600">{completedCount} / {totalTasks} Tamamlandı</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div
              onClick={() => toggleTask("published")}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                completedTasks.published ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                completedTasks.published ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {completedTasks.published ? "✓" : "1"}
              </div>
              <div className="text-xs font-semibold">Web Siteniz 0.02s Hızla Yayında</div>
            </div>

            <div
              onClick={() => toggleTask("whatsappChecked")}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                completedTasks.whatsappChecked ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                completedTasks.whatsappChecked ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {completedTasks.whatsappChecked ? "✓" : "2"}
              </div>
              <div className="text-xs font-semibold">Telefon & WhatsApp Test Edildi</div>
            </div>

            <div
              onClick={() => toggleTask("firstItemAdded")}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                completedTasks.firstItemAdded ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                completedTasks.firstItemAdded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {completedTasks.firstItemAdded ? "✓" : "3"}
              </div>
              <div className="text-xs font-semibold">Hizmet veya Ürün Fiyatları Girildi</div>
            </div>

            <div
              onClick={() => {
                toggleTask("qrDownloaded");
                setShowQrModal(true);
              }}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                completedTasks.qrDownloaded ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                completedTasks.qrDownloaded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {completedTasks.qrDownloaded ? "✓" : "4"}
              </div>
              <div className="text-xs font-semibold">Dükkan QR Masa Kartviziti İndirildi</div>
            </div>

            <div
              onClick={() => {
                toggleTask("googleMapsAdded");
                setShowMapsGuideModal(true);
              }}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                completedTasks.googleMapsAdded ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                completedTasks.googleMapsAdded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {completedTasks.googleMapsAdded ? "✓" : "5"}
              </div>
              <div className="text-xs font-semibold">Google Haritalar'a Web Sitesi Eklendi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Google Lighthouse Performance Score & Core Web Vitals Gauge Widget */}
      <PerformanceScoreGaugeWidget
        config={config}
        onChange={onChange}
        onNavigateTab={(tab) => {
          if (onNavigateTab) {
            onNavigateTab(tab);
          } else {
            onSwitchToAdvanced();
          }
        }}
      />

      {/* AI-Driven Blog & SEO Engine Quick Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Yapay Zeka Blog & Yerel SEO Motoru</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            {config.sector || "Sektörünüz"} İçin Google'da İlk Sıraya Oynayan SEO Makalesi Üretin
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {config.city || "Şehriniz"} bölgesindeki aramalarda öne çıkmak için yapay zeka ile otomatik H1-H3 başlıkları, SERP meta etiketleri ve SSS şeması içeren uzun soluklu blog makaleleri yayınlayın.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab("ai-blog-engine");
            } else {
              onSwitchToAdvanced();
            }
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Yapay Zeka Blog Motorunu Aç</span>
        </button>
      </div>

      {/* 4 Super-Simple Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: PHONE, WHATSAPP & ADDRESS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">1. Telefon, WhatsApp & Adres</h2>
              <p className="text-xs text-slate-500">Müşterilerinizin size tek tıkla ulaşacağı bilgiler</p>
            </div>
          </div>

          <form onSubmit={handleQuickSaveContact} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşletme / Firma Unvanı</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arama Telefonu</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Sipariş Hattı</label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres / Dükkan Konumu</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Çalışma Saatleri</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>İletişim Bilgilerimi Kaydet</span>
            </button>
          </form>
        </div>

        {/* CARD 2: SERVICES & PRODUCTS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">2. Hizmet & Fiyat Listem</h2>
                  <p className="text-xs text-slate-500">Müşterilerinizin göreceği hizmetler</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickAddService}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hizmet Ekle</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {(config.services?.items || []).map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{s.title}</div>
                    <div className="text-[11px] text-amber-600 font-extrabold">{s.price || "Fiyat Sorun"}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {(config.services?.items || []).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  Henüz hizmet eklenmedi. "Hizmet Ekle" butonuna tıklayarak ilk hizmetinizi yazın.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Toplam {config.services?.items?.length || 0} Hizmet Yayında</span>
            <button
              onClick={onSwitchToAdvanced}
              className="text-amber-600 font-bold hover:underline"
            >
              Fotoğraflı Katalog Yönetimi →
            </button>
          </div>
        </div>

        {/* CARD 3: INCOMING LEADS (MÜŞTERİ TALEPLERİ) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">3. Web Sitenizden Gelen Müşteriler</h2>
                <p className="text-xs text-slate-500">Form dolduran veya teklif isteyen müşteriler</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAnalytics && (
                <button
                  type="button"
                  id="simple-open-analytics-btn"
                  onClick={onOpenAnalytics}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Recharts ile grafiksel lead ve ziyaretçi analitiğini görüntüleyin"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Grafikler</span>
                </button>
              )}
              {onOpenExportModal && (
                <button
                  type="button"
                  id="simple-export-hub-btn"
                  onClick={onOpenExportModal}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Katalog ve müşteri taleplerini Excel veya CSV olarak indirin"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                  <span>Excel / CSV</span>
                </button>
              )}
              {onExportLeads && !onOpenExportModal && (
                <button
                  type="button"
                  id="simple-export-leads-btn"
                  onClick={onExportLeads}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Gelen form taleplerini CSV dosyası olarak indirin"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export Leads</span>
                </button>
              )}
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                {config.leads?.length || 0} Talep
              </span>
            </div>
          </div>

          {/* Revenue tracker summary banner in Simple Mode */}
          {totalCompletedRevenue > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Tamamlanan Satış Cirosu</div>
                  <div className="text-base font-black text-emerald-950">
                    ₺{totalCompletedRevenue.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  {completedDealsCount} Başarılı Anlaşma
                </span>
                <button
                  type="button"
                  onClick={onSwitchToAdvanced}
                  className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Yönetim Masası →
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {(config.leads || []).map((lead) => (
              <div
                key={lead.id}
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  lead.status === "closed" ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{lead.name}</span>
                    {(lead.isRead === false || (lead.isRead === undefined && lead.status === "new")) && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                        YENİ TALEP
                      </span>
                    )}
                    {lead.status === "closed" && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Satış: ₺{(lead.dealValue || 0).toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{lead.date}</div>
                </div>
                <div className="text-xs text-slate-600">{lead.message}</div>

                {/* CRM Tags Badges */}
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {lead.tags.map((tag) => {
                      const customTagObj = lead.customTags?.find(ct => ct.name.toLowerCase() === tag.toLowerCase());
                      const color = getLeadTagStyle(tag, customTagObj?.color);
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${color.dot}`} />
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Private Notes preview banner (if exists) */}
                {(lead.privateNotes || lead.dealNotes) && (
                  <div
                    onClick={() => onOpenLeadDetail?.(lead)}
                    className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-1.5 cursor-pointer hover:bg-amber-100/70 transition-colors"
                    title="Dahili özel notları ve talep detayını aç"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 text-[11px]">
                      <span className="font-bold text-amber-900 dark:text-amber-300 mr-1">Dahili Not:</span>
                      <span className="italic text-slate-700 dark:text-slate-300 line-clamp-1">
                        "{lead.privateNotes || lead.dealNotes}"
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {onOpenLeadDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenLeadDetail(lead)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        lead.privateNotes || lead.dealNotes
                          ? "bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200"
                          : "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
                      }`}
                      title="Müşteri talep detayları ve dahili özel notları aç"
                    >
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>Detay & Notlar</span>
                      {(lead.privateNotes || lead.dealNotes) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  )}

                  <a
                    href={`tel:${lead.phone}`}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-amber-400" />
                    <span>Ara: {lead.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Merhaba Sayın ${lead.name}, ${config.companyName} web sitemiz üzerinden ilettiğiniz talebinizle ilgili ulaşıyoruz.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}

            {(config.leads || []).length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                Henüz web sitenizden yeni talep gelmedi. Müşteriler form doldurduğunda anında burada görünecek.
              </div>
            )}

            {(config.leads || []).length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Toplam {(config.leads || []).length} Müşteri Talebi</span>
                <div className="flex items-center gap-3">
                  {onOpenAutomatedResponses && (
                    <button
                      type="button"
                      onClick={onOpenAutomatedResponses}
                      className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Otomatik Yanıtlar (Automated Responses) →</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchToAdvanced();
                      if (onOpenLeads) {
                        onOpenLeads();
                      }
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Tüm Talepleri Yönet →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: INSTANT PUBLISH & SHARE */}
        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">4. Değişiklikleri Canlıya Gönder</h2>
                <p className="text-xs text-slate-400">Yaptığınız değişiklikler 0.02s hızla tüm dünyada güncellenir</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Kaydettiğiniz telefon, adres veya hizmet değişikliklerinin anında canlı sitenizde görünmesi için yeşil butona basmanız yeterlidir.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Son Yayınlanma:</span>
              <span className="font-bold text-emerald-400">{config.cloudflare?.lastDeployedAt || "Bugün"} (Aktif)</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onDeploy}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              <span>Tek Tıkla Canlıya Gönder (0.02s) 🚀</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreview}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Önizle</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(`Merhaba! ${config.companyName} olarak yeni ve hızlı web sitemizi inceleyebilirsiniz: ${siteUrl}`);
                  window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-700/50"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Paylaş</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== QR CODE MODAL ==================== */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Masa & Dükkan Vitrin Kartı</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-amber-500 text-slate-950 border-4 border-slate-950 shadow-xl space-y-4">
              <div className="text-lg font-black">{config.companyName}</div>
              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl mx-auto border-2 border-slate-950 flex flex-col items-center justify-center shadow-inner relative">
                {merchantQrDataUrl ? (
                  <img
                    src={merchantQrDataUrl}
                    alt="Canlı QR Kodu"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                    QR Üretiliyor...
                  </div>
                )}
              </div>
              <div className="text-xs font-extrabold font-mono truncate">{siteUrl}</div>
              <div className="text-[11px] font-bold text-slate-900">
                🚀 Menü, Fiyat Listesi & WhatsApp İletişim İçin Okutunuz
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!merchantQrDataUrl) return;
                  const a = document.createElement("a");
                  a.href = merchantQrDataUrl;
                  a.download = `${config.companyName || "site"}_qr_kodu.png`;
                  a.click();
                  setCompletedTasks(prev => ({ ...prev, qrDownloaded: true }));
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>PNG Olarak İndir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  setCompletedTasks(prev => ({ ...prev, qrDownloaded: true }));
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Yazdır / PDF</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  onSwitchToAdvanced();
                }}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Gelişmiş QR & Vitrin Tasarım Kitini Aç →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GOOGLE MAPS GUIDE MODAL ==================== */}
      {showMapsGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Google Haritalar'a Web Sitenizi Ekleyin (1 Dk)</h3>
              </div>
              <button
                onClick={() => setShowMapsGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google Haritalar işletme profilinize web sitenizi eklediğinizde yerel aramalarda 3 kat daha fazla müşteri kazanırsınız.
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                <div>
                  <strong>Google Haritalar veya Google İşletmem</strong> uygulamasını açın ve profilinizi düzenleyin.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                <div className="space-y-1">
                  <div><strong>Web Sitesi</strong> kutucuğuna şu linki yapıştırın:</div>
                  <div className="p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-amber-700 select-all">
                    {siteUrl}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                <div>
                  <strong>Kaydet</strong> butonuna basın. Müşterileriniz artık Google'dan doğrudan web sitenize ve WhatsApp'ınıza ulaşacak!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMapsGuideModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Anladım, Teşekkürler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
