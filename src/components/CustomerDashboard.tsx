import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { checkTrialStatus, toggleTrialExpiredSimulation } from "../utils/authStorage";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  ProductItem, 
  BlogPostItem, 
  BlogCategory,
  ProductCategory,
  FormLead, 
  LeadCustomTag,
  ServiceItem,
  CustomPageItem
} from "../types";
import { THREE_TIER_PACKAGES } from "../data/mockData";
import { RichTextEditor } from "./RichTextEditor";
import { ServiceManager } from "./dashboard/ServiceManager";
import { TestimonialsManager } from "./dashboard/TestimonialsManager";
import { GalleryManager } from "./dashboard/GalleryManager";
import { FaqManager } from "./dashboard/FaqManager";
import { NewsletterManager } from "./dashboard/NewsletterManager";
import { CustomDomainManager } from "./dashboard/CustomDomainManager";
import { ConnectCustomDomainSection } from "./dashboard/ConnectCustomDomainSection";
import { CustomPagesManager } from "./dashboard/CustomPagesManager";
import { DesignStructureManager } from "./dashboard/DesignStructureManager";
import { SimpleMerchantMode } from "./dashboard/SimpleMerchantMode";
import { SeoManager } from "./dashboard/SeoManager";
import { SeoHealthCheck } from "./dashboard/SeoHealthCheck";
import { SeoAuditor } from "./dashboard/SeoAuditor";
import { SeoReportTab } from "./dashboard/SeoReportTab";
import { PageSeoManager } from "./dashboard/PageSeoManager";
import { SeoProgressNotificationSystem } from "./dashboard/SeoProgressNotificationSystem";
import { MetaTagsAuditor } from "./dashboard/MetaTagsAuditor";
import { SeoContentOptimizer } from "./dashboard/SeoContentOptimizer";
import { AiContentMetaOptimizer } from "./dashboard/AiContentMetaOptimizer";
import { AiMetaOptimizer } from "./dashboard/AiMetaOptimizer";
import { SeoCompetitiveAlertCenter } from "./dashboard/SeoCompetitiveAlertCenter";
import { CompetitiveAlertToast } from "./dashboard/CompetitiveAlertToast";
import { 
  loadCompetitiveAlerts, 
  calculateAlertSummary, 
  markAlertAsRead 
} from "../utils/seoCompetitiveAlertEngine";
import { SeoCompetitiveAlert, CompetitiveAlertSummary } from "../types";
import { JsonLdSchemaGenerator } from "./dashboard/JsonLdSchemaGenerator";
import { LocalSeoSchemaGenerator } from "./dashboard/LocalSeoSchemaGenerator";
import { runSeoHealthCheck } from "../utils/seoHealthCheckEngine";
import { SeoAutoOptimizerModal } from "./dashboard/SeoAutoOptimizerModal";
import { GettingStartedModal } from "./dashboard/GettingStartedModal";
import { PerformanceMetricsTab } from "./dashboard/PerformanceMetricsTab";
import { PerformanceMonitor } from "./dashboard/PerformanceMonitor";
import { QuickStartDesignSets } from "./dashboard/QuickStartDesignSets";
import { Base64ImageUpload } from "./dashboard/Base64ImageUpload";
import { Base64GalleryUpload } from "./dashboard/Base64GalleryUpload";
import { BackupManager } from "./dashboard/BackupManager";
import { OneClickSnapshotModal } from "./dashboard/OneClickSnapshotModal";
import { SocialMediaManager } from "./dashboard/SocialMediaManager";
import { SocialPostScheduler } from "./dashboard/SocialPostScheduler";
import { SocialFeedManager } from "./dashboard/SocialFeedManager";
import { QrCodeManager } from "./dashboard/QrCodeManager";
import { QrMarketingQuickCard } from "./dashboard/QrMarketingQuickCard";
import { PerformanceScoreGaugeWidget } from "./dashboard/PerformanceScoreGaugeWidget";
import { SeoHeatmapWidget } from "./dashboard/SeoHeatmapWidget";
import { SeoPerformanceHeatmap } from "./dashboard/SeoPerformanceHeatmap";
import { SeoOpportunityToast } from "./dashboard/SeoOpportunityToast";
import { SeoOpportunityCenter } from "./dashboard/SeoOpportunityCenter";
import { detectSeoOpportunities, SeoOpportunityAlert } from "../utils/seoOpportunityEngine";
import { AssetManager } from "./dashboard/AssetManager";
import { BlogManager } from "./dashboard/BlogManager";
import { AiBlogEngine } from "./dashboard/AiBlogEngine";
import { AiSeoContentPlanner } from "./dashboard/AiSeoContentPlanner";
import { AiSeoContentAssistant } from "./dashboard/AiSeoContentAssistant";
import { SeoTrendForecast } from "./dashboard/SeoTrendForecast";
import { SeoCompetitiveStrategyVisualizer } from "./dashboard/SeoCompetitiveStrategyVisualizer";
import { CompetitorUrlAnalysisModule } from "./dashboard/CompetitorUrlAnalysisModule";
import { ContentGapMap } from "./dashboard/ContentGapMap";
import { MarketShareBenchmarkTable } from "./dashboard/MarketShareBenchmarkTable";
import { LocalSeoLocationMap } from "./dashboard/LocalSeoLocationMap";
import { MarketShareCompetitorAnalysisPanel } from "./dashboard/MarketShareCompetitorAnalysisPanel";
import { SeoExecutiveSummary } from "./dashboard/SeoExecutiveSummary";
import { CompetitiveSeoWidget } from "./dashboard/CompetitiveSeoWidget";
import { RealtimeTrafficOverviewWidget } from "./dashboard/RealtimeTrafficOverviewWidget";
import { AbTestConversionFunnelWidget } from "./dashboard/AbTestConversionFunnelWidget";
import { PerformanceForecaster } from "./dashboard/PerformanceForecaster";
import { PerformanceForecasterQuickCard } from "./dashboard/PerformanceForecasterQuickCard";
import { SitePerformanceOverviewCard } from "./dashboard/SitePerformanceOverviewCard";
import { PerformanceCriticalAlertBar } from "./dashboard/PerformanceCriticalAlertBar";
import { SeoAutomatedAuditTool } from "./dashboard/SeoAutomatedAuditTool";
import { WhatsAppChatManager } from "./dashboard/WhatsAppChatManager";
import { RevenueTrackerCard } from "./dashboard/RevenueTrackerCard";
import { DailyLeadTrendsChart } from "./dashboard/DailyLeadTrendsChart";
import { LeadTagsManager, getTagColorClass, getLeadTagStyle } from "./dashboard/LeadTagsManager";
import { ManageLeadTagsModal } from "./dashboard/ManageLeadTagsModal";
import { LeadDetailModal } from "./dashboard/LeadDetailModal";
import { LeadTimelineModal } from "./dashboard/LeadTimelineModal";
import { LeadKanbanBoard } from "./dashboard/LeadKanbanBoard";
import { PerformanceAnalyticsWidget } from "./dashboard/PerformanceAnalyticsWidget";
import { TaxPricingManager } from "./dashboard/TaxPricingManager";
import { LanguageSettingsManager } from "./dashboard/LanguageSettingsManager";
import { CustomFormManager } from "./dashboard/CustomFormManager";
import { CatalogContactFormManager } from "./dashboard/CatalogContactFormManager";
import { EmailAutomationSettings } from "./dashboard/EmailAutomationSettings";
import { AutomatedResponsesManager } from "./dashboard/AutomatedResponsesManager";
import { EmailAutomationsManager } from "./dashboard/EmailAutomationsManager";
import { NotificationsPanel } from "./dashboard/NotificationsPanel";
import { ClientAccessPortal } from "./dashboard/ClientAccessPortal";
import { calculateLeadScore, getPriorityBadgeStyle, getPriorityLabel } from "../utils/leadScoring";
import { LeadScoreBadge } from "./dashboard/LeadScoreBadge";
import { LeadScoringSummaryCard } from "./dashboard/LeadScoringSummaryCard";
import { LeadAutoArchiveModal } from "./dashboard/LeadAutoArchiveModal";
import { 
  DEFAULT_AUTO_ARCHIVE_CONFIG,
  processAutoArchiveLeads,
  restoreArchivedLead,
  isLeadEligibleForAutoArchive
} from "../utils/leadAutoArchive";
import { dispatchLeadNotification } from "../utils/leadNotificationDispatcher";
import { AbTestingManager } from "./dashboard/AbTestingManager";
import { LeadInsightsManager } from "./dashboard/LeadInsightsManager";
import { LeadAutomationRulesManager } from "./dashboard/LeadAutomationRulesManager";
import { LeadMappingManager } from "./dashboard/LeadMappingManager";
import { MarketingAutomationManager } from "./dashboard/MarketingAutomationManager";
import { LeadForecastingManager } from "./dashboard/LeadForecastingManager";
import { MarketingSourceAttributionManager } from "./dashboard/MarketingSourceAttributionManager";
import { SiteHealthPerformanceManager } from "./dashboard/SiteHealthPerformanceManager";
import { SiteHealthScoreCard } from "./dashboard/SiteHealthScoreCard";
import { SystemLogsManager } from "./dashboard/SystemLogsManager";
import { runAllAutomationRulesOnLead } from "../utils/leadAutomationEngine";
import { MediaLibraryManager } from "./dashboard/MediaLibraryManager";
import { PricingIntelligenceWorkspace } from "./dashboard/PricingIntelligenceWorkspace";
import { PricingIntelligenceQuickCard } from "./dashboard/PricingIntelligenceQuickCard";
import { GlobalSeoAgentWorkspace } from "./dashboard/GlobalSeoAgentWorkspace";
import { AiGlobalSeoAgent } from "./dashboard/AiGlobalSeoAgent";
import { GlobalSeoQuickCard } from "./dashboard/GlobalSeoQuickCard";
import { SeoTrendForecastQuickCard } from "./dashboard/SeoTrendForecastQuickCard";
import { SeoCompetitiveStrategyQuickCard } from "./dashboard/SeoCompetitiveStrategyQuickCard";
import { BulkSeoPerformanceExportWorkspace } from "./dashboard/BulkSeoPerformanceExportWorkspace";
import { BulkSeoPerformanceQuickCard } from "./dashboard/BulkSeoPerformanceQuickCard";
import { AdvancedSitePerformanceTrends } from "./dashboard/AdvancedSitePerformanceTrends";
import { AdvancedPerformanceTrendsQuickCard } from "./dashboard/AdvancedPerformanceTrendsQuickCard";
import { UserAuthManagement } from "./dashboard/UserAuthManagement";
import { UserAuthQuickCard } from "./dashboard/UserAuthQuickCard";
import { CoolifyDeploymentGuide } from "./dashboard/CoolifyDeploymentGuide";
import { CloudflareEdgeDeploymentGuide } from "./dashboard/CloudflareEdgeDeploymentGuide";
import { AiImageOptimizer } from "./dashboard/AiImageOptimizer";
import { SecurityAuditManager } from "./dashboard/SecurityAuditManager";
import { AutomatedDnsSetupGuide } from "./dashboard/AutomatedDnsSetupGuide";
import { DataExportModal } from "./dashboard/DataExportModal";
import { getEffectiveTaxConfig, calculateProductTax } from "../utils/taxUtils";
import { getEffectiveLanguageConfig } from "../utils/languageUtils";
import { checkAndCreateDailyBackup, getAllBackups } from "../utils/backupManager";
import { downloadLeadsCsv } from "../utils/csvExport";
import { 
  exportProductsToExcel, 
  exportProductsToCsv, 
  exportLeadsToExcel, 
  exportLeadsToCsv, 
  exportLeadsToJson,
  exportComprehensiveReport 
} from "../utils/dataExport";
import { CrmIntegrationModal } from "./dashboard/CrmIntegrationModal";
import { processLogoFile, processLogoFormData, validateLogoFile } from "../utils/logoUploadHelper";
import { LogoUploadToast, LogoToastInfo } from "./dashboard/LogoUploadToast";
import { QuickLogoUploadModal } from "./dashboard/QuickLogoUploadModal";
import { StakeholderPdfReportModal } from "./dashboard/StakeholderPdfReportModal";
import { 
  CRM_PROVIDER_META, 
  getDefaultCrmConfig, 
  autoSyncNewLeadIfEnabled, 
  syncLeadsToCrm 
} from "../utils/crmManager";
import { 
  slugify, 
  slugifyProduct, 
  slugifyBlog, 
  slugifyService, 
  slugifyCategory, 
  slugifySubdomain, 
  sanitizeSlugInput 
} from "../utils/url";
import { 
  Building2, 
  MapPin,
  ArrowRight,
  Layers, 
  ShoppingBag, 
  Wrench, 
  FileText, 
  Inbox, 
  MailCheck,
  Sparkles, 
  Send,
  Globe, 
  Cloud,
  Globe2, 
  Palette, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw,
  Wand2,
  Eye,
  Rocket,
  Image as ImageIcon,
  Tag,
  FolderPlus,
  Compass,
  LayoutTemplate,
  Check,
  PackageCheck,
  ShieldCheck,
  Key,
  Sliders,
  SlidersHorizontal,
  Paperclip,
  Upload,
  Zap,
  Flame,
  Gauge,
  Server,
  Star,
  Search,
  Target,
  Share2,
  Activity,
  Download,
  FileDown,
  History,
  TrendingUp,
  DollarSign,
  QrCode,
  Mail,
  Camera,
  HelpCircle,
  FolderKanban,
  BarChart3,
  Receipt,
  Coins,
  Percent,
  Languages,
  Split,
  FileSpreadsheet,
  BookOpen,
  Network,
  Calendar,
  CalendarRange,
  Clock,
  Bell,
  BellRing,
  Lock,
  Kanban,
  List,
  Archive,
  Route,
  ScrollText,
  Database,
  Code,
  Code2,
  PieChart,
  Instagram,
  Truck,
  X
} from "lucide-react";

interface CustomerDashboardProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview: () => void;
  onDeploy: () => void;
  initialTab?: CustomerPanelTab;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  config,
  onChange,
  onPreview,
  onDeploy,
  initialTab
}) => {
  const { user } = useAuth();
  const trialStatus = checkTrialStatus(user);
  const [showSiteLimitModal, setShowSiteLimitModal] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);

  const [dashboardMode, setDashboardMode] = useState<"simple" | "advanced">("simple");
  const [activeTab, setActiveTab] = useState<CustomerPanelTab>(initialTab || "general");
  const [heatmapSubTab, setHeatmapSubTab] = useState<"regional-performance" | "page-sections">("regional-performance");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Prompt upgrade modal if trial expired and not already in hosting-package
  useEffect(() => {
    if (trialStatus.isTrial && trialStatus.isExpired && activeTab !== "hosting-package") {
      setShowTrialExpiredModal(true);
    }
  }, [trialStatus.isTrial, trialStatus.isExpired, activeTab]);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isStakeholderReportModalOpen, setIsStakeholderReportModalOpen] = useState(false);
  const [isSeoOptimizerOpen, setIsSeoOptimizerOpen] = useState(false);
  const [isAiMetaOptimizerModalOpen, setIsAiMetaOptimizerModalOpen] = useState(false);
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false);
  const [isAutoArchiveModalOpen, setIsAutoArchiveModalOpen] = useState(false);
  const [autoArchiveNotice, setAutoArchiveNotice] = useState<{ count: number; names: string[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [leadSortBy, setLeadSortBy] = useState<"date" | "score-desc" | "score-asc" | "deal-desc">("date");
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>("");
  const [leadViewMode, setLeadViewMode] = useState<"kanban" | "list">("list");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [isCrmQuickSyncing, setIsCrmQuickSyncing] = useState(false);
  const [schedulerPreselectedProductId, setSchedulerPreselectedProductId] = useState<string | undefined>(undefined);

  // Real-time SEO Health Check score
  const seoHealthScore = useMemo(() => runSeoHealthCheck(config).score, [config]);

  // SEO Audit Execution State & Timestamp for 'Run SEO Audit' feature
  const [isAuditingSeo, setIsAuditingSeo] = useState<boolean>(false);
  const [lastAuditedDate, setLastAuditedDate] = useState<Date>(() => new Date());

  const handleRunSeoAudit = () => {
    setIsAuditingSeo(true);
    setLastAuditedDate(new Date());
    setTimeout(() => {
      setIsAuditingSeo(false);
      setDashboardMode("advanced");
      setActiveTab("seo-report");
      const targetEl = document.getElementById("seo-report-tab-workspace") || document.getElementById("customer-dashboard-main-content");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 600);
  };

  // Real-time AI SEO Opportunity Alerts & Toast State
  const [isOpportunityCenterOpen, setIsOpportunityCenterOpen] = useState(false);
  const [dismissedOpportunityIds, setDismissedOpportunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("hizliweb_dismissed_seo_opps");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSeoToastGloballyDismissed, setIsSeoToastGloballyDismissed] = useState(false);

  // Compute live AI SEO opportunities based on current config
  const allSeoOpportunities = useMemo(() => detectSeoOpportunities(config), [config]);
  const activeSeoOpportunities = useMemo(
    () => allSeoOpportunities.filter((opp) => !dismissedOpportunityIds.includes(opp.id)),
    [allSeoOpportunities, dismissedOpportunityIds]
  );

  const handleApplySeoOpportunity = (opportunity: SeoOpportunityAlert) => {
    if (opportunity.applyFix) {
      const result = opportunity.applyFix(config);
      onChange(result.updatedConfig);
      setDismissedOpportunityIds((prev) => {
        const next = [...prev, opportunity.id];
        try {
          localStorage.setItem("hizliweb_dismissed_seo_opps", JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const handleDismissSeoOpportunity = (opportunityId: string) => {
    setDismissedOpportunityIds((prev) => {
      const next = [...prev, opportunityId];
      try {
        localStorage.setItem("hizliweb_dismissed_seo_opps", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Real-time SEO Competitive Alerts State & Handlers
  const [competitiveAlerts, setCompetitiveAlerts] = useState<SeoCompetitiveAlert[]>(() => loadCompetitiveAlerts());
  const [activeCompetitiveToast, setActiveCompetitiveToast] = useState<SeoCompetitiveAlert | null>(null);
  const [isCompetitiveAlertCenterModalOpen, setIsCompetitiveAlertCenterModalOpen] = useState(false);

  const competitiveSummary: CompetitiveAlertSummary = useMemo(() => {
    return calculateAlertSummary(competitiveAlerts);
  }, [competitiveAlerts]);

  // Sync competitive alerts with storage and periodic checks
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "hizliweb_seo_competitive_alerts") {
        setCompetitiveAlerts(loadCompetitiveAlerts());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    // Check periodically for simulated or updated competitor shifts
    const interval = setInterval(() => {
      setCompetitiveAlerts(loadCompetitiveAlerts());
    }, 4000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Present in-app push toast for high or critical unread competitor alert
  useEffect(() => {
    if (!activeCompetitiveToast && competitiveAlerts.length > 0) {
      const outrankedOrHigh = competitiveAlerts.find(
        (a) => a.status === "unread" && (a.severity === "critical" || a.severity === "high" || a.category === "outranked")
      );
      if (outrankedOrHigh) {
        setActiveCompetitiveToast(outrankedOrHigh);
      }
    }
  }, [competitiveAlerts, activeCompetitiveToast]);

  const handleMarkCompetitiveAlertRead = (id: string) => {
    const updated = markAlertAsRead(id);
    setCompetitiveAlerts(updated);
    if (activeCompetitiveToast?.id === id) {
      setActiveCompetitiveToast(null);
    }
  };

  const handleDismissCompetitiveToast = () => {
    if (activeCompetitiveToast) {
      handleMarkCompetitiveAlertRead(activeCompetitiveToast.id);
    }
    setActiveCompetitiveToast(null);
  };

  // First-login auto-open Getting Started Guide
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("hizliweb_first_login_seen");
      if (!hasSeen) {
        setIsGettingStartedOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Dedicated Logo Upload & Management State
  const [logoToast, setLogoToast] = useState<LogoToastInfo | null>(null);
  const [isQuickLogoModalOpen, setIsQuickLogoModalOpen] = useState(false);
  const [isHeaderLogoProcessing, setIsHeaderLogoProcessing] = useState(false);
  const headerLogoFileInputRef = useRef<HTMLInputElement>(null);

  const effectiveLogo = config.logo || config.header?.logoImage || config.logoUrl || "";

  const handleHeaderLogoFileSelected = async (file: File) => {
    setIsHeaderLogoProcessing(true);
    try {
      const result = await processLogoFile(file, {
        maxDimension: 1200,
        quality: 0.92,
        companySubdomain: config.cloudflare?.subdomain || "sirket"
      });

      if (!result.success || !result.dataUrl) {
        const errorText = result.errorMessage || "Logo yüklenemedi. Lütfen geçerli bir dosya seçin.";
        setLogoToast({
          type: "error",
          title: "Logo Yükleme Hatası",
          message: errorText,
          fileName: file.name,
          onRetry: () => headerLogoFileInputRef.current?.click()
        });
        return;
      }

      const updatedLogo = result.dataUrl;
      const updatedConfig: SiteConfig = {
        ...config,
        logo: updatedLogo,
        logoUrl: updatedLogo,
        header: {
          ...(config.header || {
            sticky: true,
            logoType: "image",
            logoHeight: 44,
            logoWidth: 0,
            logoAspectRatio: "auto",
            logoObjectFit: "contain",
            showTextAlongsideLogo: false,
            ctaButton: { text: "Teklif Al", link: "#contact", enabled: true }
          }),
          logoType: "image",
          logoImage: updatedLogo
        }
      };

      onChange(updatedConfig);

      setLogoToast({
        type: "success",
        title: "Logo Başarıyla Yüklendi",
        message: `"${result.fileName || "Logo"}" başarıyla web sitenize ve başlık alanınıza uygulandı.`,
        fileName: result.fileName,
        fileSize: result.fileSizeBytes,
        previewUrl: updatedLogo,
        dimensions: result.dimensions,
        savingsPercentage: result.savingsPercentage
      });
    } catch (err: any) {
      setLogoToast({
        type: "error",
        title: "Logo Okuma Hatası",
        message: err?.message || "Logo dosyası işlenirken bir hata oluştu.",
        fileName: file.name,
        onRetry: () => headerLogoFileInputRef.current?.click()
      });
    } finally {
      setIsHeaderLogoProcessing(false);
      if (headerLogoFileInputRef.current) {
        headerLogoFileInputRef.current.value = "";
      }
    }
  };

  // Quick setup progress calculation
  const isLogoComplete = Boolean(
    config.logo || 
    config.header?.logoImage ||
    (config.logoUrl && !config.logoUrl.includes("placeholder.svg") && !config.logoUrl.includes("via.placeholder"))
  );
  const isContactComplete = Boolean(
    (config.phone && config.phone.replace(/[^0-9]/g, "").length >= 7) &&
    (config.whatsapp && config.whatsapp.replace(/[^0-9]/g, "").length >= 7) &&
    (config.address && config.address.trim().length > 3)
  );
  const isContentComplete = Boolean(
    ((config.services?.items?.length || 0) > 0 || (config.products?.items?.length || 0) > 0) &&
    config.about?.content &&
    config.about.content.length > 30
  );
  const isPublishComplete = Boolean(config.cloudflare?.deployedUrl || config.cloudflare?.customDomain);
  const setupProgressPercent = Math.round(([isLogoComplete, isContactComplete, isContentComplete, isPublishComplete].filter(Boolean).length / 4) * 100);
  
  // Automated daily backup check & count
  const [backupCount, setBackupCount] = useState<number>(() => getAllBackups().length);

  useEffect(() => {
    try {
      checkAndCreateDailyBackup(config);
      setBackupCount(getAllBackups().length);
    } catch {
      // ignore
    }
  }, [config.companyName]);

  // Safe resolved categories
  const productCategories: ProductCategory[] = (config.products?.categories && config.products.categories.length > 0)
    ? config.products.categories
    : [
        { id: "pcat-1", name: "Genel Ürünler", slug: "genel" },
        { id: "pcat-2", name: "Hizmet Paketleri", slug: "hizmet-paketleri" },
        { id: "pcat-3", name: "Özel Fırsatlar", slug: "ozel-firsatlar" }
      ];

  // Product Catalog State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    config.products?.items?.[0]?.id || null
  );
  const [newProdCatName, setNewProdCatName] = useState("");
  const [showAddProdCatModal, setShowAddProdCatModal] = useState(false);

  // Helper updater
  const updateConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    onChange(updater(config));
  };

  // Auto-Archive routine for stale leads (>30 days in 'new' or 'contacted' status)
  useEffect(() => {
    const archiveConfig = config.leadAutoArchive ?? DEFAULT_AUTO_ARCHIVE_CONFIG;
    if (archiveConfig.enabled === false) return;

    const result = processAutoArchiveLeads(config.leads || [], archiveConfig);
    if (result.archivedCount > 0) {
      const nowIso = new Date().toISOString();
      updateConfig(prev => ({
        ...prev,
        leads: result.updatedLeads,
        leadAutoArchive: {
          ...archiveConfig,
          lastRunAt: nowIso,
          totalArchivedCount: (archiveConfig.totalArchivedCount || 0) + result.archivedCount
        }
      }));

      if (archiveConfig.notifyOnArchive !== false) {
        setAutoArchiveNotice({
          count: result.archivedCount,
          names: result.archivedLeadNames
        });
      }
    }
  }, []);

  // Copy helper
  const handleCopySubdomain = () => {
    const url = config.cloudflare?.customDomain 
      ? `https://${config.cloudflare.customDomain}` 
      : (config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || 'sirket'}.hizliweb.site`);
    navigator.clipboard.writeText(url);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  // AI Content Generator for About / Slogan / SEO
  const handleGenerateAiContent = () => {
    setIsAiWorking(true);
    setTimeout(() => {
      updateConfig(prev => ({
        ...prev,
        slogan: `${prev.city} Bölgesinde 15 Yıllık Güvenle Kesintisiz ${prev.sector} Hizmeti`,
        hero: {
          ...prev.hero,
          title: `${prev.companyName} ile Profesyonel Çözümler`,
          subtitle: `En son teknoloji ekipmanlarımız ve uzman kadromuz ile 7/24 yanınızdayız. Sabit fiyat garantisi ve %100 müşteri memnuniyeti.`
        },
        about: {
          ...prev.about,
          title: `${prev.companyName} Olarak Neler Yapıyoruz?`,
          content: `<p><strong>${prev.companyName}</strong>, ${prev.city} ve çevre bölgelerde sektörün öncüsü olarak faaliyet göstermektedir.</p><p>Kuruluşumuzdan bu yana dürüstlük, şeffaflık ve yüksek kalite standartlarından ödün vermeden binlerce mutlu müşteriye hizmet verdik.</p><ul><li>Yetkili ve sertifikalı uzman kadro</li><li>Sabit fiyat garantisi ve şeffaf tekliflendirme</li><li>7/24 kesintisiz müşteri desteği</li></ul>`
        },
        seo: {
          ...prev.seo,
          metaTitle: `${prev.companyName} | ${prev.sector} - ${prev.city}`,
          metaDescription: `${prev.city} bölgesinde profesyonel ${prev.sector} hizmetleri. Hızlı iletişim ve en uygun fiyat teklifi için hemen arayın.`,
          keywords: `${prev.sector}, ${prev.city} ${prev.sector}, profesyonel ${prev.sector}, ${prev.companyName}`
        }
      }));
      setIsAiWorking(false);
    }, 700);
  };

  // Add Product Item
  const handleAddProduct = () => {
    const title = "Yeni Ürün / Hizmet Paketi";
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      title,
      slug: slugifyProduct(title, Date.now().toString().slice(-4)),
      category: productCategories[0]?.name || "Genel",
      price: "2.450 ₺",
      oldPrice: "3.200 ₺",
      description: `<h3>Ürün & Paket Tanıtımı</h3><p><strong>${config.companyName}</strong> güvencesiyle sunulan bu ürün en kaliteli materyallerden üretilmiştir.</p><ul><li>Garantili & Faturalı Ürün</li><li>Hızlı Kargo & Aynı Gün Teslimat</li><li>Ücretsiz Montaj / Danışmanlık</li></ul>`,
      shortDescription: "Yüksek dayanıklılık, uygun fiyat ve %100 orijinal ürün garantisi.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      featuredImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
      ],
      badge: "En Çok Satan",
      inStock: true,
      specs: [
        { label: "Garanti Süresi", value: "2 Yıl Resmi Garanti" },
        { label: "Teslimat", value: "Aynı Gün Kargoda" },
        { label: "Menşei", value: "Türkiye / Yerli Üretim" }
      ],
      seoTitle: `Yeni Ürün | ${config.companyName}`,
      seoDescription: `En uygun fiyatlı ürün ve hizmetler ${config.companyName} güvencesiyle sizlerle.`,
      seoKeywords: `ürün, ${config.companyName}, ${config.sector}`
    };

    updateConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: [newProd, ...(prev.products?.items || [])]
      }
    }));
    setSelectedProductId(newProd.id);
  };

  const handleRemoveProduct = (id: string) => {
    updateConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: (prev.products?.items || []).filter(p => p.id !== id)
      }
    }));
    if (selectedProductId === id) {
      setSelectedProductId((config.products?.items || []).filter(p => p.id !== id)[0]?.id || null);
    }
  };

  const handleUpdateProduct = (field: keyof ProductItem, value: any) => {
    if (!selectedProductId) return;
    updateConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: (prev.products?.items || []).map(p =>
          p.id === selectedProductId ? { ...p, [field]: value } : p
        )
      }
    }));
  };

  const handleAddProductCategory = () => {
    if (!newProdCatName.trim()) return;
    const slug = slugify(newProdCatName.trim());
    const newCat: ProductCategory = {
      id: `prod-cat-${Date.now()}`,
      name: newProdCatName.trim(),
      slug
    };

    updateConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        categories: [...productCategories, newCat]
      }
    }));
    setNewProdCatName("");
    setShowAddProdCatModal(false);
  };

  const handleRemoveProductCategory = (catId: string) => {
    const updated = productCategories.filter(c => c.id !== catId);
    updateConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        categories: updated
      }
    }));
  };

  const selectedProduct = config.products?.items?.find(p => p.id === selectedProductId) || config.products?.items?.[0];

  // All unique custom color-coded CRM tags across config.leadTagDefinitions and config.leads
  const allCustomTags = useMemo(() => {
    const map = new Map<string, LeadCustomTag>();

    // 1. From siteConfig definitions
    (config.leadTagDefinitions || []).forEach(def => {
      map.set(def.name.toLowerCase(), {
        id: def.id || `tag-${def.name}`,
        name: def.name,
        color: def.color
      });
    });

    // 2. From leads customTags
    (config.leads || []).forEach(lead => {
      (lead.customTags || []).forEach(ct => {
        const key = ct.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: ct.id || `tag-${ct.name}`,
            name: ct.name,
            color: ct.color
          });
        }
      });

      // 3. From legacy string tags
      (lead.tags || []).forEach(t => {
        const key = t.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: `tag-${t}`,
            name: t,
            color: "blue"
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [config.leadTagDefinitions, config.leads]);

  const allExistingTags = useMemo(() => {
    return allCustomTags.map(t => t.name);
  }, [allCustomTags]);

  // Lead counts per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (config.leads || []).forEach(lead => {
      (lead.tags || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [config.leads]);

  // Leads CRM filter (Status, Custom Tags, Lead Score & Search Query)
  const filteredLeads = useMemo(() => {
    let result = (config.leads || []).filter(lead => {
      // 1. Status filter
      if (statusFilter === "unread") {
        const isUnread = lead.isRead === false || (lead.isRead === undefined && lead.status === "new");
        if (!isUnread || lead.status === "archived") return false;
      } else if (statusFilter === "archived") {
        if (lead.status !== "archived") return false;
      } else if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      } else if (statusFilter === "all") {
        // Active pipeline view excludes archived leads by default
        if (lead.status === "archived") return false;
      }

      // 2. Tag filter
      if (tagFilter !== "all") {
        if (!lead.tags || !lead.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Lead Score filter
      if (scoreFilter !== "all") {
        const res = calculateLeadScore(lead, config.leadNotifications?.scoring);
        if (res.priority !== scoreFilter) {
          return false;
        }
      }

      // 4. Search query filter (name, phone, email, service, message, or tags)
      if (leadSearchQuery.trim()) {
        const query = leadSearchQuery.toLowerCase().trim();
        const matchName = (lead.name || "").toLowerCase().includes(query);
        const matchPhone = (lead.phone || "").toLowerCase().includes(query);
        const matchEmail = (lead.email || "").toLowerCase().includes(query);
        const matchService = (lead.serviceOrProduct || "").toLowerCase().includes(query);
        const matchMessage = (lead.message || "").toLowerCase().includes(query);
        const matchTags = (lead.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchName && !matchPhone && !matchEmail && !matchService && !matchMessage && !matchTags) {
          return false;
        }
      }

      return true;
    });

    // 5. Sorting
    if (leadSortBy === "score-desc") {
      result = [...result].sort((a, b) => {
        const scoreA = calculateLeadScore(a, config.leadNotifications?.scoring).score;
        const scoreB = calculateLeadScore(b, config.leadNotifications?.scoring).score;
        return scoreB - scoreA;
      });
    } else if (leadSortBy === "score-asc") {
      result = [...result].sort((a, b) => {
        const scoreA = calculateLeadScore(a, config.leadNotifications?.scoring).score;
        const scoreB = calculateLeadScore(b, config.leadNotifications?.scoring).score;
        return scoreA - scoreB;
      });
    } else if (leadSortBy === "deal-desc") {
      result = [...result].sort((a, b) => (Number(b.dealValue) || 0) - (Number(a.dealValue) || 0));
    }

    return result;
  }, [config.leads, config.leadNotifications?.scoring, statusFilter, tagFilter, scoreFilter, leadSearchQuery, leadSortBy]);

  // CRM Entegrasyon Konfigürasyonu (HubSpot, Salesforce, Zoho, Zapier)
  const crmConfig = useMemo(() => config.crmIntegrations || getDefaultCrmConfig(), [config.crmIntegrations]);

  // Seçili Müşteri Talepleri (Bulk Selection)
  const selectedLeads = useMemo(() => {
    return (config.leads || []).filter(l => selectedLeadIds.includes(l.id));
  }, [config.leads, selectedLeadIds]);

  const isAllCurrentFilteredSelected =
    filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id));

  const handleToggleSelectAllFiltered = () => {
    if (isAllCurrentFilteredSelected) {
      const filteredIds = new Set(filteredLeads.map(l => l.id));
      setSelectedLeadIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredLeads.map(l => l.id);
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectLead = (leadId: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleClearSelectedLeads = () => {
    setSelectedLeadIds([]);
  };

  const handleBatchStatusUpdate = (newStatus: FormLead["status"]) => {
    if (selectedLeadIds.length === 0) return;
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).map(lead => {
        if (selectedLeadIds.includes(lead.id)) {
          return {
            ...lead,
            status: newStatus,
            ...(newStatus === "closed" && !lead.dealValue ? { dealValue: 1000 } : {}),
            ...(newStatus === "closed" && !lead.completedAt ? { completedAt: "Bugün" } : {})
          };
        }
        return lead;
      })
    }));
    setExportFeedback(`${selectedLeadIds.length} talebin durumu güncellendi.`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleBatchDeleteLeads = () => {
    if (selectedLeadIds.length === 0) return;
    if (window.confirm(`Seçili ${selectedLeadIds.length} adet talebi silmek istediğinize emin misiniz?`)) {
      updateConfig(prev => ({
        ...prev,
        leads: (prev.leads || []).filter(l => !selectedLeadIds.includes(l.id))
      }));
      setSelectedLeadIds([]);
      setExportFeedback("Seçili talepler silindi.");
      setTimeout(() => setExportFeedback(null), 3500);
    }
  };

  const handleQuickCrmSync = async (leadsToSync?: FormLead[]) => {
    const targetLeads = leadsToSync && leadsToSync.length > 0
      ? leadsToSync
      : selectedLeads.length > 0
      ? selectedLeads
      : filteredLeads;

    if (targetLeads.length === 0) {
      setExportFeedback("Senkronize edilecek müşteri talebi bulunamadı.");
      setTimeout(() => setExportFeedback(null), 3500);
      return;
    }

    setIsCrmQuickSyncing(true);
    try {
      const activeProvider = crmConfig.activeProvider;
      const setting = crmConfig.services[activeProvider];
      const res = await syncLeadsToCrm(targetLeads, activeProvider, setting, config.companyName);

      const updatedLogs = [...res.logs, ...(crmConfig.syncLogs || [])].slice(0, 100);
      updateConfig(prev => ({
        ...prev,
        crmIntegrations: {
          ...crmConfig,
          services: {
            ...crmConfig.services,
            [activeProvider]: {
              ...setting,
              lastSyncAt: new Date().toLocaleString("tr-TR")
            }
          },
          syncLogs: updatedLogs
        }
      }));

      setExportFeedback(`✓ ${res.message}`);
      setTimeout(() => setExportFeedback(null), 4500);
    } catch (err: any) {
      setExportFeedback(`Hata: ${err?.message || "CRM senkronizasyonu başarısız oldu."}`);
      setTimeout(() => setExportFeedback(null), 4500);
    } finally {
      setIsCrmQuickSyncing(false);
    }
  };

  // Revenue Tracker calculations
  const totalCompletedRevenue = useMemo(() => {
    return (config.leads || [])
      .filter(l => l.status === "closed")
      .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
  }, [config.leads]);

  const completedDealsCount = useMemo(() => {
    return (config.leads || []).filter(l => l.status === "closed").length;
  }, [config.leads]);

  // Lead count metrics: Active pipeline and Archived
  const archivedLeadsCount = useMemo(() => {
    return (config.leads || []).filter(l => l.status === "archived").length;
  }, [config.leads]);

  const activeLeadsCount = useMemo(() => {
    return (config.leads || []).filter(l => l.status !== "archived").length;
  }, [config.leads]);

  // Unprocessed or unread inquiries for notification badge (excludes archived)
  const unprocessedLeads = useMemo(() => {
    return (config.leads || []).filter(
      l => l.status !== "archived" && (l.isRead === false || (l.isRead === undefined && l.status === "new"))
    );
  }, [config.leads]);

  const unreadLeadsCount = unprocessedLeads.length;

  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [newLeadArrivalAlert, setNewLeadArrivalAlert] = useState<FormLead | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const prevLeadsCountRef = useRef<number>((config.leads || []).length);

  // Play gentle two-tone chime when a new lead arrives via the form
  const playLeadAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(698.46, now); // F5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // Graceful fallback if audio context is restricted
    }
  };

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
    };
    if (isNotificationMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationMenuOpen]);

  // Real-time detection of newly arrived leads (e.g. from preview form submission or test simulation)
  useEffect(() => {
    const currentCount = (config.leads || []).length;
    if (currentCount > prevLeadsCountRef.current) {
      const latestLead = config.leads?.[0];
      if (latestLead) {
        setNewLeadArrivalAlert(latestLead);
        playLeadAlertChime();
        const timer = setTimeout(() => {
          setNewLeadArrivalAlert(null);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
    prevLeadsCountRef.current = currentCount;
  }, [config.leads]);

  const handleUpdateLead = (leadId: string, updates: Partial<FormLead>) => {
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).map(l => {
        if (l.id !== leadId) return l;
        // If status changed away from 'new', auto-mark as read unless explicitly specified
        const updated = { 
          ...l, 
          ...updates,
          lastActivityAt: new Date().toISOString()
        };
        if (updates.status && updates.status !== "new" && updates.isRead === undefined) {
          updated.isRead = true;
        }
        if (updates.status === "archived" && !updated.archivedAt) {
          updated.archivedAt = new Date().toISOString();
          if (!updated.archivedReason) {
            updated.archivedReason = "Kullanıcı tarafından manuel arşivlendi.";
          }
        } else if (updates.status && updates.status !== "archived") {
          updated.archivedAt = undefined;
          updated.archivedReason = undefined;
        }
        return updated;
      })
    }));
  };

  const handleRestoreLead = (leadId: string) => {
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).map(l => {
        if (l.id !== leadId) return l;
        return restoreArchivedLead(l, "contacted");
      })
    }));
    setExportFeedback("Talep arşivden başarıyla çıkarıldı ve aktif CRM listesine geri alındı.");
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleMarkLeadAsRead = (leadId: string) => {
    handleUpdateLead(leadId, { isRead: true });
  };

  const handleMarkLeadAsUnread = (leadId: string) => {
    handleUpdateLead(leadId, { isRead: false });
  };

  const handleMarkAllLeadsAsRead = () => {
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).map(l => ({ ...l, isRead: true }))
    }));
  };

  const handleSimulateNewFormLead = () => {
    const sampleNames = ["Deniz Kaya", "Caner Yılmaz", "Burak Çetin", "Ayşe Demir", "Murat Arslan"];
    const sampleServices = ["7/24 Acil Oto Çekici", "Akü Takviye & Mobil Servis", "Şehirlerarası Araç Taşıma", "Ahtapot Vinçli Kurtarma"];
    const sampleMessages = [
      "Aracım arıza yaptı, yol yardım ve acil çekici fiyatı alabilir miyim?",
      "Otoparkta akü bitti, 20 dakika içinde gelebilir misiniz?",
      "Ankara'dan İstanbul'a araç nakliyesi için acil fiyat ve müsaitlik rica ediyorum.",
      "Lastik yarıldı, stepne yok. En yakın mobil yol yardım desteği rica ediyorum."
    ];
    const randomIndex = Math.floor(Math.random() * sampleNames.length);
    const timeNow = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const simulatedLead: FormLead = {
      id: "lead-" + Date.now(),
      date: `Bugün ${timeNow}`,
      name: sampleNames[randomIndex],
      phone: `05${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `${sampleNames[randomIndex].toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`,
      serviceOrProduct: sampleServices[Math.floor(Math.random() * sampleServices.length)],
      message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      sourcePage: "Web Teklif Formu (Canlı)",
      status: "new",
      isRead: false,
      dealValue: 1500 + Math.floor(Math.random() * 2500),
      tags: ["Canlı Form Başvurusu", "Yeni"]
    };

    handleAddLead(simulatedLead);
  };

  const handleAddLead = (newLead: FormLead) => {
    const scoreResult = calculateLeadScore(newLead, config.leadNotifications?.scoring);
    let scoredLead: FormLead = {
      ...newLead,
      leadScore: scoreResult.score,
      leadScorePriority: scoreResult.priority,
      leadScoreReasons: scoreResult.reasons
    };

    // Auto-run active automation rules if enabled
    if (config.leadAutomations?.enabled ?? true) {
      const autoRes = runAllAutomationRulesOnLead(scoredLead, config);
      scoredLead = autoRes.updatedLead;
      if (autoRes.logs.length > 0) {
        updateConfig(prev => ({
          ...prev,
          leadAutomations: {
            ...(prev.leadAutomations || ({} as any)),
            executionLogs: [...autoRes.logs, ...(prev.leadAutomations?.executionLogs || [])]
          }
        }));
      }
    }

    updateConfig(prev => ({
      ...prev,
      leads: [scoredLead, ...(prev.leads || [])]
    }));

    // Auto-sync to CRM if enabled
    if (config.crmIntegrations?.globalAutoSync) {
      const crmRes = autoSyncNewLeadIfEnabled(scoredLead, config);
      if (crmRes.log) {
        updateConfig(prev => ({
          ...prev,
          crmIntegrations: crmRes.updatedConfig.crmIntegrations
        }));
      }
    }

    // Auto-dispatch notification for qualifying leads
    if (config.leadNotifications?.enabled ?? true) {
      dispatchLeadNotification(scoredLead, config)
        .then(res => {
          if (res.log) {
            updateConfig(prev => ({
              ...prev,
              leadNotifications: {
                ...(prev.leadNotifications || ({} as any)),
                history: [res.log!, ...(prev.leadNotifications?.history || [])]
              }
            }));
          }
        })
        .catch(err => console.warn("Lead notification dispatch error:", err));
    }
  };

  const handleDeleteLead = (leadId: string) => {
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).filter(l => l.id !== leadId)
    }));
  };

  const handleAddTagToLead = (
    leadId: string,
    newTag: string | { name: string; color: string; id?: string }
  ) => {
    const tagName = typeof newTag === "string" ? newTag.trim() : newTag.name.trim();
    if (!tagName) return;
    const tagColor = typeof newTag === "string" ? "blue" : newTag.color || "blue";

    updateConfig(prev => {
      const existingDefs = prev.leadTagDefinitions || [];
      const updatedDefs = [...existingDefs];
      if (!updatedDefs.some(d => d.name.toLowerCase() === tagName.toLowerCase())) {
        updatedDefs.push({
          id: `tag-${Date.now()}`,
          name: tagName,
          color: tagColor
        });
      }

      const updatedLeads = (prev.leads || []).map(l => {
        if (l.id !== leadId) return l;

        const currentTags = l.tags || [];
        const currentCustomTags = l.customTags || [];

        // If lead already has this tag name, don't duplicate
        if (currentTags.some(t => t.toLowerCase() === tagName.toLowerCase())) {
          return l;
        }

        const newCustomTag: LeadCustomTag = {
          id: `ct-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: tagName,
          color: tagColor
        };

        return {
          ...l,
          tags: [...currentTags, tagName],
          customTags: [...currentCustomTags, newCustomTag]
        };
      });

      return {
        ...prev,
        leadTagDefinitions: updatedDefs,
        leads: updatedLeads
      };
    });
  };

  const handleRemoveTagFromLead = (leadId: string, tagToRemove: string) => {
    updateConfig(prev => ({
      ...prev,
      leads: (prev.leads || []).map(l => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          tags: (l.tags || []).filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()),
          customTags: (l.customTags || []).filter(ct => ct.name.toLowerCase() !== tagToRemove.toLowerCase())
        };
      })
    }));
  };

  // Manage Custom Color-Coded CRM Tags Modal
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);

  // Lead Detail View Modal & Private Notes
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<FormLead | null>(null);

  const activeDetailLead = useMemo(() => {
    if (!selectedLeadForDetail) return null;
    return (config.leads || []).find(l => l.id === selectedLeadForDetail.id) || selectedLeadForDetail;
  }, [config.leads, selectedLeadForDetail]);

  // Lead Zaman Çizelgesi (Timeline) Modal & Kronolojik İletişim Geçmişi
  const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<FormLead | null>(null);

  const activeTimelineLead = useMemo(() => {
    if (!selectedLeadForTimeline) return null;
    return (config.leads || []).find(l => l.id === selectedLeadForTimeline.id) || selectedLeadForTimeline;
  }, [config.leads, selectedLeadForTimeline]);

  // Export Leads to CSV / Excel
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalCategory, setExportModalCategory] = useState<"all" | "products" | "leads">("all");

  const handleExportLeads = () => {
    const leadsToExport = config.leads || [];
    if (leadsToExport.length === 0) {
      setExportFeedback("Dışa aktarılacak müşteri talebi (lead) bulunamadı.");
      setTimeout(() => setExportFeedback(null), 3500);
      return;
    }

    downloadLeadsCsv(leadsToExport, config.companyName);
    setExportFeedback(`${leadsToExport.length} adet form talebi başarıyla CSV olarak indirildi!`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  if (dashboardMode === "simple") {
    return (
      <div className="space-y-6 pb-24">
        <SimpleMerchantMode
          config={config}
          onChange={onChange}
          onPreview={onPreview}
          onDeploy={onDeploy}
          onSwitchToAdvanced={() => setDashboardMode("advanced")}
          onOpenGettingStarted={() => setIsGettingStartedOpen(true)}
          setupProgress={setupProgressPercent}
          onExportLeads={handleExportLeads}
          onOpenExportModal={() => {
            setExportModalCategory("all");
            setIsExportModalOpen(true);
          }}
          onOpenBackups={() => {
            setDashboardMode("advanced");
            setActiveTab("backups");
          }}
          onOpenAnalytics={() => {
            setDashboardMode("advanced");
            setActiveTab("performance-analytics");
          }}
          onOpenDomainSettings={() => {
            setDashboardMode("advanced");
            setActiveTab("domain-management");
          }}
          onOpenLeads={() => {
            setDashboardMode("advanced");
            setActiveTab("leads");
            setStatusFilter("new");
          }}
          onOpenAutomatedResponses={() => {
            setDashboardMode("advanced");
            setActiveTab("automated-responses");
          }}
          onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
          onNavigateTab={(tab) => {
            setDashboardMode("advanced");
            setActiveTab(tab as CustomerPanelTab);
          }}
        />

        {/* Lead Detail View & Private Notes Modal */}
        <LeadDetailModal
          isOpen={!!activeDetailLead}
          onClose={() => setSelectedLeadForDetail(null)}
          lead={activeDetailLead}
          config={config}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          allCustomTags={allCustomTags}
          allExistingTags={allExistingTags}
          onAddTag={(leadId, newTag) => handleAddTagToLead(leadId, newTag)}
          onRemoveTag={(leadId, tagToRemove) => handleRemoveTagFromLead(leadId, tagToRemove)}
          onOpenManageTagsModal={() => setIsManageTagsModalOpen(true)}
          onNavigateToEmailAutomations={() => setActiveTab("email-automations")}
        />

        {/* Universal Data Export Modal (Catalog & Leads in Excel/CSV) */}
        <DataExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          config={config}
          defaultCategory={exportModalCategory}
        />

        {/* CRM Custom Color-Coded Tags Manager Modal */}
        <ManageLeadTagsModal
          isOpen={isManageTagsModalOpen}
          onClose={() => setIsManageTagsModalOpen(false)}
          config={config}
          onUpdateConfig={updateConfig}
          onFilterByTag={(tagName) => {
            setDashboardMode("advanced");
            setActiveTab("leads");
            setTagFilter(tagName);
          }}
        />

        {/* Getting Started 10-Minute Checklist Modal */}
        <GettingStartedModal
          isOpen={isGettingStartedOpen}
          onClose={() => setIsGettingStartedOpen(false)}
          config={config}
          onChange={onChange}
          onNavigateTab={(tab) => {
            setDashboardMode("advanced");
            setActiveTab(tab);
          }}
          onPreview={onPreview}
          onDeploy={onDeploy}
          onTriggerAiContent={handleGenerateAiContent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 14-DAY TRIAL & WEBSITE QUOTA BANNER */}
      {trialStatus.isTrial && (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg transition-all ${
          trialStatus.isExpired 
            ? "bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-rose-500/50 text-white" 
            : "bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/40 text-white"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                  trialStatus.isExpired 
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>14 Günlük Ücretsiz Deneme Sürümü</span>
                </span>
                
                {trialStatus.isExpired ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                    🔴 Süre Sona Erdi
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    ⏳ Kalan Süre: {trialStatus.daysRemaining} Gün
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                  🌐 Web Sitesi Hakkı: {trialStatus.createdSitesCount} / {trialStatus.maxAllowedSites} Site Aktif
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {trialStatus.isExpired ? (
                  <strong className="text-rose-300">
                    14 günlük deneme süreniz sona erdi. Sitenizin Cloudflare Anycast üzerinde 0.02s hızında kesintisiz yayında kalması ve yönetim paneline erişebilmek için lütfen paket seçimi yapın.
                  </strong>
                ) : (
                  <span>
                    Deneme süreniz boyunca <strong>1 adet web sitesini</strong> Cloudflare Edge ağına bağlayabilir, AI içerik ve SEO araçlarını deneyimleyebilirsiniz. 2. site ve kesintisiz yayın için paket seçimi yapabilirsiniz.
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowSiteLimitModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Yeni bir web sitesi projesi ekleyin"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Yeni Web Sitesi Ekle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hosting-package")}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  trialStatus.isExpired
                    ? "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 animate-pulse"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950"
                }`}
              >
                <Rocket className="w-3.5 h-3.5 text-slate-950 fill-current" />
                <span>{trialStatus.isExpired ? "🚀 Paket Seç & Satış Sürecini Başlat" : "🚀 Paket Seç & Satın Al"}</span>
              </button>

              {/* Developer / Admin Test Simulation Button */}
              <button
                type="button"
                onClick={() => {
                  toggleTrialExpiredSimulation();
                  window.dispatchEvent(new CustomEvent("jetkur_auth_change", { detail: { user: user ? { ...user, trialExpired: !user.trialExpired } : null } }));
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono border border-slate-700 transition-all cursor-pointer"
                title="Test simülasyonu: 14 günlük sürenin dolduğunu veya devam ettiğini anında test edin"
              >
                🧪 {trialStatus.isExpired ? "Süreyi Yenile (Test)" : "Süre Bitti Simüle Et (Test)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 1-WEBSITE TRIAL LIMIT REACHED */}
      {showSiteLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-5 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold tracking-tight text-white">
                14 Günlük Deneme Sürümü Sınırı (1/1 Site)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ücretsiz 14 günlük deneme sürümünüz kapsamında <strong>1 adet web sitesi</strong> oluşturma ve yönetme hakkınız bulunmaktadır.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-amber-300">İkinci veya daha fazla web sitesi eklemek için:</div>
                <div className="text-slate-400 leading-relaxed">
                  3 Kademeli Üretim Paketlerimizden (Başlangıç, Kurumsal veya Ultra Edge Ajans) birini seçerek sınırsız veya çoklu site kotasına geçebilirsiniz.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSiteLimitModal(false);
                  setActiveTab("hosting-package");
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4 fill-current" />
                <span>Paketleri İncele &amp; Yükselt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSiteLimitModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRIAL EXPIRED SALES & UPGRADE REDIRECT */}
      {showTrialExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                14 Günlük Süre Doldu
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                14 Günlük Deneme Süreniz Sona Erdi
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Web siteniz Cloudflare 310+ Global Edge lokasyonunda 0.02 saniye açılış hızıyla hazırlandı. 
                Sitenizin yayında kalması, form taleplerini almaya devam etmesi ve yönetim paneline erişebilmeniz için lütfen size uygun JetKur paketini seçin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-amber-400 font-bold text-xs">Başlangıç</div>
                <div className="text-base font-black text-white mt-1">₺1.490<span className="text-[10px] text-slate-400">/yıl</span></div>
                <div className="text-[10px] text-slate-400 mt-1">1 Web Sitesi + Edge CDN</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 relative">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase">Popüler</span>
                <div className="text-amber-300 font-bold text-xs">Kurumsal Edge</div>
                <div className="text-base font-black text-white mt-1">₺2.990<span className="text-[10px] text-slate-400">/yıl</span></div>
                <div className="text-[10px] text-slate-300 mt-1">Özel Domain + AI SEO</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-cyan-400 font-bold text-xs">Ultra Ajans</div>
                <div className="text-base font-black text-white mt-1">₺5.490<span className="text-[10px] text-slate-400">/yıl</span></div>
                <div className="text-[10px] text-slate-400 mt-1">Çoklu Site + WhatsApp</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTrialExpiredModal(false);
                  setActiveTab("hosting-package");
                }}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4 fill-current" />
                <span>Paketleri İncele &amp; Satın Al</span>
              </button>

              <a
                href="https://wa.me/908503080000?text=Merhaba,%2014%20gunluk%20JetKur%20deneme%20surem%20bitti.%20Paket%20secimi%20ve%20satis%20sureci%20icin%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Satış Danışmanı</span>
              </a>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowTrialExpiredModal(false);
                  toggleTrialExpiredSimulation();
                  window.dispatchEvent(new CustomEvent("jetkur_auth_change", { detail: { user: user ? { ...user, trialExpired: !user.trialExpired } : null } }));
                }}
                className="text-[11px] text-slate-500 hover:text-slate-400 underline font-mono cursor-pointer"
              >
                [Geliştirici/Test: Süreyi Yeniden Başlat &amp; Paneli Aç]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner with Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              JetKur Yönetim Masası (Gelişmiş Stüdyo)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
              {config.siteType === "multi-page" ? "Çok Sayfalı Site" : "Tek Sayfa Landing"}
            </span>

            {/* Header Title Alert Notification Badge */}
            {unreadLeadsCount > 0 ? (
              <button
                type="button"
                id="header-title-lead-alert-badge"
                onClick={() => {
                  setActiveTab("leads");
                  setStatusFilter("new");
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[11px] font-bold transition-all cursor-pointer shadow-xs animate-pulse"
                title={`${unreadLeadsCount} adet yeni veya işlem bekleyen form talebi var. Görüntülemek için tıklayın.`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <BellRing className="w-3 h-3 text-rose-400" />
                <span>{unreadLeadsCount} Yeni Talep</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-mono border border-slate-700">
                <Check className="w-3 h-3 text-emerald-400" />
                Talepler Güncel
              </span>
            )}
          </div>
          
          <div className="flex items-start sm:items-center gap-3.5 pt-1">
            {/* Interactive Logo Avatar / Uploader Card */}
            <div className="relative group shrink-0">
              <input
                ref={headerLogoFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                disabled={isHeaderLogoProcessing}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleHeaderLogoFileSelected(e.target.files[0]);
                  }
                }}
              />
              
              <button
                type="button"
                id="header-company-logo-badge"
                onClick={() => setIsQuickLogoModalOpen(true)}
                title={effectiveLogo ? "Logoyu değiştir veya yönet (Tıklayın)" : "Logonuzu yükleyin (Tıklayın)"}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-amber-400 p-1 flex items-center justify-center overflow-hidden transition-all shadow-md group-hover:scale-105 cursor-pointer relative"
              >
                {isHeaderLogoProcessing ? (
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                ) : effectiveLogo ? (
                  <img
                    src={effectiveLogo}
                    alt={config.companyName || "Logo"}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-400">
                    <span className="text-base font-black">
                      {(config.companyName || "⚡").charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                      +Logo
                    </span>
                  </div>
                )}

                {/* Hover Quick Edit Badge */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                  <Camera className="w-4 h-4 text-amber-300" />
                </div>
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{config.companyName}</span>
                  <span className="text-slate-400 text-xs font-normal">({config.sector} • {config.city})</span>
                </h1>
                <button
                  type="button"
                  id="header-quick-logo-modal-btn"
                  onClick={() => setIsQuickLogoModalOpen(true)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Logo Yükleme & Yönetim Masasını Aç"
                >
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>{effectiveLogo ? "Logoyu Değiştir" : "+ Logo Yükle"}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>Yayın Adresi:</span>
                  <button
                    onClick={handleCopySubdomain}
                    className="font-mono text-amber-400 hover:underline flex items-center gap-1"
                    title="Yayın adresini kopyala"
                  >
                    <span>{config.cloudflare?.customDomain || `${config.cloudflare?.subdomain || 'sirket'}.hizliweb.site`}</span>
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <button
                  type="button"
                  id="header-connect-domain-btn"
                  onClick={() => setActiveTab("connect-custom-domain")}
                  className="px-2.5 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold border border-blue-500/40 transition-all flex items-center gap-1 cursor-pointer"
                  title="Kendi alan adınızı (.com, .com.tr) bağlayın ve Global Edge CNAME talimatlarını inceleyin"
                >
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>{config.cloudflare?.customDomain ? "Custom Domain Ayarları" : "+ Connect Custom Domain"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Header Notification Badge & Inquiries Alert Dropdown */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              id="header-lead-notifications-btn"
              onClick={() => setIsNotificationMenuOpen(prev => !prev)}
              className={`relative px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                unreadLeadsCount > 0
                  ? "bg-gradient-to-r from-rose-950/90 to-slate-900 text-rose-200 border border-rose-500/60 shadow-md ring-2 ring-rose-500/30 hover:border-rose-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title={
                unreadLeadsCount > 0
                  ? `${unreadLeadsCount} adet yeni veya işlem bekleyen müşteri talebi var`
                  : "Tüm form talepleri incelendi"
              }
            >
              <div className="relative flex items-center justify-center">
                {unreadLeadsCount > 0 ? (
                  <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-400" />
                )}
                {unreadLeadsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span>Talepler</span>
              <span
                id="header-lead-notification-badge-count"
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black border transition-all ${
                  unreadLeadsCount > 0
                    ? "bg-rose-500 text-white border-rose-400 shadow-xs animate-pulse"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {unreadLeadsCount}
              </span>
            </button>

            {/* Notification Popover Dropdown */}
            {isNotificationMenuOpen && (
              <div
                id="header-lead-notifications-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-white"
              >
                {/* Popover Header */}
                <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                      <BellRing className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">Gelen Form Talepleri</div>
                      <div className="text-[10px] text-slate-400">
                        {unreadLeadsCount > 0
                          ? `${unreadLeadsCount} adet işlem bekleyen talep`
                          : "Tüm talepler yanıtlandı"}
                      </div>
                    </div>
                  </div>
                  {unreadLeadsCount > 0 && (
                    <button
                      type="button"
                      id="popover-mark-all-read-btn"
                      onClick={handleMarkAllLeadsAsRead}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Tümünü Okundu Say
                    </button>
                  )}
                </div>

                {/* Popover Body */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {unprocessedLeads.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-200">Okunmamış Talep Yok</div>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Web sitenizdeki formlardan yeni bir müşteri talebi ulaştığında burada anında bildirim alacaksınız.
                      </p>
                    </div>
                  ) : (
                    unprocessedLeads.slice(0, 5).map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 hover:bg-slate-800/60 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="font-bold text-xs text-white">{lead.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{lead.date}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-medium">
                            {lead.serviceOrProduct}
                          </span>
                          <span className="font-mono text-slate-400">{lead.phone}</span>
                        </div>

                        {lead.message && (
                          <p className="text-[11px] text-slate-300 line-clamp-1 italic bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/80">
                            "{lead.message}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleMarkLeadAsRead(lead.id)}
                            className="text-[10px] text-slate-400 hover:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Okundu İşaretle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("leads");
                              setStatusFilter("new");
                              setIsNotificationMenuOpen(false);
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>CRM'de Aç →</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("leads");
                      setIsNotificationMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Inbox className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tüm Talepleri Gör ({config.leads?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    id="simulate-new-lead-header-btn"
                    onClick={handleSimulateNewFormLead}
                    className="shrink-0 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all cursor-pointer"
                    title="Yeni bir form talebi gelişi simüle edin (bildirim sesini ve sayacı test eder)"
                  >
                    + Simüle Et
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Header SEO Opportunity Alerts Badge & Direct Hub Trigger */}
          <button
            type="button"
            id="header-seo-opportunities-btn"
            onClick={() => setIsOpportunityCenterOpen(true)}
            className={`relative px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSeoOpportunities.length > 0
                ? "bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950 text-amber-200 border border-amber-500/60 shadow-md ring-2 ring-amber-500/30 hover:border-amber-400"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title={
              activeSeoOpportunities.length > 0
                ? `${activeSeoOpportunities.length} adet uygulanabilir SEO ve içerik fırsatı tespit edildi`
                : "Tüm SEO fırsatları incelendi"
            }
          >
            <div className="relative flex items-center justify-center">
              {activeSeoOpportunities.length > 0 ? (
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Sparkles className="w-4 h-4 text-slate-400" />
              )}
              {activeSeoOpportunities.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <span className="hidden sm:inline">SEO Fırsatları</span>
            <span
              id="header-seo-opportunity-badge-count"
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black border transition-all ${
                activeSeoOpportunities.length > 0
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                  : "bg-slate-700 text-slate-400 border-slate-600"
              }`}
            >
              {activeSeoOpportunities.length}
            </span>
          </button>

          {/* Lighthouse Performance Score Gauge (Compact Header Indicator) */}
          <PerformanceScoreGaugeWidget
            config={config}
            onChange={onChange}
            onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            variant="compact"
          />

          {/* Aggregated Site Health Score (Compact Header Indicator) */}
          <SiteHealthScoreCard
            config={config}
            onChange={onChange}
            onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            variant="compact"
          />

          <button
            type="button"
            onClick={() => setIsGettingStartedOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95"
            title="10 dakikalık kurulum rehberi ve kontrol listesi"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>10-Dk Kurulum Rehberi</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-amber-400 text-[10px] font-mono font-bold">
              %{setupProgressPercent}
            </span>
          </button>

          {/* RUN SEO AUDIT BUTTON (Triggers Meta Tags & Performance Metrics Analysis) */}
          <button
            type="button"
            id="header-run-seo-audit-btn"
            onClick={handleRunSeoAudit}
            disabled={isAuditingSeo}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
              activeTab === "seo-report"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 ring-2 ring-emerald-400"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/40"
            }`}
            title="Sitenin tüm meta etiketlerini ve Google Core Web Vitals performans metriklerini anlık analiz ederek SEO Raporu sekmesinde görüntüleyin"
          >
            <Activity className={`w-4 h-4 ${isAuditingSeo ? "animate-spin text-amber-300" : "text-emerald-200"}`} />
            <span>{isAuditingSeo ? "Analiz Ediliyor..." : "Run SEO Audit"}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-emerald-200 text-[10px] font-mono font-bold">
              %{seoHealthScore}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsSeoOptimizerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ SEO Auto-Optimizer</span>
          </button>

          <button
            type="button"
            id="header-generate-optimized-metadata-btn"
            onClick={() => setIsAiMetaOptimizerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-200 border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Gemini AI ile sitenizin sektörel anahtar kelimelerine göre optimize edilmiş meta başlık ve açıklamaları otomatik üretin"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Optimized Metadata</span>
          </button>

          {/* SEO COMPETITIVE ALERT BADGE / ACTION BUTTON */}
          <button
            type="button"
            id="header-competitive-alerts-btn"
            onClick={() => setActiveTab("competitive-alerts")}
            className={`relative px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
              activeTab === "competitive-alerts"
                ? "bg-rose-500/30 border-rose-400 text-rose-200 ring-2 ring-rose-500/50"
                : competitiveSummary.outrankedCount > 0
                ? "bg-gradient-to-r from-rose-950/70 to-amber-950/70 border-rose-500/60 text-rose-200 hover:border-rose-400"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600"
            }`}
            title="SEO Rekabet Alarmları: Rakiplerin sıralama değişikliklerini ve sitenizi geçen rakipleri anlık izleyin"
          >
            <div className="relative flex items-center justify-center">
              <BellRing className={`w-4 h-4 ${competitiveSummary.outrankedCount > 0 ? "text-rose-400 animate-bounce" : "text-amber-400"}`} />
              {competitiveSummary.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-ping" />
              )}
            </div>
            <span className="hidden sm:inline">SEO Rekabet Alarmı</span>
            {competitiveSummary.outrankedCount > 0 ? (
              <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[10px] font-mono shadow-xs animate-pulse">
                {competitiveSummary.outrankedCount} Rakip Önde!
              </span>
            ) : competitiveSummary.unreadCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black font-mono">
                {competitiveSummary.unreadCount} Yeni
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                Stabil
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDashboardMode("simple")}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ Kolay Esnaf Modu</span>
          </button>

          <button
            type="button"
            id="top-site-snapshot-btn"
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Tek Tıkla Site Snapshot: siteConfig.json ve tüm medya dosyalarını yerel offline yedek (.ZIP) olarak indirin"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>📸 Site Snapshot</span>
          </button>

          <button
            type="button"
            id="top-backups-btn"
            onClick={() => setActiveTab("backups")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "backups"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Otomatik günlük yedekleme ve sürüm geçmişini görüntüleyin"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Yedekler</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-950/80 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
              {backupCount}
            </span>
          </button>

          <button
            type="button"
            id="top-system-logs-btn"
            onClick={() => setActiveTab("system-logs")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "system-logs" || activeTab === "system-log"
                ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Otomatik günlük yedekleme tarih, durum ve dosya boyutu sistem günlüğü"
          >
            <ScrollText className="w-4 h-4 text-cyan-400" />
            <span>Sistem Günlüğü</span>
          </button>

          <button
            type="button"
            id="top-revenue-tracker-btn"
            onClick={() => setActiveTab("leads")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40"
                : "bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40"
            }`}
            title="Kapanan anlaşmaları ve ciro performansını görüntüleyin"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Ciro: ₺{totalCompletedRevenue.toLocaleString("tr-TR")}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold border border-emerald-500/30">
              {completedDealsCount}
            </span>
          </button>

          <button
            type="button"
            id="top-performance-analytics-btn"
            onClick={() => setActiveTab("performance-analytics")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "performance-analytics"
                ? "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Recharts ile lead dönüşüm ve ziyaretçi büyüme analitiğini görüntüleyin"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Analitik & Büyüme</span>
          </button>

          <button
            type="button"
            id="top-lead-inflow-trends-btn"
            onClick={() => {
              setActiveTab("leads");
              setTimeout(() => {
                const el = document.getElementById("recharts-lead-trends-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 border border-sky-500/40"
            title="Son 7 günlük lead akışı Recharts çizgi grafiğini görüntüleyin"
          >
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Son 7G Lead Trendi</span>
            <span className="px-1.5 py-0.2 rounded-md bg-sky-900 text-sky-200 text-[10px] font-mono font-bold border border-sky-500/30">
              Line Chart
            </span>
          </button>

          <button
            type="button"
            id="top-lead-insights-btn"
            onClick={() => setActiveTab("lead-insights")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "lead-insights"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Lead Kalite Dağılımı ve Yüksek Puanlı Kaynak Analizi"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Lead Insights</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-900 text-indigo-200 text-[10px] font-mono font-bold border border-indigo-500/30">
              Kalite Analizi
            </span>
          </button>

          <button
            type="button"
            id="top-lead-automations-btn"
            onClick={() => setActiveTab("lead-automations")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "lead-automations"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Lead Skor, Kaynak ve İletişim Kanalına Göre Otomatik Aksiyonlar"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Lead Otomasyon Kuralları</span>
            <span className="px-1.5 py-0.2 rounded-md bg-amber-900/60 text-amber-200 text-[10px] font-mono font-bold border border-amber-500/30">
              Trigger
            </span>
          </button>

          <button
            type="button"
            id="top-lead-mapping-btn"
            onClick={() => setActiveTab("lead-mapping")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "lead-mapping"
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="D3.js ile ilk reklam tıklamasından son form gönderimine kadar müşteri yolculuğu analizi"
          >
            <Route className="w-4 h-4 text-emerald-400" />
            <span>Lead Mapping &amp; Yolculuk</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-900/60 text-emerald-200 text-[10px] font-mono font-bold border border-emerald-500/30">
              D3.js
            </span>
          </button>

          <button
            type="button"
            id="top-marketing-attribution-btn"
            onClick={() => setActiveTab("marketing-attribution")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "marketing-attribution" || activeTab === "attribution"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="D3.js ile trafik kaynaklarının (Social, Organic, Paid Ads) ROI ve dönüşüm analitiği"
          >
            <PieChart className="w-4 h-4 text-indigo-400" />
            <span>Pazarlama Attribution</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-900/60 text-indigo-200 text-[10px] font-mono font-bold border border-indigo-500/30">
              D3 • ROI
            </span>
          </button>

          <button
            type="button"
            id="top-site-health-btn"
            onClick={() => setActiveTab("site-health")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "site-health" || activeTab === "site-health-performance"
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="D3.js ile Google Lighthouse yüklenme hızı, SEO ve Global Edge önbellekleme verimliliği"
          >
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Site Sağlığı &amp; Performans</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-900/60 text-emerald-200 text-[10px] font-mono font-bold border border-emerald-500/30">
              Lighthouse • D3
            </span>
          </button>

          <button
            type="button"
            id="top-qr-code-btn"
            onClick={() => setActiveTab("qr-code")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "qr-code"
                ? "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Masa standı, vitrin etiketi ve offline broşürler için dinamik QR kod üretin"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Kod & Masa Kartı</span>
          </button>

          <button
            type="button"
            id="top-ab-testing-btn"
            onClick={() => setActiveTab("ab-testing")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ab-testing"
                ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Hero A/B test varyantları karşılaştırma raporu ve dönüşüm analitiğini yönetin"
          >
            <Split className="w-4 h-4 text-purple-400" />
            <span>A/B Testleri</span>
            {config.abTesting?.enabled && config.abTesting.status === "active" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            id="top-media-library-btn"
            onClick={() => setActiveTab("media-library")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "media-library"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Medya Kütüphanesi & Global Edge Görsel Optimizasyonu"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Medya & Optimizasyon</span>
          </button>

          <button
            type="button"
            id="top-ai-image-optimizer-btn"
            onClick={() => setActiveTab("ai-image-optimizer")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ai-image-optimizer"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Yapay Zeka Destekli Görsel & Core Web Vitals Optimizasyonu (WebP/AVIF)"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Görsel (WebP/AVIF)</span>
          </button>

          <button
            type="button"
            id="top-ai-blog-engine-btn"
            onClick={() => setActiveTab("ai-blog-engine")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ai-blog-engine"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Yapay Zeka Destekli Uzun Blog Makalesi & SEO Motoru"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>AI Blog Motoru</span>
          </button>

          <button
            type="button"
            id="top-ai-content-planner-btn"
            onClick={() => setActiveTab("ai-content-planner")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ai-content-planner" || activeTab === "seo-content-planner"
                ? "bg-indigo-600 text-white shadow-md font-black ring-2 ring-indigo-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Gemini Destekli 30 Günlük SEO Blog İçerik Takvimi & Kitle Segmentleri"
          >
            <CalendarRange className="w-4 h-4 text-indigo-400" />
            <span>AI İçerik Planlayıcı (30 Gün)</span>
          </button>

          <button
            type="button"
            id="top-ai-seo-content-assistant-btn"
            onClick={() => setActiveTab("ai-seo-content-assistant")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ai-seo-content-assistant" || activeTab === "seo-content-assistant"
                ? "bg-indigo-600 text-white shadow-md font-black ring-2 ring-indigo-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Gemini Destekli Blog Taslakları ve Optimize Meta-İçerik Asistanı"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI İçerik Asistanı (Taslak & Meta)</span>
          </button>

          <button
            type="button"
            id="top-seo-trend-forecast-btn"
            onClick={() => setActiveTab("seo-trend-forecast")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "seo-trend-forecast" || activeTab === "trend-forecast"
                ? "bg-indigo-600 text-white shadow-md font-black ring-2 ring-indigo-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Gemini 3.8 Flash & Canlı Google Search Grounding ile 12 Aylık Yükselen Arama Trendleri"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>SEO Trend Tahmincisi</span>
          </button>

          <button
            type="button"
            id="top-market-share-benchmark-btn"
            onClick={() => setActiveTab("market-share-benchmark")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "market-share-benchmark" || activeTab === "market-share"
                ? "bg-indigo-600 text-white shadow-md font-black ring-2 ring-indigo-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Rakiplerle doğrudan domain otoritesi, anahtar kelime yoğunluğu ve site hızı metriklerini karşılaştıran Pazar Payı Kıyaslama Tablosu"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Pazar Payı Kıyaslama</span>
          </button>

          <button
            type="button"
            id="top-content-gap-map-btn"
            onClick={() => setActiveTab("content-gap-map")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "content-gap-map" || activeTab === "content-gap"
                ? "bg-rose-600 text-white shadow-md font-black ring-2 ring-rose-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Seçili rakiplerin içerik boşluklarını görselleştiren ve eksik kelimeleri gösteren İçerik Boşluğu Haritası"
          >
            <Compass className="w-4 h-4 text-rose-400" />
            <span>İçerik Boşluğu Haritası</span>
          </button>

          <button
            type="button"
            id="top-competitive-strategy-btn"
            onClick={() => setActiveTab("competitive-strategy")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "competitive-strategy" || activeTab === "seo-competitive-strategy"
                ? "bg-cyan-600 text-white shadow-md font-black ring-2 ring-cyan-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="D3.js Radar Çizelgesi ile Alan Adı Otoritesi, Kelime Yoğunluğu ve Hız Kıyaslaması"
          >
            <Target className="w-4 h-4 text-cyan-400" />
            <span>SEO Rekabet Stratejisi</span>
          </button>

          <button
            type="button"
            id="top-seo-executive-summary-btn"
            onClick={() => setActiveTab("seo-executive-summary")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "seo-executive-summary" || activeTab === "executive-summary"
                ? "bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Isı Haritası, Rakip Kıyaslama Tablosu ve Radar Çizelgesi ile Paydaş Sunumu ve İndirilebilir PDF Raporu"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>SEO Yönetici Özeti (PDF)</span>
          </button>

          <button
            type="button"
            id="top-security-audit-btn"
            onClick={() => setActiveTab("security-audit")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "security-audit"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title="Web Güvenlik Denetimi, HTTP Başlıkları & AI Zafiyet Taraması"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Güvenlik & AI Audit</span>
            {config.securityConfig?.lastAudit && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/40 text-emerald-300 font-black">
                {config.securityConfig.lastAudit.grade}
              </span>
            )}
          </button>

          <button
            type="button"
            id="top-export-data-btn"
            onClick={() => {
              setExportModalCategory("all");
              setIsExportModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Ürün kataloğu ve müşteri taleplerini Excel veya CSV formatında indirin"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Dışa Aktar</span>
          </button>

          <button
            type="button"
            id="top-stakeholder-pdf-report-btn"
            onClick={() => setIsStakeholderReportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-indigo-400/40"
            title="Müşteri paydaşları için mevcut site konfigürasyonunu ve performans metriklerini profesyonel A4 PDF raporu olarak dışa aktar"
          >
            <FileDown className="w-4 h-4 text-indigo-200" />
            <span>Paydaş Raporu (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Canlı Gör</span>
          </button>

          <button
            type="button"
            onClick={onDeploy}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md"
          >
            <Rocket className="w-4 h-4" />
            <span>Statik Yayınla & İndir</span>
          </button>
        </div>
      </div>

      {/* New Lead Arrival Real-time Alert Banner */}
      {newLeadArrivalAlert && (
        <div
          id="new-lead-arrival-alert-banner"
          className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-500/60 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300 text-white"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white font-mono animate-pulse">
                  YENİ FORM TALEBİ GELDİ!
                </span>
                <span className="text-xs text-slate-400 font-mono">{newLeadArrivalAlert.date}</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{newLeadArrivalAlert.name}</span>
                <span className="text-amber-400 font-normal">({newLeadArrivalAlert.serviceOrProduct})</span>
                <span className="text-slate-400 font-mono text-xs">• {newLeadArrivalAlert.phone}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 italic max-w-2xl">
                "{newLeadArrivalAlert.message}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              id="alert-banner-open-lead-btn"
              onClick={() => {
                setActiveTab("leads");
                setStatusFilter("new");
                setNewLeadArrivalAlert(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>Talebi CRM'de Aç & İncele →</span>
            </button>
            <button
              type="button"
              id="alert-banner-close-btn"
              onClick={() => setNewLeadArrivalAlert(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Streamlined Sidebar + Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Navigation Sidebar (Streamlined Grouping: Website Structure, Content & SEO, Publishing & CRM) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-5">
            
            {/* Group 1: Web Sitesi Mimarisi (Website Structure) - Design, Pages, Services, Products */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-lg border border-slate-100 mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <LayoutTemplate className="w-3.5 h-3.5 text-amber-600" />
                  <span>1. Web Sitesi Mimarisi</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Structure</span>
              </div>

              {/* 1.0 Quick Start Design Sets (Hızlı Tasarım Setleri) */}
              <button
                type="button"
                onClick={() => setActiveTab("design-presets")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "design-presets"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span>Hızlı Tasarım Setleri</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Hazır
                </span>
              </button>

              {/* 1.1 Design (Tasarım & Tema) */}
              <button
                type="button"
                onClick={() => setActiveTab("design-structure")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "design-structure" || activeTab === "design" || activeTab === "header-nav" || activeTab === "homepage-builder" || activeTab === "footer" || activeTab === "site-type"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Tasarım, Tema & Logo</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </button>

              {/* 1.1b Varlık Yönetimi & AI Görsel Stüdyosu (Imagen 3) */}
              <button
                type="button"
                id="sidebar-asset-manager-btn"
                onClick={() => setActiveTab("asset-manager")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "asset-manager"
                    ? "bg-slate-900 text-pink-300 shadow-xs ring-1 ring-pink-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-pink-500" />
                  <span>Varlık Yönetimi (Logo & AI)</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 font-mono">
                  Imagen
                </span>
              </button>

              {/* 1.2 Pages (Kurumsal & Özel Sayfalar) */}
              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pages"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Kurumsal & Özel Sayfalar</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {1 + (config.pages?.length || 0)}
                </span>
              </button>

              {/* 1.3 Services (Hizmet Sayfaları) */}
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "services"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Hizmetler & Hizmet Sayfaları</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {config.services?.items?.length || 0}
                </span>
              </button>

              {/* 1.4 Products (Ürün & Fiyat Kataloğu) */}
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "catalog"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Ürün Kataloğu & Fiyatlar</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {config.products?.items?.length || 0}
                </span>
              </button>

              {/* 1.4a Katalog İletişim & Özel Teklif Formu */}
              <button
                type="button"
                id="sidebar-catalog-contact-btn"
                onClick={() => setActiveTab("catalog-contact")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "catalog-contact"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Katalog İletişim Formu</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {config.catalogContactForm?.fields?.length || config.products?.contactForm?.fields?.length || 10} Alan
                </span>
              </button>

              {/* 1.4b Vergi & Fiyatlandırma Paneli (KDV) */}
              <button
                type="button"
                id="sidebar-tax-pricing-btn"
                onClick={() => setActiveTab("tax-pricing")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "tax-pricing"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Vergi & Fiyatlandırma</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {config.taxPricing?.priceIncludesVat === false ? "+KDV" : `%${config.taxPricing?.defaultVatRate || 20}`}
                </span>
              </button>

              {/* 1.4c AI Fiyatlandırma Zekası (3-Tier & Esneklik) */}
              <button
                type="button"
                id="sidebar-pricing-intelligence-btn"
                onClick={() => setActiveTab("pricing-intelligence")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "pricing-intelligence" || activeTab === "ai-pricing"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <span>AI Fiyatlandırma Zekası</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    3-Tier
                  </span>
                </div>
              </button>

              {/* 1.5 Testimonials (Müşteri Yorumları & Yıldız Puanları) */}
              <button
                type="button"
                id="sidebar-testimonials-btn"
                onClick={() => setActiveTab("testimonials")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "testimonials"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                  <span>Müşteri Yorumları & Puanlar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.testimonials?.enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sitede Aktif" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {config.testimonials?.items?.length || 0}
                  </span>
                </div>
              </button>

              {/* 1.6 Image Gallery (Fotoğraf & Masonry Vitrini) */}
              <button
                type="button"
                id="sidebar-gallery-btn"
                onClick={() => setActiveTab("gallery")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "gallery"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Fotoğraf Galerisi (Masonry)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.gallery?.enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sitede Aktif" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {config.gallery?.items?.length || 0}
                  </span>
                </div>
              </button>

              {/* 1.6b Medya Kütüphanesi & Cloudflare Edge Optimizasyonu (Media Library & Optimization) */}
              <button
                type="button"
                id="sidebar-media-library-btn"
                onClick={() => setActiveTab("media-library")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "media-library"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Medya & Optimizasyon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    WebP Edge
                  </span>
                </div>
              </button>

              {/* 1.6c AI Destekli Görsel & Core Web Vitals Optimizasyonu (AI Image Optimizer) */}
              <button
                type="button"
                id="sidebar-ai-image-optimizer-btn"
                onClick={() => setActiveTab("ai-image-optimizer")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-image-optimizer"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>AI Görsel & WebP/AVIF</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    AVIF + LCP
                  </span>
                </div>
              </button>

              {/* 1.7 Sıkça Sorulan Sorular (FAQ Accordion) */}
              <button
                type="button"
                id="sidebar-faqs-btn"
                onClick={() => setActiveTab("faqs")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "faqs"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Sıkça Sorulanlar (SSS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(config.faqs?.enabled ?? config.faq?.enabled) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sitede Aktif" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {config.faqs?.items?.length || config.faq?.items?.length || 0}
                  </span>
                </div>
              </button>
            </div>

            {/* Group 2: İçerik, SEO & İletişim (Content & SEO) */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-lg border border-slate-100 mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. İçerik & SEO</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Content</span>
              </div>

              {/* 2.0a SEO Report (Kapsamlı SEO & Hız Denetimi Raporu) */}
              <button
                type="button"
                id="sidebar-seo-report-btn"
                onClick={() => handleRunSeoAudit()}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-report"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>SEO Raporu (SEO Report)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Yeni
                  </span>
                </div>
              </button>

              {/* 2.0 SEO Auditor (SEO Denetçisi & Görsel Alt Metin Sağlığı) */}
              <button
                type="button"
                id="sidebar-seo-auditor-btn-top"
                onClick={() => setActiveTab("seo-auditor")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "seo-auditor"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>SEO Denetçisi (Auditor)</span>
                </div>
                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${
                  seoHealthScore >= 80 ? "bg-emerald-100 text-emerald-800" : seoHealthScore >= 50 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                }`}>
                  %{seoHealthScore}
                </span>
              </button>

              {/* 2.0b SEO Health Check (SEO Sağlık Denetimi) */}
              <button
                type="button"
                onClick={() => setActiveTab("seo-health")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "seo-health"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Detaylı SEO Teşhisi</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800">
                  Rapor
                </span>
              </button>

              {/* 2.1 General Info */}
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "general"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>Firma Bilgileri & İletişim</span>
                </div>
              </button>

              {/* 2.1b Dil Ayarları & Çoklu Dil (EN, DE, AR) */}
              <button
                type="button"
                id="sidebar-languages-btn"
                onClick={() => setActiveTab("languages")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "languages"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-indigo-500" />
                  <span>Dil Ayarları (Çoklu Dil)</span>
                </div>
                {(() => {
                  const langCfg = getEffectiveLanguageConfig(config);
                  const activeCount = (langCfg.activeLanguages || []).filter(l => l.enabled).length;
                  return (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {langCfg.enabled ? `${activeCount} Dil` : "Pasif"}
                    </span>
                  );
                })()}
              </button>

              {/* 2.2 Social Media Links (Instagram, LinkedIn, Twitter) */}
              <button
                type="button"
                onClick={() => setActiveTab("social-media")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "social-media"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-pink-500" />
                  <span>Sosyal Medya Linkleri</span>
                </div>
                {(config.socialMedia?.instagram || config.socialMedia?.linkedin || config.socialMedia?.twitter || config.footer?.instagram || config.footer?.linkedin || config.footer?.twitter) ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Aktif
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">0</span>
                )}
              </button>

              {/* 2.2a Social Media Post Scheduler (Ürün Linkli Otomasyon Zamanlayıcı) */}
              <button
                type="button"
                id="sidebar-social-scheduler-btn"
                onClick={() => {
                  setSchedulerPreselectedProductId(undefined);
                  setActiveTab("social-scheduler");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "social-scheduler" || activeTab === "social-post-scheduler"
                    ? "bg-slate-900 text-indigo-400 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Paylaşım Zamanlayıcı</span>
                </div>
                {(() => {
                  const queuedCount = config.socialScheduler?.posts?.filter(p => p.status === "queued").length || 0;
                  if (queuedCount > 0) {
                    return (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                        {queuedCount} Sırada
                      </span>
                    );
                  }
                  return <span className="text-[10px] text-slate-400 font-mono">0</span>;
                })()}
              </button>

              {/* 2.2b Social Media Feed Integration (Instagram & X Canlı Akış) */}
              <button
                type="button"
                id="sidebar-social-feed-btn"
                onClick={() => setActiveTab("social-feed")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "social-feed"
                    ? "bg-slate-900 text-pink-400 shadow-xs ring-1 ring-pink-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Canlı Sosyal Akış</span>
                </div>
                {config.socialFeed?.enabled ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold font-mono">
                    {config.socialFeed.posts?.length || 0} Gönderi
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Pasif</span>
                )}
              </button>

              {/* 2.2b WhatsApp Chat Widget (Yüzen Canlı Destek Butonu) */}
              <button
                type="button"
                id="sidebar-whatsapp-chat-btn"
                onClick={() => setActiveTab("whatsapp-chat")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "whatsapp-chat"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp Chat Widget</span>
                </div>
                {(config.whatsappWidget?.enabled ?? Boolean(config.whatsapp)) ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Kapalı</span>
                )}
              </button>

              {/* 2.3 Google SEO & OpenGraph */}
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "seo"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Google SEO & Sosyal Paylaşım</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  Meta & Snippet
                </span>
              </button>

              {/* 2.3b SEO Denetçisi & Görsel Alt Metin Sağlığı */}
              <button
                type="button"
                id="sidebar-seo-auditor-btn"
                onClick={() => setActiveTab("seo-auditor")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-auditor"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>SEO Denetçisi (Auditor)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Alt Metin & Skor</span>
                </span>
              </button>

              {/* 2.3c SEO Sağlık Skoru & AI Denetimi */}
              <button
                type="button"
                id="sidebar-seo-health-btn"
                onClick={() => setActiveTab("seo-health")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-health"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>SEO Sağlık Raporu</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 text-[10px] font-mono font-bold">
                  Teşhis
                </span>
              </button>

              {/* 2.3d Sayfa Bazlı SEO & Canonical Yöneticisi */}
              <button
                type="button"
                id="sidebar-page-seo-btn"
                onClick={() => setActiveTab("page-seo")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "page-seo"
                    ? "bg-slate-900 text-cyan-400 shadow-xs ring-1 ring-cyan-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>Sayfa Bazlı SEO &amp; Meta</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-mono font-bold">
                  Canonical &amp; OG
                </span>
              </button>

              {/* 2.3e SEO & Trafik Isı Haritası (D3.js) */}
              <button
                type="button"
                id="sidebar-seo-heatmap-btn"
                onClick={() => setActiveTab("seo-heatmap")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-heatmap"
                    ? "bg-slate-900 text-rose-400 shadow-xs ring-1 ring-rose-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>SEO Isı Haritası</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                  D3.js
                </span>
              </button>

              {/* 2.3f SEO Fırsat Alarmları (AI-Driven Opportunity Radar) */}
              <button
                type="button"
                id="sidebar-seo-opportunities-btn"
                onClick={() => setActiveTab("seo-opportunities")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-opportunities" || activeTab === "seo-opportunity-alerts"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>SEO Fırsat Alarmları</span>
                </div>
                {activeSeoOpportunities.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-black animate-pulse">
                    {activeSeoOpportunities.length} Fırsat
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono">
                    Güncel
                  </span>
                )}
              </button>

              {/* 2.3e SEO İlerleme & Sıralama Bildirimleri */}
              <button
                type="button"
                id="sidebar-seo-progress-btn"
                onClick={() => setActiveTab("seo-progress")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-progress" || activeTab === "seo-notifications"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>SEO İlerleme Bildirimleri</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Canlı SERP</span>
                </span>
              </button>

              {/* 2.3f Gerçek Zamanlı Meta Etiket Denetim Aracı */}
              <button
                type="button"
                id="sidebar-meta-auditor-btn"
                onClick={() => setActiveTab("meta-auditor")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "meta-auditor"
                    ? "bg-slate-900 text-rose-400 shadow-xs ring-1 ring-rose-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-rose-500" />
                  <span>Meta Denetim Aracı</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Gerçek Zamanlı</span>
                </span>
              </button>

              {/* 2.3g AI-Powered SEO Content Optimizer (Sektörel İçerik & Başlık Üretici) */}
              <button
                type="button"
                id="sidebar-seo-content-optimizer-btn"
                onClick={() => setActiveTab("seo-content-optimizer")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-content-optimizer"
                    ? "bg-slate-900 text-purple-300 shadow-xs ring-1 ring-purple-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <span>SEO İçerik Optimize Edici</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Sektörel</span>
                </span>
              </button>

              {/* 2.3h AI Content Meta-Optimizer (Anahtar Kelime Yoğunluğu & Okunabilirlik) */}
              <button
                type="button"
                id="sidebar-ai-content-meta-optimizer-btn"
                onClick={() => setActiveTab("ai-content-meta-optimizer")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-content-meta-optimizer"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>AI Content Meta-Optimizer</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>%2.5 Yoğunluk</span>
                </span>
              </button>

              {/* 2.3i AI Meta-Optimizer (Gemini Otomatik SERP Başlık & Açıklama) */}
              <button
                type="button"
                id="sidebar-ai-meta-optimizer-btn"
                onClick={() => setActiveTab("ai-meta-optimizer")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-meta-optimizer"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Meta-Optimizer</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Gemini SERP</span>
                </span>
              </button>

              {/* 2.3h Otomatik JSON-LD Schema.org Oluşturucu */}
              <button
                type="button"
                id="sidebar-schema-generator-btn"
                onClick={() => setActiveTab("schema-generator")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "schema-generator"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  <span>JSON-LD Şema Motoru</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Schema.org</span>
                </span>
              </button>

              {/* 2.3i Yerel SEO Şema Oluşturucu (LocalBusiness Structured Data) */}
              <button
                type="button"
                id="sidebar-local-seo-schema-btn"
                onClick={() => setActiveTab("local-seo-schema")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "local-seo-schema"
                    ? "bg-slate-900 text-blue-300 shadow-xs ring-1 ring-blue-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>Yerel SEO Şema Motoru</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>LocalBusiness</span>
                </span>
              </button>

              {/* 2.3 Blog & Articles */}
              <button
                type="button"
                onClick={() => setActiveTab("blog")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "blog"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Blog & Sektörel Makaleler</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {config.blog?.items?.length || 0}
                </span>
              </button>

              {/* 2.4 AI-Driven Blog Engine */}
              <button
                type="button"
                id="sidebar-ai-blog-engine-btn"
                onClick={() => setActiveTab("ai-blog-engine")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "ai-blog-engine"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Yapay Zeka Blog Motoru</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                  AI SEO
                </span>
              </button>

              {/* 2.4b AI SEO Content Planner (30-Day Gemini Calendar) */}
              <button
                type="button"
                id="sidebar-ai-content-planner-btn"
                onClick={() => setActiveTab("ai-content-planner")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-content-planner" || activeTab === "seo-content-planner"
                    ? "bg-slate-900 text-indigo-400 shadow-xs ring-1 ring-indigo-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarRange className="w-4 h-4 text-indigo-500" />
                  <span>AI SEO İçerik Planlayıcı</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 uppercase">
                  30 Gün
                </span>
              </button>

              {/* 2.4b2 AI SEO Content Assistant (Gemini Blog Outlines & Optimized Meta-Content) */}
              <button
                type="button"
                id="sidebar-ai-seo-content-assistant-btn"
                onClick={() => setActiveTab("ai-seo-content-assistant")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-seo-content-assistant" || activeTab === "seo-content-assistant"
                    ? "bg-slate-900 text-indigo-400 shadow-xs ring-1 ring-indigo-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>AI SEO İçerik Asistanı</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 uppercase">
                  Taslak & Meta
                </span>
              </button>

              {/* 2.4c SEO Trend Forecast (Gemini 3.8 Flash & Search Grounding 12-Month Predictions) */}
              <button
                type="button"
                id="sidebar-seo-trend-forecast-btn"
                onClick={() => setActiveTab("seo-trend-forecast")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-trend-forecast" || activeTab === "trend-forecast"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>SEO Trend Tahmincisi</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
                  12 Ay
                </span>
              </button>

              {/* 2.5 Competitive SEO Insight (Top 3 Rakip Kıyaslama & Eksik Anahtar Kelimeler) */}
              <button
                type="button"
                id="sidebar-competitive-seo-btn"
                onClick={() => setActiveTab("competitive-seo")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "competitive-seo"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-rose-500" />
                  <span>Competitive SEO Insight</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 uppercase">
                  Top 3 SERP
                </span>
              </button>

              {/* 2.5b SEO Rekabet Alarmları (Rakip Sıralama Değişimleri & Geçilme Uyarıları) */}
              <button
                type="button"
                id="sidebar-competitive-alerts-btn"
                onClick={() => setActiveTab("competitive-alerts")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "competitive-alerts" || activeTab === "seo-competitive-alerts"
                    ? "bg-slate-900 text-rose-400 shadow-xs ring-1 ring-rose-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className={`w-4 h-4 ${competitiveSummary.outrankedCount > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                  <span>SEO Rekabet Alarmları</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {competitiveSummary.outrankedCount > 0 ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase animate-pulse shadow-xs">
                      {competitiveSummary.outrankedCount} Rakip Önde
                    </span>
                  ) : competitiveSummary.unreadCount > 0 ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase font-mono">
                      {competitiveSummary.unreadCount} Yeni
                    </span>
                  ) : (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      Aktif
                    </span>
                  )}
                </div>
              </button>

              {/* 2.5b-3 Pazar Payı Rakip Analiz Paneli (D3.js Pazar Payı & Sıralama Kıyaslaması) */}
              <button
                type="button"
                id="sidebar-market-share-panel-btn"
                onClick={() => setActiveTab("market-share-panel" as CustomerPanelTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === ("market-share-panel" as CustomerPanelTab)
                    ? "bg-slate-900 text-indigo-400 shadow-xs ring-1 ring-indigo-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  <span>Pazar Payı Rakip Paneli</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 uppercase">
                  D3.js
                </span>
              </button>

              {/* 2.5c SEO Rekabet Stratejisi (D3.js Radar Çizelgesi ile 6-Eksenli Kıyaslama) */}
              <button
                type="button"
                id="sidebar-competitive-strategy-btn"
                onClick={() => setActiveTab("competitive-strategy")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "competitive-strategy" || activeTab === "seo-competitive-strategy"
                    ? "bg-slate-900 text-cyan-400 shadow-xs ring-1 ring-cyan-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-cyan-500" />
                  <span>SEO Rekabet Stratejisi</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 uppercase">
                  D3 Radar
                </span>
              </button>

              {/* 2.5c-2 Rakip Analiz Modülü (Doğrudan URL ile İçerik & Anahtar Kelime Kıyaslama) */}
              <button
                type="button"
                id="sidebar-competitor-url-analysis-btn"
                onClick={() => setActiveTab("competitor-url-analysis")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "competitor-url-analysis" || activeTab === "competitor-analysis"
                    ? "bg-slate-900 text-blue-400 shadow-xs ring-1 ring-blue-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Rakip Analiz Modülü</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 uppercase">
                  URL Tara
                </span>
              </button>

              {/* 2.5c-5 Yerel SEO Konum Haritası (Google Haritalar Local Pack & İlçe Arama Hacimleri) */}
              <button
                type="button"
                id="sidebar-local-seo-map-btn"
                onClick={() => setActiveTab("local-seo-map")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "local-seo-map"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Yerel SEO Konum Haritası</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
                  Local Pack
                </span>
              </button>

              {/* 2.5d SEO Yönetici Özeti & Paydaş Raporu (Isı Haritası + Kıyaslama + Radar PDF) */}
              <button
                type="button"
                id="sidebar-seo-executive-summary-btn"
                onClick={() => setActiveTab("seo-executive-summary")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "seo-executive-summary" || activeTab === "executive-summary"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>SEO Yönetici Özeti</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                  PDF Rapor
                </span>
              </button>

              {/* 2.6 AI Global SEO Agent (Search Grounding & Geo-Location Trends) */}
              <button
                type="button"
                id="sidebar-ai-global-seo-btn"
                onClick={() => setActiveTab("global-seo")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "global-seo" || activeTab === "ai-global-seo"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-indigo-500" />
                  <span>AI Global SEO Agent</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Grounding
                </span>
              </button>

              {/* 2.7 Bulk SEO Performance Export (Meta Tags, Content Gaps, Rankings & Health Audit) */}
              <button
                type="button"
                id="sidebar-bulk-seo-export-btn"
                onClick={() => setActiveTab("bulk-seo-export")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "bulk-seo-export" || activeTab === "seo-bulk-export"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-400/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Bulk SEO Export</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase flex items-center gap-1">
                  CSV Matrix
                </span>
              </button>
            </div>

            {/* Group 3: Yayınlama & Müşteri CRM (Publishing & Leads) */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-lg border border-slate-100 mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Yayın & CRM</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Operations</span>
              </div>

              {/* 3.1 Leads CRM & Revenue Tracker */}
              <button
                type="button"
                onClick={() => setActiveTab("leads")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "leads"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-emerald-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-emerald-600" />
                  <span>Form Talepleri & Ciro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadLeadsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono animate-pulse shadow-xs">
                      {unreadLeadsCount} yeni
                    </span>
                  )}
                  {totalCompletedRevenue > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono border border-emerald-200">
                      ₺{totalCompletedRevenue.toLocaleString("tr-TR")}
                    </span>
                  )}
                  {(config.leads || []).length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                      {(config.leads || []).length}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">0</span>
                  )}
                </div>
              </button>

              {/* 3.1b Lead Insights (Kalite Dağılımı & Edinme Kaynakları Analitiği) */}
              <button
                type="button"
                id="sidebar-lead-insights-btn"
                onClick={() => setActiveTab("lead-insights")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lead-insights"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Lead Insights &amp; Kalite</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <span>Grafik</span>
                </span>
              </button>

              {/* 3.1c Lead Otomasyon Kuralları (Skor, Kaynak & Kanal Aksiyonları) */}
              <button
                type="button"
                id="sidebar-lead-automations-btn"
                onClick={() => setActiveTab("lead-automations")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lead-automations"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Lead Otomasyon Kuralları</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <span>{config.leadAutomations?.rules?.length || 4} Kural</span>
                </span>
              </button>

              {/* 3.1d Lead Mapping (Müşteri Yolculuk Haritası - D3.js) */}
              <button
                type="button"
                id="sidebar-lead-mapping-btn"
                onClick={() => setActiveTab("lead-mapping")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lead-mapping"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Route className="w-4 h-4 text-emerald-500" />
                  <span>Lead Mapping &amp; Yolculuk</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span>D3.js</span>
                </span>
              </button>

              {/* 3.1e Pazarlama Otomasyonu (E-Bülten Kaynak Analizi & Hoş Geldin Kurgusu) */}
              <button
                type="button"
                id="sidebar-marketing-automation-btn"
                onClick={() => setActiveTab("marketing-automation")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "marketing-automation"
                    ? "bg-slate-900 text-purple-300 shadow-xs ring-1 ring-purple-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Pazarlama Otomasyonu</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <span>E-Bülten</span>
                </span>
              </button>

              {/* 3.1f Gelecek Ay Tahminleme (Önümüzdeki 30 Gün Satış & Lead - D3.js) */}
              <button
                type="button"
                id="sidebar-lead-forecasting-btn"
                onClick={() => setActiveTab("lead-forecasting")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lead-forecasting"
                    ? "bg-slate-900 text-cyan-300 shadow-xs ring-1 ring-cyan-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                  <span>Gelecek Ay Tahminleme</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                  <span>D3.js • 30G</span>
                </span>
              </button>

              {/* 3.1f2 Pazarlama Kaynak Dağılımı (Marketing Source Attribution - D3.js) */}
              <button
                type="button"
                id="sidebar-marketing-attribution-btn"
                onClick={() => setActiveTab("marketing-attribution")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "marketing-attribution" || activeTab === "attribution"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  <span>Pazarlama Attribution &amp; ROI</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <span>D3.js • ROI</span>
                </span>
              </button>

              {/* 3.1g CRM Entegrasyonları (HubSpot, Salesforce, Zoho, Zapier) */}
              <button
                type="button"
                id="sidebar-crm-integration-btn"
                onClick={() => setIsCrmModalOpen(true)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCrmModalOpen
                    ? "bg-slate-900 text-orange-300 shadow-xs ring-1 ring-orange-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-orange-500" />
                  <span>CRM Entegrasyonları</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{CRM_PROVIDER_META[crmConfig.activeProvider].name.split(" ")[0]}</span>
                </span>
              </button>

              {/* 3.1a Müşteri Erişim Portalı (Client Access Portal - Sipariş Durumu & Proje Dokümanları) */}
              <button
                type="button"
                id="sidebar-client-portal-btn"
                onClick={() => setActiveTab("client-portal")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "client-portal" || activeTab === "client-access-portal"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Müşteri Erişim Portalı</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                    {config.clientPortal?.clients?.length || 3} Müşteri
                  </span>
                </div>
              </button>

              {/* 3.1b Form Yönetimi (Açılır Menüler, Onay Kutuları & Dosya Yükleme) */}
              <button
                type="button"
                id="sidebar-form-management-btn"
                onClick={() => setActiveTab("form-management")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "form-management"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <span>Form Yönetimi (Özel Alanlar)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(config.customForm?.enabled ?? true) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Form Sitede Yayında" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {config.customForm?.fields?.length || 9} Alan
                  </span>
                </div>
              </button>

              {/* 3.1c Email Automations (Audit Log of Automated Emails & Individual Status Tracking) */}
              <button
                type="button"
                id="sidebar-email-automations-btn"
                onClick={() => setActiveTab("email-automations")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "email-automations"
                    ? "bg-slate-900 text-sky-300 shadow-xs ring-1 ring-sky-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MailCheck className="w-4 h-4 text-sky-400" />
                  <span>Email Automations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Audit Log Aktif" />
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    Audit Log
                  </span>
                </div>
              </button>

              {/* 3.1d Email Automation Settings (Personalized Thank You Email Templates) */}
              <button
                type="button"
                id="sidebar-email-automation-btn"
                onClick={() => setActiveTab("email-automation")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "email-automation" || activeTab === "email-automation-settings"
                    ? "bg-slate-900 text-sky-300 shadow-xs ring-1 ring-sky-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-sky-500" />
                  <span>Şablon & Kural Ayarları</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(config.leadThankYouEmail?.enabled ?? config.customForm?.thankYouEmail?.enabled ?? true) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Otomatik Yanıtlayıcı Aktif" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    Rich Text
                  </span>
                </div>
              </button>

              {/* 3.1e Yüksek Öncelikli Bildirimler & Slack (Notifications Panel) */}
              <button
                type="button"
                id="sidebar-notifications-btn"
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "notifications"
                    ? "bg-slate-900 text-rose-300 shadow-xs ring-1 ring-rose-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-4 h-4 text-rose-500" />
                  <span>Bildirimler & Slack</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(config.leadNotifications?.enabled ?? true) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Bildirim Sistemi Aktif" />
                  )}
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Lead Skor
                  </span>
                </div>
              </button>

              {/* 3.2 E-Bülten & Aboneler (Newsletter Subscribers & Email Marketing) */}
              <button
                type="button"
                id="tab-btn-newsletter"
                onClick={() => setActiveTab("newsletter")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "newsletter"
                    ? "bg-slate-900 text-purple-300 shadow-xs ring-1 ring-purple-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>E-Bülten & Aboneler</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.newsletter?.enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Form Sitede Aktif" />
                  )}
                  {(config.subscribers || []).length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold font-mono">
                      {(config.subscribers || []).length}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">0</span>
                  )}
                </div>
              </button>

              {/* 3.3b Performance Analytics (Recharts Lead Trendleri & Ziyaretçi Büyümesi) */}
              <button
                type="button"
                id="sidebar-performance-analytics-btn"
                onClick={() => setActiveTab("performance-analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "performance-analytics"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Performance Analytics</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                  Recharts
                </span>
              </button>

              {/* 3.3c Gerçek Zamanlı Trafik & Ziyaretçi (Real-time Traffic Overview - D3.js) */}
              <button
                type="button"
                id="sidebar-realtime-traffic-btn"
                onClick={() => setActiveTab("realtime-traffic")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "realtime-traffic"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>Gerçek Zamanlı Trafik</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>D3.js</span>
                </span>
              </button>

              {/* 3.3d Gelecek Performans Tahmincisi (D3.js 30 Günlük Büyüme Projeksiyonu) */}
              <button
                type="button"
                id="sidebar-performance-forecaster-btn"
                onClick={() => setActiveTab("performance-forecaster")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "performance-forecaster"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Gelecek Performans Tahmincisi</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>30G AI</span>
                </span>
              </button>

              {/* 3.3 Canlı Performans Monitörü (0.02s Sentetik Test) */}
              <button
                type="button"
                id="sidebar-performance-monitor-btn"
                onClick={() => setActiveTab("performance-monitor")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "performance-monitor"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Performans Monitörü</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-black">
                  Canlı 0.02s
                </span>
              </button>

              {/* 3.4 Performance Metrics (0.02s & Lighthouse 100/100) */}
              <button
                type="button"
                onClick={() => setActiveTab("performance")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "performance"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  <span>Performans & Hız Skoru</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">
                  0.02s
                </span>
              </button>

              {/* 3.4b Site Sağlığı ve Performans (Lighthouse & Cloudflare Edge D3.js) */}
              <button
                type="button"
                id="sidebar-site-health-btn"
                onClick={() => setActiveTab("site-health")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "site-health" || activeTab === "site-health-performance"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Site Sağlığı &amp; Performans</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                  D3.js
                </span>
              </button>

              {/* 3.4c Gelişmiş Performans Trendleri (90 Günlük Core Web Vitals & Bounce Rate D3.js) */}
              <button
                type="button"
                id="sidebar-performance-trends-btn"
                onClick={() => setActiveTab("performance-trends")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "performance-trends" || activeTab === "advanced-performance-trends"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Gelişmiş Performans Trendleri</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span>90G D3</span>
                </span>
              </button>

              {/* 3.3 Connect Custom Domain (Özel Alan Adı Bağla & Cloudflare CNAME) */}
              <button
                type="button"
                id="sidebar-connect-custom-domain-btn"
                onClick={() => setActiveTab("connect-custom-domain")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "connect-custom-domain"
                    ? "bg-slate-900 text-blue-300 shadow-xs ring-1 ring-blue-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Connect Custom Domain</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.cloudflare?.customDomain ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      Bağlı
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                      Edge CNAME
                    </span>
                  )}
                </div>
              </button>

              {/* 3.3b Alan Adı Yönetimi (Custom Domain & Cloudflare DNS) */}
              <button
                type="button"
                id="sidebar-custom-domain-btn"
                onClick={() => setActiveTab("domain-management")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "custom-domain" || activeTab === "cloudflare-domain" || activeTab === "domain-management"
                    ? "bg-slate-900 text-blue-300 shadow-xs ring-1 ring-blue-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Alan Adı Yönetimi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    DNS Araçları
                  </span>
                </div>
              </button>

              {/* 3.3b Otomatik DNS Kurulum Rehberi (Automated DNS Setup - CNAME & A) */}
              <button
                type="button"
                id="sidebar-automated-dns-btn"
                onClick={() => setActiveTab("automated-dns")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "automated-dns"
                    ? "bg-slate-900 text-cyan-300 shadow-xs ring-1 ring-cyan-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4 h-4 text-cyan-500" />
                  <span>Otomatik DNS Kurulumu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                    CNAME / A
                  </span>
                </div>
              </button>

              {/* 3.3b2 Cloudflare Edge Dağıtım Rehberi (Workers Sites & Pages) */}
              <button
                type="button"
                id="sidebar-cloudflare-edge-btn"
                onClick={() => setActiveTab("cloudflare-edge-guide")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "cloudflare-edge-guide"
                    ? "bg-slate-900 text-amber-300 shadow-xs ring-1 ring-amber-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare Edge Dağıtım</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    API &amp; Edge
                  </span>
                </div>
              </button>

              {/* 3.3c Web Güvenlik & Zafiyet Denetimi (AI Security Audit) */}
              <button
                type="button"
                id="sidebar-security-audit-btn"
                onClick={() => setActiveTab("security-audit")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "security-audit"
                    ? "bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Güvenlik & Zafiyet Denetimi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    AI Audit
                  </span>
                </div>
              </button>

              {/* 3.4 Hosting & 3 Lisans Paketi */}
              <button
                type="button"
                id="sidebar-hosting-package-btn"
                onClick={() => setActiveTab("hosting-package")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "hosting-package"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-amber-500" />
                  <span>Hosting & 3 Lisans Paketi</span>
                </div>
              </button>

              {/* 3.4 AI Writer */}
              <button
                type="button"
                onClick={() => setActiveTab("ai-writer")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "ai-writer"
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Yapay Zeka İçerik Fabrikası</span>
                </div>
              </button>

              {/* 3.5 Otomatik Günlük Yedekleme & Sürümler */}
              <button
                type="button"
                id="btn-tab-backups"
                onClick={() => setActiveTab("backups")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "backups"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>Günlük Yedekler & Sürümler</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {backupCount}
                </span>
              </button>

              {/* 3.5b Sistem Günlüğü (Otomatik Günlük Yedek Tarih, Başarı Durumu & Dosya Boyutu) */}
              <button
                type="button"
                id="sidebar-system-logs-btn"
                onClick={() => setActiveTab("system-logs")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "system-logs" || activeTab === "system-log"
                    ? "bg-slate-900 text-cyan-300 shadow-xs ring-1 ring-cyan-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ScrollText className="w-4 h-4 text-cyan-500" />
                  <span>Sistem Günlüğü</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Yedek Log</span>
                  </span>
                </div>
              </button>

              {/* 3.6 Dinamik QR Kod & Çevrimdışı Pazarlama Kiti */}
              <button
                type="button"
                id="btn-tab-qr-code"
                onClick={() => setActiveTab("qr-code")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "qr-code"
                    ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-amber-500" />
                  <span>Dinamik QR Kod & Masa Kartı</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Offline
                </span>
              </button>

              {/* 3.7 A/B Testleri & Hero Dönüşüm Karşılaştırma Raporu */}
              <button
                type="button"
                id="sidebar-ab-testing-btn"
                onClick={() => setActiveTab("ab-testing")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ab-testing"
                    ? "bg-slate-900 text-purple-400 shadow-xs ring-1 ring-purple-400/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Split className="w-4 h-4 text-purple-500" />
                  <span>A/B Testleri</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.abTesting?.enabled && config.abTesting.status === "active" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Test Canlıda Aktif" />
                  )}
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Hero Raporu
                  </span>
                </div>
              </button>

              {/* 3.8 Veri Dışa Aktarma (Excel & CSV) */}
              <button
                type="button"
                id="btn-sidebar-export-data"
                onClick={() => {
                  setExportModalCategory("all");
                  setIsExportModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Veri Dışa Aktar (Rapor)</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Excel & CSV
                </span>
              </button>
            </div>

            {/* Group 4: Üyelik, Müşteri Portali & VPS Dağıtım */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-lg border border-slate-100 mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>4. Üyelik & Dağıtım</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Security</span>
              </div>

              {/* 4.1 Kullanıcı Giriş & Yetkiler */}
              <button
                type="button"
                id="sidebar-user-auth-btn"
                onClick={() => setActiveTab("user-auth")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "user-auth" || activeTab === "user-management"
                    ? "bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-indigo-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <span>Kullanıcı & Yetki Yönetimi</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 uppercase">
                  RBAC
                </span>
              </button>

              {/* 4.2 Müşteri Giriş Portali */}
              <button
                type="button"
                id="sidebar-client-portal-btn"
                onClick={() => setActiveTab("client-portal")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "client-portal"
                    ? "bg-slate-900 text-emerald-300 shadow-xs ring-1 ring-emerald-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <span>Müşteri Erişim Portali</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
                  Canlı Takip
                </span>
              </button>

              {/* 4.3 Hostinger VPS & Coolify Dağıtım */}
              <button
                type="button"
                id="sidebar-coolify-deployment-btn"
                onClick={() => setActiveTab("coolify-deployment")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "coolify-deployment" || activeTab === "vps-deployment"
                    ? "bg-slate-900 text-purple-300 shadow-xs ring-1 ring-purple-500/40"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-purple-500" />
                  <span>Hostinger VPS + Coolify</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 uppercase">
                  jetkur.com.tr
                </span>
              </button>
            </div>

          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>0.02s Statik Altyapı</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                Hedef Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Yaptığınız her değişiklik anında statik HTML motoruna yansır. Sıfır veritabanı gecikmesi, sıfır sunucu maliyeti.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("performance-monitor")}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Canlı Performans Testi</span>
            </button>
          </div>
        </div>

        {/* Right Content Workspace */}
        <div className="lg:col-span-9 space-y-6">

          {/* Performance Critical Alert Bar (Conversion Drop & Traffic Anomaly Detector) */}
          <PerformanceCriticalAlertBar
            config={config}
            onChange={onChange}
            onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
          />

          {/* 0. ASSET MANAGEMENT & AI VISUAL STUDIO (IMAGEN 3) */}
          {activeTab === "asset-manager" && (
            <AssetManager
              config={config}
              updateConfig={updateConfig}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 1. GENERAL INFORMATION & HOMEPAGE SEO */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Stakeholder Executive Report Quick Card Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shrink-0">
                    <FileDown className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">Müşteri Paydaşları Yönetici Raporu (PDF)</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 font-mono">
                        A4 Formatı
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Mevcut site mimarisini, Core Web Vitals (0.02s) hız skorlarını, teknik SEO ve lead dönüşüm metriklerini kurumsal PDF raporu olarak dışa aktarın.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="overview-open-stakeholder-pdf-btn"
                  onClick={() => setIsStakeholderReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ring-1 ring-indigo-400/40"
                >
                  <FileDown className="w-4 h-4 text-indigo-200" />
                  <span>Raporu Aç & İndir</span>
                </button>
              </div>

              {/* Site Performance & Real-time Visitor Overview Card */}
              <SitePerformanceOverviewCard
                config={config}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* Automated Daily SEO Health Audit Tool & One-Click Fix Queue */}
              <SeoAutomatedAuditTool
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* Consolidated Site Health Score & Actionable Fix-It Card */}
              <SiteHealthScoreCard
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
                variant="full"
              />

              {/* Performance Score Gauge Widget (Simulated Lighthouse & Core Web Vitals) */}
              <PerformanceScoreGaugeWidget
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* Interactive D3.js SEO Heatmap Widget */}
              <SeoHeatmapWidget
                config={config}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* Real-time Traffic Overview Widget (D3.js Hourly Visitors & Bounce Rates) */}
              <RealtimeTrafficOverviewWidget
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
                onOpenFullView={() => setActiveTab("realtime-traffic")}
              />

              {/* Competitive SEO Insight Dashboard Widget */}
              <CompetitiveSeoWidget
                config={config}
                onChange={onChange}
                isCompactWidget={true}
                onOpenFullView={() => setActiveTab("competitive-seo")}
                onOpenAlertCenter={() => setActiveTab("competitive-alerts")}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* A/B Test Dönüşüm Hunisi Analizi (D3.js Conversion Funnel Widget) */}
              <AbTestConversionFunnelWidget
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* Gelecek Performans Tahmincisi Quick Card (D3.js 30 Günlük Büyüme Projeksiyonu) */}
              <PerformanceForecasterQuickCard
                config={config}
                onOpenFullView={() => setActiveTab("performance-forecaster")}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* AI Fiyatlandırma Zekası Quick Card (3-Tier & Esneklik) */}
              <PricingIntelligenceQuickCard
                config={config}
                onChange={onChange}
                onOpenFullView={() => setActiveTab("pricing-intelligence")}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />

              {/* AI Global SEO Agent Quick Card (Search Grounding & Geo Trends) */}
              <GlobalSeoQuickCard
                config={config}
                onOpenWorkspace={() => setActiveTab("global-seo")}
              />

              {/* SEO Trend Forecast Quick Card (Gemini 3.8 Flash & Google Search Grounding) */}
              <SeoTrendForecastQuickCard
                config={config}
                onOpenWorkspace={() => setActiveTab("seo-trend-forecast")}
              />

              {/* Bulk SEO Performance Export Quick Card (CSV & All Pages Matrix) */}
              <BulkSeoPerformanceQuickCard
                config={config}
                onOpenWorkspace={() => setActiveTab("bulk-seo-export")}
              />

              {/* Advanced Site Performance Trends Quick Card (D3.js 90-Day CWV & Bounce Rates) */}
              <AdvancedPerformanceTrendsQuickCard
                config={config}
                onOpenWorkspace={() => setActiveTab("performance-trends")}
              />

              {/* User Authentication & Team Roles Quick Card */}
              <UserAuthQuickCard
                onManageUsers={() => setActiveTab("user-auth")}
                onOpenClientPortal={() => setActiveTab("client-portal")}
              />

              {/* Dynamic QR Code & Marketing Quick Card */}
              <QrMarketingQuickCard
                config={config}
                onNavigateToQrStudio={() => setActiveTab("qr-code")}
              />

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Firma Temel Bilgileri & Ana Sayfa SEO</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    İletişim numaralarınız, çalışma saatleriniz ve Google arama motoru etiketleri.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiContent}
                  disabled={isAiWorking}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isAiWorking ? "animate-spin" : ""}`} />
                  <span>{isAiWorking ? "AI Yazıyor..." : "AI İle Otomatik Doldur"}</span>
                </button>
              </div>

              {/* Core Company Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Firma / İşletme Unvanı *</label>
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={(e) => updateConfig(p => ({ ...p, companyName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hizmet Sektörü</label>
                  <input
                    type="text"
                    value={config.sector}
                    onChange={(e) => updateConfig(p => ({ ...p, sector: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Şehir / Bölge</label>
                  <input
                    type="text"
                    value={config.city}
                    onChange={(e) => updateConfig(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Doğrudan Telefon (Tıkla Ara)</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => updateConfig(p => ({ ...p, phone: e.target.value }))}
                    placeholder="0532 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp İletişim Numarası</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer" title="Yüzen WhatsApp Sohbet Butonunu Aç/Kapat">
                      <input
                        type="checkbox"
                        checked={config.whatsappWidget?.enabled ?? Boolean(config.whatsapp)}
                        onChange={(e) => {
                          const isEnabled = e.target.checked;
                          updateConfig(p => ({
                            ...p,
                            whatsappWidget: {
                              ...(p.whatsappWidget || {
                                phoneNumber: p.whatsapp || "905320000000",
                                position: "bottom-right",
                                buttonStyle: "floating-pill",
                                buttonText: "WhatsApp İle Yazın",
                                defaultMessage: `Merhaba ${p.companyName}, web sitenizden ulaşıyorum. Fiyat ve detaylı bilgi almak istiyorum.`,
                                agentName: `${p.companyName} Müşteri Temsilcisi`,
                                agentSubtitle: "Genellikle birkaç dakika içinde yanıt verir",
                                popupEnabled: true,
                                callToAction: "Merhaba 👋 Size nasıl yardımcı olabiliriz?",
                                showBadgeDot: true
                              }),
                              enabled: isEnabled,
                              phoneNumber: p.whatsapp || (p.whatsappWidget?.phoneNumber || "905320000000")
                            }
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.whatsapp}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      updateConfig(p => ({
                        ...p,
                        whatsapp: newPhone,
                        whatsappWidget: {
                          ...(p.whatsappWidget || {
                            enabled: true,
                            position: "bottom-right",
                            buttonStyle: "floating-pill",
                            buttonText: "WhatsApp İle Yazın",
                            defaultMessage: `Merhaba ${p.companyName}, web sitenizden ulaşıyorum. Fiyat ve detaylı bilgi almak istiyorum.`,
                            agentName: `${p.companyName} Müşteri Temsilcisi`,
                            agentSubtitle: "Genellikle birkaç dakika içinde yanıt verir",
                            popupEnabled: true,
                            callToAction: "Merhaba 👋 Size nasıl yardımcı olabiliriz?",
                            showBadgeDot: true
                          }),
                          phoneNumber: newPhone
                        }
                      }));
                    }}
                    placeholder="905320000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-emerald-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
                    <span>
                      Yüzen Buton:{" "}
                      <strong className={config.whatsappWidget?.enabled ?? Boolean(config.whatsapp) ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                        {config.whatsappWidget?.enabled ?? Boolean(config.whatsapp) ? "Sitede Açık 🟢" : "Gizli ⚫"}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("whatsapp-chat")}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Detaylı Widget Ayarları & Simülasyon →
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">E-Posta Adresi</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => updateConfig(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Çalışma Saatleri</label>
                  <input
                    type="text"
                    value={config.workingHours}
                    onChange={(e) => updateConfig(p => ({ ...p, workingHours: e.target.value }))}
                    placeholder="Pzt - Cts: 08:30 - 19:30 veya 7/24 Açık"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vurucu Slogan</label>
                  <input
                    type="text"
                    value={config.slogan}
                    onChange={(e) => updateConfig(p => ({ ...p, slogan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Açık Adres / Konum</label>
                  <textarea
                    rows={2}
                    value={config.address}
                    onChange={(e) => updateConfig(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Local SEO & LocalBusiness Structured Data Sync Badge */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Google Yerel SEO & LocalBusiness Şeması</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Otomatik Senkronize
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Yukarıda girdiğiniz açık adres, telefon ve çalışma saatleri Google Haritalar, Bilgi Paneli ve Local 3-Pack arama sonuçları için anında Schema.org JSON-LD verisine dönüştürülür.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-general-goto-local-seo-schema"
                    onClick={() => setActiveTab("local-seo-schema")}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <span>Yerel SEO Şema Motoru</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Banner / Hero Background Photo Upload */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ImageIcon className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Ana Sayfa Hero Banner & Tanıtım Fotoğrafı
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Sitenizin en üstündeki ana karşılama görseli
                  </span>
                </div>

                <Base64ImageUpload
                  label="Hero Banner Arka Plan Fotoğrafı"
                  helperText="Bilgisayarınızdan fotoğraf seçin (Base64 olarak doğrudan siteConfig'e depolanır)"
                  value={config.hero?.bgImage || ""}
                  onChange={(newVal) => {
                    updateConfig(p => ({
                      ...p,
                      hero: {
                        ...p.hero,
                        bgImage: newVal,
                        slides: p.hero?.slides ? p.hero.slides.map((s, idx) => idx === 0 ? { ...s, bgImage: newVal } : s) : undefined
                      }
                    }));
                  }}
                  aspectRatio="21/9"
                />
              </div>

              {/* Homepage SEO & Meta Tags Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Globe className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Ana Sayfa Arama Motoru (SEO) & Schema.org Yapılandırması
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Ana Sayfa Başlığı (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={config.seo?.metaTitle || `${config.companyName} | ${config.sector} - ${config.city}`}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Ana Sayfa Açıklaması (Meta Description)
                    </label>
                    <textarea
                      rows={2}
                      value={config.seo?.metaDescription || config.slogan}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      value={config.seo?.keywords || `${config.companyName}, ${config.sector}, ${config.city}`}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, keywords: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Schema.org İşletme Tipi
                    </label>
                    <select
                      value={config.seo?.schemaType || "LocalBusiness"}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, schemaType: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="LocalBusiness">LocalBusiness (Yerel İşletme)</option>
                      <option value="ProfessionalService">ProfessionalService (Profesyonel Hizmet)</option>
                      <option value="AutoRepair">AutoRepair (Oto Servis / Çekici)</option>
                      <option value="LegalService">LegalService (Hukuk & Danışmanlık)</option>
                      <option value="MedicalBusiness">MedicalBusiness (Sağlık & Klinik)</option>
                      <option value="RealEstateAgent">RealEstateAgent (Emlak & Gayrimenkul)</option>
                      <option value="Store">Store (Mağaza & E-Ticaret)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Social Media Links Quick Card in General Settings */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Sosyal Medya Bağlantıları (Social Media Links)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Instagram, LinkedIn ve Twitter profillerinizi ekleyin; web sitenizin Header ve Footer alanında yayınlayın.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 flex-wrap">
                    <span className="font-semibold text-slate-400">Instagram:</span>
                    <span className="font-mono text-pink-400 truncate max-w-[140px]">
                      {config.socialMedia?.instagram || config.footer?.instagram || "Eklenmedi"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-400">LinkedIn:</span>
                    <span className="font-mono text-blue-400 truncate max-w-[140px]">
                      {config.socialMedia?.linkedin || config.footer?.linkedin || "Eklenmedi"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-400">Twitter / X:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[140px]">
                      {config.socialMedia?.twitter || config.footer?.twitter || "Eklenmedi"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSchedulerPreselectedProductId(undefined);
                      setActiveTab("social-scheduler");
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Paylaşım Zamanlayıcı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("social-media")}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shrink-0 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Profil Linkleri</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Floating Chat Widget Banner in General Settings */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Yüzen WhatsApp Canlı Destek Butonu (Floating Chat Widget)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sitenizin sağ/sol altında duran, tıklandığında mini sohbet karşılama penceresi açan ve ziyaretçileri WhatsApp'a bağlayan akıllı widget.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 flex-wrap">
                    <span className="font-semibold text-slate-400">Durum:</span>
                    <span className={`font-bold ${config.whatsappWidget?.enabled ?? Boolean(config.whatsapp) ? "text-emerald-400" : "text-slate-400"}`}>
                      {config.whatsappWidget?.enabled ?? Boolean(config.whatsapp) ? "🟢 Aktif (Sitede Yayında)" : "⚫ Pasif (Gizlendi)"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-400">Numara:</span>
                    <span className="font-mono text-emerald-300">
                      {config.whatsappWidget?.phoneNumber || config.whatsapp || "Tanımlanmadı"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-slate-400">Konum:</span>
                    <span className="text-slate-300">
                      {config.whatsappWidget?.position === "bottom-left" ? "Alt Sol" : "Alt Sağ"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("whatsapp-chat")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Widget'ı Yapılandır</span>
                </button>
              </div>
            </div>
            </div>
          )}

          {/* 2.2 SOCIAL MEDIA LINKS MANAGER */}
          {activeTab === "social-media" && (
            <SocialMediaManager
              config={config}
              onChange={onChange}
              onOpenPreview={onPreview}
              onNavigateToFeed={() => setActiveTab("social-feed")}
              onNavigateToScheduler={() => {
                setSchedulerPreselectedProductId(undefined);
                setActiveTab("social-scheduler");
              }}
            />
          )}

          {/* 2.2a SOCIAL MEDIA POST SCHEDULER (AUTOMATED POSTS WITH DIRECT PRODUCT LINKS) */}
          {(activeTab === "social-scheduler" || activeTab === "social-post-scheduler") && (
            <SocialPostScheduler
              config={config}
              onChange={onChange}
              onNavigateToSocialProfiles={() => setActiveTab("social-media")}
              onNavigateToCatalog={() => setActiveTab("catalog")}
              preselectedProductId={schedulerPreselectedProductId}
            />
          )}

          {/* 2.2b SOCIAL MEDIA LIVE FEED INTEGRATION (INSTAGRAM & X) */}
          {activeTab === "social-feed" && (
            <SocialFeedManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 2.2b WHATSAPP CHAT WIDGET MANAGER */}
          {activeTab === "whatsapp-chat" && (
            <WhatsAppChatManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 2. SERVICES & SERVICE PAGES MANAGER */}
          {activeTab === "services" && (
            <ServiceManager
              config={config}
              onChange={(updatedServices) =>
                updateConfig(prev => ({
                  ...prev,
                  services: {
                    ...prev.services,
                    items: updatedServices
                  }
                }))
              }
              onPreviewService={(slug) => onPreview()}
            />
          )}

          {/* 3. PRODUCT & PRICE CATALOG */}
          {activeTab === "catalog" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              {/* Vergi & KDV Fiyatlandırma Hızlı Erişim Bannerı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Vergi & Fiyatlandırma:</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          config.taxPricing?.priceIncludesVat === false 
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          {config.taxPricing?.priceIncludesVat === false 
                            ? `+ %${config.taxPricing?.defaultVatRate || 20} KDV Hariç` 
                            : `%${config.taxPricing?.defaultVatRate || 20} KDV Dahil`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        KDV oranları ve fiyat hesaplama modunu yönetin.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tax-pricing")}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1 shrink-0 transition-all shadow-xs"
                  >
                    <span>Vergi Paneli</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Katalog 'Contact Us' Formu:</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {config.catalogContactForm?.fields?.length || config.products?.contactForm?.fields?.length || 10} Özel Alan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Müşterilerin özel ölçü, adet ve teknik şartname göndermesi için form alanlarını yapılandırın.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-nav-to-catalog-contact-form"
                    onClick={() => setActiveTab("catalog-contact")}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-all shadow-xs"
                  >
                    <span>Formu Düzenle</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ürün & Fiyat Kataloğu Yönetimi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kategori tanımlayın, öne çıkarılmış kapak görseli ve çoklu galeri fotoğrafları yükleyin.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Export Product Catalog Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      id="btn-export-catalog-excel"
                      onClick={() => {
                        const items = config.products?.items || [];
                        if (items.length === 0) {
                          setExportFeedback("Dışa aktarılacak ürün bulunamadı.");
                          setTimeout(() => setExportFeedback(null), 3500);
                          return;
                        }
                        exportProductsToExcel(items, config.companyName);
                        setExportFeedback(`${items.length} ürün Excel (.xlsx) olarak indirildi!`);
                        setTimeout(() => setExportFeedback(null), 3500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-emerald-200 cursor-pointer"
                      title="Kataloğu Microsoft Excel (.xlsx) formatında indirin"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Excel</span>
                    </button>
                    <button
                      type="button"
                      id="btn-export-catalog-csv"
                      onClick={() => {
                        const items = config.products?.items || [];
                        if (items.length === 0) {
                          setExportFeedback("Dışa aktarılacak ürün bulunamadı.");
                          setTimeout(() => setExportFeedback(null), 3500);
                          return;
                        }
                        exportProductsToCsv(items, config.companyName);
                        setExportFeedback(`${items.length} ürün CSV formatında indirildi!`);
                        setTimeout(() => setExportFeedback(null), 3500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-slate-200 cursor-pointer"
                      title="Kataloğu CSV formatında indirin"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>CSV</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddProdCatModal(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Ürün Kategorileri</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Ürün Ekle</span>
                  </button>
                </div>
              </div>

              {/* Product Categories Modal / Drawer */}
              {showAddProdCatModal && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Ürün & Katalog Kategori Yönetimi
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddProdCatModal(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Kapat ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {productCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                      >
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{cat.name}</span>
                        {productCategories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProductCategory(cat.id)}
                            className="text-slate-500 hover:text-rose-400"
                            title="Kategoriyi Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newProdCatName}
                      onChange={(e) => setNewProdCatName(e.target.value)}
                      placeholder="Yeni Kategori Adı (Örn: Özel Paketler, Aksesuarlar)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductCategory}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Products Sidebar */}
                <div className="md:col-span-4 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Katalogdaki Ürünler ({config.products?.items?.length || 0})
                  </div>

                  <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                    {(config.products?.items || []).map((prod) => {
                      const isSelected = prod.id === (selectedProduct?.id || "");
                      const displayImg = prod.featuredImage || prod.image || (prod.images && prod.images[0]) || "";
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSelectedProductId(prod.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-slate-900 text-white border-amber-500 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {displayImg ? (
                              <img
                                src={displayImg}
                                alt={prod.title}
                                className="w-11 h-11 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-700/50"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold truncate">{prod.title}</div>
                              <div className="text-[11px] text-amber-500 font-bold font-mono">
                                {prod.price}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {prod.category || "Genel"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Product Editor */}
                <div className="md:col-span-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                  {selectedProduct ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Ürün Bilgileri & Fotoğraflar
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSchedulerPreselectedProductId(selectedProduct.id);
                              setActiveTab("social-scheduler");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-200 cursor-pointer shadow-2xs"
                            title="Bu ürün için otomatik sosyal medya paylaşımı zamanla"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Sosyal Medyada Paylaş & Zamanla</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(selectedProduct.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Ürünü Sil</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ürün / Hizmet Başlığı *</label>
                          <input
                            type="text"
                            value={selectedProduct.title}
                            onChange={(e) => handleUpdateProduct("title", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                          <select
                            value={selectedProduct.category || productCategories[0]?.name}
                            onChange={(e) => handleUpdateProduct("category", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          >
                            {productCategories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat *</label>
                          <input
                            type="text"
                            value={selectedProduct.price}
                            onChange={(e) => handleUpdateProduct("price", e.target.value)}
                            placeholder="Örn: 1.450 ₺"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-600 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Eski / İndirimsiz Fiyat</label>
                          <input
                            type="text"
                            value={selectedProduct.oldPrice || ""}
                            onChange={(e) => handleUpdateProduct("oldPrice", e.target.value)}
                            placeholder="Örn: 2.100 ₺"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-400 line-through bg-white"
                          />
                        </div>

                        {/* KDV & Vergi Özelleştirmesi */}
                        <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-amber-500" />
                              <span>KDV & Vergi Ayarları</span>
                            </span>
                            {(() => {
                              const effTax = getEffectiveTaxConfig(config);
                              const details = calculateProductTax(selectedProduct, effTax);
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  details.priceIncludesVat
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                }`}>
                                  {details.badgeText} ({details.formattedGross})
                                </span>
                              );
                            })()}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Ürüne Özel KDV Oranı:
                              </label>
                              <select
                                value={
                                  selectedProduct.taxExempt
                                    ? "exempt"
                                    : selectedProduct.vatRate !== undefined && selectedProduct.vatRate !== null
                                    ? String(selectedProduct.vatRate)
                                    : "default"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "default") {
                                    handleUpdateProduct("vatRate", undefined);
                                    handleUpdateProduct("taxExempt", false);
                                  } else if (val === "exempt") {
                                    handleUpdateProduct("taxExempt", true);
                                    handleUpdateProduct("vatRate", 0);
                                  } else {
                                    handleUpdateProduct("vatRate", Number(val));
                                    handleUpdateProduct("taxExempt", false);
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              >
                                <option value="default">Mağaza Varsayılanı (%{config.taxPricing?.defaultVatRate || 20})</option>
                                <option value="20">%20 Genel Standart</option>
                                <option value="10">%10 İndirimli</option>
                                <option value="1">%1 Temel</option>
                                <option value="0">%0 Sıfır KDV</option>
                                <option value="exempt">KDV&apos;den Muaf</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Fiyat KDV Durumu:
                              </label>
                              <select
                                value={
                                  selectedProduct.priceIncludesVat !== undefined
                                    ? selectedProduct.priceIncludesVat
                                      ? "true"
                                      : "false"
                                    : "default"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "default") {
                                    handleUpdateProduct("priceIncludesVat", undefined);
                                  } else {
                                    handleUpdateProduct("priceIncludesVat", val === "true");
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              >
                                <option value="default">
                                  Mağaza Varsayılanı ({config.taxPricing?.priceIncludesVat === false ? "KDV Hariç" : "KDV Dahil"})
                                </option>
                                <option value="true">Fiyat KDV Dahildir</option>
                                <option value="false">Fiyat KDV Hariçtir (+KDV)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ürün Rozeti (Badge)</label>
                          <input
                            type="text"
                            value={selectedProduct.badge || ""}
                            onChange={(e) => handleUpdateProduct("badge", e.target.value)}
                            placeholder="Örn: En Çok Satan veya %20 İndirim"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Stok Durumu</label>
                          <select
                            value={selectedProduct.inStock ? "true" : "false"}
                            onChange={(e) => handleUpdateProduct("inStock", e.target.value === "true")}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          >
                            <option value="true">Stokta Var / Hemen Teslim</option>
                            <option value="false">Tükendi / Sipariş Üzerine</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Kısa Özet Açıklama</label>
                          <input
                            type="text"
                            value={selectedProduct.shortDescription || ""}
                            onChange={(e) => handleUpdateProduct("shortDescription", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* Product Photo Gallery & Featured Image Manager */}
                      <div>
                        <Base64GalleryUpload
                          label="Ürün / Hizmet Fotoğrafları & Vitrin Görseli"
                          images={selectedProduct.images || (selectedProduct.image ? [selectedProduct.image] : [])}
                          featuredImage={selectedProduct.featuredImage || selectedProduct.image}
                          onChange={(updatedImages, newFeatured) => {
                            handleUpdateProduct("images", updatedImages);
                            const feat = newFeatured || updatedImages[0] || "";
                            handleUpdateProduct("featuredImage", feat);
                            handleUpdateProduct("image", feat);
                          }}
                        />
                      </div>

                      {/* Rich Text Editor for Product */}
                      <div>
                        <RichTextEditor
                          label="Detaylı Ürün / Hizmet Açıklaması (Görsel WYSIWYG Editör)"
                          value={selectedProduct.description}
                          onChange={(val) => handleUpdateProduct("description", val)}
                          minHeight="180px"
                          placeholder="Ürün özelliklerini, teknik detayları ve kullanım avantajlarını doğrudan biçimlendirerek yazın..."
                          helpText="Yazınızı seçip kalın, italik yapabilir, başlıklar (H2, H3), listeler, tablolar ve bağlantılar ekleyebilirsiniz."
                        />
                      </div>

                      {/* Product SEO */}
                      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Bu Ürüne Özel SEO Etiketleri & URL</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const autoSlug = slugifyProduct(selectedProduct.title);
                              const optTitle = `${selectedProduct.title} - ${selectedProduct.price || 'Fiyat'} | ${config.companyName}`.slice(0, 60);
                              const optDesc = `${selectedProduct.title} sadece ${selectedProduct.price || 'avantajlı fiyatlarla'}! ${selectedProduct.shortDescription ? selectedProduct.shortDescription.slice(0, 70) : 'Hızlı teslimat ve orijinal ürün garantisi'}.`.slice(0, 155);
                              const optKeywords = `${selectedProduct.title}, ${selectedProduct.category || 'ürün'}, ${selectedProduct.price || ''}, ${config.companyName}`;

                              handleUpdateProduct("slug", autoSlug);
                              handleUpdateProduct("seoTitle", optTitle);
                              handleUpdateProduct("seoDescription", optDesc);
                              handleUpdateProduct("seoKeywords", optKeywords);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI ile SEO & URL Optimize Et</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              URL Adresi (Slug)
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                                /urun-
                              </span>
                              <input
                                type="text"
                                value={selectedProduct.slug || slugifyProduct(selectedProduct.title)}
                                onChange={(e) => handleUpdateProduct("slug", slugify(e.target.value))}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-400 font-mono"
                                placeholder="ornek-urun-adi"
                              />
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                                .html
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">SEO Başlığı</label>
                            <input
                              type="text"
                              value={selectedProduct.seoTitle || selectedProduct.title}
                              onChange={(e) => handleUpdateProduct("seoTitle", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                              placeholder="Ürün adı | Firma Adı"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">SEO Açıklaması</label>
                            <input
                              type="text"
                              value={selectedProduct.seoDescription || selectedProduct.shortDescription || ""}
                              onChange={(e) => handleUpdateProduct("seoDescription", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                              placeholder="Google arama sonucu özeti"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">SEO Anahtar Kelimeler</label>
                            <input
                              type="text"
                              value={selectedProduct.seoKeywords || ""}
                              onChange={(e) => handleUpdateProduct("seoKeywords", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                              placeholder="ürün, kategori, fiyat"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Özel OpenGraph Görseli</label>
                            <input
                              type="text"
                              value={selectedProduct.ogImage || selectedProduct.featuredImage || selectedProduct.image || ""}
                              onChange={(e) => handleUpdateProduct("ogImage", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                              placeholder="https://... (boşsa kapak görseli)"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Lütfen soldan bir ürün seçin veya yeni ürün ekleyin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VERGİ & FİYATLANDIRMA (KDV) YÖNETİM PANELİ */}
          {activeTab === "tax-pricing" && (
            <TaxPricingManager
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onPreview={onPreview}
            />
          )}

          {/* DİL AYARLARI & ÇOKLU DİL YÖNETİM PANELİ */}
          {activeTab === "languages" && (
            <LanguageSettingsManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* TESTIMONIALS MANAGER */}
          {activeTab === "testimonials" && (
            <TestimonialsManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* GALLERY MANAGER (MASONRY IMAGE VITRINE) */}
          {activeTab === "gallery" && (
            <GalleryManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* MEDYA KÜTÜPHANESİ & CLOUDFLARE EDGE GÖRSEL OPTİMİZASYONU (MEDIA LIBRARY & OPTIMIZATION) */}
          {activeTab === "media-library" && (
            <MediaLibraryManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* AI DESTEKLİ GÖRSEL & CORE WEB VITALS OPTİMİZASYONU (AI IMAGE OPTIMIZER) */}
          {activeTab === "ai-image-optimizer" && (
            <AiImageOptimizer
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* WEB GÜVENLİK, HTTP BAŞLIKLARI & AI ZAFİYET DENETİMİ (SECURITY AUDIT) */}
          {activeTab === "security-audit" && (
            <SecurityAuditManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* VARLIK YÖNETİMİ & AI GÖRSEL STÜDYOSU (IMAGEN 3) */}
          {activeTab === "asset-manager" && (
            <AssetManager
              config={config}
              updateConfig={(updater) => updateConfig(updater)}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* SSS & FAQ ACCORDION MANAGER */}
          {activeTab === "faqs" && (
            <FaqManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 4. BLOG & ARTICLES CONTENT MANAGEMENT SYSTEM (CMS) */}
          {activeTab === "blog" && (
            <BlogManager
              config={config}
              onChange={(updated) => onChange(updated)}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.1 AI-DRIVEN BLOG ENGINE COMPONENT */}
          {activeTab === "ai-blog-engine" && (
            <AiBlogEngine
              config={config}
              onChange={(updated) => onChange(updated)}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onArticlePublished={() => {
                setActiveTab("blog");
              }}
            />
          )}

          {/* 4.1b AI SEO CONTENT PLANNER (30-DAY GEMINI EDITORIAL CALENDAR & AUDIENCE SEGMENTS) */}
          {(activeTab === "ai-content-planner" || activeTab === "seo-content-planner") && (
            <AiSeoContentPlanner
              config={config}
              onChange={(updated) => onChange(updated)}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onSendToAiBlog={(headline, primaryKeyword) => {
                sessionStorage.setItem("ai_blog_prefill_topic", headline);
                sessionStorage.setItem("ai_blog_prefill_keyword", primaryKeyword);
                setActiveTab("ai-blog-engine");
              }}
            />
          )}

          {/* 4.1b2 AI SEO CONTENT ASSISTANT (GEMINI BLOG OUTLINES & OPTIMIZED META-CONTENT) */}
          {(activeTab === "ai-seo-content-assistant" || activeTab === "seo-content-assistant") && (
            <AiSeoContentAssistant
              siteConfig={config}
              onUpdateSiteConfig={(updater) => onChange(updater(config))}
              onNavigateToBlogEngine={(topic, keyword) => {
                sessionStorage.setItem("ai_blog_prefill_topic", topic);
                sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
                setActiveTab("ai-blog-engine");
              }}
            />
          )}

          {/* 4.1c SEO TREND FORECAST (GEMINI 3.8 FLASH + GOOGLE SEARCH GROUNDING 12-MONTH PREDICTIONS) */}
          {(activeTab === "seo-trend-forecast" || activeTab === "trend-forecast") && (
            <SeoTrendForecast
              config={config}
              onChange={(updated) => onChange(updated)}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onSendToAiBlog={(headline, primaryKeyword) => {
                sessionStorage.setItem("ai_blog_prefill_topic", headline);
                sessionStorage.setItem("ai_blog_prefill_keyword", primaryKeyword);
                setActiveTab("ai-blog-engine");
              }}
            />
          )}

          {/* 4.2 COMPETITIVE SEO INSIGHT COMPONENT */}
          {activeTab === "competitive-seo" && (
            <CompetitiveSeoWidget
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onOpenAlertCenter={() => setActiveTab("competitive-alerts")}
            />
          )}

          {/* 4.2b SEO COMPETITIVE ALERT CENTER (RAKİP SIRALAMA DEĞİŞİMLERİ & GEÇİLME ALARMLARI) */}
          {(activeTab === "competitive-alerts" || activeTab === "seo-competitive-alerts") && (
            <SeoCompetitiveAlertCenter
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onSendToAiBlog={(keyword, draftTitle) => {
                sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
                sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
                setActiveTab("ai-blog-engine");
              }}
            />
          )}

          {/* 4.2c SEO COMPETITIVE STRATEGY (D3.js RADAR CHART VISUALIZER) */}
          {(activeTab === "competitive-strategy" || activeTab === "seo-competitive-strategy") && (
            <SeoCompetitiveStrategyVisualizer
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2c-2 RAKİP ANALİZ MODÜLÜ (DOĞRUDAN URL İLE OTOMATİK İÇERİK & ANAHTAR KELİME KIYASLAMA) */}
          {(activeTab === "competitor-url-analysis" || activeTab === "competitor-analysis") && (
            <CompetitorUrlAnalysisModule
              siteConfig={config}
              onUpdateSiteConfig={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2c-3 İÇERİK BOŞLUĞU HARİTASI (CONTENT GAP MAP & EKSİK ANAHTAR KELİMELER) */}
          {(activeTab === "content-gap-map" || activeTab === "content-gap") && (
            <ContentGapMap
              siteConfig={config}
              onUpdateSiteConfig={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2c-3b PAZAR PAYI RAKİP ANALİZ PANELİ (D3.JS PAZAR PAYI VE GOOGLE SIRALAMA KIYASLAMASI) */}
          {(activeTab === ("market-share-panel" as CustomerPanelTab) || activeTab === "market-share-panel") && (
            <MarketShareCompetitorAnalysisPanel
              siteConfig={config}
              onUpdateSiteConfig={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2c-4 PAZAR PAYI KIYASLAMA TABLOSU (MARKET SHARE BENCHMARK & DOĞRUDAN DA, YOĞUNLUK, HIZ KARŞILAŞTIRMASI) */}
          {(activeTab === "market-share-benchmark" || activeTab === "market-share") && (
            <MarketShareBenchmarkTable
              siteConfig={config}
              onUpdateSiteConfig={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2c-5 YEREL SEO KONUM HARİTASI (GOOGLE HARİTALAR LOCAL PACK & İLÇE ARAMA HACMİ) */}
          {(activeTab === "local-seo-map" || activeTab === "local-seo-location-map") && (
            <LocalSeoLocationMap
              siteConfig={config}
              onUpdateSiteConfig={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.2d SEO EXECUTIVE SUMMARY (PRINTABLE PDF REPORT & STAKEHOLDER PRESENTATION) */}
          {(activeTab === "seo-executive-summary" || activeTab === "executive-summary") && (
            <SeoExecutiveSummary
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 4.3 REAL-TIME TRAFFIC OVERVIEW (D3.js HOURLY VISITORS & BOUNCE RATE) */}
          {activeTab === "realtime-traffic" && (
            <div className="space-y-6">
              <RealtimeTrafficOverviewWidget
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />
            </div>
          )}

          {/* 4.4 GELECEK PERFORMANS TAHMİNCİSİ (D3.js 30 GÜNLÜK BÜYÜME PROJEKSİYONU) */}
          {activeTab === "performance-forecaster" && (
            <div className="space-y-6">
              <PerformanceForecaster
                config={config}
                onChange={onChange}
                onPreview={onPreview}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />
            </div>
          )}

          {/* 5. ABOUT & CUSTOM INDEPENDENT PAGES */}
          {activeTab === "pages" && (
            <CustomPagesManager
              config={config}
              onChange={(updated) => onChange(updated)}
            />
          )}

          {/* 6. DESIGN, LOGO & STRUCTURE (Unified Design Hub) */}
          {(activeTab === "design-structure" || activeTab === "design" || activeTab === "header-nav" || activeTab === "homepage-builder" || activeTab === "footer" || activeTab === "site-type") && (
            <DesignStructureManager
              config={config}
              onChange={(updated) => onChange(updated)}
              onPreview={onPreview}
              onOpenAssetManager={() => setActiveTab("asset-manager")}
            />
          )}

          {/* 6.5 DİNAMİK FORM YÖNETİMİ & ÖZEL ALANLAR (Açılır Menüler, Onay Kutuları, Dosya Yükleme) */}
          {activeTab === "form-management" && (
            <CustomFormManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateToLeads={() => setActiveTab("leads")}
              onNavigateToEmailAutomation={() => setActiveTab("email-automations")}
            />
          )}

          {/* KATALOG 'CONTACT US' & ÖZEL MÜŞTERİ ALANLARI FORMU */}
          {activeTab === "catalog-contact" && (
            <CatalogContactFormManager
              config={config}
              onChange={onChange}
              onNavigateToLeads={() => setActiveTab("leads")}
              onNavigateToCatalog={() => setActiveTab("catalog")}
            />
          )}

          {/* 6.6 EMAIL AUTOMATIONS (Detailed Audit Log of Automated Emails & Individual Status Tracking) */}
          {(activeTab === "email-automations" || activeTab === "automated-responses") && (
            <EmailAutomationsManager
              config={config}
              onChange={onChange}
              onUpdateLead={handleUpdateLead}
              onNavigateToLeads={() => setActiveTab("leads")}
              onPreview={onPreview}
            />
          )}

          {/* 6.6b EMAIL AUTOMATION SETTINGS (Personalized Thank You Email Templates with Rich Text) */}
          {(activeTab === "email-automation" || activeTab === "email-automation-settings") && (
            <EmailAutomationSettings
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateToLeads={() => setActiveTab("leads")}
              onNavigateToResponses={() => setActiveTab("email-automations")}
            />
          )}

          {/* 6.7 CLIENT ACCESS PORTAL (Secure Client Logins, Order Tracking & Project Documents) */}
          {(activeTab === "client-portal" || activeTab === "client-access-portal") && (
            <ClientAccessPortal
              config={config}
              onChange={onChange}
              onNavigateToCatalog={() => setActiveTab("catalog")}
            />
          )}

          {/* 7. LEADS CRM & REVENUE TRACKER */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              {/* REVENUE TRACKER HERO CARD */}
              <RevenueTrackerCard
                leads={config.leads || []}
                onUpdateLead={handleUpdateLead}
                onAddLead={handleAddLead}
                onSelectStatusFilter={(status) => setStatusFilter(status)}
                activeStatusFilter={statusFilter}
                companyName={config.companyName}
                onExportLeads={handleExportLeads}
              />

              {/* DAILY LEAD INFLOW TRENDS RECHARTS CARD (LAST 7 DAYS) */}
              <div id="recharts-lead-trends-section" className="scroll-mt-6">
                <DailyLeadTrendsChart
                  leads={config.leads || []}
                  companyName={config.companyName}
                  onSelectStatusFilter={(status) => setStatusFilter(status)}
                  defaultTimeframe="7d"
                  defaultChartStyle="line"
                />
              </div>

              {/* Quick Jump Banner to Gelecek Ay Tahminleme (D3.js) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Gelecek Ay Tahminleme • D3.js İleri Analitik</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">30 Gün Projeksiyonu</span>
                    </div>
                    <div className="text-sm font-black">
                      Geçmiş dönüşüm oranlarınıza göre önümüzdeki 30 günün beklenen satış hacmi ve lead sayısı
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-goto-lead-forecasting-banner"
                  onClick={() => setActiveTab("lead-forecasting")}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>30 Günlük Tahmin Raporu →</span>
                </button>
              </div>

              {/* Quick Jump Banner to Pazarlama Kaynak Dağılımı (Attribution & ROI - D3.js) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Pazarlama Kaynak Dağılımı • D3.js Attribution</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">ROI &amp; Dönüşüm</span>
                    </div>
                    <div className="text-sm font-black">
                      Social, Organic ve Paid Ads kanallarının yatırım getirisini (ROI) ve dönüşüm oranını D3 ile analiz edin
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-goto-marketing-attribution-banner"
                  onClick={() => setActiveTab("marketing-attribution")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <PieChart className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Pazarlama ROI Analizi →</span>
                </button>
              </div>

              {/* Quick Jump Banner to Performance Analytics Widget */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Performance Analytics & Ziyaretçi Büyümesi
                    </div>
                    <div className="text-sm font-black">
                      Lead Trendleri, Ziyaretçi Hacmi & Recharts Grafikleri
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("performance-analytics")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Grafikleri Görüntüle →</span>
                </button>
              </div>

              {/* Quick Jump Banner to Email Automation Settings */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950 border border-sky-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Email Automation Settings • Otomatik Yanıtlayıcı
                    </div>
                    <div className="text-sm font-black">
                      Yeni Gelen Taleplere Giden Zengin Metin (Rich Text) Şablonunu Düzenleyin
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-goto-automated-responses"
                    onClick={() => setActiveTab("email-automations")}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Email Automations (Audit Log)</span>
                  </button>
                  <button
                    type="button"
                    id="btn-goto-email-automation"
                    onClick={() => setActiveTab("email-automation")}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Şablon & Kural Ayarları →</span>
                  </button>
                </div>
              </div>

              {/* Client Access Portal Promo Banner in Leads CRM */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-700/50 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Müşteri Erişim Portalı (Client Access Portal)
                    </div>
                    <div className="text-sm font-bold text-white">
                      Müşterilerinize Güvenli Giriş Şifresi Verin • Canlı Sipariş & Proje Dokümanı Takibi
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-goto-client-portal"
                  onClick={() => setActiveTab("client-portal")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Müşteri Portalini Yönet →</span>
                </button>
              </div>

              {/* LEADS CRM LIST & STATUS FILTER */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Müşteri Form Talepleri & Satış Boru Hattı</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gelen taleplerin durumunu güncelleyin, kapanan satışların tutarını girin veya düzenleyin.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Kanban vs List */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        id="btn-switch-kanban-view"
                        onClick={() => setLeadViewMode("kanban")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          leadViewMode === "kanban"
                            ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                        title="Kanban Panosu Görünümü (Sürükle & Bırak ile durum güncelleme)"
                      >
                        <Kanban className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kanban Panosu</span>
                      </button>
                      <button
                        type="button"
                        id="btn-switch-list-view"
                        onClick={() => setLeadViewMode("list")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          leadViewMode === "list"
                            ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                        title="Klasik Liste Görünümü"
                      >
                        <List className="w-3.5 h-3.5 text-slate-600" />
                        <span>Liste</span>
                      </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Tümü ({(config.leads || []).length})
                      </button>
                      {unreadLeadsCount > 0 && (
                        <button
                          type="button"
                          id="btn-filter-unread-leads"
                          onClick={() => setStatusFilter("unread")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            statusFilter === "unread"
                              ? "bg-rose-500 text-white shadow-xs font-black"
                              : "text-rose-600 hover:text-rose-800 font-bold"
                          }`}
                        >
                          <BellRing className="w-3 h-3" />
                          <span>Okunmamış ({unreadLeadsCount})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setStatusFilter("new")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          statusFilter === "new" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Yeni ({(config.leads || []).filter(l => l.status === "new").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("contacted")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          statusFilter === "contacted" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        İletişim ({(config.leads || []).filter(l => l.status === "contacted").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("offered")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          statusFilter === "offered" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Teklif ({(config.leads || []).filter(l => l.status === "offered").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("closed")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          statusFilter === "closed" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:text-emerald-900"
                        }`}
                      >
                        <span>✓ Kapanan ({completedDealsCount})</span>
                      </button>
                    </div>

                    {unreadLeadsCount > 0 && (
                      <button
                        type="button"
                        id="btn-mark-all-read-crm"
                        onClick={handleMarkAllLeadsAsRead}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                        title="Tüm yeni gelen talepleri okundu olarak işaretle"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tümünü Okundu Say</span>
                      </button>
                    )}

                    {/* Export Leads Buttons (Excel & CSV) */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        id="btn-export-leads-excel"
                        onClick={() => {
                          const leadsToExport = statusFilter === "all" ? (config.leads || []) : filteredLeads;
                          if (leadsToExport.length === 0) {
                            setExportFeedback("Dışa aktarılacak müşteri talebi (lead) bulunamadı.");
                            setTimeout(() => setExportFeedback(null), 3500);
                            return;
                          }
                          exportLeadsToExcel(leadsToExport, config.companyName, statusFilter !== "all" ? statusFilter : undefined);
                          setExportFeedback(`${leadsToExport.length} müşteri talebi Excel (.xlsx) olarak indirildi!`);
                          setTimeout(() => setExportFeedback(null), 3500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Müşteri taleplerini Microsoft Excel (.xlsx) formatında indirin"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                        <span>Excel</span>
                      </button>

                      <button
                        type="button"
                        id="btn-export-leads-csv"
                        onClick={() => {
                          const leadsToExport = selectedLeadIds.length > 0 ? selectedLeads : (statusFilter === "all" ? (config.leads || []) : filteredLeads);
                          if (leadsToExport.length === 0) {
                            setExportFeedback("Dışa aktarılacak müşteri talebi (lead) bulunamadı.");
                            setTimeout(() => setExportFeedback(null), 3500);
                            return;
                          }
                          exportLeadsToCsv(leadsToExport, config.companyName, selectedLeadIds.length > 0 ? "secili-talepler" : (statusFilter !== "all" ? statusFilter : undefined));
                          setExportFeedback(`${leadsToExport.length} müşteri talebi CSV formatında indirildi!`);
                          setTimeout(() => setExportFeedback(null), 3500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Müşteri taleplerini CSV formatında indirin"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                        <span>CSV</span>
                      </button>

                      <button
                        type="button"
                        id="btn-export-leads-json"
                        onClick={() => {
                          const leadsToExport = selectedLeadIds.length > 0 ? selectedLeads : (statusFilter === "all" ? (config.leads || []) : filteredLeads);
                          if (leadsToExport.length === 0) {
                            setExportFeedback("Dışa aktarılacak müşteri talebi (lead) bulunamadı.");
                            setTimeout(() => setExportFeedback(null), 3500);
                            return;
                          }
                          exportLeadsToJson(leadsToExport, config.companyName, selectedLeadIds.length > 0 ? "secili-talepler" : (statusFilter !== "all" ? statusFilter : undefined));
                          setExportFeedback(`${leadsToExport.length} müşteri talebi JSON formatında indirildi!`);
                          setTimeout(() => setExportFeedback(null), 3500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Müşteri taleplerini JSON formatında indirin"
                      >
                        <Code className="w-3.5 h-3.5 text-indigo-200" />
                        <span>JSON</span>
                      </button>

                      <button
                        type="button"
                        id="btn-leads-export-modal"
                        onClick={() => {
                          setExportModalCategory("leads");
                          setIsExportModalOpen(true);
                        }}
                        className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Gelişmiş Raporlama & Filtreli Dışa Aktarma"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                    </div>

                    {/* Popüler CRM Servisleri (HubSpot, Salesforce) Tek Tıkla Entegrasyon */}
                    <button
                      type="button"
                      id="btn-crm-integration-settings"
                      onClick={() => setIsCrmModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer group border border-indigo-900/40"
                      title="HubSpot, Salesforce, Zoho veya Zapier CRM entegrasyon ayarları ve senkronizasyonu"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-amber-300 font-black tracking-tight">{CRM_PROVIDER_META[crmConfig.activeProvider].name.split(" ")[0]}</span>
                      <span className="text-slate-300 group-hover:text-white">CRM Ayarları</span>
                      <Zap className="w-3 h-3 text-amber-400 ml-0.5" />
                    </button>

                    {/* Form Yönetimi Sekmesine Hızlı Geçiş */}
                    <button
                      type="button"
                      id="btn-goto-form-management"
                      onClick={() => setActiveTab("form-management")}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Form alanlarını, açılır menüleri ve dosya yüklemeyi özelleştirin"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Form Alanlarını Düzenle</span>
                    </button>
                  </div>
                </div>

                {exportFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 transition-all">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{exportFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExportFeedback(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* LEAD SCORING & FORM ENGAGEMENT ANALYTICS BANNER */}
                <LeadScoringSummaryCard
                  leads={config.leads || []}
                  config={config}
                  activeScoreFilter={scoreFilter}
                  onSelectScoreFilter={(filter) => setScoreFilter(filter)}
                  onSimulateNewLead={handleSimulateNewFormLead}
                  onOpenScoringSettings={() => setActiveTab("notifications")}
                  onNavigateToInsights={() => setActiveTab("lead-insights")}
                />

                {/* CRM TAGS & SEARCH FILTER TOOLBAR */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Fast Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={leadSearchQuery}
                        onChange={(e) => setLeadSearchQuery(e.target.value)}
                        placeholder="Müşteri adı, telefon, mesaj veya etiket ile ara..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-2xs"
                      />
                      {leadSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setLeadSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                          title="Aramayı Temizle"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Status Summary, View Switcher, Sort & Reset */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 shrink-0">
                      {/* Sort Selector Dropdown */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <select
                          value={leadSortBy}
                          onChange={(e) => setLeadSortBy(e.target.value as any)}
                          className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                          title="Müşteri taleplerini sıralayın"
                        >
                          <option value="score-desc">🔥 Skor: En Yüksek Öncelik</option>
                          <option value="score-asc">🌱 Skor: Düşükten Yükseğe</option>
                          <option value="date">📅 Tarih (En Yeni)</option>
                          <option value="deal-desc">💰 Değer (En Yüksek Ciro)</option>
                        </select>
                      </div>

                      {/* View Mode Quick Switcher */}
                      <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          id="btn-lead-toggle-kanban"
                          onClick={() => setLeadViewMode("kanban")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            leadViewMode === "kanban"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-indigo-600 dark:text-slate-400"
                          }`}
                          title="Kanban Panosu"
                        >
                          <Kanban className="w-3 h-3" />
                          <span>Kanban</span>
                        </button>
                        <button
                          type="button"
                          id="btn-lead-toggle-list"
                          onClick={() => setLeadViewMode("list")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            leadViewMode === "list"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-indigo-600 dark:text-slate-400"
                          }`}
                          title="Liste Görünümü"
                        >
                          <List className="w-3 h-3" />
                          <span>Liste</span>
                        </button>
                      </div>

                      <span className="font-medium">
                        Sonuç: <strong className="text-slate-900 font-bold">{filteredLeads.length}</strong> / {(config.leads || []).length}
                      </span>
                      {(tagFilter !== "all" || statusFilter !== "all" || leadSearchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("all");
                            setTagFilter("all");
                            setLeadSearchQuery("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Tüm filtreleri ve aramayı sıfırla"
                        >
                          Filtreleri Sıfırla ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CRM Tag Pills Filter Strip */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mr-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>CRM Etiketi:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTagFilter("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tagFilter === "all"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Tümü ({(config.leads || []).length})
                    </button>

                    {allCustomTags.map((tagObj) => {
                      const isSelected = tagFilter.toLowerCase() === tagObj.name.toLowerCase();
                      const color = getLeadTagStyle(tagObj.name, tagObj.color);
                      const count = tagCounts[tagObj.name.toLowerCase()] || 0;

                      return (
                        <button
                          key={tagObj.id || tagObj.name}
                          type="button"
                          onClick={() => setTagFilter(isSelected ? "all" : tagObj.name)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-indigo-500 bg-indigo-50 border-indigo-400 text-indigo-950 font-black shadow-xs"
                              : `${color.bg} ${color.text} ${color.border} hover:opacity-85 shadow-2xs`
                          }`}
                          title={`"${tagObj.name}" etiketine sahip talepleri filtrele`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                          <span>{tagObj.name}</span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/10 text-current">
                            {count}
                          </span>
                          {isSelected && <X className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}

                    {/* Manage Custom Color-Coded Tags Button */}
                    <button
                      type="button"
                      onClick={() => setIsManageTagsModalOpen(true)}
                      className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
                      title="CRM renkli etiketleri tanımla, renklerini ve adlarını düzenle"
                    >
                      <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Etiketleri & Renkleri Yönet</span>
                    </button>
                  </div>
                </div>

                {/* Active Status Filter Notice in Kanban Mode */}
                {leadViewMode === "kanban" && statusFilter !== "all" && (
                  <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Durum filtresi aktif: <strong>{statusFilter === "new" ? "Yeni Talepler" : statusFilter === "contacted" ? "İletişime Geçildi" : statusFilter === "offered" ? "Teklif Verildi" : statusFilter === "closed" ? "Satış Tamamlandı" : statusFilter}</strong>. Tüm 4 satış aşamasını panoda yan yana görüp serbestçe sürüklemek için filtreyi temizleyebilirsiniz.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Tüm Aşamaları Göster
                    </button>
                  </div>
                )}

                {/* Bulk Action & Multi-Selection Bar (CSV/JSON Export & CRM Sync) */}
                {selectedLeadIds.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllCurrentFilteredSelected}
                          onChange={handleToggleSelectAllFiltered}
                          className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                        />
                        <span className="text-xs font-black text-white">
                          {selectedLeadIds.length} Talep Seçildi
                        </span>
                      </label>
                      <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                      <button
                        type="button"
                        onClick={handleToggleSelectAllFiltered}
                        className="text-xs text-indigo-300 hover:text-white font-bold cursor-pointer transition-colors"
                      >
                        {isAllCurrentFilteredSelected ? "Seçimi Bırak" : `Listedeki Tümünü Seç (${filteredLeads.length})`}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelectedLeads}
                        className="text-xs text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                      >
                        Temizle
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Export CSV Selected */}
                      <button
                        type="button"
                        id="btn-export-selected-csv"
                        onClick={() => {
                          exportLeadsToCsv(selectedLeads, config.companyName, "secili-talepler");
                          setExportFeedback(`${selectedLeads.length} seçili talep CSV olarak indirildi.`);
                          setTimeout(() => setExportFeedback(null), 3500);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-2xs"
                        title="Seçili talepleri CSV formatında indirin"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-300" />
                        <span>CSV ({selectedLeads.length})</span>
                      </button>

                      {/* Export JSON Selected */}
                      <button
                        type="button"
                        id="btn-export-selected-json"
                        onClick={() => {
                          exportLeadsToJson(selectedLeads, config.companyName, "secili-talepler");
                          setExportFeedback(`${selectedLeads.length} seçili talep JSON formatında indirildi.`);
                          setTimeout(() => setExportFeedback(null), 3500);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-2xs"
                        title="Seçili talepleri JSON formatında indirin"
                      >
                        <Code className="w-3.5 h-3.5 text-amber-300" />
                        <span>JSON ({selectedLeads.length})</span>
                      </button>

                      {/* One-Click CRM Sync Selected */}
                      <button
                        type="button"
                        id="btn-sync-selected-crm"
                        disabled={isCrmQuickSyncing}
                        onClick={() => handleQuickCrmSync(selectedLeads)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        title={`Seçili talepleri ${CRM_PROVIDER_META[crmConfig.activeProvider].name} CRM servisine tek tıkla senkronize et`}
                      >
                        {isCrmQuickSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>{CRM_PROVIDER_META[crmConfig.activeProvider].name.split(" ")[0]}'e Aktar ({selectedLeads.length})</span>
                      </button>

                      {/* Batch Status Change */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBatchStatusUpdate(e.target.value as any);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 outline-none cursor-pointer"
                        title="Seçili taleplerin durumunu toplu güncelle"
                      >
                        <option value="" disabled className="bg-slate-900 text-white">Durum Değiştir...</option>
                        <option value="new" className="bg-slate-900 text-white">🟢 Yeni Talep Yap</option>
                        <option value="contacted" className="bg-slate-900 text-white">💬 İletişime Geçildi</option>
                        <option value="offered" className="bg-slate-900 text-white">📑 Teklif Verildi</option>
                        <option value="closed" className="bg-slate-900 text-white">🏆 Satış Tamamlandı</option>
                      </select>

                      {/* Batch Delete */}
                      <button
                        type="button"
                        onClick={handleBatchDeleteLeads}
                        className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                        title="Seçili talepleri sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Select All Strip for List View */}
                {leadViewMode === "list" && filteredLeads.length > 0 && selectedLeadIds.length === 0 && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={handleToggleSelectAllFiltered}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">Tümünü Seç ({filteredLeads.length} Talep)</span>
                    </label>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Seçili talepleri tek tıkla CSV/JSON indirebilir veya CRM'e aktarabilirsiniz.
                    </span>
                  </div>
                )}

                {filteredLeads.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <Inbox className="w-12 h-12 mx-auto text-slate-300" />
                    <div className="text-sm font-bold text-slate-700">Filtreye Uygun Form Bildirimi Yok</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {statusFilter === "all" && tagFilter === "all" && !leadSearchQuery
                        ? "Ziyaretçiler web sitenizdeki iletişim veya teklif formunu doldurduğunda anında burada listelenecektir."
                        : "Seçili filtre veya arama kriterine ait talep bulunamadı. Yukarıdan filtreleri sıfırlayabilirsiniz."}
                    </p>
                    {(statusFilter !== "all" || tagFilter !== "all" || leadSearchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("all");
                          setTagFilter("all");
                          setLeadSearchQuery("");
                        }}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Tüm Talepleri Göster
                      </button>
                    )}
                  </div>
                ) : leadViewMode === "kanban" ? (
                  <LeadKanbanBoard
                    leads={filteredLeads}
                    config={config}
                    allCustomTags={allCustomTags}
                    allExistingTags={allExistingTags}
                    selectedLeadIds={selectedLeadIds}
                    onToggleSelectLead={handleToggleSelectLead}
                    onUpdateLead={handleUpdateLead}
                    onDeleteLead={handleDeleteLead}
                    onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                    onOpenLeadTimeline={(lead) => setSelectedLeadForTimeline(lead)}
                    onAddTag={(leadId, newTag) => handleAddTagToLead(leadId, newTag)}
                    onRemoveTag={(leadId, tagToRemove) => handleRemoveTagFromLead(leadId, tagToRemove)}
                    onOpenManageTagsModal={() => setIsManageTagsModalOpen(true)}
                    onMarkLeadAsRead={handleMarkLeadAsRead}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          selectedLeadIds.includes(lead.id)
                            ? "border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30"
                            : lead.status === "closed"
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Checkbox for selection */}
                          <div className="pt-1 shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => handleToggleSelectLead(lead.id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              title="Talebi seç"
                            />
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{lead.name}</span>
                            {(lead.isRead === false || (lead.isRead === undefined && lead.status === "new")) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider font-mono shadow-xs animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                YENİ TALEP
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                              {lead.serviceOrProduct}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{lead.date}</span>

                            {(lead.isRead === false || (lead.isRead === undefined && lead.status === "new")) && (
                              <button
                                type="button"
                                onClick={() => handleMarkLeadAsRead(lead.id)}
                                className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Okundu olarak işaretle"
                              >
                                <Check className="w-3 h-3 text-rose-600" />
                                <span>Okundu İşaretle</span>
                              </button>
                            )}

                            {/* Status Selector */}
                            <select
                              value={lead.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as FormLead["status"];
                                handleUpdateLead(lead.id, {
                                  status: newStatus,
                                  ...(newStatus === "closed" && !lead.dealValue ? { dealValue: 1000 } : {}),
                                  ...(newStatus === "closed" && !lead.completedAt ? { completedAt: "Bugün" } : {})
                                });
                              }}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${
                                lead.status === "closed"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : lead.status === "offered"
                                  ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                                  : lead.status === "contacted"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-blue-100 text-blue-900 border-blue-300"
                              }`}
                            >
                              <option value="new">🟢 Yeni Talep</option>
                              <option value="contacted">💬 İletişime Geçildi</option>
                              <option value="offered">📑 Teklif Verildi</option>
                              <option value="closed">🏆 Satış Tamamlandı (Kapandı)</option>
                            </select>
                          </div>

                          <p className="text-xs text-slate-600 italic leading-relaxed">
                            "{lead.message}"
                          </p>

                          {/* LEAD SCORING & FORM ENGAGEMENT SIGNALS */}
                          <div className="pt-0.5">
                            <LeadScoreBadge
                              lead={lead}
                              scoringConfig={config.leadNotifications?.scoring}
                              showEngagementChips={true}
                              allowExpandDetails={true}
                              onOpenDetails={() => setSelectedLeadForDetail(lead)}
                            />
                          </div>

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                            <span>📞 {lead.phone}</span>
                            {lead.email && <span>✉️ {lead.email}</span>}
                            {lead.completedAt && (
                              <span className="text-emerald-700 font-semibold">
                                ✓ Tamamlanma: {lead.completedAt}
                              </span>
                            )}
                          </div>

                          {/* Dinamik Form Özel Alanları (Açılır Menü, Onay Kutusu vs.) */}
                          {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {Object.entries(lead.customFields).map(([key, val]) => {
                                if (key.includes("terms") || val === true) {
                                  return (
                                    <span key={key} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                                      ✓ {key === "lead_terms_kvkk" ? "KVKK Onaylı" : key === "lead_whatsapp_notify" ? "WhatsApp Bildirim İzni" : `${key}: Onay`}
                                    </span>
                                  );
                                }
                                if (val === false || val === undefined || val === null || val === "") return null;
                                return (
                                  <span key={key} className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-800 text-[10px] font-medium border border-slate-300/60">
                                    <strong className="text-slate-600 font-bold">{key.replace(/^lead_/, "").replace(/_/g, " ")}:</strong> {String(val)}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Ekli Dosyalar & Belgeler (Ruhsat, Fotoğraf, PDF vs.) */}
                          {lead.attachments && lead.attachments.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {lead.attachments.map((att, attIdx) => (
                                <div
                                  key={attIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-semibold"
                                  title={att.name}
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="truncate max-w-[200px]">{att.name}</span>
                                  {att.size && (
                                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                                      ({(att.size / 1024).toFixed(0)} KB)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CRM CUSTOM TAGS MANAGER (MANUAL ADD / REMOVE) */}
                          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/60 mt-2">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 shrink-0">
                              <Tag className="w-3.5 h-3.5 text-indigo-500" />
                              <span>CRM Etiketleri:</span>
                            </div>
                            <LeadTagsManager
                              leadId={lead.id}
                              tags={lead.tags || []}
                              customTags={lead.customTags || []}
                              allAvailableTags={allCustomTags}
                              allExistingTags={allExistingTags}
                              onAddTag={(newTag) => handleAddTagToLead(lead.id, newTag)}
                              onRemoveTag={(tagToRemove) => handleRemoveTagFromLead(lead.id, tagToRemove)}
                              onOpenManageModal={() => setIsManageTagsModalOpen(true)}
                            />
                          </div>

                          {/* PRIVATE NOTES PREVIEW BANNER (IF PRESENT) */}
                          {(lead.privateNotes || lead.dealNotes) && (
                            <div
                              onClick={() => setSelectedLeadForDetail(lead)}
                              className="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-all group"
                              title="Dahili özel notları ve talep detayını aç"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                                  <span>Dahili Özel Not:</span>
                                  <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400 group-hover:underline">
                                    (Detay & Düzenle ✎)
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic font-medium mt-0.5">
                                  "{lead.privateNotes || lead.dealNotes}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                        {/* Deal Value Editor & Contact Buttons */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-end lg:self-auto shrink-0">
                          {/* Deal Value inline input */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {lead.status === "closed" ? "Kapanan Ciro:" : "Teklif / Değer:"}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">₺</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={lead.dealValue !== undefined ? lead.dealValue : ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleUpdateLead(lead.id, { dealValue: isNaN(val) ? 0 : val });
                              }}
                              placeholder="0"
                              className={`w-20 px-1 py-0.5 text-xs font-mono font-extrabold outline-none bg-transparent ${
                                lead.status === "closed" ? "text-emerald-700" : "text-slate-800"
                              }`}
                            />
                          </div>

                          {/* Tek Tıkla CRM'e Aktar (HubSpot / Salesforce) */}
                          <button
                            type="button"
                            disabled={isCrmQuickSyncing}
                            onClick={() => handleQuickCrmSync([lead])}
                            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-950 border border-orange-200 dark:border-orange-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group disabled:opacity-50"
                            title={`${CRM_PROVIDER_META[crmConfig.activeProvider].name} CRM'e tek tıkla senkronize et`}
                          >
                            <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500/20 group-hover:scale-110 transition-transform" />
                            <span className="font-mono">{CRM_PROVIDER_META[crmConfig.activeProvider].name.split(" ")[0]}</span>
                          </button>

                          {/* Lead Detail & Private Notes Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              lead.privateNotes || lead.dealNotes
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 shadow-2xs"
                                : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 shadow-2xs"
                            }`}
                            title="Müşteri talep detayları ve dahili özel notları görüntüle / düzenle"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Detay & Notlar</span>
                            {(lead.privateNotes || lead.dealNotes) && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Özel not mevcut" />
                            )}
                          </button>

                          {/* Lead Zaman Çizelgesi (Timeline) Butonu */}
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForTimeline(lead)}
                            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                            title="Geçmiş iletişimleri ve kronolojik zaman çizelgesini görüntüle"
                          >
                            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-45 transition-transform" />
                            <span className="hidden sm:inline">Zaman Çizelgesi</span>
                          </button>

                          <a
                            href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ara</span>
                          </a>

                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Merhaba%20${encodeURIComponent(lead.name)},%20${encodeURIComponent(config.companyName)}%20olarak%20teklif%20talebiniz%20icin%20yaziyoruz.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`${lead.name} adlı müşterinin talebini silmek istediğinize emin misiniz?`)) {
                                handleDeleteLead(lead.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Talebi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NEWSLETTER SUBSCRIBERS & EMAIL MARKETING */}
          {activeTab === "newsletter" && (
            <NewsletterManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateToLeads={(leadId?: string) => {
                if (leadId) {
                  const found = (config.leads || []).find((l) => l.id === leadId);
                  if (found) {
                    setSelectedLeadForDetail(found);
                  }
                }
                setActiveTab("leads");
              }}
              onOpenLeadDetail={(lead) => {
                setSelectedLeadForDetail(lead);
              }}
              onNavigateToMarketingAutomation={() => setActiveTab("marketing-automation")}
            />
          )}

          {/* YÜKSEK ÖNCELİKLİ BİLDİRİMLER (SLACK & E-POSTA) & LEAD SCORING */}
          {activeTab === "notifications" && (
            <NotificationsPanel
              config={config}
              onChange={onChange}
              onNavigateToLeads={() => setActiveTab("leads")}
            />
          )}

          {/* CONNECT CUSTOM DOMAIN SECTION WITH SPECIFIC CLOUDFLARE CNAME INSTRUCTIONS */}
          {activeTab === "connect-custom-domain" && (
            <ConnectCustomDomainSection
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* CONNECT CUSTOM DOMAIN & CLOUDFLARE CONFIGURATION (ALAN ADI YÖNETİMİ) */}
          {(activeTab === "custom-domain" || activeTab === "cloudflare-domain" || activeTab === "domain-management") && (
            <CustomDomainManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* AUTOMATED DNS SETUP GUIDE (CNAME & A-RECORD CONFIGURATIONS) */}
          {activeTab === "automated-dns" && (
            <AutomatedDnsSetupGuide
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateToDomainManager={() => setActiveTab("domain-management")}
              onNavigateToEdgeGuide={() => setActiveTab("cloudflare-edge-guide")}
            />
          )}

          {/* CLOUDFLARE EDGE DEPLOYMENT GUIDE (WORKERS SITES & PAGES API) */}
          {activeTab === "cloudflare-edge-guide" && (
            <CloudflareEdgeDeploymentGuide
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 8. HOSTING & 3-TIER PACKAGES */}
          {activeTab === "hosting-package" && (
            <div className="space-y-6">
              {/* Custom Domain Banner in Hosting */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Özel Alan Adı (Custom Domain)</span>
                  </div>
                  <div className="text-sm font-black">
                    Kendi Alan Adınızı (.com, .com.tr) 0 ms Global Edge Ağına Bağlayın
                  </div>
                  <p className="text-xs text-blue-200/80 max-w-xl">
                    Adım adım DNS yayılım talimatları, CNAME/A kayıtları ve Otomatik SSL yapılandırma sihirbazı hazır.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("automated-dns")}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Otomatik DNS Rehberi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom-domain")}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Alan Adı Paneli</span>
                  </button>
                </div>
              </div>

              {/* 3-Tier Package Architecture */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-slate-900">
                      JetKur 3 Kademeli Lisans Modeli
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    İster tek bir kurumsal site, ister 3 site, ister 10 sitelik ajans hesabı yönetin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {THREE_TIER_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        pkg.popular
                          ? "bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-lg"
                          : "bg-slate-50 text-slate-900 border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${pkg.popular ? "text-amber-400" : "text-slate-500"}`}>
                            {pkg.badge}
                          </span>
                          {pkg.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                              EN POPÜLER
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-base font-black">{pkg.name}</div>
                          <div className="text-2xl font-extrabold mt-1">
                            {pkg.price}
                            <span className={`text-xs font-normal ${pkg.popular ? "text-slate-400" : "text-slate-500"}`}>
                              {" "}{pkg.period}
                            </span>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed ${pkg.popular ? "text-slate-300" : "text-slate-600"}`}>
                          {pkg.desc}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-slate-200/20 text-xs">
                          <div className="font-bold flex items-center gap-1.5 text-amber-500">
                            <span>⚡ {pkg.siteLimit} Adet Bağımsız Web Sitesi</span>
                          </div>
                          {pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${pkg.popular ? "text-amber-400" : "text-emerald-600"}`} />
                              <span className={pkg.popular ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                          pkg.popular
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {pkg.popular ? "Aktif Lisansınızı Yükseltin" : "Paketi Seç"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Edge Subdomain & Custom Domain Summary */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>Global Edge DNS & Özel Alan Adı Özeti</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sitenizi JetKur alt alan adı veya kendi <strong>.com.tr</strong> alan adınız üzerinden 0 ms gecikmeyle yayınlayın.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Ücretsiz JetKur Alt Alan Adı (Subdomain)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={config.cloudflare?.subdomain || "sirket"}
                        onChange={(e) =>
                          updateConfig(p => ({
                            ...p,
                            cloudflare: {
                              ...p.cloudflare,
                              subdomain: sanitizeSlugInput(e.target.value)
                            }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-l-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                      />
                      <span className="px-3 py-2 bg-slate-800 border border-l-0 border-slate-700 text-xs text-slate-400 rounded-r-xl font-mono">
                        .hizliweb.site
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Özel Alan Adınız (Custom Domain)
                    </label>
                    <input
                      type="text"
                      value={config.cloudflare?.customDomain || ""}
                      onChange={(e) =>
                        updateConfig(p => ({
                          ...p,
                          cloudflare: { ...p.cloudflare, customDomain: e.target.value }
                        }))
                      }
                      placeholder="ornekfirma.com.tr"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200">Detaylı DNS & Global Edge Yapılandırma Rehberi</div>
                    <p className="text-[11px] text-slate-400">
                      Gerekli CNAME, A ve TXT kayıtları, Nameserver geçişi ve canlı DNS yayılım (propagation) teşhisi için sihirbazı açın.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom-domain")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
                  >
                    DNS Rehberine Git
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. AI WRITER */}
          {activeTab === "ai-writer" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Yapay Zeka İçerik ve Metin Fabrikası</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Firma adınız ve sektörünüze göre tüm kurumsal metinleri, hizmet açıklamalarını ve SEO etiketlerini üretin.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-amber-400">
                      ⚡ Tek Tıkla Bütün Web Sitesini Yapay Zekayla Doldur
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sektörünüz: <strong>{config.sector}</strong> • Şehir: <strong>{config.city}</strong> • Firma: <strong>{config.companyName}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiContent}
                    disabled={isAiWorking}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
                  >
                    <Wand2 className={`w-4 h-4 ${isAiWorking ? "animate-spin" : ""}`} />
                    <span>{isAiWorking ? "Üretiliyor..." : "Sitedeki Tüm İçerikleri Yenile"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <div className="text-amber-400 font-bold mb-1">✓ Slogan & Hero</div>
                    <span>Dönüşüm odaklı vurucu başlıklar.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <div className="text-amber-400 font-bold mb-1">✓ Kurumsal Metinler</div>
                    <span>Şirket değerleri ve güven veren tanıtımlar.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <div className="text-amber-400 font-bold mb-1">✓ Google SEO Etiketleri</div>
                    <span>Meta Title, Description ve Schema.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10.0 LIVE SYNTHETIC PERFORMANCE MONITOR (0.02s TARGET) */}
          {activeTab === "performance-monitor" && (
            <PerformanceMonitor
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onDeploy={onDeploy}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 10.0b GOOGLE LIGHTHOUSE & SİTE SAĞLIĞI VE PERFORMANS (D3.js) */}
          {(activeTab === "site-health" || activeTab === "site-health-performance") && (
            <SiteHealthPerformanceManager
              config={config}
              onChange={onChange}
              onDeploy={onDeploy}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 10. PERFORMANCE METRICS TAB (0.02s Load Time & Lighthouse 100/100) */}
          {activeTab === "performance" && (
            <PerformanceMetricsTab
              config={config}
              onChange={onChange}
              onDeploy={onDeploy}
              onPreview={onPreview}
              onUpdateLead={handleUpdateLead}
              onAddLead={handleAddLead}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 10.1 PERFORMANCE ANALYTICS (RECHARTS LEAD TRENDS & VISITOR GROWTH) */}
          {activeTab === "performance-analytics" && (
            <PerformanceAnalyticsWidget
              config={config}
              onUpdateLead={handleUpdateLead}
              onAddLead={handleAddLead}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 11. SEO & OPENGRAPH CONFIGURATION CENTER */}
          {activeTab === "seo" && (
            <SeoManager
              config={config}
              onChange={onChange}
              onOpenHealthCheck={() => setActiveTab("seo-health")}
              onOpenHeatmap={() => setActiveTab("seo-heatmap")}
              onOpenOpportunities={() => setIsOpportunityCenterOpen(true)}
              onOpenPageSeo={() => setActiveTab("page-seo")}
              onOpenProgressNotifications={() => setActiveTab("seo-progress")}
              onOpenMetaAuditor={() => setActiveTab("meta-auditor")}
              onOpenContentOptimizer={() => setActiveTab("seo-content-optimizer")}
              onOpenAiContentMetaOptimizer={() => setActiveTab("ai-content-meta-optimizer")}
              onOpenAiMetaOptimizer={() => setIsAiMetaOptimizerModalOpen(true)}
              onOpenSchemaGenerator={() => setActiveTab("schema-generator")}
              onOpenLocalSeoSchema={() => setActiveTab("local-seo-schema")}
              onOpenSeoReport={() => setActiveTab("seo-report")}
            />
          )}

          {/* 11.0a SEO REPORT TAB (COMPREHENSIVE AUDIT OF SITE'S META TAGS AND PERFORMANCE METRICS) */}
          {activeTab === "seo-report" && (
            <SeoReportTab
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              lastAuditedDate={lastAuditedDate}
              onTriggerAudit={handleRunSeoAudit}
            />
          )}

          {/* 11.0 SEO AUDITOR (META TAGS & IMAGE ALT TEXT HEALTH CHECK) */}
          {activeTab === "seo-auditor" && (
            <SeoAuditor
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenSeoTab={() => setActiveTab("seo")}
            />
          )}

          {/* 11.1 SEO HEALTH CHECK & GOOGLE RANKING BOOSTER */}
          {activeTab === "seo-health" && (
            <div className="space-y-6">
              <SeoAutomatedAuditTool
                config={config}
                onChange={onChange}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />
              <SeoHealthCheck
                config={config}
                onChange={onChange}
                onPreview={onPreview}
                onOpenSeoTab={() => setActiveTab("seo")}
                onOpenAuditor={() => setActiveTab("seo-auditor")}
              />
            </div>
          )}

          {/* 11.2 SAYFA BAZLI GRANÜLER SEO & CANONICAL YÖNETİCİSİ */}
          {activeTab === "page-seo" && (
            <PageSeoManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenGlobalSeo={() => setActiveTab("seo")}
              onOpenAuditor={() => setActiveTab("seo-auditor")}
              onOpenHealthCheck={() => setActiveTab("seo-health")}
              onOpenBulkExport={() => setActiveTab("bulk-seo-export")}
            />
          )}

          {/* 11.2b D3.JS ETKİLEŞİMLİ SEO & TRAFİK ISI HARİTASI */}
          {activeTab === "seo-heatmap" && (
            <div className="space-y-6">
              {/* Heatmap Type Sub-Tab Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id="subtab-regional-seo-heatmap"
                    onClick={() => setHeatmapSubTab("regional-performance")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      heatmapSubTab === "regional-performance"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Bölgesel Tıklanma &amp; Anahtar Kelime Isı Haritası (CTR &amp; Regional)</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/30">
                      Yeni • D3.js
                    </span>
                  </button>

                  <button
                    type="button"
                    id="subtab-section-seo-heatmap"
                    onClick={() => setHeatmapSubTab("page-sections")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      heatmapSubTab === "page-sections"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Sayfa Bölümü &amp; İçerik Isı Haritası (Section Engagement)</span>
                  </button>
                </div>

                <div className="text-right px-3 hidden md:block">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Aktif Site: <strong className="text-white">{config.companyName || "Site"}</strong>
                  </span>
                </div>
              </div>

              {/* Conditional Renderer based on heatmapSubTab */}
              {heatmapSubTab === "regional-performance" ? (
                <SeoPerformanceHeatmap
                  config={config}
                  onOpenSettings={() => setActiveTab("seo")}
                />
              ) : (
                <SeoHeatmapWidget
                  config={config}
                  onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
                />
              )}
            </div>
          )}

          {/* 11.2c YAPAY ZEKA SEO FIRSAT ALARMLARI & OPTİMİZASYON MERKEZİ */}
          {(activeTab === "seo-opportunities" || activeTab === "seo-opportunity-alerts") && (
            <div className="space-y-6">
              <SeoOpportunityCenter
                config={config}
                onChange={onChange}
                opportunities={allSeoOpportunities}
                onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              />
            </div>
          )}

          {/* 11.3 SEO İLERLEME BİLDİRİM SİSTEMİ (RANK SHIFT & SERP TRACKER) */}
          {(activeTab === "seo-progress" || activeTab === "seo-notifications") && (
            <SeoProgressNotificationSystem
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onOpenPreview={onPreview}
            />
          )}

          {/* 11.4 GERÇEK ZAMANLI META ETİKET DENETİM ARACI */}
          {activeTab === "meta-auditor" && (
            <MetaTagsAuditor
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenPageSeo={() => setActiveTab("page-seo")}
              onOpenGlobalSeo={() => setActiveTab("seo")}
            />
          )}

          {/* 11.5 AI-POWERED SEO CONTENT OPTIMIZER (SEKTÖREL BAŞLIK & AÇIKLAMA VARYASYONLARI) */}
          {activeTab === "seo-content-optimizer" && (
            <SeoContentOptimizer
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenSeoTab={() => setActiveTab("seo")}
            />
          )}

          {/* 11.5b AI CONTENT META-OPTIMIZER (ANAHTAR KELİME YOĞUNLUĞU & ATEŞMAN OKUNABİLİRLİK) */}
          {activeTab === "ai-content-meta-optimizer" && (
            <AiContentMetaOptimizer
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenSeoTab={() => setActiveTab("seo")}
            />
          )}

          {/* 11.5c AI META-OPTIMIZER (GEMINI 3.8 FLASH OTOMATİK META TITLE & DESCRIPTION) */}
          {activeTab === "ai-meta-optimizer" && (
            <AiMetaOptimizer
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 11.6 OTOMATİK JSON-LD SCHEMA.ORG OLUŞTURUCU (LOCAL BUSINESS, PRODUCT & FAQ) */}
          {activeTab === "schema-generator" && (
            <JsonLdSchemaGenerator
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenLocalSeoSchema={() => setActiveTab("local-seo-schema")}
              onOpenSeoTab={() => setActiveTab("seo")}
            />
          )}

          {/* 11.7 YEREL SEO ŞEMA OLUŞTURUCU (LOCALBUSINESS STRUCTURED DATA ENGINE) */}
          {activeTab === "local-seo-schema" && (
            <LocalSeoSchemaGenerator
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onOpenGeneralSettings={() => setActiveTab("general")}
              onOpenAllSchemas={() => setActiveTab("schema-generator")}
              onOpenSeoTab={() => setActiveTab("seo")}
            />
          )}

          {/* 12. QUICK START DESIGN SETS (SECTOR-SPECIFIC PRESETS) */}
          {activeTab === "design-presets" && (
            <QuickStartDesignSets
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 13. AUTOMATED DAILY BACKUP & VERSION RESTORE */}
          {activeTab === "backups" && (
            <BackupManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 13.1 SISTEM GÜNLÜĞÜ (OTOMATİK GÜNLÜK YEDEKLEME DENETİMİ) */}
          {(activeTab === "system-logs" || activeTab === "system-log") && (
            <SystemLogsManager
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
            />
          )}

          {/* 14. DYNAMIC QR CODE & OFFLINE MARKETING KIT */}
          {activeTab === "qr-code" && (
            <QrCodeManager
              config={config}
              onOpenPreview={onPreview}
            />
          )}

          {/* 15. A/B TESTING & HERO CONVERSION OPTIMIZER */}
          {activeTab === "ab-testing" && (
            <AbTestingManager
              config={config}
              onChange={onChange}
              onPreview={onPreview}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* 16. LEAD INSIGHTS & KALİTE DAĞILIMI ANALİZİ */}
          {activeTab === "lead-insights" && (
            <LeadInsightsManager
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectLeadForDetail={(lead) => {
                setSelectedLeadForDetail(lead);
                setActiveTab("leads");
              }}
            />
          )}

          {/* 17. LEAD OTOMASYON KURALLARI (SKOR, KAYNAK & KANAL AKSİYONLARI) */}
          {activeTab === "lead-automations" && (
            <LeadAutomationRulesManager
              config={config}
              onUpdateConfig={updateConfig}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectLeadForDetail={(lead) => {
                setSelectedLeadForDetail(lead);
                setActiveTab("leads");
              }}
            />
          )}

          {/* 18. LEAD MAPPING & MÜŞTERİ YOLCULUK HARİTASI (D3.js) */}
          {(activeTab === "lead-mapping" || activeTab === "customer-journey" || activeTab === "journey-mapping") && (
            <LeadMappingManager
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectLeadForDetail={(lead) => {
                setSelectedLeadForDetail(lead);
                setActiveTab("leads");
              }}
            />
          )}

          {/* 19. PAZARLAMA OTOMASYONU (E-BÜLTEN KAYNAK ANALİZİ & HOŞ GELDİN E-POSTASI) */}
          {activeTab === "marketing-automation" && (
            <MarketingAutomationManager
              config={config}
              onUpdateConfig={updateConfig}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectLeadForDetail={(lead) => {
                setSelectedLeadForDetail(lead);
                setActiveTab("leads");
              }}
            />
          )}

          {/* 20. GELECEK AY TAHMİNLEME & SATIŞ PROJEKSİYONU (D3.js) */}
          {activeTab === "lead-forecasting" && (
            <LeadForecastingManager
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectLeadForDetail={(lead) => {
                setSelectedLeadForDetail(lead);
                setActiveTab("leads");
              }}
            />
          )}

          {/* 21. AI FIYATLANDIRMA ZEKASI VE 3-TIER KATALOG PAKETLERİ */}
          {(activeTab === "pricing-intelligence" || activeTab === "ai-pricing") && (
            <PricingIntelligenceWorkspace
              config={config}
              onChange={onChange}
              onBackToOverview={() => setActiveTab("general")}
            />
          )}

          {/* 22. AI GLOBAL SEO AGENT (SEARCH GROUNDING, REGIONAL TRENDS & TRANSLATION STRATEGIES) */}
          {(activeTab === "global-seo" || activeTab === "ai-global-seo") && (
            <AiGlobalSeoAgent
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 23. BULK SEO PERFORMANCE EXPORT (META, CONTENT GAPS, RANKINGS & HEALTH AUDIT) */}
          {(activeTab === "bulk-seo-export" || activeTab === "seo-bulk-export") && (
            <BulkSeoPerformanceExportWorkspace
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onPreview={onPreview}
            />
          )}

          {/* 24. GELİŞMİŞ PERFORMANS TRENDLERİ (90 GÜNLÜK CORE WEB VITALS & BOUNCE RATE D3.JS) */}
          {(activeTab === "performance-trends" || activeTab === "advanced-performance-trends") && (
            <AdvancedSitePerformanceTrends
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
              onPreview={onPreview}
            />
          )}

          {/* 25. CLIENT ACCESS PORTAL (MÜŞTERİ PORTALİ - SİPARİŞ & DOKÜMAN TAKİBİ) */}
          {activeTab === "client-portal" && (
            <ClientAccessPortal
              config={config}
              onChange={onChange}
              onPreview={onPreview}
            />
          )}

          {/* 26. USER AUTHENTICATION & ACCESS CONTROL (KULLANICI GİRİŞ & YETKİLER) */}
          {(activeTab === "user-auth" || activeTab === "user-management") && (
            <UserAuthManagement
              config={config}
              onChange={onChange}
              onOpenClientPortal={() => setActiveTab("client-portal")}
            />
          )}

          {/* 27. HOSTINGER VPS + COOLIFY CANLI DAĞITIM REHBERİ (JETKUR.COM.TR) */}
          {(activeTab === "coolify-deployment" || activeTab === "vps-deployment") && (
            <CoolifyDeploymentGuide isFullPage={true} />
          )}

        </div>
      </div>

      {/* SEO Auto-Optimizer Modal */}
      <SeoAutoOptimizerModal
        isOpen={isSeoOptimizerOpen}
        onClose={() => setIsSeoOptimizerOpen(false)}
        config={config}
        onApply={onChange}
      />

      {/* AI Meta-Optimizer Modal */}
      {isAiMetaOptimizerModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
          id="ai-meta-optimizer-modal-backdrop"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-2 sm:p-4">
            <AiMetaOptimizer
              config={config}
              onChange={onChange}
              onClose={() => setIsAiMetaOptimizerModalOpen(false)}
              onNavigateTab={(tab) => {
                setIsAiMetaOptimizerModalOpen(false);
                setActiveTab(tab as CustomerPanelTab);
              }}
              isModal={true}
              autoRunOnMount={true}
            />
          </div>
        </div>
      )}

      {/* One-Click Site Snapshot Modal (Offline ZIP & Media Package) */}
      <OneClickSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        config={config}
        onNavigateTab={(tab) => {
          setDashboardMode("advanced");
          setActiveTab(tab as any);
        }}
      />

      {/* Getting Started 10-Minute Checklist Modal */}
      <GettingStartedModal
        isOpen={isGettingStartedOpen}
        onClose={() => setIsGettingStartedOpen(false)}
        config={config}
        onChange={onChange}
        onNavigateTab={(tab) => {
          setDashboardMode("advanced");
          setActiveTab(tab);
        }}
        onPreview={onPreview}
        onDeploy={onDeploy}
        onTriggerAiContent={handleGenerateAiContent}
      />

      {/* Universal Data Export Modal (Catalog & Leads in Excel/CSV) */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        defaultCategory={exportModalCategory}
      />

      {/* CRM Custom Color-Coded Tags Manager Modal */}
      <ManageLeadTagsModal
        isOpen={isManageTagsModalOpen}
        onClose={() => setIsManageTagsModalOpen(false)}
        config={config}
        onUpdateConfig={updateConfig}
        onFilterByTag={(tagName) => {
          setActiveTab("leads");
          setTagFilter(tagName);
        }}
      />

      {/* Lead Detail View & Private Notes Modal */}
      <LeadDetailModal
        isOpen={!!activeDetailLead}
        onClose={() => setSelectedLeadForDetail(null)}
        lead={activeDetailLead}
        config={config}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
        allCustomTags={allCustomTags}
        allExistingTags={allExistingTags}
        onAddTag={(leadId, newTag) => handleAddTagToLead(leadId, newTag)}
        onRemoveTag={(leadId, tagToRemove) => handleRemoveTagFromLead(leadId, tagToRemove)}
        onOpenManageTagsModal={() => setIsManageTagsModalOpen(true)}
        onNavigateToEmailAutomations={() => setActiveTab("email-automations")}
      />

      {/* Lead Zaman Çizelgesi (Timeline) Modalı */}
      <LeadTimelineModal
        isOpen={!!activeTimelineLead}
        onClose={() => setSelectedLeadForTimeline(null)}
        lead={activeTimelineLead}
        config={config}
        onUpdateLead={handleUpdateLead}
        onOpenLeadDetail={(lead) => {
          setSelectedLeadForTimeline(null);
          setSelectedLeadForDetail(lead);
        }}
      />

      {/* Popüler CRM Servisleri (HubSpot, Salesforce, Zoho, Zapier) Tek Tıkla Entegrasyon Modalı */}
      <CrmIntegrationModal
        isOpen={isCrmModalOpen}
        onClose={() => setIsCrmModalOpen(false)}
        config={config}
        onChange={onChange}
        selectedLeads={selectedLeads.length > 0 ? selectedLeads : filteredLeads}
      />

      {/* Actionable SEO Opportunity Toast Notification */}
      {!isSeoToastGloballyDismissed && activeSeoOpportunities.length > 0 && (
        <SeoOpportunityToast
          opportunities={activeSeoOpportunities}
          onApply={handleApplySeoOpportunity}
          onNavigateTab={(tab) => setActiveTab(tab as CustomerPanelTab)}
          onOpenCenter={() => setIsOpportunityCenterOpen(true)}
          onDismiss={handleDismissSeoOpportunity}
        />
      )}

      {/* Full Screen / Modal SEO Opportunity Center */}
      {isOpportunityCenterOpen && (
        <SeoOpportunityCenter
          isModal
          config={config}
          onChange={onChange}
          opportunities={allSeoOpportunities}
          onNavigateTab={(tab) => {
            setActiveTab(tab as CustomerPanelTab);
            setIsOpportunityCenterOpen(false);
          }}
          onClose={() => setIsOpportunityCenterOpen(false)}
        />
      )}

      {/* Real-time SEO Competitive Alert Toast (Push / SERP Shift Notification) */}
      {activeCompetitiveToast && (
        <CompetitiveAlertToast
          alert={activeCompetitiveToast}
          onClose={handleDismissCompetitiveToast}
          onOpenAlertCenter={() => {
            setActiveCompetitiveToast(null);
            setActiveTab("competitive-alerts");
          }}
          onSendToAiBlog={(keyword, draftTitle) => {
            sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
            sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
            setActiveCompetitiveToast(null);
            setActiveTab("ai-blog-engine");
          }}
        />
      )}

      {/* Quick Modal SEO Competitive Alert Center */}
      {isCompetitiveAlertCenterModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
          id="competitive-alert-center-modal-backdrop"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl p-2 sm:p-4">
            <div className="flex justify-end p-2">
              <button
                type="button"
                id="close-competitive-alert-modal-btn"
                onClick={() => setIsCompetitiveAlertCenterModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                ✕ Kapat
              </button>
            </div>
            <SeoCompetitiveAlertCenter
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => {
                setIsCompetitiveAlertCenterModalOpen(false);
                setActiveTab(tab as CustomerPanelTab);
              }}
              onSendToAiBlog={(keyword, draftTitle) => {
                sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
                sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
                setIsCompetitiveAlertCenterModalOpen(false);
                setActiveTab("ai-blog-engine");
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Logo Management & Upload Modal */}
      <QuickLogoUploadModal
        isOpen={isQuickLogoModalOpen}
        onClose={() => setIsQuickLogoModalOpen(false)}
        config={config}
        onChange={onChange}
        onShowToast={(toast) => setLogoToast(toast)}
        onOpenAssetManager={() => setActiveTab("asset-manager")}
      />

      {/* Stakeholder Executive Report (A4 PDF & Print) Modal */}
      <StakeholderPdfReportModal
        isOpen={isStakeholderReportModalOpen}
        onClose={() => setIsStakeholderReportModalOpen(false)}
        config={config}
      />

      {/* User-friendly Logo Upload Notification Toast */}
      {logoToast && (
        <LogoUploadToast
          toast={logoToast}
          onClose={() => setLogoToast(null)}
        />
      )}
    </div>
  );
};
