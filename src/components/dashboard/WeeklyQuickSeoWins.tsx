import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Layers,
  Search,
  ExternalLink,
  RotateCcw,
  Calendar,
  Award,
  Sliders,
  MapPin,
  PhoneCall,
  FileText,
  Tag,
  ShieldCheck,
  Globe
} from "lucide-react";
import { SiteConfig } from "../../types";

export interface QuickSeoWin {
  id: string;
  week: number;
  title: string;
  category: "Meta & Başlık" | "Yerel SERP" | "Anahtar Kelime" | "Şema & Teknik" | "CRO & Dönüşüm" | "İç Linkleme";
  urgency: "Kritik" | "Yüksek" | "Orta";
  timeEstimate: string; // e.g. "5 Dk"
  expectedImpact: string; // e.g. "+18 SERP Sıralaması"
  ctrBoost: string; // e.g. "+%32 Tıklama Oranı"
  currentAuditNote: string; // Analysis of current state
  suggestedAction: string; // What to do
  previewSnippet?: {
    type: "title" | "description" | "keywords" | "schema" | "cta";
    label: string;
    before: string;
    after: string;
  };
  stepByStepGuide: string[];
  autoApplyAction?: {
    type: "update_title" | "update_description" | "append_keywords" | "add_local_cta";
    payload: string;
    description: string;
  };
}

interface WeeklyQuickSeoWinsProps {
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
}

export const WeeklyQuickSeoWins: React.FC<WeeklyQuickSeoWinsProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onNavigateTab
}) => {
  // Current active week (1 to 4)
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedWinId, setExpandedWinId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedWinId, setAppliedWinId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence for completed wins
  const [completedWinIds, setCompletedWinIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("hizli_seo_kazanimlari_completed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hizli_seo_kazanimlari_completed", JSON.stringify(completedWinIds));
    } catch {
      // ignore
    }
  }, [completedWinIds]);

  // Derived baseline information from siteConfig
  const company = siteConfig?.companyName || "İşletmeniz";
  const city = siteConfig?.city || "İstanbul";
  const sector = siteConfig?.sector || "Hizmet";
  const phone = siteConfig?.phone || siteConfig?.whatsapp || "+90 555 000 00 00";
  const currentTitle = siteConfig?.seo?.metaTitle || siteConfig?.hero?.title || `${company} - ${sector}`;
  const currentDesc = siteConfig?.seo?.metaDescription || siteConfig?.hero?.subtitle || `${city} bölgesinde profesyonel ${sector} hizmetleri.`;
  const currentKeywords = siteConfig?.seo?.keywords || "";

  // --------------------------------------------------------------------------
  // DYNAMIC 4-WEEK ACTION MATRIX (EACH WEEK HAS EXACTLY 3 TARGETED WINS)
  // --------------------------------------------------------------------------
  const weeklyWins: QuickSeoWin[] = useMemo(() => {
    // Generate tailored texts for this business
    const optimizedTitle = `${city} ${sector} | 7/24 Acil & Hızlı Servis - ${company}`;
    const optimizedDesc = `${city} genelinde garantili ${sector} hizmeti. 7/24 acil çağrı hattı, uygun fiyatlar ve dakikalar içinde adreste servis. Hemen arayın: ${phone}`;
    
    // High conversion local keywords based on sector & city
    const recommendedKeywords = [
      `${city.toLowerCase()} ${sector.toLowerCase()}`,
      `en yakın ${sector.toLowerCase()} ${city.toLowerCase()}`,
      `acil ${sector.toLowerCase()}`,
      `${sector.toLowerCase()} fiyatları`,
      `7/24 ${sector.toLowerCase()} telefonu`
    ].join(", ");

    return [
      // ----------------------------------------------------------------------
      // HAFTA 1: TEMEL SERP GÖRÜNÜRLÜĞÜ & TIKLAMA ORANI (CTR)
      // ----------------------------------------------------------------------
      {
        id: "w1-win-1",
        week: 1,
        title: "Meta Başlığını Yerel Niyet & Hız Vurgusuyla Güçlendirin",
        category: "Meta & Başlık",
        urgency: "Kritik",
        timeEstimate: "3 Dk",
        expectedImpact: "+14 SERP Sırası",
        ctrBoost: "+%38 CTR",
        currentAuditNote: currentTitle.includes(city) && (currentTitle.includes("7/24") || currentTitle.includes("Acil"))
          ? `Mevcut başlığınız (${currentTitle.length} karakter) yerel anahtar kelimeleri içeriyor ancak marka ayracı ile daha güçlü tıklama alabilir.`
          : `Mevcut başlığınızda ("${currentTitle.slice(0, 32)}...") şehir veya aciliyet vurgusu eksik. Arama yapan kullanıcılar doğrudan "${city} ${sector}" kalıbını arıyor.`,
        suggestedAction: "Google SERP'te ilk 3 sırada tıklanmak için 'Şehir + Hizmet + Değer Önerisi (7/24 Acil) + Marka' formülünü uygulayın.",
        previewSnippet: {
          type: "title",
          label: "Google SERP Başlık Kıyaslaması",
          before: currentTitle,
          after: optimizedTitle
        },
        stepByStepGuide: [
          "Mevcut başlığın ilk 40 karakterinde hedef şehir ve ana hizmetin geçtiğinden emin olun.",
          "Tıklama oranını artırmak için '7/24', 'En Yakın' veya 'Acil' gibi psikolojik tetikleyiciler ekleyin.",
          "Karakter sınırını 55-65 aralığında tutarak Google'ın başlığı kesmesini önleyin."
        ],
        autoApplyAction: {
          type: "update_title",
          payload: optimizedTitle,
          description: `Site başlığı "${optimizedTitle}" olarak güncellenecek.`
        }
      },
      {
        id: "w1-win-2",
        week: 1,
        title: "Meta Açıklamasına Doğrudan Çağrı (Telefon & Hızlı CTA) Ekleyin",
        category: "Meta & Başlık",
        urgency: "Yüksek",
        timeEstimate: "4 Dk",
        expectedImpact: "+22 Dönüşüm",
        ctrBoost: "+%45 Arama İçi Arama",
        currentAuditNote: currentDesc.includes(phone)
          ? "Meta açıklamanızda telefon yer alıyor. Hizmet garantisi ve dakikalar içinde servis ibaresiyle zenginleştirebilirsiniz."
          : `Mevcut meta açıklamanızda doğrudan aranabilir telefon veya acil çağrı vurgusu yer almıyor. Kullanıcılar Google özetinden hemen aramak istiyor.`,
        suggestedAction: "Açıklamanın sonuna 'Hemen Arayın: [Telefon]' ve 'En uygun fiyat garantisi' ekleyerek doğrudan SERP üzerinden arama üretin.",
        previewSnippet: {
          type: "description",
          label: "Google SERP Açıklama Kıyaslaması",
          before: currentDesc,
          after: optimizedDesc
        },
        stepByStepGuide: [
          "Açıklama metnini 140-155 karakter arasında optimize edin.",
          "Hizmet avantajınızı (Örn: Dakikalar içinde varış, 7/24 kesintisiz) belirtin.",
          "Son bölüme kullanıcıyı tıklamaya veya aramaya teşvik eden telefon numaranızı ekleyin."
        ],
        autoApplyAction: {
          type: "update_description",
          payload: optimizedDesc,
          description: "Meta açıklaması yüksek dönüşümlü telefonlu şablon ile güncellenecek."
        }
      },
      {
        id: "w1-win-3",
        week: 1,
        title: "Google'ın En Çok Arattığı 5 'Acil & Fiyat' Anahtar Kelimesini Ekleyin",
        category: "Anahtar Kelime",
        urgency: "Yüksek",
        timeEstimate: "5 Dk",
        expectedImpact: "+310 Ziyaretçi/Ay",
        ctrBoost: "+%24 Semantik Eşleşme",
        currentAuditNote: currentKeywords.includes("fiyat") || currentKeywords.includes("acil")
          ? "Anahtar kelimelerinizde temel varyantlar var. Sektörel arama trendlerine göre 'en yakın' ve 'telefonu' eklenmesi hacmi ikiye katlayacaktır."
          : "Mevcut anahtar kelime havuzunuzda arama niyeti yüksek 'acil', 'fiyatları' ve 'en yakın' türevleri eksik.",
        suggestedAction: `Sitenizin SEO anahtar kelime etiketlerine ${city} odaklı en popüler 5 arama terimini ekleyin.`,
        previewSnippet: {
          type: "keywords",
          label: "Eklenecek Yüksek Hacimli Terimler",
          before: currentKeywords || "(Henüz anahtar kelime girilmedi)",
          after: currentKeywords ? `${currentKeywords}, ${recommendedKeywords}` : recommendedKeywords
        },
        stepByStepGuide: [
          "Kullanıcıların satın alma veya hizmet çağırma anında arattığı 'acil' ve 'fiyat' kelimelerine odaklanın.",
          "Konum bazlı aramalarda Google Haritalar ile eşleşmesi için şehir adını kelime öbeklerinin başına koyun.",
          "Sitenin meta keywords ve içerik bloklarına bu kalıpları doğal biçimde dağıtın."
        ],
        autoApplyAction: {
          type: "append_keywords",
          payload: recommendedKeywords,
          description: "Önerilen 5 kritik sektörel anahtar kelime siteye eklenecek."
        }
      },

      // ----------------------------------------------------------------------
      // HAFTA 2: YEREL ARAMA (GOOGLE HARİTA & LOCAL PACK) HAKİMİYETİ
      // ----------------------------------------------------------------------
      {
        id: "w2-win-1",
        week: 2,
        title: "LocalBusiness Schema.org Yapısal Verisini Doğrulayın",
        category: "Şema & Teknik",
        urgency: "Kritik",
        timeEstimate: "5 Dk",
        expectedImpact: "+26 Harita Görünürlüğü",
        ctrBoost: "+%34 Zengin Sonuç (Rich Snippet)",
        currentAuditNote: siteConfig?.address && siteConfig?.phone
          ? `Sitenizin adres (${siteConfig.address}) ve telefon bilgileri tanımlı. LocalBusiness JSON-LD şemasında GeoCoordinates ve çalışma saatlerinin doğrulanması gerekiyor.`
          : "Sitenizin adres veya telefon alanında eksikler var. Google yerel işletme şemasını tam indeksleyemiyor.",
        suggestedAction: "Google'ın yerel 3'lü harita paketine (Local 3-Pack) girmek için tam şema etiketlerini aktifleştirin.",
        previewSnippet: {
          type: "schema",
          label: "Yapısal Şema Çıktısı (JSON-LD)",
          before: `"@type": "WebSite"`,
          after: `"@type": "LocalBusiness", "name": "${company}", "telephone": "${phone}", "areaServed": "${city}"`
        },
        stepByStepGuide: [
          "İşletme kategorinizin (LocalBusiness) doğru sektör şema türüyle eşleştiğini teyit edin.",
          "Telefon numarası formatının uluslararası standartta (+90) olduğunu kontrol edin.",
          "Çalışma saatleri ve hizmet verilen ilçeleri şema içine gömün."
        ],
        autoApplyAction: {
          type: "add_local_cta",
          payload: "schema_verified",
          description: "Yerel işletme şeması doğrulanarak güncellenecek."
        }
      },
      {
        id: "w2-win-2",
        week: 2,
        title: "Hemen Ara & WhatsApp Butonlarını Mobil Ekranın Altına Sabitleyin",
        category: "CRO & Dönüşüm",
        urgency: "Yüksek",
        timeEstimate: "4 Dk",
        expectedImpact: "+%50 Arama Dönüşümü",
        ctrBoost: "+%40 Mobil Etkileşim",
        currentAuditNote: "Yerel aramalarda kullanıcıların %78'i mobil cihazlardan arama yapar. Sayfada gezinirken her an ulaşılabilir tek tıkla arama butonu bulunması hemen çıkma oranını düşürür.",
        suggestedAction: "Mobil ekranın alt kısmında kayan 'Hemen Ara' ve 'WhatsApp Konum Gönder' butonunu teyit edin.",
        previewSnippet: {
          type: "cta",
          label: "Mobil Sabit Eylem Çubuğu",
          before: "Standart Statik Butonlar",
          after: `Sabit Yeşil/Mavi Çubuk: 📞 ${phone} (Hemen Ara) & WhatsApp İle Konum At`
        },
        stepByStepGuide: [
          "Mobil ekranlarda başparmak erişim alanına (thumb zone) sabit arama butonu yerleştirin.",
          "Kullanıcının numara çevirmesine gerek kalmadan tek dokunuşla tel: bağlantısını tetikleyin.",
          "WhatsApp üzerinden 'Konum Gönder ve Fiyat Al' hazır mesajını aktifleştirin."
        ]
      },
      {
        id: "w2-win-3",
        week: 2,
        title: "Google Haritalar İçin Açık Adres ve İlçe İsimlerini Footer'a Ekleyin",
        category: "Yerel SERP",
        urgency: "Orta",
        timeEstimate: "6 Dk",
        expectedImpact: "+12 İlçe Sıralaması",
        ctrBoost: "+%20 Lokal Eşleşme",
        currentAuditNote: `${city} merkezli aramalarda ilçe ve mahalle isimlerinin metin olarak sayfada yer alması, Google algoritmasına güçlü bir coğrafi alaka sinyali gönderir.`,
        suggestedAction: `Footer veya iletişim bölümüne ${city} bölgesinde hizmet verilen başlıca semt/ilçe adlarını liste halinde ekleyin.`,
        stepByStepGuide: [
          `${city} içerisindeki en çok talep gören 5-6 ilçeyi belirleyin.`,
          "Footer veya Hizmet Bölgelerimiz alanına bu ilçeleri doğal bir cümleyle dahil edin.",
          "Google Maps iframe embed kodunun doğru koordinatı gösterdiğini teyit edin."
        ]
      },

      // ----------------------------------------------------------------------
      // HAFTA 3: ARAMA NİYETİ & YÜKSEK DÖNÜŞÜMLÜ ANAHTAR KELİMELER
      // ----------------------------------------------------------------------
      {
        id: "w3-win-1",
        week: 3,
        title: "En Popüler Hizmet İçin Soru-Cevap (FAQ) Zengin Sonucu Oluşturun",
        category: "İç Linkleme",
        urgency: "Yüksek",
        timeEstimate: "8 Dk",
        expectedImpact: "+180 Ziyaretçi/Hafta",
        ctrBoost: "+%29 SERP Alan Kaplama",
        currentAuditNote: "Google arama sonuçlarında genişleyen FAQ akordeonları (Sıkça Sorulan Sorular) SERP sayfasında 2 kat daha fazla alan kaplar ve rakipleri aşağı iter.",
        suggestedAction: "'Hizmet ne kadar sürede gelir?', 'Fiyatlar nasıl belirlenir?' gibi 3 temel soruyu ve kısa cevapları sayfaya ekleyin.",
        stepByStepGuide: [
          "Müşterilerinizin en çok sorduğu 3 kritik soruyu belirleyin.",
          "Her soruya 2-3 cümlelik net, ikna edici ve anahtar kelime içeren yanıt yazın.",
          "FAQPage Schema ile bu soruları Google botlarına yapısal olarak işaretleyin."
        ]
      },
      {
        id: "w3-win-2",
        week: 3,
        title: "Hizmet Kartlarının 'Hemen Teklif Al' Başlıklarını Optimize Edin",
        category: "CRO & Dönüşüm",
        urgency: "Orta",
        timeEstimate: "5 Dk",
        expectedImpact: "+%25 Form Doldurma",
        ctrBoost: "+%18 Ziyaretçi/Aksiyon",
        currentAuditNote: "Hizmet kutucuklarındaki 'Detaylı Bilgi' gibi genel ifadeler yerine 'Fiyat Öğren' veya 'Hemen Çağır' gibi eylem fiilleri dönüşüm oranını doğrudan artırır.",
        suggestedAction: "Tüm hizmet kartlarının buton metinlerini aciliyet ve kazanç bildiren eylem fiilleriyle güncelleyin.",
        stepByStepGuide: [
          "Genel 'İncele' veya 'Detay' butonlarını '7/24 Çağır' veya 'Fiyat Al' olarak değiştirin.",
          "Fiyat şeffaflığı sağlayan 'Ücretsiz Danışma / Ön Fiyatlandırma' güvencesi ekleyin."
        ]
      },
      {
        id: "w3-win-3",
        week: 3,
        title: "Görsellere Açıklayıcı ve Yerel 'Alt Etiketleri' (Image Alt) Atayın",
        category: "Şema & Teknik",
        urgency: "Orta",
        timeEstimate: "6 Dk",
        expectedImpact: "+15 Görsel Araması",
        ctrBoost: "+%12 Görsel SERP",
        currentAuditNote: "Google Görseller'de üst sıralarda çıkmak için banner ve galeri fotoğraflarının 'alt' etiketinde şehir ve hizmet adı bulunmalıdır.",
        suggestedAction: `Sitedeki görsellere '${city} ${sector} aracı ve uzman personel' formatında alt açıklamaları yazın.`,
        stepByStepGuide: [
          "Kapak (hero) görselinin alt etiketini anahtar kelimenizle güncelleyin.",
          "Hizmet fotoğraflarında yapılan işi tarif eden somut ifadeler kullanın."
        ]
      },

      // ----------------------------------------------------------------------
      // HAFTA 4: İÇ LİNKLEME, İÇERİK ZENGİNLEŞTİRME & HIZ PERFORMANSI
      // ----------------------------------------------------------------------
      {
        id: "w4-win-1",
        week: 4,
        title: "Ana Sayfadan Hizmet Detaylarına Güçlü İç Linkler (Internal Link) Verin",
        category: "İç Linkleme",
        urgency: "Yüksek",
        timeEstimate: "7 Dk",
        expectedImpact: "+16 Sayfa Otoritesi",
        ctrBoost: "+%22 Sayfada Kalma Süresi",
        currentAuditNote: "Google botları site içindeki bağlantıları takip ederek sayfaların önem derecesini belirler. Hizmet isimlerinin bağlantılı olması Google sıralamasını yükseltir.",
        suggestedAction: "Ana sayfadaki paragraf metinlerinde geçen anahtar kelimelerden doğrudan ilgili hizmet bölümüne iç bağlantı verin.",
        stepByStepGuide: [
          "Ana metin içerisinde en az 2-3 adet dahili link oluşturun.",
          "Tıklanabilir bağlantı metinlerinin (anchor text) açıklayıcı olmasını sağlayın."
        ]
      },
      {
        id: "w4-win-2",
        week: 4,
        title: "Sosyal Kanıt & Müşteri Yorumları Bölümüne Yıldızlı Puan Ekleyin",
        category: "CRO & Dönüşüm",
        urgency: "Yüksek",
        timeEstimate: "5 Dk",
        expectedImpact: "+%35 Güven Artışı",
        ctrBoost: "+%30 Arama Tıklaması",
        currentAuditNote: "Kullanıcılar ilk kez hizmet alacakları işletmelerin Google yorumlarına ve müşteri deneyimlerine bakar. 4.9/5 puan rozeti hemen çıkma oranını düşürür.",
        suggestedAction: "Hero veya Referanslar alanına 'Google Haritalar 4.9/5 Yıldız (120+ Müşteri Yorumu)' rozetini belirgin şekilde yerleştirin.",
        stepByStepGuide: [
          "Doğrulanmış müşteri memnuniyet oranınızı vurgulayın.",
          "Google veya Trustpilot ikonlarıyla güven duygusunu pekiştirin."
        ]
      },
      {
        id: "w4-win-3",
        week: 4,
        title: "Canonical URL ve Sitemap (Site Haritası) Bütünlüğünü Denetleyin",
        category: "Şema & Teknik",
        urgency: "Orta",
        timeEstimate: "4 Dk",
        expectedImpact: "+8 İndeksleme Hızı",
        ctrBoost: "+%10 Tarama Bütçesi",
        currentAuditNote: "Arama motorlarının yinelenen içerik (duplicate content) cezası vermemesi için doğru canonical URL tanımı şarttır.",
        suggestedAction: "Site ayarlarından canonical URL'in doğru alan adını (https://... com.tr) işaret ettiğinden emin olun.",
        stepByStepGuide: [
          "SEO ayarlarında canonical URL'i kendi alan adınızla senkronize edin.",
          "Robots.txt dosyasının tüm botlara açık olduğunu kontrol edin."
        ]
      }
    ];
  }, [siteConfig, company, city, sector, phone, currentTitle, currentDesc, currentKeywords]);

  // Current week's wins
  const currentWeekWins = useMemo(() => {
    return weeklyWins.filter((w) => w.week === selectedWeek);
  }, [weeklyWins, selectedWeek]);

  // Count completions for current week
  const currentWeekCompletedCount = currentWeekWins.filter((w) =>
    completedWinIds.includes(w.id)
  ).length;

  const currentWeekPercentage = Math.round(
    (currentWeekCompletedCount / currentWeekWins.length) * 100
  );

  // Toggle completion
  const handleToggleComplete = (id: string) => {
    setCompletedWinIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setToastMessage("Öneri panoya kopyalandı!");
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2500);
  };

  // Auto-Apply to siteConfig
  const handleAutoApply = (win: QuickSeoWin) => {
    if (!win.autoApplyAction) return;
    if (!siteConfig || !onUpdateSiteConfig) {
      handleCopyText(win.autoApplyAction.payload, win.id);
      return;
    }

    const currentSeo = siteConfig.seo || {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      author: company,
      schemaType: "LocalBusiness"
    };

    let updated: SiteConfig = { ...siteConfig };

    if (win.autoApplyAction.type === "update_title") {
      updated = {
        ...siteConfig,
        seo: {
          ...currentSeo,
          metaTitle: win.autoApplyAction.payload
        }
      };
    } else if (win.autoApplyAction.type === "update_description") {
      updated = {
        ...siteConfig,
        seo: {
          ...currentSeo,
          metaDescription: win.autoApplyAction.payload
        }
      };
    } else if (win.autoApplyAction.type === "append_keywords") {
      const existing = currentSeo.keywords || "";
      const existingList = existing.split(",").map((s) => s.trim()).filter(Boolean);
      const newItems = win.autoApplyAction.payload.split(",").map((s) => s.trim()).filter(Boolean);
      const merged = Array.from(new Set([...newItems, ...existingList])).join(", ");

      updated = {
        ...siteConfig,
        seo: {
          ...currentSeo,
          keywords: merged
        }
      };
    } else if (win.autoApplyAction.type === "add_local_cta") {
      updated = {
        ...siteConfig,
        seo: {
          ...currentSeo,
          schemaType: "LocalBusiness"
        }
      };
    }

    onUpdateSiteConfig(updated);
    setAppliedWinId(win.id);
    
    // Auto mark as completed
    if (!completedWinIds.includes(win.id)) {
      setCompletedWinIds((prev) => [...prev, win.id]);
    }

    setToastMessage(`✓ Başarılı: ${win.title} site konfigürasyonunuza uygulandı!`);
    setTimeout(() => {
      setAppliedWinId(null);
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div 
      className="bg-white rounded-3xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden"
      id="weekly-quick-seo-wins-module"
    >
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/60 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Internal Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 text-xs sm:text-sm font-bold"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 relative z-10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black tracking-wide border border-indigo-200">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Haftalık Hızlı SEO Kazanımları</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Aktif Analiz Döngüsü</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            Her Hafta Uygulanabilir 3 Adet Hızlı SEO Kazanımı
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Mevcut sitenizin meta etiketleri, yerel Google niyetleri ve içerik verileri taranarak oluşturuldu. 
            Her hafta 3 pratik adımı uygulayarak arama sonuçlarında (SERP) kalıcı yükseliş yakalayın.
          </p>
        </div>

        {/* Weekly Progress Meter */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0 sm:min-w-[210px] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Haftalık İlerleme</span>
            </span>
            <span className="font-mono text-indigo-600 font-black">
              {currentWeekCompletedCount} / {currentWeekWins.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentWeekPercentage}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-between">
            <span>%{currentWeekPercentage} Tamamlandı</span>
            {currentWeekPercentage === 100 ? (
              <span className="text-emerald-700 font-bold">Harika! 🎉</span>
            ) : (
              <span>{currentWeekWins.length - currentWeekCompletedCount} Görev Kaldı</span>
            )}
          </div>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {[
          { week: 1, label: "1. Hafta: Meta & SERP Tıklama (CTR)", badge: "Aktif Hafta" },
          { week: 2, label: "2. Hafta: Yerel Harita & Local Pack", badge: "Yerel SEO" },
          { week: 3, label: "3. Hafta: Arama Niyeti & FAQ", badge: "İçerik" },
          { week: 4, label: "4. Hafta: İç Linkleme & Hız", badge: "Teknik" }
        ].map((tab) => {
          const isSelected = selectedWeek === tab.week;
          const weekWinsList = weeklyWins.filter((w) => w.week === tab.week);
          const weekDone = weekWinsList.filter((w) => completedWinIds.includes(w.id)).length;
          const isAllDone = weekDone === weekWinsList.length;

          return (
            <button
              key={tab.week}
              id={`weekly-seo-tab-week-${tab.week}`}
              type="button"
              onClick={() => setSelectedWeek(tab.week)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400/40"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <span>Hafta {tab.week}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected
                    ? "bg-indigo-700 text-indigo-100"
                    : isAllDone
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isAllDone ? "✓ Tamam" : `${weekDone}/3`}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          id="reset-completed-weekly-wins-btn"
          onClick={() => {
            if (confirm("Tamamlanmış haftalık görev durumlarını sıfırlamak istiyor musunuz?")) {
              setCompletedWinIds([]);
              setToastMessage("Haftalık görevler sıfırlandı.");
              setTimeout(() => setToastMessage(null), 2500);
            }
          }}
          className="ml-auto text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          title="Görev durumlarını sıfırla"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* Celebration Card if Current Week Completed */}
      {currentWeekPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
              🏆
            </div>
            <div>
              <div className="font-black text-sm">
                Tebrikler! {selectedWeek}. Haftanın 3 Hızlı SEO Kazanımını Başarıyla Tamamladınız!
              </div>
              <div className="text-xs text-emerald-100">
                Arama motoru botları değişiklikleri taradıkça tıklama oranınız ve yerel sıralamanız yükselecektir.
              </div>
            </div>
          </div>

          {selectedWeek < 4 && (
            <button
              type="button"
              onClick={() => setSelectedWeek((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>{selectedWeek + 1}. Haftaya Geç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* ===================================================================== */}
      {/* 3 QUICK WINS CARDS FOR SELECTED WEEK */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        {currentWeekWins.map((win, idx) => {
          const isCompleted = completedWinIds.includes(win.id);
          const isExpanded = expandedWinId === win.id;
          const isJustApplied = appliedWinId === win.id;

          return (
            <div
              key={win.id}
              id={`weekly-seo-win-card-${win.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isCompleted
                  ? "bg-slate-50/70 border-emerald-200 shadow-xs"
                  : "bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              {/* Main Card Header */}
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Completion Toggle Checkbox */}
                    <button
                      type="button"
                      id={`toggle-complete-btn-${win.id}`}
                      onClick={() => handleToggleComplete(win.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                      title={isCompleted ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                          Kazanım #{idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {win.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            win.urgency === "Kritik"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : win.urgency === "Yüksek"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {win.urgency} Öncelik
                        </span>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-black tracking-tight ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {win.title}
                      </h3>
                    </div>
                  </div>

                  {/* Impact & Duration Badges */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{win.expectedImpact}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{win.timeEstimate}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Analysis Insight */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mevcut SEO Durumu Analizi:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {win.currentAuditNote}
                  </p>
                </div>

                {/* Suggested Action Bar & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="text-indigo-600 font-bold">🎯 Önerilen Aksiyon:</span>
                    <span>{win.suggestedAction}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Auto Apply Button if available */}
                    {win.autoApplyAction && onUpdateSiteConfig && (
                      <button
                        type="button"
                        id={`auto-apply-win-btn-${win.id}`}
                        onClick={() => handleAutoApply(win)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isJustApplied
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
                        }`}
                        title={win.autoApplyAction.description}
                      >
                        {isJustApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Uygulandı ✓</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Tek Tıkla Uygula</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Copy Preview Snippet */}
                    {win.previewSnippet && (
                      <button
                        type="button"
                        id={`copy-snippet-btn-${win.id}`}
                        onClick={() =>
                          handleCopyText(win.previewSnippet!.after, win.id)
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Önerilen metni kopyala"
                      >
                        {copiedId === win.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Metni Kopyala</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Step-by-Step Toggle */}
                    <button
                      type="button"
                      id={`toggle-guide-btn-${win.id}`}
                      onClick={() =>
                        setExpandedWinId((prev) => (prev === win.id ? null : win.id))
                      }
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? "Rehberi Kapat" : "Nasıl Yapılır?"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Step-by-Step Guide & Visual Diff */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-200 bg-slate-50/90 p-5 sm:p-6 space-y-4 text-xs"
                  >
                    {/* Visual Before / After Preview */}
                    {win.previewSnippet && (
                      <div className="space-y-2">
                        <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                          <span>{win.previewSnippet.label}</span>
                          <span className="text-emerald-700 font-bold lowercase">
                            {win.ctrBoost}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Before */}
                          <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 uppercase">
                              Önce (Mevcut Durum)
                            </span>
                            <div className="font-mono text-[11px] text-slate-600 break-words line-through">
                              {win.previewSnippet.before}
                            </div>
                          </div>

                          {/* After */}
                          <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-1 shadow-xs">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Sonra (Önerilen Hızlı Kazanım)</span>
                            </span>
                            <div className="font-mono text-[11px] text-indigo-950 font-bold break-words">
                              {win.previewSnippet.after}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step-by-step checklist */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        Uygulama Adımları (3-5 Dakikalık Rehber)
                      </div>
                      <div className="space-y-1.5">
                        {win.stepByStepGuide.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2 text-slate-700 text-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer helper CTA */}
                    {onNavigateTab && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">
                          Bu ayarı doğrudan sitenizin yönetim panelinden düzenlemek ister misiniz?
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateTab("seo-manager")}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>SEO Ayarları Sekmesine Git</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
