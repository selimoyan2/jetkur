import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  ServiceItem, 
  ProductItem, 
  BlogPostItem, 
  CustomPageItem 
} from "../../types";
import { 
  INITIAL_HEATMAP_DATA, 
  CONTENT_CLUSTERS, 
  RANKING_TIERS, 
  SeoHeatmapCellData 
} from "./PredictiveSeoHeatmap";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  Check, 
  Search, 
  Filter, 
  Layers, 
  ExternalLink, 
  Globe, 
  FileText, 
  ChevronRight, 
  Eye, 
  Edit3, 
  X, 
  ArrowUpRight, 
  Flame, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Award, 
  ThumbsUp,
  MapPin,
  HelpCircle,
  Copy,
  Plus,
  Bell,
  BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SeoProgressNotificationSystem } from "./SeoProgressNotificationSystem";
import {
  DEFAULT_SEO_PROGRESS_CONFIG,
  generateSeoProgressLog,
  generateBatchSeoProgressLog
} from "../../utils/seoProgressTracker";

export interface PageSeoAuditItem {
  id: string;
  type: "home" | "service" | "product" | "blog" | "page" | "regional";
  typeLabel: string;
  title: string;
  slug: string;
  url: string;

  // H1 Status
  currentH1: string;
  isH1Missing: boolean;
  isH1Weak: boolean;
  h1CharCount: number;

  // Meta Description Status
  currentMetaDescription: string;
  isMetaMissing: boolean;
  isMetaTooShort: boolean;
  isMetaTooLong: boolean;
  metaCharCount: number;

  // Heatmap Association
  clusterId: string;
  clusterName: string;
  tierId: "quick-wins" | "rising" | "high-volume" | "untapped";
  tierLabel: string;
  roiScore: number;
  targetKeywords: string[];
  projectedTrafficBoost: number;
  projectedRevenueBoost: number;

  // Optimized Suggestions
  suggestedH1: string;
  suggestedMetaDescription: string;
  suggestedKeywords: string;
  optimizationReason: string;

  // State
  isOptimized: boolean;
}

interface SeoRemediationPanelProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  initialClusterFilter?: string;
  onOpenPreview?: () => void;
}

export const SeoRemediationPanel: React.FC<SeoRemediationPanelProps> = ({
  config,
  onChange,
  onNavigateTab,
  initialClusterFilter = "all",
  onOpenPreview
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "critical" | "h1-missing" | "meta-missing" | "quick-wins" | "optimized">("all");
  const [clusterFilter, setClusterFilter] = useState<string>(initialClusterFilter);
  
  // Quick Edit Modal
  const [editingItem, setEditingItem] = useState<PageSeoAuditItem | null>(null);
  const [editH1, setEditH1] = useState("");
  const [editMeta, setEditMeta] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  // UI state
  const [panelViewMode, setPanelViewMode] = useState<"remediation" | "progress-notifications">("remediation");
  const [isBatchOptimizing, setIsBatchOptimizing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showAddRegionalModal, setShowAddRegionalModal] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("Kadıköy");

  const unreadNotifCount = useMemo(() => {
    const notifs = config.seoProgressNotifications || DEFAULT_SEO_PROGRESS_CONFIG;
    return notifs.logs?.filter(l => !l.isRead).length || 0;
  }, [config.seoProgressNotifications]);

  const companyName = config.companyName || "HızlıWeb İşletmesi";
  const sector = config.sector || "Oto Çekici & Kurtarıcı";
  const city = config.city || "İstanbul";
  const siteDomain = config.cloudflare?.customDomain || `${config.cloudflare?.subdomain || 'site'}.hizliweb.site`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to find relevant heatmap cell
  const findHeatmapCell = (clusterId: string, preferredTier: string = "quick-wins") => {
    const found = INITIAL_HEATMAP_DATA.find(d => d.clusterId === clusterId && d.tierId === preferredTier);
    if (found) return found;
    return INITIAL_HEATMAP_DATA.find(d => d.clusterId === clusterId) || INITIAL_HEATMAP_DATA[0];
  };

  // Build the complete audit item list from SiteConfig
  const auditItems: PageSeoAuditItem[] = useMemo(() => {
    const list: PageSeoAuditItem[] = [];

    // 1. Homepage (Ana Sayfa)
    const homeCell = findHeatmapCell("core-services", "quick-wins");
    const homeH1 = config.hero?.title?.trim() || "";
    const homeMeta = config.seo?.metaDescription?.trim() || "";
    const isHomeH1Missing = !homeH1;
    const isHomeH1Weak = homeH1.length < 15 || (!homeH1.toLowerCase().includes(city.toLowerCase()) && !homeH1.toLowerCase().includes(sector.toLowerCase()));
    const isHomeMetaMissing = !homeMeta;
    const isHomeMetaTooShort = homeMeta.length > 0 && homeMeta.length < 80;
    const isHomeMetaTooLong = homeMeta.length > 165;
    const isHomeOptimized = !isHomeH1Missing && !isHomeH1Weak && !isHomeMetaMissing && !isHomeMetaTooShort && !isHomeMetaTooLong;

    const suggestedHomeH1 = `${companyName} - ${city} 7/24 ${sector} & Hızlı Servis`;
    const suggestedHomeMeta = `${city} genelinde 7/24 ${sector.toLowerCase()} ve yol yardım hizmeti. ${companyName} ile 15 dakikada anında konumunuza ulaşım ve sabit fiyat garantisi. Hemen arayın!`;
    const suggestedHomeKws = `${city} ${sector.toLowerCase()}, en yakın çekici, 7 24 oto kurtarıcı, ${companyName}`;

    list.push({
      id: "page-home",
      type: "home",
      typeLabel: "Ana Sayfa",
      title: "Ana Sayfa (Açılış)",
      slug: "/",
      url: `https://${siteDomain}/`,
      currentH1: homeH1 || "<H1 Etiketi Tanımlanmamış>",
      isH1Missing: isHomeH1Missing,
      isH1Weak: isHomeH1Weak,
      h1CharCount: homeH1.length,
      currentMetaDescription: homeMeta || "<Meta Açıklaması Boş>",
      isMetaMissing: isHomeMetaMissing,
      isMetaTooShort: isHomeMetaTooShort,
      isMetaTooLong: isHomeMetaTooLong,
      metaCharCount: homeMeta.length,
      clusterId: "core-services",
      clusterName: "Ana Hizmet Sayfaları & Çekici Türleri",
      tierId: "quick-wins",
      tierLabel: "Hızlı Zaferler (#4 - #10)",
      roiScore: homeCell.roiScore,
      targetKeywords: homeCell.topKeywords.map(k => k.term),
      projectedTrafficBoost: homeCell.projectedTrafficGrowth,
      projectedRevenueBoost: homeCell.projectedRevenueTl,
      suggestedH1: suggestedHomeH1,
      suggestedMetaDescription: suggestedHomeMeta,
      suggestedKeywords: suggestedHomeKws,
      optimizationReason: "Ana sayfa H1 etiketinde lokasyon ve sektör anahtar kelimeleri bulunmalıdır. Meta açıklaması 130-155 karakter aralığında tıklama tetikleyici içermelidir.",
      isOptimized: isHomeOptimized
    });

    // 2. Services (Hizmetler)
    if (config.services?.items && config.services.items.length > 0) {
      config.services.items.forEach((srv) => {
        // Correlate with cluster: check title
        let clusterId = "core-services";
        if (srv.title.toLowerCase().includes("fiyat") || srv.title.toLowerCase().includes("ücret") || srv.title.toLowerCase().includes("tarife")) {
          clusterId = "pricing-hub";
        } else if (srv.title.toLowerCase().includes("filo") || srv.title.toLowerCase().includes("kurumsal") || srv.title.toLowerCase().includes("galeri")) {
          clusterId = "b2b-fleet";
        } else if (srv.title.toLowerCase().includes("kadıköy") || srv.title.toLowerCase().includes("beşiktaş") || srv.title.toLowerCase().includes("bölge")) {
          clusterId = "local-landing";
        }

        const cell = findHeatmapCell(clusterId, "quick-wins");
        const currentH1 = srv.title?.trim() || "";
        const currentMeta = srv.seoDescription?.trim() || srv.desc?.trim() || "";
        const isH1Missing = !currentH1;
        const isH1Weak = currentH1.length < 10 || !currentH1.toLowerCase().includes(city.toLowerCase());
        const isMetaMissing = !srv.seoDescription?.trim();
        const isMetaTooShort = currentMeta.length > 0 && currentMeta.length < 75;
        const isMetaTooLong = currentMeta.length > 165;
        const isOptimized = !isH1Missing && !isH1Weak && !isMetaMissing && !isMetaTooShort && !isMetaTooLong;

        const cleanTitle = srv.title.replace(/\s*-\s*.*$/, "");
        const suggestedH1 = `${cleanTitle} - ${city} 7/24 Profesyonel Hizmet`;
        const suggestedMeta = `${city} ${cleanTitle.toLowerCase()} hizmeti: ${srv.desc ? srv.desc.slice(0, 65) : "Modern araç filosu ve uzman ekip"}. 15 dakikada hızlı servis ve uygun fiyat avantajı için tıklayın!`;
        const suggestedKws = `${cleanTitle.toLowerCase()}, ${city} ${cleanTitle.toLowerCase()}, acil ${cleanTitle.toLowerCase()}, ${companyName}`;

        list.push({
          id: `service-${srv.id}`,
          type: "service",
          typeLabel: "Hizmet Sayfası",
          title: srv.title,
          slug: `/hizmetler/${srv.slug || srv.id}`,
          url: `https://${siteDomain}/hizmetler/${srv.slug || srv.id}`,
          currentH1: currentH1 || "<H1 Etiketi Yok>",
          isH1Missing,
          isH1Weak,
          h1CharCount: currentH1.length,
          currentMetaDescription: currentMeta || "<Meta Açıklaması Boş>",
          isMetaMissing,
          isMetaTooShort,
          isMetaTooLong,
          metaCharCount: currentMeta.length,
          clusterId,
          clusterName: cell.clusterName,
          tierId: cell.tierId,
          tierLabel: cell.tierId === "quick-wins" ? "Hızlı Zaferler (#4 - #10)" : "Yükseliş Adayı (#11 - #20)",
          roiScore: cell.roiScore,
          targetKeywords: cell.topKeywords.slice(0, 3).map(k => k.term),
          projectedTrafficBoost: Math.round(cell.projectedTrafficGrowth / Math.max(1, config.services.items.length)),
          projectedRevenueBoost: Math.round(cell.projectedRevenueTl / Math.max(1, config.services.items.length)),
          suggestedH1,
          suggestedMetaDescription: suggestedMeta,
          suggestedKeywords: suggestedKws,
          optimizationReason: `Hizmet sayfalarında H1'e ${city} lokasyonu ve 7/24 güvencesi eklenerek arama hacmi yüksek yerel SERP hedeflenir.`,
          isOptimized
        });
      });
    }

    // 3. Products (Varsa Ürünler)
    if (config.products?.items && config.products.items.length > 0) {
      config.products.items.forEach((prd) => {
        const cell = findHeatmapCell("pricing-hub", "rising");
        const currentH1 = prd.title?.trim() || "";
        const currentMeta = prd.seoDescription?.trim() || prd.shortDescription?.trim() || "";
        const isH1Missing = !currentH1;
        const isH1Weak = currentH1.length < 8;
        const isMetaMissing = !prd.seoDescription?.trim();
        const isMetaTooShort = currentMeta.length > 0 && currentMeta.length < 70;
        const isMetaTooLong = currentMeta.length > 165;
        const isOptimized = !isH1Missing && !isH1Weak && !isMetaMissing && !isMetaTooShort && !isMetaTooLong;

        const suggestedH1 = `${prd.title} - En Uygun Fiyat & Hızlı Teslimat`;
        const suggestedMeta = `${prd.title} avantajlı fiyatı ${prd.price ? `(${prd.price})` : ""} ve orijinal kalite garantisiyle ${companyName}'da. Detaylı bilgi ve güvenli sipariş için hemen inceleyin.`;
        const suggestedKws = `${prd.title.toLowerCase()}, ${prd.title.toLowerCase()} fiyatı, ${companyName}`;

        list.push({
          id: `product-${prd.id}`,
          type: "product",
          typeLabel: "Ürün Sayfası",
          title: prd.title,
          slug: `/urunler/${prd.slug || prd.id}`,
          url: `https://${siteDomain}/urunler/${prd.slug || prd.id}`,
          currentH1: currentH1 || "<H1 Etiketi Yok>",
          isH1Missing,
          isH1Weak,
          h1CharCount: currentH1.length,
          currentMetaDescription: currentMeta || "<Meta Açıklaması Boş>",
          isMetaMissing,
          isMetaTooShort,
          isMetaTooLong,
          metaCharCount: currentMeta.length,
          clusterId: "pricing-hub",
          clusterName: "Fiyat & Maliyet Hesaplayıcıları",
          tierId: "rising",
          tierLabel: "Yükseliş Adayı (#11 - #20)",
          roiScore: cell.roiScore,
          targetKeywords: cell.topKeywords.slice(0, 3).map(k => k.term),
          projectedTrafficBoost: Math.round(cell.projectedTrafficGrowth / Math.max(1, config.products.items.length)),
          projectedRevenueBoost: Math.round(cell.projectedRevenueTl / Math.max(1, config.products.items.length)),
          suggestedH1,
          suggestedMetaDescription: suggestedMeta,
          suggestedKeywords: suggestedKws,
          optimizationReason: "Ürün ve fiyat odaklı aramalarda Google Rich Snippet fiyat bilgisi ve harekete geçirici mesaj eklenmelidir.",
          isOptimized
        });
      });
    }

    // 4. Blog / Guides (Blog Yazıları)
    if (config.blog?.items && config.blog.items.length > 0) {
      config.blog.items.forEach((post) => {
        const cell = findHeatmapCell("emergency-guides", "quick-wins");
        const currentH1 = post.title?.trim() || "";
        const currentMeta = post.seoDescription?.trim() || post.excerpt?.trim() || "";
        const isH1Missing = !currentH1;
        const isH1Weak = currentH1.length < 12;
        const isMetaMissing = !post.seoDescription?.trim();
        const isMetaTooShort = currentMeta.length > 0 && currentMeta.length < 75;
        const isMetaTooLong = currentMeta.length > 165;
        const isOptimized = !isH1Missing && !isH1Weak && !isMetaMissing && !isMetaTooShort && !isMetaTooLong;

        const suggestedH1 = `${post.title} | ${sector} Uzman Rehberi`;
        const suggestedMeta = `${post.title} hakkında bilmeniz gereken tüm kritik detaylar, uzman tavsiyeleri ve pratik ipuçları. Detaylı kılavuzumuzu hemen inceleyin!`;
        const suggestedKws = `${post.title.toLowerCase()}, ${sector.toLowerCase()} rehberi, ${city}`;

        list.push({
          id: `blog-${post.id}`,
          type: "blog",
          typeLabel: "Blog / Rehber",
          title: post.title,
          slug: `/blog/${post.slug || post.id}`,
          url: `https://${siteDomain}/blog/${post.slug || post.id}`,
          currentH1: currentH1 || "<H1 Etiketi Yok>",
          isH1Missing,
          isH1Weak,
          h1CharCount: currentH1.length,
          currentMetaDescription: currentMeta || "<Meta Açıklaması Boş>",
          isMetaMissing,
          isMetaTooShort,
          isMetaTooLong,
          metaCharCount: currentMeta.length,
          clusterId: "emergency-guides",
          clusterName: "Acil Durum & Sürücü Rehberleri",
          tierId: "quick-wins",
          tierLabel: "Hızlı Zaferler (#4 - #10)",
          roiScore: cell.roiScore,
          targetKeywords: cell.topKeywords.slice(0, 3).map(k => k.term),
          projectedTrafficBoost: Math.round(cell.projectedTrafficGrowth / Math.max(1, config.blog.items.length)),
          projectedRevenueBoost: Math.round(cell.projectedRevenueTl / Math.max(1, config.blog.items.length)),
          suggestedH1,
          suggestedMetaDescription: suggestedMeta,
          suggestedKeywords: suggestedKws,
          optimizationReason: "Bilgi arayan kullanıcıları cezbetmek için H1 etiketine 'Uzman Rehberi', meta açıklamasına soru-cevap formatı eklenmelidir.",
          isOptimized
        });
      });
    }

    // 5. Custom Pages (Özel Sayfalar)
    if (config.pages && config.pages.length > 0) {
      config.pages.forEach((pg) => {
        const cell = findHeatmapCell("core-services", "rising");
        const currentH1 = pg.title?.trim() || "";
        const currentMeta = pg.metaDescription?.trim() || "";
        const isH1Missing = !currentH1;
        const isH1Weak = currentH1.length < 8;
        const isMetaMissing = !currentMeta;
        const isMetaTooShort = currentMeta.length > 0 && currentMeta.length < 75;
        const isMetaTooLong = currentMeta.length > 165;
        const isOptimized = !isH1Missing && !isH1Weak && !isMetaMissing && !isMetaTooShort && !isMetaTooLong;

        const suggestedH1 = `${pg.title} | ${companyName} ${city}`;
        const suggestedMeta = `${companyName} ${pg.title.toLowerCase()} sayfası. ${city} bölgesinde güvenilir ${sector.toLowerCase()} hizmeti ve kurumsal bilgiler için tıklayın.`;
        const suggestedKws = `${pg.title.toLowerCase()}, ${companyName}, ${city} ${sector.toLowerCase()}`;

        list.push({
          id: `page-${pg.id}`,
          type: "page",
          typeLabel: "Özel Sayfa",
          title: pg.title,
          slug: `/${pg.slug || pg.id}`,
          url: `https://${siteDomain}/${pg.slug || pg.id}`,
          currentH1: currentH1 || "<H1 Etiketi Yok>",
          isH1Missing,
          isH1Weak,
          h1CharCount: currentH1.length,
          currentMetaDescription: currentMeta || "<Meta Açıklaması Boş>",
          isMetaMissing,
          isMetaTooShort,
          isMetaTooLong,
          metaCharCount: currentMeta.length,
          clusterId: "core-services",
          clusterName: "Ana Hizmet Sayfaları",
          tierId: "rising",
          tierLabel: "Yükseliş Adayı (#11 - #20)",
          roiScore: cell.roiScore,
          targetKeywords: cell.topKeywords.slice(0, 3).map(k => k.term),
          projectedTrafficBoost: 350,
          projectedRevenueBoost: 5200,
          suggestedH1,
          suggestedMetaDescription: suggestedMeta,
          suggestedKeywords: suggestedKws,
          optimizationReason: "Kurumsal sayfalarda açık H1 ve arama motorları için özet meta açıklama zorunludur.",
          isOptimized
        });
      });
    }

    return list;
  }, [config, city, sector, companyName, siteDomain]);

  // Overall Statistics Calculation
  const totalPages = auditItems.length;
  const missingH1Count = auditItems.filter(i => i.isH1Missing || i.isH1Weak).length;
  const missingMetaCount = auditItems.filter(i => i.isMetaMissing || i.isMetaTooShort).length;
  const criticalDeficiencyCount = auditItems.filter(i => !i.isOptimized).length;
  const optimizedCount = auditItems.filter(i => i.isOptimized).length;

  const totalProjectedTrafficGain = auditItems
    .filter(i => !i.isOptimized)
    .reduce((acc, curr) => acc + curr.projectedTrafficBoost, 0);

  const totalProjectedRevenueGain = auditItems
    .filter(i => !i.isOptimized)
    .reduce((acc, curr) => acc + curr.projectedRevenueBoost, 0);

  const overallHealthScore = Math.round(
    ((totalPages - criticalDeficiencyCount) / Math.max(1, totalPages)) * 100
  );

  // Filtered Items
  const filteredItems = useMemo(() => {
    return auditItems.filter(item => {
      // Cluster filter
      if (clusterFilter !== "all" && item.clusterId !== clusterFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "critical" && item.isOptimized) return false;
      if (statusFilter === "h1-missing" && (!item.isH1Missing && !item.isH1Weak)) return false;
      if (statusFilter === "meta-missing" && (!item.isMetaMissing && !item.isMetaTooShort)) return false;
      if (statusFilter === "quick-wins" && item.tierId !== "quick-wins") return false;
      if (statusFilter === "optimized" && !item.isOptimized) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSlug = item.slug.toLowerCase().includes(q);
        const matchKws = item.targetKeywords.some(k => k.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchKws) return false;
      }

      return true;
    });
  }, [auditItems, clusterFilter, statusFilter, searchQuery]);

  // Apply single page optimization directly to SiteConfig
  const handleApplySingleOptimization = (item: PageSeoAuditItem) => {
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));

    if (item.type === "home") {
      if (updated.hero) {
        updated.hero.title = item.suggestedH1;
      }
      if (updated.seo) {
        updated.seo.metaDescription = item.suggestedMetaDescription;
        const currentKws = updated.seo.keywords ? updated.seo.keywords.split(",").map(k => k.trim()) : [];
        const newKws = item.suggestedKeywords.split(",").map(k => k.trim());
        updated.seo.keywords = Array.from(new Set([...newKws, ...currentKws])).join(", ");
      }
    } else if (item.type === "service") {
      const srvId = item.id.replace("service-", "");
      if (updated.services?.items) {
        const target = updated.services.items.find(s => s.id === srvId);
        if (target) {
          target.title = item.suggestedH1;
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      }
    } else if (item.type === "product") {
      const prdId = item.id.replace("product-", "");
      if (updated.products?.items) {
        const target = updated.products.items.find(p => p.id === prdId);
        if (target) {
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      }
    } else if (item.type === "blog") {
      const blogId = item.id.replace("blog-", "");
      if (updated.blog?.items) {
        const target = updated.blog.items.find(b => b.id === blogId);
        if (target) {
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      }
    } else if (item.type === "page") {
      const pageId = item.id.replace("page-", "");
      if (updated.pages) {
        const target = updated.pages.find(p => p.id === pageId);
        if (target) {
          target.title = item.suggestedH1;
          target.metaDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      }
    }

    // Record in SEO Progress Notification System
    if (!updated.seoProgressNotifications) {
      updated.seoProgressNotifications = { ...DEFAULT_SEO_PROGRESS_CONFIG };
    }
    const progressLog = generateSeoProgressLog({
      pageId: item.id,
      pageTitle: item.title,
      pageUrl: item.url,
      clusterId: item.clusterId,
      clusterTitle: item.clusterName,
      actionType: item.isH1Missing ? "h1_optimization" : "meta_optimization",
      appliedH1: item.suggestedH1,
      appliedMeta: item.suggestedMetaDescription,
      appliedKeywords: item.suggestedKeywords
    });
    updated.seoProgressNotifications.logs = [progressLog, ...(updated.seoProgressNotifications.logs || [])];

    onChange?.(updated);
    showToast(`"${item.title}" optimize edildi! 🎯 Sıralama #${progressLog.currentAverageRank}'e sıçradı (+${progressLog.rankImprovement} sıra). Bildirim kaydedildi! 🚀`);
  };

  // Batch Optimize ALL deficient pages
  const handleBatchOptimizeAll = () => {
    setIsBatchOptimizing(true);
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));
    let fixedCount = 0;

    auditItems.forEach(item => {
      if (item.isOptimized) return;
      fixedCount++;

      if (item.type === "home") {
        if (updated.hero) updated.hero.title = item.suggestedH1;
        if (updated.seo) {
          updated.seo.metaDescription = item.suggestedMetaDescription;
          const currentKws = updated.seo.keywords ? updated.seo.keywords.split(",").map(k => k.trim()) : [];
          const newKws = item.suggestedKeywords.split(",").map(k => k.trim());
          updated.seo.keywords = Array.from(new Set([...newKws, ...currentKws])).join(", ");
        }
      } else if (item.type === "service" && updated.services?.items) {
        const srvId = item.id.replace("service-", "");
        const target = updated.services.items.find(s => s.id === srvId);
        if (target) {
          target.title = item.suggestedH1;
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      } else if (item.type === "product" && updated.products?.items) {
        const prdId = item.id.replace("product-", "");
        const target = updated.products.items.find(p => p.id === prdId);
        if (target) {
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      } else if (item.type === "blog" && updated.blog?.items) {
        const blogId = item.id.replace("blog-", "");
        const target = updated.blog.items.find(b => b.id === blogId);
        if (target) {
          target.seoTitle = item.suggestedH1;
          target.seoDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      } else if (item.type === "page" && updated.pages) {
        const pageId = item.id.replace("page-", "");
        const target = updated.pages.find(p => p.id === pageId);
        if (target) {
          target.title = item.suggestedH1;
          target.metaDescription = item.suggestedMetaDescription;
          target.seoKeywords = item.suggestedKeywords;
        }
      }
    });

    setTimeout(() => {
      // Record Batch Progress Notification
      if (!updated.seoProgressNotifications) {
        updated.seoProgressNotifications = { ...DEFAULT_SEO_PROGRESS_CONFIG };
      }
      const batchLog = generateBatchSeoProgressLog(
        fixedCount,
        fixedCount * 420,
        14.8
      );
      updated.seoProgressNotifications.logs = [batchLog, ...(updated.seoProgressNotifications.logs || [])];

      onChange?.(updated);
      setIsBatchOptimizing(false);
      showToast(`Tebrikler! ${fixedCount} adet sayfadaki tüm H1 ve Meta Açıklama eksikleri Isı Haritası verileriyle çözüldü ve Toplu Sıralama Sıçraması bildirildi! 🎉`);
    }, 600);
  };

  // Open manual edit modal
  const handleOpenEditModal = (item: PageSeoAuditItem) => {
    setEditingItem(item);
    setEditH1(item.isH1Missing ? item.suggestedH1 : item.currentH1);
    setEditMeta(item.isMetaMissing ? item.suggestedMetaDescription : item.currentMetaDescription);
    setEditKeywords(item.suggestedKeywords);
  };

  // Save manual edits
  const handleSaveManualEdit = () => {
    if (!editingItem) return;
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));

    if (editingItem.type === "home") {
      if (updated.hero) updated.hero.title = editH1;
      if (updated.seo) {
        updated.seo.metaDescription = editMeta;
        updated.seo.keywords = editKeywords;
      }
    } else if (editingItem.type === "service" && updated.services?.items) {
      const srvId = editingItem.id.replace("service-", "");
      const target = updated.services.items.find(s => s.id === srvId);
      if (target) {
        target.title = editH1;
        target.seoTitle = editH1;
        target.seoDescription = editMeta;
        target.seoKeywords = editKeywords;
      }
    } else if (editingItem.type === "product" && updated.products?.items) {
      const prdId = editingItem.id.replace("product-", "");
      const target = updated.products.items.find(p => p.id === prdId);
      if (target) {
        target.seoTitle = editH1;
        target.seoDescription = editMeta;
        target.seoKeywords = editKeywords;
      }
    } else if (editingItem.type === "blog" && updated.blog?.items) {
      const blogId = editingItem.id.replace("blog-", "");
      const target = updated.blog.items.find(b => b.id === blogId);
      if (target) {
        target.seoTitle = editH1;
        target.seoDescription = editMeta;
        target.seoKeywords = editKeywords;
      }
    } else if (editingItem.type === "page" && updated.pages) {
      const pageId = editingItem.id.replace("page-", "");
      const target = updated.pages.find(p => p.id === pageId);
      if (target) {
        target.title = editH1;
        target.metaDescription = editMeta;
        target.seoKeywords = editKeywords;
      }
    }

    if (!updated.seoProgressNotifications) {
      updated.seoProgressNotifications = { ...DEFAULT_SEO_PROGRESS_CONFIG };
    }
    const editLog = generateSeoProgressLog({
      pageId: editingItem.id,
      pageTitle: editingItem.title,
      pageUrl: editingItem.url,
      clusterId: editingItem.clusterId,
      clusterTitle: editingItem.clusterName,
      actionType: "manual_edit",
      appliedH1: editH1,
      appliedMeta: editMeta,
      appliedKeywords: editKeywords
    });
    updated.seoProgressNotifications.logs = [editLog, ...(updated.seoProgressNotifications.logs || [])];

    onChange?.(updated);
    setEditingItem(null);
    showToast(`"${editingItem.title}" sayfası güncellendi ve sıralama takip bildirimi eklendi! ✓`);
  };

  // Create & Optimize a new Regional District Page from Heatmap
  const handleCreateRegionalDistrictPage = () => {
    if (!newDistrictName.trim()) return;
    const district = newDistrictName.trim();
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));

    const slug = district.toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newService: ServiceItem = {
      id: `district-${Date.now()}`,
      title: `${district} ${sector} & 7/24 Acil Yol Yardım`,
      slug: `${slug}-oto-cekici`,
      desc: `${district} bölgesinde 15 dakikada anında çekici ve oto kurtarıcı hizmeti.`,
      longDesc: `${district} ve çevresindeki tüm mahallelerde 7/24 kesintisiz oto çekici, ahtapot vinç ve acil akü takviye hizmeti sunuyoruz. En uygun kilometre tarifesi ve sigortalı taşıma garantisiyle yanınızdayız.`,
      price: "1.250 ₺'den Başlayan",
      seoTitle: `${district} ${sector} - En Yakın 7/24 Çekici Numarası`,
      seoDescription: `${district} bölgesinde 7/24 en yakın ${sector.toLowerCase()} servisi. 15 dakikada konumunuza ulaşıyoruz. Uygun fiyat ve güvenilir hizmet için hemen arayın!`,
      seoKeywords: `${district.toLowerCase()} çekici, ${district.toLowerCase()} oto kurtarma, ${district.toLowerCase()} yol yardım, ${companyName}`,
      features: [
        "15 Dakikada Konumda",
        "Kredi Kartı ile Ödeme",
        "Kaskolu ve Sigortalı Taşıma",
        "7/24 Kesintisiz Çağrı Merkezi"
      ]
    };

    if (!updated.services) {
      updated.services = {
        enabled: true,
        badge: "Bölgesel Hizmetler",
        title: "Bölgesel Oto Çekici Hizmetlerimiz",
        subtitle: "Hızlı, güvenli ve sigortalı taşıma çözümleri",
        items: []
      };
    }
    updated.services.items.unshift(newService);

    if (!updated.seoProgressNotifications) {
      updated.seoProgressNotifications = { ...DEFAULT_SEO_PROGRESS_CONFIG };
    }
    const regionalLog = generateSeoProgressLog({
      pageId: newService.id,
      pageTitle: newService.title,
      pageUrl: `/hizmetlerimiz/${newService.slug}`,
      clusterId: "cluster-district",
      clusterTitle: "İlçe & Bölgesel Çekici",
      actionType: "regional_page_created",
      appliedH1: newService.seoTitle || newService.title,
      appliedMeta: newService.seoDescription || "",
      appliedKeywords: newService.seoKeywords || ""
    });
    updated.seoProgressNotifications.logs = [regionalLog, ...(updated.seoProgressNotifications.logs || [])];

    onChange?.(updated);
    setShowAddRegionalModal(false);
    showToast(`"${district}" bölgesel sayfası SEO Heatmap verileriyle oluşturuldu ve sıralama bildirimine eklendi! ✓`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="seo-remediation-panel-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-950 text-emerald-100 rounded-xl shadow-2xl border border-emerald-600/60 text-xs font-semibold"
            id="remediation-toast-notification"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: EXECUTIVE HERO & TELEMETRY */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>SEO Isı Haritası (Heatmap) Entegre</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
                {totalPages} Sayfa Tarandı
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              SEO Düzeltme &amp; Tek Tıkla Optimizasyon Paneli
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              SEO Isı Haritası'ndaki <strong>20 hücreli D3 matrisi</strong> ve en yüksek ROI'ye sahip anahtar kelimeleri kullanarak, 
              sitenizdeki eksik veya zayıf <strong>H1 başlıklarını</strong> ve <strong>Meta Açıklamalarını</strong> tespit edin; tek tıkla Google standartlarına uygun hale getirin.
            </p>
          </div>

          {/* Action Hub & Master Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-toggle-seo-progress-notifications"
              onClick={() => setPanelViewMode(panelViewMode === "remediation" ? "progress-notifications" : "remediation")}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                panelViewMode === "progress-notifications"
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-900/40"
                  : "bg-slate-800/90 hover:bg-slate-750 text-indigo-300 border-indigo-500/40 hover:text-white"
              }`}
              title="SEO Düzeltmelerinin Google sıralama sonuçları ve ilerleme bildirimleri"
            >
              <BellRing className="w-4 h-4 text-indigo-400" />
              <span>Sıralama Bildirimleri</span>
              {unreadNotifCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-black animate-pulse">
                  {unreadNotifCount} Yeni
                </span>
              )}
            </button>

            <button
              type="button"
              id="btn-add-regional-page-from-heatmap"
              onClick={() => setShowAddRegionalModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              title="Isı Haritasındaki Kadıköy, Ataşehir gibi yüksek getirili ilçeler için yeni sayfa oluştur"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Isı Haritasından İlçe Sayfası Ekle</span>
            </button>

            <button
              type="button"
              id="btn-batch-optimize-all-pages"
              onClick={handleBatchOptimizeAll}
              disabled={isBatchOptimizing || criticalDeficiencyCount === 0}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                criticalDeficiencyCount === 0
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isBatchOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Tüm Sayfalar Optimize Ediliyor...</span>
                </>
              ) : criticalDeficiencyCount === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tüm Sayfalar %100 Optimize Edildi ✓</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{criticalDeficiencyCount} Eksik Sayfayı Tek Tıkla Düzelt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 TELEMETRY METRIC TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>H1 Etiketi Eksik/Zayıf</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${missingH1Count > 0 ? "text-amber-400" : "text-emerald-400"}`} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {missingH1Count} <span className="text-xs font-normal text-slate-400">/ {totalPages} sayfa</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {missingH1Count === 0 ? "Tüm H1 başlıkları mükemmel" : "Hedef anahtar kelime ve şehir eksik"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Meta Açıklama Eksik</span>
              <AlertCircle className={`w-3.5 h-3.5 ${missingMetaCount > 0 ? "text-red-400" : "text-emerald-400"}`} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {missingMetaCount} <span className="text-xs font-normal text-slate-400">/ {totalPages} sayfa</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {missingMetaCount === 0 ? "130-155 karakter aralığında" : "SERP'te snippet tıklama kaybı var"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Isı Haritası Trafik Fırsatı</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-400">
              +{totalProjectedTrafficGain.toLocaleString()} <span className="text-xs font-normal text-slate-300">ziyaret/ay</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Eksik H1 &amp; Meta düzeltilince beklenen artış
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Tahmini Aylık Ek Ciro</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              +₺{totalProjectedRevenueGain.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ay</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              D3 Isı Haritası ROI %97 katsayısına göre
            </p>
          </div>
        </div>
      </div>

      {panelViewMode === "progress-notifications" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-sm font-black text-indigo-950">SEO İlerleme Bildirim Akışı ve SERP Sıralama Takipçisi</h3>
                <p className="text-xs text-indigo-700">Düzeltme panelinde uygulanan her işlemin Google sıralamalarındaki etkisi ve tahmini trafik artışı anında raporlanır.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPanelViewMode("remediation")}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-all cursor-pointer shadow-xs shrink-0"
            >
              ← Sayfa Düzeltme Tablosuna Dön
            </button>
          </div>
          <SeoProgressNotificationSystem
            config={config}
            onChange={onChange}
            onNavigateTab={onNavigateTab}
            onClose={() => setPanelViewMode("remediation")}
            isInlineMode={true}
          />
        </div>
      ) : (
        <>
          {/* FILTER & SEARCH BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4" id="remediation-controls-bar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="remediation-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sayfa adı, url veya anahtar kelime ara..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Cluster filter selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-indigo-600" /> Isı Haritası Kümesi:
            </span>
            <select
              id="remediation-cluster-select"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tüm Kümeler ({totalPages} sayfa)</option>
              {CONTENT_CLUSTERS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({auditItems.filter(i => i.clusterId === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "all", label: `Tümü (${totalPages})` },
            { key: "critical", label: `🚨 Düzeltme Bekleyenler (${criticalDeficiencyCount})` },
            { key: "h1-missing", label: `H1 Başlığı Eksik (${missingH1Count})` },
            { key: "meta-missing", label: `Meta Açıklaması Eksik (${missingMetaCount})` },
            { key: "quick-wins", label: `⚡ Hızlı Zaferler (#4-#10)` },
            { key: "optimized", label: `✅ Optimize Edilenler (${optimizedCount})` }
          ].map(f => (
            <button
              key={f.key}
              id={`filter-remediation-${f.key}`}
              type="button"
              onClick={() => setStatusFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                statusFilter === f.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE CARDS LIST */}
      <div className="space-y-4" id="remediation-cards-list">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            id={`remediation-item-${item.id}`}
            className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 bg-white ${
              item.isOptimized
                ? "border-emerald-200 shadow-xs bg-emerald-50/10"
                : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
            }`}
          >
            {/* Card Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {item.typeLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                    <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.url}</span>
                  </div>
                </div>
              </div>

              {/* Status and Badges */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  item.tierId === "quick-wins"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-sky-50 text-sky-800 border-sky-200"
                }`}>
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>ROI: %{item.roiScore}</span>
                  <span>•</span>
                  <span>{item.tierLabel}</span>
                </span>

                {item.isOptimized ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Google Uyumlu ✓</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Düzeltme Gerekli</span>
                  </span>
                )}
              </div>
            </div>

            {/* AUDIT COMPARISON: CURRENT VS SUGGESTED */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: H1 and Meta Status (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5">
                {/* 1. H1 Tag Status */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">&lt;H1&gt;</span>
                      <span>H1 Başlık Etiketi</span>
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.isH1Missing
                        ? "bg-red-100 text-red-700"
                        : item.isH1Weak
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {item.isH1Missing ? "Eksik" : item.isH1Weak ? "Zayıf Başlık" : "Uyumlu"} ({item.h1CharCount} kark.)
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 font-medium">Mevcut:</span>{" "}
                    <span className={item.isH1Missing ? "text-red-600 italic font-mono" : "text-slate-900 font-medium"}>
                      {item.currentH1}
                    </span>
                  </div>

                  {!item.isOptimized && (
                    <div className="text-xs text-indigo-950 bg-indigo-50/90 p-2.5 rounded-lg border border-indigo-100 space-y-1">
                      <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Isı Haritası Önerilen H1:</span>
                      </div>
                      <p className="font-bold text-slate-900">
                        {item.suggestedH1}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Meta Description Status */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">&lt;meta&gt;</span>
                      <span>Meta Açıklaması (Snippet)</span>
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.isMetaMissing
                        ? "bg-red-100 text-red-700"
                        : item.isMetaTooShort
                        ? "bg-amber-100 text-amber-800"
                        : item.isMetaTooLong
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {item.isMetaMissing ? "Açıklama Yok" : item.isMetaTooShort ? "Kısa" : item.isMetaTooLong ? "Çok Uzun" : "İdeal Uzunluk"} ({item.metaCharCount} / 155 kark.)
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 font-medium">Mevcut:</span>{" "}
                    <span className={item.isMetaMissing ? "text-red-600 italic font-mono" : "text-slate-900"}>
                      {item.currentMetaDescription}
                    </span>
                  </div>

                  {!item.isOptimized && (
                    <div className="text-xs text-emerald-950 bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Isı Haritası Önerilen Meta Açıklama:</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {item.suggestedMetaDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Google SERP Preview & Opportunity Data (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                {/* Live Google Search Card Simulation */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>Google Arama Görünümü</span>
                  </div>
                  <div className="text-[11px] text-slate-700 truncate font-mono">
                    https://{siteDomain}{item.slug}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-blue-800 hover:underline cursor-pointer truncate">
                    {item.isOptimized ? item.currentH1 : item.suggestedH1}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {item.isOptimized ? item.currentMetaDescription : item.suggestedMetaDescription}
                  </p>
                </div>

                {/* Heatmap Boost Metrics */}
                <div className="p-3 rounded-xl bg-slate-900 text-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Hedef Isı Haritası Kümesi:</span>
                    <span className="font-bold text-indigo-300 text-[11px]">{item.clusterName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Beklenen Trafik Artışı:</span>
                    <span className="font-bold text-sky-400">+{item.projectedTrafficBoost} Ziyaret/Ay</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Potansiyel Ek Ciro:</span>
                    <span className="font-bold text-emerald-400">+₺{item.projectedRevenueBoost.toLocaleString()} / Ay</span>
                  </div>

                  {/* Target keywords pills */}
                  <div className="pt-1 flex flex-wrap gap-1">
                    {item.targetKeywords.map((kw, kIdx) => (
                      <span key={kIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  {!item.isOptimized ? (
                    <button
                      type="button"
                      id={`btn-optimize-single-${item.id}`}
                      onClick={() => handleApplySingleOptimization(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tek Tıkla Optimize Et</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Optimize Edildi</span>
                    </div>
                  )}

                  <button
                    type="button"
                    id={`btn-edit-manual-${item.id}`}
                    onClick={() => handleOpenEditModal(item)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1 cursor-pointer"
                    title="H1 ve Meta Açıklamasını Özelleştir"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Düzenle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-slate-800">Filtre kriterlerine uygun sayfa bulunamadı</div>
            <p className="text-xs text-slate-500">Seçtiğiniz kümede veya filtrede tüm sayfalar optimize edilmiş olabilir.</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* MODAL 1: MANUAL QUICK EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {editingItem.typeLabel} • Manuel Düzenleme
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* H1 Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="edit-h1-input" className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>H1 Başlık Etiketi</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Sayfa Tepe Başlığı)</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${
                    editH1.length < 20 || editH1.length > 70 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {editH1.length} / 65 karakter (Önerilen: 30-65)
                  </span>
                </div>
                <input
                  id="edit-h1-input"
                  type="text"
                  value={editH1}
                  onChange={(e) => setEditH1(e.target.value)}
                  placeholder="Örn: Kadıköy Oto Çekici & 7/24 Acil Yol Yardım"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Meta Description Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="edit-meta-input" className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Meta Açıklaması (SERP Snippet)</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Google Arama Özeti)</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${
                    editMeta.length < 120 || editMeta.length > 160 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {editMeta.length} / 155 karakter (İdeal: 130-155)
                  </span>
                </div>
                <textarea
                  id="edit-meta-input"
                  rows={3}
                  value={editMeta}
                  onChange={(e) => setEditMeta(e.target.value)}
                  placeholder="Google arama sonuçlarında çıkacak 130-155 karakterlik açıklama..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Target Keywords */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="edit-keywords-input" className="font-bold text-slate-800">
                    SEO Anahtar Kelimeleri
                  </label>
                  <span className="text-[10px] text-slate-400">Virgülle ayırarak girin</span>
                </div>
                <input
                  id="edit-keywords-input"
                  type="text"
                  value={editKeywords}
                  onChange={(e) => setEditKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Keyword Injector Pills */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Isı Haritasından Hızlı Ekle:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {editingItem.targetKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!editH1.toLowerCase().includes(kw.toLowerCase())) {
                          setEditH1(`${editH1} - ${kw}`);
                        }
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-[11px] text-slate-700 font-medium transition-colors"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* SERP Live Simulation */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">Önizleme (Google Snippet)</div>
                <div className="text-xs font-bold text-blue-400 truncate">{editH1 || editingItem.title}</div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {editMeta || "Meta açıklaması girilmedi..."}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                id="btn-save-manual-edit"
                onClick={handleSaveManualEdit}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Kaydet &amp; Siteye Uygula</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD REGIONAL DISTRICT PAGE FROM HEATMAP */}
      {showAddRegionalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Isı Haritası Quick-Win #4-#10</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Yeni Bölgesel İlçe Sayfası Oluştur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRegionalModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Isı Haritası analizine göre ilçe bazlı mikro açılış sayfaları, yerel SERP'te ilk 2 sırayı garantiye alarak ayda <strong>+4,650 acil arama</strong> ve <strong>+₺67,500 ciro</strong> sağlar.
            </p>

            {/* Quick District Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Popüler Yüksek ROI İlçeleri:</span>
              <div className="flex flex-wrap gap-2">
                {["Kadıköy", "Ataşehir", "Ümraniye", "Beşiktaş", "Kartal", "Pendik", "Maltepe", "Sarıyer"].map(dist => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setNewDistrictName(dist)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      newDistrictName === dist
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📍 {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="custom-district-input" className="text-xs font-bold text-slate-800">
                Hedef İlçe veya Bölge Adı:
              </label>
              <input
                id="custom-district-input"
                type="text"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                placeholder="Örn: Kadıköy, Bakırköy, Çankaya..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Otomatik Optimize Edilecek H1 ve Meta:
              </span>
              <p className="text-[11px] text-emerald-900">
                <strong>H1:</strong> {newDistrictName} {sector} &amp; 7/24 Acil Yol Yardım
              </p>
              <p className="text-[11px] text-emerald-900">
                <strong>Meta:</strong> {newDistrictName} bölgesinde 7/24 en yakın {sector.toLowerCase()} servisi. 15 dakikada konumunuza ulaşıyoruz. Uygun fiyat ve güvenilir hizmet için hemen arayın!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddRegionalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                id="btn-confirm-create-regional-page"
                onClick={handleCreateRegionalDistrictPage}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Sayfayı Oluştur &amp; Optimize Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
