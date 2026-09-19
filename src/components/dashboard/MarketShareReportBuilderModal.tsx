import React, { useState, useMemo, useRef } from "react";
import {
  X,
  FileDown,
  Upload,
  Sparkles,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Info
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import {
  generateMarketShareAndCompetitorPdf,
  calculateMarketShareMetrics,
  MarketSharePdfOptions,
  CompetitorProfile
} from "../../utils/marketShareAndCompetitorPdfReport";

interface MarketShareReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorProfile[];
  userName?: string;
  userDomain?: string;
  strategicNotes?: Record<string, string>;
}

// Sleek preset brand logos (base64 SVG data URLs for instant professional testing)
const PRESET_LOGOS = [
  {
    id: "medical",
    name: "Medikal & Klinik Rozeti",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#0f172a"/><circle cx="40" cy="40" r="28" fill="#0284c7"/><rect x="34" y="22" width="12" height="36" rx="4" fill="#ffffff"/><rect x="22" y="34" width="36" height="12" rx="4" fill="#ffffff"/></svg>`
      )
  },
  {
    id: "corporate",
    name: "Kurumsal & Danışmanlık",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#1e1b4b"/><polygon points="40,16 64,28 64,52 40,64 16,52 16,28" fill="#6366f1"/><polygon points="40,24 56,32 56,48 40,56 24,48 24,32" fill="#ffffff"/></svg>`
      )
  },
  {
    id: "growth",
    name: "Pazar Lideri & Büyüme",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#064e3b"/><circle cx="40" cy="40" r="28" fill="#059669"/><polyline points="26,48 36,36 46,42 56,26" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="46,26 56,26 56,36" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      )
  }
];

const NOTE_TEMPLATES = [
  {
    title: "Pazar Liderliği Odaklı",
    text: "Analiz edilen anahtar kelime kümesinde markamız organik SERP liderliğini korumaktadır. Önümüzdeki çeyrekte 2. ve 3. sıralardaki transactional arama hacimlerini hedefleyerek pazar payımızı %15 oranında genişletmeyi hedefliyoruz."
  },
  {
    title: "Core Web Vitals & Hız Avantajı",
    text: "Masaüstü ve mobil Core Web Vitals metriklerinde rakiplerimizden ortalama 22 puan öndeyiz. Bu teknik üstünlük, hedef dönüşüm kelimelerinde Google algoritmasının bizi önceliklendirmesini sağlamakta ve SERP tırmanışını hızlandırmaktadır."
  },
  {
    title: "İçerik Boşluğu & Tehdit Kalkanı",
    text: "1. rakibin blog ve rehber sayfalarındaki içerik derinliği tespit edilmiştir. İlgili aramalarda Featured Snippet pozisyonlarını geri kazanmak için 2.500+ kelimelik semantik rehberler ve uzman onaylı içerikler yayına alınacaktır."
  },
  {
    title: "Yönetim Kurulu Stratejik Özeti",
    text: "İşbu pazar payı ve SERP rekabet raporu; şirketimizin dijital görünürlüğünün rakipler üzerindeki net üstünlüğünü ve yerel aramalardaki podyum (Top 3) hakimiyetini teyit etmektedir. Belirlenen aksiyon planı doğrultusunda yatırım bütçesi onaylanmalıdır."
  }
];

export const MarketShareReportBuilderModal: React.FC<MarketShareReportBuilderModalProps> = ({
  isOpen,
  onClose,
  rankings,
  competitors,
  userName = "Diş Kliniği",
  userDomain = "klinik.com",
  strategicNotes = {}
}) => {
  const [activeTab, setActiveTab] = useState<"brand" | "notes" | "scope" | "preview">("brand");

  // General & Brand Settings
  const [reportTitle, setReportTitle] = useState("2026 Pazar Payı ve SERP Rekabet Analiz Raporu");
  const [companyName, setCompanyName] = useState(userName);
  const [domain, setDomain] = useState(userDomain);
  const [sector, setSector] = useState("Özel Sağlık & Diş Polikliniği");
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
  );
  const [targetAudience, setTargetAudience] = useState("Yönetim Kurulu Raporu");
  const [preparedBy, setPreparedBy] = useState("Baş SEO Analisti & Strateji Departmanı");
  const [selectedLogo, setSelectedLogo] = useState<string>(PRESET_LOGOS[0].dataUrl);
  const [customLogoFile, setCustomLogoFile] = useState<string | null>(null);

  // Custom Notes & Strategic Bullet Points
  const [executiveNotes, setExecutiveNotes] = useState(NOTE_TEMPLATES[0].text);
  const [customBullets, setCustomBullets] = useState<string[]>([
    "SERP 1. sıra liderliğinde en yakın rakibin 2 katı kelime hacmine sahibiz.",
    "Hedef yerel arama sorgularında dönüşüm oranını artıracak kullanıcı deneyimi revizyonu planlandı.",
    "Mobil sayfa açılış hızımız (PSI 92) tüm rakiplerin ortalamasından (PSI 71) belirgin biçimde yüksektir."
  ]);
  const [newBulletText, setNewBulletText] = useState("");

  // Scope Settings
  const [includePlaybook, setIncludePlaybook] = useState(true);
  const [includeKeywordsTable, setIncludeKeywordsTable] = useState(true);
  const [includeRowNotes, setIncludeRowNotes] = useState(true);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate high-level market metrics for preview
  const marketMetrics = useMemo(() => {
    return calculateMarketShareMetrics(rankings, competitors, companyName, domain);
  }, [rankings, competitors, companyName, domain]);

  const userEntity = marketMetrics.entities[0];

  // Active effective logo (custom uploaded takes priority, or selected preset)
  const activeLogoBase64 = customLogoFile || selectedLogo;

  // Handle custom logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomLogoFile(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return;
    setCustomBullets([...customBullets, newBulletText.trim()]);
    setNewBulletText("");
  };

  const handleRemoveBullet = (index: number) => {
    setCustomBullets(customBullets.filter((_, i) => i !== index));
  };

  // Import any row-level strategic notes that exist in the table
  const handleImportRowNotes = () => {
    const entries = Object.entries(strategicNotes).filter(
      ([_, n]) => typeof n === "string" && n.trim().length > 0
    ) as [string, string][];
    if (entries.length === 0) {
      alert("Tabloda henüz kayıtlı satır bazlı özel not bulunmuyor. Kelime satırlarına 'Stratejik Not' ekledikten sonra buradan tek tıkla rapora aktarabilirsiniz.");
      return;
    }

    const importedText = entries
      .slice(0, 4)
      .map(([kw, note]) => `• [${kw}]: ${note}`)
      .join("\n");

    setExecutiveNotes((prev) => `${prev}\n\n[Tablodan Aktarılan Satır Notları]:\n${importedText}`);
  };

  // Generate and download the comprehensive PDF report
  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      // Collect imported row notes if enabled
      const formattedRowNotes: Array<{ keyword: string; note: string; author?: string }> = includeRowNotes
        ? (Object.entries(strategicNotes).filter(
            ([_, n]) => typeof n === "string" && n.trim().length > 0
          ) as [string, string][]).map(([kw, n]) => ({ keyword: kw, note: n, author: preparedBy }))
        : [];

      const options: Partial<MarketSharePdfOptions> = {
        companyName,
        domain,
        sector,
        reportDate,
        reportTitle,
        targetAudience,
        preparedBy,
        brandLogoBase64: activeLogoBase64,
        notes: executiveNotes,
        customStrategicNotes: customBullets,
        rowNotes: formattedRowNotes,
        includeStrategyPlaybook: includePlaybook,
        includeKeywordsTable: includeKeywordsTable
      };

      const doc = await generateMarketShareAndCompetitorPdf(
        rankings,
        competitors,
        companyName,
        domain,
        options
      );

      const cleanName = (companyName || "Firma").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateSlug = new Date().toISOString().slice(0, 10);
      const filename = `Kapsamli_Pazar_Payi_Raporu_${cleanName}_${dateSlug}.pdf`;
      doc.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      alert("Rapor oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="market-share-report-builder-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="market-share-report-builder-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Profesyonel Pazar Payı ve Rekabet Analiz Raporu Oluşturucu
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  PDF & Marka Logolu
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tüm rakip verileri, pazar payı dağılımı, kurumsal logonuz ve özel strateji notlarınızla yönetim düzeyinde rapor indirin.
              </p>
            </div>
          </div>
          <button
            id="btn-close-report-builder"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            id="tab-btn-brand"
            onClick={() => setActiveTab("brand")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "brand"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. Marka & Rapor Kimliği
          </button>
          <button
            id="tab-btn-notes"
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Özel Notlar & Strateji
          </button>
          <button
            id="tab-btn-scope"
            onClick={() => setActiveTab("scope")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "scope"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Veri Kapsamı
          </button>
          <button
            id="tab-btn-preview"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            4. Canlı Rapor Önizleme
          </button>
        </div>

        {/* Modal Body - Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* TAB 1: BRAND & REPORT IDENTITY */}
          {activeTab === "brand" && (
            <div className="space-y-6">
              {/* Brand Logo Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      Marka Logosu (PDF Üst Başlığında Yer Alır)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kendi logonuzu (PNG/JPEG) yükleyebilir veya hazır kurumsal şablonlardan birini seçebilirsiniz.
                    </p>
                  </div>
                  {customLogoFile && (
                    <button
                      onClick={() => setCustomLogoFile(null)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Özel Logoyu Kaldır
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Active Logo Display */}
                  <div className="flex items-center gap-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 border border-slate-200 overflow-hidden">
                      <img
                        src={activeLogoBase64}
                        alt="Seçilen Marka Logosu"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {customLogoFile ? "Yüklenen Özel Logo" : "Seçili Hazır Şablon"}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        PDF sayfalarının sol üst bandında 15x15mm olarak yerleşir.
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                        Baskıya Hazır
                      </span>
                    </div>
                  </div>

                  {/* Upload button & Presets */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="input-upload-brand-logo"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100/70 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Bilgisayardan Logo Yükle (PNG / JPEG)
                    </button>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">Veya Şablon Seçin:</span>
                      <div className="flex gap-2">
                        {PRESET_LOGOS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedLogo(p.dataUrl);
                              setCustomLogoFile(null);
                            }}
                            className={`w-7 h-7 rounded-lg border p-0.5 transition-all ${
                              selectedLogo === p.dataUrl && !customLogoFile
                                ? "border-indigo-600 ring-2 ring-indigo-500/20"
                                : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                            }`}
                            title={p.name}
                          >
                            <img src={p.dataUrl} alt={p.name} className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Titles & Metadata */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Rapor Başlığı ve Kurumsal Bilgiler
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rapor Ana Başlığı
                    </label>
                    <input
                      id="input-report-title"
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hedef Kitle / Gizlilik Derecesi
                    </label>
                    <select
                      id="select-target-audience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Yonetim Kurulu Raporu">Yönetim Kurulu Raporu (Executive)</option>
                      <option value="Musteri & Danisan Sunumu">Müşteri & Danışan Sunumu</option>
                      <option value="SEO & Pazarlama Ekibi">SEO & Dijital Pazarlama Ekibi</option>
                      <option value="Genel Paydas Bilgilendirme">Genel Paydaş Bilgilendirme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Firma / Marka Adı
                    </label>
                    <input
                      id="input-company-name"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Web Sitesi / Domain
                    </label>
                    <input
                      id="input-domain"
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sektör & Şehir
                    </label>
                    <input
                      id="input-sector"
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Raporu Düzenleyen / Yetkili
                    </label>
                    <input
                      id="input-prepared-by"
                      type="text"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM STRATEGIC NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Executive Notes Textarea */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Özel Yönetici ve Strateji Notları (Executive Memorandum)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Raporun özel bölümünde yöneticilere ve paydaşlara sunulacak kişiselleştirilmiş değerlendirme metni.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleImportRowNotes}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
                    title="Tabloda eklenmiş satır notlarını bu metne aktarır"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tablodaki Satır Notlarını İçe Aktar
                  </button>
                </div>

                {/* Ready Templates */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">Hızlı Şablonlar:</span>
                  {NOTE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setExecutiveNotes(tmpl.text)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>

                <textarea
                  id="textarea-custom-notes"
                  rows={5}
                  value={executiveNotes}
                  onChange={(e) => setExecutiveNotes(e.target.value)}
                  placeholder="Yönetim kuruluna veya danışanınıza iletmek istediğiniz özel notları, sektörel fırsatları ve rekabet avantajlarını buraya yazın..."
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Numbered Strategic Bullet Points */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      Öncelikli Kritik Tespit Maddeleri (Maddeli Liste)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Yöneticinin hızla tarayabileceği numaralandırılmış eylem ve başarı maddeleri.
                    </p>
                  </div>
                </div>

                {/* Existing bullets */}
                <div className="space-y-2">
                  {customBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-800 dark:text-slate-200 flex-1">{bullet}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Maddeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new bullet */}
                <div className="flex gap-2 pt-2">
                  <input
                    id="input-new-bullet"
                    type="text"
                    value={newBulletText}
                    onChange={(e) => setNewBulletText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBullet();
                      }
                    }}
                    placeholder="Yeni bir tespit veya öneri maddesi ekleyin..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA & SCOPE SETTINGS */}
          {activeTab === "scope" && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[11px] text-slate-500 block">Kapsanan Kelimeler</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{rankings.length} Kelime</span>
                  <span className="text-[10px] text-indigo-600 font-medium">Hacim ve KD analizi</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[11px] text-slate-500 block">Analiz Edilen Rakip</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{competitors.length} Rakip</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Tam SERP kıyası</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[11px] text-slate-500 block">Pazar Payımız (SOV)</span>
                  <span className="text-lg font-bold text-indigo-600">%{userEntity?.marketSharePct || 0}</span>
                  <span className="text-[10px] text-slate-400 font-medium">CTR ağırlıklı</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[11px] text-slate-500 block">1. Sıra Liderliği</span>
                  <span className="text-lg font-bold text-emerald-600">{userEntity?.rank1Count || 0} Kelime</span>
                  <span className="text-[10px] text-slate-400 font-medium">SERP Zirvesi</span>
                </div>
              </div>

              {/* Inclusions Checklist */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Rapora Dahil Edilecek Bölümler
                </h3>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Sayfa 1: Yönetici Özeti & Pazar Payı (SOV) Pasta Dağılımı (Zorunlu)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Tüm rakiplerin pazar payı oranları, metrik kartları ve SWOT tehdit analizi.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={includeKeywordsTable}
                    onChange={(e) => setIncludeKeywordsTable(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Sayfa 2: Detaylı Kelime ve SERP Liderlik Karşılaştırma Tablosu
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Her anahtar kelimede bizim sıramız, 3 rakibin sırası ve pazar lideri farkı.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={includePlaybook}
                    onChange={(e) => setIncludePlaybook(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Sayfa 3: 90 Günlük Büyüme ve Rakipleri Geçme Aksiyon Planı
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Hızlı kazanımlar (Quick Wins), içerik boşluğu kapatma ve Core Web Vitals optimizasyon adımları.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={includeRowNotes}
                    onChange={(e) => setIncludeRowNotes(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Sayfa 4: Özel Danışman Notları & Çift İmzalı Yönetim Kurulu Onay Bloğu
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Yöneticiniz için yazdığınız özel açıklamalar, kritik tespit maddeleri ve resmi imza/kaşe kutusu.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE REPORT PREVIEW MOCKUP */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-xs text-indigo-800 dark:text-indigo-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Bu önizleme, PDF dosyasının üst başlığı, marka logosu ve yönetici notlarının yerleşimini temsil eder.
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200">
                  4 Sayfalık Tam Paket
                </span>
              </div>

              {/* Visual PDF Mockup Card */}
              <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border-2 border-slate-300 dark:border-slate-700 shadow-xl space-y-4 font-sans max-w-2xl mx-auto">
                {/* PDF Header Mockup */}
                <div className="bg-slate-900 text-white rounded-lg p-3.5 flex items-center justify-between border-b-2 border-indigo-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                      <img
                        src={activeLogoBase64}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-wide uppercase">{reportTitle}</h4>
                      <p className="text-[10px] text-slate-300">
                        Marka: {companyName} ({domain}) | Sektör: {sector} | Kapsam: {rankings.length} Kelime
                      </p>
                    </div>
                  </div>
                  <div className="bg-rose-500 text-white px-2.5 py-1 rounded text-center shrink-0">
                    <span className="text-[8px] font-bold block">GİZLİ VE STRATEJİK</span>
                    <span className="text-[7px] block opacity-90">{targetAudience}</span>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    1. YÖNETİCİ ÖZETİ VE PAZAR HAKİMİYETİ
                  </span>
                  <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {companyName}, analiz edilen {rankings.length} sektörel anahtar kelime havuzunda tahmini %
                    {userEntity?.marketSharePct || 0} pazar payı (Share of Voice) ile lider konumdadır. Toplam{" "}
                    {userEntity?.rank1Count || 0} kelimede 1. sıra liderliği, {userEntity?.top3Count || 0} kelimede ise
                    SERP podyumunda (Top 3) yer almaktadır.
                  </p>
                </div>

                {/* Market Share Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded border border-indigo-200 text-center">
                    <span className="text-[9px] text-indigo-700 block font-semibold">Bizim Pazar Payımız</span>
                    <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">
                      %{userEntity?.marketSharePct || 0}
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded border border-emerald-200 text-center">
                    <span className="text-[9px] text-emerald-700 block font-semibold">1. Sıra Hakimiyeti</span>
                    <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                      {userEntity?.rank1Count || 0} Kelime
                    </span>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded border border-purple-200 text-center">
                    <span className="text-[9px] text-purple-700 block font-semibold">Mobil CWV Hızı</span>
                    <span className="text-sm font-black text-purple-900 dark:text-purple-200">
                      {userEntity?.speedScore || 90}/100
                    </span>
                  </div>
                </div>

                {/* Custom Notes Section in Preview */}
                <div className="p-3 bg-slate-100/70 dark:bg-slate-900 rounded-lg border-l-4 border-indigo-600">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    ÖZEL YÖNETİCİ STRATEJİ NOTU (SAYFA 4)
                  </span>
                  <p className="text-[9px] text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    "{executiveNotes.slice(0, 220)}..."
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Yetkili: {preparedBy}</span>
                    <span>Tarih: {reportDate}</span>
                  </div>
                </div>

                {/* Signature Block Mockup */}
                <div className="grid grid-cols-2 gap-4 pt-2 text-[9px] text-slate-500">
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Raporu Hazırlayan</span>
                    <span className="text-[8px] block">{preparedBy}</span>
                    <span className="text-[7px] text-indigo-600 font-mono mt-1 block">✓ Elektronik Onaylı</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-right">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Yönetim Kurulu Onayı</span>
                    <span className="text-[8px] block">{companyName}</span>
                    <span className="text-[7px] text-slate-400 mt-1 block">Yetkili İmza & Kaşe</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              A4 Formatında Vektörel PDF • 4 Sayfa Kapsamlı • {rankings.length} Anahtar Kelime ve {competitors.length} Rakip
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Kapat
            </button>

            <button
              id="btn-generate-comprehensive-pdf"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  PDF Raporu Derleniyor...
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  PDF İndirildi!
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Kapsamlı PDF Raporunu Oluştur ve İndir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MarketShareReportBuilderModal;
