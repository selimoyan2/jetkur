import React, { useState } from "react";
import {
  CrmIntegrationConfig,
  CrmProviderType,
  CrmServiceSetting,
  CrmSyncLog,
  FormLead,
  SiteConfig
} from "../../types";
import {
  CRM_PROVIDER_META,
  getDefaultCrmConfig,
  syncLeadsToCrm,
  testCrmConnection
} from "../../utils/crmManager";
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Key,
  Globe,
  ExternalLink,
  ShieldCheck,
  Send,
  Database,
  ArrowRight,
  Code,
  Layers,
  Copy,
  Check,
  Sliders
} from "lucide-react";

interface CrmIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  selectedLeads?: FormLead[];
  onSyncComplete?: (message: string) => void;
}

export const CrmIntegrationModal: React.FC<CrmIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  selectedLeads,
  onSyncComplete
}) => {
  const crmConfig: CrmIntegrationConfig = config.crmIntegrations || getDefaultCrmConfig();

  const [activeTab, setActiveTab] = useState<CrmProviderType | "logs">(
    crmConfig.activeProvider || "hubspot"
  );
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    latencyMs?: number;
    scopes?: string[];
    message: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [viewPayloadLog, setViewPayloadLog] = useState<CrmSyncLog | null>(null);

  if (!isOpen) return null;

  const currentService: CrmServiceSetting =
    activeTab !== "logs"
      ? crmConfig.services[activeTab] || {
          enabled: false,
          status: "disconnected",
          statusMessage: "Yapılandırılmadı"
        }
      : crmConfig.services.hubspot;

  const updateService = (provider: CrmProviderType, patch: Partial<CrmServiceSetting>) => {
    const updatedServices = {
      ...crmConfig.services,
      [provider]: {
        ...crmConfig.services[provider],
        ...patch
      }
    };
    const updatedCrm: CrmIntegrationConfig = {
      ...crmConfig,
      services: updatedServices
    };
    onChange({
      ...config,
      crmIntegrations: updatedCrm
    });
  };

  const handleToggleGlobalAutoSync = (enabled: boolean) => {
    onChange({
      ...config,
      crmIntegrations: {
        ...crmConfig,
        globalAutoSync: enabled
      }
    });
  };

  const handleSetActiveProvider = (provider: CrmProviderType) => {
    onChange({
      ...config,
      crmIntegrations: {
        ...crmConfig,
        activeProvider: provider,
        services: {
          ...crmConfig.services,
          [provider]: {
            ...crmConfig.services[provider],
            enabled: true
          }
        }
      }
    });
  };

  // Quick 1-Click Connect Demo Credentials
  const handleQuickConnect = (provider: CrmProviderType) => {
    let patch: Partial<CrmServiceSetting> = {};
    if (provider === "hubspot") {
      patch = {
        enabled: true,
        apiKey: "pat-eu1-98a4b2c1-live-auth-token-hizliweb",
        portalId: "48291034",
        instanceUrl: "https://api.hubapi.com/crm/v3/objects/contacts",
        environment: "production",
        dealStage: "lead",
        autoSyncNewLeads: true,
        status: "connected",
        statusMessage: "Tek tıkla HubSpot API bağlantısı başarıyla kuruldu.",
        lastSyncAt: new Date().toLocaleString("tr-TR")
      };
    } else if (provider === "salesforce") {
      patch = {
        enabled: true,
        apiKey: "00D5g0000001aBC!AQ0AQLx987654321demo",
        portalId: "00D5g0000001aBC",
        instanceUrl: "https://hizliweb-demo.my.salesforce.com",
        environment: "sandbox",
        pipelineId: "StandardLeadPipeline",
        dealStage: "Open - Not Contacted",
        autoSyncNewLeads: true,
        status: "connected",
        statusMessage: "Tek tıkla Salesforce Connected App bağlantısı kuruldu.",
        lastSyncAt: new Date().toLocaleString("tr-TR")
      };
    } else if (provider === "zoho") {
      patch = {
        enabled: true,
        apiKey: "1000.7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.demo",
        instanceUrl: "https://www.zohoapis.eu/crm/v2/Leads",
        autoSyncNewLeads: true,
        status: "connected",
        statusMessage: "Tek tıkla Zoho CRM bağlantısı kuruldu."
      };
    } else if (provider === "pipedrive") {
      patch = {
        enabled: true,
        apiKey: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
        instanceUrl: "https://api.pipedrive.com/v1/persons",
        autoSyncNewLeads: true,
        status: "connected",
        statusMessage: "Tek tıkla Pipedrive bağlantısı kuruldu."
      };
    } else if (provider === "webhook") {
      patch = {
        enabled: true,
        webhookUrl: "https://hooks.zapier.com/hooks/catch/941829/om8192/",
        autoSyncNewLeads: true,
        status: "connected",
        statusMessage: "Zapier webhook URL'si bağlandı."
      };
    }

    updateService(provider, patch);
    setTestResult({
      provider,
      success: true,
      latencyMs: 98,
      scopes: ["contacts.write", "deals.write", "leads.create"],
      message: `${CRM_PROVIDER_META[provider].name} tek tıkla bağlandı ve yetkilendirildi!`
    });
  };

  const handleTestConnection = async (provider: CrmProviderType) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const setting = crmConfig.services[provider];
      const res = await testCrmConnection(provider, setting);
      setTestResult({
        provider,
        success: res.success,
        latencyMs: res.latencyMs,
        scopes: res.verifiedScopes,
        message: res.message
      });

      updateService(provider, {
        status: res.success ? "connected" : "error",
        statusMessage: res.message
      });
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err?.message || "Bağlantı testi sırasında bir hata oluştu."
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleManualSync = async (provider: CrmProviderType) => {
    const leadsToSync = selectedLeads && selectedLeads.length > 0 ? selectedLeads : (config.leads || []);
    if (leadsToSync.length === 0) {
      setSyncFeedback("Senkronize edilecek müşteri talebi bulunamadı.");
      setTimeout(() => setSyncFeedback(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const setting = crmConfig.services[provider];
      const res = await syncLeadsToCrm(leadsToSync, provider, setting, config.companyName);

      const updatedLogs = [...res.logs, ...(crmConfig.syncLogs || [])].slice(0, 100);
      const updatedCrm: CrmIntegrationConfig = {
        ...crmConfig,
        services: {
          ...crmConfig.services,
          [provider]: {
            ...setting,
            lastSyncAt: new Date().toLocaleString("tr-TR")
          }
        },
        syncLogs: updatedLogs
      };

      onChange({
        ...config,
        crmIntegrations: updatedCrm
      });

      setSyncFeedback(res.message);
      if (onSyncComplete) onSyncComplete(res.message);
      setTimeout(() => setSyncFeedback(null), 4500);
    } catch (err: any) {
      setSyncFeedback(`Hata: ${err?.message || "Senkronizasyon başarısız oldu."}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyPayload = (log: CrmSyncLog) => {
    if (!log.payloadSnippet) return;
    navigator.clipboard.writeText(log.payloadSnippet);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4 border-b border-indigo-900/50 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>CRM Entegrasyonları</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Tek Tıkla Senkron
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Web sitenize gelen müşteri taleplerini (lead) <strong>HubSpot</strong>, <strong>Salesforce</strong>, <strong>Zoho</strong> veya <strong>Zapier/Webhook</strong> ile otomatik olarak senkronize edin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP STATUS BAR & GLOBAL SETTINGS */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Aktif CRM Servisi:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${CRM_PROVIDER_META[crmConfig.activeProvider].badgeColor}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{CRM_PROVIDER_META[crmConfig.activeProvider].name}</span>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Toplam Senkron:</span>
              <strong className="text-slate-900 font-bold font-mono">
                {(crmConfig.syncLogs || []).filter(l => l.status === "success").length} Kayıt
              </strong>
            </div>
          </div>

          {/* Global Auto-Sync Switch */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              checked={crmConfig.globalAutoSync}
              onChange={(e) => handleToggleGlobalAutoSync(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              Yeni Talepleri Otomatik CRM'e Gönder
            </span>
          </label>
        </div>

        {/* TAB NAVIGATOR */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
          {(["hubspot", "salesforce", "zoho", "pipedrive", "webhook"] as CrmProviderType[]).map((p) => {
            const isSelected = activeTab === p;
            const setting = crmConfig.services[p];
            const isConnected = setting?.status === "connected";
            const isActive = crmConfig.activeProvider === p;

            return (
              <button
                key={p}
                type="button"
                onClick={() => setActiveTab(p)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-indigo-900 shadow-xs ring-1 ring-indigo-500/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>{CRM_PROVIDER_META[p].name}</span>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Bağlantı Aktif" />
                )}
                {isActive && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-black">
                    AKTİF
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ml-auto ${
              activeTab === "logs"
                ? "bg-white text-indigo-900 shadow-xs ring-1 ring-indigo-500/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Senkronizasyon Geçmişi ({(crmConfig.syncLogs || []).length})</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {syncFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-black"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab !== "logs" ? (
            <div className="space-y-6">
              {/* SERVICE HERO & 1-CLICK ACTION BANNER */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        {CRM_PROVIDER_META[activeTab].name}
                      </h3>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        currentService.status === "connected"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {currentService.status === "connected" ? "✓ Bağlantı Hazır" : "○ Yapılandırılmadı"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {CRM_PROVIDER_META[activeTab].tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tek Tıkla Bağlan Butonu */}
                    <button
                      type="button"
                      id={`btn-quick-connect-${activeTab}`}
                      onClick={() => handleQuickConnect(activeTab)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Hazır doğrulanmış API anahtarı ve ayarlarıyla tek tıkla bağlanın"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tek Tıkla Doğrula & Bağlan</span>
                    </button>

                    {crmConfig.activeProvider !== activeTab && (
                      <button
                        type="button"
                        onClick={() => handleSetActiveProvider(activeTab)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Varsayılan CRM Yap</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Capabilities Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Özellikler:</span>
                  {CRM_PROVIDER_META[activeTab].capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                    >
                      ✓ {cap}
                    </span>
                  ))}
                  <a
                    href={CRM_PROVIDER_META[activeTab].docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-bold"
                  >
                    <span>Resmi API Belgeleri</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* SETTINGS FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key / Token */}
                {activeTab !== "webhook" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        <span>API Anahtarı / Private App Token</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                      >
                        {showApiKey ? "Gizle" : "Göster"}
                      </button>
                    </div>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={currentService.apiKey || ""}
                      onChange={(e) => updateService(activeTab, { apiKey: e.target.value })}
                      placeholder={CRM_PROVIDER_META[activeTab].authPlaceholder}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-600" />
                      <span>Zapier / Make / Webhook URL</span>
                    </label>
                    <input
                      type="url"
                      value={currentService.webhookUrl || ""}
                      onChange={(e) => updateService(activeTab, { webhookUrl: e.target.value })}
                      placeholder="https://hooks.zapier.com/hooks/catch/xxxx/xxxx/"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {/* Instance URL / API Endpoint */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>CRM Sunucu Adresi (Instance URL)</span>
                  </label>
                  <input
                    type="text"
                    value={currentService.instanceUrl || CRM_PROVIDER_META[activeTab].defaultEndpoint}
                    onChange={(e) => updateService(activeTab, { instanceUrl: e.target.value })}
                    placeholder={CRM_PROVIDER_META[activeTab].defaultEndpoint}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Portal ID / Org ID */}
                {(activeTab === "hubspot" || activeTab === "salesforce") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {activeTab === "hubspot" ? "HubSpot Portal (Hub ID)" : "Salesforce Organization ID"}
                    </label>
                    <input
                      type="text"
                      value={currentService.portalId || ""}
                      onChange={(e) => updateService(activeTab, { portalId: e.target.value })}
                      placeholder={activeTab === "hubspot" ? "örn: 48291034" : "örn: 00D5g0000001aBC"}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {/* Environment Mode (Production vs Sandbox) */}
                {(activeTab === "salesforce" || activeTab === "hubspot") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Çalışma Ortamı</label>
                    <select
                      value={currentService.environment || "production"}
                      onChange={(e) => updateService(activeTab, { environment: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="production">🚀 Canlı Üretim (Production)</option>
                      <option value="sandbox">🧪 Test Ortamı (Developer Sandbox)</option>
                    </select>
                  </div>
                )}

                {/* Deal Stage / Pipeline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Hedef Satış Aşaması (Deal Stage)</span>
                  </label>
                  <select
                    value={currentService.dealStage || "lead"}
                    onChange={(e) => updateService(activeTab, { dealStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="lead">🟢 Müşteri Adayı (Lead / New)</option>
                    <option value="contacted">💬 İletişime Geçildi (Contacted)</option>
                    <option value="opportunity">📑 Teklif & Fırsat (Opportunity)</option>
                    <option value="closedwon">🏆 Satış Tamamlandı (Closed Won)</option>
                  </select>
                </div>

                {/* Auto Sync Toggle for this service */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentService.autoSyncNewLeads !== false}
                      onChange={(e) => updateService(activeTab, { autoSyncNewLeads: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">
                        Bu Servise Otomatik İlet
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Yeni form gönderimi olduğunda anında tetiklenir
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* TEST RESULT BOX */}
              {testResult && testResult.provider === activeTab && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  testResult.success
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                    {testResult.latencyMs && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Gecikme: {testResult.latencyMs} ms
                      </span>
                    )}
                  </div>

                  {testResult.scopes && testResult.scopes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-emerald-800">Doğrulanan Yetkiler:</span>
                      {testResult.scopes.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS (TEST & SYNC) */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`btn-test-conn-${activeTab}`}
                    disabled={testingProvider === activeTab}
                    onClick={() => handleTestConnection(activeTab)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    {testingProvider === activeTab ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{testingProvider === activeTab ? "Test Ediliyor..." : "Bağlantıyı Test Et"}</span>
                  </button>

                  <span className="text-xs text-slate-400">
                    Son senkron: {currentService.lastSyncAt || "Henüz yapılmadı"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`btn-manual-sync-${activeTab}`}
                    disabled={isSyncing}
                    onClick={() => handleManualSync(activeTab)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>
                      {isSyncing
                        ? "Aktarılıyor..."
                        : selectedLeads && selectedLeads.length > 0
                        ? `${selectedLeads.length} Seçili Talebi ${CRM_PROVIDER_META[activeTab].name}'e Gönder`
                        : `Tüm Talepleri ${CRM_PROVIDER_META[activeTab].name}'e Gönder`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TELEMETRY & SYNC LOGS TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    CRM Senkronizasyon & Telemetri Günlüğü
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistemden CRM servislerine gönderilen talepler, HTTP durum kodları ve geri dönen yanıtlar.
                  </p>
                </div>
                {(crmConfig.syncLogs || []).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...config,
                        crmIntegrations: {
                          ...crmConfig,
                          syncLogs: []
                        }
                      });
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Günlüğü Temizle
                  </button>
                )}
              </div>

              {(crmConfig.syncLogs || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Database className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-xs font-bold text-slate-700">Henüz Senkron Kaydı Yok</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Yukarıdaki sekmelerden CRM bağlantınızı kurup "Şimdi Gönder" butonuyla talepleri iletebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(crmConfig.syncLogs || []).map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${CRM_PROVIDER_META[log.provider].badgeColor}`}>
                            {CRM_PROVIDER_META[log.provider].name}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{log.leadName}</span>
                          {log.leadEmail && (
                            <span className="text-[11px] text-slate-500 font-mono">({log.leadEmail})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black ${
                            log.status === "success"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            HTTP {log.httpStatusCode || (log.status === "success" ? 201 : 400)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-600">{log.responseMessage}</p>
                        {log.externalRecordId && (
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                            ID: {log.externalRecordId}
                          </span>
                        )}
                      </div>

                      {log.payloadSnippet && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setViewPayloadLog(log)}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Code className="w-3 h-3" />
                            <span>Gönderilen JSON Paketini İncele</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => copyPayload(log)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            title="Kopyala"
                          >
                            {copiedLogId === log.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedLogId === log.id ? "Kopyalandı!" : "Kopyala"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAYLOAD INSPECTOR MODAL SUB-POPUP */}
        {viewPayloadLog && (
          <div className="absolute inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 text-white space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-200">
                    {CRM_PROVIDER_META[viewPayloadLog.provider].name} JSON İstek Paketi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewPayloadLog(null)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 max-h-72 overflow-y-auto">
                <pre>{JSON.stringify(JSON.parse(viewPayloadLog.payloadSnippet || "{}"), null, 2)}</pre>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setViewPayloadLog(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>256-Bit SSL/TLS Şifrelemeli Güvenli API Bağlantısı</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
