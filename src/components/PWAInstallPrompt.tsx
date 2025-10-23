import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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
    // Salvar no localStorage para não mostrar novamente
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

          <div className="text-xs text-muted-foreground">
            <p>• Acesso offline</p>
            <p>• Notificações push</p>
            <p>• Instalação rápida</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const PWAStatus = () => {
  const { isInstalled } = usePWA();

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40">
      <Badge variant="outline" className="bg-success/10 text-success border-success">
        <Monitor className="h-3 w-3 mr-1" />
        App Instalado
      </Badge>
    </div>
  );
};
