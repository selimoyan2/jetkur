import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Box,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Download,
  Sliders,
  Layers,
  Sparkles,
  Target,
  Trophy,
  Activity,
  Info,
  TrendingUp,
  Compass,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { KeywordGoalItem, calculateGoalProgress } from "./GoalTrackingModule";

export interface AxisMetricConfig {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  category: "Hacim & SERP" | "Teknik" | "İçerik" | "Hedef & Pozisyon";
  extractValue: (
    kw: CompetitorKeywordRanking,
    comp?: CompetitorContentMetric,
    goal?: KeywordGoalItem
  ) => number;
  formatDisplay: (val: number) => string;
}

export interface Competitor3DScatterPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  goals?: Record<string, KeywordGoalItem>;
  userName?: string;
  userDomain?: string;
  onNotification?: (msg: string) => void;
}

export interface ProjectedPoint3D {
  id: string;
  name: string;
  entityType: "user" | "comp1" | "comp2" | "comp3" | "keyword";
  entityLabel: string;
  domain: string;
  color: string;
  // Normalized 0..100
  xNorm: number;
  yNorm: number;
  zNorm: number;
  // Raw values
  xRaw: number;
  yRaw: number;
  zRaw: number;
  sizeRaw: number;
  // Screen projected
  screenX: number;
  screenY: number;
  depth: number;
  radius: number;
  // Market quadrant
  quadrant: "leader" | "challenger" | "niche" | "opportunity";
  quadrantLabel: string;
  insight: string;
}

export const Competitor3DScatterPlotModal: React.FC<Competitor3DScatterPlotModalProps> = ({
  isOpen,
  onClose,
  rankings,
  competitors,
  goals = {},
  userName = "Siteniz",
  userDomain = "jetkur.com.tr",
  onNotification
}) => {
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Camera State
  const [yaw, setYaw] = useState<number>(45); // horizontal rotation (degrees)
  const [pitch, setPitch] = useState<number>(25); // vertical tilt (degrees)
  const [zoom, setZoom] = useState<number>(1.0); // zoom multiplier
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Mouse drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Axis metric definitions
  const axisMetrics: AxisMetricConfig[] = useMemo(() => [
    {
      id: "volume",
      name: "Aylık Arama Hacmi",
      shortName: "Arama Hacmi",
      unit: "Arama/Ay",
      category: "Hacim & SERP",
      extractValue: (kw) => {
        if (typeof kw.monthlyVolume === "number") return kw.monthlyVolume;
        return parseInt(String(kw.monthlyVolume || "").replace(/[^0-9]/g, ""), 10) || 1200;
      },
      formatDisplay: (val) => `${Math.round(val).toLocaleString("tr-TR")} /ay`
    },
    {
      id: "visibility",
      name: "Görünürlük Skoru (SERP Payı)",
      shortName: "Görünürlük",
      unit: "%",
      category: "Hacim & SERP",
      extractValue: (kw, comp) => {
        const base = comp?.visibilityScore || 65;
        const rankBoost = kw.userRank ? Math.max(0, 21 - kw.userRank) * 4 : 10;
        return Math.min(100, Math.round((base * 0.4) + (rankBoost * 0.6)));
      },
      formatDisplay: (val) => `%${Math.round(val)}`
    },
    {
      id: "goal_attainment",
      name: "Hedefe Ulaşma Oranı (%)",
      shortName: "Hedef Başarısı",
      unit: "%",
      category: "Hedef & Pozisyon",
      extractValue: (kw, _comp, goal) => {
        const targetRank = goal?.targetRank || (kw.userRank && kw.userRank <= 3 ? 1 : 3);
        const bestComp = kw.comp1Rank || 1;
        const progress = calculateGoalProgress(kw.userRank, targetRank, bestComp);
        return Math.min(100, Math.max(0, progress.attainmentPercent));
      },
      formatDisplay: (val) => `%${Math.round(val)}`
    },
    {
      id: "speed_score",
      name: "Sayfa Hızı & Core Web Vitals Skoru",
      shortName: "Sayfa Hızı",
      unit: "/100 Puan",
      category: "Teknik",
      extractValue: (kw, comp) => {
        const base = comp?.speedScore || 74;
        const offset = (kw.userRank === 1 ? 15 : -5) + ((100 - (kw.difficulty || 50)) * 0.15);
        return Math.min(100, Math.max(20, Math.round(base + offset)));
      },
      formatDisplay: (val) => `${Math.round(val)}/100`
    },
    {
      id: "word_count",
      name: "İçerik Kelime Hacmi",
      shortName: "Kelime Hacmi",
      unit: "Kelime",
      category: "İçerik",
      extractValue: (kw, comp) => {
        const avg = comp?.avgWordCount || 1850;
        return Math.round(avg + ((kw.difficulty || 50) * 10));
      },
      formatDisplay: (val) => `${Math.round(val).toLocaleString("tr-TR")} kelime`
    },
    {
      id: "difficulty",
      name: "Sıralama Zorluğu (KD %)",
      shortName: "Zorluk (KD%)",
      unit: "%",
      category: "Hacim & SERP",
      extractValue: (kw) => kw.difficulty || 45,
      formatDisplay: (val) => `%${Math.round(val)}`
    },
    {
      id: "rank_score",
      name: "SERP Pozisyon Skoru (1. Sıra = 100)",
      shortName: "SERP Pozisyonu",
      unit: "Puan",
      category: "Hedef & Pozisyon",
      extractValue: (kw) => {
        if (!kw.userRank) return 5;
        return Math.max(5, Math.round((21 - kw.userRank) * 4.76));
      },
      formatDisplay: (val) => `${Math.round(val)} Puan`
    },
    {
      id: "gap",
      name: "Rakip Sıralama Farkı (Gap)",
      shortName: "SERP Gap",
      unit: "Sıra",
      category: "Hedef & Pozisyon",
      extractValue: (kw) => Math.abs(kw.gap ?? 0),
      formatDisplay: (val) => `${Math.round(val)} sıra`
    },
    {
      id: "traffic_opp",
      name: "Trafik Fırsatı / Potansiyeli",
      shortName: "Trafik Fırsatı",
      unit: "Tık/Ay",
      category: "Hacim & SERP",
      extractValue: (kw) => {
        if (typeof kw.trafficOpportunity === "number") return kw.trafficOpportunity;
        return parseInt(String(kw.trafficOpportunity || "").replace(/[^0-9]/g, ""), 10) || 500;
      },
      formatDisplay: (val) => `${Math.round(val).toLocaleString("tr-TR")} tık`
    },
    {
      id: "serp_features",
      name: "SERP Zengin Sonuç Çeşitliliği",
      shortName: "SERP Zenginlik",
      unit: "Özellik",
      category: "Hacim & SERP",
      extractValue: (kw) => (kw.serpFeatures && kw.serpFeatures.length) || 1,
      formatDisplay: (val) => `${Math.round(val)} özellik`
    }
  ], []);

  // Selected Axis Metrics
  const [xAxisMetricId, setXAxisMetricId] = useState<string>("volume");
  const [yAxisMetricId, setYAxisMetricId] = useState<string>("goal_attainment");
  const [zAxisMetricId, setZAxisMetricId] = useState<string>("speed_score");
  const [sizeMetricId, setSizeMetricId] = useState<string>("visibility");

  // Visualization Scope Mode:
  // "competitor_market" = Aggregated 3D placement for Siteniz and each competitor (market positioning)
  // "keyword_scatter" = All keyword data points plotted in 3D
  // "hybrid" = Both keyword scatter and competitor centroid spheres
  const [viewScope, setViewScope] = useState<"competitor_market" | "keyword_scatter" | "hybrid">("hybrid");

  // Regression trend surface toggle
  const [showRegressionPlane, setShowRegressionPlane] = useState<boolean>(true);
  // Drop lines toggle
  const [showDropLines, setShowDropLines] = useState<boolean>(true);
  // Grid planes toggle
  const [showGridPlanes, setShowGridPlanes] = useState<boolean>(true);

  // Hovered / Selected point for 3D inspection
  const [hoveredPoint, setHoveredPoint] = useState<ProjectedPoint3D | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ProjectedPoint3D | null>(null);

  // Active metrics objects
  const xMetric = useMemo(() => axisMetrics.find((m) => m.id === xAxisMetricId) || axisMetrics[0], [axisMetrics, xAxisMetricId]);
  const yMetric = useMemo(() => axisMetrics.find((m) => m.id === yAxisMetricId) || axisMetrics[2], [axisMetrics, yAxisMetricId]);
  const zMetric = useMemo(() => axisMetrics.find((m) => m.id === zAxisMetricId) || axisMetrics[3], [axisMetrics, zAxisMetricId]);
  const sizeMetric = useMemo(() => axisMetrics.find((m) => m.id === sizeMetricId) || axisMetrics[1], [axisMetrics, sizeMetricId]);

  // Competitor entities setup
  const comp1 = competitors[0] || { id: "c1", name: "1. Rakip", domain: "rakip1.com", rank: 1, visibilityScore: 68, speedScore: 75, avgWordCount: 1900 };
  const comp2 = competitors[1] || { id: "c2", name: "2. Rakip", domain: "rakip2.com", rank: 2, visibilityScore: 54, speedScore: 65, avgWordCount: 1600 };
  const comp3 = competitors[2] || { id: "c3", name: "3. Rakip", domain: "rakip3.com", rank: 3, visibilityScore: 42, speedScore: 58, avgWordCount: 1400 };

  // Generate 3D Data Points
  const rawPoints = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      entityType: "user" | "comp1" | "comp2" | "comp3" | "keyword";
      entityLabel: string;
      domain: string;
      color: string;
      xRaw: number;
      yRaw: number;
      zRaw: number;
      sizeRaw: number;
      insight: string;
    }> = [];

    // 1. Competitor Market Level Centroids
    if (viewScope === "competitor_market" || viewScope === "hybrid") {
      // User Centroid
      const userRankings = rankings.filter((r) => r.userRank);
      const userXSum = userRankings.reduce((sum, kw) => sum + xMetric.extractValue(kw, undefined, goals[kw.id]), 0);
      const userYSum = userRankings.reduce((sum, kw) => sum + yMetric.extractValue(kw, undefined, goals[kw.id]), 0);
      const userZSum = userRankings.reduce((sum, kw) => sum + zMetric.extractValue(kw, undefined, goals[kw.id]), 0);
      const userSizeSum = userRankings.reduce((sum, kw) => sum + sizeMetric.extractValue(kw, undefined, goals[kw.id]), 0);
      const countU = Math.max(1, userRankings.length);

      list.push({
        id: "centroid-user",
        name: `${userName} (Siteniz)`,
        entityType: "user",
        entityLabel: "Siteniz (Ana Domain)",
        domain: userDomain,
        color: "#6366f1", // Indigo / Cyan vibrant
        xRaw: userXSum / countU,
        yRaw: userYSum / countU,
        zRaw: userZSum / countU,
        sizeRaw: (userSizeSum / countU) * 1.5,
        insight: `${userName}, pazarın en dengeli hedef uyumuna ve güçlü teknik altyapısına sahiptir.`
      });

      // Comp 1 Centroid
      const c1X = userRankings.reduce((sum, kw) => sum + xMetric.extractValue(kw, comp1, goals[kw.id]), 0);
      const c1Y = userRankings.reduce((sum, kw) => sum + (yMetric.extractValue(kw, comp1, goals[kw.id]) * 0.9), 0);
      const c1Z = userRankings.reduce((sum, kw) => sum + zMetric.extractValue(kw, comp1, goals[kw.id]), 0);
      const c1Size = userRankings.reduce((sum, kw) => sum + sizeMetric.extractValue(kw, comp1, goals[kw.id]), 0);

      list.push({
        id: "centroid-comp1",
        name: comp1.name,
        entityType: "comp1",
        entityLabel: `1. Rakip (${comp1.domain})`,
        domain: comp1.domain,
        color: "#f43f5e", // Rose
        xRaw: (c1X / countU) * 1.15,
        yRaw: (c1Y / countU) * 0.92,
        zRaw: (c1Z / countU) * 1.05,
        sizeRaw: (c1Size / countU) * 1.35,
        insight: `${comp1.name}, yüksek SERP hacmiyle pazar liderliği için en kritik doğrudan rakibinizdir.`
      });

      // Comp 2 Centroid
      list.push({
        id: "centroid-comp2",
        name: comp2.name,
        entityType: "comp2",
        entityLabel: `2. Rakip (${comp2.domain})`,
        domain: comp2.domain,
        color: "#0284c7", // Sky blue
        xRaw: (c1X / countU) * 0.85,
        yRaw: (c1Y / countU) * 0.78,
        zRaw: (c1Z / countU) * 0.88,
        sizeRaw: (c1Size / countU) * 1.1,
        insight: `${comp2.name}, orta hacimli niş kelimelerde yüksek görünürlüğe odaklanmaktadır.`
      });

      // Comp 3 Centroid
      list.push({
        id: "centroid-comp3",
        name: comp3.name,
        entityType: "comp3",
        entityLabel: `3. Rakip (${comp3.domain})`,
        domain: comp3.domain,
        color: "#10b981", // Emerald
        xRaw: (c1X / countU) * 0.65,
        yRaw: (c1Y / countU) * 0.65,
        zRaw: (c1Z / countU) * 0.75,
        sizeRaw: (c1Size / countU) * 0.9,
        insight: `${comp3.name}, teknik hız ve sayfa derinliğinde gelişim gösteren agresif bir takipçidir.`
      });
    }

    // 2. Keyword Scatter Points
    if (viewScope === "keyword_scatter" || viewScope === "hybrid") {
      rankings.slice(0, 30).forEach((kw) => {
        const xVal = xMetric.extractValue(kw, undefined, goals[kw.id]);
        const yVal = yMetric.extractValue(kw, undefined, goals[kw.id]);
        const zVal = zMetric.extractValue(kw, undefined, goals[kw.id]);
        const sVal = sizeMetric.extractValue(kw, undefined, goals[kw.id]);

        let kwColor = "#94a3b8"; // slate
        if (kw.status === "leading") kwColor = "#10b981"; // emerald
        else if (kw.status === "striking") kwColor = "#f59e0b"; // amber
        else if (kw.status === "opportunity") kwColor = "#06b6d4"; // cyan
        else if (kw.status === "lagging") kwColor = "#ef4444"; // red

        list.push({
          id: `kw-${kw.id}`,
          name: kw.keyword,
          entityType: "keyword",
          entityLabel: `Anahtar Kelime: "${kw.keyword}"`,
          domain: userDomain,
          color: kwColor,
          xRaw: xVal,
          yRaw: yVal,
          zRaw: zVal,
          sizeRaw: sVal,
          insight: `Sıra: ${kw.userRank || "20+"} | Rakip: ${kw.comp1Rank || "-"} | Hacim: ${kw.monthlyVolume}`
        });
      });
    }

    return list;
  }, [rankings, userName, userDomain, comp1, comp2, comp3, goals, viewScope, xMetric, yMetric, zMetric, sizeMetric]);

  // Normalize Points to 0..100 domain and assign Market Quadrants
  const normalizedPoints = useMemo(() => {
    if (rawPoints.length === 0) return [];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let minSize = Infinity;
    let maxSize = -Infinity;

    rawPoints.forEach((p) => {
      if (p.xRaw < minX) minX = p.xRaw;
      if (p.xRaw > maxX) maxX = p.xRaw;
      if (p.yRaw < minY) minY = p.yRaw;
      if (p.yRaw > maxY) maxY = p.yRaw;
      if (p.zRaw < minZ) minZ = p.zRaw;
      if (p.zRaw > maxZ) maxZ = p.zRaw;
      if (p.sizeRaw < minSize) minSize = p.sizeRaw;
      if (p.sizeRaw > maxSize) maxSize = p.sizeRaw;
    });

    const rangeX = Math.max(1e-5, maxX - minX);
    const rangeY = Math.max(1e-5, maxY - minY);
    const rangeZ = Math.max(1e-5, maxZ - minZ);

    return rawPoints.map((p) => {
      // 0 to 100 with 10% padding
      const xNorm = 10 + ((p.xRaw - minX) / rangeX) * 80;
      const yNorm = 10 + ((p.yRaw - minY) / rangeY) * 80;
      const zNorm = 10 + ((p.zRaw - minZ) / rangeZ) * 80;

      // Classify Market Quadrant based on (X, Y)
      let quadrant: ProjectedPoint3D["quadrant"] = "opportunity";
      let quadrantLabel = "Gelişim / Fırsat Alanı";

      if (xNorm >= 50 && yNorm >= 50) {
        quadrant = "leader";
        quadrantLabel = "Pazar Liderleri (Yüksek Hacim & Başarı)";
      } else if (xNorm < 50 && yNorm >= 50) {
        quadrant = "niche";
        quadrantLabel = "Niş Uzmanlar (Odaklanmış Yüksek Verim)";
      } else if (xNorm >= 50 && yNorm < 50) {
        quadrant = "challenger";
        quadrantLabel = "Agresif Zorlayıcılar (Yüksek Hacim, Orta Başarı)";
      } else {
        quadrant = "opportunity";
        quadrantLabel = "Fırsat & Gelişim Alanı (Potansiyel)";
      }

      return {
        ...p,
        xNorm,
        yNorm,
        zNorm,
        quadrant,
        quadrantLabel
      };
    });
  }, [rawPoints]);

  // Multivariable Pearson Correlation Calculation (X-Y, X-Z, Y-Z)
  const correlationStats = useMemo(() => {
    if (normalizedPoints.length < 2) {
      return { rXY: 0, rXZ: 0, rYZ: 0, overallFit: 0 };
    }

    const n = normalizedPoints.length;
    const calcR = (arrA: number[], arrB: number[]) => {
      const meanA = arrA.reduce((a, b) => a + b, 0) / n;
      const meanB = arrB.reduce((a, b) => a + b, 0) / n;
      let num = 0;
      let dA = 0;
      let dB = 0;
      for (let i = 0; i < n; i++) {
        const diffA = arrA[i] - meanA;
        const diffB = arrB[i] - meanB;
        num += diffA * diffB;
        dA += diffA * diffA;
        dB += diffB * diffB;
      }
      const denom = Math.sqrt(dA * dB);
      if (denom === 0) return 0;
      return Math.round((num / denom) * 100) / 100;
    };

    const xVals = normalizedPoints.map((p) => p.xRaw);
    const yVals = normalizedPoints.map((p) => p.yRaw);
    const zVals = normalizedPoints.map((p) => p.zRaw);

    const rXY = calcR(xVals, yVals);
    const rXZ = calcR(xVals, zVals);
    const rYZ = calcR(yVals, zVals);

    const overallFit = Math.round(((Math.abs(rXY) + Math.abs(rXZ) + Math.abs(rYZ)) / 3) * 100);

    return { rXY, rXZ, rYZ, overallFit };
  }, [normalizedPoints]);

  // 3D Projection Engine & Canvas Rendering
  const render3DScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI retina screens
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Camera Math
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosYaw = Math.cos(radYaw);
    const sinYaw = Math.sin(radYaw);
    const cosPitch = Math.cos(radPitch);
    const sinPitch = Math.sin(radPitch);

    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const baseScale = Math.min(width, height) * 0.0035 * zoom;

    // 3D Point to 2D Screen Projector function
    // Coordinates: X: -50..+50 (left..right), Y: -50..+50 (bottom..top), Z: -50..+50 (front..back)
    const project = (x3d: number, y3d: number, z3d: number) => {
      // 1. Rotate around Y (Yaw)
      const x1 = x3d * cosYaw - z3d * sinYaw;
      const z1 = x3d * sinYaw + z3d * cosYaw;

      // 2. Rotate around X (Pitch)
      const y2 = y3d * cosPitch - z1 * sinPitch;
      const z2 = y3d * sinPitch + z1 * cosPitch;

      // 3. Perspective depth factor
      const fov = 400;
      const depthDistance = fov + z2;
      const perspective = fov / Math.max(50, depthDistance);

      const screenX = centerX + x1 * baseScale * perspective;
      // Invert Y so positive Y is up
      const screenY = centerY - y2 * baseScale * perspective;

      return { screenX, screenY, depth: z2, perspective };
    };

    // Draw 3D Grid Planes & Bounding Box
    if (showGridPlanes) {
      // Floor Grid (Y = -50)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.18)";
      ctx.lineWidth = 1;
      for (let i = -50; i <= 50; i += 25) {
        // lines along Z
        const p1 = project(i, -50, -50);
        const p2 = project(i, -50, 50);
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();

        // lines along X
        const p3 = project(-50, -50, i);
        const p4 = project(50, -50, i);
        ctx.beginPath();
        ctx.moveTo(p3.screenX, p3.screenY);
        ctx.lineTo(p4.screenX, p4.screenY);
        ctx.stroke();
      }

      // Back wall grid (Z = 50)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      for (let i = -50; i <= 50; i += 25) {
        const p1 = project(i, -50, 50);
        const p2 = project(i, 50, 50);
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();

        const p3 = project(-50, i, 50);
        const p4 = project(50, i, 50);
        ctx.beginPath();
        ctx.moveTo(p3.screenX, p3.screenY);
        ctx.lineTo(p4.screenX, p4.screenY);
        ctx.stroke();
      }
    }

    // Draw 3D Coordinate Axes (X: Cyan, Y: Emerald, Z: Purple)
    const origin = project(-50, -50, -50);
    const xEnd = project(50, -50, -50);
    const yEnd = project(-50, 50, -50);
    const zEnd = project(-50, -50, 50);

    // X-Axis
    ctx.strokeStyle = "#38bdf8"; // cyan
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(xEnd.screenX, xEnd.screenY);
    ctx.stroke();

    // Y-Axis
    ctx.strokeStyle = "#34d399"; // emerald
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(yEnd.screenX, yEnd.screenY);
    ctx.stroke();

    // Z-Axis
    ctx.strokeStyle = "#a78bfa"; // violet
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(zEnd.screenX, zEnd.screenY);
    ctx.stroke();

    // Axis Labels in 3D Space
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`X: ${xMetric.shortName}`, xEnd.screenX + 8, xEnd.screenY);

    ctx.fillStyle = "#34d399";
    ctx.fillText(`Y: ${yMetric.shortName}`, yEnd.screenX, yEnd.screenY - 8);

    ctx.fillStyle = "#a78bfa";
    ctx.fillText(`Z: ${zMetric.shortName}`, zEnd.screenX + 8, zEnd.screenY + 12);

    // Draw 3D Regression Surface / Plane if enabled
    if (showRegressionPlane && normalizedPoints.length >= 3) {
      // 4 corners of regression plane
      const c1 = project(-40, -40 + (correlationStats.rXY * 20), -40);
      const c2 = project(40, -40 + (correlationStats.rXY * 60), -40);
      const c3 = project(40, -40 + (correlationStats.rXY * 60) + (correlationStats.rYZ * 20), 40);
      const c4 = project(-40, -40 + (correlationStats.rXY * 20) + (correlationStats.rYZ * 20), 40);

      ctx.fillStyle = "rgba(99, 102, 241, 0.12)";
      ctx.strokeStyle = "rgba(99, 102, 241, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c1.screenX, c1.screenY);
      ctx.lineTo(c2.screenX, c2.screenY);
      ctx.lineTo(c3.screenX, c3.screenY);
      ctx.lineTo(c4.screenX, c4.screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Project all data points and sort by depth (back to front rendering)
    const projected: ProjectedPoint3D[] = normalizedPoints.map((p) => {
      // Map 0..100 to -50..+50 3D box
      const x3d = p.xNorm - 50;
      const y3d = p.yNorm - 50;
      const z3d = p.zNorm - 50;

      const proj = project(x3d, y3d, z3d);

      // Base radius scaled by sizeRaw and perspective
      let baseR = p.entityType === "user" ? 14 : p.entityType.startsWith("comp") ? 11 : 6;
      if (sizeMetricId !== "none") {
        baseR += Math.min(10, Math.max(1, (p.sizeRaw / 100) * 8));
      }
      const radius = Math.max(4, Math.round(baseR * proj.perspective));

      return {
        ...p,
        screenX: proj.screenX,
        screenY: proj.screenY,
        depth: proj.depth,
        radius
      };
    });

    // Sort by depth (farthest first)
    projected.sort((a, b) => a.depth - b.depth);

    // Draw drop lines from each point down to floor grid (Y = -50)
    if (showDropLines) {
      projected.forEach((p) => {
        const x3d = p.xNorm - 50;
        const z3d = p.zNorm - 50;
        const floorProj = project(x3d, -50, z3d);

        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.screenX, p.screenY);
        ctx.lineTo(floorProj.screenX, floorProj.screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shadow circle on floor
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(floorProj.screenX, floorProj.screenY, p.radius * 0.8, p.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Render 3D Spheres / Points
    projected.forEach((p) => {
      const isHovered = hoveredPoint?.id === p.id;
      const isSelected = selectedPoint?.id === p.id;

      // Glow effect for User domain and hovered items
      if (p.entityType === "user" || isHovered || isSelected) {
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isHovered || isSelected ? 22 : 14;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, p.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fill();
        ctx.restore();
      }

      // Orbital pulsing ring for User Domain
      if (p.entityType === "user") {
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, p.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D Sphere Shading Gradient
      const grad = ctx.createRadialGradient(
        p.screenX - p.radius * 0.3,
        p.screenY - p.radius * 0.3,
        p.radius * 0.1,
        p.screenX,
        p.screenY,
        p.radius
      );
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.35, p.color);
      grad.addColorStop(1, "#0f172a");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.screenX, p.screenY, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = isHovered || isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = isHovered || isSelected ? 2 : 1;
      ctx.stroke();

      // Point Label for Competitors and User Domain
      if (p.entityType !== "keyword" || isHovered || isSelected) {
        ctx.font = isHovered || isSelected ? "bold 12px sans-serif" : "bold 10px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(p.name, p.screenX + p.radius + 6, p.screenY + 3);
      }
    });
  }, [
    yaw,
    pitch,
    zoom,
    normalizedPoints,
    showGridPlanes,
    showDropLines,
    showRegressionPlane,
    hoveredPoint,
    selectedPoint,
    xMetric,
    yMetric,
    zMetric,
    sizeMetricId,
    correlationStats
  ]);

  // Request Animation Frame loop for smooth rotation & continuous rendering
  useEffect(() => {
    let animId: number;
    const renderLoop = () => {
      if (isAutoRotating) {
        setYaw((prev) => (prev + 0.35) % 360);
      }
      render3DScene();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating, render3DScene]);

  // Mouse drag handler for 3D orbital camera
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setYaw((prev) => (prev + deltaX * 0.6) % 360);
      setPitch((prev) => Math.max(-80, Math.min(80, prev + deltaY * 0.6)));
      return;
    }

    // Hover detection: find nearest point within threshold
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Recalculate projected screen positions
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosYaw = Math.cos(radYaw);
    const sinYaw = Math.sin(radYaw);
    const cosPitch = Math.cos(radPitch);
    const sinPitch = Math.sin(radPitch);
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2 + 10;
    const baseScale = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.0035 * zoom;

    let closest: ProjectedPoint3D | null = null;
    let minDistance = 25; // 25px tolerance

    normalizedPoints.forEach((p) => {
      const x3d = p.xNorm - 50;
      const y3d = p.yNorm - 50;
      const z3d = p.zNorm - 50;

      const x1 = x3d * cosYaw - z3d * sinYaw;
      const z1 = x3d * sinYaw + z3d * cosYaw;
      const y2 = y3d * cosPitch - z1 * sinPitch;
      const z2 = y3d * sinPitch + z1 * cosPitch;

      const fov = 400;
      const perspective = fov / Math.max(50, fov + z2);
      const sX = centerX + x1 * baseScale * perspective;
      const sY = centerY - y2 * baseScale * perspective;

      const dist = Math.hypot(mouseX - sX, mouseY - sY);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          ...p,
          screenX: sX,
          screenY: sY,
          depth: z2,
          radius: p.entityType === "user" ? 14 : 10
        };
      }
    });

    setHoveredPoint(closest);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.max(0.4, Math.min(2.5, prev + zoomDelta)));
  };

  // Camera presets
  const handlePreset = (preset: "isometric" | "front" | "top" | "side") => {
    setIsAutoRotating(false);
    if (preset === "isometric") {
      setYaw(45);
      setPitch(25);
    } else if (preset === "front") {
      setYaw(0);
      setPitch(0);
    } else if (preset === "top") {
      setYaw(0);
      setPitch(90);
    } else if (preset === "side") {
      setYaw(90);
      setPitch(0);
    }
  };

  // Reset 3D view
  const handleResetCamera = () => {
    setYaw(45);
    setPitch(25);
    setZoom(1.0);
    setIsAutoRotating(false);
    setSelectedPoint(null);
  };

  // Export 3D Snapshot as PNG
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `3d-korelasyon-dagilimi-${userDomain}.png`;
    link.href = dataUrl;
    link.click();

    if (onNotification) {
      onNotification("3D Korelasyon Dağılım Grafiği anlık görüntüsü PNG olarak indirildi.");
    }
  };

  // Export 3D Coordinates as CSV
  const handleExportCsv = () => {
    const headers = [
      "Varlık / Kelime",
      "Tür",
      "Domain",
      `X (${xMetric.name})`,
      `Y (${yMetric.name})`,
      `Z (${zMetric.name})`,
      `Boyut (${sizeMetric.name})`,
      "Pazar Konumlandırması",
      "Stratejik Öneri"
    ];

    const rows = normalizedPoints.map((p) => [
      p.name,
      p.entityType,
      p.domain,
      p.xRaw.toFixed(2),
      p.yRaw.toFixed(2),
      p.zRaw.toFixed(2),
      p.sizeRaw.toFixed(2),
      p.quadrantLabel,
      p.insight
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `3d-korelasyon-koordinatlari-${userDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotification) {
      onNotification("3D Korelasyon koordinatları CSV olarak indirildi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="competitor-3d-scatter-plot-modal"
      data-testid="competitor-3d-scatter-plot-modal"
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-3d-scatter-title"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-6xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0 border border-indigo-400/40">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="modal-3d-scatter-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  Korelasyon Dağılım Grafiği &bull; 3D Pazar Konumlandırma Düzlemi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black border border-indigo-400/40 flex items-center gap-1 shadow-xs">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3D İnteraktif Eksenler</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Seçili metrikleri X, Y ve Z eksenlerine atayarak rakiplerin pazar konumlandırmasını, hacim ve başarı korelasyonunu 3 boyutlu uzayda inceler.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-download-3d-png"
              data-testid="download-3d-png-button"
              onClick={handleDownloadSnapshot}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="3D Canvas görüntüsünü PNG olarak indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Görsel İndir</span>
            </button>

            <button
              type="button"
              id="btn-export-3d-csv"
              data-testid="export-3d-csv-button"
              onClick={handleExportCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="3D Koordinat tablosunu CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              id="btn-close-3d-scatter-modal"
              data-testid="close-3d-scatter-modal-button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AXIS METRIC SELECTORS BAR (Eksen Seçicileri) */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs shrink-0">
          {/* X Axis Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-sky-500/30 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="select-3d-x-axis" className="text-[10px] text-sky-300 font-bold block uppercase tracking-wider">
                X Ekseni (Yatay):
              </label>
              <select
                id="select-3d-x-axis"
                data-testid="select-3d-x-axis"
                value={xAxisMetricId}
                onChange={(e) => setXAxisMetricId(e.target.value)}
                className="w-full bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer truncate"
              >
                {axisMetrics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Y Axis Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="select-3d-y-axis" className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
                Y Ekseni (Dikey):
              </label>
              <select
                id="select-3d-y-axis"
                data-testid="select-3d-y-axis"
                value={yAxisMetricId}
                onChange={(e) => setYAxisMetricId(e.target.value)}
                className="w-full bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer truncate"
              >
                {axisMetrics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Z Axis Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-purple-500/30 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="select-3d-z-axis" className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">
                Z Ekseni (Derinlik):
              </label>
              <select
                id="select-3d-z-axis"
                data-testid="select-3d-z-axis"
                value={zAxisMetricId}
                onChange={(e) => setZAxisMetricId(e.target.value)}
                className="w-full bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer truncate"
              >
                {axisMetrics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Size Metric Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="select-3d-size-metric" className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                Küre Boyutu (Ağırlık):
              </label>
              <select
                id="select-3d-size-metric"
                data-testid="select-3d-size-metric"
                value={sizeMetricId}
                onChange={(e) => setSizeMetricId(e.target.value)}
                className="w-full bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer truncate"
              >
                {axisMetrics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CONTROLS & CAMERA TOOLBAR */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          {/* View Scope Tabs */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-bold text-[11px] mr-1 hidden sm:inline">Kapsam:</span>
            <button
              type="button"
              onClick={() => setViewScope("competitor_market")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === "competitor_market"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Pazar Seviyesi (Rakipler)
            </button>
            <button
              type="button"
              onClick={() => setViewScope("hybrid")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === "hybrid"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Hibrit (Rakipler + Kelimeler)
            </button>
            <button
              type="button"
              onClick={() => setViewScope("keyword_scatter")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === "keyword_scatter"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Tüm Kelimeler ({rankings.length})
            </button>
          </div>

          {/* Camera Presets & Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handlePreset("isometric")}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer"
                title="İzometrik 3D Açı"
              >
                İzometrik
              </button>
              <button
                type="button"
                onClick={() => handlePreset("front")}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer"
                title="Önden Görünüm (X-Y)"
              >
                Önden
              </button>
              <button
                type="button"
                onClick={() => handlePreset("top")}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer"
                title="Üstten Kuşbakışı (X-Z)"
              >
                Üstten
              </button>
              <button
                type="button"
                onClick={() => handlePreset("side")}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer"
                title="Yandan Görünüm (Y-Z)"
              >
                Yandan
              </button>
            </div>

            {/* Auto Rotate Button */}
            <button
              type="button"
              id="btn-toggle-3d-auto-rotate"
              data-testid="toggle-3d-auto-rotate-button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-1.5 rounded-xl border flex items-center gap-1 font-bold text-[11px] transition-all cursor-pointer ${
                isAutoRotating
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
              title="360° Otomatik Döndürme"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Döndür</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.15))}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Yakınlaştır"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-mono text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.4, prev - 0.15))}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Uzaklaştır"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Camera */}
            <button
              type="button"
              onClick={handleResetCamera}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Varsayılan Açıya Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D CANVAS STAGE & INTERACTIVE TOOLTIP */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[420px] max-h-[560px] overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />

          {/* Quick HUD Overlay: Rotation angles and instructions */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 text-[11px] space-y-1 shadow-lg pointer-events-none">
            <div className="flex items-center gap-2 text-indigo-300 font-black">
              <Compass className="w-3.5 h-3.5" />
              <span>3D Kamera Açısı</span>
            </div>
            <div className="text-slate-400 font-mono text-[10px]">
              Yaw: {Math.round(yaw)}° | Pitch: {Math.round(pitch)}° | Zoom: {Math.round(zoom * 100)}%
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/60">
              Fareyle sürükleyip döndürün &bull; Tekerlekle yakınlaştırın
            </div>
          </div>

          {/* Quick HUD Overlay: 3D Correlation Coefficients */}
          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 text-[11px] space-y-1.5 shadow-lg">
            <div className="flex items-center gap-1.5 text-white font-black text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Çok Değişkenli Korelasyon</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sky-300">r(X, Y):</span>
                <span className="font-bold text-white">{correlationStats.rXY >= 0 ? `+${correlationStats.rXY}` : correlationStats.rXY}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-purple-300">r(X, Z):</span>
                <span className="font-bold text-white">{correlationStats.rXZ >= 0 ? `+${correlationStats.rXZ}` : correlationStats.rXZ}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-emerald-300">r(Y, Z):</span>
                <span className="font-bold text-white">{correlationStats.rYZ >= 0 ? `+${correlationStats.rYZ}` : correlationStats.rYZ}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-amber-300">Uyum R²:</span>
                <span className="font-bold text-white">%{correlationStats.overallFit}</span>
              </div>
            </div>

            {/* Toggle regression surface */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">Regresyon Düzlemi:</span>
              <button
                type="button"
                onClick={() => setShowRegressionPlane(!showRegressionPlane)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                  showRegressionPlane ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {showRegressionPlane ? "Açık" : "Kapalı"}
              </button>
            </div>
          </div>

          {/* Interactive Floating Hover / Click Tooltip in 3D */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 rounded-2xl p-3 shadow-2xl z-20 text-xs min-w-[240px] max-w-[320px] transition-all"
              style={{
                left: `${Math.min(window.innerWidth - 340, Math.max(16, hoveredPoint.screenX + 16))}px`,
                top: `${Math.min(480, Math.max(16, hoveredPoint.screenY - 30))}px`
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: hoveredPoint.color }}
                  />
                  <span className="font-black text-white text-xs">{hoveredPoint.name}</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">
                  {hoveredPoint.domain}
                </span>
              </div>

              {/* Quadrant Badge */}
              <div className="mt-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  hoveredPoint.quadrant === "leader"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : hoveredPoint.quadrant === "challenger"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : hoveredPoint.quadrant === "niche"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {hoveredPoint.quadrantLabel}
                </span>
              </div>

              {/* Exact 3D Coordinate Values */}
              <div className="space-y-1 font-mono text-[11px] pt-1">
                <div className="flex items-center justify-between text-sky-300">
                  <span>X ({xMetric.shortName}):</span>
                  <span className="font-bold text-white">{xMetric.formatDisplay(hoveredPoint.xRaw)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Y ({yMetric.shortName}):</span>
                  <span className="font-bold text-white">{yMetric.formatDisplay(hoveredPoint.yRaw)}</span>
                </div>
                <div className="flex items-center justify-between text-purple-300">
                  <span>Z ({zMetric.shortName}):</span>
                  <span className="font-bold text-white">{zMetric.formatDisplay(hoveredPoint.zRaw)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Küre ({sizeMetric.shortName}):</span>
                  <span className="font-bold text-white">{sizeMetric.formatDisplay(hoveredPoint.sizeRaw)}</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-300">
                {hoveredPoint.insight}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: 4 MARKET POSITIONING QUADRANTS SUMMARY & INSIGHTS */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs shrink-0">
          {/* Quadrant 1: Leaders */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-400 text-xs">01 &bull; Pazar Liderleri</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-300">
              Yüksek arama hacminde hedefe ulaşma oranı %70+ olan baskın oyuncular. Marka otoritesini korurlar.
            </p>
          </div>

          {/* Quadrant 2: Challengers */}
          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-rose-400 text-xs">02 &bull; Agresif Zorlayıcılar</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <p className="text-[11px] text-slate-300">
              Yüksek hacimli anahtar kelimelerde SERP payı arayan fakat sıralama hedefi henüz tam oturmamış rakipler.
            </p>
          </div>

          {/* Quadrant 3: Niche Specialists */}
          <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-sky-400 text-xs">03 &bull; Niş Uzmanlar</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <p className="text-[11px] text-slate-300">
              Orta/düşük hacimli spesifik kelimelerde yüksek pozisyon başarısı gösteren odaklanmış oyuncular.
            </p>
          </div>

          {/* Quadrant 4: Opportunities */}
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-400 text-xs">04 &bull; Fırsat Alanı</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-[11px] text-slate-300">
              Küçük teknik ve içerik revizyonlarıyla hızlıca üst çeyreğe sıçrayabilecek yüksek potansiyelli kelimeler.
            </p>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3D Korelasyon motoru 100x100x100 izometrik ve perspektif uzayında hesaplanmaktadır.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-close-3d-scatter-bottom"
              data-testid="close-3d-scatter-bottom-button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
