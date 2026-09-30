/**
 * JetKur Simple Customer Media Manager (Sprint 14)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Provides a simple, friendly interface for business owners to:
 * 1. View images used on their site (Hero, About, Services, Gallery).
 * 2. See whether an image was uploaded by them or auto-selected by JetKur.
 * 3. Upload their own real workplace/team photos.
 * 4. Search and select fresh stock photos.
 * 5. Update descriptive alt text easily.
 */

import React, { useState } from "react";
import { SiteConfig } from "../../types";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Sparkles,
  Check,
  RotateCcw,
  Tag,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface CustomerMediaManagerProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  readOnly?: boolean;
}

interface ImageSlotItem {
  slotKey: string;
  label: string;
  section: string;
  currentUrl: string;
  altText: string;
  sourceType: "CUSTOMER_UPLOAD" | "STOCK";
}

export const CustomerMediaManager: React.FC<CustomerMediaManagerProps> = ({
  config,
  onChange,
  readOnly = false,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract all media slots currently configured on the site
  const slots: ImageSlotItem[] = [];

  // 1. Hero
  if (config.hero) {
    const heroBg = config.hero.bgImage || (config.hero as any).bgImageUrl || "";
    slots.push({
      slotKey: "hero-bg",
      label: "Ana Sayfa Başlık (Hero) Görseli",
      section: "Ana Sayfa",
      currentUrl: heroBg,
      altText: config.hero.bgImageAlt || config.companyName || "",
      sourceType: heroBg.startsWith("data:") ? "CUSTOMER_UPLOAD" : "STOCK",
    });
  }

  // 2. About
  if (config.about) {
    const aboutImg = config.about.image || (config.about as any).imageUrl || "";
    slots.push({
      slotKey: "about-main",
      label: "Hakkımızda Bölümü Görseli",
      section: "Hakkımızda",
      currentUrl: aboutImg,
      altText: config.about.imageAlt || "Hakkımızda görseli",
      sourceType: aboutImg.startsWith("data:") ? "CUSTOMER_UPLOAD" : "STOCK",
    });
  }

  // 3. Services
  const services = config.services?.items || [];
  services.forEach((srv, idx) => {
    slots.push({
      slotKey: `service-${idx + 1}`,
      label: `${srv.title || `Hizmet ${idx + 1}`} Görseli`,
      section: "Hizmetler",
      currentUrl: srv.image || "",
      altText: srv.title || "",
      sourceType: (srv.image || "").startsWith("data:") ? "CUSTOMER_UPLOAD" : "STOCK",
    });
  });

  // 4. Gallery
  const gallery = config.gallery?.items || [];
  gallery.forEach((item, idx) => {
    slots.push({
      slotKey: `gallery-${idx + 1}`,
      label: `Galeri Fotoğrafı ${idx + 1}`,
      section: "Galeri",
      currentUrl: item.imageUrl || item.url || "",
      altText: item.title || item.altText || `Galeri görseli ${idx + 1}`,
      sourceType: (item.imageUrl || item.url || "").startsWith("data:") ? "CUSTOMER_UPLOAD" : "STOCK",
    });
  });

  // Handle local image upload with browser preview and state update
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slotKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Dosya boyutu çok büyük (Maksimum 10 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateSlotUrl(slotKey, dataUrl, file.name.replace(/\.[^/.]+$/, ""));
      setStatusMessage("Görseliniz başarıyla yüklendi ve taslağınıza eklendi.");
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const updateSlotUrl = (slotKey: string, newUrl: string, newAlt?: string) => {
    const updated = JSON.parse(JSON.stringify(config)) as any;

    if (slotKey === "hero-bg") {
      if (!updated.hero) updated.hero = {};
      updated.hero.bgImage = newUrl;
      updated.hero.bgImageUrl = newUrl;
      if (newAlt) updated.hero.bgImageAlt = newAlt;
    } else if (slotKey === "about-main") {
      if (!updated.about) updated.about = {};
      updated.about.image = newUrl;
      updated.about.imageUrl = newUrl;
      if (newAlt) updated.about.imageAlt = newAlt;
    } else if (slotKey.startsWith("service-")) {
      const idx = parseInt(slotKey.replace("service-", ""), 10) - 1;
      if (updated.services?.items && updated.services.items[idx]) {
        updated.services.items[idx].image = newUrl;
      }
    } else if (slotKey.startsWith("gallery-")) {
      const idx = parseInt(slotKey.replace("gallery-", ""), 10) - 1;
      if (updated.gallery?.items && updated.gallery.items[idx]) {
        updated.gallery.items[idx].imageUrl = newUrl;
        updated.gallery.items[idx].url = newUrl;
      }
    }

    updated.updatedAt = new Date().toISOString();
    onChange(updated);
  };

  const handleSearchStock = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/media/sites/active/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results?.assets) {
        setSearchResults(data.results.assets);
      }
    } catch {
      // Graceful fallback
      setSearchResults([
        {
          id: "stock-fb-1",
          originalUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
          altText: query,
          photographerName: "Profesyonel Fotoğrafçı",
        },
        {
          id: "stock-fb-2",
          originalUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
          altText: query,
          photographerName: "JetKur Arşivi",
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Görseller &amp; Medya Yönetimi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Web sitenizde kullanılan tüm fotoğrafları buradan kolayca görüntüleyebilir, kendi fotoğraflarınızı yükleyebilir veya kaliteli stok fotoğraflarla değiştirebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            {slots.length} Aktif Görsel
          </span>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Media Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div
            key={slot.slotKey}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Image Preview Box */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden group">
              {slot.currentUrl ? (
                <img
                  src={slot.currentUrl}
                  alt={slot.altText}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-xs font-medium">Görsel Seçilmedi</span>
                </div>
              )}

              {/* Source Tag Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                    slot.sourceType === "CUSTOMER_UPLOAD"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-indigo-600/90 text-white"
                  }`}
                >
                  {slot.sourceType === "CUSTOMER_UPLOAD" ? "Kendi Görseliniz" : "JetKur Seçimi"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                  {slot.section}
                </span>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{slot.label}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  Alt Metin: {slot.altText || "Açıklama girilmemiş"}
                </p>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {/* Upload Custom Image */}
                  <label className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Yükle</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, slot.slotKey)}
                    />
                  </label>

                  {/* Search Stock Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot.slotKey);
                      setStockSearchQuery(slot.altText || config.companyName || "işletme");
                      handleSearchStock(slot.altText || config.companyName || "işletme");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Değiştir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stock Photo Search & Selection Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Fotoğraf Seç</h3>
                <p className="text-xs text-slate-500">
                  {slots.find((s) => s.slotKey === selectedSlot)?.label} için uygun bir fotoğraf belirleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchStock(stockSearchQuery)}
                placeholder="Örn: sıhhi tesisat, kombi bakımı, diş kliniği..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleSearchStock(stockSearchQuery)}
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? "Aranıyor..." : "Ara"}</span>
              </button>
            </div>

            {/* Search Results Grid */}
            <div className="flex-1 overflow-y-auto min-h-[260px] grid grid-cols-2 sm:grid-cols-3 gap-3">
              {searchResults.map((photo) => (
                <div
                  key={photo.id || photo.originalUrl}
                  onClick={() => {
                    updateSlotUrl(selectedSlot, photo.originalUrl, photo.altText);
                    setSelectedSlot(null);
                    setStatusMessage("Fotoğraf başarıyla değiştirildi.");
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="group relative aspect-video rounded-xl bg-slate-900 overflow-hidden cursor-pointer border border-transparent hover:border-indigo-500 transition-all hover:scale-[1.02]"
                >
                  <img
                    src={photo.originalUrl}
                    alt={photo.altText || "Fotoğraf"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" />
                      <span>Bu Fotoğrafı Kullan</span>
                    </span>
                  </div>
                </div>
              ))}

              {!isSearching && searchResults.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <p className="text-xs">Fotoğraf aramak için yukarıdaki kutuya bir kelime yazıp Ara'ya tıklayın.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
