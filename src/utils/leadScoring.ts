import { FormLead, LeadNotificationsConfig, LeadScoringConfig } from "../types";

export const DEFAULT_LEAD_SCORING_CONFIG: LeadScoringConfig = {
  minScoreForHighPriority: 70,
  highDealValueThreshold: 2500,
  urgentKeywords: [
    "acil",
    "hemen",
    "bugün",
    "fiyat",
    "teklif",
    "bütçe",
    "kurumsal",
    "filo",
    "randevu",
    "şirket",
    "ihale",
    "anlaşma",
    "yolda kaldım",
    "kaza",
    "çekici lazım"
  ],
  highPriorityTags: ["VIP", "Acil", "Kurumsal", "Yüksek Bütçe", "Sıcak Takip"],
  requirePhoneForHighPriority: true
};

export const DEFAULT_LEAD_NOTIFICATIONS_CONFIG: LeadNotificationsConfig = {
  enabled: true,
  notifyOnlyHighPriority: true,
  slack: {
    enabled: true,
    webhookUrl: "",
    channelName: "#leads-alerts",
    botName: "HızlıWeb CRM Bot",
    customMessageTemplate: ""
  },
  email: {
    enabled: true,
    recipientEmails: "selimoyan@gmail.com",
    subjectTemplate: "🚨 [YÜKSEK ÖNCELİK - Skor: {score}/100] Yeni Talep: {customer_name}",
    senderName: "HızlıWeb Satış Bildirim Sistemi"
  },
  scoring: DEFAULT_LEAD_SCORING_CONFIG,
  history: []
};

export interface LeadScoreFactor {
  category: string;
  label: string;
  points: number;
  maxPoints: number;
  matched: boolean;
  note?: string;
}

export interface LeadScoreResult {
  score: number; // 0 - 100
  priority: "high" | "medium" | "low";
  isHighPriority: boolean;
  reasons: string[];
  breakdown: LeadScoreFactor[];
}

/**
 * Calculates a comprehensive, transparent lead score (0-100) and priority level
 * based on form engagement signals (message length, phone number inclusion, contact completeness,
 * custom form fields, file uploads), deal value, intent/urgency keywords, and CRM tags.
 */
export function calculateLeadScore(
  lead: FormLead,
  userConfig?: Partial<LeadScoringConfig>
): LeadScoreResult {
  const cfg: LeadScoringConfig = {
    ...DEFAULT_LEAD_SCORING_CONFIG,
    ...(userConfig || {})
  };

  const breakdown: LeadScoreFactor[] = [];
  const reasons: string[] = [];
  let totalPoints = 0;

  // 1. Form Engagement Signal: Inclusion of Phone Number (0 - 25 points)
  const phoneDigits = (lead.phone || "").replace(/[^0-9]/g, "");
  const hasFullPhone = phoneDigits.length >= 10;
  const hasPartialPhone = phoneDigits.length >= 7 && phoneDigits.length < 10;

  if (hasFullPhone) {
    totalPoints += 25;
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "Telefon Numarası Eksiksiz İletildi",
      points: 25,
      maxPoints: 25,
      matched: true,
      note: lead.phone
    });
    reasons.push("Telefon numarası eksiksiz iletildi (+25)");
  } else if (hasPartialPhone) {
    totalPoints += 15;
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "Kısmi Telefon Numarası",
      points: 15,
      maxPoints: 25,
      matched: true,
      note: lead.phone
    });
    reasons.push("Kısmi telefon numarası (+15)");
  } else {
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "Telefon Numarası Belirtilmemiş",
      points: 0,
      maxPoints: 25,
      matched: false,
      note: "Ulaşılabilir telefon yok"
    });
  }

  // 2. Form Engagement Signal: Message Length & Context Depth (0 - 25 points)
  const messageText = (lead.message || "").trim();
  const msgLength = messageText.length;

  if (msgLength >= 100) {
    totalPoints += 25;
    breakdown.push({
      category: "Form Etkileşimi (Mesaj)",
      label: "Kapsamlı ve Detaylı Talep Mesajı (100+ Karakter)",
      points: 25,
      maxPoints: 25,
      matched: true,
      note: `${msgLength} karakter - Yüksek form ilgisi`
    });
    reasons.push(`Detaylı form mesajı (${msgLength} karakter, +25)`);
  } else if (msgLength >= 50) {
    totalPoints += 18;
    breakdown.push({
      category: "Form Etkileşimi (Mesaj)",
      label: "Açıklayıcı Talep Mesajı (50-99 Karakter)",
      points: 18,
      maxPoints: 25,
      matched: true,
      note: `${msgLength} karakter`
    });
    reasons.push(`Açıklayıcı form mesajı (${msgLength} karakter, +18)`);
  } else if (msgLength >= 20) {
    totalPoints += 10;
    breakdown.push({
      category: "Form Etkileşimi (Mesaj)",
      label: "Standart Form Mesajı (20-49 Karakter)",
      points: 10,
      maxPoints: 25,
      matched: true,
      note: `${msgLength} karakter`
    });
    reasons.push(`Standart mesaj (${msgLength} karakter, +10)`);
  } else if (msgLength > 0) {
    totalPoints += 4;
    breakdown.push({
      category: "Form Etkileşimi (Mesaj)",
      label: "Kısa Form Mesajı (<20 Karakter)",
      points: 4,
      maxPoints: 25,
      matched: true,
      note: `${msgLength} karakter`
    });
  } else {
    breakdown.push({
      category: "Form Etkileşimi (Mesaj)",
      label: "Mesaj Alanı Boş Bırakıldı",
      points: 0,
      maxPoints: 25,
      matched: false,
      note: "0 karakter"
    });
  }

  // 3. Form Engagement Signal: Email & Contact Completeness (0 - 15 points)
  const hasValidEmail = Boolean(lead.email && lead.email.includes("@") && lead.email.includes("."));
  if (hasValidEmail) {
    totalPoints += 10;
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "Doğrulanabilir E-Posta Adresi",
      points: 10,
      maxPoints: 10,
      matched: true,
      note: lead.email
    });
  } else {
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "E-Posta Belirtilmemiş",
      points: 0,
      maxPoints: 10,
      matched: false
    });
  }

  // Full Contact Bundle Bonus
  if (hasFullPhone && hasValidEmail) {
    totalPoints += 5;
    breakdown.push({
      category: "Form Etkileşimi (İletişim)",
      label: "Çift Yönlü İletişim Paketi (Telefon + E-posta)",
      points: 5,
      maxPoints: 5,
      matched: true,
      note: "Hem telefon hem e-posta mevcut"
    });
    reasons.push("Telefon ve e-posta birlikte sağlandı (+5)");
  }

  // 4. Form Engagement Signal: Custom Form Fields & Attachments (0 - 15 points)
  let customFieldsPoints = 0;
  const customFieldsCount = lead.customFields ? Object.keys(lead.customFields).filter(k => {
    const val = lead.customFields?.[k];
    return val !== undefined && val !== null && val !== "" && val !== false;
  }).length : 0;

  const hasAttachments = Boolean(lead.attachments && lead.attachments.length > 0);

  if (hasAttachments) {
    customFieldsPoints += 10;
    reasons.push(`Müşteri ${lead.attachments?.length} ekli dosya/doküman yükledi (+10)`);
  }

  if (customFieldsCount > 0) {
    customFieldsPoints += Math.min(10, customFieldsCount * 3 + 2);
    reasons.push(`${customFieldsCount} form detay alanı dolduruldu (+${Math.min(10, customFieldsCount * 3 + 2)})`);
  }

  if (lead.serviceOrProduct && lead.serviceOrProduct !== "Genel") {
    customFieldsPoints += 3;
  }

  const normalizedCustomPoints = Math.min(15, customFieldsPoints);
  if (normalizedCustomPoints > 0) {
    totalPoints += normalizedCustomPoints;
    breakdown.push({
      category: "Form Etkileşimi (Detay & Ek)",
      label: "Özel Form Alanları / Dosya Eki / Hizmet Tercihi",
      points: normalizedCustomPoints,
      maxPoints: 15,
      matched: true,
      note: `${customFieldsCount} form alanı, ${lead.attachments?.length || 0} dosya`
    });
  } else {
    breakdown.push({
      category: "Form Etkileşimi (Detay & Ek)",
      label: "Ek Form Alanı veya Dosya Bulunmuyor",
      points: 0,
      maxPoints: 15,
      matched: false
    });
  }

  // 5. Intent & Urgency Keywords in Form (0 - 20 points)
  const fullText = `${lead.message || ""} ${lead.serviceOrProduct || ""}`.toLowerCase();
  const matchedKeywords: string[] = [];

  (cfg.urgentKeywords || []).forEach(kw => {
    const cleanKw = kw.trim().toLowerCase();
    if (cleanKw && fullText.includes(cleanKw)) {
      if (!matchedKeywords.includes(cleanKw)) {
        matchedKeywords.push(cleanKw);
      }
    }
  });

  if (matchedKeywords.length >= 2) {
    totalPoints += 20;
    breakdown.push({
      category: "Niyet & Aciliyet",
      label: `Çoklu Acil/Satın Alma İfadesi (${matchedKeywords.slice(0, 3).join(", ")})`,
      points: 20,
      maxPoints: 20,
      matched: true,
      note: matchedKeywords.join(", ")
    });
    reasons.push(`Aciliyet/Niyet ifadeleri: "${matchedKeywords.slice(0, 2).join(", ")}" (+20)`);
  } else if (matchedKeywords.length === 1) {
    totalPoints += 12;
    breakdown.push({
      category: "Niyet & Aciliyet",
      label: `Öncelikli Niyet İfadesi: "${matchedKeywords[0]}"`,
      points: 12,
      maxPoints: 20,
      matched: true,
      note: matchedKeywords[0]
    });
    reasons.push(`Niyet ifadesi: "${matchedKeywords[0]}" (+12)`);
  } else {
    breakdown.push({
      category: "Niyet & Aciliyet",
      label: "Acil/Niyet Anahtar Kelimesi Bulunmadı",
      points: 0,
      maxPoints: 20,
      matched: false
    });
  }

  // 6. Deal Value & CRM High-Priority Boost (0 - 20 points)
  const dealVal = lead.dealValue || 0;
  const highThreshold = cfg.highDealValueThreshold || 2500;

  if (dealVal >= highThreshold * 2) {
    totalPoints += 20;
    breakdown.push({
      category: "Ciro & Bütçe",
      label: `Yüksek Tutar (₺${dealVal.toLocaleString("tr-TR")})`,
      points: 20,
      maxPoints: 20,
      matched: true,
      note: `>= ₺${(highThreshold * 2).toLocaleString("tr-TR")}`
    });
    reasons.push(`Yüksek bütçeli talep: ₺${dealVal.toLocaleString("tr-TR")} (+20)`);
  } else if (dealVal >= highThreshold) {
    totalPoints += 15;
    breakdown.push({
      category: "Ciro & Bütçe",
      label: `Bütçe Eşiğini Aşıyor (₺${dealVal.toLocaleString("tr-TR")})`,
      points: 15,
      maxPoints: 20,
      matched: true,
      note: `>= ₺${highThreshold.toLocaleString("tr-TR")}`
    });
    reasons.push(`Bütçe eşiği karşılandı: ₺${dealVal.toLocaleString("tr-TR")} (+15)`);
  } else if (dealVal > 0) {
    totalPoints += 8;
    breakdown.push({
      category: "Ciro & Bütçe",
      label: `Standart Tutar (₺${dealVal.toLocaleString("tr-TR")})`,
      points: 8,
      maxPoints: 20,
      matched: true
    });
  } else {
    // Check if message text mentions budget/money
    const msgText = `${lead.message || ""} ${lead.serviceOrProduct || ""}`.toLowerCase();
    const mentionsBudget = /bütçe|fiyat|fatura|tutar|ödeme|tl|₺|\d+\s*bin/i.test(msgText);
    if (mentionsBudget) {
      totalPoints += 8;
      breakdown.push({
        category: "Ciro & Bütçe",
        label: "Mesajda Doğrudan Bütçe/Fiyat Talebi",
        points: 8,
        maxPoints: 20,
        matched: true
      });
      reasons.push("Mesajda doğrudan fiyat & bütçe ifadesi (+8)");
    }
  }

  // CRM Priority Tags Boost
  const allLeadTags = [
    ...(lead.tags || []),
    ...((lead.customTags || []).map(t => t.name))
  ].map(t => t.toLowerCase());

  const matchedPriorityTags: string[] = [];
  (cfg.highPriorityTags || []).forEach(tag => {
    if (allLeadTags.includes(tag.toLowerCase())) {
      matchedPriorityTags.push(tag);
    }
  });

  if (matchedPriorityTags.length > 0) {
    totalPoints += 12;
    breakdown.push({
      category: "CRM Etiketi",
      label: `Öncelikli Etiket (${matchedPriorityTags.join(", ")})`,
      points: 12,
      maxPoints: 12,
      matched: true,
      note: matchedPriorityTags.join(", ")
    });
    reasons.push(`Öncelikli CRM etiketi: ${matchedPriorityTags.join(", ")} (+12)`);
  }

  // Normalize final score: 0 - 100
  const normalizedScore = Math.min(100, Math.max(0, totalPoints));
  const minHigh = cfg.minScoreForHighPriority || 70;

  let priority: "high" | "medium" | "low" = "low";
  if (normalizedScore >= minHigh) {
    // Check if phone is required for high priority
    if (cfg.requirePhoneForHighPriority && !hasFullPhone && !hasPartialPhone) {
      priority = "medium";
      reasons.push("Telefon numarası eksik olduğu için öncelik Orta seviyeye sınırlandırıldı");
    } else {
      priority = "high";
    }
  } else if (normalizedScore >= 40) {
    priority = "medium";
  } else {
    priority = "low";
  }

  if (reasons.length === 0) {
    reasons.push(
      priority === "high"
        ? "Yüksek form etkileşimi ve niyet puanı"
        : priority === "medium"
        ? "Standart form talebi profili"
        : "Düşük form etkileşimi veya eksik iletişim bilgisi"
    );
  }

  return {
    score: normalizedScore,
    priority,
    isHighPriority: priority === "high",
    reasons,
    breakdown
  };
}

export function getPriorityLabel(priority: "high" | "medium" | "low"): string {
  switch (priority) {
    case "high":
      return "Yüksek Öncelik";
    case "medium":
      return "Orta Öncelik";
    case "low":
      return "Standart / Düşük";
  }
}

export function getPriorityBadgeStyle(priority: "high" | "medium" | "low"): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  iconColor: string;
} {
  switch (priority) {
    case "high":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-800",
        dot: "bg-rose-500 animate-pulse",
        iconColor: "text-rose-600"
      };
    case "medium":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
        dot: "bg-amber-500",
        iconColor: "text-amber-600"
      };
    case "low":
      return {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        dot: "bg-slate-400",
        iconColor: "text-slate-500"
      };
  }
}

export function getScoreColorStyle(score: number): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  pillBg: string;
  ring: string;
} {
  if (score >= 70) {
    return {
      badgeBg: "bg-rose-50 dark:bg-rose-950/50",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-300 dark:border-rose-800",
      barColor: "bg-rose-500",
      pillBg: "bg-rose-500 text-white",
      ring: "ring-rose-200 dark:ring-rose-900"
    };
  } else if (score >= 40) {
    return {
      badgeBg: "bg-amber-50 dark:bg-amber-950/50",
      badgeText: "text-amber-800 dark:text-amber-300",
      badgeBorder: "border-amber-300 dark:border-amber-800",
      barColor: "bg-amber-500",
      pillBg: "bg-amber-500 text-white",
      ring: "ring-amber-200 dark:ring-amber-900"
    };
  } else {
    return {
      badgeBg: "bg-slate-100 dark:bg-slate-800/80",
      badgeText: "text-slate-700 dark:text-slate-300",
      badgeBorder: "border-slate-200 dark:border-slate-700",
      barColor: "bg-slate-400",
      pillBg: "bg-slate-600 text-white",
      ring: "ring-slate-200 dark:ring-slate-800"
    };
  }
}

export interface FormEngagementSignalItem {
  id: string;
  label: string;
  value: string;
  scoreBonus: number;
  positive: boolean;
  tooltip: string;
}

export function getLeadEngagementSignals(lead: FormLead): FormEngagementSignalItem[] {
  const items: FormEngagementSignalItem[] = [];

  // Phone number signal
  const phoneDigits = (lead.phone || "").replace(/[^0-9]/g, "");
  if (phoneDigits.length >= 10) {
    items.push({
      id: "phone",
      label: "Telefon",
      value: "Eksiksiz",
      scoreBonus: 25,
      positive: true,
      tooltip: `Ulaşılabilir telefon numarası mevcut: ${lead.phone}`
    });
  } else if (phoneDigits.length >= 7) {
    items.push({
      id: "phone",
      label: "Telefon",
      value: "Kısmi",
      scoreBonus: 15,
      positive: true,
      tooltip: `Kısmi telefon numarası: ${lead.phone}`
    });
  } else {
    items.push({
      id: "phone",
      label: "Telefon",
      value: "Yok",
      scoreBonus: 0,
      positive: false,
      tooltip: "Telefon bilgisi belirtilmemiş"
    });
  }

  // Message length signal
  const msgLen = (lead.message || "").trim().length;
  if (msgLen >= 100) {
    items.push({
      id: "message",
      label: "Mesaj",
      value: `${msgLen} kr. (Detaylı)`,
      scoreBonus: 25,
      positive: true,
      tooltip: `Yüksek form ilgisi gösteren detaylı açıklama (${msgLen} karakter)`
    });
  } else if (msgLen >= 50) {
    items.push({
      id: "message",
      label: "Mesaj",
      value: `${msgLen} kr.`,
      scoreBonus: 18,
      positive: true,
      tooltip: `Açıklayıcı mesaj (${msgLen} karakter)`
    });
  } else if (msgLen >= 20) {
    items.push({
      id: "message",
      label: "Mesaj",
      value: `${msgLen} kr.`,
      scoreBonus: 10,
      positive: true,
      tooltip: `Standart form mesajı (${msgLen} karakter)`
    });
  } else if (msgLen > 0) {
    items.push({
      id: "message",
      label: "Mesaj",
      value: `${msgLen} kr. (Kısa)`,
      scoreBonus: 4,
      positive: false,
      tooltip: `Kısa form mesajı (${msgLen} karakter)`
    });
  } else {
    items.push({
      id: "message",
      label: "Mesaj",
      value: "Boş",
      scoreBonus: 0,
      positive: false,
      tooltip: "Mesaj metni yazılmamış"
    });
  }

  // Email signal
  if (lead.email && lead.email.includes("@")) {
    items.push({
      id: "email",
      label: "E-Posta",
      value: "Mevcut",
      scoreBonus: 10,
      positive: true,
      tooltip: `E-posta adresi iletildi: ${lead.email}`
    });
  }

  // Attachments signal
  if (lead.attachments && lead.attachments.length > 0) {
    items.push({
      id: "attachments",
      label: "Ek Belge",
      value: `${lead.attachments.length} Dosya`,
      scoreBonus: 10,
      positive: true,
      tooltip: `${lead.attachments.length} adet doküman/fotoğraf eki yüklendi`
    });
  }

  // Custom Form Fields signal
  const customCount = lead.customFields ? Object.keys(lead.customFields).filter(k => {
    const val = lead.customFields?.[k];
    return val !== undefined && val !== null && val !== "" && val !== false;
  }).length : 0;

  if (customCount > 0) {
    items.push({
      id: "customFields",
      label: "Form Detayı",
      value: `${customCount} Alan`,
      scoreBonus: Math.min(10, customCount * 3 + 2),
      positive: true,
      tooltip: `${customCount} adet dinamik form ve onay alanı dolduruldu`
    });
  }

  // Intent & Urgency keywords in text
  const text = `${lead.message || ""} ${lead.serviceOrProduct || ""}`.toLowerCase();
  const matchedKeywords = DEFAULT_LEAD_SCORING_CONFIG.urgentKeywords.filter(kw => text.includes(kw.toLowerCase()));
  if (matchedKeywords.length > 0) {
    items.push({
      id: "urgency",
      label: "Niyet / Aciliyet",
      value: matchedKeywords.length > 1 ? `${matchedKeywords.length} İfade` : `"${matchedKeywords[0]}"`,
      scoreBonus: matchedKeywords.length > 1 ? 20 : 12,
      positive: true,
      tooltip: `Tespit edilen öncelikli anahtar kelimeler: ${matchedKeywords.join(", ")}`
    });
  }

  // Deal Value
  if (lead.dealValue && lead.dealValue > 0) {
    items.push({
      id: "deal",
      label: "Bütçe / Ciro",
      value: `₺${lead.dealValue.toLocaleString("tr-TR")}`,
      scoreBonus: lead.dealValue >= 2500 ? 15 : 8,
      positive: true,
      tooltip: `Tahmini talep değeri: ₺${lead.dealValue.toLocaleString("tr-TR")}`
    });
  }

  return items;
}

