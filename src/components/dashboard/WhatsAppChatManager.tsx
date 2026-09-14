import React, { useState } from "react";
import { SiteConfig, WhatsAppWidgetConfig } from "../../types";
import {
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Check,
  ExternalLink,
  Eye,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  HelpCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react";

interface WhatsAppChatManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const PRESET_MESSAGES = [
  {
    title: "Genel Bilgi & Fiyat",
    text: "Merhaba, web sitenizden ulaşıyorum. Hizmetleriniz ve fiyatlarınız hakkında detaylı bilgi almak istiyorum."
  },
  {
    title: "Hızlı Teklif Talebi",
    text: "Merhaba, projem/ihtiyacım için net fiyat teklifi ve detaylı bilgilendirme rica ediyorum."
  },
  {
    title: "Acil Destek & Konum",
    text: "Merhaba, acil desteğe ihtiyacım var. Bulunduğum konuma en kısa sürede hizmet verebilir misiniz?"
  },
  {
    title: "Randevu & Rezervasyon",
    text: "Merhaba, uygun bir gün ve saat için randevu oluşturmak istiyorum. Yardımcı olabilir misiniz?"
  }
];

export const WhatsAppChatManager: React.FC<WhatsAppChatManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  const currentWidget: WhatsAppWidgetConfig = {
    enabled: config.whatsappWidget?.enabled ?? (Boolean(config.whatsapp) && config.whatsapp.trim().length > 0),
    phoneNumber: config.whatsappWidget?.phoneNumber || config.whatsapp || "905320000000",
    position: config.whatsappWidget?.position || "bottom-right",
    buttonStyle: config.whatsappWidget?.buttonStyle || "floating-pill",
    buttonText: config.whatsappWidget?.buttonText || "WhatsApp İle Yazın",
    defaultMessage:
      config.whatsappWidget?.defaultMessage ||
      `Merhaba ${config.companyName}, web sitenizden ulaşıyorum. Fiyat ve detaylı bilgi almak istiyorum.`,
    agentName: config.whatsappWidget?.agentName || `${config.companyName} Müşteri Temsilcisi`,
    agentSubtitle: config.whatsappWidget?.agentSubtitle || "Genellikle birkaç dakika içinde yanıt verir",
    popupEnabled: config.whatsappWidget?.popupEnabled ?? true,
    callToAction: config.whatsappWidget?.callToAction || "Merhaba 👋 Size nasıl yardımcı olabiliriz?",
    showBadgeDot: config.whatsappWidget?.showBadgeDot ?? true
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [interactiveSimOpen, setInteractiveSimOpen] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // Normalize phone digits
  const cleanPhone = (currentWidget.phoneNumber || "").replace(/\D/g, "");
  const isValidPhone = cleanPhone.length >= 10;
  const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentWidget.defaultMessage || "")}`;

  const handleUpdateWidget = (updates: Partial<WhatsAppWidgetConfig>) => {
    const nextWidget: WhatsAppWidgetConfig = {
      ...currentWidget,
      ...updates
    };

    // Keep config.whatsapp in sync if phone number changed
    const nextConfig: SiteConfig = {
      ...config,
      whatsappWidget: nextWidget,
      whatsapp: updates.phoneNumber !== undefined ? updates.phoneNumber : config.whatsapp
    };

    onChange(nextConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleCopyLink = () => {
    if (!directWaUrl) return;
    navigator.clipboard.writeText(directWaUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Yüzen WhatsApp Chat Widget</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>WhatsApp Canlı Destek & İletişim Butonu</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              İşletme telefon numaranızı girerek web sitenizin tüm sayfalarında sağ/sol altta yüzen,
              ziyaretçilerin tek tıkla doğrudan WhatsApp üzerinden size ulaşmasını sağlayan akıllı sohbet butonunu yönetin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Sitede Canlı Gör</span>
              </button>
            )}

            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
                isValidPhone
                  ? "bg-[#25D366] hover:bg-[#20bd5a] text-slate-950"
                  : "bg-slate-800 text-slate-500 pointer-events-none"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Numarayı Test Et ↗</span>
            </a>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Widget Durumu</div>
            <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentWidget.enabled ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span>{currentWidget.enabled ? "Aktif (Sitede Açık)" : "Pasif (Gizli)"}</span>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Bağlı İşletme Numarası</div>
            <div className="font-bold font-mono text-emerald-300 mt-0.5 truncate">
              {currentWidget.phoneNumber ? `+${cleanPhone}` : "Tanımlanmadı"}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Görünüm & Konum</div>
            <div className="font-bold text-white mt-0.5">
              {currentWidget.position === "bottom-left" ? "Alt Sol" : "Alt Sağ"} •{" "}
              {currentWidget.buttonStyle === "floating-circle" ? "Kompakt Daire" : "Genişletilmiş"}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Sohbet Karşılama Penceresi</div>
            <div className="font-bold text-emerald-300 mt-0.5">
              {currentWidget.popupEnabled ? "Etkin (Mini Chat)" : "Doğrudan Link"}
            </div>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>WhatsApp widget ayarları anında kaydedildi ve sitenize yansıtıldı!</span>
        </div>
      )}

      {/* Main Grid: Settings (Left) + Interactive Live Simulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Master Activation Toggle Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Yüzen WhatsApp Sohbet Butonu</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktif edildiğinde web sitenizin tüm sayfalarının sağ veya sol altında sabit kalır.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={currentWidget.enabled}
                  onChange={(e) => handleUpdateWidget({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {!currentWidget.enabled && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Widget şu anda <strong>pasif</strong> konumda. Sitenizde yüzen WhatsApp butonu görünmeyecektir.
                  Etkinleştirmek için yukarıdaki butonu açabilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* 2. Business Phone Number Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  İşletme WhatsApp Numarası
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                wa.me standardı
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp Numarası (Ülke Koduyla Birlikte) *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 font-mono text-xs flex items-center gap-1 pointer-events-none select-none">
                  <span>📱</span>
                  <span>+</span>
                </div>
                <input
                  type="text"
                  value={currentWidget.phoneNumber}
                  onChange={(e) => handleUpdateWidget({ phoneNumber: e.target.value })}
                  placeholder="905321234567"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  {isValidPhone ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Geçerli numara formatı: +{cleanPhone}
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Lütfen geçerli bir telefon numarası giriniz (Örn: 905320000000)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentWidget.phoneNumber.startsWith("90")) {
                        handleUpdateWidget({ phoneNumber: "90" + cleanPhone.replace(/^0+/, "") });
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    +90 TR Ekle
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedLink ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Kopyalandı
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        Direkt Linki Kopyala
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                * Bu numara web sitenizdeki tek tıkla sipariş, blog danışma ve acil çağrı WhatsApp butonlarıyla otomatik olarak senkronize edilir.
              </p>
            </div>
          </div>

          {/* 3. Button Appearance & Placement Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Konum ve Buton Stili
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Ekrandaki Konumu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateWidget({ position: "bottom-right" })}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex flex-col justify-between h-20 transition-all ${
                      currentWidget.position !== "bottom-left"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold">Alt Sağ</span>
                      {currentWidget.position !== "bottom-left" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Standart & En Çok Tercih Edilen
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateWidget({ position: "bottom-left" })}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex flex-col justify-between h-20 transition-all ${
                      currentWidget.position === "bottom-left"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold">Alt Sol</span>
                      {currentWidget.position === "bottom-left" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Sağda başka butonlar varsa ideal
                    </div>
                  </button>
                </div>
              </div>

              {/* Button Style Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Buton Şekli & Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateWidget({ buttonStyle: "floating-pill" })}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex flex-col justify-between h-20 transition-all ${
                      currentWidget.buttonStyle !== "floating-circle"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold">Genişletilmiş Hap</span>
                      {currentWidget.buttonStyle !== "floating-circle" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      İkon + Metin etiketi sürekli açık
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateWidget({ buttonStyle: "floating-circle" })}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex flex-col justify-between h-20 transition-all ${
                      currentWidget.buttonStyle === "floating-circle"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold">Kompakt Daire</span>
                      {currentWidget.buttonStyle === "floating-circle" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Minimal dairesel simge
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Button Label & Badge Dot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Buton Üzerindeki Metin
                </label>
                <input
                  type="text"
                  value={currentWidget.buttonText}
                  onChange={(e) => handleUpdateWidget({ buttonText: e.target.value })}
                  placeholder="WhatsApp İle Yazın"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Çevrimiçi Bildirim Noktası</div>
                    <div className="text-[11px] text-slate-500">Yeşil nabız animasyonu</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={currentWidget.showBadgeDot}
                      onChange={(e) => handleUpdateWidget({ showBadgeDot: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Pre-filled Greeting Message & Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Otomatik Başlangıç Mesajı
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Kullanıcı tıkladığında hazır gelir
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Varsayılan Karşılama / Teklif Metni
              </label>
              <textarea
                rows={3}
                value={currentWidget.defaultMessage}
                onChange={(e) => handleUpdateWidget({ defaultMessage: e.target.value })}
                placeholder="Merhaba, web sitenizden ulaşıyorum..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Preset Message Chips */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Hazır Şablonlar (Tek Tıkla Seç):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_MESSAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateWidget({ defaultMessage: preset.text })}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 flex items-center justify-between">
                      <span>{preset.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                      {preset.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Interactive Chat Popup Modal Options */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Sohbet Karşılama Penceresi (Mini Chat Bubble)
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={currentWidget.popupEnabled}
                  onChange={(e) => handleUpdateWidget({ popupEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {currentWidget.popupEnabled ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temsilci / Şirket Başlığı
                  </label>
                  <input
                    type="text"
                    value={currentWidget.agentName}
                    onChange={(e) => handleUpdateWidget({ agentName: e.target.value })}
                    placeholder="Firma Müşteri Temsilcisi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Yanıt Durumu Metni
                  </label>
                  <input
                    type="text"
                    value={currentWidget.agentSubtitle}
                    onChange={(e) => handleUpdateWidget({ agentSubtitle: e.target.value })}
                    placeholder="Genellikle birkaç dakika içinde yanıt verir"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baloncuk İçindeki Karşılama Mesajı
                  </label>
                  <input
                    type="text"
                    value={currentWidget.callToAction}
                    onChange={(e) => handleUpdateWidget({ callToAction: e.target.value })}
                    placeholder="Merhaba 👋 Size nasıl yardımcı olabiliriz?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Pencere kapalı olduğunda ziyaretçiler butona tıkladığında doğrudan WhatsApp uygulamasına veya Web WhatsApp'a yönlendirilir.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {/* Simulation Header */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold pl-2">
                    Canlı Simülasyon
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                    {currentWidget.enabled ? "Canlıda Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInteractiveSimOpen(!interactiveSimOpen)}
                    className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    {interactiveSimOpen ? "Pencereyi Gizle" : "Pencereyi Aç"}
                  </button>
                </div>
              </div>

              {/* Simulation Viewport Area */}
              <div className="relative h-[480px] bg-slate-100 p-4 overflow-hidden flex flex-col justify-between select-none">
                {/* Simulated Dummy Website Background */}
                <div className="space-y-3 opacity-60 pointer-events-none">
                  <div className="h-6 bg-slate-300 rounded-lg w-1/3" />
                  <div className="h-28 bg-white rounded-2xl p-4 shadow-xs space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    <div className="h-3 bg-slate-200 rounded-md w-2/3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-white rounded-xl shadow-xs" />
                    <div className="h-20 bg-white rounded-xl shadow-xs" />
                  </div>
                </div>

                {/* Floating Widget In Simulation */}
                {currentWidget.enabled ? (
                  <div
                    className={`absolute bottom-4 ${
                      currentWidget.position === "bottom-left" ? "left-4 items-start" : "right-4 items-end"
                    } flex flex-col z-30 transition-all duration-300`}
                  >
                    {/* Simulated Chat Popup */}
                    {currentWidget.popupEnabled && interactiveSimOpen && (
                      <div className="w-[280px] sm:w-[310px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-3 animate-in fade-in zoom-in-95 duration-200">
                        {/* Popup Header */}
                        <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded-full bg-white/20 p-1 flex items-center justify-center shrink-0 border border-white/30">
                              <MessageSquare className="w-4 h-4 text-white" />
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 border border-[#128C7E] rounded-full" />
                            </div>
                            <div>
                              <div className="font-bold text-xs leading-tight truncate max-w-[170px]">
                                {currentWidget.agentName || config.companyName}
                              </div>
                              <div className="text-[10px] text-emerald-100 flex items-center gap-1 font-medium mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                                <span className="truncate max-w-[160px]">{currentWidget.agentSubtitle}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInteractiveSimOpen(false)}
                            className="text-white/80 hover:text-white text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Chat Body */}
                        <div className="p-3 bg-[#E5DDD5]/30 space-y-2">
                          <div className="bg-white rounded-xl rounded-tl-none p-2.5 shadow-xs border border-slate-100 space-y-1 text-slate-800 max-w-[90%]">
                            <div className="text-[10px] font-bold text-[#128C7E]">
                              {currentWidget.agentName}
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-700">
                              {currentWidget.callToAction}
                            </p>
                            <div className="text-[9px] text-slate-400 text-right font-mono">Şimdi</div>
                          </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="p-2.5 bg-white border-t border-slate-100 space-y-1.5">
                          <input
                            type="text"
                            readOnly
                            value={currentWidget.defaultMessage}
                            className="w-full px-2.5 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-none"
                          />
                          <a
                            href={directWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp'ta Başla</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Main Floating Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setInteractiveSimOpen(!interactiveSimOpen)}
                      className={`relative bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black ${
                        currentWidget.buttonStyle === "floating-circle"
                          ? "p-3 rounded-full"
                          : "py-3 px-4 rounded-full"
                      } shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer`}
                    >
                      {currentWidget.showBadgeDot && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
                        </span>
                      )}
                      <MessageSquare className="w-5 h-5 fill-slate-950 shrink-0" />
                      {currentWidget.buttonStyle !== "floating-circle" && (
                        <span className="text-xs tracking-wide">
                          {currentWidget.buttonText}
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center text-center p-6">
                    <div className="bg-white/90 p-4 rounded-2xl shadow-sm border border-slate-200 max-w-xs space-y-2">
                      <div className="text-2xl">💤</div>
                      <div className="text-xs font-bold text-slate-800">Widget Şu An Kapalı</div>
                      <p className="text-[11px] text-slate-500">
                        Yüzen WhatsApp butonunu aktifleştirmek için sol paneldeki anahtarı açabilirsiniz.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Footer Note */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloudflare Edge & Tüm Cihazlarla Uyumlu</span>
                </span>
                <span className="text-slate-500 font-mono">0.02s Gecikmesiz</span>
              </div>
            </div>

            {/* Quick Helper Tips Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs text-slate-600 shadow-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Neden WhatsApp Chat Widget?</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>%40+ Daha Yüksek Dönüşüm:</strong> Ziyaretçiler form doldurmak yerine doğrudan WhatsApp ile yazmayı tercih eder.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Sıfır Harici Kod:</strong> Yavaşlatan üçüncü parti iframe veya JS scriptleri içermez; sitenizin 100/100 PageSpeed hızını korur.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Mobil & Masaüstü Uyumlu:</strong> Mobilde WhatsApp uygulamasını, masaüstünde WhatsApp Web'i anında başlatır.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
