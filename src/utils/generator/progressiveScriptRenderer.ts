/**
 * JetKur Progressive Script Renderer (Sprint 09)
 *
 * Emits minimal, vanilla JavaScript handlers exclusively for interactive progressive enhancements:
 * - Mobile drawer navigation
 * - FAQ accordion toggle
 * - Hero carousel slider
 * - Gallery lightbox modal
 * - WhatsApp chat popup widget
 *
 * CRITICAL INVARIANT:
 * Core business content, contact numbers, and navigation remain 100% visible and functional
 * even if JavaScript execution fails completely or is disabled by the client.
 */

import { SiteConfig } from "../../types";
import { ProgressiveFeatureRequirement } from "./types";

/**
 * Inspects site configuration to determine which progressive JS features are actually required.
 */
export function collectRequiredEnhancements(config: SiteConfig): ProgressiveFeatureRequirement {
  const hasFaqs = Boolean(
    (config.faqs?.enabled !== false && config.faqs?.items && config.faqs.items.length > 0) ||
    (config.faq?.enabled !== false && config.faq?.items && config.faq.items.length > 0)
  );

  const hasSlider = Boolean(
    config.hero?.slides && config.hero.slides.length > 1
  );

  const hasGallery = Boolean(
    config.gallery?.enabled !== false && config.gallery?.items && config.gallery.items.length > 0
  );

  const hasLanguage = Boolean(
    (config.languages?.activeLanguages && config.languages.activeLanguages.length > 1) ||
    ((config as any).languageConfig?.enabled && (config as any).languageConfig?.supportedLanguages?.length > 1)
  );

  const hasCatalog = Boolean(
    config.products?.enabled !== false && config.products?.items && config.products.items.length > 0
  );

  return {
    mobileNav: true,
    faqAccordion: hasFaqs,
    heroSlider: hasSlider,
    galleryLightbox: hasGallery,
    languageSwitcher: hasLanguage,
    catalogModal: hasCatalog,
  };
}

/**
 * Renders the consolidated client-side progressive enhancement script block.
 */
export function renderProgressiveScripts(
  config: SiteConfig,
  features?: Partial<ProgressiveFeatureRequirement>
): string {
  const reqs = {
    ...collectRequiredEnhancements(config),
    ...features,
  };

  const scripts: string[] = [];

  // 1. Mobile Drawer Navigation Controller
  if (reqs.mobileNav) {
    scripts.push(`
    // Mobile Drawer Navigation
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
      if (isOpened) closeMobileMenu();
      else openMobileMenu();
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMobileMenu();
    });`);
  }

  // 2. FAQ Accordion Toggle
  if (reqs.faqAccordion) {
    scripts.push(`
    // FAQ Accordion
    function toggleFaq(idx) {
      const panel = document.getElementById('faq-content-' + idx) || document.getElementById('faqAnswer-' + idx);
      const icon = document.getElementById('faqIcon-' + idx);
      const btn = document.querySelector('[aria-controls="faq-content-' + idx + '"]') || document.querySelector('[aria-controls="faqAnswer-' + idx + '"]');
      if (!panel) return;
      const isOpen = panel.style.display === 'block' || !panel.classList.contains('hidden');
      if (isOpen) {
        panel.style.display = 'none';
        panel.classList.add('hidden');
        if (icon) icon.textContent = '+';
        if (btn) btn.setAttribute('aria-expanded', 'false');
      } else {
        panel.style.display = 'block';
        panel.classList.remove('hidden');
        if (icon) icon.textContent = '−';
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
    }`);
  }

  // 3. Hero Carousel Slider
  if (reqs.heroSlider) {
    const slideCount = config.hero?.slides?.length || 2;
    scripts.push(`
    // Hero Slider Controller
    let currentHeroSlide = 0;
    const totalHeroSlides = ${slideCount};
    function showHeroSlide(index) {
      for (let i = 0; i < totalHeroSlides; i++) {
        const slide = document.getElementById('heroSlide' + i);
        const dot = document.getElementById('heroDot' + i);
        if (slide) {
          if (i === index) {
            slide.style.opacity = '1';
            slide.style.pointerEvents = 'auto';
            slide.style.zIndex = '1';
          } else {
            slide.style.opacity = '0';
            slide.style.pointerEvents = 'none';
            slide.style.zIndex = '0';
          }
        }
        if (dot) {
          if (i === index) {
            dot.className = 'w-8 h-2.5 rounded-full bg-white transition-all duration-300';
          } else {
            dot.className = 'w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/75 transition-all duration-300';
          }
        }
      }
      currentHeroSlide = index;
    }
    function nextHeroSlide() { showHeroSlide((currentHeroSlide + 1) % totalHeroSlides); }
    function prevHeroSlide() { showHeroSlide((currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides); }
    if (totalHeroSlides > 1) {
      setInterval(nextHeroSlide, 5000);
    }`);
  }

  // 4. WhatsApp Interactive Floating Widget
  const waEnabled = (config.whatsappWidget?.enabled !== false) && ((config as any).floatingWhatsApp?.enabled !== false);
  if (waEnabled && config.whatsapp) {
    scripts.push(`
    // Floating WhatsApp Widget
    function toggleWhatsAppPopup(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const popup = document.getElementById('waChatPopup');
      if (popup) {
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
      const cleanPhone = (phone || '').replace(/\\D/g, '');
      const url = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(val || 'Merhaba, bilgi almak istiyorum.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }`);
  }

  return `<script>
(function() {
${scripts.join("\n")}
})();
</script>`;
}
