import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  RefreshCw, 
  Check, 
  Copy,
  ExternalLink,
  Truck,
  Shield,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { AuthUser, UserRole, SiteConfig } from "../../types";
import { 
  getRegisteredUsers, 
  registerNewUser, 
  requestPasswordReset 
} from "../../utils/authStorage";
import { useAuth } from "../../context/AuthContext";

interface UserAuthManagementProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onOpenClientPortal?: () => void;
}

export const UserAuthManagement: React.FC<UserAuthManagementProps> = ({
  config,
  onChange,
  onOpenClientPortal
}) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New user form state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("client");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserCompany, setNewUserCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Alert states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load registered users from storage
  const loadUsers = () => {
    setUsers(getRegisteredUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = await registerNewUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      phone: newUserPhone,
      companyName: newUserCompany
    });

    if (res.success) {
      setSuccessMsg(`Yeni ${newUserRole === "admin" ? "Yönetici" : newUserRole === "team_member" ? "Ekip Üyesi" : "Müşteri"} hesabı (${newUserEmail}) başarıyla oluşturuldu.`);
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserPhone("");
      setNewUserCompany("");
      loadUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || "Kullanıcı oluşturulamadı.");
    }
  };

  const handleResetPassword = async (email: string) => {
    const res = await requestPasswordReset(email);
    if (res.success) {
      setSuccessMsg(`${email} için geçici şifre: ${res.tempPass || "oluşturuldu"}`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Canlı Kimlik Doğrulama
              </span>
              <span className="text-xs text-indigo-300 font-mono font-bold">jetkur.com.tr</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kullanıcı Giriş &amp; Yetki Yönetimi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hem <strong>Müşteri Portali</strong> (sipariş ve teklif takibi) hem de <strong>Yönetici &amp; Şirket İçi Ekip Portali</strong> (CMS &amp; operasyon) kullanıcılarını yönetin. Şimdilik sadece e-posta ve şifre ile güvenli oturum sağlanmaktadır.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yeni Kullanıcı Ekle</span>
            </button>

            {onOpenClientPortal && (
              <button
                type="button"
                onClick={onOpenClientPortal}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/15"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Müşteri Portaline Git</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Yönetici &amp; Personel</div>
            <div className="text-2xl font-black text-slate-900">
              {users.filter((u) => u.role === "admin" || u.role === "team_member").length}
            </div>
            <div className="text-[10px] text-slate-400">admin@jetkur.com.tr</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Kayıtlı Müşteriler</div>
            <div className="text-2xl font-black text-slate-900">
              {users.filter((u) => u.role === "client").length}
            </div>
            <div className="text-[10px] text-slate-400">musteri@jetkur.com.tr</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Doğrulama Modu</div>
            <div className="text-sm font-black text-emerald-600 mt-1">E-Posta &amp; Şifre (Aktif)</div>
            <div className="text-[10px] text-slate-400">256-bit oturum anahtarı</div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Yeni Kullanıcı Hesabı Tanımla</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hesap Türü / Yetki *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserRole("client")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      newUserRole === "client"
                        ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Müşteri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewUserRole("team_member")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      newUserRole === "team_member"
                        ? "bg-sky-600 text-white border-sky-700 font-black shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Operasyon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewUserRole("admin")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      newUserRole === "admin"
                        ? "bg-indigo-600 text-white border-indigo-700 font-black shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Yönetici</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Örn: Serdar Kaya"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="serdar@firma.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giriş Şifresi *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="0532..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Firma Adı</label>
                  <input
                    type="text"
                    value={newUserCompany}
                    onChange={(e) => setNewUserCompany(e.target.value)}
                    placeholder="Firma Unvanı"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kullanıcıyı Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Kayıtlı Kullanıcılar</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {filteredUsers.length} hesap
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim, e-posta veya firma ara..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-indigo-500 outline-none w-48 sm:w-60"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setRoleFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  roleFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("client")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  roleFilter === "client" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Müşteri
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("admin")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  roleFilter === "admin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Yönetici
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4">Kullanıcı &amp; Firma</th>
                <th className="p-4">Yetki / Rol</th>
                <th className="p-4">İletişim</th>
                <th className="p-4">Son Giriş</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const roleBadge = {
                  admin: { label: "Yönetici (Admin)", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                  team_member: { label: "Operasyon Ekibi", style: "bg-sky-50 text-sky-700 border-sky-200" },
                  client: { label: "Müşteri", style: "bg-amber-50 text-amber-800 border-amber-200" }
                }[u.role];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            Siz
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {u.companyName || "Şahıs Hesabı"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.style}`}>
                        {roleBadge.label}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-700 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(u.lastLoginAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Aktif</span>
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(u.email)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        title="Geçici Şifre Sıfırla"
                      >
                        Şifre Sıfırla
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
