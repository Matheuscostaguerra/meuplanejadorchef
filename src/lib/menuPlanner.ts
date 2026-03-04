import type { DayPlan, Meal, Recipe } from "@/data/mockData";
import { filterSafeMeals } from "@/lib/mealValidator";

export interface PlannerPreferences {
  restrictions: string[];
  dontEat: string[];
  customRestrictions: string[];
  acceptZeroLactose: boolean;
  allowMealPrep: boolean;
}

type CandidateMeal = Meal & { ingredients?: string[] };
type SwapStrategy = "similar" | "protein" | "budget" | "fast" | "avoid";

const CATEGORY_TO_MEAL_TYPE: Record<string, Meal["type"]> = {
  "Café da Manhã": "cafe",
  Almoço: "almoco",
  Lanche: "lanche",
  Jantar: "jantar",
};

const DEFAULT_TIME_BY_TYPE: Record<Meal["type"], string> = {
  cafe: "07:00",
  almoco: "12:00",
  lanche: "16:00",
  jantar: "19:30",
  ceia: "21:30",
};

const PROTEIN_KEYWORDS = [
  "frango",
  "peixe",
  "atum",
  "carne",
  "porco",
  "ovo",
  "tofu",
  "grao-de-bico",
  "lentilha",
  "feijao",
] as const;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extractMainProtein(text: string): string | null {
  const normalized = normalize(text);
  for (const keyword of PROTEIN_KEYWORDS) {
    if (normalized.includes(keyword)) return keyword;
  }
  return null;
}

function uniqueByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function recipeToCandidate(recipe: Recipe): CandidateMeal {
  const type = CATEGORY_TO_MEAL_TYPE[recipe.category] ?? "almoco";
  return {
    id: `recipe-${recipe.id}`,
    name: recipe.name,
    type,
    time: DEFAULT_TIME_BY_TYPE[type],
    prepTime: recipe.time,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    ingredients: recipe.ingredients,
  };
}

function rankCandidates(candidates: CandidateMeal[], currentMeal: Meal, strategy: SwapStrategy): CandidateMeal[] {
  const currentProtein = extractMainProtein(currentMeal.name);

  const similarityScore = (candidate: CandidateMeal) =>
    Math.abs(candidate.calories - currentMeal.calories) + Math.abs(candidate.prepTime - currentMeal.prepTime) * 2;

  return [...candidates].sort((a, b) => {
    if (strategy === "protein") return b.protein - a.protein;
    if (strategy === "budget") return a.calories - b.calories || a.prepTime - b.prepTime;
    if (strategy === "fast") return a.prepTime - b.prepTime || a.calories - b.calories;
    if (strategy === "avoid") {
      const aProtein = extractMainProtein(a.name);
      const bProtein = extractMainProtein(b.name);
      const aPriority = aProtein && currentProtein && aProtein !== currentProtein ? 0 : 1;
      const bPriority = bProtein && currentProtein && bProtein !== currentProtein ? 0 : 1;
      return aPriority - bPriority || similarityScore(a) - similarityScore(b);
    }
    return similarityScore(a) - similarityScore(b);
  });
}

function pickCandidate(
  pool: CandidateMeal[],
  currentMeal: Meal,
  usedNames: Set<string> | null,
  previousProtein: string | null,
  strategy: SwapStrategy,
  blockedProteins: string[] = []
): CandidateMeal | null {
  const currentName = normalize(currentMeal.name);
  const base = uniqueByName(pool).filter((candidate) => normalize(candidate.name) !== currentName);
  if (base.length === 0) return null;

  const byType = base.filter((candidate) => candidate.type === currentMeal.type);
  const scoped = byType.length > 0 ? byType : base;

  const attempts = [
    { allowUsed: false, allowPreviousProtein: false, allowBlockedProteins: false },
    { allowUsed: true, allowPreviousProtein: false, allowBlockedProteins: false },
    { allowUsed: true, allowPreviousProtein: true, allowBlockedProteins: false },
    { allowUsed: true, allowPreviousProtein: true, allowBlockedProteins: true },
  ];

  for (const attempt of attempts) {
    const viable = scoped.filter((candidate) => {
      const nameKey = normalize(candidate.name);
      const protein = extractMainProtein(candidate.name);

      if (!attempt.allowUsed && usedNames?.has(nameKey)) return false;
      if (!attempt.allowPreviousProtein && previousProtein && protein === previousProtein) return false;
      if (!attempt.allowBlockedProteins && protein && blockedProteins.includes(protein)) return false;
      return true;
    });

    if (viable.length > 0) return rankCandidates(viable, currentMeal, strategy)[0];
  }

  return null;
}

function buildRecipePool(recipes: Recipe[], preferences: PlannerPreferences): CandidateMeal[] {
  const rawPool = recipes.map(recipeToCandidate);
  return filterSafeMeals(
    rawPool,
    preferences.restrictions,
    preferences.dontEat,
    preferences.customRestrictions,
    preferences.acceptZeroLactose
  ) as CandidateMeal[];
}

function buildSafeBaseWeek(baseWeek: DayPlan[], preferences: PlannerPreferences): DayPlan[] {
  return baseWeek.map((day) => {
    const safeMeals = filterSafeMeals(
      day.meals,
      preferences.restrictions,
      preferences.dontEat,
      preferences.customRestrictions,
      preferences.acceptZeroLactose
    );

    return {
      ...day,
      meals: safeMeals,
      totalCalories: safeMeals.reduce((sum, meal) => sum + meal.calories, 0),
    };
  });
}

function mapSwapStrategy(optionLabel: string): SwapStrategy {
  const normalized = normalize(optionLabel);
  if (normalized.includes("proteina")) return "protein";
  if (normalized.includes("economica")) return "budget";
  if (normalized.includes("rapida")) return "fast";
  if (normalized.includes("ingrediente")) return "avoid";
  return "similar";
}

function findAdjacentProtein(
  week: DayPlan[],
  fromDayIndex: number,
  type: Meal["type"],
  direction: -1 | 1
): string | null {
  for (let dayIndex = fromDayIndex + direction; dayIndex >= 0 && dayIndex < week.length; dayIndex += direction) {
    const meal = week[dayIndex].meals.find((item) => item.type === type);
    if (!meal) continue;
    const protein = extractMainProtein(meal.name);
    if (protein) return protein;
  }
  return null;
}

export function buildWeeklyMenu(baseWeek: DayPlan[], recipes: Recipe[], preferences: PlannerPreferences): DayPlan[] {
  const safeWeek = buildSafeBaseWeek(baseWeek, preferences);
  const recipePool = buildRecipePool(recipes, preferences);
  const usedNames = preferences.allowMealPrep ? null : new Set<string>();
  const previousProteinByType: Partial<Record<Meal["type"], string>> = {};

  return safeWeek.map((day) => {
    const meals = day.meals.map((meal) => {
      const mealName = normalize(meal.name);
      const currentProtein = extractMainProtein(meal.name);
      const previousProtein = previousProteinByType[meal.type] ?? null;
      const isDuplicate = !preferences.allowMealPrep && usedNames?.has(mealName);
      const repeatsProtein = Boolean(currentProtein && previousProtein && currentProtein === previousProtein);

      const replacement = isDuplicate || repeatsProtein
        ? pickCandidate(recipePool, meal, usedNames, previousProtein, "similar")
        : null;

      const chosenMeal: Meal = {
        ...(replacement ?? meal),
        id: meal.id,
        time: meal.time,
        type: meal.type,
      };

      const chosenProtein = extractMainProtein(chosenMeal.name);
      if (chosenProtein) previousProteinByType[meal.type] = chosenProtein;
      if (!preferences.allowMealPrep) usedNames?.add(normalize(chosenMeal.name));

      return chosenMeal;
    });

    return {
      ...day,
      meals,
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    };
  });
}

export function swapMealInWeek(
  week: DayPlan[],
  mealId: string,
  optionLabel: string,
  recipes: Recipe[],
  preferences: PlannerPreferences
): { week: DayPlan[]; swapped: boolean } {
  let targetDayIndex = -1;
  let targetMealIndex = -1;

  week.some((day, dayIndex) => {
    const mealIndex = day.meals.findIndex((meal) => meal.id === mealId);
    if (mealIndex < 0) return false;
    targetDayIndex = dayIndex;
    targetMealIndex = mealIndex;
    return true;
  });

  if (targetDayIndex < 0 || targetMealIndex < 0) return { week, swapped: false };

  const targetMeal = week[targetDayIndex].meals[targetMealIndex];
  const strategy = mapSwapStrategy(optionLabel);
  const recipePool = buildRecipePool(recipes, preferences);
  const weekPool: CandidateMeal[] = week.flatMap((day) =>
    day.meals.map((meal) => ({ ...meal, ingredients: [] }))
  );

  const candidatePool = uniqueByName([...recipePool, ...weekPool]);
  const usedNames = preferences.allowMealPrep
    ? null
    : new Set(
        week
          .flatMap((day) => day.meals)
          .filter((meal) => meal.id !== mealId)
          .map((meal) => normalize(meal.name))
      );

  const previousProtein = findAdjacentProtein(week, targetDayIndex, targetMeal.type, -1);
  const nextProtein = findAdjacentProtein(week, targetDayIndex, targetMeal.type, 1);

  const replacement = pickCandidate(
    candidatePool,
    targetMeal,
    usedNames,
    previousProtein,
    strategy,
    nextProtein ? [nextProtein] : []
  );

  if (!replacement) return { week, swapped: false };

  const updatedWeek = week.map((day, dayIndex) => {
    if (dayIndex !== targetDayIndex) return day;

    const meals = day.meals.map((meal, mealIndex) => {
      if (mealIndex !== targetMealIndex) return meal;
      return {
        ...(replacement as Meal),
        id: meal.id,
        type: meal.type,
        time: meal.time,
      };
    });

    return {
      ...day,
      meals,
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    };
  });

  return { week: updatedWeek, swapped: true };
}
