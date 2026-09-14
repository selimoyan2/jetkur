import React, { useState } from "react";
import {
  SiteConfig,
  CustomFormConfig,
  FormFieldConfig,
  FormFieldType,
  FormLead
} from "../../types";
import {
  FormInput,
  CheckSquare,
  Paperclip,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  Hash,
  Mail,
  Phone,
  Radio,
  Type,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
  Send,
  ExternalLink,
  RotateCcw,
  Check
} from "lucide-react";

interface CustomFormManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToLeads?: () => void;
  onNavigateToEmailAutomation?: () => void;
}

// Default initial fields if none present
const DEFAULT_INITIAL_FIELDS: FormFieldConfig[] = [
  {
    id: "lead_name",
    type: "text",
    label: "Adınız Soyadınız",
    placeholder: "Örn: Ahmet Yılmaz",
    required: true,
    width: "full",
    isSystem: true
  },
  {
    id: "lead_phone",
    type: "tel",
    label: "Telefon Numaranız",
    placeholder: "05XX XXX XX XX",
    required: true,
    width: "half",
    isSystem: true
  },
  {
    id: "lead_email",
    type: "email",
    label: "E-Posta Adresiniz",
    placeholder: "ornek@sirket.com",
    required: false,
    width: "half"
  },
  {
    id: "lead_service_category",
    type: "select",
    label: "İlgilendiğiniz Hizmet / Konu",
    placeholder: "Hizmet kategorisi seçiniz...",
    required: true,
    options: [
      "7/24 Şehir İçi Oto Çekici",
      "Ağır Vasıta & Ticari Kurtarma",
      "Yerinde Akü Takviye & Değişim",
      "Şehirlerarası Özel Araç Nakli",
      "Genel Danışmanlık & Kurumsal Filo"
    ],
    width: "half"
  },
  {
    id: "lead_urgency",
    type: "select",
    label: "Aciliyet Durumu / Zamanlama",
    placeholder: "Aciliyet seçiniz...",
    required: false,
    options: [
      "🚨 Acil / Hemen Yoldayım",
      "Bugün İçinde",
      "Bu Hafta Sonu",
      "Fiyat & Bilgi Araştırması"
    ],
    width: "half"
  },
  {
    id: "lead_attachment",
    type: "file",
    label: "Ruhsat, Hasar Fotoğrafı veya Dosya Eki",
    placeholder: "Dosya seçin veya sürükleyin...",
    required: false,
    allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
    maxFileSizeMb: 10,
    helpText: "Fotoğraf, kaza krokisi veya PDF formatında belge yükleyebilirsiniz (Maks 10 MB).",
    width: "full"
  },
  {
    id: "lead_message",
    type: "textarea",
    label: "Talep Detayları / Notunuz",
    placeholder: "Konum, araç modeli veya sormak istediklerinizi kısaca yazın...",
    required: false,
    width: "full",
    isSystem: true
  },
  {
    id: "lead_terms_kvkk",
    type: "checkbox",
    label: "KVKK Aydınlatma Metni'ni okudum ve iletişim bilgilerimin işlenmesini onaylıyorum.",
    required: true,
    defaultValue: true,
    width: "full"
  },
  {
    id: "lead_whatsapp_notify",
    type: "checkbox",
    label: "Teklif ve operasyon durumu WhatsApp üzerinden de mesajla iletilsin.",
    required: false,
    defaultValue: true,
    width: "full"
  }
];

export const CustomFormManager: React.FC<CustomFormManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateToLeads,
  onNavigateToEmailAutomation
}) => {
  // Ensure formConfig exists
  const currentForm: CustomFormConfig = config.customForm || {
    enabled: true,
    title: config.contact?.title || "Hızlı Fiyat Teklifi İsteyin",
    subtitle: config.contact?.subtitle || "Formu doldurun, talebiniz ve belgeleriniz anında ekibimize ulaşsın.",
    submitButtonText: "Ücretsiz Fiyat Teklifi Gönder",
    successMessage: "✅ Talebiniz ve belgeleriniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.",
    redirectWhatsAppAfterSubmit: false,
    notifyEmail: config.email || "info@sirket.com",
    fields: DEFAULT_INITIAL_FIELDS
  };

  const fields = currentForm.fields && currentForm.fields.length > 0 ? currentForm.fields : DEFAULT_INITIAL_FIELDS;

  // Active editing state
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id || null);
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "templates">("fields");
  const [saveToast, setSaveToast] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState("");

  // Live interactive test form state
  const [testFormData, setTestFormData] = useState<Record<string, any>>({
    lead_name: "Test Müşteri",
    lead_phone: "0532 999 88 77",
    lead_email: "test@musteri.com",
    lead_service_category: fields.find(f => f.type === "select")?.options?.[0] || "",
    lead_urgency: "Bugün İçinde",
    lead_terms_kvkk: true,
    lead_whatsapp_notify: true
  });
  const [testFileUploaded, setTestFileUploaded] = useState<{ name: string; size: number } | null>(null);

  // Helper to update form config
  const updateFormConfig = (updates: Partial<CustomFormConfig>) => {
    const updatedForm: CustomFormConfig = {
      ...currentForm,
      ...updates
    };
    const updatedConfig: SiteConfig = {
      ...config,
      customForm: updatedForm
    };
    onChange(updatedConfig);
  };

  // Helper to update fields
  const updateFields = (newFields: FormFieldConfig[]) => {
    updateFormConfig({ fields: newFields });
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Update specific field properties
  const updateFieldProperty = (fieldId: string, updates: Partial<FormFieldConfig>) => {
    const updated = fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f));
    updateFields(updated);
  };

  // Add new field
  const handleAddField = (type: FormFieldType) => {
    const fieldTypeLabels: Record<FormFieldType, { label: string; placeholder: string }> = {
      text: { label: "Özel Metin Alanı", placeholder: "Bilgi giriniz..." },
      textarea: { label: "Açıklama / Detay", placeholder: "Detayları yazınız..." },
      select: { label: "Açılır Menü (Kategori)", placeholder: "Seçiniz..." },
      checkbox: { label: "Onay Kutusu (Şartlar / Tercih)", placeholder: "" },
      file: { label: "Dosya & Belge Yükleme", placeholder: "Dosya seçin veya sürükleyin..." },
      radio: { label: "Tercih Seçimi (Radyo)", placeholder: "" },
      email: { label: "E-Posta Adresi", placeholder: "ornek@sirket.com" },
      tel: { label: "Telefon Numarası", placeholder: "05XX XXX XX XX" },
      number: { label: "Adet / Miktar", placeholder: "1" },
      date: { label: "Tercih Edilen Tarih", placeholder: "" }
    };

    const newId = `field_${Date.now()}`;
    const info = fieldTypeLabels[type] || { label: "Yeni Alan", placeholder: "" };

    const newField: FormFieldConfig = {
      id: newId,
      type,
      label: info.label,
      placeholder: info.placeholder,
      required: false,
      width: type === "select" || type === "tel" || type === "email" || type === "number" ? "half" : "full",
      options: type === "select" || type === "radio" ? ["Seçenek 1", "Seçenek 2", "Seçenek 3"] : undefined,
      allowedFileTypes: type === "file" ? ".pdf,.png,.jpg,.jpeg,.doc,.docx" : undefined,
      maxFileSizeMb: type === "file" ? 10 : undefined,
      helpText: type === "file" ? "PDF, PNG, JPG formatlarında en fazla 10 MB dosya yükleyebilirsiniz." : undefined,
      defaultValue: type === "checkbox" ? false : undefined
    };

    const updated = [...fields, newField];
    updateFields(updated);
    setSelectedFieldId(newId);
    showSaveNotification();
  };

  // Remove field
  const handleDeleteField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.isSystem) {
      if (!window.confirm("Bu alan temel iletişim alanlarından biridir. Silmek istediğinize emin misiniz?")) {
        return;
      }
    }
    const filtered = fields.filter((f) => f.id !== fieldId);
    updateFields(filtered);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(filtered[0]?.id || null);
    }
    showSaveNotification();
  };

  // Move field order
  const handleMoveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const copy = [...fields];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateFields(copy);
  };

  // Duplicate field
  const handleDuplicateField = (field: FormFieldConfig) => {
    const duplicated: FormFieldConfig = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Kopya)`,
      isSystem: false
    };
    const index = fields.findIndex((f) => f.id === field.id);
    const copy = [...fields];
    copy.splice(index + 1, 0, duplicated);
    updateFields(copy);
    setSelectedFieldId(duplicated.id);
    showSaveNotification();
  };

  // Add option to select/radio
  const handleAddOption = (fieldId: string) => {
    if (!newOptionInput.trim()) return;
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const currentOptions = field.options || [];
    updateFieldProperty(fieldId, {
      options: [...currentOptions, newOptionInput.trim()]
    });
    setNewOptionInput("");
  };

  // Remove option from select/radio
  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const updated = field.options.filter((_, idx) => idx !== optionIndex);
    updateFieldProperty(fieldId, { options: updated });
  };

  const showSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Pre-made Industry Templates
  const handleApplyTemplate = (templateType: "teklif" | "servis" | "ik" | "b2b") => {
    if (!window.confirm("Seçtiğiniz hazır şablon mevcut form alanlarınızı güncelleyecektir. Devam etmek istiyor musunuz?")) {
      return;
    }

    let templateFields: FormFieldConfig[] = [];
    let title = currentForm.title;
    let subtitle = currentForm.subtitle;

    if (templateType === "teklif") {
      title = "Hızlı Fiyat Teklifi ve Keşif Talebi";
      subtitle = "Hizmet detaylarını belirtin, varsa çizim veya fotoğraf ekleyin; en uygun teklifi dakikalar içinde sunalım.";
      templateFields = [
        { id: "lead_name", type: "text", label: "Adınız Soyadınız", placeholder: "Ad Soyad", required: true, width: "full", isSystem: true },
        { id: "lead_phone", type: "tel", label: "Telefon Numaranız", placeholder: "05XX XXX XX XX", required: true, width: "half", isSystem: true },
        { id: "lead_email", type: "email", label: "E-Posta Adresiniz", placeholder: "ornek@sirket.com", required: false, width: "half" },
        { id: "lead_category", type: "select", label: "İlgilendiğiniz Hizmet Alanı", required: true, width: "half", options: ["Standart Hizmet Paketi", "Acil / Ekspres Hizmet", "Özel Projelendirme", "Yıllık Bakım & Sözleşme"] },
        { id: "lead_budget", type: "select", label: "Tahmini Bütçe Aralığı", required: false, width: "half", options: ["1.000 ₺ - 5.000 ₺", "5.000 ₺ - 20.000 ₺", "20.000 ₺ - 50.000 ₺", "50.000 ₺ ve üzeri"] },
        { id: "lead_attachment", type: "file", label: "Proje Çizimi, Fotoğraf veya Teknik Şartname", required: false, allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.doc,.docx", maxFileSizeMb: 15, helpText: "PDF veya resim olarak çizim/şartname ekleyebilirsiniz.", width: "full" },
        { id: "lead_message", type: "textarea", label: "Proje ve Talep Detayları", placeholder: "Talebinizi özetleyin...", required: false, width: "full", isSystem: true },
        { id: "lead_kvkk", type: "checkbox", label: "KVKK Aydınlatma Metni'ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else if (templateType === "servis") {
      title = "Arıza Bildirimi & Teknik Servis Talebi";
      subtitle = "Cihaz veya araç arızasını bildirin, arıza görselini yükleyin; en yakın mobil ekibimiz yönlendirilsin.";
      templateFields = [
        { id: "lead_name", type: "text", label: "Adınız Soyadınız / Firma Ünvanı", placeholder: "Ad Soyad", required: true, width: "full", isSystem: true },
        { id: "lead_phone", type: "tel", label: "İletişim Numarası", placeholder: "05XX XXX XX XX", required: true, width: "half", isSystem: true },
        { id: "lead_fault_type", type: "select", label: "Arıza / Problem Türü", required: true, width: "half", options: ["Cihaz Çalışmıyor / Elektrik Yok", "Mekanik Ses / Titreşim", "Yazılım / Kontrol Hatası", "Periyodik Bakım & Kontrol", "Diğer"] },
        { id: "lead_urgency", type: "select", label: "Aciliyet Derecesi", required: true, width: "half", options: ["🚨 Çok Acil (İş Durdu)", "Bugün İçinde Müdahale", "Normal / Planlı Ziyaret"] },
        { id: "lead_date", type: "date", label: "Servis İçin Uygun Tarih", required: false, width: "half" },
        { id: "lead_attachment", type: "file", label: "Arıza Fotoğrafı, Hata Ekranı veya Video/Belge", required: false, allowedFileTypes: ".png,.jpg,.jpeg,.pdf", maxFileSizeMb: 20, helpText: "Arızalı parçanın veya hata kodunun net fotoğrafını yükleyin.", width: "full" },
        { id: "lead_address", type: "textarea", label: "Açık Adres & Konum Tarifi", placeholder: "İlçe, mahalle ve bina/daire bilgisi...", required: true, width: "full" },
        { id: "lead_kvkk", type: "checkbox", label: "Servis çağrı şartlarını ve KVKK aydınlatma metnini onaylıyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else if (templateType === "ik") {
      title = "Kariyer & İş Başvuru Formu";
      subtitle = "Büyüyen ekibimize katılmak için bilgilerinizi ve güncel CV'nizi iletin.";
      templateFields = [
        { id: "lead_name", type: "text", label: "Adınız Soyadınız", placeholder: "Ad Soyad", required: true, width: "full", isSystem: true },
        { id: "lead_phone", type: "tel", label: "Telefon", placeholder: "05XX XXX XX XX", required: true, width: "half", isSystem: true },
        { id: "lead_email", type: "email", label: "E-Posta", placeholder: "ornek@gmail.com", required: true, width: "half" },
        { id: "lead_position", type: "select", label: "Başvurulan Pozisyon", required: true, width: "half", options: ["Saha Teknikeri / Operatör", "Satış & Müşteri Temsilcisi", "Dijital Pazarlama & Sosyal Medya", "Muhasebe & Finans", "Genel Başvuru"] },
        { id: "lead_exp", type: "select", label: "İlgili Alandaki Deneyiminiz", required: true, width: "half", options: ["Yeni Mezun / Deneyimsiz", "1-3 Yıl", "3-5 Yıl", "5+ Yıl Kıdemli"] },
        { id: "lead_attachment", type: "file", label: "Özgeçmiş / CV Dosyası (PDF)", required: true, allowedFileTypes: ".pdf,.doc,.docx", maxFileSizeMb: 10, helpText: "Lütfen güncel özgeçmişinizi PDF olarak yükleyiniz.", width: "full" },
        { id: "lead_message", type: "textarea", label: "Ön Yazı / Kendinizi Kısaca Tanıtın", placeholder: "Kariyer hedeflerinizden bahsedin...", required: false, width: "full" },
        { id: "lead_kvkk", type: "checkbox", label: "Aday Aydınlatma Metni kapsamında verilerimin değerlendirilmesini kabul ediyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else if (templateType === "b2b") {
      title = "Bayilik & Toptan Fiyat Teklifi Formu";
      subtitle = "Toptan alım, bayi iş ortaklığı ve kurumsal indirimler için formu doldurun.";
      templateFields = [
        { id: "lead_company", type: "text", label: "Firma Ticari Ünvanı", placeholder: "Örn: ABC Ticaret Ltd. Şti.", required: true, width: "full" },
        { id: "lead_name", type: "text", label: "Yetkili Adı Soyadı", placeholder: "Ad Soyad", required: true, width: "half", isSystem: true },
        { id: "lead_phone", type: "tel", label: "Yetkili Telefon Numarası", placeholder: "05XX XXX XX XX", required: true, width: "half", isSystem: true },
        { id: "lead_email", type: "email", label: "Kurumsal E-Posta", placeholder: "info@firma.com", required: true, width: "half" },
        { id: "lead_city", type: "text", label: "Faaliyet Gösterilen İl / Bölge", placeholder: "Örn: İzmir / Ege Bölgesi", required: true, width: "half" },
        { id: "lead_volume", type: "select", label: "Hedeflenen Aylık / Yıllık Alım Hacmi", required: true, width: "full", options: ["50.000 ₺ - 150.000 ₺", "150.000 ₺ - 500.000 ₺", "500.000 ₺ ve üzeri"] },
        { id: "lead_attachment", type: "file", label: "Vergi Levhası veya Faaliyet Belgesi", required: false, allowedFileTypes: ".pdf,.png,.jpg", maxFileSizeMb: 10, helpText: "Hızlı onay için vergi levhanızı ekleyebilirsiniz.", width: "full" },
        { id: "lead_message", type: "textarea", label: "Mevcut Satış Kanallarınız & Notlar", placeholder: "Mağaza sayısı, e-ticaret siteniz vb.", required: false, width: "full" },
        { id: "lead_kvkk", type: "checkbox", label: "B2B Bayilik sözleşme ön şartlarını ve KVKK metnini onaylıyorum.", required: true, defaultValue: true, width: "full" }
      ];
    }

    updateFormConfig({
      title,
      subtitle,
      fields: templateFields
    });
    setSelectedFieldId(templateFields[0]?.id || null);
    showSaveNotification();
  };

  // Test form submission logic
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLead: FormLead = {
      id: `lead-test-${Date.now()}`,
      date: `Bugün ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
      name: testFormData.lead_name || "Test Form Müşterisi",
      phone: testFormData.lead_phone || "0532 000 00 00",
      email: testFormData.lead_email || "test@ornek.com",
      serviceOrProduct: testFormData.lead_service_category || testFormData.lead_fault_type || testFormData.lead_position || "Özel Form Talebi",
      message: testFormData.lead_message || testFormData.lead_address || "Form Editörü üzerinden gönderilen test talebi.",
      sourcePage: "Canlı Form Önizleme (Editör Testi)",
      status: "new",
      customFields: { ...testFormData },
      attachments: testFileUploaded
        ? [{ name: testFileUploaded.name, size: testFileUploaded.size, type: "application/octet-stream" }]
        : [{ name: "ornek_proje_cizimi.pdf", size: 1024000, type: "application/pdf" }]
    };

    const currentLeads = config.leads || [];
    const updatedConfig: SiteConfig = {
      ...config,
      leads: [newLead, ...currentLeads]
    };
    onChange(updatedConfig);

    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 4000);
  };

  // Get icon for field type
  const getFieldIcon = (type: FormFieldType) => {
    switch (type) {
      case "text":
        return <Type className="w-4 h-4 text-blue-500" />;
      case "textarea":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case "select":
        return <ChevronDown className="w-4 h-4 text-amber-500" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case "file":
        return <Paperclip className="w-4 h-4 text-rose-500" />;
      case "radio":
        return <Radio className="w-4 h-4 text-indigo-500" />;
      case "email":
        return <Mail className="w-4 h-4 text-cyan-500" />;
      case "tel":
        return <Phone className="w-4 h-4 text-green-500" />;
      case "number":
        return <Hash className="w-4 h-4 text-orange-500" />;
      case "date":
        return <Calendar className="w-4 h-4 text-teal-500" />;
      default:
        return <FormInput className="w-4 h-4 text-slate-500" />;
    }
  };

  const getFieldTypeName = (type: FormFieldType) => {
    switch (type) {
      case "select":
        return "Açılır Menü (Dropdown)";
      case "checkbox":
        return "Onay Kutusu (Checkbox)";
      case "file":
        return "Dosya Yükleme (File Upload)";
      case "text":
        return "Kısa Metin";
      case "textarea":
        return "Çok Satırlı Metin";
      case "radio":
        return "Radyo Seçimi";
      case "email":
        return "E-Posta";
      case "tel":
        return "Telefon";
      case "number":
        return "Sayı / Tutar";
      case "date":
        return "Tarih";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-950 text-white border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">Form alanları başarıyla güncellendi</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <FormInput className="w-3.5 h-3.5 text-indigo-400" />
              <span>Esnek Form & Talep Oluşturucu</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Form Yönetimi</span>
              <span className="text-amber-400 text-sm font-normal">
                (Açılır Menüler, Onay Kutuları & Dosya Yükleme)
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Müşterilerinizden teklif ve sipariş toplarken kendi sektörünüze özel alanlar tanımlayın.
              Açılır listeler (dropdown), şart kutuları (checkbox), PDF/fotoğraf yükleme alanları ekleyin;
              gelen tüm veriler anında <strong>Müşteri Form Talepleri</strong> CRM paneline düşsün.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToLeads && (
              <button
                type="button"
                onClick={onNavigateToLeads}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
                title="Gelen form taleplerini görüntüleyin"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Gelen Talepler ({config.leads?.length || 0})</span>
              </button>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Sitede Gör</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP TABS & FORM GENERAL TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("fields")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "fields"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FormInput className="w-4 h-4 text-indigo-400" />
            <span>Form Alanları ({fields.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "settings"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Form Başlığı & Ayarlar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "templates"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Hazır Sektörel Şablonlar</span>
          </button>
        </div>

        {/* Form Enable/Disable Switch */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentForm.enabled}
              onChange={(e) => updateFormConfig({ enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span>Form Sitede Yayında</span>
          </label>
        </div>
      </div>

      {/* TAB 1: FORM ALANLARI & EDITÖR */}
      {activeTab === "fields" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: FIELD LIST & ADD PALETTE (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Add Palette */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Yeni Özel Alan Ekle</span>
                </span>
                <span className="text-[11px] text-slate-400">Tek tıkla forma dahil edin</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. Select / Dropdown */}
                <button
                  type="button"
                  onClick={() => handleAddField("select")}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 group-hover:text-amber-900">Açılır Menü</div>
                    <div className="text-[10px] text-amber-700">Seçenek Listesi</div>
                  </div>
                </button>

                {/* 2. Checkbox */}
                <button
                  type="button"
                  onClick={() => handleAddField("checkbox")}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-900">Onay Kutusu</div>
                    <div className="text-[10px] text-emerald-700">KVKK / Şartlar</div>
                  </div>
                </button>

                {/* 3. File Upload */}
                <button
                  type="button"
                  onClick={() => handleAddField("file")}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-950 group-hover:text-rose-900">Dosya Yükleme</div>
                    <div className="text-[10px] text-rose-700">PDF, Fotoğraf Eki</div>
                  </div>
                </button>

                {/* 4. Text Input */}
                <button
                  type="button"
                  onClick={() => handleAddField("text")}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 group-hover:text-blue-900">Metin Alanı</div>
                    <div className="text-[10px] text-blue-700">Ad, Konu, Şehir</div>
                  </div>
                </button>

                {/* 5. Textarea */}
                <button
                  type="button"
                  onClick={() => handleAddField("textarea")}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-950 group-hover:text-purple-900">Çok Satırlı Not</div>
                    <div className="text-[10px] text-purple-700">Adres, Açıklama</div>
                  </div>
                </button>

                {/* 6. Date */}
                <button
                  type="button"
                  onClick={() => handleAddField("date")}
                  className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-950 group-hover:text-teal-900">Tarih Seçici</div>
                    <div className="text-[10px] text-teal-700">Randevu / Gün</div>
                  </div>
                </button>
              </div>
            </div>

            {/* List of Form Fields */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Aktif Form Alanları</h3>
                  <p className="text-xs text-slate-500">Alanları sıralayabilir veya özelliklerini sağ panelden düzenleyebilirsiniz.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFields(DEFAULT_INITIAL_FIELDS)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold cursor-pointer"
                  title="Varsayılan form alanlarına sıfırlayın"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Sıfırla</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {fields.map((field, idx) => {
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {getFieldIcon(field.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {field.label}
                            </span>
                            {field.required && (
                              <span className="text-rose-500 font-bold text-xs" title="Zorunlu Alan">*</span>
                            )}
                            {field.isSystem && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-mono">
                                Çekirdek
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-500">{getFieldTypeName(field.type)}</span>
                            <span>•</span>
                            <span>{field.width === "half" ? "Yarım Genişlik (1/2)" : "Tam Genişlik"}</span>
                            {field.options && field.options.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-amber-700 font-mono font-bold">{field.options.length} Seçenek</span>
                              </>
                            )}
                            {field.type === "file" && (
                              <>
                                <span>•</span>
                                <span className="text-rose-700 font-mono font-bold">Maks {field.maxFileSizeMb || 10}MB</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Field Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, "down")}
                          disabled={idx === fields.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateField(field)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          title="Alanı Çoğalt"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SELECTED FIELD PROPERTY EDITOR (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {selectedField ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs sticky top-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    {getFieldIcon(selectedField.type)}
                    <h3 className="text-sm font-bold text-slate-900">
                      Alan Özellikleri
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
                    {selectedField.id}
                  </span>
                </div>

                {/* 1. Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alan Etiketi (Görünen Başlık) *
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updateFieldProperty(selectedField.id, { label: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* 2. Type & Width */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alan Türü
                    </label>
                    <select
                      value={selectedField.type}
                      onChange={(e) => {
                        const newType = e.target.value as FormFieldType;
                        updateFieldProperty(selectedField.id, {
                          type: newType,
                          options: newType === "select" || newType === "radio" ? (selectedField.options || ["Seçenek 1", "Seçenek 2"]) : undefined
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="text">Kısa Metin</option>
                      <option value="textarea">Çok Satırlı Not</option>
                      <option value="select">Açılır Menü (Select)</option>
                      <option value="checkbox">Onay Kutusu (Checkbox)</option>
                      <option value="file">Dosya Yükleme (File)</option>
                      <option value="radio">Radyo Buton Grubu</option>
                      <option value="email">E-Posta</option>
                      <option value="tel">Telefon</option>
                      <option value="number">Sayı / Miktar</option>
                      <option value="date">Tarih</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Izgara Genişliği
                    </label>
                    <select
                      value={selectedField.width || "full"}
                      onChange={(e) => updateFieldProperty(selectedField.id, { width: e.target.value as "full" | "half" })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="full">Tam Genişlik (100%)</option>
                      <option value="half">Yarım Genişlik (50% - Yan yana)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Placeholder (for text, textarea, select, file) */}
                {selectedField.type !== "checkbox" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Yer Tutucu (Placeholder)
                    </label>
                    <input
                      type="text"
                      value={selectedField.placeholder || ""}
                      onChange={(e) => updateFieldProperty(selectedField.id, { placeholder: e.target.value })}
                      placeholder="Kullanıcıya gösterilecek örnek metin..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* 4. Options Manager (If SELECT or RADIO) */}
                {(selectedField.type === "select" || selectedField.type === "radio") && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <ChevronDown className="w-4 h-4 text-amber-600" />
                        <span>Açılır Menü Seçenekleri ({selectedField.options?.length || 0})</span>
                      </label>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(selectedField.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] font-mono text-slate-400 w-4">{oIdx + 1}.</span>
                          <span className="text-xs font-medium text-slate-800 flex-1 truncate">{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(selectedField.id, oIdx)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Seçeneği sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new option input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption(selectedField.id);
                          }
                        }}
                        placeholder="Yeni seçenek yazın (örn: VIP Taşıma)..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOption(selectedField.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Ekle
                      </button>
                    </div>

                    {/* Quick Preset Options */}
                    <div className="pt-2 border-t border-amber-200/70">
                      <div className="text-[10px] font-bold text-amber-900 mb-1">Hızlı Hazır Seçenekler:</div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, {
                            options: (config.services?.items || []).map(s => s.title)
                          })}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-[10px] text-amber-800 border border-amber-300 cursor-pointer"
                        >
                          Hizmetlerimden Çek
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, {
                            options: ["🚨 Acil (Hemen)", "Bugün İçinde", "Bu Hafta Sonu", "Planlı / İleri Tarih"]
                          })}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-[10px] text-amber-800 border border-amber-300 cursor-pointer"
                        >
                          Aciliyet Seviyeleri
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, {
                            options: ["1.000₺ - 5.000₺", "5.000₺ - 15.000₺", "15.000₺ - 50.000₺", "50.000₺+"]
                          })}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-[10px] text-amber-800 border border-amber-300 cursor-pointer"
                        >
                          Bütçe Aralıkları
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. File Upload Settings (If FILE) */}
                {selectedField.type === "file" && (
                  <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3">
                    <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-rose-600" />
                      <span>Dosya Yükleme Ayarları</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">
                        İzin Verilen Dosya Uzantıları
                      </label>
                      <input
                        type="text"
                        value={selectedField.allowedFileTypes || ".pdf,.png,.jpg,.jpeg,.doc,.docx"}
                        onChange={(e) => updateFieldProperty(selectedField.id, { allowedFileTypes: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-xs font-mono text-slate-800 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, { allowedFileTypes: ".pdf,.doc,.docx" })}
                          className="px-2 py-0.5 rounded bg-white text-[10px] text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Sadece Belgeler (PDF/DOC)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, { allowedFileTypes: ".png,.jpg,.jpeg,.webp" })}
                          className="px-2 py-0.5 rounded bg-white text-[10px] text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Sadece Fotoğraflar (PNG/JPG)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(selectedField.id, { allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.dwg" })}
                          className="px-2 py-0.5 rounded bg-white text-[10px] text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Tümü (CAD Dahil)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">
                        Maksimum Dosya Boyutu: <strong className="font-mono">{selectedField.maxFileSizeMb || 10} MB</strong>
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="1"
                        value={selectedField.maxFileSizeMb || 10}
                        onChange={(e) => updateFieldProperty(selectedField.id, { maxFileSizeMb: parseInt(e.target.value) })}
                        className="w-full accent-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">
                        Kullanıcı Yardım Metni
                      </label>
                      <input
                        type="text"
                        value={selectedField.helpText || ""}
                        onChange={(e) => updateFieldProperty(selectedField.id, { helpText: e.target.value })}
                        placeholder="Örn: Net fotoğraf veya PDF yükleyiniz (Maks 10 MB)..."
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Checkbox Settings (If CHECKBOX) */}
                {selectedField.type === "checkbox" && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>Onay Kutusu Özellikleri</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedField.defaultValue)}
                        onChange={(e) => updateFieldProperty(selectedField.id, { defaultValue: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Sayfa açıldığında varsayılan olarak işaretli gelsin</span>
                    </label>
                  </div>
                )}

                {/* 7. Required Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Doldurulması Zorunlu Alan</div>
                    <div className="text-[11px] text-slate-400">Kullanıcı doldurmadan formu gönderemez</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => updateFieldProperty(selectedField.id, { required: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                <FormInput className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold">Özelliklerini düzenlemek için soldaki listeden bir alana tıklayın.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORM BAŞLIĞI & AYARLARI */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Form Genel Ayarları & Bildirimler</h2>
            <p className="text-xs text-slate-500 mt-0.5">Form başlıkları, buton metinleri ve form gönderildiğinde tetiklenecek aksiyonlar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Form Başlığı (H3) *
              </label>
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => updateFormConfig({ title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gönder Butonu Metni *
              </label>
              <input
                type="text"
                value={currentForm.submitButtonText}
                onChange={(e) => updateFormConfig({ submitButtonText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Form Alt Başlığı / Açıklama
              </label>
              <input
                type="text"
                value={currentForm.subtitle}
                onChange={(e) => updateFormConfig({ subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Başarılı Gönderim Bildirim Metni (Yeşil Uyarı Kartı)
              </label>
              <input
                type="text"
                value={currentForm.successMessage}
                onChange={(e) => updateFormConfig({ successMessage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bildirim E-Posta Adresi
              </label>
              <input
                type="email"
                value={currentForm.notifyEmail || ""}
                onChange={(e) => updateFormConfig({ notifyEmail: e.target.value })}
                placeholder="info@sirketiniz.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">Form doldurulduğunda talepler ayrıca panelinize ve bu e-postaya yönlendirilir.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp İle Otomatik Mesajlaşma
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={Boolean(currentForm.redirectWhatsAppAfterSubmit)}
                  onChange={(e) => updateFormConfig({ redirectWhatsAppAfterSubmit: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Form Gönderildiğinde WhatsApp Aç</span>
                  <p className="text-[10px] text-slate-400">Müşterinin girdiği bilgileri özet WhatsApp mesajı olarak yetkili hatta iletir.</p>
                </div>
              </label>
            </div>

            {/* Email Automation (Autoresponder) Integration Card */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-sky-50/80 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950 flex items-center gap-2">
                    <span>Email Automation Settings (Zengin Metin Teşekkür Şablonu)</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                      {(config.leadThankYouEmail?.enabled ?? config.customForm?.thankYouEmail?.enabled ?? true) ? "Aktif" : "Kapalı"}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    Yeni gelen taleplerde müşteriye giden otomatik karşılama e-postasını zengin metin (WYSIWYG) şablonu ile kişiselleştirin.
                  </p>
                </div>
              </div>
              {onNavigateToEmailAutomation && (
                <button
                  type="button"
                  onClick={onNavigateToEmailAutomation}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Şablonu Düzenle →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HAZIR SEKTÖREL ŞABLONLAR */}
      {activeTab === "templates" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Hazır Sektörel Form Şablonları</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tek tıkla sektörünüze en uygun form alanlarını yükleyin ve anında özelleştirin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template 1: Teklif & Keşif */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Önerilen
                </span>
                <span className="text-xs text-blue-700 font-mono font-bold">8 Alan</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-blue-950">Fiyat Teklifi & Keşif Formu</h3>
                <p className="text-xs text-blue-800 mt-1">
                  Hizmet alanı açılır menüsü, tahmini bütçe aralığı seçimi, proje çizimi/fotoğrafı yükleme alanı ve KVKK kutusu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("teklif")}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bu Şablonu Uygula
              </button>
            </div>

            {/* Template 2: Teknik Servis & Arıza */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Saha & Teknik
                </span>
                <span className="text-xs text-amber-700 font-mono font-bold">8 Alan</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950">Arıza & Teknik Servis Bildirim Formu</h3>
                <p className="text-xs text-amber-800 mt-1">
                  Arıza türü dropdown, aciliyet seviyesi, arıza/hasar görseli yükleme, açık adres ve tarih seçici.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("servis")}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bu Şablonu Uygula
              </button>
            </div>

            {/* Template 3: İK & Başvuru */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50/70 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
                  Kariyer & İK
                </span>
                <span className="text-xs text-purple-700 font-mono font-bold">8 Alan</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-purple-950">Kariyer & İş Başvuru Formu</h3>
                <p className="text-xs text-purple-800 mt-1">
                  Pozisyon açılır menüsü, deneyim yılı seçimi, zorunlu PDF Özgeçmiş / CV yükleme alanı ve ön yazı alanı.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("ik")}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bu Şablonu Uygula
              </button>
            </div>

            {/* Template 4: B2B Bayilik */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                  Kurumsal & Toptan
                </span>
                <span className="text-xs text-emerald-700 font-mono font-bold">9 Alan</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950">B2B Bayilik & Toptan Talep Formu</h3>
                <p className="text-xs text-emerald-800 mt-1">
                  Firma ünvanı, vergi dairesi/bölge, tahmini alım hacmi dropdown, vergi levhası yükleme alanı ve onay şartları.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("b2b")}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bu Şablonu Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE FORM PREVIEW & TEST ARENA */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
              <Eye className="w-4 h-4" />
              <span>Canlı Önizleme & Test Modu</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Formunuz Ziyaretçilere Nasıl Görünüyor?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alanları test edebilir, örnek dosya yükleyebilir ve doğrudan CRM paneline test talebi gönderebilirsiniz.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
            Canlı Görünüm (1:1 Web Sitenizle Uyumlu)
          </span>
        </div>

        {/* The rendered form card */}
        <div className="max-w-2xl mx-auto bg-slate-50/70 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-slate-900 mb-1">
              {currentForm.title}
            </h4>
            <p className="text-xs text-slate-500">
              {currentForm.subtitle}
            </p>
          </div>

          {testSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{currentForm.successMessage}</span>
            </div>
          )}

          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => {
                const colClass = field.width === "half" ? "sm:col-span-1" : "sm:col-span-2";

                if (field.type === "text" || field.type === "tel" || field.type === "email" || field.type === "number") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        value={testFormData[field.id] || ""}
                        onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                        placeholder={field.placeholder || ""}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  );
                }

                if (field.type === "date") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="date"
                        required={field.required}
                        value={testFormData[field.id] || ""}
                        onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        required={field.required}
                        value={testFormData[field.id] || ""}
                        onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                        placeholder={field.placeholder || ""}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  );
                }

                if (field.type === "select") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="relative">
                        <select
                          required={field.required}
                          value={testFormData[field.id] || ""}
                          onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 appearance-none pr-9 cursor-pointer"
                        >
                          <option value="">{field.placeholder || "Seçiniz..."}</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  );
                }

                if (field.type === "radio") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-300">
                        {(field.options || []).map((opt, rIdx) => (
                          <label key={rIdx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={testFormData[field.id] === opt}
                              onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (field.type === "file") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-2xl p-4 text-center transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept={field.allowedFileTypes || "*"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setTestFileUploaded({ name: file.name, size: file.size });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                          <Upload className="w-6 h-6 text-indigo-500 mb-1.5" />
                          {testFileUploaded ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{testFileUploaded.name} ({(testFileUploaded.size / 1024).toFixed(0)} KB)</span>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-700">
                                {field.placeholder || "Dosya seçin veya buraya sürükleyin"}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {field.helpText || `${field.allowedFileTypes || "Tüm formatlar"} (Maks ${field.maxFileSizeMb || 10} MB)`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (field.type === "checkbox") {
                  return (
                    <div key={field.id} className={colClass}>
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          required={field.required}
                          checked={Boolean(testFormData[field.id])}
                          onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-700 leading-snug">
                          {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </span>
                      </label>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{currentForm.submitButtonText} (Test Talebi Gönder)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
