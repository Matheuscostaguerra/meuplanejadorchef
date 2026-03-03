import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { MOCK_RECIPES } from "@/data/mockData";
import type { Recipe } from "@/data/mockData";
import { Search, Clock, Flame, X, Lock } from "lucide-react";
import SelectableChip from "@/components/SelectableChip";
import PremiumBadge from "@/components/PremiumBadge";
import { filterSafeMeals } from "@/lib/mealValidator";

const RecipesPage: React.FC = () => {
  const { isPremium, user } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filters = ["Todas", "Rápida", "Proteica", "Fit", "Sem Glúten"];

  // HARD CONSTRAINT: filter recipes through restriction validator
  const safeRecipes = useMemo(() => {
    return filterSafeMeals(
      MOCK_RECIPES.map(r => ({ ...r, ingredients: r.ingredients })),
      user?.restrictions || [],
      user?.dontEat || [],
      user?.customRestrictions || [],
      user?.acceptZeroLactose ?? true
    ) as typeof MOCK_RECIPES;
  }, [user?.restrictions, user?.dontEat, user?.customRestrictions, user?.acceptZeroLactose]);

  const filtered = safeRecipes.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !activeFilter || activeFilter === "Todas" || r.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
    return matchSearch && matchFilter;
  });

  const openRecipe = (r: Recipe) => {
    if (r.premium && !isPremium) return;
    setSelectedRecipe(r);
  };

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Suas receitas</h1>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar receita..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(f => (
            <SelectableChip
              key={f}
              label={f}
              selected={activeFilter === f || (!activeFilter && f === "Todas")}
              onClick={() => setActiveFilter(f === "Todas" ? null : f)}
            />
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {filtered.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => openRecipe(recipe)}
            className="bg-card rounded-xl shadow-card overflow-hidden text-left transition-all hover:shadow-card-hover relative"
          >
            <div className="h-28 bg-mint/20 flex items-center justify-center text-4xl">
              {recipe.category === "Café da Manhã" ? "☕" : recipe.category === "Almoço" ? "🍛" : recipe.category === "Lanche" ? "🍌" : "🥗"}
            </div>
            {recipe.premium && !isPremium && (
              <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center backdrop-blur-[1px]">
                <Lock className="w-6 h-6 text-foreground/50" />
              </div>
            )}
            {recipe.premium && <div className="absolute top-2 right-2"><PremiumBadge text="" /></div>}
            <div className="p-3">
              <p className="text-sm font-semibold text-foreground line-clamp-2">{recipe.name}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" />{recipe.time}min</span>
                <span>•</span>
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-muted-foreground text-sm">Nenhuma receita encontrada</p>
        </div>
      )}

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card px-6 pt-5 pb-3 flex items-center justify-between border-b border-border">
              <h3 className="font-bold text-foreground text-lg">{selectedRecipe.name}</h3>
              <button onClick={() => setSelectedRecipe(null)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Fechar"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="px-6 py-4 space-y-5">
              {/* Stats */}
              <div className="flex gap-3">
                {[
                  { label: "Calorias", value: `${selectedRecipe.calories}`, icon: "🔥" },
                  { label: "Proteína", value: `${selectedRecipe.protein}g`, icon: "💪" },
                  { label: "Tempo", value: `${selectedRecipe.time}min`, icon: "⏱️" },
                ].map(s => (
                  <div key={s.label} className="flex-1 bg-mint/20 rounded-xl p-3 text-center">
                    <p className="text-lg">{s.icon}</p>
                    <p className="font-bold text-sm text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Ingredientes</h4>
                <ul className="space-y-1.5">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Modo de Preparo</h4>
                <ol className="space-y-3">
                  {selectedRecipe.steps.map((st, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="text-foreground pt-0.5">{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default RecipesPage;
