import React, { useState, useEffect } from "react";
import { SiteConfig, ThemeTemplate, SiteStructureType, ColorPalette } from "../types";
import { TEMPLATES, COLOR_PALETTES } from "../data/templates";
import { createDefaultSiteConfig } from "../data/mockData";
import { slugifySubdomain, sanitizeSlugInput } from "../utils/url";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Building2, 
  ShoppingBag, 
  Globe, 
  Phone, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Wand2, 
  RotateCcw,
  CreditCard,
  QrCode,
  Share2,
  Clock,
  Check,
  FileText,
  Lock,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Download,
  AlertCircle,
  Rocket
} from "lucide-react";

interface CustomerWizardProps {
  onComplete: (config: SiteConfig) => void;
  onCancelToCatalog?: () => void;
}

export const CustomerWizard: React.FC<CustomerWizardProps> = ({
  onComplete,
  onCancelToCatalog
}) => {
  // 5 Step Flow: 1: Info -> 2: Design -> 3: Domain -> 4: Payment -> 5: Published & Celebration
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Live 10-Minute Timer (countdown or elapsed)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Business Profile & Magic Paste
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("Oto Kurtarma & Çekici");
  const [city, setCity] = useState("İstanbul");
  const [phone, setPhone] = useState("0532 000 00 00");
  const [whatsapp, setWhatsapp] = useState("905320000000");
  const [address, setAddress] = useState("Atatürk Mah. Sanayi Cad. No:14");
  
  // Magic Text Paste Box
  const [magicText, setMagicText] = useState("");
  const [isMagicParsing, setIsMagicParsing] = useState(false);
  const [showMagicBox, setShowMagicBox] = useState(false);

  // Step 2: Site Model & Design
  const [siteModel, setSiteModel] = useState<SiteStructureType>("multi-page");
  const [enableCatalog, setEnableCatalog] = useState(true);
  const [enableBlog, setEnableBlog] = useState(true);
  const [matchedTemplate, setMatchedTemplate] = useState<ThemeTemplate>(TEMPLATES[0]);
  const [selectedColorPalette, setSelectedColorPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [slogan, setSlogan] = useState("Şehrin En Hızlı ve Güvenilir Hizmeti");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Step 3: Domain Setup (0-tech)
  const [domainChoice, setDomainChoice] = useState<"subdomain" | "custom">("subdomain");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [customDomainInput, setCustomDomainInput] = useState("");

  // Step 4: Checkout & Payment
  const [selectedPackage, setSelectedPackage] = useState<"starter" | "pro" | "agency">("starter");
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "monthly">("annual");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "trial">("card");
  const [cardNumber, setCardNumber] = useState("4543 •••• •••• 9281");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("382");
  const [cardHolder, setCardHolder] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Generated Site Config
  const [finalConfig, setFinalConfig] = useState<SiteConfig | null>(null);

  // Quick sector suggestions
  const SECTOR_SUGGESTIONS = [
    { label: "Oto Çekici & Yol Yardım", templateId: "oto-kurtarma", paletteIndex: 2 },
    { label: "Diş Kliniği & Sağlık", templateId: "dis-hekimligi", paletteIndex: 1 },
    { label: "Avukatlık & Hukuk Bürosu", templateId: "hukuk-avukat", paletteIndex: 3 },
    { label: "Halı & Koltuk Yıkama", templateId: "hali-yikama", paletteIndex: 4 },
    { label: "Evden Eve Nakliyat", templateId: "evden-eve-nakliyat", paletteIndex: 0 },
    { label: "Kombi & Klima Servisi", templateId: "kombi-klima-servisi", paletteIndex: 0 },
    { label: "Diyetisyen & Beslenme", templateId: "dis-hekimligi", paletteIndex: 1 },
    { label: "Güzellik & Kuaför Salonu", templateId: "dis-hekimligi", paletteIndex: 6 },
    { label: "Tesisatçı & Su Kaçağı", templateId: "kombi-klima-servisi", paletteIndex: 0 },
  ];

  const handleSelectSector = (item: typeof SECTOR_SUGGESTIONS[0]) => {
    setSector(item.label);
    const found = TEMPLATES.find(t => t.id === item.templateId) || TEMPLATES[0];
    setMatchedTemplate(found);
    setSelectedColorPalette(COLOR_PALETTES[item.paletteIndex] || COLOR_PALETTES[0]);
  };

  // Magic Text / WhatsApp AI Parser
  const handleMagicParse = () => {
    if (!magicText.trim()) return;
    setIsMagicParsing(true);

    setTimeout(() => {
      // Basic AI heuristic extractor
      const text = magicText;
      
      // Extract phone
      const phoneMatch = text.match(/(?:0|\+90)?[ -]?(?:5\d{2})[ -]?\d{3}[ -]?\d{2}[ -]?\d{2}/);
      if (phoneMatch) {
        setPhone(phoneMatch[0]);
        setWhatsapp(phoneMatch[0].replace(/[^0-9]/g, ""));
      }

      // Check for common cities
      const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin"];
      for (const c of cities) {
        if (text.toLowerCase().includes(c.toLowerCase())) {
          setCity(c);
          break;
        }
      }

      // Auto detect sector keywords
      if (text.toLowerCase().includes("çekici") || text.toLowerCase().includes("kurtarma") || text.toLowerCase().includes("oto")) {
        setSector("Oto Çekici & Yol Yardım");
        setMatchedTemplate(TEMPLATES.find(t => t.id === "oto-kurtarma") || TEMPLATES[0]);
      } else if (text.toLowerCase().includes("diş") || text.toLowerCase().includes("klinik") || text.toLowerCase().includes("doktor")) {
        setSector("Diş Kliniği & Sağlık");
        setMatchedTemplate(TEMPLATES.find(t => t.id === "dis-hekimligi") || TEMPLATES[0]);
      } else if (text.toLowerCase().includes("avukat") || text.toLowerCase().includes("hukuk") || text.toLowerCase().includes("danışmanlık")) {
        setSector("Avukatlık & Hukuk Bürosu");
        setMatchedTemplate(TEMPLATES.find(t => t.id === "hukuk-avukat") || TEMPLATES[0]);
      } else if (text.toLowerCase().includes("nakliyat") || text.toLowerCase().includes("taşımacılık") || text.toLowerCase().includes("evden eve")) {
        setSector("Evden Eve Nakliyat");
        setMatchedTemplate(TEMPLATES.find(t => t.id === "evden-eve-nakliyat") || TEMPLATES[0]);
      } else if (text.toLowerCase().includes("halı") || text.toLowerCase().includes("yıkama") || text.toLowerCase().includes("temizlik")) {
        setSector("Halı & Koltuk Yıkama");
        setMatchedTemplate(TEMPLATES.find(t => t.id === "hali-yikama") || TEMPLATES[0]);
      }

      // Extract Company Name (first line or first words)
      const lines = text.split("\n").filter(l => l.trim().length > 0);
      if (lines.length > 0 && !companyName) {
        setCompanyName(lines[0].slice(0, 40));
      }

      setIsMagicParsing(false);
      setShowMagicBox(false);
    }, 600);
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("Lütfen firma unvanınızı giriniz.");
      return;
    }
    
    // Auto populate subdomain
    const autoSub = slugifySubdomain(companyName);
    setSubdomainInput(autoSub);

    // Match best template based on sector
    const match = TEMPLATES.find(t => 
      t.sector.toLowerCase().includes(sector.toLowerCase()) || 
      sector.toLowerCase().includes(t.name.toLowerCase())
    ) || TEMPLATES[0];
    
    setMatchedTemplate(match);
    setSelectedColorPalette(match.defaultColors || COLOR_PALETTES[0]);
    setSlogan(`${city} Bölgesinde 10+ Yıllık Güvenle Kesintisiz ${sector}`);
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    setStep(3);
  };

  const handleProceedToStep4 = () => {
    if (!subdomainInput.trim()) {
      setSubdomainInput(slugifySubdomain(companyName));
    }
    setStep(4);
  };

  const handleAiAutoTune = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setSlogan(`${city} Genelinde 7/24 Kesintisiz, Güvenilir ve Garantili ${sector}`);
      setIsAiGenerating(false);
    }, 500);
  };

  const handleProcessCheckoutAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaidSuccess(true);

      const baseConfig = createDefaultSiteConfig(matchedTemplate);
      const chosenSub = slugifySubdomain(subdomainInput.trim() || companyName);

      const finalCreatedConfig: SiteConfig = {
        ...baseConfig,
        companyName: companyName || matchedTemplate.defaultData.companyName || "Firma Adı",
        sector: sector || matchedTemplate.sector,
        city: city || "Türkiye",
        phone: phone || "0532 000 00 00",
        whatsapp: whatsapp || "905320000000",
        address: address || "Merkez Mah. No:1",
        slogan: slogan,
        siteType: siteModel,
        palette: selectedColorPalette,
        products: {
          ...baseConfig.products,
          enabled: enableCatalog
        },
        blog: {
          ...baseConfig.blog,
          enabled: enableBlog
        },
        cloudflare: {
          ...baseConfig.cloudflare,
          subdomain: chosenSub,
          customDomain: domainChoice === "custom" && customDomainInput ? customDomainInput : undefined,
          status: "deployed",
          deployedUrl: domainChoice === "custom" && customDomainInput ? `https://${customDomainInput}` : `https://${chosenSub}.hizliweb.site`,
          lastDeployedAt: new Date().toLocaleTimeString("tr-TR")
        },
        hero: {
          ...baseConfig.hero,
          title: `${companyName} ile Profesyonel ${sector}`,
          subtitle: slogan
        },
        about: {
          ...baseConfig.about,
          title: `${companyName} Hakkında`,
          content: `${companyName} olarak ${city} bölgesinde uzun yıllardır kaliteli, güvenilir ve uygun fiyatlı ${sector} çözümleri sunuyoruz.`
        }
      };

      setFinalConfig(finalCreatedConfig);
      setStep(5);
    }, 1200);
  };

  const handleFinishAndOpenPanel = () => {
    if (finalConfig) {
      onComplete(finalConfig);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* 10-Minute Top Live Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>10 Dakikada Canlı Web Sitesi</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Sıfır Teknik Bilgi
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Formu doldurun, ödemenizi yapın ve siteniz 0.02s hızla anında yayına girsin.
            </div>
          </div>
        </div>

        {/* Live Timer Counter */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Geçen Süre</div>
            <div className="text-sm font-mono font-black text-amber-400">{formatTimer(elapsedSeconds)} / 10:00</div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 px-1">
          <span className={step >= 1 ? "text-amber-600 font-black" : ""}>1. Bilgiler</span>
          <span className={step >= 2 ? "text-amber-600 font-black" : ""}>2. Tasarım</span>
          <span className={step >= 3 ? "text-amber-600 font-black" : ""}>3. Alan Adı</span>
          <span className={step >= 4 ? "text-amber-600 font-black" : ""}>4. Ödeme</span>
          <span className={step >= 5 ? "text-emerald-600 font-black" : ""}>5. Canlı Yayın 🚀</span>
        </div>

        {/* 5-Step Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          <div className={`h-2.5 rounded-full transition-all ${step >= 1 ? "bg-amber-500" : "bg-slate-200"}`} />
          <div className={`h-2.5 rounded-full transition-all ${step >= 2 ? "bg-amber-500" : "bg-slate-200"}`} />
          <div className={`h-2.5 rounded-full transition-all ${step >= 3 ? "bg-amber-500" : "bg-slate-200"}`} />
          <div className={`h-2.5 rounded-full transition-all ${step >= 4 ? "bg-amber-500" : "bg-slate-200"}`} />
          <div className={`h-2.5 rounded-full transition-all ${step >= 5 ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-slate-200"}`} />
        </div>
      </div>

      {/* ==================== STEP 1: BUSINESS BASICS ==================== */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                1. Firmanızı Tanıtın
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Sadece işletme adı, telefon ve sektörünüzü girin. Yapay zeka tüm sayfaları ve metinleri sizin için dolduracak.
              </p>
            </div>

            {/* Quick Magic Text Fill Button */}
            <button
              type="button"
              onClick={() => setShowMagicBox(!showMagicBox)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{showMagicBox ? "Normal Forma Dön" : "Sihirli Kartvizit / Metin Yapıştır"}</span>
            </button>
          </div>

          {/* Magic Paste Box */}
          {showMagicBox && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Wand2 className="w-4 h-4 text-amber-600" />
                <span>Kartvizitinizi, WhatsApp Tanıtımınızı veya İşletme Bilgilerinizi Buraya Yapıştırın:</span>
              </div>
              <textarea
                rows={3}
                value={magicText}
                onChange={(e) => setMagicText(e.target.value)}
                placeholder="Örnek: Yıldız Oto Kurtarma Kadıköy İstanbul, 0532 111 22 33, 7/24 oto çekici, akü takviye ve yol yardım hizmeti..."
                className="w-full p-3 rounded-xl border border-amber-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
              <button
                type="button"
                onClick={handleMagicParse}
                disabled={isMagicParsing || !magicText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
              >
                {isMagicParsing ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Bilgileri Otomatik Ayrıştır ve Doldur</span>
              </button>
            </div>
          )}

          <form onSubmit={handleProceedToStep2} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                İşletme / Firma Unvanı *
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Yıldız 7/24 Oto Kurtarma, DentNova Diş Kliniği..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sektörünüz / Faaliyet Alanınız *
              </label>
              <input
                type="text"
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Örn: Oto Çekici, Halı Yıkama, Diş Kliniği..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none mb-3"
              />

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-medium self-center mr-1">Popüler Sektörler:</span>
                {SECTOR_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSector(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      sector === s.label
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hizmet Verilen Şehir / Bölge
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Örn: İstanbul & Çevre İller"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Telefon / WhatsApp Numarası *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setWhatsapp(e.target.value.replace(/[^0-9]/g, ""));
                    }}
                    placeholder="0532 000 00 00"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Açık Adres / Dükkan Konumu
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Örn: Atatürk Mah. Sanayi Cad. No:14 Kadıköy / İstanbul"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {onCancelToCatalog ? (
                <button
                  type="button"
                  onClick={onCancelToCatalog}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Geri Dön
                </button>
              ) : <div />}

              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all group"
              >
                <span>İleri: Tasarım & Şablon (Adım 2)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== STEP 2: SITE STRUCTURE & DESIGN ==================== */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Yapay Zeka Sektör Eşleştirmesi Tamamlandı</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              2. Web Sitenizin Tasarımı ve Sayfa Modeli
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              İşletmenize özel hazır şablon, kurumsal renkler ve yapay zeka sloganı seçildi.
            </p>
          </div>

          {/* Template Card Showcase */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-5/12 aspect-16/10 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0">
              <img
                src={matchedTemplate.coverImage}
                alt={matchedTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {matchedTemplate.sector}
                </span>
                <span className="text-xs text-slate-400 font-medium">⚡ 0.02s Edge CDN</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">{companyName || matchedTemplate.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{slogan}</p>

              {/* Color Palette Selector */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Kurumsal Renk Teması:
                </div>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setSelectedColorPalette(pal)}
                      title={pal.name}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        selectedColorPalette.id === pal.id ? "scale-125 border-slate-900 shadow-md" : "border-white hover:scale-110"
                      }`}
                      style={{ backgroundColor: pal.primary }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Generated Slogan / Value Prop */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Yapay Zeka Slogan & Başlık</span>
              </span>
              <button
                type="button"
                onClick={handleAiAutoTune}
                disabled={isAiGenerating}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAiGenerating ? "animate-spin" : ""}`} />
                <span>Yeniden Yaz</span>
              </button>
            </div>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-amber-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Site Model Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSiteModel("multi-page")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                siteModel === "multi-page"
                  ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Çok Sayfalı Kurumsal Web Sitesi</span>
                </div>
                {siteModel === "multi-page" && <Check className="w-4 h-4 text-amber-600 font-bold" />}
              </div>
              <p className="text-xs text-slate-600">
                Hakkımızda, Hizmet Detayları, Ürün Kataloğu, Blog ve İletişim alt sayfaları ile Google'da maksimum SEO gücü.
              </p>
            </div>

            <div
              onClick={() => setSiteModel("single-page")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                siteModel === "single-page"
                  ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Tek Sayfa (Landing Page)</span>
                </div>
                {siteModel === "single-page" && <Check className="w-4 h-4 text-amber-600 font-bold" />}
              </div>
              <p className="text-xs text-slate-600">
                Tüm bilgilerin tek sayfada toplandığı, doğrudan telefonla arama ve acil WhatsApp dönüşümü odaklı hızlı site.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Geri
            </button>
            <button
              type="button"
              onClick={handleProceedToStep3}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all group"
            >
              <span>İleri: Alan Adı Seçimi (Adım 3)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 3: DOMAIN SETUP (ZERO-TECH) ==================== */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              3. Alan Adınızı (Domain) Belirleyin
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Hiçbir teknik ayar bilmenize gerek yok. İster anında ücretsiz alt alan adınızla yayına çıkın, ister kendi alan adınızı ekleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Option A: Instant Free Subdomain */}
            <div
              onClick={() => setDomainChoice("subdomain")}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                domainChoice === "subdomain"
                  ? "border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase">
                    Anında Canlı & Ücretsiz
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  1. Ücretsiz JetKur Alan Adı (0 Ayar)
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  DNS veya sunucu ayarı beklemeden saniyeler içinde SSL sertifikalı olarak yayına girer.
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-300 flex items-center gap-1 text-xs font-mono">
                  <span className="text-slate-400">https://</span>
                  <input
                    type="text"
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(sanitizeSlugInput(e.target.value))}
                    placeholder="firmam"
                    className="font-bold text-amber-600 outline-none w-32"
                  />
                  <span className="text-slate-500">.hizliweb.site</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Teknik bilgi gerektirmez, hemen çalışır</span>
              </div>
            </div>

            {/* Option B: Custom Domain */}
            <div
              onClick={() => setDomainChoice("custom")}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                domainChoice === "custom"
                  ? "border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Özel Marka
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  2. Kendi Alan Adınız (.com / .com.tr)
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Daha önce aldığınız bir alan adınız varsa yazın, teknik ekibimiz WhatsApp üzerinden 5 dakikada ücretsiz bağlasın.
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-300 flex items-center gap-1 text-xs font-mono">
                  <span className="text-slate-400">www.</span>
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase())}
                    placeholder="ornekfirma.com.tr"
                    className="font-bold text-blue-600 outline-none flex-1"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-blue-700 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp'tan 1 tıkla ücretsiz kurulum desteği</span>
              </div>
            </div>
          </div>

          {/* Reassurance Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900 block mb-0.5">Ömür Boyu Ücretsiz SSL Güvenliği Dahildir</strong>
              Tüm alan adları için 256-bit SSL güvenlik sertifikası ve Anycast DDoS koruması fiyata dahildir.
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Geri
            </button>
            <button
              type="button"
              onClick={handleProceedToStep4}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all group"
            >
              <span>İleri: Paket & Güvenli Ödeme (Adım 4)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: CHECKOUT & PAYMENT ==================== */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              4. Paketinizi Seçin ve Güvenle Başlatın
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Hiçbir gizli ücret veya aylık sunucu masrafı yok. 14 gün koşulsuz para iade garantisi.
            </p>
          </div>

          {/* Pricing Tier Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setSelectedPackage("starter")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPackage === "starter"
                  ? "border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tek İşletme</div>
                <div className="text-base font-black text-slate-900">1 Web Sitesi</div>
                <div className="text-2xl font-black text-slate-900 my-2">
                  ₺990 <span className="text-xs font-normal text-slate-500">/ Yıl</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>✓ 0.02s Ultra Hızlı Statik Site</div>
                  <div>✓ Ürün Kataloğu & Blog</div>
                  <div>✓ Ücretsiz SSL & Edge CDN</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-amber-700">
                {selectedPackage === "starter" ? "✓ Seçildi" : "Seç"}
              </div>
            </div>

            <div
              onClick={() => setSelectedPackage("pro")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                selectedPackage === "pro"
                  ? "border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                En Popüler
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">3 Şirket Paketi</div>
                <div className="text-base font-black text-slate-900">3 Web Sitesi</div>
                <div className="text-2xl font-black text-amber-600 my-2">
                  ₺2.490 <span className="text-xs font-normal text-slate-500">/ Yıl</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>✓ 3 Farklı Alan Adı Yönetimi</div>
                  <div>✓ Öncelikli WhatsApp Destek</div>
                  <div>✓ Yapay Zeka Makale Yazarı</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-amber-700">
                {selectedPackage === "pro" ? "✓ Seçildi" : "Seç"}
              </div>
            </div>

            <div
              onClick={() => setSelectedPackage("agency")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPackage === "agency"
                  ? "border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Ajans / Çoklu</div>
                <div className="text-base font-black text-slate-900">10 Web Sitesi</div>
                <div className="text-2xl font-black text-slate-900 my-2">
                  ₺6.900 <span className="text-xs font-normal text-slate-500">/ Yıl</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>✓ 10 Adet Müşteri Sitesi</div>
                  <div>✓ Beyaz Etiket (White-Label)</div>
                  <div>✓ Özel DNS Yapılandırması</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-indigo-700">
                {selectedPackage === "agency" ? "✓ Seçildi" : "Seç"}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Ödeme Yöntemi:</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "card"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  💳 Kredi / Banka Kartı
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("trial")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "trial"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  ⚡ 14 Gün Ücretsiz Dene
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "transfer"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  🏦 Havale / EFT
                </button>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    value={cardHolder || companyName}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kart Numarası (256-Bit SSL)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4543 •••• •••• ••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Son Kullanma</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">CVV / Güvenlik</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="382"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "trial" && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900">
                <strong>Kart Bilgisi Gerekmez:</strong> 14 gün boyunca web sitenizi tüm özellikleri ve 0.02s hızıyla ücretsiz deneyebilirsiniz.
              </div>
            )}

            {paymentMethod === "transfer" && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 text-xs text-blue-900 space-y-1">
                <div className="font-bold">JetKur Bilişim A.Ş. Garanti BBVA IBAN:</div>
                <div className="font-mono font-bold text-blue-950">TR33 0006 2000 0001 2345 6789 01</div>
                <div className="text-[11px] text-blue-700">Açıklamaya firma adınızı ({companyName || "Firma"}) yazmanız yeterlidir.</div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Geri
            </button>

            <button
              type="button"
              onClick={handleProcessCheckoutAndPublish}
              disabled={isProcessingPayment}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              {isProcessingPayment ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Siteniz Global Edge Ağına Dağıtılıyor...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Ödemeyi Onayla ve Web Sitemi Canlıya Al 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 5: CELEBRATION & SUCCESS ==================== */}
      {step === 5 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
              🎉 Tebrikler! {formatTimer(elapsedSeconds)} İçinde Tamamlandı
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Web Siteniz 0.02s Yanıt Hızıyla Canlıda!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2">
              Tüm sayfalarınız, ürün kataloğunuz, WhatsApp butonunuz ve SEO etiketleriniz Global Anycast Edge ağı üzerinden aktif edildi.
            </p>
          </div>

          {/* Published Site Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white max-w-xl mx-auto border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                CANLI YAYINDA
              </span>
              <span className="font-mono">⚡ 0.02s Edge SSG</span>
            </div>

            <div className="text-xl font-black text-white font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-amber-400 truncate">
                {finalConfig?.cloudflare?.deployedUrl || `https://${subdomainInput}.hizliweb.site`}
              </span>
              <a
                href={finalConfig?.cloudflare?.deployedUrl || `https://${subdomainInput}.hizliweb.site`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shrink-0 ml-2"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-800/80">
                <div className="text-emerald-400 font-black text-sm">100/100</div>
                <div className="text-[10px] text-slate-400">PageSpeed</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80">
                <div className="text-blue-400 font-black text-sm">Ömür Boyu</div>
                <div className="text-[10px] text-slate-400">SSL Sertifikası</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80">
                <div className="text-amber-400 font-black text-sm">310+ Şehir</div>
                <div className="text-[10px] text-slate-400">Edge Lokasyon</div>
              </div>
            </div>
          </div>

          {/* Instant Growth & Sharing Tools for Non-Tech User */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            {/* WhatsApp Share */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Müşterilerinize WhatsApp'tan Duyurun</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                "Değerli müşterilerimiz, yeni web sitemiz yayında!" hazır mesajını tek tıkla paylaşın.
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = finalConfig?.cloudflare?.deployedUrl || `https://${subdomainInput}.hizliweb.site`;
                  const msg = encodeURIComponent(`Merhaba! ${companyName} olarak yeni ve hızlı web sitemizi yayına aldık. İncelemek için tıklayın: ${url}`);
                  window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp'ta Paylaş</span>
              </button>
            </div>

            {/* QR Code Stand */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Dükkanınız İçin QR Kodlu Masa Kartı</span>
              </div>
              <p className="text-[11px] text-blue-700">
                Masanıza veya vitrininize koyabileceğiniz otomatik QR kodlu tanıtım kartı hazır.
              </p>
              <button
                type="button"
                onClick={handleFinishAndOpenPanel}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR Kodu Panelden İndir</span>
              </button>
            </div>
          </div>

          {/* Action to Customer Dashboard */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleFinishAndOpenPanel}
              className="px-10 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform"
            >
              <span>Yönetim Panelime Geç (Düzenlemeye Başla)</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
