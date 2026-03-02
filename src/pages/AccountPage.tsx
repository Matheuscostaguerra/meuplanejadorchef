import React from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PremiumBadge from "@/components/PremiumBadge";
import { User, Settings, RefreshCw, Clock, HelpCircle, LogOut, ChevronRight, Star, Shield } from "lucide-react";

const AccountPage: React.FC = () => {
  const { user, isPremium, logout } = useApp();
  const navigate = useNavigate();

  const planLabels = { free: "Plano Básico", premium: "Premium", test: "Acesso Total (Teste)" };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { label: "Refazer preferências", icon: RefreshCw, action: () => navigate("/onboarding") },
    { label: "Histórico de cardápios", icon: Clock, premium: true },
    { label: "Configurações", icon: Settings },
    { label: "Suporte", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Sua conta</h1>
      </div>

      {/* Profile */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl shadow-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-teal flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.plan === "test" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Shield className="w-3.5 h-3.5" /> Acesso Total
                </span>
              ) : isPremium ? (
                <PremiumBadge />
              ) : (
                <span className="text-xs text-muted-foreground">{planLabels[user?.plan || "free"]}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade card */}
      {!isPremium && (
        <div className="px-4 mt-4">
          <div className="bg-gradient-premium rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary-foreground fill-primary-foreground/30" />
              <h3 className="font-bold text-primary-foreground">Upgrade Premium</h3>
            </div>
            <ul className="space-y-1.5 mb-4">
              {["Cardápios ilimitados", "Trocas ilimitadas", "Exportar PDF", "Receitas gourmet", "Preços otimizados"].map(b => (
                <li key={b} className="text-primary-foreground/90 text-xs flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary-foreground/60" /> {b}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground font-semibold rounded-xl min-h-[48px] border border-primary-foreground/20">
              R$ 19,90/mês
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl shadow-card divide-y divide-border overflow-hidden">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-4 min-h-[52px] hover:bg-muted/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground text-left">{item.label}</span>
              {item.premium && !isPremium && <PremiumBadge text="" />}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 bg-card rounded-xl shadow-card min-h-[52px] hover:bg-muted/50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Sair</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
