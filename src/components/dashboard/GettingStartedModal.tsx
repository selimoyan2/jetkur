import React, { useState, useEffect } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab 
} from "../../types";
import { 
  CheckCircle2, 
  Circle, 
  Rocket, 
  Upload, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  X, 
  HelpCircle, 
  Check, 
  Clock, 
  Palette, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Share2, 
  PartyPopper,
  Zap,
  Globe,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Base64ImageUpload } from "./Base64ImageUpload";

interface GettingStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onNavigateTab: (tab: CustomerPanelTab) => void;
  onPreview: () => void;
  onDeploy: () => void;
  onTriggerAiContent: () => void;
}

export const GettingStartedModal: React.FC<GettingStartedModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onNavigateTab,
  onPreview,
  onDeploy,
  onTriggerAiContent
}) => {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [quickPhone, setQuickPhone] = useState(config.phone || "");
  const [quickWhatsapp, setQuickWhatsapp] = useState(config.whatsapp || "");
  const [quickAddress, setQuickAddress] = useState(config.address || "");
  const [contactSaved, setContactSaved] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Sync state if config changes
  useEffect(() => {
    setQuickPhone(config.phone || "");
    setQuickWhatsapp(config.whatsapp || "");
    setQuickAddress(config.address || "");
  }, [config.phone, config.whatsapp, config.address]);

  if (!isOpen) return null;

  // Task Completion Logic
  const isLogoComplete = Boolean(
    config.logo || 
    (config.logoUrl && !config.logoUrl.includes("placeholder.svg") && !config.logoUrl.includes("via.placeholder"))
  );

  const isContactComplete = Boolean(
    (config.phone && config.phone.replace(/[^0-9]/g, "").length >= 7) &&
    (config.whatsapp && config.whatsapp.replace(/[^0-9]/g, "").length >= 7) &&
    (config.address && config.address.trim().length > 3)
  );

  const isContentComplete = Boolean(
    ((config.services?.items?.length || 0) > 0 || (config.products?.items?.length || 0) > 0) &&
    config.about?.content &&
    config.about.content.length > 30
  );

  const isPublishComplete = Boolean(
    config.cloudflare?.deployedUrl || 
    config.cloudflare?.customDomain
  );

  const tasks = [
    {
      id: 1,
      title: "1. Logo & Görsel Kimlik Yükleme",
      shortTitle: "Logo Yükleme",
      time: "2 Dk",
      description: "İşletmenizin logosunu yükleyin veya saydam PNG logonuzu ekleyerek kurumsal kimliğinizi oluşturun.",
      isComplete: isLogoComplete,
      icon: Palette
    },
    {
      id: 2,
      title: "2. İletişim & WhatsApp Bilgilerini Girin",
      shortTitle: "İletişim Bilgileri",
      time: "2 Dk",
      description: "Müşterilerinizin size telefonla ve tek tıkla WhatsApp'tan ulaşabilmesi için irtibat numaralarınızı doğrulayın.",
      isComplete: isContactComplete,
      icon: Phone
    },
    {
      id: 3,
      title: "3. Yapay Zeka ile İçerik & Hizmetleri Üretin",
      shortTitle: "İçerik Üretimi",
      time: "3 Dk",
      description: "Yapay zeka motorunu çalıştırarak slogan, hakkımızda tanıtım yazısı ve hizmet detaylarını saniyeler içinde doldurun.",
      isComplete: isContentComplete,
      icon: Sparkles
    },
    {
      id: 4,
      title: "4. Web Sitesini Canlıya Alın & Yayınlayın",
      shortTitle: "Final Yayın",
      time: "3 Dk",
      description: "Sitenizi son kez önizleyin ve Cloudflare CDN üzerinden tek tıkla dünyaya yayınlayın.",
      isComplete: isPublishComplete,
      icon: Rocket
    }
  ];

  const completedCount = tasks.filter(t => t.isComplete).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hizliweb_first_login_seen", "true");
    }
    onClose();
  };

  const handleSaveQuickContact = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...config,
      phone: quickPhone,
      whatsapp: quickWhatsapp.replace(/[^0-9]/g, ""),
      address: quickAddress
    });
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold tracking-wider uppercase border border-amber-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              10 Dakikalık Hızlı Başlangıç Rehberi
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Toplam ~10 Dakika
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>🚀 Hoş Geldiniz! Web Sitenizi Hazırlayın</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aşağıdaki 4 temel adımı tamamlayarak profesyonel web sitenizi dakikalar içinde yayına hazır hale getirin.
          </p>

          {/* Progress Tracker */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>İlerleme Durumu:</span>
                <span className="text-amber-400">{completedCount} / {tasks.length} Görev Tamamlandı</span>
              </span>
              <span className={`font-mono ${progressPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                %{progressPercent}
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent === 100 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                    : "bg-gradient-to-r from-amber-500 to-amber-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Tasks Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {progressPercent === 100 && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-200 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Tebrikler! Tüm Adımlar Tamamlandı</h4>
                  <p className="text-xs text-emerald-400/80">Web siteniz yayına hazır. Hemen &quot;Statik Yayınla&quot; butonuna basabilirsiniz.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onDeploy();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors shrink-0 shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                <span>Canlıya Al</span>
              </button>
            </div>
          )}

          {tasks.map((task) => {
            const isExpanded = activeStepId === task.id;
            const Icon = task.icon;

            return (
              <div 
                key={task.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  task.isComplete 
                    ? "bg-slate-900/60 border-emerald-500/30" 
                    : isExpanded
                    ? "bg-slate-850 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Task Accordion Header */}
                <div 
                  onClick={() => setActiveStepId(isExpanded ? 0 : task.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      task.isComplete 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {task.isComplete ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${task.isComplete ? "text-emerald-300" : "text-white"}`}>
                          {task.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {task.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {task.isComplete ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tamamlandı</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Bekliyor</span>
                      </span>
                    )}

                    <div className="text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Action Workspace for Step */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-900/80 text-xs space-y-4">
                    {/* TASK 1: LOGO UPLOAD */}
                    {task.id === 1 && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-1 shrink-0">
                              {config.logo ? (
                                <img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <Building2 className="w-6 h-6 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">Mevcut Logo Durumu</p>
                              <p className="text-slate-400 text-[11px]">
                                {config.logo ? "✅ Özel logonuz yüklü" : "⚠️ Henüz özel bir logo yüklenmedi (Varsayılan metin kullanılıyor)"}
                              </p>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto">
                            <Base64ImageUpload
                              label="Logoyu Değiştir / Yükle"
                              value={config.logo || config.header?.logoImage || ""}
                              currentImage={config.logo || config.header?.logoImage || ""}
                              onChange={(b64) => {
                                onChange({
                                  ...config,
                                  logo: b64,
                                  logoUrl: b64,
                                  header: {
                                    ...config.header,
                                    logoType: b64 ? "image" : "icon",
                                    logoImage: b64
                                  }
                                });
                              }}
                              onImageChange={(b64) => {
                                onChange({
                                  ...config,
                                  logo: b64,
                                  logoUrl: b64,
                                  header: {
                                    ...config.header,
                                    logoType: b64 ? "image" : "icon",
                                    logoImage: b64
                                  }
                                });
                              }}
                              buttonText="Logo Dosyası Seç"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              onNavigateTab("design-structure");
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors flex items-center gap-1.5"
                          >
                            <span>Tüm Tasarım Ayarlarına Git</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveStepId(2)}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                          >
                            <span>Sonraki Adım: İletişim</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TASK 2: CONTACT DETAILS */}
                    {task.id === 2 && (
                      <form onSubmit={handleSaveQuickContact} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-300 mb-1">
                              Telefon Numarası (Arama İçin)
                            </label>
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                              <input
                                type="text"
                                value={quickPhone}
                                onChange={(e) => setQuickPhone(e.target.value)}
                                placeholder="0850 123 45 67 veya 0532 ..."
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-300 mb-1">
                              WhatsApp Sipariş / Destek Hattı
                            </label>
                            <div className="relative">
                              <MessageCircle className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                              <input
                                type="text"
                                value={quickWhatsapp}
                                onChange={(e) => setQuickWhatsapp(e.target.value)}
                                placeholder="905321234567"
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">
                            Açık Adres & Konum
                          </label>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                            <input
                              type="text"
                              value={quickAddress}
                              onChange={(e) => setQuickAddress(e.target.value)}
                              placeholder="Örn: Barbaros Mah. Atatürk Cad. No: 12 Kadıköy / İstanbul"
                              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              onNavigateTab("general");
                            }}
                            className="text-slate-400 hover:text-slate-200 underline text-xs"
                          >
                            Detaylı Firma & Sosyal Medya Ayarları
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5"
                            >
                              {contactSaved ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              <span>{contactSaved ? "Kaydedildi!" : "İletişimi Kaydet"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveStepId(3)}
                              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                            >
                              <span>Sonraki: İçerik</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* TASK 3: CONTENT GENERATION */}
                    {task.id === 3 && (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-2">
                          <p className="text-xs">
                            Yapay zekamız <strong>{config.companyName}</strong> için <strong>{config.city}</strong> bölgesine ve <strong>{config.sector}</strong> sektörüne uygun SEO dostu kurumsal metinleri, sloganları ve hizmet listesini otomatik yazar.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-800">✅ Slogan & Hero Başlığı</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800">✅ Kurumsal Tanıtım Yazısı</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800">✅ {config.services?.items?.length || 0} Hizmet Sayfası</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onTriggerAiContent();
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all flex items-center gap-2 shadow-md active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>⚡ Yapay Zeka ile Tüm İçerikleri Üret</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleClose();
                                onNavigateTab("services");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                            >
                              Hizmetleri İncele
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveStepId(4)}
                              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                            >
                              <span>Sonraki: Yayınla</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TASK 4: FINAL PUBLISH */}
                    {task.id === 4 && (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-200">Yayınlanacak Adres:</p>
                            <p className="text-amber-400 font-mono text-xs mt-0.5">
                              {config.cloudflare?.customDomain ? `https://${config.cloudflare.customDomain}` : `https://${config.cloudflare?.subdomain || 'firmam'}.hizliweb.site`}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-1">
                              Cloudflare Global CDN • SSL Sertifikası Dahil • 100% Statik Hız
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => {
                                handleClose();
                                onNavigateTab("connect-custom-domain");
                              }}
                              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5 text-blue-400" />
                              <span>Özel Alan Adı</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onPreview();
                              }}
                              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                            >
                              <Eye className="w-4 h-4 text-amber-400" />
                              <span>Önizle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleClose();
                                onDeploy();
                              }}
                              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                            >
                              <Rocket className="w-4 h-4" />
                              <span>🚀 Statik Yayınla</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Actions & Dismiss Option */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>İlk girişte bu kontrol listesini bir daha otomatik açma</span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              Kapat & Yönetim Masasına Dön
            </button>

            <button
              type="button"
              onClick={() => {
                handleClose();
                onDeploy();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-2 transition-all shadow-md"
            >
              <Rocket className="w-4 h-4" />
              <span>{progressPercent === 100 ? "Hemen Yayınla" : "Yayınlama Ekranına Git"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
