import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { MOCK_RECIPES, MOCK_WEEK } from "@/data/mockData";
import MealCard from "@/components/MealCard";
import { Flame, Droplets, Wheat } from "lucide-react";
import { buildWeeklyMenu, type PlannerPreferences } from "@/lib/menuPlanner";

const TodayPage: React.FC = () => {
  const { user } = useApp();

  const plannerPreferences = useMemo<PlannerPreferences>(() => ({
    restrictions: user?.restrictions || [],
    dontEat: user?.dontEat || [],
    customRestrictions: user?.customRestrictions || [],
    acceptZeroLactose: user?.acceptZeroLactose ?? true,
    allowMealPrep: user?.allowMealPrep || false,
  }), [user?.restrictions, user?.dontEat, user?.customRestrictions, user?.acceptZeroLactose, user?.allowMealPrep]);

  const weekPlan = useMemo(
    () => buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, plannerPreferences),
    [plannerPreferences]
  );

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const today = weekPlan[todayIndex];
  const goalLabels = { weight_loss: "Emagrecimento", health: "Saúde Geral", muscle_gain: "Ganho de Massa" };

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      <div className="bg-gradient-teal px-6 pt-6 pb-8 rounded-b-3xl">
        <p className="text-primary-foreground/80 text-sm">Olá, {user?.name || "👋"}</p>
        <h1 className="text-xl font-bold text-primary-foreground mt-1">Seu cardápio de hoje</h1>
        <p className="text-primary-foreground/70 text-xs mt-1">{today.day} • {goalLabels[user?.goal || "health"]}</p>

        <div className="flex gap-3 mt-4">
          {[
            { label: "Calorias", value: `${today.totalCalories}`, icon: Flame },
            { label: "Proteína", value: `${today.meals.reduce((sum, meal) => sum + meal.protein, 0)}g`, icon: Droplets },
            { label: "Carbos", value: `${today.meals.reduce((sum, meal) => sum + meal.carbs, 0)}g`, icon: Wheat },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 bg-primary-foreground/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <stat.icon className="w-4 h-4 text-primary-foreground/80 mx-auto mb-1" />
              <p className="text-lg font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-[10px] text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {today.meals.length > 0 ? (
          today.meals.map((meal) => <MealCard key={meal.id} meal={meal} showSwap={false} />)
        ) : (
          <div className="bg-card rounded-xl p-4 text-sm text-muted-foreground shadow-card">Nenhuma refeição compatível encontrada para hoje.</div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TodayPage;

