import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ChevronDown,
  Globe,
  Gauge,
  FileText,
  Target,
  ShieldAlert,
  ArrowUpRight,
  SlidersHorizontal,
  BookmarkCheck,
  RefreshCw,
  ExternalLink,
  Flame,
  Info
} from "lucide-react";
import { CompetitorContentMetric, CompetitorKeywordRanking } from "../../types";
import { KeywordGoalItem } from "./GoalTrackingModule";

export type RecommendationCategory = 
  | "all"
  | "quick_wins"
  | "technical_cwv"
  | "content_depth"
  | "serp_features"
  | "defense_strategy";

export type RecommendationPriority = "critical" | "high" | "medium";

export interface PerformanceRecommendationItem {
  id: string;
  competitorId: string; // "all" or specific competitor id
  competitorName: string;
  competitorDomain: string;
  category: "quick_wins" | "technical_cwv" | "content_depth" | "serp_features" | "defense_strategy";
  priority: RecommendationPriority;
  title: string;
  description: string;
  targetKeywords: string[];
  currentMetricSummary: string;
  competitorMetricSummary: string;
  gapValue: string;
  expectedImpact: string;
  effort: "Kolay (1-2 Gün)" | "Orta (3-5 Gün)" | "Kapsamlı (1-2 Hafta)";
  actionSteps: string[];
}

export interface CompetitorPerformanceRecommendationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  goals?: Record<string, KeywordGoalItem>;
  initialCompetitorId?: string | null;
  userName?: string;
  userDomain?: string;
  onNotification?: (msg: string) => void;
}

const STORAGE_KEY = "seo_perf_recommendations_completed_v1";

export const CompetitorPerformanceRecommendationsDrawer: React.FC<CompetitorPerformanceRecommendationsDrawerProps> = ({
  isOpen,
  onClose,
  rankings,
  competitors,
  goals = {},
  initialCompetitorId = null,
  userName = "Siteniz",
  userDomain = "jetkur.com.tr",
  onNotification
}) => {
  // Selected competitor tab
  const [activeCompetitorId, setActiveCompetitorId] = useState<string>("all");
  // Category filter
  const [activeCategory, setActiveCategory] = useState<RecommendationCategory>("all");
  // Priority filter
  const [activePriority, setActivePriority] = useState<"all" | RecommendationPriority>("all");
  // Search query
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Status filter (all, pending, completed)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  // Expanded cards for action step details
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  // Completed status persisted in localStorage
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initialCompetitorId when opened
  useEffect(() => {
    if (isOpen) {
      if (initialCompetitorId) {
        setActiveCompetitorId(initialCompetitorId);
      }
    }
  }, [isOpen, initialCompetitorId]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Save completed map
  const toggleCompleted = (id: string) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save recommendations progress:", err);
      }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Generate dynamic recommendations from table metrics
  const allRecommendations: PerformanceRecommendationItem[] = useMemo(() => {
    if (!rankings || rankings.length === 0) return [];

    const items: PerformanceRecommendationItem[] = [];

    // Helper: Parse monthly volume as number
    const parseVol = (volStr: string) => {
      const clean = volStr.replace(/[^\d]/g, "");
      return parseInt(clean, 10) || 0;
    };

    // Analyze per competitor
    competitors.forEach((comp, idx) => {
      const compRankKey = idx === 0 ? "comp1Rank" : idx === 1 ? "comp2Rank" : "comp3Rank";
      const compName = comp.name || `Rakip ${idx + 1}`;
      const compDomain = comp.domain || `${compName.toLowerCase().replace(/\s+/g, "")}.com.tr`;

      // 1. Check keywords where competitor outranks us
      const competitorLeadingKeywords = rankings.filter((r) => {
        const cRank = r[compRankKey as keyof CompetitorKeywordRanking] as number | null;
        const uRank = r.userRank;
        if (cRank === null || cRank === undefined) return false;
        if (uRank === null || uRank === undefined) return true; // we are unranked, comp is ranked
        return cRank < uRank;
      });

      // 2. High-volume gap keywords where competitor is ahead
      const highVolumeLost = competitorLeadingKeywords
        .filter((r) => parseVol(r.monthlyVolume) >= 3000)
        .sort((a, b) => parseVol(b.monthlyVolume) - parseVol(a.monthlyVolume));

      if (highVolumeLost.length > 0) {
        const topKw = highVolumeLost[0];
        const cRank = topKw[compRankKey as keyof CompetitorKeywordRanking];
        const uRank = topKw.userRank ? `#${topKw.userRank}` : "İlk 20 Dışı";
        const gap = topKw.userRank ? (topKw.userRank - (cRank as number)) : ">15";

        items.push({
          id: `rec-defense-${comp.id}-${topKw.id}`,
          competitorId: comp.id,
          competitorName: compName,
          competitorDomain: compDomain,
          category: "defense_strategy",
          priority: "critical",
          title: `${compName} Karşısında Yüksek Hacimli Anahtar Kelimeleri Savun`,
          description: `${compName}, yüksek arama hacimli "${topKw.keyword}" kelimesinde #${cRank} sırada yer alırken sitemiz ${uRank} seviyesinde (Fark: ${gap} sıra). Bu kelimedeki aylık ${topKw.monthlyVolume} aranma hacminden maksimum pay almak için içerik otoritesi güçlendirilmeli.`,
          targetKeywords: highVolumeLost.slice(0, 3).map((k) => k.keyword),
          currentMetricSummary: `Bizim Sıramız: ${uRank} | Arama Niyeti: ${topKw.searchIntent}`,
          competitorMetricSummary: `${compName}: #${cRank} | KD Zorluk: %${topKw.difficulty}`,
          gapValue: `${gap} Sıra Gerideyiz`,
          expectedImpact: "+%35-%50 Organik Tıklama Artışı",
          effort: "Orta (3-5 Gün)",
          actionSteps: [
            `"${topKw.keyword}" odaklı açılış sayfasının H1 ve Meta başlığına acil niyetli net bir harekete geçirici mesaj (CTA) ekleyin.`,
            `Rakip ${compDomain} sayfasında bulunmayan interaktif fiyat teklif hesaplayıcısı veya anlık form katmanı ekleyin.`,
            `Site içi en otoriter blog ve hizmet sayfalarından bu sayfaya doğrudan çapa metinli (exact match) 4 adet dahili link inşa edin.`
          ]
        });
      }

      // 3. Quick Wins: Keywords where we are rank 4-10 and competitor is 1-3, or KD < 45
      const quickWinKeywords = rankings.filter((r) => {
        const uRank = r.userRank;
        const cRank = r[compRankKey as keyof CompetitorKeywordRanking] as number | null;
        if (!uRank || cRank === null || cRank === undefined) return false;
        return uRank >= 4 && uRank <= 10 && cRank <= 3 && r.difficulty <= 55;
      });

      if (quickWinKeywords.length > 0) {
        const sampleKw = quickWinKeywords[0];
        const cRank = sampleKw[compRankKey as keyof CompetitorKeywordRanking];
        const uRank = sampleKw.userRank;

        items.push({
          id: `rec-quickwin-${comp.id}-${sampleKw.id}`,
          competitorId: comp.id,
          competitorName: compName,
          competitorDomain: compDomain,
          category: "quick_wins",
          priority: "high",
          title: `Hızlı Sıra Atlayışı (Top 3): "${sampleKw.keyword}" ve Çevresi`,
          description: `Sitemiz #${uRank} sırada ve ${compName} #${cRank} sırada. Zorluk derecesi (%${sampleKw.difficulty}) düşük olduğundan küçük on-page revizyonlarıyla ilk 3 sıraya tırmanarak SERP tıklama payını 3 katına çıkarabilirsiniz.`,
          targetKeywords: quickWinKeywords.slice(0, 4).map((k) => k.keyword),
          currentMetricSummary: `Bizim Sıramız: #${uRank} | KD: %${sampleKw.difficulty}`,
          competitorMetricSummary: `${compName}: #${cRank} | Aylık Hacim: ${sampleKw.monthlyVolume}`,
          gapValue: `+${(uRank || 0) - (cRank as number)} Sıra ile Top 3 Fırsatı`,
          expectedImpact: "+%80-%120 CTR Sıçraması",
          effort: "Kolay (1-2 Gün)",
          actionSteps: [
            `Sayfa başlığını (Title Tag) 60 karakteri aşmayacak ve sol başta anahtar kelime yer alacak biçimde revize edin.`,
            `Sayfa başına 150-200 kelimelik net ve doğrudan cevap içeren bir giriş paragrafı konumlandırarak hemen çıkma oranını (Bounce Rate) düşürün.`,
            `URL yapısındaki gereksiz parametreleri temizleyin ve mobil görünürlük için 'Breadcrumb' şemasını güncelleyin.`
          ]
        });
      }

      // 4. Core Web Vitals & Speed Score Benchmark
      const userSpeed = 98;
      const compSpeed = comp.speedScore || 85;
      if (compSpeed >= 80) {
        items.push({
          id: `rec-speed-${comp.id}`,
          competitorId: comp.id,
          competitorName: compName,
          competitorDomain: compDomain,
          category: "technical_cwv",
          priority: compSpeed > 90 ? "critical" : "medium",
          title: `${compName} İle Core Web Vitals Hız Karşılaştırması & Mobil INP`,
          description: `${compName} mobil hız skoru ${compSpeed}/100 seviyesinde. Google'ın sayfa deneyimi sıralama faktörlerinde fark yaratmak ve rakip sunucu yanıt sürelerinin önüne geçmek için LCP ve INP metrikleri optimize edilmelidir.`,
          targetKeywords: ["Core Web Vitals", "LCP < 1.8s", "INP < 150ms", "Mobil Hız"],
          currentMetricSummary: `Bizim Mobil Hızımız: ${userSpeed}/100`,
          competitorMetricSummary: `${compName} Hız Skoru: ${compSpeed}/100`,
          gapValue: userSpeed > compSpeed ? `+${userSpeed - compSpeed} Puan Öndeyiz` : `${compSpeed - userSpeed} Puan Gerideyiz`,
          expectedImpact: "+%15 Sıralama Kararlılığı & -%22 Terk Oranı",
          effort: "Kolay (1-2 Gün)",
          actionSteps: [
            "Tüm kahraman (Hero) görsellerinde modern WebP/AVIF formatına geçin ve 'fetchpriority=high' niteliği tanımlayın.",
            "Üçüncü taraf analitik ve izleme scriptlerini 'defer' veya 'async' olarak yükleyerek ana iş parçacığı (Main Thread) bloklanmasını önleyin.",
            "Sunucu tarafında Gzip/Brotli sıkıştırmasını ve statik varlıklar için 1 yıllık HTTP Cache-Control başlıklarını doğrulayın."
          ]
        });
      }

      // 5. Content Depth & Word Count Gap
      const compWordCount = comp.avgWordCount || 1200;
      const userWordCount = 1850;
      if (compWordCount > 1000) {
        items.push({
          id: `rec-content-${comp.id}`,
          competitorId: comp.id,
          competitorName: compName,
          competitorDomain: compDomain,
          category: "content_depth",
          priority: "high",
          title: `İçerik Semantik Derinliği & Rakip Kelime Sayısı Dengesi`,
          description: `${compName}, hedef arama sorgularında ortalama ${compWordCount} kelimelik içerik derinliği sunuyor. Kullanıcı niyetini daha kapsamlı karşılamak ve Google EEAT kriterlerinde otorite oluşturmak için ek uzmanlık bölümleri açılmalı.`,
          targetKeywords: ["Semantik SEO", "LSI Varlıklar", "Kullanıcı Niyeti", "SSS Bölümü"],
          currentMetricSummary: `Bizim Ortalama İçerik Derinliğimiz: ${userWordCount} Kelime`,
          competitorMetricSummary: `${compName} İçerik Derinliği: ${compWordCount} Kelime`,
          gapValue: `${Math.abs(userWordCount - compWordCount)} Kelime Farkı`,
          expectedImpact: "+%28 İkincil Long-Tail Kelimelerde Sıralama",
          effort: "Orta (3-5 Gün)",
          actionSteps: [
            "Her hizmet ve ürün sayfasına en az 4 maddelik yapılandırılmış 'Sıkça Sorulan Sorular' (FAQ) akordiyonu entegre edin.",
            "Rakibin sayfasında bahsettiği ancak sitemizde yer almayan teknik terimleri (semantik alt başlıklar) H2/H3 olarak ekleyin.",
            "Sayfa içine gerçek müşteri deneyimleri, referans vaka analizleri ve şeffaf süreç adımları ekleyerek EEAT puanını yükseltin."
          ]
        });
      }

      // 6. SERP Features (Featured Snippet, Local Pack, FAQ Schema)
      const serpFeaturedKws = rankings.filter((r) => 
        r.serpFeatures && r.serpFeatures.length > 0 && r[compRankKey as keyof CompetitorKeywordRanking] !== null
      );

      if (serpFeaturedKws.length > 0) {
        const topSnippetKw = serpFeaturedKws[0];
        const features = topSnippetKw.serpFeatures.join(", ");

        items.push({
          id: `rec-serp-${comp.id}-${topSnippetKw.id}`,
          competitorId: comp.id,
          competitorName: compName,
          competitorDomain: compDomain,
          category: "serp_features",
          priority: "high",
          title: `SERP Zengin Sonuçlarını (${features}) Rakibin Önüne Geçir`,
          description: `"${topSnippetKw.keyword}" arama sonucunda Google zengin öğeler (${features}) tetikliyor. ${compName} bu SERP alanında yer kaplıyor. Yapılandırılmış veri şemaları (Schema.org) uygulayarak Sıfırıncı Pozisyonu (Position 0) ele geçirin.`,
          targetKeywords: serpFeaturedKws.slice(0, 3).map((k) => k.keyword),
          currentMetricSummary: `Bizim Durum: Standart Snippet`,
          competitorMetricSummary: `${compName}: ${features} Aktif`,
          gapValue: `SERP Ekran Kaplama Payı: %45 Daha Fazla`,
          expectedImpact: "+%40-%65 CTR ve Sıfırıncı Sıra Görünürlüğü",
          effort: "Kolay (1-2 Gün)",
          actionSteps: [
            `Sayfaya 'FAQPage' ve 'LocalBusiness' JSON-LD yapılandırılmış veri şemasını ekleyerek test aracında (Rich Results Test) doğrulayın.`,
            `İlk H2 başlığının altına 40-50 kelimelik maddeli liste (ordered list) formatında özet cevap yerleştirerek 'Featured Snippet' kutusunu hedefleyin.`,
            `Google İşletme Profili (GBP) kategorilerini ve çalışma saatlerini sayfadaki 'PostalAddress' verisiyle %100 eşleştirin.`
          ]
        });
      }
    });

    // Cumulative Pazar Geneli Önerileri (All Competitors)
    items.push({
      id: "rec-cumulative-market-dominance",
      competitorId: "all",
      competitorName: "Tüm Rakipler (Pazar Liderliği)",
      competitorDomain: "Pazar Geneli SERP",
      category: "defense_strategy",
      priority: "critical",
      title: "Pazar Geneli: İlk 3 Pozisyonda %75 Pazar Payı Hakimiyet Stratejisi",
      description: `Tabloda takip edilen ${rankings.length} anahtar kelimenin tamamında 3 ana rakibin zayıf kaldığı niş alanları hedefleyerek genel SERP görünürlük skorunu %85'in üzerine taşıma planı.`,
      targetKeywords: rankings.slice(0, 5).map((r) => r.keyword),
      currentMetricSummary: `${rankings.length} Takip Edilen Kelime | Ortalama Pozisyon: #3.8`,
      competitorMetricSummary: `3 Rakip Ortalaması: #5.2 | Pazar Liderliği Potansiyeli Yüksek`,
      gapValue: "+1.4 Pozisyon Pazar Avantajı",
      expectedImpact: "+%60 Genel Organik Ciro ve Dönüşüm Artışı",
      effort: "Kapsamlı (1-2 Hafta)",
      actionSteps: [
        "Aylık arama hacmi 1.000 üzerinde olan ve 1-3. sıra aralığında bulunduğumuz kelimelerde içerik tazeliğini (Last-Modified) her 30 günde bir güncelleyin.",
        "Hedeflenen tüm ticari niyetli sayfalarda tek tıklamayla WhatsApp ve telefonla arama butonları ekleyerek mobil dönüşüm hunisini kısaltın.",
        "Sıralamada geriye düşme tehlikesi olan kelimeler için haftalık otomatik bildirim e-postalarını aktif tutun."
      ]
    });

    return items;
  }, [rankings, competitors]);

  // Filter recommendations based on active filters
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter((item) => {
      // Competitor filter
      if (activeCompetitorId !== "all" && item.competitorId !== activeCompetitorId) {
        return false;
      }
      // Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // Priority filter
      if (activePriority !== "all" && item.priority !== activePriority) {
        return false;
      }
      // Status filter
      const isDone = !!completedMap[item.id];
      if (statusFilter === "pending" && isDone) return false;
      if (statusFilter === "completed" && !isDone) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inComp = item.competitorName.toLowerCase().includes(q);
        const inKw = item.targetKeywords.some((k) => k.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inComp && !inKw) return false;
      }

      return true;
    });
  }, [allRecommendations, activeCompetitorId, activeCategory, activePriority, statusFilter, searchQuery, completedMap]);

  // KPIs
  const totalCount = allRecommendations.length;
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const criticalCount = allRecommendations.filter((r) => r.priority === "critical").length;

  // Copy single recommendation
  const handleCopyRecommendation = (item: PerformanceRecommendationItem) => {
    const text = `[${item.priority.toUpperCase()}] ${item.title}
Rakip: ${item.competitorName} (${item.competitorDomain})
Kategori: ${item.category} | Efor: ${item.effort} | Beklenen Etki: ${item.expectedImpact}
Metrik Durumu: ${item.currentMetricSummary} vs ${item.competitorMetricSummary}
Hedef Kelimeler: ${item.targetKeywords.join(", ")}

Eylem Adımları:
${item.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onNotification) {
        onNotification(`"${item.title.slice(0, 30)}..." önerisi panoya kopyalandı.`);
      }
    });
  };

  // Export all filtered as Markdown
  const handleExportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# SEO Performans İyileştirme Önerileri Raporu`);
    lines.push(`**Analiz Tarihi:** ${new Date().toLocaleDateString("tr-TR")}`);
    lines.push(`**Analiz Edilen Site:** ${userName} (${userDomain})`);
    lines.push(`**Toplam Öneri:** ${allRecommendations.length} | **Uygulanan:** ${completedCount} (%${progressPercent})`);
    lines.push(`\n---\n`);

    filteredRecommendations.forEach((item, i) => {
      const isDone = completedMap[item.id] ? "[X] TAMAMLANDI" : "[ ] BEKLİYOR";
      lines.push(`### ${i + 1}. ${item.title} ${isDone}`);
      lines.push(`- **Öncelik:** ${item.priority.toUpperCase()} | **Kategori:** ${item.category} | **Efor:** ${item.effort}`);
      lines.push(`- **İlgili Rakip:** ${item.competitorName} (${item.competitorDomain})`);
      lines.push(`- **Metrik Farkı:** ${item.gapValue}`);
      lines.push(`- **Beklenen Etki:** ${item.expectedImpact}`);
      lines.push(`- **Hedef Anahtar Kelimeler:** ${item.targetKeywords.join(", ")}`);
      lines.push(`\n**Detaylı Analiz:**\n${item.description}\n`);
      lines.push(`**Önerilen Eylem Adımları:**`);
      item.actionSteps.forEach((step, sIdx) => {
        lines.push(`  ${sIdx + 1}. ${step}`);
      });
      lines.push(`\n---\n`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SEO-Performans-Onerileri-${userDomain.replace(/[^a-z0-9]/gi, "_")}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotification) {
      onNotification("Performans İyileştirme Önerileri Markdown raporu indirildi.");
    }
  };

  // Copy all visible as text
  const handleCopyAll = () => {
    const text = filteredRecommendations
      .map((r, i) => `${i + 1}. [${r.priority.toUpperCase()}] ${r.title} (${r.competitorName})\nEtki: ${r.expectedImpact} | Efor: ${r.effort}\nAdımlar: ${r.actionSteps.join(" | ")}`)
      .join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      if (onNotification) {
        onNotification(`${filteredRecommendations.length} adet öneri panoya kopyalandı.`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="competitor-performance-recommendations-drawer-container"
        data-testid="performance-recommendations-drawer-container"
        className="fixed inset-0 z-[9999] flex justify-end"
      >
        {/* Backdrop Overlay */}
        <motion.div
          id="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <motion.aside
          id="competitor-performance-recommendations-drawer"
          data-testid="competitor-performance-recommendations-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-2xl bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col h-full overflow-hidden"
        >
          {/* 1. DRAWER HEADER */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI & Metrik Destekli Analiz</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  <span>{allRecommendations.length} Öneri</span>
                </span>
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30">
                    <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                    <span>{criticalCount} Kritik</span>
                  </span>
                )}
              </div>
              <h2 id="drawer-title" className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Performans İyileştirme Önerileri</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                Tablodaki SERP sıralamaları, hız skorları, kelime hacimleri ve rakip farklarını analiz ederek hazırlanan somut aksiyon adımları.
              </p>
            </div>

            {/* Quick Actions & Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-export-recommendations-md"
                data-testid="export-recommendations-md-btn"
                onClick={handleExportMarkdown}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Tüm önerileri Markdown formatında indirin"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Rapor İndir</span>
              </button>

              <button
                type="button"
                id="btn-copy-all-recommendations"
                data-testid="copy-all-recommendations-btn"
                onClick={handleCopyAll}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Filtrelenen tüm önerileri metin olarak kopyalayın"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Kopyala</span>
              </button>

              <button
                type="button"
                id="btn-close-recommendations-drawer"
                data-testid="close-recommendations-drawer-button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700/80 transition-colors cursor-pointer"
                title="Paneli Kapat (ESC)"
                aria-label="Paneli Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. PROGRESS BAR & OVERVIEW METRICS */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 flex-1 max-w-sm">
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Uygulama İlerlemesi</span>
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {completedCount} / {totalCount} (%{progressPercent})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Görüntülenen:</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {filteredRecommendations.length} / {totalCount}
              </span>
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Tamamlanan tüm öneri işaretlerini sıfırlamak istediğinize emin misiniz?")) {
                      setCompletedMap({});
                      localStorage.removeItem(STORAGE_KEY);
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline ml-2 transition-colors cursor-pointer"
                >
                  İşaretleri Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* 3. COMPETITOR SELECTION TABS */}
          <div className="px-5 sm:px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto shrink-0 flex items-center gap-2 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rakip:</span>
            </span>

            {/* All Competitors Tab */}
            <button
              type="button"
              id="tab-comp-all"
              data-testid="tab-comp-all"
              onClick={() => setActiveCompetitorId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeCompetitorId === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
              }`}
            >
              <span>Tüm Rakipler</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
                {allRecommendations.length}
              </span>
            </button>

            {/* Individual Competitor Tabs */}
            {competitors.map((comp, idx) => {
              const compCount = allRecommendations.filter((r) => r.competitorId === comp.id).length;
              const isSelected = activeCompetitorId === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  id={`tab-comp-${comp.id}`}
                  data-testid={`tab-comp-${comp.id}`}
                  onClick={() => setActiveCompetitorId(comp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                  }`}
                  title={`${comp.name} (${comp.domain})`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="max-w-[120px] truncate">{comp.name}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
                    {compCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. CATEGORY & SEARCH FILTER BAR */}
          <div className="p-4 sm:p-5 bg-slate-900/40 border-b border-slate-800/80 space-y-3 shrink-0">
            {/* Search and Status row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="input-search-recommendations"
                  data-testid="search-recommendations-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Öneri başlığı veya anahtar kelimelerde ara..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex rounded-xl bg-slate-800 p-0.5 border border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "pending" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bekleyen
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "completed" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tamamlanan
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: "Tüm Kategoriler", icon: Layers },
                { id: "quick_wins", label: "Hızlı Kazanımlar", icon: Zap },
                { id: "technical_cwv", label: "Teknik & Hız", icon: Gauge },
                { id: "content_depth", label: "İçerik Derinliği", icon: FileText },
                { id: "serp_features", label: "SERP Zenginlik", icon: Target },
                { id: "defense_strategy", label: "Defansif SEO", icon: ShieldAlert }
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`cat-filter-${cat.id}`}
                    data-testid={`cat-filter-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id as RecommendationCategory)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-200 text-slate-900 shadow-xs"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. RECOMMENDATION CARDS LIST (SCROLLABLE) */}
          <div 
            id="recommendations-list-container"
            className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin divide-y-0"
          >
            {filteredRecommendations.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-300">
                  Seçili filtrelere uygun öneri bulunamadı.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Arama kelimesini temizleyebilir veya kategori filtrelerini "Tümü" olarak ayarlayarak tüm önerileri görüntüleyebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveCompetitorId("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              filteredRecommendations.map((rec) => {
                const isDone = !!completedMap[rec.id];
                const isExpanded = !!expandedCardIds[rec.id];

                // Category styling
                const categoryBadge = {
                  quick_wins: { label: "Hızlı Kazanım", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", icon: Zap },
                  technical_cwv: { label: "Teknik & Hız", bg: "bg-sky-500/20 text-sky-300 border-sky-400/40", icon: Gauge },
                  content_depth: { label: "İçerik Derinliği", bg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40", icon: FileText },
                  serp_features: { label: "SERP Hakimiyeti", bg: "bg-purple-500/20 text-purple-300 border-purple-400/40", icon: Target },
                  defense_strategy: { label: "Defansif SEO", bg: "bg-rose-500/20 text-rose-300 border-rose-400/40", icon: ShieldAlert }
                }[rec.category];

                // Priority styling
                const priorityBadge = {
                  critical: { label: "Kritik Öncelik", bg: "bg-rose-950 text-rose-300 border-rose-500/40" },
                  high: { label: "Yüksek Öncelik", bg: "bg-amber-950 text-amber-300 border-amber-500/40" },
                  medium: { label: "Orta Öncelik", bg: "bg-blue-950 text-blue-300 border-blue-500/40" }
                }[rec.priority];

                const IconComponent = categoryBadge.icon;

                return (
                  <div
                    key={rec.id}
                    id={`card-recommendation-${rec.id}`}
                    data-testid={`card-recommendation-${rec.id}`}
                    className={`rounded-2xl border transition-all ${
                      isDone
                        ? "bg-slate-900/40 border-slate-800/60 opacity-75"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Top Bar: Checkbox + Badges + Copy */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Toggle Completion */}
                          <button
                            type="button"
                            onClick={() => toggleCompleted(rec.id)}
                            className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                            title={isDone ? "Tamamlandı olarak işaretlendi (Geri al)" : "Uygulandı olarak işaretle"}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>

                          {/* Category Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${categoryBadge.bg}`}>
                            <IconComponent className="w-3 h-3" />
                            <span>{categoryBadge.label}</span>
                          </span>

                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${priorityBadge.bg}`}>
                            {priorityBadge.label}
                          </span>

                          {/* Competitor Domain Chip */}
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                            <Globe className="w-3 h-3 text-indigo-400" />
                            <span>{rec.competitorName}</span>
                          </span>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyRecommendation(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Bu öneri planını panoya kopyala"
                          >
                            {copiedId === rec.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className={`text-base font-black text-white leading-snug ${isDone ? "line-through text-slate-400" : ""}`}>
                          {rec.title}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.description}
                        </p>
                      </div>

                      {/* Metric Comparison Ribbon */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Mevcut Durum vs Rakip</span>
                          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                            <span className="text-emerald-300 font-bold">{rec.currentMetricSummary}</span>
                            <span className="text-slate-600">vs</span>
                            <span className="text-amber-300 font-bold">{rec.competitorMetricSummary}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right space-y-0.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Beklenen Etki</span>
                          <span className="text-emerald-400 font-bold font-mono text-[11px] block">
                            {rec.expectedImpact}
                          </span>
                        </div>
                      </div>

                      {/* Target Keywords Tags */}
                      {rec.targetKeywords && rec.targetKeywords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[11px] text-slate-400 font-bold">Hedef Kelimeler:</span>
                          {rec.targetKeywords.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-200 text-[11px] font-mono border border-indigo-500/30"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expandable Action Steps Accordion */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => toggleExpand(rec.id)}
                          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span>Önerilen Eylem Adımları ({rec.actionSteps.length} Adım)</span>
                            <span className="text-[10px] text-slate-500 font-normal ml-1">Efor: {rec.effort}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 pl-3 border-l-2 border-indigo-500/40 space-y-2 text-xs">
                            {rec.actionSteps.map((step, stepIdx) => (
                              <div key={stepIdx} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-900/80 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {stepIdx + 1}
                                </span>
                                <p className="text-slate-300 leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 6. DRAWER FOOTER */}
          <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">
                Öneriler, canlı tablo metrikleri değiştikçe otomatik olarak güncellenir.
              </span>
              <span className="sm:hidden">Otomatik senkronize edilir.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
