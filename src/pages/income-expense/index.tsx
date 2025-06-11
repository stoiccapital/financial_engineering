import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabaseClient';

type IncomeExpense = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  created_at: string;
};

type FormData = {
  year: number;
  month: number;
  income: number;
  expense: number;
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function IncomeExpensePage() {
  const router = useRouter();
  const [records, setRecords] = useState<IncomeExpense[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      income: 0,
      expense: 0,
    },
  });

  useEffect(() => {
    checkUser();
    fetchRecords();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  const fetchRecords = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('income_expense')
        .select('*')
        .eq('user_id', session.user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingId) {
        const { error } = await supabase
          .from('income_expense')
          .update({
            year: formData.year,
            month: formData.month,
            income: formData.income,
            expense: formData.expense,
          })
          .eq('id', editingId)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('income_expense')
          .insert({
            user_id: session.user.id,
            year: formData.year,
            month: formData.month,
            income: formData.income,
            expense: formData.expense,
          });

        if (error) throw error;
      }

      reset();
      setEditingId(null);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleEdit = (record: IncomeExpense) => {
    setEditingId(record.id);
    setValue('year', record.year);
    setValue('month', record.month);
    setValue('income', record.income);
    setValue('expense', record.expense);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('income_expense')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Income & Expense Tracker</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              {...register('year', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              {...register('month', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Income</label>
            <input
              type="number"
              step="0.01"
              {...register('income', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense</label>
            <input
              type="number"
              step="0.01"
              {...register('expense', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingId ? 'Update' : 'Save'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                reset();
                setEditingId(null);
              }}
              className="ml-4 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{months[record.month - 1]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.income.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.expense.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 