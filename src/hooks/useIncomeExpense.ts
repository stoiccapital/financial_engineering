import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type IncomeExpense = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  created_at: string;
};

type IncomeExpenseSummary = {
  averageIncome: number;
  averageExpense: number;
  savings: number;
  savingsRate: number;
};

export function useIncomeExpense() {
  const [records, setRecords] = useState<IncomeExpense[]>([]);
  const [summary, setSummary] = useState<IncomeExpenseSummary>({
    averageIncome: 0,
    averageExpense: 0,
    savings: 0,
    savingsRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No authenticated user');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('income_expense')
        .select('*')
        .eq('user_id', session.user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
      calculateSummary(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (records: IncomeExpense[]) => {
    if (records.length === 0) {
      setSummary({
        averageIncome: 0,
        averageExpense: 0,
        savings: 0,
        savingsRate: 0,
      });
      return;
    }

    const totalIncome = records.reduce((sum, record) => sum + record.income, 0);
    const totalExpense = records.reduce((sum, record) => sum + record.expense, 0);
    const averageIncome = totalIncome / records.length;
    const averageExpense = totalExpense / records.length;
    const savings = averageIncome - averageExpense;
    const savingsRate = averageIncome > 0 ? (savings / averageIncome) * 100 : 0;

    setSummary({
      averageIncome,
      averageExpense,
      savings,
      savingsRate,
    });
  };

  return {
    records,
    summary,
    loading,
    error,
    refetch: fetchRecords,
  };
} 