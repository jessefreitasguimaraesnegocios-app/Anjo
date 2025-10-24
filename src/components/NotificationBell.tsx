import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para adicionar notificação
  const addNotification = (type: NotificationState['type'], message: string) => {
    console.log('🔔 NotificationBell: Adicionando notificação', { type, message });
    
    const notification: NotificationState = {
      type,
      message,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Manter apenas 5 notificações
    setCurrentNotification(notification);
    setIsAnimating(true);
    
    console.log('🔔 NotificationBell: Notificação adicionada, iniciando animação');
    
    // Parar animação após 1.5 segundos
    setTimeout(() => {
      setIsAnimating(false);
      console.log('🔔 NotificationBell: Animação finalizada');
    }, 1500);
  };

  // Expor função globalmente para uso em outros componentes
  useEffect(() => {
    console.log('🔔 NotificationBell: Registrando função showNotification globalmente');
    (window as any).showNotification = addNotification;
    
    return () => {
      console.log('🔔 NotificationBell: Removendo função showNotification');
      delete (window as any).showNotification;
    };
  }, []);

  const getIconColor = (type: NotificationState['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatMessage = (message: string) => {
    // Melhorar formatação das mensagens de erro
    if (message.includes('StorageUnknownError')) {
      return 'Erro de conexão com o servidor. Tente novamente.';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'Arquivo não encontrado no servidor.';
    }
    if (message.includes('Erro ao reproduzir arquivo')) {
      return 'Não foi possível reproduzir o arquivo.';
    }
    if (message.includes('Erro ao fazer download')) {
      return 'Não foi possível baixar o arquivo.';
    }
    return message;
  };

  const getIcon = (type: NotificationState['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowDetails(false);
  };

  return (
    <div className="relative">
      {/* Ícone do Sino */}
      <div 
        className={cn(
          "relative cursor-pointer transition-all duration-300",
          isAnimating && "animate-bounce"
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <Bell 
          className={cn(
            "h-6 w-6 transition-colors duration-300",
            currentNotification?.type === 'success' && "text-green-500",
            currentNotification?.type === 'error' && "text-red-500",
            currentNotification?.type === 'warning' && "text-yellow-500",
            currentNotification?.type === 'info' && "text-blue-500",
            !currentNotification && "text-gray-500"
          )}
        />
        
        {/* Indicador de notificações */}
        {notifications.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </div>
        )}
      </div>

      {/* Dropdown de Notificações */}
      {showDetails && (
        <div className={cn(
          "absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50",
          isMobile 
            ? "bottom-8 right-0 w-72 max-w-[calc(100vw-2rem)]" // Mobile: abre para cima, largura ajustada
            : "top-8 right-0 min-w-80 max-w-96"                // Desktop: abre para baixo, largura fixa
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
              <button
                onClick={clearNotifications}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Limpar todas
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.timestamp}
                  className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("flex-shrink-0", getIconColor(notification.type))}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatMessage(notification.message)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
