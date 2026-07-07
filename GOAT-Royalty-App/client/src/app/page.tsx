'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { RoyaltyChart } from '@/components/charts/RoyaltyChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { IntegrationsHub } from '@/components/integrations/IntegrationsHub';
import { TikTokIntegration } from '@/components/integrations/TikTokIntegration';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">🐐 GOAT Royalty App</h2>
          <p className="text-purple-200">Loading your royalty dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome to GOAT Royalty Management</h1>
          <p className="text-purple-100 text-lg">
            Track, manage, and optimize your royalty earnings across all platforms
          </p>
        </div>

        {/* Overview Cards */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Royalty Chart */}
          <div className="lg:col-span-2">
            <RoyaltyChart />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />

        {/* TikTok Integration */}
        <TikTokIntegration />

        {/* Integrations Hub */}
        <IntegrationsHub />
      </div>
    </DashboardLayout>
  );
}