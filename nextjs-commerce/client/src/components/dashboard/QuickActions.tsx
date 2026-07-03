'use client';

import { 
  Plus, 
  Upload, 
  Download, 
  Calculator,
  FileText,
  Users,
  DollarSign,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Artist',
    description: 'Onboard a new artist',
    icon: <Users className="h-5 w-5" />,
    href: '/artists/new',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'New Royalty',
    description: 'Add royalty earnings',
    icon: <DollarSign className="h-5 w-5" />,
    href: '/royalties/new',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Process Payment',
    description: 'Send payment to artist',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/payments/new',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Generate Report',
    description: 'Create financial report',
    icon: <FileText className="h-5 w-5" />,
    href: '/reports',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    title: 'Import Data',
    description: 'Upload royalty data',
    icon: <Upload className="h-5 w-5" />,
    href: '/import',
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    title: 'Calculate Earnings',
    description: 'Run royalty calculations',
    icon: <Calculator className="h-5 w-5" />,
    href: '/calculate',
    color: 'bg-pink-500 hover:bg-pink-600'
  }
];

export function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Common tasks and shortcuts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`
              p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105
              ${action.color}
            `}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {action.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium">{action.title}</h4>
                <p className="text-xs opacity-90 mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/settings"
          className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Settings className="h-4 w-4" />
          <span>Advanced Settings</span>
        </Link>
      </div>
    </div>
  );
}

// Fix the missing CreditCard import
import { CreditCard } from 'lucide-react';