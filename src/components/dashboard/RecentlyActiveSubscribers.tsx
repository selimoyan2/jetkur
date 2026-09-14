import React, { useState, useMemo } from "react";
import { NewsletterSubscriber, FormLead } from "../../types";
import {
  Users,
  Search,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Tag,
  Copy,
  Check,
  Send,
  Plus,
  X,
  FileText,
  DollarSign,
  ArrowRight
} from "lucide-react";

interface RecentlyActiveSubscribersProps {
  subscribers: NewsletterSubscriber[];
  leads: FormLead[];
  onNavigateToLeads?: (leadId?: string) => void;
  onOpenLeadDetail?: (lead: FormLead) => void;
  onDirectEmail?: (email: string, name?: string, context?: string) => void;
  onSimulateFormInteraction?: (
    email: string,
    name: string,
    service: string,
    message: string,
    dealValue: number
  ) => void;
}

export interface ActiveSubscriberRecord {
  subscriber: NewsletterSubscriber;
  latestLead?: FormLead;
  matchingLeads: FormLead[];
  interactionCount: number;
  lastInteractionAt: string;
  lastService: string;
  lastSource: string;
  lastMessage: string;
  dealValue: number;
  leadStatus?: string;
  engagementTier: "high" | "warm" | "standard";
}

export const RecentlyActiveSubscribers: React.FC<RecentlyActiveSubscribersProps> = ({
  subscribers,
  leads,
  onNavigateToLeads,
  onOpenLeadDetail,
  onDirectEmail,
  onSimulateFormInteraction
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "today" | "vip" | "open">("all");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Simulation form states
  const [simEmail, setSimEmail] = useState("");
  const [simName, setSimName] = useState("");
  const [simService, setSimService] = useState("7/24 Şehir İçi Oto Çekici");
  const [simDealValue, setSimDealValue] = useState(1250);
  const [simMessage, setSimMessage] = useState("Web sitenizdeki teklif formunu doldurarak fiyat bilgisi almak istedim.");

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Cross-reference subscribers with leads to build active list
  const activeSubscribersList = useMemo<ActiveSubscriberRecord[]>(() => {
    const list: ActiveSubscriberRecord[] = [];

    // Map leads by lowercased email
    const leadsByEmail = new Map<string, FormLead[]>();
    leads.forEach((l) => {
      if (l.email) {
        const cleanEmail = l.email.trim().toLowerCase();
        const existing = leadsByEmail.get(cleanEmail) || [];
        existing.push(l);
        leadsByEmail.set(cleanEmail, existing);
      }
    });

    subscribers.forEach((sub) => {
      const cleanEmail = sub.email.trim().toLowerCase();
      const matchedLeads = leadsByEmail.get(cleanEmail) || [];

      // If subscriber has matched leads OR explicit lastInteractionAt
      if (matchedLeads.length > 0 || sub.lastInteractionAt) {
        const latestLead = matchedLeads[0];
        const interactionCount = Math.max(matchedLeads.length, sub.interactionCount || 1);
        const lastInteractionAt = latestLead?.date || sub.lastInteractionAt || sub.subscribedAt || "Bilinmiyor";
        const lastService = latestLead?.serviceOrProduct || sub.lastInteractionType || "E-Bülten Kayıt & Teklif";
        const lastSource = latestLead?.sourcePage || sub.source || "Web Formu";
        const lastMessage = latestLead?.message || "E-bülten abonesi olarak web formu üzerinden talep iletti.";
        const dealValue = matchedLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

        // Calculate engagement tier
        let engagementTier: "high" | "warm" | "standard" = "standard";
        if (dealValue >= 1500 || interactionCount >= 2 || sub.tags?.includes("VIP")) {
          engagementTier = "high";
        } else if (
          lastInteractionAt.includes("Bugün") ||
          lastInteractionAt.includes("Dün") ||
          latestLead?.status === "new"
        ) {
          engagementTier = "warm";
        }

        list.push({
          subscriber: sub,
          latestLead,
          matchingLeads: matchedLeads,
          interactionCount,
          lastInteractionAt,
          lastService,
          lastSource,
          lastMessage,
          dealValue,
          leadStatus: latestLead?.status || "contacted",
          engagementTier
        });
      }
    });

    // Sort by recency: "Bugün" first, then "Dün", then others
    return list.sort((a, b) => {
      const getPriority = (dateStr: string) => {
        if (dateStr.includes("Bugün")) return 3;
        if (dateStr.includes("Dün")) return 2;
        return 1;
      };
      const pA = getPriority(a.lastInteractionAt);
      const pB = getPriority(b.lastInteractionAt);
      if (pA !== pB) return pB - pA;
      return b.dealValue - a.dealValue;
    });
  }, [subscribers, leads]);

  // Filter list
  const filteredList = useMemo(() => {
    return activeSubscribersList.filter((item) => {
      // Tab filter
      if (activeTabFilter === "today") {
        const isRecent = item.lastInteractionAt.includes("Bugün") || item.lastInteractionAt.includes("Dün");
        if (!isRecent) return false;
      } else if (activeTabFilter === "vip") {
        if (item.engagementTier !== "high" && item.dealValue < 1500) return false;
      } else if (activeTabFilter === "open") {
        if (item.leadStatus === "closed") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEmail = item.subscriber.email.toLowerCase().includes(q);
        const matchesName = item.subscriber.name?.toLowerCase().includes(q);
        const matchesService = item.lastService.toLowerCase().includes(q);
        const matchesMessage = item.lastMessage.toLowerCase().includes(q);
        return matchesEmail || matchesName || matchesService || matchesMessage;
      }

      return true;
    });
  }, [activeSubscribersList, activeTabFilter, searchQuery]);

  // Handle simulation submit
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) {
      alert("Lütfen bir e-posta adresi giriniz.");
      return;
    }

    if (onSimulateFormInteraction) {
      onSimulateFormInteraction(
        simEmail.trim(),
        simName.trim() || "Web Ziyaretçisi",
        simService,
        simMessage,
        Number(simDealValue) || 1000
      );
    }

    setIsSimulateModalOpen(false);
  };

  const openSimulateForSubscriber = (sub: NewsletterSubscriber) => {
    setSimEmail(sub.email);
    setSimName(sub.name || "");
    setIsSimulateModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-sky-50/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Son Etkileşimde Bulunan Aboneler (Form Hareketleri)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
              {activeSubscribersList.length} Aktif Müşteri
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            E-bülten listenizde kayıtlı olup web sitenizdeki formları doldurarak teklif isteyen veya mesaj gönderen aboneleriniz.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-simulate-form-interaction"
            onClick={() => {
              if (subscribers.length > 0) {
                const randomSub = subscribers[0];
                setSimEmail(randomSub.email);
                setSimName(randomSub.name || "");
              }
              setIsSimulateModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Herhangi bir abonenin form doldurmasını simüle edin"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            <span>Form Etkileşimi Simüle Et</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Tab Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            id="btn-filter-active-all"
            onClick={() => setActiveTabFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTabFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Tüm Etkileşimdekiler ({activeSubscribersList.length})
          </button>
          <button
            type="button"
            id="btn-filter-active-today"
            onClick={() => setActiveTabFilter("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTabFilter === "today"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Bugün & Dün
          </button>
          <button
            type="button"
            id="btn-filter-active-vip"
            onClick={() => setActiveTabFilter("vip")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTabFilter === "vip"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            VIP & Yüksek Teklif
          </button>
          <button
            type="button"
            id="btn-filter-active-open"
            onClick={() => setActiveTabFilter("open")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTabFilter === "open"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Açık Talepler
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Abone adı, e-posta veya servis ara..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      {/* List Content */}
      {filteredList.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Etkileşimde bulunan abone bulunamadı</h4>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? "Arama kriterlerinize uyan kayıt bulunamadı."
                : "E-bülten aboneleriniz web sitenizdeki formları doldurduğunda burada anında görüntülenecektir."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>İlk Form Etkileşimini Simüle Et</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredList.map((record) => {
            const { subscriber, latestLead, lastInteractionAt, lastService, lastSource, lastMessage, dealValue, engagementTier, interactionCount } = record;
            const initials = (subscriber.name || subscriber.email).slice(0, 2).toUpperCase();

            return (
              <div
                key={subscriber.id}
                className="p-4 sm:p-5 hover:bg-slate-50/90 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left: Subscriber Profile */}
                <div className="flex items-start gap-3 min-w-[240px]">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200 shrink-0">
                      {initials}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
                      title="Aktif Form Etkileşimi Var"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {subscriber.name || subscriber.email.split("@")[0]}
                      </span>
                      {engagementTier === "high" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          🔥 VIP
                        </span>
                      )}
                      {engagementTier === "warm" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          ⚡ Sıcak
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <span>{subscriber.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(subscriber.email)}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        title="E-postayı Kopyala"
                      >
                        {copiedEmail === subscriber.email ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {latestLead?.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{latestLead.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center: Form Interaction Details Card */}
                <div className="flex-1 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold flex items-center gap-1 border border-sky-200">
                        <FileText className="w-3 h-3" />
                        {lastSource}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {lastService}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {dealValue > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono border border-emerald-200">
                          {dealValue.toLocaleString("tr-TR")} ₺ Teklif
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {lastInteractionAt}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{lastMessage}"
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      Toplam {interactionCount} form başvurusu
                    </span>
                    <span>•</span>
                    <span>
                      Abone Kayıt: {subscriber.subscribedAt}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {latestLead && (
                    <button
                      type="button"
                      id={`btn-view-lead-${subscriber.id}`}
                      onClick={() => {
                        if (onOpenLeadDetail && latestLead) {
                          onOpenLeadDetail(latestLead);
                        } else if (onNavigateToLeads) {
                          onNavigateToLeads(latestLead.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                      title="CRM'de bu müşterinin form detaylarını inceleyin"
                    >
                      <span>Form Talebini Gör</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onDirectEmail) {
                        onDirectEmail(subscriber.email, subscriber.name, lastService);
                      } else {
                        window.open(
                          `mailto:${subscriber.email}?subject=Teklifiniz Hakkında - ${lastService}`,
                          "_blank"
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                    title="Bu aboneye özel doğrudan e-posta gönderin"
                  >
                    <Mail className="w-3 h-3 text-purple-600" />
                    <span>E-posta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openSimulateForSubscriber(subscriber)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Bu abone için yeni bir form hareketi ekle"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulation Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Form Etkileşimi Simülatörü
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Aboneye bağlı yeni bir form talebi oluşturun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Abone E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  placeholder="ornek@musteri.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Müşteri Adı Soyadı
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Talep Edilen Hizmet
                  </label>
                  <select
                    value={simService}
                    onChange={(e) => setSimService(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="7/24 Şehir İçi Oto Çekici">7/24 Şehir İçi Oto Çekici</option>
                    <option value="Ahtapot Vinçli Kurtarıcı">Ahtapot Vinçli Kurtarıcı</option>
                    <option value="Yerinde Akü Takviye & Değişim">Yerinde Akü Takviye</option>
                    <option value="Şehirlerarası Özel Araç Transferi">Şehirlerarası Araç Transferi</option>
                    <option value="Genel Fiyat Teklifi">Genel Fiyat Teklifi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tahmini Teklif (₺)
                  </label>
                  <input
                    type="number"
                    value={simDealValue}
                    onChange={(e) => setSimDealValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Form Mesajı
                </label>
                <textarea
                  rows={2}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  id="btn-submit-simulated-lead"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Form Gönderimini Simüle Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
