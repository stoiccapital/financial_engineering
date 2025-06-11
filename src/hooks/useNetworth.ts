import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type NetworthEntry = {
  id: string;
  type: 'Asset' | 'Liability';
  category?: string;
  amount: number;
  created_at: string;
};

type NetworthSummary = {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
};

export function useNetworth() {
  const [entries, setEntries] = useState<NetworthEntry[]>([]);
  const [summary, setSummary] = useState<NetworthSummary>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No authenticated user');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('networth_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      calculateSummary(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (entries: NetworthEntry[]) => {
    const totalAssets = entries
      .filter(e => e.type === 'Asset')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalLiabilities = entries
      .filter(e => e.type === 'Liability')
      .reduce((sum, e) => sum + e.amount, 0);

    setSummary({
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    });
  };

  return {
    entries,
    summary,
    loading,
    error,
    refetch: fetchEntries,
  };
} 