import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Flame, 
  ArrowUpRight, 
  BarChart3, 
  Filter, 
  Layers, 
  Search, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  SlidersHorizontal, 
  Maximize2, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  FileText,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { SiteConfig } from "../../types";
import { SeoRemediationPanel } from "./SeoRemediationPanel";

export type RankingTierId = "quick-wins" | "rising" | "high-volume" | "untapped";

export interface RankingTierInfo {
  id: RankingTierId;
  label: string;
  subLabel: string;
  serpRange: string;
  description: string;
}

export interface KeywordItem {
  term: string;
  currentRank: number;
  projectedRank: number;
  volume: number;
  currentTraffic: number;
  projectedTraffic: number;
  difficulty: "Kolay" | "Orta" | "Zor";
  intent: "Yerel" | "Ticari" | "İşlemsel" | "Bilgi";
}

export interface SeoHeatmapCellData {
  clusterId: string;
  clusterName: string;
  clusterIconName: string;
  tierId: RankingTierId;
  keywordCount: number;
  avgCurrentRank: number;
  avgProjectedRank: number;
  totalSearchVolume: number;
  currentMonthlyTraffic: number;
  projectedTrafficGrowth: number;
  conversionRate: number; // e.g. 0.07 (7%)
  avgOrderValue: number; // e.g. 1500 TL
  projectedRevenueTl: number;
  roiScore: number; // 0 - 100
  effortLevel: "Düşük" | "Orta" | "Yüksek";
  topKeywords: KeywordItem[];
  recommendedAction: string;
  actionDetails: string;
}

export interface ContentClusterInfo {
  id: string;
  name: string;
  category: "Yerel" | "Ticari" | "Hizmet" | "B2B" | "İçerik";
  priority: "Kritik" | "Yüksek" | "Orta";
  description: string;
}

export const RANKING_TIERS: RankingTierInfo[] = [
  {
    id: "quick-wins",
    label: "Hızlı Zaferler",
    subLabel: "Sıralama #4 - #10",
    serpRange: "#4 - #10",
    description: "İlk sayfada yer alan ve küçük bir optimizasyonla İlk 3'e taşınabilecek yüksek dönüşümlü kelimeler."
  },
  {
    id: "rising",
    label: "Yükseliş Adayları",
    subLabel: "Sıralama #11 - #20",
    serpRange: "#11 - #20",
    description: "Google 2. sayfasında olan, Schema ve iç linkleme ile 1. sayfaya sıçrayacak sayfalar."
  },
  {
    id: "high-volume",
    label: "Yüksek Hacimli Fırsatlar",
    subLabel: "Sıralama #21 - #50",
    serpRange: "#21 - #50",
    description: "Aylık on binlerce aramaya sahip, silo mimarisi ve zengin içerikle kırılma yaşayacak terimler."
  },
  {
    id: "untapped",
    label: "Keşfedilmemiş Nişler",
    subLabel: "Düşük Rekabet / Yeni",
    serpRange: "Yeni Alanlar",
    description: "Rakiplerin henüz fark etmediği, çok düşük zorluklu ve anında ilk sayfaya çıkılabilecek nişler."
  }
];

export const CONTENT_CLUSTERS: ContentClusterInfo[] = [
  {
    id: "local-landing",
    name: "Bölgesel İlçe Sayfaları (Local SEO)",
    category: "Yerel",
    priority: "Kritik",
    description: "Kadıköy, Ümraniye, Ataşehir gibi ilçelere özel acil yol yardım ve çekici açılış sayfaları."
  },
  {
    id: "pricing-hub",
    name: "Fiyat & Maliyet Hesaplayıcıları",
    category: "Ticari",
    priority: "Kritik",
    description: "Çekici km ücreti, şehirlerarası transfer tarifesi ve canlı fiyat hesaplama motoru."
  },
  {
    id: "core-services",
    name: "Ana Hizmet Sayfaları & Çekici Türleri",
    category: "Hizmet",
    priority: "Yüksek",
    description: "7/24 oto kurtarıcı, motosiklet taşıma, akü takviye ve ahtapot vinç hizmetleri."
  },
  {
    id: "b2b-fleet",
    name: "Kurumsal & Filo Taşıma Sözleşmeleri",
    category: "B2B",
    priority: "Yüksek",
    description: "Oto galeri transferleri, filo yol yardım anlaşmaları ve çoklu araç taşıma."
  },
  {
    id: "emergency-guides",
    name: "Acil Durum & Sürücü Rehberleri",
    category: "İçerik",
    priority: "Orta",
    description: "Yolda kalınca yapılması gerekenler, sigorta çekici hakları ve kaza anı kılavuzları."
  }
];

// Predictive Raw Data Matrix across 5 Clusters x 4 Tiers = 20 Heatmap Cells
export const INITIAL_HEATMAP_DATA: SeoHeatmapCellData[] = [
  // 1. Bölgesel İlçe Sayfaları (Local SEO)
  {
    clusterId: "local-landing",
    clusterName: "Bölgesel İlçe Sayfaları (Local SEO)",
    clusterIconName: "MapPin",
    tierId: "quick-wins",
    keywordCount: 18,
    avgCurrentRank: 5.8,
    avgProjectedRank: 2.1,
    totalSearchVolume: 12400,
    currentMonthlyTraffic: 1120,
    projectedTrafficGrowth: 4650,
    conversionRate: 0.088,
    avgOrderValue: 1650,
    projectedRevenueTl: 67500,
    roiScore: 97,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "kadıköy oto çekici", currentRank: 6, projectedRank: 2, volume: 3600, currentTraffic: 320, projectedTraffic: 1450, difficulty: "Kolay", intent: "Yerel" },
      { term: "ataşehir acil yol yardım", currentRank: 5, projectedRank: 2, volume: 2900, currentTraffic: 290, projectedTraffic: 1180, difficulty: "Kolay", intent: "Yerel" },
      { term: "ümraniye oto kurtarma", currentRank: 7, projectedRank: 3, volume: 2400, currentTraffic: 210, projectedTraffic: 920, difficulty: "Kolay", intent: "Yerel" },
      { term: "beşiktaş çekici 7 24", currentRank: 6, projectedRank: 2, volume: 2100, currentTraffic: 190, projectedTraffic: 840, difficulty: "Kolay", intent: "Yerel" }
    ],
    recommendedAction: "LocalBusiness Schema & İlçe Sayfa İçi Harita Gömme",
    actionDetails: "Her ilçe sayfasına Google Haritalar entegrasyonu ve bölgeye özel açık adres/telefon ekleyerek yerel SERP'te ilk 2 sırayı garantiye alın."
  },
  {
    clusterId: "local-landing",
    clusterName: "Bölgesel İlçe Sayfaları (Local SEO)",
    clusterIconName: "MapPin",
    tierId: "rising",
    keywordCount: 14,
    avgCurrentRank: 14.2,
    avgProjectedRank: 4.8,
    totalSearchVolume: 8900,
    currentMonthlyTraffic: 340,
    projectedTrafficGrowth: 2850,
    conversionRate: 0.075,
    avgOrderValue: 1600,
    projectedRevenueTl: 34200,
    roiScore: 91,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "kartal oto kurtarıcı", currentRank: 13, projectedRank: 4, volume: 1800, currentTraffic: 90, projectedTraffic: 620, difficulty: "Kolay", intent: "Yerel" },
      { term: "pendik en yakın çekici", currentRank: 15, projectedRank: 5, volume: 2400, currentTraffic: 110, projectedTraffic: 790, difficulty: "Kolay", intent: "Yerel" },
      { term: "maltepe oto çekici telefon", currentRank: 12, projectedRank: 4, volume: 1600, currentTraffic: 85, projectedTraffic: 580, difficulty: "Kolay", intent: "Yerel" }
    ],
    recommendedAction: "H1/H2 Başlıklarına Mahalle İsimleri Ekleme",
    actionDetails: "Sayfa başlıklarına 'en yakın' ve mahalle adlarını entegre ederek 2. sayfadan 1. sayfanın ilk yarısına tırmanın."
  },
  {
    clusterId: "local-landing",
    clusterName: "Bölgesel İlçe Sayfaları (Local SEO)",
    clusterIconName: "MapPin",
    tierId: "high-volume",
    keywordCount: 10,
    avgCurrentRank: 31.5,
    avgProjectedRank: 8.2,
    totalSearchVolume: 18600,
    currentMonthlyTraffic: 180,
    projectedTrafficGrowth: 3100,
    conversionRate: 0.062,
    avgOrderValue: 1600,
    projectedRevenueTl: 30800,
    roiScore: 82,
    effortLevel: "Orta",
    topKeywords: [
      { term: "istanbul anadolu yakası oto çekici", currentRank: 28, projectedRank: 7, volume: 6400, currentTraffic: 75, projectedTraffic: 1150, difficulty: "Orta", intent: "Yerel" },
      { term: "avrupa yakası acil kurtarıcı", currentRank: 34, projectedRank: 9, volume: 5200, currentTraffic: 45, projectedTraffic: 890, difficulty: "Orta", intent: "Yerel" }
    ],
    recommendedAction: "İlçe Sayfaları Arası Breadcrumb & Silo Bağlantısı",
    actionDetails: "Bölge sayfalarını hiyerarşik breadcrumb ve alt bağlantılarla ana hizmete bağlayarak sayfa otoritesini (PageRank) dağıtın."
  },
  {
    clusterId: "local-landing",
    clusterName: "Bölgesel İlçe Sayfaları (Local SEO)",
    clusterIconName: "MapPin",
    tierId: "untapped",
    keywordCount: 22,
    avgCurrentRank: 64.0,
    avgProjectedRank: 3.5,
    totalSearchVolume: 7100,
    currentMonthlyTraffic: 25,
    projectedTrafficGrowth: 2600,
    conversionRate: 0.092,
    avgOrderValue: 1700,
    projectedRevenueTl: 40600,
    roiScore: 94,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "kurtköy viaport oto çekici", currentRank: 55, projectedRank: 2, volume: 1400, currentTraffic: 10, projectedTraffic: 580, difficulty: "Kolay", intent: "Yerel" },
      { term: "samandıra gişeler yol yardım", currentRank: 68, projectedRank: 3, volume: 1100, currentTraffic: 5, projectedTraffic: 460, difficulty: "Kolay", intent: "Yerel" },
      { term: "kuzey marmara otoyolu çekici", currentRank: 72, projectedRank: 3, volume: 1800, currentTraffic: 8, projectedTraffic: 740, difficulty: "Kolay", intent: "Yerel" }
    ],
    recommendedAction: "Otoban Gişeleri ve AVM Çevresi Mikro Sayfalar",
    actionDetails: "Otoban çıkışları ve kritik bağlantı yolları için 0 rekabetli mikro sayfalar oluşturarak anında tepe sıraya yerleşin."
  },

  // 2. Fiyat & Maliyet Hesaplayıcıları
  {
    clusterId: "pricing-hub",
    clusterName: "Fiyat & Maliyet Hesaplayıcıları",
    clusterIconName: "DollarSign",
    tierId: "quick-wins",
    keywordCount: 12,
    avgCurrentRank: 6.2,
    avgProjectedRank: 2.3,
    totalSearchVolume: 11500,
    currentMonthlyTraffic: 1250,
    projectedTrafficGrowth: 3800,
    conversionRate: 0.078,
    avgOrderValue: 1900,
    projectedRevenueTl: 56200,
    roiScore: 95,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "oto çekici km ücreti 2026", currentRank: 6, projectedRank: 2, volume: 4800, currentTraffic: 580, projectedTraffic: 1850, difficulty: "Kolay", intent: "Ticari" },
      { term: "çekici fiyatı hesaplama", currentRank: 5, projectedRank: 2, volume: 3400, currentTraffic: 420, projectedTraffic: 1320, difficulty: "Kolay", intent: "Ticari" },
      { term: "kurtarıcı tarifesi istanbul", currentRank: 7, projectedRank: 3, volume: 1900, currentTraffic: 160, projectedTraffic: 710, difficulty: "Kolay", intent: "Ticari" }
    ],
    recommendedAction: "İnteraktif KM Fiyat Hesaplama Widget'ı",
    actionDetails: "Sayfaya doğrudan canlı KM hesaplama aracı ekleyerek sitede kalma süresini 4 katına çıkarın ve Google rank'ını 2'ye taşıyın."
  },
  {
    clusterId: "pricing-hub",
    clusterName: "Fiyat & Maliyet Hesaplayıcıları",
    clusterIconName: "DollarSign",
    tierId: "rising",
    keywordCount: 9,
    avgCurrentRank: 16.0,
    avgProjectedRank: 5.1,
    totalSearchVolume: 7400,
    currentMonthlyTraffic: 290,
    projectedTrafficGrowth: 2150,
    conversionRate: 0.065,
    avgOrderValue: 2400,
    projectedRevenueTl: 33500,
    roiScore: 88,
    effortLevel: "Orta",
    topKeywords: [
      { term: "şehirlerarası çekici ücretleri", currentRank: 14, projectedRank: 4, volume: 2900, currentTraffic: 140, projectedTraffic: 940, difficulty: "Orta", intent: "Ticari" },
      { term: "ankara istanbul araç taşıma fiyatı", currentRank: 17, projectedRank: 5, volume: 2100, currentTraffic: 80, projectedTraffic: 650, difficulty: "Orta", intent: "Ticari" }
    ],
    recommendedAction: "Fiyat Karşılaştırma Tablosu & SSS Ekleme",
    actionDetails: "Mesafe bazlı şeffaf fiyat tablosu ve 'Ek ücret var mı?' gibi sık sorulan soruları ekleyerek zengin sonuçlara (FAQ Schema) çıkın."
  },
  {
    clusterId: "pricing-hub",
    clusterName: "Fiyat & Maliyet Hesaplayıcıları",
    clusterIconName: "DollarSign",
    tierId: "high-volume",
    keywordCount: 7,
    avgCurrentRank: 35.0,
    avgProjectedRank: 9.5,
    totalSearchVolume: 14200,
    currentMonthlyTraffic: 140,
    projectedTrafficGrowth: 2200,
    conversionRate: 0.052,
    avgOrderValue: 2100,
    projectedRevenueTl: 24000,
    roiScore: 79,
    effortLevel: "Orta",
    topKeywords: [
      { term: "oto kurtarıcı ne kadar", currentRank: 32, projectedRank: 8, volume: 5600, currentTraffic: 60, projectedTraffic: 920, difficulty: "Orta", intent: "Bilgi" },
      { term: "araç çekme maliyeti", currentRank: 38, projectedRank: 10, volume: 4400, currentTraffic: 40, projectedTraffic: 710, difficulty: "Orta", intent: "Bilgi" }
    ],
    recommendedAction: "Maliyet Şeffaflığı Rehberi ve Canlı Teklif Butonu",
    actionDetails: "Kullanıcıya ortalama piyasa fiyatları hakkında dürüst rehber sunarak hemen çıkma oranını (Bounce Rate) düşürün."
  },
  {
    clusterId: "pricing-hub",
    clusterName: "Fiyat & Maliyet Hesaplayıcıları",
    clusterIconName: "DollarSign",
    tierId: "untapped",
    keywordCount: 15,
    avgCurrentRank: 58.0,
    avgProjectedRank: 3.2,
    totalSearchVolume: 5200,
    currentMonthlyTraffic: 15,
    projectedTrafficGrowth: 1950,
    conversionRate: 0.082,
    avgOrderValue: 2600,
    projectedRevenueTl: 41500,
    roiScore: 92,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "otoparktan araba çekme ücreti", currentRank: 52, projectedRank: 3, volume: 1800, currentTraffic: 8, projectedTraffic: 720, difficulty: "Kolay", intent: "Ticari" },
      { term: "kasko çekici hakkı sorgulama", currentRank: 61, projectedRank: 4, volume: 1500, currentTraffic: 4, projectedTraffic: 580, difficulty: "Kolay", intent: "Ticari" }
    ],
    recommendedAction: "Kasko Anlaşmalı Çekici Sorgulama Sayfası",
    actionDetails: "Trafik sigortası ve kaskonun ücretsiz çekici hakkını açıklayan tek sayfalık rehberle yüksek satın alma niyetli kitleyi çekin."
  },

  // 3. Ana Hizmet Sayfaları & Çekici Türleri
  {
    clusterId: "core-services",
    clusterName: "Ana Hizmet Sayfaları & Çekici Türleri",
    clusterIconName: "Zap",
    tierId: "quick-wins",
    keywordCount: 15,
    avgCurrentRank: 4.8,
    avgProjectedRank: 1.8,
    totalSearchVolume: 19500,
    currentMonthlyTraffic: 2400,
    projectedTrafficGrowth: 5400,
    conversionRate: 0.085,
    avgOrderValue: 1750,
    projectedRevenueTl: 80300,
    roiScore: 96,
    effortLevel: "Orta",
    topKeywords: [
      { term: "7 24 oto kurtarıcı", currentRank: 5, projectedRank: 2, volume: 6800, currentTraffic: 890, projectedTraffic: 2150, difficulty: "Orta", intent: "İşlemsel" },
      { term: "en yakın oto çekici", currentRank: 4, projectedRank: 1, volume: 7400, currentTraffic: 1050, projectedTraffic: 2420, difficulty: "Orta", intent: "İşlemsel" },
      { term: "acil yol yardım", currentRank: 6, projectedRank: 2, volume: 4200, currentTraffic: 410, projectedTraffic: 1250, difficulty: "Orta", intent: "İşlemsel" }
    ],
    recommendedAction: "Anında Arama (Click-to-Call) ve Gece Modu CTA",
    actionDetails: "Mobilde ilk ekranda parlayan acil arama butonuyla Google mobil SERP tıklama oranını (CTR) %35 artırın."
  },
  {
    clusterId: "core-services",
    clusterName: "Ana Hizmet Sayfaları & Çekici Türleri",
    clusterIconName: "Zap",
    tierId: "rising",
    keywordCount: 11,
    avgCurrentRank: 15.5,
    avgProjectedRank: 4.9,
    totalSearchVolume: 10200,
    currentMonthlyTraffic: 390,
    projectedTrafficGrowth: 2600,
    conversionRate: 0.072,
    avgOrderValue: 1800,
    projectedRevenueTl: 33600,
    roiScore: 86,
    effortLevel: "Orta",
    topKeywords: [
      { term: "motosiklet taşıma çekici", currentRank: 14, projectedRank: 4, volume: 3200, currentTraffic: 150, projectedTraffic: 980, difficulty: "Kolay", intent: "İşlemsel" },
      { term: "ağır vasıta kurtarma", currentRank: 16, projectedRank: 5, volume: 2800, currentTraffic: 110, projectedTraffic: 760, difficulty: "Orta", intent: "İşlemsel" }
    ],
    recommendedAction: "Niş Araç Tipleri İçin Özel Alt Başlıklar",
    actionDetails: "Motosiklet, minibüs ve alçak taban spor arabalara özel aparatların fotoğraflarını ekleyerek kullanıcı güvenini pekiştirin."
  },
  {
    clusterId: "core-services",
    clusterName: "Ana Hizmet Sayfaları & Çekici Türleri",
    clusterIconName: "Zap",
    tierId: "high-volume",
    keywordCount: 8,
    avgCurrentRank: 38.0,
    avgProjectedRank: 8.8,
    totalSearchVolume: 24500,
    currentMonthlyTraffic: 220,
    projectedTrafficGrowth: 3200,
    conversionRate: 0.058,
    avgOrderValue: 1600,
    projectedRevenueTl: 29700,
    roiScore: 81,
    effortLevel: "Yüksek",
    topKeywords: [
      { term: "oto kurtarma", currentRank: 36, projectedRank: 8, volume: 14000, currentTraffic: 140, projectedTraffic: 1900, difficulty: "Zor", intent: "İşlemsel" },
      { term: "çekici", currentRank: 42, projectedRank: 10, volume: 9500, currentTraffic: 70, projectedTraffic: 1150, difficulty: "Zor", intent: "İşlemsel" }
    ],
    recommendedAction: "Geniş Kapsamlı Hizmet Silo Mimarisi",
    actionDetails: "Ana 'çekici' terimi çok rekabetçi olduğundan, uzun kuyruklu ilçe sayfalarından ana sayfaya otorite aktarın."
  },
  {
    clusterId: "core-services",
    clusterName: "Ana Hizmet Sayfaları & Çekici Türleri",
    clusterIconName: "Zap",
    tierId: "untapped",
    keywordCount: 16,
    avgCurrentRank: 61.0,
    avgProjectedRank: 2.8,
    totalSearchVolume: 4900,
    currentMonthlyTraffic: 20,
    projectedTrafficGrowth: 1800,
    conversionRate: 0.095,
    avgOrderValue: 2200,
    projectedRevenueTl: 37600,
    roiScore: 93,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "kapalı kasa araç taşıma", currentRank: 58, projectedRank: 2, volume: 1600, currentTraffic: 8, projectedTraffic: 680, difficulty: "Kolay", intent: "Ticari" },
      { term: "elektrikli araç çekici (tesla/togg)", currentRank: 64, projectedRank: 3, volume: 1400, currentTraffic: 6, projectedTraffic: 560, difficulty: "Kolay", intent: "Ticari" }
    ],
    recommendedAction: "Elektrikli Araç (EV) & Lüks Araba Çekici Sayfası",
    actionDetails: "Tesla ve Togg gibi elektrikli araçların taşınmasında 0 rekabet var. Yeni bir EV sayfasıyla pazar lideri olun."
  },

  // 4. Kurumsal & Filo Taşıma Sözleşmeleri (B2B)
  {
    clusterId: "b2b-fleet",
    clusterName: "Kurumsal & Filo Taşıma Sözleşmeleri",
    clusterIconName: "Layers",
    tierId: "quick-wins",
    keywordCount: 8,
    avgCurrentRank: 5.4,
    avgProjectedRank: 1.9,
    totalSearchVolume: 4200,
    currentMonthlyTraffic: 420,
    projectedTrafficGrowth: 1450,
    conversionRate: 0.048,
    avgOrderValue: 12500,
    projectedRevenueTl: 87000,
    roiScore: 94,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "filo çekici anlaşması", currentRank: 5, projectedRank: 2, volume: 1600, currentTraffic: 180, projectedTraffic: 620, difficulty: "Kolay", intent: "Ticari" },
      { term: "çoklu araç taşıma fiyatları", currentRank: 6, projectedRank: 2, volume: 1800, currentTraffic: 160, projectedTraffic: 640, difficulty: "Kolay", intent: "Ticari" }
    ],
    recommendedAction: "B2B Kurumsal Teklif İsteme Formu & Referanslar",
    actionDetails: "Firma logonuzu ve kurumsal faturalandırma avantajlarını öne çıkararak filo yöneticilerini doğrudan yakalayın."
  },
  {
    clusterId: "b2b-fleet",
    clusterName: "Kurumsal & Filo Taşıma Sözleşmeleri",
    clusterIconName: "Layers",
    tierId: "rising",
    keywordCount: 7,
    avgCurrentRank: 17.0,
    avgProjectedRank: 4.6,
    totalSearchVolume: 3600,
    currentMonthlyTraffic: 140,
    projectedTrafficGrowth: 1100,
    conversionRate: 0.042,
    avgOrderValue: 9500,
    projectedRevenueTl: 43800,
    roiScore: 89,
    effortLevel: "Orta",
    topKeywords: [
      { term: "galeri araba nakliye", currentRank: 16, projectedRank: 4, volume: 1500, currentTraffic: 65, projectedTraffic: 480, difficulty: "Kolay", intent: "Ticari" },
      { term: "bayi sıfır araç transfer", currentRank: 18, projectedRank: 5, volume: 1100, currentTraffic: 40, projectedTraffic: 360, difficulty: "Orta", intent: "Ticari" }
    ],
    recommendedAction: "Oto Galeri & İkinci El Platformlarına Özel İndirim Sayfası",
    actionDetails: "Galericilere yönelik haftalık düzenli transfer anlaşması içeren özel B2B sayfa yayınlayın."
  },
  {
    clusterId: "b2b-fleet",
    clusterName: "Kurumsal & Filo Taşıma Sözleşmeleri",
    clusterIconName: "Layers",
    tierId: "high-volume",
    keywordCount: 5,
    avgCurrentRank: 33.0,
    avgProjectedRank: 9.0,
    totalSearchVolume: 5800,
    currentMonthlyTraffic: 70,
    projectedTrafficGrowth: 1150,
    conversionRate: 0.035,
    avgOrderValue: 8000,
    projectedRevenueTl: 32200,
    roiScore: 80,
    effortLevel: "Orta",
    topKeywords: [
      { term: "araç nakliyesi firmaları", currentRank: 31, projectedRank: 8, volume: 3200, currentTraffic: 45, projectedTraffic: 680, difficulty: "Orta", intent: "Ticari" },
      { term: "şehirlerarası oto taşıyıcı", currentRank: 35, projectedRank: 10, volume: 2100, currentTraffic: 22, projectedTraffic: 410, difficulty: "Orta", intent: "Ticari" }
    ],
    recommendedAction: "Şehirlerarası Rota & Sefer Takvimi Sayfası",
    actionDetails: "Haftalık İstanbul-İzmir-Ankara güzergahlarını listeleyerek parsiyel araç nakliyesi arayanları toplayın."
  },
  {
    clusterId: "b2b-fleet",
    clusterName: "Kurumsal & Filo Taşıma Sözleşmeleri",
    clusterIconName: "Layers",
    tierId: "untapped",
    keywordCount: 10,
    avgCurrentRank: 52.0,
    avgProjectedRank: 2.5,
    totalSearchVolume: 2800,
    currentMonthlyTraffic: 10,
    projectedTrafficGrowth: 950,
    conversionRate: 0.055,
    avgOrderValue: 14000,
    projectedRevenueTl: 73000,
    roiScore: 95,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "rent a car çekici anlaşması", currentRank: 48, projectedRank: 2, volume: 1100, currentTraffic: 5, projectedTraffic: 420, difficulty: "Kolay", intent: "Ticari" },
      { term: "şantiye ağır iş makinesi taşıma", currentRank: 56, projectedRank: 3, volume: 900, currentTraffic: 3, projectedTraffic: 310, difficulty: "Kolay", intent: "Ticari" }
    ],
    recommendedAction: "Araç Kiralama (Rent a Car) Firmalarına Sözleşmeli Paket",
    actionDetails: "Rent a car firmaları için sabit fiyatlı aylık çekici güvencesi sunan niş bir B2B sayfasıyla yüksek hacimli ciro yakalayın."
  },

  // 5. Acil Durum & Sürücü Rehberleri
  {
    clusterId: "emergency-guides",
    clusterName: "Acil Durum & Sürücü Rehberleri",
    clusterIconName: "HelpCircle",
    tierId: "quick-wins",
    keywordCount: 10,
    avgCurrentRank: 7.1,
    avgProjectedRank: 2.8,
    totalSearchVolume: 14800,
    currentMonthlyTraffic: 1450,
    projectedTrafficGrowth: 3600,
    conversionRate: 0.024,
    avgOrderValue: 1600,
    projectedRevenueTl: 13800,
    roiScore: 78,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "otoparka çekilen araç nasıl bulunur", currentRank: 7, projectedRank: 2, volume: 6800, currentTraffic: 720, projectedTraffic: 1950, difficulty: "Kolay", intent: "Bilgi" },
      { term: "yolda kalınca ne yapılır", currentRank: 6, projectedRank: 2, volume: 4400, currentTraffic: 480, projectedTraffic: 1220, difficulty: "Kolay", intent: "Bilgi" }
    ],
    recommendedAction: "Rehber İçine 'Hemen Çekici Çağır' Yapışkan Butonu",
    actionDetails: "Bilgilendirici yazıların içerisine mobil yapışkan acil arama kutusu ekleyerek bilgi trafiğini anında müşteriye dönüştürün."
  },
  {
    clusterId: "emergency-guides",
    clusterName: "Acil Durum & Sürücü Rehberleri",
    clusterIconName: "HelpCircle",
    tierId: "rising",
    keywordCount: 12,
    avgCurrentRank: 18.2,
    avgProjectedRank: 5.5,
    totalSearchVolume: 16200,
    currentMonthlyTraffic: 520,
    projectedTrafficGrowth: 3400,
    conversionRate: 0.018,
    avgOrderValue: 1600,
    projectedRevenueTl: 9800,
    roiScore: 72,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "otobanda arıza yapınca kimi aramalıyım", currentRank: 17, projectedRank: 5, volume: 4900, currentTraffic: 180, projectedTraffic: 1100, difficulty: "Kolay", intent: "Bilgi" },
      { term: "akü bittiğinde arabayı çalıştırma yolları", currentRank: 19, projectedRank: 6, volume: 5800, currentTraffic: 160, projectedTraffic: 1250, difficulty: "Kolay", intent: "Bilgi" }
    ],
    recommendedAction: "Adım Adım İnfografik ve FAQ Zenginleştirmesi",
    actionDetails: "Okunabilirliği artıracak 4 adımlı kontrol listesi ekleyerek sayfada kalma süresini yükseltin."
  },
  {
    clusterId: "emergency-guides",
    clusterName: "Acil Durum & Sürücü Rehberleri",
    clusterIconName: "HelpCircle",
    tierId: "high-volume",
    keywordCount: 14,
    avgCurrentRank: 36.0,
    avgProjectedRank: 9.8,
    totalSearchVolume: 38000,
    currentMonthlyTraffic: 380,
    projectedTrafficGrowth: 4900,
    conversionRate: 0.012,
    avgOrderValue: 1600,
    projectedRevenueTl: 9400,
    roiScore: 66,
    effortLevel: "Orta",
    topKeywords: [
      { term: "trafik kazası tutanağı nasıl doldurulur", currentRank: 35, projectedRank: 9, volume: 18000, currentTraffic: 220, projectedTraffic: 2500, difficulty: "Orta", intent: "Bilgi" },
      { term: "araba hararet yapınca ne yapılır", currentRank: 38, projectedRank: 11, volume: 12000, currentTraffic: 95, projectedTraffic: 1450, difficulty: "Kolay", intent: "Bilgi" }
    ],
    recommendedAction: "İndirilebilir PDF Kaza Tutanağı Şablonu Ekleme",
    actionDetails: "PDF indir butonu ekleyerek ziyaretçilerden telefon/lead toplayın ve marka bilinirliği yaratın."
  },
  {
    clusterId: "emergency-guides",
    clusterName: "Acil Durum & Sürücü Rehberleri",
    clusterIconName: "HelpCircle",
    tierId: "untapped",
    keywordCount: 18,
    avgCurrentRank: 65.0,
    avgProjectedRank: 3.8,
    totalSearchVolume: 8400,
    currentMonthlyTraffic: 30,
    projectedTrafficGrowth: 2800,
    conversionRate: 0.028,
    avgOrderValue: 1600,
    projectedRevenueTl: 12500,
    roiScore: 76,
    effortLevel: "Düşük",
    topKeywords: [
      { term: "togg şarjı bitince yolda kalma çekici", currentRank: 62, projectedRank: 3, volume: 2400, currentTraffic: 12, projectedTraffic: 940, difficulty: "Kolay", intent: "Bilgi" },
      { term: "otomatik vites araba çekilirken şanzıman bozulur mu", currentRank: 67, projectedRank: 4, volume: 2900, currentTraffic: 10, projectedTraffic: 1050, difficulty: "Kolay", intent: "Bilgi" }
    ],
    recommendedAction: "Yeni Nesil Elektrikli ve Otomatik Vites Çekici Rehberi",
    actionDetails: "Sürücülerin en çok korktuğu 'şanzıman kilitleme' sorusuna teknik uzman cevabı vererek güven kazanın."
  }
];

interface PredictiveSeoHeatmapProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenReportModal?: () => void;
}

type HeatmapMetricMode = "roi" | "traffic" | "revenue" | "keywords";

export const PredictiveSeoHeatmap: React.FC<PredictiveSeoHeatmapProps> = ({
  config,
  onChange,
  onNavigateTab,
  onOpenReportModal
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [activeTabMode, setActiveTabMode] = useState<"matrix" | "remediation">("matrix");
  const [remediationClusterFilter, setRemediationClusterFilter] = useState<string>("all");
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>("roi");
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>("all");
  const [simulationMultiplier, setSimulationMultiplier] = useState<number>(1.0); // 0.7 = Conservative, 1.0 = Realistic, 1.35 = Aggressive
  const [selectedCell, setSelectedCell] = useState<SeoHeatmapCellData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<SeoHeatmapCellData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [activeStrategyPlanApplied, setActiveStrategyPlanApplied] = useState<boolean>(false);

  // Dynamic calculations adjusted by simulation multiplier
  const adjustedData = useMemo(() => {
    return INITIAL_HEATMAP_DATA.map((item) => {
      const growth = Math.round(item.projectedTrafficGrowth * simulationMultiplier);
      const revenue = Math.round(item.projectedRevenueTl * simulationMultiplier);
      // ROI slightly adjusts with multiplier
      const roi = Math.min(99, Math.max(50, Math.round(item.roiScore * (0.85 + simulationMultiplier * 0.15))));
      return {
        ...item,
        projectedTrafficGrowth: growth,
        projectedRevenueTl: revenue,
        roiScore: roi
      };
    });
  }, [simulationMultiplier]);

  // Overall aggregates for Executive Summary
  const totals = useMemo(() => {
    const totalGrowth = adjustedData.reduce((acc, curr) => acc + curr.projectedTrafficGrowth, 0);
    const totalRevenue = adjustedData.reduce((acc, curr) => acc + curr.projectedRevenueTl, 0);
    const totalKeywords = adjustedData.reduce((acc, curr) => acc + curr.keywordCount, 0);
    const avgRoi = Math.round(adjustedData.reduce((acc, curr) => acc + curr.roiScore, 0) / adjustedData.length);
    
    // Find highest ROI cluster
    const clusterMap: Record<string, { name: string; revenue: number; traffic: number; roiTotal: number; count: number }> = {};
    adjustedData.forEach((c) => {
      if (!clusterMap[c.clusterId]) {
        clusterMap[c.clusterId] = { name: c.clusterName, revenue: 0, traffic: 0, roiTotal: 0, count: 0 };
      }
      clusterMap[c.clusterId].revenue += c.projectedRevenueTl;
      clusterMap[c.clusterId].traffic += c.projectedTrafficGrowth;
      clusterMap[c.clusterId].roiTotal += c.roiScore;
      clusterMap[c.clusterId].count += 1;
    });

    let topCluster = { name: "Bölgesel İlçe Sayfaları (Local SEO)", roi: 96, revenue: 0 };
    Object.values(clusterMap).forEach((cl) => {
      const avg = Math.round(cl.roiTotal / cl.count);
      if (avg > topCluster.roi) {
        topCluster = { name: cl.name, roi: avg, revenue: cl.revenue };
      }
    });

    return {
      totalGrowth,
      totalRevenue,
      totalKeywords,
      avgRoi,
      topCluster
    };
  }, [adjustedData]);

  // Set default selected cell on mount
  useEffect(() => {
    if (!selectedCell) {
      // Default to Local Landing Quick Wins (highest ROI)
      const defaultItem = adjustedData.find(d => d.clusterId === "local-landing" && d.tierId === "quick-wins");
      if (defaultItem) setSelectedCell(defaultItem);
    } else {
      // Update selected cell reference from adjustedData
      const updated = adjustedData.find(d => d.clusterId === selectedCell.clusterId && d.tierId === selectedCell.tierId);
      if (updated) setSelectedCell(updated);
    }
  }, [adjustedData]);

  // D3 Heatmap Rendering Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 75, right: 30, bottom: 25, left: 240 };
    const width = Math.max(760, containerWidth) - margin.left - margin.right;
    const height = 360;

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis: 4 Ranking Tiers
    const x = d3.scaleBand<string>()
      .range([0, width])
      .domain(RANKING_TIERS.map(d => d.id))
      .padding(0.08);

    // Y Axis: 5 Content Clusters
    const y = d3.scaleBand<string>()
      .range([0, height])
      .domain(CONTENT_CLUSTERS.map(d => d.id))
      .padding(0.12);

    // Color Scales based on Metric Mode
    let colorInterpolator: (t: number) => string;
    let domainRange: [number, number];

    if (metricMode === "roi") {
      // ROI Score: 60 to 100 (Deep Slate -> Indigo -> Emerald -> High-Vibe Green)
      colorInterpolator = (t: number) => {
        // Custom vibrant scale: low = dark indigo/slate, mid = sky/teal, high = emerald
        return d3.interpolateRgbBasis([
          "#1e293b", // slate-800
          "#0f766e", // teal-700
          "#059669", // emerald-600
          "#10b981", // emerald-500
          "#34d399"  // emerald-400
        ])(t);
      };
      domainRange = [65, 98];
    } else if (metricMode === "traffic") {
      // Traffic Growth: 500 to 5500 visits/mo
      colorInterpolator = (t: number) => {
        return d3.interpolateRgbBasis([
          "#0f172a", // slate-900
          "#0369a1", // sky-700
          "#0284c7", // sky-600
          "#06b6d4", // cyan-500
          "#10b981"  // emerald-500
        ])(t);
      };
      domainRange = [800, 5400];
    } else if (metricMode === "revenue") {
      // Revenue in TL: 8,000 to 90,000 TL
      colorInterpolator = (t: number) => {
        return d3.interpolateRgbBasis([
          "#1e1b4b", // indigo-950
          "#4338ca", // indigo-700
          "#d97706", // amber-600
          "#059669", // emerald-600
          "#10b981"  // emerald-500
        ])(t);
      };
      domainRange = [10000, 85000];
    } else {
      // Keywords count: 5 to 22
      colorInterpolator = (t: number) => {
        return d3.interpolateRgbBasis([
          "#1e293b",
          "#475569",
          "#6366f1",
          "#8b5cf6"
        ])(t);
      };
      domainRange = [5, 22];
    }

    const colorScale = d3.scaleSequential(colorInterpolator).domain(domainRange);

    // ==========================================
    // DRAW COLUMN HEADERS (TOP X-AXIS)
    // ==========================================
    const colHeaders = g.append("g").attr("class", "x-headers");

    RANKING_TIERS.forEach((tier) => {
      const xPos = (x(tier.id) || 0) + x.bandwidth() / 2;
      const headerG = colHeaders.append("g").attr("transform", `translate(${xPos}, -16)`);

      // Pill Background for Tier
      headerG.append("rect")
        .attr("x", -x.bandwidth() / 2 + 4)
        .attr("y", -50)
        .attr("width", x.bandwidth() - 8)
        .attr("height", 46)
        .attr("rx", 10)
        .attr("fill", "#0f172a") // slate-900
        .attr("stroke", "#334155") // slate-700
        .attr("stroke-width", 1);

      // Top Tag
      headerG.append("text")
        .attr("x", 0)
        .attr("y", -34)
        .attr("text-anchor", "middle")
        .attr("fill", tier.id === "quick-wins" ? "#34d399" : "#38bdf8")
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("font-family", "inherit")
        .text(tier.label);

      // Subtitle / SERP Range
      headerG.append("text")
        .attr("x", 0)
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "9.5px")
        .attr("font-family", "monospace")
        .text(tier.serpRange);
    });

    // ==========================================
    // DRAW ROW HEADERS (LEFT Y-AXIS)
    // ==========================================
    const rowHeaders = g.append("g").attr("class", "y-headers");

    CONTENT_CLUSTERS.forEach((cluster) => {
      const yPos = (y(cluster.id) || 0) + y.bandwidth() / 2;
      const rowG = rowHeaders.append("g").attr("transform", `translate(-16, ${yPos})`);

      // Category Pill
      const catColor = cluster.category === "Yerel" ? "#10b981" :
        cluster.category === "Ticari" ? "#f59e0b" :
        cluster.category === "Hizmet" ? "#38bdf8" :
        cluster.category === "B2B" ? "#a855f7" : "#94a3b8";

      rowG.append("rect")
        .attr("x", -220)
        .attr("y", -y.bandwidth() / 2 + 4)
        .attr("width", 212)
        .attr("height", y.bandwidth() - 8)
        .attr("rx", 10)
        .attr("fill", selectedClusterFilter === cluster.id ? "#1e293b" : "#0f172a")
        .attr("stroke", selectedClusterFilter === cluster.id ? "#38bdf8" : "#1e293b")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedClusterFilter(prev => prev === cluster.id ? "all" : cluster.id);
        });

      // Cluster Name
      rowG.append("text")
        .attr("x", -208)
        .attr("y", -3)
        .attr("fill", "#f8fafc")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("font-family", "inherit")
        .text(cluster.name.length > 24 ? cluster.name.substring(0, 23) + "…" : cluster.name)
        .style("pointer-events", "none");

      // Badge (Category & Priority)
      rowG.append("circle")
        .attr("cx", -204)
        .attr("cy", 12)
        .attr("r", 3.5)
        .attr("fill", catColor);

      rowG.append("text")
        .attr("x", -194)
        .attr("y", 15)
        .attr("fill", "#94a3b8")
        .attr("font-size", "9.5px")
        .attr("font-family", "inherit")
        .text(`${cluster.category} • Öncelik: ${cluster.priority}`)
        .style("pointer-events", "none");
    });

    // ==========================================
    // DRAW HEATMAP CELLS
    // ==========================================
    const cellGroups = g.selectAll<SVGGElement, SeoHeatmapCellData>(".heatmap-cell")
      .data(adjustedData)
      .enter()
      .append("g")
      .attr("class", "heatmap-cell")
      .attr("transform", (d: SeoHeatmapCellData) => `translate(${x(d.tierId)}, ${y(d.clusterId)})`)
      .style("cursor", "pointer");

    // Cell Rectangle Background
    cellGroups.append("rect")
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("rx", 10)
      .attr("fill", (d: SeoHeatmapCellData) => {
        if (metricMode === "roi") return colorScale(d.roiScore);
        if (metricMode === "traffic") return colorScale(d.projectedTrafficGrowth);
        if (metricMode === "revenue") return colorScale(d.projectedRevenueTl);
        return colorScale(d.keywordCount);
      })
      .attr("stroke", (d: SeoHeatmapCellData) => {
        if (selectedCell?.clusterId === d.clusterId && selectedCell?.tierId === d.tierId) {
          return "#f8fafc"; // White glowing border for selected
        }
        return "#020617"; // Dark separator
      })
      .attr("stroke-width", (d: SeoHeatmapCellData) => {
        if (selectedCell?.clusterId === d.clusterId && selectedCell?.tierId === d.tierId) return 3;
        return 2;
      })
      .attr("opacity", (d: SeoHeatmapCellData) => {
        if (selectedClusterFilter !== "all" && d.clusterId !== selectedClusterFilter) {
          return 0.25;
        }
        return 0.94;
      })
      .transition()
      .duration(400)
      .attr("opacity", (d: SeoHeatmapCellData) => {
        if (selectedClusterFilter !== "all" && d.clusterId !== selectedClusterFilter) {
          return 0.25;
        }
        return 1.0;
      });

    // Cell Highlight Stroke on Hover
    cellGroups
      .on("mouseenter", function(event: MouseEvent, d: SeoHeatmapCellData) {
        d3.select(this).select("rect")
          .attr("stroke", "#38bdf8")
          .attr("stroke-width", 3);

        setHoveredCell(d);
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      })
      .on("mouseleave", function(event: MouseEvent, d: SeoHeatmapCellData) {
        d3.select(this).select("rect")
          .attr("stroke", () => {
            if (selectedCell?.clusterId === d.clusterId && selectedCell?.tierId === d.tierId) return "#f8fafc";
            return "#020617";
          })
          .attr("stroke-width", () => {
            if (selectedCell?.clusterId === d.clusterId && selectedCell?.tierId === d.tierId) return 3;
            return 2;
          });
        setHoveredCell(null);
      })
      .on("click", (event: MouseEvent, d: SeoHeatmapCellData) => {
        setSelectedCell(d);
      });

    // Primary Text in Cell (Large Value)
    cellGroups.append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", y.bandwidth() / 2 - 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .attr("font-weight", "900")
      .attr("font-family", "monospace")
      .style("pointer-events", "none")
      .text((d: SeoHeatmapCellData) => {
        if (metricMode === "roi") return `%${d.roiScore} ROI`;
        if (metricMode === "traffic") return `+${d.projectedTrafficGrowth.toLocaleString()}`;
        if (metricMode === "revenue") return `+₺${(d.projectedRevenueTl / 1000).toFixed(0)}B`;
        return `${d.keywordCount} Kelime`;
      });

    // Secondary Text in Cell (Contextual Sub-badge)
    cellGroups.append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", y.bandwidth() / 2 + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "9.5px")
      .attr("font-weight", "600")
      .attr("font-family", "inherit")
      .style("pointer-events", "none")
      .text((d: SeoHeatmapCellData) => {
        if (metricMode === "roi") return `+${d.projectedTrafficGrowth.toLocaleString()} Ziyaret`;
        if (metricMode === "traffic") return `%${d.roiScore} Getiri Skoru`;
        if (metricMode === "revenue") return `%${(d.conversionRate * 100).toFixed(1)} Dönüşüm`;
        return `Sıra #${d.avgCurrentRank.toFixed(0)} → #${d.avgProjectedRank.toFixed(0)}`;
      });

  }, [adjustedData, metricMode, selectedClusterFilter, selectedCell]);

  return (
    <div className="space-y-6">
      {/* VIEW SWITCHER: HEATMAP MATRIX VS SEO REMEDIATION PANEL */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-white">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="tab-mode-heatmap-matrix"
            onClick={() => setActiveTabMode("matrix")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTabMode === "matrix"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
            <span>D3 Isı Haritası Matrisi &amp; ROI</span>
          </button>

          <button
            type="button"
            id="tab-mode-seo-remediation"
            onClick={() => {
              setRemediationClusterFilter("all");
              setActiveTabMode("remediation");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTabMode === "remediation"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>SEO Düzeltme Paneli (H1 &amp; Meta)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              Tek Tıkla Fix
            </span>
          </button>
        </div>

        {activeTabMode === "matrix" ? (
          <button
            type="button"
            id="btn-switch-to-remediation-inline"
            onClick={() => {
              setRemediationClusterFilter("all");
              setActiveTabMode("remediation");
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pr-3 cursor-pointer"
          >
            <span>Eksik H1 ve Meta Açıklamalarını Düzelt</span>
            <span>→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTabMode("matrix")}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 pr-3 cursor-pointer"
          >
            <span>← D3 Isı Haritasına Dön</span>
          </button>
        )}
      </div>

      {activeTabMode === "remediation" ? (
        <SeoRemediationPanel
          config={config}
          onChange={onChange}
          onNavigateTab={onNavigateTab}
          initialClusterFilter={remediationClusterFilter}
        />
      ) : (
        <>
      {/* 1. TOP HEADER & INTERACTIVE PREDICTION SIMULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                D3.js Tahminleme Modeli
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Yapay Zeka Destekli SEO ROI
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                5 İçerik Kümesi • 20 SERP Segmenti
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Tahminleyici SEO Isı Haritası (Predictive SEO Heatmap)</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Hangi içerik alanlarına yatırım yaptığınızda en yüksek organik trafik artışı ve ticari ciro (ROI) elde edeceğinizi
              D3.js 2D matris grafiğiyle görselleştirin. Hızlı zaferler (Quick Wins) ile minimum çabayla tepe sıralara tırmanın.
            </p>
          </div>

          {/* SIMULATION SLIDER WIDGET */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 w-full sm:w-80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>SEO Hedef Simülasyonu:</span>
              </span>
              <span className="font-mono font-black text-emerald-400">
                {simulationMultiplier === 0.7 ? "Muhafazakar (İlk 5)" :
                 simulationMultiplier === 1.0 ? "Gerçekçi (İlk 3)" : "Agresif (#1 Pozisyon)"}
              </span>
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min="0.7"
              max="1.35"
              step="0.05"
              value={simulationMultiplier}
              onChange={(e) => setSimulationMultiplier(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>%50 Büyüme</span>
              <span className="text-slate-200">Varsayılan (%100)</span>
              <span>%135 Büyüme</span>
            </div>
          </div>
        </div>

        {/* 2. EXECUTIVE METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Toplam Tahmini Trafik</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
              +{totals.totalGrowth.toLocaleString()} / ay
            </span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Sıralama iyileşmesiyle</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Tahmini Ek Ciro Değeri</span>
            <span className="text-lg font-black text-sky-400 font-mono mt-0.5 block">
              +₺{totals.totalRevenue.toLocaleString()} / ay
            </span>
            <span className="text-[10px] text-sky-300 block mt-0.5">
              Doğrudan çağrı &amp; form dönüşümü
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">En Yüksek ROI Alanı</span>
            <span className="text-sm font-black text-white truncate mt-1 block">
              {totals.topCluster.name.split(" ")[0]}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400 block mt-0.5">
              ROI: %{totals.topCluster.roi} (En Hızlı Getiri)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Hedeflenen Anahtar Kelimeler</span>
            <span className="text-lg font-black text-indigo-400 font-mono mt-0.5 block">
              {totals.totalKeywords} Terim
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Ortalama ROI: %{totals.avgRoi}
            </span>
          </div>
        </div>
      </div>

      {/* 3. HEATMAP CONTROL TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        {/* Metric Mode Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Isı Haritası Metriği:</span>
          </span>

          <button
            type="button"
            onClick={() => setMetricMode("roi")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === "roi"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🎯 ROI Skoru (%)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("traffic")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === "traffic"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            📈 Trafik Artışı (Ziyaret/Ay)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("revenue")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === "revenue"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            💰 Tahmini Ciro (TL)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("keywords")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === "keywords"
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🔑 Kelime Sayısı
          </button>
        </div>

        {/* Content Filter & Reset */}
        <div className="flex items-center gap-2">
          {selectedClusterFilter !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedClusterFilter("all")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
            >
              Filtreyi Temizle
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Koyu Yeşil = Maksimum ROI</span>
          </div>
        </div>
      </div>

      {/* 4. D3 SVG HEATMAP CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl overflow-x-auto relative"
      >
        <div className="min-w-[760px]">
          <svg ref={svgRef} className="w-full" />
        </div>

        {/* Heatmap Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">Renk Yoğunluğu:</span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700" />
              <span>Düşük</span>
              <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-slate-800 via-sky-700 to-emerald-500 mx-1" />
              <span>Çok Yüksek Getiri</span>
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Hücrelere tıklayarak detaylı anahtar kelime dökümünü ve eylem planını inceleyin.
          </div>
        </div>
      </div>

      {/* 5. DEEP-DIVE INSPECTION DRAWER / CARD (FOR SELECTED CELL) */}
      {selectedCell && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-150">
          {/* Header of selected cell */}
          <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  ROI: %{selectedCell.roiScore} / 100
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                  {selectedCell.tierId === "quick-wins" ? "Hızlı Zafer (#4-#10)" :
                   selectedCell.tierId === "rising" ? "Yükseliş Adayı (#11-#20)" :
                   selectedCell.tierId === "high-volume" ? "Yüksek Hacimli (#21-#50)" : "Yeni Niş"}
                </span>
                <span className="text-xs text-slate-400">
                  Uygulama Zorluğu: <strong className="text-white">{selectedCell.effortLevel}</strong>
                </span>
              </div>

              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{selectedCell.clusterName}</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Öngörülen Trafik Artışı</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  +{selectedCell.projectedTrafficGrowth.toLocaleString()} ziyaret / ay
                </span>
              </div>

              <div className="text-right pl-3 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 block font-mono">Tahmini Ciro Katkısı</span>
                <span className="text-base font-black text-sky-400 font-mono">
                  +₺{selectedCell.projectedRevenueTl.toLocaleString()} / ay
                </span>
              </div>
            </div>
          </div>

          {/* Actionable Strategy Recommendation Box */}
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 block text-sm">
                  Önerilen SEO Hamlesi: {selectedCell.recommendedAction}
                </span>
                <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
                  {selectedCell.actionDetails}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-goto-remediation-for-cluster"
                onClick={() => {
                  setRemediationClusterFilter(selectedCell.clusterId);
                  setActiveTabMode("remediation");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                title="Bu kümedeki sayfaların eksik H1 ve meta etiketlerini tek tıkla düzelt"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Bu Kümenin H1/Meta Etiketlerini Düzelt →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStrategyPlanApplied(true);
                  setTimeout(() => setActiveStrategyPlanApplied(false), 3000);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeStrategyPlanApplied
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                }`}
              >
                {activeStrategyPlanApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stratejiye Eklendi ✓</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Bu Hamleyi Uygula</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keywords Table */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Hedef Anahtar Kelimeler &amp; Tahmini Sıralama Sıçraması:</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                {selectedCell.topKeywords.length} Örnek Anahtar Kelime Gösteriliyor
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Anahtar Kelime</th>
                    <th className="py-2.5 px-3">Arama Niyeti</th>
                    <th className="py-2.5 px-3">Aylık Arama Hacmi</th>
                    <th className="py-2.5 px-3">Mevcut Sıra</th>
                    <th className="py-2.5 px-3">Tahmini Sıra</th>
                    <th className="py-2.5 px-3">Beklenen Trafik</th>
                    <th className="py-2.5 px-3">Zorluk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedCell.topKeywords.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{kw.term}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {kw.intent}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {kw.volume.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        #{kw.currentRank}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-600 flex items-center gap-1">
                        <span>#{kw.projectedRank}</span>
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                        +{kw.projectedTraffic.toLocaleString()} / ay
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          kw.difficulty === "Kolay" ? "bg-emerald-100 text-emerald-800" :
                          kw.difficulty === "Orta" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {kw.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. ACTIONABLE ROADMAP: TOP 3 HIGHEST ROI INITIATIVES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Gelecek Çeyrek İçin En Yüksek Getiri (ROI) Sağlayacak 3 İçerik Hamlesi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Matematiksel olarak en az emekle en yüksek organik müşteri dönüşümü sağlayan eylemler.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
            Öncelikli Eylem Planı
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">1. ÖNCELİK (QUICK WIN)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ROI: %97
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Bölgesel İlçe Sayfaları (Local SEO)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kadıköy, Ümraniye ve Ataşehir sayfalarına LocalBusiness Schema ve mahalle açık adreslerini ekleyin.
                Sıralama #6&apos;dan #2&apos;ye sıçrayarak ayda <strong>+4,650 acil arama</strong> çeker.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Potansiyel: +₺67,500/ay</span>
              <span className="text-emerald-600 font-bold">Düşük Emek ✓</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-sky-700">2. ÖNCELİK (DÖNÜŞÜM)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  ROI: %95
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Canlı KM Fiyat Hesaplama Motoru</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sitenize interaktif çekici km hesaplama aracı yerleştirin. &quot;oto çekici km ücreti 2026&quot; teriminde
                Google Featured Snippet kaparak ayda <strong>+3,800 hazır müşteri</strong> kazandırır.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Potansiyel: +₺56,200/ay</span>
              <span className="text-sky-600 font-bold">Düşük Emek ✓</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-700">3. ÖNCELİK (B2B CİRO)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  ROI: %94
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Kurumsal Filo &amp; Rent a Car Sayfası</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Galericiler ve filo sahipleri için sözleşmeli aylık yol yardım sayfası hazırlayın.
                Düşük arama hacmine rağmen yüksek sepet tutarı (₺12,500) ile <strong>+₺87,000/ay</strong> değer yaratır.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Potansiyel: +₺87,000/ay</span>
              <span className="text-indigo-600 font-bold">B2B Odaklı ✓</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
