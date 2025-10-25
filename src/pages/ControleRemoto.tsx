import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  AlertTriangle,
  Video,
  Mic,
  MapPin,
  Wifi,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ControleRemoto() {
  const [activationMethod, setActivationMethod] = useState<'sms' | 'web'>('sms');
  const [recordingTime, setRecordingTime] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegar dados do dispositivo da navegação
  const deviceData = location.state as { 
    email: string; 
    password: string; 
    deviceName?: string;
    deviceType?: string;
  } || { 
    email: 'jessefreitasguimaraes@gmail.com', 
    password: '',
    deviceName: 'Dispositivo Remoto',
    deviceType: 'phone'
  };

  const handleAction = async (action: string) => {
    try {
      // Simular envio de comando
      await new Promise(resolve => setTimeout(resolve, 1000));
      if ((window as any).showNotification) {
        (window as any).showNotification('success', `Comando ${action} enviado via ${activationMethod.toUpperCase()}!`);
      }
    } catch (error) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Erro ao enviar comando');
      }
    }
  };

  const handleBack = () => {
    navigate('/dispositivos');
  };

  const handleChangeDevice = () => {
    navigate('/dispositivos');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Plus className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Controle Remoto</h1>
          </div>
        </div>

        {/* Device Info */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Controlando:</p>
              <p className="text-lg font-semibold text-green-500">{deviceData.deviceName || deviceData.email}</p>
              <p className="text-sm text-muted-foreground">{deviceData.email}</p>
              <p className="text-xs text-muted-foreground">
                {deviceData.deviceType === 'phone' ? 'Smartphone' : 
                 deviceData.deviceType === 'pc' ? 'Computador' : 
                 deviceData.deviceType === 'tablet' ? 'Tablet' : 'Dispositivo'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleChangeDevice}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Trocar
            </Button>
          </div>
        </Card>

        {/* Activation Method */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Método de Ativação</h2>
          <div className="flex gap-2">
            <Button
              variant={activationMethod === 'sms' ? 'default' : 'outline'}
              onClick={() => setActivationMethod('sms')}
              className="flex-1"
            >
              SMS
            </Button>
            <Button
              variant={activationMethod === 'web' ? 'default' : 'outline'}
              onClick={() => setActivationMethod('web')}
              className="flex-1"
            >
              Web
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Pânico */}
          <Button
            size="lg"
            className="h-20 bg-red-600 hover:bg-red-700 text-white gap-3"
            onClick={() => handleAction('Pânico')}
          >
            <AlertTriangle className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Pânico ({activationMethod.toUpperCase()})</div>
            </div>
          </Button>

          {/* Gravar Vídeo */}
          <Button
            size="lg"
            variant="outline"
            className="h-20 gap-3"
            onClick={() => handleAction('Gravar Vídeo')}
          >
            <Video className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Gravar Vídeo ({activationMethod.toUpperCase()})</div>
            </div>
          </Button>

          {/* Gravar Áudio */}
          <Button
            size="lg"
            variant="outline"
            className="h-20 gap-3"
            onClick={() => handleAction('Gravar Áudio')}
          >
            <Mic className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Gravar Áudio ({activationMethod.toUpperCase()})</div>
            </div>
          </Button>

          {/* Localização */}
          <Button
            size="lg"
            variant="outline"
            className="h-20 gap-3"
            onClick={() => handleAction('Localização')}
          >
            <MapPin className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Localização ({activationMethod.toUpperCase()})</div>
            </div>
          </Button>

          {/* Modo Live */}
          <Button
            size="lg"
            variant="outline"
            className="h-20 gap-3 md:col-span-2"
            onClick={() => navigate('/modo-live')}
          >
            <Wifi className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Modo Live ({activationMethod.toUpperCase()})</div>
            </div>
          </Button>
        </div>

        {/* Recording Time Control */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tempo de gravação automática</h2>
          
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {recordingTime} {recordingTime === 1 ? 'min' : 'min'}
            </div>
          </div>
          
          <div className="px-4">
            <input
              type="range"
              min="1"
              max="60"
              value={recordingTime}
              onChange={(e) => setRecordingTime(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(recordingTime - 1) * 100 / 59}%, #e5e7eb ${(recordingTime - 1) * 100 / 59}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>
          
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </Card>
      </div>
    </div>
  );
}
