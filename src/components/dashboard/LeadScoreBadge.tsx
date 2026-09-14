import React, { useState } from "react";
import {
  Flame,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  Mail,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Sliders
} from "lucide-react";
import { FormLead, LeadScoringConfig } from "../../types";
import {
  calculateLeadScore,
  getPriorityBadgeStyle,
  getPriorityLabel,
  getScoreColorStyle,
  getLeadEngagementSignals,
  LeadScoreResult
} from "../../utils/leadScoring";

interface LeadScoreBadgeProps {
  lead: FormLead;
  scoringConfig?: Partial<LeadScoringConfig>;
  compact?: boolean; // For dense views like Kanban
  showEngagementChips?: boolean; // Display phone, message length, etc.
  allowExpandDetails?: boolean; // Allow clicking to toggle transparent factor breakdown
  onOpenDetails?: () => void;
  className?: string;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({
  lead,
  scoringConfig,
  compact = false,
  showEngagementChips = true,
  allowExpandDetails = true,
  onOpenDetails,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute live score using lead scoring engine
  const scoreResult: LeadScoreResult = React.useMemo(() => {
    return calculateLeadScore(lead, scoringConfig);
  }, [lead, scoringConfig]);

  const { score, priority, reasons, breakdown } = scoreResult;
  const badgeStyle = getPriorityBadgeStyle(priority);
  const colorStyle = getScoreColorStyle(score);
  const engagementSignals = React.useMemo(() => getLeadEngagementSignals(lead), [lead]);

  // Priority icon
  const PriorityIcon =
    priority === "high" ? Flame : priority === "medium" ? Zap : ShieldCheck;

  // If in compact mode (e.g. Kanban board cards)
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          title={`Lead Skoru: ${score}/100 (${getPriorityLabel(priority)})\n${reasons.slice(0, 2).join(" • ")}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
        >
          <PriorityIcon
            className={`w-3 h-3 ${
              priority === "high" ? "text-rose-600 animate-pulse" : badgeStyle.iconColor
            }`}
          />
          <span>Skor: {score}</span>
          <span className="opacity-70 font-mono">/100</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Score Strip & Engagement Signals */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Main Numerical Score Badge */}
        <div
          onClick={allowExpandDetails ? () => setIsExpanded(!isExpanded) : undefined}
          role={allowExpandDetails ? "button" : undefined}
          tabIndex={allowExpandDetails ? 0 : undefined}
          title="Lead skor puanı ve form etkileşim analizi (Döküm için tıklayın)"
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all select-none ${
            allowExpandDetails ? "cursor-pointer hover:shadow-xs hover:scale-[1.01]" : ""
          } ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] font-black ${
                priority === "high"
                  ? "bg-rose-600"
                  : priority === "medium"
                  ? "bg-amber-500"
                  : "bg-slate-600"
              }`}
            >
              <PriorityIcon className="w-3 h-3" />
            </span>

            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {score}
              </span>
              <span className="text-[10px] opacity-70 font-normal">/100</span>
            </div>
          </div>

          {/* Priority Label */}
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${colorStyle.pillBg}`}
          >
            {getPriorityLabel(priority)}
          </span>

          {/* Mini Score Bar */}
          <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
            <div
              className={`h-full transition-all duration-300 ${colorStyle.barColor}`}
              style={{ width: `${Math.max(8, score)}%` }}
            />
          </div>

          {allowExpandDetails && (
            <span className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-0.5">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>

        {/* Inline Form Engagement Signal Pills */}
        {showEngagementChips && (
          <div className="flex flex-wrap items-center gap-1.5">
            {engagementSignals.map((sig) => {
              let Icon = HelpCircle;
              if (sig.id === "phone") Icon = Phone;
              else if (sig.id === "message") Icon = FileText;
              else if (sig.id === "email") Icon = Mail;
              else if (sig.id === "attachments") Icon = Paperclip;
              else if (sig.id === "urgency") Icon = Flame;
              else if (sig.id === "customFields") Icon = CheckCircle2;
              else if (sig.id === "deal") Icon = Sparkles;

              return (
                <span
                  key={sig.id}
                  title={sig.tooltip}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                    sig.positive
                      ? "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      : "bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 line-through"
                  }`}
                >
                  <Icon className={`w-2.5 h-2.5 shrink-0 ${sig.positive ? "text-indigo-600 dark:text-indigo-400" : "text-rose-500"}`} />
                  <span className="font-bold">{sig.label}:</span>
                  <span>{sig.value}</span>
                  {sig.scoreBonus > 0 && (
                    <span className="font-mono text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                      +{sig.scoreBonus}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Expandable Transparent Factor Breakdown Panel */}
      {isExpanded && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Lead Skoru Analizi & Form Etkileşim Sinyalleri
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                Toplam: <strong className="text-slate-900 dark:text-white font-black">{score}</strong> / 100
              </span>
              {onOpenDetails && (
                <button
                  type="button"
                  onClick={onOpenDetails}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  Tam Detayı Aç ↗
                </button>
              )}
            </div>
          </div>

          {/* Key Reasons Checklist */}
          {reasons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Öne Çıkan Etkileşim Nedenleri:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {reasons.map((reason, rIdx) => (
                  <span
                    key={rIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{reason}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Factor Breakdown List */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Puan Faktörleri & Döküm:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {breakdown.map((f, fIdx) => (
                <div
                  key={fIdx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    f.matched
                      ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-slate-400 line-through"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-1.5">
                    {f.matched ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-[11px] font-bold truncate">{f.label}</div>
                      {f.note && (
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {f.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded ${
                      f.matched
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {f.points} / {f.maxPoints} p
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
