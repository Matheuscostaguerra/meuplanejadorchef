import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { MOCK_SHOPPING, CATEGORY_LABELS } from "@/data/mockData";
import type { ShoppingItem } from "@/data/mockData";
import { ChevronDown, FileText, ShoppingCart } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";

const ShoppingPage: React.FC = () => {
  const { isPremium } = useApp();
  const [items, setItems] = useState<ShoppingItem[]>(MOCK_SHOPPING);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>;

  const toggleCheck = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const toggleCollapse = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  const checked = items.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-background pb-36 safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Sua lista de compras</h1>
        <p className="text-sm text-muted-foreground mt-1">{checked}/{items.length} itens marcados{isPremium && ` • Total estimado: R$ ${total.toFixed(2)}`}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          const info = CATEGORY_LABELS[cat];
          return (
            <div key={cat} className="bg-card rounded-xl shadow-card overflow-hidden">
              <button
                onClick={() => toggleCollapse(cat)}
                className="w-full flex items-center justify-between p-4 min-h-[48px]"
              >
                <span className="font-semibold text-sm text-foreground">{info.emoji} {info.label} <span className="text-muted-foreground font-normal">({catItems.length})</span></span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed[cat] ? "rotate-180" : ""}`} />
              </button>
              {!collapsed[cat] && (
                <div className="px-4 pb-3 space-y-1 animate-fade-in">
                  {catItems.map(item => (
                    <label key={item.id} className="flex items-center gap-3 py-2 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-5 h-5 rounded accent-primary shrink-0"
                      />
                      <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">{item.quantity} {item.unit}</span>
                      {isPremium && item.price && (
                        <span className="text-xs font-medium text-primary shrink-0">R$ {item.price.toFixed(2)}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40 space-y-2">
        {isPremium ? (
          <>
            <button className="w-full py-3 bg-gradient-teal text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 min-h-[48px] shadow-card-hover">
              <FileText className="w-4 h-4" /> Exportar PDF
            </button>
            <button className="w-full py-3 bg-gradient-premium text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 min-h-[48px] shadow-card-hover">
              <ShoppingCart className="w-4 h-4" /> Enviar para Supermercado
            </button>
          </>
        ) : (
          <div className="p-3 bg-card rounded-xl shadow-card text-center border border-border">
            <PremiumBadge text="Desbloqueie preços estimados e exportação PDF" />
            <button className="mt-2 text-sm font-semibold text-coral">Upgrade Premium →</button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingPage;
