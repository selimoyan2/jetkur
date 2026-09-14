import { TaxPricingConfig, ProductItem, SiteConfig } from "../types";

export const DEFAULT_TAX_CONFIG: TaxPricingConfig = {
  enabled: true,
  defaultVatRate: 20,
  priceIncludesVat: true,
  displayVatBadge: true,
  displayTaxBreakdown: true,
  roundingMethod: "standard",
  vatExemptNotice: "Fiyatlarımıza yasal KDV dahildir. Kurumsal ve bireysel e-fatura / e-arşiv fatura düzenlenmektedir.",
  currencySymbol: "₺",
  currencyPosition: "suffix",
  customRates: [20, 10, 1, 0]
};

export const STANDARD_VAT_RATES = [
  { 
    rate: 20, 
    label: "%20 Genel Standart Oran", 
    desc: "Hizmetler, bilişim, otomotiv, mobilya, beyaz eşya, teknoloji ve çoğu tüketim malları" 
  },
  { 
    rate: 10, 
    label: "%10 İndirimli Oran", 
    desc: "Restoran & kafe yeme-içme, otel/konaklama, tekstil & giyim, sinema/tiyatro, ilaç & tıbbi cihaz" 
  },
  { 
    rate: 1, 
    label: "%1 Temel Oran", 
    desc: "Temel tarım ürünleri, un, ekmek, buğday tohumları, kentsel dönüşüm konutları" 
  },
  { 
    rate: 0, 
    label: "%0 KDV Muafiyeti / İstisnası", 
    desc: "Yurtdışı ihracat, serbest bölge teslimleri, vergi istisnası kapsamındaki hizmetler" 
  }
];

export function getEffectiveTaxConfig(config?: Partial<SiteConfig>): TaxPricingConfig {
  if (config?.taxPricing) {
    return {
      ...DEFAULT_TAX_CONFIG,
      ...config.taxPricing
    };
  }
  return DEFAULT_TAX_CONFIG;
}

/**
 * Parses Turkish or international price string into a float number
 * Examples: "1.450 ₺" -> 1450, "1.450,50 TL" -> 1450.5, "₺2,500.00" -> 2500, "99.90" -> 99.9
 */
export function parsePriceNumber(raw: string | number | undefined | null): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  
  const trimmed = raw.trim();
  if (!trimmed) return 0;

  // Remove currency words/symbols
  let cleaned = trimmed
    .replace(/[₺$€£]/g, "")
    .replace(/\b(TL|TRY|USD|EUR|GBP)\b/gi, "")
    .trim();

  // If format is Turkish like "1.450,50" -> remove dot (thousands), replace comma with dot
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      // 1.250,50 style
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // 1,250.50 style
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    // e.g. "1450,50" or "1,450"
    const parts = cleaned.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      // decimal comma
      cleaned = cleaned.replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(".")) {
    // e.g. "1.450" or "99.99"
    const parts = cleaned.split(".");
    if (parts.length === 2 && parts[1].length === 3) {
      // likely thousands separator "1.450"
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Formats a number into a localized currency string, e.g. "1.450 ₺" or "₺1.450,50"
 */
export function formatPriceNumber(
  amount: number,
  symbol: string = "₺",
  position: "suffix" | "prefix" = "suffix",
  forceDecimals: boolean = false
): string {
  if (isNaN(amount)) amount = 0;
  
  // Decide whether to show decimal digits
  const hasDecimals = amount % 1 !== 0;
  const decimals = forceDecimals || hasDecimals ? 2 : 0;
  
  const formattedNumber = amount.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (position === "prefix") {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}

export interface TaxCalculationResult {
  numericInput: number;
  vatRate: number;
  priceIncludesVat: boolean;
  netPrice: number;       // Matrah (Vergisiz net tutar)
  vatAmount: number;      // KDV Tutarı
  grossPrice: number;     // KDV Dahil Toplam Tutar
  formattedNet: string;
  formattedVat: string;
  formattedGross: string;
  badgeText: string;
  exempt: boolean;
}

/**
 * Detailed tax calculation for a price and VAT rate
 */
export function calculateTaxDetails(
  rawPrice: string | number,
  vatRate: number,
  priceIncludesVat: boolean,
  symbol: string = "₺",
  position: "suffix" | "prefix" = "suffix",
  isExempt: boolean = false
): TaxCalculationResult {
  const numericInput = parsePriceNumber(rawPrice);
  const effectiveRate = isExempt ? 0 : Math.max(0, vatRate);

  let netPrice = 0;
  let vatAmount = 0;
  let grossPrice = 0;

  if (effectiveRate === 0) {
    netPrice = numericInput;
    vatAmount = 0;
    grossPrice = numericInput;
  } else if (priceIncludesVat) {
    // Input price already includes VAT
    grossPrice = numericInput;
    netPrice = numericInput / (1 + effectiveRate / 100);
    vatAmount = grossPrice - netPrice;
  } else {
    // Input price excludes VAT -> add VAT
    netPrice = numericInput;
    vatAmount = numericInput * (effectiveRate / 100);
    grossPrice = netPrice + vatAmount;
  }

  const formattedNet = formatPriceNumber(netPrice, symbol, position);
  const formattedVat = formatPriceNumber(vatAmount, symbol, position);
  const formattedGross = formatPriceNumber(grossPrice, symbol, position);

  let badgeText = "";
  if (isExempt || effectiveRate === 0) {
    badgeText = "KDV'den Muaf";
  } else if (priceIncludesVat) {
    badgeText = `%${effectiveRate} KDV Dahil`;
  } else {
    badgeText = `+%${effectiveRate} KDV Hariç`;
  }

  return {
    numericInput,
    vatRate: effectiveRate,
    priceIncludesVat,
    netPrice,
    vatAmount,
    grossPrice,
    formattedNet,
    formattedVat,
    formattedGross,
    badgeText,
    exempt: isExempt
  };
}

/**
 * Resolves item-level tax overrides vs store-wide tax defaults
 */
export function calculateProductTax(
  product: ProductItem,
  taxConfig: TaxPricingConfig
): TaxCalculationResult {
  const isExempt = Boolean(product.taxExempt);
  const vatRate = isExempt 
    ? 0 
    : (product.vatRate !== undefined && product.vatRate !== null 
        ? product.vatRate 
        : taxConfig.defaultVatRate);
        
  const priceIncludesVat = product.priceIncludesVat !== undefined 
    ? product.priceIncludesVat 
    : taxConfig.priceIncludesVat;

  return calculateTaxDetails(
    product.price,
    vatRate,
    priceIncludesVat,
    taxConfig.currencySymbol || "₺",
    taxConfig.currencyPosition || "suffix",
    isExempt
  );
}

/**
 * Bulk updates product prices:
 * - "add_vat": Treats current prices as net (KDV hariç) and recalculates them to KDV dahil (price * (1 + rate/100))
 * - "remove_vat": Treats current prices as gross (KDV dahil) and extracts net base (price / (1 + rate/100))
 */
export function bulkConvertProductPrices(
  items: ProductItem[],
  action: "add_vat" | "remove_vat",
  vatRate: number,
  symbol: string = "₺",
  position: "suffix" | "prefix" = "suffix"
): ProductItem[] {
  const factor = 1 + vatRate / 100;
  if (factor <= 0) return items;

  return items.map((item) => {
    if (item.taxExempt) return item;

    const currentNumeric = parsePriceNumber(item.price);
    if (currentNumeric <= 0) return item;

    let newNumeric = currentNumeric;
    if (action === "add_vat") {
      newNumeric = Math.round(currentNumeric * factor);
    } else {
      newNumeric = Math.round(currentNumeric / factor);
    }

    const updatedPrice = formatPriceNumber(newNumeric, symbol, position);

    let updatedOldPrice = item.oldPrice;
    if (item.oldPrice) {
      const oldNumeric = parsePriceNumber(item.oldPrice);
      if (oldNumeric > 0) {
        let newOldNumeric = oldNumeric;
        if (action === "add_vat") {
          newOldNumeric = Math.round(oldNumeric * factor);
        } else {
          newOldNumeric = Math.round(oldNumeric / factor);
        }
        updatedOldPrice = formatPriceNumber(newOldNumeric, symbol, position);
      }
    }

    return {
      ...item,
      price: updatedPrice,
      oldPrice: updatedOldPrice
    };
  });
}
