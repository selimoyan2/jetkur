/**
 * SEO-Friendly URL & Slug Utility for Products, Blogs, Services, and Pages.
 * 
 * Provides robust conversion of Turkish characters to English equivalents:
 * - 'ş' / 'Ş' -> 's'
 * - 'ç' / 'Ç' -> 'c'
 * - 'ı' / 'I' / 'İ' / 'i̇' -> 'i'
 * - 'ğ' / 'Ğ' -> 'g'
 * - 'ü' / 'Ü' -> 'u'
 * - 'ö' / 'Ö' -> 'o'
 * 
 * Correctly strips apostrophes without leaving stray hyphens (e.g., "Sürat'ın" -> "suratin"),
 * replaces spaces and punctuation with clean hyphens, collapses consecutive hyphens,
 * and removes leading/trailing hyphens.
 */

/**
 * Transliterates Turkish and accented characters to their standard ASCII equivalents.
 */
export function turkishToAscii(text: string): string {
  if (!text) return "";

  return text
    // Specific Turkish uppercase & lowercase handling
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i") // lowercase i with combining dot
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    // Common Turkish apostrophes & quotes (e.g. Sürat'ı -> surati, Kombi'de -> kombide)
    .replace(/['’"`´]/g, "")
    // Normalize unicode and strip any remaining diacritic accents (e.g. â, î, û, é, etc.)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Generates a clean, SEO-optimized URL slug from any title or text string.
 * Example: "7/24 Acil Oto Çekici & Yol Yardımı!" -> "7-24-acil-oto-cekici-ve-yol-yardimi"
 * 
 * @param text The input string (e.g. product title, blog headline, service name)
 * @param fallback Fallback string if input resolves to empty (default: "sayfa")
 */
export function slugify(text: string, fallback = "sayfa"): string {
  if (!text || typeof text !== "string") return fallback;

  const ascii = turkishToAscii(text.trim())
    .toLowerCase()
    .replace(/&/g, "ve")
    .replace(/[^a-z0-9]+/g, "-") // replace spaces, punctuation, and non-alphanumeric chars with hyphens
    .replace(/-+/g, "-")         // collapse multiple hyphens into a single hyphen
    .replace(/^-+|-+$/g, "");    // trim leading and trailing hyphens

  return ascii || fallback;
}

/**
 * Generates an SEO-friendly slug specifically formatted for Products.
 * Example: "Kombi Tamir & Bakım Kiti 10'lu Paket" -> "kombi-tamir-ve-bakim-kiti-10-lu-paket"
 */
export function slugifyProduct(title: string, fallbackId?: string): string {
  const slug = slugify(title, fallbackId ? `urun-${fallbackId}` : "urun");
  return slug;
}

/**
 * Generates an SEO-friendly slug specifically formatted for Blog Articles.
 * Example: "Yolda Kaldığınızda İlk Yapılması Gereken 5 Şey!" -> "yolda-kaldiginizda-ilk-yapilmasi-gereken-5-sey"
 */
export function slugifyBlog(title: string, fallbackId?: string): string {
  const slug = slugify(title, fallbackId ? `blog-${fallbackId}` : "blog-yazisi");
  return slug;
}

/**
 * Generates an SEO-friendly slug specifically formatted for Services.
 * Example: "Klima Montaj & De-montaj Servisi" -> "klima-montaj-ve-de-montaj-servisi"
 */
export function slugifyService(title: string, fallbackId?: string): string {
  const slug = slugify(title, fallbackId ? `hizmet-${fallbackId}` : "hizmet-detay");
  return slug;
}

/**
 * Generates an SEO-friendly slug for Categories.
 * Example: "Oto Çekici & Kurtarma" -> "oto-cekici-ve-kurtarma"
 */
export function slugifyCategory(name: string, fallback = "genel"): string {
  return slugify(name, fallback);
}

/**
 * Generates a valid DNS subdomain name from a company name.
 * Example: "Sürat Tesisat & Mühendislik Ltd. Şti." -> "surat-tesisat-ve-muhendislik-ltd-sti"
 */
export function slugifySubdomain(text: string, fallback = "firmam"): string {
  if (!text || typeof text !== "string") return fallback;

  const ascii = turkishToAscii(text.trim())
    .toLowerCase()
    .replace(/&/g, "ve")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || fallback;
}

/**
 * Live sanitizes input as the user types in slug or subdomain form fields.
 * Immediately converts typed Turkish characters into valid ASCII equivalents
 * without turning mid-typing characters into premature hyphens.
 */
export function sanitizeSlugInput(input: string): string {
  if (!input) return "";
  return turkishToAscii(input)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
