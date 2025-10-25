import { useState, useEffect, useRef } from 'react';
import { useRecordings } from './useRecordings';
import { useDevices } from './useDevices';

export interface ConnectionStatus {
  wifi: boolean;
  mobileData: boolean;
  airplaneMode: boolean;
  hasInternet: boolean;
}

export const useConnectionMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    wifi: true,
    mobileData: true,
    airplaneMode: false,
    hasInternet: true
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const panicTriggeredRef = useRef(false);
  const panicTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { createRecording } = useRecordings();
  const { getDevices } = useDevices();

  // Função para detectar status da conexão
  const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
    try {
      // Verificar conectividade básica
      const hasInternet = navigator.onLine;
      
      // Tentar fazer uma requisição para verificar conectividade real
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 3000
      }).catch(() => null);
      
      const realInternet = response?.ok || false;
      
      // Detectar modo avião (quando não há internet mas o dispositivo está "online")
      const airplaneMode = !hasInternet && navigator.onLine;
      
      // Simular detecção de WiFi e dados móveis
      // Em um app real, isso seria feito via APIs nativas
      const wifi = hasInternet && !airplaneMode;
      const mobileData = hasInternet && !airplaneMode;
      
      return {
        wifi,
        mobileData,
        airplaneMode,
        hasInternet: realInternet
      };
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      return {
        wifi: false,
        mobileData: false,
        airplaneMode: true,
        hasInternet: false
      };
    }
  };

  // Função para acionar modo pânico automático
  const triggerPanicMode = async (reason: string) => {
    if (panicTriggeredRef.current) return;
    
    panicTriggeredRef.current = true;
    
    try {
      console.log(`🚨 Modo pânico acionado automaticamente: ${reason}`);
      
      if ((window as any).showNotification) {
        (window as any).showNotification('error', `🚨 Modo pânico ativado: ${reason}`);
      }

      // Buscar dispositivo ativo
      const devices = await getDevices();
      const activeDevice = devices.find(d => d.status === 'online') || devices[0];
      
      if (!activeDevice) {
        console.error('Nenhum dispositivo encontrado para modo pânico');
        return;
      }

      // Criar gravação de pânico automático com 60 minutos
      await createRecording({
        device_id: activeDevice.id,
        type: 'panic',
        duration: 3600, // 60 minutos em segundos
        size: 0,
        location_data: {
          reason: reason,
          automatic: true,
          connection_status: connectionStatus,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Gravação de pânico automático iniciada (60 min)');
      
    } catch (error) {
      console.error('Erro ao acionar modo pânico:', error);
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Erro ao acionar modo pânico automático');
      }
    }
  };

  // Função para parar modo pânico
  const stopPanicMode = () => {
    panicTriggeredRef.current = false;
    if (panicTimeoutRef.current) {
      clearTimeout(panicTimeoutRef.current);
      panicTimeoutRef.current = null;
    }
    
    if ((window as any).showNotification) {
      (window as any).showNotification('success', 'Modo pânico automático desativado');
    }
  };

  // Monitoramento contínuo
  useEffect(() => {
    if (!isMonitoring) return;

    const monitorInterval = setInterval(async () => {
      const newStatus = await checkConnectionStatus();
      setConnectionStatus(newStatus);

      // Verificar condições para acionar modo pânico
      if (newStatus.airplaneMode) {
        // Modo avião ativado
        await triggerPanicMode('Modo avião ativado');
      } else if (!newStatus.wifi && !newStatus.mobileData) {
        // Ambos WiFi e dados móveis desligados
        await triggerPanicMode('Sem conexão de internet');
      } else if (newStatus.hasInternet && panicTriggeredRef.current) {
        // Conexão restaurada - parar modo pânico
        stopPanicMode();
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      clearInterval(monitorInterval);
    };
  }, [isMonitoring]);

  // Monitorar mudanças no status online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('📶 Dispositivo online');
      checkConnectionStatus().then(setConnectionStatus);
    };

    const handleOffline = () => {
      console.log('📵 Dispositivo offline');
      setConnectionStatus(prev => ({
        ...prev,
        hasInternet: false,
        wifi: false,
        mobileData: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicializar status
  useEffect(() => {
    checkConnectionStatus().then(setConnectionStatus);
  }, []);

  return {
    connectionStatus,
    isMonitoring,
    setIsMonitoring,
    triggerPanicMode,
    stopPanicMode,
    checkConnectionStatus
  };
};
