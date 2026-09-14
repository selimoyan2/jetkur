import React, { useState } from "react";
import { ThemeTemplate, ColorPalette } from "../types";
import { Sparkles, Plus, RefreshCw, CheckCircle, ArrowRight, Layers, Palette } from "lucide-react";

interface AiTemplateFactoryProps {
  onAddCustomTemplate: (template: ThemeTemplate) => void;
  onSelectAndEdit: (template: ThemeTemplate) => void;
}

export const AiTemplateFactory: React.FC<AiTemplateFactoryProps> = ({
  onAddCustomTemplate,
  onSelectAndEdit,
}) => {
  const [nicheName, setNicheName] = useState("");
  const [styleMood, setStyleMood] = useState("Modern, Güven Verici & Kurumsal");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<ThemeTemplate | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const popularNiches = [
    "Kedi Oteli & Pet Kuaför",
    "Yat Kiralama & Boğaz Turu",
    "Diyetisyen & Online Beslenme Danışmanı",
    "Düğün & Dış Çekim Fotoğrafçısı",
    "Tıkanıklık Açma & Su Kaçağı Tespiti",
    "Estetik & Plastik Cerrahi Kliniği",
    "Anaokulu & Özel Kreş",
    "Oto Ekspertiz & Muayene Öncesi Kontrol",
    "Psikolog & Aile Terapisi Merkezi"
  ];

  const handleGenerate = async (customNiche?: string) => {
    const targetNiche = customNiche || nicheName;
    if (!targetNiche) return;

    setIsLoading(true);
    setSuccessMsg("");
    setGeneratedTemplate(null);

    try {
      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheName: targetNiche,
          styleMood,
        }),
      });

      const data = await res.json();
      if (data.success && data.template) {
        const t = data.template;

        const newTpl: ThemeTemplate = {
          id: `tpl-${Date.now()}`,
          name: t.name || `${targetNiche} Hazır Sitesi`,
          sector: t.sector || targetNiche,
          category: "Özel Sektör",
          description: t.description || `${targetNiche} sektöründeki işletmeler için yüksek dönüşümlü ve SEO uyumlu hazır web sitesi.`,
          badge: t.badge || "AI Yeni",
          icon: "Briefcase",
          coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          defaultColors: {
            id: `pal-${Date.now()}`,
            name: `${targetNiche} Özel Paleti`,
            primary: t.palette?.primary || "#2563eb",
            primaryDark: t.palette?.primaryDark || "#1d4ed8",
            secondary: t.palette?.secondary || "#f8fafc",
            accent: t.palette?.accent || "#f59e0b",
            text: t.palette?.text || "#0f172a",
            bg: "#ffffff",
          },
          defaultData: {
            companyName: `Lider ${targetNiche}`,
            sector: targetNiche,
            slogan: "Sektörde Güvenilir ve Kaliteli Hizmet",
            city: "İstanbul & Tüm Türkiye",
            phone: "0555 000 00 00",
            whatsapp: "905550000000",
            email: "info@sirket.com",
            address: "Merkez Mah. İş Merkezi Kat:3",
            workingHours: "Haftanın 7 Günü",
            hero: {
              badge: `✨ Profesyonel ${targetNiche}`,
              title: `${targetNiche} Hizmetinde Doğru Adres`,
              subtitle: "Yılların deneyimi ve uzman kadromuzla yanınızdayız. Hemen ücretsiz fiyat teklifi alın.",
              ctaPrimaryText: "Hemen İletişime Geç",
              ctaPrimaryLink: "tel:05550000000",
              ctaSecondaryText: "WhatsApp Bilgi Al",
              ctaSecondaryLink: "https://wa.me/905550000000",
              bgImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
              stats: [
                { label: "Memnun Müşteri", value: "3.500+" },
                { label: "Hizmet Yılı", value: "8+ Yıl" },
                { label: "Müşteri Puanı", value: "4.9/5" },
              ],
            },
            about: {
              enabled: true,
              badge: "Hakkımızda",
              title: `Uzman Kadromuzla ${targetNiche} Alanında Öncüyüz`,
              content: `Firmamız ${targetNiche} sektöründe müşteri memnuniyetini en üst düzeyde tutarak kaliteli ve güvenilir çözümler üretmektedir.`,
              yearsExperience: "8+",
              completedProjects: "3.500+",
              bullets: [
                "Sertifikalı ve Deneyimli Uzman Kadro",
                "Şeffaf ve Ekonomik Fiyat Politikası",
                "Zamanında ve Eksiksiz Teslimat Garantisi",
                "7/24 Kesintisiz Destek Hattı",
              ],
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
            },
            services: {
              enabled: true,
              badge: "Hizmetlerimiz",
              title: "Sunduğumuz Çözümler",
              subtitle: "İhtiyacınıza özel profesyonel hizmet paketleri.",
              items: [
                { id: "s1", title: "Standart Hizmet Paketi", desc: "Hızlı ve ekonomik temel hizmet seçeneği.", price: "Uygun Fiyat" },
                { id: "s2", title: "Premium Kapsamlı Uygulama", desc: "Tam kapsamlı, garantili ve öncelikli hizmet.", price: "Özel Teklif" },
                { id: "s3", title: "Periyodik Bakım & Takip", desc: "Sürekli kalite ve danışmanlık desteği.", price: "Abonelik" },
              ],
            },
            faqs: {
              enabled: true,
              badge: "SSS",
              title: "Sık Sorulan Sorular",
              subtitle: "Hizmetlerimiz hakkında merak edilenler.",
              items: [
                { id: "f1", q: "Fiyat teklifi nasıl alabilirim?", a: "Telefon veya WhatsApp hattımız üzerinden 5 dakika içinde net teklif alabilirsiniz." },
                { id: "f2", q: "Hizmetleriniz garantili mi?", a: "Evet, tüm işlemlerimiz kurumsal firma güvencemiz altındadır." },
              ],
            },
          },
        };

        setGeneratedTemplate(newTpl);
        onAddCustomTemplate(newTpl);
        setSuccessMsg(`"${newTpl.name}" başarıyla üretildi ve Şablon Kataloğuna eklendi!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white p-8 rounded-2xl border border-purple-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Admin Şablon Fabrikası</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Yapay Zeka ile 10 Saniyede Yeni Sektör Şablonu Üretin
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Sitenizolsun gibi yüzlerce şablon sunmak için aylarca tasarımcı çalıştırmanıza gerek yok.
          İstediğiniz meslek veya sektör adını yazın; yapay zeka sektörün renk psikolojisini, kurumsal metinlerini ve hizmet bloklarını otomatik oluştursun.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sektör / Meslek Adı
            </label>
            <input
              type="text"
              placeholder="Örn: Halı Yıkama, Su Tesisatı, Diyetisyen, Kreş..."
              value={nicheName}
              onChange={(e) => setNicheName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tasarım & Renk Havası (Mood)
            </label>
            <select
              value={styleMood}
              onChange={(e) => setStyleMood(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none"
            >
              <option value="Modern, Güven Verici & Kurumsal">Modern, Güven Verici & Kurumsal</option>
              <option value="Lüks, VIP & Prestij">Lüks, VIP & Prestij (Koyu & Altın Tonlar)</option>
              <option value="Canlı, Sıcak & Acil Hizmet">Canlı, Sıcak & Acil Hizmet (Turuncu/Kırmızı)</option>
              <option value="Minimalist, Ferah & Sağlık">Minimalist, Ferah & Sağlık (Yeşil/Turkuaz)</option>
            </select>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 block">Popüler Niş Önerileri (Tek Tıkla Üret):</span>
          <div className="flex flex-wrap gap-2">
            {popularNiches.map((niche) => (
              <button
                key={niche}
                onClick={() => {
                  setNicheName(niche);
                  handleGenerate(niche);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                + {niche}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !nicheName.trim()}
          className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Yapay Zeka Şablonu Tasarlıyor ve Kodluyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Yapay Zeka ile Yeni Şablon Oluştur</span>
            </>
          )}
        </button>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Generated Template Preview Card */}
      {generatedTemplate && (
        <div className="bg-white p-6 rounded-2xl border-2 border-purple-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                Yeni Üretilen Şablon
              </span>
              <span className="text-xs text-slate-400 font-mono">{generatedTemplate.id}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: generatedTemplate.defaultColors.primary }}
              ></div>
              <span className="text-xs font-bold text-slate-700">
                {generatedTemplate.defaultColors.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{generatedTemplate.name}</h3>
              <p className="text-xs text-slate-600 mt-1">{generatedTemplate.description}</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => onSelectAndEdit(generatedTemplate)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Bu Şablonla Müşteri Paneline Geç</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
