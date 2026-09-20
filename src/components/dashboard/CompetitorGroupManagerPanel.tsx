import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  Download,
  Copy,
  TrendingUp,
  Target,
  Sparkles,
  Award,
  Zap,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  ExternalLink,
  Sliders
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";

export interface CompetitorGroup {
  id: string;
  name: string;
  description?: string;
  color: "indigo" | "emerald" | "amber" | "rose" | "purple" | "sky" | "teal" | "orange";
  keywordIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorGroupMetrics {
  groupId: string;
  groupName: string;
  color: CompetitorGroup["color"];
  description?: string;
  totalKeywords: number;
  avgUserRank: number | null;
  avgComp1Rank: number | null;
  avgComp2Rank: number | null;
  avgComp3Rank: number | null;
  avgBestCompRank: number | null;
  avgGap: number;
  avgSearchVolume: number;
  totalSearchVolume: number;
  avgDifficulty: number;
  avgTrafficOpportunity: number;
  totalTrafficOpportunity: number;
  avgSpeedScore: number;
  top3Count: number;
  top3Percentage: number;
  top10Count: number;
  top10Percentage: number;
  userLeadingCount: number;
  compLeadingCount: number;
  strengths: string[];
  weaknesses: string[];
  actionAdvice: string;
}

export interface CompetitorGroupManagerPanelProps {
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userName: string;
  userDomain: string;
  selectedRowIds: Set<string>;
  onSelectRows: (ids: string[]) => void;
  activeGroupFilter: string | null;
  onFilterByGroup: (groupId: string | null) => void;
  onClose?: () => void;
  className?: string;
}

const COLOR_CONFIGS: Record<
  CompetitorGroup["color"],
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    ring: string;
    dot: string;
    hex: string;
  }
> = {
  indigo: {
    bg: "bg-indigo-50/70",
    border: "border-indigo-200",
    text: "text-indigo-900",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-300",
    ring: "focus:ring-indigo-500",
    dot: "bg-indigo-600",
    hex: "#4f46e5"
  },
  emerald: {
    bg: "bg-emerald-50/70",
    border: "border-emerald-200",
    text: "text-emerald-900",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-300",
    ring: "focus:ring-emerald-500",
    dot: "bg-emerald-600",
    hex: "#059669"
  },
  amber: {
    bg: "bg-amber-50/70",
    border: "border-amber-200",
    text: "text-amber-900",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-300",
    ring: "focus:ring-amber-500",
    dot: "bg-amber-500",
    hex: "#d97706"
  },
  rose: {
    bg: "bg-rose-50/70",
    border: "border-rose-200",
    text: "text-rose-900",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-300",
    ring: "focus:ring-rose-500",
    dot: "bg-rose-600",
    hex: "#e11d48"
  },
  purple: {
    bg: "bg-purple-50/70",
    border: "border-purple-200",
    text: "text-purple-900",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-300",
    ring: "focus:ring-purple-500",
    dot: "bg-purple-600",
    hex: "#9333ea"
  },
  sky: {
    bg: "bg-sky-50/70",
    border: "border-sky-200",
    text: "text-sky-900",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-300",
    ring: "focus:ring-sky-500",
    dot: "bg-sky-600",
    hex: "#0284c7"
  },
  teal: {
    bg: "bg-teal-50/70",
    border: "border-teal-200",
    text: "text-teal-900",
    badgeBg: "bg-teal-500/15",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-300",
    ring: "focus:ring-teal-500",
    dot: "bg-teal-600",
    hex: "#0d9488"
  },
  orange: {
    bg: "bg-orange-50/70",
    border: "border-orange-200",
    text: "text-orange-900",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-700",
    badgeBorder: "border-orange-300",
    ring: "focus:ring-orange-500",
    dot: "bg-orange-600",
    hex: "#ea580c"
  }
};

const PRESET_GROUP_NAMES = [
  { name: "Doğrudan Yerel Rakipler", color: "indigo" as const, desc: "Aynı semt ve ilçede hizmet veren birebir çekişilen rakipler" },
  { name: "Büyük Platformlar & Dizinler", color: "purple" as const, desc: "Armut, Sahibinden gibi geniş indeksli agregatörler" },
  { name: "Hızlı Kazanımlar (Düşük Zorluk)", color: "emerald" as const, desc: "SEO zorluğu düşük, ilk 3'e hızlı girilebilecek fırsatlar" },
  { name: "Yüksek Hacimli Anahtar Kelimeler", color: "amber" as const, desc: "Aylık arama hacmi yüksek, ana ciro üreten sektör sorguları" },
  { name: "Mobil Hız & Core Web Vitals Zaafı", color: "rose" as const, desc: "Rakip sayfa hızı 70 altında olan ve hızla geçilebilecek kelimeler" }
];

export function calculateGroupMetrics(
  group: CompetitorGroup,
  rankings: CompetitorKeywordRanking[]
): CompetitorGroupMetrics {
  const items = rankings.filter((r) => group.keywordIds.includes(r.id));
  const totalKeywords = items.length;

  if (totalKeywords === 0) {
    return {
      groupId: group.id,
      groupName: group.name,
      color: group.color,
      description: group.description,
      totalKeywords: 0,
      avgUserRank: null,
      avgComp1Rank: null,
      avgComp2Rank: null,
      avgComp3Rank: null,
      avgBestCompRank: null,
      avgGap: 0,
      avgSearchVolume: 0,
      totalSearchVolume: 0,
      avgDifficulty: 0,
      avgTrafficOpportunity: 0,
      totalTrafficOpportunity: 0,
      avgSpeedScore: 0,
      top3Count: 0,
      top3Percentage: 0,
      top10Count: 0,
      top10Percentage: 0,
      userLeadingCount: 0,
      compLeadingCount: 0,
      strengths: ["Henüz bu gruba eklenmiş kelime bulunmamaktadır."],
      weaknesses: [],
      actionAdvice: "Tablodaki checkboxları kullanarak bu gruba anahtar kelimeler ve rakipler ekleyin."
    };
  }

  // Calculate ranks
  const userRankValues = items
    .map((i) => i.userRank)
    .filter((n): n is number => n !== null && typeof n === "number");
  
  const avgUserRank = userRankValues.length > 0
    ? Number((userRankValues.reduce((a, b) => a + b, 0) / userRankValues.length).toFixed(1))
    : null;

  const comp1Values = items.map((i) => i.comp1Rank).filter((n): n is number => n !== null);
  const comp2Values = items.map((i) => i.comp2Rank).filter((n): n is number => n !== null);
  const comp3Values = items.map((i) => i.comp3Rank).filter((n): n is number => n !== null);

  const avgComp1Rank = comp1Values.length > 0
    ? Number((comp1Values.reduce((a, b) => a + b, 0) / comp1Values.length).toFixed(1))
    : null;
  const avgComp2Rank = comp2Values.length > 0
    ? Number((comp2Values.reduce((a, b) => a + b, 0) / comp2Values.length).toFixed(1))
    : null;
  const avgComp3Rank = comp3Values.length > 0
    ? Number((comp3Values.reduce((a, b) => a + b, 0) / comp3Values.length).toFixed(1))
    : null;

  // Best competitor rank for each item
  const bestCompRanks = items.map((item) => {
    const ranks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((n): n is number => n !== null);
    return ranks.length > 0 ? Math.min(...ranks) : 1;
  });

  const avgBestCompRank = Number(
    (bestCompRanks.reduce((a, b) => a + b, 0) / bestCompRanks.length).toFixed(1)
  );

  // User rank proxy for gap: if not in top 20, consider 25
  const avgGap = Number(
    (items.reduce((acc, item, idx) => {
      const uRank = item.userRank !== null ? item.userRank : 25;
      const cRank = bestCompRanks[idx];
      return acc + (uRank - cRank);
    }, 0) / totalKeywords).toFixed(1)
  );

  // Volumes & Difficulty (monthlyVolume and trafficOpportunity parsing)
  const totalSearchVolume = items.reduce((acc, i) => {
    const raw = i.monthlyVolume;
    const cleaned = typeof raw === "string" ? raw.replace(/[^0-9]/g, "") : "";
    const num = cleaned ? parseInt(cleaned, 10) : 0;
    return acc + num;
  }, 0);
  const avgSearchVolume = Math.round(totalSearchVolume / totalKeywords);

  const totalDifficulty = items.reduce((acc, i) => acc + (i.difficulty || 0), 0);
  const avgDifficulty = Number((totalDifficulty / totalKeywords).toFixed(1));

  const totalTrafficOpportunity = items.reduce((acc, i) => {
    const raw = i.trafficOpportunity;
    const cleaned = typeof raw === "string" ? raw.replace(/[^0-9]/g, "") : "";
    const num = typeof raw === "number" ? raw : cleaned ? parseInt(cleaned, 10) : 0;
    return acc + num;
  }, 0);
  const avgTrafficOpportunity = Math.round(totalTrafficOpportunity / totalKeywords);

  // Speed scores (from item metadata or default realistic range)
  const totalSpeed = items.reduce((acc, i) => acc + ((i as any).speedScore || 72), 0);
  const avgSpeedScore = Math.round(totalSpeed / totalKeywords);

  // Top 3 & Top 10 coverage
  const top3Count = items.filter((i) => i.userRank !== null && i.userRank <= 3).length;
  const top3Percentage = Math.round((top3Count / totalKeywords) * 100);

  const top10Count = items.filter((i) => i.userRank !== null && i.userRank <= 10).length;
  const top10Percentage = Math.round((top10Count / totalKeywords) * 100);

  // Leading vs Trailing
  let userLeadingCount = 0;
  let compLeadingCount = 0;

  items.forEach((item, idx) => {
    const bestComp = bestCompRanks[idx];
    if (item.userRank !== null && item.userRank <= bestComp) {
      userLeadingCount++;
    } else {
      compLeadingCount++;
    }
  });

  // Strengths and weaknesses extraction
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (avgDifficulty <= 40) {
    strengths.push(`Düşük SEO Zorluğu (Ort. KD ${avgDifficulty}): Sayfa optimizasyonu ile hızlıca #1 sıraya çıkılabilir.`);
  }
  if (top3Percentage >= 40) {
    strengths.push(`Yüksek Liderlik Oranı: Kelimelerin %${top3Percentage}'inde ilk 3 sıradasınız.`);
  }
  if (avgSpeedScore < 75) {
    strengths.push(`Rakip Hız Zafiyeti: Bu gruptaki rakiplerin ortalama hızı ${avgSpeedScore}/100. Cloudflare TTFB hızınızla öne geçebilirsiniz.`);
  }

  if (compLeadingCount > userLeadingCount) {
    weaknesses.push(`Rakip Üstünlüğü: Bu gruptaki ${compLeadingCount} kelimede rakipler daha üst sırada.`);
  }
  if (avgDifficulty > 60) {
    weaknesses.push(`Yüksek Rekabet (Ort. KD ${avgDifficulty}): Kapsamlı pillar içerik ve yerel backlink desteği gerektirir.`);
  }
  if (top10Percentage < 50) {
    weaknesses.push(`SERP Görünürlük Eksikliği: Kelimelerin sadece %${top10Percentage}'i ilk sayfada yer alıyor.`);
  }

  if (strengths.length === 0) {
    strengths.push(`Toplam ${totalSearchVolume.toLocaleString("tr-TR")} aylık arama hacmi potansiyeli barındırıyor.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Ciddi bir yapısal zafiyet tespit edilmedi, mevcut pozisyonları koruyucu teknik SEO önerilir.");
  }

  // Action advice
  let actionAdvice = "";
  if (avgGap <= 0) {
    actionAdvice = "Tebrikler! Bu grupta rakiplerinizin ortalama önündesiniz. Mikro veri şemalarını güncelleyerek pozisyonunuzu sabitleyin.";
  } else if (avgGap <= 4) {
    actionAdvice = `Rakipler ortalama sadece ${avgGap} sıra ileride. 15 günlük agresif içerik ve yerel landing page çalışmasıyla liderliği devralabilirsiniz.`;
  } else {
    actionAdvice = `Rakiplerle aranızda ortalama ${avgGap} sıra fark bulunuyor. Sayfa içi H1-H2 optimizasyonu ve FAQ Schema eklenmesi önerilir.`;
  }

  return {
    groupId: group.id,
    groupName: group.name,
    color: group.color,
    description: group.description,
    totalKeywords,
    avgUserRank,
    avgComp1Rank,
    avgComp2Rank,
    avgComp3Rank,
    avgBestCompRank,
    avgGap,
    avgSearchVolume,
    totalSearchVolume,
    avgDifficulty,
    avgTrafficOpportunity,
    totalTrafficOpportunity,
    avgSpeedScore,
    top3Count,
    top3Percentage,
    top10Count,
    top10Percentage,
    userLeadingCount,
    compLeadingCount,
    strengths,
    weaknesses,
    actionAdvice
  };
}

export const CompetitorGroupManagerPanel: React.FC<CompetitorGroupManagerPanelProps> = ({
  rankings,
  competitors,
  userName,
  userDomain,
  selectedRowIds,
  onSelectRows,
  activeGroupFilter,
  onFilterByGroup,
  onClose,
  className = ""
}) => {
  const storageKey = `seo_competitor_groups_${userDomain || "default"}`;

  // Default / saved groups
  const [groups, setGroups] = useState<CompetitorGroup[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load competitor groups:", e);
    }

    // Default seeded groups based on rankings
    const firstTwo = rankings.slice(0, 2).map((r) => r.id);
    const lowKd = rankings.filter((r) => r.difficulty <= 40).map((r) => r.id);
    const highVol = rankings.filter((r) => r.searchVolume >= 1000).map((r) => r.id);

    return [
      {
        id: "group-seed-1",
        name: "Doğrudan Yerel Rakipler",
        description: "En yüksek trafikli ve doğrudan rekabet ettiğimiz ana hizmet aramaları",
        color: "indigo",
        keywordIds: firstTwo.length > 0 ? firstTwo : rankings.slice(0, 3).map((r) => r.id),
        createdAt: "Sistem Varsayılanı",
        updatedAt: "Bugün"
      },
      {
        id: "group-seed-2",
        name: "Hızlı Kazanımlar (Düşük KD)",
        description: "SEO zorluğu 40 altındaki ve kolayca ilk 3'e taşınabilecek kelimeler",
        color: "emerald",
        keywordIds: lowKd.length > 0 ? lowKd : rankings.slice(2, 5).map((r) => r.id),
        createdAt: "Sistem Varsayılanı",
        updatedAt: "Bugün"
      },
      {
        id: "group-seed-3",
        name: "Yüksek Hacimli Hedefler",
        description: "Sektörel arama hacmi yüksek, en çok talep üreten anahtar kelimeler",
        color: "amber",
        keywordIds: highVol.length > 0 ? highVol : rankings.slice(0, 4).map((r) => r.id),
        createdAt: "Sistem Varsayılanı",
        updatedAt: "Bugün"
      }
    ];
  });

  // Save to localStorage when groups change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(groups));
    } catch (e) {
      console.error("Failed to save competitor groups to localStorage:", e);
    }
  }, [groups, storageKey]);

  // View mode: 'cards' | 'matrix'
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");

  // Form state for creating / editing a group
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formColor, setFormColor] = useState<CompetitorGroup["color"]>("indigo");
  const [formKeywordIds, setFormKeywordIds] = useState<string[]>([]);
  const [formKeywordSearch, setFormKeywordSearch] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open creation modal prefilled with current selected rows
  const handleOpenCreateWithSelection = () => {
    const selectedList = Array.from(selectedRowIds);
    setEditingGroupId(null);
    setFormName(
      selectedList.length > 0
        ? `Seçili Rakip Grubu (${selectedList.length} Kelime)`
        : "Yeni Rakip Grubu"
    );
    setFormDescription(
      selectedList.length > 0
        ? `Tablodaki checkboxlar ile seçilen ${selectedList.length} rakip satırından oluşturuldu.`
        : ""
    );
    setFormColor("indigo");
    setFormKeywordIds(selectedList.length > 0 ? selectedList : rankings.slice(0, 3).map((r) => r.id));
    setFormKeywordSearch("");
    setIsFormOpen(true);
  };

  // Open edit modal for an existing group
  const handleOpenEditGroup = (group: CompetitorGroup) => {
    setEditingGroupId(group.id);
    setFormName(group.name);
    setFormDescription(group.description || "");
    setFormColor(group.color);
    setFormKeywordIds([...group.keywordIds]);
    setFormKeywordSearch("");
    setIsFormOpen(true);
  };

  // Save or update group
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Lütfen bir grup adı giriniz.");
      return;
    }

    if (formKeywordIds.length === 0) {
      showToast("Lütfen gruba en az 1 anahtar kelime/rakip ekleyiniz.");
      return;
    }

    const now = new Date();
    const dateStr = `Bugün ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (editingGroupId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroupId
            ? {
                ...g,
                name: formName.trim(),
                description: formDescription.trim(),
                color: formColor,
                keywordIds: formKeywordIds,
                updatedAt: dateStr
              }
            : g
        )
      );
      showToast(`"${formName.trim()}" grubu başarıyla güncellendi.`);
    } else {
      const newGroup: CompetitorGroup = {
        id: `group-${Date.now()}`,
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        keywordIds: formKeywordIds,
        createdAt: dateStr,
        updatedAt: dateStr
      };
      setGroups((prev) => [newGroup, ...prev]);
      showToast(`"${formName.trim()}" grubu ${formKeywordIds.length} kelime ile başarıyla oluşturuldu!`);
    }

    setIsFormOpen(false);
    setEditingGroupId(null);
  };

  // Delete group
  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (confirm(`"${groupName}" grubunu silmek istediğinizden emin misiniz?`)) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (activeGroupFilter === groupId) {
        onFilterByGroup(null);
      }
      showToast(`"${groupName}" grubu silindi.`);
    }
  };

  // Automatically cluster rankings into smart cohorts
  const handleAutoGenerateCohorts = () => {
    const lowKdIds = rankings.filter((r) => r.difficulty <= 45).map((r) => r.id);
    const highVolumeIds = rankings.filter((r) => r.searchVolume >= 1000).map((r) => r.id);
    const headToHeadIds = rankings
      .filter((r) => {
        const bestComp = Math.min(
          r.comp1Rank || 99,
          r.comp2Rank || 99,
          r.comp3Rank || 99
        );
        return (r.userRank !== null && r.userRank <= 5) || bestComp <= 5;
      })
      .map((r) => r.id);

    const now = new Date();
    const dateStr = `Bugün ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const autoGroups: CompetitorGroup[] = [
      {
        id: `group-auto-head-${Date.now()}`,
        name: "🏆 Kafa Kafaya Rekabet (İlk 5 Sıra)",
        description: "En yoğun rekabetin yaşandığı, ilk 5 sırada birbirimizi takip ettiğimiz anahtar kelimeler",
        color: "indigo",
        keywordIds: headToHeadIds.length > 0 ? headToHeadIds : rankings.slice(0, 3).map((r) => r.id),
        createdAt: dateStr,
        updatedAt: dateStr
      },
      {
        id: `group-auto-quick-${Date.now() + 1}`,
        name: "⚡ Hızlı Kazanımlar (Düşük Zorluk & Yüksek ROI)",
        description: "SEO zorluğu düşük (KD ≤ 45) ve minimum çabayla #1 pozisyona ulaşılabilecek fırsatlar",
        color: "emerald",
        keywordIds: lowKdIds.length > 0 ? lowKdIds : rankings.slice(2, 6).map((r) => r.id),
        createdAt: dateStr,
        updatedAt: dateStr
      },
      {
        id: `group-auto-vol-${Date.now() + 2}`,
        name: "📈 Sektörel Trafik Lokomotifleri (Hacim 1.000+)",
        description: "En yüksek arama hacmine sahip, ciro ve telefon trafiğini doğrudan belirleyen kelimeler",
        color: "amber",
        keywordIds: highVolumeIds.length > 0 ? highVolumeIds : rankings.slice(0, 4).map((r) => r.id),
        createdAt: dateStr,
        updatedAt: dateStr
      }
    ];

    setGroups(autoGroups);
    showToast("3 adet akıllı rakip kohortu otomatik olarak oluşturuldu ve performans ortalamaları hesaplandı.");
  };

  // Compute metrics for all groups
  const groupMetricsList = useMemo(() => {
    return groups.map((g) => calculateGroupMetrics(g, rankings));
  }, [groups, rankings]);

  // Overall table average metrics for benchmark comparison
  const overallMetrics = useMemo(() => {
    const fakeOverallGroup: CompetitorGroup = {
      id: "overall",
      name: "Tüm Tablo Ortalaması",
      color: "sky",
      keywordIds: rankings.map((r) => r.id),
      createdAt: "",
      updatedAt: ""
    };
    return calculateGroupMetrics(fakeOverallGroup, rankings);
  }, [rankings]);

  // Live preview metrics for the creation form
  const liveFormMetrics = useMemo(() => {
    if (!isFormOpen) return null;
    const tempGroup: CompetitorGroup = {
      id: "preview",
      name: formName || "Önizleme Grubu",
      color: formColor,
      keywordIds: formKeywordIds,
      createdAt: "",
      updatedAt: ""
    };
    return calculateGroupMetrics(tempGroup, rankings);
  }, [isFormOpen, formName, formColor, formKeywordIds, rankings]);

  // Copy group summary as text
  const handleCopyGroupSummary = (m: CompetitorGroupMetrics) => {
    const summary = [
      `📊 RAKİP GRUBU PERFORMANS RAPORU: ${m.groupName}`,
      `Toplam Kelime Sayısı: ${m.totalKeywords}`,
      `Siteniz Ortalama Sıralama: ${m.avgUserRank !== null ? `#${m.avgUserRank}` : "İlk 20'de Yok"}`,
      `En Güçlü Rakip Ort. Sıralama: #${m.avgBestCompRank}`,
      `Ortalama Sıralama Farkı (Gap): ${m.avgGap > 0 ? `-${m.avgGap} sıra geride` : `+${Math.abs(m.avgGap)} sıra önde`}`,
      `Ortalama Arama Hacmi: ${m.avgSearchVolume.toLocaleString("tr-TR")} /ay (Toplam: ${m.totalSearchVolume.toLocaleString("tr-TR")})`,
      `Ortalama SEO Zorluğu: ${m.avgDifficulty}/100`,
      `Aylık Tahmini Trafik Fırsatı: ${m.totalTrafficOpportunity.toLocaleString("tr-TR")} tıklama/ay`,
      `Rakip Ortalama Sayfa Hızı: ${m.avgSpeedScore}/100`,
      `İlk 3 Kapsama Oranı: %${m.top3Percentage} (${m.top3Count}/${m.totalKeywords} kelime)`,
      `Stratejik Eylem Önerisi: ${m.actionAdvice}`
    ].join("\n");

    navigator.clipboard.writeText(summary);
    showToast(`"${m.groupName}" performans özeti panoya kopyalandı.`);
  };

  // Export group metrics as CSV
  const handleExportGroupCsv = (m: CompetitorGroupMetrics) => {
    const groupItems = rankings.filter((r) => {
      const g = groups.find((grp) => grp.id === m.groupId);
      return g?.keywordIds.includes(r.id);
    });

    const headers = [
      "Grup Adı",
      "Anahtar Kelime",
      "Arama Hacmi",
      "SEO Zorluğu (KD)",
      "Siteniz Sırası",
      "1. Rakip Sırası",
      "2. Rakip Sırası",
      "3. Rakip Sırası",
      "En İyi Rakip",
      "Sıralama Farkı",
      "Trafik Fırsatı"
    ];

    const rows = groupItems.map((item) => {
      const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((n): n is number => n !== null);
      const best = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const uRank = item.userRank !== null ? item.userRank : 25;
      const gap = uRank - best;

      return [
        `"${m.groupName}"`,
        `"${item.keyword}"`,
        item.searchVolume,
        item.difficulty,
        item.userRank !== null ? item.userRank : "İlk 20'de Yok",
        item.comp1Rank || "-",
        item.comp2Rank || "-",
        item.comp3Rank || "-",
        best,
        gap,
        item.trafficOpportunity || 0
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rakip_grubu_${m.groupName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_ortalamalari.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`"${m.groupName}" CSV raporu başarıyla indirildi.`);
  };

  return (
    <div
      id="competitor-group-manager-panel"
      data-testid="competitor-group-manager-panel"
      className={`p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 text-white shadow-2xl relative overflow-hidden transition-all duration-300 animate-in fade-in ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="group-manager-toast"
          data-testid="group-manager-toast"
          className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl border border-indigo-400 flex items-center gap-2 animate-in slide-in-from-top-3"
        >
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HEADER & CONTROLS */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/25 to-purple-500/25 border border-indigo-400/40 text-indigo-300 font-black text-xs flex items-center gap-1.5 shadow-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rakip Grupları & Kohort Analizi</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
              {groups.length} Aktif Grup
            </span>

            {selectedRowIds.size > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <span>{selectedRowIds.size} Satır Seçili</span>
              </span>
            )}

            {activeGroupFilter && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[11px] font-bold shadow-xs">
                <Filter className="w-3 h-3" />
                <span>Filtre: {groups.find((g) => g.id === activeGroupFilter)?.name || "Grup"}</span>
                <button
                  type="button"
                  onClick={() => onFilterByGroup(null)}
                  className="hover:bg-indigo-600 p-0.5 rounded-full cursor-pointer ml-0.5"
                  title="Grup filtresini temizle"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>

          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>Rakip Grupları ve Segment Performans Ortalamaları</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Tablodaki checkboxlar ile seçtiğiniz rakipleri akıllı kohortlara gruplayın. Her grup için ortalama sıralama, rekabet farkı (Gap), arama hacmi, SEO zorluğu ve potansiyel trafik metriklerini ayrı ayrı izleyin.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* View Mode Toggle: Cards vs Matrix */}
          <div className="flex items-center p-1 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              id="btn-group-view-cards"
              data-testid="btn-group-view-cards"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kartlar</span>
            </button>
            <button
              type="button"
              id="btn-group-view-matrix"
              data-testid="btn-group-view-matrix"
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Karşılaştırma Matrisi</span>
            </button>
          </div>

          {/* Create Group from Selected Checkboxes Button */}
          <button
            type="button"
            id="btn-create-group-from-selected"
            data-testid="btn-create-group-from-selected"
            onClick={handleOpenCreateWithSelection}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-95"
            title={
              selectedRowIds.size > 0
                ? `Seçili ${selectedRowIds.size} rakip satırı ile yeni grup oluştur`
                : "Yeni bir rakip grubu oluşturun"
            }
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Rakip Grubu Oluştur</span>
            {selectedRowIds.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                {selectedRowIds.size}
              </span>
            )}
          </button>

          {/* Auto Smart Cohorts Button */}
          <button
            type="button"
            id="btn-auto-generate-cohorts"
            data-testid="btn-auto-generate-cohorts"
            onClick={handleAutoGenerateCohorts}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Sektör verilerini analiz ederek 3 adet akıllı rakip kohortu otomatik oluşturun"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Otomatik Akıllı Kohortlar</span>
          </button>

          {onClose && (
            <button
              type="button"
              id="btn-close-group-manager"
              data-testid="btn-close-group-manager"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Paneli Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. INLINE GROUP CREATION / EDIT MODAL BOX */}
      {isFormOpen && (
        <div
          id="competitor-group-builder-modal"
          data-testid="competitor-group-builder-modal"
          className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-amber-400/70 shadow-2xl animate-in fade-in slide-in-from-top-3 relative z-20"
        >
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {editingGroupId ? "Rakip Grubunu Düzenle" : "Yeni Rakip Grubu Oluştur"}
                </h4>
                <p className="text-xs text-slate-400">
                  Gruba isim verin, renk seçin ve satırları ekleyerek canlı performans ortalamalarını inceleyin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingGroupId(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveGroup} className="mt-4 space-y-5">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hızlı Şablonlar / Önerilen Kohortlar
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_GROUP_NAMES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFormName(preset.name);
                      setFormDescription(preset.desc);
                      setFormColor(preset.color);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className={`w-2 h-2 rounded-full ${COLOR_CONFIGS[preset.color].dot}`} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group Name */}
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="group-name-input" className="text-xs font-bold text-slate-300 block">
                  Grup Adı <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="group-name-input"
                  data-testid="group-name-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Örn: Doğrudan Yerel Rakipler"
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Renk Rozeti</label>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {(Object.keys(COLOR_CONFIGS) as CompetitorGroup["color"][]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                        formColor === c
                          ? "ring-2 ring-white scale-110 border-white"
                          : "opacity-60 hover:opacity-100 border-transparent"
                      }`}
                      style={{ backgroundColor: COLOR_CONFIGS[c].hex }}
                      title={c}
                    >
                      {formColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-3 space-y-1">
                <label htmlFor="group-desc-input" className="text-xs font-bold text-slate-300 block">
                  Açıklama (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="group-desc-input"
                  data-testid="group-desc-input"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Bu grubun hedefi ve dahil edilen rakipler hakkında not..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            {/* Keyword / Competitor Row Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <span>Bu Gruba Dahil Edilen Kelimeler & Rakipler</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                    {formKeywordIds.length} Seçildi
                  </span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormKeywordIds(rankings.map((r) => r.id))}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Tümünü Ekle
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setFormKeywordIds([])}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              {/* Search input for keywords */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formKeywordSearch}
                  onChange={(e) => setFormKeywordSearch(e.target.value)}
                  placeholder="Listeden anahtar kelime veya rakip ara..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              {/* Scrollable multi-select chips / list */}
              <div className="max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {rankings
                  .filter((r) =>
                    formKeywordSearch.trim()
                      ? r.keyword.toLowerCase().includes(formKeywordSearch.toLowerCase()) ||
                        (r as any).competitorName?.toLowerCase().includes(formKeywordSearch.toLowerCase())
                      : true
                  )
                  .map((item) => {
                    const isChecked = formKeywordIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-indigo-950/80 border-indigo-500/80 text-white"
                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormKeywordIds((prev) => [...prev, item.id]);
                              } else {
                                setFormKeywordIds((prev) => prev.filter((id) => id !== item.id));
                              }
                            }}
                            className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="truncate">
                            <span className="font-bold block truncate">{item.keyword}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Vol: {item.searchVolume.toLocaleString()} • KD: {item.difficulty}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 shrink-0">
                          {item.userRank ? `#${item.userRank}` : ">20"}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* LIVE PREVIEW CARD */}
            {liveFormMetrics && formKeywordIds.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Canlı Grup Performans Ortalaması Önizlemesi ({liveFormMetrics.totalKeywords} Kelime)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Otomatik hesaplandı</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ort. Sıranız</div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      {liveFormMetrics.avgUserRank !== null ? `#${liveFormMetrics.avgUserRank}` : "İlk 20'de Yok"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Rakip Ort. Sıra</div>
                    <div className="text-sm font-black text-slate-200 font-mono">
                      #{liveFormMetrics.avgBestCompRank}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ortalama Gap</div>
                    <div className={`text-sm font-black font-mono ${liveFormMetrics.avgGap <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {liveFormMetrics.avgGap <= 0 ? `+${Math.abs(liveFormMetrics.avgGap)} önde` : `-${liveFormMetrics.avgGap} sıra`}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ort. Arama Hacmi</div>
                    <div className="text-sm font-black text-white font-mono">
                      {liveFormMetrics.avgSearchVolume.toLocaleString()} /ay
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ort. SEO Zorluğu</div>
                    <div className="text-sm font-black text-indigo-300 font-mono">
                      KD {liveFormMetrics.avgDifficulty}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingGroupId(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                id="btn-save-group-submit"
                data-testid="btn-save-group-submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{editingGroupId ? "Değişiklikleri Kaydet" : "Grubu Kaydet ve Hesapla"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. GROUP DISPLAY MODES */}
      <div className="mt-6">
        {groups.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Henüz Bir Rakip Grubu Oluşturulmadı</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tablodaki satırların yanındaki checkboxları işaretleyerek veya otomatik akıllı kohort sihirbazını kullanarak ilk grubunuzu hemen oluşturabilirsiniz.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenCreateWithSelection}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Manuel Grup Oluştur</span>
              </button>
              <button
                type="button"
                onClick={handleAutoGenerateCohorts}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Otomatik Akıllı Gruplar</span>
              </button>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          /* ================================================================= */
          /* 3A. CARDS VIEW (Rich Individual Group Cards with Metrics & Advice) */
          /* ================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groupMetricsList.map((m) => {
              const colorConf = COLOR_CONFIGS[m.color] || COLOR_CONFIGS.indigo;
              const isFiltered = activeGroupFilter === m.groupId;

              return (
                <div
                  key={m.groupId}
                  id={`competitor-group-card-${m.groupId}`}
                  data-testid={`competitor-group-card-${m.groupId}`}
                  className={`p-5 rounded-2xl bg-slate-950/90 border transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                    isFiltered
                      ? "border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/40"
                      : "border-slate-800 hover:border-slate-700 shadow-lg"
                  }`}
                >
                  {/* Top Bar: Badge, Name, Action dropdown */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${colorConf.badgeBg} ${colorConf.badgeText} ${colorConf.badgeBorder}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${colorConf.dot}`} />
                          <span>{m.groupName}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                          {m.totalKeywords} Kelime
                        </span>
                      </div>

                      {/* Card utility buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopyGroupSummary(m)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Grup metriklerini kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportGroupCsv(m)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Grup CSV raporunu indir"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const grp = groups.find((g) => g.id === m.groupId);
                            if (grp) handleOpenEditGroup(grp);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Grubu Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(m.groupId, m.groupName)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Grubu Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>

                  {/* Key Averages Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1">
                    {/* 1. Sıralama Karşılaştırması */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Ort. Sıralama
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {m.avgUserRank !== null ? `#${m.avgUserRank}` : ">20"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          vs #{m.avgBestCompRank}
                        </span>
                      </div>
                      <div className={`text-[10px] font-bold mt-0.5 ${m.avgGap <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.avgGap <= 0 ? `+${Math.abs(m.avgGap)} sıra önde` : `-${m.avgGap} sıra arkada`}
                      </div>
                    </div>

                    {/* 2. Arama Hacmi */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Ort. Arama Hacmi
                      </div>
                      <div className="text-sm font-black text-white font-mono mt-0.5">
                        {m.avgSearchVolume.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Toplam: {m.totalSearchVolume.toLocaleString("tr-TR")} /ay
                      </div>
                    </div>

                    {/* 3. SEO Zorluğu */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Ort. SEO Zorluğu
                      </div>
                      <div className="text-sm font-black text-indigo-300 font-mono mt-0.5">
                        KD {m.avgDifficulty}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {m.avgDifficulty <= 40 ? "Kolay Rekabet" : m.avgDifficulty <= 65 ? "Orta Zorluk" : "Yüksek Rekabet"}
                      </div>
                    </div>

                    {/* 4. Trafik Fırsatı */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Trafik Fırsatı
                      </div>
                      <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                        +{m.totalTrafficOpportunity.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ort: ~{m.avgTrafficOpportunity} tık/ay
                      </div>
                    </div>

                    {/* 5. Rakip Hız Skoru */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Rakip Hız Skoru
                      </div>
                      <div className={`text-sm font-black font-mono mt-0.5 ${
                        m.avgSpeedScore >= 80 ? "text-emerald-400" : m.avgSpeedScore >= 65 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {m.avgSpeedScore} / 100
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {m.avgSpeedScore < 70 ? "⚡ Hız Zaafı Var" : "İyi Performans"}
                      </div>
                    </div>

                    {/* 6. Top 3 Kapsama */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        İlk 3 Kapsama
                      </div>
                      <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
                        %{m.top3Percentage}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {m.top3Count} / {m.totalKeywords} kelime
                      </div>
                    </div>
                  </div>

                  {/* Dominance Bar (User vs Competitors) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Liderlik: {m.userLeadingCount} kelimede öndesiniz</span>
                      <span>{m.compLeadingCount} kelimede rakip önde</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{
                          width: `${m.totalKeywords > 0 ? (m.userLeadingCount / m.totalKeywords) * 100 : 0}%`
                        }}
                        title={`Siteniz Önde: ${m.userLeadingCount} kelime`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{
                          width: `${m.totalKeywords > 0 ? (m.compLeadingCount / m.totalKeywords) * 100 : 0}%`
                        }}
                        title={`Rakipler Önde: ${m.compLeadingCount} kelime`}
                      />
                    </div>
                  </div>

                  {/* Strategic Insight Takeaway */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{m.actionAdvice}</span>
                  </div>

                  {/* Filter Table Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      id={`btn-filter-group-${m.groupId}`}
                      data-testid={`btn-filter-group-${m.groupId}`}
                      onClick={() => onFilterByGroup(isFiltered ? null : m.groupId)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isFiltered
                          ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{isFiltered ? "Filtreyi Kaldır (Tümünü Göster)" : "Bu Grubu Tabloda Filtrele"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================================================================= */
          /* 3B. MATRIX VIEW (Side-by-side Benchmark Table across all groups)  */
          /* ================================================================= */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Performans Metriği</th>
                  {groupMetricsList.map((m) => (
                    <th key={m.groupId} className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${COLOR_CONFIGS[m.color].dot}`} />
                        <span className="text-white font-bold">{m.groupName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono lowercase">
                        {m.totalKeywords} kelime
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-4 bg-slate-800/40 text-sky-300">
                    <div>Tüm Tablo Ortalaması</div>
                    <span className="text-[10px] text-slate-400 font-mono lowercase">
                      {overallMetrics.totalKeywords} kelime
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {/* 1. Sitenizin Ortalama Sıralaması */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Sitenizin Ort. Sıralaması</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono font-bold text-amber-400">
                      {m.avgUserRank !== null ? `#${m.avgUserRank}` : ">20"}
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono font-bold text-sky-300 bg-slate-800/20">
                    {overallMetrics.avgUserRank !== null ? `#${overallMetrics.avgUserRank}` : ">20"}
                  </td>
                </tr>

                {/* 2. En İyi Rakip Ort. Sıralaması */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">En İyi Rakip Ort. Sıralaması</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono text-slate-300">
                      #{m.avgBestCompRank}
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono text-slate-300 bg-slate-800/20">
                    #{overallMetrics.avgBestCompRank}
                  </td>
                </tr>

                {/* 3. Ortalama Sıralama Farkı (Gap) */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Ortalama Sıralama Farkı (Gap)</td>
                  {groupMetricsList.map((m) => (
                    <td
                      key={m.groupId}
                      className={`py-3 px-4 font-mono font-bold ${m.avgGap <= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {m.avgGap <= 0 ? `+${Math.abs(m.avgGap)} önde` : `-${m.avgGap} sıra`}
                    </td>
                  ))}
                  <td
                    className={`py-3 px-4 font-mono font-bold bg-slate-800/20 ${
                      overallMetrics.avgGap <= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {overallMetrics.avgGap <= 0 ? `+${Math.abs(overallMetrics.avgGap)} önde` : `-${overallMetrics.avgGap} sıra`}
                  </td>
                </tr>

                {/* 4. Ortalama Arama Hacmi */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Ortalama Arama Hacmi</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono text-white">
                      {m.avgSearchVolume.toLocaleString("tr-TR")} /ay
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono text-white bg-slate-800/20">
                    {overallMetrics.avgSearchVolume.toLocaleString("tr-TR")} /ay
                  </td>
                </tr>

                {/* 5. Toplam Arama Hacmi */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Grup Toplam Hacmi</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono text-slate-300">
                      {m.totalSearchVolume.toLocaleString("tr-TR")} /ay
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono text-slate-300 bg-slate-800/20">
                    {overallMetrics.totalSearchVolume.toLocaleString("tr-TR")} /ay
                  </td>
                </tr>

                {/* 6. Ortalama SEO Zorluğu */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Ortalama SEO Zorluğu (KD)</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono text-indigo-300 font-bold">
                      KD {m.avgDifficulty}
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono text-indigo-300 font-bold bg-slate-800/20">
                    KD {overallMetrics.avgDifficulty}
                  </td>
                </tr>

                {/* 7. Toplam Trafik Fırsatı */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Potansiyel Trafik Tıklaması</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono font-bold text-emerald-400">
                      +{m.totalTrafficOpportunity.toLocaleString("tr-TR")} tık
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 bg-slate-800/20">
                    +{overallMetrics.totalTrafficOpportunity.toLocaleString("tr-TR")} tık
                  </td>
                </tr>

                {/* 8. Rakip Ortalama Sayfa Hızı */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">Rakip Ortalama Hız Skoru</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono">
                      <span className={m.avgSpeedScore < 70 ? "text-rose-400 font-bold" : "text-slate-300"}>
                        {m.avgSpeedScore} / 100
                      </span>
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono text-slate-300 bg-slate-800/20">
                    {overallMetrics.avgSpeedScore} / 100
                  </td>
                </tr>

                {/* 9. İlk 3 Kapsama Oranı */}
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">İlk 3 Kapsama Oranı (%)</td>
                  {groupMetricsList.map((m) => (
                    <td key={m.groupId} className="py-3 px-4 font-mono font-bold text-amber-300">
                      %{m.top3Percentage} ({m.top3Count} kelime)
                    </td>
                  ))}
                  <td className="py-3 px-4 font-mono font-bold text-amber-300 bg-slate-800/20">
                    %{overallMetrics.top3Percentage} ({overallMetrics.top3Count} kelime)
                  </td>
                </tr>

                {/* 10. Aksiyon Butonları */}
                <tr className="bg-slate-900/30">
                  <td className="py-3 px-4 font-bold text-slate-400">Tablo Filtresi</td>
                  {groupMetricsList.map((m) => {
                    const isFiltered = activeGroupFilter === m.groupId;
                    return (
                      <td key={m.groupId} className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onFilterByGroup(isFiltered ? null : m.groupId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isFiltered
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          }`}
                        >
                          {isFiltered ? "Filtreyi Temizle" : "Filtrele"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 bg-slate-800/20">
                    <button
                      type="button"
                      onClick={() => onFilterByGroup(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      Tüm Tabloyu Göster
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
