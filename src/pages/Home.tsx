import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle, Camera, Mic, MapPin, Activity, Square, Play, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useDevices } from '@/hooks/useDevices';
import { useRecordings } from '@/hooks/useRecordings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RecordingState {
  videoRecorder: MediaRecorder | null;
  audioRecorder: MediaRecorder | null;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  locationWatchId: number | null;
  isRecording: boolean;
  recordingType: 'video' | 'audio' | 'location' | 'panic' | null;
}

interface SavedRecording {
  id: string;
  type: 'video' | 'audio' | 'location';
  blob: Blob;
  fileName: string;
  duration: number;
  timestamp: Date;
}

export default function Home() {
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState({
    camera: false,
    audio: false,
    location: false,
  });
  const [recordingState, setRecordingState] = useState<RecordingState>({
    videoRecorder: null,
    audioRecorder: null,
    videoStream: null,
    audioStream: null,
    locationWatchId: null,
    isRecording: false,
    recordingType: null,
  });
  const [locationData, setLocationData] = useState<GeolocationPosition | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);

  const { getDevices } = useDevices();
  const { createRecording, updateRecording } = useRecordings();
  const queryClient = useQueryClient();

  // Fetch devices with error handling
  const { data: devices = [], isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    retry: false,
    onError: (error) => {
      console.error('Erro ao carregar dispositivos:', error);
    }
  });

  // Create recording mutation
  const createRecordingMutation = useMutation({
    mutationFn: createRecording,
    onSuccess: (recording) => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar gravação');
    },
  });

  // Update recording mutation
  const updateRecordingMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateRecording(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar gravação');
    },
  });

  // Contador de duração da gravação
  useEffect(() => {
    if (recordingState.isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, [recordingState.isRecording]);

  // Atualizar vídeo quando o stream mudar
  useEffect(() => {
    if (videoRef.current && recordingState.videoStream) {
      videoRef.current.srcObject = recordingState.videoStream;
      console.log('Vídeo atualizado via useEffect:', recordingState.videoStream);
    }
  }, [recordingState.videoStream]);

  // Função para obter endereço a partir das coordenadas
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
      );
      const data = await response.json();
      
      if (data.localityInfo && data.localityInfo.administrative) {
        const admin = data.localityInfo.administrative;
        const address = `${admin[0]?.name || ''} ${admin[1]?.name || ''} ${admin[2]?.name || ''}`.trim();
        return address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Iniciar gravação de vídeo COM áudio (para modo pânico)
  const startVideoWithAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: { 
          echoCancellation: true,
          noiseSuppression: true 
        }
      });

      // Verificar se MediaRecorder é suportado
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new Error('Gravação de vídeo não suportada neste navegador');
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      videoChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Aguardar um pouco para garantir que todos os chunks foram processados
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        
        // Verificar se o blob tem conteúdo válido
        if (blob.size === 0) {
          toast.error('Erro: Arquivo de vídeo vazio');
          return;
        }
        
        // Salvar gravação para download posterior
        const recording: SavedRecording = {
          id: `video_${Date.now()}`,
          type: 'video',
          blob,
          fileName: `video_com_audio_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
          duration: recordingDuration,
          timestamp: new Date()
        };
        
        setSavedRecordings(prev => [...prev, recording]);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
        
        toast.success('Vídeo com áudio gravado!', {
          description: `Arquivo criado: ${(blob.size / 1024 / 1024).toFixed(2)} MB`
        });
      };

      recorder.start();
      
      setRecordingState(prev => ({
        ...prev,
        videoRecorder: recorder,
        videoStream: stream,
        isRecording: true,
        recordingType: 'panic'
      }));

      // Mostrar vídeo na tela
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return recorder;
    } catch (error) {
      toast.error('Erro ao iniciar gravação de vídeo com áudio');
      throw error;
    }
  };

  // Iniciar gravação de vídeo SEM áudio (botão câmera individual)
  const startVideoOnlyRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false 
      });

      // Verificar se MediaRecorder é suportado
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new Error('Gravação de vídeo não suportada neste navegador');
      }

      // Usar configuração mais simples e compatível
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      videoChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Aguardar um pouco para garantir que todos os chunks foram processados
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        
        // Verificar se o blob tem conteúdo válido
        if (blob.size === 0) {
          toast.error('Erro: Arquivo de vídeo vazio');
          return;
        }
        
        // Salvar gravação para download posterior
        const recording: SavedRecording = {
          id: `video_${Date.now()}`,
          type: 'video',
          blob,
          fileName: `video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
          duration: recordingDuration,
          timestamp: new Date()
        };
        
        setSavedRecordings(prev => [...prev, recording]);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
        
        toast.success('Vídeo gravado!', {
          description: `Arquivo criado: ${(blob.size / 1024 / 1024).toFixed(2)} MB`
        });
      };

      recorder.start();
      
      setRecordingState(prev => ({
        ...prev,
        videoRecorder: recorder,
        videoStream: stream,
        isRecording: true,
        recordingType: 'video'
      }));

      // Mostrar vídeo na tela IMEDIATAMENTE
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Vídeo definido para preview:', stream);
      }

      return recorder;
    } catch (error) {
      toast.error('Erro ao iniciar gravação de vídeo');
      throw error;
    }
  };

  // Iniciar gravação de áudio
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true 
        } 
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Salvar gravação para download posterior
        const recording: SavedRecording = {
          id: `audio_${Date.now()}`,
          type: 'audio',
          blob,
          fileName: `audio_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
          duration: recordingDuration,
          timestamp: new Date()
        };
        
        setSavedRecordings(prev => [...prev, recording]);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
        
        toast.success('Áudio gravado!', {
          description: 'Clique em "Baixar" para salvar o arquivo'
        });
      };

      recorder.start();
      
      setRecordingState(prev => ({
        ...prev,
        audioRecorder: recorder,
        audioStream: stream,
        isRecording: true,
        recordingType: 'audio'
      }));

      return recorder;
    } catch (error) {
      toast.error('Erro ao iniciar gravação de áudio');
      throw error;
    }
  };

  // Iniciar monitoramento de localização
  const startLocationTracking = async () => {
    try {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          setLocationData(position);
          console.log('Localização atualizada:', position);
          
          // Obter endereço das coordenadas
          const address = await getAddressFromCoordinates(
            position.coords.latitude, 
            position.coords.longitude
          );
          setLocationAddress(address);
        },
        (error) => {
          console.error('Erro na localização:', error);
          toast.error('Erro ao obter localização');
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      setRecordingState(prev => ({
        ...prev,
        locationWatchId: watchId,
        isRecording: true,
        recordingType: 'location'
      }));

      return watchId;
    } catch (error) {
      toast.error('Erro ao iniciar monitoramento de localização');
      throw error;
    }
  };

  // Parar todas as gravações
  const stopAllRecordings = () => {
    if (recordingState.videoRecorder && recordingState.videoRecorder.state === 'recording') {
      recordingState.videoRecorder.stop();
    }
    if (recordingState.audioRecorder && recordingState.audioRecorder.state === 'recording') {
      recordingState.audioRecorder.stop();
    }
    if (recordingState.locationWatchId) {
      navigator.geolocation.clearWatch(recordingState.locationWatchId);
    }

    // Parar streams
    if (recordingState.videoStream) {
      recordingState.videoStream.getTracks().forEach(track => track.stop());
    }
    if (recordingState.audioStream) {
      recordingState.audioStream.getTracks().forEach(track => track.stop());
    }

    // Limpar vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRecordingState({
      videoRecorder: null,
      audioRecorder: null,
      videoStream: null,
      audioStream: null,
      locationWatchId: null,
      isRecording: false,
      recordingType: null,
    });
    setLocationData(null);
    setLocationAddress('');
  };

  // Parar gravação específica
  const stopSpecificRecording = (type: 'video' | 'audio' | 'location') => {
    if (type === 'video' && recordingState.videoRecorder) {
      recordingState.videoRecorder.stop();
    }
    if (type === 'audio' && recordingState.audioRecorder) {
      recordingState.audioRecorder.stop();
    }
    if (type === 'location' && recordingState.locationWatchId) {
      navigator.geolocation.clearWatch(recordingState.locationWatchId);
    }

    // Parar streams específicos
    if (type === 'video' && recordingState.videoStream) {
      recordingState.videoStream.getTracks().forEach(track => track.stop());
      // Limpar vídeo imediatamente
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    if (type === 'audio' && recordingState.audioStream) {
      recordingState.audioStream.getTracks().forEach(track => track.stop());
    }

    // Atualizar estado
    setRecordingState(prev => ({
      ...prev,
      videoRecorder: type === 'video' ? null : prev.videoRecorder,
      audioRecorder: type === 'audio' ? null : prev.audioRecorder,
      videoStream: type === 'video' ? null : prev.videoStream,
      audioStream: type === 'audio' ? null : prev.audioStream,
      locationWatchId: type === 'location' ? null : prev.locationWatchId,
      isRecording: false,
      recordingType: null,
    }));

    if (type === 'location') {
      setLocationData(null);
    setLocationAddress('');
    }
  };

  const handlePanicButton = async () => {
    if (isPanicActive) {
      // Parar modo pânico
      setIsPanicActive(false);
      setActiveFeatures({ camera: false, audio: false, location: false });
      stopAllRecordings();
      
      toast.info("Modo pânico desativado");
    } else {
      // Ativar modo pânico
      setIsPanicActive(true);
      setActiveFeatures({ camera: true, audio: true, location: true });
      
      try {
        // Iniciar vídeo COM áudio + localização
        await Promise.all([
          startVideoWithAudioRecording(),
          startLocationTracking()
        ]);

        // Criar registro no banco
        const deviceId = devices.length > 0 ? devices[0].id : 'default-device';
        createRecordingMutation.mutate({
          device_id: deviceId,
          type: 'panic',
        });
        
        toast.success("Modo pânico ativado! Gravando evidências...", {
          description: "Vídeo com áudio e localização ativados discretamente",
        });
      } catch (error) {
        toast.error('Erro ao ativar modo pânico');
        setIsPanicActive(false);
        setActiveFeatures({ camera: false, audio: false, location: false });
      }
    }
  };

  const handleFeatureToggle = async (feature: 'camera' | 'audio' | 'location') => {
    const newState = !activeFeatures[feature];
    setActiveFeatures(prev => ({ ...prev, [feature]: newState }));

    if (newState) {
      try {
        if (feature === 'camera') {
          await startVideoOnlyRecording();
        } else if (feature === 'audio') {
          await startAudioRecording();
        } else if (feature === 'location') {
          await startLocationTracking();
        }

        // Criar registro no banco
        const recordingType = feature === 'camera' ? 'video' : 
                            feature === 'audio' ? 'audio' : 'location';
        const deviceId = devices.length > 0 ? devices[0].id : 'default-device';
        
        createRecordingMutation.mutate({
          device_id: deviceId,
          type: recordingType,
        });
        
        toast.success(`${feature === 'camera' ? 'Câmera' : 
                      feature === 'audio' ? 'Áudio' : 'Localização'} ativado`, {
          description: `Gravação de ${feature === 'camera' ? 'vídeo' : 
                       feature === 'audio' ? 'áudio' : 'localização'} iniciada`
        });
      } catch (error) {
        toast.error(`Erro ao ativar ${feature}`);
        setActiveFeatures(prev => ({ ...prev, [feature]: false }));
      }
    } else {
      // Parar gravação específica
      stopSpecificRecording(feature);

      toast.success(`${feature === 'camera' ? 'Câmera' : 
                    feature === 'audio' ? 'Áudio' : 'Localização'} desativado`, {
        description: `Gravação de ${feature === 'camera' ? 'vídeo' : 
                     feature === 'audio' ? 'áudio' : 'localização'} parada`
      });
    }
  };

  // Função para baixar gravação
  const downloadRecording = (recording: SavedRecording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = recording.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Download iniciado!', {
      description: `Arquivo ${recording.fileName} baixado`
    });
  };

  // Loading state
  if (devicesLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dispositivos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Anjo da Guarda
          </h1>
          <p className="text-muted-foreground">Sua segurança sempre protegida</p>
        </div>

        {/* HTTPS Status */}
        <Card className="max-w-2xl mx-auto mb-8 p-4 bg-success/10 border-success">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-success">HTTPS Ativo</h3>
          </div>
          <p className="text-sm text-success">
            ✅ Todas as funcionalidades disponíveis: Câmera, Áudio e Localização!
          </p>
        </Card>

        {/* Status Cards - Now clickable */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <Card 
            className={`p-4 transition-all cursor-pointer hover:shadow-glow ${activeFeatures.camera ? 'bg-success/10 border-success' : 'bg-card'}`}
            onClick={() => handleFeatureToggle('camera')}
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className={`h-6 w-6 ${activeFeatures.camera ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">Câmera</span>
              {activeFeatures.camera && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-xs text-success">Ativa</span>
                </div>
              )}
            </div>
          </Card>

          <Card 
            className={`p-4 transition-all cursor-pointer hover:shadow-glow ${activeFeatures.audio ? 'bg-success/10 border-success' : 'bg-card'}`}
            onClick={() => handleFeatureToggle('audio')}
          >
            <div className="flex flex-col items-center gap-2">
              <Mic className={`h-6 w-6 ${activeFeatures.audio ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">Áudio</span>
              {activeFeatures.audio && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-xs text-success">Ativo</span>
                </div>
              )}
            </div>
          </Card>

          <Card 
            className={`p-4 transition-all cursor-pointer hover:shadow-glow ${activeFeatures.location ? 'bg-success/10 border-success' : 'bg-card'}`}
            onClick={() => handleFeatureToggle('location')}
          >
            <div className="flex flex-col items-center gap-2">
              <MapPin className={`h-6 w-6 ${activeFeatures.location ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">Localização</span>
              {activeFeatures.location && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-xs text-success">Ativa</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Panic Button */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {isPanicActive && (
              <div className="absolute inset-0 animate-ping">
                <div className="w-full h-full rounded-full bg-red-500 opacity-75"></div>
              </div>
            )}
            <Button
              variant={isPanicActive ? "destructive" : "default"}
              size="lg"
              onClick={handlePanicButton}
              className="relative h-48 w-48 rounded-full text-2xl"
              disabled={createRecordingMutation.isPending}
            >
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-16 w-16" />
                <span>{isPanicActive ? "PARAR" : "PÂNICO"}</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Recording Status */}
        {recordingState.isRecording && (
          <Card className="max-w-2xl mx-auto mb-8 p-6 bg-gradient-card">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-red-500">GRAVANDO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Duração: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </p>
              {locationData && (
                <div className="text-xs text-muted-foreground mt-1">
                  <p className="font-medium">📍 {locationAddress || 'Obtendo endereço...'}</p>
                  <p className="text-xs opacity-75">
                    Lat: {locationData.coords.latitude.toFixed(6)}, 
                    Lng: {locationData.coords.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Video Preview */}
        {activeFeatures.camera && (
          <Card className="max-w-2xl mx-auto mb-8 p-4">
            <h3 className="text-lg font-semibold mb-4">Preview da Câmera</h3>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 object-cover rounded-lg"
            />
          </Card>
        )}

        {/* Location Map */}
        {activeFeatures.location && locationData && (
          <Card className="max-w-2xl mx-auto mb-8 p-4">
            <h3 className="text-lg font-semibold mb-4">📍 Localização Atual</h3>
            <div className="space-y-3">
              <div className="bg-card p-3 rounded-lg">
                <p className="font-medium text-sm">{locationAddress || 'Obtendo endereço...'}</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {locationData.coords.latitude.toFixed(6)}, 
                  Lng: {locationData.coords.longitude.toFixed(6)}
                </p>
              </div>
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationData.coords.longitude-0.001},${locationData.coords.latitude-0.001},${locationData.coords.longitude+0.001},${locationData.coords.latitude+0.001}&layer=mapnik&marker=${locationData.coords.latitude},${locationData.coords.longitude}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Saved Recordings */}
        {savedRecordings.length > 0 && (
          <Card className="max-w-2xl mx-auto mb-8 p-6 bg-gradient-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Gravações Salvas
            </h3>
            <div className="space-y-3">
              {savedRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div className="flex items-center gap-3">
                    {recording.type === 'video' && <Camera className="h-4 w-4 text-primary" />}
                    {recording.type === 'audio' && <Mic className="h-4 w-4 text-primary" />}
                    {recording.type === 'location' && <MapPin className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="text-sm font-medium">{recording.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {recording.duration}s • {recording.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadRecording(recording)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="max-w-2xl mx-auto p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Como funciona
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Pressione o botão de pânico em caso de emergência</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Vídeo com áudio e localização serão ativados discretamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Os arquivos são salvos e você pode baixar quando quiser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Use os botões individuais para gravar apenas o que precisar</span>
            </li>
          </ul>
        </Card>

        {/* Device Status */}
        {devices.length > 0 && (
          <Card className="max-w-2xl mx-auto mt-8 p-6 bg-gradient-card">
            <h3 className="text-lg font-semibold mb-4">Status dos Dispositivos</h3>
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between">
                  <span className="text-sm">{device.name}</span>
                  <Badge 
                    variant={device.status === "online" ? "outline" : "secondary"}
                    className={device.status === "online" ? "bg-success/10 text-success border-success" : ""}
                  >
                    {device.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Debug Info */}
        {devicesError && (
          <Card className="max-w-2xl mx-auto mt-8 p-6 bg-destructive/10 border-destructive">
            <h3 className="text-lg font-semibold mb-4 text-destructive">Erro de Conexão</h3>
            <p className="text-sm text-destructive">
              Não foi possível carregar os dispositivos. Verifique sua conexão com a internet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}