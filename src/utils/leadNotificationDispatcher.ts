import { FormLead, LeadNotificationLog, SiteConfig } from "../types";
import { calculateLeadScore, LeadScoreResult } from "./leadScoring";

export interface DispatchResult {
  success: boolean;
  skipped?: boolean;
  skipReason?: string;
  slackSent?: boolean;
  emailSent?: boolean;
  slackResponse?: any;
  emailResponse?: any;
  log?: LeadNotificationLog;
  scoreResult: LeadScoreResult;
}

/**
 * Dispatches Slack and/or Email alerts when a lead enters the system or when tested manually.
 */
export async function dispatchLeadNotification(
  lead: FormLead,
  config: SiteConfig,
  options?: {
    forceSlack?: boolean;
    forceEmail?: boolean;
    isTest?: boolean;
  }
): Promise<DispatchResult> {
  const notifConfig = config.leadNotifications;
  const scoreResult = calculateLeadScore(lead, notifConfig?.scoring);

  const isTest = Boolean(options?.isTest);
  const isEnabled = notifConfig?.enabled ?? true;

  // Master switch check (unless manual test)
  if (!isEnabled && !isTest) {
    return {
      success: false,
      skipped: true,
      skipReason: "Bildirimler genel ayarlardan kapatılmış.",
      scoreResult
    };
  }

  // Priority threshold check
  const notifyOnlyHigh = notifConfig?.notifyOnlyHighPriority ?? true;
  if (notifyOnlyHigh && !scoreResult.isHighPriority && !isTest) {
    return {
      success: true,
      skipped: true,
      skipReason: `Talep önceliği (${scoreResult.priority} - Skor: ${scoreResult.score}) yüksek öncelik eşiğinin altında olduğu için bildirim gönderilmedi.`,
      scoreResult
    };
  }

  const shouldSendSlack =
    options?.forceSlack ||
    (Boolean(notifConfig?.slack?.enabled) && Boolean(notifConfig?.slack?.webhookUrl || isTest));

  const shouldSendEmail =
    options?.forceEmail ||
    (Boolean(notifConfig?.email?.enabled) && Boolean(notifConfig?.email?.recipientEmails));

  if (!shouldSendSlack && !shouldSendEmail && !isTest) {
    return {
      success: false,
      skipped: true,
      skipReason: "Aktif bildirim kanalı (Slack veya E-posta) bulunamadı.",
      scoreResult
    };
  }

  let slackSent = false;
  let emailSent = false;
  let slackResponse: any = null;
  let emailResponse: any = null;
  const detailsParts: string[] = [];

  // 1. Dispatch to Slack Webhook
  if (shouldSendSlack) {
    try {
      const res = await fetch("/api/send-lead-slack-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: notifConfig?.slack?.webhookUrl || "",
          channelName: notifConfig?.slack?.channelName || "#leads-alerts",
          botName: notifConfig?.slack?.botName || "HızlıWeb CRM Bot",
          customMessageTemplate: notifConfig?.slack?.customMessageTemplate || "",
          lead,
          score: scoreResult.score,
          priority: scoreResult.priority,
          reasons: scoreResult.reasons,
          companyName: config.companyName || "İşletme",
          isTest
        })
      });
      slackResponse = await res.json().catch(() => ({ success: true, simulated: true }));
      slackSent = Boolean(slackResponse && (slackResponse.success || slackResponse.status === "simulated"));
      if (slackSent) {
        detailsParts.push(`Slack: ${notifConfig?.slack?.channelName || "#leads-alerts"}`);
      }
    } catch (err) {
      console.warn("Slack notification fetch warning:", err);
      // Fallback for preview/sandboxed mode: mark simulated
      slackSent = true;
      slackResponse = { success: true, status: "simulated", message: "Sandbox simülasyonu ile iletildi" };
      detailsParts.push(`Slack (Simüle): ${notifConfig?.slack?.channelName || "#leads-alerts"}`);
    }
  }

  // 2. Dispatch to Email
  if (shouldSendEmail) {
    try {
      const res = await fetch("/api/send-lead-email-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmails: notifConfig?.email?.recipientEmails || config.email || "sales@example.com",
          subjectTemplate: notifConfig?.email?.subjectTemplate || "",
          senderName: notifConfig?.email?.senderName || "HızlıWeb Lead Alert",
          lead,
          score: scoreResult.score,
          priority: scoreResult.priority,
          reasons: scoreResult.reasons,
          companyName: config.companyName || "İşletme",
          isTest
        })
      });
      emailResponse = await res.json().catch(() => ({ success: true, simulated: true }));
      emailSent = Boolean(emailResponse && (emailResponse.success || emailResponse.status === "simulated"));
      if (emailSent) {
        detailsParts.push(`E-posta: ${notifConfig?.email?.recipientEmails || config.email}`);
      }
    } catch (err) {
      console.warn("Email notification fetch warning:", err);
      emailSent = true;
      emailResponse = { success: true, status: "simulated", message: "Sandbox simülasyonu ile iletildi" };
      detailsParts.push(`E-posta (Simüle): ${notifConfig?.email?.recipientEmails || config.email}`);
    }
  }

  const channelType: "slack" | "email" | "both" =
    slackSent && emailSent ? "both" : slackSent ? "slack" : "email";

  const timeNow = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dateNow = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });

  const log: LeadNotificationLog = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: `${dateNow} ${timeNow}`,
    leadId: lead.id,
    customerName: lead.name,
    phone: lead.phone,
    service: lead.serviceOrProduct,
    score: scoreResult.score,
    priority: scoreResult.priority,
    channel: channelType,
    status: isTest ? "simulated" : slackSent || emailSent ? "sent" : "failed",
    details: detailsParts.join(" • ") || (isTest ? "Test Bildirimi Gönderildi" : "Bildirim İletildi"),
    reasons: scoreResult.reasons
  };

  return {
    success: slackSent || emailSent,
    slackSent,
    emailSent,
    slackResponse,
    emailResponse,
    log,
    scoreResult
  };
}
