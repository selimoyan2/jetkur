import { FormLead, CrmIntegrationConfig, CrmProviderType, CrmServiceSetting, CrmSyncLog, SiteConfig } from "../types";

export const CRM_PROVIDER_META: Record<CrmProviderType, {
  name: string;
  tagline: string;
  badgeColor: string;
  iconType: string;
  defaultEndpoint: string;
  authPlaceholder: string;
  docUrl: string;
  capabilities: string[];
}> = {
  hubspot: {
    name: "HubSpot CRM",
    tagline: "Kişi (Contact) ve Anlaşma (Deal) senkronizasyonu",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    iconType: "hubspot",
    defaultEndpoint: "https://api.hubapi.com/crm/v3/objects/contacts",
    authPlaceholder: "pat-eu1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (Private App Token)",
    docUrl: "https://developers.hubspot.com/docs/api/crm/contacts",
    capabilities: ["Otomatik Kişi Oluşturma", "Satış Boru Hattı (Deals) Eşleme", "Yaşam Döngüsü Aşaması (Lifecycle Stage)", "Web Ziyaretçi Çerezi Entegrasyonu"]
  },
  salesforce: {
    name: "Salesforce CRM",
    tagline: "Kurumsal Müşteri Adayı (Lead) ve Fırsat (Opportunity) aktarımı",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    iconType: "salesforce",
    defaultEndpoint: "https://your-instance.my.salesforce.com/services/data/v59.0/sobjects/Lead",
    authPlaceholder: "00D5g00000xxxx!AQ0AQLxxxxxxxxxx (OAuth Bearer Token / Connected App)",
    docUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/",
    capabilities: ["Standart & Özel Lead Alanları", "Bant Atama Kuralları (Assignment Rules)", "Org-ID Güvenliği", "Sandbox & Canlı Ortam Desteği"]
  },
  zoho: {
    name: "Zoho CRM",
    tagline: "Küresel KOBİ satış modülleri ve potansiyel müşteri havuzu",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    iconType: "zoho",
    defaultEndpoint: "https://www.zohoapis.com/crm/v2/Leads",
    authPlaceholder: "1000.xxxx.xxxx (Zoho OAuth Access Token)",
    docUrl: "https://www.zoho.com/crm/developer/docs/api/v2/",
    capabilities: ["Leads & Contacts Modülü", "Avrupa Veri Merkezi (.eu) Uyumu", "Puanlama Skoru Senkronu"]
  },
  pipedrive: {
    name: "Pipedrive CRM",
    tagline: "Görsel satış hattı, kişi ve anlaşma otomasyonu",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconType: "pipedrive",
    defaultEndpoint: "https://api.pipedrive.com/v1/persons",
    authPlaceholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Kişisel API Token)",
    docUrl: "https://developers.pipedrive.com/docs/api/v1",
    capabilities: ["Kişi & Kuruluş Eşleme", "Otomatik Aşama İlerletme", "Özel Satış Değeri (Deal Value)"]
  },
  webhook: {
    name: "Zapier / Make / Webhook",
    tagline: "Herhangi bir CRM, ERP veya otomasyon aracıyla anında HTTP POST bağlantısı",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    iconType: "webhook",
    defaultEndpoint: "https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/",
    authPlaceholder: "Bearer token veya gizli imza anahtarı (opsiyonel)",
    docUrl: "https://zapier.com/apps/webhook/integrations",
    capabilities: ["Tüm JSON Şemasını İletme", "Özel Başlıklar (Custom Headers)", "Gecikmesiz Anlık Tetikleme", "Zapier, Make, n8n Uyumu"]
  }
};

/**
 * Returns default CRM Integration Configuration with realistic pre-configured settings
 */
export function getDefaultCrmConfig(): CrmIntegrationConfig {
  return {
    activeProvider: "hubspot",
    globalAutoSync: true,
    services: {
      hubspot: {
        enabled: true,
        apiKey: "pat-eu1-98a4b2c1-demo-production-key",
        portalId: "48291034",
        instanceUrl: "https://api.hubapi.com/crm/v3/objects/contacts",
        pipelineId: "default",
        dealStage: "lead",
        autoSyncNewLeads: true,
        environment: "production",
        status: "connected",
        statusMessage: "HubSpot Private App API aktif ve yetkilendirildi. Scopes: contacts.write, deals.write",
        lastSyncAt: new Date(Date.now() - 3600000 * 2).toLocaleString("tr-TR"),
        fieldMappings: {
          nameField: "firstname,lastname",
          emailField: "email",
          phoneField: "phone",
          messageField: "message",
          dealValueField: "amount",
          serviceField: "hs_lead_status"
        }
      },
      salesforce: {
        enabled: false,
        apiKey: "00D5g0000001aBC!AQ0AQLx987654321demo",
        portalId: "00D5g0000001aBC",
        instanceUrl: "https://hizliweb-demo.my.salesforce.com",
        pipelineId: "StandardLeadPipeline",
        dealStage: "Open - Not Contacted",
        autoSyncNewLeads: false,
        environment: "sandbox",
        status: "disconnected",
        statusMessage: "Bağlantı kurulmadı. Token girilip 'Bağlantıyı Test Et' butonuna tıklayınız.",
        fieldMappings: {
          nameField: "LastName",
          emailField: "Email",
          phoneField: "Phone",
          messageField: "Description",
          dealValueField: "AnnualRevenue",
          serviceField: "Industry"
        }
      },
      zoho: {
        enabled: false,
        apiKey: "",
        instanceUrl: "https://www.zohoapis.eu/crm/v2/Leads",
        autoSyncNewLeads: false,
        status: "disconnected",
        statusMessage: "Yapılandırılmadı"
      },
      pipedrive: {
        enabled: false,
        apiKey: "",
        instanceUrl: "https://api.pipedrive.com/v1/persons",
        autoSyncNewLeads: false,
        status: "disconnected",
        statusMessage: "Yapılandırılmadı"
      },
      webhook: {
        enabled: false,
        webhookUrl: "https://hooks.zapier.com/hooks/catch/941829/om8192/",
        autoSyncNewLeads: false,
        status: "disconnected",
        statusMessage: "Zapier / Make webhook URL'si bekleniyor"
      }
    },
    syncLogs: [
      {
        id: "crm-log-1",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString("tr-TR"),
        provider: "hubspot",
        leadId: "lead-1",
        leadName: "Mehmet Kaya",
        leadEmail: "mehmet.kaya@gmail.com",
        status: "success",
        httpStatusCode: 201,
        responseMessage: "HubSpot Contact & Deal başarıyla oluşturuldu.",
        externalRecordId: "hs-contact-8491024",
        payloadSnippet: '{"properties":{"firstname":"Mehmet","lastname":"Kaya","email":"mehmet.kaya@gmail.com","phone":"0532 111 22 33","message":"Akü takviyesi ve oto kurtarma talebi"}}'
      },
      {
        id: "crm-log-2",
        timestamp: new Date(Date.now() - 3600000 * 6).toLocaleString("tr-TR"),
        provider: "hubspot",
        leadId: "lead-2",
        leadName: "Ayşe Demir",
        leadEmail: "ayse.demir@hotmail.com",
        status: "success",
        httpStatusCode: 200,
        responseMessage: "HubSpot kaydı güncellendi ve 'İletişime Geçildi' aşamasına aktarıldı.",
        externalRecordId: "hs-contact-8491025",
        payloadSnippet: '{"properties":{"firstname":"Ayşe","lastname":"Demir","amount":"3500","dealstage":"contacted"}}'
      }
    ]
  };
}

/**
 * Tests the connection to a CRM provider
 */
export async function testCrmConnection(
  provider: CrmProviderType,
  setting: CrmServiceSetting
): Promise<{ success: boolean; latencyMs: number; verifiedScopes: string[]; message: string }> {
  // Simulate network roundtrip latency for realistic testing
  await new Promise(resolve => setTimeout(resolve, 600));

  if (!setting.apiKey && provider !== "webhook") {
    return {
      success: false,
      latencyMs: 85,
      verifiedScopes: [],
      message: `${CRM_PROVIDER_META[provider].name} API Key / Private App Token alanı boş bırakılamaz.`
    };
  }

  if (provider === "webhook" && !setting.webhookUrl) {
    return {
      success: false,
      latencyMs: 70,
      verifiedScopes: [],
      message: "Webhook için geçerli bir HTTP/HTTPS hedef URL'si girmelisiniz."
    };
  }

  const scopesMap: Record<CrmProviderType, string[]> = {
    hubspot: ["crm.objects.contacts.write", "crm.objects.contacts.read", "crm.objects.deals.write", "crm.schemas.custom.read"],
    salesforce: ["api", "refresh_token", "web", "id"],
    zoho: ["ZohoCRM.modules.leads.CREATE", "ZohoCRM.modules.leads.UPDATE"],
    pipedrive: ["persons:full", "deals:full"],
    webhook: ["http.post.json", "rfc.payload.utf8"]
  };

  return {
    success: true,
    latencyMs: Math.floor(Math.random() * 40) + 95, // 95 - 135 ms
    verifiedScopes: scopesMap[provider] || ["api.write"],
    message: `${CRM_PROVIDER_META[provider].name} bağlantısı başarıyla doğrulandı! (${setting.environment === "sandbox" ? "Sandbox Test Ortamı" : "Canlı Üretim Ortamı"})`
  };
}

/**
 * Syncs a batch of leads to the specified CRM service
 */
export async function syncLeadsToCrm(
  leads: FormLead[],
  provider: CrmProviderType,
  setting: CrmServiceSetting,
  companyName?: string
): Promise<{ success: boolean; syncedCount: number; logs: CrmSyncLog[]; message: string }> {
  if (leads.length === 0) {
    return {
      success: false,
      syncedCount: 0,
      logs: [],
      message: "Senkronize edilecek müşteri talebi (lead) seçilmedi."
    };
  }

  // Realistic simulation latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const newLogs: CrmSyncLog[] = leads.map((lead, idx) => {
    const isError = setting.status === "error";
    const externalId = `${provider.slice(0, 2)}-rec-${Date.now().toString().slice(-6)}${idx}`;
    const nameParts = lead.name.split(" ");
    const firstName = nameParts[0] || lead.name;
    const lastName = nameParts.slice(1).join(" ") || "-";

    let payload: any = {};
    if (provider === "hubspot") {
      payload = {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: lead.email || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}@ornek.com`,
          phone: lead.phone,
          message: lead.message,
          hs_lead_status: lead.status === "closed" ? "CUSTOMER" : lead.status === "offered" ? "OPPORTUNITY" : "OPEN",
          service_requested: lead.serviceOrProduct,
          deal_value: lead.dealValue || 0,
          company: companyName || "HızlıWeb Müşterisi"
        }
      };
    } else if (provider === "salesforce") {
      payload = {
        attributes: { type: "Lead" },
        FirstName: firstName,
        LastName: lastName,
        Company: companyName || "HızlıWeb Talep Formu",
        Email: lead.email || "musteri@ornek.com",
        Phone: lead.phone,
        Description: lead.message,
        Status: lead.status === "closed" ? "Closed - Converted" : "Working - Contacted",
        AnnualRevenue: lead.dealValue || 0
      };
    } else {
      payload = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.serviceOrProduct,
        message: lead.message,
        dealValue: lead.dealValue,
        status: lead.status,
        date: lead.date,
        tags: lead.tags || []
      };
    }

    return {
      id: `crm-log-${Date.now()}-${idx}`,
      timestamp: new Date().toLocaleString("tr-TR"),
      provider,
      leadId: lead.id,
      leadName: lead.name,
      leadEmail: lead.email,
      status: isError ? "error" : "success",
      httpStatusCode: isError ? 401 : 201,
      responseMessage: isError
        ? "Yetkilendirme hatası: Geçersiz API anahtarı."
        : `${CRM_PROVIDER_META[provider].name} üzerinde '${lead.name}' kaydı başarıyla oluşturuldu ve eşlendi.`,
      externalRecordId: isError ? undefined : externalId,
      payloadSnippet: JSON.stringify(payload)
    };
  });

  return {
    success: setting.status !== "error",
    syncedCount: leads.length,
    logs: newLogs,
    message: `${leads.length} adet müşteri talebi ${CRM_PROVIDER_META[provider].name} servisine başarıyla aktarıldı!`
  };
}

/**
 * Automatically syncs a newly arrived lead if CRM auto-sync is enabled in config
 */
export function autoSyncNewLeadIfEnabled(
  lead: FormLead,
  config: SiteConfig
): { updatedConfig: SiteConfig; log?: CrmSyncLog } {
  const crm = config.crmIntegrations;
  if (!crm || !crm.globalAutoSync) {
    return { updatedConfig: config };
  }

  const activeProvider = crm.activeProvider;
  const serviceSetting = crm.services[activeProvider];

  if (!serviceSetting || !serviceSetting.enabled || serviceSetting.status !== "connected") {
    return { updatedConfig: config };
  }

  if (serviceSetting.autoSyncNewLeads === false) {
    return { updatedConfig: config };
  }

  const nameParts = lead.name.split(" ");
  const firstName = nameParts[0] || lead.name;
  const lastName = nameParts.slice(1).join(" ") || "-";
  const externalId = `${activeProvider.slice(0, 2)}-auto-${Date.now().toString().slice(-6)}`;

  const log: CrmSyncLog = {
    id: `crm-log-${Date.now()}`,
    timestamp: new Date().toLocaleString("tr-TR"),
    provider: activeProvider,
    leadId: lead.id,
    leadName: lead.name,
    leadEmail: lead.email,
    status: "success",
    httpStatusCode: 201,
    responseMessage: `Otomatik Anlık Senkron: ${CRM_PROVIDER_META[activeProvider].name} servisine iletildi.`,
    externalRecordId: externalId,
    payloadSnippet: JSON.stringify({
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      service: lead.serviceOrProduct,
      message: lead.message
    })
  };

  const updatedConfig: SiteConfig = {
    ...config,
    crmIntegrations: {
      ...crm,
      services: {
        ...crm.services,
        [activeProvider]: {
          ...serviceSetting,
          lastSyncAt: new Date().toLocaleString("tr-TR")
        }
      },
      syncLogs: [log, ...(crm.syncLogs || [])].slice(0, 100) // Keep last 100 logs
    }
  };

  return { updatedConfig, log };
}
