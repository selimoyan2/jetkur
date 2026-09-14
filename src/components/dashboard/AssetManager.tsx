import React, { useState, useRef, useMemo } from "react";
import { SiteConfig, SiteAsset, AssetCategory, GalleryItem } from "../../types";
import {
  FolderKanban,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sliders,
  Trash2,
  Eye,
  Search,
  Filter,
  Globe,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Wand2,
  Plus,
  Share2,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Layers,
  ZoomIn,
  Zap,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  compressImageFileToWebP,
  batchConvertSiteAssetsToWebP,
  formatBytes,
  isWebPAsset
} from "../../utils/imageOptimizer";

interface AssetManagerProps {
  config: SiteConfig;
  updateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onNavigateTab?: (tabName: string) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  config,
  updateConfig,
  onNavigateTab
}) => {
  // Navigation tabs inside Asset Manager
  const [activeSubTab, setActiveSubTab] = useState<"all" | "core" | "ai_studio" | "health">("all");

  // WebP Batch Optimization State
  const [isBatchOptimizing, setIsBatchOptimizing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentItemName: string } | null>(null);
  const [batchResult, setBatchResult] = useState<{
    convertedCount: number;
    originalBytes: number;
    optimizedBytes: number;
    savedBytes: number;
    savingsPercentage: number;
    edgePoPs: number;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Zoom Lightbox
  const [previewZoomUrl, setPreviewZoomUrl] = useState<{ url: string; title: string } | null>(null);

  // Replace / Upload Modal
  const [uploadModalTarget, setUploadModalTarget] = useState<SiteAsset | null>(null);
  const [uploadUrlInput, setUploadUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Studio Generation State
  const [aiCategory, setAiCategory] = useState<AssetCategory>("logo");
  const [aiStyle, setAiStyle] = useState<string>("minimalist");
  const [aiAspectRatio, setAiAspectRatio] = useState<string>("1:1");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<{
    url: string;
    prompt: string;
    category: AssetCategory;
    source: string;
    aspectRatio: string;
  } | null>(null);
  const [assignedToast, setAssignedToast] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<
    Array<{ url: string; prompt: string; category: AssetCategory; source: string; time: string }>
  >([]);

  // Collect all visual assets across the entire website dynamically
  const siteAssets: SiteAsset[] = useMemo(() => {
    const list: SiteAsset[] = [];

    // 1. Header Logo
    if (config.header?.logoImage) {
      list.push({
        id: "asset-header-logo",
        name: "Ana Başlık Logosu (Navbar)",
        category: "logo",
        url: config.header.logoImage,
        usedIn: ["Üst Menü (Navbar)", "Mobil Menü", "Footer (Alt Menü)"],
        dimensions: config.header.logoHeight ? `${config.header.logoWidth || "Auto"}x${config.header.logoHeight}px` : "Serbest",
        fileType: config.header.logoImage.startsWith("data:image/svg") ? "SVG" : "PNG / WEBP",
        createdWith: "upload",
        createdAt: "Sitede Aktif"
      });
    }

    // 2. Favicon
    const faviconUrl = config.favicon || config.header?.logoImage || "https://images.unsplash.com/photo-1542744094-3a31727560fa?auto=format&fit=crop&w=128&h=128&q=80";
    list.push({
      id: "asset-favicon",
      name: "Tarayıcı Sekme Simgesi (Favicon)",
      category: "favicon",
      url: faviconUrl,
      usedIn: ["Tarayıcı Sekmesi", "Mobil Ana Ekran Kısayolu", "Google Arama Sonuç İkonu"],
      dimensions: "128x128px (Kare)",
      fileType: faviconUrl.startsWith("data:image/svg") ? "SVG" : "ICO / PNG",
      createdWith: config.favicon ? "upload" : "system",
      createdAt: config.favicon ? "Özel Yüklendi" : "Varsayılan"
    });

    // 3. Hero Banner Background
    if (config.hero?.bgImage) {
      list.push({
        id: "asset-hero-banner",
        name: "Ana Sayfa Hero Banner Görseli",
        category: "banner",
        url: config.hero.bgImage,
        usedIn: ["Ana Sayfa Karşılama Başlığı (Hero)", "Üst Sayfa Arka Planı"],
        dimensions: "1920x1080px (16:9)",
        fileType: "JPG / WEBP",
        createdWith: "preset",
        createdAt: "Hero Bölümü"
      });
    }

    // 4. About Us Image
    if (config.about?.image) {
      list.push({
        id: "asset-about-image",
        name: "Hakkımızda Kurumsal Fotoğrafı",
        category: "banner",
        url: config.about.image,
        usedIn: ["Hakkımızda Bölümü", "Kurumsal Tanıtım Bloğu"],
        dimensions: "1200x800px (4:3)",
        fileType: "JPG / WEBP",
        createdWith: "preset",
        createdAt: "Hakkımızda"
      });
    }

    // 5. OpenGraph Social Share Image
    if (config.seo?.ogImage) {
      list.push({
        id: "asset-seo-og",
        name: "Sosyal Paylaşım Afişi (og:image)",
        category: "social_og",
        url: config.seo.ogImage,
        usedIn: ["WhatsApp Paylaşım Balonu", "Facebook Bağlantı Kartı", "𝕏 (Twitter) Kartı", "LinkedIn"],
        dimensions: "1200x630px (1.91:1)",
        fileType: "JPG / PNG",
        createdWith: "preset",
        createdAt: "SEO & OpenGraph"
      });
    }

    // 6. Services Images
    (config.services?.items || []).forEach((srv, idx) => {
      if (srv.image) {
        list.push({
          id: `asset-srv-${srv.id || idx}`,
          name: `Hizmet: ${srv.title}`,
          category: "product_service",
          url: srv.image,
          usedIn: [`Hizmet Kartı (${srv.title})`, `Hizmet Sayfası (/hizmet-${srv.slug || idx})`],
          dimensions: "800x600px",
          fileType: "JPG / WEBP",
          createdWith: "preset",
          createdAt: "Hizmetler"
        });
      }
    });

    // 7. Products Images
    (config.products?.items || []).forEach((prd, idx) => {
      const pUrl = prd.featuredImage || prd.image || (prd.images && prd.images[0]);
      if (pUrl) {
        list.push({
          id: `asset-prd-${prd.id || idx}`,
          name: `Ürün: ${prd.title}`,
          category: "product_service",
          url: pUrl,
          usedIn: [`Ürün Kataloğu (${prd.title})`, `Ürün Detay Vitrini`],
          dimensions: "800x800px",
          fileType: "JPG / WEBP",
          createdWith: "preset",
          createdAt: "Ürünler"
        });
      }
    });

    // 8. Gallery Images
    (config.gallery?.items || []).forEach((gal, idx) => {
      if (gal.imageUrl) {
        list.push({
          id: `asset-gal-${gal.id || idx}`,
          name: `Galeri: ${gal.title || `Fotoğraf ${idx + 1}`}`,
          category: "gallery",
          url: gal.imageUrl,
          usedIn: ["Fotoğraf Vitrini (Masonry)", "Galeri Bölümü"],
          dimensions: "1200x900px",
          fileType: "JPG / WEBP",
          createdWith: "preset",
          createdAt: "Galeri"
        });
      }
    });

    // 9. Custom Assets Library (User-created / Saved)
    (config.customAssets || []).forEach((cAsset) => {
      if (!list.some((existing) => existing.url === cAsset.url)) {
        list.push(cAsset);
      }
    });

    return list;
  }, [config]);

  // Filtered list
  const filteredAssets = useMemo(() => {
    return siteAssets.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usedIn.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [siteAssets, selectedCategory, searchQuery]);

  // Copy to clipboard helper
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct Assign Helper for Core Assets
  const handleAssignToSlot = (
    url: string,
    slot: "header_logo" | "favicon" | "hero_bg" | "og_image" | "about_image" | "gallery"
  ) => {
    updateConfig((prev) => {
      const next = { ...prev };
      if (slot === "header_logo") {
        next.header = {
          ...next.header,
          logoType: "image",
          logoImage: url
        };
      } else if (slot === "favicon") {
        next.favicon = url;
        // Dynamically update document link favicon
        try {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = url;
        } catch (_) {}
      } else if (slot === "hero_bg") {
        next.hero = {
          ...next.hero,
          bgImage: url
        };
      } else if (slot === "og_image") {
        next.seo = {
          ...next.seo,
          ogImage: url
        };
      } else if (slot === "about_image") {
        next.about = {
          ...next.about,
          image: url
        };
      } else if (slot === "gallery") {
        const newGalleryItem: GalleryItem = {
          id: `gal-ai-${Date.now()}`,
          title: generatedAsset?.prompt ? generatedAsset.prompt.slice(0, 30) : `${config.companyName} Özel Görsel`,
          category: "Kurumsal",
          imageUrl: url,
          aspectRatio: "landscape"
        };
        next.gallery = {
          ...next.gallery,
          enabled: true,
          items: [newGalleryItem, ...(next.gallery?.items || [])]
        };
      }

      // Also ensure it is in customAssets library
      const alreadyInLibrary = (next.customAssets || []).some((a) => a.url === url);
      if (!alreadyInLibrary) {
        const newLibraryAsset: SiteAsset = {
          id: `asset-custom-${Date.now()}`,
          name: slot === "header_logo" ? "Özel Kurumsal Logo" : slot === "favicon" ? "Özel Favicon" : "AI Üretilen Varlık",
          category:
            slot === "header_logo"
              ? "logo"
              : slot === "favicon"
              ? "favicon"
              : slot === "hero_bg"
              ? "banner"
              : slot === "og_image"
              ? "social_og"
              : "general",
          url: url,
          usedIn: [slot],
          dimensions: "AI Generated",
          fileType: url.startsWith("data:image/svg") ? "SVG" : "PNG",
          createdWith: "ai-imagen",
          prompt: generatedAsset?.prompt,
          createdAt: new Date().toLocaleDateString("tr-TR")
        };
        next.customAssets = [newLibraryAsset, ...(next.customAssets || [])];
      }

      return next;
    });

    const slotNames: Record<string, string> = {
      header_logo: "Ana Başlık Logosu (Navbar)",
      favicon: "Tarayıcı Sekme Simgesi (Favicon)",
      hero_bg: "Ana Sayfa Hero Banner'ı",
      og_image: "Sosyal Medya Paylaşım Afişi (OG)",
      about_image: "Hakkımızda Fotoğrafı",
      gallery: "Fotoğraf Galerisi"
    };

    setAssignedToast(`${slotNames[slot] || slot} başarıyla güncellendi!`);
    setTimeout(() => setAssignedToast(null), 3000);
  };

  // Upload/Replace modal handler
  const handleSaveUpload = (newUrl: string) => {
    if (!uploadModalTarget || !newUrl) return;

    if (uploadModalTarget.id === "asset-header-logo") {
      handleAssignToSlot(newUrl, "header_logo");
    } else if (uploadModalTarget.id === "asset-favicon") {
      handleAssignToSlot(newUrl, "favicon");
    } else if (uploadModalTarget.id === "asset-hero-banner") {
      handleAssignToSlot(newUrl, "hero_bg");
    } else if (uploadModalTarget.id === "asset-about-image") {
      handleAssignToSlot(newUrl, "about_image");
    } else if (uploadModalTarget.id === "asset-seo-og") {
      handleAssignToSlot(newUrl, "og_image");
    } else {
      // General custom replacement
      updateConfig((prev) => {
        const next = { ...prev };
        // Check if it belongs to services
        if (uploadModalTarget.id.startsWith("asset-srv-")) {
          const srvId = uploadModalTarget.id.replace("asset-srv-", "");
          next.services.items = next.services.items.map((s) => (s.id === srvId ? { ...s, image: newUrl } : s));
        }
        // Check if it belongs to products
        else if (uploadModalTarget.id.startsWith("asset-prd-")) {
          const prdId = uploadModalTarget.id.replace("asset-prd-", "");
          next.products.items = next.products.items.map((p) =>
            p.id === prdId ? { ...p, image: newUrl, featuredImage: newUrl } : p
          );
        }
        // Check if gallery
        else if (uploadModalTarget.id.startsWith("asset-gal-")) {
          const galId = uploadModalTarget.id.replace("asset-gal-", "");
          next.gallery.items = next.gallery.items.map((g) => (g.id === galId ? { ...g, imageUrl: newUrl } : g));
        }
        return next;
      });
      setAssignedToast(`Varlık başarıyla güncellendi!`);
      setTimeout(() => setAssignedToast(null), 3000);
    }

    setUploadModalTarget(null);
    setUploadUrlInput("");
  };

  // File to WebP reader and optimizer
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir görsel dosyası seçin (PNG, SVG, JPG, WebP).");
      return;
    }

    try {
      const companySubdomain = config.cloudflare?.subdomain || "sirket";
      const details = await compressImageFileToWebP(file, 1920, 0.82, companySubdomain);
      handleSaveUpload(details.base64);
      setAssignedToast(`Varlık WebP formatına dönüştürüldü (%${details.savingsPercentage} tasarruf, Cloudflare Edge hazır)!`);
      setTimeout(() => setAssignedToast(null), 4000);
    } catch (err: any) {
      // Fallback to standard reader
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          handleSaveUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run full-site batch WebP conversion for Cloudflare Edge delivery
  const handleRunBatchOptimization = async () => {
    setIsBatchOptimizing(true);
    setBatchResult(null);
    try {
      const { updatedConfig, report } = await batchConvertSiteAssetsToWebP(
        config,
        (current, total, currentItemName) => {
          setBatchProgress({ current, total, currentItemName });
        }
      );
      updateConfig(() => updatedConfig);
      setBatchResult(report);
      setAssignedToast(`Tüm site varlıkları WebP formatına dönüştürüldü! %${report.savingsPercentage} boyut tasarrufu sağlandı.`);
      setTimeout(() => setAssignedToast(null), 5000);
    } catch (err: any) {
      alert("Toplu optimizasyon sırasında bir hata oluştu: " + (err?.message || "Bilinmeyen hata"));
    } finally {
      setIsBatchOptimizing(false);
      setBatchProgress(null);
    }
  };

  // AI Generation via Imagen / Gemini
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setGenerationError("Lütfen oluşturmak istediğiniz görseli açıklayan bir metin (prompt) girin.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch("/api/generate-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          assetCategory: aiCategory,
          style: aiStyle,
          aspectRatio: aiAspectRatio,
          companyName: config.companyName || "JetKur",
          sector: config.sector || "Genel"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Görsel varlık üretilemedi");
      }

      const newAsset = {
        url: data.imageUrl,
        prompt: aiPrompt,
        category: aiCategory,
        source: data.source || "imagen-3.0",
        aspectRatio: data.aspectRatio || aiAspectRatio
      };

      setGeneratedAsset(newAsset);
      setHistoryList((prev) => [
        {
          url: data.imageUrl,
          prompt: aiPrompt,
          category: aiCategory,
          source: data.source || "imagen-3.0",
          time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        },
        ...prev.slice(0, 7)
      ]);
    } catch (err: any) {
      console.error("AI Asset Generation error:", err);
      setGenerationError(err.message || "Görsel üretilirken bir sorun oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Pre-built Quick Prompt Templates
  const promptPresets: Record<AssetCategory, string[]> = {
    logo: [
      `${config.companyName} için modern minimalist teknoloji amblemi, temiz geometrik çizgiler, şık lüks kurumsal kimlik`,
      `${config.sector} sektöründe lider firma için dairesel amblem, yüksek kontrast, altın ve lacivert tonları`,
      `${config.companyName} harf monogramı, 3D modern stil, profesyonel web ikonu`
    ],
    favicon: [
      `${config.companyName.slice(0, 2).toUpperCase()} harflerinden oluşan ultra keskin, minimalist 1:1 kare favicon simgesi`,
      `${config.sector} için parlak degrade zeminli, sade ve anlaşılır vektör web sitesi sekme ikonu`,
      `Modern geometrik kalkan ve güvenlik rozeti simgesi, 64x64 favicon uyumlu`
    ],
    icon: [
      `${config.sector} için 3D render parlak cam efektli servis rozet ikonu`,
      `7/24 Kesintisiz Müşteri Desteği ve Hızlı Teklif için modern flat vektör rozeti`,
      `Garantili İşçilik ve Sertifikalı Hizmet onay mührü, altın rozet`
    ],
    banner: [
      `${config.companyName} için modern ve aydınlık ofis/operasyon ortamı, 16:9 geniş açı kurumsal fotoğraf`,
      `${config.sector} sektöründe profesyonel ekip çalışması ve müşteri memnuniyeti, sinematik doğal ışık`,
      `Türkiye genelinde hızlı servis ve son teknoloji ekipman vitrini, 4K profesyonel çekim`
    ],
    social_og: [
      `1200x630 piksel yüksek tıklama oranlı sosyal medya lansman afişi, ${config.companyName} kurumsal renkleri`,
      `WhatsApp ve Facebook paylaşımında dikkat çeken, ${config.sector} hizmetleri tanıtım kartı`
    ],
    product_service: [
      `${config.sector} hizmeti sunan güler yüzlü ve sertifikalı profesyonel usta/danışman`,
      `Modern ve şık ürün ambalajı, stüdyo aydınlatması, nötr arka plan`
    ],
    gallery: [
      `${config.companyName} tarafından tamamlanan son teknoloji kurumsal proje ve teslimat fotoğrafı`,
      `Müşteri memnuniyeti ile sonuçlanan başarılı saha uygulaması ve modern ekipmanlar`
    ],
    general: [
      `Modern kurumsal web sitesi için şık grafik detaylar ve güven veren arka plan kompozisyonu`
    ]
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl border border-slate-800 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Merkezi Görsel & Logo Yönetimi</span>
              <span className="bg-pink-400/20 text-pink-200 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono">
                Imagen 3 Destekli
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Varlık Yönetimi (Asset Hub)</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Web sitenizde kullanılan logoları, favicon sekme simgelerini, web ikonlarını ve afişleri tek bir
              merkezden yönetin, tek tıkla yenileyin veya Google Imagen AI ile sıfırdan tasarlayın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveSubTab("ai_studio")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-slate-950 text-xs font-black shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-slate-950" />
              <span>AI ile Varlık Üret</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const dummyTarget: SiteAsset = {
                  id: "custom-upload-" + Date.now(),
                  name: "Yeni Görsel Varlık",
                  category: "general",
                  url: "",
                  usedIn: ["Varlık Kütüphanesi"]
                };
                setUploadModalTarget(dummyTarget);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Yeni Görsel Yükle</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-medium">Toplam Görsel Varlık</span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">{siteAssets.length} Adet</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-medium">Ana Logo Durumu</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {config.header?.logoType === "image" ? "Görsel Logo Aktif" : "Tipografik İkon"}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-medium">Favicon Sekme İkonu</span>
            <span className="text-sm font-bold text-amber-300 mt-0.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {config.favicon ? "Özel Favicon" : "Dinamik Aktif"}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-medium">CDN Dağıtımı</span>
            <span className="text-sm font-bold text-purple-300 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Cloudflare Edge (0.02s)
            </span>
          </div>
        </div>
      </div>

      {/* ASSIGNED NOTIFICATION TOAST */}
      <AnimatePresence>
        {assignedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{assignedToast}</span>
            </div>
            <button onClick={() => setAssignedToast(null)} className="text-slate-950/80 hover:text-slate-950">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SUB-TAB SELECTOR */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "all"
              ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FolderKanban className="w-4 h-4 text-blue-600" />
          <span>Tüm Varlıklar ({siteAssets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("core")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "core"
              ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Temel Marka Varlıkları (Logo, Favicon, Banner)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("ai_studio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "ai_studio"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>AI Varlık Stüdyosu (Imagen 3)</span>
          <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 text-[10px] font-mono font-bold">
            YENİ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("health")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "health"
              ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Varlık Sağlık & Boyut Denetimi</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: TÜM VARLIKLAR (CATALOG VIEW) */}
      {activeSubTab === "all" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Varlık adı veya kullanıldığı yere göre ara..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Tümü" },
                { id: "logo", label: "Logolar" },
                { id: "favicon", label: "Favicon" },
                { id: "banner", label: "Banner & Hero" },
                { id: "product_service", label: "Hizmet & Ürün" },
                { id: "social_og", label: "Sosyal Paylaşım" },
                { id: "gallery", label: "Galeri" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Grid Cards */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FolderKanban className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Aranan kriterde görsel varlık bulunamadı.</p>
              <p className="text-xs text-slate-400">Farklı bir arama terimi deneyin veya "AI ile Varlık Üret" sekmesinden yeni bir görsel tasarlayın.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all overflow-hidden flex flex-col group"
                >
                  {/* Image Preview Window */}
                  <div className="relative aspect-16/10 bg-slate-900 flex items-center justify-center p-3 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-md transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image if broken
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1542744094-3a31727560fa?auto=format&fit=crop&w=400&q=80";
                      }}
                    />

                    {/* Quick Preview Lightbox Action */}
                    <button
                      type="button"
                      onClick={() => setPreviewZoomUrl({ url: asset.url, title: asset.name })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-white hover:bg-slate-900 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Büyük Önizleme"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    {/* Badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 font-mono text-[10px] font-bold backdrop-blur-xs">
                      {asset.fileType || "PNG / JPG"}
                    </span>
                  </div>

                  {/* Asset Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-900 leading-snug">{asset.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">
                          {asset.category}
                        </span>
                      </div>

                      {/* Where it is used */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {asset.usedIn.map((loc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-medium"
                          >
                            <Layers className="w-2.5 h-2.5 text-slate-500" />
                            <span>{loc}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset.url, asset.id)}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-[11px] font-bold cursor-pointer"
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>URL Kopyala</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUploadModalTarget(asset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Değiştir / Yükle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB 2: TEMEL MARKA VARLIKLARI (LOGO, FAVICON, BANNER) */}
      {activeSubTab === "core" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Header Logo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Ana Başlık Logosu (Navbar)</h3>
                  <p className="text-xs text-slate-500">Üst menü, mobil menü ve footer alanında görüntülenir.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Aktif
              </span>
            </div>

            {/* Logo Preview Container */}
            <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center min-h-[140px] border border-slate-800 relative">
              {config.header?.logoImage ? (
                <img
                  src={config.header.logoImage}
                  alt={config.companyName}
                  style={{
                    height: `${config.header.logoHeight || 44}px`,
                    width: config.header.logoWidth ? `${config.header.logoWidth}px` : "auto",
                    objectFit: config.header.logoObjectFit || "contain"
                  }}
                  className="max-h-24"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <p className="text-xs font-bold text-amber-400">Görsel logo tanımlanmamış</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Metin/ikon tabanlı logo kullanılıyor</p>
                </div>
              )}
            </div>

            {/* Dimensions Control */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block font-medium mb-1">Logo Yüksekliği (px)</label>
                <input
                  type="number"
                  min="24"
                  max="120"
                  value={config.header?.logoHeight || 44}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 44;
                    updateConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, logoHeight: val }
                    }));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 block font-medium mb-1">Genişlik (0: Otomatik)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={config.header?.logoWidth || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    updateConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, logoWidth: val }
                    }));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const logoAsset = siteAssets.find((a) => a.id === "asset-header-logo");
                  setUploadModalTarget(
                    logoAsset || {
                      id: "asset-header-logo",
                      name: "Ana Başlık Logosu",
                      category: "logo",
                      url: config.header?.logoImage || "",
                      usedIn: ["Navbar"]
                    }
                  );
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                Yeni Logo Yükle
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("logo");
                  setAiPrompt(`${config.companyName} için modern minimalist logo, vektörel amblem`);
                }}
                className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>AI ile Üret</span>
              </button>
            </div>
          </div>

          {/* Card 2: Favicon (Browser Tab Icon) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Tarayıcı Sekme Simgesi (Favicon)</h3>
                  <p className="text-xs text-slate-500">Kullanıcının tarayıcı sekmesinde ve yer imlerinde görünür.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                16x16 / 32x32
              </span>
            </div>

            {/* Browser Tab Simulation Box */}
            <div className="p-4 bg-slate-100 rounded-xl space-y-3 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Canlı Tarayıcı Sekme Simülasyonu
              </span>
              <div className="bg-slate-200/90 rounded-t-xl p-2 flex items-center gap-2 max-w-xs border border-slate-300">
                <img
                  src={config.favicon || config.header?.logoImage || "https://images.unsplash.com/photo-1542744094-3a31727560fa?auto=format&fit=crop&w=64&h=64&q=80"}
                  alt="Favicon"
                  className="w-4 h-4 rounded-xs object-contain shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 truncate">
                  {config.companyName || "JetKur"} | {config.sector || "Hizmetleri"}
                </span>
                <span className="text-slate-400 text-xs ml-auto">×</span>
              </div>
            </div>

            {/* High-res favicon preview box */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={config.favicon || config.header?.logoImage || "https://images.unsplash.com/photo-1542744094-3a31727560fa?auto=format&fit=crop&w=128&h=128&q=80"}
                alt="Favicon large"
                className="w-14 h-14 rounded-xl object-contain bg-slate-900 p-1 border border-slate-300 shadow-xs"
              />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-900">1:1 Kare Vektör / PNG</p>
                <p className="text-[11px] text-slate-500">Google Arama sonuçlarında sitenizin yanında bu simge çıkar.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const favAsset = siteAssets.find((a) => a.id === "asset-favicon");
                  setUploadModalTarget(
                    favAsset || {
                      id: "asset-favicon",
                      name: "Favicon",
                      category: "favicon",
                      url: config.favicon || "",
                      usedIn: ["Tarayıcı"]
                    }
                  );
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                Favicon Değiştir
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("favicon");
                  setAiPrompt(`${config.companyName.slice(0, 2).toUpperCase()} baş harfli modern kare favicon ikonu`);
                }}
                className="py-2 px-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>AI ile Üret</span>
              </button>
            </div>
          </div>

          {/* Card 3: Social Media (OpenGraph) Share Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-800">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Sosyal Paylaşım Afişi (OpenGraph)</h3>
                  <p className="text-xs text-slate-500">WhatsApp, Facebook, LinkedIn ve X link paylaşımlarında çıkar.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 text-[10px] font-bold">
                1200x630
              </span>
            </div>

            <div className="aspect-16/9 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative">
              <img
                src={config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"}
                alt="OG Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
                <span className="text-amber-400 font-bold text-[10px] uppercase font-mono">
                  {config.companyName || "HIZLIWEB"}
                </span>
                <p className="text-xs font-black text-white line-clamp-1">{config.seo?.metaTitle || config.slogan}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const ogAsset = siteAssets.find((a) => a.id === "asset-seo-og");
                  setUploadModalTarget(
                    ogAsset || {
                      id: "asset-seo-og",
                      name: "Sosyal Medya Afişi (OG)",
                      category: "social_og",
                      url: config.seo?.ogImage || "",
                      usedIn: ["Sosyal Medya"]
                    }
                  );
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                Afişi Değiştir
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("social_og");
                  setAiPrompt(`${config.companyName} için 1200x630 piksel sosyal medya paylaşım afişi`);
                }}
                className="py-2 px-3 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-700" />
                <span>AI ile Üret</span>
              </button>
            </div>
          </div>

          {/* Card 4: Hero Banner Background */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Ana Sayfa Hero Banner</h3>
                  <p className="text-xs text-slate-500">Ziyaretçiyi karşılayan ana görsel ve arka plan.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                16:9
              </span>
            </div>

            <div className="aspect-16/9 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative">
              <img
                src={config.hero?.bgImage || "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80"}
                alt="Hero Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 p-4 flex items-center justify-center">
                <span className="text-xs font-bold text-white/90 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-xs">
                  {config.hero?.title || "Ana Sayfa Hero"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const heroAsset = siteAssets.find((a) => a.id === "asset-hero-banner");
                  setUploadModalTarget(
                    heroAsset || {
                      id: "asset-hero-banner",
                      name: "Hero Banner",
                      category: "banner",
                      url: config.hero?.bgImage || "",
                      usedIn: ["Hero"]
                    }
                  );
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                Hero Görselini Değiştir
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("banner");
                  setAiPrompt(`${config.sector} sektörü için 16:9 modern kurumsal hero banner fotoğrafı`);
                }}
                className="py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>AI ile Üret</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: YAPAY ZEKA VARLIK STÜDYOSU (IMAGEN 3) */}
      {activeSubTab === "ai_studio" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <h3 className="text-base font-black text-slate-900">
                    Google Imagen 3 & Gemini AI Görsel Stüdyosu
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  İşletmeniz için yüksek çözünürlüklü logolar, web ikonları, 16:9 banner'lar ve sosyal medya görselleri üretin.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-bold">
                  ⚡ Imagen 3.0 Motoru
                </span>
              </div>
            </div>

            {/* Controls: Category, Style, Aspect Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">1. Varlık Kategorisi</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value as AssetCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="logo">🏢 Kurumsal Logo & Marka Amblemi</option>
                  <option value="favicon">🔲 Favicon (1:1 Kare Sekme Simgesi)</option>
                  <option value="icon">🌟 Web İkonu & Rozet</option>
                  <option value="banner">🏙️ 16:9 Hero Web Banner</option>
                  <option value="social_og">📢 1200x630 Sosyal Medya (OG) Afişi</option>
                  <option value="product_service">🛠️ Hizmet / Ürün Tanıtım Görseli</option>
                  <option value="gallery">📸 Proje & Galeri Fotoğrafı</option>
                </select>
              </div>

              {/* Style Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">2. Tasarım Tarzı</label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="minimalist">Modern & Minimalist Vektör</option>
                  <option value="photorealistic">Foto-Gerçekçi (4K Cinematic)</option>
                  <option value="3d">3D Render & Parlak Cam İllüstrasyon</option>
                  <option value="vector">Düz Çizim (Flat Vector Design)</option>
                  <option value="luxury">Lüks & Prestij (Gold & Dark Navy)</option>
                </select>
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">3. En-Boy Oranı</label>
                <select
                  value={aiAspectRatio}
                  onChange={(e) => setAiAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="1:1">1:1 Kare (Logo, Favicon & İkonlar)</option>
                  <option value="16:9">16:9 Geniş Ekran (Hero & Banner)</option>
                  <option value="4:3">4:3 Kart & Hizmet Vitrini</option>
                  <option value="3:4">3:4 Dikey Portre</option>
                  <option value="9:16">9:16 Mobil Hikaye (Story)</option>
                </select>
              </div>
            </div>

            {/* Prompt presets for selected category */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Hızlı Şablon Önerileri ({config.companyName} / {config.sector})
              </span>
              <div className="flex flex-wrap gap-2">
                {(promptPresets[aiCategory] || []).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(preset)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
                  >
                    ✨ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Özel Görsel Tanımı (Prompt)
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Örneğin: Lacivert ve turuncu renklerde, modern geometrik kalkan ve diş hekimliği ikonu, 3D parlak yansımalı..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
              />
            </div>

            {/* Generation Button & Error */}
            {generationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAI}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-pink-950 to-slate-900 hover:opacity-95 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
                  <span>Google Imagen ile Üretiliyor, Lütfen Bekleyin...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>AI ile Görsel Varlığı Oluştur</span>
                </>
              )}
            </button>
          </div>

          {/* GENERATION RESULT SHOWCASE */}
          {generatedAsset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-white space-y-6 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                    Üretim Başarılı ({generatedAsset.source})
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">Oluşturulan Yeni Varlık</h4>
                  <p className="text-xs text-slate-400 mt-0.5 italic max-w-xl">"{generatedAsset.prompt}"</p>
                </div>

                <a
                  href={generatedAsset.url}
                  download={`hizliweb-${generatedAsset.category}-${Date.now()}.png`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (PNG)</span>
                </a>
              </div>

              {/* Large Image Preview with Aspect Ratio Frame */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center min-h-[260px] max-h-[420px] overflow-hidden">
                <img
                  src={generatedAsset.url}
                  alt="Generated Asset"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* ONE-CLICK DEPLOY TO SLOT */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  ⚡ Bu Varlığı Tek Tıkla Sitenizde Kullanın:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "header_logo")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Header Logo Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "favicon")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-blue-500 hover:text-white text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Favicon Ata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "hero_bg")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-purple-500 hover:text-white text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Hero Banner Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "og_image")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-pink-500 hover:text-white text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>OG Afişi Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "about_image")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hakkımızda Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignToSlot(generatedAsset.url, "gallery")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-500 hover:text-white text-slate-200 border border-slate-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Galeriye Ekle</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RECENT GENERATIONS HISTORY */}
          {historyList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Bu Oturumda Üretilenler ({historyList.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group relative"
                  >
                    <div className="aspect-square bg-slate-900 flex items-center justify-center p-2">
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-2 text-[10px] space-y-1">
                      <p className="font-bold text-slate-800 truncate">{item.category.toUpperCase()}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setGeneratedAsset({
                            url: item.url,
                            prompt: item.prompt,
                            category: item.category,
                            source: item.source,
                            aspectRatio: "1:1"
                          })
                        }
                        className="w-full py-1 bg-slate-900 text-white rounded font-bold text-center hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                      >
                        Seç & Kullan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. SUB-TAB 4: VARLIK SAĞLIK & BOYUT DENETİMİ (HEALTH AUDIT) */}
      {activeSubTab === "health" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900">Varlık Sağlığı, Format & Hız Optimizasyonu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Görsellerinizin boyutları, çözünürlükleri ve SEO standartlarına uygunluk durumu analiz edildi.
            </p>
          </div>

          <div className="space-y-3">
            {/* Item 1: Favicon Check */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    config.favicon ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tarayıcı Sekme Simgesi (Favicon)</h4>
                  <p className="text-xs text-slate-500">
                    {config.favicon
                      ? "Özel favicon tanımlı ve Google Arama motoru için optimize."
                      : "Varsayılan favicon aktif. Markanıza özel bir favicon yüklemeniz önerilir."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("favicon");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                Favicon Ayarla
              </button>
            </div>

            {/* Item 2: OpenGraph 1200x630 Check */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    config.seo?.ogImage ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sosyal Paylaşım Afişi (1200x630 OpenGraph)</h4>
                  <p className="text-xs text-slate-500">
                    {config.seo?.ogImage
                      ? "WhatsApp ve Facebook için 1.91:1 oranında afiş belirlenmiş."
                      : "Özel paylaşım görseli belirlenmemiş. Link paylaşıldığında boş veya kesik çıkabilir."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("ai_studio");
                  setAiCategory("social_og");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                OG Afişi Oluştur
              </button>
            </div>

            {/* Item 3: Logo SVG / High-Res Check */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    config.header?.logoImage ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Logo Netliği & Vektör Uyumluluğu</h4>
                  <p className="text-xs text-slate-500">
                    {config.header?.logoImage
                      ? "Logo yüksek çözünürlüklü olarak navbar ve mobil ekranda ölçekleniyor."
                      : "Tipografik logo kullanılıyor. İsterseniz görsel logo ekleyebilirsiniz."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("core")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                Logoyu İncele
              </button>
            </div>

            {/* Item 4: WebP Format & Cloudflare Edge CDN Delivery Pipeline */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 border border-slate-800 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">WebP Formatı & Cloudflare Edge Hızlandırma</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        Edge Polish
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Görsellerinizi WebP formatına dönüştürerek sitenizin 320+ Cloudflare küresel Anycast noktasından ışık hızında yüklenmesini sağlayın.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunBatchOptimization}
                  disabled={isBatchOptimizing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shrink-0 cursor-pointer transition-all shadow-lg disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBatchOptimizing ? "animate-spin" : ""}`} />
                  <span>{isBatchOptimizing ? "WebP'ye Dönüştürülüyor..." : "Tümünü WebP'ye Dönüştür"}</span>
                </button>
              </div>

              {/* Progress bar when batch converting */}
              {isBatchOptimizing && batchProgress && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 animate-pulse" />
                      <span>{batchProgress.currentItemName}</span>
                    </span>
                    <span className="text-slate-400 font-bold">
                      {batchProgress.current} / {batchProgress.total} (%{Math.round((batchProgress.current / batchProgress.total) * 100)})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Result summary report */}
              {batchResult && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Optimizasyon Başarıyla Tamamlandı!</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block font-mono">DÖNÜŞTÜRÜLEN</span>
                      <span className="text-white font-bold font-mono">{batchResult.convertedCount} Görsel</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block font-mono">TASARRUF ORANI</span>
                      <span className="text-emerald-400 font-bold font-mono">%{batchResult.savingsPercentage}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block font-mono">KAZANILAN BOYUT</span>
                      <span className="text-amber-400 font-bold font-mono">{formatBytes(batchResult.savedBytes)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block font-mono">CLOUDFLARE POP</span>
                      <span className="text-cyan-400 font-bold font-mono">{batchResult.edgePoPs}+ Nokta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cloudflare Edge simulated headers */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-slate-400">Cloudflare Edge Başlıkları:</span>
                <span className="text-emerald-400 font-semibold">CF-Cache-Status: HIT</span>
                <span className="text-cyan-400 font-semibold">CF-Polished: webp_auto</span>
                <span className="text-slate-300">Cache-Control: public, max-age=31536000, immutable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. UPLOAD / REPLACE MODAL */}
      <AnimatePresence>
        {uploadModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900">Görsel Varlık Yükle / Değiştir</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalTarget(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600">
                Hedef Varlık: <strong className="text-slate-900">{uploadModalTarget.name}</strong>
              </div>

              {/* Drag and drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl bg-slate-50 text-center cursor-pointer transition-all space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-800">
                  Dosyayı buraya sürükleyin veya bilgisayarınızdan seçin
                </p>
                <p className="text-[11px] text-slate-500">Desteklenen formatlar: PNG, SVG, JPG, WebP (Maks 10MB)</p>
              </div>

              {/* URL input option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Veya Direkt Görsel URL'si Yapıştırın</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={uploadUrlInput}
                    onChange={(e) => setUploadUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... veya https://siteniz.com/logo.png"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    disabled={!uploadUrlInput.trim()}
                    onClick={() => handleSaveUpload(uploadUrlInput.trim())}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. ZOOM LIGHTBOX */}
      <AnimatePresence>
        {previewZoomUrl && (
          <div
            onClick={() => setPreviewZoomUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          >
            <div className="max-w-4xl max-h-[85vh] p-3 relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-full flex items-center justify-between text-white pb-3">
                <span className="text-sm font-bold">{previewZoomUrl.title}</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoomUrl(null)}
                  className="p-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={previewZoomUrl.url}
                alt={previewZoomUrl.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl bg-slate-900 p-2"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
