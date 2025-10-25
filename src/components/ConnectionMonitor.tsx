import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi, 
  Smartphone, 
  Plane, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useConnectionMonitor } from '@/hooks/useConnectionMonitor';

export const ConnectionMonitor = () => {
  const { 
    connectionStatus, 
    isMonitoring, 
    setIsMonitoring,
    stopPanicMode 
  } = useConnectionMonitor();

  const getStatusIcon = (status: boolean, type: 'wifi' | 'mobile' | 'airplane' | 'internet') => {
    if (type === 'airplane') {
      return status ? (
        <Plane className="h-4 w-4 text-orange-500" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-500" />
      );
    }
    
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (status: boolean, type: 'wifi' | 'mobile' | 'airplane' | 'internet') => {
    switch (type) {
      case 'wifi':
        return status ? 'Conectado' : 'Desconectado';
      case 'mobile':
        return status ? 'Ativo' : 'Inativo';
      case 'airplane':
        return status ? 'Ativado' : 'Desativado';
      case 'internet':
        return status ? 'Online' : 'Offline';
      default:
        return status ? 'Ativo' : 'Inativo';
    }
  };

  const getStatusColor = (status: boolean, type: 'wifi' | 'mobile' | 'airplane' | 'internet') => {
    if (type === 'airplane') {
      return status ? 'bg-orange-500/10 text-orange-500 border-orange-500' : 'bg-green-500/10 text-green-500 border-green-500';
    }
    
    return status ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-red-500/10 text-red-500 border-red-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Monitor de Segurança</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Monitoramento:</span>
          <Switch
            checked={isMonitoring}
            onCheckedChange={setIsMonitoring}
          />
        </div>
      </div>

      {/* Status da Conexão */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(connectionStatus.wifi, 'wifi')}
          </div>
          <Badge 
            variant="outline" 
            className={`w-full ${getStatusColor(connectionStatus.wifi, 'wifi')}`}
          >
            WiFi
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {getStatusText(connectionStatus.wifi, 'wifi')}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(connectionStatus.mobileData, 'mobile')}
          </div>
          <Badge 
            variant="outline" 
            className={`w-full ${getStatusColor(connectionStatus.mobileData, 'mobile')}`}
          >
            Dados Móveis
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {getStatusText(connectionStatus.mobileData, 'mobile')}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(connectionStatus.airplaneMode, 'airplane')}
          </div>
          <Badge 
            variant="outline" 
            className={`w-full ${getStatusColor(connectionStatus.airplaneMode, 'airplane')}`}
          >
            Modo Avião
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {getStatusText(connectionStatus.airplaneMode, 'airplane')}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(connectionStatus.hasInternet, 'internet')}
          </div>
          <Badge 
            variant="outline" 
            className={`w-full ${getStatusColor(connectionStatus.hasInternet, 'internet')}`}
          >
            Internet
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {getStatusText(connectionStatus.hasInternet, 'internet')}
          </p>
        </div>
      </div>

      {/* Alertas de Segurança */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Modo Pânico Automático</p>
            <p className="text-xs text-muted-foreground">
              Será acionado automaticamente quando:
            </p>
            <ul className="text-xs text-muted-foreground mt-1 ml-4">
              <li>• Modo avião for ativado</li>
              <li>• WiFi e dados móveis estiverem desligados</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
          <Shield className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Duração: 60 minutos</p>
            <p className="text-xs text-muted-foreground">
              Gravação automática de segurança com duração de 1 hora
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Emergência */}
      <div className="mt-6 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={stopPanicMode}
          className="w-full gap-2"
        >
          <XCircle className="h-4 w-4" />
          Parar Modo Pânico (se ativo)
        </Button>
      </div>
    </Card>
  );
};
