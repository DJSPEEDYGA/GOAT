'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const monthlyData = [
  { month: 'Jan', royalties: 12000, payments: 8000 },
  { month: 'Feb', royalties: 15000, payments: 12000 },
  { month: 'Mar', royalties: 18000, payments: 14000 },
  { month: 'Apr', royalties: 16000, payments: 13000 },
  { month: 'May', royalties: 22000, payments: 18000 },
  { month: 'Jun', royalties: 25000, payments: 20000 },
];

const platformData = [
  { platform: 'Spotify', amount: 45000 },
  { platform: 'Apple Music', amount: 32000 },
  { platform: 'YouTube', amount: 28000 },
  { platform: 'Amazon', amount: 19563 },
];

export function RoyaltyChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Royalty Analytics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monthly royalties and payment trends
        </p>
      </div>

      {/* Line Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Monthly Trend
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="royalties" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Royalties"
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="payments" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Payments"
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Revenue by Platform
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="platform" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
            <Bar 
              dataKey="amount" 
              fill="#8B5CF6" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}