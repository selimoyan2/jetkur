import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { 
  Gauge, 
  Sparkles, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Server, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Info 
} from "lucide-react";

export interface LighthouseScoreData {
  id: string;
  name: string;
  score: number;
  description: string;
  auditsPassed: number;
  totalAudits: number;
  color: string;
}

export interface SpeedBenchmarkData {
  label: string;
  category: string;
  timeMs: number;
  color: string;
  isUserSite?: boolean;
  notes: string;
}

export interface CloudflarePopLatency {
  code: string;
  city: string;
  country: string;
  latencyMs: number;
  status: "optimal" | "good";
}

export interface SiteHealthD3Data {
  lighthouse: LighthouseScoreData[];
  benchmarks: SpeedBenchmarkData[];
  cacheStats: {
    hitRatio: number;
    hitsCount: number;
    revalidatedCount: number;
    bypassCount: number;
    bandwidthSavedMb: number;
  };
  pops: CloudflarePopLatency[];
  cwv: {
    ttfb: { value: string; status: "good" | "needs-improvement"; label: string; threshold: string };
    fcp: { value: string; status: "good" | "needs-improvement"; label: string; threshold: string };
    lcp: { value: string; status: "good" | "needs-improvement"; label: string; threshold: string };
    fid: { value: string; status: "good" | "needs-improvement"; label: string; threshold: string };
    cls: { value: string; status: "good" | "needs-improvement"; label: string; threshold: string };
  };
}

interface SiteHealthPerformanceD3ChartProps {
  data: SiteHealthD3Data;
  activeTab?: "all" | "lighthouse" | "speed" | "cloudflare";
  onSelectCategory?: (category: string) => void;
}

export const SiteHealthPerformanceD3Chart: React.FC<SiteHealthPerformanceD3ChartProps> = ({
  data,
  activeTab = "all",
  onSelectCategory
}) => {
  const lighthouseRef = useRef<SVGSVGElement | null>(null);
  const benchmarkRef = useRef<SVGSVGElement | null>(null);
  const cacheDonutRef = useRef<SVGSVGElement | null>(null);
  const popLatencyRef = useRef<SVGSVGElement | null>(null);

  const [hoveredScore, setHoveredScore] = useState<LighthouseScoreData | null>(null);
  const [hoveredBenchmark, setHoveredBenchmark] = useState<SpeedBenchmarkData | null>(null);
  const [hoveredPop, setHoveredPop] = useState<CloudflarePopLatency | null>(null);

  // 1. D3 LIGHTHOUSE CIRCULAR GAUGES
  useEffect(() => {
    if (!lighthouseRef.current) return;

    const svg = d3.select(lighthouseRef.current);
    svg.selectAll("*").remove();

    const width = 640;
    const height = 150;
    const gaugeRadius = 46;
    const innerRadius = 37;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("class", "w-full h-auto");

    const scores = data.lighthouse;
    const stepX = width / scores.length;

    scores.forEach((item, i) => {
      const centerX = stepX * i + stepX / 2;
      const centerY = 65;

      const g = svg
        .append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("class", "cursor-pointer group")
        .on("mouseenter", () => setHoveredScore(item))
        .on("mouseleave", () => setHoveredScore(null))
        .on("click", () => onSelectCategory?.(item.id));

      // Background Circle Track
      const arcBg = d3
        .arc<any>()
        .innerRadius(innerRadius)
        .outerRadius(gaugeRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI);

      g.append("path")
        .attr("d", arcBg as any)
        .attr("fill", "#f1f5f9");

      // Score Value Arc
      const targetAngle = (item.score / 100) * 2 * Math.PI;

      const arcScore = d3
        .arc<any>()
        .innerRadius(innerRadius)
        .outerRadius(gaugeRadius)
        .startAngle(0)
        .cornerRadius(4);

      // Gradient definition for gauge
      const defs = svg.append("defs");
      const gradientId = `gauge-grad-${item.id}`;
      const grad = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      if (item.score >= 90) {
        grad.append("stop").attr("offset", "0%").attr("stop-color", "#10b981");
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#059669");
      } else if (item.score >= 50) {
        grad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b");
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#d97706");
      } else {
        grad.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#dc2626");
      }

      // Animated arc
      const path = g
        .append("path")
        .datum({ endAngle: 0 })
        .attr("fill", `url(#${gradientId})`);

      path
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attrTween("d", function () {
          const interpolate = d3.interpolate(0, targetAngle);
          return function (t: number) {
            return arcScore({ endAngle: interpolate(t) }) || "";
          };
        });

      // Center Score Text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("class", "font-mono font-black select-none")
        .attr("fill", item.score >= 90 ? "#065f46" : item.score >= 50 ? "#92400e" : "#991b1b")
        .attr("font-size", "21px")
        .text(item.score);

      // Label below Gauge
      g.append("text")
        .attr("y", gaugeRadius + 18)
        .attr("text-anchor", "middle")
        .attr("class", "text-[12px] font-bold select-none fill-slate-700")
        .text(item.name);

      // Sub-label (Audits Passed)
      g.append("text")
        .attr("y", gaugeRadius + 32)
        .attr("text-anchor", "middle")
        .attr("class", "text-[10px] font-mono select-none fill-emerald-600 font-semibold")
        .text(`${item.auditsPassed}/${item.totalAudits} Geçti`);
    });
  }, [data.lighthouse, onSelectCategory]);

  // 2. D3 LOAD SPEED BENCHMARK BARS
  useEffect(() => {
    if (!benchmarkRef.current) return;

    const svg = d3.select(benchmarkRef.current);
    svg.selectAll("*").remove();

    const width = 560;
    const barHeight = 28;
    const gap = 16;
    const margin = { top: 20, right: 90, bottom: 25, left: 160 };
    const innerWidth = width - margin.left - margin.right;
    const height = data.benchmarks.length * (barHeight + gap) + margin.top + margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("class", "w-full h-auto");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const maxMs = d3.max(data.benchmarks, (d: SpeedBenchmarkData) => d.timeMs) ?? 4000;
    const xScale = d3.scaleLinear().domain([0, Number(maxMs) * 1.05]).range([0, innerWidth]);

    // Grid lines
    const ticks = xScale.ticks(5);
    ticks.forEach((tick) => {
      g.append("line")
        .attr("x1", xScale(tick))
        .attr("x2", xScale(tick))
        .attr("y1", 0)
        .attr("y2", data.benchmarks.length * (barHeight + gap) - gap)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-dasharray", "3,3");

      g.append("text")
        .attr("x", xScale(tick))
        .attr("y", data.benchmarks.length * (barHeight + gap) + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#94a3b8")
        .attr("font-family", "monospace")
        .text(`${tick >= 1000 ? (tick / 1000).toFixed(1) + "s" : tick + "ms"}`);
    });

    // Bars
    data.benchmarks.forEach((item, i) => {
      const y = i * (barHeight + gap);
      const barWidth = Math.max(xScale(item.timeMs), 6);

      const rowG = g
        .append("g")
        .attr("class", "cursor-pointer group")
        .on("mouseenter", () => setHoveredBenchmark(item))
        .on("mouseleave", () => setHoveredBenchmark(null));

      // Label on the left
      rowG
        .append("text")
        .attr("x", -12)
        .attr("y", y + barHeight / 2)
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "end")
        .attr("font-size", item.isUserSite ? "12px" : "11px")
        .attr("font-weight", item.isUserSite ? "800" : "500")
        .attr("fill", item.isUserSite ? "#0f172a" : "#475569")
        .text(item.label);

      // Background slot
      rowG
        .append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", item.isUserSite ? "#ecfdf5" : "#f8fafc");

      // Active fill bar
      const barRect = rowG
        .append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", item.color);

      barRect
        .transition()
        .duration(800)
        .delay(i * 120)
        .ease(d3.easeCubicOut)
        .attr("width", barWidth);

      // Value text on the right
      rowG
        .append("text")
        .attr("x", barWidth + 10)
        .attr("y", y + barHeight / 2)
        .attr("dominant-baseline", "central")
        .attr("font-size", "11px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("fill", item.isUserSite ? "#059669" : "#334155")
        .text(item.timeMs >= 1000 ? `${(item.timeMs / 1000).toFixed(2)}s` : `${item.timeMs}ms`);

      // Special badge for user site
      if (item.isUserSite) {
        rowG
          .append("rect")
          .attr("x", -150)
          .attr("y", y + 4)
          .attr("width", 16)
          .attr("height", 16)
          .attr("rx", 8)
          .attr("fill", "#10b981");

        rowG
          .append("text")
          .attr("x", -142)
          .attr("y", y + 13)
          .attr("dominant-baseline", "central")
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#ffffff")
          .text("★");
      }
    });
  }, [data.benchmarks]);

  // 3. D3 CLOUDFLARE EDGE CACHING DONUT CHART
  useEffect(() => {
    if (!cacheDonutRef.current) return;

    const svg = d3.select(cacheDonutRef.current);
    svg.selectAll("*").remove();

    const width = 240;
    const height = 240;
    const radius = Math.min(width, height) / 2;
    const donutHole = radius * 0.68;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("class", "w-full h-auto");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const cacheSlices = [
      { label: "Edge Cache HIT", count: data.cacheStats.hitsCount, color: "#10b981" },
      { label: "Revalidated", count: data.cacheStats.revalidatedCount, color: "#f59e0b" },
      { label: "Origin Bypass", count: data.cacheStats.bypassCount, color: "#64748b" }
    ];

    const pie = d3
      .pie<any>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.04);

    const arc = d3
      .arc<any>()
      .innerRadius(donutHole)
      .outerRadius(radius - 8)
      .cornerRadius(6);

    const slices = g
      .selectAll(".cache-slice")
      .data(pie(cacheSlices))
      .enter()
      .append("path")
      .attr("class", "cache-slice transition-transform cursor-pointer")
      .attr("fill", (d) => d.data.color)
      .attr("d", arc as any);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("class", "font-mono font-black text-2xl fill-emerald-800 select-none")
      .text(`%${data.cacheStats.hitRatio.toFixed(1)}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.4em")
      .attr("class", "text-[11px] font-bold fill-slate-500 select-none uppercase tracking-wider")
      .text("Edge Cache HIT");
  }, [data.cacheStats]);

  // 4. D3 GLOBAL POP LATENCY BARS
  useEffect(() => {
    if (!popLatencyRef.current) return;

    const svg = d3.select(popLatencyRef.current);
    svg.selectAll("*").remove();

    const width = 360;
    const height = 230;
    const margin = { top: 15, right: 45, bottom: 25, left: 95 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("class", "w-full h-auto");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(data.pops.map((p) => p.code))
      .range([0, innerHeight])
      .padding(0.28);

    const maxMs = d3.max(data.pops, (p: CloudflarePopLatency) => p.latencyMs) ?? 120;
    const xScale = d3.scaleLinear().domain([0, Number(maxMs) * 1.1]).range([0, innerWidth]);

    data.pops.forEach((pop) => {
      const y = yScale(pop.code) || 0;
      const barWidth = xScale(pop.latencyMs);

      const rowG = g
        .append("g")
        .attr("class", "cursor-pointer group")
        .on("mouseenter", () => setHoveredPop(pop))
        .on("mouseleave", () => setHoveredPop(null));

      // City label
      rowG
        .append("text")
        .attr("x", -8)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "end")
        .attr("font-size", "10.5px")
        .attr("font-weight", "600")
        .attr("fill", "#334155")
        .text(`${pop.city} (${pop.code})`);

      // Bar
      rowG
        .append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", barWidth)
        .attr("height", yScale.bandwidth())
        .attr("rx", 4)
        .attr("fill", pop.latencyMs < 30 ? "#10b981" : pop.latencyMs < 60 ? "#0284c7" : "#f59e0b");

      // Latency value
      rowG
        .append("text")
        .attr("x", barWidth + 6)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("dominant-baseline", "central")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("fill", "#475569")
        .text(`${pop.latencyMs}ms`);
    });
  }, [data.pops]);

  return (
    <div className="space-y-6">
      {/* 1. GOOGLE LIGHTHOUSE 4 RADIAL GAUGES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Google Lighthouse 4 Ana Skor Denetimi</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  v11.4 Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Google botları tarafından taranan performans, erişilebilirlik, en iyi pratikler ve SEO kriterleri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              90-100: İyi
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              50-89: Orta
            </span>
          </div>
        </div>

        {/* D3 SVG Canvas */}
        <div className="mt-4 pt-2">
          <svg ref={lighthouseRef} id="d3-svg-lighthouse-gauges" />
        </div>

        {/* Hovered Score Details / Tooltip banner */}
        {hoveredScore && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>{hoveredScore.name}:</strong> {hoveredScore.description}
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700">
              {hoveredScore.auditsPassed}/{hoveredScore.totalAudits} denetim başarılı
            </span>
          </div>
        )}
      </div>

      {/* 2. DUAL COLUMN: LOAD SPEED BENCHMARK & CLOUDFLARE EDGE EFFICIENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Load Speed & Core Web Vitals */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sitenin Yüklenme Hızı &amp; Sektörel Karşılaştırma</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                D3.js ile Türkiye ortalaması ve klasik CMS sistemlerine kıyasla gecikme süresi.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-black">
              0.02 saniye
            </span>
          </div>

          {/* D3 Benchmark Bar Chart */}
          <div className="pt-2">
            <svg ref={benchmarkRef} id="d3-svg-speed-benchmarks" />
          </div>

          {/* Core Web Vitals Mini Grid */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">
              Google Core Web Vitals Metrikleri:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">TTFB (İlk Bayt)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{data.cwv.ttfb.value}</span>
                <span className="text-[9px] text-slate-500 block">&lt;800ms Hedef</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">FCP (İlk Çizim)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{data.cwv.fcp.value}</span>
                <span className="text-[9px] text-slate-500 block">&lt;1.8s Hedef</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">LCP (İçerik)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{data.cwv.lcp.value}</span>
                <span className="text-[9px] text-slate-500 block">&lt;2.5s Hedef</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">FID (Giriş)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{data.cwv.fid.value}</span>
                <span className="text-[9px] text-slate-500 block">&lt;100ms Hedef</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">CLS (Kayma)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{data.cwv.cls.value}</span>
                <span className="text-[9px] text-slate-500 block">&lt;0.1 Hedef</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Cloudflare Edge Caching Efficiency */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Cloudflare Edge Önbellekleme</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                310+ Global Edge POP noktası verimliliği.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
              Anycast CDN
            </span>
          </div>

          {/* D3 Donut & POP Latencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut Chart */}
            <div className="flex flex-col items-center">
              <svg ref={cacheDonutRef} id="d3-svg-cache-donut" />
              <div className="flex items-center gap-3 text-[11px] mt-2 font-medium">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  HIT: %99.8
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Bypass: %0.2
                </span>
              </div>
            </div>

            {/* POP Latency Bars */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                Global POP Yanıt Süreleri:
              </span>
              <svg ref={popLatencyRef} id="d3-svg-pop-latencies" />
            </div>
          </div>

          {/* Efficiency Summary metrics */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Tasarruf Edilen Trafik</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {(data.cacheStats.bandwidthSavedMb / 1024).toFixed(2)} GB / ay
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Edge Sıkıştırma (Brotli)</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                %88 Boyut Azaltma
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
