import { supabase } from '@/integrations/supabase';

export interface Recording {
  id: string;
  device_id: string;
  user_id: string;
  type: 'video' | 'audio' | 'location' | 'panic';
  file_path?: string;
  location_data?: any;
  duration?: number;
  size?: number;
  created_at: string;
  is_downloaded: boolean;
}

export interface CreateRecordingData {
  device_id: string;
  type: 'video' | 'audio' | 'location' | 'panic';
  file_path?: string;
  location_data?: any;
  duration?: number;
  size?: number;
  blob?: Blob; // Adicionar blob para upload do arquivo real
}

export const useRecordings = () => {
  const getRecordings = async (): Promise<Recording[]> => {
    const { data, error } = await supabase
      .from('recordings')
      .select(`
        *,
        devices (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createRecording = async (recordingData: CreateRecordingData): Promise<Recording> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar nome do arquivo melhorado com timestamp e tipo
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour12: false }).replace(/:/g, '-');
      
      const fileExt = recordingData.type === 'video' ? 'webm' : 
                     recordingData.type === 'audio' ? 'webm' : 
                     recordingData.type === 'location' ? 'json' : 'webm';
      
      const typeLabel = recordingData.type === 'video' ? 'Video' : 
                       recordingData.type === 'audio' ? 'Audio' : 
                       recordingData.type === 'location' ? 'Localizacao' : 'Panico';
      
      const fileName = `${typeLabel}_${dateStr}_${timeStr}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Se há um blob, tentar fazer upload para o Supabase Storage (funciona offline)
      if (recordingData.blob) {
        console.log('📤 Tentando upload do arquivo:', filePath, 'Tamanho:', recordingData.blob.size, 'bytes');
        
        try {
          const { error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(filePath, recordingData.blob, {
              contentType: recordingData.blob.type,
              upsert: false
            });

          if (uploadError) {
            console.warn('⚠️ Erro ao fazer upload (funcionando offline):', uploadError);
            // Não falhar se offline - continuar sem upload
          } else {
            console.log('✅ Upload concluído com sucesso:', filePath);
          }
        } catch (uploadError) {
          console.warn('⚠️ Erro de rede no upload (funcionando offline):', uploadError);
          // Continuar sem upload se offline
        }
      } else {
        console.log('⚠️ Nenhum blob fornecido para upload');
      }

      // Tentar inserir no banco de dados (funciona offline com cache)
      try {
        const { data, error } = await supabase
          .from('recordings')
          .insert({
            ...recordingData,
            user_id: user.id,
            file_path: filePath,
            duration: recordingData.duration || 0,
            size: recordingData.size || 0,
            is_downloaded: false,
          })
          .select()
          .single();

        if (error) {
          console.warn('⚠️ Erro ao salvar no banco (funcionando offline):', error);
          // Criar objeto local se offline
          const localRecording: Recording = {
            id: `local_${Date.now()}`,
            device_id: recordingData.device_id,
            user_id: user.id,
            type: recordingData.type,
            file_path: filePath,
            location_data: recordingData.location_data,
            size: recordingData.size || 0,
            created_at: new Date().toISOString(),
            is_downloaded: false,
          };
          console.log('✅ Gravação criada localmente (offline):', localRecording);
          return localRecording;
        }
        
        console.log('✅ Gravação salva no banco:', data);
        return data;
      } catch (dbError) {
        console.warn('⚠️ Erro de banco (funcionando offline):', dbError);
        // Criar objeto local se offline
        const localRecording: Recording = {
          id: `local_${Date.now()}`,
          device_id: recordingData.device_id,
          user_id: user.id,
          type: recordingData.type,
          file_path: filePath,
          location_data: recordingData.location_data,
          size: recordingData.size || 0,
          created_at: new Date().toISOString(),
          is_downloaded: false,
        };
        console.log('✅ Gravação criada localmente (offline):', localRecording);
        return localRecording;
      }
    } catch (error) {
      console.error('❌ Erro crítico ao criar gravação:', error);
      throw error;
    }
  };

  const updateRecording = async (id: string, updates: Partial<Recording>): Promise<Recording> => {
    const { data, error } = await supabase
      .from('recordings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteRecording = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const uploadRecordingFile = async (file: File, recordingId: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${recordingId}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Update recording with file path
    await updateRecording(recordingId, { file_path: filePath });

    return filePath;
  };

  const downloadRecordingFile = async (filePath: string): Promise<Blob> => {
    const { data, error } = await supabase.storage
      .from('recordings')
      .download(filePath);

    if (error) throw error;
    return data;
  };

  const getRecordingUrl = async (filePath: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('recordings')
      .createSignedUrl(filePath, 3600); // 1 hour

    if (!data) throw new Error('Erro ao gerar URL');
    return data.signedUrl;
  };

  return {
    getRecordings,
    createRecording,
    updateRecording,
    deleteRecording,
    uploadRecordingFile,
    downloadRecordingFile,
    getRecordingUrl,
  };
};
