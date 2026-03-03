import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, calculateTMB, calculateTDEE, calculateCaloricTarget, suggestMacros, calculateBMI, bmiCategory } from "@/context/AppContext";
import SelectableChip from "@/components/SelectableChip";
import { ChevronLeft, ChevronRight, Target, Heart, Dumbbell, AlertTriangle } from "lucide-react";
import type { Goal, ActivityLevel, Sex, GoalIntensity } from "@/context/AppContext";

const DISCLAIMER = "O Meu Planejador Chef oferece estimativas e planejamento alimentar. Não substitui consulta com nutricionista/médico. Para condições clínicas, procure um profissional.";

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const { updateUser, user } = useApp();
  const navigate = useNavigate();

  // Step 0: Body data
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState<Sex>("other");

  // Step 1: Activity & routine
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("light");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [cookingTime, setCookingTime] = useState("30min");
  const [routine, setRoutine] = useState<string[]>([]);
  const [allowMealPrep, setAllowMealPrep] = useState(false);

  // Step 2: Goal
  const [goal, setGoal] = useState<Goal>("health");
  const [goalIntensity, setGoalIntensity] = useState<GoalIntensity>("moderate");
  const [manualCalories, setManualCalories] = useState(false);
  const [manualCal, setManualCal] = useState(2000);
  const [manualMacros, setManualMacros] = useState({ protein: 120, carbs: 250, fat: 65 });

  // Step 3: Restrictions
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [otherRestriction, setOtherRestriction] = useState("");
  const [acceptZeroLactose, setAcceptZeroLactose] = useState(true);
  const [dontEat, setDontEat] = useState<string[]>([]);

  // Step 4: Preferences
  const [preferences, setPreferences] = useState<string[]>(["brasileira"]);
  const [cuisineStyle, setCuisineStyle] = useState<"brasileira" | "internacional" | "mista">("brasileira");

  // Step 5: Budget
  const [budget, setBudget] = useState(200);
  const [economyMode, setEconomyMode] = useState(false);

  const toggleItem = (arr: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  // Calculated values
  const bmi = useMemo(() => calculateBMI(weight, height), [weight, height]);
  const bmiCat = useMemo(() => bmiCategory(bmi), [bmi]);
  const tmb = useMemo(() => calculateTMB(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => calculateTDEE(tmb, activityLevel), [tmb, activityLevel]);
  const suggestedCal = useMemo(() => calculateCaloricTarget(tdee, goal, goalIntensity), [tdee, goal, goalIntensity]);
  const suggestedMacros = useMemo(() => suggestMacros(manualCalories ? manualCal : suggestedCal, goal, weight), [suggestedCal, manualCal, manualCalories, goal, weight]);

  const hasHealthCondition = restrictions.some(r => ["Diabetes", "Pressão Alta", "Hipertensão"].includes(r));
  const hasLactoseRestriction = restrictions.includes("Sem Lactose");

  const totalSteps = 6;

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      const customRestrictions = otherRestriction.trim()
        ? otherRestriction.split(",").map(r => r.trim()).filter(Boolean)
        : [];
      const caloricTarget = manualCalories ? manualCal : suggestedCal;
      const macros = manualCalories ? manualMacros : suggestedMacros;
      updateUser({
        weight, height, age, sex, activityLevel,
        goal, goalIntensity, caloricTarget, manualCalories, macros,
        restrictions, dontEat, customRestrictions, acceptZeroLactose,
        preferences, cuisineStyle, mealsPerDay, cookingTime, routine,
        budget, economyMode, allowMealPrep, onboardingComplete: true,
      });
      navigate("/today");
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  const sexOptions = [
    { value: "F" as Sex, label: "Feminino" },
    { value: "M" as Sex, label: "Masculino" },
    { value: "other" as Sex, label: "Prefiro não informar" },
  ];

  const activityOptions = [
    { value: "sedentary" as ActivityLevel, label: "Sedentário", desc: "Pouca ou nenhuma atividade" },
    { value: "light" as ActivityLevel, label: "Leve", desc: "1–3x por semana" },
    { value: "moderate" as ActivityLevel, label: "Moderado", desc: "3–5x por semana" },
    { value: "high" as ActivityLevel, label: "Alto", desc: "6–7x por semana" },
  ];

  const goalCards = [
    { value: "weight_loss" as Goal, label: "Emagrecer", icon: Target, emoji: "🎯", desc: `~${calculateCaloricTarget(tdee, "weight_loss", goalIntensity)} kcal/dia`, detail: "Déficit calórico seguro" },
    { value: "health" as Goal, label: "Saúde Geral", icon: Heart, emoji: "❤️", desc: `~${tdee} kcal/dia`, detail: "Equilíbrio nutricional" },
    { value: "muscle_gain" as Goal, label: "Ganhar Massa", icon: Dumbbell, emoji: "💪", desc: `~${calculateCaloricTarget(tdee, "muscle_gain", goalIntensity)} kcal/dia`, detail: "Superávit proteico" },
  ];

  const intensityOptions = [
    { value: "light" as GoalIntensity, label: "Leve" },
    { value: "moderate" as GoalIntensity, label: "Moderado" },
    { value: "intense" as GoalIntensity, label: "Intenso" },
  ];

  const restrictionOptions = ["Diabetes", "Hipertensão", "Sem Glúten", "Sem Lactose", "Vegetariano", "Vegano", "Low Carb", "Sem Açúcar"];
  const dontEatOptions = ["Carne vermelha", "Frango", "Peixe", "Porco", "Frutos do mar", "Ovos"];
  const prefOptions = ["Caseira", "Fit", "Rápida (<20min)", "Econômica", "Sem Fritura"];
  const cuisineOptions = [
    { value: "brasileira" as const, label: "🇧🇷 Brasileira Tradicional" },
    { value: "internacional" as const, label: "🌍 Internacional" },
    { value: "mista" as const, label: "🍽️ Mista" },
  ];
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
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Seus dados</h2>
              <p className="text-sm text-muted-foreground mt-1">Precisamos disso para calcular suas necessidades</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Peso (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value) || 0)} className="w-full px-3 py-3 rounded-lg border border-border bg-card text-foreground min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Altura (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value) || 0)} className="w-full px-3 py-3 rounded-lg border border-border bg-card text-foreground min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Idade</label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value) || 0)} className="w-full px-3 py-3 rounded-lg border border-border bg-card text-foreground min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sexo</label>
                <select value={sex} onChange={e => setSex(e.target.value as Sex)} className="w-full px-3 py-3 rounded-lg border border-border bg-card text-foreground min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring">
                  {sexOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {weight > 0 && height > 0 && (
              <div className="p-3 bg-mint/20 rounded-xl text-center">
                <p className="text-sm text-foreground">IMC: <span className="font-bold text-primary">{bmi}</span> — {bmiCat}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Informativo, não é diagnóstico</p>
              </div>
            )}
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                {DISCLAIMER}
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Atividade e Rotina</h2>
              <p className="text-sm text-muted-foreground mt-1">Para personalizar suas refeições</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Nível de atividade física</p>
              <div className="space-y-2">
                {activityOptions.map(a => (
                  <button key={a.value} onClick={() => setActivityLevel(a.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all min-h-[52px] ${activityLevel === a.value ? "border-primary bg-mint/20" : "border-border bg-card hover:border-primary/30"}`}>
                    <p className="font-medium text-sm text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Refeições por dia: <span className="text-primary font-bold">{mealsPerDay}</span></label>
              <input type="range" min={3} max={6} value={mealsPerDay} onChange={e => setMealsPerDay(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>4</span><span>5</span><span>6</span></div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Tempo de preparo</p>
              <div className="grid grid-cols-3 gap-2">
                {cookingOptions.map(c => (
                  <button key={c.value} onClick={() => setCookingTime(c.value)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${cookingTime === c.value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/30"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Sua rotina:</p>
              <div className="space-y-2">
                {routineOptions.map(r => (
                  <label key={r} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={routine.includes(r)} onChange={() => toggleItem(routine, r, setRoutine)} className="w-5 h-5 rounded accent-primary" />
                    <span className="text-sm text-foreground">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <ToggleRow label="🔁 Aceito repetir refeições (meal prep)" desc="Permite receitas repetidas na semana" value={allowMealPrep} onChange={setAllowMealPrep} />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Objetivo e Meta</h2>
              <p className="text-sm text-muted-foreground mt-1">Vamos calcular o ideal para você</p>
            </div>
            <div className="space-y-3">
              {goalCards.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all min-h-[72px] ${goal === g.value ? "border-primary bg-mint/20 shadow-card" : "border-border bg-card hover:border-primary/30"}`}>
                  <span className="text-3xl">{g.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.desc} • {g.detail}</p>
                  </div>
                </button>
              ))}
            </div>
            {goal !== "health" && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Intensidade do ajuste</p>
                <div className="grid grid-cols-3 gap-2">
                  {intensityOptions.map(i => (
                    <button key={i.value} onClick={() => setGoalIntensity(i.value)}
                      className={`py-3 rounded-lg text-sm font-medium min-h-[44px] transition-all ${goalIntensity === i.value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 bg-mint/20 rounded-xl">
              <p className="text-sm text-foreground text-center">Meta calórica estimada:</p>
              <p className="text-2xl font-bold text-primary text-center">{manualCalories ? manualCal : suggestedCal} kcal/dia</p>
              <p className="text-[10px] text-muted-foreground text-center mt-1">TMB: {tmb} • TDEE: {tdee}</p>
              <div className="flex justify-center gap-3 mt-3">
                <button onClick={() => setManualCalories(!manualCalories)} className="text-xs text-primary font-medium underline">
                  {manualCalories ? "Usar estimativa" : "Definir manualmente"}
                </button>
              </div>
            </div>
            {manualCalories && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Calorias diárias</label>
                <input type="number" value={manualCal} onChange={e => setManualCal(Number(e.target.value) || 0)} className="w-full px-3 py-3 rounded-lg border border-border bg-card text-foreground min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Macros sugeridos (editáveis):</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Proteína (g)</label>
                  <input type="number" value={manualCalories ? manualMacros.protein : suggestedMacros.protein}
                    onChange={e => setManualMacros(m => ({ ...m, protein: Number(e.target.value) || 0 }))}
                    disabled={!manualCalories}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Carbos (g)</label>
                  <input type="number" value={manualCalories ? manualMacros.carbs : suggestedMacros.carbs}
                    onChange={e => setManualMacros(m => ({ ...m, carbs: Number(e.target.value) || 0 }))}
                    disabled={!manualCalories}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Gordura (g)</label>
                  <input type="number" value={manualCalories ? manualMacros.fat : suggestedMacros.fat}
                    onChange={e => setManualMacros(m => ({ ...m, fat: Number(e.target.value) || 0 }))}
                    disabled={!manualCalories}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Restrições de Saúde</h2>
              <p className="text-sm text-muted-foreground mt-1">Suas restrições são sempre respeitadas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {restrictionOptions.map(r => (
                <SelectableChip key={r} label={r} selected={restrictions.includes(r)} onClick={() => toggleItem(restrictions, r, setRestrictions)} />
              ))}
            </div>
            {hasLactoseRestriction && (
              <ToggleRow
                label="🥛 Aceito produtos zero lactose"
                desc="Leite, queijo, creme e iogurte com lactase adicionada"
                value={acceptZeroLactose}
                onChange={setAcceptZeroLactose}
              />
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Outras alergias ou restrições</label>
              <input type="text" value={otherRestriction} onChange={e => setOtherRestriction(e.target.value)}
                placeholder="Ex: alergia a amendoim..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Não como:</p>
              <div className="flex flex-wrap gap-2">
                {dontEatOptions.map(d => (
                  <SelectableChip key={d} label={d} selected={dontEat.includes(d)} onClick={() => toggleItem(dontEat, d, setDontEat)} />
                ))}
              </div>
            </div>
            {hasHealthCondition && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                  Você selecionou uma condição de saúde. Ajuste com seu nutricionista.
                </p>
              </div>
            )}
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                {DISCLAIMER}
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Preferências Culinárias</h2>
              <p className="text-sm text-muted-foreground mt-1">Adaptaremos receitas para seus objetivos</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Estilo de culinária</p>
              <div className="space-y-2">
                {cuisineOptions.map(c => (
                  <button key={c.value} onClick={() => setCuisineStyle(c.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all min-h-[48px] ${cuisineStyle === c.value ? "border-primary bg-mint/20" : "border-border bg-card hover:border-primary/30"}`}>
                    <span className="font-medium text-sm text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {prefOptions.map(p => (
                <SelectableChip key={p} label={p} selected={preferences.includes(p)} onClick={() => toggleItem(preferences, p, setPreferences)} />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Orçamento Semanal</h2>
              <p className="text-sm text-muted-foreground mt-1">Quanto pretende gastar com alimentação?</p>
            </div>
            <div>
              <p className="text-center text-3xl font-bold text-primary mb-4">R$ {budget}</p>
              <input type="range" min={80} max={400} step={10} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>R$ 80</span><span>R$ 400</span></div>
            </div>
            <ToggleRow label="💰 Modo Econômico" desc="Receitas mais acessíveis" value={economyMode} onChange={setEconomyMode} />
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
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 mb-2">
          {step > 0 && (
            <button onClick={back} className="p-2 -ml-2 text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Voltar">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">{step + 1}/{totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">{renderStep()}</div>

      <div className="px-6 pb-6">
        <button onClick={next}
          className={`w-full py-4 rounded-xl font-semibold min-h-[52px] transition-opacity hover:opacity-90 ${step === totalSteps - 1 ? "bg-gradient-teal text-primary-foreground text-lg" : "bg-primary text-primary-foreground"}`}>
          {step === totalSteps - 1 ? "🍽️ Criar Meu Primeiro Cardápio" : (
            <span className="inline-flex items-center gap-1">Continuar <ChevronRight className="w-4 h-4" /></span>
          )}
        </button>
      </div>
    </div>
  );
};

/** Reusable toggle row */
const ToggleRow: React.FC<{ label: string; desc: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
    <div>
      <p className="font-medium text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <div className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${value ? "bg-primary" : "bg-muted"}`}
      onClick={() => onChange(!value)}>
      <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </div>
  </div>
);

export default OnboardingPage;
