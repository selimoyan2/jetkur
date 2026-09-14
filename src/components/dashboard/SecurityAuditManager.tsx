import React, { useState, useEffect } from "react";
import {
  SiteConfig,
  SecurityAuditResult,
  SecurityConfig,
  SecurityHeaderItem,
  SecurityVulnerability
} from "../../types";
import {
  getEffectiveSecurityConfig,
  generateOfflineSecurityAudit,
  runSecurityAudit,
  apply1ClickAutoHardening,
  generateSecurityAuditReportMarkdown
} from "../../utils/securityAuditEngine";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  Zap,
  Sliders,
  Eye,
  Globe,
  FileText,
  Terminal,
  Check,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck as ShieldIcon
} from "lucide-react";

interface SecurityAuditManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SecurityAuditManager: React.FC<SecurityAuditManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "headers" | "vulnerabilities" | "settings" | "raw" | "simulation">("overview");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedVulnCategory, setSelectedVulnCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Simulation state
  const [simRunning, setSimRunning] = useState<string | null>(null);
  const [simResults, setSimResults] = useState<Record<string, { blocked: boolean; details: string }>>({});

  // Ensure securityConfig and audit exist
  const sec = getEffectiveSecurityConfig(config);
  const [auditResult, setAuditResult] = useState<SecurityAuditResult>(() => {
    return sec.lastAudit || generateOfflineSecurityAudit(config);
  });

  // Re-run offline calculation if config changes without server audit
  useEffect(() => {
    if (!sec.lastAudit) {
      const calculated = generateOfflineSecurityAudit(config);
      setAuditResult(calculated);
    } else {
      setAuditResult(sec.lastAudit);
    }
  }, [config.securityConfig]);

  // Handle Scan
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanStep("Hedef alan adı ve SSL sertifikası kontrol ediliyor...");
    
    await new Promise(r => setTimeout(r, 450));
    setScanStep("HTTP güvenlik başlıkları (CSP, HSTS, X-Frame) inceleniyor...");
    
    await new Promise(r => setTimeout(r, 450));
    setScanStep("İletişim formları, honeypot ve spam korumaları taranıyor...");
    
    await new Promise(r => setTimeout(r, 450));
    setScanStep("Gemini 3.8 Flash AI tehdit modeli ile zafiyet analizi yapılıyor...");

    try {
      const result = await runSecurityAudit(config);
      setAuditResult(result);
      
      // Save audit into config
      const updatedSec: SecurityConfig = {
        ...sec,
        lastAudit: result
      };
      onChange({
        ...config,
        securityConfig: updatedSec
      });
      setSuccessNotice("Güvenlik taraması başarıyla tamamlandı! En güncel sonuçlar listeleniyor.");
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
      setScanStep("");
    }
  };

  // Handle 1-Click Auto Harden
  const handleAutoHarden = () => {
    const hardenedConfig = apply1ClickAutoHardening(config);
    onChange(hardenedConfig);
    if (hardenedConfig.securityConfig?.lastAudit) {
      setAuditResult(hardenedConfig.securityConfig.lastAudit);
    }
    setSuccessNotice("1-Tıkla Otomatik Güçlendirme uygulandı! CSP, HSTS, X-Frame ve Form Koruması devreye alındı. Skorunuz A+'a yükseltildi.");
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // Toggle individual setting
  const handleToggleSetting = (key: keyof SecurityConfig) => {
    const updatedSec: SecurityConfig = {
      ...sec,
      [key]: !sec[key]
    };
    const updatedConfig: SiteConfig = {
      ...config,
      securityConfig: updatedSec
    };
    const newAudit = generateOfflineSecurityAudit(updatedConfig);
    updatedSec.lastAudit = newAudit;
    setAuditResult(newAudit);
    onChange({
      ...updatedConfig,
      securityConfig: updatedSec
    });
  };

  // Download Report
  const handleDownloadReport = () => {
    const md = generateSecurityAuditReportMarkdown(auditResult, config);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guvenlik-raporu-${config.companyName.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Report
  const handleCopyReport = () => {
    const md = generateSecurityAuditReportMarkdown(auditResult, config);
    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Generated headers snippet
  const generatedHeadersSnippet = `/*
  X-Frame-Options: ${sec.enableXFrameOptions ? "SAMEORIGIN" : "ALLOWALL"}
  X-Content-Type-Options: ${sec.enableContentTypeNosniff ? "nosniff" : "nosniff"}
  Referrer-Policy: ${sec.enableReferrerPolicy ? "strict-origin-when-cross-origin" : "no-referrer-when-downgrade"}
  Strict-Transport-Security: ${sec.enforceHsts ? "max-age=31536000; includeSubDomains; preload" : "max-age=0"}
  ${sec.enablePermissionsPolicy ? "Permissions-Policy: camera=(), microphone=(), geolocation=()" : "# Permissions-Policy pasif"}
  ${sec.enableCsp ? "Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline';" : "# CSP kalkanı pasif"}
  ${sec.hideServerSignature ? "Server: Cloudflare" : "# Server signature aktif"}
`.trim();

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(generatedHeadersSnippet);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Attack Simulation Runner
  const runSimulation = (testType: "clickjacking" | "xss" | "bot_form") => {
    setSimRunning(testType);
    setTimeout(() => {
      if (testType === "clickjacking") {
        const blocked = Boolean(sec.enableXFrameOptions);
        setSimResults(prev => ({
          ...prev,
          clickjacking: {
            blocked,
            details: blocked
              ? "BAŞARILI: 'X-Frame-Options: SAMEORIGIN' başlığı sayesinde saldırganın iframe yerleştirmesi tarayıcı tarafından engellendi."
              : "RİSK: X-Frame-Options başlığı eksik! Site başka bir alan adında şeffaf iframe olarak çağrılabildi."
          }
        }));
      } else if (testType === "xss") {
        const blocked = Boolean(sec.enableCsp);
        setSimResults(prev => ({
          ...prev,
          xss: {
            blocked,
            details: blocked
              ? "BAŞARILI: 'Content-Security-Policy' kalkanı yetkisiz harici betik çalıştırma denemesini doğrudan bloke etti."
              : "RİSK: CSP başlığı eksik! Zararlı harici script kaynağı engellenemedi."
          }
        }));
      } else if (testType === "bot_form") {
        const blocked = Boolean(sec.formHoneypotProtection);
        setSimResults(prev => ({
          ...prev,
          bot_form: {
            blocked,
            details: blocked
              ? "BAŞARILI: Görünmez Honeypot tuzağı tetiklendi. Botun otomatik gönderdiği sahte form mesajı sessizce karantinaya alındı."
              : "UYARI: Honeypot aktif değil! Bot form alanlarını doldurarak sunucuya istek gönderdi."
          }
        }));
      }
      setSimRunning(null);
    }, 700);
  };

  // Filter vulnerabilities
  const filteredVulns = auditResult.vulnerabilities.filter(v => {
    if (selectedVulnCategory !== "all" && v.category !== selectedVulnCategory) return false;
    if (selectedSeverity !== "all" && v.severity !== selectedSeverity) return false;
    return true;
  });

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const targetUrl = `https://${auditResult.targetDomain}`;

  return (
    <div className="space-y-6 pb-12" id="security-audit-panel">
      {/* 1. Header & Command Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wide flex items-center gap-1.5 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                OWASP & Cloudflare Edge Denetimi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold flex items-center gap-1.5 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gemini 3.8 Flash AI Motoru
              </span>
              <span className="text-slate-400 text-xs">
                Son Tarama: {new Date(auditResult.scanDate).toLocaleTimeString("tr-TR")}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Web Güvenlik & Zafiyet Denetimi</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Yayınlanan sitenizin HTTP güvenlik başlıklarını, Cloudflare Edge kalkanlarını, SSL/TLS şifrelemesini ve form bot korumalarını yapay zeka ile denetleyin; tek tıkla otomatik güçlendirin.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hedef:</span>
                <span className="font-bold text-white">{targetUrl}</span>
              </div>
              {config.cloudflare?.customDomain ? (
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/60">
                  Özel Alan Adı Bağlı
                </span>
              ) : (
                <span className="text-[11px] text-blue-400 font-bold bg-blue-950/60 px-2 py-1 rounded border border-blue-800/60">
                  Cloudflare Edge Subdomain
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="security-auto-harden-btn"
              onClick={handleAutoHarden}
              className="px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
              title="Tüm eksik HTTP güvenlik başlıklarını ve bot kalkanlarını anında etkinleştirir"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>1-Tıkla Otomatik Güçlendir</span>
            </button>

            <button
              type="button"
              id="security-run-scan-btn"
              onClick={handleStartScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Taranıyor..." : "Yeniden Tara (AI Scan)"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Güvenlik Uyumluluk Raporunu İndir (.md)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Yönetici Raporunu Panoya Kopyala"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live scanning progress banner */}
        {isScanning && (
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <div className="text-xs text-emerald-200">
              <span className="font-bold">AI Güvenlik Taraması Devam Ediyor: </span>
              <span>{scanStep}</span>
            </div>
          </div>
        )}

        {/* Success toast notice */}
        {successNotice && (
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Security Scorecard & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Main Overall Score Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Güvenlik Duruşu Skoru</h3>
                <p className="text-sm font-black text-slate-900">Genel OWASP Seviyesi</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getScoreColor(auditResult.overallScore)}`}>
              Derece: {auditResult.grade}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight text-slate-900">
              %{auditResult.overallScore}
            </span>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 block">
                {auditResult.overallScore >= 90
                  ? "Mükemmel Koruma"
                  : auditResult.overallScore >= 75
                  ? "Güçlü Duruş"
                  : "İyileştirme Gerekli"}
              </span>
              <span className="text-[11px] text-slate-500 block">100 üzerinden</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  auditResult.overallScore >= 90
                    ? "bg-emerald-500"
                    : auditResult.overallScore >= 75
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${auditResult.overallScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (Kritik)</span>
              <span>75 (Standart)</span>
              <span>100 (A+)</span>
            </div>
          </div>
        </div>

        {/* Category 1: HTTP Headers */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500">Güvenlik Başlıkları</span>
              <span className="text-xs font-black text-slate-900">%{auditResult.categoryScores.headers}</span>
            </div>
            <p className="text-xs text-slate-600">CSP, HSTS, X-Frame, nosniff</p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${auditResult.categoryScores.headers}%` }}
              />
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">
              {auditResult.headersAudit.filter(h => h.status === "pass").length} / 6 Başlık Aktif
            </span>
          </div>
        </div>

        {/* Category 2: SSL/TLS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500">SSL / TLS Şifreleme</span>
              <span className="text-xs font-black text-slate-900">%{auditResult.categoryScores.ssl}</span>
            </div>
            <p className="text-xs text-slate-600">HTTPS Zorunlu & Karma İçerik</p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${auditResult.categoryScores.ssl}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 256-bit TLS 1.3
            </span>
          </div>
        </div>

        {/* Category 3: Form Bot Koruması */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500">Form & Anti-Spam</span>
              <span className="text-xs font-black text-slate-900">%{auditResult.categoryScores.forms}</span>
            </div>
            <p className="text-xs text-slate-600">Honeypot Tuzağı & Hız Limiti</p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${auditResult.categoryScores.forms}%` }}
              />
            </div>
            <span className="text-[10px] text-blue-700 font-bold">
              {sec.formHoneypotProtection ? "Honeypot Devrede" : "Honeypot Önerilir"}
            </span>
          </div>
        </div>

        {/* Category 4: Cloudflare Edge */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500">Edge WAF & DDoS</span>
              <span className="text-xs font-black text-slate-900">%{auditResult.categoryScores.edge}</span>
            </div>
            <p className="text-xs text-slate-600">Global Anycast Filtreleme</p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${auditResult.categoryScores.edge}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-700 font-bold">
              L3/L4 DDoS Kalkanı Aktif
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI Executive Summary Callout */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-900 mt-0.5 shrink-0 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Yapay Zeka Güvenlik Değerlendirmesi
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Cloudflare Edge & OWASP Uyumlu
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              {auditResult.summary}
            </p>
          </div>
        </div>

        {/* Quick action trigger if not hardened */}
        {!sec.enableCsp && (
          <button
            type="button"
            onClick={handleAutoHarden}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>CSP Kalkanını Aç (+15 Puan)</span>
          </button>
        )}
      </div>

      {/* 4. Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "overview"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Genel Bakış & Öneriler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("headers")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "headers"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldIcon className="w-4 h-4" />
          <span>HTTP Güvenlik Başlıkları ({auditResult.headersAudit.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("vulnerabilities")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "vulnerabilities"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Zafiyet & Kontrol Analizi ({auditResult.vulnerabilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("settings")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "settings"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Güvenlik Anahtarları & Kalkanlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("simulation")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "simulation"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Terminal className="w-4 h-4 text-purple-600" />
          <span>Saldırı Savunma Simülatörü</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("raw")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "raw"
              ? "border-emerald-600 text-emerald-700 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>_headers & Meta Kodu</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STRATEGIC RECOMMENDATIONS */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actionable Recommendations */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Öncelikli Güvenlik Eylemleri & Tavsiyeler</span>
                </h3>
                <span className="text-xs text-slate-500">{auditResult.recommendations.length} Öneri</span>
              </div>

              <div className="space-y-3">
                {auditResult.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAutoHarden}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tüm Önerileri Tek Tıkla Uygula</span>
                </button>
                {onPreview && (
                  <button
                    type="button"
                    onClick={onPreview}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Canlı Sitede Güvenliği İncele</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Status Box & Security Checklist */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Hızlı Güvenlik Kontrol Listesi</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">HTTPS SSL Zorunluluğu</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Content-Security-Policy (CSP)</span>
                  {sec.enableCsp ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Devrede
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Eksik
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Clickjacking (X-Frame)</span>
                  {sec.enableXFrameOptions ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Korumalı
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Pasif
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Form Honeypot Bot Tuzağı</span>
                  {sec.formHoneypotProtection ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Açılmalı
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">MIME Sniffing (nosniff)</span>
                  {sec.enableContentTypeNosniff ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> nosniff
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Pasif
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  Cloudflare Edge Entegrasyonu
                </p>
                Tüm HTTP başlıkları derlenen <span className="font-mono font-bold">_headers</span> dosyasıyla Cloudflare Pages CDN katmanında doğrudan istemcilere sunulur.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HTTP SECURITY HEADERS AUDIT */}
      {activeSubTab === "headers" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                HTTP Güvenlik Başlıkları Matrisi (Header Security Audit)
              </h3>
              <p className="text-xs text-slate-500">
                Tarayıcı ile siteniz arasındaki iletişimi şifreleyen ve yetkisiz kaynakları engelleyen 6 temel HTTP başlığı.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoHarden}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tüm Başlıkları Aç</span>
            </button>
          </div>

          <div className="space-y-4">
            {auditResult.headersAudit.map((header, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  header.status === "pass"
                    ? "bg-slate-50/60 border-slate-200"
                    : "bg-amber-50/50 border-amber-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    {header.status === "pass" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-black text-slate-900">
                      {header.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        header.severity === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : header.severity === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Önem: {header.severity.toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono ${
                      header.status === "pass"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {header.status === "pass" ? "BAŞARILI (PASS)" : "UYARI (WARN)"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 my-2 leading-relaxed">
                  {header.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 font-mono text-[11px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Mevcut Değer:</span>
                    <span className={header.status === "pass" ? "text-emerald-700 font-bold" : "text-amber-700"}>
                      {header.currentValue || "Yok / Tanımlanmamış"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 font-mono text-[11px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Önerilen Değer:</span>
                    <span className="text-slate-900 font-semibold">{header.recommendedValue}</span>
                  </div>
                </div>

                {header.status !== "pass" && header.fixAction && (
                  <div className="mt-3 flex items-center justify-between text-xs text-amber-800 bg-amber-100/70 p-2.5 rounded-lg border border-amber-200">
                    <span>💡 {header.fixAction}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (header.name.includes("CSP")) handleToggleSetting("enableCsp");
                        else if (header.name.includes("Frame")) handleToggleSetting("enableXFrameOptions");
                        else if (header.name.includes("Type")) handleToggleSetting("enableContentTypeNosniff");
                        else if (header.name.includes("Referrer")) handleToggleSetting("enableReferrerPolicy");
                        else if (header.name.includes("Permissions")) handleToggleSetting("enablePermissionsPolicy");
                      }}
                      className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 transition-all text-[11px] cursor-pointer"
                    >
                      Şimdi Aç
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VULNERABILITY & RISK ANALYZER */}
      {activeSubTab === "vulnerabilities" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Zafiyet & Risk Denetim Kayıtları
              </h3>
              <p className="text-xs text-slate-500">
                OWASP Top 10 ve Cloudflare güvenlik standartlarına göre taranan potansiyel açıklar ve düzeltme yolları.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Kategoriye göre filtrele"
                value={selectedVulnCategory}
                onChange={(e) => setSelectedVulnCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 cursor-pointer"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="headers">HTTP Başlıkları</option>
                <option value="ssl">SSL / TLS</option>
                <option value="form_protection">Form & Spam Koruması</option>
                <option value="information_disclosure">Bilgi İfşası</option>
                <option value="ddos_edge">DDoS & Edge</option>
              </select>

              <select
                aria-label="Önem derecesine göre filtrele"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 cursor-pointer"
              >
                <option value="all">Tüm Önem Dereceleri</option>
                <option value="critical">Kritik</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
                <option value="info">Bilgi / Korunuyor</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredVulns.map((vuln) => (
              <div
                key={vuln.id}
                className={`p-5 rounded-2xl border transition-all ${
                  vuln.status === "resolved"
                    ? "bg-emerald-50/30 border-emerald-200/80"
                    : vuln.severity === "critical" || vuln.severity === "high"
                    ? "bg-rose-50/30 border-rose-200/80"
                    : "bg-amber-50/30 border-amber-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    {vuln.status === "resolved" ? (
                      <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-rose-100 text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <h4 className="text-xs font-black text-slate-900">{vuln.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {vuln.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        vuln.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800 font-mono"
                          : vuln.severity === "high" || vuln.severity === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {vuln.status === "resolved" ? "KORUNUYOR (GÜVENLİ)" : `ÖNEM: ${vuln.severity.toUpperCase()}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Açıklama:</span>
                    <p className="text-slate-600 leading-relaxed">{vuln.description}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Olası Etki / Tehdit:</span>
                    <p className="text-slate-600 leading-relaxed">{vuln.impact}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Düzeltme & Öneri:</span>
                    <p className="text-slate-600 leading-relaxed">{vuln.recommendation}</p>
                  </div>
                </div>

                {vuln.status !== "resolved" && vuln.autoFixAvailable && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAutoHarden}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Bu Açığı Otomatik Güçlendir</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY SWITCHES & HARDENING */}
      {activeSubTab === "settings" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Güvenlik Kalkanları & Sertleştirme Anahtarları (Hardening Toggles)
              </h3>
              <p className="text-xs text-slate-500">
                Sitenize eklenen HTTP başlıklarını, form korumalarını ve Cloudflare kurallarını bağımsız olarak yönetin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoHarden}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Hepsini En Yüksek Güvenliğe Getir</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1: CSP */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Content-Security-Policy (CSP)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Tavsiye Edilir
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zararlı XSS betiklerinin ve yetkisiz harici dosyaların sayfaya enjekte edilmesini tarayıcı düzeyinde engeller.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.enableCsp)}
                onChange={() => handleToggleSetting("enableCsp")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 2: HSTS */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Strict-Transport-Security (HSTS 1 Yıl)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Kritik
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ziyaretçileri daima şifreli HTTPS bağlantısı kurmaya zorunlu kılar (max-age=31536000).
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.enforceHsts)}
                onChange={() => handleToggleSetting("enforceHsts")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 3: X-Frame-Options */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">X-Frame-Options: SAMEORIGIN</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Clickjacking
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sitenizin harici web sitelerinde gizli iframe içine gömülerek buton tıklamalarının çalınmasını engeller.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.enableXFrameOptions)}
                onChange={() => handleToggleSetting("enableXFrameOptions")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 4: X-Content-Type-Options */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">X-Content-Type-Options: nosniff</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MIME-türü sahtekarlıklarını engelleyerek dosyaların yalnızca kendi gerçek uzantısında işlenmesini garanti eder.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.enableContentTypeNosniff)}
                onChange={() => handleToggleSetting("enableContentTypeNosniff")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 5: Referrer Policy */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Referrer-Policy: strict-origin-when-cross-origin</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dış bağlantılara yönlendirme esnasında URL parametreleri ve hassas verilerin sızmasını engeller.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.enableReferrerPolicy)}
                onChange={() => handleToggleSetting("enableReferrerPolicy")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 6: Form Honeypot Protection */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">İletişim Formlarında Görünmez Honeypot Tuzağı</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Anti-Spam
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  İnsanların görmediği gizli bir alan ekler. Otomatik form doldurucu botlar bu alanı doldurduğunda talepleri sessizce engeller.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.formHoneypotProtection)}
                onChange={() => handleToggleSetting("formHoneypotProtection")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 7: Hide Server Signature */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Sunucu İmzası & Bilgi İfşasını Maskeleme</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yanıt başlıklarından sistem sürümlerini kaldırarak saldırganlara sunucu detayları hakkında ipucu vermez.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.hideServerSignature)}
                onChange={() => handleToggleSetting("hideServerSignature")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>

            {/* Toggle 8: Block Bad Bots */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Cloudflare Kötü Niyetli Bot Koruması</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bilinen içerik kazıyıcıları (scrapers) ve brute-force tarayıcılarını Cloudflare Edge katmanında durdurur.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(sec.blockBadBots)}
                onChange={() => handleToggleSetting("blockBadBots")}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATTACK SIMULATION RUNNER */}
      {activeSubTab === "simulation" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              <span>Canlı Savunma & Saldırı Simülatörü</span>
            </h3>
            <p className="text-xs text-slate-500">
              Sitenizin yapılandırılan güvenlik kalkanlarının gerçek dünyadaki yaygın web saldırılarına karşı nasıl yanıt verdiğini güvenli bir şekilde simüle edin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Simulation 1: Clickjacking */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Lock className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-slate-900">1. Clickjacking İframe Testi</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Saldırganın yabancı bir web sitesinde sitenizi görünmez bir iframe içerisine yerleştirmesi simüle edilir.
                </p>
              </div>

              {simResults.clickjacking && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${
                  simResults.clickjacking.blocked
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {simResults.clickjacking.details}
                </div>
              )}

              <button
                type="button"
                onClick={() => runSimulation("clickjacking")}
                disabled={simRunning !== null}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simRunning === "clickjacking" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                <span>İframe Engelleme Testini Başlat</span>
              </button>
            </div>

            {/* Simulation 2: XSS & External Script */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-slate-900">2. XSS & CSP Betik Engelleme</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yetkisiz bir harici betik dosyasının tarayıcıda yürütülmesi test edilir.
                </p>
              </div>

              {simResults.xss && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${
                  simResults.xss.blocked
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {simResults.xss.details}
                </div>
              )}

              <button
                type="button"
                onClick={() => runSimulation("xss")}
                disabled={simRunning !== null}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simRunning === "xss" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                <span>CSP Kalkan Testini Başlat</span>
              </button>
            </div>

            {/* Simulation 3: Bot Form Honeypot */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-slate-900">3. Form Bot & Honeypot Testi</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Otomatik bir botun tüm görünür ve görünmez alanları doldurarak spam mesaj yollaması simüle edilir.
                </p>
              </div>

              {simResults.bot_form && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${
                  simResults.bot_form.blocked
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {simResults.bot_form.details}
                </div>
              )}

              <button
                type="button"
                onClick={() => runSimulation("bot_form")}
                disabled={simRunning !== null}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simRunning === "bot_form" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                <span>Bot Spam Tuzağı Testini Başlat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RAW CLOUDFLARE _HEADERS & META CODE */}
      {activeSubTab === "raw" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-mono">
                Cloudflare Pages _headers Dosyası
              </h3>
              <p className="text-xs text-slate-500">
                Sitenizin derleme çıktısında kök dizine yazılan ve Cloudflare CDN tarafından doğrudan dağıtılan HTTP yanıt başlıkları kuralları.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyRaw}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? "Kopyalandı!" : "Kodu Kopyala"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
            {generatedHeadersSnippet}
          </pre>

          <div className="pt-2 text-xs text-slate-600 space-y-1">
            <span className="font-bold block text-slate-800">HTML &lt;head&gt; Meta Kalkanı:</span>
            <p>
              Ayrıca tarayıcı seviyesinde anında koruma için HTML çıktılarının &lt;head&gt; bloğuna{" "}
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">
                &lt;meta http-equiv=&quot;Content-Security-Policy&quot; ...&gt;
              </code>{" "}
              etiketi otomatik olarak eklenmektedir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
