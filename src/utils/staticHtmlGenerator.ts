import { SiteConfig, HeroSlide, GeneratedPageFile, ServiceItem, BlogPostItem, ProductItem, CustomPageItem } from "../types";
import { getEffectiveTaxConfig, calculateProductTax } from "./taxUtils";
import { getEffectiveLanguageConfig } from "./languageUtils";
import { generateCompositeSchemaGraph, getEffectiveSchemaConfig } from "./schemaOrgGenerator";
import { generateStaticCss } from "./staticCssGenerator";
export { generateStaticSite } from "./generator";

function renderCommonHead(
  config: SiteConfig,
  pageTitle: string,
  pageDesc: string,
  pageKeywords?: string,
  ogImage?: string,
  customSchema?: object,
  pageCanonicalUrl?: string,
  pageRobots?: string,
  pageOgTitle?: string,
  pageOgDescription?: string,
  pageType: "home" | "about" | "service" | "product" | "blog" | "contact" | "page" | "catalog" = "home",
  pageContext?: {
    product?: ProductItem;
    breadcrumbItems?: { name: string; url: string }[];
  }
): string {
  const pColor = config.palette.primary;
  const pDark = config.palette.primaryDark;
  const pSecondary = config.palette.secondary;
  const pAccent = config.palette.accent;
  const pText = config.palette.text;

  const resolvedOgImage = ogImage || config.seo?.ogImage || config.hero.bgImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341';
  const siteUrl = config.cloudflare?.customDomain ? `https://${config.cloudflare.customDomain}` : (config.cloudflare?.deployedUrl || `https://${config.cloudflare?.subdomain || 'sirket'}.hizliweb.site`);

  const effectiveRobots = pageRobots || config.seo?.robots || 'index, follow';
  const effectiveCanonical = pageCanonicalUrl || config.seo?.canonicalUrl;
  const effectiveOgTitle = pageOgTitle || pageTitle;
  const effectiveOgDesc = pageOgDescription || pageDesc;

  // Schema.org Structured Data: Uses customSchema if explicitly provided, else automatically generates full schema graph
  const schemaConfig = getEffectiveSchemaConfig(config);
  const resolvedSchema = customSchema !== undefined 
    ? customSchema 
    : (schemaConfig.enabled 
        ? generateCompositeSchemaGraph(config, pageType, {
            pageTitle,
            pageDescription: pageDesc,
            product: pageContext?.product,
            breadcrumbItems: pageContext?.breadcrumbItems
          }) 
        : null);

  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">
  <meta name="keywords" content="${pageKeywords || config.seo?.keywords || `${config.companyName}, ${config.sector}, ${config.city}`}">
  <meta name="author" content="${config.seo?.author || config.companyName}">
  <meta name="robots" content="${effectiveRobots}">
  ${effectiveCanonical ? `<link rel="canonical" href="${effectiveCanonical}">` : ''}
  ${config.seo?.googleSearchConsoleTag ? `<meta name="google-site-verification" content="${config.seo.googleSearchConsoleTag}">` : ''}
  
  <!-- Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${effectiveOgTitle}">
  <meta property="og:description" content="${effectiveOgDesc}">
  <meta property="og:image" content="${resolvedOgImage}">
  <meta property="og:site_name" content="${config.companyName}">
  <meta property="og:url" content="${effectiveCanonical || siteUrl}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${effectiveOgTitle}">
  <meta name="twitter:description" content="${effectiveOgDesc}">
  <meta name="twitter:image" content="${resolvedOgImage}">
  ${config.seo?.twitterHandle ? `<meta name="twitter:site" content="${config.seo.twitterHandle}">` : ''}

  <!-- HTTP Güvenlik & OWASP Kalkan Meta Etiketleri -->
  ${config.securityConfig?.enableCsp ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob: 'unsafe-inline';">` : ''}
  ${config.securityConfig?.enableContentTypeNosniff ? `<meta http-equiv="X-Content-Type-Options" content="nosniff">` : ''}
  ${config.securityConfig?.enableReferrerPolicy ? `<meta name="referrer" content="strict-origin-when-cross-origin">` : ''}
  ${config.securityConfig?.enablePermissionsPolicy ? `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">` : ''}
  
  <!-- Global Anycast Edge & High Speed Static Assets -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- JetKur Pure Static CSS Pipeline (Zero Runtime Framework Dependency) -->
  <link rel="stylesheet" href="assets/site.css">
  <style id="jetkur-static-css">
${generateStaticCss(config)}
  </style>

  <!-- Schema.org JSON-LD (Automatic Structured Business Data) -->
  ${resolvedSchema ? `<script type="application/ld+json">
${JSON.stringify(resolvedSchema, null, 2)}
  </script>` : ''}
  `;
}

function resolvePageSeo(
  config: SiteConfig,
  pageId: string,
  fallbackTitle: string,
  fallbackDesc: string,
  fallbackKeywords?: string,
  fallbackOgImage?: string,
  fallbackCanonical?: string,
  fallbackRobots?: string
) {
  const override = config.pageSeoOverrides?.[pageId] || {};
  const metaTitle = override.metaTitle || fallbackTitle;
  const metaDescription = override.metaDescription || fallbackDesc;
  const keywords = override.keywords || fallbackKeywords || config.seo?.keywords;
  const ogImage = override.ogImage || fallbackOgImage || config.seo?.ogImage;
  const canonicalUrl = override.canonicalUrl || fallbackCanonical || config.seo?.canonicalUrl;
  const robots = override.robots || fallbackRobots || config.seo?.robots || 'index, follow';
  const ogTitle = override.ogTitle || override.metaTitle || metaTitle;
  const ogDescription = override.ogDescription || override.metaDescription || metaDescription;

  return {
    metaTitle,
    metaDescription,
    keywords,
    ogImage,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription
  };
}

function renderLogo(config: SiteConfig): string {
  const height = config.header?.logoHeight || 44;
  const width = config.header?.logoWidth ? `${config.header.logoWidth}px` : 'auto';
  const aspect = config.header?.logoAspectRatio && config.header.logoAspectRatio !== 'auto' 
    ? `aspect-ratio: ${config.header.logoAspectRatio};` 
    : '';
  const fit = config.header?.logoObjectFit || 'contain';

  if (config.header?.logoType === "image" && config.header?.logoImage) {
    return `<img src="${config.header.logoImage}" alt="${config.companyName}" style="height: ${height}px; width: ${width}; max-width: 240px; ${aspect} object-fit: ${fit};" class="shrink-0">`;
  }
  return `
    <div class="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
      ${config.companyName.charAt(0)}
    </div>
  `;
}

function getHref(config: SiteConfig, target: string): string {
  const isMulti = config.siteType === "multi-page";
  if (!isMulti) {
    if (target === "home") return "#";
    return `#${target}`;
  }
  
  // Multi-page paths
  switch (target) {
    case "home":
      return "index.html";
    case "about":
      return "kurumsal.html";
    case "services":
      return "hizmetler.html";
    case "catalog":
      return "katalog.html";
    case "gallery":
      return "index.html#gallery";
    case "blog":
      return "blog.html";
    case "contact":
      return "iletisim.html";
    default:
      if (target.startsWith("hizmet-")) return `${target}.html`;
      if (target.startsWith("urun-")) return `${target}.html`;
      if (target.startsWith("blog-")) return `${target}.html`;
      if (target.startsWith("sayfa-")) return `${target}.html`;
      return `sayfa-${target}.html`;
  }
}

function renderHeader(config: SiteConfig, activeKey: string): string {
  const isMulti = config.siteType === "multi-page";
  const navItems = (config.header?.navItems || [
    { id: "nav-home", label: "Ana Sayfa", target: "home", visible: true, order: 1 },
    { id: "nav-about", label: "Kurumsal", target: "about", visible: true, order: 2 },
    { id: "nav-services", label: "Hizmetlerimiz", target: "services", visible: true, order: 3 },
    { id: "nav-catalog", label: "Ürün Kataloğu", target: "catalog", visible: true, order: 4 },
    { id: "nav-blog", label: "Blog", target: "blog", visible: true, order: 5 },
    { id: "nav-contact", label: "İletişim", target: "contact", visible: true, order: 6 }
  ]).filter(n => n.visible).sort((a, b) => a.order - b.order);

  const homeHref = isMulti ? "index.html" : "#";

  return `
  <!-- Top Fast Contact Bar (Mobile-Responsive) -->
  <div class="bg-slate-900 text-slate-300 text-xs py-2 px-3 sm:px-4 border-b border-slate-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-2">
      <div class="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
        <span class="flex items-center gap-1">📍 <strong class="truncate max-w-[120px] sm:max-w-none">${config.city || "Türkiye"}</strong></span>
        <span class="hidden md:inline text-slate-400">⏰ ${config.workingHours || "7/24 Kesintisiz Hizmet"}</span>
        <span class="hidden lg:inline text-amber-400 font-bold">⚡ ${isMulti ? 'Çok Sayfalı (Multi-Page)' : 'Tek Sayfa (Landing Page)'} • 0.02s Ultra Hızlı</span>
      </div>
      <div class="flex items-center gap-3 font-semibold text-[11px] sm:text-xs">
        <a href="tel:${config.phone.replace(/\s+/g, '')}" class="text-amber-400 hover:underline flex items-center gap-1 shrink-0 font-bold">
          📞 <span class="hidden xs:inline">${config.phone}</span><span class="xs:hidden">Ara</span>
        </a>
        <a href="mailto:${config.email}" class="hover:text-white hidden sm:inline text-slate-300 truncate max-w-[180px]">
          ✉️ ${config.email}
        </a>
      </div>
    </div>
  </div>

  <!-- Main Navigation Header -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
      
      <!-- Brand Logo & Title (Protected against overflow on mobile) -->
      <a href="${homeHref}" class="flex items-center gap-2.5 sm:gap-3 min-w-0 group" aria-label="${config.companyName} Ana Sayfa">
        ${renderLogo(config)}
        ${(config.header?.logoType === "image" && config.header?.logoImage && !config.header?.showTextAlongsideLogo) ? '' : `
          <div class="min-w-0 max-w-[160px] xs:max-w-[220px] sm:max-w-none">
            <span class="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight block leading-tight truncate">${config.companyName}</span>
            <span class="text-[10px] sm:text-xs text-slate-500 font-medium block truncate">${config.sector}</span>
          </div>
        `}
      </a>

      <!-- Desktop Dynamic Navigation -->
      <nav class="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-slate-700">
        ${navItems.map((item) => {
          const href = getHref(config, item.target);
          const isActive = activeKey === item.target;
          const i18nKey = item.target === 'home' ? 'navHome' : item.target === 'about' ? 'navAbout' : item.target === 'services' ? 'navServices' : item.target === 'catalog' ? 'navCatalog' : item.target === 'blog' ? 'navBlog' : item.target === 'contact' ? 'navContact' : '';
          return `
            <a href="${href}" class="nav-link transition-colors ${isActive ? 'text-brand font-bold underline underline-offset-8 decoration-2 decoration-brand' : 'hover:text-brand'}" ${i18nKey ? `data-i18n="${i18nKey}"` : ''}>
              ${item.label}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Desktop Header Action Buttons & Social Links -->
      <div class="hidden lg:flex items-center gap-2.5">
        ${renderLanguageSwitcher(config)}
        ${(config.socialMedia?.showInHeader !== false && config.header?.showSocials !== false) ? `
          <div class="hidden xl:flex items-center gap-1.5 mr-1 border-r border-slate-200 pr-2.5">
            ${(config.socialMedia?.instagram || config.footer?.instagram) ? `
              <a href="${config.socialMedia?.instagram || config.footer?.instagram}" target="_blank" rel="noopener noreferrer" title="Instagram" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            ` : ''}
            ${(config.socialMedia?.linkedin || config.footer?.linkedin) ? `
              <a href="${config.socialMedia?.linkedin || config.footer?.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            ` : ''}
            ${(config.socialMedia?.twitter || config.footer?.twitter) ? `
              <a href="${config.socialMedia?.twitter || config.footer?.twitter}" target="_blank" rel="noopener noreferrer" title="Twitter / X" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            ` : ''}
          </div>
        ` : ''}

        ${config.header?.showWhatsappButton !== false ? `
          <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba ${config.companyName}, web sitenizden ulaşıyorum, bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
            <span>💬 ${config.header?.whatsappButtonText || "WhatsApp"}</span>
          </a>
        ` : ''}

        ${config.header?.showPhoneButton !== false ? `
          <a href="tel:${config.phone.replace(/\s+/g, '')}" class="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1">
            <span>📞 ${config.header?.phoneButtonText || "Hemen Ara"}</span>
          </a>
        ` : ''}

        ${config.header?.showQuoteButton ? `
          <a href="${getHref(config, 'contact')}" class="px-3.5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1">
            <span>${config.header?.quoteButtonText || "Teklif Al"}</span>
          </a>
        ` : ''}
      </div>

      <!-- Mobile Right Action Cluster (Touch-Friendly Quick Actions + Hamburger) -->
      <div class="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- Direct Mobile Quick Call -->
        <a href="tel:${config.phone.replace(/\s+/g, '')}" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center text-sm shadow-xs transition-colors" title="Hemen Ara" aria-label="Telefon ile Ara">
          📞
        </a>

        <!-- Direct Mobile WhatsApp -->
        <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba ${config.companyName}, web sitenizden ulaşıyorum, bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-600 flex items-center justify-center text-sm shadow-xs transition-colors" title="WhatsApp" aria-label="WhatsApp ile Mesaj Gönder">
          💬
        </a>

        <!-- Mobile Menu Toggle Button -->
        <button id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all flex items-center gap-1.5 cursor-pointer" aria-label="Menüyü Aç" aria-expanded="false" aria-controls="mobileDrawer">
          <svg id="mobileMenuOpenIcon" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="mobileMenuCloseIcon" class="w-5 h-5 sm:w-6 sm:h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          <span class="text-xs font-bold text-slate-700 hidden xs:inline">Menü</span>
        </button>
      </div>

    </div>
  </header>

  <!-- Off-Canvas Mobile Navigation Drawer & Backdrop -->
  <div id="mobileMenuBackdrop" onclick="closeMobileMenu()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 hidden opacity-0 transition-opacity duration-300" aria-hidden="true"></div>

  <div id="mobileDrawer" class="fixed inset-y-0 right-0 z-50 w-[88vw] max-w-sm bg-white shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out border-l border-slate-200" role="dialog" aria-modal="true" aria-label="Mobil Gezinme Menüsü">
    
    <!-- Drawer Header -->
    <div class="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
      <div class="flex items-center gap-2.5 min-w-0">
        ${renderLogo(config)}
        <div class="min-w-0">
          <div class="font-extrabold text-slate-900 text-sm truncate">${config.companyName}</div>
          <div class="text-[10px] text-slate-500 font-medium truncate">${config.sector}</div>
        </div>
      </div>
      <button onclick="closeMobileMenu()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer" aria-label="Menüyü Kapat">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Drawer Navigation Links (Touch-Optimized & Highlighted) -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1.5 overscroll-contain">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
        Sayfalar & Hizmetler
      </div>
      
      ${navItems.map((item) => {
        const href = getHref(config, item.target);
        const isActive = activeKey === item.target;
        const icon = item.target === 'home' ? '🏠' : item.target === 'about' ? '🏢' : item.target === 'services' ? '🛠️' : item.target === 'catalog' ? '📦' : item.target === 'blog' ? '✍️' : item.target === 'contact' ? '📞' : '📄';
        const i18nKey = item.target === 'home' ? 'navHome' : item.target === 'about' ? 'navAbout' : item.target === 'services' ? 'navServices' : item.target === 'catalog' ? 'navCatalog' : item.target === 'blog' ? 'navBlog' : item.target === 'contact' ? 'navContact' : '';
        return `
          <a href="${href}" onclick="closeMobileMenu()" class="flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
            isActive 
              ? 'bg-brand/10 text-brand font-bold border border-brand/20 shadow-xs' 
              : 'text-slate-700 hover:bg-slate-100 font-semibold'
          }" ${i18nKey ? `data-i18n="${i18nKey}"` : ''}>
            <span class="flex items-center gap-3">
              <span class="text-base">${icon}</span>
              <span class="text-sm">${item.label}</span>
            </span>
            <svg class="w-4 h-4 ${isActive ? 'text-brand' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        `;
      }).join('')}

      <!-- Mobile Quick Action CTAs inside Drawer -->
      <div class="pt-4 mt-2 border-t border-slate-100 space-y-2">
        <a href="tel:${config.phone.replace(/\s+/g, '')}" class="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
          <span>📞 ${config.header?.phoneButtonText || "Hemen Ara"} (${config.phone})</span>
        </a>
        <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba ${config.companyName}, web sitenizden ulaşıyorum, bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
          <span>💬 ${config.header?.whatsappButtonText || "WhatsApp ile Yazın"}</span>
        </a>
        ${config.header?.showQuoteButton ? `
          <a href="${getHref(config, 'contact')}" onclick="closeMobileMenu()" class="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
            <span>📋 ${config.header?.quoteButtonText || "Hemen Teklif Al"}</span>
          </a>
        ` : ''}
      </div>

      <!-- Quick Location & Hours Info inside Drawer -->
      <div class="pt-3 mt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
        <div class="flex items-start gap-2">
          <span class="text-sm">📍</span>
          <div class="flex-1">
            <div class="font-bold text-slate-800">${config.city}</div>
            <div class="text-[11px] text-slate-500">${config.address}</div>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${config.companyName} ${config.address} ${config.city}`)}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-brand hover:underline mt-0.5 inline-block">
              🗺️ Haritada Yol Tarifi Al →
            </a>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
          <span>⏰</span>
          <span>${config.workingHours || "Haftanın her günü kesintisiz hizmet"}</span>
        </div>
        <div class="flex items-center gap-2 text-[11px]">
          <span>✉️</span>
          <a href="mailto:${config.email}" class="hover:underline text-slate-700 truncate">${config.email}</a>
        </div>
      </div>

      <!-- Language Switcher & Social Links inside Drawer -->
      ${renderLanguageSwitcher(config, true)}
      ${(config.socialMedia?.showInHeader !== false && config.header?.showSocials !== false) ? `
        <div class="pt-3 flex items-center justify-center gap-2.5">
          ${(config.socialMedia?.instagram || config.footer?.instagram) ? `
            <a href="${config.socialMedia?.instagram || config.footer?.instagram}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-slate-100 text-pink-600 flex items-center justify-center hover:bg-pink-50 transition-colors" title="Instagram">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          ` : ''}
          ${(config.socialMedia?.linkedin || config.footer?.linkedin) ? `
            <a href="${config.socialMedia?.linkedin || config.footer?.linkedin}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors" title="LinkedIn">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          ` : ''}
          ${(config.socialMedia?.twitter || config.footer?.twitter) ? `
            <a href="${config.socialMedia?.twitter || config.footer?.twitter}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors" title="Twitter / X">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          ` : ''}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Mobile Floating Sticky Bottom Quick Action Bar -->
  <div id="mobileBottomBar" class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 shadow-2xl flex items-center justify-around">
    <a href="tel:${config.phone.replace(/\s+/g, '')}" class="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-slate-700 hover:text-brand transition-colors text-center">
      <span class="text-lg leading-none">📞</span>
      <span class="text-[10px] font-bold mt-1">${config.header?.phoneButtonText || "Ara"}</span>
    </a>
    <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba ${config.companyName}, web sitenizden ulaşıyorum, bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors text-center">
      <span class="text-lg leading-none">💬</span>
      <span class="text-[10px] font-bold mt-1">${config.header?.whatsappButtonText || "WhatsApp"}</span>
    </a>
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${config.companyName} ${config.address} ${config.city}`)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-slate-700 hover:text-brand transition-colors text-center">
      <span class="text-lg leading-none">📍</span>
      <span class="text-[10px] font-bold mt-1">Yol Tarifi</span>
    </a>
    <button onclick="toggleMobileMenu()" class="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-slate-700 hover:text-brand transition-colors text-center cursor-pointer">
      <span class="text-lg leading-none">☰</span>
      <span class="text-[10px] font-bold mt-1">Menü</span>
    </button>
  </div>

  <!-- Hidden anchor for backwards compatibility -->
  <div id="mobileMenu" class="hidden"></div>
  `;
}

function renderFloatingWhatsAppWidget(config: SiteConfig): string {
  const widget = config.whatsappWidget;
  const isExplicitlyDisabled = widget?.enabled === false;
  if (isExplicitlyDisabled) return "";

  const rawPhone = widget?.phoneNumber || config.whatsapp || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  if (!cleanPhone) return "";

  const isLeft = widget?.position === "bottom-left";
  const posClass = isLeft ? "bottom-20 lg:bottom-6 left-4 sm:left-6" : "bottom-20 lg:bottom-6 right-4 sm:right-6";
  const alignClass = isLeft ? "items-start" : "items-end";
  const chatOrigin = isLeft ? "origin-bottom-left" : "origin-bottom-right";

  const defaultMsg =
    widget?.defaultMessage ||
    `Merhaba ${config.companyName}, web sitenizden ulaşıyorum. Fiyat ve bilgi almak istiyorum.`;
  const encodedDefaultMsg = encodeURIComponent(defaultMsg);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedDefaultMsg}`;

  const buttonText = widget?.buttonText || "WhatsApp İle Yazın";
  const isCircle = widget?.buttonStyle === "floating-circle";
  const popupEnabled = widget?.popupEnabled ?? true;
  const showBadgeDot = widget?.showBadgeDot ?? true;
  const agentName = widget?.agentName || `${config.companyName} Müşteri Temsilcisi`;
  const agentSubtitle = widget?.agentSubtitle || "Genellikle birkaç dakika içinde yanıt verir";
  const callToAction = widget?.callToAction || "Merhaba 👋 Size nasıl yardımcı olabiliriz?";

  return `
  <!-- WhatsApp Floating Widget Container -->
  <div id="hizliweb-wa-widget" class="fixed ${posClass} z-50 flex flex-col ${alignClass} font-sans">
    ${popupEnabled ? `
    <!-- WhatsApp Interactive Chat Popup Card -->
    <div id="waChatPopup" class="hidden mb-3 w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-200 transform ${chatOrigin}">
      <!-- Popup Header -->
      <div class="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-xs">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.766-5.768-5.766zm9.969 5.828c0 5.514-4.486 10-10 10-1.802 0-3.486-.481-4.945-1.32l-5.055 1.32 1.353-4.946c-.927-1.508-1.353-3.196-1.353-5.054 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg>
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-[#128C7E] rounded-full"></span>
          </div>
          <div>
            <div class="font-bold text-sm leading-tight text-white">${agentName}</div>
            <div class="text-[11px] text-emerald-100 flex items-center gap-1.5 font-medium mt-0.5">
              <span class="inline-block w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
              <span>${agentSubtitle}</span>
            </div>
          </div>
        </div>
        <button type="button" onclick="toggleWhatsAppPopup(event)" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors" title="Kapat" aria-label="Kapat">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Chat Body Background -->
      <div class="p-4 bg-[#E5DDD5]/30 space-y-3" style="background-image: radial-gradient(#d1d7db 0.75px, transparent 0.75px); background-size: 16px 16px;">
        <!-- Incoming Bubble -->
        <div class="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-slate-100 max-w-[90%] space-y-1.5 text-slate-800">
          <div class="text-[11px] font-bold text-[#128C7E]">
            ${agentName}
          </div>
          <p class="text-xs leading-relaxed text-slate-700 font-normal">${callToAction}</p>
          <div class="text-[10px] text-slate-400 text-right font-mono">Şimdi</div>
        </div>
      </div>

      <!-- Popup Footer Action -->
      <div class="p-3.5 bg-white border-t border-slate-100 space-y-2">
        <div class="relative flex items-center">
          <input
            type="text"
            id="waPopupInput"
            value="${defaultMsg.replace(/"/g, '&quot;')}"
            placeholder="Mesajınızı yazın..."
            class="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
            onkeydown="if(event.key === 'Enter'){ sendWhatsAppFromPopup('${cleanPhone}'); }"
          />
          <button
            type="button"
            onclick="sendWhatsAppFromPopup('${cleanPhone}')"
            class="absolute right-1.5 p-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebd59] text-white transition-colors"
            title="WhatsApp'ta Gönder"
          >
            <svg class="w-4 h-4 fill-current rotate-90" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <a
          href="${waUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.766-5.768-5.766zm9.969 5.828c0 5.514-4.486 10-10 10-1.802 0-3.486-.481-4.945-1.32l-5.055 1.32 1.353-4.946c-.927-1.508-1.353-3.196-1.353-5.054 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg>
          <span>Sohbete Başla</span>
        </a>
      </div>
    </div>
    ` : ''}

    <!-- Main Floating Trigger Button -->
    <a
      id="waFloatingBtn"
      href="${waUrl}"
      ${popupEnabled ? `onclick="handleFloatingWhatsAppClick(event, '${waUrl}')"` : `target="_blank" rel="noopener noreferrer"`}
      class="relative group bg-[#25D366] hover:bg-[#20bd5a] text-white ${isCircle ? 'p-3.5 rounded-full' : 'py-3.5 px-5 rounded-full'} shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 cursor-pointer select-none"
      aria-label="WhatsApp Destek"
    >
      ${showBadgeDot ? `
      <!-- Pulse dot -->
      <span class="absolute -top-1 -right-1 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
      </span>
      ` : ''}

      <svg class="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.766-5.768-5.766zm9.969 5.828c0 5.514-4.486 10-10 10-1.802 0-3.486-.481-4.945-1.32l-5.055 1.32 1.353-4.946c-.927-1.508-1.353-3.196-1.353-5.054 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg>

      ${!isCircle ? `
      <span class="text-xs font-bold whitespace-nowrap tracking-wide">
        ${buttonText}
      </span>
      ` : `
      <span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
        ${buttonText}
      </span>
      `}
    </a>
  </div>
  `;
}

function renderLanguageSwitcher(config: SiteConfig, isMobile = false): string {
  const langConfig = getEffectiveLanguageConfig(config);
  if (!langConfig.enabled) return '';

  const activeLangs = (langConfig.activeLanguages || []).filter(l => l.enabled);
  if (activeLangs.length <= 1) return '';

  if (isMobile) {
    return `
    <div class="pt-3 pb-1 border-t border-slate-100 flex items-center justify-between">
      <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
        <span>🌐</span> Dil / Language:
      </span>
      <div class="flex items-center gap-1.5">
        ${activeLangs.map(l => `
          <button type="button" onclick="changeSiteLanguage('${l.code}')" data-lang-btn="${l.code}" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${l.code === langConfig.defaultLanguage ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
            <span>${l.flag}</span>
            <span class="ml-1 uppercase">${l.code}</span>
          </button>
        `).join('')}
      </div>
    </div>
    `;
  }

  const style = langConfig.switcherStyle || 'dropdown';

  if (style === 'pills') {
    return `
    <div class="site-language-switcher flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-xs text-xs font-bold">
      ${activeLangs.map(l => `
        <button type="button" onclick="changeSiteLanguage('${l.code}')" data-lang-btn="${l.code}" class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${l.code === langConfig.defaultLanguage ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}">
          <span>${l.flag}</span>
          <span class="uppercase">${l.code}</span>
        </button>
      `).join('')}
    </div>
    `;
  }

  if (style === 'flags-only') {
    return `
    <div class="site-language-switcher flex items-center gap-1.5 bg-slate-100/80 px-2 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
      ${activeLangs.map(l => `
        <button type="button" onclick="changeSiteLanguage('${l.code}')" data-lang-btn="${l.code}" title="${l.name}" class="text-lg transition-all hover:scale-110 cursor-pointer p-0.5 rounded-full ${l.code === langConfig.defaultLanguage ? 'ring-2 ring-indigo-600 ring-offset-1 scale-105' : 'opacity-80 hover:opacity-100'}">
          ${l.flag}
        </button>
      `).join('')}
    </div>
    `;
  }

  if (style === 'compact-select') {
    return `
    <div class="site-language-switcher relative inline-block">
      <select onchange="changeSiteLanguage(this.value)" id="siteLanguageSelect" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono py-1.5 px-2.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500">
        ${activeLangs.map(l => `
          <option value="${l.code}" ${l.code === langConfig.defaultLanguage ? 'selected' : ''}>
            ${l.flag} ${l.code.toUpperCase()}
          </option>
        `).join('')}
      </select>
    </div>
    `;
  }

  // Default: Dropdown
  const defaultLangObj = activeLangs.find(l => l.code === langConfig.defaultLanguage) || activeLangs[0];

  return `
  <div class="site-language-switcher relative inline-block text-left" id="siteLangDropdownContainer">
    <button type="button" onclick="toggleLanguageDropdown(event)" id="currentLangBtn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-xs transition-all cursor-pointer">
      <span id="currentLangFlag">${defaultLangObj.flag}</span>
      <span id="currentLangName" class="hidden md:inline">${defaultLangObj.name}</span>
      <span id="currentLangCode" class="md:hidden uppercase">${defaultLangObj.code}</span>
      <svg class="w-3.5 h-3.5 text-slate-500 transition-transform" id="langChevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>
    <div id="siteLangDropdownMenu" class="hidden absolute right-0 mt-1.5 w-40 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
      ${activeLangs.map(l => `
        <button type="button" onclick="changeSiteLanguage('${l.code}')" data-lang-option="${l.code}" class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors text-left cursor-pointer">
          <span class="flex items-center gap-2">
            <span>${l.flag}</span>
            <span>${l.name}</span>
          </span>
          <span class="text-[10px] uppercase font-mono text-slate-400 font-bold">${l.code}</span>
        </button>
      `).join('')}
    </div>
  </div>
  `;
}

function renderFloatingLanguageSwitcher(config: SiteConfig): string {
  const langConfig = getEffectiveLanguageConfig(config);
  if (!langConfig.enabled) return '';
  if (langConfig.switcherPosition !== 'floating-bottom' && langConfig.switcherPosition !== 'both') return '';

  const activeLangs = (langConfig.activeLanguages || []).filter(l => l.enabled);
  if (activeLangs.length <= 1) return '';

  return `
  <!-- Floating Language Switcher Widget -->
  <div class="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-40 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-1.5">
    <span class="text-xs text-slate-500 font-bold mr-0.5">🌐</span>
    ${activeLangs.map(l => `
      <button type="button" onclick="changeSiteLanguage('${l.code}')" data-floating-lang-btn="${l.code}" class="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${l.code === langConfig.defaultLanguage ? 'bg-slate-900 text-white shadow-xs font-black' : 'text-slate-700 hover:bg-slate-100'}">
        <span>${l.flag}</span>
        <span class="ml-0.5 uppercase">${l.code}</span>
      </button>
    `).join('')}
  </div>
  `;
}

function renderLanguageScript(config: SiteConfig): string {
  const langConfig = getEffectiveLanguageConfig(config);
  if (!langConfig.enabled) return '';

  const activeLangs = (langConfig.activeLanguages || []).filter(l => l.enabled);
  const translations = langConfig.translations || {};

  return `
  <!-- Multi-Language (i18n) Engine -->
  <script>
    window.__SITE_LANG_CONFIG = ${JSON.stringify({
      defaultLanguage: langConfig.defaultLanguage || 'tr',
      autoDetect: Boolean(langConfig.autoDetectBrowserLanguage),
      enableRtl: Boolean(langConfig.enableRtlForArabic),
      activeLangs: activeLangs.map(l => ({ code: l.code, name: l.name, flag: l.flag, dir: l.direction }))
    })};

    window.__SITE_TRANSLATIONS = ${JSON.stringify(translations)};

    function toggleLanguageDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      var menu = document.getElementById('siteLangDropdownMenu');
      var chevron = document.getElementById('langChevron');
      if (menu) {
        menu.classList.toggle('hidden');
        if (chevron) {
          chevron.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      }
    }

    document.addEventListener('click', function(e) {
      var menu = document.getElementById('siteLangDropdownMenu');
      var container = document.getElementById('siteLangDropdownContainer');
      if (menu && container && !menu.classList.contains('hidden') && !container.contains(e.target)) {
        menu.classList.add('hidden');
        var chevron = document.getElementById('langChevron');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      }
    });

    function changeSiteLanguage(langCode) {
      if (!langCode) return;
      try {
        localStorage.setItem('site_lang', langCode);
      } catch (e) {}

      var menu = document.getElementById('siteLangDropdownMenu');
      if (menu) menu.classList.add('hidden');

      var cfg = window.__SITE_LANG_CONFIG;
      if (!cfg) return;

      var activeLang = cfg.activeLangs.find(function(l) { return l.code === langCode; });
      if (!activeLang) return;

      // Update HTML lang and direction (RTL for Arabic)
      document.documentElement.lang = langCode;
      if (cfg.enableRtl && activeLang.dir === 'rtl') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl-layout');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl-layout');
      }

      // Update Header Dropdown UI
      var flagEl = document.getElementById('currentLangFlag');
      var nameEl = document.getElementById('currentLangName');
      var codeEl = document.getElementById('currentLangCode');
      if (flagEl) flagEl.textContent = activeLang.flag;
      if (nameEl) nameEl.textContent = activeLang.name;
      if (codeEl) codeEl.textContent = activeLang.code.toUpperCase();

      var selectEl = document.getElementById('siteLanguageSelect');
      if (selectEl) selectEl.value = langCode;

      // Highlight active buttons
      document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
        if (btn.getAttribute('data-lang-btn') === langCode) {
          btn.className = btn.className.replace(/text-slate-[0-9]+/g, '').replace('bg-slate-100', '') + ' bg-slate-900 text-white shadow-xs font-bold';
        } else {
          btn.className = btn.className.replace('bg-slate-900 text-white shadow-xs font-bold', '') + ' text-slate-700 bg-slate-100';
        }
      });

      document.querySelectorAll('[data-floating-lang-btn]').forEach(function(btn) {
        if (btn.getAttribute('data-floating-lang-btn') === langCode) {
          btn.className = 'px-2 py-1 rounded-lg text-xs transition-all cursor-pointer bg-slate-900 text-white shadow-xs font-black';
        } else {
          btn.className = 'px-2 py-1 rounded-lg text-xs transition-all cursor-pointer text-slate-700 hover:bg-slate-100';
        }
      });

      // Apply translations to DOM
      var trans = (window.__SITE_TRANSLATIONS && window.__SITE_TRANSLATIONS[langCode]) || {};
      
      // Basic text nodes
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (trans[key]) {
          el.textContent = trans[key];
        }
      });

      // Services
      if (trans.services) {
        document.querySelectorAll('[data-i18n-service-title]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-service-title');
          if (trans.services[id] && trans.services[id].title) {
            el.textContent = trans.services[id].title;
          }
        });
        document.querySelectorAll('[data-i18n-service-desc]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-service-desc');
          if (trans.services[id] && trans.services[id].desc) {
            el.textContent = trans.services[id].desc;
          }
        });
      }

      // Products
      if (trans.products) {
        document.querySelectorAll('[data-i18n-product-title]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-product-title');
          if (trans.products[id] && trans.products[id].title) {
            el.textContent = trans.products[id].title;
          }
        });
        document.querySelectorAll('[data-i18n-product-desc]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-product-desc');
          if (trans.products[id] && trans.products[id].description) {
            el.textContent = trans.products[id].description;
          }
        });
      }

      // FAQs
      if (trans.faqs) {
        document.querySelectorAll('[data-i18n-faq-q]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-faq-q');
          if (trans.faqs[id] && trans.faqs[id].q) {
            el.textContent = trans.faqs[id].q;
          }
        });
        document.querySelectorAll('[data-i18n-faq-a]').forEach(function(el) {
          var id = el.getAttribute('data-i18n-faq-a');
          if (trans.faqs[id] && trans.faqs[id].a) {
            el.textContent = trans.faqs[id].a;
          }
        });
      }
    }

    // Initialize Language on DOMContentLoaded
    (function initLanguage() {
      var cfg = window.__SITE_LANG_CONFIG;
      if (!cfg) return;

      var savedLang = null;
      try {
        savedLang = localStorage.getItem('site_lang');
      } catch (e) {}

      // URL query parameter ?lang=en override
      var urlParams = new URLSearchParams(window.location.search);
      var queryLang = urlParams.get('lang');
      if (queryLang) savedLang = queryLang;

      // Auto-detect browser language if enabled and no saved preference
      if (!savedLang && cfg.autoDetect) {
        var browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
        var match = cfg.activeLangs.find(function(l) { return l.code === browserLang; });
        if (match) {
          savedLang = match.code;
        }
      }

      var finalLang = savedLang || cfg.defaultLanguage || 'tr';
      if (finalLang !== cfg.defaultLanguage) {
        changeSiteLanguage(finalLang);
      }
    })();
  </script>
  `;
}

function renderFooter(config: SiteConfig): string {
  const isMulti = config.siteType === "multi-page";
  const navItems = (config.header?.navItems || [
    { id: "nav-home", label: "Ana Sayfa", target: "home", visible: true, order: 1 },
    { id: "nav-about", label: "Kurumsal", target: "about", visible: true, order: 2 },
    { id: "nav-services", label: "Hizmetlerimiz", target: "services", visible: true, order: 3 },
    { id: "nav-catalog", label: "Ürün Kataloğu", target: "catalog", visible: true, order: 4 },
    { id: "nav-blog", label: "Blog", target: "blog", visible: true, order: 5 },
    { id: "nav-contact", label: "İletişim", target: "contact", visible: true, order: 6 }
  ]).filter(n => n.visible);

  return `
  <!-- Footer Section -->
  <footer class="bg-slate-950 text-slate-400 text-xs pt-12 pb-28 lg:py-14 border-t border-slate-800 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      ${(config.newsletter?.enabled && config.newsletter.displayLocation !== "section") ? `
        <!-- Footer Newsletter Banner -->
        <div class="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div class="space-y-1.5 text-center md:text-left max-w-lg">
            <div class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center justify-center md:justify-start gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span>${config.newsletter.badge || 'E-Bülten Aboneliği'}</span>
            </div>
            <div class="text-base sm:text-lg font-bold text-white">
              ${config.newsletter.title || 'Kampanya ve Fırsatlardan Haberdar Olun'}
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              ${config.newsletter.subtitle || 'En güncel duyurular, indirimler ve avantajlı teklifler doğrudan e-posta kutunuzda.'}
            </p>
          </div>

          <form onsubmit="handleNewsletterSubmit(event, 'Footer Formu', 'footerNewsletterEmail', 'footerNewsletterAlert')" class="w-full md:w-auto flex-1 max-w-md space-y-2">
            <div class="flex items-center gap-2">
              <input 
                type="email" 
                id="footerNewsletterEmail"
                required 
                placeholder="${config.newsletter.placeholder || 'E-posta adresinizi giriniz...'}" 
                class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-mono"
              />
              <button 
                type="submit" 
                class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 whitespace-nowrap cursor-pointer"
              >
                ${config.newsletter.buttonText || 'Kayıt Ol'}
              </button>
            </div>
            <div id="footerNewsletterAlert" class="hidden text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-center">
              ✓ ${config.newsletter.successMessage || 'Harika! E-bülten listemize başarıyla kaydoldunuz.'}
            </div>
            <div class="text-[10px] text-slate-500 text-center md:text-left">
              🔒 ${config.newsletter.privacyNote || 'Asla spam göndermiyoruz. İstediğiniz zaman ayrılabilirsiniz.'}
            </div>
          </form>
        </div>
      ` : ''}

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div class="md:col-span-2 space-y-4">
          <div class="text-lg font-bold text-white flex items-center gap-2">
            ${config.companyName}
          </div>
          <p class="text-slate-400 text-xs leading-relaxed max-w-md">
            ${config.footer?.aboutText || config.slogan}
          </p>
          ${(config.socialMedia?.showInFooter !== false && config.footer?.showSocials !== false) ? `
            <div class="flex items-center gap-2.5 pt-2">
              ${(config.socialMedia?.instagram || config.footer?.instagram) ? `
                <a href="${config.socialMedia?.instagram || config.footer?.instagram}" target="_blank" rel="noopener noreferrer" title="Instagram" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              ` : ''}
              ${(config.socialMedia?.linkedin || config.footer?.linkedin) ? `
                <a href="${config.socialMedia?.linkedin || config.footer?.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              ` : ''}
              ${(config.socialMedia?.twitter || config.footer?.twitter) ? `
                <a href="${config.socialMedia?.twitter || config.footer?.twitter}" target="_blank" rel="noopener noreferrer" title="Twitter / X" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              ` : ''}
              ${(config.socialMedia?.facebook || config.footer?.facebook) ? `
                <a href="${config.socialMedia?.facebook || config.footer?.facebook}" target="_blank" rel="noopener noreferrer" title="Facebook" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              ` : ''}
              ${(config.socialMedia?.youtube || config.footer?.youtube) ? `
                <a href="${config.socialMedia?.youtube || config.footer?.youtube}" target="_blank" rel="noopener noreferrer" title="YouTube" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-white mb-4">${config.footer?.column1Title || 'Hızlı Menü'}</div>
          <ul class="space-y-2 text-slate-400">
            ${navItems.slice(0, 6).map(n => `
              <li><a href="${getHref(config, n.target)}" class="hover:text-white transition-colors">${n.label}</a></li>
            `).join('')}
          </ul>
        </div>

        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-white mb-4">${config.footer?.column2Title || 'İletişim'}</div>
          <ul class="space-y-2 text-slate-400">
            <li>📍 ${config.city} - ${config.address}</li>
            <li>📞 <a href="tel:${config.phone.replace(/\s+/g, '')}" class="hover:text-white">${config.phone}</a></li>
            <li>💬 <a href="https://wa.me/${config.whatsapp}" class="text-emerald-400 hover:underline">WhatsApp: ${config.whatsapp}</a></li>
            <li>✉️ <a href="mailto:${config.email}" class="hover:text-white">${config.email}</a></li>
            <li>⏰ ${config.workingHours}</li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-900 text-slate-500">
        <div>
          ${config.footer?.copyrightText || `© ${new Date().getFullYear()} ${config.companyName}. Tüm Hakları Saklıdır.`}
        </div>
        <div>
          ⚡ <strong>HızlıWeb Engine</strong> • Ultra Hızlı Global Edge ${isMulti ? 'Çok Sayfalı' : 'Tek Sayfa'} Statik Altyapı
        </div>
      </div>
    </div>
  </footer>

  ${renderFloatingWhatsAppWidget(config)}
  ${renderFloatingLanguageSwitcher(config)}

  <!-- Common Client Script for Forms, Sliders, Menu -->
  <script>
    window.__THANK_YOU_EMAIL_CONFIG = ${JSON.stringify(config.leadThankYouEmail || config.customForm?.thankYouEmail || null)};

    function toggleWhatsAppPopup(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const popup = document.getElementById('waChatPopup');
      if (popup) {
        popup.classList.toggle('hidden');
        if (!popup.classList.contains('hidden')) {
          const input = document.getElementById('waPopupInput');
          if (input) input.focus();
        }
      }
    }

    function handleFloatingWhatsAppClick(e, fallbackUrl) {
      const popup = document.getElementById('waChatPopup');
      if (popup) {
        e.preventDefault();
        e.stopPropagation();
        popup.classList.toggle('hidden');
        if (!popup.classList.contains('hidden')) {
          const input = document.getElementById('waPopupInput');
          if (input) input.focus();
        }
      }
    }

    function sendWhatsAppFromPopup(phone) {
      const input = document.getElementById('waPopupInput');
      const val = input ? input.value.trim() : '';
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const url = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(val || 'Merhaba, bilgi almak istiyorum.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    document.addEventListener('click', function(e) {
      const widget = document.getElementById('hizliweb-wa-widget');
      const popup = document.getElementById('waChatPopup');
      if (widget && popup && !popup.classList.contains('hidden') && !widget.contains(e.target)) {
        popup.classList.add('hidden');
      }
    });

    // Mobile Drawer Navigation Controllers
    function openMobileMenu() {
      var drawer = document.getElementById('mobileDrawer');
      var backdrop = document.getElementById('mobileMenuBackdrop');
      var openIcon = document.getElementById('mobileMenuOpenIcon');
      var closeIcon = document.getElementById('mobileMenuCloseIcon');
      var toggleBtn = document.getElementById('mobileMenuToggleBtn');
      if (drawer) {
        drawer.style.transform = 'translateX(0)';
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('translate-x-0');
      }
      if (backdrop) {
        backdrop.style.display = 'block';
        backdrop.classList.remove('hidden');
        setTimeout(function() {
          backdrop.classList.remove('opacity-0');
          backdrop.classList.add('opacity-100');
          backdrop.style.opacity = '1';
        }, 10);
      }
      if (openIcon) openIcon.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      var drawer = document.getElementById('mobileDrawer');
      var backdrop = document.getElementById('mobileMenuBackdrop');
      var openIcon = document.getElementById('mobileMenuOpenIcon');
      var closeIcon = document.getElementById('mobileMenuCloseIcon');
      var toggleBtn = document.getElementById('mobileMenuToggleBtn');
      if (drawer) {
        drawer.style.transform = 'translateX(100%)';
        drawer.classList.add('translate-x-full');
        drawer.classList.remove('translate-x-0');
      }
      if (backdrop) {
        backdrop.classList.add('opacity-0');
        backdrop.classList.remove('opacity-100');
        backdrop.style.opacity = '0';
        setTimeout(function() {
          backdrop.classList.add('hidden');
          backdrop.style.display = 'none';
        }, 250);
      }
      if (openIcon) openIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
      var drawer = document.getElementById('mobileDrawer');
      var isOpened = drawer && (drawer.classList.contains('translate-x-0') || drawer.style.transform === 'translateX(0px)' || drawer.style.transform === 'translateX(0)');
      if (isOpened) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMobileMenu();
    });

    function handleAccordionToggle(btn, idx) {
      const item = btn.closest('.faq-accordion-item');
      const panel = document.getElementById('faq-content-' + idx);
      const chevron = item ? item.querySelector('.faq-chevron-svg') : null;
      const chevronBox = item ? item.querySelector('.faq-chevron-box') : null;
      const faqSection = document.getElementById('faqs');
      const allowMultiple = faqSection ? faqSection.dataset.allowMultiple === 'true' : false;

      if (!panel) return;
      const isAlreadyOpen = btn.getAttribute('aria-expanded') === 'true';

      if (!allowMultiple) {
        const allItems = faqSection ? faqSection.querySelectorAll('.faq-accordion-item') : [];
        allItems.forEach(function(otherItem) {
          if (otherItem !== item) {
            const otherBtn = otherItem.querySelector('.faq-trigger');
            const otherPanel = otherItem.querySelector('.faq-panel');
            const otherChevron = otherItem.querySelector('.faq-chevron-svg');
            const otherBox = otherItem.querySelector('.faq-chevron-box');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPanel) {
              otherPanel.style.maxHeight = '0px';
              otherPanel.style.opacity = '0';
            }
            if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
            if (otherBox) {
              otherBox.classList.remove('bg-brand', 'text-white');
              otherBox.classList.add('bg-slate-100', 'text-slate-600');
            }
            otherItem.classList.remove('ring-2', 'ring-brand/20', 'border-brand');
            otherItem.classList.add('border-slate-200/90');
          }
        });
      }

      if (isAlreadyOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        if (chevronBox) {
          chevronBox.classList.remove('bg-brand', 'text-white');
          chevronBox.classList.add('bg-slate-100', 'text-slate-600');
        }
        if (item) {
          item.classList.remove('ring-2', 'ring-brand/20', 'border-brand');
          item.classList.add('border-slate-200/90');
        }
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        if (chevronBox) {
          chevronBox.classList.add('bg-brand', 'text-white');
          chevronBox.classList.remove('bg-slate-100', 'text-slate-600');
        }
        if (item) {
          item.classList.add('ring-2', 'ring-brand/20', 'border-brand');
          item.classList.remove('border-slate-200/90');
        }
      }
    }

    function filterFaqCategory(category, btn) {
      const faqSection = document.getElementById('faqs');
      if (!faqSection) return;
      const filterBtns = faqSection.querySelectorAll('.faq-category-btn');
      filterBtns.forEach(function(b) {
        b.classList.remove('bg-slate-900', 'text-white', 'shadow-xs');
        b.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200');
      });
      btn.classList.add('bg-slate-900', 'text-white', 'shadow-xs');
      btn.classList.remove('bg-white', 'text-slate-700', 'border', 'border-slate-200');

      const items = faqSection.querySelectorAll('.faq-accordion-item');
      let visibleCount = 0;
      items.forEach(function(it) {
        const itemCat = it.dataset.faqCat || '';
        if (category === 'all' || itemCat.toLowerCase() === category.toLowerCase()) {
          it.style.display = '';
          visibleCount++;
        } else {
          it.style.display = 'none';
        }
      });
      const emptyMsg = document.getElementById('faqEmptyFilter');
      if (emptyMsg) {
        emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    function searchFaq(query) {
      const faqSection = document.getElementById('faqs');
      if (!faqSection) return;
      const q = (query || '').toLowerCase().trim();
      const items = faqSection.querySelectorAll('.faq-accordion-item');
      let visibleCount = 0;
      items.forEach(function(it) {
        const text = it.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          it.style.display = '';
          visibleCount++;
        } else {
          it.style.display = 'none';
        }
      });
      const emptyMsg = document.getElementById('faqEmptyFilter');
      if (emptyMsg) {
        emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    function toggleFaq(idx) {
      const trigger = document.querySelector('[aria-controls="faq-content-' + idx + '"]');
      if (trigger) {
        handleAccordionToggle(trigger, idx);
        return;
      }
      const ans = document.getElementById('faqAnswer-' + idx);
      const icon = document.getElementById('faqIcon-' + idx);
      if (ans) {
        if (ans.classList.contains('hidden')) {
          ans.classList.remove('hidden');
          if (icon) icon.textContent = '−';
        } else {
          ans.classList.add('hidden');
          if (icon) icon.textContent = '+';
        }
      }
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      var form = e.target;
      var name = document.getElementById('leadName')?.value || form.querySelector('[name="lead_name"]')?.value || form.querySelector('[name="leadName"]')?.value || '';
      var phone = document.getElementById('leadPhone')?.value || form.querySelector('[name="lead_phone"]')?.value || form.querySelector('[name="leadPhone"]')?.value || '';
      var email = document.getElementById('leadEmail')?.value || form.querySelector('[name="lead_email"]')?.value || form.querySelector('[name="leadEmail"]')?.value || '';
      var service = document.getElementById('leadService')?.value || form.querySelector('[name="lead_service"]')?.value || form.querySelector('[name="leadService"]')?.value || 'Genel Bilgi & Teklif';
      var message = document.getElementById('leadMessage')?.value || form.querySelector('[name="lead_message"]')?.value || form.querySelector('[name="leadMessage"]')?.value || '';

      var customFields = {};
      var attachments = [];

      var formInputs = form.querySelectorAll('input, select, textarea');
      formInputs.forEach(function(el) {
        var fieldName = el.name || el.id;
        if (!fieldName) return;
        if (['leadName', 'leadPhone', 'leadEmail', 'leadService', 'leadMessage', 'lead_name', 'lead_phone', 'lead_email', 'lead_service', 'lead_message'].indexOf(fieldName) !== -1) {
          return;
        }

        if (el.type === 'checkbox') {
          customFields[fieldName] = el.checked;
        } else if (el.type === 'radio') {
          if (el.checked) customFields[fieldName] = el.value;
        } else if (el.type === 'file') {
          if (el.files && el.files.length > 0) {
            for (var f = 0; f < el.files.length; f++) {
              attachments.push({
                name: el.files[f].name,
                size: el.files[f].size,
                type: el.files[f].type
              });
            }
          }
        } else if (el.value !== undefined && el.value !== '') {
          customFields[fieldName] = el.value;
        }
      });

      var thankYouConfig = window.__THANK_YOU_EMAIL_CONFIG || null;
      var thankYouSent = false;
      var thankYouSentAt = null;
      var thankYouStatus = undefined;
      var thankYouScheduledFor = undefined;
      var delayMinutes = (thankYouConfig && typeof thankYouConfig.delayMinutes === 'number') ? thankYouConfig.delayMinutes : 5;

      if (thankYouConfig && thankYouConfig.enabled && email) {
        if (delayMinutes > 0) {
          var jitter = (thankYouConfig.delayRandomWindow !== false) ? Math.round((Math.random() * 2 - 1) * 1.5) : 0;
          var effectiveMinutes = Math.max(1, delayMinutes + jitter);
          var schTime = new Date(Date.now() + effectiveMinutes * 60000);
          var schStr = String(schTime.getHours()).padStart(2, '0') + ':' + String(schTime.getMinutes()).padStart(2, '0');
          thankYouSent = false;
          thankYouStatus = 'queued';
          thankYouScheduledFor = schStr + ' (' + effectiveMinutes + ' dk doğal gecikme)';
        } else {
          thankYouSent = true;
          thankYouSentAt = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          thankYouStatus = 'delivered';
        }
      }

      var newLead = {
        id: 'lead-' + Date.now(),
        date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        name: name || 'İsimsiz Talep',
        phone: phone || '-',
        email: email || undefined,
        serviceOrProduct: service || 'Web Sitesi Teklif',
        message: message || '',
        sourcePage: document.title,
        status: 'new',
        heroVariant: window.__ACTIVE_HERO_VARIANT || (function() {
          try { return sessionStorage.getItem('hizliweb_hero_variant') || 'A'; } catch(e) { return 'A'; }
        })(),
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        thankYouEmailSent: thankYouSent,
        thankYouEmailSentAt: thankYouSentAt,
        thankYouEmailStatus: thankYouStatus,
        thankYouEmailScheduledFor: thankYouScheduledFor,
        thankYouEmailDelayMinutes: delayMinutes
      };

      try {
        var stored = JSON.parse(localStorage.getItem('hizliweb_leads') || '[]');
        stored.unshift(newLead);
        localStorage.setItem('hizliweb_leads', JSON.stringify(stored));
        window.parent.postMessage({ type: 'HIZLIWEB_FORM_LEAD', data: newLead }, '*');
      } catch (err) {
        console.log('Form saved locally', err);
      }

      var alert = form.querySelector('.form-success-alert') || document.getElementById('formSuccessAlert');
      if (alert) {
        alert.classList.remove('hidden');
      }
      form.reset();
    }

    function handleNewsletterSubmit(e, source, inputId, alertId) {
      if (e) e.preventDefault();
      var input = document.getElementById(inputId);
      var email = input ? input.value.trim() : '';
      if (!email) return;

      var newSub = {
        id: 'sub-' + Date.now(),
        email: email.toLowerCase(),
        name: '',
        subscribedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        status: 'active',
        source: source || 'Web Sitesi E-Bülten Formu',
        tags: ['Web Sitesi', 'Organik']
      };

      try {
        var stored = JSON.parse(localStorage.getItem('hizliweb_subscribers') || '[]');
        var exists = stored.some(function(s) { return s.email && s.email.toLowerCase() === email.toLowerCase(); });
        if (!exists) {
          stored.unshift(newSub);
          localStorage.setItem('hizliweb_subscribers', JSON.stringify(stored));
        }
        window.parent.postMessage({ type: 'HIZLIWEB_NEWSLETTER_SUBSCRIBE', data: newSub }, '*');
      } catch (err) {
        console.log('Newsletter saved locally', err);
      }

      var alertElem = document.getElementById(alertId);
      if (alertElem) {
        alertElem.classList.remove('hidden');
      }
      if (input) {
        input.value = '';
      }
    }

    // In-iframe link navigation listener for client-side memory router in previewer
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;

      // Ignore external or specialized protocols
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        return;
      }

      // Handle on-page anchor scroll
      if (href.startsWith('#')) {
        var anchorId = href.substring(1);
        if (anchorId) {
          var targetElem = document.getElementById(anchorId);
          if (targetElem) {
            e.preventDefault();
            targetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }

      // Handle relative page navigation inside preview iframe
      var cleanHref = href.replace(/^(\.\/|\/)/, '').split('?')[0].split('#')[0];
      if (cleanHref) {
        try {
          if (window.parent && window.parent !== window) {
            e.preventDefault();
            window.parent.postMessage({ type: 'HIZLIWEB_NAVIGATE', file: cleanHref, href: cleanHref }, '*');
          }
        } catch (err) {}
      }
    });
  </script>

  ${renderLanguageScript(config)}
  ${renderAbTestingScript(config)}
  `;
}

function renderAbTestingScript(config: SiteConfig): string {
  const ab = config.abTesting;
  if (!ab || !ab.enabled || ab.status !== 'active') {
    return `
    <script>
      window.__ACTIVE_HERO_VARIANT = 'A';
    </script>
    `;
  }

  return `
  <!-- A/B Testing Hero Split Engine -->
  <script>
    (function initHeroAbTesting() {
      var abConfig = ${JSON.stringify(ab)};
      var forcedVariant = null;
      try {
        var urlParams = new URLSearchParams(window.location.search);
        forcedVariant = urlParams.get('heroVariant') || urlParams.get('variant');
      } catch(e) {}

      var variant = forcedVariant;
      if (variant !== 'A' && variant !== 'B') {
        try {
          variant = sessionStorage.getItem('hizliweb_hero_variant');
        } catch(e) {}
      }

      if (variant !== 'A' && variant !== 'B') {
        var split = typeof abConfig.trafficSplit === 'number' ? abConfig.trafficSplit : 50;
        variant = (Math.random() * 100 < split) ? 'A' : 'B';
        try {
          sessionStorage.setItem('hizliweb_hero_variant', variant);
        } catch(e) {}
      }

      window.__ACTIVE_HERO_VARIANT = variant;
      try {
        localStorage.setItem('hizliweb_active_hero_variant', variant);
      } catch(e) {}

      // Notify parent frame of impression for A/B conversion analytics
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'HIZLIWEB_AB_IMPRESSION', variant: variant }, '*');
        }
      } catch(e) {}

      // If variant B, apply challenger copy and media to hero section
      if (variant === 'B' && abConfig.variationB) {
        document.addEventListener('DOMContentLoaded', function() {
          applyVariantB(abConfig.variationB);
        });
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
          applyVariantB(abConfig.variationB);
        }
      }

      function applyVariantB(vB) {
        var heroItem = document.querySelector('#heroSliderTrack .slide-item') || document.querySelector('.slide-item');
        if (!heroItem) return;

        if (vB.bgImage) {
          heroItem.style.backgroundImage = "url('" + vB.bgImage + "')";
        }
        var badge = heroItem.querySelector('.backdrop-blur') || heroItem.querySelector('.rounded-full');
        if (badge && vB.badge) {
          badge.textContent = vB.badge;
        }
        var title = heroItem.querySelector('[data-i18n="heroTitle"]') || heroItem.querySelector('h1');
        if (title && vB.title) {
          title.textContent = vB.title;
        }
        var subtitle = heroItem.querySelector('[data-i18n="heroSubtitle"]') || heroItem.querySelector('p');
        if (subtitle && vB.subtitle) {
          subtitle.textContent = vB.subtitle;
        }
        var ctaPri = heroItem.querySelector('[data-i18n="heroCtaPrimary"]');
        if (ctaPri && vB.ctaPrimaryText) {
          ctaPri.textContent = vB.ctaPrimaryText;
        }
        var ctaPriLink = heroItem.querySelector('a.bg-brand');
        if (ctaPriLink && vB.ctaPrimaryLink) {
          ctaPriLink.href = vB.ctaPrimaryLink;
        }
        var ctaSec = heroItem.querySelector('[data-i18n="heroCtaSecondary"]');
        if (ctaSec && vB.ctaSecondaryText) {
          ctaSec.textContent = '💬 ' + vB.ctaSecondaryText;
        }
        var ctaSecLink = heroItem.querySelector('a[href*="wa.me"]');
        if (ctaSecLink && vB.ctaSecondaryLink) {
          ctaSecLink.href = vB.ctaSecondaryLink;
        }
      }
    })();
  </script>
  `;
}

// -------------------------------------------------------------
// 1. GENERATE INDEX.HTML (Home Page / Landing Page)
// -------------------------------------------------------------
export function generateIndexHtml(config: SiteConfig): string {
  const isMulti = config.siteType === "multi-page";
  const slides: HeroSlide[] = config.hero.slides && config.hero.slides.length > 0 
    ? config.hero.slides 
    : [
        {
          id: "slide-default",
          badge: config.hero.badge || "✨ Profesyonel & Güvenilir Hizmet",
          title: config.hero.title,
          subtitle: config.hero.subtitle,
          ctaPrimaryText: config.hero.ctaPrimaryText || "Hemen İletişime Geçin",
          ctaPrimaryLink: config.hero.ctaPrimaryLink || `tel:${config.phone.replace(/\s+/g, '')}`,
          ctaSecondaryText: config.hero.ctaSecondaryText || "WhatsApp Destek",
          ctaSecondaryLink: config.hero.ctaSecondaryLink || `https://wa.me/${config.whatsapp}`,
          bgImage: config.hero.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80"
        }
      ];

  const rawSections = config.homepageSections ? [...config.homepageSections] : [
    { id: "hero", name: "Hero Slider", enabled: true, order: 1 },
    { id: "services", name: "Hizmetlerimiz", enabled: true, order: 2 },
    { id: "catalog", name: "Ürün Kataloğu", enabled: true, order: 3 },
    { id: "about", name: "Hakkımızda", enabled: true, order: 4 },
    { id: "whyUs", name: "Neden Biz?", enabled: true, order: 5 },
    { id: "gallery", name: "Fotoğraf Galerisi", enabled: true, order: 6 },
    { id: "testimonials", name: "Müşteri Yorumları", enabled: true, order: 7 },
    { id: "blog", name: "Blog", enabled: true, order: 8 },
    { id: "faqs", name: "SSS", enabled: true, order: 9 },
    { id: "contact", name: "İletişim", enabled: true, order: 10 }
  ];

  // If gallery exists and enabled, ensure gallery is in rawSections if not already present
  if (config.gallery?.enabled && !rawSections.some(s => s.id === "gallery")) {
    rawSections.push({
      id: "gallery",
      name: "Fotoğraf Galerisi",
      enabled: true,
      order: 5.9
    });
  }

  // If testimonials exist and enabled, ensure testimonials is in rawSections if not already present
  if (!rawSections.some(s => s.id === "testimonials")) {
    rawSections.push({
      id: "testimonials",
      name: "Müşteri Yorumları",
      enabled: config.testimonials?.enabled ?? true,
      order: 6.5
    });
  }

  // If newsletter exists and enabled, ensure newsletter is in rawSections if not already present
  if (config.newsletter?.enabled && config.newsletter.displayLocation !== "footer" && !rawSections.some(s => s.id === "newsletter")) {
    rawSections.push({
      id: "newsletter",
      name: "E-Bülten Aboneliği",
      enabled: true,
      order: 6.8
    });
  }

  // If faqs exist and enabled, ensure faqs is in rawSections if not already present
  const resolvedFaqs = config.faqs || config.faq;
  if (resolvedFaqs?.enabled && !rawSections.some(s => s.id === "faqs")) {
    rawSections.push({
      id: "faqs",
      name: "Sıkça Sorulan Sorular",
      enabled: true,
      order: 8.5
    });
  }

  // If socialFeed exists and enabled, ensure socialFeed is in rawSections if not already present
  if (config.socialFeed?.enabled && !rawSections.some(s => s.id === "socialFeed")) {
    rawSections.push({
      id: "socialFeed",
      name: "Sosyal Medya Akışı (Instagram & X)",
      enabled: true,
      order: 7.5
    });
  }

  const sectionOrder = rawSections.filter(s => s.enabled).sort((a, b) => a.order - b.order);

  const homeSeo = resolvePageSeo(
    config,
    "page-home",
    config.seo?.metaTitle || `${config.companyName} | ${config.slogan}`,
    config.seo?.metaDescription || config.slogan,
    config.seo?.keywords,
    slides[0]?.bgImage,
    config.seo?.canonicalUrl,
    config.seo?.robots
  );

  return `<!DOCTYPE html>
<html lang="tr" class="scroll-smooth">
<head>
  ${renderCommonHead(
    config,
    homeSeo.metaTitle,
    homeSeo.metaDescription,
    homeSeo.keywords,
    homeSeo.ogImage,
    undefined,
    homeSeo.canonicalUrl,
    homeSeo.robots,
    homeSeo.ogTitle,
    homeSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased selection:bg-brand selection:text-white flex flex-col min-h-screen">
  ${renderHeader(config, "home")}

  <main class="flex-1">
    ${sectionOrder.map((section) => {
      // 1. HERO SLIDER
      if (section.id === "hero") {
        return `
        <section class="relative bg-slate-950 text-white overflow-hidden min-h-[520px] lg:min-h-[600px] flex items-center">
          <div id="heroSliderTrack" class="relative w-full h-full">
            ${slides.map((slide, idx) => `
              <div id="slide-${idx}" class="slide-item ${idx === 0 ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'} py-20 lg:py-28" style="background-image: url('${slide.bgImage}'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 hero-gradient"></div>
                <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="max-w-3xl">
                    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-amber-300 mb-6">
                      ${slide.badge || '✨ Profesyonel Hizmet'}
                    </div>
                    <h1 class="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6" data-i18n="heroTitle">
                      ${slide.title}
                    </h1>
                    <p class="text-base sm:text-lg lg:text-xl text-slate-200 font-normal leading-relaxed mb-8 max-w-2xl" data-i18n="heroSubtitle">
                      ${slide.subtitle}
                    </p>

                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
                      <a href="${slide.ctaPrimaryLink || `tel:${config.phone.replace(/\s+/g, '')}`}" class="px-8 py-4 rounded-xl bg-brand text-white font-bold text-center hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand/40 flex items-center justify-center gap-2 text-sm sm:text-base">
                        <span data-i18n="heroCtaPrimary">${slide.ctaPrimaryText || 'Hemen İletişime Geçin'}</span>
                        <span>→</span>
                      </a>
                      <a href="${slide.ctaSecondaryLink || `https://wa.me/${config.whatsapp}`}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl bg-white/15 backdrop-blur hover:bg-white/25 text-white font-semibold text-center border border-white/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                        <span data-i18n="heroCtaSecondary">💬 ${slide.ctaSecondaryText || 'WhatsApp Destek'}</span>
                      </a>
                    </div>

                    <!-- Quick Stats -->
                    ${config.hero.stats && config.hero.stats.length > 0 ? `
                    <div class="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-white/15">
                      ${config.hero.stats.map(stat => `
                        <div>
                          <div class="text-2xl sm:text-3xl font-black text-amber-400">${stat.value}</div>
                          <div class="text-xs sm:text-sm text-slate-300 font-medium">${stat.label}</div>
                        </div>
                      `).join('')}
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          ${slides.length > 1 ? `
            <button onclick="prevSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur border border-white/20 transition-all">‹</button>
            <button onclick="nextSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur border border-white/20 transition-all">›</button>
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              ${slides.map((_, i) => `
                <button onclick="goToSlide(${i})" id="dot-${i}" class="w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-amber-400 w-8' : 'bg-white/50'}"></button>
              `).join('')}
            </div>
          ` : ''}
        </section>
        `;
      }

      // 2. SERVICES SECTION
      if (section.id === "services" && config.services.enabled) {
        return `
        <section id="services" class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-brand mb-2">${config.services.badge || 'Hizmetlerimiz'}</div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl" data-i18n="servicesTitle">${config.services.title}</h2>
                <p class="text-slate-600 text-sm mt-2 max-w-xl" data-i18n="servicesSubtitle">${config.services.subtitle}</p>
              </div>
              ${isMulti ? `
                <a href="hizmetler.html" class="px-5 py-2.5 rounded-xl border border-brand text-brand hover:bg-brand hover:text-white font-bold text-xs transition-all self-start md:self-auto flex items-center gap-1.5 shadow-xs">
                  <span>Tüm Hizmetler Sayfası</span>
                  <span>→</span>
                </a>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${config.services.items.map((svc, idx) => {
                const serviceDetailUrl = isMulti ? `hizmet-${svc.slug || `detay-${idx+1}`}.html` : '#contact';
                return `
                <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand/40 hover:bg-white hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                      0${idx + 1}
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand transition-colors" data-i18n-service-title="${svc.id}">${svc.title}</h3>
                    <p class="text-slate-600 text-sm leading-relaxed mb-6" data-i18n-service-desc="${svc.id}">${svc.desc}</p>
                  </div>
                  <div class="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <span class="text-xs font-bold text-brand py-1 px-3 bg-brand/10 rounded-full">${svc.price || 'Teklif Alın'}</span>
                    ${isMulti ? `
                      <a href="${serviceDetailUrl}" class="text-xs font-bold text-slate-800 hover:text-brand flex items-center gap-1">
                        Hizmet Detayı →
                      </a>
                    ` : `
                      <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`${svc.title} hizmeti için fiyat teklifi ve bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-slate-800 hover:text-brand flex items-center gap-1">
                        Teklif Al →
                      </a>
                    `}
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>
        `;
      }

      // 3. CATALOG SECTION
      if (section.id === "catalog" && config.products?.enabled && config.products.items.length > 0) {
        return `
        <section id="catalog" class="py-20 bg-slate-50 border-t border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
                  📦 ${config.products.badge || 'Ürün & Fiyat Kataloğu'}
                </div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl" data-i18n="catalogTitle">${config.products.title || 'Hizmet ve Ürün Kataloğu'}</h2>
                <p class="text-slate-600 text-sm mt-2 max-w-xl" data-i18n="catalogSubtitle">${config.products.subtitle || 'Fotoğraflı katalog üzerinden doğrudan WhatsApp ile tek tıkla sipariş veya teklif alabilirsiniz.'}</p>
              </div>
              ${isMulti ? `
                <a href="katalog.html" class="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-dark transition-all self-start md:self-auto shadow-sm flex items-center gap-1">
                  <span>Tüm Kataloğu Gör</span>
                  <span>→</span>
                </a>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              ${config.products.items.slice(0, 6).map((prod, pIdx) => {
                const prodSlug = prod.slug || `urun-${pIdx + 1}`;
                const prodUrl = `urun-${prodSlug}.html`;
                return `
                <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                  <div>
                    <a href="${isMulti ? prodUrl : '#contact'}" class="block aspect-4/3 bg-slate-100 relative overflow-hidden">
                      <img id="prod-img-${pIdx}" src="${prod.featuredImage || prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80'}" alt="${prod.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                      ${prod.badge ? `<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black shadow-md">${prod.badge}</span>` : ''}
                      <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold">${prod.category}</span>
                    </a>

                    <div class="p-6">
                      <h3 class="font-bold text-slate-900 text-lg mb-2 group-hover:text-brand transition-colors">
                        <a href="${isMulti ? prodUrl : '#contact'}" data-i18n-product-title="${prod.id}">${prod.title}</a>
                      </h3>
                      <div class="text-slate-600 text-xs leading-relaxed mb-4 prose-rendered line-clamp-2" data-i18n-product-desc="${prod.id}">
                        ${prod.description}
                      </div>
                      ${(() => {
                        const taxCfg = getEffectiveTaxConfig(config);
                        const taxInfo = calculateProductTax(prod, taxCfg);
                        const showBadge = taxCfg.displayVatBadge !== false;
                        const displayPrice = taxCfg.priceIncludesVat ? taxInfo.formattedGross : taxInfo.formattedNet;
                        return `
                        <div class="flex items-baseline gap-2 mb-3 flex-wrap">
                          <span class="text-2xl font-black text-brand">${displayPrice}</span>
                          ${prod.oldPrice ? `<span class="text-xs text-slate-400 line-through">${prod.oldPrice}</span>` : ''}
                          ${showBadge ? `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${taxInfo.priceIncludesVat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">${taxInfo.badgeText}</span>` : ''}
                        </div>
                        `;
                      })()}
                    </div>
                  </div>

                  <div class="p-6 pt-0 space-y-2">
                    ${isMulti ? `
                      <a href="${prodUrl}" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                        <span>🔍 Ürün Detayını İncele</span>
                        <span>→</span>
                      </a>
                    ` : ''}
                    <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba, "${prod.title}" ürünü/hizmeti hakkında bilgi ve sipariş vermek istiyorum. Fiyat: ${prod.price}`)}" target="_blank" rel="noopener noreferrer" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
                      <span>💬 WhatsApp İle Sipariş / Teklif</span>
                    </a>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>
        `;
      }

      // 4. ABOUT SECTION
      if (section.id === "about" && config.about.enabled) {
        return `
        <section id="about" class="py-20 bg-white border-t border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-brand mb-2">${config.about.badge || 'Hakkımızda'}</div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-6" data-i18n="aboutTitle">${config.about.title}</h2>
                <div class="text-slate-600 text-base leading-relaxed mb-6 prose-rendered" data-i18n="aboutContent">
                  ${config.about.content}
                </div>
                
                <ul class="space-y-3 mb-8">
                  ${config.about.bullets.map(b => `
                    <li class="flex items-center gap-3 text-slate-700 font-medium text-sm">
                      <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      <span>${b}</span>
                    </li>
                  `).join('')}
                </ul>

                ${isMulti ? `
                  <div class="mb-8">
                    <a href="kurumsal.html" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-dark transition-all shadow-md">
                      <span>Kurumsal Detay Sayfası</span>
                      <span>→</span>
                    </a>
                  </div>
                ` : ''}

                <div class="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                  <div>
                    <div class="text-2xl font-black text-brand">${config.about.yearsExperience || '10+'}</div>
                    <div class="text-xs text-slate-500 font-semibold">Yıllık Tecrübe</div>
                  </div>
                  <div class="h-8 w-px bg-slate-200"></div>
                  <div>
                    <div class="text-2xl font-black text-slate-800">${config.about.completedProjects || '5.000+'}</div>
                    <div class="text-xs text-slate-500 font-semibold">Başarılı İşlem</div>
                  </div>
                  <div class="h-8 w-px bg-slate-200"></div>
                  <div>
                    <div class="text-2xl font-black text-emerald-600">%100</div>
                    <div class="text-xs text-slate-500 font-semibold">Müşteri Memnuniyeti</div>
                  </div>
                </div>
              </div>

              <div class="relative">
                <div class="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100">
                  <img src="${config.about.image || slides[0]?.bgImage}" alt="${config.companyName}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="absolute -bottom-5 -left-5 bg-brand text-white p-5 rounded-2xl shadow-xl hidden sm:block">
                  <div class="text-lg font-bold">Resmi & Güvenilir Firma</div>
                  <div class="text-xs text-white/80">${config.city} ve Çevresi</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        `;
      }

      // 5. WHY US
      if (section.id === "whyUs" && config.whyUs.enabled) {
        return `
        <section class="py-20 bg-slate-900 text-white border-t border-slate-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400">${config.whyUs.badge || 'Neden Biz?'}</span>
              <h2 class="text-3xl font-black text-white mt-2">${config.whyUs.title}</h2>
              <p class="text-slate-400 text-sm mt-3">${config.whyUs.subtitle}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              ${config.whyUs.items.map(item => `
                <div class="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-5">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">★</div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">${item.title}</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">${item.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
        `;
      }

      // 6. BLOG SECTION
      if (section.id === "blog" && config.blog?.enabled && config.blog.items.length > 0) {
        return `
        <section id="blog" class="py-20 bg-white border-t border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-brand mb-2">${config.blog.badge || 'Rehber & Blog'}</div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">${config.blog.title}</h2>
                <p class="text-slate-600 text-sm mt-2 max-w-xl">${config.blog.subtitle}</p>
              </div>
              ${isMulti ? `
                <a href="blog.html" class="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all self-start md:self-auto">
                  Tüm Blog Yazıları →
                </a>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${config.blog.items.slice(0, (config.blog as any)?.featuredCount || 3).map((b, bIdx) => {
                const blogSlug = b.slug || `blog-${bIdx + 1}`;
                const articleUrl = `blog-${blogSlug}.html`;
                const cover = b.coverImage || b.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
                return `
                <div class="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                  <div>
                    <a href="${isMulti ? articleUrl : '#contact'}" class="block aspect-16/9 bg-slate-200 overflow-hidden">
                      <img src="${cover}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                    </a>
                    <div class="p-6">
                      <div class="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-2">
                        <span>📅 ${b.date}</span>
                        <span>•</span>
                        <span>⏱️ ${b.readTime}</span>
                        ${b.category ? `<span>•</span><span class="text-amber-600 font-bold">${b.category}</span>` : ''}
                      </div>
                      <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors">
                        <a href="${isMulti ? articleUrl : '#contact'}">${b.title}</a>
                      </h3>
                      <p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">${b.excerpt}</p>
                    </div>
                  </div>
                  <div class="p-6 pt-0 flex justify-between items-center border-t border-slate-200/60 pt-4">
                    <a href="${isMulti ? articleUrl : '#contact'}" class="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                      <span>Makale Detayını Oku</span>
                      <span>→</span>
                    </a>
                    <span class="text-[11px] text-slate-400 font-semibold">${b.author}</span>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>
        `;
      }

      // TESTIMONIALS SECTION
      if (section.id === "testimonials" && config.testimonials?.enabled && config.testimonials.items && config.testimonials.items.length > 0) {
        const totalRatings = config.testimonials.items.reduce((sum, item) => sum + (Number(item.rating) || 5), 0);
        const avgRating = (totalRatings / config.testimonials.items.length).toFixed(1);

        return `
        <section id="testimonials" class="py-20 bg-white border-t border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-14">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-3">
                <span>⭐</span>
                <span>${config.testimonials.badge || 'Müşteri Yorumları'}</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                ${config.testimonials.title || 'Müşterilerimiz Ne Diyor?'}
              </h2>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                ${config.testimonials.subtitle || 'Hizmetlerimizden yararlanan müşterilerimizin gerçek deneyimleri ve puanlamaları.'}
              </p>

              ${config.testimonials.showRatingStats !== false ? `
              <div class="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <div class="flex items-center text-amber-400 text-base tracking-widest">
                  ★★★★★
                </div>
                <div class="text-xs font-bold text-slate-800">
                  <span class="text-amber-600 font-black text-sm">${avgRating}</span> / 5.0
                  <span class="text-slate-400 font-medium ml-1">(${config.testimonials.items.length} Doğrulanmış Değerlendirme)</span>
                </div>
                ${config.testimonials.googleRatingBadge !== false ? `
                <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <span class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  %100 Memnuniyet
                </span>
                ` : ''}
              </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              ${config.testimonials.items.map((item) => {
                const ratingCount = Math.max(1, Math.min(5, Math.round(Number(item.rating) || 5)));
                const starsHtml = Array.from({ length: 5 }, (_, i) => 
                  i < ratingCount 
                    ? '<span class="text-amber-400 text-lg">★</span>' 
                    : '<span class="text-slate-200 text-lg">★</span>'
                ).join('');

                const initials = (item.name || 'M')
                  .split(' ')
                  .filter(Boolean)
                  .map(part => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'M';

                return `
                <div class="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 group">
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center tracking-tight" title="${ratingCount} Yıldız">
                        ${starsHtml}
                      </div>
                      ${item.date ? `<span class="text-[11px] font-medium text-slate-400 font-mono">${item.date}</span>` : ''}
                    </div>

                    <div class="text-slate-700 text-sm leading-relaxed mb-6 italic relative">
                      <span class="text-2xl text-brand/30 font-serif leading-none mr-1 select-none">“</span>
                      ${item.comment}
                      <span class="text-2xl text-brand/30 font-serif leading-none ml-1 select-none">”</span>
                    </div>
                  </div>

                  <div class="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      ${item.avatar ? `
                        <img 
                          src="${item.avatar}" 
                          alt="${item.name}" 
                          class="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                          loading="lazy"
                          onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';"
                        />
                        <div class="w-11 h-11 rounded-full bg-brand text-white font-bold text-xs hidden items-center justify-center shadow-xs shrink-0">
                          ${initials}
                        </div>
                      ` : `
                        <div class="w-11 h-11 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          ${initials}
                        </div>
                      `}
                      <div class="min-w-0">
                        <div class="font-bold text-slate-900 text-sm truncate">
                          ${item.name}
                        </div>
                        <div class="text-xs text-slate-500 truncate">
                          ${item.role || item.company || 'Müşteri'}
                        </div>
                      </div>
                    </div>

                    ${item.verified !== false ? `
                      <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0 flex items-center gap-1" title="Doğrulanmış Deneyim">
                        <span class="text-emerald-500 font-bold text-xs">✓</span>
                        <span class="hidden sm:inline">Onaylı</span>
                      </span>
                    ` : ''}
                  </div>
                </div>
                `;
              }).join('')}
            </div>

            <div class="mt-12 text-center">
              <p class="text-xs sm:text-sm text-slate-500 mb-3">
                Siz de kaliteli ve garantili hizmet almak için hemen iletişime geçin.
              </p>
              <div class="inline-flex items-center gap-3">
                <a href="#contact" class="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-opacity-90 shadow-sm transition-all">
                  Teklif / Randevu Al
                </a>
                <a href="https://wa.me/${config.whatsapp}" class="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5">
                  <span>💬</span>
                  <span>WhatsApp'tan Yazın</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        `;
      }

      // SOCIAL MEDIA FEED INTEGRATION (INSTAGRAM & X POSTS)
      if (section.id === "socialFeed" && config.socialFeed?.enabled && config.socialFeed.posts && config.socialFeed.posts.length > 0) {
        const feed = config.socialFeed;
        const postsLimit = feed.postsLimit || 6;
        const activePlatforms = feed.activePlatforms || ["instagram", "twitter"];
        const visiblePosts = feed.posts
          .filter(p => activePlatforms.includes(p.platform))
          .slice(0, postsLimit);

        const instagramPostsCount = feed.posts.filter(p => p.platform === "instagram").length;
        const twitterPostsCount = feed.posts.filter(p => p.platform === "twitter").length;
        const layout = feed.layout || "grid";

        return `
        <section id="social-feed" class="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-20 relative overflow-hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <span>📱</span>
                <span>${feed.badge || 'Canlı Sosyal Akış & Medya Vitrini'}</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                ${feed.title || 'Instagram & X (Twitter)\'da Bizi Takip Edin'}
              </h2>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                ${feed.subtitle || 'En güncel saha operasyonlarımız, müşteri referanslarımız ve önemli duyurularımız anlık olarak sosyal medya hesaplarımızda.'}
              </p>

              <!-- Social Follow Quick Action Buttons -->
              <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
                ${feed.instagramHandle ? `
                <a href="${feed.instagramProfileUrl || `https://instagram.com/${feed.instagramHandle.replace('@', '')}`}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span>@${feed.instagramHandle.replace('@', '')}</span>
                  ${feed.instagramFollowers ? `<span class="bg-white/20 text-[11px] px-2 py-0.5 rounded-full font-mono font-medium">${feed.instagramFollowers} Takipçi</span>` : ''}
                </a>
                ` : ''}

                ${feed.twitterHandle ? `
                <a href="${feed.twitterProfileUrl || `https://x.com/${feed.twitterHandle.replace('@', '')}`}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>@${feed.twitterHandle.replace('@', '')}</span>
                  ${feed.twitterFollowers ? `<span class="bg-white/10 text-slate-300 text-[11px] px-2 py-0.5 rounded-full font-mono font-medium">${feed.twitterFollowers} Takipçi</span>` : ''}
                </a>
                ` : ''}
              </div>

              <!-- Platform Interactive Filter Pills -->
              <div class="flex flex-wrap items-center justify-center gap-2 mt-8">
                <button type="button" onclick="filterSocialFeed('all', this)" class="social-feed-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-slate-900 text-white shadow-xs cursor-pointer active-filter" data-social-filter="all">
                  Tümü (${visiblePosts.length})
                </button>
                ${instagramPostsCount > 0 ? `
                <button type="button" onclick="filterSocialFeed('instagram', this)" class="social-feed-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center gap-1.5" data-social-filter="instagram">
                  <span class="w-2 h-2 rounded-full bg-pink-500"></span>
                  <span>Instagram (${instagramPostsCount})</span>
                </button>
                ` : ''}
                ${twitterPostsCount > 0 ? `
                <button type="button" onclick="filterSocialFeed('twitter', this)" class="social-feed-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center gap-1.5" data-social-filter="twitter">
                  <span class="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span>X (Twitter) (${twitterPostsCount})</span>
                </button>
                ` : ''}
              </div>
            </div>

            <!-- Posts Layout Container -->
            ${layout === 'carousel' ? `
            <div class="relative group">
              <!-- Carousel Scroll Controls -->
              <button type="button" onclick="scrollSocialFeed(-1)" class="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 items-center justify-center hover:bg-slate-50 transition-all cursor-pointer opacity-90 hover:opacity-100" title="Geri">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button type="button" onclick="scrollSocialFeed(1)" class="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 items-center justify-center hover:bg-slate-50 transition-all cursor-pointer opacity-90 hover:opacity-100" title="İleri">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
              </button>

              <div id="socialFeedCarouselTrack" class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;">
            ` : layout === 'masonry' ? `
            <div id="socialFeedGrid" class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
            ` : `
            <div id="socialFeedGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            `}

              ${visiblePosts.map((post) => {
                const isIg = post.platform === "instagram";
                const isPinned = post.pinned;

                if (isIg) {
                  return `
                  <div class="social-post-card group relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col ${layout === 'carousel' ? 'w-[320px] sm:w-[350px] shrink-0 snap-start' : 'break-inside-avoid'}" data-platform="instagram">
                    ${isPinned ? `
                    <div class="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <span>📌</span>
                      <span>Sabitlendi</span>
                    </div>
                    ` : ''}

                    <!-- Instagram Header -->
                    <div class="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shrink-0">
                          <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=100&q=80'}" alt="${post.authorName}" class="w-full h-full object-cover rounded-full bg-white" />
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1">
                            <span class="text-xs font-bold text-slate-900 truncate">${post.authorHandle || '@instagram'}</span>
                            ${post.isVerified ? `
                            <svg class="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            ` : ''}
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono block">${post.timestamp}</span>
                        </div>
                      </div>

                      <a href="${post.postUrl || (feed.instagramProfileUrl || 'https://instagram.com')}" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:text-pink-700 p-1.5 rounded-lg hover:bg-pink-50 transition-colors" title="Instagram'da Gör">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    </div>

                    <!-- Instagram Media with interactive zoom and overlay -->
                    ${post.mediaUrl ? `
                    <div class="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer" onclick="openSocialMediaModal('${post.id}')">
                      <img src="${post.mediaUrl}" alt="${post.authorName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      
                      <!-- Overlay on hover -->
                      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 text-white">
                        <div class="flex items-center gap-3 text-xs font-bold">
                          <span class="flex items-center gap-1">
                            <span>❤️</span>
                            <span>${post.likesCount || 120}</span>
                          </span>
                          <span class="flex items-center gap-1">
                            <span>💬</span>
                            <span>${post.commentsCount || 14}</span>
                          </span>
                        </div>
                        <span class="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-xs text-[11px] font-bold">Görsele Dokun 🔍</span>
                      </div>
                    </div>
                    ` : ''}

                    <!-- Caption & Details -->
                    ${feed.showCaptions !== false ? `
                    <div class="p-4 flex-1 flex flex-col justify-between">
                      <p class="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        ${post.content}
                      </p>

                      ${post.hashtags && post.hashtags.length > 0 ? `
                      <div class="flex flex-wrap gap-1 mt-2.5">
                        ${post.hashtags.slice(0, 3).map(h => `<span class="text-[11px] font-medium text-pink-600 hover:underline">${h}</span>`).join(' ')}
                      </div>
                      ` : ''}

                      ${feed.showEngagement !== false ? `
                      <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-slate-500 text-xs">
                        <div class="flex items-center gap-3">
                          <span class="flex items-center gap-1 text-slate-600 font-medium">
                            <span class="text-pink-500">❤️</span>
                            <span>${post.likesCount || 0}</span>
                          </span>
                          <span class="flex items-center gap-1 text-slate-600 font-medium">
                            <span>💬</span>
                            <span>${post.commentsCount || 0}</span>
                          </span>
                        </div>
                        <a href="${post.postUrl || (feed.instagramProfileUrl || 'https://instagram.com')}" target="_blank" rel="noopener noreferrer" class="text-pink-600 font-bold hover:underline flex items-center gap-1 text-[11px]">
                          <span>Instagram'da Aç</span>
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                      </div>
                      ` : ''}
                    </div>
                    ` : ''}
                  </div>
                  `;
                }

                // TWITTER / X CARD
                return `
                <div class="social-post-card group relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between ${layout === 'carousel' ? 'w-[320px] sm:w-[350px] shrink-0 snap-start' : 'break-inside-avoid'}" data-platform="twitter">
                  ${isPinned ? `
                  <div class="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <span>📌</span>
                    <span>Sabitlendi</span>
                  </div>
                  ` : ''}

                  <!-- X Tweet Header -->
                  <div>
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=100&q=80'}" alt="${post.authorName}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                        <div class="min-w-0">
                          <div class="flex items-center gap-1">
                            <span class="text-xs font-bold text-slate-900 truncate">${post.authorName}</span>
                            ${post.isVerified ? `
                            <svg class="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            ` : ''}
                          </div>
                          <span class="text-[11px] text-slate-500 font-mono block">${post.authorHandle || '@x'}</span>
                        </div>
                      </div>

                      <div class="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </div>
                    </div>

                    <!-- Tweet Content -->
                    <p class="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      ${post.content}
                    </p>

                    ${post.mediaUrl ? `
                    <div class="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer" onclick="openSocialMediaModal('${post.id}')">
                      <img src="${post.mediaUrl}" alt="X tweet görseli" class="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300" loading="lazy" />
                    </div>
                    ` : ''}
                  </div>

                  <!-- Tweet Engagement Footer -->
                  <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
                    <span class="text-[11px] text-slate-400 font-mono">${post.timestamp}</span>

                    ${feed.showEngagement !== false ? `
                    <div class="flex items-center gap-3">
                      <span class="flex items-center gap-1 hover:text-emerald-600 transition-colors" title="Retweet">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span class="text-[11px] font-mono">${post.retweetsCount || 0}</span>
                      </span>
                      <span class="flex items-center gap-1 hover:text-rose-600 transition-colors" title="Beğeni">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span class="text-[11px] font-mono">${post.likesCount || 0}</span>
                      </span>
                    </div>
                    ` : ''}

                    <a href="${post.postUrl || (feed.twitterProfileUrl || 'https://x.com')}" target="_blank" rel="noopener noreferrer" class="text-slate-900 font-bold hover:underline flex items-center gap-1 text-[11px]">
                      <span>X'te İncele</span>
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  </div>
                </div>
                `;
              }).join('')}

            </div>
            ${layout === 'carousel' ? `</div>` : ''}
          </div>

          <!-- Social Lightbox Modal (Full view for media posts) -->
          <div id="socialFeedModal" class="fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200">
            <div class="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6">
              <button type="button" onclick="closeSocialMediaModal()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer" title="Kapat">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div class="md:w-1/2 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden min-h-[260px]">
                <img id="modalSocialImg" src="" alt="Sosyal Medya Görseli" class="w-full h-auto max-h-[400px] object-cover" />
              </div>

              <div class="md:w-1/2 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <span id="modalSocialPlatformBadge" class="px-2.5 py-0.5 rounded-full text-xs font-bold"></span>
                    <span id="modalSocialTime" class="text-xs text-slate-400 font-mono"></span>
                  </div>
                  <h4 id="modalSocialAuthor" class="text-sm font-bold text-slate-900 mb-2"></h4>
                  <p id="modalSocialContent" class="text-xs text-slate-700 leading-relaxed whitespace-pre-line"></p>
                </div>

                <div class="pt-5 mt-5 border-t border-slate-100">
                  <div class="flex items-center gap-4 text-xs font-medium text-slate-600 mb-4">
                    <span id="modalSocialLikes"></span>
                    <span id="modalSocialComments"></span>
                  </div>
                  <a id="modalSocialLink" href="#" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    <span>Orijinal Gönderiyi Sosyal Medyada Aç</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Vanilla Interactive Scripts for Social Feed -->
          <script>
            (function() {
              const postsData = ${JSON.stringify(visiblePosts.map(p => ({
                id: p.id,
                platform: p.platform,
                authorName: p.authorName,
                authorHandle: p.authorHandle,
                content: p.content,
                mediaUrl: p.mediaUrl,
                timestamp: p.timestamp,
                likesCount: p.likesCount,
                commentsCount: p.commentsCount,
                retweetsCount: p.retweetsCount,
                postUrl: p.postUrl
              })))};

              window.filterSocialFeed = function(platform, btn) {
                const buttons = document.querySelectorAll('.social-feed-filter-btn');
                buttons.forEach(b => {
                  b.classList.remove('bg-slate-900', 'text-white');
                  b.classList.add('bg-white', 'text-slate-700');
                });
                if (btn) {
                  btn.classList.remove('bg-white', 'text-slate-700');
                  btn.classList.add('bg-slate-900', 'text-white');
                }

                const cards = document.querySelectorAll('.social-post-card');
                cards.forEach(card => {
                  const cardPlatform = card.getAttribute('data-platform');
                  if (platform === 'all' || cardPlatform === platform) {
                    card.style.display = '';
                    card.style.opacity = '1';
                  } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                  }
                });
              };

              window.scrollSocialFeed = function(dir) {
                const track = document.getElementById('socialFeedCarouselTrack');
                if (track) {
                  const scrollAmount = 340 * dir;
                  track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
              };

              window.openSocialMediaModal = function(postId) {
                const post = postsData.find(p => p.id === postId);
                if (!post) return;

                const modal = document.getElementById('socialFeedModal');
                const img = document.getElementById('modalSocialImg');
                const badge = document.getElementById('modalSocialPlatformBadge');
                const time = document.getElementById('modalSocialTime');
                const author = document.getElementById('modalSocialAuthor');
                const content = document.getElementById('modalSocialContent');
                const likes = document.getElementById('modalSocialLikes');
                const comments = document.getElementById('modalSocialComments');
                const link = document.getElementById('modalSocialLink');

                if (img) img.src = post.mediaUrl || '';
                if (badge) {
                  if (post.platform === 'instagram') {
                    badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700';
                    badge.innerText = '📸 Instagram';
                  } else {
                    badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white';
                    badge.innerText = '𝕏 X (Twitter)';
                  }
                }
                if (time) time.innerText = post.timestamp || '';
                if (author) author.innerText = post.authorName + ' (' + post.authorHandle + ')';
                if (content) content.innerText = post.content || '';
                if (likes) likes.innerText = '❤️ ' + (post.likesCount || 0) + ' Beğeni';
                if (comments) comments.innerText = post.platform === 'instagram' ? ('💬 ' + (post.commentsCount || 0) + ' Yorum') : ('🔁 ' + (post.retweetsCount || 0) + ' Retweet');
                if (link) link.href = post.postUrl || '#';

                if (modal) {
                  modal.classList.remove('hidden');
                  document.body.style.overflow = 'hidden';
                }
              };

              window.closeSocialMediaModal = function() {
                const modal = document.getElementById('socialFeedModal');
                if (modal) {
                  modal.classList.add('hidden');
                  document.body.style.overflow = '';
                }
              };

              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  closeSocialMediaModal();
                }
              });

              // Click backdrop to close
              const modal = document.getElementById('socialFeedModal');
              if (modal) {
                modal.addEventListener('click', function(e) {
                  if (e.target === modal) {
                    closeSocialMediaModal();
                  }
                });
              }
            })();
          </script>
        </section>
        `;
      }

      // IMAGE GALLERY & MASONRY VITRINE SECTION
      if (section.id === "gallery" && config.gallery?.enabled && config.gallery.items && config.gallery.items.length > 0) {
        const galItems = config.gallery.items;
        const categories = Array.from(new Set(galItems.map(item => item.category?.trim()).filter(Boolean)));
        const isMasonry = config.gallery.layout !== "grid";
        const cols = config.gallery.columns || 3;
        
        const layoutContainerClass = isMasonry
          ? (cols === 2 ? 'columns-1 sm:columns-2 gap-4 sm:gap-6 [column-fill:_balance]' : cols === 4 ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 [column-fill:_balance]' : 'columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 [column-fill:_balance]')
          : (cols === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : cols === 4 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6');

        return `
        <section id="gallery" class="py-20 bg-slate-50/70 border-t border-slate-200 scroll-mt-20 relative">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-3">
                <span>📸</span>
                <span>${config.gallery.badge || 'Fotoğraf Galerisi'}</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                ${config.gallery.title || 'Çalışmalarımız ve Fotoğraf Vitrini'}
              </h2>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                ${config.gallery.subtitle || 'Gerçekleştirdiğimiz projelerden, saha operasyonlarımızdan ve referanslarımızdan kareler.'}
              </p>

              ${categories.length > 1 ? `
              <!-- Dynamic Category Filter Pills -->
              <div class="flex flex-wrap items-center justify-center gap-2 mt-8">
                <button type="button" onclick="filterGalleryCategory('Tümü', this)" class="gallery-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-brand text-white shadow-xs cursor-pointer" data-category="Tümü">
                  Tümü (${galItems.length})
                </button>
                ${categories.map((cat) => {
                  const count = galItems.filter(it => it.category?.trim() === cat).length;
                  return `
                    <button type="button" onclick="filterGalleryCategory('${cat}', this)" class="gallery-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer" data-category="${cat}">
                      ${cat} (${count})
                    </button>
                  `;
                }).join('')}
              </div>
              ` : ''}
            </div>

            <!-- Masonry / Grid Container -->
            <div id="galleryContainer" class="${layoutContainerClass}">
              ${galItems.map((item, idx) => {
                const ratioClass = item.aspectRatio === 'square' 
                  ? 'aspect-square' 
                  : item.aspectRatio === 'portrait' 
                    ? 'aspect-3/4' 
                    : item.aspectRatio === 'landscape' 
                      ? 'aspect-16/10' 
                      : 'h-auto';

                return `
                <div class="gallery-item-card break-inside-avoid mb-4 sm:mb-6 group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-200/80"
                     data-category="${item.category || 'Genel'}"
                     data-index="${idx}"
                     onclick="openGalleryLightbox(${idx})">
                  <div class="relative w-full overflow-hidden bg-slate-950">
                    <img src="${item.imageUrl}" 
                         alt="${item.title || 'Galeri Görseli'}"
                         loading="lazy"
                         class="w-full ${ratioClass} object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                         onerror="this.parentElement.parentElement.style.display='none'" />
                    
                    <!-- Permanent Badge on mobile / Overlay -->
                    <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10 z-10">
                      ${item.category || 'Galeri'}
                    </div>

                    <!-- Zoom Icon -->
                    <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-1 group-hover:translate-y-0 duration-200 z-10">
                      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                    </div>

                    <!-- Gradient Overlay on Hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                      <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 class="text-base font-bold text-white leading-tight">
                          ${item.title || 'Fotoğraf'}
                        </h4>
                        ${item.caption ? `
                          <p class="text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                            ${item.caption}
                          </p>
                        ` : ''}
                        <div class="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-semibold pt-2 border-t border-white/15">
                          <span class="flex items-center gap-1">
                            <span>🔍</span> Tam ekran büyüt
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>

            <!-- Bottom CTA -->
            <div class="mt-12 text-center">
              <p class="text-xs sm:text-sm text-slate-500 mb-3">
                Sizin de projeniz veya operasyonunuz için profesyonel destek sağlayalım.
              </p>
              <div class="inline-flex items-center gap-3">
                <a href="#contact" class="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-opacity-90 shadow-sm transition-all">
                  Hemen Teklif Alın
                </a>
                <a href="https://wa.me/${config.whatsapp}" class="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5">
                  <span>💬 WhatsApp Bilgi</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Lightbox Modal -->
          <div id="galleryLightboxModal" class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md hidden opacity-0 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-6" role="dialog" aria-modal="true">
            <div class="flex items-center justify-between text-white max-w-7xl mx-auto w-full pt-2">
              <div class="flex items-center gap-3">
                <span id="lightboxCategory" class="px-3 py-1 rounded-full bg-brand text-xs font-bold uppercase tracking-wider text-white"></span>
                <span id="lightboxCounter" class="text-xs text-slate-400 font-mono font-semibold"></span>
              </div>
              <button type="button" onclick="closeGalleryLightbox()" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer" aria-label="Kapat">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="relative flex-1 flex items-center justify-center py-4 max-w-5xl mx-auto w-full min-h-0">
              <button type="button" onclick="navigateGalleryLightbox(-1)" class="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg" aria-label="Önceki">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              <img id="lightboxImg" src="" alt="" class="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none" />

              <button type="button" onclick="navigateGalleryLightbox(1)" class="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg" aria-label="Sonraki">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div class="max-w-3xl mx-auto w-full text-center text-white pb-3 space-y-1">
              <h3 id="lightboxTitle" class="text-base sm:text-lg font-bold"></h3>
              <p id="lightboxCaption" class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto"></p>
            </div>
          </div>

          <script>
            (function() {
              const galleryItemsData = ${JSON.stringify(galItems.map(it => ({
                title: it.title,
                category: it.category,
                imageUrl: it.imageUrl,
                caption: it.caption || ""
              })))};

              let currentLightboxIndex = 0;

              window.openGalleryLightbox = function(index) {
                if (!galleryItemsData || !galleryItemsData[index]) return;
                currentLightboxIndex = index;
                updateLightboxContent();
                const modal = document.getElementById('galleryLightboxModal');
                if (modal) {
                  modal.classList.remove('hidden');
                  setTimeout(function() { modal.classList.remove('opacity-0'); }, 10);
                  document.body.style.overflow = 'hidden';
                }
              };

              window.closeGalleryLightbox = function() {
                const modal = document.getElementById('galleryLightboxModal');
                if (modal) {
                  modal.classList.add('opacity-0');
                  setTimeout(function() {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                  }, 250);
                }
              };

              window.navigateGalleryLightbox = function(direction) {
                currentLightboxIndex = (currentLightboxIndex + direction + galleryItemsData.length) % galleryItemsData.length;
                updateLightboxContent();
              };

              function updateLightboxContent() {
                const item = galleryItemsData[currentLightboxIndex];
                if (!item) return;
                const img = document.getElementById('lightboxImg');
                const title = document.getElementById('lightboxTitle');
                const caption = document.getElementById('lightboxCaption');
                const category = document.getElementById('lightboxCategory');
                const counter = document.getElementById('lightboxCounter');

                if (img) img.src = item.imageUrl;
                if (title) title.textContent = item.title;
                if (caption) caption.textContent = item.caption || '';
                if (category) category.textContent = item.category || 'Galeri';
                if (counter) counter.textContent = (currentLightboxIndex + 1) + ' / ' + galleryItemsData.length;
              }

              window.filterGalleryCategory = function(category, btnElement) {
                const buttons = document.querySelectorAll('.gallery-filter-btn');
                buttons.forEach(function(b) {
                  b.classList.remove('bg-brand', 'text-white', 'shadow-xs');
                  b.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200');
                });
                if (btnElement) {
                  btnElement.classList.add('bg-brand', 'text-white', 'shadow-xs');
                  btnElement.classList.remove('bg-white', 'text-slate-700', 'border', 'border-slate-200');
                }

                const cards = document.querySelectorAll('.gallery-item-card');
                cards.forEach(function(card) {
                  const cardCat = card.getAttribute('data-category');
                  if (category === 'Tümü' || cardCat === category) {
                    card.style.display = '';
                  } else {
                    card.style.display = 'none';
                  }
                });
              };

              document.addEventListener('keydown', function(e) {
                const modal = document.getElementById('galleryLightboxModal');
                if (!modal || modal.classList.contains('hidden')) return;
                if (e.key === 'Escape') closeGalleryLightbox();
                if (e.key === 'ArrowLeft') navigateGalleryLightbox(-1);
                if (e.key === 'ArrowRight') navigateGalleryLightbox(1);
              });
            })();
          </script>
        </section>
        `;
      }

      // NEWSLETTER SUBSCRIPTION SECTION
      if (section.id === "newsletter" && config.newsletter?.enabled && config.newsletter.displayLocation !== "footer") {
        return `
        <section id="newsletter" class="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-t border-slate-800">
          <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span>${config.newsletter.badge || 'E-Bülten Aboneliği'}</span>
            </div>
            
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              ${config.newsletter.title || 'Kampanyalar ve İndirimlerden İlk Siz Haberdar Olun'}
            </h2>
            
            <p class="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-8 leading-relaxed">
              ${config.newsletter.subtitle || 'Yeni hizmetlerimiz, avantajlı paketler ve sektörel duyurular doğrudan e-posta kutunuza gelsin.'}
            </p>

            <form onsubmit="handleNewsletterSubmit(event, 'Ana Sayfa Bölümü', 'sectionNewsletterEmail', 'sectionNewsletterAlert')" class="max-w-md mx-auto space-y-3">
              <div class="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  id="sectionNewsletterEmail"
                  required 
                  placeholder="${config.newsletter.placeholder || 'E-posta adresinizi giriniz...'}" 
                  class="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-mono"
                />
                <button 
                  type="submit" 
                  class="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  ${config.newsletter.buttonText || 'Abone Ol'}
                </button>
              </div>

              <div id="sectionNewsletterAlert" class="hidden p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                ✓ ${config.newsletter.successMessage || 'Harika! E-bülten listemize başarıyla kaydoldunuz.'}
              </div>

              <p class="text-[11px] text-slate-500">
                🔒 ${config.newsletter.privacyNote || 'Spam göndermiyoruz. İstediğiniz zaman tek tıkla ayrılabilirsiniz.'}
              </p>
            </form>
          </div>
        </section>
        `;
      }

      // 7. FAQ ACCORDION SECTION
      const faqConfig = config.faqs || config.faq;
      if (section.id === "faqs" && faqConfig?.enabled && faqConfig.items && faqConfig.items.length > 0) {
        const isTwoCols = faqConfig.layout === "two-columns" && faqConfig.items.length >= 4;
        const allowMultiple = faqConfig.allowMultipleOpen ? "true" : "false";

        // Extract categories
        const categories = Array.from(
          new Set(
            faqConfig.items
              .map(f => f.category?.trim())
              .filter(Boolean)
          )
        ) as string[];

        // Schema.org FAQPage JSON-LD
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqConfig.items.map(f => ({
            "@type": "Question",
            "name": f.question || f.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer || f.a
            }
          }))
        };

        return `
        <section id="faqs" class="py-20 sm:py-24 bg-slate-50/80 border-t border-slate-200 scroll-mt-20" data-allow-multiple="${allowMultiple}">
          <!-- Google SEO FAQPage JSON-LD Structured Data -->
          <script type="application/ld+json">
            ${JSON.stringify(faqSchema)}
          </script>

          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-3">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>${faqConfig.badge || 'Sıkça Sorulanlar'}</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight" data-i18n="faqsTitle">
                ${faqConfig.title || 'Merak Edilen Konular & SSS'}
              </h2>
              <p class="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed" data-i18n="faqsSubtitle">
                ${faqConfig.subtitle || 'Hizmetlerimiz, süreçlerimiz ve güvencelerimiz hakkında en çok merak edilen sorular.'}
              </p>
            </div>

            <!-- Optional Search & Category Filters -->
            ${(categories.length > 1 || faqConfig.items.length >= 5) ? `
              <div class="mb-8 space-y-4 max-w-2xl mx-auto">
                ${faqConfig.items.length >= 5 ? `
                  <div class="relative">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" 
                      oninput="searchFaq(this.value)" 
                      placeholder="Sorularda veya cevaplarda anahtar kelime ara..." 
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand outline-hidden shadow-xs transition-all"
                    />
                  </div>
                ` : ''}

                ${categories.length > 1 ? `
                  <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <button 
                      type="button" 
                      onclick="filterFaqCategory('all', this)" 
                      class="faq-category-btn px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-900 text-white shadow-xs"
                    >
                      Tümü (${faqConfig.items.length})
                    </button>
                    ${categories.map(cat => {
                      const count = faqConfig.items.filter(f => (f.category?.trim() || '') === cat).length;
                      return `
                        <button 
                          type="button" 
                          onclick="filterFaqCategory('${cat.replace(/'/g, "\\'")}', this)" 
                          class="faq-category-btn px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        >
                          ${cat} (${count})
                        </button>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- Accordion Items Container -->
            <div id="faqAccordionContainer" class="${isTwoCols ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start' : 'max-w-3xl sm:max-w-4xl mx-auto space-y-3.5'}">
              ${faqConfig.items.map((faq, idx) => {
                const q = faq.question || faq.q || 'Soru';
                const a = faq.answer || faq.a || 'Cevap';
                const cat = faq.category?.trim() || '';
                const isOpen = !!faq.isOpenDefault;

                return `
                <div 
                  class="faq-accordion-item rounded-2xl border ${isOpen ? 'ring-2 ring-brand/20 border-brand' : 'border-slate-200/90'} bg-white shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
                  data-faq-item
                  data-faq-cat="${cat}"
                >
                  <button 
                    type="button" 
                    onclick="handleAccordionToggle(this, '${idx}')" 
                    class="faq-trigger w-full px-5 sm:px-6 py-4 sm:py-5 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    aria-expanded="${isOpen ? 'true' : 'false'}"
                    aria-controls="faq-content-${idx}"
                  >
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                      <span class="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-black flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        ${idx + 1}
                      </span>
                      <div class="flex-1 min-w-0">
                        ${cat ? `
                          <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-brand/90 mb-1">
                            ${cat}
                          </span>
                        ` : ''}
                        <span class="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-brand transition-colors block" data-i18n-faq-q="${faq.id}">
                          ${q}
                        </span>
                      </div>
                    </div>

                    <div class="faq-chevron-box w-8 h-8 rounded-full ${isOpen ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0 transition-all duration-200">
                      <svg 
                        class="faq-chevron-svg w-4 h-4 transition-transform duration-300 transform ${isOpen ? 'rotate-180' : 'rotate-0'}" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        stroke-width="2.5"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div 
                    id="faq-content-${idx}" 
                    class="faq-panel overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0'}"
                    style="${isOpen ? '' : 'max-height: 0px;'}"
                  >
                    <div class="px-5 sm:px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/80" data-i18n-faq-a="${faq.id}">
                      ${a.replace(/\n/g, '<br/>')}
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>

            <!-- Empty Search Results Message -->
            <div id="faqEmptyFilter" class="hidden text-center py-10 max-w-md mx-auto">
              <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p class="text-xs font-bold text-slate-700">Aramanıza uygun soru bulunamadı</p>
              <p class="text-[11px] text-slate-500 mt-1">Lütfen farklı bir anahtar kelime deneyin veya kategori filtresini sıfırlayın.</p>
            </div>

            <!-- Bottom Still Have Questions CTA Banner -->
            <div class="mt-12 sm:mt-14 max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 text-center shadow-xs">
              <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                💬
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Başka bir sorunuz veya özel bir talebiniz mi var?
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 mb-5">
                Uzman ekibimizle anında iletişime geçin; size özel çözümlerimizi ve detaylı bilgi akışını hemen paylaşalım.
              </p>
              <div class="flex flex-wrap items-center justify-center gap-3">
                ${config.whatsapp ? `
                  <a 
                    href="https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Merhaba, web sitenizdeki SSS bölümünü inceledim, bir sorum olacaktı.')}" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>WhatsApp İle Sorun</span>
                    <span>→</span>
                  </a>
                ` : ''}
                ${config.phone ? `
                  <a 
                    href="tel:${config.phone.replace(/\s+/g, '')}" 
                    class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>Hemen Arayın: ${config.phone}</span>
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </section>
        `;
      }

      // 8. CONTACT SECTION
      if (section.id === "contact" && config.contact.enabled) {
        return `
        <section id="contact" class="py-20 bg-white border-t border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-brand mb-2">İletişim & Randevu</div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-4" data-i18n="contactTitle">Bizimle Hemen İletişime Geçin</h2>
                <p class="text-slate-600 text-sm mb-8" data-i18n="contactSubtitle">Fiyat teklifi, randevu ve detaylı bilgi için telefon veya WhatsApp üzerinden 7/24 bize ulaşabilirsiniz.</p>

                <div class="space-y-6 mb-8">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0 font-bold text-lg">📞</div>
                    <div>
                      <div class="text-xs text-slate-500 font-bold uppercase">Doğrudan Arayın</div>
                      <a href="tel:${config.phone.replace(/\s+/g, '')}" class="text-lg font-black text-slate-900 hover:text-brand">${config.phone}</a>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-lg">💬</div>
                    <div>
                      <div class="text-xs text-slate-500 font-bold uppercase">WhatsApp Destek & Teklif</div>
                      <a href="https://wa.me/${config.whatsapp}" class="text-lg font-black text-slate-900 hover:text-brand">${config.whatsapp}</a>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-lg">📍</div>
                    <div>
                      <div class="text-xs text-slate-500 font-bold uppercase">Hizmet Bölgesi & Adres</div>
                      <div class="text-base font-bold text-slate-900">${config.address} - ${config.city}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lead Capture Form -->
              <div class="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 class="text-xl font-bold text-slate-900 mb-1">Hızlı Fiyat Teklifi İsteyin</h3>
                <p class="text-xs text-slate-500 mb-6">Formu doldurun, talebiniz anında müşteri yönetim paneline düşsün.</p>
                
                <form onsubmit="handleFormSubmit(event)" class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
                    <input type="text" id="leadName" required placeholder="Örn: Ahmet Yılmaz" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Telefon Numaranız *</label>
                      <input type="tel" id="leadPhone" required placeholder="05XX XXX XX XX" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">
                        E-Posta Adresiniz ${(config.leadThankYouEmail?.requireEmail || config.customForm?.thankYouEmail?.requireEmail) ? '*' : ''}
                      </label>
                      <input type="email" id="leadEmail" ${(config.leadThankYouEmail?.requireEmail || config.customForm?.thankYouEmail?.requireEmail) ? 'required' : ''} placeholder="ornek@mail.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">İlgilendiğiniz Konu</label>
                    <select id="leadService" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
                      ${config.services.items.map(s => `<option value="${s.title}">${s.title}</option>`).join('')}
                      ${(config.products?.items || []).map(p => `<option value="${p.title}">Katalog: ${p.title}</option>`).join('')}
                      <option value="Genel Bilgi & Teklif">Genel Bilgi & Fiyat Teklifi</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Mesajınız / Detaylar</label>
                    <textarea id="leadMessage" rows="3" placeholder="Talebinizi veya sormak istediklerinizi kısaca yazın..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"></textarea>
                  </div>

                  <button type="submit" class="w-full py-3.5 bg-brand text-white font-black text-sm rounded-xl hover:bg-brand-dark transition-all shadow-md flex items-center justify-center gap-2">
                    <span>Ücretsiz Fiyat Teklifi Gönder</span>
                    <span>→</span>
                  </button>

                  <div id="formSuccessAlert" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                    ✅ Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        `;
      }

      return '';
    }).join('')}
  </main>

  ${renderFooter(config)}

  <script>
    let currentSlide = 0;
    const totalSlides = ${slides.length};

    function showSlide(index) {
      if (totalSlides <= 1) return;
      currentSlide = (index + totalSlides) % totalSlides;
      for (let i = 0; i < totalSlides; i++) {
        const slide = document.getElementById('slide-' + i);
        const dot = document.getElementById('dot-' + i);
        if (slide) {
          if (i === currentSlide) {
            slide.classList.remove('opacity-0', 'pointer-events-none', 'z-0', 'absolute');
            slide.classList.add('opacity-100', 'z-10', 'relative');
          } else {
            slide.classList.remove('opacity-100', 'z-10', 'relative');
            slide.classList.add('opacity-0', 'pointer-events-none', 'z-0', 'absolute');
          }
        }
        if (dot) {
          if (i === currentSlide) {
            dot.className = 'w-8 h-3 rounded-full bg-amber-400 transition-all';
          } else {
            dot.className = 'w-3 h-3 rounded-full bg-white/50 transition-all';
          }
        }
      }
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }
    function goToSlide(i) { showSlide(i); }

    if (totalSlides > 1) {
      setInterval(nextSlide, 6000);
    }
  </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 2. GENERATE KURUMSAL.HTML (Dedicated About Page)
// -------------------------------------------------------------
export function generateAboutHtml(config: SiteConfig): string {
  const aboutSeo = resolvePageSeo(
    config,
    "page-about",
    `${config.about.title || 'Kurumsal & Hakkımızda'} | ${config.companyName}`,
    config.about.badge || config.slogan,
    undefined,
    config.about.image
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    aboutSeo.metaTitle,
    aboutSeo.metaDescription,
    aboutSeo.keywords,
    aboutSeo.ogImage,
    undefined,
    aboutSeo.canonicalUrl,
    aboutSeo.robots,
    aboutSeo.ogTitle,
    aboutSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "about")}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold mb-4">
          🏢 ${config.about.badge || 'Kurumsal Profilimiz'}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          ${config.about.title || 'Hakkımızda & Şirket Tarihçemiz'}
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          ${config.slogan} - ${config.city} genelinde profesyonel hizmet standardı.
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div class="aspect-16/9 rounded-2xl overflow-hidden shadow-md">
          <img src="${config.about.image || config.hero.bgImage}" alt="${config.companyName}" class="w-full h-full object-cover">
        </div>

        <div class="text-slate-700 text-base leading-relaxed prose-rendered">
          ${config.about.content}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
          ${config.about.bullets.map(b => `
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
              <span class="text-sm font-bold text-slate-800">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-3 gap-6 p-8 rounded-3xl bg-slate-900 text-white text-center">
        <div>
          <div class="text-3xl sm:text-4xl font-black text-amber-400">${config.about.yearsExperience || '12+'}</div>
          <div class="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Yıllık Sektör Deneyimi</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-black text-brand">${config.about.completedProjects || '14.000+'}</div>
          <div class="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Başarılı Operasyon</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-black text-emerald-400">%100</div>
          <div class="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Müşteri Memnuniyeti</div>
        </div>
      </div>
    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 3. GENERATE HIZMETLER.HTML (Dedicated Services Directory)
// -------------------------------------------------------------
export function generateServicesHtml(config: SiteConfig): string {
  const srvIndexSeo = resolvePageSeo(
    config,
    "page-services-index",
    `Hizmetlerimiz & Uzmanlık Alanlarımız | ${config.companyName}`,
    config.services.subtitle || `${config.companyName} tüm kurumsal hizmetleri ve fiyat detayları.`
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    srvIndexSeo.metaTitle,
    srvIndexSeo.metaDescription,
    srvIndexSeo.keywords,
    srvIndexSeo.ogImage,
    undefined,
    srvIndexSeo.canonicalUrl,
    srvIndexSeo.robots,
    srvIndexSeo.ogTitle,
    srvIndexSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "services")}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold mb-4">
          🛠️ ${config.services.badge || 'Hizmetlerimiz'}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          ${config.services.title || 'Sunduğumuz Profesyonel Çözümler'}
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          ${config.services.subtitle || 'İhtiyacınıza uygun kaliteli, garantili ve şeffaf fiyatlı hizmet seçeneklerimiz.'}
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${config.services.items.map((svc, idx) => {
          const detailUrl = `hizmet-${svc.slug || `detay-${idx+1}`}.html`;
          return `
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              ${svc.bannerImage ? `
                <div class="aspect-16/9 bg-slate-100 overflow-hidden">
                  <img src="${svc.bannerImage}" alt="${svc.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
              ` : ''}
              <div class="p-8">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-black text-brand uppercase tracking-wider">Hizmet 0${idx + 1}</span>
                  ${svc.price ? `<span class="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">${svc.price}</span>` : ''}
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand transition-colors">${svc.title}</h2>
                <p class="text-slate-600 text-sm leading-relaxed mb-6">${svc.desc}</p>
                
                ${svc.features && svc.features.length > 0 ? `
                  <ul class="space-y-2 mb-6 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    ${svc.features.slice(0, 3).map(f => `
                      <li class="flex items-center gap-2">
                        <span class="text-emerald-500 font-bold">✓</span>
                        <span>${f}</span>
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>

            <div class="p-8 pt-0 flex items-center justify-between border-t border-slate-100 gap-3">
              <a href="${detailUrl}" class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-all">
                Hizmet Sayfasını İncele →
              </a>
              <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`${svc.title} hizmeti için fiyat teklifi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold" title="WhatsApp Teklif">
                💬
              </a>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 4. GENERATE HIZMET-[SLUG].HTML (Dedicated Individual Service Page)
// -------------------------------------------------------------
export function generateServiceDetailHtml(config: SiteConfig, service: ServiceItem): string {
  const srvSeo = resolvePageSeo(
    config,
    `service-${service.id}`,
    service.seoTitle || `${service.title} Hizmeti & Fiyatları | ${config.companyName}`,
    service.seoDescription || service.desc || `${service.title} hakkında detaylı bilgi, kapsam ve fiyat teklifi.`,
    service.seoKeywords,
    service.ogImage || service.bannerImage || service.image || config.seo?.ogImage || config.hero.bgImage,
    service.canonicalUrl,
    service.robots
  );

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": srvSeo.metaDescription,
    "provider": {
      "@type": "LocalBusiness",
      "name": config.companyName,
      "telephone": config.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": config.address,
        "addressLocality": config.city,
        "addressCountry": "TR"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": service.price || "Teklif Alın"
    }
  };

  const pageImage = service.bannerImage || service.image || srvSeo.ogImage || config.hero.bgImage;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    srvSeo.metaTitle,
    srvSeo.metaDescription,
    srvSeo.keywords,
    srvSeo.ogImage,
    serviceSchema,
    srvSeo.canonicalUrl,
    srvSeo.robots,
    srvSeo.ogTitle,
    srvSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "services")}

  <!-- Service Hero Section -->
  <section class="relative bg-slate-950 text-white py-20 lg:py-24" style="background-image: url('${pageImage}'); background-size: cover; background-position: center;">
    <div class="absolute inset-0 hero-gradient"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl">
        <div class="flex items-center gap-2 mb-4">
          <a href="hizmetler.html" class="text-xs font-semibold text-slate-300 hover:text-white">← Tüm Hizmetlerimiz</a>
          <span class="text-slate-500">/</span>
          <span class="text-xs font-bold text-amber-400">${service.title}</span>
        </div>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
          ${service.title}
        </h1>
        <p class="text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-2xl">
          ${service.desc}
        </p>

        <div class="flex flex-wrap items-center gap-4">
          <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba, "${service.title}" hizmetiniz hakkında teklif ve randevu almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
            <span>💬 WhatsApp İle Fiyat Teklifi Al</span>
          </a>
          <a href="tel:${config.phone.replace(/\s+/g, '')}" class="px-8 py-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold text-sm border border-white/30 flex items-center gap-2 transition-all">
            <span>📞 ${config.phone}</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Service Detail Main Body -->
  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        <!-- Left: Rich Content & Features -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Hizmet Kapsamı ve Detayları</h2>
            
            <div class="text-slate-700 text-base leading-relaxed prose-rendered">
              ${service.longContent || `<p>${service.desc}</p><p>Firmamız en yüksek güvenlik ve kalite standartlarıyla ${service.title} hizmetini 7/24 sunmaktadır.</p>`}
            </div>

            ${service.features && service.features.length > 0 ? `
              <div class="pt-6 border-t border-slate-200">
                <h3 class="text-lg font-bold text-slate-900 mb-4">Bu Hizmetin Avantajları:</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${service.features.map(f => `
                    <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      <span class="text-xs font-bold text-slate-800">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Other Services Quick Links -->
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Diğer Popüler Hizmetlerimiz</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${config.services.items.filter(s => s.id !== service.id).slice(0, 4).map(other => `
                <a href="hizmet-${other.slug}.html" class="p-4 rounded-2xl bg-slate-50 hover:bg-brand/5 border border-slate-200 hover:border-brand transition-all block">
                  <div class="font-bold text-sm text-slate-900 mb-1">${other.title}</div>
                  <div class="text-xs text-slate-500 line-clamp-1">${other.desc}</div>
                </a>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Quick Action Box & Lead Form -->
        <div class="space-y-6">
          <div class="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
            <div>
              <div class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Fiyatlandırma</div>
              <div class="text-3xl font-black text-white">${service.price || 'Özel Fiyat'}</div>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">
              Aracınızın konumu ve işlem detayına göre en uygun şeffaf fiyat garantisi sunulmaktadır.
            </p>

            <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba, "${service.title}" hizmeti için net fiyat teklifi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
              <span>💬 WhatsApp İle Fiyat Sorun</span>
            </a>

            <a href="tel:${config.phone.replace(/\s+/g, '')}" class="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
              <span>📞 Hemen Arayın: ${config.phone}</span>
            </a>
          </div>

          <!-- Service Specific Lead Form -->
          <div class="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-slate-900 text-base">Bu Hizmet İçin Teklif İsteyin</h3>
            <form onsubmit="handleFormSubmit(event)" class="space-y-3">
              <input type="hidden" id="leadService" value="${service.title}">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
                <input type="text" id="leadName" required placeholder="Adınız Soyadınız" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-brand">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Telefon Numaranız *</label>
                <input type="tel" id="leadPhone" required placeholder="05XX XXX XX XX" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-brand">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Notunuz</label>
                <textarea id="leadMessage" rows="2" placeholder="Konumunuz veya detay..." class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-brand"></textarea>
              </div>
              <button type="submit" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
                Teklif Gönder →
              </button>
              <div id="formSuccessAlert" class="hidden p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold text-center">
                ✅ Talebiniz alındı!
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 5. GENERATE KATALOG.HTML (Dedicated Catalog Page)
// -------------------------------------------------------------
export function generateCatalogHtml(config: SiteConfig): string {
  const catIndexSeo = resolvePageSeo(
    config,
    "page-catalog-index",
    `${config.products?.title || 'Ürün & Hizmet Kataloğumuz'} | ${config.companyName}`,
    config.products?.subtitle || 'Fotoğraflı ürün ve hizmet kataloğu. Doğrudan WhatsApp ile sipariş ve teklif.'
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    catIndexSeo.metaTitle,
    catIndexSeo.metaDescription,
    catIndexSeo.keywords,
    catIndexSeo.ogImage,
    undefined,
    catIndexSeo.canonicalUrl,
    catIndexSeo.robots,
    catIndexSeo.ogTitle,
    catIndexSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "catalog")}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold mb-4">
          📦 ${config.products?.badge || 'Katalog & Fiyatlar'}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          ${config.products?.title || 'Ürün ve Hizmet Kataloğu'}
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          ${config.products?.subtitle || 'Tüm ürün ve hizmetlerimizi detaylarıyla inceleyebilir, WhatsApp üzerinden tek tıkla sipariş oluşturabilirsiniz.'}
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        ${(config.products?.items || []).map((p, pIdx) => {
          const prodSlug = p.slug || `urun-${pIdx + 1}`;
          const prodUrl = `urun-${prodSlug}.html`;
          const featuredImg = p.featuredImage || p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80';
          return `
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <a href="${prodUrl}" class="block aspect-4/3 bg-slate-100 relative overflow-hidden">
                <img id="cat-prod-img-${pIdx}" src="${featuredImg}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                ${p.badge ? `<span class="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black shadow-md">${p.badge}</span>` : ''}
                <span class="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-xs font-bold">${p.category}</span>
                ${p.images && p.images.length > 1 ? `
                  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
                    ${p.images.map((img) => `
                      <button type="button" onclick="event.preventDefault(); event.stopPropagation(); document.getElementById('cat-prod-img-${pIdx}').src='${img}'" class="w-2.5 h-2.5 rounded-full bg-white/80 hover:bg-amber-400 transition-colors"></button>
                    `).join('')}
                  </div>
                ` : ''}
              </a>
              <div class="p-6">
                <h2 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors">
                  <a href="${prodUrl}">${p.title}</a>
                </h2>
                <div class="text-slate-600 text-xs leading-relaxed mb-4 prose-rendered line-clamp-3">
                  ${p.description}
                </div>
                ${(() => {
                  const taxCfg = getEffectiveTaxConfig(config);
                  const taxInfo = calculateProductTax(p, taxCfg);
                  const showBadge = taxCfg.displayVatBadge !== false;
                  const displayPrice = taxCfg.priceIncludesVat ? taxInfo.formattedGross : taxInfo.formattedNet;
                  return `
                  <div class="flex items-baseline gap-2 mb-2 flex-wrap">
                    <span class="text-2xl font-black text-brand">${displayPrice}</span>
                    ${p.oldPrice ? `<span class="text-sm text-slate-400 line-through">${p.oldPrice}</span>` : ''}
                    ${showBadge ? `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${taxInfo.priceIncludesVat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">${taxInfo.badgeText}</span>` : ''}
                  </div>
                  `;
                })()}
                ${p.specs && p.specs.length > 0 ? `
                  <div class="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-500">
                    ${p.specs.slice(0, 3).map(s => `
                      <div class="flex justify-between">
                        <span class="font-semibold text-slate-700">${s.label}:</span>
                        <span>${s.value}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="p-6 pt-0 space-y-2">
              <a href="${prodUrl}" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                <span>🔍 Ürün Detayı ve Özellikleri</span>
                <span>→</span>
              </a>
              <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba, "${p.title}" ürünü için sipariş oluşturmak istiyorum. Fiyat: ${p.price}`)}" target="_blank" rel="noopener noreferrer" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
                <span>💬 WhatsApp İle Hemen Sipariş Ver</span>
              </a>
            </div>
          </div>
        `;
        }).join('')}
      </div>

      ${renderCatalogContactForm(config)}
    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 5b. RENDER CATALOG CONTACT US & CUSTOM REQUIREMENTS FORM
// -------------------------------------------------------------
export function renderCatalogContactForm(config: SiteConfig): string {
  const formCfg = config.catalogContactForm || config.products?.contactForm;
  if (formCfg && formCfg.enabled === false) return '';

  const title = formCfg?.title || 'Katalog Teklif & Özel İhtiyaç Formu';
  const subtitle = formCfg?.subtitle || 'Katalogdaki ürünlerimiz veya projelerinize özel üretim/hizmet talepleriniz için formu doldurun, anında detaylı teklif alın.';
  const submitText = formCfg?.submitButtonText || 'Özel Fiyat Teklifi & Katalog Bilgisi İste';
  const successMsg = formCfg?.successMessage || '✅ Katalog talebiniz ve özel gereksinimleriniz başarıyla alındı! İlgili birimimiz en kısa sürede dönüş yapacaktır.';
  const redirectWa = formCfg?.redirectWhatsAppAfterSubmit !== false;
  
  const fields = (formCfg?.fields && formCfg.fields.length > 0) ? formCfg.fields : [
    { id: 'client_name', type: 'text', label: 'Adınız Soyadınız / Firma Ünvanı', placeholder: 'Örn: Mehmet Özkan', required: true, width: 'full' },
    { id: 'client_phone', type: 'tel', label: 'Telefon Numaranız', placeholder: '05XX XXX XX XX', required: true, width: 'half' },
    { id: 'client_email', type: 'email', label: 'E-Posta Adresiniz', placeholder: 'ornek@sirket.com', required: true, width: 'half' },
    { id: 'selected_product', type: 'select', label: 'İlgilendiğiniz Ürün / Hizmet', required: true, width: 'half', options: ['Genel Danışmanlık', 'Özel İmalat / Üretim', 'Toptan Sipariş'] },
    { id: 'order_quantity', type: 'number', label: 'Talep Edilen Miktar / Adet', placeholder: 'Örn: 10', required: false, width: 'half' },
    { id: 'custom_requirements', type: 'textarea', label: 'Özel İstekler, Ölçüler & Teknik Şartlar', placeholder: 'Özel ebatlar, renk kodları veya beklentilerinizi belirtiniz...', required: true, width: 'full' }
  ];

  return `
  <!-- CATALOG CONTACT US & CUSTOM REQUIREMENTS SECTION -->
  <section id="catalog-contact-section" class="mt-16 pt-12 border-t border-slate-200">
    <div class="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <!-- Section Header -->
      <div class="p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white text-center relative overflow-hidden">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
          <span>📋 Özel Teklif & İhtiyaç Talebi</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          ${title}
        </h2>
        <p class="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          ${subtitle}
        </p>
      </div>

      <!-- Form Container -->
      <div class="p-6 sm:p-10">
        <!-- Success State Alert -->
        <div id="cat-form-success-banner" class="hidden mb-8 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-center animate-in fade-in duration-300">
          <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 text-xl font-black shadow-md">✓</div>
          <h3 class="text-lg font-black mb-1">Talebiniz Başarıyla Alındı!</h3>
          <p class="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto mb-4">${successMsg}</p>
          <button type="button" onclick="document.getElementById('cat-form-success-banner').classList.add('hidden'); document.getElementById('catalog-custom-form').reset(); document.getElementById('catalog-custom-form').classList.remove('hidden');" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
            Yeni Bir Talep Gönder
          </button>
        </div>

        <form id="catalog-custom-form" onsubmit="handleCatalogCustomFormSubmit(event)" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            ${fields.map((f: any) => {
              const isFull = f.width === 'full';
              const colClass = isFull ? 'md:col-span-2' : 'col-span-1';
              const reqAsterisk = f.required ? '<span class="text-rose-500 font-bold ml-0.5">*</span>' : '';
              const reqAttr = f.required ? 'required' : '';
              const labelHtml = `<label for="cat_inq_${f.id}" class="block text-xs font-bold text-slate-800 mb-1.5">${f.label} ${reqAsterisk}</label>`;
              const helpHtml = f.helpText ? `<p class="text-[11px] text-slate-500 mt-1">${f.helpText}</p>` : '';

              if (f.type === 'textarea') {
                return `
                <div class="${colClass}">
                  ${labelHtml}
                  <textarea id="cat_inq_${f.id}" name="${f.id}" rows="3" ${reqAttr} placeholder="${f.placeholder || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all resize-y"></textarea>
                  ${helpHtml}
                </div>`;
              } else if (f.type === 'select') {
                return `
                <div class="${colClass}">
                  ${labelHtml}
                  <select id="cat_inq_${f.id}" name="${f.id}" ${reqAttr} class="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-600 outline-none transition-all">
                    <option value="">${f.placeholder || 'Lütfen Seçim Yapınız...'}</option>
                    ${(f.options || []).map((opt: string) => `<option value="${opt}">${opt}</option>`).join('')}
                  </select>
                  ${helpHtml}
                </div>`;
              } else if (f.type === 'radio') {
                return `
                <div class="${colClass}">
                  ${labelHtml}
                  <div class="space-y-2 pt-1">
                    ${(f.options || []).map((opt: string, optIdx: number) => `
                      <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input type="radio" name="${f.id}" value="${opt}" ${optIdx === 0 ? 'checked' : ''} class="text-indigo-600 focus:ring-indigo-500">
                        <span>${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                  ${helpHtml}
                </div>`;
              } else if (f.type === 'file') {
                return `
                <div class="${colClass}">
                  ${labelHtml}
                  <div class="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 text-center transition-colors">
                    <div class="text-2xl mb-1">📎</div>
                    <div class="text-xs font-bold text-slate-700">Teknik Çizim / Proje Dosyası / Numune Fotoğrafı</div>
                    <p class="text-[10px] text-slate-400 mt-0.5">${f.allowedFileTypes || '.pdf,.png,.jpg,.dwg,.zip'} (Maks ${f.maxFileSizeMb || 10} MB)</p>
                    <input type="file" id="cat_inq_${f.id}" name="${f.id}" accept="${f.allowedFileTypes || '*'}" class="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" onchange="const fName = this.files[0]?.name; if(fName) document.getElementById('cat_file_selected_${f.id}').innerText = 'Seçilen: ' + fName;">
                    <div id="cat_file_selected_${f.id}" class="text-[11px] font-bold text-emerald-600 mt-2"></div>
                  </div>
                  ${helpHtml}
                </div>`;
              } else if (f.type === 'checkbox') {
                return `
                <div class="${colClass}">
                  <label class="flex items-start gap-3 text-xs text-slate-700 cursor-pointer pt-2">
                    <input type="checkbox" id="cat_inq_${f.id}" name="${f.id}" ${f.defaultValue ? 'checked' : ''} ${reqAttr} class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500">
                    <span class="leading-snug">${f.label} ${reqAsterisk}</span>
                  </label>
                  ${helpHtml}
                </div>`;
              } else {
                // text, tel, email, number, date
                return `
                <div class="${colClass}">
                  ${labelHtml}
                  <input type="${f.type}" id="cat_inq_${f.id}" name="${f.id}" ${reqAttr} placeholder="${f.placeholder || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                  ${helpHtml}
                </div>`;
              }
            }).join('')}
          </div>

          <div class="pt-4 border-t border-slate-100 space-y-3">
            <button type="submit" id="btn-submit-catalog-form" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer">
              <span>${submitText}</span>
              <span>→</span>
            </button>
            <p class="text-center text-[11px] text-slate-400">
              🔒 Gönderdiğiniz bilgiler gizlilik politikası ve KVKK uyarınca korunmaktadır.
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- Form Submission Logic Script -->
  <script>
    function handleCatalogCustomFormSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const reqObj = {};
      let clientName = '';
      let clientPhone = '';
      let clientEmail = '';
      let selectedProduct = '';

      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          reqObj[key] = val.name ? '[Dosya]: ' + val.name : '';
        } else {
          reqObj[key] = val;
        }
        if (key.includes('name') || key.includes('person') || key.includes('company')) clientName = clientName || val;
        if (key.includes('phone') || key.includes('tel')) clientPhone = clientPhone || val;
        if (key.includes('email')) clientEmail = clientEmail || val;
        if (key.includes('product') || key.includes('category') || key.includes('service')) selectedProduct = selectedProduct || val;
      }

      // Persist to local leads database
      try {
        const existingLeads = JSON.parse(localStorage.getItem('b2b_site_leads') || '[]');
        const newLead = {
          id: 'lead_' + Date.now(),
          date: 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          name: clientName || 'Katalog Müşterisi',
          phone: clientPhone || '-',
          email: clientEmail || '-',
          serviceOrProduct: selectedProduct || 'Katalog Özel Teklif',
          sourcePage: "Katalog ('Contact Us')",
          status: 'new',
          isRead: false,
          requirements: reqObj
        };
        existingLeads.unshift(newLead);
        localStorage.setItem('b2b_site_leads', JSON.stringify(existingLeads));
        window.dispatchEvent(new CustomEvent('new_site_lead_received', { detail: newLead }));
      } catch (err) {
        console.error('Error saving catalog lead:', err);
      }

      // Toggle UI success
      form.classList.add('hidden');
      const banner = document.getElementById('cat-form-success-banner');
      if (banner) banner.classList.remove('hidden');

      // WhatsApp redirection if enabled
      ${redirectWa && config.whatsapp ? `
        setTimeout(() => {
          let msg = 'Merhaba ${config.companyName || 'Yetkili'}, katalog sayfanız üzerinden özel teklif talebinde bulundum:%0A%0A';
          if (clientName) msg += '👤 *Müşteri / Firma:* ' + encodeURIComponent(clientName) + '%0A';
          if (clientPhone) msg += '📞 *Telefon:* ' + encodeURIComponent(clientPhone) + '%0A';
          if (selectedProduct) msg += '📦 *İlgilenilen Ürün/Hizmet:* ' + encodeURIComponent(selectedProduct) + '%0A';
          msg += '%0A*Özel Gereksinimler & Detaylar:*%0A';
          for (const [k, v] of Object.entries(reqObj)) {
            if (v && !['client_name', 'client_phone', 'client_email'].includes(k)) {
              msg += '• ' + encodeURIComponent(k + ': ' + v) + '%0A';
            }
          }
          const waUrl = 'https://wa.me/${config.whatsapp}?text=' + msg;
          window.open(waUrl, '_blank');
        }, 1200);
      ` : ''}
    }
  </script>
  `;
}

// -------------------------------------------------------------
// 6. GENERATE BLOG.HTML (Dedicated Blog Index Page)
// -------------------------------------------------------------
export function generateBlogHtml(config: SiteConfig): string {
  const blogIndexSeo = resolvePageSeo(
    config,
    "page-blog-index",
    `Blog & Sektörel Rehber | ${config.companyName}`,
    config.blog?.subtitle || 'En güncel tavsiyeler, rehberler ve sektörel makaleler.'
  );
  const categories = (config.blogCategories && config.blogCategories.length > 0)
    ? config.blogCategories
    : (config.blog?.categories && config.blog.categories.length > 0)
    ? config.blog.categories
    : [];

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    blogIndexSeo.metaTitle,
    blogIndexSeo.metaDescription,
    blogIndexSeo.keywords,
    blogIndexSeo.ogImage,
    undefined,
    blogIndexSeo.canonicalUrl,
    blogIndexSeo.robots,
    blogIndexSeo.ogTitle,
    blogIndexSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "blog")}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold mb-4">
          ✍️ ${config.blog?.badge || 'Blog & Rehber'}
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          ${config.blog?.title || 'Faydalı Bilgiler ve Makaleler'}
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          ${config.blog?.subtitle || 'Uzmanlarımızdan pratik ipuçları ve güncel rehberler.'}
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <!-- Category Filter Buttons & Live Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button type="button" onclick="filterBlogCategory('all')" id="catBtn-all" class="blog-cat-btn px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white transition-all shadow-xs shrink-0">
            Tüm Yazılar (${(config.blog?.items || []).length})
          </button>
          ${categories.map(cat => {
            const count = (config.blog?.items || []).filter(b => 
              (b.categoryIds && b.categoryIds.includes(cat.id)) ||
              b.category === cat.name ||
              (b.categories && b.categories.includes(cat.name))
            ).length;
            return `
            <button type="button" onclick="filterBlogCategory('${cat.id}')" id="catBtn-${cat.id}" class="blog-cat-btn px-5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shrink-0">
              ${cat.name} (${count})
            </button>
          `;}).join('')}
        </div>

        <div class="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            id="blogSearchInput"
            oninput="handleBlogSearch(this.value)"
            placeholder="Makalelerde ara..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 shadow-2xs"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Empty State if search/filter returns 0 items -->
      <div id="no-blog-match" class="hidden text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
        <div class="text-4xl mb-1">🔍</div>
        <div class="text-base font-bold text-slate-800">Aramanıza Uygun Makale Bulunamadı</div>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Lütfen farklı bir kelime arayın veya kategori filtresini sıfırlayın.</p>
        <button type="button" onclick="resetBlogFilters()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">
          Filtreleri Temizle
        </button>
      </div>

      <!-- Blog Grid -->
      <div id="blogGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${(config.blog?.items || []).map((b, bIdx) => {
          const blogSlug = b.slug || `blog-${bIdx + 1}`;
          const articleUrl = `blog-${blogSlug}.html`;
          const cover = b.coverImage || b.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
          const catTokens = [...(b.categoryIds || []), b.category, ...(b.categories || [])]
            .filter(Boolean)
            .map(x => String(x).toLowerCase())
            .join(' ');

          return `
          <div class="blog-post-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
               data-categories="${catTokens}"
               data-title="${(b.title || '').toLowerCase()}"
               data-excerpt="${(b.excerpt || '').toLowerCase()}"
               data-tags="${(b.tags || []).join(' ').toLowerCase()}">
            <div>
              <a href="${articleUrl}" class="block aspect-16/9 bg-slate-200 overflow-hidden">
                <img src="${cover}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              </a>
              <div class="p-6">
                <div class="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-2">
                  <span>📅 ${b.date}</span>
                  <span>•</span>
                  <span>⏱️ ${b.readTime}</span>
                  ${b.category ? `<span>•</span><span class="text-amber-600 font-bold">${b.category}</span>` : ''}
                </div>
                <h2 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors">
                  <a href="${articleUrl}">${b.title}</a>
                </h2>
                <p class="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">${b.excerpt}</p>
              </div>
            </div>
            <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
              <a href="${articleUrl}" class="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                <span>Makale Detayını Oku</span>
                <span>→</span>
              </a>
              <span class="text-[11px] text-slate-400 font-semibold">${b.author}</span>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  </main>

  ${renderFooter(config)}

  <script>
    let activeCatId = 'all';
    let currentSearchTerm = '';

    function filterBlogCategory(catId) {
      activeCatId = catId;
      document.querySelectorAll('.blog-cat-btn').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700');
      });

      const activeBtn = document.getElementById('catBtn-' + catId);
      if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-700');
        activeBtn.classList.add('bg-slate-900', 'text-white');
      }
      applyFilters();
    }

    function handleBlogSearch(val) {
      currentSearchTerm = (val || '').toLowerCase().trim();
      applyFilters();
    }

    function resetBlogFilters() {
      currentSearchTerm = '';
      const input = document.getElementById('blogSearchInput');
      if (input) input.value = '';
      filterBlogCategory('all');
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.blog-post-card');
      let visibleCount = 0;

      cards.forEach(c => {
        const cats = (c.getAttribute('data-categories') || '').toLowerCase();
        const title = (c.getAttribute('data-title') || '').toLowerCase();
        const excerpt = (c.getAttribute('data-excerpt') || '').toLowerCase();
        const tags = (c.getAttribute('data-tags') || '').toLowerCase();

        const matchesCat = (activeCatId === 'all') || cats.includes(activeCatId.toLowerCase());
        const matchesSearch = !currentSearchTerm || 
          title.includes(currentSearchTerm) || 
          excerpt.includes(currentSearchTerm) || 
          tags.includes(currentSearchTerm);

        if (matchesCat && matchesSearch) {
          c.classList.remove('hidden');
          visibleCount++;
        } else {
          c.classList.add('hidden');
        }
      });

      const noMatch = document.getElementById('no-blog-match');
      if (noMatch) {
        if (visibleCount === 0) {
          noMatch.classList.remove('hidden');
        } else {
          noMatch.classList.add('hidden');
        }
      }
    }
  </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 5.1 GENERATE URUN-[SLUG].HTML (Dedicated Product Detail Page)
// -------------------------------------------------------------
export function generateProductDetailHtml(config: SiteConfig, prod: ProductItem): string {
  const prodSeo = resolvePageSeo(
    config,
    `product-${prod.id}`,
    prod.seoTitle || `${prod.title} - Fiyatı & Detayları | ${config.companyName}`,
    prod.seoDescription || prod.shortDescription || (prod.description ? prod.description.replace(/<[^>]*>?/gm, '').substring(0, 160) : ''),
    prod.seoKeywords,
    prod.ogImage || prod.featuredImage || prod.image || (prod.images && prod.images[0]) || config.seo?.ogImage || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    prod.canonicalUrl,
    prod.robots
  );
  const featuredImg = prodSeo.ogImage;
  const allImages = [featuredImg, ...(prod.images || [])].filter((v, i, a) => a.indexOf(v) === i);

  // Other related products
  const relatedProducts = (config.products?.items || [])
    .filter(p => p.id !== prod.id)
    .slice(0, 3);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": prod.title,
    "image": allImages,
    "description": prodSeo.metaDescription,
    "brand": {
      "@type": "Brand",
      "name": config.companyName
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY",
      "price": prod.price.replace(/[^0-9.]/g, '') || "100",
      "availability": prod.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "seller": {
        "@type": "Organization",
        "name": config.companyName
      }
    }
  };

  const breadcrumbs = [
    { name: "Ana Sayfa", url: "index.html" },
    { name: "Ürün Kataloğu", url: "katalog.html" },
    { name: prod.category || "Ürünler", url: "katalog.html" },
    { name: prod.title, url: `urun-${prod.slug || prod.id}.html` }
  ];

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    prodSeo.metaTitle,
    prodSeo.metaDescription,
    prodSeo.keywords,
    featuredImg,
    undefined,
    prodSeo.canonicalUrl,
    prodSeo.robots,
    prodSeo.ogTitle,
    prodSeo.ogDescription,
    "product",
    { product: prod, breadcrumbItems: breadcrumbs }
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "catalog")}

  <!-- Breadcrumbs -->
  <div class="bg-slate-100 border-b border-slate-200 py-3.5 px-4">
    <div class="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
      <a href="index.html" class="hover:text-brand">Ana Sayfa</a>
      <span>/</span>
      <a href="katalog.html" class="hover:text-brand">Ürün Kataloğu</a>
      <span>/</span>
      <span class="text-slate-400">${prod.category}</span>
      <span>/</span>
      <span class="text-slate-800 font-bold">${prod.title}</span>
    </div>
  </div>

  <main class="flex-1 py-12 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Product Details Container -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          <!-- Product Image Gallery -->
          <div class="space-y-4">
            <div class="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
              <img id="mainProductImg" src="${featuredImg}" alt="${prod.title}" class="w-full h-full object-cover">
              ${prod.badge ? `<span class="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg">${prod.badge}</span>` : ''}
              <span class="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur text-white text-xs font-bold">${prod.category}</span>
            </div>

            ${allImages.length > 1 ? `
              <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
                ${allImages.map((img, idx) => `
                  <button type="button" onclick="document.getElementById('mainProductImg').src='${img}'" class="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-brand focus:border-brand transition-all shadow-xs bg-slate-100">
                    <img src="${img}" alt="${prod.title} ${idx + 1}" class="w-full h-full object-cover">
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Product Info & Actions -->
          <div class="space-y-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
                ${prod.inStock !== false ? '✅ Stokta / Hemen Teslim' : '⏳ Sipariş Üzerine Hazırlanır'}
              </div>
              <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                ${prod.title}
              </h1>
              <p class="text-xs text-slate-500 font-semibold mt-1">Kategori: <strong class="text-slate-800">${prod.category}</strong></p>
            </div>

            <!-- Price Box -->
            ${(() => {
              const taxCfg = getEffectiveTaxConfig(config);
              const taxInfo = calculateProductTax(prod, taxCfg);
              const showBadge = taxCfg.displayVatBadge !== false;
              const displayPrice = taxCfg.priceIncludesVat ? taxInfo.formattedGross : taxInfo.formattedNet;
              const priceLabel = taxCfg.priceIncludesVat ? 'Satış Fiyatı (KDV Dahil)' : 'Birim Fiyat (KDV Hariç)';

              return `
              <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div class="flex items-baseline gap-4 flex-wrap">
                  <div>
                    <span class="text-xs text-slate-400 font-bold block mb-0.5">${priceLabel}</span>
                    <span class="text-3xl sm:text-4xl font-black text-brand">${displayPrice}</span>
                  </div>
                  ${prod.oldPrice ? `
                    <div>
                      <span class="text-xs text-slate-400 font-bold block mb-0.5">Eski Fiyat</span>
                      <span class="text-base text-slate-400 line-through">${prod.oldPrice}</span>
                    </div>
                  ` : ''}
                  ${showBadge ? `
                    <div class="self-center">
                      <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${taxInfo.priceIncludesVat ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                        ${taxInfo.badgeText}
                      </span>
                    </div>
                  ` : ''}
                </div>

                ${taxCfg.displayTaxBreakdown !== false && !taxInfo.exempt && taxInfo.vatRate > 0 ? `
                  <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1.5 font-medium">
                    <div class="flex justify-between text-slate-500">
                      <span>Net Matrah (KDV Hariç):</span>
                      <span class="font-mono text-slate-800 font-semibold">${taxInfo.formattedNet}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>Hesaplanan KDV (%${taxInfo.vatRate}):</span>
                      <span class="font-mono text-amber-700 font-semibold">+ ${taxInfo.formattedVat}</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-slate-100 text-slate-900 font-bold">
                      <span>Nihai Toplam Tutar:</span>
                      <span class="font-mono text-brand font-black text-sm">${taxInfo.formattedGross}</span>
                    </div>
                  </div>
                ` : ''}

                ${taxCfg.vatExemptNotice ? `
                  <p class="text-[11px] text-slate-500 italic">
                    ℹ️ ${taxCfg.vatExemptNotice}
                  </p>
                ` : ''}
              </div>
              `;
            })()}

            <!-- Description -->
            <div class="space-y-3">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Ürün / Hizmet Açıklaması</h3>
              <div class="text-slate-600 text-sm leading-relaxed prose-rendered">
                ${prod.description}
              </div>
            </div>

            <!-- Specs Table -->
            ${prod.specs && prod.specs.length > 0 ? `
              <div class="space-y-3 pt-4 border-t border-slate-200">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Teknik Özellikler</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  ${prod.specs.map(s => `
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                      <span class="font-bold text-slate-600">${s.label}:</span>
                      <span class="font-medium text-slate-900">${s.value}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Direct Action Buttons -->
            <div class="space-y-3 pt-6 border-t border-slate-200">
              <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba ${config.companyName}, "${prod.title}" ürünü/hizmeti hakkında detaylı bilgi ve sipariş vermek istiyorum. Fiyat: ${prod.price}`)}" target="_blank" rel="noopener noreferrer" class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                <span>💬 WhatsApp İle Hemen Sipariş Ver</span>
              </a>

              <a href="tel:${config.phone.replace(/\s+/g, '')}" class="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
                <span>📞 Telefonla Bilgi Al: ${config.phone}</span>
              </a>
            </div>

            <!-- Guarantee Badges -->
            <div class="grid grid-cols-3 gap-2 pt-4 text-center text-[11px] text-slate-500 font-semibold">
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                ⚡ Hızlı Teslimat
              </div>
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                🛡️ %100 Orijinal / Güvenli
              </div>
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                💬 7/24 Canlı Destek
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Quick Lead Form On Product Page -->
      <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
        <div class="max-w-2xl mx-auto space-y-6">
          <div class="text-center">
            <span class="text-xs font-bold uppercase tracking-wider text-brand">Hızlı Fiyat Teklifi</span>
            <h2 class="text-2xl font-black text-slate-900 mt-1">${prod.title} İçin Teklif İsteyin</h2>
            <p class="text-slate-500 text-xs mt-1">İletişim bilgilerinizi bırakın, müşteri temsilcimiz dakikalar içinde arasın.</p>
          </div>

          <form onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
                <input id="leadName" type="text" required placeholder="Örn: Ahmet Yılmaz" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Telefon Numaranız *</label>
                <input id="leadPhone" type="tel" required placeholder="05XX XXX XX XX" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ürün / Hizmet</label>
              <input id="leadService" type="text" readonly value="${prod.title} (${prod.price})" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Notunuz veya Adresiniz</label>
              <textarea id="leadMessage" rows="3" placeholder="Sipariş adedi, teslimat adresi veya sormak istedikleriniz..." class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand"></textarea>
            </div>
            <button type="submit" class="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-black text-xs rounded-xl transition-all shadow-md">
              Teklif Talebini Gönder →
            </button>
            <div id="formSuccessAlert" class="hidden p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
              ✅ Talebiniz başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz.
            </div>
          </form>
        </div>
      </div>

      <!-- Related Products -->
      ${relatedProducts.length > 0 ? `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">İlginizi Çekebilecek Diğer Ürünler</h2>
            <a href="katalog.html" class="text-xs font-bold text-brand hover:underline">Tüm Katalog →</a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${relatedProducts.map(rp => `
              <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <a href="urun-${rp.slug}.html" class="aspect-4/3 bg-slate-100 block overflow-hidden">
                  <img src="${rp.featuredImage || rp.image || (rp.images && rp.images[0]) || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80'}" alt="${rp.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </a>
                <div class="p-6">
                  <span class="text-[11px] font-bold text-amber-600 block mb-1">${rp.category}</span>
                  <h3 class="font-bold text-slate-900 text-base mb-2 group-hover:text-brand transition-colors">
                    <a href="urun-${rp.slug}.html">${rp.title}</a>
                  </h3>
                  <div class="flex items-baseline gap-2 mb-4">
                    <span class="text-xl font-black text-brand">${rp.price}</span>
                  </div>
                  <a href="urun-${rp.slug}.html" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-all">
                    <span>Detayları İncele</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 7. GENERATE BLOG-[SLUG].HTML (Dedicated Blog Article Page)
// -------------------------------------------------------------
export function generateBlogDetailHtml(config: SiteConfig, post: BlogPostItem): string {
  const blogSeo = resolvePageSeo(
    config,
    `blog-${post.id}`,
    post.seoTitle || `${post.title} | ${config.companyName} Blog`,
    post.seoDescription || post.excerpt || `${post.title} hakkında detaylı inceleme.`,
    post.seoKeywords,
    post.ogImage || post.coverImage || post.image || config.seo?.ogImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    post.canonicalUrl,
    post.robots
  );
  const coverImg = blogSeo.ogImage;

  // Other related blog posts
  const otherPosts = (config.blog?.items || [])
    .filter(p => p.id !== post.id)
    .slice(0, 3);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": coverImg,
    "description": blogSeo.metaDescription,
    "author": {
      "@type": "Person",
      "name": post.author || config.companyName
    },
    "publisher": {
      "@type": "Organization",
      "name": config.companyName
    },
    "datePublished": post.date
  };

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    blogSeo.metaTitle,
    blogSeo.metaDescription,
    blogSeo.keywords,
    coverImg,
    undefined,
    blogSeo.canonicalUrl,
    blogSeo.robots,
    blogSeo.ogTitle,
    blogSeo.ogDescription
  )}
  <script type="application/ld+json">
${JSON.stringify(blogSchema, null, 2)}
  </script>
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "blog")}

  <!-- Breadcrumb Navigation -->
  <div class="bg-slate-100 border-b border-slate-200 py-3.5 px-4">
    <div class="max-w-4xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
      <a href="index.html" class="hover:text-brand">Ana Sayfa</a>
      <span>/</span>
      <a href="blog.html" class="hover:text-brand">Blog</a>
      <span>/</span>
      <span class="text-slate-800 font-bold">${post.title}</span>
    </div>
  </div>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      <article class="bg-white p-8 sm:p-14 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <header class="space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
            <span>📅 ${post.date}</span>
            <span>•</span>
            <span>⏱️ ${post.readTime} okuma</span>
            <span>•</span>
            <span>👤 ${post.author}</span>
            ${post.category ? `<span class="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">${post.category}</span>` : ''}
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            ${post.title}
          </h1>
          <p class="text-base text-slate-600 leading-relaxed font-medium">
            ${post.excerpt}
          </p>
        </header>

        <div class="aspect-16/9 rounded-2xl overflow-hidden shadow-md bg-slate-100">
          <img src="${coverImg}" alt="${post.title}" class="w-full h-full object-cover">
        </div>

        <div class="text-slate-800 text-base leading-relaxed prose-rendered pt-4 border-t border-slate-100">
          ${post.content}
        </div>

        ${post.tags && post.tags.length > 0 ? `
          <div class="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            ${post.tags.map(t => `<span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">#${t}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Social Share Row -->
        <div class="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <span class="text-xs font-bold text-slate-500">Bu makaleyi paylaş:</span>
          <div class="flex items-center gap-2">
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - `)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
              💬 WhatsApp
            </a>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
              𝕏 Paylaş
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/" target="_blank" class="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold">
              💼 LinkedIn
            </a>
          </div>
        </div>
      </article>

      <!-- Bottom WhatsApp CTA -->
      <div class="p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 class="text-xl font-bold text-white mb-1">Hizmetlerimiz Hakkında Bilgi Alın</h3>
          <p class="text-slate-400 text-xs">Uzman ekibimize WhatsApp üzerinden dilediğiniz zaman danışabilirsiniz.</p>
        </div>
        <a href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Merhaba, "${post.title}" başlıklı yazınız hakkında detaylı bilgi ve teklif almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shadow-md">
          💬 WhatsApp İle Danışın
        </a>
      </div>

      <!-- Related Blog Posts -->
      ${otherPosts.length > 0 ? `
        <div class="space-y-6">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Diğer Blog Yazıları</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${otherPosts.map(op => `
              <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <a href="blog-${op.slug}.html" class="aspect-16/9 bg-slate-200 block overflow-hidden">
                  <img src="${op.coverImage || op.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'}" alt="${op.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </a>
                <div class="p-6">
                  <span class="text-[11px] font-bold text-slate-400 block mb-1">📅 ${op.date}</span>
                  <h3 class="font-bold text-slate-900 text-base mb-2 group-hover:text-brand transition-colors">
                    <a href="blog-${op.slug}.html">${op.title}</a>
                  </h3>
                  <a href="blog-${op.slug}.html" class="text-xs font-bold text-brand hover:underline flex items-center gap-1 mt-3">
                    <span>Makaleyi Oku</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 8. GENERATE ILETISIM.HTML (Dedicated Contact Page)
// -------------------------------------------------------------
export function generateContactHtml(config: SiteConfig): string {
  const contactSeo = resolvePageSeo(
    config,
    "page-contact",
    `İletişim & Adres Bilgileri | ${config.companyName}`,
    `${config.companyName} telefon, WhatsApp, adres ve randevu iletişim sayfası.`
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    contactSeo.metaTitle,
    contactSeo.metaDescription,
    contactSeo.keywords,
    contactSeo.ogImage,
    undefined,
    contactSeo.canonicalUrl,
    contactSeo.robots,
    contactSeo.ogTitle,
    contactSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, "contact")}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold mb-4">
          📞 7/24 Kesintisiz İletişim
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Bizimle İletişime Geçin
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          Tüm talep, teklif ve randevu ihtiyaçlarınız için telefon veya WhatsApp üzerinden hemen ulaşabilirsiniz.
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="text-3xl">📞</div>
          <div class="text-xs font-bold text-slate-500 uppercase">Müşteri Destek</div>
          <a href="tel:${config.phone.replace(/\s+/g, '')}" class="text-lg font-black text-slate-900 block hover:text-brand">${config.phone}</a>
          <p class="text-xs text-slate-500">Çalışma Saatleri: ${config.workingHours}</p>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="text-3xl">💬</div>
          <div class="text-xs font-bold text-slate-500 uppercase">WhatsApp Danışma</div>
          <a href="https://wa.me/${config.whatsapp}" class="text-lg font-black text-emerald-600 block hover:underline">${config.whatsapp}</a>
          <p class="text-xs text-slate-500">Anında canlı mesaj desteği.</p>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="text-3xl">✉️</div>
          <div class="text-xs font-bold text-slate-500 uppercase">E-Posta</div>
          <a href="mailto:${config.email}" class="text-sm font-bold text-slate-900 block hover:text-brand truncate">${config.email}</a>
          <p class="text-xs text-slate-500">24 saat içinde dönüş yapılır.</p>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="text-3xl">📍</div>
          <div class="text-xs font-bold text-slate-500 uppercase">Adres & Bölge</div>
          <div class="text-sm font-bold text-slate-900">${config.city}</div>
          <p class="text-xs text-slate-500">${config.address}</p>
        </div>
      </div>

      <!-- Lead Capture Form -->
      <div class="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
        <h2 class="text-2xl font-black text-slate-900 mb-2">Hızlı Teklif & Randevu Formu</h2>
        <p class="text-slate-500 text-xs mb-8">Bilgilerinizi bırakın, müşteri temsilcimiz birkaç dakika içinde size ulaşsın.</p>
        
        <form onsubmit="handleFormSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
            <input type="text" id="leadName" required placeholder="Örn: Mehmet Özkan" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-brand outline-none">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Telefon Numaranız *</label>
              <input type="tel" id="leadPhone" required placeholder="05XX XXX XX XX" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-brand outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                E-Posta Adresiniz ${(config.leadThankYouEmail?.requireEmail || config.customForm?.thankYouEmail?.requireEmail) ? '*' : ''}
              </label>
              <input type="email" id="leadEmail" ${(config.leadThankYouEmail?.requireEmail || config.customForm?.thankYouEmail?.requireEmail) ? 'required' : ''} placeholder="ornek@mail.com" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-brand outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Konu</label>
            <select id="leadService" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-brand outline-none">
              ${config.services.items.map(s => `<option value="${s.title}">${s.title}</option>`).join('')}
              <option value="Genel Bilgi">Genel Bilgi ve Danışmanlık</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mesajınız</label>
            <textarea id="leadMessage" rows="4" placeholder="Sormak istedikleriniz..." class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-brand outline-none"></textarea>
          </div>

          <button type="submit" class="w-full py-4 bg-brand hover:bg-brand-dark text-white font-black text-sm rounded-xl transition-all shadow-md">
            Ücretsiz Teklif Talebini Gönder →
          </button>

          <div id="formSuccessAlert" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
            ✅ Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.
          </div>
        </form>
      </div>

    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// 9. GENERATE SAYFA-[SLUG].HTML (Custom Dedicated Page)
// -------------------------------------------------------------
export function generateCustomPageHtml(config: SiteConfig, page: CustomPageItem): string {
  const pageSeo = resolvePageSeo(
    config,
    `page-${page.id}`,
    page.seoTitle || `${page.title} | ${config.companyName}`,
    page.metaDescription || `${config.companyName} ${page.title} sayfası.`,
    page.seoKeywords,
    page.ogImage || page.bannerImage || config.seo?.ogImage,
    page.canonicalUrl,
    page.robots
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  ${renderCommonHead(
    config,
    pageSeo.metaTitle,
    pageSeo.metaDescription,
    pageSeo.keywords,
    pageSeo.ogImage,
    undefined,
    pageSeo.canonicalUrl,
    pageSeo.robots,
    pageSeo.ogTitle,
    pageSeo.ogDescription
  )}
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">
  ${renderHeader(config, page.slug)}

  <!-- Page Hero Header -->
  <section class="bg-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-3xl">
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          ${page.title}
        </h1>
        <p class="text-slate-300 text-base leading-relaxed">
          ${config.companyName}
        </p>
      </div>
    </div>
  </section>

  <main class="flex-1 py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white p-8 sm:p-14 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        ${page.bannerImage ? `
          <div class="aspect-16/9 rounded-2xl overflow-hidden mb-6">
            <img src="${page.bannerImage}" class="w-full h-full object-cover">
          </div>
        ` : ''}
        <div class="text-slate-800 text-base leading-relaxed prose-rendered">
          ${page.content}
        </div>
      </div>
    </div>
  </main>

  ${renderFooter(config)}
</body>
</html>`;
}

// -------------------------------------------------------------
// MAIN MULTI-FILE BUNDLER
// Returns all distinct HTML files for deployment / download
// -------------------------------------------------------------
export function generateAllSiteFiles(config: SiteConfig): GeneratedPageFile[] {
  const isMulti = config.siteType === "multi-page";
  const files: GeneratedPageFile[] = [];

  const addFile = (file: {
    filename: string;
    title: string;
    type: GeneratedPageFile["type"];
    html: string;
    slug: string;
    description: string;
  }) => {
    files.push({
      ...file,
      fileName: file.filename,
      content: file.html,
    });
  };

  // 1. Always generate index.html
  addFile({
    filename: "index.html",
    title: isMulti ? "Ana Sayfa (Home)" : "Tek Sayfa (Landing Page)",
    type: "home",
    html: generateIndexHtml(config),
    slug: "home",
    description: isMulti ? "Ana giriş sayfası ve öne çıkan içerikler" : "Tüm modülleri içeren tek sayfa landing layout"
  });

  if (isMulti) {
    // 2. Kurumsal.html
    addFile({
      filename: "kurumsal.html",
      title: "Kurumsal & Hakkımızda",
      type: "page",
      html: generateAboutHtml(config),
      slug: "about",
      description: "Şirket profili, vizyon, misyon ve kurumsal istatistikler"
    });

    // 3. Hizmetler.html
    addFile({
      filename: "hizmetler.html",
      title: "Hizmetlerimiz (Liste)",
      type: "service-list",
      html: generateServicesHtml(config),
      slug: "services",
      description: "Tüm hizmetlerin listelendiği ana hizmetler dizini"
    });

    // 4. Hizmet Detay Sayfaları (hizmet-[slug].html)
    config.services.items.forEach((svc, idx) => {
      const slug = svc.slug || `hizmet-${idx + 1}`;
      addFile({
        filename: `hizmet-${slug}.html`,
        title: `Hizmet: ${svc.title}`,
        type: "service-detail",
        html: generateServiceDetailHtml(config, svc),
        slug: `hizmet-${slug}`,
        description: `${svc.title} için özel SEO başlığı, zengin metin ve teklif formu içeren bağımsız sayfa`
      });
    });

    // 5. Katalog.html & Ürün Detay Sayfaları (urun-[slug].html)
    if (config.products?.enabled && config.products.items.length > 0) {
      addFile({
        filename: "katalog.html",
        title: "Ürün & Fiyat Kataloğu",
        type: "catalog",
        html: generateCatalogHtml(config),
        slug: "catalog",
        description: "Fotoğraflı katalog ve tek tıkla WhatsApp sipariş sayfası"
      });

      config.products.items.forEach((prod, idx) => {
        const slug = prod.slug || `urun-${idx + 1}`;
        addFile({
          filename: `urun-${slug}.html`,
          title: `Ürün: ${prod.title}`,
          type: "product-detail",
          html: generateProductDetailHtml(config, prod),
          slug: `urun-${slug}`,
          description: `${prod.title} ürünü için fotoğraflı galeri, teknik özellikler ve WhatsApp sipariş sayfası`
        });
      });
    }

    // 6. Blog.html & Blog Detay Sayfaları (blog-[slug].html)
    if (config.blog?.enabled && config.blog.items.length > 0) {
      addFile({
        filename: "blog.html",
        title: "Blog & Rehberler",
        type: "blog-list",
        html: generateBlogHtml(config),
        slug: "blog",
        description: "Kategori filtreli blog ve rehber makaleler dizini"
      });

      // 7. Blog Detay Sayfaları (blog-[slug].html)
      config.blog.items.forEach((post, idx) => {
        const slug = post.slug || `blog-${idx + 1}`;
        addFile({
          filename: `blog-${slug}.html`,
          title: `Makale: ${post.title}`,
          type: "blog-detail",
          html: generateBlogDetailHtml(config, post),
          slug: `blog-${slug}`,
          description: `${post.title} başlıklı makalenin tam içerik ve yazar sayfası`
        });
      });
    }

    // 8. İletişim.html
    addFile({
      filename: "iletisim.html",
      title: "İletişim & Harita",
      type: "contact",
      html: generateContactHtml(config),
      slug: "contact",
      description: "Adres krokisi, telefon, WhatsApp ve teklif formları"
    });

    // 9. Özel Sayfalar (sayfa-[slug].html)
    (config.pages || []).forEach((p) => {
      addFile({
        filename: `sayfa-${p.slug}.html`,
        title: `Özel Sayfa: ${p.title}`,
        type: "page",
        html: generateCustomPageHtml(config, p),
        slug: `sayfa-${p.slug}`,
        description: `${p.title} için özel içerik sayfası`
      });
    });

    // 10. Global Edge Pages _headers dosyası (Security Headers)
    const sec = config.securityConfig;
    const headersContent = `/*
  X-Frame-Options: ${sec?.enableXFrameOptions ?? true ? "SAMEORIGIN" : "ALLOWALL"}
  X-Content-Type-Options: ${sec?.enableContentTypeNosniff ?? true ? "nosniff" : "nosniff"}
  Referrer-Policy: ${sec?.enableReferrerPolicy ?? true ? "strict-origin-when-cross-origin" : "no-referrer-when-downgrade"}
  ${sec?.enforceHsts ?? true ? "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" : ""}
  ${sec?.enablePermissionsPolicy ? "Permissions-Policy: camera=(), microphone=(), geolocation=()" : ""}
  ${sec?.enableCsp ? "Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline';" : ""}
  ${sec?.hideServerSignature ?? true ? "Server: Edge-CDN" : ""}
`.trim();

    addFile({
      filename: "_headers",
      title: "Global Edge Güvenlik Başlıkları (_headers)",
      type: "other",
      html: headersContent,
      slug: "_headers",
      description: "Global Edge CDN & Statik Barındırma için HTTP güvenlik başlıkları (HSTS, CSP, X-Frame-Options, nosniff)"
    });
  }

  // 11. Static Stylesheet Asset (assets/site.css)
  const staticCssContent = generateStaticCss(config);
  addFile({
    filename: "assets/site.css",
    title: "JetKur Statik CSS Paketi (assets/site.css)",
    type: "other",
    html: staticCssContent,
    slug: "site-css",
    description: "Sıfır runtime bağımlılıklı, derlenmiş ve optimize JetKur statik stil dosyası"
  });

  return files;
}

// -------------------------------------------------------------
// Live Preview Helper:
// Generates the preview HTML string for a specific file/slug or defaults to index
// -------------------------------------------------------------
export function generateStaticHtml(config: SiteConfig, activePageSlug?: string): string {
  const allFiles = generateAllSiteFiles(config);
  if (!activePageSlug || activePageSlug === "home" || activePageSlug === "index.html") {
    return allFiles[0].html;
  }
  const match = allFiles.find(f => f.slug === activePageSlug || f.filename === activePageSlug || f.fileName === activePageSlug);
  return match ? match.html : allFiles[0].html;
}
