import React, { useState, useMemo } from "react";
import { FormLead } from "../../types";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Clock,
  PieChart,
  ArrowUpRight,
  Plus,
  Edit3,
  Download,
  Filter,
  Sparkles,
  Calendar,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface RevenueTrackerCardProps {
  leads: FormLead[];
  onUpdateLead?: (leadId: string, updates: Partial<FormLead>) => void;
  onAddLead?: (newLead: FormLead) => void;
  onSelectStatusFilter?: (status: "all" | "new" | "contacted" | "offered" | "closed") => void;
  activeStatusFilter?: string;
  currencySymbol?: string;
  companyName?: string;
  onExportLeads?: () => void;
}

export const RevenueTrackerCard: React.FC<RevenueTrackerCardProps> = ({
  leads = [],
  onUpdateLead,
  onAddLead,
  onSelectStatusFilter,
  activeStatusFilter = "all",
  currencySymbol = "₺",
  companyName = "İşletmeniz",
  onExportLeads
}) => {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  // New deal form state
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [newDealValue, setNewDealValue] = useState("");
  const [newDealNotes, setNewDealNotes] = useState("");

  // Format currency helper
  const formatMoney = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString("tr-TR")}`;
  };

  // Filter leads based on timeframe
  const filteredByTime = useMemo(() => {
    if (timeframe === "all") return leads;
    return leads.filter((lead) => {
      const d = (lead.date || "").toLowerCase();
      if (timeframe === "week") {
        return d.includes("bugün") || d.includes("dün") || d.includes("2 gün") || d.includes("3 gün");
      }
      if (timeframe === "month") {
        return (
          d.includes("bugün") ||
          d.includes("dün") ||
          d.includes("gün") ||
          d.includes("bu hafta") ||
          d.includes("ağustos") ||
          d.includes("eylül")
        );
      }
      return true;
    });
  }, [leads, timeframe]);

  // Core calculations
  const metrics = useMemo(() => {
    const completedDeals = filteredByTime.filter((l) => l.status === "closed");
    const openLeads = filteredByTime.filter((l) => l.status !== "closed");

    const totalCompletedRevenue = completedDeals.reduce((acc, l) => {
      return acc + (Number(l.dealValue) || 0);
    }, 0);

    const pipelineRevenue = openLeads.reduce((acc, l) => {
      return acc + (Number(l.dealValue) || 0);
    }, 0);

    const totalPotentialRevenue = totalCompletedRevenue + pipelineRevenue;

    const completedCount = completedDeals.length;
    const totalLeadsCount = filteredByTime.length;

    const avgDealValue = completedCount > 0 ? Math.round(totalCompletedRevenue / completedCount) : 0;
    const conversionRate = totalLeadsCount > 0 ? Math.round((completedCount / totalLeadsCount) * 100) : 0;

    // Service breakdown
    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    completedDeals.forEach((deal) => {
      const sName = deal.serviceOrProduct || "Diğer Hizmet";
      if (!serviceMap[sName]) {
        serviceMap[sName] = { count: 0, revenue: 0 };
      }
      serviceMap[sName].count += 1;
      serviceMap[sName].revenue += Number(deal.dealValue) || 0;
    });

    const serviceBreakdown = Object.entries(serviceMap)
      .map(([service, data]) => ({
        service,
        count: data.count,
        revenue: data.revenue,
        percentage: totalCompletedRevenue > 0 ? Math.round((data.revenue / totalCompletedRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      completedDeals,
      openLeads,
      totalCompletedRevenue,
      pipelineRevenue,
      totalPotentialRevenue,
      completedCount,
      totalLeadsCount,
      avgDealValue,
      conversionRate,
      serviceBreakdown
    };
  }, [filteredByTime]);

  // Handle saving deal value edit
  const handleSaveDealValue = (leadId: string) => {
    const num = parseFloat(editingValue.replace(/[^0-9.]/g, ""));
    if (!isNaN(num) && onUpdateLead) {
      onUpdateLead(leadId, { dealValue: num });
    }
    setEditingDealId(null);
    setEditingValue("");
  };

  // Handle quick add new completed deal
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const numValue = parseFloat(newDealValue.replace(/[^0-9.]/g, "")) || 0;
    const newLead: FormLead = {
      id: `lead-${Date.now()}`,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || "0500 000 00 00",
      serviceOrProduct: newService.trim() || "Genel Satış / Hizmet",
      message: newDealNotes.trim() || "Yönetim panelinden manuel kaydedilen başarılı anlaşma.",
      sourcePage: "Panel Satış Girişi",
      status: "closed",
      dealValue: numValue,
      date: "Bugün " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      completedAt: "Bugün"
    };

    if (onAddLead) {
      onAddLead(newLead);
    } else if (onUpdateLead) {
      // Fallback
      onUpdateLead(newLead.id, newLead);
    }

    setShowAddDealModal(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewService("");
    setNewDealValue("");
    setNewDealNotes("");
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 text-white p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Gelir & Satış Performans Takibi (Revenue Tracker)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
              Canlı Ciro
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Form taleplerinden ve müşteri siparişlerinden kapanan anlaşmaların toplam cirosunu ve iş performansınızı takip edin.
          </p>
        </div>

        {/* Timeframe selector & Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === "all"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === "month"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bu Ay
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("week")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === "week"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Son 7 Gün
            </button>
          </div>

          {/* Add deal button */}
          <button
            type="button"
            onClick={() => setShowAddDealModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Satış Ekle</span>
          </button>

          {/* Export CSV if available */}
          {onExportLeads && (
            <button
              type="button"
              onClick={onExportLeads}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Ciro ve müşteri verilerini CSV olarak indirin"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Spotlight Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL COMPLETED REVENUE */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-emerald-500/30 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tamamlanan Ciro (Net)</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatMoney(metrics.totalCompletedRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>{metrics.completedCount} Başarılı Anlaşma</span>
            <button
              type="button"
              onClick={() => onSelectStatusFilter && onSelectStatusFilter("closed")}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Listele</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 2: AVERAGE DEAL SIZE */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Ortalama Anlaşma Değeri</span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatMoney(metrics.avgDealValue)}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            İşlem başına ortalama tahsilat
          </div>
        </div>

        {/* KPI 3: CONVERSION RATE */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Satış Dönüşüm Oranı</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
              %{metrics.conversionRate}
            </div>
            <div className="text-xs text-slate-400">
              ({metrics.completedCount}/{metrics.totalLeadsCount})
            </div>
          </div>
          {/* Progress visual */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.conversionRate)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: OPEN PIPELINE / POTENTIAL */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bekleyen Teklif / Potansiyel</span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 tracking-tight">
            {formatMoney(metrics.pipelineRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>{metrics.openLeads.length} Açık Talep</span>
            <span className="text-slate-500 font-mono">Toplam: {formatMoney(metrics.totalPotentialRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Ratio & Progress Bar */}
      <div className="relative z-10 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Kapanan Ciro: <strong>{formatMoney(metrics.totalCompletedRevenue)}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Görüşülen & Teklif Verilen: <strong>{formatMoney(metrics.pipelineRevenue)}</strong></span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Toplam İş Hacmi: <strong className="text-white">{formatMoney(metrics.totalPotentialRevenue)}</strong>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          {metrics.totalPotentialRevenue > 0 ? (
            <>
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${(metrics.totalCompletedRevenue / metrics.totalPotentialRevenue) * 100}%`
                }}
                title={`Kapanan: ${formatMoney(metrics.totalCompletedRevenue)}`}
              />
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${(metrics.pipelineRevenue / metrics.totalPotentialRevenue) * 100}%`
                }}
                title={`Bekleyen: ${formatMoney(metrics.pipelineRevenue)}`}
              />
            </>
          ) : (
            <div className="h-full w-full bg-slate-800" />
          )}
        </div>
      </div>

      {/* Service Revenue Breakdown Toggle */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Hizmet & Ürün Bazlı Gelir Dağılımı ({metrics.serviceBreakdown.length} Kategori)</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span>{isBreakdownExpanded ? "Gizle" : "Detayları Göster"}</span>
            {isBreakdownExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isBreakdownExpanded && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            {metrics.serviceBreakdown.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                Henüz tamamlanmış satış bulunmuyor. Taleplerinizi "Satış Tamamlandı" olarak işaretleyin.
              </div>
            ) : (
              metrics.serviceBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{item.service}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.count} Satış</span>
                      <span className="font-mono font-bold text-emerald-400">{formatMoney(item.revenue)}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        %{item.percentage}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Completed Deals Quick View & Inline Value Editor */}
      <div className="relative z-10 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Son Kapanan Anlaşmalar & Tutar Düzenleme</span>
          </div>

          <div className="flex items-center gap-2">
            {onSelectStatusFilter && (
              <button
                type="button"
                onClick={() => onSelectStatusFilter(activeStatusFilter === "closed" ? "all" : "closed")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  activeStatusFilter === "closed"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
              >
                {activeStatusFilter === "closed" ? "Filtreyi Temizle" : "Sadece Tamamlananları Filtrele"}
              </button>
            )}
          </div>
        </div>

        {metrics.completedDeals.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Henüz tamamlanmış satış veya ciro kaydı yok.</p>
            <p className="text-[11px]">
              Aşağıdaki gelen talepleri "Satış Tamamlandı" durumuna getirin veya "Yeni Satış Ekle" butonunu kullanın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.completedDeals.slice(0, 6).map((deal) => (
              <div
                key={deal.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{deal.name}</div>
                    <div className="text-[11px] text-amber-400/90 font-medium truncate">
                      {deal.serviceOrProduct}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {deal.date}
                  </span>
                </div>

                {/* Deal Value Row with Edit */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Anlaşma Tutarı:</span>

                  {editingDealId === deal.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        placeholder="Örn: 2500"
                        className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-amber-500 text-xs font-mono text-amber-400 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveDealValue(deal.id);
                          if (e.key === "Escape") setEditingDealId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveDealValue(deal.id)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-[11px] font-bold text-white"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDealId(null)}
                        className="px-1.5 py-0.5 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black font-mono text-emerald-400">
                        {formatMoney(Number(deal.dealValue) || 0)}
                      </span>
                      {onUpdateLead && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDealId(deal.id);
                            setEditingValue(String(deal.dealValue || ""));
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Anlaşma tutarını güncelle"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW COMPLETED DEAL / SALE */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Yeni Satış / Anlaşma Kaydı</h3>
                  <p className="text-[11px] text-slate-400">Tamamlanan anlaşmayı doğrudan cironuza ekleyin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Müşteri / Firma Adı *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Örn: Hasan Yılmaz veya Akdeniz Lojistik"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Anlaşma Tutarı (₺) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    placeholder="Örn: 3500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Hizmet / Satış Konusu</label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Örn: Oto Kurtarıcı Hizmeti veya Yıllık Bakım"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Anlaşma Notu / Detayı</label>
                <textarea
                  rows={2}
                  value={newDealNotes}
                  onChange={(e) => setNewDealNotes(e.target.value)}
                  placeholder="İşlem başarıyla tamamlandı, fatura kesildi vb."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Satışı Kaydet & Ciroya Ekle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
