// Dashboard Component with Real Supabase Data
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Music,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

export default function DashboardWithRealData() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    activeContracts: 0,
    totalTracks: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Get royalties
      const { data: royalties, error: royaltiesError } = await supabase
        .from('royalties')
        .select('*')
        .eq('user_id', user.id)

      if (royaltiesError) throw royaltiesError

      // Calculate total earnings (paid)
      const totalEarnings = royalties
        ?.filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0

      // Calculate pending payments
      const pendingPayments = royalties
        ?.filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0

      // Calculate this month's earnings
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      
      const thisMonthEarnings = royalties
        ?.filter(r => {
          const date = new Date(r.date)
          return date.getMonth() === thisMonth && 
                 date.getFullYear() === thisYear &&
                 r.status === 'paid'
        })
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0

      // Calculate last month's earnings
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
      
      const lastMonthEarnings = royalties
        ?.filter(r => {
          const date = new Date(r.date)
          return date.getMonth() === lastMonth && 
                 date.getFullYear() === lastMonthYear &&
                 r.status === 'paid'
        })
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0

      // Get contracts count
      const { count: contractsCount } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Get tracks count
      const { count: tracksCount } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get recent activity (last 10 royalties)
      const { data: recentRoyalties } = await supabase
        .from('royalties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalEarnings,
        pendingPayments,
        activeContracts: contractsCount || 0,
        totalTracks: tracksCount || 0,
        thisMonthEarnings,
        lastMonthEarnings
      })

      setRecentActivity(recentRoyalties || [])
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        Error loading dashboard: {error}
      </div>
    )
  }

  const growthPercentage = stats.lastMonthEarnings > 0
    ? ((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || user?.email}!
        </h2>
        <p className="text-purple-100">
          Here's your royalty overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-xs text-gray-400">All Time</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            ${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-sm text-gray-400">Total Earnings</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-xs text-gray-400">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            ${stats.pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-sm text-gray-400">Pending Payments</p>
        </div>

        {/* Active Contracts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.activeContracts}
          </h3>
          <p className="text-sm text-gray-400">Active Contracts</p>
        </div>

        {/* Total Tracks */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Music className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-xs text-gray-400">Catalog</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.totalTracks}
          </h3>
          <p className="text-sm text-gray-400">Total Tracks</p>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">This Month</p>
            <p className="text-3xl font-bold text-white">
              ${stats.thisMonthEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Growth vs Last Month</p>
            <div className="flex items-center">
              <TrendingUp className={`w-5 h-5 mr-2 ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <p className={`text-3xl font-bold ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No activity yet. Start adding royalties to see them here!
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'paid' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {activity.status === 'paid' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.source}</p>
                    <p className="text-sm text-gray-400">
                      {activity.platform} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${parseFloat(activity.amount).toFixed(2)}
                  </p>
                  <p className={`text-xs ${
                    activity.status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => window.location.href = '#music-studio'}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Music className="w-6 h-6 mb-2" />
          <p className="font-semibold">Add Track</p>
        </button>
        <button
          onClick={() => window.location.href = '#tracking'}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          <TrendingUp className="w-6 h-6 mb-2" />
          <p className="font-semibold">View Analytics</p>
        </button>
        <button
          onClick={() => window.location.href = '#contracts'}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
        >
          <FileText className="w-6 h-6 mb-2" />
          <p className="font-semibold">Manage Contracts</p>
        </button>
      </div>
    </div>
  )
}