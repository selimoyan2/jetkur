import React, { useState } from "react";
import { SiteConfig, SocialMediaLinks } from "../../types";
import {
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  ExternalLink,
  Check,
  Sparkles,
  Eye,
  Layout,
  Globe,
  Trash2,
  Info,
  CheckCircle2,
  Calendar,
  Clock
} from "lucide-react";

interface SocialMediaManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onOpenPreview?: () => void;
  onNavigateToScheduler?: () => void;
  onNavigateToFeed?: () => void;
}

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  config,
  onChange,
  onOpenPreview,
  onNavigateToScheduler,
  onNavigateToFeed
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const socialMedia: SocialMediaLinks = {
    instagram: config.socialMedia?.instagram ?? config.footer?.instagram ?? "",
    linkedin: config.socialMedia?.linkedin ?? config.footer?.linkedin ?? "",
    twitter: config.socialMedia?.twitter ?? config.footer?.twitter ?? "",
    facebook: config.socialMedia?.facebook ?? config.footer?.facebook ?? "",
    youtube: config.socialMedia?.youtube ?? config.footer?.youtube ?? "",
    showInHeader: config.socialMedia?.showInHeader ?? (config.header?.showSocials !== false),
    showInFooter: config.socialMedia?.showInFooter ?? (config.footer?.showSocials !== false)
  };

  const handleUpdate = (updatedSocials: Partial<SocialMediaLinks>) => {
    const nextSocials: SocialMediaLinks = {
      ...socialMedia,
      ...updatedSocials
    };

    const nextConfig: SiteConfig = {
      ...config,
      socialMedia: nextSocials,
      header: {
        ...config.header,
        showSocials: nextSocials.showInHeader !== false
      },
      footer: {
        ...config.footer,
        showSocials: nextSocials.showInFooter !== false,
        instagram: nextSocials.instagram,
        linkedin: nextSocials.linkedin,
        twitter: nextSocials.twitter,
        facebook: nextSocials.facebook,
        youtube: nextSocials.youtube
      }
    };

    onChange(nextConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const cleanHandle = (val: string) => val.trim().replace(/^@/, "");

  const handleAutoFill = () => {
    const slug = config.companyName
      ? config.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "firmaniz";

    handleUpdate({
      instagram: socialMedia.instagram || `https://instagram.com/${slug}`,
      linkedin: socialMedia.linkedin || `https://linkedin.com/company/${slug}`,
      twitter: socialMedia.twitter || `https://x.com/${slug}`,
      showInHeader: true,
      showInFooter: true
    });
  };

  const activeCount = [
    socialMedia.instagram,
    socialMedia.linkedin,
    socialMedia.twitter
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  Sosyal Medya Bağlantıları (Social Media Links)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  {activeCount} / 3 Aktif Hesap
                </span>
                {saveToast && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Kaydedildi</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Instagram, LinkedIn ve Twitter profillerinizi ekleyin. Web sitenizin hem üst başlığında (Header) hem de alt bilgi kısmında (Footer) otomatik olarak şık ikonlarla gösterilsin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {onNavigateToFeed && (
              <button
                type="button"
                onClick={onNavigateToFeed}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Canlı Instagram & X akışını yapılandırın"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Canlı Sosyal Akış →</span>
              </button>
            )}
            {onNavigateToScheduler && (
              <button
                type="button"
                onClick={onNavigateToScheduler}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Otomatik paylaşımları ve ürün linklerini zamanlayın"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Paylaşım Zamanlayıcı →</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Firma unvanına göre otomatik taslak oluştur"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Otomatik Örnek Doldur</span>
            </button>
            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canlı Önizle</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Jump Banner to Social Post Scheduler */}
        {onNavigateToScheduler && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-indigo-500/30 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-300">
                  Otomatik Paylaşım Zamanlayıcı (Post Scheduler)
                </div>
                <div className="text-[11px] text-slate-300">
                  Ürünlerinize doğrudan yönlendiren otomatik sosyal medya duyurularını ve kampanya iletilerini önceden sıraya koyun.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToScheduler}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Zamanlayıcıyı Aç →
            </button>
          </div>
        )}

        {/* Display Settings (Header & Footer Switches) */}
        <div className="pt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Layout className="w-3.5 h-3.5 text-slate-500" />
            <span>Görünürlük ve Konum Tercihleri</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Switch */}
            <div
              onClick={() => handleUpdate({ showInHeader: !socialMedia.showInHeader })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                socialMedia.showInHeader
                  ? "bg-slate-50/80 border-slate-300 ring-1 ring-slate-900/10"
                  : "bg-slate-50/30 border-slate-200 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    socialMedia.showInHeader ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    🔝
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Üst Menüde Göster (Header)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Navigasyon ve iletişim butonlarının hemen yanında ikonlar yer alır.
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={socialMedia.showInHeader}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdate({ showInHeader: e.target.checked });
                  }}
                  className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Switch */}
            <div
              onClick={() => handleUpdate({ showInFooter: !socialMedia.showInFooter })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                socialMedia.showInFooter
                  ? "bg-slate-50/80 border-slate-300 ring-1 ring-slate-900/10"
                  : "bg-slate-50/30 border-slate-200 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    socialMedia.showInFooter ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    🔻
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Alt Bilgide Göster (Footer)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Sitenin en altındaki şirket tanıtım blokunda sosyal medya ikonları yer alır.
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={socialMedia.showInFooter}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdate({ showInFooter: e.target.checked });
                  }}
                  className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Social Profiles (Instagram, LinkedIn, Twitter/X) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sosyal Medya Profil Linkleri</h3>
            <p className="text-xs text-slate-500">Tam profil linkinizi veya kullanıcı adınızı girin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* 1. INSTAGRAM */}
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Instagram</span>
                  <span className="text-[10px] text-slate-500 block">instagram.com/kullaniciadi</span>
                </div>
              </div>

              {socialMedia.instagram ? (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-pink-500" />
                  <span>Profili Aç</span>
                </a>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Eklenmedi</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">
                  instagram.com/
                </span>
                <input
                  type="text"
                  value={
                    socialMedia.instagram?.startsWith("https://instagram.com/")
                      ? socialMedia.instagram.replace("https://instagram.com/", "")
                      : socialMedia.instagram?.startsWith("http://") || socialMedia.instagram?.startsWith("https://")
                      ? socialMedia.instagram
                      : socialMedia.instagram || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) {
                      handleUpdate({ instagram: "" });
                    } else if (val.startsWith("http://") || val.startsWith("https://")) {
                      handleUpdate({ instagram: val });
                    } else {
                      handleUpdate({ instagram: `https://instagram.com/${cleanHandle(val)}` });
                    }
                  }}
                  placeholder="firmaniz"
                  className="w-full pl-32 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white font-mono"
                />
              </div>

              {socialMedia.instagram && (
                <button
                  type="button"
                  onClick={() => handleUpdate({ instagram: "" })}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. LINKEDIN */}
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-xs">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">LinkedIn</span>
                  <span className="text-[10px] text-slate-500 block">Şirket sayfası veya profil bağlantısı</span>
                </div>
              </div>

              {socialMedia.linkedin ? (
                <a
                  href={socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  <span>Profili Aç</span>
                </a>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Eklenmedi</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={socialMedia.linkedin || ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) {
                      handleUpdate({ linkedin: "" });
                    } else if (val.startsWith("http://") || val.startsWith("https://")) {
                      handleUpdate({ linkedin: val });
                    } else {
                      handleUpdate({ linkedin: `https://linkedin.com/company/${cleanHandle(val)}` });
                    }
                  }}
                  placeholder="https://linkedin.com/company/firmaniz veya https://linkedin.com/in/adiniz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-mono"
                />
              </div>

              {socialMedia.linkedin && (
                <button
                  type="button"
                  onClick={() => handleUpdate({ linkedin: "" })}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3. TWITTER / X */}
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Twitter className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Twitter / X</span>
                  <span className="text-[10px] text-slate-500 block">x.com/kullaniciadi</span>
                </div>
              </div>

              {socialMedia.twitter ? (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-900" />
                  <span>Profili Aç</span>
                </a>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Eklenmedi</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">
                  x.com/
                </span>
                <input
                  type="text"
                  value={
                    socialMedia.twitter?.startsWith("https://x.com/")
                      ? socialMedia.twitter.replace("https://x.com/", "")
                      : socialMedia.twitter?.startsWith("https://twitter.com/")
                      ? socialMedia.twitter.replace("https://twitter.com/", "")
                      : socialMedia.twitter?.startsWith("http://") || socialMedia.twitter?.startsWith("https://")
                      ? socialMedia.twitter
                      : socialMedia.twitter || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) {
                      handleUpdate({ twitter: "" });
                    } else if (val.startsWith("http://") || val.startsWith("https://")) {
                      handleUpdate({ twitter: val });
                    } else {
                      handleUpdate({ twitter: `https://x.com/${cleanHandle(val)}` });
                    }
                  }}
                  placeholder="firmaniz"
                  className="w-full pl-20 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white font-mono"
                />
              </div>

              {socialMedia.twitter && (
                <button
                  type="button"
                  onClick={() => handleUpdate({ twitter: "" })}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Extra Profiles (Facebook & YouTube) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Ek Sosyal Ağlar (İsteğe Bağlı)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={socialMedia.facebook || ""}
                onChange={(e) => handleUpdate({ facebook: e.target.value.trim() })}
                placeholder="https://facebook.com/sayfaniz"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">YouTube URL</label>
              <input
                type="text"
                value={socialMedia.youtube || ""}
                onChange={(e) => handleUpdate({ youtube: e.target.value.trim() })}
                placeholder="https://youtube.com/@kanaliniz"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Visual Preview Simulation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Canlı Görünüm Simülasyonu</h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Ziyaretçilerinizin göreceği gerçek tasarım
          </span>
        </div>

        {/* Mock Header */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span>🔝</span>
              <span>Web Sitesi Üst Menüsü (Header)</span>
            </span>
            <span className={socialMedia.showInHeader ? "text-emerald-700 font-bold" : "text-slate-400"}>
              {socialMedia.showInHeader ? "Görünür" : "Gizli"}
            </span>
          </div>

          <div className="p-4 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                {config.companyName ? config.companyName.charAt(0) : "W"}
              </div>
              <span className="text-xs font-extrabold text-slate-900">
                {config.companyName || "Firma Adı"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Header Social Icons */}
              {socialMedia.showInHeader && (
                <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-slate-200">
                  {socialMedia.instagram && (
                    <div
                      title="Instagram"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {socialMedia.linkedin && (
                    <div
                      title="LinkedIn"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {socialMedia.twitter && (
                    <div
                      title="Twitter / X"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {!socialMedia.instagram && !socialMedia.linkedin && !socialMedia.twitter && (
                    <span className="text-[10px] text-slate-400 italic">Profil eklenmedi</span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                WhatsApp
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold">
                Ara
              </div>
            </div>
          </div>
        </div>

        {/* Mock Footer */}
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>🔻</span>
              <span className="text-white">Web Sitesi Alt Bilgisi (Footer)</span>
            </span>
            <span className={socialMedia.showInFooter ? "text-emerald-400 font-bold" : "text-slate-500"}>
              {socialMedia.showInFooter ? "Görünür" : "Gizli"}
            </span>
          </div>

          <div className="p-4 bg-slate-950 text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">
                {config.companyName || "Firma Adı"}
              </span>
              <p className="text-[11px] text-slate-500 max-w-sm line-clamp-1">
                {config.footer?.aboutText || config.slogan}
              </p>
            </div>

            {socialMedia.showInFooter ? (
              <div className="flex items-center gap-2">
                {socialMedia.instagram && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-pink-600 flex items-center justify-center transition-all cursor-pointer">
                    <Instagram className="w-4 h-4" />
                  </div>
                )}
                {socialMedia.linkedin && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all cursor-pointer">
                    <Linkedin className="w-4 h-4" />
                  </div>
                )}
                {socialMedia.twitter && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer">
                    <Twitter className="w-4 h-4" />
                  </div>
                )}
                {!socialMedia.instagram && !socialMedia.linkedin && !socialMedia.twitter && (
                  <span className="text-[10px] text-slate-600 italic">Profil linki eklenmedi</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-slate-600 italic">Footer sosyal ikonları devre dışı</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
