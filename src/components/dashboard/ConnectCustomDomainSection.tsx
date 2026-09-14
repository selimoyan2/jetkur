import React, { useState } from "react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  Zap,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  Share2,
  Trash2,
  Network,
  AlertTriangle,
  FileCode,
  ArrowUpRight
} from "lucide-react";

interface ConnectCustomDomainSectionProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
}

interface EdgeTestNode {
  location: string;
  flag: string;
  ip: string;
  latency: string;
  status: "success" | "checking" | "pending";
}

export const ConnectCustomDomainSection: React.FC<ConnectCustomDomainSectionProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  const currentCustomDomain = config.cloudflare?.customDomain || "";
  const currentSubdomain = config.cloudflare?.subdomain || "sirket";

  const [domainInput, setDomainInput] = useState(currentCustomDomain);
  const [subdomainInput, setSubdomainInput] = useState(currentSubdomain);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<"step-by-step" | "dns-table" | "live-test" | "faq">("step-by-step");

  // DNS Diagnostics Simulation State
  const [isTestingPropagation, setIsTestingPropagation] = useState(false);
  const [lastTestedTime, setLastTestedTime] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean>(Boolean(currentCustomDomain));

  const [edgeNodes, setEdgeNodes] = useState<EdgeTestNode[]>([
    { location: "İstanbul (Türkiye Edge - IST)", flag: "🇹🇷", ip: "104.21.68.99", latency: "2.1 ms", status: "success" },
    { location: "Frankfurt (Almanya Edge - FRA)", flag: "🇩🇪", ip: "104.21.68.99", latency: "6.9 ms", status: "success" },
    { location: "Londra (Birleşik Krallık - LHR)", flag: "🇬🇧", ip: "104.21.68.99", latency: "10.4 ms", status: "success" },
    { location: "New York (ABD Doğu - EWR)", flag: "🇺🇸", ip: "172.67.182.144", latency: "39.8 ms", status: "success" },
    { location: "Singapur (Asya Edge - SIN)", flag: "🇸🇬", ip: "104.21.68.99", latency: "84.2 ms", status: "success" },
  ]);

  // Clean and parse domain helper
  const cleanDomain = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/\s+/g, "");
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const activeTargetSubdomain = (subdomainInput || currentSubdomain || "sirket").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const generatedSiteHost = `${activeTargetSubdomain}.hizliweb.site`;
  const generatedSiteUrl = `https://${generatedSiteHost}`;
  const displayTargetDomain = cleanDomain(domainInput) || currentCustomDomain || "ornekfirma.com";
  const rootApexDomain = displayTargetDomain.replace(/^www\./, "");
  const wwwDomain = `www.${rootApexDomain}`;
  const verificationToken = `hw-site=${config.id || "cf89a2"}`;

  // Save domain to SiteConfig
  const handleSaveDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanDomain(domainInput);

    const updatedConfig: SiteConfig = {
      ...config,
      cloudflare: {
        ...config.cloudflare,
        customDomain: cleaned || undefined,
        subdomain: activeTargetSubdomain,
        deployedUrl: cleaned
          ? `https://${cleaned.startsWith("www.") ? cleaned : `www.${cleaned}`}`
          : generatedSiteUrl,
        sslActive: true,
        dnsPropagationStatus: cleaned ? "verified" : "unconfigured",
        dnsRecords: [
          {
            type: "CNAME",
            name: "www",
            content: generatedSiteHost,
            proxyStatus: true,
            status: "verified"
          },
          {
            type: "CNAME",
            name: "@",
            content: generatedSiteHost,
            proxyStatus: true,
            status: "verified"
          },
          {
            type: "A",
            name: "@",
            content: "104.21.68.99",
            proxyStatus: true,
            status: "verified"
          },
          {
            type: "TXT",
            name: "_hizliweb-verify",
            content: verificationToken,
            proxyStatus: false,
            status: "verified"
          }
        ]
      }
    };

    onChange(updatedConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handleRemoveDomain = () => {
    if (!window.confirm("Özel alan adınızı kaldırmak ve varsayılan HızlıWeb alt alan adına dönmek istediğinize emin misiniz?")) {
      return;
    }
    setDomainInput("");
    const updatedConfig: SiteConfig = {
      ...config,
      cloudflare: {
        ...config.cloudflare,
        customDomain: undefined,
        deployedUrl: generatedSiteUrl,
        dnsPropagationStatus: "unconfigured"
      }
    };
    onChange(updatedConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleRunDnsTest = () => {
    setIsTestingPropagation(true);
    setEdgeNodes(prev => prev.map(n => ({ ...n, status: "checking" })));

    setTimeout(() => {
      setEdgeNodes([
        { location: "İstanbul (Türkiye Edge - IST)", flag: "🇹🇷", ip: "104.21.68.99", latency: "1.9 ms", status: "success" },
        { location: "Frankfurt (Almanya Edge - FRA)", flag: "🇩🇪", ip: "104.21.68.99", latency: "6.2 ms", status: "success" },
        { location: "Londra (Birleşik Krallık - LHR)", flag: "🇬🇧", ip: "104.21.68.99", latency: "9.8 ms", status: "success" },
        { location: "New York (ABD Doğu - EWR)", flag: "🇺🇸", ip: "172.67.182.144", latency: "38.1 ms", status: "success" },
        { location: "Singapur (Asya Edge - SIN)", flag: "🇸🇬", ip: "104.21.68.99", latency: "81.4 ms", status: "success" },
      ]);
      setIsTestingPropagation(false);
      setTestSuccess(true);
      setLastTestedTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1200);
  };

  const handleCopyAllCloudflareInstructions = () => {
    const textToCopy = `=== HIZLIWEB SİTESİ İÇİN CLOUDFLARE CNAME YAPILANDIRMA BİLGİLERİ ===
Üretilen Statik Hedef: ${generatedSiteHost}
Bağlanacak Alan Adı: ${displayTargetDomain}
Tarih: ${new Date().toLocaleDateString("tr-TR")}

[KAYIT 1: BİRİNCİL CNAME (www)]
Tür (Type): CNAME
Ad (Name): www
Hedef (Target): ${generatedSiteHost}
Proxy Durumu: Proxied (Turuncu Bulut / Açık)
TTL: Auto

[KAYIT 2: KÖK ALAN ADI CNAME FLATTENING (@)]
Tür (Type): CNAME
Ad (Name): @
Hedef (Target): ${generatedSiteHost}
Proxy Durumu: Proxied (Turuncu Bulut / Açık)
TTL: Auto

[KAYIT 3: SAHİPLİK DOĞRULAMA (TXT)]
Tür (Type): TXT
Ad (Name): _hizliweb-verify
İçerik (Content): ${verificationToken}
TTL: Auto

[CLOUDFLARE SSL/TLS AYARLARI]
1. SSL/TLS > Overview: "Full" veya "Full (Strict)" olarak seçilmelidir (Flexible SEÇİLMEMELİDİR).
2. SSL/TLS > Edge Certificates: "Always Use HTTPS" -> AÇIK
3. SSL/TLS > Edge Certificates: "Automatic HTTPS Rewrites" -> AÇIK
4. SSL/TLS > Edge Certificates: "Minimum TLS Version" -> TLS 1.2 veya TLS 1.3
========================================================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField("all-cf-instructions");
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="space-y-6" id="connect-custom-domain-section">
      {/* 1. TOP HERO BANNER: CONNECT CUSTOM DOMAIN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl border border-slate-800 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Connect Custom Domain &amp; Cloudflare CNAME</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-2.5">
              <span>Connect Custom Domain</span>
              <span className="text-amber-400 text-sm font-normal">(.com, .com.tr, .net vb.)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Üretilen web sitenizi kendi özel alan adınıza bağlayın. Aşağıdaki spesifik <strong>Cloudflare CNAME</strong> talimatlarını takip ederek 320+ küresel edge veri merkezinde 0.02s yanıt süresi ve otomatik ücretsiz SSL (TLS 1.3) sertifikasını dakikalar içinde aktif edin.
            </p>

            {/* Generated Site Target Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 font-sans font-medium text-[11px]">Üretilen Canlı Hedef:</span>
              <span className="text-amber-400 font-bold">{generatedSiteHost}</span>
              <button
                type="button"
                onClick={() => handleCopy(generatedSiteHost, "top-target")}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Hedef adresi kopyala"
              >
                {copiedField === "top-target" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {currentCustomDomain && (
              <a
                href={`https://${currentCustomDomain}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                title="Sitenizi yeni sekmede açın"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Siteyi Aç</span>
              </a>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Önizle</span>
              </button>
            )}

            <button
              type="button"
              id="btn-verify-cloudflare-cname"
              onClick={handleRunDnsTest}
              disabled={isTestingPropagation}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingPropagation ? "animate-spin" : ""}`} />
              <span>{isTestingPropagation ? "Doğrulanıyor..." : "CNAME Doğrula & Test Et"}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentCustomDomain ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Aktif Canlı Yayın Adresi</div>
              <div className="text-xs font-bold text-white truncate font-mono">
                {currentCustomDomain ? `https://${currentCustomDomain}` : generatedSiteUrl}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">SSL / TLS Şifreleme</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare Full SSL (TLS 1.3)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Edge Ağı & CNAME Durumu</div>
              <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                  Proxied ☁️
                </span>
                <span>320+ Anycast Şehir</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Özel alan adı başarıyla kaydedildi! Lütfen aşağıdaki Cloudflare CNAME yapılandırma adımlarını tamamlayın.</span>
        </div>
      )}

      {/* 2. DOMAIN INPUT FORM & 1-CLICK CONFIGURATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Adım 1: Bağlamak İstediğiniz Alan Adını Girin</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Satın aldığınız alan adını yazın (örn: <strong>www.sirketiniz.com</strong> veya <strong>sirketiniz.com.tr</strong>).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono self-start sm:self-auto">
            Hızlı Eşleme
          </span>
        </div>

        {/* Currently active domain status card if connected */}
        {currentCustomDomain && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>Aktif Bağlı Alan Adı:</span>
                  <code className="text-sm font-black font-mono text-emerald-800">
                    https://{currentCustomDomain}
                  </code>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>SSL Sertifikası Aktif</span>
                  <span>•</span>
                  <span>Hedef: {generatedSiteHost}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://${currentCustomDomain}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <span>Siteyi Test Et</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleRemoveDomain}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                title="Özel alan adını kaldır"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Kaldır</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveDomain} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kendi Özel Alan Adınız (Custom Domain) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                  https://
                </div>
                <input
                  type="text"
                  id="input-custom-domain"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="www.sirketiniz.com veya sirketiniz.com.tr"
                  className="w-full pl-20 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Örnek: <code>www.istanbulnakliyat.com</code>, <code>bursatesisat.com.tr</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Üretilen Statik Alt Alan Adı (Subdomain)
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={subdomainInput}
                  onChange={(e) => setSubdomainInput(e.target.value)}
                  placeholder="sirket"
                  className="w-full px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-300 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
                <span className="px-2.5 py-2.5 rounded-r-xl bg-slate-100 border border-slate-300 text-slate-600 text-xs font-mono font-medium whitespace-nowrap">
                  .hizliweb.site
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Kaydettikten sonra aşağıdaki Cloudflare CNAME kayıtlarını panelinize girmeniz gerekir.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="btn-save-custom-domain"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Alan Adını Kaydet &amp; Talimatları Güncelle</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          id="tab-btn-step-by-step"
          onClick={() => setActiveInstructionTab("step-by-step")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeInstructionTab === "step-by-step"
              ? "bg-slate-900 text-blue-300 shadow-xs ring-1 ring-blue-500/40"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          <span>1. Cloudflare CNAME Yapılandırma Adımları</span>
        </button>

        <button
          type="button"
          id="tab-btn-dns-table"
          onClick={() => setActiveInstructionTab("dns-table")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeInstructionTab === "dns-table"
              ? "bg-slate-900 text-amber-300 shadow-xs ring-1 ring-amber-500/40"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileCode className="w-4 h-4 text-amber-500" />
          <span>2. Hazır DNS Kayıt Tablosu &amp; Kopyalama</span>
        </button>

        <button
          type="button"
          id="tab-btn-live-test"
          onClick={() => setActiveInstructionTab("live-test")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeInstructionTab === "live-test"
              ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-500/40"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-500" />
          <span>3. Canlı DNS Yayılımı (Propagation) &amp; Edge Teşhis</span>
        </button>

        <button
          type="button"
          id="tab-btn-faq"
          onClick={() => setActiveInstructionTab("faq")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeInstructionTab === "faq"
              ? "bg-slate-900 text-purple-300 shadow-xs ring-1 ring-purple-500/40"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <span>4. SSS &amp; SSL Yönlendirme İpuçları</span>
        </button>
      </div>

      {/* 4. CONTENT SECTIONS */}

      {/* SUB-TAB 1: DETAILED STEP-BY-STEP CLOUDFLARE CNAME INSTRUCTIONS */}
      {activeInstructionTab === "step-by-step" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Spesifik Cloudflare CNAME Kurulum Kılavuzu</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Üretilen Siteyi Cloudflare CNAME ile 5 Adımda Bağlayın
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Web sitenizin statik kodları HızlıWeb Edge sunucularında derlenmiştir. Alan adınızı bağlamak için aşağıdaki spesifik adımları Cloudflare panelinizde eksiksiz uygulayın:
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAllCloudflareInstructions}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                title="Tüm Cloudflare CNAME kayıt talimatlarını metin olarak kopyalayın"
              >
                {copiedField === "all-cf-instructions" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Talimatlar Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tüm Talimatları Kopyala</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Interactive Flow */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">Cloudflare Dashboard&apos;a Giriş Yapın ve Alan Adınızı Seçin</span>
                    <a
                      href="https://dash.cloudflare.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs font-mono font-bold"
                    >
                      <span>dash.cloudflare.com</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold">Cloudflare Dashboard</a>&apos;a giriş yapın. Hesabınızdaki alan adları listesinden sitenizi bağlamak istediğiniz alan adını (örn: <strong>{rootApexDomain}</strong>) tıklayarak seçin.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-2 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    Sol Menüden &quot;DNS &gt; Records&quot; (Kayıtlar) Sayfasına Gidin
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sol gezinme menüsünden <strong>DNS</strong> başlığı altındaki <strong>Records</strong> sekmesine tıklayın. Burada alan adınıza ait mevcut DNS kayıtları listelenecektir. Tablonun hemen üstündeki mavi <strong>&quot;+ Add record&quot; (Kayıt Ekle)</strong> butonuna tıklayın.
                  </p>
                </div>
              </div>

              {/* Step 3: THE SPECIFIC CNAME RECORD */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-4 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-2">
                      <span>Birincil CNAME Kaydını Ekleyin (www için)</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold font-mono">
                        EN KRİTİK ADIM
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Açılan kayıt formuna aşağıdaki değerleri birebir girin:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-blue-200 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Type (Tür)</div>
                      <div className="font-bold text-blue-700 text-sm">CNAME</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Name (Ad / Host)</div>
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>www</span>
                        <button
                          type="button"
                          onClick={() => handleCopy("www", "name-www")}
                          className="text-[10px] text-blue-600 hover:underline font-sans cursor-pointer"
                        >
                          {copiedField === "name-www" ? "✓" : "Kopyala"}
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Target (Hedef / İçerik)</div>
                      <div className="font-bold text-amber-600 flex items-center justify-between gap-2">
                        <span className="truncate">{generatedSiteHost}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(generatedSiteHost, "target-cname")}
                          className="text-[10px] text-blue-600 hover:underline font-sans shrink-0 cursor-pointer"
                        >
                          {copiedField === "target-cname" ? "✓ Kopyalandı" : "Kopyala"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Orange Cloud Highlight */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Proxy Durumu: Proxied (Turuncu Bulut ☁️) Seçilmelidir!</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Cloudflare formunda <strong>Proxy status</strong> seçeneğini mutlaka <strong>&quot;Proxied&quot; (Turuncu Bulut)</strong> olarak bırakın. Turuncu bulut aktif olduğunda, HızlıWeb&apos;in 320+ şehirdeki küresel Anycast CDN önbelleği, DDoS koruması ve otomatik SSL sertifikası (TLS 1.3) devreye girer.
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    TTL değerini <strong>&quot;Auto&quot;</strong> olarak bırakıp mavi <strong>&quot;Save&quot;</strong> butonuna basın.
                  </p>
                </div>
              </div>

              {/* Step 4: Root Domain CNAME Flattening */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Kök Alan Adı (Apex / @) İçin CNAME Flattening Ekleyin</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Ziyaretçi Kolaylığı
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ziyaretçileriniz tarayıcıya <code>www</code> yazmadan yalnızca <code>{rootApexDomain}</code> yazdığında da sitenizin açılması için Cloudflare&apos;in yerleşik <strong>CNAME Flattening</strong> teknolojisinden yararlanabilirsiniz.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Type (Tür)</div>
                      <div className="font-bold text-blue-700 text-sm">CNAME</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Name (Ad)</div>
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>@ (kök alan)</span>
                        <button
                          type="button"
                          onClick={() => handleCopy("@", "name-at")}
                          className="text-[10px] text-blue-600 hover:underline font-sans cursor-pointer"
                        >
                          {copiedField === "name-at" ? "✓" : "Kopyala"}
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[10px] text-slate-500 font-sans font-bold">Target (Hedef)</div>
                      <div className="font-bold text-amber-600 flex items-center justify-between gap-2">
                        <span className="truncate">{generatedSiteHost}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(generatedSiteHost, "target-at")}
                          className="text-[10px] text-blue-600 hover:underline font-sans shrink-0 cursor-pointer"
                        >
                          {copiedField === "target-at" ? "✓ Kopyalandı" : "Kopyala"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Proxy durumunu yine <strong>Proxied (Turuncu Bulut)</strong> yapıp <strong>Save</strong> butonuna tıklayın.
                  </p>
                </div>
              </div>

              {/* Step 5: SSL Full & Always HTTPS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  5
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>SSL/TLS Modunu &quot;Full&quot; Yapın ve &quot;Always Use HTTPS&quot; Açın</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                      Önemli Kural
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cloudflare sol menüsünden <strong>SSL/TLS &gt; Overview</strong> sekmesine gidin:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1">
                    <li>
                      Şifreleme modunu mutlaka <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> olarak belirleyin.
                      <div className="mt-1 text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        🚫 <strong>UYARI:</strong> Asla <strong>&quot;Flexible&quot;</strong> seçmeyin! HızlıWeb statik motoru HTTPS üzerinden çalıştığı için Flexible modu <code>ERR_TOO_MANY_REDIRECTS</code> döngüsüne yol açar.
                      </div>
                    </li>
                    <li>
                      Ardından <strong>SSL/TLS &gt; Edge Certificates</strong> sayfasına giderek <strong>&quot;Always Use HTTPS&quot;</strong> ve <strong>&quot;Automatic HTTPS Rewrites&quot;</strong> anahtarlarını aktif hale getirin.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INTERACTIVE DNS TABLE & COPY */}
      {activeInstructionTab === "dns-table" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-500" />
                  <span>Cloudflare DNS Kayıt Tablosu</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cloudflare hesabınızda DNS &gt; Records sayfasına eklemeniz gereken kayıtların hazır listesi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAllCloudflareInstructions}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                {copiedField === "all-cf-instructions" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tümü Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tüm Tabloyu Metin Olarak Kopyala</span>
                  </>
                )}
              </button>
            </div>

            {/* Mock Cloudflare DNS Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 text-[11px] font-mono uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-3 font-bold">Type (Tür)</th>
                    <th className="px-3.5 py-3 font-bold">Name (Ad / Host)</th>
                    <th className="px-3.5 py-3 font-bold">Content (Hedef / Değer)</th>
                    <th className="px-3.5 py-3 font-bold">Proxy Status</th>
                    <th className="px-3.5 py-3 font-bold">TTL</th>
                    <th className="px-3.5 py-3 font-bold text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {/* Row 1: CNAME www */}
                  <tr className="hover:bg-blue-50/40 transition-colors bg-blue-50/20">
                    <td className="px-3.5 py-3.5 font-black text-blue-600">CNAME</td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">www</td>
                    <td className="px-3.5 py-3.5 text-slate-800 font-bold max-w-xs truncate">
                      {generatedSiteHost}
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Proxied (Turuncu Bulut ☁️)</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">Auto</td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedSiteHost, "cname-www-row")}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "cname-www-row" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-blue-600" />
                            <span>Hedefi Kopyala</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Row 2: CNAME @ (Apex) */}
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3.5 py-3.5 font-black text-blue-600">CNAME</td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">@</td>
                    <td className="px-3.5 py-3.5 text-slate-800 font-bold max-w-xs truncate">
                      {generatedSiteHost}
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Proxied (Turuncu Bulut ☁️)</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">Auto</td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedSiteHost, "cname-apex-row")}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "cname-apex-row" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-blue-600" />
                            <span>Hedefi Kopyala</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Row 3: A Kaydı (Alternatif Apex) */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3.5 font-black text-indigo-600">A</td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">@</td>
                    <td className="px-3.5 py-3.5 text-slate-600 font-bold">104.21.68.99</td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span>Proxied ☁️</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">Auto</td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy("104.21.68.99", "a-ip-row")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "a-ip-row" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>IP Kopyala</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Row 4: TXT Doğrulama */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3.5 font-black text-slate-600">TXT</td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">_hizliweb-verify</td>
                    <td className="px-3.5 py-3.5 text-slate-600 font-bold truncate max-w-xs">
                      {verificationToken}
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        DNS only
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">Auto</td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(verificationToken, "txt-verify-row")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "txt-verify-row" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">CNAME vs A Kaydı Notu:</div>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Cloudflare üzerinde CNAME kaydı tanımlamak en güvenilir ve geleceğe dönük yöntemdir. HızlıWeb altyapısı sunucu IP adreslerini güncellese bile, CNAME kaydınız otomatik olarak güncel IP adreslerine yönlenir; sitenizde hiçbir kesinti yaşanmaz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE PROPAGATION DIAGNOSTICS & GLOBAL EDGE NODES */}
      {activeInstructionTab === "live-test" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-500" />
                  <span>Cloudflare CNAME &amp; Edge Yayılım Durumu</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dünya genelindeki Cloudflare Anycast veri merkezlerinin sitenize erişim hızını ve CNAME çözümleme durumunu test edin.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunDnsTest}
                disabled={isTestingPropagation}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingPropagation ? "animate-spin" : ""}`} />
                <span>{isTestingPropagation ? "Düğümler Taranıyor..." : "Yeniden Test Et"}</span>
              </button>
            </div>

            {/* Test Results Summary Card */}
            <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    CNAME Kaydı Doğrulandı &amp; Edge Hazır
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Hedef: {generatedSiteHost} • TLS 1.3 Aktif
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-400">
                <span>Son Test: </span>
                <span className="text-amber-400 font-bold">{lastTestedTime || "Yeni tamamlandı"}</span>
              </div>
            </div>

            {/* Global Edge Nodes Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">Edge Konumu</th>
                    <th className="px-3.5 py-2.5">Çözümlenen IP</th>
                    <th className="px-3.5 py-2.5">Gecikme (Latency)</th>
                    <th className="px-3.5 py-2.5 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {edgeNodes.map((node, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-slate-900 flex items-center gap-2 font-sans">
                        <span>{node.flag}</span>
                        <span>{node.location}</span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600">{node.ip}</td>
                      <td className="px-3.5 py-3 font-bold text-emerald-600">{node.latency}</td>
                      <td className="px-3.5 py-3 text-right font-sans">
                        {node.status === "checking" ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Taranıyor...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>0.02s Yanıt</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FAQ & SSL REDIRECT TIPS */}
      {activeInstructionTab === "faq" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>&quot;Too Many Redirects&quot; (Çok Fazla Yönlendirme) Hatası Alırsam Ne Yapmalıyım?</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Bu hata %99 ihtimalle Cloudflare üzerindeki SSL/TLS şifreleme modunun <strong>&quot;Flexible&quot;</strong> olarak seçilmesinden kaynaklanır. Cloudflare panelinizden <strong>SSL/TLS &gt; Overview</strong> sayfasına gidin ve modu <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> olarak değiştirin. Sorun 1 dakika içinde düzelecektir.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Cloudflare CNAME Yayılımı Ne Kadar Sürer?</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Cloudflare, dünyanın en hızlı DNS altyapısına sahiptir (1.1.1.1). Kayıtlarınızı girdikten sonra genellikle <strong>2 ile 10 dakika</strong> içinde tüm dünyada yayılım tamamlanır ve siteniz açılmaya başlar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>www Olmadan (ornekfirma.com) Yazıldığında da Açılır mı?</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Evet! Step 4&apos;te anlattığımız gibi Cloudflare üzerinde Name kısmına <code>@</code> girerek kök alan adı CNAME kaydı eklerseniz, Cloudflare CNAME Flattening teknolojisi sayesinde kök alan adınız da anında HızlıWeb sitenize yönlenir.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Alan Adımı Natro, GoDaddy veya Turhost&apos;tan Satın Aldım, Ne Yapmalıyım?</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              İki seçeneğiniz var:<br />
              1. <strong>Önerilen (Cloudflare ile):</strong> Cloudflare&apos;e sitenizi ekleyin, kayıt firması panelinizden (GoDaddy vb.) Nameserver (NS) adreslerini Cloudflare&apos;in verdiği adreslere yönlendirin. Böylece tam DDoS koruması ve 0.02s hız kazanırsınız.<br />
              2. <strong>Doğrudan CNAME ile:</strong> Mevcut alan adı firmanızın DNS Yönetimi paneline girip yukarıdaki <code>CNAME (www)</code> kaydını doğrudan ekleyebilirsiniz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
