import React, { useState } from "react";
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
  Lock
} from "lucide-react";
import { TEMPLATES } from "../data/templates";

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
  const [selectedSpeedTab, setSelectedSpeedTab] = useState<"hizliweb" | "sitenizolsun" | "wordpress">("hizliweb");

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>Dünyanın En Hızlı Web Sitesi Altyapısı • Global Edge CDN Tabanlı</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            WordPress'in Hantallığına ve Kalitesiz Hazır Sitelere <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">Son Verin.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Sitenizolsun gibi kalitesiz paneller veya WordPress gibi sunucuya yük bindiren hantal yapılar yerine; 
            <strong> 0.02 saniyede açılan</strong>, sıfır veritabanı ile <strong>asla çökmeyen</strong>, yapay zeka destekli ultra hızlı statik web siteleri.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
            <button
              onClick={onStartWizard}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Wand2 className="w-5 h-5" />
              <span>Sihirbazla Hemen Başla (2 Dk)</span>
            </button>

            <button
              onClick={onOpenCustomerPanel}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Müşteri Paneli Girişi</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Fast Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-amber-400">0.02 sn</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Global Edge Yanıt Süresi</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-emerald-400">100 / 100</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Google PageSpeed Puanı</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-blue-400">310+</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Küresel Edge Lokasyonu</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-black text-purple-400">%0 Risk</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">Sıfır SQL / Asla Hacklenemez</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10-MINUTE ZERO TECH LAUNCH TIMELINE ==================== */}
      <section className="py-20 bg-slate-950 border-b border-slate-800 relative overflow-hidden">
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
                  Ücretsiz .hizliweb.site alan adınızı alın veya kendi alan adınızı bağlayın. 14 Gün İade Garantili güvenli ödemenizi yapın.
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
              onClick={onStartWizard}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Wand2 className="w-4 h-4" />
              <span>10 Dakikalık Sihirbazı Başlat</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== SPEED COMPARISON BENCHMARK ==================== */}
      <section className="py-20 bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Hız Karşılaştırması</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Neden Geleneksel Sistemlerden 100 Kat Daha Hızlıyız?
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Müşterilerinizin %53'ü 3 saniyeden uzun süren siteleri terk ediyor. HızlıWeb ile siteniz göz açıp kapayıncaya kadar hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* HızlıWeb Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 to-slate-900 border-2 border-amber-500/60 shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                👑 Bizim Sistemimiz
              </div>

              <div className="text-center py-4">
                <div className="text-2xl font-black text-white">HızlıWeb Engine</div>
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

            {/* SitenizOlsun Card */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 opacity-85">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-slate-300">SitenizOlsun vb.</div>
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
        </div>
      </section>

      {/* ==================== CORE ARCHITECTURE ADVANTAGES ==================== */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
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
      <section className="py-20 bg-slate-900 border-b border-slate-800">
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
                    onClick={() => onSelectTemplate(t.id)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Bu Şablonu Seç ve Düzenle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PACKAGES & PRICING (3-TIER STRUCTURE) ==================== */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Şeffaf 3 Kademeli Lisans</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              İhtiyacınıza Uygun HızlıWeb Paketini Seçin
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Yıllık sunucu masrafı veya veritabanı kilitlenmesi yok. 0.02s hız garantili statik mimari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Package 1: Single Website */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bireysel & Tekil İşletme</div>
                <h3 className="text-2xl font-black text-white mb-2">1 Web Sitesi</h3>
                <p className="text-slate-400 text-xs mb-6">Tek bir işletme veya şirket için tam donanımlı, ultra hızlı kurumsal web sitesi.</p>
                <div className="text-3xl font-black text-white mb-4">₺990 <span className="text-xs font-normal text-slate-400">/ Yıllık</span></div>
                
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 mb-6">
                  🌐 1 Adet Web Sitesi Barındırma
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">✓ Tek Sayfa veya Çok Sayfalı Kurumsal</li>
                  <li className="flex items-center gap-2">✓ Fotoğraflı Ürün & Fiyat Kataloğu</li>
                  <li className="flex items-center gap-2">✓ Kategori Filtreli Blog & Makale Modülü</li>
                  <li className="flex items-center gap-2">✓ Zengin Metin (Rich Text) Editörü</li>
                  <li className="flex items-center gap-2">✓ Global Anycast Edge 0.02s Statik Hız & SSL</li>
                  <li className="flex items-center gap-2">✓ Özel Müşteri Yönetim Paneli</li>
                </ul>
              </div>

              <button
                onClick={onStartWizard}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
              >
                1 Web Sitesi Başlat
              </button>
            </div>

            {/* Package 2: 3 Websites (Highlighted) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 to-slate-900 border-2 border-amber-500 shadow-2xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase">
                En Popüler • 3 Şirket
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Çoklu Şirket & Grup</div>
                <h3 className="text-2xl font-black text-white mb-2">3 Web Sitesi Paketi</h3>
                <p className="text-slate-400 text-xs mb-6">Birden fazla şirketi veya farklı markaları olan işletmeler için avantajlı paket.</p>
                <div className="text-3xl font-black text-amber-400 mb-4">₺2.490 <span className="text-xs font-normal text-slate-400">/ Yıllık</span></div>
                
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 mb-6">
                  🌐 3 Adet Bağımsız Web Sitesi
                </div>

                <ul className="space-y-3 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2">✓ 3 Farklı Şirket / Alan Adı Yönetimi</li>
                  <li className="flex items-center gap-2">✓ Ayrı Ayrı Müşteri Yönetim Panelleri</li>
                  <li className="flex items-center gap-2">✓ Gelişmiş Hero Slider & Bölüm Modülerliği</li>
                  <li className="flex items-center gap-2">✓ Zengin Metin & Çoklu Görsel Katalogları</li>
                  <li className="flex items-center gap-2">✓ Yapay Zeka ile Otomatik İçerik Üretimi</li>
                  <li className="flex items-center gap-2">✓ 7/24 Öncelikli WhatsApp & Telefon Desteği</li>
                </ul>
              </div>

              <button
                onClick={onStartWizard}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 transition-all"
              >
                3 Web Sitesi Başlat (2 Dk)
              </button>
            </div>

            {/* Package 3: Agency (10 Websites) */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Ajans & Web Tasarımcılar</div>
                <h3 className="text-2xl font-black text-white mb-2">Ajans Paketi (10 Site)</h3>
                <p className="text-slate-400 text-xs mb-6">Müşterilerine web sitesi satan ajanslar ve yazılımcılar için 10 adet site hakkı.</p>
                <div className="text-3xl font-black text-white mb-4">₺6.900 <span className="text-xs font-normal text-slate-400">/ Yıllık</span></div>
                
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300 mb-6">
                  🌐 10 Adet Web Sitesi Ekleme & Yönetme
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">✓ 10 Adet Müşteri Sitesi Oluşturma</li>
                  <li className="flex items-center gap-2">✓ Ajans Yönetim Paneli & Müşteri Devri</li>
                  <li className="flex items-center gap-2">✓ Sınırsız Statik Trafik & 0.02s Hız</li>
                  <li className="flex items-center gap-2">✓ Çoklu Görsel & Zengin Editör Desteği</li>
                  <li className="flex items-center gap-2">✓ Özel DNS & Global Edge Yapılandırması</li>
                </ul>
              </div>

              <button
                onClick={onStartWizard}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
              >
                Ajans Paketini Seç
              </button>
            </div>
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
              <div className="text-white font-bold">HızlıWeb.com.tr</div>
              <div>Dünyanın En Hızlı Web Sitesi Altyapısı</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenAdminPanel} className="hover:text-amber-400 transition-colors">
              👑 Yönetici (Admin) Girişi
            </button>
            <button onClick={onOpenCustomerPanel} className="hover:text-amber-400 transition-colors">
              👤 Müşteri Paneli
            </button>
            <span>© {new Date().getFullYear()} HızlıWeb Tüm Hakları Saklıdır.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
