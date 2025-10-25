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
      
      // Tentar fazer requisições para diferentes serviços para detectar conectividade real
      const testUrls = [
        'https://www.google.com/favicon.ico',
        'https://www.cloudflare.com/favicon.ico',
        'https://httpbin.org/status/200'
      ];
      
      let realInternet = false;
      let connectionType = 'unknown';
      
      // Testar conectividade real com timeout curto
      for (const url of testUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal,
            mode: 'no-cors'
          });
          
          clearTimeout(timeoutId);
          realInternet = true;
          break;
        } catch (error) {
          console.log(`Teste de conectividade falhou para ${url}:`, error);
        }
      }
      
      // Detectar modo avião baseado em múltiplos fatores
      const airplaneMode = !hasInternet || (!realInternet && navigator.onLine);
      
      // Detectar tipo de conexão usando Network Information API se disponível
      let wifi = false;
      let mobileData = false;
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          const type = connection.type;
          
          // Detectar WiFi
          wifi = type === 'wifi' || effectiveType === '4g' || effectiveType === '3g';
          
          // Detectar dados móveis
          mobileData = type === 'cellular' || type === 'bluetooth' || type === 'ethernet';
          
          console.log('Network Info:', { type, effectiveType, wifi, mobileData });
        }
      }
      
      // Fallback: se não conseguir detectar tipo específico, usar conectividade geral
      if (!wifi && !mobileData) {
        if (realInternet) {
          // Se tem internet mas não sabemos o tipo, assumir WiFi
          wifi = true;
        } else {
          // Se não tem internet, ambos estão desligados
          wifi = false;
          mobileData = false;
        }
      }
      
      // Log para debug
      console.log('Status da conexão:', {
        hasInternet,
        realInternet,
        airplaneMode,
        wifi,
        mobileData,
        navigatorOnline: navigator.onLine
      });
      
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

      console.log('🔍 Verificando condições para modo pânico:', {
        airplaneMode: newStatus.airplaneMode,
        wifi: newStatus.wifi,
        mobileData: newStatus.mobileData,
        hasInternet: newStatus.hasInternet,
        panicAlreadyTriggered: panicTriggeredRef.current
      });

      // Verificar condições para acionar modo pânico
      if (newStatus.airplaneMode) {
        // Modo avião ativado
        console.log('✈️ Modo avião detectado - acionando pânico');
        await triggerPanicMode('Modo avião ativado');
      } else if (!newStatus.wifi && !newStatus.mobileData && !newStatus.hasInternet) {
        // Ambos WiFi e dados móveis desligados E sem internet
        console.log('📵 Sem conexão detectada - acionando pânico');
        await triggerPanicMode('Sem conexão de internet');
      } else if (newStatus.hasInternet && panicTriggeredRef.current) {
        // Conexão restaurada - parar modo pânico
        console.log('📶 Conexão restaurada - parando pânico');
        stopPanicMode();
      }
    }, 3000); // Verificar a cada 3 segundos (mais frequente)

    return () => {
      clearInterval(monitorInterval);
    };
  }, [isMonitoring]);

  // Monitorar mudanças no status online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('📶 Dispositivo online - verificando status');
      checkConnectionStatus().then(setConnectionStatus);
    };

    const handleOffline = () => {
      console.log('📵 Dispositivo offline - acionando modo pânico');
      setConnectionStatus(prev => ({
        ...prev,
        hasInternet: false,
        wifi: false,
        mobileData: false,
        airplaneMode: true
      }));
      
      // Acionar modo pânico imediatamente quando offline
      if (isMonitoring) {
        triggerPanicMode('Dispositivo offline');
      }
    };

    // Adicionar listeners para mudanças de conectividade
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Adicionar listener para mudanças na Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          console.log('🔄 Mudança na conexão detectada');
          checkConnectionStatus().then(setConnectionStatus);
        });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMonitoring]);

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
