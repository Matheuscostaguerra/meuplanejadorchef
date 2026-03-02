import React, { createContext, useContext, useState, useCallback } from "react";

export type UserPlan = "free" | "premium" | "test";
export type Goal = "weight_loss" | "health" | "muscle_gain";

export interface UserProfile {
  name: string;
  email: string;
  plan: UserPlan;
  goal: Goal;
  restrictions: string[];
  preferences: string[];
  mealsPerDay: number;
  cookingTime: string;
  routine: string[];
  budget: number;
  economyMode: boolean;
  swapsUsed: number;
  maxSwaps: number;
  onboardingComplete: boolean;
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
  goal: "health",
  restrictions: [],
  preferences: ["brasileira"],
  mealsPerDay: 4,
  cookingTime: "30min",
  routine: [],
  budget: 200,
  economyMode: false,
  swapsUsed: 0,
  maxSwaps: 3,
  onboardingComplete: false,
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((email: string, password: string) => {
    const isTestAccount = email === "admin@meumenuai.com" && password === "MenuAI2024!";
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
