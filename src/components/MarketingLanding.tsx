import React, { useState, useEffect } from "react";
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Gauge, 
  Layers, 
  ShoppingBag, 
  Phone, 
  Server, 
  Wand2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock,
  MessageSquare,
  Clock
} from "lucide-react";
import { TEMPLATES } from "../data/templates";
import { 
  getJetkurHomepageSettings, 
  getJetkurPackages, 
  JetkurHomepageSettings, 
  JetkurPricingPackage 
} from "../utils/platformSettingsStorage";
import { useAuth } from "../context/AuthContext";

interface MarketingLandingProps {
  onStartWizard: () => void;
  onOpenCustomerPanel: () => void;
  onOpenAdminPanel: () => void;
  onOpenCatalog: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onStartWizard,
  onOpenCustomerPanel,
  onOpenAdminPanel,
  onOpenCatalog,
  onSelectTemplate
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedSpeedTab, setSelectedSpeedTab] = useState<"jetkur" | "sitenizolsun" | "wordpress">("jetkur");
  const [homepageSettings, setHomepageSettings] = useState<JetkurHomepageSettings>(getJetkurHomepageSettings());
  const [packages, setPackages] = useState<JetkurPricingPackage[]>(getJetkurPackages());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setHomepageSettings(getJetkurHomepageSettings());
    };
    const handlePackagesUpdate = () => {
      setPackages(getJetkurPackages());
    };
    window.addEventListener("jetkur_homepage_settings_updated", handleSettingsUpdate);
    window.addEventListener("jetkur_packages_updated", handlePackagesUpdate);
    return () => {
      window.removeEventListener("jetkur_homepage_settings_updated", handleSettingsUpdate);
      window.removeEventListener("jetkur_packages_updated", handlePackagesUpdate);
    };
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Top Announcement Bar (Configured via SuperAdmin) */}
      {homepageSettings.announcementActive && homepageSettings.announcementText && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 py-2 px-4 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
          <span>{homepageSettings.announcementText}</span>
        </div>
      )}

      {/* ==================== HERO SECTION ==================== */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>{homepageSettings.badgeText}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.18] mb-6">
            <span className="block">{homepageSettings.heroTitle}</span>
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              {homepageSettings.heroHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            {homepageSettings.heroSubtitle}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-6">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("register");
                } else {
                  onStartWizard();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{!isAuthenticated ? "14 Günlük Ücretsiz Denemeyi Başlat" : homepageSettings.primaryCtaText}</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  const el = document.getElementById("speed-benchmark");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  onOpenCustomerPanel();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{!isAuthenticated ? "0.02s Hız Testini İncele" : homepageSettings.secondaryCtaText}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Reassurance Strip for Visitors */}
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium mb-12">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>14 gün boyunca tüm özellikler açık</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-4 h-4 shrink-0" />
                <span>E-posta ve şifrenizle anında başlayın</span>
              </div>
            </div>
          )}

          {/* Fast Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-amber-400">{homepageSettings.stats.edgeResponseTime}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Global Edge Yanıt Süresi</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-emerald-400">{homepageSettings.stats.pageSpeedScore}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Google PageSpeed Puanı</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-blue-400">{homepageSettings.stats.edgeLocations}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Küresel Edge Lokasyonu</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-purple-400">{homepageSettings.stats.crashRisk}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Çökme &amp; Hacklenme Riski</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10-MINUTE ZERO TECH LAUNCH TIMELINE ==================== */}
      <section id="timeline" className="py-20 bg-slate-950 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Sıfır Bilgisayar Bilgisiyle 10 Dakika Sözü</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Kahveniz Soğumadan Web Siteniz Dünyaya Açılır
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Web tasarımcılarına haftalarca beklemek, binlerce lira sunucu parası ödemek yok. Adım adım sadece 4 kolay aşama:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-white mb-2">Bilgilerinizi Girin (2 Dk)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Firma adınızı ve telefonunuzu yazın. Veya WhatsApp mesajınızı/kartvizit metninizi tek tıkla yapıştırın, yapay zeka otomatik ayıklasın.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-amber-400/80">✨ Sihirli Metin Ayrıştırıcı</div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-white mb-2">Tasarımı Seçin (1 Dk)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sektörünüze özel hazırlanmış renk ve sayfa yapılarından hoşunuza gideni tek tıkla seçin.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-emerald-400/80">🎨 100+ Hazır Sektör Teması</div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-white mb-2">Alan Adı & Ödeme (1 Dk)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ücretsiz .jetkur.me alan adınızı alın veya kendi alan adınızı bağlayın. 14 Gün İade Garantili güvenli ödemenizi yapın.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-blue-400/80">🔒 14 Gün Para İade Güvencesi</div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-500/50 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm mb-4 shadow-md">
                  04
                </div>
                <h3 className="text-base font-bold text-white mb-2">0.02s Hızla Canlıda! 🚀</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Siteniz 310+ Cloudflare Edge sunucusuna anında dağıtılır. Dükkanınız için QR Kodlu Masa Kartvizitiniz de hazır!
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-amber-300">⚡ Süper Kolay Esnaf Paneli</div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("register");
                } else {
                  onStartWizard();
                }
              }}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{!isAuthenticated ? "14 Günlük Ücretsiz Denemeyi Başlat" : "10 Dakikalık Sihirbazı Başlat"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== SPEED COMPARISON BENCHMARK ==================== */}
      <section id="speed-benchmark" className="py-20 bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Hız Karşılaştırması</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Neden Geleneksel Sistemlerden 100 Kat Daha Hızlıyız?
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Müşterilerinizin %53'ü 3 saniyeden uzun süren siteleri terk ediyor. JetKur ile siteniz göz açıp kapayıncaya kadar hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* JetKur Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 to-slate-900 border-2 border-amber-500/60 shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                👑 Bizim Sistemimiz
              </div>

              <div className="text-center py-4">
                <div className="text-2xl font-black text-white">JetKur Engine</div>
                <div className="text-5xl font-black text-amber-400 my-4">0.02 sn</div>
                <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-1.5 px-3 rounded-full inline-block">
                  ⚡ 100/100 Google PageSpeed
                </div>
              </div>

              <ul className="space-y-3 pt-6 border-t border-slate-800 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Saf Statik HTML + CSS (Sıfır PHP/MySQL)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>310+ Global Anycast Edge Lokasyonunda Barındırma</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ziyaretçi sayısı 1 milyona çıksa bile çökmez</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Arama ve AI Botlarına tam uyumlu</span>
                </li>
              </ul>
            </div>

            {/* Traditional Site Builder Card */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 opacity-85">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-slate-300">Eski Nesil Hazır Siteler</div>
                <div className="text-5xl font-black text-slate-400 my-4">1.80 sn</div>
                <div className="text-xs text-amber-400 font-bold bg-amber-500/10 py-1.5 px-3 rounded-full inline-block">
                  ⚠️ 45-60 PageSpeed Puanı
                </div>
              </div>

              <ul className="space-y-3 pt-6 border-t border-slate-800 text-xs font-medium text-slate-400">
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Eski nesil paylaşımlı ucuz sunucular</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Karmaşık ve hantal yönetim panelleri</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Mobil cihazlarda yavaş açılış ve kayma</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Modern WhatsApp & SEO entegrasyonu yok</span>
                </li>
              </ul>
            </div>

            {/* WordPress Card */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 opacity-85">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-slate-300">Hantal WordPress</div>
                <div className="text-5xl font-black text-rose-400 my-4">2.40+ sn</div>
                <div className="text-xs text-rose-400 font-bold bg-rose-500/10 py-1.5 px-3 rounded-full inline-block">
                  ❌ Sürekli Bakım & Güvenlik Açığı
                </div>
              </div>

              <ul className="space-y-3 pt-6 border-t border-slate-800 text-xs font-medium text-slate-400">
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Sürekli güncellenmesi gereken 25+ eklenti</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Veritabanı şişmesi ve sunucu çökmesi</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Sürekli virüs ve hacklenme riski</span>
                </li>
                <li className="flex items-center gap-2 text-rose-300">
                  <span>✕</span>
                  <span>Aylık yüksek sunucu ve bakım masrafı</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Curiosity & 14-Day Free Trial Conversion Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-slate-900 border-2 border-amber-500/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>0.02s Farkını Kendi Gözlerinizle Görün</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Dünyanın En Hızlı Web Sitesi Altyapısını 14 Gün Deneyin
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Kredi kartı gerekmez. E-posta ve şifrenizle 10 saniyede kayıt olun, anında kendi ultra hızlı sitenizi oluşturun ve hız testinizi yapın.
              </p>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("register");
                } else {
                  onStartWizard();
                }
              }}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>14 Günlük Ücretsiz Denemeyi Başlat</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== CORE ARCHITECTURE ADVANTAGES ==================== */}
      <section id="architecture" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">SaaS Altyapımız</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Siz İşi Büyütün, Altyapıyı Düşünmeyin
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Müşteriniz teknik hiçbir şey bilmek zorunda kalmaz. Sistem arka planda en güncel bulut teknolojilerini otomatik yürütür.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Akıllı Sektör Sihirbazı</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Müşteri yüzlerce karmaşık tema arasında kaybolmaz. Sektörünü ve unvanını girer; en uygun tasarım, renkler ve metinler saniyeler içinde hazır gelir.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sepetsiz WhatsApp Kataloğu</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Karmaşık sepet veya ödeme entegrasyonuna gerek olmadan; ürün görseli, fiyat ve açıklaması ile müşteriler doğrudan WhatsApp'tan tek tıkla sipariş verir.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Global Edge Otomatik Dağıtım</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Panelden "Yayınla" dendiğinde site anında statik HTML olarak derlenir ve Global Anycast Edge CDN ağı üzerinden anında dünyanın 300+ şehrine dağıtılır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LIVE TEMPLATE SHOWCASE ==================== */}
      <section id="templates" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Hazır Sektör Temaları</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
                En Çok Tercih Edilen Sektörel Şablonlar
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Oto çekiciden diş kliniğine, nakliyattan halı yıkamaya kadar hazır ve test edilmiş şablonlar.
              </p>
            </div>
            <button
              onClick={onOpenCatalog}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all self-start md:self-auto flex items-center gap-2"
            >
              <span>Tüm Şablonları Gör</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-16/10 relative overflow-hidden bg-slate-900">
                    <img
                      src={t.coverImage}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black shadow-md">
                      {t.sector}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold">
                      ⚡ 100/100
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onSelectTemplate(t.id);
                        openAuthModal("register");
                      } else {
                        onSelectTemplate(t.id);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{!isAuthenticated ? "14 Gün Ücretsiz Başla" : "Bu Şablonu Seç ve Düzenle"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PACKAGES & PRICING (DYNAMIC JETKUR PACKAGES) ==================== */}
      <section id="pricing" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Şeffaf Lisans Modeli</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              İhtiyacınıza Uygun JetKur Paketini Seçin
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Yıllık sunucu masrafı veya veritabanı kilitlenmesi yok. 0.02s hız garantili statik mimari ile 14 gün ücretsiz deneyin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const isHighlighted = pkg.isPopular;
              return (
                <div 
                  key={pkg.id}
                  className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all ${
                    isHighlighted
                      ? "bg-gradient-to-b from-amber-500/10 to-slate-900 border-2 border-amber-500 shadow-2xl"
                      : "bg-slate-900/60 border border-slate-800"
                  }`}
                >
                  {pkg.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase ${
                      isHighlighted 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {pkg.badge}
                    </div>
                  )}

                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      isHighlighted ? "text-amber-400" : "text-slate-400"
                    }`}>
                      {pkg.category}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">{pkg.description}</p>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={`text-3xl font-black ${isHighlighted ? "text-amber-400" : "text-white"}`}>
                        ₺{pkg.annualPrice.toLocaleString("tr-TR")}
                      </span>
                      <span className="text-xs font-normal text-slate-400">/ Yıllık</span>
                      {pkg.monthlyEquivalent > 0 && (
                        <span className="text-[11px] text-slate-500 font-mono ml-auto">
                          (~₺{pkg.monthlyEquivalent}/ay)
                        </span>
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl text-xs font-bold mb-6 ${
                      isHighlighted
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                        : "bg-slate-950 border border-slate-800 text-amber-400"
                    }`}>
                      🌐 {pkg.siteLimit} Adet Bağımsız Web Sitesi
                    </div>

                    <ul className="space-y-3 text-xs text-slate-300 mb-8">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal("register");
                      } else {
                        onStartWizard();
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      isHighlighted
                        ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-orange-500/20"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    {!isAuthenticated ? `${pkg.name} • 14 Gün Ücretsiz Başla` : `${pkg.name} ile Başla`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <div className="text-white font-bold">JetKur.com.tr</div>
              <div>Dünyanın En Hızlı Web Sitesi Altyapısı</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("admin");
                } else {
                  onOpenAdminPanel();
                }
              }} 
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              👑 Süper Admin
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("login");
                } else {
                  onOpenCustomerPanel();
                }
              }} 
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              👤 Müşteri Girişi
            </button>
            <span>© {new Date().getFullYear()} JetKur Tüm Hakları Saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
