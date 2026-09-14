import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  Package, 
  Users, 
  Sparkles, 
  Table, 
  Filter, 
  FileText,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { SiteConfig, FormLead, ProductItem } from "../../types";
import { 
  exportProductsToExcel, 
  exportProductsToCsv, 
  exportLeadsToExcel, 
  exportLeadsToCsv,
  exportComprehensiveReport 
} from "../../utils/dataExport";
import { 
  compileBulkSeoPerformanceData, 
  generateMasterBulkSeoCsv, 
  downloadBulkSeoCsvFile 
} from "../../utils/bulkSeoPerformanceExporter";
import { slugify } from "../../utils/url";

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  defaultCategory?: "all" | "products" | "leads";
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  config,
  defaultCategory = "all"
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "products" | "leads">(defaultCategory);
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | "new" | "contacted" | "offered" | "closed">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const products: ProductItem[] = config.products?.items || [];
  const leads: FormLead[] = config.leads || [];

  const filteredLeads = leadStatusFilter === "all"
    ? leads
    : leads.filter(l => l.status === leadStatusFilter);

  const completedDealsCount = leads.filter(l => l.status === "closed").length;
  const totalRevenue = leads
    .filter(l => l.status === "closed" && l.dealValue)
    .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleExportProductsExcel = () => {
    if (products.length === 0) {
      showToast("Katalogda dışa aktarılacak ürün bulunmamaktadır.");
      return;
    }
    exportProductsToExcel(products, config.companyName);
    showToast(`${products.length} ürün başarıyla Excel (.xlsx) olarak indirildi.`);
  };

  const handleExportProductsCsv = () => {
    if (products.length === 0) {
      showToast("Katalogda dışa aktarılacak ürün bulunmamaktadır.");
      return;
    }
    exportProductsToCsv(products, config.companyName);
    showToast(`${products.length} ürün başarıyla CSV formatında indirildi.`);
  };

  const handleExportLeadsExcel = () => {
    if (filteredLeads.length === 0) {
      showToast("Seçili filtreye ait müşteri talebi bulunmamaktadır.");
      return;
    }
    const suffix = leadStatusFilter !== "all" ? leadStatusFilter : undefined;
    exportLeadsToExcel(filteredLeads, config.companyName, suffix);
    showToast(`${filteredLeads.length} müşteri talebi Excel (.xlsx) olarak indirildi.`);
  };

  const handleExportLeadsCsv = () => {
    if (filteredLeads.length === 0) {
      showToast("Seçili filtreye ait müşteri talebi bulunmamaktadır.");
      return;
    }
    const suffix = leadStatusFilter !== "all" ? leadStatusFilter : undefined;
    exportLeadsToCsv(filteredLeads, config.companyName, suffix);
    showToast(`${filteredLeads.length} müşteri talebi CSV olarak indirildi.`);
  };

  const handleExportAllReport = () => {
    exportComprehensiveReport(config);
    showToast("Tüm faaliyet ve katalog verileri çok sayfalı Excel (.xlsx) kitabı olarak indirildi!");
  };

  const handleExportBulkSeoCsv = () => {
    const { items } = compileBulkSeoPerformanceData(config);
    const companySlug = config.companyName ? slugify(config.companyName) : "site";
    const dateStr = new Date().toISOString().slice(0, 10);
    const csvContent = generateMasterBulkSeoCsv(items, config);
    const filename = `${companySlug}-toplu-seo-performans-${dateStr}.csv`;
    downloadBulkSeoCsvFile(csvContent, filename);
    showToast(`${items.length} sayfanın kapsamlı SEO performans raporu CSV olarak indirildi.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Dışa Aktarma & Raporlama Merkezi</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  CSV & Excel (.xlsx)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ürün kataloğunuzu ve müşteri taleplerinizi harici muhasebe, CRM ve raporlama araçlarına aktarın.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Tüm Raporlar & Kapsamlı Özet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "products"
                  ? "border-amber-600 text-amber-800 bg-white shadow-xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Package className="w-4 h-4 text-amber-600" />
              <span>Ürün Kataloğu ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "leads"
                  ? "border-indigo-600 text-indigo-800 bg-white shadow-xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Müşteri Talepleri & CRM ({leads.length})</span>
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ALL / COMPREHENSIVE */}
          {activeTab === "all" && (
            <div className="space-y-6">
              {/* Hero Banner: All-in-one workbook */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Önerilen Tam Rapor</span>
                  </div>
                  <h3 className="text-base font-black">
                    Kapsamlı Yönetici & Faaliyet Raporu (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tek tıklamayla <strong>Ürün Kataloğu</strong>, <strong>Gelen Müşteri Talepleri</strong>, <strong>Satış Tutarları</strong>, <strong>E-Bülten Aboneleri</strong> ve <strong>A/B Test Performansını</strong> ayrı ayrı sekmelerde barındıran tam Excel çalışma kitabını oluşturun.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>✓ Otomatik Sütun Genişlikleri</span>
                    <span>✓ Türkçe Karakter Uyumu (UTF-8)</span>
                    <span>✓ Excel, Numbers ve Google Sheets</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-export-comprehensive-report"
                  onClick={handleExportAllReport}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Tek Tıkla Excel Kitabı İndir (.xlsx)</span>
                </button>
              </div>

              {/* Two Column Cards: Products & Leads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Ürün Kataloğu</h4>
                        <p className="text-[11px] text-slate-500">{products.length} adet kayıtlı ürün</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Katalog
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ürün adları, kategoriler, güncel ve eski fiyatlar, stok durumları, kısa özet ve SEO bağlantılarını içerir.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleExportProductsExcel}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="Microsoft Excel formatında indirin"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportProductsCsv}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="CSV formatında indirin"
                    >
                      <FileText className="w-4 h-4" />
                      <span>CSV (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Leads Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Müşteri Talepleri (CRM)</h4>
                        <p className="text-[11px] text-slate-500">
                          {leads.length} talep ({completedDealsCount} kapandı)
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-bold">
                      {totalRevenue.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    İsim, telefon, e-posta, talep edilen hizmet, mesaj, durum etiketleri, A/B varyantı ve ciro tutarlarını içerir.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleExportLeadsExcel}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="Microsoft Excel formatında indirin"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportLeadsCsv}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="CSV formatında indirin"
                    >
                      <FileText className="w-4 h-4" />
                      <span>CSV (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Bulk SEO Performance Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Toplu SEO Performans Matrisi (Bulk SEO Export)</h4>
                        <p className="text-[11px] text-slate-500">
                          Tüm site sayfalarının meta etiketleri, içerik açıkları, Google sıralamaları ve sağlık denetimi
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                      Kapsamlı CSV
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sayfa başlıkları, meta açıklamaları, canonical URL’ler, OpenGraph etiketleri, robot kuralları, eksik içerik açıkları (content gaps), tahmini arama motoru sıralamaları ve 100 puan üzerinden sağlık denetim sonuçlarını içeren tam kapsamlı master CSV dosyası.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      id="export-bulk-seo-csv-btn"
                      onClick={handleExportBulkSeoCsv}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="Tüm sayfalar için toplu SEO performans CSV raporunu indirin"
                    >
                      <Download className="w-4 h-4" />
                      <span>Master SEO Performans CSV İndir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-5">
              {/* Product Export Actions Header */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Ürün Kataloğu Dışa Aktarma
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Toplam <strong>{products.length} adet</strong> ürün ve hizmet tablosu hazırlandı.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportProductsExcel}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel (.xlsx) İndir</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportProductsCsv}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>CSV (.csv) İndir</span>
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold flex items-center gap-1.5 text-slate-700">
                    <Table className="w-3.5 h-3.5 text-slate-400" />
                    <span>Katalog Önizleme (İlk 5 Ürün)</span>
                  </span>
                  <span>Toplam {products.length} Ürün</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3">Ürün Adı</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Fiyat</th>
                        <th className="p-3">Eski Fiyat</th>
                        <th className="p-3">Stok Durumu</th>
                        <th className="p-3">Rozet</th>
                        <th className="p-3">SEO URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {products.slice(0, 5).map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{prod.title}</td>
                          <td className="p-3 text-slate-600">{prod.category || "Genel"}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">{prod.price}</td>
                          <td className="p-3 font-mono text-slate-400 line-through">{prod.oldPrice || "-"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.inStock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {prod.inStock ? "Stokta" : "Tükendi"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{prod.badge || "-"}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            {prod.slug ? `/urun-${prod.slug}.html` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === "leads" && (
            <div className="space-y-5">
              {/* Leads Filter Bar */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 mr-1">
                    <Filter className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Filtre:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLeadStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "all"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Tümü ({leads.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeadStatusFilter("new")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "new"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Yeni ({leads.filter(l => l.status === "new").length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeadStatusFilter("closed")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leadStatusFilter === "closed"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Kapanan / Satış ({completedDealsCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportLeadsExcel}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel (.xlsx) İndir</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLeadsCsv}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>CSV (.csv) İndir</span>
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold flex items-center gap-1.5 text-slate-700">
                    <Table className="w-3.5 h-3.5 text-slate-400" />
                    <span>Talepler Önizleme (İlk 5 Talep)</span>
                  </span>
                  <span>Toplam {filteredLeads.length} Kayıt</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3">Tarih</th>
                        <th className="p-3">Müşteri</th>
                        <th className="p-3">Telefon</th>
                        <th className="p-3">Hizmet / Ürün</th>
                        <th className="p-3">Durum</th>
                        <th className="p-3">A/B Varyant</th>
                        <th className="p-3">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredLeads.slice(0, 5).map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{lead.date}</td>
                          <td className="p-3 font-semibold text-slate-900">{lead.name}</td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">{lead.phone}</td>
                          <td className="p-3 text-slate-700">{lead.serviceOrProduct}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.status === "closed"
                                ? "bg-emerald-100 text-emerald-800"
                                : lead.status === "offered"
                                ? "bg-indigo-100 text-indigo-800"
                                : lead.status === "contacted"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {lead.status === "closed"
                                ? "Satış"
                                : lead.status === "offered"
                                ? "Teklif"
                                : lead.status === "contacted"
                                ? "İletişim"
                                : "Yeni"}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-purple-700 font-bold">
                            {lead.heroVariant ? `Varyant ${lead.heroVariant}` : "-"}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            {lead.dealValue ? `${lead.dealValue.toLocaleString("tr-TR")} ₺` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Veriler anında tarayıcınızda işlenir, sunucuya aktarılmaz.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
