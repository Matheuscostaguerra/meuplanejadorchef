/**
 * Meal Restriction Validator
 * 
 * HARD CONSTRAINTS: Restrictions (allergies, intolerances, dietary choices)
 * are absolute — meals violating them must NEVER be shown.
 * 
 * SOFT CONSTRAINTS: Preferences (cooking time, cuisine style) are weighted
 * but never override hard constraints.
 */

// Synonym maps for ingredient detection
const LACTOSE_INGREDIENTS = [
  "leite", "queijo", "iogurte", "manteiga", "requeijão", "creme de leite",
  "muçarela", "mussarela", "parmesão", "catupiry", "molho branco", "nata",
  "cream cheese", "ricota", "provolone", "coalho", "minas", "gorgonzola",
  "chantilly", "leite condensado", "doce de leite", "whey", "laticinios",
  "laticínios", "queijo ralado", "fondue",
];

const GLUTEN_INGREDIENTS = [
  "trigo", "farinha", "pão", "macarrão", "massa", "biscoito", "bolacha",
  "cerveja", "aveia", "centeio", "cevada", "semolina", "bulgur",
  "cuscuz", "sêmola", "torrada", "croissant", "bolo", "panqueca",
  "wrap", "pizza", "lasanha", "nhoque", "miojo", "granola",
];

const SUGAR_INGREDIENTS = [
  "açúcar", "mel", "rapadura", "melado", "calda", "geleia",
  "doce", "chocolate", "caramelo", "fondant", "marshmallow",
  "leite condensado", "sorvete", "pudim",
];

const MEAT_RED = [
  "carne", "boi", "bovina", "picanha", "alcatra", "filé mignon",
  "costela", "acém", "patinho", "lagarto", "maminha", "cupim",
  "carne moída", "carne seca", "charque", "hambúrguer",
];

const MEAT_PORK = [
  "porco", "suíno", "bacon", "linguiça", "presunto", "salame",
  "lombo", "pernil", "torresmo", "pancetta", "copa",
];

const MEAT_CHICKEN = [
  "frango", "galinha", "peru", "chester", "ave",
];

const MEAT_FISH = [
  "peixe", "salmão", "atum", "tilápia", "bacalhau", "sardinha",
  "merluza", "robalo", "dourado", "pescada", "filé de peixe",
];

const SEAFOOD = [
  "camarão", "lula", "polvo", "lagosta", "marisco", "mexilhão",
  "ostra", "siri", "caranguejo", "frutos do mar",
  ...MEAT_FISH,
];

const ALL_ANIMAL_PRODUCTS = [
  ...MEAT_RED, ...MEAT_PORK, ...MEAT_CHICKEN, ...MEAT_FISH, ...SEAFOOD,
  ...LACTOSE_INGREDIENTS,
  "ovo", "ovos", "gema", "clara", "mel",
];

// Map restriction labels to forbidden ingredient lists
const RESTRICTION_INGREDIENT_MAP: Record<string, string[]> = {
  "Sem Lactose": LACTOSE_INGREDIENTS,
  "Sem Glúten": GLUTEN_INGREDIENTS,
  "Sem Açúcar": SUGAR_INGREDIENTS,
  "Vegano": ALL_ANIMAL_PRODUCTS,
  "Vegetariano": [...MEAT_RED, ...MEAT_PORK, ...MEAT_CHICKEN, ...MEAT_FISH, ...SEAFOOD],
  "Low Carb": [], // Soft constraint — handled by calorie/macro filtering, not ingredient bans
};

// Map "don't eat" selections to forbidden ingredients
const DONT_EAT_MAP: Record<string, string[]> = {
  "Carne vermelha": MEAT_RED,
  "Frango": MEAT_CHICKEN,
  "Peixe": MEAT_FISH,
  "Porco": MEAT_PORK,
  "Frutos do mar": SEAFOOD,
};

/**
 * Normalize text for comparison: lowercase, remove accents
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Check if a text contains any forbidden ingredient (with synonym matching)
 */
function containsForbidden(text: string, forbidden: string[]): string | null {
  const normalizedText = normalize(text);
  for (const ingredient of forbidden) {
    const normalizedIngredient = normalize(ingredient);
    if (normalizedText.includes(normalizedIngredient)) {
      return ingredient;
    }
  }
  return null;
}

export interface ValidationResult {
  valid: boolean;
  violations: {
    mealId: string;
    mealName: string;
    ingredient: string;
    restriction: string;
  }[];
}

export interface MealLike {
  id: string;
  name: string;
  ingredients?: string[];
}

/**
 * Build the full list of forbidden ingredients based on user restrictions + "don't eat" list.
 */
export function buildForbiddenList(
  restrictions: string[],
  dontEat: string[] = [],
  customRestrictions: string[] = []
): string[] {
  const forbidden: string[] = [];

  for (const restriction of restrictions) {
    const items = RESTRICTION_INGREDIENT_MAP[restriction];
    if (items) forbidden.push(...items);
  }

  for (const item of dontEat) {
    const items = DONT_EAT_MAP[item];
    if (items) forbidden.push(...items);
  }

  // Custom restrictions are treated as direct ingredient names
  forbidden.push(...customRestrictions.map(r => r.trim()).filter(Boolean));

  // Deduplicate
  return [...new Set(forbidden)];
}

/**
 * Validate a list of meals against user restrictions.
 * Checks meal name + ingredients list for forbidden items.
 */
export function validateMeals(
  meals: MealLike[],
  restrictions: string[],
  dontEat: string[] = [],
  customRestrictions: string[] = []
): ValidationResult {
  const forbidden = buildForbiddenList(restrictions, dontEat, customRestrictions);
  if (forbidden.length === 0) return { valid: true, violations: [] };

  const violations: ValidationResult["violations"] = [];

  for (const meal of meals) {
    // Check meal name
    const nameViolation = containsForbidden(meal.name, forbidden);
    if (nameViolation) {
      violations.push({
        mealId: meal.id,
        mealName: meal.name,
        ingredient: nameViolation,
        restriction: findRestrictionForIngredient(nameViolation, restrictions, dontEat),
      });
      continue;
    }

    // Check ingredients
    if (meal.ingredients) {
      for (const ing of meal.ingredients) {
        const ingViolation = containsForbidden(ing, forbidden);
        if (ingViolation) {
          violations.push({
            mealId: meal.id,
            mealName: meal.name,
            ingredient: ingViolation,
            restriction: findRestrictionForIngredient(ingViolation, restrictions, dontEat),
          });
          break; // One violation per meal is enough
        }
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Find which restriction caused a given ingredient to be forbidden.
 */
function findRestrictionForIngredient(
  ingredient: string,
  restrictions: string[],
  dontEat: string[]
): string {
  const normalizedIng = normalize(ingredient);
  for (const restriction of restrictions) {
    const items = RESTRICTION_INGREDIENT_MAP[restriction];
    if (items?.some(i => normalize(i) === normalizedIng)) return restriction;
  }
  for (const item of dontEat) {
    const items = DONT_EAT_MAP[item];
    if (items?.some(i => normalize(i) === normalizedIng)) return item;
  }
  return "Restrição personalizada";
}

/**
 * Filter meals that are safe for the user's restrictions.
 */
export function filterSafeMeals<T extends MealLike>(
  meals: T[],
  restrictions: string[],
  dontEat: string[] = [],
  customRestrictions: string[] = []
): T[] {
  const forbidden = buildForbiddenList(restrictions, dontEat, customRestrictions);
  if (forbidden.length === 0) return meals;

  return meals.filter(meal => {
    if (containsForbidden(meal.name, forbidden)) return false;
    if (meal.ingredients?.some(ing => containsForbidden(ing, forbidden))) return false;
    return true;
  });
}

/**
 * Variety checker: detects repeated main ingredients across a week.
 * Returns warnings (not blockers) about repetition.
 */
export interface VarietyWarning {
  ingredient: string;
  count: number;
  days: string[];
}

export function checkVariety(
  weekMeals: { day: string; meals: MealLike[] }[],
  allowMealPrep: boolean = false
): VarietyWarning[] {
  if (allowMealPrep) return []; // User explicitly allows repetition

  const ingredientDays: Record<string, Set<string>> = {};

  for (const day of weekMeals) {
    for (const meal of day.meals) {
      const text = normalize(meal.name + " " + (meal.ingredients?.join(" ") || ""));
      // Track main protein sources
      const proteinKeywords = [
        "frango", "carne", "peixe", "ovo", "atum", "porco",
        "feijão", "grão-de-bico", "lentilha", "tofu", "soja",
      ];
      for (const keyword of proteinKeywords) {
        if (text.includes(normalize(keyword))) {
          if (!ingredientDays[keyword]) ingredientDays[keyword] = new Set();
          ingredientDays[keyword].add(day.day);
        }
      }
    }
  }

  const warnings: VarietyWarning[] = [];
  for (const [ingredient, days] of Object.entries(ingredientDays)) {
    if (days.size > 4) {
      warnings.push({
        ingredient,
        count: days.size,
        days: [...days],
      });
    }
  }

  return warnings;
}
