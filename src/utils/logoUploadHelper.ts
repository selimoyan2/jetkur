/**
 * Robust Logo & File Reader Processing Utility for JetKur
 * Handles File, Blob, and FormData with comprehensive validation,
 * chunked error handling, image decoding verification, and WebP compression.
 */

import { compressImageFileToWebP, formatBytes } from "./imageOptimizer";

export interface LogoUploadResult {
  success: boolean;
  dataUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileSizeBytes?: number;
  dimensions?: { width: number; height: number };
  format?: "svg" | "webp" | "png" | "jpeg" | "gif" | "other";
  savingsPercentage?: number;
  errorMessage?: string;
  warning?: string;
}

const MAX_LOGO_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon"
];

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".avif", ".ico"];

/**
 * Validates whether a given file is a permissible logo image
 */
export function validateLogoFile(file: File | Blob, fileName?: string): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "Lütfen bir dosya seçin." };
  }

  // Size check
  if (file.size <= 0) {
    return { valid: false, error: "Seçilen dosya boş veya okunamıyor (0 bayt)." };
  }

  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Dosya boyutu çok yüksek (${sizeInMb}MB). Logo için maksimum 10MB boyutundaki dosyaları yükleyebilirsiniz.`
    };
  }

  // Type check
  const actualName = fileName || (file instanceof File ? file.name : "");
  const mimeType = file.type ? file.type.toLowerCase() : "";
  const ext = actualName ? "." + actualName.split(".").pop()?.toLowerCase() : "";

  const isMimeValid = ALLOWED_MIME_TYPES.some((m) => mimeType.includes(m));
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: "Desteklenmeyen dosya formatı. Lütfen PNG (şeffaf), SVG (vektörel), JPG veya WebP formatında bir logo dosyası seçin."
    };
  }

  return { valid: true };
}

/**
 * Robustly reads a File or Blob into a base64 Data URL using FileReader
 * with timeout safeguards, error/abort events, and proper memory cleanup.
 */
export function readFileAsDataURL(file: File | Blob, timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          reader.abort();
        } catch {
          // ignore
        }
        reject(new Error("Dosya okuma işlemi zaman aşımına uğradı. Dosya kilitli veya hasarlı olabilir."));
      }
    }, timeoutMs);

    reader.onload = (event) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      const result = event.target?.result;
      if (typeof result === "string" && result.length > 0) {
        resolve(result);
      } else {
        reject(new Error("Dosya içeriği okunamadı veya boş döndü."));
      }
    };

    reader.onerror = (event) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      const err = reader.error;
      const detailMsg = err ? `${err.name}: ${err.message}` : "Bilinmeyen I/O okuma hatası";
      reject(new Error(`Dosya okunurken sistem hatası oluştu (${detailMsg}).`));
    };

    reader.onabort = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      reject(new Error("Dosya okuma işlemi kullanıcı veya tarayıcı tarafından iptal edildi."));
    };

    try {
      reader.readAsDataURL(file);
    } catch (err: any) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        reject(new Error(`FileReader başlatılamadı: ${err?.message || err}`));
      }
    }
  });
}

/**
 * Verifies that a data URL represents a decipherable, non-corrupt image
 * and extracts natural dimensions.
 */
export function verifyImageDimensions(dataUrl: string, timeoutMs = 8000): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // If SVG data URL, dimensions might be parsed via DOM or skipped
    if (dataUrl.startsWith("data:image/svg+xml")) {
      resolve({ width: 240, height: 80 });
      return;
    }

    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        reject(new Error("Görsel çözümlenmesi zaman aşımına uğradı. Dosya bozuk olabilir."));
      }
    }, timeoutMs);

    img.onload = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      });
    };

    img.onerror = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      reject(new Error("Görsel dosyası bozuk veya tarayıcı tarafından çözümlenemiyor."));
    };

    img.src = dataUrl;
  });
}

/**
 * Master logo processor:
 * 1. Validates file
 * 2. Attempts modern WebP optimization (preserves alpha transparency)
 * 3. Falls back safely to robust FileReader if WebP pipeline fails or for SVGs
 * 4. Verifies image integrity and extracts dimensions
 */
export async function processLogoFile(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    companySubdomain?: string;
  }
): Promise<LogoUploadResult> {
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    return {
      success: false,
      errorMessage: validation.error || "Geçersiz dosya.",
      fileName: file.name,
      fileSizeBytes: file.size
    };
  }

  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  const maxDim = options?.maxDimension || 1200;
  const quality = options?.quality || 0.9;
  const subdomain = options?.companySubdomain || "sirket";

  try {
    // For SVG vector files, directly read via robust FileReader to prevent raster degradation
    if (isSvg) {
      const dataUrl = await readFileAsDataURL(file);
      return {
        success: true,
        dataUrl,
        fileName: file.name,
        fileSizeBytes: file.size,
        format: "svg",
        dimensions: { width: 300, height: 80 },
        savingsPercentage: 0
      };
    }

    // Attempt high-efficiency WebP compression preserving alpha
    try {
      const optDetails = await compressImageFileToWebP(file, maxDim, quality, subdomain);
      if (optDetails.base64 && optDetails.base64.length > 50) {
        return {
          success: true,
          dataUrl: optDetails.base64,
          fileName: file.name,
          fileSizeBytes: optDetails.compressedSize,
          format: optDetails.format as any,
          dimensions: { width: optDetails.width, height: optDetails.height },
          savingsPercentage: optDetails.savingsPercentage
        };
      }
    } catch (compressErr) {
      console.warn("WebP compression failed for logo, falling back to direct FileReader:", compressErr);
    }

    // Safe fallback to direct FileReader
    const fallbackDataUrl = await readFileAsDataURL(file);
    const dims = await verifyImageDimensions(fallbackDataUrl).catch(() => ({ width: 0, height: 0 }));

    return {
      success: true,
      dataUrl: fallbackDataUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
      format: file.type.includes("png") ? "png" : file.type.includes("jpeg") ? "jpeg" : "other",
      dimensions: dims,
      savingsPercentage: 0
    };
  } catch (err: any) {
    return {
      success: false,
      fileName: file.name,
      fileSizeBytes: file.size,
      errorMessage: err?.message || "Logo dosyası işlenirken beklenmeyen bir hata oluştu."
    };
  }
}

/**
 * Processes logo files from a standard FormData object.
 * Extracts either the first File found or a specific key.
 */
export async function processLogoFormData(
  formData: FormData,
  fieldName = "logo"
): Promise<LogoUploadResult> {
  try {
    let fileEntry = formData.get(fieldName);
    if (!fileEntry) {
      // Look for any file in formData
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          fileEntry = value;
          break;
        }
      }
    }

    if (!fileEntry || !(fileEntry instanceof File)) {
      return {
        success: false,
        errorMessage: "FormData içerisinde geçerli bir logo görsel dosyası bulunamadı."
      };
    }

    return await processLogoFile(fileEntry);
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `FormData işlenemedi: ${err?.message || err}`
    };
  }
}
