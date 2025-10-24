import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AuthForm } from "@/components/AuthForm";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
// import { RecordingIndicator } from "@/components/RecordingIndicator";
import { PWAInstallPrompt, PWAStatus, PWAUpdatePrompt } from "@/components/PWAInstallPrompt";
import { useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Evidencias from "./pages/Evidencias";
import MeusRegistros from "./pages/MeusRegistros";
import Dispositivos from "./pages/Dispositivos";
import Planos from "./pages/Planos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <PWAStatus />
      <PWAUpdatePrompt />
      {/* <RecordingIndicator /> */}
      <RealtimeNotifications />
      <PWAInstallPrompt />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evidencias" element={<Evidencias />} />
        <Route path="/meus-registros" element={<MeusRegistros />} />
        <Route path="/dispositivos" element={<Dispositivos />} />
        <Route path="/planos" element={<Planos />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
