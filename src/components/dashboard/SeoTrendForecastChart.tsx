import React, { useState, useMemo } from "react";
import { EmergingSeoTrend, TrendTimelinePoint } from "../../types";
import { Sparkles, Eye, TrendingUp, Calendar, Zap, AlertCircle } from "lucide-react";

interface SeoTrendForecastChartProps {
  trends: EmergingSeoTrend[];
  selectedTrendId: string;
  onSelectTrend: (id: string) => void;
  chartMode: "single" | "multi";
  onChartModeChange: (mode: "single" | "multi") => void;
  metricType: "index" | "volume";
  onMetricTypeChange: (metric: "index" | "volume") => void;
}

export const SeoTrendForecastChart: React.FC<SeoTrendForecastChartProps> = ({
  trends,
  selectedTrendId,
  onSelectTrend,
  chartMode,
  onChartModeChange,
  metricType,
  onMetricTypeChange
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredTrendId, setHoveredTrendId] = useState<string | null>(null);

  const selectedTrend = useMemo(() => {
    return trends.find((t) => t.id === selectedTrendId) || trends[0];
  }, [trends, selectedTrendId]);

  // Chart dimensions
  const width = 860;
  const height = 340;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // X axis timeline (12 points)
  const timelinePoints = selectedTrend?.timeline || [];
  const pointCount = timelinePoints.length;

  const getX = (idx: number) => {
    if (pointCount <= 1) return padding.left;
    return padding.left + (idx / (pointCount - 1)) * innerWidth;
  };

  // Max value calculation for Y axis
  const maxY = useMemo(() => {
    if (metricType === "index") return 100;
    let max = 0;
    trends.forEach((t) => {
      t.timeline.forEach((p) => {
        const val = p.rawSearchVolume || p.volumeIndex * 150;
        if (val > max) max = val;
      });
    });
    return Math.ceil((max * 1.15) / 1000) * 1000 || 20000;
  }, [trends, metricType]);

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxY, val));
    return padding.top + innerHeight - (clamped / maxY) * innerHeight;
  };

  // Find index where forecast starts
  const forecastStartIndex = useMemo(() => {
    const idx = timelinePoints.findIndex((p) => p.isForecast);
    return idx !== -1 ? idx : 7;
  }, [timelinePoints]);

  // Path generator with smooth bezier curve
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Build points for selected trend
  const selectedHistoricalPts = useMemo(() => {
    if (!selectedTrend) return [];
    return selectedTrend.timeline
      .slice(0, forecastStartIndex)
      .map((p, i) => ({
        x: getX(i),
        y: getY(metricType === "index" ? p.volumeIndex : p.rawSearchVolume || p.volumeIndex * 150)
      }));
  }, [selectedTrend, forecastStartIndex, metricType, maxY]);

  const selectedForecastPts = useMemo(() => {
    if (!selectedTrend) return [];
    // Start from the last historical point for seamless continuity
    const startIdx = Math.max(0, forecastStartIndex - 1);
    return selectedTrend.timeline
      .slice(startIdx)
      .map((p, i) => ({
        x: getX(startIdx + i),
        y: getY(metricType === "index" ? p.volumeIndex : p.rawSearchVolume || p.volumeIndex * 150)
      }));
  }, [selectedTrend, forecastStartIndex, metricType, maxY]);

  // Confidence area path (upper bound curve forward, then lower bound curve backwards)
  const confidenceAreaPath = useMemo(() => {
    if (!selectedTrend || chartMode !== "single") return "";
    const forecastSlice = selectedTrend.timeline.slice(Math.max(0, forecastStartIndex - 1));
    const startIdx = Math.max(0, forecastStartIndex - 1);

    const upperPts: { x: number; y: number }[] = [];
    const lowerPts: { x: number; y: number }[] = [];

    forecastSlice.forEach((p, i) => {
      const idx = startIdx + i;
      const x = getX(idx);
      const val = metricType === "index" ? p.volumeIndex : p.rawSearchVolume || p.volumeIndex * 150;
      const confUpper = p.confidenceUpper || Math.min(100, val + (i * 3));
      const confLower = p.confidenceLower || Math.max(0, val - (i * 3));

      upperPts.push({ x, y: getY(metricType === "index" ? confUpper : confUpper * 150) });
      lowerPts.push({ x, y: getY(metricType === "index" ? confLower : confLower * 150) });
    });

    if (upperPts.length === 0 || lowerPts.length === 0) return "";

    const upperPath = generateSmoothPath(upperPts);
    // Reverse lower points
    const reversedLower = [...lowerPts].reverse();
    let area = upperPath;
    area += ` L ${reversedLower[0].x} ${reversedLower[0].y}`;
    for (let i = 0; i < reversedLower.length - 1; i++) {
      const p1 = reversedLower[i];
      const p2 = reversedLower[i + 1];
      area += ` L ${p2.x} ${p2.y}`;
    }
    area += " Z";
    return area;
  }, [selectedTrend, chartMode, forecastStartIndex, metricType, maxY]);

  // Gradient area under historical curve
  const historicalAreaPath = useMemo(() => {
    if (selectedHistoricalPts.length === 0) return "";
    const base = generateSmoothPath(selectedHistoricalPts);
    const last = selectedHistoricalPts[selectedHistoricalPts.length - 1];
    const first = selectedHistoricalPts[0];
    return `${base} L ${last.x} ${padding.top + innerHeight} L ${first.x} ${padding.top + innerHeight} Z`;
  }, [selectedHistoricalPts, padding.top, innerHeight]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Grafik Modu:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onChartModeChange("single")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === "single"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Odaklı Detay (Güven Aralıklı)
            </button>
            <button
              type="button"
              onClick={() => onChartModeChange("multi")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === "multi"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              5 Trend Kıyaslama (Çoklu Çizgi)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Metrik:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => onMetricTypeChange("index")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricType === "index"
                    ? "bg-slate-800 text-indigo-300 border border-indigo-500/30 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Google Trends 0-100 normalleştirilmiş arama ilgisi"
              >
                İlgi İndeksi (0 - 100)
              </button>
              <button
                type="button"
                onClick={() => onMetricTypeChange("volume")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricType === "volume"
                    ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tahmini aylık toplam arama adedi"
              >
                Aylık Tahmini Hacim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="selectedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={selectedTrend?.color || "#6366f1"} stopOpacity="0.35" />
              <stop offset="100%" stopColor={selectedTrend?.color || "#6366f1"} stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="confidenceBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={selectedTrend?.color || "#6366f1"} stopOpacity="0.18" />
              <stop offset="100%" stopColor={selectedTrend?.color || "#6366f1"} stopOpacity="0.05" />
            </linearGradient>

            <pattern id="forecastGridPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 8 L 8 0 M 0 0 L 8 8" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Background Split: Past vs Forecast */}
          {forecastStartIndex > 0 && (
            <>
              {/* Historical area backdrop */}
              <rect
                x={padding.left}
                y={padding.top}
                width={getX(forecastStartIndex - 1) - padding.left}
                height={innerHeight}
                fill="#0f172a"
                opacity="0.4"
              />
              {/* Forecast area backdrop */}
              <rect
                x={getX(forecastStartIndex - 1)}
                y={padding.top}
                width={padding.left + innerWidth - getX(forecastStartIndex - 1)}
                height={innerHeight}
                fill="url(#forecastGridPattern)"
              />
              {/* Vertical demarcation line */}
              <line
                x1={getX(forecastStartIndex - 1)}
                y1={padding.top}
                x2={getX(forecastStartIndex - 1)}
                y2={padding.top + innerHeight}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {/* Label for Today / Live Divider */}
              <text
                x={getX(forecastStartIndex - 1)}
                y={padding.top - 12}
                textAnchor="middle"
                fill="#a5b4fc"
                fontSize="10"
                fontWeight="bold"
                letterSpacing="0.5"
              >
                CANLI SERP ✦ GELECEK TAHMİNİ
              </text>
            </>
          )}

          {/* Horizontal Gridlines & Y-Axis values */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + innerHeight - ratio * innerHeight;
            const val = Math.round(ratio * maxY);
            const label = metricType === "index" ? `${val}` : `${(val / 1000).toFixed(val >= 1000 ? 1 : 0)}K`;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Single Mode: Confidence Band */}
          {chartMode === "single" && confidenceAreaPath && (
            <path
              d={confidenceAreaPath}
              fill="url(#confidenceBandGradient)"
              stroke={selectedTrend?.color || "#6366f1"}
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          )}

          {/* Single Mode: Gradient Fill under historical curve */}
          {chartMode === "single" && historicalAreaPath && (
            <path d={historicalAreaPath} fill="url(#selectedAreaGradient)" />
          )}

          {/* Multi-mode: Render all 5 trends lines */}
          {chartMode === "multi" &&
            trends.map((t) => {
              const isHovered = hoveredTrendId === t.id;
              const isSelected = selectedTrendId === t.id;
              const pts = t.timeline.map((p, i) => ({
                x: getX(i),
                y: getY(metricType === "index" ? p.volumeIndex : p.rawSearchVolume || p.volumeIndex * 150)
              }));
              const histPts = pts.slice(0, forecastStartIndex);
              const forePts = pts.slice(Math.max(0, forecastStartIndex - 1));

              return (
                <g
                  key={t.id}
                  className="cursor-pointer transition-all"
                  onClick={() => onSelectTrend(t.id)}
                  onMouseEnter={() => setHoveredTrendId(t.id)}
                  onMouseLeave={() => setHoveredTrendId(null)}
                >
                  {/* Historical Solid Line */}
                  <path
                    d={generateSmoothPath(histPts)}
                    fill="none"
                    stroke={t.color}
                    strokeWidth={isSelected || isHovered ? 3.5 : 2}
                    opacity={isSelected || isHovered ? 1 : 0.45}
                  />
                  {/* Forecast Dashed Line */}
                  <path
                    d={generateSmoothPath(forePts)}
                    fill="none"
                    stroke={t.color}
                    strokeWidth={isSelected || isHovered ? 3 : 1.8}
                    strokeDasharray="5 4"
                    opacity={isSelected || isHovered ? 0.9 : 0.35}
                  />
                  {/* End of line circle */}
                  {forePts.length > 0 && (
                    <circle
                      cx={forePts[forePts.length - 1].x}
                      cy={forePts[forePts.length - 1].y}
                      r={isSelected || isHovered ? 5 : 3.5}
                      fill={t.color}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

          {/* Single Mode: Primary Trend Curve (Historical Solid + Forecast Dashed) */}
          {chartMode === "single" && selectedTrend && (
            <g>
              {/* Historical Solid line */}
              <path
                d={generateSmoothPath(selectedHistoricalPts)}
                fill="none"
                stroke={selectedTrend.color}
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Forecast Dashed line */}
              <path
                d={generateSmoothPath(selectedForecastPts)}
                fill="none"
                stroke={selectedTrend.color}
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Data points */}
              {selectedTrend.timeline.map((p, i) => {
                const x = getX(i);
                const val = metricType === "index" ? p.volumeIndex : p.rawSearchVolume || p.volumeIndex * 150;
                const y = getY(val);
                const isHovered = hoveredPointIndex === i;

                return (
                  <g key={i}>
                    {/* Event Marker Callout Pin */}
                    {p.eventMarker && (
                      <g className="cursor-pointer">
                        <line
                          x1={x}
                          y1={y}
                          x2={x}
                          y2={padding.top + 8}
                          stroke="#a5b4fc"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                        <rect
                          x={x - 48}
                          y={padding.top - 2}
                          width="96"
                          height="18"
                          rx="4"
                          fill="#1e1b4b"
                          stroke="#6366f1"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={padding.top + 10}
                          textAnchor="middle"
                          fill="#e0e7ff"
                          fontSize="8.5"
                          fontWeight="bold"
                        >
                          {p.eventMarker.length > 18 ? p.eventMarker.slice(0, 16) + "..." : p.eventMarker}
                        </text>
                      </g>
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : p.isForecast ? 4.5 : 5}
                      fill={p.isForecast ? "#0f172a" : selectedTrend.color}
                      stroke={selectedTrend.color}
                      strokeWidth={p.isForecast ? "2.5" : "2"}
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />

                    {/* Today badge on index forecastStartIndex - 1 */}
                    {i === forecastStartIndex - 1 && (
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* X Axis Month Labels */}
          {timelinePoints.map((p, i) => {
            const x = getX(i);
            const isForecast = p.isForecast;
            const isHovered = hoveredPointIndex === i;
            return (
              <g key={i} onMouseEnter={() => setHoveredPointIndex(i)} onMouseLeave={() => setHoveredPointIndex(null)}>
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  fill={isHovered ? "#ffffff" : isForecast ? "#818cf8" : "#94a3b8"}
                  fontSize={isHovered ? "11" : "10"}
                  fontWeight={isForecast || isHovered ? "bold" : "normal"}
                  className="cursor-pointer transition-colors"
                >
                  {p.month}
                </text>
                {/* Forecast indicator dot under future months */}
                {isForecast && (
                  <circle cx={x} cy={height - 24} r="1.5" fill="#818cf8" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPointIndex !== null && selectedTrend && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 border border-indigo-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs text-white"
            style={{
              left: `${Math.min(75, Math.max(10, (hoveredPointIndex / (pointCount - 1)) * 100))}%`,
              top: "15%",
              transform: "translateX(-50%)"
            }}
          >
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedTrend.color }}
              />
              <span className="font-black text-slate-200">
                {timelinePoints[hoveredPointIndex]?.month}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  timelinePoints[hoveredPointIndex]?.isForecast
                    ? "bg-indigo-900/80 text-indigo-300 border border-indigo-700/50"
                    : "bg-emerald-900/80 text-emerald-300 border border-emerald-700/50"
                }`}
              >
                {timelinePoints[hoveredPointIndex]?.isForecast ? "AI Projeksiyon" : "Canlı SERP Verisi"}
              </span>
            </div>

            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">İlgi İndeksi:</span>
                <span className="font-black text-indigo-400">
                  {timelinePoints[hoveredPointIndex]?.volumeIndex} / 100
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Tahmini Arama:</span>
                <span className="font-bold text-emerald-400">
                  ~{(timelinePoints[hoveredPointIndex]?.rawSearchVolume || timelinePoints[hoveredPointIndex]?.volumeIndex * 150).toLocaleString("tr-TR")} sorgu/ay
                </span>
              </div>
              {timelinePoints[hoveredPointIndex]?.confidenceUpper && (
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                  <span>Güven Aralığı (%95):</span>
                  <span className="font-mono text-slate-300">
                    {timelinePoints[hoveredPointIndex]?.confidenceLower} - {timelinePoints[hoveredPointIndex]?.confidenceUpper}
                  </span>
                </div>
              )}
              {timelinePoints[hoveredPointIndex]?.eventMarker && (
                <div className="pt-1 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{timelinePoints[hoveredPointIndex]?.eventMarker}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Trend Selector Tabs / Legend below chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-4 border-t border-slate-800">
        {trends.map((t) => {
          const isSelected = t.id === selectedTrendId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTrend(t.id)}
              className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-400/40"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: t.color }}
              />
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  #{t.rank} Trend
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/40">
                  {t.growthLabel}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 line-clamp-1 mt-1 pl-1" title={t.trendTitle}>
                {t.trendTitle}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pl-1 mt-1.5">
                <span className="font-mono text-indigo-300">{t.projectedMonthlyVolume}</span>
                <span className="font-medium text-[9px] text-slate-400">Skor: {t.opportunityScore}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
