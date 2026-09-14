import React, { useMemo } from "react";
import {
  Flame,
  Zap,
  Phone,
  FileText,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Sliders
} from "lucide-react";
import { FormLead, SiteConfig } from "../../types";
import { calculateLeadScore } from "../../utils/leadScoring";

interface LeadScoringSummaryCardProps {
  leads: FormLead[];
  config: SiteConfig;
  activeScoreFilter: "all" | "high" | "medium" | "low";
  onSelectScoreFilter: (filter: "all" | "high" | "medium" | "low") => void;
  onSimulateNewLead?: () => void;
  onOpenScoringSettings?: () => void;
  onNavigateToInsights?: () => void;
}

export const LeadScoringSummaryCard: React.FC<LeadScoringSummaryCardProps> = ({
  leads,
  config,
  activeScoreFilter,
  onSelectScoreFilter,
  onSimulateNewLead,
  onOpenScoringSettings,
  onNavigateToInsights
}) => {
  // Calculate scoring metrics
  const stats = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        avgScore: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        lowPriorityCount: 0,
        phonePercentage: 0,
        avgMessageLength: 0,
        detailedMessageCount: 0
      };
    }

    let totalScore = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let withPhone = 0;
    let totalMsgLen = 0;
    let detailedMsg = 0;

    leads.forEach((l) => {
      const res = calculateLeadScore(l, config.leadNotifications?.scoring);
      totalScore += res.score;
      if (res.priority === "high") high++;
      else if (res.priority === "medium") medium++;
      else low++;

      const phoneDigits = (l.phone || "").replace(/[^0-9]/g, "");
      if (phoneDigits.length >= 7) withPhone++;

      const len = (l.message || "").trim().length;
      totalMsgLen += len;
      if (len >= 50) detailedMsg++;
    });

    return {
      avgScore: Math.round(totalScore / leads.length),
      highPriorityCount: high,
      mediumPriorityCount: medium,
      lowPriorityCount: low,
      phonePercentage: Math.round((withPhone / leads.length) * 100),
      avgMessageLength: Math.round(totalMsgLen / leads.length),
      detailedMessageCount: detailedMsg
    };
  }, [leads, config.leadNotifications?.scoring]);

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Akıllı Lead Scoring & Form Etkileşim Analizi
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono font-bold">
                0-100 Puanlama
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Form dolduran her müşterinin mesaj uzunluğu, telefon tamlığı ve aciliyet sinyallerine göre öncelik skoru otomatik hesaplanır.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToInsights && (
            <button
              type="button"
              onClick={onNavigateToInsights}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-indigo-400/40"
              title="Lead Kalite Dağılımı ve Kaynak Grafikleri Sayfasına Git"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Lead Insights &amp; Grafikler →</span>
            </button>
          )}

          {onSimulateNewLead && (
            <button
              type="button"
              onClick={onSimulateNewLead}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Yeni form başvurusu simüle ederek skor hesaplamasını canlı test edin"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Canlı Başvuru Simüle Et</span>
            </button>
          )}

          {onOpenScoringSettings && (
            <button
              type="button"
              onClick={onOpenScoringSettings}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Puanlama kuralları ve bildirim ayarlarını aç"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Kural Ayarları</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Average Score */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Ortalama Skor</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">
              {stats.avgScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                stats.avgScore >= 70 ? "bg-rose-500" : stats.avgScore >= 40 ? "bg-amber-500" : "bg-slate-400"
              }`}
              style={{ width: `${stats.avgScore}%` }}
            />
          </div>
        </div>

        {/* High Priority Hot Leads */}
        <div
          onClick={() => onSelectScoreFilter(activeScoreFilter === "high" ? "all" : "high")}
          className={`p-3 rounded-2xl border space-y-1 transition-all cursor-pointer ${
            activeScoreFilter === "high"
              ? "bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40"
              : "bg-white/5 border-white/10 hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Yüksek Öncelik (70+)</span>
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {stats.highPriorityCount}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              Talep ({leads.length > 0 ? Math.round((stats.highPriorityCount / leads.length) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-rose-300 font-medium block truncate">
            {activeScoreFilter === "high" ? "Filtre Aktif ✓" : "Tıklayınca Filtrele ➔"}
          </span>
        </div>

        {/* Phone Signal */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Telefon İletilme</span>
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              %{stats.phonePercentage}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">Oran</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Formda telefon bırakanlar
          </span>
        </div>

        {/* Message Length Signal */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span>Ortalama Mesaj</span>
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-300 font-mono">
              {stats.avgMessageLength}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">Karakter</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {stats.detailedMessageCount} talep detaylı (&gt;50 kr.)
          </span>
        </div>
      </div>

      {/* Quick Score Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Skor Filtresi:</span>
        </span>

        <button
          type="button"
          onClick={() => onSelectScoreFilter("all")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeScoreFilter === "all"
              ? "bg-white text-slate-900 shadow-xs"
              : "bg-white/10 hover:bg-white/20 text-slate-300"
          }`}
        >
          Tüm Talepler ({leads.length})
        </button>

        <button
          type="button"
          onClick={() => onSelectScoreFilter("high")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeScoreFilter === "high"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Yüksek Öncelik (≥70 p): {stats.highPriorityCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectScoreFilter("medium")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeScoreFilter === "medium"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/50"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Orta Öncelik (40-69 p): {stats.mediumPriorityCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectScoreFilter("low")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeScoreFilter === "low"
              ? "bg-slate-300 text-slate-950 shadow-xs"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Standart / Düşük (&lt;40 p): {stats.lowPriorityCount}
        </button>
      </div>
    </div>
  );
};
