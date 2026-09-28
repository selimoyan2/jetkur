/**
 * JetKur Canonical Business Profile Editor Component (Sprint 12)
 *
 * Core Product Principle:
 * "İşletme bilgilerini doğrudan yönetin; teknik CSS veya layout ayarlarına dokunmayın."
 *
 * Canonical mapping:
 * Updates BusinessProfile directly:
 * - companyName, tagline, shortDescription
 * - phone, whatsapp, email
 * - address, city, district
 * - serviceAreas (array of strings)
 * - workingHours (weekdays, saturday, sunday, is24_7)
 */

import React, { useState } from "react";
import { SiteConfig } from "../../types";
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

interface BusinessProfileEditorProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onSaved?: () => void;
  readOnly?: boolean;
}

export const BusinessProfileEditor: React.FC<BusinessProfileEditorProps> = ({
  config,
  onChange,
  onSaved,
  readOnly = false,
}) => {
  const [savedToast, setSavedToast] = useState(false);

  // Local editable form state initialized from config / businessProfile
  const [formData, setFormData] = useState({
    companyName: config.companyName || "",
    tagline: config.tagline || "",
    description: config.about?.story || config.about?.intro || "",
    phone: config.phone || "",
    whatsapp: config.whatsapp || "",
    email: config.email || "",
    address: config.address || "",
    city: config.city || "İstanbul",
    district: config.district || "",
    serviceAreas: Array.isArray(config.serviceAreas) ? config.serviceAreas : [],
    newAreaInput: "",
    workingHoursWeekdays: config.workingHours?.weekdays || "08:30 - 19:00",
    workingHoursSaturday: config.workingHours?.saturday || "09:00 - 17:00",
    workingHoursSunday: config.workingHours?.sunday || "Kapalı",
    is24_7: config.is24_7 || false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    const updated: SiteConfig = {
      ...config,
      companyName: formData.companyName,
      tagline: formData.tagline,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      district: formData.district,
      serviceAreas: formData.serviceAreas,
      is24_7: formData.is24_7,
      about: {
        ...config.about,
        story: formData.description,
        intro: formData.description.slice(0, 150),
      },
      workingHours: {
        weekdays: formData.workingHoursWeekdays,
        saturday: formData.workingHoursSaturday,
        sunday: formData.workingHoursSunday,
      },
      // Keep hero title in sync if company name changed
      hero: {
        ...config.hero,
        title: config.hero?.title?.includes(config.companyName)
          ? config.hero.title.replace(config.companyName, formData.companyName)
          : config.hero?.title || formData.companyName,
      },
    };

    onChange(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    if (onSaved) onSaved();
  };

  const handleAddArea = () => {
    if (!formData.newAreaInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, prev.newAreaInput.trim()],
      newAreaInput: "",
    }));
  };

  const handleRemoveArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Toast Notification */}
      {savedToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>İşletme bilgileriniz başarıyla kaydedildi! Canlı sitede anında güncellendi.</span>
          </div>
        </div>
      )}

      {/* 1. Kimlik & Tanıtım */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">İşletme Kimliği</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              İşletme Adı *
            </label>
            <input
              type="text"
              required
              disabled={readOnly}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
              placeholder="Örn: Usta Tesisat Ltd."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Slogan / Kısa Açıklama
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
              placeholder="Örn: 30 Dakikada Kapınızda Profesyonel Hizmet"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hakkımızda / İşletme Hikayesi
            </label>
            <textarea
              rows={3}
              disabled={readOnly}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
              placeholder="İşletmenizin geçmişi, uzmanlık alanları ve müşterilerinize sunduğunuz güven."
            />
          </div>
        </div>
      </div>

      {/* 2. İletişim Kanalları */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Phone className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">İletişim & WhatsApp</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Telefon Numarası *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                disabled={readOnly}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
                placeholder="0532 000 00 00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              WhatsApp Hattı
            </label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                disabled={readOnly}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
                placeholder="905320000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                disabled={readOnly}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
                placeholder="info@isletmeniz.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Konum & Hizmet Bölgeleri */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">Adres & Hizmet Verilen Bölgeler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Açık Adres
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
              placeholder="Örn: Barbaros Bulvarı No: 42, Beşiktaş"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Şehir / İlçe
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={readOnly}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
                placeholder="İstanbul"
              />
              <input
                type="text"
                disabled={readOnly}
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100"
                placeholder="Kadıköy"
              />
            </div>
          </div>

          {/* Hizmet Bölgeleri Etiketleri */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hizmet Verilen Semtler & İlçeler (Mobil/Yerinde Servis İçin)
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.serviceAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                >
                  <span>{area}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(idx)}
                      className="hover:text-rose-600 text-slate-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {formData.serviceAreas.length === 0 && (
                <span className="text-xs text-slate-400 italic">Henüz özel bölge eklenmedi (tüm il geneline hizmet verilir).</span>
              )}
            </div>

            {!readOnly && (
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={formData.newAreaInput}
                  onChange={(e) => setFormData({ ...formData, newAreaInput: e.target.value })}
                  placeholder="Örn: Kadıköy, Üsküdar, Ataşehir"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddArea();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Çalışma Saatleri */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Çalışma Saatleri</h3>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={formData.is24_7}
              onChange={(e) => setFormData({ ...formData, is24_7: e.target.checked })}
              className="rounded text-amber-500 focus:ring-amber-500"
            />
            <span>7/24 Kesintisiz Hizmet</span>
          </label>
        </div>

        {!formData.is24_7 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hafta İçi
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={formData.workingHoursWeekdays}
                onChange={(e) =>
                  setFormData({ ...formData, workingHoursWeekdays: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                placeholder="08:30 - 19:00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cumartesi
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={formData.workingHoursSaturday}
                onChange={(e) =>
                  setFormData({ ...formData, workingHoursSaturday: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                placeholder="09:00 - 17:00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pazar
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={formData.workingHoursSunday}
                onChange={(e) =>
                  setFormData({ ...formData, workingHoursSunday: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                placeholder="Kapalı veya Randevu ile"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
            <span>⚡ İşletmeniz web sitesinde "7/24 Kesintisiz Acil Hizmet" rozeti ile öne çıkarılmaktadır.</span>
          </div>
        )}
      </div>

      {/* Save Button Bar */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>İşletme Bilgilerini Kaydet</span>
          </button>
        </div>
      )}
    </form>
  );
};
