import React from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { MOCK_WEEK } from "@/data/mockData";
import MealCard from "@/components/MealCard";
import { Flame, Droplets, Wheat } from "lucide-react";
import { filterSafeMeals } from "@/lib/mealValidator";

const TodayPage: React.FC = () => {
  const { user } = useApp();
  const rawToday = MOCK_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  
  // HARD CONSTRAINT: filter out meals violating user restrictions
  const safeMeals = filterSafeMeals(
    rawToday.meals,
    user?.restrictions || [],
    user?.dontEat || [],
    user?.customRestrictions || []
  );
  const today = {
    ...rawToday,
    meals: safeMeals,
    totalCalories: safeMeals.reduce((s, m) => s + m.calories, 0),
  };
  const goalLabels = { weight_loss: "Emagrecimento", health: "Saúde Geral", muscle_gain: "Ganho de Massa" };

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      {/* Header */}
      <div className="bg-gradient-teal px-6 pt-6 pb-8 rounded-b-3xl">
        <p className="text-primary-foreground/80 text-sm">Olá, {user?.name || "👋"}</p>
        <h1 className="text-xl font-bold text-primary-foreground mt-1">Seu cardápio de hoje</h1>
        <p className="text-primary-foreground/70 text-xs mt-1">{today.day} • {goalLabels[user?.goal || "health"]}</p>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          {[
            { label: "Calorias", value: `${today.totalCalories}`, icon: Flame },
            { label: "Proteína", value: `${today.meals.reduce((s, m) => s + m.protein, 0)}g`, icon: Droplets },
            { label: "Carbos", value: `${today.meals.reduce((s, m) => s + m.carbs, 0)}g`, icon: Wheat },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-primary-foreground/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <s.icon className="w-4 h-4 text-primary-foreground/80 mx-auto mb-1" />
              <p className="text-lg font-bold text-primary-foreground">{s.value}</p>
              <p className="text-[10px] text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="px-4 -mt-4 space-y-3">
        {today.meals.map(meal => (
          <MealCard key={meal.id} meal={meal} showSwap={false} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default TodayPage;
