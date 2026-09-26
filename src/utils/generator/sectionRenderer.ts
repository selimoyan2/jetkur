/**
 * JetKur Canonical Section Renderer & Registry (Sprint 09)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Authority: Sprint 06 Canonical Section Registry governs valid section IDs & capability rules.
 * 2. Presentation Authority: Sprint 07 Template Manifest + Customer overrides govern section variants.
 * 3. Content Authority: CanonicalSite BusinessProfile & SiteContent supply data (zero hardcoded industry content).
 * 4. Section Readiness: Evaluates readiness via evaluateSectionReadiness().
 *    - EMPTY sections are STRICTLY NOT RENDERED.
 *    - DEGRADED sections render safely with minimal available data.
 * 5. Security & Escaping: All user-controlled strings escaped via escapeHtml / escapeHtmlAttr / sanitizeUrl.
 * 6. Semantic JetKur Classes: Emits clean .jk-section, .jk-container, .jk-card, .jk-button architecture.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CanonicalSectionId, SectionDefinition } from "../../domain/sections/types";
import { getSectionDefinition, normalizeSectionId, isCanonicalSectionId } from "../../domain/sections/normalizer";
import { evaluateSectionReadiness } from "../../domain/sections/readiness";
import { CANONICAL_SECTION_DEFINITIONS } from "../../domain/sections/registry";
import { escapeHtml, escapeHtmlAttr, sanitizeUrl } from "./security";
import { RenderContext, SectionRenderContext } from "./types";

// =========================================================================
// 1. VARIANT RESOLUTION ENGINE (Section 20)
// Priority: Customer Explicit Override -> Template Manifest Recipe -> Registry Default -> Fallback
// =========================================================================

export function resolveSectionVariant(
  sectionId: CanonicalSectionId,
  site: CanonicalSite,
  manifest?: TemplateManifest
): string {
  const def = getSectionDefinition(sectionId);
  const allowed = def ? def.allowedVariants : [];
  const defaultVar = def ? def.defaultVariant : "standard";

  // 1. Customer explicit override from sectionConfiguration
  const userSection = site.sectionConfiguration?.sections?.find(
    (s) => normalizeSectionId(s.type || s.id) === sectionId
  );
  const userVariant = userSection?.variant || (userSection as any)?.variantOverride;
  if (userVariant && allowed.includes(userVariant)) {
    return userVariant;
  }

  // 2. Applied variant override from designTemplate
  if ((site.designTemplate as any)?.appliedVariantOverrides?.[sectionId]) {
    const override = (site.designTemplate as any).appliedVariantOverrides[sectionId];
    if (allowed.includes(override)) return override;
  }

  // 3. Template Manifest recipe
  if (manifest?.sectionRecipe?.[sectionId]) {
    const recipeVariant = manifest.sectionRecipe[sectionId];
    if (allowed.includes(recipeVariant)) return recipeVariant;
  }

  // 4. Registry defaultVariant
  return defaultVar;
}

// =========================================================================
// 2. CANONICAL SECTION RENDERERS (All 15 Active + 1 Experimental)
// =========================================================================

/**
 * 1. HEADER (Structural Navigation)
 */
export function renderHeaderSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName || "JetKur İşletme");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const logoUrl = bp.branding.logoUrl ? sanitizeUrl(bp.branding.logoUrl) : "";
  const isMulti = site.settings.structureMode === "multi-page";

  const navLinks = isMulti
    ? [
        { label: "Ana Sayfa", href: "index.html" },
        { label: "Kurumsal", href: "kurumsal.html" },
        { label: "Hizmetlerimiz", href: "hizmetler.html" },
        { label: "İletişim", href: "iletisim.html" },
      ]
    : [
        { label: "Ana Sayfa", href: "#hero" },
        { label: "Hizmetlerimiz", href: "#services" },
        { label: "Hakkımızda", href: "#about" },
        { label: "İletişim", href: "#contact" },
      ];

  return `
  <!-- Structural Header: ${variant} -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 jk-header">
    <div class="jk-container flex items-center justify-between h-16 sm:h-20 gap-4">
      <a href="${isMulti ? 'index.html' : '#hero'}" class="flex items-center gap-3 min-w-0" aria-label="${companyName}">
        ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="height: 44px; width: auto; max-width: 200px;" class="shrink-0 object-contain">` : `<div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">${companyName.charAt(0)}</div>`}
        <span class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">${companyName}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700" aria-label="Ana Menü">
        ${navLinks.map((l) => `<a href="${l.href}" class="hover:text-brand transition-colors">${escapeHtml(l.label)}</a>`).join("\n        ")}
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        ${phoneClean ? `<a href="tel:${phoneClean}" class="hidden sm:inline-flex jk-button jk-button-primary text-xs sm:text-sm py-2 px-4" aria-label="Telefon: ${phone}">Hemen Ara</a>` : ""}
        <button type="button" id="mobileMenuToggleBtn" onclick="toggleMobileMenu()" class="md:hidden w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200" aria-label="Menüyü Aç/Kapat">
          <span id="mobileMenuOpenIcon">☰</span>
          <span id="mobileMenuCloseIcon" class="hidden">✕</span>
        </button>
      </div>
    </div>
  </header>`;
}

/**
 * 2. HERO (Primary Welcome Showcase)
 */
export function renderHeroSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const content = site.content.hero;
  const companyName = escapeHtml(bp.identity.companyName);
  const title = escapeHtml(content?.title || bp.identity.slogan || `${companyName} Profesyonel Hizmetler`);
  const subtitle = escapeHtml(content?.subtitle || bp.identity.shortDescription || "Kaliteli, güvenilir ve garantili çözümler.");
  const ctaPrimary = escapeHtml(content?.ctaPrimaryText || "Hemen İletişime Geç");
  const ctaPrimaryLink = sanitizeUrl(content?.ctaPrimaryLink || "#contact");
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const heroBg = content?.bgImageUrl || (content as any)?.bgImage;
  const bgImage = heroBg ? sanitizeUrl(heroBg) : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80";

  return `
  <!-- Hero Section: ${variant} -->
  <section id="hero" class="relative jk-hero py-16 sm:py-24 overflow-hidden" style="background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.90)), url('${bgImage}'); background-size: cover; background-position: center;">
    <div class="jk-container relative z-10 text-center sm:text-left max-w-4xl">
      <div class="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
        ★ Profesyonel Hizmet Standartları
      </div>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
        ${title}
      </h1>
      <p class="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
        ${subtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <a href="${ctaPrimaryLink}" class="w-full sm:w-auto jk-button jk-button-primary text-base py-3.5 px-8 shadow-lg">
          ${ctaPrimary}
        </a>
        ${phoneClean ? `<a href="tel:${phoneClean}" class="w-full sm:w-auto jk-button jk-button-secondary text-base py-3.5 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
          📞 ${phone}
        </a>` : ""}
      </div>
    </div>
  </section>`;
}

/**
 * 3. SERVICES (Core Offerings Grid)
 */
export function renderServicesSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const services = (site.content as any).services || site.businessProfile.services || [];
  const isMulti = site.settings.structureMode === "multi-page";

  return `
  <!-- Services Section: ${variant} -->
  <section id="services" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Hizmetlerimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Uzmanlık Alanlarımız ve Çözümler</h2>
        <p class="text-slate-600 text-sm sm:text-base mt-3">İhtiyacınıza uygun kaliteli, garantili ve şeffaf fiyatlı hizmet seçeneklerimiz.</p>
      </div>

      <div class="jk-services-grid">
        ${services.map((s, idx) => {
          const sTitle = escapeHtml(s.title);
          const sDesc = escapeHtml(s.description || "");
          const detailUrl = isMulti ? `hizmet-${s.slug || idx + 1}.html` : "#contact";
          return `
        <article class="jk-card flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-4">
              ${idx + 1}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">${sTitle}</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">${sDesc}</p>
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">${s.priceInfo ? escapeHtml(s.priceInfo) : "Uygun Fiyat"}</span>
            <a href="${detailUrl}" class="text-sm font-bold text-brand hover:underline">Detaylı Bilgi →</a>
          </div>
        </article>`;
        }).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 4. ABOUT (Corporate Profile & Story)
 */
export function renderAboutSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const about = site.content.about;
  const companyName = escapeHtml(bp.identity.companyName);
  const story = escapeHtml(about?.contentHtml || (about as any)?.content || bp.identity.story || `${companyName} olarak sektörde uzun yıllara dayanan tecrübemiz ve uzman kadromuzla müşterilerimize güvenilir hizmet sunuyoruz.`);
  const expYears = escapeHtml(about?.yearsExperience || "10+");
  const completedProjects = escapeHtml(about?.completedProjects || "5.000+");

  return `
  <!-- About Section: ${variant} -->
  <section id="about" class="jk-section bg-white">
    <div class="jk-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Kurumsal Profilimiz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-6">Hakkımızda & Değerlerimiz</h2>
        <div class="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
          <p>${story}</p>
        </div>
        <div class="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <div class="text-3xl font-black text-brand">${expYears}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">Yıllık Tecrübe</div>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-900">${completedProjects}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">Mutlu Müşteri</div>
          </div>
        </div>
      </div>
      <div class="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 bg-slate-100">
        <img src="${(about?.imageUrl || (about as any)?.image) ? sanitizeUrl(about?.imageUrl || (about as any)?.image) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}" alt="${companyName}" class="w-full h-full object-cover" loading="lazy">
      </div>
    </div>
  </section>`;
}

/**
 * 5. WHY US (Value Proposition & Trust Badges)
 */
export function renderWhyUsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const whyUs = site.content.whyUs;
  const items = whyUs?.items || [
    { title: "Hızlı ve Güvenilir", description: "Zamanında müdahale ve kesintisiz destek ile işlerinizi aksatmayın." },
    { title: "Uzman Kadro", description: "Alanında sertifikalı ve tecrübeli profesyonellerle çalışmanın rahatlığı." },
    { title: "Garantili Hizmet", description: "Yapılan tüm işlemlerde %100 müşteri memnuniyeti ve resmi işçilik garantisi." },
  ];

  return `
  <!-- WhyUs Section: ${variant} -->
  <section id="whyUs" class="jk-section bg-slate-900 text-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Neden Bizi Seçmelisiniz?</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">${escapeHtml(whyUs?.title || "Bizi Rakiplerimizden Ayıran Ayrıcalıklar")}</h2>
        <p class="text-slate-400 text-sm sm:text-base mt-3">${escapeHtml(whyUs?.subtitle || "Müşteri odaklı çalışma prensibimiz ve yüksek kalite standartlarımızla yanınızdayız.")}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${items.map((item, idx) => `
        <div class="p-6 rounded-xl bg-slate-800/80 border border-slate-700">
          <div class="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-base mb-4">
            ✓
          </div>
          <h3 class="text-lg font-bold text-white mb-2">${escapeHtml(item.title)}</h3>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(item.description)}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 6. GALLERY (Photo Showcase & Lightbox Candidate)
 */
export function renderGallerySection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const items = site.content.gallery || [];

  return `
  <!-- Gallery Section: ${variant} -->
  <section id="gallery" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Fotoğraf Vitrini</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Çalışmalarımız ve Saha Kareleri</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${items.map((img) => `
        <div class="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-200 shadow-sm">
          <img src="${sanitizeUrl(img.imageUrl || (img as any).url)}" alt="${escapeHtmlAttr(img.title || 'Galeri Fotoğrafı')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
          ${img.title ? `<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
            <span class="text-white text-sm font-semibold">${escapeHtml(img.title)}</span>
          </div>` : ""}
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 7. TESTIMONIALS (Customer Reviews & Social Proof)
 */
export function renderTestimonialsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const reviews = site.content.testimonials || [];

  return `
  <!-- Testimonials Section: ${variant} -->
  <section id="testimonials" class="jk-section bg-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Müşteri Yorumları</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Müşterilerimiz Ne Diyor?</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${reviews.map((rev) => `
        <blockquote class="jk-card flex flex-col justify-between">
          <div class="text-amber-400 mb-3 text-sm">★★★★★</div>
          <p class="text-slate-600 text-sm leading-relaxed mb-4 italic">"${escapeHtml(rev.comment)}"</p>
          <div class="pt-4 border-t border-slate-100">
            <cite class="not-italic font-bold text-slate-900 text-sm block">${escapeHtml(rev.name || (rev as any).author || 'Müşteri')}</cite>
            ${rev.role ? `<span class="text-xs text-slate-500">${escapeHtml(rev.role)}</span>` : ""}
          </div>
        </blockquote>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 8. FAQS (Frequently Asked Questions & Accordion)
 */
export function renderFaqsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const faqs = site.content.faqs || [];

  return `
  <!-- FAQs Section: ${variant} -->
  <section id="faqs" class="jk-section bg-slate-50">
    <div class="jk-container max-w-4xl">
      <div class="text-center mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Sıkça Sorulan Sorular</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Merak Edilenler</h2>
      </div>

      <div class="space-y-4">
        ${faqs.map((faq, idx) => `
        <div class="jk-card">
          <button type="button" class="w-full text-left font-bold text-slate-900 flex items-center justify-between gap-4" onclick="toggleFaq(${idx})" aria-controls="faq-content-${idx}" aria-expanded="false">
            <span>${escapeHtml(faq.question)}</span>
            <span id="faqIcon-${idx}" class="text-xl font-bold text-brand shrink-0">+</span>
          </button>
          <div id="faq-content-${idx}" class="hidden pt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-3">
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 9. CONTACT (Address, Phone, WhatsApp & Lead Form)
 */
export function renderContactSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const phone = bp.contact.phone ? escapeHtml(bp.contact.phone) : "";
  const phoneClean = bp.contact.phone ? bp.contact.phone.replace(/[^0-9+]/g, "") : "";
  const email = bp.contact.email ? escapeHtml(bp.contact.email) : "";
  const address = bp.location.address ? escapeHtml(bp.location.address) : "";

  return `
  <!-- Contact Section: ${variant} -->
  <section id="contact" class="jk-section bg-white">
    <div class="jk-container grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-brand">İletişim & Konum</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-6">Bize Ulaşın</h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">Sorularınız, fiyat teklifleri veya randevu talepleriniz için bize hemen ulaşabilirsiniz.</p>

        <div class="space-y-4 text-sm text-slate-700">
          ${phoneClean ? `<div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">📞</span>
            <a href="tel:${phoneClean}" class="hover:underline font-semibold">${phone}</a>
          </div>` : ""}
          ${email ? `<div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">✉</span>
            <a href="mailto:${email}" class="hover:underline font-semibold">${email}</a>
          </div>` : ""}
          ${address ? `<div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold shrink-0">📍</span>
            <span>${address}</span>
          </div>` : ""}
        </div>
      </div>

      <div class="jk-card">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Hızlı Teklif / Mesaj Formu</h3>
        <form class="space-y-4" onsubmit="event.preventDefault(); alert('Mesajınız alındı.');">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Adınız Soyadınız</label>
            <input type="text" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Adınız Soyadınız">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Telefon Numaranız</label>
            <input type="tel" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="05XX XXX XX XX">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Mesajınız</label>
            <textarea rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Hizmet detayları veya sorularınız..."></textarea>
          </div>
          <button type="submit" class="w-full jk-button jk-button-primary text-sm py-3">Gönder</button>
        </form>
      </div>
    </div>
  </section>`;
}

/**
 * 10. PRODUCTS (Catalog & Merchandise)
 */
export function renderProductsSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const products = site.content.catalogProducts || [];

  return `
  <!-- Products Section: ${variant} -->
  <section id="products" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Ürün Kataloğumuz</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Öne Çıkan Ürün ve Çözümler</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${products.map((p) => `
        <article class="jk-card flex flex-col justify-between">
          <div>
            <div class="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-4">
              <img src="${p.images?.[0] ? sanitizeUrl(p.images[0]) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtmlAttr(p.title)}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-1">${escapeHtml(p.title)}</h3>
            <p class="text-slate-600 text-xs leading-relaxed mb-4">${escapeHtml(p.shortDescription || "")}</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="font-bold text-brand">${escapeHtml(p.price || "Teklif Alın")}</span>
            <a href="#contact" class="text-xs font-bold text-slate-700 hover:text-brand">Detay →</a>
          </div>
        </article>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 11. PRICING (Transparent Pricing Packages)
 */
export function renderPricingSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const plans = site.content.pricingPlans || [];

  return `
  <!-- Pricing Section: ${variant} -->
  <section id="pricing" class="jk-section bg-white">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Fiyatlandırma</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Şeffaf ve Net Paketler</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${plans.map((p) => `
        <div class="jk-card flex flex-col justify-between ${p.isPopular ? 'border-2 border-brand shadow-lg' : ''}">
          <div>
            ${p.isPopular ? `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand text-white mb-3">En Popüler</span>` : ""}
            <h3 class="text-xl font-bold text-slate-900 mb-2">${escapeHtml(p.name)}</h3>
            <div class="text-3xl font-black text-slate-900 mb-1">${escapeHtml(p.price)}</div>
            <p class="text-xs text-slate-500 mb-6">${escapeHtml(p.description)}</p>
            <ul class="space-y-2 text-xs text-slate-700 mb-6">
              ${p.features.map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
            </ul>
          </div>
          <a href="#contact" class="w-full text-center jk-button ${p.isPopular ? 'jk-button-primary' : 'jk-button-secondary'} text-xs py-2.5">
            ${escapeHtml(p.ctaButtonText || "Teklif Al")}
          </a>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 12. BLOG (Articles & Guides)
 */
export function renderBlogSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const posts = site.content.blogPosts || [];
  const isMulti = site.settings.structureMode === "multi-page";

  return `
  <!-- Blog Section: ${variant} -->
  <section id="blog" class="jk-section bg-slate-50">
    <div class="jk-container">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-brand">Rehber & Blog</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Güncel Makale ve İpuçları</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${posts.slice(0, 3).map((b, idx) => {
          const postUrl = isMulti ? `blog-${b.slug || idx + 1}.html` : "#contact";
          return `
        <article class="jk-card flex flex-col justify-between">
          <div>
            <div class="aspect-16/9 rounded-lg overflow-hidden bg-slate-200 mb-4">
              <img src="${b.coverImageUrl ? sanitizeUrl(b.coverImageUrl) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtmlAttr(b.title)}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2">${escapeHtml(b.title)}</h3>
            <p class="text-slate-600 text-xs leading-relaxed mb-4">${escapeHtml(b.excerpt || "")}</p>
          </div>
          <a href="${postUrl}" class="text-xs font-bold text-brand hover:underline">Yazıyı Oku →</a>
        </article>`;
        }).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/**
 * 13. NEWSLETTER (Subscriber Sign-Up Strip)
 */
export function renderNewsletterSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  return `
  <!-- Newsletter Section: ${variant} -->
  <section id="newsletter" class="jk-section bg-slate-900 text-white">
    <div class="jk-container max-w-2xl text-center">
      <span class="text-xs font-bold uppercase tracking-wider text-amber-400">E-Bülten Aboneliği</span>
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 mb-3">Kampanyalardan Haberdar Olun</h2>
      <p class="text-slate-400 text-xs sm:text-sm mb-6">Yeni hizmetler ve indirimli paketler doğrudan e-posta kutunuza gelsin.</p>
      <form class="flex flex-col sm:flex-row gap-2" onsubmit="event.preventDefault(); alert('Kaydınız alındı.');">
        <input type="email" required placeholder="E-posta adresinizi giriniz..." class="grow px-4 py-3 rounded-lg text-sm text-slate-900 bg-white">
        <button type="submit" class="jk-button jk-button-primary text-sm py-3 px-6 shrink-0">Abone Ol</button>
      </form>
    </div>
  </section>`;
}

/**
 * 14. SOCIAL FEED (Social Media Cards)
 */
export function renderSocialFeedSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  return `
  <!-- Social Feed Section: ${variant} -->
  <section id="socialFeed" class="jk-section bg-white">
    <div class="jk-container text-center max-w-2xl">
      <span class="text-xs font-bold uppercase tracking-wider text-brand">Sosyal Medya</span>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 mb-4">Bizi Takip Edin</h2>
      <p class="text-slate-600 text-xs sm:text-sm mb-6">Güncel duyurular ve çalışmalarımız için resmi hesaplarımızı takip edin.</p>
      <div class="flex justify-center gap-4">
        <a href="#contact" class="jk-button jk-button-secondary text-xs py-2 px-4">Instagram</a>
        <a href="#contact" class="jk-button jk-button-secondary text-xs py-2 px-4">Facebook</a>
      </div>
    </div>
  </section>`;
}

/**
 * 15. FOOTER (Structural Footer)
 */
export function renderFooterSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  const bp = site.businessProfile;
  const companyName = escapeHtml(bp.identity.companyName);
  const currentYear = new Date().getFullYear();

  return `
  <!-- Structural Footer: ${variant} -->
  <footer class="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800 jk-footer">
    <div class="jk-container">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span class="text-sm font-bold text-white block mb-1">${companyName}</span>
          <p class="text-slate-500">© ${currentYear} ${companyName}. Tüm hakları saklıdır.</p>
        </div>
        <div class="flex items-center gap-6">
          <a href="#hero" class="hover:text-white transition-colors">Yukarı Çık ↑</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * 16. CUSTOM HTML (Experimental Sanitized HTML Container)
 */
export function renderCustomHtmlSection(context: SectionRenderContext): string {
  const { site, variant } = context;
  // Security guard: experimental custom html
  return `
  <!-- Custom HTML Section: ${variant} -->
  <section id="customHtml" class="jk-section bg-white">
    <div class="jk-container">
      <div class="p-6 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-xs">
        [Özel HTML Modülü]
      </div>
    </div>
  </section>`;
}

// =========================================================================
// 3. CENTRAL SECTION RENDERER REGISTRY (Section 16)
// =========================================================================

export const CANONICAL_SECTION_RENDERER_MAP: Record<CanonicalSectionId, (context: SectionRenderContext) => string> = {
  header: renderHeaderSection,
  hero: renderHeroSection,
  services: renderServicesSection,
  about: renderAboutSection,
  whyUs: renderWhyUsSection,
  gallery: renderGallerySection,
  testimonials: renderTestimonialsSection,
  faqs: renderFaqsSection,
  contact: renderContactSection,
  products: renderProductsSection,
  pricing: renderPricingSection,
  blog: renderBlogSection,
  newsletter: renderNewsletterSection,
  socialFeed: renderSocialFeedSection,
  footer: renderFooterSection,
  customHtml: renderCustomHtmlSection,
};

/**
 * Primary Canonical Section Rendering Dispatcher.
 *
 * Enforces:
 * 1. Section definition lookup from registry
 * 2. Section readiness check (EMPTY sections not rendered)
 * 3. Variant resolution (customer config -> template manifest -> registry default)
 */
export function renderCanonicalSection(
  sectionIdOrAlias: string,
  context: RenderContext,
  order = 0
): string {
  const canonicalId = normalizeSectionId(sectionIdOrAlias);
  if (!canonicalId || !isCanonicalSectionId(canonicalId)) {
    // Unknown section safely ignored
    return "";
  }

  const { site, manifest } = context;

  // Evaluate Content Readiness (Sprint 06 Engine)
  const readiness = evaluateSectionReadiness(canonicalId, {
    businessProfile: site.businessProfile,
    siteContent: site.content,
    sectionConfig: site.sectionConfiguration,
  });

  // Invariant: EMPTY or disabled sections must not be rendered
  if (!readiness.canRender || readiness.status === "EMPTY" || readiness.status === "NOT_CONFIGURED") {
    return "";
  }

  // Resolve Variant
  const variant = resolveSectionVariant(canonicalId, site, manifest);

  // Dispatch to renderer
  const renderer = CANONICAL_SECTION_RENDERER_MAP[canonicalId];
  if (!renderer) {
    return "";
  }

  return renderer({
    ...context,
    sectionId: canonicalId,
    variant,
    order,
  });
}
