/**
 * JetKur Turkish Text Normalizer for Industry Resolution (Sprint 05)
 *
 * Deterministic conversion of Turkish characters and variants for resilient search:
 * "Sıhhi Tesisat" -> "sihhi tesisat"
 * "Tesisatçı"     -> "tesisatci"
 * "Klima Servisi" -> "klima servisi"
 */

export function normalizeTurkishText(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    // Replace Turkish uppercase dotted/dotless I correctly
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    // Map specific Turkish characters to ASCII equivalents
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // Replace punctuation and separators with space
    .replace(/[-_.,;:/\\&()+'"]/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Standardizes a slug identifier (lowercase alphanumeric with dashes)
 */
export function normalizeSlug(slug: string): string {
  return normalizeTurkishText(slug).replace(/\s+/g, "-");
}
