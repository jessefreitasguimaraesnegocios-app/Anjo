import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileVideo, FileAudio, MapPin, Download, Trash2, Calendar, Search, Filter, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useRecordings, Recording } from "@/hooks/useRecordings";
import { useDevices } from "@/hooks/useDevices";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Evidencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { getRecordings, deleteRecording, downloadRecordingFile, getRecordingUrl } = useRecordings();
  const { getDevices } = useDevices();
  const { getSubscription, isSubscriptionActive, getDaysRemaining } = useSubscription();
  const queryClient = useQueryClient();

  // Fetch recordings
  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ['recordings'],
    queryFn: getRecordings,
  });

  // Fetch devices for context
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  // Delete recording mutation
  const deleteRecordingMutation = useMutation({
    mutationFn: deleteRecording,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      toast.success('Evidência removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover evidência');
    },
  });

  const handleDownload = async (recording: Recording) => {
    if (!recording.file_path) {
      toast.error('Arquivo não disponível para download');
      return;
    }

    try {
      // Simular download - criar um arquivo fake baseado no tipo
      const fileExt = recording.type === 'video' ? 'mp4' : 
                     recording.type === 'audio' ? 'mp3' : 
                     recording.type === 'location' ? 'json' : 'mp4';
      
      const fileName = `${recording.type}_${recording.id}.${fileExt}`;
      
      // Criar conteúdo simulado baseado no tipo
      let content = '';
      let mimeType = '';
      
      if (recording.type === 'location') {
        content = JSON.stringify({
          latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
          longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
          accuracy: Math.random() * 10,
          timestamp: recording.created_at,
          device: "Simulated Device"
        }, null, 2);
        mimeType = 'application/json';
      } else {
        // Para vídeo e áudio, criar um arquivo de texto simulando metadados
        content = `Metadados do arquivo ${recording.type}:
ID: ${recording.id}
Tipo: ${recording.type}
Duração: ${recording.duration || 0} segundos
Tamanho: ${recording.size || 0} MB
Data: ${recording.created_at}
Dispositivo: ${getDeviceName(recording.device_id)}`;
        mimeType = 'text/plain';
      }
      
      // Criar blob e fazer download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download iniciado!', {
        description: `Arquivo ${fileName} baixado com sucesso`
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer download');
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "video":
        return <FileVideo className="h-5 w-5" />;
      case "audio":
        return <FileAudio className="h-5 w-5" />;
      case "location":
        return <MapPin className="h-5 w-5" />;
      case "panic":
        return <FileVideo className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "video":
        return "Vídeo";
      case "audio":
        return "Áudio";
      case "location":
        return "Localização";
      case "panic":
        return "Pânico";
      default:
        return tipo;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || "Dispositivo desconhecido";
  };

  // Filter recordings
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTypeLabel(recording.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || recording.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate storage usage
  const totalSize = recordings.reduce((sum, recording) => sum + (recording.size || 0), 0);
  const storageUsedMB = totalSize / (1024 * 1024);
  const storageLimitMB = 5 * 1024; // 5GB
  const storagePercentage = (storageUsedMB / storageLimitMB) * 100;

  const isActive = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);

  if (recordingsLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando evidências...</p>
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
          <h1 className="text-3xl font-bold mb-2">Evidências e Arquivos</h1>
          <p className="text-muted-foreground">
            Histórico de gravações, dados coletados e downloads disponíveis
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="p-6 mb-8 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {subscription.plan_type === 'free_trial' ? 'Trial Gratuito' : 'Plano Mensal'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan_type === 'free_trial' 
                    ? `${daysRemaining} dias restantes` 
                    : '5GB disponíveis'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatFileSize(totalSize)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan_type === 'free_trial' 
                    ? 'de 1GB utilizados' 
                    : 'de 5GB utilizados'
                  }
                </p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Evidências</p>
                <p className="text-2xl font-bold text-primary">{recordings.length}</p>
              </div>
              <FileVideo className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Downloads Disponíveis</p>
                <p className="text-2xl font-bold text-primary">
                  {recordings.filter(r => r.file_path).length}
                </p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Registro</p>
                <p className="text-2xl font-bold text-primary">
                  {recordings.length > 0 
                    ? new Date(recordings[0].created_at).toLocaleDateString()
                    : 'Nenhum'
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos e evidências..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos os tipos</option>
            <option value="video">Vídeo</option>
            <option value="audio">Áudio</option>
            <option value="location">Localização</option>
            <option value="panic">Pânico</option>
          </select>
        </div>

        {/* Lista de Evidências e Arquivos */}
        <div className="space-y-4">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="p-6 hover:shadow-glow transition-all">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon and Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {getIcon(recording.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">
                      {getTypeLabel(recording.type)} - {new Date(recording.created_at).toLocaleString()}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{getTypeLabel(recording.type)}</span>
                      <span>•</span>
                      <span>{formatFileSize(recording.size)}</span>
                      <span>•</span>
                      <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dispositivo: {getDeviceName(recording.device_id)}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="hidden lg:flex flex-col gap-1 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duração</p>
                    <p className="font-medium">{formatDuration(recording.duration)}</p>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2">
                  {recording.file_path ? (
                    <>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        Disponível
                      </Badge>
                      <Button 
                        size="icon" 
                        variant="default"
                        onClick={() => handleDownload(recording)}
                        title="Download disponível"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary" className="animate-pulse">
                      Processando...
                    </Badge>
                  )}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => deleteRecordingMutation.mutate(recording.id)}
                    title="Remover evidência"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecordings.length === 0 && (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {recordings.length === 0 ? 'Nenhum arquivo disponível' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-muted-foreground">
              {recordings.length === 0 
                ? 'Ative o botão de pânico para começar a registrar evidências'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}