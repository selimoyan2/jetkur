import React, { useState, useMemo } from "react";
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sliders,
  Send,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Hash,
  Info,
  Phone,
  DollarSign,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { SiteConfig, FormLead, LeadNotificationsConfig, LeadNotificationLog } from "../../types";
import {
  DEFAULT_LEAD_NOTIFICATIONS_CONFIG,
  calculateLeadScore,
  getPriorityLabel,
  getPriorityBadgeStyle
} from "../../utils/leadScoring";
import { dispatchLeadNotification } from "../../utils/leadNotificationDispatcher";

interface NotificationsPanelProps {
  config: SiteConfig;
  onChange: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onNavigateToLeads?: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  config,
  onChange,
  onNavigateToLeads
}) => {
  // Current settings with defaults fallback
  const notifConfig: LeadNotificationsConfig = useMemo(() => {
    return config.leadNotifications || DEFAULT_LEAD_NOTIFICATIONS_CONFIG;
  }, [config.leadNotifications]);

  const [activeSubTab, setActiveSubTab] = useState<"settings" | "scoring" | "history">("settings");
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  // Test states
  const [isSendingSlackTest, setIsSendingSlackTest] = useState(false);
  const [isSendingEmailTest, setIsSendingEmailTest] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
    detail?: string;
  } | null>(null);

  // Scoring Playground State
  const [selectedLeadIdForPlayground, setSelectedLeadIdForPlayground] = useState<string>(
    (config.leads && config.leads[0]?.id) || "sample"
  );
  const [customTestMessage, setCustomTestMessage] = useState(
    "Aracım arıza yaptı, yol yardım ve acil çekici fiyatı alabilir miyim? Bütçemiz ₺3.500 civarı."
  );
  const [customTestDealValue, setCustomTestDealValue] = useState<number>(3500);

  // Helpers to update config
  const updateNotifConfig = (updater: (prev: LeadNotificationsConfig) => LeadNotificationsConfig) => {
    onChange(prev => {
      const current = prev.leadNotifications || DEFAULT_LEAD_NOTIFICATIONS_CONFIG;
      return {
        ...prev,
        leadNotifications: updater(current)
      };
    });
  };

  // Calculate statistics
  const leads = config.leads || [];
  const scoredLeads = useMemo(() => {
    return leads.map(l => ({
      lead: l,
      scoring: calculateLeadScore(l, notifConfig.scoring)
    }));
  }, [leads, notifConfig.scoring]);

  const highPriorityCount = scoredLeads.filter(s => s.scoring.isHighPriority).length;
  const historyLogs = notifConfig.history || [];
  const slackSentCount = historyLogs.filter(h => h.channel === "slack" || h.channel === "both").length;
  const emailSentCount = historyLogs.filter(h => h.channel === "email" || h.channel === "both").length;

  // Selected lead for live playground
  const activePlaygroundLead: FormLead = useMemo(() => {
    const found = leads.find(l => l.id === selectedLeadIdForPlayground);
    if (found) {
      return {
        ...found,
        message: customTestMessage || found.message,
        dealValue: customTestDealValue !== undefined ? customTestDealValue : found.dealValue
      };
    }
    return {
      id: "sample-playground",
      name: "Deniz Yılmaz",
      phone: "0532 888 77 66",
      email: "deniz.yilmaz@firma.com",
      serviceOrProduct: "7/24 Acil Oto Çekici",
      message: customTestMessage,
      dealValue: customTestDealValue,
      tags: ["VIP", "Acil"],
      date: "Bugün 14:20",
      sourcePage: "Canlı Teklif Formu",
      status: "new"
    };
  }, [leads, selectedLeadIdForPlayground, customTestMessage, customTestDealValue]);

  const playgroundScore = useMemo(() => {
    return calculateLeadScore(activePlaygroundLead, notifConfig.scoring);
  }, [activePlaygroundLead, notifConfig.scoring]);

  // Test Actions
  const handleTestSlack = async () => {
    setIsSendingSlackTest(true);
    setTestNotificationFeedback(null);
    try {
      const result = await dispatchLeadNotification(activePlaygroundLead, config, {
        forceSlack: true,
        isTest: true
      });

      if (result.log) {
        updateNotifConfig(prev => ({
          ...prev,
          history: [result.log!, ...(prev.history || [])]
        }));
      }

      setTestNotificationFeedback({
        type: "success",
        message: "Slack Test Bildirimi Başarıyla Oluşturuldu!",
        detail: notifConfig.slack.webhookUrl
          ? `Webhook'a iletildi (${notifConfig.slack.channelName || "#leads-alerts"}).`
          : "Webhook URL boş olduğu için test simülasyon olarak denetim günlüğüne işlendi. Gerçek Slack mesajı için Webhook URL giriniz."
      });
    } catch (err: any) {
      setTestNotificationFeedback({
        type: "error",
        message: "Slack Test Hatası",
        detail: err.message || "Bağlantı sağlanamadı"
      });
    } finally {
      setIsSendingSlackTest(false);
    }
  };

  const handleTestEmail = async () => {
    setIsSendingEmailTest(true);
    setTestNotificationFeedback(null);
    try {
      const result = await dispatchLeadNotification(activePlaygroundLead, config, {
        forceEmail: true,
        isTest: true
      });

      if (result.log) {
        updateNotifConfig(prev => ({
          ...prev,
          history: [result.log!, ...(prev.history || [])]
        }));
      }

      setTestNotificationFeedback({
        type: "success",
        message: "E-Posta Test Bildirimi Başarıyla İletildi!",
        detail: `Alıcı: ${notifConfig.email.recipientEmails || config.email}. Formatlanmış HTML şablonu oluşturuldu ve günlüğe kaydedildi.`
      });
    } catch (err: any) {
      setTestNotificationFeedback({
        type: "error",
        message: "E-posta Test Hatası",
        detail: err.message || "Gönderim başarısız oldu"
      });
    } finally {
      setIsSendingEmailTest(false);
    }
  };

  // Add keyword handler
  const handleAddKeyword = () => {
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;
    const current = notifConfig.scoring?.urgentKeywords || [];
    if (!current.includes(trimmed)) {
      updateNotifConfig(prev => ({
        ...prev,
        scoring: {
          ...prev.scoring,
          urgentKeywords: [...(prev.scoring.urgentKeywords || []), trimmed]
        }
      }));
    }
    setNewKeywordInput("");
  };

  // Remove keyword handler
  const handleRemoveKeyword = (kw: string) => {
    updateNotifConfig(prev => ({
      ...prev,
      scoring: {
        ...prev.scoring,
        urgentKeywords: (prev.scoring.urgentKeywords || []).filter(k => k !== kw)
      }
    }));
  };

  // Add priority tag handler
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const current = notifConfig.scoring?.highPriorityTags || [];
    if (!current.includes(trimmed)) {
      updateNotifConfig(prev => ({
        ...prev,
        scoring: {
          ...prev.scoring,
          highPriorityTags: [...(prev.scoring.highPriorityTags || []), trimmed]
        }
      }));
    }
    setNewTagInput("");
  };

  // Remove priority tag handler
  const handleRemoveTag = (tag: string) => {
    updateNotifConfig(prev => ({
      ...prev,
      scoring: {
        ...prev.scoring,
        highPriorityTags: (prev.scoring.highPriorityTags || []).filter(t => t !== tag)
      }
    }));
  };

  // Clear notification history
  const handleClearHistory = () => {
    if (window.confirm("Bildirim geçmişini temizlemek istediğinize emin misiniz?")) {
      updateNotifConfig(prev => ({
        ...prev,
        history: []
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>AKILLI SATIŞ & LEAD SCORING BİLDİRİM MOTORU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Yüksek Öncelikli Talep Bildirimleri
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Form dolduran her ziyaretçi anında lead scoring (0-100 puan) analizinden geçer.
              Belirlediğiniz eşiği aşan sıcak veya yüksek bütçeli talepler, satış ekibinizin
              Slack kanalına ve e-posta kutusuna gerçek zamanlı olarak iletilir.
            </p>
          </div>

          {/* Master Toggle */}
          <div className="flex flex-col items-end gap-2 shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-xs font-medium text-slate-300">Genel Bildirim Durumu</div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle-master-lead-notifications"
                checked={notifConfig.enabled}
                onChange={e =>
                  updateNotifConfig(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500" />
            </label>
            <span
              className={`text-xs font-bold ${
                notifConfig.enabled ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {notifConfig.enabled ? "Sistem Aktif & Dinliyor" : "Bildirimler Kapalı"}
            </span>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Yüksek Öncelikli Talep
            </div>
            <div className="text-xl font-black text-rose-400 mt-1 flex items-baseline gap-1.5">
              <span>{highPriorityCount}</span>
              <span className="text-xs font-normal text-slate-400">/ {leads.length} talep</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Slack Webhook
            </div>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  notifConfig.slack?.enabled ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span>{notifConfig.slack?.enabled ? "Kanal Bağlı" : "Devre Dışı"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              E-Posta Uyarıları
            </div>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  notifConfig.email?.enabled ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span>{notifConfig.email?.enabled ? "Aktif Alıcılar" : "Devre Dışı"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              İletilen Toplam Bildirim
            </div>
            <div className="text-xl font-black text-indigo-300 mt-1">
              {historyLogs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner if Test Sent */}
      {testNotificationFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm ${
            testNotificationFeedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testNotificationFeedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">{testNotificationFeedback.message}</div>
              {testNotificationFeedback.detail && (
                <div className="text-xs opacity-90 mt-0.5">{testNotificationFeedback.detail}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTestNotificationFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "settings"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Kanal Ayarları (Slack & E-posta)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("scoring")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "scoring"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Lead Scoring & Puanlama Laboratuvarı</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "history"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bildirim Geçmişi & Günlük</span>
            {historyLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-mono">
                {historyLogs.length}
              </span>
            )}
          </button>
        </div>

        {onNavigateToLeads && (
          <button
            type="button"
            onClick={onNavigateToLeads}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Tüm Müşteri Taleplerini Görüntüle</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* TAB 1: NOTIFICATION CHANNELS (SLACK & EMAIL) */}
      {activeSubTab === "settings" && (
        <div className="space-y-6">
          {/* Priority Trigger Filter Setting */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Bildirim Tetikleme Filtresi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hangi taleplerin bildirim kanallarına gönderileceğini seçin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      notifyOnlyHighPriority: true
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    notifConfig.notifyOnlyHighPriority
                      ? "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  🔥 Yalnızca Yüksek Öncelikli (Skor ≥ {notifConfig.scoring?.minScoreForHighPriority || 70})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      notifyOnlyHighPriority: false
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !notifConfig.notifyOnlyHighPriority
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-700 dark:text-indigo-300 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  📋 Tüm Form Talepleri
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLACK INTEGRATION CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Slack Bildirim Kanalı
                    </h3>
                    <p className="text-xs text-slate-500">
                      Yeni sıcak talepleri kurumsal Slack kanalınıza anında aktarın.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-slack-notification"
                    checked={notifConfig.slack?.enabled ?? true}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        slack: {
                          ...prev.slack,
                          enabled: e.target.checked
                        }
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Slack Incoming Webhook URL</span>
                    <span className="text-[10px] text-rose-500 font-semibold">*Zorunlu</span>
                  </label>
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Webhook Nasıl Alınır?</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showWebhookSecret ? "text" : "password"}
                    id="input-slack-webhook-url"
                    value={notifConfig.slack?.webhookUrl || ""}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        slack: {
                          ...prev.slack,
                          webhookUrl: e.target.value
                        }
                      }))
                    }
                    placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Slack App sayfanızdan oluşturduğunuz Incoming Webhook adresini yapıştırın.
                </p>
              </div>

              {/* Channel & Bot Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kanal İsmi
                  </label>
                  <input
                    type="text"
                    value={notifConfig.slack?.channelName || "#leads-alerts"}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        slack: {
                          ...prev.slack,
                          channelName: e.target.value
                        }
                      }))
                    }
                    placeholder="#leads-alerts"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Bot Görünen İsmi
                  </label>
                  <input
                    type="text"
                    value={notifConfig.slack?.botName || "HızlıWeb CRM Bot"}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        slack: {
                          ...prev.slack,
                          botName: e.target.value
                        }
                      }))
                    }
                    placeholder="HızlıWeb CRM Bot"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Slack Message Mock Preview */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Gelen Slack Mesajı Görünüm Önizlemesi
                </label>
                <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 text-xs font-sans space-y-2 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      #
                    </span>
                    <span className="font-bold text-indigo-400">
                      {notifConfig.slack?.botName || "HızlıWeb CRM Bot"}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      APP
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">14:24</span>
                  </div>

                  <div className="border-l-4 border-rose-500 pl-3 py-1 space-y-1.5">
                    <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span>🚨</span>
                      <span>YÜKSEK ÖNCELİK MÜŞTERİ TALEBİ (Skor: 85/100)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
                      <div>
                        <strong>👤 Müşteri:</strong> Deniz Yılmaz
                      </div>
                      <div>
                        <strong>📞 Tel:</strong> 0532 888 77 66
                      </div>
                      <div>
                        <strong>🛠️ Hizmet:</strong> 7/24 Acil Oto Çekici
                      </div>
                      <div>
                        <strong>💰 Tutar:</strong> ₺3.500
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg italic">
                      "Aracım arıza yaptı, yol yardım ve acil çekici fiyatı alabilir miyim?..."
                    </div>
                  </div>
                </div>
              </div>

              {/* Slack Test Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {notifConfig.slack?.webhookUrl
                    ? "Webhook adresi girildi, teste hazır."
                    : "Webhook girilmediğinde test simülasyon olarak kaydedilir."}
                </span>

                <button
                  type="button"
                  id="btn-test-slack-lead-notification"
                  disabled={isSendingSlackTest}
                  onClick={handleTestSlack}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingSlackTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Slack Test Bildirimi Gönder</span>
                </button>
              </div>
            </div>

            {/* EMAIL NOTIFICATIONS CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 border border-rose-100 dark:border-rose-800">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      E-Posta Uyarı Bildirimleri
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sıcak talepleri yöneticilere ve satış temsilcilerine anında postalayın.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-email-notification"
                    checked={notifConfig.email?.enabled ?? true}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          enabled: e.target.checked
                        }
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
                </label>
              </div>

              {/* Recipient Emails */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Alıcı E-Posta Adresleri</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Virgülle ayırarak birden çok e-posta yazabilirsiniz
                  </span>
                </label>
                <input
                  type="text"
                  id="input-notification-recipient-emails"
                  value={notifConfig.email?.recipientEmails || ""}
                  onChange={e =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        recipientEmails: e.target.value
                      }
                    }))
                  }
                  placeholder="selimoyan@gmail.com, satis@sirketiniz.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[11px] text-slate-400">
                  Yeni bir yüksek öncelikli form geldiğinde yukarıdaki tüm adreslere uyarı gönderilir.
                </p>
              </div>

              {/* Subject Template */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  E-Posta Konu Başlığı Şablonu
                </label>
                <input
                  type="text"
                  value={
                    notifConfig.email?.subjectTemplate ||
                    "🚨 [YÜKSEK ÖNCELİK - Skor: {score}/100] Yeni Talep: {customer_name}"
                  }
                  onChange={e =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        subjectTemplate: e.target.value
                      }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                  <span>Kullanılabilir Etiketler:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                    {"{customer_name}"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                    {"{score}"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                    {"{service}"}
                  </span>
                </div>
              </div>

              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gönderen Adı
                </label>
                <input
                  type="text"
                  value={notifConfig.email?.senderName || "HızlıWeb CRM Bildirim Sistemi"}
                  onChange={e =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        senderName: e.target.value
                      }
                    }))
                  }
                  placeholder="HızlıWeb CRM Bildirim Sistemi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Email Mock Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  E-Posta Şablon Özeti
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>🚨 [YÜKSEK ÖNCELİK - Skor: 85/100] Yeni Talep: Deniz Yılmaz</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      HTML
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    İçerik: Müşteri bilgileri, telefonla arama butonu, doğrudan WhatsApp bağlantısı ve puanlama nedenleri.
                  </div>
                </div>
              </div>

              {/* Email Test Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Aktif Alıcı: {notifConfig.email?.recipientEmails?.split(",")[0] || "selimoyan@gmail.com"}
                </span>

                <button
                  type="button"
                  id="btn-test-email-lead-notification"
                  disabled={isSendingEmailTest}
                  onClick={handleTestEmail}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmailTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>Test E-Postası Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAD SCORING RULES & PLAYGROUND */}
      {activeSubTab === "scoring" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rules Configuration (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lead Scoring Kriterleri & Ağırlıklar
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">0 - 100 Puan Skalası</span>
              </div>

              {/* Min Score for High Priority Slider */}
              <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Yüksek Öncelik Eşik Puanı (Threshold)</span>
                  </label>
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white font-extrabold text-xs font-mono shadow-xs">
                    {notifConfig.scoring?.minScoreForHighPriority ?? 70} Puan
                  </span>
                </div>

                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={notifConfig.scoring?.minScoreForHighPriority ?? 70}
                  onChange={e =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      scoring: {
                        ...prev.scoring,
                        minScoreForHighPriority: Number(e.target.value)
                      }
                    }))
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Hassas (50 Puan - Daha Çok Bildirim)</span>
                  <span>Önerilen: 70 Puan</span>
                  <span>Çok Seçici (90 Puan - Yalnızca VIP)</span>
                </div>
              </div>

              {/* High Deal Value Threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Yüksek Satış / Ciro Bütçe Eşiği (TL)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₺
                  </span>
                  <input
                    type="number"
                    step={250}
                    value={notifConfig.scoring?.highDealValueThreshold ?? 2500}
                    onChange={e =>
                      updateNotifConfig(prev => ({
                        ...prev,
                        scoring: {
                          ...prev.scoring,
                          highDealValueThreshold: Number(e.target.value) || 0
                        }
                      }))
                    }
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Bu tutar ve üzerindeki talepler +25 ila +35 ek puan kazanır.
                </p>
              </div>

              {/* Urgent & High Intent Keywords */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Acil & Sıcak Niyetli Anahtar Kelimeler (+15 ila +25 Puan)</span>
                  <span className="text-[11px] text-slate-400">
                    {(notifConfig.scoring?.urgentKeywords || []).length} kelime
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[52px]">
                  {(notifConfig.scoring?.urgentKeywords || []).map(kw => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 shadow-2xs"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-rose-600 cursor-pointer"
                        title="Kelimeyi kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add keyword input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={e => setNewKeywordInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddKeyword()}
                    placeholder="Yeni anahtar kelime ekle (örn: anında, randevu, keşif)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </button>
                </div>
              </div>

              {/* Priority CRM Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Öncelikli CRM Etiketleri (+20 Puan)</span>
                  <span className="text-[11px] text-slate-400">
                    {(notifConfig.scoring?.highPriorityTags || []).length} etiket
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[52px]">
                  {(notifConfig.scoring?.highPriorityTags || []).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800 shadow-2xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600 cursor-pointer"
                        title="Etiketi kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddTag()}
                    placeholder="Yeni CRM etiketi (örn: Sıcak Müşteri, Kurumsal)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </button>
                </div>
              </div>

              {/* Require Phone Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Telefon Numarası Olmayanları Yüksek Önceliğe Alma
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Telefon numarası eksikse skoru 70+ olsa bile öncelik seviyesi otomatik olarak "Orta"ya çekilir.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifConfig.scoring?.requirePhoneForHighPriority ?? true}
                  onChange={e =>
                    updateNotifConfig(prev => ({
                      ...prev,
                      scoring: {
                        ...prev.scoring,
                        requirePhoneForHighPriority: e.target.checked
                      }
                    }))
                  }
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Live Scoring Playground (Right) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Canlı Skor Hesaplama Testi
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">İnteraktif Simülatör</span>
              </div>

              {/* Lead Selector or Custom Test */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Test Edilecek Müşteri Talebi
                </label>
                <select
                  value={selectedLeadIdForPlayground}
                  onChange={e => {
                    setSelectedLeadIdForPlayground(e.target.value);
                    const sel = leads.find(l => l.id === e.target.value);
                    if (sel) {
                      setCustomTestMessage(sel.message);
                      setCustomTestDealValue(sel.dealValue || 0);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="sample">Örnek VIP Talep (Simüle)</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} - {l.serviceOrProduct} (₺{(l.dealValue || 0).toLocaleString("tr-TR")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Score Display Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-300 font-medium">Hesaplanan Lead Skoru</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                      playgroundScore.priority === "high"
                        ? "bg-rose-500 text-white animate-pulse"
                        : playgroundScore.priority === "medium"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {getPriorityLabel(playgroundScore.priority)}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-white">
                    {playgroundScore.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100 Puan</span>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      playgroundScore.priority === "high"
                        ? "bg-rose-500"
                        : playgroundScore.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-slate-500"
                    }`}
                    style={{ width: `${playgroundScore.score}%` }}
                  />
                </div>

                <div className="text-xs text-slate-300">
                  {playgroundScore.isHighPriority ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Bu talep Slack ve E-posta ile ANINDA satış ekibine iletilir!</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Yalnızca yüksek öncelik filtresi seçiliyse bu talep kanallara gönderilmez.
                    </span>
                  )}
                </div>
              </div>

              {/* Factor Breakdown List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Puan Dökümü & Kriterler:
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {playgroundScore.breakdown.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        b.matched
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {b.matched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold">{b.label}</div>
                          {b.note && <div className="text-[10px] opacity-75">{b.note}</div>}
                        </div>
                      </div>
                      <span className="font-mono font-bold shrink-0">
                        {b.matched ? `+${b.points}` : "0"} / {b.maxPoints}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable inputs to test variations */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Simülasyon Değerlerini Değiştir:
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Test Mesajı</label>
                  <textarea
                    rows={2}
                    value={customTestMessage}
                    onChange={e => setCustomTestMessage(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Test Bütçesi (₺)</label>
                  <input
                    type="number"
                    step={500}
                    value={customTestDealValue}
                    onChange={e => setCustomTestDealValue(Number(e.target.value) || 0)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATION AUDIT LOG / HISTORY */}
      {activeSubTab === "history" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Bildirim Denetim Günlüğü (Audit Log)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sistem tarafından Slack veya e-postaya iletilen tüm bildirimlerin kayıtları.
                </p>
              </div>

              {historyLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Günlüğü Temizle</span>
                </button>
              )}
            </div>

            {historyLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Henüz Gönderilmiş Bildirim Yok
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Web sitenize yüksek öncelikli bir form talebi ulaştığında veya yukarıdaki
                  test butonlarını kullandığınızda iletim kayıtları burada listelenecektir.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestSlack}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    Test Slack Bildirimi Gönder
                  </button>
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    Test E-Postası Gönder
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {historyLogs.map(item => {
                  const style = getPriorityBadgeStyle(item.priority);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${style.bg} ${style.text} ${style.border} flex items-center gap-1`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span>Skor: {item.score}</span>
                          </span>

                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {item.customerName}
                          </span>

                          {item.phone && (
                            <span className="text-xs text-slate-500 font-mono">
                              • {item.phone}
                            </span>
                          )}

                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            [{item.service}]
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            {item.channel === "both"
                              ? "📢 Slack + E-Posta"
                              : item.channel === "slack"
                              ? "💬 Slack"
                              : "✉️ E-Posta"}
                          </span>
                          <span>•</span>
                          <span>{item.details}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                          {item.status === "simulated" ? "Simüle / Test" : "Gönderildi"}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
