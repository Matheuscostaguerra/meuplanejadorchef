import React, { createContext, useContext, useState, useCallback } from "react";

export type UserPlan = "free" | "premium" | "test";
export type Goal = "weight_loss" | "health" | "muscle_gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";
export type Sex = "F" | "M" | "other";
export type GoalIntensity = "light" | "moderate" | "intense";

export interface UserProfile {
  name: string;
  email: string;
  plan: UserPlan;
  // Body data
  weight: number; // kg
  height: number; // cm
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  // Goal
  goal: Goal;
  goalIntensity: GoalIntensity;
  caloricTarget: number; // calculated or manual
  manualCalories: boolean;
  macros: { protein: number; carbs: number; fat: number }; // grams
  // Restrictions
  restrictions: string[];
  dontEat: string[];
  customRestrictions: string[];
  acceptZeroLactose: boolean;
  // Preferences
  preferences: string[];
  cuisineStyle: "brasileira" | "internacional" | "mista";
  mealsPerDay: number;
  cookingTime: string;
  routine: string[];
  budget: number;
  economyMode: boolean;
  // Limits
  swapsUsed: number;
  maxSwaps: number;
  onboardingComplete: boolean;
  allowMealPrep: boolean;
}

interface AppContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  isPremium: boolean;
}

const defaultUser: UserProfile = {
  name: "",
  email: "",
  plan: "free",
  weight: 70,
  height: 170,
  age: 30,
  sex: "other",
  activityLevel: "light",
  goal: "health",
  goalIntensity: "moderate",
  caloricTarget: 2000,
  manualCalories: false,
  macros: { protein: 120, carbs: 250, fat: 65 },
  restrictions: [],
  dontEat: [],
  customRestrictions: [],
  acceptZeroLactose: true,
  preferences: ["brasileira"],
  cuisineStyle: "brasileira",
  mealsPerDay: 4,
  cookingTime: "30min",
  routine: [],
  budget: 200,
  economyMode: false,
  swapsUsed: 0,
  maxSwaps: 5,
  onboardingComplete: false,
  allowMealPrep: false,
};

const AppContext = createContext<AppContextType>({
  user: null,
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
  updateUser: () => {},
  isPremium: false,
});

export const useApp = () => useContext(AppContext);

/** Mifflin-St Jeor BMR */
export function calculateTMB(weight: number, height: number, age: number, sex: Sex): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (sex === "F") return Math.round(base - 161);
  if (sex === "M") return Math.round(base + 5);
  return Math.round(base - 78); // average for "other"
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

export function calculateTDEE(tmb: number, activity: ActivityLevel): number {
  return Math.round(tmb * ACTIVITY_FACTORS[activity]);
}

export function calculateCaloricTarget(tdee: number, goal: Goal, intensity: GoalIntensity): number {
  const intensityMap = { light: 0.1, moderate: 0.175, intense: 0.25 };
  const factor = intensityMap[intensity];
  if (goal === "weight_loss") return Math.round(tdee * (1 - factor));
  if (goal === "muscle_gain") return Math.round(tdee * (1 + factor * 0.6)); // +5-15%
  return tdee;
}

export function suggestMacros(caloricTarget: number, goal: Goal, weight: number) {
  let proteinPerKg = 1.8;
  if (goal === "weight_loss") proteinPerKg = 2.0;
  if (goal === "muscle_gain") proteinPerKg = 2.2;
  const protein = Math.round(proteinPerKg * weight);
  const fatCals = caloricTarget * 0.25;
  const fat = Math.round(fatCals / 9);
  const carbs = Math.round((caloricTarget - protein * 4 - fat * 9) / 4);
  return { protein, carbs: Math.max(carbs, 50), fat };
}

export function calculateBMI(weight: number, height: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidade";
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((email: string, password: string) => {
    const isTestAccount = email === "admin@meuplanejadorchef.com" && password === "MenuAI2024!";
    setUser({
      ...defaultUser,
      name: isTestAccount ? "Admin Teste" : email.split("@")[0],
      email,
      plan: isTestAccount ? "test" : "free",
      onboardingComplete: false,
    });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const isPremium = user?.plan === "premium" || user?.plan === "test";

  return (
    <AppContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateUser, isPremium }}>
      {children}
    </AppContext.Provider>
  );
};
