import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import MealCard from "@/components/MealCard";
import { MOCK_RECIPES, MOCK_WEEK, SWAP_OPTIONS } from "@/data/mockData";
import { ChevronDown, ShoppingCart, X, AlertTriangle, Info, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkVariety } from "@/lib/mealValidator";
import { buildWeeklyMenu, swapMealInWeek, type PlannerPreferences } from "@/lib/menuPlanner";
import { auditWeek, type AuditedDay } from "@/lib/calorieAuditor";
import { estimateWeeklyCost, auditBudget, type BudgetAuditResult } from "@/lib/costEstimator";
import { getSwapCandidates, type SwapCandidate } from "@/lib/swapCandidates";

type SwapStrategy = "similar" | "protein" | "budget" | "fast" | "avoid";

function mapOptionToStrategy(label: string): SwapStrategy {
  const n = label.toLowerCase();
  if (n.includes("proteína") || n.includes("proteina")) return "protein";
  if (n.includes("econômica") || n.includes("economica")) return "budget";
  if (n.includes("rápida") || n.includes("rapida")) return "fast";
  if (n.includes("ingrediente")) return "avoid";
  return "similar";
}

const MenuPage: React.FC = () => {
  const { user, isPremium, updateUser } = useApp();
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState(0);
  const [swapModal, setSwapModal] = useState<string | null>(null);
  const [swapStep, setSwapStep] = useState<"strategy" | "candidates">("strategy");
  const [swapCandidates, setSwapCandidates] = useState<SwapCandidate[]>([]);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [limitModal, setLimitModal] = useState(false);
  const [showAdjustNotice, setShowAdjustNotice] = useState(false);

  const targetCaloriesDay = user?.caloricTarget || 2000;

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

  // Calorie auditor
  const auditResult = useMemo(
    () => auditWeek(weekPlan, targetCaloriesDay, 5),
    [weekPlan, targetCaloriesDay]
  );

  // Budget auditor
  const weeklyCost = useMemo(() => estimateWeeklyCost(weekPlan), [weekPlan]);
  const budgetResult = useMemo<BudgetAuditResult>(
    () => auditBudget(weeklyCost, user?.budget || 200),
    [weeklyCost, user?.budget]
  );

  const varietyWarnings = useMemo(() => {
    return checkVariety(
      weekPlan.map((day) => ({ day: day.day, meals: day.meals })),
      user?.allowMealPrep || false
    );
  }, [weekPlan, user?.allowMealPrep]);

  const swapsLeft = (user?.maxSwaps || 5) - (user?.swapsUsed || 0);

  const closeSwapModal = () => {
    setSwapModal(null);
    setSwapStep("strategy");
    setSwapCandidates([]);
    setSwapError(null);
  };

  const handleSwap = (mealId: string) => {
    if (!isPremium && swapsLeft <= 0) {
      setLimitModal(true);
      return;
    }
    setSwapError(null);
    setSwapModal(mealId);
    setSwapStep("strategy");
  };

  const handleStrategySelect = (optionLabel: string) => {
    if (!swapModal) return;
    setSwapping(true);

    setTimeout(() => {
      // Find the current meal
      let currentMeal = null;
      for (const day of weekPlan) {
        const found = day.meals.find((m) => m.id === swapModal);
        if (found) { currentMeal = found; break; }
      }

      if (!currentMeal) {
        setSwapError("Refeição não encontrada.");
        setSwapping(false);
        return;
      }

      const strategy = mapOptionToStrategy(optionLabel);
      const candidates = getSwapCandidates(currentMeal, weekPlan, MOCK_RECIPES, plannerPreferences, strategy);

      if (candidates.length === 0) {
        setSwapError("Não encontramos alternativas compatíveis com suas restrições.");
        setSwapping(false);
        return;
      }

      setSwapCandidates(candidates);
      setSwapStep("candidates");
      setSwapping(false);
    }, 400);
  };

  const handlePickCandidate = (candidate: SwapCandidate) => {
    if (!swapModal) return;

    // Apply the swap directly
    const updatedWeek = weekPlan.map((day) => {
      const mealIdx = day.meals.findIndex((m) => m.id === swapModal);
      if (mealIdx < 0) return day;

      const meals = [...day.meals];
      meals[mealIdx] = {
        ...candidate.meal,
        id: meals[mealIdx].id,
        type: meals[mealIdx].type,
        time: meals[mealIdx].time,
      };
      return {
        ...day,
        meals,
        totalCalories: meals.reduce((s, m) => s + m.calories, 0),
      };
    });

    setWeekPlan(updatedWeek);
    if (!isPremium) updateUser({ swapsUsed: (user?.swapsUsed || 0) + 1 });
    setShowAdjustNotice(true);
    setTimeout(() => setShowAdjustNotice(false), 3000);
    closeSwapModal();
  };

  const hasAdjustments = auditResult.adjustedCount > 0;

  return (
    <div className="min-h-screen bg-background pb-22 safe-top">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Seu cardápio da semana</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isPremium ? "Trocas ilimitadas" : `${swapsLeft} trocas restantes esta semana`}
        </p>
      </div>

      {/* Transparency dashboard */}
      <div className="mx-4 mt-4 p-3 bg-card rounded-xl shadow-card space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          Meta: {targetCaloriesDay} kcal/dia
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {auditResult.days.map((day) => (
            <div
              key={day.day}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium text-center min-w-[52px] ${
                day.status === "ok"
                  ? "bg-primary/10 text-primary"
                  : day.status === "adjusted"
                  ? "bg-accent/10 text-accent"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <p className="font-bold">{day.dayShort}</p>
              <p>{day.totalCalories}</p>
              <p>{day.deviationPercent > 0 ? "+" : ""}{day.deviationPercent}%</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <DollarSign className="w-3.5 h-3.5" />
          Custo: R$ {weeklyCost.toFixed(0)} / R$ {user?.budget || 200}
          {!budgetResult.ok && (
            <span className="text-destructive font-medium ml-1">⚠ +R$ {budgetResult.overBy.toFixed(0)}</span>
          )}
        </div>

        {(hasAdjustments || !budgetResult.ok) && (
          <div className="flex items-start gap-1.5 text-[11px] text-accent">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              {hasAdjustments && "Porções ajustadas automaticamente para bater sua meta. "}
              {!budgetResult.ok && budgetResult.suggestions[0]}
            </span>
          </div>
        )}
      </div>

      {varietyWarnings.length > 0 && (
        <div className="mx-4 mt-2 p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-2">
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

      {/* Toast for adjustments */}
      {showAdjustNotice && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-xl shadow-modal animate-fade-in text-center">
          Troca aplicada ✓ — Cardápio recalculado.
        </div>
      )}

      <div className="px-4 mt-3 space-y-2">
        {auditResult.days.map((day, idx) => (
          <div key={day.day} className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
              className="w-full flex items-center justify-between p-4 min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  day.status === "ok" ? "bg-primary/15 text-primary" :
                  day.status === "adjusted" ? "bg-accent/15 text-accent" :
                  "bg-destructive/15 text-destructive"
                }`}>{day.dayShort}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">{day.day}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.totalCalories} kcal
                    {day.status === "adjusted" && <span className="text-accent ml-1">(ajustado)</span>}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedDay === idx ? "rotate-180" : ""}`} />
            </button>

            {expandedDay === idx && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in">
                {day.meals.length > 0 ? (
                  day.meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      portionMultiplier={meal.portionMultiplier}
                      onSwap={() => handleSwap(meal.id)}
                      swapsLeft={isPremium ? undefined : swapsLeft}
                    />
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

      {/* Swap modal */}
      {swapModal && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => !swapping && closeSwapModal()}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 animate-slide-up shadow-modal max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {swapping ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-3 skeleton-shimmer" />
                <p className="text-sm text-muted-foreground">Buscando alternativas...</p>
              </div>
            ) : swapStep === "strategy" ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Como quer trocar?</h3>
                  <button onClick={closeSwapModal} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Fechar">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {swapError && <p className="text-sm text-destructive mb-3">{swapError}</p>}

                <div className="space-y-2">
                  {SWAP_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleStrategySelect(option.label)}
                      className="w-full flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-primary/10 transition-colors min-h-[52px]"
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground">Escolha uma alternativa</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{swapCandidates.length} opções compatíveis</p>
                  </div>
                  <button onClick={closeSwapModal} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Fechar">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2">
                  {swapCandidates.map((candidate, i) => (
                    <button
                      key={i}
                      onClick={() => handlePickCandidate(candidate)}
                      className="w-full text-left p-3 bg-muted rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      <p className="text-sm font-semibold text-foreground">{candidate.meal.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span>{candidate.meal.calories} kcal</span>
                        <span>{candidate.meal.protein}g prot</span>
                        <span>{candidate.meal.prepTime} min</span>
                        <span>~R$ {candidate.estimatedCost.toFixed(0)}</span>
                      </div>
                      {candidate.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {candidate.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setSwapStep("strategy"); setSwapCandidates([]); }}
                  className="w-full mt-3 py-2.5 text-sm text-muted-foreground min-h-[44px]"
                >
                  ← Voltar
                </button>
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
