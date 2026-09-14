import React from "react";
import { ShieldCheck, Users, KeyRound, ArrowRight, Truck, Lock } from "lucide-react";
import { SiteConfig } from "../../types";
import { getRegisteredUsers } from "../../utils/authStorage";

interface UserAuthQuickCardProps {
  config: SiteConfig;
  onOpenWorkspace: () => void;
  onOpenClientPortal: () => void;
}

export const UserAuthQuickCard: React.FC<UserAuthQuickCardProps> = ({
  config,
  onOpenWorkspace,
  onOpenClientPortal
}) => {
  const users = getRegisteredUsers();
  const adminCount = users.filter((u) => u.role === "admin" || u.role === "team_member").length;
  const clientCount = users.filter((u) => u.role === "client").length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-indigo-900/40 p-5 text-white shadow-md relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Canlı Oturum &amp; Üyelik
              </span>
              <span className="text-xs text-indigo-300 font-mono">jetkur.com.tr</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              Kullanıcı Giriş &amp; İki Yönlü Portal Altyapısı
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {clientCount} Müşteri Hesabı, {adminCount} Yönetici/Ekip Hesabı tanımlı. Sadece e-posta &amp; şifre ile güvenli oturum.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenClientPortal}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Müşteri Portali Görünümü"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Müşteri Portali</span>
          </button>

          <button
            type="button"
            onClick={onOpenWorkspace}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>Yetki &amp; Hesap Yönetimi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
