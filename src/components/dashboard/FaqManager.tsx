import React, { useState } from "react";
import { SiteConfig, FaqItem, FaqSectionConfig } from "../../types";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  MoveUp,
  MoveDown,
  Eye,
  Search,
  X,
  Save,
  ChevronDown,
  Layers,
  Check,
  Tag,
  Copy,
  FolderPlus
} from "lucide-react";

interface FaqManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
}

const COMMON_FAQ_CATEGORIES = [
  "Genel",
  "Hizmet Süreci",
  "Fiyatlandırma & Ödeme",
  "Garanti & Güvence",
  "Teknik Detaylar",
  "Randevu & İletişim"
];

export const FaqManager: React.FC<FaqManagerProps> = ({
  config,
  onChange,
  onPreview
}) => {
  // Safe resolution of faqs configuration
  const faqsConfig: FaqSectionConfig = config.faqs || config.faq || {
    enabled: true,
    badge: "Sıkça Sorulanlar",
    title: "Merak Edilen Konular & SSS",
    subtitle: "Hizmetlerimiz, çalışma prensiplerimiz ve güvencelerimiz hakkında en çok sorulan sorular.",
    items: [],
    layout: "single-column",
    accordionStyle: "modern",
    allowMultipleOpen: false,
    showSearch: true
  };

  const items = faqsConfig.items || [];

  // Local States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FaqItem>>({
    q: "",
    a: "",
    question: "",
    answer: "",
    category: "Genel",
    isOpenDefault: false
  });

  const [activeManagerView, setActiveManagerView] = useState<"list" | "preview">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Tümü");
  const [notification, setNotification] = useState<string | null>(null);

  // For interactive live preview accordion
  const [previewOpenSet, setPreviewOpenSet] = useState<Record<string, boolean>>({});

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper to update FAQ config
  const updateFaqConfig = (updates: Partial<FaqSectionConfig>) => {
    const updatedFaqs: FaqSectionConfig = {
      ...faqsConfig,
      ...updates
    };

    onChange({
      ...config,
      faqs: updatedFaqs,
      faq: updatedFaqs
    });
  };

  // Toggle main section visibility
  const handleToggleEnabled = () => {
    const nextState = !faqsConfig.enabled;
    updateFaqConfig({ enabled: nextState });
    showNotification(
      nextState
        ? "SSS akordeon bölümü sitede aktifleştirildi."
        : "SSS akordeon bölümü sitede pasif yapıldı."
    );
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      q: "",
      a: "",
      question: "",
      answer: "",
      category: "Genel",
      isOpenDefault: false
    });
    setModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setFormData({
      q: item.q || item.question || "",
      a: item.a || item.answer || "",
      question: item.question || item.q || "",
      answer: item.answer || item.a || "",
      category: item.category || "Genel",
      isOpenDefault: item.isOpenDefault || false
    });
    setModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qText = (formData.question || formData.q || "").trim();
    const aText = (formData.answer || formData.a || "").trim();

    if (!qText || !aText) {
      showNotification("Lütfen hem soruyu hem de cevabı eksiksiz doldurun.");
      return;
    }

    const categoryText = formData.category?.trim() || "Genel";

    if (editingId) {
      const updatedItems = items.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            q: qText,
            a: aText,
            question: qText,
            answer: aText,
            category: categoryText,
            isOpenDefault: !!formData.isOpenDefault
          };
        }
        return item;
      });
      updateFaqConfig({ items: updatedItems });
      showNotification("Soru-cevap başarıyla güncellendi.");
    } else {
      const newItem: FaqItem = {
        id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        q: qText,
        a: aText,
        question: qText,
        answer: aText,
        category: categoryText,
        isOpenDefault: !!formData.isOpenDefault
      };
      updateFaqConfig({ items: [...items, newItem] });
      showNotification("Yeni soru-cevap akordeona eklendi.");
    }

    setModalOpen(false);
  };

  // Delete
  const handleDeleteItem = (id: string) => {
    if (window.confirm("Bu soru-cevap maddesini akordeondan silmek istediğinize emin misiniz?")) {
      const updated = items.filter((it) => it.id !== id);
      updateFaqConfig({ items: updated });
      showNotification("Soru silindi.");
    }
  };

  // Duplicate
  const handleDuplicateItem = (item: FaqItem) => {
    const duplicated: FaqItem = {
      id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      q: `${item.q || item.question} (Kopya)`,
      a: item.a || item.answer || "",
      question: `${item.question || item.q} (Kopya)`,
      answer: item.answer || item.a || "",
      category: item.category || "Genel",
      isOpenDefault: false
    };
    const index = items.findIndex((it) => it.id === item.id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, duplicated);
    updateFaqConfig({ items: newItems });
    showNotification("Soru-cevap maddesi çoğaltıldı.");
  };

  // Move
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    updateFaqConfig({ items: newItems });
  };

  // Load Sector Template Pack
  const handleLoadIndustryPreset = () => {
    const company = config.companyName || "Firmamız";
    const sectorFaqs: FaqItem[] = [
      {
        id: `faq-preset-1-${Date.now()}`,
        q: `${company} hangi bölgelerde ve çalışma saatlerinde hizmet veriyor?`,
        a: "Şehir geneli ve çevre bölgelerde kesintisiz 7 gün 24 saat acil ve planlı hizmet sağlamaktayız.",
        question: `${company} hangi bölgelerde ve çalışma saatlerinde hizmet veriyor?`,
        answer: "Şehir geneli ve çevre bölgelerde kesintisiz 7 gün 24 saat acil ve planlı hizmet sağlamaktayız.",
        category: "Hizmet Süreci"
      },
      {
        id: `faq-preset-2-${Date.now()}`,
        q: "Fiyatlandırma nasıl yapılıyor, sürpriz veya gizli masraf çıkar mı?",
        a: "Fiyatlarımız talep edilen işlem kapsamına ve mesafeye göre şeffaf bir şekilde işleme başlanmadan önce hesaplanır. Kesinlikle sürpriz ek masraf çıkarılmaz.",
        question: "Fiyatlandırma nasıl yapılıyor, sürpriz veya gizli masraf çıkar mı?",
        answer: "Fiyatlarımız talep edilen işlem kapsamına ve mesafeye göre şeffaf bir şekilde işleme başlanmadan önce hesaplanır. Kesinlikle sürpriz ek masraf çıkarılmaz.",
        category: "Fiyatlandırma & Ödeme"
      },
      {
        id: `faq-preset-3-${Date.now()}`,
        q: "Ödeme seçenekleriniz nelerdir ve fatura kesiliyor mu?",
        a: "Nakit, tüm kredi kartları ve kurumsal havale/EFT ile ödeme kabul etmekteyiz. Hizmet sonrasında kurumsal e-faturanız anında iletilir.",
        question: "Ödeme seçenekleriniz nelerdir ve fatura kesiliyor mu?",
        answer: "Nakit, tüm kredi kartları ve kurumsal havale/EFT ile ödeme kabul etmekteyiz. Hizmet sonrasında kurumsal e-faturanız anında iletilir.",
        category: "Fiyatlandırma & Ödeme"
      },
      {
        id: `faq-preset-4-${Date.now()}`,
        q: "İşlemleriniz ve araçlarınız kurumsal sigorta kapsamında mı?",
        a: "Evet, tüm operasyon ve taşıma süreçlerimiz kurumsal kasko ve sorumluluk sigortası ile %100 güvence altındadır.",
        question: "İşlemleriniz ve araçlarınız kurumsal sigorta kapsamında mı?",
        answer: "Evet, tüm operasyon ve taşıma süreçlerimiz kurumsal kasko ve sorumluluk sigortası ile %100 güvence altındadır.",
        category: "Garanti & Güvence"
      },
      {
        id: `faq-preset-5-${Date.now()}`,
        q: "Çağrı veya talep oluşturduktan sonra ne kadar sürede adrese ulaşıyorsunuz?",
        a: "Konumunuza en yakın mobil ekibimiz yönlendirilir ve trafik şartlarına bağlı olarak ortalama 15-30 dakika içinde yanınızda olur.",
        question: "Çağrı veya talep oluşturduktan sonra ne kadar sürede adrese ulaşıyorsunuz?",
        answer: "Konumunuza en yakın mobil ekibimiz yönlendirilir ve trafik şartlarına bağlı olarak ortalama 15-30 dakika içinde yanınızda olur.",
        category: "Hizmet Süreci"
      }
    ];

    if (window.confirm("Sektörünüze özel 5 adet profesyonel soru-cevap akordeona eklensin mi?")) {
      updateFaqConfig({
        items: [...items, ...sectorFaqs]
      });
      showNotification("Sektörel SSS paketi başarıyla eklendi.");
    }
  };

  // Extract unique categories
  const allCategories = Array.from(
    new Set(
      items
        .map((it) => it.category?.trim())
        .filter(Boolean) as string[]
    )
  );

  // Filtered items
  const filteredItems = items.filter((it) => {
    const q = (it.question || it.q || "").toLowerCase();
    const a = (it.answer || it.a || "").toLowerCase();
    const cat = (it.category || "Genel").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = q.includes(query) || a.includes(query) || cat.includes(query);
    const matchesCategory =
      selectedCategoryFilter === "Tümü" || (it.category?.trim() || "Genel") === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Toggle preview item
  const handleTogglePreviewAccordion = (id: string) => {
    setPreviewOpenSet((prev) => {
      if (faqsConfig.allowMultipleOpen) {
        return {
          ...prev,
          [id]: !prev[id]
        };
      } else {
        return {
          [id]: !prev[id]
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP HEADER & SECTION CONTROL CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Sıkça Sorulan Sorular (SSS Akordeon)
                </h2>
                {faqsConfig.enabled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    Sitede Aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                    Pasif
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Müşterilerinizin en çok merak ettiği soruları ekleyin; açılır kapanır akordeon bileşeni olarak landing page'de otomatik biçimlendirilir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Siteyi Gör</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                faqsConfig.enabled
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{faqsConfig.enabled ? "Bölüm Açık" : "Bölümü Aktif Et"}</span>
            </button>
          </div>
        </div>

        {/* SECTION TEXTS & ACCORDION BEHAVIOR SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Üst Rozet (Badge)
            </label>
            <input
              type="text"
              value={faqsConfig.badge || ""}
              onChange={(e) => updateFaqConfig({ badge: e.target.value })}
              placeholder="Örn: Sıkça Sorulanlar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ana Başlık
            </label>
            <input
              type="text"
              value={faqsConfig.title || ""}
              onChange={(e) => updateFaqConfig({ title: e.target.value })}
              placeholder="Örn: Merak Edilen Konular"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alt Açıklama
            </label>
            <input
              type="text"
              value={faqsConfig.subtitle || ""}
              onChange={(e) => updateFaqConfig({ subtitle: e.target.value })}
              placeholder="Örn: Hizmetlerimiz hakkında en çok sorulan sorular."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
            />
          </div>
        </div>

        {/* ADVANCED ACCORDION SETTINGS */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Akordeon Sütun Düzeni:</span>
              <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ layout: "single-column" })}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    (faqsConfig.layout || "single-column") === "single-column"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tek Sütun (Odaklı)
                </button>
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ layout: "two-columns" })}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    faqsConfig.layout === "two-columns"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  İki Sütun (Izgara)
                </button>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Akordeon Çalışma Prensibi:</span>
              <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ allowMultipleOpen: false })}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    !faqsConfig.allowMultipleOpen
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Bir soru açıldığında diğerleri otomatik kapanır"
                >
                  Tek Açılış (Klasik Akordeon)
                </button>
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ allowMultipleOpen: true })}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    faqsConfig.allowMultipleOpen
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Kullanıcı birden fazla soruyu açık bırakabilir"
                >
                  Çoklu Açılış Serbest
                </button>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Kart Görünüm Stili:</span>
              <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ accordionStyle: "modern" })}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    (faqsConfig.accordionStyle || "modern") === "modern"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Modern Kart
                </button>
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ accordionStyle: "bordered" })}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    faqsConfig.accordionStyle === "bordered"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Çizgili Kart
                </button>
                <button
                  type="button"
                  onClick={() => updateFaqConfig({ accordionStyle: "separated" })}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    faqsConfig.accordionStyle === "separated"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ayrık Minimal
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Google FAQPage JSON-LD SEO şeması otomatik eklenir</span>
          </div>
        </div>
      </div>

      {/* CONTROLS, VIEW TOGGLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* VIEW TABS */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveManagerView("list")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeManagerView === "list"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Soru Listesi ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveManagerView("preview")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeManagerView === "preview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Canlı Akordeon Testi</span>
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadIndustryPreset}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Sektörünüze uygun 5 hazır soru ve cevap yükler"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hazır SSS Paketi Yükle</span>
          </button>

          <button
            type="button"
            id="btn-add-new-faq"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Soru-Cevap Ekle</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      {activeManagerView === "list" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sorularda, cevaplarda veya kategorilerde ara..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* CATEGORY FILTER PILLS */}
            {allCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter("Tümü")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === "Tümü"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tümü ({items.length})
                </button>
                {allCategories.map((cat) => {
                  const count = items.filter((it) => (it.category?.trim() || "Genel") === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategoryFilter === cat
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: QUESTION LIST & MANAGEMENT */}
      {activeManagerView === "list" && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {items.length === 0
                  ? "Henüz Soru-Cevap Maddesi Eklenmemiş"
                  : "Aramanıza Uygun Soru Bulunamadı"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                {items.length === 0
                  ? "Müşterilerinizin karar vermesini kolaylaştırmak ve güven tesis etmek için en sık sorulan 3-6 soru-cevap ekleyin."
                  : "Farklı bir arama terimi deneyin veya kategori filtresini sıfırlayın."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>İlk Soruyu Ekle</span>
                </button>
                {items.length === 0 && (
                  <button
                    type="button"
                    onClick={handleLoadIndustryPreset}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Hazır Paket Yükle</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const actualIndex = items.findIndex((it) => it.id === item.id);
              const question = item.question || item.q || "Başlıksız Soru";
              const answer = item.answer || item.a || "";
              const category = item.category || "Genel";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 font-mono">
                        {actualIndex + 1}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 text-amber-500" />
                            <span>{category}</span>
                          </span>

                          {item.isOpenDefault && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                              İlk Açılışta Açık
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {question}
                        </h4>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {answer}
                        </p>
                      </div>
                    </div>

                    {/* ACTION CONTROLS */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {/* MOVE CONTROLS */}
                      <button
                        type="button"
                        onClick={() => handleMove(actualIndex, "up")}
                        disabled={actualIndex === 0}
                        title="Yukarı Taşı"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(actualIndex, "down")}
                        disabled={actualIndex === items.length - 1}
                        title="Aşağı Taşı"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* DUPLICATE */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(item)}
                        title="Kopyala / Çoğalt"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Düzenle"
                        className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 flex items-center justify-center transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Sil"
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE LIVE ACCORDION PREVIEW */}
      {activeManagerView === "preview" && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span>❓</span>
              <span>{faqsConfig.badge || "Sıkça Sorulanlar"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {faqsConfig.title || "Merak Edilen Konular"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {faqsConfig.subtitle || "Aşağıdaki sorulara tıklayarak açılır akordeon bileşenini test edebilirsiniz."}
            </p>
          </div>

          {/* INTERACTIVE ACCORDION CONTAINER */}
          <div
            className={`max-w-4xl mx-auto ${
              faqsConfig.layout === "two-columns"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
                : "space-y-3"
            }`}
          >
            {items.map((item, idx) => {
              const isOpen = previewOpenSet[item.id] ?? (item.isOpenDefault || idx === 0);
              const q = item.question || item.q;
              const a = item.answer || item.a;

              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? "border-amber-400 bg-white shadow-md ring-2 ring-amber-400/20"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePreviewAccordion(item.id)}
                    className="w-full px-5 py-4 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{q}</span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-amber-500 text-slate-950 rotate-180"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center max-w-xl mx-auto">
            <p className="text-xs text-amber-900 font-medium">
              💡 Bu akordeon sitenizin yayınlanan versiyonunda ve önizlemesinde tam olarak bu şekilde ziyaretçilerinize sunulur.
            </p>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingId ? "Soru-Cevap Düzenle" : "Yeni Soru-Cevap Ekle"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akordeon bileşeninde gösterilecek soru ve cevabı tanımlayın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* CATEGORY SELECT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Örn: Hizmet Süreci, Fiyatlandırma..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_FAQ_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                        formData.category === cat
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUESTION INPUT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Soru Metni <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.question || formData.q || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      q: e.target.value,
                      question: e.target.value
                    })
                  }
                  placeholder="Örn: Hizmet talebi oluşturduktan sonra ne kadar sürede ulaşırsınız?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              {/* ANSWER TEXTAREA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Cevap Metni <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(formData.answer || formData.a || "").length} karakter
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.answer || formData.a || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      a: e.target.value,
                      answer: e.target.value
                    })
                  }
                  placeholder="Müşterinizin sorusuna net, güven veren ve çözüm odaklı açıklayıcı yanıtınızı yazın..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden leading-relaxed"
                />
              </div>

              {/* OPEN BY DEFAULT TOGGLE */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="faq-isOpenDefault"
                  checked={!!formData.isOpenDefault}
                  onChange={(e) => setFormData({ ...formData, isOpenDefault: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="faq-isOpenDefault" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Sayfa açıldığında bu soru varsayılan olarak açık gelsin
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? "Güncelle" : "Akordeona Kaydet"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
