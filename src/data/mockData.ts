export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  type: "cafe" | "almoco" | "lanche" | "jantar" | "ceia";
  image?: string;
  portionMultiplier?: number;
  ingredients?: string[];
}

export interface DayPlan {
  day: string;
  dayShort: string;
  meals: Meal[];
  totalCalories: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  time: number;
  difficulty: "Fácil" | "Médio" | "Avançado";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  premium: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: "hortifruti" | "proteinas" | "laticinios" | "mercearia" | "outros";
  checked: boolean;
  price?: number;
}

export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  hortifruti: { label: "Hortifruti", emoji: "🥬" },
  proteinas: { label: "Proteínas", emoji: "🥩" },
  laticinios: { label: "Laticínios", emoji: "🥛" },
  mercearia: { label: "Mercearia", emoji: "📦" },
  outros: { label: "Outros", emoji: "🧴" },
};

export const MOCK_WEEK: DayPlan[] = [
  {
    day: "Segunda-feira", dayShort: "Seg", totalCalories: 1820,
    meals: [
      { id: "1a", name: "Tapioca com queijo e tomate", time: "07:00", calories: 280, protein: 12, carbs: 38, fat: 8, prepTime: 10, type: "cafe" },
      { id: "1b", name: "Arroz integral, feijão e frango grelhado", time: "12:00", calories: 520, protein: 38, carbs: 55, fat: 12, prepTime: 30, type: "almoco" },
      { id: "1c", name: "Vitamina de banana com aveia", time: "15:30", calories: 220, protein: 8, carbs: 35, fat: 6, prepTime: 5, type: "lanche" },
      { id: "1d", name: "Escondidinho de batata-doce", time: "19:30", calories: 480, protein: 28, carbs: 52, fat: 14, prepTime: 40, type: "jantar" },
    ],
  },
  {
    day: "Terça-feira", dayShort: "Ter", totalCalories: 1780,
    meals: [
      { id: "2a", name: "Pão integral com ovo mexido", time: "07:00", calories: 310, protein: 18, carbs: 30, fat: 12, prepTime: 10, type: "cafe" },
      { id: "2b", name: "Baião de dois integral", time: "12:00", calories: 490, protein: 32, carbs: 58, fat: 10, prepTime: 35, type: "almoco" },
      { id: "2c", name: "Açaí bowl caseiro", time: "15:30", calories: 260, protein: 6, carbs: 42, fat: 8, prepTime: 10, type: "lanche" },
      { id: "2d", name: "Sopa de legumes com frango", time: "19:30", calories: 380, protein: 30, carbs: 35, fat: 8, prepTime: 25, type: "jantar" },
    ],
  },
  {
    day: "Quarta-feira", dayShort: "Qua", totalCalories: 1850,
    meals: [
      { id: "3a", name: "Mingau de aveia com frutas", time: "07:00", calories: 290, protein: 10, carbs: 45, fat: 7, prepTime: 10, type: "cafe" },
      { id: "3b", name: "Parmegiana de berinjela", time: "12:00", calories: 530, protein: 22, carbs: 48, fat: 18, prepTime: 40, type: "almoco" },
      { id: "3c", name: "Mix de castanhas e frutas secas", time: "15:30", calories: 200, protein: 6, carbs: 20, fat: 12, prepTime: 0, type: "lanche" },
      { id: "3d", name: "Omelete de legumes", time: "19:30", calories: 420, protein: 28, carbs: 15, fat: 20, prepTime: 15, type: "jantar" },
    ],
  },
  {
    day: "Quinta-feira", dayShort: "Qui", totalCalories: 1800,
    meals: [
      { id: "4a", name: "Crepioca com frango desfiado", time: "07:00", calories: 320, protein: 22, carbs: 28, fat: 10, prepTime: 15, type: "cafe" },
      { id: "4b", name: "Feijoada light", time: "12:00", calories: 510, protein: 35, carbs: 50, fat: 14, prepTime: 45, type: "almoco" },
      { id: "4c", name: "Iogurte com granola", time: "15:30", calories: 180, protein: 10, carbs: 25, fat: 4, prepTime: 2, type: "lanche" },
      { id: "4d", name: "Wrap integral de atum", time: "19:30", calories: 410, protein: 30, carbs: 38, fat: 12, prepTime: 10, type: "jantar" },
    ],
  },
  {
    day: "Sexta-feira", dayShort: "Sex", totalCalories: 1790,
    meals: [
      { id: "5a", name: "Smoothie verde proteico", time: "07:00", calories: 250, protein: 20, carbs: 30, fat: 5, prepTime: 5, type: "cafe" },
      { id: "5b", name: "Frango com purê de mandioquinha", time: "12:00", calories: 540, protein: 38, carbs: 50, fat: 15, prepTime: 35, type: "almoco" },
      { id: "5c", name: "Banana com pasta de amendoim", time: "15:30", calories: 230, protein: 8, carbs: 28, fat: 10, prepTime: 2, type: "lanche" },
      { id: "5d", name: "Salada completa com grão-de-bico", time: "19:30", calories: 390, protein: 18, carbs: 42, fat: 12, prepTime: 15, type: "jantar" },
    ],
  },
  {
    day: "Sábado", dayShort: "Sáb", totalCalories: 1900,
    meals: [
      { id: "6a", name: "Panqueca de banana e aveia", time: "08:00", calories: 330, protein: 14, carbs: 42, fat: 10, prepTime: 15, type: "cafe" },
      { id: "6b", name: "Moqueca de peixe light", time: "12:30", calories: 520, protein: 35, carbs: 35, fat: 18, prepTime: 40, type: "almoco" },
      { id: "6c", name: "Bolo de cenoura fit", time: "16:00", calories: 200, protein: 6, carbs: 30, fat: 6, prepTime: 30, type: "lanche" },
      { id: "6d", name: "Cuscuz com ovo e salada", time: "19:30", calories: 450, protein: 22, carbs: 55, fat: 12, prepTime: 20, type: "jantar" },
    ],
  },
  {
    day: "Domingo", dayShort: "Dom", totalCalories: 1860,
    meals: [
      { id: "7a", name: "Tapioca recheada fit", time: "08:30", calories: 300, protein: 15, carbs: 35, fat: 9, prepTime: 12, type: "cafe" },
      { id: "7b", name: "Strogonoff de frango saudável", time: "12:30", calories: 530, protein: 36, carbs: 48, fat: 16, prepTime: 30, type: "almoco" },
      { id: "7c", name: "Frutas da estação", time: "15:30", calories: 150, protein: 2, carbs: 35, fat: 1, prepTime: 5, type: "lanche" },
      { id: "7d", name: "Arroz, feijão e carne moída", time: "19:30", calories: 500, protein: 32, carbs: 55, fat: 14, prepTime: 25, type: "jantar" },
    ],
  },
];

export const MOCK_SHOPPING: ShoppingItem[] = [
  { id: "s1", name: "Banana", quantity: "6", unit: "un", category: "hortifruti", checked: false, price: 4.50 },
  { id: "s2", name: "Tomate", quantity: "500", unit: "g", category: "hortifruti", checked: false, price: 5.00 },
  { id: "s3", name: "Couve", quantity: "1", unit: "maço", category: "hortifruti", checked: false, price: 3.50 },
  { id: "s4", name: "Batata-doce", quantity: "1", unit: "kg", category: "hortifruti", checked: false, price: 6.00 },
  { id: "s5", name: "Cenoura", quantity: "500", unit: "g", category: "hortifruti", checked: false, price: 3.00 },
  { id: "s6", name: "Berinjela", quantity: "2", unit: "un", category: "hortifruti", checked: false, price: 4.00 },
  { id: "s7", name: "Abóbora", quantity: "500", unit: "g", category: "hortifruti", checked: false, price: 3.50 },
  { id: "s8", name: "Peito de frango", quantity: "1.5", unit: "kg", category: "proteinas", checked: false, price: 22.00 },
  { id: "s9", name: "Carne moída magra", quantity: "500", unit: "g", category: "proteinas", checked: false, price: 18.00 },
  { id: "s10", name: "Filé de peixe", quantity: "500", unit: "g", category: "proteinas", checked: false, price: 25.00 },
  { id: "s11", name: "Ovos", quantity: "12", unit: "un", category: "proteinas", checked: false, price: 12.00 },
  { id: "s12", name: "Atum em lata", quantity: "2", unit: "un", category: "proteinas", checked: false, price: 9.00 },
  { id: "s13", name: "Iogurte natural", quantity: "500", unit: "ml", category: "laticinios", checked: false, price: 6.00 },
  { id: "s14", name: "Queijo minas", quantity: "200", unit: "g", category: "laticinios", checked: false, price: 8.00 },
  { id: "s15", name: "Leite desnatado", quantity: "1", unit: "L", category: "laticinios", checked: false, price: 5.50 },
  { id: "s16", name: "Arroz integral", quantity: "1", unit: "kg", category: "mercearia", checked: false, price: 7.00 },
  { id: "s17", name: "Feijão carioca", quantity: "1", unit: "kg", category: "mercearia", checked: false, price: 8.00 },
  { id: "s18", name: "Aveia em flocos", quantity: "500", unit: "g", category: "mercearia", checked: false, price: 6.00 },
  { id: "s19", name: "Tapioca", quantity: "500", unit: "g", category: "mercearia", checked: false, price: 5.00 },
  { id: "s20", name: "Granola", quantity: "250", unit: "g", category: "mercearia", checked: false, price: 9.00 },
  { id: "s21", name: "Pasta de amendoim", quantity: "250", unit: "g", category: "mercearia", checked: false, price: 12.00 },
  { id: "s22", name: "Castanhas mistas", quantity: "200", unit: "g", category: "mercearia", checked: false, price: 15.00 },
  { id: "s23", name: "Azeite de oliva", quantity: "250", unit: "ml", category: "outros", checked: false, price: 18.00 },
  { id: "s24", name: "Tempero verde", quantity: "1", unit: "maço", category: "outros", checked: false, price: 2.50 },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "r1", name: "Escondidinho de Batata-Doce", category: "Almoço", time: 40, difficulty: "Médio",
    calories: 480, protein: 28, carbs: 52, fat: 14,
    ingredients: ["500g batata-doce", "300g carne moída magra", "1 cebola", "2 dentes de alho", "Cheiro-verde", "Sal e pimenta a gosto", "Queijo minas ralado"],
    steps: ["Cozinhe a batata-doce e amasse como purê", "Refogue a carne com cebola, alho e temperos", "Monte camadas alternando carne e purê", "Cubra com queijo minas ralado", "Leve ao forno 180°C por 15 minutos"],
    tags: ["brasileira", "fit", "sem glúten"], premium: false,
  },
  {
    id: "r2", name: "Feijoada Light", category: "Almoço", time: 45, difficulty: "Médio",
    calories: 510, protein: 35, carbs: 50, fat: 14,
    ingredients: ["500g feijão preto", "200g linguiça de frango", "200g peito de porco magro", "Couve", "Laranja", "Alho, cebola, louro"],
    steps: ["Cozinhe o feijão na pressão por 25min", "Refogue as carnes magras com alho", "Junte ao feijão e cozinhe mais 15min", "Sirva com couve refogada e laranja"],
    tags: ["brasileira", "proteica"], premium: false,
  },
  {
    id: "r3", name: "Tapioca Recheada Fit", category: "Café da Manhã", time: 12, difficulty: "Fácil",
    calories: 300, protein: 15, carbs: 35, fat: 9,
    ingredients: ["3 colheres de goma de tapioca", "2 fatias de queijo minas", "2 fatias de tomate", "Orégano"],
    steps: ["Espalhe a goma na frigideira antiaderente", "Quando firmar, vire e adicione o recheio", "Dobre e sirva quente"],
    tags: ["brasileira", "rápida", "sem glúten"], premium: false,
  },
  {
    id: "r4", name: "Moqueca de Peixe Light", category: "Almoço", time: 40, difficulty: "Médio",
    calories: 520, protein: 35, carbs: 35, fat: 18,
    ingredients: ["500g filé de peixe", "Leite de coco light", "Pimentão", "Tomate", "Coentro", "Azeite de dendê (pouco)"],
    steps: ["Tempere o peixe com limão e sal", "Refogue pimentão e tomate", "Adicione o peixe e leite de coco", "Cozinhe em fogo baixo por 15min", "Finalize com coentro e dendê"],
    tags: ["brasileira", "gourmet", "sem glúten"], premium: true,
  },
  {
    id: "r5", name: "Açaí Bowl Caseiro", category: "Lanche", time: 10, difficulty: "Fácil",
    calories: 260, protein: 6, carbs: 42, fat: 8,
    ingredients: ["200g polpa de açaí", "1 banana", "Granola", "Mel", "Frutas frescas"],
    steps: ["Bata o açaí com banana no liquidificador", "Transfira para um bowl", "Decore com granola e frutas", "Adicione mel a gosto"],
    tags: ["brasileira", "rápida", "energia"], premium: false,
  },
  {
    id: "r6", name: "Strogonoff de Frango Saudável", category: "Jantar", time: 30, difficulty: "Fácil",
    calories: 530, protein: 36, carbs: 48, fat: 16,
    ingredients: ["500g peito de frango", "Iogurte natural", "Mostarda", "Ketchup caseiro", "Champignon", "Arroz integral"],
    steps: ["Corte o frango em cubos e tempere", "Refogue com alho e cebola", "Adicione mostarda e ketchup", "Junte o iogurte no lugar do creme", "Sirva com arroz integral"],
    tags: ["brasileira", "fit", "proteica"], premium: false,
  },
];

export const SWAP_OPTIONS = [
  { label: "Receita parecida", icon: "🔄" },
  { label: "Mais proteína", icon: "💪" },
  { label: "Mais econômica", icon: "💰" },
  { label: "Mais rápida", icon: "⚡" },
  { label: "Sem ingrediente específico", icon: "🚫" },
];
