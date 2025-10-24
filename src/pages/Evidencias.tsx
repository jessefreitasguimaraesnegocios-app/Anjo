import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FolderOpen,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useRecordings } from "@/hooks/useRecordings";
import { useDevices } from "@/hooks/useDevices";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Evidencias() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const { getRecordings } = useRecordings();
  const { getDevices } = useDevices();
  const { getSubscription, isSubscriptionActive, getDaysRemaining } = useSubscription();
  const navigate = useNavigate();

  // Fetch recordings
  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ['recordings'],
    queryFn: getRecordings,
  });

  // Fetch devices for context
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const handlePasswordSubmit = () => {
    // Buscar dispositivo ativo para verificar senha
    const activeDevice = devices.find(d => d.status === 'online') || devices[0];
    
    if (!activeDevice) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Nenhum dispositivo encontrado!');
      }
      return;
    }

    if (password === activeDevice.records_password) {
      setIsPasswordDialogOpen(false);
      setPassword("");
      if ((window as any).showNotification) {
        (window as any).showNotification('success', `Acesso autorizado para ${activeDevice.name}!`);
      }
      setTimeout(() => {
        navigate('/meus-registros');
      }, 1000);
    } else {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Senha incorreta!');
      }
      setPassword("");
    }
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || "Dispositivo desconhecido";
  };


  const isActive = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);

  // Loading state
  if (recordingsLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando arquivos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Arquivos</h1>
          <p className="text-muted-foreground">
            Acesse seus registros protegidos por senha
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="p-6 mb-8 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Status da Assinatura</h3>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Ativa' : 'Inativa'} • {daysRemaining} dias restantes
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                {isActive ? 'Ativa' : 'Inativa'}
              </div>
            </div>
          </Card>
        )}

        {/* Meus Registros */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meus Registros</p>
                <p className="text-2xl font-bold text-primary">
                  {recordings.filter(r => r.file_path).length} arquivos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse seus registros protegidos por senha
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-primary" />
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Lock className="h-4 w-4" />
                      Acessar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Acesso aos Registros</DialogTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Digite a senha de registros do seu dispositivo para acessar os downloads
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Senha de Registros</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha do dispositivo"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handlePasswordSubmit}
                          className="flex-1"
                          disabled={!password.trim()}
                        >
                          Acessar Registros
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}