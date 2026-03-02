import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import TodayPage from "./pages/TodayPage";
import MenuPage from "./pages/MenuPage";
import ShoppingPage from "./pages/ShoppingPage";
import RecipesPage from "./pages/RecipesPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn } = useApp();

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/today" replace /> : <LoginPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/today" element={<ProtectedRoute><OnboardingGuard><TodayPage /></OnboardingGuard></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><OnboardingGuard><MenuPage /></OnboardingGuard></ProtectedRoute>} />
      <Route path="/shopping" element={<ProtectedRoute><OnboardingGuard><ShoppingPage /></OnboardingGuard></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><OnboardingGuard><RecipesPage /></OnboardingGuard></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><OnboardingGuard><AccountPage /></OnboardingGuard></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
