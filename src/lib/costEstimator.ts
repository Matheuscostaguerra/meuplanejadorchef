/**
 * Ingredient cost estimator (MVP)
 * Prices are per typical recipe portion in BRL.
 */

const PRICE_PER_UNIT: Record<string, number> = {
  // Proteins
  "frango": 3.50,
  "peito de frango": 4.00,
  "carne moída": 5.00,
  "carne": 6.00,
  "peixe": 6.50,
  "salmão": 12.00,
  "atum": 4.50,
  "sardinha": 2.50,
  "porco": 4.50,
  "linguiça": 3.50,
  "ovo": 1.00,
  "ovos": 2.00,
  "camarão": 10.00,
  // Dairy & alternatives
  "leite": 1.50,
  "queijo": 2.50,
  "queijo minas": 2.50,
  "iogurte": 1.80,
  "manteiga": 1.00,
  "creme de leite": 2.00,
  "requeijão": 2.00,
  "leite de coco": 2.50,
  // Grains & bases
  "arroz": 1.00,
  "arroz integral": 1.20,
  "feijão": 1.20,
  "feijão preto": 1.30,
  "macarrão": 1.00,
  "pão": 0.80,
  "pão integral": 1.20,
  "tapioca": 0.80,
  "aveia": 0.60,
  "granola": 1.50,
  "batata": 0.80,
  "batata-doce": 1.00,
  "mandioquinha": 1.50,
  // Produce
  "banana": 0.50,
  "tomate": 0.60,
  "cebola": 0.30,
  "alho": 0.20,
  "cenoura": 0.40,
  "berinjela": 0.80,
  "couve": 0.50,
  "pimentão": 0.70,
  "limão": 0.30,
  "laranja": 0.40,
  "abóbora": 0.60,
  "açaí": 3.00,
  // Nuts & extras
  "castanha": 3.00,
  "amendoim": 1.00,
  "pasta de amendoim": 1.50,
  "azeite": 1.50,
  "mel": 1.00,
  "champignon": 2.00,
  "grão-de-bico": 1.50,
  "lentilha": 1.20,
  "tofu": 2.50,
};

const BUDGET_SUBSTITUTIONS: Record<string, string> = {
  "salmão": "sardinha",
  "camarão": "frango",
  "castanha": "amendoim",
  "açaí": "banana",
  "champignon": "abobrinha",
  "queijo minas": "ovo",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Estimate cost for a single meal based on ingredient keywords in its name.
 * Returns estimated cost in BRL.
 */
export function estimateMealCost(mealName: string, ingredients?: string[]): number {
  const searchText = normalize(mealName + " " + (ingredients?.join(" ") || ""));
  let total = 0;
  const matched = new Set<string>();

  // Sort by longest key first to match specific items before generic ones
  const sortedKeys = Object.keys(PRICE_PER_UNIT).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const normKey = normalize(key);
    if (searchText.includes(normKey) && !matched.has(normKey)) {
      total += PRICE_PER_UNIT[key];
      matched.add(normKey);
    }
  }

  // Minimum cost per meal (base ingredients like salt, oil, seasoning)
  return Math.max(total, 1.50);
}

/**
 * Estimate weekly cost for a meal plan.
 */
export function estimateWeeklyCost(
  week: { meals: { name: string; portionMultiplier?: number; ingredients?: string[] }[] }[]
): number {
  let total = 0;
  for (const day of week) {
    for (const meal of day.meals) {
      const baseCost = estimateMealCost(meal.name, meal.ingredients);
      total += baseCost * (meal.portionMultiplier || 1);
    }
  }
  return Math.round(total * 100) / 100;
}

export interface BudgetAuditResult {
  ok: boolean;
  estimatedCost: number;
  budget: number;
  overBy: number;
  suggestions: string[];
}

/**
 * Audit weekly cost against user budget.
 */
export function auditBudget(
  estimatedCost: number,
  budget: number
): BudgetAuditResult {
  const overBy = estimatedCost - budget;
  if (overBy <= 0) {
    return { ok: true, estimatedCost, budget, overBy: 0, suggestions: [] };
  }

  const suggestions: string[] = [];
  if (overBy > budget * 0.3) {
    suggestions.push(
      `Para bater ~${Math.round(estimatedCost)}R$/semana com R$${budget}/semana pode ser inviável. Sugestões: aumentar orçamento ou ativar modo econômico + permitir repetir bases.`
    );
  } else {
    suggestions.push("Substituir itens caros por equivalentes econômicos (ex: salmão → sardinha, castanhas → amendoim).");
    suggestions.push("Aumentar uso de bases econômicas: arroz, feijão, ovos, frango, aveia.");
  }

  return { ok: false, estimatedCost, budget, overBy: Math.round(overBy * 100) / 100, suggestions };
}

export { BUDGET_SUBSTITUTIONS };
