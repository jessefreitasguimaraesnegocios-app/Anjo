import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Wifi, 
  Camera, 
  MapPin, 
  Navigation,
  Maximize2,
  Minimize2,
  Route
} from 'lucide-react';

export default function ModoLive() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Estados para expansão responsiva
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'rear'>('front');
  
  // Estados para localização
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  // Obter localização atual
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, []);

  // Função para alternar expansão do vídeo
  const toggleVideoExpansion = () => {
    if (locationExpanded) {
      setLocationExpanded(false);
    }
    setVideoExpanded(!videoExpanded);
  };

  // Função para alternar expansão da localização
  const toggleLocationExpansion = () => {
    if (videoExpanded) {
      setVideoExpanded(false);
    }
    setLocationExpanded(!locationExpanded);
  };

  // Função para alternar entre trajeto e ponto
  const toggleRoute = () => {
    setShowRoute(!showRoute);
  };

  // Função para abrir navegação
  const openNavigation = () => {
    if (locationData) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
      window.open(url, '_blank');
    }
  };

  // Determinar classes CSS baseadas no estado de expansão
  const getVideoClasses = () => {
    if (videoExpanded) return 'h-screen';
    if (locationExpanded) return 'h-0';
    return 'h-1/2';
  };

  const getLocationClasses = () => {
    if (locationExpanded) return 'h-screen';
    if (videoExpanded) return 'h-0';
    return 'h-1/2';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <Wifi className="h-6 w-6 text-white" />
          <h1 className="text-xl font-semibold text-white">Modo Live Ativo</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Seção de Vídeo */}
      <div 
        className={`relative transition-all duration-300 ${getVideoClasses()}`}
        onClick={toggleVideoExpansion}
      >
        <Card className="h-full bg-black border-0 rounded-none">
          <div className="h-full flex flex-col items-center justify-center relative">
            {/* Ícone da câmera */}
            <div className="flex flex-col items-center gap-4">
              <Camera className="h-16 w-16 text-gray-400" />
              <p className="text-gray-400 text-lg">
                {cameraType === 'front' ? 'Feed da Câmera Frontal' : 'Feed da Câmera Traseira'}
              </p>
            </div>

            {/* Botões de câmera */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                variant={cameraType === 'front' ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCameraType('front');
                }}
                className="text-white"
              >
                Frontal
              </Button>
              <Button
                variant={cameraType === 'rear' ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCameraType('rear');
                }}
                className="text-white"
              >
                Traseira
              </Button>
            </div>

            {/* Botão de expansão */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                toggleVideoExpansion();
              }}
            >
              {videoExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* Seção de Localização */}
      <div 
        className={`relative transition-all duration-300 ${getLocationClasses()}`}
        onClick={toggleLocationExpansion}
      >
        <Card className="h-full bg-blue-900 border-0 rounded-none">
          <div className="h-full flex flex-col items-center justify-center relative">
            {/* Ícone de localização */}
            <div className="flex flex-col items-center gap-4">
              <MapPin className="h-16 w-16 text-blue-300" />
              <p className="text-blue-300 text-lg">Localização em Tempo Real</p>
            </div>

            {/* Coordenadas */}
            {locationData && (
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-white text-sm">
                  <div>Lat: {locationData.lat.toFixed(6)}</div>
                  <div>Lng: {locationData.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Botão Encontrar Dispositivo */}
            <div className="absolute bottom-4 left-4">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRoute();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Route className="h-4 w-4" />
                {showRoute ? 'Mostrar Ponto' : 'Mostrar Trajeto'}
              </Button>
            </div>

            {/* Botão de navegação */}
            <div className="absolute bottom-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openNavigation();
                }}
                className="text-white border-white hover:bg-white/10 gap-2"
              >
                <Navigation className="h-4 w-4" />
                Navegar
              </Button>
            </div>

            {/* Botão de expansão */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                toggleLocationExpansion();
              }}
            >
              {locationExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
        Este modo exibe informações em tempo real e não grava evidências.
      </div>
    </div>
  );
}
