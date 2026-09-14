import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  ScheduledSocialPost, 
  SocialPlatform, 
  SocialPostStatus, 
  ProductItem 
} from "../../types";
import {
  Share2,
  Calendar,
  Clock,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Eye,
  Sparkles,
  ShoppingBag,
  Tag,
  Filter,
  Search,
  Send,
  ChevronDown,
  Hash,
  ArrowRight,
  Globe,
  RefreshCw,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  X,
  Layers,
  Image as ImageIcon,
  Zap,
  Info
} from "lucide-react";

interface SocialPostSchedulerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onNavigateToSocialProfiles?: () => void;
  onNavigateToCatalog?: () => void;
  preselectedProductId?: string;
}

const PLATFORM_CONFIG: Record<SocialPlatform, { 
  name: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
  bgLight: string;
  badgeClass: string;
  maxChars: number;
}> = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "#E1306C",
    bgLight: "bg-pink-50 text-pink-700 border-pink-200",
    badgeClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    maxChars: 2200
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    badgeClass: "bg-blue-600 text-white",
    maxChars: 5000
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
    badgeClass: "bg-sky-700 text-white",
    maxChars: 3000
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "#000000",
    bgLight: "bg-slate-100 text-slate-800 border-slate-300",
    badgeClass: "bg-slate-900 text-white",
    maxChars: 280
  },
  whatsapp: {
    name: "WhatsApp Durum",
    icon: MessageCircle,
    color: "#25D366",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeClass: "bg-emerald-600 text-white",
    maxChars: 700
  }
};

const SUGGESTED_HASHTAGS = [
  "#otokurtarma",
  "#yolyardım",
  "#çekici",
  "#kampanya",
  "#fırsat",
  "#indirim",
  "#724hizmet",
  "#araçkurtarma",
  "#güvenliyolculuk",
  "#akütakviye"
];

const CTA_OPTIONS = [
  "Ürünü İncele & Sipariş Ver",
  "Hemen Sipariş Ver & Teklif Al",
  "Detaylı Bilgi & Fiyat Al",
  "Tek Tıkla WhatsApp Siparişi",
  "Fırsatı Kaçırmayın"
];

export const SocialPostScheduler: React.FC<SocialPostSchedulerProps> = ({
  config,
  onChange,
  onNavigateToSocialProfiles,
  onNavigateToCatalog,
  preselectedProductId
}) => {
  // Posts collection
  const posts: ScheduledSocialPost[] = config.socialScheduler?.posts || [];
  const products: ProductItem[] = config.products?.items || [];
  const isAutoSimulation = config.socialScheduler?.autoPublishSimulation ?? true;

  // UI state
  const [activeTab, setActiveTab] = useState<"all" | "queued" | "published" | "draft">("all");
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>("instagram");

  // Form State for creating/editing post
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPlatforms, setFormPlatforms] = useState<SocialPlatform[]>(["instagram", "facebook"]);
  const [formDate, setFormDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [formTime, setFormTime] = useState("18:00");
  const [formProductId, setFormProductId] = useState<string>(preselectedProductId || "");
  const [formCtaText, setFormCtaText] = useState(CTA_OPTIONS[0]);
  const [formIncludeUtm, setFormIncludeUtm] = useState(true);
  const [formAttachProductImage, setFormAttachProductImage] = useState(true);
  const [formCustomImage, setFormCustomImage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to generate absolute product link
  const getProductUrl = (product: ProductItem | undefined, platform?: SocialPlatform) => {
    if (!product) return "";
    const baseUrl = config.cloudflare?.deployedUrl || 
      (config.cloudflare?.subdomain ? `https://${config.cloudflare.subdomain}.hizliweb.me` : "https://siteniz.com");
    
    const slug = product.slug || product.id;
    let url = `${baseUrl}/urun/${slug}`;
    
    if (formIncludeUtm && platform) {
      url += `?utm_source=${platform}&utm_medium=social&utm_campaign=product_scheduler`;
    }
    return url;
  };

  // Open modal to create new post (optionally prefilled with a product)
  const handleOpenNewPost = (productId?: string) => {
    setEditingPostId(null);
    setFormTitle("");
    setFormContent("");
    setFormPlatforms(["instagram", "facebook"]);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDate(tomorrow.toISOString().split("T")[0]);
    setFormTime("18:00");

    const targetProductId = productId || (products.length > 0 ? products[0].id : "");
    setFormProductId(targetProductId);
    setFormCtaText(CTA_OPTIONS[0]);
    setFormIncludeUtm(true);
    setFormAttachProductImage(true);
    setFormCustomImage("");

    if (targetProductId) {
      const prod = products.find(p => p.id === targetProductId);
      if (prod) {
        setFormTitle(`${prod.title} Kampanyası & Duyurusu`);
        setFormContent(`🔥 Özel Fırsat! ${prod.title} ürünümüz ${prod.price} avantajlı fiyatıyla satışta. 7/24 hızlı sipariş ve detaylı bilgi için hemen web sitemizi ziyaret edin.`);
      }
    }

    setIsModalOpen(true);
  };

  // Open modal to edit existing post
  const handleEditPost = (post: ScheduledSocialPost) => {
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormPlatforms(post.platforms.length > 0 ? post.platforms : ["instagram"]);
    setFormDate(post.scheduledDate);
    setFormTime(post.scheduledTime);
    setFormProductId(post.productId || "");
    setFormCtaText(post.callToAction || CTA_OPTIONS[0]);
    setFormIncludeUtm(post.includeUtmTags ?? true);
    setFormAttachProductImage(Boolean(post.productImage && !post.imageAttachment));
    setFormCustomImage(post.imageAttachment || "");
    setIsModalOpen(true);
  };

  // Toggle platform selection
  const handleTogglePlatform = (p: SocialPlatform) => {
    if (formPlatforms.includes(p)) {
      if (formPlatforms.length === 1) {
        showToast("En az 1 sosyal medya platformu seçili olmalıdır.");
        return;
      }
      setFormPlatforms(formPlatforms.filter(item => item !== p));
    } else {
      setFormPlatforms([...formPlatforms, p]);
    }
  };

  // Insert product link & CTA directly into the content text
  const handleInsertProductLink = () => {
    const selectedProd = products.find(p => p.id === formProductId);
    if (!selectedProd) return;

    const url = getProductUrl(selectedProd, formPlatforms[0] || "instagram");
    const linkSnippet = `\n\n👉 ${formCtaText}: ${url}`;
    setFormContent(prev => prev.trim() + linkSnippet);
    showToast("Ürün linki ve çağrı metni paylaşıma eklendi!");
  };

  // Append a hashtag
  const handleAddHashtag = (tag: string) => {
    if (formContent.includes(tag)) return;
    setFormContent(prev => prev.trim() + " " + tag);
  };

  // Save post (Create or Update)
  const handleSavePost = (statusOverride?: SocialPostStatus) => {
    if (!formTitle.trim()) {
      showToast("Lütfen bir başlık veya kampanya konusu girin.");
      return;
    }
    if (!formContent.trim()) {
      showToast("Lütfen paylaşım içeriği girin.");
      return;
    }

    const selectedProd = products.find(p => p.id === formProductId);
    const scheduledTimestamp = new Date(`${formDate}T${formTime}:00`).getTime();

    const newOrUpdatedPost: ScheduledSocialPost = {
      id: editingPostId || `sp_${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      platforms: formPlatforms,
      scheduledDate: formDate,
      scheduledTime: formTime,
      scheduledTimestamp: isNaN(scheduledTimestamp) ? Date.now() + 86400000 : scheduledTimestamp,
      status: statusOverride || (editingPostId ? (posts.find(p => p.id === editingPostId)?.status || "queued") : "queued"),
      productId: selectedProd?.id,
      productTitle: selectedProd?.title,
      productSlug: selectedProd?.slug,
      productUrl: selectedProd ? getProductUrl(selectedProd, formPlatforms[0]) : undefined,
      productPrice: selectedProd?.price,
      productImage: (formAttachProductImage && selectedProd) ? (selectedProd.featuredImage || selectedProd.images?.[0]) : undefined,
      imageAttachment: formCustomImage || undefined,
      callToAction: formCtaText,
      includeUtmTags: formIncludeUtm,
      hashtags: formContent.match(/#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+/g) || [],
      createdAt: editingPostId ? (posts.find(p => p.id === editingPostId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedPosts: ScheduledSocialPost[];
    if (editingPostId) {
      updatedPosts = posts.map(p => p.id === editingPostId ? newOrUpdatedPost : p);
      showToast("Paylaşım güncellendi!");
    } else {
      updatedPosts = [newOrUpdatedPost, ...posts];
      showToast("Yeni paylaşım başarıyla zamanlandı ve kuyruğa eklendi!");
    }

    onChange({
      ...config,
      socialScheduler: {
        enabled: true,
        autoPublishSimulation: isAutoSimulation,
        posts: updatedPosts
      }
    });

    setIsModalOpen(false);
  };

  // Delete post
  const handleDeletePost = (id: string) => {
    const updatedPosts = posts.filter(p => p.id !== id);
    onChange({
      ...config,
      socialScheduler: {
        enabled: true,
        autoPublishSimulation: isAutoSimulation,
        posts: updatedPosts
      }
    });
    showToast("Paylaşım kuyruktan silindi.");
  };

  // Duplicate post
  const handleDuplicatePost = (post: ScheduledSocialPost) => {
    const duplicate: ScheduledSocialPost = {
      ...post,
      id: `sp_${Date.now()}`,
      title: `${post.title} (Kopya)`,
      status: "queued",
      createdAt: new Date().toISOString()
    };
    const updatedPosts = [duplicate, ...posts];
    onChange({
      ...config,
      socialScheduler: {
        enabled: true,
        autoPublishSimulation: isAutoSimulation,
        posts: updatedPosts
      }
    });
    showToast("Paylaşım çoğaltıldı!");
  };

  // Publish Now (Simulate publish & offer native intent links)
  const handlePublishNow = (post: ScheduledSocialPost) => {
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          status: "published" as SocialPostStatus,
          publishedAt: new Date().toLocaleString("tr-TR"),
          publishedPostUrl: p.platforms.includes("twitter") 
            ? "https://x.com" 
            : p.platforms.includes("instagram") 
            ? "https://instagram.com" 
            : "https://linkedin.com"
        };
      }
      return p;
    });

    onChange({
      ...config,
      socialScheduler: {
        enabled: true,
        autoPublishSimulation: isAutoSimulation,
        posts: updatedPosts
      }
    });

    showToast(`"${post.title}" yayına alındı!`);
  };

  // Copy post text and direct product link
  const handleCopyPostContent = (post: ScheduledSocialPost) => {
    const fullText = `${post.content}${post.productUrl ? `\n\n${post.callToAction || "Detaylar"}: ${post.productUrl}` : ""}`;
    navigator.clipboard.writeText(fullText);
    showToast("Paylaşım metni ve ürün linki panoya kopyalandı!");
  };

  // Native Web Share / Intent Sharing
  const handleDirectIntentShare = (post: ScheduledSocialPost, platform: SocialPlatform) => {
    const selectedProd = products.find(p => p.id === post.productId);
    const url = post.productUrl || (selectedProd ? getProductUrl(selectedProd, platform) : window.location.origin);
    const text = `${post.content}`;

    if (platform === "twitter") {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
    } else if (platform === "linkedin") {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, "_blank", "noopener,noreferrer");
    } else if (platform === "facebook") {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(fbUrl, "_blank", "noopener,noreferrer");
    } else if (platform === "whatsapp") {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n" + url)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } else {
      // Instagram doesn't have web intent with text, copy instead
      navigator.clipboard.writeText(`${text}\n\n${url}`);
      showToast("Instagram için metin ve link kopyalandı! Instagram uygulamasında yapıştırabilirsiniz.");
    }
  };

  // Toggle auto publish simulation
  const handleToggleAutoSimulation = () => {
    onChange({
      ...config,
      socialScheduler: {
        enabled: true,
        autoPublishSimulation: !isAutoSimulation,
        posts
      }
    });
    showToast(!isAutoSimulation ? "Otomatik yayınlama simülasyonu aktif edildi." : "Otomatik simülasyon duraklatıldı.");
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tab filter
      if (activeTab !== "all" && post.status !== activeTab) {
        return false;
      }
      // Platform filter
      if (selectedPlatformFilter !== "all" && !post.platforms.includes(selectedPlatformFilter as SocialPlatform)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesProduct = post.productTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesProduct) {
          return false;
        }
      }
      return true;
    });
  }, [posts, activeTab, selectedPlatformFilter, searchQuery]);

  // Statistics
  const queuedCount = posts.filter(p => p.status === "queued").length;
  const publishedCount = posts.filter(p => p.status === "published").length;
  const draftCount = posts.filter(p => p.status === "draft").length;
  const productLinkedCount = posts.filter(p => Boolean(p.productId || p.productUrl)).length;

  const currentSelectedProduct = products.find(p => p.id === formProductId);

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO HEADER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sosyal Medya Otomasyonu & Kampanya Zamanlayıcı</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Social Media Post Scheduler</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                Ürün Linkli Otomasyon
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              İşletme duyurularınızı ve kampanya güncellemelerinizi önceden zamanlayın. Her paylaşıma doğrudan ürünlerinizin
              bağlantısını, fiyat etiketini ve görselini ekleyerek sosyal medya takipçilerinizi doğrudan müşteriye dönüştürün.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToSocialProfiles && (
              <button
                type="button"
                onClick={onNavigateToSocialProfiles}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
                title="Sosyal medya profil linklerini düzenleyin"
              >
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>Hesap Bağlantıları</span>
              </button>
            )}

            {onNavigateToCatalog && (
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
                title="Ürün kataloğunu yönetin"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Ürün Kataloğu ({products.length})</span>
              </button>
            )}

            <button
              type="button"
              id="btn-schedule-new-post"
              onClick={() => handleOpenNewPost()}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Paylaşım Zamanla</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sırada / Zamanlanan</span>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{queuedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Otomatik yayınlanacak</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yayınlananlar</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{publishedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sosyal ağlarda paylaşıldı</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
              <span>Ürün Bağlantılı</span>
            </div>
            <div className="text-2xl font-black text-sky-400 mt-1 font-mono">{productLinkedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Doğrudan ürün yönlendirmeli</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Zamanlama Motoru</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs font-bold ${isAutoSimulation ? "text-emerald-400" : "text-slate-400"}`}>
                {isAutoSimulation ? "Otomatik Aktif" : "Manuel"}
              </span>
              <button
                type="button"
                onClick={handleToggleAutoSimulation}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  isAutoSimulation 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {isAutoSimulation ? "Durdur" : "Başlat"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK PRODUCT SCHEDULE SHORTCUT BANNER */}
      {products.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">
                Popüler Ürünleriniz İçin Tek Tıkla Sosyal Medya Kampanyası Başlatın
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Kataloğunuzdaki <strong>{products[0].title}</strong> veya diğer ürünler için otomatik görsel ve direkt link içeren taslak oluşturun.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenNewPost(products[0].id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{products[0].title} İle Paylaşım Yap →</span>
            </button>
          </div>
        </div>
      )}

      {/* FILTER TOOLBAR & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("queued")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "queued" ? "bg-amber-500 text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Sırada / Zamanlandı</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">{queuedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "published" ? "bg-emerald-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Yayınlananlar</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">{publishedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "draft" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Taslaklar ({draftCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Başlık, içerik veya ürün ara..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Platform Selector Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Platform:</span>
          <button
            type="button"
            onClick={() => setSelectedPlatformFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedPlatformFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tüm Platformlar
          </button>
          {(["instagram", "facebook", "linkedin", "twitter", "whatsapp"] as SocialPlatform[]).map(plat => {
            const pConf = PLATFORM_CONFIG[plat];
            const Icon = pConf.icon;
            const isSelected = selectedPlatformFilter === plat;
            return (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected ? pConf.badgeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{pConf.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* POSTS QUEUE LIST */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Kayıtlı Paylaşım Bulunamadı</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery || selectedPlatformFilter !== "all" || activeTab !== "all"
                ? "Arama ve filtre kriterlerinize uygun paylaşım bulunamadı. Filtreleri temizleyebilirsiniz."
                : "Henüz bir sosyal medya gönderisi zamanlamadınız. Yeni bir paylaşım oluşturarak doğrudan ürün linklerinizi ekleyin."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenNewPost()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Paylaşımı Zamanla</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isQueued = post.status === "queued";
            const isPublished = post.status === "published";
            const isDraft = post.status === "draft";
            const targetProd = products.find(p => p.id === post.productId);

            return (
              <div
                key={post.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                  isQueued 
                    ? "border-amber-200/80 bg-gradient-to-r from-white via-white to-amber-50/20" 
                    : isPublished 
                    ? "border-emerald-200/80 bg-gradient-to-r from-white via-white to-emerald-50/20" 
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* LEFT DETAILS */}
                  <div className="space-y-3 flex-1">
                    {/* Header line: status, platforms, date */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      {isQueued && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1.5 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Zamanlandı (Kuyrukta)</span>
                        </span>
                      )}
                      {isPublished && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Yayınlandı</span>
                        </span>
                      )}
                      {isDraft && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                          Taslak
                        </span>
                      )}

                      {/* Scheduled timing */}
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.scheduledDate}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.scheduledTime}</span>
                      </span>

                      {/* Platform pills */}
                      <div className="flex items-center gap-1 ml-auto sm:ml-0">
                        {post.platforms.map(plat => {
                          const pConf = PLATFORM_CONFIG[plat];
                          const Icon = pConf.icon;
                          return (
                            <span
                              key={plat}
                              title={pConf.name}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center ${pConf.bgLight} border`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Post Title & Content */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{post.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* DIRECT PRODUCT LINK EMBEDDED BADGE */}
                    {(post.productId || post.productUrl) && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {(post.productImage || targetProd?.featuredImage || targetProd?.images?.[0]) ? (
                            <img
                              src={post.productImage || targetProd?.featuredImage || targetProd?.images?.[0]}
                              alt={post.productTitle || "Ürün"}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}

                          <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-indigo-500" />
                              <span>Doğrudan Ürün Yönlendirmesi</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{post.productTitle || targetProd?.title || "Özel Ürün"}</span>
                              {(post.productPrice || targetProd?.price) && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black font-mono">
                                  {post.productPrice || targetProd?.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {post.productUrl && (
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={post.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5"
                              title={post.productUrl}
                            >
                              <span>Ürün Linkini Aç</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hashtags display */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-indigo-600 font-mono">
                        {post.hashtags.map((ht, i) => (
                          <span key={i} className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {ht}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT ACTION BUTTONS */}
                  <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isQueued && (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(post)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Zamanı beklemeden şimdi yayınla"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Hemen Yayınla</span>
                      </button>
                    )}

                    {/* Instant Platform Intent Share Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {post.platforms.map(plat => {
                        const pConf = PLATFORM_CONFIG[plat];
                        const Icon = pConf.icon;
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleDirectIntentShare(post, plat)}
                            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                            title={`${pConf.name}'da paylaş`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => handleCopyPostContent(post)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                        title="Metin ve Linki Kopyala"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditPost(post)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-all cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicatePost(post)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition-all cursor-pointer"
                        title="Kopyala / Çoğalt"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPostId ? "Zamanlanmış Paylaşımı Düzenle" : "Yeni Sosyal Medya Paylaşımı Zamanla"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ürününüzü seçin, duyurunuzu hazırlayın ve otomatik yayın zamanını belirleyin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - 2 Columns on desktop (Editor & Live Preview) */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: FORM CONTROLS (7 COLS) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Post Topic / Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Paylaşım Başlığı / Kampanya Konusu *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: Hafta Sonu Oto Çekici İndirimi & Yol Yardım"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* 2. Platform Multi-Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Yayınlanacak Sosyal Medya Platformları *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(["instagram", "facebook", "linkedin", "twitter", "whatsapp"] as SocialPlatform[]).map(plat => {
                      const pConf = PLATFORM_CONFIG[plat];
                      const Icon = pConf.icon;
                      const isChecked = formPlatforms.includes(plat);

                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handleTogglePlatform(plat)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isChecked 
                              ? `${pConf.bgLight} font-bold shadow-2xs` 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isChecked ? pConf.badgeClass : "bg-slate-100 text-slate-400"}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs truncate block">{pConf.name}</span>
                          </div>
                          {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. DIRECT PRODUCT LINK INTEGRATION (HERO CARD) */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-indigo-950 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      <span>Doğrudan Ürün Bağlantısı (Direct Product Link)</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      Satış Dönüşümü
                    </span>
                  </div>

                  {products.length > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tanıtılacak Ürünü Seçin:
                        </label>
                        <select
                          value={formProductId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setFormProductId(newId);
                            const prod = products.find(p => p.id === newId);
                            if (prod) {
                              if (!formTitle) setFormTitle(`${prod.title} Kampanyası`);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="">-- Ürün Bağlantısı Olmadan Paylaş --</option>
                          {products.map(prod => (
                            <option key={prod.id} value={prod.id}>
                              {prod.title} ({prod.price}) - {prod.category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentSelectedProduct && (
                        <div className="p-3 rounded-xl bg-white border border-indigo-200/80 space-y-2.5">
                          <div className="flex items-center gap-3">
                            {(currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]) && (
                              <img
                                src={currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]}
                                alt={currentSelectedProduct.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-black text-slate-900 truncate">
                                {currentSelectedProduct.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-bold text-emerald-600 font-mono">
                                  {currentSelectedProduct.price}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {currentSelectedProduct.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Buton / Çağrı Metni (CTA)
                              </label>
                              <select
                                value={formCtaText}
                                onChange={(e) => setFormCtaText(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800"
                              >
                                {CTA_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={handleInsertProductLink}
                                className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Metne Link & CTA Ekle</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formIncludeUtm}
                                onChange={(e) => setFormIncludeUtm(e.target.checked)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                              />
                              <span>UTM Takip Parametreleri Ekle</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formAttachProductImage}
                                onChange={(e) => setFormAttachProductImage(e.target.checked)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                              />
                              <span>Ürün Görselini Kullan</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-indigo-800">
                      Kataloğunuzda henüz ürün bulunmuyor. Ürünler sekmesinden ürün ekleyebilirsiniz.
                    </div>
                  )}
                </div>

                {/* 4. Post Content / Caption */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Paylaşım Metni (İleti & Açıklama) *
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formContent.length} karakter
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Müşterilerinize iletmek istediğiniz mesaj, kampanya detayları..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />

                  {/* Character limit check for Twitter */}
                  {formPlatforms.includes("twitter") && formContent.length > 280 && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-[11px] mt-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>X (Twitter) için 280 karakter sınırı aşıldı ({formContent.length}/280).</span>
                    </div>
                  )}

                  {/* Hashtags Quick Click */}
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Önerilen Etiketler (Tıklayıp Ekleyin):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_HASHTAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddHashtag(tag)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[10px] font-mono text-slate-600 transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Date & Time Scheduling */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Otomatik Yayınlama Tarih & Saati</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Yayın Tarihi
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Yayın Saati
                      </label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setFormDate(today);
                        setFormTime("18:00");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] text-slate-600 font-bold transition-all cursor-pointer"
                    >
                      Bugün 18:00 (Akşam Zirvesi)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setFormDate(tomorrow.toISOString().split("T")[0]);
                        setFormTime("10:00");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] text-slate-600 font-bold transition-all cursor-pointer"
                    >
                      Yarın 10:00 (Sabah Akışı)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        setFormDate(nextWeek.toISOString().split("T")[0]);
                        setFormTime("12:00");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] text-slate-600 font-bold transition-all cursor-pointer"
                    >
                      Haftaya 12:00
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE REALISTIC PREVIEW (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Canlı Sosyal Medya Önizleme</span>
                  </span>

                  {/* Preview Platform Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(["instagram", "linkedin", "twitter"] as SocialPlatform[]).map(plat => {
                      const pConf = PLATFORM_CONFIG[plat];
                      const Icon = pConf.icon;
                      const isSel = previewPlatform === plat;
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setPreviewPlatform(plat)}
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSel ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                          title={pConf.name}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* REALISTIC CARD PREVIEW */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
                  {/* Instagram Style Mockup */}
                  {previewPlatform === "instagram" && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      {/* Insta Header */}
                      <div className="p-3 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[10px] text-slate-800">
                              {config.companyName ? config.companyName.substring(0, 2).toUpperCase() : "YO"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {config.companyName || "Yıldız Oto Kurtarma"}
                            </div>
                            <div className="text-[10px] text-slate-400">Zamanlandı • {formDate} {formTime}</div>
                          </div>
                        </div>
                        <Instagram className="w-4 h-4 text-pink-600" />
                      </div>

                      {/* Post Image (Product image or fallback) */}
                      {(formAttachProductImage && currentSelectedProduct?.images?.[0]) ? (
                        <div className="aspect-square bg-slate-900 relative overflow-hidden">
                          <img
                            src={currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]}
                            alt={currentSelectedProduct.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-xs font-black shadow-lg flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                            <span>{currentSelectedProduct.price}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-tr from-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center p-6 text-center">
                          <Share2 className="w-10 h-10 text-pink-400 mb-2 opacity-80" />
                          <div className="text-sm font-black">{formTitle || "Kampanya Duyurusu"}</div>
                          <div className="text-xs text-pink-300 mt-1">{config.companyName}</div>
                        </div>
                      )}

                      {/* Insta Content Body */}
                      <div className="p-3.5 space-y-2">
                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                          <strong className="mr-1.5">{config.companyName ? config.companyName.toLowerCase().replace(/\s+/g, "") : "firma"}:</strong>
                          {formContent || "Paylaşım içeriği buraya gelecek..."}
                        </div>

                        {/* Product Link preview box */}
                        {currentSelectedProduct && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Doğrudan Ürün Linki</div>
                              <div className="text-xs font-bold text-slate-800 truncate">{currentSelectedProduct.title}</div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shrink-0">
                              {formCtaText}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Style Mockup */}
                  {previewPlatform === "linkedin" && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-md bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                            {config.companyName ? config.companyName.substring(0, 2).toUpperCase() : "YO"}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{config.companyName || "Yıldız Oto Kurtarma"}</div>
                            <div className="text-[10px] text-slate-400">Kurumsal Güncelleme • Zamanlandı: {formDate}</div>
                          </div>
                        </div>
                        <Linkedin className="w-4 h-4 text-sky-700" />
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {formContent || "LinkedIn paylaşım metni..."}
                      </div>

                      {/* Attached Product Card */}
                      {currentSelectedProduct && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                          {(currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]) && (
                            <img
                              src={currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]}
                              alt={currentSelectedProduct.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-36 object-cover"
                            />
                          )}
                          <div className="p-3">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              {config.cloudflare?.customDomain || "hizliweb.me"} • Ürün Kataloğu
                            </div>
                            <div className="text-xs font-bold text-slate-900 mt-0.5">
                              {currentSelectedProduct.title} ({currentSelectedProduct.price})
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {currentSelectedProduct.shortDescription || "Doğrudan online sipariş ve detaylı bilgi için tıklayın."}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Twitter/X Style Mockup */}
                  {previewPlatform === "twitter" && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {config.companyName ? config.companyName.substring(0, 2).toUpperCase() : "YO"}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <span>{config.companyName || "Yıldız Oto Kurtarma"}</span>
                              <span className="text-[10px] text-slate-400 font-normal">@resmihesap</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Zamanlandı • {formDate} {formTime}</div>
                          </div>
                        </div>
                        <Twitter className="w-4 h-4 text-slate-900" />
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {formContent || "X paylaşım metni..."}
                      </div>

                      {currentSelectedProduct && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center gap-3 p-2">
                          {(currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]) && (
                            <img
                              src={currentSelectedProduct.featuredImage || currentSelectedProduct.images?.[0]}
                              alt={currentSelectedProduct.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">{currentSelectedProduct.title}</div>
                            <div className="text-[11px] text-emerald-600 font-mono font-bold">{currentSelectedProduct.price}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Akıllı Zamanlama Tavsiyesi</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Sosyal medya etkileşimi en yüksek olan saatler hafta içi 18:00 - 21:00 arası ve sabah 08:30 - 10:00 arasıdır.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                İptal
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSavePost("draft")}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Taslak Olarak Kaydet
                </button>

                <button
                  type="button"
                  id="btn-confirm-save-scheduled-post"
                  onClick={() => handleSavePost("queued")}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{editingPostId ? "Değişiklikleri Kaydet" : "Zamanla & Sıraya Ekle"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
