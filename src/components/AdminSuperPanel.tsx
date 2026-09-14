import React, { useState } from "react";
import { AdminPanelTab, SiteConfig, ThemeTemplate } from "../types";
import { TEMPLATES } from "../data/templates";
import { 
  BarChart3, 
  Layers, 
  Globe, 
  Users, 
  Settings, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  Cpu
} from "lucide-react";

interface AdminSuperPanelProps {
  currentConfig: SiteConfig;
  onImpersonateSite: (config: SiteConfig) => void;
  onOpenAiFactory: () => void;
}

export const AdminSuperPanel: React.FC<AdminSuperPanelProps> = ({
  currentConfig,
  onImpersonateSite,
  onOpenAiFactory
}) => {
  const [activeTab, setActiveTab] = useState<AdminPanelTab>("overview");
  const [edgeToken, setEdgeToken] = useState("edge_live_98a72b3c4d5e6f7g8h9i0j");
  const [isPurgingCache, setIsPurgingCache] = useState(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState(false);

  // Mock list of hosted client sites
  const [clientSites] = useState([
    {
      id: "site-1",
      name: "Yıldız 7/24 Oto Kurtarma",
      domain: "yildizotokurtarma.com.tr",
      subdomain: "yildiz-otokurtarma.hizliweb.me",
      sector: "Oto Çekici & Kurtarma",
      type: "Çok Sayfalı Kurumsal",
      status: "active",
      pageSpeed: 100,
      createdAt: "16 Ağustos 2026",
      plan: "Çok Sayfalı (₺2.490/yıl)"
    },
    {
      id: "site-2",
      name: "DentNova Diş Kliniği",
      domain: "dentnovaklinik.com",
      subdomain: "dentnova.hizliweb.me",
      sector: "Sağlık & Diş Hekimliği",
      type: "Ürün & Hizmet Kataloğu",
      status: "active",
      pageSpeed: 99,
      createdAt: "12 Ağustos 2026",
      plan: "Katalog & Randevu (₺3.490/yıl)"
    },
    {
      id: "site-3",
      name: "Demir Hukuk & Danışmanlık",
      domain: "demirhukuk.av.tr",
      subdomain: "demirhukuk.hizliweb.me",
      sector: "Hukuk Bürosu",
      type: "Çok Sayfalı Kurumsal",
      status: "active",
      pageSpeed: 100,
      createdAt: "08 Ağustos 2026",
      plan: "Çok Sayfalı (₺2.490/yıl)"
    },
    {
      id: "site-4",
      name: "MisPak Halı Yıkama",
      domain: "mispakhaliyikama.com",
      subdomain: "mispak.hizliweb.me",
      sector: "Temizlik & Fabrika",
      type: "Ürün & Fiyat Kataloğu",
      status: "active",
      pageSpeed: 100,
      createdAt: "01 Ağustos 2026",
      plan: "Katalog & Randevu (₺3.490/yıl)"
    },
    {
      id: "site-5",
      name: "Acil Çilingir & Kilit",
      domain: "acilcilingir.hizliweb.me",
      subdomain: "acilcilingir.hizliweb.me",
      sector: "Çilingir & Güvenlik",
      type: "Tek Sayfa (Landing)",
      status: "active",
      pageSpeed: 100,
      createdAt: "28 Temmuz 2026",
      plan: "Tek Sayfa Landing (₺1.490/yıl)"
    }
  ]);

  const handlePurgeGlobalCache = () => {
    setIsPurgingCache(true);
    setTimeout(() => {
      setIsPurgingCache(false);
      setCachePurgedSuccess(true);
      setTimeout(() => setCachePurgedSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Süper Yönetici (Admin) Paneli</h1>
            <p className="text-xs text-slate-400">HızlıWeb SaaS Motoru • Tüm Müşteri Siteleri & Global Anycast Edge Yönetimi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Global Anycast Edge: Çevrimiçi</span>
          </span>
        </div>
      </div>

      {/* Grid: Navigation & Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Admin Tabs Sidebar */}
        <div className="lg:col-span-3 space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Özeti & Metrikler</span>
          </button>

          <button
            onClick={() => setActiveTab("client-sites")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "client-sites"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Müşteri Siteleri Listesi</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
              {clientSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("template-factory")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "template-factory"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Şablon Fabrikası & AI</span>
          </button>

          <button
            onClick={() => setActiveTab("edge-settings")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "edge-settings"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Anycast CDN</span>
          </button>

          <button
            onClick={() => setActiveTab("pricing-plans")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "pricing-plans"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Paket & Fiyatlandırma</span>
          </button>
        </div>

        {/* Admin Body Content */}
        <div className="lg:col-span-9">
          {/* ==================== TAB 1: OVERVIEW METRICS ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Aktif Müşteri Sitesi</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">142 Adet</div>
                  <div className="text-xs text-emerald-600 font-bold mt-1">↑ %100 Çalışma Süresi</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Aylık Edge Bant Genişliği</div>
                  <div className="text-3xl font-black text-amber-600 mt-2">4.8 TB</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Sıfır Sunucu Maliyeti</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Ortalama Yanıt Hızı</div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">0.02 sn</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">100/100 PageSpeed</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Yıllık Yinelenen Gelir (ARR)</div>
                  <div className="text-3xl font-black text-purple-600 mt-2">₺348.000</div>
                  <div className="text-xs text-purple-700 font-semibold mt-1">Yüksek Kâr Marjı</div>
                </div>
              </div>

              {/* Serverless Comparison Chart */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg">Geleneksel vs HızlıWeb Altyapı Maliyet Karşılaştırması</h3>
                    <p className="text-xs text-slate-400">WordPress sunucuları 142 site için aylık $450+ tutarken, Global Edge üzerinde maliyet neredeyse $0'dır.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                    %98 Tasarruf
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="text-xs font-bold text-rose-400">Eski WordPress / PHP Mimarisi</div>
                    <div className="text-sm font-semibold text-slate-300">Yıllık Sunucu: ~₺180.000</div>
                    <div className="text-xs text-slate-400">Veritabanı çökmeleri, eklenti lisansları ve hacklenme kurtarma masrafları.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                    <div className="text-xs font-bold text-amber-400">HızlıWeb Statik + Global Edge Altyapısı</div>
                    <div className="text-sm font-semibold text-white">Yıllık Altyapı: ~₺0 (Ücretsiz Sınırlar)</div>
                    <div className="text-xs text-slate-300">Saf HTML dağıtımı, sıfır CPU harcaması ve sonsuz ölçeklenebilirlik.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: CLIENT SITES DIRECTORY ==================== */}
          {activeTab === "client-sites" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Müşteri Web Siteleri Dizini</h2>
                  <p className="text-xs text-slate-500 mt-1">Platformunuzda barındırılan tüm müşteri sitelerini yönetin ve panel girişlerini açın.</p>
                </div>
              </div>

              <div className="space-y-3">
                {clientSites.map((site) => (
                  <div key={site.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-black text-slate-900 text-sm">{site.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {site.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                        <span>🌐 {site.domain}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">⚡ {site.pageSpeed}/100</span>
                        <span>•</span>
                        <span>{site.plan}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          alert(`"${site.name}" paneline müşteri olarak geçiş yapılıyor.`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                      >
                        Müşteri Paneli Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: TEMPLATE FACTORY ==================== */}
          {activeTab === "template-factory" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Şablon Fabrikası & Sektör Türetme</h2>
                  <p className="text-xs text-slate-500 mt-1">Yapay zeka motoru ile saniyeler içinde yeni bir sektör için hazır şablon oluşturun.</p>
                </div>
                <button
                  onClick={onOpenAiFactory}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Şablon Üreticiyi Başlat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                    <img src={t.coverImage} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.sector}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ 100/100 PageSpeed Hazır</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: GLOBAL EDGE SETTINGS ==================== */}
          {activeTab === "edge-settings" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Global Anycast Edge CDN Ayarları</h2>
                <p className="text-xs text-slate-500 mt-1">Tüm müşteri sitelerinin statik HTML dağıtımını yöneten küresel CDN kuralları.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Global Edge CDN API Token</label>
                  <input
                    type="password"
                    value={edgeToken}
                    onChange={(e) => setEdgeToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-slate-50"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-900 text-sm">Global CDN Önbelleğini Temizle (Purge Cache)</div>
                      <div className="text-xs text-amber-700">Tüm 310+ Edge lokasyonundaki HTML ve CSS dosyalarını anında günceller.</div>
                    </div>
                    <button
                      onClick={handlePurgeGlobalCache}
                      disabled={isPurgingCache}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPurgingCache ? "animate-spin" : ""}`} />
                      <span>{isPurgingCache ? "Temizleniyor..." : "Tüm Önbelleği Temizle"}</span>
                    </button>
                  </div>

                  {cachePurgedSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                      ✅ 310+ Global Edge sunucusundaki önbellek başarıyla temizlendi!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: PRICING PLANS ==================== */}
          {activeTab === "pricing-plans" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Paket & Fiyatlandırma Yönetimi</h2>
                <p className="text-xs text-slate-500 mt-1">Müşterilerinize sunduğunuz paketlerin fiyatlarını ve özelliklerini yapılandırın.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Tek Sayfa Landing</div>
                  <input type="text" defaultValue="₺1.490 / Yıllık" className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900" />
                  <p className="text-[11px] text-slate-500">Acil hizmetler ve hızlı arama butonlu tek sayfa.</p>
                </div>

                <div className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-50/50 space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Çok Sayfalı Kurumsal</div>
                  <input type="text" defaultValue="₺2.490 / Yıllık" className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900" />
                  <p className="text-[11px] text-slate-500">Kurumsal, Hizmetler, Blog ve İletişim sayfaları.</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Ürün Kataloğu & WhatsApp</div>
                  <input type="text" defaultValue="₺3.490 / Yıllık" className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900" />
                  <p className="text-[11px] text-slate-500">Sepetsiz, tek tıkla WhatsApp siparişli katalog.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
