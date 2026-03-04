/**
 * Swap candidate generator — returns 8-12 ranked alternatives for a meal.
 */

import type { Meal, Recipe, DayPlan } from "@/data/mockData";
import { filterSafeMeals } from "@/lib/mealValidator";
import type { PlannerPreferences } from "@/lib/menuPlanner";
import { estimateMealCost } from "@/lib/costEstimator";

export interface SwapCandidate {
  meal: Meal;
  tags: string[];
  estimatedCost: number;
}

type SwapStrategy = "similar" | "protein" | "budget" | "fast" | "avoid";

const CATEGORY_TO_MEAL_TYPE: Record<string, Meal["type"]> = {
  "Café da Manhã": "cafe",
  "Almoço": "almoco",
  "Lanche": "lanche",
  "Jantar": "jantar",
};

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function recipeToMeal(recipe: Recipe): Meal {
  const type = CATEGORY_TO_MEAL_TYPE[recipe.category] ?? "almoco";
  return {
    id: `swap-${recipe.id}-${Date.now()}`,
    name: recipe.name,
    type,
    time: "",
    prepTime: recipe.time,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
  };
}

function buildSafePool(
  recipes: Recipe[],
  preferences: PlannerPreferences
): Meal[] {
  const safeMeals = filterSafeMeals(
    recipes.map((r) => ({ id: r.id, name: r.name, ingredients: r.ingredients })),
    preferences.restrictions,
    preferences.dontEat,
    preferences.customRestrictions,
    preferences.acceptZeroLactose
  );
  const safeIds = new Set(safeMeals.map((m) => m.id));
  return recipes.filter((r) => safeIds.has(r.id)).map(recipeToMeal);
}

function generateTags(candidate: Meal, currentMeal: Meal): string[] {
  const tags: string[] = [];
  if (candidate.protein > currentMeal.protein + 5) tags.push(`+${candidate.protein - currentMeal.protein}g proteína`);
  if (candidate.calories < currentMeal.calories - 30) tags.push(`-${currentMeal.calories - candidate.calories} kcal`);
  if (candidate.prepTime < currentMeal.prepTime) tags.push(`${candidate.prepTime} min`);
  const cost = estimateMealCost(candidate.name);
  if (cost < 3) tags.push("econômica");
  return tags;
}

/**
 * Get 8-12 swap candidates for a meal, ranked by strategy.
 */
export function getSwapCandidates(
  currentMeal: Meal,
  week: DayPlan[],
  recipes: Recipe[],
  preferences: PlannerPreferences,
  strategy: SwapStrategy = "similar"
): SwapCandidate[] {
  const pool = buildSafePool(recipes, preferences);
  const currentName = normalize(currentMeal.name);

  // Exclude current meal and meals already in the week (unless meal prep)
  const usedNames = preferences.allowMealPrep
    ? new Set<string>()
    : new Set(week.flatMap((d) => d.meals.map((m) => normalize(m.name))));

  let candidates = pool.filter((m) => {
    const name = normalize(m.name);
    if (name === currentName) return false;
    if (!preferences.allowMealPrep && usedNames.has(name)) return false;
    return true;
  });

  // Prefer same meal type
  const sameType = candidates.filter((m) => m.type === currentMeal.type);
  if (sameType.length >= 4) candidates = sameType;

  // Sort by strategy
  candidates.sort((a, b) => {
    switch (strategy) {
      case "protein": return b.protein - a.protein;
      case "budget": return estimateMealCost(a.name) - estimateMealCost(b.name);
      case "fast": return a.prepTime - b.prepTime;
      case "avoid": return Math.abs(a.calories - currentMeal.calories) - Math.abs(b.calories - currentMeal.calories);
      default: // similar
        return Math.abs(a.calories - currentMeal.calories) - Math.abs(b.calories - currentMeal.calories);
    }
  });

  // Take 8-12
  const result = candidates.slice(0, 12);

  return result.map((meal) => ({
    meal,
    tags: generateTags(meal, currentMeal),
    estimatedCost: estimateMealCost(meal.name),
  }));
}
