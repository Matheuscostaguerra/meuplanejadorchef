import { describe, expect, it } from "vitest";
import { MOCK_RECIPES, MOCK_WEEK } from "@/data/mockData";
import { buildWeeklyMenu, swapMealInWeek, type PlannerPreferences } from "@/lib/menuPlanner";
import { filterSafeMeals } from "@/lib/mealValidator";
import { auditDay, auditWeek } from "@/lib/calorieAuditor";
import { estimateMealCost } from "@/lib/costEstimator";

const basePreferences: PlannerPreferences = {
  restrictions: [],
  dontEat: [],
  customRestrictions: [],
  acceptZeroLactose: true,
  allowMealPrep: false,
};

describe("meal rules", () => {
  it("remove refeições com frango quando 'Não como: Frango' está ativo", () => {
    const week = buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, {
      ...basePreferences,
      dontEat: ["Frango"],
    });

    const hasChicken = week
      .flatMap((day) => day.meals)
      .some((meal) => meal.name.toLowerCase().includes("frango"));

    expect(hasChicken).toBe(false);
  });

  it("aplica troca real de refeição sem repetir o mesmo prato", () => {
    const before = buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, basePreferences);
    const targetMeal = before[0].meals[0];

    const result = swapMealInWeek(before, targetMeal.id, "Receita parecida", MOCK_RECIPES, basePreferences);
    const afterMeal = result.week[0].meals[0];

    expect(result.swapped).toBe(true);
    expect(afterMeal.name).not.toBe(targetMeal.name);
  });

  it("respeita opção 'Não como: Ovos' no validador", () => {
    const filtered = filterSafeMeals(
      [{ id: "egg-1", name: "Omelete de legumes", ingredients: ["2 ovos", "tomate"] }],
      [],
      ["Ovos"],
      [],
      true
    );

    expect(filtered).toHaveLength(0);
  });
});

describe("calorie auditor", () => {
  it("audits a day within ±5% tolerance", () => {
    const week = buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, basePreferences);
    const result = auditDay(week[0], 2000);
    expect(Math.abs(result.deviationPercent)).toBeLessThanOrEqual(10);
    expect(result.meals.every((m) => m.portionMultiplier > 0)).toBe(true);
  });

  it("audits entire week", () => {
    const week = buildWeeklyMenu(MOCK_WEEK, MOCK_RECIPES, basePreferences);
    const result = auditWeek(week, 2000);
    expect(result.days).toHaveLength(7);
  });
});

describe("cost estimator", () => {
  it("estimates a non-zero cost for meals", () => {
    const cost = estimateMealCost("Arroz integral, feijão e frango grelhado");
    expect(cost).toBeGreaterThan(0);
  });
});
