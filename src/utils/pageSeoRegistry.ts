import { 
  SiteConfig, 
  IndividualPageSeoMeta, 
  PageSeoOverrideItem, 
  ServiceItem, 
  ProductItem, 
  BlogPostItem, 
  CustomPageItem 
} from "../types";
import { 
  slugifyService, 
  slugifyProduct, 
  slugifyBlog 
} from "./url";

/**
 * Returns clean base domain and URL for the site
 */
export function getSiteBaseUrl(config: SiteConfig): string {
  if (config.cloudflare?.customDomain) {
    return `https://${config.cloudflare.customDomain.trim().replace(/\/$/, "")}`;
  }
  if (config.cloudflare?.deployedUrl) {
    return config.cloudflare.deployedUrl.trim().replace(/\/$/, "");
  }
  const sub = config.cloudflare?.subdomain || "sirket";
  return `https://${sub}.hizliweb.site`;
}

/**
 * Extracts and unifies all crawlable individual pages of the website into a standardized array
 */
export function getAllPagesSeoMeta(config: SiteConfig): IndividualPageSeoMeta[] {
  const baseUrl = getSiteBaseUrl(config);
  const companyName = config.companyName || "HızlıWeb İşletmesi";
  const city = config.city || "İstanbul";
  const sector = config.sector || "Kurumsal Hizmetler";
  const defaultOgImage = config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";

  const pages: IndividualPageSeoMeta[] = [];
  const overrides = config.pageSeoOverrides || {};

  // 1. Home Page (Ana Sayfa)
  const homeOverride = overrides["page-home"] || {};
  const homeDefaultTitle = config.seo?.metaTitle || `${companyName} | ${city} ${sector} & Profesyonel Hizmetler`;
  const homeDefaultDesc = config.seo?.metaDescription || `${city} genelinde ${sector} alanında kaliteli, güvenilir ve garantili hizmet. Hemen ${companyName} ile iletişime geçin.`;
  const homeDefaultKeywords = config.seo?.keywords || `${companyName}, ${sector}, ${city}, acil servis`;
  const homeCanonical = homeOverride.canonicalUrl || config.seo?.canonicalUrl || `${baseUrl}/`;

  pages.push({
    pageId: "page-home",
    pageTitle: "Ana Sayfa (Açılış)",
    pageType: "home",
    slug: "",
    fullUrl: `${baseUrl}/`,
    metaTitle: homeOverride.metaTitle || homeDefaultTitle,
    metaDescription: homeOverride.metaDescription || homeDefaultDesc,
    keywords: homeOverride.keywords || homeDefaultKeywords,
    canonicalUrl: homeCanonical,
    isCustomCanonical: homeOverride.isCustomCanonical ?? Boolean(config.seo?.canonicalUrl && config.seo?.canonicalUrl !== `${baseUrl}/`),
    ogImage: homeOverride.ogImage || config.seo?.ogImage || defaultOgImage,
    ogTitle: homeOverride.ogTitle || homeOverride.metaTitle || homeDefaultTitle,
    ogDescription: homeOverride.ogDescription || homeOverride.metaDescription || homeDefaultDesc,
    robots: homeOverride.robots || config.seo?.robots || "index, follow",
    schemaType: homeOverride.schemaType || config.seo?.schemaType || "LocalBusiness",
    twitterCard: homeOverride.twitterCard || "summary_large_image",
    lastModified: homeOverride.lastModified || config.cloudflare?.lastDeployedAt
  });

  // 2. About Us Page (Hakkımızda)
  const aboutOverride = overrides["page-about"] || {};
  const aboutDefaultTitle = `Hakkımızda | ${companyName} Kurumsal`;
  const aboutDefaultDesc = config.about?.content 
    ? `${config.about.content.slice(0, 140)}...` 
    : `${companyName} kurumsal profili, vizyonumuz ve deneyimli kadromuz hakkında bilgi edinin.`;
  const aboutCanonical = aboutOverride.canonicalUrl || `${baseUrl}/hakkimizda.html`;

  pages.push({
    pageId: "page-about",
    pageTitle: "Hakkımızda",
    pageType: "about",
    slug: "hakkimizda.html",
    fullUrl: `${baseUrl}/hakkimizda.html`,
    metaTitle: aboutOverride.metaTitle || aboutDefaultTitle,
    metaDescription: aboutOverride.metaDescription || aboutDefaultDesc,
    keywords: aboutOverride.keywords || `${companyName} hakkında, vizyon, misyon, ${city} ${sector}`,
    canonicalUrl: aboutCanonical,
    isCustomCanonical: aboutOverride.isCustomCanonical ?? false,
    ogImage: aboutOverride.ogImage || config.about?.image || defaultOgImage,
    ogTitle: aboutOverride.ogTitle || aboutOverride.metaTitle || aboutDefaultTitle,
    ogDescription: aboutOverride.ogDescription || aboutOverride.metaDescription || aboutDefaultDesc,
    robots: aboutOverride.robots || "index, follow",
    schemaType: aboutOverride.schemaType || "AboutPage",
    twitterCard: aboutOverride.twitterCard || "summary_large_image",
    lastModified: aboutOverride.lastModified
  });

  // 3. Services Index Page (Tüm Hizmetlerimiz)
  if (config.services?.enabled !== false && config.services?.items && config.services.items.length > 0) {
    const srvIndexOverride = overrides["page-services-index"] || {};
    const srvIndexDefaultTitle = `Tüm Hizmetlerimiz & Fiyat Tarifesi | ${companyName}`;
    const srvIndexDefaultDesc = `${companyName} tarafından ${city} ve çevresinde sunulan tüm ${sector.toLowerCase()} hizmetleri ve detaylı bilgiler.`;
    const srvIndexCanonical = srvIndexOverride.canonicalUrl || `${baseUrl}/hizmetler.html`;

    pages.push({
      pageId: "page-services-index",
      pageTitle: "Tüm Hizmetlerimiz (Dizin)",
      pageType: "services-index",
      slug: "hizmetler.html",
      fullUrl: `${baseUrl}/hizmetler.html`,
      metaTitle: srvIndexOverride.metaTitle || srvIndexDefaultTitle,
      metaDescription: srvIndexOverride.metaDescription || srvIndexDefaultDesc,
      keywords: srvIndexOverride.keywords || `${sector} hizmetleri, ${city} ${sector.toLowerCase()}, fiyat listesi`,
      canonicalUrl: srvIndexCanonical,
      isCustomCanonical: srvIndexOverride.isCustomCanonical ?? false,
      ogImage: srvIndexOverride.ogImage || defaultOgImage,
      ogTitle: srvIndexOverride.ogTitle || srvIndexOverride.metaTitle || srvIndexDefaultTitle,
      ogDescription: srvIndexOverride.ogDescription || srvIndexOverride.metaDescription || srvIndexDefaultDesc,
      robots: srvIndexOverride.robots || "index, follow",
      schemaType: srvIndexOverride.schemaType || "CollectionPage",
      twitterCard: srvIndexOverride.twitterCard || "summary_large_image",
      lastModified: srvIndexOverride.lastModified
    });
  }

  // 4. Individual Services (Bireysel Hizmet Sayfaları)
  if (config.services?.items && config.services.items.length > 0) {
    config.services.items.forEach((srv) => {
      const pageId = `service-${srv.id}`;
      const srvOverride = overrides[pageId] || {};
      const slug = srv.slug || slugifyService(srv.title);
      const relativeUrl = `hizmetler/${slug}`;
      const fullUrl = `${baseUrl}/${relativeUrl}`;
      
      const srvTitle = srvOverride.metaTitle || srv.seoTitle || `${srv.title} | ${city} ${companyName}`;
      const srvDesc = srvOverride.metaDescription || srv.seoDescription || srv.desc || `${city} genelinde ${srv.title.toLowerCase()} hizmeti. 7/24 hızlı servis ve uygun fiyat teklifleri.`;
      const srvKeywords = srvOverride.keywords || srv.seoKeywords || `${srv.title.toLowerCase()}, ${city} ${srv.title.toLowerCase()}, acil servis`;
      const srvCanonical = srvOverride.canonicalUrl || srv.canonicalUrl || fullUrl;
      const srvOgImg = srvOverride.ogImage || srv.ogImage || srv.bannerImage || srv.image || defaultOgImage;

      pages.push({
        pageId,
        pageTitle: `Hizmet: ${srv.title}`,
        pageType: "service",
        slug,
        fullUrl,
        metaTitle: srvTitle,
        metaDescription: srvDesc,
        keywords: srvKeywords,
        canonicalUrl: srvCanonical,
        isCustomCanonical: srvOverride.isCustomCanonical ?? Boolean(srv.canonicalUrl && srv.canonicalUrl !== fullUrl),
        ogImage: srvOgImg,
        ogTitle: srvOverride.ogTitle || srv.ogTitle || srvTitle,
        ogDescription: srvOverride.ogDescription || srv.ogDescription || srvDesc,
        robots: srvOverride.robots || srv.robots || "index, follow",
        schemaType: srvOverride.schemaType || srv.schemaType || "Service",
        twitterCard: srvOverride.twitterCard || "summary_large_image",
        lastModified: srvOverride.lastModified
      });
    });
  }

  // 5. Products Index & Individual Products (Katalog & Ürünler)
  if (config.products?.enabled !== false && config.products?.items && config.products.items.length > 0) {
    const prodIndexOverride = overrides["page-catalog-index"] || {};
    const prodIndexTitle = `Ürün Kataloğu & Fiyatlar | ${companyName}`;
    const prodIndexDesc = `${companyName} orijinal ürün kataloğu, güncel fiyatlar ve teknik özellikler.`;
    const prodIndexCanonical = prodIndexOverride.canonicalUrl || `${baseUrl}/urunler.html`;

    pages.push({
      pageId: "page-catalog-index",
      pageTitle: "Ürün Kataloğu (Dizin)",
      pageType: "catalog-index",
      slug: "urunler.html",
      fullUrl: `${baseUrl}/urunler.html`,
      metaTitle: prodIndexOverride.metaTitle || prodIndexTitle,
      metaDescription: prodIndexOverride.metaDescription || prodIndexDesc,
      keywords: prodIndexOverride.keywords || `ürün kataloğu, fiyat listesi, ${companyName}`,
      canonicalUrl: prodIndexCanonical,
      isCustomCanonical: prodIndexOverride.isCustomCanonical ?? false,
      ogImage: prodIndexOverride.ogImage || defaultOgImage,
      ogTitle: prodIndexOverride.ogTitle || prodIndexOverride.metaTitle || prodIndexTitle,
      ogDescription: prodIndexOverride.ogDescription || prodIndexOverride.metaDescription || prodIndexDesc,
      robots: prodIndexOverride.robots || "index, follow",
      schemaType: prodIndexOverride.schemaType || "CollectionPage",
      twitterCard: prodIndexOverride.twitterCard || "summary_large_image",
      lastModified: prodIndexOverride.lastModified
    });

    // Individual Products
    config.products.items.forEach((prod) => {
      const pageId = `product-${prod.id}`;
      const prodOverride = overrides[pageId] || {};
      const slug = prod.slug || slugifyProduct(prod.title);
      const relativeUrl = `urunler/${slug}`;
      const fullUrl = `${baseUrl}/${relativeUrl}`;

      const prodTitle = prodOverride.metaTitle || prod.seoTitle || `${prod.title} Fiyatı & Özellikleri | ${companyName}`;
      const prodDesc = prodOverride.metaDescription || prod.seoDescription || prod.shortDescription || prod.description?.replace(/<[^>]*>?/gm, '').slice(0, 150) || `${prod.title} hakkında detaylı bilgi, teknik özellikler ve fiyat avantajları.`;
      const prodKeywords = prodOverride.keywords || prod.seoKeywords || `${prod.title.toLowerCase()}, satın al, fiyatı, ${companyName}`;
      const prodCanonical = prodOverride.canonicalUrl || prod.canonicalUrl || fullUrl;
      const prodOgImg = prodOverride.ogImage || prod.ogImage || prod.featuredImage || prod.image || prod.images?.[0] || defaultOgImage;

      pages.push({
        pageId,
        pageTitle: `Ürün: ${prod.title}`,
        pageType: "product",
        slug,
        fullUrl,
        metaTitle: prodTitle,
        metaDescription: prodDesc,
        keywords: prodKeywords,
        canonicalUrl: prodCanonical,
        isCustomCanonical: prodOverride.isCustomCanonical ?? Boolean(prod.canonicalUrl && prod.canonicalUrl !== fullUrl),
        ogImage: prodOgImg,
        ogTitle: prodOverride.ogTitle || prod.ogTitle || prodTitle,
        ogDescription: prodOverride.ogDescription || prod.ogDescription || prodDesc,
        robots: prodOverride.robots || prod.robots || "index, follow",
        schemaType: prodOverride.schemaType || prod.schemaType || "Product",
        twitterCard: prodOverride.twitterCard || "summary_large_image",
        lastModified: prodOverride.lastModified
      });
    });
  }

  // 6. Blog Index & Blog Posts
  if (config.blog?.enabled !== false && config.blog?.items && config.blog.items.length > 0) {
    const blogIndexOverride = overrides["page-blog-index"] || {};
    const blogIndexTitle = `Blog & Sektörel Rehberler | ${companyName}`;
    const blogIndexDesc = `${sector} hakkında uzman ipuçları, rehberler ve güncel sektörel haberler.`;
    const blogIndexCanonical = blogIndexOverride.canonicalUrl || `${baseUrl}/blog.html`;

    pages.push({
      pageId: "page-blog-index",
      pageTitle: "Blog & Makaleler (Dizin)",
      pageType: "blog-index",
      slug: "blog.html",
      fullUrl: `${baseUrl}/blog.html`,
      metaTitle: blogIndexOverride.metaTitle || blogIndexTitle,
      metaDescription: blogIndexOverride.metaDescription || blogIndexDesc,
      keywords: blogIndexOverride.keywords || `blog, makaleler, rehberler, ${sector.toLowerCase()}`,
      canonicalUrl: blogIndexCanonical,
      isCustomCanonical: blogIndexOverride.isCustomCanonical ?? false,
      ogImage: blogIndexOverride.ogImage || defaultOgImage,
      ogTitle: blogIndexOverride.ogTitle || blogIndexOverride.metaTitle || blogIndexTitle,
      ogDescription: blogIndexOverride.ogDescription || blogIndexOverride.metaDescription || blogIndexDesc,
      robots: blogIndexOverride.robots || "index, follow",
      schemaType: blogIndexOverride.schemaType || "Blog",
      twitterCard: blogIndexOverride.twitterCard || "summary_large_image",
      lastModified: blogIndexOverride.lastModified
    });

    // Individual Blog Posts
    config.blog.items.forEach((post) => {
      const pageId = `blog-${post.id}`;
      const postOverride = overrides[pageId] || {};
      const slug = post.slug || slugifyBlog(post.title);
      const relativeUrl = `blog/${slug}`;
      const fullUrl = `${baseUrl}/${relativeUrl}`;

      const postTitle = postOverride.metaTitle || post.seoTitle || `${post.title} | ${companyName} Blog`;
      const postDesc = postOverride.metaDescription || post.seoDescription || post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) || `${post.title} hakkında detaylı inceleme ve uzman görüşleri.`;
      const postKeywords = postOverride.keywords || post.seoKeywords || post.tags?.join(", ") || `${post.title.toLowerCase()}, rehber, ipuçları`;
      const postCanonical = postOverride.canonicalUrl || post.canonicalUrl || fullUrl;
      const postOgImg = postOverride.ogImage || post.ogImage || post.coverImage || post.image || defaultOgImage;

      pages.push({
        pageId,
        pageTitle: `Blog: ${post.title}`,
        pageType: "blog-post",
        slug,
        fullUrl,
        metaTitle: postTitle,
        metaDescription: postDesc,
        keywords: postKeywords,
        canonicalUrl: postCanonical,
        isCustomCanonical: postOverride.isCustomCanonical ?? Boolean(post.canonicalUrl && post.canonicalUrl !== fullUrl),
        ogImage: postOgImg,
        ogTitle: postOverride.ogTitle || post.ogTitle || postTitle,
        ogDescription: postOverride.ogDescription || post.ogDescription || postDesc,
        robots: postOverride.robots || post.robots || "index, follow",
        schemaType: postOverride.schemaType || post.schemaType || "Article",
        twitterCard: postOverride.twitterCard || "summary_large_image",
        lastModified: postOverride.lastModified
      });
    });
  }

  // 7. Custom Pages (Özel Kurumsal Sayfalar)
  if (config.pages && config.pages.length > 0) {
    config.pages.forEach((page) => {
      const pageId = `page-${page.id}`;
      const pageOverride = overrides[pageId] || {};
      const slug = page.slug || page.id;
      const relativeUrl = `${slug}.html`;
      const fullUrl = `${baseUrl}/${relativeUrl}`;

      const customTitle = pageOverride.metaTitle || page.seoTitle || `${page.title} | ${companyName}`;
      const customDesc = pageOverride.metaDescription || page.metaDescription || page.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) || `${companyName} ${page.title} resmi bilgilendirme sayfası.`;
      const customKeywords = pageOverride.keywords || page.seoKeywords || `${page.title.toLowerCase()}, ${companyName}`;
      const customCanonical = pageOverride.canonicalUrl || page.canonicalUrl || fullUrl;
      const customOgImg = pageOverride.ogImage || page.ogImage || page.bannerImage || defaultOgImage;

      pages.push({
        pageId,
        pageTitle: `Sayfa: ${page.title}`,
        pageType: "custom-page",
        slug,
        fullUrl,
        metaTitle: customTitle,
        metaDescription: customDesc,
        keywords: customKeywords,
        canonicalUrl: customCanonical,
        isCustomCanonical: pageOverride.isCustomCanonical ?? Boolean(page.canonicalUrl && page.canonicalUrl !== fullUrl),
        ogImage: customOgImg,
        ogTitle: pageOverride.ogTitle || page.ogTitle || customTitle,
        ogDescription: pageOverride.ogDescription || page.ogDescription || customDesc,
        robots: pageOverride.robots || page.robots || "index, follow",
        schemaType: pageOverride.schemaType || page.schemaType || "WebPage",
        twitterCard: pageOverride.twitterCard || "summary_large_image",
        lastModified: pageOverride.lastModified
      });
    });
  }

  // 8. Contact Page (İletişim)
  const contactOverride = overrides["page-contact"] || {};
  const contactDefaultTitle = `İletişim & Konum Bilgileri | ${companyName}`;
  const contactDefaultDesc = `${companyName} iletişim numaraları, ${city} ofis adresi, çalışma saatleri ve WhatsApp destek hattı.`;
  const contactCanonical = contactOverride.canonicalUrl || `${baseUrl}/iletisim.html`;

  pages.push({
    pageId: "page-contact",
    pageTitle: "İletişim & Konum",
    pageType: "contact",
    slug: "iletisim.html",
    fullUrl: `${baseUrl}/iletisim.html`,
    metaTitle: contactOverride.metaTitle || contactDefaultTitle,
    metaDescription: contactOverride.metaDescription || contactDefaultDesc,
    keywords: contactOverride.keywords || `iletişim, telefon, adres, konum, ${companyName}, ${city}`,
    canonicalUrl: contactCanonical,
    isCustomCanonical: contactOverride.isCustomCanonical ?? false,
    ogImage: contactOverride.ogImage || defaultOgImage,
    ogTitle: contactOverride.ogTitle || contactOverride.metaTitle || contactDefaultTitle,
    ogDescription: contactOverride.ogDescription || contactOverride.metaDescription || contactDefaultDesc,
    robots: contactOverride.robots || "index, follow",
    schemaType: contactOverride.schemaType || "ContactPage",
    twitterCard: contactOverride.twitterCard || "summary_large_image",
    lastModified: contactOverride.lastModified
  });

  return pages;
}

/**
 * Updates a specific page's SEO metadata deeply in SiteConfig
 */
export function updatePageSeoMeta(
  config: SiteConfig,
  pageId: string,
  updated: Partial<IndividualPageSeoMeta>
): SiteConfig {
  const next: SiteConfig = JSON.parse(JSON.stringify(config));
  if (!next.pageSeoOverrides) {
    next.pageSeoOverrides = {};
  }

  // Store in overrides registry
  const existingOverride = next.pageSeoOverrides[pageId] || {};
  next.pageSeoOverrides[pageId] = {
    ...existingOverride,
    ...(updated.canonicalUrl !== undefined && { canonicalUrl: updated.canonicalUrl }),
    ...(updated.isCustomCanonical !== undefined && { isCustomCanonical: updated.isCustomCanonical }),
    ...(updated.metaTitle !== undefined && { metaTitle: updated.metaTitle }),
    ...(updated.metaDescription !== undefined && { metaDescription: updated.metaDescription }),
    ...(updated.keywords !== undefined && { keywords: updated.keywords }),
    ...(updated.ogImage !== undefined && { ogImage: updated.ogImage }),
    ...(updated.ogTitle !== undefined && { ogTitle: updated.ogTitle }),
    ...(updated.ogDescription !== undefined && { ogDescription: updated.ogDescription }),
    ...(updated.robots !== undefined && { robots: updated.robots }),
    ...(updated.schemaType !== undefined && { schemaType: updated.schemaType }),
    ...(updated.twitterCard !== undefined && { twitterCard: updated.twitterCard }),
    lastModified: new Date().toISOString()
  };

  // Sync back to target entity
  if (pageId === "page-home") {
    if (!next.seo) {
      next.seo = {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        author: next.companyName || "",
        schemaType: "LocalBusiness"
      };
    }
    if (updated.metaTitle) next.seo.metaTitle = updated.metaTitle;
    if (updated.metaDescription) next.seo.metaDescription = updated.metaDescription;
    if (updated.keywords) next.seo.keywords = updated.keywords;
    if (updated.canonicalUrl) next.seo.canonicalUrl = updated.canonicalUrl;
    if (updated.ogImage) next.seo.ogImage = updated.ogImage;
    if (updated.robots) next.seo.robots = updated.robots;
    if (updated.schemaType) next.seo.schemaType = updated.schemaType;
  } else if (pageId.startsWith("service-")) {
    const id = pageId.replace("service-", "");
    const srv = next.services?.items?.find(s => s.id === id);
    if (srv) {
      if (updated.metaTitle) srv.seoTitle = updated.metaTitle;
      if (updated.metaDescription) srv.seoDescription = updated.metaDescription;
      if (updated.keywords) srv.seoKeywords = updated.keywords;
      if (updated.canonicalUrl) srv.canonicalUrl = updated.canonicalUrl;
      if (updated.ogImage) srv.ogImage = updated.ogImage;
      if (updated.ogTitle) srv.ogTitle = updated.ogTitle;
      if (updated.ogDescription) srv.ogDescription = updated.ogDescription;
      if (updated.robots) srv.robots = updated.robots;
      if (updated.schemaType) srv.schemaType = updated.schemaType;
    }
  } else if (pageId.startsWith("product-")) {
    const id = pageId.replace("product-", "");
    const prod = next.products?.items?.find(p => p.id === id);
    if (prod) {
      if (updated.metaTitle) prod.seoTitle = updated.metaTitle;
      if (updated.metaDescription) prod.seoDescription = updated.metaDescription;
      if (updated.keywords) prod.seoKeywords = updated.keywords;
      if (updated.canonicalUrl) prod.canonicalUrl = updated.canonicalUrl;
      if (updated.ogImage) prod.ogImage = updated.ogImage;
      if (updated.ogTitle) prod.ogTitle = updated.ogTitle;
      if (updated.ogDescription) prod.ogDescription = updated.ogDescription;
      if (updated.robots) prod.robots = updated.robots;
      if (updated.schemaType) prod.schemaType = updated.schemaType;
    }
  } else if (pageId.startsWith("blog-")) {
    const id = pageId.replace("blog-", "");
    const post = next.blog?.items?.find(b => b.id === id);
    if (post) {
      if (updated.metaTitle) post.seoTitle = updated.metaTitle;
      if (updated.metaDescription) post.seoDescription = updated.metaDescription;
      if (updated.keywords) post.seoKeywords = updated.keywords;
      if (updated.canonicalUrl) post.canonicalUrl = updated.canonicalUrl;
      if (updated.ogImage) post.ogImage = updated.ogImage;
      if (updated.ogTitle) post.ogTitle = updated.ogTitle;
      if (updated.ogDescription) post.ogDescription = updated.ogDescription;
      if (updated.robots) post.robots = updated.robots;
      if (updated.schemaType) post.schemaType = updated.schemaType;
    }
  } else if (pageId.startsWith("page-") && pageId !== "page-home" && pageId !== "page-about" && pageId !== "page-contact" && pageId !== "page-services-index" && pageId !== "page-catalog-index" && pageId !== "page-blog-index") {
    const id = pageId.replace("page-", "");
    const customPage = next.pages?.find(p => p.id === id);
    if (customPage) {
      if (updated.metaTitle) customPage.seoTitle = updated.metaTitle;
      if (updated.metaDescription) customPage.metaDescription = updated.metaDescription;
      if (updated.keywords) customPage.seoKeywords = updated.keywords;
      if (updated.canonicalUrl) customPage.canonicalUrl = updated.canonicalUrl;
      if (updated.ogImage) customPage.ogImage = updated.ogImage;
      if (updated.ogTitle) customPage.ogTitle = updated.ogTitle;
      if (updated.ogDescription) customPage.ogDescription = updated.ogDescription;
      if (updated.robots) customPage.robots = updated.robots;
      if (updated.schemaType) customPage.schemaType = updated.schemaType;
    }
  }

  return next;
}

/**
 * Calculates page-level SEO Health Score and quality insights
 */
export function calculatePageSeoQuality(meta: IndividualPageSeoMeta): {
  score: number;
  grade: "A+" | "A" | "B" | "C";
  status: "Mükemmel" | "İyi" | "Geliştirilmeli" | "Kritik Eksik";
  colorClass: string;
  badgeClass: string;
  issues: string[];
  passedChecks: string[];
} {
  let score = 0;
  const issues: string[] = [];
  const passedChecks: string[] = [];

  // Title Audit (Max 25 pts)
  const titleLen = meta.metaTitle?.trim().length || 0;
  if (titleLen >= 45 && titleLen <= 65) {
    score += 25;
    passedChecks.push(`Meta Başlık uzunluğu kusursuz (${titleLen} karakter).`);
  } else if (titleLen >= 30 && titleLen < 45) {
    score += 18;
    issues.push(`Meta Başlık biraz kısa (${titleLen} karakter). 50-60 karakter önerilir.`);
  } else if (titleLen > 65) {
    score += 15;
    issues.push(`Meta Başlık Google SERP'te kesilebilir (${titleLen} karakter). En fazla 60 karakter idealdir.`);
  } else {
    issues.push("Meta Başlık eksik veya çok kısa!");
  }

  // Description Audit (Max 25 pts)
  const descLen = meta.metaDescription?.trim().length || 0;
  if (descLen >= 120 && descLen <= 165) {
    score += 25;
    passedChecks.push(`Meta Açıklama Google snippet standardında (${descLen} karakter).`);
  } else if (descLen >= 80 && descLen < 120) {
    score += 17;
    issues.push(`Meta Açıklama biraz kısa (${descLen} karakter). 140-160 karakter tıklama oranını artırır.`);
  } else if (descLen > 165) {
    score += 15;
    issues.push(`Meta Açıklama mobilde kesilebilir (${descLen} karakter).`);
  } else {
    issues.push("Meta Açıklama eksik veya 80 karakterden az!");
  }

  // Canonical URL Audit (Max 20 pts)
  if (meta.canonicalUrl && (meta.canonicalUrl.startsWith("http://") || meta.canonicalUrl.startsWith("https://"))) {
    score += 20;
    passedChecks.push(`Geçerli Canonical URL tanımlı (<link rel="canonical"> aktif).`);
  } else {
    issues.push("Canonical URL tanımlanmamış veya geçersiz.");
  }

  // Open Graph Image Audit (Max 20 pts)
  if (meta.ogImage && meta.ogImage.length > 10) {
    score += 20;
    passedChecks.push(`Sosyal paylaşım Open Graph görseli tanımlı (og:image).`);
  } else {
    issues.push("Open Graph paylaşım görseli bulunamadı (WhatsApp/Facebook zengin kartları boş kalabilir).");
  }

  // Keywords & Robots Audit (Max 10 pts)
  const kwCount = meta.keywords ? meta.keywords.split(",").filter(k => k.trim().length > 0).length : 0;
  if (kwCount >= 2 && meta.robots) {
    score += 10;
    passedChecks.push(`${kwCount} adet anahtar kelime ve indeksleme izni (${meta.robots}) aktif.`);
  } else if (meta.robots) {
    score += 6;
    issues.push("Hedeflenen anahtar kelimeler eksik.");
  } else {
    issues.push("Robots ve anahtar kelime etiketleri eksik.");
  }

  let grade: "A+" | "A" | "B" | "C" = "B";
  let status: "Mükemmel" | "İyi" | "Geliştirilmeli" | "Kritik Eksik" = "Geliştirilmeli";
  let colorClass = "text-amber-600";
  let badgeClass = "bg-amber-100 text-amber-900 border-amber-300";

  if (score >= 90) {
    grade = "A+";
    status = "Mükemmel";
    colorClass = "text-emerald-600";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
  } else if (score >= 75) {
    grade = "A";
    status = "İyi";
    colorClass = "text-blue-600";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
  } else if (score >= 50) {
    grade = "B";
    status = "Geliştirilmeli";
    colorClass = "text-amber-600";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
  } else {
    grade = "C";
    status = "Kritik Eksik";
    colorClass = "text-rose-600";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
  }

  return {
    score,
    grade,
    status,
    colorClass,
    badgeClass,
    issues,
    passedChecks
  };
}

/**
 * Generates AI-optimized SEO metadata for an individual page
 */
export function generateAiPageSeoSuggestions(
  config: SiteConfig,
  page: IndividualPageSeoMeta
): Partial<IndividualPageSeoMeta> {
  const companyName = config.companyName || "HızlıWeb İşletmesi";
  const city = config.city || "İstanbul";
  const sector = config.sector || "Kurumsal Hizmet";
  const baseUrl = getSiteBaseUrl(config);

  const cleanTitle = page.pageTitle.replace(/^(Hizmet|Ürün|Blog|Sayfa):\s*/i, "").trim();

  let suggestedTitle = `${cleanTitle} - ${city} 7/24 ${companyName}`;
  let suggestedDesc = `${city} genelinde ${cleanTitle.toLowerCase()} hizmeti: ${companyName} güvencesiyle 15 dakikada hızlı servis, garantili uzman kadro ve uygun fiyat teklifleri. Hemen arayın!`;
  let suggestedKeywords = `${cleanTitle.toLowerCase()}, ${city} ${cleanTitle.toLowerCase()}, en yakın ${cleanTitle.toLowerCase()}, ${companyName}`;
  let suggestedSchema = "WebPage";

  if (page.pageType === "home") {
    suggestedTitle = `${companyName} - ${city} 7/24 ${sector} & Profesyonel Hizmetler`;
    suggestedDesc = `${city} genelinde 7/24 ${sector.toLowerCase()} hizmetleri. ${companyName} ile sabit fiyat garantisi, modern altyapı ve anında konumunuza ulaşım. Detaylı bilgi ve teklif için tıklayın!`;
    suggestedKeywords = `${city} ${sector.toLowerCase()}, acil ${sector.toLowerCase()}, 7/24 oto kurtarıcı, ${companyName}`;
    suggestedSchema = "LocalBusiness";
  } else if (page.pageType === "service") {
    suggestedTitle = `${cleanTitle} - ${city} 7/24 Profesyonel Hizmet | ${companyName}`;
    suggestedDesc = `${city} ${cleanTitle.toLowerCase()} hizmeti: Uzman teknik kadro, sabit fiyat garantisi ve 15 dakikada anında varış desteği. Bilgi ve teklif almak için hemen arayın!`;
    suggestedKeywords = `${cleanTitle.toLowerCase()}, ${city} ${cleanTitle.toLowerCase()}, acil ${cleanTitle.toLowerCase()}, ${companyName}`;
    suggestedSchema = "Service";
  } else if (page.pageType === "product") {
    suggestedTitle = `${cleanTitle} Fiyatı & Satın Al | ${companyName} Garantisi`;
    suggestedDesc = `${cleanTitle} özellikleri, kullanıcı yorumları ve güncel fiyat listesi. ${companyName} resmi güvencesiyle hızlı kargo veya aynı gün teslimat avantajı.`;
    suggestedKeywords = `${cleanTitle.toLowerCase()}, ${cleanTitle.toLowerCase()} fiyatı, ${city} ${cleanTitle.toLowerCase()}, satın al, ${companyName}`;
    suggestedSchema = "Product";
  } else if (page.pageType === "blog-post") {
    suggestedTitle = `${cleanTitle} - Güncel Rehber & Tavsiyeler | ${companyName}`;
    suggestedDesc = `${cleanTitle} hakkında bilmeniz gereken her şey: Sektörel ipuçları, uzman değerlendirmeleri ve adım adım bilgilendirici rehberimiz.`;
    suggestedKeywords = `${cleanTitle.toLowerCase()}, ${cleanTitle.toLowerCase()} rehberi, ${sector.toLowerCase()} ipuçları`;
    suggestedSchema = "Article";
  } else if (page.pageType === "about") {
    suggestedTitle = `Hakkımızda - ${companyName} ${city} Kurumsal Tarihçe`;
    suggestedDesc = `${companyName} kimdir? ${city} ve çevre bölgelerde ${sector.toLowerCase()} alanındaki tecrübemiz, vizyonumuz ve uzman kadromuz hakkında detaylı bilgi.`;
    suggestedKeywords = `${companyName} hakkında, vizyon, misyon, ${city} ${sector.toLowerCase()}`;
    suggestedSchema = "AboutPage";
  } else if (page.pageType === "contact") {
    suggestedTitle = `İletişim & Konum Bilgileri - ${companyName} ${city} 7/24`;
    suggestedDesc = `${companyName} 7/24 telefon numarası, WhatsApp destek hattı ve ${city} adres konumu. Hemen iletişime geçin ve anında yol yardım alın.`;
    suggestedKeywords = `iletişim, telefon, whatsapp, adres, ${city}, ${companyName}`;
    suggestedSchema = "ContactPage";
  }

  // Ensure title length is 50-60
  if (suggestedTitle.length > 65) {
    suggestedTitle = suggestedTitle.slice(0, 62).trim() + "...";
  }
  // Ensure description length is 140-160
  if (suggestedDesc.length > 165) {
    suggestedDesc = suggestedDesc.slice(0, 160).trim() + "...";
  }

  return {
    metaTitle: suggestedTitle,
    metaDescription: suggestedDesc,
    keywords: suggestedKeywords,
    canonicalUrl: page.canonicalUrl || page.fullUrl,
    ogTitle: suggestedTitle,
    ogDescription: suggestedDesc,
    robots: "index, follow",
    schemaType: suggestedSchema
  };
}

/**
 * Batch auto-fills missing SEO metadata for all under-optimized pages
 */
export function batchApplySeoFixes(config: SiteConfig): {
  updatedConfig: SiteConfig;
  fixedCount: number;
} {
  let updated = JSON.parse(JSON.stringify(config)) as SiteConfig;
  const allPages = getAllPagesSeoMeta(updated);
  let fixedCount = 0;

  allPages.forEach(p => {
    const quality = calculatePageSeoQuality(p);
    if (quality.score < 80) {
      const suggestions = generateAiPageSeoSuggestions(updated, p);
      updated = updatePageSeoMeta(updated, p.pageId, suggestions);
      fixedCount++;
    }
  });

  return {
    updatedConfig: updated,
    fixedCount
  };
}
