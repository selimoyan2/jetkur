import React, { useState } from "react";
import { SiteConfig } from "../../types";
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
  HelpCircle,
  Layers,
  Radio,
  Trash2,
  Download,
  Network,
  AlertTriangle,
  ArrowUpRight,
  CheckSquare
} from "lucide-react";

interface AutomatedDnsSetupGuideProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToDomainManager?: () => void;
}

interface EdgeTestNode {
  location: string;
  flag: string;
  ip: string;
  latency: string;
  status: "success" | "checking" | "pending";
}

export const AutomatedDnsSetupGuide: React.FC<AutomatedDnsSetupGuideProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateToDomainManager
}) => {
  const currentCustomDomain = config.cloudflare?.customDomain || "";
  const currentSubdomain = config.cloudflare?.subdomain || "sirket";

  const [domainInput, setDomainInput] = useState(currentCustomDomain);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Active guide sub-tab
  const [guideMode, setGuideMode] = useState<"cname-a" | "cloudflare-native" | "nameservers">("cname-a");

  // Selected Registrar for specific instructions
  const [selectedRegistrar, setSelectedRegistrar] = useState<"cloudflare" | "godaddy" | "natro" | "turhost" | "namecheap" | "google" | "cpanel">("cloudflare");

  // DNS Diagnostics Simulation State
  const [isTestingPropagation, setIsTestingPropagation] = useState(false);
  const [lastTestedTime, setLastTestedTime] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean>(Boolean(currentCustomDomain));

  const [edgeNodes, setEdgeNodes] = useState<EdgeTestNode[]>([
    { location: "İstanbul (Türkiye Edge - IST)", flag: "🇹🇷", ip: "104.21.68.99", latency: "2.1 ms", status: "success" },
    { location: "Frankfurt (Almanya Edge - FRA)", flag: "🇩🇪", ip: "104.21.68.99", latency: "6.8 ms", status: "success" },
    { location: "Londra (Birleşik Krallık - LHR)", flag: "🇬🇧", ip: "104.21.68.99", latency: "10.4 ms", status: "success" },
    { location: "New York (ABD Doğu - EWR)", flag: "🇺🇸", ip: "172.67.182.144", latency: "39.5 ms", status: "success" },
    { location: "Singapur (Asya Edge - SIN)", flag: "🇸🇬", ip: "104.21.68.99", latency: "84.1 ms", status: "success" },
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

  const activeDomain = cleanDomain(domainInput) || currentCustomDomain || "ornekfirma.com.tr";
  const targetSubdomain = currentSubdomain || "sirket";
  const pointsToTarget = `${targetSubdomain}.hizliweb.site`;
  const verificationToken = `hw-site=${config.id || "cf89a2"}`;

  // Get apex vs www representation
  const rootApexDomain = activeDomain.replace(/^www\./, "");
  const wwwDomain = `www.${rootApexDomain}`;

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // 1-Click Save Domain to SiteConfig
  const handleSaveDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanDomain(domainInput);

    const updatedConfig: SiteConfig = {
      ...config,
      cloudflare: {
        ...config.cloudflare,
        customDomain: cleaned || undefined,
        deployedUrl: cleaned
          ? `https://${cleaned.startsWith("www.") ? cleaned : `www.${cleaned}`}`
          : `https://${targetSubdomain}.hizliweb.site`,
        sslActive: true,
        dnsPropagationStatus: cleaned ? "verified" : "unconfigured",
        dnsRecords: [
          {
            type: "CNAME",
            name: "www",
            content: pointsToTarget,
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
            type: "A",
            name: "@",
            content: "172.67.182.144",
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
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Remove custom domain
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
        deployedUrl: `https://${targetSubdomain}.hizliweb.site`,
        dnsPropagationStatus: "unconfigured"
      }
    };
    onChange(updatedConfig);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Copy full DNS documentation block
  const handleCopyAllDns = () => {
    const textToCopy = `=== HIZLIWEB ALTYAPISI CLOUDFLARE DNS YAPILANDIRMA BİLGİLERİ ===
Alan Adı: ${activeDomain}
Kök (Apex) Alan Adı: ${rootApexDomain}
WWW Alan Adı: ${wwwDomain}
HızlıWeb Bulut Örneği: ${pointsToTarget}
Oluşturulma Tarihi: ${new Date().toLocaleDateString("tr-TR")}

[1. CNAME KAYDI - Web Trafiği (ZORUNLU / ÖNERİLEN)]
Tür: CNAME
Ad / Host: www
Hedef / Değer: ${pointsToTarget}
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut / Proxied)
TTL: Otomatik (Auto)

[2. A KAYDI (Birincil Apex/Root Anycast IP) - Kök Alan Adı]
Tür: A
Ad / Host: @
IP / Değer: 104.21.68.99
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut / Proxied)
TTL: Otomatik (Auto)

[3. A KAYDI (Yedek Anycast IP - Yüksek Erişilebilirlik)]
Tür: A
Ad / Host: @
IP / Değer: 172.67.182.144
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut / Proxied)
TTL: Otomatik (Auto)

[4. TXT DOĞRULAMA KAYDI]
Tür: TXT
Ad / Host: _hizliweb-verify
Değer: ${verificationToken}
Proxy Durumu: DNS Only (Gri Bulut)
TTL: Otomatik

[5. CLOUDFLARE NAMESERVERS (Tam Geçiş İçin İsteğe Bağlı)]
NS 1: ara.ns.cloudflare.com
NS 2: walt.ns.cloudflare.com

[KRİTİK GÜVENLİK AYARI]
Cloudflare Dashboard > SSL/TLS Modu: MUTLAKA "Full" veya "Full (Strict)" seçilmelidir.
Asla "Flexible" seçilmemelidir.
============================================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField("all-dns");
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Download BIND RFC 1035 Standard Zone file
  const handleDownloadZoneFile = () => {
    const zoneContent = `; BIND Zone file for ${rootApexDomain}
; Generated automatically by HizliWeb Cloudflare DNS Setup Guide
; Date: ${new Date().toISOString()}
$ORIGIN ${rootApexDomain}.
$TTL 3600

; SOA Record
@       IN      SOA     ara.ns.cloudflare.com. dns.cloudflare.com. (
                        ${Math.floor(Date.now() / 1000)} ; serial
                        3600       ; refresh
                        1800       ; retry
                        1209600    ; expire
                        300 )      ; minimum

; Cloudflare Anycast A Records for Root Apex (@)
@       IN      A       104.21.68.99
@       IN      A       172.67.182.144

; Primary CNAME Record for WWW
www     IN      CNAME   ${pointsToTarget}.

; HizliWeb Ownership Verification TXT Record
_hizliweb-verify IN  TXT  "${verificationToken}"
`;

    const blob = new Blob([zoneContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rootApexDomain}.zone`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Cloudflare DNS Import CSV format
  const handleDownloadCloudflareCsv = () => {
    const csvContent = `Type,Name,Content,TTL,Proxy status
A,@,104.21.68.99,Auto,true
A,@,172.67.182.144,Auto,true
CNAME,www,${pointsToTarget},Auto,true
TXT,_hizliweb-verify,${verificationToken},Auto,false
`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cloudflare-dns-${rootApexDomain}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run simulated DNS propagation test
  const handleRunDnsTest = () => {
    setIsTestingPropagation(true);
    setEdgeNodes(prev => prev.map(n => ({ ...n, status: "checking" })));

    setTimeout(() => {
      setEdgeNodes([
        { location: "İstanbul (Türkiye Edge - IST)", flag: "🇹🇷", ip: "104.21.68.99", latency: "2.1 ms", status: "success" },
        { location: "Frankfurt (Almanya Edge - FRA)", flag: "🇩🇪", ip: "104.21.68.99", latency: "6.8 ms", status: "success" },
        { location: "Londra (Birleşik Krallık - LHR)", flag: "🇬🇧", ip: "104.21.68.99", latency: "10.4 ms", status: "success" },
        { location: "New York (ABD Doğu - EWR)", flag: "🇺🇸", ip: "172.67.182.144", latency: "39.5 ms", status: "success" },
        { location: "Singapur (Asya Edge - SIN)", flag: "🇸🇬", ip: "104.21.68.99", latency: "84.1 ms", status: "success" },
      ]);
      setIsTestingPropagation(false);
      setTestSuccess(true);
      setLastTestedTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 rounded-3xl border border-cyan-900/60 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Otomatik DNS Kurulum Rehberi (Automated DNS Setup)</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Cloudflare DNS Yönlendirme Kılavuzu</span>
              <span className="text-cyan-400 text-base font-normal font-mono">
                [CNAME & A Kayıtları]
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kendi özel alan adınızı (örn. <strong>{activeDomain}</strong>) HızlıWeb bulut örneğinize bağlayın. Aşağıdaki spesifik <strong>CNAME</strong> ve <strong>A kayıtlarını</strong> alan adı sağlayıcınıza ekleyerek 320+ Cloudflare Edge noktasından 0 ms gecikmeyle yayın yapın.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {currentCustomDomain && (
              <a
                href={`https://${currentCustomDomain}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Siteyi Ziyaret Et</span>
              </a>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Önizleme</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRunDnsTest}
              disabled={isTestingPropagation}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingPropagation ? "animate-spin" : ""}`} />
              <span>DNS Testi Yap</span>
            </button>
          </div>
        </div>

        {/* Live Architecture Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-cyan-900/60">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentCustomDomain ? "bg-emerald-500/15 text-emerald-400" : "bg-cyan-500/15 text-cyan-400"}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Hedef Cloudflare Örneği</div>
              <div className="text-xs font-bold text-white truncate font-mono">
                {pointsToTarget}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">SSL / TLS Şifreleme</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare TLS 1.3 (Aktif)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Global Anycast Routing</div>
              <div className="text-xs font-bold text-cyan-300">
                104.21.68.99 / 172.67.182.144
              </div>
            </div>
          </div>
        </div>
      </div>

      {saveSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Alan adınız başarıyla kaydedildi! Lütfen aşağıdaki CNAME ve A kayıtlarını sağlayıcınıza giriniz.</span>
        </div>
      )}

      {/* 2. INTERACTIVE DOMAIN CONFIGURATOR BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-600" />
              <span>1. Adım: Özel Alan Adınızı Belirleyin</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alan adınızı yazdığınızda aşağıdaki tüm CNAME ve A kayıtları anında otomatik hesaplanır.
            </p>
          </div>
          {currentCustomDomain && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                ✓ Aktif Bağlı: {currentCustomDomain}
              </span>
              <button
                type="button"
                onClick={handleRemoveDomain}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Alan Adını Sıfırla"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 text-xs font-mono select-none">
                https://
              </span>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="www.firmaadi.com"
                className="w-full pl-20 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDomain}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer text-center"
            >
              Yapılandırmayı Kaydet
            </button>
            {onNavigateToDomainManager && (
              <button
                type="button"
                onClick={onNavigateToDomainManager}
                className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                title="Gelişmiş Alan Adı Yöneticisine Git"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Örnekler:</span>
          {[
            "www.firmaadi.com",
            `www.${(config.companyName || "sirketim").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`,
            "www.ustam.net",
            "www.proje.org"
          ].map((sample, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => setDomainInput(sample)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-600 transition-all cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SPECIFIC CNAME & A-RECORD CONFIGURATIONS (THE CORE SPEC) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Adım: DNS Tablosuna Eklenecek Özel Kayıtlar</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Gerekli CNAME ve A Kayıtları Yapılandırması
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aşağıdaki kayıtları alan adı kontrol panelinizdeki (Cloudflare, GoDaddy, Natro, vb.) <strong>DNS Yönetimi</strong> bölümüne ekleyin:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAllDns}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Tüm kayıtları metin olarak kopyala"
            >
              {copiedField === "all-dns" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tümü Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Tüm DNS'i Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadZoneFile}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="BIND RFC 1035 Standard Zone Dosyası İndir"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Zone (.zone)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCloudflareCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cloudflare DNS İçeri Aktarma CSV Dosyası"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Cloudflare CSV</span>
            </button>
          </div>
        </div>

        {/* DNS TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3.5">Kayıt Türü</th>
                <th className="px-4 py-3.5">Ad / Host</th>
                <th className="px-4 py-3.5">Hedef / Değer (Points To)</th>
                <th className="px-4 py-3.5">Proxy Durumu</th>
                <th className="px-4 py-3.5">TTL</th>
                <th className="px-4 py-3.5 text-right">Hızlı Kopyala</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-mono bg-white">
              {/* 1. PRIMARY CNAME RECORD */}
              <tr className="hover:bg-purple-50/40 transition-colors">
                <td className="px-4 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs">
                    <span>CNAME</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-900 text-sm">www</div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    {wwwDomain}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-purple-700 font-black text-sm break-all">
                    {pointsToTarget}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    HızlıWeb Edge Dağıtım Örneği
                  </div>
                </td>
                <td className="px-4 py-4 font-sans">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Proxied (Turuncu Bulut)</span>
                  </span>
                </td>
                <td className="px-4 py-4 font-sans text-slate-600 text-xs">
                  Otomatik (Auto)
                </td>
                <td className="px-4 py-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => handleCopy(pointsToTarget, "cname-val")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "cname-val" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Kopyalandı</span>
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

              {/* 2. PRIMARY A RECORD (ROOT @) */}
              <tr className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs">
                    <span>A</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-900 text-sm">@</div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Kök / Root ({rootApexDomain})
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-blue-700 font-black text-sm">
                    104.21.68.99
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Cloudflare Primary Anycast IP
                  </div>
                </td>
                <td className="px-4 py-4 font-sans">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Proxied (Turuncu Bulut)</span>
                  </span>
                </td>
                <td className="px-4 py-4 font-sans text-slate-600 text-xs">
                  Otomatik (Auto)
                </td>
                <td className="px-4 py-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => handleCopy("104.21.68.99", "a-val-1")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "a-val-1" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Kopyalandı</span>
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

              {/* 3. SECONDARY REDUNDANT A RECORD */}
              <tr className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs">
                    <span>A</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-900 text-sm">@</div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Kök Yedek Anycast IP
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-blue-700 font-black text-sm">
                    172.67.182.144
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Cloudflare Secondary Anycast IP (Yedek Hat)
                  </div>
                </td>
                <td className="px-4 py-4 font-sans">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Proxied (Turuncu Bulut)</span>
                  </span>
                </td>
                <td className="px-4 py-4 font-sans text-slate-600 text-xs">
                  Otomatik (Auto)
                </td>
                <td className="px-4 py-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => handleCopy("172.67.182.144", "a-val-2")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "a-val-2" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Kopyalandı</span>
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

              {/* 4. VERIFICATION TXT RECORD */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs">
                    <span>TXT</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-slate-900 text-sm">_hizliweb-verify</div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Alan Adı Doğrulama
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-slate-700 font-mono text-xs break-all">
                    {verificationToken}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">
                    Tenant Sahiplik İmzası
                  </div>
                </td>
                <td className="px-4 py-4 font-sans">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    DNS Only (Gri Bulut)
                  </span>
                </td>
                <td className="px-4 py-4 font-sans text-slate-600 text-xs">
                  Otomatik
                </td>
                <td className="px-4 py-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => handleCopy(verificationToken, "txt-val")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "txt-val" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Kopyalandı</span>
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

        {/* Highlight Note */}
        <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-xs text-cyan-950 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Önemli Kural (www ve Kök Alan Adı Eşleşmesi):</span>
            <p className="text-cyan-900 leading-relaxed text-[11px]">
              Ziyaretçileriniz tarayıcılarına hem <strong>{rootApexDomain}</strong> (www olmadan) hem de <strong>{wwwDomain}</strong> (www ile) yazdıklarında sitenize kesintisiz ulaşabilmeleri için yukarıdaki <strong>CNAME (www)</strong> ve <strong>A (@)</strong> kayıtlarının ikisini de eklemeniz önerilir.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SETUP METHODS / GUIDES */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600" />
            <span>3. Adım: Kurulum Yönteminizi Seçin</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mevcut alan adı firmanızda kalarak veya Cloudflare paneli üzerinden kurulum yapabilirsiniz.
          </p>
        </div>

        {/* Guide Mode Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setGuideMode("cname-a")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              guideMode === "cname-a"
                ? "bg-slate-900 text-white border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                guideMode === "cname-a" ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-200 text-slate-700"
              }`}>
                Yöntem 1 (En Kolay)
              </span>
              <Zap className={`w-4 h-4 ${guideMode === "cname-a" ? "text-cyan-400" : "text-slate-400"}`} />
            </div>
            <div className="text-xs font-black">CNAME & A Kaydı İle Yönlendirme</div>
            <p className={`text-[11px] mt-1 line-clamp-2 ${guideMode === "cname-a" ? "text-slate-300" : "text-slate-500"}`}>
              Alan adınızı hiçbir yere taşımadan, mevcut firmanızın DNS panelinden sadece 2 kayıt ekleyin.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setGuideMode("cloudflare-native")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              guideMode === "cloudflare-native"
                ? "bg-slate-900 text-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                guideMode === "cloudflare-native" ? "bg-amber-500/20 text-amber-300" : "bg-slate-200 text-slate-700"
              }`}>
                Yöntem 2 (Önerilen)
              </span>
              <ShieldCheck className={`w-4 h-4 ${guideMode === "cloudflare-native" ? "text-amber-400" : "text-slate-400"}`} />
            </div>
            <div className="text-xs font-black">Cloudflare Kontrol Paneli</div>
            <p className={`text-[11px] mt-1 line-clamp-2 ${guideMode === "cloudflare-native" ? "text-slate-300" : "text-slate-500"}`}>
              Ücretsiz Cloudflare hesabı ile tam DDoS koruması, 0 ms edge cache ve otomatik TLS 1.3 SSL.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setGuideMode("nameservers")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              guideMode === "nameservers"
                ? "bg-slate-900 text-white border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                guideMode === "nameservers" ? "bg-blue-500/20 text-blue-300" : "bg-slate-200 text-slate-700"
              }`}>
                Yöntem 3 (Tam Delegasyon)
              </span>
              <Server className={`w-4 h-4 ${guideMode === "nameservers" ? "text-blue-400" : "text-slate-400"}`} />
            </div>
            <div className="text-xs font-black">Nameserver (NS) Değişimi</div>
            <p className={`text-[11px] mt-1 line-clamp-2 ${guideMode === "nameservers" ? "text-slate-300" : "text-slate-500"}`}>
              Alan adı firmanızın DNS sunucularını Cloudflare Anycast NS adresleri ile değiştirin.
            </p>
          </button>
        </div>

        {/* Selected Guide Details */}
        {guideMode === "cname-a" && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span>Mevcut Firmanızda Kalın: 3 Basit Adım</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-bold text-slate-900">Panele Giriş Yapın</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Alan adınızı satın aldığınız firmanın (GoDaddy, Natro, Turhost vb.) kontrol paneline girip <strong>DNS Yönetimi</strong> sayfasına gidin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-bold text-slate-900">Kayıtları Ekleyin</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tablodaki <code>www</code> ➔ <strong>{pointsToTarget}</strong> CNAME kaydı ve <code>@</code> ➔ <strong>104.21.68.99</strong> A kaydını kaydedin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-bold text-slate-900">Otomatik SSL & Yayın</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  DNS yayılımı başladığında Cloudflare SSL sertifikası otomatik tanımlanır ve siteniz güvenli (HTTPS) açılır.
                </p>
              </div>
            </div>
          </div>
        )}

        {guideMode === "cloudflare-native" && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4 text-xs">
            <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Cloudflare Dashboard Kurulum Adımları & Kritik Ayarlar</span>
            </div>
            <ol className="list-decimal list-inside space-y-2.5 text-slate-700 leading-relaxed">
              <li>
                <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">
                  dash.cloudflare.com
                </a> adresine giriş yapın ve <strong>&quot;Add a Site&quot; (Site Ekle)</strong> butonuna basarak <code>{rootApexDomain}</code> alan adınızı girin.
              </li>
              <li>
                Plan olarak en alttaki <strong>&quot;Free&quot; (Ücretsiz)</strong> seçeneğini işaretleyip devam edin.
              </li>
              <li>
                <strong>DNS &gt; Records</strong> sekmesine gelin:
                <ul className="list-disc list-inside pl-4 pt-1 space-y-1 text-slate-800">
                  <li>CNAME: Ad <code>www</code>, Hedef <code>{pointsToTarget}</code>, Proxy <strong>Turuncu Bulut (Proxied)</strong></li>
                  <li>A: Ad <code>@</code>, IPv4 <code>104.21.68.99</code>, Proxy <strong>Turuncu Bulut (Proxied)</strong></li>
                  <li>A: Ad <code>@</code>, IPv4 <code>172.67.182.144</code>, Proxy <strong>Turuncu Bulut (Proxied)</strong></li>
                </ul>
              </li>
              <li className="font-bold text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ KRİTİK SSL AYARI: Sol menüden <strong>SSL/TLS &gt; Overview</strong> sekmesine gidin. Şifreleme modunu mutlaka <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> yapın. Asla &quot;Flexible&quot; seçmeyin (yönlendirme döngüsünü önlemek için).
              </li>
              <li>
                Sol menüden <strong>SSL/TLS &gt; Edge Certificates</strong> sekmesine gidip <strong>&quot;Always Use HTTPS&quot;</strong> anahtarını açın.
              </li>
            </ol>
          </div>
        )}

        {guideMode === "nameservers" && (
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 text-xs">
            <div className="font-bold text-blue-950 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Cloudflare Nameserver Adresleri (NS)</span>
            </div>
            <p className="text-blue-900 leading-relaxed">
              Alan adınızı satın aldığınız firmanın panelinden DNS sunucularını (Nameservers) Cloudflare&apos;e yönlendirmek için aşağıdaki iki adresi kullanın:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">1. Birincil Nameserver (NS1)</div>
                  <div className="text-xs font-mono font-bold text-blue-700">ara.ns.cloudflare.com</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("ara.ns.cloudflare.com", "ns1")}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                >
                  {copiedField === "ns1" ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">2. İkincil Nameserver (NS2)</div>
                  <div className="text-xs font-mono font-bold text-blue-700">walt.ns.cloudflare.com</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("walt.ns.cloudflare.com", "ns2")}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                >
                  {copiedField === "ns2" ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. POPULAR REGISTRAR-SPECIFIC CLICK-BY-CLICK INSTRUCTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <span>Alan Adı Firmanıza Özel Adım Adım Rehber</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Alan adınızı satın aldığınız platformu seçerek buton isimleri ve yönlendirme talimatlarını görüntüleyin:
          </p>
        </div>

        {/* Registrar Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "cloudflare", name: "Cloudflare Registrar" },
            { id: "godaddy", name: "GoDaddy" },
            { id: "natro", name: "Natro (Türkiye)" },
            { id: "turhost", name: "Turhost (Türkiye)" },
            { id: "namecheap", name: "Namecheap" },
            { id: "google", name: "Google / Squarespace" },
            { id: "cpanel", name: "cPanel / Plesk Zone Editor" },
          ].map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => setSelectedRegistrar(reg.id as typeof selectedRegistrar)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRegistrar === reg.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {reg.name}
            </button>
          ))}
        </div>

        {/* Registrar Content Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
          {selectedRegistrar === "cloudflare" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">Cloudflare Dashboard DNS Yönetimi:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>Cloudflare Dashboard &gt; <strong>Websites</strong> menüsünden alan adınızı seçin.</li>
                <li>Sol menüden <strong>DNS &gt; Records</strong> sekmesine gelin.</li>
                <li><strong>&quot;Add record&quot;</strong> butonuna basın:
                  <div className="pl-4 pt-1 font-mono text-[11px] text-purple-700">
                    Type: CNAME | Name: www | Target: {pointsToTarget} | Proxy status: Proxied (Turuncu Bulut)
                  </div>
                </li>
                <li>İkinci bir kayıt ekleyin:
                  <div className="pl-4 pt-1 font-mono text-[11px] text-blue-700">
                    Type: A | Name: @ | IPv4 address: 104.21.68.99 | Proxy status: Proxied (Turuncu Bulut)
                  </div>
                </li>
                <li>İşlem tamamlandı! Cloudflare üzerinde yayılım ortalama <strong>1-2 dakika</strong> içinde tamamlanır.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "godaddy" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">GoDaddy DNS Yönetimi:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>GoDaddy hesabınıza giriş yapın ve <strong>Ürünlerim</strong> sayfasına gidin.</li>
                <li>Alan adınızın yanındaki <strong>DNS</strong> veya <strong>DNS Yönetimi</strong> butonuna tıklayın.</li>
                <li>Mevcut bir <code>www</code> CNAME kaydı varsa düzenleyin, yoksa <strong>&quot;Yeni Kayıt Ekle&quot;</strong> deyin.</li>
                <li>Tür: <strong>CNAME</strong>, Ad: <strong>www</strong>, Değer: <strong>{pointsToTarget}</strong>, TTL: <strong>1/2 Saat</strong> olarak kaydedin.</li>
                <li>Kök yönlendirme için Tür: <strong>A</strong>, Ad: <strong>@</strong>, Değer: <strong>104.21.68.99</strong> ekleyin.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "natro" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">Natro (.com.tr ve Kurumsal) DNS Yönetimi:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>Natro Müşteri Panelinize giriş yapın &gt; <strong>Alan Adı Yönetimi</strong> &gt; Alan adınızı seçin.</li>
                <li><strong>Gelişmiş DNS Yönetimi</strong> sekmesine tıklayın.</li>
                <li>CNAME kayıtları bölümünden Ad: <strong>www</strong>, Değer: <strong>{pointsToTarget}</strong> ekleyin.</li>
                <li>A kaydı bölümünden Ad: <strong>@</strong>, IP: <strong>104.21.68.99</strong> girin ve kaydedin.</li>
                <li>Natro DNS güncellemeleri Türkiye genelinde genellikle 30-60 dakika içinde aktifleşir.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "turhost" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">Turhost DNS Yönetimi:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>Turhost Müşteri Paneli &gt; <strong>Alan Adlarım</strong> sayfasına gidin.</li>
                <li>Alan adınızı seçip <strong>DNS Yönetimi</strong> sekmesini açın.</li>
                <li>CNAME listesine <strong>www</strong> ➔ <strong>{pointsToTarget}</strong> kaydını girin.</li>
                <li>Kök yönlendirme için A kaydını <strong>104.21.68.99</strong> ve yedek A kaydını <strong>172.67.182.144</strong> olarak tanımlayın.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "namecheap" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">Namecheap Advanced DNS:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>Namecheap Dashboard &gt; Domain List &gt; Alan adınızın yanındaki <strong>Manage</strong> butonuna tıklayın.</li>
                <li><strong>Advanced DNS</strong> sekmesine geçin.</li>
                <li>&quot;Add New Record&quot; butonuna tıklayın: Type: <strong>CNAME Record</strong>, Host: <strong>www</strong>, Value: <strong>{pointsToTarget}</strong>, TTL: <strong>Automatic</strong>.</li>
                <li>Kök alan adı için: Type: <strong>A Record</strong>, Host: <strong>@</strong>, Value: <strong>104.21.68.99</strong>.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "google" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">Google Domains / Squarespace:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>Squarespace / Google Domains panelinize girin ve alan adınızı seçin.</li>
                <li><strong>DNS Ayarları (DNS Settings)</strong> sekmesine geçin.</li>
                <li>Özel Kayıt Ekle: Host: <strong>www</strong>, Record: <strong>CNAME</strong>, Data: <strong>{pointsToTarget}</strong>.</li>
                <li>Apex yönlendirmesi için A kaydını <strong>104.21.68.99</strong> olarak girin.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === "cpanel" && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">cPanel / Plesk Zone Editor:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                <li>cPanel kontrol panelinize giriş yapın ve <strong>Zone Editor (Bölge Düzenleyicisi)</strong> aracını açın.</li>
                <li>Alan adınızın yanındaki <strong>Yönet (Manage)</strong> butonuna tıklayın.</li>
                <li>Mevcut <code>www</code> CNAME kaydını düzenleyerek hedefi <strong>{pointsToTarget}</strong> yapın.</li>
                <li>Mevcut <code>@</code> A kaydını <strong>104.21.68.99</strong> olarak güncelleyin.</li>
                <li>İsterseniz yukarıdaki <strong>&quot;Zone (.zone) İndir&quot;</strong> butonuna basarak dosyayı cPanel&apos;e doğrudan aktarabilirsiniz.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* 6. LIVE EDGE PROPAGATION HEALTH CHECKER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-500" />
              <span>4. Adım: Küresel DNS Yayılımı & Doğrulama Simülatörü</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alan adınızın Cloudflare Anycast ağına çözümleme durumunu test edin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunDnsTest}
            disabled={isTestingPropagation}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingPropagation ? "animate-spin" : ""}`} />
            <span>{isTestingPropagation ? "Düğümler Taranıyor..." : "Düğümleri Test Et"}</span>
          </button>
        </div>

        {/* Global Edge Node Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {edgeNodes.map((node, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{node.flag}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{node.location}</div>
                  <div className="text-[10px] text-slate-400 font-mono">IP: {node.ip}</div>
                </div>
              </div>

              <div className="text-right">
                {node.status === "checking" ? (
                  <span className="text-[11px] text-cyan-600 font-bold animate-pulse">Sorgulanıyor...</span>
                ) : (
                  <div>
                    <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Çözümlendi</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{node.latency}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* External Diagnostic Links */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>Bağımsız Canlı DNS Doğrulama Araçları</span>
          </div>
          <p className="text-xs text-slate-300">
            Kayıtlarınızın servis sağlayıcılar genelindeki yayılımını bağımsız global sorgulama platformlarından teyit edebilirsiniz:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={`https://dnschecker.org/#CNAME/www.${rootApexDomain}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <span>DNSChecker.org (CNAME)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={`https://www.whatsmydns.net/#A/${rootApexDomain}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <span>WhatsMyDNS.net (A Kaydı)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={`https://radar.cloudflare.com/domains/domain/${rootApexDomain}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <span>Cloudflare Radar</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 7. TROUBLESHOOTING & COMMON MISTAKES */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rose-500" />
          <span>Sık Karşılaşılan DNS Hataları ve Çözümleri</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Hata: &quot;Too Many Redirects&quot; (Yönlendirme Döngüsü)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Cloudflare panelinde SSL modu <strong>Flexible</strong> olarak kaldığında oluşur. Cloudflare &gt; SSL/TLS &gt; Overview sayfasına giderek modu mutlaka <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> yapınız.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Hata: Değişiklik yaptım ama hala eski site açılıyor</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Bilgisayarınızın DNS önbelleği eski kaydı saklıyor olabilir. Komut satırından <code>ipconfig /flushdns</code> çalıştırın veya tarayıcınızda <code>Ctrl + Shift + R</code> ile önbelleği temizleyin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              <span>Hata: Çakışan A veya CNAME Kayıtları</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Alan adınızda önceden kalma eski hosting A kayıtları veya park sayfası kayıtları varsa yenileriyle çakışır. Eski <code>www</code> ve <code>@</code> kayıtlarını silip sadece yukarıdaki HızlıWeb kayıtlarını bırakınız.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>SSL Sertifikası (Yeşil Kilit) Ne Zaman Gelir?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              DNS kayıtları Cloudflare tarafından doğrulandıktan hemen sonra (ortalama 15 dakika) Universal SSL sertifikası otomatik olarak üretilir. Ekstra sertifika satın almanıza gerek yoktur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
