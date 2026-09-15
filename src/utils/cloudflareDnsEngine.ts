/**
 * Cloudflare DNS Management & Auto-Suggestion Engine
 * Fetches existing Cloudflare DNS records via API and analyzes them
 * against the deployed Cloudflare Pages / Workers Sites targets to
 * provide RFC-compliant CNAME and A record recommendations.
 */

export interface CloudflareDnsRecord {
  id: string;
  zone_id?: string;
  zone_name?: string;
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "SRV" | "CAA";
  name: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number; // 1 = Auto
  locked?: boolean;
  meta?: {
    auto_added?: boolean;
    managed_by_apps?: boolean;
    source?: string;
  };
  created_on?: string;
  modified_on?: string;
  comment?: string;
}

export type DnsSuggestionStatus = "optimal" | "missing" | "conflict";
export type DnsSuggestionPriority = "essential" | "recommended" | "optional";

export interface DnsSuggestion {
  id: string;
  recordType: "CNAME" | "A";
  name: string; // e.g. "@" or "www"
  fullName: string; // e.g. "sirketiniz.com" or "www.sirketiniz.com"
  content: string; // e.g. "sirketiniz.pages.dev"
  ttl: number; // 1 = Auto
  proxied: boolean; // true = Orange Cloud CDN
  status: DnsSuggestionStatus;
  priority: DnsSuggestionPriority;
  reason: string;
  technicalDetails: string;
  fixActionLabel: string;
  currentRecord?: CloudflareDnsRecord;
  conflictingRecords?: CloudflareDnsRecord[];
}

export interface DnsAnalysisResult {
  success: boolean;
  zoneId: string;
  zoneName: string;
  targetPagesDev: string;
  customDomain: string;
  records: CloudflareDnsRecord[];
  suggestions: DnsSuggestion[];
  summary: {
    totalRecords: number;
    optimalCount: number;
    missingCount: number;
    conflictCount: number;
    hasRootPagesBinding: boolean;
    hasWwwPagesBinding: boolean;
    cnameFlatteningActive: boolean;
  };
  latencyMs?: number;
  isSimulated?: boolean;
  analyzedAt: string;
  nameservers?: string[];
  errorMessage?: string;
}

/**
 * Normalizes domain strings to clean FQDN format
 */
export function normalizeDomain(domain: string): string {
  if (!domain) return "";
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:[0-9]+$/, "");
}

/**
 * Analyzes raw DNS records and produces automated recommendations
 */
export function analyzeDnsRecords(
  records: CloudflareDnsRecord[],
  zoneName: string,
  targetPagesDev: string,
  customDomain?: string
): DnsSuggestion[] {
  const cleanZone = normalizeDomain(zoneName || customDomain || "sirketiniz.com");
  const cleanTarget = normalizeDomain(targetPagesDev || "jetkur-site.pages.dev");
  const cleanCustom = normalizeDomain(customDomain || cleanZone);

  const suggestions: DnsSuggestion[] = [];

  // Find root (@) records: name is either cleanZone or "@"
  const rootRecords = records.filter(
    (r) =>
      r.name === cleanZone ||
      r.name === `@` ||
      r.name === `${cleanZone}.`
  );

  const rootCname = rootRecords.find((r) => r.type === "CNAME");
  const rootA = rootRecords.filter((r) => r.type === "A");

  // 1. ROOT RECORD (@) RECOMMENDATION
  if (rootCname) {
    const isMatching = normalizeDomain(rootCname.content) === cleanTarget;
    if (isMatching) {
      suggestions.push({
        id: "sug-root",
        recordType: "CNAME",
        name: "@",
        fullName: cleanZone,
        content: cleanTarget,
        ttl: 1,
        proxied: true,
        status: rootCname.proxied ? "optimal" : "conflict",
        priority: "essential",
        reason: rootCname.proxied
          ? "Kök alan adınız Cloudflare Pages Anycast ağına CNAME Flattening ile mükemmel şekilde bağlı."
          : "Kök CNAME kaydınız Pages hedefine yönleniyor ancak Cloudflare Proxy (Turuncu Bulut) kapalı. CDN ve DDoS kalkanı için proxy açılmalıdır.",
        technicalDetails: `Mevcut Kayıt: CNAME ${rootCname.name} -> ${rootCname.content} (Proxied: ${rootCname.proxied ? "Açık" : "Kapalı"})`,
        fixActionLabel: rootCname.proxied ? "Yapılandırıldı" : "Cloudflare Proxy'i Aktif Et",
        currentRecord: rootCname
      });
    } else {
      suggestions.push({
        id: "sug-root",
        recordType: "CNAME",
        name: "@",
        fullName: cleanZone,
        content: cleanTarget,
        ttl: 1,
        proxied: true,
        status: "conflict",
        priority: "essential",
        reason: `Kök alan adı farklı bir CNAME hedefine (${rootCname.content}) yönleniyor. Yeni sitenizin açılması için ${cleanTarget} olarak güncellenmelidir.`,
        technicalDetails: `Çakışan CNAME: ${rootCname.content} (ID: ${rootCname.id})`,
        fixActionLabel: "Pages Hedefine Güncelle",
        currentRecord: rootCname,
        conflictingRecords: [rootCname]
      });
    }
  } else if (rootA.length > 0) {
    // Old A records exist (e.g. legacy cPanel/shared hosting IP)
    const ips = rootA.map((r) => r.content).join(", ");
    suggestions.push({
      id: "sug-root",
      recordType: "CNAME",
      name: "@",
      fullName: cleanZone,
      content: cleanTarget,
      ttl: 1,
      proxied: true,
      status: "conflict",
      priority: "essential",
      reason: `Kök alan adınızda eski sunucu IP adreslerine (${ips}) yönlenen A kaydı mevcut. Cloudflare Pages için bu kayıt CNAME (${cleanTarget}) olarak değiştirilmelidir.`,
      technicalDetails: `Bulunan ${rootA.length} adet A kaydı Cloudflare Pages statik mimarisi ile çakışıyor. CNAME Flattening önerilir.`,
      fixActionLabel: "A Kaydını CNAME'e Dönüştür",
      currentRecord: rootA[0],
      conflictingRecords: rootA
    });
  } else {
    // Missing root record
    suggestions.push({
      id: "sug-root",
      recordType: "CNAME",
      name: "@",
      fullName: cleanZone,
      content: cleanTarget,
      ttl: 1,
      proxied: true,
      status: "missing",
      priority: "essential",
      reason: `Kök (@ / ${cleanZone}) alan adınız için henüz bir yönlendirme kaydı tanımlanmamış. Ziyaretçilerin doğrudan ${cleanZone} üzerinden siteye erişmesi için CNAME kaydı gereklidir.`,
      technicalDetails: `Cloudflare CNAME Flattening teknolojisi sayesinde kök alan adında CNAME RFC kısıtlaması olmaksızın çalışır.`,
      fixActionLabel: "Otomatik Olarak Ekle",
      currentRecord: undefined
    });
  }

  // 2. SUBDOMAIN (WWW) RECOMMENDATION
  const wwwName = `www.${cleanZone}`;
  const wwwRecords = records.filter(
    (r) =>
      r.name === wwwName ||
      r.name === "www" ||
      r.name === `www.${cleanZone}.`
  );
  const wwwCname = wwwRecords.find((r) => r.type === "CNAME");
  const wwwA = wwwRecords.filter((r) => r.type === "A");

  if (wwwCname) {
    const isMatching =
      normalizeDomain(wwwCname.content) === cleanTarget ||
      normalizeDomain(wwwCname.content) === cleanZone;
    if (isMatching) {
      suggestions.push({
        id: "sug-www",
        recordType: "CNAME",
        name: "www",
        fullName: wwwName,
        content: cleanTarget,
        ttl: 1,
        proxied: true,
        status: wwwCname.proxied ? "optimal" : "conflict",
        priority: "recommended",
        reason: wwwCname.proxied
          ? "www alt alan adınız Cloudflare Anycast CDN üzerinden optimize bir şekilde sunuluyor."
          : "www CNAME kaydı mevcut ancak Cloudflare Proxy pasif. SSL ve hız optimizasyonu için proxy açılmalıdır.",
        technicalDetails: `Mevcut Kayıt: CNAME www -> ${wwwCname.content} (Proxied: ${wwwCname.proxied ? "Açık" : "Kapalı"})`,
        fixActionLabel: wwwCname.proxied ? "Yapılandırıldı" : "Cloudflare Proxy'i Aktif Et",
        currentRecord: wwwCname
      });
    } else {
      suggestions.push({
        id: "sug-www",
        recordType: "CNAME",
        name: "www",
        fullName: wwwName,
        content: cleanTarget,
        ttl: 1,
        proxied: true,
        status: "conflict",
        priority: "recommended",
        reason: `www alt alan adınız farklı bir hedefe (${wwwCname.content}) yönleniyor. Sayfanızın her iki varyantta da sorunsuz açılması için ${cleanTarget} hedefine yönlendirilmelidir.`,
        technicalDetails: `Çakışan CNAME: ${wwwCname.content} (ID: ${wwwCname.id})`,
        fixActionLabel: "Pages Hedefine Güncelle",
        currentRecord: wwwCname,
        conflictingRecords: [wwwCname]
      });
    }
  } else if (wwwA.length > 0) {
    const ips = wwwA.map((r) => r.content).join(", ");
    suggestions.push({
      id: "sug-www",
      recordType: "CNAME",
      name: "www",
      fullName: wwwName,
      content: cleanTarget,
      ttl: 1,
      proxied: true,
      status: "conflict",
      priority: "recommended",
      reason: `www alt alan adında eski sunucu IP adresine (${ips}) ait A kaydı mevcut. Cloudflare Pages CNAME kaydı ile değiştirilmelidir.`,
      technicalDetails: `Bulunan A kaydı yerine Anycast CDN CNAME kaydı tavsiye edilir.`,
      fixActionLabel: "A Kaydını CNAME'e Dönüştür",
      currentRecord: wwwA[0],
      conflictingRecords: wwwA
    });
  } else {
    suggestions.push({
      id: "sug-www",
      recordType: "CNAME",
      name: "www",
      fullName: wwwName,
      content: cleanTarget,
      ttl: 1,
      proxied: true,
      status: "missing",
      priority: "recommended",
      reason: "www.sirketiniz.com arayan ziyaretçilerin statik sayfanıza ulaşması ve SSL sertifikasının eşleşmesi için www CNAME kaydı eklenmelidir.",
      technicalDetails: `Otomatik 301 yönlendirmesi (_redirects) ile www trafiği kök domain ile senkronize çalışır.`,
      fixActionLabel: "Otomatik Olarak Ekle",
      currentRecord: undefined
    });
  }

  return suggestions;
}

/**
 * Generates standard BIND format zone file export
 */
export function exportBindZoneFile(
  records: CloudflareDnsRecord[],
  suggestions: DnsSuggestion[],
  domain: string,
  targetPagesDev: string
): string {
  const cleanDomain = normalizeDomain(domain || "sirketiniz.com");
  const now = new Date().toISOString();

  let bind = `; ===================================================================\n`;
  bind += `; BIND Zone File for ${cleanDomain}\n`;
  bind += `; Generated by JetKur Cloudflare Edge Deployment Engine\n`;
  bind += `; Target Pages: ${targetPagesDev}\n`;
  bind += `; Generated at: ${now}\n`;
  bind += `; ===================================================================\n\n`;
  bind += `$ORIGIN ${cleanDomain}.\n`;
  bind += `$TTL 3600\n\n`;

  bind += `; --- RECOMMENDED CLOUDFLARE PAGES EDGE RECORDS ---\n`;
  suggestions.forEach((sug) => {
    const name = sug.name === "@" ? "@" : sug.name;
    bind += `${name.padEnd(16)} IN  ${sug.recordType.padEnd(6)} ${sug.content} ; Cloudflare Proxied: ${sug.proxied ? "YES (Orange Cloud)" : "NO"}\n`;
  });

  bind += `\n; --- EXISTING DNS ZONE RECORDS ---\n`;
  records.forEach((r) => {
    const isSuggested = suggestions.some((s) => s.currentRecord?.id === r.id);
    if (!isSuggested) {
      bind += `${r.name.padEnd(20)} IN  ${r.type.padEnd(6)} ${r.content}\n`;
    }
  });

  return bind;
}

/**
 * Downloads the BIND zone file to user's computer
 */
export function downloadBindZoneFile(
  records: CloudflareDnsRecord[],
  suggestions: DnsSuggestion[],
  domain: string,
  targetPagesDev: string
): void {
  const content = exportBindZoneFile(records, suggestions, domain, targetPagesDev);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanDomain = normalizeDomain(domain || "sirketiniz.com").replace(/\./g, "-");
  a.download = `${cleanDomain}-cloudflare-dns-zone.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats a suggestion for quick clipboard copy
 */
export function formatSuggestionForClipboard(suggestion: DnsSuggestion): string {
  return [
    `Kayıt Türü: ${suggestion.recordType}`,
    `Ad (Name): ${suggestion.name}`,
    `Hedef (Content): ${suggestion.content}`,
    `Proxy Durumu: ${suggestion.proxied ? "Açık (Proxied / Turuncu Bulut)" : "DNS Only (Gri Bulut)"}`,
    `TTL: Otomatik (Auto / 1)`,
    `Öneri Durumu: ${suggestion.status.toUpperCase()}`,
    `Açıklama: ${suggestion.reason}`
  ].join("\n");
}
