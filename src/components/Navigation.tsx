import { useLocation, Link } from "react-router-dom";
import { Shield, FileText, Smartphone, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const navItems = [
  { path: "/", icon: Shield, label: "Anjo da Guarda" },
  { path: "/evidencias", icon: FileText, label: "Evidências" },
  { path: "/dispositivos", icon: Smartphone, label: "Dispositivos" },
  { path: "/planos", icon: CreditCard, label: "Planos" },
];

export const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="container mx-auto">
        <div className="flex justify-around md:justify-center md:gap-8 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Logout button - only visible on desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
