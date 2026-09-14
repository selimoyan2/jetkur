import React, { useState, useMemo } from "react";
import { SiteConfig, BlogPostItem, BlogCategory } from "../../types";
import { RichTextEditor } from "../RichTextEditor";
import { Base64ImageUpload } from "./Base64ImageUpload";
import { AiBlogEngine } from "./AiBlogEngine";
import { slugify, slugifyBlog, sanitizeSlugInput } from "../../utils/url";
import {
  FileText,
  Plus,
  Trash2,
  Tag,
  Globe,
  Sparkles,
  Eye,
  Copy,
  Check,
  ExternalLink,
  FolderPlus,
  Search,
  Calendar,
  Clock,
  User,
  Share2,
  Sliders,
  BookOpen,
  Layout,
  RefreshCw,
  HelpCircle,
  FolderKanban,
  CheckCircle2,
  Info
} from "lucide-react";

interface BlogManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

// Preset article cover photography for quick selection
const STOCK_COVER_PRESETS = [
  {
    label: "Ofis & Danışmanlık",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    label: "Teknoloji & Analiz",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    label: "Sanayi & Mühendislik",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
  },
  {
    label: "Ulaşım & Lojistik",
    url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    label: "Müşteri & İletişim",
    url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"
  },
  {
    label: "Güvenlik & Kalite",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
  }
];

export const BlogManager: React.FC<BlogManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  // Main view state
  const [activeView, setActiveView] = useState<"articles" | "ai-engine" | "categories" | "homepage-settings">("articles");
  const [editorSubTab, setEditorSubTab] = useState<"content" | "seo" | "preview">("content");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Active article selection
  const rawPosts: BlogPostItem[] = config.blog?.items || [];
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    rawPosts[0]?.id || null
  );

  // Categories resolution (synchronizing config.blogCategories and config.blog.categories)
  const categories: BlogCategory[] = useMemo(() => {
    if (config.blogCategories && config.blogCategories.length > 0) {
      return config.blogCategories;
    }
    if (config.blog?.categories && config.blog.categories.length > 0) {
      return config.blog.categories;
    }
    return [
      { id: "bcat-1", name: "Sektörel Rehber", slug: "rehber", description: "Sektördeki uzman tavsiyeleri ve pratik kılavuzlar" },
      { id: "bcat-2", name: "Haberler & Duyurular", slug: "haberler", description: "Firmamızdan ve sektörden güncel gelişmeler" },
      { id: "bcat-3", name: "İpuçları & Tavsiyeler", slug: "tavsiyeler", description: "Müşterilerimiz için tasarruf ve bakım ipuçları" }
    ];
  }, [config.blogCategories, config.blog?.categories]);

  // Selected article
  const selectedPost = rawPosts.find((p) => p.id === selectedPostId) || rawPosts[0];

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [catSlugInput, setCatSlugInput] = useState("");
  const [catDescInput, setCatDescInput] = useState("");

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Feedback states
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filtered articles
  const filteredPosts = useMemo(() => {
    return rawPosts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat =
        selectedCategoryFilter === "all" ||
        (post.categoryIds && post.categoryIds.includes(selectedCategoryFilter)) ||
        post.category === selectedCategoryFilter ||
        (post.categories && post.categories.includes(selectedCategoryFilter));

      return matchesSearch && matchesCat;
    });
  }, [rawPosts, searchQuery, selectedCategoryFilter]);

  // Article Helper: Calculate Read Time from word count
  const calculateReadTime = (content: string): string => {
    const textOnly = content.replace(/<[^>]*>/g, " ");
    const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} dk okuma`;
  };

  // 1. ADD NEW ARTICLE
  const handleCreateArticle = (templateType?: "guide" | "qa" | "case" | "standard") => {
    const newId = `post-${Date.now()}`;
    const defaultCat = categories[0] || { id: "bcat-1", name: "Sektörel Rehber", slug: "rehber" };
    
    let title = "Sektörde Dikkat Edilmesi Gereken 5 Önemli İpucu";
    let excerpt = "İşletmenizin veya günlük hayatınızın verimini artıracak, uzman tavsiyeleriyle hazırlanmış kapsamlı rehber.";
    let content = `<h2>1. Doğru Planlama ve Güvenilir İş Ortağı Seçimi</h2><p>Başarılı bir sürecin ilk adımı doğru bilgiye ulaşmak ve alanında yetkin kurumsal firmalarla çalışmaktır.</p><h2>2. Maliyet ve Zaman Tasarrufu Sağlayan İpuçları</h2><p>Düzenli kontroller ve proaktif adımlar atarak beklenmedik masrafların ve aksaklıkların önüne geçebilirsiniz.</p><blockquote>"Kaliteli hizmete zamanında yatırım yapmak, uzun vadede en karlı karardır."</blockquote><h2>3. Özet ve Sonuç</h2><p>Sorularınız veya detaylı bilgi talepleriniz için uzman ekibimizle iletişime geçebilirsiniz.</p>`;

    if (templateType === "qa") {
      title = `${config.sector} Hakkında En Çok Merak Edilen 10 Soru ve Cevap`;
      excerpt = `Müşterilerimizin bize en çok ilettiği soruları ve uzmanlarımızın şeffaf yanıtlarını bir araya getirdik.`;
      content = `<h2>Sıkça Merak Edilen Konular</h2><h3>Soru 1: Hizmet süreci nasıl işler?</h3><p>Talebinizi aldıktan sonra ekibimiz ihtiyaçlarınızı analiz eder ve size en uygun çözümü sunar.</p><h3>Soru 2: Fiyatlandırma nasıl belirlenir?</h3><p>Fiyatlandırmalarımız şeffaf, standart ve sürpriz maliyet içermeyen kurumsal politikamıza dayanır.</p>`;
    } else if (templateType === "case") {
      title = `Başarı Hikayesi: ${config.city} Bölgesinde Müşterimize Sunduğumuz Çözüm`;
      excerpt = `Karşılaşılan problemi nasıl analiz ettik ve en hızlı şekilde yüksek memnuniyetle nasıl çözüme kavuşturduk?`;
      content = `<h2>Karşılaşılan Durum</h2><p>Müşterimiz acil ve hassas bir ihtiyaçla firmamıza başvurdu.</p><h2>Uygulanan Çözüm</h2><p>Modern donanımlarımız ve deneyimli personelimizle 20 dakika içerisinde sahaya intikal edildi.</p><h2>Sonuç & Müşteri Geri Bildirimi</h2><p>Süreç sıfır hatayla tamamlandı ve tam puan müşteri memnuniyeti sağlandı.</p>`;
    }

    const initialSlug = slugifyBlog(title, Date.now().toString().slice(-4));
    const today = new Date().toISOString().split("T")[0];

    const newPost: BlogPostItem = {
      id: newId,
      title,
      slug: initialSlug,
      category: defaultCat.name,
      categories: [defaultCat.name],
      categoryIds: [defaultCat.id],
      excerpt,
      content,
      readTime: calculateReadTime(content),
      date: today,
      author: config.companyName || "Editör",
      coverImage: STOCK_COVER_PRESETS[Math.floor(Math.random() * STOCK_COVER_PRESETS.length)].url,
      tags: [config.sector.toLowerCase(), "rehber", "tavsiyeler"],
      seoTitle: `${title} | ${config.companyName}`,
      seoDescription: excerpt,
      seoKeywords: `${title.toLowerCase()}, ${config.sector.toLowerCase()}, ${config.city.toLowerCase()} rehber, ${config.companyName}`
    };

    const updatedItems = [newPost, ...rawPosts];
    updateConfigBlog({ items: updatedItems });
    setSelectedPostId(newId);
    setEditorSubTab("content");
    showToast("Yeni makale başarıyla oluşturuldu.");
  };

  // 2. UPDATE ARTICLE
  const handleUpdateArticle = (field: keyof BlogPostItem, value: any) => {
    if (!selectedPost) return;

    const updatedItems = rawPosts.map((post) => {
      if (post.id === selectedPost.id) {
        const updated = { ...post, [field]: value };
        // Auto-update readTime if content changed
        if (field === "content" && typeof value === "string") {
          updated.readTime = calculateReadTime(value);
        }
        return updated;
      }
      return post;
    });

    updateConfigBlog({ items: updatedItems });
  };

  // 3. REMOVE ARTICLE
  const handleDeleteArticle = (postId: string) => {
    if (rawPosts.length <= 1) {
      alert("Web sitenizde en az 1 adet blog makalesi bulunmalıdır.");
      return;
    }
    if (!confirm("Bu makaleyi silmek istediğinizden emin misiniz?")) return;

    const updatedItems = rawPosts.filter((p) => p.id !== postId);
    updateConfigBlog({ items: updatedItems });
    if (selectedPostId === postId) {
      setSelectedPostId(updatedItems[0]?.id || null);
    }
    showToast("Makale silindi.");
  };

  // 4. DUPLICATE ARTICLE
  const handleDuplicateArticle = (post: BlogPostItem) => {
    const newId = `post-${Date.now()}`;
    const duplicatedTitle = `${post.title} (Kopya)`;
    const newSlug = slugifyBlog(duplicatedTitle, Date.now().toString().slice(-4));
    
    const newPost: BlogPostItem = {
      ...post,
      id: newId,
      title: duplicatedTitle,
      slug: newSlug,
      date: new Date().toISOString().split("T")[0],
      seoTitle: `${duplicatedTitle} | ${config.companyName}`
    };

    const updatedItems = [newPost, ...rawPosts];
    updateConfigBlog({ items: updatedItems });
    setSelectedPostId(newId);
    showToast("Makale başarıyla kopyalandı.");
  };

  // 5. CATEGORY SELECTION & SYNC
  const handleSelectPrimaryCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    handleUpdateArticle("category", cat.name);
    handleUpdateArticle("categories", [cat.name]);
    handleUpdateArticle("categoryIds", [cat.id]);
  };

  const handleToggleCategory = (catId: string) => {
    if (!selectedPost) return;
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    const currentCatIds = selectedPost.categoryIds || [];
    const currentCats = selectedPost.categories || [selectedPost.category || ""];

    let newCatIds: string[];
    let newCats: string[];

    if (currentCatIds.includes(catId)) {
      if (currentCatIds.length <= 1) return; // En az 1 kategori olmalı
      newCatIds = currentCatIds.filter((id) => id !== catId);
      newCats = currentCats.filter((c) => c !== cat.name);
    } else {
      newCatIds = [...currentCatIds, catId];
      newCats = [...currentCats, cat.name];
    }

    const primaryCatName = categories.find((c) => c.id === newCatIds[0])?.name || cat.name;

    const updatedItems = rawPosts.map((p) => {
      if (p.id === selectedPost.id) {
        return {
          ...p,
          categoryIds: newCatIds,
          categories: newCats,
          category: primaryCatName
        };
      }
      return p;
    });

    updateConfigBlog({ items: updatedItems });
  };

  // 6. CATEGORY MANAGEMENT (ADD / EDIT / DELETE)
  const handleSaveCategoryModal = () => {
    if (!catNameInput.trim()) return;

    const cleanName = catNameInput.trim();
    const cleanSlug = catSlugInput.trim() ? slugify(catSlugInput.trim()) : slugify(cleanName);
    const cleanDesc = catDescInput.trim() || `${cleanName} kategorisi makaleleri`;

    let updatedCats: BlogCategory[];

    if (editingCategory) {
      updatedCats = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: cleanName, slug: cleanSlug, description: cleanDesc }
          : c
      );
    } else {
      const newCat: BlogCategory = {
        id: `cat-${Date.now()}`,
        name: cleanName,
        slug: cleanSlug,
        description: cleanDesc
      };
      updatedCats = [...categories, newCat];
    }

    onChange({
      ...config,
      blogCategories: updatedCats,
      blog: {
        ...config.blog,
        categories: updatedCats
      }
    });

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCatNameInput("");
    setCatSlugInput("");
    setCatDescInput("");
    showToast("Kategoriler güncellendi.");
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert("En az bir adet blog kategorisi bulunmalıdır.");
      return;
    }
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait yazılar 'Genel' olarak güncellenecektir.")) return;

    const updatedCats = categories.filter((c) => c.id !== catId);
    const fallbackCat = updatedCats[0];

    // Reassign posts using this category
    const updatedPosts = rawPosts.map((p) => {
      const usesCat = (p.categoryIds && p.categoryIds.includes(catId)) || p.category === categories.find(c => c.id === catId)?.name;
      if (usesCat) {
        return {
          ...p,
          category: fallbackCat.name,
          categories: [fallbackCat.name],
          categoryIds: [fallbackCat.id]
        };
      }
      return p;
    });

    onChange({
      ...config,
      blogCategories: updatedCats,
      blog: {
        ...config.blog,
        categories: updatedCats,
        items: updatedPosts
      }
    });
    showToast("Kategori silindi ve yazılar taşındı.");
  };

  // 7. TAGS MANAGEMENT
  const handleAddTag = () => {
    if (!tagInput.trim() || !selectedPost) return;
    const clean = tagInput.trim().toLowerCase().replace(/^#/, "");
    const currentTags = selectedPost.tags || [];
    if (!currentTags.includes(clean)) {
      handleUpdateArticle("tags", [...currentTags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedPost) return;
    const currentTags = selectedPost.tags || [];
    handleUpdateArticle("tags", currentTags.filter((t) => t !== tagToRemove));
  };

  // 8. AI ONE-CLICK SEO OPTIMIZER
  const handleAiOptimizeSeo = () => {
    if (!selectedPost) return;
    setAiOptimizing(true);

    setTimeout(() => {
      const autoSlug = slugifyBlog(selectedPost.title);
      const company = config.companyName || "Kurumsal";
      const sector = config.sector || "Hizmet";
      const city = config.city || "Türkiye";

      // Craft high CTR title (55-60 chars)
      const optTitle = `${selectedPost.title} [Rehber] | ${company}`.slice(0, 60);

      // Craft compelling meta description (145-155 chars)
      const cleanExcerpt = selectedPost.excerpt?.trim() || "";
      const optDesc = cleanExcerpt.length > 50
        ? `${cleanExcerpt.slice(0, 120)}... ${company} uzman tavsiyeleriyle keşfedin.`
        : `${selectedPost.title} hakkında detaylı ipuçları, adımlar ve kurumsal rehber ${company} blogunda. Hemen inceleyin!`.slice(0, 155);

      // Extract high value keywords
      const optKeywords = [
        selectedPost.title.toLowerCase(),
        selectedPost.category?.toLowerCase() || "blog",
        `${sector.toLowerCase()} rehber`,
        `${city.toLowerCase()} ${sector.toLowerCase()}`,
        company.toLowerCase(),
        "ipuçları ve tavsiyeler",
        "nasıl yapılır"
      ].filter(Boolean).join(", ");

      const updatedItems = rawPosts.map((p) => {
        if (p.id === selectedPost.id) {
          return {
            ...p,
            slug: autoSlug,
            seoTitle: optTitle,
            seoDescription: optDesc,
            seoKeywords: optKeywords
          };
        }
        return p;
      });

      updateConfigBlog({ items: updatedItems });
      setAiOptimizing(false);
      showToast("SEO meta etiketleri ve URL yapay zeka ile optimize edildi!");
    }, 450);
  };

  // 9. UPDATE SITE CONFIG HELPER
  const updateConfigBlog = (partial: Partial<SiteConfig["blog"]>) => {
    const updatedBlog = {
      ...config.blog,
      ...partial
    };

    // Also ensure homepage section is in sync if blog.enabled is modified
    let updatedSections = config.homepageSections;
    if (partial.enabled !== undefined) {
      updatedSections = (config.homepageSections || []).map((sec) =>
        sec.id === "blog" ? { ...sec, enabled: partial.enabled! } : sec
      );
    }

    onChange({
      ...config,
      homepageSections: updatedSections,
      blog: updatedBlog,
      blogCategories: categories
    });
  };

  // Live article URL
  const currentPostSlug = selectedPost?.slug || slugifyBlog(selectedPost?.title || "makale");
  const articleHtmlUrl = `blog-${currentPostSlug}.html`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-300 border border-amber-500/40 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Header & Section Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>İçerik Yönetim Sistemi (Blog & CMS)</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Blog, Makale & SEO İçerik Merkezi
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Makalelerinizi zengin metin editörüyle yazın, kategorilere ayırın ve Google SEO meta etiketlerini yapılandırın.
              Değişiklikler anında web sitenizin <strong>Ana Sayfa</strong> ve <strong>Haberler/Blog</strong> sayfalarını günceller.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onPreview && (
              <button
                type="button"
                id="blog-preview-live-btn"
                onClick={onPreview}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sitedeki Canlı Görünümü Aç"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Önizlemeyi Aç</span>
              </button>
            )}

            <button
              type="button"
              id="blog-open-ai-engine-btn"
              onClick={() => setActiveView("ai-engine")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-850 hover:to-indigo-900 text-amber-300 hover:text-amber-200 border border-indigo-500/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Nişinize Özel Uzun Soluklu Makale Üret"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Blog Motoru</span>
            </button>

            <button
              type="button"
              id="blog-create-article-btn"
              onClick={() => handleCreateArticle("standard")}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Makale Yaz</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Articles, AI Engine, Categories, Homepage Display) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              id="tab-blog-articles"
              onClick={() => setActiveView("articles")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "articles"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Makaleler ({rawPosts.length})</span>
            </button>

            <button
              type="button"
              id="tab-blog-ai-engine"
              onClick={() => setActiveView("ai-engine")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "ai-engine"
                  ? "bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-xs font-black"
                  : "text-amber-800 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Yapay Zeka Blog Motoru</span>
            </button>

            <button
              type="button"
              id="tab-blog-categories"
              onClick={() => setActiveView("categories")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "categories"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Kategoriler ({categories.length})</span>
            </button>

            <button
              type="button"
              id="tab-blog-homepage"
              onClick={() => setActiveView("homepage-settings")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "homepage-settings"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-blue-600" />
              <span>Ana Sayfa & Vitrin Ayarları</span>
            </button>
          </div>

          {/* Quick Template Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Hızlı Başlangıç Şablonu:</span>
            <button
              type="button"
              onClick={() => handleCreateArticle("guide")}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200/60 transition-colors"
            >
              + Rehber Şablonu
            </button>
            <button
              type="button"
              onClick={() => handleCreateArticle("qa")}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200/60 transition-colors"
            >
              + Soru-Cevap
            </button>
            <button
              type="button"
              onClick={() => handleCreateArticle("case")}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200/60 transition-colors"
            >
              + Vaka Analizi
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: AI BLOG ENGINE */}
      {activeView === "ai-engine" && (
        <AiBlogEngine
          config={config}
          onChange={onChange}
          onPreview={onPreview}
          onNavigateTab={onNavigateTab}
          onArticlePublished={(newArticleId) => {
            setSelectedPostId(newArticleId);
            setActiveView("articles");
            setEditorSubTab("content");
            showToast("Yapay zeka makalesi başarıyla yayınlandı ve blog listenize eklendi.");
          }}
        />
      )}

      {/* VIEW 1: ARTICLES WORKSPACE (SIDEBAR + FULL EDITOR) */}
      {activeView === "articles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Article List & Search */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              {/* Search & Category Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Makale başlığı veya etiket ara..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                >
                  <option value="all">Tüm Kategoriler ({rawPosts.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Makale Bulunamadı</div>
                  <p className="text-[11px] text-slate-400">
                    Arama kriterinize uygun makale bulunamadı veya henüz eklenmedi.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreateArticle("standard")}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <Plus className="w-3 h-3" /> Yeni Makale Oluştur
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = post.id === (selectedPost?.id || "");
                  const coverImg = post.coverImage || post.image || "";
                  const primaryCat = post.category || categories[0]?.name || "Genel";

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? "bg-slate-900 text-white border-amber-500/80 shadow-md ring-1 ring-amber-500/30"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={post.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-700/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {primaryCat}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {post.date}
                            </span>
                          </div>

                          <h3 className={`text-xs font-bold line-clamp-2 leading-snug ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}>
                            {post.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100/10 text-[11px] font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime || "3 dk"}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">
                            /{post.slug ? `${post.slug.slice(0, 14)}...` : "yazi"}.html
                          </span>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDuplicateArticle(post)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Makaleyi Çoğalt (Kopya Oluştur)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {rawPosts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(post.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Makaleyi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Full-Featured Article Editor */}
          <div className="lg:col-span-8 space-y-4">
            {selectedPost ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Editor Header Bar */}
                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      /{articleHtmlUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(articleHtmlUrl);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1"
                      title="URL Yolunu Kopyala"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? "Kopyalandı" : "Kopyala"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicateArticle(selectedPost)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Çoğalt</span>
                    </button>

                    {rawPosts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(selectedPost.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sil</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor Tabs: Content, SEO & Metadata, Live Preview */}
                <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setEditorSubTab("content")}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      editorSubTab === "content"
                        ? "border-amber-500 text-slate-950 font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Makale İçeriği</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorSubTab("seo")}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      editorSubTab === "seo"
                        ? "border-amber-500 text-slate-950 font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>Google SEO & Sosyal Paylaşım</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorSubTab("preview")}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      editorSubTab === "preview"
                        ? "border-amber-500 text-slate-950 font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>SERP & Kart Önizlemesi</span>
                  </button>
                </div>

                {/* TAB CONTENT 1: CORE ARTICLE WRITING */}
                {editorSubTab === "content" && (
                  <div className="p-6 space-y-6">
                    {/* Title & Slug */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-900">
                            Makale Başlığı <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">
                            {selectedPost.title.length} karakter
                          </span>
                        </div>
                        <input
                          type="text"
                          value={selectedPost.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            handleUpdateArticle("title", newTitle);
                          }}
                          placeholder="Örn: Yolda Kaldığınızda İlk Yapmanız Gereken 5 Güvenlik Adımı"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      {/* URL Slug */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            SEO URL Adresi (Slug)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const auto = slugifyBlog(selectedPost.title);
                              handleUpdateArticle("slug", auto);
                              showToast("URL başlığa göre güncellendi.");
                            }}
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Başlıktan Otomatik Üret</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
                            /blog-
                          </span>
                          <input
                            type="text"
                            value={selectedPost.slug || slugifyBlog(selectedPost.title)}
                            onChange={(e) => {
                              handleUpdateArticle("slug", sanitizeSlugInput(e.target.value));
                            }}
                            placeholder="ornek-makale-adresi"
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                          />
                          <span className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
                            .html
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Row: Categories, Author, Date, Read Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      {/* Primary Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ana Kategori
                        </label>
                        <select
                          value={
                            categories.find(c => c.name === selectedPost.category || (selectedPost.categoryIds && selectedPost.categoryIds.includes(c.id)))?.id ||
                            categories[0]?.id
                          }
                          onChange={(e) => handleSelectPrimaryCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Author */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Yazar Adı
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={selectedPost.author || config.companyName}
                            onChange={(e) => handleUpdateArticle("author", e.target.value)}
                            placeholder="Yazar Adı"
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* Publication Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Yayın Tarihi
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={selectedPost.date || new Date().toISOString().split("T")[0]}
                            onChange={(e) => handleUpdateArticle("date", e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Read Time */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Okuma Süresi
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={selectedPost.readTime || "3 dk okuma"}
                            onChange={(e) => handleUpdateArticle("readTime", e.target.value)}
                            placeholder="3 dk okuma"
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* Multi-Category Checkboxes */}
                      <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                          Tüm İlgili Kategoriler (Çoklu Seçim):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => {
                            const isChecked = (selectedPost.categoryIds || []).includes(cat.id) || selectedPost.category === cat.name;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleToggleCategory(cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                <span>{isChecked ? "✓" : "+"}</span>
                                <span>{cat.name}</span>
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveView("categories");
                              setEditingCategory(null);
                              setCatNameInput("");
                              setShowCategoryModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                          >
                            + Yeni Kategori Tanımla
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Makale Kapak Fotoğrafı (21:9 veya 16:9)
                        </label>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab("asset-manager")}
                            className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Görsel Stüdyosu (Imagen 3)</span>
                          </button>
                        )}
                      </div>

                      <Base64ImageUpload
                        label="Kapak Görseli Yükle"
                        helperText="Bilgisayarınızdan dosya yükleyin veya aşağıdan hazır stok galerisinden bir fotoğraf seçin."
                        value={selectedPost.coverImage || selectedPost.image || ""}
                        onChange={(newVal) => {
                          handleUpdateArticle("image", newVal);
                          handleUpdateArticle("coverImage", newVal);
                        }}
                        aspectRatio="21/9"
                      />

                      {/* Stock Preset Selector */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                          Hızlı Profesyonel Görsel Seçin:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {STOCK_COVER_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handleUpdateArticle("image", preset.url);
                                handleUpdateArticle("coverImage", preset.url);
                                showToast(`${preset.label} görseli atandı.`);
                              }}
                              className="group relative rounded-xl overflow-hidden aspect-16/9 border border-slate-200 hover:border-amber-500 transition-all cursor-pointer"
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                                <span className="text-[10px] font-bold text-white leading-tight">
                                  {preset.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Excerpt / Summary */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">
                          Kısa Özet (Excerpt)
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Önerilen: 80 - 160 karakter
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={selectedPost.excerpt || ""}
                        onChange={(e) => handleUpdateArticle("excerpt", e.target.value)}
                        placeholder="Makalenin ana fikrini anlatan, arama motorlarında ve kartlarda görünecek kısa giriş metni..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    {/* Rich Text Editor for Content Body */}
                    <div>
                      <RichTextEditor
                        label="Makale Tam İçeriği (Görsel WYSIWYG Editör)"
                        value={selectedPost.content || ""}
                        onChange={(val) => handleUpdateArticle("content", val)}
                        minHeight="280px"
                        placeholder="Makalenizi başlıklar (H2, H3), paragraflar, maddeler, alıntılar, tablolar ve görsellerle zenginleştirin..."
                        helpText="Metni seçip üst araç çubuğundaki düğmelerle anında kalın, italik yapabilir, başlık atayabilir veya liste oluşturabilirsiniz."
                      />
                    </div>

                    {/* Tags / Etiketler */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Etiketler (Tags)
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        {(selectedPost.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="text-slate-400 hover:text-rose-500 font-bold ml-0.5"
                            >
                              ✕
                            </button>
                          </span>
                        ))}

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            placeholder="Etiket ekle (Enter)..."
                            className="px-2.5 py-1 text-xs bg-transparent border-none focus:outline-hidden text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[11px] font-bold text-slate-700"
                          >
                            + Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 2: SEO & SOCIAL METADATA SUITE */}
                {editorSubTab === "seo" && (
                  <div className="p-6 space-y-6">
                    {/* AI SEO Assistant Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Yapay Zeka SEO & Meta Asistanı
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300">
                          Makale başlığınızı ve içeriğinizi analiz ederek Google SERP ve sosyal paylaşımlar için en yüksek tıklama oranına (CTR) sahip meta etiketleri üretir.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAiOptimizeSeo}
                        disabled={aiOptimizing}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{aiOptimizing ? "Optimize Ediliyor..." : "AI ile SEO'yu Optimize Et"}</span>
                      </button>
                    </div>

                    {/* SEO Fields Form */}
                    <div className="space-y-4">
                      {/* Meta Title */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-800">
                            Google Arama Başlığı (SEO Title)
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            (selectedPost.seoTitle || selectedPost.title).length > 60
                              ? "text-rose-500"
                              : "text-emerald-600"
                          }`}>
                            {(selectedPost.seoTitle || selectedPost.title).length} / 60 karakter
                          </span>
                        </div>
                        <input
                          type="text"
                          value={selectedPost.seoTitle || selectedPost.title}
                          onChange={(e) => handleUpdateArticle("seoTitle", e.target.value)}
                          placeholder="Makale Başlığı | Firma Adı"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Google arama sonuçlarında mavi başlık olarak gösterilir. 50-60 karakter arası idealdir.
                        </p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-800">
                            Google Arama Açıklaması (Meta Description)
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            (selectedPost.seoDescription || selectedPost.excerpt || "").length > 160
                              ? "text-rose-500"
                              : "text-emerald-600"
                          }`}>
                            {(selectedPost.seoDescription || selectedPost.excerpt || "").length} / 160 karakter
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedPost.seoDescription || selectedPost.excerpt || ""}
                          onChange={(e) => handleUpdateArticle("seoDescription", e.target.value)}
                          placeholder="Google arama sonuçlarında başlığın altında çıkan 150-160 karakterlik özet..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Hedef Anahtar Kelimeler (SEO Keywords)
                        </label>
                        <input
                          type="text"
                          value={selectedPost.seoKeywords || ""}
                          onChange={(e) => handleUpdateArticle("seoKeywords", e.target.value)}
                          placeholder="Örn: oto kurtarma rehberi, yol yardım ipuçları, lastik patlayınca ne yapılır"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Virgülle ayırarak makalenin aramalarda bulunmasını istediğiniz terimleri girin.
                        </p>
                      </div>

                      {/* Custom OpenGraph Social Image */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Sosyal Medya Paylaşım Görseli (OpenGraph Image)
                        </label>
                        <input
                          type="text"
                          value={selectedPost.ogImage || selectedPost.coverImage || selectedPost.image || ""}
                          onChange={(e) => handleUpdateArticle("ogImage", e.target.value)}
                          placeholder="https://... (boş bırakılırsa kapak fotoğrafı kullanılır)"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          WhatsApp, LinkedIn ve Facebook paylaşımlarında çıkan 1200x630 piksel kart görseli.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 3: LIVE SERP & SOCIAL CARD SIMULATOR */}
                {editorSubTab === "preview" && (
                  <div className="p-6 space-y-6 bg-slate-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span>Google Arama Sonucu (SERP) Canlı Önizlemesi</span>
                        </h3>
                        <span className="text-[11px] text-slate-400">Gerçekçi Google Simülatörü</span>
                      </div>

                      {/* Google Search Card Simulator */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 max-w-2xl font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                            🌐
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-800 leading-tight">
                              {config.companyName || "Web Siteniz"}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono leading-tight">
                              https://{config.cloudflare?.customDomain || "firmaniz.com"} › blog › {selectedPost.slug || "makale"}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer pt-0.5 leading-snug">
                          {selectedPost.seoTitle || selectedPost.title} | {config.companyName}
                        </h4>

                        <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                          {selectedPost.seoDescription || selectedPost.excerpt || "Makale özeti burada görüntülenecektir."}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp / Social Media Share Card Simulator */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp & Sosyal Medya Paylaşım Kartı</span>
                        </h3>
                        <span className="text-[11px] text-slate-400">OpenGraph (1200x630)</span>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-md">
                        <div className="aspect-16/9 bg-slate-100 overflow-hidden">
                          <img
                            src={
                              selectedPost.ogImage ||
                              selectedPost.coverImage ||
                              selectedPost.image ||
                              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                            }
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 bg-slate-50 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {config.cloudflare?.customDomain || "firmaniz.com"}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {selectedPost.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {selectedPost.excerpt || selectedPost.seoDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Lütfen soldan bir makale seçin veya yeni makale ekleyin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CATEGORIES MANAGEMENT */}
      {activeView === "categories" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Blog Kategori Mimarisi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kategoriler web sitenizin <strong>blog.html (Haberler)</strong> sayfasında dinamik filtre butonları olarak çalışır.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCatNameInput("");
                setCatSlugInput("");
                setCatDescInput("");
                setShowCategoryModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Kategori Ekle</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const articleCount = rawPosts.filter(
                (p) =>
                  (p.categoryIds && p.categoryIds.includes(cat.id)) ||
                  p.category === cat.name ||
                  (p.categories && p.categories.includes(cat.name))
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {articleCount} Makale
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-amber-600">
                      /{cat.slug || slugify(cat.name)}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {cat.description || "Bu kategoriye ait makaleler ve rehberler."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatNameInput(cat.name);
                        setCatSlugInput(cat.slug);
                        setCatDescInput(cat.description || "");
                        setShowCategoryModal(true);
                      }}
                      className="text-slate-600 hover:text-slate-900 font-bold"
                    >
                      Düzenle
                    </button>

                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-rose-600 hover:text-rose-700 font-bold"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: HOMEPAGE & DISPLAY SETTINGS */}
      {activeView === "homepage-settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Ana Sayfa Blog Bölümü & Vitrin Ayarları</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ana sayfanızdaki blog vitrininin görünümünü, başlıklarını ve listelenecek makale adedini belirleyin.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Ana Sayfada Blog Bölümünü Göster
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Açık olduğunda en güncel makaleleriniz ana sayfada vitrin kartları olarak listelenir.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.blog?.enabled !== false}
                  onChange={(e) => updateConfigBlog({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Section Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Bölüm Üst Rozeti (Badge)
              </label>
              <input
                type="text"
                value={config.blog?.badge || "Rehber & Blog"}
                onChange={(e) => updateConfigBlog({ badge: e.target.value })}
                placeholder="Örn: Rehber & Blog, Haberler & İpuçları"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            {/* Section Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Bölüm Ana Başlığı
              </label>
              <input
                type="text"
                value={config.blog?.title || "Faydalı Bilgiler ve Sektörel İpuçları"}
                onChange={(e) => updateConfigBlog({ title: e.target.value })}
                placeholder="Örn: Faydalı Bilgiler ve Sektörel İpuçları"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            {/* Section Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Alt Açıklama (Subtitle)
              </label>
              <textarea
                rows={2}
                value={config.blog?.subtitle || "Uzmanlarımızdan güncel makaleler, rehberler ve tavsiyeler."}
                onChange={(e) => updateConfigBlog({ subtitle: e.target.value })}
                placeholder="Bölüm hakkında kısa açıklama..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            {/* Featured Count */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ana Sayfada Gösterilecek Makale Adedi
              </label>
              <select
                value={(config.blog as any)?.featuredCount || 3}
                onChange={(e) => updateConfigBlog({ featuredCount: Number(e.target.value) } as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
              >
                <option value={3}>3 Makale (Önerilen - 1 Satır)</option>
                <option value={6}>6 Makale (Geniş Vitrin - 2 Satır)</option>
              </select>
            </div>

            {/* Direct Jump Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Canlı Önizleme Testi</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yaptığınız tüm değişiklikler anında kaydedilir ve önizleme ekranında index.html (Ana Sayfa) ve blog.html sayfalarını yeniler.
              </p>
              {onPreview && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onPreview}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Canlı Önizlemeyi Aç</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY EDIT / CREATE MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kategori Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={catNameInput}
                  onChange={(e) => {
                    setCatNameInput(e.target.value);
                    if (!editingCategory) {
                      setCatSlugInput(slugify(e.target.value));
                    }
                  }}
                  placeholder="Örn: Sektörel Rehber & Kılavuzlar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  URL Adresi (Slug)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
                    /blog?cat=
                  </span>
                  <input
                    type="text"
                    value={catSlugInput}
                    onChange={(e) => setCatSlugInput(sanitizeSlugInput(e.target.value))}
                    placeholder="kategori-slug"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kısa Açıklama
                </label>
                <textarea
                  rows={2}
                  value={catDescInput}
                  onChange={(e) => setCatDescInput(e.target.value)}
                  placeholder="Bu kategorinin içerdiği konular hakkında kısa özet..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryModal}
                disabled={!catNameInput.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors disabled:opacity-50"
              >
                {editingCategory ? "Kaydet" : "Kategori Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
