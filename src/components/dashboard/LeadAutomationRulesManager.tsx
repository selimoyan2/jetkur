import React, { useState, useMemo } from "react";
import {
  Zap,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Mail,
  Bell,
  Tag,
  UserCheck,
  Sliders,
  ExternalLink,
  Globe,
  Smartphone,
  MessageSquare,
  PhoneCall,
  Clock,
  FileText,
  Search,
  ArrowRight,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  FormLead,
  LeadAcquisitionSource,
  LeadAutomationActionConfig,
  LeadAutomationCondition,
  LeadAutomationConfig,
  LeadAutomationExecutionLog,
  LeadAutomationRule,
  LeadCommunicationChannel,
  SiteConfig
} from "../../types";
import {
  batchRunRulesOnLeads,
  DEFAULT_LEAD_AUTOMATION_CONFIG,
  detectLeadChannel,
  doesLeadMatchRule,
  executeRuleOnLead
} from "../../utils/leadAutomationEngine";
import { calculateLeadScore } from "../../utils/leadScoring";

interface LeadAutomationRulesManagerProps {
  config: SiteConfig;
  onUpdateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  onSelectLeadForDetail?: (lead: FormLead) => void;
}

export const LeadAutomationRulesManager: React.FC<LeadAutomationRulesManagerProps> = ({
  config,
  onUpdateConfig,
  onNavigateTab,
  onSelectLeadForDetail
}) => {
  // Ensure config exists
  const autoConfig: LeadAutomationConfig =
    config.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;

  const rules = autoConfig.rules || [];
  const executionLogs = autoConfig.executionLogs || [];
  const leads = config.leads || [];

  // Local UI states
  const [activeSubTab, setActiveSubTab] = useState<"rules" | "simulator" | "logs">("rules");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [editingRule, setEditingRule] = useState<LeadAutomationRule | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [batchFeedback, setBatchFeedback] = useState<{
    show: boolean;
    matchedCount: number;
    actionsCount: number;
  } | null>(null);

  // Simulator states
  const [simSelectedLeadId, setSimSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [simCustomScore, setSimCustomScore] = useState<number>(85);
  const [simCustomSource, setSimCustomSource] = useState<LeadAcquisitionSource>("ads");
  const [simCustomChannel, setSimCustomChannel] = useState<LeadCommunicationChannel>("form");
  const [simCustomMessage, setSimCustomMessage] = useState<string>(
    "Acil çekici ihtiyacımız var, şirket araçlarımız için kurumsal fiyat teklifi istiyoruz."
  );
  const [simMode, setSimMode] = useState<"existing" | "custom">("existing");
  const [simResults, setSimResults] = useState<{
    ruleEvaluations: {
      rule: LeadAutomationRule;
      matched: boolean;
      reasons: string[];
      executedActions: string[];
    }[];
    finalLead: FormLead;
  } | null>(null);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSource =
        sourceFilter === "all" ||
        r.conditions.sources.includes("all") ||
        r.conditions.sources.includes(sourceFilter as any);
      return matchSearch && matchSource;
    });
  }, [rules, searchQuery, sourceFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = rules.length;
    const activeCount = rules.filter(r => r.enabled).length;
    const totalTriggers = rules.reduce((acc, r) => acc + (r.triggerCount || 0), 0);
    const crmActionCount = rules.filter(r => r.actions.crm.enabled).length;
    const emailActionCount = rules.filter(r => r.actions.email.enabled).length;
    const notifActionCount = rules.filter(r => r.actions.notification.enabled).length;

    return {
      total,
      activeCount,
      totalTriggers,
      crmActionCount,
      emailActionCount,
      notifActionCount
    };
  }, [rules]);

  // Handler: Toggle Master Engine Switch
  const handleToggleMaster = () => {
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          enabled: !current.enabled
        }
      };
    });
  };

  // Handler: Toggle Auto-trigger on new lead
  const handleToggleAutoTrigger = () => {
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          autoTriggerOnNewLead: !current.autoTriggerOnNewLead
        }
      };
    });
  };

  // Handler: Toggle Single Rule Enabled/Disabled
  const handleToggleRule = (ruleId: string) => {
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          rules: current.rules.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
        }
      };
    });
  };

  // Handler: Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    if (!window.confirm("Bu otomasyon kuralını silmek istediğinize emin misiniz?")) return;
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          rules: current.rules.filter(r => r.id !== ruleId)
        }
      };
    });
  };

  // Handler: Duplicate Rule
  const handleDuplicateRule = (rule: LeadAutomationRule) => {
    const duplicated: LeadAutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Kopya)`,
      createdAt: new Date().toISOString().split("T")[0],
      triggerCount: 0,
      lastTriggeredAt: undefined
    };
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          rules: [duplicated, ...current.rules]
        }
      };
    });
  };

  // Handler: Save Rule (Create or Update)
  const handleSaveRule = (savedRule: LeadAutomationRule) => {
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      const existingIndex = current.rules.findIndex(r => r.id === savedRule.id);
      let newRules: LeadAutomationRule[];
      if (existingIndex >= 0) {
        newRules = current.rules.map(r => (r.id === savedRule.id ? savedRule : r));
      } else {
        newRules = [savedRule, ...current.rules];
      }
      return {
        ...prev,
        leadAutomations: {
          ...current,
          rules: newRules
        }
      };
    });
    setEditingRule(null);
    setIsCreatingNew(false);
  };

  // Handler: Batch Run All Enabled Rules on Existing Leads
  const handleBatchRun = () => {
    const { updatedLeads, matchedCount, newLogs } = batchRunRulesOnLeads(leads, config);

    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leads: updatedLeads,
        leadAutomations: {
          ...current,
          executionLogs: [...newLogs, ...(current.executionLogs || [])]
        }
      };
    });

    setBatchFeedback({
      show: true,
      matchedCount,
      actionsCount: newLogs.length
    });

    setTimeout(() => {
      setBatchFeedback(null);
    }, 6000);
  };

  // Handler: Clear execution logs
  const handleClearLogs = () => {
    if (!window.confirm("Tüm otomasyon yürütme geçmişini temizlemek istediğinize emin misiniz?")) return;
    onUpdateConfig(prev => {
      const current = prev.leadAutomations || DEFAULT_LEAD_AUTOMATION_CONFIG;
      return {
        ...prev,
        leadAutomations: {
          ...current,
          executionLogs: []
        }
      };
    });
  };

  // Simulator runner
  const handleRunSimulation = () => {
    let targetLead: FormLead;
    if (simMode === "existing") {
      targetLead = leads.find(l => l.id === simSelectedLeadId) || leads[0];
    } else {
      targetLead = {
        id: "sim-lead-custom",
        name: "Test Müşterisi (Simülasyon)",
        phone: "0532 999 88 77",
        email: "test.musteri@ornek.com",
        serviceOrProduct: "Oto Çekici & Ağır Vasıta Taşıma",
        message: simCustomMessage,
        date: "Şimdi",
        sourcePage: simCustomChannel === "whatsapp" ? "WhatsApp Hızlı Hat" : "Ana Sayfa Form",
        status: "new",
        acquisitionChannel: simCustomSource,
        dealValue: 2400,
        tags: []
      };
    }

    let currentLead = { ...targetLead };
    const evaluations: {
      rule: LeadAutomationRule;
      matched: boolean;
      reasons: string[];
      executedActions: string[];
    }[] = [];

    rules.forEach(rule => {
      const match = doesLeadMatchRule(currentLead, rule, config);
      let executedActions: string[] = [];
      if (match.matches) {
        const res = executeRuleOnLead(currentLead, rule, config);
        currentLead = res.updatedLead;
        executedActions = res.executedActions;
      }
      evaluations.push({
        rule,
        matched: match.matches,
        reasons: match.reasons,
        executedActions
      });
    });

    setSimResults({
      ruleEvaluations: evaluations,
      finalLead: currentLead
    });
  };

  return (
    <div className="space-y-6 pb-12" id="lead-automations-manager-root">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                <Zap className="w-6 h-6 text-amber-400" />
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <span>Lead Otomasyon Kuralları</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                    Smart Trigger Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                  Lead skoru, edinme kaynağı ve iletişim kanalına göre otomatik CRM etiketleme, özel
                  e-posta tetikleme ve anlık yönetici bildirim akışlarını yönetin.
                </p>
              </div>
            </div>
          </div>

          {/* Master Toggle & Batch Run Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Master Engine Switch */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs font-semibold text-slate-300">Otomasyon Motoru:</span>
              <button
                type="button"
                onClick={handleToggleMaster}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  autoConfig.enabled ? "bg-emerald-500" : "bg-slate-600"
                }`}
                title={autoConfig.enabled ? "Motor Aktif" : "Motor Devre Dışı"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoConfig.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold font-mono ${
                  autoConfig.enabled ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {autoConfig.enabled ? "AKTİF" : "KAPALI"}
              </span>
            </div>

            {/* Run on All Leads */}
            <button
              type="button"
              onClick={handleBatchRun}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-indigo-400/40"
              title="Mevcut tüm lead'ler üzerinde aktif kuralları çalıştır"
            >
              <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Mevcut {leads.length} Lead Üzerinde Çalıştır</span>
            </button>

            {/* Add Rule Button */}
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                setEditingRule(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Kural Tanımla</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs: Kurallar / Simülatör / Yürütme Geçmişi */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab("rules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "rules"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Aktif Kurallar ({rules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("simulator");
              if (!simResults) {
                setTimeout(() => handleRunSimulation(), 50);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "simulator"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kural Simülatörü &amp; Canlı Test</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "logs"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Yürütme Günlüğü ({executionLogs.length})</span>
          </button>

          <div className="ml-auto hidden sm:flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoConfig.autoTriggerOnNewLead}
                onChange={handleToggleAutoTrigger}
                className="w-4 h-4 rounded-sm border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Yeni lead geldiğinde otomatik tetikle</span>
            </label>
          </div>
        </div>
      </div>

      {/* Batch Feedback Notification Toast */}
      {batchFeedback?.show && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Toplu Kural Yürütme Başarıyla Tamamlandı!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Mevcut {leads.length} talep taranarak <strong>{batchFeedback.matchedCount} adet lead</strong> ile
                kurallar eşleştirildi ve <strong>{batchFeedback.actionsCount} adet otomatik işlem</strong> yürütüldü.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBatchFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            ✕ Kapat
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Aktif Kural Sayısı</span>
            <Sliders className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.activeCount}</span>
            <span className="text-xs text-slate-500 font-medium">/ {stats.total} Toplam</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Toplam Tetikleme</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.totalTriggers}</span>
            <span className="text-xs text-emerald-600 font-bold">İşlem</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">CRM &amp; Etiket Eylemleri</span>
            <Tag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.crmActionCount}</span>
            <span className="text-xs text-slate-500 font-medium">Kuralda Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Yönetici &amp; E-posta Bildirimi</span>
            <Bell className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.notifActionCount + stats.emailActionCount}</span>
            <span className="text-xs text-slate-500 font-medium">Otomatik Kanal</span>
          </div>
        </div>
      </div>

      {/* ===================== TAB 1: RULES LIST ===================== */}
      {activeSubTab === "rules" && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kural adı veya açıklamasında ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">Kaynak Filtresi:</span>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tüm Kaynaklar</option>
                <option value="organic">Organik SEO</option>
                <option value="ads">Google Ads</option>
                <option value="social">Sosyal Medya</option>
                <option value="referral">Tavsiye / Doğrudan</option>
              </select>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRules.map(rule => (
              <div
                key={rule.id}
                className={`bg-white rounded-xl border transition-all p-5 shadow-xs ${
                  rule.enabled
                    ? "border-slate-200 hover:border-indigo-300"
                    : "border-slate-200/60 bg-slate-50/50 opacity-75"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{rule.name}</span>
                      </h3>

                      {rule.enabled ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          Pasif
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        Oluşturulma: {rule.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rule.description}
                    </p>

                    {/* Conditions and Actions Badges */}
                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Condition Box */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Tetikleyici Şartları (Eğer...)
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {/* Score Badge */}
                          {rule.conditions.scoreFilterType === "gte" && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                              Skor ≥ {rule.conditions.minScore}
                            </span>
                          )}
                          {rule.conditions.scoreFilterType === "lte" && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200">
                              Skor ≤ {rule.conditions.maxScore}
                            </span>
                          )}
                          {rule.conditions.scoreFilterType === "tier" && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                              Öncelik: {rule.conditions.scoreTier}
                            </span>
                          )}
                          {rule.conditions.scoreFilterType === "any" && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              Skor: Tümü
                            </span>
                          )}

                          {/* Source Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                            Kaynak: {rule.conditions.sources.includes("all") ? "Tüm Kaynaklar" : rule.conditions.sources.join(", ")}
                          </span>

                          {/* Channel Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                            Kanal: {rule.conditions.channels.includes("all") ? "Tüm Kanallar" : rule.conditions.channels.join(", ")}
                          </span>

                          {/* Deal Value */}
                          {rule.conditions.minDealValue ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                              Ciro ≥ {rule.conditions.minDealValue} ₺
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Action Box */}
                      <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                          Yürütülecek Aksiyonlar (O Zaman...)
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {rule.actions.crm.enabled && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-indigo-600" />
                              <span>CRM: {rule.actions.crm.tagsToAdd.join(", ") || "Etiketle"}</span>
                            </span>
                          )}

                          {rule.actions.crm.assignedAgent && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-300 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-600" />
                              <span>{rule.actions.crm.assignedAgent}</span>
                            </span>
                          )}

                          {rule.actions.notification.enabled && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 flex items-center gap-1">
                              <Bell className="w-3 h-3 text-rose-600" />
                              <span>Yönetici Bildirimi</span>
                            </span>
                          )}

                          {rule.actions.email.enabled && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-emerald-600" />
                              <span>Özel E-posta</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Kural Durumu:</span>
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          rule.enabled ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        title={rule.enabled ? "Devre Dışı Bırak" : "Etkinleştir"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            rule.enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      <div>
                        <strong>{rule.triggerCount || 0}</strong> kez tetiklendi
                      </div>
                      {rule.lastTriggeredAt && (
                        <div className="text-slate-400">Son: {rule.lastTriggeredAt}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRule(rule);
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        title="Kuralı Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateRule(rule)}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
                        title="Kuralı Çoğalt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs"
                        title="Kuralı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                <Sliders className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Aramanıza uygun otomasyon kuralı bulunamadı.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Filtreleri temizleyebilir veya yeni bir otomasyon kuralı tanımlayabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: LIVE SIMULATOR ===================== */}
      {activeSubTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kural Simülatörü &amp; Canlı Doğrulama</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mevcut bir müşteri talebi veya özel parametreler girerek kuralların nasıl çalıştığını test edin.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSimMode("existing")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    simMode === "existing"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Mevcut Leadlerden Seç
                </button>
                <button
                  type="button"
                  onClick={() => setSimMode("custom")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    simMode === "custom"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Özel Test Talebi Oluştur
                </button>
              </div>
            </div>

            {/* Inputs based on mode */}
            {simMode === "existing" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Test Edilecek Lead Seçin:
                  </label>
                  <select
                    value={simSelectedLeadId}
                    onChange={e => setSimSelectedLeadId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {leads.map(lead => {
                      const score = calculateLeadScore(lead).score;
                      return (
                        <option key={lead.id} value={lead.id}>
                          {lead.name} ({lead.serviceOrProduct}) - Skor: {score} - Kaynak:{" "}
                          {lead.acquisitionChannel || "organic"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Kuralları Bu Lead Üzerinde Değerlendir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Simüle Edilen Lead Skoru (0 - 100):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={simCustomScore}
                      onChange={e => setSimCustomScore(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                      {simCustomScore}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Edinme Kaynağı:</label>
                  <select
                    value={simCustomSource}
                    onChange={e => setSimCustomSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="organic">Organik SEO (Google Arama)</option>
                    <option value="ads">Google Reklamları (Ads)</option>
                    <option value="social">Sosyal Medya (Instagram)</option>
                    <option value="referral">Tavsiye / Doğrudan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İletişim Kanalı:</label>
                  <select
                    value={simCustomChannel}
                    onChange={e => setSimCustomChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="form">Web Sitesi Teklif Formu</option>
                    <option value="whatsapp">WhatsApp Buton Tıklaması</option>
                    <option value="phone">Doğrudan Telefon Çağrısı</option>
                    <option value="email">Doğrudan E-posta</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Simüle Edilen Müşteri Mesajı:
                  </label>
                  <input
                    type="text"
                    value={simCustomMessage}
                    onChange={e => setSimCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Özel Testi Çalıştır</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Output Results */}
          {simResults && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Simülasyon Değerlendirme Çıktıları
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {simResults.ruleEvaluations.map((item, idx) => (
                  <div
                    key={item.rule.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      item.matched
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-slate-50/80 border-slate-200 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{item.rule.name}</span>
                          {item.matched ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Koşullar Eşleşti &amp; Tetiklendi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                              Eşleşmedi (Atlandı)
                            </span>
                          )}
                        </div>

                        {/* Reasons */}
                        <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                          {item.reasons.map((r, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 text-[11px]">
                              <span className={item.matched ? "text-emerald-600" : "text-slate-400"}>
                                •
                              </span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {/* Executed Actions if matched */}
                        {item.matched && item.executedActions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-emerald-200/60 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                              Yürütülen Otomatik Aksiyonlar:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.executedActions.map((act, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 text-[11px] font-medium shadow-2xs"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final State Preview */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-300">
                  ⚡ Simülasyon Sonrası Lead Durumu:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Eklenen Etiketler:</span>
                    <span className="font-bold text-emerald-400">
                      {simResults.finalLead.tags?.join(", ") || "Etiket yok"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Son Müşteri Durumu:</span>
                    <span className="font-bold text-amber-300">{simResults.finalLead.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Dahili CRM Notu:</span>
                    <span className="text-slate-300 text-[11px] line-clamp-2">
                      {simResults.finalLead.privateNotes || "Not eklenmedi"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: EXECUTION LOGS ===================== */}
      {activeSubTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Otomasyon Yürütme Günlüğü</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kuralların ne zaman tetiklendiğini, hangi müşteriye uygulandığını ve icra edilen eylemleri inceleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearLogs}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Günlüğü Temizle</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Zaman</th>
                    <th className="p-3">Tetiklenen Kural</th>
                    <th className="p-3">Müşteri / Lead</th>
                    <th className="p-3">Skor &amp; Kaynak</th>
                    <th className="p-3">Yürütülen Aksiyonlar</th>
                    <th className="p-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {executionLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.ruleName}</td>
                      <td className="p-3 font-medium text-slate-800">{log.leadName}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] mr-1.5">
                          {log.leadScore} Puan
                        </span>
                        <span className="text-[11px] text-slate-500 capitalize">
                          {log.leadSource}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 max-w-md">
                          {log.actionsExecuted.map((act, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {log.status === "success" ? "Başarılı" : log.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {executionLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Henüz kayıtlı yürütme günlüğü bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RULE EDITOR MODAL ===================== */}
      {(isCreatingNew || editingRule) && (
        <RuleEditorModal
          initialRule={
            editingRule || {
              id: `rule-${Date.now()}`,
              name: "",
              description: "",
              enabled: true,
              createdAt: new Date().toISOString().split("T")[0],
              triggerCount: 0,
              conditions: {
                scoreFilterType: "gte",
                minScore: 70,
                sources: ["all"],
                channels: ["all"]
              },
              actions: {
                crm: {
                  enabled: true,
                  tagsToAdd: ["🔥 Sıcak Lead"],
                  updateStatus: "new",
                  assignedAgent: "Satış Ekibi",
                  internalNote: "Otomasyon kuralı tarafından işaretlendi."
                },
                notification: {
                  enabled: true,
                  channels: ["email", "in_app"],
                  managerEmails: "yonetici@hizliweb.com",
                  alertTitle: "🚨 Yeni Müşteri Bildirimi",
                  includeFullDetails: true
                },
                email: {
                  enabled: false,
                  recipientType: "lead",
                  subjectTemplate: "Talebinizi Aldık",
                  bodyTemplate: "Merhaba {customer_name},\n\nTalebiniz ulaştı, en kısa sürede arayacağız."
                }
              }
            }
          }
          isNew={isCreatingNew}
          onClose={() => {
            setIsCreatingNew(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: RULE EDITOR MODAL
// =========================================================================
interface RuleEditorModalProps {
  initialRule: LeadAutomationRule;
  isNew: boolean;
  onClose: () => void;
  onSave: (rule: LeadAutomationRule) => void;
}

const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  initialRule,
  isNew,
  onClose,
  onSave
}) => {
  const [rule, setRule] = useState<LeadAutomationRule>(initialRule);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!rule.actions.crm.tagsToAdd.includes(trimmed)) {
      setRule(prev => ({
        ...prev,
        actions: {
          ...prev.actions,
          crm: {
            ...prev.actions.crm,
            tagsToAdd: [...prev.actions.crm.tagsToAdd, trimmed]
          }
        }
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setRule(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        crm: {
          ...prev.actions.crm,
          tagsToAdd: prev.actions.crm.tagsToAdd.filter(t => t !== tagToRemove)
        }
      }
    }));
  };

  const handleToggleSource = (src: LeadAcquisitionSource) => {
    setRule(prev => {
      let currentSources = [...prev.conditions.sources];
      if (src === "all") {
        currentSources = ["all"];
      } else {
        currentSources = currentSources.filter(s => s !== "all");
        if (currentSources.includes(src)) {
          currentSources = currentSources.filter(s => s !== src);
          if (currentSources.length === 0) currentSources = ["all"];
        } else {
          currentSources.push(src);
        }
      }
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          sources: currentSources
        }
      };
    });
  };

  const handleToggleChannel = (chan: LeadCommunicationChannel) => {
    setRule(prev => {
      let currentChannels = [...prev.conditions.channels];
      if (chan === "all") {
        currentChannels = ["all"];
      } else {
        currentChannels = currentChannels.filter(c => c !== "all");
        if (currentChannels.includes(chan)) {
          currentChannels = currentChannels.filter(c => c !== chan);
          if (currentChannels.length === 0) currentChannels = ["all"];
        } else {
          currentChannels.push(chan);
        }
      }
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          channels: currentChannels
        }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule.name.trim()) {
      alert("Lütfen kural için bir isim belirleyin.");
      return;
    }
    onSave(rule);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-base font-black">
                {isNew ? "Yeni Otomasyon Kuralı Tanımla" : "Otomasyon Kuralını Düzenle"}
              </h2>
              <p className="text-xs text-slate-400">
                Tetikleyici şartlarını ve uygulanacak otomatik aksiyonları belirleyin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              1. Genel Bilgiler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Kural Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Google Ads Taleplerine Hızlı Takip & Satış Bildirimi"
                  value={rule.name}
                  onChange={e => setRule({ ...rule, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Durum</label>
                <select
                  value={rule.enabled ? "active" : "inactive"}
                  onChange={e => setRule({ ...rule, enabled: e.target.value === "active" })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Aktif (Çalıştır)</option>
                  <option value="inactive">Pasif (Durdur)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  placeholder="Bu kuralın amacını kısaca belirtin..."
                  value={rule.description}
                  onChange={e => setRule({ ...rule, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trigger Conditions */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              2. Tetikleyici Koşulları (Hangi Talepler İçin Çalışsın?)
            </h3>

            {/* Score Condition */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                🎯 Lead Skoru Kriteri:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={rule.conditions.scoreFilterType}
                  onChange={e =>
                    setRule({
                      ...rule,
                      conditions: { ...rule.conditions, scoreFilterType: e.target.value as any }
                    })
                  }
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                >
                  <option value="any">Tüm Skorlar (Skor Şartı Yok)</option>
                  <option value="gte">En Az Skor (≥ Eşik)</option>
                  <option value="lte">En Çok Skor (≤ Eşik)</option>
                  <option value="tier">Öncelik Kademesi</option>
                </select>

                {rule.conditions.scoreFilterType === "gte" && (
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <span className="text-xs text-slate-600">Minimum:</span>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      step={5}
                      value={rule.conditions.minScore || 70}
                      onChange={e =>
                        setRule({
                          ...rule,
                          conditions: { ...rule.conditions, minScore: Number(e.target.value) }
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                    <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                      ≥ {rule.conditions.minScore || 70} Puan
                    </span>
                  </div>
                )}

                {rule.conditions.scoreFilterType === "lte" && (
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <span className="text-xs text-slate-600">Maksimum:</span>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      value={rule.conditions.maxScore || 40}
                      onChange={e =>
                        setRule({
                          ...rule,
                          conditions: { ...rule.conditions, maxScore: Number(e.target.value) }
                        })
                      }
                      className="w-full accent-sky-600"
                    />
                    <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-mono font-bold text-xs">
                      ≤ {rule.conditions.maxScore || 40} Puan
                    </span>
                  </div>
                )}

                {rule.conditions.scoreFilterType === "tier" && (
                  <div className="sm:col-span-2">
                    <select
                      value={rule.conditions.scoreTier || "high"}
                      onChange={e =>
                        setRule({
                          ...rule,
                          conditions: { ...rule.conditions, scoreTier: e.target.value as any }
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium w-full"
                    >
                      <option value="high">Yüksek Öncelik (70-100 Puan)</option>
                      <option value="medium">Orta Öncelik (40-69 Puan)</option>
                      <option value="low">Düşük Öncelik (0-39 Puan)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Source Condition */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                🌐 Edinme Kaynakları:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tüm Kaynaklar" },
                  { id: "organic", label: "Organik SEO" },
                  { id: "ads", label: "Google Ads Reklamları" },
                  { id: "social", label: "Sosyal Medya" },
                  { id: "referral", label: "Tavsiye / Doğrudan" }
                ].map(item => {
                  const isSelected = rule.conditions.sources.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleSource(item.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Communication Channel Condition */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                📱 İletişim Kanalları:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tüm Kanallar" },
                  { id: "form", label: "Web Teklif Formu" },
                  { id: "whatsapp", label: "WhatsApp Chat / Buton" },
                  { id: "phone", label: "Doğrudan Telefon Çağrısı" },
                  { id: "email", label: "E-posta Başvurusu" }
                ].map(item => {
                  const isSelected = rule.conditions.channels.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleChannel(item.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Automated Actions */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              3. Otomatik Aksiyonlar (Tetiklendiğinde Ne Yapılsın?)
            </h3>

            {/* 3.1 CRM Action */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Aksiyon 1: CRM Etiketleme &amp; Temsilci Atama
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rule.actions.crm.enabled}
                  onChange={e =>
                    setRule({
                      ...rule,
                      actions: {
                        ...rule.actions,
                        crm: { ...rule.actions.crm, enabled: e.target.checked }
                      }
                    })
                  }
                  className="w-4 h-4 rounded-sm text-indigo-600"
                />
              </div>

              {rule.actions.crm.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Eklenecek CRM Etiketleri:
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {rule.actions.crm.tagsToAdd.map(t => (
                        <span
                          key={t}
                          className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-indigo-500 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Özel etiket yazıp ekleyin..."
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(tagInput);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(tagInput)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold"
                      >
                        Ekle
                      </button>
                    </div>

                    {/* Quick suggested tags */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400">Öneriler:</span>
                      {["🔥 VIP Sıcak Lead", "🎯 Google Ads Dönüşümü", "⚡ Acil Saha", "Kurumsal"].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleAddTag(st)}
                          className="text-[10px] font-semibold text-indigo-600 hover:underline bg-indigo-50/50 px-1.5 py-0.5 rounded-sm"
                        >
                          +{st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Atanacak Temsilci / Departman:
                      </label>
                      <input
                        type="text"
                        placeholder="örn: Kıdemli Satış Uzmanı, Nöbetçi Ekip"
                        value={rule.actions.crm.assignedAgent || ""}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              crm: { ...rule.actions.crm, assignedAgent: e.target.value }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Müşteri Durumu Güncellemesi:
                      </label>
                      <select
                        value={rule.actions.crm.updateStatus || "new"}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              crm: { ...rule.actions.crm, updateStatus: e.target.value as any }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      >
                        <option value="none">Değiştirme (Mevcut Durumu Koru)</option>
                        <option value="new">Yeni Talep (new)</option>
                        <option value="contacted">İletişim Kuruldu (contacted)</option>
                        <option value="offered">Teklif Sunuldu (offered)</option>
                        <option value="closed">Tamamlandı (closed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3.2 Manager Notification Action */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900">
                    Aksiyon 2: Yöneticiye &amp; Satış Ekibine Anlık Bildirim
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rule.actions.notification.enabled}
                  onChange={e =>
                    setRule({
                      ...rule,
                      actions: {
                        ...rule.actions,
                        notification: { ...rule.actions.notification, enabled: e.target.checked }
                      }
                    })
                  }
                  className="w-4 h-4 rounded-sm text-indigo-600"
                />
              </div>

              {rule.actions.notification.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Yönetici E-posta Adresleri (virgülle ayırın):
                      </label>
                      <input
                        type="text"
                        placeholder="yonetici@firma.com, satis@firma.com"
                        value={rule.actions.notification.managerEmails}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              notification: {
                                ...rule.actions.notification,
                                managerEmails: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Slack / Webhook Kanalı:
                      </label>
                      <input
                        type="text"
                        placeholder="#leads-urgent"
                        value={rule.actions.notification.slackChannel || ""}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              notification: {
                                ...rule.actions.notification,
                                slackChannel: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3.3 Custom Email Trigger */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Aksiyon 3: Otomatik Özel E-posta Tetikleme
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rule.actions.email.enabled}
                  onChange={e =>
                    setRule({
                      ...rule,
                      actions: {
                        ...rule.actions,
                        email: { ...rule.actions.email, enabled: e.target.checked }
                      }
                    })
                  }
                  className="w-4 h-4 rounded-sm text-indigo-600"
                />
              </div>

              {rule.actions.email.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        E-posta Alıcısı:
                      </label>
                      <select
                        value={rule.actions.email.recipientType}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              email: { ...rule.actions.email, recipientType: e.target.value as any }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      >
                        <option value="lead">Talebi Gönderen Müşteriye</option>
                        <option value="staff">Dahili Satış Ekibine</option>
                        <option value="both">Her İkisine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        E-posta Konusu:
                      </label>
                      <input
                        type="text"
                        placeholder="Sayın {customer_name}, Talebiniz Öncelikli Sıraya Alındı"
                        value={rule.actions.email.subjectTemplate}
                        onChange={e =>
                          setRule({
                            ...rule,
                            actions: {
                              ...rule.actions,
                              email: { ...rule.actions.email, subjectTemplate: e.target.value }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-posta Gövde Metni (Desteklenen değişkenler: &#123;customer_name&#125;, &#123;service&#125;, &#123;score&#125;):
                    </label>
                    <textarea
                      rows={3}
                      value={rule.actions.email.bodyTemplate}
                      onChange={e =>
                        setRule({
                          ...rule,
                          actions: {
                            ...rule.actions,
                            email: { ...rule.actions.email, bodyTemplate: e.target.value }
                          }
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xs"
            >
              {isNew ? "Kuralı Kaydet & Aktifleştir" : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
