import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { SiteConfig, ServiceItem, ProductItem, FormLead } from "../../types";
import { ServiceContent } from "../../domain/site/serviceContent";
import { deriveServiceSearchQuery } from "../../domain/media/intents";
import { slugifyService } from "../../utils/url";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Building2, 
  ShoppingBag, 
  Wrench, 
  Inbox, 
  Rocket, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Eye, 
  Download, 
  FileSpreadsheet,
  HelpCircle, 
  Share2, 
  Plus, 
  Pencil,
  Trash2,
  Check,
  Zap,
  ShieldCheck,
  Star,
  Printer,
  History,
  TrendingUp,
  BarChart3,
  Globe,
  Tag,
  Bell,
  BellRing,
  Lock,
  FileText,
  Activity,
  Mail,
  Image as ImageIcon,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { getTagColorClass, getLeadTagStyle } from "./LeadTagsManager";
import { PerformanceScoreGaugeWidget } from "./PerformanceScoreGaugeWidget";

interface SimpleMerchantModeProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview: () => void;
  onDeploy: () => void;
  onSwitchToAdvanced: () => void;
  onOpenGettingStarted?: () => void;
  setupProgress?: number;
  onExportLeads?: () => void;
  onOpenExportModal?: () => void;
  onOpenBackups?: () => void;
  onOpenAnalytics?: () => void;
  onOpenDomainSettings?: () => void;
  onOpenLeads?: () => void;
  onOpenAutomatedResponses?: () => void;
  onOpenLeadDetail?: (lead: FormLead) => void;
  onNavigateTab?: (tab: string) => void;
}

interface LibraryMediaItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

export function extractServiceSearchQuery(title: string, sector?: string): string {
  return deriveServiceSearchQuery(title, sector);
}

const DEFAULT_LIBRARY_ASSETS: LibraryMediaItem[] = [
  {
    id: "media-srv-repair",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    title: "Profesyonel Servis ve Montaj",
    category: "Servis",
  },
  {
    id: "media-srv-tools",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    title: "Uzman Ekip ve Ekipman",
    category: "Hizmet",
  },
  {
    id: "media-srv-diagnostics",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    title: "Cihaz Arıza Tespiti",
    category: "Arıza & Onarım",
  },
  {
    id: "media-srv-installation",
    url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
    title: "Hızlı Kurulum ve Bakım",
    category: "Bakım",
  },
  {
    id: "media-srv-clean",
    url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
    title: "Hijyen ve Detaylı Temizlik",
    category: "Temizlik",
  },
  {
    id: "media-srv-support",
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    title: "Teknik Servis ve Destek",
    category: "Teknik",
  },
];

export const SimpleMerchantMode: React.FC<SimpleMerchantModeProps> = ({
  config,
  onChange,
  onPreview,
  onDeploy,
  onSwitchToAdvanced,
  onOpenGettingStarted,
  setupProgress = 75,
  onExportLeads,
  onOpenExportModal,
  onOpenBackups,
  onOpenAnalytics,
  onOpenDomainSettings,
  onOpenLeads,
  onOpenAutomatedResponses,
  onOpenLeadDetail,
  onNavigateTab,
}) => {
  const [activeCard, setActiveCard] = useState<"contact" | "items" | "leads" | "share">("contact");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showMapsGuideModal, setShowMapsGuideModal] = useState(false);
  const [showMediaLibraryModal, setShowMediaLibraryModal] = useState(false);
  const [showGalleryPickerModal, setShowGalleryPickerModal] = useState(false);
  const [showPexelsModal, setShowPexelsModal] = useState(false);
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [pexelsError, setPexelsError] = useState<string | null>(null);
  const [pexelsSelectingId, setPexelsSelectingId] = useState<string | null>(null);
  const [pexelsFallbackUsed, setPexelsFallbackUsed] = useState(false);
  const [pexelsSourceProvider, setPexelsSourceProvider] = useState<string>("pexels");
  const [customImportedAssets, setCustomImportedAssets] = useState<LibraryMediaItem[]>([]);
  const [editingService, setEditingService] = useState<ServiceContent | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [merchantQrDataUrl, setMerchantQrDataUrl] = useState<string>("");

  // Unread or unprocessed incoming inquiries count
  const unreadLeadsCount = (config.leads || []).filter(
    (l) => l.isRead === false || (l.isRead === undefined && l.status === "new")
  ).length;

  // Revenue calculation from completed leads
  const totalCompletedRevenue = (config.leads || [])
    .filter((l) => l.status === "closed")
    .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const completedDealsCount = (config.leads || []).filter((l) => l.status === "closed").length;

  // Quick state for simple editing
  const [companyName, setCompanyName] = useState(config.companyName || "");
  const [slogan, setSlogan] = useState(config.slogan || config.tagline || "");
  const [phone, setPhone] = useState(config.phone || "");
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || "");
  const [email, setEmail] = useState(config.email || "");
  const [address, setAddress] = useState(config.address || "");
  const [workingHours, setWorkingHours] = useState(config.workingHours || "Haftanın 7 Günü: 24 Saat Açık");

  useEffect(() => {
    setCompanyName(config.companyName || "");
    setSlogan(config.slogan || config.tagline || "");
    setPhone(config.phone || "");
    setWhatsapp(config.whatsapp || "");
    setEmail(config.email || "");
    setAddress(config.address || "");
    setWorkingHours(config.workingHours || "Haftanın 7 Günü: 24 Saat Açık");
  }, [config.companyName, config.slogan, config.tagline, config.phone, config.whatsapp, config.email, config.address, config.workingHours]);

  // Canonical derived completion items (Sprint 16.5)
  const isBusinessInfoComplete = Boolean(config.companyName && config.companyName.trim().length >= 2);
  const isLogoComplete = Boolean(config.logo || config.header?.logoImage || config.logoUrl);
  const isContactComplete = Boolean(config.phone && config.phone.replace(/[^0-9]/g, "").length >= 7);
  const isServicesComplete = Boolean((config.services?.items?.length || 0) > 0);
  const isPublished = Boolean(
    config.cloudflare?.deployedUrl || 
    config.cloudflare?.status === "deployed" || 
    config.deploymentStatus === "DEPLOYED"
  );

  const checklistItems = [
    { id: "business", label: "İşletme Bilgileri", complete: isBusinessInfoComplete, description: config.companyName || "Firma bilgisi girildi", action: () => setActiveCard("contact") },
    { id: "logo", label: "Logo & Kimlik", complete: isLogoComplete, description: isLogoComplete ? "Logo yüklendi ve uyarlandı" : "Logo eklenmedi (isteğe bağlı)", action: () => { if (onNavigateTab) onNavigateTab("design"); } },
    { id: "contact", label: "Telefon / WhatsApp", complete: isContactComplete, description: config.phone || "İletişim numarası aktif", action: () => setActiveCard("contact") },
    { id: "services", label: "Hizmetler & İçerik", complete: isServicesComplete, description: `${config.services?.items?.length || 0} hizmet tanımlandı`, action: () => setActiveCard("items") },
    { id: "preview", label: "Canlı Önizleme", complete: true, description: "Canlı önizleme hazır", action: onPreview },
    { id: "publish", label: "Web Sitesini Yayınla", complete: isPublished, description: isPublished ? "Yayında" : "Yayınlanmayı bekliyor", action: onDeploy },
  ];

  const completedCount = checklistItems.filter(i => i.complete).length;
  const totalTasks = checklistItems.length;

  const handleQuickSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...config,
      companyName,
      slogan,
      tagline: slogan,
      phone,
      whatsapp: whatsapp.replace(/[^0-9]/g, ""),
      email,
      address,
      workingHours,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleCopySiteUrl = () => {
    const url = config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "firmam"}.hizliweb.site`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickAddService = () => {
    const title = prompt("Hizmet veya Ürün Adı:", "Yeni Hizmet");
    if (!title) return;
    const price = prompt("Fiyatı (Örn: 500 ₺ veya 'Fiyat Sorun'):", "Fiyat Sorun");
    
    const autoSlug = slugifyService(title, Date.now().toString().slice(-4));
    const newService: ServiceItem = {
      id: `svc-${Date.now()}`,
      title,
      slug: autoSlug,
      price: price || "Fiyat Sorun",
      desc: `${config.companyName} kalitesi ve güvencesiyle profesyonel ${title} hizmeti.`,
      icon: "Wrench",
      seoTitle: `${title} Hizmeti & Fiyatları | ${config.city} ${config.companyName}`,
      seoDescription: `${config.city} ${title.toLowerCase()} hizmeti için ${config.companyName}. Hızlı randevu ve uygun fiyat teklifi alın!`,
      seoKeywords: `${title}, ${config.city} ${title.toLowerCase()}, ${config.companyName}, ${config.sector}`
    };

    onChange({
      ...config,
      services: {
        ...config.services,
        items: [...(config.services?.items || []), newService]
      }
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const availableMediaAssets: LibraryMediaItem[] = useMemo(() => {
    const list: LibraryMediaItem[] = [...customImportedAssets, ...DEFAULT_LIBRARY_ASSETS];
    const seenIds = new Set<string>(list.map((a) => a.id));

    // Gallery items
    (config.gallery?.items || []).forEach((item, idx) => {
      const url = item.imageUrl || (item as any).url;
      const id = item.id || `gallery-${idx + 1}`;
      if (url && typeof url === "string" && !seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          url,
          title: item.title || `Galeri Görseli ${idx + 1}`,
          category: "Galeri",
        });
      }
    });

    // Services items
    (config.services?.items || []).forEach((srv, idx) => {
      const url = srv.image;
      const mediaId = srv.primaryMediaId || srv.id;
      if (url && typeof url === "string" && !seenIds.has(mediaId)) {
        seenIds.add(mediaId);
        list.push({
          id: mediaId,
          url,
          title: `${srv.title} Görseli`,
          category: "Hizmetler",
        });
      }
    });

    // Hero bg
    if (config.hero?.bgImage && !seenIds.has("hero-bg")) {
      seenIds.add("hero-bg");
      list.push({
        id: "hero-bg",
        url: config.hero.bgImage,
        title: "Ana Sayfa Hero Görseli",
        category: "Ana Sayfa",
      });
    }

    // About image
    if (config.about?.image && !seenIds.has("about-main")) {
      seenIds.add("about-main");
      list.push({
        id: "about-main",
        url: config.about.image,
        title: "Hakkımızda Görseli",
        category: "Hakkımızda",
      });
    }

    return list;
  }, [config, customImportedAssets]);

  const resolveMediaUrl = (mediaIdOrUrl?: string): string => {
    if (!mediaIdOrUrl) return "";
    if (
      mediaIdOrUrl.startsWith("http://") ||
      mediaIdOrUrl.startsWith("https://") ||
      mediaIdOrUrl.startsWith("/")
    ) {
      return mediaIdOrUrl;
    }
    const found = availableMediaAssets.find((a) => a.id === mediaIdOrUrl);
    return found ? found.url : mediaIdOrUrl;
  };

  const getMediaTitle = (mediaIdOrUrl?: string): string => {
    if (!mediaIdOrUrl) return "Seçili Görsel";
    const found = availableMediaAssets.find((a) => a.id === mediaIdOrUrl);
    return found ? found.title : "Medya Görseli";
  };

  const handleOpenPexelsModal = () => {
    const initialQuery = extractServiceSearchQuery(
      editingService?.title || "",
      config.sector || (config as any).industryPackId
    );
    setPexelsQuery(initialQuery);
    setShowPexelsModal(true);
    handleSearchPexels(initialQuery);
  };

  const handleSearchPexels = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;
    setPexelsLoading(true);
    setPexelsError(null);
    try {
      const siteId = config.id || "active";
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      const wsId = (config as any).workspaceId;
      if (wsId) {
        headers["x-workspace-id"] = wsId;
      }
      const res = await fetch(`/api/media/sites/${siteId}/search?q=${encodeURIComponent(q)}`, {
        credentials: "include",
        headers,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Pexels araması gerçekleştirilemedi.");
      }
      const isFallback = Boolean(data.results?.fallbackUsed || data.results?.provider === "internal");
      setPexelsFallbackUsed(isFallback);
      setPexelsSourceProvider(data.results?.provider || (isFallback ? "internal" : "pexels"));
      const assets = data.results?.assets || [];
      if (assets.length === 0) {
        setPexelsError(`"${q}" için görsel bulunamadı. Lütfen farklı bir terim deneyin.`);
      }
      setPexelsResults(assets);
    } catch (err: any) {
      setPexelsError(
        err?.message || "Pexels servisi geçici olarak yanıt vermiyor. Medya Kütüphanenizi kullanmaya devam edebilirsiniz."
      );
    } finally {
      setPexelsLoading(false);
    }
  };

  const handleSelectPexelsAsset = async (asset: any) => {
    if (!editingService) return;
    setPexelsSelectingId(asset.id);
    try {
      const siteId = config.id || "active";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const wsId = (config as any).workspaceId;
      if (wsId) {
        headers["x-workspace-id"] = wsId;
      }
      const res = await fetch(`/api/media/sites/${siteId}/import-stock`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ asset }),
      });
      const data = await res.json();
      const registered = data.success && data.asset ? data.asset : asset;

      setEditingService({
        ...editingService,
        primaryMediaId: registered.id,
      });

      setCustomImportedAssets((prev) => [
        ...prev.filter((a) => a.id !== registered.id),
        {
          id: registered.id,
          url: registered.originalUrl,
          title: registered.title || "Pexels Görseli",
          category: "Pexels Stok",
        },
      ]);

      setShowPexelsModal(false);
    } catch {
      setEditingService({
        ...editingService,
        primaryMediaId: asset.id,
      });
      setCustomImportedAssets((prev) => [
        ...prev.filter((a) => a.id !== asset.id),
        {
          id: asset.id,
          url: asset.originalUrl,
          title: asset.title || "Pexels Görseli",
          category: "Pexels Stok",
        },
      ]);
      setShowPexelsModal(false);
    } finally {
      setPexelsSelectingId(null);
    }
  };

  const handleMoveGalleryItem = (index: number, direction: "up" | "down") => {
    if (!editingService) return;
    const currentList = [...(editingService.galleryMediaIds || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIndex];
    currentList[targetIndex] = temp;
    setEditingService({
      ...editingService,
      galleryMediaIds: currentList,
    });
  };

  const handleRemoveGalleryItem = (index: number) => {
    if (!editingService) return;
    const updated = (editingService.galleryMediaIds || []).filter((_, i) => i !== index);
    setEditingService({
      ...editingService,
      galleryMediaIds: updated,
    });
  };

  const handleToggleGalleryAsset = (assetId: string) => {
    if (!editingService) return;
    const current = editingService.galleryMediaIds || [];
    if (current.includes(assetId)) {
      setEditingService({
        ...editingService,
        galleryMediaIds: current.filter((id) => id !== assetId),
      });
    } else {
      setEditingService({
        ...editingService,
        galleryMediaIds: [...current, assetId],
      });
    }
  };

  const handleStartEditService = (s: ServiceItem) => {
    const canonical: ServiceContent = {
      id: s.id,
      title: s.title,
      slug: s.slug || s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      shortDescription: s.desc || "",
      longContent: s.longContent || s.longDesc || "",
      priceLabel: s.price || "",
      active: s.active !== false,
      primaryMediaId: s.primaryMediaId || s.image || undefined,
      galleryMediaIds: s.galleryMediaIds ? [...s.galleryMediaIds] : (s.bannerImage ? [s.bannerImage] : []),
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
    };
    setEditingService(canonical);
  };

  const handleSaveServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const currentItems = config.services?.items || [];
    const updatedItems = currentItems.map((item) => {
      if (item.id === editingService.id) {
        return {
          ...item,
          title: editingService.title,
          desc: editingService.shortDescription,
          longContent: editingService.longContent,
          price: editingService.priceLabel,
          active: editingService.active,
          primaryMediaId: editingService.primaryMediaId,
          image: editingService.primaryMediaId ? resolveMediaUrl(editingService.primaryMediaId) : undefined,
          galleryMediaIds: editingService.galleryMediaIds ? [...editingService.galleryMediaIds] : [],
        };
      }
      return item;
    });

    onChange({
      ...config,
      services: {
        ...config.services,
        items: updatedItems,
      },
    });

    setEditingService(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleCancelServiceEdit = () => {
    setEditingService(null);
  };

  const handleRemoveService = (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    onChange({
      ...config,
      services: {
        ...config.services,
        items: (config.services?.items || []).filter(s => s.id !== id)
      }
    });
  };

  const siteUrl = config.cloudflare?.customDomain
    ? (config.cloudflare.customDomain.startsWith("http") ? config.cloudflare.customDomain : `https://${config.cloudflare.customDomain}`)
    : (config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || "firmam"}.hizliweb.site`);

  useEffect(() => {
    if (showQrModal && !merchantQrDataUrl) {
      QRCode.toDataURL(siteUrl, {
        errorCorrectionLevel: "H",
        width: 600,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      }).then((url) => {
        setMerchantQrDataUrl(url);
      }).catch(console.error);
    }
  }, [showQrModal, siteUrl, merchantQrDataUrl]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">Bilgileriniz kaydedildi! Değişiklikleri yayına vermek için 'Canlıya Gönder'e tıklayın.</span>
        </div>
      )}

      {/* Top Banner: Welcome & Zero-Tech Mode Indicator */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Süper Kolay Esnaf Yönetim Paneli (Sıfır Teknik Bilgi)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {config.companyName || "İşletmeniz"} Web Sitesi Yönetimi
          </h1>
          <p className="text-slate-900 text-xs sm:text-sm font-medium max-w-xl">
            Karmaşık menülerle uğraşmayın. Telefonunuzu, adresinizi ve fiyatlarınızı tek ekranda güncelleyin.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Notification Badge for Form Inquiries */}
          <button
            type="button"
            id="simple-header-lead-notifications-btn"
            onClick={() => {
              if (onOpenLeads) {
                onOpenLeads();
              } else {
                const el = document.getElementById("simple-leads-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`px-3.5 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer ${
              unreadLeadsCount > 0
                ? "bg-slate-950 text-white ring-2 ring-rose-500/70 border border-rose-500/50"
                : "bg-white/90 hover:bg-white text-slate-950"
            }`}
            title={
              unreadLeadsCount > 0
                ? `${unreadLeadsCount} adet yeni veya işlem bekleyen form talebi var`
                : "Tüm form talepleri güncel"
            }
          >
            <div className="relative flex items-center justify-center">
              {unreadLeadsCount > 0 ? (
                <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-700" />
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
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border transition-all ${
                unreadLeadsCount > 0
                  ? "bg-rose-500 text-white border-rose-400 shadow-xs animate-pulse"
                  : "bg-slate-200 text-slate-700 border-slate-300"
              }`}
            >
              {unreadLeadsCount}
            </span>
          </button>

          {onOpenGettingStarted && (
            <button
              onClick={onOpenGettingStarted}
              className="px-4 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>10-Dk Kurulum Rehberi</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                %{setupProgress}
              </span>
            </button>
          )}

          <button
            onClick={onPreview}
            className="px-4 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-700" />
            <span>Sitemi Önizle</span>
          </button>

          {onOpenBackups && (
            <button
              onClick={onOpenBackups}
              className="px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Otomatik günlük yedekleme ve geçmiş sürümleri gör"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Yedekler</span>
            </button>
          )}

          {onOpenDomainSettings && (
            <button
              onClick={onOpenDomainSettings}
              className="px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Kendi satın aldığınız alan adını (örn: www.firmaadi.com) Cloudflare altyapısına bağlayın"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{config.cloudflare?.customDomain ? "Alan Adı: Bağlı" : "Alan Adı Yönetimi"}</span>
            </button>
          )}

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("seo-report")}
              className="px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Sitenin tüm arama motoru meta etiketlerini ve Google hız skorlarını denetle"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>SEO Raporu</span>
            </button>
          )}

          <button
            onClick={onDeploy}
            className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-950/30 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Rocket className="w-4 h-4 text-amber-400" />
            <span>Canlıya Gönder (0.02s)</span>
          </button>

          <button
            onClick={onSwitchToAdvanced}
            className="px-3.5 py-3 rounded-2xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-extrabold text-xs border border-slate-950/20 flex items-center gap-1.5"
            title="Tüm detaylı ayarları gösteren stüdyo moduna geç"
          >
            <span>🎛️ Gelişmiş Mod</span>
          </button>
        </div>
      </div>

      {/* 10-Minute Launch Success & Quick Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canlı Web Siteniz:</div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base sm:text-lg font-black text-amber-600 hover:text-amber-700 flex items-center gap-1.5 truncate"
              >
                <span>{siteUrl}</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <button
                onClick={handleCopySiteUrl}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold shrink-0"
                title="Linki Kopyala"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Dükkan QR Kodu İndir</span>
            </button>

            <button
              onClick={() => setShowMapsGuideModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Google Haritalar'a Ekle</span>
            </button>
          </div>
        </div>

        {/* 10-Minute Success Checklist */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>10 Dakikalık Hızlı Başarı Kontrol Listesi</span>
            </span>
            <span className="text-amber-600">{completedCount} / {totalTasks} Tamamlandı</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {checklistItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.action}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all hover:shadow-xs ${
                  item.complete
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.complete ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {item.complete ? "✓" : (idx + 1)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Google Lighthouse Performance Score & Core Web Vitals Gauge Widget */}
      <PerformanceScoreGaugeWidget
        config={config}
        onChange={onChange}
        onNavigateTab={(tab) => {
          if (onNavigateTab) {
            onNavigateTab(tab);
          } else {
            onSwitchToAdvanced();
          }
        }}
      />

      {/* AI-Driven Blog & SEO Engine Quick Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Yapay Zeka Blog & Yerel SEO Motoru</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            {config.sector || "Sektörünüz"} İçin Google'da İlk Sıraya Oynayan SEO Makalesi Üretin
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {config.city || "Şehriniz"} bölgesindeki aramalarda öne çıkmak için yapay zeka ile otomatik H1-H3 başlıkları, SERP meta etiketleri ve SSS şeması içeren uzun soluklu blog makaleleri yayınlayın.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab("ai-blog-engine");
            } else {
              onSwitchToAdvanced();
            }
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Yapay Zeka Blog Motorunu Aç</span>
        </button>
      </div>

      {/* 4 Super-Simple Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: PHONE, WHATSAPP & ADDRESS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">1. Telefon, WhatsApp & Adres</h2>
              <p className="text-xs text-slate-500">Müşterilerinizin size tek tıkla ulaşacağı bilgiler</p>
            </div>
          </div>

          <form onSubmit={handleQuickSaveContact} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşletme / Firma Unvanı</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Örn: JetKur Test Tesisat"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Kısa Tanıtım</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Örn: 7/24 Profesyonel ve Güvenilir Hizmet"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arama Telefonu</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Sipariş Hattı</label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İletişim E-Posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="iletisim@isletmeniz.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres / Dükkan Konumu</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Çalışma Saatleri</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>İletişim Bilgilerimi Kaydet</span>
            </button>
          </form>
        </div>

        {/* CARD 2: SERVICES & PRODUCTS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">2. Hizmet & Fiyat Listem</h2>
                  <p className="text-xs text-slate-500">Müşterilerinizin göreceği hizmetler</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickAddService}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hizmet Ekle</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {(config.services?.items || []).map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span className="truncate">{s.title}</span>
                      {s.active === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 font-semibold shrink-0">
                          Pasif
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-600 font-extrabold">{s.price || "Fiyat Sorun"}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditService(s)}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-xs"
                      title="Düzenle"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      <span>Düzenle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveService(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {(config.services?.items || []).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  Henüz hizmet eklenmedi. "Hizmet Ekle" butonuna tıklayarak ilk hizmetinizi yazın.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Toplam {config.services?.items?.length || 0} Hizmet Yayında</span>
            <button
              onClick={onSwitchToAdvanced}
              className="text-amber-600 font-bold hover:underline"
            >
              Fotoğraflı Katalog Yönetimi →
            </button>
          </div>
        </div>

        {/* CARD 3: INCOMING LEADS (MÜŞTERİ TALEPLERİ) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">3. Web Sitenizden Gelen Müşteriler</h2>
                <p className="text-xs text-slate-500">Form dolduran veya teklif isteyen müşteriler</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAnalytics && (
                <button
                  type="button"
                  id="simple-open-analytics-btn"
                  onClick={onOpenAnalytics}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Recharts ile grafiksel lead ve ziyaretçi analitiğini görüntüleyin"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Grafikler</span>
                </button>
              )}
              {onOpenExportModal && (
                <button
                  type="button"
                  id="simple-export-hub-btn"
                  onClick={onOpenExportModal}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Katalog ve müşteri taleplerini Excel veya CSV olarak indirin"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                  <span>Excel / CSV</span>
                </button>
              )}
              {onExportLeads && !onOpenExportModal && (
                <button
                  type="button"
                  id="simple-export-leads-btn"
                  onClick={onExportLeads}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Gelen form taleplerini CSV dosyası olarak indirin"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export Leads</span>
                </button>
              )}
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                {config.leads?.length || 0} Talep
              </span>
            </div>
          </div>

          {/* Revenue tracker summary banner in Simple Mode */}
          {totalCompletedRevenue > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Tamamlanan Satış Cirosu</div>
                  <div className="text-base font-black text-emerald-950">
                    ₺{totalCompletedRevenue.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  {completedDealsCount} Başarılı Anlaşma
                </span>
                <button
                  type="button"
                  onClick={onSwitchToAdvanced}
                  className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Yönetim Masası →
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {(config.leads || []).map((lead) => (
              <div
                key={lead.id}
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  lead.status === "closed" ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{lead.name}</span>
                    {(lead.isRead === false || (lead.isRead === undefined && lead.status === "new")) && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                        YENİ TALEP
                      </span>
                    )}
                    {lead.status === "closed" && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Satış: ₺{(lead.dealValue || 0).toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{lead.date}</div>
                </div>
                <div className="text-xs text-slate-600">{lead.message}</div>

                {/* CRM Tags Badges */}
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {lead.tags.map((tag) => {
                      const customTagObj = lead.customTags?.find(ct => ct.name.toLowerCase() === tag.toLowerCase());
                      const color = getLeadTagStyle(tag, customTagObj?.color);
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${color.dot}`} />
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Private Notes preview banner (if exists) */}
                {(lead.privateNotes || lead.dealNotes) && (
                  <div
                    onClick={() => onOpenLeadDetail?.(lead)}
                    className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-1.5 cursor-pointer hover:bg-amber-100/70 transition-colors"
                    title="Dahili özel notları ve talep detayını aç"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 text-[11px]">
                      <span className="font-bold text-amber-900 dark:text-amber-300 mr-1">Dahili Not:</span>
                      <span className="italic text-slate-700 dark:text-slate-300 line-clamp-1">
                        "{lead.privateNotes || lead.dealNotes}"
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {onOpenLeadDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenLeadDetail(lead)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        lead.privateNotes || lead.dealNotes
                          ? "bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200"
                          : "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
                      }`}
                      title="Müşteri talep detayları ve dahili özel notları aç"
                    >
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>Detay & Notlar</span>
                      {(lead.privateNotes || lead.dealNotes) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  )}

                  <a
                    href={`tel:${lead.phone}`}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-amber-400" />
                    <span>Ara: {lead.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Merhaba Sayın ${lead.name}, ${config.companyName} web sitemiz üzerinden ilettiğiniz talebinizle ilgili ulaşıyoruz.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}

            {(config.leads || []).length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                Henüz web sitenizden yeni talep gelmedi. Müşteriler form doldurduğunda anında burada görünecek.
              </div>
            )}

            {(config.leads || []).length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Toplam {(config.leads || []).length} Müşteri Talebi</span>
                <div className="flex items-center gap-3">
                  {onOpenAutomatedResponses && (
                    <button
                      type="button"
                      onClick={onOpenAutomatedResponses}
                      className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Otomatik Yanıtlar (Automated Responses) →</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchToAdvanced();
                      if (onOpenLeads) {
                        onOpenLeads();
                      }
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Tüm Talepleri Yönet →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: INSTANT PUBLISH & SHARE */}
        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">4. Değişiklikleri Canlıya Gönder</h2>
                <p className="text-xs text-slate-400">Yaptığınız değişiklikler 0.02s hızla tüm dünyada güncellenir</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Kaydettiğiniz telefon, adres veya hizmet değişikliklerinin anında canlı sitenizde görünmesi için yeşil butona basmanız yeterlidir.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Son Yayınlanma:</span>
              <span className="font-bold text-emerald-400">{config.cloudflare?.lastDeployedAt || "Bugün"} (Aktif)</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onDeploy}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              <span>Tek Tıkla Canlıya Gönder (0.02s) 🚀</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreview}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Önizle</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(`Merhaba! ${config.companyName} olarak yeni ve hızlı web sitemizi inceleyebilirsiniz: ${siteUrl}`);
                  window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-700/50"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Paylaş</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== QR CODE MODAL ==================== */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Masa & Dükkan Vitrin Kartı</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-amber-500 text-slate-950 border-4 border-slate-950 shadow-xl space-y-4">
              <div className="text-lg font-black">{config.companyName}</div>
              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl mx-auto border-2 border-slate-950 flex flex-col items-center justify-center shadow-inner relative">
                {merchantQrDataUrl ? (
                  <img
                    src={merchantQrDataUrl}
                    alt="Canlı QR Kodu"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                    QR Üretiliyor...
                  </div>
                )}
              </div>
              <div className="text-xs font-extrabold font-mono truncate">{siteUrl}</div>
              <div className="text-[11px] font-bold text-slate-900">
                🚀 Menü, Fiyat Listesi & WhatsApp İletişim İçin Okutunuz
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!merchantQrDataUrl) return;
                  const a = document.createElement("a");
                  a.href = merchantQrDataUrl;
                  a.download = `${config.companyName || "site"}_qr_kodu.png`;
                  a.click();
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>PNG Olarak İndir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Yazdır / PDF</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  onSwitchToAdvanced();
                }}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Gelişmiş QR & Vitrin Tasarım Kitini Aç →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GOOGLE MAPS GUIDE MODAL ==================== */}
      {showMapsGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Google Haritalar'a Web Sitenizi Ekleyin (1 Dk)</h3>
              </div>
              <button
                onClick={() => setShowMapsGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google Haritalar işletme profilinize web sitenizi eklediğinizde yerel aramalarda 3 kat daha fazla müşteri kazanırsınız.
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                <div>
                  <strong>Google Haritalar veya Google İşletmem</strong> uygulamasını açın ve profilinizi düzenleyin.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                <div className="space-y-1">
                  <div><strong>Web Sitesi</strong> kutucuğuna şu linki yapıştırın:</div>
                  <div className="p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-amber-700 select-all">
                    {siteUrl}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                <div>
                  <strong>Kaydet</strong> butonuna basın. Müşterileriniz artık Google'dan doğrudan web sitenize ve WhatsApp'ınıza ulaşacak!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMapsGuideModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Anladım, Teşekkürler
            </button>
          </div>
        </div>
      )}

      {/* ==================== EDIT SERVICE MODAL ==================== */}
      {editingService && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Hizmeti Düzenle</h3>
              </div>
              <button
                type="button"
                onClick={handleCancelServiceEdit}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <form onSubmit={handleSaveServiceEdit} className="space-y-4">
              {/* Hizmet Görseli */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hizmet Görseli
                </label>

                {editingService.primaryMediaId ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center">
                      <img
                        src={resolveMediaUrl(editingService.primaryMediaId)}
                        alt={editingService.title || "Hizmet Görseli"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {getMediaTitle(editingService.primaryMediaId)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        ID: {editingService.primaryMediaId}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setShowMediaLibraryModal(true)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          <span>Görseli Değiştir</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenPexelsModal}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Pexels'ten Bul</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingService({ ...editingService, primaryMediaId: undefined })
                          }
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Görseli Kaldır</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-700">Henüz bir görsel seçilmedi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                      Medya kütüphanenizden veya Pexels'ten kaliteli bir fotoğraf seçerek hizmetinizi öne çıkarın
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowMediaLibraryModal(true)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                        <span>Medya Kütüphanesinden Seç</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenPexelsModal}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Pexels'ten Görsel Bul</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hizmet Galerisi Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Hizmet Galerisi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGalleryPickerModal(true)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Galeriden Görsel Ekle</span>
                  </button>
                </div>

                {editingService.galleryMediaIds && editingService.galleryMediaIds.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {editingService.galleryMediaIds.map((mediaId, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === (editingService.galleryMediaIds?.length || 0) - 1;
                        return (
                          <div
                            key={`${mediaId}-${idx}`}
                            className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl group hover:border-slate-300 transition-colors"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative">
                              <img
                                src={resolveMediaUrl(mediaId)}
                                alt={getMediaTitle(mediaId)}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">
                                {getMediaTitle(mediaId)}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                ID: {mediaId}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Yukarı taşı"
                                disabled={isFirst}
                                onClick={() => handleMoveGalleryItem(idx, "up")}
                                className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Aşağı taşı"
                                disabled={isLast}
                                onClick={() => handleMoveGalleryItem(idx, "down")}
                                className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Galeriden kaldır"
                                onClick={() => handleRemoveGalleryItem(idx)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Toplam {editingService.galleryMediaIds.length} görsel galeride yer alıyor (sıralamayı butonlarla değiştirebilirsiniz)</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-3.5 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      Bu hizmet için henüz bir galeri görseli seçilmedi.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowGalleryPickerModal(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Galeriden Görsel Ekle</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hizmet Adı
                </label>
                <input
                  type="text"
                  required
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({ ...editingService, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Hizmet Adı"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kısa Açıklama
                </label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription}
                  onChange={(e) =>
                    setEditingService({ ...editingService, shortDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  placeholder="Kısa Açıklama"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detaylı Açıklama
                </label>
                <textarea
                  rows={4}
                  value={editingService.longContent || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, longContent: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Detaylı Açıklama"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fiyat / Fiyat Bilgisi
                </label>
                <input
                  type="text"
                  value={editingService.priceLabel || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, priceLabel: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Fiyat / Fiyat Bilgisi"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="service-active-toggle"
                  checked={editingService.active}
                  onChange={(e) =>
                    setEditingService({ ...editingService, active: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="service-active-toggle"
                  className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                >
                  Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelServiceEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MEDIA LIBRARY SELECTION MODAL ==================== */}
      {showMediaLibraryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Medya Kütüphanesi</h3>
                  <p className="text-xs text-slate-500">Hizmet için bir görsel seçin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaLibraryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableMediaAssets.map((asset) => {
                  const isSelected = editingService?.primaryMediaId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        if (editingService) {
                          setEditingService({
                            ...editingService,
                            primaryMediaId: asset.id,
                          });
                        }
                        setShowMediaLibraryModal(false);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all aspect-4/3 flex flex-col justify-end p-2.5 bg-slate-900 cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-500/30"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold text-white truncate drop-shadow">
                          {asset.title}
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          {asset.category}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Toplam {availableMediaAssets.length} görsel mevcut</span>
              <button
                type="button"
                onClick={() => setShowMediaLibraryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GALLERY MEDIA PICKER MODAL ==================== */}
      {showGalleryPickerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Hizmet Galerisi Görselleri</h3>
                  <p className="text-xs text-slate-500">
                    Galeride yer almasını istediğiniz görsellere tıklayarak ekleyin veya çıkarın
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryPickerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableMediaAssets.map((asset) => {
                  const galleryList = editingService?.galleryMediaIds || [];
                  const isSelected = galleryList.includes(asset.id);
                  const selectedOrder = isSelected ? galleryList.indexOf(asset.id) + 1 : null;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleToggleGalleryAsset(asset.id)}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all aspect-4/3 flex flex-col justify-end p-2.5 bg-slate-900 cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-500/30"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold text-white truncate drop-shadow">
                          {asset.title}
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          {asset.category}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 z-10 shadow">
                          <Check className="w-3 h-3" />
                          <span>#{selectedOrder}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Seçili Galeri Görseli: {(editingService?.galleryMediaIds || []).length}
              </span>
              <button
                type="button"
                onClick={() => setShowGalleryPickerModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PEXELS SEARCH MODAL ==================== */}
      {showPexelsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pexels'ten Görsel Bul</h3>
                  <p className="text-xs text-slate-500">Hizmetiniz için yüksek kaliteli stok görsel arayın</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPexelsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Kapat
              </button>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchPexels(pexelsQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pexelsQuery}
                  onChange={(e) => setPexelsQuery(e.target.value)}
                  placeholder="Görsel arama terimi (Örn: Su Kaçağı Tespiti, Kombi Tamiri)..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={pexelsLoading || !pexelsQuery.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {pexelsLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Ara</span>
              </button>
            </form>

            {/* Provider Source Status Indicator */}
            {!pexelsLoading && pexelsResults.length > 0 && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  pexelsFallbackUsed
                    ? "bg-amber-50 border border-amber-200 text-amber-900"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    pexelsFallbackUsed ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span>
                  {pexelsFallbackUsed
                    ? `Sonuçlar JetKur Yedek Medya Kütüphanesinden sağlandı (${pexelsResults.length} görsel).`
                    : `Pexels Resmi Stok API (${pexelsResults.length} adet görsel listelendi).`}
                </span>
              </div>
            )}

            {/* Error or Truthful message */}
            {pexelsError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <span>{pexelsError}</span>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPexelsModal(false);
                        setShowMediaLibraryModal(true);
                      }}
                      className="font-bold underline text-amber-900 hover:text-amber-950"
                    >
                      Medya Kütüphanesine Git →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {pexelsLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span>Görseller aranıyor...</span>
                </div>
              ) : pexelsResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pexelsResults.map((asset) => {
                    const isSelected = editingService?.primaryMediaId === asset.id;
                    const isSelectingThis = pexelsSelectingId === asset.id;
                    const displayUrl = asset.thumbnailUrl || asset.originalUrl || asset.url;
                    const isAssetFallback = asset.sourceProvider === "internal" || pexelsFallbackUsed;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={Boolean(pexelsSelectingId)}
                        onClick={() => handleSelectPexelsAsset(asset)}
                        className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all aspect-4/3 flex flex-col justify-end p-2.5 bg-slate-900 cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/30"
                            : "border-slate-200 hover:border-emerald-400"
                        }`}
                      >
                        <img
                          src={displayUrl}
                          alt={asset.altText || asset.title || "Görsel"}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="relative z-10">
                          <div className="text-[11px] font-bold text-white truncate drop-shadow">
                            {asset.title || asset.altText || (isAssetFallback ? "Yedek Görsel" : "Pexels Görseli")}
                          </div>
                          <div className="text-[10px] text-slate-300 truncate">
                            {isAssetFallback
                              ? "JetKur Küratörlü Medya"
                              : asset.photographerName || asset.photographer
                              ? `Fotoğraf: ${asset.photographerName || asset.photographer}`
                              : "Pexels"}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isSelectingThis && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-20">
                            <RefreshCw className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                !pexelsError && (
                  <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    Yukarıdaki kutucuğa aramak istediğiniz terimi yazın veya varsayılan terimle arayın.
                  </div>
                )
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                {pexelsFallbackUsed
                  ? "JetKur Küratörlü Medya Kütüphanesi"
                  : "Pexels Ücretsiz Ticari Lisansı ile sunulmaktadır"}
              </span>
              <button
                type="button"
                onClick={() => setShowPexelsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
