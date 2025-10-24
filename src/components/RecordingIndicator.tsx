import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Square, Camera, Mic, MapPin } from 'lucide-react';
import { useGlobalRecording } from '@/hooks/useGlobalRecording';

export const RecordingIndicator = () => {
  const { state, stopPersistentRecording } = useGlobalRecording();
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calcular tempo restante
  useEffect(() => {
    if (!state.isRecording || !state.isPersistent) return;

    const startTime = Date.now();
    const totalDuration = state.recordingTimeLimit * 60 * 1000; // Converter para ms

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      setTimeRemaining(Math.ceil(remaining / 1000)); // Converter para segundos
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [state.isRecording, state.isPersistent, state.recordingTimeLimit]);

  // Não mostrar se não estiver gravando
  if (!state.isRecording || !state.isPersistent) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingIcon = () => {
    if (state.recordingType === 'panic') {
      return <Activity className="h-4 w-4 animate-pulse" />;
    } else if (state.recordingType === 'video') {
      return <Camera className="h-4 w-4" />;
    } else if (state.recordingType === 'audio') {
      return <Mic className="h-4 w-4" />;
    } else if (state.recordingType === 'location') {
      return <MapPin className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getRecordingLabel = () => {
    if (state.recordingType === 'panic') {
      return 'Modo Pânico';
    } else if (state.recordingType === 'video') {
      return 'Gravação de Vídeo';
    } else if (state.recordingType === 'audio') {
      return 'Gravação de Áudio';
    } else if (state.recordingType === 'location') {
      return 'Rastreamento de Localização';
    }
    return 'Gravando';
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getRecordingIcon()}
              <span className="font-semibold text-red-700 dark:text-red-300">
                {getRecordingLabel()}
              </span>
            </div>
            
            <Badge variant="destructive" className="animate-pulse">
              {formatTime(timeRemaining)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicadores de recursos ativos */}
            {state.activeFeatures.camera && (
              <Camera className="h-3 w-3 text-red-600" />
            )}
            {state.activeFeatures.audio && (
              <Mic className="h-3 w-3 text-red-600" />
            )}
            {state.activeFeatures.location && (
              <MapPin className="h-3 w-3 text-red-600" />
            )}
          </div>
        </div>

        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          ⚠️ Gravação em andamento - Não pode ser cancelada até completar o tempo
        </div>
      </Card>
    </div>
  );
};
