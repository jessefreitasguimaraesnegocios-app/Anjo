import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Share, 
  X, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isInstalled, canInstall, installPWA, sharePWA } = usePWA();

  useEffect(() => {
    // Mostrar prompt se pode instalar e não foi dispensado
    if (canInstall && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Mostrar após 3 segundos

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, dismissed]);

  useEffect(() => {
    // Monitorar status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    try {
      await installPWA();
      setIsVisible(false);
      toast.success('App instalado com sucesso!', {
        description: 'O Anjo da Guarda foi adicionado à sua tela inicial'
      });
    } catch (error) {
      toast.error('Erro ao instalar o app');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleShare = async () => {
    try {
      await sharePWA();
      toast.success('Link compartilhado!');
    } catch (error) {
      toast.error('Erro ao compartilhar');
    }
  };

  // Verificar se foi dispensado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <Card className="p-4 bg-gradient-card border-primary shadow-glow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Instalar App</h3>
              <p className="text-xs text-muted-foreground">Anjo da Guarda</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status de conexão */}
        <div className="mb-3">
          <Alert className={isOnline ? "bg-success/10 border-success" : "bg-warning/10 border-warning"}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-warning" />
              )}
              <AlertDescription className="text-xs">
                {isOnline ? 'Conectado' : 'Modo offline disponível'}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              PWA
            </Badge>
            <span>Instale para acesso rápido</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Instalar
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              <span>Acesso offline</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              <span>Notificações push</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              <span>Instalação rápida</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const PWAStatus = () => {
  const { isInstalled } = usePWA();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40 flex gap-2">
      <Badge variant="outline" className="bg-success/10 text-success border-success">
        <Monitor className="h-3 w-3 mr-1" />
        App Instalado
      </Badge>
      
      {!isOnline && (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
    </div>
  );
};

export const PWAUpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-gradient-card border-primary shadow-glow">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Atualização Disponível</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Uma nova versão do app está disponível
        </p>
        <div className="flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            Atualizar
          </Button>
          <Button 
            onClick={() => setShowUpdate(false)} 
            variant="outline" 
            size="sm"
          >
            Depois
          </Button>
        </div>
      </Card>
    </div>
  );
};