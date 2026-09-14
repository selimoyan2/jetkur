import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  KeyRound, 
  HelpCircle,
  Truck,
  Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset } from "../../utils/authStorage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "client" | "admin" | "register";
  onSuccessRedirect?: (role: "admin" | "team_member" | "client") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = "client",
  onSuccessRedirect
}) => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<"client" | "admin" | "register">(initialTab);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password sub-state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotResult, setForgotResult] = useState<{ message: string; tempPass?: string } | null>(null);

  // Reset tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsForgotPassword(false);
      setForgotResult(null);
      // Pre-fill email depending on tab
      if (initialTab === "admin") {
        setEmail("admin@jetkur.com.tr");
        setPassword("jetkur2026");
      } else if (initialTab === "client") {
        setEmail("musteri@jetkur.com.tr");
        setPassword("musteri2026");
      } else {
        setEmail("");
        setPassword("");
      }
    }
  }, [isOpen, initialTab]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1-Click Fast Fill for quick testing
  const handleQuickAutofill = (role: "admin" | "client" | "team") => {
    setErrorMsg(null);
    if (role === "admin") {
      setActiveTab("admin");
      setEmail("admin@jetkur.com.tr");
      setPassword("jetkur2026");
    } else if (role === "client") {
      setActiveTab("client");
      setEmail("musteri@jetkur.com.tr");
      setPassword("musteri2026");
    } else {
      setActiveTab("admin");
      setEmail("ekip@jetkur.com.tr");
      setPassword("ekip2026");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        setSuccessMsg(`Hoş geldiniz, ${res.user.name}! Giriş başarılı.`);
        setTimeout(() => {
          onClose();
          if (onSuccessRedirect) {
            onSuccessRedirect(res.user.role);
          }
        }, 600);
      } else {
        setErrorMsg(res.error || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch {
      setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        phone,
        companyName,
        role: "client" // Public self-registration is client role
      });

      if (res.success && res.user) {
        setSuccessMsg(`Hesabınız başarıyla oluşturuldu! Hoş geldiniz ${res.user.name}.`);
        setTimeout(() => {
          onClose();
          if (onSuccessRedirect) {
            onSuccessRedirect("client");
          }
        }, 600);
      } else {
        setErrorMsg(res.error || "Kayıt işlemi tamamlanamadı.");
      }
    } catch {
      setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(forgotEmail || email);
      if (res.success) {
        setForgotResult({ message: res.message, tempPass: res.tempPass });
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Şifre sıfırlama işlemi sırasında bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="jetkur-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="jetkur-auth-modal-card"
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                JetKur Güvenli Kimlik Doğrulama
              </div>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                {isForgotPassword 
                  ? "Şifremi Unuttum" 
                  : activeTab === "register" 
                  ? "Yeni Müşteri Hesabı Oluştur" 
                  : activeTab === "admin" 
                  ? "Yönetici & Personel Girişi" 
                  : "Müşteri Portali Girişi"}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2">
            {isForgotPassword
              ? "Kayıtlı e-posta adresinize tek kullanımlık geçici şifre oluşturulacaktır."
              : activeTab === "register"
              ? "Siparişlerinizi takip etmek, teklif almak ve belgeleri görüntülemek için kayıt olun."
              : activeTab === "admin"
              ? "JetKur CMS, site içerikleri, SEO ve müşteri taleplerini yönetmek için giriş yapın."
              : "Sipariş durumunuzu, sevk irsaliyelerini ve proje faturalarınızı inceleyin."}
          </p>

          {/* Quick Demo Pre-fill Badges */}
          {!isForgotPassword && (
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 font-semibold mr-1">Hızlı Doldur (Test):</span>
              <button
                type="button"
                onClick={() => handleQuickAutofill("admin")}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-amber-300 font-bold transition-colors cursor-pointer"
              >
                Admin (Yönetici)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAutofill("client")}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 font-bold transition-colors cursor-pointer"
              >
                Müşteri (Ahmet Y.)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAutofill("team")}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-indigo-300 font-bold transition-colors cursor-pointer"
              >
                Operasyon
              </button>
            </div>
          )}
        </div>

        {/* Modal Tab Switcher */}
        {!isForgotPassword && (
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("client");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "client"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Müşteri Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "admin"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Yönetici &amp; Ekip</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kayıt Ol</span>
            </button>
          </div>
        )}

        {/* Feedback alerts */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">{successMsg}</div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {forgotResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Şifre Sıfırlama Başarılı</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {forgotResult.message}
                  </p>
                  {forgotResult.tempPass && (
                    <div className="p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-slate-900 flex items-center justify-between">
                      <span className="text-slate-500">Geçici Şifreniz:</span>
                      <strong className="text-indigo-600 font-bold">{forgotResult.tempPass}</strong>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotResult(null);
                      if (forgotResult.tempPass) setPassword(forgotResult.tempPass);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Giriş Ekranına Dön
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kayıtlı E-posta Adresiniz *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ad@jetkur.com.tr veya musteri@..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ← Geri Dön
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <span>{isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : activeTab === "register" ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adınız ve Soyadınız *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Mehmet Özkan"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-posta Adresiniz *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirketiniz.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0532 000 00 00"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firma Unvanı (Varsa)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Firma Ltd."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  <span>{isLoading ? "Hesap Oluşturuluyor..." : "Kayıt Ol ve Giriş Yap"}</span>
                </button>
              </div>

              <div className="text-center pt-1 text-[11px] text-slate-500">
                Zaten bir hesabınız var mı?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("client")}
                  className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  Giriş Yap
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN FORM (CLIENT OR ADMIN) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-posta Adresi *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === "admin" ? "admin@jetkur.com.tr" : "musteri@jetkur.com.tr"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Şifre *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotPassword(true);
                      setErrorMsg(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 ${
                    activeTab === "admin"
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                      : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? "Kontrol Ediliyor..."
                      : activeTab === "admin"
                      ? "Yönetici Paneline Güvenli Giriş Yap"
                      : "Müşteri Portaline Giriş Yap"}
                  </span>
                </button>
              </div>

              {activeTab === "client" && (
                <div className="text-center pt-2 text-[11px] text-slate-500">
                  Henüz müşteri hesabınız yok mu?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Hemen Kayıt Olun
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Security Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Şifreli Oturum</span>
            </span>
            <span className="font-mono text-slate-500">jetkur.com.tr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
