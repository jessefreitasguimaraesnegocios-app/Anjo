import { supabase } from '@/integrations/supabase';

export interface Device {
  id: string;
  user_id: string;
  name: string;
  type: 'phone' | 'pc' | 'tablet';
  is_third_party: boolean;
  third_party_email?: string;
  records_password?: string;
  recording_time_limit?: number;
  status: 'online' | 'offline';
  last_seen?: string;
  created_at: string;
}

export interface CreateDeviceData {
  name: string;
  type: 'phone' | 'pc' | 'tablet';
  is_third_party?: boolean;
  third_party_email?: string;
  records_password?: string;
  recording_time_limit?: number;
}

export const useDevices = () => {
  const getDevices = async (): Promise<Device[]> => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createDevice = async (deviceData: CreateDeviceData): Promise<Device> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('devices')
      .insert({
        ...deviceData,
        user_id: user.id,
        status: 'offline',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateDevice = async (id: string, updates: Partial<Device>): Promise<Device> => {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteDevice = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const updateDeviceStatus = async (id: string, status: 'online' | 'offline'): Promise<void> => {
    const { error } = await supabase
      .from('devices')
      .update({ 
        status, 
        last_seen: status === 'online' ? new Date().toISOString() : undefined 
      })
      .eq('id', id);

    if (error) throw error;
  };

  return {
    getDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    updateDeviceStatus,
  };
};
