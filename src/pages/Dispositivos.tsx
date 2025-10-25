import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Smartphone, 
  Laptop, 
  Plus,
  MapPin,
  Radio,
  Video,
  Mic,
  Trash2,
  Edit,
  Wifi
} from "lucide-react";
import { useDevices, Device, CreateDeviceData } from "@/hooks/useDevices";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Dispositivos() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [remoteLocationForm, setRemoteLocationForm] = useState({
    email: '',
    password: ''
  });
  const [deviceForm, setDeviceForm] = useState<CreateDeviceData>({
    name: '',
    type: 'phone',
    is_third_party: false,
    third_party_email: '',
    records_password: '',
    recording_time_limit: 1,
  });

  const { getDevices, createDevice, updateDevice, deleteDevice, updateDeviceStatus } = useDevices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch devices
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  });

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if ((window as any).showNotification) {
        (window as any).showNotification('success', 'Dispositivo adicionado com sucesso!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', error.message || 'Erro ao adicionar dispositivo');
      }
    },
  });

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Device> }) => 
      updateDevice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if ((window as any).showNotification) {
        (window as any).showNotification('success', 'Dispositivo atualizado com sucesso!');
      }
      setEditingDevice(null);
      resetForm();
    },
    onError: (error: any) => {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', error.message || 'Erro ao atualizar dispositivo');
      }
    },
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if ((window as any).showNotification) {
        (window as any).showNotification('success', 'Dispositivo removido com sucesso!');
      }
    },
    onError: (error: any) => {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', error.message || 'Erro ao remover dispositivo');
      }
    },
  });

  const resetForm = () => {
    setDeviceForm({
      name: '',
      type: 'phone',
      is_third_party: false,
      third_party_email: '',
      records_password: '',
      recording_time_limit: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!deviceForm.name.trim()) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Nome do dispositivo é obrigatório');
      }
      return;
    }
    
    if (!deviceForm.records_password?.trim()) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Senha de registros é obrigatória');
      }
      return;
    }
    
    // Preparar dados para envio
    const deviceData = {
      name: deviceForm.name.trim(),
      type: deviceForm.type,
      is_third_party: deviceForm.is_third_party || false,
      third_party_email: deviceForm.third_party_email?.trim() || null,
      records_password: deviceForm.records_password.trim(),
    };
    
    if (editingDevice) {
      updateDeviceMutation.mutate({
        id: editingDevice.id,
        updates: deviceData,
      });
    } else {
      createDeviceMutation.mutate(deviceData);
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setDeviceForm({
      name: device.name,
      type: device.type,
      is_third_party: device.is_third_party,
      third_party_email: device.third_party_email || '',
      records_password: device.records_password || '',
      recording_time_limit: device.recording_time_limit || 5,
    });
    setIsAddDialogOpen(true);
  };

  const handleDeviceAction = async (action: string, deviceId: string) => {
    try {
      // Simular ação remota - em produção seria uma chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      if ((window as any).showNotification) {
        (window as any).showNotification('success', `${action} ativado para o dispositivo`);
      }
    } catch (error) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Erro ao enviar comando');
      }
    }
  };

  const handleRemoteLocation = async () => {
    if (!remoteLocationForm.email.trim() || !remoteLocationForm.password.trim()) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Email e senha são obrigatórios');
      }
      return;
    }

    try {
      // Simular validação - em produção seria uma chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if ((window as any).showNotification) {
        (window as any).showNotification('success', 'Acesso autorizado! Redirecionando...');
      }
      
      // Navegar para a tela de controle remoto com os dados do dispositivo
      setTimeout(() => {
        navigate('/controle-remoto', { 
          state: { 
            email: remoteLocationForm.email, 
            password: remoteLocationForm.password 
          } 
        });
      }, 1500);
      
    } catch (error) {
      if ((window as any).showNotification) {
        (window as any).showNotification('error', 'Erro ao validar credenciais');
      }
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="h-5 w-5" />;
      case 'pc':
        return <Laptop className="h-5 w-5" />;
      case 'tablet':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phone':
        return 'Smartphone';
      case 'pc':
        return 'Computador';
      case 'tablet':
        return 'Tablet';
      default:
        return type;
    }
  };

  const myDevices = devices.filter(d => !d.is_third_party);
  const thirdPartyDevices = devices.filter(d => d.is_third_party);

  if (isLoading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispositivos</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore seus dispositivos e de terceiros
          </p>
        </div>

        {/* Localizar Dispositivo Remoto */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Localizar Dispositivo Remoto</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Ative o modo pânico em dispositivos de terceiros usando email e senha
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="remote-email">Email</Label>
              <Input
                id="remote-email"
                type="email"
                value={remoteLocationForm.email}
                onChange={(e) => setRemoteLocationForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remote-password">Senha</Label>
              <Input
                id="remote-password"
                type="password"
                value={remoteLocationForm.password}
                onChange={(e) => setRemoteLocationForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleRemoteLocation}
            disabled={!remoteLocationForm.email.trim() || !remoteLocationForm.password.trim()}
            className="w-full md:w-auto"
          >
            Acessar
          </Button>
        </Card>

        {/* Add Device Button */}
        <div className="mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto gap-2" size="lg">
                <Plus className="h-4 w-4" />
                Adicionar Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDevice ? 'Editar Dispositivo' : 'Adicionar Dispositivo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Dispositivo</Label>
                  <Input
                    id="name"
                    value={deviceForm.name}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Meu iPhone"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={deviceForm.type}
                    onValueChange={(value: 'phone' | 'pc' | 'tablet') => 
                      setDeviceForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Smartphone</SelectItem>
                      <SelectItem value="pc">Computador</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    <input
                      type="checkbox"
                      checked={deviceForm.is_third_party}
                      onChange={(e) => setDeviceForm(prev => ({ 
                        ...prev, 
                        is_third_party: e.target.checked 
                      }))}
                      className="mr-2"
                    />
                    Dispositivo de terceiro
                  </Label>
                </div>

                {deviceForm.is_third_party && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do proprietário</Label>
                    <Input
                      id="email"
                      type="email"
                      value={deviceForm.third_party_email}
                      onChange={(e) => setDeviceForm(prev => ({ 
                        ...prev, 
                        third_party_email: e.target.value 
                      }))}
                      placeholder="proprietario@email.com"
                      required={deviceForm.is_third_party}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="records_password">Senha de Registros</Label>
                  <Input
                    id="records_password"
                    type="password"
                    value={deviceForm.records_password}
                    onChange={(e) => setDeviceForm(prev => ({ 
                      ...prev, 
                      records_password: e.target.value 
                    }))}
                    placeholder="Senha para acessar downloads deste dispositivo"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta senha será usada para acessar os registros específicos deste dispositivo
                  </p>
                </div>

                {/* Controle de Tempo de Gravação */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tempo de Gravação</Label>
                    <p className="text-xs text-muted-foreground">
                      Defina o tempo limite para gravações deste dispositivo (1 a 60 minutos)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {deviceForm.recording_time_limit} {deviceForm.recording_time_limit === 1 ? 'minuto' : 'minutos'}
                    </div>
                  </div>
                  
                  <div className="px-4">
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={deviceForm.recording_time_limit || 1}
                      onChange={(e) => setDeviceForm(prev => ({ 
                        ...prev, 
                        recording_time_limit: parseInt(e.target.value) 
                      }))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((deviceForm.recording_time_limit || 1) - 1) * 100 / 59}%, #e5e7eb ${((deviceForm.recording_time_limit || 1) - 1) * 100 / 59}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>1 min</span>
                      <span>30 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ As gravações não podem ser canceladas até completar o tempo definido
                    </p>
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
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createDeviceMutation.isPending || updateDeviceMutation.isPending}>
                    {createDeviceMutation.isPending || updateDeviceMutation.isPending 
                      ? 'Salvando...' 
                      : (editingDevice ? 'Atualizar' : 'Adicionar')
                    }
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingDevice(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Devices */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Meus Dispositivos ({myDevices.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {myDevices.map((device) => (
              <Card key={device.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getTypeLabel(device.type)}</span>
                        {device.last_seen && (
                          <>
                            <span>•</span>
                            <span>Última vez: {new Date(device.last_seen).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={device.status === "online" ? "outline" : "secondary"}
                      className={device.status === "online" ? "bg-success/10 text-success border-success" : ""}
                    >
                      {device.status === "online" ? "Ativo" : "Offline"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteDeviceMutation.mutate(device.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Third Party Devices */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Dispositivos de Terceiros ({thirdPartyDevices.length})</h2>
          
          {/* Activation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <Button className="w-full gap-2" size="lg">
              <Video className="h-4 w-4" />
              Ativar via Web
            </Button>
            <Button className="w-full gap-2 bg-success hover:bg-success/90" size="lg">
              <Mic className="h-4 w-4" />
              Ativar via SMS
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {thirdPartyDevices.map((device) => (
              <Card key={device.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-xs text-muted-foreground">{device.third_party_email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{getTypeLabel(device.type)}</span>
                        {device.last_seen && (
                          <>
                            <span>•</span>
                            <span>Última vez: {new Date(device.last_seen).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={device.status === "online" ? "outline" : "secondary"}
                      className={device.status === "online" ? "bg-success/10 text-success border-success" : ""}
                    >
                      {device.status === "online" ? "Ativo" : "Offline"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteDeviceMutation.mutate(device.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Control Buttons Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="gap-2 bg-primary hover:bg-primary/90"
                    size="sm" 
                    onClick={() => handleDeviceAction("Vídeo", device.id)}
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </Button>

                  <Button 
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                    size="sm" 
                    onClick={() => handleDeviceAction("Áudio", device.id)}
                  >
                    <Mic className="h-4 w-4" />
                    Áudio
                  </Button>

                  <Button 
                    className="gap-2 bg-success hover:bg-success/90"
                    size="sm" 
                    onClick={() => handleDeviceAction("Local", device.id)}
                  >
                    <MapPin className="h-4 w-4" />
                    Local
                  </Button>

                  <Button 
                    className="gap-2 bg-orange-600 hover:bg-orange-700"
                    size="sm" 
                    onClick={() => handleDeviceAction("Live", device.id)}
                  >
                    <Radio className="h-4 w-4" />
                    Live
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {devices.length === 0 && (
          <Card className="p-12 text-center">
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dispositivo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione seu primeiro dispositivo para começar
            </p>
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar Dispositivo
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}