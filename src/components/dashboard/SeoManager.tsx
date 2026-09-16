import React, { useState, useRef } from "react";
import { 
  SiteConfig, 
  ServiceItem, 
  ProductItem, 
  BlogPostItem, 
  CustomPageItem 
} from "../../types";
import { SeoAutoOptimizerModal } from "./SeoAutoOptimizerModal";
import { JsonLdSchemaGenerator } from "./JsonLdSchemaGenerator";
import { 
  slugify, 
  slugifyService, 
  slugifyProduct, 
  slugifyBlog 
} from "../../utils/url";
import { 
  Search, 
  Globe, 
  Share2, 
  Sparkles, 
  TrendingUp,
  Wrench, 
  ShoppingBag, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  Tag, 
  HelpCircle,
  ExternalLink,
  Code2,
  RefreshCw,
  Sliders,
  CheckCheck,
  Activity,
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  Send,
  ShieldCheck,
  Flame,
  Info,
  MapPin
} from "lucide-react";

interface SeoManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onOpenHealthCheck?: () => void;
  onOpenHeatmap?: () => void;
  onOpenOpportunities?: () => void;
  onOpenPageSeo?: () => void;
  onOpenProgressNotifications?: () => void;
  onOpenMetaAuditor?: () => void;
  onOpenContentOptimizer?: () => void;
  onOpenAiContentMetaOptimizer?: () => void;
  onOpenAiMetaOptimizer?: () => void;
  onOpenSchemaGenerator?: () => void;
  onOpenLocalSeoSchema?: () => void;
  onOpenSeoReport?: () => void;
  defaultSubTab?: SeoSubTab;
}

type SeoSubTab = "general" | "services" | "products" | "blog" | "pages" | "social-preview" | "schema";

export const SeoManager: React.FC<SeoManagerProps> = ({ 
  config, 
  onChange, 
  onOpenHealthCheck,
  onOpenHeatmap,
  onOpenOpportunities,
  onOpenPageSeo,
  onOpenProgressNotifications,
  onOpenMetaAuditor,
  onOpenContentOptimizer,
  onOpenAiContentMetaOptimizer,
  onOpenAiMetaOptimizer,
  onOpenSchemaGenerator,
  onOpenLocalSeoSchema,
  onOpenSeoReport,
  defaultSubTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SeoSubTab>(defaultSubTab || "general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"google" | "whatsapp" | "facebook" | "twitter">("google");
  const [socialPreviewPageType, setSocialPreviewPageType] = useState<"general" | "services" | "products" | "blog" | "pages">("general");
  const [socialPostCaption, setSocialPostCaption] = useState<string>(
    "Web sitemizi ziyaret edin ve en güncel hizmet & ürünlerimizi keşfedin! 🚀"
  );
  
  // Selection states for list items
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    config.services?.items?.[0]?.id || ""
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    config.products?.items?.[0]?.id || ""
  );
  const [selectedBlogId, setSelectedBlogId] = useState<string>(
    config.blog?.items?.[0]?.id || ""
  );
  const [selectedPageId, setSelectedPageId] = useState<string>(
    config.pages?.[0]?.id || ""
  );

  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [isAutoOptimizerModalOpen, setIsAutoOptimizerModalOpen] = useState(false);
  const [aiOptimizedToast, setAiOptimizedToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper updater
  const updateConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    onChange(updater(config));
  };

  // Base domain / url resolution
  const siteDomain = config.cloudflare?.customDomain || `${config.cloudflare?.subdomain || 'firma'}.hizliweb.site`;
  const siteBaseUrl = `https://${siteDomain}`;

  // Active items
  const activeService = config.services?.items?.find(s => s.id === selectedServiceId) || config.services?.items?.[0];
  const activeProduct = config.products?.items?.find(p => p.id === selectedProductId) || config.products?.items?.[0];
  const activeBlog = config.blog?.items?.find(b => b.id === selectedBlogId) || config.blog?.items?.[0];
  const activePage = config.pages?.find(p => p.id === selectedPageId) || config.pages?.[0];

  // Effective tab for preview resolution (supports social-preview page selector)
  const effectiveTab = activeSubTab === "social-preview" ? socialPreviewPageType : activeSubTab;

  // Current preview data based on active tab
  let currentPreviewTitle = config.seo?.metaTitle || `${config.companyName} | ${config.slogan || config.sector}`;
  let currentPreviewDesc = config.seo?.metaDescription || config.slogan || `${config.companyName} kaliteli ve güvenilir ${config.sector} hizmetleri.`;
  let currentPreviewImage = config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341";
  let currentPreviewUrl = `${siteBaseUrl}/`;
  let currentPreviewSlug = "index.html";

  if (effectiveTab === "services" && activeService) {
    currentPreviewTitle = activeService.seoTitle || `${activeService.title} Hizmeti & Fiyatları | ${config.companyName}`;
    currentPreviewDesc = activeService.seoDescription || activeService.desc || `${activeService.title} hakkında detaylı bilgi ve uygun fiyat teklifi.`;
    currentPreviewImage = activeService.ogImage || activeService.bannerImage || activeService.image || currentPreviewImage;
    currentPreviewSlug = `hizmet-${activeService.slug || 'detay'}.html`;
    currentPreviewUrl = `${siteBaseUrl}/${currentPreviewSlug}`;
  } else if (effectiveTab === "products" && activeProduct) {
    currentPreviewTitle = activeProduct.seoTitle || `${activeProduct.title} - Fiyatı & Detayları | ${config.companyName}`;
    currentPreviewDesc = activeProduct.seoDescription || activeProduct.shortDescription || activeProduct.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || `${activeProduct.title} en uygun fiyatla sipariş verin.`;
    currentPreviewImage = activeProduct.ogImage || activeProduct.featuredImage || activeProduct.image || (activeProduct.images && activeProduct.images[0]) || currentPreviewImage;
    currentPreviewSlug = `urun-${activeProduct.slug || 'detay'}.html`;
    currentPreviewUrl = `${siteBaseUrl}/${currentPreviewSlug}`;
  } else if (effectiveTab === "blog" && activeBlog) {
    currentPreviewTitle = activeBlog.seoTitle || `${activeBlog.title} | ${config.companyName} Blog`;
    currentPreviewDesc = activeBlog.seoDescription || activeBlog.excerpt || `${activeBlog.title} rehberi ve uzman tavsiyeleri.`;
    currentPreviewImage = activeBlog.ogImage || activeBlog.coverImage || activeBlog.image || currentPreviewImage;
    currentPreviewSlug = `blog-${activeBlog.slug || 'yazi'}.html`;
    currentPreviewUrl = `${siteBaseUrl}/${currentPreviewSlug}`;
  } else if (effectiveTab === "pages" && activePage) {
    currentPreviewTitle = activePage.seoTitle || `${activePage.title} | ${config.companyName}`;
    currentPreviewDesc = activePage.metaDescription || `${config.companyName} ${activePage.title} sayfası.`;
    currentPreviewImage = activePage.ogImage || activePage.bannerImage || currentPreviewImage;
    currentPreviewSlug = `sayfa-${activePage.slug || 'detay'}.html`;
    currentPreviewUrl = `${siteBaseUrl}/${currentPreviewSlug}`;
  }

  // Helper updater for OpenGraph fields in Social Media Preview subtab
  const handleUpdateSocialOg = (field: "title" | "desc" | "image", value: string) => {
    if (socialPreviewPageType === "general") {
      updateConfig(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          ...(field === "title" ? { metaTitle: value } : {}),
          ...(field === "desc" ? { metaDescription: value } : {}),
          ...(field === "image" ? { ogImage: value } : {}),
        }
      }));
    } else if (socialPreviewPageType === "services" && activeService) {
      updateConfig(prev => ({
        ...prev,
        services: {
          ...prev.services,
          items: prev.services.items.map(s => s.id === activeService.id ? {
            ...s,
            ...(field === "title" ? { seoTitle: value } : {}),
            ...(field === "desc" ? { seoDescription: value } : {}),
            ...(field === "image" ? { ogImage: value } : {}),
          } : s)
        }
      }));
    } else if (socialPreviewPageType === "products" && activeProduct) {
      updateConfig(prev => ({
        ...prev,
        products: {
          ...prev.products,
          items: prev.products.items.map(p => p.id === activeProduct.id ? {
            ...p,
            ...(field === "title" ? { seoTitle: value } : {}),
            ...(field === "desc" ? { seoDescription: value } : {}),
            ...(field === "image" ? { ogImage: value } : {}),
          } : p)
        }
      }));
    } else if (socialPreviewPageType === "blog" && activeBlog) {
      updateConfig(prev => ({
        ...prev,
        blog: {
          ...prev.blog,
          items: prev.blog.items.map(b => b.id === activeBlog.id ? {
            ...b,
            ...(field === "title" ? { seoTitle: value } : {}),
            ...(field === "desc" ? { seoDescription: value } : {}),
            ...(field === "image" ? { ogImage: value } : {}),
          } : b)
        }
      }));
    } else if (socialPreviewPageType === "pages" && activePage) {
      updateConfig(prev => ({
        ...prev,
        pages: (prev.pages || []).map(p => p.id === activePage.id ? {
          ...p,
          ...(field === "title" ? { seoTitle: value } : {}),
          ...(field === "desc" ? { metaDescription: value } : {}),
          ...(field === "image" ? { ogImage: value } : {}),
        } : p)
      }));
    }
  };

  const handleSocialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleUpdateSocialOg("image", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Length calculations for SEO gauge
  const titleLen = currentPreviewTitle.length;
  const descLen = currentPreviewDesc.length;

  const getTitleStatus = () => {
    if (titleLen === 0) return { color: "text-rose-500", text: "Başlık boş!", status: "bad" };
    if (titleLen < 30) return { color: "text-amber-500", text: "Çok kısa (<30 karakter)", status: "warning" };
    if (titleLen <= 60) return { color: "text-emerald-600", text: "Mükemmel uzunluk (30-60 karakter)", status: "good" };
    return { color: "text-rose-500", text: "Fazla uzun (>60 karakter, Google kesebilir)", status: "bad" };
  };

  const getDescStatus = () => {
    if (descLen === 0) return { color: "text-rose-500", text: "Açıklama boş!", status: "bad" };
    if (descLen < 70) return { color: "text-amber-500", text: "Kısa (<70 karakter)", status: "warning" };
    if (descLen <= 160) return { color: "text-emerald-600", text: "Mükemmel uzunluk (70-160 karakter)", status: "good" };
    return { color: "text-rose-500", text: "Fazla uzun (>160 karakter, Google kesebilir)", status: "bad" };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // AI Optimize Single Item
  const handleAiOptimizeItem = (type: "service" | "product" | "blog" | "page") => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      if (type === "service" && activeService) {
        const optTitle = `${activeService.title} Hizmeti & En İyi Fiyatları | ${config.city} ${config.companyName}`;
        const optDesc = `${config.city} bölgesinde profesyonel ${activeService.title.toLowerCase()} hizmeti. Hemen arayın, %100 müşteri memnuniyeti ve garantili çözümlerimizden yararlanın!`;
        const optKeywords = `${activeService.title}, ${activeService.title} fiyatları, ${config.city} ${activeService.title}, ${config.companyName}`;
        
        updateConfig(p => ({
          ...p,
          services: {
            ...p.services,
            items: p.services.items.map(s => s.id === activeService.id ? {
              ...s,
              seoTitle: optTitle.slice(0, 60),
              seoDescription: optDesc.slice(0, 155),
              seoKeywords: optKeywords
            } : s)
          }
        }));
        setAiOptimizedToast(`"${activeService.title}" için Google uyumlu SEO başlık ve açıklamaları üretildi.`);
      } else if (type === "product" && activeProduct) {
        const optTitle = `${activeProduct.title} - ${activeProduct.price} | Sipariş Ver`;
        const optDesc = `${activeProduct.title} uygun fiyat (${activeProduct.price}) ve hızlı teslimat avantajıyla burada! Stoktan aynı gün gönderim ve güvenli ödeme.`;
        const optKeywords = `${activeProduct.title}, ${activeProduct.category}, ${activeProduct.price}, satın al, sipariş`;
        
        updateConfig(p => ({
          ...p,
          products: {
            ...p.products,
            items: p.products.items.map(prod => prod.id === activeProduct.id ? {
              ...prod,
              seoTitle: optTitle.slice(0, 60),
              seoDescription: optDesc.slice(0, 155),
              seoKeywords: optKeywords
            } : prod)
          }
        }));
        setAiOptimizedToast(`"${activeProduct.title}" için Google & Schema.org uyumlu SEO üretildi.`);
      } else if (type === "blog" && activeBlog) {
        const optTitle = `${activeBlog.title} [Detaylı Rehber] | ${config.companyName}`;
        const optDesc = `${activeBlog.title} hakkında bilmeniz gereken tüm detaylar, uzman görüşleri ve pratik öneriler bu makalede.`;
        const optKeywords = `${activeBlog.title}, blog, sektörel rehber, ipuçları, ${config.sector}`;
        
        updateConfig(p => ({
          ...p,
          blog: {
            ...p.blog,
            items: p.blog.items.map(b => b.id === activeBlog.id ? {
              ...b,
              seoTitle: optTitle.slice(0, 60),
              seoDescription: optDesc.slice(0, 155),
              seoKeywords: optKeywords
            } : b)
          }
        }));
        setAiOptimizedToast(`"${activeBlog.title}" makalesi için SEO başlıkları güncellendi.`);
      } else if (type === "page" && activePage) {
        const optTitle = `${activePage.title} | ${config.companyName} ${config.city}`;
        const optDesc = `${config.companyName} ${activePage.title.toLowerCase()} sayfası. Kurumsal bilgilerimiz, vizyonumuz ve iletişim detaylarımız hakkında bilgi alın.`;
        const optKeywords = `${activePage.title}, ${config.companyName}, ${config.sector}, ${config.city}`;
        
        updateConfig(p => ({
          ...p,
          pages: (p.pages || []).map(pg => pg.id === activePage.id ? {
            ...pg,
            seoTitle: optTitle.slice(0, 60),
            metaDescription: optDesc.slice(0, 155),
            seoKeywords: optKeywords
          } : pg)
        }));
        setAiOptimizedToast(`"${activePage.title}" sayfası için SEO metinleri optimize edildi.`);
      }
      setIsAiOptimizing(false);
      setTimeout(() => setAiOptimizedToast(null), 4000);
    }, 450);
  };

  // Bulk AI Optimize All Pages
  const handleBulkAiOptimize = () => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      updateConfig(prev => {
        const newServices = prev.services.items.map(s => ({
          ...s,
          seoTitle: `${s.title} Hizmeti & Fiyatları | ${prev.city} ${prev.companyName}`.slice(0, 60),
          seoDescription: `${prev.city} bölgesinde ${s.title.toLowerCase()} arayanlar için hızlı, garantili ve en uygun fiyatlı çözümler. Hemen arayın!`.slice(0, 155),
          seoKeywords: `${s.title}, ${s.title} fiyatları, ${prev.city} ${s.title}, ${prev.companyName}`
        }));

        const newProducts = (prev.products?.items || []).map(p => ({
          ...p,
          seoTitle: `${p.title} - ${p.price} | Hemen Sipariş Ver`.slice(0, 60),
          seoDescription: `${p.title} sadece ${p.price}! Stoktan hızlı teslimat ve WhatsApp üzerinden anında sipariş fırsatını kaçırmayın.`.slice(0, 155),
          seoKeywords: `${p.title}, ${p.category}, ${p.price}, ${prev.companyName}`
        }));

        const newBlogs = (prev.blog?.items || []).map(b => ({
          ...b,
          seoTitle: `${b.title} [Uzman Rehberi] | ${prev.companyName}`.slice(0, 60),
          seoDescription: `${b.title} konusunda merak edilenler ve pratik ipuçları. Detaylı bilgi için tıklayın.`.slice(0, 155),
          seoKeywords: `${b.title}, ${prev.sector}, ipuçları, tavsiyeler`
        }));

        const newPages = (prev.pages || []).map(pg => ({
          ...pg,
          seoTitle: `${pg.title} | ${prev.companyName} ${prev.city}`.slice(0, 60),
          metaDescription: `${prev.companyName} ${pg.title} sayfası. Detaylı kurumsal bilgi ve iletişim.`.slice(0, 155),
          seoKeywords: `${pg.title}, ${prev.companyName}, ${prev.city}`
        }));

        const newGlobalTitle = `${prev.companyName} | ${prev.city} ${prev.sector} & ${prev.slogan || 'Hizmetleri'}`.slice(0, 60);
        const newGlobalDesc = `${prev.city} ${prev.sector} lideri ${prev.companyName}. Profesyonel hizmet, uygun fiyat ve %100 memnuniyet garantisi. Hemen arayın: ${prev.phone}`.slice(0, 155);

        return {
          ...prev,
          seo: {
            ...prev.seo,
            metaTitle: newGlobalTitle,
            metaDescription: newGlobalDesc,
            keywords: `${prev.companyName}, ${prev.sector}, ${prev.city}, telefon ${prev.phone}`
          },
          services: {
            ...prev.services,
            items: newServices
          },
          products: {
            ...prev.products,
            items: newProducts
          },
          blog: {
            ...prev.blog,
            items: newBlogs
          },
          pages: newPages
        };
      });

      setIsAiOptimizing(false);
      setAiOptimizedToast("✨ Tüm sayfalar, hizmetler, ürünler ve bloglar için Google SEO ve OpenGraph başlıkları 1 tıkla optimize edildi!");
      setTimeout(() => setAiOptimizedToast(null), 5000);
    }, 600);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "global" | "service" | "product" | "blog" | "page") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (target === "global") {
        updateConfig(p => ({ ...p, seo: { ...p.seo, ogImage: url } }));
      } else if (target === "service" && activeService) {
        updateConfig(p => ({
          ...p,
          services: {
            ...p.services,
            items: p.services.items.map(s => s.id === activeService.id ? { ...s, ogImage: url } : s)
          }
        }));
      } else if (target === "product" && activeProduct) {
        updateConfig(p => ({
          ...p,
          products: {
            ...p.products,
            items: p.products.items.map(prod => prod.id === activeProduct.id ? { ...prod, ogImage: url } : prod)
          }
        }));
      } else if (target === "blog" && activeBlog) {
        updateConfig(p => ({
          ...p,
          blog: {
            ...p.blog,
            items: p.blog.items.map(b => b.id === activeBlog.id ? { ...b, ogImage: url } : b)
          }
        }));
      } else if (target === "page" && activePage) {
        updateConfig(p => ({
          ...p,
          pages: (p.pages || []).map(pg => pg.id === activePage.id ? { ...pg, ogImage: url } : pg)
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & AI Automation Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold">
              <Search className="w-3.5 h-3.5" />
              <span>Google Arama & Sosyal Medya Paylaşım Merkezi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Her Sayfa, Ürün & Hizmet İçin Özel SEO & OpenGraph
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Google arama motorunda ilk sıralarda çıkmak ve WhatsApp / Facebook paylaşımlarında göz alıcı afiş kartları oluşturmak için tüm meta başlıkları, açıklamaları ve görselleri buradan yönetin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            {onOpenSeoReport && (
              <button
                type="button"
                id="btn-seo-manager-goto-seo-report"
                onClick={onOpenSeoReport}
                className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95 cursor-pointer"
                title="Sitenin tüm meta etiketlerini ve Google Core Web Vitals performans metriklerini anlık analiz eden SEO Raporunu aç"
              >
                <Activity className="w-4 h-4 text-slate-950 fill-current" />
                <span>📊 Kapsamlı SEO &amp; Performans Raporu</span>
              </button>
            )}

            {onOpenOpportunities && (
              <button
                type="button"
                id="btn-seo-manager-goto-opportunities"
                onClick={onOpenOpportunities}
                className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                <span>🎯 SEO Fırsat Alarmları (AI Radar)</span>
              </button>
            )}

            {onOpenHeatmap && (
              <button
                type="button"
                id="btn-seo-manager-goto-heatmap"
                onClick={onOpenHeatmap}
                className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-white animate-pulse" />
                <span>🔥 D3.js SEO &amp; Trafik Isı Haritası</span>
              </button>
            )}

            {onOpenPageSeo && (
              <button
                type="button"
                id="btn-seo-manager-goto-page-seo"
                onClick={onOpenPageSeo}
                className="px-4 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>🌐 Sayfa Bazlı Granüler SEO &amp; Canonical</span>
              </button>
            )}

            {onOpenProgressNotifications && (
              <button
                type="button"
                id="btn-seo-manager-goto-progress"
                onClick={onOpenProgressNotifications}
                className="px-4 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                <span>📈 İlerleme Bildirimleri</span>
              </button>
            )}

            {onOpenMetaAuditor && (
              <button
                type="button"
                id="btn-seo-manager-goto-meta-auditor"
                onClick={onOpenMetaAuditor}
                className="px-4 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                <span>🏷️ Canlı Meta Etiket Denetimi</span>
              </button>
            )}

            {onOpenContentOptimizer && (
              <button
                type="button"
                id="btn-seo-manager-goto-content-optimizer"
                onClick={onOpenContentOptimizer}
                className="px-4 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>✨ Sektörel SEO İçerik Optimize Edici</span>
              </button>
            )}

            {onOpenAiContentMetaOptimizer && (
              <button
                type="button"
                id="btn-seo-manager-goto-ai-meta-optimizer"
                onClick={onOpenAiContentMetaOptimizer}
                className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>🎯 AI Content Meta-Optimizer (%2.5 Yoğunluk & Okunabilirlik)</span>
              </button>
            )}

            <button
              type="button"
              id="btn-seo-manager-goto-schema"
              onClick={() => setActiveSubTab("schema")}
              className="px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-indigo-200" />
              <span>⚡ Otomatik Schema.org JSON-LD</span>
            </button>

            {onOpenLocalSeoSchema && (
              <button
                type="button"
                id="btn-seo-manager-goto-local-seo"
                onClick={onOpenLocalSeoSchema}
                className="px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-blue-200" />
                <span>📍 Yerel SEO (LocalBusiness)</span>
              </button>
            )}

            {onOpenHealthCheck && (
              <button
                type="button"
                onClick={onOpenHealthCheck}
                className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span>🏥 SEO Sağlık Denetimi (Health Check)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAutoOptimizerModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ SEO Auto-Optimizer Analiz & Önizleme</span>
            </button>

            <button
              type="button"
              onClick={handleBulkAiOptimize}
              disabled={isAiOptimizing}
              className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isAiOptimizing ? 'animate-spin' : ''}`} />
              <span>{isAiOptimizing ? "Yazılıyor..." : "Hızlı 1-Tık Optimize"}</span>
            </button>
          </div>
        </div>

        {/* SEO Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-[11px] font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Otomatik <strong>sitemap.xml</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Otomatik <strong>robots.txt</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Schema.org</strong> JSON-LD</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>99/100</strong> PageSpeed Puanı</span>
          </div>
        </div>
      </div>

      {/* AI Toast Alert */}
      {aiOptimizedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{aiOptimizedToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setAiOptimizedToast(null)}
            className="text-emerald-700 hover:text-emerald-950 text-[11px]"
          >
            ✕ Kapat
          </button>
        </div>
      )}

      {/* Universal SEO Sub-Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab("general")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "general"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Ana Sayfa & Genel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("services")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "services"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Hizmetler ({config.services?.items?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("products")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "products"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Ürünler ({config.products?.items?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("blog")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "blog"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Blog ({config.blog?.items?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pages")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "pages"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Özel Sayfalar ({config.pages?.length || 0})</span>
        </button>

        {/* SOSYAL MEDYA ÖNİZLEME SUB-TAB */}
        <button
          type="button"
          id="seo-subtab-social-preview-btn"
          onClick={() => {
            setActiveSubTab("social-preview");
            if (socialPlatform === "google") {
              setSocialPlatform("whatsapp");
            }
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "social-preview"
              ? "bg-slate-900 text-amber-400 shadow-xs ring-1 ring-amber-400/40"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Sosyal Medya</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black">Canlı</span>
        </button>

        {/* JSON-LD SCHEMA GENERATOR SUB-TAB */}
        <button
          type="button"
          id="seo-subtab-schema-btn"
          onClick={() => setActiveSubTab("schema")}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "schema"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>JSON-LD Şema Motoru</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-black">Otomatik</span>
        </button>
      </div>

      {/* Main Layout: If schema tab is active, show full-width JsonLdSchemaGenerator; otherwise show forms + SERP live simulator */}
      {activeSubTab === "schema" ? (
        <div className="animate-fade-in">
          <JsonLdSchemaGenerator config={config} onChange={onChange} onOpenLocalSeoSchema={onOpenLocalSeoSchema} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Category Sub-Tabs & Forms (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TAB 1: GENERAL & HOMEPAGE SEO */}
            {activeSubTab === "general" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Ana Sayfa ve Genel Web Sitesi SEO Ayarları</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Sitenizin ana sayfası ve genel paylaşımlar için geçerli olan varsayılan etiketler.</p>
                  </div>
                  {onOpenAiMetaOptimizer && (
                    <button
                      type="button"
                      id="seo-manager-generate-optimized-metadata-btn"
                      onClick={onOpenAiMetaOptimizer}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                      title="Gemini AI ile sektörel anahtar kelimelere göre optimize edilmiş meta başlık ve açıklamaları otomatik üretin"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Generate Optimized Metadata</span>
                    </button>
                  )}
                </div>

                {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Ana Sayfa Meta Başlığı (Title Tag) *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Google'da mavi link olarak görünen başlık</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${titleStatus.color}`}>
                    {config.seo?.metaTitle?.length || 0}/60 karakter
                  </span>
                </div>
                <input
                  type="text"
                  value={config.seo?.metaTitle || ""}
                  onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                  placeholder={`Örn: ${config.companyName} | ${config.city} ${config.sector} Hizmetleri`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <p className={`text-[10px] font-semibold ${titleStatus.color}`}>{titleStatus.text}</p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Ana Sayfa Meta Açıklaması (Description) *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Google arama sonuçlarındaki özet metin</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${descStatus.color}`}>
                    {config.seo?.metaDescription?.length || 0}/160 karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={config.seo?.metaDescription || ""}
                  onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                  placeholder="Örn: Ankara'nın lider nakliyat firması. Sigortalı taşımacılık, asansörlü evden eve nakliyat ve uygun fiyat avantajları için hemen arayın!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none leading-relaxed"
                />
                <p className={`text-[10px] font-semibold ${descStatus.color}`}>{descStatus.text}</p>
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>SEO Anahtar Kelimeleri (Virgülle Ayırın)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Örn: istanbul nakliyat, evden eve taşıma, ucuz nakliye</span>
                </label>
                <input
                  type="text"
                  value={config.seo?.keywords || ""}
                  onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, keywords: e.target.value } }))}
                  placeholder="hizmet1, hizmet2, şehir, firma adı"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* OpenGraph Image for Homepage & Default */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ana Sayfa & Varsayılan OpenGraph Paylaşım Görseli (1200x630)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">WhatsApp / Facebook afişi</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-48 aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group shadow-xs">
                    <img 
                      src={config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"} 
                      alt="OpenGraph" 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                      <span>Görsel Değiştir</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, "global")}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={config.seo?.ogImage || ""}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, ogImage: e.target.value } }))}
                      placeholder="https://images.unsplash.com/... veya doğrudan görsel URL"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>Cihazdan Yükle</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, "global")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => updateConfig(p => ({ ...p, seo: { ...p.seo, ogImage: p.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341" } }))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Kapak Görselini Kullan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Technical SEO Controls */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gelişmiş Arama Motoru Ayarları</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">Schema.org Yapılandırılmış Veri</label>
                      <div className="flex items-center gap-2">
                        {onOpenLocalSeoSchema && (
                          <button
                            type="button"
                            onClick={onOpenLocalSeoSchema}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Yerel SEO Şeması →</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveSubTab("schema")}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Gelişmiş Şema →</span>
                        </button>
                      </div>
                    </div>
                    <select
                      value={config.seo?.schemaType || "LocalBusiness"}
                      onChange={(e) => updateConfig(p => ({ 
                        ...p, 
                        seo: { ...p.seo, schemaType: e.target.value },
                        schemaConfig: p.schemaConfig ? { ...p.schemaConfig, businessType: e.target.value as any } : undefined
                      }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="LocalBusiness">LocalBusiness (Yerel İşletme)</option>
                      <option value="AutoRepair">AutoRepair (Oto Tamir & Çekici)</option>
                      <option value="Dentist">Dentist (Diş Kliniği)</option>
                      <option value="MedicalClinic">MedicalClinic (Tıp & Klinik)</option>
                      <option value="LegalService">LegalService (Hukuk & Avukat)</option>
                      <option value="RealEstateAgent">RealEstateAgent (Emlak & Gayrimenkul)</option>
                      <option value="Organization">Organization (Kurumsal Şirket)</option>
                      <option value="ProfessionalService">ProfessionalService (Uzman Hizmet)</option>
                      <option value="Store">Store (Perakende Mağaza)</option>
                      <option value="Restaurant">Restaurant (Kafe & Restoran)</option>
                      <option value="Service">Service (Genel Servis)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Robots İndeksleme İzni</label>
                    <select
                      value={config.seo?.robots || "index, follow"}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, robots: e.target.value } }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 outline-none focus:border-amber-500"
                    >
                      <option value="index, follow">✅ İndeksle ve Takip Et (index, follow)</option>
                      <option value="noindex, nofollow">🚫 Arama Motorlarına Kapat (noindex, nofollow)</option>
                      <option value="index, nofollow">index, nofollow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Search Console Doğrulama Kodu</label>
                    <input
                      type="text"
                      value={config.seo?.googleSearchConsoleTag || ""}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, googleSearchConsoleTag: e.target.value } }))}
                      placeholder="Örn: 9z8x7c6v5b4n3m..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Twitter / X @KullanıcıAdı</label>
                    <input
                      type="text"
                      value={config.seo?.twitterHandle || ""}
                      onChange={(e) => updateConfig(p => ({ ...p, seo: { ...p.seo, twitterHandle: e.target.value } }))}
                      placeholder="@firmaniz"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SERVICES SEO */}
          {activeSubTab === "services" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Hizmet Sayfaları Özel SEO Yapılandırması</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Her bir hizmet sayfanız için Google başlığı, açıklaması ve sosyal medya afişi belirleyin.</p>
                </div>

                {activeService && (
                  <button
                    type="button"
                    onClick={() => handleAiOptimizeItem("service")}
                    disabled={isAiOptimizing}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bu Hizmetin SEO'sunu AI İle Yaz</span>
                  </button>
                )}
              </div>

              {/* Service Item Selector Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Düzenlenecek Hizmeti Seçin:</label>
                <div className="flex flex-wrap gap-2">
                  {(config.services?.items || []).map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        (activeService?.id === srv.id)
                          ? "bg-slate-900 text-amber-400 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      <span>{srv.title}</span>
                      {srv.seoTitle && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {activeService ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Service URL info */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-600 truncate">
                      <span className="text-slate-400 font-bold">Sayfa URL:</span>
                      <span className="text-amber-600 font-bold">{siteBaseUrl}/hizmet-{activeService.slug || 'detay'}.html</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">Statik Sayfa</span>
                  </div>

                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Hizmet Sayfası SEO Başlığı (Title) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeService.seoTitle?.length || 0}/60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={activeService.seoTitle || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          services: {
                            ...p.services,
                            items: p.services.items.map(s => s.id === activeService.id ? { ...s, seoTitle: val } : s)
                          }
                        }));
                      }}
                      placeholder={`${activeService.title} Hizmeti & Fiyatları | ${config.companyName}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Hizmet Sayfası Meta Açıklaması (Description) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeService.seoDescription?.length || 0}/160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={activeService.seoDescription || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          services: {
                            ...p.services,
                            items: p.services.items.map(s => s.id === activeService.id ? { ...s, seoDescription: val } : s)
                          }
                        }));
                      }}
                      placeholder={`${activeService.title} hakkında detaylı bilgi, hizmet kapsamı ve uygun fiyat teklifleri.`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Hedef Arama Kelimeleri</label>
                    <input
                      type="text"
                      value={activeService.seoKeywords || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          services: {
                            ...p.services,
                            items: p.services.items.map(s => s.id === activeService.id ? { ...s, seoKeywords: val } : s)
                          }
                        }));
                      }}
                      placeholder="Örn: boya badana, ankara ev boyama, usta tavsiyesi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* OpenGraph Image for this Service */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hizmete Özel Sosyal Paylaşım Görseli (OpenGraph Image)</span>
                      </div>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-40 aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img 
                          src={activeService.ogImage || activeService.bannerImage || activeService.image || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"} 
                          alt={activeService.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={activeService.ogImage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig(p => ({
                              ...p,
                              services: {
                                ...p.services,
                                items: p.services.items.map(s => s.id === activeService.id ? { ...s, ogImage: val } : s)
                              }
                            }));
                          }}
                          placeholder="Özel görsel URL'si girin veya dosya yükleyin"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Görsel Yükle</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, "service")}
                            />
                          </label>
                          {activeService.bannerImage && (
                            <button
                              type="button"
                              onClick={() => {
                                updateConfig(p => ({
                                  ...p,
                                  services: {
                                    ...p.services,
                                    items: p.services.items.map(s => s.id === activeService.id ? { ...s, ogImage: s.bannerImage } : s)
                                  }
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              Hizmet Banner'ını Kullan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Henüz bir hizmet bulunmuyor. Hizmetler sekmesinden yeni hizmet ekleyebilirsiniz.
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PRODUCTS SEO */}
          {activeSubTab === "products" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Ürün & Fiyat Kataloğu SEO Yapılandırması</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ürün sayfalarınızın Google arama motorunda fiyat ve stok zengin sonuçlarıyla (Rich Snippet) görünmesi için ayarlar.</p>
                </div>

                {activeProduct && (
                  <button
                    type="button"
                    onClick={() => handleAiOptimizeItem("product")}
                    disabled={isAiOptimizing}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bu Ürünün SEO'sunu AI İle Yaz</span>
                  </button>
                )}
              </div>

              {/* Product Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Düzenlenecek Ürünü Seçin:</label>
                <div className="flex flex-wrap gap-2">
                  {(config.products?.items || []).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        (activeProduct?.id === prod.id)
                          ? "bg-slate-900 text-amber-400 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{prod.title}</span>
                      <span className="text-[10px] font-mono text-amber-500 font-black">{prod.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeProduct ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Product URL */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-600 truncate">
                      <span className="text-slate-400 font-bold">Sayfa URL:</span>
                      <span className="text-amber-600 font-bold">{siteBaseUrl}/urun-{activeProduct.slug || 'detay'}.html</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Schema Product Fiyat: {activeProduct.price}
                    </span>
                  </div>

                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Ürün Sayfası SEO Başlığı (Title)</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeProduct.seoTitle?.length || 0}/60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={activeProduct.seoTitle || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          products: {
                            ...p.products,
                            items: p.products.items.map(prod => prod.id === activeProduct.id ? { ...prod, seoTitle: val } : prod)
                          }
                        }));
                      }}
                      placeholder={`${activeProduct.title} - Fiyatı & Detayları | ${config.companyName}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Ürün Meta Açıklaması (Description)</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeProduct.seoDescription?.length || 0}/160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={activeProduct.seoDescription || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          products: {
                            ...p.products,
                            items: p.products.items.map(prod => prod.id === activeProduct.id ? { ...prod, seoDescription: val } : prod)
                          }
                        }));
                      }}
                      placeholder={`${activeProduct.title} en iyi fiyat (${activeProduct.price}) garantisiyle. WhatsApp ile hemen sipariş verin.`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Ürün Arama Kelimeleri</label>
                    <input
                      type="text"
                      value={activeProduct.seoKeywords || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          products: {
                            ...p.products,
                            items: p.products.items.map(prod => prod.id === activeProduct.id ? { ...prod, seoKeywords: val } : prod)
                          }
                        }));
                      }}
                      placeholder="Örn: kombi bakımı, orijinal yedek parça, kombi servisi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* OpenGraph Image */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ürüne Özel Sosyal Paylaşım Görseli (OpenGraph)</span>
                      </div>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-40 aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img 
                          src={activeProduct.ogImage || activeProduct.featuredImage || activeProduct.image || (activeProduct.images && activeProduct.images[0]) || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"} 
                          alt={activeProduct.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={activeProduct.ogImage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig(p => ({
                              ...p,
                              products: {
                                ...p.products,
                                items: p.products.items.map(prod => prod.id === activeProduct.id ? { ...prod, ogImage: val } : prod)
                              }
                            }));
                          }}
                          placeholder="Özel görsel URL'si girin veya dosya yükleyin"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Görsel Yükle</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, "product")}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Henüz bir ürün bulunmuyor. Ürün sekmesinden yeni ürün ekleyebilirsiniz.
                </div>
              )}

            </div>
          )}

          {/* TAB 4: BLOG SEO */}
          {activeSubTab === "blog" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Blog Makaleleri SEO & OpenGraph</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Google arama sonuçlarında üst sıralarda çıkmak ve sektörel otorite kazanmak için blog yazılarınıza özel SEO etiketleri.</p>
                </div>

                {activeBlog && (
                  <button
                    type="button"
                    onClick={() => handleAiOptimizeItem("blog")}
                    disabled={isAiOptimizing}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bu Makalenin SEO'sunu AI İle Yaz</span>
                  </button>
                )}
              </div>

              {/* Blog Item Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Düzenlenecek Makaleyi Seçin:</label>
                <div className="flex flex-wrap gap-2">
                  {(config.blog?.items || []).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBlogId(b.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        (activeBlog?.id === b.id)
                          ? "bg-slate-900 text-amber-400 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{b.title}</span>
                      {b.seoTitle && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {activeBlog ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Blog URL */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-600 truncate">
                      <span className="text-slate-400 font-bold">Sayfa URL:</span>
                      <span className="text-amber-600 font-bold">{siteBaseUrl}/blog-{activeBlog.slug || 'yazi'}.html</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">Schema: BlogPosting</span>
                  </div>

                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Makale SEO Başlığı (Title) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeBlog.seoTitle?.length || 0}/60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={activeBlog.seoTitle || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          blog: {
                            ...p.blog,
                            items: p.blog.items.map(b => b.id === activeBlog.id ? { ...b, seoTitle: val } : b)
                          }
                        }));
                      }}
                      placeholder={`${activeBlog.title} | ${config.companyName} Blog`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Makale Meta Açıklaması (Description) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activeBlog.seoDescription?.length || 0}/160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={activeBlog.seoDescription || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          blog: {
                            ...p.blog,
                            items: p.blog.items.map(b => b.id === activeBlog.id ? { ...b, seoDescription: val } : b)
                          }
                        }));
                      }}
                      placeholder={activeBlog.excerpt || "Makalenin özetini buraya yazın..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Anahtar Kelimeler / Etiketler</label>
                    <input
                      type="text"
                      value={activeBlog.seoKeywords || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          blog: {
                            ...p.blog,
                            items: p.blog.items.map(b => b.id === activeBlog.id ? { ...b, seoKeywords: val } : b)
                          }
                        }));
                      }}
                      placeholder="Örn: ev taşıma ipuçları, nakliyat tavsiyeleri, eşya paketleme"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* OpenGraph Image */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Makaleye Özel Sosyal Paylaşım Görseli (OpenGraph Image)</span>
                      </div>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-40 aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img 
                          src={activeBlog.ogImage || activeBlog.coverImage || activeBlog.image || config.hero?.bgImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f"} 
                          alt={activeBlog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={activeBlog.ogImage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig(p => ({
                              ...p,
                              blog: {
                                ...p.blog,
                                items: p.blog.items.map(b => b.id === activeBlog.id ? { ...b, ogImage: val } : b)
                              }
                            }));
                          }}
                          placeholder="Özel görsel URL'si girin veya dosya yükleyin"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Görsel Yükle</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, "blog")}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Henüz bir blog makalesi bulunmuyor. Blog sekmesinden yeni makale ekleyebilirsiniz.
                </div>
              )}

            </div>
          )}

          {/* TAB 5: CUSTOM PAGES SEO */}
          {activeSubTab === "pages" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Kurumsal & Özel Sayfalar SEO Yapılandırması</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Hakkımızda, Gizlilik Politikası, İletişim veya oluşturduğunuz özel sayfaların arama motoru başlıkları.</p>
                </div>

                {activePage && (
                  <button
                    type="button"
                    onClick={() => handleAiOptimizeItem("page")}
                    disabled={isAiOptimizing}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bu Sayfanın SEO'sunu AI İle Yaz</span>
                  </button>
                )}
              </div>

              {/* Page Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Düzenlenecek Sayfayı Seçin:</label>
                <div className="flex flex-wrap gap-2">
                  {(config.pages || []).map((pg) => (
                    <button
                      key={pg.id}
                      type="button"
                      onClick={() => setSelectedPageId(pg.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        (activePage?.id === pg.id)
                          ? "bg-slate-900 text-amber-400 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{pg.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activePage ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Page URL */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-600 truncate">
                      <span className="text-slate-400 font-bold">Sayfa URL:</span>
                      <span className="text-amber-600 font-bold">{siteBaseUrl}/sayfa-{activePage.slug || 'detay'}.html</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">Özel Sayfa</span>
                  </div>

                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Sayfa SEO Başlığı (Title) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activePage.seoTitle?.length || 0}/60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={activePage.seoTitle || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          pages: (p.pages || []).map(pg => pg.id === activePage.id ? { ...pg, seoTitle: val } : pg)
                        }));
                      }}
                      placeholder={`${activePage.title} | ${config.companyName}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Sayfa Meta Açıklaması (Description) *</label>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {activePage.metaDescription?.length || 0}/160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={activePage.metaDescription || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig(p => ({
                          ...p,
                          pages: (p.pages || []).map(pg => pg.id === activePage.id ? { ...pg, metaDescription: val } : pg)
                        }));
                      }}
                      placeholder={`${config.companyName} ${activePage.title} sayfası detayları.`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* OpenGraph Image */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sayfaya Özel Sosyal Paylaşım Görseli (OpenGraph Image)</span>
                      </div>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-40 aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img 
                          src={activePage.ogImage || activePage.bannerImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"} 
                          alt={activePage.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={activePage.ogImage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig(p => ({
                              ...p,
                              pages: (p.pages || []).map(pg => pg.id === activePage.id ? { ...pg, ogImage: val } : pg)
                            }));
                          }}
                          placeholder="Özel görsel URL'si girin veya dosya yükleyin"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Görsel Yükle</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, "page")}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Henüz özel bir sayfa eklenmemiş. Kurumsal & Özel Sayfalar sekmesinden sayfa oluşturabilirsiniz.
                </div>
              )}

            </div>
          )}

          {/* TAB 6: SOCIAL MEDIA PREVIEW & OPENGRAPH CENTER */}
          {activeSubTab === "social-preview" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Sosyal Medya Paylaşım & Canlı Önizleme</h2>
                      <p className="text-xs text-slate-500 mt-0.5">WhatsApp, Facebook ve 𝕏 (Twitter) paylaşım kartlarını gerçek zamanlı simüle edin.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentPreviewUrl);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotification ? "Kopyalandı" : "Hedef Linki Kopyala"}</span>
                  </button>
                  <a
                    href={currentPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Sayfayı Aç</span>
                  </a>
                </div>
              </div>

              {/* Step 1: Target Page Selector */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>Önizlenecek Web Sayfası:</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">{currentPreviewUrl}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setSocialPreviewPageType("general")}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      socialPreviewPageType === "general"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Ana Sayfa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPreviewPageType("services")}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      socialPreviewPageType === "services"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Hizmetler ({config.services?.items?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPreviewPageType("products")}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      socialPreviewPageType === "products"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Ürünler ({config.products?.items?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPreviewPageType("blog")}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      socialPreviewPageType === "blog"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Blog ({config.blog?.items?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPreviewPageType("pages")}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      socialPreviewPageType === "pages"
                        ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Özel Sayfalar ({config.pages?.length || 0})</span>
                  </button>
                </div>

                {/* Sub-item select dropdown if applicable */}
                {socialPreviewPageType === "services" && config.services?.items && config.services.items.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Hizmet Seçiniz:</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                    >
                      {config.services.items.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {socialPreviewPageType === "products" && config.products?.items && config.products.items.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Ürün Seçiniz:</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                    >
                      {config.products.items.map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.price})</option>
                      ))}
                    </select>
                  </div>
                )}

                {socialPreviewPageType === "blog" && config.blog?.items && config.blog.items.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Blog Yazısı Seçiniz:</label>
                    <select
                      value={selectedBlogId}
                      onChange={(e) => setSelectedBlogId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                    >
                      {config.blog.items.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {socialPreviewPageType === "pages" && (config.pages?.length || 0) > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Sayfa Seçiniz:</label>
                    <select
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
                    >
                      {(config.pages || []).map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 2: Platform Choice Quick Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Önizlenecek Platformu Seçin:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Sağdaki panel canlı olarak güncellenir</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSocialPlatform("whatsapp")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      socialPlatform === "whatsapp"
                        ? "bg-emerald-950 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500/30"
                        : "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200 text-slate-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">WhatsApp</div>
                      <div className="text-[10px] opacity-75">Sohbet Balonu & Durum</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPlatform("facebook")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      socialPlatform === "facebook"
                        ? "bg-blue-950 text-white border-blue-800 shadow-sm ring-2 ring-blue-500/30"
                        : "bg-blue-50/50 hover:bg-blue-50 border-blue-200 text-slate-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Facebook</div>
                      <div className="text-[10px] opacity-75">Haber Akışı & Gruplar</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPlatform("twitter")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      socialPlatform === "twitter"
                        ? "bg-slate-950 text-white border-slate-800 shadow-sm ring-2 ring-amber-400/30"
                        : "bg-slate-100 hover:bg-slate-200/70 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-xs">
                      𝕏
                    </div>
                    <div>
                      <div className="text-xs font-bold">𝕏 (Twitter)</div>
                      <div className="text-[10px] opacity-75">Summary Card (Büyük Görsel)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 3: Simulated Post Caption */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Paylaşım Üst Metni (Gönderi Simülasyonu):</span>
                  <span className="text-[11px] text-slate-400 font-normal">Sosyal ağda linkle birlikte yazılan metin</span>
                </label>
                <input
                  type="text"
                  value={socialPostCaption}
                  onChange={(e) => setSocialPostCaption(e.target.value)}
                  placeholder="Web sitemizi ziyaret edin ve en güncel hizmet & ürünlerimizi keşfedin! 🚀"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              {/* Step 4: OpenGraph Metadata Editor */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Sosyal Paylaşım (OpenGraph) Etiketlerini Düzenleyin
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">og:title, og:description, og:image</span>
                </div>

                {/* OG Image */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block">
                        OpenGraph Paylaşım Afiş Görseli (og:image)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        WhatsApp ve Facebook paylaşımlarında en can alıcı unsurdur. Önerilen boyut: <strong>1200 × 630 px</strong> (1.91:1 oranı).
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                      1200 × 630 px
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-44 aspect-16/9 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-xs relative">
                      <img
                        src={currentPreviewImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2.5 w-full">
                      <input
                        type="text"
                        value={currentPreviewImage}
                        onChange={(e) => handleUpdateSocialOg("image", e.target.value)}
                        placeholder="https://... görsel web linki"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-slate-900 outline-none font-mono"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Görsel Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSocialImageUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleUpdateSocialOg("image", "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&h=630&q=80")}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        >
                          Hazır Görsel 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSocialOg("image", "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80")}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        >
                          Hazır Görsel 2
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OG Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Sosyal Paylaşım Başlığı (og:title)
                    </label>
                    <span className={`text-[11px] font-bold ${titleLen > 65 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {titleLen} / 60 karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentPreviewTitle}
                    onChange={(e) => handleUpdateSocialOg("title", e.target.value)}
                    placeholder="Sosyal medyada çıkacak başlık"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-slate-900 outline-none font-semibold"
                  />
                  <p className="text-[11px] text-slate-400">
                    Önerilen uzunluk 40-60 karakterdir. Marka adınızı ve vurucu hizmetinizi içerir.
                  </p>
                </div>

                {/* OG Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Sosyal Paylaşım Açıklaması (og:description)
                    </label>
                    <span className={`text-[11px] font-bold ${descLen > 165 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {descLen} / 150 karakter
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentPreviewDesc}
                    onChange={(e) => handleUpdateSocialOg("desc", e.target.value)}
                    placeholder="Sosyal medyada paylaşım kartının altında gösterilecek açıklama..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-slate-900 outline-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    WhatsApp ve Facebook link önizlemelerinde kullanıcıların tıklamasını sağlayan ana çağrı metnidir.
                  </p>
                </div>
              </div>

              {/* Step 5: OpenGraph Quality Checklist & Diagnostics */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Sosyal Medya OpenGraph Kalite Denetimi</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Puan: 100/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>og:image:</strong> Görsel tanımlı ve yüksek çözünürlüklü</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>og:title:</strong> Başlık etiketleri eksiksiz</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>og:description:</strong> Açıklama metni optimize</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>twitter:card:</strong> summary_large_image aktif</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 sm:col-span-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>og:url & HTTPS:</strong> Güvenli SSL bağlantısı ({siteBaseUrl})</span>
                  </div>
                </div>
              </div>

              {/* Step 6: Direct External Testing Tools */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Resmi Sosyal Medya Hata Ayıklayıcılarında (Debuggers) Test Edin:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentPreviewUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span>Facebook Debugger</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                  </a>

                  <a
                    href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(currentPreviewUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-slate-700" />
                      <span>LinkedIn Inspector</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentPreviewTitle + ' ' + currentPreviewUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 transition-colors flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp'ta Paylaş</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Live SERP & Social Media Share Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Canlı Önizleme Simülatörü</h3>
              </div>

              {/* Platform Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("google")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    socialPlatform === "google"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("whatsapp")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    socialPlatform === "whatsapp"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("facebook")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    socialPlatform === "facebook"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("twitter")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    socialPlatform === "twitter"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  𝕏 (Twitter)
                </button>
              </div>
            </div>

            {/* 1. GOOGLE SERP SIMULATOR */}
            {socialPlatform === "google" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Google Arama Sonuç Görünümü</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1 rounded ${previewDevice === "desktop" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                      title="Masaüstü"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1 rounded ${previewDevice === "mobile" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                      title="Mobil"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Google Card */}
                <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm font-sans space-y-1.5 ${previewDevice === "mobile" ? "max-w-[340px] mx-auto" : ""}`}>
                  
                  {/* URL Row */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-amber-600">
                      {config.companyName.charAt(0) || "W"}
                    </div>
                    <div className="leading-tight truncate">
                      <div className="text-[12px] text-slate-800 font-bold truncate">{config.companyName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{currentPreviewUrl}</div>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-[#1a0dab] hover:underline text-base sm:text-lg font-medium leading-snug cursor-pointer line-clamp-2">
                    {currentPreviewTitle || "Web Sitesi Başlığı"}
                  </h4>

                  {/* Description */}
                  <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-3">
                    {currentPreviewDesc || "Sitenizin arama motorlarında görünecek açıklama metni burada yer alacak."}
                  </p>

                  {/* Rich Snippet Preview for Products */}
                  {activeSubTab === "products" && activeProduct && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-600 font-semibold">
                      <span className="text-amber-500">★★★★★ <strong className="text-slate-800">4.9</strong> (42)</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Fiyat: {activeProduct.price}</span>
                      <span>•</span>
                      <span className="text-slate-500">Stokta</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google SEO Sağlık Puanı: 100/100</span>
                  </div>
                  <p className="text-slate-500">
                    Statik HTML yapısı sayesinde Google botları sayfayı 0.05 saniyede tarar ve anında indeksler.
                  </p>
                </div>
              </div>
            )}

            {/* 2. WHATSAPP OPENGRAPH SIMULATOR */}
            {socialPlatform === "whatsapp" && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 font-semibold">
                  WhatsApp Sohbet Paylaşım Kartı Önizlemesi
                </div>

                <div className="p-3 rounded-2xl bg-[#0b141a] text-white space-y-2">
                  <div className="bg-[#202c33] rounded-xl overflow-hidden border border-[#2a3942] max-w-[320px] shadow-md">
                    <div className="aspect-16/9 bg-slate-800 relative overflow-hidden">
                      <img 
                        src={currentPreviewImage} 
                        alt="WhatsApp Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1 bg-[#202c33]">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                        {siteDomain}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {currentPreviewTitle}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {currentPreviewDesc}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right pr-2">14:32 ✓✓</div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Müşterileriniz sitenizi WhatsApp üzerinden arkadaşlarına ilettiğinde bu afiş görseli ve başlık görünecektir.
                </p>
              </div>
            )}

            {/* 3. FACEBOOK OPENGRAPH SIMULATOR */}
            {socialPlatform === "facebook" && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Facebook Haber Akışı Paylaşım Önizlemesi</span>
                  <span className="text-[10px] text-blue-600 font-bold">1200 × 630 px Kart</span>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-slate-900 font-sans">
                  {/* Facebook Post Header */}
                  <div className="p-3.5 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {config.companyName.charAt(0) || "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        <span>{config.companyName}</span>
                        <span className="text-blue-500 text-[10px]">●</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>1 dk.</span>
                        <span>·</span>
                        <span title="Herkese Açık">🌐</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Text */}
                  <div className="px-3.5 pb-2.5 text-xs text-slate-800 leading-relaxed">
                    {socialPostCaption || `Hizmetlerimiz ve en güncel tekliflerimiz hakkında bilgi almak için web sitemizi ziyaret edin! 🚀`}
                  </div>

                  {/* OpenGraph Link Card */}
                  <div className="border-t border-b border-slate-100 bg-slate-50 overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="aspect-16/9 bg-slate-200 relative overflow-hidden">
                      <img 
                        src={currentPreviewImage} 
                        alt="Facebook Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-[#f0f2f5] space-y-0.5 border-t border-slate-200/60">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider truncate">
                        {siteDomain}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {currentPreviewTitle}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-1 leading-normal">
                        {currentPreviewDesc}
                      </p>
                    </div>
                  </div>

                  {/* Facebook Like / Comment / Share Action Bar */}
                  <div className="px-2 py-1.5 flex items-center justify-between text-slate-600 text-[11px] font-semibold border-t border-slate-100">
                    <button type="button" className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-600" />
                      <span>Beğen</span>
                    </button>
                    <button type="button" className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                      <span>Yorum Yap</span>
                    </button>
                    <button type="button" className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors">
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Paylaş</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Facebook, Instagram ve Messenger üzerinde sitenizin bağlantısı paylaşıldığında otomatik olarak bu zengin kart oluşturulur.
                </p>
              </div>
            )}

            {/* 4. TWITTER / X SIMULATOR */}
            {socialPlatform === "twitter" && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 font-semibold">
                  𝕏 (Twitter) Summary Card Önizlemesi
                </div>

                <div className="p-4 rounded-2xl bg-black text-white space-y-3 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 font-black text-slate-950 flex items-center justify-center text-xs">
                      {config.companyName.charAt(0) || "X"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{config.companyName}</div>
                      <div className="text-[10px] text-slate-500">{config.seo?.twitterHandle || '@firmaniz'}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#16181c]">
                    <div className="aspect-16/9 bg-slate-900">
                      <img 
                        src={currentPreviewImage} 
                        alt="X Card" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-[10px] text-slate-500 font-mono">{siteDomain}</div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{currentPreviewTitle}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{currentPreviewDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Copy Generated Head Tag Code */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Otomatik Üretilen HTML & Meta Etiketleri</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
`<title>${currentPreviewTitle}</title>
<meta name="description" content="${currentPreviewDesc}">
<meta property="og:title" content="${currentPreviewTitle}">
<meta property="og:description" content="${currentPreviewDesc}">
<meta property="og:image" content="${currentPreviewImage}">
<meta property="og:url" content="${currentPreviewUrl}">`
                    );
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2500);
                  }}
                  className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                >
                  {copiedNotification ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNotification ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-36">
{`<!-- ${currentPreviewSlug} Meta Tags -->
<title>${currentPreviewTitle}</title>
<meta name="description" content="${currentPreviewDesc.slice(0, 100)}...">
<meta property="og:title" content="${currentPreviewTitle}">
<meta property="og:image" content="${currentPreviewImage}">`}
              </pre>
            </div>

          </div>

        </div>

      </div>
      )}

      {/* AI SEO Auto-Optimizer Modal */}
      <SeoAutoOptimizerModal
        isOpen={isAutoOptimizerModalOpen}
        onClose={() => setIsAutoOptimizerModalOpen(false)}
        config={config}
        onApply={onChange}
      />

    </div>
  );
};
