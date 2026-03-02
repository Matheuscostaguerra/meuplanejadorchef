import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import SelectableChip from "@/components/SelectableChip";
import { ChevronLeft, ChevronRight, Target, Heart, Dumbbell } from "lucide-react";
import type { Goal } from "@/context/AppContext";

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const { updateUser, user } = useApp();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<Goal>("health");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [otherRestriction, setOtherRestriction] = useState("");
  const [preferences, setPreferences] = useState<string[]>(["brasileira"]);
  const [dontEat, setDontEat] = useState<string[]>([]);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [cookingTime, setCookingTime] = useState("30min");
  const [routine, setRoutine] = useState<string[]>([]);
  const [budget, setBudget] = useState(200);
  const [economyMode, setEconomyMode] = useState(false);

  const toggleItem = (arr: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
    else {
      updateUser({ goal, restrictions, preferences, mealsPerDay, cookingTime, routine, budget, economyMode, onboardingComplete: true });
      navigate("/today");
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  const goalCards = [
    { value: "weight_loss" as Goal, label: "Perder Peso", icon: Target, emoji: "🎯", desc: "~1.600 kcal/dia", detail: "Déficit calórico seguro" },
    { value: "health" as Goal, label: "Saúde Geral", icon: Heart, emoji: "❤️", desc: "~2.000 kcal/dia", detail: "Equilíbrio nutricional" },
    { value: "muscle_gain" as Goal, label: "Ganhar Massa", icon: Dumbbell, emoji: "💪", desc: "~2.500 kcal/dia", detail: "Superávit proteico" },
  ];

  const restrictionOptions = ["Diabetes", "Pressão Alta", "Sem Glúten", "Sem Lactose", "Vegetariano", "Vegano", "Low Carb", "Sem Açúcar"];
  const prefOptions = ["Comida Caseira", "Versões Fit", "Pratos Rápidos", "Sem Fritura"];
  const dontEatOptions = ["Carne vermelha", "Frango", "Peixe", "Porco", "Frutos do mar"];
  const cookingOptions = [
    { label: "Até 15min", value: "15min" },
    { label: "Até 30min", value: "30min" },
    { label: "Até 1 hora", value: "60min" },
  ];
  const routineOptions = ["Levo marmita", "Como em casa", "Saio para almoçar às vezes"];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Qual seu objetivo?</h2>
              <p className="text-sm text-muted-foreground mt-1">Vamos descobrir o que é melhor para você</p>
            </div>
            <div className="space-y-3">
              {goalCards.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all min-h-[80px] ${
                    goal === g.value
                      ? "border-primary bg-mint/20 shadow-card"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.desc} • {g.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Algo que precisamos saber?</h2>
              <p className="text-sm text-muted-foreground mt-1">Suas restrições são sempre respeitadas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {restrictionOptions.map(r => (
                <SelectableChip key={r} label={r} selected={restrictions.includes(r)} onClick={() => toggleItem(restrictions, r, setRestrictions)} />
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Outras alergias ou restrições</label>
              <input
                type="text"
                value={otherRestriction}
                onChange={(e) => setOtherRestriction(e.target.value)}
                placeholder="Ex: alergia a amendoim..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Que tipo de comida você gosta?</h2>
              <p className="text-sm text-muted-foreground mt-1">Adaptaremos receitas brasileiras para seus objetivos</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <span className="font-medium text-foreground">🇧🇷 Culinária Brasileira Tradicional</span>
              <div className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${preferences.includes("brasileira") ? "bg-primary" : "bg-muted"}`}
                onClick={() => toggleItem(preferences, "brasileira", setPreferences)}>
                <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${preferences.includes("brasileira") ? "translate-x-5" : ""}`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {prefOptions.map(p => (
                <SelectableChip key={p} label={p} selected={preferences.includes(p)} onClick={() => toggleItem(preferences, p, setPreferences)} />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Não como:</p>
              <div className="flex flex-wrap gap-2">
                {dontEatOptions.map(d => (
                  <SelectableChip key={d} label={d} selected={dontEat.includes(d)} onClick={() => toggleItem(dontEat, d, setDontEat)} />
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Rotina e Praticidade</h2>
              <p className="text-sm text-muted-foreground mt-1">Para personalizar suas refeições</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Quantas refeições por dia? <span className="text-primary font-bold">{mealsPerDay}</span></label>
              <input
                type="range"
                min={3}
                max={6}
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>4</span><span>5</span><span>6</span></div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Tempo disponível para cozinhar?</p>
              <div className="grid grid-cols-3 gap-2">
                {cookingOptions.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCookingTime(c.value)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                      cookingTime === c.value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Sua rotina:</p>
              <div className="space-y-2">
                {routineOptions.map(r => (
                  <label key={r} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={routine.includes(r)}
                      onChange={() => toggleItem(routine, r, setRoutine)}
                      className="w-5 h-5 rounded accent-primary"
                    />
                    <span className="text-sm text-foreground">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Orçamento Semanal</h2>
              <p className="text-sm text-muted-foreground mt-1">Quanto pretende gastar com alimentação?</p>
            </div>
            <div>
              <p className="text-center text-3xl font-bold text-primary mb-4">R$ {budget}</p>
              <input
                type="range"
                min={80}
                max={400}
                step={10}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>R$ 80</span><span>R$ 400</span></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div>
                <p className="font-medium text-foreground">💰 Modo Econômico</p>
                <p className="text-xs text-muted-foreground">Receitas mais acessíveis</p>
              </div>
              <div className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${economyMode ? "bg-primary" : "bg-muted"}`}
                onClick={() => setEconomyMode(!economyMode)}>
                <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${economyMode ? "translate-x-5" : ""}`} />
              </div>
            </div>
            <div className="p-3 bg-mint/20 rounded-lg border border-mint/40 text-center">
              <p className="text-xs text-mint-foreground">⭐ Premium: otimização de preços e cupons</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 mb-2">
          {step > 0 && (
            <button onClick={back} className="p-2 -ml-2 text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Voltar">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">{step + 1}/5</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">{renderStep()}</div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={next}
          className={`w-full py-4 rounded-xl font-semibold min-h-[52px] transition-opacity hover:opacity-90 ${
            step === 4 ? "bg-gradient-teal text-primary-foreground text-lg" : "bg-primary text-primary-foreground"
          }`}
        >
          {step === 4 ? "🍽️ Criar Meu Primeiro Cardápio" : (
            <span className="inline-flex items-center gap-1">Continuar <ChevronRight className="w-4 h-4" /></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
