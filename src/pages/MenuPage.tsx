import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import MealCard from "@/components/MealCard";
import { MOCK_RECIPES, MOCK_WEEK, SWAP_OPTIONS } from "@/data/mockData";
import { ChevronDown, ShoppingCart, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkVariety } from "@/lib/mealValidator";
import { buildWeeklyMenu, swapMealInWeek, type PlannerPreferences } from "@/lib/menuPlanner";

const MenuPage: React.FC = () => {
  const { user, isPremium, updateUser } = useApp();
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState(0);
  const [swapModal, setSwapModal] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [limitModal, setLimitModal] = useState(false);

  const plannerPreferences = useMemo<PlannerPreferences>(() => ({
    restrictions: user?.restrictions || [],
    dontEat: user?.dontEat || [],
    customRestrictions: user?.customRestrictions || [],
    acceptZeroLactose: user?.acceptZeroLactose ?? true,
    allowMealPrep: user?.allowMealPrep || false,
  }), [user?.restrictions, user?.dontEat, user?.customRestrictions, user?.acceptZeroLactose, user?.allowMealPrep]);

  const plannedWeek = useMemo(
    () => buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, plannerPreferences),
    [plannerPreferences]
  );

  const [weekPlan, setWeekPlan] = useState(plannedWeek);

  useEffect(() => {
    setWeekPlan(plannedWeek);
  }, [plannedWeek]);

  const varietyWarnings = useMemo(() => {
    return checkVariety(
      weekPlan.map((day) => ({ day: day.day, meals: day.meals })),
      user?.allowMealPrep || false
    );
  }, [weekPlan, user?.allowMealPrep]);

  const swapsLeft = (user?.maxSwaps || 5) - (user?.swapsUsed || 0);

  const closeSwapModal = () => {
    setSwapModal(null);
    setSwapError(null);
  };

  const handleSwap = (mealId: string) => {
    if (!isPremium && swapsLeft <= 0) {
      setLimitModal(true);
      return;
    }

    setSwapError(null);
    setSwapModal(mealId);
  };

  const doSwap = (optionLabel: string) => {
    if (!swapModal) return;

    setSwapping(true);
    setTimeout(() => {
      const result = swapMealInWeek(weekPlan, swapModal, optionLabel, MOCK_RECIPES, plannerPreferences);

      if (result.swapped) {
        setWeekPlan(result.week);
        if (!isPremium) updateUser({ swapsUsed: (user?.swapsUsed || 0) + 1 });
        closeSwapModal();
      } else {
        setSwapError("Não encontramos outra opção compatível para esta refeição.");
      }

      setSwapping(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Seu cardápio da semana</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isPremium ? "Trocas ilimitadas" : `${swapsLeft} trocas restantes esta semana`}
        </p>
      </div>

      {varietyWarnings.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-xs text-foreground">
            <p className="font-semibold">Pouca variedade detectada</p>
            {varietyWarnings.map((warning) => (
              <p key={warning.ingredient} className="text-muted-foreground mt-0.5">
                "{warning.ingredient}" aparece em {warning.count} dias
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 mt-4 space-y-2">
        {weekPlan.map((day, idx) => (
          <div key={day.day} className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
              className="w-full flex items-center justify-between p-4 min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-mint/30 flex items-center justify-center text-sm font-bold text-primary">{day.dayShort}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">{day.day}</p>
                  <p className="text-xs text-muted-foreground">{day.totalCalories} kcal</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedDay === idx ? "rotate-180" : ""}`} />
            </button>

            {expandedDay === idx && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in">
                {day.meals.length > 0 ? (
                  day.meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} onSwap={() => handleSwap(meal.id)} swapsLeft={isPremium ? undefined : swapsLeft} />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p>Nenhuma refeição disponível com suas restrições.</p>
                    <p className="text-xs mt-1">Ajuste suas preferências na conta.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!isPremium && (
        <div className="mx-4 mt-4 p-4 bg-gradient-premium rounded-xl text-center">
          <p className="text-primary-foreground font-semibold text-sm">⭐ Premium: trocas ilimitadas + 500+ receitas</p>
          <p className="text-primary-foreground/80 text-xs mt-1">R$ 19,90/mês</p>
        </div>
      )}

      <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40">
        <button
          onClick={() => navigate("/shopping")}
          className="w-full py-3.5 bg-gradient-teal text-primary-foreground font-semibold rounded-xl shadow-card-hover flex items-center justify-center gap-2 min-h-[52px]"
        >
          <ShoppingCart className="w-5 h-5" /> Gerar Lista de Compras
        </button>
      </div>

      {swapModal && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => !swapping && closeSwapModal()}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 animate-slide-up shadow-modal" onClick={(e) => e.stopPropagation()}>
            {swapping ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-mint/30 mx-auto mb-3 skeleton-shimmer" />
                <p className="text-sm text-muted-foreground">Encontrando opção ideal...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Trocar refeição</h3>
                  <button onClick={closeSwapModal} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Fechar">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {swapError && <p className="text-sm text-destructive mb-3">{swapError}</p>}

                <div className="space-y-2">
                  {SWAP_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => doSwap(option.label)}
                      className="w-full flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-mint/20 transition-colors min-h-[52px]"
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {limitModal && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-6" onClick={() => setLimitModal(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <p className="text-4xl mb-3">⭐</p>
              <h3 className="text-lg font-bold text-foreground">Limite atingido</h3>
              <p className="text-sm text-muted-foreground mt-2">Você usou todas as suas trocas gratuitas desta semana.</p>
              <button className="w-full mt-4 py-3 bg-gradient-premium text-primary-foreground font-semibold rounded-xl min-h-[48px]">
                Upgrade Premium — R$ 19,90/mês
              </button>
              <button onClick={() => setLimitModal(false)} className="w-full mt-2 py-3 text-sm text-muted-foreground min-h-[44px]">Agora não</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MenuPage;

