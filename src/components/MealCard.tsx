import React from "react";
import { Clock, Flame, RefreshCw } from "lucide-react";
import type { Meal } from "@/data/mockData";

interface MealCardProps {
  meal: Meal;
  onSwap?: () => void;
  swapsLeft?: number;
  showSwap?: boolean;
  portionMultiplier?: number;
}

const mealTypeLabels: Record<string, string> = {
  cafe: "Café da Manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  ceia: "Ceia",
};

const MealCard: React.FC<MealCardProps> = ({ meal, onSwap, swapsLeft, showSwap = true, portionMultiplier }) => {
  const mult = portionMultiplier || meal.portionMultiplier || 1;
  const displayCalories = Math.round(meal.calories * mult);
  const showMultiplier = mult !== 1;

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg shadow-card animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
        {meal.type === "cafe" ? "☕" : meal.type === "almoco" ? "🍛" : meal.type === "lanche" ? "🍌" : meal.type === "jantar" ? "🥗" : "🌙"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{mealTypeLabels[meal.type]}</p>
        <p className="text-sm font-semibold text-foreground truncate">{meal.name}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{meal.prepTime}min</span>
          <span className="inline-flex items-center gap-1"><Flame className="w-3 h-3" />{displayCalories}kcal</span>
          {showMultiplier && (
            <span className="inline-flex items-center gap-1 text-accent font-medium">{mult}x porção</span>
          )}
        </div>
      </div>
      {showSwap && (
        <button
          onClick={onSwap}
          className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-3 py-2 rounded-lg min-h-[44px] hover:bg-primary/20 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Trocar
        </button>
      )}
    </div>
  );
};

export default MealCard;
