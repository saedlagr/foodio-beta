import { supabase } from '@/integrations/supabase/client';

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export const useTokens = () => {
  const getUserTokens = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching tokens:', error);
      return 0;
    }
    
    return data?.tokens || 0;
  };

  const deductTokens = async (userId: string, amount: number, description: string = 'Token usage'): Promise<boolean> => {
    const { data, error } = await supabase.rpc('deduct_tokens', {
      target_user_id: userId,
      token_amount: amount,
      transaction_description: description
    });
    
    if (error) {
      console.error('Error deducting tokens:', error);
      return false;
    }
    
    return data;
  };

  const getTokenTransactions = async (userId: string): Promise<TokenTransaction[]> => {
    const { data, error } = await supabase
      .from('tokens_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data || [];
  };

  return {
    getUserTokens,
    deductTokens,
    getTokenTransactions,
  };
};