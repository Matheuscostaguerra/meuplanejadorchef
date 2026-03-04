/**
 * Calorie & Macro Auditor
 * 
 * Ensures daily calorie totals are within ±5% of target (±10% with heavy restrictions).
 * Adjusts portion multipliers before swapping recipes.
 */

import type { Meal, DayPlan } from "@/data/mockData";

export interface AuditedMeal extends Meal {
  portionMultiplier: number;
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
}

export interface AuditedDay {
  day: string;
  dayShort: string;
  meals: AuditedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  deviationPercent: number;
  status: "ok" | "adjusted" | "warning";
}

/** Meal type distribution for 4 meals */
const DISTRIBUTION_4: Record<string, number> = {
  cafe: 0.25,
  almoco: 0.30,
  lanche: 0.15,
  jantar: 0.30,
};

/** For 3, 5, 6 meals */
const DISTRIBUTION: Record<number, Record<string, number>> = {
  3: { cafe: 0.30, almoco: 0.35, jantar: 0.35 },
  4: DISTRIBUTION_4,
  5: { cafe: 0.20, almoco: 0.30, lanche: 0.10, jantar: 0.30, ceia: 0.10 },
  6: { cafe: 0.20, almoco: 0.25, lanche: 0.10, jantar: 0.25, ceia: 0.10 },
};

const ALLOWED_MULTIPLIERS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

function getDistribution(mealsPerDay: number): Record<string, number> {
  return DISTRIBUTION[mealsPerDay] || DISTRIBUTION_4;
}

function applyMultiplier(meal: Meal, multiplier: number): AuditedMeal {
  return {
    ...meal,
    portionMultiplier: multiplier,
    adjustedCalories: Math.round(meal.calories * multiplier),
    adjustedProtein: Math.round(meal.protein * multiplier),
    adjustedCarbs: Math.round(meal.carbs * multiplier),
    adjustedFat: Math.round(meal.fat * multiplier),
  };
}

/**
 * Audit and adjust a single day's meals to hit calorie target within tolerance.
 */
export function auditDay(
  day: DayPlan,
  targetCaloriesDay: number,
  tolerancePercent: number = 5
): AuditedDay {
  const dist = getDistribution(day.meals.length);
  const tolerance = tolerancePercent / 100;
  const minCal = targetCaloriesDay * (1 - tolerance);
  const maxCal = targetCaloriesDay * (1 + tolerance);

  // Start with 1.0x multipliers
  let auditedMeals = day.meals.map((meal) => applyMultiplier(meal, 1.0));
  let total = auditedMeals.reduce((s, m) => s + m.adjustedCalories, 0);

  let status: AuditedDay["status"] = "ok";

  // If already within tolerance, done
  if (total >= minCal && total <= maxCal) {
    return buildAuditedDay(day, auditedMeals, targetCaloriesDay, "ok");
  }

  // Try adjusting per-meal multipliers based on distribution targets
  const mealTargets = day.meals.map((meal) => {
    const share = dist[meal.type] || (1 / day.meals.length);
    return Math.round(targetCaloriesDay * share);
  });

  auditedMeals = day.meals.map((meal, i) => {
    const target = mealTargets[i];
    const idealMultiplier = target / meal.calories;
    // Pick the closest allowed multiplier
    const closest = ALLOWED_MULTIPLIERS.reduce((prev, curr) =>
      Math.abs(curr - idealMultiplier) < Math.abs(prev - idealMultiplier) ? curr : prev
    );
    return applyMultiplier(meal, closest);
  });

  total = auditedMeals.reduce((s, m) => s + m.adjustedCalories, 0);
  status = total >= minCal && total <= maxCal ? "adjusted" : "warning";

  // Fine-tune: if still off, nudge the meal with most room
  if (status === "warning") {
    const diff = targetCaloriesDay - total;
    // Find meal that can absorb the difference
    const sorted = [...auditedMeals].sort((a, b) => b.calories - a.calories);
    for (const meal of sorted) {
      const neededMultiplier = (meal.adjustedCalories + diff) / meal.calories;
      const closest = ALLOWED_MULTIPLIERS.reduce((prev, curr) =>
        Math.abs(curr - neededMultiplier) < Math.abs(prev - neededMultiplier) ? curr : prev
      );
      if (closest >= 0.5 && closest <= 2.0) {
        const idx = auditedMeals.findIndex((m) => m.id === meal.id);
        auditedMeals[idx] = applyMultiplier(auditedMeals[idx], closest);
        break;
      }
    }

    total = auditedMeals.reduce((s, m) => s + m.adjustedCalories, 0);
    status = total >= minCal && total <= maxCal ? "adjusted" : "warning";
  }

  return buildAuditedDay(day, auditedMeals, targetCaloriesDay, status);
}

function buildAuditedDay(
  day: DayPlan,
  meals: AuditedMeal[],
  targetCalories: number,
  status: AuditedDay["status"]
): AuditedDay {
  const totalCalories = meals.reduce((s, m) => s + m.adjustedCalories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.adjustedProtein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.adjustedCarbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.adjustedFat, 0);
  const deviationPercent = targetCalories > 0
    ? Math.round(((totalCalories - targetCalories) / targetCalories) * 100)
    : 0;

  return {
    day: day.day,
    dayShort: day.dayShort,
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    targetCalories,
    deviationPercent,
    status,
  };
}

/**
 * Audit entire week.
 */
export function auditWeek(
  week: DayPlan[],
  targetCaloriesDay: number,
  tolerancePercent: number = 5
): { days: AuditedDay[]; weekOk: boolean; adjustedCount: number; warningCount: number } {
  const days = week.map((day) => auditDay(day, targetCaloriesDay, tolerancePercent));
  const adjustedCount = days.filter((d) => d.status === "adjusted").length;
  const warningCount = days.filter((d) => d.status === "warning").length;
  return { days, weekOk: warningCount === 0, adjustedCount, warningCount };
}

export interface MacroAuditResult {
  proteinOk: boolean;
  proteinPerDay: number;
  proteinTarget: { min: number; max: number };
  fatOk: boolean;
  fatPercent: number;
}

/**
 * Audit macros for a day.
 */
export function auditMacros(
  day: AuditedDay,
  weightKg: number
): MacroAuditResult {
  const proteinMin = Math.round(weightKg * 1.6);
  const proteinMax = Math.round(weightKg * 2.2);
  const proteinOk = day.totalProtein >= proteinMin;
  const fatPercent = day.totalCalories > 0
    ? Math.round((day.totalFat * 9 / day.totalCalories) * 100)
    : 0;
  const fatOk = fatPercent >= 20 && fatPercent <= 30;

  return {
    proteinOk,
    proteinPerDay: day.totalProtein,
    proteinTarget: { min: proteinMin, max: proteinMax },
    fatOk,
    fatPercent,
  };
}
