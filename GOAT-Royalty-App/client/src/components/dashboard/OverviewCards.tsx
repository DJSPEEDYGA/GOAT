'use client';

import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  CreditCard,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function OverviewCards() {
  const stats = [
    {
      title: 'Total Royalties',
      value: '$124,563',
      change: 12.5,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Artists',
      value: '48',
      change: 8.2,
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: 5.7,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Payments',
      value: '$18,920',
      change: -3.2,
      icon: <CreditCard className="h-6 w-6 text-white" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}