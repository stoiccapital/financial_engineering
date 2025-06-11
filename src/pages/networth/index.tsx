import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabaseClient';

type NetworthEntry = {
  id: string;
  type: 'Asset' | 'Liability';
  category?: string;
  amount: number;
  created_at: string;
};

type FormData = {
  type: 'Asset' | 'Liability';
  category: string;
  amount: number;
};

type Summary = {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
};

const defaultCategories = {
  Asset: ['Cash', 'Investments', 'Real Estate', 'Vehicles', 'Other Assets'],
  Liability: ['Mortgage', 'Car Loan', 'Credit Cards', 'Student Loans', 'Other Liabilities'],
};

export default function NetworthPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<NetworthEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      type: 'Asset',
      category: '',
      amount: 0,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    checkUser();
    fetchEntries();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  const fetchEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('networth_entries')
        .select('id, type, category, amount, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (entries: NetworthEntry[]): Summary => {
    const totalAssets = entries
      .filter(e => e.type === 'Asset')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalLiabilities = entries
      .filter(e => e.type === 'Liability')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities
    };
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const category = formData.category || null;

      // Add new category to the list if it's new and not empty
      if (category && !categories[formData.type].includes(category)) {
        setCategories(prev => ({
          ...prev,
          [formData.type]: [...prev[formData.type], category],
        }));
      }

      if (editingId) {
        const { error } = await supabase
          .from('networth_entries')
          .update({
            type: formData.type,
            category,
            amount: formData.amount,
          })
          .eq('id', editingId)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('networth_entries')
          .insert({
            user_id: session.user.id,
            type: formData.type,
            category,
            amount: formData.amount,
          });

        if (error) throw error;
      }

      reset();
      setEditingId(null);
      setShowNewCategory(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleEdit = (entry: NetworthEntry) => {
    setEditingId(entry.id);
    setValue('type', entry.type);
    setValue('category', entry.category || '');
    setValue('amount', entry.amount);
    setShowNewCategory(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('networth_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const summary = calculateSummary(entries);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Net Worth Tracker</h1>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Total Assets</h2>
          <p className="text-2xl font-bold text-green-600">${summary.totalAssets.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Total Liabilities</h2>
          <p className="text-2xl font-bold text-red-600">${summary.totalLiabilities.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Net Worth</h2>
          <p className="text-2xl font-bold text-blue-600">${summary.netWorth.toFixed(2)}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              {...register('type', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
            <input
              type="text"
              {...register('category')}
              placeholder="Enter category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingId ? 'Update' : 'Add Entry'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                reset();
                setEditingId(null);
                setShowNewCategory(false);
              }}
              className="ml-4 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Tables */}
      <div className="space-y-8">
        {/* Assets Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Assets</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries
                    .filter(entry => entry.type === 'Asset')
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${entry.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
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

        {/* Liabilities Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Liabilities</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries
                    .filter(entry => entry.type === 'Liability')
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${entry.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
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
      </div>
    </div>
  );
} 