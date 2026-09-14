import React, { useState, useMemo } from "react";
import { SiteConfig, NewsletterSubscriber, NewsletterConfig, FormLead } from "../../types";
import { downloadSubscribersCsv } from "../../utils/csvExport";
import { SubscriberGrowthChart } from "./SubscriberGrowthChart";
import { RecentlyActiveSubscribers } from "./RecentlyActiveSubscribers";
import {
  Mail,
  Users,
  UserPlus,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Sliders,
  Send,
  Sparkles,
  Eye,
  Copy,
  Check,
  X,
  Save,
  ShieldCheck,
  TrendingUp,
  Layout,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from "lucide-react";

interface NewsletterManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToLeads?: (leadId?: string) => void;
  onOpenLeadDetail?: (lead: FormLead) => void;
  onNavigateToMarketingAutomation?: () => void;
}

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateToLeads,
  onOpenLeadDetail,
  onNavigateToMarketingAutomation
}) => {
  // Ensure newsletter settings exist with robust fallbacks
  const newsletterConfig: NewsletterConfig = config.newsletter || {
    enabled: true,
    badge: "E-Bülten Aboneliği",
    title: "Kampanyalar ve İndirimlerden İlk Siz Haberdar Olun",
    subtitle: `${config.companyName || "Firmamız"} tarafından sunulan özel avantajlar, kampanyalar ve sektörel duyurular doğrudan e-postanıza gelsin.`,
    buttonText: "Abone Ol",
    placeholder: "E-posta adresinizi giriniz...",
    successMessage: "Harika! E-bülten listemize başarıyla kaydoldunuz.",
    privacyNote: "Spam göndermiyoruz. İstediğiniz zaman tek tıkla ayrılabilirsiniz.",
    displayLocation: "both"
  };

  const subscribers: NewsletterSubscriber[] = config.subscribers || [];

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<NewsletterSubscriber>>({
    email: "",
    name: "",
    source: "Manuel Eklendi",
    status: "active",
    tags: ["Müşteri"]
  });

  // Campaign composer states
  const [campaignSubject, setCampaignSubject] = useState(
    `${config.companyName || "Firmamız"} - Özel İndirimler & Yeni Hizmetlerimiz`
  );
  const [campaignBody, setCampaignBody] = useState(
    `Değerli Müşterimiz,\n\n${config.companyName} olarak sizler için hazırladığımız güncel kampanyalar ve fırsatları paylaşmaktan mutluluk duyuyoruz.\n\nDetaylı bilgi ve randevu/sipariş için web sitemizi ziyaret edebilir veya WhatsApp hattımızdan bize ulaşabilirsiniz.\n\nİyi günler dileriz,\n${config.companyName} Ekibi`
  );

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to update full config
  const updateNewsletterConfig = (updates: Partial<NewsletterConfig>) => {
    onChange({
      ...config,
      newsletter: {
        ...newsletterConfig,
        ...updates
      }
    });
  };

  const updateSubscribers = (newSubscribers: NewsletterSubscriber[]) => {
    onChange({
      ...config,
      subscribers: newSubscribers
    });
  };

  // Toggle main form enabled/disabled
  const handleToggleEnabled = () => {
    const nextState = !newsletterConfig.enabled;
    updateNewsletterConfig({ enabled: nextState });
    showToast(
      nextState
        ? "E-bülten kayıt formu web sitenizde aktifleştirildi."
        : "E-bülten kayıt formu web sitenizde pasif yapıldı."
    );
  };

  // Open modal for new subscriber
  const handleOpenAdd = () => {
    setEditingSubscriber(null);
    setFormData({
      email: "",
      name: "",
      source: "Manuel Eklendi",
      status: "active",
      tags: ["Müşteri"]
    });
    setAddModalOpen(true);
  };

  // Open modal for editing subscriber
  const handleOpenEdit = (sub: NewsletterSubscriber) => {
    setEditingSubscriber(sub);
    setFormData({
      email: sub.email,
      name: sub.name || "",
      source: sub.source || "Web Sitesi E-Bülten Formu",
      status: sub.status,
      tags: sub.tags || ["Müşteri"]
    });
    setAddModalOpen(true);
  };

  // Save subscriber
  const handleSaveSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email?.trim() || !formData.email.includes("@")) {
      alert("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    if (editingSubscriber) {
      const updated = subscribers.map((s) =>
        s.id === editingSubscriber.id
          ? {
              ...s,
              email: cleanEmail,
              name: formData.name?.trim() || "",
              source: formData.source || s.source,
              status: formData.status || "active",
              tags: formData.tags || s.tags
            }
          : s
      );
      updateSubscribers(updated);
      showToast("Abone bilgileri başarıyla güncellendi.");
    } else {
      // Check for duplicate
      if (subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
        alert("Bu e-posta adresi zaten listenizde kayıtlıdır.");
        return;
      }

      const newSub: NewsletterSubscriber = {
        id: `sub-${Date.now()}`,
        email: cleanEmail,
        name: formData.name?.trim() || "",
        subscribedAt:
          new Date().toLocaleDateString("tr-TR") +
          " " +
          new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        status: formData.status || "active",
        source: formData.source || "Manuel Eklendi",
        tags: formData.tags || ["Manuel"]
      };

      updateSubscribers([newSub, ...subscribers]);
      showToast("Yeni abone listenize eklendi.");
    }

    setAddModalOpen(false);
  };

  // Toggle single subscriber status (active / unsubscribed)
  const handleToggleSubscriberStatus = (id: string) => {
    const updated = subscribers.map((s) => {
      if (s.id === id) {
        const nextStatus: "active" | "unsubscribed" =
          s.status === "active" ? "unsubscribed" : "active";
        return { ...s, status: nextStatus };
      }
      return s;
    });
    updateSubscribers(updated);
    showToast("Abone durumu güncellendi.");
  };

  // Delete subscriber
  const handleDeleteSubscriber = (id: string, email: string) => {
    if (window.confirm(`${email} adresini listenizden silmek istediğinizden emin misiniz?`)) {
      const updated = subscribers.filter((s) => s.id !== id);
      updateSubscribers(updated);
      showToast("Abone listeden silindi.");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      alert("İndirilecek abone kaydı bulunamadı.");
      return;
    }
    downloadSubscribersCsv(subscribers, config.companyName);
    showToast(`${subscribers.length} adet abone CSV olarak indirildi.`);
  };

  // Copy single email
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
    showToast("E-posta adresi kopyalandı.");
  };

  // Copy all active emails (comma separated for BCC)
  const handleCopyAllActiveEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === "active")
      .map((s) => s.email);

    if (activeEmails.length === 0) {
      alert("Listenizde aktif durumda abone bulunamadı.");
      return;
    }

    const bccString = activeEmails.join(", ");
    navigator.clipboard.writeText(bccString);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast(`${activeEmails.length} adet aktif abone e-postası panoya kopyalandı.`);
  };

  // Seed sample subscribers
  const handleSeedSamples = () => {
    const sampleEmails: NewsletterSubscriber[] = [
      {
        id: `sample-sub-1-${Date.now()}`,
        email: "hakan.ozkan@gmail.com",
        name: "Hakan Özkan",
        subscribedAt: "Dün 14:32",
        status: "active",
        source: "Footer Formu",
        tags: ["Web Sitesi", "Müşteri"]
      },
      {
        id: `sample-sub-2-${Date.now()}`,
        email: "merve.arslan@outlook.com",
        name: "Merve Arslan",
        subscribedAt: "3 gün önce",
        status: "active",
        source: "Ana Sayfa Bölümü",
        tags: ["Kampanya", "Bireysel"]
      },
      {
        id: `sample-sub-3-${Date.now()}`,
        email: "iletisim@akdenizlojistik.com",
        name: "Akdeniz Lojistik Tic.",
        subscribedAt: "1 hafta önce",
        status: "active",
        source: "Footer Formu",
        tags: ["Kurumsal", "VIP"]
      },
      {
        id: `sample-sub-4-${Date.now()}`,
        email: "tolga.yilmaz@yandex.com",
        name: "Tolga Yılmaz",
        subscribedAt: "2 hafta önce",
        status: "active",
        source: "Ana Sayfa Bölümü",
        tags: ["Teklif Talebi"]
      }
    ];

    // Filter out existing emails
    const currentEmails = new Set(subscribers.map((s) => s.email.toLowerCase()));
    const fresh = sampleEmails.filter((s) => !currentEmails.has(s.email.toLowerCase()));

    updateSubscribers([...fresh, ...subscribers]);
    showToast(`${fresh.length} adet gerçekçi örnek abone eklendi!`);
  };

  // Map leads by email for cross-referencing
  const leadsByEmail = useMemo(() => {
    const map = new Map<string, FormLead>();
    (config.leads || []).forEach((lead) => {
      if (lead.email) {
        const emailLower = lead.email.trim().toLowerCase();
        if (!map.has(emailLower)) {
          map.set(emailLower, lead);
        }
      }
    });
    return map;
  }, [config.leads]);

  // Handle simulating new form submission linked to subscriber
  const handleSimulateFormInteraction = (
    email: string,
    name: string,
    service: string,
    message: string,
    dealValue: number
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const newLead: FormLead = {
      id: `lead-sim-${Date.now()}`,
      date: "Bugün " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      name: name || "Web Müşterisi",
      email: cleanEmail,
      phone: "0532 " + Math.floor(100 + Math.random() * 900) + " " + Math.floor(10 + Math.random() * 90) + " " + Math.floor(10 + Math.random() * 90),
      serviceOrProduct: service,
      message: message,
      sourcePage: "Ana Sayfa Teklif Formu",
      status: "new",
      isRead: false,
      dealValue: dealValue || 1250,
      tags: ["Form Talebi", "E-Bülten Abonesi"]
    };

    // Update subscriber with interaction timestamp or add if not in list
    const existingIndex = subscribers.findIndex((s) => s.email.toLowerCase() === cleanEmail);
    let updatedSubs = [...subscribers];

    if (existingIndex >= 0) {
      updatedSubs[existingIndex] = {
        ...updatedSubs[existingIndex],
        lastInteractionAt: "Bugün " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        lastInteractionType: `Form Talebi (${service})`,
        interactionCount: (updatedSubs[existingIndex].interactionCount || 0) + 1
      };
    } else {
      updatedSubs = [
        {
          id: `sub-${Date.now()}`,
          email: cleanEmail,
          name: name || "",
          subscribedAt: "Bugün " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          status: "active",
          source: "Web Teklif Formu",
          tags: ["Müşteri", "Teklif Formu"],
          lastInteractionAt: "Bugün " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          lastInteractionType: `Form Talebi (${service})`,
          interactionCount: 1
        },
        ...updatedSubs
      ];
    }

    onChange({
      ...config,
      leads: [newLead, ...(config.leads || [])],
      subscribers: updatedSubs
    });

    showToast(`${email} için yeni form etkileşimi ve talebi başarıyla simüle edildi!`);
  };

  // Handle opening pre-composed email for recently active subscriber
  const handleDirectEmail = (email: string, name?: string, context?: string) => {
    setCampaignSubject(`${config.companyName || "Firmamız"} - ${context || "Talebiniz Hakkında Bilgilendirme"}`);
    setCampaignBody(
      `Merhaba ${name || "Değerli Müşterimiz"},\n\nWeb sitemiz üzerinden ilettiğiniz ${context || "başvurunuz"} ve e-bülten kaydınız için teşekkür ederiz.\n\nSizin için hazırladığımız özel teklif ve avantajlarımızla ilgili ekibimiz sizinle iletişime geçmeye hazırdır.\n\nSaygılarımızla,\n${config.companyName} Ekibi`
    );
    setCampaignModalOpen(true);
  };

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        sub.email.toLowerCase().includes(q) ||
        (sub.name && sub.name.toLowerCase().includes(q)) ||
        (sub.source && sub.source.toLowerCase().includes(q)) ||
        (sub.tags && sub.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesStatus =
        statusFilter === "all" ? true : sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  // Statistics
  const totalSubscribers = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;
  const activeRate = totalSubscribers > 0 ? Math.round((activeCount / totalSubscribers) * 100) : 100;

  // Compose mailto link
  const activeEmailsList = subscribers.filter((s) => s.status === "active").map((s) => s.email);
  const mailtoLink = `mailto:${config.email || ""}?bcc=${encodeURIComponent(
    activeEmailsList.join(",")
  )}&subject=${encodeURIComponent(campaignSubject)}&body=${encodeURIComponent(campaignBody)}`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>E-Posta Pazarlama & Toplu Bülten</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              E-Bülten Aboneleri & Kampanya Yönetimi
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Ziyaretçilerinizden e-posta toplayın, abone kitlenizi büyütün ve özel kampanya duyurularınızı tek tıkla e-posta pazarlamasına dönüştürün.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Toggle Status Button */}
            <button
              type="button"
              id="btn-toggle-newsletter"
              onClick={handleToggleEnabled}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                newsletterConfig.enabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  newsletterConfig.enabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              <span>{newsletterConfig.enabled ? "Form Sitede Aktif" : "Form Pasif"}</span>
            </button>

            {/* Preview Site Button */}
            {onPreview && (
              <button
                type="button"
                id="btn-preview-newsletter"
                onClick={onPreview}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Sitede İncele</span>
              </button>
            )}

            {/* Campaign Composer Button */}
            <button
              type="button"
              id="btn-open-campaign-modal"
              onClick={() => setCampaignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kampanya / Toplu E-posta</span>
            </button>

            {/* Quick Link to Marketing Automation Panel */}
            {onNavigateToMarketingAutomation && (
              <button
                type="button"
                id="btn-nav-marketing-automation"
                onClick={onNavigateToMarketingAutomation}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="E-bülten kaynak analitiği ve otomatik karşılama serisini yönet"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pazarlama Otomasyonu →</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Abone
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-white">{totalSubscribers}</span>
              <span className="text-xs text-slate-500">Kayıtlı E-Posta</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Aktif Aboneler
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
              <span className="text-xs text-emerald-500 font-bold">({activeRate}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ayrılan / Pasif
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-400">{unsubscribedCount}</span>
              <span className="text-xs text-slate-500">İptal</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              İzinli Pazarlama (KVKK)
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-purple-400 text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>%100 Doğrulanmış</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Abone Büyüme & Etkileşim Trend Grafiği (Growth Trend Chart) */}
      <SubscriberGrowthChart
        subscribers={subscribers}
        leads={config.leads || []}
        companyName={config.companyName}
      />

      {/* 2. Son Etkileşimde Bulunan Aboneler Listesi (Recently Active from Forms) */}
      <RecentlyActiveSubscribers
        subscribers={subscribers}
        leads={config.leads || []}
        onNavigateToLeads={onNavigateToLeads}
        onOpenLeadDetail={onOpenLeadDetail}
        onDirectEmail={handleDirectEmail}
        onSimulateFormInteraction={handleSimulateFormInteraction}
      />

      {/* Form Customization Toggle Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Web Sitesi E-Bülten Formu Metin & Görünüm Ayarları
              </h3>
              <p className="text-[11px] text-slate-500">
                Form başlığı, alt metin, buton yazısı ve sitenizdeki görünüm konumu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-600">
              {showSettings ? "Ayarları Gizle" : "Ayarları Düzenle"}
            </span>
            <div className={`p-1 rounded-lg bg-slate-100 text-slate-500 transition-transform ${showSettings ? "rotate-180" : ""}`}>
              ▼
            </div>
          </div>
        </button>

        {showSettings && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Üst Rozet (Badge)
                </label>
                <input
                  type="text"
                  value={newsletterConfig.badge || ""}
                  onChange={(e) => updateNewsletterConfig({ badge: e.target.value })}
                  placeholder="Örn: E-Bülten Aboneliği"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Form Ana Başlığı
                </label>
                <input
                  type="text"
                  value={newsletterConfig.title || ""}
                  onChange={(e) => updateNewsletterConfig({ title: e.target.value })}
                  placeholder="Örn: Kampanyalardan İlk Siz Haberdar Olun"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Görünüm Konumu (Placement)
                </label>
                <select
                  value={newsletterConfig.displayLocation || "both"}
                  onChange={(e) =>
                    updateNewsletterConfig({
                      displayLocation: e.target.value as "footer" | "section" | "both"
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="both">Hem Footer Hem Ana Sayfa Bölümü (Önerilen)</option>
                  <option value="footer">Sadece Footer İçinde</option>
                  <option value="section">Sadece Özel Ana Sayfa Bölümü</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Açıklama / Alt Başlık Metni
              </label>
              <textarea
                rows={2}
                value={newsletterConfig.subtitle || ""}
                onChange={(e) => updateNewsletterConfig({ subtitle: e.target.value })}
                placeholder="Örn: Özel teklifler ve sektörel duyurular doğrudan e-postanıza gelsin."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Input Placeholder Metni
                </label>
                <input
                  type="text"
                  value={newsletterConfig.placeholder || ""}
                  onChange={(e) => updateNewsletterConfig({ placeholder: e.target.value })}
                  placeholder="Örn: E-posta adresinizi giriniz..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Gönder Butonu Yazısı
                </label>
                <input
                  type="text"
                  value={newsletterConfig.buttonText || ""}
                  onChange={(e) => updateNewsletterConfig({ buttonText: e.target.value })}
                  placeholder="Örn: Abone Ol"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Başarı Mesajı (Bildirim)
                </label>
                <input
                  type="text"
                  value={newsletterConfig.successMessage || ""}
                  onChange={(e) => updateNewsletterConfig({ successMessage: e.target.value })}
                  placeholder="Örn: Harika! E-bülten listemize başarıyla kaydoldunuz."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gizlilik & KVKK Güvence Notu
              </label>
              <input
                type="text"
                value={newsletterConfig.privacyNote || ""}
                onChange={(e) => updateNewsletterConfig({ privacyNote: e.target.value })}
                placeholder="Örn: Asla spam göndermiyoruz. İstediğiniz an tek tıkla abonelikten ayrılabilirsiniz."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Bar: Search, Filter, Add, Export, Copy All */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="E-posta, isim veya kaynak ara..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "unsubscribed")}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-bold focus:outline-none"
          >
            <option value="all">Tüm Durumlar ({totalSubscribers})</option>
            <option value="active">Aktif Aboneler ({activeCount})</option>
            <option value="unsubscribed">Ayrılanlar ({unsubscribedCount})</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Copy All Active Emails */}
          <button
            type="button"
            id="btn-copy-all-subscribers"
            onClick={handleCopyAllActiveEmails}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-800 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            title="Tüm aktif abonelerin e-postalarını BCC olarak panoya kopyalayın"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-purple-600" />}
            <span>{copiedAll ? "Kopyalandı!" : "E-Postaları Kopyala"}</span>
          </button>

          {/* Seed Sample Subscribers */}
          <button
            type="button"
            onClick={handleSeedSamples}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            title="Örnek abone kayıtları yükleyin"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Örnek Yükle</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            id="btn-export-subscribers"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            title="Mailchimp, Brevo veya Excel için CSV formatında indirin"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV İndir</span>
          </button>

          {/* Add Subscriber Button */}
          <button
            type="button"
            id="btn-add-subscriber"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>Abone Ekle</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table / List */}
      {filteredSubscribers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <Mail className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Henüz abone kaydı bulunamadı</h4>
            <p className="text-xs text-slate-500">
              {searchQuery || statusFilter !== "all"
                ? "Arama kriterlerinize uygun abone bulunamadı. Filtreleri temizlemeyi deneyin."
                : "Web sitenizdeki e-bülten kayıt formundan toplanan e-posta adresleri burada listelenecektir. Dilerseniz hemen manuel abone ekleyebilir veya örnek verileri yükleyebilirsiniz."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSeedSamples}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Örnek Aboneleri Yükle</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Manuel Abone Ekle</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Abone E-Posta / İsim</th>
                  <th className="py-3 px-4">Kayıt Tarihi</th>
                  <th className="py-3 px-4">Kaynak & Etiket</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubscribers.map((sub) => {
                  const domain = sub.email.split("@")[1] || "";
                  const initials = (sub.name || sub.email)
                    .slice(0, 2)
                    .toUpperCase();
                  const matchedLead = leadsByEmail.get(sub.email.toLowerCase());

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Email & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-purple-200">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-mono">
                                {sub.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(sub.email)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-opacity"
                                title="E-postayı Kopyala"
                              >
                                {copiedEmail === sub.email ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              {sub.name ? (
                                <span className="font-semibold text-slate-700">{sub.name}</span>
                              ) : (
                                <span className="italic text-slate-400">İsim belirtilmedi</span>
                              )}
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {domain}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subscribed Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {sub.subscribedAt}
                      </td>

                      {/* Source & Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {sub.source || "Web Sitesi"}
                          </span>
                          {matchedLead && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenLeadDetail && matchedLead) {
                                  onOpenLeadDetail(matchedLead);
                                } else if (onNavigateToLeads) {
                                  onNavigateToLeads(matchedLead.id);
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Son Form Etkileşimi: ${matchedLead.serviceOrProduct || "Form Talebi"} (${matchedLead.date}) - CRM'de İncele`}
                            >
                              <span>🔥 Form: {matchedLead.serviceOrProduct ? (matchedLead.serviceOrProduct.length > 16 ? matchedLead.serviceOrProduct.slice(0, 15) + "..." : matchedLead.serviceOrProduct) : "Teklif"}</span>
                            </button>
                          )}
                          {sub.tags &&
                            sub.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSubscriberStatus(sub.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            sub.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Durumu değiştirmek için tıklayın"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{sub.status === "active" ? "Aktif" : "Ayrıldı"}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Send individual mail */}
                          <a
                            href={`mailto:${sub.email}?subject=${encodeURIComponent(
                              `${config.companyName} İletişim`
                            )}`}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-700 transition-colors"
                            title="Doğrudan E-posta Gönder"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Summary */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Gösterilen: <strong className="text-slate-800">{filteredSubscribers.length}</strong> /{" "}
              {totalSubscribers} kayıt
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                {activeCount} Aktif Abone E-postası
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">
                Mailchimp, Brevo veya Excel ile %100 uyumlu CSV
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add or Edit Subscriber */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingSubscriber ? "Abone Bilgilerini Düzenle" : "Yeni Abone Ekle"}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    E-bülten ve e-posta pazarlama listenize kaydedilir.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscriber} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-Posta Adresi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@alanadi.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Abone Adı Soyadı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kaynak (Source)
                  </label>
                  <select
                    value={formData.source || "Manuel Eklendi"}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Manuel Eklendi">Manuel Eklendi</option>
                    <option value="Footer Formu">Footer Formu</option>
                    <option value="Ana Sayfa Bölümü">Ana Sayfa Bölümü</option>
                    <option value="Mağaza / Ofis">Mağaza / Ofis</option>
                    <option value="Telefon / WhatsApp">Telefon / WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Durum (Status)
                  </label>
                  <select
                    value={formData.status || "active"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "unsubscribed"
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="active">✓ Aktif Abone</option>
                    <option value="unsubscribed">✕ Ayrıldı / Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Etiketler (Virgülle Ayırın)
                </label>
                <input
                  type="text"
                  value={(formData.tags || []).join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="Örn: Müşteri, VIP, Kampanya"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSubscriber ? "Değişiklikleri Kaydet" : "Aboneyi Ekle"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Campaign Composer & Bulk Email */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-800 text-purple-300 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Toplu Kampanya E-Postası Hazırlayıcı</h3>
                  <span className="text-[11px] text-purple-200">
                    {activeEmailsList.length} aktif aboneye toplu duyuru veya kampanya gönderin.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-purple-800 text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Recipient Segment Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      Hedef Alıcı Kitlesi: {activeEmailsList.length} Aktif Abone (Gizli BCC)
                    </span>
                    <span className="text-[11px] text-purple-600">
                      Alıcılar birbirlerinin e-posta adreslerini göremez (BCC Gizli Kopya kuralı).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAllActiveEmails}
                  className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>BCC Listesini Kopyala</span>
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-Posta Konusu (Subject)
                </label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="Örn: Özel Yaz İndirimi Başladı!"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-900"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-Posta İçerik Metni (Message Body)
                </label>
                <textarea
                  rows={6}
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  placeholder="Abonelerinize iletmek istediğiniz kampanya ve duyuru metnini yazın..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Canlı E-Posta Önizlemesi</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-3">
                  <div className="border-b border-slate-100 pb-2 text-slate-600">
                    <strong>Kimden:</strong> {config.companyName} &lt;{config.email || "info@alanadi.com"}&gt;
                    <br />
                    <strong>Konu:</strong> {campaignSubject}
                  </div>
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-xs">
                    {campaignBody}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Gmail, Outlook veya Thunderbird gibi istemcinizle tek tıkla açılır.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Kapat
                </button>

                <a
                  href={mailtoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>E-Posta İstemcisinde Aç & Gönder</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
