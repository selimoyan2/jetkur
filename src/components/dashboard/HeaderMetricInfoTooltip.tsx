import React, { useState, useRef, useEffect } from "react";
import { Info, Sparkles, HelpCircle } from "lucide-react";

export interface HeaderMetricInfoTooltipProps {
  id?: string;
  title: string;
  description: string;
  formula?: string;
  benchmark?: string;
  tag?: string;
  align?: "left" | "center" | "right";
  iconType?: "info" | "help";
}

export const HeaderMetricInfoTooltip: React.FC<HeaderMetricInfoTooltipProps> = ({
  id,
  title,
  description,
  formula,
  benchmark,
  tag,
  align = "left",
  iconType = "info",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  }[align];

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        id={id ? `info-btn-${id}` : undefined}
        data-testid={id ? `info-btn-${id}` : "header-metric-info-btn"}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          // Keep open if moving focus inside container
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
          }
        }}
        aria-label={`${title} metriği hakkında detaylı bilgi göster`}
        aria-expanded={isOpen}
        className={`p-0.5 rounded-md transition-all cursor-help flex items-center justify-center focus:outline-hidden focus:ring-1 focus:ring-amber-400 ${
          isOpen
            ? "text-amber-300 bg-slate-800"
            : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/80"
        }`}
        title={`${title} - Metrik Açıklamasını Gör`}
      >
        {iconType === "help" ? (
          <HelpCircle className="w-3.5 h-3.5" />
        ) : (
          <Info className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Floating Tooltip / Popover Panel */}
      {isOpen && (
        <div
          role="tooltip"
          id={id ? `tooltip-${id}` : undefined}
          data-testid={id ? `tooltip-${id}` : "header-metric-tooltip"}
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-1.5 ${alignmentClasses} z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md text-left font-normal normal-case tracking-normal animate-in fade-in zoom-in-95 duration-150 pointer-events-auto`}
        >
          {/* Header Row: Tag & Close indicator */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/90">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
              </span>
              <span className="text-xs font-black text-white tracking-tight">
                {title}
              </span>
            </div>
            {tag && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                {tag}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-2.5">
            {description}
          </p>

          {/* Optional Formula or Metric Calculation */}
          {formula && (
            <div className="mb-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5 font-mono">
              <span className="text-indigo-400 font-bold font-sans shrink-0">Formül:</span>
              <span className="text-amber-200/90">{formula}</span>
            </div>
          )}

          {/* Benchmark / Recommended Action */}
          {benchmark && (
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-1.5">
              <span className="font-bold text-amber-400 shrink-0">⚡ Hedef:</span>
              <span className="leading-snug">{benchmark}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
