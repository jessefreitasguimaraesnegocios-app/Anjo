import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation,
  Route,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationDisplayProps {
  title?: string;
  showExpansion?: boolean;
  isExpanded?: boolean;
  onToggleExpansion?: () => void;
  className?: string;
}

export const LocationDisplay = ({ 
  title = "Localização em Tempo Real",
  showExpansion = true,
  isExpanded = false,
  onToggleExpansion,
  className = ""
}: LocationDisplayProps) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showRoute, setShowRoute] = useState(false);

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

  return (
    <Card className={`bg-blue-900 border-0 ${className}`}>
      <div className="h-full flex flex-col items-center justify-center relative p-4">
        {/* Ícone de localização */}
        <div className="flex flex-col items-center gap-4">
          <MapPin className="h-12 w-12 text-blue-300" />
          <p className="text-blue-300 text-lg text-center">{title}</p>
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

        {/* Botões de controle */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={toggleRoute}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1"
          >
            <Route className="h-4 w-4" />
            {showRoute ? 'Mostrar Ponto' : 'Mostrar Trajeto'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={openNavigation}
            className="text-white border-white hover:bg-white/10 gap-2"
          >
            <Navigation className="h-4 w-4" />
            Navegar
          </Button>
        </div>

        {/* Botão de expansão */}
        {showExpansion && onToggleExpansion && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white hover:bg-white/10"
            onClick={onToggleExpansion}
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </Card>
  );
};
