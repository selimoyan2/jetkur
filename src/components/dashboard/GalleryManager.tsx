import React, { useState, useRef } from "react";
import { SiteConfig, GalleryItem } from "../../types";
import { compressImageToBase64 } from "./Base64ImageUpload";
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Eye, 
  MoveUp, 
  MoveDown, 
  Sparkles, 
  Check, 
  Search, 
  LayoutGrid, 
  Columns, 
  Maximize2, 
  Layers, 
  Filter, 
  Link as LinkIcon,
  X,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface GalleryManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
}

// Curated stock photo library categorized by sector
interface StockPhoto {
  id: string;
  sector: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
  aspectRatio: "auto" | "square" | "portrait" | "landscape";
}

const STOCK_LIBRARY: StockPhoto[] = [
  // Oto Kurtarma & Çekici
  {
    id: "stock-oto-1",
    sector: "Oto Kurtarma & Çekici",
    title: "Otoyol Acil Müdahale & Transfer",
    category: "Operasyonlar",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    caption: "Kuzey Marmara Otoyolu üzerinde 18 dakikada gerçekleşen güvenli platform yüklemesi.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-oto-2",
    sector: "Oto Kurtarma & Çekici",
    title: "Tam Donanımlı Hidrolik Çekici",
    category: "Filo & Araçlar",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80",
    caption: "Son teknoloji hidrolik kayar kasa sistemlerimiz ile sıfır hasar güvencesi.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-oto-3",
    sector: "Oto Kurtarma & Çekici",
    title: "Lüks & Spor Araç Taşımacılığı",
    category: "Özel Taşıma",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    caption: "Hassas süspansiyonlu araçlar için yumuşak bağlama kayışları ve tam kasko.",
    aspectRatio: "square"
  },
  {
    id: "stock-oto-4",
    sector: "Oto Kurtarma & Çekici",
    title: "Gece Nöbetçi Kurtarma Ekibi",
    category: "Operasyonlar",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    caption: "7 gün 24 saat hazır bekleyen nöbetçi ekiplerimiz ile kesintisiz destek.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-oto-5",
    sector: "Oto Kurtarma & Çekici",
    title: "Yerinde Akü & Elektrik Teşhisi",
    category: "Yol Yardım",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
    caption: "Mobil yol yardım araçlarımız ile yerinde akü değişimi ve alternatör testi.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-oto-6",
    sector: "Oto Kurtarma & Çekici",
    title: "Şehirlerarası Özel Nakil Sevk",
    category: "Özel Taşıma",
    imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1000&q=80",
    caption: "Türkiye genelinde 81 ile sigortalı adrese teslimat çözümleri.",
    aspectRatio: "square"
  },

  // Diş & Sağlık Kliniği
  {
    id: "stock-med-1",
    sector: "Diş & Sağlık Kliniği",
    title: "Steril Dijital Muayene Odası",
    category: "Klinik Ortamı",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    caption: "Avrupa standartlarında hijyen ve son model diş hekimliği üniteleri.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-med-2",
    sector: "Diş & Sağlık Kliniği",
    title: "Gülüş Tasarımı ve Zirkonyum Uygulaması",
    category: "Öncesi / Sonrası",
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80",
    caption: "Doğal görünüm sunan estetik kaplama ve lamina porselen tedavisi.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-med-3",
    sector: "Diş & Sağlık Kliniği",
    title: "3D Çene Tomografisi & İmplant Planlama",
    category: "Teknoloji",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    caption: "Düşük radyasyonlu dijital panoramik röntgen ile milimetrik cerrahi kılavuz.",
    aspectRatio: "square"
  },
  {
    id: "stock-med-4",
    sector: "Diş & Sağlık Kliniği",
    title: "Uzman Hekim Kadromuz & Konsültasyon",
    category: "Ekip",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80",
    caption: "Farklı uzmanlık dallarından hekimlerimiz ile multidisipliner yaklaşım.",
    aspectRatio: "portrait"
  },

  // Restoran, Gurme & Kafe
  {
    id: "stock-food-1",
    sector: "Restoran & Gurme",
    title: "Taş Fırında Odun Ateşi Pizzası",
    category: "Ana Yemekler",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    caption: "48 saat mayalanmış ekşi maya hamur ve taze İtalyan peynirleri.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-food-2",
    sector: "Restoran & Gurme",
    title: "Özel Dinlendirilmiş Dry-Aged Steak",
    category: "Gurme Etler",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
    caption: "Meşe kömürü ızgarasında pişen taze baharatlı dana antrikot.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-food-3",
    sector: "Restoran & Gurme",
    title: "Nitelikli Barista Kahvesi & Latte Art",
    category: "İçecek & Tatlı",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    caption: "Taze kavrulmuş single origin çekirdekler ve ipeksi süt kreması.",
    aspectRatio: "square"
  },
  {
    id: "stock-food-4",
    sector: "Restoran & Gurme",
    title: "Şık İç Mekan ve Bahçe Masaları",
    category: "Mekan",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    caption: "Akşam yemekleri ve kutlamalar için sıcak, zarif atmosfer.",
    aspectRatio: "landscape"
  },

  // Mimarlık & İnşaat
  {
    id: "stock-arch-1",
    sector: "Mimarlık & İnşaat",
    title: "Modern Müstakil Villa Projesi",
    category: "Tamamlanan Projeler",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    caption: "Doğal taş ve ahşap dokuların uyumuyla tasarlanan çağdaş yaşam alanı.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-arch-2",
    sector: "Mimarlık & İnşaat",
    title: "Minimalist Açık Plan Salon Tasarımı",
    category: "İç Mimari",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
    caption: "Yüksek tavanlı, ferah ışık alan oturma odası ve mutfak adası.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-arch-3",
    sector: "Mimarlık & İnşaat",
    title: "Saha İmalat ve Şantiye Süreci",
    category: "İnşaat Aşamaları",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
    caption: "Statik ve deprem yönetmeliğine uygun hassas betonarme imalatı.",
    aspectRatio: "square"
  },
  {
    id: "stock-arch-4",
    sector: "Mimarlık & İnşaat",
    title: "Lüks Banyoda İtalyan Seramik Detayı",
    category: "İç Mimari",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    caption: "Gizli aydınlatmalı aynalar ve antrasit batarya aksesuarları.",
    aspectRatio: "portrait"
  },

  // Kuaför & Güzellik
  {
    id: "stock-beauty-1",
    sector: "Kuaför & Güzellik",
    title: "Doğal Işıltılı Sombre & Saç Renklendirme",
    category: "Saç Tasarımı",
    imageUrl: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80",
    caption: "Saç yapısına zarar vermeyen organik açıcılar ve soğuk bej tonlar.",
    aspectRatio: "portrait"
  },
  {
    id: "stock-beauty-2",
    sector: "Kuaför & Güzellik",
    title: "Profesyonel Cilt Bakımı & Nem Terapisi",
    category: "Cilt & Spa",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
    caption: "Derin gözenek temizliği, hyaluronik asit maskesi ve canlandırıcı bakım.",
    aspectRatio: "landscape"
  },
  {
    id: "stock-beauty-3",
    sector: "Kuaför & Güzellik",
    title: "Gelin Saçı & Profesyonel Porselen Makyaj",
    category: "Özel Günler",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    caption: "En mutlu gününüzde gün boyu kalıcı, fotoğraflarda kusursuz makyaj.",
    aspectRatio: "square"
  }
];

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  config,
  onChange,
  onPreview
}) => {
  // Safe default initialization
  const gallery = config.gallery || {
    enabled: true,
    badge: "📸 Fotoğraf Galerisi",
    title: "Çalışmalarımız & Fotoğraf Vitrini",
    subtitle: "Gerçekleştirdiğimiz işlerden, saha operasyonlarımızdan ve referanslarımızdan kareler.",
    items: [],
    layout: "masonry",
    columns: 3,
    enableLightbox: true,
    categories: ["Tümü"]
  };

  const items = gallery.items || [];

  // Local tab
  const [activeTab, setActiveTab] = useState<"items" | "library" | "upload">("items");
  
  // Stock library filtering
  const [librarySector, setLibrarySector] = useState<string>("Tümü");
  const [librarySearch, setLibrarySearch] = useState<string>("");

  // Edit / Add modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Genel");
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // URL input state
  const [urlInput, setUrlInput] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlCategory, setUrlCategory] = useState("Genel");

  // Save changes helper
  const updateGallery = (partial: Partial<typeof gallery>) => {
    onChange({
      ...config,
      gallery: {
        ...gallery,
        ...partial
      }
    });
  };

  // Toggle enable
  const handleToggleEnable = () => {
    updateGallery({ enabled: !gallery.enabled });
  };

  // Change columns
  const handleSetColumns = (cols: 2 | 3 | 4) => {
    updateGallery({ columns: cols });
  };

  // Change layout
  const handleSetLayout = (layout: "masonry" | "grid") => {
    updateGallery({ layout });
  };

  // Add stock photo to gallery
  const handleAddStockPhoto = (photo: StockPhoto) => {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: photo.title,
      category: photo.category,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      aspectRatio: photo.aspectRatio
    };

    updateGallery({
      items: [...items, newItem]
    });
  };

  // Add all photos of a sector
  const handleAddAllSectorPhotos = (sector: string) => {
    const sectorPhotos = STOCK_LIBRARY.filter(p => sector === "Tümü" || p.sector === sector);
    const newItems: GalleryItem[] = sectorPhotos.map(p => ({
      id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: p.title,
      category: p.category,
      imageUrl: p.imageUrl,
      caption: p.caption,
      aspectRatio: p.aspectRatio
    }));

    updateGallery({
      items: [...items, ...newItems]
    });
    setActiveTab("items");
  };

  // Handle local file upload (multi-file)
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const added: GalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const base64 = await compressImageToBase64(file, 1600, 0.85);
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          added.push({
            id: `gal-${Date.now()}-${i}`,
            title: fileNameWithoutExt || `Görsel ${items.length + i + 1}`,
            category: uploadCategory.trim() || "Genel",
            imageUrl: base64,
            caption: "",
            aspectRatio: "auto"
          });
        }
      }

      if (added.length > 0) {
        updateGallery({
          items: [...items, ...added]
        });
        setUploadFeedback(`✅ ${added.length} adet fotoğraf başarıyla eklendi!`);
        setTimeout(() => setUploadFeedback(null), 4000);
        setActiveTab("items");
      }
    } catch (err: any) {
      setUploadFeedback(`❌ Hata: ${err.message || "Görseller işlenirken bir sorun oluştu."}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Add via direct URL
  const handleAddViaUrl = () => {
    if (!urlInput.trim()) return;
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: urlTitle.trim() || `Görsel ${items.length + 1}`,
      category: urlCategory.trim() || "Genel",
      imageUrl: urlInput.trim(),
      caption: "",
      aspectRatio: "auto"
    };

    updateGallery({
      items: [...items, newItem]
    });

    setUrlInput("");
    setUrlTitle("");
    setActiveTab("items");
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    updateGallery({
      items: items.filter(item => item.id !== id)
    });
  };

  // Move item
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    updateGallery({ items: newItems });
  };

  // Save item edits
  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateGallery({
      items: items.map(item => item.id === editingItem.id ? editingItem : item)
    });
    setEditModalOpen(false);
    setEditingItem(null);
  };

  // Sectors for stock library filter
  const sectors = ["Tümü", ...Array.from(new Set(STOCK_LIBRARY.map(p => p.sector)))];

  // Filtered stock photos
  const filteredStock = STOCK_LIBRARY.filter(photo => {
    const matchesSector = librarySector === "Tümü" || photo.sector === librarySector;
    const matchesSearch = !librarySearch.trim() || 
      photo.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      photo.category.toLowerCase().includes(librarySearch.toLowerCase()) ||
      photo.caption.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Activation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Görsel Vitrini & Masonry Grid
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Fotoğraf Galerisi (Image Gallery)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Müşterilerinize yaptığınız işleri, ekipmanlarınızı ve ürünlerinizi modern <strong>Pinterest tarzı Masonry (asimetrik dinamik akış)</strong> düzeninde sergileyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Section Enable Toggle */}
          <button
            type="button"
            onClick={handleToggleEnable}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              gallery.enabled
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${gallery.enabled ? "bg-white animate-pulse" : "bg-slate-500"}`} />
            <span>{gallery.enabled ? "Sitede Aktif" : "Sitede Gizli"}</span>
          </button>

          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Canlı Önizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Settings & Options Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Bölüm Başlıkları ve Masonry Düzeni</h3>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Toplam <span className="font-bold text-slate-900">{items.length}</span> Görsel
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bölüm Rozeti (Badge)</label>
            <input
              type="text"
              value={gallery.badge || ""}
              onChange={(e) => updateGallery({ badge: e.target.value })}
              placeholder="Örn: 📸 Fotoğraf Galerisi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bölüm Ana Başlığı (Title)</label>
            <input
              type="text"
              value={gallery.title || ""}
              onChange={(e) => updateGallery({ title: e.target.value })}
              placeholder="Örn: Çalışmalarımız ve Referanslarımız"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alt Açıklama (Subtitle)</label>
            <input
              type="text"
              value={gallery.subtitle || ""}
              onChange={(e) => updateGallery({ subtitle: e.target.value })}
              placeholder="Örn: Gerçekleştirdiğimiz projelerden kareler."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Layout & Grid Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {/* Layout Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Izgara / Düzen Tipi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSetLayout("masonry")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  gallery.layout !== "grid"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Masonry (Dinamik)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetLayout("grid")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  gallery.layout === "grid"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Standart Grid</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {gallery.layout !== "grid" 
                ? "✨ Pinterest tarzı: Farklı boyuttaki görseller doğal yüksekliğinde dizilir."
                : "Düzgün kare kartlar halinde hizalanır."}
            </p>
          </div>

          {/* Columns */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Masaüstü Sütun Sayısı</label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => handleSetColumns(cols)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                    (gallery.columns || 3) === cols
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cols} Sütun
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Mobil ve tablette otomatik olarak 1-2 sütuna adapte olur.</p>
          </div>

          {/* Lightbox toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tam Ekran Büyüteç (Lightbox)</label>
            <button
              type="button"
              onClick={() => updateGallery({ enableLightbox: gallery.enableLightbox !== false ? false : true })}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                gallery.enableLightbox !== false
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{gallery.enableLightbox !== false ? "Lightbox Aktif" : "Lightbox Kapalı"}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${gallery.enableLightbox !== false ? "bg-emerald-500" : "bg-slate-400"}`} />
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Görsellere tıklandığında tam ekran karanlık modda açılır.</p>
          </div>
        </div>
      </div>

      {/* Action Sub-Tabs: Items List vs Curated Stock Library vs Local Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "items"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mevcut Galerim ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "library"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hazır Sektörel Fotoğraf Havuzu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Yeni Fotoğraf Yükle & URL</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              type="button"
              onClick={() => handleAddAllSectorPhotos("Oto Kurtarma & Çekici")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Örnek Galeri Yükle</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CURRENT GALLERY ITEMS (With Masonry Live Preview & Management) */}
      {activeTab === "items" && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900">Henüz Galeride Fotoğraf Yok</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Bilgisayarınızdan kendi fotoğraflarınızı yükleyebilir veya hazır profesyonel fotoğraf havuzumuzdan dilediğinizi seçebilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("library")}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hazır Fotoğraf Havuzundan Seç</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Bilgisayardan Yükle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Image Preview with Aspect Ratio Tag */}
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10">
                        {item.category || "Genel"}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-300">
                        #{idx + 1}
                      </div>

                      {/* Floating Quick Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <span className="text-[11px] text-white font-medium truncate max-w-[180px]">
                          {item.caption || item.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-slate-900 backdrop-blur-md transition-all"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-md transition-all"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content Details & Reordering */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        {item.caption ? (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.caption}</p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Açıklama belirtilmemiş</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          Oran: {item.aspectRatio || "auto"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, "up")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Yukarı / Öne Taşı"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMoveItem(idx, "down")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Aşağı / Arkaya Taşı"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors ml-1"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Kaldır"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CURATED STOCK PHOTO LIBRARY (Hazır Sektörel Kütüphane) */}
      {activeTab === "library" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Hazır Sektörel Fotoğraf Havuzu</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sektörünüze özel yüksek çözünürlüklü, telif problemi olmayan Unsplash fotoğraflarından dilediğinizi tek tıkla ekleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Fotoğraflarda ara..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              {librarySector !== "Tümü" && (
                <button
                  type="button"
                  onClick={() => handleAddAllSectorPhotos(librarySector)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bu Sektörün Tümünü Ekle</span>
                </button>
              )}
            </div>
          </div>

          {/* Sector Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sectors.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setLibrarySector(sec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  librarySector === sec
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Stock Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStock.map((photo) => {
              const alreadyAdded = items.some(item => item.imageUrl === photo.imageUrl);
              return (
                <div
                  key={photo.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                >
                  <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300">
                      {photo.category}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300">
                      {photo.sector}
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{photo.title}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{photo.caption}</p>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddStockPhoto(photo)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        alreadyAdded
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-slate-900 hover:bg-indigo-600 text-white shadow-xs"
                      }`}
                    >
                      {alreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Galeride Ekli</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Galeriye Ekle</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD IMAGES OR DIRECT URL */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Method A: Local File Upload with Auto-compression */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Upload className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Bilgisayardan Fotoğraf Yükle</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bilgisayarınızdan veya telefonunuzdan birden fazla fotoğraf seçebilirsiniz. Görseller tarayıcıda otomatik optimize edilerek doğrudan site konfigürasyonunuza kaydedilir.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Varsayılan Kategori / Etiket</label>
              <input
                type="text"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                placeholder="Örn: Saha Operasyonu, Atölye, Referanslar"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {isUploading ? "Görseller Sıkıştırılıyor..." : "Fotoğrafları Seçin veya Buraya Sürükleyin"}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, WebP formatları desteklenir. Birden fazla seçebilirsiniz.
                </div>
              </div>
            </div>

            {uploadFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                uploadFeedback.startsWith("✅") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {uploadFeedback}
              </div>
            )}
          </div>

          {/* Method B: Add via Image URL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <LinkIcon className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Görsel URL Bağlantısı İle Ekle</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              İnternetteki veya bulut depolamanızdaki herhangi bir görsel adresini (URL) doğrudan galerinize ekleyebilirsiniz.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Görsel Web Adresi (URL) *</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... veya https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fotoğraf Başlığı</label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Örn: Yeni Model Çekici Aracı"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori / Etiket</label>
                <input
                  type="text"
                  value={urlCategory}
                  onChange={(e) => setUrlCategory(e.target.value)}
                  placeholder="Örn: Araçlar, Ekip, Referans"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {urlInput && (
                <div className="aspect-16/9 rounded-xl bg-slate-900 overflow-hidden relative">
                  <img
                    src={urlInput}
                    alt="Önizleme"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                disabled={!urlInput.trim()}
                onClick={handleAddViaUrl}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>URL İle Galeriye Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITEM EDIT MODAL */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900">Fotoğraf Detaylarını Düzenle</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              <div className="aspect-16/9 rounded-xl bg-slate-950 overflow-hidden relative">
                <img
                  src={editingItem.imageUrl}
                  alt={editingItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fotoğraf Başlığı *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori / Etiket</label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="Örn: Saha Operasyonları"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Masonry Oranı</label>
                  <select
                    value={editingItem.aspectRatio || "auto"}
                    onChange={(e) => setEditingItem({ ...editingItem, aspectRatio: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="auto">Otomatik / Doğal</option>
                    <option value="landscape">Yatay (Landscape)</option>
                    <option value="portrait">Dikey (Portrait - Uzun)</option>
                    <option value="square">Kare (1:1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kısa Açıklama / Hikaye</label>
                <textarea
                  rows={2}
                  value={editingItem.caption || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  placeholder="İsteğe bağlı: Fotoğraftaki işlem, konum veya müşteri detayları..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
