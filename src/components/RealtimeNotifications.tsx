import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, X, AlertTriangle, Activity, MapPin, Video } from 'lucide-react';
import { useRealtime, RealtimeUpdate } from '@/hooks/useRealtime';

export const RealtimeNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isConnected, updates } = useRealtime();

  useEffect(() => {
    // Usar sistema de notificações visuais ao invés de toasts
    updates.forEach((update, index) => {
      if (index === 0) { // Only show the latest update
        if ((window as any).showNotification) {
          switch (update.type) {
            case 'panic_alert':
              (window as any).showNotification('error', '🚨 Alerta de Pânico! Um dispositivo ativou o modo de emergência');
              break;
            case 'recording_start':
              (window as any).showNotification('info', '📹 Gravação Iniciada - Nova gravação foi iniciada');
              break;
            case 'device_status':
              (window as any).showNotification('success', '📱 Dispositivo Atualizado - Status do dispositivo foi alterado');
              break;
          }
        }
      }
    });

    // Update unread count
    setUnreadCount(updates.length);
  }, [updates]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'panic_alert':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'recording_start':
        return <Video className="h-4 w-4 text-primary" />;
      case 'device_status':
        return <Activity className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getUpdateTitle = (update: RealtimeUpdate) => {
    switch (update.type) {
      case 'panic_alert':
        return 'Alerta de Pânico';
      case 'recording_start':
        return 'Gravação Iniciada';
      case 'device_status':
        return 'Status do Dispositivo';
      default:
        return 'Atualização';
    }
  };

  const getUpdateDescription = (update: RealtimeUpdate) => {
    switch (update.type) {
      case 'panic_alert':
        return update.data.message || 'Dispositivo em modo de emergência';
      case 'recording_start':
        return `Gravação de ${update.data.type} iniciada`;
      case 'device_status':
        return `Dispositivo ${update.data.status === 'online' ? 'conectado' : 'desconectado'}`;
      default:
        return 'Nova atualização recebida';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status */}
      <div className="mb-2">
        <Badge 
          variant={isConnected ? "outline" : "secondary"}
          className={isConnected ? "bg-success/10 text-success border-success" : ""}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </div>


      {/* Notifications Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-2">
            {updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {updates.map((update, index) => (
                  <div
                    key={`${update.deviceId}-${update.timestamp}`}
                    className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getUpdateIcon(update.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium">
                            {getUpdateTitle(update)}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(update.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getUpdateDescription(update)}
                        </p>
                        {update.type === 'panic_alert' && (
                          <Alert className="mt-2" variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Ação imediata necessária!
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
