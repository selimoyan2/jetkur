import {
  FormLead,
  LeadAutomationActionConfig,
  LeadAutomationCondition,
  LeadAutomationConfig,
  LeadAutomationExecutionLog,
  LeadAutomationRule,
  LeadAcquisitionSource,
  LeadCommunicationChannel,
  SiteConfig
} from "../types";
import { calculateLeadScore } from "./leadScoring";

/**
 * Detects the dominant communication channel for a lead based on sourcePage,
 * tags, or messages.
 */
export function detectLeadChannel(lead: FormLead): LeadCommunicationChannel {
  const source = (lead.sourcePage || "").toLowerCase();
  const tags = (lead.tags || []).map(t => t.toLowerCase());

  if (source.includes("whatsapp") || tags.some(t => t.includes("whatsapp"))) {
    return "whatsapp";
  }
  if (
    source.includes("telefon") ||
    source.includes("call") ||
    tags.some(t => t.includes("telefon") || t.includes("arama"))
  ) {
    return "phone";
  }
  if (source.includes("email") || source.includes("posta")) {
    return "email";
  }
  return "form";
}

/**
 * Checks if a lead meets the trigger conditions of a rule.
 */
export function doesLeadMatchRule(
  lead: FormLead,
  rule: LeadAutomationRule,
  config?: SiteConfig
): { matches: boolean; reasons: string[] } {
  if (!rule.enabled) {
    return { matches: false, reasons: ["Kural devre dışı."] };
  }

  const cond = rule.conditions;
  const reasons: string[] = [];

  // 1. Score Condition
  const scoreResult = calculateLeadScore(lead, config?.leadNotifications?.scoring);
  const score = scoreResult.score;

  if (cond.scoreFilterType === "gte" && cond.minScore !== undefined) {
    if (score >= cond.minScore) {
      reasons.push(`Skor (${score}) >= ${cond.minScore} şartını sağladı.`);
    } else {
      return {
        matches: false,
        reasons: [`Skor (${score}) minimum eşik olan ${cond.minScore}'den düşük.`]
      };
    }
  } else if (cond.scoreFilterType === "lte" && cond.maxScore !== undefined) {
    if (score <= cond.maxScore) {
      reasons.push(`Skor (${score}) <= ${cond.maxScore} şartını sağladı.`);
    } else {
      return {
        matches: false,
        reasons: [`Skor (${score}) tavan eşik olan ${cond.maxScore}'den yüksek.`]
      };
    }
  } else if (cond.scoreFilterType === "tier" && cond.scoreTier) {
    if (scoreResult.priority === cond.scoreTier) {
      reasons.push(`Skor kademesi (${scoreResult.priority}) kural ile eşleşti.`);
    } else {
      return {
        matches: false,
        reasons: [`Skor kademesi (${scoreResult.priority}) aranan ${cond.scoreTier} ile eşleşmedi.`]
      };
    }
  }

  // 2. Acquisition Source Condition
  const leadSource: LeadAcquisitionSource = lead.acquisitionChannel || "organic";
  const allowsAllSources = cond.sources.includes("all") || cond.sources.length === 0;

  if (!allowsAllSources) {
    if (cond.sources.includes(leadSource)) {
      reasons.push(`Edinme kaynağı (${leadSource}) kural kaynağı ile eşleşti.`);
    } else {
      return {
        matches: false,
        reasons: [`Edinme kaynağı (${leadSource}) kuralda seçili kaynaklar arasında değil.`]
      };
    }
  }

  // 3. Communication Channel Condition
  const leadChannel = detectLeadChannel(lead);
  const allowsAllChannels = cond.channels.includes("all") || cond.channels.length === 0;

  if (!allowsAllChannels) {
    if (cond.channels.includes(leadChannel)) {
      reasons.push(`İletişim kanalı (${leadChannel}) kural ile eşleşti.`);
    } else {
      return {
        matches: false,
        reasons: [`İletişim kanalı (${leadChannel}) kuralda seçili kanallar arasında değil.`]
      };
    }
  }

  // 4. Minimum Deal Value Condition (Optional)
  if (cond.minDealValue !== undefined && cond.minDealValue > 0) {
    const dealVal = lead.dealValue || 0;
    if (dealVal >= cond.minDealValue) {
      reasons.push(`Tahmini ciro (${dealVal} ₺) >= ${cond.minDealValue} ₺ şartını sağladı.`);
    } else {
      return {
        matches: false,
        reasons: [`Tahmini ciro (${dealVal} ₺) aranan ${cond.minDealValue} ₺ eşiğinin altında.`]
      };
    }
  }

  // 5. Keyword Condition (Optional)
  if (cond.keywords && cond.keywords.length > 0) {
    const fullText = `${lead.message} ${lead.serviceOrProduct}`.toLowerCase();
    const matchedKeyword = cond.keywords.find(kw => fullText.includes(kw.toLowerCase().trim()));
    if (matchedKeyword) {
      reasons.push(`Mesajda aranan anahtar kelime bulundu: "${matchedKeyword}".`);
    } else {
      return {
        matches: false,
        reasons: [`Metinde aranan anahtar kelimelerden hiçbiri bulunamadı (${cond.keywords.join(", ")}).`]
      };
    }
  }

  return { matches: true, reasons };
}

/**
 * Executes the actions of a single rule on a lead, returning the modified lead,
 * executed action logs, and execution record.
 */
export function executeRuleOnLead(
  lead: FormLead,
  rule: LeadAutomationRule,
  config?: SiteConfig
): {
  updatedLead: FormLead;
  executedActions: string[];
  log: LeadAutomationExecutionLog;
} {
  const updatedLead: FormLead = { ...lead };
  const executedActions: string[] = [];
  const scoreResult = calculateLeadScore(lead, config?.leadNotifications?.scoring);

  // 1. CRM Actions
  if (rule.actions.crm.enabled) {
    // Tags
    if (rule.actions.crm.tagsToAdd && rule.actions.crm.tagsToAdd.length > 0) {
      const existingTags = new Set(updatedLead.tags || []);
      rule.actions.crm.tagsToAdd.forEach(tag => existingTags.add(tag));
      updatedLead.tags = Array.from(existingTags);
      executedActions.push(`CRM Etiketi Eklendi: ${rule.actions.crm.tagsToAdd.join(", ")}`);
    }

    // Status Update
    if (rule.actions.crm.updateStatus && rule.actions.crm.updateStatus !== "none") {
      updatedLead.status = rule.actions.crm.updateStatus;
      executedActions.push(`Müşteri Durumu Güncellendi: "${rule.actions.crm.updateStatus}"`);
    }

    // Agent Assignment
    if (rule.actions.crm.assignedAgent) {
      const assignedTag = `Temsilci: ${rule.actions.crm.assignedAgent}`;
      const existingTags = new Set(updatedLead.tags || []);
      existingTags.add(assignedTag);
      updatedLead.tags = Array.from(existingTags);
      executedActions.push(`Temsilciye Atandı: "${rule.actions.crm.assignedAgent}"`);
    }

    // Internal Note
    if (rule.actions.crm.internalNote) {
      const currentNotes = updatedLead.privateNotes || updatedLead.dealNotes || "";
      const timestamp = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      const newNote = `[Otomasyon - ${timestamp}]: ${rule.actions.crm.internalNote}`;
      updatedLead.privateNotes = currentNotes ? `${newNote}\n${currentNotes}` : newNote;
      executedActions.push(`Dahili CRM Notu Eklendi`);
    }

    // Mark Urgent
    if (rule.actions.crm.markUrgent) {
      const existingTags = new Set(updatedLead.tags || []);
      existingTags.add("🚨 Acil");
      updatedLead.tags = Array.from(existingTags);
      executedActions.push(`Acil Durum Olarak İşaretlendi`);
    }
  }

  // 2. Notification Actions
  if (rule.actions.notification.enabled) {
    const channels = rule.actions.notification.channels.join(", ");
    executedActions.push(
      `Yöneticiye Bildirim Tetiklendi (${channels}): "${rule.actions.notification.alertTitle || "Yeni Lead Uyarısı"}" -> ${rule.actions.notification.managerEmails || "selimoyan@gmail.com"}`
    );
  }

  // 3. Custom Email Trigger
  if (rule.actions.email.enabled) {
    const target =
      rule.actions.email.recipientType === "lead"
        ? `Müşteri (${lead.email || lead.name})`
        : rule.actions.email.recipientType === "staff"
        ? `Satış Ekibi (${rule.actions.email.staffEmails || "satis@firma.com"})`
        : `Müşteri & Ekip`;
    executedActions.push(
      `Özel E-posta Tetiklendi: "${rule.actions.email.subjectTemplate || "Talep Bilgilendirmesi"}" -> ${target}`
    );
  }

  // 4. Webhook Trigger
  if (rule.actions.webhook?.enabled && rule.actions.webhook.url) {
    executedActions.push(`Harici Webhook Tetiklendi: ${rule.actions.webhook.url}`);
  }

  const now = new Date();
  const log: LeadAutomationExecutionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }),
    ruleId: rule.id,
    ruleName: rule.name,
    leadId: lead.id,
    leadName: lead.name,
    leadScore: scoreResult.score,
    leadSource: lead.acquisitionChannel || "organic",
    leadChannel: detectLeadChannel(lead),
    actionsExecuted: executedActions,
    status: "success",
    details: `${executedActions.length} adet otomatik aksiyon başarıyla yürütüldü.`
  };

  return { updatedLead, executedActions, log };
}

/**
 * Runs all active automation rules on a single newly arrived or simulated lead.
 */
export function runAllAutomationRulesOnLead(
  lead: FormLead,
  config: SiteConfig
): {
  updatedLead: FormLead;
  executedRulesCount: number;
  logs: LeadAutomationExecutionLog[];
} {
  const automations = config.leadAutomations;
  if (!automations || !automations.enabled || !automations.rules) {
    return { updatedLead: lead, executedRulesCount: 0, logs: [] };
  }

  let currentLead = { ...lead };
  const newLogs: LeadAutomationExecutionLog[] = [];
  let count = 0;

  for (const rule of automations.rules) {
    if (!rule.enabled) continue;

    const matchResult = doesLeadMatchRule(currentLead, rule, config);
    if (matchResult.matches) {
      const { updatedLead: resLead, log } = executeRuleOnLead(currentLead, rule, config);
      currentLead = resLead;
      newLogs.push(log);
      count++;
    }
  }

  return {
    updatedLead: currentLead,
    executedRulesCount: count,
    logs: newLogs
  };
}

/**
 * Batch runs rules over a list of leads.
 */
export function batchRunRulesOnLeads(
  leads: FormLead[],
  config: SiteConfig,
  targetRuleIds?: string[]
): {
  updatedLeads: FormLead[];
  matchedCount: number;
  newLogs: LeadAutomationExecutionLog[];
} {
  const automations = config.leadAutomations;
  if (!automations || !automations.rules) {
    return { updatedLeads: leads, matchedCount: 0, newLogs: [] };
  }

  const rulesToRun = automations.rules.filter(
    r => r.enabled && (!targetRuleIds || targetRuleIds.includes(r.id))
  );

  let matchedLeadsCount = 0;
  const newLogs: LeadAutomationExecutionLog[] = [];

  const updatedLeads = leads.map(lead => {
    let currentLead = { ...lead };
    let wasMatched = false;

    for (const rule of rulesToRun) {
      const match = doesLeadMatchRule(currentLead, rule, config);
      if (match.matches) {
        const { updatedLead: resLead, log } = executeRuleOnLead(currentLead, rule, config);
        currentLead = resLead;
        newLogs.push(log);
        wasMatched = true;
      }
    }

    if (wasMatched) matchedLeadsCount++;
    return currentLead;
  });

  return {
    updatedLeads,
    matchedCount: matchedLeadsCount,
    newLogs
  };
}

/**
 * Pre-configured default lead automation rules for instant out-of-the-box utility.
 */
export const DEFAULT_LEAD_AUTOMATION_CONFIG: LeadAutomationConfig = {
  enabled: true,
  autoTriggerOnNewLead: true,
  rules: [
    {
      id: "rule-vip-high-score",
      name: "🔥 VIP & Yüksek Skorlu Talepleri Yöneticiye Aktar",
      description:
        "70 ve üzeri skor alan sıcak müşteri taleplerine anında VIP etiketi ekler, yöneticiye Slack/E-posta bildirir ve acil görüşme önceliği atar.",
      enabled: true,
      createdAt: "2026-08-15",
      lastTriggeredAt: "12 dakika önce",
      triggerCount: 14,
      conditions: {
        scoreFilterType: "gte",
        minScore: 70,
        sources: ["all"],
        channels: ["all"]
      },
      actions: {
        crm: {
          enabled: true,
          tagsToAdd: ["🔥 VIP Sıcak Lead", "Yüksek Skorlu"],
          updateStatus: "new",
          assignedAgent: "Kıdemli Portföy Yöneticisi",
          markUrgent: true,
          internalNote:
            "AI Skor motoru tarafından 70+ puan tespit edildi. Acil görüşme ve özel teklif çalışması başlatılmalı."
        },
        notification: {
          enabled: true,
          channels: ["email", "slack", "in_app"],
          managerEmails: "yonetici@hizliweb.com, selimoyan@gmail.com",
          slackChannel: "#leads-urgent",
          alertTitle: "🔥 VIP Lead Uyarısı: Yüksek Puanlı Müşteri Talebi",
          includeFullDetails: true
        },
        email: {
          enabled: true,
          recipientType: "lead",
          subjectTemplate: "Sayın {customer_name}, Talebiniz Öncelikli Sıraya Alındı",
          bodyTemplate:
            "Merhaba {customer_name},\n\nWeb sitemiz üzerinden ilettiğiniz {service} talebiniz uzman portföy yöneticimize iletilmiştir. İhtiyacınıza en uygun VIP çözümümüz için 15 dakika içinde sizinle iletişime geçilecektir.\n\nSaygılarımızla,\nSatış Departmanı"
        }
      }
    },
    {
      id: "rule-google-ads-followup",
      name: "🎯 Google Ads Reklam Taleplerine Hızlı Takip & Satış Bildirimi",
      description:
        "Sponsorlu Google Ads kampanyalarından gelen form ve teklif başvurularını etiketler, kampanya bütçesinin verimliliği için satış ekibine uyarı gönderir.",
      enabled: true,
      createdAt: "2026-08-20",
      lastTriggeredAt: "45 dakika önce",
      triggerCount: 9,
      conditions: {
        scoreFilterType: "any",
        sources: ["ads"],
        channels: ["form", "whatsapp"]
      },
      actions: {
        crm: {
          enabled: true,
          tagsToAdd: ["🎯 Google Ads Dönüşümü", "Sıcak Takip"],
          updateStatus: "new",
          assignedAgent: "Dijital Satış Temsilcisi",
          internalNote: "Google Ads arama kampanyası dönüşümüdür. Hemen dönüş yapılması kritik."
        },
        notification: {
          enabled: true,
          channels: ["slack", "in_app"],
          managerEmails: "pazarlama@hizliweb.com",
          slackChannel: "#ads-leads",
          alertTitle: "🎯 Yeni Google Ads Kampanya Talebi",
          includeFullDetails: true
        },
        email: {
          enabled: false,
          recipientType: "staff",
          subjectTemplate: "",
          bodyTemplate: ""
        }
      }
    },
    {
      id: "rule-direct-phone-whatsapp",
      name: "⚡ WhatsApp & Telefon Taleplerine Nöbetçi Ekip Ata",
      description:
        "Acil çağrı veya WhatsApp butonuna tıklayarak talep oluşturan müşterileri anında 7/24 nöbetçi ekibe atar ve anlık panel/mobil bildirimi tetikler.",
      enabled: true,
      createdAt: "2026-08-10",
      lastTriggeredAt: "2 saat önce",
      triggerCount: 21,
      conditions: {
        scoreFilterType: "any",
        sources: ["all"],
        channels: ["whatsapp", "phone"]
      },
      actions: {
        crm: {
          enabled: true,
          tagsToAdd: ["⚡ Doğrudan İletişim", "Acil Saha"],
          markUrgent: true,
          assignedAgent: "7/24 Nöbetçi Saha Operatörü",
          internalNote: "Müşteri doğrudan telefon veya WhatsApp ile ulaştı, hatta bekletilmemeli."
        },
        notification: {
          enabled: true,
          channels: ["email", "in_app"],
          managerEmails: "operasyon@hizliweb.com",
          alertTitle: "⚡ Doğrudan Çağrı / WhatsApp Talebi Oluştu",
          includeFullDetails: true
        },
        email: {
          enabled: false,
          recipientType: "lead",
          subjectTemplate: "",
          bodyTemplate: ""
        }
      }
    },
    {
      id: "rule-low-score-filter",
      name: "❄️ Düşük Puanlı & Eksik Bilgili Taleplere Ek Soru E-postası",
      description:
        "Skoru 40 ve altında kalan, mesajı veya iletişim detayı eksik talepleri etiketler ve otomatik detay talep e-postası tetikler.",
      enabled: true,
      createdAt: "2026-08-25",
      lastTriggeredAt: "Dün 17:30",
      triggerCount: 7,
      conditions: {
        scoreFilterType: "lte",
        maxScore: 40,
        sources: ["all"],
        channels: ["all"]
      },
      actions: {
        crm: {
          enabled: true,
          tagsToAdd: ["❄️ Düşük Öncelik", "Eksik Bilgi"],
          updateStatus: "contacted",
          assignedAgent: "Ön Destek Asistanı",
          internalNote: "Formda telefon veya detay eksik. E-posta ile ek bilgi talep edildi."
        },
        notification: {
          enabled: false,
          channels: ["in_app"],
          managerEmails: "",
          alertTitle: "",
          includeFullDetails: false
        },
        email: {
          enabled: true,
          recipientType: "lead",
          subjectTemplate: "Talebiniz Hakkında Ek Bilgi Talebi",
          bodyTemplate:
            "Merhaba {customer_name},\n\nWeb sitemiz üzerinden ilettiğiniz talep elimize ulaştı. Size en uygun teklifi ve operasyon planını hazırlayabilmemiz için detayları yanıtlamanızı rica ederiz.\n\nİyi günler dileriz."
        }
      }
    }
  ],
  executionLogs: [
    {
      id: "log-1",
      timestamp: "Bugün 15:42",
      ruleId: "rule-vip-high-score",
      ruleName: "🔥 VIP & Yüksek Skorlu Talepleri Yöneticiye Aktar",
      leadId: "lead-1",
      leadName: "Ahmet Yılmaz",
      leadScore: 92,
      leadSource: "organic",
      leadChannel: "form",
      actionsExecuted: [
        "CRM Etiketi Eklendi: '🔥 VIP Sıcak Lead', 'Yüksek Skorlu'",
        "Temsilciye Atandı: 'Kıdemli Portföy Yöneticisi'",
        "Yöneticiye Bildirim Gönderildi (email, slack)",
        "Özel E-posta Tetiklendi: Müşteri VIP Karşılama"
      ],
      status: "success",
      details: "4 adet otomatik aksiyon başarıyla uygulandı."
    },
    {
      id: "log-2",
      timestamp: "Bugün 14:10",
      ruleId: "rule-google-ads-followup",
      ruleName: "🎯 Google Ads Reklam Taleplerine Hızlı Takip & Satış Bildirimi",
      leadId: "lead-2",
      leadName: "Mehmet Kaya",
      leadScore: 84,
      leadSource: "ads",
      leadChannel: "form",
      actionsExecuted: [
        "CRM Etiketi Eklendi: '🎯 Google Ads Dönüşümü', 'Sıcak Takip'",
        "Temsilciye Atandı: 'Dijital Satış Temsilcisi'",
        "Slack Kanalına Bildirildi (#ads-leads)"
      ],
      status: "success",
      details: "Google Ads dönüşüm etiketi ve satış bildirimi iletildi."
    },
    {
      id: "log-3",
      timestamp: "Bugün 11:25",
      ruleId: "rule-direct-phone-whatsapp",
      ruleName: "⚡ WhatsApp & Telefon Taleplerine Nöbetçi Ekip Ata",
      leadId: "lead-3",
      leadName: "Ayşe Demir",
      leadScore: 68,
      leadSource: "social",
      leadChannel: "whatsapp",
      actionsExecuted: [
        "CRM Etiketi Eklendi: '⚡ Doğrudan İletişim', 'Acil Saha'",
        "7/24 Nöbetçi Operatöre Atandı",
        "Operasyon E-posta Bildirimi Gönderildi"
      ],
      status: "success",
      details: "WhatsApp üzerinden gelen talep acil nöbetçi ekibe yönlendirildi."
    },
    {
      id: "log-4",
      timestamp: "Dün 18:40",
      ruleId: "rule-low-score-filter",
      ruleName: "❄️ Düşük Puanlı & Eksik Bilgili Taleplere Ek Soru E-postası",
      leadId: "lead-test-cold",
      leadName: "Anonim Başvuru",
      leadScore: 25,
      leadSource: "organic",
      leadChannel: "form",
      actionsExecuted: [
        "CRM Etiketi Eklendi: '❄️ Düşük Öncelik', 'Eksik Bilgi'",
        "Durum 'contacted' Yapıldı",
        "Detay Talep E-postası Gönderildi"
      ],
      status: "success",
      details: "Eksik telefon ve mesaj içeren lead için otomatik bilgi e-postası tetiklendi."
    }
  ]
};
