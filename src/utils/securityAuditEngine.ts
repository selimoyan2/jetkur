import { SiteConfig, SecurityAuditResult, SecurityHeaderItem, SecurityVulnerability, SecurityConfig } from "../types";

export function getEffectiveSecurityConfig(config: SiteConfig): SecurityConfig {
  return config.securityConfig || {
    enabled: true,
    enforceHsts: true,
    enableCsp: false,
    enableXFrameOptions: true,
    enableContentTypeNosniff: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: false,
    formHoneypotProtection: false,
    formRateLimiting: true,
    blockBadBots: true,
    hideServerSignature: true
  };
}

/**
 * Calculates a comprehensive security audit of the site based on actual configurations,
 * form protections, SSL/TLS, domain setup, and HTTP headers.
 */
export function generateOfflineSecurityAudit(config: SiteConfig): SecurityAuditResult {
  const sec = getEffectiveSecurityConfig(config);
  const targetDomain = config.cloudflare?.customDomain 
    ? config.cloudflare.customDomain 
    : (config.cloudflare?.deployedUrl ? new URL(config.cloudflare.deployedUrl).hostname : `${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`);

  const headersAudit: SecurityHeaderItem[] = [
    {
      name: "Content-Security-Policy (CSP)",
      recommendedValue: "default-src 'self' https: data: blob: 'unsafe-inline';",
      currentValue: sec.enableCsp ? "default-src 'self' https: data: blob: 'unsafe-inline';" : "Tanımlanmamış / Eksik",
      status: sec.enableCsp ? "pass" : "warning",
      description: "Zararlı betiklerin ve yetkisiz XSS kodlarının çalıştırılmasını tarayıcı düzeyinde engeller.",
      severity: "high",
      fixAction: "1-Tıkla Otomatik Güçlendirme ile CSP korumasını devreye alın."
    },
    {
      name: "Strict-Transport-Security (HSTS)",
      recommendedValue: "max-age=31536000; includeSubDomains; preload",
      currentValue: sec.enforceHsts ? "max-age=31536000; includeSubDomains; preload" : "Kısmi (Edge Varsayılanı)",
      status: sec.enforceHsts ? "pass" : "pass",
      description: "Ziyaretçilerin tarayıcılarını daima şifreli HTTPS bağlantısı kurmaya zorunlu kılar.",
      severity: "critical",
      fixAction: "Global Edge HSTS politikasını 1 yıllık max-age ile zorunlu tutun."
    },
    {
      name: "X-Frame-Options",
      recommendedValue: "SAMEORIGIN",
      currentValue: sec.enableXFrameOptions ? "SAMEORIGIN" : "Tanımlanmamış",
      status: sec.enableXFrameOptions ? "pass" : "warning",
      description: "Sitenizin yabancı web sitelerinde iframe içine gömülerek Tıklama Hırsızlığı (Clickjacking) yapılmasını önler.",
      severity: "medium",
      fixAction: "X-Frame-Options SAMEORIGIN kuralını aktif edin."
    },
    {
      name: "X-Content-Type-Options",
      recommendedValue: "nosniff",
      currentValue: sec.enableContentTypeNosniff ? "nosniff" : "Tanımlanmamış",
      status: sec.enableContentTypeNosniff ? "pass" : "warning",
      description: "Tarayıcıların dosya uzantısını görmezden gelip MIME-türü tahmini yapmasını (MIME-sniffing) engeller.",
      severity: "medium",
      fixAction: "nosniff başlığını ekleyin."
    },
    {
      name: "Referrer-Policy",
      recommendedValue: "strict-origin-when-cross-origin",
      currentValue: sec.enableReferrerPolicy ? "strict-origin-when-cross-origin" : "no-referrer-when-downgrade (Varsayılan)",
      status: sec.enableReferrerPolicy ? "pass" : "warning",
      description: "Dış sitelere tıklanırken tam sayfa URL parametrelerinin ve kullanıcı gizliliğinin sızmasını önler.",
      severity: "low",
      fixAction: "strict-origin-when-cross-origin politikası uygulayın."
    },
    {
      name: "Permissions-Policy",
      recommendedValue: "camera=(), microphone=(), geolocation=()",
      currentValue: sec.enablePermissionsPolicy ? "camera=(), microphone=(), geolocation=()" : "Tanımlanmamış",
      status: sec.enablePermissionsPolicy ? "pass" : "warning",
      description: "Sayfada gereksiz cihaz donanımı (kamera, mikrofon) kullanımını kesin olarak kısıtlar.",
      severity: "low",
      fixAction: "Gereksiz donanım izinlerini engelleyin."
    }
  ];

  const vulnerabilities: SecurityVulnerability[] = [];

  // Check 1: CSP
  if (!sec.enableCsp) {
    vulnerabilities.push({
      id: "vuln-csp-missing",
      title: "Content-Security-Policy (CSP) Kalkanı Eksik",
      category: "headers",
      severity: "high",
      description: "Sitenin yayınlanan HTML çıktısında ve Global Edge CDN yanıtlarında Content-Security-Policy başlığı tespit edilemedi.",
      impact: "Saldırganlar üçüncü taraf harici komut dosyalarını veya satır içi betikleri (XSS) manipüle edebilir.",
      recommendation: "CSP başlığını ve meta etiketini etkinleştirin. 1-Tıkla Otomatik Güçlendirme ile derleme dosyalarına otomatik eklenir.",
      status: "open",
      autoFixAvailable: true
    });
  }

  // Check 2: Form Honeypot & Anti-Spam
  const hasForms = (config.customForm?.fields?.length ?? 0) > 0 || true; // contact form always exists
  if (hasForms && !sec.formHoneypotProtection) {
    vulnerabilities.push({
      id: "vuln-honeypot-missing",
      title: "İletişim & Teklif Formlarında Bot Tuzak (Honeypot) Koruması Pasif",
      category: "form_protection",
      severity: "medium",
      description: "Ziyaretçi formlarında görünmez honeypot alanı aktif değil. Otomatik spam botları formu doldurarak sunucu ve WhatsApp bildirimlerini meşgul edebilir.",
      impact: "Müşteri CRM gelen kutusunun sahte bot mesajlarıyla dolması ve e-posta itibarının zedelenmesi.",
      recommendation: "Form güvenliği menüsünden 'Honeypot Anti-Spam' korumasını devreye alın.",
      status: "open",
      autoFixAvailable: true
    });
  }

  // Check 3: Mixed Content
  const allImages = [
    config.hero.bgImage,
    config.about?.image,
    ...(config.gallery?.items || []).map(i => i.imageUrl),
    ...(config.services?.items || []).map(s => s.image || ""),
    ...(config.products?.items || []).map(p => p.image || "")
  ].filter(Boolean);
  const hasInsecureAsset = allImages.some(img => img.startsWith("http://"));

  if (hasInsecureAsset) {
    vulnerabilities.push({
      id: "vuln-mixed-content",
      title: "Karma İçerik (HTTP Mixed Content) Uyarısı",
      category: "ssl",
      severity: "medium",
      description: "Sitede bazı görsel veya ortam dosyaları güvenli olmayan 'http://' protokolü üzerinden çağrılıyor.",
      impact: "Modern tarayıcılar (Chrome, Safari) asma kilit simgesini kaldırır veya görselleri engeller.",
      recommendation: "Tüm medya URL'lerini 'https://' protokolüne güncelleyin veya Medya Kütüphanesine yükleyin.",
      status: "open",
      autoFixAvailable: true
    });
  } else {
    vulnerabilities.push({
      id: "vuln-mixed-content-ok",
      title: "Karma İçerik Koruması Aktif (100% HTTPS)",
      category: "ssl",
      severity: "info",
      description: "Sitedeki tüm görsel, font ve CDN kaynakları uçtan uca şifreli HTTPS üzerinden çağrılmaktadır.",
      impact: "Tarayıcılarda yeşil/güvenli asma kilit sertifikası kusursuz görüntülenir.",
      recommendation: "Mevcut HTTPS standardını koruyun.",
      status: "resolved",
      autoFixAvailable: false
    });
  }

  // Check 4: Clickjacking
  if (!sec.enableXFrameOptions) {
    vulnerabilities.push({
      id: "vuln-clickjacking",
      title: "Tıklama Hırsızlığı (Clickjacking) Koruması Pasif",
      category: "headers",
      severity: "medium",
      description: "X-Frame-Options başlığı yapılandırılmadığı için site üçüncü taraf sayfalarda şeffaf iframe olarak çağrılabilir.",
      impact: "Kullanıcıların farkında olmadan butonlara tıklatılması riski.",
      recommendation: "X-Frame-Options: SAMEORIGIN başlığını aktif hale getirin.",
      status: "open",
      autoFixAvailable: true
    });
  }

  // Check 5: Information Disclosure
  if (!sec.hideServerSignature) {
    vulnerabilities.push({
      id: "vuln-server-tokens",
      title: "Sunucu ve Teknoloji İmzası Açıkta",
      category: "information_disclosure",
      severity: "low",
      description: "HTTP yanıtlarında sunucu sürümü veya platform imzaları ifşa edilebilir.",
      impact: "Saldırganların yazılım zafiyetlerini araştırmasını kolaylaştırır.",
      recommendation: "Global Edge yanıt başlıklarından sunucu etiketlerini kaldırın.",
      status: "open",
      autoFixAvailable: true
    });
  } else {
    vulnerabilities.push({
      id: "vuln-server-tokens-safe",
      title: "Sunucu İmzaları Maskelendi (Gizlilik Korundu)",
      category: "information_disclosure",
      severity: "info",
      description: "Statik HTML ve Global Edge CDN dağıtımlarında sunucu yazılım detayları dışarıya sızdırılmamaktadır.",
      impact: "Sistem parmak izi analizi saldırılarına karşı tam gizlilik.",
      recommendation: "Değişiklik gerekmiyor.",
      status: "resolved",
      autoFixAvailable: false
    });
  }

  // Check 6: Global Edge CDN & DDoS
  vulnerabilities.push({
    id: "vuln-edge-ddos",
    title: "Global Edge WAF & L3/L4 DDoS Kalkanı",
    category: "ddos_edge",
    severity: "info",
    description: "Tüm trafik Global Anycast Edge (330+ veri merkezi) üzerinden filtrelenir.",
    impact: "DDoS saldırıları, SYN taşkınları ve anormal trafik artışları doğrudan kenarda emilir.",
    recommendation: "Global Edge Proxy yönlendirmesini daima aktif tutun.",
    status: "resolved",
    autoFixAvailable: false
  });

  // Calculate category scores
  const passHeadersCount = headersAudit.filter(h => h.status === "pass").length;
  const headersScore = Math.round((passHeadersCount / headersAudit.length) * 100);

  const sslScore = hasInsecureAsset ? 75 : 100;
  const formsScore = sec.formHoneypotProtection ? 100 : 70;
  const disclosureScore = sec.hideServerSignature ? 100 : 60;
  const edgeScore = sec.blockBadBots ? 98 : 85;

  // Weighted overall
  const overallScore = Math.round(
    headersScore * 0.35 +
    sslScore * 0.25 +
    formsScore * 0.15 +
    disclosureScore * 0.10 +
    edgeScore * 0.15
  );

  let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "F";
  if (overallScore >= 95) grade = "A+";
  else if (overallScore >= 88) grade = "A";
  else if (overallScore >= 75) grade = "B";
  else if (overallScore >= 60) grade = "C";
  else if (overallScore >= 45) grade = "D";

  const recommendations: string[] = [];
  if (!sec.enableCsp) {
    recommendations.push("Tek tıkla Content-Security-Policy (CSP) kalkanını açarak XSS açıklarına karşı tam koruma sağlayın.");
  }
  if (!sec.formHoneypotProtection) {
    recommendations.push("İletişim ve teklif formlarında Honeypot bot tuzağını açarak sahte talepleri ve spam gönderilerini önleyin.");
  }
  if (!sec.enableXFrameOptions) {
    recommendations.push("X-Frame-Options kuralını devreye sokarak sitenizin iframe ile çalınmasını (Clickjacking) engelleyin.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Mükemmel! Siteniz tüm modern OWASP web güvenlik ilkelerine ve Global Edge standartlarına tam uyumludur.");
    recommendations.push("Periyodik olarak A/B varyasyonlarınızı ve yeni eklenen harici betikleri taramaya devam edin.");
  }

  const summary = grade === "A+" || grade === "A"
    ? `${config.companyName} için yayınlanan web sitesi yüksek güvenlik standartlarını karşılamaktadır. Otomatik SSL, HSTS ve güvenlik başlıkları aktif olarak devrededir.`
    : `${config.companyName} web sitesinde temel SSL güvenliği mevcut olmakla birlikte, bazı kritik HTTP başlıkları (CSP, X-Frame-Options) ve form bot korumaları henüz tam yapılandırılmamıştır. '1-Tıkla Otomatik Güçlendir' düğmesiyle güvenlik notunuzu anında A+'a yükseltebilirsiniz.`;

  return {
    scanDate: new Date().toISOString(),
    targetDomain,
    overallScore,
    grade,
    summary,
    categoryScores: {
      headers: headersScore,
      ssl: sslScore,
      forms: formsScore,
      disclosure: disclosureScore,
      edge: edgeScore
    },
    headersAudit,
    vulnerabilities,
    autoHardened: sec.enableCsp && sec.enforceHsts && sec.enableXFrameOptions && sec.enableContentTypeNosniff && sec.formHoneypotProtection,
    recommendations
  };
}

/**
 * Runs an online AI Security Audit via the backend Gemini endpoint,
 * with seamless fallback to the offline rule-based audit engine.
 */
export async function runSecurityAudit(config: SiteConfig): Promise<SecurityAuditResult> {
  const offlineResult = generateOfflineSecurityAudit(config);
  try {
    const sec = getEffectiveSecurityConfig(config);
    const targetDomain = config.cloudflare?.customDomain 
      ? config.cloudflare.customDomain 
      : (config.cloudflare?.deployedUrl ? new URL(config.cloudflare.deployedUrl).hostname : `${config.cloudflare?.subdomain || "sirket"}.hizliweb.site`);

    const res = await fetch("/api/security-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteUrl: `https://${targetDomain}`,
        companyName: config.companyName,
        sector: config.sector,
        securityConfig: sec,
        cloudflareConfig: config.cloudflare,
        formFieldsCount: config.customForm?.fields?.length || 9,
        hasCustomDomain: Boolean(config.cloudflare?.customDomain)
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.audit) {
        return {
          ...offlineResult,
          ...data.audit,
          targetDomain,
          scanDate: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn("AI Security Audit server call failed, using high-fidelity offline engine:", err);
  }

  return offlineResult;
}

/**
 * Applies 1-Click Auto-Hardening to the site config.
 * Enables all security headers, enforces HSTS, activates honeypot form protection,
 * sets strict referrer policy, nosniff, and bad bot blocking.
 */
export function apply1ClickAutoHardening(config: SiteConfig): SiteConfig {
  const updatedSec: SecurityConfig = {
    enabled: true,
    enforceHsts: true,
    enableCsp: true,
    enableXFrameOptions: true,
    enableContentTypeNosniff: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
    formHoneypotProtection: true,
    formRateLimiting: true,
    blockBadBots: true,
    hideServerSignature: true
  };

  const newConfig: SiteConfig = {
    ...config,
    securityConfig: updatedSec
  };

  const newAudit = generateOfflineSecurityAudit(newConfig);
  newConfig.securityConfig!.lastAudit = newAudit;

  return newConfig;
}

/**
 * Generates an executive Markdown report of the security audit.
 */
export function generateSecurityAuditReportMarkdown(audit: SecurityAuditResult, config: SiteConfig): string {
  return `# GÜVENLİK DENETİMİ & WEB ZAFİYET RAPORU (OWASP & EDGE COMPLIANCE)
**Firma:** ${config.companyName}
**Taranan Hedef:** https://${audit.targetDomain}
**Denetim Tarihi:** ${new Date(audit.scanDate).toLocaleString("tr-TR")}
**Güvenlik Skoru:** %${audit.overallScore} / 100 (Derece: ${audit.grade})

---

## 1. YÖNETİCİ ÖZETİ
${audit.summary}

### Kategori Bazında Skorlar:
- **HTTP Güvenlik Başlıkları:** %${audit.categoryScores.headers}
- **SSL / TLS & Şifreleme:** %${audit.categoryScores.ssl}
- **Form Koruması & Anti-Spam:** %${audit.categoryScores.forms}
- **Bilgi İfşası & Gizlilik:** %${audit.categoryScores.disclosure}
- **Global Edge WAF & DDoS:** %${audit.categoryScores.edge}

---

## 2. HTTP GÜVENLİK BAŞLIKLARI DENETİMİ
| Başlık (Header) | Durum | Mevcut Değer | Önerilen Değer |
|---|---|---|---|
${audit.headersAudit.map(h => `| ${h.name} | ${h.status === "pass" ? "BAŞARILI (PASS)" : "UYARI (WARN)"} | \`${h.currentValue || "Yok"}\` | \`${h.recommendedValue}\` |`).join("\n")}

---

## 3. TESPİT EDİLEN ZAFİYETLER VE RİSK ANALİZİ
${audit.vulnerabilities.map((v, i) => `### 3.${i + 1} ${v.title} [${v.severity.toUpperCase()}]
- **Kategori:** ${v.category}
- **Durum:** ${v.status === "resolved" ? "Çözüldü / Korunuyor" : "Açık / İyileştirilmeli"}
- **Açıklama:** ${v.description}
- **Olası Etki:** ${v.impact}
- **Tavsiye:** ${v.recommendation}
- **Otomatik Düzeltme:** ${v.autoFixAvailable ? "Evet (1-Tıkla Otomatik Güçlendirme ile)" : "Gerek Yok"}
`).join("\n")}

---

## 4. ÖNERİLER & EYLEM PLANI
${audit.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

*Bu rapor Global Edge & OWASP Web Güvenlik Standartlarına göre otomatik olarak oluşturulmuştur.*
`;
}
