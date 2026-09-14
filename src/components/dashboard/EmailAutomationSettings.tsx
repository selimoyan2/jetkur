import React, { useState, useEffect } from "react";
import {
  SiteConfig,
  LeadThankYouEmailConfig
} from "../../types";
import { DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG } from "../../data/mockData";
import { RichTextEditor } from "../RichTextEditor";
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Smartphone,
  Monitor,
  Copy,
  FileText,
  Settings,
  ShieldCheck,
  ExternalLink,
  Clock,
  User,
  Building,
  Phone,
  Inbox,
  Check,
  Zap,
  Info,
  Layers,
  Code,
  Timer,
  Hourglass,
  CalendarClock,
  Coffee,
  Sliders,
  Calendar,
  Play,
  ArrowRight,
  Sun,
  Moon,
  MailCheck
} from "lucide-react";

interface EmailAutomationSettingsProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToLeads?: () => void;
  onNavigateToResponses?: () => void;
}

interface TemplatePreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  subject: string;
  body: string;
  senderName: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "corporate",
    name: "Kurumsal & Prestijli",
    tagline: "Resmi iş ortaklıkları, kurumsal hizmetler ve profesyonel taahhütler için",
    badge: "Önerilen",
    subject: "Talebiniz Alındı! Teşekkür Ederiz - {firma}",
    body: `<h3>Sayın <strong>{isim}</strong>,</h3>
<p><strong>{firma}</strong> kurumsal web sitemiz üzerinden iletmiş olduğunuz talebinizi ve form bilgilerinizi memnuniyetle teslim aldık.</p>
<p>İlgilendiğiniz <strong>{hizmet}</strong> konusu ile ilgili uzman müşteri temsilcimiz başvurunuzu öncelikli olarak incelemeye başlamıştır. En geç <strong>2 iş saati</strong> içerisinde belirttiğiniz iletişim kanallarından sizinle irtibata geçeceğiz.</p>
<p>Acil durumlar ve ek bilgi talepleriniz için <strong>{telefon}</strong> numaralı destek hattımızı doğrudan arayabilirsiniz.</p>
<br/>
<p>Saygılarımızla,<br/><strong>{firma} Müşteri İlişkileri & Operasyon Departmanı</strong></p>`,
    senderName: "{firma} Müşteri İlişkileri"
  },
  {
    id: "urgent",
    name: "7/24 Acil & Hızlı Müdahale",
    tagline: "Çekici, acil servis, teknik destek ve anlık müdahale gerektiren sektörler için",
    badge: "Hızlı Servis",
    subject: "🚨 Talebiniz Nöbetçi Ekibimize Ulaştı! - {firma}",
    body: `<h3>Merhaba Sayın <strong>{isim}</strong>,</h3>
<p>Talebiniz <strong>{firma}</strong> 7/24 nöbetçi saha koordinasyon ekibimize anında ulaştı! 🚨</p>
<p><strong>{hizmet}</strong> konusundaki çağrınız acil operasyon sırasına alınmıştır. Saha yetkilimiz birkaç dakika içinde <strong>{telefon}</strong> veya ilettiğiniz iletişim numarasından sizinle irtibat kuracaktır.</p>
<p>Canlı konum veya acil yönlendirme bildirmek isterseniz çağrı merkezimizi hemen arayabilirsiniz: <strong>{telefon}</strong></p>
<br/>
<p>Güvenli ve sağlıklı günler dileriz,<br/><strong>{firma} 7/24 Acil Operasyon Merkezi</strong></p>`,
    senderName: "{firma} Acil Destek"
  },
  {
    id: "friendly",
    name: "Sıcak & Samimi",
    tagline: "Bireysel müşteriler, atölyeler, klinikler ve danışmanlık hizmetleri için",
    badge: "Kişisel",
    subject: "Merhaba {isim}! Mesajınızı Aldık 👋 - {firma}",
    body: `<h3>Merhaba <strong>{isim}</strong>! 👋</h3>
<p>Bize ulaştığınız için çok teşekkür ederiz. <strong>{firma}</strong> ailesi olarak sizinle tanışmaktan ve <strong>{hizmet}</strong> konusunda size destek olmaktan mutluluk duyacağız.</p>
<p>Ekibimiz mesajınızı inceliyor ve en kısa sürede detaylı bilgilerle size geri dönüş yapacaktır. İsterseniz bizi <strong>{telefon}</strong> numarasından da dilediğiniz an arayabilirsiniz.</p>
<br/>
<p>Görüşmek dileğiyle,<br/><strong>{firma} Ekibi</strong></p>`,
    senderName: "{firma} Ekibi"
  },
  {
    id: "vip",
    name: "VIP & Özel Teklif",
    tagline: "Yüksek bütçeli projeler, özel danışmanlık ve B2B kurumsal müşteriler için",
    badge: "Ayrıcalıklı",
    subject: "Özel Talep Bildirimi: {hizmet} - {firma}",
    body: `<h3>Sayın <strong>{isim}</strong>,</h3>
<p><strong>{firma}</strong> ayrıcalıklı hizmet ağımız üzerinden ilettiğiniz <strong>{hizmet}</strong> talebiniz VIP portföy yöneticimize doğrudan atanmıştır.</p>
<p>Şirketinize ve talebinize özel olarak hazırlanacak fizibilite ve teklif dosyamız tamamlandığında, temsilciniz sizinle bizzat irtibata geçecektir.</p>
<p>Özel danışmanınızla doğrudan görüşmek isterseniz <strong>{telefon}</strong> numarasından bize ulaşabilirsiniz.</p>
<br/>
<p>En içten saygılarımızla,<br/><strong>{firma} Özel Müşteri Yönetimi</strong></p>`,
    senderName: "{firma} Özel Müşteri Direktörlüğü"
  }
];

export const EmailAutomationSettings: React.FC<EmailAutomationSettingsProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateToLeads,
  onNavigateToResponses
}) => {
  // Current active settings
  const rawEmailConfig: LeadThankYouEmailConfig =
    config.leadThankYouEmail ||
    config.customForm?.thankYouEmail ||
    DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG;

  // Ensure body is HTML string for rich text editor
  const formatInitialBody = (bodyText: string) => {
    if (!bodyText) return "";
    if (/<[a-z][\s\S]*>/i.test(bodyText)) {
      return bodyText;
    }
    // Convert plain text newlines to paragraphs
    return bodyText
      .split("\n\n")
      .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  };

  const [emailConfig, setEmailConfig] = useState<LeadThankYouEmailConfig>({
    ...rawEmailConfig,
    body: formatInitialBody(rawEmailConfig.body)
  });

  const [activeTab, setActiveTab] = useState<"editor" | "delay" | "presets" | "settings">("editor");
  const [customDelayInput, setCustomDelayInput] = useState<number>(emailConfig.delayMinutes ?? 5);

  // Live countdown simulator states for delay demo
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoRemainingSec, setDemoRemainingSec] = useState<number>(30);
  const [demoCompleted, setDemoCompleted] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isDemoRunning && demoRemainingSec > 0) {
      timer = setInterval(() => {
        setDemoRemainingSec((prev) => {
          if (prev <= 1) {
            setIsDemoRunning(false);
            setDemoCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDemoRunning, demoRemainingSec]);

  const startCountdownDemo = () => {
    setDemoCompleted(false);
    setDemoRemainingSec(30);
    setIsDemoRunning(true);
  };

  const resetCountdownDemo = () => {
    setIsDemoRunning(false);
    setDemoCompleted(false);
    setDemoRemainingSec(30);
  };
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [testEmailAddress, setTestEmailAddress] = useState<string>(
    config.email || "destek@yildizotokurtarma.com.tr"
  );
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    sentAt?: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);

  // Sample lead data for realistic live preview
  const sampleLead = {
    name: "Ahmet Yılmaz",
    phone: "0532 999 88 77",
    email: "ahmet.yilmaz@musteri.com",
    service: "7/24 Şehir İçi Oto Çekici",
    date: "Bugün 14:35",
    message: "Şişli Mecidiyeköy meydanında aracım arızalandı, acil çekici rica ediyorum."
  };

  // Interpolate helper for live preview
  const interpolate = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\{firma\}/g, config.companyName || "Yıldız Oto Kurtarma")
      .replace(/\{isim\}/g, sampleLead.name)
      .replace(/\{hizmet\}/g, sampleLead.service)
      .replace(/\{telefon\}/g, config.phone || "0532 000 00 00")
      .replace(/\{tarih\}/g, sampleLead.date)
      .replace(/\{eposta\}/g, sampleLead.email)
      .replace(/\{mesaj\}/g, sampleLead.message);
  };

  const interpolatedSubject = interpolate(emailConfig.subject);
  const interpolatedBody = interpolate(emailConfig.body);

  // Update field
  const updateField = <K extends keyof LeadThankYouEmailConfig>(
    key: K,
    val: LeadThankYouEmailConfig[K]
  ) => {
    const updated = { ...emailConfig, [key]: val };
    setEmailConfig(updated);
    saveSettings(updated);
  };

  // Save changes to site config (both leadThankYouEmail and customForm.thankYouEmail)
  const saveSettings = (newConfig: LeadThankYouEmailConfig) => {
    const updatedSiteConfig: SiteConfig = {
      ...config,
      leadThankYouEmail: newConfig,
      customForm: config.customForm
        ? {
            ...config.customForm,
            thankYouEmail: newConfig
          }
        : undefined
    };
    onChange(updatedSiteConfig);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Apply a designer preset
  const handleApplyPreset = (preset: TemplatePreset) => {
    const updated: LeadThankYouEmailConfig = {
      ...emailConfig,
      subject: preset.subject,
      body: preset.body,
      senderName: preset.senderName
    };
    setEmailConfig(updated);
    saveSettings(updated);
    setActiveTab("editor");
  };

  // Restore system default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "E-posta şablonunu sistem varsayılan metnine sıfırlamak istediğinize emin misiniz?"
      )
    ) {
      const defaultCfg: LeadThankYouEmailConfig = {
        ...DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG,
        body: formatInitialBody(DEFAULT_LEAD_THANK_YOU_EMAIL_CONFIG.body)
      };
      setEmailConfig(defaultCfg);
      saveSettings(defaultCfg);
    }
  };

  // Copy token to clipboard or insert
  const handleTokenClick = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Send test email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      setTestResult({
        success: false,
        message: "Lütfen geçerli bir test e-posta adresi yazınız."
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-lead-thank-you-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: testEmailAddress,
          thankYouConfig: emailConfig,
          companyName: config.companyName,
          phone: config.phone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const delayNote = (emailConfig.delayMinutes ?? 0) > 0
          ? ` (⏱️ Canlıda ${emailConfig.delayMinutes} dk doğal gecikme ile kuyruğa alınır)`
          : ` (⚡ Canlıda anında iletim modu)`;
        setTestResult({
          success: true,
          message: `Test e-postası '${testEmailAddress}' adresine başarıyla gönderildi.${delayNote}`,
          details: `Mesaj Kimliği: ${data.messageId} • Gönderim Saati: ${data.sentAt}${emailConfig.delayRandomWindow ? " • İnsani Rastgele Sapma: Aktif (±1-3 dk)" : ""}`,
          sentAt: data.sentAt
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "E-posta gönderiminde bir sorun oluştu."
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "Bağlantı hatası: Sunucu ile iletişim kurulamadı."
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const dynamicVariables = [
    { token: "{isim}", label: "Müşteri Adı", desc: "Örn: Ahmet Yılmaz" },
    { token: "{firma}", label: "Şirketinizin Adı", desc: config.companyName || "Firma Adı" },
    { token: "{hizmet}", label: "Seçilen Hizmet / Ürün", desc: "Örn: 7/24 Oto Çekici" },
    { token: "{telefon}", label: "Şirket Telefon Numaranız", desc: config.phone || "0532..." },
    { token: "{eposta}", label: "Müşteri E-Postası", desc: "ornek@mail.com" },
    { token: "{tarih}", label: "Form Gönderim Tarihi", desc: "Bugün 14:35" },
    { token: "{mesaj}", label: "Müşteri Notu / Talebi", desc: "Özel mesaj..." }
  ];

  return (
    <div id="email-automation-settings-container" className="space-y-6">
      {/* 1. HERO HEADER SECTION */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Email Automation Settings
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Sistem Varsayılanını Değiştirir
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Web sitenizden form dolduran yeni müşterilere otomatik gidecek 'Teşekkürler & Talebiniz Alındı' e-posta şablonunu zengin metin (Rich Text) ile kişiselleştirin.
                </p>
              </div>
            </div>
          </div>

          {/* Quick status & master toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {onNavigateToLeads && (
              <button
                id="btn-nav-to-leads"
                onClick={onNavigateToLeads}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Inbox className="w-4 h-4 text-slate-500" />
                Gelen Talepler (CRM)
              </button>
            )}

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">
                  Otomatik E-Posta Gönderimi
                </span>
                <span className="text-[11px] text-slate-500">
                  {emailConfig.enabled ? "Canlıda Aktif" : "Devre Dışı"}
                </span>
              </div>
              <button
                id="toggle-email-automation-enabled"
                type="button"
                onClick={() => updateField("enabled", !emailConfig.enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                  emailConfig.enabled ? "bg-blue-600" : "bg-slate-300"
                }`}
                aria-label="Otomatik E-Posta Gönderimini Aç veya Kapat"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    emailConfig.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save confirmation toast notice */}
        {saveSuccessToast && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Şablon Başarıyla Güncellendi!</strong> Artık web sitenizden gelen tüm yeni form taleplerinde sistem varsayılanı yerine bu kişiselleştirilmiş şablon kullanılacaktır.
            </span>
          </div>
        )}
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-email-editor"
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "editor"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Zengin Metin Şablon Editörü
        </button>

        <button
          id="tab-email-delay-timer"
          onClick={() => setActiveTab("delay")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "delay"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Timer className={`w-4 h-4 ${activeTab === "delay" ? "text-amber-300" : "text-amber-500"}`} />
          <span>Gecikme & Zamanlayıcı (Delay Timer)</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeTab === "delay"
                ? "bg-blue-700 text-amber-200"
                : emailConfig.delayMinutes && emailConfig.delayMinutes > 0
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {emailConfig.delayMinutes && emailConfig.delayMinutes > 0
              ? `${emailConfig.delayMinutes} dk Bekleme`
              : "Anında"}
          </span>
        </button>

        <button
          id="tab-email-presets"
          onClick={() => setActiveTab("presets")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "presets"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Hazır Sektörel Şablonlar ({TEMPLATE_PRESETS.length})
        </button>

        <button
          id="tab-email-settings"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          Gönderici & Teslimat Ayarları
        </button>

        {onNavigateToResponses && (
          <button
            type="button"
            id="tab-email-automated-responses"
            onClick={onNavigateToResponses}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-700 hover:text-amber-900 hover:bg-amber-50/70 border border-amber-200/60 cursor-pointer ml-auto bg-amber-50/30"
            title="Gönderilen ve bekleyen otomatik yanıtların tablosunu görüntüle"
          >
            <MailCheck className="w-4 h-4 text-amber-600" />
            <span>Automated Responses Tablosu</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Canlı Takip
            </span>
          </button>
        )}
      </div>

      {/* 3. MAIN WORKSPACE CONTENT: 2-COLUMN GRID (EDITOR & LIVE PREVIEW) */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: RICH TEXT TEMPLATE DRAFTING WORKSPACE (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Kişisel E-Posta Şablonunuzu Tasarlayın
                    </h2>
                    <p className="text-xs text-slate-500">
                      Başlık ve zengin metin gövdesi sistem varsayılan e-postasının yerini alır.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-reset-default-template"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1.5"
                  title="Sistem varsayılan şablonuna geri dön"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Varsayılana Sıfırla
                </button>
              </div>

              {/* Dynamic Variables Inserter Toolbar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Dinamik Akıllı Değişkenler (Tıklayarak Kopyalayın & Yapıştırın)
                  </span>
                  {copiedToken && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {copiedToken} panoya kopyalandı!
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dynamicVariables.map((v) => (
                    <button
                      key={v.token}
                      id={`btn-token-${v.token.replace(/[{}]/g, "")}`}
                      type="button"
                      onClick={() => handleTokenClick(v.token)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-mono text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs group"
                      title={`${v.label} (${v.desc}) - Tıkla ve Kopyala`}
                    >
                      <span className="font-bold text-blue-600">{v.token}</span>
                      <span className="text-[11px] text-slate-400 group-hover:text-slate-600">
                        {v.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Subject Line */}
              <div className="space-y-2">
                <label
                  htmlFor="email-subject-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  E-Posta Konu Başlığı (Subject)
                </label>
                <div className="relative">
                  <input
                    id="email-subject-input"
                    type="text"
                    value={emailConfig.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder="Talebiniz Alındı! Teşekkür Ederiz - {firma}"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    {emailConfig.subject.length} karakter
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  İpucu: Konu satırında <code>{`{firma}`}</code> veya <code>{`{isim}`}</code> kullanarak açılma oranını %38 artırabilirsiniz.
                </p>
              </div>

              {/* Rich Text Editor for Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    E-Posta Gövde Metni (Rich Text WYSIWYG)
                  </label>
                  <span className="text-xs text-blue-600 font-medium">
                    HTML & Zengin Biçimlendirme Destekli
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <RichTextEditor
                    value={emailConfig.body}
                    onChange={(newVal) => updateField("body", newVal)}
                    placeholder="Müşterinize iletilecek teşekkür mesajını buraya yazın..."
                    minHeight="260px"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Kalın (bold), italik, başlıklar, listeler veya tablolar ekleyebilirsiniz. Sistem gelen her müşterinin adını, seçtiği hizmeti ve detayları otomatik olarak dolduracaktır.
                </p>
              </div>

              {/* Quick Settings Toggles */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Form Bilgileri Özet Tablosunu Ekle
                      </span>
                      <span className="text-[11px] text-slate-500">
                        E-postanın altına müşterinin ilettiği telefon, hizmet ve mesaj dökümünü içeren şık bir tablo ekler.
                      </span>
                    </div>
                  </div>
                  <input
                    id="toggle-include-summary"
                    type="checkbox"
                    checked={emailConfig.includeDetailsSummary !== false}
                    onChange={(e) => updateField("includeDetailsSummary", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Formda E-Posta Alanını Zorunlu Tut
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Otomatik teşekkür e-postasının her müşteriye eksiksiz ulaşması için formdaki e-posta alanını zorunlu kılar.
                      </span>
                    </div>
                  </div>
                  <input
                    id="toggle-require-email"
                    type="checkbox"
                    checked={Boolean(emailConfig.requireEmail)}
                    onChange={(e) => updateField("requireEmail", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* NATURAL FOLLOW-UP DELAY TIMER QUICK CONTROL */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Doğal Takip & Gecikme Zamanlayıcısı (Delay Timer)
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          (emailConfig.delayMinutes ?? 5) > 0
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {(emailConfig.delayMinutes ?? 5) > 0
                          ? `${emailConfig.delayMinutes ?? 5} Dk Gecikmeli • Doğal İnceleme Modu`
                          : "0 Dk • Anında İletim"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Müşteriye form gönderdiği an yapay/robotik cevap gitmesini engeller; gerçek bir temsilci formu incelemiş hissi verir.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-open-full-delay-tab"
                  onClick={() => setActiveTab("delay")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Detaylı Ayarlar & Simülatör
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delay Presets Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { mins: 0, label: "0 dk (Anında)", desc: "Saniyesinde gider" },
                  { mins: 5, label: "5 dk (Önerilen)", desc: "Doğal inceleme hissi" },
                  { mins: 15, label: "15 dk", desc: "Kurumsal çalışma" },
                  { mins: 30, label: "30 dk", desc: "Derin analiz hissi" },
                  { mins: 60, label: "60 dk", desc: "Yoğun mesai hissi" }
                ].map((item) => {
                  const isSelected = (emailConfig.delayMinutes ?? 5) === item.mins;
                  return (
                    <button
                      key={item.mins}
                      type="button"
                      id={`btn-editor-delay-preset-${item.mins}`}
                      onClick={() => {
                        updateField("delayMinutes", item.mins);
                        updateField("delayMode", item.mins === 0 ? "instant" : "preset");
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-50/80 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                          : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Jitter & Business Hours Quick Toggles */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    id="checkbox-delay-random-window"
                    type="checkbox"
                    checked={emailConfig.delayRandomWindow !== false}
                    onChange={(e) => updateField("delayRandomWindow", e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                  />
                  <span>
                    <strong>Doğal İnsan Sapması (±1-3 dk):</strong> Tam saat başı yerine rastgele insani dakikalarda ilet.
                  </span>
                </label>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {(emailConfig.delayMinutes ?? 5) > 0
                      ? `Talepler ortalama ${emailConfig.delayMinutes} dakika sonra iletilir.`
                      : "Gecikme kapalı, anında teslim edilir."}
                  </span>
                </div>
              </div>
            </div>

            {/* SEND TEST EMAIL ACTION CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Canlı Test E-Postası Gönder
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hazırladığınız şablonun gelen kutusunda nasıl durduğunu görmek için kendinize bir test gönderin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="input-test-email-address"
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="test@sirketiniz.com"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  id="btn-send-test-email"
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  {isSendingTest ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Test E-Postası Gönder
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border border-rose-200 text-rose-900"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-semibold">{testResult.message}</div>
                    {testResult.details && (
                      <div className="text-[11px] text-emerald-700 font-mono">
                        {testResult.details}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: LIVE INTERACTIVE INBOX PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Preview Header Controls */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-700 ml-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Canlı Gelen Kutusu Önizlemesi
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    id="btn-preview-device-desktop"
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-slate-100 text-blue-600 font-bold"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="Masaüstü E-Posta İstemcisi"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-preview-device-mobile"
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-slate-100 text-blue-600 font-bold"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="Mobil E-Posta İstemcisi"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample Customer Notice */}
              <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 text-[11px] text-blue-700 flex items-center justify-between">
                <span>
                  Örnek alıcı: <strong>{sampleLead.name}</strong> ({sampleLead.service})
                </span>
                <span className="text-[10px] text-blue-500 font-mono">
                  {sampleLead.date}
                </span>
              </div>

              {/* Email Envelope Container */}
              <div
                className={`p-4 sm:p-6 transition-all bg-slate-100/60 ${
                  previewDevice === "mobile" ? "max-w-xs mx-auto" : "w-full"
                }`}
              >
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Email Brand Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400 mb-1">
                      {config.companyName || "Yıldız Oto Kurtarma"} • Otomatik Bilgilendirme
                    </div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      {interpolatedSubject || "Talebiniz Alındı! Teşekkür Ederiz"}
                    </h4>
                  </div>

                  {/* Email Body Content */}
                  <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Talebiniz başarıyla teslim alındı ve müşteri hizmetleri sırasına eklendi.
                    </div>

                    {/* Rich text rendered content */}
                    <div
                      className="prose prose-xs max-w-none text-slate-700 leading-normal"
                      dangerouslySetInnerHTML={{
                        __html:
                          interpolatedBody ||
                          "<p>Müşterinize iletilecek teşekkür mesajı...</p>"
                      }}
                    />

                    {/* Optional Form Summary Table */}
                    {emailConfig.includeDetailsSummary !== false && (
                      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          İlettiğiniz Form Bilgileri Özeti
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="text-slate-400">Talep Sahibi:</span>
                            <span className="font-semibold text-slate-800">{sampleLead.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="text-slate-400">Telefon:</span>
                            <span className="font-semibold text-slate-800">{sampleLead.phone}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="text-slate-400">E-Posta:</span>
                            <span className="font-semibold text-blue-600">{sampleLead.email}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="text-slate-400">Hizmet / Konu:</span>
                            <span className="font-semibold text-slate-800">{sampleLead.service}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Notunuz:</span>
                            <span className="font-medium text-slate-600 italic">"{sampleLead.message}"</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Call to Action Button */}
                    <div className="text-center pt-2">
                      <a
                        href={`tel:${(config.phone || "0532 000 00 00").replace(/\s+/g, "")}`}
                        onClick={(e) => e.preventDefault()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs hover:bg-slate-800"
                      >
                        <Phone className="w-3 h-3" />
                        Müşteri Hizmetlerini Arayın: {config.phone || "0532 000 00 00"}
                      </a>
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-relaxed">
                    Bu e-posta <strong>{config.companyName || "Yıldız Oto Kurtarma"}</strong> web sitesi üzerinden doldurduğunuz form talebine istinaden otomatik olarak gönderilmiştir.
                  </div>
                </div>
              </div>

              {/* Status footer in preview */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Şablon Canlıda Aktif
                </span>
                <span className="text-slate-400">
                  Otomatik Değişkenler Anında Entegre Olur
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELAY TIMER SETTINGS TAB (NATURAL FOLLOW-UP EXPERIENCE) */}
      {activeTab === "delay" && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Timer className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Doğal Takip & Gecikme Zamanlayıcısı (Delay Timer)
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        (emailConfig.delayMinutes ?? 5) > 0
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {(emailConfig.delayMinutes ?? 5) > 0
                        ? `⏱️ ${emailConfig.delayMinutes ?? 5} Dakika Doğal Bekleme Modu`
                        : "⚡ 0 Dakika (Anında İletim)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Yeni gelen potansiyel müşterilere form doldurur doldurmaz saniyesinde yapay/robotik bir e-posta gitmesini önleyin. Gerçek bir müşteri yöneticisi veya danışman mesajı okumuş ve kişiye özel yanıt hazırlamış hissi vererek güveni ve dönüşüm oranlarını artırın.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-switch-to-editor-from-delay"
                onClick={() => setActiveTab("editor")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Şablon Editörüne Dön
              </button>
            </div>

            {/* Strategy Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  Önerilen Gecikme Stratejisi Seçin
                </h3>
                <span className="text-xs text-slate-400">
                  Şu anki süre: <strong>{emailConfig.delayMinutes ?? 5} Dakika</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. 5 dk (Recommended) */}
                <div
                  onClick={() => {
                    updateField("delayMinutes", 5);
                    updateField("delayMode", "preset");
                    setCustomDelayInput(5);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    (emailConfig.delayMinutes ?? 5) === 5
                      ? "bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        ⭐ En Çok Tercih Edilen
                      </span>
                      {(emailConfig.delayMinutes ?? 5) === 5 && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      5 Dakika (Doğal İnceleme)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Müşteriye formunun masaya ulaştığı, görevli ekip tarafından incelendiği ve ardından özel olarak yanıt verildiği hissini uyandırır. En yüksek güven ve dönüşüm oranı.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Bekleme: 5 Dk</span>
                    <span className="text-amber-700 font-semibold">Tavsiye Edilen</span>
                  </div>
                </div>

                {/* 2. 15 dk (Corporate) */}
                <div
                  onClick={() => {
                    updateField("delayMinutes", 15);
                    updateField("delayMode", "preset");
                    setCustomDelayInput(15);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    (emailConfig.delayMinutes ?? 5) === 15
                      ? "bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Kurumsal & Profesyonel
                      </span>
                      {(emailConfig.delayMinutes ?? 5) === 15 && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      15 Dakika (Detaylı Takip)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      B2B teklifler, kurumsal danışmanlık veya fizibilite çalışması hissi vermek istediğiniz sektörler için dengeli ve olgun bir takip süresi.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Bekleme: 15 Dk</span>
                    <span className="text-blue-700 font-semibold">B2B & Kurumsal</span>
                  </div>
                </div>

                {/* 3. 30 dk (Comprehensive) */}
                <div
                  onClick={() => {
                    updateField("delayMinutes", 30);
                    updateField("delayMode", "preset");
                    setCustomDelayInput(30);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    (emailConfig.delayMinutes ?? 5) === 30
                      ? "bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                        Kapsamlı Değerlendirme
                      </span>
                      {(emailConfig.delayMinutes ?? 5) === 30 && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <CalendarClock className="w-4 h-4 text-purple-600" />
                      30 Dakika (Özel Çalışma)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Özel fiyatlandırma, teknik şartname veya mimari/mühendislik projelerinde talebin masaya yatırıldığı ve derinlemesine çalışıldığı hissini sağlar.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Bekleme: 30 Dk</span>
                    <span className="text-purple-700 font-semibold">Derin Analiz</span>
                  </div>
                </div>

                {/* 4. 0 dk (Instant) */}
                <div
                  onClick={() => {
                    updateField("delayMinutes", 0);
                    updateField("delayMode", "instant");
                    setCustomDelayInput(0);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    (emailConfig.delayMinutes ?? 5) === 0
                      ? "bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Anında / 0 Gecikme
                      </span>
                      {(emailConfig.delayMinutes ?? 5) === 0 && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-slate-700" />
                      0 Dakika (Anında Gönder)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Form onaylandığı milisaniyede e-posta gönderilir. Çok acil yolda kalma durumları veya teknik şifre teyidi benzeri gereksinimler için uygundur.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Bekleme: 0 Dk</span>
                    <span className="text-slate-600 font-semibold">Milisaniyelik</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Delay Slider & Number Input */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Özel Gecikme Süresi Ayarla (Dakika Cinsinden)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Seçilen Değer:</span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-900 text-sm shadow-2xs">
                    {emailConfig.delayMinutes ?? 5} Dakika
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-1">
                  <input
                    id="slider-custom-delay-minutes"
                    type="range"
                    min="0"
                    max="120"
                    step="1"
                    value={emailConfig.delayMinutes ?? 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      updateField("delayMinutes", val);
                      updateField("delayMode", val === 0 ? "instant" : "custom");
                      setCustomDelayInput(val);
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0 dk (Anında)</span>
                    <span>15 dk</span>
                    <span>30 dk</span>
                    <span>60 dk (1 Saat)</span>
                    <span>120 dk (2 Saat)</span>
                  </div>
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <input
                    id="input-custom-delay-minutes"
                    type="number"
                    min="0"
                    max="1440"
                    value={customDelayInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomDelayInput(isNaN(val) ? 0 : val);
                    }}
                    onBlur={() => {
                      updateField("delayMinutes", customDelayInput);
                      updateField("delayMode", customDelayInput === 0 ? "instant" : "custom");
                    }}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-center focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateField("delayMinutes", customDelayInput);
                      updateField("delayMode", customDelayInput === 0 ? "instant" : "custom");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Human Jitter & Business Hours Schedule Protection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Jitter Card */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Akıllı İnsani Dokunuş (Human Jitter)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tüm e-postaların tam 05:00 veya 15:00 dakikada gitmesini önleyerek rastgele mikro-sapmalar ekler.
                      </p>
                    </div>
                  </div>

                  <input
                    id="toggle-human-jitter-setting"
                    type="checkbox"
                    checked={emailConfig.delayRandomWindow !== false}
                    onChange={(e) => updateField("delayRandomWindow", e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500 mt-1 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    {emailConfig.delayRandomWindow !== false
                      ? "Doğal Varyasyon Açık: ±1-3 Dakika Rastgele Sapma"
                      : "Sabit Süre: Tam belirlenen dakikada iletilir"}
                  </div>
                  <p className="text-[11px] text-amber-800/80">
                    Örneğin 5 dakika seçtiğinizde bazı taleplere 4 dk 40 sn, bazılarına ise 5 dk 30 sn sonra yanıt gider. Bu sayede müşteri kesinlikle bir bot değil, gerçek bir çalışan yazdı izlenimi edinir.
                  </p>
                </div>
              </div>

              {/* Business Hours Schedule Card */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Mesai Saatleri Koruması
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gece yarısı gelen talepleri bekletip sabah mesai başlangıcında doğal biçimde iletir.
                      </p>
                    </div>
                  </div>

                  <input
                    id="toggle-business-hours-only"
                    type="checkbox"
                    checked={Boolean(emailConfig.businessHoursOnly)}
                    onChange={(e) => updateField("businessHoursOnly", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 mt-1 cursor-pointer"
                  />
                </div>

                {emailConfig.businessHoursOnly ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        Mesai Başlangıç
                      </label>
                      <input
                        id="input-business-hours-start"
                        type="time"
                        value={emailConfig.businessHoursStart || "09:00"}
                        onChange={(e) => updateField("businessHoursStart", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-indigo-500" />
                        Mesai Bitiş
                      </label>
                      <input
                        id="input-business-hours-end"
                        type="time"
                        value={emailConfig.businessHoursEnd || "19:00"}
                        onChange={(e) => updateField("businessHoursEnd", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                    24 Saat Modu: Geceleri gelen formlar belirlenen gecikme süresine göre günün her saatinde otomatik iletilir.
                  </div>
                )}
              </div>
            </div>

            {/* Visual Process Flow & Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Müşteri Deneyimi Zaman Akışı (Timeline)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">T = 00:00</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">1. Adım</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Form Dolduruldu</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ziyaretçi web sitenizdeki formu doldurur ve gönderir. Sistem talebi CRM paneline anında kaydeder.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2 relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-700">
                      T = 00:00 ➔ 00:{String(emailConfig.delayMinutes ?? 5).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-semibold animate-pulse">
                      ⏳ Doğal İnceleme
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-amber-950">İnsani İnceleme Aralığı</h4>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    E-posta saniyesinde robotik gitmez. Müşteriye formu yetkili personel okuyup yanıt hazırlıyormuş hissi uyandıran doğal bir bekleme uygulanır.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      T = +{emailConfig.delayMinutes ?? 5} Dakika
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-semibold">3. Adım</span>
                  </div>
                  <h4 className="text-sm font-bold text-emerald-950">E-Posta Teslim Edildi</h4>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Kişiselleştirilmiş teşekkür ve teklif bilgilendirmesi müşterinin gelen kutusuna insani bir saygınlıkla ulaşır.
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE 30-SECOND COUNTDOWN SIMULATOR BOX */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-4 shadow-sm border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Canlı Deneyim: 30 Saniyelik Hızlandırılmış Zamanlayıcı Simülatörü
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sistemin yeni bir form talebini nasıl kuyruğa aldığını ve belirlenen gecikme sonrasında nasıl başarıyla teslim ettiğini canlı izleyin.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isDemoRunning ? (
                    <button
                      type="button"
                      id="btn-start-delay-countdown-demo"
                      onClick={startCountdownDemo}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {demoCompleted ? "Simülasyonu Yeniden Başlat" : "Simülasyonu Başlat"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="btn-reset-delay-countdown-demo"
                      onClick={resetCountdownDemo}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      Durdur & Sıfırla
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Countdown Meter */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Simüle Talep: <strong>Murat Demir</strong> (7/24 Şehir İçi Oto Çekici)
                  </span>
                  <span className="font-bold text-amber-400">
                    {isDemoRunning
                      ? `⏳ Kuyrukta Bekletiliyor: ${demoRemainingSec}s Kaldı`
                      : demoCompleted
                      ? "✓ Teslimat Tamamlandı!"
                      : "Hazır Bekliyor"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      demoCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-amber-400"
                    }`}
                    style={{
                      width: demoCompleted
                        ? "100%"
                        : isDemoRunning
                        ? `${((30 - demoRemainingSec) / 30) * 100}%`
                        : "0%"
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Adım: {isDemoRunning ? "Doğal Danışman İnceleme Aralığı Simüle Ediliyor" : demoCompleted ? "E-Posta Gönderildi" : "Başlatılmadı"}</span>
                  <span className="font-mono">
                    {demoCompleted ? "Durum: Teslim Edildi (Delivered)" : isDemoRunning ? "Durum: Kuyrukta (Queued)" : "Durum: Boşta"}
                  </span>
                </div>
              </div>

              {demoCompleted && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Tebrikler!</strong> Simülasyon başarıyla tamamlandı. Gerçek müşterileriniz tam olarak bu şekilde güven verici, doğal bir zamanlamayla karşılanacaktır.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. PRESETS VIEW (SECTORIAL TEMPLATES) */}
      {activeTab === "presets" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900">
                Hazır Sektörel 'Teşekkürler' E-Postası Şablonları
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                İş modelinize en uygun profesyonel şablonu seçin. Tek tıkla editörünüze yükleyebilir ve üzerindeki zengin metinleri dilediğiniz gibi kişiselleştirebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {TEMPLATE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-xl border border-slate-200 hover:border-blue-400 p-5 space-y-4 transition-all hover:shadow-sm bg-white flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {preset.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {preset.senderName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{preset.name}</h3>
                    <p className="text-xs text-slate-500">{preset.tagline}</p>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="font-semibold text-slate-800 truncate">
                        Konu: {preset.subject}
                      </div>
                      <div
                        className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: preset.body }}
                      />
                    </div>
                  </div>

                  <button
                    id={`btn-apply-preset-${preset.id}`}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-blue-200/80 hover:border-blue-600"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Bu Şablonu Uygula & Düzenle
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. DELIVERY & SENDER SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-3xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Gönderici & E-Posta İletişim Ayarları
            </h2>
            <p className="text-xs text-slate-500">
              Müşterilerinizin e-postayı aldıklarında gördükleri kimlik ve yanıt adreslerini belirleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="input-sender-name"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Gönderici Adı (From Name)
              </label>
              <input
                id="input-sender-name"
                type="text"
                value={emailConfig.senderName || ""}
                onChange={(e) => updateField("senderName", e.target.value)}
                placeholder="{firma} Müşteri Destek"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-slate-400">
                Örn: <code>{`{firma} Müşteri Hizmetleri`}</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="input-reply-to"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Yanıt Adresi (Reply-To Email)
              </label>
              <input
                id="input-reply-to"
                type="email"
                value={emailConfig.replyToEmail || config.email || ""}
                onChange={(e) => updateField("replyToEmail", e.target.value)}
                placeholder="destek@sirketiniz.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-slate-400">
                Müşteri "Yanıtla" dediğinde bu adrese e-posta gidecektir.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Yetkili Bildirimi (BCC / Notification)
                </span>
                <span className="text-[11px] text-slate-500">
                  Müşteriye teşekkür e-postası giderken eşzamanlı olarak şirket yetkilisi e-posta adresine de bilgi ulaştırılır.
                </span>
              </div>
              <input
                id="toggle-send-copy"
                type="checkbox"
                checked={Boolean(emailConfig.sendCopyNotification)}
                onChange={(e) => updateField("sendCopyNotification", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
