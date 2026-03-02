import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CalendarDays, UtensilsCrossed, ShoppingCart, BookOpen, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import PremiumBadge from "./PremiumBadge";

const tabs = [
  { path: "/today", label: "Hoje", icon: CalendarDays },
  { path: "/menu", label: "Cardápio", icon: UtensilsCrossed },
  { path: "/shopping", label: "Compras", icon: ShoppingCart, premiumBadge: true },
  { path: "/recipes", label: "Receitas", icon: BookOpen },
  { path: "/account", label: "Conta", icon: User },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] min-w-[56px] transition-colors relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.premiumBadge && isPremium && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-coral" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
