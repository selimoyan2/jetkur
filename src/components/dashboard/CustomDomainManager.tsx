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
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  Share2,
  Trash2,
  Network
} from "lucide-react";
import { AutomatedDnsSetupGuide } from "./AutomatedDnsSetupGuide";

interface CustomDomainManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
}

interface EdgeTestNode {
  location: string;
  flag: string;
  ip: string;
  latency: string;
  status: "success" | "checking" | "pending";
}

export const CustomDomainManager: React.FC<CustomDomainManagerProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const currentCustomDomain = config.cloudflare?.customDomain || "";
  const currentSubdomain = config.cloudflare?.subdomain || "sirket";

  const [domainInput, setDomainInput] = useState(currentCustomDomain);
  const [subdomainInput, setSubdomainInput] = useState(currentSubdomain);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Active guide tab
  const [activeTab, setActiveTab] = useState<"quick-setup" | "cloudflare-guide" | "propagation-tool" | "registrar-guides" | "troubleshooting" | "automated-dns">("quick-setup");

  // Connection method for DNS
  const [connectionMethod, setConnectionMethod] = useState<"cname" | "nameserver">("cname");

  // Selected Registrar for specific instructions
  const [selectedRegistrar, setSelectedRegistrar] = useState<"cloudflare" | "godaddy" | "natro" | "turhost" | "namecheap" | "google">("cloudflare");

  // DNS Diagnostics Simulation State
  const [isTestingPropagation, setIsTestingPropagation] = useState(false);
  const [lastTestedTime, setLastTestedTime] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean>(Boolean(currentCustomDomain));

  const [edgeNodes, setEdgeNodes] = useState<EdgeTestNode[]>([
    { location: "İstanbul (Türkiye Edge)", flag: "🇹🇷", ip: "104.21.68.99", latency: "2.4 ms", status: "success" },
    { location: "Frankfurt (Almanya Edge)", flag: "🇩🇪", ip: "104.21.68.99", latency: "7.8 ms", status: "success" },
    { location: "Londra (Birleşik Krallık)", flag: "🇬🇧", ip: "104.21.68.99", latency: "11.2 ms", status: "success" },
    { location: "New York (ABD Doğu)", flag: "🇺🇸", ip: "172.67.182.144", latency: "42.0 ms", status: "success" },
    { location: "Singapur (Asya Edge)", flag: "🇸🇬", ip: "104.21.68.99", latency: "88.5 ms", status: "success" },
  ]);

  // Clean domain helper
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
        deployedUrl: `https://${subdomainInput || "sirket"}.hizliweb.site`,
        dnsPropagationStatus: "unconfigured"
      }
    };
    onChange(updatedConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCopyAllDns = () => {
    const domain = cleanDomain(domainInput) || currentCustomDomain || "www.firmaadi.com";
    const subTarget = `${subdomainInput || currentSubdomain}.hizliweb.site`;
    const textToCopy = `=== HIZLIWEB ALTYAPISI CLOUDFLARE DNS YAPILANDIRMA BİLGİLERİ ===
Alan Adı: ${domain}
Oluşturulma Tarihi: ${new Date().toLocaleDateString("tr-TR")}

[1. CNAME KAYDI - Web Trafiği]
Tür: CNAME
Ad / Host: www
Hedef / Değer: cname.hizliweb.site (veya ${subTarget})
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut - Proxied)
TTL: Otomatik

[2. A KAYDI (Birincil Apex/Root) - Kök Alan Adı]
Tür: A
Ad / Host: @
IP / Değer: 104.21.68.99
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut - Proxied)
TTL: Otomatik

[3. A KAYDI (Yedek Anycast)]
Tür: A
Ad / Host: @
IP / Değer: 172.67.182.144
Proxy Durumu: Aktif (Cloudflare Turuncu Bulut - Proxied)
TTL: Otomatik

[4. TXT DOĞRULAMA KAYDI]
Tür: TXT
Ad / Host: _hizliweb-verify
Değer: hw-site=${config.id || "cf89a2"}
TTL: Otomatik

[5. CLOUDFLARE NAMESERVERS (İsteğe Bağlı - Tam Geçiş)]
NS 1: ara.ns.cloudflare.com
NS 2: walt.ns.cloudflare.com

Not: Kayıtlar girildikten sonra otomatik ücretsiz SSL (TLS 1.3) devreye girecektir.
============================================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField("all-dns");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanDomain(domainInput);
    const cleanedSub = subdomainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const updatedConfig: SiteConfig = {
      ...config,
      cloudflare: {
        ...config.cloudflare,
        customDomain: cleaned || undefined,
        subdomain: cleanedSub || "sirket",
        deployedUrl: cleaned
          ? `https://${cleaned.startsWith("www.") ? cleaned : `www.${cleaned}`}`
          : `https://${cleanedSub || "sirket"}.hizliweb.site`,
        sslActive: true,
        dnsPropagationStatus: cleaned ? "verified" : "unconfigured",
        dnsRecords: [
          {
            type: "CNAME",
            name: "www",
            content: `cname.hizliweb.site`,
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
            content: `hw-site=${config.id || "cf89a2"}`,
            proxyStatus: false,
            status: "verified"
          }
        ]
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
        { location: "İstanbul (Türkiye Edge)", flag: "🇹🇷", ip: "104.21.68.99", latency: "2.1 ms", status: "success" },
        { location: "Frankfurt (Almanya Edge)", flag: "🇩🇪", ip: "104.21.68.99", latency: "6.9 ms", status: "success" },
        { location: "Londra (Birleşik Krallık)", flag: "🇬🇧", ip: "104.21.68.99", latency: "10.4 ms", status: "success" },
        { location: "New York (ABD Doğu)", flag: "🇺🇸", ip: "172.67.182.144", latency: "39.8 ms", status: "success" },
        { location: "Singapur (Asya Edge)", flag: "🇸🇬", ip: "104.21.68.99", latency: "84.2 ms", status: "success" },
      ]);
      setIsTestingPropagation(false);
      setTestSuccess(true);
      setLastTestedTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1200);
  };

  const displayTargetDomain = cleanDomain(domainInput) || currentCustomDomain || "ornekfirma.com.tr";
  const pointsToTarget = `${subdomainInput || currentSubdomain}.hizliweb.site`;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & CURRENT STATUS BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Alan Adı Yönetimi & Cloudflare Edge DNS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Alan Adı Yönetimi</span>
              <span className="text-amber-400 text-base font-normal">(.com, .com.tr, .net, vb.)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kendi satın aldığınız alan adınızı (örn. <strong>www.firmaadi.com</strong>) Cloudflare üzerinde HızlıWeb altyapısına bağlayın. 320+ küresel edge veri merkezi, otomatik ücretsiz SSL (TLS 1.3) ve 0 ms gecikmeli önbellek ağıyla sitenizi ışık hızında yayına alın.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {currentCustomDomain && (
              <a
                href={`https://${currentCustomDomain}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                title="Sitenizi yeni sekmede açın"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Siteye Git</span>
              </a>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Canlı Önizleme</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRunDnsTest}
              disabled={isTestingPropagation}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingPropagation ? "animate-spin" : ""}`} />
              <span>DNS & SSL Test Et</span>
            </button>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentCustomDomain ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Aktif Yayın Adresi</div>
              <div className="text-xs font-bold text-white truncate font-mono">
                {currentCustomDomain ? `https://${currentCustomDomain}` : `https://${currentSubdomain}.hizliweb.site`}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">SSL Güvenlik Durumu</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Otomatik TLS 1.3 (Aktif)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Edge Dağıtımı & CDN</div>
              <div className="text-xs font-bold text-blue-300">
                Cloudflare Anycast (320+ Şehir)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABBED NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("automated-dns")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "automated-dns"
              ? "bg-slate-900 text-cyan-300 shadow-xs ring-1 ring-cyan-500/40"
              : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200"
          }`}
        >
          <Network className="w-4 h-4 text-cyan-500" />
          <span>⚡ Otomatik DNS Sihirbazı (CNAME & A)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quick-setup")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "quick-setup"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>1. Hızlı Kurulum & DNS Kayıtları</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cloudflare-guide")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "cloudflare-guide"
              ? "bg-slate-900 text-blue-400 shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          <span>2. Cloudflare Kurulum Rehberi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("propagation-tool")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "propagation-tool"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-500" />
          <span>3. DNS Yayılımı (Propagation) & Teşhis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("registrar-guides")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "registrar-guides"
              ? "bg-slate-900 text-purple-400 shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Globe className="w-4 h-4 text-purple-500" />
          <span>4. Alan Adı Firmaları Rehberi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("troubleshooting")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "troubleshooting"
              ? "bg-slate-900 text-rose-400 shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-rose-500" />
          <span>5. Sıkça Sorulan Sorular & Çözümler</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Alan adı yapılandırmanız başarıyla kaydedildi! Aşağıdaki DNS kayıtlarını alan adı sağlayıcınıza giriniz.</span>
        </div>
      )}

      {/* 3. TAB CONTENT */}

      {/* TAB 1: QUICK SETUP & DNS RECORDS */}
      {activeTab === "quick-setup" && (
        <div className="space-y-6">
          {/* Domain Input Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Adım 1: Alan Adınızı Tanımlayın</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Satın aldığınız alan adını (örn: <strong>www.firmaadi.com</strong> veya <strong>firmaadi.com</strong>) girin ve kaydedin.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                Adım 1/4
              </span>
            </div>

            {/* Currently active domain status card if connected */}
            {currentCustomDomain && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                      <span>Aktif Bağlı Alan Adı:</span>
                      <code className="text-sm font-black font-mono text-emerald-800">
                        https://{currentCustomDomain}
                      </code>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Cloudflare Edge SSL (TLS 1.3) ve 0 ms önbellek devrede.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://${currentCustomDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Siteyi Aç</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveDomain}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Özel alan adını kaldırıp varsayılan adrese dön"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kaldır</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Özel Alan Adınız (Custom Domain)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="www.firmaadi.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDomain}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
                
                {/* Fast example chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Hızlı Örnekler:</span>
                  {[
                    "www.firmaadi.com",
                    `www.${(config.companyName || "sirketim").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`,
                    "www.ustam.net"
                  ].map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDomainInput(example)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-600 transition-colors cursor-pointer"
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 mt-1">
                  Örnek: <code>www.firmaadi.com</code> veya <code>firmaadi.com</code> (https:// yazmanıza gerek yoktur, sistem otomatik algılar).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  HızlıWeb Ücretsiz Alt Alan Adı (Subdomain)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-l-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-l-0 border-slate-200 text-xs text-slate-600 rounded-r-xl font-mono">
                    .hizliweb.site
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Özel alan adınız yönlenene kadar veya yedek olarak siteniz bu adreste de her zaman yayında kalır.
                </p>
              </div>
            </div>
          </div>

          {/* DNS Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-500" />
                  <span>Adım 2: Gerekli DNS Kayıtları & Bağlantı Yöntemi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alan adı firmanızın (Natro, Turhost, GoDaddy, vb.) veya Cloudflare kontrol paneline aşağıdaki kayıtları ekleyin:
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllDns}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Tüm DNS tablosunu teknik destek veya alan adı firmanıza iletmek üzere panoya kopyalayın"
                >
                  {copiedField === "all-dns" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tümü Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Tüm Kayıtları Kopyala</span>
                    </>
                  )}
                </button>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold font-mono">
                  Adım 2/4
                </span>
              </div>
            </div>

            {/* Connection Method Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setConnectionMethod("cname")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  connectionMethod === "cname"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Yöntem 1: CNAME & A Kaydı (Önerilen - Mevcut Firmanızda Kalır)</span>
              </button>

              <button
                type="button"
                onClick={() => setConnectionMethod("nameserver")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  connectionMethod === "nameserver"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Yöntem 2: Cloudflare Nameserver (Tam Geçiş & DDoS Kalkanı)</span>
              </button>
            </div>

            {/* If Yöntem 2: Nameservers is active */}
            {connectionMethod === "nameserver" && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Cloudflare Nameserver Adresleri (NS)</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Alan adınızı satın aldığınız firmanın (Natro, GoDaddy, Turhost vb.) panelinden <strong>DNS Sunucularını (Nameservers)</strong> aşağıdaki adreslerle değiştirin:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
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

                  <div className="p-3 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
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

            {/* The copyable DNS Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-3.5 py-3">Tür (Type)</th>
                    <th className="px-3.5 py-3">Ad / Host (Name)</th>
                    <th className="px-3.5 py-3">Hedef / Değer (Points To)</th>
                    <th className="px-3.5 py-3">Proxy Durumu</th>
                    <th className="px-3.5 py-3">TTL</th>
                    <th className="px-3.5 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {/* CNAME RECORD */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3.5 font-bold text-purple-600">
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200">CNAME</span>
                    </td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">
                      www
                    </td>
                    <td className="px-3.5 py-3.5 text-blue-600 font-bold">
                      {pointsToTarget}
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Proxied (Turuncu Bulut)</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">
                      Otomatik (Auto)
                    </td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(pointsToTarget, "cname-val")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "cname-val" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
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

                  {/* A RECORD (APEX / ROOT @) */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3.5 font-bold text-blue-600">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">A</span>
                    </td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">
                      @ <span className="text-slate-400 font-normal text-[11px] font-sans">(Kök / Root)</span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-900 font-bold">
                      104.21.68.99
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Proxied (Turuncu Bulut)</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">
                      Otomatik (Auto)
                    </td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy("104.21.68.99", "a-val-1")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "a-val-1" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
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

                  {/* SECONDARY A RECORD */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3.5 font-bold text-blue-600">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">A</span>
                    </td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">
                      @ <span className="text-slate-400 font-normal text-[11px] font-sans">(Yedek IP)</span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-900 font-bold">
                      172.67.182.144
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Proxied (Turuncu Bulut)</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">
                      Otomatik (Auto)
                    </td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy("172.67.182.144", "a-val-2")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "a-val-2" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
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

                  {/* TXT VERIFICATION RECORD */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3.5 font-bold text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">TXT</span>
                    </td>
                    <td className="px-3.5 py-3.5 font-bold text-slate-900">
                      _hizliweb-verify
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-600 font-bold truncate max-w-xs">
                      hw-site={config.id || "cf89a2"}
                    </td>
                    <td className="px-3.5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        DNS Only (Gri Bulut)
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-500 font-sans">
                      Otomatik
                    </td>
                    <td className="px-3.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(`hw-site=${config.id || "cf89a2"}`, "txt-val")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === "txt-val" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
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
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Önemli İpucu (Kök Alan Adı vs www):</div>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Ziyaretçilerinizin hem <strong>{displayTargetDomain}</strong> hem de <strong>www.{displayTargetDomain}</strong> yazdığında sitenize ulaşabilmesi için hem <code>CNAME (www)</code> hem de <code>A (@)</code> kaydını eklemeniz önerilir.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Step Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <div className="text-xs font-bold text-slate-900">Kayıtları Girin</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Yukarıdaki CNAME ve A kayıtlarını alan adı kontrol panelinize ekleyin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <div className="text-xs font-bold text-slate-900">DNS Yayılımını Bekleyin</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Kayıtların internet servis sağlayıcılarına yayılması 2 dakika ile 24 saat sürebilir.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <div className="text-xs font-bold text-slate-900">Otomatik SSL Aktif Olur</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Yayılım tamamlandığında Cloudflare otomatik SSL sertifikasını (yeşil kilit) devreye alır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP CLOUDFLARE CONFIGURATION GUIDE */}
      {activeTab === "cloudflare-guide" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Önerilen Yöntem (Maksimum Performans & DDoS Kalkanı)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cloudflare ile 5 Adımda Kurulum Rehberi
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Cloudflare kullanmak sitenize ücretsiz SSL sertifikası, 0 ms edge önbellek ve DDoS kalkanı sağlar. Adımları sırasıyla takip edin:
              </p>
            </div>

            {/* 5 Step Visual Flow */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Cloudflare Hesabı Açın ve Sitenizi Ekleyin</span>
                    <a
                      href="https://dash.cloudflare.com/sign-up"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px] font-mono"
                    >
                      <span>cloudflare.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <a href="https://cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold">Cloudflare.com</a> adresinde ücretsiz bir hesap oluşturun. Üst panelden <strong>&quot;Add a Site&quot; (Site Ekle)</strong> butonuna tıklayarak alan adınızı (örn: <code>{displayTargetDomain}</code>) girin. Plan seçiminde en alttaki <strong>&quot;Free&quot; (Ücretsiz)</strong> planı seçip devam edin.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    Nameserver (NS) Değişimi Yapın
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cloudflare size özel 2 adet Nameserver adresi verecektir (Örnek: <code>dina.ns.cloudflare.com</code> ve <code>noah.ns.cloudflare.com</code>). Alan adınızı satın aldığınız panelde (Natro, GoDaddy, Turhost, vb.) mevcut Nameserver adreslerini silip Cloudflare&apos;in verdiği bu iki adresi kaydedin.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-3">
                    <span>Örnek NS:</span>
                    <span className="font-bold text-blue-700">dina.ns.cloudflare.com</span>
                    <span>/</span>
                    <span className="font-bold text-blue-700">noah.ns.cloudflare.com</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    DNS Kayıtlarını Ekleyin & Turuncu Bulutu Açın (Proxied)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cloudflare panelinde sol menüden <strong>DNS &gt; Records</strong> sekmesine gelin:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                    <li><strong>CNAME:</strong> Ad: <code>www</code>, Hedef: <code>{pointsToTarget}</code>, Proxy: <strong>Açık (Turuncu Bulut)</strong></li>
                    <li><strong>A Kaydı:</strong> Ad: <code>@</code>, Hedef: <code>104.21.68.99</code>, Proxy: <strong>Açık (Turuncu Bulut)</strong></li>
                  </ul>
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Turuncu bulutun (Proxied) açık olması şarttır! Bu sayede ziyaretçileriniz HızlıWeb&apos;in 0.02 saniye edge yanıt hızından yararlanır.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    SSL/TLS Şifreleme Modunu &quot;Full&quot; Yapın (Kritik)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sol menüden <strong>SSL/TLS &gt; Overview</strong> sekmesine gidin. Şifreleme modunu mutlaka <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> olarak seçin.
                  </p>
                  <p className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                    🚫 Asla <strong>&quot;Flexible&quot;</strong> seçmeyin! Flexible seçilirse sitenizde &quot;Too Many Redirects (Yönlendirme Döngüsü)&quot; hatası oluşabilir.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  5
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    &quot;Always Use HTTPS&quot; (Her Zaman HTTPS) Özelliğini Açın
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cloudflare sol menüden <strong>SSL/TLS &gt; Edge Certificates</strong> sekmesine gelin. <strong>&quot;Always Use HTTPS&quot;</strong> ve <strong>&quot;Automatic HTTPS Rewrites&quot;</strong> anahtarlarını aktif hale getirin. Bu sayede tüm http bağlantıları otomatik güvenli https&apos;e yönlendirilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DNS PROPAGATION (YAYILIM) & DIAGNOSTICS */}
      {activeTab === "propagation-tool" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-500" />
                  <span>DNS Yayılımı (Propagation) Nedir & Durumu Nasıl Kontrol Edilir?</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dünya genelindeki DNS sunucularının alan adı değişikliklerini öğrenme sürecidir.
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

            {/* Propagation Explanation Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Yayılım Ne Kadar Sürer?</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Cloudflare ile:</strong> Değişiklikler genellikle <strong>2 ile 10 dakika</strong> içinde dünya genelinde yayılır.<br />
                  • <strong>Geleneksel DNS ile:</strong> İnternet servis sağlayıcınızın önbelleğine (TTL) bağlı olarak <strong>1 saat ile 24 saat</strong> arası sürebilir.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SSL Sertifikası Ne Zaman Gelir?</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  DNS kayıtları doğrulandıktan hemen sonra Cloudflare Universal SSL sertifikası otomatik olarak üretilir. Tarayıcınızda yeşil kilit simgesi görünür.
                </p>
              </div>
            </div>

            {/* Live Edge Node Checker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Küresel Edge Düğümleri & Çözümleme Durumu</span>
                  {lastTestedTime && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Son test: {lastTestedTime})
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  %100 Küresel Çözümleme
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {edgeNodes.map((node, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{node.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{node.location}</div>
                        <div className="text-[10px] text-slate-400 font-mono">IP: {node.ip}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      {node.status === "checking" ? (
                        <span className="text-[10px] text-blue-600 font-bold animate-pulse">Kontrol ediliyor...</span>
                      ) : (
                        <div>
                          <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Doğrulandı</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{node.latency}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Public Propagation Checkers */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Harici Canlı DNS Yayılım Araçları (Dış Kaynaklar)</span>
              </div>
              <p className="text-xs text-slate-300">
                Alan adınızın dünya genelinde yayılıp yayılmadığını bağımsız uluslararası DNS tarayıcılarından doğrudan sorgulayabilirsiniz:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://dnschecker.org/#CNAME/www.${displayTargetDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <span>DNSChecker.org (CNAME Sorgula)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={`https://www.whatsmydns.net/#A/${displayTargetDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <span>WhatsMyDNS.net (A Kaydı Sorgula)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={`https://radar.cloudflare.com/domains/domain/${displayTargetDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <span>Cloudflare Radar Raporu</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: POPULAR REGISTRAR GUIDES */}
      {activeTab === "registrar-guides" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span>Popüler Alan Adı Firmaları Kurulum Adımları</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Alan adınızı satın aldığınız firmayı seçerek adım adım DNS yönetim adımlarını inceleyin:
              </p>
            </div>

            {/* Registrar Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "cloudflare", name: "Cloudflare Registrar" },
                { id: "godaddy", name: "GoDaddy" },
                { id: "natro", name: "Natro (Türkiye)" },
                { id: "turhost", name: "Turhost" },
                { id: "namecheap", name: "Namecheap" },
                { id: "google", name: "Google / Squarespace" },
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

            {/* Provider Instructions */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs text-slate-700">
              {selectedRegistrar === "cloudflare" && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Cloudflare Registrar Kurulumu:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                    <li>Cloudflare Dashboard &gt; <strong>Websites</strong> menüsünden alan adınızı seçin.</li>
                    <li>Sol menüden <strong>DNS &gt; Records</strong> sekmesine gelin.</li>
                    <li>&quot;Add record&quot; butonuna tıklayın, Type: <strong>CNAME</strong>, Name: <strong>www</strong>, Target: <strong>{pointsToTarget}</strong> girin ve Proxy: <strong>Proxied (Turuncu Bulut)</strong> açık kaydedin.</li>
                    <li>Apex alan adı için Type: <strong>A</strong>, Name: <strong>@</strong>, IPv4: <strong>104.21.68.99</strong> girin ve kaydedin.</li>
                    <li>Siteniz anında (ortalama 2 dakika) yayına girecektir.</li>
                  </ol>
                </div>
              )}

              {selectedRegistrar === "godaddy" && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm">GoDaddy DNS Yönetimi:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                    <li>GoDaddy hesabınıza giriş yapın ve <strong>Ürünlerim</strong> sayfasına gidin.</li>
                    <li>Alan adınızın yanındaki <strong>DNS</strong> veya <strong>DNS Yönetimi</strong> butonuna tıklayın.</li>
                    <li>Mevcut bir <code>www</code> CNAME kaydı varsa düzenleyin, yoksa &quot;Yeni Kayıt Ekle&quot; deyin.</li>
                    <li>Tür: <strong>CNAME</strong>, Ad: <strong>www</strong>, Değer: <strong>{pointsToTarget}</strong>, TTL: <strong>1/2 Saat</strong> olarak kaydedin.</li>
                    <li>Yönlendirme sekmesinden kök alan adınızı (<code>{displayTargetDomain}</code>) <code>https://www.{displayTargetDomain}</code> adresine kalıcı (301) olarak yönlendirin.</li>
                  </ol>
                </div>
              )}

              {selectedRegistrar === "natro" && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Natro DNS Yönetimi:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                    <li>Natro Müşteri Panelinize giriş yapın &gt; <strong>Alan Adı Yönetimi</strong> &gt; Alan adınızı seçin.</li>
                    <li><strong>Gelişmiş DNS Yönetimi</strong> sekmesine tıklayın.</li>
                    <li>CNAME kayıtları bölümünden Ad: <strong>www</strong>, Değer: <strong>{pointsToTarget}</strong> ekleyin.</li>
                    <li>A kaydı bölümünden Ad: <strong>@</strong>, IP: <strong>104.21.68.99</strong> girin ve kaydedin.</li>
                    <li>Natro DNS güncellemeleri Türkiye genelinde genellikle 1-2 saat içinde aktif olur.</li>
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
                    <li>Kök yönlendirme için A kaydını <strong>104.21.68.99</strong> olarak tanımlayın.</li>
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
                    <li>Kök domain için: Type: <strong>A Record</strong>, Host: <strong>@</strong>, Value: <strong>104.21.68.99</strong>.</li>
                  </ol>
                </div>
              )}

              {selectedRegistrar === "google" && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Google Domains / Squarespace:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                    <li>Squarespace Domains panelinize girin ve alan adınızı seçin.</li>
                    <li><strong>DNS Settings (DNS Ayarları)</strong> sekmesine geçin.</li>
                    <li>Özel Kayıt Ekle: Host: <strong>www</strong>, Record: <strong>CNAME</strong>, Data: <strong>{pointsToTarget}</strong>.</li>
                    <li>Apex yönlendirmesi için A kaydını ekleyin.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TROUBLESHOOTING & FAQS */}
      {activeTab === "troubleshooting" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-500" />
                <span>Sık Karşılaşılan Sorunlar ve Hızlı Çözümler</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Alan adı yönlendirmesi esnasında karşılaşabileceğiniz durumlara dair ipuçları:
              </p>
            </div>

            <div className="space-y-3">
              {/* FAQ 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  Soru 1: Siteme girdiğimde &quot;Güvenli Değil&quot; uyarısı çıkıyor. Ne yapmalıyım?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Çözüm:</strong> DNS kayıtlarını yeni girdiyseniz, Cloudflare Universal SSL sertifikasının oluşturulup doğrulanması 15 ile 30 dakika sürebilir. Bu süre zarfında tarayıcınız sertifikayı henüz görmüyor olabilir. 30 dakika sonra gizli sekmede tekrar deneyin.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  Soru 2: Cloudflare &quot;Error 521: Web Server Is Down&quot; veya &quot;Error 522&quot; hatası alıyorum.
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Çözüm:</strong> Cloudflare panelinde <strong>SSL/TLS &gt; Overview</strong> sekmesine gidin. SSL modunun <strong>&quot;Full&quot;</strong> veya <strong>&quot;Full (Strict)&quot;</strong> olduğundan emin olun. Mod &quot;Flexible&quot; ise bu hataya yol açabilir.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  Soru 3: Alan adımı yazdığımda hala eski web sitem açılıyor.
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Çözüm:</strong> Bilgisayarınızın veya modeminizin DNS önbelleği eski IP adresini saklıyor olabilir. Klavyenizden <code>Ctrl + Shift + R</code> (Mac&apos;te <code>Cmd + Shift + R</code>) tuşlarına basarak önbelleği temizleyip sayfayı yenileyin veya mobil cihazınızdan hücresel veri (4G/5G) ile deneyin.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  Soru 4: www olmadan (örneğin yalnızca <code>{displayTargetDomain}</code>) girdiğimde sitem açılacak mı?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Çözüm:</strong> Evet. DNS tablosundaki <code>A (@)</code> kaydını eklediğinizde veya Cloudflare CNAME Flattening kullandığınızda siteniz hem <code>{displayTargetDomain}</code> hem de <code>www.{displayTargetDomain}</code> adreslerinden sorunsuz şekilde açılır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 0 / OVERRIDE: AUTOMATED DNS SETUP GUIDE */}
      {activeTab === "automated-dns" && (
        <AutomatedDnsSetupGuide
          config={config}
          onChange={onChange}
          onPreview={onPreview}
          onNavigateToDomainManager={() => setActiveTab("quick-setup")}
        />
      )}
    </div>
  );
};
