import { supabase } from '@/integrations/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free_trial' | 'monthly';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at?: string;
  created_at: string;
}

export const useSubscription = () => {
  const getSubscription = async (): Promise<Subscription | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  };

  const updateSubscriptionStatus = async (status: 'active' | 'expired' | 'cancelled'): Promise<Subscription> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const upgradeToMonthly = async (): Promise<Subscription> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_type: 'monthly',
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const isSubscriptionActive = (subscription: Subscription | null): boolean => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    
    if (subscription.expires_at) {
      return new Date(subscription.expires_at) > new Date();
    }
    
    return true;
  };

  const getDaysRemaining = (subscription: Subscription | null): number => {
    if (!subscription || !subscription.expires_at) return 0;
    
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  return {
    getSubscription,
    updateSubscriptionStatus,
    upgradeToMonthly,
    isSubscriptionActive,
    getDaysRemaining,
  };
};
