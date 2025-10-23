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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Gerar nome do arquivo simulado
    const fileExt = recordingData.type === 'video' ? 'mp4' : 
                   recordingData.type === 'audio' ? 'mp3' : 
                   recordingData.type === 'location' ? 'json' : 'mp4';
    const fileName = `${recordingData.type}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase
      .from('recordings')
      .insert({
        ...recordingData,
        user_id: user.id,
        file_path: filePath, // Já criar com file_path para simular arquivo pronto
        duration: recordingData.duration || Math.floor(Math.random() * 300) + 60,
        size: recordingData.size || Math.floor(Math.random() * 50) + 10,
        is_downloaded: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
