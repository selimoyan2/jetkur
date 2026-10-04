/**
 * JetKur Smart Onboarding Wizard (Sprint 11)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * 5-Step Streamlined Flow:
 * STEP 1: Sektör / Faaliyet Alanı (Searchable canonical industry catalog + generic fallback)
 * STEP 2: İşletme Adı & Slogan (Required company name + optional tagline)
 * STEP 3: Logo & Marka (Optional file/SVG upload, <2MB limit, optional brand color)
 * STEP 4: İletişim & Hizmetler (Phone, WhatsApp, address, pre-filled editable services)
 * STEP 5: Özet & Oluştur (Human review -> Server-authoritative atomic site creation)
 */

import React, { useState, useEffect, useId } from "react";
import { SiteConfig } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  ALL_INDUSTRY_PACKS,
  toIndustryPackSummary,
} from "../domain/industries/catalog";
import { genericBusinessIndustryPack } from "../domain/industries/packs/genericBusiness";
import {
  resolveOnboardingIndustry,
  listOnboardingIndustries,
} from "../domain/onboarding/industryResolver";
import { recommendTemplateForIndustry } from "../domain/onboarding/templateRecommender";
import { OnboardingServiceItem, OnboardingLogoInput } from "../domain/onboarding/types";
import { extractLogoColors, ExtractedBrandPalette } from "../domain/brand";
import { slugify } from "../utils/slugify";
import {
  Wrench,
  Stethoscope,
  Scale,
  Sparkles,
  Truck,
  Flame,
  Briefcase,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  Building2,
  Palette,
  Image as ImageIcon,
} from "lucide-react";

interface CustomerWizardProps {
  onComplete: (config: SiteConfig) => void;
  onCancelToCatalog?: () => void;
  onCancelToDashboard?: () => void;
}

// Icon mapping helper for industry categories
const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  "sihhi-tesisat": <Wrench className="w-5 h-5 text-blue-600" />,
  "oto-kurtarma": <Truck className="w-5 h-5 text-amber-600" />,
  "dis-hekimligi": <Stethoscope className="w-5 h-5 text-emerald-600" />,
  "hukuk-avukat": <Scale className="w-5 h-5 text-indigo-600" />,
  "hali-yikama": <Sparkles className="w-5 h-5 text-teal-600" />,
  "evden-eve-nakliyat": <Truck className="w-5 h-5 text-orange-600" />,
  "kombi-klima-servisi": <Flame className="w-5 h-5 text-rose-600" />,
  "genel-isletme": <Briefcase className="w-5 h-5 text-slate-600" />,
};

export const CustomerWizard: React.FC<CustomerWizardProps> = ({
  onComplete,
  onCancelToCatalog,
  onCancelToDashboard,
}) => {
  const { user, activeWorkspaceId, workspaces } = useAuth();
  const formId = useId();

  // Wizard Steps 1 to 5
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Loading and Error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgressText, setSubmissionProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 1: Sektör / Faaliyet Alanı
  // -------------------------------------------------------------
  const [industrySearch, setIndustrySearch] = useState("");
  const [selectedIndustrySlug, setSelectedIndustrySlug] = useState<string>("sihhi-tesisat");
  const [customIndustryInput, setCustomIndustryInput] = useState("");
  const [isOtherIndustrySelected, setIsOtherIndustrySelected] = useState(false);

  // -------------------------------------------------------------
  // STEP 2: İşletme Adı & Slogan
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [showTaglineInput, setShowTaglineInput] = useState(false);

  // -------------------------------------------------------------
  // STEP 3: Logo & Marka Rengi
  // -------------------------------------------------------------
  const [logoData, setLogoData] = useState<OnboardingLogoInput | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string>("");
  const [extractedPalette, setExtractedPalette] = useState<ExtractedBrandPalette | null>(null);
  const [isColorExtracting, setIsColorExtracting] = useState<boolean>(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 4: İletişim & Hizmetler
  // -------------------------------------------------------------
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [city, setCity] = useState("İstanbul");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [showExtraContact, setShowExtraContact] = useState(false);

  // Pre-filled & Editable Services
  const [services, setServices] = useState<OnboardingServiceItem[]>([]);
  const [newServiceTitle, setNewServiceTitle] = useState("");

  // Target workspace ID for persistence
  const effectiveWorkspaceId =
    activeWorkspaceId ||
    workspaces?.[0]?.id ||
    user?.memberships?.[0]?.workspaceId ||
    "ws-default-sme";

  // Available industries
  const allIndustries = listOnboardingIndustries();

  // Filtered industries for search
  const filteredIndustries = allIndustries.filter((ind) => {
    if (!industrySearch.trim()) return true;
    const q = industrySearch.toLowerCase();
    return (
      ind.name.toLowerCase().includes(q) ||
      ind.slug.toLowerCase().includes(q) ||
      ind.aliases?.some((a: string) => a.toLowerCase().includes(q))
    );
  });

  // Whenever industry selection changes, update pre-filled services
  useEffect(() => {
    const query = isOtherIndustrySelected
      ? customIndustryInput.trim() || "genel-isletme"
      : selectedIndustrySlug;

    const { pack } = resolveOnboardingIndustry(query);
    const prefilled: OnboardingServiceItem[] = pack.defaultServices.map((ds, i) => ({
      id: `srv-${i + 1}`,
      title: ds.title,
      shortDescription: ds.shortDescription,
      priceHint: ds.priceHint,
      icon: ds.icon,
    }));

    setServices(prefilled);
  }, [selectedIndustrySlug, isOtherIndustrySelected, customIndustryInput]);

  // Handle Logo Upload (<2MB, PNG/JPEG/WebP/SVG)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 2 MB Limit
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError("Logo dosya boyutu 2 MB'tan küçük olmalıdır.");
      return;
    }

    const isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");
    const isRaster = ["image/png", "image/jpeg", "image/webp"].includes(file.type);

    if (!isSvg && !isRaster) {
      setLogoUploadError("Lütfen PNG, JPEG, WebP veya SVG formatında bir logo yükleyin.");
      return;
    }

    const reader = new FileReader();

    if (isSvg) {
      reader.onload = async (event) => {
        const svgText = event.target?.result as string;
        setLogoData({
          svgContent: svgText,
          mimeType: "image/svg+xml",
          fileName: file.name,
          sizeBytes: file.size,
        });
        setLogoPreviewUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`);

        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            svgContent: svgText,
            mimeType: "image/svg+xml",
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted) {
            setBrandColor(result.primary);
          }
        } catch {
          // ignore
        } finally {
          setIsColorExtracting(false);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setLogoData({
          dataUrl,
          mimeType: file.type,
          fileName: file.name,
          sizeBytes: file.size,
        });
        setLogoPreviewUrl(dataUrl);

        setIsColorExtracting(true);
        try {
          const result = await extractLogoColors({
            dataUrl,
            mimeType: file.type,
            fileName: file.name,
          });
          setExtractedPalette(result);
          if (result.isExtracted) {
            setBrandColor(result.primary);
          }
        } catch {
          // ignore
        } finally {
          setIsColorExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoData(null);
    setLogoPreviewUrl(null);
    setExtractedPalette(null);
    setLogoUploadError(null);
    setBrandColor("");
  };

  // Add custom service item
  const handleAddService = () => {
    if (!newServiceTitle.trim()) return;
    setServices((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}`,
        title: newServiceTitle.trim(),
        shortDescription: "Profesyonel hizmet.",
        icon: "CheckCircle2",
      },
    ]);
    setNewServiceTitle("");
  };

  const handleRemoveService = (idToRemove?: string) => {
    setServices((prev) => prev.filter((s) => s.id !== idToRemove));
  };

  // Navigation handlers with validation
  const goToNextStep = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (isOtherIndustrySelected && !customIndustryInput.trim()) {
        setErrorMessage("Lütfen faaliyet alanınızı veya sektörünüzü yazınız.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!companyName.trim() || companyName.trim().length < 2) {
        setErrorMessage("Lütfen geçerli bir işletme adı giriniz (en az 2 karakter).");
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (!cleanPhone || cleanPhone.length < 7) {
        setErrorMessage("Lütfen geçerli bir iletişim telefon numarası giriniz.");
        return;
      }
      if (services.length === 0) {
        setErrorMessage("Lütfen en az bir hizmet ekleyiniz.");
        return;
      }
      setCurrentStep(5);
      return;
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Step 5: Final Submission -> Create Site via Server API
  const handleCreateSite = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmissionProgressText("İşletme bilgileriniz doğrulanıyor...");

    const resolvedInd = resolveOnboardingIndustry(
      isOtherIndustrySelected ? customIndustryInput : selectedIndustrySlug
    );

    const recommendedTemplate = recommendTemplateForIndustry(
      resolvedInd.pack.slug,
      resolvedInd.pack.category
    );

    const payload = {
      industry: isOtherIndustrySelected ? customIndustryInput : selectedIndustrySlug,
      companyName: companyName.trim(),
      tagline: tagline.trim() || undefined,
      logo: logoData || undefined,
      brandColor: brandColor || undefined,
      phone: phone.trim(),
      whatsapp: whatsappSameAsPhone ? phone.trim() : whatsapp.trim() || phone.trim(),
      email: email.trim() || undefined,
      city: city.trim() || "İstanbul",
      address: address.trim() || undefined,
      services: services.map((s) => ({
        title: s.title,
        shortDescription: s.shortDescription,
        priceHint: s.priceHint,
      })),
      templateId: recommendedTemplate.id,
      workspaceId: effectiveWorkspaceId,
    };

    try {
      setSubmissionProgressText("Sektörel içerikler ve şablon hazırlanıyor...");

      // Ensure HTTP request header contains only ISO-8859-1 / ASCII safe code points
      const safeCompanySlug = slugify(companyName.trim(), "site");
      const safePhoneDigits = phone.trim().replace(/[^a-zA-Z0-9]/g, "");
      const safeIdempotencyKey = `idemp-${effectiveWorkspaceId}-${safeCompanySlug}-${safePhoneDigits}`.replace(/[^\x20-\x7E]/g, "");

      const response = await fetch("/api/onboarding/create-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": effectiveWorkspaceId,
          "x-idempotency-key": safeIdempotencyKey,
        },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: safeIdempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Web sitesi oluşturulurken bir hata oluştu.");
      }

      setSubmissionProgressText("Web siteniz hazırlandı! Yükleniyor...");

      // Instantly transition to preview / customer panel with canonical config
      setTimeout(() => {
        onComplete(data.siteConfig);
      }, 500);
    } catch (err: any) {
      console.warn("Server onboarding call error, attempting graceful fallback:", err);
      // Fallback: If network error, client can construct using local domain resolver
      setErrorMessage(
        err?.message || "Sunucuyla iletişim kurulamadı. Lütfen tekrar deneyiniz."
      );
      setIsSubmitting(false);
    }
  };

  const activeIndustryPack = resolveOnboardingIndustry(
    isOtherIndustrySelected ? customIndustryInput : selectedIndustrySlug
  ).pack;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {onCancelToDashboard && (
        <div className="mb-4">
          <button
            type="button"
            onClick={onCancelToDashboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Geri Dön</span>
          </button>
        </div>
      )}

      {/* Header & Steps Indicator */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          JetKur Akıllı Web Sitesi Sihirbazı
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          İşletmenizi Tanıtın, Sitenizi Hemen Hazırlayalım
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-lg mx-auto">
          Teknik kod, tasarım veya karmaşık ayarlar yok. Sadece birkaç soruyla dakikalar içinde yayına hazır web siteniz oluşturulur.
        </p>

        {/* 5-Step Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
          {[
            { num: 1, label: "Sektör" },
            { num: 2, label: "İşletme" },
            { num: 3, label: "Marka" },
            { num: 4, label: "Hizmetler" },
            { num: 5, label: "Tamamla" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === s.num
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : currentStep > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  currentStep === s.num
                    ? "font-semibold text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
              {s.num < 5 && (
                <div
                  className={`w-6 sm:w-10 h-0.5 ${
                    currentStep > s.num ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Sektör Seçimi */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              İşletmeniz hangi sektörde hizmet veriyor?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Sektörünüze özel hazır hizmet katalogları, arama motoru içerikleri ve görsel yerleşimleri otomatik uygulanacaktır.
            </p>

            {/* Sektör Arama */}
            <div className="relative mb-5">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                placeholder="Sektör veya hizmet arayın (örn: Tesisat, Diş, Çekici...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sektör Listesi Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredIndustries.map((ind) => {
                const isSelected =
                  !isOtherIndustrySelected && selectedIndustrySlug === ind.slug;
                return (
                  <button
                    key={ind.slug}
                    type="button"
                    onClick={() => {
                      setSelectedIndustrySlug(ind.slug);
                      setIsOtherIndustrySelected(false);
                      setCustomIndustryInput("");
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {INDUSTRY_ICONS[ind.slug] || <Briefcase className="w-5 h-5 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {ind.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {ind.serviceCount} hazır hizmet paketi
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Diğer / Özel Sektör Seçeneği */}
              <button
                type="button"
                onClick={() => {
                  setIsOtherIndustrySelected(true);
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl text-left border transition-all ${
                  isOtherIndustrySelected
                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    Diğer / Farklı Bir Sektör
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    Özel veya genel kurumsal işletmeler için
                  </div>
                </div>
                {isOtherIndustrySelected && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Özel sektör yazma alanı */}
            {isOtherIndustrySelected && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/60 border border-purple-200">
                <label className="block text-xs font-semibold text-purple-900 mb-1.5">
                  Faaliyet Alanınızı veya Sektörünüzü Yazınız:
                </label>
                <input
                  type="text"
                  value={customIndustryInput}
                  onChange={(e) => setCustomIndustryInput(e.target.value)}
                  placeholder="Örn: Butik Kahveci, Pilates Salonu, Özel Güvenlik..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-purple-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: İşletme Adı */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              İşletmenizin adı nedir?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Web sitenizin ana başlıklarında, logosunda ve arama motoru etiketlerinde kullanılacaktır.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor={`${formId}-companyName`}
                  className="block text-sm font-semibold text-slate-800 mb-1.5"
                >
                  İşletme / Şirket Adı <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${formId}-companyName`}
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Usta Tesisat Ltd. veya Dt. Ayşe Aydın Kliniği"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Tagline / Slogan (Progressive Disclosure) */}
              <div>
                {!showTaglineInput ? (
                  <button
                    type="button"
                    onClick={() => setShowTaglineInput(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Slogan veya Kısa Tanıtım Ekle (İsteğe Bağlı)
                  </button>
                ) : (
                  <div>
                    <label
                      htmlFor={`${formId}-tagline`}
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Slogan veya Kısa Başlık
                    </label>
                    <input
                      id={`${formId}-tagline`}
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Örn: Şehrin En Hızlı ve Güvenilir Hizmeti"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Boş bırakırsanız seçtiğiniz sektöre uygun profesyonel bir başlık atanacaktır.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: Logo & Marka Rengi */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Markanızın Logosu Var mı?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Logonuz varsa yükleyin, JetKur renk motoru temanızı logonuzun tonlarına göre otomatik uyarlar. Logonuz yoksa bu adımı geçebilirsiniz.
            </p>

            {/* Logo Yükleme Alanı */}
            <div className="mb-6">
              {logoPreviewUrl ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoPreviewUrl}
                        alt="Yüklenen Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {logoData?.fileName || "Yüklenen Logo"}
                      </div>
                      {isColorExtracting ? (
                        <div className="text-xs text-blue-600 font-medium flex items-center gap-1.5 mt-0.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Marka renkleri taranıyor...
                        </div>
                      ) : extractedPalette?.isExtracted ? (
                        <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Logonuzdan marka renkleriniz başarıyla çıkarıldı
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          Logo yüklendi
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Logoyu Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">
                    Logonuzu buraya bırakın veya dosya seçin
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPEG, WebP veya SVG (Maksimum 2 MB)
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Real Extracted Color Feedback Banner */}
              {logoPreviewUrl && extractedPalette?.isExtracted && (
                <div className="mt-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logonuzdan marka renklerinizi çıkardık</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                        style={{ backgroundColor: extractedPalette.primary }}
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Ana Renk: <code className="font-mono text-slate-900">{extractedPalette.primary}</code>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                        style={{ backgroundColor: extractedPalette.accent }}
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Yardımcı Renk: <code className="font-mono text-slate-900">{extractedPalette.accent}</code>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setBrandColor(extractedPalette.primary)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        brandColor === extractedPalette.primary
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                      }`}
                    >
                      {brandColor === extractedPalette.primary ? "✓ Otomatik Paleti Kullan" : "Otomatik Paleti Kullan"}
                    </button>
                  </div>
                </div>
              )}

              {/* Truthful Fallback Banner */}
              {logoPreviewUrl && extractedPalette && !extractedPalette.isExtracted && !isColorExtracting && (
                <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Logodan güvenilir bir marka rengi çıkaramadık. Ana renginizi seçebilirsiniz.</span>
                </div>
              )}

              {logoUploadError && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {logoUploadError}
                </p>
              )}
            </div>

            {/* İsteğe Bağlı Marka Rengi Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {extractedPalette?.isExtracted ? "Rengi Değiştirmek İsterseniz Seçebilirsiniz:" : "Tercih Ettiğiniz Ana Marka Rengi (İsteğe Bağlı)"}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { name: "Varsayılan Şablon Rengi", color: "" },
                  { name: "Mavi", color: "#2563eb" },
                  { name: "Zümrüt Yeşili", color: "#059669" },
                  { name: "Turuncu", color: "#ea580c" },
                  { name: "Kırmızı", color: "#dc2626" },
                  { name: "Lacivert", color: "#1e3a8a" },
                  { name: "Mor", color: "#7c3aed" },
                  { name: "Koyu Arduvaz", color: "#0f172a" },
                ].map((c) => {
                  const isSelected = brandColor === c.color;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setBrandColor(c.color)}
                      className={`h-9 px-3 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-semibold"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c.color ? (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: c.color }}
                        />
                      ) : (
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: İletişim & Hizmetler */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              İletişim Bilgileri ve Hizmetleriniz
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Müşterilerinizin size tek tıkla telefon ve WhatsApp ile ulaşabilmesi için iletişim bilgilerinizi giriniz.
            </p>

            <div className="space-y-4 mb-6">
              {/* Telefon & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`${formId}-phone`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0532 555 0101"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`${formId}-whatsapp`}
                      className="text-xs font-semibold text-slate-700"
                    >
                      WhatsApp Numarası
                    </label>
                    <label className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappSameAsPhone}
                        onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Telefon ile aynı
                    </label>
                  </div>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                    <input
                      id={`${formId}-whatsapp`}
                      type="tel"
                      disabled={whatsappSameAsPhone}
                      value={whatsappSameAsPhone ? phone : whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="0532 555 0101"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Ek İletişim Bilgileri (Adres, İl, E-posta) */}
              {!showExtraContact ? (
                <button
                  type="button"
                  onClick={() => setShowExtraContact(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Şehir, Adres ve E-posta Ekle (İsteğe Bağlı)
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Şehir / Hizmet Bölgesi
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Örn: İstanbul, Kadıköy"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@sirketiniz.com"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Açık Adres
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Atatürk Mah. Sanayi Cad. No:14"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hizmetler Bölümü (Hazır doldurulmuş, düzenlenebilir) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800">
                  Sitenizde Yayınlanacak Hizmetler (Önerilen Paket)
                </label>
                <span className="text-xs text-slate-400">
                  {services.length} hizmet listelendi
                </span>
              </div>

              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-900">{svc.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(svc.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Hizmeti Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Yeni Hizmet Ekleme */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddService()}
                  placeholder="Yeni hizmet ekleyin (örn: 7/24 Acil Servis)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 5: Özet & Oluştur */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Her Şey Hazır! Web Sitenizi Oluşturalım
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Bilgileriniz hazırlandı. Onayladığınızda JetKur sitenizi otomatik olarak oluşturacak ve canlı önizlemenizi anında açacaktır.
            </p>

            {/* İnceleme Özeti */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="text-xs text-slate-400 font-medium">İşletme Adı</div>
                  <div className="font-semibold text-slate-900 text-base mt-0.5">
                    {companyName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Sektör & Şablon</div>
                  <div className="font-semibold text-blue-700 mt-0.5">
                    {activeIndustryPack.name}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Telefon & İletişim</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{phone}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Logo & Renk</div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-2">
                    {logoPreviewUrl ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xs">
                        <Check className="w-3.5 h-3.5" /> Yüklendi
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Şablon Logosu</span>
                    )}
                    {brandColor && (
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: brandColor }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium mb-1">
                  Tanımlanan Hizmetler ({services.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium"
                    >
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submitting Loading UI */}
            {isSubmitting && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                <div className="text-sm font-semibold">{submissionProgressText}</div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Butonlar & Navigasyon */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={goToPreviousStep}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>
          ) : (
            onCancelToCatalog ? (
              <button
                type="button"
                onClick={onCancelToCatalog}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Kataloğa Dön
              </button>
            ) : <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              Devam Et
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateSite}
              className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Site Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Web Sitemi Oluştur
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
