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
  Sparkles, 
  KeyRound, 
  Clock,
  Zap,
  Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset } from "../../utils/authStorage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "client" | "admin" | "register" | "login";
  onSuccessRedirect?: (role: "admin" | "team_member" | "client") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = "login",
  onSuccessRedirect
}) => {
  const { login, register } = useAuth();

  // Unified two-tab mode: "login" or "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    initialTab === "register" ? "register" : "login"
  );
  
  // Form fields (clean, no pre-filled test values)
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

  // Reset tab and fields on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === "register" ? "register" : "login");
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsForgotPassword(false);
      setForgotResult(null);
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      setCompanyName("");
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
        }, 500);
      } else {
        setErrorMsg(res.error || "Giriş yapılamadı. Lütfen e-posta ve şifrenizi kontrol edin.");
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
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
        role: "client"
      });

      if (res.success && res.user) {
        setSuccessMsg("14 Günlük Ücretsiz Deneme Hesabınız Oluşturuldu! Panele yönlendiriliyorsunuz...");
        setTimeout(() => {
          onClose();
          if (onSuccessRedirect) {
            onSuccessRedirect("client");
          }
        }, 700);
      } else {
        setErrorMsg(res.error || "Kayıt işlemi gerçekleştirilemedi.");
      }
    } catch {
      setErrorMsg("Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg("Lütfen kayıtlı e-posta adresinizi yazın.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await requestPasswordReset(forgotEmail);
      if (res.success) {
        setForgotResult(res);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Şifre sıfırlama talebi iletilemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kapat (ESC)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              {activeTab === "register" ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <KeyRound className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isForgotPassword 
                  ? "Şifre Sıfırlama" 
                  : activeTab === "register" 
                  ? "14 Gün Ücretsiz Başlayın" 
                  : "JetKur Giriş Yap"}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isForgotPassword
                  ? "Kayıtlı e-posta adresinize geçici şifre oluşturulacaktır."
                  : activeTab === "register"
                  ? "Kredi kartı gerekmez • 1 Adet 0.02s Web Sitesi • Anında Kurulum"
                  : "Yönetim paneline ve web sitenize erişmek için giriş yapın."}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Tab Switcher: Sadece Giriş ve Kayıt */}
        {!isForgotPassword && (
          <div className="flex border-b border-slate-200 bg-slate-100/90 p-1.5 gap-1.5 text-xs font-bold">
            <button
              type="button"
              id="auth-modal-tab-login"
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className={`w-4 h-4 ${activeTab === "login" ? "text-amber-500" : "text-slate-400"}`} />
              <span>Giriş Yap</span>
            </button>

            <button
              type="button"
              id="auth-modal-tab-register"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === "register" ? "text-amber-500" : "text-slate-400"}`} />
              <span>Kayıt Ol (14 Gün Deneme)</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">{successMsg}</div>
            </div>
          )}
        </div>

        {/* Form Body with Scroll */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* 1. FORGOT PASSWORD VIEW */}
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
                    <div className="p-3 bg-white border border-emerald-300 rounded-xl">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Geçici Şifreniz</div>
                      <div className="font-mono text-sm font-black text-slate-900 select-all mt-0.5">
                        {forgotResult.tempPass}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotResult(null);
                      setActiveTab("login");
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer mt-2"
                  >
                    Giriş Ekranına Dön
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kayıtlı E-posta Adresiniz</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="adiniz@sirketiniz.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ← Vazgeç ve Giriş Yap
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isLoading ? "Gönderiliyor..." : "Geçici Şifre Gönder"}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : activeTab === "login" ? (
            /* 2. UNIFIED LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirketiniz.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Şifre</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotEmail(email);
                    }}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <span>Giriş Yapılıyor...</span>
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-500">Hesabınız yok mu? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  14 Gün Ücretsiz Başlayın →
                </button>
              </div>
            </form>
          ) : (
            /* 3. REGISTER FORM (14-DAY TRIAL, 1 WEBSITE QUOTA) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Value Banner */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>14 Gün Tam Erişim Denemesi:</strong> Kredi kartı gerekmez. Hesabınızla <strong>1 adet web sitesi</strong> oluşturup 0.02s hızında Cloudflare Anycast üzerinde test edebilirsiniz.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ad Soyad *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      id="register-name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Telefon Numarası</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      id="register-phone-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">İşletme / Şirket Adı</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="register-company-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Örn: Anadolu Dış Ticaret Ltd."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">E-posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirketiniz.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Şifre Belirleyin * (En az 6 karakter)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-slate-950 text-xs font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 mt-2"
              >
                {isLoading ? (
                  <span>Hesap Oluşturuluyor...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>14 Günlük Denemeyi Başlat (Ücretsiz)</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <span className="text-xs text-slate-500">Zaten bir hesabınız var mı? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-slate-800 hover:underline cursor-pointer"
                >
                  Giriş Yap →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
