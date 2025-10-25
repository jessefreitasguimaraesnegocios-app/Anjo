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
  
  const [isMonitoring, setIsMonitoring] = useState(true); // Sempre ativado
  const panicTriggeredRef = useRef(false);
  const panicTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { createRecording } = useRecordings();
  const { getDevices } = useDevices();

  // Função para detectar status da conexão
  const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
    try {
      // Verificar conectividade básica
      const hasInternet = navigator.onLine;
      
      // Testar conectividade real com timeout muito curto
      let realInternet = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId);
        realInternet = true;
      } catch (error) {
        realInternet = false;
      }
      
      // Detectar modo avião: apenas quando navigator.onLine é false E não consegue conectar
      // Se tem internet mas não consegue conectar, pode ser problema de rede, não modo avião
      const airplaneMode = !hasInternet && !realInternet;
      
      // Detectar WiFi e dados móveis baseado na conectividade real
      let wifi = false;
      let mobileData = false;
      
      // Tentar usar Network Information API se disponível
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const type = connection.type;
          const effectiveType = connection.effectiveType;
          
          console.log('Network API info:', { type, effectiveType, downlink: connection.downlink });
          
          // Detectar WiFi
          if (type === 'wifi') {
            wifi = realInternet;
          }
          
          // Detectar dados móveis
          if (type === 'cellular') {
            mobileData = realInternet;
          }
          
          // Se não conseguiu detectar tipo específico, usar conectividade geral
          if (type === 'unknown' || type === 'none') {
            wifi = false;
            mobileData = false;
          }
        }
      } else {
        // Fallback: usar conectividade geral
        if (realInternet) {
          // Assumir WiFi se tem internet
          wifi = true;
          mobileData = false;
        } else {
          wifi = false;
          mobileData = false;
        }
      }
      
      // Log detalhado para debug
      console.log('🔍 Detecção de conexão:', {
        navigatorOnline: hasInternet,
        realInternet,
        airplaneMode,
        wifi,
        mobileData,
        networkType: 'connection' in navigator ? (navigator as any).connection?.type : 'não disponível'
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
        airplaneMode: false, // Não assumir modo avião em caso de erro
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
      
      // Buscar dispositivo ativo (funciona offline)
      let devices: any[] = [];
      try {
        devices = await getDevices();
      } catch (deviceError) {
        console.warn('⚠️ Erro ao buscar dispositivos (funcionando offline):', deviceError);
        // Criar dispositivo local se offline
        devices = [{
          id: `local_device_${Date.now()}`,
          name: 'Dispositivo Local',
          type: 'phone',
          status: 'online'
        }];
      }
      
      const activeDevice = devices.find(d => d.status === 'online') || devices[0];
      
      if (!activeDevice) {
        console.log('⚠️ Nenhum dispositivo encontrado para modo pânico');
        panicTriggeredRef.current = false;
        return;
      }

      console.log('📱 Usando dispositivo para pânico:', activeDevice);

      // Criar gravação de pânico automático com 60 minutos
      const panicRecording = await createRecording({
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

      console.log('✅ Gravação de pânico automático iniciada (60 min):', panicRecording);
      
      // Notificar sucesso
      if ((window as any).showNotification) {
        (window as any).showNotification('warning', `Modo pânico ativado: ${reason}`);
      }
      
      // Configurar timeout para parar o pânico após 60 minutos
      panicTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Tempo de pânico expirado (60 min)');
        panicTriggeredRef.current = false;
        
        if ((window as any).showNotification) {
          (window as any).showNotification('info', 'Modo pânico automático finalizado após 60 minutos');
        }
      }, 60 * 60 * 1000); // 60 minutos
      
    } catch (error) {
      console.error('❌ Erro ao acionar modo pânico:', error);
      
      // Notificar erro específico
      let errorMessage = 'Erro ao acionar modo pânico automático';
      if (error instanceof Error) {
        if (error.message.includes('offline') || error.message.includes('network')) {
          errorMessage = 'Modo pânico ativado (funcionando offline)';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      if ((window as any).showNotification) {
        (window as any).showNotification('error', errorMessage);
      }
      
      // Resetar flag em caso de erro crítico
      panicTriggeredRef.current = false;
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
        // Conexão restaurada - parar modo pânico apenas se não for modo avião
        if (!newStatus.airplaneMode) {
          console.log('📶 Conexão restaurada - parando pânico');
          stopPanicMode();
        }
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

  // Função para teste manual de conexão
  const testConnection = async () => {
    console.log('🧪 Teste manual de conexão iniciado...');
    const status = await checkConnectionStatus();
    setConnectionStatus(status);
    
    if ((window as any).showNotification) {
      (window as any).showNotification('info', `Teste realizado: WiFi ${status.wifi ? 'ON' : 'OFF'}, Dados ${status.mobileData ? 'ON' : 'OFF'}, Modo Avião ${status.airplaneMode ? 'ON' : 'OFF'}`);
    }
    
    return status;
  };

  return {
    connectionStatus,
    isMonitoring,
    setIsMonitoring,
    triggerPanicMode,
    stopPanicMode,
    checkConnectionStatus,
    testConnection
  };
};
