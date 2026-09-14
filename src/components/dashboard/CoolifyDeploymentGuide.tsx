import React, { useState } from "react";
import { 
  Server, 
  Globe, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Cpu, 
  FileCode, 
  Lock,
  Layers,
  HelpCircle,
  AlertTriangle,
  Download
} from "lucide-react";
import { SiteConfig } from "../../types";
import { downloadProjectSourceZip } from "../../utils/projectZipDownloader";

interface CoolifyDeploymentGuideProps {
  config: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const CoolifyDeploymentGuide: React.FC<CoolifyDeploymentGuideProps> = ({
  config,
  isOpen,
  onClose
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"coolify" | "dns" | "docker" | "env">("coolify");
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");

  const handleDownload = async () => {
    setDownloadStatus("downloading");
    await downloadProjectSourceZip((status) => {
      setDownloadStatus(status);
      if (status === "success" || status === "error") {
        setTimeout(() => setDownloadStatus("idle"), 4000);
      }
    });
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const domain = "jetkur.com.tr";

  const dockerfileSnippet = `# Node.js 20 LTS tabanlı çok katmanlı optimize imaj
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılık dosyalarını kopyala ve yükle
COPY package*.json ./
RUN npm ci

# Kaynak kodları kopyala ve build al
COPY . .
RUN npm run build

# Production Runtime Katmanı
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Sadece gerekli build ve modül çıktılarını kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.ts ./server.ts

# Port 3000'i dışa aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "dist/server.cjs"]`;

  const envExampleSnippet = `# jetkur.com.tr Prodüksiyon Ortam Değişkenleri
NODE_ENV=production
PORT=3000
VITE_SITE_URL=https://jetkur.com.tr
VITE_COMPANY_NAME="JetKur Lojistik & Web"
VITE_ADMIN_EMAIL=admin@jetkur.com.tr
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Canlıya Alma Rehberi
                </span>
                <span className="text-xs text-indigo-300 font-mono font-bold">Hostinger VPS + Coolify</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {domain} Canlıya Geçiş &amp; Dağıtım Stratejisi
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Test ortamından çıkıp üyelikli sisteme geçmek için <strong>en doğru ve güvenli yöntem</strong>: Önce tüm üyelik ve yetkilendirmeleri burada hazır hale getirmek, ardından Coolify ile tek komutla VPS üzerinde ayağa kaldırmaktır.
          </p>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("coolify")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "coolify" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              1. Coolify Kurulumu
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dns")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "dns" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              2. DNS (jetkur.com.tr)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("docker")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "docker" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              3. Dockerfile &amp; Build
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("env")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "env" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              4. .env Ortam Değişkenleri
            </button>
          </div>
        </div>

        {/* Direct Project ZIP Download Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              📦
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>GitHub &amp; Hostinger VPS İçin Hazır Proje Paketi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Tek Tıkla İndir</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Dockerfile, Express API sunucusu, Vite/React arayüzü ve tüm kaynak kodları tam paket halinde.
              </p>
            </div>
          </div>
          <button
            id="coolify-download-zip-btn"
            type="button"
            onClick={handleDownload}
            disabled={downloadStatus === "downloading"}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              downloadStatus === "downloading"
                ? "bg-indigo-800 cursor-wait opacity-90"
                : downloadStatus === "success"
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            {downloadStatus === "downloading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>Paketleniyor &amp; İndiriliyor...</span>
              </>
            ) : downloadStatus === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>ZIP Başarıyla İndirildi!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>jetkur-com-tr-project.zip İndir</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {activeTab === "coolify" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Neden Şimdi Üyelik Sistemini Entegre Ediyoruz?
                  </h4>
                  <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                    Canlıya aldıktan sonra auth altyapısı kurmak sitenin kesintiye uğramasına veya veritabanı uyuşmazlığına yol açabilir. Burada hem <strong>Müşteri Portali</strong> hem <strong>Yönetici Portali</strong> kimlik doğrulamasını (E-posta + Şifre) tamamlayarak Coolify&apos;a eksiksiz, üretim kalitesinde tek bir paket olarak yüklüyoruz.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Coolify Proje Ekle</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hostinger VPS Coolify panelinize girin: <code>Projects &gt; New Resource &gt; Public/Private Git Repository</code> (GitHub repo bağlantısı yapın).
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Port &amp; Domain Ayarı</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    FQDN alanına <code>https://jetkur.com.tr</code> yazın. Internal Port alanına <code>3000</code> tanımlayın. Coolify Traefik üzerinden otomatik SSL (Let&apos;s Encrypt) sertifikasını çekecektir.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Tek Tıkla Deploy</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    &quot;Deploy&quot; butonuna bastığınızda Docker imajı derlenir ve projeniz <code>https://jetkur.com.tr</code> üzerinde canlıya geçer.
                  </p>
                </div>
              </div>

              {/* Ready Seed Accounts Checklist */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    Önceden Tanımlanmış Canlı Giriş Hesapları (E-posta &amp; Şifre):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>👑 Yönetici (Admin)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">Tam Yetki</span>
                    </div>
                    <div className="font-mono text-slate-700 mt-1">E-posta: admin@jetkur.com.tr</div>
                    <div className="font-mono text-slate-700">Şifre: jetkur2026</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>📦 Müşteri (Client Portal)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Sipariş &amp; Belge</span>
                    </div>
                    <div className="font-mono text-slate-700 mt-1">E-posta: musteri@jetkur.com.tr</div>
                    <div className="font-mono text-slate-700">Şifre: musteri2026</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dns" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Domain DNS Yönlendirmesi (jetkur.com.tr)</div>
                  <p className="mt-1 leading-relaxed">
                    Domain sağlayıcınızın (Hostinger, METUnic veya IHS) DNS yönetim paneline girerek aşağıdaki A kayıtlarını Hostinger VPS IP adresinize yönlendirmelisiniz.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Tür</th>
                      <th className="p-3">Ad / Host</th>
                      <th className="p-3">Değer (Hedef)</th>
                      <th className="p-3">TTL</th>
                      <th className="p-3">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white">
                      <td className="p-3 font-mono font-bold text-indigo-600">A</td>
                      <td className="p-3 font-mono">@</td>
                      <td className="p-3 font-mono font-bold">VPS_IP_ADRESINIZ</td>
                      <td className="p-3 font-mono">300 veya Otomatik</td>
                      <td className="p-3 text-slate-600">Ana domain (jetkur.com.tr)</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-indigo-600">A veya CNAME</td>
                      <td className="p-3 font-mono">www</td>
                      <td className="p-3 font-mono font-bold">VPS_IP_ADRESINIZ (veya jetkur.com.tr)</td>
                      <td className="p-3 font-mono">300 veya Otomatik</td>
                      <td className="p-3 text-slate-600">www.jetkur.com.tr erişimi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "docker" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>Dockerfile (Coolify Otomatik Algılama)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(dockerfileSnippet, "dockerfile")}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedKey === "dockerfile" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "dockerfile" ? "Kopyalandı!" : "Dockerfile Kopyala"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
                {dockerfileSnippet}
              </pre>
            </div>
          )}

          {activeTab === "env" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>.env Ortam Değişkenleri (Coolify Environment Variables)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(envExampleSnippet, "env")}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedKey === "env" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "env" ? "Kopyalandı!" : ".env Kopyala"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {envExampleSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hedef Sunucu: <strong>Hostinger VPS (Coolify Nixpacks / Docker Engine)</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
