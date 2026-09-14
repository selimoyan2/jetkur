import React, { useState } from "react";
import { 
  SiteConfig, 
  CustomFormConfig, 
  FormFieldConfig, 
  FormFieldType 
} from "../../types";
import { DEFAULT_CATALOG_CONTACT_FORM_CONFIG } from "../../data/mockData";
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Check, 
  Copy, 
  Smartphone, 
  Monitor, 
  UploadCloud, 
  Send, 
  HelpCircle, 
  Sparkles, 
  ShoppingBag, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  Hash, 
  CheckSquare, 
  List, 
  CircleDot, 
  Paperclip, 
  MessageSquare, 
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface CatalogContactFormManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onNavigateToLeads?: () => void;
  onNavigateToCatalog?: () => void;
}

export const CatalogContactFormManager: React.FC<CatalogContactFormManagerProps> = ({
  config,
  onChange,
  onNavigateToLeads,
  onNavigateToCatalog
}) => {
  // Retrieve or initialize catalog contact form configuration
  const currentForm: CustomFormConfig = 
    config.catalogContactForm || 
    config.products?.contactForm || 
    DEFAULT_CATALOG_CONTACT_FORM_CONFIG;

  const [formConfig, setFormConfig] = useState<CustomFormConfig>(currentForm);
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "templates" | "preview">("fields");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // New field draft state
  const [newField, setNewField] = useState<Partial<FormFieldConfig>>({
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    width: "full",
    helpText: "",
    options: ["Seçenek 1", "Seçenek 2", "Seçenek 3"],
    allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.zip",
    maxFileSizeMb: 10
  });

  // Interactive preview state
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState<boolean>(false);
  const [submittedLeadData, setSubmittedLeadData] = useState<any | null>(null);

  // Helper to persist changes
  const saveFormConfig = (updated: CustomFormConfig, message = "Katalog iletişim formu ayarları kaydedildi!") => {
    setFormConfig(updated);
    const updatedProducts = config.products ? { ...config.products, contactForm: updated } : undefined;
    onChange({
      ...config,
      catalogContactForm: updated,
      products: updatedProducts as any
    });
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Toggle form enabled
  const handleToggleEnabled = (enabled: boolean) => {
    saveFormConfig({ ...formConfig, enabled }, enabled ? "Katalog iletişim formu aktifleştirildi!" : "Katalog iletişim formu pasif konuma alındı.");
  };

  // Update top-level form settings
  const handleUpdateSetting = <K extends keyof CustomFormConfig>(key: K, value: CustomFormConfig[K]) => {
    const updated = { ...formConfig, [key]: value };
    saveFormConfig(updated);
  };

  // Field reordering
  const handleMoveField = (index: number, direction: "up" | "down") => {
    const fields = [...formConfig.fields];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const [moved] = fields.splice(index, 1);
    fields.splice(targetIdx, 0, moved);
    saveFormConfig({ ...formConfig, fields });
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    const fields = formConfig.fields.filter(f => f.id !== fieldId);
    saveFormConfig({ ...formConfig, fields }, "Özel alan kaldırıldı.");
    if (editingFieldId === fieldId) setEditingFieldId(null);
  };

  // Duplicate field
  const handleDuplicateField = (field: FormFieldConfig) => {
    const newId = `custom_${Date.now().toString(36)}`;
    const cloned: FormFieldConfig = {
      ...field,
      id: newId,
      label: `${field.label} (Kopya)`,
      isSystem: false
    };
    const fields = [...formConfig.fields, cloned];
    saveFormConfig({ ...formConfig, fields }, `"${field.label}" alanı kopyalandı.`);
  };

  // Update single field in list
  const handleUpdateField = (fieldId: string, updates: Partial<FormFieldConfig>) => {
    const fields = formConfig.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    saveFormConfig({ ...formConfig, fields });
  };

  // Add new field
  const handleCreateField = () => {
    if (!newField.label?.trim()) {
      alert("Lütfen alan adını (etiket) giriniz.");
      return;
    }

    const fieldId = `client_req_${Date.now().toString(36)}`;
    const fieldToAdd: FormFieldConfig = {
      id: fieldId,
      type: newField.type || "text",
      label: newField.label.trim(),
      placeholder: newField.placeholder?.trim() || undefined,
      required: Boolean(newField.required),
      width: newField.width || "full",
      helpText: newField.helpText?.trim() || undefined,
      options: (newField.type === "select" || newField.type === "radio") ? newField.options : undefined,
      allowedFileTypes: newField.type === "file" ? (newField.allowedFileTypes || ".pdf,.png,.jpg") : undefined,
      maxFileSizeMb: newField.type === "file" ? (newField.maxFileSizeMb || 10) : undefined,
      isSystem: false
    };

    const fields = [...formConfig.fields, fieldToAdd];
    saveFormConfig({ ...formConfig, fields }, `Yeni alan "${fieldToAdd.label}" forma eklendi!`);
    setIsAddingField(false);
    setNewField({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      width: "full",
      helpText: "",
      options: ["Seçenek 1", "Seçenek 2", "Seçenek 3"],
      allowedFileTypes: ".pdf,.png,.jpg,.jpeg,.zip",
      maxFileSizeMb: 10
    });
  };

  // 1-Click Templates
  const applyTemplate = (templateKey: "custom_manufacturing" | "b2b_wholesale" | "project_service" | "sample_request") => {
    let templateFields: FormFieldConfig[] = [];
    let title = "";
    let subtitle = "";
    let submitText = "";

    if (templateKey === "custom_manufacturing") {
      title = "Özel İmalat & Butik Üretim Teklif Formu";
      subtitle = "Teknik şartname, ölçü ve malzeme gereksinimlerinizi iletin, mühendislik ekibimiz 1 saatte maliyetlendirsin.";
      submitText = "Özel Üretim Teklifi İste";
      templateFields = [
        { id: "client_name", type: "text", label: "Adınız Soyadınız / Firma", required: true, width: "full", isSystem: true },
        { id: "client_phone", type: "tel", label: "Telefon Numaranız", required: true, width: "half", isSystem: true },
        { id: "client_email", type: "email", label: "E-Posta Adresiniz", required: true, width: "half" },
        { id: "product_category", type: "select", label: "İmalat Kategorisi", required: true, width: "half", options: ["Metal & Sac İşleme", "CNC & Kalıp İmalatı", "Plastik Enjeksiyon", "Özel Makine Parçası", "Diğer"] },
        { id: "production_qty", type: "number", label: "Hedef Üretim Adedi / Miktar", placeholder: "Örn: 500", required: true, width: "half" },
        { id: "material_spec", type: "text", label: "Hammadde / Malzeme Tercihi", placeholder: "Örn: 304 Paslanmaz Çelik, Alüminyum 6061...", required: false, width: "half" },
        { id: "target_deadline", type: "date", label: "İstenen Teslim Tarihi", required: false, width: "half" },
        { id: "technical_specs", type: "textarea", label: "Teknik Şartname & Özel Ölçüler", placeholder: "Toleranslar, yüzey kaplama, ölçüler veya özel montaj istekleri...", required: true, width: "full" },
        { id: "cad_drawing_file", type: "file", label: "Teknik Çizim / CAD / PDF Dosyası", required: false, width: "full", allowedFileTypes: ".pdf,.dwg,.dxf,.step,.stp,.zip", maxFileSizeMb: 30, helpText: "Maks 30 MB (PDF, CAD, ZIP)" },
        { id: "kvkk_consent", type: "checkbox", label: "KVKK Aydınlatma Metni'ni okudum, onaylıyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else if (templateKey === "b2b_wholesale") {
      title = "B2B Toptan Fiyat & Bayi Başvuru Formu";
      subtitle = "Toplu alımlar, bayi iskontoları ve vadeli siparişler için kurumsal teklif talebinde bulunun.";
      submitText = "Toptan Fiyat Teklifi Al";
      templateFields = [
        { id: "client_company", type: "text", label: "Firma / Kurum Tam Ünvanı", placeholder: "Örn: Özkan Lojistik San. Tic. Ltd. Şti.", required: true, width: "full" },
        { id: "tax_info", type: "text", label: "Vergi Dairesi ve Numarası", placeholder: "Kadıköy V.D. / 1234567890", required: true, width: "half" },
        { id: "contact_person", type: "text", label: "Yetkili Adı Soyadı", required: true, width: "half", isSystem: true },
        { id: "client_phone", type: "tel", label: "Kurumsal Telefon / Dahili", required: true, width: "half", isSystem: true },
        { id: "client_email", type: "email", label: "Kurumsal E-Posta", required: true, width: "half" },
        { id: "interested_products", type: "select", label: "Alım Yapılacak Ürün Grubu", required: true, width: "half", options: (config.products?.items || []).map(p => p.title).concat(["Tüm Katalog Ürünleri", "Özel Karma Koli"]) },
        { id: "monthly_volume", type: "select", label: "Tahmini Aylık / Yıllık Alım Hacmi", required: true, width: "half", options: ["Tek Seferlik Toplu Alım (100-500 Adet)", "Düzenli Aylık Sipariş (500-2.000 Adet)", "Yüksek Hacimli Bayilik (2.000+ Adet)", "Proje Bazlı Alım"] },
        { id: "delivery_address", type: "textarea", label: "Teslimat İli & Sevkiyat Adresi", placeholder: "Depo / Sevkiyat adresi ve nakliye gereksinimleri...", required: true, width: "full" },
        { id: "kvkk_consent", type: "checkbox", label: "KVKK Aydınlatma Metni'ni ve Ticari İletişim İzni'ni onaylıyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else if (templateKey === "project_service") {
      title = "Katalog Keşif & Proje Uygulama Randevusu";
      subtitle = "Uygulama alanınız için yerinde keşif veya mühendislik incelemesi talep edin.";
      submitText = "Ücretsiz Keşif Randevusu Al";
      templateFields = [
        { id: "client_name", type: "text", label: "Adınız Soyadınız / Firma", required: true, width: "full", isSystem: true },
        { id: "client_phone", type: "tel", label: "İletişim Telefonu", required: true, width: "half", isSystem: true },
        { id: "client_email", type: "email", label: "E-Posta Adresiniz", required: true, width: "half" },
        { id: "service_type", type: "select", label: "Talep Edilen Hizmet", required: true, width: "half", options: ["Yerinde Keşif & Ölçü Alma", "Montaj & Uygulama", "Periyodik Bakım / Servis", "Proje Danışmanlığı"] },
        { id: "preferred_date", type: "date", label: "Tercih Edilen Randevu Tarihi", required: true, width: "half" },
        { id: "site_address", type: "textarea", label: "Keşif / Montaj Yapılacak Lokasyon Adresi", required: true, width: "full" },
        { id: "site_photo", type: "file", label: "Mevcut Alan Fotoğrafı / Video (İsteğe Bağlı)", required: false, width: "full", allowedFileTypes: ".jpg,.jpeg,.png,.mp4,.pdf", maxFileSizeMb: 25 },
        { id: "kvkk_consent", type: "checkbox", label: "KVKK şartlarını okudum, kabul ediyorum.", required: true, defaultValue: true, width: "full" }
      ];
    } else {
      title = "Hızlı Numune & Basılı Katalog İsteği";
      subtitle = "Ürün numunelerimizi yerinizde incelemek veya fiziki kataloğumuzu talep etmek için bilgilerinizi giriniz.";
      submitText = "Numune & Katalog Gönder";
      templateFields = [
        { id: "client_name", type: "text", label: "Adınız Soyadınız", required: true, width: "full", isSystem: true },
        { id: "client_phone", type: "tel", label: "Cep Telefonunuz", required: true, width: "half", isSystem: true },
        { id: "client_email", type: "email", label: "E-Posta", required: true, width: "half" },
        { id: "sample_items", type: "select", label: "Numunesi İstenen Ürün Grubu", required: true, width: "half", options: ["Kumaş / Renk Kartelası", "Malzeme Numune Kiti", "Basılı Ürün Kataloğu", "Tüm Numune Seti"] },
        { id: "sector_type", type: "text", label: "Faaliyet Sektörünüz", placeholder: "Örn: Mimarlık, Otomotiv, İnşaat...", required: false, width: "half" },
        { id: "shipping_address", type: "textarea", label: "Kargo / Teslimat Adresiniz", placeholder: "Kargo alıcı adı, açık adres ve il/ilçe...", required: true, width: "full" },
        { id: "kvkk_consent", type: "checkbox", label: "Adres bilgilerimin kargo iletiminde kullanılmasını onaylıyorum.", required: true, defaultValue: true, width: "full" }
      ];
    }

    const updated: CustomFormConfig = {
      ...formConfig,
      enabled: true,
      title,
      subtitle,
      submitButtonText: submitText,
      fields: templateFields
    };

    saveFormConfig(updated, `"${title}" hazır şablonu başarıyla uygulandı!`);
    setActiveTab("fields");
  };

  // Preview form submit simulation
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = {
      id: `lead_catalog_${Date.now()}`,
      date: "Az Önce",
      name: previewValues.client_name || previewValues.contact_person || "Mehmet Özkan",
      phone: previewValues.client_phone || "0532 555 12 34",
      email: previewValues.client_email || "musteri@sirket.com",
      serviceOrProduct: previewValues.selected_product || previewValues.product_category || "Katalog Özel Teklif Talebi",
      sourcePage: "Ürün Kataloğu ('Contact Us')",
      requirements: previewValues,
      submittedAt: new Date().toLocaleTimeString("tr-TR")
    };

    setSubmittedLeadData(lead);
    setPreviewSubmitted(true);
  };

  // Icon selector based on field type
  const renderFieldTypeIcon = (type: FormFieldType) => {
    switch (type) {
      case "text": return <FileText className="w-4 h-4 text-blue-500" />;
      case "textarea": return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case "select": return <List className="w-4 h-4 text-emerald-500" />;
      case "radio": return <CircleDot className="w-4 h-4 text-purple-500" />;
      case "number": return <Hash className="w-4 h-4 text-amber-500" />;
      case "date": return <Calendar className="w-4 h-4 text-rose-500" />;
      case "file": return <Paperclip className="w-4 h-4 text-teal-500" />;
      case "checkbox": return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case "tel": return <Phone className="w-4 h-4 text-green-500" />;
      case "email": return <Mail className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getFieldTypeName = (type: FormFieldType) => {
    switch (type) {
      case "text": return "Kısa Metin";
      case "textarea": return "Geniş Metin Alanı";
      case "select": return "Açılır Seçim (Dropdown)";
      case "radio": return "Tekli Seçim (Radio)";
      case "number": return "Sayı / Adet";
      case "date": return "Tarih Seçici";
      case "file": return "Dosya / Belge Yükleme";
      case "checkbox": return "Onay Kutusu";
      case "tel": return "Telefon";
      case "email": return "E-Posta";
      default: return type;
    }
  };

  return (
    <div id="catalog-contact-form-manager" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="bg-emerald-600 text-white px-5 py-3 text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedbackMessage(null)} 
            className="text-white/80 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Katalog Özel İletişim & Teklif Motoru</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Katalog 'Contact Us' & Özel İhtiyaç Formu
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ziyaretçilerinizin ürün kataloğunuzdan doğrudan özel gereksinimlerini (Ölçü, Adet, Teslim Tarihi, Bütçe, Teknik Çizim Dosyası vb.) iletebilmesi için formunuza sınırsız özel alanlar ekleyin.
            </p>
          </div>

          {/* Quick Actions & Status Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 flex items-center gap-3 px-4">
              <span className="text-xs font-bold text-slate-300">Katalog Formu:</span>
              <button
                type="button"
                id="btn-toggle-catalog-form-enabled"
                onClick={() => handleToggleEnabled(!formConfig.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formConfig.enabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
                role="switch"
                aria-checked={formConfig.enabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formConfig.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-xs font-black uppercase ${formConfig.enabled ? "text-emerald-400" : "text-slate-400"}`}>
                {formConfig.enabled ? "Aktif" : "Pasif"}
              </span>
            </div>

            {onNavigateToCatalog && (
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Ürün Listesine Dön</span>
              </button>
            )}

            {onNavigateToLeads && (
              <button
                type="button"
                onClick={onNavigateToLeads}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <span>Gelen Talepleri İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            type="button"
            id="tab-catalog-fields"
            onClick={() => setActiveTab("fields")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "fields"
                ? "bg-white text-slate-900 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Form Alanları ({formConfig.fields.length})</span>
          </button>

          <button
            type="button"
            id="tab-catalog-settings"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "settings"
                ? "bg-white text-slate-900 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Başlık & Bildirim Ayarları</span>
          </button>

          <button
            type="button"
            id="tab-catalog-templates"
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "templates"
                ? "bg-white text-slate-900 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Tıkla Sektörel Şablonlar</span>
          </button>

          <button
            type="button"
            id="tab-catalog-preview"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Canlı İnteraktif Önizleme</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 sm:p-8">

        {/* ========================================================= */}
        {/* TAB 1: FORM ALANLARI (CUSTOM FIELDS BUILDER)               */}
        {/* ========================================================= */}
        {activeTab === "fields" && (
          <div className="space-y-6">
            
            {/* Top info and Add New Field Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <span>Dinamik Müşteri Gereksinimleri Yapılandırması</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-200/70 text-indigo-800">
                    {formConfig.fields.length} Aktif Alan
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  İşletmenizin ihtiyaçlarına göre özel alanlar ekleyin, sıralarını değiştirin veya zorunluluk kriterlerini belirleyin.
                </p>
              </div>

              <button
                type="button"
                id="btn-add-custom-field"
                onClick={() => setIsAddingField(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Özel Alan Ekle</span>
              </button>
            </div>

            {/* Modal / Inline Add Form Field */}
            {isAddingField && (
              <div className="p-6 rounded-2xl bg-slate-50 border-2 border-indigo-200 shadow-md space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                      +
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Forma Yeni Özel Alan Ekle</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded-lg"
                  >
                    Vazgeç
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alan Türü</label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as FormFieldType })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
                    >
                      <option value="text">Kısa Metin (Firma Adı, Proje Adı, Özel Kod)</option>
                      <option value="textarea">Geniş Metin (Özel Ölçü, Renk, Şartname vb.)</option>
                      <option value="select">Açılır Seçim Listesi (Dropdown - Ürün, Kategori, Bütçe)</option>
                      <option value="radio">Tekli Seçim Butonları (Aciliyet, İletişim Tercihi)</option>
                      <option value="number">Sayı / Miktar (Adet, Metre, Ağırlık)</option>
                      <option value="date">Tarih Seçici (Teslim Tarihi, Keşif Randevusu)</option>
                      <option value="file">Dosya Yükleme (Teknik Çizim DWG/PDF, Numune Görseli)</option>
                      <option value="checkbox">Onay Kutusu (KVKK, Sözleşme Onayı, Numune İsteği)</option>
                      <option value="tel">Telefon Numarası</option>
                      <option value="email">E-Posta Adresi</option>
                    </select>
                  </div>

                  {/* Field Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alan Etiketi / Başlık <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      placeholder="Örn: Talep Edilen Özel Ebatlar / Ölçüler"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>

                  {/* Field Placeholder */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İpucu / Placeholder (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={newField.placeholder || ""}
                      onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      placeholder="Örn: En x Boy x Yükseklik (cm)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                    />
                  </div>

                  {/* Field Width & Required */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Genişlik</label>
                      <select
                        value={newField.width}
                        onChange={(e) => setNewField({ ...newField, width: e.target.value as "full" | "half" })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      >
                        <option value="full">Tam Genişlik (%100)</option>
                        <option value="half">Yarım Genişlik (%50 - Yan Yana)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Zorunluluk</label>
                      <select
                        value={newField.required ? "true" : "false"}
                        onChange={(e) => setNewField({ ...newField, required: e.target.value === "true" })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      >
                        <option value="false">İsteğe Bağlı</option>
                        <option value="true">Zorunlu Alan (*)</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Options for Select / Radio */}
                  {(newField.type === "select" || newField.type === "radio") && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Seçenek Listesi (Virgülle veya her satıra bir seçenek yazın)
                      </label>
                      <textarea
                        rows={3}
                        value={(newField.options || []).join("\n")}
                        onChange={(e) => setNewField({ 
                          ...newField, 
                          options: e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean) 
                        })}
                        placeholder="Örn: 
Standart Ürün
Özel Ölçü Üretim
Toptan Koli Siparişi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  )}

                  {/* Conditional Settings for File Upload */}
                  {newField.type === "file" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">İzin Verilen Uzantılar</label>
                        <input
                          type="text"
                          value={newField.allowedFileTypes}
                          onChange={(e) => setNewField({ ...newField, allowedFileTypes: e.target.value })}
                          placeholder=".pdf,.png,.jpg,.dwg,.zip"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Maksimum Dosya Boyutu (MB)</label>
                        <input
                          type="number"
                          value={newField.maxFileSizeMb}
                          onChange={(e) => setNewField({ ...newField, maxFileSizeMb: Number(e.target.value) || 10 })}
                          min={1}
                          max={50}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Help text */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama / Yardım İpucu (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={newField.helpText || ""}
                      onChange={(e) => setNewField({ ...newField, helpText: e.target.value })}
                      placeholder="Örn: Lütfen varsa teknik çiziminizi PDF formatında ekleyiniz."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-add-field"
                    onClick={handleCreateField}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Alanı Ekle & Kaydet</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Existing Fields */}
            <div className="space-y-3">
              {formConfig.fields.map((field, idx) => {
                const isEditing = editingFieldId === field.id;

                return (
                  <div
                    key={field.id}
                    id={`catalog-field-row-${field.id}`}
                    className={`rounded-2xl border transition-all ${
                      isEditing 
                        ? "border-indigo-400 bg-indigo-50/40 p-4 shadow-sm" 
                        : "border-slate-200 bg-white hover:border-slate-300 p-3.5 sm:p-4 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Left: Icon, Label, Type, Indicators */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {renderFieldTypeIcon(field.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {field.label}
                            </span>
                            {field.required ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                Zorunlu (*)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                İsteğe Bağlı
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                              {getFieldTypeName(field.type)}
                            </span>
                            {field.width === "half" && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                %50 Yan Yana
                              </span>
                            )}
                            {field.isSystem && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Temel İletişim
                              </span>
                            )}
                          </div>

                          {field.helpText && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {field.helpText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (Move, Edit, Clone, Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, "up")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Yukarı Taşı"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === formConfig.fields.length - 1}
                          onClick={() => handleMoveField(idx, "down")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Aşağı Taşı"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>

                        {/* Edit Field Toggle */}
                        <button
                          type="button"
                          onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isEditing 
                              ? "bg-indigo-600 text-white" 
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isEditing ? "Kapat" : "Düzenle"}
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateField(field)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Alanı Kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Field */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${field.label}" alanını katalog formundan kaldırmak istediğinize emin misiniz?`)) {
                              handleDeleteField(field.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Inline Edit Drawer */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-xl">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Alan Başlığı</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">İpucu (Placeholder)</label>
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Genişlik Oranı</label>
                          <select
                            value={field.width || "full"}
                            onChange={(e) => handleUpdateField(field.id, { width: e.target.value as "full" | "half" })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                          >
                            <option value="full">Tam Genişlik (100%)</option>
                            <option value="half">Yarım Genişlik (%50 Yan Yana)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Zorunluluk Durumu</label>
                          <select
                            value={field.required ? "true" : "false"}
                            onChange={(e) => handleUpdateField(field.id, { required: e.target.value === "true" })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                          >
                            <option value="true">Zorunlu Alan (*)</option>
                            <option value="false">İsteğe Bağlı</option>
                          </select>
                        </div>

                        {/* Options Editor */}
                        {(field.type === "select" || field.type === "radio") && (
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Seçenekler (Satır başına bir tane)</label>
                            <textarea
                              rows={3}
                              value={(field.options || []).join("\n")}
                              onChange={(e) => handleUpdateField(field.id, {
                                options: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)
                              })}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-sans"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Yardım / Açıklama Metni</label>
                          <input
                            type="text"
                            value={field.helpText || ""}
                            onChange={(e) => handleUpdateField(field.id, { helpText: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                          >
                            Tamamlandı
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FORM BAŞLIKLARI & BİLDİRİM AYARLARI                */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Katalog Form Metinleri & Başlıkları</h2>
              <p className="text-xs text-slate-500">
                Katalog sayfasındaki 'Contact Us' bölümünün başlığını, açıklamasını ve buton yazılarını özelleştirin.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bölüm Başlığı</label>
                <input
                  type="text"
                  value={formConfig.title}
                  onChange={(e) => handleUpdateSetting("title", e.target.value)}
                  placeholder="Katalog Teklif & Özel İhtiyaç Formu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama / Alt Başlık</label>
                <textarea
                  rows={2}
                  value={formConfig.subtitle}
                  onChange={(e) => handleUpdateSetting("subtitle", e.target.value)}
                  placeholder="Katalogdaki ürünlerimiz veya özel proje gereksinimleriniz için formu doldurun..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gönder Butonu Yazısı</label>
                  <input
                    type="text"
                    value={formConfig.submitButtonText}
                    onChange={(e) => handleUpdateSetting("submitButtonText", e.target.value)}
                    placeholder="Özel Fiyat Teklifi & Bilgi İste"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bildirim E-Posta Adresi</label>
                  <input
                    type="email"
                    value={formConfig.notifyEmail || config.email || ""}
                    onChange={(e) => handleUpdateSetting("notifyEmail", e.target.value)}
                    placeholder="teklif@sirketiniz.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Başarılı Gönderim Mesajı</label>
                <input
                  type="text"
                  value={formConfig.successMessage}
                  onChange={(e) => handleUpdateSetting("successMessage", e.target.value)}
                  placeholder="Talebiniz ve özel gereksinimleriniz başarıyla alındı!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Otomatik WhatsApp Yönlendirmesi</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      Tavsiye Edilir
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Form doldurulduktan sonra müşteriyi, doldurduğu özel gereksinimleri hazır mesaj olarak içeren WhatsApp sohbetine otomatik yönlendirir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateSetting("redirectWhatsAppAfterSubmit", !formConfig.redirectWhatsAppAfterSubmit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                    formConfig.redirectWhatsAppAfterSubmit ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formConfig.redirectWhatsAppAfterSubmit ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 1-TIKLA HAZIR SEKTÖREL ŞABLONLAR                   */}
        {/* ========================================================= */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Katalog İçin 1-Tıkla Hazır Sektörel Şablonlar</h2>
              <p className="text-xs text-slate-500">
                Sektörünüze en uygun form yapısını tek tıkla yükleyin. Mevcut form alanlarınız seçtiğiniz hazır şablon ile güncellenir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Template 1 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    📐
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Özel İmalat & Butik Üretim Şablonu
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Özel ölçü, hammadde tipi, CAD/DWG teknik çizim dosyası, adet ve hedef teslim tarihi alanlarını içerir.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Teknik Çizim Eki</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Hedef Tarih</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Üretim Adedi</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Hammadde Seçimi</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-apply-template-manufacturing"
                  onClick={() => applyTemplate("custom_manufacturing")}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bu Şablonu Uygula</span>
                </button>
              </div>

              {/* Template 2 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    🏢
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    B2B Toptan Fiyat & Bayi Şablonu
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Firma ünvanı, vergi no, aylık alım hacmi, depo/nakliye adresi ve kurumsal teklif kriterlerini toplar.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Vergi No</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Alım Hacmi</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Katalog Ürünleri</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Sevkiyat Yeri</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-apply-template-wholesale"
                  onClick={() => applyTemplate("b2b_wholesale")}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bu Şablonu Uygula</span>
                </button>
              </div>

              {/* Template 3 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🛠️
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Keşif, Montaj & Proje Randevusu
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Uygulama adresi, mevcut alan fotoğrafı yükleme, hizmet türü ve tercih edilen randevu tarihi toplar.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Alan Fotoğrafı</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Randevu Tarihi</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Lokasyon Adresi</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-apply-template-service"
                  onClick={() => applyTemplate("project_service")}
                  className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bu Şablonu Uygula</span>
                </button>
              </div>

              {/* Template 4 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    📦
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    Hızlı Numune & Basılı Katalog İsteği
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fiziksel numune, renk kartelası veya basılı katalog kargo adresi bilgilerini en hızlı şekilde toplar.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Kargo Adresi</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Numune Kiti</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Sektör Tipi</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-apply-template-sample"
                  onClick={() => applyTemplate("sample_request")}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bu Şablonu Uygula</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CANLI İNTERAKTİF ÖNİZLEME (LIVE PREVIEW)            */}
        {/* ========================================================= */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            
            {/* Preview Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white">
              <div>
                <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>İnteraktif Katalog 'Contact Us' Test Simülatörü</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Müşterilerinizin katalog sayfasında göreceği formu test edebilir, test gönderimi yaparak gelen talebin nasıl işleneceğini görebilirsiniz.
                </p>
              </div>

              {/* Viewport switch */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-preview-desktop"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === "desktop"
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Masaüstü</span>
                </button>
                <button
                  type="button"
                  id="btn-preview-mobile"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === "mobile"
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobil Ekran</span>
                </button>
              </div>
            </div>

            {/* Test submission feedback modal */}
            {previewSubmitted && submittedLeadData && (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950">Test Formu Başarıyla Simüle Edildi!</h3>
                      <p className="text-xs text-emerald-700">{formConfig.successMessage}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewSubmitted(false)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-200 hover:bg-emerald-300 text-emerald-900 text-xs font-bold"
                  >
                    Kapat
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    CRM / Talepler Paneline Yakalanan Müşteri Gereksinimleri:
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5 font-mono text-slate-800">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-sans">Müşteri / Firma:</span>
                      <span className="font-bold">{submittedLeadData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-sans">Telefon:</span>
                      <span className="font-bold text-brand">{submittedLeadData.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-sans">E-Posta:</span>
                      <span>{submittedLeadData.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-sans">Ürün / Hizmet:</span>
                      <span className="font-bold text-indigo-600">{submittedLeadData.serviceOrProduct}</span>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] font-sans font-bold text-slate-700 mb-1">
                        Doldurulan Özel Alan Detayları:
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                        {Object.entries(submittedLeadData.requirements).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-4">
                            <span className="text-slate-500">{key}:</span>
                            <span className="font-bold text-slate-800 text-right">{String(val || "-")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-emerald-800">
                    {formConfig.redirectWhatsAppAfterSubmit 
                      ? "📲 Müşteri ayrıca WhatsApp'a otomatik yönlendirildi." 
                      : "📧 Talep e-posta adresinize yönlendirildi."}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSubmitted(false);
                      setPreviewValues({});
                    }}
                    className="text-xs text-emerald-800 underline font-bold"
                  >
                    Testi Sıfırla
                  </button>
                </div>
              </div>
            )}

            {/* Container for Preview (Desktop or Phone Wrapper) */}
            <div className={`mx-auto transition-all ${
              previewDevice === "mobile" 
                ? "max-w-sm rounded-[36px] p-4 bg-slate-900 border-4 border-slate-800 shadow-2xl" 
                : "w-full max-w-4xl"
            }`}>
              {previewDevice === "mobile" && (
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-4" />
              )}

              {/* The Live Form Card as it appears on Catalog */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
                <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Katalog Özel İhtiyaç & Teklif Talebi</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formConfig.title || "Katalog Teklif & Özel İhtiyaç Formu"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {formConfig.subtitle || "Katalogdaki ürünlerimiz veya projelerinize özel üretim/hizmet talepleriniz için formu doldurun."}
                  </p>
                </div>

                {/* Form Elements */}
                <form onSubmit={handlePreviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formConfig.fields.map((f) => {
                      const isFull = f.width === "full" || previewDevice === "mobile";
                      const val = previewValues[f.id] ?? f.defaultValue ?? "";

                      return (
                        <div key={f.id} className={isFull ? "md:col-span-2" : "col-span-1"}>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {f.label} {f.required && <span className="text-rose-500">*</span>}
                          </label>

                          {/* Field Types Render */}
                          {f.type === "text" && (
                            <input
                              type="text"
                              required={f.required}
                              placeholder={f.placeholder || f.label}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                          )}

                          {f.type === "tel" && (
                            <input
                              type="tel"
                              required={f.required}
                              placeholder={f.placeholder || "05XX XXX XX XX"}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                          )}

                          {f.type === "email" && (
                            <input
                              type="email"
                              required={f.required}
                              placeholder={f.placeholder || "ornek@sirket.com"}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                          )}

                          {f.type === "number" && (
                            <input
                              type="number"
                              required={f.required}
                              placeholder={f.placeholder || "Miktar giriniz..."}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                          )}

                          {f.type === "date" && (
                            <input
                              type="date"
                              required={f.required}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                          )}

                          {f.type === "textarea" && (
                            <textarea
                              rows={3}
                              required={f.required}
                              placeholder={f.placeholder || "Özel gereksinimlerinizi detaylandırınız..."}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                          )}

                          {f.type === "select" && (
                            <select
                              required={f.required}
                              value={val}
                              onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            >
                              <option value="">Lütfen seçim yapınız...</option>
                              {(f.options || []).map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {f.type === "radio" && (
                            <div className="space-y-1.5 pt-1">
                              {(f.options || []).map((opt, oIdx) => (
                                <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={f.id}
                                    checked={val === opt}
                                    onChange={() => setPreviewValues({ ...previewValues, [f.id]: opt })}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {f.type === "file" && (
                            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                              <UploadCloud className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                              <div className="text-xs font-bold text-slate-700">
                                {val ? `Seçilen Dosya: ${val}` : "Dosya seçin veya sürükleyin"}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {f.allowedFileTypes || ".pdf,.png,.jpg,.zip"} (Maks {f.maxFileSizeMb || 10} MB)
                              </p>
                              <button
                                type="button"
                                onClick={() => setPreviewValues({ ...previewValues, [f.id]: "teknik_cizim_proje_v1.pdf" })}
                                className="mt-2 text-[10px] text-indigo-600 font-bold underline"
                              >
                                [Örnek PDF Dosyası Ekle]
                              </button>
                            </div>
                          )}

                          {f.type === "checkbox" && (
                            <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                required={f.required}
                                checked={Boolean(val)}
                                onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.checked })}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="leading-snug">{f.label}</span>
                            </label>
                          )}

                          {f.helpText && (
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{f.helpText}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      id="btn-preview-form-submit"
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{formConfig.submitButtonText || "Özel Fiyat Teklifi & Katalog Bilgisi İste"}</span>
                    </button>

                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      🔒 Bilgileriniz 256-bit SSL ve KVKK standartlarında korunmaktadır.
                    </p>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
