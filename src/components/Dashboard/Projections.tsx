import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type ProjectionData = {
  year: number;
  projectedSavings: number;
  projectedAssets: number;
};

type ProjectionsProps = {
  networth: number;
  monthlySavings: number;
};

export default function Projections({ networth, monthlySavings }: ProjectionsProps) {
  const [roi, setRoi] = useState(10);
  const years = [1, 3, 5, 10, 20, 30];

  const projectionData = useMemo(() => {
    return years.map(year => {
      // Simple linear projection for savings
      const projectedSavings = networth + monthlySavings * 12 * year;

      // Compound interest with monthly contributions
      const roiDecimal = roi / 100;
      const monthlyRoi = roiDecimal / 12;
      const months = year * 12;

      // Future value of current networth
      const futureNetworth = networth * Math.pow(1 + roiDecimal, year);

      // Future value of monthly contributions
      const futureContributions = monthlySavings * 
        ((Math.pow(1 + monthlyRoi, months) - 1) / monthlyRoi);

      const projectedAssets = futureNetworth + futureContributions;

      return {
        year,
        projectedSavings,
        projectedAssets,
      };
    });
  }, [networth, monthlySavings, roi]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Financial Projections</h2>
        
        {/* ROI Input */}
        <div className="mt-4 md:mt-0">
          <label htmlFor="roi" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual ROI (%)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="roi"
              value={roi}
              onChange={(e) => setRoi(Number(e.target.value))}
              step="0.1"
              min="0"
              max="100"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">%</span>
          </div>
        </div>
      </div>

      {/* Projections Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projected Savings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projected Assets
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectionData.map((data) => (
              <tr key={data.year} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(data.projectedSavings)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(data.projectedAssets)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Projections Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={projectionData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="projectedSavings"
              name="Projected Savings"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="projectedAssets"
              name="Projected Assets"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="mt-6 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Projected Savings:</strong> Simple linear projection of current net worth plus monthly savings.
        </p>
        <p>
          <strong>Projected Assets:</strong> Compound growth of current net worth plus future value of monthly contributions, assuming {roi}% annual return.
        </p>
      </div>
    </div>
  );
} 