'use client';

import { 
  DollarSign, 
  FileText, 
  User, 
  Music,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'payment' | 'contract' | 'artist' | 'royalty';
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'processing';
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Processed',
    description: 'Monthly royalty payment to John Doe',
    amount: '$2,450.00',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'contract',
    title: 'New Contract Signed',
    description: 'Recording agreement with Sarah Johnson',
    timestamp: '5 hours ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'royalty',
    title: 'Royalty Report Generated',
    description: 'Q3 2024 royalty statements ready',
    timestamp: '1 day ago',
    status: 'completed'
  },
  {
    id: '4',
    type: 'artist',
    title: 'New Artist Onboarded',
    description: 'Mike Smith joined the platform',
    timestamp: '2 days ago',
    status: 'completed'
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment Processing',
    description: 'Processing payment to Emily Brown',
    amount: '$1,890.00',
    timestamp: '3 days ago',
    status: 'processing'
  }
];

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'payment':
      return <DollarSign className="h-5 w-5" />;
    case 'contract':
      return <FileText className="h-5 w-5" />;
    case 'artist':
      return <User className="h-5 w-5" />;
    case 'royalty':
      return <Music className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
}

function getActivityColor(type: ActivityItem['type']) {
  switch (type) {
    case 'payment':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
    case 'contract':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    case 'artist':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
    case 'royalty':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300';
  }
}

function getStatusIcon(status: ActivityItem['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
}

export function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Latest updates from your royalty management system
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(activity.status)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
              {activity.amount && (
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {activity.amount}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          View All Activity →
        </button>
      </div>
    </div>
  );
}