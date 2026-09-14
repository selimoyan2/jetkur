import React, { useState } from "react";
import { SiteConfig, TestimonialItem } from "../../types";
import { Base64ImageUpload } from "./Base64ImageUpload";
import { 
  Star, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  MoveUp, 
  MoveDown, 
  Eye, 
  Search, 
  X, 
  Save, 
  MessageSquareQuote,
  ShieldCheck,
  Award,
  RefreshCw,
  Sliders,
  Check
} from "lucide-react";

interface TestimonialsManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({
  config,
  onChange,
  onPreview
}) => {
  // Ensure testimonials object is safely initialized
  const testimonials = config.testimonials || {
    enabled: true,
    badge: "Müşteri Deneyimleri",
    title: "Müşterilerimiz Ne Diyor?",
    subtitle: "Hizmetlerimizden yararlanan müşterilerimizin gerçek deneyimleri ve puanlamaları.",
    items: [],
    showRatingStats: true,
    googleRatingBadge: true
  };

  const items = testimonials.items || [];

  // Local states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TestimonialItem>>({
    name: "",
    role: "",
    comment: "",
    rating: 5,
    avatar: "",
    date: "Bugün",
    verified: true
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Update whole testimonials config
  const updateTestimonialsConfig = (updates: Partial<typeof testimonials>) => {
    onChange({
      ...config,
      testimonials: {
        ...testimonials,
        ...updates
      }
    });
  };

  // Toggle main section visibility
  const handleToggleEnabled = () => {
    const nextState = !testimonials.enabled;
    updateTestimonialsConfig({ enabled: nextState });
    showNotification(nextState ? "Müşteri yorumları bölümü aktifleştirildi." : "Müşteri yorumları bölümü pasif yapıldı.");
  };

  // Open modal for new review
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      role: "Bireysel Müşteri",
      comment: "",
      rating: 5,
      avatar: "",
      date: "Bugün",
      verified: true
    });
    setModalOpen(true);
  };

  // Open modal for editing existing review
  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      role: item.role,
      comment: item.comment,
      rating: item.rating || 5,
      avatar: item.avatar || "",
      date: item.date || "Bugün",
      verified: item.verified !== false
    });
    setModalOpen(true);
  };

  // Save review (create or update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.comment?.trim()) {
      alert("Lütfen müşteri adını ve yorum metnini eksiksiz doldurun.");
      return;
    }

    let updatedItems: TestimonialItem[];

    if (editingId) {
      updatedItems = items.map((it) =>
        it.id === editingId
          ? {
              ...it,
              name: formData.name!.trim(),
              role: formData.role?.trim() || "Müşteri",
              comment: formData.comment!.trim(),
              rating: Number(formData.rating) || 5,
              avatar: formData.avatar?.trim() || "",
              date: formData.date?.trim() || "Bugün",
              verified: formData.verified !== false
            }
          : it
      );
      showNotification("Yorum başarıyla güncellendi.");
    } else {
      const newItem: TestimonialItem = {
        id: `testim-${Date.now()}`,
        name: formData.name!.trim(),
        role: formData.role?.trim() || "Müşteri",
        comment: formData.comment!.trim(),
        rating: Number(formData.rating) || 5,
        avatar: formData.avatar?.trim() || "",
        date: formData.date?.trim() || "Bugün",
        verified: formData.verified !== false
      };
      updatedItems = [newItem, ...items];
      showNotification("Yeni müşteri yorumu eklendi.");
    }

    updateTestimonialsConfig({ items: updatedItems });
    setModalOpen(false);
  };

  // Delete review
  const handleDeleteItem = (id: string) => {
    if (window.confirm("Bu müşteri yorumunu silmek istediğinizden emin misiniz?")) {
      const updated = items.filter((it) => it.id !== id);
      updateTestimonialsConfig({ items: updated });
      showNotification("Yorum silindi.");
    }
  };

  // Move item up or down
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    updateTestimonialsConfig({ items: copy });
  };

  // Seed sample reviews tailored to sector
  const handleAddSampleReviews = () => {
    const sectorName = config.sector || "Hizmet";
    const cityName = config.city || "İstanbul";

    const sampleReviews: TestimonialItem[] = [
      {
        id: `sample-1-${Date.now()}`,
        name: "Mehmet Yılmaz",
        role: `Firma Yöneticisi, ${cityName}`,
        comment: `${config.companyName} ekibiyle çalışmaktan son derece memnun kaldık. Süreç başından sonuna kadar şeffaf, dakik ve profesyonel ilerledi. Tavsiye ederim.`,
        rating: 5,
        date: "3 gün önce",
        verified: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
      },
      {
        id: `sample-2-${Date.now()}`,
        name: "Ayşe Kaya",
        role: `Mimar, ${cityName}`,
        comment: `İletişimleri çok hızlı ve çözüm odaklı. Telefonda anlaştığımız şartların tamamına eksiksiz uyuldu, hiçbir sürpriz yaşamadık. Teşekkürler!`,
        rating: 5,
        date: "1 hafta önce",
        verified: true,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
      },
      {
        id: `sample-3-${Date.now()}`,
        name: "Can Polat",
        role: "Bireysel Müşteri",
        comment: `Güler yüzlü ve işinin ehli bir kadro. Hizmet kalitesi piyasa ortalamasının çok üzerinde. Güvenle tercih edebilirsiniz.`,
        rating: 5,
        date: "2 hafta önce",
        verified: true,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
      }
    ];

    updateTestimonialsConfig({
      enabled: true,
      items: [...items, ...sampleReviews]
    });
    showNotification("Sektöre özel 3 adet örnek müşteri yorumu eklendi!");
  };

  // Filtered items
  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      filterRating === "all" ? true : Math.round(Number(it.rating) || 5) === filterRating;

    return matchesSearch && matchesRating;
  });

  // Calculate statistics
  const totalCount = items.length;
  const avgRating = totalCount > 0
    ? (items.reduce((acc, it) => acc + (Number(it.rating) || 5), 0) / totalCount).toFixed(1)
    : "5.0";
  const fiveStarsCount = items.filter((it) => Math.round(Number(it.rating) || 5) === 5).length;
  const fourStarsCount = items.filter((it) => Math.round(Number(it.rating) || 5) === 4).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner / Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Sosyal Kanıt & İtibar Yönetimi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Müşteri Yorumları & Yıldız Puanları
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Ziyaretçilerinizin güvenini artırmak için gerçek müşteri incelemelerini, 5 yıldızlı değerlendirmeleri ve doğrulanmış deneyimleri web sitenizde sergileyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Toggle Status Button */}
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                testimonials.enabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${testimonials.enabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              <span>{testimonials.enabled ? "Bölüm Sitede Aktif" : "Bölüm Pasif"}</span>
            </button>

            {/* Preview Site Button */}
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Sitede İncele</span>
              </button>
            )}

            {/* Add Review Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Yorum Ekle</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ortalama Puan</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{avgRating}</span>
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Yorum</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-white">{totalCount}</span>
              <span className="text-xs text-slate-500">Değerlendirme</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">5 Yıldızlı Oranı</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">
                {totalCount > 0 ? `%${Math.round((fiveStarsCount / totalCount) * 100)}` : "%100"}
              </span>
              <span className="text-xs text-slate-500">({fiveStarsCount} adet)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Doğrulama Durumu</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Güvenli & Onaylı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Settings: Badge, Title & Subtitle Customizer */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Bölüm Başlığı & Canlı Site Görünüm Ayarları
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Ana sayfadaki metin blokları</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Üst Rozet (Badge)
            </label>
            <input
              type="text"
              value={testimonials.badge || ""}
              onChange={(e) => updateTestimonialsConfig({ badge: e.target.value })}
              placeholder="Örn: Müşteri Deneyimleri"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Bölüm Ana Başlığı
            </label>
            <input
              type="text"
              value={testimonials.title || ""}
              onChange={(e) => updateTestimonialsConfig({ title: e.target.value })}
              placeholder="Örn: Müşterilerimiz Ne Diyor?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Açıklama / Alt Başlık
            </label>
            <input
              type="text"
              value={testimonials.subtitle || ""}
              onChange={(e) => updateTestimonialsConfig({ subtitle: e.target.value })}
              placeholder="Örn: Gerçek müşteri deneyimleri ve puanlamalar."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={testimonials.showRatingStats !== false}
              onChange={(e) => updateTestimonialsConfig({ showRatingStats: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
            />
            <span className="font-semibold text-slate-700">Ortalama Puan Rozetini Göster (Örn: 4.9 / 5.0)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={testimonials.googleRatingBadge !== false}
              onChange={(e) => updateTestimonialsConfig({ googleRatingBadge: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
            />
            <span className="font-semibold text-slate-700">Google Yorum & %100 Memnuniyet Rozetini Göster</span>
          </label>
        </div>
      </div>

      {/* Action Bar: Search, Filter & Quick Sample Generator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Yorumlarda veya isimlerde ara..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-bold focus:outline-none"
          >
            <option value="all">Tüm Puanlar ({items.length})</option>
            <option value="5">5 Yıldızlı ({items.filter(it => Math.round(Number(it.rating) || 5) === 5).length})</option>
            <option value="4">4 Yıldızlı ({items.filter(it => Math.round(Number(it.rating) || 5) === 4).length})</option>
            <option value="3">3 Yıldız ve Altı</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddSampleReviews}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            title="Sektörünüze özel hazır profesyonel müşteri yorumları ekleyin"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Örnek Yorumlar Yükle</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Yorum Ekle</span>
          </button>
        </div>
      </div>

      {/* Review Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Henüz müşteri yorumu bulunamadı</h4>
            <p className="text-xs text-slate-500">
              {searchQuery || filterRating !== "all"
                ? "Arama kriterlerinize uygun yorum bulunamadı. Filtreleri temizlemeyi deneyin."
                : "Müşterilerinizin memnuniyetini web sitenizde paylaşmak için ilk yorumu ekleyin veya örnek yorum şablonunu kullanın."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddSampleReviews}
              className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Örnek Yorumları Otomatik Ekle</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Yorum Yaz</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => {
            const ratingNum = Math.max(1, Math.min(5, Math.round(Number(item.rating) || 5)));
            const initials = (item.name || "M")
              .split(" ")
              .filter(Boolean)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group relative"
              >
                <div className="space-y-3">
                  {/* Top Bar: Stars & Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5" title={`${ratingNum} Yıldız`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < ratingNum
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5 font-mono">
                        {ratingNum}.0
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Yukarı Taşı"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredItems.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Aşağı Taşı"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-700 transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div className="text-slate-700 text-xs sm:text-sm leading-relaxed italic bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <span className="text-amber-500 font-serif font-black mr-1 text-base">“</span>
                    {item.comment}
                    <span className="text-amber-500 font-serif font-black ml-1 text-base">”</span>
                  </div>
                </div>

                {/* Bottom User Info */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-800">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.role || "Müşteri"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-0.5">
                    {item.verified !== false && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Doğrulanmış</span>
                      </span>
                    )}
                    {item.date && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {item.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add or Edit Review */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingId ? "Müşteri Yorumunu Düzenle" : "Yeni Müşteri Yorumu & Puanı Ekle"}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Web sitenizin ana sayfasında yayınlanacaktır.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Star Rating Interactive Selector */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900">
                    Yıldız Puanı (1 - 5 Yıldız)
                  </label>
                  <span className="text-xs font-black text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-lg">
                    {formData.rating} / 5 Yıldız
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating !== null ? hoverRating : (formData.rating || 5);
                    const isSelected = starVal <= activeVal;

                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setFormData({ ...formData, rating: starVal })}
                        className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isSelected
                              ? "fill-amber-400 text-amber-500"
                              : "fill-slate-200 text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {formData.rating === 5 && "⭐ Mükemmel (%100 Memnuniyet)"}
                    {formData.rating === 4 && "⭐ Çok İyi"}
                    {formData.rating === 3 && "⭐ İyi / Orta"}
                    {formData.rating === 2 && "⭐ Geliştirilmeli"}
                    {formData.rating === 1 && "⭐ Olumsuz"}
                  </span>
                </div>
              </div>

              {/* Reviewer Name and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Müşteri Adı Soyadı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Mehmet Yılmaz"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Unvan / Şehir / Konum
                  </label>
                  <input
                    type="text"
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Örn: İşletme Sahibi, Kadıköy"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Review Comment Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Müşteri Yorumu / İnceleme Metni <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formData.comment?.length || 0} karakter
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.comment || ""}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Müşterinizin hizmetiniz veya ürününüz hakkındaki samimi değerlendirmesini buraya yazın..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed resize-none"
                />
              </div>

              {/* Avatar Image Upload (supports Base64 or URL) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Müşteri Fotoğrafı / Profil Görseli
                </label>
                <div className="flex items-center gap-3">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                      Foto Yok
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <Base64ImageUpload
                      compact
                      aspectRatio="1/1"
                      placeholder="Görsel Yükle (Kare / 1:1)"
                      value={formData.avatar}
                      onChange={(img) => setFormData({ ...formData, avatar: img })}
                    />
                    <input
                      type="text"
                      value={formData.avatar || ""}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Veya doğrudan görsel URL'si yapıştırın..."
                      className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Fotoğraf eklemezseniz ad ve soyadın baş harfleri otomatik oluşturulur.
                </span>
              </div>

              {/* Date & Verified Badge Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tarih İbaresi
                  </label>
                  <input
                    type="text"
                    value={formData.date || ""}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Örn: 2 gün önce, 1 hafta önce"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.verified !== false}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      ✓ Doğrulanmış Müşteri Rozeti
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? "Değişiklikleri Kaydet" : "Yorumu Yayınla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
