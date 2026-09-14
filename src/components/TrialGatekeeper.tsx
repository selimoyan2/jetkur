import React, { useState } from "react";
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Clock,
  Gauge
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface TrialGatekeeperProps {
  onBackToMarketing: () => void;
  targetViewName?: string;
}

export const TrialGatekeeper: React.FC<TrialGatekeeperProps> = ({
  onBackToMarketing,
  targetViewName = "Yönetim Paneli"
}) => {
  const { register, openAuthModal } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        companyName,
        phone,
        role: "client"
      });

      if (!res.success) {
        setErrorMsg(res.error || "Kayıt sırasında bir hata oluştu.");
      }
      // On success, AuthContext automatically updates user session and App.tsx renders the target panel!
    } catch {
      setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Value Proposition & Curiosity Hook */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>14 Günlük Ücretsiz Deneme Gereklidir</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Dünyanın En Hızlı Web Sitesini{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              14 Gün Ücretsiz
            </span>{" "}
            Yönetin.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            <strong className="text-white">{targetViewName}</strong> bileşenlerine erişmek ve kendi işletmenizin 
            0.02s hızındaki web sitesini oluşturmak için e-posta ve şifrenizle 10 saniyede hesabınızı başlatın.
          </p>

          {/* Speed & Tech Assurance Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-amber-400 font-black text-xl flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-current" />
                <span>0.02s TTFB</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Global Anycast Edge CDN ile ışık hızında açılış
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-emerald-400 font-black text-xl flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>100/100</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Google PageSpeed & Core Web Vitals tam puanı
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Kredi kartı bilgisi <strong>istenmez</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>14 gün boyunca tüm CMS, SEO ve lead araçları sınırsız açık</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sıfır SQL mimarisi ile asla çökmez ve hacklenemez</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToMarketing}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Ana Sayfaya Dön (Tanıtım & Testler)</span>
            </button>
          </div>
        </div>

        {/* Right column: 14-Day Free Trial Registration Card */}
        <div className="lg:col-span-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-amber-500/40 shadow-2xl backdrop-blur-md relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>14 Günlük Deneme Başlat</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">E-posta ve şifrenizle anında üye olun</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black">
                ÜCRETSİZ
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Adınız ve Soyadınız *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Selim Oyan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    İşletme / Şirket Adınız *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: Oyan Ltd."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Telefon / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0532 000 00 00"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-posta Adresiniz (Giriş için) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirketiniz.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Şifre Belirleyin (En az 6 karakter) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-[0.99] text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isLoading ? "Hesap Hazırlanıyor..." : "14 Günlük Ücretsiz Denemeyi Başlat"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-400">
                Zaten kayıtlı bir hesabınız var mı?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("client")}
                  className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 cursor-pointer"
                >
                  Giriş Yapın
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
