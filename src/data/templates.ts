import { ColorPalette, ThemeTemplate } from "../types";

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "navy-modern",
    name: "Kurumsal Lacivert",
    primary: "#1E40AF",
    primaryDark: "#1E3A8A",
    secondary: "#F8FAFC",
    accent: "#F59E0B",
    text: "#0F172A",
    bg: "#FFFFFF"
  },
  {
    id: "emerald-health",
    name: "Zümrüt Yeşil & Sağlık",
    primary: "#059669",
    primaryDark: "#047857",
    secondary: "#F0FDF4",
    accent: "#0284C7",
    text: "#064E3B",
    bg: "#FFFFFF"
  },
  {
    id: "amber-energy",
    name: "Canlı Turuncu & Oto",
    primary: "#EA580C",
    primaryDark: "#C2410C",
    secondary: "#FFF7ED",
    accent: "#EAB308",
    text: "#1C1917",
    bg: "#FFFFFF"
  },
  {
    id: "royal-purple",
    name: "Prestij Mor & Hukuk",
    primary: "#7C3AED",
    primaryDark: "#6D28D9",
    secondary: "#FAF5FF",
    accent: "#F43F5E",
    text: "#18181B",
    bg: "#FFFFFF"
  },
  {
    id: "cyan-tech",
    name: "Okyanus Turkuaz",
    primary: "#0891B2",
    primaryDark: "#0E7490",
    secondary: "#ECFEFF",
    accent: "#10B981",
    text: "#083344",
    bg: "#FFFFFF"
  },
  {
    id: "crimson-power",
    name: "Ateş Kırmızısı & Acil",
    primary: "#DC2626",
    primaryDark: "#B91C1C",
    secondary: "#FEF2F2",
    accent: "#F97316",
    text: "#18181B",
    bg: "#FFFFFF"
  },
  {
    id: "gold-luxury",
    name: "Lüks Altın & VIP",
    primary: "#D97706",
    primaryDark: "#B45309",
    secondary: "#FFFBEB",
    accent: "#4338CA",
    text: "#1E1B4B",
    bg: "#FFFFFF"
  },
  {
    id: "slate-minimal",
    name: "Koyu Antrasit & Mimari",
    primary: "#334155",
    primaryDark: "#1E293B",
    secondary: "#F1F5F9",
    accent: "#3B82F6",
    text: "#0F172A",
    bg: "#FFFFFF"
  }
];

export const TEMPLATES: ThemeTemplate[] = [
  {
    id: "oto-kurtarma",
    name: "7/24 Acil Oto Çekici & Yol Yardım",
    sector: "Otomotiv & Çekici",
    category: "Acil Hizmet",
    badge: "Çok Satan",
    icon: "Truck",
    description: "Hızlı konum gönderme, tek tıkla arama ve acil WhatsApp butonlu yüksek dönüşümlü çekici sitesi.",
    coverImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[2], // Amber/Orange
    defaultData: {
      companyName: "Yıldız 7/24 Oto Kurtarma",
      sector: "Oto Kurtarma & Yol Yardım",
      slogan: "En Yakın Çekici 15 Dakikada Yanınızda",
      city: "İstanbul & Çevre İller",
      phone: "0532 000 00 00",
      whatsapp: "905320000000",
      email: "info@yildizotokurtarma.com",
      address: "E-5 Karayolu Üzeri, Kadıköy / İstanbul",
      workingHours: "7 Gün 24 Saat Kesintisiz",
      hero: {
        badge: "🚨 7/24 Acil Yol Yardım & Çekici",
        title: "Yolda Kaldığınızda Panik Yapmayın!",
        subtitle: "Şehrin her noktasına 15-20 dakikada ulaşıyor, aracınızı güvenle istediğiniz servise taşıyoruz.",
        ctaPrimaryText: "Hemen Ara (0532 000 00 00)",
        ctaPrimaryLink: "tel:05320000000",
        ctaSecondaryText: "WhatsApp Konum Gönder",
        ctaSecondaryLink: "https://wa.me/905320000000?text=Merhaba,%20konumuma%20oto%20çekici%20istiyorum",
        bgImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Ortalama Varış", value: "15 Dk" },
          { label: "Mutlu Sürücü", value: "8.500+" },
          { label: "Hizmet Yılı", value: "12 Yıl" }
        ]
      },
      about: {
        enabled: true,
        badge: "Hakkımızda",
        title: "12 Yıldır Güvenle Yoldayız",
        content: "Yıldız Oto Kurtarma olarak binek araç, SUV, hafif ticari ve motosiklet taşıma işlemlerinde uzmanlaşmış kadromuz ve kaskolu çekici filomuzla hizmet veriyoruz.",
        yearsExperience: "12+",
        completedProjects: "14.000+",
        bullets: [
          "Tam Kasko Güvenceli Taşıma",
          "Sabit ve Şeffaf Fiyat Politikası",
          "Akü Takviye & Lastik Değişimi",
          "Şehirlerarası Araç Transferi"
        ],
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Hizmetlerimiz",
        title: "Profesyonel Yol Yardım Çözümleri",
        subtitle: "Her model araç için uygun ekipman ve deneyimli şoför kadrosu.",
        items: [
          { id: "s1", title: "Oto Çekici & Kurtarıcı", desc: "Kaza ve arıza anında hızlı, kaskolu ve hasarsız araç çekici hizmeti.", price: "Uygun Fiyat" },
          { id: "s2", title: "Akü Takviye & Değişim", desc: "Yerinde akü ölçümü, hızlı takviye ve sıfır garantili akü temini.", price: "Ekonomik" },
          { id: "s3", title: "Lastik Yol Yardımı", desc: "Patlak lastik tamiri ve stepne değişimi ile yola kaldığınız yerden devam edin.", price: "Hızlı Servis" },
          { id: "s4", title: "Şehirlerarası Araç Taşıma", desc: "Türkiye'nin 81 iline sigortalı, çoklu veya tekli özel araç transferi.", price: "Özel Teklif" }
        ]
      },
      faqs: {
        enabled: true,
        badge: "Sıkça Sorulanlar",
        title: "Merak Edilen Konular",
        subtitle: "Çekici ve yol yardım hizmetlerimiz hakkında bilmeniz gerekenler.",
        items: [
          { id: "f1", q: "Çekici ücreti nasıl hesaplanır?", a: "Çekici ücretleri aracın cinsi, bulunduğu konum ve gidilecek mesafe baz alınarak en şeffaf şekilde önceden belirtilir." },
          { id: "f2", q: "Aracım çekilirken sigortalı mı?", a: "Evet, tüm taşıma işlemlerimiz anlaşmalı kasko sigortamız kapsamında %100 güvence altındadır." },
          { id: "f3", q: "Ne kadar sürede yanıma gelirsiniz?", a: "Trafiğe bağlı olarak şehir içinde ortalama 15-25 dakika içerisinde yanınızda oluyoruz." }
        ]
      }
    }
  },
  {
    id: "dis-hekimligi",
    name: "Özel Diş Kliniği & Gülüş Tasarımı",
    sector: "Sağlık & Medikal",
    category: "Sağlık & Klinik",
    badge: "Premium",
    icon: "Stethoscope",
    description: "İmplant, zirkonyum kaplama ve gülüş estetiği için online randevu ve öncesi-sonrası vaka vitrinli şablon.",
    coverImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[1], // Emerald
    defaultData: {
      companyName: "DentNova Ağız ve Diş Sağlığı",
      sector: "Diş Kliniği & Estetik Diş",
      slogan: "Hayalinizdeki Kusursuz Gülüşe Kavuşun",
      city: "Ankara, Çankaya",
      phone: "0312 444 00 00",
      whatsapp: "905330000000",
      email: "iletisim@dentnovaklinik.com",
      address: "Tunalı Hilmi Cad. No:142 Çankaya / Ankara",
      workingHours: "Pazartesi - Cumartesi: 09:00 - 19:30",
      hero: {
        badge: "✨ Dijital Gülüş Tasarımı & İmplant Merkezi",
        title: "Sağlıklı Dişler, Özgüven Dolu Gülüşler",
        subtitle: "Son teknoloji 3D tarayıcılar ve uzman hekim kadromuzla ağrısız, estetik ve kalıcı dental tedaviler.",
        ctaPrimaryText: "Ücretsiz Muayene Randevusu Al",
        ctaPrimaryLink: "#randevu",
        ctaSecondaryText: "WhatsApp'tan Bilgi Al",
        ctaSecondaryLink: "https://wa.me/905330000000?text=Merhaba,%20diş%20tedavisi%20hakkında%20bilgi%20almak%20istiyorum",
        bgImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Tedavi Edilen Hasta", value: "12.000+" },
          { label: "Uzman Hekim", value: "8 Hekim" },
          { label: "Başarı Oranı", value: "%99.4" }
        ]
      },
      about: {
        enabled: true,
        badge: "Kliniğimiz",
        title: "Modern Diş Hekimliğinde Öncü",
        content: "DentNova olarak hastalarımıza steril ortamda, en güncel teknolojilerle konforlu ve stressiz tedavi deneyimi sunuyoruz.",
        yearsExperience: "15+",
        completedProjects: "12.000+",
        bullets: [
          "Ağrısız & Lazer Destekli Tedaviler",
          "FDA Onaylı Orijinal İmplant Markaları",
          "Kişiye Özel Dijital Gülüş Tasarımı",
          "Panoramik & 3D Tomografi Görüntüleme"
        ],
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Tedavilerimiz",
        title: "Uzmanlık Alanlarımız",
        subtitle: "Tüm ağız ve diş sağlığı ihtiyaçlarınız için hekim gözetiminde planlama.",
        items: [
          { id: "s1", title: "Zirkonyum & E-Max Porselen", desc: "Doğal dişe en yakın ışık geçirgenliği ve estetik kaplama uygulamaları." },
          { id: "s2", title: "Dikişsiz & Hızlı İmplant", desc: "Eksik dişlerinizi aynı gün kalıcı ve sağlam titanyum implantlarla tamamlayın." },
          { id: "s3", title: "Lazerle Diş Beyazlatma", desc: "45 dakikada 3-4 tona kadar daha beyaz ve parlak dişler." },
          { id: "s4", title: "Şeffaf Plak & Ortodonti", desc: "Telsiz, dışarıdan belli olmayan konforlu diş düzeltme tedavisi." }
        ]
      },
      faqs: {
        enabled: true,
        badge: "SSS",
        title: "Diş Tedavileri Hakkında Sorulanlar",
        subtitle: "Tedavi süreçleri, süreleri ve kontroller hakkında.",
        items: [
          { id: "f1", q: "İmplant tedavisi ağrılı bir işlem midir?", a: "Lokal anestezi altında yapıldığı için işlem anında hiçbir ağrı hissetmezsiniz. Sonrasında hafif sızılar basit ağrı kesicilerle geçer." },
          { id: "f2", q: "Gülüş tasarımı kaç seansta tamamlanır?", a: "Dijital ölçü ve prova aşamaları dahil ortalama 3 seansta (yaklaşık 7-10 günde) tamamlanır." },
          { id: "f3", q: "Muayene ve röntgen ücretli mi?", a: "İlk muayene ve tedavi planlaması kliniğimizde ücretsizdir." }
        ]
      }
    }
  },
  {
    id: "hukuk-avukat",
    name: "Kurumsal Hukuk & Danışmanlık Bürosu",
    sector: "Hukuk & Danışmanlık",
    category: "Profesyonel",
    badge: "Kurumsal",
    icon: "Scale",
    description: "Ceza, Ticaret, Gayrimenkul ve Aile Hukuku için prestijli ve güven verici kurumsal avukatlık teması.",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[3], // Purple/Navy
    defaultData: {
      companyName: "Demir & Ortakları Hukuk Bürosu",
      sector: "Hukuk & Avukatlık Danışmanlığı",
      slogan: "Hukuki Süreçlerinizde Güvenilir ve Stratejik Çözüm Ortağınız",
      city: "İzmir, Bayraklı Adalet Sarayı Yanı",
      phone: "0232 333 44 55",
      whatsapp: "905340000000",
      email: "info@demirhukuk.av.tr",
      address: "Megapol Tower Kat:18, Bayraklı / İzmir",
      workingHours: "Hafta içi: 08:30 - 18:00",
      hero: {
        badge: "⚖️ Profesyonel Hukuki Danışmanlık",
        title: "Haklarınızı Kararlılık ve Bilgiyle Savunuyoruz",
        subtitle: "Ticari davalar, şirket danışmanlığı, gayrimenkul ve ceza hukuku alanında uzman avukat kadrosu.",
        ctaPrimaryText: "Hukuki Danışmanlık Randevusu",
        ctaPrimaryLink: "#iletisim",
        ctaSecondaryText: "Avukata Soru Sor",
        ctaSecondaryLink: "https://wa.me/905340000000?text=Hukuki%20danismanlik%20hakkinda%20gorusmek%20istiyorum",
        bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Kazanılan Dava", value: "1.400+" },
          { label: "Kurumsal Müvekkil", value: "120+" },
          { label: "Sektörel Deneyim", value: "18 Yıl" }
        ]
      },
      about: {
        enabled: true,
        badge: "Büromuz",
        title: "Gizlilik ve Şeffaflık İlkesi",
        content: "Müvekkillerimizin haklarını en üst seviyede korumak amacıyla mevzuat ve içtihatları yakından takip ediyor, sonuç odaklı hukuki stratejiler geliştiriyoruz.",
        yearsExperience: "18+",
        completedProjects: "1.400+",
        bullets: [
          "Birebir Avukat İlgisi ve Düzenli Dosya Raporlaması",
          "Arabuluculuk ve Uzlaşma Danışmanlığı",
          "Sözleşme İnceleme & Risk Analizi",
          "KVKK ve Şirket Uyum Süreçleri"
        ],
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Faaliyet Alanları",
        title: "Uzmanlaştığımız Hukuk Dalları",
        subtitle: "Bireysel ve kurumsal müvekkillere kapsamlı avukatlık ve hukuki danışmanlık.",
        items: [
          { id: "s1", title: "Ticaret & Şirketler Hukuku", desc: "Şirket kuruluşu, hisse devirleri, sözleşmeler ve ticari alacak davaları." },
          { id: "s2", title: "Gayrimenkul & İmar Hukuku", desc: "Tapu iptal tescil, kamulaştırma, kira uyuşmazlıkları ve tahliye davaları." },
          { id: "s3", title: "İş & Sosyal Güvenlik Hukuku", desc: "Kıdem ve ihbar tazminatı, işe iade ve iş kazası tazminat süreçleri." },
          { id: "s4", title: "Ceza & Ağır Ceza Hukuku", desc: "Soruşturma ve kovuşturma aşamalarında etkin savunma ve adli takip." }
        ]
      },
      faqs: {
        enabled: true,
        badge: "Sık Sorulanlar",
        title: "Danışmanlık Süreci",
        subtitle: "Hukuki danışmanlık almak isteyen müvekkillerimiz için.",
        items: [
          { id: "f1", q: "Danışmanlık randevusu nasıl oluşturulur?", a: "Telefon veya iletişim formumuz üzerinden uygun gün ve saat için randevu alabilirsiniz." },
          { id: "f2", q: "Online danışmanlık veriyor musunuz?", a: "Evet, şehir dışındaki müvekkillerimiz için Zoom veya Google Meet üzerinden görüntülü danışmanlık sağlamaktayız." }
        ]
      }
    }
  },
  {
    id: "hali-yikama",
    name: "Halı, Koltuk & Perde Yıkama Fabrikası",
    sector: "Temizlik & Hizmet",
    category: "Hizmet & Fabrika",
    badge: "Popüler",
    icon: "Sparkles",
    description: "Ücretsiz adresten alma & teslimat, m2 fiyat hesaplama ve antibakteriyel yıkama garantili şablon.",
    coverImage: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[4], // Cyan
    defaultData: {
      companyName: "MisPak Halı & Koltuk Yıkama",
      sector: "Halı & Koltuk Yıkama",
      slogan: "Kapınızdan Alıyoruz, Tertemiz ve Mis Kokulu Teslim Ediyoruz",
      city: "Bursa & Tüm İlçeleri",
      phone: "0224 222 00 00",
      whatsapp: "905350000000",
      email: "siparis@mispakhaliyikama.com",
      address: "Nilüfer Sanayi Bölgesi 12. Cadde / Bursa",
      workingHours: "Pazartesi - Pazar: 08:00 - 20:00",
      hero: {
        badge: "🌿 %100 Bitkisel & Antibakteriyel Şampuanlar",
        title: "Halılarınız İlk Günkü Gibi Pırıl Pırıl!",
        subtitle: "Tam otomatik bilgisayarlı makinelerde el değmeden yıkama, kapalı kurutma odalarında hijyenik kurutma.",
        ctaPrimaryText: "WhatsApp'tan Servis Çağır",
        ctaPrimaryLink: "https://wa.me/905350000000?text=Merhaba,%20hali%20yikama%20icin%20servis%20istiyorum",
        ctaSecondaryText: "Fiyat Listesini İncele",
        ctaSecondaryLink: "#fiyatlar",
        bgImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Yıkanan Halı", value: "95.000+ m²" },
          { label: "Memnun Müşteri", value: "18.000+" },
          { label: "Teslimat Süresi", value: "3 Gün" }
        ]
      },
      about: {
        enabled: true,
        badge: "Fabrikamız",
        title: "Son Teknoloji Hijyen Standartları",
        content: "Halılarınızın dokusuna ve iplik yapısına uygun pH dengeli şampuanlar kullanarak derinlemesine mayt ve leke temizliği yapıyoruz.",
        yearsExperience: "10+",
        completedProjects: "18.000+",
        bullets: [
          "Ücretsiz Adresten Alım ve Poşetli Teslimat",
          "Toz Alma ve Leke Ayrıştırma Ünitesi",
          "Kapalı ve Klimalı Kurutma Odaları",
          "Beğenilmeyen Halıya Ücretsiz Yeniden Yıkama Garantisi"
        ],
        image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Hizmetlerimiz",
        title: "Ev ve İş Yeri Temizlik Çözümleri",
        subtitle: "Profesyonel makinelerle yerinde veya fabrikamızda kusursuz temizlik.",
        items: [
          { id: "s1", title: "Otomatik Halı Yıkama", desc: "El dokuma, yün, shaggy ve makine halıları için özel yıkama programları.", price: "m² 45 ₺'den Başlayan" },
          { id: "s2", title: "Yerinde Koltuk & Yatak Yıkama", desc: "Vakumlu sıcak su püskürtmeli Alman makinelerle derinlemesine koltuk temizliği.", price: "Takım 650 ₺" },
          { id: "s3", title: "Stor & Zebra Perde Temizliği", desc: "Mekanizmalarına zarar vermeden özel leke çıkarıcılarla tertemiz perde yıkama.", price: "m² 50 ₺" },
          { id: "s4", title: "Yorgan & Battaniye Yıkama", desc: "Endüstriyel hijyenik kazanlarda tek tek ve yumuşatıcı ile yıkama.", price: "Adet 150 ₺" }
        ]
      },
      faqs: {
        enabled: true,
        badge: "SSS",
        title: "Merak Edilenler",
        subtitle: "Yıkama ve teslimat hakkında sorularınız.",
        items: [
          { id: "f1", q: "Halılar kaç günde teslim edilir?", a: "Halılarınız alındıktan sonra 3 ile 4 iş günü içerisinde tamamen kurutulmuş ve parfümlenmiş olarak teslim edilir." },
          { id: "f2", q: "Servis ücreti alıyor musunuz?", a: "Hayır, belirli miktar üzerindeki siparişlerde adresten alım ve teslimat tamamen ücretsizdir." }
        ]
      }
    }
  },
  {
    id: "evden-eve-nakliyat",
    name: "Asansörlü Evden Eve Nakliyat",
    sector: "Taşımacılık & Lojistik",
    category: "Taşımacılık",
    badge: "Çok Satan",
    icon: "Package",
    description: "Asansörlü taşıma, sigortalı ambalajlama ve ücretsiz ekspertiz talep formlu modern taşımacılık teması.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[0], // Navy
    defaultData: {
      companyName: "Güven Lojistik Evden Eve Nakliyat",
      sector: "Evden Eve Nakliyat & Depolama",
      slogan: "Eşyalarınızı Kendi Eşyamız Gibi Özenle Taşıyoruz",
      city: "İstanbul & 81 İl",
      phone: "0850 300 00 00",
      whatsapp: "905360000000",
      email: "info@guvennakliyat.com",
      address: "Ataşehir / İstanbul",
      workingHours: "Haftanın 7 Günü Kesintisiz",
      hero: {
        badge: "🚚 Sigortalı & Asansörlü Taşımacılık",
        title: "Stres Yapmadan, Çizilmeden Taşının",
        subtitle: "Mobilya demontaj-montajı, balonlu patpat ambalajlama ve teleskopik dış cephe asansörü ile güvenli nakliye.",
        ctaPrimaryText: "Ücretsiz Fiyat Teklifi Al",
        ctaPrimaryLink: "https://wa.me/905360000000?text=Evden%20eve%20nakliyat%20fiyat%20teklifi%20istiyorum",
        ctaSecondaryText: "Hizmetlerimizi İncele",
        ctaSecondaryLink: "#hizmetler",
        bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Taşınan Ev", value: "9.200+" },
          { label: "Asansörlü Araç", value: "14 Araç" },
          { label: "Müşteri Memnuniyeti", value: "%99.8" }
        ]
      },
      about: {
        enabled: true,
        badge: "Hakkımızda",
        title: "20 Yıllık Sektör Tecrübesi",
        content: "Eşyalarınızın her birini özel ithal havalı naylonlarla sarıyor, beyaz eşya ve mobilyalarınızı yeni evinizde çalışır halde kuruyoruz.",
        yearsExperience: "20+",
        completedProjects: "9.200+",
        bullets: [
          "Tüm Eşyalara Geniş Kapsamlı Taşıma Sigortası",
          "15. Kata Kadar Ulaşan Dış Cephe Asansörü",
          "Marangozlu ve Tesisatçılı Profesyonel Ekip",
          "Sabit Fiyat Sözleşmesi (Ek Masraf Çıkmaz)"
        ],
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Hizmetlerimiz",
        title: "Kapsamlı Nakliyat Hizmetleri",
        subtitle: "İhtiyacınıza özel taşıma ve ambalaj çözümleri.",
        items: [
          { id: "s1", title: "Şehir İçi Evden Eve", desc: "Aynı gün içinde anahtar teslim güvenli daire ve villa taşımacılığı." },
          { id: "s2", title: "Şehirlerarası Nakliyat", desc: "Kapalı çelik kasa araçlarla Türkiye'nin her yerine tarifeli ve sigortalı taşıma." },
          { id: "s3", title: "Ofis & Büro Taşımacılığı", desc: "Evrak ve teknolojik ekipmanlar için numaralandırılmış özel kutulama." },
          { id: "s4", title: "Güvenli Eşya Depolama", desc: "7/24 kamera ve güvenlik sistemli, rutubetsiz kişiye özel kilitli depolar." }
        ]
      },
      faqs: {
        enabled: true,
        badge: "SSS",
        title: "Taşınma Öncesi Sorulanlar",
        subtitle: "Süreç nasıl işler?",
        items: [
          { id: "f1", q: "Fiyat nasıl belirleniyor?", a: "Eşya oda sayısı (2+1, 3+1), kat durumu, asansör gereksinimi ve mesafe üzerinden şeffaf teklif verilir." },
          { id: "f2", q: "Mobilyaları siz mi söküp kuruyorsunuz?", a: "Evet, ekibimizdeki uzman marangoz dolap, yatak ve üniteleri söküp yeni evinizde eksiksiz kurar." }
        ]
      }
    }
  },
  {
    id: "kombi-klima-servisi",
    name: "Kombi & Klima Yetkili Teknik Servisi",
    sector: "Teknik Servis & İklimlendirme",
    category: "Teknik Servis",
    badge: "1 Yıl Garanti",
    icon: "Wrench",
    description: "Arıza kaydı oluşturma, periyodik bakım fiyatları ve orijinal yedek parça garantili servis şablonu.",
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    defaultColors: COLOR_PALETTES[0], // Navy
    defaultData: {
      companyName: "Merkez İklimlendirme & Kombi Servisi",
      sector: "Kombi, Klima & Petek Temizliği",
      slogan: "Aynı Gün Servis, 1 Yıl Parça ve İşçilik Garantisi",
      city: "Tüm İl Geneli",
      phone: "0850 444 11 22",
      whatsapp: "905370000000",
      email: "destek@merkezkombiservis.com",
      address: "Sanayi Mah. Teknik Hizmetler Merkezi",
      workingHours: "08:00 - 22:00 (Nöbetçi Servis)",
      hero: {
        badge: "🔧 Orijinal Yedek Parça & Garantili İşçilik",
        title: "Kombiniz ve Klimanız Emin Ellerde",
        subtitle: "Kışın soğukta, yazın sıcakta kalmayın. Uzman teknisyenlerimiz arıza ve bakım için 2 saatte kapınızda.",
        ctaPrimaryText: "Acil Servis Çağır",
        ctaPrimaryLink: "tel:08504441122",
        ctaSecondaryText: "WhatsApp Arıza Bildir",
        ctaSecondaryLink: "https://wa.me/905370000000?text=Kombi/Klima%20arizasi%20icin%20servis%20talep%20ediyorum",
        bgImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
        stats: [
          { label: "Tamamlanan Servis", value: "24.000+" },
          { label: "Mobil Servis Aracı", value: "18 Araç" },
          { label: "Garanti Süresi", value: "1 Yıl" }
        ]
      },
      about: {
        enabled: true,
        badge: "Hakkımızda",
        title: "Tüm Markalarda Uzman Kadro",
        content: "ECA, Baymak, Demirdöküm, Vaillant, Bosch, Arçelik, Daikin gibi tüm lider markaların cihazlarında TSE standartlarında arıza tespiti yapıyoruz.",
        yearsExperience: "16+",
        completedProjects: "24.000+",
        bullets: [
          "1 Yıl Süreli Parça ve İşçilik Garanti Belgesi",
          "Cihaz Başında Şeffaf Fiyatlandırma",
          "İlaçlı ve Makineli Petek Temizliği",
          "Kredi Kartı ile Kapıda Ödeme Kolaylığı"
        ],
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
      },
      services: {
        enabled: true,
        badge: "Hizmetlerimiz",
        title: "Teknik Servis Çözümlerimiz",
        subtitle: "Kombi, klima ve ısıtma sistemlerinde profesyonel müdahale.",
        items: [
          { id: "s1", title: "Kombi Arıza Tamiri & Kart Onarımı", desc: "Ateşleme, su basıncı, sirkülasyon pompası ve elektronik kart arızalarında hızlı çözüm." },
          { id: "s2", title: "Periyodik Kombi Bakımı", desc: "Brülör temizliği, genleşme tankı havası ve gaz kaçağı kontrolleri ile %30 doğalgaz tasarrufu." },
          { id: "s3", title: "Makineli Petek Temizliği", desc: "Özel koruyucu kimyasal ve çift yönlü yıkama makinesiyle ısınmayan peteklere son." },
          { id: "s4", title: "Klima Montajı & Gaz Dolumu", desc: "Klima sökme-takma, R410/R32 gaz basımı ve antibakteriyel filtre dezenfeksiyonu." }
        ]
      },
      faqs: {
        enabled: true,
        badge: "SSS",
        title: "Sıkça Sorulan Sorular",
        subtitle: "Servis süreci hakkında merak edilenler.",
        items: [
          { id: "f1", q: "Değişen parçaların garantisi var mı?", a: "Evet, taktığımız tüm orijinal yedek parçalar ve yaptığımız işçilik 1 yıl resmi servis garantimiz altındadır." },
          { id: "f2", q: "Servis ücreti ne kadar?", a: "Cihazın arızası tespit edildikten sonra onayınız alınmadan hiçbir ücretli işlem yapılmaz." }
        ]
      }
    }
  }
];
